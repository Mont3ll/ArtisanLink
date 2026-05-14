"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  TrendingUp,
  Award,
  Users,
  Clock,
  Shield,
  Star,
  ChevronDown,
  ArrowRight,
  Check,
  X,
  MessageCircle,
  Building2,
  Home as HomeIcon,
  Wrench,
  Sparkles,
  Search,
  MapPin,
  BadgeCheck,
  Eye,
  Heart,
  Filter,
  ChevronRight,
} from "lucide-react";
import PublicNav from "@/components/layout/public-nav";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Types for live artisan data from the API
interface LiveArtisan {
  id: string;
  name: string;
  profession: string | null;
  bio: string | null;
  profileImage: string | null;
  location: { city: string | null; county: string | null };
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string }>;
  distance?: number | null;
}

// Landing Page: Editorial Data-Driven with Correct Workflow + GSAP Animations + Lenis
// Browse artisans → View portfolio → Start conversation → Request job
// Design: Cream/warm whites with forest green accents, serif headings, editorial feel

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [liveArtisans, setLiveArtisans] = useState<LiveArtisan[]>([]);
  const [artisansLoading, setArtisansLoading] = useState(true);

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const artisansRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const faqContentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch live artisans from the API
  useEffect(() => {
    fetch("/api/search/artisans?limit=3&sortBy=rating")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setLiveArtisans(data.artisans?.slice(0, 3) || []);
      })
      .catch(() => setLiveArtisans([]))
      .finally(() => setArtisansLoading(false));
  }, []);

  // Lenis smooth scroll + GSAP animations
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (href && href !== "#") {
          const target = document.querySelector(href);
          if (target) {
            lenis.scrollTo(target as HTMLElement, { offset: -80 });
          }
        }
      });
    });

    // ============ HERO ANIMATIONS ============
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .fromTo(
        ".hero-badge",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
      )
      .fromTo(
        ".hero-title-line",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
        "-=0.4",
      )
      .fromTo(
        ".hero-description",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6",
      )
      .fromTo(
        ".hero-search",
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 },
        "-=0.4",
      )
      .fromTo(
        ".hero-trust-badge",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        "-=0.3",
      );

    // ============ STATS COUNTER ANIMATIONS ============
    const statItems = gsap.utils.toArray(".stat-item") as HTMLElement[];
    statItems.forEach((item) => {
      const valueEl = item.querySelector(".stat-value");
      const iconEl = item.querySelector(".stat-icon");
      const labelEl = item.querySelector(".stat-label");

      gsap.fromTo(
        iconEl,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        valueEl,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        labelEl,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.2,
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // ============ HOW IT WORKS ANIMATIONS ============
    const howItWorksCards = gsap.utils.toArray(".how-card") as HTMLElement[];
    howItWorksCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Animate the step number
      const stepNum = card.querySelector(".step-number");
      gsap.fromTo(
        stepNum,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: i * 0.15 + 0.3,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // Connecting lines animation
    const connectingLines = gsap.utils.toArray(
      ".connecting-line",
    ) as HTMLElement[];
    connectingLines.forEach((line, i) => {
      gsap.fromTo(
        line,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.6,
          delay: i * 0.15 + 0.4,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // ============ CATEGORY TABS ANIMATION ============
    const categoryTabs = gsap.utils.toArray(".category-tab") as HTMLElement[];
    gsap.fromTo(
      categoryTabs,
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: artisansRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      },
    );

    // ============ ARTISAN CARDS STAGGERED ANIMATION ============
    const artisanCards = gsap.utils.toArray(".artisan-card") as HTMLElement[];
    artisanCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: i * 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: artisansRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // ============ TESTIMONIAL PARALLAX & FADE ============
    gsap.fromTo(
      ".testimonial-quote",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: testimonialRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      },
    );

    gsap.fromTo(
      ".testimonial-author",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: testimonialRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      },
    );

    // ============ CASE STUDIES ANIMATION ============
    const caseCards = gsap.utils.toArray(".case-card") as HTMLElement[];
    caseCards.forEach((card, i) => {
      const image = card.querySelector(".case-image");
      const content = card.querySelector(".case-content");

      gsap.fromTo(
        image,
        { scale: 1.2, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        content,
        { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // ============ COMPARISON TABLE ROW-BY-ROW REVEAL ============
    const comparisonRows = gsap.utils.toArray(
      ".comparison-row",
    ) as HTMLElement[];
    comparisonRows.forEach((row, i) => {
      gsap.fromTo(
        row,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: comparisonRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // ============ PRICING CARDS ANIMATION ============
    const pricingCards = gsap.utils.toArray(".pricing-card") as HTMLElement[];
    pricingCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0, rotateY: i === 0 ? -10 : 10 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pricingRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // ============ FAQ ITEMS ANIMATION ============
    const faqItems = gsap.utils.toArray(".faq-item") as HTMLElement[];
    faqItems.forEach((item, i) => {
      gsap.fromTo(
        item,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: faqRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // ============ FINAL CTA ANIMATION ============
    gsap.fromTo(
      ".cta-content",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );

    gsap.fromTo(
      ".cta-buttons",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );

    // ============ MAGNETIC BUTTON EFFECT ============
    const magneticButtons = document.querySelectorAll(".magnetic-btn");
    magneticButtons.forEach((btn) => {
      const button = btn as HTMLElement;

      button.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        });
      });
    });

    // Cleanup
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  // FAQ toggle animation
  const toggleFaq = (index: number) => {
    const contentEl = faqContentRefs.current[index];

    if (openFaq === index) {
      // Close
      if (contentEl) {
        gsap.to(contentEl, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => setOpenFaq(null),
        });
      } else {
        setOpenFaq(null);
      }
    } else {
      // Close previous
      if (openFaq !== null && faqContentRefs.current[openFaq]) {
        gsap.to(faqContentRefs.current[openFaq], {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }

      setOpenFaq(index);

      // Open new - need to wait for state update
      setTimeout(() => {
        if (contentEl) {
          gsap.fromTo(
            contentEl,
            { height: 0, opacity: 0 },
            { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" },
          );
        }
      }, 10);
    }
  };

  const impactStats = [
    {
      value: "KES 2.3B",
      label: "Paid to artisans",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      value: "127,000",
      label: "Projects completed",
      icon: <Award className="w-5 h-5" />,
    },
    {
      value: "15,847",
      label: "Verified artisans",
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: "< 2 hrs",
      label: "Avg. response time",
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  const categories = [
    { id: "all", name: "All Artisans", count: 15847 },
    { id: "carpentry", name: "Carpentry", count: 3420 },
    { id: "electrical", name: "Electrical", count: 2890 },
    { id: "plumbing", name: "Plumbing", count: 2150 },
    { id: "painting", name: "Painting", count: 1980 },
    { id: "tailoring", name: "Tailoring", count: 1650 },
    { id: "masonry", name: "Masonry", count: 1420 },
    { id: "welding", name: "Welding", count: 1180 },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Browse & Discover",
      description:
        "Search our catalog of verified artisans by category, location, ratings, and availability. Filter to find the perfect match for your project.",
      icon: <Search className="w-6 h-6" />,
    },
    {
      step: "02",
      title: "View Portfolios",
      description:
        "Explore each artisan's work history, photos of completed projects, client reviews, and certifications. Make an informed decision.",
      icon: <Eye className="w-6 h-6" />,
    },
    {
      step: "03",
      title: "Start a Conversation",
      description:
        "Message artisans directly to discuss your project, ask questions, and get a sense of their communication style and availability.",
      icon: <MessageCircle className="w-6 h-6" />,
    },
    {
      step: "04",
      title: "Request & Hire",
      description:
        "Send a job request through chat. The artisan sends a detailed quote—accept it, pay a deposit via M-Pesa, and work begins with funds held in escrow.",
      icon: <BadgeCheck className="w-6 h-6" />,
    },
  ];

  const caseStudies = [
    {
      type: "Residential",
      icon: <HomeIcon className="w-6 h-6" />,
      title: "Custom Kitchen Renovation in Karen",
      client: "The Kellerman Family",
      artisan: "John Kamau, Master Carpenter",
      duration: "3 weeks",
      result:
        "Found John by browsing carpenters in Karen. After viewing his portfolio and chatting about the project, hired him for custom cabinets and countertops.",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    },
    {
      type: "Commercial",
      icon: <Building2 className="w-6 h-6" />,
      title: "Office Electrical Upgrade in Westlands",
      client: "TechHub Kenya",
      artisan: "Peter Ochieng, Licensed Electrician",
      duration: "1 week",
      result:
        "Searched for licensed electricians with commercial experience. Peter's reviews and portfolio stood out. Quick chat, clear quote, excellent work.",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    },
  ];

  const comparisonFeatures = [
    { feature: "Browse verified artisan profiles", us: true, others: false },
    { feature: "View detailed portfolios & reviews", us: true, others: false },
    { feature: "Direct messaging with artisans", us: true, others: false },
    { feature: "Secure M-Pesa escrow payments", us: true, others: false },
    { feature: "Project milestone tracking", us: true, others: false },
    { feature: "Quality satisfaction guarantee", us: true, others: false },
    { feature: "Background-checked professionals", us: true, others: false },
    { feature: "Filter by location & availability", us: true, others: true },
  ];

  const faqs = [
    {
      q: "How do I find the right artisan for my project?",
      a: "Use our search filters to browse by category (carpenter, electrician, etc.), location, ratings, and availability. View each artisan's portfolio, read reviews from past clients, and check their completed projects before reaching out.",
    },
    {
      q: "Can I message artisans before hiring?",
      a: "Absolutely! We encourage you to start a conversation first. Discuss your project details, ask about their experience, request quotes, and get a feel for their communication style before committing.",
    },
    {
      q: "How does the job request process work?",
      a: "Once you've found an artisan you like, send them a job request through the chat. Describe your project, timeline, and budget. The artisan will review and send a formal quote. Once you accept, the job begins.",
    },
    {
      q: "How are payments handled?",
      a: "Payments are made via M-Pesa and held in escrow. You can pay the full amount upfront or in milestones. Funds are only released to the artisan when you confirm each milestone or the final work is satisfactory.",
    },
    {
      q: "What if I'm not satisfied with the work?",
      a: "Our satisfaction guarantee protects you. If work doesn't meet agreed standards, we'll mediate with the artisan to get it corrected at no extra cost, or issue a refund from the escrow.",
    },
  ];

  const testimonialHighlight = {
    quote:
      "I needed a plumber urgently. Browsed ChapaWorks, found James with great reviews in my area, messaged him, and he was at my door in 2 hours. The whole experience was seamless.",
    author: "David Kimani",
    role: "Homeowner",
    location: "Lavington, Nairobi",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
  };

  return (
    <div
      ref={containerRef}
      className="bg-stone-50 text-stone-900 min-h-screen font-sans overflow-x-hidden"
    >
      {/* Navigation */}
      <PublicNav />

      {/* Hero - Editorial Style with Search Focus */}
      <section
        ref={heroRef}
        className="py-16 md:py-24 px-6 border-b border-stone-200"
      >
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="hero-badge text-emerald-700 font-medium mb-4 tracking-wide text-sm uppercase">
              Kenya&apos;s Trusted Artisan Marketplace
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6 text-stone-800">
              <span className="hero-title-line block">
                Find skilled artisans.
              </span>
              <span className="hero-title-line block text-emerald-700">
                Hire with confidence.
              </span>
            </h1>
            <p className="hero-description text-lg text-stone-600 mb-10 leading-relaxed max-w-2xl">
              Browse thousands of verified carpenters, electricians, plumbers,
              and more. View their portfolios, read real reviews, and connect
              directly before you hire.
            </p>

            {/* Search Bar */}
            <div className="hero-search bg-white rounded-xl shadow-lg border border-stone-200 p-2 flex flex-col sm:flex-row gap-2 mb-8">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Search className="w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full outline-none text-stone-800 placeholder:text-stone-400"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-t sm:border-t-0 sm:border-l border-stone-200">
                <MapPin className="w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full sm:w-32 outline-none text-stone-800 placeholder:text-stone-400"
                />
              </div>
              <button className="magnetic-btn bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-stone-500">
              <div className="hero-trust-badge flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>All artisans verified</span>
              </div>
              <div className="hero-trust-badge flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-600" />
                <span>4.9/5 average rating</span>
              </div>
              <div className="hero-trust-badge flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Direct messaging</span>
              </div>
              <div className="hero-trust-badge flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>Satisfaction guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section ref={statsRef} className="py-12 px-6 bg-emerald-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, i) => (
              <div key={i} className="stat-item text-center">
                <div className="stat-icon inline-flex items-center justify-center w-12 h-12 bg-emerald-700 rounded-full mb-3">
                  {stat.icon}
                </div>
                <div className="stat-value text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="stat-label text-emerald-200 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - The Real Workflow */}
      <section ref={howItWorksRef} id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
              Your journey to quality craftsmanship
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Finding and hiring the right artisan is simple. Browse, connect,
              and hire—all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="how-card relative">
                {i < howItWorks.length - 1 && (
                  <div className="connecting-line hidden lg:block absolute top-12 left-full w-full h-0.5 bg-stone-200 -translate-x-1/2 z-0">
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  </div>
                )}
                <div className="relative bg-white rounded-xl border border-stone-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="step-number text-5xl font-serif font-bold text-stone-100 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Artisans Preview */}
      <section
        ref={artisansRef}
        id="artisans"
        className="py-24 px-6 bg-stone-100"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">
                Browse Artisans
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
                Discover skilled professionals
              </h2>
            </div>
            <Link
              href="/artisans"
              className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800 transition-colors"
            >
              View all artisans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-tab px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-emerald-700 text-white scale-105"
                    : "bg-white text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat.name}
                <span
                  className={`ml-2 ${activeCategory === cat.id ? "text-emerald-200" : "text-stone-400"}`}
                >
                  {cat.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* Artisan Cards — Live from API */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisansLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="artisan-card bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-stone-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-stone-200 rounded w-3/4" />
                          <div className="h-3 bg-stone-200 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-3 bg-stone-200 rounded w-full mb-2" />
                      <div className="h-3 bg-stone-200 rounded w-2/3" />
                    </div>
                  </div>
                ))
              : liveArtisans.length > 0
              ? liveArtisans.map((artisan, i) => {
                  const initials = artisan.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  const locationStr = [artisan.location.city, artisan.location.county].filter(Boolean).join(", ") || "Kenya";
                  return (
                    <Link
                      key={artisan.id || i}
                      href={`/artisans/${artisan.id}`}
                      className="artisan-card bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 group block"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative flex-shrink-0">
                            {artisan.profileImage ? (
                              <img
                                src={artisan.profileImage}
                                alt={artisan.name}
                                className="w-16 h-16 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-emerald-700 font-bold text-lg">{initials}</span>
                              </div>
                            )}
                            {artisan.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <BadgeCheck className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors truncate">{artisan.name}</h3>
                            <p className="text-emerald-700 text-sm font-medium truncate">{artisan.profession}</p>
                            <div className="flex items-center gap-1 text-sm text-stone-500 mt-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{locationStr}</span>
                            </div>
                          </div>
                          {artisan.isPremium && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">⭐</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-medium">{artisan.rating.average.toFixed(1)}</span>
                            <span className="text-stone-400">({artisan.rating.total})</span>
                          </div>
                          {artisan.specializations.length > 0 && (
                            <>
                              <span className="text-stone-300">|</span>
                              <span className="text-stone-500 truncate">{artisan.specializations[0]?.name}</span>
                            </>
                          )}
                        </div>

                        {artisan.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {artisan.specializations.slice(0, 3).map((s, j) => (
                              <span key={j} className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs">{s.name}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                          <div>
                            {artisan.hourlyRate ? (
                              <>
                                <span className="text-lg font-bold text-stone-900">KES {artisan.hourlyRate.toLocaleString()}</span>
                                <span className="text-stone-500 text-sm">/hour</span>
                              </>
                            ) : (
                              <span className="text-stone-400 text-sm">Rate on request</span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            artisan.isAvailable ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                          }`}>
                            {artisan.isAvailable ? "Available" : "Busy"}
                          </span>
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex gap-3">
                        <span className="flex-1 py-2.5 border border-stone-300 rounded-lg text-sm font-medium group-hover:border-emerald-600 group-hover:text-emerald-700 transition-colors flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Profile
                        </span>
                        <span className="magnetic-btn flex-1 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </span>
                      </div>
                    </Link>
                  );
                })
              : (
                  // Fallback if no artisans loaded yet (empty DB / network error)
                  <div className="col-span-3 text-center py-12 text-stone-500">
                    <BadgeCheck className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                    <p>Artisans will appear here once they join the platform.</p>
                    <Link href="/sign-up?role=artisan" className="text-emerald-700 font-medium hover:underline mt-2 inline-block">Be the first artisan →</Link>
                  </div>
                )}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/artisans"
              className="magnetic-btn inline-flex items-center gap-2 bg-white border border-stone-300 px-8 py-3 rounded-lg font-medium hover:bg-stone-100 hover:border-emerald-600 transition-all"
            >
              Browse all artisans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Highlight */}
      <section
        ref={testimonialRef}
        className="py-20 px-6 bg-emerald-800 text-white overflow-hidden"
      >
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="testimonial-quote text-2xl md:text-3xl font-serif italic leading-relaxed mb-8">
            &quot;{testimonialHighlight.quote}&quot;
          </blockquote>
          <div className="testimonial-author flex items-center justify-center gap-4">
            <img
              src={testimonialHighlight.image}
              alt={testimonialHighlight.author}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600"
            />
            <div className="text-left">
              <div className="font-semibold">{testimonialHighlight.author}</div>
              <div className="text-emerald-300 text-sm">
                {testimonialHighlight.role}, {testimonialHighlight.location}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section ref={storiesRef} id="stories" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">
              Success Stories
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              Real clients, real results
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((study, i) => (
              <div
                key={i}
                className="case-card bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden"
              >
                <div className="case-image aspect-video overflow-hidden">
                  <img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="case-content p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                      {study.icon}
                      {study.type}
                    </span>
                    <span className="text-stone-400 text-sm">
                      {study.duration}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2">
                    {study.title}
                  </h3>
                  <p className="text-stone-600 mb-4">{study.result}</p>
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-sm">
                    <span className="text-stone-500">{study.client}</span>
                    <span className="text-emerald-700 font-medium">
                      {study.artisan}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section ref={comparisonRef} className="py-24 px-6 bg-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">
              Why Choose Us
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
              The ChapaWorks advantage
            </h2>
            <p className="text-stone-600">
              See how we compare to finding artisans the old way
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="comparison-row grid grid-cols-3 bg-stone-50 border-b border-stone-200">
              <div className="p-4 font-medium">Feature</div>
              <div className="p-4 font-medium text-center bg-emerald-50 text-emerald-800">
                ChapaWorks
              </div>
              <div className="p-4 font-medium text-center text-stone-500">
                Word of Mouth
              </div>
            </div>
            {comparisonFeatures.map((item, i) => (
              <div
                key={i}
                className={`comparison-row grid grid-cols-3 ${i !== comparisonFeatures.length - 1 ? "border-b border-stone-100" : ""}`}
              >
                <div className="p-4 text-stone-600 text-sm">{item.feature}</div>
                <div className="p-4 flex justify-center bg-emerald-50/50">
                  {item.us ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <X className="w-5 h-5 text-stone-300" />
                  )}
                </div>
                <div className="p-4 flex justify-center">
                  {item.others ? (
                    <Check className="w-5 h-5 text-stone-400" />
                  ) : (
                    <X className="w-5 h-5 text-stone-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">
              Simple Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
              Free for clients. Fair for artisans.
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Browse, message, and hire artisans at no cost. Artisans pay a
              small commission only when they complete paid work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Client — Free */}
            <div className="pricing-card bg-white rounded-xl shadow-sm border border-stone-200 p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">
                <HomeIcon className="w-4 h-4" />
                For Clients
              </div>
              <div className="text-4xl font-bold mb-1">Free</div>
              <p className="text-stone-500 mb-6 text-sm">No fees, no hidden costs</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Browse unlimited artisan profiles",
                  "View portfolios & reviews",
                  "Message artisans directly",
                  "Request jobs through chat",
                  "Satisfaction guarantee",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="magnetic-btn block w-full bg-emerald-700 text-white text-center py-3 rounded-lg font-medium hover:bg-emerald-800 transition-colors text-sm"
              >
                Start Browsing Free
              </Link>
            </div>

            {/* Artisan — Monthly */}
            <div className="pricing-card bg-white rounded-xl shadow-sm border border-stone-200 p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">
                <Sparkles className="w-4 h-4" />
                Monthly
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold">KES 150</span>
                <span className="text-stone-500 text-sm ml-1">/month</span>
              </div>
              <p className="text-stone-500 mb-6 text-sm">Artisan subscription</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Professional profile & portfolio",
                  "Priority listing in search",
                  "Receive messages from clients",
                  "Manage job requests easily",
                  "Premium badge",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=artisan"
                className="magnetic-btn block w-full border border-emerald-700 text-emerald-700 text-center py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-sm"
              >
                Join as Artisan
              </Link>
            </div>

            {/* Artisan — Annual */}
            <div className="pricing-card relative bg-emerald-800 text-white rounded-xl shadow-sm border border-emerald-700 p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-700 text-emerald-200 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">
                <Sparkles className="w-4 h-4" />
                Annual
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold">KES 1,500</span>
                <span className="text-emerald-300 text-sm ml-1">/year</span>
              </div>
              <p className="text-emerald-300 mb-6 text-sm">Save KES 300 vs monthly</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "All Monthly features",
                  "Featured on homepage",
                  "Analytics dashboard",
                  "Priority support",
                  "Verified artisan badge",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span className="text-emerald-100">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=artisan"
                className="magnetic-btn block w-full bg-amber-400 text-amber-900 text-center py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors text-sm"
              >
                Get Annual Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} id="faq" className="py-24 px-6 bg-stone-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              Common questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-50 transition-colors"
                >
                  <span className="font-medium pr-8">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 transition-transform duration-300 flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  ref={(el) => {
                    faqContentRefs.current[i] = el;
                  }}
                  className="overflow-hidden"
                  style={{
                    height: openFaq === i ? "auto" : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <div className="px-6 pb-6 text-stone-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={ctaRef} className="py-24 px-6 bg-emerald-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="cta-content">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Ready to find your perfect artisan?
            </h2>
            <p className="text-emerald-200 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of Kenyans who&apos;ve discovered a better way to
              hire skilled professionals. Browse, connect, and hire—all for
              free.
            </p>
          </div>
          <div className="cta-buttons flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="magnetic-btn bg-white text-emerald-800 px-10 py-4 rounded-lg font-medium hover:bg-stone-100 transition-colors inline-block"
            >
              Start Browsing Free
            </Link>
            <Link
              href="/sign-up?role=artisan"
              className="magnetic-btn border border-emerald-600 px-10 py-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-block"
            >
              Join as Artisan
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link
                href="/"
                className="text-2xl font-serif font-bold text-white mb-4 inline-block"
              >
                ChapaWorks
              </Link>
              <p className="text-sm leading-relaxed max-w-sm">
                Kenya&apos;s trusted marketplace connecting clients with
                verified, skilled artisans. Browse portfolios, message directly,
                hire with confidence.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a
                    href="#artisans"
                    className="hover:text-white transition-colors"
                  >
                    Browse Artisans
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    For Businesses
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; 2025 ChapaWorks. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
