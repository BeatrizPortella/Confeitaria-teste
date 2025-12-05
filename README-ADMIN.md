# Confeitaria Admin Module

This repository contains the backend and frontend for the Confeitaria Admin Module.

## Project Structure

- `backend/`: Node.js + Fastify + Prisma backend.
- `admin-frontend/`: React + Vite + Tailwind frontend.
- `docker-compose.yml`: Orchestration for local development and production.

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development without Docker)

## Getting Started (Docker)

1.  **Clone the repository.**
2.  **Create `.env` files:**
    -   `backend/.env`:
        ```env
        DATABASE_URL=postgres://admin:password@db:5432/confeitaria
        JWT_SECRET=supersecret
        NODE_ENV=development
        ```
3.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
4.  **Access the application:**
    -   Frontend: `http://localhost:8080`
    -   Backend API: `http://localhost:3000`

## Getting Started (Local)

### Backend

1.  `cd backend`
2.  `npm install`
3.  Set up a local PostgreSQL database.
4.  Update `.env` with your DB credentials.
5.  `npx prisma migrate dev`
6.  `npm run dev`

### Frontend

1.  `cd admin-frontend`
2.  `npm install`
3.  `npm run dev`

## API Documentation

-   **POST /api/admin/login**: `{ email, password }` -> `{ accessToken }`
-   **GET /api/options**: Public route for active options.
-   **GET /api/admin/dashboard**: Dashboard metrics.
-   **GET /api/admin/orders**: List orders.
-   **POST /api/orders**: Create a new order.

## Integration with Public Site

To integrate the public form with the backend, use the following snippet in your site's JavaScript:

```javascript
async function fetchOptions() {
  try {
    const response = await fetch('http://localhost:3000/api/options');
    const options = await response.json();
    
    // Example: Populate a select element
    const fillingSelect = document.getElementById('filling-select');
    options.filter(opt => opt.type === 'RECHEIO').forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.textContent = `${opt.name} (+ R$ ${opt.price})`;
      fillingSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching options:', error);
  }
}

fetchOptions();
```
