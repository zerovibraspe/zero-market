const encoder = new TextEncoder();
const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

function bufferABase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (let i = 0; i < bytes.byteLength; i++) binario += String.fromCharCode(bytes[i]);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function obtenerClave() {
  const secreto = process.env.ADMIN_SESSION_SECRET;
  if (!secreto) throw new Error("ADMIN_SESSION_SECRET no configurado");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function crearSesionAdmin(): Promise<string> {
  const payload = `admin.${Date.now()}`;
  const clave = await obtenerClave();
  const firma = await crypto.subtle.sign("HMAC", clave, encoder.encode(payload));
  return `${payload}.${bufferABase64Url(firma)}`;
}

export async function verificarSesionAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [scope, timestampStr, firmaRecibida] = token.split(".");
  if (scope !== "admin" || !timestampStr || !firmaRecibida) return false;

  const timestamp = Number(timestampStr);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > SIETE_DIAS_MS) return false;

  const clave = await obtenerClave();
  const firmaEsperada = await crypto.subtle.sign(
    "HMAC",
    clave,
    encoder.encode(`${scope}.${timestampStr}`),
  );
  return bufferABase64Url(firmaEsperada) === firmaRecibida;
}
