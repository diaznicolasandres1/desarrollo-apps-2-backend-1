# Cultural Places API

[![Node.js CI](https://github.com/tomasschus/desarrollo-apps-2-backend/actions/workflows/node.js.yml/badge.svg)](https://github.com/tomasschus/desarrollo-apps-2-backend/actions/workflows/node.js.yml)
[![Coverage](https://codecov.io/gh/tomasschus/desarrollo-apps-2-backend/branch/main/graph/badge.svg)](https://codecov.io/gh/tomasschus/desarrollo-apps-2-backend)

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
- **Advanced Filtering** (by category, rating, location)
- **Geospatial Queries** (nearby places)
- **Schedule Management** (open/closed days)
- **API Documentation** with Swagger
- **Unit Tests** with high coverage
- **Clean Architecture** implementation

### 🚧 In Progress
- **User Authentication** and authorization
- **Ticket Purchase** system

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
  culturalPlaceId: ObjectId; // Reference to Cultural Place
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
- **⏳ Phase 4:** User Management (Pending)
- **⏳ Phase 5:** Ticket Purchase System (Pending)

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

- **Email:** your-email@example.com
- **Issues:** [GitHub Issues](https://github.com/your-username/repo-name/issues)
- **Documentation:** [API Docs](https://cultural-places-api.onrender.com/docs)
