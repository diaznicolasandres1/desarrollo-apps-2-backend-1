# API Endpoints - Cultural Places

## 📚 Documentación Swagger

**Swagger UI:** https://desarrollo-apps2-back-end.vercel.app/docs

**Swagger JSON:** https://desarrollo-apps2-back-end.vercel.app/docs-json

---

## 🏠 Endpoints Generales

### `GET /api/v1`
- **Descripción:** Información general de la API
- **Respuesta:** Información básica del servicio

---

## 👥 Usuarios

### `POST /api/v1/users`
- **Descripción:** Crear un nuevo usuario
- **Body:** Datos del usuario (nombre, email, etc.)

### `GET /api/v1/users`
- **Descripción:** Obtener todos los usuarios
- **Respuesta:** Lista de usuarios

### `GET /api/v1/users/{id}`
- **Descripción:** Obtener un usuario por ID
- **Parámetros:** `id` - ID del usuario

### `PUT /api/v1/users/{id}`
- **Descripción:** Actualizar un usuario completo
- **Parámetros:** `id` - ID del usuario
- **Body:** Datos actualizados del usuario

### `DELETE /api/v1/users/{id}`
- **Descripción:** Eliminar un usuario
- **Parámetros:** `id` - ID del usuario

---

## 🏛️ Lugares Culturales

### `POST /api/v1/cultural-places`
- **Descripción:** Crear un nuevo lugar cultural
- **Body:** Datos del lugar cultural (nombre, descripción, categoría, coordenadas, horarios, contacto, etc.)

### `GET /api/v1/cultural-places`
- **Descripción:** Obtener todos los lugares culturales
- **Query Parameters:** 
  - `lat` - Latitud para búsqueda por proximidad
  - `lng` - Longitud para búsqueda por proximidad
  - `radius` - Radio de búsqueda en metros
- **Respuesta:** Lista de lugares culturales

### `GET /api/v1/cultural-places/{id}`
- **Descripción:** Obtener un lugar cultural por ID
- **Parámetros:** `id` - ID del lugar cultural

### `PUT /api/v1/cultural-places/{id}`
- **Descripción:** Actualizar un lugar cultural
- **Parámetros:** `id` - ID del lugar cultural
- **Body:** Datos actualizados del lugar cultural

### `DELETE /api/v1/cultural-places/{id}`
- **Descripción:** Eliminar un lugar cultural
- **Parámetros:** `id` - ID del lugar cultural

### `GET /api/v1/cultural-places/category/{category}`
- **Descripción:** Buscar lugares por categoría
- **Parámetros:** `category` - Categoría del lugar (Museum, Theater, Cultural Center, etc.)

### `GET /api/v1/cultural-places/nearby`
- **Descripción:** Buscar lugares cercanos por coordenadas
- **Query Parameters:**
  - `lat` - Latitud (requerido)
  - `lng` - Longitud (requerido)
  - `radius` - Radio de búsqueda en metros (requerido)

### `GET /api/v1/cultural-places/open/{day}`
- **Descripción:** Buscar lugares abiertos en un día específico
- **Parámetros:** `day` - Día de la semana (monday, tuesday, etc.)

### `GET /api/v1/cultural-places/top-rated`
- **Descripción:** Obtener los lugares mejor calificados
- **Query Parameters:** `limit` - Número máximo de resultados (opcional, default: 10)

### `PATCH /api/v1/cultural-places/{id}/toggle-active`
- **Descripción:** Activar/desactivar un lugar cultural
- **Parámetros:** `id` - ID del lugar cultural

---

## 🎭 Eventos

### `POST /api/v1/events`
- **Descripción:** Crear un nuevo evento
- **Body:** Datos del evento (nombre, descripción, fecha, hora, lugar cultural, precio, capacidad, etc.)

### `GET /api/v1/events`
- **Descripción:** Obtener todos los eventos
- **Respuesta:** Lista de eventos

### `GET /api/v1/events/{id}`
- **Descripción:** Obtener un evento por ID
- **Parámetros:** `id` - ID del evento

### `PATCH /api/v1/events/{id}`
- **Descripción:** Actualizar parcialmente un evento
- **Parámetros:** `id` - ID del evento
- **Body:** Campos a actualizar

### `DELETE /api/v1/events/{id}`
- **Descripción:** Eliminar un evento
- **Parámetros:** `id` - ID del evento

### `GET /api/v1/events/active`
- **Descripción:** Obtener eventos activos
- **Respuesta:** Lista de eventos activos

### `GET /api/v1/events/cultural-place/{culturalPlaceId}`
- **Descripción:** Obtener eventos de un lugar cultural específico
- **Parámetros:** `culturalPlaceId` - ID del lugar cultural

