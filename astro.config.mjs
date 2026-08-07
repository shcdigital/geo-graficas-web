// astro.config.mjs
// El dominio se resuelve dinámicamente — para migrar de cuenta o cliente solo
// se cambia una variable, no el código:
//   1. SITE_URL      → override manual (variable de entorno / CI del proyecto)
//   2. CI_PAGES_URL  → la setea GitLab automáticamente en el job de Pages
//   3. default       → dominio actual
// base se deriva del pathname: "/" para dominio único, "/<proyecto>/" si el
// namespace es un grupo (site en subruta).

import { defineConfig } from "astro/config";

const pageUrl = process.env.SITE_URL || process.env.CI_PAGES_URL || "https://geo-graficas-web-d6a153.gitlab.io";
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