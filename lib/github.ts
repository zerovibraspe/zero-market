const GITHUB_API = "https://api.github.com";

function config() {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!repo || !token) throw new Error("GITHUB_REPO o GITHUB_TOKEN no configurados");
  return { repo, token, branch };
}

// Sube un archivo al repo vía la API de contenidos de GitHub (crea un commit).
// `ruta` es relativa a la raíz del repo, ej. "public/productos/mi-producto/1.jpg".
export async function subirArchivoAGithub(params: { ruta: string; contenido: Buffer; mensaje: string }) {
  const { repo, token, branch } = config();

  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${params.ruta}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: params.mensaje,
      content: params.contenido.toString("base64"),
      branch,
    }),
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${detalle}`);
  }
}
