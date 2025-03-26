# File System Navigation

A web application with a Go backend and React+TypeScript frontend.

## Project Structure

- `backend/` - Go backend with REST API
- `frontend/` - React+TypeScript frontend

## Prerequisites

- Go 1.21 or later
- Node.js 18 or later
- npm (comes with Node.js)

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Run the server:
   ```bash
   go run main.go
   ```

The backend will be available at `http://localhost:8080`

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Development

- Backend API endpoints are prefixed with `/api`
- Frontend development server has hot module replacement enabled
- CORS is configured to allow frontend-backend communication

## Features

- Health check endpoint to verify backend connectivity
- Modern React+TypeScript frontend with Vite
- CORS-enabled backend for secure cross-origin requests 