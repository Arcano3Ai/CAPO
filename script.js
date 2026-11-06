/**
 * CAPO Store - Core Application Engine
 * Architecture: Clean, Event-Driven & Modular Vanilla JS
 * Version: 2.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================
    // 1. STATE MANAGEMENT: CART & STORAGE
    // =========================================================
    const CART_STORAGE_KEY = 'capo_store_cart_v2';
    const FREE_SHIPPING_THRESHOLD = 1500;
    const STANDARD_SHIPPING_COST = 149;

    const CartState = {
        items: [],

        init() {
            try {
                const stored = localStorage.getItem(CART_STORAGE_KEY);
                this.items = stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.warn('LocalStorage not available, falling back to in-memory state.', e);
                this.items = [];
            }
            this.syncUI();
        },

        save() {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
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

        clear() {
            this.items = [];
            this.save();
            Toast.show('ARSENAL VACIADO');
        },

        getCount() {
            return this.items.reduce((acc, item) => acc + item.quantity, 0);
        },

        getSubtotal() {
            return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },

        getShippingCost() {
            if (this.items.length === 0) return 0;
            return this.getSubtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
        },

        getTotal() {
            return this.getSubtotal() + this.getShippingCost();
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
        shippingCostEl: document.getElementById('cart-shipping-cost'),
        totalEl: document.getElementById('cart-total'),
        shippingTextEl: document.getElementById('shipping-notice-text'),
        shippingProgressFill: document.getElementById('shipping-progress-fill'),
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
    // 5. CHECKOUT MODAL CONTROLLER
    // =========================================================
    const CheckoutModal = {
        overlay: document.getElementById('checkout-modal'),
        closeBtn: document.getElementById('checkout-close-btn'),
        form: document.getElementById('checkout-form'),
        summaryItems: document.getElementById('checkout-summary-items'),
        summaryTotal: document.getElementById('checkout-summary-total'),
        successScreen: document.getElementById('order-success-screen'),
        successOrderId: document.getElementById('order-success-id'),
        finishSuccessBtn: document.getElementById('btn-finish-success'),

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
                    this.processOrder();
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

        processOrder() {
            const submitBtn = document.getElementById('btn-submit-order');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'PROCESANDO TRANSACCIÓN...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                // Generate random unique ID
                const randomId = '#CAPO-' + Math.floor(100000 + Math.random() * 900000);
                if (this.successOrderId) this.successOrderId.textContent = randomId;

                this.form.style.display = 'none';
                this.successScreen.style.display = 'block';

                // Empty cart after successful order
                CartState.clear();
            }, 1200);
        }
    };

    // =========================================================
    // 6. INFORMATIONAL POLICY MODAL
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
    // 7. PRODUCT CARD ACTIONS LISTENER (DELEGATION)
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
    // 8. INTERACTIVE SEARCH ENGINE IN NAVBAR
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

            let matchesCount = 0;
            productCards.forEach(card => {
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const cat = (card.getAttribute('data-category') || '').toLowerCase();
                const desc = (card.getAttribute('data-desc') || '').toLowerCase();

                if (name.includes(query) || cat.includes(query) || desc.includes(query)) {
                    card.style.display = '';
                    matchesCount++;
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // =========================================================
    // 9. MOBILE MENU CONTROLLER
    // =========================================================
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close on link click
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // =========================================================
    // 10. NEWSLETTER FORM HANDLER
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
    // 11. AUDIO PLAYER & EQUALIZER CONTROLLER
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
                if (playIcon) {
                    playIcon.className = 'fas fa-pause';
                }
                if (playText) playText.textContent = 'PAUSA';
            } else {
                playerWidget.classList.add('paused');
                if (playIcon) {
                    playIcon.className = 'fas fa-play';
                }
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

        // Try playing or wait for first gesture
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
    // 12. CUSTOM CURSOR (60FPS RAF PERFORMANCE)
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
    // 13. GLOBAL ESC KEYBOARD LISTENER (ACCESSIBILITY)
    // =========================================================
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            CartUI.close();
            QuickViewModal.close();
            CheckoutModal.close();
            InfoModal.close();
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
    InfoModal.init();
});
