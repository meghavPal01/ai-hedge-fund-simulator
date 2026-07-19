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
 
