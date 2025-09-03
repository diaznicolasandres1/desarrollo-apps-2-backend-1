# 🏛️ Diseño de Base de Datos - Lugares Culturales

## 📋 Índice
- [Análisis del Dominio](#análisis-del-dominio)
- [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
- [Diseño de Colecciones](#diseño-de-colecciones)
- [Índices y Optimización](#índices-y-optimización)
- [Casos de Uso](#casos-de-uso)
- [Consultas Optimizadas](#consultas-optimizadas)
- [Consideraciones de Escalabilidad](#consideraciones-de-escalabilidad)

---

## 🎯 Análisis del Dominio

### **Descripción del Sistema**
Aplicación web para mostrar y gestionar lugares culturales de una ciudad, incluyendo museos, centros culturales, teatros, cines, etc. El sistema permite la gestión de eventos y venta de entradas.

### **Entidades Principales**
1. **Lugares Culturales** - Espacios físicos con información cultural
2. **Eventos** - Actividades específicas en los lugares culturales
3. **Usuarios** - Administradores, supervisores y usuarios normales
4. **Entradas** - Tickets individuales para eventos

### **Requisitos Funcionales**
- Gestión de lugares culturales con información detallada
- Gestión de eventos con diferentes tipos de entrada
- Sistema de venta de entradas individuales
- Control de acceso y validación de entradas
- Roles de usuario diferenciados

---

## 🗄️ Arquitectura de Base de Datos

### **Tecnología**
- **Base de Datos**: MongoDB (NoSQL)
- **ODM**: Mongoose (Node.js)
- **Patrón**: Document-based con referencias

### **Decisiones de Diseño**

#### **1. Separación de Colecciones**
- **`cultural_places`**: Información de lugares culturales
- **`events`**: Eventos asociados a lugares
- **`users`**: Usuarios del sistema
- **`tickets`**: Entradas individuales

#### **2. Justificación de la Separación**
- **Escalabilidad**: Cada colección puede crecer independientemente
- **Consultas Eficientes**: Búsquedas específicas por entidad
- **Mantenibilidad**: Separación clara de responsabilidades
- **Flexibilidad**: Fácil agregar nuevas características

---

## 📊 Diseño de Colecciones

### **1. Colección: `cultural_places`**

```javascript
{
  _id: ObjectId,
  name: String,                    // Nombre del lugar
  category: String,                // Museo, Cine, Centro Cultural, Teatro, etc.
  characteristics: [String],        // Array de características
  schedules: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  contact: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    phone: String,
    website: String,
    email: String
  },
  image: String,                   // URL de la imagen
  rating: Number,                  // Calificación (4.5)
  isActive: Boolean,               // Lugar activo/inactivo
  createdAt: Date,
  updatedAt: Date
}
```

**Campos Clave:**
- `category`: Categorización del lugar cultural
- `characteristics`: Lista de características especiales
- `schedules`: Horarios detallados por día de la semana
- `coordinates`: Coordenadas geográficas para mapas
- `rating`: Calificación del lugar

### **2. Colección: `events`**

```javascript
{
  _id: ObjectId,
  culturalPlaceId: ObjectId,       // Referencia al lugar cultural
  name: String,                    // Nombre del evento
  description: String,             // Descripción del evento
  date: Date,                      // Fecha del evento
  time: String,                    // Horario del evento
  ticketTypes: [
    {
      type: String,                // "general", "vip", "jubilados", "niños"
      price: Number,
      initialQuantity: Number,
      soldQuantity: Number,
      isActive: Boolean
    }
  ],
  isActive: Boolean,               // Evento activo/inactivo
  createdAt: Date,
  updatedAt: Date
}
```

**Campos Clave:**
- `culturalPlaceId`: Referencia al lugar cultural
- `ticketTypes`: Array de tipos de entrada disponibles
- `date` y `time`: Información temporal del evento

### **3. Colección: `users`**

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,                // Hasheado
  role: String,                    // "admin", "supervisor", "user"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Campos Clave:**
- `role`: Rol del usuario en el sistema
- `password`: Contraseña hasheada para seguridad

### **4. Colección: `tickets`**

```javascript
{
  _id: ObjectId,
  eventId: ObjectId,               // Referencia al evento
  userId: ObjectId,                // Referencia al usuario que compró
  ticketType: String,              // Tipo de entrada ("general", "vip", etc.)
  price: Number,                   // Precio de esta entrada específica
  status: String,                  // "active", "used", "cancelled", "refunded"
  usedAt: Date,                    // Cuándo se usó (null si no se usó)
  usedBy: ObjectId,                // Quién la usó (puede ser diferente al comprador)
  purchaseDate: Date,              // Fecha de compra
  createdAt: Date
}
```

**Campos Clave:**
- `status`: Estado de la entrada para control individual
- `usedAt` y `usedBy`: Información de uso de la entrada
- `price`: Precio individual de la entrada

---

## 🔍 Índices y Optimización

### **Colección `cultural_places`**

```javascript
// Índice por categoría
{ category: 1 }

// Índice geoespacial para búsquedas por proximidad
{ "contact.coordinates": "2dsphere" }

// Índice de texto para búsqueda por nombre
{ name: "text" }

// Índice por calificación (para ordenar)
{ rating: -1 }

// Índice por estado activo
{ isActive: 1 }
```

### **Colección `events`**

```javascript
// Índice por lugar cultural
{ culturalPlaceId: 1 }

// Índice por fecha
{ date: 1 }

// Índice compuesto: lugar + fecha (muy usado)
{ culturalPlaceId: 1, date: 1 }

// Índice por estado activo
{ isActive: 1 }

// Índice por fecha y estado activo
{ date: 1, isActive: 1 }
```

### **Colección `tickets`**

```javascript
// Índice compuesto: evento + estado (para verificar disponibilidad)
{ eventId: 1, status: 1 }

// Índice por usuario (para ver entradas de un usuario)
{ userId: 1, status: 1 }

// Índice por fecha de compra
{ purchaseDate: -1 }

// Índice por fecha de uso
{ usedAt: -1 }

// Índice único para validación rápida
{ _id: 1, status: 1 }
```

---

## 🎫 Casos de Uso

### **1. Gestión de Lugares Culturales**

#### **Crear un Lugar Cultural**
```javascript
// Insertar nuevo lugar cultural
db.cultural_places.insertOne({
  name: "Museo de Arte Moderno",
  category: "Museo",
  characteristics: ["Exposiciones temporales", "Visitas guiadas", "Cafetería"],
  schedules: {
    monday: { open: "10:00", close: "18:00", closed: false },
    tuesday: { open: "10:00", close: "18:00", closed: false },
    // ... resto de días
  },
  contact: {
    address: "Av. Principal 123",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    phone: "+54 11 1234-5678",
    website: "https://museoarte.com",
    email: "info@museoarte.com"
  },
  image: "https://example.com/museo.jpg",
  rating: 4.5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### **Buscar Lugares por Categoría**
```javascript
// Buscar todos los museos
db.cultural_places.find({ category: "Museo", isActive: true })
```

#### **Buscar Lugares por Proximidad**
```javascript
// Buscar lugares cercanos a una ubicación
db.cultural_places.find({
  "contact.coordinates": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-58.3816, -34.6037]
      },
      $maxDistance: 5000 // 5km
    }
  }
})
```

### **2. Gestión de Eventos**

#### **Crear un Evento**
```javascript
// Insertar nuevo evento
db.events.insertOne({
  culturalPlaceId: ObjectId("placeId"),
  name: "Exposición de Arte Contemporáneo",
  description: "Muestra de artistas locales",
  date: new Date("2024-03-15"),
  time: "19:00",
  ticketTypes: [
    {
      type: "general",
      price: 1000,
      initialQuantity: 100,
      soldQuantity: 0,
      isActive: true
    },
    {
      type: "vip",
      price: 2000,
      initialQuantity: 20,
      soldQuantity: 0,
      isActive: true
    }
  ],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### **Obtener Eventos de un Lugar**
```javascript
// Buscar eventos de un lugar específico
db.events.find({ 
  culturalPlaceId: ObjectId("placeId"),
  isActive: true 
}).sort({ date: 1 })
```

### **3. Gestión de Entradas**

#### **Comprar Entradas**
```javascript
// Usuario compra 3 entradas generales
// Se crean 3 documentos individuales
db.tickets.insertMany([
  {
    eventId: ObjectId("eventId"),
    userId: ObjectId("userId"),
    ticketType: "general",
    price: 1000,
    status: "active",
    purchaseDate: new Date(),
    createdAt: new Date()
  },
  // ... 2 entradas más
])
```

#### **Verificar Disponibilidad**
```javascript
// Contar entradas activas de un evento
db.tickets.countDocuments({ 
  eventId: ObjectId("eventId"), 
  status: "active" 
})
```

#### **Validar Entrada**
```javascript
// Verificar si una entrada es válida
db.tickets.findOne({ 
  _id: ObjectId("ticketId"), 
  status: "active" 
})
```

#### **Usar Entrada**
```javascript
// Marcar entrada como usada
db.tickets.updateOne(
  { _id: ObjectId("ticketId"), status: "active" },
  { 
    $set: { 
      status: "used", 
      usedAt: new Date(),
      usedBy: ObjectId("userId") 
    } 
  }
)
```

---

## 📈 Consultas Optimizadas

### **1. Lugares Abiertos en un Horario**
```javascript
// Buscar lugares abiertos los martes
db.cultural_places.find({
  "schedules.tuesday.closed": false,
  isActive: true
})
```

### **2. Eventos Próximos**
```javascript
// Eventos en los próximos 7 días
db.events.find({
  date: {
    $gte: new Date(),
    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  isActive: true
}).sort({ date: 1 })
```

### **3. Entradas de Usuario**
```javascript
// Todas las entradas de un usuario
db.tickets.find({ 
  userId: ObjectId("userId") 
}).sort({ purchaseDate: -1 })
```

### **4. Reporte de Ventas por Evento**
```javascript
// Agrupar por estado
db.tickets.aggregate([
  { $match: { eventId: ObjectId("eventId") } },
  { $group: { 
    _id: "$status", 
    count: { $sum: 1 },
    totalRevenue: { $sum: "$price" }
  }}
])
```

### **5. Lugares con Mejor Calificación**
```javascript
// Top 10 lugares por calificación
db.cultural_places.find({ isActive: true })
  .sort({ rating: -1 })
  .limit(10)
```

---

## ⚡ Consideraciones de Escalabilidad

### **1. Particionamiento**
- **Por Fecha**: Particionar eventos por año/mes
- **Por Ubicación**: Particionar lugares por región geográfica
- **Por Usuario**: Particionar tickets por rango de usuario

### **2. Caché**
- **Redis**: Cachear lugares populares y eventos próximos
- **CDN**: Imágenes de lugares culturales
- **In-Memory**: Datos de sesión de usuario

### **3. Monitoreo**
- **Métricas**: Tiempo de respuesta de consultas
- **Alertas**: Uso de índices y espacio en disco
- **Logs**: Operaciones de lectura/escritura

### **4. Backup y Recuperación**
- **Backup Automático**: Diario de toda la base de datos
- **Point-in-Time Recovery**: Recuperación a momentos específicos
- **Replicación**: Múltiples réplicas para alta disponibilidad

---

## 🔒 Consideraciones de Seguridad

### **1. Autenticación**
- Contraseñas hasheadas con bcrypt
- Tokens JWT para sesiones
- Rate limiting en endpoints críticos

### **2. Autorización**
- Roles de usuario (admin, supervisor, user)
- Permisos granulares por operación
- Validación de acceso a recursos

### **3. Validación de Datos**
- Schemas de Mongoose con validación
- Sanitización de entrada de usuario
- Validación de tipos de datos

---

## 📝 Conclusión

Este diseño de base de datos proporciona:

1. **Escalabilidad**: Estructura que puede crecer con el sistema
2. **Performance**: Índices optimizados para consultas frecuentes
3. **Flexibilidad**: Fácil agregar nuevas características
4. **Mantenibilidad**: Separación clara de responsabilidades
5. **Seguridad**: Consideraciones de autenticación y autorización

El diseño está optimizado para las operaciones más frecuentes del sistema y permite un crecimiento controlado de la aplicación.

---

*Documento generado el: ${new Date().toLocaleDateString('es-ES')}*
*Versión: 1.0*
