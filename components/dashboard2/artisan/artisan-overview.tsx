"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Images, MessageCircle, Star, WalletCards } from "lucide-react";

import { StatCard } from "@/components/ui2";
import { COLORS } from "@/lib/design-tokens";

type Stats = {
  activeJobs?: number;
  pendingQuotes?: number;
  unreadMessages?: number;
  portfolioItems?: number;
  rating?: number;
  earnings?: number;
};

type StatsPayload = Partial<Stats> & {
  jobs?: { active?: number; pending?: number };
  averageRating?: number;
};

type EarningsPayload = {
  totalEarned?: number;
  total?: number;
};

export function ArtisanOverview() {
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      fetch("/api/artisan/stats").then((res) => (res.ok ? res.json() : {})),
      fetch("/api/artisan/earnings").then((res) => (res.ok ? res.json() : {})),
    ]).then(([statsResult, earningsResult]) => {
      if (cancelled) return;
      const nextStats: StatsPayload = statsResult.status === "fulfilled" ? statsResult.value : {};
      const nextEarnings: EarningsPayload = earningsResult.status === "fulfilled" ? earningsResult.value : {};
      setStats({
        activeJobs: nextStats.activeJobs ?? nextStats.jobs?.active ?? 0,
        pendingQuotes: nextStats.pendingQuotes ?? nextStats.jobs?.pending ?? 0,
        unreadMessages: nextStats.unreadMessages ?? 0,
        portfolioItems: nextStats.portfolioItems ?? 0,
        rating: nextStats.rating ?? nextStats.averageRating ?? 0,
        earnings: nextEarnings.totalEarned ?? nextEarnings.total ?? 0,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>Today</p>
          <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>
            Your craft workspace
          </h2>
          <p className="mt-2 max-w-[620px] text-[14px] leading-[1.5]" style={{ color: COLORS.muted }}>
            Track job activity, messages, portfolio readiness, earnings, and profile momentum.
          </p>
        </div>
        <Link href="/artisan-dashboard/jobs" className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-[14px] font-medium text-white hover:bg-emerald-800" style={{ background: COLORS.primary }}>
          View jobs
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active jobs" value={stats.activeJobs ?? 0} icon={ClipboardList} trend="neutral" trendLabel="In progress" />
        <StatCard label="Pending quotes" value={stats.pendingQuotes ?? 0} icon={MessageCircle} trend="neutral" trendLabel="Need response" />
        <StatCard label="Portfolio items" value={stats.portfolioItems ?? 0} icon={Images} trend="up" trendLabel="Public work" />
        <StatCard label="Earnings" value={`KES ${new Intl.NumberFormat("en-KE").format(stats.earnings ?? 0)}`} icon={WalletCards} trend="neutral" trendLabel="Total tracked" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
          <h3 className="text-[18px] font-semibold" style={{ color: COLORS.ink }}>Next actions</h3>
          <div className="mt-4 grid gap-3">
            {[
              ["Respond to job requests", "Keep response times low and win more work.", "/artisan-dashboard/jobs"],
              ["Update portfolio", "Add recent work samples so clients can trust your craft.", "/artisan-dashboard/portfolio"],
              ["Review settings", "Keep rates, service areas, and availability accurate.", "/artisan-dashboard/settings"],
            ].map(([title, body, href]) => (
              <Link key={title} href={href} className="block rounded-[16px] border p-4 transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
                <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{title}</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{body}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
          <Star size={20} style={{ color: COLORS.primary }} />
          <h3 className="mt-3 text-[18px] font-semibold" style={{ color: COLORS.ink }}>Profile rating</h3>
          <p className="mt-2 text-[42px] font-semibold tracking-[-0.05em]" style={{ color: COLORS.primaryActive }}>
            {(stats.rating ?? 0).toFixed(1)}
          </p>
          <p className="text-[13px] leading-[1.45]" style={{ color: COLORS.body }}>
            Keep ratings high by confirming scope, timelines, and expectations before starting work.
          </p>
        </section>
      </div>
    </main>
  );
}
