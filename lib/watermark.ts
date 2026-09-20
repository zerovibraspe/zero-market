import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type Esquina = "tl" | "tr" | "bl" | "br";

export async function generarPdfPersonalizado(params: {
  archivoOriginal: Uint8Array;
  nombreComprador: string;
  codigoLicencia: string;
  autorNombre?: string | null;
  esquina: Esquina;
}): Promise<Uint8Array> {
  const { archivoOriginal, nombreComprador, codigoLicencia, autorNombre, esquina } = params;

  const pdfDoc = await PDFDocument.load(archivoOriginal);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const texto = `${nombreComprador} · ${codigoLicencia}`;
  const tamano = 9;
  const margen = 24;

  for (const pagina of pdfDoc.getPages()) {
    const { width, height } = pagina.getSize();
    const anchoTexto = font.widthOfTextAtSize(texto, tamano);
    const x = esquina === "tr" || esquina === "br" ? width - anchoTexto - margen : margen;
    const y = esquina === "tl" || esquina === "tr" ? height - margen - tamano : margen;

    pagina.drawText(texto, { x, y, size: tamano, font, color: rgb(0.55, 0.55, 0.55), opacity: 0.6 });
  }

  pdfDoc.setSubject(`codigo_licencia:${codigoLicencia}`);
  pdfDoc.setKeywords([codigoLicencia, nombreComprador]);
  if (autorNombre) pdfDoc.setAuthor(autorNombre);

  return pdfDoc.save();
}

// Archivos que no requieren marca de agua (producto.requiereWatermark = false) no se re-procesan:
// incrustar metadata en video/zip requiere herramientas específicas por formato (ffmpeg, librería
// de zip) que exceden el alcance del MVP — ver "Fuera de alcance" en CLAUDE.md. El código de
// licencia queda igual asociado al ticket en la base de datos, que es lo que valida /descargar/[codigo].
export async function personalizarArchivo(params: {
  archivoOriginal: Uint8Array;
  nombreComprador: string;
  codigoLicencia: string;
  autorNombre?: string | null;
  esquina: Esquina | null;
}): Promise<Uint8Array> {
  if (params.esquina) {
    return generarPdfPersonalizado({
      archivoOriginal: params.archivoOriginal,
      nombreComprador: params.nombreComprador,
      codigoLicencia: params.codigoLicencia,
      autorNombre: params.autorNombre,
      esquina: params.esquina,
    });
  }
  return params.archivoOriginal;
}
