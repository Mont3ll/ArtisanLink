"use client";

import Header from "../components/landing/header";
import Hero from "../components/landing/hero";
import Features from "../components/landing/features";
import Pricing from "../components/landing/pricing";
import Cta from "../components/landing/cta";
import Footer from "../components/landing/footer";
import Testimonials from "../components/landing/testimonials";
import Faq from "../components/landing/faq";
import SlidingImages from "../components/common/SlidingImages";
import SmoothScroll from "../components/common/SmoothScroll";
import Preloader from "../components/common/Preloader";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Initialize global effects
    document.body.style.overflowX = 'hidden';
    
    return () => {
      document.body.style.overflowX = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Preloader />
      <SmoothScroll />
      <Header />

      {/* Hero Section */}
      <section className="hero-section bg-gradient-hero-light relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <Hero />
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Sliding Images Section */}
      <SlidingImages />

      {/* Testimonials Section */}
      <section className="testimonials-section bg-gradient-section relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-20 fade-in-up" id="testimonials">
          <Testimonials />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section bg-gradient-section relative overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-2xl" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-20 fade-in-up relative z-10" id="faq">
          <Faq />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section bg-gradient-section relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-24 fade-in-up" id="pricing">
          <Pricing />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-gradient-cta relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-24 fade-in-up">
          <Cta />
        </div>
      </section>

      <Footer />
    </div>
  );
}
