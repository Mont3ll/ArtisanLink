"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BellRing,
  ChevronRight,
  LogIn,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { COLORS, SHADOWS, TRANSITIONS } from "@/lib/design-tokens";

export function DashboardThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.chapaworksDashboardTheme = dark ? "dark" : "light";
  }, [dark]);

  const Icon = dark ? Moon : Sun;

  return (
    <button
      onClick={() => setDark((v) => !v)}
      className="group flex h-11 cursor-pointer items-center gap-2 rounded-full border bg-white px-3 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
      style={{ borderColor: COLORS.hairline, color: COLORS.ink, boxShadow: SHADOWS.soft }}
      aria-label="Toggle dashboard theme"
    >
      <motion.span
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -24, scale: 0.86, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 24, mass: 0.45 }}
        className="grid place-items-center"
      >
        <Icon size={16} style={{ color: dark ? COLORS.primary : COLORS.amber }} />
      </motion.span>
      <span className="hidden sm:inline">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

export function DashboardNotificationButton({
  role,
}: {
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const notifications =
    role === "Admin"
      ? ["19 verification reviews pending", "Notification worker warning", "3 reported profiles need triage"]
      : role === "Client"
        ? ["Amina sent a quote", "Peter replied to your message", "One completed job needs a review"]
        : ["Miriam replied to your quote", "Verification is still pending", "Portfolio views are up 12%"];

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", handler, { capture: true });
    return () => window.removeEventListener("pointerdown", handler, { capture: true });
  }, [open]);

  const handleViewAll = () => {
    setOpen(false);
    router.push(
      role === "Admin" ? "/admin-dashboard/monitoring" : role === "Client" ? "/client-dashboard/messages" : "/artisan-dashboard/messages"
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full border bg-white transition-colors hover:bg-[#f7f7f7]"
        style={{ borderColor: COLORS.hairline, color: COLORS.ink, boxShadow: SHADOWS.soft }}
        aria-label="Open notifications"
      >
        <BellRing size={17} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full" style={{ background: COLORS.primary }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96, transformOrigin: "top right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={TRANSITIONS.dashboard}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] overflow-hidden rounded-[18px] border bg-white p-2"
            style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
          >
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div>
                <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>Notifications</p>
                <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{notifications.length} unread updates</p>
              </div>
              <span className="rounded-full px-2 py-1 text-[11px] font-semibold text-white" style={{ background: COLORS.primary }}>
                {notifications.length}
              </span>
            </div>
            <div className="h-px" style={{ background: COLORS.hairlineSoft }} />
            <div className="grid gap-1 py-1">
              {notifications.map((item, index) => (
                <button key={item} onClick={handleViewAll} className="flex w-full cursor-pointer gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-[#f7f7f7]">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: index === 0 ? COLORS.primary : COLORS.hairline }} />
                  <span>
                    <span className="block text-[14px] leading-[1.29]" style={{ color: COLORS.ink }}>{item}</span>
                    <span className="mt-0.5 block text-[12px]" style={{ color: COLORS.muted }}>{index + 1}h ago</span>
                  </span>
                </button>
              ))}
            </div>
            <button onClick={handleViewAll} className="mt-1 h-10 w-full cursor-pointer rounded-lg border text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
              View all notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardProfileButton({
  role,
}: {
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", handler, { capture: true });
    return () => window.removeEventListener("pointerdown", handler, { capture: true });
  }, [open]);

  const handleAction = (label: string) => {
    setOpen(false);
    if (label === "Sign out") { router.push("/sign-in"); return; }
    if (role === "Artisan") router.push(label === "Notifications" ? "/artisan-dashboard/messages" : "/artisan-dashboard/settings");
    else if (role === "Client") router.push(label === "Notifications" ? "/client-dashboard/messages" : "/client-dashboard");
    else if (role === "Admin") router.push(label === "Notifications" ? "/admin-dashboard/monitoring" : "/admin-dashboard/settings");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-full border bg-white py-1.5 pl-2.5 pr-3 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
        style={{ borderColor: COLORS.hairline, color: COLORS.ink, boxShadow: SHADOWS.soft }}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
          <UserRound size={16} />
        </span>
        <span className="hidden sm:inline">{user?.firstName ?? role}</span>
        <ChevronRight size={14} className={open ? "rotate-90 transition-transform" : "transition-transform"} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96, transformOrigin: "top right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.62 }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[260px] overflow-hidden rounded-[18px] border bg-white p-2"
            style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}
          >
            <div className="px-3 py-3">
              <p className="text-[14px] font-semibold" style={{ color: COLORS.ink }}>{role} account</p>
              <p className="mt-1 text-[13px]" style={{ color: COLORS.muted }}>{user?.primaryEmailAddress?.emailAddress ?? "—"}</p>
            </div>
            <div className="h-px" style={{ background: COLORS.hairlineSoft }} />
            {(["Profile", "Account settings", "Notifications", "Sign out"] as const).map((label) => {
              const Icon = label === "Sign out" ? LogIn : label === "Notifications" ? BellRing : label === "Account settings" ? Settings : UserRound;
              return (
                <button key={label} onClick={() => handleAction(label)} className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-[#f7f7f7]" style={{ color: COLORS.ink }}>
                  <Icon size={16} style={{ color: COLORS.muted }} />
                  {label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  return (
    <div
      className="border-b px-5 py-4"
      style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[13px] font-medium leading-[1.23]" style={{ color: COLORS.muted }}>{eyebrow}</p>
          <h1 className="mt-1 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>{title}</h1>
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
