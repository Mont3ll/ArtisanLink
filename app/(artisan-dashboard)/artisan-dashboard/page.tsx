import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ArtisanDashboardPageContent from "@/components/dashboard/artisan/artisan-dashboard-page-content";

export default async function ArtisanDashboardPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
    return null;
  }
  
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
  if (role !== "artisan") {
    if (role === "client") {
      redirect("/client-dashboard");
    } else if (role === "admin") {
      redirect("/admin-dashboard");
    } else {
      redirect("/sign-in");
    }
    return null;
  }

  return <ArtisanDashboardPageContent />
}
