"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { MapPin, ShieldCheck, MessageSquare, CreditCard, CheckCircle, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import { 
  useStaggeredReveal, 
  useFadeInAnimation, 
  use3DCardEffect, 
  useShimmerEffect,
  useGlowPulse
} from "../../lib/animations";

const cards = [
  {
    title: "Localized discovery",
    desc: "Find artisans near you with an interactive map and filters for trade and availability.",
    icon: MapPin,
    color: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200/50",
    benefits: ["Interactive map search", "Real-time availability", "Location-based filters"]
  },
  {
    title: "Verified professionals",
    desc: "Artisans submit a Code of Conduct certificate for admin verification to build trust.",
    icon: ShieldCheck,
    color: "from-green-50 to-green-100",
    iconColor: "text-green-600",
    borderColor: "border-green-200/50",
    benefits: ["Code of conduct verified", "Admin approval required", "Trust & safety guaranteed"]
  },
  {
    title: "Direct communication",
    desc: "Message artisans directly through the platform to agree on scope and pricing.",
    icon: MessageSquare,
    color: "from-purple-50 to-purple-100",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200/50",
    benefits: ["In-platform messaging", "Scope agreement", "Transparent pricing"]
  },
  {
    title: "M-Pesa subscriptions",
    desc: "Secure mobile payments via M-Pesa for artisan subscriptions and upgrades.",
    icon: CreditCard,
    color: "from-amber-50 to-amber-100",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200/50",
    benefits: ["M-Pesa integration", "Secure payments", "Subscription management"]
  },
];

const stats = [
  { number: "2K+", label: "Verified Artisans", icon: ShieldCheck, change: "+25% this month" },
  { number: "15K+", label: "Projects Completed", icon: CheckCircle, change: "+40% this quarter" },
  { number: "98%", label: "Client Satisfaction", icon: Star, change: "Industry leading" },
  { number: "24/7", label: "Platform Support", icon: MessageSquare, change: "Always available" }
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Apply animations
  useFadeInAnimation(".features-header");
  useStaggeredReveal(".feature-card");
  use3DCardEffect(".feature-card");
  useShimmerEffect(".shimmer-card");
  useGlowPulse(".glow-card");
  
  useEffect(() => {
    if (containerRef.current) {
      // Initialize floating orbs using direct GSAP instead of hook
      const container = containerRef.current.querySelector('.features-section');
      if (container) {
        for (let i = 0; i < 4; i++) {
          const orb = document.createElement('div');
          orb.className = `floating-orb-${i} absolute rounded-full bg-gradient-to-br from-blue-400/10 to-purple-500/10 blur-xl pointer-events-none`;
          
          const size = Math.random() * 100 + 50;
          orb.style.width = `${size}px`;
          orb.style.height = `${size}px`;
          orb.style.left = `${Math.random() * 100}%`;
          orb.style.top = `${Math.random() * 100}%`;
          
          container.appendChild(orb);
        }
      }
    }
  }, []);

  return (
    <section className="features-section relative py-20 lg:py-32 bg-gradient-section overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-animated-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
      
      <div ref={containerRef} className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        {/* Enhanced Header */}
        <div className="features-header text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card-light rounded-full text-sm font-medium text-slate-600">
            <Star className="w-4 h-4 text-amber-500" />
            Powerful Features
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
            Everything you need to{" "}
            <span className="text-gradient-primary">
              connect with artisans
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform provides all the tools necessary for seamless discovery, verification, and communication with skilled local professionals.
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div id="features" className="features-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.title} 
                className={`feature-card group glass-card-light hover:glass-strong hover:glow-primary transition-all duration-500 hover:-translate-y-2 ${card.borderColor} overflow-hidden shimmer-card hover-lift perspective-1000`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl bg-gradient-to-br ${card.color} p-3 group-hover:scale-110 transition-all duration-300 glow-card`}>
                      <Icon className={`h-6 w-6 ${card.iconColor}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-slate-900 group-hover:text-gradient-primary transition-all duration-300">
                        {card.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base leading-relaxed mb-6">
                    {card.desc}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    {card.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-slate-500">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                {/* Enhanced hover overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 shimmer"></div>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="stat-card text-center space-y-4 p-8 rounded-xl glass-card-light hover:glow-primary transition-all duration-300 group hover-lift"
              >
                <div className="w-16 h-16 bg-gradient-cta rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 glow-primary">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-slate-900 mb-2 group-hover:text-gradient-primary transition-all duration-300">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 font-medium mb-2">{stat.label}</div>
                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center pt-12 border-t border-slate-200/50">
          <h3 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to <span className="text-gradient-primary">discover</span> amazing artisans?
          </h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have found their perfect artisan match through our platform.
          </p>
          <button className="inline-flex items-center px-8 py-4 bg-gradient-cta text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 glow-primary hover:glow-secondary magnetic">
            Get Started Today
            <CheckCircle className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
