"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Search,
  Star,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { StatusChip } from "@/components/ui2";
import { ArtisanPreviewCard } from "@/components/landing/artisan-preview-card";
import type { ArtisanCardData } from "@/components/landing/artisan-preview-card";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

// Shared mock jobs ─────────────────────────────────────────────────────────────

const mockClientJobs = [
  { id: "c1", title: "Kitchen sink repair", artisan: "Peter Mwangi", location: "Kilimani", status: "ACTIVE" as const, quote: "KES 4,500" },
  { id: "c2", title: "Cabinet handle install", artisan: "Grace Wanjiku", location: "Westlands", status: "QUOTED" as const, quote: "KES 2,200" },
  { id: "c3", title: "Drainage blockage fix", artisan: "Amina Hassan", location: "Ruiru", status: "PENDING" as const, quote: "Not sent" },
  { id: "c4", title: "Bathroom tile repair", artisan: "Brian Otieno", location: "Rongai", status: "COMPLETED" as const, quote: "KES 6,800" },
];

// ─── Overview ──────────────────────────────────────────────────────────────────

export function ClientOverviewView() {
  const router = useRouter();
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Active jobs", value: "3", helper: "2 quoted", icon: ClipboardList }, { label: "Saved artisans", value: "12", helper: "4 nearby", icon: Bookmark }, { label: "Unread messages", value: "8", helper: "4 need reply", icon: MessageCircle }, { label: "Completed jobs", value: "17", helper: "5 pending reviews", icon: CheckCircle2 }].map(({ label, value, helper, icon: Icon }) => (
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

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Current jobs</p>
              <p className="text-[13px]" style={{ color: COLORS.muted }}>Review quotes and job progress.</p>
            </div>
            <button onClick={() => router.push("/client/jobs")} className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>View all</button>
          </div>
          <div className="grid gap-2">
            {mockClientJobs.map((job) => (
              <div key={job.id} className="grid gap-3 rounded-[14px] border p-3 transition-colors hover:bg-[#f7f7f7] md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft }}>
                <div className="min-w-0">
                  <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</span>
                  <span className="mt-1 block text-[13px]" style={{ color: COLORS.muted }}>{job.artisan} · {job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status={job.status} />
                  <button className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium hover:bg-white" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Quick view</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[18px] border p-4" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
            <p className="text-[16px] font-semibold" style={{ color: COLORS.primaryActive }}>Find the right artisan faster</p>
            <p className="mt-2 text-[14px]" style={{ color: COLORS.body }}>Use saved artisans and recommended matches to start new job requests.</p>
            <button onClick={() => router.push("/client/find")} className="mt-4 cursor-pointer rounded-lg px-3 py-2 text-[14px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>Find artisans</button>
          </div>
          <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Review prompt</p>
            <p className="mt-2 text-[13px]" style={{ color: COLORS.muted }}>You have 1 completed job awaiting a review.</p>
            <button onClick={() => router.push("/client/reviews")} className="mt-4 cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>Leave review</button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Find artisans ─────────────────────────────────────────────────────────────

const recommendedArtisans: ArtisanCardData[] = [
  { id: "art-001", name: "Peter Mwangi", profession: "Plumber", profileImage: null, portfolioThumbnail: null, location: { city: "Kilimani", county: "Nairobi" }, hourlyRate: 1800, isAvailable: true, isVerified: true, isPremium: false, rating: { average: 4.9, total: 82 }, specializations: [{ name: "Leak repair" }, { name: "Pipe fitting" }], gradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)" },
  { id: "art-002", name: "Grace Wanjiku", profession: "Carpenter", profileImage: null, portfolioThumbnail: null, location: { city: "Kikuyu", county: "Kiambu" }, hourlyRate: 2600, isAvailable: false, isVerified: true, isPremium: true, rating: { average: 4.8, total: 64 }, specializations: [{ name: "Cabinets" }, { name: "Custom beds" }], gradient: "linear-gradient(135deg, #f4f1e8 0%, #b89565 44%, #4b3524 100%)" },
  { id: "art-003", name: "Amina Hassan", profession: "Painter", profileImage: null, portfolioThumbnail: null, location: { city: "Westlands", county: "Nairobi" }, hourlyRate: 1500, isAvailable: true, isVerified: true, isPremium: true, rating: { average: 4.9, total: 51 }, specializations: [{ name: "Wall prep" }, { name: "Texture finish" }], gradient: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 44%, #065f46 100%)" },
  { id: "art-004", name: "Brian Otieno", profession: "Electrician", profileImage: null, portfolioThumbnail: null, location: { city: "Rongai", county: "Kajiado" }, hourlyRate: 2200, isAvailable: true, isVerified: true, isPremium: false, rating: { average: 4.7, total: 73 }, specializations: [{ name: "Fault tracing" }, { name: "Lighting" }], gradient: "linear-gradient(135deg, #eef2ff 0%, #a7f3d0 46%, #064e3b 100%)" },
];

export function ClientFindView() {
  const router = useRouter();
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Recommended artisans</p>
          <p className="text-[14px]" style={{ color: COLORS.muted }}>Browse verified artisans and start a job request.</p>
        </div>
        <Link href="/artisans" className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
          Open full directory <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {recommendedArtisans.map((artisan) => (
          <ArtisanPreviewCard key={artisan.id} artisan={artisan} />
        ))}
      </div>
    </main>
  );
}

// ─── Saved artisans ────────────────────────────────────────────────────────────

export function ClientSavedView() {
  const router = useRouter();
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Shortlist</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Saved artisans</h2>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Return to trusted profiles quickly. {recommendedArtisans.length} saved.</p>
        </div>
        <Link href="/artisans" className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
          Browse more
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {recommendedArtisans.map((artisan) => (
          <ArtisanPreviewCard key={artisan.id} artisan={artisan} />
        ))}
      </div>
    </main>
  );
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function ClientJobsView() {
  const router = useRouter();
  const [jobs] = useState(mockClientJobs);

  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Requested", value: String(jobs.filter((j) => j.status === "PENDING").length), helper: "Awaiting quote", icon: ClipboardList }, { label: "Active", value: String(jobs.filter((j) => j.status === "ACTIVE").length), helper: "In progress", icon: CheckCircle2 }, { label: "Completed", value: String(jobs.filter((j) => j.status === "COMPLETED").length), helper: "Need review", icon: Star }, { label: "Total spent", value: "KES 13,500", helper: "This month", icon: Bookmark }].map(({ label, value, helper, icon: Icon }) => (
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
      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>All jobs</p>
        </div>
        <div className="grid gap-2">
          {jobs.map((job, index) => (
            <div key={job.id} className="grid gap-3 rounded-[14px] border p-3 transition-colors hover:bg-[#f7f7f7] md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft, background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
              <div className="min-w-0">
                <span className="block text-[14px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</span>
                <span className="mt-1 block text-[13px]" style={{ color: COLORS.muted }}>{job.artisan} · {job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip status={job.status} />
                <span className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>{job.quote}</span>
                <button className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Quick view</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function ClientMessagesView() {
  const threads = [
    { id: "m1", name: "Peter Mwangi", role: "Plumber", preview: "Peter: I can start tomorrow morning at 9 AM.", time: "12m", unread: true },
    { id: "m2", name: "Grace Wanjiku", role: "Carpenter", preview: "You: Can you send the final quote by tonight?", time: "38m", unread: false },
    { id: "m3", name: "Amina Hassan", role: "Painter", preview: "Amina: The wall prep will take about 2 hours.", time: "2h", unread: true },
  ];
  return (
    <main className="flex h-[calc(100vh-73px)] min-h-0">
      <div className="flex w-full flex-col overflow-hidden md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]">
        <aside className="flex flex-col border-r overflow-y-auto" style={{ borderColor: COLORS.hairlineSoft }}>
          <div className="border-b p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>Messages</p>
            <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{threads.filter((t) => t.unread).length} unread</p>
          </div>
          {threads.map((thread) => (
            <button key={thread.id} className="flex items-start gap-3 border-b p-4 text-left hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
                <span className="text-[12px] font-bold">{thread.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{thread.name}</span>
                  <span className="text-[12px]" style={{ color: COLORS.muted }}>{thread.time}</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px]" style={{ color: COLORS.muted }}>{thread.preview}</span>
              </span>
              {thread.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS.primary }} />}
            </button>
          ))}
        </aside>
        <div className="hidden flex-1 flex-col items-center justify-center md:flex" style={{ background: COLORS.surfaceSoft }}>
          <MessageCircle size={36} style={{ color: COLORS.muted }} />
          <p className="mt-3 text-[15px] font-semibold" style={{ color: COLORS.ink }}>Select a conversation</p>
          <p className="mt-1 text-[14px]" style={{ color: COLORS.muted }}>Choose a thread to read and reply.</p>
        </div>
      </div>
    </main>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function ClientReviewsView() {
  const pendingReviews = [{ id: "r1", artisan: "Brian Otieno", job: "Electrical fault tracing", completedOn: "Yesterday" }];
  const pastReviews = [
    { id: "pr1", artisan: "Peter Mwangi", job: "Pipe fitting", rating: 5, body: "Excellent work, fixed the leak quickly and cleanly.", date: "2 weeks ago" },
    { id: "pr2", artisan: "Grace Wanjiku", job: "Cabinet installation", rating: 5, body: "Professional quality, on time, great communication.", date: "1 month ago" },
  ];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Trust</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Reviews</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Review completed work and help the marketplace reward skilled artisans.</p>
      </div>
      {pendingReviews.length > 0 && (
        <div className="mb-6 grid gap-3">
          <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>Pending reviews</p>
          {pendingReviews.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{r.job}</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{r.artisan} · Completed {r.completedOn}</p>
              </div>
              <button className="h-10 shrink-0 cursor-pointer rounded-lg px-4 text-[13px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>Leave review</button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3">
        <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>Your reviews</p>
        {pastReviews.map((r) => (
          <div key={r.id} className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{r.job}</p>
                <p className="mt-0.5 text-[13px]" style={{ color: COLORS.muted }}>{r.artisan} · {r.date}</p>
              </div>
              <div className="flex items-center gap-1">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} fill={COLORS.amber} stroke={COLORS.amber} />)}</div>
            </div>
            <p className="mt-3 text-[14px]" style={{ color: COLORS.body }}>{r.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function ClientSettingsView() {
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Account</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Settings</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Manage profile details, notifications, saved locations, and preferences.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[{ title: "Personal info", body: "Keep contact details and profile picture current.", icon: Search }, { title: "Notifications", body: "Choose message and job alert preferences.", icon: MessageCircle }, { title: "Saved locations", body: "Save common project addresses for quick selection.", icon: Bookmark }, { title: "Account security", body: "Password, linked accounts, and session management.", icon: Settings }].map(({ title, body, icon: Icon }) => (
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
