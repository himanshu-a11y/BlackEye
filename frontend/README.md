# BlackEye Frontend

The BlackEye frontend is a React and TypeScript security-intelligence dashboard. It provides a focused interface for public IP analysis, network and ASN intelligence, domain auditing, phone metadata, username enumeration, and local scan history.

The frontend is intended for educational use and authorized security research only.

## Features

- Dashboard with telemetry, scan history, and intelligence modules
- IP geolocation with 2D map and 3D globe views
- Network intelligence and ASN topology analysis
- Domain, DNS, SSL, and security-header auditing
- Phone number metadata and carrier analysis
- Username checks across public platforms
- Searchable history with table and grid views
- Command palette with `Ctrl+K` or `Cmd+K`
- Responsive dark interface with animated transitions

## Technology

- React 19
- TypeScript
- Vite
- React Router
- Framer Motion
- Tailwind CSS via `@tailwindcss/vite`
- Leaflet and React Leaflet for maps
- Globe.gl and Three.js for the 3D globe
- Axios for backend requests
- Lucide React for interface icons

## Requirements

- Node.js 18 or newer
- npm
- The BlackEye FastAPI backend running on `http://localhost:8000`

## Installation

From the `frontend` directory:

```powershell
npm install
```

The repository includes a lockfile. Use `npm install` to restore the exact dependency tree when possible.

## Development

Start the Vite development server:

```powershell
npm run dev
```

The frontend is available at:

```text
http://localhost:5173
```

From the repository root, the PowerShell helper can also be used:

```powershell
.\start-frontend.ps1
```

The Vite development proxy forwards `/api` requests to the backend at `http://localhost:8000`.

## Production checks

Build the frontend:

```powershell
npm run build
```

Preview the production build locally:

```powershell
npm run preview
```

Run the configured linter:

```powershell
npm run lint
```

The build runs TypeScript project checks before creating the Vite bundle.

## Backend

The frontend expects the FastAPI backend to expose the `/api` routes. From the repository root, start it with:

```powershell
.\start-backend.ps1
```

Or run it directly from the `backend` directory:

```powershell
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Install backend dependencies before the first run:

```powershell
cd backend
python -m pip install -r requirements.txt
```

The backend uses SQLite for local history storage and reads private configuration from `backend/.env`.

## Project structure

```text
frontend/
  public/                 Static assets
  src/
    components/           Shared layout, HUD, transition, and command UI
    pages/                Dashboard and intelligence pages
    services/              Axios API client
    types/                Shared TypeScript types
    App.tsx               Router and application shell
    index.css             Global theme and shared styles
  package.json            Frontend scripts and dependencies
  vite.config.ts          Vite and API proxy configuration
```

## Environment and GitHub safety

Do not commit private environment files, API tokens, local databases, build output, or dependency folders. These are excluded by the repository `.gitignore` files.

Use an example environment file for shareable configuration defaults. Never place real provider tokens in source code or documentation.

## Responsible use

BlackEye works with public network and intelligence data. Use it only against systems and identities that you own or are explicitly authorized to analyze. The project is not intended for covert tracking, credential collection, unauthorized access, or abuse.
