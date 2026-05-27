import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

export default function ClientSourcePageReviews() {
  return (
    <DashboardRealDataProvider role="client">
      <SourceAdminPreview initialRoute="/client/reviews" />
    </DashboardRealDataProvider>
  );
}
