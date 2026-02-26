import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ROLE_COOKIE_NAME = "artisanlink_signup_role";
const ALLOWED_ROLES = ["client", "artisan"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function isAllowedRole(value: string | undefined): value is AllowedRole {
  return ALLOWED_ROLES.includes(value as AllowedRole);
}

/**
 * After Sign-Up redirect page
 *
 * Determines the user's role from (in priority order):
 * 1. The signup cookie (set during sign-up role selection)
 * 2. Clerk publicMetadata (if already set from a previous attempt)
 *
 * Then sets Clerk publicMetadata, creates the DB user, and redirects
 * to the correct dashboard.
 *
 * If no role can be determined from any source, redirects to /sign-up.
 */
export default async function AfterSignUp() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-up");
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
  if (!role) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const metaRole = (clerkUser.publicMetadata as { role?: string })?.role;
      if (isAllowedRole(metaRole)) {
        role = metaRole;
      }
    } catch (error) {
      console.error("Error reading Clerk metadata:", error);
    }
  }

  // No role from any source — send to sign-up to choose one
  if (!role) {
    redirect("/sign-up");
  }

  // --- Set role in Clerk + create DB user ---

  // 1. Set publicMetadata in Clerk (source of truth for role)
  let clerkUser;
  try {
    const client = await clerkClient();
    clerkUser = await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
  }

  // 2. Sync user to DB immediately (don't wait for UserSyncProvider)
  try {
    const dbRole = role === "artisan" ? "ARTISAN" : "CLIENT";
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
      const firstName = clerkUser?.firstName ?? "";
      const lastName = clerkUser?.lastName ?? "";
      const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber ?? null;

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
  } catch (error) {
    console.error("Error syncing user to DB:", error);
    // Non-fatal: UserSyncProvider will retry on the dashboard
  }

  // 3. Redirect based on the role we just set (not session claims)
  if (role === "artisan") {
    redirect("/artisan-dashboard");
  }
  redirect("/client-dashboard");
}
