"use client";

import { ClipboardList, Images, MessageCircle, Settings, Star, WalletCards } from "lucide-react";

import { SimpleDashboardView } from "@/components/dashboard2/shared/simple-dashboard-view";

export function ArtisanJobsView() {
  return <SimpleDashboardView eyebrow="Job pipeline" title="Jobs" body="Review requests, send quotes, track accepted work, and keep clients updated through completion." actions={[{ label: "New quote flow", href: "/artisan-dashboard/jobs" }]} stats={[{ label: "Requests", value: 0, subtext: "Awaiting review", icon: ClipboardList }, { label: "Active", value: 0, subtext: "In progress", icon: ClipboardList }]} items={[["Requested", "New client requests that need a quote or response."], ["Quoted", "Quotes you have sent and are waiting on."], ["Active work", "Accepted jobs currently in progress."], ["Completed", "Finished jobs ready for review and payout." ]].map(([title, body]) => ({ title, body }))} />;
}

export function ArtisanMessagesView() {
  return <SimpleDashboardView eyebrow="Conversations" title="Messages" body="Keep every client conversation connected to the job, quote, and next action." stats={[{ label: "Unread", value: 0, subtext: "Needs reply", icon: MessageCircle }]} items={[["Client threads", "Reply to scope questions and confirm details."], ["Attachments", "Share photos, measurements, and references."], ["Job context", "Review related job details while messaging." ]].map(([title, body]) => ({ title, body }))} />;
}

export function ArtisanPortfolioView() {
  return <SimpleDashboardView eyebrow="Work samples" title="Portfolio" body="Publish project cards that help clients judge your style, quality, and specialties." actions={[{ label: "Add project", href: "/artisan-dashboard/portfolio/new" }]} stats={[{ label: "Projects", value: 0, subtext: "Published", icon: Images }]} items={[["Featured work", "Highlight your strongest project first."], ["Project details", "Add categories, descriptions, cost, duration, and tags."], ["Visibility", "Hide drafts until they are ready for clients." ]].map(([title, body]) => ({ title, body }))} />;
}

export function ArtisanEarningsView() {
  return <SimpleDashboardView eyebrow="Payments" title="Earnings" body="Track payouts, commission, failed payout states, and payment history from completed jobs." stats={[{ label: "Total earned", value: "KES 0", subtext: "Tracked payouts", icon: WalletCards }, { label: "Commission", value: "10%", subtext: "Current rate", icon: WalletCards }]} items={[["Payout history", "Review payment status and dates."], ["Commission", "Understand marketplace fees before accepting work."], ["Failed payouts", "Resolve issues quickly with support." ]].map(([title, body]) => ({ title, body }))} />;
}

export function ArtisanSubscriptionView() {
  return <SimpleDashboardView eyebrow="Growth" title="Subscription" body="Upgrade for priority search placement, premium badge, lower commission, and a larger portfolio." actions={[{ label: "Upgrade plan", href: "/artisan-dashboard/subscription" }]} stats={[{ label: "Current plan", value: "Free", subtext: "Standard visibility", icon: Star }]} items={[["Priority placement", "Appear higher in relevant search results."], ["Premium badge", "Signal investment and professionalism."], ["Lower commission", "Keep more from every completed job." ]].map(([title, body]) => ({ title, body }))} />;
}

export function ArtisanSettingsView() {
  return <SimpleDashboardView eyebrow="Profile controls" title="Settings" body="Keep your profile, location, services, rates, verification, and notification preferences current." stats={[{ label: "Profile", value: "Live", subtext: "Public visibility", icon: Settings }]} items={[["Personal info", "Update your display name, bio, and contact preferences."], ["Service area", "Set city, county, travel radius, and availability."], ["Verification", "Review submitted documents and approval status." ]].map(([title, body]) => ({ title, body }))} />;
}
