"use client";

import React, { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useUnreadMessages } from "@/lib/hooks/use-unread-messages";
import { useArtisanDashboard } from "@/lib/hooks";
import { useArtisanJobsAdapter } from "@/lib/hooks/use-artisan-jobs-adapter";
import { useArtisanPortfolioAdapter } from "@/lib/hooks/use-artisan-portfolio-adapter";
import { useArtisanEarningsAdapter } from "@/lib/hooks/use-artisan-earnings-adapter";
import { useArtisanSettingsAdapter } from "@/lib/hooks/use-artisan-settings-adapter";
import { useConversationsAdapter } from "@/lib/hooks/use-conversations-adapter";
import { useAdminDataAdapter } from "@/lib/hooks/use-admin-data-adapter";
import { useClientDataAdapter } from "@/lib/hooks/use-client-data-adapter";
import {
  useArtisanSubscription,
  isSubscriptionActive,
} from "@/lib/hooks/use-artisan-subscription";
import type { SubscriptionData } from "@/lib/hooks/use-artisan-subscription";
import type { SourceArtisanJob } from "@/lib/hooks/use-artisan-jobs-adapter";
import type { SourcePortfolioProject } from "@/lib/hooks/use-artisan-portfolio-adapter";
import type { SourceEarningRow } from "@/lib/hooks/use-artisan-earnings-adapter";
import type { SourceConversationThread } from "@/lib/hooks/use-conversations-adapter";
import type {
  SourceVerificationRecord,
  SourceAdminArtisan,
  SourceAdminStats,
  SourceUserRow,
  SourceModerationRow,
  SourceAdminInviteRow,
} from "@/lib/hooks/use-admin-data-adapter";
import type { AdminAnalyticsData } from "@/lib/hooks/use-admin-analytics";
import type { MonitoringData } from "@/lib/hooks/use-admin-monitoring";
import type { SourceClientJob, SourceClientStats } from "@/lib/hooks/use-client-data-adapter";

export type DashboardRole = "artisan" | "client" | "admin";

export interface ArtisanProfileSnapshot {
  bio: string | null;
  profession: string | null;
  county: string | null;
  city: string | null;
  address: string | null;
  hourlyRate: number | null;
  certificateUrl: string | null;
  artisanStatus: string | null;
}

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
  /** Artisan-only: real jobs adapted to source-preview format. null when not artisan/not loaded. */
  artisanJobs: SourceArtisanJob[] | null;
  /** Artisan-only: real portfolio items adapted to source-preview format. */
  artisanPortfolio: SourcePortfolioProject[] | null;
  /** Artisan-only: real earnings rows adapted to source-preview format. */
  artisanEarnings: SourceEarningRow[] | null;
  /** Artisan-only: computed profile completion percentage (0–100). */
  artisanCompletionPct: number | null;
  /** Artisan-only: real profile fields for settings tab display. */
  artisanProfile: ArtisanProfileSnapshot | null;
  /** Conversations for artisan and client roles. null for admin. */
  conversations: SourceConversationThread[] | null;
  /** DB user ID — needed by useSendMessage to identify the sender. */
  currentUserId: string | null;
  /** Admin-only: real verification queue. null when not admin. */
  adminVerificationQueue: SourceVerificationRecord[] | null;
  /** Admin-only: real artisans list. null when not admin. */
  adminArtisans: SourceAdminArtisan[] | null;
  /** Admin-only: dashboard stats. null when not admin. */
  adminStats: SourceAdminStats | null;
  adminUsers: SourceUserRow[] | null;
  adminModerationRows: SourceModerationRow[] | null;
  adminInvites: SourceAdminInviteRow[] | null;
  adminAnalytics: AdminAnalyticsData | null;
  adminMonitoring: MonitoringData | null;
  adminEarningsStats: { totalRevenue: number; totalCommissions: number } | null;
  adminPayoutsStats: { pendingAmount: number; pendingCount: number } | null;
  adminSubscriptionsStats: { activeCount: number; monthlyRevenue: number } | null;
  /** Client-only: real jobs adapted to source-preview format. null when not client/not loaded. */
  clientJobs: SourceClientJob[] | null;
  /** Client-only: overview dashboard stats. null when not client/not loaded. */
  clientStats: SourceClientStats | null;
  /** Artisan-only: current subscription record. null when not artisan or no subscription. */
  artisanSubscription: SubscriptionData | null;
  /** Artisan-only: true when subscription status is ACTIVE. */
  artisanSubscriptionActive: boolean;
  /** Artisan-only: total gross earnings from payouts. null when not artisan/not loaded. */
  artisanTotalEarned: number | null;
  /** Artisan-only: total commission withheld. null when not artisan/not loaded. */
  artisanTotalCommission: number | null;
  /** Artisan-only: total pending payout amount. null when not artisan/not loaded. */
  artisanPendingPayout: number | null;
}

