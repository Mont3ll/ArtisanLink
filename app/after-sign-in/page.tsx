import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * After Sign-In redirect page
 *
 * Redirects users to their appropriate dashboard based on their role.
 *
 * First checks Clerk session claims (fastest), then falls back to
 * fetching the user's publicMetadata directly from Clerk (handles
 * the case where the JWT hasn't refreshed yet after a recent sign-up).
 */
export default async function AfterSignIn() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Try session claims first (fastest path)
  let role = (sessionClaims?.publicMetadata as { role?: string })?.role?.toLowerCase();

  // If session claims don't have a role, fetch directly from Clerk
  // This handles the race condition where publicMetadata was set during
  // sign-up but the JWT hasn't been refreshed yet.
  if (!role) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      role = (clerkUser.publicMetadata as { role?: string })?.role?.toLowerCase();
    } catch (error) {
      console.error("Error fetching Clerk user metadata:", error);
    }
  }

  // If still no role, redirect to after-sign-up to assign one
  if (!role) {
    redirect("/after-sign-up");
  }

  // Redirect based on role
  switch (role) {
    case "admin":
      redirect("/admin-dashboard");
    case "artisan":
      redirect("/artisan-dashboard");
    case "client":
      redirect("/client-dashboard");
    default:
      // Unknown role — send to role assignment
      redirect("/after-sign-up");
  }
}
