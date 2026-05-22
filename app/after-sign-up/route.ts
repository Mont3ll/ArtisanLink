import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ROLE_COOKIE_NAME = "chapaworks_signup_role";
const VERIFIED_ROLE_COOKIE = "chapaworks_verified_role";
const ALLOWED_ROLES = ["client", "artisan"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

// Admin bootstrap: read dynamically at runtime so tests can set process.env
function getAdminBootstrapEmails(): string[] {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedRole(value: string | undefined): value is AllowedRole {
  return ALLOWED_ROLES.includes(value as AllowedRole);
}

/**
 * After Sign-Up route handler
 *
 * Determines the user's role from (in priority order):
 * 1. The signup cookie (set during sign-up role selection)
 * 2. Clerk publicMetadata (if already set from a previous attempt)
 *
 * Then sets Clerk publicMetadata, creates the DB user, and redirects
 * to /after-sign-in (which resolves the role and sends to the dashboard).
 *
 * If no role can be determined from any source, redirects to /sign-up.
 */
export async function GET(req: Request) {
  const { userId } = await auth();
  const baseUrl = new URL(req.url).origin;
  const url = new URL(req.url);

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-up", baseUrl));
  }

  // --- Resolve role (in priority order) ---

  // URL params are NOT available from Clerk Elements redirect (afterSignUpUrl not supported)
  // Keeping URL param reading as future-proofing but primary mechanism is cookies.
  const urlRoleParam = url.searchParams.get("role");
  const urlInviteToken = url.searchParams.get("invite");

  // Read cookies — all role/invite signals are stored here by the sign-up page
  const cookieStore = await cookies();
  const cookieInviteToken = cookieStore.get("chapaworks_invite_token")?.value;
  const inviteToken = urlInviteToken || cookieInviteToken;

  let role: AllowedRole | undefined;

  // Source 1: URL role param (future-proofing)
  if (isAllowedRole(urlRoleParam ?? undefined)) {
    role = urlRoleParam as AllowedRole;
  }

  // Source 2: Role cookie (set by sign-up page, fixed by Suspense boundary)
  if (!role) {
    const cookieRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;
    if (isAllowedRole(cookieRole)) {
      role = cookieRole;
    }
  }

  // Source 3: Clerk publicMetadata (handles repeat visits)
  let clerkUserData;
  if (!role) {
    try {
      const client = await clerkClient();
      clerkUserData = await client.users.getUser(userId);
      const metaRole = (clerkUserData.publicMetadata as { role?: string })?.role;
      if (isAllowedRole(metaRole)) {
        role = metaRole;
      }
    } catch (error) {
      console.error("Error reading Clerk metadata:", error);
    }
  }

  // Source 4: Invite token validation — if invite token in URL is valid, force artisan
  // This is the authoritative override for invite-based sign-ups.
  if (inviteToken && role !== 'artisan') {
    try {
      const invite = await prisma.artisanInvite.findUnique({
        where: { token: inviteToken },
        select: { status: true, expiresAt: true },
      });
      if (invite && invite.status === 'PENDING' && invite.expiresAt > new Date()) {
        role = 'artisan';
        console.log(`[INVITE] Valid invite token — forcing artisan role for ${userId}`);
      }
    } catch (err) {
      console.error("Error validating invite token in after-sign-up:", err);
    }
  }

  // Source 3: Admin bootstrap — if the email is in ADMIN_BOOTSTRAP_EMAILS,
  // auto-assign admin role regardless of cookie/metadata.
  // This enables the first admin to sign up without any special tooling.
  let isAdminBootstrap = false;
  try {
    const client = await clerkClient();
    if (!clerkUserData) {
      clerkUserData = await client.users.getUser(userId);
    }
    const signupEmail = clerkUserData?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "";
    if (signupEmail && getAdminBootstrapEmails().includes(signupEmail)) {
      isAdminBootstrap = true;
      // Override role — admin emails always become admin
      await client.users.updateUserMetadata(userId, { publicMetadata: { role: "admin" } });
      console.log(`[ADMIN BOOTSTRAP] Auto-promoted ${signupEmail} to admin on sign-up`);
    }
  } catch (error) {
    console.error("Error in admin bootstrap check:", error);
  }

  // No role from any source (and not admin bootstrap) — send to sign-up
  if (!role && !isAdminBootstrap) {
    return NextResponse.redirect(new URL("/sign-up", baseUrl));
  }

  // --- Set role in Clerk + create DB user ---

  // 1. Set publicMetadata in Clerk (source of truth for role) — skip if admin bootstrap already set it
  let clerkUser;
  try {
    const client = await clerkClient();
    if (!isAdminBootstrap) {
      clerkUser = await client.users.updateUserMetadata(userId, {
        publicMetadata: { role },
      });
    } else {
      clerkUser = await client.users.getUser(userId);
    }
  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
  }

  // 2. Sync user to DB immediately (don't wait for UserSyncProvider)
  try {
    const dbRole = isAdminBootstrap ? "ADMIN" : (role === "artisan" ? "ARTISAN" : "CLIENT");
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
    const firstName = clerkUser?.firstName ?? "";
    const lastName = clerkUser?.lastName ?? "";
    const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber ?? null;

    // Check if already linked by clerkId
    const existingByClerkId = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!existingByClerkId) {
      // Check if a seeded user exists with this email (e.g. admin bootstrap)
      // If so, link the Clerk ID to that existing DB user instead of creating a new one.
      const existingByEmail = email ? await prisma.user.findUnique({ where: { email } }) : null;

      if (existingByEmail) {
        // Link the real Clerk ID to the seeded user record
        const linkedRole = existingByEmail.role === "ADMIN" || dbRole === "ADMIN" ? "ADMIN" : dbRole;
        await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            clerkId: userId,
            firstName: firstName || existingByEmail.firstName,
            lastName: lastName || existingByEmail.lastName,
            phone: phone ?? existingByEmail.phone,
            status: "ACTIVE",
            emailVerifiedAt: new Date(),
            role: linkedRole,
          },
        });
        // Ensure profile exists for artisan accounts (seeded user might lack one)
        const existingProfile = await prisma.profile.findUnique({ where: { userId: existingByEmail.id } });
        if (!existingProfile && linkedRole === "ARTISAN") {
          await prisma.profile.create({
            data: {
              userId: existingByEmail.id,
              country: "Kenya",
              artisanStatus: "PENDING",
              isAvailable: false,
            },
          });
          console.log(`[SYNC] Created missing profile for linked artisan ${existingByEmail.id}`);
        }
        console.log(`[SYNC] Linked Clerk user ${userId} to existing DB user ${existingByEmail.id} (${email})`);
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            firstName,
            lastName,
            phone,
            role: dbRole,
            status: "ACTIVE",
            emailVerifiedAt: new Date(),
            profile: {
              create: {
                bio: null,
                country: "Kenya",
                ...(dbRole === "ARTISAN" && {
                  artisanStatus: "PENDING",
                  isAvailable: false,
                }),
              },
            },
          },
        });
      }
    }
  } catch (error) {
    console.error("Error syncing user to DB:", error);
    // Non-fatal: UserSyncProvider will retry on the dashboard
  }

  // Mark invite as accepted if a valid invite token was used
  if (inviteToken && role === 'artisan') {
    try {
      await prisma.artisanInvite.updateMany({
        where: { token: inviteToken, status: 'PENDING' },
        data: { status: 'ACCEPTED', usedAt: new Date() },
      });
      console.log(`[INVITE] Marked invite ${urlInviteToken} as ACCEPTED`);
    } catch (err) {
      console.error("Error marking invite as accepted:", err);
    }
  }

  // 3. Redirect to /after-sign-in which resolves the role from
  //    Clerk API directly (bypasses the JWT propagation delay).
  //    Set the verified-role cookie so the proxy trusts the redirect chain.
  const response = NextResponse.redirect(new URL("/after-sign-in", baseUrl));
  response.cookies.set(VERIFIED_ROLE_COOKIE, isAdminBootstrap ? "admin" : (role ?? "client"), {
    path: "/",
    maxAge: 120, // 2 minutes — enough for Clerk SDK to refresh the JWT
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
