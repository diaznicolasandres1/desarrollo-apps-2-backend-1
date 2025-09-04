# API Endpoints Documentation

This document lists all available GET endpoints for the Cultural Places API.

## Cultural Places

### Get All Places
- **Endpoint:** `GET /api/v1/cultural-places`
- **Description:** Retrieve all cultural places with optional filtering
- **Query Parameters:**
  - `category`: Filter by category (Museo, Cine, Centro Cultural, Teatro, etc.)
  - `isActive`: Filter by active status (true/false)
  - `minRating`: Minimum rating filter (0-5)
  - `maxRating`: Maximum rating filter (0-5)
  - `limit`: Number of results to return
  - `skip`: Number of results to skip

### Get Place by ID
- **Endpoint:** `GET /api/v1/cultural-places/:id`
- **Description:** Retrieve a specific cultural place by its ID
- **Parameters:**
  - `id`: Cultural place ID

### Get Places by Category
- **Endpoint:** `GET /api/v1/cultural-places/category/:category`
- **Description:** Retrieve all places of a specific category
- **Parameters:**
  - `category`: Category name (Museo, Cine, Centro Cultural, Teatro, etc.)

### Get Open Places by Day
- **Endpoint:** `GET /api/v1/cultural-places/open/:day`
- **Description:** Retrieve places that are open on a specific day
- **Parameters:**
  - `day`: Day of the week (monday, tuesday, wednesday, thursday, friday, saturday, sunday)

### Get Top Rated Places
- **Endpoint:** `GET /api/v1/cultural-places/top-rated`
- **Description:** Retrieve places ordered by rating (highest first)
- **Query Parameters:**
  - `limit`: Number of results to return (default: 10)

### Get Nearby Places
- **Endpoint:** `GET /api/v1/cultural-places/nearby`
- **Description:** Retrieve places within a specified radius of given coordinates
- **Query Parameters:**
  - `lat`: Latitude coordinate
  - `lng`: Longitude coordinate
  - `radius`: Search radius in kilometers (default: 5)

## Events

### Get All Events
- **Endpoint:** `GET /api/v1/events`
- **Description:** Retrieve all events with optional filtering
- **Query Parameters:**
  - `culturalPlaceId`: Filter by cultural place ID
  - `isActive`: Filter by active status (true/false)
  - `date`: Filter by specific date (YYYY-MM-DD format)
  - `limit`: Number of results to return
  - `skip`: Number of results to skip

### Get Active Events
- **Endpoint:** `GET /api/v1/events/active`
- **Description:** Retrieve only active events
- **Query Parameters:**
  - `limit`: Number of results to return
  - `skip`: Number of results to skip

### Get Event by ID
- **Endpoint:** `GET /api/v1/events/:id`
- **Description:** Retrieve a specific event by its ID
- **Parameters:**
  - `id`: Event ID

### Get Events by Cultural Place
- **Endpoint:** `GET /api/v1/events/cultural-place/:culturalPlaceId`
- **Description:** Retrieve all events for a specific cultural place
- **Parameters:**
  - `culturalPlaceId`: Cultural place ID
- **Query Parameters:**
  - `isActive`: Filter by active status (true/false)

### Get Events by Date Range
- **Endpoint:** `GET /api/v1/events/date-range/:startDate/:endDate`
- **Description:** Retrieve events within a date range
- **Parameters:**
  - `startDate`: Start date (YYYY-MM-DD format)
  - `endDate`: End date (YYYY-MM-DD format)

## Tickets

### Get All Tickets
- **Endpoint:** `GET /api/v1/tickets`
- **Description:** Retrieve all tickets with optional filtering
- **Query Parameters:**
  - `eventId`: Filter by event ID
  - `userId`: Filter by user ID
  - `status`: Filter by ticket status (active, used, cancelled)
  - `ticketType`: Filter by ticket type (general, vip, jubilados, niños)
  - `isActive`: Filter by active status (true/false)
  - `limit`: Number of results to return
  - `skip`: Number of results to skip

### Get Active Tickets
- **Endpoint:** `GET /api/v1/tickets/active`
- **Description:** Retrieve only active tickets
- **Query Parameters:**
  - `limit`: Number of results to return
  - `skip`: Number of results to skip

### Get Ticket by ID
- **Endpoint:** `GET /api/v1/tickets/:id`
- **Description:** Retrieve a specific ticket by its ID
- **Parameters:**
  - `id`: Ticket ID

### Get Tickets by Event
- **Endpoint:** `GET /api/v1/tickets/event/:eventId`
- **Description:** Retrieve all tickets for a specific event
- **Parameters:**
  - `eventId`: Event ID
- **Query Parameters:**
  - `status`: Filter by ticket status (active, used, cancelled)
  - `ticketType`: Filter by ticket type (general, vip, jubilados, niños)

### Get Tickets by User
- **Endpoint:** `GET /api/v1/tickets/user/:userId`
- **Description:** Retrieve all tickets for a specific user
- **Parameters:**
  - `userId`: User ID
- **Query Parameters:**
  - `status`: Filter by ticket status (active, used, cancelled)
  - `ticketType`: Filter by ticket type (general, vip, jubilados, niños)

### Get Tickets by Event and User
- **Endpoint:** `GET /api/v1/tickets/event/:eventId/user/:userId`
- **Description:** Retrieve tickets for a specific event and user combination
- **Parameters:**
  - `eventId`: Event ID
  - `userId`: User ID

### Get Tickets by Status
- **Endpoint:** `GET /api/v1/tickets/status/:status`
- **Description:** Retrieve tickets by their status
- **Parameters:**
  - `status`: Ticket status (active, used, cancelled)

### Get Ticket Statistics for Event
- **Endpoint:** `GET /api/v1/tickets/event/:eventId/stats`
- **Description:** Retrieve ticket statistics for a specific event
- **Parameters:**
  - `eventId`: Event ID
- **Response:** Returns statistics including total tickets, counts by status, and counts by ticket type

## Users

### Get All Users
- **Endpoint:** `GET /api/v1/users`
- **Description:** Retrieve all users
- **Query Parameters:**
  - `limit`: Number of results to return
  - `skip`: Number of results to skip

### Get User by ID
- **Endpoint:** `GET /api/v1/users/:id`
- **Description:** Retrieve a specific user by their ID
- **Parameters:**
  - `id`: User ID

## Response Format

All endpoints return JSON responses with the following structure:

```json
{
  "data": [...], // Array of items or single item
  "message": "Success message",
  "timestamp": "2025-01-09T22:45:25.123Z"
}
```

## Error Responses

Error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2025-01-09T22:45:25.123Z"
}
```

## Authentication

Currently, all endpoints are publicly accessible. Authentication will be implemented in future versions.

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## Pagination

For endpoints that return lists, pagination is supported through `limit` and `skip` query parameters:

- `limit`: Maximum number of items to return (default: 10, max: 100)
- `skip`: Number of items to skip (default: 0)

Example: `GET /api/v1/cultural-places?limit=20&skip=40` returns items 41-60.
