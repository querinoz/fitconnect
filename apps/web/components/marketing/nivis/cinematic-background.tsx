"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";

const HERO_POSTER =
  "https://images.unsplash.com/photo-1483728642387-6bc3bff38e93?auto=format&fit=crop&w=1920&q=80";

/** Bundled intro: apps/web/public/hero-training.mp4 (from FITCONNEC-INTROVIDEO.mp4) */
export const DEFAULT_HERO_VIDEO = "/hero-training.mp4";

type CinematicBackgroundProps = {
  poster?: string;
  videoSrc?: string;
  className?: string;
  kenBurnsRef?: RefObject<HTMLDivElement>;
};

/** Full-bleed cinematic background — `/hero-training.mp4` by default. */
export function CinematicBackground({
  poster = HERO_POSTER,
  videoSrc,
  className = "",
  kenBurnsRef
}: CinematicBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(true);
  const src = videoSrc ?? process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? DEFAULT_HERO_VIDEO;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !useVideo) return;

    const tryPlay = () => {
      video.play().catch(() => setUseVideo(false));
    };

    video.addEventListener("canplay", tryPlay);
    tryPlay();

    return () => video.removeEventListener("canplay", tryPlay);
  }, [useVideo, src]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {useVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onError={() => setUseVideo(false)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}

      {!useVideo ? (
        <div ref={kenBurnsRef} className="absolute inset-0 nivis-hero-kenburns">
          <Image src={poster} alt="" fill priority className="object-cover" sizes="100vw" />
        </div>
      ) : (
        <div ref={kenBurnsRef} className="absolute inset-0 scale-105" aria-hidden />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/25 via-ink-950/40 to-ink-950/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(191,238,22,0.1),transparent_42%)]" />
    </div>
  );
}

export { HERO_POSTER };
