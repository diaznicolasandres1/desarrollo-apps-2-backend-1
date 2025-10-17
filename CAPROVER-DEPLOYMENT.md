# Despliegue con CapRover

Esta guía te ayudará a desplegar tu aplicación NestJS usando CapRover.

## ¿Qué es CapRover?

CapRover es una plataforma de despliegue que:
- Maneja Docker automáticamente
- Tiene interfaz web fácil de usar
- Maneja dominios y SSL automáticamente
- Es gratis y open source

## Instalación de CapRover

### 1. Instalar CapRover en tu VPS

```bash
# Conectar a tu VPS
ssh root@tu-vps-ip

# Instalar CapRover
docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock caprover/caprover
```

### 2. Configurar CapRover

1. **Abrir navegador:** `http://tu-vps-ip:3000`
2. **Crear cuenta de admin**
3. **Configurar dominio** (opcional)

## Despliegue de la aplicación

### Método 1: Desde el panel web (Recomendado)

1. **Crear nueva aplicación:**
   - Ve al panel de CapRover
   - Click en "Apps" → "Create New App"
   - Nombre: `cultura-backend`
   - Click "Create New App"

2. **Configurar variables de entorno:**
   - Ve a "App Configs" → "Environment Variables"
   - Agrega las variables del archivo `caprover-env.example`
   - **IMPORTANTE:** Cambia los valores por los reales

3. **Desplegar código:**
   - Ve a "Deployment" → "Upload tar.gz"
   - Crea un archivo tar.gz de tu código:
     ```bash
     tar -czf app.tar.gz --exclude=node_modules --exclude=.git .
     ```
   - Sube el archivo

### Método 2: Desde línea de comandos

```bash
# Instalar CapRover CLI
npm install -g caprover

# Login
caprover login

# Desplegar
caprover deploy
```

## Configuración de variables de entorno

En el panel de CapRover, ve a "App Configs" → "Environment Variables" y agrega:

```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion
REDIS_URL=redis://usuario:password@host:puerto
```

## Configuración de dominio

1. **Comprar dominio** (ej: `mi-app.com`)
2. **Configurar DNS:**
   - A record: `tu-vps-ip`
   - CNAME: `captain.mi-app.com` → `captain.tu-vps-ip`
3. **En CapRover:**
   - Ve a "Settings" → "Root Domain"
   - Configura tu dominio
   - CapRover manejará SSL automáticamente

## Ventajas de CapRover vs Docker Compose

### CapRover:
✅ Interfaz web fácil  
✅ SSL automático  
✅ Dominios automáticos  
✅ Escalado fácil  
✅ Logs centralizados  
✅ Backup automático  

### Docker Compose:
✅ Control total  
✅ Configuración manual  
✅ Más flexible  
✅ Mejor para desarrollo  

## Comandos útiles

```bash
# Ver logs
caprover logs

# Reiniciar aplicación
caprover restart

# Ver estado
caprover status

# Backup
caprover backup
```

## Troubleshooting

### Problemas comunes:

1. **Error de build:**
   - Verificar que `captain-definition` esté correcto
   - Revisar logs de build en el panel

2. **Variables de entorno:**
   - Verificar que estén configuradas correctamente
   - Reiniciar aplicación después de cambios

3. **Dominio no funciona:**
   - Verificar configuración DNS
   - Esperar propagación DNS (hasta 24h)

## Migración desde Docker Compose

Si ya tienes la app corriendo con Docker Compose:

1. **Detener Docker Compose:**
   ```bash
   docker-compose down
   ```

2. **Instalar CapRover:**
   ```bash
   docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock caprover/caprover
   ```

3. **Migrar variables de entorno:**
   - Copiar desde `.env` a CapRover panel

4. **Desplegar con CapRover:**
   - Seguir pasos de despliegue arriba
