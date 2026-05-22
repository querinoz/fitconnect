"use client";

import { useReducedMotion } from "framer-motion";
import { EOS_MOTION } from "@/lib/design-system/tokens";
import {
  eliteDrawerLeft,
  eliteFadeIn,
  eliteFadeUp,
  eliteModal,
  eliteMorph,
  eliteOverlay,
  eliteRoutePanel,
  eliteSheet,
  eliteSpring,
  muteEliteMotion,
  type EliteMotionPreset,
  type RouteModalSize
} from "./elite-motion";

export { muteEliteMotion, type EliteMotionPreset, type RouteModalSize };

/** Central hook — returns Elite OS presets with reduced-motion safety applied. */
export function useEliteMotion() {
  const reduced = useReducedMotion();

  const mute = (preset: EliteMotionPreset) => muteEliteMotion(preset, reduced);

  return {
    reduced: !!reduced,
    mute,
    fadeIn: mute(eliteFadeIn),
    fadeUp: mute(eliteFadeUp),
    overlay: mute(eliteOverlay),
    modal: mute(eliteModal),
    sheet: mute(eliteSheet),
    drawerLeft: mute(eliteDrawerLeft),
    morph: eliteMorph,
    spring: eliteSpring,
    uiTransition: reduced
      ? { duration: 0 }
      : { duration: EOS_MOTION.duration.ui, ease: EOS_MOTION.easeOut },
    routePanel: (size: RouteModalSize) => mute(eliteRoutePanel(size))
  };
}
