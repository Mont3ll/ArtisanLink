import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminModerationDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/moderation"
      adminDetailContent={<AdminDetailPage kind="moderation" />}
    />
  );
}
