import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminSearchDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/search"
      adminDetailContent={<AdminDetailPage kind="search" />}
    />
  );
}
