"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  Brain,
  MessageCirclePlus,
  Sparkles,
  X
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useLanguage, useLocale, useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export function AIAssistant() {
  const t = useT();
  const { lang } = useLanguage();
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cannedForLang = locale.ai.canned;

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function answer(text: string) {
    const found = cannedForLang.find(
      (c) => c.prompt.toLowerCase() === text.trim().toLowerCase()
    );
    if (found) return found.answer;
    if (lang === "pt") {
      return "Estou em modo demo, por isso só tenho algumas respostas pré-definidas. Toca numa das sugestões em baixo para ver o que consigo fazer.";
    }
    return "I'm in demo mode, so I only carry a few canned answers. Tap one of the suggestions below to see what I can do.";
  }

  function send(text: string) {
    if (!text.trim()) return;
    const id = Math.random().toString(36).slice(2);
    setMessages((m) => [...m, { id, role: "user", text }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: id + "-r",
          role: "assistant",
          text: answer(text)
        }
      ]);
      setTyping(false);
    }, 700);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* Bubble */}
      <button
        type="button"
        aria-label={t("ai", "bubbleLabel")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full text-ink-50 shadow-elevated transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plasma-400/70",
          "bg-gradient-to-br from-plasma-500 via-brand-500 to-accent-500 hover:scale-105"
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-plasma-500/40 blur-xl"
        />
        <span
          aria-hidden="true"
          className="relative grid h-10 w-10 place-items-center rounded-full bg-ink-950/30 backdrop-blur"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Brain className="h-5 w-5" />
          )}
        </span>
        {!open && (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-accent-400 ring-2 ring-ink-950 text-[9px] font-bold text-ink-950"
          >
            ✦
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.95 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={t("ai", "panelTitle")}
            className="fixed bottom-24 right-5 z-40 w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-ink-800 bg-ink-950/95 backdrop-blur-xl shadow-elevated"
          >
            <header className="relative flex items-center gap-3 border-b border-ink-800 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-plasma-500 via-brand-500 to-accent-500 text-ink-950">
                <Brain className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-ink-50 text-sm leading-tight">
                  {t("ai", "panelTitle")}
                </p>
                <p className="text-[11px] text-ink-400 truncate">
                  {t("ai", "panelSubtitle")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-plasma-500/15 text-plasma-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-plasma-500/30">
                <Sparkles className="h-3 w-3" /> {t("ai", "demoTag")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("ai", "closeLabel")}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:text-ink-100 hover:bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div
              ref={scrollRef}
              className="max-h-[58vh] overflow-y-auto px-4 py-3 space-y-3"
            >
              {messages.length === 0 && (
                <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-3 text-sm text-ink-300 leading-relaxed">
                  <p className="flex items-center gap-1.5 text-ink-100 font-semibold mb-1">
                    <MessageCirclePlus className="h-4 w-4 text-plasma-400" />
                    {lang === "pt"
                      ? "Olá Inês — como posso ajudar com o teu treino hoje?"
                      : "Hi Inês — how can I help with your training today?"}
                  </p>
                  <p>
                    {lang === "pt"
                      ? "Estou ligado ao teu painel: prontidão, HRV, sono e plano semanal. Toca numa sugestão para começar."
                      : "I'm wired into your dashboard: readiness, HRV, sleep and weekly plan. Tap a suggestion to start."}
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: reduce ? 0 : 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.22 }}
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-brand-500/15 text-ink-50 ring-1 ring-brand-400/30"
                      : "mr-auto bg-ink-900/80 text-ink-200 ring-1 ring-ink-800"
                  )}
                >
                  {m.text}
                </motion.div>
              ))}

              {typing && (
                <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-ink-900/80 px-3.5 py-2.5 ring-1 ring-ink-800">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-plasma-400"
                        style={{
                          animation: `pulse-soft 1.2s ease-in-out infinite`,
                          animationDelay: `${i * 120}ms`
                        }}
                      />
                    ))}
                  </span>
                  <span className="text-[11px] text-ink-500">
                    {t("ai", "typingLabel")}
                  </span>
                </div>
              )}

              {messages.length === 0 && (
                <div className="pt-2">
                  <p className="text-[11px] uppercase tracking-widest text-ink-500 mb-2">
                    {t("ai", "suggestionsHeading")}
                  </p>
                  <ul className="space-y-1.5">
                    {cannedForLang.map((c) => (
                      <li key={c.prompt}>
                        <button
                          type="button"
                          onClick={() => send(c.prompt)}
                          className="w-full text-left rounded-xl border border-ink-800 bg-ink-900/40 px-3 py-2 text-sm text-ink-200 hover:border-plasma-500/50 hover:bg-ink-900/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plasma-400/60"
                        >
                          {c.prompt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <form
              onSubmit={onSubmit}
              className="border-t border-ink-800 bg-ink-950/80 p-2.5"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("ai", "placeholder")}
                  aria-label={t("ai", "placeholder")}
                  className="w-full rounded-xl border border-ink-800 bg-ink-900/80 pl-3.5 pr-11 h-11 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-plasma-400/60 focus:border-plasma-500/50"
                />
                <button
                  type="submit"
                  aria-label={t("ai", "sendLabel")}
                  disabled={!input.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-plasma-500 to-brand-500 text-ink-50 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plasma-400/60"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
