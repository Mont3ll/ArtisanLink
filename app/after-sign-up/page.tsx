import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ROLE_COOKIE_NAME = "artisanlink_signup_role";
const ALLOWED_ROLES = ["client", "artisan"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

/**
 * After Sign-Up redirect page
 *
 * Reads the selected role from the signup cookie, validates it,
 * sets the user's role in Clerk publicMetadata, syncs the user
 * to the database, and redirects to the appropriate dashboard.
 *
 * IMPORTANT: After setting publicMetadata, the current session's JWT
 * won't reflect the change until Clerk refreshes the token (which can
 * take a few seconds). To avoid a blank screen or wrong redirect, we:
 * 1. Set the role in Clerk publicMetadata
 * 2. Create the user in the DB directly (bypassing the sync endpoint)
 * 3. Redirect based on the role we just set (not session claims)
 *
 * The proxy is also updated to handle role-less authenticated users
 * gracefully instead of sending them to /sign-in.
 */
export default async function AfterSignUp() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-up");
  }

  // Read role from cookie (set during sign-up role selection)
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;

  // Validate: only allow "client" or "artisan" — never "admin".
  // If no cookie exists, the user never selected a role during sign-up.
  // Redirect them back to /sign-up so they can choose properly.
  if (!cookieRole || !ALLOWED_ROLES.includes(cookieRole as AllowedRole)) {
    redirect("/sign-up");
  }
  const role: AllowedRole = cookieRole as AllowedRole;

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
  //    This ensures the user exists in the DB with the correct role
  //    before they land on their dashboard.
  try {
    const dbRole = role === "artisan" ? "ARTISAN" : "CLIENT";
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress
        ?? "";
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
