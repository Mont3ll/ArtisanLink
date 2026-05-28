"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Hammer } from "lucide-react";
import { motion } from "framer-motion";

import { COLORS, SHADOWS } from "@/lib/design-tokens";

export function AuthPreviewShell({
  mode,
  role = "client",
  inviteToken,
  children,
}: {
  mode: "signin" | "signup";
  role?: "client" | "artisan";
  inviteToken?: string | null;
  children: React.ReactNode;
}) {
  const isSignIn = mode === "signin";
  const isInvite = Boolean(inviteToken);
  const isArtisan = isInvite || role === "artisan";
  const headline = isSignIn ? "Welcome back" : isArtisan ? "Join as an Artisan" : "Create Your Account";
  const subheadline = isSignIn
    ? "Sign in once. Your verified role decides whether you land in the client, artisan, or admin dashboard."
    : isArtisan
      ? "Showcase your skills, get discovered by clients across Kenya."
      : "Find and hire verified artisans near you.";

  const bullets = isSignIn
    ? ["Return to your active conversations", "Continue reviewing jobs and quotes", "Land in the right workspace after sign-in"]
    : isArtisan
      ? ["Show portfolio projects and specializations", "Receive quote requests from nearby clients", "Complete verification to improve marketplace trust"]
      : ["Browse verified artisans near you", "Save profiles and compare options", "Message artisans before requesting a quote"];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white overflow-y-auto">
      <section
        id="auth-preview"
        className="w-full max-w-[1080px] px-5 py-12 md:px-10 md:py-16"
      >
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] transition-opacity hover:opacity-75"
            style={{ color: COLORS.ink }}
          >
            <Image src="/logo.svg" alt="ChapaWorks" width={32} height={32} className="object-contain" />
            ChapaWorks
          </Link>
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors hover:bg-[#f7f7f7]"
            style={{ borderColor: COLORS.hairline, color: COLORS.muted }}
          >
            ← Home
          </Link>
        </div>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.muted }}>Account access</p>
            <h1 className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>{headline}</h1>
            <p className="mt-2 max-w-[620px] text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>{subheadline}</p>
          </div>
          <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="inline-flex h-10 w-fit items-center rounded-full border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]" style={{ borderColor: COLORS.hairline, color: COLORS.ink }}>
            {isSignIn ? "Create account" : "Sign in"}
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-[0.86fr_1.14fr] md:items-start">
          <div className="rounded-[28px] border p-6" style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}>
            <p className="text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.primary }}>
              {isSignIn ? "One account for every workspace" : isArtisan ? "Built for skilled professionals" : "Hire with more confidence"}
            </p>
            <p className="mt-3 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>
              {isSignIn
                ? "Access your saved artisans, jobs, messages, and dashboard in one place."
                : isArtisan
                  ? "Create a public profile that helps clients understand your craft before they message you."
                  : "Start with verified profiles, visible ratings, portfolios, and direct messaging."}
            </p>
            <div className="mt-8 grid gap-3 text-[14px] leading-[1.43]" style={{ color: COLORS.body }}>
              {bullets.map((item) => (
                <p key={item} className="flex items-center gap-2"><CheckCircle2 size={16} style={{ color: COLORS.primary }} /> {item}</p>
              ))}
            </div>
            <div className="mt-8 rounded-[18px] border bg-white p-4" style={{ borderColor: COLORS.hairlineSoft }}>
              <p className="text-[14px] font-semibold leading-[1.29]" style={{ color: COLORS.ink }}>
                {isSignIn ? "After sign-in" : isArtisan ? "After creating your profile" : "After creating your account"}
              </p>
              <p className="mt-1 text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
                {isSignIn
                  ? "ChapaWorks sends you to the workspace attached to your account."
                  : isArtisan
                    ? "You can add portfolio work, set availability, and submit verification details."
                    : "You can save artisans, send messages, and manage job requests from your client dashboard."}
              </p>
            </div>
          </div>

          <motion.div layout className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: COLORS.hairlineSoft, boxShadow: SHADOWS.card }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium leading-[1.23]" style={{ borderColor: isArtisan ? "#fde68a" : COLORS.primarySoft, background: isArtisan ? "#fffbeb" : COLORS.primaryTint, color: isArtisan ? "#92400e" : COLORS.primaryActive }}>
                {isArtisan && <Hammer size={14} />}
                {!isArtisan && !isSignIn && <span className="h-2 w-2 rounded-full" style={{ background: COLORS.primary }} />}
                {isSignIn ? "Role resolved after sign-in" : `Signing up as ${isArtisan ? "artisan" : "client"}`}
              </span>
            </div>
            {children}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
