# Docker Snippets

Comprehensive Docker snippets for containerization, Dockerfile, and docker-compose.

---

## Dockerfile Basic
- difficulty: easy
- description: Simple Dockerfile for a Node.js application

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## Dockerfile with Build Args
- difficulty: easy
- description: Dockerfile using build arguments for configuration

```dockerfile
FROM node:20-alpine

ARG NODE_ENV=production
ARG APP_VERSION=1.0.0

ENV NODE_ENV=${NODE_ENV}
ENV APP_VERSION=${APP_VERSION}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Dockerfile Multi-Stage Build
- difficulty: medium
- description: Multi-stage build for smaller production images

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3000

USER node

CMD ["node", "dist/server.js"]
```

---

## Dockerfile Go Multi-Stage
- difficulty: medium
- description: Multi-stage build for Go application with minimal image

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/main .

# Production stage
FROM scratch

COPY --from=builder /app/main /main
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 8080

ENTRYPOINT ["/main"]
```

---

## Dockerfile Python
- difficulty: easy
- description: Dockerfile for Python application with pip

```dockerfile
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

---

## Dockerfile Python Poetry
- difficulty: medium
- description: Python Dockerfile using Poetry for dependency management

```dockerfile
FROM python:3.12-slim AS builder

ENV POETRY_VERSION=1.7.1
ENV POETRY_HOME=/opt/poetry
ENV POETRY_VENV=/opt/poetry-venv
ENV POETRY_CACHE_DIR=/opt/.cache

RUN python3 -m venv $POETRY_VENV \
    && $POETRY_VENV/bin/pip install -U pip setuptools \
    && $POETRY_VENV/bin/pip install poetry==${POETRY_VERSION}

ENV PATH="${PATH}:${POETRY_VENV}/bin"

WORKDIR /app

COPY poetry.lock pyproject.toml ./

RUN poetry install --no-interaction --no-ansi --no-root --only main

# Production stage
FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY . .

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Dockerfile Java Maven
- difficulty: medium
- description: Multi-stage Dockerfile for Java Spring Boot with Maven

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn package -DskipTests

# Production stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Dockerfile Java Gradle
- difficulty: medium
- description: Multi-stage Dockerfile for Java with Gradle

```dockerfile
# Build stage
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

RUN gradle dependencies --no-daemon

COPY src ./src

RUN gradle bootJar --no-daemon

# Production stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/build/libs/*.jar app.jar

USER app

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
```

---

## Dockerfile Rust
- difficulty: medium
- description: Multi-stage Dockerfile for Rust application

```dockerfile
# Build stage
FROM rust:1.75-alpine AS builder

RUN apk add --no-cache musl-dev

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY src ./src

RUN touch src/main.rs
RUN cargo build --release

# Production stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/target/release/myapp /usr/local/bin/

RUN adduser -D appuser
USER appuser

EXPOSE 8080

CMD ["myapp"]
```

---

## Dockerfile Next.js
- difficulty: medium
- description: Optimized Dockerfile for Next.js standalone build

```dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## Dockerfile Nginx Static
- difficulty: easy
- description: Nginx Dockerfile for serving static files

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Dockerfile with Health Check
- difficulty: easy
- description: Dockerfile with built-in health check

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

---

## Dockerfile Health Check Curl
- difficulty: easy
- description: Health check using curl for HTTP endpoint

```dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Dockerfile Non-Root User
- difficulty: medium
- description: Dockerfile with non-root user for security

```dockerfile
FROM node:20-alpine

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

COPY --chown=appuser:appgroup package*.json ./

RUN npm ci --only=production

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## Dockerfile Labels
- difficulty: easy
- description: Dockerfile with OCI standard labels for metadata

```dockerfile
FROM node:20-alpine

LABEL org.opencontainers.image.title="My Application"
LABEL org.opencontainers.image.description="A sample Node.js application"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="dev@example.com"
LABEL org.opencontainers.image.source="https://github.com/example/myapp"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY . .

RUN npm ci --only=production

CMD ["node", "server.js"]
```

---

## Dockerfile Cache Optimization
- difficulty: medium
- description: Dockerfile optimized for layer caching

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached if unchanged)
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy configuration files (rarely change)
COPY tsconfig.json ./
COPY next.config.js ./

# Copy source code last (changes frequently)
COPY src ./src
COPY public ./public

RUN npm run build

CMD ["npm", "start"]
```

---

## Dockerfile .dockerignore
- difficulty: easy
- description: Example .dockerignore file to exclude unnecessary files

```dockerfile
# .dockerignore

# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
build
.next
out

# Development files
.git
.gitignore
*.md
LICENSE

