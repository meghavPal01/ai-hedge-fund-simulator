# AI-Hedge Fund Simulator
 
An AI-flavored stock dashboard: live quotes, a next-day price prediction with
a confidence gauge and risk tier, and a searchable watchlist — built as a
React frontend talking to a FastAPI backend.
 
```
ai-hedge-fund-simulator/
├── README.md              ← you are here
├── backend/               ← FastAPI + yfinance
│   ├── main.py
│   ├── requirements.txt
│   └── services/
│       ├── market_data.py     (live quotes via yfinance)
│       ├── prediction.py      (heuristic next-day prediction)
│       └── universe.py        (curated ticker list for search)
└── frontend/              ← React + Vite
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx        (mounts the app)
        └── App.jsx         (the dashboard — pages, styles, fetch logic)
```
 
---
 
## Prerequisites
 
- **Node.js 18+** and npm (for the frontend)
- **Python 3.10+** (for the backend)
---
 
## 1. Run the backend
 
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
 
Leave this running. Check it's alive at `http://localhost:8000` — you should
see `{"status": "ok", "service": "ai-hedge-fund-simulator"}`. Interactive API
docs are at `http://localhost:8000/docs`.
 
## 2. Run the frontend
 
In a **second terminal**:
 
```bash
cd frontend
npm install
npm run dev
```
 
Open the URL it prints (usually `http://localhost:5173`). You should see
live data pulled from the backend you started in step 1.
 
---
 
## How the two sides connect
 
The frontend has no build-time config for this — it just calls a hardcoded
base URL:
 
```js
// frontend/src/App.jsx
const API_BASE = "http://localhost:8000";
```
 
Three fetch hooks in `App.jsx` hit three backend endpoints:
 
| Frontend hook | Backend endpoint | Returns |
|---|---|---|
| `useStockQuote(symbol)` | `GET /api/stocks/{symbol}` | price, change, market cap, volume, P/E, sector, 7-day history, overview |
| `useStockPrediction(symbol)` | `GET /api/stocks/{symbol}/predict` | predicted price, expected return %, confidence, risk tier, feature importance |
| `useSearch(query)` | `GET /api/search?q=` | matching tickers (debounced 250ms) |
 
The backend's CORS middleware (`allow_origins=["*"]`) is what lets the
frontend — running on a different port — call it from the browser at all.
That's fine for local dev; **tighten it to your actual frontend origin**
before deploying either piece publicly.
 
If you deploy the backend somewhere other than `localhost:8000` (e.g. a
cloud host), update `API_BASE` in `App.jsx` to match, and update
`allow_origins` in `backend/main.py` to your deployed frontend's URL.
 
### Built-in fallback (by design, not a bug)
 
If the frontend can't reach the backend at all — wrong port, backend not
started, or you're viewing `App.jsx` in an environment with no route to
`localhost` — it doesn't just show a blank error. It falls back to a small
built-in sample dataset (8 tickers) so the UI stays demonstrable, and marks
every affected card with a **"● SAMPLE DATA — BACKEND UNREACHABLE"** badge.
If the backend *is* reachable but returns a real error (bad ticker, 500,
etc.), you'll see an honest error card with a Retry button instead — the
sample-data fallback only triggers on connection failure, not on backend
errors.
 
---
 
## What each side actually does
 
### Backend (`/backend`)
 
- **`services/market_data.py`** — wraps `yfinance` to fetch live price,
  fundamentals, and 7-day history for any ticker.
- **`services/prediction.py`** — **a heuristic, not a trained ML model.** It
  combines momentum, RSI, MACD histogram, and volume trend into a bounded
  next-day return estimate (capped ±3%), with a confidence score derived
  from indicator agreement and volatility. Good enough to give the frontend
  real, moving numbers; swap in an actual XGBoost/LightGBM/LSTM model later
  without changing the response shape.
- **`services/universe.py`** — a static list of ~15 tickers used for search,
  since yfinance has no official autocomplete endpoint. Swap in a real
  search API (Yahoo autocomplete, Polygon ticker search, Finnhub symbol
  lookup) to support arbitrary tickers.
- **yfinance has no SLA** — it scrapes Yahoo Finance's public endpoints, so
  expect occasional rate-limiting or flakiness. Fine for a prototype; move
  to a paid provider (Polygon.io, Finnhub, Alpha Vantage) for reliability.
### Frontend (`/frontend`)
 
- **Two pages**, switched via in-app nav state (no router library): *Today's
  Market* (search + watchlist with bigger cards) and *AI Prediction*
  (search + predicted price, risk badge, confidence gauge, feature-importance
  bars).
