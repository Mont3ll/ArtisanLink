import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminUserDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/users"
      adminDetailContent={<AdminDetailPage kind="user" />}
    />
  );
}
