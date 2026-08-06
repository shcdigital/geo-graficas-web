// astro.config.mjs
// Target: GitLab Pages (https://pabloberthold.gitlab.io/geo-graficas-web/).
// - site: URL final pública.
// - base: "/<proyecto>/" para subpath de proyecto en GitLab Pages.

import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pabloberthold.gitlab.io/geo-graficas-web",
  base: "/geo-graficas-web/",
  integrations: [],
});