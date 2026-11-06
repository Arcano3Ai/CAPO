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

    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.setAttribute('muted', '');
        heroVideo.setAttribute('playsinline', '');
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                window.addEventListener('click', () => heroVideo.play(), { once: true });
                window.addEventListener('touchstart', () => heroVideo.play(), { once: true });
                window.addEventListener('scroll', () => heroVideo.play(), { once: true });
            });
        }
    }

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
            this.mainGrid.innerHTML = filtered.map(p => `
                <article class="product-card" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.images[0]}" data-category="${p.category}" data-desc="${p.description}">
                    <div class="product-badge ${p.category === 'oro' ? 'gold-badge' : ''}">${p.badge}</div>
                    <button type="button" class="btn-wishlist-card ${WishlistState.has(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Guardar en favoritos">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="product-image">
                        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
                        <div class="card-action-overlay">
                            <button type="button" class="btn-quick-view" data-action="quick-view">DETALLES</button>
                            <button type="button" class="btn-add-cart" data-action="add-cart">AGREGAR $${p.price}</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="product-category">${p.categoryLabel}</span>
                            <span style="font-size:0.75rem; color:#888;">★ ${p.rating} (${p.reviewCount})</span>
                        </div>
                        <h3>${p.name}</h3>
                        <p class="price">$${p.price} <span class="currency">MXN</span> <span class="original-price" style="font-size:0.85rem; margin-left:6px;">$${p.originalPrice}</span></p>
                    </div>
                </article>
            `).join('');

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
            if (this.priceEl) this.priceEl.textContent = `$${parseFloat(full.price).toLocaleString()} MXN`;

            if (this.origPriceEl && full.originalPrice) {
                this.origPriceEl.textContent = `$${full.originalPrice.toLocaleString()} MXN`;
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

            if (this.stockBadge) {
                const stock = full.stock || 4;
                this.stockBadge.textContent = `⚠️ SÓLO QUEDAN ${stock} PIEZAS EN ESTE LOTE`;
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
                            <div class="cart-item-price">$${item.price.toLocaleString()} MXN</div>
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

            if (this.subtotalEl) this.subtotalEl.textContent = `$${subtotal.toLocaleString()} MXN`;

            if (this.discountLine && this.discountVal) {
                if (discount > 0) {
                    this.discountLine.style.display = 'flex';
                    this.discountVal.textContent = `-$${discount.toLocaleString()} MXN (${CartState.appliedCoupon.code})`;
                } else {
                    this.discountLine.style.display = 'none';
                }
            }

            if (this.shippingCostEl) {
                this.shippingCostEl.textContent = shipping === 0 ? (count === 0 ? '$0 MXN' : 'GRATIS') : `$${shipping} MXN`;
            }
            if (this.totalEl) this.totalEl.textContent = `$${total.toLocaleString()} MXN`;
        }
    };

    // =========================================================
    // 8. CHECKOUT MODAL, WHATSAPP DISPATCHER & RECEIPT
    // =========================================================
    const CheckoutModal = {
        overlay: document.getElementById('checkout-modal'),
        closeBtn: document.getElementById('checkout-close-btn'),
        form: document.getElementById('checkout-form'),
        summaryItems: document.getElementById('checkout-summary-items'),
        summaryTotal: document.getElementById('checkout-summary-total'),
        whatsappBtn: document.getElementById('btn-whatsapp-order'),
        whatsappShareBtn: document.getElementById('btn-whatsapp-success-share'),
        viewReceiptBtn: document.getElementById('btn-view-receipt'),
        successScreen: document.getElementById('order-success-screen'),
        successOrderId: document.getElementById('order-success-id'),
        finishSuccessBtn: document.getElementById('btn-finish-success'),
        lastGeneratedOrder: null,

        init() {
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }

            document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    document.querySelectorAll('.payment-radio').forEach(r => r.classList.remove('active'));
                    radio.closest('.payment-radio').classList.add('active');
                });
            });

            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.processOrder('card_or_spei');
                });
            }

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

            if (this.whatsappShareBtn) {
                this.whatsappShareBtn.addEventListener('click', () => {
                    if (this.lastGeneratedOrder) {
                        this.openWhatsApp(this.lastGeneratedOrder);
                    }
                });
            }

            if (this.viewReceiptBtn) {
                this.viewReceiptBtn.addEventListener('click', () => {
                    if (this.lastGeneratedOrder) {
                        ReceiptModal.open(this.lastGeneratedOrder);
                    }
                });
            }

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

            const count = CartState.getCount();
            const total = CartState.getTotal();

            if (this.summaryItems) this.summaryItems.textContent = `${count} ${count === 1 ? 'PIEZA' : 'PIEZAS'}`;
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
            const cp = document.getElementById('order-cp').value.trim() || '00000';
            const address = document.getElementById('order-address').value.trim() || 'Dirección confirmada';
            const paymentInput = document.querySelector('input[name="payment-method"]:checked');
            const paymentMethod = paymentInput ? paymentInput.value : 'card';

            const methodLabels = {
                'card': 'Tarjeta Débito / Crédito (Stripe)',
                'transfer': 'Transferencia SPEI Inmediata',
                'cod': 'Pago contra Entrega (CDMX)'
            };

            const randomId = '#CAPO-' + Math.floor(100000 + Math.random() * 900000);

            return {
                orderId: randomId,
                name: name,
                phone: phone,
                email: email,
                cp: cp,
                address: address,
                paymentMethod: methodLabels[paymentMethod] || 'Tarjeta',
                items: [...CartState.items],
                subtotal: CartState.getSubtotal(),
                discount: CartState.getDiscountAmount(),
                shipping: CartState.getShippingCost(),
                total: CartState.getTotal(),
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
                msg += `*Descuento:* -$${order.discount.toLocaleString()} MXN\n`;
            }
            msg += `*Envío:* ${order.shipping === 0 ? 'GRATIS' : `$${order.shipping} MXN`}\n`;
            msg += `*TOTAL A LIQUIDAR:* $${order.total.toLocaleString()} MXN\n\n`;
            msg += `_Solicito confirmación de inventario y envío de este pedido._`;

            const encoded = encodeURIComponent(msg);
            const waUrl = `https://wa.me/${WHATSAPP_STORE_PHONE}?text=${encoded}`;
            window.open(waUrl, '_blank');
        },

        processOrder(type = 'card_or_spei') {
            const submitBtn = document.getElementById('btn-submit-order');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'PROCESANDO TRANSACCIÓN...';

            const order = this.buildOrderPayload();
            this.lastGeneratedOrder = order;

            // Save order in history
            try {
                const history = JSON.parse(localStorage.getItem('capo_order_history') || '[]');
                history.unshift(order);
                localStorage.setItem('capo_order_history', JSON.stringify(history.slice(0, 10)));
            } catch (e) {}

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                if (this.successOrderId) this.successOrderId.textContent = order.orderId;

                this.form.style.display = 'none';
                this.successScreen.style.display = 'block';

                if (type === 'whatsapp') {
                    this.openWhatsApp(order);
                }

                CartState.clear();
            }, 1000);
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
        recCustomer: document.getElementById('rec-customer'),
        recMethod: document.getElementById('rec-method'),
        itemsBody: document.getElementById('rec-items-body'),
        recSub: document.getElementById('rec-sub'),
        recShip: document.getElementById('rec-ship'),
        recTotal: document.getElementById('rec-total'),

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
            this.recId.textContent = order.orderId;
            this.recDate.textContent = order.date;
            this.recCustomer.textContent = order.name;
            this.recMethod.textContent = order.paymentMethod;

            this.itemsBody.innerHTML = order.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>x${item.quantity}</td>
                    <td>$${(item.price * item.quantity).toLocaleString()} MXN</td>
                </tr>
            `).join('');

            this.recSub.textContent = `$${order.subtotal.toLocaleString()} MXN`;
            this.recShip.textContent = order.shipping === 0 ? 'GRATIS' : `$${order.shipping} MXN`;
            this.recTotal.textContent = `$${order.total.toLocaleString()} MXN`;

            this.overlay.classList.add('active');
        },

        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('active');
        }
    };

    // =========================================================
    // 10. ORDER TRACKING RADAR
    // =========================================================
    const OrderTracker = {
        form: document.getElementById('tracking-form'),
        input: document.getElementById('tracking-input'),
        resultBox: document.getElementById('tracking-result'),
        orderIdDisplay: document.getElementById('track-order-id'),
        statusDisplay: document.getElementById('track-status-text'),

        init() {
            if (!this.form) return;
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                const q = this.input.value.trim().toUpperCase();
                if (!q) return;

                this.orderIdDisplay.textContent = q.startsWith('#') ? q : `#CAPO-${q}`;
                this.resultBox.style.display = 'block';
                this.resultBox.scrollIntoView({ behavior: 'smooth' });
                Toast.show(`✓ ENVÍO LOCALIZADO: EN RUTA EXPRESS`);
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
    // 17. INITIALIZE MODULES
    // =========================================================
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
});
