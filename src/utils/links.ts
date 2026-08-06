// src/utils/links.ts
// Construcción de rutas internas respetando `base` (astro.config.mjs).
// Evita el clásico 404 en GitHub Pages cuando el repo se publica en subpath.

const BASE = import.meta.env.BASE_URL; // p.ej. "/geo-graficas-web/" o "/"

/** Ruta interna absoluta con prefijo de base. path: comienza con "/". */
export function route(path: string): string {
  return `${BASE.replace(/\/$/, "")}${path}`;
}

/** Ruta interna + ancla del mismo documento. */
export function section(path: string, ancla: string): string {
  return `${route(path)}${ancla}`;
}

/** URL absoluta canónica (para SEO/OG) del sitio. */
export function canonicalUrl(): string {
  return `${import.meta.env.SITE}${BASE.replace(/^\//, "")}`;
}