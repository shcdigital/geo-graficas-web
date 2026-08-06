// astro.config.mjs
// Target: GitLab Pages — este proyecto usa DOMINIO ÚNICO de GitLab
//   (https://geo-graficas-web-d6a153.gitlab.io) y se sirve en la RAÍZ.
//   Por eso site = dominio único y base = "/".

import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://geo-graficas-web-d6a153.gitlab.io",
  base: "/",
  integrations: [],
});