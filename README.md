# 👑 CAPO Store - Lujo Urbano & Gorras Exclusivas

Plataforma e-commerce completa de alto rendimiento con arquitectura *Dark Brutalist / Streetwear* diseñada para la marca de gorras de lujo urbano **CAPO**.

---

## ⚡ Suite E-Commerce de Nivel Producción (v2.5)

### 🗄️ Data Layer & Catálogo Centralizado (`data/products.json`)
- Base de datos estructurada con 8 productos oficiales:
  - **Línea Jefes:** *The Boss Black ($899)*, *El Patrón White ($899)*.
  - **Línea Calle:** *Urban Legend ($799)*, *Concrete King ($799)*.
  - **Oro Negro:** *Gold Standard ($999)*, *Supremacía Silver ($949)*.
  - **Arsenal Accesorios:** *Caja de Viaje Blindada Estuche Rígido ($499)*, *Kit de Cuidado & Limpieza Capo ($349)*.
- Esquema formal con SKUs, stock real por lote, badges de urgencia, galería de múltiples ángulos y especificaciones técnicas completas.

### ❤️ Lista de Deseos (Wishlist) con Persistencia
- Botón de corazón reactivo en cada artículo para guardar piezas de interés.
- Contador dinámico en el Navbar (`wishlist-badge`) y drawer lateral deslizable de favoritos (`#wishlist-drawer`) con acción de mover directo al carrito.

### 🔍 Product Detail Page (PDP) Avanzada
- Modal de producto con **galería de miniaturas interactiva** y zoom al pasar el cursor.
- **Indicador de stock en tiempo real:** *⚠️ SÓLO QUEDAN X PIEZAS EN ESTE LOTE*.
- **Pestañas técnicas:** *Especificaciones de confección*, *Guía de limpieza y cuidado del algodón pesado* y *Detalles del embalaje blindado*.

### 🛰️ Radar de Rastreo de Envíos en Tiempo Real (`#rastreo`)
- Módulo para rastrear órdenes mediante folio (ej. `#CAPO-948192`) o correo electrónico.
- **Línea de tiempo gráfica interactiva:**
  1. *Orden Recibida & Autenticada*
  2. *Embalaje en Caja Rígida Blindada*
  3. *En Ruta Express (DHL/FedEx)*
  4. *Entrega Final con Firma Requerida*

### 🧾 Generador & Descarga de Recibo Oficial Imprimible
- Modal de ticket oficial de compra generado al confirmar cualquier orden.
- Formato imprimible y exportable a PDF con folio seriado, fecha, cliente, desglose contable, sello de autenticidad y código de garantía.

### 📍 Calculador de Envíos por Código Postal (CP)
- Verificación instantánea de cobertura aérea y express para cualquier código postal de México.

### 🔔 Notificaciones de Ventas en Vivo (Social Proof Ticker)
- Ticker flotante discreto que muestra actividad de compra reciente en tiempo real (*"Roberto V. de CDMX adquirió THE BOSS BLACK hace 2 min"*).

### 🎬 Hero Cinemático con Video sin Opacidad
- Video de fondo en alta resolución (`assets/hero-video.mp4`) en reproducción continua al 100% de nitidez, sin opacidad ni filtros oscuros.

### 👑 El Consejero del CAPO (AI Concierge Bot)
- Asesor privado flotante con recomendaciones de estilo, respuestas a dudas frecuentes y entrega del cupón secreto `CONSEJERO15`.

### 🧪 CAPO Lab (Personalizador de Monogramas)
- Estudio interactivo para forjar gorras personalizadas con monograma láser en placa metálica (oro, plata, negro, carmín).

---

## 📦 Estructura del Proyecto

```
CAPO/
├── .gitignore          # Exclusiones de control de versiones
├── data/
│   └── products.json   # Catálogo estructurado con SKUs, stock y specs
├── manifest.json       # Manifiesto PWA para instalación móvil
├── sw.js               # Service Worker para caché y modo offline
├── index.html          # HTML5 semántico con Schema.org JSON-LD
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

Acceso: **`http://localhost:3000`**

---

## 🔗 Repositorio Oficial

- **URL:** [https://github.com/Arcano3Ai/CAPO](https://github.com/Arcano3Ai/CAPO)
- **Rama:** `main`
