import { useEffect, useState } from 'react';
import type { Transition, Variants } from 'motion/react';

// Master Motion Timing Tokens
export const EASE_ENTRANCE = [0.22, 1, 0.36, 1] as const;
export const EASE_EXIT = [0.4, 0, 1, 1] as const;

export const DURATION_FAST = 0.14;
export const DURATION_BASE = 0.24;
export const DURATION_SLOW = 0.42;

// Master Spring Tokens (Stiffness: 320, Damping: 32)
export const SPRING_PHYSICS: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 32,
};

export const TRANSITION_FAST: Transition = {
  duration: DURATION_FAST,
  ease: EASE_ENTRANCE,
};

export const TRANSITION_BASE: Transition = {
  duration: DURATION_BASE,
  ease: EASE_ENTRANCE,
};

export const TRANSITION_SLOW: Transition = {
  duration: DURATION_SLOW,
  ease: EASE_ENTRANCE,
};

// Direction-aware screen slide variants
// Forward: enter from right (x: 24), exit to left (x: -12)
// Backward: enter from left (x: -24), exit to right (x: 12)
export const createSlideVariants = (direction: 'forward' | 'backward' = 'forward'): Variants => ({
  initial: {
    opacity: 0,
    x: direction === 'forward' ? 24 : -24,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION_BASE,
      ease: EASE_ENTRANCE,
    },
  },
  exit: {
    opacity: 0,
    x: direction === 'forward' ? -12 : 12,
    transition: {
      duration: DURATION_FAST,
      ease: EASE_EXIT,
    },
  },
});

// Interactive Button Motion Props
export const BUTTON_TAP_PROPS = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.97 },
  transition: TRANSITION_FAST,
};

// Staggered Container & Items (30ms stagger, max 8 items)
export const STAGGER_CONTAINER_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

export const STAGGER_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_BASE,
      ease: EASE_ENTRANCE,
    },
  },
};

// Shaking Animation for Blocking Safety Issues (180ms)
export const SHAKE_VARIANTS: Variants = {
  shake: {
    x: [-6, 6, -4, 4, -2, 2, 0],
    transition: {
      duration: 0.18,
      ease: 'linear',
    },
  },
};

// Count-up animated number component over 600ms
export function useCountUp(targetNumber: number, durationMs = 600): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = current;
    const change = targetNumber - startVal;

    if (change === 0) return;

    let frameId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic
      const easeVal = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startVal + change * easeVal));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetNumber, durationMs]);

  return current;
}
