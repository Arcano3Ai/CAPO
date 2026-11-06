# 👑 CAPO Store - Lujo Urbano & Gorras Exclusivas

Tienda e-commerce de estilo *Dark Brutalist / Streetwear* diseñada para la marca de gorras de lujo urbano **CAPO**.

---

## 🚀 Características Implementadas

- **Carrito de Compras Reactivo (Cart Drawer):**
  - Panel lateral deslizante con apertura fluida.
  - Contador dinámico en tiempo real (badge interactivo con animación *bump*).
  - Controles de cantidad (`+` / `-`), eliminación individual y botón para vaciar el arsenal.
  - Cálculo automático de subtotal, costo de envío y total.
  - Barra de progreso dinámica para **Envío Gratis** (a partir de $1,500 MXN).
  - Persistencia del estado del carrito en `localStorage`.

- **Vista Rápida de Producto (Quick View Modal):**
  - Modal interactivo con fotografía detallada, especificaciones técnicas de la gorra, precio y selector de cantidad integrado.

- **Flujo de Checkout Simulado:**
  - Formulario de datos de entrega y selección de método de pago (Tarjeta / Transferencia SPEI / Pago contra entrega).
  - Pantalla de confirmación con generación de folio de orden único (`#CAPO-XXXXXX`).

- **Buscador en Tiempo Real en Navbar:**
  - Búsqueda instantánea de modelos y colecciones con filtrado en vivo.

- **Sistema de Feedback Instantáneo (Toast Notifications):**
  - Notificaciones flotantes estilo brutalista para confirmar adición o eliminación de productos.

- **Audio Player Ambiental Flotante:**
  - Widget flotante con ecualizador animado y control de reproducción (`assets/CAPOCANCION.wav`).

- **Lookbook y Políticas:**
  - Modales para Términos y Condiciones, Aviso de Privacidad, Envíos y Certificado de Autenticidad.
  - Formulario de suscripción a Newsletter con validación y feedback visual.

- **Rendimiento y Microinteracciones:**
  - Cursor personalizado ultra-fluido (60 FPS vía `requestAnimationFrame`).
  - Accesibilidad con soporte para navegación y cierre mediante tecla `Escape`.

---

## 📦 Estructura del Proyecto

```
CAPO/
├── .gitignore          # Exclusiones de control de versiones
├── assets/             # Mockups, audio ambiental y fotografías de lookbook
├── index.html          # Estructura semántica accesible
├── styles.css          # Sistema de diseño Brutalist / Dark Gold
├── script.js           # Motor de estado, carrito, modales y eventos
└── README.md           # Documentación del proyecto
```

---

## 💻 Cómo Ejecutar en Local

Puedes abrir `index.html` directamente en tu navegador o levantarlo con un servidor local:

```bash
# Con Node.js:
npx serve .

# O con Python:
python -m http.server 3000
```

---

## 🔗 Conectar al Repositorio Remoto

El repositorio local ya está inicializado en la rama `main`. Para vincularlo a tu repositorio remoto (GitHub, GitLab, etc.):

```bash
git remote add origin <URL_DE_TU_REPOSITORIO>
git push -u origin main
```
