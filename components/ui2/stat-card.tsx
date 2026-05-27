"use client";

import type { LucideIcon } from "lucide-react";

import { COLORS } from "@/lib/design-tokens";

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendLabel,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}) {
  const trendColor =
    trend === "up"
      ? "#16a34a"
      : trend === "down"
        ? "#dc2626"
        : COLORS.muted;

  return (
    <div
      className="rounded-[18px] border bg-white p-5"
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[13px] font-medium leading-[1.23]"
          style={{ color: COLORS.muted }}
        >
          {label}
        </p>
        {Icon && (
          <span
            className="grid h-9 w-9 place-items-center rounded-full"
            style={{ background: COLORS.surfaceSoft, color: COLORS.primary }}
          >
            <Icon size={17} />
          </span>
        )}
      </div>
      <p
        className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.04em]"
        style={{ color: COLORS.ink }}
      >
        {value}
      </p>
      {(subtext || trendLabel) && (
        <p
          className="mt-2 text-[13px] leading-[1.23]"
          style={{ color: trendLabel ? trendColor : COLORS.muted }}
        >
          {trendLabel ?? subtext}
        </p>
      )}
    </div>
  );
}
