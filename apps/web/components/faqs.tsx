"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQS } from "@/lib/data";
import { useLanguage, useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

const FAQS_PT: { q: string; a: string }[] = [
  {
    q: "Como são verificados os coaches?",
    a: "Cada coach carrega as suas certificações, que validamos junto da entidade emissora. Pedimos também documento de identidade, uma entrevista de 30 minutos com um coach sénior da equipa FitConnect e uma verificação de antecedentes antes da ativação. Apenas 4 em cada 10 candidatos passam."
  },
  {
    q: "Posso ter sessões à distância?",
    a: "Sim — a nossa sala de vídeo HD integrada está incluída, sem custo, em cada reserva. Os coaches podem marcar-se como online, presenciais ou híbridos. A sala grava por defeito para poderes rever a tua técnica mais tarde."
  },
  {
    q: "Como funcionam os pagamentos?",
    a: "Todas as reservas são processadas via Stripe Connect. Os fundos são entregues ao coach 24 horas após a sessão, com regras de reembolso completas se cancelares dentro da política. Os coaches ficam com 85% de cada reserva — o valor mais alto de qualquer marketplace."
  },
  {
    q: "E se não estiver satisfeito com o meu coach?",
    a: "Cada coach oferece uma intro grátis de 15 minutos e podes trocar de coach a qualquer momento. As subscrições podem ser pausadas — sem perguntas — e a nossa equipa Coach Match volta a emparelhar-te em 48 horas."
  },
  {
    q: "Suportam atletas multi-desporto?",
    a: "Sim — o teu painel trata-te como um único atleta em várias disciplinas. Treina Vinyasa à segunda, BJJ à quarta, intervalos ao sábado e vê uma única pontuação de recuperação a guiar a tua semana."
  },
  {
    q: "Em que é que a FitConnect é diferente da Future ou Caliber?",
    a: "A Future e a Caliber emparelham-te com um coach generalista da casa. A FitConnect é um marketplace de 12 000 especialistas verificados em 10 desportos — yoga, surf, BJJ, escalada — que plataformas como a Future simplesmente não treinam. Ganhas a responsabilização humana, mais a verdadeira especialização."
  },
  {
    q: "O meu coach pode ver os meus dados de Apple Watch / Garmin / Whoop?",
    a: "Sim, com a tua permissão explícita. Puxamos HRV, sono, carga de treino e uma pontuação de recuperação verde / amarela / vermelha, e o teu coach pode usá-la para sugerir intensidade — ou recomendar um dia de descanso."
  },
  {
    q: "Há uma opção gratuita?",
    a: "Sim — o plano gratuito permite navegar, guardar 10 favoritos e ler mais de 27 000 avaliações verificadas. Só pagas quando reservas uma sessão ou entras num programa."
  }
];

export function Faqs() {
  const t = useT();
  const { lang } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);
  const list = lang === "pt" ? FAQS_PT : FAQS;

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />{" "}
          {t("faqs", "eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
          {t("faqs", "title1")}{" "}
          <span className="gradient-text">{t("faqs", "titleAccent")}</span>.
        </h2>
        <p className="mt-4 text-ink-400">{t("faqs", "subtitle")}</p>
      </div>
      <div className="mt-10 space-y-2">
        {list.map((f, i) => {
          const isOpen = open === i;
          return (
            <button
              key={f.q}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={cn(
                "group w-full text-left rounded-2xl border bg-ink-900/40 p-5 transition-all",
                isOpen
                  ? "border-brand-400/40 bg-ink-900/70"
                  : "border-ink-800 hover:border-ink-700"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-ink-100">{f.q}</h3>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 transition-transform shrink-0",
                    isOpen ? "rotate-180 text-brand-300" : "text-ink-400"
                  )}
                />
              </div>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-ink-400 text-sm leading-relaxed">{f.a}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
