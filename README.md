# Cultural Places API

[![Node.js CI](https://github.com/diaznicolasandres1/desarrollo-apps-2-backend-1/actions/workflows/node.js.yml/badge.svg)](https://github.com/diaznicolasandres1/desarrollo-apps-2-backend-1/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/diaznicolasandres1/desarrollo-apps-2-backend-1/graph/badge.svg?token=8KBQJ1R5UZ)](https://codecov.io/gh/diaznicolasandres1/desarrollo-apps-2-backend-1)

API para gestionar lugares culturales de Buenos Aires (museos, centros culturales, teatros, cines, etc.)

## 🚀 Live Demo

- **API:** [https://cultural-places-api.onrender.com](https://cultural-places-api.onrender.com)
- **Documentación:** [https://cultural-places-api.onrender.com/docs](https://cultural-places-api.onrender.com/docs)

## 🛠 Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB with Mongoose
- **Language:** TypeScript
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest
- **Validation:** Class-validator
- **Architecture:** Clean Architecture with Repository Pattern

## 📋 Features

### ✅ Implemented
- **CRUD Operations** for Cultural Places
- **Events Management** system with ticket types
- **Ticket Management** system (purchase, validation, history)
- **Advanced Filtering** (by category, rating, location)
- **Geospatial Queries** (nearby places)
- **Schedule Management** (open/closed days)
- **API Documentation** with Swagger
- **Unit Tests** with high coverage
- **Clean Architecture** implementation

### 🆕 Recent Updates (v1.1)
- **📝 Cultural Place Descriptions**: Added detailed descriptions to all cultural places
- **🎭 Enhanced Event Responses**: Events now include complete cultural place information
- **🚀 Improved Frontend Experience**: Reduced API calls with populated data
- **📚 Updated Documentation**: Complete API examples and guides

### 🚧 In Progress
- **User Authentication** and authorization

## 🏗 Architecture

```
src/
├── cultural-places/          # Cultural Places module
│   ├── dto/                 # Data Transfer Objects
│   ├── interfaces/          # Repository interfaces
│   ├── repositories/        # Data access layer
│   ├── schemas/            # MongoDB schemas
│   ├── __tests__/          # Unit tests
│   ├── cultural-places.controller.ts
│   ├── cultural-places.service.ts
│   └── cultural-places.module.ts
├── events/                  # Events module
│   ├── dto/                 # Data Transfer Objects
│   ├── interfaces/          # Repository interfaces
│   ├── repositories/        # Data access layer
│   ├── schemas/            # MongoDB schemas
│   ├── __tests__/          # Unit tests
│   ├── events.controller.ts
│   ├── events.service.ts
│   └── events.module.ts
├── tickets/                 # Tickets module
│   ├── dto/                 # Data Transfer Objects
│   ├── interfaces/          # Repository interfaces
│   ├── repositories/        # Data access layer
│   ├── schemas/            # MongoDB schemas
│   ├── __tests__/          # Unit tests
│   ├── tickets.controller.ts
│   ├── tickets.service.ts
│   └── tickets.module.ts
├── users/                   # Users module
├── config/                  # Configuration files
└── main.ts                  # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd desarrollo-apps-2-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your MongoDB URI
MONGODB_URI=mongodb://localhost:27017/cultural-places
PORT=3000
NODE_ENV=development
```

4. **Run the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

5. **Access the API**
- **API:** http://localhost:3000/api/v1
- **Documentation:** http://localhost:3000/docs

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Endpoints

### Cultural Places

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/cultural-places` | Get all places with filtering |
| `POST` | `/api/v1/cultural-places` | Create new place |
| `GET` | `/api/v1/cultural-places/:id` | Get place by ID |
| `PATCH` | `/api/v1/cultural-places/:id` | Update place |
| `DELETE` | `/api/v1/cultural-places/:id` | Delete place |
| `GET` | `/api/v1/cultural-places/category/:category` | Filter by category |
| `GET` | `/api/v1/cultural-places/open/:day` | Get open places by day |
| `GET` | `/api/v1/cultural-places/top-rated` | Get top rated places |
| `GET` | `/api/v1/cultural-places/nearby` | Get nearby places |
| `PATCH` | `/api/v1/cultural-places/:id/toggle-active` | Toggle active status |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/events` | Create new event |
| `GET` | `/api/v1/events` | Get all events with filtering |
| `GET` | `/api/v1/events/active` | Get active events only |
| `GET` | `/api/v1/events/:id` | Get event by ID |
| `PATCH` | `/api/v1/events/:id` | Update event |
| `DELETE` | `/api/v1/events/:id` | Delete event |
| `GET` | `/api/v1/events/cultural-place/:culturalPlaceId` | Get events by place |
| `GET` | `/api/v1/events/date-range/:startDate/:endDate` | Get events by date range |
| `PATCH` | `/api/v1/events/:id/toggle-active` | Toggle event status |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/tickets/purchase` | Purchase tickets for an event |
| `GET` | `/api/v1/tickets` | Get all tickets with filtering |
| `GET` | `/api/v1/tickets/active` | Get active tickets only |
| `GET` | `/api/v1/tickets/:id` | Get ticket by ID |
| `GET` | `/api/v1/tickets/event/:eventId` | Get tickets by event |
| `GET` | `/api/v1/tickets/user/:userId` | Get tickets by user |
| `GET` | `/api/v1/tickets/event/:eventId/user/:userId` | Get tickets by event and user |
| `GET` | `/api/v1/tickets/status/:status` | Get tickets by status |
| `GET` | `/api/v1/tickets/event/:eventId/stats` | Get ticket statistics for event |
| `PATCH` | `/api/v1/tickets/:id` | Update ticket |
| `PATCH` | `/api/v1/tickets/:id/use` | Mark ticket as used |
| `PATCH` | `/api/v1/tickets/:id/cancel` | Cancel ticket |
| `DELETE` | `/api/v1/tickets/:id` | Delete ticket |

### Query Parameters

- `category`: Filter by category (Museo, Cine, Centro Cultural, etc.)
- `isActive`: Filter by active status (true/false)
- `minRating`: Minimum rating filter (0-5)
- `maxRating`: Maximum rating filter (0-5)
- `lat`, `lng`, `radius`: For nearby places search

## 🗄 Database Schema

### Cultural Place
```typescript
{
  _id: ObjectId;            // MongoDB ObjectId
  name: string;              // Place name
  category: string;          // Museo, Cine, Centro Cultural, Teatro, etc.
  characteristics: string[]; // Features list
  schedules: {              // Weekly schedules
    monday: { open: string, close: string, closed: boolean };
    tuesday: { open: string, close: string, closed: boolean };
    wednesday: { open: string, close: string, closed: boolean };
    thursday: { open: string, close: string, closed: boolean };
    friday: { open: string, close: string, closed: boolean };
    saturday: { open: string, close: string, closed: boolean };
    sunday: { open: string, close: string, closed: boolean };
  };
  contact: {                // Contact information
    address: string;
    coordinates: { lat: number, lng: number };
    phone: string;
    website: string;
    email: string;
  };
  image: string;            // Image URL
  rating: number;           // Rating (0-5)
  isActive: boolean;        // Active status
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

### Event
```typescript
{
  _id: ObjectId;            // MongoDB ObjectId
  culturalPlaceId: {         // Populated Cultural Place object
    _id: ObjectId;           // Cultural Place ID
    name: string;            // Cultural Place name
    description: string;     // Cultural Place description
    category: string;        // Cultural Place category
    characteristics: string[]; // Cultural Place features
    contact: {               // Cultural Place contact info
      address: string;
      coordinates: { lat: number, lng: number };
      phone: string;
      website: string;
      email: string;
    };
    image: string;           // Cultural Place image
    rating: number;          // Cultural Place rating
  };
  name: string;              // Event name
  description: string;       // Event description
  date: Date;               // Event date
  time: string;              // Event time (HH:MM format)
  ticketTypes: [             // Available ticket types
    {
      type: string;          // 'general', 'vip', 'jubilados', 'niños'
      price: number;         // Ticket price
      initialQuantity: number; // Initial available quantity
      soldQuantity: number;   // Sold quantity
      isActive: boolean;      // Ticket type active status
    }
  ];
  isActive: boolean;         // Event active status
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;          // Last update timestamp
  availableQuantity: number; // Virtual field: calculated available tickets
}
```

### Ticket
```typescript
{
  _id: ObjectId;            // MongoDB ObjectId
  eventId: ObjectId;         // Reference to Event
  userId: ObjectId;          // Reference to User
  ticketType: string;        // 'general', 'vip', 'jubilados', 'niños'
  price: number;             // Ticket price
  status: string;            // 'active', 'used', 'cancelled'
  usedAt?: Date;             // When ticket was used
  cancelledAt?: Date;        // When ticket was cancelled
  cancellationReason?: string; // Reason for cancellation
  isActive: boolean;         // Active status
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

## 🚀 Deployment

### Render (Recommended)

1. **Connect your GitHub repository** to Render
2. **Create a new Web Service**
3. **Configure environment variables:**
   - `NODE_ENV`: production
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: 10000 (Render default)
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm run start:prod`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | localhost |

## 📊 Project Status

- **✅ Phase 1:** CRUD Operations (Complete)
- **✅ Phase 2:** Advanced Features (Complete)
- **✅ Phase 3:** Events Management (Complete)
- **✅ Phase 4:** Ticket Management (Complete)
- **⏳ Phase 5:** User Management (Pending)

## 📝 License

This project is licensed under the MIT License.

## 🆕 Recent Updates (v1.1)

### 🎯 What's New

**Enhanced Event Responses**: Events now include complete cultural place information, eliminating the need for additional API calls from the frontend.

**Before:**
```json
{
  "culturalPlaceId": "68b8d2e112a45cdbc2ec9856"
}
```

**After:**
```json
{
  "culturalPlaceId": {
    "_id": "68b8d2e112a45cdbc2ec9856",
    "name": "Centro Cultural Raices",
    "description": "Un centro cultural que ofrece servicios de biblioteca...",
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
  }
}
```

### 📚 Documentation

- **API Examples**: [docs/api-curl-examples.md](docs/api-curl-examples.md)
- **Frontend Guide**: [docs/frontend-quick-reference.md](docs/frontend-quick-reference.md)
- **Recent Updates**: [docs/recent-updates.md](docs/recent-updates.md)
- **Database Design**: [docs/database-design.md](docs/database-design.md)

## 📞 Support

- **Email:** your-email@example.com
- **Issues:** [GitHub Issues](https://github.com/your-username/repo-name/issues)
- **Documentation:** [API Docs](https://cultural-places-api.onrender.com/docs)
3