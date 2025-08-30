import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/dashboard/admin/admin-sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
