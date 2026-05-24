import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ArtisanOverview } from "@/components/dashboard2/artisan/artisan-overview";

export default async function ArtisanDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <ArtisanOverview />;
}
