import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

export default function ArtisanDashHelp() {
  return (
    <DashboardRealDataProvider role="artisan">
      <SourceAdminPreview initialRoute="/artisan/settings" />
    </DashboardRealDataProvider>
  );
}
