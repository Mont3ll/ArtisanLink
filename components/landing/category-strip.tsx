"use client";

import {
  Camera,
  Car,
  Hammer,
  PaintBucket,
  Scissors,
  Shield,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

import { COLORS, SHADOWS } from "@/lib/design-tokens";

export const categoryOptions = [
  { label: "All", profession: null, icon: Sparkles },
  { label: "Carpenter", profession: "Carpenter", icon: Hammer },
  { label: "Electrician", profession: "Electrician", icon: Zap },
  { label: "Plumber", profession: "Plumber", icon: Wrench },
  { label: "Painter", profession: "Painter", icon: PaintBucket },
  { label: "Mason", profession: "Mason", icon: ShieldCheck },
  { label: "Tailor", profession: "Tailor", icon: Scissors },
  { label: "Welder", profession: "Welder", icon: Shield },
  { label: "Mechanic", profession: "Mechanic", icon: Car },
  { label: "Photographer", profession: "Photographer", icon: Camera },
];

export function CategoryStrip({
  activeCategory,
  onChange,
}: {
  activeCategory: string;
  onChange: (category: string) => void;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-2 md:px-10">
      <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryOptions.map((category) => {
          const Icon = category.icon;
          const active = activeCategory === category.label;
          return (
            <button
              key={category.label}
              onClick={() => onChange(category.label)}
              className="flex min-w-fit cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium leading-[1.29] transition-[background-color,border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#f7f7f7]"
              style={{
                borderColor: active ? COLORS.ink : COLORS.hairline,
                color: active ? COLORS.ink : COLORS.body,
                background: COLORS.canvas,
                boxShadow: active ? SHADOWS.soft : "none",
              }}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.25 : 1.9}
                style={{ color: active ? COLORS.primary : COLORS.muted }}
              />
              {category.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
