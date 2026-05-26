/* eslint-disable */
// @ts-nocheck
"use client";

import { useOptionalDashboardRealData } from "@/components/dashboard2/context/dashboard-real-data-context";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Menu,
  Search,
  UserRound,
  Hammer,
  Paintbrush,
  Wrench,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  Star,
  BadgeCheck,
  Eye,
  MessageCircle,
  Shield,
  Zap,
  HelpCircle,
  UserPlus,
  LogIn,
  Gift,
  ChevronRight,
  ChevronLeft,
  X,
  Images,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  PaintBucket,
  Camera,
  Car,
  Scissors,
  ListFilter,
  Bookmark,
  CalendarDays,
  Globe2,
  BriefcaseBusiness,
  Mail,
  LockKeyhole,
  KeyRound,
  LayoutDashboard,
  ClipboardList,
  Settings,
  BarChart3,
  WalletCards,
  UserCog,
  Inbox,
  FileCheck2,
  Activity,
  MoreHorizontal,
  PanelLeft,
  Send,
  Ban,
  Flag,
  Database,
  MapPinned,
  BellRing,
  ReceiptText,
  ServerCog,
  FileText,
  LifeBuoy,
  TrendingUp,
  CreditCard,
  CircleDollarSign,
  Map,
  HardDrive,
  Gauge,
  Moon,
  Sun,
  Paperclip,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";

const COLORS = {
  canvas: "var(--cw-canvas, #ffffff)",
  ink: "var(--cw-ink, #222222)",
  body: "var(--cw-body, #3f3f3f)",
  muted: "var(--cw-muted, #6a6a6a)",
  mutedSoft: "var(--cw-muted-soft, #929292)",
  hairline: "var(--cw-hairline, #dddddd)",
  hairlineSoft: "var(--cw-hairline-soft, #ebebeb)",
  surfaceSoft: "var(--cw-surface-soft, #f7f7f7)",
  surfaceStrong: "var(--cw-surface-strong, #f2f2f2)",
  primary: "var(--cw-primary, #059669)",
  primaryActive: "var(--cw-primary-active, #047857)",
  primaryDisabled: "var(--cw-primary-soft, #d1fae5)",
  primarySoft: "var(--cw-primary-soft, #d1fae5)",
  primaryTint: "var(--cw-primary-tint, #ecfdf5)",
  amber: "var(--cw-amber, #f59e0b)",
};

const CHAPAWORKS_LOGO_SRC =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNTEyLjAwMDAwMHB0IiBoZWlnaHQ9IjUxMi4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDUxMi4wMDAwMDAgNTEyLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTE0NTAgNDQ4MSBsLTExMDUgLTYzOCAwIC0xMjgzIDAgLTEyODMgMTEwNiAtNjM4IDExMDYgLTYzOSAxMTA2CjYzNyAxMTA2IDYzOCAwIDEyODUgMCAxMjg1IC0xMTAxIDYzNSBjLTYwNiAzNDkgLTExMDQgNjM2IC0xMTA3IDYzNyAtMyAxCi01MDMgLTI4NSAtMTExMSAtNjM2eiBtOTYwIDMwIGwwIC0xNjkgLTY2MCAtMzgxIC02NjAgLTM4MSAtMTUxIDg3IGMtMTI2IDcyCi0xNDcgODggLTEzMiA5NyAxMCA1IDM3MSAyMTQgODAzIDQ2MyA0MzIgMjQ5IDc4OCA0NTMgNzkzIDQ1MyA0CjAgNyAtNzYgNyAtMTY5eiBtMTA4MiAtMjc3IGM0MjUgLTI0NSA3ODYgLTQ1NCA4MDIgLTQ2NCBsMjggLTE3IC0xNDMgLTgzIGMtNzkgLTQ2IC0xNDcKLjg0IC0xNTAgLTg2IC0zIC0yIC0zMDAgMTY3IC02NjAgMzc0IGwtNjU0IDM3OCAtMyAxNzIgYy0xIDk1IDAgMTcyIDIgMTcyIDMKMCAzNTMgLTIwMSA3NzggLTQ0NnoiLz4KPHBhdGggZD0iTTE0MzIgMzUzOCBsLTU4MyAtMzM3IDAgLTY0MSAwIC02NDEgNTgzIC0zMzYgYzMyMCAtMTg1IDU4NiAtMzM3IDU5MQotMzM3IDQgMCA3IDMwMSA3IDY2OSAwIDM2OCAtMyA2NjkgLTcgNjY5IC01IDAgLTI3MSAtMTUyIC01OTEgLTMzNnoiLz4KPHBhdGggZD0iTTMwOTggMzIwMCBsMCAtNjcxIDU4NSAtMzM3IDU4NSAtMzM3IC0yIC02NjAgLTEgLTY2MCAtNTc3IDMzMyBjLTMxNyAxODMgLTU4MCAzMzQKLTI4MyAzMzUgLTQgMSAtNyAtMzAxIC03IC02NzF6Ii8+CjxwYXRoIGQ9Ik0xOTQ1IDE1NzYgYy0zMTkgLTE4NSAtNTgxIC0zMzcgLTU4MiAtMzM4IC0yIC0yIDAgLTEyNDIgMyAtMTI0NSAzIC0zCjExNjkgNjY4IDExNzggNjc2IDMgMyA1IDMwNyA0IDY3NCBsLTMgNjY5IC01ODAgLTMzNnoiLz4KPHBhdGggZD0iTTI2OTAgMTY1IGMwIC0zNjkgMyAtNjcxIDcgLTY3MSA1IC0xIDExNjYgNjY1IDExNzYgNjc0IDQgNCAzIDMwOCAtMSA2NzUKbC01OCA2NjUgLTU4MCAtMzMzIC01ODAgLTMzMiAwIC02NzR6Ii8+CjwvZz4KPC9zdmc+Cg==";

const shadow =
  "0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.10)";
const softShadow = "0 1px 2px rgba(0,0,0,0.04)";

const headerSpring = {
  type: "spring",
  stiffness: 230,
  damping: 32,
  mass: 0.78,
} as const;
const searchSpring = { stiffness: 220, damping: 33, mass: 0.7 } as const;
const routeTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const;
const dashboardSpring = {
  type: "spring",
  stiffness: 300,
  damping: 32,
  mass: 0.74,
} as const;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type AppRoute =
  | "/"
  | "/artisans"
  | `/artisans/${string}`
  | "/for-artisans"
  | "/sign-in"
  | "/sign-up"
  | "/sign-up?role=artisan"
  | "/sign-up?invite=demo-token&role=artisan"
  | "/auth/sign-in"
  | "/auth/sign-up"
  | "/invite/demo-token"
  | "/dashboard"
  | "/artisan/dashboard"
  | "/artisan/jobs"
  | "/artisan/messages"
  | "/artisan/portfolio"
  | "/artisan/earnings"
  | "/artisan/subscription"
  | "/artisan/settings"
  | "/client/dashboard"
  | "/client/find"
  | "/client/saved"
  | "/client/jobs"
  | "/client/messages"
  | "/client/reviews"
  | "/admin"
  | "/admin/verification"
  | "/admin/artisans"
  | "/admin/users"
  | "/admin/invites"
  | "/admin/moderation"
  | "/admin/analytics"
  | "/admin/monitoring"
  | "/admin/locations"
  | "/admin/settings"
  | "/readiness";

const PRODUCTION_ROUTES: Array<{
  path: AppRoute;
  label: string;
  group: "Public" | "Client" | "Artisan" | "Admin" | "System";
}> = [
  { path: "/", label: "Home", group: "Public" },
  { path: "/artisans", label: "Browse artisans", group: "Public" },
  { path: "/for-artisans", label: "For artisans", group: "Public" },
  { path: "/sign-in", label: "Sign in", group: "Public" },
  { path: "/sign-up", label: "Sign up", group: "Public" },
  { path: "/sign-up?role=artisan", label: "Artisan sign up", group: "Public" },
  { path: "/client/dashboard", label: "Client overview", group: "Client" },
  { path: "/client/find", label: "Find artisans", group: "Client" },
  { path: "/client/saved", label: "Saved artisans", group: "Client" },
  { path: "/client/jobs", label: "Client jobs", group: "Client" },
  { path: "/client/messages", label: "Client messages", group: "Client" },
  { path: "/client/reviews", label: "Reviews", group: "Client" },
  { path: "/artisan/dashboard", label: "Artisan overview", group: "Artisan" },
  { path: "/artisan/jobs", label: "Artisan jobs", group: "Artisan" },
  { path: "/artisan/messages", label: "Artisan messages", group: "Artisan" },
  { path: "/artisan/portfolio", label: "Portfolio manager", group: "Artisan" },
  { path: "/artisan/earnings", label: "Artisan earnings", group: "Artisan" },
  {
    path: "/artisan/subscription",
    label: "Artisan subscription",
    group: "Artisan",
  },
  { path: "/artisan/settings", label: "Artisan settings", group: "Artisan" },
  { path: "/admin", label: "Admin overview", group: "Admin" },
  { path: "/admin/verification", label: "Verification", group: "Admin" },
  { path: "/admin/artisans", label: "Artisans", group: "Admin" },
  { path: "/admin/users", label: "Users", group: "Admin" },
  { path: "/admin/invites", label: "Invites", group: "Admin" },
  { path: "/admin/moderation", label: "Moderation", group: "Admin" },
  { path: "/admin/analytics", label: "Analytics", group: "Admin" },
  { path: "/admin/monitoring", label: "Monitoring", group: "Admin" },
  { path: "/admin/locations", label: "Locations", group: "Admin" },
  { path: "/admin/settings", label: "Settings", group: "Admin" },
];

function normalizeRouteFromHash(fallback: AppRoute = "/admin"): AppRoute {
  if (typeof window === "undefined") return fallback;
  const pathWithSearch = `${window.location.pathname}${window.location.search}`.replace(/^\/admin-dashboard/, "/admin");
  const hashRoute = window.location.hash.replace(/^#/, "");
  const raw = hashRoute.startsWith("/") ? hashRoute : pathWithSearch || fallback;
  if (raw.startsWith("/artisans/")) return raw as AppRoute;
  const valid: AppRoute[] = [
    "/",
    "/artisans",
    "/for-artisans",
    "/sign-in",
    "/sign-up",
    "/sign-up?role=artisan",
    "/sign-up?invite=demo-token&role=artisan",
    "/auth/sign-in",
    "/auth/sign-up",
    "/invite/demo-token",
    "/dashboard",
    "/artisan/dashboard",
    "/artisan/jobs",
    "/artisan/messages",
    "/artisan/portfolio",
    "/artisan/earnings",
    "/artisan/reviews",
  "/artisan/subscription",
    "/artisan/settings",
    "/client/dashboard",
    "/client/find",
    "/client/saved",
    "/client/jobs",
    "/client/messages",
    "/client/reviews",
    "/admin",
    "/admin/verification",
    "/admin/artisans",
    "/admin/users",
    "/admin/invites",
    "/admin/moderation",
    "/admin/analytics",
    "/admin/earnings",
    "/admin/subscriptions",
    "/admin/payouts",
    "/admin/reports",
    "/admin/database",
    "/admin/help",
    "/admin/system",
    "/admin/monitoring",
    "/admin/locations",
    "/admin/settings",
    "/readiness",
  ];
  return valid.includes(raw as AppRoute) ? (raw as AppRoute) : fallback;
}

function useHashRoute(initialRoute: AppRoute = "/admin") {
  const [route, setRoute] = useState<AppRoute>(() => normalizeRouteFromHash(initialRoute));

  useEffect(() => {
    const handleHashChange = () => setRoute(normalizeRouteFromHash(initialRoute));
    const handlePopState = () => setRoute(normalizeRouteFromHash(initialRoute));
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [initialRoute]);

  const navigate = (nextRoute: AppRoute) => {
    if (typeof window === "undefined") return;
    const currentRoute = `${window.location.pathname}${window.location.search}`.replace(/^\/admin-dashboard/, "/admin");
    const applyRouteChange = () => {
      if (currentRoute !== nextRoute) {
        window.history.pushState(null, "", nextRoute);
      }
      setRoute(nextRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const viewTransitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (viewTransitionDocument.startViewTransition) {
      viewTransitionDocument.startViewTransition(applyRouteChange);
      return;
    }

    applyRouteChange();
  };

  return { route, navigate };
}

function routeTitle(route: AppRoute) {
  if (route === "/") return "Home";
  if (route === "/artisans") return "Browse artisans";
  if (route.startsWith("/artisans/")) return "Artisan profile";
  if (route === "/for-artisans") return "For artisans";
  if (route === "/sign-in" || route === "/auth/sign-in") return "Sign in";
  if (route === "/sign-up" || route === "/auth/sign-up") return "Sign up";
  if (route === "/sign-up?role=artisan") return "Artisan sign up";
  if (
    route === "/sign-up?invite=demo-token&role=artisan" ||
    route === "/invite/demo-token"
  )
    return "Invite onboarding";
  if (route.startsWith("/artisan/")) return "Artisan workspace";
  if (route.startsWith("/client/")) return "Client workspace";
  if (route === "/admin") return "Admin overview";
  if (route.startsWith("/admin/")) return "Admin console";
  return "Readiness";
}

function isDashboardRoute(route: AppRoute) {
  return (
    route === "/dashboard" ||
    route.startsWith("/artisan/") ||
    route.startsWith("/client/") ||
    route === "/admin" ||
    route.startsWith("/admin/")
  );
}

function DashboardRouteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">{children}</div>
  );
}

type DashboardShellProps<View extends string> = {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  activeLabel?: string;
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
  role: "Artisan" | "Client" | "Admin" | "Studio";
  headerMeta?: React.ReactNode;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  children: React.ReactNode;
};

function DashboardTopBar({
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
  return (
    <div
      className="border-b px-5 py-4"
      style={{
        borderColor: COLORS.hairlineSoft,
        background: COLORS.surfaceSoft,
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p
            className="text-[13px] font-medium leading-[1.23]"
            style={{ color: COLORS.muted }}
          >
            {eyebrow}
          </p>
          <h3
            className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            {title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {meta}
          <DashboardThemeToggle />
          <DashboardNotificationButton role={role} />
          <DashboardProfileButton role={role} />
        </div>
      </div>
    </div>
  );
}

function DashboardContent({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <div className={flush ? "h-[calc(100vh-73px)] min-h-0" : "p-5 md:p-6"}>
      {children}
    </div>
  );
}

type PillTabOption<Value extends string> = {
  id: Value;
  label: string;
  helper?: string;
  icon?: typeof Search;
};

type ArtisanJobsTab = "all" | "requested" | "quoted" | "active";

function FluidPillTabs<Value extends string>({
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
            style={{ background: COLORS.canvas, boxShadow: softShadow }}
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
          style={{ boxShadow: softShadow }}
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

function DashboardAppShell<View extends string>({
  id,
  title,
  subtitle,
  eyebrow,
  activeLabel,
  items,
  activeView,
  onSelect,
  role,
  headerMeta,
  sidebarCollapsed = false,
  onToggleSidebar,
  children,
}: DashboardShellProps<View>) {
  return (
    <section id={id} className="h-screen w-full overflow-hidden bg-white">
      <div className="h-screen overflow-hidden bg-white">
        <div
          className="grid h-screen transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[var(--dashboard-sidebar-width)_minmax(0,1fr)]"
          style={{
            ["--dashboard-sidebar-width" as string]: sidebarCollapsed
              ? "88px"
              : "260px",
          }}
        >
          <DashboardSidebar
            title={title}
            subtitle={subtitle}
            items={items}
            activeView={activeView}
            onSelect={onSelect}
            collapsed={sidebarCollapsed}
            onToggle={onToggleSidebar}
            role={role}
          />
          <div className="min-h-0 min-w-0 overflow-y-auto bg-white">
            <DashboardMobileNav
              items={items}
              activeView={activeView}
              onSelect={onSelect}
            />
            <DashboardTopBar
              eyebrow={eyebrow}
              title={activeLabel ?? title}
              role={role}
              meta={headerMeta}
            />
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductionPageHeader({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-4 pt-6 md:px-10 md:pb-6 md:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[760px]">
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[32px]"
            style={{ color: COLORS.ink }}
          >
            {title}
          </h1>
          {body && (
            <p
              className="mt-2 text-[16px] leading-[1.5]"
              style={{ color: COLORS.body }}
            >
              {body}
            </p>
          )}
        </div>
        {actions}
      </div>
    </section>
  );
}

const artisanRouteToView: Partial<Record<AppRoute, ArtisanCoreView>> = {
  "/artisan/dashboard": "overview",
  "/artisan/jobs": "jobs",
  "/artisan/messages": "messages",
  "/artisan/portfolio": "portfolio",
  "/artisan/reviews": "reviews",
  "/artisan/earnings": "earnings",
  "/artisan/subscription": "subscription",
  "/artisan/settings": "settings",
};

const clientRouteToView: Partial<Record<AppRoute, ClientCoreView>> = {
  "/client/dashboard": "overview",
  "/client/find": "find",
  "/client/saved": "saved",
  "/client/jobs": "jobs",
  "/client/messages": "messages",
  "/client/reviews": "reviews",
};

const adminRouteToView: Partial<Record<AppRoute, AdminCoreView>> = {
  "/admin": "overview",
  "/admin/verification": "verification",
  "/admin/artisans": "artisans",
  "/admin/users": "users",
  "/admin/invites": "invites",
  "/admin/moderation": "moderation",
  "/admin/analytics": "analytics",
  "/admin/monitoring": "monitoring",
  "/admin/locations": "locations",
  "/admin/settings": "settings",
};

const secondaryRouteToView: Partial<Record<AppRoute, SecondaryOpsView>> = {
  "/admin/analytics": "analytics",
  "/admin/earnings": "earnings",
  "/admin/subscriptions": "subscriptions",
  "/admin/payouts": "payouts",
  "/admin/reports": "reports",
  "/admin/database": "database",
  "/admin/help": "help",
  "/admin/system": "monitoring",
  "/admin/monitoring": "monitoring",
  "/admin/locations": "locations",
  "/admin/settings": "settings",
};

const artisanViewToRoute: Record<
  Exclude<ArtisanCoreView, "job-detail" | "earning-detail">,
  AppRoute
> = {
  overview: "/artisan/dashboard",
  jobs: "/artisan/jobs",
  messages: "/artisan/messages",
  portfolio: "/artisan/portfolio",
  earnings: "/artisan/earnings",
  subscription: "/artisan/subscription",
  settings: "/artisan/settings",
};

const clientViewToRoute: Record<
  Exclude<ClientCoreView, "job-detail">,
  AppRoute
> = {
  overview: "/client/dashboard",
  find: "/client/find",
  saved: "/client/saved",
  jobs: "/client/jobs",
  messages: "/client/messages",
  reviews: "/client/reviews",
};

const adminViewToRoute: Record<AdminCoreView, AppRoute> = {
  overview: "/admin",
  verification: "/admin/verification",
  artisans: "/admin/artisans",
  users: "/admin/users",
  invites: "/admin/invites",
  moderation: "/admin/moderation",
  analytics: "/admin/analytics",
  monitoring: "/admin/monitoring",
  locations: "/admin/locations",
  settings: "/admin/settings",
};

const secondaryViewToRoute: Partial<Record<SecondaryOpsView, AppRoute>> = {
  analytics: "/admin/analytics",
  earnings: "/admin/earnings",
  subscriptions: "/admin/subscriptions",
  payouts: "/admin/payouts",
  reports: "/admin/reports",
  database: "/admin/database",
  help: "/admin/help",
  monitoring: "/admin/monitoring",
  locations: "/admin/locations",
  settings: "/admin/settings",
};

const artisans = [
  {
    id: "art-001",
    name: "Peter Mwangi",
    profession: "Plumber",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Kilimani", county: "Nairobi" },
    hourlyRate: 1800,
    isAvailable: true,
    isVerified: true,
    isPremium: false,
    rating: { average: 4.9, total: 82 },
    specializations: [
      { name: "Leak repair" },
      { name: "Pipe fitting" },
      { name: "Drainage" },
    ],
    gradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 45%, #047857 100%)",
  },
  {
    id: "art-002",
    name: "Grace Wanjiku",
    profession: "Carpenter",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Kikuyu", county: "Kiambu" },
    hourlyRate: 2600,
    isAvailable: false,
    isVerified: true,
    isPremium: true,
    rating: { average: 4.8, total: 64 },
    specializations: [
      { name: "Cabinets" },
      { name: "Custom beds" },
      { name: "Shelving" },
    ],
    gradient: "linear-gradient(135deg, #f4f1e8 0%, #b89565 44%, #4b3524 100%)",
  },
  {
    id: "art-003",
    name: "Amina Hassan",
    profession: "Painter",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Westlands", county: "Nairobi" },
    hourlyRate: 1500,
    isAvailable: true,
    isVerified: true,
    isPremium: true,
    rating: { average: 4.9, total: 51 },
    specializations: [
      { name: "Wall prep" },
      { name: "Texture finish" },
      { name: "Repainting" },
    ],
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 44%, #065f46 100%)",
  },
  {
    id: "art-004",
    name: "Brian Otieno",
    profession: "Electrician",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Rongai", county: "Kajiado" },
    hourlyRate: 2200,
    isAvailable: true,
    isVerified: true,
    isPremium: false,
    rating: { average: 4.7, total: 73 },
    specializations: [
      { name: "Fault tracing" },
      { name: "Sockets" },
      { name: "Lighting" },
    ],
    gradient: "linear-gradient(135deg, #eef2ff 0%, #a7f3d0 46%, #064e3b 100%)",
  },
  {
    id: "art-005",
    name: "Daniel Kariuki",
    profession: "Mason",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Thika", county: "Kiambu" },
    hourlyRate: 2400,
    isAvailable: false,
    isVerified: true,
    isPremium: true,
    rating: { average: 4.8, total: 39 },
    specializations: [
      { name: "Tiling" },
      { name: "Waterproofing" },
      { name: "Grouting" },
    ],
    gradient: "linear-gradient(135deg, #f7fee7 0%, #86efac 45%, #166534 100%)",
  },
  {
    id: "art-006",
    name: "Joseph Njoroge",
    profession: "Welder",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Industrial Area", county: "Nairobi" },
    hourlyRate: 3000,
    isAvailable: true,
    isVerified: true,
    isPremium: false,
    rating: { average: 4.9, total: 91 },
    specializations: [
      { name: "Gates" },
      { name: "Grills" },
      { name: "Railings" },
    ],
    gradient: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 45%, #065f46 100%)",
  },
  {
    id: "art-007",
    name: "Mercy Achieng",
    profession: "Cleaner",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Nyali", county: "Mombasa" },
    hourlyRate: 1200,
    isAvailable: true,
    isVerified: false,
    isPremium: false,
    rating: { average: 4.6, total: 28 },
    specializations: [
      { name: "Deep cleaning" },
      { name: "Sofa care" },
      { name: "Carpets" },
    ],
    gradient: "linear-gradient(135deg, #ecfeff 0%, #99f6e4 44%, #0f766e 100%)",
  },
  {
    id: "art-008",
    name: "Samuel Kiptoo",
    profession: "Handyman",
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: "Nakuru", county: "Nakuru" },
    hourlyRate: 1000,
    isAvailable: true,
    isVerified: true,
    isPremium: false,
    rating: { average: 4.7, total: 34 },
    specializations: [
      { name: "Mounting" },
      { name: "Locks" },
      { name: "Small fixes" },
    ],
    gradient: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 44%, #15803d 100%)",
  },
];

type ProductTabId = "repairs" | "build" | "design";

const productTabs: Array<{
  id: ProductTabId;
  label: string;
  icon: typeof Wrench;
  isNew: boolean;
}> = [
  { id: "repairs", label: "Repairs", icon: Wrench, isNew: false },
  { id: "build", label: "Build", icon: Hammer, isNew: true },
  { id: "design", label: "Design", icon: Paintbrush, isNew: true },
];

const tabContent: Record<
  ProductTabId,
  {
    eyebrow: string;
    heading: string;
    title: string;
    subtitle: string;
    professions: string[];
  }
> = {
  repairs: {
    eyebrow: "Verified repair artisans across Kenya",
    heading: "Find the right craftsperson for the job.",
    title: "Available repair artisans near you",
    subtitle:
      "Fast-response specialists for plumbing, electrical, cleaning, and general home fixes.",
    professions: ["Plumber", "Electrician", "Cleaner", "Handyman"],
  },
  build: {
    eyebrow: "Trusted builders and fabricators",
    heading: "Plan, build, and finish with skilled local pros.",
    title: "Build specialists for your next project",
    subtitle:
      "Carpenters, masons, and welders for installations, upgrades, and structural work.",
    professions: ["Carpenter", "Mason", "Welder"],
  },
  design: {
    eyebrow: "Finish and style your space",
    heading: "Bring a cleaner, sharper look to your home or workspace.",
    title: "Design and finishing artisans",
    subtitle:
      "Painters, carpenters, and finish-focused artisans for interiors, surfaces, and custom details.",
    professions: ["Painter", "Carpenter"],
  },
};

const categoryOptions = [
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

const cityLinks: Array<[string, string]> = [
  ["Nairobi", "Home repair specialists"],
  ["Kiambu", "Carpenters and masons"],
  ["Mombasa", "Cleaning and maintenance"],
  ["Machakos", "Plumbers and electricians"],
  ["Kajiado", "Welders and fabricators"],
  ["Nakuru", "Painters and finishers"],
];

const cityToCounty = (city: string) => {
  if (city === "Nairobi") return "Nairobi";
  if (city === "Mombasa") return "Mombasa";
  if (city === "Nakuru") return "Nakuru";
  if (city === "Kajiado") return "Kajiado";
  return "Kiambu";
};

const adminLocationRows = cityLinks.map(([city, specialty]) => ({
  id: `location-${city}`,
  city,
  specialty,
  county: cityToCounty(city),
  artisans: Math.floor(18 + city.length * 4),
  status: "ACTIVE" as const,
}));

const adminLocationCounties = Array.from(
  new Set(adminLocationRows.map((row) => row.county)),
);

function CategoryStrip({
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
                background: active ? COLORS.canvas : COLORS.canvas,
                boxShadow: active ? softShadow : "none",
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

function EmptyArtisanState({
  activeCategory,
  onReset,
}: {
  activeCategory: string;
  onReset: () => void;
}) {
  return (
    <div
      className="col-span-full rounded-[24px] border px-5 py-12 text-center"
      style={{
        borderColor: COLORS.hairlineSoft,
        background: COLORS.surfaceSoft,
      }}
    >
      <div
        className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-white"
        style={{ color: COLORS.primary }}
      >
        <Search size={20} />
      </div>
      <h3
        className="text-[20px] font-semibold leading-[1.2]"
        style={{ color: COLORS.ink }}
      >
        No {activeCategory.toLowerCase()} artisans in this preview yet
      </h3>
      <p
        className="mx-auto mt-2 max-w-[420px] text-[14px] leading-[1.43]"
        style={{ color: COLORS.muted }}
      >
        Try another category or invite the first skilled artisan to join
        ChapaWorks.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <button
          onClick={onReset}
          className="cursor-pointer rounded-lg border px-4 py-2 text-[14px] font-medium transition-colors hover:bg-white"
          style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
        >
          Show all categories
        </button>
        <button
          className="cursor-pointer rounded-lg px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          Be the first artisan
        </button>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Browse",
      body: "Search by skill, location, availability, and budget.",
      icon: Search,
    },
    {
      title: "Message & quote",
      body: "Start a conversation and agree on scope before work begins.",
      icon: MessageCircle,
    },
    {
      title: "Hire with confidence",
      body: "Use verified profiles, ratings, portfolio work, and cash-only job milestones during testing.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16">
      <div className="mb-7 max-w-[620px]">
        <p
          className="mb-2 text-[14px] font-medium leading-[1.29]"
          style={{ color: COLORS.muted }}
        >
          How it works
        </p>
        <h2
          className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
          style={{ color: COLORS.ink }}
        >
          A simpler way to find and hire skilled local professionals.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-[14px] border p-5"
              style={{
                borderColor: COLORS.hairlineSoft,
                background: COLORS.canvas,
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span
                  className="grid h-11 w-11 place-items-center rounded-full"
                  style={{
                    background: COLORS.surfaceSoft,
                    color: COLORS.primary,
                  }}
                >
                  <Icon size={19} />
                </span>
                <span
                  className="text-[13px] leading-[1.23]"
                  style={{ color: COLORS.mutedSoft }}
                >
                  0{index + 1}
                </span>
              </div>
              <h3
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                {step.title}
              </h3>
              <p
                className="mt-2 text-[14px] leading-[1.43]"
                style={{ color: COLORS.muted }}
              >
                {step.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ArtisanCtaBand({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <section
      id="for-artisans"
      className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-12"
    >
      <div
        className="grid gap-6 rounded-[28px] border p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8"
        style={{
          borderColor: COLORS.hairlineSoft,
          background: COLORS.surfaceSoft,
        }}
      >
        <div>
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.primary }}
          >
            For artisans
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            Are you a skilled artisan?
          </h2>
          <p
            className="mt-2 max-w-[620px] text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            Build a trusted profile, show your portfolio, receive client
            messages, and grow with verified marketplace visibility.
          </p>
        </div>
        <button
          onClick={() => onNavigate("/sign-up?role=artisan")}
          className="flex h-12 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          Create artisan profile
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function ForArtisansLandingPage({
  onNavigate,
}: {
  onNavigate: (route: AppRoute) => void;
}) {
  const requirements = [
    {
      title: "Professional profile",
      body: "Profession, years of experience, service area, hourly rate, and a clear bio.",
      icon: UserRound,
    },
    {
      title: "Portfolio evidence",
      body: "Add project photos, categories, tags, duration, cost, and featured visibility.",
      icon: Images,
    },
    {
      title: "Verification documents",
      body: "Submit ID, certificates, and skill evidence for admin review before public search visibility.",
      icon: FileCheck2,
    },
  ];

  const workLoop = [
    {
      title: "Get discovered",
      body: "Clients search by profession, location, rating, price range, availability, verified status, and specialization.",
      icon: Search,
    },
    {
      title: "Message first",
      body: "Start with a clear conversation, confirm scope, timeline, location, and client expectations.",
      icon: MessageCircle,
    },
    {
      title: "Send a quote",
      body: "Create a detailed quote with total amount, deposit percentage, duration, scope, and terms.",
      icon: ReceiptText,
    },
    {
      title: "Track the job",
      body: "Move from request to quote, accepted, deposit paid, in progress, completed, and final review.",
      icon: ClipboardList,
    },
  ];

  const dashboardItems = [
    [
      "Jobs",
      "View requests, quote work, revise once, start work, and mark complete.",
    ],
    [
      "Messages",
      "Reply to clients, share attachments, and keep job conversations in context.",
    ],
    ["Portfolio", "Publish, edit, hide, feature, or remove project cards."],
    [
      "Earnings",
      "Track payouts, commission rate, payout history, and failed payout states.",
    ],
    [
      "Subscription",
      "Upgrade for priority search placement, premium badge, larger portfolio, and lower commission.",
    ],
    [
      "Settings",
      "Manage profile, specializations, location, verification, and notifications.",
    ],
  ];

  return (
    <>
      <section className="mx-auto max-w-[1280px] px-5 pb-8 pt-7 md:px-10 md:pb-12 md:pt-10">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p
              className="mb-3 text-[14px] font-medium leading-[1.29]"
              style={{ color: COLORS.primary }}
            >
              List your craft
            </p>
            <h1
              className="max-w-[640px] text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] md:text-[48px]"
              style={{ color: COLORS.ink }}
            >
              Turn your skill into a trusted ChapaWorks profile.
            </h1>
            <p
              className="mt-4 max-w-[600px] text-[16px] leading-[1.5]"
              style={{ color: COLORS.body }}
            >
              Create a verified artisan profile, showcase your work, respond to
              client requests, send quotes, and manage the full job workflow
              from one focused workspace.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onNavigate("/sign-up?role=artisan")}
                className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
                style={{ background: COLORS.primary }}
              >
                Start artisan profile
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => onNavigate("/artisan/dashboard")}
                className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border px-5 text-[16px] font-medium transition-colors hover:bg-[#f7f7f7]"
                style={{ borderColor: COLORS.ink, color: COLORS.ink }}
              >
                Preview workspace
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Free profile",
                "Verification badge",
                "Portfolio showcase",
                "Client messages",
                "Quote workflow",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border px-3 py-1.5 text-[13px] leading-[1.23]"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                    color: COLORS.body,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-[32px] border bg-white p-4 md:p-5"
            style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
          >
            <div
              className="overflow-hidden rounded-[24px] border"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <div
                className="aspect-[16/9]"
                style={{
                  background:
                    "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 42%, #047857 100%)",
                }}
              />
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-full"
                      style={{
                        background: COLORS.primaryTint,
                        color: COLORS.primary,
                      }}
                    >
                      <Hammer size={20} />
                    </span>
                    <span>
                      <span
                        className="block text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        Grace Wanjiku
                      </span>
                      <span
                        className="block text-[14px] leading-[1.43]"
                        style={{ color: COLORS.muted }}
                      >
                        Carpenter · Kiambu
                      </span>
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      borderColor: COLORS.primarySoft,
                      background: COLORS.primaryTint,
                      color: COLORS.primaryActive,
                    }}
                  >
                    <BadgeCheck size={13} /> Verified
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["4.8", "rating"],
                    ["64", "reviews"],
                    ["KES 2,600", "per hour"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-[14px] border p-3"
                      style={{
                        borderColor: COLORS.hairlineSoft,
                        background: COLORS.surfaceSoft,
                      }}
                    >
                      <p
                        className="text-[16px] font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        {value}
                      </p>
                      <p
                        className="text-[13px]"
                        style={{ color: COLORS.muted }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Cabinets", "Custom beds", "Shelving", "Repairs"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border px-2.5 py-1 text-[13px]"
                        style={{
                          borderColor: COLORS.hairlineSoft,
                          background: COLORS.canvas,
                          color: COLORS.body,
                        }}
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div className="mb-6 max-w-[680px]">
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            What you need to list
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            A public profile clients can trust before they message you.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {requirements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[18px] border bg-white p-5"
                style={{ borderColor: COLORS.hairlineSoft }}
              >
                <span
                  className="mb-5 grid h-11 w-11 place-items-center rounded-full"
                  style={{
                    background: COLORS.primaryTint,
                    color: COLORS.primary,
                  }}
                >
                  <Icon size={19} />
                </span>
                <h3
                  className="text-[16px] font-semibold leading-[1.25]"
                  style={{ color: COLORS.ink }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div
            className="sticky top-28 rounded-[24px] border p-5"
            style={{
              borderColor: COLORS.primarySoft,
              background: COLORS.primaryTint,
            }}
          >
            <p
              className="text-[16px] font-semibold leading-[1.25]"
              style={{ color: COLORS.primaryActive }}
            >
              How the work flows
            </p>
            <p
              className="mt-2 text-[14px] leading-[1.43]"
              style={{ color: COLORS.body }}
            >
              ChapaWorks keeps discovery, messaging, quoting, job progress, and
              reviews connected so clients know what happens next.
            </p>
            <button
              onClick={() => onNavigate("/sign-up?role=artisan")}
              className="mt-5 h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
              style={{ background: COLORS.primary }}
            >
              Join as artisan
            </button>
          </div>

          <div className="grid gap-3">
            {workLoop.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="grid gap-4 rounded-[18px] border bg-white p-4 md:grid-cols-[56px_1fr] md:items-start"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-full"
                    style={{
                      background:
                        index === 0 ? COLORS.primaryTint : COLORS.surfaceSoft,
                      color: COLORS.primary,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                  <span>
                    <span
                      className="mb-1 block text-[13px] font-medium leading-[1.23]"
                      style={{ color: COLORS.muted }}
                    >
                      Step {index + 1}
                    </span>
                    <span
                      className="block text-[16px] font-semibold leading-[1.25]"
                      style={{ color: COLORS.ink }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="mt-1 block text-[14px] leading-[1.43]"
                      style={{ color: COLORS.muted }}
                    >
                      {item.body}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div
          className="rounded-[28px] border bg-white p-5 md:p-6"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="mb-2 text-[14px] font-medium leading-[1.29]"
                style={{ color: COLORS.muted }}
              >
                Inside your workspace
              </p>
              <h2
                className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                style={{ color: COLORS.ink }}
              >
                Everything you manage after listing your craft.
              </h2>
            </div>
            <button
              onClick={() => onNavigate("/artisan/dashboard")}
              className="h-10 w-fit cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              Open dashboard preview
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 items-start">
            {dashboardItems.map(([title, body]) => (
              <div
                key={title}
                className="rounded-[16px] border p-4"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  background: COLORS.surfaceSoft,
                }}
              >
                <p
                  className="text-[15px] font-semibold leading-[1.25]"
                  style={{ color: COLORS.ink }}
                >
                  {title}
                </p>
                <p
                  className="mt-1 text-[13px] leading-[1.23]"
                  style={{ color: COLORS.muted }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div
          className="grid gap-5 rounded-[28px] border p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8"
          style={{
            borderColor: COLORS.primarySoft,
            background: COLORS.primaryTint,
          }}
        >
          <div>
            <p
              className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
              style={{ color: COLORS.ink }}
            >
              Ready to list your craft?
            </p>
            <p
              className="mt-2 max-w-[680px] text-[14px] leading-[1.43]"
              style={{ color: COLORS.body }}
            >
              Start as an artisan, complete profile details, add work samples,
              then submit verification so clients can find and trust your
              profile.
            </p>
          </div>
          <button
            onClick={() => onNavigate("/sign-up?role=artisan")}
            className="h-12 w-fit cursor-pointer rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Create artisan profile
          </button>
        </div>
      </section>
    </>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="flex cursor-pointer items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[13px] leading-[1.23] transition-colors hover:bg-[#f7f7f7]"
      style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
    >
      {label}
      <X size={13} style={{ color: COLORS.muted }} />
    </button>
  );
}

function BrowseDirectorySection({
  onOpenPortfolio,
  onViewProfile,
}: {
  onOpenPortfolio: (artisan: (typeof artisans)[number]) => void;
  onViewProfile: (artisan: (typeof artisans)[number]) => void;
}) {
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState("All professions");
  const [county, setCounty] = useState("All counties");
  const [sortBy, setSortBy] = useState("rating");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const professions = useMemo(
    () => [
      "All professions",
      ...Array.from(
        new Set(artisans.map((artisan) => artisan.profession).filter(Boolean)),
      ),
    ],
    [],
  );
  const counties = useMemo(
    () => [
      "All counties",
      ...Array.from(
        new Set(
          artisans.map((artisan) => artisan.location.county).filter(Boolean),
        ),
      ),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = artisans.filter((artisan) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          artisan.name,
          artisan.profession,
          artisan.location.city,
          artisan.location.county,
          ...artisan.specializations.map((item) => item.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesProfession =
        profession === "All professions" || artisan.profession === profession;
      const matchesCounty =
        county === "All counties" || artisan.location.county === county;
      const matchesAvailability = !availableOnly || artisan.isAvailable;
      return (
        matchesQuery &&
        matchesProfession &&
        matchesCounty &&
        matchesAvailability
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "reviews") return b.rating.total - a.rating.total;
      if (sortBy === "rate") return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
      if (sortBy === "recent") return b.id.localeCompare(a.id);
      return b.rating.average - a.rating.average;
    });
  }, [availableOnly, county, profession, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [availableOnly, county, profession, query, sortBy]);

  const hasFilters =
    query ||
    profession !== "All professions" ||
    county !== "All counties" ||
    availableOnly;

  const resetFilters = () => {
    setQuery("");
    setProfession("All professions");
    setCounty("All counties");
    setAvailableOnly(false);
    setSortBy("rating");
  };

  return (
    <section
      className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16"
      id="browse-artisans"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[640px]">
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            Artisan directory
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            Discover skilled professionals
          </h2>
          <p
            className="mt-2 text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            Search by skill, profession, county, availability, rating, rate, and
            review history.
          </p>
        </div>
        <div
          className="rounded-full border bg-white px-4 py-2 text-[14px] leading-[1.29]"
          style={{ borderColor: COLORS.hairlineSoft, color: COLORS.body }}
        >
          {filtered.length} result{filtered.length === 1 ? "" : "s"} found
        </div>
      </div>

      <div
        className="rounded-[28px] border bg-white p-4 md:p-5"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_auto]">
          <label
            className="flex h-14 items-center gap-3 rounded-full border bg-white px-4"
            style={{ borderColor: COLORS.hairline }}
          >
            <Search size={18} strokeWidth={2.5} style={{ color: COLORS.ink }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skill, artisan, or location"
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.43] outline-none placeholder:text-[#929292]"
              style={{ color: COLORS.ink }}
            />
          </label>

          <select
            value={profession}
            onChange={(event) => setProfession(event.target.value)}
            className="h-14 cursor-pointer rounded-full border bg-white px-4 text-[14px] outline-none"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            {professions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={county}
            onChange={(event) => setCounty(event.target.value)}
            className="h-14 cursor-pointer rounded-full border bg-white px-4 text-[14px] outline-none"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            {counties.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-14 cursor-pointer rounded-full border bg-white px-4 text-[14px] outline-none"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            <option value="rating">Sort: Rating</option>
            <option value="reviews">Sort: Reviews</option>
            <option value="rate">Sort: Rate</option>
            <option value="recent">Sort: Recent</option>
          </select>

          <button
            onClick={() => setAvailableOnly((value) => !value)}
            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
            style={{
              borderColor: availableOnly ? COLORS.ink : COLORS.hairline,
              color: COLORS.ink,
              background: availableOnly ? COLORS.surfaceSoft : COLORS.canvas,
            }}
          >
            <ListFilter size={16} />
            Available
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {query && (
              <FilterChip
                label={`Search: ${query}`}
                onRemove={() => setQuery("")}
              />
            )}
            {profession !== "All professions" && (
              <FilterChip
                label={profession}
                onRemove={() => setProfession("All professions")}
              />
            )}
            {county !== "All counties" && (
              <FilterChip
                label={county}
                onRemove={() => setCounty("All counties")}
              />
            )}
            {availableOnly && (
              <FilterChip
                label="Available now"
                onRemove={() => setAvailableOnly(false)}
              />
            )}
            {!hasFilters && (
              <span
                className="text-[14px] leading-[1.43]"
                style={{ color: COLORS.muted }}
              >
                No active filters. Showing recommended artisans.
              </span>
            )}
          </div>
          <button
            onClick={resetFilters}
            className="w-fit cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline"
            style={{ color: COLORS.ink }}
          >
            Reset filters
          </button>
        </div>
      </div>

      <div
        className="mt-5 rounded-[18px] border px-4 py-3 text-[14px] leading-[1.43]"
        style={{
          borderColor: COLORS.hairlineSoft,
          background: COLORS.surfaceSoft,
          color: COLORS.body,
        }}
      >
        Sign in to message artisans, save profiles, and start job requests.
        Public browsing remains available for discovery.
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.length === 0 ? (
            <EmptyArtisanState
              activeCategory={
                profession !== "All professions" ? profession : "directory"
              }
              onReset={resetFilters}
            />
          ) : (
            visible.map((artisan) => (
              <motion.div
                key={`browse-${artisan.id}`}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.985 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <ArtisanPreviewCard
                  artisan={artisan}
                  onOpenPortfolio={onOpenPortfolio}
                  onViewProfile={onViewProfile}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div
        className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-5 md:flex-row"
        style={{ borderColor: COLORS.hairlineSoft }}
      >
        <p
          className="text-[14px] leading-[1.43]"
          style={{ color: COLORS.muted }}
        >
          Page {page} of {totalPages} · Showing {visible.length} of{" "}
          {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="flex h-10 cursor-pointer items-center gap-1 rounded-lg border px-3 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="flex h-10 cursor-pointer items-center gap-1 rounded-lg border px-3 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ChapaWorksLogo({ onClick }: { onClick?: () => void } = {}) {
  const content = (
    <>
      <span
        className="grid h-9 w-9 place-items-center rounded-xl border"
        style={{
          borderColor: COLORS.primarySoft,
          background: COLORS.primaryTint,
        }}
      >
        <img
          src={CHAPAWORKS_LOGO_SRC}
          alt="ChapaWorks"
          className="h-6 w-6 object-contain opacity-90"
        />
      </span>
      <span className="hidden text-[22px] font-bold leading-none sm:block">
        ChapaWorks
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex cursor-pointer items-center gap-2 rounded-xl font-semibold tracking-tight outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-600"
        style={{ color: COLORS.primary }}
        aria-label="Go to home"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-2 font-semibold tracking-tight"
      style={{ color: COLORS.primary }}
    >
      {content}
    </div>
  );
}

function ProductTabs({
  compact = false,
  activeTab,
  onChange,
}: {
  compact?: boolean;
  activeTab: ProductTabId;
  onChange: (tab: ProductTabId) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 lg:gap-7">
      {productTabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === activeTab;
        return (
          <motion.button
            key={tab.label}
            onClick={() => onChange(tab.id)}
            whileHover="hover"
            whileFocus="hover"
            whileTap={{ scale: 0.97 }}
            className="group relative flex min-w-[70px] cursor-pointer flex-col items-center gap-1 rounded-2xl px-2 py-1 text-center outline-none transition-colors duration-200 ease-out will-change-transform lg:min-w-[78px]"
            style={{ color: active ? COLORS.ink : COLORS.muted }}
          >
            <motion.span
              className="relative grid h-9 w-9 place-items-center rounded-full"
              variants={{
                hover: {
                  y: -3,
                  scale: 1.08,
                  rotate: active ? 0 : -3,
                  backgroundColor: COLORS.surfaceSoft,
                  transition: {
                    type: "spring",
                    stiffness: 420,
                    damping: 24,
                    mass: 0.45,
                  },
                },
              }}
              animate={{
                backgroundColor: active
                  ? COLORS.surfaceSoft
                  : "rgba(247,247,247,0)",
              }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="grid place-items-center"
                variants={{
                  hover: {
                    y: -1,
                    scale: 1.06,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 22,
                      mass: 0.38,
                    },
                  },
                }}
              >
                <Icon
                  size={compact ? 21 : 23}
                  strokeWidth={active ? 2.15 : 1.85}
                />
              </motion.span>
              {tab.isNew && (
                <motion.span
                  className="absolute -right-5 -top-1 rounded-full px-[5px] py-[2px] text-[8px] font-bold uppercase leading-none tracking-[0.32px] text-white"
                  style={{ background: COLORS.primary }}
                  variants={{
                    hover: {
                      y: -1,
                      scale: 1.06,
                      transition: {
                        type: "spring",
                        stiffness: 500,
                        damping: 24,
                        mass: 0.38,
                      },
                    },
                  }}
                >
                  Pro
                </motion.span>
              )}
            </motion.span>
            <motion.span
              className="text-[14px] font-semibold leading-5"
              variants={{
                hover: {
                  y: -1,
                  color: COLORS.ink,
                  transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {tab.label}
            </motion.span>
            <motion.span
              className="absolute -bottom-[9px] h-[2px] rounded-full"
              animate={{ width: active ? 28 : 0, opacity: active ? 1 : 0 }}
              variants={{
                hover: {
                  width: active ? 32 : 18,
                  opacity: active ? 1 : 0.55,
                  transition: {
                    type: "spring",
                    stiffness: 420,
                    damping: 28,
                    mass: 0.45,
                  },
                },
              }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 30,
                mass: 0.5,
              }}
              style={{ background: active ? COLORS.ink : COLORS.muted }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

function AccountMenuPopover({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  const primaryItems = [
    {
      title: "Help Center",
      body: "Support, safety, and disputes",
      icon: HelpCircle,
      bordered: true,
    },
    {
      title: "List your craft",
      body: "Join as a verified artisan",
      icon: Hammer,
      featured: true,
    },
  ];

  const secondaryItems = [
    { title: "Refer an artisan", icon: UserPlus },
    { title: "Find an artisan", icon: Search },
    { title: "Gift project credit", icon: Gift },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96, transformOrigin: "top right" }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.62 }}
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-[286px] overflow-hidden rounded-[18px] border bg-white p-3"
      style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.16, delay: 0.035, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid gap-1">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() =>
                  onNavigate(item.featured ? "/for-artisans" : "/readiness")
                }
                className={`flex w-full cursor-pointer items-center gap-3 rounded-[12px] p-3 text-left transition-colors duration-150 hover:bg-[#f7f7f7] ${item.bordered ? "border" : ""}`}
                style={{
                  borderColor: item.bordered ? COLORS.ink : "transparent",
                }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{
                    background: item.featured
                      ? COLORS.primaryTint
                      : COLORS.surfaceSoft,
                    color: item.featured ? COLORS.primary : COLORS.ink,
                  }}
                >
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[14px] font-semibold leading-[1.29]"
                    style={{ color: COLORS.ink }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="block text-[13px] leading-[1.23]"
                    style={{ color: COLORS.muted }}
                  >
                    {item.body}
                  </span>
                </span>
                {item.featured && (
                  <ChevronRight size={15} style={{ color: COLORS.muted }} />
                )}
              </button>
            );
          })}
        </div>

        <div
          className="my-2 h-px"
          style={{ background: COLORS.hairlineSoft }}
        />

        <div className="grid gap-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() =>
                  onNavigate(
                    item.title === "Find an artisan"
                      ? "/artisans"
                      : item.title === "Refer an artisan"
                        ? "/sign-up?invite=demo-token&role=artisan"
                        : "/sign-in",
                  )
                }
                className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#f7f7f7]"
              >
                <Icon size={16} style={{ color: COLORS.body }} />
                <span
                  className="text-[14px] leading-[1.43]"
                  style={{ color: COLORS.ink }}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="my-2 h-px"
          style={{ background: COLORS.hairlineSoft }}
        />

        <button
          onClick={() => onNavigate("/sign-in")}
          className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#f7f7f7]"
        >
          <LogIn size={16} style={{ color: COLORS.body }} />
          <span
            className="text-[14px] leading-[1.43]"
            style={{ color: COLORS.ink }}
          >
            Log in or sign up
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
}

function AccountControls({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || !accountRef.current) return;
      if (!accountRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    return () =>
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
  }, [menuOpen]);

  return (
    <div
      ref={accountRef}
      className="relative flex items-center justify-end gap-2"
    >
      <button
        onClick={() => onNavigate("/for-artisans")}
        className="hidden cursor-pointer rounded-full px-4 py-3 text-[14px] font-semibold transition-colors duration-200 ease-out hover:bg-[#f7f7f7] lg:block"
        style={{ color: COLORS.ink }}
      >
        List your craft
      </button>
      <button
        onClick={() => onNavigate("/artisans")}
        className="hidden h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors duration-200 ease-out hover:bg-[#f7f7f7] md:grid"
        aria-label="Browse artisans by location"
      >
        <MapPin size={18} />
      </button>
      <button
        className="flex h-12 cursor-pointer items-center gap-3 rounded-full border py-2 pl-3 pr-2 transition-[background-color,box-shadow] duration-200 ease-out hover:shadow-md"
        style={{
          borderColor: COLORS.hairline,
          boxShadow: softShadow,
          background: menuOpen ? COLORS.surfaceSoft : COLORS.canvas,
        }}
        aria-label="Open account menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <Menu size={18} />
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#6a6a6a] text-white">
          <UserRound size={17} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <AccountMenuPopover
            onNavigate={(id) => {
              onNavigate(id);
              setMenuOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type SearchSection = "service" | "location" | "when" | "budget" | null;

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

const sectionOrder: Record<Exclude<SearchSection, null>, number> = {
  service: 0,
  location: 1,
  when: 2,
  budget: 3,
};

function SearchPopover({
  activeSection,
}: {
  activeSection: Exclude<SearchSection, null>;
}) {
  const previousSection = useRef<Exclude<SearchSection, null> | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [direction, setDirection] = useState(1);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (!activeSection) return;

    if (previousSection.current && previousSection.current !== activeSection) {
      setDirection(
        sectionOrder[activeSection] > sectionOrder[previousSection.current]
          ? 1
          : -1,
      );
    }

    previousSection.current = activeSection;
  }, [activeSection]);

  const serviceItems = [
    { title: "Plumbing", body: "Leaks, taps, sinks, drainage", icon: Wrench },
    {
      title: "Carpentry",
      body: "Cabinets, beds, shelves, repairs",
      icon: Hammer,
    },
    { title: "Electrical", body: "Sockets, lighting, wiring", icon: Zap },
    {
      title: "Painting",
      body: "Wall prep, repainting, finishes",
      icon: Paintbrush,
    },
    {
      title: "Masonry",
      body: "Tiles, stonework, waterproofing",
      icon: ShieldCheck,
    },
  ];

  const locationItems = [
    { title: "Nearby", body: "Find artisans around you", icon: MapPin },
    {
      title: "Nairobi",
      body: "Kilimani, Westlands, CBD, Rongai",
      icon: MapPin,
    },
    { title: "Kiambu", body: "Kikuyu, Thika, Ruiru, Limuru", icon: MapPin },
    { title: "Mombasa", body: "Nyali, Bamburi, Tudor, Likoni", icon: MapPin },
    { title: "Nakuru", body: "Town, Lanet, Njoro, Naivasha", icon: MapPin },
  ];

  const timeItems = [
    { title: "Today", body: "Available for urgent jobs" },
    { title: "Tomorrow", body: "Book the next open slot" },
    { title: "This week", body: "Flexible artisan availability" },
    { title: "Weekend", body: "Saturday and Sunday slots" },
  ];

  const budgetItems = [
    { title: "Under KES 2,000", body: "Small fixes and inspections" },
    { title: "KES 2,000–5,000", body: "Most common repair jobs" },
    { title: "KES 5,000–15,000", body: "Installations and upgrades" },
    { title: "Custom quote", body: "Let artisans price the project" },
  ];

  const isWide = activeSection === "when" || activeSection === "budget";
  const list =
    activeSection === "service"
      ? serviceItems
      : activeSection === "location"
        ? locationItems
        : [];
  const simpleList =
    activeSection === "when"
      ? timeItems
      : activeSection === "budget"
        ? budgetItems
        : [];
  const panelMetrics = {
    service: { width: 390, center: "14%" },
    location: { width: 390, center: "39%" },
    when: { width: 620, center: "60%" },
    budget: { width: 620, center: "81%" },
  }[activeSection];
  const panelPaddingY = 48;
  const contentHeight = measuredHeight || (isWide ? 232 : 386);
  const panelHeight = contentHeight + panelPaddingY;

  useEffect(() => {
    const measure = () => {
      if (!measureRef.current) return;
      setMeasuredHeight(measureRef.current.scrollHeight);
    };

    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [activeSection]);

  const contentVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 28 : -28,
      filter: "blur(2px)",
    }),
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -24 : 24,
      filter: "blur(1.5px)",
    }),
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -6,
        x: "-50%",
        scaleX: 0.82,
        scaleY: 0.92,
        height: 56,
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: "-50%",
        scaleX: 1,
        scaleY: 1,
        left: panelMetrics.center,
        width: panelMetrics.width,
        height: panelHeight,
      }}
      exit={{
        opacity: 0,
        y: -18,
        x: "-50%",
        scaleX: 0.34,
        scaleY: 0.16,
        width: 160,
        height: 48,
      }}
      transition={{
        left: { type: "spring", stiffness: 285, damping: 31, mass: 0.72 },
        width: { type: "spring", stiffness: 230, damping: 34, mass: 0.82 },
        height: { type: "spring", stiffness: 230, damping: 35, mass: 0.84 },
        opacity: { duration: 0.12, ease: [0.22, 1, 0.36, 1] },
        y: { type: "spring", stiffness: 360, damping: 32, mass: 0.62 },
        scaleX: { type: "spring", stiffness: 360, damping: 34, mass: 0.58 },
        scaleY: { type: "spring", stiffness: 400, damping: 35, mass: 0.56 },
      }}
      className="absolute top-[calc(100%+12px)] z-50 overflow-hidden rounded-[28px] border bg-white p-6"
      style={{
        borderColor: COLORS.hairlineSoft,
        boxShadow: shadow,
        transformOrigin: "top center",
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ height: contentHeight }}
      >
        <AnimatePresence mode="sync" custom={direction} initial={false}>
          <motion.div
            key={activeSection}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 320,
                damping: 30,
                mass: 0.82,
                delay: 0.035,
              },
              opacity: {
                duration: 0.16,
                delay: 0.035,
                ease: [0.22, 1, 0.36, 1],
              },
              filter: {
                duration: 0.16,
                delay: 0.035,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            className="absolute inset-0 w-full"
          >
            {(activeSection === "service" || activeSection === "location") && (
              <div ref={measureRef} className="pr-1">
                <p
                  className="mb-4 text-[14px] font-medium leading-[1.29]"
                  style={{ color: COLORS.ink }}
                >
                  {activeSection === "service"
                    ? "Suggested services"
                    : "Suggested locations"}
                </p>
                <div className="grid gap-2">
                  {list.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.title}
                        className="flex cursor-pointer items-center gap-4 rounded-2xl p-2 text-left transition-colors duration-150 hover:bg-[#f7f7f7]"
                      >
                        <span
                          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                          style={{
                            background:
                              index === 0
                                ? COLORS.primaryTint
                                : COLORS.surfaceSoft,
                            color: COLORS.primary,
                          }}
                        >
                          <Icon size={22} strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0">
                          <span
                            className="block text-[16px] font-semibold leading-[1.25]"
                            style={{ color: COLORS.ink }}
                          >
                            {item.title}
                          </span>
                          <span
                            className="block truncate text-[14px] leading-[1.43]"
                            style={{ color: COLORS.muted }}
                          >
                            {item.body}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(activeSection === "when" || activeSection === "budget") && (
              <div ref={measureRef}>
                <div
                  className="mx-auto mb-6 flex w-fit rounded-full p-1"
                  style={{ background: COLORS.surfaceStrong }}
                >
                  <button
                    className="cursor-pointer rounded-full bg-white px-10 py-2 text-[14px] font-medium leading-[1.29] shadow-sm"
                    style={{ color: COLORS.ink }}
                  >
                    {activeSection === "when" ? "Date" : "Budget"}
                  </button>
                  <button
                    className="cursor-pointer rounded-full px-10 py-2 text-[14px] font-medium leading-[1.29] transition-colors duration-150 hover:bg-white/70"
                    style={{ color: COLORS.body }}
                  >
                    Flexible
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {simpleList.map((item) => (
                    <button
                      key={item.title}
                      className="cursor-pointer rounded-[14px] border p-4 text-left transition-colors duration-150 hover:bg-[#f7f7f7]"
                      style={{ borderColor: COLORS.hairlineSoft }}
                    >
                      <span
                        className="block text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        {item.title}
                      </span>
                      <span
                        className="mt-1 block text-[14px] leading-[1.43]"
                        style={{ color: COLORS.muted }}
                      >
                        {item.body}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MorphingSearchBar({
  progress,
  activeSection,
  onSelectSection,
  onSubmit,
}: {
  progress: MotionValue<number>;
  activeSection: SearchSection;
  onSelectSection: (section: Exclude<SearchSection, null>) => void;
  onSubmit: () => void;
}) {
  const [hoveredSection, setHoveredSection] = useState<SearchSection>(null);
  const fullSegments = [
    {
      id: "service" as const,
      label: "Service",
      value: "What do you need?",
      wide: true,
    },
    { id: "location" as const, label: "Location", value: "Near you" },
    { id: "when" as const, label: "When", value: "Any time" },
    { id: "budget" as const, label: "Budget", value: "Add range" },
  ];

  const compactSegments = [
    { id: "service" as const, label: "Any service" },
    { id: "location" as const, label: "Near me" },
    { id: "when" as const, label: "Any time" },
  ];

  const width = useTransform(progress, [0, 1], [1105, 374]);
  const height = useTransform(progress, [0, 1], [66, 48]);
  const orbSize = useTransform(progress, [0, 1], [48, 32]);
  const iconScale = useTransform(progress, [0, 1], [1, 0.88]);
  const fullOpacity = useTransform(progress, [0, 0.28, 0.72, 1], [1, 1, 0, 0]);
  const compactOpacity = useTransform(
    progress,
    [0, 0.36, 0.78, 1],
    [0, 0, 1, 1],
  );
  const fullX = useTransform(progress, [0, 0.28, 0.72, 1], [0, 0, -48, -56]);
  const compactX = useTransform(progress, [0, 0.36, 0.78, 1], [58, 52, 0, 0]);
  const fullY = useTransform(progress, [0, 0.34, 0.72, 1], [0, 0, -4, -5]);
  const compactY = useTransform(progress, [0, 0.36, 0.78, 1], [5, 4, 0, 0]);
  const fullLabelY = useTransform(
    progress,
    [0, 0.34, 0.72, 1],
    [0, 0, -8, -10],
  );
  const fullValueY = useTransform(progress, [0, 0.34, 0.72, 1], [0, 0, -6, -8]);
  const compactTextY = useTransform(progress, [0, 0.36, 0.78, 1], [8, 7, 0, 0]);
  const fullBlur = useTransform(
    progress,
    [0, 0.44, 0.72, 1],
    ["blur(0px)", "blur(0px)", "blur(1.6px)", "blur(1.6px)"],
  );
  const compactBlur = useTransform(
    progress,
    [0, 0.36, 0.78, 1],
    ["blur(1.6px)", "blur(1.2px)", "blur(0px)", "blur(0px)"],
  );
  const compactPointerEvents = useTransform(progress, (value) =>
    value > 0.64 ? "auto" : "none",
  );
  const fullPointerEvents = useTransform(progress, (value) =>
    value > 0.64 ? "none" : "auto",
  );
  const hasActive = activeSection !== null;
  const shellRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const orbRef = useRef<HTMLButtonElement | null>(null);
  const sectionRefs = useRef<
    Partial<Record<Exclude<SearchSection, null>, HTMLButtonElement | null>>
  >({});
  const [activeMetric, setActiveMetric] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [hoverMetric, setHoverMetric] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const measureSection = (sectionId: Exclude<SearchSection, null>) => {
    const shell = shellRef.current;
    const track = trackRef.current;
    const section = sectionRefs.current[sectionId];
    if (!shell || !track || !section) return null;

    const shellRect = shell.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const inset = 3;
    const rightInset = 6;
    const left = sectionRect.left - trackRect.left + inset;
    const right =
      sectionId === "budget"
        ? shellRect.right - trackRect.left - rightInset
        : sectionRect.right - trackRect.left - inset;

    return { left, width: Math.max(0, right - left) };
  };

  useEffect(() => {
    const measure = () => {
      setActiveMetric(activeSection ? measureSection(activeSection) : null);
      setHoverMetric(hoveredSection ? measureSection(hoveredSection) : null);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeSection, hoveredSection]);

  return (
    <motion.div
      className="relative mx-auto"
      style={{
        width,
        maxWidth: "min(1105px, calc(100vw - 96px))",
        transformOrigin: "center center",
      }}
    >
      <motion.div
        ref={shellRef}
        className="relative flex items-center overflow-hidden rounded-full border pl-2 pr-2 will-change-[width,height,transform]"
        style={{
          height,
          borderColor: COLORS.hairline,
          boxShadow: shadow,
          background: hasActive ? COLORS.surfaceStrong : COLORS.canvas,
        }}
      >
        <div className="relative min-w-0 flex-1 self-stretch">
          <motion.div
            ref={trackRef}
            className="absolute inset-0 flex min-w-0 items-center overflow-visible will-change-transform"
            style={{
              opacity: fullOpacity,
              x: fullX,
              y: fullY,
              filter: fullBlur,
              pointerEvents: fullPointerEvents,
            }}
          >
            <AnimatePresence initial={false}>
              {hoverMetric &&
                hoveredSection &&
                hoveredSection !== activeSection && (
                  <motion.span
                    key="hover-search-slider"
                    className="pointer-events-none absolute top-1/2 z-0 h-[58px] -translate-y-1/2 rounded-full"
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
                      left: {
                        type: "spring",
                        stiffness: 340,
                        damping: 31,
                        mass: 0.56,
                      },
                      width: {
                        type: "spring",
                        stiffness: 340,
                        damping: 31,
                        mass: 0.56,
                      },
                      opacity: { duration: 0.1, ease: [0.22, 1, 0.36, 1] },
                      scaleX: {
                        type: "spring",
                        stiffness: 360,
                        damping: 32,
                        mass: 0.52,
                      },
                    }}
                    style={{
                      left: hoverMetric.left,
                      width: hoverMetric.width,
                      background: COLORS.surfaceSoft,
                      boxShadow: softShadow,
                      transformOrigin: "center",
                    }}
                  />
                )}
              {activeMetric && (
                <motion.span
                  key="active-search-slider"
                  className="pointer-events-none absolute top-1/2 z-0 h-[58px] -translate-y-1/2 rounded-full bg-white"
                  initial={{
                    opacity: 0,
                    left: activeMetric.left,
                    width: activeMetric.width,
                    scaleX: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    left: activeMetric.left,
                    width: activeMetric.width,
                    scaleX: 1,
                  }}
                  exit={{ opacity: 0, scaleX: 0.96 }}
                  transition={{
                    left: {
                      type: "spring",
                      stiffness: 340,
                      damping: 31,
                      mass: 0.56,
                    },
                    width: {
                      type: "spring",
                      stiffness: 340,
                      damping: 31,
                      mass: 0.56,
                    },
                    opacity: { duration: 0.12, ease: [0.22, 1, 0.36, 1] },
                    scaleX: {
                      type: "spring",
                      stiffness: 360,
                      damping: 32,
                      mass: 0.52,
                    },
                  }}
                  style={{
                    left: activeMetric.left,
                    width: activeMetric.width,
                    boxShadow: shadow,
                    transformOrigin: "center",
                  }}
                />
              )}
            </AnimatePresence>
            {fullSegments.map((segment, index) => {
              const selected = activeSection === segment.id;
              return (
                <React.Fragment key={segment.label}>
                  <button
                    ref={(node) => {
                      sectionRefs.current[segment.id] = node;
                    }}
                    onClick={() => onSelectSection(segment.id)}
                    onMouseEnter={() => setHoveredSection(segment.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    onFocus={() => setHoveredSection(segment.id)}
                    onBlur={() => setHoveredSection(null)}
                    className={`${segment.wide ? "flex-[1.32]" : "flex-1"} group relative z-20 flex h-[58px] min-w-0 cursor-pointer flex-col justify-center rounded-full px-6 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.985]`}
                    style={{
                      background: "transparent",
                      boxShadow: "none",
                    }}
                  >
                    <motion.span
                      className="relative z-10 block text-[12px] font-bold leading-[16px]"
                      style={{ color: COLORS.ink, y: fullLabelY }}
                    >
                      {segment.label}
                    </motion.span>
                    <motion.span
                      className="relative z-10 block truncate text-[14px] leading-[20px]"
                      style={{ color: COLORS.muted, y: fullValueY }}
                    >
                      {segment.value}
                    </motion.span>
                  </button>
                  {index < fullSegments.length - 1 && (
                    <span
                      className="relative z-10 h-8 w-px shrink-0"
                      style={{
                        background: COLORS.hairline,
                        opacity: hasActive ? 0.7 : 1,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>

          <motion.div
            className="absolute inset-0 flex min-w-0 items-center overflow-hidden pl-3 text-left will-change-transform"
            style={{
              opacity: compactOpacity,
              x: compactX,
              y: compactY,
              filter: compactBlur,
              pointerEvents: compactPointerEvents,
            }}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap">
              {compactSegments.map((segment, index) => (
                <React.Fragment key={segment.id}>
                  <motion.button
                    onClick={() => onSelectSection(segment.id)}
                    onMouseEnter={() => setHoveredSection(segment.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    onFocus={() => setHoveredSection(segment.id)}
                    onBlur={() => setHoveredSection(null)}
                    className={`inline-flex h-10 min-w-[82px] cursor-pointer items-center justify-center truncate rounded-full px-3.5 text-[14px] transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.985] ${index < 2 ? "font-semibold" : "font-normal"}`}
                    style={{
                      color: index < 2 ? COLORS.ink : COLORS.muted,
                      y: compactTextY,
                      background:
                        hoveredSection === segment.id
                          ? COLORS.surfaceSoft
                          : "transparent",
                      boxShadow:
                        hoveredSection === segment.id ? softShadow : "none",
                    }}
                  >
                    {segment.label}
                  </motion.button>
                  {index < compactSegments.length - 1 && (
                    <span
                      className="h-5 w-px shrink-0"
                      style={{ background: COLORS.hairline }}
                    />
                  )}
                </React.Fragment>
              ))}
            </span>
          </motion.div>
        </div>

        <motion.button
          ref={orbRef}
          onClick={onSubmit}
          className="relative z-20 ml-1 mr-1 grid shrink-0 cursor-pointer place-items-center rounded-full text-white transition-transform duration-150 ease-out hover:brightness-95 active:scale-95"
          style={{
            width: orbSize,
            height: orbSize,
            background: COLORS.primary,
          }}
          aria-label="Search"
        >
          <motion.span
            className="grid place-items-center"
            style={{ scale: iconScale }}
          >
            <Search size={19} strokeWidth={3} />
          </motion.span>
        </motion.button>
      </motion.div>

      <AnimatePresence initial={false}>
        {activeSection && (
          <SearchPopover key="search-popover" activeSection={activeSection} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MobileSearchPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 w-full cursor-pointer items-center gap-3 rounded-full border bg-white px-4 text-left transition-shadow hover:shadow-md"
      style={{ borderColor: COLORS.hairline, boxShadow: shadow }}
    >
      <Search size={18} strokeWidth={3} />
      <span className="min-w-0 flex-1">
        <span
          className="block text-[14px] font-semibold leading-5"
          style={{ color: COLORS.ink }}
        >
          Find an artisan
        </span>
        <span
          className="block truncate text-[12px] leading-4"
          style={{ color: COLORS.muted }}
        >
          Service · Location · Time
        </span>
      </span>
      <span
        className="grid h-9 w-9 place-items-center rounded-full border"
        style={{ borderColor: COLORS.hairline }}
      >
        <SlidersHorizontal size={16} />
      </span>
    </button>
  );
}

function MobileSearchPanel({
  onClose,
  onSearch,
}: {
  onClose: () => void;
  onSearch: () => void;
}) {
  const rows = [
    { label: "Service", value: "What do you need?", icon: Wrench },
    { label: "Location", value: "Near you", icon: MapPin },
    { label: "When", value: "Any time", icon: Search },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.72 }}
      className="fixed inset-x-4 top-[132px] z-50 rounded-[28px] border bg-white p-4"
      style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p
          className="text-[16px] font-semibold leading-[1.25]"
          style={{ color: COLORS.ink }}
        >
          Search ChapaWorks
        </p>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-full px-3 py-1.5 text-[14px] transition-colors hover:bg-[#f7f7f7]"
          style={{ color: COLORS.body }}
        >
          Close
        </button>
      </div>
      <div className="grid gap-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <button
              key={row.label}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-[#f7f7f7]"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-full"
                style={{
                  background: COLORS.surfaceSoft,
                  color: COLORS.primary,
                }}
              >
                <Icon size={17} />
              </span>
              <span>
                <span
                  className="block text-[12px] font-bold leading-[16px]"
                  style={{ color: COLORS.ink }}
                >
                  {row.label}
                </span>
                <span
                  className="block text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  {row.value}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <button
        onClick={onSearch}
        className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-[16px] font-medium text-white"
        style={{ background: COLORS.primary }}
      >
        <Search size={18} strokeWidth={3} />
        Search
      </button>
    </motion.div>
  );
}

function Header({
  activeTab,
  onTabChange,
  onNavigate,
  route,
}: {
  activeTab: ProductTabId;
  onTabChange: (tab: ProductTabId) => void;
  onNavigate: (id: string) => void;
  route: AppRoute;
}) {
  const { scrollY } = useScroll();
  const searchShellRef = useRef<HTMLDivElement | null>(null);
  const progress = useSpring(0, searchSpring);
  const headerHeight = useTransform(progress, [0, 1], [88, 80]);
  const spacerHeight = useTransform(progress, [0, 1], [92, 0]);
  const tabsY = useTransform(progress, [0, 1], [0, -66]);
  const tabsOpacity = useTransform(progress, [0, 0.58, 1], [1, 0.2, 0]);
  const tabsScale = useTransform(progress, [0, 1], [1, 0.985]);
  const searchY = useTransform(progress, [0, 1], [82, 0]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SearchSection>(null);

  const activeSearch = activeSection !== null;

  useEffect(() => {
    if (!activeSearch) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || !searchShellRef.current) return;
      if (!searchShellRef.current.contains(target)) {
        setActiveSection(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    return () =>
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
  }, [activeSearch]);

  useEffect(() => {
    if (activeSearch) {
      progress.set(0);
      return;
    }

    const latest = scrollY.get();
    progress.set(clamp01((latest - 20) / 118));
  }, [activeSearch, progress, scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled((current) => {
      if (!current && latest > 76) return true;
      if (current && latest < 42) return false;
      return current;
    });

    if (!activeSearch) {
      progress.set(clamp01((latest - 20) / 118));
    }
  });

  const handleSelectSection = (section: Exclude<SearchSection, null>) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  const mobileMenuItems: Array<{
    label: string;
    icon: typeof Search;
    target: string;
  }> = [
    { label: "Client dashboard", icon: UserRound, target: "/client/dashboard" },
    { label: "Artisan dashboard", icon: Hammer, target: "/artisan/dashboard" },
    { label: "Admin", icon: UserCog, target: "/admin" },
  ];

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: COLORS.hairlineSoft,
        background: "rgba(247,247,247,0.96)",
      }}
    >
      <div className="hidden md:block">
        <motion.div
          className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-10"
          style={{ height: headerHeight }}
        >
          <ChapaWorksLogo onClick={() => onNavigate("/")} />

          <div
            ref={searchShellRef}
            className="relative flex min-w-[500px] items-center justify-center"
          >
            <motion.div
              className="absolute inset-x-0 flex justify-center"
              style={{
                y: tabsY,
                opacity: tabsOpacity,
                scale: tabsScale,
                pointerEvents: scrolled && !activeSearch ? "none" : "auto",
              }}
            >
              <ProductTabs
                activeTab={activeTab}
                onChange={(tab) => {
                  onTabChange(tab);
                  onNavigate("/");
                }}
              />
            </motion.div>

            <motion.div
              className="absolute inset-x-0 flex justify-center"
              style={{ y: searchY }}
            >
              <MorphingSearchBar
                progress={progress}
                activeSection={activeSection}
                onSelectSection={handleSelectSection}
                onSubmit={() => {
                  setActiveSection(null);
                  onNavigate("/artisans");
                }}
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <AccountControls onNavigate={onNavigate} />
          </div>
        </motion.div>
        <motion.div
          className="mx-auto max-w-[1280px] px-10"
          style={{ height: spacerHeight, overflow: "visible" }}
        />
      </div>

      <div className="md:hidden">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-5 pb-2 pt-3">
          <ChapaWorksLogo onClick={() => onNavigate("/")} />
          <button
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline }}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
        <div className="mx-auto max-w-[720px] px-5 pb-4">
          <MobileSearchPill onClick={() => setMobileSearchOpen(true)} />
        </div>
        <AnimatePresence initial={false}>
          {mobileSearchOpen && (
            <MobileSearchPanel
              onClose={() => setMobileSearchOpen(false)}
              onSearch={() => {
                setMobileSearchOpen(false);
                onNavigate("/artisans");
              }}
            />
          )}
        </AnimatePresence>
        <motion.div
          initial={false}
          animate={{
            height: mobileOpen ? "auto" : 0,
            opacity: mobileOpen ? 1 : 0,
          }}
          transition={headerSpring}
          className="overflow-hidden border-t bg-white px-5"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div className="py-5">
            <ProductTabs
              compact
              activeTab={activeTab}
              onChange={(tab) => {
                onTabChange(tab);
                onNavigate("/");
                setMobileOpen(false);
              }}
            />
            <div className="mt-5 grid gap-2">
              {mobileMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.target);
                      setMobileOpen(false);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#f7f7f7] p-3 text-left transition-colors hover:bg-[#f2f2f2]"
                  >
                    <span
                      className="text-[14px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {item.label}
                    </span>
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

function ArtisanCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div
        className="mb-3 aspect-[4/3] rounded-[14px]"
        style={{ background: COLORS.surfaceStrong }}
      />
      <div className="mb-2 flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-full"
          style={{ background: COLORS.surfaceStrong }}
        />
        <div className="flex-1 space-y-2 pt-1">
          <div className="flex justify-between gap-3">
            <div
              className="h-4 w-3/5 rounded"
              style={{ background: COLORS.surfaceStrong }}
            />
            <div
              className="h-4 w-12 rounded"
              style={{ background: COLORS.surfaceStrong }}
            />
          </div>
          <div
            className="h-3.5 w-4/5 rounded"
            style={{ background: COLORS.surfaceStrong }}
          />
          <div
            className="h-3.5 w-2/5 rounded"
            style={{ background: COLORS.surfaceStrong }}
          />
        </div>
      </div>
      <div className="mb-3 flex gap-1.5">
        <div
          className="h-6 w-20 rounded-full"
          style={{ background: COLORS.surfaceStrong }}
        />
        <div
          className="h-6 w-24 rounded-full"
          style={{ background: COLORS.surfaceStrong }}
        />
      </div>
      <div className="flex gap-2">
        <div
          className="h-10 flex-1 rounded-lg"
          style={{ background: COLORS.surfaceStrong }}
        />
        <div
          className="h-10 flex-1 rounded-lg"
          style={{ background: COLORS.surfaceStrong }}
        />
      </div>
    </div>
  );
}

function PortfolioQuickView({
  artisan,
  onClose,
  onMessage,
}: {
  artisan: (typeof artisans)[number];
  onClose: () => void;
  onMessage: (artisan: (typeof artisans)[number]) => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const initials = artisan.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationStr =
    [artisan.location.city, artisan.location.county]
      .filter(Boolean)
      .join(", ") || "Kenya";
  const portfolioFrames = [
    artisan.gradient,
    `linear-gradient(135deg, ${COLORS.primaryTint} 0%, #ffffff 42%, ${COLORS.primarySoft} 100%)`,
    `linear-gradient(135deg, #f7f7f7 0%, #d9f99d 44%, ${COLORS.primaryActive} 100%)`,
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        className="absolute inset-0 cursor-default bg-black/45"
        aria-label="Close portfolio preview"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.975 }}
        transition={{ type: "spring", stiffness: 300, damping: 31, mass: 0.74 }}
        className="relative grid max-h-[88vh] w-full max-w-[920px] overflow-hidden rounded-[28px] border bg-white md:grid-cols-[1.08fr_0.92fr]"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div className="relative min-h-[320px] bg-[#f2f2f2] md:min-h-[560px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, x: 18, scale: 1.015 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: portfolioFrames[activeImage] }}
            >
              <span
                className="text-[72px] font-bold opacity-90"
                style={{ color: COLORS.primary }}
              >
                {initials}
              </span>
            </motion.div>
          </AnimatePresence>
          <div
            className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold shadow-sm"
            style={{ color: COLORS.ink }}
          >
            <Images size={13} style={{ color: COLORS.primary }} />
            Portfolio preview
          </div>
        </div>

        <div className="flex min-h-0 flex-col p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h3
                  className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                  style={{ color: COLORS.ink }}
                >
                  {artisan.name}
                </h3>
                {artisan.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <p
                className="text-[14px] leading-[1.43]"
                style={{ color: COLORS.muted }}
              >
                {artisan.profession} · {locationStr}
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            <div
              className="rounded-[14px] border p-3"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <p
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                {artisan.rating.average.toFixed(1)}
              </p>
              <p
                className="text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                rating
              </p>
            </div>
            <div
              className="rounded-[14px] border p-3"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <p
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                {artisan.rating.total}
              </p>
              <p
                className="text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                reviews
              </p>
            </div>
            <div
              className="rounded-[14px] border p-3"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <p
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                KES {artisan.hourlyRate.toLocaleString()}
              </p>
              <p
                className="text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                per hour
              </p>
            </div>
          </div>

          <div className="mb-5">
            <p
              className="mb-2 text-[14px] font-semibold leading-[1.29]"
              style={{ color: COLORS.ink }}
            >
              Specializations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {artisan.specializations.map((specialization) => (
                <span
                  key={specialization.name}
                  className="rounded-full border px-2.5 py-1 text-[13px] leading-[1.23]"
                  style={{
                    background: COLORS.surfaceSoft,
                    borderColor: COLORS.hairlineSoft,
                    color: COLORS.muted,
                  }}
                >
                  {specialization.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {portfolioFrames.map((frame, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className="aspect-[4/3] cursor-pointer overflow-hidden rounded-[14px] border transition-transform hover:scale-[1.02]"
                  style={{
                    background: frame,
                    borderColor:
                      activeImage === index ? COLORS.ink : COLORS.hairlineSoft,
                  }}
                  aria-label={`View portfolio image ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => onMessage(artisan)}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
              style={{ background: COLORS.primary }}
            >
              <MessageCircle size={18} />
              Message artisan
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ArtisanPreviewCard({
  artisan,
  onOpenPortfolio,
  onViewProfile,
  onMessage,
}: {
  artisan: (typeof artisans)[number];
  onOpenPortfolio: (artisan: (typeof artisans)[number]) => void;
  onViewProfile: (artisan: (typeof artisans)[number]) => void;
  onMessage?: (artisan: (typeof artisans)[number]) => void;
}) {
  const initials = artisan.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const locationStr =
    [artisan.location.city, artisan.location.county]
      .filter(Boolean)
      .join(", ") || "Kenya";
  const heroImg = artisan.portfolioThumbnail ?? artisan.profileImage;
  const handleMessage = () => {
    if (onMessage) {
      onMessage(artisan);
      return;
    }
    if (typeof window !== "undefined") {
      window.location.hash = "/sign-in";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <article
      className="group block rounded-[14px] transition-all duration-200 ease-out hover:-translate-y-0.5"
      style={{ boxShadow: "none" }}
    >
      <button
        type="button"
        onClick={() => onOpenPortfolio(artisan)}
        className="relative mb-3 block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[14px] bg-[#f2f2f2] text-left"
      >
        {heroImg ? (
          <img
            src={heroImg}
            alt={artisan.profession ?? artisan.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="flex w-full items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105"
            style={{ background: artisan.gradient }}
          >
            <span
              className="text-[32px] font-bold"
              style={{ color: COLORS.primary }}
            >
              {initials}
            </span>
          </div>
        )}

        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          style={{ color: COLORS.ink }}
        >
          <Images size={13} style={{ color: COLORS.primary }} />
          View work
        </div>

        {artisan.isAvailable && (
          <div
            className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold leading-[1.18] shadow-sm"
            style={{ color: COLORS.ink }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: COLORS.primary }}
            />
            Available
          </div>
        )}

        {artisan.isPremium && !artisan.isAvailable && (
          <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold leading-[1.18] text-[#222222] shadow-sm">
            Featured
          </div>
        )}
      </button>

      <div className="mb-2 flex items-start gap-3">
        <div className="relative mt-0.5 flex-shrink-0">
          {artisan.profileImage ? (
            <img
              src={artisan.profileImage}
              alt={artisan.name}
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-100 shadow-sm">
              <span className="text-[13px] font-bold text-emerald-700">
                {initials}
              </span>
            </div>
          )}
          {artisan.isVerified && (
            <BadgeCheck
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white text-emerald-600"
              aria-label="Verified artisan"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className="truncate text-[16px] font-semibold leading-[1.25]"
              style={{ color: COLORS.ink }}
            >
              {artisan.name}
            </p>
            {artisan.rating.total > 0 && (
              <div className="flex flex-shrink-0 items-center gap-1 pt-0.5">
                <Star
                  className="h-3.5 w-3.5"
                  fill={COLORS.ink}
                  style={{ color: COLORS.ink }}
                />
                <span
                  className="text-[14px] font-medium leading-[1.29]"
                  style={{ color: COLORS.ink }}
                >
                  {artisan.rating.average.toFixed(1)}
                </span>
                <span
                  className="text-[13px] leading-[1.23]"
                  style={{ color: COLORS.mutedSoft }}
                >
                  ({artisan.rating.total})
                </span>
              </div>
            )}
          </div>
          <p
            className="truncate text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            {[artisan.profession, locationStr].filter(Boolean).join(" · ")}
          </p>
          {artisan.hourlyRate && (
            <p
              className="mt-0.5 text-[14px] leading-[1.43]"
              style={{ color: COLORS.ink }}
            >
              <span className="font-semibold">
                KES {artisan.hourlyRate.toLocaleString()}
              </span>
              <span style={{ color: COLORS.muted }}> / hr</span>
            </p>
          )}
        </div>
      </div>

      {artisan.specializations.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {artisan.specializations.slice(0, 2).map((specialization) => (
            <span
              key={specialization.name}
              className="whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] leading-[1.23]"
              style={{
                background: COLORS.surfaceSoft,
                borderColor: COLORS.hairlineSoft,
                color: COLORS.muted,
              }}
            >
              {specialization.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onViewProfile(artisan)}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[14px] font-medium leading-[1.29] transition-colors group-hover:border-emerald-600 group-hover:text-emerald-700"
          style={{ borderColor: COLORS.hairline, color: COLORS.body }}
        >
          <Eye className="h-4 w-4" />
          View Profile
        </button>
        <button
          type="button"
          onClick={handleMessage}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium leading-[1.29] text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </button>
      </div>
    </article>
  );
}

function HeroBand({ activeTab }: { activeTab: ProductTabId }) {
  const content = tabContent[activeTab];

  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-6 pt-8 md:px-10 md:pb-8 md:pt-10">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-[720px] flex-col items-center text-center"
        >
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            {content.eyebrow}
          </p>
          <h1
            className="max-w-[600px] text-[24px] font-semibold leading-[1.25] md:text-[28px] md:leading-[1.43]"
            style={{ color: COLORS.ink }}
          >
            {content.heading}
          </h1>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function ArtisanProfileSkeleton() {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-12 md:px-10 md:py-16">
      <div
        className="animate-pulse rounded-[28px] border p-5 md:p-6"
        style={{ borderColor: COLORS.hairlineSoft }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="h-20 w-20 rounded-full"
              style={{ background: COLORS.surfaceStrong }}
            />
            <div className="space-y-2">
              <div
                className="h-6 w-48 rounded"
                style={{ background: COLORS.surfaceStrong }}
              />
              <div
                className="h-4 w-64 rounded"
                style={{ background: COLORS.surfaceStrong }}
              />
              <div
                className="h-4 w-36 rounded"
                style={{ background: COLORS.surfaceStrong }}
              />
            </div>
          </div>
          <div
            className="h-12 w-52 rounded-lg"
            style={{ background: COLORS.surfaceStrong }}
          />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div
              className="h-5 w-32 rounded"
              style={{ background: COLORS.surfaceStrong }}
            />
            <div
              className="h-20 rounded-[14px]"
              style={{ background: COLORS.surfaceStrong }}
            />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] rounded-[14px]"
                  style={{ background: COLORS.surfaceStrong }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div
              className="h-32 rounded-[14px]"
              style={{ background: COLORS.surfaceStrong }}
            />
            <div
              className="h-44 rounded-[14px]"
              style={{ background: COLORS.surfaceStrong }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicArtisanProfileSection({
  activeArtisan,
  onSelectArtisan,
  onOpenPortfolio,
  onNavigate,
}: {
  activeArtisan: (typeof artisans)[number];
  onSelectArtisan: (artisan: (typeof artisans)[number]) => void;
  onOpenPortfolio: (artisan: (typeof artisans)[number]) => void;
  onNavigate: (id: string) => void;
}) {
  const initials = activeArtisan.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationStr =
    [activeArtisan.location.city, activeArtisan.location.county]
      .filter(Boolean)
      .join(", ") || "Kenya";
  const profileBio = `${activeArtisan.name} is a verified ${activeArtisan.profession?.toLowerCase()} focused on clean workmanship, responsive communication, and practical project scoping. This profile preview shows how public artisan pages will combine trust signals, portfolio work, skills, and hiring calls to action.`;
  const portfolioFrames = [
    activeArtisan.gradient,
    `linear-gradient(135deg, ${COLORS.primaryTint} 0%, #ffffff 42%, ${COLORS.primarySoft} 100%)`,
    `linear-gradient(135deg, #f7f7f7 0%, #d9f99d 44%, ${COLORS.primaryActive} 100%)`,
    `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 42%, #047857 100%)`,
    `linear-gradient(135deg, #fff7ed 0%, #fed7aa 44%, #065f46 100%)`,
    `linear-gradient(135deg, #ecfeff 0%, #a7f3d0 40%, #134e4a 100%)`,
  ];

  return (
    <section
      className="mx-auto max-w-[1080px] px-5 py-12 md:px-10 md:py-16"
      id="artisan-profile-preview"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            Verified artisan profile
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            Full artisan profile
          </h2>
          <p
            className="mt-2 max-w-[620px] text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            Review portfolio work, ratings, skills, location, pricing, and trust
            signals before starting a job request.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {artisans.slice(0, 5).map((artisan) => (
            <button
              key={artisan.id}
              onClick={() => onSelectArtisan(artisan)}
              className="min-w-fit cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-medium leading-[1.23] transition-colors hover:bg-[#f7f7f7]"
              style={{
                borderColor:
                  activeArtisan.id === artisan.id
                    ? COLORS.ink
                    : COLORS.hairline,
                color: COLORS.ink,
                background:
                  activeArtisan.id === artisan.id
                    ? COLORS.canvas
                    : "transparent",
              }}
            >
              {artisan.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeArtisan.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={routeTransition}
          className="rounded-[28px] border bg-white p-5 md:p-6"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
        >
          <div
            className="flex flex-col gap-5 border-b pb-6 md:flex-row md:items-center md:justify-between"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            <div className="flex items-start gap-4">
              <div
                className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white shadow-sm"
                style={{ background: activeArtisan.gradient }}
              >
                <span
                  className="text-[24px] font-bold"
                  style={{ color: COLORS.primary }}
                >
                  {initials}
                </span>
                {activeArtisan.isVerified && (
                  <BadgeCheck className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-white text-emerald-600" />
                )}
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3
                    className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                    style={{ color: COLORS.ink }}
                  >
                    {activeArtisan.name}
                  </h3>
                  {activeArtisan.isAvailable && (
                    <span
                      className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
                      style={{
                        borderColor: COLORS.primarySoft,
                        background: COLORS.primaryTint,
                        color: COLORS.primaryActive,
                      }}
                    >
                      Available
                    </span>
                  )}
                </div>
                <p
                  className="text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  {activeArtisan.profession} · {locationStr}
                </p>
                <div
                  className="mt-2 flex flex-wrap items-center gap-3 text-[14px] leading-[1.43]"
                  style={{ color: COLORS.body }}
                >
                  <span className="flex items-center gap-1">
                    <Star size={14} fill={COLORS.ink} />{" "}
                    {activeArtisan.rating.average.toFixed(1)} (
                    {activeArtisan.rating.total})
                  </span>
                  <span>
                    KES {activeArtisan.hourlyRate.toLocaleString()} / hr
                  </span>
                  <span>Member since 2024</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate("/sign-in")}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                style={{ borderColor: COLORS.ink, color: COLORS.ink }}
              >
                <Bookmark size={16} />
                Save
              </button>
              <button
                onClick={() => onNavigate("/sign-in")}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                style={{ background: COLORS.primary }}
              >
                <MessageCircle size={16} />
                Message
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-7 md:grid-cols-[1fr_320px]">
            <div>
              <section
                className="border-b pb-6"
                style={{ borderColor: COLORS.hairlineSoft }}
              >
                <h4
                  className="text-[21px] font-bold leading-[1.43]"
                  style={{ color: COLORS.ink }}
                >
                  About this artisan
                </h4>
                <p
                  className="mt-3 text-[16px] leading-[1.5]"
                  style={{ color: COLORS.body }}
                >
                  {profileBio}
                </p>
              </section>

              <section className="pt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4
                    className="text-[21px] font-bold leading-[1.43]"
                    style={{ color: COLORS.ink }}
                  >
                    Portfolio work
                  </h4>
                  <button
                    onClick={() => onOpenPortfolio(activeArtisan)}
                    className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline"
                    style={{ color: COLORS.ink }}
                  >
                    View all
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {portfolioFrames.map((frame, index) => (
                    <button
                      key={index}
                      onClick={() => onOpenPortfolio(activeArtisan)}
                      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-[14px] text-left"
                      style={{ background: frame }}
                    >
                      <div
                        className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                        style={{ background: frame }}
                      />
                      <div
                        className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold shadow-sm"
                        style={{ color: COLORS.ink }}
                      >
                        Project {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <div
                className="rounded-[14px] border p-5"
                style={{ borderColor: COLORS.hairlineSoft }}
              >
                <h4
                  className="mb-3 text-[16px] font-semibold leading-[1.25]"
                  style={{ color: COLORS.ink }}
                >
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeArtisan.specializations.map((specialization) => (
                    <span
                      key={specialization.name}
                      className="rounded-full border px-2.5 py-1 text-[13px] leading-[1.23]"
                      style={{
                        borderColor: COLORS.hairlineSoft,
                        background: COLORS.surfaceSoft,
                        color: COLORS.muted,
                      }}
                    >
                      {specialization.name}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[14px] border p-5"
                style={{ borderColor: COLORS.hairlineSoft }}
              >
                <h4
                  className="mb-4 text-[16px] font-semibold leading-[1.25]"
                  style={{ color: COLORS.ink }}
                >
                  Details
                </h4>
                <div
                  className="grid gap-3 text-[14px] leading-[1.43]"
                  style={{ color: COLORS.body }}
                >
                  <p className="flex items-center gap-2">
                    <MapPin size={16} style={{ color: COLORS.muted }} />{" "}
                    {locationStr}
                  </p>
                  <p className="flex items-center gap-2">
                    <BriefcaseBusiness
                      size={16}
                      style={{ color: COLORS.muted }}
                    />{" "}
                    {activeArtisan.profession}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} style={{ color: COLORS.muted }} /> 4
                    years experience
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe2 size={16} style={{ color: COLORS.muted }} />{" "}
                    chapaworks.co.ke/profile/{activeArtisan.id}
                  </p>
                </div>
              </div>

              <div
                className="rounded-[14px] p-5 text-white"
                style={{ background: COLORS.primary }}
              >
                <h4 className="text-[16px] font-semibold leading-[1.25]">
                  Ready to hire?
                </h4>
                <p className="mt-2 text-[14px] leading-[1.43] text-white/85">
                  Sign in to save this artisan, start a conversation, and
                  request a quote.
                </p>
                <button
                  onClick={() => onNavigate("/sign-in")}
                  className="mt-4 h-11 w-full cursor-pointer rounded-lg bg-white px-4 text-[14px] font-medium transition-transform hover:scale-[1.01]"
                  style={{ color: COLORS.primaryActive }}
                >
                  Sign in to message
                </button>
              </div>
            </aside>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

type AuthPreviewMode = "signup" | "signin";
type AuthSignupRole = "client" | "artisan";
type AuthPreviewStep = "form" | "otp";

function AuthPreviewSection({
  initialMode = "signup",
  signupRole = "client",
  inviteToken = null,
  onNavigate,
}: {
  initialMode?: AuthPreviewMode;
  signupRole?: AuthSignupRole;
  inviteToken?: string | null;
  onNavigate: (route: AppRoute) => void;
}) {
  const [step, setStep] = useState<AuthPreviewStep>("form");
  const isSignIn = initialMode === "signin";
  const isInvite = Boolean(inviteToken);
  const effectiveRole: AuthSignupRole = isInvite ? "artisan" : signupRole;
  const isArtisan = effectiveRole === "artisan";

  useEffect(() => {
    setStep("form");
  }, [initialMode, signupRole, inviteToken]);

  const headline = isSignIn
    ? "Welcome back"
    : isArtisan
      ? "Join as an Artisan"
      : "Create Your Account";
  const subheadline = isSignIn
    ? "Sign in once. Your verified role decides whether you land in the client, artisan, or admin dashboard."
    : isArtisan
      ? "Showcase your skills, get discovered by clients across Kenya."
      : "Find and hire verified artisans near you.";
  const roleBadge = isSignIn
    ? "Role resolved after sign-in"
    : `Signing up as ${isArtisan ? "artisan" : "client"}`;
  const ctaLabel = isSignIn
    ? "Continue"
    : isArtisan
      ? "Create Artisan Account"
      : "Create Account";

  return (
    <section
      id="auth-preview"
      className="mx-auto max-w-[1080px] px-5 py-12 md:px-10 md:py-16"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            Account access
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            {headline}
          </h2>
          <p
            className="mt-2 max-w-[620px] text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            {subheadline}
          </p>
        </div>
        <button
          onClick={() => onNavigate(isSignIn ? "/sign-up" : "/sign-in")}
          className="h-10 w-fit cursor-pointer rounded-full border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
          style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
        >
          {isSignIn ? "Create account" : "Sign in"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[0.86fr_1.14fr] md:items-start">
        <div
          className="rounded-[28px] border p-6"
          style={{
            borderColor: COLORS.hairlineSoft,
            background: COLORS.surfaceSoft,
          }}
        >
          <p
            className="text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.primary }}
          >
            {isSignIn
              ? "One account for every workspace"
              : isArtisan
                ? "Built for skilled professionals"
                : "Hire with more confidence"}
          </p>
          <p
            className="mt-3 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            {isSignIn
              ? "Access your saved artisans, jobs, messages, and dashboard in one place."
              : isArtisan
                ? "Create a public profile that helps clients understand your craft before they message you."
                : "Start with verified profiles, visible ratings, portfolios, and direct messaging."}
          </p>
          <div
            className="mt-8 grid gap-3 text-[14px] leading-[1.43]"
            style={{ color: COLORS.body }}
          >
            {(isSignIn
              ? [
                  "Return to your active conversations",
                  "Continue reviewing jobs and quotes",
                  "Land in the right workspace after sign-in",
                ]
              : isArtisan
                ? [
                    "Show portfolio projects and specializations",
                    "Receive quote requests from nearby clients",
                    "Complete verification to improve marketplace trust",
                  ]
                : [
                    "Browse verified artisans near you",
                    "Save profiles and compare options",
                    "Message artisans before requesting a quote",
                  ]
            ).map((item) => (
              <p key={item} className="flex items-center gap-2">
                <CheckCircle2 size={16} style={{ color: COLORS.primary }} />{" "}
                {item}
              </p>
            ))}
          </div>
          <div
            className="mt-8 rounded-[18px] border bg-white p-4"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            <p
              className="text-[14px] font-semibold leading-[1.29]"
              style={{ color: COLORS.ink }}
            >
              {isSignIn
                ? "After sign-in"
                : isArtisan
                  ? "After creating your profile"
                  : "After creating your account"}
            </p>
            <p
              className="mt-1 text-[14px] leading-[1.43]"
              style={{ color: COLORS.muted }}
            >
              {isSignIn
                ? "ChapaWorks sends you to the workspace attached to your account."
                : isArtisan
                  ? "You can add portfolio work, set availability, and submit verification details."
                  : "You can save artisans, send messages, and manage job requests from your client dashboard."}
            </p>
          </div>
        </div>

        <motion.div
          layout
          className="rounded-[28px] border bg-white p-5 md:p-6"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium leading-[1.23]"
              style={{
                borderColor: isArtisan ? "#fde68a" : COLORS.primarySoft,
                background: isArtisan ? "#fffbeb" : COLORS.primaryTint,
                color: isArtisan ? "#92400e" : COLORS.primaryActive,
              }}
            >
              {isArtisan && <Hammer size={14} />}
              {!isArtisan && !isSignIn && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: COLORS.primary }}
                />
              )}
              {roleBadge}
            </span>
            <button
              onClick={() => setStep(step === "form" ? "otp" : "form")}
              className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline"
              style={{ color: COLORS.ink }}
            >
              {step === "form" ? "Preview OTP" : "Back to form"}
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {step === "form" ? (
              <motion.div
                key={`${initialMode}-${effectiveRole}-${inviteToken ?? "none"}-form`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {isInvite && (
                  <div
                    className="mb-4 rounded-[14px] border p-4"
                    style={{
                      borderColor: COLORS.primarySoft,
                      background: COLORS.primaryTint,
                    }}
                  >
                    <p
                      className="text-[14px] font-semibold leading-[1.29]"
                      style={{ color: COLORS.primaryActive }}
                    >
                      You've been invited to join as an artisan!
                    </p>
                    <p
                      className="mt-1 text-[14px] leading-[1.43]"
                      style={{ color: COLORS.body }}
                    >
                      Invite token: {inviteToken} · Artisan role locked after
                      validation.
                    </p>
                  </div>
                )}

                <button
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  <Globe2 size={17} />
                  Continue with Google
                </button>

                <div
                  className="my-5 flex items-center gap-3 text-[13px]"
                  style={{ color: COLORS.muted }}
                >
                  <span
                    className="h-px flex-1"
                    style={{ background: COLORS.hairlineSoft }}
                  />
                  or
                  <span
                    className="h-px flex-1"
                    style={{ background: COLORS.hairlineSoft }}
                  />
                </div>

                <div className="grid gap-3">
                  <label className="grid gap-1.5">
                    <span
                      className="text-[14px] font-medium leading-[1.29]"
                      style={{ color: COLORS.ink }}
                    >
                      Email
                    </span>
                    <span
                      className="flex h-14 items-center gap-3 rounded-lg border px-4"
                      style={{ borderColor: COLORS.hairline }}
                    >
                      <Mail size={17} style={{ color: COLORS.muted }} />
                      <input
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#929292]"
                      />
                    </span>
                  </label>
                  {!isSignIn && (
                    <label className="grid gap-1.5">
                      <span
                        className="text-[14px] font-medium leading-[1.29]"
                        style={{ color: COLORS.ink }}
                      >
                        Password
                      </span>
                      <span
                        className="flex h-14 items-center gap-3 rounded-lg border px-4"
                        style={{ borderColor: COLORS.hairline }}
                      >
                        <LockKeyhole
                          size={17}
                          style={{ color: COLORS.muted }}
                        />
                        <input
                          placeholder="Create a password"
                          type="password"
                          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#929292]"
                        />
                      </span>
                    </label>
                  )}
                  <div
                    className="rounded-lg border px-4 py-3 text-[14px] leading-[1.43]"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      background: COLORS.surfaceSoft,
                      color: COLORS.muted,
                    }}
                  >
                    CAPTCHA placeholder area
                  </div>
                  <button
                    onClick={() => setStep("otp")}
                    className="mt-1 h-12 cursor-pointer rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
                    style={{ background: COLORS.primary }}
                  >
                    {ctaLabel}
                  </button>
                  {isSignIn && (
                    <button
                      onClick={() => onNavigate("/admin")}
                      className="h-12 cursor-pointer rounded-lg border text-[16px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.ink,
                      }}
                    >
                      Continue as admin preview
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${initialMode}-${effectiveRole}-otp`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="mb-6 grid h-12 w-12 place-items-center rounded-full"
                  style={{
                    background: COLORS.primaryTint,
                    color: COLORS.primary,
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <h3
                  className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                  style={{ color: COLORS.ink }}
                >
                  Check your email
                </h3>
                <p
                  className="mt-2 text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  Enter the verification code sent to your email to finish
                  authentication.
                </p>
                <div className="mt-5 grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      maxLength={1}
                      className="h-12 rounded-lg border text-center text-[18px] font-semibold outline-none focus:border-[#222222]"
                      style={{ borderColor: COLORS.hairline }}
                    />
                  ))}
                </div>
                <button
                  className="mt-5 h-12 w-full cursor-pointer rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  Verify and continue
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p
            className="mt-5 text-center text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            {isSignIn
              ? "New here? "
              : isArtisan
                ? "Not an artisan? "
                : "Already have an account? "}
            <button
              onClick={() =>
                onNavigate(
                  isSignIn ? "/sign-up" : isArtisan ? "/sign-up" : "/sign-in",
                )
              }
              className="cursor-pointer font-medium underline-offset-4 hover:underline"
              style={{ color: COLORS.ink }}
            >
              {isSignIn
                ? "Create account"
                : isArtisan
                  ? "Sign up as a client"
                  : "Sign in"}
            </button>
            {!isSignIn && !isArtisan && (
              <>
                <span> · </span>
                <button
                  onClick={() => onNavigate("/sign-up?role=artisan")}
                  className="cursor-pointer font-medium underline-offset-4 hover:underline"
                  style={{ color: COLORS.ink }}
                >
                  Sign up as an artisan
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

type DashboardRole = "artisan" | "client" | "admin";

type DashboardRecord = {
  title: string;
  meta: string;
  status: "PENDING" | "ACTIVE" | "QUOTED" | "VERIFIED" | "REVIEW" | "COMPLETED";
  amount?: string;
};

function StatusChip({ status }: { status: DashboardRecord["status"] }) {
  const styles: Record<
    DashboardRecord["status"],
    { label: string; bg: string; fg: string; border: string }
  > = {
    PENDING: {
      label: "Pending",
      bg: "#fffbeb",
      fg: "#92400e",
      border: "#fde68a",
    },
    ACTIVE: {
      label: "Active",
      bg: COLORS.primaryTint,
      fg: COLORS.primaryActive,
      border: COLORS.primarySoft,
    },
    QUOTED: {
      label: "Quoted",
      bg: "#eff6ff",
      fg: "#1d4ed8",
      border: "#bfdbfe",
    },
    VERIFIED: {
      label: "Verified",
      bg: COLORS.primaryTint,
      fg: COLORS.primaryActive,
      border: COLORS.primarySoft,
    },
    REVIEW: {
      label: "Review",
      bg: "#fff7ed",
      fg: "#c2410c",
      border: "#fed7aa",
    },
    COMPLETED: {
      label: "Completed",
      bg: "#f7f7f7",
      fg: COLORS.body,
      border: COLORS.hairline,
    },
  };
  const style = styles[status];

  return (
    <span
      className="inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
      style={{
        background: style.bg,
        color: style.fg,
        borderColor: style.border,
      }}
    >
      {style.label}
    </span>
  );
}

function AvatarFallback({
  name,
  image,
  size = 40,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CW";

  return image ? (
    <img
      src={image}
      alt={name}
      className="shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full border-2 border-white shadow-sm"
      style={{
        width: size,
        height: size,
        background: COLORS.primaryTint,
        color: COLORS.primaryActive,
      }}
    >
      <span className="text-[12px] font-bold leading-none">{initials}</span>
    </span>
  );
}

function UserListIdentity({
  name,
  meta,
  image,
}: {
  name: string;
  meta: string;
  image?: string | null;
}) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <AvatarFallback name={name} image={image} />
      <span className="min-w-0">
        <span
          className="block truncate font-semibold"
          style={{ color: COLORS.ink }}
        >
          {name}
        </span>
        <span
          className="mt-1 block truncate text-[13px]"
          style={{ color: COLORS.muted }}
        >
          {meta}
        </span>
      </span>
    </span>
  );
}

function DashboardStatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Search;
}) {
  return (
    <div
      className="rounded-[14px] border bg-white p-4"
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-full"
          style={{ background: COLORS.surfaceSoft, color: COLORS.primary }}
        >
          <Icon size={18} />
        </span>
        <span
          className="text-[13px] leading-[1.23]"
          style={{ color: COLORS.muted }}
        >
          30d
        </span>
      </div>
      <p
        className="text-[24px] font-semibold leading-[1.2]"
        style={{ color: COLORS.ink }}
      >
        {value}
      </p>
      <p
        className="mt-1 text-[14px] font-medium leading-[1.29]"
        style={{ color: COLORS.ink }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-[13px] leading-[1.23]"
        style={{ color: COLORS.muted }}
      >
        {helper}
      </p>
    </div>
  );
}

type DashboardNavItem<View extends string> = {
  id: View;
  label: string;
  icon: typeof Search;
  route?: AppRoute;
  badge?: string | number;
  section?: string;
};

function DashboardSidebar<View extends string>({
  title,
  subtitle,
  items,
  activeView,
  onSelect,
  collapsed = false,
  onToggle,
  role,
}: {
  title: string;
  subtitle: string;
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  role?: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  const visibleItems = items.filter((item) => item.route);

  return (
    <motion.aside
      layout
      initial={false}
      transition={dashboardSpring}
      className={
        collapsed
          ? "sticky top-0 hidden h-screen min-h-0 overflow-hidden border-r bg-[#f7f7f7] p-3 lg:flex lg:flex-col"
          : "sticky top-0 hidden h-screen min-h-0 overflow-hidden border-r bg-[#f7f7f7] p-4 lg:flex lg:flex-col"
      }
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      <motion.div
        layout
        className={
          collapsed
            ? "mb-6 flex flex-col items-center gap-3"
            : "mb-6 flex items-center justify-between gap-3"
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {collapsed ? (
            <motion.span
              key="collapsed-logo"
              layout
              initial={{ opacity: 0, scale: 0.9, x: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -6 }}
              transition={dashboardSpring}
              className="grid h-10 w-10 place-items-center rounded-xl border"
              style={{
                borderColor: COLORS.primarySoft,
                background: COLORS.primaryTint,
              }}
            >
              <img
                src={CHAPAWORKS_LOGO_SRC}
                alt="ChapaWorks"
                className="h-6 w-6 object-contain opacity-90"
              />
            </motion.span>
          ) : (
            <motion.div
              key="expanded-logo"
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={dashboardSpring}
            >
              <ChapaWorksLogo />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          layout
          onClick={onToggle}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
          style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          aria-label={
            collapsed
              ? "Expand dashboard sidebar"
              : "Collapse dashboard sidebar"
          }
          whileTap={{ scale: 0.94 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={collapsed ? "expand-icon" : "collapse-icon"}
              initial={{
                opacity: 0,
                rotate: collapsed ? -90 : 90,
                x: collapsed ? -3 : 3,
              }}
              animate={{ opacity: 1, rotate: 0, x: 0 }}
              exit={{
                opacity: 0,
                rotate: collapsed ? 90 : -90,
                x: collapsed ? 3 : -3,
              }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 28,
                mass: 0.46,
              }}
              className="grid place-items-center"
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>
      {!collapsed && (
        <div className="mb-4 px-2">
          <p
            className="text-[13px] font-semibold leading-[1.23]"
            style={{ color: COLORS.ink }}
          >
            {title}
          </p>
          <p
            className="mt-1 text-[12px] leading-[1.33]"
            style={{ color: COLORS.muted }}
          >
            {subtitle}
          </p>
        </div>
      )}
      <nav className="flex min-h-0 flex-1 flex-col justify-start gap-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(() => {
          const seenSections: string[] = [];
          const visItems = visibleItems;
          visItems.forEach((item) => {
            const sec = item.section ?? "";
            if (!seenSections.includes(sec)) seenSections.push(sec);
          });
          const hasSections = seenSections.some(Boolean);
          return seenSections.flatMap((sec) => {
            const group = visItems.filter((item) => (item.section ?? "") === sec);
            const header = (hasSections && sec && !collapsed)
              ? <p key={`sec-${sec}-label`} className="mt-3 mb-0.5 px-3 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: COLORS.mutedSoft }}>{sec}</p>
              : null;
            const buttons = group.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={
                    collapsed
                      ? "relative flex h-11 cursor-pointer items-center justify-center rounded-[12px] text-left text-[14px] font-medium leading-[1.29] transition-colors hover:bg-white"
                      : "flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[14px] font-medium leading-[1.29] transition-colors hover:bg-white"
                  }
                  style={{
                    color: active ? COLORS.ink : COLORS.body,
                    background: active ? COLORS.canvas : "transparent",
                    boxShadow: active ? softShadow : "none",
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: active ? COLORS.primary : COLORS.muted }}
                  />
                  {!collapsed && (
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={
                        collapsed
                          ? "absolute right-1.5 top-1 grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-semibold text-white"
                          : "ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                      }
                      style={{ background: COLORS.primary }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            });
            return header ? [header, ...buttons] : buttons;
          });
        })()}
      </nav>
      {role === "Artisan" && !collapsed && (
        <div
          className="mt-auto rounded-[18px] border p-4"
          style={{
            borderColor: COLORS.primarySoft,
            background: COLORS.primaryTint,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-full bg-white"
              style={{ color: COLORS.primary }}
            >
              <Sparkles size={17} />
            </span>
            <span>
              <p
                className="text-[13px] font-semibold leading-[1.23]"
                style={{ color: COLORS.ink }}
              >
                Premium Artisan
              </p>
              <p
                className="text-[12px] leading-[1.33]"
                style={{ color: COLORS.primaryActive }}
              >
                Boost visibility
              </p>
            </span>
          </div>
          <p
            className="text-[12px] leading-[1.33]"
            style={{ color: COLORS.body }}
          >
            Priority placement, premium badge, more portfolio slots, and lower
            commission.
          </p>
          <button
            onClick={() => onSelect("subscription" as View)}
            className="mt-3 h-9 w-full cursor-pointer rounded-lg text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Manage plan
          </button>
        </div>
      )}
    </motion.aside>
  );
}

function DashboardMobileNav<View extends string>({
  items,
  activeView,
  onSelect,
}: {
  items: Array<DashboardNavItem<View>>;
  activeView: View;
  onSelect: (view: View) => void;
}) {
  const visibleItems = items.filter((item) => item.route);
  return (
    <div
      className="border-b p-3 lg:hidden"
      style={{
        borderColor: COLORS.hairlineSoft,
        background: COLORS.surfaceSoft,
      }}
    >
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex min-w-fit cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] font-medium transition-colors hover:bg-white"
              style={{
                borderColor: active ? COLORS.ink : COLORS.hairline,
                color: active ? COLORS.ink : COLORS.body,
                background: active ? COLORS.canvas : "transparent",
                boxShadow: active ? softShadow : "none",
              }}
            >
              <Icon
                size={16}
                style={{ color: active ? COLORS.primary : COLORS.muted }}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className="ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                  style={{ background: COLORS.primary }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DashboardThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.chapaworksDashboardTheme = dark ? "dark" : "light";
    if (dark) {
      document.body.classList.add("cw-dark");
    } else {
      document.body.classList.remove("cw-dark");
    }
  }, [dark]);

  const Icon = dark ? Moon : Sun;

  return (
    <button
      onClick={() => setDark((value) => !value)}
      className="group flex h-11 cursor-pointer items-center gap-2 rounded-full border bg-white px-3 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
      style={{
        borderColor: COLORS.hairline,
        color: COLORS.ink,
        boxShadow: softShadow,
      }}
      aria-label="Toggle dashboard theme"
    >
      <motion.span
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -24, scale: 0.86, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 24, mass: 0.45 }}
        className="grid place-items-center"
      >
        <Icon
          size={16}
          style={{ color: dark ? COLORS.primary : COLORS.amber }}
        />
      </motion.span>
      <span className="hidden sm:inline">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

function DashboardNotificationButton({
  role,
}: {
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Real unread count from context — null when not in a provider (preview mode)
  const _notifCtx = useOptionalDashboardRealData();
  const realUnreadCount = _notifCtx?.unreadCount ?? 0;

  const notifications =
    role === "Admin"
      ? [
          "19 verification reviews pending",
          "Notification worker warning",
          "3 reported profiles need triage",
        ]
      : role === "Client"
        ? [
            "Amina sent a quote",
            "Peter replied to your message",
            "One completed job needs a review",
          ]
        : [
            "Miriam replied to your quote",
            "Verification is still pending",
            "Portfolio views are up 12%",
          ];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    return () =>
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
  }, [open]);

  const handleViewAll = () => {
    setOpen(false);
    if (typeof window === "undefined") return;
    const route =
      role === "Admin"
        ? "/admin/monitoring"
        : role === "Client"
          ? "/client/messages"
          : "/artisan/messages";
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
        style={{
          borderColor: COLORS.hairline,
          color: COLORS.ink,
          boxShadow: softShadow,
        }}
        aria-label="Open notifications"
      >
        <BellRing size={17} />
        <span
          className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
          style={{ background: COLORS.primary }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.96,
              transformOrigin: "top right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={dashboardSpring}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] overflow-hidden rounded-[18px] border bg-white p-2"
            style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
          >
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div>
                <p
                  className="text-[14px] font-semibold leading-[1.29]"
                  style={{ color: COLORS.ink }}
                >
                  Notifications
                </p>
                <p
                  className="mt-1 text-[13px] leading-[1.23]"
                  style={{ color: COLORS.muted }}
                >
                  {realUnreadCount > 0 ? realUnreadCount : notifications.length} unread updates
                </p>
              </div>
              <span
                className="rounded-full px-2 py-1 text-[11px] font-semibold text-white"
                style={{ background: COLORS.primary }}
              >
                {realUnreadCount > 0 ? realUnreadCount : notifications.length}
              </span>
            </div>
            <div className="h-px" style={{ background: COLORS.hairlineSoft }} />
            <div className="grid gap-1 py-1">
              {notifications.map((item, index) => (
                <button
                  key={item}
                  onClick={handleViewAll}
                  className="flex w-full cursor-pointer gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-[#f7f7f7]"
                >
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background:
                        index === 0 ? COLORS.primary : COLORS.hairline,
                    }}
                  />
                  <span>
                    <span
                      className="block text-[14px] leading-[1.29]"
                      style={{ color: COLORS.ink }}
                    >
                      {item}
                    </span>
                    <span
                      className="mt-0.5 block text-[12px] leading-[1.33]"
                      style={{ color: COLORS.muted }}
                    >
                      {index + 1}h ago
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleViewAll}
              className="mt-1 h-10 w-full cursor-pointer rounded-lg border text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              View all notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardProfileButton({
  role,
}: {
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Real user identity from context — null when not in a provider (preview mode)
  const _profileCtx = useOptionalDashboardRealData();
  const realDisplayName = _profileCtx?.displayName ?? null;
  const realAvatarUrl = _profileCtx?.avatarUrl ?? null;

  const displayName =
    realDisplayName ??
    (role === "Admin" ? "Admin" : role === "Artisan" ? "Grace Wanjiku" : "Client");
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const routeForAction = (label: string): AppRoute => {
    if (label === "Sign out") return "/sign-in";
    if (role === "Artisan")
      return label === "Notifications"
        ? "/artisan/messages"
        : "/artisan/settings";
    if (role === "Client")
      return label === "Notifications"
        ? "/client/messages"
        : "/client/dashboard";
    if (role === "Admin")
      return label === "Notifications"
        ? "/admin/monitoring"
        : "/admin/settings";
    return "/dashboard";
  };

  const handleProfileAction = (label: string) => {
    setOpen(false);
    if (typeof window === "undefined") return;
    window.location.hash = routeForAction(label);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    return () =>
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-full border bg-white py-1.5 pl-2.5 pr-3 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
        style={{
          borderColor: COLORS.hairline,
          color: COLORS.ink,
          boxShadow: softShadow,
        }}
      >
        <span
          className="grid h-8 w-8 place-items-center rounded-full overflow-hidden"
          style={{ background: COLORS.primaryTint, color: COLORS.primary }}
        >
          {realAvatarUrl ? (
            <img src={realAvatarUrl} alt={displayName} className="h-8 w-8 object-cover rounded-full" />
          ) : (
            <span className="text-[12px] font-semibold">{initials || <UserRound size={16} />}</span>
          )}
        </span>
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronRight
          size={14}
          className={
            open ? "rotate-90 transition-transform" : "transition-transform"
          }
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.96,
              transformOrigin: "top right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 32,
              mass: 0.62,
            }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[260px] overflow-hidden rounded-[18px] border bg-white p-2"
            style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
          >
            <div className="px-3 py-3">
              <p
                className="text-[14px] font-semibold leading-[1.29]"
                style={{ color: COLORS.ink }}
              >
                {displayName}
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                {role} account
              </p>
            </div>
            <div className="h-px" style={{ background: COLORS.hairlineSoft }} />
            {[
              ["Profile", UserRound],
              ["Account settings", Settings],
              ["Notifications", BellRing],
              ["Sign out", LogIn],
            ].map(([label, Icon]) => (
              <button
                key={label as string}
                onClick={() => handleProfileAction(label as string)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-[#f7f7f7]"
                style={{ color: COLORS.ink }}
              >
                <Icon size={16} style={{ color: COLORS.muted }} />
                {label as string}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickDetailSlideover({
  title,
  subtitle,
  status,
  description,
  metrics,
  actions,
  onClose,
}: {
  title: string;
  subtitle: string;
  status: DashboardRecord["status"];
  description: string;
  metrics: Array<[string, string]>;
  actions: Array<{
    label: string;
    primary?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }>;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex justify-end bg-black/20 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close quick detail"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: 44, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 44, opacity: 0 }}
        transition={{ type: "spring", stiffness: 330, damping: 33, mass: 0.72 }}
        className="relative w-full max-w-[440px] overflow-auto rounded-[24px] border bg-white p-5"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[13px] font-medium leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              At-a-glance detail
            </p>
            <h3
              className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
              style={{ color: COLORS.ink }}
            >
              {title}
            </h3>
            <p
              className="mt-2 text-[14px] leading-[1.43]"
              style={{ color: COLORS.muted }}
            >
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
            aria-label="Close quick detail"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="mb-4 rounded-[14px] border p-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p
              className="text-[14px] font-semibold leading-[1.29]"
              style={{ color: COLORS.ink }}
            >
              Status
            </p>
            <StatusChip status={status} />
          </div>
          <p
            className="text-[14px] leading-[1.43]"
            style={{ color: COLORS.body }}
          >
            {description}
          </p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {metrics.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[14px] border p-3"
              style={{
                borderColor: COLORS.hairlineSoft,
                background: COLORS.surfaceSoft,
              }}
            >
              <p
                className="text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                {label}
              </p>
              <p
                className="mt-1 text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              disabled={action.disabled}
              onClick={action.onClick}
              className={
                action.primary
                  ? "h-11 cursor-pointer rounded-lg text-[14px] font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                  : "h-11 cursor-pointer rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
              }
              style={
                action.primary
                  ? { background: COLORS.primary }
                  : { borderColor: COLORS.hairline, color: COLORS.ink }
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function StatusPill({ status }: { status: DashboardRecord["status"] }) {
  const statusStyles: Record<
    DashboardRecord["status"],
    { label: string; bg: string; color: string; border: string }
  > = {
    VERIFIED: {
      label: "Verified",
      bg: "#ecfdf5",
      color: "#047857",
      border: "#bbf7d0",
    },
    PENDING: {
      label: "Pending",
      bg: "#fff7ed",
      color: "#c2410c",
      border: "#fed7aa",
    },
    REVIEW: {
      label: "Review",
      bg: "#fef2f2",
      color: "#b91c1c",
      border: "#fecaca",
    },
    ACTIVE: {
      label: "Active",
      bg: "#eff6ff",
      color: "#1d4ed8",
      border: "#bfdbfe",
    },
    PAUSED: {
      label: "Paused",
      bg: "#f8fafc",
      color: "#475569",
      border: "#e2e8f0",
    },
  };

  const style = statusStyles[status] ?? {
    label: String(status),
    bg: "#f8fafc",
    color: "#475569",
    border: "#e2e8f0",
  };

  return (
    <span
      className="inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{
        background: style.bg,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {style.label}
    </span>
  );
}

function FullDetailViewModal({
  title,
  subtitle,
  status,
  description,
  metrics,
  onClose,
}: {
  title: string;
  subtitle: string;
  status: DashboardRecord["status"];
  description: string;
  metrics: Array<[string, string]>;
  onClose: () => void;
}) {
  const [reviewDecision, setReviewDecision] = useState<
    "approve" | "request" | "reject" | "escalate"
  >("approve");
  const [decisionNote, setDecisionNote] = useState(
    "Evidence reviewed. Decision reason will be saved to the audit timeline before the record is updated.",
  );
  const [decisionSubmitted, setDecisionSubmitted] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState("national-id");
  const [documentChecks, setDocumentChecks] = useState<Record<string, boolean>>(
    {
      legible: false,
      nameMatch: false,
      dateValid: false,
      documentAuthentic: false,
      noTampering: false,
    },
  );
  const [reviewHistory, setReviewHistory] = useState<
    Array<{ action: string; note: string; time: string }>
  >([]);

  const reviewDocuments = [
    {
      id: "national-id",
      name: "National ID",
      type: "Identity document",
      status: "Submitted",
      uploaded: "Today, 09:42",
      size: "1.8 MB",
      fields: [
        ["Name", title],
        ["ID number", "•••• 7429"],
        ["Expiry", "12 Oct 2029"],
      ],
      preview: "ID",
    },
    {
      id: "workshop-license",
      name: "Workshop license",
      type: "Business verification",
      status: "Submitted",
      uploaded: "Yesterday, 16:18",
      size: "940 KB",
      fields: [
        ["Business", subtitle],
        ["Permit", "County trade license"],
        ["Expiry", "03 Mar 2027"],
      ],
      preview: "LIC",
    },
    {
      id: "portfolio-proof",
      name: "Portfolio proof",
      type: "Craft evidence",
      status: "Submitted",
      uploaded: "Yesterday, 15:02",
      size: "3.4 MB",
      fields: [
        ["Category", "Handmade products"],
        ["Evidence", "3 product images"],
        ["Source", "Applicant upload"],
      ],
      preview: "IMG",
    },
  ];

  const activeDocument =
    reviewDocuments.find((document) => document.id === activeDocumentId) ??
    reviewDocuments[0];
  const requiredChecksComplete = Object.values(documentChecks).every(Boolean);
  const normalizedTitle = `${title} ${subtitle}`.toLowerCase();
  const detailKind =
    normalizedTitle.includes("verify") ||
    normalizedTitle.includes("verification")
      ? "verification"
      : normalizedTitle.includes("user") || normalizedTitle.includes("account")
        ? "user"
        : normalizedTitle.includes("moderation") ||
            (normalizedTitle.includes("inspect") &&
              normalizedTitle.includes("report"))
          ? "moderation"
          : normalizedTitle.includes("logs") ||
              normalizedTitle.includes("service")
            ? "monitoring"
            : normalizedTitle.includes("map") ||
                normalizedTitle.includes("location") ||
                normalizedTitle.includes("county")
              ? "location"
              : normalizedTitle.includes("invite")
                ? "invite"
                : normalizedTitle.includes("artisan") ||
                    normalizedTitle.includes("profile administration")
                  ? "artisan"
                  : "generic";
  const detailContent = {
    artisan: {
      label: "Artisan profile review",
      cards: [
        [
          "Profile quality",
          "Portfolio, bio, rates, service areas, and search readiness.",
        ],
        [
          "Verification evidence",
          "Identity evidence, trade proof, category fit, and badge state.",
        ],
        [
          "Marketplace performance",
          "Jobs, quotes, reviews, response time, and subscription state.",
        ],
      ],
      related: [
        "Portfolio",
        "Verification",
        "Jobs",
        "Quotes",
        "Reviews",
        "Subscription",
      ],
    },
    user: {
      label: "User account controls",
      cards: [
        [
          "Account activity",
          "Sign-in state, contact data, profile role, and account risk.",
        ],
        [
          "Marketplace records",
          "Jobs, quotes, messages, support tickets, and reviews.",
        ],
        [
          "Trust controls",
          "Reports, flags, restrictions, suspensions, and audit history.",
        ],
      ],
      related: [
        "Profile",
        "Jobs",
        "Messages",
        "Reports",
        "Support",
        "Audit log",
      ],
    },
    moderation: {
      label: "Moderation case review",
      cards: [
        [
          "Reported content",
          "Target record, source, reporter, severity, and evidence context.",
        ],
        [
          "Decision options",
          "Resolve, request context, escalate enforcement, or dismiss.",
        ],
        [
          "Safety audit",
          "Every enforcement action requires an internal note and audit event.",
        ],
      ],
      related: [
        "Evidence",
        "Reporter",
        "Respondent",
        "Conversation",
        "Job context",
        "Audit log",
      ],
    },
    monitoring: {
      label: "System service inspection",
      cards: [
        [
          "Service health",
          "Latency, uptime, queue state, worker health, and error budget.",
        ],
        [
          "Operational logs",
          "Recent events, deploys, retries, incidents, and rollbacks.",
        ],
        [
          "Incident response",
          "Assign owner, open incident, annotate event, or resolve warning.",
        ],
      ],
      related: ["Logs", "Deploys", "Incidents", "Queues", "Metrics", "Runbook"],
    },
    location: {
      label: "Location index review",
      cards: [
        [
          "Coverage map",
          "County, city, aliases, service radius, and coordinate freshness.",
        ],
        [
          "Supply density",
          "Available artisans, premium artisans, demand clusters, and gaps.",
        ],
        [
          "Search indexing",
          "Refresh aliases, stale coordinates, map bounds, and ranking signals.",
        ],
      ],
      related: [
        "Map bounds",
        "Aliases",
        "Artisans",
        "Demand",
        "Index jobs",
        "Audit log",
      ],
    },
    invite: {
      label: "Invite record management",
      cards: [
        [
          "Invite token",
          "Role lock, expiry, resend state, acceptance timeline, and revocation.",
        ],
        [
          "Onboarding path",
          "Target role, applicant status, completion state, and reminders.",
        ],
        [
          "Bulk safety",
          "Duplicate detection, invalid rows, export log, and audit trail.",
        ],
      ],
      related: [
        "Token",
        "Recipient",
        "Role",
        "Timeline",
        "Bulk batch",
        "Audit log",
      ],
    },
    generic: {
      label: "Admin record review",
      cards: [
        [
          "Record summary",
          "Core record state, ownership, status, and related operational data.",
        ],
        ["Actions", "Review, update, assign, export, annotate, or escalate."],
        [
          "Audit",
          "All administrative mutations are recorded for traceability.",
        ],
      ],
      related: ["Summary", "Related records", "Notes", "Audit log"],
    },
  }[detailKind];

  const decisionCopy = {
    approve: {
      title: "Approve verification",
      status: "VERIFIED" as DashboardRecord["status"],
      body: "Approves this record, makes the artisan eligible for verified surfaces, and writes a verification audit event.",
      cta: "Approve and verify",
      requiresCompleteChecks: true,
    },
    request: {
      title: "Request more information",
      status: "PENDING" as DashboardRecord["status"],
      body: "Keeps the record pending and sends the artisan a request for clearer evidence or additional documents.",
      cta: "Send request",
      requiresCompleteChecks: false,
    },
    reject: {
      title: "Reject verification",
      status: "REVIEW" as DashboardRecord["status"],
      body: "Rejects the submitted evidence with a required internal reason and user-facing guidance.",
      cta: "Reject submission",
      requiresCompleteChecks: false,
    },
    escalate: {
      title: "Escalate review",
      status: "REVIEW" as DashboardRecord["status"],
      body: "Moves this record to a senior reviewer or trust-and-safety queue for secondary review.",
      cta: "Escalate record",
      requiresCompleteChecks: false,
    },
  }[reviewDecision];

  const submitDecision = () => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setReviewHistory((current) => [
      { action: decisionCopy.title, note: decisionNote, time },
      ...current,
    ]);
    setDecisionSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-black/40 p-2 backdrop-blur-sm md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex max-h-[94vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <header
          className="shrink-0 border-b px-4 py-3 md:px-5"
          style={{ borderColor: COLORS.hairline }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    background: COLORS.primaryTint,
                    color: COLORS.primaryActive,
                  }}
                >
                  Admin review
                </span>
                <StatusPill status={status} />
              </div>
              <h2
                className="mt-2 truncate text-xl font-semibold tracking-[-0.03em] md:text-2xl"
                style={{ color: COLORS.ink }}
              >
                {title}
              </h2>
              <p
                className="mt-1 line-clamp-1 text-[13px]"
                style={{ color: COLORS.muted }}
              >
                {subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
              aria-label="Close review"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0 space-y-4">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {metrics.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[18px] border bg-white p-4"
                    style={{ borderColor: COLORS.hairline }}
                  >
                    <p className="text-[12px]" style={{ color: COLORS.muted }}>
                      {label}
                    </p>
                    <p
                      className="mt-2 text-[18px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
                <div
                  className="rounded-[18px] border bg-white p-3"
                  style={{ borderColor: COLORS.hairline }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p
                        className="text-[15px] font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        Submitted documents
                      </p>
                      <p
                        className="text-[12px]"
                        style={{ color: COLORS.muted }}
                      >
                        Open each document and complete the verification
                        checklist.
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-medium"
                      style={{
                        background: COLORS.primaryTint,
                        color: COLORS.primaryActive,
                      }}
                    >
                      {reviewDocuments.length} files
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {reviewDocuments.map((document) => (
                      <button
                        key={document.id}
                        type="button"
                        onClick={() => setActiveDocumentId(document.id)}
                        className="flex cursor-pointer items-center gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                        style={{
                          borderColor:
                            activeDocumentId === document.id
                              ? COLORS.primary
                              : COLORS.hairline,
                          background:
                            activeDocumentId === document.id
                              ? COLORS.primaryTint
                              : "#fff",
                        }}
                      >
                        <div
                          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-[12px] font-bold"
                          style={{
                            background: COLORS.primarySoft,
                            color: COLORS.primaryActive,
                          }}
                        >
                          {document.preview}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[14px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {document.name}
                          </p>
                          <p
                            className="truncate text-[12px]"
                            style={{ color: COLORS.muted }}
                          >
                            {document.type} · {document.size}
                          </p>
                        </div>
                        <span
                          className="text-[18px]"
                          style={{ color: COLORS.muted }}
                        >
                          ›
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-[18px] border bg-white p-3"
                  style={{ borderColor: COLORS.hairline }}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-[15px] font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        {activeDocument.name}
                      </p>
                      <p
                        className="text-[12px]"
                        style={{ color: COLORS.muted }}
                      >
                        {activeDocument.type} · uploaded{" "}
                        {activeDocument.uploaded}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="h-8 cursor-pointer rounded-lg border px-3 text-[12px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.ink,
                      }}
                    >
                      Open file
                    </button>
                  </div>

                  <div
                    className="grid min-h-[210px] place-items-center overflow-hidden rounded-[14px] border"
                    style={{
                      borderColor: COLORS.hairline,
                      background: "linear-gradient(135deg, #f8fafc, #ecfdf5)",
                    }}
                  >
                    <div
                      className="w-[84%] rounded-[16px] border bg-white p-4 shadow-sm"
                      style={{ borderColor: COLORS.hairline }}
                    >
                      <div
                        className="mb-5 h-8 w-20 rounded-lg"
                        style={{ background: COLORS.primarySoft }}
                      />
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded-full bg-[#e5e7eb]" />
                        <div className="h-3 w-[74%] rounded-full bg-[#e5e7eb]" />
                        <div className="h-3 w-[88%] rounded-full bg-[#e5e7eb]" />
                      </div>
                      <div className="mt-6 grid gap-2">
                        {activeDocument.fields.map(([label, value]) => (
                          <div
                            key={label}
                            className="flex justify-between gap-3 rounded-lg bg-[#f8fafc] px-3 py-2 text-[12px]"
                          >
                            <span style={{ color: COLORS.muted }}>{label}</span>
                            <span
                              className="font-medium"
                              style={{ color: COLORS.ink }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-[18px] border bg-white p-3"
                style={{ borderColor: COLORS.hairline }}
              >
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Verification checklist
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    ["legible", "Document is legible"],
                    ["nameMatch", "Name matches profile"],
                    ["dateValid", "Document is not expired"],
                    ["documentAuthentic", "Document appears authentic"],
                    ["noTampering", "No visible tampering"],
                  ].map(([id, label]) => (
                    <label
                      key={id}
                      className="flex cursor-pointer items-center gap-2 rounded-[12px] border px-3 py-2 text-[12px]"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.ink,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(documentChecks[id])}
                        onChange={(event) =>
                          setDocumentChecks((current) => ({
                            ...current,
                            [id]: event.target.checked,
                          }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <aside className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">
              <div
                className="rounded-[18px] border bg-white p-4"
                style={{ borderColor: COLORS.hairline }}
              >
                <p
                  className="text-[16px] font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Review action
                </p>
                <div className="mt-4 grid gap-2">
                  {[
                    ["approve", "Approve"],
                    ["request", "Request info"],
                    ["reject", "Reject"],
                    ["escalate", "Escalate"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setReviewDecision(value as typeof reviewDecision);
                        setDecisionSubmitted(false);
                      }}
                      className="cursor-pointer rounded-[12px] border px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{
                        borderColor:
                          reviewDecision === value
                            ? COLORS.primary
                            : COLORS.hairline,
                        background:
                          reviewDecision === value
                            ? COLORS.primaryTint
                            : "#fff",
                        color: COLORS.ink,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div
                  className="mt-4 rounded-[14px] border p-3"
                  style={{
                    borderColor: COLORS.hairline,
                    background: COLORS.canvas,
                  }}
                >
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    {decisionCopy.title}
                  </p>
                  <p
                    className="mt-1 text-[12px] leading-[1.4]"
                    style={{ color: COLORS.body }}
                  >
                    {decisionCopy.body}
                  </p>
                  <StatusPill status={decisionCopy.status} />
                </div>

                <textarea
                  value={decisionNote}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  className="mt-3 min-h-24 w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
                  style={{ borderColor: COLORS.hairline }}
                />

                <button
                  type="button"
                  onClick={submitDecision}
                  disabled={
                    !decisionNote.trim() ||
                    (decisionCopy.requiresCompleteChecks &&
                      !requiredChecksComplete)
                  }
                  className="mt-3 w-full cursor-pointer rounded-xl px-4 py-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: COLORS.primary }}
                >
                  {decisionCopy.cta}
                </button>

                {reviewDecision === "approve" && !requiredChecksComplete && (
                  <p
                    className="mt-3 rounded-[12px] border px-3 py-2 text-[12px]"
                    style={{
                      borderColor: "#fed7aa",
                      background: "#fff7ed",
                      color: "#c2410c",
                    }}
                  >
                    Complete every document check before approving verification.
                  </p>
                )}

                {decisionSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-[14px] border bg-white p-3"
                    style={{ borderColor: COLORS.primarySoft }}
                  >
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: COLORS.primaryActive }}
                    >
                      Decision staged
                    </p>
                    <p
                      className="mt-1 text-[12px] leading-[1.33]"
                      style={{ color: COLORS.body }}
                    >
                      The review action has been staged and recorded in the
                      local audit timeline.
                    </p>
                  </motion.div>
                )}
              </div>

              <div
                className="rounded-[18px] border bg-white p-4"
                style={{ borderColor: COLORS.hairline }}
              >
                <p
                  className="text-[16px] font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Audit timeline
                </p>
                <div className="mt-4 grid gap-3">
                  {reviewHistory.length === 0 ? (
                    <p
                      className="rounded-[14px] border p-3 text-[12px]"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.muted,
                      }}
                    >
                      No review action has been staged yet.
                    </p>
                  ) : (
                    reviewHistory.map((event, index) => (
                      <div
                        key={`${event.time}-${index}`}
                        className="rounded-[14px] border p-3"
                        style={{ borderColor: COLORS.hairline }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {event.action}
                          </p>
                          <span
                            className="text-[11px]"
                            style={{ color: COLORS.muted }}
                          >
                            {event.time}
                          </span>
                        </div>
                        <p
                          className="mt-1 text-[12px] leading-[1.35]"
                          style={{ color: COLORS.body }}
                        >
                          {event.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </motion.div>
    </div>
  );
}

function ConversationQuoteCard({
  quote,
  role,
  onAccept,
  onReject,
  onRequestRevision,
  onRevise,
  onStartJob,
}: {
  quote: any;
  role: "artisan" | "client";
  onAccept: () => void;
  onReject: () => void;
  onRequestRevision: () => void;
  onRevise: () => void;
  onStartJob: () => void;
}) {
  const accepted = quote.state === "accepted" || quote.state === "job_started";
  const rejected = quote.state === "rejected";
  const revisionRequested = quote.state === "revision_requested";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.99 }}
      transition={dashboardSpring}
      className="w-full max-w-[420px] rounded-[18px] border bg-white p-4 text-left"
      style={{ borderColor: COLORS.primarySoft, boxShadow: softShadow }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>
            Quote v{quote.version}
          </p>
          <p className="mt-1 text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>
            {quote.note}
          </p>
        </div>
        <StatusChip
          status={
            accepted
              ? "ACTIVE"
              : rejected
                ? "REVIEW"
                : revisionRequested
                  ? "PENDING"
                  : "QUOTED"
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <p className="text-[12px]" style={{ color: COLORS.muted }}>Total</p>
          <p className="mt-1 text-[16px] font-semibold" style={{ color: COLORS.ink }}>{formatKes(quote.amount)}</p>
        </div>
        <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <p className="text-[12px]" style={{ color: COLORS.muted }}>Deposit</p>
          <p className="mt-1 text-[16px] font-semibold" style={{ color: COLORS.ink }}>{quote.depositPercent}%</p>
        </div>
        <div className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
          <p className="text-[12px]" style={{ color: COLORS.muted }}>Duration</p>
          <p className="mt-1 text-[16px] font-semibold" style={{ color: COLORS.ink }}>{quote.duration}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {role === "client" && quote.state === "sent" && (
          <>
            <button onClick={onAccept} className="h-9 rounded-full px-3 text-[12px] font-semibold text-white" style={{ background: COLORS.primary }}>Accept quote</button>
            <button onClick={onRequestRevision} className="h-9 rounded-full border px-3 text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}>Request revision</button>
            <button onClick={onReject} className="h-9 rounded-full border px-3 text-[12px] font-semibold" style={{ borderColor: COLORS.hairlineSoft, color: "#b91c1c" }}>Reject</button>
          </>
        )}
        {role === "artisan" && revisionRequested && (
          <button onClick={onRevise} className="h-9 rounded-full px-3 text-[12px] font-semibold text-white" style={{ background: COLORS.primary }}>Revise quote</button>
        )}
        {role === "artisan" && quote.state === "accepted" && (
          <button onClick={onStartJob} className="h-9 rounded-full px-3 text-[12px] font-semibold text-white" style={{ background: COLORS.primary }}>Start job</button>
        )}
      </div>
    </motion.div>
  );
}

function DashboardMessagesPane<Job extends MessageThreadJob>({
  jobs,
  selectedJob,
  onSelectJob,
  getContactName,
  role,
  onCreateJobFromQuote,
}: {
  jobs: Job[];
  selectedJob: Job;
  onSelectJob: (job: Job) => void;
  getContactName: (job: Job) => string;
  role: "artisan" | "client";
  onCreateJobFromQuote?: (job: Job, quote: ConversationQuote) => void;
}) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<
    Array<{ name: string; type: string }>
  >([]);
  const [conversationQuotes, setConversationQuotes] = useState<
    Record<string, ConversationQuote>
  >({
    "job-001": {
      id: "quote-job-001",
      version: 1,
      state: "sent",
      amount: 4800,
      depositPercent: 30,
      duration: "1 day",
      note: "Sink repair with labour and consumables included.",
    },
    "client-job-001": {
      id: "quote-client-job-001",
      version: 1,
      state: "sent",
      amount: 12000,
      depositPercent: 30,
      duration: "2 days",
      note: "Paint work quote with wall prep, material allowance, and cleanup.",
    },
  });
  const [quoteComposerOpen, setQuoteComposerOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    jobs.findIndex((job) => job.id === selectedJob.id),
  );
  const activeQuote = conversationQuotes[selectedJob.id];

  useEffect(() => {
    setQuoteComposerOpen(false);
  }, [selectedJob.id]);

  const addAttachment = (type: "image" | "document") => {
    const next =
      type === "image"
        ? { name: `site-photo-${attachments.length + 1}.jpg`, type: "Image" }
        : { name: `job-brief-${attachments.length + 1}.pdf`, type: "Document" };
    setAttachments((current) => [...current, next]);
  };

  const removeAttachment = (name: string) => {
    setAttachments((current) => current.filter((item) => item.name !== name));
  };

  const [sentMessages, setSentMessages] = useState<
    Array<{ role: "artisan" | "client"; text: string; key: string }>
  >([]);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed && attachments.length === 0) return;
    const text = trimmed || (attachments.map((a) => a.name).join(", "));
    setSentMessages((current) => [
      ...current,
      { role: role, text, key: `msg-${Date.now()}` },
    ]);
    setDraft("");
    setAttachments([]);
  };

  const upsertQuote = (state: ConversationQuoteState, amountDelta = 0) => {
    let nextQuoteForSideEffect: ConversationQuote | null = null;
    setConversationQuotes((current) => {
      const previous = current[selectedJob.id];
      const nextVersion = previous
        ? previous.version + (state === "revised" ? 1 : 0)
        : 1;
      const nextQuote: ConversationQuote = {
        id: previous?.id ?? `quote-${selectedJob.id}`,
        version: nextVersion,
        state,
        amount: Math.max(1000, (previous?.amount ?? 4800) + amountDelta),
        depositPercent: previous?.depositPercent ?? 30,
        duration: previous?.duration ?? "1 day",
        note:
          state === "revised"
            ? "Updated quote after client revision request."
            : state === "job_started"
              ? "Accepted quote converted into an active job record."
              : "Quote generated from this conversation and attached to the thread.",
      };
      nextQuoteForSideEffect = nextQuote;
      return { ...current, [selectedJob.id]: nextQuote };
    });

    if (state === "job_started" && nextQuoteForSideEffect) {
      onCreateJobFromQuote?.(selectedJob, nextQuoteForSideEffect);
    }
  };

  const quoteStatusPill = activeQuote
    ? activeQuote.state === "accepted" || activeQuote.state === "job_started"
      ? "Quote accepted"
      : activeQuote.state === "revision_requested"
        ? "Revision requested"
        : activeQuote.state === "rejected"
          ? "Quote rejected"
          : "Quote attached"
    : "No quote yet";

  return (
    <div className="grid h-full min-h-0 border-0 lg:grid-cols-[336px_1fr]">
      <div
        className="min-h-0 overflow-auto border-b lg:border-b-0 lg:border-r"
        style={{ borderColor: COLORS.hairlineSoft }}
      >
        <div
          className="sticky top-0 z-10 border-b bg-white p-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                Messages
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                {jobs.length} active conversations
              </p>
            </div>
            <span
              className="grid h-7 min-w-7 place-items-center rounded-full px-2 text-[12px] font-semibold text-white"
              style={{ background: COLORS.primary }}
            >
              1 new
            </span>
          </div>
        </div>
        {jobs.map((job, index) => {
          const isSelected = selectedJob.id === job.id;
          const hasNewMessage = index === 0;
          const contactName = getContactName(job);
          const threadQuote = conversationQuotes[job.id];
          const latestMessage =
            threadQuote?.state === "revision_requested"
              ? "Revision requested on quote."
              : threadQuote?.state === "accepted"
                ? "Quote accepted. Ready to start."
                : hasNewMessage
                  ? role === "artisan"
                    ? "Can you come tomorrow?"
                    : "I can start tomorrow afternoon."
                  : index === 1
                    ? "Thanks, received."
                    : "Quote details confirmed.";

          return (
            <button
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="group relative flex w-full cursor-pointer items-start gap-3 border-b p-4 text-left transition-colors hover:bg-[#f7f7f7]"
              style={{
                borderColor: COLORS.hairlineSoft,
                background: isSelected
                  ? COLORS.primaryTint
                  : hasNewMessage
                    ? "#fffbeb"
                    : COLORS.canvas,
              }}
            >
              {hasNewMessage && (
                <span
                  className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full"
                  style={{ background: COLORS.primary }}
                />
              )}
              <span
                className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{
                  background: isSelected ? COLORS.canvas : COLORS.primaryTint,
                  color: COLORS.primary,
                }}
              >
                {contactName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
                {hasNewMessage && (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white"
                    style={{ background: COLORS.primary }}
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span
                    className="truncate text-[14px] font-semibold leading-[1.29]"
                    style={{ color: COLORS.ink }}
                  >
                    {contactName}
                  </span>
                  <span
                    className="shrink-0 text-[12px] leading-[1.33]"
                    style={{
                      color: hasNewMessage
                        ? COLORS.primaryActive
                        : COLORS.mutedSoft,
                    }}
                  >
                    {hasNewMessage ? "New" : `${index + 1}h`}
                  </span>
                </span>
                <span
                  className="mt-1 block truncate text-[13px] leading-[1.23]"
                  style={{ color: hasNewMessage ? COLORS.ink : COLORS.muted }}
                >
                  {latestMessage}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusChip status={job.status} />
                  {threadQuote && (
                    <span
                      className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        borderColor: COLORS.primarySoft,
                        background: COLORS.primaryTint,
                        color: COLORS.primaryActive,
                      }}
                    >
                      Quote v{threadQuote.version}
                    </span>
                  )}
                  <span
                    className="truncate text-[12px] leading-[1.33]"
                    style={{ color: COLORS.muted }}
                  >
                    {job.title}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex h-full min-h-0 flex-col">
        <div
          className="border-b p-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                {getContactName(selectedJob)}
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                {selectedJob.title}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status={selectedJob.status} />
              <span
                className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  borderColor: COLORS.primarySoft,
                  background: COLORS.primaryTint,
                  color: COLORS.primaryActive,
                }}
              >
                {quoteStatusPill}
              </span>
              {role === "artisan" && (
                <button
                  onClick={() => setQuoteComposerOpen((value) => !value)}
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  <ReceiptText size={15} />{" "}
                  {activeQuote ? "Manage quote" : "Generate quote"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          <div
            className="max-w-[78%] rounded-[18px] bg-[#f7f7f7] p-3 text-[14px] leading-[1.43]"
            style={{ color: COLORS.body }}
          >
            Hi, I need help with: {selectedJob.title.toLowerCase()}.
          </div>
          <div
            className="ml-auto max-w-[78%] rounded-[18px] p-3 text-[14px] leading-[1.43] text-white"
            style={{ background: COLORS.primary }}
          >
            Thanks. I can review and send a quote with materials included.
          </div>
          <div
            className="max-w-[78%] rounded-[18px] bg-[#f7f7f7] p-3 text-[14px] leading-[1.43]"
            style={{ color: COLORS.body }}
          >
            {selectedIndex === 0
              ? role === "artisan"
                ? "Can you come tomorrow? I attached the sink photo below."
                : "I can start tomorrow afternoon. I attached the scope note below."
              : "Great. What is the earliest available slot?"}
            {selectedIndex === 0 && (
              <span
                className="mt-3 flex w-fit items-center gap-2 rounded-[12px] border bg-white px-3 py-2 text-[13px]"
                style={{ borderColor: COLORS.hairlineSoft, color: COLORS.ink }}
              >
                <Paperclip size={14} style={{ color: COLORS.primary }} />
                {role === "artisan"
                  ? "sink-leak-photo.jpg"
                  : "project-scope.pdf"}
              </span>
            )}
          </div>

          <AnimatePresence initial={false}>
            {quoteComposerOpen && role === "artisan" && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={dashboardSpring}
                className="ml-auto max-w-[86%] rounded-[18px] border bg-white p-4"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  boxShadow: softShadow,
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {activeQuote?.state === "revision_requested"
                        ? "Revise quote in conversation"
                        : "Generate quote in conversation"}
                    </p>
                    <p
                      className="mt-1 text-[13px] leading-[1.23]"
                      style={{ color: COLORS.muted }}
                    >
                      This quote stays attached to this conversation and can
                      create the job once accepted.
                    </p>
                  </div>
                  <button
                    onClick={() => setQuoteComposerOpen(false)}
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div
                    className="rounded-[14px] border p-3"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      background: COLORS.surfaceSoft,
                    }}
                  >
                    <p className="text-[12px]" style={{ color: COLORS.muted }}>
                      Suggested total
                    </p>
                    <p
                      className="mt-1 text-[16px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {formatKes(
                        (activeQuote?.amount ?? 4800) +
                          (activeQuote?.state === "revision_requested"
                            ? -350
                            : 0),
                      )}
                    </p>
                  </div>
                  <div
                    className="rounded-[14px] border p-3"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      background: COLORS.surfaceSoft,
                    }}
                  >
                    <p className="text-[12px]" style={{ color: COLORS.muted }}>
                      Deposit
                    </p>
                    <p
                      className="mt-1 text-[16px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      30%
                    </p>
                  </div>
                  <div
                    className="rounded-[14px] border p-3"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      background: COLORS.surfaceSoft,
                    }}
                  >
                    <p className="text-[12px]" style={{ color: COLORS.muted }}>
                      Duration
                    </p>
                    <p
                      className="mt-1 text-[16px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      1 day
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    upsertQuote(
                      activeQuote?.state === "revision_requested"
                        ? "revised"
                        : "sent",
                      activeQuote?.state === "revision_requested" ? -350 : 0,
                    );
                    setQuoteComposerOpen(false);
                  }}
                  className="mt-4 h-11 w-full cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  {activeQuote?.state === "revision_requested"
                    ? "Resend revised quote"
                    : "Attach and send quote"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {activeQuote && (
              <div
                className={
                  role === "artisan"
                    ? "ml-auto flex justify-end"
                    : "flex justify-start"
                }
              >
                <ConversationQuoteCard
                  quote={activeQuote}
                  role={role}
                  onAccept={() => upsertQuote("accepted")}
                  onReject={() => upsertQuote("rejected")}
                  onRequestRevision={() => upsertQuote("revision_requested")}
                  onRevise={() => setQuoteComposerOpen(true)}
                  onStartJob={() => upsertQuote("job_started")}
                />
              </div>
            )}
          </AnimatePresence>

          {activeQuote?.state === "accepted" && role === "client" && (
            <div
              className="max-w-[78%] rounded-[18px] bg-[#f7f7f7] p-3 text-[14px] leading-[1.43]"
              style={{ color: COLORS.body }}
            >
              Quote accepted. The artisan can now start the job from this
              thread.
            </div>
          )}
          {activeQuote?.state === "job_started" && (
            <div
              className="mx-auto w-fit rounded-full border px-3 py-1.5 text-[12px] font-semibold"
              style={{
                borderColor: COLORS.primarySoft,
                background: COLORS.primaryTint,
                color: COLORS.primaryActive,
              }}
            >
              Job record created from accepted quote
            </div>
          )}
          {sentMessages.map((msg) => (
            <div
              key={msg.key}
              className={
                msg.role === role
                  ? "ml-auto max-w-[78%]"
                  : "max-w-[78%]"
              }
            >
              <div
                className={
                  msg.role === role
                    ? "rounded-[18px] p-3 text-[14px] leading-[1.43] text-white"
                    : "rounded-[18px] bg-[#f7f7f7] p-3 text-[14px] leading-[1.43]"
                }
                style={
                  msg.role === role
                    ? { background: COLORS.primary }
                    : { color: COLORS.body }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div
          className="border-t p-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <button
                  key={attachment.name}
                  onClick={() => removeAttachment(attachment.name)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  <Paperclip size={13} style={{ color: COLORS.primary }} />
                  {attachment.name}
                  <X size={13} style={{ color: COLORS.muted }} />
                </button>
              ))}
            </div>
          )}
          <div
            className="flex items-end gap-2 rounded-[24px] border bg-white p-2"
            style={{ borderColor: COLORS.hairline, boxShadow: softShadow }}
          >
            <div className="flex gap-1">
              <button
                onClick={() => addAttachment("document")}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                aria-label="Attach file"
              >
                <Paperclip size={17} style={{ color: COLORS.body }} />
              </button>
              <button
                onClick={() => addAttachment("image")}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                aria-label="Attach image"
              >
                <ImagePlus size={17} style={{ color: COLORS.body }} />
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a message..."
              rows={1}
              className="max-h-24 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[14px] leading-[1.43] outline-none placeholder:text-[#929292]"
            />
            <button
              onClick={sendMessage}
              className="grid h-10 min-w-10 cursor-pointer place-items-center rounded-full px-3 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
              style={{ background: COLORS.primary }}
            >
              <Send size={16} />
            </button>
          </div>
          <p
            className="mt-2 text-[12px] leading-[1.33]"
            style={{ color: COLORS.muted }}
          >
            Quotes, files, decisions, and job start events stay attached to this
            conversation.
          </p>
        </div>
      </div>
    </div>
  );
}

type DashboardListFilter<Row> = {
  id: string;
  label: string;
  allLabel: string;
  options: string[];
  getValue: (row: Row) => string;
};

type DashboardListSort<Row> = {
  id: string;
  label: string;
  sort: (a: Row, b: Row) => number;
};

type DashboardListColumn<Row> = {
  header: string;
  className?: string;
  render: (row: Row) => React.ReactNode;
};

function DashboardFilterPopover<Row>({
  filter,
  selectedValues,
  onToggle,
  onClear,
}: {
  filter: DashboardListFilter<Row>;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    return () =>
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-full border bg-white px-3.5 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
        style={{
          borderColor: selectedValues.length ? COLORS.ink : COLORS.hairline,
          color: COLORS.ink,
          boxShadow: selectedValues.length ? softShadow : "none",
        }}
      >
        <ListFilter
          size={15}
          style={{
            color: selectedValues.length ? COLORS.primary : COLORS.muted,
          }}
        />
        {filter.label}
        {selectedValues.length > 0 && (
          <span
            className="grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold text-white"
            style={{ background: COLORS.primary }}
          >
            {selectedValues.length}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.96,
              transformOrigin: "top left",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 32,
              mass: 0.62,
            }}
            className="absolute left-0 top-[calc(100%+8px)] z-40 w-[240px] rounded-[18px] border bg-white p-2"
            style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
          >
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <p
                className="text-[13px] font-semibold leading-[1.23]"
                style={{ color: COLORS.ink }}
              >
                {filter.label}
              </p>
              <button
                onClick={onClear}
                className="cursor-pointer text-[12px] font-medium underline-offset-4 hover:underline"
                style={{ color: COLORS.muted }}
              >
                Clear
              </button>
            </div>
            <div className="grid gap-1">
              {filter.options.map((option) => {
                const checked = selectedValues.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => onToggle(option)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-[#f7f7f7]"
                  >
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded border"
                      style={{
                        borderColor: checked ? COLORS.primary : COLORS.hairline,
                        background: checked ? COLORS.primary : COLORS.canvas,
                      }}
                    >
                      {checked && (
                        <CheckCircle2 size={13} className="text-white" />
                      )}
                    </span>
                    <span
                      className="text-[14px] leading-[1.43]"
                      style={{ color: COLORS.ink }}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardDataList<Row>({
  title,
  subtitle,
  rows,
  columns,
  rowKey,
  getSearchText,
  filters,
  sortOptions,
  onRowClick,
  onView,
  viewLabel = "View",
  pageSize = 5,
}: {
  title?: string;
  subtitle?: string;
  rows: Row[];
  columns: Array<DashboardListColumn<Row>>;
  rowKey: (row: Row) => string;
  getSearchText: (row: Row) => string;
  filters?: Array<DashboardListFilter<Row>>;
  sortOptions?: Array<DashboardListSort<Row>>;
  onRowClick: (row: Row) => void;
  onView: (row: Row) => void;
  viewLabel?: string;
  pageSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>(
    () => Object.fromEntries((filters ?? []).map((filter) => [filter.id, []])),
  );
  const [sortId, setSortId] = useState(sortOptions?.[0]?.id ?? "");

  const activeSort = sortOptions?.find((option) => option.id === sortId);
  const activeFilterChips = (filters ?? []).flatMap((filter) =>
    (filterValues[filter.id] ?? []).map((value) => ({ filter, value })),
  );

  const toggleFilterValue = (filterId: string, value: string) => {
    setFilterValues((current) => {
      const selected = current[filterId] ?? [];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      return { ...current, [filterId]: next };
    });
  };

  const removeFilterValue = (filterId: string, value: string) => {
    setFilterValues((current) => ({
      ...current,
      [filterId]: (current[filterId] ?? []).filter((item) => item !== value),
    }));
  };

  const clearFilter = (filterId: string) => {
    setFilterValues((current) => ({ ...current, [filterId]: [] }));
  };

  const clearAllFilters = () => {
    setQuery("");
    setFilterValues(
      Object.fromEntries((filters ?? []).map((filter) => [filter.id, []])),
    );
  };

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const nextRows = rows.filter((row) => {
      const matchesSearch =
        !normalized || getSearchText(row).toLowerCase().includes(normalized);
      const matchesFilters = (filters ?? []).every((filter) => {
        const selected = filterValues[filter.id] ?? [];
        return selected.length === 0 || selected.includes(filter.getValue(row));
      });
      return matchesSearch && matchesFilters;
    });
    return activeSort ? [...nextRows].sort(activeSort.sort) : nextRows;
  }, [activeSort, filterValues, filters, getSearchText, query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [query, filterValues, sortId]);

  return (
    <div
      className="overflow-hidden rounded-[18px] border bg-white"
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: COLORS.hairlineSoft, background: COLORS.canvas }}
      >
        {(title || subtitle) && (
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {title && (
                <p
                  className="text-[16px] font-semibold leading-[1.25]"
                  style={{ color: COLORS.ink }}
                >
                  {title}
                </p>
              )}
              {subtitle && (
                <p
                  className="mt-1 text-[13px] leading-[1.23]"
                  style={{ color: COLORS.muted }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <p
              className="text-[13px] leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              {filteredRows.length} result{filteredRows.length === 1 ? "" : "s"}
            </p>
          </div>
        )}
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label
            className="flex h-11 items-center gap-2 rounded-full border px-4"
            style={{ borderColor: COLORS.hairline }}
          >
            <Search size={16} style={{ color: COLORS.muted }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search list"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#929292]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(filters ?? []).map((filter) => (
              <DashboardFilterPopover
                key={filter.id}
                filter={filter}
                selectedValues={filterValues[filter.id] ?? []}
                onToggle={(value) => toggleFilterValue(filter.id, value)}
                onClear={() => clearFilter(filter.id)}
              />
            ))}
          </div>
          {sortOptions && sortOptions.length > 0 && (
            <select
              value={sortId}
              onChange={(event) => setSortId(event.target.value)}
              className="h-11 cursor-pointer rounded-full border bg-white px-3 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
        {(query || activeFilterChips.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {query && (
              <FilterChip
                label={`Search: ${query}`}
                onRemove={() => setQuery("")}
              />
            )}
            {activeFilterChips.map(({ filter, value }) => (
              <FilterChip
                key={`${filter.id}-${value}`}
                label={`${filter.label}: ${value}`}
                onRemove={() => removeFilterValue(filter.id, value)}
              />
            ))}
            <button
              onClick={clearAllFilters}
              className="cursor-pointer text-[13px] font-medium underline-offset-4 hover:underline"
              style={{ color: COLORS.ink }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      <div className="overflow-hidden">
        <div
          className="hidden border-b px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.04em] md:grid"
          style={{
            borderColor: COLORS.hairlineSoft,
            color: COLORS.muted,
            background: COLORS.surfaceSoft,
            gridTemplateColumns: `minmax(220px, 1.35fr) repeat(${Math.max(0, columns.length - 1)}, minmax(0, 0.9fr)) 112px`,
          }}
        >
          {columns.map((column) => (
            <span key={column.header} className={column.className}>
              {column.header}
            </span>
          ))}
          <span className="text-right">Action</span>
        </div>
        {visibleRows.map((row, index) => (
          <div
            key={rowKey(row)}
            className="grid gap-3 border-b px-4 py-4 text-[14px] last:border-b-0 transition-colors hover:bg-[#f7f7f7] md:grid md:px-6"
            style={{
              borderColor: COLORS.hairlineSoft,
              background: index % 2 === 1 ? COLORS.surfaceSoft : COLORS.canvas,
              gridTemplateColumns: `minmax(220px, 1.35fr) repeat(${Math.max(0, columns.length - 1)}, minmax(0, 0.9fr)) 112px`,
            }}
          >
            {columns.map((column, columnIndex) => (
              <button
                key={column.header}
                onClick={() => onRowClick(row)}
                className={`grid min-w-0 cursor-pointer gap-1 rounded-[12px] px-2 py-1.5 text-left transition-colors hover:bg-white/70 md:block md:rounded-none md:px-1 md:py-0 ${column.className ?? ""}`}
              >
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.04em] md:hidden"
                  style={{ color: COLORS.muted }}
                >
                  {column.header}
                </span>
                <span
                  className={columnIndex === 0 ? "min-w-0" : "min-w-0 md:block"}
                >
                  {column.render(row)}
                </span>
              </button>
            ))}
            <div className="flex justify-start pl-0 md:justify-end md:pl-3">
              <button
                onClick={() => onView(row)}
                className="h-9 cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
              >
                {viewLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div
        className="flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between"
        style={{ borderColor: COLORS.hairlineSoft }}
      >
        <p
          className="text-[13px] leading-[1.23]"
          style={{ color: COLORS.muted }}
        >
          Page {page} of {totalPages} · Showing {visibleRows.length} of{" "}
          {filteredRows.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioProjectModal({
  project,
  onClose,
  onPreviewCustomer,
  onSave,
  initialMode = "detail",
  isNew = false,
}: {
  project: ArtisanPortfolioProject;
  onClose: () => void;
  onPreviewCustomer: () => void;
  onSave: (project: ArtisanPortfolioProject, isNew: boolean) => void;
  initialMode?: "detail" | "edit";
  isNew?: boolean;
}) {
  const [mode, setMode] = useState<"detail" | "edit">(initialMode);
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleSave = () => {
    const form = formRef.current;
    const value = (name: string, fallback: string) =>
      (
        form?.querySelector(`[name="${name}"]`) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement
          | null
      )?.value?.trim() || fallback;
    const savedProject: ArtisanPortfolioProject = {
      ...project,
      id: isNew ? `portfolio-${Date.now()}` : project.id,
      title: value("title", project.title),
      category: value("category", project.category),
      status: value(
        "status",
        project.status,
      ) as ArtisanPortfolioProject["status"],
      description: value("description", project.description),
      duration: value("duration", project.duration || "1 day"),
      cost: value("cost", project.cost || "KES 0"),
      location: value("location", project.location || "Nairobi"),
      tags: project.tags.length
        ? project.tags
        : [value("category", project.category)],
    };
    onSave(savedProject, isNew);
  };

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, project.id]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close portfolio project"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.975 }}
        transition={dashboardSpring}
        className="relative grid max-h-[90vh] w-full max-w-[980px] overflow-hidden rounded-[28px] border bg-white lg:grid-cols-[0.98fr_1.02fr]"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div
          className="relative min-h-[320px]"
          style={{ background: project.gradient }}
        >
          <div
            className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-semibold"
            style={{ color: COLORS.ink }}
          >
            {project.status}
          </div>
          {project.featured && (
            <div
              className="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
              style={{ background: COLORS.primary }}
            >
              Featured
            </div>
          )}
          <div className="absolute inset-0 grid place-items-center">
            <Images
              size={70}
              className="opacity-80"
              style={{ color: COLORS.primary }}
            />
          </div>
        </div>
        <div className="min-h-0 overflow-auto p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p
                className="text-[13px] font-medium leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                {isNew ? "New portfolio project" : "Portfolio project"}
              </p>
              <h3
                className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                style={{ color: COLORS.ink }}
              >
                {isNew ? "Create portfolio item" : project.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
              aria-label="Close portfolio project"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-5 flex gap-2">
            <FluidPillTabs
              id={`portfolio-modal-${project.id}`}
              value={mode}
              onChange={setMode}
              options={
                isNew
                  ? [{ id: "edit", label: "Create", icon: Images }]
                  : [
                      { id: "detail", label: "Detail", icon: Eye },
                      { id: "edit", label: "Edit", icon: Settings },
                    ]
              }
            />
          </div>

          {mode === "detail" ? (
            <div className="grid gap-4">
              <p
                className="text-[14px] leading-[1.43]"
                style={{ color: COLORS.body }}
              >
                {project.description}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Category", project.category],
                  ["Duration", project.duration],
                  ["Cost", project.cost],
                  ["Location", project.location],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[14px] border p-3"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      background: COLORS.surfaceSoft,
                    }}
                  >
                    <p
                      className="text-[13px] leading-[1.23]"
                      style={{ color: COLORS.muted }}
                    >
                      {label}
                    </p>
                    <p
                      className="mt-1 text-[15px] font-semibold leading-[1.25]"
                      style={{ color: COLORS.ink }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-2.5 py-1 text-[13px]"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      background: COLORS.surfaceSoft,
                      color: COLORS.body,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => setMode("edit")}
                  className="h-11 cursor-pointer rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  Edit project
                </button>
                <button
                  onClick={onPreviewCustomer}
                  className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  Preview customer side
                </button>
              </div>
            </div>
          ) : (
            <div ref={formRef} className="grid gap-3">
              <label className="grid gap-1.5">
                <span
                  className="text-[14px] font-medium"
                  style={{ color: COLORS.ink }}
                >
                  Project title
                </span>
                <input
                  name="title"
                  defaultValue={project.title}
                  className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                  style={{ borderColor: COLORS.hairline }}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Category
                  </span>
                  <input
                    name="category"
                    defaultValue={project.category}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Visibility
                  </span>
                  <select
                    name="status"
                    defaultValue={project.status}
                    className="h-12 rounded-lg border bg-white px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  >
                    <option>Published</option>
                    <option>Draft</option>
                    <option>Hidden</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-1.5">
                <span
                  className="text-[14px] font-medium"
                  style={{ color: COLORS.ink }}
                >
                  Description
                </span>
                <textarea
                  name="description"
                  defaultValue={project.description}
                  className="min-h-28 rounded-lg border px-3 py-2 text-[14px] outline-none"
                  style={{ borderColor: COLORS.hairline }}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Duration
                  </span>
                  <input
                    name="duration"
                    defaultValue={project.duration}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Cost
                  </span>
                  <input
                    name="cost"
                    defaultValue={project.cost}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Location
                  </span>
                  <input
                    name="location"
                    defaultValue={project.location}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
              </div>
              <div
                className="rounded-[14px] border p-4"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  background: COLORS.surfaceSoft,
                }}
              >
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Media update
                </p>
                <p
                  className="mt-1 text-[13px] leading-[1.23]"
                  style={{ color: COLORS.muted }}
                >
                  Photo upload, reorder, cover-image selection, and remove
                  actions would live here.
                </p>
              </div>
              <div
                className="flex justify-end gap-2 border-t pt-4"
                style={{ borderColor: COLORS.hairlineSoft }}
              >
                <button
                  onClick={() => setMode("detail")}
                  className="h-11 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  {isNew ? "Create project" : "Update project"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CustomerPortfolioPreviewModal({
  project,
  onClose,
}: {
  project: ArtisanPortfolioProject;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close customer preview"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.975 }}
        transition={dashboardSpring}
        className="relative w-full max-w-[900px] overflow-hidden rounded-[28px] border bg-white"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div className="grid md:grid-cols-[1.12fr_0.88fr]">
          <div
            className="min-h-[360px]"
            style={{ background: project.gradient }}
          />
          <div className="p-5 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-[13px] font-medium leading-[1.23]"
                  style={{ color: COLORS.muted }}
                >
                  Customer view
                </p>
                <h3
                  className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                  style={{ color: COLORS.ink }}
                >
                  {project.title}
                </h3>
                <p
                  className="mt-2 text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  Grace Wanjiku · Carpenter · Kiambu
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                aria-label="Close customer preview"
              >
                <X size={18} />
              </button>
            </div>
            <p
              className="text-[14px] leading-[1.43]"
              style={{ color: COLORS.body }}
            >
              {project.description}
            </p>
            <div className="my-5 grid grid-cols-3 gap-3">
              {[
                ["Duration", project.duration],
                ["Cost", project.cost],
                ["Area", project.location.split(",")[0]],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[14px] border p-3"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p className="text-[13px]" style={{ color: COLORS.muted }}>
                    {label}
                  </p>
                  <p
                    className="mt-1 text-[14px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mb-5 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-2.5 py-1 text-[13px]"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                    color: COLORS.body,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-[16px] font-medium text-white"
              style={{ background: COLORS.primary }}
            >
              <MessageCircle size={18} /> Message artisan
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddSkillModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close add skill"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.975 }}
        transition={dashboardSpring}
        className="relative w-full max-w-[560px] rounded-[24px] border bg-white p-5 md:p-6"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[13px] font-medium leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              Specialization
            </p>
            <h3
              className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
              style={{ color: COLORS.ink }}
            >
              Add artisan skill
            </h3>
            <p
              className="mt-2 text-[14px] leading-[1.43]"
              style={{ color: COLORS.muted }}
            >
              Add a searchable skill tag with category, proficiency, and
              experience.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
            aria-label="Close add skill"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span
              className="text-[14px] font-medium"
              style={{ color: COLORS.ink }}
            >
              Skill name
            </span>
            <input
              defaultValue="Waterproofing"
              className="h-12 rounded-lg border px-3 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline }}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span
                className="text-[14px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Category
              </span>
              <select
                defaultValue="Plumbing"
                className="h-12 rounded-lg border bg-white px-3 text-[14px] outline-none"
                style={{ borderColor: COLORS.hairline }}
              >
                <option>Plumbing</option>
                <option>Carpentry</option>
                <option>Electrical</option>
                <option>Painting</option>
                <option>Masonry</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span
                className="text-[14px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Proficiency
              </span>
              <select
                defaultValue="Level 4"
                className="h-12 rounded-lg border bg-white px-3 text-[14px] outline-none"
                style={{ borderColor: COLORS.hairline }}
              >
                <option>Level 3</option>
                <option>Level 4</option>
                <option>Level 5</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span
                className="text-[14px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Years of experience
              </span>
              <input
                defaultValue="3"
                className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                style={{ borderColor: COLORS.hairline }}
              />
            </label>
            <label className="grid gap-1.5">
              <span
                className="text-[14px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Visibility
              </span>
              <select
                defaultValue="Public"
                className="h-12 rounded-lg border bg-white px-3 text-[14px] outline-none"
                style={{ borderColor: COLORS.hairline }}
              >
                <option>Public</option>
                <option>Private draft</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1.5">
            <span
              className="text-[14px] font-medium"
              style={{ color: COLORS.ink }}
            >
              Evidence note
            </span>
            <textarea
              defaultValue="Add context such as project examples, certificates, or client work that supports this skill."
              className="min-h-24 rounded-lg border px-3 py-2 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline }}
            />
          </label>
        </div>
        <div
          className="mt-5 flex justify-end gap-2 border-t pt-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <button
            onClick={onClose}
            className="h-11 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Add skill
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UpdatePaymentMethodModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close payment method"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.975 }}
        transition={dashboardSpring}
        className="relative w-full max-w-[560px] rounded-[24px] border bg-white p-5 md:p-6"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[13px] font-medium leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              Subscription billing
            </p>
            <h3
              className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
              style={{ color: COLORS.ink }}
            >
              Update payment method
            </h3>
            <p
              className="mt-2 text-[14px] leading-[1.43]"
              style={{ color: COLORS.muted }}
            >
              Subscription payments use M-Pesa. Job payments remain cash-only in
              testing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
            aria-label="Close payment method"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-3">
          <div
            className="rounded-[14px] border p-4"
            style={{
              borderColor: COLORS.primarySoft,
              background: COLORS.primaryTint,
            }}
          >
            <p
              className="text-[14px] font-semibold"
              style={{ color: COLORS.primaryActive }}
            >
              Current billing method
            </p>
            <p
              className="mt-1 text-[14px] leading-[1.43]"
              style={{ color: COLORS.body }}
            >
              M-Pesa · +254 7•• ••• 243 · Premium Artisan renews Jun 01.
            </p>
          </div>
          <label className="grid gap-1.5">
            <span
              className="text-[14px] font-medium"
              style={{ color: COLORS.ink }}
            >
              M-Pesa phone number
            </span>
            <input
              defaultValue="+254 712 345 243"
              className="h-12 rounded-lg border px-3 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline }}
            />
          </label>
          <label className="grid gap-1.5">
            <span
              className="text-[14px] font-medium"
              style={{ color: COLORS.ink }}
            >
              Billing contact name
            </span>
            <input
              defaultValue="Grace Wanjiku"
              className="h-12 rounded-lg border px-3 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline }}
            />
          </label>
          <div
            className="rounded-[14px] border p-4"
            style={{
              borderColor: COLORS.hairlineSoft,
              background: COLORS.surfaceSoft,
            }}
          >
            <p
              className="text-[14px] font-semibold"
              style={{ color: COLORS.ink }}
            >
              STK push preview
            </p>
            <p
              className="mt-1 text-[13px] leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              Saving this method would trigger verification for subscription
              billing only.
            </p>
          </div>
        </div>
        <div
          className="mt-5 flex justify-end gap-2 border-t pt-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <button
            onClick={onClose}
            className="h-11 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Save payment method
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddArtisanJobModal({
  jobs,
  onClose,
  onCreate,
}: {
  jobs: ArtisanJob[];
  onClose: () => void;
  onCreate: (job: ArtisanJob) => void;
}) {
  const [clientMode, setClientMode] = useState<"existing" | "invite">(
    "existing",
  );
  const [clientName, setClientName] = useState("Jane Njeri");
  const [clientEmail, setClientEmail] = useState("jane.client@example.com");
  const [title, setTitle] = useState("Standalone cabinet repair");
  const [location, setLocation] = useState("Lavington, Nairobi");
  const [budget, setBudget] = useState("KES 9,500");
  const [quote, setQuote] = useState("Draft quote");
  const [relatedJobId, setRelatedJobId] = useState("none");
  const [relatedQuote, setRelatedQuote] = useState("none");
  const [description, setDescription] = useState(
    "Created outside an existing conversation. The artisan can attach related context, invite the client, and open the new job record immediately.",
  );

  const relatedJob = jobs.find((job) => job.id === relatedJobId);
  const hasInvite = clientMode === "invite";

  const handleCreate = () => {
    const nextJob: ArtisanJob = {
      id: `job-manual-${Date.now()}`,
      title: title.trim() || "New standalone job",
      client: clientName.trim() || "Invited client",
      status: "PENDING",
      budget: budget.trim() || "Not set",
      quote: quote.trim() || "Not sent",
      location: location.trim() || "Location pending",
      description: `${description.trim() || "Standalone job created by artisan."}${hasInvite ? ` Client invite prepared for ${clientEmail}.` : ""}${relatedJob ? ` Related job context: ${relatedJob.title}.` : ""}${relatedQuote !== "none" ? ` Related quote: ${relatedQuote}.` : ""}`,
    };
    onCreate(nextJob);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/35 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close add job"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.975 }}
        transition={dashboardSpring}
        className="relative max-h-[92vh] w-full max-w-[820px] overflow-auto rounded-[28px] border bg-white p-5 md:p-6"
        style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[13px] font-medium leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              Standalone job creation
            </p>
            <h3
              className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
              style={{ color: COLORS.ink }}
            >
              Add job outside a conversation
            </h3>
            <p
              className="mt-2 max-w-[620px] text-[14px] leading-[1.43]"
              style={{ color: COLORS.muted }}
            >
              Create a job manually, attach related jobs or quotes, and invite
              the client if they are not on ChapaWorks yet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
            aria-label="Close add job"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-4">
            <div
              className="rounded-[18px] border p-4"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Client
                  </p>
                  <p
                    className="mt-1 text-[13px] leading-[1.23]"
                    style={{ color: COLORS.muted }}
                  >
                    Use an existing client or invite a new one.
                  </p>
                </div>
                <FluidPillTabs
                  id="add-job-client-mode"
                  value={clientMode}
                  onChange={setClientMode}
                  options={[
                    { id: "existing", label: "Existing", icon: UserRound },
                    { id: "invite", label: "Invite", icon: UserPlus },
                  ]}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    {hasInvite ? "Client name" : "Client"}
                  </span>
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                {hasInvite ? (
                  <label className="grid gap-1.5">
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: COLORS.ink }}
                    >
                      Invite email
                    </span>
                    <input
                      value={clientEmail}
                      onChange={(event) => setClientEmail(event.target.value)}
                      className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                      style={{ borderColor: COLORS.hairline }}
                    />
                  </label>
                ) : (
                  <label className="grid gap-1.5">
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: COLORS.ink }}
                    >
                      Existing contact
                    </span>
                    <select
                      value={clientName}
                      onChange={(event) => setClientName(event.target.value)}
                      className="h-12 rounded-lg border bg-white px-3 text-[14px] outline-none"
                      style={{ borderColor: COLORS.hairline }}
                    >
                      <option>Miriam Otieno</option>
                      <option>David Mwangi</option>
                      <option>Sarah Wanjiku</option>
                      <option>Jane Njeri</option>
                    </select>
                  </label>
                )}
              </div>
            </div>

            <div
              className="rounded-[18px] border p-4"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{ color: COLORS.ink }}
              >
                Job details
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="grid gap-1.5 md:col-span-2">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Job title
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Location
                  </span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Budget
                  </span>
                  <input
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="h-12 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                <label className="grid gap-1.5 md:col-span-2">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Description
                  </span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-24 rounded-lg border px-3 py-2 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
              </div>
            </div>

            <div
              className="rounded-[18px] border p-4"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{ color: COLORS.ink }}
              >
                Related context
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                Attach an existing job or quote to preserve context while still
                creating a separate job record.
              </p>
              <div className="mt-4 grid min-w-0 gap-3 xl:grid-cols-2">
                <label className="grid min-w-0 gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Related job
                  </span>
                  <select
                    value={relatedJobId}
                    onChange={(event) => setRelatedJobId(event.target.value)}
                    className="h-12 min-w-0 max-w-full rounded-lg border bg-white px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  >
                    <option value="none">No related job</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Related quote
                  </span>
                  <select
                    value={relatedQuote}
                    onChange={(event) => setRelatedQuote(event.target.value)}
                    className="h-12 min-w-0 max-w-full rounded-lg border bg-white px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  >
                    <option value="none">No related quote</option>
                    {jobs
                      .filter((job) => job.quote !== "Not sent")
                      .map((job) => (
                        <option
                          key={`quote-${job.id}`}
                          value={`${job.title} · ${job.quote}`}
                        >
                          {job.title} · {job.quote}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1.5 xl:col-span-2">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Initial quote state
                  </span>
                  <select
                    value={quote}
                    onChange={(event) => setQuote(event.target.value)}
                    className="h-12 min-w-0 max-w-full rounded-lg border bg-white px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  >
                    <option>Draft quote</option>
                    <option>Not sent</option>
                    <option>KES 7,500</option>
                    <option>KES 12,000</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div
              className="rounded-[18px] border p-4"
              style={{
                borderColor: COLORS.primarySoft,
                background: COLORS.primaryTint,
              }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{ color: COLORS.primaryActive }}
              >
                Creation outcome
              </p>
              <div
                className="mt-3 grid gap-2 text-[13px] leading-[1.23]"
                style={{ color: COLORS.body }}
              >
                <p className="flex gap-2">
                  <CheckCircle2 size={15} style={{ color: COLORS.primary }} />{" "}
                  New job record appears in the jobs table.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2 size={15} style={{ color: COLORS.primary }} />{" "}
                  View opens the full job detail route after creation.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2 size={15} style={{ color: COLORS.primary }} />{" "}
                  Related job and quote references remain attached.
                </p>
                {hasInvite && (
                  <p className="flex gap-2">
                    <UserPlus size={15} style={{ color: COLORS.primary }} />{" "}
                    Client invite is prepared for onboarding.
                  </p>
                )}
              </div>
            </div>
            <div
              className="rounded-[18px] border p-4"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{ color: COLORS.ink }}
              >
                Preview
              </p>
              <div
                className="mt-3 rounded-[14px] border p-3"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  background: COLORS.surfaceSoft,
                }}
              >
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  {title || "New job"}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
                  {clientName} · {location}
                </p>
                <p className="mt-2 text-[13px]" style={{ color: COLORS.body }}>
                  {budget} · {quote}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div
          className="mt-5 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <button
            onClick={onClose}
            className="h-11 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Create job and open detail
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DashboardPreviewSection() {
  const [role, setRole] = useState<DashboardRole>("artisan");
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(
    null,
  );

  const roleConfig = {
    artisan: {
      title: "ChapaWorks Studio",
      eyebrow: "Artisan dashboard shell",
      description:
        "Shared layout for jobs, messages, portfolio, settings, subscription, analytics, earnings, and reviews.",
      nav: [
        ["Overview", LayoutDashboard],
        ["Jobs", ClipboardList],
        ["Messages", Inbox],
        ["Portfolio", Images],
        ["Settings", Settings],
      ],
      stats: [
        ["Active jobs", "6", "+2 this month", ClipboardList],
        ["Unread messages", "14", "Needs response", MessageCircle],
        ["Average rating", "4.8", "91 reviews", Star],
        ["Profile completion", "82%", "3 steps left", CheckCircle2],
      ],
      records: [
        {
          title: "Kitchen sink repair",
          meta: "Client: Miriam · Kilimani",
          status: "QUOTED",
          amount: "KES 4,800",
        },
        {
          title: "Portfolio upload pending",
          meta: "Add 3 public projects",
          status: "PENDING",
        },
        {
          title: "Verification status",
          meta: "Certificate received",
          status: "VERIFIED",
        },
      ] as DashboardRecord[],
    },
    client: {
      title: "Client Dashboard",
      eyebrow: "Client workspace shell",
      description:
        "Shared layout for finding artisans, saved profiles, jobs, quotes, messages, reviews, map, and settings.",
      nav: [
        ["Overview", LayoutDashboard],
        ["Find Artisans", Search],
        ["Jobs", ClipboardList],
        ["Saved", Bookmark],
        ["Messages", Inbox],
      ],
      stats: [
        ["Active jobs", "3", "2 quoted", ClipboardList],
        ["Saved artisans", "12", "Recently added", Bookmark],
        ["Messages", "8", "4 unread", MessageCircle],
        ["Completed jobs", "17", "5 reviewed", CheckCircle2],
      ],
      records: [
        {
          title: "Paint living room",
          meta: "Amina Hassan · Quote received",
          status: "QUOTED",
          amount: "KES 12,000",
        },
        {
          title: "Saved artisan",
          meta: "Grace Wanjiku · Carpenter",
          status: "ACTIVE",
        },
        {
          title: "Final payment info",
          meta: "Cash-only testing mode",
          status: "REVIEW",
        },
      ] as DashboardRecord[],
    },
    admin: {
      title: "Admin Console",
      eyebrow: "Platform operations shell",
      description:
        "Shared layout for verification, users, artisans, invites, analytics, subscriptions, monitoring, and moderation.",
      nav: [
        ["Overview", LayoutDashboard],
        ["Artisans", UserCog],
        ["Verification", FileCheck2],
        ["Users", UserRound],
        ["Analytics", BarChart3],
      ],
      stats: [
        ["Total users", "2,418", "+8.4%", UserRound],
        ["Pending verification", "19", "Needs review", FileCheck2],
        ["Active subscriptions", "312", "KES 46.8K", WalletCards],
        ["System health", "99.9%", "Operational", Activity],
      ],
      records: [
        {
          title: "Verification review",
          meta: "Joseph Njoroge · ID uploaded",
          status: "REVIEW",
        },
        {
          title: "Invite accepted",
          meta: "Invited artisan completed signup",
          status: "ACTIVE",
        },
        {
          title: "Subscription monitor",
          meta: "Monthly plan renewal",
          status: "COMPLETED",
          amount: "KES 150",
        },
      ] as DashboardRecord[],
    },
  }[role];

  useEffect(() => {
    setActiveNav("Overview");
    setSelectedRecord(null);
  }, [role]);

  return (
    <section
      id="dashboard-shell-preview"
      className="min-h-screen w-full bg-white"
    >
      <div className="min-h-screen overflow-hidden bg-white">
        <div className="grid min-h-screen lg:grid-cols-[256px_1fr]">
          <aside
            className="border-b bg-[#f7f7f7] p-4 lg:border-b-0 lg:border-r"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <ChapaWorksLogo />
              <button
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white lg:hidden"
                aria-label="Toggle dashboard sidebar"
              >
                <PanelLeft size={17} />
              </button>
            </div>
            <p
              className="mb-2 px-3 text-[13px] font-medium leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              {roleConfig.title}
            </p>
            <nav className="flex min-h-0 flex-1 flex-col justify-start gap-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {roleConfig.nav.map(([label, Icon]) => {
                const active = activeNav === label;
                return (
                  <button
                    key={label as string}
                    onClick={() => setActiveNav(label as string)}
                    className="flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[14px] font-medium leading-[1.29] transition-colors hover:bg-white"
                    style={{
                      color: active ? COLORS.ink : COLORS.body,
                      background: active ? COLORS.canvas : "transparent",
                      boxShadow: active ? softShadow : "none",
                    }}
                  >
                    <Icon
                      size={17}
                      style={{ color: active ? COLORS.primary : COLORS.muted }}
                    />
                    {label as string}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 bg-white">
            <div
              className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <div>
                <p
                  className="text-[14px] font-medium leading-[1.29]"
                  style={{ color: COLORS.muted }}
                >
                  {roleConfig.eyebrow}
                </p>
                <h3
                  className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                  style={{ color: COLORS.ink }}
                >
                  {activeNav}
                </h3>
                <p
                  className="mt-2 max-w-[620px] text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  {roleConfig.description}
                </p>
              </div>
              <button
                className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                style={{ background: COLORS.primary }}
              >
                Primary action
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {roleConfig.stats.map(([label, value, helper, Icon]) => (
                  <DashboardStatCard
                    key={label as string}
                    label={label as string}
                    value={value as string}
                    helper={helper as string}
                    icon={Icon as typeof Search}
                  />
                ))}
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_320px]">
                <div
                  className="overflow-hidden rounded-[18px] border"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div
                    className="flex items-center justify-between border-b px-4 py-3"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <div>
                      <p
                        className="text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        Recent records
                      </p>
                      <p
                        className="text-[13px] leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        Table shell with status and row actions
                      </p>
                    </div>
                    <button
                      className="grid h-9 w-9 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                      aria-label="More actions"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                  <div
                    className="divide-y"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    {roleConfig.records.map((record) => (
                      <button
                        key={record.title}
                        onClick={() => setSelectedRecord(record)}
                        className="grid w-full cursor-pointer gap-3 px-4 py-4 text-left transition-colors hover:bg-[#f7f7f7] md:grid-cols-[1fr_auto_auto] md:items-center"
                      >
                        <span>
                          <span
                            className="block text-[14px] font-semibold leading-[1.29]"
                            style={{ color: COLORS.ink }}
                          >
                            {record.title}
                          </span>
                          <span
                            className="mt-1 block text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            {record.meta}
                          </span>
                        </span>
                        <StatusChip status={record.status} />
                        <span
                          className="text-[14px] font-medium leading-[1.29]"
                          style={{ color: COLORS.ink }}
                        >
                          {record.amount ?? "Open"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-[18px] border p-4"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="mb-3 text-[16px] font-semibold leading-[1.25]"
                    style={{ color: COLORS.ink }}
                  >
                    Activity feed
                  </p>
                  <div className="grid gap-3">
                    {roleConfig.records.map((record, index) => (
                      <div
                        key={`${record.title}-activity`}
                        className="flex gap-3 rounded-[14px] bg-white p-3"
                      >
                        <span
                          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                          style={{
                            background: COLORS.primaryTint,
                            color: COLORS.primary,
                          }}
                        >
                          <Activity size={15} />
                        </span>
                        <span>
                          <span
                            className="block text-[14px] font-medium leading-[1.29]"
                            style={{ color: COLORS.ink }}
                          >
                            {record.title}
                          </span>
                          <span
                            className="block text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            {index + 1}h ago · {record.meta}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selectedRecord && (
          <motion.div
            className="fixed inset-0 z-[70] flex justify-end bg-black/20 px-3 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 cursor-default"
              aria-label="Close detail panel"
              onClick={() => setSelectedRecord(null)}
            />
            <motion.aside
              initial={{ x: 36, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 36, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
                mass: 0.72,
              }}
              className="relative w-full max-w-[420px] rounded-[24px] border bg-white p-5"
              style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p
                    className="text-[13px] font-medium leading-[1.23]"
                    style={{ color: COLORS.muted }}
                  >
                    Detail slideover
                  </p>
                  <h3
                    className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                    style={{ color: COLORS.ink }}
                  >
                    {selectedRecord.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                  aria-label="Close slideover"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-4">
                <div
                  className="rounded-[14px] border p-4"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="mb-2 text-[14px] font-semibold leading-[1.29]"
                    style={{ color: COLORS.ink }}
                  >
                    Status
                  </p>
                  <StatusChip status={selectedRecord.status} />
                </div>
                <div
                  className="rounded-[14px] border p-4"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="mb-2 text-[14px] font-semibold leading-[1.29]"
                    style={{ color: COLORS.ink }}
                  >
                    Summary
                  </p>
                  <p
                    className="text-[14px] leading-[1.43]"
                    style={{ color: COLORS.body }}
                  >
                    {selectedRecord.meta}
                  </p>
                </div>
                <button
                  className="h-12 cursor-pointer rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  Continue workflow
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

type ArtisanCoreView =
  | "overview"
  | "jobs"
  | "job-detail"
  | "messages"
  | "portfolio"
  | "earnings"
  | "earning-detail"
  | "subscription"
  | "settings";
type ArtisanSettingsTab =
  | "profile"
  | "specializations"
  | "location"
  | "verification"
  | "notifications";

const artisanSettingsTabs: Array<PillTabOption<ArtisanSettingsTab>> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "specializations", label: "Specializations", icon: BadgeCheck },
  { id: "location", label: "Location", icon: MapPin },
  { id: "verification", label: "Verification", icon: FileCheck2 },
  { id: "notifications", label: "Notifications", icon: BellRing },
];

type ArtisanJob = {
  id: string;
  title: string;
  client: string;
  status: DashboardRecord["status"];
  budget: string;
  quote: string;
  location: string;
  description: string;
};

type ArtisanEarningRow = {
  id: string;
  item: string;
  client: string;
  amount: string;
  commission: string;
  net: string;
  status: DashboardRecord["status"];
  date: string;
};

const artisanJobs: ArtisanJob[] = [
  {
    id: "job-001",
    title: "Repair leaking kitchen sink",
    client: "Miriam Otieno",
    status: "QUOTED",
    budget: "KES 6,000",
    quote: "KES 4,800",
    location: "Kilimani, Nairobi",
    description:
      "Client reports a persistent leak below the sink, slow drainage, and wants a same-week repair with material estimate included.",
  },
  {
    id: "job-002",
    title: "Install new cabinet handles",
    client: "David Mwangi",
    status: "ACTIVE",
    budget: "KES 3,500",
    quote: "KES 3,000",
    location: "Westlands, Nairobi",
    description:
      "Install twenty cabinet handles and adjust two loose hinges in a rental apartment kitchen.",
  },
  {
    id: "job-003",
    title: "Bathroom tile repair quote",
    client: "Sarah Wanjiku",
    status: "PENDING",
    budget: "KES 12,000",
    quote: "Not sent",
    location: "Ruiru, Kiambu",
    description:
      "Client needs broken bathroom tiles replaced and waterproofing checked before accepting a quote.",
  },
];

type ArtisanPortfolioProject = {
  id: string;
  title: string;
  category: string;
  status: "Published" | "Draft" | "Hidden";
  featured: boolean;
  duration: string;
  cost: string;
  location: string;
  description: string;
  tags: string[];
  gradient: string;
};

const artisanPortfolioProjects: ArtisanPortfolioProject[] = [
  {
    id: "portfolio-001",
    title: "Custom kitchen cabinet refit",
    category: "Carpentry",
    status: "Published",
    featured: true,
    duration: "5 days",
    cost: "KES 48,000",
    location: "Kileleshwa, Nairobi",
    description:
      "Rebuilt storage, repaired hinges, installed soft-close runners, and finished the cabinet faces for a rental kitchen refresh.",
    tags: ["Cabinets", "Kitchen", "Soft-close", "Repair"],
    gradient: "linear-gradient(135deg, #f4f1e8 0%, #b89565 44%, #4b3524 100%)",
  },
  {
    id: "portfolio-002",
    title: "Floating shelves and media wall",
    category: "Interior fittings",
    status: "Published",
    featured: false,
    duration: "3 days",
    cost: "KES 31,500",
    location: "Westlands, Nairobi",
    description:
      "Installed floating shelves, cable pass-throughs, and a clean media wall finish with minimal disruption to the client home.",
    tags: ["Shelving", "Media wall", "Finishing"],
    gradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 42%, #047857 100%)",
  },
  {
    id: "portfolio-003",
    title: "Wardrobe door repair and repaint",
    category: "Repair work",
    status: "Draft",
    featured: false,
    duration: "2 days",
    cost: "KES 14,000",
    location: "Ruiru, Kiambu",
    description:
      "Adjusted warped doors, replaced damaged rails, and prepared a draft project entry awaiting better after photos.",
    tags: ["Wardrobe", "Repair", "Paint prep"],
    gradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 44%, #065f46 100%)",
  },
  {
    id: "portfolio-004",
    title: "Shop counter fabrication",
    category: "Commercial build",
    status: "Hidden",
    featured: false,
    duration: "7 days",
    cost: "KES 92,000",
    location: "CBD, Nairobi",
    description:
      "Built a durable front counter with storage compartments. Hidden from public profile until client permission is confirmed.",
    tags: ["Commercial", "Counter", "Storage"],
    gradient: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 45%, #065f46 100%)",
  },
];

const artisanEarningRows: ArtisanEarningRow[] = [
  {
    id: "earn-001",
    item: "Kitchen sink repair",
    client: "Miriam Otieno",
    amount: "KES 4,800",
    commission: "KES 480",
    net: "KES 4,320",
    status: "PENDING" as const,
    date: "Today",
  },
  {
    id: "earn-002",
    item: "Cabinet handle install",
    client: "David Mwangi",
    amount: "KES 3,000",
    commission: "KES 300",
    net: "KES 2,700",
    status: "ACTIVE" as const,
    date: "Yesterday",
  },
  {
    id: "earn-003",
    item: "Bathroom tile inspection",
    client: "Sarah Wanjiku",
    amount: "KES 1,500",
    commission: "KES 150",
    net: "KES 1,350",
    status: "COMPLETED" as const,
    date: "May 12",
  },
];

type ArtisanDataStore = {
  jobs: ArtisanJob[];
  portfolioProjects: ArtisanPortfolioProject[];
  earnings: ArtisanEarningRow[];
};

const artisanDataFixtures: ArtisanDataStore = {
  jobs: artisanJobs,
  portfolioProjects: artisanPortfolioProjects,
  earnings: artisanEarningRows,
};

function useMockResource<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setError(null);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 260);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(timeout);
  }, []);

  return { data, setData, loading, error, refetch };
}

type QuoteRootCategory =
  | "Labor"
  | "Materials"
  | "Equipment"
  | "Tools"
  | "Transport"
  | "Other";
type QuoteUnit = "item" | "hour" | "day" | "meter" | "sqm" | "visit" | "trip";

type QuoteRootTemplate = {
  id: string;
  category: QuoteRootCategory;
  name: string;
  unit: QuoteUnit;
  basePrice: number;
  description: string;
};

type QuoteSubItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: QuoteUnit;
  unitPrice: number;
};

type QuoteLineItem = QuoteRootTemplate & {
  lineId: string;
  quantity: number;
  customDescription: string;
  price: number;
  subItems: QuoteSubItem[];
};

const quoteRootCategories: QuoteRootCategory[] = [
  "Labor",
  "Materials",
  "Equipment",
  "Tools",
  "Transport",
  "Other",
];

const quoteRootTemplates: QuoteRootTemplate[] = [
  {
    id: "labor-general",
    category: "Labor",
    name: "General labor",
    unit: "hour",
    basePrice: 800,
    description:
      "Standard labour for diagnosis, repair, installation, or finishing.",
  },
  {
    id: "labor-skilled",
    category: "Labor",
    name: "Skilled specialist labor",
    unit: "hour",
    basePrice: 1500,
    description: "Specialist artisan time for technical or high-skill work.",
  },
  {
    id: "labor-handyman",
    category: "Labor",
    name: "Assistant / handyman labor",
    unit: "hour",
    basePrice: 650,
    description:
      "Support labour for carrying, prep, cleanup, or secondary tasks.",
  },
  {
    id: "materials-standard",
    category: "Materials",
    name: "Standard materials",
    unit: "item",
    basePrice: 1200,
    description: "Core job materials bought for the client-approved scope.",
  },
  {
    id: "materials-consumables",
    category: "Materials",
    name: "Consumables allowance",
    unit: "item",
    basePrice: 700,
    description:
      "Sealant, tape, screws, plugs, adhesive, grout, primer, and other small consumables.",
  },
  {
    id: "materials-finishing",
    category: "Materials",
    name: "Finishing materials",
    unit: "sqm",
    basePrice: 950,
    description:
      "Paint, finish, filler, grout, waterproofing compound, or trim materials.",
  },
  {
    id: "equipment-rental",
    category: "Equipment",
    name: "Equipment rental",
    unit: "day",
    basePrice: 2500,
    description: "Rental for specialized equipment required for the job.",
  },
  {
    id: "equipment-safety",
    category: "Equipment",
    name: "Safety equipment",
    unit: "item",
    basePrice: 900,
    description: "Safety gear or protective equipment needed for execution.",
  },
  {
    id: "tools-standard",
    category: "Tools",
    name: "Tooling charge",
    unit: "item",
    basePrice: 600,
    description: "Use, wear, or special tooling fee for the selected job.",
  },
  {
    id: "tools-special",
    category: "Tools",
    name: "Special tool setup",
    unit: "item",
    basePrice: 1400,
    description: "Setup for tools not normally included in a basic call-out.",
  },
  {
    id: "transport-local",
    category: "Transport",
    name: "Local transport",
    unit: "trip",
    basePrice: 700,
    description:
      "Transport to and from the client location within the service area.",
  },
  {
    id: "transport-materials",
    category: "Transport",
    name: "Materials pickup",
    unit: "trip",
    basePrice: 1000,
    description: "Pickup and delivery of required job materials.",
  },
  {
    id: "other-permit",
    category: "Other",
    name: "Permit / access fee",
    unit: "item",
    basePrice: 500,
    description: "Any agreed access, estate, or permit-like fee.",
  },
  {
    id: "other-contingency",
    category: "Other",
    name: "Contingency allowance",
    unit: "item",
    basePrice: 1000,
    description:
      "Small contingency for scope uncertainty, confirmed before use.",
  },
];

const quoteSubItemSuggestions: Record<
  QuoteRootCategory,
  Array<Omit<QuoteSubItem, "id">>
> = {
  Labor: [
    {
      name: "Skilled labour",
      description: "Lead artisan execution time.",
      quantity: 2,
      unit: "hour",
      unitPrice: 1500,
    },
    {
      name: "Handyman labour",
      description: "Assistant labour for prep and cleanup.",
      quantity: 2,
      unit: "hour",
      unitPrice: 650,
    },
    {
      name: "Inspection and diagnosis",
      description: "Site inspection and work planning.",
      quantity: 1,
      unit: "visit",
      unitPrice: 1000,
    },
  ],
  Materials: [
    {
      name: "Replacement parts",
      description: "Client-approved replacement materials.",
      quantity: 1,
      unit: "item",
      unitPrice: 1800,
    },
    {
      name: "Sealant and fasteners",
      description: "Small consumables required for the job.",
      quantity: 1,
      unit: "item",
      unitPrice: 700,
    },
    {
      name: "Finishing compound",
      description: "Grout, filler, paint, or waterproofing finish.",
      quantity: 1,
      unit: "sqm",
      unitPrice: 950,
    },
  ],
  Equipment: [
    {
      name: "Machine rental",
      description: "Special equipment rented for the job.",
      quantity: 1,
      unit: "day",
      unitPrice: 2500,
    },
    {
      name: "Safety gear",
      description: "Protective equipment for safe execution.",
      quantity: 1,
      unit: "item",
      unitPrice: 900,
    },
  ],
  Tools: [
    {
      name: "Tool setup",
      description: "Special tool setup and wear charge.",
      quantity: 1,
      unit: "item",
      unitPrice: 600,
    },
    {
      name: "Special bit / blade",
      description: "Consumable tool part required for the job.",
      quantity: 1,
      unit: "item",
      unitPrice: 850,
    },
  ],
  Transport: [
    {
      name: "Client site trip",
      description: "Transport to the work location.",
      quantity: 1,
      unit: "trip",
      unitPrice: 700,
    },
    {
      name: "Material pickup",
      description: "Pickup and delivery of materials.",
      quantity: 1,
      unit: "trip",
      unitPrice: 1000,
    },
  ],
  Other: [
    {
      name: "Estate access fee",
      description: "Agreed access or permit fee.",
      quantity: 1,
      unit: "item",
      unitPrice: 500,
    },
    {
      name: "Contingency",
      description: "Small allowance for confirmed extras.",
      quantity: 1,
      unit: "item",
      unitPrice: 1000,
    },
  ],
};

function formatKes(value: number) {
  return `KES ${Math.max(0, Math.round(value)).toLocaleString()}`;
}

function quoteLineTotal(item: QuoteLineItem) {
  const subTotal = item.subItems.reduce(
    (sum, subItem) => sum + subItem.quantity * subItem.unitPrice,
    0,
  );
  return subTotal > 0 ? subTotal : item.quantity * item.price;
}

function QuoteWorkflowBuilder({
  selectedJob,
  mode,
  onSubmit,
}: {
  selectedJob: ArtisanJob;
  mode: "create" | "revision";
  onSubmit?: (total: number) => void;
}) {
  const [category, setCategory] = useState<QuoteRootCategory>("Labor");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [subItemMode, setSubItemMode] = useState(false);
  const [subItemsDraft, setSubItemsDraft] = useState<QuoteSubItem[]>([]);
  const [depositPercent, setDepositPercent] = useState(30);
  const [estimatedDays, setEstimatedDays] = useState("1 day");
  const [terms, setTerms] = useState(
    "Includes labour and standard consumables. Extra materials are confirmed with the client before purchase.",
  );
  const [items, setItems] = useState<QuoteLineItem[]>(() => {
    const labor =
      quoteRootTemplates.find((item) => item.id === "labor-general") ??
      quoteRootTemplates[0];
    const materials =
      quoteRootTemplates.find((item) => item.id === "materials-consumables") ??
      quoteRootTemplates[1];
    return [
      {
        ...labor,
        lineId: "quote-line-labor",
        quantity: 2,
        price: labor.basePrice,
        customDescription: "General labour for diagnosis and repair.",
        subItems: [],
      },
      {
        ...materials,
        lineId: "quote-line-materials",
        quantity: 1,
        price: materials.basePrice,
        customDescription: materials.description,
        subItems: [],
      },
    ];
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availableTemplates = useMemo(
    () => quoteRootTemplates.filter((item) => item.category === category),
    [category],
  );
  const selectedTemplate =
    availableTemplates.find((item) => item.id === selectedTemplateId) ??
    availableTemplates[0];
  const draftTotal =
    subItemMode && subItemsDraft.length > 0
      ? subItemsDraft.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        )
      : Math.max(1, Number(quantity) || 1) *
        Math.max(0, Number(price) || selectedTemplate?.basePrice || 0);
  const subtotal = items.reduce((sum, item) => sum + quoteLineTotal(item), 0);
  const depositAmount = Math.round((subtotal * depositPercent) / 100);

  useEffect(() => {
    const first = availableTemplates[0];
    if (!first) return;
    setSelectedTemplateId(first.id);
    setCustomDescription(first.description);
    setPrice(first.basePrice);
    setQuantity(1);
    setSubItemMode(false);
    setSubItemsDraft([]);
  }, [availableTemplates]);

  const addSuggestedSubItem = (suggestion: Omit<QuoteSubItem, "id">) => {
    setSubItemMode(true);
    setSubItemsDraft((current) => [
      ...current,
      { ...suggestion, id: `${category}-${Date.now()}-${current.length}` },
    ]);
  };

  const updateSubItem = (id: string, patch: Partial<QuoteSubItem>) =>
    setSubItemsDraft((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  const removeSubItem = (id: string) =>
    setSubItemsDraft((current) => current.filter((item) => item.id !== id));

  const addQuoteItem = () => {
    if (!selectedTemplate) return;
    const normalizedSubItems = subItemMode
      ? subItemsDraft
          .filter((item) => item.name.trim())
          .map((item) => ({
            ...item,
            quantity: Math.max(1, Number(item.quantity) || 1),
            unitPrice: Math.max(0, Number(item.unitPrice) || 0),
          }))
      : [];
    const nextItem: QuoteLineItem = {
      ...selectedTemplate,
      lineId: `${selectedTemplate.id}-${Date.now()}`,
      quantity: Math.max(1, Number(quantity) || 1),
      price: normalizedSubItems.length
        ? normalizedSubItems.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0,
          )
        : Math.max(0, Number(price) || selectedTemplate.basePrice),
      customDescription:
        customDescription.trim() || selectedTemplate.description,
      subItems: normalizedSubItems,
    };
    setItems((current) => [...current, nextItem]);
    setSubItemsDraft([]);
    setSubItemMode(false);
  };

  const removeQuoteItem = (lineId: string) =>
    setItems((current) => current.filter((item) => item.lineId !== lineId));

  return (
    <div className="grid min-w-0 gap-5">
      <div className="min-w-0 space-y-4">
        <div
          className="rounded-[16px] border p-4"
          style={{
            borderColor: COLORS.hairlineSoft,
            background: COLORS.surfaceSoft,
          }}
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className="text-[14px] font-semibold leading-[1.29]"
                style={{ color: COLORS.ink }}
              >
                {mode === "revision"
                  ? "Revise itemized quote"
                  : "Build itemized quote"}
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                Add client-facing cost sections such as labor, materials,
                equipment, tools, transport, or other. Each section can stand
                alone or include a detailed breakdown that rolls into its total.
              </p>
            </div>
            <span
              className="rounded-full border bg-white px-3 py-1 text-[12px] font-semibold"
              style={{ borderColor: COLORS.hairline, color: COLORS.body }}
            >
              {items.length} quote sections
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quoteRootCategories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className="h-10 cursor-pointer rounded-full border px-3.5 text-[13px] font-medium transition-colors hover:bg-white"
                style={{
                  borderColor: category === item ? COLORS.ink : COLORS.hairline,
                  background: category === item ? COLORS.canvas : "transparent",
                  color: category === item ? COLORS.ink : COLORS.body,
                  boxShadow: category === item ? softShadow : "none",
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div
          className="min-w-0 rounded-[16px] border bg-white p-3 sm:p-4"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p
                className="text-[14px] font-semibold leading-[1.29]"
                style={{ color: COLORS.ink }}
              >
                Add {category.toLowerCase()} cost
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                Use one line for a simple cost, or add a breakdown when the cost
                has several parts.
              </p>
            </div>
            {selectedTemplate && (
              <span
                className="w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  borderColor: COLORS.primarySoft,
                  background: COLORS.primaryTint,
                  color: COLORS.primaryActive,
                }}
              >
                {selectedTemplate.unit} ·{" "}
                {formatKes(selectedTemplate.basePrice)} base
              </span>
            )}
          </div>
          <div className="grid min-w-0 gap-3">
            <label className="grid min-w-0 gap-1.5">
              <span
                className="text-[14px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Cost type
              </span>
              <select
                value={selectedTemplateId}
                onChange={(event) => {
                  const next = availableTemplates.find(
                    (item) => item.id === event.target.value,
                  );
                  setSelectedTemplateId(event.target.value);
                  if (next) {
                    setCustomDescription(next.description);
                    setPrice(next.basePrice);
                    setQuantity(1);
                    setSubItemsDraft([]);
                    setSubItemMode(false);
                  }
                }}
                className="h-12 min-w-0 cursor-pointer rounded-lg border bg-white px-3 text-[14px] outline-none"
                style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
              >
                {availableTemplates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {formatKes(item.basePrice)} / {item.unit}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="flex flex-col gap-3 rounded-[14px] border p-3 sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderColor: COLORS.hairlineSoft,
                background: COLORS.surfaceSoft,
              }}
            >
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Detailed breakdown
                </p>
                <p
                  className="mt-1 text-[13px] leading-[1.23]"
                  style={{ color: COLORS.muted }}
                >
                  Use for complex pricing, for example skilled labour plus
                  assistant labour.
                </p>
              </div>
              <button
                onClick={() => setSubItemMode((value) => !value)}
                className="h-10 w-fit cursor-pointer rounded-full border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                style={{
                  borderColor: subItemMode ? COLORS.ink : COLORS.hairline,
                  color: COLORS.ink,
                }}
              >
                {subItemMode ? "Breakdown on" : "Single line"}
              </button>
            </div>
            {!subItemMode && (
              <div className="grid min-w-0 gap-3 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-end">
                <label className="grid gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Qty
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                    className="h-12 min-w-0 rounded-lg border px-3 text-[14px] outline-none"
                    style={{ borderColor: COLORS.hairline }}
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    Unit price
                  </span>
                  <div
                    className="flex h-12 min-w-0 items-center overflow-hidden rounded-lg border bg-white"
                    style={{ borderColor: COLORS.hairline }}
                  >
                    <span
                      className="shrink-0 border-r px-3 text-[13px] font-medium"
                      style={{
                        borderColor: COLORS.hairlineSoft,
                        color: COLORS.muted,
                      }}
                    >
                      KES
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(event) => setPrice(Number(event.target.value))}
                      className="h-full min-w-0 flex-1 px-3 text-[14px] outline-none"
                    />
                  </div>
                </label>
                <button
                  onClick={addQuoteItem}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800 sm:w-auto sm:min-w-[104px]"
                  style={{ background: COLORS.primary }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            )}
            {subItemMode && (
              <div className="grid gap-3">
                <div className="flex flex-wrap gap-2">
                  {quoteSubItemSuggestions[category].map((suggestion) => (
                    <button
                      key={suggestion.name}
                      onClick={() => addSuggestedSubItem(suggestion)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.ink,
                      }}
                    >
                      <Plus size={13} /> {suggestion.name}
                    </button>
                  ))}
                </div>
                <div className="grid gap-2">
                  {subItemsDraft.length === 0 ? (
                    <div
                      className="rounded-[14px] border border-dashed p-4 text-[13px] leading-[1.23]"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.muted,
                      }}
                    >
                      Add suggested breakdown lines above. The{" "}
                      {category.toLowerCase()} total will be calculated from the
                      rows you add.
                    </div>
                  ) : (
                    subItemsDraft.map((subItem) => (
                      <div
                        key={subItem.id}
                        className="grid gap-2 rounded-[14px] border p-3"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_80px_120px_38px] md:items-end">
                          <label className="grid min-w-0 gap-1">
                            <span
                              className="text-[12px] font-medium"
                              style={{ color: COLORS.muted }}
                            >
                              Breakdown line
                            </span>
                            <input
                              value={subItem.name}
                              onChange={(event) =>
                                updateSubItem(subItem.id, {
                                  name: event.target.value,
                                })
                              }
                              className="h-10 rounded-lg border px-3 text-[13px] outline-none"
                              style={{ borderColor: COLORS.hairline }}
                            />
                          </label>
                          <label className="grid gap-1">
                            <span
                              className="text-[12px] font-medium"
                              style={{ color: COLORS.muted }}
                            >
                              Qty
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={subItem.quantity}
                              onChange={(event) =>
                                updateSubItem(subItem.id, {
                                  quantity: Number(event.target.value),
                                })
                              }
                              className="h-10 rounded-lg border px-3 text-[13px] outline-none"
                              style={{ borderColor: COLORS.hairline }}
                            />
                          </label>
                          <label className="grid gap-1">
                            <span
                              className="text-[12px] font-medium"
                              style={{ color: COLORS.muted }}
                            >
                              Unit price
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={subItem.unitPrice}
                              onChange={(event) =>
                                updateSubItem(subItem.id, {
                                  unitPrice: Number(event.target.value),
                                })
                              }
                              className="h-10 rounded-lg border px-3 text-[13px] outline-none"
                              style={{ borderColor: COLORS.hairline }}
                            />
                          </label>
                          <button
                            onClick={() => removeSubItem(subItem.id)}
                            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border transition-colors hover:bg-[#fff7ed]"
                            style={{
                              borderColor: COLORS.hairline,
                              color: "#c2410c",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <label className="grid gap-1">
                          <span
                            className="text-[12px] font-medium"
                            style={{ color: COLORS.muted }}
                          >
                            Description
                          </span>
                          <input
                            value={subItem.description}
                            onChange={(event) =>
                              updateSubItem(subItem.id, {
                                description: event.target.value,
                              })
                            }
                            className="h-10 rounded-lg border px-3 text-[13px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          />
                        </label>
                        <p
                          className="text-right text-[13px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {subItem.quantity} × {formatKes(subItem.unitPrice)} ={" "}
                          {formatKes(subItem.quantity * subItem.unitPrice)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <button
                  disabled={subItemsDraft.length === 0}
                  onClick={addQuoteItem}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: COLORS.primary }}
                >
                  <Plus size={16} /> Add {category.toLowerCase()} cost ·{" "}
                  {formatKes(draftTotal)}
                </button>
              </div>
            )}
          </div>
          <label className="mt-3 grid gap-1.5">
            <span
              className="text-[14px] font-medium"
              style={{ color: COLORS.ink }}
            >
              Cost description
            </span>
            <textarea
              value={customDescription}
              onChange={(event) => setCustomDescription(event.target.value)}
              className="min-h-20 rounded-lg border px-3 py-2 text-[14px] outline-none"
              style={{ borderColor: COLORS.hairline }}
            />
          </label>
        </div>

        <div
          className="min-w-0 overflow-hidden rounded-[16px] border bg-white"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div
            className="border-b px-4 py-3"
            style={{
              borderColor: COLORS.hairlineSoft,
              background: COLORS.surfaceSoft,
            }}
          >
            <p
              className="text-[14px] font-semibold"
              style={{ color: COLORS.ink }}
            >
              Quote cost breakdown
            </p>
            <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
              Each cost section is shown with its calculated total. Detailed
              sections reveal their child rows underneath.
            </p>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            {items.length === 0 ? (
              <div
                className="p-6 text-center text-[14px]"
                style={{ color: COLORS.muted }}
              >
                No quote items added yet.
              </div>
            ) : (
              items.map((item) => {
                const total = quoteLineTotal(item);
                return (
                  <div
                    key={item.lineId}
                    className="grid min-w-0 gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {item.name}
                        </p>
                        <span
                          className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background: COLORS.surfaceSoft,
                            color: COLORS.muted,
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        className="text-[13px] leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        {item.customDescription}
                      </p>
                      {item.subItems.length > 0 ? (
                        <div
                          className="mt-3 border-l pl-3"
                          style={{ borderColor: COLORS.primarySoft }}
                        >
                          <div className="grid gap-1.5">
                            {item.subItems.map((subItem) => (
                              <p
                                key={subItem.id}
                                className="flex justify-between gap-3 rounded-lg bg-[#f7f7f7] px-3 py-2 text-[12px]"
                                style={{ color: COLORS.body }}
                              >
                                <span className="min-w-0 truncate">
                                  {subItem.name} · {subItem.quantity} ×{" "}
                                  {formatKes(subItem.unitPrice)}
                                </span>
                                <span
                                  className="shrink-0 font-semibold"
                                  style={{ color: COLORS.ink }}
                                >
                                  {formatKes(
                                    subItem.quantity * subItem.unitPrice,
                                  )}
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p
                          className="mt-2 text-[12px]"
                          style={{ color: COLORS.mutedSoft }}
                        >
                          {item.quantity} × {formatKes(item.price)} /{" "}
                          {item.unit}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-[14px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {formatKes(total)}
                    </span>
                    <button
                      onClick={() => removeQuoteItem(item.lineId)}
                      className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border transition-colors hover:bg-[#fff7ed]"
                      style={{ borderColor: COLORS.hairline, color: "#c2410c" }}
                      aria-label="Remove quote item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <aside className="min-w-0 space-y-4">
        <div
          className="rounded-[18px] border bg-white p-5"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: softShadow }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p
                className="text-[13px] font-medium leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                Quotation preview
              </p>
              <p
                className="mt-1 text-[18px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                {selectedJob.title}
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                {selectedJob.client} · {selectedJob.location}
              </p>
            </div>
            <StatusChip status="QUOTED" />
          </div>
          <div className="grid gap-2">
            {items.map((item) => (
              <div
                key={`preview-${item.lineId}`}
                className="min-w-0 rounded-[12px] border p-3"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  background: COLORS.surfaceSoft,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span
                      className="block truncate text-[13px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="mt-0.5 block text-[12px] leading-[1.33]"
                      style={{ color: COLORS.muted }}
                    >
                      {item.subItems.length
                        ? `${item.subItems.length} breakdown line${item.subItems.length === 1 ? "" : "s"}`
                        : `${item.quantity} × ${formatKes(item.price)}`}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-[13px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    {formatKes(quoteLineTotal(item))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="my-4 h-px"
            style={{ background: COLORS.hairlineSoft }}
          />
          <div className="grid gap-2 text-[14px]">
            <div className="flex justify-between gap-3">
              <span style={{ color: COLORS.muted }}>Subtotal</span>
              <span className="font-semibold" style={{ color: COLORS.ink }}>
                {formatKes(subtotal)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span style={{ color: COLORS.muted }}>Deposit request</span>
              <span className="font-semibold" style={{ color: COLORS.ink }}>
                {depositPercent}% · {formatKes(depositAmount)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span style={{ color: COLORS.muted }}>Estimated duration</span>
              <span className="font-semibold" style={{ color: COLORS.ink }}>
                {estimatedDays}
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5">
              <span
                className="text-[13px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Deposit %
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={depositPercent}
                onChange={(event) =>
                  setDepositPercent(Number(event.target.value))
                }
                className="h-10 rounded-lg border px-3 text-[14px] outline-none"
                style={{ borderColor: COLORS.hairline }}
              />
            </label>
            <label className="grid gap-1.5">
              <span
                className="text-[13px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Duration
              </span>
              <input
                value={estimatedDays}
                onChange={(event) => setEstimatedDays(event.target.value)}
                className="h-10 rounded-lg border px-3 text-[14px] outline-none"
                style={{ borderColor: COLORS.hairline }}
              />
            </label>
            <label className="grid gap-1.5">
              <span
                className="text-[13px] font-medium"
                style={{ color: COLORS.ink }}
              >
                Terms
              </span>
              <textarea
                value={terms}
                onChange={(event) => setTerms(event.target.value)}
                className="min-h-20 rounded-lg border px-3 py-2 text-[13px] outline-none"
                style={{ borderColor: COLORS.hairline }}
              />
            </label>
          </div>
          {submitted && (
            <div
              className="mt-4 rounded-[14px] border p-3"
              style={{
                borderColor: COLORS.primarySoft,
                background: COLORS.primaryTint,
              }}
            >
              <p
                className="text-[13px] font-semibold"
                style={{ color: COLORS.primaryActive }}
              >
                Quote submitted
              </p>
              <p
                className="mt-1 text-[12px] leading-[1.33]"
                style={{ color: COLORS.body }}
              >
                The client can now accept, decline, or request a revision.
              </p>
            </div>
          )}
          <button
            disabled={items.length === 0}
            onClick={() => setConfirmOpen(true)}
            className="mt-4 h-12 w-full cursor-pointer rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: COLORS.primary }}
          >
            {mode === "revision" ? "Submit revised quote" : "Submit quote"}
          </button>
        </div>
        <div
          className="rounded-[18px] border p-4"
          style={{
            borderColor: COLORS.hairlineSoft,
            background: COLORS.surfaceSoft,
          }}
        >
          <p
            className="text-[14px] font-semibold"
            style={{ color: COLORS.ink }}
          >
            Quote structure
          </p>
          <p
            className="mt-1 text-[13px] leading-[1.23]"
            style={{ color: COLORS.muted }}
          >
            Cost sections represent the client-facing quote categories.
            Breakdown lines are optional and appear only when a category needs
            itemized costing.
          </p>
        </div>
      </aside>

      <AnimatePresence initial={false}>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/35 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 cursor-default"
              aria-label="Close quote confirmation"
              onClick={() => setConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.975 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.975 }}
              transition={dashboardSpring}
              className="relative w-full max-w-[520px] rounded-[24px] border bg-white p-5 md:p-6"
              style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p
                    className="text-[13px] font-medium leading-[1.23]"
                    style={{ color: COLORS.muted }}
                  >
                    Confirm quotation
                  </p>
                  <h3
                    className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                    style={{ color: COLORS.ink }}
                  >
                    {formatKes(subtotal)}
                  </h3>
                </div>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#f7f7f7]"
                  aria-label="Close confirmation"
                >
                  <X size={18} />
                </button>
              </div>
              <p
                className="text-[14px] leading-[1.43]"
                style={{ color: COLORS.body }}
              >
                Submit this quote to {selectedJob.client} with {items.length}{" "}
                cost section{items.length === 1 ? "" : "s"}, {depositPercent}%
                deposit, and estimated duration of {estimatedDays}?
              </p>
              <div
                className="mt-5 grid gap-2 rounded-[14px] border p-4"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  background: COLORS.surfaceSoft,
                }}
              >
                {items.slice(0, 4).map((item) => (
                  <p
                    key={`confirm-${item.lineId}`}
                    className="flex justify-between gap-3 text-[13px]"
                  >
                    <span style={{ color: COLORS.body }}>{item.name}</span>
                    <span
                      className="font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {formatKes(quoteLineTotal(item))}
                    </span>
                  </p>
                ))}
              </div>
              <div
                className="mt-5 flex justify-end gap-2 border-t pt-4"
                style={{ borderColor: COLORS.hairlineSoft }}
              >
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="h-11 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  Review again
                </button>
                <button
                  onClick={() => {
                    setSubmitted(true);
                    setConfirmOpen(false);
                  }}
                  className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  Confirm and send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArtisanDashboardCoreSection({
  initialView = "overview",
  onRouteChange,
}: {
  initialView?: ArtisanCoreView;
  onRouteChange?: (view: ArtisanCoreView) => void;
} = {}) {
  const [view, setView] = useState<ArtisanCoreView>(initialView);
  const [selectedJob, setSelectedJob] = useState<ArtisanJob>(artisanJobs[0]);
  const [quoteMode, setQuoteMode] = useState<"summary" | "create" | "revision">(
    "summary",
  );
  const [quickJob, setQuickJob] = useState<ArtisanJob | null>(null);
  const [settingsTab, setSettingsTab] = useState<ArtisanSettingsTab>("profile");
  const [jobTab, setJobTab] = useState<ArtisanJobsTab>("all");
  const [selectedProject, setSelectedProject] =
    useState<ArtisanPortfolioProject | null>(null);
  const [portfolioModalMode, setPortfolioModalMode] = useState<
    "detail" | "edit"
  >("detail");
  const [portfolioModalIsNew, setPortfolioModalIsNew] = useState(false);
  const [customerPreviewProject, setCustomerPreviewProject] =
    useState<ArtisanPortfolioProject | null>(null);
  const [quickEarning, setQuickEarning] = useState<ArtisanEarningRow | null>(
    null,
  );
  const [selectedEarning, setSelectedEarning] = useState<ArtisanEarningRow>(
    artisanEarningRows[0],
  );
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addJobModalOpen, setAddJobModalOpen] = useState(false);
  const [verificationBannerDismissed, setVerificationBannerDismissed] =
    useState(() => {
      try { return Boolean(typeof localStorage !== "undefined" && localStorage.getItem("artisan-vb-dismissed")); } catch { return false; }
    });
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Real verification status from context — null when not in a provider (preview mode)
  const _verifCtx = useOptionalDashboardRealData();
  const realVerificationStatus = _verifCtx?.verificationStatus ?? null;
  const realRejectionReason = _verifCtx?.rejectionReason ?? null;

  const showVerificationBanner =
    !verificationBannerDismissed &&
    (realVerificationStatus === null
      ? true // preview mode: always show banner
      : realVerificationStatus !== "VERIFIED");
  const isVerificationRejected = realVerificationStatus === "REJECTED";

  // Mock resources kept for local optimistic mutations (job creation, portfolio save, etc.)
  const jobsResource = useMockResource(artisanDataFixtures.jobs);
  const portfolioResource = useMockResource(
    artisanDataFixtures.portfolioProjects,
  );
  const earningsResource = useMockResource(artisanDataFixtures.earnings);

  // Real data overlay — when context has live API data, use it for display;
  // local mock resources remain for optimistic mutations.
  const _hasReal = Boolean(
    _verifCtx && !_verifCtx.isLoading && _verifCtx.artisanJobs !== null
  );
  const artisanJobRows = _hasReal && _verifCtx?.artisanJobs
    ? (_verifCtx.artisanJobs as unknown as typeof jobsResource.data)
    : jobsResource.data;
  const setArtisanJobRows = jobsResource.setData;
  const portfolioRows = _hasReal && _verifCtx?.artisanPortfolio
    ? (_verifCtx.artisanPortfolio as unknown as typeof portfolioResource.data)
    : portfolioResource.data;
  const setPortfolioRows = portfolioResource.setData;
  const earningRows = _hasReal && _verifCtx?.artisanEarnings
    ? (_verifCtx.artisanEarnings as unknown as typeof earningsResource.data)
    : earningsResource.data;
  const setEarningRows = earningsResource.setData;
  const artisanDataLoading = _hasReal
    ? false
    : (jobsResource.loading || portfolioResource.loading || earningsResource.loading);

  // Profile completion: use real context value when available, fall back to formula
  const profileCompletionPct = (_hasReal && _verifCtx?.artisanCompletionPct != null)
    ? _verifCtx.artisanCompletionPct
    : Math.min(
        100,
        50 // base: account exists
        + (portfolioRows.length >= 2 ? 20 : portfolioRows.length * 10) // portfolio
        + (artisanJobRows.length > 0 ? 10 : 0) // has jobs
        + (earningRows.length > 0 ? 10 : 0) // has earnings
        + 5 // default: name/bio fields shown
        + 5 // default: specializations shown
      );

  const newPortfolioProject: ArtisanPortfolioProject = {
    id: "portfolio-new",
    title: "Untitled portfolio project",
    category: "Carpentry",
    status: "Draft",
    featured: false,
    duration: "",
    cost: "KES ",
    location: "",
    description: "",
    tags: ["New project"],
    gradient: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 42%, #047857 100%)",
  };

  const openPortfolioDetail = (project: ArtisanPortfolioProject) => {
    setPortfolioModalMode("detail");
    setPortfolioModalIsNew(false);
    setSelectedProject(project);
  };

  const openPortfolioEdit = (project: ArtisanPortfolioProject) => {
    setPortfolioModalMode("edit");
    setPortfolioModalIsNew(false);
    setSelectedProject(project);
  };

  const openPortfolioCreate = () => {
    setPortfolioModalMode("edit");
    setPortfolioModalIsNew(true);
    setSelectedProject(newPortfolioProject);
  };

  const unreadMessages = artisanJobRows.reduce<number>((acc, job) => acc + (job.status === "ACTIVE" ? 1 : 0), 0);
  const navItems: Array<DashboardNavItem<ArtisanCoreView>> = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      route: "/artisan/dashboard",
    },
    {
      id: "jobs",
      label: "Jobs",
      icon: ClipboardList,
      route: "/artisan/jobs",
      badge: artisanJobRows.filter((job) => job.status === "ACTIVE").length,
      section: "Workspace",
    },
    {
      id: "messages",
      label: "Messages",
      icon: Inbox,
      route: "/artisan/messages",
      badge: unreadMessages > 0 ? unreadMessages : undefined,
      section: "Workspace",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Images,
      route: "/artisan/portfolio",
      badge: portfolioRows.length,
      section: "Workspace",
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: Star,
      route: "/artisan/reviews",
      section: "Workspace",
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: CircleDollarSign,
      route: "/artisan/earnings",
      section: "Finance",
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: CreditCard,
      route: "/artisan/subscription",
      section: "Finance",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      route: "/artisan/settings",
      section: "Account",
    },
  ];

  const selectView = (nextView: ArtisanCoreView) => {
    setView(nextView);
    onRouteChange?.(nextView);
  };

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const setJobAndOpen = (job: ArtisanJob) => {
    setSelectedJob(job);
    setQuickJob(null);
    selectView("job-detail");
    setQuoteMode(job.status === "PENDING" ? "create" : "summary");
  };

  const createStandaloneJob = (job: ArtisanJob) => {
    setArtisanJobRows((current) => [job, ...current]);
    setAddJobModalOpen(false);
    setJobAndOpen(job);
  };

  const updateJobStatus = (
    job: ArtisanJob,
    status: DashboardRecord["status"],
  ) => {
    const updatedJob = { ...job, status };
    setArtisanJobRows((current) =>
      current.map((item) => (item.id === job.id ? updatedJob : item)),
    );
    setSelectedJob(updatedJob);
    setQuickJob((current) => (current?.id === job.id ? updatedJob : current));

    if (status === "COMPLETED") {
      const quoteValue =
        Number(
          (job.quote === "Not sent" ? job.budget : job.quote).replace(
            /[^0-9]/g,
            "",
          ),
        ) || 0;
      const commission = Math.round(quoteValue * 0.08);
      const earning: ArtisanEarningRow = {
        id: `earn-${job.id}`,
        item: job.title,
        client: job.client,
        amount: formatKes(quoteValue),
        commission: formatKes(commission),
        net: formatKes(quoteValue - commission),
        status: "COMPLETED",
        date: "Today",
      };
      setEarningRows((current) =>
        current.some((row) => row.id === earning.id)
          ? current.map((row) => (row.id === earning.id ? earning : row))
          : [earning, ...current],
      );
    }
  };

  const createJobFromConversationQuote = (
    threadJob: ArtisanJob,
    quote: ConversationQuote,
  ) => {
    const nextJob: ArtisanJob = {
      ...threadJob,
      id: threadJob.id.startsWith("job-")
        ? threadJob.id
        : `job-from-${threadJob.id}`,
      status: "ACTIVE",
      quote: formatKes(quote.amount),
      description: `${threadJob.description} Accepted conversation quote v${quote.version} converted into an active job record.`,
    };
    setArtisanJobRows((current) =>
      current.some((job) => job.id === nextJob.id)
        ? current.map((job) => (job.id === nextJob.id ? nextJob : job))
        : [nextJob, ...current],
    );
    setSelectedJob(nextJob);
  };

  const savePortfolioProject = (
    project: ArtisanPortfolioProject,
    isNew: boolean,
  ) => {
    setPortfolioRows((current) =>
      isNew
        ? [project, ...current]
        : current.map((item) => (item.id === project.id ? project : item)),
    );
    setSelectedProject(null);
    setPortfolioModalIsNew(false);
  };

  const openQuickJob = (job: ArtisanJob) => {
    setSelectedJob(job);
    setQuickJob(job);
    setQuoteMode(job.status === "PENDING" ? "create" : "summary");
  };

  const openQuickEarning = (earning: ArtisanEarningRow) => {
    setSelectedEarning(earning);
    setQuickEarning(earning);
  };

  const openEarningDetail = (earning: ArtisanEarningRow) => {
    setSelectedEarning(earning);
    setQuickEarning(null);
    selectView("earning-detail");
  };

  return (
    <DashboardAppShell
      id="artisan-core-flow"
      title="Artisan Studio"
      subtitle="Jobs, messages, portfolio, earnings, and subscription"
      eyebrow="ChapaWorks Studio"
      activeLabel={navItems.find((item) => item.id === view)?.label}
      items={navItems}
      activeView={view}
      onSelect={selectView}
      role="Artisan"
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      headerMeta={
        <>
          <StatusChip status="PENDING" />
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
            style={{
              borderColor: COLORS.primarySoft,
              background: COLORS.primaryTint,
              color: COLORS.primaryActive,
            }}
          >
            {profileCompletionPct}% profile complete
          </span>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          layout="position"
          initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(1.5px)" }}
          transition={routeTransition}
          className={
            view === "messages" ? "h-[calc(100vh-73px)] min-h-0" : "p-5 md:p-6"
          }
        >
          {artisanDataLoading && (
            <div
              className="mb-4 flex items-center gap-2 rounded-[14px] border bg-white px-4 py-3 text-[13px]"
              style={{ borderColor: COLORS.hairlineSoft, color: COLORS.muted }}
            >
              <Loader2
                size={15}
                className="animate-spin"
                style={{ color: COLORS.primary }}
              />{" "}
              Refreshing artisan workspace data…
            </div>
          )}

          {view === "overview" && (
            <div className="grid gap-6">
              <div className="grid gap-3">
                {showVerificationBanner && (
                  <div
                    className="flex flex-col gap-3 rounded-[18px] border p-4 md:flex-row md:items-center md:justify-between"
                    style={{ borderColor: isVerificationRejected ? "#fca5a5" : "#fde68a", background: isVerificationRejected ? "#fff1f2" : "#fffbeb" }}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white"
                        style={{ color: isVerificationRejected ? "#b91c1c" : "#92400e" }}
                      >
                        <FileCheck2 size={18} />
                      </span>
                      <span className="min-w-0">
                        <span
                          className="block text-[14px] font-semibold leading-[1.29]"
                          style={{ color: isVerificationRejected ? "#b91c1c" : "#92400e" }}
                        >
                          {isVerificationRejected ? "Verification rejected" : "Verification review pending"}
                        </span>
                        <span
                          className="mt-1 block text-[13px] leading-[1.23]"
                          style={{ color: COLORS.body }}
                        >
                          {isVerificationRejected
                            ? "Your verification was not approved. Update your documents and resubmit to appear in search results."
                            : "This alert only appears while verification requirements are not approved. Complete review before public search visibility."}
                        </span>
                        {isVerificationRejected && realRejectionReason && (
                          <span
                            className="mt-1 block text-[13px] font-semibold"
                            style={{ color: "#b91c1c" }}
                          >
                            Reason: {realRejectionReason}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
                      <button
                        onClick={() => {
                          setSettingsTab("verification");
                          selectView("settings");
                        }}
                        className="h-10 w-fit cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                        style={{ borderColor: "#fcd34d", color: COLORS.ink }}
                      >
                        Review documents
                      </button>
                      <button
                        onClick={() => { setVerificationBannerDismissed(true); try { localStorage.setItem("artisan-vb-dismissed", "1"); } catch {} }}
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
                        style={{ borderColor: "#fcd34d", color: "#92400e" }}
                        aria-label="Dismiss verification alert"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
                {profileCompletionPct < 100 && !profileBannerDismissed && (
                  <div
                    className="flex flex-col gap-3 rounded-[18px] border p-4 md:flex-row md:items-center md:justify-between"
                    style={{
                      borderColor: COLORS.primarySoft,
                      background: COLORS.primaryTint,
                    }}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white"
                        style={{ color: COLORS.primary }}
                      >
                        <CheckCircle2 size={18} />
                      </span>
                      <span className="min-w-0">
                        <span
                          className="block text-[14px] font-semibold leading-[1.29]"
                          style={{ color: COLORS.primaryActive }}
                        >
                          Profile is {profileCompletionPct}% complete
                        </span>
                        <span
                          className="mt-1 block text-[13px] leading-[1.23]"
                          style={{ color: COLORS.body }}
                        >
                          Temporary completion banner. It should disappear when
                          portfolio count, map coordinates, and verification
                          evidence are complete.
                        </span>
                        <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white">
                          <span
                            className="block rounded-full"
                            style={{ background: COLORS.primary, width: `${profileCompletionPct}%` }}
                          />
                        </span>
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
                      <button
                        onClick={() => selectView("portfolio")}
                        className="h-10 w-fit cursor-pointer rounded-lg bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                        style={{ color: COLORS.primaryActive }}
                      >
                        Improve profile
                      </button>
                      <button
                        onClick={() => setProfileBannerDismissed(true)}
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
                        style={{
                          borderColor: COLORS.primarySoft,
                          color: COLORS.primaryActive,
                        }}
                        aria-label="Dismiss profile completion alert"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardStatCard
                  label="Open opportunities"
                  value={String(
                    artisanJobRows.filter((job) => job.status === "PENDING")
                      .length,
                  )}
                  helper="Need quote or response"
                  icon={ReceiptText}
                />
                <DashboardStatCard
                  label="Active jobs"
                  value={String(
                    artisanJobRows.filter((job) => job.status === "ACTIVE")
                      .length,
                  )}
                  helper={`${artisanJobRows.filter((job) => job.status === "QUOTED").length} quoted`}
                  icon={ClipboardList}
                />
                <DashboardStatCard
                  label="Unread messages"
                  value="14"
                  helper="Respond today"
                  icon={MessageCircle}
                />
                <DashboardStatCard
                  label="Portfolio views"
                  value="486"
                  helper="Last 30 days"
                  icon={Eye}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Add job",
                    body: "Create standalone work.",
                    icon: Plus,
                    action: () => setAddJobModalOpen(true),
                    primary: true,
                  },
                  {
                    label: "Generate quote",
                    body: "Open quote workflow.",
                    icon: ReceiptText,
                    action: () => {
                      setQuoteMode("create");
                      setJobAndOpen(selectedJob);
                    },
                  },
                  {
                    label: "Reply",
                    body: "Open conversations.",
                    icon: MessageCircle,
                    action: () => selectView("messages"),
                  },
                  {
                    label: "Availability",
                    body: "Update settings.",
                    icon: Settings,
                    action: () => selectView("settings"),
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className={
                        action.primary
                          ? "group flex items-center gap-3 rounded-[14px] border px-3 py-3 text-left text-white transition-transform hover:-translate-y-0.5"
                          : "group flex items-center gap-3 rounded-[14px] border bg-white px-3 py-3 text-left transition-transform hover:-translate-y-0.5 hover:bg-[#f7f7f7]"
                      }
                      style={
                        action.primary
                          ? {
                              borderColor: COLORS.primary,
                              background: COLORS.primary,
                              boxShadow: softShadow,
                            }
                          : {
                              borderColor: COLORS.hairlineSoft,
                              color: COLORS.ink,
                              boxShadow: softShadow,
                            }
                      }
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                        style={
                          action.primary
                            ? {
                                background: "rgba(255,255,255,0.18)",
                                color: COLORS.canvas,
                              }
                            : {
                                background: COLORS.primaryTint,
                                color: COLORS.primary,
                              }
                        }
                      >
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold leading-[1.29]">
                          {action.label}
                        </span>
                        <span
                          className="mt-0.5 block truncate text-[12px] leading-[1.33]"
                          style={{
                            color: action.primary
                              ? "rgba(255,255,255,0.82)"
                              : COLORS.muted,
                          }}
                        >
                          {action.body}
                        </span>
                      </span>
                      <ChevronRight
                        size={15}
                        className="shrink-0 transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="grid gap-5">
                  <div
                    className="rounded-[18px] border bg-white p-4"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p
                          className="text-[16px] font-semibold leading-[1.25]"
                          style={{ color: COLORS.ink }}
                        >
                          Recent jobs
                        </p>
                        <p
                          className="text-[13px] leading-[1.23]"
                          style={{ color: COLORS.muted }}
                        >
                          Active work, pending quotes, and client requests.
                        </p>
                      </div>
                      <button
                        onClick={() => selectView("jobs")}
                        className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline"
                        style={{ color: COLORS.ink }}
                      >
                        View all
                      </button>
                    </div>
                    <div className="grid gap-2">
                      {artisanJobRows.slice(0, 4).map((job, index) => (
                        <div
                          key={job.id}
                          className="grid gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7] md:grid-cols-[1fr_auto] md:items-center"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background:
                              index % 2 === 1
                                ? COLORS.surfaceSoft
                                : COLORS.canvas,
                          }}
                        >
                          <button
                            onClick={() => openQuickJob(job)}
                            className="min-w-0 cursor-pointer text-left"
                          >
                            <span
                              className="block truncate text-[14px] font-semibold leading-[1.29]"
                              style={{ color: COLORS.ink }}
                            >
                              {job.title}
                            </span>
                            <span
                              className="mt-1 block truncate text-[13px] leading-[1.23]"
                              style={{ color: COLORS.muted }}
                            >
                              {job.client} · {job.location}
                            </span>
                          </button>
                          <div className="flex items-center gap-2 justify-self-start md:justify-self-end">
                            <StatusChip status={job.status} />
                            <button
                              onClick={() => openQuickJob(job)}
                              className="h-9 cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                              style={{
                                borderColor: COLORS.hairline,
                                color: COLORS.ink,
                              }}
                            >
                              Quick view
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div
                      className="rounded-[18px] border bg-white p-4"
                      style={{ borderColor: COLORS.hairlineSoft }}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p
                          className="text-[16px] font-semibold leading-[1.25]"
                          style={{ color: COLORS.ink }}
                        >
                          Quote pipeline
                        </p>
                        <ReceiptText
                          size={18}
                          style={{ color: COLORS.primary }}
                        />
                      </div>
                      <div className="grid gap-3">
                        {[
                          [
                            "Requests needing quote",
                            String(
                              artisanJobRows.filter(
                                (job) => job.status === "PENDING",
                              ).length,
                            ),
                            "Create itemized quote",
                          ],
                          [
                            "Quotes awaiting client",
                            String(
                              artisanJobRows.filter(
                                (job) => job.status === "QUOTED",
                              ).length,
                            ),
                            "Follow up in messages",
                          ],
                          [
                            "Accepted ready to start",
                            "1",
                            "Start job from thread",
                          ],
                        ].map(([label, value, helper]) => (
                          <button
                            key={label}
                            onClick={() => selectView("messages")}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                            style={{ borderColor: COLORS.hairlineSoft }}
                          >
                            <span className="min-w-0">
                              <span
                                className="block text-[14px] font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                {label}
                              </span>
                              <span
                                className="mt-1 block text-[13px]"
                                style={{ color: COLORS.muted }}
                              >
                                {helper}
                              </span>
                            </span>
                            <span
                              className="grid h-9 min-w-9 place-items-center rounded-full px-2 text-[13px] font-semibold text-white"
                              style={{ background: COLORS.primary }}
                            >
                              {value}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      className="rounded-[18px] border bg-white p-4"
                      style={{ borderColor: COLORS.hairlineSoft }}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p
                          className="text-[16px] font-semibold leading-[1.25]"
                          style={{ color: COLORS.ink }}
                        >
                          Upcoming commitments
                        </p>
                        <CalendarDays
                          size={18}
                          style={{ color: COLORS.primary }}
                        />
                      </div>
                      <div className="grid gap-2">
                        {[
                          [
                            "Tomorrow",
                            "Kitchen sink repair",
                            "Kilimani · 9:00 AM",
                          ],
                          [
                            "Thu",
                            "Cabinet handle install",
                            "Westlands · 2:00 PM",
                          ],
                          [
                            "Fri",
                            "Tile repair inspection",
                            "Ruiru · Pending confirmation",
                          ],
                        ].map(([day, title, meta]) => (
                          <div
                            key={`${day}-${title}`}
                            className="grid grid-cols-[52px_1fr] gap-3 rounded-[14px] border p-3"
                            style={{
                              borderColor: COLORS.hairlineSoft,
                              background: COLORS.surfaceSoft,
                            }}
                          >
                            <span
                              className="rounded-full bg-white px-2 py-1 text-center text-[12px] font-semibold"
                              style={{ color: COLORS.primaryActive }}
                            >
                              {day}
                            </span>
                            <span className="min-w-0">
                              <span
                                className="block truncate text-[14px] font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                {title}
                              </span>
                              <span
                                className="mt-1 block truncate text-[13px]"
                                style={{ color: COLORS.muted }}
                              >
                                {meta}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="grid gap-5">
                  <div
                    className="rounded-[18px] border bg-white p-4"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p
                          className="text-[16px] font-semibold leading-[1.25]"
                          style={{ color: COLORS.ink }}
                        >
                          Recent activity
                        </p>
                        <p
                          className="mt-1 text-[13px] leading-[1.23]"
                          style={{ color: COLORS.muted }}
                        >
                          Latest client and marketplace events.
                        </p>
                      </div>
                      <Activity size={18} style={{ color: COLORS.primary }} />
                    </div>
                    <div className="grid gap-3">
                      {[
                        ["Quote viewed", "Miriam opened quote v1", "12m"],
                        ["New message", "David asked about timing", "38m"],
                        [
                          "Portfolio view spike",
                          "Cabinet refit gained 18 views",
                          "2h",
                        ],
                        [
                          "Saved by client",
                          "New client saved your profile",
                          "1d",
                        ],
                      ].map(([label, body, time], index) => (
                        <div
                          key={label}
                          className="grid grid-cols-[10px_1fr_auto] gap-3 rounded-[14px] p-2"
                          style={{
                            background:
                              index % 2 === 1
                                ? COLORS.surfaceSoft
                                : COLORS.canvas,
                          }}
                        >
                          <span
                            className="mt-2 h-2.5 w-2.5 rounded-full"
                            style={{
                              background:
                                index === 0 ? COLORS.primary : COLORS.hairline,
                            }}
                          />
                          <span className="min-w-0">
                            <span
                              className="block truncate text-[14px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              {label}
                            </span>
                            <span
                              className="mt-0.5 block truncate text-[13px]"
                              style={{ color: COLORS.muted }}
                            >
                              {body}
                            </span>
                          </span>
                          <span
                            className="text-[12px]"
                            style={{ color: COLORS.mutedSoft }}
                          >
                            {time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-[18px] border bg-white p-4"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p
                        className="text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        Portfolio performance
                      </p>
                      <Images size={18} style={{ color: COLORS.primary }} />
                    </div>
                    <div className="grid gap-3">
                      {[
                        [
                          "Custom kitchen cabinet refit",
                          "182 views",
                          "Featured",
                        ],
                        ["Floating shelves", "117 views", "Published"],
                        ["Wardrobe repair", "Draft", "Needs photos"],
                      ].map(([title, metric, status]) => (
                        <button
                          key={title}
                          onClick={() => selectView("portfolio")}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <span className="min-w-0">
                            <span
                              className="block truncate text-[14px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              {title}
                            </span>
                            <span
                              className="mt-1 block text-[13px]"
                              style={{ color: COLORS.muted }}
                            >
                              {status}
                            </span>
                          </span>
                          <span
                            className="shrink-0 text-[13px] font-semibold"
                            style={{ color: COLORS.primaryActive }}
                          >
                            {metric}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {view === "jobs" && (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardStatCard
                  label="Requested jobs"
                  value={String(
                    artisanJobRows.filter((job) => job.status === "PENDING")
                      .length,
                  )}
                  helper="Need quote"
                  icon={ReceiptText}
                />
                <DashboardStatCard
                  label="Quoted jobs"
                  value={String(
                    artisanJobRows.filter((job) => job.status === "QUOTED")
                      .length,
                  )}
                  helper="Awaiting client"
                  icon={FileText}
                />
                <DashboardStatCard
                  label="Active jobs"
                  value={String(
                    artisanJobRows.filter((job) => job.status === "ACTIVE")
                      .length,
                  )}
                  helper="In progress"
                  icon={ClipboardList}
                />
                <DashboardStatCard
                  label="Projected value"
                  value={formatKes(
                    artisanJobRows.reduce(
                      (sum, job) =>
                        sum +
                        Number(
                          (job.quote === "Not sent"
                            ? job.budget
                            : job.quote
                          ).replace(/[^0-9]/g, ""),
                        ),
                      0,
                    ),
                  )}
                  helper="Open job pipeline"
                  icon={TrendingUp}
                />
              </div>
              <div>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <FluidPillTabs
                    id="artisan-jobs-tabs"
                    value={jobTab}
                    onChange={setJobTab}
                    options={[
                      { id: "all", label: "All" },
                      { id: "requested", label: "Requested" },
                      { id: "quoted", label: "Quoted" },
                      { id: "active", label: "Active" },
                    ]}
                  />
                  <button
                    onClick={() => setAddJobModalOpen(true)}
                    className="inline-flex h-10 w-fit shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                    style={{ background: COLORS.primary }}
                  >
                    <Plus size={15} /> Add job
                  </button>
                </div>
                <DashboardDataList
                  title="Job pipeline"
                  subtitle="Search jobs by client, location, quote state, status, or scope. Click a row for a quick slideover, or use View for the full job detail route."
                  rows={artisanJobRows.filter(
                    (job) =>
                      jobTab === "all" ||
                      (jobTab === "requested" && job.status === "PENDING") ||
                      (jobTab === "quoted" && job.status === "QUOTED") ||
                      (jobTab === "active" && job.status === "ACTIVE"),
                  )}
                  rowKey={(job) => job.id}
                  getSearchText={(job) =>
                    `${job.title} ${job.client} ${job.location} ${job.description} ${job.status}`
                  }
                  sortOptions={[
                    {
                      id: "recent",
                      label: "Sort: Recent",
                      sort: (a, b) => b.id.localeCompare(a.id),
                    },
                    {
                      id: "client",
                      label: "Sort: Client",
                      sort: (a, b) => a.client.localeCompare(b.client),
                    },
                    {
                      id: "status",
                      label: "Sort: Status",
                      sort: (a, b) => a.status.localeCompare(b.status),
                    },
                  ]}
                  columns={[
                    {
                      header: "Job",
                      className: "col-span-1",
                      render: (job) => (
                        <span>
                          <span
                            className="block truncate font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {job.title}
                          </span>
                          <span
                            className="mt-1 block truncate text-[13px]"
                            style={{ color: COLORS.muted }}
                          >
                            {job.description}
                          </span>
                        </span>
                      ),
                    },
                    {
                      header: "Client",
                      render: (job) => (
                        <span style={{ color: COLORS.body }}>{job.client}</span>
                      ),
                    },
                    {
                      header: "Status",
                      render: (job) => <StatusChip status={job.status} />,
                    },
                    {
                      header: "Quote",
                      render: (job) => (
                        <span
                          className="font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {job.quote}
                        </span>
                      ),
                    },
                  ]}
                  onRowClick={openQuickJob}
                  onView={setJobAndOpen}
                />
              </div>
            </div>
          )}

          {view === "job-detail" && (
            <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectView("jobs")}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                    style={{ borderColor: COLORS.hairlineSoft, color: COLORS.body }}
                  >
                    <ChevronLeft size={14} /> Jobs
                  </button>
                  <span style={{ color: COLORS.hairline }}>/</span>
                  <span className="truncate text-[13px]" style={{ color: COLORS.muted }}>{selectedJob.title}</span>
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h4
                        className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                        style={{ color: COLORS.ink }}
                      >
                        {selectedJob.title}
                      </h4>
                      <p
                        className="mt-2 text-[14px] leading-[1.43]"
                        style={{ color: COLORS.muted }}
                      >
                        {selectedJob.client} · {selectedJob.location}
                      </p>
                    </div>
                    <StatusChip status={selectedJob.status} />
                  </div>
                  <p
                    className="text-[16px] leading-[1.5]"
                    style={{ color: COLORS.body }}
                  >
                    {selectedJob.description}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Client budget", selectedJob.budget],
                      ["Current quote", selectedJob.quote],
                      ["Conversation", "Open thread"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[14px] border p-3"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <p
                          className="text-[13px] leading-[1.23]"
                          style={{ color: COLORS.muted }}
                        >
                          {label}
                        </p>
                        <p
                          className="mt-1 text-[16px] font-semibold leading-[1.25]"
                          style={{ color: COLORS.ink }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="min-w-0 overflow-hidden rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p
                        className="text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        Quote workflow
                      </p>
                      <p
                        className="text-[13px] leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        Create, revise, or review quote state.
                      </p>
                    </div>
                    <FluidPillTabs
                      id="artisan-quote-workflow-tabs"
                      value={quoteMode}
                      onChange={setQuoteMode}
                      options={[
                        { id: "summary", label: "Summary" },
                        { id: "create", label: "Create" },
                        { id: "revision", label: "Revision" },
                      ]}
                    />
                  </div>
                  {quoteMode === "summary" ? (
                    <div
                      className="rounded-[14px] border p-4"
                      style={{
                        borderColor: COLORS.hairlineSoft,
                        background: COLORS.surfaceSoft,
                      }}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p
                            className="text-[14px] font-semibold leading-[1.29]"
                            style={{ color: COLORS.ink }}
                          >
                            Quote sent
                          </p>
                          <p
                            className="mt-1 text-[14px] leading-[1.43]"
                            style={{ color: COLORS.muted }}
                          >
                            Amount: {selectedJob.quote}. Awaiting client
                            response or revision request.
                          </p>
                        </div>
                        <button
                          onClick={() => setQuoteMode("revision")}
                          className="h-10 cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                          style={{
                            borderColor: COLORS.hairline,
                            color: COLORS.ink,
                          }}
                        >
                          Revise with items
                        </button>
                      </div>
                    </div>
                  ) : (
                    <QuoteWorkflowBuilder
                      selectedJob={selectedJob}
                      mode={quoteMode}
                      onSubmit={(total) => {
                        const formatted = formatKes(total);
                        setArtisanJobRows((current) =>
                          current.map((job) =>
                            job.id === selectedJob.id
                              ? { ...job, quote: formatted, status: "QUOTED" as const }
                              : job,
                          ),
                        );
                        setSelectedJob((prev) => ({ ...prev, quote: formatted, status: "QUOTED" as const }));
                      }}
                    />
                  )}
                </div>
              </div>

              <aside className="min-w-0 space-y-4">
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="text-[16px] font-semibold leading-[1.25]"
                    style={{ color: COLORS.ink }}
                  >
                    Available actions
                  </p>
                  <div className="mt-4 grid gap-2">
                    {[
                      {
                        label: "Message client",
                        disabled: false,
                        action: () => selectView("messages"),
                      },
                      {
                        label: "Start job",
                        disabled:
                          selectedJob.status !== "QUOTED" &&
                          selectedJob.status !== "PENDING",
                        action: () => updateJobStatus(selectedJob, "ACTIVE"),
                      },
                      {
                        label: "Mark complete",
                        disabled: selectedJob.status !== "ACTIVE",
                        action: () => updateJobStatus(selectedJob, "COMPLETED"),
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        disabled={item.disabled}
                        className="h-11 cursor-pointer rounded-lg border text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          borderColor: COLORS.hairline,
                          color: COLORS.ink,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Cash-only testing mode
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-[1.43]"
                    style={{ color: COLORS.muted }}
                  >
                    Job payments show informational cards. M-Pesa job payment
                    buttons stay disabled during testing.
                  </p>
                </div>
              </aside>
            </div>
          )}

          {view === "messages" && (
            <DashboardMessagesPane
              jobs={artisanJobRows}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              getContactName={(job) => job.client}
              role="artisan"
              onCreateJobFromQuote={createJobFromConversationQuote}
            />
          )}

          {view === "portfolio" && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-4">
                <DashboardStatCard
                  label="Published projects"
                  value={String(
                    portfolioRows.filter(
                      (project) => project.status === "Published",
                    ).length,
                  )}
                  helper="Visible on public profile"
                  icon={Images}
                />
                <DashboardStatCard
                  label="Draft projects"
                  value={String(
                    portfolioRows.filter(
                      (project) => project.status === "Draft",
                    ).length,
                  )}
                  helper="Needs photos or copy"
                  icon={FileText}
                />
                <DashboardStatCard
                  label="Portfolio views"
                  value="486"
                  helper="Last 30 days"
                  icon={Eye}
                />
                <DashboardStatCard
                  label="Featured slot"
                  value="1/1"
                  helper="Premium placement"
                  icon={Sparkles}
                />
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p
                  className="text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  Click a card to inspect details. Use Edit to update the
                  project, or preview how it appears to customers.
                </p>
                <button
                  onClick={openPortfolioCreate}
                  className="h-11 w-fit cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  Add project
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {portfolioRows.map((project) => (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-[18px] border bg-white transition-transform hover:-translate-y-0.5"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      boxShadow: softShadow,
                    }}
                  >
                    <button
                      onClick={() => openPortfolioDetail(project)}
                      className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden text-left"
                      style={{ background: project.gradient }}
                    >
                      <div
                        className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        {project.status}
                      </div>
                      {project.featured && (
                        <div
                          className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                          style={{ background: COLORS.primary }}
                        >
                          Featured
                        </div>
                      )}
                      <div
                        className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: COLORS.ink }}
                      >
                        <Eye size={13} /> Detail
                      </div>
                    </button>
                    <div className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="truncate text-[14px] font-semibold leading-[1.29]"
                            style={{ color: COLORS.ink }}
                          >
                            {project.title}
                          </p>
                          <p
                            className="mt-1 text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            {project.category} · {project.duration}
                          </p>
                        </div>
                      </div>
                      <p
                        className="line-clamp-2 text-[13px] leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        {project.description}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openPortfolioEdit(project)}
                          className="h-9 cursor-pointer rounded-lg border text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                          style={{
                            borderColor: COLORS.hairline,
                            color: COLORS.ink,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setCustomerPreviewProject(project)}
                          className="h-9 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                          style={{ background: COLORS.primary }}
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {view === "earnings" && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-4">
                <DashboardStatCard
                  label="Gross earnings"
                  value={formatKes(
                    earningRows.reduce(
                      (sum, row) =>
                        sum + Number(row.amount.replace(/[^0-9]/g, "")),
                      0,
                    ),
                  )}
                  helper="Cash job records"
                  icon={CircleDollarSign}
                />
                <DashboardStatCard
                  label="Net earnings"
                  value={formatKes(
                    earningRows.reduce(
                      (sum, row) =>
                        sum + Number(row.net.replace(/[^0-9]/g, "")),
                      0,
                    ),
                  )}
                  helper="After commission"
                  icon={WalletCards}
                />
                <DashboardStatCard
                  label="Pending payout"
                  value={formatKes(
                    earningRows
                      .filter((row) => row.status !== "COMPLETED")
                      .reduce(
                        (sum, row) =>
                          sum + Number(row.net.replace(/[^0-9]/g, "")),
                        0,
                      ),
                  )}
                  helper="Awaiting completion"
                  icon={ReceiptText}
                />
                <DashboardStatCard
                  label="Commission"
                  value="10%"
                  helper="Current plan"
                  icon={BarChart3}
                />
              </div>
              <DashboardDataList
                title="Earnings ledger"
                subtitle="Search earnings by job, client, amount, commission, status, or date."
                rows={earningRows}
                rowKey={(row) => row.id}
                getSearchText={(row) =>
                  `${row.item} ${row.client} ${row.amount} ${row.net} ${row.status} ${row.date}`
                }
                filters={[
                  {
                    id: "status",
                    label: "Status",
                    allLabel: "All statuses",
                    options: ["PENDING", "ACTIVE", "COMPLETED"],
                    getValue: (row) => row.status,
                  },
                ]}
                sortOptions={[
                  {
                    id: "recent",
                    label: "Sort: Recent",
                    sort: (a, b) => b.id.localeCompare(a.id),
                  },
                  {
                    id: "client",
                    label: "Sort: Client",
                    sort: (a, b) => a.client.localeCompare(b.client),
                  },
                  {
                    id: "amount",
                    label: "Sort: Amount",
                    sort: (a, b) =>
                      Number(b.net.replace(/[^0-9]/g, "")) -
                      Number(a.net.replace(/[^0-9]/g, "")),
                  },
                ]}
                columns={[
                  {
                    header: "Job",
                    render: (row) => (
                      <span>
                        <span
                          className="block truncate font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {row.item}
                        </span>
                        <span
                          className="mt-1 block truncate text-[13px]"
                          style={{ color: COLORS.muted }}
                        >
                          {row.client} · {row.date}
                        </span>
                      </span>
                    ),
                  },
                  {
                    header: "Gross",
                    render: (row) => (
                      <span style={{ color: COLORS.body }}>{row.amount}</span>
                    ),
                  },
                  {
                    header: "Commission",
                    render: (row) => (
                      <span style={{ color: COLORS.body }}>
                        {row.commission}
                      </span>
                    ),
                  },
                  {
                    header: "Net",
                    render: (row) => (
                      <span
                        className="font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        {row.net}
                      </span>
                    ),
                  },
                ]}
                onRowClick={openQuickEarning}
                onView={openEarningDetail}
                viewLabel="Inspect"
              />
            </div>
          )}

          {view === "earning-detail" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectView("earnings")}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                    style={{ borderColor: COLORS.hairlineSoft, color: COLORS.body }}
                  >
                    <ChevronLeft size={14} /> Earnings
                  </button>
                  <span style={{ color: COLORS.hairline }}>/</span>
                  <span className="truncate text-[13px]" style={{ color: COLORS.muted }}>{selectedEarning.item}</span>
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p
                        className="text-[13px] font-medium leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        Earning detail
                      </p>
                      <h4
                        className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                        style={{ color: COLORS.ink }}
                      >
                        {selectedEarning.item}
                      </h4>
                      <p
                        className="mt-2 text-[14px] leading-[1.43]"
                        style={{ color: COLORS.muted }}
                      >
                        {selectedEarning.client} · {selectedEarning.date}
                      </p>
                    </div>
                    <StatusChip status={selectedEarning.status} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Gross", selectedEarning.amount],
                      ["Commission", selectedEarning.commission],
                      ["Net", selectedEarning.net],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[14px] border p-3"
                        style={{
                          borderColor: COLORS.hairlineSoft,
                          background: COLORS.surfaceSoft,
                        }}
                      >
                        <p
                          className="text-[13px] leading-[1.23]"
                          style={{ color: COLORS.muted }}
                        >
                          {label}
                        </p>
                        <p
                          className="mt-1 text-[16px] font-semibold leading-[1.25]"
                          style={{ color: COLORS.ink }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="text-[16px] font-semibold leading-[1.25]"
                    style={{ color: COLORS.ink }}
                  >
                    Ledger breakdown
                  </p>
                  <div className="mt-4 grid gap-3">
                    {[
                      [
                        "Client payment record",
                        selectedEarning.amount,
                        "Cash-mode job value captured for reporting.",
                      ],
                      [
                        "Marketplace commission",
                        selectedEarning.commission,
                        "Calculated from the active subscription plan.",
                      ],
                      [
                        "Artisan receivable",
                        selectedEarning.net,
                        "Net earning after commission.",
                      ],
                    ].map(([label, amount, body]) => (
                      <div
                        key={label}
                        className="grid gap-3 rounded-[14px] border p-4 md:grid-cols-[1fr_auto] md:items-center"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <span>
                          <span
                            className="block text-[14px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {label}
                          </span>
                          <span
                            className="mt-1 block text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            {body}
                          </span>
                        </span>
                        <span
                          className="text-[14px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Related job
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-[1.43]"
                    style={{ color: COLORS.muted }}
                  >
                    Open the original job workflow for quote, messages, and
                    completion state.
                  </p>
                  <button
                    onClick={() => setJobAndOpen(artisanJobs[0])}
                    className="mt-4 h-11 w-full cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                    style={{ background: COLORS.primary }}
                  >
                    Open related job
                  </button>
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Payout state
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-[1.43]"
                    style={{ color: COLORS.muted }}
                  >
                    Payouts remain informational while job payments are
                    cash-only in testing.
                  </p>
                  <button
                    onClick={() => selectView("earnings")}
                    className="mt-4 h-11 w-full cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                    style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                  >
                    Back to earnings
                  </button>
                </div>
              </aside>
            </div>
          )}

          {view === "subscription" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    borderColor: COLORS.primarySoft,
                    background: COLORS.primaryTint,
                  }}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p
                        className="text-[14px] font-medium leading-[1.29]"
                        style={{ color: COLORS.primaryActive }}
                      >
                        Current plan
                      </p>
                      <h4
                        className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                        style={{ color: COLORS.ink }}
                      >
                        Premium Artisan
                      </h4>
                      <p
                        className="mt-2 max-w-[620px] text-[14px] leading-[1.43]"
                        style={{ color: COLORS.body }}
                      >
                        Priority placement, premium badge, larger portfolio
                        capacity, analytics, and lower commission.
                      </p>
                    </div>
                    <span
                      className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                      style={{
                        borderColor: COLORS.primarySoft,
                        background: COLORS.canvas,
                        color: COLORS.primaryActive,
                      }}
                    >
                      Renews Jun 01
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Monthly fee", "KES 150"],
                      ["Commission", "8%"],
                      ["Portfolio limit", "24 projects"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[14px] border bg-white p-3"
                        style={{ borderColor: COLORS.primarySoft }}
                      >
                        <p
                          className="text-[13px]"
                          style={{ color: COLORS.muted }}
                        >
                          {label}
                        </p>
                        <p
                          className="mt-1 text-[16px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Starter",
                      price: "Free",
                      commission: "10%",
                      features: [
                        "Basic profile",
                        "6 portfolio projects",
                        "Standard placement",
                      ],
                    },
                    {
                      title: "Premium",
                      price: "KES 150/mo",
                      commission: "8%",
                      features: [
                        "Priority placement",
                        "Premium badge",
                        "24 portfolio projects",
                        "Profile analytics",
                      ],
                    },
                  ].map((plan) => (
                    <div
                      key={plan.title}
                      className="rounded-[18px] border bg-white p-5"
                      style={{
                        borderColor:
                          plan.title === "Premium"
                            ? COLORS.primarySoft
                            : COLORS.hairlineSoft,
                        boxShadow:
                          plan.title === "Premium" ? softShadow : "none",
                      }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p
                            className="text-[16px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {plan.title}
                          </p>
                          <p
                            className="mt-1 text-[22px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {plan.price}
                          </p>
                        </div>
                        <span
                          className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background: COLORS.surfaceSoft,
                            color: COLORS.body,
                          }}
                        >
                          {plan.commission}
                        </span>
                      </div>
                      <div
                        className="grid gap-2 text-[14px]"
                        style={{ color: COLORS.body }}
                      >
                        {plan.features.map((feature) => (
                          <p key={feature} className="flex gap-2">
                            <CheckCircle2
                              size={15}
                              className="mt-0.5 shrink-0"
                              style={{ color: COLORS.primary }}
                            />{" "}
                            {feature}
                          </p>
                        ))}
                      </div>
                      <button
                        className={
                          plan.title === "Premium"
                            ? "mt-5 h-11 w-full cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white"
                            : "mt-5 h-11 w-full cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                        }
                        style={
                          plan.title === "Premium"
                            ? { background: COLORS.primary }
                            : {
                                borderColor: COLORS.hairline,
                                color: COLORS.ink,
                              }
                        }
                      >
                        {plan.title === "Premium"
                          ? "Current plan"
                          : "Downgrade preview"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="space-y-4">
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Billing method
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-[1.43]"
                    style={{ color: COLORS.muted }}
                  >
                    M-Pesa subscription payments are enabled. Job payments
                    remain cash-only during testing.
                  </p>
                  <button
                    onClick={() => setPaymentMethodModalOpen(true)}
                    className="mt-4 h-11 w-full cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                    style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                  >
                    Update payment method
                  </button>
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Plan impact
                  </p>
                  <div
                    className="mt-3 grid gap-2 text-[14px] leading-[1.43]"
                    style={{ color: COLORS.body }}
                  >
                    <p className="flex gap-2">
                      <CheckCircle2
                        size={16}
                        style={{ color: COLORS.primary }}
                      />{" "}
                      Higher search visibility
                    </p>
                    <p className="flex gap-2">
                      <CheckCircle2
                        size={16}
                        style={{ color: COLORS.primary }}
                      />{" "}
                      Featured badge on profile cards
                    </p>
                    <p className="flex gap-2">
                      <CheckCircle2
                        size={16}
                        style={{ color: COLORS.primary }}
                      />{" "}
                      Lower marketplace commission
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {view === "settings" && (
            <div className="min-w-0">
              <div
                className="overflow-hidden rounded-[18px] border bg-white"
                style={{ borderColor: COLORS.hairlineSoft }}
              >
                <div
                  className="border-b p-4"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="min-w-0">
                      <p
                        className="text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        Artisan settings
                      </p>
                      <p
                        className="mt-1 max-w-[760px] text-[13px] leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        Manage public profile details, searchable skills,
                        service coverage, verification evidence, and
                        notification preferences.
                      </p>
                    </div>
                    <div className="max-w-fit overflow-visible pb-0">
                      <FluidPillTabs
                        id="artisan-settings-tabs"
                        value={settingsTab}
                        onChange={setSettingsTab}
                        options={artisanSettingsTabs}
                        dense
                      />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 p-4 md:p-5">
                  {settingsTab === "profile" && (
                    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                      <div className="grid min-w-0 gap-3 md:grid-cols-2">
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Display name
                          </span>
                          <input
                            defaultValue={_verifCtx?.displayName ?? "Grace Wanjiku"}
                            className="h-11 min-w-0 rounded-lg border px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          />
                        </label>
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Primary craft
                          </span>
                          <input
                            defaultValue={_verifCtx?.artisanProfile?.profession ?? "Carpenter"}
                            className="h-11 min-w-0 rounded-lg border px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          />
                        </label>
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Hourly rate
                          </span>
                          <input
                            defaultValue={_verifCtx?.artisanProfile?.hourlyRate
                              ? `KES ${_verifCtx.artisanProfile.hourlyRate.toLocaleString('en-KE')}`
                              : "KES 2,600"}
                            className="h-11 min-w-0 rounded-lg border px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          />
                        </label>
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Availability
                          </span>
                          <select
                            defaultValue="Available now"
                            className="h-11 min-w-0 rounded-lg border bg-white px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          >
                            <option>Available now</option>
                            <option>Booked this week</option>
                            <option>Hidden from search</option>
                          </select>
                        </label>
                        <label className="grid min-w-0 gap-1.5 md:col-span-2">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Bio
                          </span>
                          <textarea
                            defaultValue={_verifCtx?.artisanProfile?.bio ?? "Carpenter focused on cabinets, custom beds, shelving, repairs, and clean finishing for homes and small businesses."}
                            className="min-h-24 rounded-lg border px-3 py-2 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          />
                        </label>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => { setProfileSaved(true); window.setTimeout(() => setProfileSaved(false), 2800); }}
                          className="h-10 flex-1 cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                          style={{ background: COLORS.primary }}
                        >
                          Save profile
                        </button>
                        {profileSaved && (
                          <p className="text-[12px] font-semibold" style={{ color: COLORS.primaryActive }}>Saved!</p>
                        )}
                      </div>
                      <aside
                        className="rounded-[18px] border p-4"
                        style={{
                          borderColor: COLORS.primarySoft,
                          background: COLORS.primaryTint,
                        }}
                      >
                        <p
                          className="text-[15px] font-semibold"
                          style={{ color: COLORS.primaryActive }}
                        >
                          Profile completion
                        </p>
                        <p
                          className="mt-2 text-[13px] leading-[1.23]"
                          style={{ color: COLORS.body }}
                        >
                          {profileCompletionPct}% complete. Add portfolio work and confirm service
                          coordinates.
                        </p>
                        <span className="mt-4 block h-2 overflow-hidden rounded-full bg-white">
                          <span
                            className="block rounded-full"
                            style={{ background: COLORS.primary, width: `${profileCompletionPct}%` }}
                          />
                        </span>
                        <button
                          onClick={() => selectView("portfolio")}
                          className="mt-4 h-10 w-full cursor-pointer rounded-lg bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                          style={{ color: COLORS.primaryActive }}
                        >
                          Improve portfolio
                        </button>
                      </aside>
                    </div>
                  )}

                  {settingsTab === "specializations" && (
                    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                      <div
                        className="min-w-0 overflow-hidden rounded-[16px] border"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <div
                          className="border-b px-4 py-3"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background: COLORS.surfaceSoft,
                          }}
                        >
                          <p
                            className="text-[15px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            Specialization library
                          </p>
                          <p
                            className="mt-1 text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            Compact skill cards avoid table overflow while
                            keeping row actions visible.
                          </p>
                        </div>
                        <div className="grid gap-2 p-3">
                          {[
                            {
                              id: "skill-001",
                              name: "Cabinet installation",
                              category: "Carpentry",
                              level: "Level 5",
                              status: "VERIFIED" as const,
                            },
                            {
                              id: "skill-002",
                              name: "Floating shelves",
                              category: "Interior fittings",
                              level: "Level 4",
                              status: "ACTIVE" as const,
                            },
                            {
                              id: "skill-003",
                              name: "Door repair",
                              category: "Repair work",
                              level: "Level 4",
                              status: "ACTIVE" as const,
                            },
                            {
                              id: "skill-004",
                              name: "Waterproofing",
                              category: "Masonry",
                              level: "Level 3",
                              status: "REVIEW" as const,
                            },
                          ].map((skill, index) => (
                            <div
                              key={skill.id}
                              className="grid min-w-0 gap-3 rounded-[14px] border p-3 md:grid-cols-[minmax(0,1fr)_120px_auto] md:items-center"
                              style={{
                                borderColor: COLORS.hairlineSoft,
                                background:
                                  index % 2 === 1
                                    ? COLORS.surfaceSoft
                                    : COLORS.canvas,
                              }}
                            >
                              <button
                                onClick={() => setSkillModalOpen(true)}
                                className="min-w-0 cursor-pointer text-left"
                              >
                                <span
                                  className="block truncate text-[14px] font-semibold"
                                  style={{ color: COLORS.ink }}
                                >
                                  {skill.name}
                                </span>
                                <span
                                  className="mt-1 block truncate text-[13px]"
                                  style={{ color: COLORS.muted }}
                                >
                                  {skill.category} · {skill.level}
                                </span>
                              </button>
                              <StatusChip status={skill.status} />
                              <button
                                onClick={() => setSkillModalOpen(true)}
                                className="h-9 w-fit cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7] md:justify-self-end"
                                style={{
                                  borderColor: COLORS.hairline,
                                  color: COLORS.ink,
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <aside
                        className="rounded-[18px] border p-4"
                        style={{
                          borderColor: COLORS.primarySoft,
                          background: COLORS.primaryTint,
                        }}
                      >
                        <p
                          className="text-[15px] font-semibold"
                          style={{ color: COLORS.primaryActive }}
                        >
                          Add searchable skill
                        </p>
                        <p
                          className="mt-2 text-[13px] leading-[1.23]"
                          style={{ color: COLORS.body }}
                        >
                          Add skills with evidence notes so clients can find you
                          by specific work types.
                        </p>
                        <button
                          onClick={() => setSkillModalOpen(true)}
                          className="mt-4 h-10 w-full cursor-pointer rounded-lg px-3 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                          style={{ background: COLORS.primary }}
                        >
                          Add skill
                        </button>
                      </aside>
                    </div>
                  )}

                  {settingsTab === "location" && (
                    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                      <div className="grid min-w-0 gap-3 md:grid-cols-2">
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            County
                          </span>
                          <select
                            defaultValue={_verifCtx?.artisanProfile?.county ?? "Kiambu"}
                            className="h-11 min-w-0 cursor-pointer rounded-lg border bg-white px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          >
                            {["Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa",
                              "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
                              "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu",
                              "Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa",
                              "Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua",
                              "Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi",
                              "Trans-Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"
                            ].map((county) => (
                              <option key={county} value={county}>{county}</option>
                            ))}
                          </select>
                        </label>
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Town / city
                          </span>
                          <input
                            defaultValue={_verifCtx?.artisanProfile?.city ?? "Kikuyu"}
                            className="h-11 min-w-0 rounded-lg border px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          />
                        </label>
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Travel radius
                          </span>
                          <select
                            defaultValue="25 km"
                            className="h-11 min-w-0 rounded-lg border bg-white px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          >
                            <option>10 km</option>
                            <option>25 km</option>
                            <option>50 km</option>
                            <option>County-wide</option>
                          </select>
                        </label>
                        <label className="grid min-w-0 gap-1.5">
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: COLORS.ink }}
                          >
                            Map pin precision
                          </span>
                          <select
                            defaultValue="Approximate"
                            className="h-11 min-w-0 rounded-lg border bg-white px-3 text-[14px] outline-none"
                            style={{ borderColor: COLORS.hairline }}
                          >
                            <option>Approximate</option>
                            <option>Exact business location</option>
                            <option>Hidden</option>
                          </select>
                        </label>
                        <div
                          className="md:col-span-2 rounded-[14px] border p-3"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background: COLORS.surfaceSoft,
                          }}
                        >
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            Service areas
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {[
                              "Kikuyu",
                              "Westlands",
                              "Lavington",
                              "Kileleshwa",
                              "Kilimani",
                            ].map((area) => (
                              <span
                                key={area}
                                className="rounded-full border bg-white px-2.5 py-1 text-[12px]"
                                style={{
                                  borderColor: COLORS.hairlineSoft,
                                  color: COLORS.body,
                                }}
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <aside
                        className="min-w-0 rounded-[18px] border p-4"
                        style={{
                          borderColor: COLORS.hairlineSoft,
                          background: COLORS.surfaceSoft,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p
                              className="text-[15px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              Map preview
                            </p>
                            <p
                              className="mt-1 text-[12px] leading-[1.33]"
                              style={{ color: COLORS.muted }}
                            >
                              Compact preview prevents the location tab from
                              forcing horizontal or vertical overflow.
                            </p>
                          </div>
                          <MapPin size={18} style={{ color: COLORS.primary }} />
                        </div>
                        <div
                          className="mt-4 grid aspect-[4/3] place-items-center rounded-[16px] border bg-white"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            color: COLORS.primary,
                          }}
                        >
                          <Map size={38} />
                        </div>
                      </aside>
                    </div>
                  )}

                  {settingsTab === "verification" && (
                    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                      <div
                        className="rounded-[18px] border p-4"
                        style={{
                          borderColor: "#fde68a",
                          background: "#fffbeb",
                        }}
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p
                              className="text-[15px] font-semibold"
                              style={{ color: "#92400e" }}
                            >
                              Verification pending
                            </p>
                            <p
                              className="mt-2 text-[13px] leading-[1.23]"
                              style={{ color: COLORS.body }}
                            >
                              Submit clear identity and trade evidence so admins
                              can approve your verified badge.
                            </p>
                          </div>
                          <StatusChip status="PENDING" />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[
                            "National ID",
                            "Trade certificate",
                            "Portfolio samples",
                            "Reference contact",
                          ].map((item) => (
                            <button
                              key={item}
                              className="flex min-w-0 cursor-pointer items-center justify-between gap-2 rounded-[14px] border bg-white p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                              style={{ borderColor: COLORS.hairlineSoft }}
                            >
                              <span
                                className="truncate text-[13px] font-medium"
                                style={{ color: COLORS.ink }}
                              >
                                {item}
                              </span>
                              <FileCheck2
                                size={15}
                                className="shrink-0"
                                style={{ color: COLORS.primary }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <aside
                        className="rounded-[18px] border p-4"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <p
                          className="text-[15px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          Review checklist
                        </p>
                        <div
                          className="mt-3 grid gap-2 text-[13px]"
                          style={{ color: COLORS.body }}
                        >
                          <p className="flex gap-2">
                            <CheckCircle2
                              size={15}
                              style={{ color: COLORS.primary }}
                            />{" "}
                            Documents are readable.
                          </p>
                          <p className="flex gap-2">
                            <CheckCircle2
                              size={15}
                              style={{ color: COLORS.primary }}
                            />{" "}
                            Profession matches evidence.
                          </p>
                          <p className="flex gap-2">
                            <CheckCircle2
                              size={15}
                              style={{ color: COLORS.primary }}
                            />{" "}
                            Portfolio reflects listed skills.
                          </p>
                        </div>
                      </aside>
                    </div>
                  )}

                  {settingsTab === "notifications" && (
                    <div className="grid min-w-0 gap-3 md:grid-cols-2">
                      {[
                        [
                          "New messages",
                          "Notify me when clients send messages.",
                        ],
                        [
                          "Quote decisions",
                          "Notify me when a quote is accepted, rejected, or sent back for revision.",
                        ],
                        [
                          "Job status",
                          "Notify me about job starts, completions, and review prompts.",
                        ],
                        [
                          "Verification",
                          "Notify me when admin verification changes.",
                        ],
                        [
                          "Subscription",
                          "Notify me about renewals, failed payments, and plan changes.",
                        ],
                        [
                          "Marketing insights",
                          "Notify me about profile performance tips.",
                        ],
                      ].map(([title, body], index) => (
                        <label
                          key={title}
                          className="flex min-w-0 cursor-pointer items-start justify-between gap-4 rounded-[14px] border p-4"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background:
                              index % 2 === 1
                                ? COLORS.surfaceSoft
                                : COLORS.canvas,
                          }}
                        >
                          <span className="min-w-0">
                            <span
                              className="block truncate text-[14px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              {title}
                            </span>
                            <span
                              className="mt-1 block text-[13px] leading-[1.23]"
                              style={{ color: COLORS.muted }}
                            >
                              {body}
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            defaultChecked={index < 5}
                            className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  <div
                    className="mt-5 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <button
                      className="h-10 cursor-pointer rounded-lg border px-4 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.ink,
                      }}
                    >
                      Discard changes
                    </button>
                    <button
                      className="h-10 cursor-pointer rounded-lg px-4 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                      style={{ background: COLORS.primary }}
                    >
                      Save artisan settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {selectedProject && (
          <PortfolioProjectModal
            project={selectedProject}
            initialMode={portfolioModalMode}
            isNew={portfolioModalIsNew}
            onClose={() => {
              setSelectedProject(null);
              setPortfolioModalIsNew(false);
            }}
            onPreviewCustomer={() => {
              setCustomerPreviewProject(selectedProject);
              setSelectedProject(null);
              setPortfolioModalIsNew(false);
            }}
            onSave={savePortfolioProject}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {customerPreviewProject && (
          <CustomerPortfolioPreviewModal
            project={customerPreviewProject}
            onClose={() => setCustomerPreviewProject(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {skillModalOpen && (
          <AddSkillModal onClose={() => setSkillModalOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {paymentMethodModalOpen && (
          <UpdatePaymentMethodModal
            onClose={() => setPaymentMethodModalOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {addJobModalOpen && (
          <AddArtisanJobModal
            jobs={artisanJobRows}
            onClose={() => setAddJobModalOpen(false)}
            onCreate={createStandaloneJob}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {quickEarning && (
          <QuickDetailSlideover
            title={quickEarning.item}
            subtitle={`${quickEarning.client} · ${quickEarning.date}`}
            status={quickEarning.status}
            description={`Gross value ${quickEarning.amount}, marketplace commission ${quickEarning.commission}, and net artisan earning ${quickEarning.net}.`}
            metrics={[
              ["Gross", quickEarning.amount],
              ["Commission", quickEarning.commission],
              ["Net", quickEarning.net],
              ["Date", quickEarning.date],
            ]}
            actions={[
              {
                label: "Open earning detail",
                primary: true,
                onClick: () => openEarningDetail(quickEarning),
              },
              {
                label: "Open related job",
                onClick: () => setJobAndOpen(artisanJobRows[0]),
              },
              { label: "Back to ledger", onClick: () => setQuickEarning(null) },
            ]}
            onClose={() => setQuickEarning(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {quickJob && (
          <QuickDetailSlideover
            title={quickJob.title}
            subtitle={`${quickJob.client} · ${quickJob.location}`}
            status={quickJob.status}
            description={quickJob.description}
            metrics={[
              ["Budget", quickJob.budget],
              ["Quote", quickJob.quote],
              ["Client", quickJob.client],
              ["Location", quickJob.location],
            ]}
            actions={[
              {
                label: "Open full job detail",
                primary: true,
                onClick: () => setJobAndOpen(quickJob),
              },
              {
                label: "Message client",
                onClick: () => {
                  setQuickJob(null);
                  selectView("messages");
                },
              },
              {
                label:
                  quickJob.status === "PENDING"
                    ? "Create quote"
                    : "Revise quote",
                onClick: () => {
                  setSelectedJob(quickJob);
                  setQuoteMode(
                    quickJob.status === "PENDING" ? "create" : "revision",
                  );
                  setQuickJob(null);
                  selectView("job-detail");
                },
              },
            ]}
            onClose={() => setQuickJob(null)}
          />
        )}
      </AnimatePresence>
    </DashboardAppShell>
  );
}

type ClientCoreView =
  | "overview"
  | "find"
  | "saved"
  | "jobs"
  | "job-detail"
  | "messages"
  | "reviews";

type ClientJob = {
  id: string;
  title: string;
  artisan: string;
  profession: string;
  status: DashboardRecord["status"];
  quote: string;
  location: string;
  description: string;
};



function ClientDashboardCoreSection({
  onOpenPortfolio,
  onViewProfile,
  initialView = "overview",
  onRouteChange,
}: {
  onOpenPortfolio: (artisan: (typeof artisans)[number]) => void;
  onViewProfile: (artisan: (typeof artisans)[number]) => void;
  initialView?: ClientCoreView;
  onRouteChange?: (view: ClientCoreView) => void;
}) {
  const [view, setView] = useState<ClientCoreView>(initialView);
  const initialClientJobs: ClientJob[] = [
    {
      id: "client-job-001",
      title: "Paint living room and corridor",
      artisan: "Amina Hassan",
      profession: "Painter",
      status: "QUOTED" as const,
      quote: "KES 12,000",
      location: "Westlands, Nairobi",
      description: "Two-room repainting request with wall prep, one accent wall, and cleanup after the job.",
    },
    {
      id: "client-job-002",
      title: "Install floating shelves",
      artisan: "Grace Wanjiku",
      profession: "Carpenter",
      status: "ACTIVE" as const,
      quote: "KES 8,500",
      location: "Kileleshwa, Nairobi",
      description: "Install six floating shelves and reinforce two existing cabinet hinges.",
    },
    {
      id: "client-job-003",
      title: "Fix bathroom drain issue",
      artisan: "Peter Mwangi",
      profession: "Plumber",
      status: "COMPLETED" as const,
      quote: "KES 3,800",
      location: "Kilimani, Nairobi",
      description: "Drain repair completed. Client review pending.",
    },
  ];
  const [selectedJob, setSelectedJob] = useState<ClientJob>(initialClientJobs[0]);
  const [quoteDecision, setQuoteDecision] = useState<
    "review" | "accepted" | "revision"
  >("review");
  const [quickJob, setQuickJob] = useState<ClientJob | null>(null);
  const [clientJobs, setClientJobs] = useState<ClientJob[]>(initialClientJobs);
  const [reviewedJobIds, setReviewedJobIds] = useState<string[]>([]);
  const [clientJobTab, setClientJobTab] = useState<"All" | "Quoted" | "Active" | "Completed">("All");
  const [reviewNudgeDismissed, setReviewNudgeDismissed] = useState(false);
  const [reviewingJob, setReviewingJob] = useState<ClientJob | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const savedArtisans = artisans.slice(0, 4);
  const recommendedArtisans = artisans
    .filter((artisan) => artisan.isVerified)
    .slice(0, 4);

  const navItems: Array<DashboardNavItem<ClientCoreView>> = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      route: "/client/dashboard",
    },
    { id: "find", label: "Find Artisans", icon: Search, route: "/client/find", section: "Discover" },
    { id: "saved", label: "Saved", icon: Bookmark, route: "/client/saved", section: "Discover" },
    { id: "jobs", label: "Jobs", icon: ClipboardList, route: "/client/jobs", section: "Work" },
    { id: "job-detail", label: "Job Detail", icon: FileCheck2 },
    {
      id: "messages",
      label: "Messages",
      icon: Inbox,
      route: "/client/messages",
      section: "Work",
    },
    { id: "reviews", label: "Reviews", icon: Star, route: "/client/reviews", section: "Work" },
  ];

  const selectView = (nextView: ClientCoreView) => {
    setView(nextView);
    onRouteChange?.(nextView);
  };

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const setJobAndOpen = (job: ClientJob) => {
    setSelectedJob(job);
    setQuickJob(null);
    selectView("job-detail");
    setQuoteDecision("review");
  };

  const openQuickJob = (job: ClientJob) => {
    setSelectedJob(job);
    setQuickJob(job);
    setQuoteDecision("review");
  };

  return (
    <DashboardAppShell
      id="client-core-flow"
      title="Client Workspace"
      subtitle="Find, save, message, hire, and review artisans"
      eyebrow="Client Dashboard"
      activeLabel={navItems.find((item) => item.id === view)?.label}
      items={navItems}
      activeView={view}
      onSelect={selectView}
      role="Client"
      headerMeta={
        <>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
            style={{
              borderColor: COLORS.primarySoft,
              background: COLORS.primaryTint,
              color: COLORS.primaryActive,
            }}
          >
            3 active jobs
          </span>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
            style={{
              borderColor: COLORS.hairline,
              background: COLORS.canvas,
              color: COLORS.body,
            }}
          >
            Cash-only job payments
          </span>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          layout="position"
          initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(1.5px)" }}
          transition={routeTransition}
          className={
            view === "messages" ? "h-[calc(100vh-73px)] min-h-0" : "p-5 md:p-6"
          }
        >
          {view === "overview" && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardStatCard
                  label="Active jobs"
                  value="3"
                  helper="2 quoted"
                  icon={ClipboardList}
                />
                <DashboardStatCard
                  label="Saved artisans"
                  value="12"
                  helper="4 nearby"
                  icon={Bookmark}
                />
                <DashboardStatCard
                  label="Unread messages"
                  value="8"
                  helper="4 need reply"
                  icon={MessageCircle}
                />
                <DashboardStatCard
                  label="Completed jobs"
                  value="17"
                  helper="5 pending reviews"
                  icon={CheckCircle2}
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <div
                  className="rounded-[18px] border p-4"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p
                        className="text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        Current jobs
                      </p>
                      <p
                        className="text-[13px] leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        Review quotes and job progress.
                      </p>
                    </div>
                    <button
                      onClick={() => selectView("jobs")}
                      className="cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline"
                      style={{ color: COLORS.ink }}
                    >
                      View all
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {clientJobs.map((job) => (
                      <div
                        key={job.id}
                        className="grid gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7] md:grid-cols-[1fr_auto] md:items-center"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <button
                          onClick={() => openQuickJob(job)}
                          className="cursor-pointer text-left"
                        >
                          <span
                            className="block text-[14px] font-semibold leading-[1.29]"
                            style={{ color: COLORS.ink }}
                          >
                            {job.title}
                          </span>
                          <span
                            className="mt-1 block text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            {job.artisan} · {job.location}
                          </span>
                        </button>
                        <div className="flex items-center gap-2 justify-self-start md:justify-self-end">
                          <StatusChip status={job.status} />
                          <button
                            onClick={() => openQuickJob(job)}
                            className="h-9 cursor-pointer rounded-lg border px-3 text-[13px] font-medium transition-colors hover:bg-white"
                            style={{
                              borderColor: COLORS.hairline,
                              color: COLORS.ink,
                            }}
                          >
                            Quick view
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div
                    className="rounded-[18px] border p-4"
                    style={{
                      borderColor: COLORS.primarySoft,
                      background: COLORS.primaryTint,
                    }}
                  >
                    <p
                      className="text-[16px] font-semibold leading-[1.25]"
                      style={{ color: COLORS.primaryActive }}
                    >
                      Find the right artisan faster
                    </p>
                    <p
                      className="mt-2 text-[14px] leading-[1.43]"
                      style={{ color: COLORS.body }}
                    >
                      Use saved artisans and recommended matches to start new
                      job requests.
                    </p>
                    <button
                      onClick={() => selectView("find")}
                      className="mt-4 cursor-pointer rounded-lg px-3 py-2 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                      style={{ background: COLORS.primary }}
                    >
                      Find artisans
                    </button>
                  </div>
                  <div
                    className="rounded-[18px] border p-4"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <p
                      className="text-[16px] font-semibold leading-[1.25]"
                      style={{ color: COLORS.ink }}
                    >
                      Review prompt
                    </p>
                    <p
                      className="mt-2 text-[13px] leading-[1.23]"
                      style={{ color: COLORS.muted }}
                    >
                      You have 1 completed job awaiting a review.
                    </p>
                    <button
                      onClick={() => selectView("reviews")}
                      className="mt-4 cursor-pointer text-[14px] font-medium underline-offset-4 hover:underline"
                      style={{ color: COLORS.ink }}
                    >
                      Leave review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "find" && (
            <div>
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Recommended artisans
                  </p>
                  <p className="text-[14px]" style={{ color: COLORS.muted }}>
                    Reusable card grid for client-side discovery inside the
                    dashboard.
                  </p>
                </div>
                <button
                  className="h-11 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  Open map preview
                </button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {recommendedArtisans.map((artisan) => (
                  <ArtisanPreviewCard
                    key={`client-find-${artisan.id}`}
                    artisan={artisan}
                    onOpenPortfolio={onOpenPortfolio}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            </div>
          )}

          {view === "saved" && (
            <div>
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Saved artisans
                  </p>
                  <p className="text-[14px]" style={{ color: COLORS.muted }}>
                    Profiles saved while browsing public and dashboard search
                    results.
                  </p>
                </div>
                <button
                  onClick={() => selectView("find")}
                  className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                  style={{ background: COLORS.primary }}
                >
                  Find more
                </button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {savedArtisans.map((artisan) => (
                  <ArtisanPreviewCard
                    key={`client-saved-${artisan.id}`}
                    artisan={artisan}
                    onOpenPortfolio={onOpenPortfolio}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            </div>
          )}

          {view === "jobs" && (() => {
            const filteredJobs = clientJobTab === "All" ? clientJobs
              : clientJobTab === "Quoted" ? clientJobs.filter((job) => job.status === "QUOTED")
              : clientJobTab === "Active" ? clientJobs.filter((job) => job.status === "ACTIVE")
              : clientJobs.filter((job) => job.status === "COMPLETED");
            return (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardStatCard
                  label="Quoted jobs"
                  value={String(clientJobs.filter((job) => job.status === "QUOTED").length)}
                  helper="Awaiting your acceptance"
                  icon={ReceiptText}
                />
                <DashboardStatCard
                  label="Active jobs"
                  value={String(clientJobs.filter((job) => job.status === "ACTIVE").length)}
                  helper="Currently in progress"
                  icon={ClipboardList}
                />
                <DashboardStatCard
                  label="Completed jobs"
                  value={String(clientJobs.filter((job) => job.status === "COMPLETED").length)}
                  helper={`${clientJobs.filter((job) => job.status === "COMPLETED" && !reviewedJobIds.includes(job.id)).length} awaiting review`}
                  icon={CheckCircle2}
                />
                <DashboardStatCard
                  label="Total spend"
                  value={formatKes(clientJobs.filter((job) => job.status === "COMPLETED").reduce((sum, job) => sum + Number(job.quote.replace(/[^0-9]/g, "")), 0))}
                  helper="Completed job payments"
                  icon={CircleDollarSign}
                />
              </div>
              <div className="mb-4">
                <FluidPillTabs
                  id="client-jobs-tabs"
                  value={clientJobTab}
                  onChange={(tab) => setClientJobTab(tab as typeof clientJobTab)}
                  options={[
                    { id: "All", label: "All" },
                    { id: "Quoted", label: "Quoted" },
                    { id: "Active", label: "Active" },
                    { id: "Completed", label: "Completed" },
                  ]}
                />
              </div>
              <DashboardDataList
                subtitle="Search jobs by artisan, location, or scope. Click a row for a quick slideover, or use View for full detail."
                rows={filteredJobs}
                rowKey={(job) => job.id}
                getSearchText={(job) => `${job.title} ${job.artisan} ${job.profession} ${job.location} ${job.description}`}
                sortOptions={[
                  {
                    id: "recent",
                    label: "Sort: Recent",
                    sort: (a: ClientJob, b: ClientJob) => b.id.localeCompare(a.id),
                  },
                  {
                    id: "artisan",
                    label: "Sort: Artisan",
                    sort: (a: ClientJob, b: ClientJob) => a.artisan.localeCompare(b.artisan),
                  },
                  {
                    id: "quote",
                    label: "Sort: Quote",
                    sort: (a: ClientJob, b: ClientJob) => a.quote.localeCompare(b.quote),
                  },
                ]}
                columns={[
                  {
                    header: "Job",
                    className: "col-span-1",
                    render: (job: ClientJob) => (
                      <span>
                        <span className="block truncate font-semibold" style={{ color: COLORS.ink }}>
                          {job.title}
                        </span>
                        <span className="mt-1 block truncate text-[13px]" style={{ color: COLORS.muted }}>
                          {job.description}
                        </span>
                      </span>
                    ),
                  },
                  {
                    header: "Artisan",
                    render: (job: ClientJob) => (
                      <span>
                        <span className="block" style={{ color: COLORS.body }}>{job.artisan}</span>
                        <span className="text-[12px]" style={{ color: COLORS.muted }}>{job.profession}</span>
                      </span>
                    ),
                  },
                  {
                    header: "Status",
                    render: (job: ClientJob) => <StatusChip status={job.status} />,
                  },
                  {
                    header: "Quote",
                    render: (job: ClientJob) => (
                      <span className="font-semibold" style={{ color: COLORS.ink }}>{job.quote}</span>
                    ),
                  },
                ]}
                onRowClick={openQuickJob}
                onView={(job: ClientJob) => {
                  setSelectedJob(job);
                  selectView("job-detail");
                }}
                viewLabel="View"
                pageSize={8}
              />
            </div>
            );
          })()}

          {view === "job-detail" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                {selectedJob.status === "COMPLETED" && !reviewedJobIds.includes(selectedJob.id) && !reviewNudgeDismissed && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-3 rounded-[18px] border p-4 md:flex-row md:items-center md:justify-between"
                    style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white" style={{ color: COLORS.primary }}>
                        <Star size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold leading-[1.29]" style={{ color: COLORS.primaryActive }}>
                          This job is complete — leave a review
                        </span>
                        <span className="mt-1 block text-[13px] leading-[1.23]" style={{ color: COLORS.body }}>
                          Your review helps {selectedJob.artisan} build trust with future clients.
                        </span>
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
                      <button
                        onClick={() => {
                          setReviewingJob(selectedJob);
                          setReviewRating(5);
                          setReviewText("");
                          selectView("reviews");
                        }}
                        className="h-10 cursor-pointer rounded-lg px-4 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800"
                        style={{ background: COLORS.primary }}
                      >
                        Write review
                      </button>
                      <button
                        onClick={() => setReviewNudgeDismissed(true)}
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
                        style={{ borderColor: COLORS.primarySoft, color: COLORS.primaryActive }}
                        aria-label="Dismiss review prompt"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h4
                        className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                        style={{ color: COLORS.ink }}
                      >
                        {selectedJob.title}
                      </h4>
                      <p
                        className="mt-2 text-[14px] leading-[1.43]"
                        style={{ color: COLORS.muted }}
                      >
                        {selectedJob.artisan} · {selectedJob.profession} ·{" "}
                        {selectedJob.location}
                      </p>
                    </div>
                    <StatusChip status={selectedJob.status} />
                  </div>
                  <p
                    className="text-[16px] leading-[1.5]"
                    style={{ color: COLORS.body }}
                  >
                    {selectedJob.description}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Quote", selectedJob.quote],
                      ["Payment mode", "Cash on completion"],
                      ["Thread", "Open messages"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[14px] border p-3"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <p
                          className="text-[13px] leading-[1.23]"
                          style={{ color: COLORS.muted }}
                        >
                          {label}
                        </p>
                        <p
                          className="mt-1 text-[16px] font-semibold leading-[1.25]"
                          style={{ color: COLORS.ink }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p
                        className="text-[16px] font-semibold leading-[1.25]"
                        style={{ color: COLORS.ink }}
                      >
                        Quote decision
                      </p>
                      <p
                        className="text-[13px] leading-[1.23]"
                        style={{ color: COLORS.muted }}
                      >
                        Accept, decline, or request a revision.
                      </p>
                    </div>
                    <FluidPillTabs
                      id="client-quote-decision-tabs"
                      value={quoteDecision}
                      onChange={setQuoteDecision}
                      options={[
                        { id: "review", label: "Review" },
                        { id: "accepted", label: "Accepted" },
                        { id: "revision", label: "Revision" },
                      ]}
                    />
                  </div>
                  {quoteDecision === "review" && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Accept quote", "Request revision", "Decline"].map(
                        (action, index) => (
                          <button
                            key={action}
                            onClick={() =>
                              setQuoteDecision(
                                index === 0
                                  ? "accepted"
                                  : index === 1
                                    ? "revision"
                                    : "review",
                              )
                            }
                            className="h-12 cursor-pointer rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                            style={{
                              borderColor:
                                index === 0 ? COLORS.primary : COLORS.hairline,
                              color:
                                index === 0 ? COLORS.primaryActive : COLORS.ink,
                            }}
                          >
                            {action}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                  {quoteDecision === "accepted" && (
                    <div
                      className="rounded-[14px] border p-4"
                      style={{
                        borderColor: COLORS.primarySoft,
                        background: COLORS.primaryTint,
                      }}
                    >
                      <p
                        className="text-[14px] font-semibold leading-[1.29]"
                        style={{ color: COLORS.primaryActive }}
                      >
                        Quote accepted
                      </p>
                      <p
                        className="mt-1 text-[14px] leading-[1.43]"
                        style={{ color: COLORS.body }}
                      >
                        The artisan can now start the job. Payment remains
                        cash-only during this testing phase.
                      </p>
                    </div>
                  )}
                  {quoteDecision === "revision" && (
                    <div className="grid gap-3">
                      <label className="grid gap-1.5">
                        <span
                          className="text-[14px] font-medium"
                          style={{ color: COLORS.ink }}
                        >
                          Revision request
                        </span>
                        <textarea
                          defaultValue="Please separate labour from materials and confirm earliest availability."
                          className="min-h-24 rounded-lg border px-3 py-2 text-[14px] outline-none"
                          style={{ borderColor: COLORS.hairline }}
                        />
                      </label>
                      <button
                        className="h-12 cursor-pointer rounded-lg text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
                        style={{ background: COLORS.primary }}
                      >
                        Send revision request
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="text-[16px] font-semibold leading-[1.25]"
                    style={{ color: COLORS.ink }}
                  >
                    Client actions
                  </p>
                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => selectView("messages")}
                      className="h-11 cursor-pointer rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                    >
                      Message artisan
                    </button>
                    <button
                      className="h-11 cursor-pointer rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                      style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                    >
                      View artisan profile
                    </button>
                    {selectedJob.status === "ACTIVE" && (
                      <button
                        onClick={() => {
                          setClientJobs((current) =>
                            current.map((job) =>
                              job.id === selectedJob.id
                                ? { ...job, status: "COMPLETED" as const }
                                : job,
                            ),
                          );
                          setSelectedJob((prev) => ({ ...prev, status: "COMPLETED" as const }));
                          setReviewNudgeDismissed(false);
                        }}
                        className="h-11 cursor-pointer rounded-lg border text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                        style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                      >
                        Mark completed
                      </button>
                    )}
                    {selectedJob.status === "COMPLETED" && !reviewedJobIds.includes(selectedJob.id) && (
                      <button
                        onClick={() => {
                          setReviewingJob(selectedJob);
                          setReviewRating(5);
                          setReviewText("");
                          selectView("reviews");
                        }}
                        className="h-11 cursor-pointer rounded-lg px-3 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                        style={{ background: COLORS.primary }}
                      >
                        ★ Write a review
                      </button>
                    )}
                    {selectedJob.status === "COMPLETED" && reviewedJobIds.includes(selectedJob.id) && (
                      <div
                        className="rounded-[12px] border px-3 py-2 text-[13px] font-semibold"
                        style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}
                      >
                        ✓ Review submitted
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Cash-only testing mode
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-[1.43]"
                    style={{ color: COLORS.muted }}
                  >
                    Deposit and final-payment UI is represented as information
                    only. Job payment buttons stay disabled in test mode.
                  </p>
                </div>
              </aside>
            </div>
          )}

          {view === "messages" && (
            <DashboardMessagesPane
              jobs={clientJobs}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              getContactName={(job) => job.artisan}
              role="client"
            />
          )}

          {view === "reviews" && (() => {
            const completedJobs = clientJobs.filter((job) => job.status === "COMPLETED");
            const pendingReviewJobs = completedJobs.filter((job) => !reviewedJobIds.includes(job.id));
            const activeReviewJob = reviewingJob ?? pendingReviewJobs[0] ?? null;

            return (
              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                {/* Left: review form or empty state */}
                <div className="grid gap-5">
                  {activeReviewJob ? (
                    <div
                      className="rounded-[18px] border bg-white p-5"
                      style={{ borderColor: COLORS.hairlineSoft }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>
                            Leave a review
                          </p>
                          <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
                            {activeReviewJob.title} · {activeReviewJob.artisan}
                          </p>
                        </div>
                        <StatusChip status="COMPLETED" />
                      </div>
                      <div className="mt-5 flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setReviewRating(index + 1)}
                            className="cursor-pointer transition-transform hover:scale-110"
                            aria-label={`Rate ${index + 1} stars`}
                          >
                            <Star
                              size={28}
                              fill={index < reviewRating ? COLORS.amber : "none"}
                              style={{ color: COLORS.amber }}
                            />
                          </button>
                        ))}
                        <span className="ml-3 self-center text-[13px]" style={{ color: COLORS.muted }}>
                          {reviewRating} / 5
                        </span>
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(event) => setReviewText(event.target.value)}
                        placeholder={`How was your experience with ${activeReviewJob.artisan}?`}
                        className="mt-4 min-h-32 w-full rounded-lg border px-3 py-2 text-[14px] outline-none"
                        style={{ borderColor: COLORS.hairline }}
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          disabled={!reviewText.trim()}
                          onClick={() => {
                            setReviewedJobIds((current) => [...current, activeReviewJob.id]);
                            setReviewingJob(null);
                            setReviewText("");
                            setReviewRating(5);
                          }}
                          className="h-12 flex-1 cursor-pointer rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ background: COLORS.primary }}
                        >
                          Submit review
                        </button>
                        {pendingReviewJobs.length > 1 && activeReviewJob.id !== pendingReviewJobs[pendingReviewJobs.length - 1].id && (
                          <button
                            onClick={() => {
                              const next = pendingReviewJobs.find((job) => job.id !== activeReviewJob.id);
                              if (next) { setReviewingJob(next); setReviewText(""); setReviewRating(5); }
                            }}
                            className="h-12 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                            style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                          >
                            Skip
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Empty state */
                    <div
                      className="rounded-[18px] border p-8 text-center"
                      style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
                    >
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
                        <Star size={24} />
                      </span>
                      <p className="mt-4 text-[16px] font-semibold" style={{ color: COLORS.ink }}>No reviews yet</p>
                      <p className="mt-2 text-[14px] leading-[1.5]" style={{ color: COLORS.muted }}>
                        Reviews appear here once you complete a job. Finish your first job to leave a rating for your artisan.
                      </p>
                      <button
                        onClick={() => selectView("jobs")}
                        className="mt-5 h-11 cursor-pointer rounded-full border px-5 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                        style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                      >
                        View my jobs
                      </button>
                    </div>
                  )}

                  {/* Completed jobs awaiting review */}
                  {pendingReviewJobs.length > 0 && (
                    <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
                      <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>
                        Jobs awaiting a review
                      </p>
                      <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>
                        {pendingReviewJobs.length} completed job{pendingReviewJobs.length > 1 ? "s" : ""} without a review yet.
                      </p>
                      <div className="mt-4 grid gap-2">
                        {pendingReviewJobs.map((job) => (
                          <button
                            key={job.id}
                            onClick={() => {
                              setReviewingJob(job);
                              setReviewText("");
                              setReviewRating(5);
                            }}
                            className="flex items-center justify-between rounded-[14px] border px-4 py-3 text-left transition-colors hover:bg-[#f7f7f7]"
                            style={{
                              borderColor: activeReviewJob?.id === job.id ? COLORS.primary : COLORS.hairlineSoft,
                              background: activeReviewJob?.id === job.id ? COLORS.primaryTint : COLORS.canvas,
                            }}
                          >
                            <div>
                              <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</p>
                              <p className="text-[12px]" style={{ color: COLORS.muted }}>{job.artisan} · {job.quote}</p>
                            </div>
                            <span className="text-[13px] font-semibold" style={{ color: COLORS.primary }}>Review →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submitted reviews */}
                  {reviewedJobIds.length > 0 && (
                    <div className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
                      <p className="text-[15px] font-semibold" style={{ color: COLORS.ink }}>Submitted reviews</p>
                      <div className="mt-4 grid gap-3">
                        {clientJobs.filter((job) => reviewedJobIds.includes(job.id)).map((job) => (
                          <div key={job.id} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{job.title}</p>
                                <p className="text-[12px]" style={{ color: COLORS.muted }}>{job.artisan} · {job.quote}</p>
                              </div>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={13} fill={COLORS.amber} style={{ color: COLORS.amber }} />
                                ))}
                              </div>
                            </div>
                            <p className="mt-2 text-[12px] font-semibold" style={{ color: COLORS.primaryActive }}>✓ Review submitted</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: guidelines */}
                <div
                  className="h-fit rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
                >
                  <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>
                    Review guidelines
                  </p>
                  <div className="mt-3 grid gap-3 text-[14px] leading-[1.43]" style={{ color: COLORS.body }}>
                    <p className="flex gap-2">
                      <CheckCircle2 size={16} style={{ color: COLORS.primary }} />
                      Rate communication, punctuality, cleanliness, and work quality.
                    </p>
                    <p className="flex gap-2">
                      <CheckCircle2 size={16} style={{ color: COLORS.primary }} />
                      Reviews appear on verified public profiles after moderation checks.
                    </p>
                    <p className="flex gap-2">
                      <CheckCircle2 size={16} style={{ color: COLORS.primary }} />
                      You can only review artisans for completed jobs.
                    </p>
                  </div>
                  {pendingReviewJobs.length > 0 && (
                    <div className="mt-4 rounded-[14px] border px-3 py-2 text-[12px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>
                      {pendingReviewJobs.length} review{pendingReviewJobs.length > 1 ? "s" : ""} pending
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {quickJob && (
          <QuickDetailSlideover
            title={quickJob.title}
            subtitle={`${quickJob.artisan} · ${quickJob.profession} · ${quickJob.location}`}
            status={quickJob.status}
            description={quickJob.description}
            metrics={[
              ["Quote", quickJob.quote],
              ["Artisan", quickJob.artisan],
              ["Profession", quickJob.profession],
              ["Location", quickJob.location],
            ]}
            actions={[
              {
                label: "Open full job detail",
                primary: true,
                onClick: () => setJobAndOpen(quickJob),
              },
              {
                label: "Message artisan",
                onClick: () => {
                  setQuickJob(null);
                  selectView("messages");
                },
              },
              {
                label:
                  quickJob.status === "COMPLETED"
                    ? "Leave review"
                    : "Review quote",
                onClick: () => {
                  setSelectedJob(quickJob);
                  setQuickJob(null);
                  selectView(
                    quickJob.status === "COMPLETED" ? "reviews" : "job-detail",
                  );
                },
              },
            ]}
            onClose={() => setQuickJob(null)}
          />
        )}
      </AnimatePresence>
    </DashboardAppShell>
  );
}

type AdminCoreView =
  | "overview"
  | "verification"
  | "artisans"
  | "users"
  | "invites"
  | "moderation"
  | "analytics"
  | "monitoring"
  | "locations"
  | "settings";

type VerificationRecord = {
  id: string;
  name: string;
  profession: string;
  county: string;
  submitted: string;
  status: DashboardRecord["status"];
  documents: string[];
  risk: "Low" | "Medium" | "High";
};

const verificationQueue: VerificationRecord[] = [
  {
    id: "verify-001",
    name: "Joseph Njoroge",
    profession: "Welder",
    county: "Nairobi",
    submitted: "2h ago",
    status: "REVIEW",
    documents: ["National ID", "Trade certificate", "Portfolio samples"],
    risk: "Low",
  },
  {
    id: "verify-002",
    name: "Mercy Achieng",
    profession: "Cleaner",
    county: "Mombasa",
    submitted: "7h ago",
    status: "PENDING",
    documents: ["National ID", "Business permit"],
    risk: "Medium",
  },
  {
    id: "verify-003",
    name: "Daniel Kariuki",
    profession: "Mason",
    county: "Kiambu",
    submitted: "1d ago",
    status: "REVIEW",
    documents: ["National ID", "Reference letter", "Project photos"],
    risk: "Low",
  },
];

type AdminAnalyticsRange = "today" | "week" | "month" | "quarter";
type AdminAnalyticsViz = "trend" | "bars" | "radial";
type AdminAnalyticsCategory = "growth" | "conversion" | "revenue";
type AdminBulkAction = "resend" | "revoke" | "approve" | "assign" | "export";

function StableSegmentedTabs<T extends string>({
  id,
  value,
  onChange,
  options,
  size = "default",
}: {
  id: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ id: T; label: string; icon?: typeof Search }>;
  size?: "default" | "compact";
}) {
  const isCompact = size === "compact";
  return (
    <div
      className="inline-grid shrink-0 rounded-full border"
      style={{
        borderColor: COLORS.hairlineSoft,
        background: COLORS.surfaceStrong,
        gridTemplateColumns: `repeat(${options.length}, minmax(${isCompact ? "72px" : "92px"}, 1fr))`,
        padding: isCompact ? 3 : 4,
      }}
    >
      {options.map((option) => {
        const active = value === option.id;
        const Icon = option.icon;
        return (
          <button
            key={`${id}-${option.id}`}
            type="button"
            onClick={() => onChange(option.id)}
            className={`${isCompact ? "h-8 min-w-[72px] px-2 text-[12px]" : "h-9 min-w-[92px] px-3 text-[13px]"} relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full text-center font-semibold leading-none transition-colors`}
            style={{ color: active ? COLORS.ink : COLORS.muted }}
          >
            {active && (
              <motion.span
                layoutId={`${id}-stable-pill`}
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {Icon && (
              <Icon
                size={isCompact ? 13 : 14}
                className="relative z-10 shrink-0"
                style={{ color: active ? COLORS.primary : COLORS.muted }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap leading-none">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BulkActionPanel({
  selectedCount,
  noun,
  onAction,
  onClear,
}: {
  selectedCount: number;
  noun: string;
  onAction: (action: AdminBulkAction) => void;
  onClear: () => void;
}) {
  const disabled = selectedCount === 0;
  const actions: Array<{ id: AdminBulkAction; label: string }> = [
    { id: "resend", label: "Resend" },
    { id: "approve", label: "Approve" },
    { id: "assign", label: "Assign" },
    { id: "export", label: "Export" },
    { id: "revoke", label: "Revoke" },
  ];
  return (
    <div
      className="flex flex-col gap-3 rounded-[16px] border p-3 sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderColor: COLORS.hairlineSoft,
        background: COLORS.surfaceSoft,
      }}
    >
      <div>
        <p className="text-[13px] font-semibold" style={{ color: COLORS.ink }}>
          {selectedCount} {noun} selected
        </p>
        <p className="mt-0.5 text-[12px]" style={{ color: COLORS.muted }}>
          {disabled
            ? "Select rows to enable bulk actions."
            : "Apply a controlled admin action to the selected rows."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action.id)}
            className="h-9 rounded-full border px-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              borderColor: COLORS.hairlineSoft,
              background: COLORS.canvas,
              color: action.id === "revoke" ? "#b91c1c" : COLORS.ink,
            }}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="h-9 rounded-full px-3 text-[12px] font-semibold disabled:opacity-45"
          style={{ color: COLORS.muted }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function ChartLegend({
  items,
}: {
  items: Array<{ label: string; helper?: string }>;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 text-[12px]"
      style={{ color: COLORS.muted }}
    >
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: COLORS.primary }}
          />
          <span className="font-medium" style={{ color: COLORS.body }}>
            {item.label}
          </span>
          {item.helper && <span>{item.helper}</span>}
        </span>
      ))}
    </div>
  );
}

function ChartTooltip({
  active,
  x,
  y,
  label,
  value,
  suffix = "",
}: {
  active: boolean;
  x: number;
  y: number;
  label: string;
  value: number;
  suffix?: string;
}) {
  if (!active) return null;
  return (
    <div
      className="pointer-events-none absolute z-20 rounded-[12px] border bg-white px-3 py-2 text-[12px] shadow-lg"
      style={{
        borderColor: COLORS.hairlineSoft,
        color: COLORS.ink,
        left: Math.min(Math.max(x + 12, 8), 520),
        top: Math.max(y - 44, 8),
      }}
    >
      <p className="font-semibold leading-none">{label}</p>
      <p className="mt-1 leading-none" style={{ color: COLORS.muted }}>
        {value}
        {suffix}
      </p>
    </div>
  );
}

function ChartAxisLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-medium leading-none"
      style={{ color: COLORS.muted }}
    >
      {children}
    </span>
  );
}

function AdminBarChart({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const max = Math.max(...values, 1);
  const steps = [max, Math.round(max * 0.66), Math.round(max * 0.33), 0];

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <ChartLegend
          items={[{ label: "Selected signal", helper: "by period" }]}
        />
        <ChartAxisLabel>max {max}</ChartAxisLabel>
      </div>
      <div
        className="relative h-[320px] min-w-0"
        onMouseLeave={() => {
          setHoveredIndex(null);
          setTooltip(null);
        }}
      >
        <ChartTooltip
          active={hoveredIndex !== null && Boolean(tooltip)}
          x={tooltip?.x ?? 0}
          y={tooltip?.y ?? 0}
          label={hoveredIndex !== null ? labels[hoveredIndex] : ""}
          value={hoveredIndex !== null ? values[hoveredIndex] : 0}
        />
        <div className="grid grid-cols-[40px_1fr] gap-3">
          <div className="flex h-[254px] flex-col justify-between pt-1 text-right">
            {steps.map((step) => (
              <ChartAxisLabel key={step}>{step}</ChartAxisLabel>
            ))}
          </div>
          <div className="relative min-w-0">
            <div className="absolute inset-x-0 top-0 h-[254px]">
              {[0, 1, 2, 3].map((line) => (
                <span
                  key={line}
                  className="absolute left-0 right-0 h-px"
                  style={{
                    top: `${(line / 3) * 100}%`,
                    background: COLORS.hairlineSoft,
                  }}
                />
              ))}
            </div>
            <div
              className="relative grid h-[254px] items-end gap-2"
              style={{
                gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))`,
              }}
            >
              {values.map((value, index) => {
                const active = hoveredIndex === index;
                return (
                  <button
                    key={`${labels[index]}-${value}`}
                    type="button"
                    onMouseEnter={(event) => {
                      setHoveredIndex(index);
                      setTooltip({
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY,
                      });
                    }}
                    onMouseMove={(event) =>
                      setTooltip({
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY,
                      })
                    }
                    className="group flex min-w-0 cursor-pointer flex-col items-center justify-end gap-2 rounded-[10px] px-1 transition-colors hover:bg-[#f7f7f7]"
                    aria-label={`${labels[index]}: ${value}`}
                  >
                    <span
                      className="text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: COLORS.ink }}
                    >
                      {value}
                    </span>
                    <motion.span
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max(10, (value / max) * 210)}px`,
                        opacity: active ? 1 : 0.84,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 240,
                        damping: 28,
                        mass: 0.7,
                      }}
                      className="w-full max-w-[34px] rounded-t-[10px] rounded-b-[4px]"
                      style={{ background: COLORS.primary }}
                    />
                  </button>
                );
              })}
            </div>
            <div
              className="mt-4 grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`,
              }}
            >
              {labels.map((label) => (
                <ChartAxisLabel key={label}>{label}</ChartAxisLabel>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRadialMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="rounded-[16px] bg-[#f7f7f7] p-4">
      <div className="relative mx-auto grid h-28 w-28 place-items-center">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={COLORS.surfaceStrong}
            strokeWidth="10"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 28,
              mass: 0.7,
            }}
          />
        </svg>
        <span
          className="absolute text-[22px] font-semibold"
          style={{ color: COLORS.ink }}
        >
          {value}%
        </span>
      </div>
      <p
        className="mt-3 text-center text-[14px] font-semibold"
        style={{ color: COLORS.ink }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-center text-[12px] leading-[1.33]"
        style={{ color: COLORS.muted }}
      >
        {helper}
      </p>
    </div>
  );
}

function AdminLineChart({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const chartWidth = 640;
  const chartHeight = 268;
  const padX = 42;
  const padY = 24;
  const plotWidth = chartWidth - padX * 2;
  const plotHeight = chartHeight - padY * 2;
  const points = values.map((value, index) => {
    const x = padX + (index / Math.max(1, values.length - 1)) * plotWidth;
    const y = padY + (1 - (value - min) / range) * plotHeight;
    return { x, y, value, label: labels[index] };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${path} L ${points[points.length - 1]?.x ?? padX} ${chartHeight - padY} L ${points[0]?.x ?? padX} ${chartHeight - padY} Z`;
  const yTicks = [
    max,
    Math.round(min + range * 0.66),
    Math.round(min + range * 0.33),
    min,
  ];

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ChartLegend
          items={[
            { label: "Selected signal", helper: `${labels.length} intervals` },
          ]}
        />
        <ChartAxisLabel>
          scale {min}–{max}
        </ChartAxisLabel>
      </div>
      <div
        className="relative min-w-0"
        onMouseLeave={() => {
          setHoveredIndex(null);
          setTooltip(null);
        }}
      >
        <ChartTooltip
          active={hoveredIndex !== null && Boolean(tooltip)}
          x={tooltip?.x ?? 0}
          y={tooltip?.y ?? 0}
          label={hoveredIndex !== null ? labels[hoveredIndex] : ""}
          value={hoveredIndex !== null ? values[hoveredIndex] : 0}
        />
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[320px] w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label="Line chart showing selected analytics signal over time"
        >
          {yTicks.map((tick, index) => {
            const y = padY + (index / 3) * plotHeight;
            return (
              <g key={`${tick}-${index}`}>
                <line
                  x1={padX}
                  x2={chartWidth - padX}
                  y1={y}
                  y2={y}
                  stroke={COLORS.hairlineSoft}
                  strokeWidth="1"
                />
                <text x="4" y={y + 4} fontSize="11" fill={COLORS.muted}>
                  {tick}
                </text>
              </g>
            );
          })}
          {points.map((point, index) => (
            <line
              key={`x-grid-${point.label}`}
              x1={point.x}
              x2={point.x}
              y1={padY}
              y2={chartHeight - padY}
              stroke={COLORS.hairlineSoft}
              strokeWidth="1"
              opacity={index === 0 || index === points.length - 1 ? 1 : 0.55}
            />
          ))}
          <path d={areaPath} fill={COLORS.primary} opacity="0.08" />
          <motion.path
            d={path}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          {points.map((point, index) => {
            const active = hoveredIndex === index;
            return (
              <g key={`${point.label}-${point.value}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={active ? 8 : 5}
                  fill="white"
                  stroke={COLORS.primary}
                  strokeWidth={active ? 4 : 3}
                />
                <rect
                  x={point.x - 26}
                  y={padY}
                  width="52"
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={(event) => {
                    setHoveredIndex(index);
                    setTooltip({
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                    });
                  }}
                  onMouseMove={(event) =>
                    setTooltip({
                      x: event.nativeEvent.offsetX,
                      y: event.nativeEvent.offsetY,
                    })
                  }
                />
                <text
                  x={point.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill={COLORS.muted}
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function AdminAnalyticsVisualization({
  type,
  values,
  labels,
}: {
  type: AdminAnalyticsViz;
  values: number[];
  labels: string[];
}) {
  if (type === "bars") return <AdminBarChart values={values} labels={labels} />;
  if (type === "radial") {
    const acceptance = Math.round(values[values.length - 1] ?? 42);
    const response = Math.round(
      Math.min(
        96,
        72 + values.slice(-3).reduce((sum, value) => sum + value, 0) / 30,
      ),
    );
    const supply = Math.round(Math.min(98, 64 + values.length * 2));
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <AdminRadialMetric
          label="Quote acceptance"
          value={acceptance}
          helper="Accepted quotes in selected range"
        />
        <AdminRadialMetric
          label="Response SLA"
          value={response}
          helper="Threads answered within target"
        />
        <AdminRadialMetric
          label="Verified supply"
          value={supply}
          helper="Search-eligible artisan coverage"
        />
      </div>
    );
  }
  return <AdminLineChart values={values} labels={labels} />;
}

function AdminOperationsSection({
  initialView = "overview",
  onRouteChange,
  detailContent,
}: {
  initialView?: AdminCoreView;
  onRouteChange?: (view: AdminCoreView) => void;
  detailContent?: React.ReactNode;
} = {}) {
  const [view, setView] = useState<AdminCoreView>(initialView);
  const [selectedVerification, setSelectedVerification] =
    useState<VerificationRecord | null>(verificationQueue[0]);
  const [reviewDecision, setReviewDecision] = useState<
    "inspect" | "approve" | "reject"
  >("inspect");
  const [adminQuickDetail, setAdminQuickDetail] = useState<{
    title: string;
    subtitle: string;
    status: DashboardRecord["status"];
    description: string;
    metrics: Array<[string, string]>;
  } | null>(null);
  const [adminFullDetail, setAdminFullDetail] = useState<{
    title: string;
    subtitle: string;
    status: DashboardRecord["status"];
    description: string;
    metrics: Array<[string, string]>;
  } | null>(null);
  const [analyticsRange, setAnalyticsRange] =
    useState<AdminAnalyticsRange>("month");
  const [analyticsViz, setAnalyticsViz] = useState<AdminAnalyticsViz>("trend");
  const [analyticsCategory, setAnalyticsCategory] =
    useState<AdminAnalyticsCategory>("growth");
  const [selectedInviteEmails, setSelectedInviteEmails] = useState<string[]>(
    [],
  );
  const [selectedVerificationIds, setSelectedVerificationIds] = useState<
    string[]
  >([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const openBulkAction = (
    action: AdminBulkAction,
    noun: string,
    count: number,
  ) => {
    const labels: Record<AdminBulkAction, string> = {
      resend: "Bulk resend",
      revoke: "Bulk revoke",
      approve: "Bulk approve",
      assign: "Bulk assign",
      export: "Bulk export",
    };
    openAdminQuickDetail({
      title: labels[action],
      subtitle: `${count} ${noun} selected`,
      status: action === "revoke" ? "REVIEW" : "ACTIVE",
      description: `${labels[action]} is staged for ${count} selected ${noun}. In production this would open a confirmation step, permission check, audit reason, and queue-safe mutation before any backend write occurs.`,
      metrics: [
        ["Selection", `${count} ${noun}`],
        ["Action", labels[action]],
        ["Permission", "Admin only"],
        ["Audit", "Required"],
      ],
    });
  };

  const navItems: Array<DashboardNavItem<AdminCoreView>> = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      route: "/admin",
    },
    {
      id: "verification",
      label: "Verification",
      icon: FileCheck2,
      route: "/admin/verification",
      section: "Operations",
    },
    {
      id: "artisans",
      label: "Artisans",
      icon: UserCog,
      route: "/admin/artisans",
      section: "Operations",
    },
    { id: "users", label: "Users", icon: UserRound, route: "/admin/users", section: "Operations" },
    { id: "invites", label: "Invites", icon: Send, route: "/admin/invites", section: "Operations" },
    {
      id: "moderation",
      label: "Moderation",
      icon: Flag,
      route: "/admin/moderation",
      section: "Trust & Safety",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      route: "/admin/analytics",
      section: "Trust & Safety",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: Gauge,
      route: "/admin/monitoring",
      section: "System",
    },
    {
      id: "locations",
      label: "Locations",
      icon: Map,
      route: "/admin/locations",
      section: "System",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      route: "/admin/settings",
      section: "System",
    },
  ];

  const selectView = (nextView: AdminCoreView) => {
    // When a detail page is mounted (detailContent), sidebar clicks must do a real
    // browser navigation so the Next.js router replaces the detail route with the list page.
    if (detailContent) {
      const target = navItems.find((item) => item.id === nextView);
      if (target?.route && typeof window !== "undefined") {
        window.location.href = target.route;
        return;
      }
    }
    setView(nextView);
    onRouteChange?.(nextView);
  };

  const openVerification = (record: VerificationRecord) => {
    setSelectedVerification(record);
    setReviewDecision("inspect");
    selectView("verification");
  };

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const inviteRows = [
    {
      email: "jane.artisan@example.com",
      role: "Artisan",
      status: "PENDING" as const,
      sent: "Today",
    },
    {
      email: "kamau.builder@example.com",
      role: "Artisan",
      status: "ACTIVE" as const,
      sent: "Yesterday",
    },
    {
      email: "old.invite@example.com",
      role: "Artisan",
      status: "COMPLETED" as const,
      sent: "Expired",
    },
  ];

  const userRows = [
    {
      id: "user-001",
      name: "Miriam Otieno",
      role: "Client",
      status: "ACTIVE" as const,
      meta: "17 jobs · Nairobi",
      email: "miriam.client@example.com",
      risk: "Low",
    },
    {
      id: "user-002",
      name: "Peter Mwangi",
      role: "Artisan",
      status: "VERIFIED" as const,
      meta: "4.9 rating · Plumber",
      email: "peter.artisan@example.com",
      risk: "Low",
    },
    {
      id: "user-003",
      name: "Suspicious account",
      role: "Client",
      status: "REVIEW" as const,
      meta: "Flagged by moderation",
      email: "flagged.user@example.com",
      risk: "High",
    },
  ];

  const moderationRows = [
    {
      id: "mod-001",
      title: "Low quality portfolio",
      body: "A project image appears duplicated across two unrelated artisans.",
      status: "REVIEW" as const,
      severity: "Low" as const,
      target: "Portfolio project",
      source: "Automated duplicate media check",
      owner: "Trust queue",
    },
    {
      id: "mod-002",
      title: "User report",
      body: "Client reported abusive language in a conversation thread.",
      status: "PENDING" as const,
      severity: "High" as const,
      target: "Conversation thread",
      source: "Client report",
      owner: "Safety team",
    },
    {
      id: "mod-003",
      title: "Suspicious account",
      body: "Repeated invite abuse and unusual signup velocity detected.",
      status: "REVIEW" as const,
      severity: "Medium" as const,
      target: "Account",
      source: "Risk signal",
      owner: "Platform ops",
    },
    {
      id: "mod-004",
      title: "Listing policy mismatch",
      body: "Profile advertises restricted payment terms outside testing policy.",
      status: "PENDING" as const,
      severity: "Medium" as const,
      target: "Artisan listing",
      source: "Policy scan",
      owner: "Marketplace quality",
    },
  ];

  const openAdminQuickDetail = (detail: {
    title: string;
    subtitle: string;
    status: DashboardRecord["status"];
    description: string;
    metrics: Array<[string, string]>;
  }) => setAdminQuickDetail(detail);
  const routeForAdminFullDetail = (detail: {
    title: string;
    subtitle: string;
    status: DashboardRecord["status"];
    description: string;
    metrics: Array<[string, string]>;
  }) => {
    const text = `${detail.title} ${detail.subtitle}`.toLowerCase();
    const slug = encodeURIComponent(
      detail.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "record",
    );

    if (text.includes("verify") || text.includes("verification")) return `/admin/verification/${slug}`;
    if (text.includes("profile administration") || text.includes("artisan")) return `/admin/artisans/${slug}`;
    if (text.includes("user") || text.includes("account")) return `/admin/users/${slug}`;
    if (text.includes("moderation") || text.includes("report")) return `/admin/moderation/${slug}`;
    if (text.includes("logs") || text.includes("service")) return `/admin/monitoring/${slug}`;
    if (text.includes("map") || text.includes("location") || text.includes("county")) return `/admin/locations/${slug}`;
    if (text.includes("invite")) return `/admin/invites/${slug}`;

    const viewRoutes: Partial<Record<AdminCoreView, string>> = {
      verification: `/admin/verification/${slug}`,
      artisans: `/admin/artisans/${slug}`,
      users: `/admin/users/${slug}`,
      invites: `/admin/invites/${slug}`,
      moderation: `/admin/moderation/${slug}`,
      monitoring: `/admin/monitoring/${slug}`,
      locations: `/admin/locations/${slug}`,
    };

    return viewRoutes[view] ?? null;
  };

  const openAdminFullDetail = (detail: {
    title: string;
    subtitle: string;
    status: DashboardRecord["status"];
    description: string;
    metrics: Array<[string, string]>;
  }) => {
    const route = routeForAdminFullDetail(detail);
    if (route && typeof window !== "undefined") {
      window.location.href = route;
      return;
    }
    setAdminFullDetail(detail);
  };

  const openVerificationReviewModal = (record: VerificationRecord) => {
    setSelectedVerification(record);
    setReviewDecision("inspect");
    setAdminFullDetail({
      title: `Verify ${record.name}`,
      subtitle: `${record.profession} verification review`,
      status: record.status,
      description: `Review submitted documents, portfolio evidence, location, category fit, duplicate accounts, and policy risk before approving ${record.name}. Use this review workspace to approve, request changes, reject, or escalate with an audit reason.`,
      metrics: [
        ["Profession", record.profession],
        ["County", record.county],
        ["Documents", `${record.documents.length} files`],
        ["Submitted", record.submitted],
        ["Risk", record.risk],
      ],
    });
  };

  return (
    <section
      id="admin-operations-flow"
      className="h-screen w-full overflow-hidden bg-white"
    >
      <div className="h-screen overflow-hidden bg-white">
        <div
          className="grid h-screen min-h-0 transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
          style={{ ["--sidebar-width" as string]: sidebarCollapsed ? "88px" : "260px" }}
        >
          <DashboardSidebar
            title="Admin Console"
            subtitle="Trust, users, invites, and moderation"
            items={navItems}
            activeView={view}
            onSelect={selectView}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
            role="Admin"
          />
          <div className="min-h-0 min-w-0 overflow-y-auto bg-white">
            <DashboardMobileNav
              items={navItems}
              activeView={view}
              onSelect={selectView}
            />
            <div
              className="border-b px-5 py-4"
              style={{
                borderColor: COLORS.hairlineSoft,
                background: COLORS.surfaceSoft,
              }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p
                    className="text-[13px] font-medium leading-[1.23]"
                    style={{ color: COLORS.muted }}
                  >
                    Admin Console
                  </p>
                  <h3
                    className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
                    style={{ color: COLORS.ink }}
                  >
                    {navItems.find((item) => item.id === view)?.label}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
                    style={{
                      borderColor: COLORS.primarySoft,
                      background: COLORS.primaryTint,
                      color: COLORS.primaryActive,
                    }}
                  >
                    System operational
                  </span>
                  <span
                    className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
                    style={{
                      borderColor: "#fde68a",
                      background: "#fffbeb",
                      color: "#92400e",
                    }}
                  >
                    19 pending reviews
                  </span>
                  <DashboardThemeToggle />
                  <DashboardNotificationButton role="Admin" />
                  <DashboardProfileButton role="Admin" />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                layout="position"
                initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(1.5px)" }}
                transition={routeTransition}
                className="p-5 md:p-6"
              >
                {detailContent ?? (
                  <>
                {view === "overview" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Pending verification"
                        value="19"
                        helper="8 medium risk"
                        icon={FileCheck2}
                      />
                      <DashboardStatCard
                        label="Open moderation"
                        value="7"
                        helper="1 high severity"
                        icon={Flag}
                      />
                      <DashboardStatCard
                        label="Active subscriptions"
                        value="312"
                        helper="KES 46.8K MRR"
                        icon={CreditCard}
                      />
                      <DashboardStatCard
                        label="System health"
                        value="99.96%"
                        helper="1 service in review"
                        icon={Gauge}
                      />
                    </div>

                    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="grid gap-5">
                        <div
                          className="rounded-[18px] border bg-white p-5"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p
                                className="text-[16px] font-semibold leading-[1.25]"
                                style={{ color: COLORS.ink }}
                              >
                                Admin command center
                              </p>
                              <p
                                className="mt-1 text-[13px] leading-[1.23]"
                                style={{ color: COLORS.muted }}
                              >
                                High-priority operational work across
                                verification, moderation, subscriptions,
                                invites, and system health.
                              </p>
                            </div>
                            <StatusChip status="ACTIVE" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              {
                                label: "Review queue",
                                icon: FileCheck2,
                                action: () => selectView("verification"),
                                primary: true,
                              },
                              {
                                label: "Moderation",
                                icon: Flag,
                                action: () => selectView("moderation"),
                              },
                              {
                                label: "Invites",
                                icon: Send,
                                action: () => selectView("invites"),
                              },
                              {
                                label: "Health",
                                icon: Gauge,
                                action: () => selectView("monitoring"),
                              },
                            ].map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.label}
                                  onClick={item.action}
                                  className={
                                    item.primary
                                      ? "group inline-flex h-9 min-w-fit items-center gap-2 rounded-full border px-3 text-left text-white transition-transform hover:-translate-y-0.5"
                                      : "group inline-flex h-9 min-w-fit items-center gap-2 rounded-full border bg-white px-3 text-left transition-transform hover:-translate-y-0.5 hover:bg-[#f7f7f7]"
                                  }
                                  style={
                                    item.primary
                                      ? {
                                          borderColor: COLORS.primary,
                                          background: COLORS.primary,
                                          boxShadow: softShadow,
                                        }
                                      : {
                                          borderColor: COLORS.hairlineSoft,
                                          color: COLORS.ink,
                                          boxShadow: softShadow,
                                        }
                                  }
                                >
                                  <Icon
                                    size={14}
                                    className="shrink-0"
                                    style={{
                                      color: item.primary
                                        ? COLORS.canvas
                                        : COLORS.primary,
                                    }}
                                  />
                                  <span className="whitespace-nowrap text-[12px] font-semibold leading-none">
                                    {item.label}
                                  </span>
                                  <ChevronRight
                                    size={13}
                                    className="shrink-0 transition-transform group-hover:translate-x-0.5"
                                  />
                                </button>
                              );
                            })}
                          </div>{" "}
                        </div>

                        <div
                          className="rounded-[18px] border bg-white p-5"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <div
                            className="mb-4 flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between"
                            style={{ borderColor: COLORS.hairlineSoft }}
                          >
                            <div>
                              <p
                                className="text-[16px] font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                Operational trend
                              </p>
                              <p
                                className="mt-1 text-[13px] leading-[1.23]"
                                style={{ color: COLORS.muted }}
                              >
                                Snapshot of verification, moderation, invite,
                                and system-health pressure over the current
                                week.
                              </p>
                            </div>
                            <span
                              className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
                              style={{
                                borderColor: COLORS.primarySoft,
                                background: COLORS.primaryTint,
                                color: COLORS.primaryActive,
                              }}
                            >
                              7 day view
                            </span>
                          </div>
                          <AdminLineChart
                            values={[31, 42, 38, 54, 47, 63, 58]}
                            labels={[
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                              "Sun",
                            ]}
                          />
                        </div>

                        <div
                          className="rounded-[18px] border bg-white p-5"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <p
                                className="text-[16px] font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                Recent admin activity
                              </p>
                              <p
                                className="mt-1 text-[13px]"
                                style={{ color: COLORS.muted }}
                              >
                                Latest operational events that need visibility.
                              </p>
                            </div>
                            <Activity
                              size={18}
                              style={{ color: COLORS.primary }}
                            />
                          </div>
                          <div className="grid gap-2">
                            {[
                              [
                                "Verification submitted",
                                "Grace Wanjiku uploaded trade evidence.",
                                "12m",
                                "verification",
                              ],
                              [
                                "Moderation flag opened",
                                "Abusive message report assigned to safety.",
                                "38m",
                                "moderation",
                              ],
                              [
                                "Subscription renewal failed",
                                "Premium artisan renewal needs retry.",
                                "2h",
                                "settings",
                              ],
                              [
                                "Search index refreshed",
                                "Location coverage index completed.",
                                "4h",
                                "locations",
                              ],
                            ].map(([title, body, time, target], index) => (
                              <button
                                key={title}
                                onClick={() =>
                                  selectView(target as AdminCoreView)
                                }
                                className="grid cursor-pointer grid-cols-[10px_1fr_auto] gap-3 rounded-[14px] p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                                style={{
                                  background:
                                    index % 2 === 1
                                      ? COLORS.surfaceSoft
                                      : COLORS.canvas,
                                }}
                              >
                                <span
                                  className="mt-2 h-2.5 w-2.5 rounded-full"
                                  style={{
                                    background:
                                      index === 0
                                        ? COLORS.primary
                                        : COLORS.hairline,
                                  }}
                                />
                                <span className="min-w-0">
                                  <span
                                    className="block truncate text-[14px] font-semibold"
                                    style={{ color: COLORS.ink }}
                                  >
                                    {title}
                                  </span>
                                  <span
                                    className="mt-0.5 block truncate text-[13px]"
                                    style={{ color: COLORS.muted }}
                                  >
                                    {body}
                                  </span>
                                </span>
                                <span
                                  className="text-[12px]"
                                  style={{ color: COLORS.mutedSoft }}
                                >
                                  {time}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <aside className="grid self-start gap-5">
                        <div
                          className="rounded-[18px] border p-5"
                          style={{
                            borderColor: COLORS.primarySoft,
                            background: COLORS.primaryTint,
                          }}
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <p
                              className="text-[16px] font-semibold"
                              style={{ color: COLORS.primaryActive }}
                            >
                              Operational priorities
                            </p>
                            <Sparkles
                              size={18}
                              style={{ color: COLORS.primary }}
                            />
                          </div>
                          <div className="grid gap-2">
                            {[
                              ["Clear medium-risk verifications", "8 records"],
                              ["Resolve high severity report", "1 flag"],
                              ["Review notification latency", "238ms"],
                              ["Refresh location coverage", "6 cities"],
                            ].map(([label, value]) => (
                              <div
                                key={label}
                                className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-3 py-2 text-[13px]"
                              >
                                <span
                                  className="min-w-0 truncate"
                                  style={{ color: COLORS.body }}
                                >
                                  {label}
                                </span>
                                <strong style={{ color: COLORS.ink }}>
                                  {value}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div
                          className="rounded-[18px] border bg-white p-5"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <p
                            className="text-[16px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            System snapshot
                          </p>
                          <div className="mt-4 grid gap-3">
                            {[
                              ["API", "99.99%", "ACTIVE" as const],
                              ["Database", "99.95%", "ACTIVE" as const],
                              ["Notifications", "238ms", "REVIEW" as const],
                              ["Search index", "Fresh", "ACTIVE" as const],
                            ].map(([service, metric, status]) => (
                              <button
                                key={service}
                                onClick={() => selectView("monitoring")}
                                className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                                style={{ borderColor: COLORS.hairlineSoft }}
                              >
                                <span>
                                  <span
                                    className="block text-[14px] font-semibold"
                                    style={{ color: COLORS.ink }}
                                  >
                                    {service}
                                  </span>
                                  <span
                                    className="mt-1 block text-[13px]"
                                    style={{ color: COLORS.muted }}
                                  >
                                    {metric}
                                  </span>
                                </span>
                                <StatusChip status={status} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div
                          className="rounded-[18px] border bg-white p-5"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <p
                            className="text-[16px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            Revenue snapshot
                          </p>
                          <p
                            className="mt-1 text-[13px]"
                            style={{ color: COLORS.muted }}
                          >
                            Subscription-only billing during cash job testing.
                          </p>
                          <div
                            className="mt-4 grid gap-3 text-[14px]"
                            style={{ color: COLORS.body }}
                          >
                            <p className="flex justify-between">
                              <span>MRR</span>
                              <strong style={{ color: COLORS.ink }}>
                                KES 46.8K
                              </strong>
                            </p>
                            <p className="flex justify-between">
                              <span>Premium artisans</span>
                              <strong style={{ color: COLORS.ink }}>312</strong>
                            </p>
                            <p className="flex justify-between">
                              <span>Failed renewals</span>
                              <strong style={{ color: "#c2410c" }}>12</strong>
                            </p>
                          </div>
                          <button
                            onClick={() => selectView("settings")}
                            className="mt-4 h-10 w-full cursor-pointer rounded-lg border px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                            style={{
                              borderColor: COLORS.hairline,
                              color: COLORS.ink,
                            }}
                          >
                            Review billing policy
                          </button>
                        </div>
                      </aside>
                    </div>
                  </div>
                )}

                {view === "verification" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Pending reviews"
                        value={String(
                          verificationQueue.filter(
                            (record) =>
                              record.status === "PENDING" ||
                              record.status === "REVIEW",
                          ).length,
                        )}
                        helper="Awaiting decision"
                        icon={FileCheck2}
                      />
                      <DashboardStatCard
                        label="Low risk"
                        value={String(
                          verificationQueue.filter(
                            (record) => record.risk === "Low",
                          ).length,
                        )}
                        helper="Likely approvable"
                        icon={ShieldCheck}
                      />
                      <DashboardStatCard
                        label="Medium risk"
                        value={String(
                          verificationQueue.filter(
                            (record) => record.risk === "Medium",
                          ).length,
                        )}
                        helper="Needs closer review"
                        icon={Flag}
                      />
                      <DashboardStatCard
                        label="SLA target"
                        value="24h"
                        helper="Review turnaround"
                        icon={Gauge}
                      />
                    </div>

                    <div className="grid gap-4">
                      <BulkActionPanel
                        selectedCount={selectedVerificationIds.length}
                        noun="verification records"
                        onAction={(action) =>
                          openBulkAction(
                            action,
                            "verification records",
                            selectedVerificationIds.length,
                          )
                        }
                        onClear={() => setSelectedVerificationIds([])}
                      />
                      <div
                        className="overflow-hidden rounded-[18px] border bg-white"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <div
                          className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background: COLORS.surfaceSoft,
                          }}
                        >
                          <div>
                            <p
                              className="text-[16px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              Verification queue
                            </p>
                            <p
                              className="mt-1 text-[13px]"
                              style={{ color: COLORS.muted }}
                            >
                              Bulk approve low-risk records, assign manual
                              review batches, export evidence, or reject unsafe
                              submissions.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedVerificationIds(
                                selectedVerificationIds.length ===
                                  verificationQueue.length
                                  ? []
                                  : verificationQueue.map((row) => row.id),
                              )
                            }
                            className="h-9 rounded-full border px-3 text-[12px] font-semibold"
                            style={{
                              borderColor: COLORS.hairlineSoft,
                              background: COLORS.canvas,
                              color: COLORS.ink,
                            }}
                          >
                            {selectedVerificationIds.length ===
                            verificationQueue.length
                              ? "Deselect all"
                              : "Select all"}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[860px] text-left text-[13px]">
                            <thead>
                              <tr style={{ color: COLORS.muted }}>
                                <th className="w-12 px-4 py-3"></th>
                                <th className="px-4 py-3 font-semibold">
                                  Artisan
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  County
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Documents
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Risk
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-right font-semibold">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {verificationQueue.map((row, index) => {
                                const selected =
                                  selectedVerificationIds.includes(row.id);
                                return (
                                  <tr
                                    key={row.id}
                                    onClick={() =>
                                      openAdminQuickDetail({
                                        title: row.name,
                                        subtitle: `${row.profession} · ${row.county}`,
                                        status: row.status,
                                        description: `Review ${row.documents.join(", ")} before changing verification status.`,
                                        metrics: [
                                          ["Risk", row.risk],
                                          [
                                            "Documents",
                                            `${row.documents.length}`,
                                          ],
                                          ["Submitted", row.submitted],
                                          ["County", row.county],
                                        ],
                                      })
                                    }
                                    className="cursor-pointer border-t transition-colors hover:bg-[#f7f7f7]"
                                    style={{
                                      borderColor: COLORS.hairlineSoft,
                                      background: selected
                                        ? "#ecfdf5"
                                        : index % 2 === 1
                                          ? COLORS.surfaceSoft
                                          : COLORS.canvas,
                                    }}
                                  >
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                        onChange={(event) =>
                                          setSelectedVerificationIds(
                                            (current) =>
                                              event.target.checked
                                                ? [...current, row.id]
                                                : current.filter(
                                                    (id) => id !== row.id,
                                                  ),
                                          )
                                        }
                                        className="h-4 w-4 cursor-pointer rounded"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <UserListIdentity
                                        name={row.name}
                                        meta={`${row.profession} · submitted ${row.submitted}`}
                                      />
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{ color: COLORS.body }}
                                    >
                                      {row.county}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{ color: COLORS.body }}
                                    >
                                      {row.documents.length} files
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{ color: COLORS.body }}
                                    >
                                      {row.risk}
                                    </td>
                                    <td className="px-4 py-3">
                                      <StatusChip status={row.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          openVerificationReviewModal(row);
                                        }}
                                        className="cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[#f7f7f7]"
                                        style={{
                                          borderColor: COLORS.hairlineSoft,
                                          color: COLORS.ink,
                                        }}
                                      >
                                        Review
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {view === "artisans" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Verified artisans"
                        value={String(
                          artisans.filter((artisan) => artisan.isVerified)
                            .length,
                        )}
                        helper="Eligible for search"
                        icon={BadgeCheck}
                      />
                      <DashboardStatCard
                        label="Premium artisans"
                        value={String(
                          artisans.filter((artisan) => artisan.isPremium)
                            .length,
                        )}
                        helper="Priority placement"
                        icon={Sparkles}
                      />
                      <DashboardStatCard
                        label="Available now"
                        value={String(
                          artisans.filter((artisan) => artisan.isAvailable)
                            .length,
                        )}
                        helper="Can accept requests"
                        icon={CalendarDays}
                      />
                      <DashboardStatCard
                        label="Average rating"
                        value="4.8"
                        helper="Across visible artisans"
                        icon={Star}
                      />
                    </div>
                    <DashboardDataList
                      title="Artisan directory management"
                      subtitle="Search, inspect, verify, suspend, and manage marketplace artisan visibility. Click a row for quick detail, or Inspect for the full admin workflow."
                      rows={artisans}
                      rowKey={(artisan) => artisan.id}
                      getSearchText={(artisan) =>
                        `${artisan.name} ${artisan.profession} ${artisan.location.city} ${artisan.location.county} ${artisan.isVerified ? "verified" : "pending"} ${artisan.isPremium ? "premium" : "standard"}`
                      }
                      filters={[
                        {
                          id: "profession",
                          label: "Profession",
                          allLabel: "All professions",
                          options: Array.from(
                            new Set(
                              artisans.map((artisan) => artisan.profession),
                            ),
                          ),
                          getValue: (artisan) => artisan.profession,
                        },
                        {
                          id: "verification",
                          label: "Verification",
                          allLabel: "All states",
                          options: ["Verified", "Pending"],
                          getValue: (artisan) =>
                            artisan.isVerified ? "Verified" : "Pending",
                        },
                        {
                          id: "plan",
                          label: "Plan",
                          allLabel: "All plans",
                          options: ["Premium", "Standard"],
                          getValue: (artisan) =>
                            artisan.isPremium ? "Premium" : "Standard",
                        },
                      ]}
                      sortOptions={[
                        {
                          id: "rating",
                          label: "Sort: Rating",
                          sort: (a, b) => b.rating.average - a.rating.average,
                        },
                        {
                          id: "name",
                          label: "Sort: Name",
                          sort: (a, b) => a.name.localeCompare(b.name),
                        },
                        {
                          id: "rate",
                          label: "Sort: Rate",
                          sort: (a, b) => b.hourlyRate - a.hourlyRate,
                        },
                      ]}
                      columns={[
                        {
                          header: "Artisan",
                          render: (artisan) => (
                            <UserListIdentity
                              name={artisan.name}
                              image={artisan.profileImage}
                              meta={`${artisan.profession} · ${artisan.location.city}, ${artisan.location.county}`}
                            />
                          ),
                        },
                        {
                          header: "Rating",
                          render: (artisan) => (
                            <span style={{ color: COLORS.body }}>
                              {artisan.rating.average.toFixed(1)} ·{" "}
                              {artisan.rating.total} reviews
                            </span>
                          ),
                        },
                        {
                          header: "Rate",
                          render: (artisan) => (
                            <span
                              className="font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              KES {artisan.hourlyRate.toLocaleString()}
                            </span>
                          ),
                        },
                        {
                          header: "Status",
                          render: (artisan) => (
                            <StatusChip
                              status={
                                artisan.isVerified ? "VERIFIED" : "PENDING"
                              }
                            />
                          ),
                        },
                      ]}
                      onRowClick={(artisan) =>
                        openAdminQuickDetail({
                          title: artisan.name,
                          subtitle: `${artisan.profession} · ${artisan.location.city}, ${artisan.location.county}`,
                          status: artisan.isVerified ? "VERIFIED" : "PENDING",
                          description: `${artisan.name} is ${artisan.isVerified ? "verified and eligible for public search" : "awaiting verification review"}. Admin can inspect profile evidence, rating history, subscription state, and marketplace visibility before taking action.`,
                          metrics: [
                            ["Rating", artisan.rating.average.toFixed(1)],
                            ["Reviews", String(artisan.rating.total)],
                            [
                              "Rate",
                              `KES ${artisan.hourlyRate.toLocaleString()}`,
                            ],
                            [
                              "Plan",
                              artisan.isPremium ? "Premium" : "Standard",
                            ],
                          ],
                        })
                      }
                      onView={(artisan) =>
                        openAdminFullDetail({
                          title: `Inspect ${artisan.name}`,
                          subtitle: `${artisan.profession} profile administration`,
                          status: artisan.isVerified ? "VERIFIED" : "PENDING",
                          description:
                            "Full admin inspection includes identity evidence, portfolio quality, subscription state, moderation history, verification decisions, and public search eligibility.",
                          metrics: [
                            ["County", artisan.location.county],
                            [
                              "Availability",
                              artisan.isAvailable ? "Available" : "Unavailable",
                            ],
                            [
                              "Verification",
                              artisan.isVerified ? "Verified" : "Pending",
                            ],
                            ["Premium", artisan.isPremium ? "Yes" : "No"],
                          ],
                        })
                      }
                      viewLabel="Inspect"
                    />
                  </div>
                )}

                {view === "users" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Total users"
                        value="2,418"
                        helper="Client and artisan accounts"
                        icon={UserRound}
                      />
                      <DashboardStatCard
                        label="Clients"
                        value="1,746"
                        helper="Active requesters"
                        icon={UserRound}
                      />
                      <DashboardStatCard
                        label="Artisans"
                        value="672"
                        helper="Marketplace supply"
                        icon={Hammer}
                      />
                      <DashboardStatCard
                        label="Flagged users"
                        value="3"
                        helper="Needs moderation"
                        icon={Flag}
                      />
                    </div>
                    <DashboardDataList
                      title="User account management"
                      subtitle="Search users by name, email, role, risk, and status. Row click opens an at-a-glance admin detail panel."
                      rows={userRows}
                      rowKey={(user) => user.id}
                      getSearchText={(user) =>
                        `${user.name} ${user.email} ${user.role} ${user.status} ${user.meta} ${user.risk}`
                      }
                      filters={[
                        {
                          id: "role",
                          label: "Role",
                          allLabel: "All roles",
                          options: ["Client", "Artisan"],
                          getValue: (user) => user.role,
                        },
                        {
                          id: "status",
                          label: "Status",
                          allLabel: "All statuses",
                          options: ["ACTIVE", "VERIFIED", "REVIEW"],
                          getValue: (user) => user.status,
                        },
                        {
                          id: "risk",
                          label: "Risk",
                          allLabel: "All risk levels",
                          options: ["Low", "High"],
                          getValue: (user) => user.risk,
                        },
                      ]}
                      sortOptions={[
                        {
                          id: "name",
                          label: "Sort: Name",
                          sort: (a, b) => a.name.localeCompare(b.name),
                        },
                        {
                          id: "role",
                          label: "Sort: Role",
                          sort: (a, b) => a.role.localeCompare(b.role),
                        },
                        {
                          id: "risk",
                          label: "Sort: Risk",
                          sort: (a, b) => b.risk.localeCompare(a.risk),
                        },
                      ]}
                      columns={[
                        {
                          header: "User",
                          render: (user) => (
                            <UserListIdentity
                              name={user.name}
                              meta={user.email}
                            />
                          ),
                        },
                        {
                          header: "Role",
                          render: (user) => (
                            <span style={{ color: COLORS.body }}>
                              {user.role}
                            </span>
                          ),
                        },
                        {
                          header: "Meta",
                          render: (user) => (
                            <span
                              className="truncate"
                              style={{ color: COLORS.body }}
                            >
                              {user.meta}
                            </span>
                          ),
                        },
                        {
                          header: "Status",
                          render: (user) => <StatusChip status={user.status} />,
                        },
                      ]}
                      onRowClick={(user) =>
                        openAdminQuickDetail({
                          title: user.name,
                          subtitle: `${user.role} · ${user.email}`,
                          status: user.status,
                          description: `Account risk is ${user.risk.toLowerCase()}. ${user.meta}. Admin can inspect activity, messages, jobs, verification state, and moderation flags before applying restrictions.`,
                          metrics: [
                            ["Role", user.role],
                            ["Risk", user.risk],
                            ["Status", user.status],
                            ["Account", user.email],
                          ],
                        })
                      }
                      onView={(user) =>
                        openAdminFullDetail({
                          title: `Inspect ${user.name}`,
                          subtitle: `${user.role} account controls`,
                          status: user.status,
                          description:
                            "Full user inspection includes account activity, role-specific records, linked jobs, conversation reports, moderation flags, and suspension controls.",
                          metrics: [
                            ["Email", user.email],
                            ["Role", user.role],
                            ["Risk", user.risk],
                            ["Meta", user.meta],
                          ],
                        })
                      }
                      viewLabel="Inspect"
                    />
                  </div>
                )}

                {view === "invites" && (
                  <div className="grid gap-6">
                    <div
                      className="rounded-[18px] border p-5"
                      style={{
                        borderColor: COLORS.hairlineSoft,
                        background: COLORS.surfaceSoft,
                      }}
                    >
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p
                            className="text-[16px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            Send artisan invite
                          </p>
                          <p
                            className="mt-1 text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            Create a role-aware onboarding invite. The invite
                            history below remains the primary list workflow.
                          </p>
                        </div>
                        <StatusChip status="ACTIVE" />
                      </div>
                      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)_auto] xl:items-start">
                        <input
                          placeholder="artisan@example.com"
                          className="h-12 min-w-0 rounded-lg border bg-white px-3 text-[14px] outline-none"
                          style={{ borderColor: COLORS.hairline }}
                        />
                        <select
                          className="h-12 min-w-0 cursor-pointer rounded-lg border bg-white px-3 text-[14px] outline-none"
                          style={{
                            borderColor: COLORS.hairline,
                            color: COLORS.ink,
                          }}
                        >
                          <option>Artisan role</option>
                          <option>Admin role</option>
                        </select>
                        <textarea
                          placeholder="Optional invite note"
                          className="min-h-12 min-w-0 rounded-lg border bg-white px-3 py-3 text-[14px] outline-none"
                          style={{ borderColor: COLORS.hairline }}
                        />
                        <button
                          className="h-12 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                          style={{ background: COLORS.primary }}
                        >
                          Send invite
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div
                        className="rounded-[18px] border bg-white p-4"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p
                              className="text-[16px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              Bulk invite workspace
                            </p>
                            <p
                              className="mt-1 max-w-[700px] text-[13px] leading-[1.23]"
                              style={{ color: COLORS.muted }}
                            >
                              Paste emails, upload CSV later, or select existing
                              invite rows for controlled resend, revoke,
                              assignment, approval, and export flows.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openBulkAction("resend", "new invites", 24)
                              }
                              className="h-10 rounded-full px-4 text-[13px] font-semibold"
                              style={{
                                background: COLORS.primary,
                                color: "white",
                              }}
                            >
                              Import CSV
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openBulkAction("resend", "draft invites", 12)
                              }
                              className="h-10 rounded-full border px-4 text-[13px] font-semibold"
                              style={{
                                borderColor: COLORS.hairlineSoft,
                                background: COLORS.canvas,
                                color: COLORS.ink,
                              }}
                            >
                              Send batch
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          {[
                            ["Parsed emails", "24", "CSV or pasted list"],
                            ["Invalid rows", "2", "Needs correction"],
                            ["Duplicate invites", "3", "Will be skipped"],
                          ].map(([label, value, helper]) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() =>
                                openBulkAction(
                                  "export",
                                  label.toLowerCase(),
                                  Number(value) || 1,
                                )
                              }
                              className="rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                              style={{
                                borderColor: COLORS.hairlineSoft,
                                background: COLORS.surfaceSoft,
                              }}
                            >
                              <p
                                className="text-[12px]"
                                style={{ color: COLORS.muted }}
                              >
                                {label}
                              </p>
                              <p
                                className="mt-1 text-[22px] font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                {value}
                              </p>
                              <p
                                className="mt-1 text-[12px]"
                                style={{ color: COLORS.muted }}
                              >
                                {helper}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <BulkActionPanel
                        selectedCount={selectedInviteEmails.length}
                        noun="invites"
                        onAction={(action) =>
                          openBulkAction(
                            action,
                            "invites",
                            selectedInviteEmails.length,
                          )
                        }
                        onClear={() => setSelectedInviteEmails([])}
                      />

                      <div
                        className="overflow-hidden rounded-[18px] border bg-white"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <div
                          className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            background: COLORS.surfaceSoft,
                          }}
                        >
                          <div>
                            <p
                              className="text-[16px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              Invite history
                            </p>
                            <p
                              className="mt-1 text-[13px]"
                              style={{ color: COLORS.muted }}
                            >
                              Role-aware invite tokens, expiry, acceptance, and
                              onboarding status.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedInviteEmails(
                                selectedInviteEmails.length ===
                                  inviteRows.length
                                  ? []
                                  : inviteRows.map((row) => row.email),
                              )
                            }
                            className="h-9 rounded-full border px-3 text-[12px] font-semibold"
                            style={{
                              borderColor: COLORS.hairlineSoft,
                              background: COLORS.canvas,
                              color: COLORS.ink,
                            }}
                          >
                            {selectedInviteEmails.length === inviteRows.length
                              ? "Deselect all"
                              : "Select all"}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[760px] text-left text-[13px]">
                            <thead>
                              <tr style={{ color: COLORS.muted }}>
                                <th className="w-12 px-4 py-3"></th>
                                <th className="px-4 py-3 font-semibold">
                                  Invitee
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Role
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Sent
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-right font-semibold">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {inviteRows.map((row, index) => {
                                const selected = selectedInviteEmails.includes(
                                  row.email,
                                );
                                return (
                                  <tr
                                    key={row.email}
                                    className="border-t"
                                    style={{
                                      borderColor: COLORS.hairlineSoft,
                                      background: selected
                                        ? "#ecfdf5"
                                        : index % 2 === 1
                                          ? COLORS.surfaceSoft
                                          : COLORS.canvas,
                                    }}
                                  >
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(event) =>
                                          setSelectedInviteEmails((current) =>
                                            event.target.checked
                                              ? [...current, row.email]
                                              : current.filter(
                                                  (email) =>
                                                    email !== row.email,
                                                ),
                                          )
                                        }
                                        className="h-4 w-4 rounded"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <UserListIdentity
                                        name={row.email}
                                        meta={`${row.role} invite · ${row.sent}`}
                                      />
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{ color: COLORS.body }}
                                    >
                                      {row.role}
                                    </td>
                                    <td
                                      className="px-4 py-3"
                                      style={{ color: COLORS.body }}
                                    >
                                      {row.sent}
                                    </td>
                                    <td className="px-4 py-3">
                                      <StatusChip status={row.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openAdminQuickDetail({
                                            title: `Inspect invite`,
                                            subtitle: `${row.email} · ${row.role}`,
                                            status: row.status,
                                            description:
                                              "Full invite inspection would include token expiry, acceptance timeline, resend controls, onboarding completion, and audit history.",
                                            metrics: [
                                              ["Email", row.email],
                                              ["Role", row.role],
                                              ["Sent", row.sent],
                                              ["Token", "Role locked"],
                                            ],
                                          })
                                        }
                                        className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                                        style={{
                                          borderColor: COLORS.hairlineSoft,
                                          color: COLORS.ink,
                                        }}
                                      >
                                        Inspect
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {view === "moderation" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Open flags"
                        value={String(moderationRows.length)}
                        helper="Needs triage"
                        icon={Flag}
                      />
                      <DashboardStatCard
                        label="High severity"
                        value={String(
                          moderationRows.filter(
                            (row) => row.severity === "High",
                          ).length,
                        )}
                        helper="Escalate first"
                        icon={Ban}
                      />
                      <DashboardStatCard
                        label="Policy scans"
                        value={String(
                          moderationRows.filter(
                            (row) =>
                              row.source.includes("scan") ||
                              row.source.includes("check"),
                          ).length,
                        )}
                        helper="Automated signals"
                        icon={ShieldCheck}
                      />
                      <DashboardStatCard
                        label="Avg response"
                        value="2.4h"
                        helper="Moderation SLA"
                        icon={Gauge}
                      />
                    </div>

                    <DashboardDataList
                      title="Moderation queue"
                      subtitle="Flagged accounts, reports, listing-quality issues, and automated risk signals. Click a row for quick context, or Inspect for the full moderation workflow."
                      rows={moderationRows}
                      rowKey={(row) => row.id}
                      getSearchText={(row) =>
                        `${row.title} ${row.body} ${row.status} ${row.severity} ${row.target} ${row.source} ${row.owner}`
                      }
                      filters={[
                        {
                          id: "status",
                          label: "Status",
                          allLabel: "All statuses",
                          options: ["PENDING", "REVIEW"],
                          getValue: (row) => row.status,
                        },
                        {
                          id: "severity",
                          label: "Severity",
                          allLabel: "All severities",
                          options: ["Low", "Medium", "High"],
                          getValue: (row) => row.severity,
                        },
                        {
                          id: "target",
                          label: "Target",
                          allLabel: "All targets",
                          options: Array.from(
                            new Set(moderationRows.map((row) => row.target)),
                          ),
                          getValue: (row) => row.target,
                        },
                      ]}
                      sortOptions={[
                        {
                          id: "severity",
                          label: "Sort: Severity",
                          sort: (a, b) => b.severity.localeCompare(a.severity),
                        },
                        {
                          id: "target",
                          label: "Sort: Target",
                          sort: (a, b) => a.target.localeCompare(b.target),
                        },
                        {
                          id: "title",
                          label: "Sort: Issue",
                          sort: (a, b) => a.title.localeCompare(b.title),
                        },
                      ]}
                      columns={[
                        {
                          header: "Issue",
                          render: (row) => (
                            <span>
                              <span
                                className="block truncate font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                {row.title}
                              </span>
                              <span
                                className="mt-1 block truncate text-[13px]"
                                style={{ color: COLORS.muted }}
                              >
                                {row.body}
                              </span>
                            </span>
                          ),
                        },
                        {
                          header: "Target",
                          render: (row) => (
                            <span style={{ color: COLORS.body }}>
                              {row.target}
                            </span>
                          ),
                        },
                        {
                          header: "Severity",
                          render: (row) => (
                            <span
                              style={{
                                color:
                                  row.severity === "High"
                                    ? "#c2410c"
                                    : row.severity === "Medium"
                                      ? "#92400e"
                                      : COLORS.body,
                              }}
                            >
                              {row.severity}
                            </span>
                          ),
                        },
                        {
                          header: "Status",
                          render: (row) => <StatusChip status={row.status} />,
                        },
                      ]}
                      onRowClick={(row) =>
                        openAdminQuickDetail({
                          title: row.title,
                          subtitle: `${row.target} · ${row.severity} severity`,
                          status: row.status,
                          description: `${row.body} Source: ${row.source}. Owner: ${row.owner}. Inspect the full moderation record before taking action.`,
                          metrics: [
                            ["Target", row.target],
                            ["Severity", row.severity],
                            ["Source", row.source],
                            ["Owner", row.owner],
                          ],
                        })
                      }
                      onView={(row) =>
                        openAdminFullDetail({
                          title: `Inspect ${row.title}`,
                          subtitle: `${row.target} · ${row.source}`,
                          status: row.status,
                          description: `Full moderation workflow for this record. ${row.body} Actions support resolve, request more information, escalate enforcement, and audit the final decision.`,
                          metrics: [
                            ["Severity", row.severity],
                            ["Target", row.target],
                            ["Source", row.source],
                            ["Owner", row.owner],
                          ],
                        })
                      }
                      viewLabel="Inspect"
                    />
                  </div>
                )}

                {view === "analytics" &&
                  (() => {
                    const analyticsData = {
                      today: {
                        labels: ["8a", "10a", "12p", "2p", "4p", "6p"],
                        growth: [18, 26, 31, 45, 54, 62],
                        conversion: [24, 28, 35, 33, 41, 47],
                        revenue: [12, 18, 21, 29, 33, 38],
                        stats: ["KES 84K", "1.9K", "186", "38%"],
                        helper: "Today",
                      },
                      week: {
                        labels: [
                          "Mon",
                          "Tue",
                          "Wed",
                          "Thu",
                          "Fri",
                          "Sat",
                          "Sun",
                        ],
                        growth: [42, 48, 51, 58, 64, 72, 78],
                        conversion: [32, 34, 38, 36, 41, 44, 46],
                        revenue: [38, 44, 52, 49, 58, 63, 70],
                        stats: ["KES 436K", "6.2K", "512", "41%"],
                        helper: "This week",
                      },
                      month: {
                        labels: ["W1", "W2", "W3", "W4", "Now"],
                        growth: [36, 46, 58, 68, 84],
                        conversion: [34, 38, 42, 40, 42],
                        revenue: [28, 41, 55, 67, 81],
                        stats: ["KES 1.8M", "18.4K", "1,486", "42%"],
                        helper: "This month",
                      },
                      quarter: {
                        labels: ["M1", "M2", "M3"],
                        growth: [54, 71, 88],
                        conversion: [39, 43, 45],
                        revenue: [62, 76, 91],
                        stats: ["KES 5.6M", "54.2K", "4,212", "45%"],
                        helper: "This quarter",
                      },
                    }[analyticsRange];
                    const activeValues = analyticsData[analyticsCategory];
                    const categoryCopy = {
                      growth: {
                        title: "Marketplace growth",
                        subtitle:
                          "Search demand, profile views, message starts, and verified supply momentum.",
                      },
                      conversion: {
                        title: "Conversion funnel",
                        subtitle:
                          "Profile views to message starts, quote requests, accepted quotes, and completed jobs.",
                      },
                      revenue: {
                        title: "Subscription and GMV signal",
                        subtitle:
                          "Subscription revenue, premium conversion, renewal health, and cash-mode GMV estimates.",
                      },
                    }[analyticsCategory];
                    const categoryRows =
                      analyticsCategory === "growth"
                        ? [
                            {
                              metric: "Searches",
                              value: analyticsData.stats[1],
                              delta: "+14.2%",
                              status: "ACTIVE" as const,
                            },
                            {
                              metric: "Profile views",
                              value: "7,912",
                              delta: "+9.7%",
                              status: "ACTIVE" as const,
                            },
                            {
                              metric: "Message starts",
                              value: analyticsData.stats[2],
                              delta: "+6.1%",
                              status: "ACTIVE" as const,
                            },
                            {
                              metric: "Verified supply",
                              value: "672",
                              delta: "+8.4%",
                              status: "ACTIVE" as const,
                            },
                          ]
                        : analyticsCategory === "conversion"
                          ? [
                              {
                                metric: "Profile to message",
                                value: "18.8%",
                                delta: "+2.4%",
                                status: "ACTIVE" as const,
                              },
                              {
                                metric: "Message to quote",
                                value: "63%",
                                delta: "+3.1%",
                                status: "ACTIVE" as const,
                              },
                              {
                                metric: "Quote acceptance",
                                value: analyticsData.stats[3],
                                delta: "-1.8%",
                                status: "REVIEW" as const,
                              },
                              {
                                metric: "Completion rate",
                                value: "71%",
                                delta: "+4.6%",
                                status: "ACTIVE" as const,
                              },
                            ]
                          : [
                              {
                                metric: "GMV signal",
                                value: analyticsData.stats[0],
                                delta: "+11.8%",
                                status: "ACTIVE" as const,
                              },
                              {
                                metric: "MRR",
                                value: "KES 46.8K",
                                delta: "+5.6%",
                                status: "ACTIVE" as const,
                              },
                              {
                                metric: "Premium artisans",
                                value: "312",
                                delta: "+7.2%",
                                status: "ACTIVE" as const,
                              },
                              {
                                metric: "Failed renewals",
                                value: "12",
                                delta: "-3.4%",
                                status: "REVIEW" as const,
                              },
                            ];

                    return (
                      <div className="grid gap-6">
                        <div
                          className="rounded-[18px] border bg-white p-4"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                              <p
                                className="text-[16px] font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                Marketplace analytics
                              </p>
                              <p
                                className="mt-1 max-w-[720px] text-[13px] leading-[1.23]"
                                style={{ color: COLORS.muted }}
                              >
                                Operational signal layer for supply, demand,
                                quote conversion, revenue health, and
                                subscription performance.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <FluidPillTabs
                                id="admin-analytics-range"
                                value={analyticsRange}
                                onChange={setAnalyticsRange}
                                dense
                                options={[
                                  { id: "today", label: "Today" },
                                  { id: "week", label: "Week" },
                                  { id: "month", label: "Month" },
                                  { id: "quarter", label: "Quarter" },
                                ]}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <DashboardStatCard
                            label="GMV signal"
                            value={analyticsData.stats[0]}
                            helper={`${analyticsData.helper} · cash-mode estimate`}
                            icon={TrendingUp}
                          />
                          <DashboardStatCard
                            label="Searches"
                            value={analyticsData.stats[1]}
                            helper="Discovery demand"
                            icon={Search}
                          />
                          <DashboardStatCard
                            label="Quote requests"
                            value={analyticsData.stats[2]}
                            helper="Public to dashboard"
                            icon={ReceiptText}
                          />
                          <DashboardStatCard
                            label="Conversion"
                            value={analyticsData.stats[3]}
                            helper="Quote accepted"
                            icon={BarChart3}
                          />
                        </div>

                        <div
                          className="rounded-[22px] border bg-white p-4"
                          style={{
                            borderColor: COLORS.hairlineSoft,
                            boxShadow: softShadow,
                          }}
                        >
                          <div
                            className="mb-4 flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between"
                            style={{ borderColor: COLORS.hairlineSoft }}
                          >
                            <div>
                              <p
                                className="text-[16px] font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                Analytics signal scope
                              </p>
                              <p
                                className="mt-1 max-w-[720px] text-[13px] leading-[1.23]"
                                style={{ color: COLORS.muted }}
                              >
                                This selector controls the chart and signal
                                health cards below.
                              </p>
                            </div>
                            <FluidPillTabs
                              id="admin-analytics-category"
                              value={analyticsCategory}
                              onChange={setAnalyticsCategory}
                              dense
                              options={[
                                { id: "growth", label: "Growth" },
                                { id: "conversion", label: "Conversion" },
                                { id: "revenue", label: "Revenue" },
                              ]}
                            />
                          </div>

                          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
                            <div
                              className="rounded-[18px] border bg-white p-5"
                              style={{ borderColor: COLORS.hairlineSoft }}
                            >
                              <div
                                className="mb-4 flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between"
                                style={{ borderColor: COLORS.hairlineSoft }}
                              >
                                <div className="min-w-0">
                                  <p
                                    className="text-[16px] font-semibold"
                                    style={{ color: COLORS.ink }}
                                  >
                                    {categoryCopy.title}
                                  </p>
                                  <p
                                    className="mt-1 max-w-[620px] text-[13px] leading-[1.23]"
                                    style={{ color: COLORS.muted }}
                                  >
                                    {categoryCopy.subtitle}
                                  </p>
                                </div>
                                <div className="flex shrink-0 justify-end self-start lg:self-center">
                                  <StableSegmentedTabs
                                    id="admin-analytics-viz"
                                    value={analyticsViz}
                                    onChange={setAnalyticsViz}
                                    size="compact"
                                    options={[
                                      {
                                        id: "trend",
                                        label: "Line",
                                        icon: Activity,
                                      },
                                      {
                                        id: "bars",
                                        label: "Bar",
                                        icon: BarChart3,
                                      },
                                      {
                                        id: "radial",
                                        label: "Radial",
                                        icon: Gauge,
                                      },
                                    ]}
                                  />
                                </div>
                              </div>
                              <AdminAnalyticsVisualization
                                type={analyticsViz}
                                values={activeValues}
                                labels={analyticsData.labels}
                              />
                              <div className="mt-5 grid gap-3 md:grid-cols-3">
                                {[
                                  [
                                    "Supply growth",
                                    "+8.4%",
                                    "Verified artisan base",
                                  ],
                                  [
                                    "Demand growth",
                                    "+14.2%",
                                    "Search activity",
                                  ],
                                  [
                                    "Quote velocity",
                                    "2.1h",
                                    "Median first response",
                                  ],
                                ].map(([label, value, helper]) => (
                                  <button
                                    key={label}
                                    onClick={() =>
                                      openAdminQuickDetail({
                                        title: label,
                                        subtitle: "Analytics insight",
                                        status: "ACTIVE",
                                        description: `${label} is ${value} for ${analyticsData.helper.toLowerCase()}.`,
                                        metrics: [
                                          ["Value", value],
                                          ["Range", analyticsData.helper],
                                          ["Category", analyticsCategory],
                                          ["Visualization", analyticsViz],
                                        ],
                                      })
                                    }
                                    className="rounded-[14px] border p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                                    style={{
                                      borderColor: COLORS.hairlineSoft,
                                      background: COLORS.surfaceSoft,
                                    }}
                                  >
                                    <p
                                      className="text-[13px]"
                                      style={{ color: COLORS.muted }}
                                    >
                                      {label}
                                    </p>
                                    <p
                                      className="mt-1 text-[18px] font-semibold"
                                      style={{ color: COLORS.ink }}
                                    >
                                      {value}
                                    </p>
                                    <p
                                      className="mt-1 text-[12px]"
                                      style={{ color: COLORS.muted }}
                                    >
                                      {helper}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div
                              className="overflow-hidden rounded-[18px] border bg-white"
                              style={{ borderColor: COLORS.hairlineSoft }}
                            >
                              <div
                                className="border-b px-4 py-3"
                                style={{
                                  borderColor: COLORS.hairlineSoft,
                                  background: COLORS.surfaceSoft,
                                }}
                              >
                                <p
                                  className="text-[16px] font-semibold"
                                  style={{ color: COLORS.ink }}
                                >
                                  Signal health
                                </p>
                                <p
                                  className="mt-1 text-[13px]"
                                  style={{ color: COLORS.muted }}
                                >
                                  Selectable metric rows tied to the active
                                  analytics category.
                                </p>
                              </div>
                              {categoryRows.map((row, index) => (
                                <button
                                  key={row.metric}
                                  onClick={() =>
                                    openAdminQuickDetail({
                                      title: row.metric,
                                      subtitle: `${analyticsData.helper} analytics signal`,
                                      status: row.status,
                                      description: `${row.metric} is currently ${row.value} with ${row.delta} movement in the selected range.`,
                                      metrics: [
                                        ["Value", row.value],
                                        ["Delta", row.delta],
                                        ["Range", analyticsData.helper],
                                        ["Category", analyticsCategory],
                                      ],
                                    })
                                  }
                                  className="grid w-full cursor-pointer gap-2 border-b px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-[#f7f7f7]"
                                  style={{
                                    borderColor: COLORS.hairlineSoft,
                                    background:
                                      index % 2 === 1
                                        ? COLORS.surfaceSoft
                                        : COLORS.canvas,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <p
                                      className="text-[14px] font-semibold"
                                      style={{ color: COLORS.ink }}
                                    >
                                      {row.metric}
                                    </p>
                                    <StatusChip status={row.status} />
                                  </div>
                                  <p
                                    className="text-[22px] font-semibold"
                                    style={{ color: COLORS.ink }}
                                  >
                                    {row.value}
                                  </p>
                                  <p
                                    className="text-[13px]"
                                    style={{
                                      color: row.delta.startsWith("+")
                                        ? COLORS.primaryActive
                                        : "#c2410c",
                                    }}
                                  >
                                    {row.delta}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-5 xl:grid-cols-3">
                          {[
                            {
                              title: "Top service categories",
                              rows: [
                                ["Plumbing", "4.8K searches"],
                                ["Carpentry", "3.1K searches"],
                                ["Painting", "2.7K searches"],
                              ],
                              icon: Hammer,
                            },
                            {
                              title: "County demand",
                              rows: [
                                ["Nairobi", "49% of searches"],
                                ["Kiambu", "21% of searches"],
                                ["Mombasa", "12% of searches"],
                              ],
                              icon: MapPinned,
                            },
                            {
                              title: "Revenue health",
                              rows: [
                                ["MRR", "KES 46.8K"],
                                ["Failed renewals", "12"],
                                ["Premium conversion", "18.6%"],
                              ],
                              icon: CreditCard,
                            },
                          ].map((card) => {
                            const Icon = card.icon;
                            return (
                              <div
                                key={card.title}
                                className="rounded-[18px] border bg-white p-5"
                                style={{ borderColor: COLORS.hairlineSoft }}
                              >
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <p
                                    className="text-[16px] font-semibold"
                                    style={{ color: COLORS.ink }}
                                  >
                                    {card.title}
                                  </p>
                                  <Icon
                                    size={18}
                                    style={{ color: COLORS.primary }}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  {card.rows.map(([label, value], index) => (
                                    <button
                                      key={label}
                                      onClick={() =>
                                        openAdminQuickDetail({
                                          title: label,
                                          subtitle: card.title,
                                          status: "ACTIVE",
                                          description: `${label} contributes ${value} in the selected analytics range.`,
                                          metrics: [
                                            ["Metric", label],
                                            ["Value", value],
                                            ["Range", analyticsData.helper],
                                            ["Category", analyticsCategory],
                                          ],
                                        })
                                      }
                                      className="flex cursor-pointer items-center justify-between gap-3 rounded-[12px] px-3 py-2 text-left transition-colors hover:bg-[#f7f7f7]"
                                      style={{
                                        background:
                                          index % 2 === 1
                                            ? COLORS.surfaceSoft
                                            : COLORS.canvas,
                                      }}
                                    >
                                      <span
                                        className="truncate text-[13px] font-medium"
                                        style={{ color: COLORS.body }}
                                      >
                                        {label}
                                      </span>
                                      <strong
                                        className="shrink-0 text-[13px]"
                                        style={{ color: COLORS.ink }}
                                      >
                                        {value}
                                      </strong>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                {view === "monitoring" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Healthy services"
                        value="3"
                        helper="Passing checks"
                        icon={CheckCircle2}
                      />
                      <DashboardStatCard
                        label="Warnings"
                        value="1"
                        helper="Notifications latency"
                        icon={BellRing}
                      />
                      <DashboardStatCard
                        label="Avg latency"
                        value="123ms"
                        helper="Across services"
                        icon={Gauge}
                      />
                      <DashboardStatCard
                        label="Uptime"
                        value="99.96%"
                        helper="30 day blended"
                        icon={Activity}
                      />
                    </div>
                    <DashboardDataList
                      title="System monitoring"
                      subtitle="Service health, uptime, latency, worker state, and incident posture. Click a row for service context, or Logs for the inspection panel."
                      rows={[
                        {
                          id: "system-001",
                          service: "API",
                          uptime: "99.99%",
                          latency: "121ms",
                          status: "ACTIVE" as const,
                          owner: "Platform",
                          incident: "None",
                          region: "Nairobi edge",
                        },
                        {
                          id: "system-002",
                          service: "Database",
                          uptime: "99.95%",
                          latency: "44ms",
                          status: "ACTIVE" as const,
                          owner: "Data",
                          incident: "None",
                          region: "Primary cluster",
                        },
                        {
                          id: "system-003",
                          service: "Notifications",
                          uptime: "99.91%",
                          latency: "238ms",
                          status: "REVIEW" as const,
                          owner: "Messaging",
                          incident: "Worker delay",
                          region: "Queue workers",
                        },
                        {
                          id: "system-004",
                          service: "Search index",
                          uptime: "99.98%",
                          latency: "88ms",
                          status: "ACTIVE" as const,
                          owner: "Discovery",
                          incident: "None",
                          region: "Search cluster",
                        },
                      ]}
                      rowKey={(row) => row.id}
                      getSearchText={(row) =>
                        `${row.service} ${row.uptime} ${row.latency} ${row.status} ${row.owner} ${row.incident} ${row.region}`
                      }
                      filters={[
                        {
                          id: "status",
                          label: "Status",
                          allLabel: "All statuses",
                          options: ["ACTIVE", "REVIEW"],
                          getValue: (row) => row.status,
                        },
                        {
                          id: "owner",
                          label: "Owner",
                          allLabel: "All owners",
                          options: [
                            "Platform",
                            "Data",
                            "Messaging",
                            "Discovery",
                          ],
                          getValue: (row) => row.owner,
                        },
                      ]}
                      sortOptions={[
                        {
                          id: "service",
                          label: "Sort: Service",
                          sort: (a, b) => a.service.localeCompare(b.service),
                        },
                        {
                          id: "latency",
                          label: "Sort: Latency",
                          sort: (a, b) =>
                            Number(a.latency.replace(/[^0-9]/g, "")) -
                            Number(b.latency.replace(/[^0-9]/g, "")),
                        },
                      ]}
                      columns={[
                        {
                          header: "Service",
                          render: (row) => (
                            <span>
                              <span
                                className="block truncate font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                {row.service}
                              </span>
                              <span
                                className="mt-1 block truncate text-[13px]"
                                style={{ color: COLORS.muted }}
                              >
                                {row.owner} · {row.region}
                              </span>
                            </span>
                          ),
                        },
                        {
                          header: "Uptime",
                          render: (row) => (
                            <span style={{ color: COLORS.body }}>
                              {row.uptime}
                            </span>
                          ),
                        },
                        {
                          header: "Latency",
                          render: (row) => (
                            <span style={{ color: COLORS.body }}>
                              {row.latency}
                            </span>
                          ),
                        },
                        {
                          header: "Status",
                          render: (row) => <StatusChip status={row.status} />,
                        },
                      ]}
                      onRowClick={(row) =>
                        openAdminQuickDetail({
                          title: row.service,
                          subtitle: `${row.owner} · ${row.region}`,
                          status: row.status,
                          description: `${row.service} uptime is ${row.uptime}, median latency is ${row.latency}, and current incident state is ${row.incident}.`,
                          metrics: [
                            ["Uptime", row.uptime],
                            ["Latency", row.latency],
                            ["Owner", row.owner],
                            ["Incident", row.incident],
                          ],
                        })
                      }
                      onView={(row) =>
                        openAdminFullDetail({
                          title: `${row.service} logs`,
                          subtitle: `${row.region} inspection`,
                          status: row.status,
                          description:
                            "Full inspection includes log stream, deploy history, queue state, retry counts, incident notes, and rollback controls for this service.",
                          metrics: [
                            ["Service", row.service],
                            ["Region", row.region],
                            ["Owner", row.owner],
                            ["Status", row.status],
                          ],
                        })
                      }
                      viewLabel="Logs"
                    />
                  </div>
                )}

                {view === "locations" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Covered cities"
                        value={String(cityLinks.length)}
                        helper="Active search areas"
                        icon={MapPinned}
                      />
                      <DashboardStatCard
                        label="Listed artisans"
                        value="238"
                        helper="Across indexed cities"
                        icon={Hammer}
                      />
                      <DashboardStatCard
                        label="Top county"
                        value="Nairobi"
                        helper="Highest demand"
                        icon={Map}
                      />
                      <DashboardStatCard
                        label="Index state"
                        value="Fresh"
                        helper="Updated today"
                        icon={Database}
                      />
                    </div>
                    <DashboardDataList
                      title="Location coverage"
                      subtitle="Search, filter, and inspect service-area coverage. Click a row for quick context, or Inspect to review map and index details."
                      rows={adminLocationRows}
                      rowKey={(row) => row.id}
                      getSearchText={(row) =>
                        `${row.city} ${row.county} ${row.specialty} ${row.artisans} ${row.status}`
                      }
                      filters={[
                        {
                          id: "county",
                          label: "County",
                          allLabel: "All counties",
                          options: adminLocationCounties,
                          getValue: (row) => row.county,
                        },
                        {
                          id: "status",
                          label: "Status",
                          allLabel: "All statuses",
                          options: ["ACTIVE"],
                          getValue: (row) => row.status,
                        },
                      ]}
                      sortOptions={[
                        {
                          id: "city",
                          label: "Sort: City",
                          sort: (a, b) => a.city.localeCompare(b.city),
                        },
                        {
                          id: "artisans",
                          label: "Sort: Artisans",
                          sort: (a, b) => b.artisans - a.artisans,
                        },
                      ]}
                      columns={[
                        {
                          header: "City",
                          render: (row) => (
                            <span>
                              <span
                                className="block truncate font-semibold"
                                style={{ color: COLORS.ink }}
                              >
                                {row.city}
                              </span>
                              <span
                                className="mt-1 block truncate text-[13px]"
                                style={{ color: COLORS.muted }}
                              >
                                {row.county} · {row.specialty}
                              </span>
                            </span>
                          ),
                        },
                        {
                          header: "Coverage",
                          render: (row) => (
                            <span style={{ color: COLORS.body }}>
                              {row.specialty}
                            </span>
                          ),
                        },
                        {
                          header: "Artisans",
                          render: (row) => (
                            <span
                              className="font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              {row.artisans}
                            </span>
                          ),
                        },
                        {
                          header: "Status",
                          render: (row) => <StatusChip status={row.status} />,
                        },
                      ]}
                      onRowClick={(row) =>
                        openAdminQuickDetail({
                          title: row.city,
                          subtitle: `${row.county} location coverage`,
                          status: row.status,
                          description: `${row.city} currently has ${row.artisans} listed artisans. Primary demand cluster: ${row.specialty}.`,
                          metrics: [
                            ["County", row.county],
                            ["Artisans", String(row.artisans)],
                            ["Coverage", row.specialty],
                            ["Index", "Fresh"],
                          ],
                        })
                      }
                      onView={(row) =>
                        openAdminFullDetail({
                          title: `${row.city} map index`,
                          subtitle: `${row.county} service area`,
                          status: row.status,
                          description:
                            "Full location inspection includes map bounds, search aliases, service radius data, artisan density, stale coordinate records, demand signals, and index refresh actions.",
                          metrics: [
                            ["City", row.city],
                            ["County", row.county],
                            ["Listed artisans", String(row.artisans)],
                            ["Search aliases", "Enabled"],
                          ],
                        })
                      }
                      viewLabel="Inspect"
                    />
                    <div
                      className="rounded-[18px] border p-5"
                      style={{
                        borderColor: COLORS.hairlineSoft,
                        background: COLORS.surfaceSoft,
                      }}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p
                            className="text-[16px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            Map index preview
                          </p>
                          <p
                            className="mt-1 text-[13px] leading-[1.23]"
                            style={{ color: COLORS.muted }}
                          >
                            Map inspection now supports the list workflow
                            without forcing a second column beside the table.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            openAdminQuickDetail({
                              title: "Location index refresh",
                              subtitle: "Map and search index",
                              status: "ACTIVE",
                              description:
                                "Refresh map bounds, search aliases, artisan density, and stale coordinate records for indexed locations.",
                              metrics: [
                                ["Cities", String(cityLinks.length)],
                                ["Index", "Fresh"],
                                ["Primary county", "Nairobi"],
                                ["Coverage", "Active"],
                              ],
                            })
                          }
                          className="h-10 w-fit cursor-pointer rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
                          style={{
                            borderColor: COLORS.hairline,
                            color: COLORS.ink,
                          }}
                        >
                          Inspect map index
                        </button>
                      </div>
                      <div
                        className="mt-4 grid h-48 place-items-center rounded-[18px] border bg-white"
                        style={{
                          borderColor: COLORS.hairlineSoft,
                          color: COLORS.primary,
                        }}
                      >
                        <Map size={48} />
                      </div>
                    </div>
                  </div>
                )}

                {view === "settings" && (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DashboardStatCard
                        label="Policies enabled"
                        value="6"
                        helper="Active controls"
                        icon={ShieldCheck}
                      />
                      <DashboardStatCard
                        label="Audit logging"
                        value="On"
                        helper="Required for admin changes"
                        icon={FileText}
                      />
                      <DashboardStatCard
                        label="Invite mode"
                        value="Role locked"
                        helper="Token-scoped onboarding"
                        icon={UserPlus}
                      />
                      <DashboardStatCard
                        label="Payment mode"
                        value="Mixed"
                        helper="Cash jobs, M-Pesa subscriptions"
                        icon={CreditCard}
                      />
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <div
                        className="rounded-[18px] border bg-white p-5"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p
                              className="text-[16px] font-semibold"
                              style={{ color: COLORS.ink }}
                            >
                              Platform settings
                            </p>
                            <p
                              className="mt-1 max-w-[640px] text-[13px] leading-[1.23]"
                              style={{ color: COLORS.muted }}
                            >
                              Production-facing controls grouped by trust,
                              billing, notification, discovery, and
                              administrative safeguards.
                            </p>
                          </div>
                          <StatusChip status="ACTIVE" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {[
                            {
                              title: "Verification policy",
                              value: "Manual review required",
                              body: "Verified badge and public search eligibility require admin approval.",
                              icon: FileCheck2,
                            },
                            {
                              title: "Invite permissions",
                              value: "Role-scoped tokens",
                              body: "Invite links lock role, expiry, and onboarding destination.",
                              icon: Send,
                            },
                            {
                              title: "Subscription billing",
                              value: "M-Pesa enabled",
                              body: "Premium artisan subscriptions remain active during testing.",
                              icon: CreditCard,
                            },
                            {
                              title: "Job payment policy",
                              value: "Cash-only testing",
                              body: "Job payment buttons stay informational until payments go live.",
                              icon: WalletCards,
                            },
                            {
                              title: "Moderation thresholds",
                              value: "Medium+ review",
                              body: "Automated signals create moderation records for suspicious activity.",
                              icon: Flag,
                            },
                            {
                              title: "Location indexing",
                              value: "County + coordinates",
                              body: "Search uses county, city, address, and map coordinates.",
                              icon: MapPinned,
                            },
                            {
                              title: "Notification workers",
                              value: "Enabled",
                              body: "Messages, quote decisions, verification, and subscription events send updates.",
                              icon: BellRing,
                            },
                            {
                              title: "Admin audit trail",
                              value: "Required",
                              body: "Critical admin changes generate immutable audit records.",
                              icon: Database,
                            },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <div
                                key={item.title}
                                className="rounded-[14px] border p-4"
                                style={{
                                  borderColor: COLORS.hairlineSoft,
                                  background: COLORS.canvas,
                                }}
                              >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <span
                                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                                    style={{
                                      background: COLORS.primaryTint,
                                      color: COLORS.primary,
                                    }}
                                  >
                                    <Icon size={17} />
                                  </span>
                                  <select
                                    defaultValue={item.value}
                                    className="h-9 max-w-[180px] rounded-full border bg-white px-3 text-[12px] font-medium outline-none"
                                    style={{
                                      borderColor: COLORS.hairline,
                                      color: COLORS.ink,
                                    }}
                                  >
                                    <option>{item.value}</option>
                                    <option>Review required</option>
                                    <option>Disabled</option>
                                  </select>
                                </div>
                                <p
                                  className="text-[14px] font-semibold"
                                  style={{ color: COLORS.ink }}
                                >
                                  {item.title}
                                </p>
                                <p
                                  className="mt-1 text-[13px] leading-[1.23]"
                                  style={{ color: COLORS.muted }}
                                >
                                  {item.body}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div
                          className="mt-5 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <button
                            className="h-11 cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                            style={{
                              borderColor: COLORS.hairline,
                              color: COLORS.ink,
                            }}
                          >
                            Discard changes
                          </button>
                          <button
                            className="h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
                            style={{ background: COLORS.primary }}
                          >
                            Save settings
                          </button>
                        </div>
                      </div>

                      <aside className="space-y-4">
                        <div
                          className="rounded-[18px] border p-5"
                          style={{
                            borderColor: COLORS.primarySoft,
                            background: COLORS.primaryTint,
                          }}
                        >
                          <p
                            className="text-[16px] font-semibold"
                            style={{ color: COLORS.primaryActive }}
                          >
                            Admin safeguards
                          </p>
                          <div
                            className="mt-3 grid gap-2 text-[14px]"
                            style={{ color: COLORS.body }}
                          >
                            <p className="flex gap-2">
                              <CheckCircle2
                                size={16}
                                style={{ color: COLORS.primary }}
                              />{" "}
                              Critical changes require audit logs.
                            </p>
                            <p className="flex gap-2">
                              <CheckCircle2
                                size={16}
                                style={{ color: COLORS.primary }}
                              />{" "}
                              Verification changes notify artisans.
                            </p>
                            <p className="flex gap-2">
                              <CheckCircle2
                                size={16}
                                style={{ color: COLORS.primary }}
                              />{" "}
                              Billing settings affect subscriptions only.
                            </p>
                            <p className="flex gap-2">
                              <CheckCircle2
                                size={16}
                                style={{ color: COLORS.primary }}
                              />{" "}
                              Job payment policy remains cash-only in testing.
                            </p>
                          </div>
                        </div>
                        <div
                          className="rounded-[18px] border bg-white p-5"
                          style={{ borderColor: COLORS.hairlineSoft }}
                        >
                          <p
                            className="text-[16px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            Change review
                          </p>
                          <p
                            className="mt-2 text-[14px] leading-[1.43]"
                            style={{ color: COLORS.muted }}
                          >
                            In production, saving settings should open a
                            confirmation modal, write an audit event, and
                            invalidate relevant cached policies.
                          </p>
                          <button
                            onClick={() =>
                              openAdminQuickDetail({
                                title: "Settings audit preview",
                                subtitle: "Platform settings",
                                status: "REVIEW",
                                description:
                                  "This preview represents the confirmation and audit layer that should wrap sensitive admin configuration changes.",
                                metrics: [
                                  ["Actor", "Admin"],
                                  ["Scope", "Platform"],
                                  ["Audit", "Required"],
                                  ["Cache", "Invalidate"],
                                ],
                              })
                            }
                            className="mt-4 h-11 w-full cursor-pointer rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                            style={{
                              borderColor: COLORS.hairline,
                              color: COLORS.ink,
                            }}
                          >
                            Preview audit confirmation
                          </button>
                        </div>
                      </aside>
                    </div>
                  </div>
                )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {adminQuickDetail && (
                <QuickDetailSlideover
                  title={adminQuickDetail.title}
                  subtitle={adminQuickDetail.subtitle}
                  status={adminQuickDetail.status}
                  description={adminQuickDetail.description}
                  metrics={adminQuickDetail.metrics}
                  actions={
                    view === "verification"
                      ? [
                          {
                            label: "Review verification documents",
                            primary: true,
                            onClick: () => {
                              const record = verificationQueue.find(
                                (item) => item.name === adminQuickDetail.title,
                              );
                              if (record) {
                                openVerificationReviewModal(record);
                              }
                              setAdminQuickDetail(null);
                            },
                          },
                          {
                            label: "Open full admin record",
                            onClick: () => {
                              if (adminQuickDetail) {
                                openAdminFullDetail(adminQuickDetail);
                              }
                              setAdminQuickDetail(null);
                            },
                          },
                          {
                            label: "Close",
                            onClick: () => setAdminQuickDetail(null),
                          },
                        ]
                      : [
                          {
                            label: "Open full admin record",
                            primary: true,
                            onClick: () => {
                              if (adminQuickDetail) {
                                openAdminFullDetail(adminQuickDetail);
                              }
                              setAdminQuickDetail(null);
                            },
                          },
                          {
                            label: "Request more information",
                            onClick: () => setAdminQuickDetail(null),
                          },
                          {
                            label: "Close",
                            onClick: () => setAdminQuickDetail(null),
                          },
                        ]
                  }
                  onClose={() => setAdminQuickDetail(null)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {adminFullDetail && (
                <FullDetailViewModal
                  title={adminFullDetail.title}
                  subtitle={adminFullDetail.subtitle}
                  status={adminFullDetail.status}
                  description={adminFullDetail.description}
                  metrics={adminFullDetail.metrics}
                  onClose={() => setAdminFullDetail(null)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

type SecondaryOpsView =
  | "analytics"
  | "earnings"
  | "subscriptions"
  | "payouts"
  | "monitoring"
  | "locations"
  | "reports"
  | "database"
  | "help"
  | "settings";

function MiniTrendChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = 8 + (index / Math.max(1, values.length - 1)) * 84;
      const y = 88 - ((value - min) / range) * 70;
      return `${x},${y}`;
    })
    .join(" ");
  const yTicks = [max, Math.round(min + range / 2), min];

  return (
    <div
      className="rounded-[16px] border bg-white p-3"
      style={{ borderColor: COLORS.hairlineSoft }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <ChartLegend items={[{ label: "Trend" }]} />
        <ChartAxisLabel>
          {min}–{max}
        </ChartAxisLabel>
      </div>
      <svg
        viewBox="0 0 100 100"
        className="h-40 w-full overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {yTicks.map((tick, index) => {
          const y = 18 + index * 35;
          return (
            <g key={`${tick}-${index}`}>
              <line
                x1="8"
                x2="92"
                y1={y}
                y2={y}
                stroke={COLORS.hairlineSoft}
                strokeWidth="1"
              />
              <text x="0" y={y + 3} fontSize="6" fill={COLORS.muted}>
                {tick}
              </text>
            </g>
          );
        })}
        <polyline
          points={points}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((value, index) => {
          const x = 8 + (index / Math.max(1, values.length - 1)) * 84;
          const y = 88 - ((value - min) / range) * 70;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2.8"
              fill="white"
              stroke={COLORS.primary}
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

function SecondaryOperationsSection({
  initialView = "analytics",
  onRouteChange,
}: {
  initialView?: SecondaryOpsView;
  onRouteChange?: (view: SecondaryOpsView) => void;
} = {}) {
  const [view, setView] = useState<SecondaryOpsView>(initialView);
  const views: Array<{
    id: SecondaryOpsView;
    label: string;
    icon: typeof Search;
    badge?: string | number;
  }> = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "earnings", label: "Earnings", icon: CircleDollarSign },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "payouts", label: "Payouts", icon: WalletCards },
    { id: "monitoring", label: "Monitoring", icon: Gauge },
    { id: "locations", label: "Locations", icon: Map },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "database", label: "Database", icon: HardDrive },
    { id: "help", label: "Help", icon: LifeBuoy },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const analyticsRows = [
    {
      metric: "Searches",
      value: "18,430",
      delta: "+14.2%",
      status: "ACTIVE" as const,
    },
    {
      metric: "Profile views",
      value: "7,912",
      delta: "+9.7%",
      status: "ACTIVE" as const,
    },
    {
      metric: "Message starts",
      value: "1,486",
      delta: "+6.1%",
      status: "ACTIVE" as const,
    },
    {
      metric: "Quote acceptance",
      value: "42%",
      delta: "-1.8%",
      status: "REVIEW" as const,
    },
  ];

  const financeRows = [
    {
      item: "Premium artisan subscriptions",
      amount: "KES 46,800",
      status: "ACTIVE" as const,
      meta: "312 active subscriptions",
    },
    {
      item: "Subscription renewals",
      amount: "KES 12,450",
      status: "PENDING" as const,
      meta: "Next 7 days",
    },
    {
      item: "Failed subscription charges",
      amount: "KES 3,200",
      status: "REVIEW" as const,
      meta: "Requires retry",
    },
  ];

  const systemRows = [
    {
      service: "API",
      uptime: "99.99%",
      latency: "121ms",
      status: "ACTIVE" as const,
    },
    {
      service: "Database",
      uptime: "99.95%",
      latency: "44ms",
      status: "ACTIVE" as const,
    },
    {
      service: "Notifications",
      uptime: "99.91%",
      latency: "238ms",
      status: "REVIEW" as const,
    },
    {
      service: "Search index",
      uptime: "99.98%",
      latency: "88ms",
      status: "ACTIVE" as const,
    },
  ];

  return (
    <section id="secondary-ops-flow" className="min-h-screen w-full bg-white">
      <div className="min-h-screen overflow-hidden bg-white">
        <div
          className="border-b p-4"
          style={{
            borderColor: COLORS.hairlineSoft,
            background: COLORS.surfaceSoft,
          }}
        >
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {views.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className="flex min-w-fit cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] font-medium transition-colors hover:bg-white"
                  style={{
                    borderColor: active ? COLORS.ink : COLORS.hairline,
                    color: active ? COLORS.ink : COLORS.body,
                    background: active ? COLORS.canvas : "transparent",
                    boxShadow: active ? softShadow : "none",
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: active ? COLORS.primary : COLORS.muted }}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            layout="position"
            initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(1.5px)" }}
            transition={routeTransition}
            className="p-5 md:p-6"
          >
            {view === "analytics" && (
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <DashboardStatCard
                    label="Marketplace GMV signal"
                    value="KES 1.8M"
                    helper="Cash-mode estimate"
                    icon={TrendingUp}
                  />
                  <DashboardStatCard
                    label="Searches"
                    value="18.4K"
                    helper="30 days"
                    icon={Search}
                  />
                  <DashboardStatCard
                    label="Quote requests"
                    value="1,486"
                    helper="Public to dashboard"
                    icon={ReceiptText}
                  />
                  <DashboardStatCard
                    label="Conversion"
                    value="42%"
                    helper="Quote accepted"
                    icon={BarChart3}
                  />
                </div>
                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                  <div
                    className="rounded-[18px] border p-5"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p
                          className="text-[16px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          Marketplace activity
                        </p>
                        <p
                          className="text-[13px]"
                          style={{ color: COLORS.muted }}
                        >
                          Search and conversion trend.
                        </p>
                      </div>
                      <StatusChip status="ACTIVE" />
                    </div>
                    <MiniTrendChart
                      values={[22, 30, 28, 44, 52, 48, 64, 72, 68, 84]}
                    />
                  </div>
                  <div
                    className="overflow-hidden rounded-[18px] border"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    {analyticsRows.map((row) => (
                      <div
                        key={row.metric}
                        className="grid gap-2 border-b px-4 py-4 last:border-b-0"
                        style={{ borderColor: COLORS.hairlineSoft }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p
                            className="text-[14px] font-semibold"
                            style={{ color: COLORS.ink }}
                          >
                            {row.metric}
                          </p>
                          <StatusChip status={row.status} />
                        </div>
                        <p
                          className="text-[22px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {row.value}
                        </p>
                        <p
                          className="text-[13px]"
                          style={{
                            color: row.delta.startsWith("+")
                              ? COLORS.primaryActive
                              : "#c2410c",
                          }}
                        >
                          {row.delta}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(view === "earnings" ||
              view === "subscriptions" ||
              view === "payouts") && (
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
                  <DashboardStatCard
                    label="Subscription revenue"
                    value="KES 46.8K"
                    helper="Monthly recurring"
                    icon={CreditCard}
                  />
                  <DashboardStatCard
                    label="Pending renewals"
                    value="83"
                    helper="Next 7 days"
                    icon={CalendarDays}
                  />
                  <DashboardStatCard
                    label="Failed charges"
                    value="12"
                    helper="Retry required"
                    icon={BellRing}
                  />
                </div>
                <div
                  className="overflow-hidden rounded-[18px] border lg:col-span-2"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div
                    className="border-b px-4 py-3"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <p
                      className="text-[16px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      {view === "payouts"
                        ? "Payout and payment records"
                        : view === "subscriptions"
                          ? "Subscription records"
                          : "Earnings records"}
                    </p>
                    <p className="text-[13px]" style={{ color: COLORS.muted }}>
                      Job payments are cash-only in testing. Subscription
                      payments remain active.
                    </p>
                  </div>
                  {financeRows.map((row) => (
                    <div
                      key={row.item}
                      className="grid gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center"
                      style={{ borderColor: COLORS.hairlineSoft }}
                    >
                      <span>
                        <span
                          className="block text-[14px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {row.item}
                        </span>
                        <span
                          className="block text-[13px]"
                          style={{ color: COLORS.muted }}
                        >
                          {row.meta}
                        </span>
                      </span>
                      <StatusChip status={row.status} />
                      <span
                        className="text-[14px] font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        {row.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === "monitoring" && (
              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div
                  className="overflow-hidden rounded-[18px] border"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <div
                    className="border-b px-4 py-3"
                    style={{ borderColor: COLORS.hairlineSoft }}
                  >
                    <p
                      className="text-[16px] font-semibold"
                      style={{ color: COLORS.ink }}
                    >
                      System monitoring
                    </p>
                    <p className="text-[13px]" style={{ color: COLORS.muted }}>
                      Service health, uptime, and latency.
                    </p>
                  </div>
                  {systemRows.map((row) => (
                    <div
                      key={row.service}
                      className="grid gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
                      style={{ borderColor: COLORS.hairlineSoft }}
                    >
                      <span
                        className="text-[14px] font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        {row.service}
                      </span>
                      <span
                        className="text-[14px]"
                        style={{ color: COLORS.body }}
                      >
                        {row.uptime}
                      </span>
                      <span
                        className="text-[14px]"
                        style={{ color: COLORS.body }}
                      >
                        {row.latency}
                      </span>
                      <StatusChip status={row.status} />
                    </div>
                  ))}
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Incident posture
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-[1.43]"
                    style={{ color: COLORS.muted }}
                  >
                    One notification service warning is active. No major
                    incident declared.
                  </p>
                  <button
                    className="mt-4 h-11 cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white"
                    style={{ background: COLORS.primary }}
                  >
                    Open incident log
                  </button>
                </div>
              </div>
            )}

            {view === "locations" && (
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div
                  className="rounded-[18px] border p-5"
                  style={{ borderColor: COLORS.hairlineSoft }}
                >
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Location coverage
                  </p>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {cityLinks.map(([city, specialty]) => (
                      <div
                        key={city}
                        className="rounded-[14px] border p-4"
                        style={{
                          borderColor: COLORS.hairlineSoft,
                          background: COLORS.surfaceSoft,
                        }}
                      >
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {city}
                        </p>
                        <p
                          className="mt-1 text-[13px]"
                          style={{ color: COLORS.muted }}
                        >
                          {specialty}
                        </p>
                        <p
                          className="mt-3 text-[22px] font-semibold"
                          style={{ color: COLORS.primaryActive }}
                        >
                          {Math.floor(18 + city.length * 4)}
                        </p>
                        <p
                          className="text-[13px]"
                          style={{ color: COLORS.muted }}
                        >
                          listed artisans
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="rounded-[18px] border p-5"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="text-[16px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Map placeholder
                  </p>
                  <div
                    className="mt-4 grid aspect-square place-items-center rounded-[18px] border bg-white"
                    style={{
                      borderColor: COLORS.hairlineSoft,
                      color: COLORS.primary,
                    }}
                  >
                    <Map size={48} />
                  </div>
                </div>
              </div>
            )}

            {(view === "reports" ||
              view === "database" ||
              view === "help" ||
              view === "settings") && (
              <div className="grid gap-5 lg:grid-cols-3 items-start">
                {[
                  {
                    title:
                      view === "reports"
                        ? "Monthly marketplace report"
                        : view === "database"
                          ? "Database health"
                          : view === "help"
                            ? "Support knowledge base"
                            : "Platform settings",
                    icon:
                      view === "database"
                        ? Database
                        : view === "help"
                          ? LifeBuoy
                          : view === "settings"
                            ? Settings
                            : FileText,
                    status: "ACTIVE" as const,
                  },
                  {
                    title:
                      view === "reports"
                        ? "Verification report"
                        : view === "database"
                          ? "Backups"
                          : view === "help"
                            ? "Admin help center"
                            : "Notification settings",
                    icon: BellRing,
                    status: "COMPLETED" as const,
                  },
                  {
                    title:
                      view === "reports"
                        ? "Revenue export"
                        : view === "database"
                          ? "Search index"
                          : view === "help"
                            ? "Escalation policy"
                            : "Role permissions",
                    icon: ServerCog,
                    status: "REVIEW" as const,
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="rounded-[18px] border p-5"
                      style={{ borderColor: COLORS.hairlineSoft }}
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <span
                          className="grid h-11 w-11 place-items-center rounded-full"
                          style={{
                            background: COLORS.primaryTint,
                            color: COLORS.primary,
                          }}
                        >
                          <Icon size={19} />
                        </span>
                        <StatusChip status={card.status} />
                      </div>
                      <p
                        className="text-[16px] font-semibold"
                        style={{ color: COLORS.ink }}
                      >
                        {card.title}
                      </p>
                      <p
                        className="mt-2 text-[14px] leading-[1.43]"
                        style={{ color: COLORS.muted }}
                      >
                        Representative secondary operations card with export,
                        review, or configuration actions.
                      </p>
                      <button
                        className="mt-4 h-10 cursor-pointer rounded-lg border px-3 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                        style={{
                          borderColor: COLORS.hairline,
                          color: COLORS.ink,
                        }}
                      >
                        Open
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

type PreviewRouteStatus = "Ready" | "Needs backend" | "Needs routing";

function PreviewReadinessSection() {
  const routeGroups: Array<{
    title: string;
    description: string;
    icon: typeof Search;
    status: PreviewRouteStatus;
    target: string;
    items: string[];
  }> = [
    {
      title: "Public marketplace",
      description:
        "Landing, search, categories, directory, cards, profile, portfolio modal, location discovery.",
      icon: Search,
      status: "Ready",
      target: "browse-artisans",
      items: [
        "Header/search",
        "Category strip",
        "Artisan cards",
        "Directory",
        "Public profile",
        "Portfolio modal",
      ],
    },
    {
      title: "Auth and onboarding",
      description:
        "Sign up, sign in, invite state, CAPTCHA slot, OTP verification, artisan onboarding entry.",
      icon: LockKeyhole,
      status: "Needs backend",
      target: "auth-preview",
      items: ["Signup", "Signin", "Invite token", "OTP", "Role-aware entry"],
    },
    {
      title: "Shared dashboard shell",
      description:
        "Role switcher, stat cards, navigation, tables, activity feed, and detail slideover pattern.",
      icon: LayoutDashboard,
      status: "Ready",
      target: "dashboard-shell-preview",
      items: [
        "Artisan shell",
        "Client shell",
        "Admin shell",
        "Slideover",
        "Status chips",
      ],
    },
    {
      title: "Artisan operations",
      description:
        "Jobs, quote workflow, messages, portfolio manager, profile settings, verification panel.",
      icon: Hammer,
      status: "Needs backend",
      target: "artisan-core-flow",
      items: [
        "Jobs",
        "Quote create/revise",
        "Messages",
        "Portfolio",
        "Verification",
      ],
    },
    {
      title: "Client operations",
      description:
        "Find artisans, saved profiles, jobs, quote decisions, messages, and reviews.",
      icon: UserRound,
      status: "Needs backend",
      target: "client-core-flow",
      items: ["Find", "Saved", "Jobs", "Quote decision", "Messages", "Reviews"],
    },
    {
      title: "Admin operations",
      description:
        "Verification queue, artisan/user management, invites, moderation, analytics, monitoring.",
      icon: UserCog,
      status: "Needs backend",
      target: "admin-operations-flow",
      items: [
        "Verification",
        "Artisans",
        "Users",
        "Invites",
        "Moderation",
        "Secondary ops",
      ],
    },
  ];

  const statusStyles: Record<
    PreviewRouteStatus,
    { bg: string; fg: string; border: string }
  > = {
    Ready: {
      bg: COLORS.primaryTint,
      fg: COLORS.primaryActive,
      border: COLORS.primarySoft,
    },
    "Needs backend": { bg: "#fffbeb", fg: "#92400e", border: "#fde68a" },
    "Needs routing": { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
  };

  const qaItems = [
    "Replace in-preview state with route-level state once migrated to the app router.",
    "Extract mock arrays into data fixtures or API-backed loaders before production wiring.",
    "Keep job payments cash-only during testing while subscription payment surfaces remain active.",
    "Promote repeated dashboard cards, status chips, tables, modals, and shells into shared components.",
    "Run responsive QA at mobile, tablet, desktop, and wide breakpoints after every route extraction.",
  ];

  return (
    <section
      id="preview-readiness"
      className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            Sprint 10 · Preview navigation and implementation readiness
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            Make the growing preview navigable, auditable, and ready to extract.
          </h2>
          <p
            className="mt-2 max-w-[760px] text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            This layer acts as the control map for the sprint build: jump to any
            major view, confirm coverage, and track what must be converted from
            preview state to production logic.
          </p>
        </div>
        <button
          onClick={() => scrollToId("browse-artisans")}
          className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          Start QA pass
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4 md:grid-cols-2">
          {routeGroups.map((group) => {
            const Icon = group.icon;
            const status = statusStyles[group.status];
            return (
              <div
                key={group.title}
                className="rounded-[18px] border bg-white p-5"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  boxShadow: softShadow,
                }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                    style={{
                      background: COLORS.primaryTint,
                      color: COLORS.primary,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                  <span
                    className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-[1.18]"
                    style={{
                      background: status.bg,
                      color: status.fg,
                      borderColor: status.border,
                    }}
                  >
                    {group.status}
                  </span>
                </div>
                <h3
                  className="text-[16px] font-semibold leading-[1.25]"
                  style={{ color: COLORS.ink }}
                >
                  {group.title}
                </h3>
                <p
                  className="mt-2 text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  {group.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border px-2.5 py-1 text-[13px] leading-[1.23]"
                      style={{
                        borderColor: COLORS.hairlineSoft,
                        background: COLORS.surfaceSoft,
                        color: COLORS.body,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => scrollToId(group.target)}
                  className="mt-5 flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
                  style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
                >
                  Jump to view
                  <ChevronRight size={15} />
                </button>
              </div>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div
            className="rounded-[18px] border p-5"
            style={{
              borderColor: COLORS.hairlineSoft,
              background: COLORS.surfaceSoft,
            }}
          >
            <p
              className="text-[16px] font-semibold leading-[1.25]"
              style={{ color: COLORS.ink }}
            >
              Extraction order
            </p>
            <div
              className="mt-4 grid gap-3 text-[14px] leading-[1.43]"
              style={{ color: COLORS.body }}
            >
              {[
                "Shared tokens and primitives",
                "Public marketplace routes",
                "Auth routes",
                "Dashboard shell",
                "Role dashboards",
                "Admin utilities",
              ].map((item, index) => (
                <p key={item} className="flex items-center gap-2">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[12px] font-semibold"
                    style={{ color: COLORS.primaryActive }}
                  >
                    {index + 1}
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div
            className="rounded-[18px] border p-5"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            <p
              className="text-[16px] font-semibold leading-[1.25]"
              style={{ color: COLORS.ink }}
            >
              QA checklist
            </p>
            <div
              className="mt-4 grid gap-3 text-[14px] leading-[1.43]"
              style={{ color: COLORS.body }}
            >
              {qaItems.map((item) => (
                <p key={item} className="flex gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: COLORS.primary }}
                  />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FinalDeliverySection() {
  const routeMap = [
    {
      route: "/",
      owner: "Public",
      source:
        "Header, HeroBand, CategoryStrip, artisan grid, HowItWorksSection, ArtisanCtaBand, footer",
      status: "Extract first",
    },
    {
      route: "/artisans",
      owner: "Public",
      source: "BrowseDirectorySection",
      status: "Needs API filters",
    },
    {
      route: "/artisans/[id]",
      owner: "Public",
      source: "PublicArtisanProfileSection + PortfolioQuickView",
      status: "Needs dynamic route",
    },
    {
      route: "/sign-in",
      owner: "Auth",
      source: "Role-agnostic sign-in page",
      status: "Needs auth provider",
    },
    {
      route: "/sign-up",
      owner: "Auth",
      source: "Client default sign-up",
      status: "Needs validation",
    },
    {
      route: "/sign-up?role=artisan",
      owner: "Auth",
      source: "Artisan role-aware sign-up",
      status: "Needs validation",
    },
    {
      route: "/sign-up?invite=[token]&role=artisan",
      owner: "Auth",
      source: "Invite-forced artisan sign-up",
      status: "Needs token validation",
    },
    {
      route: "/dashboard",
      owner: "Shared",
      source: "DashboardPreviewSection",
      status: "Split by role",
    },
    {
      route: "/artisan/*",
      owner: "Artisan",
      source: "ArtisanDashboardCoreSection",
      status: "Needs protected routes",
    },
    {
      route: "/client/*",
      owner: "Client",
      source: "ClientDashboardCoreSection",
      status: "Needs protected routes",
    },
    {
      route: "/admin/*",
      owner: "Admin",
      source: "AdminOperationsSection + SecondaryOperationsSection",
      status: "Admin protected",
    },
  ];

  const componentGroups = [
    {
      title: "Design primitives",
      items: [
        "COLORS",
        "shadow",
        "softShadow",
        "StatusChip",
        "DashboardStatCard",
        "FilterChip",
        "ChapaWorksLogo",
      ],
    },
    {
      title: "Public marketplace",
      items: [
        "Header",
        "MorphingSearchBar",
        "SearchPopover",
        "MobileSearchPanel",
        "ProductTabs",
        "ArtisanPreviewCard",
        "PortfolioQuickView",
      ],
    },
    {
      title: "Dashboard patterns",
      items: [
        "dashboard shell",
        "role tabs",
        "stat cards",
        "record tables",
        "detail slideover",
        "activity feed",
        "message thread",
      ],
    },
    {
      title: "Admin patterns",
      items: [
        "verification queue",
        "review detail",
        "invite form",
        "moderation queue",
        "monitoring rows",
        "finance records",
      ],
    },
  ];

  const apiContracts = [
    [
      "GET /api/artisans",
      "query, profession, county, availability, sort, page",
    ],
    [
      "GET /api/artisans/:id",
      "profile, portfolio, reviews, verification state",
    ],
    ["POST /api/jobs", "client creates job request against artisan"],
    ["PATCH /api/jobs/:id/quote", "artisan creates or revises quote"],
    [
      "POST /api/jobs/:id/decision",
      "client accepts, rejects, or requests revision",
    ],
    ["GET /api/messages/threads", "role-aware conversation list"],
    ["POST /api/reviews", "client review after completed job"],
    [
      "POST /api/admin/verifications/:id/decision",
      "approve or reject artisan verification",
    ],
    ["POST /api/admin/invites", "send role-aware invite token"],
    [
      "GET /api/admin/analytics",
      "marketplace, subscription, and health metrics",
    ],
  ];

  const qaMatrix = [
    {
      area: "Responsive",
      checks: [
        "Header collapses below 744px",
        "Search becomes single mobile pill",
        "Cards stack cleanly",
        "Dashboard controls scroll horizontally",
      ],
      icon: PanelLeft,
    },
    {
      area: "Accessibility",
      checks: [
        "Buttons have accessible labels",
        "Modals close with Escape",
        "Focus states remain visible",
        "Form fields keep labels/placeholders",
      ],
      icon: ShieldCheck,
    },
    {
      area: "Motion",
      checks: [
        "Search morph avoids layout thrash",
        "Popover transitions preserve height",
        "Dashboard tab changes stay under 220ms",
        "Modals use spring entrance only",
      ],
      icon: Activity,
    },
    {
      area: "Production",
      checks: [
        "Move mock data to fixtures",
        "Add route loaders",
        "Protect dashboards by role",
        "Disable job payment UI in testing",
      ],
      icon: ServerCog,
    },
  ];

  return (
    <section
      id="final-delivery"
      className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.muted }}
          >
            Final sprint · Implementation handoff
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            All remaining work consolidated into a production handoff map.
          </h2>
          <p
            className="mt-2 max-w-[780px] text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            The preview now contains the complete public, auth, artisan, client,
            admin, analytics, and readiness surfaces. This final layer defines
            how to extract it into real routes, shared components, data
            contracts, and QA passes.
          </p>
        </div>
        <button
          onClick={() => scrollToId("support-footer")}
          className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
          style={{ borderColor: COLORS.hairline, color: COLORS.ink }}
        >
          Finish review
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid gap-6">
        <div
          className="overflow-hidden rounded-[28px] border bg-white"
          style={{ borderColor: COLORS.hairlineSoft, boxShadow: shadow }}
        >
          <div
            className="border-b px-5 py-4"
            style={{
              borderColor: COLORS.hairlineSoft,
              background: COLORS.surfaceSoft,
            }}
          >
            <p
              className="text-[16px] font-semibold leading-[1.25]"
              style={{ color: COLORS.ink }}
            >
              Route extraction map
            </p>
            <p
              className="mt-1 text-[13px] leading-[1.23]"
              style={{ color: COLORS.muted }}
            >
              Use this as the migration table when moving the single preview
              into the app router.
            </p>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            {routeMap.map((row) => (
              <div
                key={row.route}
                className="grid gap-3 px-5 py-4 md:grid-cols-[180px_120px_1fr_150px] md:items-center"
              >
                <code
                  className="rounded-lg bg-[#f7f7f7] px-2 py-1 text-[13px] font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  {row.route}
                </code>
                <span
                  className="text-[14px] font-medium"
                  style={{ color: COLORS.body }}
                >
                  {row.owner}
                </span>
                <span
                  className="text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  {row.source}
                </span>
                <span
                  className="rounded-full border px-2.5 py-1 text-center text-[11px] font-semibold leading-[1.18]"
                  style={{
                    borderColor: COLORS.hairline,
                    background: COLORS.canvas,
                    color: COLORS.body,
                  }}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div
            className="rounded-[28px] border bg-white p-5"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            <p
              className="text-[16px] font-semibold leading-[1.25]"
              style={{ color: COLORS.ink }}
            >
              Shared component registry
            </p>
            <div className="mt-5 grid gap-4">
              {componentGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-[18px] border p-4"
                  style={{
                    borderColor: COLORS.hairlineSoft,
                    background: COLORS.surfaceSoft,
                  }}
                >
                  <p
                    className="text-[14px] font-semibold leading-[1.29]"
                    style={{ color: COLORS.ink }}
                  >
                    {group.title}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border bg-white px-2.5 py-1 text-[13px] leading-[1.23]"
                        style={{
                          borderColor: COLORS.hairlineSoft,
                          color: COLORS.body,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="overflow-hidden rounded-[28px] border bg-white"
            style={{ borderColor: COLORS.hairlineSoft }}
          >
            <div
              className="border-b px-5 py-4"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              <p
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.ink }}
              >
                Backend and data contracts
              </p>
              <p
                className="mt-1 text-[13px] leading-[1.23]"
                style={{ color: COLORS.muted }}
              >
                Minimum endpoints needed to replace mock state with real data.
              </p>
            </div>
            <div
              className="divide-y"
              style={{ borderColor: COLORS.hairlineSoft }}
            >
              {apiContracts.map(([endpoint, description]) => (
                <div
                  key={endpoint}
                  className="grid gap-2 px-5 py-3 md:grid-cols-[240px_1fr] md:items-center"
                >
                  <code
                    className="text-[13px] font-semibold"
                    style={{ color: COLORS.primaryActive }}
                  >
                    {endpoint}
                  </code>
                  <span
                    className="text-[14px] leading-[1.43]"
                    style={{ color: COLORS.muted }}
                  >
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {qaMatrix.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.area}
                className="rounded-[18px] border bg-white p-5"
                style={{
                  borderColor: COLORS.hairlineSoft,
                  boxShadow: softShadow,
                }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-full"
                    style={{
                      background: COLORS.primaryTint,
                      color: COLORS.primary,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                  <StatusChip status="ACTIVE" />
                </div>
                <p
                  className="text-[16px] font-semibold leading-[1.25]"
                  style={{ color: COLORS.ink }}
                >
                  {group.area}
                </p>
                <div
                  className="mt-3 grid gap-2 text-[14px] leading-[1.43]"
                  style={{ color: COLORS.body }}
                >
                  {group.checks.map((check) => (
                    <p key={check} className="flex gap-2">
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0"
                        style={{ color: COLORS.primary }}
                      />{" "}
                      {check}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="rounded-[28px] border p-6 md:p-8"
          style={{
            borderColor: COLORS.primarySoft,
            background: COLORS.primaryTint,
          }}
        >
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p
                className="text-[16px] font-semibold leading-[1.25]"
                style={{ color: COLORS.primaryActive }}
              >
                Completion state
              </p>
              <p
                className="mt-2 max-w-[760px] text-[14px] leading-[1.43]"
                style={{ color: COLORS.body }}
              >
                The preview has reached complete coverage for the workload:
                public discovery, authentication, onboarding, artisan
                operations, client operations, admin trust workflows,
                finance/analytics/monitoring, route mapping, component
                extraction, and QA readiness.
              </p>
            </div>
            <button
              onClick={() => scrollToId("preview-readiness")}
              className="h-11 w-fit cursor-pointer rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800"
              style={{ background: COLORS.primary }}
            >
              Review readiness map
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SourceAdminPreview({
  initialRoute = "/admin",
  adminDetailContent,
}: {
  initialRoute?: string;
  adminDetailContent?: React.ReactNode;
} = {}) {
  const { route, navigate } = useHashRoute(initialRoute as AppRoute);
  const [activeTab, setActiveTab] = useState<ProductTabId>("repairs");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAllCards, setShowAllCards] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [selectedPortfolioArtisan, setSelectedPortfolioArtisan] = useState<
    (typeof artisans)[number] | null
  >(null);
  const [profilePreviewArtisan, setProfilePreviewArtisan] = useState<
    (typeof artisans)[number]
  >(artisans[0]);
  const content = tabContent[activeTab];
  const selectedCategory = categoryOptions.find(
    (category) => category.label === activeCategory,
  );
  const filteredArtisans = useMemo(() => {
    if (activeCategory !== "All" && selectedCategory?.profession) {
      return artisans.filter(
        (artisan) => artisan.profession === selectedCategory.profession,
      );
    }

    return artisans.filter((artisan) =>
      content.professions.includes(artisan.profession),
    );
  }, [activeCategory, content.professions, selectedCategory?.profession]);
  const visibleArtisans = showAllCards ? artisans : filteredArtisans;
  const routedArtisanId = route.startsWith("/artisans/")
    ? route.split("/").pop()
    : null;
  const routedProfileArtisan =
    artisans.find((artisan) => artisan.id === routedArtisanId) ??
    profilePreviewArtisan;

  const handleNavigate = (target: string) => {
    const anchorToRoute: Record<string, AppRoute> = {
      "browse-artisans": "/artisans",
      "auth-preview": "/sign-in",
      "for-artisans": "/for-artisans",
      "dashboard-shell-preview": "/dashboard",
      "artisan-core-flow": "/artisan/dashboard",
      "client-core-flow": "/client/dashboard",
      "admin-operations-flow": "/admin",
      "secondary-ops-flow": "/admin/analytics",
      "preview-readiness": "/readiness",
      "support-footer": "/readiness",
    };
    navigate(anchorToRoute[target] ?? (target as AppRoute));
  };

  const triggerPreviewLoading = () => {
    setIsPageLoading(true);
    window.setTimeout(() => setIsPageLoading(false), 520);
  };

  const handleTabChange = (tab: ProductTabId) => {
    setActiveTab(tab);
    setActiveCategory("All");
    setShowAllCards(false);
    triggerPreviewLoading();
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setShowAllCards(false);
    triggerPreviewLoading();
  };

  const routeShellKey = route.startsWith("/admin/") || route === "/admin"
    ? "admin-dashboard-shell"
    : route.startsWith("/artisan/")
      ? "artisan-dashboard-shell"
      : route.startsWith("/client/")
        ? "client-dashboard-shell"
        : route === "/dashboard"
          ? "dashboard-shell"
          : route;

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily:
          'Inter, Circular, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {!isDashboardRoute(route) && (
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onNavigate={handleNavigate}
          route={route}
        />
      )}
      <main
        className={
          isDashboardRoute(route) ? "pt-0" : "pt-[132px] md:pt-[180px]"
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={routeShellKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={routeTransition}
          >
            {route === "/" && (
              <>
                <HeroBand activeTab={activeTab} />
                <CategoryStrip
                  activeCategory={activeCategory}
                  onChange={handleCategoryChange}
                />
                <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-10">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{
                            duration: 0.18,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <h2
                            className="text-[22px] font-semibold leading-tight tracking-[-0.01em]"
                            style={{ color: COLORS.ink }}
                          >
                            {showAllCards
                              ? "All available artisans"
                              : activeCategory !== "All"
                                ? `${activeCategory} artisans`
                                : content.title}
                          </h2>
                          <p
                            className="mt-1 text-[14px]"
                            style={{ color: COLORS.muted }}
                          >
                            {showAllCards
                              ? "Browse every featured artisan in the preview, then collapse back to the selected category."
                              : activeCategory !== "All"
                                ? `Showing available ${activeCategory.toLowerCase()} professionals from the marketplace preview.`
                                : content.subtitle}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => {
                        setShowAllCards((value) => !value);
                        triggerPreviewLoading();
                      }}
                      className="hidden cursor-pointer rounded-full border px-4 py-2 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7] md:block"
                      style={{
                        borderColor: COLORS.hairline,
                        color: COLORS.ink,
                      }}
                    >
                      {showAllCards
                        ? "Show fewer"
                        : `Show all ${activeTab === "repairs" ? "artisans" : activeTab}`}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start xl:grid-cols-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {isPageLoading ? (
                        Array.from({
                          length: showAllCards
                            ? 8
                            : Math.max(3, filteredArtisans.length || 3),
                        }).map((_, index) => (
                          <motion.div
                            key={`skeleton-${activeTab}-${index}`}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{
                              duration: 0.16,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <ArtisanCardSkeleton />
                          </motion.div>
                        ))
                      ) : visibleArtisans.length === 0 ? (
                        <EmptyArtisanState
                          activeCategory={activeCategory}
                          onReset={() => handleCategoryChange("All")}
                        />
                      ) : (
                        visibleArtisans.map((artisan) => (
                          <motion.div
                            key={artisan.id}
                            layout
                            initial={{ opacity: 0, y: 12, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.985 }}
                            transition={{
                              duration: 0.18,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <ArtisanPreviewCard
                              artisan={artisan}
                              onOpenPortfolio={setSelectedPortfolioArtisan}
                              onViewProfile={(nextArtisan) => {
                                setProfilePreviewArtisan(nextArtisan);
                                navigate(
                                  `/artisans/${nextArtisan.id}` as AppRoute,
                                );
                              }}
                            />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </section>
                <HowItWorksSection />
                <ArtisanCtaBand onNavigate={handleNavigate} />
                <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16">
                  <h2
                    className="text-[22px] font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Explore artisans by area
                  </h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    {cityLinks.map(([city, type]) => (
                      <button
                        key={city}
                        onClick={() => navigate("/artisans")}
                        className="rounded-2xl p-3 text-left transition hover:bg-[#f7f7f7]"
                      >
                        <span
                          className="block text-[16px] font-semibold"
                          style={{ color: COLORS.ink }}
                        >
                          {city}
                        </span>
                        <span
                          className="block text-[14px]"
                          style={{ color: COLORS.muted }}
                        >
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {route === "/artisans" && (
              <BrowseDirectorySection
                onOpenPortfolio={setSelectedPortfolioArtisan}
                onViewProfile={(nextArtisan) => {
                  setProfilePreviewArtisan(nextArtisan);
                  navigate(`/artisans/${nextArtisan.id}` as AppRoute);
                }}
              />
            )}

            {route.startsWith("/artisans/") && (
              <PublicArtisanProfileSection
                activeArtisan={routedProfileArtisan}
                onSelectArtisan={(nextArtisan) => {
                  setProfilePreviewArtisan(nextArtisan);
                  navigate(`/artisans/${nextArtisan.id}` as AppRoute);
                }}
                onOpenPortfolio={setSelectedPortfolioArtisan}
                onNavigate={handleNavigate}
              />
            )}

            {route === "/for-artisans" && (
              <ForArtisansLandingPage onNavigate={navigate} />
            )}

            {(route === "/sign-in" || route === "/auth/sign-in") && (
              <AuthPreviewSection initialMode="signin" onNavigate={navigate} />
            )}
            {(route === "/sign-up" || route === "/auth/sign-up") && (
              <AuthPreviewSection
                initialMode="signup"
                signupRole="client"
                onNavigate={navigate}
              />
            )}
            {route === "/sign-up?role=artisan" && (
              <AuthPreviewSection
                initialMode="signup"
                signupRole="artisan"
                onNavigate={navigate}
              />
            )}
            {(route === "/sign-up?invite=demo-token&role=artisan" ||
              route === "/invite/demo-token") && (
              <AuthPreviewSection
                initialMode="signup"
                signupRole="artisan"
                inviteToken="demo-token"
                onNavigate={navigate}
              />
            )}
            {route === "/dashboard" && (
              <DashboardRouteFrame>
                <DashboardPreviewSection />
              </DashboardRouteFrame>
            )}
            {route.startsWith("/artisan/") && (
              <DashboardRouteFrame>
                <ArtisanDashboardCoreSection
                  initialView={artisanRouteToView[route] ?? "overview"}
                  onRouteChange={(view) => {
                    if (view !== "job-detail" && view !== "earning-detail")
                      navigate(artisanViewToRoute[view]);
                  }}
                />
              </DashboardRouteFrame>
            )}
            {route.startsWith("/client/") && (
              <DashboardRouteFrame>
                <ClientDashboardCoreSection
                  initialView={clientRouteToView[route] ?? "overview"}
                  onRouteChange={(view) => {
                    if (view !== "job-detail")
                      navigate(clientViewToRoute[view]);
                  }}
                  onOpenPortfolio={setSelectedPortfolioArtisan}
                  onViewProfile={(nextArtisan) => {
                    setProfilePreviewArtisan(nextArtisan);
                    navigate(`/artisans/${nextArtisan.id}` as AppRoute);
                  }}
                />
              </DashboardRouteFrame>
            )}
            {(route === "/admin" ||
              route === "/admin/verification" ||
              route === "/admin/artisans" ||
              route === "/admin/users" ||
              route === "/admin/invites" ||
              route === "/admin/moderation" ||
              route === "/admin/analytics" ||
              route === "/admin/monitoring" ||
              route === "/admin/locations" ||
              route === "/admin/settings") && (
              <DashboardRouteFrame>
                <AdminOperationsSection
                  initialView={adminRouteToView[route] ?? "overview"}
                  onRouteChange={(view) => navigate(adminViewToRoute[view])}
                  detailContent={adminDetailContent}
                />
              </DashboardRouteFrame>
            )}
            {(route === "/admin/earnings" ||
              route === "/admin/subscriptions" ||
              route === "/admin/payouts" ||
              route === "/admin/reports" ||
              route === "/admin/database" ||
              route === "/admin/help" ||
              route === "/admin/system") && (
              <DashboardRouteFrame>
                <SecondaryOperationsSection
                  initialView={secondaryRouteToView[route] ?? "analytics"}
                  onRouteChange={(view) => {
                    const nextRoute = secondaryViewToRoute[view];
                    if (nextRoute) navigate(nextRoute);
                  }}
                />
              </DashboardRouteFrame>
            )}
            {route === "/readiness" && (
              <>
                <PreviewReadinessSection />
                <FinalDeliverySection />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {!isDashboardRoute(route) && (
          <footer
            id="support-footer"
            className="border-t px-5 py-12 md:px-10"
            style={{
              borderColor: COLORS.hairlineSoft,
              background: COLORS.surfaceSoft,
            }}
          >
            <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div>
                <ChapaWorksLogo />
                <p
                  className="mt-3 max-w-[300px] text-[14px] leading-[1.43]"
                  style={{ color: COLORS.muted }}
                >
                  A trusted marketplace for hiring skilled Kenyan artisans with
                  confidence.
                </p>
              </div>
              {[
                [
                  "Support",
                  [
                    { label: "Help Center", route: "/readiness" },
                    { label: "Safety", route: "/readiness" },
                    { label: "Dispute support", route: "/client/messages" },
                    { label: "Contact", route: "/sign-in" },
                  ],
                ],
                [
                  "For artisans",
                  [
                    { label: "Create profile", route: "/sign-up?role=artisan" },
                    { label: "Verification", route: "/artisan/settings" },
                    { label: "Subscriptions", route: "/artisan/subscription" },
                    { label: "Portfolio tips", route: "/artisan/portfolio" },
                  ],
                ],
                [
                  "ChapaWorks",
                  [
                    { label: "Browse artisans", route: "/artisans" },
                    { label: "Pricing", route: "/admin/analytics" },
                    { label: "For artisans", route: "/for-artisans" },
                    { label: "How it works", route: "/" },
                  ],
                ],
              ].map(([group, links]) => (
                <div key={group as string}>
                  <h3
                    className="text-[16px] font-medium"
                    style={{ color: COLORS.ink }}
                  >
                    {group as string}
                  </h3>
                  <div
                    className="mt-3 grid gap-2 text-[14px]"
                    style={{ color: COLORS.body }}
                  >
                    {(links as Array<{ label: string; route: AppRoute }>).map(
                      (link) => (
                        <button
                          key={link.label}
                          onClick={() => navigate(link.route)}
                          className="w-fit cursor-pointer text-left transition-colors hover:text-[#222222] hover:underline"
                        >
                          {link.label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mx-auto mt-10 flex max-w-[1280px] flex-col gap-2 border-t pt-5 text-[13px] leading-[1.23] md:flex-row md:items-center md:justify-between"
              style={{ borderColor: COLORS.hairlineSoft, color: COLORS.muted }}
            >
              <p>© 2026 ChapaWorks. All rights reserved.</p>
              <p>
                Cash-only job payments during testing · Subscription payments
                remain active
              </p>
            </div>
          </footer>
        )}
      </main>
      <AnimatePresence initial={false}>
        {selectedPortfolioArtisan && (
          <PortfolioQuickView
            artisan={selectedPortfolioArtisan}
            onClose={() => setSelectedPortfolioArtisan(null)}
            onMessage={() => {
              setSelectedPortfolioArtisan(null);
              navigate("/sign-in");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
