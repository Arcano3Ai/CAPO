/**
 * CAPO Store - Production HTTP Server
 * Servidor HTTP nativo de alto rendimiento para despliegue en Hostinger, VPS, Docker o Local.
 * Zero-dependencies, arranque en <10ms, compresión Gzip y headers OWASP.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.xml': 'application/xml; charset=UTF-8',
    '.txt': 'text/plain; charset=UTF-8'
};

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

const server = http.createServer((req, res) => {
    // 1. Healthcheck para probes de Hostinger / Docker / Kubernetes
    if (req.url === '/health' || req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK\n');
        return;
    }

    // 2. Normalización de ruta
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(ROOT_DIR, safePath);

    // Si es directorio, buscar index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    // SPA fallback: si no existe el archivo estático, servir index.html
    if (!fs.existsSync(filePath)) {
        filePath = path.join(ROOT_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // 3. Estrategia de Caché
    const headers = { ...SECURITY_HEADERS, 'Content-Type': contentType };

    if (ext === '.html' || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
    } else if (['.webp', '.jpg', '.jpeg', '.png', '.mp4', '.mp3'].includes(ext)) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
        headers['Cache-Control'] = 'public, max-age=86400';
    }

    // 4. Soporte de Range Requests para Streaming de Video y Audio (fondo-1.mp4, modo-patron-activado.mp3)
    const range = req.headers.range;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    if (range && (ext === '.mp4' || ext === '.mp3')) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
            return res.end();
        }

        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
        headers['Accept-Ranges'] = 'bytes';
        headers['Content-Length'] = chunksize;

        res.writeHead(206, headers);
        fileStream.pipe(res);
        return;
    }

    // 5. Compresión Gzip para texto y código
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const isCompressible = ['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt'].includes(ext);

    if (isCompressible && acceptEncoding.includes('gzip')) {
        headers['Content-Encoding'] = 'gzip';
        res.writeHead(200, headers);
        const rawStream = fs.createReadStream(filePath);
        const gzip = zlib.createGzip({ level: 6 });
        rawStream.pipe(gzip).pipe(res);
    } else {
        headers['Content-Length'] = fileSize;
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
    }
});

server.listen(PORT, HOST, () => {
    console.log(`[CAPO Production Server] Escuchando en http://${HOST}:${PORT}`);
    console.log(`[CAPO Production Server] Directorio raíz: ${ROOT_DIR}`);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('[CAPO Production Server] Proceso terminado limpiamente por SIGTERM');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    server.close(() => {
        console.log('[CAPO Production Server] Proceso terminado limpiamente por SIGINT');
        process.exit(0);
    });
});

module.exports = server;
