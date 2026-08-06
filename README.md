# Geo.Gráficas Web

Sitio web estático de **Geo:Gráficas** — cuadernillos de actividades y recursos
didácticos para nivel secundario (Fernanda y Cintia, Buenos Aires, Argentina).

Construido con **Astro** y publicado en **GitLab Pages** siguiendo la plataforma
de agentes del [AI Workspace](../ai-workspace).

Sitio en vivo: <https://pabloberthold.gitlab.io/geo-graficas-web/>

## Características

- **Catálogo tipo feed de Instagram**: grilla de "posts" con cada cuadernillo.
- **Página de detalle** por recurso (unidades, contenido, precio).
- **Contacto por WhatsApp e Instagram DM**: botones prellenados y flotante.
- Estética acorde al perfil real `@geo.graficas` (gradientes, estilo visual del feed).
- Desplegado en **GitLab Pages**.

## Requisitos

- Node.js 18 o superior
- npm

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build estático en ./dist
npm run preview   # previsualizar el build
```

## Configuración de contacto

Todo se centraliza en [`src/data/site.ts`](src/data/site.ts):

- `whatsapp`: número destino (solo dígitos con código de país). Si queda vacío,
  los botones de WhatsApp caen automáticamente al DM de Instagram.
- `instagram`, `instagramDmUrl`, `tagline`, `bio`, `email`: datos del negocio.

Al completar el número de WhatsApp se activan los CTAs de WhatsApp en todo el sitio.

## Publicación (GitLab Pages)

El pipeline está en `.gitlab-ci.yml` y publica el sitio en `main`. La
configuración `site`/`base` y la UI del álbum están en `astro.config.mjs`.

## Estructura

```
src/
├── layouts/        Layout base (SEO/OG/accesibilidad)
├── pages/          Rutas: index + detalle de cada recurso
├── components/ui/  Componentes del sitio
├── content/        Content collections (schema en config.ts) y cuadernillos
├── data/           Configuración centralizada y helpers de contacto
└── styles/         Design tokens + estilos globales
docs/
├── adr/            Decisiones de arquitectura
└── roadmap.md      Mejoras planificadas
```

## Roadmap

Ver [`docs/roadmap.md`](docs/roadmap.md) — incluye la tienda con carrito y pago
digital planificada como fase futura.