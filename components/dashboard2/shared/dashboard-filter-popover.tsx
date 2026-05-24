"use client";

import { COLORS, SHADOWS } from "@/lib/design-tokens";

export function DashboardFilterPopover({ title = "Filters", options, values, onToggle }: { title?: string; options: string[]; values: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.soft }}>
      <p className="mb-3 text-[13px] font-semibold" style={{ color: COLORS.ink }}>{title}</p>
      <div className="grid gap-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-[13px]" style={{ color: COLORS.body }}>
            <input type="checkbox" checked={values.includes(option)} onChange={() => onToggle(option)} className="accent-emerald-600" />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
