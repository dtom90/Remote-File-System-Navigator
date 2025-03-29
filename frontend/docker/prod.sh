#!/bin/bash
set -e
set -x

# Set the working directory to /frontend
cd "$(dirname "$0")/.."

# Build & run the Docker image
docker build -t remote-file-navigator-frontend-prod:latest -f docker/Dockerfile.prod . && \
docker run -it --rm --name remote-file-navigator-frontend-prod \
           -p 5173:80 \
           remote-file-navigator-frontend-prod:latest
