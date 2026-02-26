import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

/**
 * Generic /dashboard route that redirects users to their role-specific dashboard.
 *
 * Uses Clerk's session claims to determine role. Falls back to /after-sign-in
 * (which does 3-source role resolution: JWT → Clerk API → DB) rather than
 * /after-sign-up (which would create redirect loops).
 */
export default async function DashboardRedirectPage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Get role from Clerk's session claims (set during sign-up/sign-in)
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role?.toLowerCase()

  // Redirect based on role
  switch (role) {
    case "admin":
      redirect("/admin-dashboard")
    case "artisan":
      redirect("/artisan-dashboard")
    case "client":
      redirect("/client-dashboard")
    default:
      // No role in JWT yet — use /after-sign-in which resolves role from
      // multiple sources (Clerk API, DB) and redirects to correct dashboard.
      redirect("/after-sign-in")
  }
}
