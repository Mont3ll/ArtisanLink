import Link from "next/link";
import Image from "next/image";

import { COLORS } from "@/lib/design-tokens";

const footerGroups = [
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "Dispute support", href: "/client-dashboard/messages" },
      { label: "Contact", href: "/sign-in" },
    ],
  },
  {
    heading: "For artisans",
    links: [
      { label: "Create profile", href: "/sign-up?role=artisan" },
      { label: "Verification", href: "/artisan-dashboard/settings" },
      { label: "Subscriptions", href: "/artisan-dashboard/subscription" },
      { label: "Portfolio tips", href: "/artisan-dashboard/portfolio" },
    ],
  },
  {
    heading: "ChapaWorks",
    links: [
      { label: "Browse artisans", href: "/artisans" },
      { label: "For artisans", href: "/for-artisans" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/for-artisans" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      id="support-footer"
      className="border-t px-5 py-12 md:px-10"
      style={{ borderColor: COLORS.hairlineSoft, background: COLORS.surfaceSoft }}
    >
      <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
            style={{ color: COLORS.primary }}
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-xl border"
              style={{ borderColor: "#d1fae5", background: "#ecfdf5" }}
            >
              <Image
                src="/logo.svg"
                alt="ChapaWorks"
                width={24}
                height={24}
                className="h-6 w-6 object-contain opacity-90"
              />
            </span>
            <span className="hidden text-[22px] font-bold leading-none sm:block">
              ChapaWorks
            </span>
          </Link>
          <p
            className="mt-3 max-w-[300px] text-[14px] leading-[1.43]"
            style={{ color: COLORS.muted }}
          >
            A trusted marketplace for hiring skilled Kenyan artisans with
            confidence.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.heading}>
            <h3
              className="text-[16px] font-medium"
              style={{ color: COLORS.ink }}
            >
              {group.heading}
            </h3>
            <div
              className="mt-3 grid gap-2 text-[14px]"
              style={{ color: COLORS.body }}
            >
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="w-fit cursor-pointer text-left transition-colors hover:text-[#222222] hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mx-auto mt-10 flex max-w-[1280px] flex-col gap-2 border-t pt-5 text-[13px] leading-[1.23] md:flex-row md:items-center md:justify-between"
        style={{ borderColor: COLORS.hairlineSoft, color: COLORS.muted }}
      >
        <p>© {new Date().getFullYear()} ChapaWorks. All rights reserved.</p>
        <p>
          Cash-only job payments during testing · Subscription payments remain
          active
        </p>
      </div>
    </footer>
  );
}
