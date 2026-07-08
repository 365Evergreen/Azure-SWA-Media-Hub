# Azure-SWA-Media-Hub

A **React/Vite** frontend for an **Azure Static Web App (SWA)** where authenticated users can stream audio and video stored in **Azure Blob Storage** containers.

---

## Features

- 🔐 **Authentication** – Azure SWA built-in auth (Microsoft Entra ID, GitHub, Google) via `/.auth/login/{provider}`
- 🎬 **Video streaming** – plays MP4, WebM, OGG, AVI, MOV and more directly in the browser
- 🎵 **Audio streaming** – plays MP3, M4A, OGG, WAV, FLAC and more
- 📚 **Media library** – lists all audio/video blobs from Azure Blob Storage with search
- 🔗 **SAS URLs** – short-lived Shared Access Signature tokens generated server-side so storage keys never reach the browser
- ⚡ **Vite build** – fast HMR in dev, optimised production bundle
- 🧪 **Tests** – Vitest + Testing Library covering auth, routing, media library and player

---

## Project structure

```
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # App shell (header, nav, footer)
│   │   ├── MediaLibrary.jsx    # Lists blobs; links to player
│   │   ├── MediaPlayer.jsx     # <video> / <audio> player fed by SAS URL
│   │   └── ProtectedRoute.jsx  # Redirects to /login if not authenticated
│   ├── hooks/
│   │   └── useAuth.jsx         # AuthProvider + useAuth hook (wraps /.auth/me)
│   ├── pages/
│   │   ├── LoginPage.jsx       # Sign-in screen with provider buttons
│   │   ├── MediaLibraryPage.jsx
│   │   └── PlayerPage.jsx
│   ├── services/
│   │   └── mediaApi.js         # Thin client for /api/media endpoints
│   └── test/                   # Vitest + Testing Library tests
├── api/
│   ├── media/
│   │   ├── index.js            # GET /api/media  – lists media blobs
│   │   └── function.json
│   └── media/url/
│       ├── index.js            # GET /api/media/url – generates SAS URL
│       └── function.json
├── staticwebapp.config.json    # SWA routes, auth, CSP headers
└── .github/workflows/
    └── azure-static-web-apps.yml
```

---

## Quick start

### Prerequisites

- Node.js ≥ 18
- An Azure Static Web App resource
- An Azure Storage account with a container named `media` (configurable)
- [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) for local auth emulation

### 1 — Install dependencies

```bash
npm install
cd api && npm install && cd ..
```

### 2 — Configure environment variables

Create `api/local.settings.json` (never commit this file):

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_STORAGE_CONNECTION_STRING": "<your-storage-connection-string>",
    "MEDIA_CONTAINER_NAME": "media",
    "SAS_EXPIRY_MINUTES": "60"
  }
}
```

For production, set these as **Application Settings** in the Azure SWA portal and add your Entra ID app registration credentials:

| Setting | Description |
|---|---|
| `AZURE_STORAGE_CONNECTION_STRING` | Storage account connection string |
| `MEDIA_CONTAINER_NAME` | Blob container name (default: `media`) |
| `SAS_EXPIRY_MINUTES` | SAS token lifetime (default: `60`) |
| `AAD_CLIENT_ID` | Entra ID app client ID |
| `AAD_CLIENT_SECRET` | Entra ID app client secret |

### 3 — Run locally

```bash
# Terminal 1 – start the Vite dev server
npm run dev

# Terminal 2 – start the Azure Functions runtime
cd api && func start

# (Optional) Terminal 3 – SWA CLI for full auth emulation
swa start http://localhost:5173 --api-location http://localhost:7071
```

Then open `http://localhost:4280` (SWA CLI) or `http://localhost:5173` (Vite only).

---

## Development scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest tests |
| `npm run lint` | Run oxlint |

---

## Deployment

Push to `main` and the GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) will:
1. Install, lint, test, build the frontend
2. Deploy to Azure SWA via `Azure/static-web-apps-deploy@v1`
3. Deploy the API (`api/`) as Azure Functions

Set the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in your repository settings.

---

## Authentication flow

| Step | What happens |
|---|---|
| User visits `/` | `ProtectedRoute` calls `/.auth/me` |
| Not signed in | Redirected to `/login` |
| User clicks provider | Browser navigates to `/.auth/login/aad` (or `github`/`google`) |
| OAuth completes | SWA sets a session cookie and redirects back |
| All `/` routes | `staticwebapp.config.json` restricts to `authenticated` role |

---

## Supported media formats

| Type | Formats |
|---|---|
| Video | MP4, WebM, OGG, AVI, MOV |
| Audio | MP3, M4A, OGG/OGA, WAV, FLAC |

Files are detected by MIME type first, then by extension.
