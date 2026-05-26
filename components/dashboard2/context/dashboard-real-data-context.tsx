"use client";

import React, { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useUnreadMessages } from "@/lib/hooks/use-unread-messages";
import { useArtisanDashboard } from "@/lib/hooks";

export type DashboardRole = "artisan" | "client" | "admin";

export interface DashboardRealData {
  isLoading: boolean;
  displayName: string | null;
  firstName: string | null;
  avatarUrl: string | null;
  /** DB role: 'ADMIN' | 'ARTISAN' | 'CLIENT' */
  role: string | null;
  unreadCount: number;
  /** Artisan-only. ArtisanProfile.artisanStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | null */
  verificationStatus: string | null;
  rejectionReason: string | null;
}

const DashboardRealDataContext = createContext<DashboardRealData | null>(null);

// ─── inner components per role so every hook call is unconditional ───────────

function ArtisanProvider({
  children,
  base,
}: {
  children: React.ReactNode;
  base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason">;
}) {
  const { data } = useArtisanDashboard();

  const value: DashboardRealData = {
    ...base,
    verificationStatus: data?.profile?.artisanStatus ?? null,
    rejectionReason: data?.profile?.rejectionReason ?? null,
  };

  return (
    <DashboardRealDataContext.Provider value={value}>
      {children}
    </DashboardRealDataContext.Provider>
  );
}

function NonArtisanProvider({
  children,
  base,
}: {
  children: React.ReactNode;
  base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason">;
}) {
  // Still call useArtisanDashboard so hook count is stable across role changes
  // (Next.js does not hot-swap providers; this avoids potential order issues)
  useArtisanDashboard();

  const value: DashboardRealData = {
    ...base,
    verificationStatus: null,
    rejectionReason: null,
  };

  return (
    <DashboardRealDataContext.Provider value={value}>
      {children}
    </DashboardRealDataContext.Provider>
  );
}

// ─── public provider ─────────────────────────────────────────────────────────

/**
 * Wraps a dashboard section to inject real user identity, notification count,
 * and (for artisans) verification status. Falls back gracefully when APIs are
 * unavailable or the user is unauthenticated.
 */
export function DashboardRealDataProvider({
  children,
  role,
}: {
  children: React.ReactNode;
  role: DashboardRole;
}) {
  const { isLoaded, user: clerkUser } = useUser();
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: unreadData } = useUnreadMessages();

  const base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason"> = {
    isLoading: !isLoaded || userLoading,
    displayName: clerkUser
      ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null
      : null,
    firstName: clerkUser?.firstName ?? null,
    avatarUrl:
      (clerkUser?.imageUrl || null) ??
      currentUserData?.profile?.profileImage ??
      null,
    role: currentUserData?.user?.role ?? null,
    unreadCount: unreadData?.total ?? 0,
  };

  if (role === "artisan") {
    return <ArtisanProvider base={base}>{children}</ArtisanProvider>;
  }
  return <NonArtisanProvider base={base}>{children}</NonArtisanProvider>;
}

// ─── consumer hook ────────────────────────────────────────────────────────────

/**
 * Read real user data from the nearest DashboardRealDataProvider.
 * Throws when called outside a provider — use the try/catch pattern in
 * source-admin-preview.tsx for graceful degradation in preview mode.
 */
export function useDashboardRealData(): DashboardRealData {
  const ctx = useContext(DashboardRealDataContext);
  if (ctx === null) {
    throw new Error(
      "useDashboardRealData must be used inside DashboardRealDataProvider",
    );
  }
  return ctx;
}
