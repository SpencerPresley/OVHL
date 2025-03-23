# OVHL Backend

This directory contains the backend services and utilities for the OVHL (Online Virtual Hockey League) application.

## Directory Structure

### /services

Contains individual microservices that power different aspects of the application:

- **stats_service**: Handles player and team statistics processing and analytics
- **database_service**: Manages database operations and data persistence
- **security_service**: Handles authentication, authorization, and security features
- **psn_service**: Manages PlayStation Network related operations and integrations
- **xbox_service**: Handles Xbox Live related operations and integrations
- **bidding_service**: Manages player bidding and trading system

### /misc

Contains miscellaneous utility scripts and tools that are:

- Not part of any specific service
- Used for maintenance, deployment, or development purposes
- One-off scripts for data processing or system tasks

## Getting Started

Each service has its own README with specific setup instructions and requirements. See individual service directories for more details.

## Development

Services are designed to run independently using Poetry for dependency management. Each service contains its own:

- `pyproject.toml` for dependencies
- Configuration files
- Documentation
