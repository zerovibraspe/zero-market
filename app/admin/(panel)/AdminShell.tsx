"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

const NAV = [
  { href: "/admin", label: "Tickets" },
  { href: "/admin/productos", label: "Productos" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row flex-1 min-h-0">
      <header className="sm:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-surface shrink-0">
        <span className="font-display font-bold">Zero Market</span>
        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          className="p-2 -mr-2 text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {abierto && (
        <div className="sm:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setAbierto(false)} />
      )}

      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 w-64 sm:w-[232px] shrink-0 border-r border-border bg-surface flex flex-col p-4 transition-transform sm:translate-x-0 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-3">
          <span className="font-display font-bold">Zero Market</span>
          <button onClick={() => setAbierto(false)} aria-label="Cerrar menú" className="sm:hidden p-1 text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAbierto(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-surface-alt hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <span className="px-3 py-2.5 rounded-xl text-sm font-medium text-muted/50 cursor-not-allowed" title="Próximamente">
            Analítica
          </span>
        </nav>
        <LogoutButton />
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
