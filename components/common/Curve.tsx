"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CurveProps {
  isOpen: boolean;
}

export default function Curve({ isOpen }: CurveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [height, setHeight] = useState(800); // Default height for SSR

  useEffect(() => {
    setHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    if (!pathRef.current) return;

    const initialPath = `M100 0 L100 ${height} Q-100 ${height/2} 100 0`;
    const targetPath = `M100 0 L100 ${height} Q100 ${height/2} 100 0`;

    if (isOpen) {
      gsap.to(pathRef.current, {
        attr: { d: targetPath },
        duration: 1,
        ease: "power3.inOut"
      });
    } else {
      gsap.to(pathRef.current, {
        attr: { d: initialPath },
        duration: 0.8,
        ease: "power3.inOut"
      });
    }
  }, [isOpen, height]);

  const initialPath = `M100 0 L100 ${height} Q-100 ${height/2} 100 0`;

  return (
    <svg 
      className="absolute top-0 -left-24 w-24 h-full pointer-events-none"
      style={{ fill: 'rgb(41, 41, 41)', stroke: 'none' }}
    >
      <path 
        ref={pathRef}
        d={initialPath}
      />
    </svg>
  );
}
