# API Documentation

## Base URL

```
https://api.yourdomain.com/api
```

## Authentication

All API requests require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are JSON with the following structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "error": null
}
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "organization": "Wildlife Org"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "citizen_scientist"
  }
}
```

### Login

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "citizen_scientist"
  }
}
```

---

## Device Endpoints

### List Devices

**GET** `/devices`

List all devices owned by user (or all if admin).

**Query Parameters:**
- `status` (string): Filter by status (active, inactive, maintenance, error)
- `habitat_type` (string): Filter by habitat type
- `limit` (number, default: 50): Max results
- `offset` (number, default: 0): Pagination offset

**Response:**
```json
{
  "success": true,
  "total": 5,
  "data": [
    {
      "id": "uuid",
      "deviceId": "STATION_001",
      "name": "North Forest Birdhouse",
      "status": "active",
      "habitat_type": "birdhouse",
      "battery_percentage": 85,
      "last_telemetry_at": "2026-08-24T10:30:00Z"
    }
  ]
}
```

### Create Device

**POST** `/devices`

Register a new monitoring station.

**Request Body:**
```json
{
  "deviceId": "STATION_001",
  "name": "North Forest Birdhouse",
  "description": "Monitoring cavity for songbirds",
  "habitat_type": "birdhouse",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Get Device Details

**GET** `/devices/:id`

Get detailed information about a device.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "deviceId": "STATION_001",
    "name": "North Forest Birdhouse",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "battery_voltage": 52.3,
    "solar_voltage": 18.5,
    "telemetry": [...],
    "events": [...]
  }
}
```

### Update Device

**PUT** `/devices/:id`

Update device configuration.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active"
}
```

### Delete Device

**DELETE** `/devices/:id`

Remove a device from the system.

---

## Telemetry Endpoints

### Submit Telemetry

**POST** `/telemetry`

Device sends environmental sensor data.

**Request Body:**
```json
{
  "device_id": "STATION_001",
  "temperature": 22.5,
  "humidity": 65.3,
  "pressure": 1013.25,
  "voc": 250.5,
  "pm25": 12.3,
  "pm10": 25.6,
  "uv_index": 4.2,
  "battery_voltage": 52.3,
  "solar_voltage": 18.5,
  "motion_detected": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telemetry recorded",
  "data": {
    "id": "telemetry_id",
    "deviceId": "device_uuid",
    "temperature": 22.5,
    "createdAt": "2026-08-24T10:30:00Z"
  }
}
```

### Query Telemetry

**GET** `/telemetry`

Retrieve historical telemetry data.

**Query Parameters:**
- `deviceId` (string): Filter by device
- `startDate` (ISO8601): Start timestamp
- `endDate` (ISO8601): End timestamp
- `limit` (number, default: 100, max: 1000)
- `offset` (number, default: 0)

**Response:**
```json
{
  "success": true,
  "total": 150,
  "data": [
    {
      "id": "uuid",
      "deviceId": "device_uuid",
      "temperature": 22.5,
      "humidity": 65.3,
      "createdAt": "2026-08-24T10:30:00Z"
    }
  ]
}
```

### Get Telemetry Statistics

**GET** `/telemetry/stats/summary`

Get aggregated statistics.

**Query Parameters:**
- `deviceId` (string): Filter by device
- `days` (number, default: 7): Number of days to aggregate

**Response:**
```json
{
  "success": true,
  "period_days": 7,
  "data": {
    "avg_temp": 21.5,
    "min_temp": 18.2,
    "max_temp": 26.8,
    "avg_humidity": 62.1,
    "avg_pm25": 15.3
  }
}
```

---

## Event Endpoints

### Log Event

**POST** `/events`

Device or system logs a wildlife event.

**Request Body:**
```json
{
  "device_id": "STATION_001",
  "event_type": "motion_detected",
  "confidence": 0.95,
  "metadata": {
    "motion_duration_ms": 2500,
    "pixel_difference": 12.3
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event logged",
  "data": {
    "id": "event_uuid",
    "event_type": "motion_detected",
    "createdAt": "2026-08-24T10:30:00Z"
  }
}
```

### Query Events

**GET** `/events`

Retrieve event history.

**Query Parameters:**
- `deviceId` (string): Filter by device
- `eventType` (string): Filter by event type
- `startDate` (ISO8601): Start timestamp
- `endDate` (ISO8601): End timestamp
- `limit` (number, default: 100)
- `offset` (number, default: 0)

**Response:**
```json
{
  "success": true,
  "total": 42,
  "data": [
    {
      "id": "uuid",
      "event_type": "motion_detected",
      "confidence": 0.95,
      "device": {
        "name": "North Forest",
        "habitat_type": "birdhouse"
      },
      "createdAt": "2026-08-24T10:30:00Z"
    }
  ]
}
```

### Get Event Timeline

**GET** `/events/timeline/:deviceId`

Get chronological event timeline for device.

**Query Parameters:**
- `days` (number, default: 7): Number of days to retrieve

**Response:**
```json
{
  "success": true,
  "device": "North Forest Birdhouse",
  "period_days": 7,
  "total_events": 42,
  "data": [...]
}
```

---

## Camera Endpoints

### Upload Camera Image

**POST** `/camera/snapshot`

Upload camera image from device.

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file): JPEG image
- `device_id` (string): Device identifier
- `motion_triggered` (boolean): Whether motion triggered capture
- `is_night_vision` (boolean): Whether using night vision

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded",
  "data": {
    "id": "uuid",
    "filename": "station_001_20260824_103000.jpg",
    "size": 65432,
    "timestamp": "2026-08-24T10:30:00Z"
  }
}
```

### List Device Images

**GET** `/camera/images/:deviceId`

Retrieve camera images for device.

**Query Parameters:**
- `limit` (number, default: 50)
- `offset` (number, default: 0)
- `motion_only` (boolean): Only motion-triggered images

**Response:**
```json
{
  "success": true,
  "total": 156,
  "data": [
    {
      "id": "uuid",
      "filename": "image.jpg",
      "file_size": 65432,
      "motion_triggered": true,
      "createdAt": "2026-08-24T10:30:00Z"
    }
  ]
}
```

---

## User Endpoints

### Get Profile

**GET** `/users/profile`

Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "citizen_scientist",
    "devices": [...]
  }
}
```

### Update Profile

**PUT** `/users/profile`

Update user profile information.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "organization": "Wildlife Org"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error description"
}
```

---

## Rate Limiting

API enforces rate limits:
- **Standard**: 100 requests per 15 minutes per IP
- **Device**: Unlimited from device IPs

Rate limit info in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1629886200
```

