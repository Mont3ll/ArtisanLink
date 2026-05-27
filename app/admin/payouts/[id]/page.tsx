import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { AdminDetailPage } from "@/components/dashboard2/admin/admin-detail-pages";

export default function AdminPayoutDetailPage() {
  return (
    <SourceAdminPreview
      initialRoute="/admin/payouts"
      adminDetailContent={<AdminDetailPage kind="payout" />}
    />
  );
}
