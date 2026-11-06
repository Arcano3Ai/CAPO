/**
 * ====================================================================
 * CAPO STORE - SUITE DE PRUEBAS UNITARIAS Y DE INTEGRACIÓN (TDD)
 * ====================================================================
 */

const fs = require('fs');
const path = require('path');
const SyncService = require('../data/sync-service.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  [PASS] ${testName}`);
        passedTests++;
    } else {
        console.error(`  [FAIL] ${testName}`);
        failedTests++;
    }
}

console.log('==================================================');
console.log('⚡ EJECUTANDO PRUEBAS DEL MOTOR DE COMERCIO CAPO');
console.log('==================================================\n');

// 1. Pruebas de Algoritmo de Luhn y Detección de Tarjetas
console.log('--- 1. Validación de Pasarela y Tarjetas de Crédito/Débito ---');
const { PaymentUtils } = SyncService;

// Tarjetas de prueba estándar
const validVisa = '4242424242424242';
const validMastercard = '5555555555554444';
const validAmex = '378282246310005';
const invalidCard = '4242424242424243';

assert(PaymentUtils.validateLuhn(validVisa) === true, 'Visa válida pasa algoritmo de Luhn');
assert(PaymentUtils.validateLuhn(validMastercard) === true, 'Mastercard válida pasa algoritmo de Luhn');
assert(PaymentUtils.validateLuhn(validAmex) === true, 'AMEX válida pasa algoritmo de Luhn');
assert(PaymentUtils.validateLuhn(invalidCard) === false, 'Tarjeta con checksum alterado es rechazada');

assert(PaymentUtils.detectCardBrand(validVisa).brand === 'visa', 'Detecta correctamente marca Visa');
assert(PaymentUtils.detectCardBrand(validMastercard).brand === 'mastercard', 'Detecta correctamente marca Mastercard');
assert(PaymentUtils.detectCardBrand(validAmex).brand === 'amex', 'Detecta correctamente marca American Express');

assert(PaymentUtils.formatCardNumber('4242424242424242') === '4242 4242 4242 4242', 'Formatea número con espacios cada 4 dígitos');
assert(PaymentUtils.formatExpiry('1228') === '12/28', 'Formatea expiración con diagonal MM/AA');
assert(PaymentUtils.validateExpiry('12/28') === true, 'Fecha futura 12/28 es válida');
assert(PaymentUtils.validateExpiry('01/20') === false, 'Fecha pasada 01/20 es rechazada');

// 2. Pruebas de Generación de SPEI y OXXO Pay
console.log('\n--- 2. Generación de Métodos de Pago México (SPEI & OXXO) ---');
const spei = PaymentUtils.generateSPEIDetails('#CAPO-891024');
assert(spei.clabe === '646180157023948192', 'CLABE interbancaria oficial asignada');
assert(spei.concepto === 'CAPO-891024', 'Concepto dinámico con folio de pedido');

const oxxo = PaymentUtils.generateOxxoDetails('#CAPO-891024');
assert(oxxo.referencia.length === 14, 'Referencia OXXO Pay de exactamente 14 dígitos');
assert(typeof oxxo.expira === 'string' && oxxo.expira.length > 0, 'Fecha de vigencia OXXO calculada');

// 2.1 Pruebas de Reglas Financieras y Cupones
console.log('\n--- 2.1 Reglas Financieras, Envíos y Cupones ---');
function calculateOrderTotals(items, couponCode = null) {
    const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    let discount = 0;
    let shipping = subtotal >= 1500 ? 0 : 150;

    if (couponCode === 'CAPO10') discount = subtotal * 0.10;
    else if (couponCode === 'LEGADO20') discount = subtotal * 0.20;
    else if (couponCode === 'CONSEJERO15') discount = subtotal * 0.15;
    else if (couponCode === 'ENVIOVIP') shipping = 0;

    const total = Math.max(0, subtotal - discount + shipping);
    const vat = Math.round(total - (total / 1.16));
    return { subtotal, discount, shipping, vat, total };
}

const smallOrder = calculateOrderTotals([{ price: 899, quantity: 1 }]);
assert(smallOrder.shipping === 150, 'Orden menor a $1,500 cobra $150 de envío');
assert(smallOrder.total === 1049, 'Total de orden pequeña es $1,049');

