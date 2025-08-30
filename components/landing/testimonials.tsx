"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useStaggeredReveal, useFadeInAnimation } from "../../lib/animations";

const items = [
  {
    name: "Asha Mwangi",
    role: "Homeowner",
    quote: "I found a talented carpenter nearby who delivered excellent work on time. The verification process gave me complete confidence in my choice.",
    avatar: "/globe.svg",
    rating: 5,
    location: "Nairobi"
  },
  {
    name: "Peter Otieno",
    role: "Startup Founder",
    quote: "ArtisanLink made it easy to verify and hire a contractor for our office fit-out. The M-Pesa integration was seamless and professional.",
    avatar: "/file.svg",
    rating: 5,
    location: "Mombasa"
  },
  {
    name: "Grace Wanjiku",
    role: "Restaurant Owner",
    quote: "The platform connected me with skilled electricians and plumbers. Communication was direct and pricing was transparent throughout.",
    avatar: "/next.svg",
    rating: 5,
    location: "Kisumu"
  },
];

export default function Testimonials() {
  useFadeInAnimation(".testimonials-header");
  useStaggeredReveal(".testimonial-card");

  return (
    <div className="space-y-12">
      <div className="testimonials-header text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass-card-light rounded-full text-sm font-medium text-slate-600 mb-6">
          <Star className="w-4 h-4 text-amber-500" />
          Client Stories
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          What people <span className="text-gradient-primary">say</span>
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover how ArtisanLink has helped thousands of clients find and hire the perfect artisans for their projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((testimonial) => (
          <Card 
            key={testimonial.name} 
            className="testimonial-card p-6 glass-card-light hover:glow-primary transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden"
          >
            {/* Quote icon */}
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Quote className="w-8 h-8 text-slate-600" />
            </div>

            <div className="flex items-start gap-4 mb-4">
              <Avatar className="ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-slate-700">
                  {testimonial.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="font-semibold text-slate-900 group-hover:text-gradient-primary transition-all">
                  {testimonial.name}
                </div>
                <div className="text-sm text-slate-500">{testimonial.role}</div>
                <div className="text-xs text-slate-400">{testimonial.location}</div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-slate-700 leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 shimmer" />
          </Card>
        ))}
      </div>

      {/* Trust indicators */}
      <div className="text-center pt-8 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-900">4.9/5</div>
            <div className="text-sm text-slate-600">Average Rating</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-900">2,500+</div>
            <div className="text-sm text-slate-600">Happy Clients</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-900">99%</div>
            <div className="text-sm text-slate-600">Would Recommend</div>
          </div>
        </div>
      </div>
    </div>
  );
}
