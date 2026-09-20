// El campo video_muestra_url guarda o un link de YouTube, o una ruta local (/productos/...)
// subida como archivo al CMS y commiteada a GitHub — se distinguen por el formato del string.

export function esVideoYoutube(url: string): boolean {
  return /youtu\.?be/i.test(url);
}

export function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
