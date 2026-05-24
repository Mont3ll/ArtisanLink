import { AdminDashboardLayout } from "@/components/dashboard2/admin/admin-dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