const vipOrder = calculateOrderTotals([{ price: 899, quantity: 2 }]);
assert(vipOrder.shipping === 0, 'Orden de $1,798 tiene envío GRATIS');
assert(vipOrder.vat === Math.round(1798 - (1798 / 1.16)), 'Cálculo de IVA al 16% es matemáticamente exacto');

const couponOrder = calculateOrderTotals([{ price: 1000, quantity: 2 }], 'LEGADO20');
assert(couponOrder.discount === 400, 'Cupón LEGADO20 descuenta el 20% ($400)');
assert(couponOrder.total === 1600, 'Total con cupón y envío gratis es $1,600');

// 3. Pruebas del Motor de Sincronización y Órdenes
console.log('\n--- 3. Servicio de Persistencia y Órdenes (SyncService) ---');
const testOrder = {
    orderId: '#CAPO-999001',
    name: 'Arturo Beltrán',
    phone: '55 9876 5432',
    email: 'arturo@capo.com',
    address: 'Av. Paseo de la Reforma 222, CDMX',
    cp: '06600',
    items: [
        { id: 'capo-boss-black', name: 'THE BOSS BLACK', price: 899, quantity: 2 }
    ],
    subtotal: 1798,
    discount: 179.8,
    shipping: 0,
    total: 1618.2,
    paymentMethod: 'Tarjeta Débito / Crédito (Stripe)'
};

const saved = SyncService.saveOrder(testOrder);
assert(saved.orderId === '#CAPO-999001', 'Orden guardada con folio');
assert(saved.status === '1', 'Estado inicial por defecto es 1 (ORDEN RECIBIDA)');

const retrieved = SyncService.getOrderById('#CAPO-999001');
assert(retrieved !== null && retrieved.name === 'Arturo Beltrán', 'Recupera orden por ID exacto');

const retrievedByEmail = SyncService.getOrderById('arturo@capo.com');
assert(retrievedByEmail !== null && retrievedByEmail.orderId === '#CAPO-999001', 'Recupera orden por email de cliente');

const updated = SyncService.updateOrderStatus('#CAPO-999001', '2');
assert(updated.status === '2', 'Actualiza estado a 2 (EMBALAJE BLINDADO)');
assert(updated.statusHistory.length === 2, 'Registra bitácora de auditoría de estados');

const updatedRoute = SyncService.updateOrderStatus('#CAPO-999001', '3');
assert(updatedRoute.status === '3', 'Actualiza estado a 3 (EN RUTA EXPRESS)');

const updatedDelivered = SyncService.updateOrderStatus('#CAPO-999001', '4');
assert(updatedDelivered.status === '4', 'Actualiza estado a 4 (ENTREGADO)');
assert(updatedDelivered.statusHistory.length === 4, 'Bitácora registra las 4 transiciones secuenciales');

let invalidStateCaught = false;
try {
    SyncService.updateOrderStatus('#CAPO-999001', '99');
} catch (e) {
    invalidStateCaught = true;
}
assert(invalidStateCaught === true, 'Rechaza estados inválidos fuera del flujo 1-4');

// 4. Pruebas de Integridad del Catálogo de Productos
console.log('\n--- 4. Integridad de Catálogo y Assets ---');
const catalogRaw = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
const catalog = JSON.parse(catalogRaw);

assert(Array.isArray(catalog) && catalog.length >= 8, 'El catálogo contiene al menos 8 productos oficiales');

let allHaveImages = true;
let allHavePrices = true;
let allHaveStock = true;

catalog.forEach(prod => {
    if (!prod.images || prod.images.length === 0) allHaveImages = false;
    if (typeof prod.price !== 'number' || prod.price <= 0) allHavePrices = false;
    if (typeof prod.stock !== 'number' || prod.stock < 0) allHaveStock = false;
});

assert(allHaveImages, 'Todos los productos tienen galerías de imágenes válidas');
assert(allHavePrices, 'Todos los productos tienen precios numéricos mayores a 0');
assert(allHaveStock, 'Todos los productos tienen control de inventario de stock definido');

console.log('\n==================================================');
console.log(`RESUMEN: ${passedTests} APROBADAS | ${failedTests} FALLIDAS`);
console.log('==================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    console.log('✨ TODAS LAS PRUEBAS PASARON EXITOSAMENTE.');
}
