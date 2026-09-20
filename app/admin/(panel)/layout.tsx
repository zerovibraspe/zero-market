import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

const NAV = [
  { href: "/admin", label: "Tickets" },
  { href: "/admin/productos", label: "Productos" },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <aside className="w-[232px] shrink-0 border-r border-border bg-surface flex flex-col p-4">
        <span className="font-display font-bold px-2 py-3">Zero Market</span>
        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
