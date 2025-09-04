# 🚀 API Commands Documentation - CURL Examples

Esta documentación contiene todos los comandos curl necesarios para interactuar con la API de Lugares Culturales.

**Base URL:** `https://desarrollo-apps-2-backend.onrender.com/api/v1`

---

## 📍 Lugares Culturales (Cultural Places)

### Obtener todos los lugares culturales
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places" \
  -H "Content-Type: application/json"
```

### Obtener lugar cultural por ID
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json"
```

### Filtrar lugares por categoría
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places?category=Centro%20Cultural" \
  -H "Content-Type: application/json"
```

### Obtener lugares con mejor calificación
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places/top-rated?limit=5" \
  -H "Content-Type: application/json"
```

### Buscar lugares cercanos
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places/nearby?lat=-34.5883775&lng=-58.4647175&radius=5" \
  -H "Content-Type: application/json"
```

### Crear nuevo lugar cultural
```bash
curl -X POST "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Centro Cultural",
    "description": "Un espacio cultural moderno para la comunidad",
    "category": "Centro Cultural",
    "characteristics": ["Exposiciones", "Talleres", "Conciertos"],
    "schedules": {
      "monday": {"open": "10:00", "close": "18:00", "closed": false},
      "tuesday": {"open": "10:00", "close": "18:00", "closed": false},
      "wednesday": {"open": "10:00", "close": "18:00", "closed": false},
      "thursday": {"open": "10:00", "close": "18:00", "closed": false},
      "friday": {"open": "10:00", "close": "18:00", "closed": false},
      "saturday": {"open": "10:00", "close": "18:00", "closed": false},
      "sunday": {"open": "10:00", "close": "18:00", "closed": false}
    },
    "contact": {
      "address": "Av. Principal 123",
      "coordinates": {"lat": -34.6037, "lng": -58.3816},
      "phone": "+54 11 1234-5678",
      "website": "https://example.com",
      "email": "info@centrocultural.com"
    },
    "image": "https://picsum.photos/800/600",
    "rating": 4.5,
    "isActive": true
  }'
```

### Actualizar lugar cultural
```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Nueva descripción actualizada",
    "rating": 4.8
  }'
```

---

## 🎭 Eventos (Events)

### Obtener todos los eventos
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events" \
  -H "Content-Type: application/json"
```

### Obtener eventos activos
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/active" \
  -H "Content-Type: application/json"
```

### Obtener evento por ID
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json"
```

### Obtener eventos por lugar cultural
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/cultural-place/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json"
```

### Obtener eventos por rango de fechas
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/date-range/2025-01-01/2025-12-31" \
  -H "Content-Type: application/json"
```

### Crear nuevo evento
```bash
curl -X POST "https://desarrollo-apps-2-backend.onrender.com/api/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "culturalPlaceId": "68b8d2e112a45cdbc2ec9856",
    "name": "Concierto de Jazz",
    "description": "Una noche mágica de jazz con artistas locales",
    "date": "2025-02-15",
    "time": "20:00",
    "ticketTypes": [
      {
        "type": "general",
        "price": 1500,
        "initialQuantity": 100,
        "soldQuantity": 0,
        "isActive": true
      },
      {
        "type": "vip",
        "price": 2500,
        "initialQuantity": 20,
        "soldQuantity": 0,
        "isActive": true
      },
      {
        "type": "jubilados",
        "price": 750,
        "initialQuantity": 30,
        "soldQuantity": 0,
        "isActive": true
      }
    ],
    "isActive": true
  }'
```

### Actualizar evento
```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Concierto de Jazz - Edición Especial",
    "description": "Una noche mágica de jazz con artistas locales - Edición especial con invitados internacionales",
    "time": "21:00"
  }'
```

### Desactivar evento
```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

---

## 🎫 Entradas (Tickets)

### Obtener todas las entradas
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets" \
  -H "Content-Type: application/json"
```

### Obtener entradas activas
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/active" \
  -H "Content-Type: application/json"
```

### Obtener entrada por ID
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json"
```

### Obtener entradas por evento
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/event/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json"
```

### Obtener entradas por usuario
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/user/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json"
```

### Obtener entradas por evento y usuario
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/event/68b8d2e612a45cdbc2ec987e/user/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json"
```

### Obtener entradas por estado
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/status/active" \
  -H "Content-Type: application/json"
```

### Obtener estadísticas de entradas por evento
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/event/68b8d2e612a45cdbc2ec987e/stats" \
  -H "Content-Type: application/json"
```

### Comprar entrada (Crear ticket)
```bash
curl -X POST "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "68b8d2e612a45cdbc2ec987e",
    "userId": "68b8d2e112a45cdbc2ec9856",
    "ticketType": "general",
    "price": 1500
  }'
```

### Utilizar entrada (Marcar como usada)
```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/68b8d2e612a45cdbc2ec987e/use" \
  -H "Content-Type: application/json"
```

### Cancelar entrada
```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }'
```

### Reembolsar entrada
```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "refunded"
  }'
```

---

## 👥 Usuarios (Users)

### Obtener todos los usuarios
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/users" \
  -H "Content-Type: application/json"
```

