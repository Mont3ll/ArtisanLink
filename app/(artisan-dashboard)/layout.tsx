import { ArtisanDashboardLayout } from "@/components/dashboard2/artisan/artisan-dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArtisanDashboardLayout>{children}</ArtisanDashboardLayout>;
}
