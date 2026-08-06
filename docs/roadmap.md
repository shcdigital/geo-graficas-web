# Roadmap

## Fase 1 — MVP (actual)

- [x] Sitio catálogo estático con estética de feed de Instagram.
- [x] Contacto por WhatsApp e Instagram DM (prellenado por material).
- [x] Publicación en GitHub Pages con pipeline automático.
- [ ] Completar número real de WhatsApp en `src/data/site.ts`.
- [ ] Cargar los 137 recursos reales del feed como content collection.
- [ ] Portadas reales de los cuadernillos (PDF/portada) reemplazando las
      portadas generadas por gradiente.

## Fase 2 — Venta digital (idea guardada, a implementar en el futuro)

Opción 2 acordada: catálogo + **carrito y pago digital**.

- Carrito de compra en el cliente (multi-material).
- Pasarela de pago integrada (**Mercado Pago** recomendado por mercado
  argentino; Stripe como alternativa).
- Entrega automática del PDF por email/descarga tras el pago.
- Requiere evaluación de arquitectura: la entrega digital necesita un
  servidor/lambda o enlace firmado; se documentará en un ADR antes de empezar.

## Fase 3 — Crecimiento

- Newsletter o canal de aviso de nuevos materiales.
- Buscador/filtros por materia, nivel y curso.
- Testimonios de docentes clientes.