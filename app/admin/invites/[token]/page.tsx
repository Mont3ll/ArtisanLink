import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminInviteDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/invites"
      adminDetailContent={<AdminDetailPage kind="invite" />}
    />
  );
}
