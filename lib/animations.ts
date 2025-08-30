import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

// Register the plugin
gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Enhanced Hero Animation with Complex Sequences
 */
export function useHeroAnimation() {
  useGSAP(() => {
    const timeline = gsap.timeline();
    
    // Initial setup
    gsap.set('.hero-content > *', { y: 100, opacity: 0 });
    gsap.set('.hero-visual', { scale: 0.8, opacity: 0 });
    gsap.set('.hero-floating-elements', { scale: 0, rotation: 0 });
    
    // Main animation sequence
    timeline
      .to('.hero-content > *', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.2
      })
      .to('.hero-visual', {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'back.out(1.7)'
      }, '-=0.8')
      .to('.hero-floating-elements', {
        scale: 1,
        rotation: 360,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        stagger: 0.3
      }, '-=0.5');

    // Continuous floating animation
    gsap.to('.hero-float-1', {
      y: -20,
      rotation: 10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.hero-float-2', {
      y: -30,
      rotation: -15,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1
    });
  });
}

/**
 * Magnetic Cursor Effect
 */
export function useMagneticEffect(selector: string) {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element: HTMLElement) => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.2;
        const deltaY = (e.clientY - centerY) * 0.2;
        
        gsap.to(element, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out'
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      };
      
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
    });
  });
}

/**
 * Advanced Mask Reveal Animation
 */
export function useMaskReveal(selector: string, direction: 'left' | 'right' | 'up' | 'down' = 'up') {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    const clipPaths = {
      left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
      right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0)' },
      up: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
      down: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' }
    };

    elements.forEach((element: HTMLElement) => {
      gsap.fromTo(element, 
        { clipPath: clipPaths[direction].from },
        {
          clipPath: clipPaths[direction].to,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  });
}

/**
 * Staggered Reveal with Advanced Easing
 */
export function useStaggeredReveal(selector: string, options?: { 
  stagger?: number; 
  duration?: number; 
  threshold?: number;
}) {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    if (!elements.length) return;
    
    // Set initial state immediately to prevent flash
    gsap.set(elements, {
      opacity: 0,
      y: 60,
      scale: 0.95,
      rotation: 5
    });
    
    // Add animation-ready class to parent section
    const section = elements[0]?.closest('section');
    if (section) {
      section.classList.add('animation-ready');
    }
    
    ScrollTrigger.batch(elements, {
      start: `top ${options?.threshold || 85}%`,
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: options?.duration || 1.2,
          ease: 'power3.out',
          stagger: options?.stagger || 0.15,
          overwrite: true
        });
      }
    });
  });
}

/**
 * Scale and Rotate In Animation
 */
export function useScaleInAnimation(selector: string, options?: { 
  stagger?: number; 
  duration?: number; 
  threshold?: number;
}) {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    if (!elements.length) return;
    
    gsap.from(elements, {
      scale: 0.3,
      opacity: 0,
      rotation: 180,
      duration: options?.duration || 1,
      ease: 'back.out(2)',
      stagger: options?.stagger || 0.1,
      scrollTrigger: {
        trigger: elements[0] as HTMLElement,
        start: `top ${options?.threshold || 85}%`,
        toggleActions: 'play none none none'
      }
    });
  });
}

/**
 * Fade In Animation with Custom Easing
 */
export function useFadeInAnimation(selector: string, options?: { 
  delay?: number; 
  duration?: number; 
  threshold?: number;
}) {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    if (!elements.length) return;
    
    gsap.from(elements, {
      y: 40,
      opacity: 0,
      duration: options?.duration || 1.2,
      delay: options?.delay || 0,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: elements[0] as HTMLElement,
        start: `top ${options?.threshold || 85}%`,
        toggleActions: 'play none none none'
      }
    });
  });
}

/**
 * 3D Card Hover Effect
 */
export function use3DCardEffect(selector: string) {
  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>(selector);
    
    cards.forEach((card: HTMLElement) => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateX = (e.clientY - centerY) / 10;
        const rotateY = (e.clientX - centerX) / 10;
        
        gsap.to(card, {
          rotateX: -rotateX,
          rotateY: rotateY,
          transformPerspective: 1000,
          duration: 0.3,
          ease: 'power2.out'
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      };
      
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });
  });
}

/**
 * Shimmer Effect Animation
 */
export function useShimmerEffect(selector: string) {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element: HTMLElement) => {
      const shimmer = document.createElement('div');
      shimmer.className = 'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none';
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(shimmer);
      
      gsap.to(shimmer, {
        x: '200%',
        duration: 2,
        ease: 'power2.inOut',
        repeat: -1,
        repeatDelay: 3
      });
    });
  });
}

/**
 * Floating Orb Animation
 */
export function useFloatingOrbs(containerSelector: string, orbCount: number = 3) {
  useGSAP(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    for (let i = 0; i < orbCount; i++) {
      const orb = document.createElement('div');
      orb.className = `floating-orb-${i} absolute rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-xl pointer-events-none`;
      
      const size = Math.random() * 100 + 50;
      orb.style.width = `${size}px`;
      orb.style.height = `${size}px`;
      orb.style.left = `${Math.random() * 100}%`;
      orb.style.top = `${Math.random() * 100}%`;
      
      container.appendChild(orb);
      
      gsap.to(orb, {
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        scale: Math.random() * 0.5 + 0.8,
        duration: Math.random() * 10 + 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      
      gsap.to(orb, {
        rotation: 360,
        duration: Math.random() * 20 + 10,
        repeat: -1,
        ease: 'none'
      });
    }
  });
}

/**
 * Glow Pulse Animation
 */
export function useGlowPulse(selector: string) {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element: HTMLElement) => {
      gsap.to(element, {
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  });
}

/**
 * Text Typing Animation
 */
export function useTypingAnimation(selector: string, options?: { speed?: number; cursor?: boolean }) {
  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element: HTMLElement) => {
      const text = element.textContent || '';
      element.textContent = '';
      
      if (options?.cursor) {
        element.innerHTML = '<span class="typing-cursor">|</span>';
        gsap.to('.typing-cursor', {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut'
        });
      }
      
      const chars = text.split('');
      let currentText = '';
      
      chars.forEach((char, index) => {
        gsap.delayedCall((index + 1) * (options?.speed || 0.05), () => {
          currentText += char;
          if (options?.cursor) {
            element.innerHTML = currentText + '<span class="typing-cursor">|</span>';
          } else {
            element.textContent = currentText;
          }
        });
      });
    });
  });
}

// Legacy ref-based hooks for compatibility
export function useFadeInAnimationRef(options?: { 
  delay?: number; 
  duration?: number; 
  threshold?: number;
}) {
    const ref = useRef<HTMLElement>(null);
    
    useGSAP(() => {
        if (!ref.current) return;
        
        gsap.from(ref.current, {
            y: 50,
            opacity: 0,
            duration: options?.duration || 1.6,
            delay: options?.delay || 0,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ref.current,
                start: `top ${options?.threshold || 85}%`,
                toggleActions: "play none none none",
            }
        });
    }, []);
    
    return { ref };
}