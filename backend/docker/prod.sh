#!/bin/bash
set -e
set -x

# Set the working directory to /backend
cd "$(dirname "$0")/.."

# Build & run the Docker image
docker build -t remote-file-navigator-backend-prod -f docker/Dockerfile.prod . && \
docker run -it --rm --name remote-file-navigator-backend-prod \
           -p 8080:8080 \
           remote-file-navigator-backend-prod
