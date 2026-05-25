"use client";

import { useEffect, useRef, useState } from "react";
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
import { motion } from "framer-motion";

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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const measureActive = () => {
    const track = trackRef.current;
    const item = itemRefs.current[activeCategory];
    if (!track || !item) return;
    const trackRect = track.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    // Account for horizontal scroll inside the track container
    const left = itemRect.left - trackRect.left + track.scrollLeft;
    setPill({ left, width: itemRect.width });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(measureActive);
    window.addEventListener("resize", measureActive);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureActive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-2 md:px-10">
      <div
        ref={trackRef}
        className="relative flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Sliding pill background — inside the scroll container so it scrolls with items */}
        {pill && (
          <motion.span
            className="pointer-events-none absolute bottom-3 top-0 z-0 rounded-full"
            initial={false}
            animate={{ left: pill.left, width: pill.width }}
            transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.58 }}
            style={{
              background: COLORS.canvas,
              boxShadow: SHADOWS.soft,
            }}
          />
        )}

        {categoryOptions.map((category) => {
          const Icon = category.icon;
          const active = activeCategory === category.label;
          return (
            <button
              key={category.label}
              ref={(node) => {
                itemRefs.current[category.label] = node;
              }}
              onClick={() => onChange(category.label)}
              className="relative z-10 flex min-w-fit cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium leading-[1.29] transition-[border-color,color,transform] duration-150 hover:-translate-y-0.5"
              style={{
                borderColor: active ? COLORS.ink : COLORS.hairline,
                color: active ? COLORS.ink : COLORS.body,
                background: "transparent",
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
