# 🎯 Análisis de Casos de Uso - Lugares Culturales

## 📋 Índice
- [Descripción General](#descripción-general)
- [Actores del Sistema](#actores-del-sistema)
- [Casos de Uso Principales](#casos-de-uso-principales)
- [Casos de Uso Adicionales](#casos-de-uso-adicionales)
- [Arquitectura de Módulos](#arquitectura-de-módulos)
- [Endpoints Sugeridos](#endpoints-sugeridos)
- [Flujos de Trabajo](#flujos-de-trabajo)
- [Consideraciones Técnicas](#consideraciones-técnicas)

---

## 🎯 Descripción General

### **Propósito del Sistema**
Aplicación web para la gestión integral de lugares culturales, eventos y venta de entradas. El sistema permite a administradores y supervisores gestionar el contenido cultural, mientras que los usuarios pueden explorar lugares, eventos y realizar compras de entradas.

### **Objetivos Principales**
- Facilitar la gestión de lugares culturales
- Permitir la creación y gestión de eventos
- Proporcionar un sistema de venta de entradas
- Ofrecer herramientas de búsqueda y filtrado
- Generar reportes y analytics

---

## 👥 Actores del Sistema

### **1. Administrador**
- **Descripción**: Usuario con acceso completo al sistema
- **Responsabilidades**:
  - Gestión completa de lugares culturales
  - Gestión de eventos y entradas
  - Administración de usuarios y roles
  - Generación de reportes
  - Configuración del sistema

### **2. Supervisor**
- **Descripción**: Usuario con permisos limitados de gestión
- **Responsabilidades**:
  - Crear y modificar lugares culturales
  - Gestionar eventos
  - Validar entradas
  - Ver reportes básicos

### **3. Usuario Registrado**
- **Descripción**: Usuario final del sistema
- **Responsabilidades**:
  - Explorar lugares y eventos
  - Comprar entradas
  - Ver historial de compras
  - Recibir notificaciones

### **4. Sistema**
- **Descripción**: Procesos automáticos
- **Responsabilidades**:
  - Envío de notificaciones
  - Validaciones automáticas
  - Procesamiento de datos

---

## 🏛️ Casos de Uso Principales

### **1. Gestión de Lugares Culturales**

#### **1.1 Dar de Alta un Lugar**
- **ID**: UC-001
- **Actor**: Administrador/Supervisor
- **Descripción**: Crear un nuevo lugar cultural en el sistema
- **Precondiciones**: Usuario autenticado con permisos adecuados
- **Flujo Principal**:
  1. Usuario accede al formulario de creación
  2. Completa los datos del lugar (nombre, categoría, características, horarios, contacto, imagen)
  3. Sistema valida los datos ingresados
  4. Sistema crea el lugar y asigna ID único
  5. Sistema confirma la creación
- **Postcondiciones**: Lugar creado y disponible en el sistema
- **Validaciones**:
  - Nombre único en el sistema
  - Coordenadas geográficas válidas
  - Email válido
  - Categoría válida
  - Horarios coherentes

#### **1.2 Modificar un Lugar**
- **ID**: UC-002
- **Actor**: Administrador/Supervisor
- **Descripción**: Actualizar información de un lugar existente
- **Precondiciones**: Lugar existente en el sistema
- **Flujo Principal**:
  1. Usuario selecciona lugar a modificar
  2. Sistema carga datos actuales
  3. Usuario modifica los campos deseados
  4. Sistema valida cambios
  5. Sistema actualiza información
- **Postcondiciones**: Lugar actualizado con nueva información
- **Validaciones**: Mismas que en alta

#### **1.3 Desactivar/Activar Lugar**
- **ID**: UC-003
- **Actor**: Administrador
- **Descripción**: Cambiar estado activo/inactivo de un lugar
- **Precondiciones**: Lugar existente
- **Flujo Principal**:
  1. Usuario selecciona lugar
  2. Cambia estado a activo/inactivo
  3. Sistema actualiza estado
- **Postcondiciones**: Lugar con nuevo estado

### **2. Gestión de Eventos**

#### **2.1 Crear Evento para un Lugar**
- **ID**: UC-004
- **Actor**: Administrador/Supervisor
- **Descripción**: Crear un nuevo evento en un lugar específico
- **Precondiciones**: Lugar existente y activo
- **Flujo Principal**:
  1. Usuario selecciona lugar
  2. Completa datos del evento (nombre, descripción, fecha, horario, tipos de entrada)
  3. Sistema valida datos
  4. Sistema crea evento
- **Postcondiciones**: Evento creado y disponible
- **Validaciones**:
  - Lugar debe existir y estar activo
  - Fecha futura
  - Tipos de entrada válidos
  - Horarios coherentes

#### **2.2 Modificar Evento**
- **ID**: UC-005
- **Actor**: Administrador/Supervisor
- **Descripción**: Actualizar información de un evento
- **Precondiciones**: Evento existente
- **Flujo Principal**:
  1. Usuario selecciona evento
  2. Modifica datos permitidos
  3. Sistema valida cambios
  4. Sistema actualiza evento
- **Postcondiciones**: Evento actualizado
- **Validaciones**: No permitir modificar si ya hay entradas vendidas

#### **2.3 Cancelar Evento**
- **ID**: UC-006
- **Actor**: Administrador/Supervisor
- **Descripción**: Cancelar un evento y procesar reembolsos
- **Precondiciones**: Evento existente
- **Flujo Principal**:
  1. Usuario selecciona evento a cancelar
  2. Ingresa motivo de cancelación
  3. Sistema cancela evento
  4. Sistema procesa reembolsos automáticos
  5. Sistema notifica a usuarios afectados
- **Postcondiciones**: Evento cancelado, entradas reembolsadas

### **3. Gestión de Entradas**

#### **3.1 Comprar Entradas**
- **ID**: UC-007
- **Actor**: Usuario registrado
- **Descripción**: Comprar una o más entradas para un evento
- **Precondiciones**: Usuario autenticado, evento activo
- **Flujo Principal**:
  1. Usuario selecciona evento
  2. Elige tipos y cantidades de entradas
  3. Sistema verifica disponibilidad
  4. Usuario confirma compra
  5. Sistema crea entradas individuales
  6. Sistema confirma compra
- **Postcondiciones**: Entradas creadas y asignadas al usuario
- **Validaciones**:
  - Evento activo y con disponibilidad
  - Usuario autenticado
  - Stock disponible
  - Tipos de entrada válidos

#### **3.2 Consumir Entradas**
- **ID**: UC-008
- **Actor**: Supervisor/Administrador
- **Descripción**: Validar y marcar entrada como usada
- **Precondiciones**: Entrada válida y activa
- **Flujo Principal**:
  1. Usuario presenta entrada (QR, código, etc.)
  2. Sistema valida entrada
  3. Sistema marca como usada
  4. Sistema registra fecha y hora de uso
- **Postcondiciones**: Entrada marcada como usada
- **Validaciones**:
  - Entrada válida y activa
  - Fecha del evento correcta
  - No usada previamente

#### **3.3 Reembolsar Entradas**
- **ID**: UC-009
- **Actor**: Administrador/Supervisor
- **Descripción**: Procesar reembolso de entradas
- **Precondiciones**: Entrada existente
- **Flujo Principal**:
  1. Usuario solicita reembolso
  2. Administrador evalúa solicitud
  3. Sistema procesa reembolso
  4. Sistema marca entrada como reembolsada
- **Postcondiciones**: Entrada reembolsada

---

## 🔍 Casos de Uso Adicionales

### **4. Consultas y Búsquedas**

#### **4.1 Buscar Lugares por Categoría**
- **ID**: UC-010
- **Actor**: Usuario
- **Descripción**: Filtrar lugares por tipo (Museo, Teatro, etc.)
- **Flujo Principal**:
  1. Usuario selecciona categoría
  2. Sistema filtra lugares
  3. Sistema muestra resultados
- **Salida**: Lista de lugares filtrados

#### **4.2 Buscar Lugares por Proximidad**
- **ID**: UC-011
- **Actor**: Usuario
- **Descripción**: Encontrar lugares cercanos a una ubicación
- **Flujo Principal**:
  1. Usuario ingresa ubicación
  2. Sistema calcula distancias
  3. Sistema ordena por proximidad
- **Salida**: Lugares ordenados por distancia

#### **4.3 Buscar Eventos Próximos**
- **ID**: UC-012
- **Actor**: Usuario
- **Descripción**: Eventos en los próximos días
- **Flujo Principal**:
  1. Usuario define rango de fechas
  2. Sistema filtra eventos
  3. Sistema ordena por fecha
- **Salida**: Lista de eventos

#### **4.4 Buscar Lugares Abiertos**
- **ID**: UC-013
- **Actor**: Usuario
- **Descripción**: Lugares abiertos en un horario específico
- **Flujo Principal**:
  1. Usuario selecciona día y horario
  2. Sistema verifica horarios
  3. Sistema filtra lugares abiertos
- **Salida**: Lugares disponibles

### **5. Gestión de Usuarios**

#### **5.1 Registro de Usuario**
- **ID**: UC-014
- **Actor**: Usuario
- **Descripción**: Crear cuenta de usuario
- **Flujo Principal**:
  1. Usuario completa formulario
  2. Sistema valida datos
  3. Sistema crea cuenta
  4. Sistema envía confirmación
- **Postcondiciones**: Usuario registrado

#### **5.2 Autenticación**
- **ID**: UC-015
- **Actor**: Usuario
- **Descripción**: Iniciar sesión
- **Flujo Principal**:
  1. Usuario ingresa credenciales
  2. Sistema valida credenciales
  3. Sistema genera token
- **Salida**: Token de autenticación

#### **5.3 Gestionar Roles**
- **ID**: UC-016
- **Actor**: Administrador
- **Descripción**: Asignar/cambiar roles de usuario
- **Flujo Principal**:
  1. Administrador selecciona usuario
  2. Asigna nuevo rol
  3. Sistema actualiza permisos
- **Postcondiciones**: Rol actualizado

### **6. Reportes y Analytics**

#### **6.1 Reporte de Ventas por Evento**
- **ID**: UC-017
- **Actor**: Administrador/Supervisor
- **Descripción**: Ver estadísticas de ventas
- **Flujo Principal**:
  1. Usuario selecciona evento
  2. Sistema calcula estadísticas
  3. Sistema genera reporte
- **Salida**: Estadísticas detalladas

#### **6.2 Reporte de Lugares Más Populares**
- **ID**: UC-018
- **Actor**: Administrador
- **Descripción**: Lugares con más eventos/ventas
- **Flujo Principal**:
  1. Usuario define período
  2. Sistema analiza datos
  3. Sistema genera ranking
- **Salida**: Ranking de lugares

#### **6.3 Reporte de Entradas por Usuario**
- **ID**: UC-019
- **Actor**: Usuario
- **Descripción**: Historial de compras
- **Flujo Principal**:
  1. Usuario accede a su perfil
  2. Sistema carga historial
  3. Sistema muestra entradas
- **Salida**: Lista de entradas compradas

### **7. Gestión de Contenido**

#### **7.1 Subir Imagen de Lugar**
- **ID**: UC-020
- **Actor**: Administrador/Supervisor
- **Descripción**: Actualizar imagen de un lugar
- **Flujo Principal**:
  1. Usuario selecciona lugar
  2. Sube archivo de imagen
  3. Sistema procesa imagen
  4. Sistema actualiza URL
- **Postcondiciones**: Imagen actualizada

#### **7.2 Gestionar Características**
- **ID**: UC-021
- **Actor**: Administrador
- **Descripción**: Agregar/quitar características de lugares
- **Flujo Principal**:
  1. Usuario selecciona lugar
  2. Modifica características
  3. Sistema actualiza lista
- **Postcondiciones**: Características actualizadas

### **8. Notificaciones**

#### **8.1 Notificar Evento Próximo**
- **ID**: UC-022
- **Actor**: Sistema
- **Descripción**: Recordar a usuarios sobre eventos próximos
- **Flujo Principal**:
  1. Sistema detecta eventos próximos
  2. Sistema identifica usuarios con entradas
  3. Sistema envía notificaciones
- **Postcondiciones**: Notificaciones enviadas

#### **8.2 Notificar Cancelación**
- **ID**: UC-023
- **Actor**: Sistema
- **Descripción**: Informar cancelación de evento
- **Flujo Principal**:
  1. Evento es cancelado
  2. Sistema identifica usuarios afectados
  3. Sistema envía notificaciones
- **Postcondiciones**: Notificaciones enviadas

---

## 🏗️ Arquitectura de Módulos

### **Estructura Modular Sugerida**

```
src/
├── cultural-places/
│   ├── cultural-places.module.ts
│   ├── cultural-places.controller.ts
│   ├── cultural-places.service.ts
│   ├── schemas/
│   │   └── cultural-place.schema.ts
│   └── dto/
│       ├── create-cultural-place.dto.ts
│       └── update-cultural-place.dto.ts
├── events/
│   ├── events.module.ts
│   ├── events.controller.ts
│   ├── events.service.ts
│   ├── schemas/
│   │   └── event.schema.ts
│   └── dto/
│       ├── create-event.dto.ts
│       └── update-event.dto.ts
├── tickets/
│   ├── tickets.module.ts
│   ├── tickets.controller.ts
│   ├── tickets.service.ts
│   ├── schemas/
│   │   └── ticket.schema.ts
│   └── dto/
│       ├── create-ticket.dto.ts
│       └── use-ticket.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── reports/
│   ├── reports.module.ts
│   ├── reports.controller.ts
│   └── reports.service.ts
└── notifications/
    ├── notifications.module.ts
    ├── notifications.service.ts
    └── notifications.controller.ts
```

### **Responsabilidades por Módulo**

#### **CulturalPlacesModule**
- Gestión CRUD de lugares culturales
- Búsquedas por categoría y proximidad
- Validación de datos de lugares

#### **EventsModule**
- Gestión CRUD de eventos
- Validación de fechas y horarios
- Control de disponibilidad

#### **TicketsModule**
- Compra de entradas
- Validación y uso de entradas
- Procesamiento de reembolsos

#### **UsersModule**
- Gestión de usuarios y roles
- Autenticación y autorización
- Perfiles de usuario

#### **ReportsModule**
- Generación de reportes
- Analytics y estadísticas
- Exportación de datos

#### **NotificationsModule**
- Envío de notificaciones
- Gestión de templates
- Programación de notificaciones

---

## 🌐 Endpoints Sugeridos

### **Cultural Places**
```
POST   /cultural-places              # Crear lugar
GET    /cultural-places              # Listar lugares
GET    /cultural-places/:id          # Obtener lugar
PUT    /cultural-places/:id          # Modificar lugar
DELETE /cultural-places/:id          # Desactivar lugar
GET    /cultural-places/category/:category  # Filtrar por categoría
GET    /cultural-places/nearby       # Buscar por proximidad
GET    /cultural-places/open         # Lugares abiertos
```

### **Events**
```
POST   /events                       # Crear evento
GET    /events                       # Listar eventos
GET    /events/:id                   # Obtener evento
PUT    /events/:id                   # Modificar evento
DELETE /events/:id                   # Cancelar evento
GET    /events/place/:placeId        # Eventos de un lugar
GET    /events/upcoming              # Eventos próximos
GET    /events/available             # Eventos con disponibilidad
```

### **Tickets**
```
POST   /tickets                      # Comprar entradas
GET    /tickets/user/:userId         # Entradas de usuario
PUT    /tickets/:id/use              # Usar entrada
PUT    /tickets/:id/refund           # Reembolsar entrada
GET    /tickets/event/:eventId       # Entradas de un evento
GET    /tickets/validate/:id         # Validar entrada
```

### **Users**
```
POST   /users                        # Registrar usuario
POST   /users/login                  # Autenticación
GET    /users/profile                # Perfil de usuario
PUT    /users/profile                # Actualizar perfil
PUT    /users/:id/role               # Cambiar rol
```

### **Reports**
```
GET    /reports/sales/:eventId       # Reporte de ventas
GET    /reports/popular-places       # Lugares populares
GET    /reports/user-tickets/:userId # Entradas de usuario
GET    /reports/events/:placeId      # Eventos por lugar
```

---

## 🔄 Flujos de Trabajo

### **Flujo de Compra de Entradas**
```
1. Usuario busca evento
2. Selecciona tipos y cantidades
3. Sistema verifica disponibilidad
4. Usuario confirma compra
5. Sistema crea entradas individuales
6. Sistema actualiza contadores
7. Sistema envía confirmación
```

### **Flujo de Validación de Entrada**
```
1. Usuario presenta entrada
2. Sistema valida entrada
3. Sistema verifica estado
4. Sistema marca como usada
5. Sistema registra uso
6. Sistema confirma validación
```

### **Flujo de Creación de Evento**
```
1. Usuario selecciona lugar
2. Completa datos del evento
3. Sistema valida datos
4. Sistema crea evento
5. Sistema configura tipos de entrada
6. Sistema notifica creación
```

---

## ⚙️ Consideraciones Técnicas

### **Validaciones**
- **Entrada de Datos**: Validación con class-validator
- **Negocio**: Lógica de validación en servicios
- **Base de Datos**: Constraints de Mongoose

### **Seguridad**
- **Autenticación**: JWT tokens
- **Autorización**: Guards con roles
- **Validación**: Sanitización de entrada

### **Performance**
- **Caché**: Redis para consultas frecuentes
- **Índices**: Optimización de consultas MongoDB
- **Paginación**: Límites en listados

### **Escalabilidad**
- **Módulos**: Separación de responsabilidades
- **Servicios**: Lógica de negocio reutilizable
- **DTOs**: Transferencia de datos tipada

---

## 📝 Conclusión

Este análisis de casos de uso proporciona:

1. **Claridad**: Casos de uso bien definidos y documentados
2. **Completitud**: Cobertura de todas las funcionalidades principales
3. **Escalabilidad**: Estructura modular y extensible
4. **Mantenibilidad**: Separación clara de responsabilidades
5. **Usabilidad**: Enfoque en la experiencia del usuario

Los casos de uso identificados permiten una implementación estructurada y escalable del sistema de gestión de lugares culturales.

---

*Documento generado el: ${new Date().toLocaleDateString('es-ES')}*
*Versión: 1.0*
