"use client";

import { createContext, useContext } from "react";

type LandingGateContextValue = {
  gateDone: boolean;
};

export const LandingGateContext = createContext<LandingGateContextValue>({ gateDone: false });

export function useLandingGate() {
  return useContext(LandingGateContext);
}
