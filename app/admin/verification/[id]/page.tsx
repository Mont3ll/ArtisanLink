import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminVerificationDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/verification"
      adminDetailContent={<AdminDetailPage kind="verification" />}
    />
  );
}
