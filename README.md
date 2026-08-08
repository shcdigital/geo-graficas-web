# Geo.Gráficas Web

Sitio web estático de **Geo:Gráficas** — cuadernillos de actividades y recursos
didácticos para nivel secundario (Fernanda y Cintia, Buenos Aires, Argentina).

Construido con **Astro** y publicado en **GitHub Pages**.

Sitio en vivo: <https://shcdigital.github.io/geo-graficas-web/>

## Características

- **Catálogo tipo feed de Instagram**: grilla de "posts" con cada cuadernillo.
- **Filtro por materias**: barra de chips (emoji + materia) que filtra la
  grilla dinámicamente sin recargar. Las materias se definen en
  [`src/data/materias.json`](src/data/materias.json) (fuente única, siempre
  visibles aunque no haya publicaciones) y se suman automáticamente las
  materias publicadas que no estén en esa lista.
- **Página de detalle** por recurso (unidades, contenido, precio por categoría).
- **Carrito + checkout**: agrega cuadernillos por categoría, permite ajustar
  cantidades y **vaciar el carrito**, y dispara `POST /checkout` al worker de
  pagos (`geo-graficas-pay`), que devuelve el `init_point` de Mercado Pago.
  Páginas de resultado: `/checkout/success`, `/checkout/pending`,
  `/checkout/failure`.
- **Precios centralizados**: fuente única en
  [`src/data/prices.json`](src/data/prices.json) (formato `{"categories": {...}}`,
  commiteado). El sitio la usa en build; el panel de admin la edita vía GitHub
  API y el worker de pagos la baja del raw público antes de cada deploy.
- **Contacto por WhatsApp e Instagram DM**: botones prellenados y flotante.
- Desplegado en **GitHub Pages** (workflow `.github/workflows/pages.yml`).

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

## Configuración

- **Datos del negocio**: se centralizan en [`src/data/site.ts`](src/data/site.ts)
  (`whatsapp`, `instagram`, `bio`, etc.).
- **Materias del filtro**: lista fija en
  [`src/data/materias.json`](src/data/materias.json) (formato
  `{"materias": [{"materia": "...", "emoji": "..."}]}`, fuente única). Para
  agregar o cambiar una materia/emoji, editá esa lista (el filtro la muestra
  siempre y el panel de admin la usa en su desplegable).
- **Precios**: fuente única en [`src/data/prices.json`](src/data/prices.json)
  (`{"categories": {"Cat-A": 1000, ...}}`). Los cuadernillos referencian su
  categoría por precio (bordes: `<= 1000` → Cat-A, ver `update_prices.py`).
- **Dominio / base**: `astro.config.mjs` resuelve el dominio dinámicamente:
  1. `SITE_URL` (override manual, var de Actions),
  2. default: `https://shcdigital.github.io/geo-graficas-web/`.
  El `base` se deriva del pathname (`/geo-graficas-web/` en GitHub Pages).
  **Para migrar de cuenta no hay que tocar código** — ver
  [`docs/MIGRACION-CUENTA.md`](docs/MIGRACION-CUENTA.md).

## Publicación (GitHub Pages)

`.github/workflows/pages.yml` publica en `main` (build Astro + `actions/deploy-pages`)
con **caché de npm** (keyed por `package-lock.json`).

## Estructura

```
src/
├── layouts/        Layout base (SEO/OG/accesibilidad) + carrito → /checkout
├── pages/          index, detalle por recurso, páginas de checkout
├── components/     Componentes del sitio (carrito, contacto, navbar/footer)
├── content/        Content collections (schema en config.ts) y cuadernillos
├── data/           Configuración centralizada (site, materias, precios) y helpers
└── styles/         Design tokens + estilos globales
update_prices.py    Clasificación de cuadernillos sin categoría por precio
docs/
├── adr/                Decisiones de arquitectura
├── MIGRACION-CUENTA.md Método para migrar de cuenta/cliente (todo el sistema)
├── PENDIENTES.md       Deudas técnicas y pendientes de seguridad
└── roadmap.md          Mejoras planificadas
```

## Roadmap

Ver [`docs/roadmap.md`](docs/roadmap.md).
