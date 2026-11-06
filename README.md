# 👑 CAPO Store - Lujo Urbano & Gorras Exclusivas

Plataforma e-commerce de alto rendimiento con arquitectura *Dark Brutalist / Streetwear* diseñada para la marca de gorras de lujo urbano **CAPO**.

---

## ⚡ Nuevas Capacidades Épicas (v2.2)

### 🎬 Hero Inmersivo con Video sin Opacidad
- Video cinemático de fondo en alta definición (`assets/hero-video.mp4`) en reproducción continua (`autoplay muted loop playsinline`) con **100% de nitidez (sin opacidad reducida)** y tipografía de alto impacto con sombras de contorno brutalista.

### 👑 "El Consejero del CAPO" (AI Concierge & Stylist Bot)
- Asistente interactivo flotante en esquina inferior derecha con personalidad brutalista de *Consigliere*.
- **Recomendaciones de estilo:** Sugiere gorras según la actitud del cliente (*Jefes*, *Calle*, *Oro Negro*) con tarjetas interactivas dentro del chat y botón para agregar al carrito en un clic.
- **Respuestas inteligentes:** Resuelve dudas sobre tallas universales (56-62 cm), embalaje blindado indeformable y garantía.
- **Cupón secreto VIP:** Otorga el código exclusivo `CONSEJERO15` (15% de descuento directo en el arsenal) con botón de auto-aplicación inmediata.

### 🧪 "CAPO LAB" (Configurador & Customizador a Medida)
- Estudio interactivo para forjar piezas únicas antes de comprar:
  - **Silueta Base:** *The Boss Black ($899)*, *El Patrón White ($899)*, *Urban Legend ($799)*, *Gold Standard ($999)*.
  - **Acabado de Placa / Detalle:** *Oro 24K Cepillado*, *Plata Titanio*, *Negro Mate*, *Rojo Carmín Sangre*.
  - **Grabado Láser de Monograma:** Input en vivo de hasta 3 iniciales (ej: `SV`, `CR`) renderizadas en tiempo real sobre la insignia de la gorra.
  - **Precio dinámico:** Base + $150 de grabado láser.
  - **Botón "FORJAR Y AGREGAR AL ARSENAL":** Integra la pieza personalizada al carrito con sus especificaciones exactas.

### ⭐ "Reputación del Clan" (Social Proof & Street Cred)
- Métricas auditadas: *4.9 / 5.0 calificación promedio*, *100% entregas blindadas*, *despacho en menos de 24 hrs*.
- Reseñas verificadas de compradores de lotes exclusivos en México y Latinoamérica.

### 🏎️ Optimización Extrema & PWA
- **WebP en imágenes:** Ahorro del **88.6%** de ancho de banda.
- **Soundtrack MP3 (192 kbps):** Reducción del **88%** frente al WAV original.
- **PWA instalable:** `manifest.json` y Service Worker (`sw.js`) con soporte offline Cache-First.

### 🛒 Suite de E-Commerce
- **Carrito Drawer Reactivo:** Cálculo dinámico de subtotal, envío gratis ($1,500 MXN) y persistencia en `localStorage`.
- **Motor de Cupones:** `CAPO10`, `LEGADO20`, `CONSEJERO15`, `ENVIOVIP`.
- **Despacho por WhatsApp:** Generación de mensaje de pedido estructurado para cierre de ventas instantáneo.
- **Filtros & Ordenamiento:** Filtrado por categoría y orden por precio/alfabético.

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
