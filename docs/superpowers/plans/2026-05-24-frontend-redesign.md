# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the polished single-file design prototype (`~/Downloads/labs/chapaworks.tsx`) into the Next.js App Router project as a complete, production-grade frontend system, replacing the current UI while preserving all auth (Clerk), routing, and API wiring.

**Architecture:** Extract the design into a layered component library — shared design tokens + primitives → layout shells → page sections — then wire each App Router page to use the new components while keeping real API calls and Clerk auth. The preview uses `framer-motion` which we add as a dependency; all other dependencies are already present. The preview's hash-router is replaced by Next.js App Router paths throughout.

**Tech Stack:** Next.js 16 App Router, TypeScript 5, Tailwind CSS 4, framer-motion (new), Clerk, Prisma 7, Lucide icons, shadcn/ui (only where already used for primitives).

**Working directory:** All paths below are relative to `.worktrees/frontend-redesign/`

**Source reference:** `~/Downloads/labs/chapaworks.tsx` — the canonical design source. Pull component implementations directly from it.

---

## Phase 0 — Foundation

### Task 1: Install framer-motion and create design tokens

**Files:**
- Modify: `package.json`
- Create: `lib/design-tokens.ts`

- [ ] **Step 1: Install framer-motion**

```bash
cd .worktrees/frontend-redesign
npm install framer-motion
```

Expected: `framer-motion` appears in `package.json` dependencies.

- [ ] **Step 2: Create design tokens file**

Create `lib/design-tokens.ts`:

```typescript
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
```

- [ ] **Step 3: Run tests to confirm baseline is unchanged**

```bash
npx vitest run __tests__/header.test.tsx __tests__/hero.test.tsx
```

Expected: Both pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json lib/design-tokens.ts
git commit -m "feat: add framer-motion and design tokens"
```

---

### Task 2: Create shared UI primitives

**Files:**
- Create: `components/ui2/fluid-pill-tabs.tsx`
- Create: `components/ui2/status-chip.tsx`
- Create: `components/ui2/avatar-fallback.tsx`
- Create: `components/ui2/stat-card.tsx`
- Create: `components/ui2/index.ts`

> **Why `ui2`?** The existing `components/ui/` contains shadcn primitives we must not disturb. These new primitives are design-system components specific to the redesign.

- [ ] **Step 1: Create FluidPillTabs**

Create `components/ui2/fluid-pill-tabs.tsx` — copy the `FluidPillTabs` function verbatim from `~/Downloads/labs/chapaworks.tsx` (lines ~398–539) and add the needed imports at the top:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

export type PillTabOption<Value extends string> = {
  id: Value;
  label: string;
  helper?: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
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
  // ... (full implementation from chapaworks.tsx lines 398-539)
}
```

Paste the complete `FluidPillTabs` implementation from the source file. Replace `softShadow` with `SHADOWS.soft` and `COLORS.*` references remain as-is.

- [ ] **Step 2: Create StatusChip**

Create `components/ui2/status-chip.tsx`:

```typescript
"use client";

import { COLORS } from "@/lib/design-tokens";

type Status = "PENDING" | "ACTIVE" | "QUOTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REJECTED" | "SUSPENDED";

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string; dot: string }> = {
  PENDING:     { label: "Pending",     bg: "#fefce8", color: "#854d0e", dot: "#ca8a04" },
  ACTIVE:      { label: "Active",      bg: COLORS.primaryTint, color: COLORS.primaryActive, dot: COLORS.primary },
  QUOTED:      { label: "Quoted",      bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  ACCEPTED:    { label: "Accepted",    bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  IN_PROGRESS: { label: "In Progress", bg: "#faf5ff", color: "#7e22ce", dot: "#a855f7" },
  COMPLETED:   { label: "Completed",   bg: "#f0fdf4", color: "#15803d", dot: "#16a34a" },
  CANCELLED:   { label: "Cancelled",   bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
  REJECTED:    { label: "Rejected",    bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
  SUSPENDED:   { label: "Suspended",   bg: "#fff7ed", color: "#9a3412", dot: "#f97316" },
};

export function StatusChip({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}
```

- [ ] **Step 3: Create AvatarFallback**

Create `components/ui2/avatar-fallback.tsx`:

```typescript
"use client";

import { COLORS } from "@/lib/design-tokens";

const AVATAR_PALETTE = [
  ["#ecfdf5", "#059669"],
  ["#eff6ff", "#1d4ed8"],
  ["#faf5ff", "#7e22ce"],
  ["#fff7ed", "#c2410c"],
  ["#fdf2f8", "#9d174d"],
  ["#f0fdf4", "#15803d"],
];

function getColorPair(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function AvatarFallback({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [bg, fg] = getColorPair(name);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={`inline-grid place-items-center rounded-full font-semibold ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.36,
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
```

- [ ] **Step 4: Create StatCard**

Create `components/ui2/stat-card.tsx`:

```typescript
"use client";

