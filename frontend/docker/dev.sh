#!/bin/bash
set -e
set -x

# Set the working directory to /frontend
cd "$(dirname "$0")/.."

# Build & run the Docker image
docker build -t remote-file-navigator-frontend-dev:latest -f docker/Dockerfile.dev . && \
docker run -it --rm --name remote-file-navigator-frontend-dev \
           -p 5173:5173 \
           -v $(pwd):/app -v /app/node_modules \
           remote-file-navigator-frontend-dev:latest
