import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { COLORS, SHADOWS } from "@/lib/design-tokens";

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
    <div className="min-h-screen" style={{ background: COLORS.surfaceSoft }}>
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
          <h1 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.04em]" style={{ color: COLORS.ink }}>
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
