"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  FileCheck2,
  Flag,
  Hammer,
  Images,
  MapPinned,
  Search,
  ServerCog,
  Shield,
  UserRound,
  X,
} from "lucide-react";

import { ArtisanVerificationReviewModal } from "./artisan-verification-review-modal";
import { StatusChip } from "@/components/ui2";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminDetailKind =
  | "verification"
  | "artisan"
  | "user"
  | "invite"
  | "moderation"
  | "monitoring"
  | "location"
  | "payout"
  | "subscription"
  | "report"
  | "database"
  | "search";

type DetailStatus = "PENDING" | "VERIFIED" | "ACTIVE" | "REVIEW" | "COMPLETED" | "QUOTED";

type ActionEvent = { action: string; note: string; time: string; outcome: string };

type AdminPortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  isPublic: boolean;
  images: string[];
  hasImage?: boolean;
};

type ArtisanData = {
  id: string;
  name: string;
  email: string;
  profession: string | null;
  location: { city: string | null; county: string | null };
  isAvailable: boolean;
  verificationStatus: string;
  rating: { average: number; total: number };
  portfolioCount: number;
  documents: string[];
  idDocumentUrl: string | null;
  certificateUrl: string | null;
  isPremium: boolean;
  memberSince: string;
};

// ─── Config ────────────────────────────────────────────────────────────────────

type DetailConfig = {
  eyebrow: string;
  title: string;
  icon: typeof FileCheck2;
  backHref: string;
  status: DetailStatus;
  sections: Array<[string, string]>;
  actions: string[];
  needsWholePage: boolean;
  stats: Array<[string, string, string]>;
};

