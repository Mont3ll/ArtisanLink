"use client";

import { Activity, BarChart3, Database, FileCheck2, Hammer, Mail, MapPinned, Settings, Shield, UserRound } from "lucide-react";

import { SimpleDashboardView } from "@/components/dashboard2/shared/simple-dashboard-view";

const copy = {
  overview: ["Overview", "Monitor marketplace health, pending reviews, active work, user growth, and operational alerts.", Activity],
  verification: ["Verification", "Review artisan identities, certificates, skill evidence, and profile readiness before public visibility.", FileCheck2],
  artisans: ["Artisans", "Manage artisan profiles, verification state, subscription status, and marketplace visibility.", Hammer],
  users: ["Users", "Review client, artisan, and admin accounts with status and safety controls.", UserRound],
  invites: ["Invites", "Create and monitor invite tokens for artisan onboarding and partner campaigns.", Mail],
  moderation: ["Moderation", "Review flagged profiles, messages, portfolio items, and reported job activity.", Shield],
  analytics: ["Analytics", "Understand growth, conversion, search activity, revenue, and operational performance.", BarChart3],
  monitoring: ["Monitoring", "Track API health, payment states, database readiness, and background jobs.", Activity],
  locations: ["Locations", "Manage county and city coverage, artisan density, and local marketplace supply.", MapPinned],
  settings: ["Settings", "Configure platform controls, notifications, verification rules, and operational defaults.", Settings],
} as const;

function AdminView({ id }: { id: keyof typeof copy }) {
  const [title, body, Icon] = copy[id];
  return <SimpleDashboardView eyebrow="Admin console" title={title} body={body} stats={[{ label: "Queue", value: 0, subtext: "Needs attention", icon: Icon }, { label: "Status", value: "Live", subtext: "Operational", icon: Database }]} items={[["Review queue", "Inspect records that need an admin decision."], ["Bulk actions", "Apply safe operational actions after filtering."], ["Audit trail", "Keep a clear trail of changes and decisions." ]].map(([title, body]) => ({ title, body }))} />;
}

export function AdminOverviewView() { return <AdminView id="overview" />; }
export function AdminVerificationView() { return <AdminView id="verification" />; }
export function AdminArtisansView() { return <AdminView id="artisans" />; }
export function AdminUsersView() { return <AdminView id="users" />; }
export function AdminInvitesView() { return <AdminView id="invites" />; }
export function AdminModerationView() { return <AdminView id="moderation" />; }
export function AdminAnalyticsView() { return <AdminView id="analytics" />; }
export function AdminMonitoringView() { return <AdminView id="monitoring" />; }
export function AdminLocationsView() { return <AdminView id="locations" />; }
export function AdminSettingsView() { return <AdminView id="settings" />; }