### Obtener usuario por ID
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/users/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json"
```

### Crear nuevo usuario
```bash
curl -X POST "https://desarrollo-apps-2-backend.onrender.com/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "password": "password123",
    "role": "user",
    "isActive": true
  }'
```

### Actualizar usuario
```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/users/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Carlos Pérez",
    "email": "juan.carlos@email.com"
  }'
```

---

## 🔍 Ejemplos de Filtros y Búsquedas

### Filtrar lugares por múltiples criterios
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places?category=Centro%20Cultural&isActive=true&minRating=4.0&limit=10" \
  -H "Content-Type: application/json"
```

### Buscar eventos por lugar y fecha
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events?culturalPlaceId=68b8d2e112a45cdbc2ec9856&isActive=true&limit=5" \
  -H "Content-Type: application/json"
```

### Obtener entradas con filtros
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets?eventId=68b8d2e612a45cdbc2ec987e&status=active&ticketType=general" \
  -H "Content-Type: application/json"
```

---

## 📊 Respuestas de Ejemplo

### Respuesta de lugar cultural
```json
{
  "_id": "68b8d2e112a45cdbc2ec9856",
  "name": "Oihoy Casa Abierta",
  "description": "Un espacio cultural dedicado a promover el arte contemporáneo...",
  "category": "Centro Cultural",
  "characteristics": ["Exposiciones", "Actividades Comunitarias"],
  "schedules": {
    "monday": {"open": "10:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "10:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "10:00", "close": "18:00", "closed": false},
    "thursday": {"open": "10:00", "close": "18:00", "closed": false},
    "friday": {"open": "10:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "18:00", "closed": false},
    "sunday": {"open": "10:00", "close": "18:00", "closed": false}
  },
  "contact": {
    "address": "14 De Julio 426",
    "coordinates": {"lat": -34.5883775, "lng": -58.4647175},
    "phone": "45510070",
    "website": "www.oihoy.blogspot.com.ar",
    "email": "info@lugar.com"
  },
  "image": "https://picsum.photos/800/600?random=619",
  "rating": 3.1,
  "isActive": true,
  "createdAt": "2025-09-03T23:44:33.276Z",
  "updatedAt": "2025-09-04T22:18:23.626Z"
}
```

### Respuesta de evento
```json
{
  "_id": "68b8d2e612a45cdbc2ec987e",
  "culturalPlaceId": "68b8d2e112a45cdbc2ec9856",
  "name": "Concierto de Jazz",
  "description": "Una noche mágica de jazz con artistas locales",
  "date": "2025-02-15T00:00:00.000Z",
  "time": "20:00",
  "ticketTypes": [
    {
      "type": "general",
      "price": 1500,
      "initialQuantity": 100,
      "soldQuantity": 25,
      "isActive": true
    },
    {
      "type": "vip",
      "price": 2500,
      "initialQuantity": 20,
      "soldQuantity": 5,
      "isActive": true
    }
  ],
  "isActive": true,
  "createdAt": "2025-09-04T22:19:23.778Z",
  "updatedAt": "2025-09-04T22:19:23.778Z"
}
```

### Respuesta de entrada
```json
{
  "_id": "68b8d2e612a45cdbc2ec987e",
  "eventId": "68b8d2e612a45cdbc2ec987e",
  "userId": "68b8d2e112a45cdbc2ec9856",
  "ticketType": "general",
  "price": 1500,
  "status": "active",
  "isActive": true,
  "createdAt": "2025-09-04T22:19:23.778Z",
  "updatedAt": "2025-09-04T22:19:23.778Z"
}
```

---

## ⚠️ Códigos de Estado HTTP

- **200** - OK (Operación exitosa)
- **201** - Created (Recurso creado exitosamente)
- **204** - No Content (Operación exitosa sin contenido)
- **400** - Bad Request (Error de validación)
- **404** - Not Found (Recurso no encontrado)
- **409** - Conflict (Conflicto, ej: nombre duplicado)
- **500** - Internal Server Error (Error del servidor)

---

## 🔧 Notas Importantes

1. **Content-Type**: Siempre usar `application/json`
2. **IDs**: Los IDs son strings de MongoDB ObjectId
3. **Fechas**: Usar formato ISO 8601 (YYYY-MM-DD)
4. **Horarios**: Usar formato 24h (HH:MM)
5. **Coordenadas**: Latitud y longitud como números decimales
6. **Precios**: En centavos o como números decimales
7. **Estados de tickets**: `active`, `used`, `cancelled`, `refunded`

---

## 📱 Uso en Frontend

Para usar estos comandos en el frontend, reemplaza `curl` con `fetch`:

```javascript
// Ejemplo: Obtener todos los lugares culturales
fetch('https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Ejemplo: Crear un evento
fetch('https://desarrollo-apps-2-backend.onrender.com/api/v1/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    culturalPlaceId: "68b8d2e112a45cdbc2ec9856",
    name: "Nuevo Evento",
    description: "Descripción del evento",
    date: "2025-02-15",
    time: "20:00",
    ticketTypes: [
      {
        type: "general",
        price: 1500,
        initialQuantity: 100,
        soldQuantity: 0,
        isActive: true
      }
    ],
    isActive: true
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

**Última actualización:** 4 de Septiembre, 2025
**Versión de la API:** v1
