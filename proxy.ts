import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VERIFIED_ROLE_COOKIE = "artisanlink_verified_role";

const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/client-dashboard(.*)",
  "/artisan-dashboard(.*)",
  "/admin-dashboard(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();
  const { userId, sessionClaims } = await auth();

  // Get role from sessionClaims.publicMetadata
  let role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  // Let transitional auth routes through without role checks.
  // These handle role assignment / resolution and must not be intercepted,
  // otherwise the proxy creates a redirect loop when the JWT hasn't
  // refreshed yet after sign-up.
  if (
    url.pathname === "/after-sign-up" ||
    url.pathname === "/after-sign-in"
  ) {
    return NextResponse.next();
  }

  if (!userId || !isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // If JWT doesn't have a role yet, check the short-lived verified
  // role cookie set by /after-sign-in. This bridges the gap between
  // when publicMetadata is set and when the JWT refreshes.
  if (!role) {
    const verifiedRole = req.cookies.get(VERIFIED_ROLE_COOKIE)?.value;
    if (verifiedRole && ["admin", "artisan", "client"].includes(verifiedRole)) {
      role = verifiedRole;
    }
  }

  // Admin: admin dashboard only
  if (role === "admin") {
    if (!url.pathname.startsWith("/admin-dashboard")) {
      url.pathname = "/admin-dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Artisan: artisan dashboard only
  if (role === "artisan") {
    if (!url.pathname.startsWith("/artisan-dashboard")) {
      url.pathname = "/artisan-dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Client: client dashboard only
  if (role === "client") {
    if (!url.pathname.startsWith("/client-dashboard")) {
      url.pathname = "/client-dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // No valid role in session claims or verified cookie.
  // Send to /after-sign-in which does a direct Clerk API lookup
  // to resolve the role without depending on the JWT.
  // Guard against redirect loops: if the referrer is /after-sign-in,
  // let the request through instead of redirecting back.
  const referer = req.headers.get("referer") || "";
  if (referer.includes("/after-sign-in") || referer.includes("/after-sign-up")) {
    return NextResponse.next();
  }
  url.pathname = "/after-sign-in";
  return NextResponse.redirect(url);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Public routes
    '/sign-in',
    '/sign-up',
    '/api/webhooks(.*)',
  ],
};
