import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminSubscriptionDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/subscriptions"
      adminDetailContent={<AdminDetailPage kind="subscription" />}
    />
  );
}
