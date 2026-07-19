# AI-Hedge Fund Simulator — Backend

FastAPI service that powers the dashboard: live quotes via `yfinance`, plus a
heuristic (not-yet-ML) prediction endpoint so the frontend has real data to
render while the actual model layer gets built.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Interactive docs (Swagger UI)
are auto-generated at `http://localhost:8000/docs`.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/stocks/{symbol}` | Live quote: price, change, market cap, volume, P/E, sector, 7-day history, company overview |
| GET | `/api/stocks/{symbol}/predict` | Next-day prediction, expected return %, confidence, risk tier, feature importance |
| GET | `/api/search?q=` | Search tickers by symbol or company name |

Example:
```bash
curl http://localhost:8000/api/stocks/AAPL
curl http://localhost:8000/api/stocks/AAPL/predict
curl "http://localhost:8000/api/search?q=tesla"
```

## Important notes

- **Prediction is a heuristic, not a trained model.** `services/prediction.py`
  combines momentum, RSI, MACD histogram, and volume trend into a bounded
  next-day estimate — good enough to wire up the frontend, but it is not the
  XGBoost/LightGBM/LSTM model from the project roadmap. Swap it out once
  you've trained one; keep the same response shape and the frontend won't
  need to change.
- **Search is a static list.** `services/universe.py` holds ~15 curated
  tickers since yfinance has no official autocomplete endpoint. Replace with
  Yahoo's autocomplete endpoint, Polygon's ticker search, or Finnhub's symbol
  lookup for arbitrary-ticker search.
- **yfinance has no SLA.** It scrapes Yahoo Finance's public endpoints, so
  expect occasional rate-limiting or flakiness. Fine for prototyping; move to
  a paid provider (Polygon.io, Finnhub, Alpha Vantage) if you need reliability.
- **CORS is wide open (`allow_origins=["*"]`)** for local development.
  Restrict it to your actual frontend origin before deploying anywhere public.

## Connecting the frontend

The response field names intentionally mirror what `dashboard.jsx` expects
(`price_usd`, `change_pct`, `market_cap_usd`, `history`, etc.) — point your
`fetch()` calls at these endpoints and convert to INR client-side the same
way the mock data does now.
