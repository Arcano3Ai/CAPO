# 👑 CAPO Store - Lujo Urbano & Gorras Exclusivas

Plataforma e-commerce completa de alto rendimiento con arquitectura *Dark Brutalist / Streetwear* diseñada para la marca de gorras de lujo urbano **CAPO**.

---

## ⚡ Suite E-Commerce & Centro de Control (v3.0)

### 🎛️ Centro de Control HQ & Panel de Administración (`admin.html`)
- **Acceso Protegido:** Terminal protegida por PIN de seguridad (`CAPO2026`).
- **Métricas en Vivo (KPIs):** Ventas totales, número de órdenes, piezas despachadas y ticket promedio en Pesos Mexicanos.
- **Gestión de Órdenes & Actualización de Rastreo:**
  - Tabla con folio, fecha, datos del cliente y método de pago.
  - Selector de estatus en tiempo real (*Orden Recibida*, *Embalaje Blindado*, *En Ruta Express*, *Entregado*).
  - Enlace directo a WhatsApp para contactar al cliente con mensaje pre-llenado.
- **Control de Inventario:** Modificación del stock de cada una de las piezas del catálogo.
- **Exportación de Datos:** Descarga de todo el historial de pedidos en archivo `.csv` / Excel.
- Acceso discreto desde el pie de página mediante el enlace `HQ ACCESS`.

### 🚀 Despliegue Automatizado a GitHub Pages (CI/CD)
- Flujo de trabajo en `.github/workflows/deploy.yml` configurado para desplegar automáticamente en cada push a la rama `main`.
- URL de producción: **`https://arcano3ai.github.io/CAPO/`**

### 🗄️ Data Layer & Catálogo Centralizado (`data/products.json`)
- Base de datos estructurada con 8 productos oficiales:
  - **Línea Jefes:** *The Boss Black ($899)*, *El Patrón White ($899)*.
  - **Línea Calle:** *Urban Legend ($799)*, *Concrete King ($799)*.
  - **Oro Negro:** *Gold Standard ($999)*, *Supremacía Silver ($949)*.
  - **Arsenal Accesorios:** *Caja de Viaje Blindada ($499)*, *Kit de Cuidado & Limpieza ($349)*.
- SKUs únicos, inventario real por lote, badges de urgencia, galería de múltiples ángulos y especificaciones técnicas completas.

### ❤️ Lista de Deseos (Wishlist) con Persistencia
- Botón de corazón reactivo en cada artículo para guardar piezas de interés.
- Contador dinámico en el Navbar (`wishlist-badge`) y drawer lateral deslizable de favoritos (`#wishlist-drawer`) con acción de mover directo al carrito.

### 🔍 Product Detail Page (PDP) Avanzada
- Modal de producto con **galería de miniaturas interactiva** y zoom al pasar el cursor.
- **Indicador de stock en tiempo real:** *⚠️ SÓLO QUEDAN X PIEZAS EN ESTE LOTE*.
- **Pestañas técnicas:** *Especificaciones de confección*, *Guía de limpieza y cuidado del algodón pesado* y *Detalles del embalaje blindado*.

### 🛰️ Radar de Rastreo de Envíos en Tiempo Real (`#rastreo`)
- Módulo para rastrear órdenes mediante folio (ej. `#CAPO-948192`) o correo electrónico con línea de tiempo gráfica animada.

### 🧾 Generador & Descarga de Recibo Oficial Imprimible
- Modal de ticket oficial de compra generado al confirmar cualquier orden, listo para imprimir o guardar como PDF (`window.print()`).

### 📍 Calculador de Envíos por Código Postal (CP)
- Verificación instantánea de cobertura aérea y express para cualquier código postal de México.

### 🔔 Notificaciones de Ventas en Vivo (Social Proof Ticker)
- Ticker flotante discreto que muestra actividad de compra reciente en tiempo real.

### 🎬 Hero Cinemático con Video sin Opacidad
- Video de fondo en alta resolución (`assets/hero-video.mp4`) en reproducción continua al 100% de nitidez, sin opacidad ni filtros oscuros.

### 👑 El Consejero del CAPO (AI Concierge Bot)
- Asesor privado flotante con recomendaciones de estilo, respuestas a dudas frecuentes y entrega del cupón secreto `CONSEJERO15`.

### 🧪 CAPO Lab (Personalizador de Monogramas)
- Estudio interactivo para forjar gorras personalizadas con monograma láser en placa metálica (oro, plata, negro, carmín).

---

## 📦 Estructura del Repositorio

```
CAPO/
├── .github/
│   └── workflows/
│       └── deploy.yml  # Pipeline CI/CD para GitHub Pages
├── data/
│   └── products.json   # Catálogo estructurado con SKUs, stock y specs
├── manifest.json       # Manifiesto PWA para instalación móvil
├── sw.js               # Service Worker para caché y modo offline
├── index.html          # Tienda principal con Schema.org JSON-LD
├── admin.html          # Panel de Administración HQ protegido por PIN
├── styles.css          # Sistema de diseño brutalista y responsive
├── script.js           # Motor de estado, carrito, wishlist, PDP y bot
├── assets/             # Video (MP4), audio (MP3/WAV) e imágenes (WebP/PNG)
└── README.md           # Documentación técnica completa
```

---

## 💻 Ejecución en Local

```bash
# Servidor local en puerto 3000:
python -m http.server 3000

# O con Node.js:
npx serve .
```

- **Tienda Principal:** `http://localhost:3000`
- **Panel HQ:** `http://localhost:3000/admin.html` *(PIN: `CAPO2026`)*

---

## 🔗 Repositorio Oficial

- **URL del Repositorio:** [https://github.com/Arcano3Ai/CAPO](https://github.com/Arcano3Ai/CAPO)
- **URL en Producción (GitHub Pages):** [https://arcano3ai.github.io/CAPO/](https://arcano3ai.github.io/CAPO/)
- **Rama:** `main`
