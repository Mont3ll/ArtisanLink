"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { StatCard } from "@/components/ui2";
import { COLORS } from "@/lib/design-tokens";

export type ViewAction = {
  label: string;
  href: string;
};

export type ViewStat = {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
};

export type ViewItem = {
  title: string;
  body: string;
  href?: string;
};

export function SimpleDashboardView({
  eyebrow,
  title,
  body,
  actions = [],
  stats = [],
  items = [],
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: ViewAction[];
  stats?: ViewStat[];
  items?: ViewItem[];
}) {
  return (
    <main className="p-5 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[14px] font-medium" style={{ color: COLORS.muted }}>{eyebrow}</p>
          <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>{title}</h2>
          <p className="mt-2 max-w-[680px] text-[14px] leading-[1.5]" style={{ color: COLORS.muted }}>{body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-medium transition-colors hover:bg-emerald-800"
              style={{ background: index === 0 ? COLORS.primary : COLORS.surfaceSoft, color: index === 0 ? COLORS.canvas : COLORS.ink }}
            >
              {action.label}
              {index === 0 ? <ArrowRight size={15} /> : null}
            </Link>
          ))}
        </div>
      </div>

      {stats.length ? (
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
      ) : null}

      <section className="rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const content = (
              <div className="h-full rounded-[18px] border p-4 transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairlineSoft }}>
                <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>{item.title}</p>
                <p className="mt-1 text-[13px] leading-[1.45]" style={{ color: COLORS.muted }}>{item.body}</p>
              </div>
            );
            return item.href ? <Link key={item.title} href={item.href}>{content}</Link> : <div key={item.title}>{content}</div>;
          })}
        </div>
      </section>
    </main>
  );
}
