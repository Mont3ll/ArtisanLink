"use client";

import { COLORS } from "@/lib/design-tokens";

type Status =
  | "PENDING"
  | "ACTIVE"
  | "QUOTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "SUSPENDED";

const STATUS_CONFIG: Record<
  Status,
  { label: string; bg: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "#fefce8",
    color: "#854d0e",
    dot: "#ca8a04",
  },
  ACTIVE: {
    label: "Active",
    bg: COLORS.primaryTint,
    color: COLORS.primaryActive,
    dot: COLORS.primary,
  },
  QUOTED: {
    label: "Quoted",
    bg: "#eff6ff",
    color: "#1d4ed8",
    dot: "#3b82f6",
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "#f0fdf4",
    color: "#15803d",
    dot: "#22c55e",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "#faf5ff",
    color: "#7e22ce",
    dot: "#a855f7",
  },
  COMPLETED: {
    label: "Completed",
    bg: "#f0fdf4",
    color: "#15803d",
    dot: "#16a34a",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "#fef2f2",
    color: "#991b1b",
    dot: "#ef4444",
  },
  REJECTED: {
    label: "Rejected",
    bg: "#fef2f2",
    color: "#991b1b",
    dot: "#ef4444",
  },
  SUSPENDED: {
    label: "Suspended",
    bg: "#fff7ed",
    color: "#9a3412",
    dot: "#f97316",
  },
};

export function StatusChip({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}
