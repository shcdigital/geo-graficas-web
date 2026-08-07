# Geo.Gráficas Web

Sitio web estático de **Geo:Gráficas** — cuadernillos de actividades y recursos
didácticos para nivel secundario (Fernanda y Cintia, Buenos Aires, Argentina).

Construido con **Astro** y publicado en **GitLab Pages**.

Sitio en vivo: <https://geo-graficas-web-d6a153.gitlab.io/>

## Características

- **Catálogo tipo feed de Instagram**: grilla de "posts" con cada cuadernillo.
- **Página de detalle** por recurso (unidades, contenido, precio por categoría).
- **Carrito + checkout**: agrega cuadernillos por categoría y dispara
  `POST /checkout` al worker de pagos (`geo-graficas-pay`), que devuelve el
  `init_point` de Mercado Pago. Páginas de resultado:
  `/checkout/success`, `/checkout/pending`, `/checkout/failure`.
- **Precios**: el build descarga los precios del worker de pagos
  (`GET /prices` → `PRICES_URL`) a `src/data/prices.json` (gitignored). Un
  cuadernillo sin categoría explícita se clasifica por precio
  (`update_prices.py`, bordes: `<= 1000` → Cat-A).
- **Contacto por WhatsApp e Instagram DM**: botones prellenados y flotante.
- Desplegado en **GitLab Pages** (job `pages`).

## Requisitos

- Node.js 18 o superior
- npm

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # fetch de precios + build estático en ./dist
npm run preview   # previsualizar el build
```

## Configuración

- **Datos del negocio**: se centralizan en [`src/data/site.ts`](src/data/site.ts)
  (`whatsapp`, `instagram`, `bio`, etc.).
- **Dominio / base**: `astro.config.mjs` resuelve el dominio dinámicamente:
  1. `SITE_URL` (override manual),
  2. `CI_PAGES_URL` (lo setea GitLab en el job de Pages),
  3. default: dominio actual.
  El `base` se deriva del pathname (raíz para dominio único, `/<proyecto>/` en
  namespace de grupo). **Para migrar de cuenta no hay que tocar código** — ver
  [`docs/MIGRACION-CUENTA.md`](docs/MIGRACION-CUENTA.md).
- **URL de precios**: `PRICES_URL` (default: el worker de pagos).

## Publicación (GitLab Pages)

`.gitlab-ci.yml` publica en `main` con **caché de npm** (keyed por
`package-lock.json`) para ahorrar minutos del ejecutor compartido.

## Estructura

```
src/
├── layouts/        Layout base (SEO/OG/accesibilidad) + carrito → /checkout
├── pages/          index, detalle por recurso, páginas de checkout
├── components/     Componentes del sitio (carrito, contacto, navbar/footer)
├── content/        Content collections (schema en config.ts) y cuadernillos
├── data/           Configuración centralizada y helpers
└── styles/         Design tokens + estilos globales
scripts/
├── fetch-prices.js  Descarga de precios (PRICES_URL → src/data/prices.json)
update_prices.py     Clasificación de cuadernillos sin categoría por precio
docs/
├── adr/                Decisiones de arquitectura
├── MIGRACION-CUENTA.md Método para migrar de cuenta/cliente (todo el sistema)
└── roadmap.md          Mejoras planificadas
```

## Roadmap

Ver [`docs/roadmap.md`](docs/roadmap.md).
