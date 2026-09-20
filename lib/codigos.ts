import { customAlphabet } from "nanoid";

// Sin caracteres ambiguos (0/O, 1/I/L) para que el comprador lo pueda leer/escribir sin confundirse.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const generarCodigoLicencia = customAlphabet(ALFABETO, 8);
