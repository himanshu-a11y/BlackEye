# BlackEye

BlackEye is a full-stack cybersecurity intelligence and OSINT dashboard for structured analysis of public network and identity-related data. It combines a React and TypeScript frontend with a modular Python FastAPI backend to bring common reconnaissance, open-source intelligence, and network-analysis workflows into one workspace.

The project is designed for academic learning, portfolio demonstration, and authorized security research. It presents provider-backed results with context and consistency information so users can understand both what the data shows and where its limitations are.

## Features

- Dashboard with telemetry, recent scans, and intelligence modules.
- IP geolocation with interactive 2D map and 3D globe views.
- ASN, ISP, routing, infrastructure, proxy, VPN, hosting, and connection analysis.
- Domain, DNS, SSL/TLS, and HTTP security-header auditing.
- Phone number parsing, carrier, country, validity, and timezone metadata.
- OSINT-focused public username checks across supported platforms.
- Searchable scan history with table, grid, filter, delete, and export actions.
- Provider aggregation and consistency scoring.
- Responsive cyber-security interface with loading, error, and empty states.
- Animated transitions, command palette, map controls, and interactive visualizations.

## Technology Stack

### Frontend

- React 19 and TypeScript.
- Vite development and production tooling.
- React Router for page navigation.
- Framer Motion for transitions and interface animation.
- Tailwind CSS through `@tailwindcss/vite`.
- Leaflet and React Leaflet for 2D maps.
- Globe.gl and Three.js for the 3D globe.
- Axios for API communication.
- Lucide React for interface icons.

### Backend

- FastAPI for the HTTP API.
- SQLAlchemy and aiosqlite for asynchronous SQLite persistence.
- HTTPX for external provider requests.
- Modular route, service, provider, and model layers.
- Python-dotenv for local configuration.
- Rate-limit and cache configuration for provider requests.

## Project Structure

```text
BlackEye/
	backend/
		app/
			routes/              API route handlers
			services/            Domain, phone, username, and provider logic
			providers/           IP intelligence integrations
			models/              Database models
			config.py            Environment configuration
			database.py          SQLite connection and initialization
			main.py              FastAPI application entry point
		.env.example           Safe configuration template
		requirements.txt       Python dependencies
	frontend/
		public/                Static assets
		src/
			components/          Layout, HUD, animation, and shared UI
			pages/                Dashboard and intelligence pages
			services/             Frontend API client
			types/                Shared TypeScript types
			App.tsx               Application router and shell
			index.css             Global theme and shared styles
		package.json            Frontend scripts and dependencies
		vite.config.ts         Vite and API proxy configuration
	README.md                Main project documentation
	.gitignore               Local and generated file exclusions
```

## Requirements

- Python 3.10 or newer.
- Node.js 18 or newer.
- npm.
- A modern browser with JavaScript enabled.

## Installation

### Backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
```

## Run the Application

Start the backend from `backend/`:

```powershell
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API runs at `http://localhost:8000`.

Start the frontend from `frontend/`:

```powershell
npm run dev
```

The dashboard runs at `http://localhost:5173`.

The Vite development proxy forwards frontend `/api` requests to the backend on port `8000`.

## Useful Commands

Run frontend commands from `frontend/`:

```powershell
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run preview   # Preview the production build
npm run lint      # Run Oxlint
```

## Configuration

The backend reads local configuration from `backend/.env`. Start from `backend/.env.example`:

```text
APP_ENV=development
DATABASE_URL=sqlite+aiosqlite:///./blackeye.db
IPINFO_TOKEN=
RATE_LIMIT_PER_MINUTE=60
CACHE_TTL_SECONDS=3600
```

The SQLite database is created locally at runtime and is not part of the source repository.

## Data and Limitations

IP geolocation is an estimate based on network registration and provider databases. It is not GPS and cannot reliably identify a person, building, or exact physical position. VPNs, proxies, mobile networks, CGNAT, cloud hosting, stale records, and provider differences can reduce accuracy.

Phone and username results depend on the availability, accuracy, and terms of the connected public-data services. A missing result does not prove that an identity, account, or service does not exist.

## GitHub Safety

Do not commit or publish:

- `backend/.env` or any file containing secrets.
- API keys, tokens, passwords, or private credentials.
- SQLite database files such as `*.db`, `*.sqlite`, or `*.sqlite3`.
- `node_modules/`, build output, Python virtual environments, caches, or logs.
- Personal editor files or local planning notes.

The repository `.gitignore` files cover these local-only files. Keep `package.json`, lockfiles, source code, configuration templates, and documentation tracked because they are required to install and understand the project.

## Responsible Use

BlackEye should only be used to analyze systems, networks, phone numbers, and public identities that you own or are explicitly authorized to investigate. It must not be used for unauthorized access, covert tracking, credential harvesting, harassment, evasion of security controls, or abuse.
