# OVHL Stats Service API

A FastAPI service for retrieving NHL club statistics from the EA NHL API.

## API Overview

The Stats Service provides endpoints for retrieving club and match information from the EA NHL API. The service supports:

- Looking up club IDs by name
- Retrieving full club data
- Combined lookups for both ID and data
- Retrieving match data with advanced analytics

All endpoints default to the "common-gen5" platform but support other EA NHL platforms.

## API Endpoints

### 1. Get Club ID

```bash
GET /api/club/{search_name}/id?platform={platform}
```

Returns the unique identifier for a club when provided with the club name.

**Parameters:**

- `search_name` (required, path): The name of the club to search for
- `platform` (optional, query, default: "common-gen5"): The gaming platform identifier

**Response:**

```json
{
  "club_id": 12345
}
```

### 2. Get Club Data

```bash
GET /api/club/{search_name}/data?platform={platform}
```

Returns the complete data for a club when provided with the club name.

**Parameters:**

- `search_name` (required, path): The name of the club to search for
- `platform` (optional, query, default: "common-gen5"): The gaming platform identifier

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
GET /api/club/{search_name}/full?platform={platform}
```

Returns both the club ID and complete club data in a single request.

**Parameters:**

- `search_name` (required, path): The name of the club to search for
- `platform` (optional, query, default: "common-gen5"): The gaming platform identifier

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

### 4. Get Club Matches

```bash
GET /api/club/{club_id}/matches?match_type={match_type}&platform={platform}
```

Returns a list of recent matches for a specific club with detailed statistics and analytics.

**Parameters:**

- `club_id` (required, path): The ID of the club to fetch matches for
- `match_type` (optional, query, default: "club_private"): The type of match to fetch
- `platform` (optional, query, default: "common-gen5"): The gaming platform identifier

**Response:**

An array of match objects, each containing detailed information about the match, including clubs involved, player statistics, and advanced analytics.

## Valid Platforms

The following platforms are supported by the API:

- `ps5` - PlayStation 5
- `ps4` - PlayStation 4
- `xbox-series-xs` - Xbox Series X/S
- `xboxone` - Xbox One
- `common-gen5` (default) - Generic platform

## Analytics Explained

The match data includes detailed analytics that provide insights into team performance. Here's what some of the less obvious metrics mean:

### Possession Metrics

- **possession_differential**: Time difference in seconds of puck possession between home and away teams. Positive values favor the home team, negative values favor the away team.
- **possession_percentage_home/away**: Percentage of total game time each team had possession.
- **time_on_attack_differential**: Difference in seconds of offensive zone time between home and away teams.

### Efficiency Metrics

- **shooting_efficiency**: Percentage of shots that resulted in goals (Goals/Shots %).
- **passing_efficiency**: Percentage of pass attempts that were completed.
- **possession_efficiency**: Ratio of time on attack to total possession time, indicating how effectively teams convert possession into offensive opportunities.

### Special Teams Metrics

- **powerplay_pct**: Percentage of power play opportunities that resulted in goals.
- **penalty_kill_pct**: Percentage of opponent power plays successfully defended without a goal.

### Momentum Metrics

- **home_score/away_score**: Composite score based on various performance metrics that indicates which team has momentum.
- **shot_differential**: Difference in total shots (positive favors home team).
- **hit_differential**: Difference in total hits (positive favors home team).
- **takeaway_differential**: Difference in takeaways minus giveaways.
- **scoring_chances_differential**: Difference in scoring chances created.

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
