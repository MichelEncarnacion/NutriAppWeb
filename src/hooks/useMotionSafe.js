import { useReducedMotion } from "framer-motion";
import { fadeInUp, stagger, floatAnim, fadeInUpSafe, staggerSafe } from "../components/landing/landingTokens";

export function useMotionSafe() {
  const reduce = useReducedMotion();
  return {
    fadeInUp: reduce ? fadeInUpSafe : fadeInUp,
    stagger:  reduce ? staggerSafe : stagger,
    floatAnim: reduce ? {} : floatAnim,
    shouldAnimate: !reduce,
  };
}
