"use client";

import { Bell, Moon, Sun, UserRound } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { AvatarFallback } from "@/components/ui2";
import { COLORS } from "@/lib/design-tokens";

export function DashboardThemeToggle() {
  return (
    <button type="button" className="grid h-10 w-10 place-items-center rounded-full border" style={{ borderColor: COLORS.hairline, color: COLORS.ink }} aria-label="Toggle theme">
      <Sun className="block dark:hidden" size={16} />
      <Moon className="hidden dark:block" size={16} />
    </button>
  );
}

export function DashboardNotificationButton({ role }: { role: "Artisan" | "Client" | "Admin" | "Studio" }) {
  return (
    <button type="button" className="relative grid h-10 w-10 place-items-center rounded-full border" style={{ borderColor: COLORS.hairline, color: COLORS.ink }} aria-label={`${role} notifications`}>
      <Bell size={16} />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: COLORS.primary }} />
    </button>
  );
}

export function DashboardProfileButton({ role }: { role: "Artisan" | "Client" | "Admin" | "Studio" }) {
  const { user } = useUser();
  const name = user?.fullName ?? role;
  return (
    <button type="button" className="flex h-10 items-center gap-2 rounded-full border pl-1.5 pr-3" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
      {user?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.imageUrl} alt={name} className="h-7 w-7 rounded-full object-cover" />
      ) : name ? (
        <AvatarFallback name={name} size={28} />
      ) : (
        <UserRound size={16} />
      )}
      <span className="hidden text-[13px] font-medium sm:block">{name}</span>
    </button>
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
    <div className="border-b px-5 py-4" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
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
