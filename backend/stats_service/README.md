# OVHL Stats Service API

A FastAPI service for retrieving NHL club statistics.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the API

Run the API server with:

```bash
python main.py
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

### 1. Get Club ID

```bash
GET /club/id?search_name={club_name}&platform={platform}
```

Parameters:

- `search_name` (required): The name of the club to search for
- `platform` (optional, default: "common-gen5"): The gaming platform identifier

Returns:

```json
{
  "club_id": 12345
}
```

### 2. Get Club Data

```bash
GET /club/data?search_name={club_name}&platform={platform}
```

Parameters:

- `search_name` (required): The name of the club to search for
- `platform` (optional, default: "common-gen5"): The gaming platform identifier

Returns:

```json
{
  "club_data": {
    // Complete club data
  }
}
```

### 3. Get Complete Club Info

```bash
GET /club/full?search_name={club_name}&platform={platform}
```

Parameters:

- `search_name` (required): The name of the club to search for
- `platform` (optional, default: "common-gen5"): The gaming platform identifier

Returns:

```json
{
  "club_id": 12345,
  "club_data": {
    // Complete club data
  }
}
```

## Valid Platforms

- ps5
- ps4
- xbox-series-xs
- xboxone
- common-gen5 (default)
