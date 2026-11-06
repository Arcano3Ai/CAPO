# 👑 CAPO Store - Lujo Urbano & Gorras Exclusivas

Plataforma e-commerce de alto rendimiento con arquitectura *Dark Brutalist / Streetwear* diseñada para la marca de gorras de lujo urbano **CAPO**.

---

## ⚡ Novedades y Características de Nivel Producción (v2.1)

### 🏎️ Optimización Extrema de Rendimiento
- **Imágenes en formato WebP:** Reducción del **88.6%** en peso de imágenes (de 17 MB a 2 MB) con retención de calidad visual superior.
- **Soundtrack optimizado en MP3:** Conversión con `ffmpeg` de WAV (15.7 MB) a MP3 (1.9 MB, 192 kbps estéreo), reduciendo un **88%** de ancho de banda con fallback automático.
- **PWA (Progressive Web App):** Soporta instalación como aplicación móvil/escritorio (`manifest.json`) y Service Worker (`sw.js`) con estrategia Cache-First para navegación offline ultra-rápida.

### 🛒 Suite de E-Commerce Reactiva
- **Carrito de Compras (Cart Drawer):**
  - Panel deslizante con apertura instantánea.
  - Contador reactivo en tiempo real con animación *bump*.
  - Controles de cantidad (`+` / `-`), auto-eliminación en cero y vaciado de arsenal.
  - Barra de progreso dinámica para **Envío Gratis** (umbral de $1,500 MXN).
  - Persistencia total en `localStorage`.
- **Motor de Cupones Promocionales:**
  - `CAPO10`: 10% de descuento en la orden.
  - `LEGADO20`: 20% de descuento exclusivo.
  - `ENVIOVIP`: Envío gratis inmediato sin importar el monto.
  - Desglose financiero transparente en el resumen del carrito.

### 📲 Despacho Directo por WhatsApp & Checkout Dual
- **WhatsApp Checkout:** Genera automáticamente la orden formateada con folio, cliente, artículos, subtotal, descuento, envío y total a pagar para atención y cierre de ventas directo vía WhatsApp.
- **Checkout Tradicional Simulado:** Formulario de datos con validaciones, métodos de pago (*Tarjeta/Stripe*, *SPEI*, *Contra entrega*) y generación de folio único (`#CAPO-XXXXXX`).

### 🎛️ Motor de Catálogo con Filtros y Ordenamiento
- **Filtros por Línea:** `TODAS` | `LÍNEA JEFES` | `LÍNEA CALLE` | `ORO NEGRO`.
- **Ordenamiento en Tiempo Real:** Por piezas destacadas, precio (menor a mayor / mayor a menor) y alfabético (A-Z).
- **Contador dinámico de existencias:** Actualiza la cantidad de piezas mostradas en el DOM en vivo.

### 🔍 Buscador & Modales
- **Buscador predictivo en Navbar:** Filtra al escribir por nombre de modelo, categoría o descripción.
- **Vista Rápida (Quick View):** Modal de alta resolución con especificaciones técnicas de corona, broche, ajuste y selector de cantidad.
- **Lookbook y Políticas:** Modales para Términos, Privacidad, Envíos y Certificado de Autenticidad.
- **Notificaciones Toast:** Feedback visual brutalista inmediato en cada interacción.
- **Audio Player Ambiental:** Widget flotante en esquina inferior con ecualizador gráfico interactivo.

### 🌐 SEO Semántico y Rich Snippets
- Metadatos **Open Graph** y **Twitter Cards** para compartir enlaces con preview premium en WhatsApp, Telegram, Twitter y Facebook.
- Marcado estructurado **Schema.org (JSON-LD)** de tipo `ClothingStore` y catálogo `OfferCatalog` con precios en MXN para Google Search.

---

## 📦 Estructura del Repositorio

```
CAPO/
├── .gitignore          # Reglas de exclusión de Git
├── manifest.json       # Manifiesto PWA para instalación móvil
├── sw.js               # Service Worker para caché y soporte offline
├── index.html          # HTML5 semántico con Schema.org y metatags SEO
├── styles.css          # Sistema de diseño brutalista y animaciones
├── script.js           # Motor de estado, carrito, cupones, WhatsApp y filtros
├── assets/             # Mockups, audio (MP3/WAV) y fotos optimizadas (WebP/PNG)
└── README.md           # Documentación completa del proyecto
```

---

## 💻 Ejecución en Local

La tienda se puede ejecutar mediante cualquier servidor HTTP local:

```bash
# Con Python (puerto 3000):
python -m http.server 3000

# O con Node.js:
npx serve .
```

Acceso local: **`http://localhost:3000`**

---

## 🔗 Repositorio Oficial

- **URL:** [https://github.com/Arcano3Ai/CAPO](https://github.com/Arcano3Ai/CAPO)
- **Rama:** `main`