const detailConfig: Record<AdminDetailKind, DetailConfig> = {
  verification: { eyebrow: "Admin · Verification detail", title: "Verification review", icon: FileCheck2, backHref: "/admin/verification", status: "REVIEW", needsWholePage: true, actions: ["Approve and verify", "Request more information", "Reject submission", "Escalate review"], stats: [["Risk", "Medium", "2 duplicate signals"], ["Documents", "4/5", "ID check pending"], ["SLA", "3h", "Before escalation"]], sections: [["Submitted documents", "National ID, trade evidence, portfolio proof, duplicate-account scan, and reviewer checklist."], ["Decision workflow", "Verification records need a full page because reviewers need evidence, notes, checks, and audit history visible together."], ["Audit timeline", "Every decision requires a reason and immutable admin event before changing public visibility."]] },
  artisan: { eyebrow: "Admin · Artisan detail", title: "Profile controls & risk summary", icon: Hammer, backHref: "/admin/artisans", status: "VERIFIED", needsWholePage: true, actions: ["Update visibility", "Inspect portfolio", "Review verification", "Open moderation history"], stats: [["Verification", "—", "Loading…"], ["Visibility", "—", "Loading…"], ["Portfolio", "—", "Loading…"]], sections: [["Profile quality", "Bio, profession, rate, service area, badges, availability, and public search readiness."], ["Marketplace performance", "Jobs, quotes, reviews, response time, subscription state, and ranking signals."], ["Trust controls", "Verification evidence, reports, restrictions, and audit history."]] },
  user: { eyebrow: "Admin · User detail", title: "User account controls", icon: UserRound, backHref: "/admin/users", status: "ACTIVE", needsWholePage: true, actions: ["Message user", "Review activity", "Restrict account", "Export audit"], stats: [["Role", "Client", "Primary account"], ["Activity", "31", "Events logged"], ["Risk", "Low", "No flags"]], sections: [["Account identity", "Email, role, sign-in state, profile linkage, and risk status."], ["Marketplace records", "Jobs, conversations, reports, reviews, saved artisans, and support tickets."], ["Trust controls", "Restrictions, suspension state, reported behavior, and audit notes."]] },
  invite: { eyebrow: "Admin · Invite detail", title: "Invite token management", icon: BadgeCheck, backHref: "/admin/invites", status: "PENDING", needsWholePage: false, actions: ["Resend invite", "Revoke token", "Copy invite", "Export batch"], stats: [["Role", "Artisan", "Locked"], ["Expires", "48h", "Auto reminder"], ["Resends", "1", "Below cap"]], sections: [["Invite token", "Role lock, expiry, resend state, acceptance timeline, and revocation."], ["Onboarding path", "Target role, applicant status, completion state, and reminders."], ["Recommendation", "A modal is usually sufficient, but token audit/history can justify this page."]] },
  moderation: { eyebrow: "Admin · Moderation detail", title: "Moderation case review", icon: Shield, backHref: "/admin/moderation", status: "REVIEW", needsWholePage: true, actions: ["Resolve case", "Request context", "Escalate enforcement", "Dismiss report"], stats: [["Severity", "High", "Safety queue"], ["Evidence", "6", "Items attached"], ["Owner", "Trust", "Active"]], sections: [["Reported content", "Target record, source, reporter, severity, and evidence context."], ["Decision options", "Resolve, request context, escalate enforcement, or dismiss with audit reason."], ["Safety audit", "Enforcement actions need full-page evidence and history to avoid accidental decisions."]] },
  monitoring: { eyebrow: "Admin · Service detail", title: "System service inspection", icon: ServerCog, backHref: "/admin/monitoring", status: "ACTIVE", needsWholePage: true, actions: ["Open incident", "Annotate event", "Assign owner", "View runbook"], stats: [["Uptime", "99.96%", "30d window"], ["Latency", "142ms", "p95"], ["Errors", "4", "Last hour"]], sections: [["Service health", "Latency, uptime, queue state, worker health, and error budget."], ["Operational logs", "Recent events, deploys, retries, incidents, and rollbacks."], ["Incident response", "Service details need a page when logs, metrics, and runbooks are required."]] },
  location: { eyebrow: "Admin · Location detail", title: "Location index review", icon: MapPinned, backHref: "/admin/locations", status: "ACTIVE", needsWholePage: true, actions: ["Refresh index", "Update aliases", "Inspect map", "Export coverage"], stats: [["Coverage", "84%", "Serviceable"], ["Artisans", "128", "In radius"], ["Freshness", "2h", "Index age"]], sections: [["Coverage map", "County, city, aliases, service radius, and coordinate freshness."], ["Supply density", "Available artisans, premium artisans, demand clusters, and gaps."], ["Search indexing", "Location details need a page when map/index operations are involved."]] },
  payout: { eyebrow: "Admin · Payout detail", title: "Payout review", icon: CheckCircle2, backHref: "/admin/payouts", status: "PENDING", needsWholePage: true, actions: ["Retry payout", "Cancel payout", "Mark complete", "Add finance note"], stats: [["Amount", "KES 18K", "Pending"], ["Retries", "1", "Provider"], ["Queue", "Finance", "Manual review"]], sections: [["Payout state", "Artisan identity, phone, amount, provider status, retry count, and failure reason."], ["Finance review", "Payout records should have a full page because money movement needs notes and audit history."], ["Provider events", "Callback, timeout, manual completion, and reconciliation timeline."]] },
  subscription: { eyebrow: "Admin · Subscription detail", title: "Subscription review", icon: BadgeCheck, backHref: "/admin/subscriptions", status: "ACTIVE", needsWholePage: false, actions: ["Review plan", "Retry payment", "Pause benefits", "Open artisan"], stats: [["Plan", "Pro", "Active"], ["MRR", "KES 1.2K", "Monthly"], ["Renewal", "12d", "Auto"]], sections: [["Plan state", "Current plan, renewal date, payment status, premium benefits, and commission tier."], ["Recommendation", "A modal can be enough unless billing/payment history is deep."], ["Related records", "Artisan profile, subscription payments, invoices, and benefit changes."]] },
  report: { eyebrow: "Admin · Report detail", title: "Generated report", icon: Activity, backHref: "/admin/reports", status: "COMPLETED", needsWholePage: false, actions: ["Download CSV", "Regenerate", "Share report", "Archive"], stats: [["Rows", "2,418", "Exported"], ["Format", "CSV", "Ready"], ["Access", "Admin", "Scoped"]], sections: [["Report output", "Type, generated time, record count, filters, and export format."], ["Recommendation", "Reports can usually remain modal/download flows unless previews become complex."], ["Audit", "Generated by, access level, and export history."]] },
  database: { eyebrow: "Admin · Database detail", title: "Database table inspection", icon: Database, backHref: "/admin/database", status: "ACTIVE", needsWholePage: true, actions: ["Refresh stats", "Inspect indexes", "Run consistency check", "Open logs"], stats: [["Rows", "48K", "Healthy"], ["Indexes", "12", "1 stale"], ["Latency", "18ms", "Query p50"]], sections: [["Table health", "Rows, indexes, growth, latency, and storage pressure."], ["Operational risk", "Database records need full pages for table metrics, consistency, and maintenance notes."], ["Maintenance history", "Recent migrations, backup state, and index actions."]] },
  search: { eyebrow: "Admin · Search result detail", title: "Search result inspection", icon: Search, backHref: "/admin/search", status: "ACTIVE", needsWholePage: false, actions: ["Open source record", "Pin result", "Export match", "Audit query"], stats: [["Rank", "#3", "Matched"], ["Score", "0.91", "High"], ["Entity", "Mixed", "Routed"]], sections: [["Result context", "Matched entity, rank, query, status, and related records."], ["Recommendation", "Search details should usually route to the underlying entity page instead of a standalone page."], ["Audit", "Query history and admin action context."]] },
};

