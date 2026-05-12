"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24">
      <div className="absolute inset-0 -z-10 gradient-bg" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-grid-dark bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />

      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-brand-500/30">
            <Sparkles className="h-3.5 w-3.5" /> Now matching 12,000+ verified specialists
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Train with the <span className="gradient-text">world&apos;s best</span> specialists.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ink-300 max-w-2xl text-balance">
            From Vinyasa to Vert-skating, find verified personal trainers who live and breathe
            your sport. Book online or in person, pay safely, and track your progress in one
            single place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/discover">
                Find my trainer <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/trainer">I&apos;m a trainer</Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-ink-400">
            <div className="flex -space-x-2">
              {[47, 12, 32, 14, 49].map((id) => (
                <img
                  key={id}
                  src={`https://i.pravatar.cc/64?img=${id}`}
                  alt=""
                  className="h-9 w-9 rounded-full ring-2 ring-ink-950"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-2 text-ink-200 font-semibold">4.97</span>
              </div>
              <p>Rated by 27,840 athletes</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&auto=format&fit=crop"
              alt="Athlete training"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

            {/* floating card */}
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-ink-900/80 backdrop-blur-md border border-ink-800 p-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/80?img=58"
                  alt=""
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold text-ink-50">Mateo Rinaldi</p>
                  <p className="text-xs text-ink-400">Cycling · Girona · 4.93 ★</p>
                </div>
                <Button size="sm" variant="default">
                  Book
                </Button>
              </div>
            </div>

            {/* floating search */}
            <div className="absolute -left-6 top-1/3 hidden lg:flex items-center gap-3 rounded-2xl bg-ink-900/90 backdrop-blur-md border border-ink-800 px-4 py-3 shadow-2xl">
              <Search className="h-4 w-4 text-brand-400" />
              <div className="text-sm">
                <p className="text-ink-300">Surfing · Lisbon</p>
                <p className="text-ink-500 text-xs">48 trainers · from €35/h</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
