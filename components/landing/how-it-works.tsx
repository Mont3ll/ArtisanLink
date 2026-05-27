import { CheckCircle2, MessageCircle, Search } from "lucide-react";

import { COLORS } from "@/lib/design-tokens";

export function HowItWorksSection() {
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
    <section id="how-it-works" className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16">
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
