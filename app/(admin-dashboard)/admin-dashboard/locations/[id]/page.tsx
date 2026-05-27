import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminLocationDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/locations"
      adminDetailContent={<AdminDetailPage kind="location" />}
    />
  );
}
