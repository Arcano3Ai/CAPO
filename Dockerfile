# ====================================================================
# CAPO URBAN LUXURY - PRODUCTION CONTAINER DOCKERFILE
# Optimizado con Nginx Alpine de Alta Densidad & Seguridad Reforzada
# ====================================================================

FROM nginx:1.27-alpine

LABEL maintainer="Arcano Solutions DevOps <devops@arcanosolutions.com>"
LABEL description="CAPO Store - E-Commerce Brutalista de Lujo Urbano"
LABEL version="2.0.0"

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Eliminar configuración por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada optimizada con compresión y headers
COPY nginx.conf /etc/nginx/conf.d/capo.conf

# Directorio de trabajo
WORKDIR /usr/share/nginx/html

# Copiar el código fuente y assets
COPY index.html admin.html manifest.json sw.js script.js styles.css ./
COPY data/ ./data/
COPY assets/ ./assets/

# Configurar permisos seguros
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Healthcheck nativo de contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

