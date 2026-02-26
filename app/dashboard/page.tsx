import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

/**
 * Generic /dashboard route that redirects users to their role-specific dashboard.
 * 
 * Uses Clerk's session claims to determine role, avoiding database queries
 * that could fail during the auth flow.
 * 
 * - ADMIN -> /admin-dashboard
 * - ARTISAN -> /artisan-dashboard  
 * - CLIENT -> /client-dashboard
 * - Unauthenticated -> /sign-in
 */
export default async function DashboardRedirectPage() {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  // Get role from Clerk's session claims (set during sign-up/sign-in)
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role?.toLowerCase()

  // If no role is set, redirect to after-sign-up to assign one
  if (!role) {
    redirect("/after-sign-up")
  }

  // Redirect based on role
  switch (role) {
    case "admin":
      redirect("/admin-dashboard")
    case "artisan":
      redirect("/artisan-dashboard")
    case "client":
    default:
      // Default to client dashboard
      redirect("/client-dashboard")
  }
}
