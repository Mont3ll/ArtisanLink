import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminMonitoringDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/monitoring"
      adminDetailContent={<AdminDetailPage kind="monitoring" />}
    />
  );
}
