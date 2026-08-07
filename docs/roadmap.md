# Roadmap

## Fase 1 — MVP (actual)

- [x] Sitio catálogo estático con estética de feed de Instagram.
- [x] Contacto por WhatsApp e Instagram DM (prellenado por material).
- [x] Publicación en GitLab Pages con pipeline automático.
- [x] Filtro por materias con emojis (lista fija en `src/data/materias.ts`
      + materias publicadas).
- [ ] Completar número real de WhatsApp en `src/data/site.ts`.
- [ ] Cargar los 137 recursos reales del feed como content collection.
- [ ] Portadas reales de los cuadernillos (PDF/portada) reemplazando las
      portadas generadas por gradiente.

## Fase 2 — Venta digital (idea guardada, a implementar en el futuro)

Opción 2 acordada: catálogo + **carrito y pago digital**.

- [x] Carrito de compra en el cliente (multi-material), con ajuste de
      cantidades y vaciar carrito.
- [x] Pasarela de pago integrada (**Mercado Pago**).
- [ ] Entrega automática del PDF por email/descarga tras el pago.
- [ ] Requiere evaluación de arquitectura: la entrega digital necesita un
      servidor/lambda o enlace firmado; se documentará en un ADR antes de empezar.

## Fase 3 — Crecimiento

- Newsletter o canal de aviso de nuevos materiales.
- Buscador y filtros avanzados (nivel, curso, ciclo).
- Testimonios de docentes clientes.