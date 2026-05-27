"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Flag,
  Gauge,
  Hammer,
  Mail,
  MapPinned,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import { FluidPillTabs, StatusChip } from "@/components/ui2";
import { SimpleDashboardView } from "@/components/dashboard2/shared/simple-dashboard-view";
import { COLORS, SHADOWS, TRANSITIONS } from "@/lib/design-tokens";

// ────────────────────────────────────────────────────────────────────────────
// Chart primitives (faithful to source)
// ────────────────────────────────────────────────────────────────────────────

function ChartLegend({ items }: { items: Array<{ label: string; helper?: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[12px]" style={{ color: COLORS.muted }}>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS.primary }} />
          <span className="font-medium" style={{ color: COLORS.body }}>{item.label}</span>
          {item.helper && <span>{item.helper}</span>}
        </span>
      ))}
    </div>
  );
}

function ChartAxisLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-medium leading-none" style={{ color: COLORS.muted }}>{children}</span>;
}

function ChartTooltip({ active, x, y, label, value }: { active: boolean; x: number; y: number; label: string; value: number }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute z-20 rounded-[12px] border bg-white px-3 py-2 text-[12px] shadow-lg" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink, left: Math.min(Math.max(x + 12, 8), 520), top: Math.max(y - 44, 8) }}>
      <p className="font-semibold leading-none">{label}</p>
      <p className="mt-1 leading-none" style={{ color: COLORS.muted }}>{value}</p>
    </div>
  );
}

function AdminBarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const max = Math.max(...values, 1);
  const steps = [max, Math.round(max * 0.66), Math.round(max * 0.33), 0];
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <ChartLegend items={[{ label: "Selected signal", helper: "by period" }]} />
        <ChartAxisLabel>max {max}</ChartAxisLabel>
      </div>
      <div className="relative h-[320px] min-w-0" onMouseLeave={() => { setHovered(null); setTooltip(null); }}>
        <ChartTooltip active={hovered !== null && Boolean(tooltip)} x={tooltip?.x ?? 0} y={tooltip?.y ?? 0} label={hovered !== null ? labels[hovered] : ""} value={hovered !== null ? values[hovered] : 0} />
        <div className="grid grid-cols-[40px_1fr] gap-3">
          <div className="flex h-[254px] flex-col justify-between pt-1 text-right">
            {steps.map((step) => <ChartAxisLabel key={step}>{step}</ChartAxisLabel>)}
          </div>
          <div className="relative min-w-0">
            <div className="absolute inset-x-0 top-0 h-[254px]">
              {[0, 1, 2, 3].map((line) => <span key={line} className="absolute left-0 right-0 h-px" style={{ top: `${(line / 3) * 100}%`, background: COLORS.hairlineSoft }} />)}
            </div>
            <div className="relative grid h-[254px] items-end gap-2" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
              {values.map((value, index) => (
                <button key={`${labels[index]}-${value}`} type="button" onMouseEnter={(e) => { setHovered(index); setTooltip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }); }} onMouseMove={(e) => setTooltip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} className="group flex min-w-0 cursor-pointer flex-col items-center justify-end gap-2 rounded-[10px] px-1 transition-colors hover:bg-[#f7f7f7]" aria-label={`${labels[index]}: ${value}`}>
                  <span className="text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: COLORS.ink }}>{value}</span>
                  <motion.span initial={{ height: 0 }} animate={{ height: `${Math.max(10, (value / max) * 210)}px`, opacity: hovered === index ? 1 : 0.84 }} transition={{ type: "spring", stiffness: 240, damping: 28, mass: 0.7 }} className="w-full max-w-[34px] rounded-t-[10px] rounded-b-[4px]" style={{ background: COLORS.primary }} />
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
              {labels.map((label) => <ChartAxisLabel key={label}>{label}</ChartAxisLabel>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRadialMetric({ label, value, helper }: { label: string; value: number; helper: string }) {
  const r = 42; const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="rounded-[16px] p-4" style={{ background: COLORS.surfaceSoft }}>
      <div className="relative mx-auto grid h-28 w-28 place-items-center">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke={COLORS.surfaceStrong} strokeWidth="10" />
          <motion.circle cx="50" cy="50" r={r} fill="none" stroke={COLORS.primary} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }} transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.7 }} />
        </svg>
        <span className="absolute text-[22px] font-semibold" style={{ color: COLORS.ink }}>{value}%</span>
      </div>
      <p className="mt-3 text-center text-[14px] font-semibold" style={{ color: COLORS.ink }}>{label}</p>
      <p className="mt-1 text-center text-[12px] leading-[1.33]" style={{ color: COLORS.muted }}>{helper}</p>
    </div>
  );
}

function AdminLineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const max = Math.max(...values, 1); const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const W = 640; const H = 268; const pX = 42; const pY = 24;
  const pW = W - pX * 2; const pH = H - pY * 2;
  const pts = values.map((v, i) => ({ x: pX + (i / Math.max(1, values.length - 1)) * pW, y: pY + (1 - (v - min) / range) * pH, v, label: labels[i] }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1]?.x ?? pX} ${H - pY} L ${pts[0]?.x ?? pX} ${H - pY} Z`;
  const yTicks = [max, Math.round(min + range * 0.66), Math.round(min + range * 0.33), min];
  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ChartLegend items={[{ label: "Selected signal", helper: `${labels.length} intervals` }]} />
        <ChartAxisLabel>scale {min}–{max}</ChartAxisLabel>
      </div>
      <div className="relative min-w-0" onMouseLeave={() => { setHovered(null); setTooltip(null); }}>
        <ChartTooltip active={hovered !== null && Boolean(tooltip)} x={tooltip?.x ?? 0} y={tooltip?.y ?? 0} label={hovered !== null ? labels[hovered] : ""} value={hovered !== null ? values[hovered] : 0} />
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[320px] w-full overflow-visible" preserveAspectRatio="none">
          {yTicks.map((tick, i) => { const y = pY + (i / 3) * pH; return (<g key={`y-${tick}-${i}`}><line x1={pX} x2={W - pX} y1={y} y2={y} stroke={COLORS.hairlineSoft} strokeWidth="1" /><text x="4" y={y + 4} fontSize="11" fill={COLORS.muted}>{tick}</text></g>); })}
          {pts.map((p, i) => <line key={`xg-${p.label}`} x1={p.x} x2={p.x} y1={pY} y2={H - pY} stroke={COLORS.hairlineSoft} strokeWidth="1" opacity={i === 0 || i === pts.length - 1 ? 1 : 0.55} />)}
          <path d={area} fill={COLORS.primary} opacity="0.08" />
          <motion.path d={path} fill="none" stroke={COLORS.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
          {pts.map((p, i) => (
            <g key={`${p.label}-${p.v}`}>
              <circle cx={p.x} cy={p.y} r={hovered === i ? 8 : 5} fill="white" stroke={COLORS.primary} strokeWidth={hovered === i ? 4 : 3} />
              <rect x={p.x - 26} y={pY} width="52" height={pH} fill="transparent" className="cursor-pointer" onMouseEnter={(e) => { setHovered(i); setTooltip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }); }} onMouseMove={(e) => setTooltip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })} />
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="11" fill={COLORS.muted}>{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

type AnalyticsViz = "trend" | "bars" | "radial";
type AnalyticsCategory = "growth" | "conversion" | "revenue";
type AnalyticsRange = "today" | "week" | "month" | "quarter";
type AdminBulkAction = "resend" | "revoke" | "approve" | "assign" | "export";

function AdminAnalyticsVisualization({ type, values, labels }: { type: AnalyticsViz; values: number[]; labels: string[] }) {
  if (type === "bars") return <AdminBarChart values={values} labels={labels} />;
  if (type === "radial") {
    const acc = Math.round(values[values.length - 1] ?? 42);
    const resp = Math.round(Math.min(96, 72 + values.slice(-3).reduce((s, v) => s + v, 0) / 30));
    const sup = Math.round(Math.min(98, 64 + values.length * 2));
    return <div className="grid gap-4 md:grid-cols-3"><AdminRadialMetric label="Quote acceptance" value={acc} helper="Accepted quotes in range" /><AdminRadialMetric label="Response SLA" value={resp} helper="Threads answered in target" /><AdminRadialMetric label="Verified supply" value={sup} helper="Search-eligible artisans" /></div>;
  }
  return <AdminLineChart values={values} labels={labels} />;
}

// ────────────────────────────────────────────────────────────────────────────
// StableSegmentedTabs (source-faithful layoutId pill)
// ────────────────────────────────────────────────────────────────────────────

function StableSegmentedTabs<T extends string>({ id, value, onChange, options, size = "default" }: { id: string; value: T; onChange: (v: T) => void; options: Array<{ id: T; label: string; icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }> }>; size?: "default" | "compact" }) {
  const compact = size === "compact";
  return (
    <div className="inline-grid shrink-0 rounded-full border" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceStrong, gridTemplateColumns: `repeat(${options.length}, minmax(${compact ? "72px" : "92px"}, 1fr))`, padding: compact ? 3 : 4 }}>
      {options.map((opt) => {
        const active = value === opt.id;
        const Icon = opt.icon;
        return (
          <button key={`${id}-${opt.id}`} type="button" onClick={() => onChange(opt.id)} className={`${compact ? "h-8 min-w-[72px] px-2 text-[12px]" : "h-9 min-w-[92px] px-3 text-[13px]"} relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full text-center font-semibold leading-none transition-colors`} style={{ color: active ? COLORS.ink : COLORS.muted }}>
            <AnimatePresence initial={false}>
              {active && <motion.span key={`${id}-${opt.id}-pill`} layoutId={`${id}-stable-pill`} className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            </AnimatePresence>
            {Icon && <Icon size={compact ? 13 : 14} className="relative z-10 shrink-0" style={{ color: active ? COLORS.primary : COLORS.muted }} />}
            <span className="relative z-10 whitespace-nowrap leading-none">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// BulkActionPanel
// ────────────────────────────────────────────────────────────────────────────

function BulkActionPanel({ selectedCount, noun, onAction, onClear }: { selectedCount: number; noun: string; onAction: (a: AdminBulkAction) => void; onClear: () => void }) {
  const disabled = selectedCount === 0;
  const actions: Array<{ id: AdminBulkAction; label: string }> = [{ id: "resend", label: "Resend" }, { id: "approve", label: "Approve" }, { id: "assign", label: "Assign" }, { id: "export", label: "Export" }, { id: "revoke", label: "Revoke" }];
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border p-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
      <div>
        <p className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>{selectedCount} {noun} selected</p>
        <p className="mt-0.5 text-[12px]" style={{ color: COLORS.muted }}>{disabled ? "Select rows to enable bulk actions." : "Apply a controlled admin action to selected rows."}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => <button key={a.id} type="button" disabled={disabled} onClick={() => onAction(a.id)} className="h-9 rounded-full border px-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.canvas, color: a.id === "revoke" ? "#b91c1c" : COLORS.ink }}>{a.label}</button>)}
        <button type="button" disabled={disabled} onClick={onClear} className="h-9 rounded-full px-3 text-[12px] font-semibold disabled:opacity-45" style={{ color: COLORS.muted }}>Clear</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Quick detail slideover
// ────────────────────────────────────────────────────────────────────────────

type QuickDetail = { title: string; subtitle: string; status: string; description: string; metrics: Array<[string, string]> };

function AdminQuickDetail({ detail, onClose }: { detail: QuickDetail | null; onClose: () => void }) {
  if (!detail) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
        <button className="absolute inset-0 cursor-default bg-black/30" onClick={onClose} />
        <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }} className="absolute right-0 top-0 h-full w-full max-w-[420px] overflow-y-auto bg-white p-5" style={{ boxShadow: SHADOWS.card }}>
          <div className="mb-4 flex items-start justify-between gap-3 border-b pb-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>{detail.title}</p>
              <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{detail.subtitle}</p>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline }}><X size={16} /></button>
          </div>
          <p className="mb-5 text-[14px] leading-[1.6]" style={{ color: COLORS.body }}>{detail.description}</p>
          <div className="grid gap-3">
            {detail.metrics.map(([k, v]) => (
              <div key={k} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                <p className="text-[12px]" style={{ color: COLORS.muted }}>{k}</p>
                <p className="mt-0.5 text-[14px] font-semibold" style={{ color: COLORS.ink }}>{v}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Admin overview (with command center, operational trend, recent activity, verification aside)
// ────────────────────────────────────────────────────────────────────────────

export function AdminOverviewView() {
  const router = useRouter();
  const [quickDetail, setQuickDetail] = useState<QuickDetail | null>(null);

  const openQuick = (d: QuickDetail) => setQuickDetail(d);

  return (
    <main className="p-5 md:p-6">
      <AdminQuickDetail detail={quickDetail} onClose={() => setQuickDetail(null)} />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Pending verification", value: "19", helper: "8 medium risk", icon: FileCheck2 }, { label: "Open moderation", value: "7", helper: "1 high severity", icon: Flag }, { label: "Active subscriptions", value: "312", helper: "KES 46.8K MRR", icon: CreditCard }, { label: "System health", value: "99.96%", helper: "1 service in review", icon: Gauge }].map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-medium" style={{ color: COLORS.muted }}>{label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: COLORS.surfaceSoft, color: COLORS.primary }}><Icon size={17} /></span>
            </div>
            <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>{value}</p>
            <p className="mt-2 text-[13px]" style={{ color: COLORS.muted }}>{helper}</p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          {/* Command center */}
          <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Admin command center</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>High-priority operational work across verification, moderation, subscriptions, invites, and system health.</p>
              </div>
              <StatusChip status="ACTIVE" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ label: "Review queue", icon: FileCheck2, href: "/admin-dashboard/verification", primary: true }, { label: "Moderation", icon: Flag, href: "/admin-dashboard/moderation" }, { label: "Invites", icon: Send, href: "/admin-dashboard/invites" }, { label: "Health", icon: Gauge, href: "/admin-dashboard/monitoring" }].map(({ label, icon: Icon, href, primary }) => (
                <button key={label} onClick={() => router.push(href)} className="group inline-flex h-9 min-w-fit items-center gap-2 rounded-full border px-3 text-left transition-transform hover:-translate-y-0.5" style={primary ? { borderColor: COLORS.primary, background: COLORS.primary, boxShadow: SHADOWS.soft } : { borderColor: COLORS.hairlineSoft, background: COLORS.canvas, color: COLORS.ink, boxShadow: SHADOWS.soft }}>
                  <Icon size={14} className="shrink-0" style={{ color: primary ? COLORS.canvas : COLORS.primary }} />
                  <span className="whitespace-nowrap text-[12px] font-semibold leading-none" style={{ color: primary ? COLORS.canvas : COLORS.ink }}>{label}</span>
                  <ChevronRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: primary ? COLORS.canvas : COLORS.muted }} />
                </button>
              ))}
            </div>
          </div>

          {/* Trend chart */}
          <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: COLORS.hairlineSoft }}>
              <div>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Operational trend</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>Verification, moderation, invite, and system-health pressure this week.</p>
              </div>
              <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>7 day view</span>
            </div>
            <AdminLineChart values={[31, 42, 38, 54, 47, 63, 58]} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} />
          </div>

          {/* Recent activity */}
          <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Recent admin activity</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>Latest operational events that need visibility.</p>
              </div>
              <Activity size={18} style={{ color: COLORS.primary }} />
            </div>
            <div className="grid gap-2">
              {[["Verification submitted", "Grace Wanjiku uploaded trade evidence.", "12m", "/admin-dashboard/verification"], ["Moderation flag opened", "Abusive message report assigned to safety.", "38m", "/admin-dashboard/moderation"], ["Subscription renewal failed", "Premium artisan renewal needs retry.", "2h", "/admin-dashboard/settings"], ["Search index refreshed", "Location coverage index completed.", "4h", "/admin-dashboard/locations"]].map(([title, body, time, href], i) => (
                <button key={title as string} onClick={() => router.push(href as string)} className="grid cursor-pointer grid-cols-[10px_1fr_auto] gap-3 rounded-[14px] p-3 text-left transition-colors hover:bg-[#f7f7f7]">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full" style={{ background: i === 0 ? COLORS.primary : COLORS.hairline }} />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{title}</span>
                    <span className="mt-0.5 block text-[13px]" style={{ color: COLORS.muted }}>{body}</span>
                  </span>
                  <span className="shrink-0 text-[12px]" style={{ color: COLORS.mutedSoft }}>{time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aside: verification queue */}
        <aside className="grid gap-5">
          <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Verification queue</p>
              <span className="rounded-full px-2 py-1 text-[11px] font-semibold text-white" style={{ background: COLORS.primary }}>19</span>
            </div>
            <div className="grid gap-2">
              {[["Grace Wanjiku", "Carpenter · Kiambu", "PENDING"], ["Samuel Kiptoo", "Handyman · Nakuru", "REVIEW"], ["Amina Hassan", "Painter · Westlands", "PENDING"]].map(([name, meta, status]) => (
                <button key={name as string} onClick={() => openQuick({ title: name as string, subtitle: meta as string, status: status as string, description: `Review ${name}'s submitted documents and portfolio evidence before changing verification status.`, metrics: [["Profession", (meta as string).split("·")[0].trim()], ["County", (meta as string).split("·")[1]?.trim() ?? "—"], ["Risk", "Medium"], ["Status", status as string]] })} className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] p-3 transition-colors hover:bg-[#f7f7f7]" style={{ background: COLORS.surfaceSoft }}>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{name}</span>
                    <span className="block text-[13px]" style={{ color: COLORS.muted }}>{meta}</span>
                  </span>
                  <StatusChip status={status as "PENDING" | "REVIEW"} />
                </button>
              ))}
            </div>
            <button onClick={() => router.push("/admin-dashboard/verification")} className="mt-3 w-full cursor-pointer rounded-lg border px-4 py-2.5 text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>View full queue →</button>
          </div>
        </aside>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Verification view
