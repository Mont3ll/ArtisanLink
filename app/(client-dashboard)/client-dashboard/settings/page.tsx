import { redirect } from "next/navigation";

export default function ClientSettingsRedir() {
  redirect("/client/dashboard");
}
