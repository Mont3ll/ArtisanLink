import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import ClientSidebar from "@/components/dashboard/client/client-sidebar";

export default async function ClientDashboardLayout({
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
  
  if (role !== "client") {
    if (role === "artisan") {
      redirect("/artisan-dashboard");
    } else if (role === "admin") {
      redirect("/admin-dashboard");
    } else {
      redirect("/sign-in");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
