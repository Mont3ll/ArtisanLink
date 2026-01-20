import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * After Sign-Up redirect page
 * 
 * Sets the user's role in Clerk metadata and redirects to appropriate dashboard.
 * The role can be passed via query params (e.g., ?role=artisan)
 */
export default async function AfterSignUp({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { userId } = await auth();
  const params = await searchParams;
  const requestedRole = params.role || "client";
  
  if (!userId) {
    redirect("/sign-up");
  }
  
  // Update Clerk metadata with the role
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: requestedRole },
    });
  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
  }
  
  // Redirect based on role
  switch (requestedRole) {
    case "admin":
      redirect("/admin-dashboard");
    case "artisan":
      redirect("/artisan-dashboard");
    case "client":
    default:
      redirect("/client-dashboard");
  }
}
