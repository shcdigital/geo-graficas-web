// src/data/contacto.ts
// Helpers de contacto: abstraen WhatsApp e Instagram DM.
// Si no hay número de WhatsApp configurado, los CTAs caen a Instagram DM.
import { SITE } from "./site";

const numeroOk = (SITE.whatsapp || "").replace(/\D/g, "");

export function whatsappHabilitado(): boolean {
  return numeroOk.length > 0;
}

export function whatsappUrl(producto?: string): string | null {
  if (!whatsappHabilitado()) return null;
  const texto = producto
    ? `Hola ${SITE.nombre} 👋 Me interesa el material "${producto}".`
    : `Hola ${SITE.nombre} 👋 Quiero consultar por el catálogo de cuadernillos.`;
  return `https://wa.me/${numeroOk}?text=${encodeURIComponent(texto)}`;
}

export function instagramDmUrl(): string {
  return `https://ig.me/m/${SITE.instagram}`;
}

export function instagramPerfilUrl(): string {
  return `https://instagram.com/${SITE.instagram}`;
}

/** Devuelve la URL de contacto primaria para un material dado. */
export function contactoUrl(producto?: string): string {
  return whatsappUrl(producto) ?? instagramDmUrl();
}