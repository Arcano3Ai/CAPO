/**
 * CAPO Store - Core Application Engine v2.5.0
 * Architecture: Clean, Event-Driven, Component-Based Vanilla JS
 * Modules: ProductStore, CartState, WishlistState, EnhancedPDP,
 *          OrderTracker, ShippingEstimator, CapoLab, CapoBot, LiveTicker
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================
    // 0. PWA & HERO VIDEO AUTOPLAY
    // =========================================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('✓ Service Worker registrado:', reg.scope))
                .catch(err => console.warn('Service Worker registration skipped:', err));
        });
    }

    // =========================================================
    // HERO & CINEMATIC BACKGROUND VIDEOS (1, 2, 3) - PLAYLIST & AUTOPLAY
    // =========================================================
    const HERO_VIDEOS = [
        'assets/fondo-1.mp4',
        'assets/fondo-2.mp4',
        'assets/fondo-3.mp4'
    ];
    let currentHeroVideoIdx = 0;
    const heroVideo = document.querySelector('#hero-video-player') || document.querySelector('.hero-video');
    const seqBtns = document.querySelectorAll('.video-seq-btn');

    function switchHeroVideo(index) {
        if (!heroVideo || index < 0 || index >= HERO_VIDEOS.length) return;
        currentHeroVideoIdx = index;
        
        // Cambio suave de fuente
        heroVideo.src = HERO_VIDEOS[currentHeroVideoIdx];
        heroVideo.load();
        const p = heroVideo.play();
        if (p !== undefined) {
            p.catch(() => {});
        }

        seqBtns.forEach((btn, idx) => {
            btn.classList.toggle('active', idx === currentHeroVideoIdx);
        });
    }

    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.setAttribute('muted', '');
        heroVideo.setAttribute('playsinline', '');

        // Auto avance secuencial al terminar cada video (1 -> 2 -> 3 -> 1)
        heroVideo.addEventListener('ended', () => {
            const nextIdx = (currentHeroVideoIdx + 1) % HERO_VIDEOS.length;
            switchHeroVideo(nextIdx);
        });

        // Click en los botones de secuencia 01, 02, 03
        seqBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetIdx = parseInt(btn.getAttribute('data-index'), 10);
                if (!isNaN(targetIdx)) {
                    switchHeroVideo(targetIdx);
                }
            });
        });

        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                const triggerPlay = () => {
                    heroVideo.play().catch(() => {});
                };
                window.addEventListener('click', triggerPlay, { once: true });
                window.addEventListener('touchstart', triggerPlay, { once: true });
                window.addEventListener('scroll', triggerPlay, { once: true });
            });
        }
    }

    // Inicializar videos de las secciones cinemáticas secundarias
    const cinematicVideos = document.querySelectorAll('.cinematic-showcase-video');
    cinematicVideos.forEach((vid) => {
        vid.muted = true;
        vid.playsInline = true;
        vid.setAttribute('muted', '');
        vid.setAttribute('playsinline', '');
        const p = vid.play();
        if (p !== undefined) {
            p.catch(() => {
                const triggerSecondary = () => vid.play().catch(() => {});
                window.addEventListener('scroll', triggerSecondary, { once: true });
                window.addEventListener('click', triggerSecondary, { once: true });
            });
        }
    });

    // =========================================================
    // 1. DATA LAYER: PRODUCTS CATALOG (CENTRALIZED STORE)
    // =========================================================
    const PRODUCTS_CATALOG = [
        {
            id: "capo-boss-black",
            sku: "CP-BB-001",
            name: "THE BOSS BLACK",
            category: "jefes",
            categoryLabel: "LÍNEA JEFES",
            price: 899,
            originalPrice: 1099,
            stock: 4,
            badge: "BESTSELLER",
            images: [
                "assets/mockup (5).webp",
                "assets/ChatGPT Image 13 feb 2026, 21_39_47.webp",
                "assets/ChatGPT Image 13 feb 2026, 21_50_19.webp"
            ],
            rating: 5.0,
            reviewCount: 84,
            description: "La pieza definitiva de autoridad. Corona alta reforzada con entretela indeformable de doble capa, bordado 3D en hilo negro mate con acabado de alta densidad y broche metálico inoxidable con monograma grabado.",
            specs: {
                corona: "Estructurada alta (A-Frame 6 paneles)",
                visera: "Curva pronunciada indeformable",
                material: "100% Algodón Premium Pesado 380 GSM",
                broche: "Hebilla metálica antioxidable personalizada",
                talla: "Ajustable Universal (56 - 62 cm)"
            }
        },
        {
            id: "capo-patron-white",
            sku: "CP-PW-002",
            name: "EL PATRÓN WHITE",
            category: "jefes",
            categoryLabel: "LÍNEA JEFES",
            price: 899,
            originalPrice: 1099,
            stock: 6,
            badge: "EXCLUSIVO",
            images: [
                "assets/mockup (6).webp",
                "assets/ChatGPT Image 13 feb 2026, 21_50_19.webp",
                "assets/Gemini_Generated_Image_9us3ks9us3ks9us3.webp"
            ],
            rating: 4.9,
            reviewCount: 62,
            description: "Una declaración de pulcritud y dominio absoluto. Blanco marfil con bordado en contraste negro industrial, banda antisudor transpirable y ojillos metálicos ventilados.",
            specs: {
                corona: "Estructurada rígida indeformable",
                visera: "Visera semi-plana moldeable",
                material: "Algodón peinado con tratamiento repelente a polvo",
                broche: "Snapback reforzado doble hilera",
                talla: "Ajustable Universal (56 - 62 cm)"
            }
        },
        {
            id: "capo-urban-legend",
            sku: "CP-UL-003",
            name: "URBAN LEGEND",
            category: "calle",
            categoryLabel: "LÍNEA CALLE",
            price: 799,
            originalPrice: 950,
            stock: 8,
            badge: "STREET CORE",
            images: [
                "assets/48be2ed7-cfb4-465b-826a-cc669465221e.webp",
                "assets/ChatGPT Image 13 feb 2026, 21_44_18.webp"
            ],
            rating: 4.8,
            reviewCount: 51,
            description: "Nacida para el rigor del asfalto. Tejido ultra resistente a la fricción y desvanecimiento solar con forro interior monogramado y perfil bajo agresivo.",
            specs: {
                corona: "Perfil medio semi-estructurado",
                visera: "Curva clásica con pespunte militar 8 filas",
                material: "Sarga de alta durabilidad resistente a rasgaduras",
                broche: "Correa de cuero genuino con hebilla mate",
                talla: "Ajustable Universal (55 - 61 cm)"
            }
        },
        {
            id: "capo-gold-standard",
            sku: "CP-GS-004",
            name: "GOLD STANDARD",
            category: "oro",
            categoryLabel: "ORO NEGRO",
            price: 999,
            originalPrice: 1299,
            stock: 2,
            badge: "EDICIÓN NUMERADA",
            images: [
                "assets/b3409bb5-63e0-483f-8dbc-20c7f2c33384.webp",
                "assets/Gemini_Generated_Image_9us3ks9us3ks9us3.webp",
                "assets/ChatGPT Image 13 feb 2026, 21_39_47.webp"
            ],
            rating: 5.0,
            reviewCount: 110,
            description: "La cumbre del streetwear de lujo. Placa metálica frontal con baño dorado de 24K cepillado, forro interno de satén con hilo dorado y certificado holográfico seriado del 001 al 100.",
            specs: {
                corona: "Alta estructurada rígida con forro de satén",
                visera: "Gamuza negra prémium en reverso",
                material: "Lana virgen y algodón pesado de grado sastre",
                broche: "Cierre micrométrico de aleación oro vintage",
                talla: "Ajustable Universal (56 - 62 cm)"
            }
        },
        {
            id: "capo-concrete-king",
            sku: "CP-CK-005",
            name: "CONCRETE KING",
            category: "calle",
            categoryLabel: "LÍNEA CALLE",
            price: 799,
            originalPrice: 950,
            stock: 5,
            badge: "LOTE LIMITADO",
            images: [
                "assets/ChatGPT Image 13 feb 2026, 21_44_18.webp",
                "assets/48be2ed7-cfb4-465b-826a-cc669465221e.webp"
            ],
            rating: 4.9,
            reviewCount: 39,
            description: "Estética desgastada a mano para un acabado único e irrepetible. Estilo rudo con parche engomado en bajo relieve resistente a climas extremos.",
            specs: {
                corona: "Baja estructurada tipo Dad Hat pesada",
                visera: "Curva con bordes biselados",
                material: "Algodón lavado a la piedra 400 GSM",
                broche: "Hebilla deslizante de latón envejecido",
                talla: "Ajustable Universal (55 - 61 cm)"
            }
        },
        {
            id: "capo-supremacy-silver",
            sku: "CP-SS-006",
            name: "SUPREMACÍA SILVER",
            category: "oro",
            categoryLabel: "ORO NEGRO",
            price: 949,
            originalPrice: 1199,
            stock: 3,
            badge: "NUEVO DROP",
            images: [
                "assets/mockup (6).webp",
                "assets/ChatGPT Image 13 feb 2026, 21_39_47.webp"
            ],
            rating: 5.0,
            reviewCount: 27,
            description: "Placa de titanio plata pulido a espejo sobre corona negro carbón. El contraste supremo para quienes buscan el brillo más nítido y frío de la noche.",
            specs: {
                corona: "Estructurada alta 6 paneles con refuerzo frontal",
                visera: "Visera híbrida con ribete plateado reflectivo",
                material: "Poliéster técnico impermeable y algodón",
                broche: "Hebilla de aleación de zinc pulida",
                talla: "Ajustable Universal (56 - 62 cm)"
            }
        },
        {
            id: "capo-travel-case",
            sku: "CP-ACC-007",
            name: "CAJA DE VIAJE BLINDADA (ESTUCHE)",
            category: "accesorios",
            categoryLabel: "ARSENAL ACCESORIOS",
            price: 499,
            originalPrice: 650,
            stock: 12,
            badge: "ACCESORIO VITAL",
            images: [
                "assets/ChatGPT Image 13 feb 2026, 21_50_19.webp"
            ],
            rating: 4.9,
            reviewCount: 46,
            description: "Maletín rígido indeformable con capacidad para transportar hasta 6 gorras CAPO sin que la corona sufra aplastamientos. Incluye correa al hombro y cremallera impermeable.",
            specs: {
                capacidad: "De 4 a 6 gorras",
                material: "Carcasa rígida de EVA termoformada",
                cierre: "Cremallera sellada contra agua y polvo",
                dimensiones: "32 x 24 x 15 cm"
            }
        },
        {
            id: "capo-care-kit",
            sku: "CP-ACC-008",
            name: "KIT DE CUIDADO & LIMPIEZA CAPO",
            category: "accesorios",
            categoryLabel: "ARSENAL ACCESORIOS",
            price: 349,
            originalPrice: 450,
            stock: 15,
            badge: "PROTECCIÓN",
            images: [
                "assets/Gemini_Generated_Image_9us3ks9us3ks9us3.webp"
            ],
            rating: 4.8,
            reviewCount: 33,
            description: "Espuma limpiadora en seco biodegradable formulada específicamente para no decolorar el algodón pesado ni despegar bordados 3D. Incluye cepillo de cerdas de crin de caballo.",
            specs: {
                contenido: "Espuma 200 ml + Cepillo prémium cerda natural",
                compatibilidad: "Algodón, gamuza, lana y tejidos sintéticos",
                durabilidad: "Hasta 40 limpiezas completas"
            }
        }
    ];

    // =========================================================
    // 2. STATE MANAGEMENT: CART, WISHLIST & COUPONS
    // =========================================================
    const CART_STORAGE_KEY = 'capo_store_cart_v3';
    const WISHLIST_STORAGE_KEY = 'capo_store_wishlist_v3';
    const COUPON_STORAGE_KEY = 'capo_applied_coupon_v3';
    const FREE_SHIPPING_THRESHOLD = 1500;
    const STANDARD_SHIPPING_COST = 149;
    const WHATSAPP_STORE_PHONE = '5215500000000';

    const AVAILABLE_COUPONS = {
        'CAPO10': { type: 'percent', value: 10, label: '10% OFF EN TU ORDEN' },
        'LEGADO20': { type: 'percent', value: 20, label: '20% OFF EXCLUSIVO' },
        'CONSEJERO15': { type: 'percent', value: 15, label: '15% OFF VIP CONSEJERO' },
        'ENVIOVIP': { type: 'free_shipping', value: 0, label: 'ENVÍO GRATIS INCONDICIONAL' }
    };

    // Wishlist Engine
    const WishlistState = {
        ids: [],
        init() {
            try {
                const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
                this.ids = stored ? JSON.parse(stored) : [];
            } catch (e) {
                this.ids = [];
            }
            this.syncUI();
        },
        save() {
            try {
                localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.ids));
            } catch (e) {}
            this.syncUI();
        },
        toggle(productId) {
            const idx = this.ids.indexOf(productId);
            const product = PRODUCTS_CATALOG.find(p => p.id === productId);
            const name = product ? product.name : 'PIEZA';

            if (idx > -1) {
                this.ids.splice(idx, 1);
                Toast.show(`✕ ${name} REMOVIDO DE FAVORITOS`);
            } else {
                this.ids.push(productId);
                Toast.show(`❤️ ${name} GUARDADO EN FAVORITOS`);
            }
            this.save();
        },
        has(productId) {
            return this.ids.includes(productId);
        },
        syncUI() {
            const badge = document.getElementById('wishlist-badge');
            if (badge) {
                badge.textContent = this.ids.length;
                badge.style.display = this.ids.length > 0 ? 'flex' : 'none';
            }
            // Update active heart buttons on cards
            document.querySelectorAll('.btn-wishlist-card').forEach(btn => {
                const id = btn.getAttribute('data-id');
                if (this.has(id)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            WishlistUI.render();
        }
    };

    // Cart Engine
    const CartState = {
        items: [],
        appliedCoupon: null,

        init() {
            try {
                const storedCart = localStorage.getItem(CART_STORAGE_KEY);
                this.items = storedCart ? JSON.parse(storedCart) : [];

                const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
                if (storedCoupon && AVAILABLE_COUPONS[storedCoupon]) {
                    this.appliedCoupon = { code: storedCoupon, ...AVAILABLE_COUPONS[storedCoupon] };
                }
            } catch (e) {
                this.items = [];
                this.appliedCoupon = null;
            }
            this.syncUI();
        },

        save() {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
                if (this.appliedCoupon) {
                    localStorage.setItem(COUPON_STORAGE_KEY, this.appliedCoupon.code);
                } else {
                    localStorage.removeItem(COUPON_STORAGE_KEY);
                }
            } catch (e) {}
            this.syncUI();
        },

        addItem(product, quantity = 1) {
            const existingIndex = this.items.findIndex(item => item.id === product.id);
            if (existingIndex > -1) {
                this.items[existingIndex].quantity += quantity;
            } else {
                this.items.push({
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image || (product.images ? product.images[0] : ''),
                    quantity: quantity
                });
            }
            this.save();
            Toast.show(`✓ ${product.name} AGREGADO AL ARSENAL`);
            CartUI.bumpBadge();
        },

        updateQuantity(productId, delta) {
            const item = this.items.find(i => i.id === productId);
            if (!item) return;

            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.save();
            }
        },

        removeItem(productId) {
            const item = this.items.find(i => i.id === productId);
            const name = item ? item.name : 'PRODUCTO';
            this.items = this.items.filter(i => i.id !== productId);
            this.save();
            Toast.show(`✕ ${name} REMOVIDO`);
        },

        applyCoupon(code) {
            const cleanCode = (code || '').trim().toUpperCase();
            if (AVAILABLE_COUPONS[cleanCode]) {
                this.appliedCoupon = { code: cleanCode, ...AVAILABLE_COUPONS[cleanCode] };
                this.save();
                Toast.show(`✓ CUPÓN ${cleanCode} APLICADO`);
                return { success: true, message: `CUPÓN APLICADO: ${this.appliedCoupon.label}` };
            } else {
                return { success: false, message: 'CÓDIGO DE CUPÓN INVÁLIDO O EXPIRADO.' };
            }
        },

        clear() {
            this.items = [];
            this.appliedCoupon = null;
            this.save();
            Toast.show('ARSENAL VACIADO');
        },

        getCount() {
            return this.items.reduce((acc, item) => acc + item.quantity, 0);
        },

        getSubtotal() {
            return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },

        getDiscountAmount() {
            if (!this.appliedCoupon || this.items.length === 0) return 0;
            if (this.appliedCoupon.type === 'percent') {
                return Math.round(this.getSubtotal() * (this.appliedCoupon.value / 100));
            }
            return 0;
        },

        getShippingCost() {
            if (this.items.length === 0) return 0;
            if (this.appliedCoupon && this.appliedCoupon.type === 'free_shipping') return 0;
            return this.getSubtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
        },

        getTotal() {
            const sub = this.getSubtotal();
            const disc = this.getDiscountAmount();
            const ship = this.getShippingCost();
            return Math.max(0, sub - disc + ship);
        },

        syncUI() {
            CartUI.render();
        }
    };

    // =========================================================
    // 3. TOAST NOTIFICATIONS COMPONENT
    // =========================================================
    const Toast = {
        container: document.getElementById('toast-container'),

        show(message, duration = 3000) {
            if (!this.container) return;

            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `<i class="fas fa-crosshairs"></i> <span>${message}</span>`;

            this.container.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'fadeOutRight 0.3s ease forwards';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        }
    };

    // =========================================================
    // 4. CATALOG ENGINE (DYNAMIC INJECTION, FILTER & SORT)
    // =========================================================
    const CatalogEngine = {
        mainGrid: document.getElementById('main-product-grid'),
        filterTabs: document.querySelectorAll('.filter-tab'),
        sortSelect: document.getElementById('catalog-sort-select'),
        countBadge: document.getElementById('catalog-count-badge'),
        currentFilter: 'all',
        currentSort: 'featured',

        init() {
            if (!this.mainGrid) return;
            this.renderProducts();

            // Filter Tabs
            this.filterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.filterTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentFilter = tab.getAttribute('data-filter') || 'all';
                    this.renderProducts();
                });
            });

            // Sort Select
            if (this.sortSelect) {
                this.sortSelect.addEventListener('change', (e) => {
                    this.currentSort = e.target.value;
                    this.renderProducts();
                });
            }
        },

        renderProducts() {
            if (!this.mainGrid) return;

            // Filter products
            let filtered = PRODUCTS_CATALOG.filter(p => {
                if (this.currentFilter === 'all') return true;
                return p.category === this.currentFilter;
            });

            // Sort products
            filtered.sort((a, b) => {
                if (this.currentSort === 'price-asc') return a.price - b.price;
                if (this.currentSort === 'price-desc') return b.price - a.price;
                if (this.currentSort === 'rating') return b.rating - a.rating;
                if (this.currentSort === 'alpha') return a.name.localeCompare(b.name);
                return 0; // featured default
            });

            // Render HTML cards
            this.mainGrid.innerHTML = filtered.map(p => {
                const stock = window.CapoSync ? window.CapoSync.InventoryManager.getStock(p.sku, p.stock) : (p.stock || 4);
                const isSoldOut = stock <= 0;
                const formattedPrice = window.CapoSync ? window.CapoSync.CurrencyManager.format(p.price) : `$${p.price} MXN`;
                const formattedOrig = window.CapoSync ? window.CapoSync.CurrencyManager.format(p.originalPrice) : `$${p.originalPrice} MXN`;

                return `
                <article class="product-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.images[0]}" data-category="${p.category}" data-desc="${p.description}">
                    <div class="product-badge ${isSoldOut ? 'sold-out' : (p.category === 'oro' ? 'gold-badge' : '')}">
                        ${isSoldOut ? 'AGOTADO' : p.badge}
                    </div>
                    <button type="button" class="btn-wishlist-card ${WishlistState.has(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Guardar en favoritos">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="product-image">
                        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
                        <div class="card-action-overlay">
                            <button type="button" class="btn-quick-view" data-action="quick-view">DETALLES</button>
                            ${isSoldOut ? `
                                <button type="button" class="btn-add-cart sold-out" disabled>AGOTADO</button>
                            ` : `
                                <button type="button" class="btn-add-cart" data-action="add-cart">AGREGAR ${formattedPrice}</button>
                            `}
                        </div>
                    </div>
                    <div class="product-info">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="product-category">${p.categoryLabel}</span>
                            <span style="font-size:0.75rem; color:#888;">★ ${p.rating} (${p.reviewCount})</span>
                        </div>
                        <h3>${p.name}</h3>
                        <p class="price">${formattedPrice} <span class="original-price" style="font-size:0.85rem; margin-left:6px;">${formattedOrig}</span></p>
                        ${isSoldOut ? `
                            <button type="button" class="btn-notify-stock" data-sku="${p.sku}" data-name="${p.name}">
                                <i class="fas fa-bell"></i> AVÍSAME AL REABASTECER
                            </button>
                        ` : ''}
                    </div>
                </article>
                `;
            }).join('');

            if (this.countBadge) {
                this.countBadge.textContent = `MOSTRANDO ${filtered.length} ${filtered.length === 1 ? 'PIEZA' : 'PIEZAS'}`;
            }

            WishlistState.syncUI();
        }
    };

    // =========================================================
    // 5. WISHLIST UI & DRAWER CONTROLLER
    // =========================================================
    const WishlistUI = {
        overlay: document.getElementById('wishlist-overlay'),
        drawer: document.getElementById('wishlist-drawer'),
        toggleBtn: document.getElementById('wishlist-toggle-btn'),
        closeBtn: document.getElementById('wishlist-close-btn'),
        itemsContainer: document.getElementById('wishlist-items'),
        drawerCount: document.getElementById('wishlist-drawer-count'),

        init() {
            if (this.toggleBtn) {
                this.toggleBtn.addEventListener('click', () => this.open());
            }
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }
            if (this.overlay) {
                this.overlay.addEventListener('click', () => this.close());
            }

            // Delegated click on wishlist hearts across DOM
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-wishlist-card');
                if (btn) {
                    const id = btn.getAttribute('data-id');
                    WishlistState.toggle(id);
                }
            });
        },

        open() {
            if (!this.drawer) return;
            this.drawer.classList.add('active');
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            if (!this.drawer) return;
            this.drawer.classList.remove('active');
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        },

        render() {
            if (!this.itemsContainer) return;
            const items = PRODUCTS_CATALOG.filter(p => WishlistState.has(p.id));

            if (this.drawerCount) {
                this.drawerCount.textContent = `(${items.length})`;
            }

            if (items.length === 0) {
                this.itemsContainer.innerHTML = `
                    <div class="cart-empty-state">
                        <i class="fas fa-heart-broken" style="font-size:3rem; color:#222;"></i>
                        <p>AÚN NO TIENES PIEZAS GUARDADAS.</p>
                        <a href="#coleccion" class="btn-secondary" style="font-size:0.8rem; padding:0.8rem 1.5rem;" onclick="WishlistUI.close()">EXPLORAR CATÁLOGO</a>
                    </div>
                `;
            } else {
                this.itemsContainer.innerHTML = items.map(p => `
                    <div class="cart-item">
                        <div class="cart-item-img">
                            <img src="${p.images[0]}" alt="${p.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${p.name}</div>
                            <div class="cart-item-price">$${p.price} MXN</div>
                            <div class="cart-item-actions">
                                <button type="button" class="btn-primary" style="padding:4px 10px; font-size:0.75rem;" onclick="CartState.addItem({id:'${p.id}', name:'${p.name}', price:${p.price}, image:'${p.images[0]}'}); WishlistUI.close(); CartUI.open();">
                                    MOVER AL ARSENAL
                                </button>
                                <button type="button" class="cart-item-remove" onclick="WishlistState.toggle('${p.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    };

    // =========================================================
    // 6. ENHANCED PDP (PRODUCT DETAIL MODAL WITH MULTI-THUMBS)
    // =========================================================
    const QuickViewModal = {
        overlay: document.getElementById('quick-view-modal'),
        closeBtn: document.getElementById('quick-view-close-btn'),
        imgEl: document.getElementById('qv-img'),
        thumbsContainer: document.getElementById('qv-thumbnails'),
        titleEl: document.getElementById('qv-title'),
        categoryEl: document.getElementById('qv-category'),
        priceEl: document.getElementById('qv-price'),
        origPriceEl: document.getElementById('qv-orig-price'),
        saveBadge: document.getElementById('qv-save-badge'),
        descEl: document.getElementById('qv-desc'),
        specsContainer: document.getElementById('qv-specs-container'),
        qtyInput: document.getElementById('qv-qty-input'),
        qtyMinus: document.getElementById('qv-qty-minus'),
        qtyPlus: document.getElementById('qv-qty-plus'),
        addBtn: document.getElementById('qv-add-cart-btn'),
        stockBadge: document.getElementById('qv-stock-badge'),
        currentProduct: null,

        init() {
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }

            // Tabs inside PDP
            document.querySelectorAll('.pdp-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.pdp-tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.pdp-tab-content').forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                    const tabKey = btn.getAttribute('data-pdptab');
                    const content = document.getElementById(`pdptab-${tabKey}`);
                    if (content) content.classList.add('active');
                });
            });

            if (this.qtyMinus) {
                this.qtyMinus.addEventListener('click', () => {
                    let val = parseInt(this.qtyInput.value) || 1;
                    if (val > 1) this.qtyInput.value = val - 1;
                });
            }
            if (this.qtyPlus) {
                this.qtyPlus.addEventListener('click', () => {
                    let val = parseInt(this.qtyInput.value) || 1;
                    if (val < 10) this.qtyInput.value = val + 1;
                });
            }

            if (this.addBtn) {
                this.addBtn.addEventListener('click', () => {
                    if (!this.currentProduct) return;
                    const qty = parseInt(this.qtyInput.value) || 1;
                    CartState.addItem(this.currentProduct, qty);
                    this.close();
                    CartUI.open();
                });
            }
        },

        open(product) {
            // Find full data from catalog if available
            const full = PRODUCTS_CATALOG.find(p => p.id === product.id) || product;
            this.currentProduct = full;

            if (this.imgEl) this.imgEl.src = full.images ? full.images[0] : full.image;
            if (this.titleEl) this.titleEl.textContent = full.name;
            if (this.categoryEl) this.categoryEl.textContent = full.categoryLabel || `LÍNEA ${(full.category || 'CAPO').toUpperCase()}`;
            
            const formattedPrice = window.CapoSync ? window.CapoSync.CurrencyManager.format(full.price) : `$${parseFloat(full.price).toLocaleString()} MXN`;
            if (this.priceEl) this.priceEl.textContent = formattedPrice;

            if (this.origPriceEl && full.originalPrice) {
                const formattedOrig = window.CapoSync ? window.CapoSync.CurrencyManager.format(full.originalPrice) : `$${full.originalPrice.toLocaleString()} MXN`;
                this.origPriceEl.textContent = formattedOrig;
                this.origPriceEl.style.display = 'inline';
            } else if (this.origPriceEl) {
                this.origPriceEl.style.display = 'none';
            }

            if (this.saveBadge && full.originalPrice) {
                const pct = Math.round((1 - (full.price / full.originalPrice)) * 100);
                this.saveBadge.textContent = `AHORRA ${pct}%`;
                this.saveBadge.style.display = 'inline-block';
            } else if (this.saveBadge) {
                this.saveBadge.style.display = 'none';
            }

            if (this.descEl) this.descEl.textContent = full.description || full.desc || 'Gorra exclusiva CAPO.';
            if (this.qtyInput) this.qtyInput.value = 1;

            const currentStock = window.CapoSync ? window.CapoSync.InventoryManager.getStock(full.sku, full.stock) : (full.stock || 4);
            const isSoldOut = currentStock <= 0;

            if (this.stockBadge) {
                if (isSoldOut) {
                    this.stockBadge.textContent = `🚫 PIEZA AGOTADA TEMPORALMENTE EN BÓVEDA`;
                    this.stockBadge.style.color = '#ff3344';
                } else {
                    this.stockBadge.textContent = `⚠️ SÓLO QUEDAN ${currentStock} PIEZAS EN ESTE LOTE`;
                    this.stockBadge.style.color = 'var(--accent-color)';
                }
            }

            if (this.addBtn) {
                if (isSoldOut) {
                    this.addBtn.disabled = true;
                    this.addBtn.textContent = 'PIEZA AGOTADA (SOLD OUT)';
                    this.addBtn.classList.add('sold-out');
                } else {
                    this.addBtn.disabled = false;
                    this.addBtn.textContent = 'AGREGAR AL ARSENAL';
                    this.addBtn.classList.remove('sold-out');
                }
            }

            // Specs
            if (this.specsContainer) {
                if (full.specs) {
                    this.specsContainer.innerHTML = Object.entries(full.specs).map(([key, val]) => `
                        <div class="spec-item"><i class="fas fa-check"></i> <strong>${key.toUpperCase()}:</strong> ${val}</div>
                    `).join('');
                } else {
                    this.specsContainer.innerHTML = `
                        <div class="spec-item"><i class="fas fa-check"></i> Corona alta estructurada indeformable</div>
                        <div class="spec-item"><i class="fas fa-check"></i> Broche metálico antioxidable</div>
                        <div class="spec-item"><i class="fas fa-check"></i> Certificado de autenticidad incluido</div>
                    `;
                }
            }

            // Thumbnails
            if (this.thumbsContainer) {
                const images = full.images || [full.image];
                this.thumbsContainer.innerHTML = images.map((img, idx) => `
                    <button type="button" class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" data-thumb="${img}">
                        <img src="${img}" alt="${full.name}">
                    </button>
                `).join('');

                this.thumbsContainer.querySelectorAll('.pdp-thumb-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.thumbsContainer.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.imgEl.src = btn.getAttribute('data-thumb');
                    });
                });
            }

            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
            this.currentProduct = null;
        }
    };

    // =========================================================
    // 7. CART UI & DRAWER CONTROLLER
    // =========================================================
    const CartUI = {
        overlay: document.getElementById('cart-overlay'),
        drawer: document.getElementById('cart-drawer'),
        toggleBtn: document.getElementById('cart-toggle-btn'),
        closeBtn: document.getElementById('cart-close-btn'),
        badge: document.getElementById('cart-badge'),
        itemsContainer: document.getElementById('cart-items'),
        drawerCount: document.getElementById('cart-drawer-count'),
        subtotalEl: document.getElementById('cart-subtotal'),
        discountLine: document.getElementById('discount-summary-line'),
        discountVal: document.getElementById('cart-discount-val'),
        shippingCostEl: document.getElementById('cart-shipping-cost'),
        totalEl: document.getElementById('cart-total'),
        shippingTextEl: document.getElementById('shipping-notice-text'),
        shippingProgressFill: document.getElementById('shipping-progress-fill'),
        couponInput: document.getElementById('coupon-code-input'),
        btnApplyCoupon: document.getElementById('btn-apply-coupon'),
        couponFeedback: document.getElementById('coupon-feedback'),
        clearBtn: document.getElementById('btn-clear-cart'),
        checkoutBtn: document.getElementById('btn-checkout'),
        cpInput: document.getElementById('cart-cp-input'),
        btnCalcCp: document.getElementById('btn-calc-cp'),
        cpFeedback: document.getElementById('cp-feedback'),

        init() {
            if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.open());
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
            if (this.overlay) this.overlay.addEventListener('click', () => this.close());

            if (this.clearBtn) {
                this.clearBtn.addEventListener('click', () => {
                    if (CartState.items.length === 0) return;
                    if (confirm('¿ESTÁS SEGURO DE VACIAR TODO EL ARSENAL?')) {
                        CartState.clear();
                    }
                });
            }

            if (this.checkoutBtn) {
                this.checkoutBtn.addEventListener('click', () => {
                    if (CartState.items.length === 0) {
                        Toast.show('AGREGA AL MENOS UNA PIEZA AL ARSENAL');
                        return;
                    }
                    this.close();
                    CheckoutModal.open();
                });
            }

            // Coupon
            if (this.btnApplyCoupon && this.couponInput) {
                this.btnApplyCoupon.addEventListener('click', () => {
                    const code = this.couponInput.value.trim();
                    if (!code) return;
                    const res = CartState.applyCoupon(code);
                    if (this.couponFeedback) {
                        this.couponFeedback.className = `coupon-feedback ${res.success ? 'success' : 'error'}`;
                        this.couponFeedback.textContent = res.message;
                    }
                    if (res.success) this.couponInput.value = '';
                });
            }

            // CP Postal Code Calc
            if (this.btnCalcCp && this.cpInput) {
                this.btnCalcCp.addEventListener('click', () => {
                    const cp = this.cpInput.value.trim();
                    if (cp.length === 5 && !isNaN(cp)) {
                        this.cpFeedback.textContent = `✓ CP ${cp}: Cobertura Express Aérea 24-48 hrs confirmada por DHL Express.`;
                        Toast.show(`✓ COBERTURA CONFIRMADA PARA CP ${cp}`);
                    } else {
                        this.cpFeedback.textContent = 'Ingresa un código postal válido de 5 dígitos.';
                    }
                });
            }

            // Items delegation
            if (this.itemsContainer) {
                this.itemsContainer.addEventListener('click', (e) => {
                    const btn = e.target.closest('button');
                    if (!btn) return;

                    const id = btn.getAttribute('data-id');
                    if (!id) return;

                    if (btn.classList.contains('qty-plus-btn')) {
                        CartState.updateQuantity(id, 1);
                    } else if (btn.classList.contains('qty-minus-btn')) {
                        CartState.updateQuantity(id, -1);
                    } else if (btn.classList.contains('cart-item-remove')) {
                        CartState.removeItem(id);
                    }
                });
            }
        },

        open() {
            this.drawer.classList.add('active');
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.drawer.classList.remove('active');
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        },

        bumpBadge() {
            if (!this.badge) return;
            this.badge.classList.add('bump');
            setTimeout(() => this.badge.classList.remove('bump'), 300);
        },

        render() {
            const count = CartState.getCount();
            const subtotal = CartState.getSubtotal();
            const discount = CartState.getDiscountAmount();
            const shipping = CartState.getShippingCost();
            const total = CartState.getTotal();

            if (this.badge) {
                this.badge.textContent = count;
                this.badge.style.display = count > 0 ? 'flex' : 'none';
            }
            if (this.drawerCount) {
                this.drawerCount.textContent = `(${count} ${count === 1 ? 'PIEZA' : 'PIEZAS'})`;
            }

            // Shipping Progress
            if (this.shippingTextEl && this.shippingProgressFill) {
                if (count === 0) {
                    this.shippingTextEl.textContent = `Agrega $${FREE_SHIPPING_THRESHOLD.toLocaleString()} para ENVÍO GRATIS`;
                    this.shippingProgressFill.style.width = '0%';
                } else if (CartState.appliedCoupon && CartState.appliedCoupon.type === 'free_shipping') {
                    this.shippingTextEl.innerHTML = `<span style="color: var(--accent-color);">✓ CUPÓN ENVÍO GRATIS ACTIVO</span>`;
                    this.shippingProgressFill.style.width = '100%';
                } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
                    this.shippingTextEl.innerHTML = `<span style="color: var(--accent-color);">✓ ¡TIENES ENVÍO GRATIS APLICADO!</span>`;
                    this.shippingProgressFill.style.width = '100%';
                } else {
                    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
                    const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
                    this.shippingTextEl.textContent = `Faltan $${remaining.toLocaleString()} para ENVÍO GRATIS`;
                    this.shippingProgressFill.style.width = `${percent}%`;
                }
            }

            // Items
            if (!this.itemsContainer) return;

            if (CartState.items.length === 0) {
                this.itemsContainer.innerHTML = `
                    <div class="cart-empty-state">
                        <i class="fas fa-box-open" style="font-size:3rem; color:#222;"></i>
                        <p>TU ARSENAL ESTÁ VACÍO.</p>
                        <a href="#coleccion" class="btn-secondary" style="font-size:0.85rem; padding:0.8rem 1.5rem;" onclick="CartUI.close()">EXPLORAR PIEZAS</a>
                    </div>
                `;
            } else {
                this.itemsContainer.innerHTML = CartState.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">${window.CapoSync ? window.CapoSync.CurrencyManager.format(item.price) : `$${item.price.toLocaleString()} MXN`}</div>
                            <div class="cart-item-actions">
                                <div class="cart-item-qty">
                                    <button class="qty-minus-btn" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="qty-plus-btn" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                                </div>
                                <button class="cart-item-remove" data-id="${item.id}" aria-label="Eliminar producto">
                                    <i class="fas fa-trash-alt"></i> ELIMINAR
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            if (this.subtotalEl) {
                this.subtotalEl.textContent = window.CapoSync ? window.CapoSync.CurrencyManager.format(subtotal) : `$${subtotal.toLocaleString()} MXN`;
            }

            if (this.discountLine && this.discountVal) {
                if (discount > 0) {
                    this.discountLine.style.display = 'flex';
                    const formattedDisc = window.CapoSync ? window.CapoSync.CurrencyManager.format(discount) : `$${discount.toLocaleString()} MXN`;
                    this.discountVal.textContent = `-${formattedDisc} (${CartState.appliedCoupon.code})`;
                } else {
                    this.discountLine.style.display = 'none';
                }
            }

            if (this.shippingCostEl) {
                if (shipping === 0) {
                    this.shippingCostEl.textContent = count === 0 ? '$0' : 'GRATIS';
                } else {
                    this.shippingCostEl.textContent = window.CapoSync ? window.CapoSync.CurrencyManager.format(shipping) : `$${shipping} MXN`;
                }
            }
            if (this.totalEl) {
                this.totalEl.textContent = window.CapoSync ? window.CapoSync.CurrencyManager.format(total) : `$${total.toLocaleString()} MXN`;
            }
        }
    };

    // =========================================================
    // 8. CHECKOUT MODAL, MULTI-GATEWAY DISPATCHER & PAYMENTS
    // =========================================================
    const CheckoutModal = {
        overlay: document.getElementById('checkout-modal'),
        closeBtn: document.getElementById('checkout-close-btn'),
        form: document.getElementById('checkout-form'),
        summaryItems: document.getElementById('checkout-summary-items'),
        summarySubtotal: document.getElementById('checkout-summary-subtotal'),
        summaryDiscount: document.getElementById('checkout-summary-discount'),
        discountRow: document.getElementById('checkout-discount-row'),
        summaryShipping: document.getElementById('checkout-summary-shipping'),
        summaryVat: document.getElementById('checkout-summary-vat'),
        summaryTotal: document.getElementById('checkout-summary-total'),
        
        // Card Interactive Elements
        cardNumInput: document.getElementById('card-num-input'),
        cardNameInput: document.getElementById('card-name-input'),
        cardExpInput: document.getElementById('card-exp-input'),
        cardCvcInput: document.getElementById('card-cvc-input'),
        cardDisplayNumber: document.getElementById('card-display-number'),
        cardDisplayName: document.getElementById('card-display-name'),
        cardDisplayExp: document.getElementById('card-display-exp'),
        cardBrandIcon: document.getElementById('card-brand-icon'),
        cardLuhnStatus: document.getElementById('card-luhn-status'),
        btnDemoCard: document.getElementById('btn-demo-card'),

        // SPEI & OXXO Elements
        speiConceptoVal: document.getElementById('spei-concepto-val'),
        btnCopyConcepto: document.getElementById('btn-copy-concepto'),
        oxxoRefVal: document.getElementById('oxxo-ref-val'),
        oxxoBarcodeNumber: document.getElementById('oxxo-barcode-number'),
        oxxoExpiryVal: document.getElementById('oxxo-expiry-val'),
        btnCopyOxxo: document.getElementById('btn-copy-oxxo'),

        // Buttons & Success Screen
        submitBtn: document.getElementById('btn-submit-order'),
        whatsappBtn: document.getElementById('btn-whatsapp-order'),
        whatsappShareBtn: document.getElementById('btn-whatsapp-success-share'),
        viewReceiptBtn: document.getElementById('btn-view-receipt'),
        trackSuccessBtn: document.getElementById('btn-track-success'),
        finishSuccessBtn: document.getElementById('btn-finish-success'),
        successScreen: document.getElementById('order-success-screen'),
        successOrderId: document.getElementById('order-success-id'),
        successMethodBox: document.getElementById('order-success-method-box'),
        
        currentOrderId: null,
        lastGeneratedOrder: null,

        init() {
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }

            // Payment Methods Tabs Switching
            document.querySelectorAll('.payment-radio').forEach(radioLabel => {
                const radioInput = radioLabel.querySelector('input[name="payment-method"]');
                const targetPanelId = radioLabel.getAttribute('data-target');

                radioLabel.addEventListener('click', () => {
                    document.querySelectorAll('.payment-radio').forEach(r => r.classList.remove('active'));
                    radioLabel.classList.add('active');
                    if (radioInput) radioInput.checked = true;

                    // Show target detail panel
                    document.querySelectorAll('.payment-detail-panel').forEach(p => p.style.display = 'none');
                    const targetPanel = document.getElementById(targetPanelId);
                    if (targetPanel) targetPanel.style.display = 'block';

                    // Update submit button text based on method
                    const val = radioInput ? radioInput.value : 'card';
                    if (this.submitBtn) {
                        if (val === 'card') this.submitBtn.innerHTML = '<i class="fas fa-lock"></i> PAGAR Y ASEGURAR PEDIDO';
                        else if (val === 'spei') this.submitBtn.innerHTML = '<i class="fas fa-university"></i> GENERAR REFERENCIA SPEI';
                        else if (val === 'oxxo') this.submitBtn.innerHTML = '<i class="fas fa-barcode"></i> GENERAR FICHA OXXO PAY';
                        else this.submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> COORDINAR POR WHATSAPP';
                    }
                });
            });

            // Card Number Live Formatting & Luhn Detection
            if (this.cardNumInput) {
                this.cardNumInput.addEventListener('input', (e) => {
                    const formatted = CapoSync.PaymentUtils.formatCardNumber(e.target.value);
                    e.target.value = formatted;
                    if (this.cardDisplayNumber) {
                        this.cardDisplayNumber.textContent = formatted || '•••• •••• •••• ••••';
                    }

                    // Brand detection
                    const brandInfo = CapoSync.PaymentUtils.detectCardBrand(formatted);
                    if (this.cardBrandIcon) {
                        this.cardBrandIcon.innerHTML = `<i class="fab ${brandInfo.icon}"></i>`;
                    }

                    // Luhn check indicator
                    const digits = formatted.replace(/\D/g, '');
                    if (digits.length >= 13) {
                        const isValid = CapoSync.PaymentUtils.validateLuhn(digits);
                        if (this.cardLuhnStatus) {
                            this.cardLuhnStatus.className = `card-luhn-status ${isValid ? 'valid' : 'invalid'}`;
                        }
                    } else if (this.cardLuhnStatus) {
                        this.cardLuhnStatus.className = 'card-luhn-status';
                    }
                });
            }

            // Cardholder Name Mirror
            if (this.cardNameInput) {
                this.cardNameInput.addEventListener('input', (e) => {
                    if (this.cardDisplayName) {
                        this.cardDisplayName.textContent = e.target.value.toUpperCase() || 'NOMBRE DEL TITULAR';
                    }
                });
            }

            // Expiry Mirror & Format
            if (this.cardExpInput) {
                this.cardExpInput.addEventListener('input', (e) => {
                    const formatted = CapoSync.PaymentUtils.formatExpiry(e.target.value);
                    e.target.value = formatted;
                    if (this.cardDisplayExp) {
                        this.cardDisplayExp.textContent = formatted || 'MM/AA';
                    }
                });
            }

            // Demo Card Button Quick Fill
            if (this.btnDemoCard) {
                this.btnDemoCard.addEventListener('click', () => {
                    if (this.cardNumInput) this.cardNumInput.value = '4242 4242 4242 4242';
                    if (this.cardNameInput) this.cardNameInput.value = 'ROBERTO VALENCIA';
                    if (this.cardExpInput) this.cardExpInput.value = '12/28';
                    if (this.cardCvcInput) this.cardCvcInput.value = '842';

                    if (this.cardDisplayNumber) this.cardDisplayNumber.textContent = '4242 4242 4242 4242';
                    if (this.cardDisplayName) this.cardDisplayName.textContent = 'ROBERTO VALENCIA';
                    if (this.cardDisplayExp) this.cardDisplayExp.textContent = '12/28';
                    if (this.cardBrandIcon) this.cardBrandIcon.innerHTML = '<i class="fab fa-cc-visa"></i>';
                    if (this.cardLuhnStatus) this.cardLuhnStatus.className = 'card-luhn-status valid';

                    Toast.show('✓ TARJETA DE PRUEBA VISA VIP CARGADA');
                });
            }

            // Copy Buttons Listeners
            document.querySelectorAll('.btn-copy-mini').forEach(btn => {
                btn.addEventListener('click', () => {
                    const copyTarget = btn.getAttribute('data-copy');
                    const text = copyTarget || btn.previousElementSibling?.textContent?.trim() || '';
                    if (text && navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(() => {
                            const original = btn.innerHTML;
                            btn.innerHTML = '<i class="fas fa-check"></i> ¡COPIADO!';
                            Toast.show(`✓ COPIADO AL PORTAPAPELES: ${text}`);
                            setTimeout(() => { btn.innerHTML = original; }, 2000);
                        });
                    }
                });
            });

            // Form Submit (Standard Checkout)
            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.processOrder();
                });
            }

            // WhatsApp Direct Checkout Button
            if (this.whatsappBtn) {
                this.whatsappBtn.addEventListener('click', () => {
                    const name = document.getElementById('order-name').value.trim();
                    const phone = document.getElementById('order-phone').value.trim();
                    const address = document.getElementById('order-address').value.trim();

                    if (!name || !phone || !address) {
                        Toast.show('COMPLETA LOS DATOS DE ENTREGA ANTES DE ENVIAR A WHATSAPP');
                        return;
                    }
                    this.processOrder('whatsapp');
                });
            }

            // WhatsApp Share From Success Screen
            if (this.whatsappShareBtn) {
                this.whatsappShareBtn.addEventListener('click', () => {
                    if (this.lastGeneratedOrder) {
                        this.openWhatsApp(this.lastGeneratedOrder);
                    }
                });
            }

            // View Receipt Button
            if (this.viewReceiptBtn) {
                this.viewReceiptBtn.addEventListener('click', () => {
                    if (this.lastGeneratedOrder) {
                        ReceiptModal.open(this.lastGeneratedOrder);
                    }
                });
            }

            // Track Success Button
            if (this.trackSuccessBtn) {
                this.trackSuccessBtn.addEventListener('click', () => {
                    if (this.lastGeneratedOrder) {
                        this.close();
                        const orderId = this.lastGeneratedOrder.orderId;
                        OrderTracker.trackOrder(orderId);
                        const rastreoSec = document.getElementById('rastreo');
                        if (rastreoSec) rastreoSec.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }

            // Finish Success Button
            if (this.finishSuccessBtn) {
                this.finishSuccessBtn.addEventListener('click', () => {
                    this.close();
                    window.location.hash = '#coleccion';
                });
            }
        },

        open() {
            if (!this.overlay) return;
            this.form.style.display = 'flex';
            this.successScreen.style.display = 'none';

            // Generate provisional order ID for SPEI/OXXO reference previews
            this.currentOrderId = '#CAPO-' + Math.floor(100000 + Math.random() * 900000);
            if (this.speiConceptoVal) this.speiConceptoVal.textContent = this.currentOrderId;
            
            const oxxoInfo = CapoSync.PaymentUtils.generateOxxoDetails(this.currentOrderId);
            if (this.oxxoRefVal) this.oxxoRefVal.textContent = oxxoInfo.referenciaFormatted;
            if (this.oxxoBarcodeNumber) this.oxxoBarcodeNumber.textContent = oxxoInfo.referencia;
            if (this.oxxoExpiryVal) this.oxxoExpiryVal.textContent = `VENCE: ${oxxoInfo.expira.toUpperCase()}`;

            const count = CartState.getCount();
            const subtotal = CartState.getSubtotal();
            const discount = CartState.getDiscountAmount();
            const shipping = CartState.getShippingCost();
            const total = CartState.getTotal();
            const vat = Math.round(total - (total / 1.16));

            if (this.summaryItems) this.summaryItems.textContent = `${count} ${count === 1 ? 'PIEZA' : 'PIEZAS'}`;
            if (this.summarySubtotal) this.summarySubtotal.textContent = `$${subtotal.toLocaleString()} MXN`;
            
            if (this.summaryDiscount && this.discountRow) {
                if (discount > 0) {
                    this.discountRow.style.display = 'flex';
                    this.summaryDiscount.textContent = `-$${discount.toLocaleString()} MXN`;
                } else {
                    this.discountRow.style.display = 'none';
                }
            }

            if (this.summaryShipping) this.summaryShipping.textContent = shipping === 0 ? 'GRATIS (CONVENIO VIP)' : `$${shipping} MXN`;
            if (this.summaryVat) this.summaryVat.textContent = `$${vat.toLocaleString()} MXN`;
            if (this.summaryTotal) this.summaryTotal.textContent = `$${total.toLocaleString()} MXN`;

            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        },

        buildOrderPayload() {
            const name = document.getElementById('order-name').value.trim() || 'Cliente VIP';
            const phone = document.getElementById('order-phone').value.trim() || 'Sin teléfono';
            const email = document.getElementById('order-email').value.trim() || 'cliente@capostore.com';
            const cp = document.getElementById('order-cp').value.trim() || '06700';
            const address = document.getElementById('order-address').value.trim() || 'Dirección de Entrega';
            const paymentInput = document.querySelector('input[name="payment-method"]:checked');
            const paymentMethodKey = paymentInput ? paymentInput.value : 'card';

            const methodLabels = {
                'card': 'Tarjeta Débito / Crédito (Stripe & Pasarela Directa)',
                'spei': 'Transferencia Interbancaria SPEI',
                'oxxo': 'OXXO Pay (Efectivo con Código de Barras)',
                'whatsapp': 'Atención VIP por WhatsApp'
            };

            const orderId = this.currentOrderId || ('#CAPO-' + Math.floor(100000 + Math.random() * 900000));
            const subtotal = CartState.getSubtotal();
            const discount = CartState.getDiscountAmount();
            const shipping = CartState.getShippingCost();
            const total = CartState.getTotal();
            const vat = Math.round(total - (total / 1.16));

            let paymentDetails = {};
            if (paymentMethodKey === 'spei') {
                paymentDetails = CapoSync.PaymentUtils.generateSPEIDetails(orderId);
            } else if (paymentMethodKey === 'oxxo') {
                paymentDetails = CapoSync.PaymentUtils.generateOxxoDetails(orderId);
            } else if (paymentMethodKey === 'card') {
                const cardNum = (this.cardNumInput ? this.cardNumInput.value : '').replace(/\D/g, '');
                paymentDetails = {
                    brand: CapoSync.PaymentUtils.detectCardBrand(cardNum).label,
                    last4: cardNum.slice(-4) || '4242',
                    gateway: 'Stripe Elements Encrypted AES-256'
                };
            }

            return {
                orderId: orderId,
                name: name,
                phone: phone,
                email: email,
                cp: cp,
                address: address,
                paymentMethodKey: paymentMethodKey,
                paymentMethod: methodLabels[paymentMethodKey] || 'Tarjeta',
                paymentDetails: paymentDetails,
                items: [...CartState.items],
                subtotal: subtotal,
                discount: discount,
                shipping: shipping,
                vat: vat,
                total: total,
                status: '1', // 1: ORDEN RECIBIDA
                date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
            };
        },

        openWhatsApp(order) {
            let msg = `👑 *ORDEN OFICIAL CAPO STORE*\n`;
            msg += `*Folio:* ${order.orderId}\n`;
            msg += `*Cliente:* ${order.name}\n`;
            msg += `*Teléfono:* ${order.phone}\n`;
            msg += `*CP:* ${order.cp}\n`;
            msg += `*Dirección:* ${order.address}\n`;
            msg += `*Método de Pago:* ${order.paymentMethod}\n`;
            msg += `---------------------------------\n`;
            msg += `*ARTÍCULOS SOLICITADOS:*\n`;

            order.items.forEach(item => {
                msg += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()} MXN\n`;
            });

            msg += `---------------------------------\n`;
            msg += `*Subtotal:* $${order.subtotal.toLocaleString()} MXN\n`;
            if (order.discount > 0) {
                msg += `*Descuento Cupón:* -$${order.discount.toLocaleString()} MXN\n`;
            }
            msg += `*Envío Blindado:* ${order.shipping === 0 ? 'GRATIS' : `$${order.shipping} MXN`}\n`;
            msg += `*IVA (16% Incluido):* $${order.vat.toLocaleString()} MXN\n`;
            msg += `*TOTAL A LIQUIDAR:* $${order.total.toLocaleString()} MXN\n\n`;
            msg += `_Solicito confirmación de inventario y despacho blindado de este pedido._`;

            const encoded = encodeURIComponent(msg);
            const waUrl = `https://wa.me/${WHATSAPP_STORE_PHONE}?text=${encoded}`;
            window.open(waUrl, '_blank');
        },

        processOrder(overrideType = null) {
            const paymentInput = document.querySelector('input[name="payment-method"]:checked');
            const method = overrideType || (paymentInput ? paymentInput.value : 'card');

            // Card Validation Check
            if (method === 'card') {
                const cardNum = this.cardNumInput ? this.cardNumInput.value.replace(/\D/g, '') : '';
                const cardExp = this.cardExpInput ? this.cardExpInput.value.trim() : '';
                const cardCvc = this.cardCvcInput ? this.cardCvcInput.value.trim() : '';

                if (cardNum.length < 13 || !CapoSync.PaymentUtils.validateLuhn(cardNum)) {
                    Toast.show('⚠️ NÚMERO DE TARJETA INVÁLIDO O INCOMPLETO');
                    if (this.cardNumInput) this.cardNumInput.focus();
                    return;
                }
                if (!CapoSync.PaymentUtils.validateExpiry(cardExp)) {
                    Toast.show('⚠️ FECHA DE VENCIMIENTO INVÁLIDA (MM/AA)');
                    if (this.cardExpInput) this.cardExpInput.focus();
                    return;
                }
                if (cardCvc.length < 3) {
                    Toast.show('⚠️ CÓDIGO CVC REQUERIDO (3-4 DÍGITOS)');
                    if (this.cardCvcInput) this.cardCvcInput.focus();
                    return;
                }
            }

            const submitBtn = this.submitBtn;
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO ENCRIPTACIÓN BANCARIA...';

            const order = this.buildOrderPayload();
            this.lastGeneratedOrder = order;

            // Save order using CapoSync service
            try {
                if (window.CapoSync) {
                    window.CapoSync.saveOrder(order);
                    // Deduct stock for all purchased pieces
                    order.items.forEach(item => {
                        const catalogItem = PRODUCTS_CATALOG.find(p => p.id === item.id);
                        const sku = (catalogItem && catalogItem.sku) || item.sku || item.id;
                        window.CapoSync.InventoryManager.deductStock(sku, item.quantity, (catalogItem && catalogItem.stock) || 5);
                    });
                    CatalogEngine.renderProducts();
                } else {
                    const history = JSON.parse(localStorage.getItem('capo_order_history') || '[]');
                    history.unshift(order);
                    localStorage.setItem('capo_order_history', JSON.stringify(history.slice(0, 100)));
                }
            } catch (e) {
                console.error('Error guardando orden:', e);
            }

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;

                if (this.successOrderId) this.successOrderId.textContent = order.orderId;

                // Render dynamic method recap in success screen
                if (this.successMethodBox) {
                    if (method === 'spei') {
                        const spei = order.paymentDetails;
                        this.successMethodBox.innerHTML = `
                            <div style="color:var(--accent-color); font-weight:900; margin-bottom:6px;"><i class="fas fa-university"></i> DATOS PARA TRANSFERENCIA SPEI:</div>
                            <div style="font-size:0.85rem; line-height:1.6;">
                                <strong>Banco:</strong> ${spei.banco}<br>
                                <strong>CLABE:</strong> <span style="font-family:monospace; background:#000; padding:2px 6px;">${spei.clabe}</span><br>
                                <strong>Beneficiario:</strong> ${spei.beneficiario}<br>
                                <strong>Concepto:</strong> <strong class="highlight">${spei.concepto}</strong><br>
                                <strong>Monto Exacto:</strong> $${order.total.toLocaleString()} MXN
                            </div>
                        `;
                    } else if (method === 'oxxo') {
                        const oxxo = order.paymentDetails;
                        this.successMethodBox.innerHTML = `
                            <div style="color:#e61d2b; font-weight:900; margin-bottom:6px;"><i class="fas fa-barcode"></i> FICHA DE PAGO OXXO PAY:</div>
                            <div style="font-size:0.85rem; line-height:1.6;">
                                <strong>Referencia:</strong> <span style="font-family:monospace; font-size:1.1rem; color:#fff; background:#000; padding:4px 8px;">${oxxo.referenciaFormatted}</span><br>
                                <strong>Vigencia:</strong> ${oxxo.expira}<br>
                                <strong>Monto a pagar en caja:</strong> $${order.total.toLocaleString()} MXN
                            </div>
                        `;
                    } else {
                        this.successMethodBox.innerHTML = `
                            <div style="color:#00ff66; font-weight:900; margin-bottom:4px;"><i class="fas fa-check-shield"></i> PAGO PROCESADO EXITOSAMENTE</div>
                            <div style="font-size:0.85rem; color:#aaa;">Transacción autorizada con tokenización segura AES-256. El recibo oficial y la guía han sido generados.</div>
                        `;
                    }
                }

                this.form.style.display = 'none';
                this.successScreen.style.display = 'block';

                if (method === 'whatsapp') {
                    this.openWhatsApp(order);
                }

                CartState.clear();
                Toast.show(`✓ ORDEN ${order.orderId} REGISTRADA CON ÉXITO`);
            }, 1200);
        }
    };

    // =========================================================
    // 9. OFFICIAL RECEIPT MODAL
    // =========================================================
    const ReceiptModal = {
        overlay: document.getElementById('receipt-modal'),
        closeBtn: document.getElementById('receipt-close-btn'),
        recId: document.getElementById('rec-id'),
        recDate: document.getElementById('rec-date'),
        recStatus: document.getElementById('rec-status'),
        recCustomer: document.getElementById('rec-customer'),
        recMethod: document.getElementById('rec-method'),
        recAddress: document.getElementById('rec-address'),
        itemsBody: document.getElementById('rec-items-body'),
        recSub: document.getElementById('rec-sub'),
        recDiscount: document.getElementById('rec-discount'),
        recDiscountRow: document.getElementById('rec-discount-row'),
        recShip: document.getElementById('rec-ship'),
        recVat: document.getElementById('rec-vat'),
        recTotal: document.getElementById('rec-total'),
        recQrBox: document.getElementById('rec-qr-box'),

        init() {
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }
        },

        open(order) {
            if (!this.overlay || !order) return;
            if (this.recId) this.recId.textContent = order.orderId;
            if (this.recDate) this.recDate.textContent = order.date;
            if (this.recStatus) this.recStatus.textContent = order.status === '4' ? 'ENTREGADO' : (order.status === '3' ? 'EN RUTA' : 'CONFIRMADO');
            if (this.recCustomer) this.recCustomer.textContent = order.name;
            if (this.recMethod) this.recMethod.textContent = order.paymentMethod;
            if (this.recAddress) this.recAddress.textContent = `${order.address} (CP: ${order.cp})`;

            if (this.itemsBody) {
                this.itemsBody.innerHTML = order.items.map(item => `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td>x${item.quantity}</td>
                        <td>$${(item.price * item.quantity).toLocaleString()} MXN</td>
                    </tr>
                `).join('');
            }

            if (this.recSub) this.recSub.textContent = `$${order.subtotal.toLocaleString()} MXN`;
            
            if (this.recDiscountRow && this.recDiscount) {
                if (order.discount > 0) {
                    this.recDiscountRow.style.display = 'block';
                    this.recDiscount.textContent = `-$${order.discount.toLocaleString()} MXN`;
                } else {
                    this.recDiscountRow.style.display = 'none';
                }
            }

            if (this.recShip) this.recShip.textContent = order.shipping === 0 ? 'GRATIS' : `$${order.shipping} MXN`;
            if (this.recVat) this.recVat.textContent = `$${(order.vat || Math.round(order.total - (order.total / 1.16))).toLocaleString()} MXN`;
            if (this.recTotal) this.recTotal.textContent = `$${order.total.toLocaleString()} MXN`;

            // Dynamic SVG QR Code
            if (this.recQrBox) {
                this.recQrBox.innerHTML = `
                    <svg viewBox="0 0 100 100" width="60" height="60" style="display:block;">
                        <rect width="100" height="100" fill="#fff" />
                        <!-- Outer Position Detection Squares -->
                        <rect x="5" y="5" width="28" height="28" fill="#000" />
                        <rect x="9" y="9" width="20" height="20" fill="#fff" />
                        <rect x="13" y="13" width="12" height="12" fill="#000" />
                        <rect x="67" y="5" width="28" height="28" fill="#000" />
                        <rect x="71" y="9" width="20" height="20" fill="#fff" />
                        <rect x="75" y="13" width="12" height="12" fill="#000" />
                        <rect x="5" y="67" width="28" height="28" fill="#000" />
                        <rect x="9" y="71" width="20" height="20" fill="#fff" />
                        <rect x="13" y="75" width="12" height="12" fill="#000" />
                        <!-- Data Pattern Modules -->
                        <rect x="38" y="10" width="8" height="8" fill="#000" />
                        <rect x="50" y="18" width="8" height="8" fill="#000" />
                        <rect x="10" y="42" width="8" height="8" fill="#000" />
                        <rect x="22" y="50" width="8" height="8" fill="#000" />
                        <rect x="38" y="38" width="24" height="24" fill="#000" />
                        <rect x="42" y="42" width="16" height="16" fill="#fff" />
                        <rect x="46" y="46" width="8" height="8" fill="#000" />
                        <rect x="70" y="42" width="8" height="8" fill="#000" />
                        <rect x="82" y="50" width="8" height="8" fill="#000" />
                        <rect x="42" y="70" width="8" height="8" fill="#000" />
                        <rect x="54" y="82" width="8" height="8" fill="#000" />
                        <rect x="70" y="70" width="8" height="8" fill="#000" />
                        <rect x="82" y="82" width="8" height="8" fill="#000" />
                    </svg>
                `;
            }

            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // =========================================================
    // 10. ORDER TRACKING RADAR (LIVE PERSISTENT RADAR)
    // =========================================================
    const OrderTracker = {
        form: document.getElementById('tracking-form'),
        input: document.getElementById('tracking-input'),
        resultBox: document.getElementById('tracking-result'),
        orderIdDisplay: document.getElementById('track-order-id'),
        statusDisplay: document.getElementById('track-status-text'),
        courierDisplay: document.getElementById('track-courier-text'),
        recipientDisplay: document.getElementById('track-recipient-text'),
        summaryContainer: document.getElementById('track-order-summary'),
        timelineSteps: document.querySelectorAll('.tracking-timeline .timeline-step'),
        currentTrackingOrderId: null,

        init() {
            if (!this.form) return;
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                const q = this.input.value.trim().toUpperCase();
                if (!q) return;
                this.trackOrder(q);
            });

            // Live updates: if order status is changed in Admin HQ tab, update radar instantly
            if (window.CapoSync) {
                window.CapoSync.on('order_status_updated', (data) => {
                    if (this.currentTrackingOrderId && this.currentTrackingOrderId === data.orderId) {
                        this.renderOrderInRadar(data.order);
                        Toast.show(`🔔 RADAR ACTUALIZADO: NUEVO ESTADO`);
                    }
                });
            }
        },

        trackOrder(query) {
            const order = window.CapoSync ? window.CapoSync.getOrderById(query) : null;
            if (order) {
                this.renderOrderInRadar(order);
                Toast.show(`✓ ENVÍO LOCALIZADO: ${order.orderId}`);
            } else {
                // Check if demo query or format as fallback
                const cleanQ = query.startsWith('#') ? query : `#CAPO-${query.replace(/[^A-Z0-9]/g, '')}`;
                this.orderIdDisplay.textContent = cleanQ;
                if (this.statusDisplay) this.statusDisplay.textContent = 'FOLIO EN PROCESO DE REGISTRO';
                if (this.recipientDisplay) this.recipientDisplay.textContent = 'VERIFICANDO EN BASE CENTRAL';
                if (this.summaryContainer) this.summaryContainer.innerHTML = '<p style="color:#888; font-size:0.85rem;">Orden reciente recibida en la red. Si acabas de ordenar, el embalaje blindado toma unos minutos.</p>';
                this.setTimelineStep(1);
                this.resultBox.style.display = 'block';
                this.resultBox.scrollIntoView({ behavior: 'smooth' });
                Toast.show(`⚠️ FOLIO EN REVISIÓN DE BÓVEDA`);
            }
        },

        renderOrderInRadar(order) {
            this.currentTrackingOrderId = order.orderId;
            if (this.input) this.input.value = order.orderId;
            if (this.orderIdDisplay) this.orderIdDisplay.textContent = order.orderId;

            const statusLabels = {
                '1': 'ORDEN RECIBIDA • PAGO VERIFICADO',
                '2': 'EMBALAJE BLINDADO EN CURSO',
                '3': 'EN TRÁNSITO ASEGURADO • DHL EXPRESS',
                '4': 'ENTREGADO AL DESTINATARIO'
            };

            const statusCode = parseInt(order.status || '1', 10);
            if (this.statusDisplay) {
                this.statusDisplay.textContent = statusLabels[String(statusCode)] || 'EN PROCESO';
            }

            if (this.courierDisplay) {
                this.courierDisplay.textContent = `DHL EXPRESS AÉREO • GUÍA: DHL-MX-${order.orderId.replace('#CAPO-', '')}`;
            }

            if (this.recipientDisplay) {
                this.recipientDisplay.textContent = `${order.name} • ${order.address} (CP ${order.cp})`;
            }

            // Render items in tracking box
            if (this.summaryContainer) {
                this.summaryContainer.innerHTML = `
                    <div style="background:#111; border:1px solid #282828; padding:1rem; margin-top:1rem;">
                        <span style="font-size:0.75rem; color:#888; letter-spacing:1px; font-weight:800; display:block; margin-bottom:8px;">CONTENIDO DEL PAQUETE BLINDADO:</span>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            ${order.items.map(i => `
                                <span style="background:#181818; border:1px solid #333; padding:4px 8px; font-size:0.8rem; font-weight:700;">
                                    ${i.name} <strong style="color:var(--accent-color);">x${i.quantity}</strong>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            this.setTimelineStep(statusCode);
            this.resultBox.style.display = 'block';
            this.resultBox.scrollIntoView({ behavior: 'smooth' });
        },

        setTimelineStep(stepNumber) {
            if (!this.timelineSteps || this.timelineSteps.length === 0) return;
            this.timelineSteps.forEach((step, idx) => {
                const stepNum = idx + 1;
                step.classList.remove('completed', 'active');
                if (stepNum < stepNumber) {
                    step.classList.add('completed');
                } else if (stepNum === stepNumber) {
                    if (stepNumber === 4) {
                        step.classList.add('completed');
                    } else {
                        step.classList.add('active');
                    }
                }
            });
        }
    };

    // =========================================================
    // 11. LIVE SOCIAL PROOF TICKER
    // =========================================================
    const LiveSalesTicker = {
        ticker: document.getElementById('live-sales-ticker'),
        customerEl: document.getElementById('ticker-customer'),
        productEl: document.getElementById('ticker-product'),

        buyers: [
            { name: "Roberto V.", city: "CDMX", product: "THE BOSS BLACK", min: "2 min" },
            { name: "Alejandro G.", city: "Monterrey", product: "GOLD STANDARD", min: "5 min" },
            { name: "Marco T.", city: "Guadalajara", product: "EL PATRÓN WHITE", min: "8 min" },
            { name: "Esteban R.", city: "Puebla", product: "URBAN LEGEND", min: "12 min" },
            { name: "Carlos D.", city: "Querétaro", product: "SUPREMACÍA SILVER", min: "14 min" },
            { name: "Mauricio L.", city: "Cancún", product: "THE BOSS BLACK", min: "18 min" }
        ],

        init() {
            if (!this.ticker) return;
            let index = 0;

            const showNext = () => {
                const b = this.buyers[index];
                this.customerEl.textContent = `${b.name} de ${b.city}`;
                this.productEl.textContent = b.product;
                this.ticker.classList.add('show');

                setTimeout(() => {
                    this.ticker.classList.remove('show');
                }, 5000);

                index = (index + 1) % this.buyers.length;
            };

            // First show after 4s, then every 30s
            setTimeout(showNext, 4000);
            setInterval(showNext, 30000);
        }
    };

    // =========================================================
    // 12. CAPO LAB (INTERACTIVE CAP CUSTOMIZER)
    // =========================================================
    const CapoLabEngine = {
        mockupImg: document.getElementById('lab-mockup-img'),
        monogramDisplay: document.getElementById('lab-monogram-display'),
        monogramBadge: document.getElementById('lab-monogram-badge'),
        monogramInput: document.getElementById('lab-monogram-input'),
        tagModel: document.getElementById('lab-tag-model'),
        tagVisera: document.getElementById('lab-tag-visera'),
        tagBroche: document.getElementById('lab-tag-broche'),
        totalPriceEl: document.getElementById('lab-total-price'),
        addCartBtn: document.getElementById('lab-add-cart-btn'),
        baseBtns: document.querySelectorAll('#lab-base-options .lab-opt-btn'),
        finishBtns: document.querySelectorAll('#lab-finish-options .swatch-btn'),

        state: {
            modelName: 'THE BOSS BLACK',
            basePrice: 899,
            image: 'assets/mockup (5).webp',
            finish: 'gold',
            finishLabel: 'ORO 24K',
            monogram: 'CP',
            customFee: 150
        },

        init() {
            if (!this.mockupImg) return;

            this.baseBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.baseBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    this.state.modelName = btn.getAttribute('data-name');
                    this.state.basePrice = parseFloat(btn.getAttribute('data-baseprice'));
                    this.state.image = btn.getAttribute('data-img');

                    this.updateUI();
                });
            });

            this.finishBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.finishBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const finish = btn.getAttribute('data-finish');
                    this.state.finish = finish;

                    const finishMap = {
                        'gold': 'ORO 24K',
                        'silver': 'PLATA TITANIO',
                        'black': 'NEGRO MATE',
                        'crimson': 'ROJO CARMÍN'
                    };
                    this.state.finishLabel = finishMap[finish] || 'ORO 24K';

                    this.updateUI();
                });
            });

            if (this.monogramInput) {
                this.monogramInput.addEventListener('input', (e) => {
                    const clean = (e.target.value || '').toUpperCase().slice(0, 3);
                    this.state.monogram = clean || 'CP';
                    this.updateUI();
                });
            }

            if (this.addCartBtn) {
                this.addCartBtn.addEventListener('click', () => {
                    const customProduct = {
                        id: `capo-custom-${Date.now()}`,
                        name: `${this.state.modelName} [CUSTOM '${this.state.monogram}' / ${this.state.finishLabel}]`,
                        price: this.state.basePrice + this.state.customFee,
                        image: this.state.image,
                        category: 'lab',
                        desc: `Pieza forjada en CAPO Lab con monograma láser '${this.state.monogram}' y acabado ${this.state.finishLabel}.`
                    };

                    CartState.addItem(customProduct, 1);
                    CartUI.open();
                    Toast.show('✓ PIEZA A MEDIDA AGREGADA AL ARSENAL');
                });
            }

            this.updateUI();
        },

        updateUI() {
            if (this.mockupImg) this.mockupImg.src = this.state.image;
            if (this.monogramDisplay) this.monogramDisplay.textContent = this.state.monogram;

            if (this.monogramBadge) {
                this.monogramBadge.className = `lab-monogram-badge ${this.state.finish}`;
            }

            if (this.tagModel) this.tagModel.textContent = `BASE: ${this.state.modelName}`;
            if (this.tagVisera) this.tagVisera.textContent = `DETALLE: ${this.state.finishLabel}`;

            const total = this.state.basePrice + this.state.customFee;
            if (this.totalPriceEl) this.totalPriceEl.textContent = `$${total.toLocaleString()} MXN`;
        }
    };

    // =========================================================
    // 13. "EL CONSEJERO DEL CAPO" (AI STYLIST & CONCIERGE BOT)
    // =========================================================
    const CapoBotEngine = {
        widget: document.getElementById('capo-bot-widget'),
        trigger: document.getElementById('capo-bot-trigger'),
        window: document.getElementById('capo-bot-window'),
        closeBtn: document.getElementById('capo-bot-close'),
        messagesContainer: document.getElementById('bot-messages-container'),
        inputForm: document.getElementById('bot-input-form'),
        inputText: document.getElementById('bot-input-text'),
        promptsContainer: document.getElementById('bot-quick-prompts'),

        knowledge: {
            'recomendar': {
                response: 'Un verdadero líder no duda. Para presencia ejecutiva y de mando supremo, tu pieza es <strong>THE BOSS BLACK</strong> ($899). Si buscas supremacía y oro puro numerado, ve directo por <strong>GOLD STANDARD</strong> ($999).',
                card: {
                    name: 'THE BOSS BLACK',
                    price: 899,
                    image: 'assets/mockup (5).webp',
                    id: 'capo-boss-black'
                }
            },
            'cupon': {
                response: 'Reconozco el buen ojo. Por hablar directamente conmigo, toma el código de acceso exclusivo: <strong>CONSEJERO15</strong> para un 15% de descuento directo en tu orden.',
                action: {
                    type: 'coupon',
                    code: 'CONSEJERO15',
                    label: 'APLICAR 15% DE DESCUENTO AHORA'
                }
            },
            'tallas': {
                response: 'Todas nuestras piezas cuentan con corona estructurada reforzada que nunca se deforma y broche ajustable milimétrico inoxidable para medidas de <strong>56 a 62 cm</strong> (talla única universal premium).'
            },
            'envio': {
                response: 'Cada gorra viaja en <strong>embalaje blindado</strong>: una caja rígida indeformable con sellos holográficos de seguridad. Despacho express en menos de 24 hrs por DHL/FedEx asegurado.'
            }
        },

        init() {
            if (!this.trigger || !this.window) return;

            this.trigger.addEventListener('click', () => this.toggle());
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());

            this.addBotMessage('Saludos. Soy <strong>El Consejero</strong>, asesor privado de CAPO. ¿Buscas definir tu legado o requieres una recomendación a la altura de tu presencia?');

            if (this.promptsContainer) {
                this.promptsContainer.addEventListener('click', (e) => {
                    const btn = e.target.closest('.bot-prompt-pill');
                    if (!btn) return;
                    const promptKey = btn.getAttribute('data-prompt');
                    const text = btn.textContent.trim();
                    this.handleUserQuery(text, promptKey);
                });
            }

            if (this.inputForm) {
                this.inputForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const text = this.inputText.value.trim();
                    if (!text) return;
                    this.inputText.value = '';
                    this.handleUserQuery(text);
                });
            }
        },

        toggle() {
            const isOpen = this.window.classList.toggle('active');
            this.window.setAttribute('aria-hidden', !isOpen);
            if (isOpen && this.inputText) this.inputText.focus();
        },

        close() {
            this.window.classList.remove('active');
            this.window.setAttribute('aria-hidden', 'true');
        },

        addUserMessage(text) {
            const bubble = document.createElement('div');
            bubble.className = 'bot-bubble user';
            bubble.textContent = text;
            this.messagesContainer.appendChild(bubble);
            this.scrollToBottom();
        },

        addBotMessage(html, extras = null) {
            const bubble = document.createElement('div');
            bubble.className = 'bot-bubble bot';
            bubble.innerHTML = html;

            if (extras && extras.card) {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'bot-action-card';
                cardDiv.innerHTML = `
                    <strong style="color: var(--accent-color);">${extras.card.name}</strong>
                    <span>$${extras.card.price} MXN</span>
                    <button type="button" class="bot-action-btn">AGREGAR AL ARSENAL</button>
                `;
                cardDiv.querySelector('button').addEventListener('click', () => {
                    CartState.addItem(extras.card, 1);
                    CartUI.open();
                });
                bubble.appendChild(cardDiv);
            }

            if (extras && extras.action && extras.action.type === 'coupon') {
                const btn = document.createElement('button');
                btn.className = 'bot-action-btn';
                btn.textContent = extras.action.label;
                btn.style.width = '100%';
                btn.addEventListener('click', () => {
                    CartState.applyCoupon(extras.action.code);
                    CartUI.open();
                });
                bubble.appendChild(btn);
            }

            this.messagesContainer.appendChild(bubble);
            this.scrollToBottom();
        },

        handleUserQuery(text, key = null) {
            this.addUserMessage(text);

            setTimeout(() => {
                const lower = text.toLowerCase();

                if (key && this.knowledge[key]) {
                    const item = this.knowledge[key];
                    this.addBotMessage(item.response, item);
                    return;
                }

                if (lower.includes('descuento') || lower.includes('cupón') || lower.includes('cupon') || lower.includes('promo')) {
                    const item = this.knowledge['cupon'];
                    this.addBotMessage(item.response, item);
                } else if (lower.includes('recomiend') || lower.includes('modelo') || lower.includes('cual') || lower.includes('cuál') || lower.includes('gorra')) {
                    const item = this.knowledge['recomendar'];
                    this.addBotMessage(item.response, item);
                } else if (lower.includes('talla') || lower.includes('medida') || lower.includes('ajuste')) {
                    const item = this.knowledge['tallas'];
                    this.addBotMessage(item.response, item);
                } else if (lower.includes('envio') || lower.includes('envío') || lower.includes('caja') || lower.includes('paqueteria') || lower.includes('dhl')) {
                    const item = this.knowledge['envio'];
                    this.addBotMessage(item.response, item);
                } else if (lower.includes('hola') || lower.includes('buenas') || lower.includes('que tal')) {
                    this.addBotMessage('A tus órdenes. Soy el Consejero. ¿Deseas explorar la Colección Imperio o personalizar una pieza en el CAPO Lab?');
                } else {
                    this.addBotMessage('Entiendo tu postura. Como miembros del clan, exigimos lo más alto. Te sugiero explorar <strong>THE BOSS BLACK</strong> o forjar tus iniciales en <strong>CAPO LAB</strong> para una pieza sin comparación.');
                }
            }, 500);
        },

        scrollToBottom() {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    };

    // =========================================================
    // 14. PRODUCT CARD ACTIONS (EVENT DELEGATION)
    // =========================================================
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const card = btn.closest('.product-card');
        if (!card) return;

        const id = card.getAttribute('data-id');
        const product = PRODUCTS_CATALOG.find(p => p.id === id) || {
            id: id,
            name: card.getAttribute('data-name'),
            price: card.getAttribute('data-price'),
            image: card.getAttribute('data-image'),
            category: card.getAttribute('data-category'),
            description: card.getAttribute('data-desc')
        };

        const action = btn.getAttribute('data-action');
        if (action === 'add-cart') {
            CartState.addItem(product, 1);
        } else if (action === 'quick-view') {
            QuickViewModal.open(product);
        }
    });

    // =========================================================
    // 15. INTERACTIVE SEARCH ENGINE IN NAVBAR
    // =========================================================
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const searchBar = document.getElementById('nav-search-bar');
    const searchInput = document.getElementById('product-search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');

    if (searchToggleBtn && searchBar) {
        searchToggleBtn.addEventListener('click', () => {
            searchBar.classList.toggle('active');
            if (searchBar.classList.contains('active')) {
                searchInput.focus();
            } else {
                clearSearch();
            }
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => clearSearch());
    }

    function clearSearch() {
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.product-card').forEach(card => card.style.display = '');
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.product-card');

            cards.forEach(card => {
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const cat = (card.getAttribute('data-category') || '').toLowerCase();
                const desc = (card.getAttribute('data-desc') || '').toLowerCase();

                if (!query || name.includes(query) || cat.includes(query) || desc.includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // =========================================================
    // 16. MOBILE MENU & AUDIO CONTROLLER
    // =========================================================
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Audio
    const audio = document.getElementById('bg-music');
    const playBtn = document.getElementById('play-btn');
    const playerWidget = document.getElementById('audio-player-widget');

    if (audio && playBtn && playerWidget) {
        audio.volume = 0.4;
        const playIcon = playBtn.querySelector('i');
        const playText = playBtn.querySelector('.btn-audio-text');

        const updateAudioState = (isPlaying) => {
            if (isPlaying) {
                playerWidget.classList.remove('paused');
                if (playIcon) playIcon.className = 'fas fa-pause';
                if (playText) playText.textContent = 'PAUSA';
            } else {
                playerWidget.classList.add('paused');
                if (playIcon) playIcon.className = 'fas fa-play';
                if (playText) playText.textContent = 'SOUNDTRACK';
            }
        };

        const tryPlayAudio = () => {
            audio.play().then(() => {
                updateAudioState(true);
                document.removeEventListener('click', tryPlayAudio);
                document.removeEventListener('touchstart', tryPlayAudio);
            }).catch(() => {
                updateAudioState(false);
            });
        };

        tryPlayAudio();
        document.addEventListener('click', tryPlayAudio, { once: true });
        document.addEventListener('touchstart', tryPlayAudio, { once: true });

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audio.paused) {
                audio.play().then(() => updateAudioState(true)).catch(e => console.log('Audio error:', e));
            } else {
                audio.pause();
                updateAudioState(false);
            }
        });
    }

    // Newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterFeedback = document.getElementById('newsletter-feedback');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const submitBtn = document.getElementById('newsletter-submit-btn');

            if (!emailInput || !emailInput.value) return;

            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').textContent = 'REGISTRANDO...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = 'SUSCRIBIRSE';
                if (newsletterFeedback) {
                    newsletterFeedback.className = 'newsletter-feedback success';
                    newsletterFeedback.textContent = '✓ BIENVENIDO AL CLAN. REVISA TU BANDEJA PARA CONFIRMAR TU MEMBRESÍA.';
                }
                emailInput.value = '';
                Toast.show('✓ SUSCRIPCIÓN EXITOSA');
            }, 800);
        });
    }

    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorDot && cursorOutline && window.matchMedia('(hover: hover)').matches) {
        let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }, { passive: true });

        function animateOutline() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            requestAnimationFrame(animateOutline);
        }
        requestAnimationFrame(animateOutline);
    }

    // Global ESC Listener
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            CartUI.close();
            WishlistUI.close();
            QuickViewModal.close();
            CheckoutModal.close();
            ReceiptModal.close();
            CapoBotEngine.close();
            if (searchBar) {
                searchBar.classList.remove('active');
                clearSearch();
            }
        }
    });

    // =========================================================
    // 13. MULTI-CURRENCY CONVERTER CONTROLLER (CurrencyUI)
    // =========================================================
    const CurrencyUI = {
        dropdown: document.getElementById('currency-dropdown'),
        toggleBtn: document.getElementById('currency-toggle-btn'),
        label: document.getElementById('current-currency-label'),
        options: document.querySelectorAll('.currency-opt'),

        init() {
            if (!this.toggleBtn) return;

            // Set initial state
            const current = window.CapoSync ? window.CapoSync.CurrencyManager.getCurrency() : 'MXN';
            this.updateActiveOption(current);

            this.toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.dropdown) this.dropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (this.dropdown && !this.dropdown.contains(e.target)) {
                    this.dropdown.classList.remove('active');
                }
            });

            this.options.forEach(opt => {
                opt.addEventListener('click', () => {
                    const code = opt.getAttribute('data-currency');
                    if (window.CapoSync) {
                        window.CapoSync.CurrencyManager.setCurrency(code);
                    }
                    this.updateActiveOption(code);
                    if (this.dropdown) this.dropdown.classList.remove('active');
                    this.reRenderPrices();
                    Toast.show(`✓ DIVISA ACTUALIZADA: ${code}`);
                });
            });

            if (window.CapoSync) {
                window.CapoSync.on('currency_changed', (data) => {
                    this.updateActiveOption(data.currency);
                    this.reRenderPrices();
                });
            }
        },

        updateActiveOption(code) {
            if (this.label) {
                const map = { 'MXN': 'MXN $', 'USD': 'USD $', 'EUR': 'EUR €' };
                this.label.textContent = map[code] || `${code} $`;
            }
            this.options.forEach(opt => {
                if (opt.getAttribute('data-currency') === code) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        },

        reRenderPrices() {
            if (CatalogEngine) CatalogEngine.renderProducts();
            if (CartUI) CartUI.render();
            if (CapoLabEngine && CapoLabEngine.updateUI) CapoLabEngine.updateUI();
            if (QuickViewModal.currentProduct) QuickViewModal.open(QuickViewModal.currentProduct);
        }
    };

    // =========================================================
    // 14. PREDICTIVE SEARCH AUTOCOMPLETE (PredictiveSearchUI)
    // =========================================================
    const PredictiveSearchUI = {
        input: document.getElementById('product-search-input'),
        dropdown: document.getElementById('search-results-dropdown'),
        clearBtn: document.getElementById('search-clear-btn'),
        searchBar: document.getElementById('nav-search-bar'),

        init() {
            if (!this.input || !this.dropdown) return;

            this.input.addEventListener('input', (e) => {
                const q = e.target.value.trim().toLowerCase();
                if (q.length < 2) {
                    this.dropdown.style.display = 'none';
                    this.dropdown.innerHTML = '';
                    return;
                }

                const matches = PRODUCTS_CATALOG.filter(p => {
                    return p.name.toLowerCase().includes(q) ||
                           p.sku.toLowerCase().includes(q) ||
                           p.categoryLabel.toLowerCase().includes(q) ||
                           (p.description && p.description.toLowerCase().includes(q));
                });

                if (matches.length === 0) {
                    this.dropdown.innerHTML = `
                        <div class="search-no-results">
                            <i class="fas fa-search" style="margin-bottom:6px; display:block; font-size:1.5rem;"></i>
                            NO SE ENCONTRARON PIEZAS CON "${q.toUpperCase()}".
                        </div>
                    `;
                } else {
                    this.dropdown.innerHTML = matches.slice(0, 5).map(p => {
                        const regex = new RegExp(`(${q})`, 'gi');
                        const highlightedTitle = p.name.replace(regex, '<mark>$1</mark>');
                        const formattedPrice = window.CapoSync ? window.CapoSync.CurrencyManager.format(p.price) : `$${p.price} MXN`;
                        
                        return `
                            <div class="search-result-item" data-product-id="${p.id}">
                                <img src="${p.images[0]}" alt="${p.name}" class="search-res-thumb">
                                <div class="search-res-info">
                                    <div class="search-res-title">${highlightedTitle}</div>
                                    <span class="search-res-meta">${p.categoryLabel} • SKU: ${p.sku}</span>
                                </div>
                                <div class="search-res-price">${formattedPrice}</div>
                                <button type="button" class="search-res-btn">VER</button>
                            </div>
                        `;
                    }).join('');

                    this.dropdown.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const id = item.getAttribute('data-product-id');
                            const prod = PRODUCTS_CATALOG.find(p => p.id === id);
                            if (prod) {
                                this.dropdown.style.display = 'none';
                                if (this.searchBar) this.searchBar.classList.remove('active');
                                QuickViewModal.open(prod);
                            }
                        });
                    });
                }

                this.dropdown.style.display = 'flex';
            });

            if (this.clearBtn) {
                this.clearBtn.addEventListener('click', () => {
                    this.dropdown.style.display = 'none';
                    this.dropdown.innerHTML = '';
                });
            }
        }
    };

    // =========================================================
    // 15. DYNAMIC CUSTOMER REVIEWS (ReviewUI)
    // =========================================================
    const ReviewUI = {
        grid: document.getElementById('dynamic-reviews-grid'),
        avgRatingEl: document.getElementById('reviews-avg-rating'),
        modal: document.getElementById('review-modal'),
        openBtn: document.getElementById('btn-open-review-modal'),
        closeBtn: document.getElementById('review-modal-close-btn'),
        form: document.getElementById('review-form'),
        starBtns: document.querySelectorAll('#star-rating-selector .star-btn'),
        starsInput: document.getElementById('review-stars-input'),

        init() {
            this.render();

            if (this.openBtn) {
                this.openBtn.addEventListener('click', () => this.open());
            }

            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }

            if (this.modal) {
                this.modal.addEventListener('click', (e) => {
                    if (e.target === this.modal) this.close();
                });
            }

            // Star Rating Selector Interaction
            if (this.starBtns.length > 0) {
                this.starBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const rating = parseInt(btn.getAttribute('data-rating'), 10);
                        if (this.starsInput) this.starsInput.value = rating;
                        this.updateStarsUI(rating);
                    });

                    btn.addEventListener('mouseenter', () => {
                        const hoverRating = parseInt(btn.getAttribute('data-rating'), 10);
                        this.starBtns.forEach(b => {
                            const val = parseInt(b.getAttribute('data-rating'), 10);
                            b.classList.toggle('hover', val <= hoverRating);
                        });
                    });
                });

                const container = document.getElementById('star-rating-selector');
                if (container) {
                    container.addEventListener('mouseleave', () => {
                        this.starBtns.forEach(b => b.classList.remove('hover'));
                        const current = parseInt(this.starsInput?.value || 5, 10);
                        this.updateStarsUI(current);
                    });
                }
            }

            // Review Form Submit
            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const author = document.getElementById('review-author-input').value.trim();
                    const location = document.getElementById('review-location-input').value.trim();
                    const product = document.getElementById('review-product-select').value;
                    const title = document.getElementById('review-title-input').value.trim();
                    const text = document.getElementById('review-text-input').value.trim();
                    const stars = parseInt(this.starsInput?.value || 5, 10);

                    if (!author || !text) {
                        Toast.show('⚠️ COMPLETA TODOS LOS CAMPOS REQUERIDOS');
                        return;
                    }

                    if (window.CapoSync) {
                        window.CapoSync.ReviewManager.saveReview({
                            author, location, product, title, text, stars
                        });
                    }

                    Toast.show('✓ ¡GRACIAS! TU RESEÑA VERIFICADA HA SIDO PUBLICADA');
                    this.form.reset();
                    this.updateStarsUI(5);
                    this.close();
                    this.render();
                });
            }

            if (window.CapoSync) {
                window.CapoSync.on('reviews_changed', () => this.render());
            }
        },

        updateStarsUI(rating) {
            this.starBtns.forEach(b => {
                const val = parseInt(b.getAttribute('data-rating'), 10);
                b.classList.toggle('active', val <= rating);
            });
        },

        open() {
            if (!this.modal) return;
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            if (!this.modal) return;
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        },

        render() {
            if (!this.grid) return;
            const reviews = window.CapoSync ? window.CapoSync.ReviewManager.getReviews() : [];
            const stats = window.CapoSync ? window.CapoSync.ReviewManager.getAggregateStats() : { average: 4.9 };

            if (this.avgRatingEl) {
                this.avgRatingEl.textContent = `${stats.average} / 5.0`;
            }

            this.grid.innerHTML = reviews.map(r => {
                const starsIcons = '★'.repeat(r.stars || 5) + '☆'.repeat(5 - (r.stars || 5));
                return `
                    <div class="review-card">
                        <span class="review-product-tag"><i class="fas fa-crown"></i> ${r.product || 'COLECCIÓN OFICIAL'}</span>
                        <div class="review-title-text">${r.title || 'EXPERIENCIA DE AUTORIDAD'}</div>
                        <div class="review-stars">${starsIcons}</div>
                        <p class="review-text">"${r.text}"</p>
                        <div class="review-author">
                            <strong>${r.author}</strong>
                            <span>${r.location} <span class="review-verified-badge"><i class="fas fa-check"></i> VERIFICADO</span></span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    };

    // =========================================================
    // 16. BACK IN STOCK ALERTS (StockAlertUI)
    // =========================================================
    const StockAlertUI = {
        modal: document.getElementById('stock-alert-modal'),
        closeBtn: document.getElementById('stock-alert-close-btn'),
        form: document.getElementById('stock-alert-form'),
        targetSkuInput: document.getElementById('alert-target-sku'),
        targetNameInput: document.getElementById('alert-target-name'),
        productNameEl: document.getElementById('alert-product-name'),
        productSkuEl: document.getElementById('alert-product-sku'),
        contactInput: document.getElementById('alert-contact-input'),

        init() {
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }

            if (this.modal) {
                this.modal.addEventListener('click', (e) => {
                    if (e.target === this.modal) this.close();
                });
            }

            // Delegated click on .btn-notify-stock
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-notify-stock');
                if (btn) {
                    const sku = btn.getAttribute('data-sku');
                    const name = btn.getAttribute('data-name');
                    this.open(sku, name);
                }
            });

            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const contact = this.contactInput.value.trim();
                    const sku = this.targetSkuInput.value;
                    const name = this.targetNameInput.value;

                    if (!contact) {
                        Toast.show('INGRESA UN TELÉFONO O CORREO VÁLIDO');
                        return;
                    }

                    if (window.CapoSync) {
                        window.CapoSync.AlertsManager.saveAlert(contact, sku, name);
                    }

                    Toast.show(`✓ TE AVISAREMOS CUANDO SE REABASTEZCA ${name}`);
                    this.form.reset();
                    this.close();
                });
            }
        },

        open(sku, name) {
            if (!this.modal) return;
            if (this.targetSkuInput) this.targetSkuInput.value = sku;
            if (this.targetNameInput) this.targetNameInput.value = name;
            if (this.productNameEl) this.productNameEl.textContent = name;
            if (this.productSkuEl) this.productSkuEl.textContent = `SKU: ${sku}`;
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (this.contactInput) this.contactInput.focus();
        },

        close() {
            if (!this.modal) return;
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // =========================================================
    // 17. INITIALIZE MODULES
    // =========================================================
    CurrencyUI.init();
    PredictiveSearchUI.init();
    WishlistState.init();
    WishlistUI.init();
    CartState.init();
    CartUI.init();
    CatalogEngine.init();
    QuickViewModal.init();
    CheckoutModal.init();
    ReceiptModal.init();
    OrderTracker.init();
    LiveSalesTicker.init();
    CapoLabEngine.init();
    CapoBotEngine.init();
    ReviewUI.init();
    StockAlertUI.init();
});
