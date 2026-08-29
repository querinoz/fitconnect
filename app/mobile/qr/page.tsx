"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { FitConnectLogo } from "@/components/brand/fitconnect-logo";
import { Copy, Smartphone, Wifi } from "lucide-react";

type QrEntry = {
  url: string;
  isLocalhost: boolean;
  dataUrl: string;
};

const QR_OPTS = {
  margin: 2,
  width: 280,
  color: { dark: "#C8FF00", light: "#090402" }
} as const;

async function makeQr(url: string) {
  return QRCode.toDataURL(url, QR_OPTS);
}

export default function MobileQrPage() {
  const [qrs, setQrs] = useState<QrEntry[]>([]);
  const [path, setPath] = useState("/mobile");
  const [manualIp, setManualIp] = useState("");
  const [manualQr, setManualQr] = useState<string | null>(null);
  const [port, setPort] = useState("3001");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const buildUrl = useCallback(
    (host: string) => `http://${host}:${port}${path}`,
    [path, port]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/mobile-qr?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error("Falha ao carregar QR codes");
        const data = (await res.json()) as { qrs: QrEntry[]; port: number };
        if (cancelled) return;
        setQrs(data.qrs);
        setPort(String(data.port || 3001));
        const lan = data.qrs.find((q) => !q.isLocalhost);
        if (lan) {
          const ip = new URL(lan.url).hostname;
          setManualIp(ip);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [path]);

  useEffect(() => {
    if (!manualIp.trim()) {
      setManualQr(null);
      return;
    }
    let cancelled = false;
    const url = buildUrl(manualIp.trim());
    makeQr(url)
      .then((dataUrl) => {
        if (!cancelled) setManualQr(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setManualQr(null);
      });
    return () => {
      cancelled = true;
    };
  }, [manualIp, buildUrl]);

  const manualUrl = manualIp.trim() ? buildUrl(manualIp.trim()) : "";
  const lanQrs = qrs.filter((q) => !q.isLocalhost);

  async function copyUrl() {
    if (!manualUrl) return;
    await navigator.clipboard.writeText(manualUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-dvh bg-ink-950 text-ink-100 px-5 py-8">
      <div className="mx-auto max-w-md">
        <header className="flex items-center justify-between mb-8">
          <FitConnectLogo variant="full" href="/" />
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-glass-border bg-glass-md text-volt-500">
            <Smartphone className="h-5 w-5" aria-hidden />
          </span>
        </header>

        <h1 className="font-display text-3xl font-bold">Abrir no telemóvel</h1>
        <p className="mt-2 text-sm text-ink-400 leading-relaxed">
          1. Telefone na mesma Wi‑Fi que o PC<br />
          2. Confirma o IP abaixo (vê no terminal: <strong>Network:</strong>)<br />
          3. Escaneia o QR ou copia o URL
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { label: "Mobile app", value: "/mobile" },
            { label: "Feed", value: "/feed" },
            { label: "Sign in", value: "/signin" }
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPath(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                path === opt.value
                  ? "border-volt-500/50 bg-glass-volt text-volt-300"
                  : "border-glass-border bg-glass-md text-ink-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-glass border border-glass-border bg-glass-md p-4 space-y-3">
          <label className="block text-xs uppercase tracking-[0.12em] text-ink-500">
            IP do teu PC (ex: 192.168.1.76)
          </label>
          <div className="flex gap-2">
            <input
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              placeholder="192.168.1.76"
              className="flex-1 rounded-xl border border-glass-border bg-ink-950 px-3 h-11 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-volt-500/40"
            />
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-20 rounded-xl border border-glass-border bg-ink-950 px-3 h-11 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-volt-500/40"
              aria-label="Porta"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-6 text-coral-500 text-sm">{error}</p>
        ) : null}

        {manualQr && manualUrl ? (
          <section className="mt-6 rounded-glass border border-volt-500/30 bg-glass-volt p-5 text-center">
            <img
              src={manualQr}
              alt={`QR code para ${manualUrl}`}
              width={280}
              height={280}
              className="mx-auto rounded-xl"
            />
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-volt-300">
              Escaneia com a câmara do telemóvel
            </p>
            <a
              href={manualUrl}
              className="mt-2 block text-volt-400 font-mono text-sm break-all hover:underline"
            >
              {manualUrl}
            </a>
            <button
              type="button"
              onClick={copyUrl}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-xs text-ink-200 hover:bg-glass-md"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copiado!" : "Copiar URL"}
            </button>
          </section>
        ) : (
          <div className="mt-6 rounded-glass border border-glass-border bg-glass-md p-6 text-center">
            <Wifi className="h-8 w-8 mx-auto text-ink-500 mb-3" aria-hidden />
            <p className="text-sm text-ink-300">
              Introduz o IP que aparece no terminal quando corres{" "}
              <code className="text-volt-400">npm run dev</code>
            </p>
            <code className="mt-3 block text-volt-400 text-sm">
              Network: http://192.168.x.x:3001
            </code>
          </div>
        )}

        {lanQrs.length > 1 ? (
          <div className="mt-8 space-y-4">
            <p className="text-xs text-ink-500 uppercase tracking-widest">
              Outros IPs detetados
            </p>
            {lanQrs
              .filter((q) => new URL(q.url).hostname !== manualIp.trim())
              .map((qr) => (
                <a
                  key={qr.url}
                  href={qr.url}
                  className="block rounded-xl border border-glass-border p-3 text-sm font-mono text-ink-300 hover:border-volt-500/30"
                >
                  {qr.url}
                </a>
              ))}
          </div>
        ) : null}

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-ink-400 leading-relaxed">
          <strong className="text-amber-300">Não abre no telemóvel?</strong>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            <li>PC e telefone na mesma Wi‑Fi</li>
            <li>Reinicia o dev server após atualizar: <code>npm run dev</code></li>
            <li>No Windows, permite a porta 3001 no Firewall se pedido</li>
            <li>Testa no browser do telemóvel: cola o URL manualmente</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-sm">
          <Link href="/mobile" className="text-volt-400 hover:underline">
            → Abrir mobile app neste PC
          </Link>
          <Link href="/open-mobile.html" className="text-ink-400 hover:underline text-xs">
            → Página QR estática (fallback)
          </Link>
        </div>
      </div>
    </main>
  );
}
