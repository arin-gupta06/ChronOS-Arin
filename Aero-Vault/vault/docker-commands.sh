#!/bin/bash
# Docker Essential Commands

# ── Build & Run ──────────────────────────────────────
# Build image from Dockerfile
docker build -t myapp:latest .

# Run container (detached, port mapped)
docker run -d -p 8080:8080 --name myapp myapp:latest

# Run with environment variables
docker run -d -p 8080:8080 \
  -e DATABASE_URL=postgres://... \
  -e SECRET_KEY=mysecret \
  myapp:latest

# ── Container Management ─────────────────────────────
docker ps                        # List running containers
docker ps -a                     # List all containers
docker stop myapp                # Stop container
docker rm myapp                  # Remove container
docker logs -f myapp             # Follow logs
docker exec -it myapp /bin/bash  # Shell into container

# ── Image Management ─────────────────────────────────
docker images                    # List images
docker rmi myapp:latest          # Remove image
docker pull python:3.11-slim     # Pull from Docker Hub

# ── Docker Compose ───────────────────────────────────
docker compose up -d             # Start services
docker compose down              # Stop services
docker compose logs -f           # Follow all logs
docker compose ps                # Status of services

# ── Cleanup ──────────────────────────────────────────
docker system prune -af          # Remove all unused resources
docker volume prune              # Remove unused volumes
