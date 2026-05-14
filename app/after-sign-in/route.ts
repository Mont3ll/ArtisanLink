import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VERIFIED_ROLE_COOKIE = "chapaworks_verified_role";

/**
 * After Sign-In route handler
 *
 * Redirects users to their appropriate dashboard based on their role.
 *
 * Resolves the role from (in priority order):
 * 1. Clerk session claims (fastest — JWT already has the role)
 * 2. Clerk API getUser() (handles JWT propagation delay after sign-up)
 * 3. Database lookup (last resort — handles edge cases where Clerk
 *    metadata update succeeded but the API call here races)
 *
 * Sets a short-lived cookie so the proxy can trust the redirect
 * even before the JWT refreshes with the new role.
 *
 * IMPORTANT: Never redirects to /after-sign-up — that creates an
 * infinite loop because /after-sign-up redirects back here.
 */
export async function GET(req: Request) {
  const { userId, sessionClaims } = await auth();
  const baseUrl = new URL(req.url).origin;

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", baseUrl));
  }

  // Source 1: session claims (fastest path)
  let role = (sessionClaims?.publicMetadata as { role?: string })?.role?.toLowerCase();

  // Source 2: Clerk API (handles JWT propagation delay)
  if (!role) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      role = (clerkUser.publicMetadata as { role?: string })?.role?.toLowerCase();
    } catch (error) {
      console.error("Error fetching Clerk user metadata:", error);
    }
  }

  // Source 3: Database (last resort — role was set during /after-sign-up)
  if (!role) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
      });
      if (dbUser?.role) {
        role = dbUser.role.toLowerCase();
      }
    } catch (error) {
      console.error("Error fetching user from DB:", error);
    }
  }

  // If still no role after all sources, redirect to sign-in.
  // Do NOT redirect to /after-sign-up — that creates an infinite loop.
  if (!role) {
    return NextResponse.redirect(new URL("/sign-in", baseUrl));
  }

  // Determine the dashboard URL based on role
  let dashboardPath: string;
  switch (role) {
    case "admin":
      dashboardPath = "/admin-dashboard";
      break;
    case "artisan":
      dashboardPath = "/artisan-dashboard";
      break;
    case "client":
      dashboardPath = "/client-dashboard";
      break;
    default:
      return NextResponse.redirect(new URL("/sign-in", baseUrl));
  }

  // Create the redirect response and set the verified-role cookie
  // so the proxy trusts this redirect during the JWT propagation window.
  const response = NextResponse.redirect(new URL(dashboardPath, baseUrl));
  response.cookies.set(VERIFIED_ROLE_COOKIE, role, {
    path: "/",
    maxAge: 120, // 2 minutes — enough for Clerk SDK to refresh the JWT
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