# IDE and editor
.vscode
.idea
*.swp
*.swo

# Environment and secrets
.env
.env.*
*.pem

# Test files
__tests__
*.test.js
*.spec.js
coverage

# Docker files
Dockerfile*
docker-compose*
.dockerignore

# Logs
*.log
logs
```

---

## Dockerfile ENTRYPOINT vs CMD
- difficulty: medium
- description: Understanding ENTRYPOINT and CMD combination

```dockerfile
FROM alpine:3.19

# ENTRYPOINT defines the executable
ENTRYPOINT ["ping"]

# CMD provides default arguments
CMD ["localhost"]

# Running without args: ping localhost
# Running with args: docker run image google.com -> ping google.com
```

---

## Dockerfile Shell vs Exec Form
- difficulty: medium
- description: Difference between shell and exec form in RUN, CMD, ENTRYPOINT

```dockerfile
FROM alpine:3.19

# Exec form (preferred) - runs directly
RUN ["apk", "add", "--no-cache", "curl"]
CMD ["echo", "Hello World"]

# Shell form - runs through /bin/sh -c
RUN apk add --no-cache wget
CMD echo "Hello $NAME"

# Exec form with shell for variable expansion
CMD ["/bin/sh", "-c", "echo Hello $NAME"]
```

---

## Dockerfile COPY vs ADD
- difficulty: easy
- description: When to use COPY vs ADD

```dockerfile
FROM alpine:3.19

# COPY - simple file/directory copy (preferred)
COPY ./app /app
COPY config.json /etc/app/

# ADD - additional features (use sparingly)
# 1. Can extract tar archives
ADD archive.tar.gz /app/

# 2. Can download from URLs (not recommended)
ADD https://example.com/file.txt /app/

# Best practice: use COPY unless you need ADD features
COPY requirements.txt /app/
```

---

## Docker Compose Basic
- difficulty: easy
- description: Basic docker-compose.yml for a web application

```yaml
version: "3.9"

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp

volumes:
  postgres_data:
```

---

## Docker Compose with Build Context
- difficulty: easy
- description: Docker Compose with custom build configuration

```yaml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
      args:
        NODE_ENV: production
        APP_VERSION: 1.0.0
      target: production
      cache_from:
        - myapp:latest
    image: myapp:${TAG:-latest}
    ports:
      - "3000:3000"
```

---

## Docker Compose Environment Variables
- difficulty: easy
- description: Different ways to set environment variables

```yaml
version: "3.9"

services:
  app:
    image: myapp:latest

    # Inline environment variables
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - DATABASE_URL=postgres://user:pass@db:5432/myapp

    # From .env file
    env_file:
      - .env
      - .env.production

    # From host environment
    environment:
      - API_KEY
      - SECRET_KEY=${SECRET_KEY:-default_value}
```

---

## Docker Compose Volumes
- difficulty: medium
- description: Different volume types in Docker Compose

```yaml
version: "3.9"

services:
  app:
    image: myapp:latest
    volumes:
      # Named volume
      - app_data:/app/data

      # Bind mount (host path)
      - ./config:/app/config:ro

      # Anonymous volume
      - /app/node_modules

      # tmpfs mount
      - type: tmpfs
        target: /app/tmp
        tmpfs:
          size: 100000000

  db:
    image: postgres:15
    volumes:
      - type: volume
        source: db_data
        target: /var/lib/postgresql/data
        volume:
          nocopy: true

volumes:
  app_data:
  db_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/postgres
```

---

## Docker Compose Networks
- difficulty: medium
- description: Custom network configuration in Docker Compose

```yaml
version: "3.9"

services:
  frontend:
    image: nginx:alpine
    networks:
      - frontend
    ports:
      - "80:80"

  api:
    image: myapi:latest
    networks:
      - frontend
      - backend
    expose:
      - "8080"

  db:
    image: postgres:15
    networks:
      - backend
    volumes:
      - db_data:/var/lib/postgresql/data

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

volumes:
  db_data:
```

---

## Docker Compose Health Checks
- difficulty: medium
- description: Health check configuration in Docker Compose

```yaml
version: "3.9"

services:
  web:
    image: myapp:latest
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

## Docker Compose Depends On
- difficulty: medium
- description: Service dependencies with conditions

```yaml
version: "3.9"

services:
  web:
    image: myapp:latest
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
      migrations:
        condition: service_completed_successfully

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine

  migrations:
    image: myapp:latest
    command: npm run migrate
    depends_on:
      db:
        condition: service_healthy
```

---

## Docker Compose Resource Limits
- difficulty: medium
- description: CPU and memory limits in Docker Compose

