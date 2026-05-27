"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  FileCheck2,
  MessageCircle,
  Plus,
  ReceiptText,
  Settings,
  X,
} from "lucide-react";

import { StatusChip } from "@/components/ui2";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

type Stats = {
  pending?: number;
  active?: number;
  quoted?: number;
  unreadMessages?: number;
  portfolioViews?: number;
};

type Job = {
  id: string;
  title: string;
  client: string;
  location: string;
  status: "PENDING" | "ACTIVE" | "QUOTED" | "ACCEPTED" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS" | "REJECTED";
};

export function ArtisanOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [verificationDismissed, setVerificationDismissed] = useState(false);
  const [profileDismissed, setProfileDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      fetch("/api/artisan/stats").then((r) => (r.ok ? r.json() : {})),
      fetch("/api/artisan/jobs?limit=4").then((r) => (r.ok ? r.json() : {})),
    ]).then(([statsRes, jobsRes]) => {
      if (cancelled) return;
      const s = statsRes.status === "fulfilled" ? (statsRes.value as Record<string, unknown>) : {};
      const j = jobsRes.status === "fulfilled" ? (jobsRes.value as Record<string, unknown>) : {};
      const toNum = (v: unknown, fallback: number) => typeof v === "number" ? v : fallback;
      setStats({
        pending: toNum(s.pendingJobs ?? s.pending, 2),
        active: toNum(s.activeJobs ?? s.active, 3),
        quoted: toNum(s.quotedJobs ?? s.quoted, 1),
        unreadMessages: toNum(s.unreadMessages, 14),
        portfolioViews: toNum(s.portfolioViews, 486),
      });
      const raw = (Array.isArray(j.jobs) ? j.jobs : Array.isArray(j.data) ? j.data : []) as Job[];
      if (raw.length) setJobs(raw.slice(0, 4));
    });
    return () => { cancelled = true; };
  }, []);

  // Fallback mock jobs if API returns none
  const displayJobs: Job[] = jobs.length ? jobs : [
    { id: "j1", title: "Kitchen sink repair", client: "Miriam Njeri", location: "Kilimani", status: "ACTIVE" },
    { id: "j2", title: "Cabinet handle install", client: "David Kamau", location: "Westlands", status: "QUOTED" },
    { id: "j3", title: "Drainage blockage fix", client: "Ann Wairimu", location: "Ruiru", status: "PENDING" },
    { id: "j4", title: "Bathroom tile repair", client: "Peter Mwangi", location: "Rongai", status: "ACCEPTED" },
  ];

  const pending = stats.pending ?? 2;
  const active = stats.active ?? 3;
  const quoted = stats.quoted ?? 1;

  return (
    <main className="p-5 md:p-6">
      {/* Banners */}
      <div className="mb-6 grid gap-3">
        {!verificationDismissed && (
          <div className="flex flex-col gap-3 rounded-[18px] border p-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white" style={{ color: "#92400e" }}><FileCheck2 size={18} /></span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-[1.29]" style={{ color: "#92400e" }}>Verification review pending</span>
                <span className="mt-1 block text-[13px] leading-[1.23]" style={{ color: COLORS.body }}>Complete review before public search visibility. Upload ID, certificates, and skill evidence.</span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
              <button onClick={() => router.push("/artisan-dashboard/settings")} className="h-10 w-fit cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: "#fcd34d", color: COLORS.ink }}>Review documents</button>
              <button onClick={() => setVerificationDismissed(true)} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: "#fcd34d", color: "#92400e" }} aria-label="Dismiss"><X size={16} /></button>
            </div>
          </div>
        )}
        {!profileDismissed && (
          <div className="flex flex-col gap-3 rounded-[18px] border p-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white" style={{ color: COLORS.primary }}><CheckCircle2 size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold leading-[1.29]" style={{ color: COLORS.primaryActive }}>Profile is 82% complete</span>
                <span className="mt-1 block text-[13px] leading-[1.23]" style={{ color: COLORS.body }}>Add portfolio work, map coordinates, and verification evidence to reach 100%.</span>
                <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white"><span className="block h-full w-[82%] rounded-full" style={{ background: COLORS.primary }} /></span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
              <button onClick={() => router.push("/artisan-dashboard/portfolio")} className="h-10 w-fit cursor-pointer rounded-lg bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ color: COLORS.primaryActive }}>Improve profile</button>
              <button onClick={() => setProfileDismissed(true)} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.primarySoft, color: COLORS.primaryActive }} aria-label="Dismiss"><X size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open opportunities", value: String(pending), helper: "Need quote or response", icon: ReceiptText },
          { label: "Active jobs", value: String(active), helper: `${quoted} quoted`, icon: ClipboardList },
          { label: "Unread messages", value: String(stats.unreadMessages ?? 14), helper: "Respond today", icon: MessageCircle },
          { label: "Portfolio views", value: String(stats.portfolioViews ?? 486), helper: "Last 30 days", icon: Eye },
        ].map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-medium leading-[1.23]" style={{ color: COLORS.muted }}>{label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: COLORS.surfaceSoft, color: COLORS.primary }}><Icon size={17} /></span>
            </div>
            <p className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.04em]" style={{ color: COLORS.ink }}>{value}</p>
            <p className="mt-2 text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>{helper}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Add job", body: "Create standalone work.", icon: Plus, primary: true, href: "/artisan-dashboard/jobs" },
          { label: "Generate quote", body: "Open quote workflow.", icon: ReceiptText, primary: false, href: "/artisan-dashboard/jobs" },
          { label: "Reply", body: "Open conversations.", icon: MessageCircle, primary: false, href: "/artisan-dashboard/messages" },
          { label: "Availability", body: "Update settings.", icon: Settings, primary: false, href: "/artisan-dashboard/settings" },
        ].map(({ label, body, icon: Icon, primary, href }) => (
          <button key={label} onClick={() => router.push(href)}
            className="group flex items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition-transform hover:-translate-y-0.5"
            style={primary ? { borderColor: COLORS.primary, background: COLORS.primary, color: COLORS.canvas, boxShadow: SHADOWS.soft } : { borderColor: COLORS.hairlineSoft, background: COLORS.canvas, color: COLORS.ink, boxShadow: SHADOWS.soft }}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={primary ? { background: "rgba(255,255,255,0.18)", color: COLORS.canvas } : { background: COLORS.primaryTint, color: COLORS.primary }}>
              <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold leading-[1.29]">{label}</span>
              <span className="mt-0.5 block truncate text-[12px] leading-[1.33]" style={{ color: primary ? "rgba(255,255,255,0.82)" : COLORS.muted }}>{body}</span>
            </span>
            <ChevronRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          {/* Recent jobs */}
          <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Recent jobs</p>
                <p className="text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>Active work, pending quotes, and client requests.</p>
              </div>
              <button onClick={() => router.push("/artisan-dashboard/jobs")} className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>View all</button>
            </div>
            <div className="grid gap-2">
              {displayJobs.map((job, index) => (
                <div key={job.id} className="grid gap-3 rounded-[14px] border p-3 transition-colors hover:bg-[#f7f7f7] md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft, background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                  <div className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold leading-[1.29]" style={{ color: COLORS.ink }}>{job.title}</span>
                    <span className="mt-1 block truncate text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>{job.client} · {job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-self-start md:justify-self-end">
                    <StatusChip status={job.status} />
                    <button onClick={() => router.push(`/artisan-dashboard/jobs`)} className="h-9 cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Quick view</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote pipeline + Upcoming */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Quote pipeline</p>
                <ReceiptText size={18} style={{ color: COLORS.primary }} />
              </div>
              <div className="grid gap-3">
                {[["Requests needing quote", String(pending), "Create itemized quote"], ["Quotes awaiting client", String(quoted), "Follow up in messages"], ["Accepted ready to start", "1", "Start job from thread"]].map(([label, value, helper]) => (
                  <button key={label} onClick={() => router.push("/artisan-dashboard/messages")} className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{label}</span>
                      <span className="mt-1 block text-[13px]" style={{ color: COLORS.muted }}>{helper}</span>
                    </span>
                    <span className="grid h-9 min-w-9 place-items-center rounded-full px-2 text-[13px] font-semibold text-white" style={{ background: COLORS.primary }}>{value}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Upcoming commitments</p>
                <CalendarDays size={18} style={{ color: COLORS.primary }} />
              </div>
              <div className="grid gap-2">
                {[["Tomorrow", "Kitchen sink repair", "Kilimani · 9:00 AM"], ["Thu", "Cabinet handle install", "Westlands · 2:00 PM"], ["Fri", "Tile repair inspection", "Ruiru · Pending confirmation"]].map(([day, title, meta]) => (
                  <div key={title} className="grid grid-cols-[52px_1fr] gap-3 rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                    <span className="rounded-full bg-white px-2 py-1 text-center text-[12px] font-semibold" style={{ color: COLORS.primaryActive }}>{day}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold" style={{ color: COLORS.ink }}>{title}</span>
                      <span className="mt-1 block truncate text-[13px]" style={{ color: COLORS.muted }}>{meta}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Aside: Recent activity */}
        <aside className="grid gap-5">
          <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Recent activity</p>
                <p className="mt-1 text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>Latest client and marketplace events.</p>
              </div>
              <Activity size={18} style={{ color: COLORS.primary }} />
            </div>
            <div className="grid gap-3">
              {[["Quote viewed", "Miriam opened quote v1", "12m"], ["New message", "David asked about timing", "38m"], ["Portfolio view spike", "Cabinet refit gained 18 views", "2h"], ["Saved by client", "New client saved your profile", "1d"]].map(([label, body, time], index) => (
                <div key={label} className="grid grid-cols-[10px_1fr_auto] gap-3 rounded-[14px] p-2" style={{ background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                  <span className="mt-2 h-2.5 w-2.5 rounded-full" style={{ background: index === 0 ? COLORS.primary : COLORS.hairline }} />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-[1.29]" style={{ color: COLORS.ink }}>{label}</span>
                    <span className="mt-0.5 block text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>{body}</span>
                  </span>
                  <span className="shrink-0 text-[12px]" style={{ color: COLORS.mutedSoft }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