### `GET /api/v1/events/date-range/{startDate}/{endDate}`
- **Descripción:** Obtener eventos en un rango de fechas
- **Parámetros:** 
  - `startDate` - Fecha de inicio (YYYY-MM-DD)
  - `endDate` - Fecha de fin (YYYY-MM-DD)

### `PATCH /api/v1/events/{id}/toggle-active`
- **Descripción:** Activar/desactivar un evento
- **Parámetros:** `id` - ID del evento

---

## 🎫 Tickets

### `POST /api/v1/tickets/purchase`
- **Descripción:** Comprar un ticket para un evento
- **Body:** Datos de la compra (eventId, userId, ticketType, quantity)

### `GET /api/v1/tickets`
- **Descripción:** Obtener todos los tickets
- **Respuesta:** Lista de tickets

### `GET /api/v1/tickets/{id}`
- **Descripción:** Obtener un ticket por ID
- **Parámetros:** `id` - ID del ticket

### `PATCH /api/v1/tickets/{id}`
- **Descripción:** Actualizar parcialmente un ticket
- **Parámetros:** `id` - ID del ticket
- **Body:** Campos a actualizar

### `DELETE /api/v1/tickets/{id}`
- **Descripción:** Eliminar un ticket
- **Parámetros:** `id` - ID del ticket

### `GET /api/v1/tickets/active`
- **Descripción:** Obtener tickets activos
- **Respuesta:** Lista de tickets activos

### `GET /api/v1/tickets/event/{eventId}`
- **Descripción:** Obtener tickets de un evento específico
- **Parámetros:** `eventId` - ID del evento

### `GET /api/v1/tickets/user/{userId}`
- **Descripción:** Obtener tickets de un usuario específico
- **Parámetros:** `userId` - ID del usuario

### `GET /api/v1/tickets/event/{eventId}/user/{userId}`
- **Descripción:** Obtener tickets de un usuario para un evento específico
- **Parámetros:** 
  - `eventId` - ID del evento
  - `userId` - ID del usuario

### `GET /api/v1/tickets/status/{status}`
- **Descripción:** Obtener tickets por estado
- **Parámetros:** `status` - Estado del ticket (active, used, cancelled)

### `GET /api/v1/tickets/event/{eventId}/stats`
- **Descripción:** Obtener estadísticas de tickets de un evento
- **Parámetros:** `eventId` - ID del evento
- **Respuesta:** Estadísticas detalladas (ventas, ingresos, tipos de tickets, etc.)

### `PATCH /api/v1/tickets/{id}/use`
- **Descripción:** Marcar un ticket como usado
- **Parámetros:** `id` - ID del ticket

### `PATCH /api/v1/tickets/{id}/cancel`
- **Descripción:** Cancelar un ticket
- **Parámetros:** `id` - ID del ticket

---

## 📊 Códigos de Estado HTTP

- **200** - OK: Solicitud exitosa
- **201** - Created: Recurso creado exitosamente
- **400** - Bad Request: Datos de entrada inválidos
- **404** - Not Found: Recurso no encontrado
- **409** - Conflict: Conflicto (ej: nombre duplicado)
- **500** - Internal Server Error: Error interno del servidor

---

## 🔧 Ejemplos de Uso

### Crear un lugar cultural:
```bash
curl -X POST "https://desarrollo-apps2-back-end.vercel.app/api/v1/cultural-places" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Museo Nacional de Bellas Artes",
    "description": "Museo de arte argentino e internacional",
    "category": "Museum",
    "contact": {
      "address": "Av. del Libertador 1473, CABA",
      "coordinates": {
        "type": "Point",
        "coordinates": [-58.3944, -34.5868]
      },
      "phone": "+54 11 4803-0802",
      "website": "https://www.bellasartes.gob.ar",
      "email": "info@bellasartes.gob.ar"
    }
  }'
```

### Buscar lugares cercanos:
```bash
curl -X GET "https://desarrollo-apps2-back-end.vercel.app/api/v1/cultural-places/nearby?lat=-34.6037&lng=-58.3816&radius=1000"
```

### Comprar un ticket:
```bash
curl -X POST "https://desarrollo-apps2-back-end.vercel.app/api/v1/tickets/purchase" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "EVENT_ID",
    "userId": "USER_ID",
    "ticketType": "general",
    "quantity": 2
  }'
```

---

## 📝 Notas Importantes

1. **Coordenadas:** Se utilizan en formato GeoJSON Point `[longitud, latitud]`
2. **Fechas:** Formato ISO 8601 (YYYY-MM-DD)
3. **Horarios:** Formato 24h (HH:MM)
4. **Categorías:** Museum, Theater, Cultural Center, Library, Gallery
5. **Tipos de tickets:** general, vip, jubilados, niños
6. **Estados de tickets:** active, used, cancelled

---

*Documentación generada automáticamente - Última actualización: $(date)*