```yaml
version: "3.9"

services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

---

## Docker Compose Logging
- difficulty: easy
- description: Configure logging driver and options

```yaml
version: "3.9"

services:
  app:
    image: myapp:latest
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
        labels: "app,environment"
        env: "NODE_ENV"

  syslog-app:
    image: myapp:latest
    logging:
      driver: syslog
      options:
        syslog-address: "tcp://192.168.0.42:514"
        syslog-facility: "daemon"
        tag: "myapp"
```

---

## Docker Compose Profiles
- difficulty: medium
- description: Use profiles for optional services

```yaml
version: "3.9"

services:
  app:
    image: myapp:latest
    ports:
      - "3000:3000"

  db:
    image: postgres:15
    profiles:
      - dev
      - test
    volumes:
      - db_data:/var/lib/postgresql/data

  adminer:
    image: adminer
    profiles:
      - dev
    ports:
      - "8080:8080"

  test-runner:
    image: myapp:latest
    profiles:
      - test
    command: npm test

volumes:
  db_data:

# docker compose --profile dev up
# docker compose --profile test up
```

---

## Docker Compose Secrets
- difficulty: medium
- description: Managing secrets in Docker Compose

```yaml
version: "3.9"

services:
  app:
    image: myapp:latest
    secrets:
      - db_password
      - api_key
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      API_KEY_FILE: /run/secrets/api_key

  db:
    image: postgres:15
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true
```

---

## Docker Compose Override
- difficulty: medium
- description: Using docker-compose.override.yml for development

```yaml
# docker-compose.yml (base)
version: "3.9"

services:
  app:
    image: myapp:latest
    ports:
      - "3000:3000"

# docker-compose.override.yml (automatically loaded)
version: "3.9"

services:
  app:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

---

## Docker Compose Multiple Files
- difficulty: medium
- description: Compose configuration with multiple files

```yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    image: myapp:latest

# docker-compose.prod.yml
version: "3.9"

services:
  app:
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M

# Usage: docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

## Docker Compose Extensions
- difficulty: medium
- description: Using YAML anchors and extensions for reuse

```yaml
version: "3.9"

x-common-env: &common-env
  LOG_LEVEL: info
  TZ: UTC

x-healthcheck: &default-healthcheck
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s

services:
  api:
    image: myapi:latest
    environment:
      <<: *common-env
      SERVICE_NAME: api
    healthcheck:
      <<: *default-healthcheck
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]

  worker:
    image: myworker:latest
    environment:
      <<: *common-env
      SERVICE_NAME: worker
    healthcheck:
      <<: *default-healthcheck
      test: ["CMD", "pgrep", "-x", "worker"]
```

---

## Docker Compose Full Stack
- difficulty: hard
- description: Complete full-stack application with all services

```yaml
version: "3.9"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - api
    networks:
      - frontend

  frontend:
    build:
      context: ./frontend
      target: production
    expose:
      - "3000"
    environment:
      - API_URL=http://api:8080
    networks:
      - frontend

  api:
    build:
      context: ./backend
      target: production
    expose:
      - "8080"
    environment:
      - DATABASE_URL=postgres://app:${DB_PASSWORD}@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend

  worker:
    build:
      context: ./backend
      target: production
    command: npm run worker
    environment:
      - DATABASE_URL=postgres://app:${DB_PASSWORD}@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - backend
    deploy:
      replicas: 2

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true

volumes:
  postgres_data:
  redis_data:
```

---

## docker build
- difficulty: easy
- description: Build Docker images from Dockerfile

```bash
# Basic build
docker build -t myapp:latest .

# Build with tag
docker build -t myapp:v1.0.0 -t myapp:latest .

# Build with build args
docker build --build-arg NODE_ENV=production -t myapp:prod .

# Build from different Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with no cache
docker build --no-cache -t myapp:latest .

# Build specific target
docker build --target production -t myapp:prod .

# Build with platform
docker build --platform linux/amd64 -t myapp:amd64 .

# Build and push
docker build -t registry.example.com/myapp:latest --push .
```

---

## docker run
- difficulty: easy
- description: Run containers from images

```bash
# Basic run
docker run myapp:latest

# Run with port mapping
docker run -p 3000:3000 myapp:latest

# Run detached
docker run -d --name myapp myapp:latest

# Run with environment variables
docker run -e NODE_ENV=production -e API_KEY=secret myapp:latest

# Run with volume
docker run -v $(pwd)/data:/app/data myapp:latest

# Run with network
docker run --network mynetwork myapp:latest

# Run interactive with TTY
docker run -it alpine:latest /bin/sh

