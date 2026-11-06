/**
 * ====================================================================
 * CAPO STORE - CORE SYNCHRONIZATION & DATA LAYER SERVICE (SyncService)
 * Arquitectura Limpia & Persistencia Desacoplada
 * Compatible con Node.js (CommonJS) y Navegadores (window.CapoSync)
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        // Node.js environment
        module.exports = factory();
    } else {
        // Browser environment
        root.CapoSync = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Memory store fallback for Node / non-localStorage environments
    const memoryStore = {};

    function getStorage() {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
        return {
            getItem: (key) => memoryStore[key] || null,
            setItem: (key, val) => { memoryStore[key] = String(val); },
            removeItem: (key) => { delete memoryStore[key]; },
            clear: () => { for (const k in memoryStore) delete memoryStore[k]; }
        };
    }

    // Cross-tab broadcast channel
    let broadcastChannel = null;
    if (typeof BroadcastChannel !== 'undefined') {
        try {
            broadcastChannel = new BroadcastChannel('capo_sync_channel');
        } catch (e) {
            broadcastChannel = null;
        }
    }

    const listeners = new Map();

    const SyncService = {
        STORAGE_KEYS: {
            ORDERS: 'capo_order_history',
            INVENTORY: 'capo_inventory_overrides',
            SETTINGS: 'capo_system_settings'
        },

        // Event listener subscription
        on(event, callback) {
            if (!listeners.has(event)) {
                listeners.set(event, []);
            }
            listeners.get(event).push(callback);
            return () => this.off(event, callback);
        },

        off(event, callback) {
            if (!listeners.has(event)) return;
            const filtered = listeners.get(event).filter(cb => cb !== callback);
            listeners.set(event, filtered);
        },

        emit(event, data, broadcast = true) {
            if (listeners.has(event)) {
                listeners.get(event).forEach(cb => {
                    try { cb(data); } catch (err) { console.error('Error en listener:', err); }
                });
            }
            if (broadcast && broadcastChannel) {
                try {
                    broadcastChannel.postMessage({ event, data, timestamp: Date.now() });
                } catch (e) {}
            }
        },

        initBroadcastListener() {
            if (broadcastChannel) {
                broadcastChannel.onmessage = (e) => {
                    if (e && e.data && e.data.event) {
                        this.emit(e.data.event, e.data.data, false);
                    }
                };
            }
            if (typeof window !== 'undefined') {
                window.addEventListener('storage', (e) => {
                    if (e.key === this.STORAGE_KEYS.ORDERS) {
                        this.emit('orders_changed', this.getOrders(), false);
                    }
                });
            }
        },

        // --- GESTIÓN DE ÓRDENES ---
        getOrders() {
            const storage = getStorage();
            try {
                const raw = storage.getItem(this.STORAGE_KEYS.ORDERS);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error('Error parseando órdenes:', e);
                return [];
            }
        },

        getOrderById(query) {
            if (!query) return null;
            const q = String(query).trim().toUpperCase();
            const orders = this.getOrders();
            
            return orders.find(ord => {
                const id = (ord.orderId || '').toUpperCase();
                const cleanId = id.replace(/[^A-Z0-9]/g, '');
                const cleanQ = q.replace(/[^A-Z0-9]/g, '');
                const email = (ord.email || '').toUpperCase();
                const phone = (ord.phone || '').replace(/[^0-9]/g, '');
                const qDigits = q.replace(/[^0-9]/g, '');

                return id === q || 
                       cleanId === cleanQ || 
                       email === q || 
                       (qDigits.length >= 8 && phone.includes(qDigits));
            }) || null;
        },

        saveOrder(order) {
            if (!order || !order.orderId) {
                throw new Error('La orden requiere un identificador válido.');
            }

            // Defaults asegurados de grado de producción
            const sanitizedOrder = {
                orderId: order.orderId,
                name: order.name || 'Cliente CAPO',
                phone: order.phone || 'N/A',
                email: order.email || 'cliente@capostore.com',
                address: order.address || 'Entrega confirmada',
                cp: order.cp || '00000',
                items: Array.isArray(order.items) ? order.items : [],
                subtotal: Number(order.subtotal) || 0,
                discount: Number(order.discount) || 0,
                shipping: Number(order.shipping) || 0,
                total: Number(order.total) || 0,
                paymentMethod: order.paymentMethod || 'Tarjeta',
                paymentDetails: order.paymentDetails || {},
                status: String(order.status || '1'), // '1' = Orden Recibida
                statusHistory: order.statusHistory || [
                    { status: '1', label: 'ORDEN RECIBIDA', timestamp: new Date().toISOString() }
                ],
                date: order.date || new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }),
                timestamp: Date.now()
            };

            const orders = this.getOrders();
            const existingIndex = orders.findIndex(o => o.orderId === sanitizedOrder.orderId);

            if (existingIndex >= 0) {
                orders[existingIndex] = sanitizedOrder;
            } else {
                orders.unshift(sanitizedOrder);
            }

            const storage = getStorage();
            storage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders.slice(0, 100)));
            this.emit('orders_changed', orders);
            this.emit('order_created', sanitizedOrder);
            return sanitizedOrder;
        },

        updateOrderStatus(orderId, newStatus) {
            const validStatuses = {
                '1': 'ORDEN RECIBIDA',
                '2': 'EMBALAJE BLINDADO',
                '3': 'EN RUTA EXPRESS',
                '4': 'ENTREGADO'
            };

            const statusKey = String(newStatus);
            if (!validStatuses[statusKey]) {
                throw new Error(`Estado inválido: ${newStatus}`);
            }

            const orders = this.getOrders();
            const order = orders.find(o => o.orderId === orderId);
            if (!order) {
                throw new Error(`Orden no encontrada: ${orderId}`);
            }

            order.status = statusKey;
            if (!order.statusHistory) order.statusHistory = [];
            order.statusHistory.push({
                status: statusKey,
                label: validStatuses[statusKey],
                timestamp: new Date().toISOString()
            });

            const storage = getStorage();
            storage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            this.emit('orders_changed', orders);
            this.emit('order_status_updated', { orderId, status: statusKey, order });
            return order;
        },

        // --- VALIDACIONES DE PAGO & SEGURIDAD ---
        PaymentUtils: {
            // Algoritmo de Luhn para validación de tarjetas
            validateLuhn(cardNumber) {
                const digits = String(cardNumber).replace(/\D/g, '');
                if (digits.length < 13 || digits.length > 19) return false;

                let sum = 0;
                let shouldDouble = false;

                for (let i = digits.length - 1; i >= 0; i--) {
                    let digit = parseInt(digits.charAt(i), 10);
                    if (shouldDouble) {
                        digit *= 2;
                        if (digit > 9) digit -= 9;
                    }
                    sum += digit;
                    shouldDouble = !shouldDouble;
                }

                return (sum % 10) === 0;
            },

            // Detección de marca de tarjeta
            detectCardBrand(cardNumber) {
                const digits = String(cardNumber).replace(/\D/g, '');
                if (/^4/.test(digits)) return { brand: 'visa', label: 'Visa', icon: 'fa-cc-visa' };
                if (/^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(digits)) {
                    return { brand: 'mastercard', label: 'Mastercard', icon: 'fa-cc-mastercard' };
                }
                if (/^3[47]/.test(digits)) return { brand: 'amex', label: 'American Express', icon: 'fa-cc-amex' };
                if (/^(6011|65|64[4-9]|622)/.test(digits)) return { brand: 'discover', label: 'Discover', icon: 'fa-cc-discover' };
                if (/^(50|5[6-9]|6[0-9])/.test(digits)) return { brand: 'carnet', label: 'Carnet México', icon: 'fa-credit-card' };
                return { brand: 'unknown', label: 'Tarjeta', icon: 'fa-credit-card' };
            },

            // Formateador de tarjeta con espacios cada 4 dígitos
            formatCardNumber(val) {
                const digits = String(val).replace(/\D/g, '').slice(0, 16);
                const parts = [];
                for (let i = 0; i < digits.length; i += 4) {
                    parts.push(digits.substring(i, i + 4));
                }
                return parts.join(' ');
            },

            // Formateador de expiración MM/AA
            formatExpiry(val) {
                const digits = String(val).replace(/\D/g, '').slice(0, 4);
                if (digits.length >= 2) {
                    return digits.slice(0, 2) + '/' + digits.slice(2);
                }
                return digits;
            },

            // Validación de fecha de expiración
            validateExpiry(expiryStr) {
                const parts = String(expiryStr).split('/');
                if (parts.length !== 2) return false;
                const month = parseInt(parts[0], 10);
                const year = parseInt('20' + parts[1], 10);
                if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return false;

                const now = new Date();
                const curMonth = now.getMonth() + 1;
                const curYear = now.getFullYear();

                if (year < curYear) return false;
                if (year === curYear && month < curMonth) return false;
                return true;
            },

            // Generador de referencia SPEI oficial de 18 dígitos y concepto
            generateSPEIDetails(orderId) {
                return {
                    banco: 'STP (Sistema de Transferencias y Pagos) / BBVA',
                    clabe: '646180157023948192',
                    beneficiario: 'CAPO HEADQUARTERS S.A.P.I. DE C.V.',
                    concepto: orderId.replace('#', ''),
                    rfc: 'CAP240213HQ8'
                };
            },

            // Generador de referencia OXXO Pay de 14 dígitos
            generateOxxoDetails(orderId) {
                const cleanNum = orderId.replace(/\D/g, '') || Math.floor(100000 + Math.random() * 900000);
                const prefix = '9348';
                const mid = String(cleanNum).padStart(6, '0');
                const suffix = '8821';
                const fullRef = `${prefix}${mid}${suffix}`.slice(0, 14);
                
                const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);
                const expiresFormatted = expiresAt.toLocaleDateString('es-MX', {
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });

                return {
                    referencia: fullRef,
                    referenciaFormatted: `${fullRef.slice(0, 4)} ${fullRef.slice(4, 8)} ${fullRef.slice(8, 12)} ${fullRef.slice(12)}`,
                    expira: expiresFormatted,
                    empresa: 'CAPO URBAN LUXURY - CONVENIO OXXO PAY'
                };
            }
        }
    };

    // Auto-inicializar escucha de broadcast si estamos en el navegador
    if (typeof window !== 'undefined') {
        SyncService.initBroadcastListener();
    }

    return SyncService;
}));
