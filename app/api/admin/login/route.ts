import { NextRequest, NextResponse } from "next/server";
import { crearSesionAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { usuario, password } = await req.json();

  const credencialesValidas =
    !!process.env.ADMIN_USERNAME &&
    !!process.env.ADMIN_PASSWORD &&
    usuario === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  if (!credencialesValidas) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const token = await crearSesionAdmin();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