- **All prices converted to INR** client-side via a fixed `USD_TO_INR`
  constant in `App.jsx` — replace with a live FX rate if you need accuracy.
- **Currency, colors, fonts, and layout are all self-contained** in
  `App.jsx` (no external CSS file) so there's nothing else to wire up beyond
  what's in this repo.
---
 
## Troubleshooting
 
| Symptom | Likely cause |
|---|---|
| Every card shows the amber "SAMPLE DATA" badge | Backend isn't running, or isn't on port 8000 — check terminal 1 |
| Backend terminal shows CORS errors in the browser console | `allow_origins` in `backend/main.py` doesn't include your frontend's origin |
| `/api/stocks/{symbol}` returns 404 | Ticker isn't on Yahoo Finance, or yfinance couldn't find it — try a well-known ticker like `AAPL` first |
| `/api/stocks/{symbol}` returns 502, backend logs show `429 Client Error: Too Many Requests` from `query2.finance.yahoo.com` | **Yahoo Finance is rate-limiting yfinance**, usually from too many near-simultaneous requests (e.g. 5+ watchlist cards loading at once, each fetching independently). The backend now caches Yahoo responses (45s for price/history, 1hr for company metadata) to cut down repeat calls, and degrades gracefully — a rate-limited metadata call no longer fails the whole quote, since price data is fetched separately. If you still hit this: wait 30–60 seconds before retrying (Yahoo's limit resets), and make sure `<React.StrictMode>` isn't wrapping the app in `main.jsx` — StrictMode double-fires every fetch in dev, doubling your request volume. If it persists, reduce `DEFAULT_WATCHLIST` in `App.jsx` to fewer tickers, or move to a paid data provider (Polygon.io, Finnhub) that doesn't rate-limit this aggressively. |
| Search returns nothing | You're using the static universe in `services/universe.py` — it only knows ~15 tickers by design |
 
---
 
## Deploying it live (backend: Render or Railway, frontend: Vercel or Netlify)
 
Deploy the **backend first** — the frontend needs its live URL.
 
### Backend → Render or Railway
 
Both platforms auto-detect Python and read the `Procfile` already included:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
 
**Render:**
1. Push this repo to GitHub.
2. New → Web Service → connect the repo → set **Root Directory** to `backend`.
3. Build command: `pip install -r requirements.txt`. Start command is picked up from the `Procfile` automatically.
4. Deploy. Render gives you a URL like `https://your-app.onrender.com` — copy it.
**Railway:**
1. New Project → Deploy from GitHub repo.
2. Set the service's root directory to `backend` (Settings → Root Directory).
3. Railway auto-detects the `Procfile`. Deploy, then copy the generated public URL.
Either way, once deployed, set an environment variable on that service:
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```
(comma-separate multiple origins if you deploy to both Vercel *and* Netlify). This replaces the wide-open `allow_origins=["*"]` used for local dev — `main.py` already reads this env var (see `os.environ.get("ALLOWED_ORIGINS", "*")`).
 
### Frontend → Vercel or Netlify
 
Both auto-detect Vite. Point either one at the `frontend` folder as the project root.
 
**Vercel:**
1. New Project → import the repo → set **Root Directory** to `frontend`.
2. Framework preset: Vite (auto-detected). Build command `npm run build`, output directory `dist` (auto-filled).
3. Before deploying, add an environment variable:
```
   VITE_API_BASE=https://your-backend-app.onrender.com
```
4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.
**Netlify:**
1. Add new site → import from Git → base directory `frontend`.
2. Build command `npm run build`, publish directory `frontend/dist`.
3. Site settings → Environment variables → add `VITE_API_BASE` same as above.
4. Deploy.
`App.jsx` already reads `import.meta.env.VITE_API_BASE` (falling back to `localhost:8000` if unset), so no code changes are needed here — just the environment variable at deploy time.
 
### After both are live
 
1. Copy the frontend's real deployed URL.
2. Go back to your backend host (Render/Railway) and set `ALLOWED_ORIGINS` to that exact URL if you haven't already.
3. Redeploy the backend so the new CORS setting takes effect.
4. Open the frontend URL — it should now fetch live data from the deployed backend instead of `localhost`.
**Common deployment gotchas:**
- Forgetting to set `VITE_API_BASE` → frontend silently tries to hit `localhost:8000` in production, which doesn't exist on the visitor's machine → every card falls back to sample data.
- Forgetting to set `ALLOWED_ORIGINS` on the backend → browser blocks the requests with a CORS error, visible in the deployed site's DevTools console.
- Render's free tier spins down after inactivity — the first request after idling can take 30–60s to "wake up" the backend. Not a bug, just a free-tier tradeoff.

