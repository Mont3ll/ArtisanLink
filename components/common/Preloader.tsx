"use client";

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const words = ["Hello", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "Guten tag", "Jambo"];

export default function Preloader() {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (index === words.length - 1) {
      setIsAnimating(true);
      return;
    }
    
    const timeout = setTimeout(() => {
      setIndex(index + 1);
    }, index === 0 ? 1000 : 150);

    return () => clearTimeout(timeout);
  }, [index]);

  useEffect(() => {
    if (!isAnimating || !introRef.current || !pathRef.current || dimension.width === 0) return;

    const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width/2} ${dimension.height} 0 ${dimension.height} L0 0`;

    const tl = gsap.timeline({
      onComplete: () => {
        if (introRef.current) {
          introRef.current.style.display = 'none';
        }
      }
    });

    // Slide up the preloader
    tl.to(introRef.current, {
      top: "-100vh",
      duration: 0.8,
      ease: "power3.inOut",
      delay: 0.2
    });

    // Animate the curve
    tl.to(pathRef.current, {
      attr: { d: targetPath },
      duration: 0.7,
      ease: "power3.inOut",
      delay: 0.3
    }, 0);

  }, [isAnimating, dimension.width, dimension.height]);

  // Text animation
  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current, 
        { opacity: 0 },
        { 
          opacity: 0.75, 
          duration: 1, 
          delay: 0.2
        }
      );
    }
  }, []);

  if (dimension.width === 0) return null;

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width/2} ${dimension.height + 300} 0 ${dimension.height} L0 0`;

  return (
    <div 
      ref={introRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        height: '100vh',
        width: '100vw',
        backgroundColor: '#141516',
        top: 0
      }}
    >
      <p 
        ref={textRef}
        className="flex items-center text-white text-4xl md:text-5xl font-medium relative z-10"
      >
        <span className="block w-2.5 h-2.5 bg-white rounded-full mr-2.5"></span>
        {words[index]}
      </p>
      
      <svg 
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{ 
          width: '100%',
          height: 'calc(100% + 300px)',
          fill: '#141516',
          stroke: 'none'
        }}
      >
        <path 
          ref={pathRef}
          d={initialPath}
        />
      </svg>
    </div>
  );
}
