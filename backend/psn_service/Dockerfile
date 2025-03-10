# Use Python 3.12 as base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# First copy everything needed for installing the package
COPY requirements.txt .
COPY pyproject.toml .
COPY src/ /app/src/

# Install dependencies and the package itself
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -e .

# Copy environment variables (after installation to avoid rebuild on .env changes)
COPY .env .

# Set Python path
ENV PYTHONPATH=/app

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]