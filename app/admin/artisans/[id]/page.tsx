import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

export default function AdminArtisanDetailPage() {
  return (
    <DashboardRealDataProvider role="admin">
      <SourceAdminPreview
        initialRoute="/admin/artisans"
        adminDetailContent={<AdminDetailPage kind="artisan" />}
      />
    </DashboardRealDataProvider>
  );
}
