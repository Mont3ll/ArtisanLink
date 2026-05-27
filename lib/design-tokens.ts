// Design tokens extracted from the chapaworks.tsx prototype
export const COLORS = {
  canvas: "#ffffff",
  ink: "#222222",
  body: "#3f3f3f",
  muted: "#6a6a6a",
  mutedSoft: "#929292",
  hairline: "#dddddd",
  hairlineSoft: "#ebebeb",
  surfaceSoft: "#f7f7f7",
  surfaceStrong: "#f2f2f2",
  primary: "#059669",
  primaryActive: "#047857",
  primaryDisabled: "#d1fae5",
  primarySoft: "#d1fae5",
  primaryTint: "#ecfdf5",
  amber: "#f59e0b",
} as const;

export const SHADOWS = {
  card: "0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.10)",
  soft: "0 1px 2px rgba(0,0,0,0.04)",
} as const;

export const TRANSITIONS = {
  header: { type: "spring", stiffness: 230, damping: 32, mass: 0.78 } as const,
  search: { stiffness: 220, damping: 33, mass: 0.7 } as const,
  route: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const,
  dashboard: { type: "spring", stiffness: 300, damping: 32, mass: 0.74 } as const,
} as const;
