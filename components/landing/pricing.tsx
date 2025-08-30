"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useStaggeredReveal, useFadeInAnimation, use3DCardEffect } from "../../lib/animations";
import Magnetic from "../common/Magnetic";

const plans = [
  { 
    name: "Free", 
    price: "0", 
    period: "forever",
    description: "Perfect for exploring the platform",
    perks: [
      "Browse artisans directory",
      "Basic search filters", 
      "View artisan profiles",
      "Message artisans directly",
      "Basic support"
    ],
    icon: Star,
    popular: false,
    ctaText: "Get Started Free",
    color: "from-slate-50 to-slate-100"
  },
  { 
    name: "Pro Artisan", 
    price: "499", 
    period: "per month",
    description: "Ideal for professional artisans",
    perks: [
      "Verified professional badge",
      "M-Pesa payment integration", 
      "Priority in search results",
      "Featured portfolio showcase",
      "Advanced analytics",
      "24/7 priority support"
    ],
    icon: Crown,
    popular: true,
    ctaText: "Start Pro Trial",
    color: "from-amber-50 to-orange-100"
  },
];

export default function Pricing() {
  useFadeInAnimation(".pricing-header");
  useStaggeredReveal(".pricing-card");
  use3DCardEffect(".pricing-card");

  return (
    <div className="space-y-12">
      <div className="pricing-header text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass-card-light rounded-full text-sm font-medium text-slate-600 mb-6">
          <Zap className="w-4 h-4 text-amber-500" />
          Simple Pricing
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Choose your <span className="text-gradient-primary">perfect plan</span>
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Start free and upgrade when you&apos;re ready. All plans include our core features with no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card 
              key={plan.name} 
              className={`pricing-card relative p-6 lg:p-8 glass-card-light hover:glow-primary transition-all duration-500 hover:-translate-y-2 group overflow-hidden ${
                plan.popular ? 'ring-2 ring-amber-400 glow-amber' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
                    <IconComponent className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900 group-hover:text-gradient-primary transition-all">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">KES</span>
                  </div>
                  <div className="text-sm text-slate-500">{plan.period}</div>
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                <ul className="space-y-3" aria-label={`${plan.name} features`}>
                  {plan.perks.map((perk, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{perk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Magnetic>
                  <Button 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg" 
                    className={`w-full font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:scale-105 text-slate-900 glow-amber' 
                        : 'hover:bg-slate-50 hover:glow-primary'
                    }`}
                    aria-label={`Choose ${plan.name} plan`}
                  >
                    {plan.ctaText}
                  </Button>
                </Magnetic>
              </CardFooter>

              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 shimmer" />
            </Card>
          );
        })}
      </div>

      {/* FAQ link */}
      <div className="text-center pt-8 border-t border-slate-200">
        <p className="text-slate-600 mb-4">
          Have questions about our pricing?
        </p>
        <a 
          href="#faq" 
          className="inline-flex items-center px-6 py-3 text-slate-700 hover:text-slate-900 transition-colors rounded-full glass-card-light hover:glow-primary"
        >
          Check our FAQ →
        </a>
      </div>
    </div>
  );
}
