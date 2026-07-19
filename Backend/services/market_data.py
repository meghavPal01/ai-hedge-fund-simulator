"""
Live market data, backed by yfinance (free, no API key required).
 
Note on rate limits: yfinance scrapes Yahoo Finance's public endpoints, so it
has no official SLA and can be rate-limited or flaky under load. Fine for a
personal project / prototype; swap in Alpha Vantage, Polygon.io, or Finnhub
if you need reliability at scale.
"""
 
from __future__ import annotations
 
import yfinance as yf
 
from .cache import cached
from .universe import STOCK_UNIVERSE
 
 
def _format_volume(volume: float | None) -> str:
    if not volume:
        return "—"
    if volume >= 1_000_000_000:
        return f"{volume / 1_000_000_000:.1f}B"
    if volume >= 1_000_000:
        return f"{volume / 1_000_000:.1f}M"
    if volume >= 1_000:
        return f"{volume / 1_000:.1f}K"
    return str(int(volume))
 
 
def _get_history(symbol: str, period: str = "7d"):
    """History is cached briefly — it's what every price/change/sparkline
    figure derives from, and it's requested on every card render."""
    def fetch():
        return yf.Ticker(symbol).history(period=period)
    return cached(f"history:{symbol}:{period}", ttl_seconds=45, fn=fetch)
 
 
def _get_company_info(symbol: str) -> dict:
    """Name/sector/PE/overview — the heaviest, most rate-limit-prone Yahoo
    call (it's the one that returns 429s under load). Cached for an hour
    since this data barely changes, and any failure here degrades to an
    empty dict rather than raising — price data should still show even when
    Yahoo is rate-limiting this specific endpoint."""
    def fetch():
        try:
            return yf.Ticker(symbol).info or {}
        except Exception:
            return {}
    return cached(f"info:{symbol}", ttl_seconds=3600, fn=fetch)
 
 
def get_quote(symbol: str) -> dict:
    """Fetch current price, fundamentals, and a short price history for a ticker."""
    hist = _get_history(symbol, "7d")
 
    if hist.empty:
        raise ValueError(f"No data found for symbol '{symbol}'")
 
    closes = [round(float(c), 2) for c in hist["Close"].tolist()]
    price = closes[-1]
    prev_close = closes[-2] if len(closes) > 1 else price
    change = round(price - prev_close, 2)
    change_pct = round((change / prev_close) * 100, 2) if prev_close else 0.0
 
    info = _get_company_info(symbol)  # may be {} if Yahoo rate-limited it — that's OK
    volume = info.get("volume") or (hist["Volume"].iloc[-1] if "Volume" in hist else None)
    trailing_pe = info.get("trailingPE")
 
    return {
        "symbol": symbol.upper(),
        "name": info.get("longName") or info.get("shortName") or symbol.upper(),
        "sector": info.get("sector", "—"),
        "industry": info.get("industry", "—"),
        "price_usd": price,
        "change_usd": change,
        "change_pct": change_pct,
        "market_cap_usd": info.get("marketCap"),
        "volume": _format_volume(volume),
        "pe": round(trailing_pe, 2) if trailing_pe else None,
        "history": closes,
        "overview": (info.get("longBusinessSummary") or "")[:400],
    }
 
 
def search_symbols(query: str, limit: int = 6) -> list[dict]:
    """Filter the curated ticker universe by symbol or company name."""
    q = query.strip().lower()
    if not q:
        return []
    matches = [
        s for s in STOCK_UNIVERSE
        if q in s["symbol"].lower() or q in s["name"].lower()
    ]
    return matches[:limit]
 