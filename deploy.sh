#!/bin/bash

# Script de despliegue para VPS
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de la aplicación..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Creando desde env.production..."
    if [ -f env.production ]; then
        cp env.production .env
        echo "📝 Por favor edita el archivo .env con tus configuraciones reales antes de continuar."
        echo "   Especialmente MONGODB_URI, EMAIL_* y REDIS_*"
        read -p "Presiona Enter cuando hayas configurado el archivo .env..."
    else
        echo "❌ No se encontró env.production. Por favor crea un archivo .env con las variables necesarias."
        exit 1
    fi
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down || true

# Limpiar imágenes antiguas (opcional)
echo "🧹 Limpiando imágenes Docker antiguas..."
docker system prune -f || true

# Construir y levantar los servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up --build -d

# Verificar que el servicio esté funcionando
echo "⏳ Esperando que el servicio esté listo..."
sleep 10

# Verificar el estado del contenedor
if docker-compose ps | grep -q "Up"; then
    echo "✅ ¡Despliegue exitoso!"
    echo "🌐 La aplicación está disponible en: http://localhost:3000"
    echo "📊 Para ver los logs: docker-compose logs -f"
    echo "🛑 Para detener: docker-compose down"
else
    echo "❌ Error en el despliegue. Revisa los logs con: docker-compose logs"
    exit 1
fi
