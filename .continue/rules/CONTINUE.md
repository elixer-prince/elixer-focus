
# Project Guide

## 1. Project Overview

This project is a web application built with a React frontend and a Laravel (PHP) backend.

**Key Technologies:**

*   **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS, DaisyUI
*   **Backend:** Laravel (PHP), Vite

**Architecture:**

The application follows a typical frontend-backend architecture. The React frontend handles the user interface and interacts with the Laravel backend via API calls.

## 2. Getting Started

### Prerequisites

*   Node.js (version >= 18)
*   PHP (version >= 8.1)
*   Composer
*   MySQL or another compatible database

### Installation

**Frontend:**

1.  Navigate to the `react-frontend` directory: `cd react-frontend`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`

**Backend:**

1.  Navigate to the `laravel-api` directory: `cd laravel-api`
2.  Install dependencies: `composer install`
3.  Create a copy of the `.env.example` file and rename it to `.env`: `cp .env.example .env`
4.  Generate an application key: `php artisan key:generate`
5.  Configure your database connection in the `.env` file.
6.  Run database migrations: `php artisan migrate`
7.  Start the development server: `php artisan serve`

### Basic Usage

*   The frontend will typically be accessible at `http://localhost:5173/`.
*   The backend API will typically be accessible at `http://localhost:8000/api/`.

### Running Tests

*Frontend:*
1. Navigate to the `react-frontend` directory: `cd react-frontend`
2. Run linting: `npm run lint`

*Backend:*
1. Navigate to the `laravel-api` directory: `cd laravel-api`
2. Run tests: `php artisan test`

## 3. Project Structure

### Frontend (`react-frontend`)

*   `src/`: Contains the React application source code.
*   `index.html`: The main HTML file.
*   `package.json`: Lists dependencies and scripts.
*   `vite.config.ts`: Vite configuration file.

### Backend (`laravel-api`)

*   `app/`: Contains the application's core logic (models, controllers, etc.).
*   `routes/`: Defines the API routes.
*   `config/`: Contains configuration files.
*   `database/`: Contains database migrations and seeds.
*   `public/`: Contains publicly accessible assets.
*   `resources/`: Contains views and assets.
*   `package.json`: Lists dependencies and scripts.
*   `vite.config.js`: Vite configuration file.
*   `composer.json`: Lists PHP dependencies.

## 4. Development Workflow

*   **Coding Standards:**  *To be determined. Needs verification.*
*   **Testing:**  *To be determined. Needs verification.*
*   **Build and Deployment:**  *To be determined. Needs verification.*
*   **Contribution Guidelines:**  *To be determined. Needs verification.*

## 5. Key Concepts

*   *To be determined. Needs verification.*

## 6. Common Tasks

*   *To be determined. Needs verification.*

## 7. Troubleshooting

*   *To be determined. Needs verification.*

## 8. References

*   [React Documentation](https://react.dev/)
*   [Laravel Documentation](https://laravel.com/docs/10.x)
*   [Vite Documentation](https://vitejs.dev/)
*   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
*   [DaisyUI Documentation](https://daisyui.com/)
