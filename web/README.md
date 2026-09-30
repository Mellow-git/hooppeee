# Hopium attribution dashboard

Jury-facing React app for SIH 2026 PSID SIH26151. Mock data only unless API mode is enabled.

## Run (Windows PowerShell)

```powershell
cd web
npm install
npm run dev
```

Open http://localhost:5173

```powershell
npm run build
npm test
```

## Switch to API mode

Create `web/.env`:

```
VITE_DATA_SOURCE=api
VITE_API_BASE=http://127.0.0.1:8000
VITE_API_KEY=your-key
```

Default is `VITE_DATA_SOURCE=mock` (JSON under `src/data`). If an API call fails, the UI falls back to mock data and shows **API unreachable, showing demo data**.

## Vercel

The Vite `index.html` is in this folder (`web/index.html`). A copy also sits at the **repository root** so Vercel can see an `index.html` in the main folder.

- **Option A (recommended):** In the Vercel project, set **Root Directory** to `web`. Framework: Vite. Output: `dist`.
- **Option B:** Deploy the repo root. Root `vercel.json` runs `npm install` / `npm run build` inside `web` and publishes `web/dist`. SPA routes rewrite to `index.html`.

Deep links (`/actors/ACT-0417`, `/graph`, …) need those rewrites; they are already in both `vercel.json` files.
