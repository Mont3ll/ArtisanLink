"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChevronRight,
  CreditCard,
  FileCheck2,
  Flag,
  Gauge,
  Hammer,
  Mail,
  MapPinned,
  Send,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";

import { StatusChip } from "@/components/ui2";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

// ─── Shared: inline sparkline SVG ─────────────────────────────────────────────

function Sparkline({ values, color = COLORS.primary }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 260; const h = 56;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => i === values.length - 1 && (
        <circle key={i} cx={i * step} cy={h - ((v - min) / range) * h} r={3} fill={color} />
      ))}
    </svg>
  );
}

// ─── Overview ──────────────────────────────────────────────────────────────────

export function AdminOverviewView() {
  const router = useRouter();
  const actions = [
    { label: "Review queue", icon: FileCheck2, href: "/admin-dashboard/verification", primary: true },
    { label: "Moderation", icon: Flag, href: "/admin-dashboard/moderation" },
    { label: "Invites", icon: Send, href: "/admin-dashboard/invites" },
    { label: "Health", icon: Gauge, href: "/admin-dashboard/monitoring" },
  ];
  return (
    <main className="p-5 md:p-6">
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
          <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Admin command center</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>High-priority operational work across verification, moderation, subscriptions, invites, and system health.</p>
              </div>
              <StatusChip status="ACTIVE" />
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map(({ label, icon: Icon, href, primary }) => (
                <button key={label} onClick={() => router.push(href)}
                  className="group inline-flex h-9 min-w-fit items-center gap-2 rounded-full border px-3 text-left transition-transform hover:-translate-y-0.5"
                  style={primary ? { borderColor: COLORS.primary, background: COLORS.primary, boxShadow: SHADOWS.soft } : { borderColor: COLORS.hairlineSoft, color: COLORS.ink, background: COLORS.canvas, boxShadow: SHADOWS.soft }}
                >
                  <Icon size={14} className="shrink-0" style={{ color: primary ? COLORS.canvas : COLORS.primary }} />
                  <span className="whitespace-nowrap text-[12px] font-semibold leading-none" style={{ color: primary ? COLORS.canvas : COLORS.ink }}>{label}</span>
                  <ChevronRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: primary ? COLORS.canvas : COLORS.muted }} />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: COLORS.hairlineSoft }}>
              <div>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Operational trend</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>Verification, moderation, invite, and system-health pressure this week.</p>
              </div>
              <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>7 day view</span>
            </div>
            <div className="mb-3 flex items-end justify-between gap-2 text-[12px]" style={{ color: COLORS.mutedSoft }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <span key={d}>{d}</span>)}
            </div>
            <Sparkline values={[31, 42, 38, 54, 47, 63, 58]} />
          </div>

          <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Recent admin activity</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>Latest operational events that need visibility.</p>
              </div>
              <Activity size={18} style={{ color: COLORS.primary }} />
            </div>
            <div className="grid gap-2">
              {[["Verification submitted", "Grace Wanjiku uploaded trade evidence.", "12m", "/admin-dashboard/verification"], ["Moderation flag opened", "Abusive message report assigned to safety.", "38m", "/admin-dashboard/moderation"], ["Subscription renewal failed", "Premium artisan renewal needs retry.", "2h", "/admin-dashboard/settings"], ["Search index refreshed", "Location coverage index completed.", "4h", "/admin-dashboard/locations"]].map(([title, body, time, href], index) => (
                <button key={title as string} onClick={() => router.push(href as string)} className="grid cursor-pointer grid-cols-[10px_1fr_auto] gap-3 rounded-[14px] p-3 text-left transition-colors hover:bg-[#f7f7f7]">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full" style={{ background: index === 0 ? COLORS.primary : COLORS.hairline }} />
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

        <aside className="grid gap-5">
          <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Verification queue</p>
              <span className="rounded-full px-2 py-1 text-[11px] font-semibold text-white" style={{ background: COLORS.primary }}>19</span>
            </div>
            <div className="grid gap-2">
              {[["Grace Wanjiku", "Carpenter · Kiambu", "PENDING"], ["Samuel Kiptoo", "Handyman · Nakuru", "REVIEW"], ["Amina Hassan", "Painter · Westlands", "PENDING"]].map(([name, meta, status]) => (
                <button key={name as string} onClick={() => router.push("/admin-dashboard/verification")} className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] p-3 transition-colors hover:bg-[#f7f7f7]" style={{ background: COLORS.surfaceSoft }}>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{name}</span>
                    <span className="block text-[13px]" style={{ color: COLORS.muted }}>{meta}</span>
                  </span>
                  <StatusChip status={status as "PENDING" | "REVIEW"} />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

// ─── Verification ─────────────────────────────────────────────────────────────

export function AdminVerificationView() {
  const router = useRouter();
  const queue = [
    { id: "v1", name: "Grace Wanjiku", profession: "Carpenter", county: "Kiambu", status: "PENDING" as const, docs: "ID + Trade certificate", submitted: "Today" },
    { id: "v2", name: "Samuel Kiptoo", profession: "Handyman", county: "Nakuru", status: "REVIEW" as const, docs: "ID submitted, missing certificate", submitted: "Yesterday" },
    { id: "v3", name: "Amina Hassan", profession: "Painter", county: "Nairobi", status: "PENDING" as const, docs: "Full documents submitted", submitted: "2 days ago" },
    { id: "v4", name: "Joseph Njoroge", profession: "Welder", county: "Nairobi", status: "REVIEW" as const, docs: "ID only, pending trade evidence", submitted: "3 days ago" },
  ];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Verification</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Verification queue</h2>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Review artisan identities, certificates, and skill evidence before public visibility.</p>
        </div>
        <span className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white" style={{ background: COLORS.primary }}>{queue.length} pending</span>
      </div>
      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="grid gap-3">
          {queue.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-[14px] border p-4 md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{item.name}</span>
                  <StatusChip status={item.status} />
                </div>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{item.profession} · {item.county} · Submitted {item.submitted}</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.body }}>{item.docs}</p>
              </div>
              <div className="flex gap-2">
                <button className="h-9 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>Approve</button>
                <button className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Reject</button>
                <button className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Inspect</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Artisans ─────────────────────────────────────────────────────────────────

export function AdminArtisansView() {
  const artisans = [
    { id: "a1", name: "Peter Mwangi", profession: "Plumber", county: "Nairobi", status: "ACTIVE" as const, rating: 4.9, jobs: 82 },
    { id: "a2", name: "Grace Wanjiku", profession: "Carpenter", county: "Kiambu", status: "ACTIVE" as const, rating: 4.8, jobs: 64 },
    { id: "a3", name: "Samuel Kiptoo", profession: "Handyman", county: "Nakuru", status: "PENDING" as const, rating: 4.7, jobs: 34 },
    { id: "a4", name: "Mercy Achieng", profession: "Cleaner", county: "Mombasa", status: "REVIEW" as const, rating: 4.6, jobs: 28 },
  ];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Artisans</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Artisan management</h2>
      </div>
      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="grid gap-2">
          {artisans.map((a, index) => (
            <div key={a.id} className="grid gap-3 rounded-[14px] border p-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft, background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
              <div>
                <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{a.name}</span>
                <span className="block text-[13px]" style={{ color: COLORS.muted }}>{a.profession} · {a.county}</span>
              </div>
              <span className="text-[13px]" style={{ color: COLORS.muted }}>★ {a.rating} · {a.jobs} jobs</span>
              <StatusChip status={a.status} />
              <div className="flex gap-2">
                <button className="h-8 cursor-pointer rounded-lg border px-2.5 text-[12px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>View</button>
                <button className="h-8 cursor-pointer rounded-lg border px-2.5 text-[12px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Suspend</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export function AdminUsersView() {
  const users = [
    { id: "u1", name: "Miriam Otieno", role: "Client", status: "ACTIVE" as const, meta: "17 jobs · Nairobi", risk: "Low" },
    { id: "u2", name: "Peter Mwangi", role: "Artisan", status: "ACTIVE" as const, meta: "4.9 rating · Plumber", risk: "Low" },
    { id: "u3", name: "Suspicious Account", role: "Client", status: "REVIEW" as const, meta: "Flagged by moderation", risk: "High" },
  ];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Users</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>User management</h2>
      </div>
      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="grid gap-2">
          {users.map((u, index) => (
            <div key={u.id} className="grid gap-3 rounded-[14px] border p-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft, background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
              <div>
                <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{u.name}</span>
                <span className="block text-[13px]" style={{ color: COLORS.muted }}>{u.role} · {u.meta}</span>
              </div>
              <span className={`text-[12px] font-semibold rounded-full px-2 py-0.5`} style={{ background: u.risk === "High" ? "#fef2f2" : COLORS.primaryTint, color: u.risk === "High" ? "#dc2626" : COLORS.primaryActive }}>{u.risk} risk</span>
              <StatusChip status={u.status} />
              <div className="flex gap-2">
                <button className="h-8 cursor-pointer rounded-lg border px-2.5 text-[12px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>View</button>
                <button className="h-8 cursor-pointer rounded-lg border px-2.5 text-[12px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Ban</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export function AdminInvitesView() {
  const invites = [
    { id: "i1", email: "jane.artisan@example.com", role: "Artisan", status: "PENDING" as const, sent: "Today" },
    { id: "i2", email: "kamau.builder@example.com", role: "Artisan", status: "ACTIVE" as const, sent: "Yesterday" },
    { id: "i3", email: "old.invite@example.com", role: "Artisan", status: "COMPLETED" as const, sent: "Expired" },
  ];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Invites</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Invite management</h2>
        </div>
        <button className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>
          <Mail size={15} /> Create invite
        </button>
      </div>
      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="grid gap-2">
          {invites.map((inv) => (
            <div key={inv.id} className="grid gap-3 rounded-[14px] border p-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft }}>
              <span className="text-[14px]" style={{ color: COLORS.ink }}>{inv.email}</span>
              <span className="text-[13px]" style={{ color: COLORS.muted }}>{inv.role}</span>
              <StatusChip status={inv.status} />
              <div className="flex gap-2">
                <button className="h-8 cursor-pointer rounded-lg border px-2.5 text-[12px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Revoke</button>
                <button className="h-8 cursor-pointer rounded-lg border px-2.5 text-[12px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Resend</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Moderation ────────────────────────────────────────────────────────────────

export function AdminModerationView() {
  const items = [
    { id: "m1", title: "Low quality portfolio", body: "A project image appears duplicated across two unrelated artisans.", status: "REVIEW" as const, severity: "Low", target: "Portfolio project" },
    { id: "m2", title: "User report", body: "Client reported abusive language in a conversation thread.", status: "PENDING" as const, severity: "High", target: "Conversation thread" },
    { id: "m3", title: "Suspicious account", body: "Repeated invite abuse and unusual signup velocity detected.", status: "REVIEW" as const, severity: "Medium", target: "Account" },
    { id: "m4", title: "Listing policy mismatch", body: "Profile advertises restricted payment terms outside testing policy.", status: "PENDING" as const, severity: "Medium", target: "Artisan listing" },
  ];
  const severityColor = (s: string) => s === "High" ? "#dc2626" : s === "Medium" ? "#f59e0b" : "#059669";
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Moderation</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Moderation queue</h2>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{item.title}</span>
                  <StatusChip status={item.status} />
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "#f2f2f2", color: severityColor(item.severity) }}>{item.severity}</span>
                </div>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{item.target}</p>
                <p className="mt-2 text-[14px]" style={{ color: COLORS.body }}>{item.body}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="h-9 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>Resolve</button>
              <button className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Escalate</button>
              <button className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export function AdminAnalyticsView() {
  const weekly = [120, 145, 138, 172, 164, 191, 184];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Analytics</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Analytics</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[["Total artisans", "248", "+12 this week"], ["Active clients", "1,420", "+34 this week"], ["Jobs completed", "3,841", "This month"], ["Revenue", "KES 184K", "MRR"]].map(([label, value, helper]) => (
          <div key={label as string} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
            <p className="text-[13px] font-medium" style={{ color: COLORS.muted }}>{label}</p>
            <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>{value}</p>
            <p className="mt-2 text-[13px]" style={{ color: COLORS.muted }}>{helper}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {[{ title: "Job completions", data: weekly, color: COLORS.primary }, { title: "New registrations", data: [18, 24, 22, 31, 28, 36, 33], color: "#3b82f6" }].map(({ title, data, color }) => (
          <div key={title} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <p className="mb-3 text-[15px] font-semibold" style={{ color: COLORS.ink }}>{title}</p>
            <div className="mb-2 flex items-end justify-between text-[11px]" style={{ color: COLORS.mutedSoft }}>
              {labels.map((l) => <span key={l}>{l}</span>)}
            </div>
            <Sparkline values={data} color={color} />
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Monitoring ────────────────────────────────────────────────────────────────

export function AdminMonitoringView() {
  const services = [
    { name: "API gateway", status: "operational", latency: "42ms", uptime: "99.98%" },
    { name: "Database", status: "operational", latency: "8ms", uptime: "99.99%" },
    { name: "Search index", status: "degraded", latency: "312ms", uptime: "99.43%" },
    { name: "Payment processor", status: "operational", latency: "88ms", uptime: "99.97%" },
    { name: "Notification worker", status: "review", latency: "—", uptime: "98.12%" },
    { name: "Image CDN", status: "operational", latency: "19ms", uptime: "100%" },
  ];
  const statusColor = (s: string) => s === "operational" ? COLORS.primary : s === "degraded" ? "#f59e0b" : "#dc2626";
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Monitoring</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>System monitoring</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => (
          <div key={svc.name} className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{svc.name}</p>
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${statusColor(svc.status)}18`, color: statusColor(svc.status) }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor(svc.status) }} />
                {svc.status}
              </span>
            </div>
            <div className="mt-3 flex gap-4 text-[13px]" style={{ color: COLORS.muted }}>
              <span>Latency: <strong style={{ color: COLORS.ink }}>{svc.latency}</strong></span>
              <span>Uptime: <strong style={{ color: COLORS.ink }}>{svc.uptime}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Locations ─────────────────────────────────────────────────────────────────

export function AdminLocationsView() {
  const locations = [
    { city: "Nairobi", county: "Nairobi", artisans: 78, specialty: "Home repair specialists", status: "ACTIVE" as const },
    { city: "Kiambu", county: "Kiambu", artisans: 42, specialty: "Carpenters and masons", status: "ACTIVE" as const },
    { city: "Mombasa", county: "Mombasa", artisans: 31, specialty: "Cleaning and maintenance", status: "ACTIVE" as const },
    { city: "Nakuru", county: "Nakuru", artisans: 26, specialty: "Painters and finishers", status: "ACTIVE" as const },
    { city: "Machakos", county: "Machakos", artisans: 18, specialty: "Plumbers and electricians", status: "ACTIVE" as const },
    { city: "Kajiado", county: "Kajiado", artisans: 22, specialty: "Welders and fabricators", status: "ACTIVE" as const },
  ];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Locations</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Location coverage</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Manage county and city coverage, artisan density, and local marketplace supply.</p>
      </div>
      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="grid gap-2">
          {locations.map((loc, index) => (
            <div key={loc.city} className="grid gap-3 rounded-[14px] border p-3 md:grid-cols-[1fr_auto_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft, background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
              <div>
                <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{loc.city}</span>
                <span className="block text-[13px]" style={{ color: COLORS.muted }}>{loc.county} · {loc.specialty}</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>
                <MapPinned size={12} /> {loc.artisans} artisans
              </span>
              <StatusChip status={loc.status} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function AdminSettingsView() {
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Admin · Settings</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Platform settings</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Configure platform controls, notifications, verification rules, and operational defaults.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[{ title: "Verification rules", body: "Configure document requirements, review SLAs, and approval criteria.", icon: FileCheck2 }, { title: "Commission rates", body: "Manage platform commission tiers for free and premium artisans.", icon: BarChart3 }, { title: "Notifications", body: "Configure email, SMS, and in-app notification triggers.", icon: Mail }, { title: "Feature flags", body: "Toggle marketplace features for gradual rollout.", icon: Settings }, { title: "Moderation policy", body: "Update severity thresholds and auto-escalation rules.", icon: Shield }, { title: "System admin", body: "Database, search index, and background job controls.", icon: Hammer }].map(({ title, body, icon: Icon }) => (
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
