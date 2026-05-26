import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminArtisanDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/artisans"
      adminDetailContent={<AdminDetailPage kind="artisan" />}
    />
  );
}
