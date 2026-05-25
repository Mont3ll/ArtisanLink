"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Eye,
  FileText,
  Images,
  MessageCircle,
  Plus,
  ReceiptText,
  Settings,
  Star,
  TrendingUp,
  WalletCards,
  X,
  Search,
} from "lucide-react";

import { FluidPillTabs, StatusChip } from "@/components/ui2";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

// ─── Shared types ─────────────────────────────────────────────────────────────

type Job = {
  id: string;
  title: string;
  client: string;
  location: string;
  description?: string;
  quote?: string;
  status: "PENDING" | "ACTIVE" | "QUOTED" | "ACCEPTED" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS" | "REJECTED";
};

type JobTab = "all" | "requested" | "quoted" | "active";

// ─── Jobs view ────────────────────────────────────────────────────────────────

export function ArtisanJobsView() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTab, setJobTab] = useState<JobTab>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/artisan/jobs?limit=20")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { jobs?: Job[]; data?: Job[] }) => {
        if (cancelled) return;
        const raw = data.jobs ?? data.data ?? [];
        setJobs(raw.length ? raw : mockJobs);
      })
      .catch(() => setJobs(mockJobs))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesTab = jobTab === "all" || (jobTab === "requested" && job.status === "PENDING") || (jobTab === "quoted" && job.status === "QUOTED") || (jobTab === "active" && job.status === "ACTIVE");
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [job.title, job.client, job.location, job.description ?? "", job.status].join(" ").toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  const pending = jobs.filter((j) => j.status === "PENDING").length;
  const quoted = jobs.filter((j) => j.status === "QUOTED").length;
  const active = jobs.filter((j) => j.status === "ACTIVE").length;

  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Requested jobs", value: String(pending), helper: "Need quote", icon: ReceiptText }, { label: "Quoted jobs", value: String(quoted), helper: "Awaiting client", icon: FileText }, { label: "Active jobs", value: String(active), helper: "In progress", icon: ClipboardList }, { label: "Projected value", value: "KES —", helper: "Open job pipeline", icon: TrendingUp }].map(({ label, value, helper, icon: Icon }) => (
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

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FluidPillTabs<JobTab>
          id="artisan-jobs-tabs"
          value={jobTab}
          onChange={setJobTab}
          options={[{ id: "all", label: "All" }, { id: "requested", label: "Requested" }, { id: "quoted", label: "Quoted" }, { id: "active", label: "Active" }]}
        />
        <button
          onClick={() => router.push("/artisan-dashboard/jobs")}
          className="inline-flex h-10 w-fit shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          <Plus size={15} /> Add job
        </button>
      </div>

      <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="mb-4 flex items-center gap-3 rounded-full border px-4 h-12" style={{ borderColor: COLORS.hairline }}>
          <Search size={16} style={{ color: COLORS.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs by client, location, or status…"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#929292]"
            style={{ color: COLORS.ink }}
          />
          {query && <button onClick={() => setQuery("")}><X size={14} style={{ color: COLORS.muted }} /></button>}
        </div>

        {loading ? (
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-[14px] bg-[#f2f2f2]" />)}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-[18px] border border-dashed p-8 text-center text-[14px]" style={{ borderColor: COLORS.hairline, color: COLORS.muted }}>
            {query ? `No jobs matching "${query}"` : "No jobs in this view yet."}
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredJobs.map((job, index) => (
              <div key={job.id} className="grid gap-3 rounded-[14px] border p-3 transition-colors hover:bg-[#f7f7f7] md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft, background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas }}>
                <div className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</span>
                  <span className="mt-1 block truncate text-[13px]" style={{ color: COLORS.muted }}>{job.client} · {job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status={job.status} />
                  <span className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>{job.quote ?? "Not sent"}</span>
                  <button onClick={() => router.push(`/artisan-dashboard/jobs`)} className="h-9 cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Quick view</button>
                  <button onClick={() => router.push(`/artisan-dashboard/jobs`)} className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border bg-white hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }} aria-label="View job detail"><Eye size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const mockJobs: Job[] = [
  { id: "j1", title: "Kitchen sink repair", client: "Miriam Njeri", location: "Kilimani", description: "Fix leaking under-sink pipes and replace trap", quote: "KES 4,500", status: "ACTIVE" },
  { id: "j2", title: "Cabinet handle install", client: "David Kamau", location: "Westlands", description: "Install 12 cabinet handles across kitchen", quote: "KES 2,200", status: "QUOTED" },
  { id: "j3", title: "Drainage blockage fix", client: "Ann Wairimu", location: "Ruiru", description: "Blocked bathroom drainage, needs unblocking and check", quote: "Not sent", status: "PENDING" },
  { id: "j4", title: "Bathroom tile repair", client: "Peter Mwangi", location: "Rongai", description: "Cracked tiles, need replacement and re-grouting", quote: "KES 6,800", status: "ACCEPTED" },
];

// ─── Messages view ─────────────────────────────────────────────────────────────

export function ArtisanMessagesView() {
  const router = useRouter();
  const threads = [
    { id: "t1", name: "Miriam Njeri", meta: "Quote opened · 12m", preview: "You: Quote sent for kitchen sink repair — awaiting response", unread: true },
    { id: "t2", name: "David Kamau", meta: "Cabinet handle install · 38m", preview: "David: Can you do it this Thursday afternoon?", unread: true },
    { id: "t3", name: "Ann Wairimu", meta: "Drainage blockage · 2h", preview: "Ann: Are you available this week?", unread: false },
    { id: "t4", name: "Peter Mwangi", meta: "Bathroom tile repair · 1d", preview: "You: I can start on Friday morning.", unread: false },
  ];

  return (
    <main className="flex h-[calc(100vh-73px)] min-h-0">
      <div className="flex w-full flex-col overflow-hidden md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]">
        {/* Thread list */}
        <aside className="flex flex-col border-r overflow-y-auto" style={{ borderColor: COLORS.hairlineSoft }}>
          <div className="border-b p-4" style={{ borderColor: COLORS.hairlineSoft }}>
            <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>Messages</p>
            <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{threads.filter((t) => t.unread).length} unread</p>
          </div>
          {threads.map((thread) => (
            <button key={thread.id} className="flex items-start gap-3 border-b p-4 text-left transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
                <span className="text-[13px] font-bold">{thread.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{thread.name}</span>
                  <span className="text-[12px]" style={{ color: COLORS.muted }}>{thread.meta.split("·").pop()?.trim()}</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px]" style={{ color: COLORS.muted }}>{thread.preview}</span>
              </span>
              {thread.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS.primary }} />}
            </button>
          ))}
        </aside>

        {/* Thread placeholder */}
        <div className="hidden flex-1 flex-col items-center justify-center md:flex" style={{ background: COLORS.surfaceSoft }}>
          <MessageCircle size={36} style={{ color: COLORS.muted }} />
          <p className="mt-3 text-[15px] font-semibold" style={{ color: COLORS.ink }}>Select a conversation</p>
          <p className="mt-1 text-[14px]" style={{ color: COLORS.muted }}>Choose a thread on the left to read and reply.</p>
        </div>
      </div>
    </main>
  );
}

// ─── Portfolio view ─────────────────────────────────────────────────────────────

export function ArtisanPortfolioView() {
  const router = useRouter();
  const [items] = useState([
    { id: "p1", title: "Kitchen sink repair", category: "Plumbing", status: "Published", featured: true, gradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)" },
    { id: "p2", title: "Cabinet handle install", category: "Carpentry", status: "Published", featured: false, gradient: "linear-gradient(135deg, #f4f1e8 0%, #b89565 44%, #4b3524 100%)" },
    { id: "p3", title: "Drainage blockage fix", category: "Plumbing", status: "Draft", featured: false, gradient: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 44%, #065f46 100%)" },
  ]);

  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Work samples</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Portfolio</h2>
          <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Publish project cards that help clients judge your style, quality, and specialties.</p>
        </div>
        <button onClick={() => router.push("/artisan-dashboard/portfolio/new")} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>
          <Plus size={15} /> Add project
        </button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-[18px] border bg-white" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
            <div className="aspect-[4/3]" style={{ background: item.gradient }} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{item.title}</p>
                {item.featured && <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>Featured</span>}
              </div>
              <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{item.category} · {item.status}</p>
              <div className="mt-3 flex gap-2">
                <button className="h-9 flex-1 cursor-pointer rounded-lg border text-[13px] font-medium hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>Edit</button>
                <button className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.muted }}><Eye size={15} /></button>
              </div>
            </div>
          </article>
        ))}
        <button onClick={() => router.push("/artisan-dashboard/portfolio/new")} className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline }}>
          <Plus size={24} style={{ color: COLORS.muted }} />
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Add project</p>
        </button>
      </div>
    </main>
  );
}

