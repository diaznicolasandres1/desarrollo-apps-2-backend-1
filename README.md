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
- **Advanced Filtering** (by category, rating, location)
- **Geospatial Queries** (nearby places)
- **Schedule Management** (open/closed days)
- **API Documentation** with Swagger
- **Unit Tests** with high coverage
- **Clean Architecture** implementation

### 🚧 In Progress
- **Events Management** system
- **User Authentication** and authorization
- **Ticket System** for events

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

### Test Coverage

```bash
npm run test:cov
```

**Current Coverage:**
- **Statements:** 38.73%
- **Branches:** 40.29%
- **Functions:** 37%
- **Lines:** 40.54%

**Coverage by Module:**
- **Cultural Places:** 79.43% (statements)
- **Events:** 59.22% (statements)
- **Services:** High coverage (81-92%)
- **Controllers:** High coverage (100%)

> Note: Coverage is lower because we focus on testing business logic (services) rather than infrastructure code (schemas, repositories).

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

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
  name: string;              // Place name
  category: string;          // Museo, Cine, Centro Cultural, etc.
  characteristics: string[]; // Features list
  schedules: {              // Weekly schedules
    monday: { open: string, close: string, closed: boolean };
    // ... other days
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
- **🔄 Phase 3:** Events Management (In Progress)
- **⏳ Phase 4:** User Management (Pending)
- **⏳ Phase 5:** Ticket System (Pending)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

- **Email:** your-email@example.com
- **Issues:** [GitHub Issues](https://github.com/your-username/repo-name/issues)
- **Documentation:** [API Docs](https://cultural-places-api.onrender.com/docs)
