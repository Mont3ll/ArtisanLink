"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { ProductTabId } from "@/components/layout/header-new";
import { COLORS } from "@/lib/design-tokens";

const tabContent: Record<ProductTabId, { eyebrow: string; heading: string }> = {
  repairs: {
    eyebrow: "Verified repair artisans across Kenya",
    heading: "Find the right craftsperson for the job.",
  },
  build: {
    eyebrow: "Trusted builders and fabricators",
    heading: "Plan, build, and finish with skilled local pros.",
  },
  design: {
    eyebrow: "Finish and style your space",
    heading: "Bring a cleaner, sharper look to your home or workspace.",
  },
};

export function HeroBand({ activeTab }: { activeTab: ProductTabId }) {
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