// ─── Earnings view ─────────────────────────────────────────────────────────────

export function ArtisanEarningsView() {
  const earningRows = [
    { id: "e1", item: "Kitchen sink repair", client: "Miriam Njeri", amount: "KES 4,500", commission: "KES 360", net: "KES 4,140", status: "COMPLETED" as const, date: "Today" },
    { id: "e2", item: "Cabinet handle install", client: "David Kamau", amount: "KES 2,200", commission: "KES 176", net: "KES 2,024", status: "COMPLETED" as const, date: "Yesterday" },
    { id: "e3", item: "Drainage blockage fix", client: "Ann Wairimu", amount: "KES 3,800", commission: "KES 304", net: "KES 3,496", status: "PENDING" as const, date: "Pending" },
  ];
  const total = earningRows.reduce((sum, row) => sum + Number(row.net.replace(/[^0-9]/g, "")), 0);

  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total earned", value: `KES ${total.toLocaleString()}`, helper: "Tracked payouts", icon: WalletCards }, { label: "Commission rate", value: "8%", helper: "Current rate", icon: ReceiptText }, { label: "Pending payout", value: "KES 3,496", helper: "Processing", icon: TrendingUp }, { label: "Completed jobs", value: "2", helper: "This month", icon: ClipboardList }].map(({ label, value, helper, icon: Icon }) => (
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
        <p className="mb-4 text-[16px] font-semibold" style={{ color: COLORS.ink }}>Payout history</p>
        <div className="grid gap-2">
          {earningRows.map((row) => (
            <div key={row.id} className="grid gap-3 rounded-[14px] border p-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center" style={{ borderColor: COLORS.hairlineSoft }}>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold" style={{ color: COLORS.ink }}>{row.item}</span>
                <span className="mt-1 block text-[13px]" style={{ color: COLORS.muted }}>{row.client} · {row.date}</span>
              </span>
              <span className="text-[14px]" style={{ color: COLORS.muted }}>{row.amount}</span>
              <span className="text-[13px]" style={{ color: COLORS.muted }}>−{row.commission}</span>
              <span className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{row.net}</span>
              <StatusChip status={row.status} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Subscription view ─────────────────────────────────────────────────────────

export function ArtisanSubscriptionView() {
  const plans = [
    { name: "Free", price: "KES 0", period: "forever", desc: "Get started, build your profile, accept your first clients.", features: ["Basic profile & portfolio", "Receive job requests", "Messaging with clients", "Standard 8% commission"], current: true, cta: "Current plan" },
    { name: "Monthly", price: "KES 150", period: "/month", desc: "Grow faster with priority placement and a lower commission.", features: ["Priority listing in search", "Premium profile badge", "5% commission rate", "Portfolio up to 20 items", "Priority support"], current: false, cta: "Upgrade to Monthly" },
    { name: "Annual", price: "KES 1,500", period: "/year", desc: "Best value. Everything in Monthly plus extra visibility.", features: ["All Monthly features", "Featured on homepage", "Analytics dashboard", "Verified artisan badge", "Save KES 300 vs monthly"], current: false, cta: "Upgrade to Annual", featured: true },
  ];
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Growth</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Subscription</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Upgrade for priority search placement, premium badge, lower commission, and a larger portfolio.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="flex flex-col rounded-[20px] border p-5" style={{ borderColor: plan.featured ? COLORS.primarySoft : COLORS.hairlineSoft, background: plan.featured ? COLORS.primaryTint : COLORS.canvas, boxShadow: plan.featured ? SHADOWS.card : SHADOWS.soft }}>
            {plan.featured && <span className="mb-3 w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.canvas, color: COLORS.primaryActive }}>Best value</span>}
            <p className="text-[18px] font-bold" style={{ color: COLORS.ink }}>{plan.name}</p>
            <div className="my-2">
              <span className="text-[28px] font-bold tracking-[-0.04em]" style={{ color: COLORS.ink }}>{plan.price}</span>
              <span className="text-[14px]" style={{ color: COLORS.muted }}> {plan.period}</span>
            </div>
            <p className="mb-4 text-[13px]" style={{ color: COLORS.body }}>{plan.desc}</p>
            <div className="mb-5 flex-1 grid gap-2">
              {plan.features.map((f) => <p key={f} className="flex items-center gap-2 text-[13px]" style={{ color: COLORS.body }}><span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: COLORS.primary }} />{f}</p>)}
            </div>
            <button disabled={plan.current} className="h-11 w-full cursor-pointer rounded-lg text-[14px] font-medium transition-colors hover:opacity-90 disabled:cursor-default disabled:opacity-50" style={{ background: plan.featured ? COLORS.primary : COLORS.surfaceStrong, color: plan.featured ? COLORS.canvas : COLORS.ink }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Settings view ─────────────────────────────────────────────────────────────

export function ArtisanSettingsView() {
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6">
        <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Profile controls</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>Settings</h2>
        <p className="mt-2 text-[14px]" style={{ color: COLORS.muted }}>Keep your profile, location, services, rates, verification, and notification preferences current.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[
          { title: "Personal info", body: "Display name, bio, contact details, and profile picture.", icon: Settings },
          { title: "Service area", body: "City, county, travel radius, and availability toggle.", icon: Settings },
          { title: "Rates & specializations", body: "Hourly rate and service specializations.", icon: WalletCards },
          { title: "Verification", body: "Review submitted documents and approval status.", icon: Images },
          { title: "Notifications", body: "Message, job request, and payout alert preferences.", icon: Star },
          { title: "Account security", body: "Password, linked accounts, and session management.", icon: Settings },
        ].map(({ title, body, icon: Icon }) => (
          <div key={title} className="flex cursor-pointer items-start gap-4 rounded-[18px] border bg-white p-5 transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}><Icon size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{title}</p>
              <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{body}</p>
            </div>
            <MessageCircle size={15} style={{ color: COLORS.muted }} className="mt-1 hidden lg:block" />
          </div>
        ))}
      </div>
    </main>
  );
}
