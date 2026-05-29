"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";

import { StatusChip } from "@/components/ui2";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
import { useArtisanSearch, useToggleSaveArtisan, useSavedArtisanIds } from "@/lib/hooks/use-artisan-search";
import { useSavedArtisansPage, useRemoveSavedArtisan } from "@/lib/hooks/use-saved-artisans";
import { useClientJobs, useAcceptQuote, useDeclineQuote, useCancelJob, useCreateJobRequest } from "@/lib/hooks/use-client-jobs";

// ─── Overview ──────────────────────────────────────────────────────────────────

export function ClientOverviewView() {
  const router = useRouter();
  const { data: jobsData } = useClientJobs();
  const jobs = jobsData?.jobs ?? [];
  const { data: savedData } = useSavedArtisansPage({ limit: 4 });
  const savedArtisans = savedData?.items ?? [];
  const activeJobs = jobs.filter((j) => ["ACCEPTED", "DEPOSIT_PAID", "IN_PROGRESS"].includes(j.status));
  const completedJobs = jobs.filter((j) => ["COMPLETED", "PAID"].includes(j.status));

  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active jobs", value: String(activeJobs.length || jobs.filter((j) => j.status === "IN_PROGRESS").length), helper: "In progress", icon: ClipboardList },
          { label: "Saved artisans", value: String(savedData?.pagination.total ?? 0), helper: "In your shortlist", icon: Bookmark },
          { label: "Completed jobs", value: String(completedJobs.length), helper: "This account", icon: CheckCircle2 },
          { label: "Pending reviews", value: String(completedJobs.filter((j) => !false).length || 0), helper: "Leave a review", icon: Star },
        ].map(({ label, value, helper, icon: Icon }) => (
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
        <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Active jobs</p>
            <button onClick={() => router.push("/client/jobs")} className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>View all</button>
          </div>
          {activeJobs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[14px]" style={{ color: COLORS.muted }}>No active jobs. <Link href="/client/find" className="font-medium underline-offset-4 hover:underline" style={{ color: COLORS.primary }}>Find an artisan →</Link></p>
            </div>
          ) : (
            <div className="grid gap-2">
              {activeJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-3 rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</p>
                    <p className="text-[13px]" style={{ color: COLORS.muted }}>{job.artisan.name} · {job.location || "Kenya"}</p>
                  </div>
                  <StatusChip status={job.status as never} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Saved artisans</p>
            <button onClick={() => router.push("/client/saved")} className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline" style={{ color: COLORS.ink }}>View all</button>
          </div>
          {savedArtisans.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[14px]" style={{ color: COLORS.muted }}>No saved artisans yet. <Link href="/artisans" className="font-medium underline-offset-4 hover:underline" style={{ color: COLORS.primary }}>Browse artisans →</Link></p>
            </div>
          ) : (
            <div className="grid gap-2">
              {savedArtisans.slice(0, 4).map((saved) => (
                <div key={saved.id} className="flex items-center gap-3 rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft }}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-semibold text-white" style={{ background: COLORS.primary }}>
                    {saved.artisan.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold" style={{ color: COLORS.ink }}>{saved.artisan.name}</p>
                    <p className="text-[13px]" style={{ color: COLORS.muted }}>{saved.artisan.profession || "Artisan"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => router.push("/artisans")} className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border py-2 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
            <Plus size={14} /> Find more artisans
          </button>
        </div>
      </div>
    </main>
  );
}

// ─── Find artisans ─────────────────────────────────────────────────────────────

export function ClientFindView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [profession, setProfession] = useState("");
  const [county, setCounty] = useState("");
  const { data, isLoading } = useArtisanSearch({ query: debouncedQuery, profession: profession || undefined, county: county || undefined, limit: 12 });
  const { data: savedIds } = useSavedArtisanIds();
  const toggleSave = useToggleSaveArtisan();
  const artisans = data?.artisans ?? [];
  const professions = Array.from(new Set(artisans.map((a) => a.profession).filter(Boolean)));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Discover</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Find artisans</h2>
      </div>
      <form onSubmit={handleSearch} className="mb-5 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border bg-white px-4" style={{ borderColor: COLORS.hairline }}>
          <Search size={16} style={{ color: COLORS.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by skill, name, or location"
            className="flex-1 bg-transparent py-2.5 text-[14px] outline-none placeholder:text-[#929292]"
            style={{ color: COLORS.ink }}
          />
        </div>
        <button type="submit" className="h-11 rounded-full px-5 text-[14px] font-medium text-white" style={{ background: COLORS.primary }}>Search</button>
        <Link href="/artisans" className="inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
          Full directory <ArrowRight size={14} />
        </Link>
      </form>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-[18px] bg-[#f2f2f2]" />
          ))}
        </div>
      ) : artisans.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[15px]" style={{ color: COLORS.muted }}>
            {debouncedQuery ? `No artisans found for "${debouncedQuery}"` : "Search for artisans above or browse the full directory."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {artisans.map((artisan) => {
            const isSaved = savedIds?.has(artisan.profileId) ?? false;
            return (
              <div key={artisan.id} className="group relative rounded-[18px] border bg-white p-4 transition-shadow hover:shadow-md" style={{ borderColor: COLORS.hairlineSoft }}>
                <button
                  onClick={() => toggleSave.mutate({ profileId: artisan.profileId, isSaved })}
                  className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairlineSoft }}
                  aria-label={isSaved ? "Unsave" : "Save"}
                >
                  {isSaved ? <BookmarkCheck size={16} style={{ color: COLORS.primary }} /> : <Bookmark size={16} style={{ color: COLORS.muted }} />}
                </button>
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-white" style={{ background: COLORS.primary }}>
                    {artisan.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[15px] font-semibold" style={{ color: COLORS.ink }}>{artisan.name}</p>
                      {artisan.isVerified && <BadgeCheck size={14} style={{ color: COLORS.primary }} />}
                    </div>
                    <p className="text-[13px]" style={{ color: COLORS.muted }}>{artisan.profession || "Artisan"}</p>
                    <p className="text-[13px]" style={{ color: COLORS.muted }}>{[artisan.location.city, artisan.location.county].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
                {artisan.rating.total > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[13px]" style={{ color: COLORS.muted }}>
                    <Star size={13} fill={COLORS.amber} style={{ color: COLORS.amber }} />
                    <span className="font-semibold" style={{ color: COLORS.ink }}>{artisan.rating.average.toFixed(1)}</span>
                    <span>({artisan.rating.total} reviews)</span>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Link href={`/artisans/${artisan.id}`} className="flex-1 rounded-lg border py-2 text-center text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
                    View profile
                  </Link>
                  <Link href={`/client/messages?artisan=${artisan.id}&name=${encodeURIComponent(artisan.name)}`} className="flex-1 rounded-lg py-2 text-center text-[13px] font-medium text-white" style={{ background: COLORS.primary }}>
                    Message
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

// ─── Saved artisans ────────────────────────────────────────────────────────────

export function ClientSavedView() {
  const { data, isLoading, refetch } = useSavedArtisansPage({ limit: 20 });
  const removeSaved = useRemoveSavedArtisan();
  const artisans = data?.items ?? [];

  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Shortlist</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Saved artisans</h2>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>
            {data?.pagination.total ?? 0} saved artisan{data?.pagination.total !== 1 ? "s" : ""}.
          </p>
        </div>
        <Link href="/artisans" className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
          Browse more
        </Link>
      </div>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-[18px] bg-[#f2f2f2]" />)}
        </div>
      ) : artisans.length === 0 ? (
        <div className="rounded-[18px] border p-12 text-center" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <Bookmark size={32} className="mx-auto mb-3 opacity-40" style={{ color: COLORS.primary }} />
          <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>No saved artisans yet</p>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Save artisans from the browse directory to shortlist them here.</p>
          <Link href="/artisans" className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white" style={{ background: COLORS.primary }}>Browse artisans →</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {artisans.map((saved) => (
            <div key={saved.id} className="relative rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
              <button
                onClick={() => removeSaved.mutate(saved.artisan.id, { onSuccess: () => refetch() })}
                className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                style={{ color: COLORS.muted }}
                aria-label="Remove"
              >
                <X size={15} />
              </button>
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-white" style={{ background: COLORS.primary }}>
                  {saved.artisan.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-semibold" style={{ color: COLORS.ink }}>{saved.artisan.name}</p>
                    {saved.artisan.isVerified && <BadgeCheck size={14} style={{ color: COLORS.primary }} />}
                  </div>
                  <p className="text-[13px]" style={{ color: COLORS.muted }}>{saved.artisan.profession || "Artisan"}</p>
                  <p className="text-[13px]" style={{ color: COLORS.muted }}>
                    {[saved.artisan.location.city, saved.artisan.location.county].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              {saved.artisan.hourlyRate && (
                <p className="mt-3 text-[13px]" style={{ color: COLORS.muted }}>From KES {saved.artisan.hourlyRate.toLocaleString("en-KE")}/hr</p>
              )}
              <div className="mt-3 flex gap-2">
                <Link href={`/artisans/${saved.artisan.id}`} className="flex-1 rounded-lg border py-2 text-center text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
                  View
                </Link>
                <Link href={`/client/messages?artisan=${saved.artisan.id}&name=${encodeURIComponent(saved.artisan.name)}`} className="flex-1 rounded-lg py-2 text-center text-[13px] font-medium text-white" style={{ background: COLORS.primary }}>
                  <MessageCircle size={13} className="mr-1 inline" />Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function ClientJobsView() {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "active" | "pending" | "completed">("all");
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const { data, isLoading, refetch } = useClientJobs();
  const acceptQuote = useAcceptQuote();
  const declineQuote = useDeclineQuote();
  const cancelJob = useCancelJob();

  const allJobs = data?.jobs ?? [];
  const filtered = tab === "all" ? allJobs
    : tab === "active" ? allJobs.filter((j) => ["ACCEPTED", "DEPOSIT_PAID", "IN_PROGRESS"].includes(j.status))
    : tab === "pending" ? allJobs.filter((j) => j.status === "REQUESTED" || j.status === "QUOTED")
    : allJobs.filter((j) => ["COMPLETED", "PAID", "CANCELLED"].includes(j.status));

  const tabItems = [
    { id: "all", label: `All (${allJobs.length})` },
    { id: "pending", label: `Pending (${allJobs.filter((j) => ["REQUESTED", "QUOTED"].includes(j.status)).length})` },
    { id: "active", label: `Active (${allJobs.filter((j) => ["ACCEPTED", "DEPOSIT_PAID", "IN_PROGRESS"].includes(j.status)).length})` },
    { id: "completed", label: `Done (${allJobs.filter((j) => ["COMPLETED", "PAID"].includes(j.status)).length})` },
  ] as const;

  return (
    <main className="p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Work</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>My jobs</h2>
        </div>
        <Link href="/artisans" className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[14px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
          <Plus size={15} /> Hire artisan
        </Link>
      </div>
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {tabItems.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id as typeof tab)} className="h-9 min-w-fit rounded-full border px-4 text-[13px] font-medium transition-colors" style={{ borderColor: tab === id ? COLORS.ink : COLORS.hairlineSoft, background: tab === id ? COLORS.ink : COLORS.canvas, color: tab === id ? COLORS.canvas : COLORS.ink }}>
            {label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-[18px] bg-[#f2f2f2]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[18px] border p-10 text-center" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <p className="text-[14px]" style={{ color: COLORS.muted }}>No jobs in this category. <Link href="/artisans" className="font-medium underline-offset-4 hover:underline" style={{ color: COLORS.primary }}>Find an artisan →</Link></p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((job) => (
            <div key={job.id} className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</p>
                    <StatusChip status={job.status as never} />
                  </div>
                  <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
                    {job.artisan.name} · {job.artisan.profession} · {job.location || "Kenya"}
                  </p>
                  {job.latestQuote && (
                    <p className="mt-1 text-[13px] font-semibold" style={{ color: COLORS.primaryActive }}>
                      Quote: KES {job.latestQuote.amount.toLocaleString("en-KE")}
                      {job.latestQuote.estimatedDuration ? ` · ${job.latestQuote.estimatedDuration}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.status === "QUOTED" && job.latestQuote && (
                    <>
                      <button
                        onClick={async () => { await acceptQuote.mutateAsync({ jobId: job.id, quoteId: job.latestQuote!.id }); refetch(); }}
                        disabled={acceptQuote.isPending}
                        className="h-9 cursor-pointer rounded-lg px-3 text-[13px] font-semibold text-white disabled:opacity-50"
                        style={{ background: COLORS.primary }}
                      >
                        Accept quote
                      </button>
                      <button
                        onClick={async () => { await declineQuote.mutateAsync({ jobId: job.id, quoteId: job.latestQuote!.id }); refetch(); }}
                        disabled={declineQuote.isPending}
                        className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-semibold disabled:opacity-50"
                        style={{ borderColor: COLORS.hairline, color: "#b91c1c" }}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {["REQUESTED", "QUOTED", "ACCEPTED"].includes(job.status) && (
                    <button
                      onClick={() => { setCancelJobId(job.id); setCancelReason(""); }}
                      className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium"
                      style={{ borderColor: COLORS.hairlineSoft, color: COLORS.muted }}
                    >
                      Cancel
                    </button>
                  )}
                  <button onClick={() => router.push(`/client/messages`)} className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelJobId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-[480px] rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
            <p className="text-[18px] font-semibold" style={{ color: COLORS.ink }}>Cancel job request?</p>
            <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>This will notify the artisan. Please provide a reason.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="mt-4 min-h-24 w-full rounded-[14px] border px-3 py-2 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline }}
            />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setCancelJobId(null)} className="flex-1 rounded-full border py-2.5 text-[14px] font-medium" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Keep job</button>
              <button
                onClick={async () => {
                  if (!cancelJobId) return;
                  await cancelJob.mutateAsync({ jobId: cancelJobId, cancelReason });
                  setCancelJobId(null);
                  refetch();
                }}
                disabled={!cancelReason.trim() || cancelJob.isPending}
                className="flex-1 rounded-full py-2.5 text-[14px] font-medium text-white disabled:opacity-50"
                style={{ background: "#b91c1c" }}
              >
                {cancelJob.isPending ? "Cancelling…" : "Cancel job"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Inbox</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Messages</h2>
      </div>
      <div className="grid gap-2">
        {threads.map((thread) => (
          <div key={thread.id} className="flex cursor-pointer items-start gap-3 rounded-[14px] border p-4 transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft, background: thread.unread ? "#fffbeb" : COLORS.canvas }}>
            {thread.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS.primary }} />}
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white" style={{ background: COLORS.primary }}>
              {thread.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{thread.name}</p>
                <span className="shrink-0 text-[12px]" style={{ color: COLORS.muted }}>{thread.time}</span>
              </div>
              <p className="text-[13px]" style={{ color: COLORS.muted }}>{thread.role}</p>
              <p className="mt-1 truncate text-[13px]" style={{ color: thread.unread ? COLORS.ink : COLORS.muted }}>{thread.preview}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function ClientReviewsView() {
  const router = useRouter();
  const { data } = useClientJobs();
  const completedJobs = (data?.jobs ?? []).filter((j) => ["COMPLETED", "PAID"].includes(j.status));

  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Feedback</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Leave a review</h2>
      </div>
      {completedJobs.length === 0 ? (
        <div className="rounded-[18px] border p-10 text-center" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <Star size={32} className="mx-auto mb-3 opacity-40" style={{ color: COLORS.primary }} />
          <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>No completed jobs yet</p>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Complete a job to leave a review for your artisan.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {completedJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between gap-3 rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{job.artisan.name} · {job.artisan.profession}</p>
              </div>
              <Link href={`/client/reviews?job=${job.id}&artisan=${job.artisan.id}`} className="h-10 rounded-full border px-4 text-[13px] font-semibold hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>
                ★ Write review
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function ClientSettingsView() {
  const router = useRouter();
  return (
    <main className="p-5 md:p-6">
      <div className="mb-5">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Account</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Settings</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { label: "Profile", body: "Update your name, email, and profile image.", href: "/client/dashboard" },
          { label: "Notifications", body: "Configure email and in-app notification preferences.", href: "/client/dashboard" },
          { label: "Payment methods", body: "Manage M-Pesa and saved payment options.", href: "/client/dashboard" },
          { label: "Privacy", body: "Control visibility and data sharing preferences.", href: "/client/dashboard" },
        ].map(({ label, body, href }) => (
          <Link key={label} href={href} className="rounded-[18px] border bg-white p-5 transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{label}</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{body}</p>
              </div>
              <Settings size={16} className="mt-1 shrink-0" style={{ color: COLORS.muted }} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
