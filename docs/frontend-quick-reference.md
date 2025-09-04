# 🚀 Guía Rápida para Frontend - API Commands

## 📍 Operaciones Principales

> **💡 Nota importante:** Los eventos ahora incluyen información completa del centro cultural relacionado. El campo `culturalPlaceId` ya no es solo un ID, sino un objeto con toda la información del lugar cultural.

### 1. 🎭 Traer Eventos

#### Obtener todos los eventos
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events" \
  -H "Content-Type: application/json"
```

#### Obtener eventos activos
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/active" \
  -H "Content-Type: application/json"
```

#### Obtener eventos por lugar cultural
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/cultural-place/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json"
```

#### Obtener evento específico
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/events/68b8d2e612a45cdbc2ec987e" \
  -H "Content-Type: application/json"
```

### 2. ➕ Crear Eventos

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

### 3. 🎫 Sacar Entradas (Comprar Tickets)

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

### 4. ✅ Utilizar Entradas (Marcar como usada)

```bash
curl -X PATCH "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/68b8d2e612a45cdbc2ec987e/use" \
  -H "Content-Type: application/json"
```

---

## 📱 Ejemplos en JavaScript (Fetch)

### Obtener eventos
```javascript
// Obtener todos los eventos
fetch('https://desarrollo-apps-2-backend.onrender.com/api/v1/events', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(events => {
  console.log('Eventos:', events);
  // Aquí puedes actualizar tu UI
})
.catch(error => console.error('Error:', error));
```

### Crear evento
```javascript
// Crear un nuevo evento
const newEvent = {
  culturalPlaceId: "68b8d2e112a45cdbc2ec9856",
  name: "Concierto de Jazz",
  description: "Una noche mágica de jazz con artistas locales",
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
};

fetch('https://desarrollo-apps-2-backend.onrender.com/api/v1/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newEvent)
})
.then(response => response.json())
.then(event => {
  console.log('Evento creado:', event);
  // Actualizar UI con el nuevo evento
})
.catch(error => console.error('Error:', error));
```

### Comprar entrada
```javascript
// Comprar una entrada
const ticketData = {
  eventId: "68b8d2e612a45cdbc2ec987e",
  userId: "68b8d2e112a45cdbc2ec9856",
  ticketType: "general",
  price: 1500
};

fetch('https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(ticketData)
})
.then(response => response.json())
.then(ticket => {
  console.log('Entrada comprada:', ticket);
  // Mostrar confirmación al usuario
})
.catch(error => console.error('Error:', error));
```

### Utilizar entrada
```javascript
// Marcar entrada como usada
const ticketId = "68b8d2e612a45cdbc2ec987e";

fetch(`https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/${ticketId}/use`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(ticket => {
  console.log('Entrada utilizada:', ticket);
  // Actualizar estado en la UI
})
.catch(error => console.error('Error:', error));
```

---

## 🔍 Operaciones Adicionales Útiles

### Obtener lugares culturales
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/cultural-places" \
  -H "Content-Type: application/json"
```

### Obtener entradas de un usuario
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/user/68b8d2e112a45cdbc2ec9856" \
  -H "Content-Type: application/json"
```

### Obtener entradas de un evento
```bash
curl -X GET "https://desarrollo-apps-2-backend.onrender.com/api/v1/tickets/event/68b8d2e612a45cdbc2ec987e" \
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

---

## 📊 Estructura de Datos

### Evento
```json
{
  "_id": "68b8d2e612a45cdbc2ec987e",
  "culturalPlaceId": {
    "_id": "68b8d2e112a45cdbc2ec9856",
    "name": "Centro Cultural Raices",
    "description": "Un centro cultural que ofrece servicios de biblioteca, proyecciones de cine y galería de arte",
    "category": "Centro Cultural",
    "characteristics": ["Servicios de Biblioteca", "Proyecciones de Cine", "Galería de Arte"],
    "contact": {
      "address": "Agrelo 3045",
      "coordinates": {"lat": -34.61724004, "lng": -58.40879856},
      "phone": "49316157",
      "website": "https://example.com",
      "email": "info@lugar.com"
    },
    "image": "https://picsum.photos/800/600?random=756",
    "rating": 3.3
  },
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
    }
  ],
  "isActive": true,
  "createdAt": "2025-09-04T22:19:23.778Z",
  "updatedAt": "2025-09-04T22:19:23.778Z"
}
```

### Entrada
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

## ⚠️ Códigos de Estado

- **200** - OK (Operación exitosa)
- **201** - Created (Recurso creado exitosamente)
- **400** - Bad Request (Error de validación)
- **404** - Not Found (Recurso no encontrado)
- **409** - Conflict (Conflicto, ej: no hay entradas disponibles)

---

## 🔧 Notas Importantes

1. **IDs**: Usar los IDs reales de tu base de datos
2. **Fechas**: Formato YYYY-MM-DD
3. **Horarios**: Formato HH:MM (24h)
4. **Precios**: En centavos
5. **Estados de tickets**: `active`, `used`, `cancelled`, `refunded`

---

**Base URL:** `https://desarrollo-apps-2-backend.onrender.com/api/v1`
