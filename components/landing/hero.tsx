"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, MapPin } from "lucide-react";
import RoundedButton from "../common/RoundedButton";
import Magnetic from "../common/Magnetic";

export default function Hero() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!root.current) return;
    const ctx = gsap.context(() => {
      // Hero slide up animation with delay matching preloader exit
      gsap.fromTo(".hero-main", 
        { y: 300 },
        { 
          y: 0, 
          duration: 0.6, 
          ease: "power3.out", 
          delay: 2.5 // Matches awwwards timing
        }
      );
      
      // Individual element animations after slide up
      gsap.from(".hero-animate", { 
        y: 16, 
        opacity: 0, 
        stagger: 0.12, 
        duration: 0.6, 
        ease: "power3.out",
        delay: 2.8
      });

      // Floating animation for the visual
      gsap.to(".hero-visual", {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3.5
      });

      // Parallax effect on scroll
      gsap.to(".hero-bg-orb", {
        y: -50,
        duration: 2,
        scrollTrigger: {
          trigger: ".hero-main",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="pt-16 sm:pt-24 hero-main relative pb-20 lg:pb-32" aria-labelledby="hero-title">
      {/* Background Elements */}
      <div className="hero-bg-orb absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl" />
      <div className="hero-bg-orb absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-xl" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="hero-content">
          <h1 id="hero-title" className="hero-animate text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900">
            Connect with{" "}
            <span className="text-gradient-primary">verified</span>{" "}
            local artisans in Kenya
          </h1>
          <p className="hero-animate mt-6 text-lg text-slate-600 leading-relaxed">
            ArtisanLink helps clients discover skilled local professionals, view portfolios, and hire with confidence powered by map search and M-Pesa subscriptions.
          </p>

          <div className="hero-animate mt-8 flex gap-4 items-center">
            <Magnetic>
              <RoundedButton 
                href="#pricing" 
                backgroundColor="#1e293b"
                className="text-slate-900 font-semibold hover:scale-105 transition-all duration-300 glow-primary"
              >
                Get started
              </RoundedButton>
            </Magnetic>
            <Magnetic>
              <a 
                href="#features" 
                className="inline-flex items-center px-6 py-3 text-sm text-slate-600 hover:text-slate-900 transition-all duration-300 rounded-full glass-card-light hover:glow-primary"
              >
                Learn more →
              </a>
            </Magnetic>
          </div>

          {/* Stats */}
          <div className="hero-animate mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">2K+</div>
              <div className="text-sm text-slate-600">Verified Artisans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">15K+</div>
              <div className="text-sm text-slate-600">Projects Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">98%</div>
              <div className="text-sm text-slate-600">Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="relative order-first lg:order-last hero-animate hero-visual" aria-hidden="true">
          <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-8 hover:scale-105 transition-all duration-500 glass-card-light hover:glow-amber">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Image 
                src="/file.svg" 
                alt="Artisans gallery showcase" 
                width={640} 
                height={420} 
                priority 
                className="w-full h-auto"
              />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 floating-card bg-white rounded-lg shadow-lg p-4 glass-light z-10 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Verified</div>
                  <div className="text-xs text-slate-600">Trust guaranteed</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 floating-card bg-white rounded-lg shadow-lg p-4 glass-light z-10 animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Nearby</div>
                  <div className="text-xs text-slate-600">2.5 km away</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-3xl blur-xl transform scale-110" />
        </div>
      </div>
    </section>
  );
}
