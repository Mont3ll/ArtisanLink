"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import TesseractLogo from "../common/TesseractLogo";
import RoundedButton from "../common/RoundedButton";
import Magnetic from "../common/Magnetic";
import Curve from "../common/Curve";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<(HTMLElement | null)[]>([]);

  const navItems = [
    { title: "Browse Artisans", href: "/artisans" },
    { title: "How It Works", href: "/#how-it-works" },
    { title: "Pricing", href: "/pricing" },
    { title: "For Artisans", href: "/sign-up?role=artisan" },
    ...(isSignedIn ? [{ title: "Dashboard", href: "/dashboard" }] : [
      { title: "Sign In", href: "/sign-in" },
      { title: "Get Started", href: "/sign-up" },
    ]),
  ];

  useEffect(() => {
    if (!mobileMenuRef.current) return;

    const tl = gsap.timeline({ paused: true });

    if (open) {
      // Opening animation
      tl.set(mobileMenuRef.current, { display: "block" })
        .from(mobileMenuRef.current, {
          y: "-100%",
          duration: 0.8,
          ease: "power3.inOut"
        })
        .from(navItemsRef.current, {
          y: -80,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.05
        }, 0.2);
      
      tl.play();
    } else {
      // Closing animation
      tl.to(navItemsRef.current, {
          y: -80,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
          stagger: 0.02
        })
        .to(mobileMenuRef.current, {
          y: "-100%",
          duration: 0.8,
          ease: "power3.inOut"
        }, 0.1)
        .set(mobileMenuRef.current, { display: "none" });
      
      tl.play();
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  return (
    <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo — far left with tesseract */}
          <Magnetic>
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Home">
              <span className="text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 transition-colors">
                <TesseractLogo size={20} strokeWidth={1.75} />
              </span>
              <span className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                ChapaWorks
              </span>
            </Link>
          </Magnetic>

          {/* Centered Navigation — page links */}
          <nav aria-label="Primary" className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center gap-1">
              <Magnetic>
                <div className="nav-element relative flex flex-col items-center py-3 px-3 cursor-pointer group">
                  <Link href="/artisans" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    Browse Artisans
                  </Link>
                  <div className="nav-indicator absolute w-1 h-1 bg-slate-900 dark:bg-slate-100 rounded-full bottom-0 transform scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></div>
                </div>
              </Magnetic>
              <Magnetic>
                <div className="nav-element relative flex flex-col items-center py-3 px-3 cursor-pointer group">
                  <Link href="/#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    How It Works
                  </Link>
                  <div className="nav-indicator absolute w-1 h-1 bg-slate-900 dark:bg-slate-100 rounded-full bottom-0 transform scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></div>
                </div>
              </Magnetic>
              <Magnetic>
                <div className="nav-element relative flex flex-col items-center py-3 px-3 cursor-pointer group">
                  <Link href="/pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    Pricing
                  </Link>
                  <div className="nav-indicator absolute w-1 h-1 bg-slate-900 dark:bg-slate-100 rounded-full bottom-0 transform scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></div>
                </div>
              </Magnetic>
              <Magnetic>
                <div className="nav-element relative flex flex-col items-center py-3 px-3 cursor-pointer group">
                  <Link href="/sign-up?role=artisan" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    For Artisans
                  </Link>
                  <div className="nav-indicator absolute w-1 h-1 bg-slate-900 dark:bg-slate-100 rounded-full bottom-0 transform scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></div>
                </div>
              </Magnetic>
            </div>
          </nav>

          {/* Right Side Authentication */}
          <div className="hidden md:flex items-center gap-4">
            {!isSignedIn && (
              <Magnetic>
                <Link 
                  href="/sign-in" 
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
              </Magnetic>
            )}
            <RoundedButton 
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              backgroundColor="#1e293b"
              className="text-slate-900 dark:text-slate-100 font-medium"
            >
              {isSignedIn ? "Dashboard" : "Get Started"}
            </RoundedButton>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button
              aria-controls="mobile-menu"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative z-50"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 bg-slate-900 text-white z-40 md:hidden"
          id="mobile-menu"
          style={{ display: "none" }}
        >
          <div className="relative h-full flex flex-col justify-center items-start p-8">
            <div className="space-y-8">
              <div className="mb-12">
                <p className="text-slate-400 text-sm uppercase tracking-wide">
                  Navigation
                </p>
              </div>
              
              {navItems.map((item, index) => (
                <div key={item.title}>
                  <Link
                    ref={(el) => { navItemsRef.current[index] = el; }}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block text-4xl font-light hover:text-amber-400 transition-colors duration-300"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-8 left-8">
              <div
                ref={(el) => { navItemsRef.current[navItems.length] = el; }}
                className="text-slate-400 text-sm"
              >
                <p>ChapaWorks</p>
                <p>Kenya&apos;s trusted artisan marketplace</p>
              </div>
            </div>
            
            {/* Curve Component */}
            <Curve isOpen={open} />
          </div>
        </div>
      </div>
    </header>
  );
}
