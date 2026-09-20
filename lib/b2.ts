import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.B2_BUCKET_NAME!;

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.B2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

export async function subirArchivo(
  key: string,
  body: Buffer,
  contentType: string,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function descargarArchivo(key: string): Promise<Buffer> {
  const respuesta = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );
  const stream = respuesta.Body as AsyncIterable<Uint8Array>;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function urlDescargaFirmada(key: string, expiresInSeconds = 120) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

// Para que el navegador suba el archivo maestro directo a B2 (sin pasar por una función de
// Vercel, que limita el body a 4.5 MB) — el cliente hace PUT directo a esta URL.
export async function urlSubidaFirmada(key: string, contentType: string, expiresInSeconds = 300) {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
