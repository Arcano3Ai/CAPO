/**
 * CAPO Store - Core Application Engine
 * Architecture: Clean, Event-Driven & Modular Vanilla JS
 * Version: 2.1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================
    // 0. PWA SERVICE WORKER REGISTRATION
    // =========================================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('✓ Service Worker registrado:', reg.scope))
                .catch(err => console.warn('Service Worker registration skipped:', err));
        });
    }

    // =========================================================
    // 1. STATE MANAGEMENT: CART, COUPONS & STORAGE
    // =========================================================
    const CART_STORAGE_KEY = 'capo_store_cart_v2';
    const COUPON_STORAGE_KEY = 'capo_applied_coupon_v2';
    const FREE_SHIPPING_THRESHOLD = 1500;
    const STANDARD_SHIPPING_COST = 149;
    const WHATSAPP_STORE_PHONE = '5215500000000'; // Número oficial de pedidos CAPO

    const AVAILABLE_COUPONS = {
        'CAPO10': { type: 'percent', value: 10, label: '10% OFF EN TU ORDEN' },
        'LEGADO20': { type: 'percent', value: 20, label: '20% OFF EXCLUSIVO' },
        'CONSEJERO15': { type: 'percent', value: 15, label: '15% OFF VIP CONSEJERO' },
        'ENVIOVIP': { type: 'free_shipping', value: 0, label: 'ENVÍO GRATIS INCONDICIONAL' }
    };

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
                console.warn('LocalStorage not available, falling back to in-memory state.', e);
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
            } catch (e) {
                console.warn('Could not save cart state to localStorage.', e);
            }
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
                    image: product.image,
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

        removeCoupon() {
            this.appliedCoupon = null;
            this.save();
            Toast.show('CUPÓN REMOVIDO');
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
    // 2. TOAST NOTIFICATIONS COMPONENT
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
    // 3. CART UI & DRAWER CONTROLLER
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

            // Coupon Button Handler
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

            // Delegated events inside cart items container
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
            this.drawer.setAttribute('aria-hidden', 'false');
            this.overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.drawer.classList.remove('active');
            this.overlay.classList.remove('active');
            this.drawer.setAttribute('aria-hidden', 'true');
            this.overlay.setAttribute('aria-hidden', 'true');
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

            // Update badge & drawer count
            if (this.badge) {
                this.badge.textContent = count;
                this.badge.style.display = count > 0 ? 'flex' : 'none';
            }
            if (this.drawerCount) {
                this.drawerCount.textContent = `(${count} ${count === 1 ? 'PIEZA' : 'PIEZAS'})`;
            }

            // Update Shipping Notice Bar
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

            // Render Items
            if (!this.itemsContainer) return;

            if (CartState.items.length === 0) {
                this.itemsContainer.innerHTML = `
                    <div class="cart-empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>TU ARSENAL ESTÁ VACÍO.</p>
                        <a href="#coleccion" class="btn-secondary" style="font-size: 0.85rem; padding: 0.8rem 1.5rem;" onclick="CartUI.close()">EXPLORAR PIEZAS</a>
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

            // Update Financial Summaries
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
    // 4. QUICK VIEW MODAL CONTROLLER
    // =========================================================
    const QuickViewModal = {
        overlay: document.getElementById('quick-view-modal'),
        closeBtn: document.getElementById('quick-view-close-btn'),
        imgEl: document.getElementById('qv-img'),
        titleEl: document.getElementById('qv-title'),
        categoryEl: document.getElementById('qv-category'),
        priceEl: document.getElementById('qv-price'),
        descEl: document.getElementById('qv-desc'),
        qtyInput: document.getElementById('qv-qty-input'),
        qtyMinus: document.getElementById('qv-qty-minus'),
        qtyPlus: document.getElementById('qv-qty-plus'),
        addBtn: document.getElementById('qv-add-cart-btn'),
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
            this.currentProduct = product;
            if (this.imgEl) this.imgEl.src = product.image;
            if (this.titleEl) this.titleEl.textContent = product.name;
            if (this.categoryEl) this.categoryEl.textContent = `LÍNEA ${(product.category || 'CAPO').toUpperCase()}`;
            if (this.priceEl) this.priceEl.textContent = `$${parseFloat(product.price).toLocaleString()} MXN`;
            if (this.descEl) this.descEl.textContent = product.desc || 'Gorra de lujo con materiales de grado automotriz y bordado de alta precisión.';
            if (this.qtyInput) this.qtyInput.value = 1;

            this.overlay.classList.add('active');
            this.overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.overlay.classList.remove('active');
            this.overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            this.currentProduct = null;
        }
    };

    // =========================================================
    // 5. CHECKOUT MODAL & WHATSAPP DISPATCHER
    // =========================================================
    const CheckoutModal = {
        overlay: document.getElementById('checkout-modal'),
        closeBtn: document.getElementById('checkout-close-btn'),
        form: document.getElementById('checkout-form'),
        summaryItems: document.getElementById('checkout-summary-items'),
        summaryTotal: document.getElementById('checkout-summary-total'),
        whatsappBtn: document.getElementById('btn-whatsapp-order'),
        whatsappShareBtn: document.getElementById('btn-whatsapp-success-share'),
        successScreen: document.getElementById('order-success-screen'),
        successOrderId: document.getElementById('order-success-id'),
        finishSuccessBtn: document.getElementById('btn-finish-success'),
        lastGeneratedOrder: null,

        init() {
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }

            // Radio button styling feedback
            const radios = document.querySelectorAll('input[name="payment-method"]');
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    document.querySelectorAll('.payment-radio').forEach(r => r.classList.remove('active'));
                    radio.closest('.payment-radio').classList.add('active');
                });
            });

            // Form Submit Simulation
            if (this.form) {
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.processOrder('card_or_spei');
                });
            }

            // Direct WhatsApp Order Button
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
            this.overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        },

        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('active');
            this.overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        },

        buildOrderPayload() {
            const name = document.getElementById('order-name').value.trim() || 'Cliente VIP';
            const phone = document.getElementById('order-phone').value.trim() || 'Sin teléfono';
            const address = document.getElementById('order-address').value.trim() || 'Dirección por confirmar';
            const paymentInput = document.querySelector('input[name="payment-method"]:checked');
            const paymentMethod = paymentInput ? paymentInput.value : 'card';

            const methodLabels = {
                'card': 'Tarjeta Débito / Crédito',
                'transfer': 'Transferencia SPEI Inmediata',
                'cod': 'Pago contra Entrega'
            };

            const randomId = '#CAPO-' + Math.floor(100000 + Math.random() * 900000);

            return {
                orderId: randomId,
                name: name,
                phone: phone,
                address: address,
                paymentMethod: methodLabels[paymentMethod] || 'Tarjeta',
                items: [...CartState.items],
                subtotal: CartState.getSubtotal(),
                discount: CartState.getDiscountAmount(),
                shipping: CartState.getShippingCost(),
                total: CartState.getTotal()
            };
        },

        openWhatsApp(order) {
            let msg = `👑 *ORDEN OFICIAL CAPO STORE*\n`;
            msg += `*Folio:* ${order.orderId}\n`;
            msg += `*Cliente:* ${order.name}\n`;
            msg += `*Teléfono:* ${order.phone}\n`;
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

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                if (this.successOrderId) this.successOrderId.textContent = order.orderId;

                this.form.style.display = 'none';
                this.successScreen.style.display = 'block';

                if (type === 'whatsapp') {
                    this.openWhatsApp(order);
                }

                // Empty cart after successful order
                CartState.clear();
            }, 1000);
        }
    };

    // =========================================================
    // 6. CATALOG ENGINE: FILTERING & SORTING
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

            // Filter Tabs Click
            this.filterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.filterTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentFilter = tab.getAttribute('data-filter') || 'all';
                    this.applyFilterAndSort();
                });
            });

            // Sort Select Change
            if (this.sortSelect) {
                this.sortSelect.addEventListener('change', (e) => {
                    this.currentSort = e.target.value;
                    this.applyFilterAndSort();
                });
            }
        },

        applyFilterAndSort() {
            const cards = Array.from(this.mainGrid.querySelectorAll('.product-card'));
            let visibleCount = 0;

            // 1. Filter
            cards.forEach(card => {
                const category = card.getAttribute('data-category') || '';
                const matches = (this.currentFilter === 'all') || (category === this.currentFilter);

                if (matches) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // 2. Sort visible cards
            const visibleCards = cards.filter(card => card.style.display !== 'none');

            visibleCards.sort((a, b) => {
                const priceA = parseFloat(a.getAttribute('data-price')) || 0;
                const priceB = parseFloat(b.getAttribute('data-price')) || 0;
                const nameA = (a.getAttribute('data-name') || '').toLowerCase();
                const nameB = (b.getAttribute('data-name') || '').toLowerCase();

                if (this.currentSort === 'price-asc') return priceA - priceB;
                if (this.currentSort === 'price-desc') return priceB - priceA;
                if (this.currentSort === 'alpha') return nameA.localeCompare(nameB);
                return 0; // Default featured
            });

            // Re-append sorted cards
            visibleCards.forEach(card => this.mainGrid.appendChild(card));

            // Update count badge
            if (this.countBadge) {
                this.countBadge.textContent = `MOSTRANDO ${visibleCount} ${visibleCount === 1 ? 'PIEZA' : 'PIEZAS'}`;
            }
        }
    };

    // =========================================================
    // 7. INFORMATIONAL POLICY MODAL
    // =========================================================
    const InfoModal = {
        overlay: document.getElementById('info-modal'),
        closeBtn: document.getElementById('info-modal-close-btn'),
        titleEl: document.getElementById('info-modal-title'),
        bodyEl: document.getElementById('info-modal-body'),

        contents: {
            terminos: {
                title: 'TÉRMINOS & CONDICIONES',
                body: `
                    <p><strong>1. PROPIEDAD INTELECTUAL:</strong> Todos los diseños de gorras, monogramas, logotipos y contenido multimedia exhibido en CAPO son propiedad registrada y protegida.</p>
                    <p style="margin-top:10px;"><strong>2. DISPONIBILIDAD:</strong> Los lotes son de producción limitada. Una vez agotado el tiraje de un modelo numerado, no se garantizan re-stocking futuros.</p>
                    <p style="margin-top:10px;"><strong>3. PRECIOS:</strong> Todos los precios están expresados en Pesos Mexicanos (MXN) e incluyen impuestos correspondientes.</p>
                `
            },
            privacidad: {
                title: 'AVISO DE PRIVACIDAD',
                body: `
                    <p>En CAPO protegemos tus datos personales con cifrado de grado militar. Tu información de contacto y domicilio se utiliza única y exclusivamente para procesar tu orden, entrega blindada y membresía en lanzamientos privados.</p>
                    <p style="margin-top:10px;">Nunca vendemos ni compartimos tu base de datos con intermediarios comerciales.</p>
                `
            },
            envios: {
                title: 'ENVÍOS & DEVOLUCIONES',
                body: `
                    <p><strong>TIEMPOS DE ENTREGA:</strong> Despachamos todos los pedidos en menos de 24 horas hábiles mediante paquetería express asegurada (DHL / FedEx Express).</p>
                    <p style="margin-top:10px;"><strong>EMBALAJE BLINDADO:</strong> Cada gorra se despacha en caja rígida protectora indeformable para asegurar que la corona mantenga su estructura perfecta.</p>
                    <p style="margin-top:10px;"><strong>GARANTÍA:</strong> Tienes 15 días naturales para cambios por talla o defectos de fábrica sin costo adicional.</p>
                `
            },
            autenticidad: {
                title: 'CERTIFICADO DE AUTENTICIDAD',
                body: `
                    <p>Cada pieza de la Colección Imperio y Oro Negro incluye un certificado holográfico con número de serie único y sello de calidad verificado.</p>
                    <p style="margin-top:10px;">El código QR incluido en la etiqueta te permite verificar en línea la autenticidad de tu pieza en el registro oficial CAPO.</p>
                `
            }
        },

        init() {
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) this.close();
                });
            }

            document.querySelectorAll('.footer-modal-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const key = link.getAttribute('data-modal');
                    if (this.contents[key]) {
                        this.open(this.contents[key].title, this.contents[key].body);
                    }
                });
            });
        },

        open(title, body) {
            if (this.titleEl) this.titleEl.textContent = title;
            if (this.bodyEl) this.bodyEl.innerHTML = body;
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // =========================================================
    // 8. PRODUCT CARD ACTIONS LISTENER (DELEGATION)
    // =========================================================
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const card = btn.closest('.product-card');
        if (!card) return;

        const product = {
            id: card.getAttribute('data-id') || 'capo-item',
            name: card.getAttribute('data-name') || card.querySelector('h3').textContent.trim(),
            price: card.getAttribute('data-price') || 899,
            image: card.getAttribute('data-image') || card.querySelector('img').src,
            category: card.getAttribute('data-category') || 'capo',
            desc: card.getAttribute('data-desc') || ''
        };

        const action = btn.getAttribute('data-action');

        if (action === 'add-cart') {
            CartState.addItem(product, 1);
        } else if (action === 'quick-view') {
            QuickViewModal.open(product);
        }
    });

    // =========================================================
    // 9. INTERACTIVE SEARCH ENGINE IN NAVBAR
    // =========================================================
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const searchBar = document.getElementById('nav-search-bar');
    const searchInput = document.getElementById('product-search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const productCards = document.querySelectorAll('.product-card');

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
        productCards.forEach(card => card.style.display = '');
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                productCards.forEach(card => card.style.display = '');
                return;
            }

            productCards.forEach(card => {
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const cat = (card.getAttribute('data-category') || '').toLowerCase();
                const desc = (card.getAttribute('data-desc') || '').toLowerCase();

                if (name.includes(query) || cat.includes(query) || desc.includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // =========================================================
    // 10. MOBILE MENU CONTROLLER
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

    // =========================================================
    // 11. NEWSLETTER FORM HANDLER
    // =========================================================
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

    // =========================================================
    // 12. AUDIO PLAYER & EQUALIZER CONTROLLER
    // =========================================================
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

    // =========================================================
    // 13. CUSTOM CURSOR (60FPS RAF PERFORMANCE)
    // =========================================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline && window.matchMedia('(hover: hover)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let outlineX = 0;
        let outlineY = 0;

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

    // =========================================================
    // 14. CAPO LAB (INTERACTIVE CAP CUSTOMIZER)
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

            // Base options click
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

            // Finish swatch click
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

            // Monogram text input
            if (this.monogramInput) {
                this.monogramInput.addEventListener('input', (e) => {
                    const clean = (e.target.value || '').toUpperCase().slice(0, 3);
                    this.state.monogram = clean || 'CP';
                    this.updateUI();
                });
            }

            // Add Custom Hat to Cart
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
    // 15. "EL CONSEJERO DEL CAPO" (AI STYLIST & CONCIERGE BOT)
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

            // Welcome message
            this.addBotMessage('Saludos. Soy <strong>El Consejero</strong>, asesor privado de CAPO. ¿Buscas definir tu legado o requieres una recomendación a la altura de tu presencia?');

            // Quick prompt clicks
            if (this.promptsContainer) {
                this.promptsContainer.addEventListener('click', (e) => {
                    const btn = e.target.closest('.bot-prompt-pill');
                    if (!btn) return;
                    const promptKey = btn.getAttribute('data-prompt');
                    const text = btn.textContent.trim();
                    this.handleUserQuery(text, promptKey);
                });
            }

            // Input form submit
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
                    <button class="bot-action-btn" data-bot-add="${extras.card.id}">AGREGAR AL ARSENAL</button>
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
    // 16. GLOBAL ESC KEYBOARD LISTENER (ACCESSIBILITY)
    // =========================================================
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            CartUI.close();
            QuickViewModal.close();
            CheckoutModal.close();
            InfoModal.close();
            CapoBotEngine.close();
            if (searchBar) {
                searchBar.classList.remove('active');
                clearSearch();
            }
        }
    });

    // Initialize Components
    CartState.init();
    CartUI.init();
    QuickViewModal.init();
    CheckoutModal.init();
    CatalogEngine.init();
    CapoLabEngine.init();
    CapoBotEngine.init();
    InfoModal.init();
});
