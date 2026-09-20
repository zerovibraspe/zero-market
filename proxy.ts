import { NextRequest, NextResponse } from "next/server";
import { verificarSesionAdmin } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/productos/:path*", "/api/tickets/:path*"],
};

export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_session")?.value;
  const autenticado = await verificarSesionAdmin(token);

  if (!autenticado) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
