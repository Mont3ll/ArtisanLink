"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

interface AnimatedCurveProps {
  /** Background color of the curve */
  backgroundColor?: string;
  /** Animation direction: 'up' | 'down' | 'left' | 'right' */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Curve intensity (how much the curve bulges) */
  curveAmount?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Animation delay in seconds */
  delay?: number;
  /** Animation easing */
  ease?: string;
  /** Trigger the animation */
  animate?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Custom className */
  className?: string;
}

export default function AnimatedCurve({
  backgroundColor = '#141516',
  direction = 'up',
  curveAmount = 300,
  duration = 0.7,
  delay = 0,
  ease = "power3.inOut",
  animate = false,
  onComplete,
  className = ''
}: AnimatedCurveProps) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setDimension({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate paths based on direction
  const getPaths = useCallback(() => {
    const { width, height } = dimension;
    
    switch (direction) {
      case 'up':
        return {
          initial: `M0 0 L${width} 0 L${width} ${height} Q${width/2} ${height + curveAmount} 0 ${height} L0 0`,
          target: `M0 0 L${width} 0 L${width} ${height} Q${width/2} ${height} 0 ${height} L0 0`
        };
      case 'down':
        return {
          initial: `M0 0 Q${width/2} ${-curveAmount} ${width} 0 L${width} ${height} L0 ${height} L0 0`,
          target: `M0 0 Q${width/2} 0 ${width} 0 L${width} ${height} L0 ${height} L0 0`
        };
      case 'left':
        return {
          initial: `M0 0 L${width} 0 L${width} ${height} L0 ${height} Q${-curveAmount} ${height/2} 0 0`,
          target: `M0 0 L${width} 0 L${width} ${height} L0 ${height} Q0 ${height/2} 0 0`
        };
      case 'right':
        return {
          initial: `M0 0 Q${width + curveAmount} ${height/2} ${width} ${height} L0 ${height} L0 0 L${width} 0`,
          target: `M0 0 Q${width} ${height/2} ${width} ${height} L0 ${height} L0 0 L${width} 0`
        };
      default:
        return {
          initial: `M0 0 L${width} 0 L${width} ${height} Q${width/2} ${height + curveAmount} 0 ${height} L0 0`,
          target: `M0 0 L${width} 0 L${width} ${height} Q${width/2} ${height} 0 ${height} L0 0`
        };
    }
  }, [dimension, direction, curveAmount]);

  useEffect(() => {
    if (!animate || !pathRef.current || dimension.width === 0) return;

    const { target } = getPaths();

    gsap.to(pathRef.current, {
      attr: { d: target },
      duration,
      ease,
      delay,
      onComplete
    });
  }, [animate, getPaths, duration, delay, ease, onComplete, dimension.width]);

  if (dimension.width === 0) return null;

  const { initial } = getPaths();

  return (
    <svg 
      ref={svgRef}
      className={`absolute top-0 left-0 pointer-events-none ${className}`}
      style={{ 
        width: '100%',
        height: direction === 'up' || direction === 'down' ? 'calc(100% + 300px)' : '100%',
        fill: backgroundColor,
        stroke: 'none',
        zIndex: 1
      }}
    >
      <path 
        ref={pathRef}
        d={initial}
      />
    </svg>
  );
}

// Example usage components:

// Exit curtain effect (like preloader)
export function ExitCurtain({ 
  show, 
  onComplete 
}: { 
  show: boolean; 
  onComplete?: () => void; 
}) {
  return (
    <div className={`fixed inset-0 z-50 ${show ? 'block' : 'hidden'}`}>
      <AnimatedCurve
        direction="up"
        animate={show}
        onComplete={onComplete}
        backgroundColor="#141516"
        className="z-10"
      />
    </div>
  );
}

// Page transition overlay
export function PageTransition({ 
  isTransitioning, 
  direction = 'right',
  onComplete 
}: { 
  isTransitioning: boolean; 
  direction?: 'up' | 'down' | 'left' | 'right';
  onComplete?: () => void; 
}) {
  return (
    <div className={`fixed inset-0 z-40 ${isTransitioning ? 'block' : 'hidden'}`}>
      <AnimatedCurve
        direction={direction}
        animate={isTransitioning}
        onComplete={onComplete}
        backgroundColor="#000"
        curveAmount={200}
      />
    </div>
  );
}

// Modal backdrop with curve
export function CurvedModalBackdrop({ 
  show, 
  onClose 
}: { 
  show: boolean; 
  onClose?: () => void; 
}) {
  return (
    <div 
      className={`fixed inset-0 z-30 ${show ? 'block' : 'hidden'}`}
      onClick={onClose}
    >
      <AnimatedCurve
        direction="down"
        animate={show}
        backgroundColor="rgba(0,0,0,0.8)"
        curveAmount={150}
        duration={0.5}
      />
    </div>
  );
}
