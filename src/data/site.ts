/* src/data/site.ts
 * Configuración centralizada del sitio y canales de contacto.
 * Editar acá (único lugar) los datos reales del negocio.
 */

export const SITE = {
  nombre: "Geo.Gráficas",
  dominio: "geo.graficas",
  tagline: "Cuadernillos de actividades y recursos didácticos",
  bio: "Fernanda y Cintia · Profes de secundaria (Bs. As.) · Material áulico simple, actualizado y completo.",
  humor: "Hecho por docentes, para docentes.",
  email: "geo.graficasdigital@gmail.com",
  instagram: "geo.graficas",
  instagramUrl: "https://instagram.com/geo.graficas",
  // Instagram DM directo (no requiere estar logueado en el sitio)
  instagramDmUrl: "https://ig.me/m/geo.graficas",
  // Número de WhatsApp con código de país, SOLO dígitos. Ej: "5491122334455"
  // Dejar "" para ocultar WhatsApp (cae a DM de Instagram).
  whatsapp: "541155156610",
} as const;