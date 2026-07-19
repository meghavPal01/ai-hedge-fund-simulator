# A small curated set of tickers used for the /api/search fallback.
# yfinance doesn't expose an official autocomplete/search endpoint, so this
# static list stands in for now. Swap in a real search API (Yahoo's
# autocomplete endpoint, Polygon's ticker search, Finnhub's symbol lookup,
# etc.) once you're ready to support arbitrary tickers.

STOCK_UNIVERSE = [
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "sector": "Technology"},
    {"symbol": "NVDA", "name": "NVIDIA Corp.", "sector": "Technology"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Communication Services"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Discretionary"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "sector": "Communication Services"},
    {"symbol": "NFLX", "name": "Netflix Inc.", "sector": "Communication Services"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financials"},
    {"symbol": "V", "name": "Visa Inc.", "sector": "Financials"},
    {"symbol": "WMT", "name": "Walmart Inc.", "sector": "Consumer Staples"},
    {"symbol": "DIS", "name": "The Walt Disney Company", "sector": "Communication Services"},
    {"symbol": "AMD", "name": "Advanced Micro Devices Inc.", "sector": "Technology"},
    {"symbol": "INTC", "name": "Intel Corp.", "sector": "Technology"},
    {"symbol": "BA", "name": "Boeing Co.", "sector": "Industrials"},
]
