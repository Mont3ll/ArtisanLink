import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

export default function AdminDashSettingsPage() {
  return (
    <DashboardRealDataProvider role="admin">
      <SourceAdminPreview initialRoute="/admin/settings" />
    </DashboardRealDataProvider>
  );
}
