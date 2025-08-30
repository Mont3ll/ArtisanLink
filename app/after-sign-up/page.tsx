import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AfterSignUp({ searchParams }: { searchParams: { role?: string } }) {
  const { userId } = await auth();
  const role = searchParams.role || "client";
  
  if (userId) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
  }
  
  // Redirect based on role for ArtisanLink
  if (role === "admin") {
    redirect("/admin-dashboard");
  } else if (role === "artisan") {
    redirect("/artisan-dashboard");
  } else {
    // Default to client dashboard
    redirect("/client-dashboard");
  }
  
  return null;
}
