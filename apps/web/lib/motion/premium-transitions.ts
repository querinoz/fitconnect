/**
 * Legacy marketing motion aliases — prefer `@/lib/motion/elite-motion`.
 */
import { EOS_MOTION } from "@/lib/design-system/tokens";
import {
  eliteFadeIn,
  eliteFadeUp,
  eliteSpring,
  eliteStagger
} from "./elite-motion";

export const FC_EASE = EOS_MOTION.easeOut;

export const fcFadeUp = eliteFadeUp;
export const fcFadeIn = eliteFadeIn;
export const fcStaggerContainer = eliteStagger;
export const fcSpring = eliteSpring;

export const fcHoverLift = {
  whileHover: { y: -2, transition: eliteSpring },
  whileTap: { scale: 0.985 }
};
