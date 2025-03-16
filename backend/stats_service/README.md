# OVHL Stats Service API

A FastAPI service for retrieving NHL club statistics from the EA NHL API.

## API Overview

The Stats Service provides endpoints for retrieving club information from the EA NHL API (and coming soon match data). The service supports:

- Looking up club IDs by name
- Retrieving full club data
- Combined lookups for both ID and data

All endpoints default to the "common-gen5" platform but support other EA NHL platforms.

## API Endpoints

### 1. Get Club ID

```bash
GET /api/club/id?search_name={club_name}&platform={platform}
```

Returns the unique identifier for a club when provided with the club name.

**Parameters:**

- `search_name` (required): The name of the club to search for
- `platform` (optional, default: "common-gen5"): The gaming platform identifier

**Response:**

```json
{
  "club_id": 12345
}
```

### 2. Get Club Data

```bash
GET /api/club/data?search_name={club_name}&platform={platform}
```

Returns the complete data for a club when provided with the club name.

**Parameters:**

- `search_name` (required): The name of the club to search for
- `platform` (optional, default: "common-gen5"): The gaming platform identifier

**Response:**

```json
{
  "club_data": {
    "12345": {
      "name": "Example Club",
      "clubInfo": { ... },
      "members": { ... },
      // Additional club data
    }
  }
}
```

### 3. Get Complete Club Info

```bash
GET /api/club/full?search_name={club_name}&platform={platform}
```

Returns both the club ID and complete club data in a single request.

**Parameters:**

- `search_name` (required): The name of the club to search for
- `platform` (optional, default: "common-gen5"): The gaming platform identifier

**Response:**

```json
{
  "club_id": 12345,
  "club_data": {
    "12345": {
      "name": "Example Club",
      "clubInfo": { ... },
      "members": { ... },
      // Additional club data
    }
  }
}
```

## Valid Platforms

The following platforms are supported by the API:

- `ps5` - PlayStation 5
- `ps4` - PlayStation 4
- `xbox-series-xs` - Xbox Series X/S
- `xboxone` - Xbox One
- `common-gen5` (default) - Generic platform

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Request successful
- `500 Internal Server Error` - Error retrieving data from EA API

Error responses include a detail message explaining the issue:

```json
{
  "detail": "Error retrieving club ID: [error message]"
}
```