import { COLORS } from "@/lib/design-tokens";
import type { LucideIcon } from "lucide-react";

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
    trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : COLORS.muted;

  return (
    <div
      className="rounded-[18px] border bg-white p-5"
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-[1.23]" style={{ color: COLORS.muted }}>
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
        <p className="mt-2 text-[13px] leading-[1.23]" style={{ color: trendColor }}>
          {trendLabel ?? subtext}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create barrel export**

Create `components/ui2/index.ts`:

```typescript
export { FluidPillTabs } from "./fluid-pill-tabs";
export type { PillTabOption } from "./fluid-pill-tabs";
export { StatusChip } from "./status-chip";
export { AvatarFallback } from "./avatar-fallback";
export { StatCard } from "./stat-card";
```

- [ ] **Step 6: Run build check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors before proceeding.

- [ ] **Step 7: Commit**

```bash
git add components/ui2/
git commit -m "feat: add ui2 primitive components (FluidPillTabs, StatusChip, AvatarFallback, StatCard)"
```

---

## Phase 1 — Public Header & Navigation

### Task 3: New public header (Header component)

**Files:**
- Create: `components/layout/header-new.tsx`

The preview's `Header` function (lines ~3177–3398) implements a polished sticky header with:
- Scroll-based background transition
- Animated search popover with morphing pill
- Product tabs (Repairs / Build / Design)
- Account menu popover
- Mobile search panel

- [ ] **Step 1: Create header component**

Create `components/layout/header-new.tsx`. Copy the following functions verbatim from `~/Downloads/labs/chapaworks.tsx` and assemble them into the file:

- `scrollToId` helper
- `AccountMenuPopover` (lines ~2168–2311)
- `AccountControls` (lines ~2312–2386)
- `lerp` helper (line ~2387)
- `SearchPopover` (lines ~2398–2697)
- `MorphingSearchBar` (lines ~2698–3059)
- `MobileSearchPill` (lines ~3060–3091)
- `MobileSearchPanel` (lines ~3092–3176)
- `ProductTabs` (lines ~2038–2167)
- `Header` (lines ~3177–3398)
- `ChapaWorksLogo` (lines ~1993–2037)

Add these imports at the top of the file:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Search, Menu, UserRound, Hammer, Paintbrush, Wrench,
  MapPin, ShieldCheck, Star, BadgeCheck, Eye, MessageCircle,
  Shield, Zap, HelpCircle, UserPlus, Gift, ChevronRight,
  ChevronLeft, X, Loader2, ArrowRight, CheckCircle2, Sparkles,
  PaintBucket, Camera, Car, Scissors,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { COLORS, SHADOWS, TRANSITIONS } from "@/lib/design-tokens";
```

Replace the preview's `onNavigate` prop on `AccountControls` and `AccountMenuPopover` with `useRouter().push()` internally.

The `Header` component should accept:
```typescript
export type ProductTabId = "repairs" | "build" | "design";

export interface HeaderProps {
  activeTab?: ProductTabId;
  onTabChange?: (tab: ProductTabId) => void;
}

export default function Header({ activeTab = "repairs", onTabChange }: HeaderProps) {
  // ... implementation from preview
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "header-new" | head -20
```

Fix any errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/header-new.tsx
git commit -m "feat: add new polished public header with search popover and product tabs"
```

---

### Task 4: New public footer

**Files:**
- Create: `components/layout/footer-new.tsx`

- [ ] **Step 1: Create footer**

Create `components/layout/footer-new.tsx`. Extract the footer section from the preview's home page render (search for `cityLinks` usage in the main page render around line ~19313) and any existing footer component.

```typescript
import Link from "next/link";
import { COLORS } from "@/lib/design-tokens";
import { MapPin } from "lucide-react";

const cityLinks: Array<[string, string]> = [
  ["Nairobi", "Home repair specialists"],
  ["Kiambu", "Carpenters and masons"],
  ["Mombasa", "Cleaning and maintenance"],
  ["Machakos", "Plumbers and electricians"],
  ["Kajiado", "Welders and fabricators"],
  ["Nakuru", "Painters and finishers"],
];

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <p className="mb-1 text-[14px] font-semibold" style={{ color: COLORS.ink }}>
              ChapaWorks
            </p>
            <p className="text-[13px] leading-[1.5]" style={{ color: COLORS.muted }}>
              The marketplace connecting clients with verified artisans across Kenya.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: COLORS.mutedSoft }}>
              Explore
            </p>
            <div className="flex flex-col gap-2">
              {[["Browse artisans", "/artisans"], ["For artisans", "/for-artisans"], ["How it works", "/artisans#how-it-works"]].map(([label, href]) => (
                <Link key={href} href={href} className="text-[13px] leading-[1.43] transition-colors hover:underline" style={{ color: COLORS.body }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: COLORS.mutedSoft }}>
              Cities
            </p>
            <div className="flex flex-col gap-2">
              {cityLinks.map(([city]) => (
                <Link key={city} href={`/artisans?county=${city}`} className="flex items-center gap-1.5 text-[13px] leading-[1.43] transition-colors hover:underline" style={{ color: COLORS.body }}>
                  <MapPin size={12} style={{ color: COLORS.muted }} />
                  {city}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: COLORS.mutedSoft }}>
              Account
            </p>
            <div className="flex flex-col gap-2">
              {[["Sign in", "/sign-in"], ["Create account", "/sign-up"], ["Artisan profile", "/sign-up?role=artisan"]].map(([label, href]) => (
                <Link key={href} href={href} className="text-[13px] leading-[1.43] transition-colors hover:underline" style={{ color: COLORS.body }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row" style={{ borderColor: COLORS.hairlineSoft }}>
          <p className="text-[13px]" style={{ color: COLORS.mutedSoft }}>
            © {new Date().getFullYear()} ChapaWorks. All rights reserved.
          </p>
          <p className="text-[13px]" style={{ color: COLORS.mutedSoft }}>
            Built for Kenya's skilled artisan community.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/footer-new.tsx
git commit -m "feat: add new footer with city links and navigation"
```

---

## Phase 2 — Public Pages

### Task 5: Home page redesign

**Files:**
- Modify: `app/page.tsx`
- Create: `components/landing/hero-band.tsx`
- Create: `components/landing/how-it-works.tsx`
- Create: `components/landing/artisan-cta-band.tsx`
- Create: `components/landing/category-strip.tsx`
- Create: `components/landing/artisan-preview-card.tsx`
- Create: `components/landing/portfolio-quick-view.tsx`

- [ ] **Step 1: Create HeroBand**

Create `components/landing/hero-band.tsx`. Extract the `HeroBand` function (lines ~3886–3917) from the preview. It takes `activeTab: ProductTabId` and `tabContent` config. Make it a server-compatible display component:

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "@/lib/design-tokens";
import type { ProductTabId } from "@/components/layout/header-new";

const tabContent: Record<ProductTabId, { eyebrow: string; heading: string; title: string; subtitle: string }> = {
  repairs: {
    eyebrow: "Verified repair artisans across Kenya",
    heading: "Find the right craftsperson for the job.",
    title: "Available repair artisans near you",
    subtitle: "Fast-response specialists for plumbing, electrical, cleaning, and general home fixes.",
  },
  build: {
    eyebrow: "Trusted builders and fabricators",
    heading: "Plan, build, and finish with skilled local pros.",
    title: "Build specialists for your next project",
    subtitle: "Carpenters, masons, and welders for installations, upgrades, and structural work.",
  },
  design: {
    eyebrow: "Finish and style your space",
    heading: "Bring a cleaner, sharper look to your home or workspace.",
    title: "Design and finishing artisans",
    subtitle: "Painters, carpenters, and finish-focused artisans for interiors, surfaces, and custom details.",
  },
};

export function HeroBand({ activeTab }: { activeTab: ProductTabId }) {
  const content = tabContent[activeTab];
  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-8 pb-4 md:px-10 md:pt-12 md:pb-6">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-2 text-[13px] font-medium" style={{ color: COLORS.muted }}>
            {content.eyebrow}
          </p>
          <h1
            className="max-w-[720px] text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] md:text-[42px]"
            style={{ color: COLORS.ink }}
          >
            {content.heading}
          </h1>
          <p className="mt-3 max-w-[600px] text-[16px] leading-[1.5]" style={{ color: COLORS.body }}>
            {content.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
```

- [ ] **Step 2: Create HowItWorksSection**

Create `components/landing/how-it-works.tsx`. Copy verbatim from the preview's `HowItWorksSection` (lines ~1063–1146). Add imports:

```typescript
import { Search, MessageCircle, CheckCircle2 } from "lucide-react";
import { COLORS } from "@/lib/design-tokens";
```

- [ ] **Step 3: Create ArtisanCtaBand**

Create `components/landing/artisan-cta-band.tsx`. Copy from the preview's `ArtisanCtaBand` (lines ~1147–1193). Replace `onNavigate` prop with a `Link` to `/sign-up?role=artisan`:

```typescript
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COLORS } from "@/lib/design-tokens";

export function ArtisanCtaBand() {
  return (
    <section id="for-artisans" className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-12">
      <div
        className="grid gap-6 rounded-[28px] border p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8"
        style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
      >
        <div>
          <p className="mb-2 text-[14px] font-medium" style={{ color: COLORS.primary }}>For artisans</p>
          <h2 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>
            Are you a skilled artisan?
          </h2>
          <p className="mt-2 max-w-[620px] text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
            Build a trusted profile, show your portfolio, receive client messages, and grow with verified marketplace visibility.
          </p>
        </div>
        <Link
          href="/sign-up?role=artisan"
          className="flex h-12 w-fit items-center justify-center gap-2 rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          Create artisan profile
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create CategoryStrip**

Create `components/landing/category-strip.tsx`. Copy verbatim from the preview's `CategoryStrip` (lines ~971–1009) and `categoryOptions` constant. Replace `onChange` prop signature with `(category: string) => void`.

- [ ] **Step 5: Create ArtisanPreviewCard**

Create `components/landing/artisan-preview-card.tsx`. Copy the `ArtisanPreviewCard` function (lines ~3679–3885) and `ArtisanCardSkeleton` (lines ~3399–3455) from the preview. These cards render artisan data with gradient thumbnails, rating, availability badge, and action buttons.

Add appropriate imports and replace `onOpenPortfolio`/`onViewProfile` callbacks with Next.js router navigation:

```typescript
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
import { BadgeCheck, Star, MapPin, Eye, MessageCircle } from "lucide-react";

export type ArtisanCardData = {
  id: string;
  name: string;
  profession: string;
  profileImage: string | null;
  portfolioThumbnail: string | null;
  location: { city: string; county: string };
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string }>;
  gradient?: string;
};

export function ArtisanCardSkeleton() {
  // ... copy from preview lines 3399-3455
}

export function ArtisanPreviewCard({ artisan }: { artisan: ArtisanCardData }) {
  const router = useRouter();
  // ... copy body from preview, wiring view/portfolio to router.push
}
```

- [ ] **Step 6: Create PortfolioQuickView**

Create `components/landing/portfolio-quick-view.tsx`. Copy the `PortfolioQuickView` function (lines ~3456–3678) from the preview. This is a modal drawer that shows an artisan's portfolio preview. Wire close to state passed from parent.

- [ ] **Step 7: Rewrite app/page.tsx**

Replace `app/page.tsx` with the new home page that:
- Fetches real artisans from `/api/artisans` (keep existing fetch logic from current `app/page.tsx`)
- Uses the new Header, HeroBand, CategoryStrip, ArtisanPreviewCard, HowItWorksSection, ArtisanCtaBand, Footer

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import Header, { type ProductTabId } from "@/components/layout/header-new";
import Footer from "@/components/layout/footer-new";
import { HeroBand } from "@/components/landing/hero-band";
import { CategoryStrip } from "@/components/landing/category-strip";
import { ArtisanPreviewCard, ArtisanCardSkeleton } from "@/components/landing/artisan-preview-card";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { ArtisanCtaBand } from "@/components/landing/artisan-cta-band";
import { COLORS } from "@/lib/design-tokens";
import { AnimatePresence, motion } from "framer-motion";

// Artisan type matching API response
// (reuse/extend existing ArtisanCardData type)

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ProductTabId>("repairs");
  const [activeCategory, setActiveCategory] = useState("All");
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artisans?limit=12")
      .then((res) => res.json())
      .then((data) => {
        setArtisans(data.artisans ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const TAB_PROFESSIONS: Record<ProductTabId, string[]> = {
    repairs: ["Plumber", "Electrician", "Cleaner", "Handyman"],
    build:   ["Carpenter", "Mason", "Welder"],
    design:  ["Painter", "Carpenter"],
  };

  const filtered = useMemo(() => {
    let list = artisans;
    if (activeCategory !== "All") {
      list = list.filter((a) => a.profession === activeCategory);
    } else {
      list = list.filter((a) => TAB_PROFESSIONS[activeTab].includes(a.profession));
    }
    return list;
  }, [artisans, activeTab, activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <HeroBand activeTab={activeTab} />
      <CategoryStrip activeCategory={activeCategory} onChange={setActiveCategory} />

      <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
          <AnimatePresence mode="popLayout" initial={false}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ArtisanCardSkeleton key={i} />)
              : filtered.map((artisan) => (
                  <motion.div
                    key={artisan.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ArtisanPreviewCard artisan={artisan} />
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>
      </section>

      <HowItWorksSection />
      <ArtisanCtaBand />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 8: Run existing tests**

```bash
npx vitest run __tests__/header.test.tsx __tests__/hero.test.tsx __tests__/responsive.test.tsx
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx components/landing/
git commit -m "feat: redesign home page with new header, hero, category strip, and artisan cards"
```

---

### Task 6: Browse artisans page (/artisans)

**Files:**
- Modify: `app/artisans/page.tsx`
- Create: `components/landing/browse-directory.tsx`

- [ ] **Step 1: Create BrowseDirectorySection**

Create `components/landing/browse-directory.tsx`. Copy the `BrowseDirectorySection` function (lines ~1674–1992) from the preview. Replace the mock `artisans` array with props:

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
import { ArtisanPreviewCard } from "./artisan-preview-card";
import type { ArtisanCardData } from "./artisan-preview-card";
import { Search, ListFilter, X, ChevronLeft, ChevronRight } from "lucide-react";

export function BrowseDirectorySection({
  initialArtisans,
  initialProfessions,
  initialCounties,
}: {
  initialArtisans: ArtisanCardData[];
  initialProfessions: string[];
  initialCounties: string[];
}) {
  // State: query, profession, county, sortBy, availableOnly, page
  // Filter/sort logic from preview
  // Render search form + filter chips + artisan grid + pagination
  // On filter change, push to /artisans?profession=X&county=Y etc.
  // ... (copy full implementation from lines 1674-1992, adapting props)
}
```

- [ ] **Step 2: Update app/artisans/page.tsx**

Keep the existing server-side data fetch but replace the render with `BrowseDirectorySection`:

```typescript
import { Suspense } from "react";
import Header from "@/components/layout/header-new";
import Footer from "@/components/layout/footer-new";
import { BrowseDirectorySection } from "@/components/landing/browse-directory";
import { prisma } from "@/lib/prisma";

async function getArtisanData() {
  const artisans = await prisma.artisan.findMany({
    where: { verificationStatus: "APPROVED" },
    include: {
      user: { select: { name: true } },
      specializations: true,
      _count: { select: { reviews: true } },
    },
    take: 50,
    orderBy: { averageRating: "desc" },
  });
  // transform to ArtisanCardData shape
  return artisans;
}

export default async function BrowseArtisansPage() {
  const artisans = await getArtisanData();
  const professions = [...new Set(artisans.map((a) => a.profession).filter(Boolean))];
  const counties = [...new Set(artisans.map((a) => a.county).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense>
        <BrowseDirectorySection
          initialArtisans={artisans as any}
          initialProfessions={professions as string[]}
          initialCounties={counties as string[]}
        />
      </Suspense>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/artisans/page.tsx" components/landing/browse-directory.tsx
git commit -m "feat: redesign browse artisans page with filter, sort, and pagination"
```

---

### Task 7: Artisan public profile page (/artisans/[id])

**Files:**
- Modify: `app/artisans/[id]/page.tsx`
- Create: `components/landing/artisan-profile-section.tsx`

- [ ] **Step 1: Create ArtisanProfileSection**

Create `components/landing/artisan-profile-section.tsx`. Copy the `PublicArtisanProfileSection` function (lines ~3987–4315) from the preview. This renders a full artisan profile with:
- Hero gradient header with avatar, name, profession, location
- Rating, review count, hourly rate stats
- Specialization tags
- Portfolio grid
- "Message artisan" CTA (→ sign in if unauthenticated)

```typescript
"use client";

import { COLORS, SHADOWS } from "@/lib/design-tokens";
import { BadgeCheck, Star, MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ArtisanCardData } from "./artisan-preview-card";

type FullArtisanProfile = ArtisanCardData & {
  bio: string | null;
  experience: number | null;
  memberSince: string;
  portfolio: Array<{
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    gradient?: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    body: string | null;
    clientName: string;
    createdAt: string;
  }>;
};

export function ArtisanProfileSection({ artisan }: { artisan: FullArtisanProfile }) {
  // ... copy from preview PublicArtisanProfileSection, replacing navigate with Link/router
}
```

- [ ] **Step 2: Update app/artisans/[id]/page.tsx**

Keep existing data fetch, replace render:

```typescript
import Header from "@/components/layout/header-new";
import Footer from "@/components/layout/footer-new";
import { ArtisanProfileSection } from "@/components/landing/artisan-profile-section";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ArtisanProfilePage({ params }: { params: { id: string } }) {
  const artisan = await prisma.artisan.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, image: true } },
      specializations: true,
      portfolioItems: { take: 8, orderBy: { featured: "desc" } },
      reviews: { take: 5, orderBy: { createdAt: "desc" }, include: { client: { include: { user: { select: { name: true } } } } } },
    },
  });

  if (!artisan) notFound();

  // transform to FullArtisanProfile shape
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ArtisanProfileSection artisan={artisan as any} />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/artisans/[id]/page.tsx" components/landing/artisan-profile-section.tsx
git commit -m "feat: redesign artisan public profile page"
```

---

### Task 8: For Artisans landing page (/for-artisans)

**Files:**
- Modify: `app/for-artisans/page.tsx`

- [ ] **Step 1: Create ForArtisansPage component**

Create `components/landing/for-artisans-page.tsx`. Copy the `ForArtisansLandingPage` function (lines ~1194–1654) from the preview. Replace `onNavigate` with `Link` and `useRouter`:

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
import {
  UserRound, Images, FileCheck2, Search, MessageCircle,
  ReceiptText, ClipboardList, Hammer, ArrowRight
} from "lucide-react";
// ... rest of imports

export function ForArtisansPage() {
  // Full implementation from preview ForArtisansLandingPage
  // Replace: onNavigate("/sign-up?role=artisan") → router.push("/sign-up?role=artisan")
  // Replace: onNavigate("/artisan/dashboard") → router.push("/artisan-dashboard")
}
```

- [ ] **Step 2: Update app/for-artisans/page.tsx**

```typescript
import Header from "@/components/layout/header-new";
import Footer from "@/components/layout/footer-new";
import { ForArtisansPage } from "@/components/landing/for-artisans-page";

export default function ForArtisansRoute() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ForArtisansPage />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/for-artisans/page.tsx components/landing/for-artisans-page.tsx
git commit -m "feat: redesign For Artisans landing page"
```

---

## Phase 3 — Auth Pages

### Task 9: Auth pages redesign

**Files:**
- Create: `components/auth/auth-shell.tsx`
- Modify: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Modify: `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

The preview's `AuthPreviewSection` (lines ~4316–4737) shows polished sign-in/sign-up UI wrapping Clerk's `<SignIn>` and `<SignUp>` components.

- [ ] **Step 1: Create AuthShell**

Create `components/auth/auth-shell.tsx`:

```typescript
import Link from "next/link";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
import { ArrowLeft } from "lucide-react";

export function AuthShell({
  mode,
  children,
}: {
  mode: "sign-in" | "sign-up" | "artisan-sign-up";
  children: React.ReactNode;
}) {
  const headlines = {
    "sign-in": {
      eyebrow: "Welcome back",
      title: "Sign in to ChapaWorks",
      subtitle: "Access your jobs, messages, and profile.",
      alt: { label: "Don't have an account?", linkLabel: "Create one", href: "/sign-up" },
    },
    "sign-up": {
      eyebrow: "Get started",
      title: "Create your account",
      subtitle: "Join as a client to discover and hire skilled artisans.",
      alt: { label: "Already have an account?", linkLabel: "Sign in", href: "/sign-in" },
    },
    "artisan-sign-up": {
      eyebrow: "List your craft",
      title: "Create artisan profile",
      subtitle: "Set up your profile, add your work, and start receiving client requests.",
      alt: { label: "Looking for artisans?", linkLabel: "Browse instead", href: "/artisans" },
    },
  };

  const { eyebrow, title, subtitle, alt } = headlines[mode];

  return (
    <div
      className="min-h-screen"
      style={{ background: COLORS.surfaceSoft }}
    >
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center px-5 py-12">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-[14px] font-medium transition-colors hover:underline"
          style={{ color: COLORS.muted }}
        >
          <ArrowLeft size={15} />
          Back to ChapaWorks
        </Link>
        <div
          className="rounded-[24px] border bg-white p-6 md:p-8"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
        >
          <p className="mb-1 text-[13px] font-medium" style={{ color: COLORS.primary }}>
            {eyebrow}
          </p>
          <h1
            className="text-[26px] font-semibold leading-[1.15] tracking-[-0.04em]"
            style={{ color: COLORS.ink }}
          >
            {title}
          </h1>
          <p className="mt-2 text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
          <p className="mt-5 text-center text-[13px]" style={{ color: COLORS.muted }}>
            {alt.label}{" "}
            <Link href={alt.href} className="font-medium underline-offset-3 hover:underline" style={{ color: COLORS.primary }}>
              {alt.linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update sign-in page**

```typescript
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn />
    </AuthShell>
  );
}
```

- [ ] **Step 3: Update sign-up page**

```typescript
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const mode = searchParams.role === "artisan" ? "artisan-sign-up" : "sign-up";
  return (
    <AuthShell mode={mode}>
      <SignUp />
    </AuthShell>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/auth/ "app/(auth)/sign-in/[[...sign-in]]/page.tsx" "app/(auth)/sign-up/[[...sign-up]]/page.tsx"
git commit -m "feat: redesign auth pages with polished AuthShell wrapper"
```

---

## Phase 4 — Dashboard Shell

### Task 10: New dashboard sidebar + shell

**Files:**
- Create: `components/dashboard2/dashboard-shell.tsx`
- Create: `components/dashboard2/dashboard-sidebar.tsx`
- Create: `components/dashboard2/dashboard-topbar.tsx`
- Create: `components/dashboard2/dashboard-mobile-nav.tsx`
- Create: `components/dashboard2/index.ts`

> **Why `dashboard2`?** The existing `components/dashboard/` folder has current implementation. We build in parallel, then swap layouts.

- [ ] **Step 1: Create DashboardSidebar**

Create `components/dashboard2/dashboard-sidebar.tsx`. Copy the `DashboardSidebar` function (lines ~4926–5152) from the preview. It renders a collapsible sidebar with role-based nav items.

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
import type { LucideIcon } from "lucide-react";
import { PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashboardNavItem<View extends string> = {
  id: View;
  label: string;
  icon: LucideIcon;
  badge?: number;
  href: string;
};

export function DashboardSidebar<View extends string>({
  title,
  subtitle,
  items,
  activeView,
  onSelect,
  collapsed,
  onToggle,
  role,
}: {
  title: string;
  subtitle: string;
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
  collapsed: boolean;
  onToggle?: () => void;
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  // Full implementation from preview lines 4926-5152
  // Replace navigate/hash routing with onSelect callbacks
}
```

- [ ] **Step 2: Create DashboardTopBar**

Create `components/dashboard2/dashboard-topbar.tsx`. Copy the `DashboardTopBar` function (lines ~330–374) along with `DashboardThemeToggle` (lines ~5208–5247), `DashboardNotificationButton` (lines ~5248–5403), `DashboardProfileButton` (lines ~5404–5534) from the preview.

Wire `DashboardProfileButton` to use Clerk's `useUser()` for real user data.

```typescript
"use client";

import { useUser } from "@clerk/nextjs";
import { COLORS } from "@/lib/design-tokens";
import { DashboardThemeToggle } from "./dashboard-theme-toggle";
import { DashboardNotificationButton } from "./dashboard-notification-button";

export function DashboardTopBar({
  eyebrow,
  title,
  meta,
  role,
}: {
  eyebrow: string;
  title: string;
  meta?: React.ReactNode;
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  // Full implementation from preview
}
```

- [ ] **Step 3: Create DashboardMobileNav**

Create `components/dashboard2/dashboard-mobile-nav.tsx`. Copy `DashboardMobileNav` (lines ~5153–5207) from preview.

- [ ] **Step 4: Create DashboardShell**

Create `components/dashboard2/dashboard-shell.tsx`:

```typescript
"use client";

import { useState } from "react";
import { DashboardSidebar, type DashboardNavItem } from "./dashboard-sidebar";
import { DashboardTopBar } from "./dashboard-topbar";
import { DashboardMobileNav } from "./dashboard-mobile-nav";
import { COLORS } from "@/lib/design-tokens";

export function DashboardShell<View extends string>({
  title,
  subtitle,
  eyebrow,
  activeLabel,
  items,
  activeView,
  onSelect,
  role,
  headerMeta,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  activeLabel?: string;
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
  role: "Artisan" | "Client" | "Admin" | "Studio";
  headerMeta?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <section className="h-screen w-full overflow-hidden bg-white">
      <div
        className="grid h-screen transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={{ ["--sidebar-width" as string]: sidebarCollapsed ? "88px" : "260px" }}
      >
        <DashboardSidebar
          title={title}
          subtitle={subtitle}
          items={items}
          activeView={activeView}
          onSelect={onSelect}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          role={role}
        />
        <div className="min-h-0 min-w-0 overflow-y-auto bg-white">
          <DashboardMobileNav items={items} activeView={activeView} onSelect={onSelect} />
          <DashboardTopBar
            eyebrow={eyebrow}
            title={activeLabel ?? title}
            role={role}
            meta={headerMeta}
          />
          {children}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create barrel export**

Create `components/dashboard2/index.ts`:

```typescript
export { DashboardShell } from "./dashboard-shell";
export type { DashboardNavItem } from "./dashboard-sidebar";
```

- [ ] **Step 6: Commit**

```bash
git add components/dashboard2/
git commit -m "feat: add dashboard2 shell, sidebar, topbar, and mobile nav components"
```

---

## Phase 5 — Artisan Dashboard

### Task 11: Artisan dashboard layout and overview

**Files:**
- Create: `components/dashboard2/artisan/artisan-dashboard.tsx`
- Modify: `app/(artisan-dashboard)/artisan-dashboard/page.tsx`
- Modify: `app/(artisan-dashboard)/layout.tsx`

- [ ] **Step 1: Create ArtisanDashboardCore**

Create `components/dashboard2/artisan/artisan-dashboard.tsx`. Extract the artisan dashboard section from the preview's `ArtisanDashboardCoreSection` (lines ~10606–13293). This is the largest section.

Break it into sub-components in the same file or separate files:
- `ArtisanOverview` — stat cards + recent jobs list
- `ArtisanJobs` — jobs list with tab filter (all/requested/quoted/active)
- `ArtisanMessages` — messaging pane
- `ArtisanPortfolio` — portfolio grid + add/edit
- `ArtisanEarnings` — payout history + earnings chart
- `ArtisanSubscription` — plan cards
- `ArtisanSettings` — profile form

The key nav items for artisan dashboard:
```typescript
import {
  LayoutDashboard, ClipboardList, MessageCircle, Images,
  WalletCards, Star, Settings, BarChart3
} from "lucide-react";

const ARTISAN_NAV = [
  { id: "overview",     label: "Overview",     icon: LayoutDashboard, href: "/artisan-dashboard" },
  { id: "jobs",         label: "Jobs",         icon: ClipboardList,   href: "/artisan-dashboard/jobs" },
  { id: "messages",     label: "Messages",     icon: MessageCircle,   href: "/artisan-dashboard/messages" },
  { id: "portfolio",    label: "Portfolio",    icon: Images,          href: "/artisan-dashboard/portfolio" },
  { id: "earnings",     label: "Earnings",     icon: WalletCards,     href: "/artisan-dashboard/earnings" },
  { id: "subscription", label: "Subscription", icon: Star,            href: "/artisan-dashboard/subscription" },
  { id: "settings",     label: "Settings",     icon: Settings,        href: "/artisan-dashboard/settings" },
];
```

For the overview section, replace mock stat data with real API calls to `/api/artisan/jobs/stats` and `/api/artisan/earnings`.

- [ ] **Step 2: Update artisan dashboard layout**

Replace `app/(artisan-dashboard)/layout.tsx`:

```typescript
import { ArtisanDashboardLayout } from "@/components/dashboard2/artisan/artisan-dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArtisanDashboardLayout>{children}</ArtisanDashboardLayout>;
}
```

Create `components/dashboard2/artisan/artisan-dashboard-layout.tsx`:

```typescript
"use client";

import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard2/dashboard-shell";
import { ARTISAN_NAV } from "./artisan-nav";

export function ArtisanDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeView = ARTISAN_NAV.find((item) =>
    pathname === item.href || pathname.startsWith(item.href + "/")
  )?.id ?? "overview";

  return (
    <DashboardShell
      title="Artisan Dashboard"
      subtitle="Manage your craft"
      eyebrow="Artisan workspace"
      activeLabel={ARTISAN_NAV.find((i) => i.id === activeView)?.label}
      items={ARTISAN_NAV}
      activeView={activeView}
      onSelect={(view) => router.push(ARTISAN_NAV.find((i) => i.id === view)!.href)}
      role="Artisan"
    >
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 3: Update artisan dashboard pages**

Update `app/(artisan-dashboard)/artisan-dashboard/page.tsx` to render the new `ArtisanOverview` component with real API data.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard2/artisan/ "app/(artisan-dashboard)/"
git commit -m "feat: redesign artisan dashboard with new shell and overview"
```

---

### Task 12: Artisan dashboard — Jobs, Messages, Portfolio

**Files:**
- Modify: `app/(artisan-dashboard)/artisan-dashboard/jobs/page.tsx`
- Modify: `app/(artisan-dashboard)/artisan-dashboard/messages/page.tsx`
- Modify: `app/(artisan-dashboard)/artisan-dashboard/portfolio/page.tsx`

- [ ] **Step 1: Port ArtisanJobs section**

Extract the jobs view from `ArtisanDashboardCoreSection` in the preview. The jobs view includes:
- `FluidPillTabs` for all/requested/quoted/active filter
- Job list cards with status chips
- Quick detail slideover for job detail
- Quote workflow builder (for sending quotes)

Wire to real API: `GET /api/artisan/jobs`, `POST /api/artisan/jobs/[id]/quote`, `PATCH /api/artisan/jobs/[id]/status`.

Update `app/(artisan-dashboard)/artisan-dashboard/jobs/page.tsx`:
```typescript
"use client";

import { ArtisanJobsView } from "@/components/dashboard2/artisan/artisan-jobs";

export default function ArtisanJobsPage() {
  return <ArtisanJobsView />;
}
```

- [ ] **Step 2: Port ArtisanMessages section**

Extract the messages view from the preview's `DashboardMessagesPane` (lines ~6507–7087). This renders a split pane: conversation list on left, message thread on right.

Wire to real API: `GET /api/conversations`, `GET /api/conversations/[id]/messages`, `POST /api/conversations/[id]/messages`.

- [ ] **Step 3: Port ArtisanPortfolio section**

Extract the portfolio management view from the preview's portfolio section in `ArtisanDashboardCoreSection`. Includes a grid of portfolio items, add/edit modal, featured toggle.

Wire to real API: `GET /api/artisan/portfolio`, `POST /api/artisan/portfolio`, `PATCH /api/artisan/portfolio/[id]`, `DELETE /api/artisan/portfolio/[id]`.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard2/artisan/ "app/(artisan-dashboard)/artisan-dashboard/jobs/page.tsx" "app/(artisan-dashboard)/artisan-dashboard/messages/page.tsx" "app/(artisan-dashboard)/artisan-dashboard/portfolio/page.tsx"
git commit -m "feat: port artisan jobs, messages, and portfolio dashboard views"
```

---

### Task 13: Artisan dashboard — Earnings, Subscription, Settings

**Files:**
- Modify: `app/(artisan-dashboard)/artisan-dashboard/earnings/page.tsx`
- Modify: `app/(artisan-dashboard)/artisan-dashboard/subscription/page.tsx`
- Modify: `app/(artisan-dashboard)/artisan-dashboard/settings/page.tsx`

- [ ] **Step 1: Port ArtisanEarnings**

Extract the earnings view from the preview. Includes payout history table, total earned stat, commission rate display.

Wire to: `GET /api/artisan/earnings`.

- [ ] **Step 2: Port ArtisanSubscription**

Extract the subscription view from the preview. Shows current plan (Free/Pro), upgrade CTA, feature comparison.

Wire to: `GET /api/artisan/subscription`, `POST /api/artisan/subscription/upgrade`.

- [ ] **Step 3: Port ArtisanSettings**

Extract the settings view from the preview. Form for: display name, bio, profession, specializations, location, hourly rate, availability toggle, notification preferences.

Wire to: `GET /api/artisan/profile`, `PATCH /api/artisan/profile`.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard2/artisan/ "app/(artisan-dashboard)/artisan-dashboard/earnings/page.tsx" "app/(artisan-dashboard)/artisan-dashboard/subscription/page.tsx" "app/(artisan-dashboard)/artisan-dashboard/settings/page.tsx"
git commit -m "feat: port artisan earnings, subscription, and settings views"
```

---

## Phase 6 — Client Dashboard

### Task 14: Client dashboard layout and overview

**Files:**
- Create: `components/dashboard2/client/client-dashboard-layout.tsx`
- Modify: `app/(client-dashboard)/layout.tsx`
- Modify: `app/(client-dashboard)/client-dashboard/page.tsx`

The client nav:
```typescript
const CLIENT_NAV = [
  { id: "overview",  label: "Overview",        icon: LayoutDashboard, href: "/client-dashboard" },
  { id: "find",      label: "Find artisans",   icon: Search,          href: "/client-dashboard/find-artisans" },
  { id: "saved",     label: "Saved",           icon: Bookmark,        href: "/client-dashboard/saved" },
  { id: "jobs",      label: "Jobs",            icon: ClipboardList,   href: "/client-dashboard/jobs" },
  { id: "messages",  label: "Messages",        icon: MessageCircle,   href: "/client-dashboard/messages" },
  { id: "reviews",   label: "Reviews",         icon: Star,            href: "/client-dashboard/reviews" },
];
```

- [ ] **Step 1: Create client dashboard layout**

Follow the same pattern as Task 11, creating `components/dashboard2/client/client-dashboard-layout.tsx` using `DashboardShell` with client nav.

- [ ] **Step 2: Update client pages**

Update `app/(client-dashboard)/layout.tsx` to use `ClientDashboardLayout`.

Update `app/(client-dashboard)/client-dashboard/page.tsx` to render the overview: recent jobs, saved artisans count, pending reviews prompt.

Extract from `ClientDashboardCoreSection` (lines ~13349–14136) in the preview.

- [ ] **Step 3: Port Find Artisans, Saved, Jobs, Messages, Reviews**

For each client sub-page, extract the relevant view from `ClientDashboardCoreSection` and create a component + update the page file:

- `find-artisans/page.tsx` → `ClientFindView` — search artisans, message CTA
- `saved/page.tsx` → `ClientSavedView` — saved artisan cards grid
- `jobs/page.tsx` → `ClientJobsView` — job history + create job modal
- `messages/page.tsx` → `ClientMessagesView` — DashboardMessagesPane adapted for client
- `reviews/page.tsx` → `ClientReviewsView` — reviews left + pending reviews

Wire each to their corresponding API endpoints.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard2/client/ "app/(client-dashboard)/"
git commit -m "feat: port client dashboard with all six views"
```

---

## Phase 7 — Admin Dashboard

### Task 15: Admin dashboard layout and core views

**Files:**
- Create: `components/dashboard2/admin/admin-dashboard-layout.tsx`
- Modify: `app/(admin-dashboard)/layout.tsx`
- Multiple admin page files

The admin nav:
```typescript
const ADMIN_NAV = [
  { id: "overview",     label: "Overview",     icon: LayoutDashboard, href: "/admin-dashboard" },
  { id: "verification", label: "Verification", icon: FileCheck2,      href: "/admin-dashboard/verification" },
  { id: "artisans",     label: "Artisans",     icon: Hammer,          href: "/admin-dashboard/artisans" },
  { id: "users",        label: "Users",        icon: UserRound,       href: "/admin-dashboard/users" },
  { id: "invites",      label: "Invites",      icon: Mail,            href: "/admin-dashboard/invites" },
  { id: "moderation",   label: "Moderation",   icon: Shield,          href: "/admin-dashboard/moderation" },
  { id: "analytics",    label: "Analytics",    icon: BarChart3,       href: "/admin-dashboard/analytics" },
  { id: "monitoring",   label: "Monitoring",   icon: Activity,        href: "/admin-dashboard/monitoring" },
  { id: "locations",    label: "Locations",    icon: MapPinned,       href: "/admin-dashboard/locations" },
  { id: "settings",     label: "Settings",     icon: Settings,        href: "/admin-dashboard/settings" },
];
```

- [ ] **Step 1: Create admin dashboard layout**

Create `components/dashboard2/admin/admin-dashboard-layout.tsx` following the same DashboardShell pattern.

- [ ] **Step 2: Update admin layout.tsx**

- [ ] **Step 3: Port admin overview**

Extract the overview section from `AdminOperationsSection` (lines ~14789–15337) in the preview. Shows: total artisans, pending verifications, active jobs, revenue; plus a pending verification queue.

Wire to: `GET /api/admin/stats`, `GET /api/admin/verification`.

- [ ] **Step 4: Port verification, artisans, users, invites views**

For each view, extract from `AdminOperationsSection` and create a `components/dashboard2/admin/*.tsx` component + update the page file.

- Verification: queue of pending artisan docs, approve/reject buttons
- Artisans: paginated artisan table with status, suspend/unsuspend
- Users: paginated user table with role display, ban action
- Invites: invite code management, create new invite

Wire each to admin API endpoints.

- [ ] **Step 5: Port moderation, analytics, monitoring, locations, settings**

- Moderation: flagged content/reports queue
- Analytics: charts from `AdminAnalyticsVisualization` (lines ~14747)
- Monitoring: system health metrics from `AdminOperationsSection`
- Locations: locations table with artisan counts
- Settings: platform settings form

- [ ] **Step 6: Commit**

```bash
git add components/dashboard2/admin/ "app/(admin-dashboard)/"
git commit -m "feat: port admin dashboard with all ten views"
```

---

## Phase 8 — Shared Dashboard Utilities

### Task 16: Port shared dashboard modals and overlays

**Files:**
- Create: `components/dashboard2/shared/quick-detail-slideover.tsx`
- Create: `components/dashboard2/shared/full-detail-modal.tsx`
- Create: `components/dashboard2/shared/dashboard-data-list.tsx`
- Create: `components/dashboard2/shared/dashboard-filter-popover.tsx`

These are reused across artisan and client dashboards.

- [ ] **Step 1: QuickDetailSlideover**

Copy `QuickDetailSlideover` (lines ~5535–5679) from the preview. This is a right-side drawer that slides in with job details.

- [ ] **Step 2: FullDetailViewModal**

Copy `FullDetailViewModal` (lines ~5738–6506) from the preview. This is a full-screen modal with complete job/quote workflow.

- [ ] **Step 3: DashboardDataList**

Copy `DashboardDataList` (lines ~7217–7500) from the preview. A reusable paginated list component with empty state.

- [ ] **Step 4: DashboardFilterPopover**

Copy `DashboardFilterPopover` (lines ~7088–7216) from the preview. A popover with filter checkboxes for dashboard lists.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard2/shared/
git commit -m "feat: add shared dashboard modal and list utility components"
```

---

## Phase 9 — Integration & Polish

### Task 17: Wire up the dashboard/redirect page

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Update dashboard router page**

The current `app/dashboard/page.tsx` should redirect users to their role-specific dashboard:

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user) redirect("/sign-in");

  if (user.role === "ARTISAN") redirect("/artisan-dashboard");
  if (user.role === "ADMIN") redirect("/admin-dashboard");
  redirect("/client-dashboard");
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: role-based dashboard redirect"
```

---

### Task 18: Tailwind config — register new color utilities

**Files:**
- Modify: `tailwind.config.ts` (or equivalent CSS config)

- [ ] **Step 1: Add design token colors to Tailwind**

Check if `tailwind.config.ts` exists (Next.js 16 / Tailwind 4 may use CSS-native config):

```bash
ls tailwind.config* 2>/dev/null || grep -r "@theme" app/globals.css | head -5
```

If using Tailwind 4 CSS config (`app/globals.css` with `@theme`), add the design token colors:

```css
@theme {
  --color-primary: #059669;
  --color-primary-active: #047857;
  --color-primary-soft: #d1fae5;
  --color-primary-tint: #ecfdf5;
  --color-ink: #222222;
  --color-muted: #6a6a6a;
  --color-hairline: #dddddd;
  --color-surface-soft: #f7f7f7;
}
```

If using `tailwind.config.ts`, extend colors there.

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "chore: register design token colors in Tailwind config"
```

---

### Task 19: Final test run and smoke check

- [ ] **Step 1: Run all frontend tests**

```bash
npx vitest run __tests__/header.test.tsx __tests__/hero.test.tsx __tests__/responsive.test.tsx __tests__/components/ui.test.tsx __tests__/components/form.test.tsx __tests__/components/card.test.tsx
```

Expected: all pass.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -40
```

Fix all errors.

- [ ] **Step 3: Lint check**

```bash
npm run lint 2>&1 | head -30
```

Fix any new lint errors.

- [ ] **Step 4: Dev server smoke test**

```bash
npm run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

Expected: 200

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: resolve TypeScript and lint issues from redesign"
```

---

### Task 20: Final commit and branch summary

- [ ] **Step 1: Create PR summary**

Create `docs/superpowers/plans/2026-05-24-frontend-redesign-summary.md` with:
- What was changed (component list)
- What was preserved (API routes, Clerk auth, Prisma schema, test files)
- Known limitations (mock data still in place for X sections)
- Next steps

- [ ] **Step 2: Final commit**

```bash
git add docs/
git commit -m "docs: frontend redesign implementation summary"
```

- [ ] **Step 3: Push branch**

```bash
git push origin frontend-redesign
```

---

## Self-Review

### Spec coverage check

| Requirement | Task |
|---|---|
| Install framer-motion | Task 1 |
| Design tokens | Task 1 |
| Shared primitives (FluidPillTabs, StatusChip, etc.) | Task 2 |
| Public header with search + product tabs | Task 3 |
| Footer | Task 4 |
| Home page | Task 5 |
| Browse artisans page | Task 6 |
| Artisan public profile | Task 7 |
| For Artisans landing | Task 8 |
| Auth pages | Task 9 |
| Dashboard shell + sidebar | Task 10 |
| Artisan dashboard — all 7 views | Tasks 11–13 |
| Client dashboard — all 6 views | Task 14 |
| Admin dashboard — all 10 views | Task 15 |
| Shared dashboard utilities | Task 16 |
| Dashboard router redirect | Task 17 |
| Tailwind token registration | Task 18 |
| Final tests + smoke check | Task 19 |

### Notes

- The preview's mock artisan data should be replaced with real API data throughout
- The `~/Downloads/labs/chapaworks.tsx` source file is 19,785 lines — each task instructs copying specific line ranges verbatim and then wiring to real data
- The admin analytics section uses inline SVG-based charts; these can be kept as-is or swapped for recharts if needed in a follow-up
- The `DashboardMessagesPane` is shared between artisan and client — extract once to `components/dashboard2/shared/messages-pane.tsx` and import in both
