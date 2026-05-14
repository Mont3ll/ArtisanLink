"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import TesseractLogo from "@/components/common/TesseractLogo";
import { useAuth } from "@clerk/nextjs";

const navLinks = [
  { label: "Browse Artisans", href: "/artisans" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Artisans", href: "/for-artisans" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
        {/* Logo — far left */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="ChapaWorks Home"
        >
          <span className="text-emerald-700 group-hover:text-emerald-600 transition-colors">
            <TesseractLogo size={22} strokeWidth={1.75} />
          </span>
          <span className="text-xl font-serif font-bold text-emerald-800 group-hover:text-emerald-700 transition-colors">
            ChapaWorks
          </span>
        </Link>

        {/* Desktop nav — page links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(link.href)
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-stone-600 hover:text-emerald-700 hover:bg-stone-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="bg-emerald-700 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-emerald-700 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 rounded-md text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 shadow-lg">
          <div className="max-w-6xl mx-auto py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-stone-700 hover:text-emerald-700 hover:bg-stone-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2 mt-2">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-emerald-700 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center border border-stone-300 text-stone-700 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-stone-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center bg-emerald-700 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
