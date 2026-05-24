"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
  Zap,
  HelpCircle,
  UserPlus,
  LogIn,
  Gift,
  ChevronRight,
} from "lucide-react";

import { COLORS, SHADOWS, TRANSITIONS } from "@/lib/design-tokens";

export type ProductTabId = "repairs" | "build" | "design";

export interface HeaderProps {
  activeTab?: ProductTabId;
  onTabChange?: (tab: ProductTabId) => void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const CHAPAWORKS_LOGO_SRC = "/logo.svg";

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
  isSignedIn,
  onClose,
}: {
  isSignedIn: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const navigate = (target: string) => {
    router.push(target);
    onClose();
  };
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
      style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
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
                  navigate(item.featured ? "/for-artisans" : "/readiness")
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
                  navigate(
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

        {isSignedIn ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#f7f7f7]"
          >
            <UserRound size={16} style={{ color: COLORS.body }} />
            <span
              className="text-[14px] leading-[1.43]"
              style={{ color: COLORS.ink }}
            >
              Dashboard
            </span>
          </button>
        ) : (
          <div className="grid gap-1">
            <button
              onClick={() => navigate("/sign-in")}
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
            <button
              onClick={() => navigate("/sign-up")}
              className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[#f7f7f7]"
            >
              <UserPlus size={16} style={{ color: COLORS.body }} />
              <span
                className="text-[14px] leading-[1.43]"
                style={{ color: COLORS.ink }}
              >
                Create account
              </span>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function AccountControls() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
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
        onClick={() => router.push("/for-artisans")}
        className="hidden cursor-pointer rounded-full px-4 py-3 text-[14px] font-semibold transition-colors duration-200 ease-out hover:bg-[#f7f7f7] lg:block"
        style={{ color: COLORS.ink }}
      >
        List your craft
      </button>
      <button
        onClick={() => router.push("/artisans")}
        className="hidden h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors duration-200 ease-out hover:bg-[#f7f7f7] md:grid"
        aria-label="Browse artisans by location"
      >
        <MapPin size={18} />
      </button>
      {isSignedIn ? (
        <Link
          href="/dashboard"
          className="hidden cursor-pointer rounded-full px-4 py-3 text-[14px] font-semibold text-white transition-colors duration-200 ease-out hover:bg-emerald-800 lg:block"
          style={{ background: COLORS.primary }}
        >
          Dashboard
        </Link>
      ) : (
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/sign-in"
            className="cursor-pointer rounded-full px-4 py-3 text-[14px] font-semibold transition-colors duration-200 ease-out hover:bg-[#f7f7f7]"
            style={{ color: COLORS.ink }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="cursor-pointer rounded-full px-4 py-3 text-[14px] font-semibold text-white transition-colors duration-200 ease-out hover:bg-emerald-800"
            style={{ background: COLORS.primary }}
          >
            Sign up
          </Link>
        </div>
      )}
      <button
        className="flex h-12 cursor-pointer items-center gap-3 rounded-full border py-2 pl-3 pr-2 transition-[background-color,box-shadow] duration-200 ease-out hover:shadow-md"
        style={{
          borderColor: COLORS.hairline,
          boxShadow: SHADOWS.soft,
          background: menuOpen ? COLORS.surfaceSoft : COLORS.canvas,
        }}
        aria-label="Open account menu"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
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
            isSignedIn={isSignedIn ?? false}
            onClose={() => setMenuOpen(false)}
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
        boxShadow: SHADOWS.card,
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
          boxShadow: SHADOWS.card,
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
                      boxShadow: SHADOWS.soft,
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
                    boxShadow: SHADOWS.card,
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
                        hoveredSection === segment.id ? SHADOWS.soft : "none",
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
      style={{ borderColor: COLORS.hairline, boxShadow: SHADOWS.card }}
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
      style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
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

export default function Header({ activeTab = "repairs", onTabChange }: HeaderProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const handleTabChange = onTabChange ?? (() => undefined);
  const onNavigate = (target: string) => {
    if (target.startsWith("#")) {
      scrollToId(target.slice(1));
      return;
    }
    if (target === "browse-artisans") {
      router.push("/artisans");
      return;
    }
    router.push(target);
  };
  const { scrollY } = useScroll();
  const searchShellRef = useRef<HTMLDivElement | null>(null);
  const progress = useSpring(0, TRANSITIONS.search);
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
  }> = isSignedIn
    ? [{ label: "Dashboard", icon: UserRound, target: "/dashboard" }]
    : [
        { label: "Sign in", icon: LogIn, target: "/sign-in" },
        { label: "Create account", icon: UserPlus, target: "/sign-up" },
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
                  handleTabChange(tab);
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
            <AccountControls />
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
            aria-expanded={mobileOpen}
            aria-haspopup="menu"
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
          transition={TRANSITIONS.header}
          className="overflow-hidden border-t bg-white px-5"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <div className="py-5">
            <ProductTabs
              compact
              activeTab={activeTab}
              onChange={(tab) => {
                handleTabChange(tab);
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