# Run with auto-remove
docker run --rm myapp:latest

# Run with resource limits
docker run --memory=512m --cpus=0.5 myapp:latest

# Run with restart policy
docker run -d --restart=unless-stopped myapp:latest
```

---

## docker exec
- difficulty: easy
- description: Execute commands in running containers

```bash
# Execute command
docker exec myapp ls -la

# Interactive shell
docker exec -it myapp /bin/bash

# Execute as specific user
docker exec -u root myapp whoami

# Execute with environment variable
docker exec -e DEBUG=true myapp npm run debug

# Execute in working directory
docker exec -w /app/src myapp cat config.js
```

---

## docker logs
- difficulty: easy
- description: View container logs

```bash
# View logs
docker logs myapp

# Follow logs
docker logs -f myapp

# Show timestamps
docker logs -t myapp

# Last N lines
docker logs --tail 100 myapp

# Since timestamp
docker logs --since 2024-01-01T00:00:00 myapp

# Since duration
docker logs --since 1h myapp

# Until timestamp
docker logs --until 2024-01-01T12:00:00 myapp
```

---

## docker ps
- difficulty: easy
- description: List containers

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# List with size
docker ps -s

# Custom format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Filter by status
docker ps -f status=exited

# Filter by name
docker ps -f name=myapp

# Only show IDs
docker ps -q
```

---

## docker images
- difficulty: easy
- description: List and manage images

```bash
# List images
docker images

# List with digests
docker images --digests

# List dangling images
docker images -f dangling=true

# Filter by reference
docker images myapp

# Custom format
docker images --format "{{.Repository}}:{{.Tag}} {{.Size}}"

# Remove image
docker rmi myapp:latest

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

---

## docker volume
- difficulty: easy
- description: Manage Docker volumes

```bash
# Create volume
docker volume create mydata

# List volumes
docker volume ls

# Inspect volume
docker volume inspect mydata

# Remove volume
docker volume rm mydata

# Remove unused volumes
docker volume prune

# Use volume in container
docker run -v mydata:/app/data myapp:latest

# Backup volume
docker run --rm -v mydata:/data -v $(pwd):/backup alpine \
    tar czf /backup/mydata.tar.gz -C /data .

# Restore volume
docker run --rm -v mydata:/data -v $(pwd):/backup alpine \
    tar xzf /backup/mydata.tar.gz -C /data
```

---

## docker network
- difficulty: medium
- description: Manage Docker networks

```bash
# Create network
docker network create mynetwork

# Create bridge network
docker network create --driver bridge mybridge

# Create with subnet
docker network create --subnet 172.20.0.0/16 mynetwork

# List networks
docker network ls

# Inspect network
docker network inspect mynetwork

# Connect container to network
docker network connect mynetwork myapp

# Disconnect container
docker network disconnect mynetwork myapp

# Remove network
docker network rm mynetwork

# Remove unused networks
docker network prune
```

---

## docker system
- difficulty: easy
- description: System-wide Docker commands

```bash
# Show disk usage
docker system df

# Detailed disk usage
docker system df -v

# Remove unused data
docker system prune

# Remove all unused data including volumes
docker system prune -a --volumes

# Show system info
docker system info

# Show events
docker system events

# Show events since
docker system events --since 1h
```

---

## docker stats
- difficulty: easy
- description: Display container resource usage statistics

```bash
# Live stats for all containers
docker stats

# Stats for specific containers
docker stats myapp db redis

# One-time stats (no stream)
docker stats --no-stream

# Custom format
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## docker inspect
- difficulty: medium
- description: Inspect Docker objects in detail

```bash
# Inspect container
docker inspect myapp

# Get specific field
docker inspect --format '{{.State.Status}}' myapp

# Get IP address
docker inspect --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' myapp

# Get environment variables
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' myapp

# Get mounts
docker inspect --format '{{json .Mounts}}' myapp | jq

# Inspect image
docker inspect myapp:latest
```

---

## docker tag and push
- difficulty: easy
- description: Tag and push images to registry

```bash
# Tag image
docker tag myapp:latest myapp:v1.0.0

# Tag for registry
docker tag myapp:latest registry.example.com/myapp:latest

# Login to registry
docker login registry.example.com

# Push to registry
docker push registry.example.com/myapp:latest

# Push all tags
docker push registry.example.com/myapp --all-tags

# Logout
docker logout registry.example.com
```

---

## docker pull
- difficulty: easy
- description: Pull images from registry

```bash
# Pull latest
docker pull nginx

# Pull specific tag
docker pull nginx:1.25-alpine

# Pull by digest
docker pull nginx@sha256:abc123...

# Pull from private registry
docker pull registry.example.com/myapp:latest

# Pull all tags
docker pull -a nginx
```

