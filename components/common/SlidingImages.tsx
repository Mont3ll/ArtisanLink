"use client";

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { Star, Users, Hammer, Zap } from 'lucide-react';
import { useFadeInAnimation } from '../../lib/animations';

const artisanImages = [
    {
        color: "#f3f4f6",
        src: "/file.svg",
        alt: "Carpenter crafting furniture",
        category: "Carpenter",
        rating: 4.9,
        projects: 120
    },
    {
        color: "#fef3c7",
        src: "/globe.svg", 
        alt: "Electrician working",
        category: "Electrician",
        rating: 4.8,
        projects: 95
    },
    {
        color: "#e0e7ff",
        src: "/window.svg",
        alt: "Painter creating art",
        category: "Painter",
        rating: 4.9,
        projects: 150
    },
    {
        color: "#f0fdf4",
        src: "/vercel.svg",
        alt: "Welder at work",
        category: "Welder",
        rating: 5.0,
        projects: 85
    }
];

const artisanImages2 = [
    {
        color: "#fef2f2",
        src: "/next.svg",
        alt: "Plumber fixing pipes",
        category: "Plumber",
        rating: 4.7,
        projects: 110
    },
    {
        color: "#f5f3ff",
        src: "/file.svg",
        alt: "Tailor sewing clothes",
        category: "Tailor",
        rating: 4.9,
        projects: 200
    },
    {
        color: "#fffbeb",
        src: "/globe.svg",
        alt: "Mason building wall",
        category: "Mason",
        rating: 4.8,
        projects: 75
    },
    {
        color: "#f0fdfa",
        src: "/window.svg",
        alt: "Mechanic repairing car",
        category: "Mechanic",
        rating: 4.9,
        projects: 140
    }
];

export default function SlidingImages() {
    const container = useRef<HTMLDivElement>(null);
    
    useFadeInAnimation(".sliding-header");

    useEffect(() => {
        if (typeof window !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        if (!container.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                }
            });

            tl.to(".slider-1", {
                x: 150,
                ease: "none"
            });

            tl.to(".slider-2", {
                x: -150,
                ease: "none"
            }, 0);

            // Add floating animations to individual cards
            gsap.to(".artisan-card", {
                y: -5,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.2
            });

        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <section className="sliding-images-section relative py-20 lg:py-32 bg-gradient-section overflow-hidden">
            {/* Full-width Background Effects */}
            <div className="absolute inset-0 bg-animated-grid opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-2xl" />
            
            <div className="space-y-12 relative z-10">
                {/* Header with container */}
                <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
                    <div className="sliding-header text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass-card-light rounded-full text-sm font-medium text-slate-600 mb-6">
                            <Users className="w-4 h-4 text-blue-500" />
                            Our Artisans
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Skilled <span className="text-gradient-primary">Artisans</span> at Work
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Discover talented professionals across various trades, each verified and ready to bring your projects to life.
                        </p>
                    </div>
                </div>

                {/* Full-width sliding container */}
                <div ref={container} className="w-full">
                    <div className="space-y-8">
                        {/* First slider - extends beyond viewport */}
                        <div className="slider-1 flex gap-6 -ml-40">
                            {[...artisanImages, ...artisanImages].map((image, index) => (
                                <div 
                                    key={`slider1-${index}`} 
                                    className="artisan-card flex-shrink-0 w-80 h-72 rounded-2xl overflow-hidden shadow-lg glass-card-light hover:glow-primary transition-all duration-500 hover:-translate-y-2 group"
                                    style={{ backgroundColor: image.color }}
                                >
                                    <div className="w-full h-full p-6 flex flex-col">
                                        <div className="flex-1 flex items-center justify-center mb-4">
                                            <Image
                                                src={image.src}
                                                alt={image.alt}
                                                width={100}
                                                height={100}
                                                className="w-24 h-24 object-contain opacity-60 group-hover:opacity-80 transition-opacity"
                                            />
                                        </div>
                                        
                                        {/* Card Details */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-slate-900 text-lg group-hover:text-gradient-primary transition-all">
                                                {image.category}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                    <span className="text-sm font-medium text-slate-700">{image.rating}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Hammer className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm text-slate-600">{image.projects} projects</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 shimmer" />
                                </div>
                            ))}
                        </div>

                        {/* Second slider - extends beyond viewport */}
                        <div className="slider-2 flex gap-6 -mr-40">
                            {[...artisanImages2, ...artisanImages2].map((image, index) => (
                                <div 
                                    key={`slider2-${index}`} 
                                    className="artisan-card flex-shrink-0 w-80 h-72 rounded-2xl overflow-hidden shadow-lg glass-card-light hover:glow-primary transition-all duration-500 hover:-translate-y-2 group"
                                    style={{ backgroundColor: image.color }}
                                >
                                    <div className="w-full h-full p-6 flex flex-col">
                                        <div className="flex-1 flex items-center justify-center mb-4">
                                            <Image
                                                src={image.src}
                                                alt={image.alt}
                                                width={100}
                                                height={100}
                                                className="w-24 h-24 object-contain opacity-60 group-hover:opacity-80 transition-opacity"
                                            />
                                        </div>
                                        
                                        {/* Card Details */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-slate-900 text-lg group-hover:text-gradient-primary transition-all">
                                                {image.category}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                    <span className="text-sm font-medium text-slate-700">{image.rating}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Hammer className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm text-slate-600">{image.projects} projects</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 shimmer" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trust Indicators with container */}
                <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
                    <div className="text-center py-12 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <span className="text-2xl font-bold text-slate-900">2K+</span>
                                </div>
                                <div className="text-sm text-slate-600">Verified Artisans</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    <span className="text-2xl font-bold text-slate-900">4.8/5</span>
                                </div>
                                <div className="text-sm text-slate-600">Average Rating</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Hammer className="w-5 h-5 text-amber-500" />
                                    <span className="text-2xl font-bold text-slate-900">15K+</span>
                                </div>
                                <div className="text-sm text-slate-600">Projects Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
