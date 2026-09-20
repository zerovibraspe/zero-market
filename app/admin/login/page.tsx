"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setCargando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo iniciar sesión");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 flex flex-col gap-4">
        <h1 className="font-display font-bold text-xl">Acceso al panel</h1>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-muted">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-dark"
          />
        </div>
        {error && <p className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="mt-2 w-full py-2.5 rounded-full bg-accent text-ink font-semibold disabled:opacity-60"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
