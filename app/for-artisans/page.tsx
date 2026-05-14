import PublicNav from "@/components/layout/public-nav";
import Link from "next/link";
import {
  Check,
  Star,
  TrendingUp,
  Shield,
  Smartphone,
  Users,
  Award,
  ArrowRight,
  Briefcase,
  MessageSquare,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Artisans — ChapaWorks",
  description:
    "Grow your craft business on ChapaWorks. Get discovered by thousands of clients, manage jobs, build your portfolio, and get paid — all in one place.",
};

const benefits = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Reach more clients",
    desc: "Get discovered by thousands of clients searching for your skills across Kenya. Your profile works for you 24/7.",
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: "Manage jobs easily",
    desc: "Receive job requests, send quotes, track progress, and handle everything from one dashboard — no paperwork.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Build your reputation",
    desc: "Collect verified reviews from real clients. A strong profile means better clients and better rates.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified badge",
    desc: "Get verified and stand out from the crowd. Clients trust verified artisans and are more likely to hire you.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Grow your income",
    desc: "Subscribers get priority placement in search results and a reduced commission rate — your investment pays back fast.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Showcase your portfolio",
    desc: "Upload photos of your best work. Let your craftsmanship speak for itself and win clients before you even talk.",
  },
];

const steps = [
  { n: "01", title: "Sign up & build your profile", desc: "Create your free profile in minutes. Add your profession, skills, location, and portfolio photos." },
  { n: "02", title: "Get verified", desc: "Upload your certificate and ID. Our team reviews and approves your account — usually within 24 hours." },
  { n: "03", title: "Receive job requests", desc: "Clients find you through search and send you job requests. You review, quote, and accept the ones you want." },
  { n: "04", title: "Do great work & get paid", desc: "Complete the job, collect your payment, and earn a 5-star review. Your reputation grows with every job." },
];

const testimonials = [
  {
    name: "John Kamau",
    trade: "Carpenter, Nairobi",
    quote: "ChapaWorks gave me a steady stream of clients I never had before. My income has doubled in six months.",
    rating: 5,
  },
  {
    name: "Grace Wanjiku",
    trade: "Painter, Karen",
    quote: "The portfolio feature helped me win big commercial contracts. Clients can see my work before they even call me.",
    rating: 5,
  },
  {
    name: "Peter Ochieng",
    trade: "Electrician, Kilimani",
    quote: "I stopped relying on word-of-mouth. ChapaWorks brings me verified clients who are serious about hiring.",
    rating: 5,
  },
];

const plans = [
  {
    name: "Free",
    price: "KES 0",
    period: "forever",
    desc: "Get started, build your profile, accept your first clients.",
    features: ["Basic profile & portfolio", "Receive job requests", "Messaging with clients", "Standard 10% commission"],
    cta: "Get Started Free",
    ctaHref: "/sign-up?role=artisan",
    highlight: false,
  },
  {
    name: "Monthly",
    price: "KES 150",
    period: "/month",
    desc: "Grow faster with priority placement and a lower commission.",
    features: ["Priority listing in search", "Premium profile badge", "5% commission rate", "Portfolio up to 20 items", "Priority support"],
    cta: "Start Monthly",
    ctaHref: "/sign-up?role=artisan",
    highlight: false,
  },
  {
    name: "Annual",
    price: "KES 1,500",
    period: "/year",
    desc: "Best value. Everything in Monthly plus extra visibility.",
    features: ["All Monthly features", "Featured on homepage", "Analytics dashboard", "Verified artisan badge", "Save KES 300 vs monthly"],
    cta: "Get Annual Plan",
    ctaHref: "/sign-up?role=artisan",
    highlight: true,
  },
];

export default function ForArtisansPage() {
  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section className="py-20 px-6 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight mb-6">
            Your craft deserves<br />
            <span className="text-emerald-700">more clients.</span>
          </h1>
          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of verified artisans across Kenya who use ChapaWorks to get discovered, manage jobs, and grow their business — starting free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/sign-up?role=artisan"
              className="inline-flex items-center gap-2 bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20"
            >
              Join as an Artisan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/artisans"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-emerald-700 transition-colors text-sm font-medium"
            >
              See how it looks for clients
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "15,847", l: "Verified artisans" },
              { v: "127K+", l: "Jobs completed" },
              { v: "KES 2.3B", l: "Paid to artisans" },
              { v: "4.9/5", l: "Average rating" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-bold text-emerald-700">{s.v}</div>
                <div className="text-sm text-stone-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">Why artisans choose ChapaWorks</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              Everything you need to grow
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="font-serif font-bold text-stone-900 mb-2">{b.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">Getting started</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">Up and running in minutes</h2>
          </div>

          <div className="space-y-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-xl border border-stone-200 p-6 flex gap-6 items-start">
                <div className="w-14 h-14 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-lg mb-1">{s.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">Success stories</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">Artisans love ChapaWorks</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-stone-50 rounded-xl border border-stone-200 p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-700 italic mb-4 leading-relaxed text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{t.name}</p>
                  <p className="text-stone-500 text-xs">{t.trade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-emerald-700 font-medium mb-2 tracking-wide text-sm uppercase">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">Start free. Scale when ready.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl p-7 flex flex-col ${
                  plan.highlight
                    ? "bg-emerald-800 text-white"
                    : "bg-white border border-stone-200"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
                  </div>
                )}
                <div className={`text-sm font-medium mb-4 ${plan.highlight ? "text-emerald-300" : "text-stone-500"}`}>
                  {plan.name}
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-emerald-300" : "text-stone-500"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-emerald-200" : "text-stone-500"}`}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-emerald-100" : "text-stone-600"}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-emerald-300" : "text-emerald-600"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaHref}
                  className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-amber-400 text-amber-900 hover:bg-amber-300"
                      : "border border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-emerald-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Ready to grow your craft business?
          </h2>
          <p className="text-emerald-200 text-lg mb-10">
            Join thousands of artisans already using ChapaWorks. It&apos;s free to start.
          </p>
          <Link
            href="/sign-up?role=artisan"
            className="inline-flex items-center gap-2 bg-amber-400 text-amber-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-amber-300 transition-colors shadow-lg"
          >
            Create Your Artisan Profile
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-emerald-300 text-sm mt-4">No credit card required • Free forever plan available</p>
        </div>
      </section>

      <footer className="border-t border-emerald-700 py-6 px-6 text-center bg-emerald-900">
        <p className="text-emerald-400 text-sm">
          &copy; {new Date().getFullYear()} ChapaWorks — Connecting Clients with Skilled Artisans in Kenya
        </p>
      </footer>
    </div>
  );
}
