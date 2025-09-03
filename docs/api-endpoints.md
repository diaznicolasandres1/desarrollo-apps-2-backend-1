# Cultural Places API - GET Endpoints Documentation

## Base URL
```
http://localhost:3000
```

## Swagger Documentation
```
http://localhost:3000/api
```

## GET Endpoints

### 1. Get All Cultural Places
**Endpoint:** `GET /cultural-places`

**Description:** Retrieve all cultural places with optional filtering

**Query Parameters:**
- `category` (optional): Filter by category
- `isActive` (optional): Filter by active status
- `minRating` (optional): Minimum rating filter
- `maxRating` (optional): Maximum rating filter

**Example:**
```bash
curl -X GET http://localhost:3000/cultural-places
```

**Response:**
```json
[
  {
    "_id": "68b8d1f5da39e2daa0564aea",
    "name": "Oihoy Casa Abierta",
    "category": "Centro Cultural",
    "characteristics": ["Exposiciones", "Talleres"],
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
      "coordinates": {"lat": -34.58837750, "lng": -58.46471750},
      "phone": "45510070",
      "website": "www.oihoy.blogspot.com.ar",
      "email": "recepcion@oihoy.com.ar"
    },
    "image": "https://picsum.photos/800/600?random=123",
    "rating": 4.5,
    "isActive": true,
    "createdAt": "2025-09-03T23:40:37.404Z",
    "updatedAt": "2025-09-03T23:40:37.404Z"
  }
]
```

### 2. Get Cultural Place by ID
**Endpoint:** `GET /cultural-places/:id`

**Description:** Retrieve a specific cultural place by its ID

**Path Parameters:**
- `id`: Cultural place ID

**Example:**
```bash
curl -X GET http://localhost:3000/cultural-places/68b8d1f5da39e2daa0564aea
```

**Response:**
```json
{
  "_id": "68b8d1f5da39e2daa0564aea",
  "name": "Oihoy Casa Abierta",
  "category": "Centro Cultural",
  "characteristics": ["Exposiciones", "Talleres"],
  "schedules": { ... },
  "contact": { ... },
  "image": "https://picsum.photos/800/600?random=123",
  "rating": 4.5,
  "isActive": true,
  "createdAt": "2025-09-03T23:40:37.404Z",
  "updatedAt": "2025-09-03T23:40:37.404Z"
}
```

### 3. Get Cultural Places by Category
**Endpoint:** `GET /cultural-places/category/:category`

**Description:** Retrieve all cultural places of a specific category

**Path Parameters:**
- `category`: Category name (Museo, Cine, Centro Cultural, Teatro, Galería, Biblioteca, Auditorio)

**Example:**
```bash
curl -X GET http://localhost:3000/cultural-places/category/Centro%20Cultural
```

**Response:**
```json
[
  {
    "_id": "68b8d1f5da39e2daa0564aea",
    "name": "Oihoy Casa Abierta",
    "category": "Centro Cultural",
    ...
  }
]
```

### 4. Get Open Cultural Places by Day
**Endpoint:** `GET /cultural-places/open/:day`

**Description:** Retrieve all cultural places that are open on a specific day

**Path Parameters:**
- `day`: Day of the week (monday, tuesday, wednesday, thursday, friday, saturday, sunday)

**Example:**
```bash
curl -X GET http://localhost:3000/cultural-places/open/monday
```

**Response:**
```json
[
  {
    "_id": "68b8d1f5da39e2daa0564aea",
    "name": "Oihoy Casa Abierta",
    "category": "Centro Cultural",
    "schedules": {
      "monday": {"open": "10:00", "close": "18:00", "closed": false}
    },
    ...
  }
]
```

### 5. Get Top Rated Cultural Places
**Endpoint:** `GET /cultural-places/top-rated`

**Description:** Retrieve the highest rated cultural places

**Query Parameters:**
- `limit` (optional): Number of places to return (default: 10)

**Example:**
```bash
curl -X GET http://localhost:3000/cultural-places/top-rated?limit=5
```

**Response:**
```json
[
  {
    "_id": "68b8d1f5da39e2daa0564aea",
    "name": "Oihoy Casa Abierta",
    "category": "Centro Cultural",
    "rating": 4.8,
    ...
  }
]
```

### 6. Get Nearby Cultural Places
**Endpoint:** `GET /cultural-places/nearby`

**Description:** Retrieve cultural places within a specified radius of given coordinates

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in meters (default: 5000)

**Example:**
```bash
curl -X GET "http://localhost:3000/cultural-places/nearby?lat=-34.58837750&lng=-58.46471750&radius=3000"
```

**Response:**
```json
[
  {
    "_id": "68b8d1f5da39e2daa0564aea",
    "name": "Oihoy Casa Abierta",
    "category": "Centro Cultural",
    "contact": {
      "coordinates": {"lat": -34.58837750, "lng": -58.46471750}
    },
    ...
  }
]
```

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Cultural place not found",
  "error": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid coordinates",
  "error": "Bad Request"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Testing with curl

### Get all places:
```bash
curl -X GET http://localhost:3000/cultural-places | jq '.'
```

### Get places by category:
```bash
curl -X GET http://localhost:3000/cultural-places/category/Centro%20Cultural | jq '.'
```

### Get open places on Monday:
```bash
curl -X GET http://localhost:3000/cultural-places/open/monday | jq '.'
```

### Get top 5 rated places:
```bash
curl -X GET http://localhost:3000/cultural-places/top-rated?limit=5 | jq '.'
```

### Get nearby places:
```bash
curl -X GET "http://localhost:3000/cultural-places/nearby?lat=-34.58837750&lng=-58.46471750&radius=3000" | jq '.'
```
