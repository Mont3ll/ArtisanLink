import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardPageContent from "@/components/dashboard/admin/admin-dashboard-page-content";

export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
    return null;
  }
  
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
  if (role !== "admin") {
    if (role === "client") {
      redirect("/client-dashboard");
    } else if (role === "artisan") {
      redirect("/artisan-dashboard");
    } else {
      redirect("/sign-in");
    }
    return null;
  }

  return <AdminDashboardPageContent />
}
