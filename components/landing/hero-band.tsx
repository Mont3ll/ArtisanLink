"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { ProductTabId } from "@/components/layout/header-new";
import { COLORS } from "@/lib/design-tokens";

const tabContent: Record<
  ProductTabId,
  {
    eyebrow: string;
    heading: string;
    title: string;
    subtitle: string;
  }
> = {
  repairs: {
    eyebrow: "Verified repair artisans across Kenya",
    heading: "Find the right craftsperson for the job.",
    title: "Available repair artisans near you",
    subtitle:
      "Fast-response specialists for plumbing, electrical, cleaning, and general home fixes.",
  },
  build: {
    eyebrow: "Trusted builders and fabricators",
    heading: "Plan, build, and finish with skilled local pros.",
    title: "Build specialists for your next project",
    subtitle:
      "Carpenters, masons, and welders for installations, upgrades, and structural work.",
  },
  design: {
    eyebrow: "Finish and style your space",
    heading: "Bring a cleaner, sharper look to your home or workspace.",
    title: "Design and finishing artisans",
    subtitle:
      "Painters, carpenters, and finish-focused artisans for interiors, surfaces, and custom details.",
  },
};

export function HeroBand({ activeTab }: { activeTab: ProductTabId }) {
  const content = tabContent[activeTab];

  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-4 pt-8 md:px-10 md:pb-6 md:pt-12">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="mb-2 text-[13px] font-medium leading-[1.23]"
            style={{ color: COLORS.muted }}
          >
            {content.eyebrow}
          </p>
          <h1
            className="max-w-[720px] text-[32px] font-semibold leading-[1.1] tracking-[-0.04em] md:text-[42px]"
            style={{ color: COLORS.ink }}
          >
            {content.heading}
          </h1>
          <p
            className="mt-3 max-w-[600px] text-[16px] leading-[1.5]"
            style={{ color: COLORS.body }}
          >
            {content.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
