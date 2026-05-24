"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { COLORS, SHADOWS } from "@/lib/design-tokens";

export type PillTabOption<Value extends string> = {
  id: Value;
  label: string;
  helper?: string;
  icon?: ComponentType<{ size?: number; style?: CSSProperties }>;
};

export function FluidPillTabs<Value extends string>({
  id,
  options,
  value,
  onChange,
  compact = true,
  fullWidth = false,
  dense = false,
}: {
  id: string;
  options: Array<PillTabOption<Value>>;
  value: Value;
  onChange: (value: Value) => void;
  compact?: boolean;
  fullWidth?: boolean;
  dense?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Partial<Record<Value, HTMLButtonElement | null>>>({});
  const [hovered, setHovered] = useState<Value | null>(null);
  const [activeMetric, setActiveMetric] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [hoverMetric, setHoverMetric] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const measureOption = (nextValue: Value | null) => {
    const track = trackRef.current;
    const item = nextValue ? itemRefs.current[nextValue] : null;
    if (!track || !item) return null;
    const trackRect = track.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return { left: itemRect.left - trackRect.left, width: itemRect.width };
  };

  useEffect(() => {
    const measure = () => {
      setActiveMetric(measureOption(value));
      setHoverMetric(
        hovered && hovered !== value ? measureOption(hovered) : null,
      );
    };

    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [value, hovered, options.length]);

  return (
    <div
      ref={trackRef}
      className={`${fullWidth ? "w-full" : "w-fit max-w-full"} relative flex gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      style={{ background: COLORS.surfaceStrong }}
      role="tablist"
      aria-label={id}
    >
      <AnimatePresence initial={false}>
        {hoverMetric && (
          <motion.span
            className="pointer-events-none absolute bottom-1 top-1 z-0 rounded-full"
            initial={{
              opacity: 0,
              left: hoverMetric.left,
              width: hoverMetric.width,
              scaleX: 0.98,
            }}
            animate={{
              opacity: 1,
              left: hoverMetric.left,
              width: hoverMetric.width,
              scaleX: 1,
            }}
            exit={{ opacity: 0, scaleX: 0.98 }}
            transition={{
              left: { type: "spring", stiffness: 360, damping: 34, mass: 0.55 },
              width: {
                type: "spring",
                stiffness: 360,
                damping: 34,
                mass: 0.55,
              },
              opacity: { duration: 0.1 },
            }}
            style={{ background: COLORS.canvas, boxShadow: SHADOWS.soft }}
          />
        )}
      </AnimatePresence>
      {activeMetric && (
        <motion.span
          className="pointer-events-none absolute bottom-1 top-1 z-0 rounded-full bg-white"
          initial={false}
          animate={{ left: activeMetric.left, width: activeMetric.width }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 34,
            mass: 0.58,
          }}
          style={{ boxShadow: SHADOWS.soft }}
        />
      )}
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.id;
        return (
          <button
            key={option.id}
            ref={(node) => {
              itemRefs.current[option.id] = node;
            }}
            onClick={() => onChange(option.id)}
            onMouseEnter={() => setHovered(option.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(option.id)}
            onBlur={() => setHovered(null)}
            className={`${dense ? "gap-1.5 px-2.5 py-1.5 text-[12px]" : "gap-2 px-3.5 py-2 text-[13px]"} relative z-10 flex min-w-fit cursor-pointer items-center justify-center rounded-full font-medium leading-[1.23] transition-colors hover:text-[#222222]`}
            style={{ color: active ? COLORS.ink : COLORS.body }}
            type="button"
            role="tab"
            aria-selected={active}
          >
            {Icon && (
              <Icon
                size={compact ? 14 : 16}
                style={{ color: active ? COLORS.primary : COLORS.muted }}
              />
            )}
            <span className="whitespace-nowrap">{option.label}</span>
            {option.helper && (
              <span
                className="hidden text-[12px] font-normal leading-[1.33] xl:inline"
                style={{ color: active ? COLORS.muted : COLORS.mutedSoft }}
              >
                {option.helper}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
