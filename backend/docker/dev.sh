#!/bin/bash
set -e
set -x

# Set the working directory to /backend
cd "$(dirname "$0")/.."

# Build & run the Docker image
docker build -t remote-file-navigator-backend-dev -f docker/Dockerfile.dev . && \
docker run -it --rm --name remote-file-navigator-backend-dev \
           -p 8080:8080 \
           -v $(pwd):/app \
           remote-file-navigator-backend-dev
