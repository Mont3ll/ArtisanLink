import { redirect } from "next/navigation";

export default function ClientAnalyticsRedir() {
  redirect("/client/dashboard");
}
