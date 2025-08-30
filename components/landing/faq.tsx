"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Shield } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFadeInAnimation, useStaggeredReveal } from "../../lib/animations";

const faqs = [
  {
    q: "How do artisans get verified?",
    a: "Artisans submit a Certificate of Code of Conduct which admins review before granting a verified badge. This ensures all professionals meet our quality and trust standards.",
    category: "verification"
  },
  {
    q: "What payment methods are supported?",
    a: "We integrate with M-Pesa for subscription payments and local transactions. This provides secure, convenient payment options for both clients and artisans.",
    category: "payment"
  },
  {
    q: "Can I message artisans before hiring?",
    a: "Yes — you can contact artisans directly through the platform to discuss scope and pricing. This ensures clear communication before any work begins.",
    category: "communication"
  },
  {
    q: "How much does it cost for artisans to join?",
    a: "Artisans pay a monthly subscription fee of 499 KES via M-Pesa to maintain their profile visibility and access premium features on the platform.",
    category: "pricing"
  },
  {
    q: "Is there customer support available?",
    a: "Yes, we provide 24/7 support for both clients and artisans through our messaging system, help center, and dedicated support team.",
    category: "support"
  },
  {
    q: "How do I find artisans near me?",
    a: "Use our interactive map search with location filters to find verified artisans in your area. You can filter by trade, availability, and distance.",
    category: "search"
  }
];

interface FaqItemProps {
  faq: { q: string; a: string; category: string };
}

function FaqItem({ faq }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current || !iconRef.current) return;

    if (isOpen) {
      // Expand animation
      gsap.to(contentRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.to(iconRef.current, {
        rotation: 180,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      // Collapse animation
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      });
      gsap.to(iconRef.current, {
        rotation: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  return (
    <div className="faq-item rounded-xl glass-card-light hover:glow-primary transition-all duration-500 overflow-hidden group relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/50 transition-all duration-300 rounded-xl relative z-10"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-900 text-lg group-hover:text-gradient-primary transition-all pr-4">
          {faq.q}
        </span>
        <div ref={iconRef} className="flex-shrink-0 ml-4">
          <ChevronDown className="h-5 w-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
        </div>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden relative z-10"
        style={{ height: 0, opacity: 0 }}
      >
        <div className="px-6 pb-5 text-slate-600 leading-relaxed">
          {faq.a}
        </div>
      </div>
      
      {/* Enhanced shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 shimmer" />
    </div>
  );
}

export default function Faq() {
  useFadeInAnimation(".faq-header");
  useStaggeredReveal(".faq-item");

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
  }, []);

  return (
    <div className="space-y-12">
      <div className="faq-header text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass-card-light rounded-full text-sm font-medium text-slate-600 mb-6">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          FAQ
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Frequently Asked <span className="text-gradient-primary">Questions</span>
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Get answers to common questions about our platform and how it works for both clients and artisans.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq) => (
          <FaqItem key={faq.q} faq={faq} />
        ))}
      </div>

      {/* Contact Support Section */}
      <div className="text-center pt-12 border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-slate-600 mb-6">
            Our support team is here to help you get the most out of ArtisanLink.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <a 
              href="/support" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-cta text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 glow-primary"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </a>
            <a 
              href="/help" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-slate-700 hover:text-slate-900 transition-colors rounded-full glass-card-light hover:glow-primary"
            >
              <Shield className="w-4 h-4" />
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
