"use client";

import React, { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import Magnetic from './Magnetic';

interface RoundedButtonProps {
  children: ReactNode;
  backgroundColor?: string;
  onClick?: () => void;
  className?: string;
  href?: string;
}

export default function RoundedButton({ 
  children, 
  backgroundColor = "#455CE9", 
  onClick,
  className = "",
  href,
  ...attributes 
}: RoundedButtonProps) {
  const circle = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (!circle.current) return;
    
    timeline.current = gsap.timeline({ paused: true });
    timeline.current
      .to(circle.current, { 
        top: "-25%", 
        width: "150%", 
        duration: 0.4, 
        ease: "power3.in" 
      }, "enter")
      .to(circle.current, { 
        top: "-150%", 
        width: "125%", 
        duration: 0.25 
      }, "exit");
  }, []);

  const manageMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeline.current?.tweenFromTo('enter', 'exit');
  };

  const manageMouseLeave = () => {
    timeoutId = setTimeout(() => {
      timeline.current?.play();
    }, 300);
  };

  const buttonClass = `
    relative inline-flex items-center justify-center
    px-8 py-4 rounded-full border border-gray-400
    cursor-pointer overflow-hidden transition-colors duration-400
    hover:text-white ${className}
  `.trim();

  const buttonContent = (
    <div 
      className={buttonClass}
      onMouseEnter={manageMouseEnter}
      onMouseLeave={manageMouseLeave}
      onClick={onClick}
      {...attributes}
    >
      <span className="relative z-10 transition-colors duration-400">
        {children}
      </span>
      <div 
        ref={circle} 
        className="absolute w-full h-[150%] rounded-full top-full"
        style={{ backgroundColor }}
      />
    </div>
  );

  if (href) {
    return (
      <Magnetic>
        <a href={href} className="inline-block">
          {buttonContent}
        </a>
      </Magnetic>
    );
  }

  return (
    <Magnetic>
      {buttonContent}
    </Magnetic>
  );
}
