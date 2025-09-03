import { AdminLayout } from "@/components/role/role-based-layout"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>
}
