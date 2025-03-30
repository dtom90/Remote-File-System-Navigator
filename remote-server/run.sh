#!/bin/bash
set -e
set -x

# Set the working directory to /backend
cd "$(dirname "$0")"

# Build & run the Docker image
docker build -t remote-server -f Dockerfile . && \
docker run -it --rm --name remote-server \
           -p 22:22 \
           -v $(pwd):/app \
           remote-server