---

## docker save and load
- difficulty: easy
- description: Save and load images as tar files

```bash
# Save image to tar
docker save -o myapp.tar myapp:latest

# Save multiple images
docker save -o images.tar myapp:latest nginx:alpine

# Save with compression
docker save myapp:latest | gzip > myapp.tar.gz

# Load image from tar
docker load -i myapp.tar

# Load from compressed
gunzip -c myapp.tar.gz | docker load
```

---

## docker cp
- difficulty: easy
- description: Copy files between container and host

```bash
# Copy from container to host
docker cp myapp:/app/config.json ./config.json

# Copy from host to container
docker cp ./config.json myapp:/app/config.json

# Copy directory
docker cp myapp:/app/logs ./logs

# Copy to running container
docker cp ./newfile.txt myapp:/app/
```

---

## docker compose commands
- difficulty: easy
- description: Common docker compose commands

```bash
# Start services
docker compose up

# Start detached
docker compose up -d

# Start specific services
docker compose up web db

# Build and start
docker compose up --build

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs

# Follow logs
docker compose logs -f web

# List containers
docker compose ps

# Execute command
docker compose exec web sh

# Run one-off command
docker compose run --rm web npm test

# Scale service
docker compose up -d --scale worker=3

# Pull images
docker compose pull

# Build images
docker compose build

# Restart services
docker compose restart

# View config
docker compose config
```

---

## docker buildx
- difficulty: medium
- description: Build multi-platform images with buildx

```bash
# Create builder
docker buildx create --name mybuilder --use

# List builders
docker buildx ls

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest .

# Build and push
docker buildx build --platform linux/amd64,linux/arm64 \
    -t registry.example.com/myapp:latest --push .

# Build and load locally
docker buildx build --load -t myapp:latest .

# Inspect builder
docker buildx inspect mybuilder

# Remove builder
docker buildx rm mybuilder
```

---

## docker scan
- difficulty: medium
- description: Scan images for vulnerabilities

```bash
# Scan image
docker scout cves myapp:latest

# Scan with severity filter
docker scout cves --only-severity critical,high myapp:latest

# Quick view
docker scout quickview myapp:latest

# Compare images
docker scout compare myapp:v1 myapp:v2

# SBOM (Software Bill of Materials)
docker scout sbom myapp:latest
```

---

## Cleanup Commands
- difficulty: easy
- description: Clean up Docker resources

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove all unused resources
docker system prune

# Remove everything including volumes
docker system prune -a --volumes

# Force remove without confirmation
docker system prune -af

# Remove all containers
docker rm -f $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -q)
```

---

## Docker Security Best Practices
- difficulty: hard
- description: Security-focused Dockerfile example

```dockerfile
# Use specific version, not latest
FROM node:20.10.0-alpine3.19

# Add labels for tracking
LABEL maintainer="security@example.com"
LABEL org.opencontainers.image.source="https://github.com/example/app"

# Create non-root user early
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set secure defaults
ENV NODE_ENV=production

WORKDIR /app

# Copy only necessary files
COPY --chown=appuser:appgroup package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=appuser:appgroup . .

# Remove unnecessary files
RUN rm -rf tests docs .git .github

# Use non-root user
USER appuser

# Don't expose more than needed
EXPOSE 3000

# Use exec form
CMD ["node", "server.js"]
```

---

## Docker Debug Container
- difficulty: medium
- description: Create debug container for troubleshooting

```dockerfile
FROM alpine:3.19

RUN apk add --no-cache \
    curl \
    wget \
    bind-tools \
    iputils \
    net-tools \
    tcpdump \
    strace \
    htop \
    vim \
    jq \
    openssl \
    netcat-openbsd \
    busybox-extras

CMD ["sleep", "infinity"]
```

---

## Docker Entrypoint Script
- difficulty: medium
- description: Flexible entrypoint script with initialization

```bash
#!/bin/sh
set -e

# Wait for dependencies
if [ -n "$WAIT_FOR_HOST" ]; then
    echo "Waiting for $WAIT_FOR_HOST..."
    while ! nc -z ${WAIT_FOR_HOST%:*} ${WAIT_FOR_HOST#*:}; do
        sleep 1
    done
    echo "$WAIT_FOR_HOST is available"
fi

# Run migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    npm run migrate
fi

# Create required directories
mkdir -p /app/logs /app/tmp

# Execute the main command
exec "$@"
```

---

## Dockerfile Entrypoint Usage
- difficulty: medium
- description: Using entrypoint script in Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm ci --only=production

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
```
