"use client";

import dynamic from "next/dynamic";

export const HeroEmailCaptureClient = dynamic(
  () => import("./hero-email-capture").then((m) => m.HeroEmailCapture),
  { ssr: false }
);
