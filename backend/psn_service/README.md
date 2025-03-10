# PSN Service

Service for interacting with the PSN API.

## Details

A FastAPI-based REST API wrapper for the PlayStation Network, providing access to user profiles, presence information, trophy data, and more.

## Features

- **User Profile Information**: Get basic profile data like online ID, about me, avatars, languages
- **Presence Data**: Check online status, platforms, and availability
- **Friendship Information**: View friends count, mutual friends, friend relations
- **Trophy Information**: Access trophy levels, progress, titles, and earned trophies
- **Game History**: Retrieve played games and game statistics
- **Batch Processing**: Get information for multiple PSN users in a single request
- **Field Filtering**: Request only the specific data fields you need

## API Endpoints

### User Information

- `GET /api/users/{online_id}` - Get complete user profile
- `GET /api/users/{online_id}/basic` - Get basic user information
- `GET /api/users/{online_id}/presence` - Get user presence information
- `GET /api/users/{online_id}/friends` - Get friendship information
- `GET /api/users/{online_id}/trophies` - Get trophy information
- `GET /api/users/{online_id}/trophy-titles` - Get trophy titles
- `GET /api/users/{online_id}/games` - Get played games
- `GET /api/users/{online_id}/raw-profile` - Get raw profile information

### Batch Operations

- `POST /api/users/batch` - Get information for multiple users in a single request

### Search

- `GET /api/users?query={search_term}` - Search for PSN users

## Data Filtering

Most endpoints support field filtering with the `fields` query parameter:

```bash
GET /api/users/username?fields=online_id,trophy_level,online_status
```

Available fields include:

- Basic info: `online_id`, `account_id`, `about_me`, `avatars`, `languages`, `is_plus`, `is_officially_verified`
- Presence: `online_status`, `platform`, `last_online`, `availability`
- Friendship: `friends_count`, `mutual_friends_count`, `friend_relation`, `is_blocking`
- Trophies: `trophy_level`, `trophy_progress`, `trophy_tier`, `earned_trophies`

## Error Handling

The API implements proper error handling with appropriate HTTP status codes:

- 404 Not Found - For invalid PSN IDs or missing resources
- 400 Bad Request - For invalid parameters

## Project Structure

```bash
psn-api/
├── src/
│   ├── __init__.py
│   ├── app.py          # Main FastAPI application
│   ├── routes.py       # API routes and endpoint implementation
│   ├── _psnawp.py      # PSN API wrapper implementation
│   └── test_legacy.py  # Legacy tests
├── .env                # Environment variables (NPSSO token)
├── requirements.txt    # Project dependencies
└── pyproject.toml      # Project configuration
```

## Acknowledgements

This project uses the [PSNAWP](https://github.com/isFakeAccount/psnawp) library for PlayStation Network API access.
