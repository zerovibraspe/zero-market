"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={onLogout}
      className="px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-surface-alt hover:text-ink text-left transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
