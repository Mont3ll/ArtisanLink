import Link from "next/link";
import { MapPin } from "lucide-react";

import { COLORS } from "@/lib/design-tokens";

const cityLinks: Array<[string, string]> = [
  ["Nairobi", "Home repair specialists"],
  ["Kiambu", "Carpenters and masons"],
  ["Mombasa", "Cleaning and maintenance"],
  ["Machakos", "Plumbers and electricians"],
  ["Kajiado", "Welders and fabricators"],
  ["Nakuru", "Painters and finishers"],
];

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: COLORS.hairlineSoft,
        background: COLORS.surfaceSoft,
      }}
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <p
              className="mb-1 text-[14px] font-semibold"
              style={{ color: COLORS.ink }}
            >
              ChapaWorks
            </p>
            <p
              className="text-[13px] leading-[1.5]"
              style={{ color: COLORS.muted }}
            >
              The marketplace connecting clients with verified artisans across
              Kenya.
            </p>
          </div>
          <div>
            <p
              className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: COLORS.mutedSoft }}
            >
              Explore
            </p>
            <div className="flex flex-col gap-2">
              {[
                ["Browse artisans", "/artisans"],
                ["For artisans", "/for-artisans"],
                ["How it works", "/artisans#how-it-works"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[13px] leading-[1.43] transition-colors hover:underline"
                  style={{ color: COLORS.body }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p
              className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: COLORS.mutedSoft }}
            >
              Cities
            </p>
            <div className="flex flex-col gap-2">
              {cityLinks.map(([city]) => (
                <Link
                  key={city}
                  href={`/artisans?county=${city}`}
                  className="flex items-center gap-1.5 text-[13px] leading-[1.43] transition-colors hover:underline"
                  style={{ color: COLORS.body }}
                >
                  <MapPin size={12} style={{ color: COLORS.muted }} />
                  {city}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p
              className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: COLORS.mutedSoft }}
            >
              Account
            </p>
            <div className="flex flex-col gap-2">
              {[
                ["Sign in", "/sign-in"],
                ["Create account", "/sign-up"],
                ["Artisan profile", "/sign-up?role=artisan"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[13px] leading-[1.43] transition-colors hover:underline"
                  style={{ color: COLORS.body }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row"
          style={{ borderColor: COLORS.hairlineSoft }}
        >
          <p className="text-[13px]" style={{ color: COLORS.mutedSoft }}>
            © {new Date().getFullYear()} ChapaWorks. All rights reserved.
          </p>
          <p className="text-[13px]" style={{ color: COLORS.mutedSoft }}>
            Built for Kenya&apos;s skilled artisan community.
          </p>
        </div>
      </div>
    </footer>
  );
}
