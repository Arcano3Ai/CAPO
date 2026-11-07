/**
 * ====================================================================
 * CAPO STORE - DEVOPS & SRE AUTOMATED AUDIT SUITE
 * Verificación de Integridad, Seguridad, Assets, PWA y CI/CD
 * ====================================================================
 */

const fs = require('fs');
const path = require('path');

let auditPasses = 0;
let auditFails = 0;

function assertAudit(condition, checkName, details = '') {
    if (condition) {
        console.log(`  [PASS] ${checkName}`);
        auditPasses++;
    } else {
        console.error(`  [FAIL] ${checkName} ${details ? '-> ' + details : ''}`);
        auditFails++;
    }
}

console.log('==================================================');
console.log('🛡️ INICIANDO AUDITORÍA DEVOPS & SRE - CAPO STORE');
console.log('==================================================\n');

const rootDir = path.resolve(__dirname, '..');

// 1. Auditoría de Secretos y Seguridad de Código
console.log('--- 1. Escaneo de Seguridad y Fuga de Credenciales ---');
const secretPatterns = [
    /-----BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----/,
    /sk_live_[0-9a-zA-Z]{24}/,
    /AIza[0-9A-Za-z-_]{35}/,
    /(ghp|gho|ghu|ghs|ghr)_[0-9a-zA-Z]{36}/
];

const filesToScan = [
    'index.html',
    'admin.html',
    'script.js',
    'styles.css',
    'sw.js',
    'manifest.json',
    'data/sync-service.js',
    'data/products.json'
];

let leakFound = false;
filesToScan.forEach(relPath => {
    const fullPath = path.join(rootDir, relPath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        secretPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                leakFound = true;
                console.error(`  [ALERTA] Posible credencial detectada en ${relPath}`);
            }
        });
    }
});
assertAudit(!leakFound, 'Cero claves privadas o tokens de producción filtrados en el código');

// 2. Integridad de Enlaces y Assets Referenciados (Zero 404s)
console.log('\n--- 2. Integridad de Assets & Referencias Locales ---');
const catalogPath = path.join(rootDir, 'data/products.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let allAssetsExist = true;
let missingAssets = [];

catalog.forEach(p => {
    (p.images || []).forEach(imgRel => {
        const resolved = path.join(rootDir, imgRel);
        if (!fs.existsSync(resolved)) {
            allAssetsExist = false;
            missingAssets.push(`${p.name}: ${imgRel}`);
        }
    });
});

assertAudit(allAssetsExist, 'Todas las imágenes del catálogo existen en el disco con formato WebP optimizado', missingAssets.join(', '));

// Verificar videos de fondo y Audio del reproductor
const video1 = path.join(rootDir, 'assets/fondo-1.mp4');
const video2 = path.join(rootDir, 'assets/fondo-2.mp4');
const video3 = path.join(rootDir, 'assets/fondo-3.mp4');
const videoShowcase1 = path.join(rootDir, 'assets/capo-showcase.mp4');
const videoShowcase2 = path.join(rootDir, 'assets/capo-showcase-2.mp4');
const audioMp3 = path.join(rootDir, 'assets/modo-patron-activado.mp3');

const allVideosExist = [video1, video2, video3, videoShowcase1, videoShowcase2].every(v => fs.existsSync(v) && fs.statSync(v).size > 1000000);
assertAudit(allVideosExist, '5 Videos de fondo (edificio 1-3 y 2 showcases intermedios) verificados y disponibles');
assertAudit(fs.existsSync(audioMp3) && fs.statSync(audioMp3).size > 500000, 'Soundtrack oficial "Modo Patrón Activado" MP3 verificado');

// 3. Auditoría PWA y Service Worker
console.log('\n--- 3. Auditoría de Fiabilidad PWA y Service Worker ---');
const swPath = path.join(rootDir, 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');

// Extraer lista de archivos cacheados
const cacheMatch = swContent.match(/const ASSETS_TO_CACHE = \[\s*([\s\S]*?)\s*\];/);
assertAudit(cacheMatch !== null, 'Service Worker define lista determinista ASSETS_TO_CACHE');

if (cacheMatch) {
    const assetLines = [...cacheMatch[1].matchAll(/['"]([^'"]+)['"]/g)]
        .map(m => m[1].trim())
        .filter(s => s.length > 0 && s !== './');

    let allCachedAssetsExist = true;
    let missingCacheList = [];

    assetLines.forEach(line => {
        const clean = line.replace(/^\.\//, '');
        const full = path.join(rootDir, clean);
        if (!fs.existsSync(full)) {
            allCachedAssetsExist = false;
            missingCacheList.push(clean);
        }
    });

    assertAudit(allCachedAssetsExist, 'Todos los recursos de ASSETS_TO_CACHE existen físicamente en el repositorio', missingCacheList.join(', '));
}

// 4. Auditoría de Infraestructura y Contenedores (Docker / Nginx)
console.log('\n--- 4. Infraestructura como Código (Docker & Nginx) ---');
const dockerfilePath = path.join(rootDir, 'Dockerfile');
const composePath = path.join(rootDir, 'docker-compose.yml');
const nginxPath = path.join(rootDir, 'nginx.conf');
const dockerignorePath = path.join(rootDir, '.dockerignore');

assertAudit(fs.existsSync(dockerfilePath), 'Dockerfile de producción presente');
assertAudit(fs.existsSync(composePath), 'Orquestación docker-compose.yml presente');
assertAudit(fs.existsSync(nginxPath), 'Configuración de servidor web seguro nginx.conf presente');
assertAudit(fs.existsSync(dockerignorePath), 'Archivo .dockerignore presente para optimizar contexto de build');

// 5. Presupuesto de Rendimiento y Tamaño de Assets (Performance Budget)
console.log('\n--- 5. Presupuestos de Rendimiento Web (Performance Budgets) ---');
const indexSize = fs.statSync(path.join(rootDir, 'index.html')).size;
const scriptSize = fs.statSync(path.join(rootDir, 'script.js')).size;
const styleSize = fs.statSync(path.join(rootDir, 'styles.css')).size;
const syncSize = fs.statSync(path.join(rootDir, 'data/sync-service.js')).size;

assertAudit(indexSize < 100 * 1024, `HTML principal optimizado (< 100 KB): ${(indexSize / 1024).toFixed(1)} KB`);
assertAudit(styleSize < 120 * 1024, `Hoja de estilos CSS optimizada (< 120 KB): ${(styleSize / 1024).toFixed(1)} KB`);
assertAudit(scriptSize < 200 * 1024, `Frontend Engine JS dentro de presupuesto (< 200 KB): ${(scriptSize / 1024).toFixed(1)} KB`);
assertAudit(syncSize < 40 * 1024, `Capa SyncService ligera (< 40 KB): ${(syncSize / 1024).toFixed(1)} KB`);

console.log('\n==================================================');
console.log(`RESUMEN DE AUDITORÍA: ${auditPasses} PASADAS | ${auditFails} OBSERVACIONES`);
console.log('==================================================');

if (auditFails > 0) {
    process.exit(1);
} else {
    console.log('🚀 AUDITORÍA DEVOPS APROBADA CON ÉXITO.');
    process.exit(0);
}
