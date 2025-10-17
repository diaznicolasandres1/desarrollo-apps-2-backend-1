# Despliegue en VPS con Docker

Esta guía te ayudará a desplegar la aplicación NestJS en tu VPS usando Docker.

## Prerrequisitos

### En tu VPS:
1. **Docker** instalado
2. **Docker Compose** instalado
3. **Git** instalado (para clonar el repositorio)

### Instalación de Docker en Ubuntu/Debian:
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar la sesión para aplicar los cambios
exit
```

## Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio-url>
cd desarrollo-apps-2-backend-1
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp env.production .env

# Editar con tus configuraciones reales
nano .env
```

**Variables importantes a configurar:**
- `MONGODB_URI`: Tu string de conexión de MongoDB Atlas
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`: Configuración de email
- `REDIS_URL`, `REDIS_HOST`, `REDIS_PASSWORD`: Configuración de Redis

### 3. Desplegar la aplicación
```bash
# Ejecutar el script de despliegue
./deploy.sh
```

O manualmente:
```bash
# Construir y levantar
docker-compose up --build -d

# Ver logs
docker-compose logs -f
```

## Comandos útiles

### Gestión de contenedores:
```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Reconstruir y levantar
docker-compose up --build -d
```

### Monitoreo:
```bash
# Ver uso de recursos
docker stats

# Ver logs específicos
docker-compose logs backend

# Entrar al contenedor
docker-compose exec backend sh
```

### Mantenimiento:
```bash
# Limpiar imágenes no utilizadas
docker system prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f

# Ver espacio usado por Docker
docker system df
```

## Configuración de Firewall

Si tu VPS tiene firewall activado, asegúrate de abrir el puerto 3000:

```bash
# UFW (Ubuntu)
sudo ufw allow 3000

# O con iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## Configuración de Nginx (Opcional)

Para usar un dominio personalizado y SSL, puedes configurar Nginx como proxy reverso:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Problemas comunes:

1. **Error de permisos de Docker:**
   ```bash
   sudo usermod -aG docker $USER
   # Luego cerrar sesión y volver a entrar
   ```

2. **Puerto ya en uso:**
   ```bash
   # Ver qué proceso usa el puerto 3000
   sudo lsof -i :3000
   # Cambiar el puerto en docker-compose.yml si es necesario
   ```

3. **Error de memoria:**
   ```bash
   # Aumentar memoria swap si es necesario
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

4. **Problemas de conectividad con MongoDB/Redis:**
   - Verificar que las URLs de conexión sean correctas
   - Verificar que las IPs estén whitelisted en MongoDB Atlas
   - Verificar que Redis esté accesible desde tu VPS

## Monitoreo y Logs

Los logs se guardan en el directorio `./logs` del host. Puedes configurar logrotate para evitar que ocupen demasiado espacio:

```bash
# Crear configuración de logrotate
sudo nano /etc/logrotate.d/cultura-backend

# Contenido:
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

## Actualizaciones

Para actualizar la aplicación:

```bash
# Detener servicios
docker-compose down

# Actualizar código
git pull

# Reconstruir y levantar
docker-compose up --build -d
```
