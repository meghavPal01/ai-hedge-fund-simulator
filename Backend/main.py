from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from services.market_data import get_quote, search_symbols
from services.prediction import predict

app = FastAPI(
    title="AI-Hedge Fund Simulator API",
    version="0.1.0",
    description="Live market data + heuristic prediction endpoints for the AI-Hedge Fund Simulator frontend.",
)

# Dev-friendly CORS. Tighten allow_origins to your actual frontend URL before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "ai-hedge-fund-simulator"}


@app.get("/api/stocks/{symbol}")
def stock_quote(symbol: str):
    """Live quote, fundamentals, and 7-day price history for a ticker."""
    try:
        return get_quote(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream data fetch failed: {e}")


@app.get("/api/stocks/{symbol}/predict")
def stock_prediction(symbol: str):
    """Heuristic next-day prediction, confidence, risk tier, and feature breakdown."""
    try:
        return predict(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Prediction failed: {e}")


@app.get("/api/search")
def search(q: str = Query(..., min_length=1, description="Ticker or company name fragment")):
    """Search the curated ticker universe by symbol or company name."""
    return search_symbols(q)
