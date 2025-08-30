"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import RoundedButton from "../common/RoundedButton";
import Magnetic from "../common/Magnetic";
import Curve from "../common/Curve";

export default function Header() {
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<(HTMLElement | null)[]>([]);

  const navItems = [
    { title: "Features", href: "#features" },
    { title: "Pricing", href: "#pricing" },
    { title: "FAQ", href: "#faq" },
    { title: "Dashboard", href: "/dashboard" },
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
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Magnetic>
            <Link href="/" className="font-bold text-xl text-slate-900" aria-label="Home">
              ArtisanLink
            </Link>
          </Magnetic>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
            <Magnetic>
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </a>
            </Magnetic>
            <RoundedButton 
              href="/dashboard" 
              backgroundColor="#1e293b"
              className="text-slate-900 font-medium"
            >
              Dashboard
            </RoundedButton>
          </nav>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button
              aria-controls="mobile-menu"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="rounded-md p-2 hover:bg-slate-100 transition-colors relative z-50"
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
                <p>ArtisanLink</p>
                <p>Connect with skilled artisans</p>
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