// ────────────────────────────────────────────────────────────────────────────

const verificationQueue = [
  { id: "v1", name: "Grace Wanjiku", profession: "Carpenter", county: "Kiambu", documents: ["National ID", "Trade certificate"], risk: "Low", status: "PENDING" as const, submitted: "Today" },
  { id: "v2", name: "Samuel Kiptoo", profession: "Handyman", county: "Nakuru", documents: ["National ID"], risk: "Medium", status: "REVIEW" as const, submitted: "Yesterday" },
  { id: "v3", name: "Amina Hassan", profession: "Painter", county: "Nairobi", documents: ["National ID", "Portfolio evidence", "Reference letter"], risk: "Low", status: "PENDING" as const, submitted: "2 days ago" },
  { id: "v4", name: "Joseph Njoroge", profession: "Welder", county: "Nairobi", documents: ["National ID"], risk: "High", status: "REVIEW" as const, submitted: "3 days ago" },
  { id: "v5", name: "Daniel Kariuki", profession: "Mason", county: "Kiambu", documents: ["National ID", "Skill certificate"], risk: "Low", status: "PENDING" as const, submitted: "4 days ago" },
];

export function AdminVerificationView() {
  const [selected, setSelected] = useState<string[]>([]);
  const [quickDetail, setQuickDetail] = useState<QuickDetail | null>(null);

  const toggleSelect = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === verificationQueue.length ? [] : verificationQueue.map((r) => r.id));

  return (
    <main className="p-5 md:p-6">
      <AdminQuickDetail detail={quickDetail} onClose={() => setQuickDetail(null)} />
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Verification</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Verification queue</h2>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Review artisan identities, certificates, and skill evidence before public visibility.</p>
        </div>
        <span className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white" style={{ background: COLORS.primary }}>{verificationQueue.length} pending</span>
      </div>
      <BulkActionPanel selectedCount={selected.length} noun="artisans" onAction={(action) => setQuickDetail({ title: `Bulk ${action}`, subtitle: `${selected.length} artisans selected`, status: "ACTIVE", description: `Apply ${action} to ${selected.length} selected artisans. This operation will be logged and reviewed.`, metrics: [["Action", action], ["Count", String(selected.length)], ["Audit", "Required"]] })} onClear={() => setSelected([])} />
      <div className="mt-4 overflow-hidden rounded-[18px] border bg-white" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" style={{ color: COLORS.body }}>
            <thead>
              <tr className="border-b text-left text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                <th className="px-4 py-3"><input type="checkbox" checked={selected.length === verificationQueue.length} onChange={toggleAll} className="h-4 w-4 cursor-pointer rounded" /></th>
                {["Artisan", "County", "Documents", "Risk", "Status", "Action"].map((h) => <th key={h} className={`px-4 py-3 ${h === "Action" ? "text-right" : ""}`} style={{ color: COLORS.ink }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {verificationQueue.map((row, index) => {
                const isSelected = selected.includes(row.id);
                return (
                  <tr key={row.id} onClick={() => setQuickDetail({ title: row.name, subtitle: `${row.profession} · ${row.county}`, status: row.status, description: `Review ${row.documents.join(", ")} before changing verification status.`, metrics: [["Risk", row.risk], ["Documents", String(row.documents.length)], ["Submitted", row.submitted], ["County", row.county]] })} className="cursor-pointer border-t transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, background: isSelected ? "#ecfdf5" : index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                    <td className="px-4 py-3"><input type="checkbox" checked={isSelected} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(row.id)} className="h-4 w-4 cursor-pointer rounded" /></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>{row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                        <span>
                          <span className="block font-semibold" style={{ color: COLORS.ink }}>{row.name}</span>
                          <span className="block text-[12px]">{row.profession} · submitted {row.submitted}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.county}</td>
                    <td className="px-4 py-3">{row.documents.length} files</td>
                    <td className="px-4 py-3" style={{ color: row.risk === "High" ? "#c2410c" : row.risk === "Medium" ? "#92400e" : COLORS.body }}>{row.risk}</td>
                    <td className="px-4 py-3"><StatusChip status={row.status} /></td>
                    <td className="px-4 py-3 text-right"><button type="button" onClick={(e) => { e.stopPropagation(); setQuickDetail({ title: `Verify ${row.name}`, subtitle: `${row.profession} verification review`, status: row.status, description: `Review submitted documents, portfolio evidence, location, category fit, duplicate accounts, and policy risk before approving ${row.name}.`, metrics: [["Profession", row.profession], ["County", row.county], ["Documents", `${row.documents.length} files`], ["Submitted", row.submitted], ["Risk", row.risk]] }); }} className="cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Review</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Artisans view
// ────────────────────────────────────────────────────────────────────────────

const artisanRows = [
  { id: "a1", name: "Peter Mwangi", profession: "Plumber", city: "Kilimani", county: "Nairobi", rating: 4.9, reviews: 82, isVerified: true, isPremium: false, isAvailable: true, status: "ACTIVE" as const },
  { id: "a2", name: "Grace Wanjiku", profession: "Carpenter", city: "Kikuyu", county: "Kiambu", rating: 4.8, reviews: 64, isVerified: true, isPremium: true, isAvailable: false, status: "ACTIVE" as const },
  { id: "a3", name: "Amina Hassan", profession: "Painter", city: "Westlands", county: "Nairobi", rating: 4.9, reviews: 51, isVerified: true, isPremium: true, isAvailable: true, status: "ACTIVE" as const },
  { id: "a4", name: "Brian Otieno", profession: "Electrician", city: "Rongai", county: "Kajiado", rating: 4.7, reviews: 73, isVerified: true, isPremium: false, isAvailable: true, status: "ACTIVE" as const },
  { id: "a5", name: "Samuel Kiptoo", profession: "Handyman", city: "Nakuru", county: "Nakuru", rating: 4.7, reviews: 34, isVerified: false, isPremium: false, isAvailable: true, status: "PENDING" as const },
  { id: "a6", name: "Mercy Achieng", profession: "Cleaner", city: "Nyali", county: "Mombasa", rating: 4.6, reviews: 28, isVerified: false, isPremium: false, isAvailable: true, status: "REVIEW" as const },
];

export function AdminArtisansView() {
  const [quickDetail, setQuickDetail] = useState<QuickDetail | null>(null);
  const [query, setQuery] = useState("");
  const filtered = artisanRows.filter((a) => !query || [a.name, a.profession, a.city, a.county].join(" ").toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="p-5 md:p-6">
      <AdminQuickDetail detail={quickDetail} onClose={() => setQuickDetail(null)} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Verified artisans", value: String(artisanRows.filter((a) => a.isVerified).length), helper: "Eligible for search", icon: BadgeCheck }, { label: "Premium artisans", value: String(artisanRows.filter((a) => a.isPremium).length), helper: "Priority placement", icon: Sparkles }, { label: "Available now", value: String(artisanRows.filter((a) => a.isAvailable).length), helper: "Can accept requests", icon: CalendarDays }, { label: "Average rating", value: "4.8", helper: "Across visible artisans", icon: Star }].map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
            <div className="flex items-start justify-between gap-3"><p className="text-[13px] font-medium" style={{ color: COLORS.muted }}>{label}</p><span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: COLORS.surfaceSoft, color: COLORS.primary }}><Icon size={17} /></span></div>
            <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>{value}</p>
            <p className="mt-2 text-[13px]" style={{ color: COLORS.muted }}>{helper}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[18px] border bg-white" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="border-b p-4" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Artisan directory management</p>
          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>Search, inspect, verify, suspend, and manage marketplace artisan visibility.</p>
          <div className="mt-3 flex h-12 items-center gap-3 rounded-full border bg-white px-4" style={{ borderColor: COLORS.hairline }}>
            <Search size={16} style={{ color: COLORS.muted }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, profession, or county…" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#929292]" style={{ color: COLORS.ink }} />
            {query && <button onClick={() => setQuery("")}><X size={14} style={{ color: COLORS.muted }} /></button>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" style={{ color: COLORS.body }}>
            <thead><tr className="border-b text-left text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>{["Artisan", "Profession", "Location", "Rating", "Plan", "Status", "Action"].map((h) => <th key={h} className={`px-4 py-3 ${h === "Action" ? "text-right" : ""}`} style={{ color: COLORS.ink }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} onClick={() => setQuickDetail({ title: a.name, subtitle: `${a.profession} · ${a.city}, ${a.county}`, status: a.status, description: `Rating: ${a.rating} (${a.reviews} reviews). ${a.isVerified ? "Verified." : "Not verified."} ${a.isPremium ? "Premium subscriber." : "Standard plan."}`, metrics: [["Rating", `${a.rating} (${a.reviews} reviews)`], ["Verified", a.isVerified ? "Yes" : "No"], ["Plan", a.isPremium ? "Premium" : "Standard"], ["Status", a.status]] })} className="cursor-pointer border-t transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, background: i % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                  <td className="px-4 py-3"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>{a.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span><span className="block font-semibold" style={{ color: COLORS.ink }}>{a.name}</span></span></td>
                  <td className="px-4 py-3">{a.profession}</td>
                  <td className="px-4 py-3">{a.city}, {a.county}</td>
                  <td className="px-4 py-3">★ {a.rating} ({a.reviews})</td>
                  <td className="px-4 py-3">{a.isPremium ? <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>Premium</span> : <span className="text-[13px]" style={{ color: COLORS.muted }}>Standard</span>}</td>
                  <td className="px-4 py-3"><StatusChip status={a.status} /></td>
                  <td className="px-4 py-3 text-right"><button type="button" onClick={(e) => { e.stopPropagation(); setQuickDetail({ title: `Manage ${a.name}`, subtitle: `${a.profession} account controls`, status: a.status, description: `Full artisan inspection includes verification status, subscription, jobs, portfolio quality, and suspension controls.`, metrics: [["Rating", `${a.rating}`], ["Reviews", String(a.reviews)], ["Plan", a.isPremium ? "Premium" : "Standard"], ["Status", a.status]] }); }} className="cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Inspect</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Users view
// ────────────────────────────────────────────────────────────────────────────

const userRows = [
  { id: "u1", name: "Miriam Otieno", role: "Client", email: "miriam@example.com", status: "ACTIVE" as const, meta: "17 jobs · Nairobi", risk: "Low" },
  { id: "u2", name: "Peter Mwangi", role: "Artisan", email: "peter@example.com", status: "ACTIVE" as const, meta: "4.9 rating · Plumber", risk: "Low" },
  { id: "u3", name: "Suspicious Account", role: "Client", email: "flagged@example.com", status: "REVIEW" as const, meta: "Flagged by moderation", risk: "High" },
  { id: "u4", name: "Admin User", role: "Admin", email: "admin@chapaworks.co.ke", status: "ACTIVE" as const, meta: "Super admin", risk: "Low" },
];

export function AdminUsersView() {
  const [quickDetail, setQuickDetail] = useState<QuickDetail | null>(null);

  return (
    <main className="p-5 md:p-6">
      <AdminQuickDetail detail={quickDetail} onClose={() => setQuickDetail(null)} />
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Users</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>User management</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Review client, artisan, and admin accounts with status and safety controls.</p>
      </div>
      <div className="overflow-hidden rounded-[18px] border bg-white" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" style={{ color: COLORS.body }}>
            <thead><tr className="border-b text-left text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>{["User", "Role", "Meta", "Risk", "Status", "Action"].map((h) => <th key={h} className={`px-4 py-3 ${h === "Action" ? "text-right" : ""}`} style={{ color: COLORS.ink }}>{h}</th>)}</tr></thead>
            <tbody>
              {userRows.map((u, i) => (
                <tr key={u.id} onClick={() => setQuickDetail({ title: u.name, subtitle: `${u.role} · ${u.email}`, status: u.status, description: `Account risk is ${u.risk.toLowerCase()}. ${u.meta}. Admin can inspect activity, messages, jobs, verification state, and moderation flags before applying restrictions.`, metrics: [["Role", u.role], ["Risk", u.risk], ["Status", u.status], ["Account", u.email]] })} className="cursor-pointer border-t transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, background: i % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                  <td className="px-4 py-3"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>{u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span><span><span className="block font-semibold" style={{ color: COLORS.ink }}>{u.name}</span><span className="block text-[12px]">{u.email}</span></span></span></td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]">{u.meta}</td>
                  <td className="px-4 py-3"><span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: u.risk === "High" ? "#fef2f2" : COLORS.primaryTint, color: u.risk === "High" ? "#dc2626" : COLORS.primaryActive }}>{u.risk}</span></td>
                  <td className="px-4 py-3"><StatusChip status={u.status} /></td>
                  <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><button type="button" onClick={(e) => { e.stopPropagation(); setQuickDetail({ title: `Inspect ${u.name}`, subtitle: `${u.role} account controls`, status: u.status, description: "Full user inspection includes account activity, role-specific records, linked jobs, conversation reports, moderation flags, and suspension controls.", metrics: [["Email", u.email], ["Role", u.role], ["Risk", u.risk], ["Meta", u.meta]] }); }} className="cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Inspect</button><button type="button" onClick={(e) => { e.stopPropagation(); }} className="cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: "#b91c1c" }}>Ban</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Invites view
// ────────────────────────────────────────────────────────────────────────────

const inviteRows = [
  { id: "i1", email: "jane.artisan@example.com", role: "Artisan", status: "PENDING" as const, sent: "Today" },
  { id: "i2", email: "kamau.builder@example.com", role: "Artisan", status: "ACTIVE" as const, sent: "Yesterday" },
  { id: "i3", email: "old.invite@example.com", role: "Artisan", status: "COMPLETED" as const, sent: "Expired" },
];

export function AdminInvitesView() {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [quickDetail, setQuickDetail] = useState<QuickDetail | null>(null);

  return (
    <main className="p-5 md:p-6">
      <AdminQuickDetail detail={quickDetail} onClose={() => setQuickDetail(null)} />
      {/* Send invite */}
      <div className="mb-6 rounded-[18px] border p-5" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Send artisan invite</p>
            <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>Create a role-aware onboarding invite. The invite history below remains the primary list workflow.</p>
          </div>
          <StatusChip status="ACTIVE" />
        </div>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)_auto] xl:items-start">
          <input placeholder="artisan@example.com" className="h-12 min-w-0 rounded-lg border bg-white px-3 text-[14px] outline-none" style={{ borderColor: COLORS.hairline }} />
          <select className="h-12 min-w-0 cursor-pointer rounded-lg border bg-white px-3 text-[14px] outline-none" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
            <option>Artisan role</option><option>Admin role</option>
          </select>
          <textarea placeholder="Optional invite note" className="min-h-12 min-w-0 rounded-lg border bg-white px-3 py-3 text-[14px] outline-none" style={{ borderColor: COLORS.hairline }} />
          <button className="h-12 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>Send invite</button>
        </div>
      </div>

      {/* Bulk workspace */}
      <div className="mb-6 rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Bulk invite workspace</p>
            <p className="mt-1 max-w-[700px] text-[13px]" style={{ color: COLORS.muted }}>Paste emails, upload CSV later, or select existing invite rows for controlled resend, revoke, assignment, approval, and export flows.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="h-10 rounded-full px-4 text-[13px] font-semibold" style={{ background: COLORS.primary, color: "white" }}>Import CSV</button>
            <button type="button" className="h-10 rounded-full border px-4 text-[13px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.canvas, color: COLORS.ink }}>Send batch</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[["Parsed emails", "24", "CSV or pasted list"], ["Invalid rows", "2", "Needs correction"], ["Duplicate invites", "3", "Will be skipped"]].map(([label, value, helper]) => (
            <div key={label as string} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
              <p className="text-[12px]" style={{ color: COLORS.muted }}>{label}</p>
              <p className="mt-1 text-[22px] font-semibold" style={{ color: COLORS.ink }}>{value}</p>
              <p className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>{helper}</p>
            </div>
          ))}
        </div>
      </div>

      <BulkActionPanel selectedCount={selectedEmails.length} noun="invites" onAction={(action) => setQuickDetail({ title: `Bulk ${action}`, subtitle: `${selectedEmails.length} invites selected`, status: "ACTIVE", description: `Apply ${action} to ${selectedEmails.length} selected invites.`, metrics: [["Action", action], ["Count", String(selectedEmails.length)]] })} onClear={() => setSelectedEmails([])} />

      {/* Invite history */}
      <div className="mt-4 overflow-hidden rounded-[18px] border bg-white" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <div>
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Invite history</p>
            <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>Role-aware invite tokens, expiry, acceptance, and onboarding status.</p>
          </div>
          <button type="button" onClick={() => setSelectedEmails(selectedEmails.length === inviteRows.length ? [] : inviteRows.map((r) => r.email))} className="cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold hover:bg-white" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>
            {selectedEmails.length === inviteRows.length ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" style={{ color: COLORS.body }}>
            <thead><tr className="border-b text-left text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>{["", "Email", "Role", "Sent", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3" style={{ color: COLORS.ink }}>{h}</th>)}</tr></thead>
            <tbody>
              {inviteRows.map((inv, i) => {
                const isSel = selectedEmails.includes(inv.email);
                return (
                  <tr key={inv.id} className="border-t" style={{ borderColor: COLORS.hairlineSoft, background: isSel ? "#ecfdf5" : i % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                    <td className="px-4 py-3"><input type="checkbox" checked={isSel} onChange={() => setSelectedEmails((prev) => isSel ? prev.filter((e) => e !== inv.email) : [...prev, inv.email])} className="h-4 w-4 cursor-pointer rounded" /></td>
                    <td className="px-4 py-3" style={{ color: COLORS.ink }}>{inv.email}</td>
                    <td className="px-4 py-3">{inv.role}</td>
                    <td className="px-4 py-3">{inv.sent}</td>
                    <td className="px-4 py-3"><StatusChip status={inv.status} /></td>
                    <td className="px-4 py-3"><div className="flex gap-2"><button type="button" className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Resend</button><button type="button" className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: "#b91c1c" }}>Revoke</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Moderation view
// ────────────────────────────────────────────────────────────────────────────

const moderationRows = [
  { id: "m1", title: "Low quality portfolio", body: "A project image appears duplicated across two unrelated artisans.", status: "REVIEW" as const, severity: "Low", target: "Portfolio project", source: "Automated duplicate media check", owner: "Trust queue" },
  { id: "m2", title: "User report", body: "Client reported abusive language in a conversation thread.", status: "PENDING" as const, severity: "High", target: "Conversation thread", source: "Client report", owner: "Safety team" },
  { id: "m3", title: "Suspicious account", body: "Repeated invite abuse and unusual signup velocity detected.", status: "REVIEW" as const, severity: "Medium", target: "Account", source: "Risk signal", owner: "Platform ops" },
  { id: "m4", title: "Listing policy mismatch", body: "Profile advertises restricted payment terms outside testing policy.", status: "PENDING" as const, severity: "Medium", target: "Artisan listing", source: "Policy scan", owner: "Marketplace quality" },
];

export function AdminModerationView() {
  const [quickDetail, setQuickDetail] = useState<QuickDetail | null>(null);
  const severityColor = (s: string) => s === "High" ? "#c2410c" : s === "Medium" ? "#92400e" : COLORS.body;

  return (
    <main className="p-5 md:p-6">
      <AdminQuickDetail detail={quickDetail} onClose={() => setQuickDetail(null)} />
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Moderation</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Moderation queue</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Review flagged profiles, messages, portfolio items, and reported job activity.</p>
      </div>
      <div className="overflow-hidden rounded-[18px] border bg-white" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" style={{ color: COLORS.body }}>
            <thead><tr className="border-b text-left text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>{["Issue", "Target", "Severity", "Status", "Action"].map((h) => <th key={h} className="px-4 py-3" style={{ color: COLORS.ink }}>{h}</th>)}</tr></thead>
            <tbody>
              {moderationRows.map((row, i) => (
                <tr key={row.id} onClick={() => setQuickDetail({ title: row.title, subtitle: `${row.target} · ${row.severity} severity`, status: row.status, description: `${row.body} Source: ${row.source}. Owner: ${row.owner}.`, metrics: [["Target", row.target], ["Severity", row.severity], ["Source", row.source], ["Owner", row.owner]] })} className="cursor-pointer border-t transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, background: i % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                  <td className="px-4 py-3 max-w-[280px]"><span className="block font-semibold" style={{ color: COLORS.ink }}>{row.title}</span><span className="block text-[13px]">{row.body}</span></td>
                  <td className="px-4 py-3">{row.target}</td>
                  <td className="px-4 py-3" style={{ color: severityColor(row.severity) }}>{row.severity}</td>
                  <td className="px-4 py-3"><StatusChip status={row.status} /></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button type="button" onClick={(e) => { e.stopPropagation(); setQuickDetail({ title: `Inspect ${row.title}`, subtitle: `${row.target} · ${row.source}`, status: row.status, description: `Full moderation workflow. ${row.body} Actions support resolve, escalate, and audit.`, metrics: [["Severity", row.severity], ["Target", row.target], ["Source", row.source], ["Owner", row.owner]] }); }} className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Inspect</button><button type="button" onClick={(e) => e.stopPropagation()} className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: "#b91c1c" }}>Resolve</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Analytics view (full fidelity: FluidPillTabs + StableSegmentedTabs + charts)
// ────────────────────────────────────────────────────────────────────────────

type AnalyticsRangeKey = "today" | "week" | "month" | "quarter";
type AnalyticsCategoryKey = "growth" | "conversion" | "revenue";

const ANALYTICS_DATA: Record<AnalyticsRangeKey, { labels: string[]; growth: number[]; conversion: number[]; revenue: number[]; stats: string[]; helper: string }> = {
  today: { labels: ["8a", "10a", "12p", "2p", "4p", "6p"], growth: [18, 26, 31, 45, 54, 62], conversion: [24, 28, 35, 33, 41, 47], revenue: [12, 18, 21, 29, 33, 38], stats: ["KES 84K", "1.9K", "186", "38%"], helper: "Today" },
  week: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], growth: [42, 48, 51, 58, 64, 72, 78], conversion: [32, 34, 38, 36, 41, 44, 46], revenue: [38, 44, 52, 49, 58, 63, 70], stats: ["KES 436K", "6.2K", "512", "41%"], helper: "This week" },
  month: { labels: ["W1", "W2", "W3", "W4", "Now"], growth: [36, 46, 58, 68, 84], conversion: [34, 38, 42, 40, 42], revenue: [28, 41, 55, 67, 81], stats: ["KES 1.8M", "18.4K", "1,486", "42%"], helper: "This month" },
  quarter: { labels: ["M1", "M2", "M3"], growth: [54, 71, 88], conversion: [39, 43, 45], revenue: [62, 76, 91], stats: ["KES 5.6M", "54.2K", "4,212", "45%"], helper: "This quarter" },
};

const CATEGORY_COPY: Record<AnalyticsCategoryKey, { title: string; subtitle: string }> = {
  growth: { title: "Marketplace growth", subtitle: "Search demand, profile views, message starts, and verified supply momentum." },
  conversion: { title: "Conversion funnel", subtitle: "Profile views to message starts, quote requests, accepted quotes, and completed jobs." },
  revenue: { title: "Subscription and GMV signal", subtitle: "Subscription revenue, premium conversion, renewal health, and cash-mode GMV estimates." },
};

export function AdminAnalyticsView() {
  const [range, setRange] = useState<AnalyticsRangeKey>("week");
  const [category, setCategory] = useState<AnalyticsCategoryKey>("growth");
  const [viz, setViz] = useState<AnalyticsViz>("trend");

  const data = ANALYTICS_DATA[range];
  const values = data[category];
  const catCopy = CATEGORY_COPY[category];

  const categoryRows: Array<{ metric: string; value: string; delta: string; status: "ACTIVE" | "REVIEW" }> =
    category === "growth"
      ? [{ metric: "Searches", value: data.stats[1], delta: "+14.2%", status: "ACTIVE" }, { metric: "Profile views", value: "7,912", delta: "+9.7%", status: "ACTIVE" }, { metric: "Message starts", value: data.stats[2], delta: "+6.1%", status: "ACTIVE" }, { metric: "Verified supply", value: "672", delta: "+8.4%", status: "ACTIVE" }]
      : category === "conversion"
        ? [{ metric: "Profile to message", value: "18.8%", delta: "+2.4%", status: "ACTIVE" }, { metric: "Message to quote", value: "63%", delta: "+3.1%", status: "ACTIVE" }, { metric: "Quote acceptance", value: data.stats[3], delta: "-1.8%", status: "REVIEW" }, { metric: "Completion rate", value: "71%", delta: "+4.6%", status: "ACTIVE" }]
        : [{ metric: "GMV signal", value: data.stats[0], delta: "+11.8%", status: "ACTIVE" }, { metric: "MRR", value: "KES 46.8K", delta: "+5.6%", status: "ACTIVE" }, { metric: "Premium artisans", value: "312", delta: "+7.2%", status: "ACTIVE" }, { metric: "Failed renewals", value: "12", delta: "-3.4%", status: "REVIEW" }];

  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Marketplace analytics</p>
            <p className="mt-1 max-w-[720px] text-[13px]" style={{ color: COLORS.muted }}>Operational signal layer for supply, demand, quote conversion, revenue health, and subscription performance.</p>
          </div>
          <FluidPillTabs<AnalyticsRangeKey> id="admin-analytics-range" value={range} onChange={setRange} dense options={[{ id: "today", label: "Today" }, { id: "week", label: "Week" }, { id: "month", label: "Month" }, { id: "quarter", label: "Quarter" }]} />
        </div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: "GMV signal", value: data.stats[0], helper: `${data.helper} · cash-mode`, icon: TrendingUp }, { label: "Searches", value: data.stats[1], helper: "Discovery demand", icon: Search }, { label: "Quote requests", value: data.stats[2], helper: "Public to dashboard", icon: ReceiptText }, { label: "Conversion", value: data.stats[3], helper: "Quote accepted", icon: BarChart3 }].map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
            <div className="flex items-start justify-between gap-3"><p className="text-[13px] font-medium" style={{ color: COLORS.muted }}>{label}</p><span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: COLORS.surfaceSoft, color: COLORS.primary }}><Icon size={17} /></span></div>
            <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>{value}</p>
            <p className="mt-2 text-[13px]" style={{ color: COLORS.muted }}>{helper}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
        <div className="mb-4 flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: COLORS.hairlineSoft }}>
          <div>
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Analytics signal scope</p>
            <p className="mt-1 max-w-[720px] text-[13px]" style={{ color: COLORS.muted }}>This selector controls the chart and signal health cards below.</p>
          </div>
          <FluidPillTabs<AnalyticsCategoryKey> id="admin-analytics-category" value={category} onChange={setCategory} dense options={[{ id: "growth", label: "Growth" }, { id: "conversion", label: "Conversion" }, { id: "revenue", label: "Revenue" }]} />
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>{catCopy.title}</p>
                <p className="mt-1 max-w-[620px] text-[13px]" style={{ color: COLORS.muted }}>{catCopy.subtitle}</p>
              </div>
              <div className="flex shrink-0 justify-end self-start lg:self-center">
                <StableSegmentedTabs<AnalyticsViz> id="admin-analytics-viz" value={viz} onChange={setViz} size="compact" options={[{ id: "trend", label: "Line", icon: Activity }, { id: "bars", label: "Bar", icon: BarChart3 }, { id: "radial", label: "Radial", icon: Gauge }]} />
              </div>
            </div>
            <AdminAnalyticsVisualization type={viz} values={values} labels={data.labels} />
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[["Supply growth", "+8.4%", "Verified artisan base"], ["Demand growth", "+14.2%", "Search activity"], ["Quote velocity", "2.1h", "Median first response"]].map(([label, value, helper]) => (
                <div key={label as string} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                  <p className="text-[13px]" style={{ color: COLORS.muted }}>{label}</p>
                  <p className="mt-1 text-[18px] font-semibold" style={{ color: COLORS.ink }}>{value}</p>
                  <p className="mt-1 text-[12px]" style={{ color: COLORS.muted }}>{helper}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid content-start gap-3">
            <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>Signal health</p>
            {categoryRows.map((row) => (
              <div key={row.metric} className="flex items-center justify-between gap-3 rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
                <span>
                  <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{row.metric}</span>
                  <span className="block text-[13px]" style={{ color: COLORS.muted }}>{row.value}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: row.delta.startsWith("-") ? "#c2410c" : COLORS.primaryActive }}>{row.delta}</span>
                  <StatusChip status={row.status} />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Monitoring view
// ────────────────────────────────────────────────────────────────────────────

export function AdminMonitoringView() {
  const services = [
    { name: "API gateway", status: "operational", latency: "42ms", uptime: "99.98%", recent: "All healthy" },
    { name: "Database", status: "operational", latency: "8ms", uptime: "99.99%", recent: "Read replica healthy" },
    { name: "Search index", status: "degraded", latency: "312ms", uptime: "99.43%", recent: "Slow query warnings" },
    { name: "Payment processor", status: "operational", latency: "88ms", uptime: "99.97%", recent: "M-Pesa disabled (test mode)" },
    { name: "Notification worker", status: "review", latency: "—", uptime: "98.12%", recent: "Queue lag detected" },
    { name: "Image CDN", status: "operational", latency: "19ms", uptime: "100%", recent: "Cloudinary healthy" },
  ];
  const statusColor = (s: string) => s === "operational" ? COLORS.primary : s === "degraded" ? "#f59e0b" : "#dc2626";

  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Monitoring</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>System monitoring</h2>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Track API health, payment states, database readiness, and background jobs.</p>
        </div>
        <span className="rounded-full border px-3 py-1.5 text-[13px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>{services.filter((s) => s.status === "operational").length}/{services.length} operational</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => (
          <div key={svc.name} className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{svc.name}</p>
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${statusColor(svc.status)}18`, color: statusColor(svc.status) }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor(svc.status) }} />{svc.status}
              </span>
            </div>
            <div className="mt-3 flex gap-4 text-[13px]" style={{ color: COLORS.muted }}>
              <span>Latency: <strong style={{ color: COLORS.ink }}>{svc.latency}</strong></span>
              <span>Uptime: <strong style={{ color: COLORS.ink }}>{svc.uptime}</strong></span>
            </div>
            <p className="mt-2 text-[12px]" style={{ color: COLORS.muted }}>{svc.recent}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Locations view
// ────────────────────────────────────────────────────────────────────────────

const locationRows = [
  { id: "l1", city: "Nairobi", county: "Nairobi", artisans: 78, specialty: "Home repair specialists", status: "ACTIVE" as const },
  { id: "l2", city: "Kiambu", county: "Kiambu", artisans: 42, specialty: "Carpenters and masons", status: "ACTIVE" as const },
  { id: "l3", city: "Mombasa", county: "Mombasa", artisans: 31, specialty: "Cleaning and maintenance", status: "ACTIVE" as const },
  { id: "l4", city: "Nakuru", county: "Nakuru", artisans: 26, specialty: "Painters and finishers", status: "ACTIVE" as const },
  { id: "l5", city: "Machakos", county: "Machakos", artisans: 18, specialty: "Plumbers and electricians", status: "ACTIVE" as const },
  { id: "l6", city: "Kajiado", county: "Kajiado", artisans: 22, specialty: "Welders and fabricators", status: "ACTIVE" as const },
];

export function AdminLocationsView() {
  const total = locationRows.reduce((s, r) => s + r.artisans, 0);
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Locations</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Location coverage</h2>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Manage county and city coverage, artisan density, and local marketplace supply.</p>
        </div>
        <button className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}><Plus size={15} /> Add location</button>
      </div>
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        {[{ label: "Active cities", value: String(locationRows.length) }, { label: "Total artisans", value: String(total) }, { label: "Avg density", value: `${Math.round(total / locationRows.length)} per city` }].map(({ label, value }) => (
          <div key={label} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
            <p className="text-[13px] font-medium" style={{ color: COLORS.muted }}>{label}</p>
            <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[18px] border bg-white" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" style={{ color: COLORS.body }}>
            <thead><tr className="border-b text-left text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>{["City", "County", "Specialty", "Artisans", "Status", "Action"].map((h) => <th key={h} className="px-4 py-3" style={{ color: COLORS.ink }}>{h}</th>)}</tr></thead>
            <tbody>
              {locationRows.map((loc, i) => (
                <tr key={loc.id} className="border-t transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, background: i % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: COLORS.ink }}>{loc.city}</td>
                  <td className="px-4 py-3">{loc.county}</td>
                  <td className="px-4 py-3">{loc.specialty}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: COLORS.primaryActive }}><MapPinned size={13} /> {loc.artisans}</span></td>
                  <td className="px-4 py-3"><StatusChip status={loc.status} /></td>
                  <td className="px-4 py-3"><button type="button" className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Settings view
// ────────────────────────────────────────────────────────────────────────────

export function AdminSettingsView() {
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Settings</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Platform settings</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Configure platform controls, notifications, verification rules, and operational defaults.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[{ title: "Verification rules", body: "Configure document requirements, review SLAs, and approval criteria.", icon: FileCheck2 }, { title: "Commission rates", body: "Manage platform commission tiers for free and premium artisans.", icon: BarChart3 }, { title: "Notifications", body: "Configure email, SMS, and in-app notification triggers.", icon: Mail }, { title: "Feature flags", body: "Toggle marketplace features for gradual rollout and testing.", icon: Settings }, { title: "Moderation policy", body: "Update severity thresholds and auto-escalation rules.", icon: Shield }, { title: "System controls", body: "Database, search index, and background job operational controls.", icon: Hammer }].map(({ title, body, icon: Icon }) => (
          <div key={title} className="flex cursor-pointer items-start gap-4 rounded-[18px] border bg-white p-5 transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}><Icon size={18} /></span>
            <div>
              <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{title}</p>
              <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}


// ────────────────────────────────────────────────────────────────────────────
// Extended admin operations pages (source-aligned modular replacements)
// ────────────────────────────────────────────────────────────────────────────

export function AdminDatabaseView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · Database"
      title="Database operations"
      body="Inspect data health, table growth, storage pressure, and operational readiness without leaving the redesigned admin shell."
      actions={[{ label: "Refresh data", href: "/admin-dashboard/database" }, { label: "System health", href: "/admin-dashboard/system" }]}
      stats={[
        { label: "Tables tracked", value: 18, subtext: "Core marketplace entities", icon: Activity },
        { label: "Storage health", value: "96%", subtext: "Within safe operating range", icon: Gauge },
        { label: "Query latency", value: "42ms", subtext: "Median API read path", icon: TrendingUp },
        { label: "Backups", value: "Healthy", subtext: "Latest snapshot verified", icon: FileCheck2 },
      ]}
      items={[
        { title: "User and role tables", body: "Users, profiles, admin roles, client accounts, and artisan onboarding records." },
        { title: "Marketplace entities", body: "Jobs, quotes, conversations, reviews, saved artisans, and portfolio projects." },
        { title: "Financial records", body: "Subscriptions, payments, payouts, commission entries, and reconciliation state." },
        { title: "Operational audit trail", body: "Admin activity logs, moderation decisions, system events, and notification records." },
        { title: "Location coverage", body: "Counties, cities, service areas, and artisan supply density." },
        { title: "Maintenance queue", body: "Indexes, stale records, retention policy checks, and consistency scans." },
      ]}
    />
  );
}

export function AdminEarningsView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · Earnings"
      title="Marketplace earnings"
      body="Track gross marketplace volume, platform commission, artisan net earnings, and daily revenue movement."
      actions={[{ label: "Open analytics", href: "/admin-dashboard/analytics" }, { label: "Payouts", href: "/admin-dashboard/payouts" }]}
      stats={[
        { label: "Gross volume", value: "KES 1.84M", subtext: "+18% this month", icon: ReceiptText },
        { label: "Platform commission", value: "KES 184K", subtext: "Blended 8.1% rate", icon: BarChart3 },
        { label: "Artisan net", value: "KES 1.65M", subtext: "After commission", icon: Hammer },
        { label: "Failed payouts", value: 5, subtext: "Needs review", icon: Flag },
      ]}
      items={[
        { title: "Daily earnings trend", body: "Source preview uses compact operational cards and admin charting for selected time ranges." },
        { title: "Commission tiers", body: "Separate free and premium artisan commission rates with visible admin controls." },
        { title: "Top earning artisans", body: "Rank artisans by completed jobs, gross amount, commission, and payout readiness." },
        { title: "Revenue exceptions", body: "Surface failed, disputed, reversed, or partially reconciled payment records." },
        { title: "Subscription impact", body: "Correlate premium subscription status with placement, completed jobs, and commission." },
        { title: "Export workflow", body: "Prepare CSV reporting for finance and operations review." },
      ]}
    />
  );
}

export function AdminPayoutsView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · Payouts"
      title="Payout control center"
      body="Review artisan payout batches, failed transfers, retry actions, and manual review queues in the redesigned admin system."
      actions={[{ label: "Review queue", href: "/admin-dashboard/payouts" }, { label: "Earnings", href: "/admin-dashboard/earnings" }]}
      stats={[
        { label: "Pending payout", value: "KES 438K", subtext: "27 artisan payouts", icon: ReceiptText },
        { label: "Processing", value: 12, subtext: "Sent to provider", icon: Activity },
        { label: "Manual review", value: 5, subtext: "Requires action", icon: Flag },
        { label: "Completed", value: "KES 2.1M", subtext: "This month", icon: FileCheck2 },
      ]}
      items={[
        { title: "Retry failed payout", body: "Use controlled retry state for temporary provider or phone validation failures." },
        { title: "Cancel payout", body: "Stop unsafe transfers and leave a clear admin audit note." },
        { title: "Mark complete", body: "Resolve externally confirmed payout state after finance verification." },
        { title: "Add notes", body: "Attach internal context for compliance, support, and finance teams." },
        { title: "Provider status", body: "Expose pending, processing, completed, failed, and cancelled payout states." },
        { title: "Artisan identity", body: "Keep artisan name, phone, amount, and date visible in every row." },
      ]}
    />
  );
}

export function AdminReportsView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · Reports"
      title="Report generation"
      body="Generate operational exports for users, artisans, reviews, subscriptions, payments, and platform activity."
      actions={[{ label: "Generate overview", href: "/admin-dashboard/reports" }, { label: "Analytics", href: "/admin-dashboard/analytics" }]}
      stats={[
        { label: "Report types", value: 7, subtext: "Overview, users, artisans, reviews, subscriptions, payments, activity", icon: FileCheck2 },
        { label: "Records ready", value: "12.4K", subtext: "Across admin datasets", icon: Activity },
        { label: "CSV exports", value: "Enabled", subtext: "Finance-friendly format", icon: BarChart3 },
        { label: "Latest report", value: "Today", subtext: "Generated in preview", icon: CalendarDays },
      ]}
      items={[
        { title: "Overview report", body: "Platform summary, growth movement, revenue, and trust operations." },
        { title: "Users report", body: "Client, artisan, and admin account records with status details." },
        { title: "Artisans report", body: "Verification, availability, subscription, portfolio, and review data." },
        { title: "Payments report", body: "Job payments, subscription revenue, payouts, and reconciliation status." },
        { title: "Reviews report", body: "Ratings, moderation flags, disputes, and customer feedback quality." },
        { title: "Activity report", body: "Admin actions, system events, and audit-ready operational notes." },
      ]}
    />
  );
}

export function AdminSearchView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · Search"
      title="Global admin search"
      body="Search across users, artisans, jobs, settings, activity, and operational records with source-aligned quick actions."
      actions={[{ label: "Search users", href: "/admin-dashboard/search" }, { label: "Browse artisans", href: "/admin-dashboard/artisans" }]}
      stats={[
        { label: "Search domains", value: 5, subtext: "Users, artisans, jobs, settings, activity", icon: Search },
        { label: "Verified artisans", value: 428, subtext: "Quick search preset", icon: BadgeCheck },
        { label: "Recent activity", value: "Live", subtext: "Audit log indexed", icon: Activity },
        { label: "Trending", value: "Nairobi", subtext: "High-intent query cluster", icon: TrendingUp },
      ]}
      items={[
        { title: "Verified artisans", body: "Find profiles by name, profession, county, verification status, or subscription." },
        { title: "Recent activities", body: "Jump into admin audit events, moderation decisions, and invite actions." },
        { title: "System settings", body: "Locate configurable platform controls quickly." },
        { title: "Trending marketplace data", body: "Expose high-demand professions, locations, and client request clusters." },
        { title: "Status filtering", body: "Filter by active, pending, rejected, suspended, or verified records." },
        { title: "Cross-linking", body: "Move directly from a search result to the relevant admin detail surface." },
      ]}
    />
  );
}

export function AdminSubscriptionsView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · Subscriptions"
      title="Subscription management"
      body="Monitor artisan plans, premium visibility, renewal state, subscription revenue, and churn risk."
      actions={[{ label: "Review plans", href: "/admin-dashboard/subscriptions" }, { label: "Earnings", href: "/admin-dashboard/earnings" }]}
      stats={[
        { label: "Active plans", value: 162, subtext: "Premium artisans", icon: CreditCard },
        { label: "MRR", value: "KES 243K", subtext: "+12% monthly", icon: BarChart3 },
        { label: "Past due", value: 8, subtext: "Payment attention", icon: Flag },
        { label: "Conversion", value: "34%", subtext: "Verified to paid", icon: TrendingUp },
      ]}
      items={[
        { title: "Plan distribution", body: "Separate monthly, annual, trial, cancelled, and free artisan records." },
        { title: "Premium placement", body: "Confirm premium badge, priority search status, portfolio limits, and commission rate." },
        { title: "Renewal risk", body: "Identify past-due subscriptions and artisan accounts losing benefits." },
        { title: "Revenue summary", body: "Connect subscription payments to admin earnings and finance reports." },
        { title: "User identity", body: "Show email, artisan name, current plan, status, and renewal date." },
        { title: "Plan actions", body: "Prepare detail views for plan review, support, and billing follow-up." },
      ]}
    />
  );
}

export function AdminSystemView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · System"
      title="System health"
      body="Monitor platform infrastructure, job workers, API services, storage, and operational alerts in the source dashboard style."
      actions={[{ label: "Refresh health", href: "/admin-dashboard/system" }, { label: "Monitoring", href: "/admin-dashboard/monitoring" }]}
      stats={[
        { label: "API health", value: "Healthy", subtext: "All critical routes responding", icon: Activity },
        { label: "Workers", value: "4/4", subtext: "Background jobs online", icon: Gauge },
        { label: "Storage", value: "71%", subtext: "Below warning threshold", icon: BarChart3 },
        { label: "Alerts", value: 2, subtext: "Non-critical warnings", icon: Flag },
      ]}
      items={[
        { title: "API services", body: "Track auth, user sync, payment, upload, search, and notification endpoints." },
        { title: "Background jobs", body: "Monitor payout processing, subscription checks, notifications, and cleanup tasks." },
        { title: "Infrastructure capacity", body: "Expose storage, CPU, memory, and queue pressure as admin-ready signals." },
        { title: "Log stream", body: "Show info, warning, and error activity with clear severity treatment." },
        { title: "Incident readiness", body: "Keep support and engineering actions close to the health overview." },
        { title: "Data dependency status", body: "Connect system health to database, analytics, and monitoring pages." },
      ]}
    />
  );
}

export function AdminHelpView() {
  return (
    <SimpleDashboardView
      eyebrow="Admin · Help"
      title="Help and support"
      body="Provide administrators with documentation, escalation paths, tutorials, and support contact cards in the redesigned shell."
      actions={[{ label: "Contact support", href: "/admin-dashboard/help" }, { label: "System health", href: "/admin-dashboard/system" }]}
      stats={[
        { label: "Guides", value: 12, subtext: "Admin playbooks", icon: FileCheck2 },
        { label: "Tutorials", value: 8, subtext: "Workflow walkthroughs", icon: Sparkles },
        { label: "Support SLA", value: "2h", subtext: "Priority admin response", icon: Activity },
        { label: "Open tickets", value: 3, subtext: "Needs triage", icon: Mail },
      ]}
      items={[
        { title: "Admin guide", body: "Complete overview of verification, moderation, users, invites, and analytics." },
        { title: "Payment operations", body: "How to interpret job payments, subscriptions, commissions, and payouts." },
        { title: "Trust and safety", body: "Escalation guidance for profile flags, review abuse, and reported content." },
        { title: "System operations", body: "Monitoring, health checks, maintenance windows, and incident playbooks." },
        { title: "Contact channels", body: "Support email, phone escalation, engineering handoff, and finance review paths." },
        { title: "Release notes", body: "Track admin console changes and rollout notes for operational teams." },
      ]}
    />
  );
}
