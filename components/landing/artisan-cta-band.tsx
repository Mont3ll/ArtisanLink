import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { COLORS } from "@/lib/design-tokens";

export function ArtisanCtaBand() {
  return (
    <section
      id="for-artisans"
      className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-12"
    >
      <div
        className="grid gap-6 rounded-[28px] border p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8"
        style={{
          borderColor: COLORS.hairlineSoft,
          background: COLORS.surfaceSoft,
        }}
      >
        <div>
          <p
            className="mb-2 text-[14px] font-medium leading-[1.29]"
            style={{ color: COLORS.primary }}
          >
            For artisans
          </p>
          <h2
            className="text-[22px] font-medium leading-[1.18] tracking-[-0.44px]"
            style={{ color: COLORS.ink }}
          >
            Are you a skilled artisan?
          </h2>
          <p
            className="mt-2 max-w-[620px] text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            Build a trusted profile, show your portfolio, receive client
            messages, and grow with verified marketplace visibility.
          </p>
        </div>
        <Link
          href="/sign-up?role=artisan"
          className="flex h-12 w-fit items-center justify-center gap-2 rounded-lg px-5 text-[16px] font-medium text-white transition-colors hover:bg-emerald-800"
          style={{ background: COLORS.primary }}
        >
          Create artisan profile
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
