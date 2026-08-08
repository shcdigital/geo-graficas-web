// astro.config.mjs
// El dominio se resuelve dinámicamente — para migrar de cuenta o cliente solo
// se cambia una variable, no el código:
//   1. SITE_URL      → override manual (variable de entorno / CI del proyecto)
//   2. GH_PAGES_URL  → dominio base de GitHub Pages del usuario (auto)
//   3. default       → dominio actual (GitHub Pages de shcdigital)
// base se deriva del pathname: "/" para dominio único, "/<proyecto>/" si el
// sitio vive en subruta (GitHub Pages de usuario).

import { defineConfig } from "astro/config";

const pageUrl = process.env.SITE_URL || "https://shcdigital.github.io/geo-graficas-web/";
const basePath = (() => {
  try {
    const p = new URL(pageUrl).pathname.replace(/\/+$/, "");
    return p === "" ? "/" : `${p}/`;
  } catch {
    return "/";
  }
})();

export default defineConfig({
  site: pageUrl,
  base: basePath,
  integrations: [],
});