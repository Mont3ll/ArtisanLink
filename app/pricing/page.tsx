import PublicNav from "@/components/layout/public-nav";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — ChapaWorks",
  description: "Simple, transparent pricing. Free for clients. Affordable subscriptions for artisans looking to grow their business.",
};

export default function PricingPage() {
  return (
    <div className="bg-white text-[#222] min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section className="py-16 px-6 border-b border-[#ddd] bg-white text-center">
        <p className="text-emerald-700 font-medium mb-3 tracking-wide text-sm uppercase">Pricing</p>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#222] mb-4">
          Free for clients. Fair for artisans.
        </h1>
        <p className="text-[#6a6a6a] max-w-2xl mx-auto text-lg">
          Browse, message, and hire artisans at no cost. Artisans choose a plan that fits their ambition.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">

            {/* Client — Free */}
            <div className="bg-white rounded-xl border border-[#ddd] p-8 flex flex-col hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">
                For Clients
              </div>
              <div className="text-4xl font-bold text-[#222] mb-1">Free</div>
              <p className="text-[#6a6a6a] text-sm mb-8">No fees, no hidden costs</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Browse unlimited artisan profiles",
                  "View portfolios & verified reviews",
                  "Message artisans directly",
                  "Request jobs & receive quotes",
                  "Satisfaction guarantee",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#3f3f3f]">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block w-full bg-emerald-700 text-white text-center py-3 rounded-lg font-medium hover:bg-emerald-800 transition-colors text-sm"
              >
                Start Browsing Free
              </Link>
            </div>

            {/* Artisan — Monthly */}
            <div className="bg-white rounded-xl border border-[#ddd] p-8 flex flex-col hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">
                Monthly
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold text-[#222]">KES 150</span>
                <span className="text-[#6a6a6a] text-sm ml-1">/month</span>
              </div>
              <p className="text-[#6a6a6a] text-sm mb-8">Artisan subscription</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Professional profile & portfolio",
                  "Priority listing in search results",
                  "Receive messages from clients",
                  "Manage job requests easily",
                  "Premium profile badge",
                  "Reduced 5% commission rate",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#3f3f3f]">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=artisan"
                className="block w-full border border-emerald-700 text-emerald-700 text-center py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-sm"
              >
                Join as Artisan
              </Link>
            </div>

            {/* Artisan — Annual */}
            <div className="relative bg-emerald-800 text-white rounded-xl p-8 flex flex-col hover:shadow-xl transition-shadow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-700 text-emerald-200 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">
                Annual
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold">KES 1,500</span>
                <span className="text-emerald-300 text-sm ml-1">/year</span>
              </div>
              <p className="text-emerald-300 text-sm mb-8">Save KES 300 vs monthly</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Everything in Monthly",
                  "Featured on homepage",
                  "Analytics dashboard",
                  "Priority customer support",
                  "Verified artisan badge",
                  "Lowest 5% commission always",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-emerald-100">
                    <Check className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up?role=artisan"
                className="block w-full bg-amber-400 text-amber-900 text-center py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors text-sm"
              >
                Get Annual Plan
              </Link>
            </div>
          </div>

          {/* Commission note */}
          <div className="mt-10 bg-white rounded-xl border border-[#ddd] p-6 text-center">
            <h3 className="font-serif font-bold text-[#222] mb-2">How commissions work</h3>
            <p className="text-[#6a6a6a] text-sm max-w-2xl mx-auto">
              ChapaWorks charges a small platform commission only when you complete a paid job.{" "}
              <strong className="text-[#3f3f3f]">Standard rate: 10%.</strong>{" "}
              Subscribers enjoy a reduced{" "}
              <strong className="text-[#3f3f3f]">5% rate</strong> on all completed jobs.
              During the current testing phase all payments are handled directly in cash between client and artisan.
            </p>
          </div>

          {/* FAQ teaser */}
          <div className="mt-12 text-center">
            <p className="text-[#6a6a6a] mb-3">Have questions about pricing?</p>
            <Link
              href="/#faq"
              className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800 transition-colors"
            >
              Read our FAQ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ddd] py-8 px-6 text-center">
        <p className="text-sm text-[#929292]">
          &copy; {new Date().getFullYear()} ChapaWorks — Connecting Clients with Skilled Artisans in Kenya
        </p>
      </footer>
    </div>
  );
}
