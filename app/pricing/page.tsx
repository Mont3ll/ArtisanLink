import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, CircleDollarSign, ShieldCheck, Star } from "lucide-react";

import Footer from "@/components/layout/footer-new";
import Header from "@/components/layout/header-new";
import { COLORS, SHADOWS } from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: "Pricing — ChapaWorks",
  description:
    "Simple ChapaWorks pricing for clients and artisans, styled with the redesigned public frontend.",
};

const plans = [
  {
    name: "Client",
    eyebrow: "For hiring",
    price: "Free",
    description: "Browse profiles, compare portfolios, message artisans, and request quotes without platform fees.",
    cta: "Find artisans",
    href: "/artisans",
    icon: ShieldCheck,
    features: ["Verified artisan profiles", "Portfolio and rating visibility", "Direct pre-job messaging", "Saved artisans and job requests"],
  },
  {
    name: "Artisan Starter",
    eyebrow: "For getting listed",
    price: "KES 0",
    description: "Create a profile, submit verification, and start building public trust on ChapaWorks.",
    cta: "Join as artisan",
    href: "/sign-up?role=artisan",
    icon: Star,
    features: ["Public craft profile", "Portfolio project cards", "Verification workflow", "Client quote requests"],
  },
  {
    name: "Artisan Pro",
    eyebrow: "For growing faster",
    price: "KES 1,500/mo",
    description: "Priority search placement, premium trust signals, and more space to showcase your work.",
    cta: "Start onboarding",
    href: "/sign-up?role=artisan",
    icon: CircleDollarSign,
    featured: true,
    features: ["Priority marketplace placement", "Premium artisan badge", "Larger portfolio allowance", "Lower commission rate"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white pt-[132px] md:pt-[180px]">
      <Header />
      <main>
        <section className="mx-auto max-w-[1280px] px-5 pb-8 pt-7 md:px-10 md:pb-12 md:pt-10">
          <div className="mx-auto max-w-[720px] text-center">
            <p className="mb-3 text-[14px] font-medium leading-[1.29]" style={{ color: COLORS.primary }}>
              Marketplace pricing
            </p>
            <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] md:text-[48px]" style={{ color: COLORS.ink }}>
              Free to hire. Fair for skilled artisans.
            </h1>
            <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-[1.5]" style={{ color: COLORS.body }}>
              The redesigned ChapaWorks public frontend keeps client hiring lightweight while giving artisans a clear path from profile creation to premium growth.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-12">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <article
                  key={plan.name}
                  className="rounded-[28px] border bg-white p-6"
                  style={{
                    borderColor: plan.featured ? COLORS.primarySoft : COLORS.hairlineSoft,
                    boxShadow: plan.featured ? SHADOWS.card : SHADOWS.soft,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-medium leading-[1.23]" style={{ color: COLORS.muted }}>
                        {plan.eyebrow}
                      </p>
                      <h2 className="mt-2 text-[22px] font-medium leading-[1.18] tracking-[-0.44px]" style={{ color: COLORS.ink }}>
                        {plan.name}
                      </h2>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-full" style={{ background: COLORS.primaryTint, color: COLORS.primary }}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <p className="mt-6 text-[32px] font-semibold tracking-[-0.04em]" style={{ color: COLORS.ink }}>
                    {plan.price}
                  </p>
                  <p className="mt-3 min-h-16 text-[14px] leading-[1.43]" style={{ color: COLORS.muted }}>
                    {plan.description}
                  </p>
                  <div className="mt-6 grid gap-3">
                    {plan.features.map((feature) => (
                      <p key={feature} className="flex gap-2 text-[14px] leading-[1.43]" style={{ color: COLORS.body }}>
                        <CheckCircle2 className="mt-0.5 shrink-0" size={16} style={{ color: COLORS.primary }} />
                        {feature}
                      </p>
                    ))}
                  </div>
                  <Link
                    href={plan.href}
                    className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-medium transition-colors hover:bg-emerald-800"
                    style={{ background: COLORS.primary, color: "white" }}
                  >
                    {plan.cta} <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
