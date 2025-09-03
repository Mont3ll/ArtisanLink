import { ArtisanLayout } from "@/components/role/role-based-layout"

export default function ArtisanDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ArtisanLayout>{children}</ArtisanLayout>
}
