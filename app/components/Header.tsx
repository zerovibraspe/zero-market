import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 sm:px-8 h-16">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zeromarket.webp" alt="Zero Market" className="h-9 w-9 rounded-lg object-contain" />
          <span className="font-display font-bold text-lg">Zero Market</span>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-accent-dark bg-accent-tint px-3 py-1.5 rounded-full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Entrega verificada
        </div>
      </div>
    </header>
  );
}
