# ADR-0001: Catálogo con pedido por WhatsApp/Instagram (fase MVP)

- **Estado:** Aceptado
- **Fecha:** 2026-08-05
- **Decisores:** Orchestrator (AI Workspace)

## Contexto

Geo:Gráficas vende cuadernillos digitales en Instagram con 28K seguidores. El
cliente solicitó un sitio que replique el estilo del feed y permita contacto por
WhatsApp e Instagram DM.

## Decisión

En la fase MVP el sitio es **catálogo estático** (sin backend ni pasarela) y el
pedido se concreta por WhatsApp/Instagram DM, el mismo canal donde hoy ya ocurre
la conversación comercial. Se centraliza la configuración en `src/data/site.ts`
para que el número de WhatsApp se active cuando esté disponible.

## Consecuencias

- Ventaja: cero infraestructura, despliegue trivial en GitHub Pages, sin costos
  recurrentes, alineado al flujo actual del negocio.
- Costo: la conversión queda en el chat (no hay checkout automático).
- Se documenta la fase 2 (carrito + pago digital) en `docs/roadmap.md` para
  cuando el volumen lo justifique.