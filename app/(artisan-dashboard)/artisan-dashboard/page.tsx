import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ArtisanDashboardPageContent from "@/components/dashboard/artisan/artisan-dashboard-page-content";

/**
 * Artisan dashboard page.
 *
 * Role authorization is handled by the proxy (server-side) and
 * RouteGuard (client-side). This page only checks authentication.
 * We intentionally do NOT check sessionClaims for role here because
 * the JWT may not have propagated yet after sign-up, which would
 * cause a silent redirect and blank content area.
 */
export default async function ArtisanDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
    return null;
  }

  return <ArtisanDashboardPageContent />;
}
