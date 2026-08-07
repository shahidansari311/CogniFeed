/**
 * Shared Framer Motion animation variants for consistent, subtle transitions.
 */

import type { Variants, Transition } from "framer-motion";

export const SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const EASE_OUT: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

/** Fade in from below */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: EASE_OUT },
};

/** Fade in (no movement) */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

/** Scale in from slightly smaller */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: SPRING },
};

/** Stagger children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Slide in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: EASE_OUT },
};

/** Slide in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: EASE_OUT },
};
