"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Brain, MessageCirclePlus, Sparkles, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useLanguage, useLocale, useT } from "@/lib/i18n-provider";
import { isDemoModeEnv } from "@/lib/auth/middleware-auth";
import { cn } from "@/lib/utils";
import { AISuggestions } from "@/components/ai/ai-suggestions";
import { AIContextCard } from "@/components/ai/ai-context-card";
import { AIStreamingState } from "@/components/ai/ai-streaming-state";
import { datumFromScore, type TelemetryDatum } from "@/lib/telemetry/states";
import { muteEliteMotion, eliteFadeUp, eliteOverlay } from "@/lib/motion/elite-motion";

type Msg = { id: string; role: "user" | "assistant"; text: string };

async function loadReadinessContext(): Promise<TelemetryDatum> {
  try {
    const res = await fetch("/api/v1/readiness", { credentials: "include" });
    if (res.status === 401) {
      return datumFromScore("Readiness", null, { unauthorized: true, source: "unauthorized" });
    }
    if (!res.ok) {
      return datumFromScore("Readiness", null, { source: "unavailable" });
    }
    const body = (await res.json()) as { score?: number | null; source?: string };
    return datumFromScore("Readiness", body.score, { source: body.source });
  } catch {
    return datumFromScore("Readiness", null, { offline: true });
  }
}

export function AIAssistant() {
  const t = useT();
  const { lang } = useLanguage();
  const locale = useLocale();
  const reduce = useReducedMotion();
  const panelMotion = muteEliteMotion(eliteOverlay, reduce);
  const msgMotion = muteEliteMotion(eliteFadeUp, reduce);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [readiness, setReadiness] = useState<TelemetryDatum>(() => ({
    ...datumFromScore("Readiness", null),
    state: "loading",
    detail: "Loading training context…"
  }));
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cannedForLang = locale.ai.canned;
  const isDemoMode = isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 60);
      void loadReadinessContext().then(setReadiness);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  async function send(text: string) {
    if (!text.trim()) return;
    const id = Math.random().toString(36).slice(2);
    const nextUser: Msg = { id, role: "user", text };
    setMessages((m) => [...m, nextUser]);
    setInput("");
    setTyping(true);
    try {
      const history = [...messages, nextUser].map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: {
            readiness:
              readiness.state === "ready" && readiness.value != null
                ? { score: readiness.value, source: readiness.source ?? null }
                : { score: null, source: readiness.source ?? readiness.state }
          }
        })
      });
      const body = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      let reply = body.text;
      if (!res.ok || !reply) {
        if (body.error === "ai_not_configured" || res.status === 503) {
          reply =
            lang === "pt"
              ? "Zenith remoto não está configurado. Usa as sugestões ou liga um modelo (OPENAI_API_KEY)."
              : "Remote Zenith is not configured. Use a suggestion or set OPENAI_API_KEY.";
        } else if (res.status === 401) {
          reply =
            lang === "pt"
              ? "Inicia sessão para falar com o Zenith."
              : "Sign in to talk to Zenith.";
        } else {
          reply =
            lang === "pt"
              ? "Não consegui completar a resposta. Tenta outra vez."
              : "I could not complete that reply. Try again.";
        }
      }
      setMessages((m) => [...m, { id: `${id}-r`, role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `${id}-r`,
          role: "assistant",
          text:
            lang === "pt"
              ? "Ligação falhou. Tenta outra vez."
              : "Connection failed. Try again."
        }
      ]);
    } finally {
      setTyping(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      <button
        type="button"
        aria-label={t("ai", "bubbleLabel")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full text-eos-floor shadow-elevated transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-voltline/70",
          "bg-eos-voltline hover:scale-105"
        )}
      >
        <span aria-hidden="true" className="relative grid place-items-center">
          {open ? <X className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit ?? panelMotion.initial}
            transition={panelMotion.transition}
            role="dialog"
            aria-modal="true"
            aria-label={t("ai", "panelTitle")}
            className="fixed bottom-24 right-5 z-40 w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-eos-outline bg-eos-floor/95 backdrop-blur-xl shadow-elevated"
          >
            <header className="relative flex items-center gap-3 border-b border-eos-outline px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-eos-voltline text-eos-floor">
                <Brain className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold leading-tight text-eos-on-surface">
                  {t("ai", "panelTitle")}
                </p>
                <p className="truncate text-[11px] text-eos-on-surface-muted">{t("ai", "panelSubtitle")}</p>
              </div>
              {isDemoMode ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-eos-iris/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-eos-iris-soft ring-1 ring-eos-iris/30">
                  <Sparkles className="h-3 w-3" /> {t("ai", "demoTag")}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("ai", "closeLabel")}
                className="grid h-8 w-8 place-items-center rounded-lg text-eos-on-surface-muted hover:bg-eos-elevated hover:text-eos-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-voltline/60"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scrollRef} className="max-h-[58vh] space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <>
                  <div className="rounded-xl border border-eos-outline bg-eos-elevated/60 p-3 text-sm leading-relaxed text-eos-on-surface-muted">
                    <p className="mb-1 flex items-center gap-1.5 font-semibold text-eos-on-surface">
                      <MessageCirclePlus className="h-4 w-4 text-eos-voltline" />
                      {lang === "pt"
                        ? "Olá — como posso ajudar com o teu treino hoje?"
                        : "Hi — how can I help with your training today?"}
                    </p>
                    <p>
                      {lang === "pt"
                        ? "Zenith interpreta o teu contexto. Métricas vêm da camada de dados — nunca são inventadas."
                        : "Zenith interprets your context. Metrics come from the data layer — never invented."}
                    </p>
                  </div>
                  <AIContextCard readiness={readiness} />
                </>
              )}

              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={msgMotion.initial}
                  animate={msgMotion.animate}
                  transition={msgMotion.transition}
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-eos-voltline/15 text-eos-on-surface ring-1 ring-eos-voltline/30"
                      : "mr-auto bg-eos-elevated/80 text-eos-on-surface-muted ring-1 ring-eos-outline"
                  )}
                >
                  {m.text}
                </motion.div>
              ))}

              {typing ? <AIStreamingState label={t("ai", "typingLabel")} /> : null}

              {messages.length === 0 ? (
                <AISuggestions
                  heading={t("ai", "suggestionsHeading")}
                  items={cannedForLang.map((c) => ({ prompt: c.prompt }))}
                  onSelect={send}
                />
              ) : null}
            </div>

            <form onSubmit={onSubmit} className="border-t border-eos-outline bg-eos-floor/80 p-2.5">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("ai", "placeholder")}
                  aria-label={t("ai", "placeholder")}
                  className="h-11 w-full rounded-xl border border-eos-outline bg-eos-elevated/80 pl-3.5 pr-11 text-sm text-eos-on-surface placeholder:text-eos-on-surface-subtle focus:border-eos-voltline/50 focus:outline-none focus:ring-2 focus:ring-eos-voltline/60"
                />
                <button
                  type="submit"
                  aria-label={t("ai", "sendLabel")}
                  disabled={!input.trim()}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg bg-eos-voltline text-eos-floor disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-voltline/60"
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
