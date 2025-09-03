import { ClientLayout } from "@/components/role/role-based-layout"

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>
}