const DashboardRealDataContext = createContext<DashboardRealData | null>(null);

// ─── inner components per role so every hook call is unconditional ───────────

function ArtisanProvider({
  children,
  base,
  dbUserId,
}: {
  children: React.ReactNode;
  base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason" | "artisanJobs" | "artisanPortfolio" | "artisanEarnings" | "artisanCompletionPct" | "artisanProfile" | "conversations" | "currentUserId" | "adminVerificationQueue" | "adminArtisans" | "adminStats" | "adminUsers" | "adminModerationRows" | "adminInvites" | "adminAnalytics" | "adminMonitoring" | "adminEarningsStats" | "adminPayoutsStats" | "adminSubscriptionsStats" | "clientJobs" | "clientStats" | "artisanSubscription" | "artisanSubscriptionActive" | "artisanTotalEarned" | "artisanTotalCommission" | "artisanPendingPayout">;
  dbUserId: string | null;
}) {
  const { data: dashData } = useArtisanDashboard();
  const { jobs } = useArtisanJobsAdapter();
  const { projects } = useArtisanPortfolioAdapter();
  const { earningRows, totalEarned, totalCommission, pendingPayout } = useArtisanEarningsAdapter();
  const { profile, completionPct } = useArtisanSettingsAdapter();
  const { threads } = useConversationsAdapter(dbUserId);
  const { data: subData } = useArtisanSubscription();
  // Call unconditionally so hook count matches NonArtisanProvider
  useAdminDataAdapter();
  // Call unconditionally so hook count matches NonArtisanProvider
  useClientDataAdapter();

  const artisanProfile: ArtisanProfileSnapshot | null = profile
    ? {
        bio: profile.bio,
        profession: profile.profession,
        county: profile.county,
        city: profile.city,
        address: profile.address,
        hourlyRate: profile.hourlyRate,
        certificateUrl: profile.certificateUrl,
        artisanStatus: profile.artisanStatus,
      }
    : null;

  const value: DashboardRealData = {
    ...base,
    verificationStatus: dashData?.profile?.artisanStatus ?? null,
    rejectionReason: dashData?.profile?.rejectionReason ?? null,
    artisanJobs: jobs.length > 0 ? jobs : null,
    artisanPortfolio: projects.length > 0 ? projects : null,
    artisanEarnings: earningRows.length > 0 ? earningRows : null,
    artisanCompletionPct: completionPct,
    artisanProfile,
    conversations: threads.length > 0 ? threads : null,
    currentUserId: dbUserId,
    adminVerificationQueue: null,
    adminArtisans: null,
    adminStats: null,
    adminUsers: null,
    adminModerationRows: null,
    adminInvites: null,
    adminAnalytics: null,
    adminMonitoring: null,
    adminEarningsStats: null,
    adminPayoutsStats: null,
    adminSubscriptionsStats: null,
    clientJobs: null,
    clientStats: null,
    artisanSubscription: subData?.subscription ?? null,
    artisanSubscriptionActive: isSubscriptionActive(subData?.subscription ?? null),
    artisanTotalEarned: typeof totalEarned === "number" ? totalEarned : null,
    artisanTotalCommission: typeof totalCommission === "number" ? totalCommission : null,
    artisanPendingPayout: typeof pendingPayout === "number" ? pendingPayout : null,
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
  role,
  dbUserId,
}: {
  children: React.ReactNode;
  base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason" | "artisanJobs" | "artisanPortfolio" | "artisanEarnings" | "artisanCompletionPct" | "artisanProfile" | "conversations" | "currentUserId" | "adminVerificationQueue" | "adminArtisans" | "adminStats" | "adminUsers" | "adminModerationRows" | "adminInvites" | "adminAnalytics" | "adminMonitoring" | "adminEarningsStats" | "adminPayoutsStats" | "adminSubscriptionsStats" | "clientJobs" | "clientStats" | "artisanSubscription" | "artisanSubscriptionActive" | "artisanTotalEarned" | "artisanTotalCommission" | "artisanPendingPayout">;
  role: DashboardRole;
  dbUserId: string | null;
}) {
  // Call all artisan hooks unconditionally so hook count is stable across role changes.
  useArtisanDashboard();
  useArtisanJobsAdapter();
  useArtisanPortfolioAdapter();
  useArtisanEarningsAdapter();
  useArtisanSettingsAdapter();
  useArtisanSubscription();
  const { threads } = useConversationsAdapter(dbUserId);
  const { verificationQueue, adminArtisans, stats, users: adminUsersList, moderationRows: adminModerationList, adminInvites: adminInvitesList, analytics: adminAnalyticsData, monitoring: adminMonitoringData, earnings: adminEarningsData, payouts: adminPayoutsData, subscriptions: adminSubscriptionsData } = useAdminDataAdapter();
  const { clientJobs: realClientJobs, stats: realClientStats } = useClientDataAdapter();

  const value: DashboardRealData = {
    ...base,
    verificationStatus: null,
    rejectionReason: null,
    artisanJobs: null,
    artisanPortfolio: null,
    artisanEarnings: null,
    artisanCompletionPct: null,
    artisanProfile: null,
    conversations: role === "admin" ? null : (threads.length > 0 ? threads : null),
    currentUserId: role === "admin" ? null : dbUserId,
    adminVerificationQueue: role === "admin" ? (verificationQueue.length > 0 ? verificationQueue : null) : null,
    adminArtisans: role === "admin" ? (adminArtisans.length > 0 ? adminArtisans : null) : null,
    adminStats: role === "admin" ? stats : null,
    adminUsers: role === "admin" ? (adminUsersList.length > 0 ? adminUsersList : null) : null,
    adminModerationRows: role === "admin" ? (adminModerationList.length > 0 ? adminModerationList : null) : null,
    adminInvites: role === "admin" ? (adminInvitesList.length > 0 ? adminInvitesList : null) : null,
    adminAnalytics: role === "admin" ? (adminAnalyticsData ?? null) : null,
    adminMonitoring: role === "admin" ? (adminMonitoringData ?? null) : null,
    adminEarningsStats: role === "admin" && adminEarningsData ? {
      totalRevenue: (adminEarningsData as { statistics?: { totalEarnings?: { amount?: number } } }).statistics?.totalEarnings?.amount ?? 0,
      totalCommissions: (adminEarningsData as { statistics?: { totalCommissions?: { amount?: number } } }).statistics?.totalCommissions?.amount ?? 0,
    } : null,
    adminPayoutsStats: role === "admin" && adminPayoutsData ? {
      pendingAmount: (adminPayoutsData as { statistics?: { pendingAmount?: number } }).statistics?.pendingAmount ?? 0,
      pendingCount: (adminPayoutsData as { statistics?: { pendingCount?: number } }).statistics?.pendingCount ?? 0,
    } : null,
    adminSubscriptionsStats: role === "admin" && adminSubscriptionsData ? {
      activeCount: (adminSubscriptionsData as { metrics?: { totalActive?: number } }).metrics?.totalActive ?? 0,
      monthlyRevenue: (adminSubscriptionsData as { metrics?: { monthlyRevenue?: number } }).metrics?.monthlyRevenue ?? 0,
    } : null,
    clientJobs: role === "client" ? (realClientJobs.length > 0 ? realClientJobs : null) : null,
    clientStats: role === "client" ? realClientStats : null,
    artisanSubscription: null,
    artisanSubscriptionActive: false,
    artisanTotalEarned: null,
    artisanTotalCommission: null,
    artisanPendingPayout: null,
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
 * verification status, and artisan-specific data. Falls back gracefully when
 * APIs are unavailable or the user is unauthenticated.
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

  const base: Omit<DashboardRealData, "verificationStatus" | "rejectionReason" | "artisanJobs" | "artisanPortfolio" | "artisanEarnings" | "artisanCompletionPct" | "artisanProfile" | "conversations" | "currentUserId" | "adminVerificationQueue" | "adminArtisans" | "adminStats" | "adminUsers" | "adminModerationRows" | "adminInvites" | "adminAnalytics" | "adminMonitoring" | "adminEarningsStats" | "adminPayoutsStats" | "adminSubscriptionsStats" | "clientJobs" | "clientStats" | "artisanSubscription" | "artisanSubscriptionActive" | "artisanTotalEarned" | "artisanTotalCommission" | "artisanPendingPayout"> = {
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

  const dbUserId = currentUserData?.user?.id ?? null;

  if (role === "artisan") {
    return <ArtisanProvider base={base} dbUserId={dbUserId}>{children}</ArtisanProvider>;
  }
  return <NonArtisanProvider base={base} role={role} dbUserId={dbUserId}>{children}</NonArtisanProvider>;
}

// ─── consumer hooks ───────────────────────────────────────────────────────────

/**
 * Read real user data from the nearest DashboardRealDataProvider.
 * Throws when called outside a provider — prefer useOptionalDashboardRealData
 * in components that may render both inside and outside the provider.
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

/**
 * Safe variant: returns null when called outside a DashboardRealDataProvider
 * instead of throwing. Use this in components that render in both preview
 * (no provider) and production (with provider) contexts.
 */
export function useOptionalDashboardRealData(): DashboardRealData | null {
  return useContext(DashboardRealDataContext);
}
