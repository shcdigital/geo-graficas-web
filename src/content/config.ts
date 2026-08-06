// src/content/config.ts
// Definido por Content/MDX Specialist. Cambiar un schema con contenido publicado
// luego requiere escala (ver agents/content-mdx-specialist.md).

import { defineCollection, z } from "astro:content";

const recursos = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().min(20),
    pubDate: z.date(),
    draft: z.boolean().default(false),
    // Clasificación del material
    nivel: z.enum(["Secundaria", "Secundaria Básica", "Secundaria Superior"]),
    ciclo: z.string(), // ej. "Ciclo Básico · 1° a 3°"
    asignatura: z.string(),
    materia: z.string(),
    // Datos del cuadernillo
    formato: z.string().default("PDF"),
    paginas: z.number().int().positive(),
    unidades: z.array(z.string()),
    incluye: z.array(z.string()),
    precio: z.string().default("Consultar"),
    precioDestacado: z.boolean().default(false),
    // Estética tipo "post" de Instagram (degradado de portada)
    coverFrom: z.string().default("#f9ce34"),
    coverTo: z.string().default("#ee2a7b"),
    emoji: z.string().default("📘"),
    destacado: z.boolean().default(false),
  }),
});

export const collections = { recursos };