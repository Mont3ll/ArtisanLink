import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminReportDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/reports"
      adminDetailContent={<AdminDetailPage kind="report" />}
    />
  );
}
