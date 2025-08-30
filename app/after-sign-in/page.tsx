import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AfterSignIn() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
    return null;
  }
  
  // Get role from sessionClaims.publicMetadata
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
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