const heroCopy: Record<AdminDetailKind, { label: string; body: string; surface: string; accent: string }> = {
  verification: { label: "Evidence review queue", body: "Review identity, trade proof, duplicate signals, and decision requirements before changing public verification state.", surface: "#fffbeb", accent: "#f59e0b" },
  artisan: { label: "Actionable artisan controls", body: "Use this page to make the next admin decision: visibility, verification evidence, portfolio quality, or moderation follow-up.", surface: COLORS.primaryTint, accent: COLORS.primary },
  user: { label: "Account and activity control", body: "Review user identity, marketplace activity, linked records, support context, and account-level restrictions.", surface: "#eff6ff", accent: "#2563eb" },
  invite: { label: "Onboarding token workflow", body: "Manage role-locked invite state, reminders, expiry, revocation, and acceptance trail without leaving the admin shell.", surface: "#faf5ff", accent: "#9333ea" },
  moderation: { label: "Safety case workspace", body: "Inspect reported content, evidence, target context, severity, and staged enforcement actions in one safety-focused view.", surface: "#fff1f2", accent: "#e11d48" },
  monitoring: { label: "Operational service console", body: "Review health, recent incidents, ownership, annotations, and runbook actions for this service.", surface: "#f0f9ff", accent: "#0284c7" },
  location: { label: "Coverage and index review", body: "Validate service-area coverage, aliases, map freshness, demand clusters, and location search readiness.", surface: "#f0fdf4", accent: "#16a34a" },
  payout: { label: "Finance operation review", body: "Handle payout retries, provider state, manual completion, cancellation, and finance notes with a clear audit trail.", surface: "#fff7ed", accent: "#ea580c" },
  subscription: { label: "Plan and benefits review", body: "Inspect plan status, renewals, payment retry context, premium benefits, and linked artisan records.", surface: "#f5f3ff", accent: "#7c3aed" },
  report: { label: "Report output workspace", body: "Regenerate, share, archive, and export generated report output while recording admin access history.", surface: "#f8fafc", accent: "#475569" },
  database: { label: "Table health inspection", body: "Review rows, indexes, consistency checks, latency, migration context, and operational database history.", surface: "#f8fafc", accent: "#334155" },
  search: { label: "Search result inspection", body: "Inspect result ranking, source entity, query audit context, pinned state, and exportable match metadata.", surface: "#eef2ff", accent: "#4f46e5" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function titleize(raw: string) {
  return decodeURIComponent(raw).replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdminDetailPage({ kind }: { kind: AdminDetailKind }) {
  const params = useParams<Record<string, string>>();
  const id = Object.values(params)[0] ?? "record";
  const config = detailConfig[kind];
  const hero = heroCopy[kind];
  const Icon = config.icon;

  // ── Artisan-specific real data ──
  const [artisanData, setArtisanData] = useState<ArtisanData | null>(null);
  const [artisanLoading, setArtisanLoading] = useState(kind === "artisan");

  // ── Portfolio ──
  const [portfolioItems, setPortfolioItems] = useState<AdminPortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(kind === "artisan");
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [portfolioLightbox, setPortfolioLightbox] = useState<{ src: string; title: string } | null>(null);

  // ── Modals ──
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  // ── Action modal (generic) ──
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ── Timeline ──
  const [events, setEvents] = useState<ActionEvent[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // ── Fetch artisan data ──
  useEffect(() => {
    if (kind !== "artisan") return;
    let cancelled = false;
    void fetch(`/api/admin/artisans/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load artisan");
        return r.json() as Promise<{ artisan: ArtisanData }>;
      })
      .then((data) => { if (!cancelled) { setArtisanData(data.artisan); setArtisanLoading(false); } })
      .catch(() => { if (!cancelled) setArtisanLoading(false); });
    return () => { cancelled = true; };
  }, [id, kind]);

  // ── Fetch portfolio ──
  useEffect(() => {
    if (kind !== "artisan") return;
    let cancelled = false;
    void fetch(`/api/admin/artisans/${encodeURIComponent(id)}/portfolio`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Portfolio could not be loaded");
        return r.json() as Promise<{ portfolio?: AdminPortfolioItem[] }>;
      })
      .then((data) => { if (!cancelled) setPortfolioItems(data.portfolio ?? []); })
      .catch((e: Error) => { if (!cancelled) setPortfolioError(e.message); })
      .finally(() => { if (!cancelled) setPortfolioLoading(false); });
    return () => { cancelled = true; };
  }, [id, kind]);

  const portfolioImages = portfolioItems.flatMap((item) =>
    item.images.map((src) => ({ src, item })),
  );

  // ── Derived artisan stats ──
  const artisanStats: Array<[string, string, string]> =
    kind === "artisan" && artisanData
      ? [
          ["Verification", artisanData.verificationStatus, artisanData.verificationStatus === "VERIFIED" ? "Public badge active" : "Pending review"],
          ["Availability", artisanData.isAvailable ? "Available" : "Unavailable", artisanData.isAvailable ? "Accepting requests" : "Not accepting work"],
          ["Portfolio", String(artisanData.portfolioCount), `${artisanData.portfolioCount} item${artisanData.portfolioCount === 1 ? "" : "s"} uploaded`],
        ]
      : config.stats;

  const recordLabel = kind === "artisan" && artisanData ? artisanData.name : titleize(id);

  const seededTimeline = useMemo(
    () => [
      ["Record opened", "Admin workspace loaded for this artisan."],
      ["Awaiting action", "No mutation has been committed yet."],
    ],
    [],
  );

  // ── Helpers ──
  const addEvent = (action: string, outcome: string, note?: string) => {
    setEvents((prev) => [
      { action, outcome, note: note?.trim() || "No note supplied.", time: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) },
      ...prev,
    ]);
    setToast(outcome);
    window.setTimeout(() => setToast(null), 2800);
  };

  const closeAction = () => {
    setActiveAction(null);
    setActionNote("");
    setSecondaryValue("");
    setActionError(null);
  };

  // ── Run action ──
  const runAction = async () => {
    if (!activeAction) return;
    const lower = activeAction.toLowerCase();
    const safeId = id.replace(/[^a-z0-9-]/gi, "-").toLowerCase();

    // Visibility → real PATCH
    if (kind === "artisan" && lower.includes("update visibility")) {
      setActionSubmitting(true);
      setActionError(null);
      try {
        const isAvailable = (secondaryValue || "Available") === "Available";
        const response = await fetch(`/api/admin/artisans/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? "Update failed");
        }
        setArtisanData((prev) => prev ? { ...prev, isAvailable } : prev);
        addEvent("Update visibility", `Availability set to ${isAvailable ? "Available" : "Unavailable"}`, actionNote || "Marketplace visibility updated.");
        closeAction();
      } catch (e: unknown) {
        setActionError(e instanceof Error ? e.message : "Update failed");
      } finally {
        setActionSubmitting(false);
      }
      return;
    }

    // Inspect portfolio → open lightbox (first image)
    if (kind === "artisan" && lower.includes("inspect portfolio")) {
      addEvent("Inspect portfolio", `Portfolio reviewed — ${portfolioImages.length} image${portfolioImages.length === 1 ? "" : "s"} loaded`, actionNote);
      closeAction();
      return;
    }

    // Review verification → open inline modal (not a redirect)
    if (kind === "artisan" && lower.includes("review verification")) {
      closeAction();
      setVerificationModalOpen(true);
      return;
    }

    // Open moderation history → navigate
    if (kind === "artisan" && lower.includes("moderation")) {
      addEvent("Open moderation history", "Navigating to moderation queue", actionNote);
      window.location.href = `/admin/moderation?search=${encodeURIComponent(recordLabel)}`;
      return;
    }

    if (lower.includes("export") || lower.includes("download")) {
      downloadCsv(`${kind}-${safeId}-${Date.now()}.csv`, [
        ["record", "kind", "action", "note", "generatedAt"],
        [recordLabel, kind, activeAction, actionNote || "Preview export", new Date().toISOString()],
      ]);
      addEvent(activeAction, "Local export generated", actionNote);
      closeAction();
      return;
    }

    if (lower.includes("copy")) {
      const url = `${window.location.origin}${config.backHref}/${safeId}`;
      await navigator.clipboard?.writeText(url);
      addEvent(activeAction, "Link copied", url);
      closeAction();
      return;
    }

    const outcomeMap: Record<string, string> = {
      "approve and verify": "Verification approval staged",
      "request more information": "Information request staged",
      "reject submission": "Verification rejection staged",
      "escalate review": "Escalation staged",
      "message user": "Admin message staged",
      "restrict account": "Restriction staged",
      "resolve case": "Moderation resolution staged",
      "request context": "Context request staged",
      "escalate enforcement": "Enforcement escalation staged",
      "dismiss report": "Report dismissal staged",
      "open incident": "Incident draft opened",
      "annotate event": "Operational annotation saved",
      "assign owner": "Owner assignment staged",
      "refresh index": "Location refresh queued",
      "update aliases": "Alias update staged",
      "retry payout": "Payout retry staged",
      "cancel payout": "Payout cancellation staged",
      "mark complete": "Manual completion staged",
      "add finance note": "Finance note added",
      "review plan": "Subscription plan review staged",
      "retry payment": "Payment retry staged",
      "pause benefits": "Benefit pause staged",
      "regenerate": "Report regeneration queued",
      "share report": "Report share prepared",
      "archive": "Report archive staged",
      "refresh stats": "Database stats refresh queued",
      "inspect indexes": "Index inspection staged",
      "run consistency check": "Consistency check queued",
      "pin result": "Search result pinned",
      "audit query": "Search query audit staged",
      "open artisan": "Opening artisan workspace",
    };

    addEvent(activeAction, outcomeMap[lower] ?? `${activeAction} completed`, actionNote || secondaryValue);
    closeAction();
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="grid gap-5 p-5 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={config.backHref} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }} aria-label="Back to admin list">
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <p className="text-[13px] font-medium leading-[1.23]" style={{ color: COLORS.muted }}>{config.eyebrow}</p>
              <h1 className="mt-1 truncate text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>
                {artisanLoading ? "Loading…" : recordLabel}
              </h1>
              {kind === "artisan" && artisanData && (
                <p className="mt-0.5 text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>
                  {artisanData.profession ?? "Artisan"} · {artisanData.location.county ?? "Kenya"} · {artisanData.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={kind === "artisan" && artisanData ? (artisanData.verificationStatus as DetailStatus) : config.status} />
            {kind === "artisan" && artisanData && (
              <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: artisanData.isAvailable ? COLORS.primarySoft : COLORS.hairlineSoft, background: artisanData.isAvailable ? COLORS.primaryTint : COLORS.surfaceSoft, color: artisanData.isAvailable ? COLORS.primaryActive : COLORS.muted }}>
                {artisanData.isAvailable ? "Available" : "Unavailable"}
              </span>
            )}
          </div>
        </div>

        {toast && (
          <div className="rounded-[14px] border px-4 py-3 text-[13px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>
            {toast}
          </div>
        )}

        {/* Hero card */}
        <section className="relative overflow-hidden rounded-[22px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5" style={{ background: hero.accent }} />
          <div className="flex min-w-0 gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px]" style={{ background: hero.surface, color: hero.accent }}>
              <Icon size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-[1.23]" style={{ color: hero.accent }}>{hero.label}</p>
              <h2 className="mt-1 text-[18px] font-semibold leading-[1.18] tracking-[-0.02em]" style={{ color: COLORS.ink }}>{config.title}</h2>
              <p className="mt-2 max-w-[780px] text-[14px] leading-[1.5]" style={{ color: COLORS.body }}>{hero.body}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {artisanStats.map(([label, value, helper]) => (
                  <div key={label} className="rounded-[14px] border px-3 py-2" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: COLORS.muted }}>{label}</p>
                      <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>{value}</p>
                    </div>
                    <p className="mt-0.5 truncate text-[12px]" style={{ color: COLORS.muted }}>{helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Left: context + timeline */}
          <div className="grid gap-5">
            <section className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Record context</p>
                  <p className="mt-1 text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>Admin workflow sections for this record.</p>
                </div>
                <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: config.needsWholePage ? COLORS.primarySoft : COLORS.hairlineSoft, background: config.needsWholePage ? COLORS.primaryTint : COLORS.surfaceSoft, color: config.needsWholePage ? COLORS.primaryActive : COLORS.muted }}>
                  {config.needsWholePage ? "Whole page required" : "Modal sufficient"}
                </span>
              </div>
              <div className="grid gap-3">
                {config.sections.map(([title, body], index) => (
                  <article key={title} className="rounded-[16px] border p-4" style={{ borderColor: COLORS.hairlineSoft, background: index === 0 ? COLORS.canvas : COLORS.surfaceSoft }}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold" style={{ background: COLORS.primaryTint, color: COLORS.primaryActive }}>{index + 1}</span>
                      <div>
                        <h3 className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{title}</h3>
                        <p className="mt-1 text-[13px] leading-[1.45]" style={{ color: COLORS.body }}>{body}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Portfolio preview (artisan only) */}
            {kind === "artisan" && (
              <section className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Portfolio</p>
                    <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
                      {portfolioLoading ? "Fetching…" : portfolioError ? "Load error" : `${portfolioItems.length} project${portfolioItems.length === 1 ? "" : "s"} · ${portfolioImages.length} image${portfolioImages.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  {portfolioImages.length > 0 && (
                    <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>
                      <Images size={12} className="mr-1 inline" />
                      {portfolioImages.length} images
                    </span>
                  )}
                </div>
                {portfolioError && <p className="text-[13px]" style={{ color: "#b91c1c" }}>Could not load portfolio: {portfolioError}</p>}
                {!portfolioLoading && !portfolioError && portfolioItems.length === 0 && (
                  <p className="text-[13px]" style={{ color: COLORS.muted }}>No portfolio items on file for this artisan.</p>
                )}
                {portfolioItems.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {portfolioItems.map((item) =>
                      item.images.length > 0
                        ? item.images.map((src, i) => (
                          <button
                            key={`${item.id}-img-${i}`}
                            type="button"
                            onClick={() => setPortfolioLightbox({ src, title: item.title })}
                            className="group aspect-square overflow-hidden rounded-[12px] border bg-white transition-all hover:shadow-md"
                            style={{ borderColor: COLORS.hairlineSoft }}
                            aria-label={`View ${item.title}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          </button>
                        ))
                        : (
                          <div
                            key={item.id}
                            className="flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-[12px] border px-2"
                            style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
                          >
                            <p className="text-center text-[11px] font-semibold leading-tight" style={{ color: COLORS.ink }}>{item.title}</p>
                            {item.category && <p className="text-[10px]" style={{ color: COLORS.muted }}>{item.category}</p>}
                          </div>
                        )
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Audit timeline */}
            <section className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Audit timeline</p>
                  <p className="mt-1 text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>All admin actions are recorded here.</p>
                </div>
                <StatusChip status={events.length ? "ACTIVE" : "PENDING"} />
              </div>
              <div className="grid gap-3">
                {events.map((event) => (
                  <div key={`${event.time}-${event.action}`} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold" style={{ color: COLORS.primaryActive }}>{event.outcome}</p>
                      <span className="text-[12px]" style={{ color: COLORS.muted }}>{event.time}</span>
                    </div>
                    <p className="mt-1 text-[12px]" style={{ color: COLORS.body }}>{event.action} · {event.note}</p>
                  </div>
                ))}
                {seededTimeline.map(([title, body]) => (
                  <div key={title} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
                    <p className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>{title}</p>
                    <p className="mt-1 text-[12px] leading-[1.35]" style={{ color: COLORS.body }}>{body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Operations sidebar */}
          <aside className="grid gap-5 xl:sticky xl:top-5">
            <section className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
              <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Operations</p>
              <p className="mt-1 text-[13px] leading-[1.35]" style={{ color: COLORS.muted }}>Each action is wired to the appropriate workflow.</p>
              <div className="mt-4 grid gap-2">
                {config.actions.map((action, index) => {
                  const lower = action.toLowerCase();
                  const isVerification = kind === "artisan" && lower.includes("review verification");
                  const isPortfolio = kind === "artisan" && lower.includes("inspect portfolio");
                  const Icon2 = isVerification ? FileCheck2 : isPortfolio ? Images : lower.includes("moderation") ? Flag : lower.includes("visibility") ? (artisanData?.isAvailable ? EyeOff : Eye) : ChevronRight;
                  return (
                    <button
                      key={action}
                      onClick={() => {
                        if (isVerification) { setVerificationModalOpen(true); return; }
                        setActiveAction(action);
                      }}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-[14px] border px-3 py-2 text-left text-[13px] font-semibold transition-colors hover:bg-[#f7f7f7]"
                      style={{ borderColor: index === 0 ? COLORS.primarySoft : COLORS.hairlineSoft, background: index === 0 ? COLORS.primaryTint : COLORS.canvas, color: index === 0 ? COLORS.primaryActive : COLORS.ink }}
                    >
                      <span>{action}</span>
                      <Icon2 size={14} />
                    </button>
                  );
                })}
              </div>
            </section>

            {kind === "artisan" && artisanData && (
              <section className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Artisan evidence</p>
                <div className="mt-4 grid gap-2">
                  {[
                    { label: "Identity (National ID)", ready: artisanData.documents.includes("National ID") },
                    { label: "Trade certificate", ready: artisanData.documents.includes("Certificate") },
                    { label: "Portfolio images", ready: portfolioImages.length > 0 },
                    { label: "Active subscription", ready: artisanData.isPremium },
                  ].map(({ label, ready }) => (
                    <div key={label} className="flex items-center justify-between rounded-[14px] border px-3 py-2" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                      <span className="text-[13px] font-medium" style={{ color: COLORS.body }}>{label}</span>
                      <span className="text-[12px] font-semibold" style={{ color: ready ? COLORS.primaryActive : "#92400e" }}>{ready ? "On file" : "Missing"}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* Portfolio lightbox */}
      {portfolioLightbox && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setPortfolioLightbox(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portfolioLightbox.src} alt={portfolioLightbox.title} className="max-h-[85vh] max-w-full rounded-[18px] object-contain shadow-2xl" />
            <p className="mt-3 text-center text-[14px] font-semibold text-white">{portfolioLightbox.title}</p>
            <button onClick={() => setPortfolioLightbox(null)} className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow-lg" aria-label="Close image preview">
              <X size={16} />
            </button>
          </div>
        </div>,
        document.body,
      )}

      {/* Verification review modal — reuses ArtisanVerificationReviewModal */}
      {verificationModalOpen && artisanData && (
        <ArtisanVerificationReviewModal
          artisanId={artisanData.id}
          artisanName={artisanData.name}
          profession={artisanData.profession ?? undefined}
          county={artisanData.location.county ?? undefined}
          documents={artisanData.documents}
          idDocumentUrl={artisanData.idDocumentUrl}
          certificateUrl={artisanData.certificateUrl}
          portfolioImageUrls={portfolioImages.map((p) => p.src)}
          onClose={() => {
            setVerificationModalOpen(false);
            addEvent("Review verification", "Verification review workspace closed");
          }}
        />
      )}

      {/* Generic action modal */}
      {activeAction && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <div className="w-full max-w-[540px] rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: COLORS.primaryActive }}>{config.title}</p>
                <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em]" style={{ color: COLORS.ink }}>{activeAction}</h2>
              </div>
              <button onClick={closeAction} className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]" aria-label="Close action modal"><X size={17} /></button>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2 text-[13px] font-semibold" style={{ color: COLORS.ink }}>
                Audit note
                <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Add context for the audit timeline…" className="min-h-24 rounded-[16px] border px-3 py-2 text-[14px] font-normal outline-none" style={{ borderColor: COLORS.hairlineSoft }} />
              </label>

              {/* Visibility selector */}
              {kind === "artisan" && activeAction.toLowerCase().includes("update visibility") && (
                <label className="grid gap-2 text-[13px] font-semibold" style={{ color: COLORS.ink }}>
                  Availability state
                  <select value={secondaryValue || "Available"} onChange={(e) => setSecondaryValue(e.target.value)} className="h-11 rounded-[14px] border px-3 text-[14px] font-normal outline-none" style={{ borderColor: COLORS.hairlineSoft }}>
                    <option>Available</option>
                    <option>Unavailable</option>
                  </select>
                </label>
              )}

              {/* Portfolio viewer in action modal */}
              {kind === "artisan" && activeAction.toLowerCase().includes("inspect portfolio") && (
                <div className="rounded-[16px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                  <p className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>
                    Portfolio images · <span style={{ color: COLORS.primaryActive }}>{portfolioImages.length} loaded</span>
                  </p>
                  {portfolioImages.length > 0 && (
                    <div className="mt-3 grid max-h-[260px] grid-cols-3 gap-2 overflow-y-auto">
                      {portfolioImages.map(({ src, item }, index) => (
                        <a key={`${item.id}-${index}`} href={src} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[10px] border" style={{ borderColor: COLORS.hairlineSoft }}>
                          <div className="aspect-square overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          </div>
                          <p className="truncate px-1.5 py-1 text-[10px] font-medium" style={{ color: COLORS.ink }}>{item.title}</p>
                        </a>
                      ))}
                    </div>
                  )}
                  {!portfolioLoading && portfolioImages.length === 0 && (
                    <p className="mt-2 text-[12px]" style={{ color: COLORS.muted }}>No portfolio images found for this artisan.</p>
                  )}
                </div>
              )}

              {actionError && <p className="text-[13px]" style={{ color: "#b91c1c" }}>{actionError}</p>}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button onClick={closeAction} className="h-11 rounded-full border px-4 text-[13px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Cancel</button>
              <button onClick={runAction} disabled={actionSubmitting} className="h-11 rounded-full px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: COLORS.primary }}>
                {actionSubmitting ? "Updating…" : activeAction.toLowerCase().includes("update visibility") ? "Apply change" : activeAction.toLowerCase().includes("inspect portfolio") ? "Record review" : "Run action"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
