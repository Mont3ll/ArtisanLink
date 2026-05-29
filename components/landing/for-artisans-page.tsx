"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileCheck2,
  Hammer,
  Images,
  MessageCircle,
  ReceiptText,
  Search,
  UserRound,
} from "lucide-react";

import { COLORS, SHADOWS } from "@/lib/design-tokens";

export function ForArtisansPage() {
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
    ["Jobs", "View requests, quote work, revise once, start work, and mark complete."],
    ["Messages", "Reply to clients, share attachments, and keep job conversations in context."],
    ["Portfolio", "Publish, edit, hide, feature, or remove project cards."],
    ["Earnings", "Track payouts, commission rate, payout history, and failed payout states."],
    ["Subscription", "Upgrade for priority search placement, premium badge, larger portfolio, and lower commission."],
    ["Settings", "Manage profile, specializations, location, verification, and notifications."],
  ];

  return (
    <>
      <section className="mx-auto max-w-[1280px] px-5 pb-8 pt-7 md:px-10 md:pb-12 md:pt-10">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="mb-3 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.primary }}>
              List your craft
            </p>
            <h1 className="max-w-[640px] text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] md:text-[48px]" style={{ color: COLORS.ink }}>
              Turn your skill into a trusted ChapaWorks profile.
            </h1>
            <p className="mt-4 max-w-[600px] text-[16px] leading-[1.5]" style={{ color: COLORS.body }}>
              Create a verified artisan profile, showcase your work, respond to client requests, send quotes, and manage the full job workflow from one focused workspace.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up?role=artisan" className="flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800" style={{ background: COLORS.primary }}>
                Start artisan profile
                <ArrowRight size={18} />
              </Link>
              <Link href="/artisan/dashboard" className="flex h-12 items-center justify-center gap-2 rounded-lg border px-5 text-[16px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.ink, color: COLORS.ink }}>
                Preview workspace
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Free profile", "Verification badge", "Portfolio showcase", "Client messages", "Quote workflow"].map((item) => (
                <span key={item} className="rounded-full border px-3 py-1.5 text-[13px] leading-[1.23]" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft, color: COLORS.body }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border bg-white p-4 md:p-5" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}>
            <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: COLORS.hairlineSoft }}>
              <div className="aspect-[16/9]" style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 42%, #047857 100%)" }} />
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
                      <Hammer size={20} />
                    </span>
                    <span>
                      <span className="block text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>Grace Wanjiku</span>
                      <span className="block text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>Carpenter · Kiambu</span>
                    </span>
                  </div>
                  <span className="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint, color: COLORS.primaryActive }}>
                    Verified
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[["4.8", "rating"], ["64", "reviews"], ["KES 2,600", "per hour"]].map(([value, label]) => (
                    <div key={label} className="rounded-[14px] border p-3" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                      <p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>{value}</p>
                      <p className="text-[13px]" style={{ color: COLORS.muted }}>{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Cabinets", "Custom beds", "Shelving", "Repairs"].map((item) => (
                    <span key={item} className="rounded-full border px-2.5 py-1 text-[13px]" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.canvas, color: COLORS.body }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div className="mb-6 max-w-[680px]">
          <p className="mb-2 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.muted }}>What you need to list</p>
          <h2 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>A public profile clients can trust before they message you.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {requirements.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[18px] border bg-white p-5" style={{ borderColor: COLORS.hairlineSoft }}>
                <span className="mb-5 grid h-11 w-11 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
                  <Icon size={19} />
                </span>
                <h3 className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>{item.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="sticky top-28 rounded-[24px] border p-5" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
            <p className="text-[16px] font-semibold leading-[1.25]" style={{ color: COLORS.primaryActive }}>How the work flows</p>
            <p className="mt-2 text-[14px] leading-[1.43]" style={{ color: COLORS.body }}>ChapaWorks keeps discovery, messaging, quoting, job progress, and reviews connected so clients know what happens next.</p>
            <Link href="/sign-up?role=artisan" className="mt-5 inline-flex h-11 items-center rounded-lg px-4 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800" style={{ background: COLORS.primary }}>
              Join as artisan
            </Link>
          </div>
          <div className="grid gap-3">
            {workLoop.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="grid gap-4 rounded-[18px] border bg-white p-4 md:grid-cols-[56px_1fr]" style={{ borderColor: COLORS.hairlineSoft }}>
                  <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: index === 0 ? COLORS.primaryTint : COLORS.surfaceSoft, color: COLORS.primary }}>
                    <Icon size={19} />
                  </span>
                  <span>
                    <span className="mb-1 block text-[13px] font-medium" style={{ color: COLORS.muted }}>Step {index + 1}</span>
                    <span className="block text-[16px] font-semibold" style={{ color: COLORS.ink }}>{item.title}</span>
                    <span className="mt-1 block text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>{item.body}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[14px] font-medium" style={{ color: COLORS.muted }}>Inside your workspace</p>
              <h2 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>Everything you manage after listing your craft.</h2>
            </div>
            <Link href="/artisan/dashboard" className="h-10 w-fit rounded-lg border px-4 py-2 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
              Open dashboard preview
            </Link>
          </div>
          <div className="grid items-start gap-3 md:grid-cols-2 lg:grid-cols-3">
            {dashboardItems.map(([title, body]) => (
              <div key={title} className="rounded-[16px] border p-4" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
                <p className="text-[15px] font-semibold leading-[1.25]" style={{ color: COLORS.ink }}>{title}</p>
                <p className="mt-1 text-[13px] leading-[1.23]" style={{ color: COLORS.muted }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-5 rounded-[28px] border p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8" style={{ borderColor: COLORS.primarySoft, background: COLORS.primaryTint }}>
          <div>
            <p className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>Ready to list your craft?</p>
            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.43]" style={{ color: COLORS.body }}>Start as an artisan, complete profile details, add work samples, then submit verification so clients can find and trust your profile.</p>
          </div>
          <Link href="/sign-up?role=artisan" className="inline-flex h-12 w-fit items-center rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800" style={{ background: COLORS.primary }}>
            Create artisan profile
          </Link>
        </div>
      </section>
    </>
  );
}
