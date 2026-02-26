import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ROLE_COOKIE_NAME = "artisanlink_signup_role";
const ALLOWED_ROLES = ["client", "artisan"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

/**
 * After Sign-Up redirect page
 *
 * Reads the selected role from the signup cookie, validates it,
 * sets the user's role in Clerk publicMetadata, cleans up the cookie,
 * and redirects to the appropriate dashboard.
 */
export default async function AfterSignUp() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-up");
  }

  // Read role from cookie (set during sign-up role selection)
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;

  // Validate: only allow "client" or "artisan" — never "admin"
  const role: AllowedRole = ALLOWED_ROLES.includes(cookieRole as AllowedRole)
    ? (cookieRole as AllowedRole)
    : "client";

  // Set publicMetadata server-side (the source of truth for the middleware)
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
  }

  // Clean up the signup role cookie
  cookieStore.delete(ROLE_COOKIE_NAME);

  // Redirect to the correct dashboard
  switch (role) {
    case "artisan":
      redirect("/artisan-dashboard");
    case "client":
    default:
      redirect("/client-dashboard");
  }
}
