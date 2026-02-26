import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * After Sign-In redirect page
 *
 * Redirects users to their appropriate dashboard based on their role
 * stored in Clerk's session claims. If no role is set (e.g., metadata
 * hasn't propagated yet), redirects to /after-sign-up to assign one.
 */
export default async function AfterSignIn() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get role from Clerk's session claims
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role?.toLowerCase();

  // If no role is set, redirect to after-sign-up to assign one
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
    default:
      redirect("/client-dashboard");
  }
}
