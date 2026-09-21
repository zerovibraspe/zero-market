"use client";

import { useState } from "react";

const PASOS = [
  {
    titulo: "Escribe por WhatsApp",
    texto: "Elige el recurso y contáctanos con un clic.",
  },
  {
    titulo: "Paga por Yape o Plin",
    texto: "Confirmamos tu pago directo en el chat.",
  },
  {
    titulo: "Recibe tu link personal",
    texto: "Descarga tu recurso con tu código de licencia.",
  },
];

export function ComoFunciona() {
  const [paso, setPaso] = useState(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-stretch">
      {/* Mobile: tabs segmentados + texto del paso activo (evita el carrusel cortado) */}
      <div className="md:hidden">
        <div className="flex gap-2 mb-4">
          {PASOS.map((p, i) => (
            <button
              key={p.titulo}
              onClick={() => setPaso(i)}
              aria-label={p.titulo}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-full border transition-colors ${
                paso === i ? "bg-ink border-ink" : "bg-surface border-border"
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                  paso === i ? "bg-accent text-ink" : "bg-surface-alt text-muted"
                }`}
              >
                {i + 1}
              </span>
            </button>
          ))}
        </div>
        <div>
          <h3 className="font-display font-semibold mb-1">{PASOS[paso].titulo}</h3>
          <p className="text-sm text-muted">{PASOS[paso].texto}</p>
        </div>
      </div>

      {/* Desktop: lista vertical completa */}
      <div className="hidden md:flex md:flex-col gap-3">
        {PASOS.map((p, i) => (
          <button
            key={p.titulo}
            onClick={() => setPaso(i)}
            className={`text-left rounded-2xl border p-5 transition-colors ${
              paso === i
                ? "bg-surface border-accent-dark shadow-sm"
                : "bg-surface border-border hover:border-ink/20"
            }`}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                  paso === i ? "bg-accent text-ink" : "bg-surface-alt text-muted"
                }`}
              >
                {i + 1}
              </span>
              <h3 className="font-display font-semibold">{p.titulo}</h3>
            </div>
            <p className="text-sm text-muted pl-9">{p.texto}</p>
          </button>
        ))}
      </div>

      <div className="bg-surface-alt border border-border rounded-2xl p-5 sm:p-8 min-h-[240px] sm:min-h-[280px] flex items-center justify-center">
        {paso === 0 && <AnimacionWhatsapp key="wa" />}
        {paso === 1 && <AnimacionPago key="pago" />}
        {paso === 2 && <AnimacionDescarga key="descarga" />}
      </div>
    </div>
  );
}

function AnimacionWhatsapp() {
  return (
    <div className="w-full max-w-xs">
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm mb-4">
        <div className="h-16 rounded-lg bg-surface-alt mb-3" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Pack de plantillas</span>
          <span
            className="px-3 py-1.5 rounded-full bg-accent text-ink text-xs font-semibold"
            style={{ animation: "cf-press 1.6s ease-in-out infinite" }}
          >
            Comprar
          </span>
        </div>
      </div>

      <div
        className="ml-8 bg-[#25D366] text-white rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm inline-flex items-center gap-2 shadow-sm"
        style={{ animation: "cf-rise 0.5s ease-out 0.7s both" }}
      >
        Hola, quiero comprar 👋
      </div>

      <div
        className="flex items-center gap-2 mt-3 text-xs font-medium text-accent-dark"
        style={{ animation: "cf-fade 0.4s ease-out 1.3s both" }}
      >
        <CheckCircle />
        Mensaje enviado
      </div>
    </div>
  );
}

function AnimacionPago() {
  return (
    <div className="w-full max-w-xs flex items-center justify-between gap-3">
      <div className="w-24 h-40 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center justify-center gap-2 shrink-0">
        <span className="text-[10px] font-semibold text-muted uppercase">Tu Yape</span>
        <div
          className="w-8 h-8 rounded-full bg-accent-tint flex items-center justify-center"
          style={{ animation: "cf-bounce-y 1.4s ease-in-out infinite" }}
        >
          <CoinIcon />
        </div>
      </div>

      <div className="relative flex-1 h-10 overflow-hidden">
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0"
          style={{ ["--cf-slide-dist" as string]: "90px", animation: "cf-slide-x 1.8s ease-in-out infinite" }}
        >
          <CoinIcon className="w-6 h-6 text-accent-dark" />
        </div>
      </div>

      <div className="w-24 h-40 rounded-2xl bg-ink text-white shadow-sm flex flex-col items-center justify-center gap-2 shrink-0 relative overflow-hidden">
        <span className="text-[10px] font-semibold uppercase opacity-70">Zero Market</span>
        <div style={{ animation: "cf-pop 0.5s ease-out 1.5s both" }}>
          <CheckCircle light />
        </div>
        <span
          className="text-xs font-display font-bold"
          style={{ animation: "cf-fade 0.4s ease-out 1.8s both" }}
        >
          + S/ 10.00
        </span>
      </div>
    </div>
  );
}

function AnimacionDescarga() {
  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div
        className="px-4 py-2 rounded-full bg-surface border border-border text-xs font-mono mb-4 shadow-sm"
        style={{ animation: "cf-bounce-y 1.6s ease-in-out infinite" }}
      >
        zeromarket.pe/d/XK29PL
      </div>

      <div className="w-16 h-20 rounded-t-lg border-2 border-border bg-surface relative overflow-hidden mb-3">
        <div
          className="absolute bottom-0 left-0 right-0 bg-accent-tint"
          style={{ animation: "cf-fill 1.6s ease-out infinite" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <DocIcon />
        </div>
      </div>

      <div
        className="flex items-center gap-2 text-xs font-medium text-accent-dark"
        style={{ animation: "cf-fade 0.4s ease-out 1.6s both" }}
      >
        <CheckCircle />
        Descarga completa
      </div>
    </div>
  );
}

function CheckCircle({ light = false }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-4 h-4 ${light ? "text-accent" : "text-accent-dark"}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

function CoinIcon({ className = "w-4 h-4 text-accent-dark" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5c0-1.4 1.3-2 3-2s3 .8 3 2-1.3 1.7-3 2-3 .8-3 2 1.3 2 3 2 3-.6 3-2" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent-dark" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  );
}
