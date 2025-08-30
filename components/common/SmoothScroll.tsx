"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            gsap.to(window, {
              duration: 1,
              scrollTo: {
                y: target,
                offsetY: 80 // Account for fixed header
              },
              ease: "power2.inOut"
            });
          }
        }
      });
    });

    // General scroll animations
    const fadeInUpElements = gsap.utils.toArray(".fade-in-up") as Element[];
    fadeInUpElements.forEach((element) => {
      gsap.fromTo(element, 
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    const fadeInElements = gsap.utils.toArray(".fade-in") as Element[];
    fadeInElements.forEach((element) => {
      gsap.fromTo(element, 
        {
          opacity: 0
        },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return null;
}
