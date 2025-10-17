#!/bin/bash

# Script de gestión para la aplicación en VPS
# Uso: ./manage.sh [comando]

set -e

APP_NAME="cultura-backend-prod"
COMPOSE_FILE="docker-compose.yml"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Script de gestión para la aplicación NestJS${NC}"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start     - Iniciar la aplicación"
    echo "  stop      - Detener la aplicación"
    echo "  restart   - Reiniciar la aplicación"
    echo "  status    - Ver estado de la aplicación"
    echo "  logs      - Ver logs en tiempo real"
    echo "  logs-tail - Ver últimas líneas de logs"
    echo "  build     - Construir y levantar la aplicación"
    echo "  update    - Actualizar código y reconstruir"
    echo "  shell     - Abrir shell en el contenedor"
    echo "  clean     - Limpiar imágenes y contenedores no utilizados"
    echo "  backup    - Crear backup de logs y configuraciones"
    echo "  health    - Verificar estado de salud de la aplicación"
    echo "  help      - Mostrar esta ayuda"
}

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker no está corriendo. Por favor inicia Docker primero.${NC}"
        exit 1
    fi
}

# Función para iniciar la aplicación
start_app() {
    echo -e "${BLUE}🚀 Iniciando la aplicación...${NC}"
    check_docker
    docker-compose -f $COMPOSE_FILE up -d
    echo -e "${GREEN}✅ Aplicación iniciada${NC}"
}

# Función para detener la aplicación
stop_app() {
    echo -e "${YELLOW}🛑 Deteniendo la aplicación...${NC}"
    check_docker
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Aplicación detenida${NC}"
}

# Función para reiniciar la aplicación
restart_app() {
    echo -e "${YELLOW}🔄 Reiniciando la aplicación...${NC}"
    stop_app
    sleep 2
    start_app
}

# Función para ver el estado
show_status() {
    echo -e "${BLUE}📊 Estado de la aplicación:${NC}"
    check_docker
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo -e "${BLUE}📈 Uso de recursos:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Función para ver logs
show_logs() {
    echo -e "${BLUE}📋 Logs de la aplicación (Ctrl+C para salir):${NC}"
    check_docker
    docker-compose -f $COMPOSE_FILE logs -f
}

# Función para ver últimas líneas de logs
show_logs_tail() {
    echo -e "${BLUE}📋 Últimas 50 líneas de logs:${NC}"
    check_docker
    docker-compose -f $COMPOSE_FILE logs --tail=50
}

# Función para construir y levantar
build_app() {
    echo -e "${BLUE}🔨 Construyendo y levantando la aplicación...${NC}"
    check_docker
    docker-compose -f $COMPOSE_FILE up --build -d
    echo -e "${GREEN}✅ Aplicación construida y levantada${NC}"
}

# Función para actualizar
update_app() {
    echo -e "${BLUE}🔄 Actualizando la aplicación...${NC}"
    check_docker
    
    # Detener aplicación
    docker-compose -f $COMPOSE_FILE down
    
    # Limpiar imágenes antiguas
    docker system prune -f
    
    # Construir y levantar
    docker-compose -f $COMPOSE_FILE up --build -d
    
    echo -e "${GREEN}✅ Aplicación actualizada${NC}"
}

# Función para abrir shell
open_shell() {
    echo -e "${BLUE}🐚 Abriendo shell en el contenedor...${NC}"
    check_docker
    docker-compose -f $COMPOSE_FILE exec backend sh
}

# Función para limpiar
clean_docker() {
    echo -e "${YELLOW}🧹 Limpiando Docker...${NC}"
    check_docker
    
    # Detener contenedores
    docker-compose -f $COMPOSE_FILE down
    
    # Limpiar sistema
    docker system prune -af
    
    # Limpiar volúmenes no utilizados
    docker volume prune -f
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función para backup
backup_app() {
    echo -e "${BLUE}💾 Creando backup...${NC}"
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup de logs
    if [ -d "logs" ]; then
        cp -r logs $BACKUP_DIR/
    fi
    
    # Backup de configuración
    cp .env $BACKUP_DIR/ 2>/dev/null || echo "No se encontró archivo .env"
    cp docker-compose.yml $BACKUP_DIR/
    
    # Backup de logs de Docker
    docker-compose -f $COMPOSE_FILE logs > $BACKUP_DIR/docker-logs.txt 2>/dev/null || true
    
    echo -e "${GREEN}✅ Backup creado en: $BACKUP_DIR${NC}"
}

# Función para verificar salud
check_health() {
    echo -e "${BLUE}🏥 Verificando salud de la aplicación...${NC}"
    
    # Verificar si el contenedor está corriendo
    if ! docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        echo -e "${RED}❌ La aplicación no está corriendo${NC}"
        return 1
    fi
    
    # Verificar endpoint de salud
    if command -v curl > /dev/null 2>&1; then
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Aplicación saludable${NC}"
            curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
        else
            echo -e "${RED}❌ Endpoint de salud no responde${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  curl no disponible, verificando solo estado del contenedor${NC}"
        echo -e "${GREEN}✅ Contenedor corriendo${NC}"
    fi
}

# Procesar comando
case "${1:-help}" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    logs-tail)
        show_logs_tail
        ;;
    build)
        build_app
        ;;
    update)
        update_app
        ;;
    shell)
        open_shell
        ;;
    clean)
        clean_docker
        ;;
    backup)
        backup_app
        ;;
    health)
        check_health
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando no reconocido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
