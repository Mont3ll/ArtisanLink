import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/client-dashboard(.*)",
  "/artisan-dashboard(.*)",
  "/admin-dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();
  const { userId, sessionClaims } = await auth();

  // Get role from sessionClaims.publicMetadata
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  // Debug logging
  // console.log("[middleware] userId:", userId, "| role:", role, "| pathname:", url.pathname);

  if (!userId || !isProtectedRoute(req)) {
    return NextResponse.next();
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

  // Default redirect to sign-in if no valid role
  url.pathname = "/sign-in";
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
