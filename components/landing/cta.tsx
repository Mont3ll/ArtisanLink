"use client";

import { ArrowRight, Sparkles, Users, CheckCircle } from "lucide-react";
import { useFadeInAnimation, useGlowPulse } from "../../lib/animations";
import Magnetic from "../common/Magnetic";

export default function Cta() {
  useFadeInAnimation(".cta-content");
  useGlowPulse(".cta-button");

  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-animated-grid opacity-20" />
      <div className="absolute top-10 left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-float-delayed" />

      <div className="relative z-10 rounded-2xl text-white p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="cta-content space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Get Started Today
            </div>
            
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to find{" "}
              <span className="text-gradient-amber">local talent</span>?
            </h3>
            
            <p className="text-xl text-slate-300 leading-relaxed">
              Create a free account and start discovering skilled artisans near you. Join thousands of satisfied clients today.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                "Free account setup in 2 minutes",
                "Access to 2K+ verified artisans",
                "Secure M-Pesa payment integration"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cta-content flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
            <Magnetic>
              <a 
                className="cta-button inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-8 py-4 font-bold text-lg hover:scale-105 transition-all duration-300 glow-amber group"
                href="/signup"
              >
                <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Create account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Magnetic>

            <Magnetic>
              <a 
                className="inline-flex items-center justify-center rounded-full border-2 border-white/20 text-white px-8 py-4 font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                href="#features"
              >
                Learn more
              </a>
            </Magnetic>

            {/* Trust indicator */}
            <div className="text-center lg:text-right text-sm text-slate-400 mt-4">
              <div className="font-semibold text-white">2,500+ clients trust us</div>
              <div>⭐⭐⭐⭐⭐ 4.9/5 rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
