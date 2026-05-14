import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ROLE_COOKIE_NAME = "chapaworks_signup_role";
const VERIFIED_ROLE_COOKIE = "chapaworks_verified_role";
const ALLOWED_ROLES = ["client", "artisan"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

// Admin bootstrap: emails in this list auto-get ADMIN role on first sign-up.
// Useful for the first admin to create their account without any special tooling.
const ADMIN_BOOTSTRAP_EMAILS = (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-up", baseUrl));
  }

  // --- Resolve role ---

  // Source 1: signup cookie (most reliable during initial sign-up)
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;

  let role: AllowedRole | undefined;

  if (isAllowedRole(cookieRole)) {
    role = cookieRole;
  }

  // Source 2: Clerk publicMetadata (handles repeat visits / redirects
  // where the cookie may have expired but metadata was already set)
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
    if (signupEmail && ADMIN_BOOTSTRAP_EMAILS.includes(signupEmail)) {
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
        await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            clerkId: userId,
            firstName: firstName || existingByEmail.firstName,
            lastName: lastName || existingByEmail.lastName,
            phone: phone ?? existingByEmail.phone,
            status: "ACTIVE",
            emailVerifiedAt: new Date(),
            // Preserve ADMIN role if seeded as admin
            role: existingByEmail.role === "ADMIN" || dbRole === "ADMIN" ? "ADMIN" : dbRole,
          },
        });
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
