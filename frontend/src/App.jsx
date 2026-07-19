import React, { useState, useMemo, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Search, Plus, X, TrendingUp, TrendingDown } from "lucide-react";

// ============================================================
// STYLE DEFINITIONS — kept as a distinct block/module within
// this file (colors, fonts, and per-element style objects).
// ============================================================

const fontImports = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  @keyframes skeletonPulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.9; } }
  .skeleton { background: #1B202B; border-radius: 6px; animation: skeletonPulse 1.4s ease-in-out infinite; }
 
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; }
 
  /* ---- Responsive breakpoints ---- */
  @media (max-width: 860px) {
    .app-shell { padding: 16px !important; }
    .pred-lower-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .app-shell { padding: 12px !important; }
    .featured-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .pred-price-grid { grid-template-columns: 1fr 1fr !important; }
    .header-row { flex-direction: column; align-items: flex-start !important; }
    .market-status-block { text-align: left !important; width: 100%; }
    .nav-tabs-row { width: 100%; }
    .nav-tabs-row button { flex: 1; }
  }
  @media (max-width: 420px) {
    .pred-price-grid { grid-template-columns: 1fr !important; }
    .featured-symbol-price { flex-direction: column; align-items: flex-start !important; }
    .featured-price-block { text-align: left !important; width: 100%; margin-top: 10px; }
  }
`;

const LOGO_SRC =
  "data:image/jpeg;base64,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";

const fonts = {
  display: "'Space Grotesk', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const colors = {
  bg: "#0B0E14",
  card: "#12151C",
  cardAlt: "#161A23",
  border: "#1E232D",
  text: "#E8EAED",
  textDim: "#6B7685",
  textMuted: "#3A4150",
  overview: "#C7CBD1",
  amber: "#F2B84B",
  up: "#3ED9A3",
  down: "#FF6B6B",
};

const styles = {
  app: {
    minHeight: "100vh",
    width: "100%",
    background: colors.bg,
    color: colors.text,
    fontFamily: fonts.display,
    padding: 20,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 16,
    borderBottom: `1px solid ${colors.border}`,
    flexWrap: "wrap",
    gap: 16,
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: "hidden",
    background: "#0F131A",
    border: `1px solid ${colors.amber}55`,
    boxShadow: `0 0 18px ${colors.amber}2E`,
  },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  brandTitle: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.2,
    backgroundImage: `linear-gradient(90deg, ${colors.amber} 0%, #FFE7B3 45%, ${colors.amber} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  brandSub: {
    fontSize: 11.5,
    color: colors.textDim,
    fontFamily: fonts.mono,
    marginTop: 2,
  },
  marketStatus: {
    textAlign: "right",
    fontSize: 11,
    color: colors.textDim,
    fontFamily: fonts.mono,
  },
  statusLive: { color: colors.up },

  // Nav tabs
  navTabs: { display: "flex", gap: 8, marginBottom: 18 },
  navTab: {
    padding: "8px 14px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.card,
    color: colors.textDim,
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  navTabActive: {
    background: colors.amber,
    color: colors.bg,
    border: `1px solid ${colors.amber}`,
  },

  // Search
  searchWrap: { position: "relative", marginBottom: 18, maxWidth: 440 },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 9,
    background: colors.card,
    border: `1px solid ${colors.border}`,
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 13.5,
  },
  searchResults: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: colors.cardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 10,
    boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
  },
  searchResultRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
  },
  searchResultRowHover: { background: "#1D2330" },

  sectionLabel: {
    fontSize: 11,
    color: colors.textDim,
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: fonts.mono,
  },

  // Featured / big card (top of market page)
  featuredCard: {
    borderRadius: 12,
    padding: 20,
    background: `linear-gradient(135deg, ${colors.card} 0%, #151a24 100%)`,
    border: `1px solid ${colors.border}`,
    marginBottom: 20,
  },
  featuredTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 14,
  },
  featuredSymbol: { fontSize: 24, fontWeight: 700 },
  featuredName: { fontSize: 13, color: colors.textDim, marginTop: 2 },
  featuredSector: { fontSize: 11.5, color: colors.textDim, marginTop: 4 },
  featuredPrice: { fontSize: 26, fontWeight: 700, fontFamily: fonts.mono },
  featuredChange: {
    fontSize: 13,
    fontFamily: fonts.mono,
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-end",
  },
  featuredChart: { height: 60, marginTop: 14 },
  featuredMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    marginTop: 16,
    paddingTop: 14,
    borderTop: `1px solid ${colors.border}`,
  },
  metricLabel: { fontSize: 10.5, color: colors.textDim, letterSpacing: 0.5 },
  metricValue: {
    fontSize: 15,
    fontWeight: 600,
    marginTop: 3,
    fontFamily: fonts.mono,
  },

  // Watchlist grid (bigger attractive cards)
  gridWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: 14,
  },
  stockCard: {
    borderRadius: 10,
    padding: 14,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    cursor: "pointer",
    position: "relative",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  stockCardHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
    borderColor: "#2A3140",
  },
  stockCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stockCardSymbol: { fontSize: 15.5, fontWeight: 700 },
  stockCardName: { fontSize: 11, color: colors.textDim, marginTop: 2 },
  stockCardSector: {
    display: "inline-block",
    fontSize: 9.5,
    color: colors.textDim,
    background: "#1B202B",
    borderRadius: 5,
    padding: "2px 7px",
    marginTop: 6,
  },
  stockCardPrice: {
    fontSize: 17,
    fontWeight: 700,
    fontFamily: fonts.mono,
    marginTop: 10,
  },
  stockCardChange: {
    fontSize: 11.5,
    fontFamily: fonts.mono,
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  stockCardChart: { height: 32, marginTop: 8 },
  removeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "transparent",
    border: "none",
    color: colors.textMuted,
    cursor: "pointer",
    padding: 2,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: colors.amber,
    background: "transparent",
    border: `1px solid ${colors.amber}44`,
    borderRadius: 6,
    padding: "5px 10px",
    cursor: "pointer",
  },

  emptyState: {
    padding: 40,
    textAlign: "center",
    color: colors.textDim,
    fontSize: 13.5,
    border: `1px dashed ${colors.border}`,
    borderRadius: 12,
  },
  fallbackBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: 0.4,
    color: colors.amber,
    background: `${colors.amber}1A`,
    border: `1px solid ${colors.amber}44`,
    borderRadius: 6,
    padding: "3px 8px",
    marginBottom: 12,
  },

  // ---- Prediction page ----
  predBigCard: {
    borderRadius: 14,
    padding: 22,
    background: `linear-gradient(135deg, ${colors.card} 0%, #151a24 100%)`,
    border: `1px solid ${colors.border}`,
  },
  predHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 14,
  },
  predSymbol: { fontSize: 23, fontWeight: 700 },
  predName: { fontSize: 12.5, color: colors.textDim, marginTop: 2 },
  predSector: { fontSize: 11.5, color: colors.textDim, marginTop: 4 },

  predPriceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 14,
    marginTop: 18,
  },
  predPriceBox: {
    borderRadius: 10,
    padding: 14,
    background: "#0F131A",
    border: `1px solid ${colors.border}`,
    textAlign: "center",
  },
  predPriceLabel: {
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  predPriceValue: { fontSize: 19, fontWeight: 700, fontFamily: fonts.mono },

  predLower: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 18,
    marginTop: 20,
  },
  featureBarRow: { marginBottom: 11 },
  featureBarTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    marginBottom: 5,
  },
  featureBarTrack: {
    height: 7,
    borderRadius: 4,
    background: "#1B202B",
    overflow: "hidden",
  },
  featureBarFill: { height: "100%", borderRadius: 4, background: colors.amber },

  riskBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 12,
  },
  explanationText: { fontSize: 13.5, lineHeight: 1.7, color: colors.overview },

  footerNote: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 10.5,
    color: colors.textMuted,
  },
};

// ============================================================
// LIVE DATA — talks to the FastAPI backend (see /backend).
// Run the backend locally (uvicorn main:app --reload --port 8000)
// before this will show real data instead of loading/error states.
// ============================================================

const API_BASE = "http://localhost:8000";
const USD_TO_INR = 83;
const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"];

function isNetworkError(message) {
  return /Failed to fetch|NetworkError|Load failed/i.test(message || "");
}

// Used only when the live API is unreachable (e.g. this chat preview, which
// can't reach localhost). Lets the UI stay demonstrable instead of stuck on
// errors. Every card/section using this data is clearly labeled "Sample data".
const FALLBACK_QUOTES = {
  AAPL: {
    name: "Apple Inc.",
    sector: "Technology",
    price_usd: 210.42,
    change_usd: 3.18,
    change_pct: 1.53,
    market_cap_usd: 3.21e12,
    volume: "48.2M",
    pe: 31.4,
    history: [204, 205, 203, 207, 206, 209, 210.42],
    overview:
      "Sample data — designs and sells consumer hardware, software, and services.",
  },
  MSFT: {
    name: "Microsoft Corp.",
    sector: "Technology",
    price_usd: 468.1,
    change_usd: -2.4,
    change_pct: -0.51,
    market_cap_usd: 3.48e12,
    volume: "19.6M",
    pe: 36.2,
    history: [471, 469, 466, 470, 467, 469, 468.1],
    overview: "Sample data — cloud and productivity software leader.",
  },
  NVDA: {
    name: "NVIDIA Corp.",
    sector: "Technology",
    price_usd: 178.9,
    change_usd: 6.75,
    change_pct: 3.92,
    market_cap_usd: 4.36e12,
    volume: "212.4M",
    pe: 44.8,
    history: [166, 169, 171, 174, 173, 176, 178.9],
    overview:
      "Sample data — dominant supplier of AI training and inference chips.",
  },
  GOOGL: {
    name: "Alphabet Inc.",
    sector: "Communication Services",
    price_usd: 189.55,
    change_usd: 1.05,
    change_pct: 0.56,
    market_cap_usd: 2.34e12,
    volume: "24.1M",
    pe: 24.6,
    history: [186, 187, 188, 187.5, 189, 188.7, 189.55],
    overview: "Sample data — search and cloud conglomerate.",
  },
  AMZN: {
    name: "Amazon.com Inc.",
    sector: "Consumer Discretionary",
    price_usd: 231.2,
    change_usd: 0.4,
    change_pct: 0.17,
    market_cap_usd: 2.46e12,
    volume: "31.7M",
    pe: 38.1,
    history: [228, 229, 230, 229.5, 230.8, 230.9, 231.2],
    overview: "Sample data — e-commerce and cloud infrastructure operator.",
  },
  TSLA: {
    name: "Tesla Inc.",
    sector: "Consumer Discretionary",
    price_usd: 261.3,
    change_usd: -8.4,
    change_pct: -3.11,
    market_cap_usd: 0.83e12,
    volume: "98.5M",
    pe: 68.2,
    history: [274, 270, 266, 268, 263, 265, 261.3],
    overview: "Sample data — EV and energy storage manufacturer.",
  },
  META: {
    name: "Meta Platforms Inc.",
    sector: "Communication Services",
    price_usd: 712.4,
    change_usd: 9.8,
    change_pct: 1.39,
    market_cap_usd: 1.8e12,
    volume: "14.2M",
    pe: 27.9,
    history: [696, 700, 703, 705, 708, 710, 712.4],
    overview: "Sample data — social platforms and ad-tech operator.",
  },
  NFLX: {
    name: "Netflix Inc.",
    sector: "Communication Services",
    price_usd: 1240.0,
    change_usd: 14.2,
    change_pct: 1.16,
    market_cap_usd: 0.53e12,
    volume: "3.8M",
    pe: 41.7,
    history: [1210, 1218, 1222, 1230, 1225, 1235, 1240.0],
    overview: "Sample data — streaming entertainment leader.",
  },
};

const FALLBACK_PREDICTIONS = {
  AAPL: {
    predicted_usd: 222.6,
    expected_return_pct: 5.8,
    confidence: 91,
    risk: "Low",
    features: [
      { label: "Revenue Growth", pct: 35 },
      { label: "News Sentiment", pct: 24 },
      { label: "RSI", pct: 18 },
      { label: "MACD", pct: 14 },
      { label: "Volume", pct: 9 },
    ],
  },
  MSFT: {
    predicted_usd: 479.0,
    expected_return_pct: 2.3,
    confidence: 88,
    risk: "Low",
    features: [
      { label: "Revenue Growth", pct: 30 },
      { label: "News Sentiment", pct: 20 },
      { label: "RSI", pct: 20 },
      { label: "MACD", pct: 17 },
      { label: "Volume", pct: 13 },
    ],
  },
  NVDA: {
    predicted_usd: 196.3,
    expected_return_pct: 9.7,
    confidence: 76,
    risk: "High",
    features: [
      { label: "News Sentiment", pct: 32 },
      { label: "Revenue Growth", pct: 28 },
      { label: "Volume", pct: 18 },
      { label: "RSI", pct: 12 },
      { label: "MACD", pct: 10 },
    ],
  },
  GOOGL: {
    predicted_usd: 193.8,
    expected_return_pct: 2.2,
    confidence: 83,
    risk: "Moderate",
    features: [
      { label: "Revenue Growth", pct: 27 },
      { label: "RSI", pct: 24 },
      { label: "News Sentiment", pct: 21 },
      { label: "MACD", pct: 16 },
      { label: "Volume", pct: 12 },
    ],
  },
  AMZN: {
    predicted_usd: 235.9,
    expected_return_pct: 2.0,
    confidence: 79,
    risk: "Moderate",
    features: [
      { label: "Revenue Growth", pct: 29 },
      { label: "RSI", pct: 22 },
      { label: "News Sentiment", pct: 19 },
      { label: "MACD", pct: 17 },
      { label: "Volume", pct: 13 },
    ],
  },
  TSLA: {
    predicted_usd: 249.0,
    expected_return_pct: -4.7,
    confidence: 58,
    risk: "High",
    features: [
      { label: "News Sentiment", pct: 38 },
      { label: "Volume", pct: 24 },
      { label: "RSI", pct: 16 },
      { label: "Revenue Growth", pct: 12 },
      { label: "MACD", pct: 10 },
    ],
  },
  META: {
    predicted_usd: 731.5,
    expected_return_pct: 2.7,
    confidence: 85,
    risk: "Moderate",
    features: [
      { label: "Revenue Growth", pct: 33 },
      { label: "News Sentiment", pct: 23 },
      { label: "RSI", pct: 19 },
      { label: "MACD", pct: 15 },
      { label: "Volume", pct: 10 },
    ],
  },
  NFLX: {
    predicted_usd: 1268.0,
    expected_return_pct: 2.3,
    confidence: 80,
    risk: "Moderate",
    features: [
      { label: "Revenue Growth", pct: 31 },
      { label: "News Sentiment", pct: 20 },
      { label: "RSI", pct: 20 },
      { label: "MACD", pct: 16 },
      { label: "Volume", pct: 13 },
    ],
  },
};

function fallbackSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Object.entries(FALLBACK_QUOTES)
    .filter(
      ([symbol, s]) =>
        symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    )
    .map(([symbol, s]) => ({ symbol, name: s.name, sector: s.sector }))
    .slice(0, 6);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch (_) {
      /* response wasn't JSON, keep statusText */
    }
    throw new Error(detail);
  }
  return res.json();
}

// Fetches /api/stocks/{symbol} — price, fundamentals, history, overview.
function useStockQuote(symbol) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    isFallback: false,
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null, isFallback: false });
    fetchJson(`${API_BASE}/api/stocks/${symbol}`)
      .then((data) => {
        if (!cancelled)
          setState({ data, loading: false, error: null, isFallback: false });
      })
      .catch((err) => {
        if (cancelled) return;
        const fallback = FALLBACK_QUOTES[symbol];
        if (isNetworkError(err.message) && fallback) {
          setState({
            data: fallback,
            loading: false,
            error: null,
            isFallback: true,
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: err.message,
            isFallback: false,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, reloadToken]);

  return { ...state, refetch: () => setReloadToken((t) => t + 1) };
}

// Fetches /api/stocks/{symbol}/predict — predicted price, confidence, risk, features.
function useStockPrediction(symbol) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    isFallback: false,
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null, isFallback: false });
    fetchJson(`${API_BASE}/api/stocks/${symbol}/predict`)
      .then((data) => {
        if (!cancelled)
          setState({ data, loading: false, error: null, isFallback: false });
      })
      .catch((err) => {
        if (cancelled) return;
        const fallbackPred = FALLBACK_PREDICTIONS[symbol];
        const fallbackQuote = FALLBACK_QUOTES[symbol];
        if (isNetworkError(err.message) && fallbackPred && fallbackQuote) {
          setState({
            data: {
              symbol,
              price_usd: fallbackQuote.price_usd,
              ...fallbackPred,
            },
            loading: false,
            error: null,
            isFallback: true,
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: err.message,
            isFallback: false,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, reloadToken]);

  return { ...state, refetch: () => setReloadToken((t) => t + 1) };
}

// Debounced search against /api/search?q=
function useSearch(query) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      fetchJson(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`)
        .then((data) => {
          if (!cancelled) setResults(data);
        })
        .catch((err) => {
          if (cancelled) return;
          setResults(isNetworkError(err.message) ? fallbackSearch(q) : []);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return results;
}

// ============================================================
// HELPERS
// ============================================================

function toInr(usd) {
  return usd * USD_TO_INR;
}

function formatInr(amount, fractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(amount);
}

function formatMarketCapInr(usdValue) {
  if (!usdValue) return "—";
  const inr = toInr(usdValue);
  const lakhCrore = inr / 1e12;
  if (lakhCrore >= 1) return `₹${lakhCrore.toFixed(1)}L Cr`;
  const crore = inr / 1e7;
  return `₹${crore.toFixed(0)} Cr`;
}

function riskColor(risk) {
  if (risk === "Low") return colors.up;
  if (risk === "Moderate") return colors.amber;
  return colors.down;
}

function confidenceTier(value) {
  if (value >= 85) return { label: "Very high", color: colors.up };
  if (value >= 70) return { label: "High", color: colors.up };
  if (value >= 50) return { label: "Moderate", color: colors.amber };
  return { label: "Low", color: colors.down };
}

// Inline error card used wherever a fetch fails — same footprint as the
// content it replaces, with a retry button and a hint if it looks like the
// backend just isn't running.
function ErrorState({ message, onRetry, compact }) {
  return (
    <div
      style={{
        ...styles.emptyState,
        borderColor: `${colors.down}55`,
        color: colors.down,
        padding: compact ? 20 : 40,
        textAlign: "left",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn't load data</div>
      <div
        style={{
          fontSize: 12.5,
          color: colors.textDim,
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        {message}
        {isNetworkError(message) && ` — is the backend running at ${API_BASE}?`}
      </div>
      {onRetry && (
        <button style={styles.addBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function SkeletonBlock({ width = "100%", height = 16, style }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

function FallbackBadge() {
  return (
    <div style={styles.fallbackBadge}>● SAMPLE DATA — BACKEND UNREACHABLE</div>
  );
}
function Logo() {
  return (
    <div style={styles.brand}>
      <div style={styles.logoMark}>
        <img
          src={LOGO_SRC}
          alt="AI-Hedge Fund Simulator logo"
          style={styles.logoImg}
        />
      </div>
      <div>
        <div style={styles.brandTitle}>AI-HEDGE FUND SIMULATOR</div>
        <div style={styles.brandSub}>live market · ai signal layer</div>
      </div>
    </div>
  );
}

function SearchBox({ query, setQuery, results, onSelect, placeholder }) {
  return (
    <div style={styles.searchWrap}>
      <div style={styles.searchBox}>
        <Search size={16} color={colors.textDim} />
        <input
          style={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: colors.textDim,
              display: "flex",
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div style={styles.searchResults}>
          {results.map((r) => (
            <SearchResultRow key={r.symbol} result={r} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultRow({ result, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onSelect(result.symbol)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.searchResultRow,
        ...(hover ? styles.searchResultRowHover : {}),
      }}
    >
      <div>
        <span
          style={{ fontFamily: fonts.mono, fontWeight: 600, marginRight: 10 }}
        >
          {result.symbol}
        </span>
        <span style={{ fontSize: 12.5, color: colors.textDim }}>
          {result.name}
        </span>
      </div>
      <span
        style={{
          fontSize: 12.5,
          color: colors.textDim,
          fontFamily: fonts.mono,
        }}
      >
        {result.sector}
      </span>
    </button>
  );
}

function Sparkline({ history, up }) {
  const data = useMemo(() => history.map((v, i) => ({ i, v })), [history]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
        <Line
          type="monotone"
          dataKey="v"
          stroke={up ? colors.up : colors.down}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ConfidenceDial({ value }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 900; // ms

    setAnimated(0);
    function tick(timestamp) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimated(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const displayValue = Math.round(animated);
  const cx = 100;
  const cy = 88;
  const r = 68;
  const trackWidth = 12;
  const tier = confidenceTier(displayValue);

  const toXY = (angleDeg, radius = r) => {
    const a = (Math.PI / 180) * angleDeg;
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  };

  const startAngle = 180;
  const sweep = 180 * (Math.max(0, Math.min(100, animated)) / 100);
  const [sx, sy] = toXY(startAngle);
  const [ex, ey] = toXY(startAngle - sweep);
  const largeArc = sweep > 180 ? 1 : 0;

  const tickInner = r + trackWidth / 2 + 4;
  const tickOuter = tickInner + 8;
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = 180 - i * 18;
    const [x1, y1] = toXY(angle, tickInner);
    const [x2, y2] = toXY(angle, tickOuter);
    const major = i % 5 === 0;
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={major ? colors.textDim : "#2A3140"}
        strokeWidth={major ? 2 : 1.5}
      />,
    );
  }

  return (
    <svg
      viewBox="0 0 200 156"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {ticks}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#1C212B"
        strokeWidth={trackWidth}
        strokeLinecap="round"
      />
      {sweep > 0 && (
        <path
          d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 0 ${ex} ${ey}`}
          fill="none"
          stroke={tier.color}
          strokeWidth={trackWidth}
          strokeLinecap="round"
        />
      )}
      {/* Scale endpoints sit tight against the arc itself */}
      <text
        x={cx - r}
        y={cy + 12}
        textAnchor="middle"
        fontSize="9"
        fontFamily={fonts.mono}
        fill={colors.textMuted}
      >
        0
      </text>
      <text
        x={cx + r}
        y={cy + 12}
        textAnchor="middle"
        fontSize="9"
        fontFamily={fonts.mono}
        fill={colors.textMuted}
      >
        100
      </text>
      {/* Big percentage, centered in the dial's open belly */}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fontSize="34"
        fontFamily={fonts.mono}
        fontWeight="600"
        fill={colors.text}
      >
        {displayValue}%
      </text>
      {/* Tier label pushed well clear of the scale numbers, on its own line */}
      <text
        x={cx}
        y={cy + 44}
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fontFamily={fonts.display}
        fill={tier.color}
      >
        {tier.label} confidence
      </text>
    </svg>
  );
}

// ============================================================
// PAGE 1 — TODAY'S MARKET
// ============================================================

function MarketPage() {
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState("AAPL");
  const [hoveredCard, setHoveredCard] = useState(null);

  const results = useSearch(query);
  const {
    data: stock,
    loading,
    error,
    isFallback,
    refetch,
  } = useStockQuote(featured);

  function handleSelect(ticker) {
    setFeatured(ticker);
    setQuery("");
  }

  function addToWatchlist(ticker) {
    setWatchlist((wl) => (wl.includes(ticker) ? wl : [...wl, ticker]));
  }

  function removeFromWatchlist(ticker) {
    setWatchlist((wl) => wl.filter((t) => t !== ticker));
  }

  const isUp = stock ? stock.change_usd >= 0 : true;

  return (
    <div>
      <SearchBox
        query={query}
        setQuery={setQuery}
        results={results}
        onSelect={handleSelect}
        placeholder="Search a company or ticker (e.g. Tesla, NFLX)…"
      />

      {/* Featured big card */}
      <div style={styles.featuredCard}>
        {loading && <FeaturedSkeleton />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && stock && (
          <>
            {isFallback && <FallbackBadge />}
            <div style={styles.featuredTop} className="featured-symbol-price">
              <div>
                <div style={styles.featuredSymbol}>{featured}</div>
                <div style={styles.featuredName}>{stock.name}</div>
                <div style={styles.featuredSector}>{stock.sector}</div>
              </div>
              <div
                style={{ textAlign: "right" }}
                className="featured-price-block"
              >
                <div style={styles.featuredPrice}>
                  {formatInr(toInr(stock.price_usd))}
                </div>
                <div
                  style={{
                    ...styles.featuredChange,
                    color: isUp ? colors.up : colors.down,
                  }}
                >
                  {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {formatInr(Math.abs(toInr(stock.change_usd)))} (
                  {Math.abs(stock.change_pct)}%)
                </div>
                {!watchlist.includes(featured) && (
                  <button
                    style={{ ...styles.addBtn, marginTop: 10 }}
                    onClick={() => addToWatchlist(featured)}
                  >
                    <Plus size={14} /> Add to watchlist
                  </button>
                )}
              </div>
            </div>

            <div style={styles.featuredChart}>
              <Sparkline history={stock.history} up={isUp} />
            </div>

            <div
              style={styles.featuredMetrics}
              className="featured-metrics-grid"
            >
              <div>
                <div style={styles.metricLabel}>Market Cap</div>
                <div style={styles.metricValue}>
                  {formatMarketCapInr(stock.market_cap_usd)}
                </div>
              </div>
              <div>
                <div style={styles.metricLabel}>Volume</div>
                <div style={styles.metricValue}>{stock.volume}</div>
              </div>
              <div>
                <div style={styles.metricLabel}>P/E Ratio</div>
                <div style={styles.metricValue}>{stock.pe ?? "—"}</div>
              </div>
              <div>
                <div style={styles.metricLabel}>Sector</div>
                <div
                  style={{
                    ...styles.metricValue,
                    fontSize: 13,
                    fontFamily: fonts.display,
                  }}
                >
                  {stock.sector}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={styles.sectionLabel}>YOUR WATCHLIST</div>
      {watchlist.length === 0 ? (
        <div style={styles.emptyState}>
          Your watchlist is empty. Search above and add a few companies to
          track.
        </div>
      ) : (
        <div style={styles.gridWrap}>
          {watchlist.map((t) => (
            <WatchlistCard
              key={t}
              symbol={t}
              active={t === featured}
              hovered={hoveredCard === t}
              onSelect={setFeatured}
              onRemove={removeFromWatchlist}
              onHoverStart={() => setHoveredCard(t)}
              onHoverEnd={() => setHoveredCard(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div>
      <div style={styles.featuredTop} className="featured-symbol-price">
        <div>
          <SkeletonBlock width={140} height={30} style={{ marginBottom: 8 }} />
          <SkeletonBlock width={180} height={14} style={{ marginBottom: 6 }} />
          <SkeletonBlock width={220} height={12} />
        </div>
        <div style={{ textAlign: "right" }} className="featured-price-block">
          <SkeletonBlock
            width={160}
            height={34}
            style={{ marginBottom: 8, marginLeft: "auto" }}
          />
          <SkeletonBlock
            width={130}
            height={14}
            style={{ marginLeft: "auto" }}
          />
        </div>
      </div>
      <SkeletonBlock height={90} style={{ marginTop: 20 }} />
      <div
        style={{ ...styles.featuredMetrics }}
        className="featured-metrics-grid"
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonBlock width={70} height={11} style={{ marginBottom: 8 }} />
            <SkeletonBlock width={90} height={17} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WatchlistCard({
  symbol,
  active,
  hovered,
  onSelect,
  onRemove,
  onHoverStart,
  onHoverEnd,
}) {
  const {
    data: s,
    loading,
    error,
    isFallback,
    refetch,
  } = useStockQuote(symbol);

  if (loading) {
    return (
      <div style={styles.stockCard}>
        <SkeletonBlock width={70} height={18} style={{ marginBottom: 8 }} />
        <SkeletonBlock width={120} height={12} style={{ marginBottom: 14 }} />
        <SkeletonBlock width={100} height={26} style={{ marginBottom: 10 }} />
        <SkeletonBlock height={44} />
      </div>
    );
  }

  if (error || !s) {
    return (
      <div style={{ ...styles.stockCard, cursor: "default" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontFamily: fonts.mono, fontWeight: 700 }}>
            {symbol}
          </span>
          <button
            style={styles.removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(symbol);
            }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: colors.down, marginTop: 10 }}>
          Failed to load
        </div>
        <button onClick={refetch} style={{ ...styles.addBtn, marginTop: 10 }}>
          Retry
        </button>
      </div>
    );
  }

  const up = s.change_usd >= 0;
  return (
    <div
      onClick={() => onSelect(symbol)}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={{
        ...styles.stockCard,
        ...(hovered || active ? styles.stockCardHover : {}),
      }}
    >
      <button
        style={styles.removeBtn}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(symbol);
        }}
      >
        <X size={15} />
      </button>
      <div style={styles.stockCardTop}>
        <div>
          <div style={styles.stockCardSymbol}>{symbol}</div>
          <div style={styles.stockCardName}>{s.name}</div>
          <div style={styles.stockCardSector}>{s.sector}</div>
          {isFallback && (
            <div
              style={{
                ...styles.stockCardSector,
                color: colors.amber,
                background: `${colors.amber}1A`,
                marginLeft: 6,
              }}
            >
              sample
            </div>
          )}
        </div>
      </div>
      <div style={styles.stockCardPrice}>{formatInr(toInr(s.price_usd))}</div>
      <div
        style={{
          ...styles.stockCardChange,
          color: up ? colors.up : colors.down,
        }}
      >
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {up ? "+" : ""}
        {s.change_pct}%
      </div>
      <div style={styles.stockCardChart}>
        <Sparkline history={s.history} up={up} />
      </div>
    </div>
  );
}

// ============================================================
// PAGE 2 — PREDICTION
// ============================================================

function PredictionPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("NVDA");

  const results = useSearch(query);
  const quote = useStockQuote(selected);
  const prediction = useStockPrediction(selected);

  function handleSelect(ticker) {
    setSelected(ticker);
    setQuery("");
  }

  function retryAll() {
    quote.refetch();
    prediction.refetch();
  }

  const loading = quote.loading || prediction.loading;
  const error = quote.error || prediction.error;
  const stock = quote.data;
  const pred = prediction.data;
  const isPosReturn = pred ? pred.expected_return_pct >= 0 : true;
  const isFallback = quote.isFallback || prediction.isFallback;

  return (
    <div>
      <SearchBox
        query={query}
        setQuery={setQuery}
        results={results}
        onSelect={handleSelect}
        placeholder="Search a stock to see its prediction (e.g. Netflix, TSLA)…"
      />

      <div style={styles.predBigCard}>
        {loading && <PredictionSkeleton />}
        {!loading && error && <ErrorState message={error} onRetry={retryAll} />}
        {!loading && !error && stock && pred && (
          <>
            {isFallback && <FallbackBadge />}
            <div style={styles.predHeaderRow}>
              <div>
                <div style={styles.predSymbol}>{selected}</div>
                <div style={styles.predName}>{stock.name}</div>
                <div style={styles.predSector}>{stock.sector}</div>
              </div>
              <div>
                <span
                  style={{
                    ...styles.riskBadge,
                    color: riskColor(pred.risk),
                    background: `${riskColor(pred.risk)}1A`,
                  }}
                >
                  {pred.risk} risk
                </span>
              </div>
            </div>

            <div style={styles.predPriceGrid} className="pred-price-grid">
              <div style={styles.predPriceBox}>
                <div style={styles.predPriceLabel}>TODAY</div>
                <div style={styles.predPriceValue}>
                  {formatInr(toInr(pred.price_usd))}
                </div>
              </div>
              <div style={styles.predPriceBox}>
                <div style={styles.predPriceLabel}>PREDICTED (TOMORROW)</div>
                <div style={{ ...styles.predPriceValue, color: colors.amber }}>
                  {formatInr(toInr(pred.predicted_usd))}
                </div>
              </div>
              <div style={styles.predPriceBox}>
                <div style={styles.predPriceLabel}>EXPECTED RETURN</div>
                <div
                  style={{
                    ...styles.predPriceValue,
                    color: isPosReturn ? colors.up : colors.down,
                  }}
                >
                  {isPosReturn ? "+" : ""}
                  {pred.expected_return_pct}%
                </div>
              </div>
            </div>

            <div style={styles.predLower} className="pred-lower-grid">
              <div>
                <div style={styles.sectionLabel}>WHY THIS PREDICTION</div>
                {pred.features.map((f) => (
                  <div key={f.label} style={styles.featureBarRow}>
                    <div style={styles.featureBarTop}>
                      <span style={{ color: colors.overview }}>{f.label}</span>
                      <span
                        style={{
                          fontFamily: fonts.mono,
                          color: colors.textDim,
                        }}
                      >
                        {f.pct}%
                      </span>
                    </div>
                    <div style={styles.featureBarTrack}>
                      <div
                        style={{ ...styles.featureBarFill, width: `${f.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p style={{ ...styles.explanationText, marginTop: 10 }}>
                  {stock.overview}
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div
                  style={{
                    ...styles.predPriceBox,
                    textAlign: "center",
                    padding: 12,
                  }}
                >
                  <ConfidenceDial value={pred.confidence} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PredictionSkeleton() {
  return (
    <div>
      <div style={styles.predHeaderRow}>
        <div>
          <SkeletonBlock width={120} height={28} style={{ marginBottom: 8 }} />
          <SkeletonBlock width={160} height={14} style={{ marginBottom: 6 }} />
          <SkeletonBlock width={200} height={12} />
        </div>
        <SkeletonBlock width={90} height={30} style={{ borderRadius: 8 }} />
      </div>
      <div style={styles.predPriceGrid} className="pred-price-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} style={styles.predPriceBox}>
            <SkeletonBlock
              width={70}
              height={11}
              style={{ margin: "0 auto 10px" }}
            />
            <SkeletonBlock
              width={100}
              height={26}
              style={{ margin: "0 auto" }}
            />
          </div>
        ))}
      </div>
      <div style={styles.predLower} className="pred-lower-grid">
        <div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.featureBarRow}>
              <SkeletonBlock height={8} style={{ marginBottom: 6 }} />
            </div>
          ))}
        </div>
        <SkeletonBlock height={160} />
      </div>
    </div>
  );
}

// ============================================================
// APP SHELL
// ============================================================

export default function App() {
  const [page, setPage] = useState("market");

  return (
    <div style={styles.app} className="app-shell">
      <style>{fontImports}</style>

      <div style={styles.header} className="header-row">
        <Logo />
        <div style={styles.marketStatus} className="market-status-block">
          <div>NYSE · OPEN</div>
          <div style={styles.statusLive}>● streaming</div>
        </div>
      </div>

      <div style={styles.navTabs} className="nav-tabs-row">
        <button
          style={{
            ...styles.navTab,
            ...(page === "market" ? styles.navTabActive : {}),
          }}
          onClick={() => setPage("market")}
        >
          Today's Market
        </button>
        <button
          style={{
            ...styles.navTab,
            ...(page === "prediction" ? styles.navTabActive : {}),
          }}
          onClick={() => setPage("prediction")}
        >
          AI Prediction
        </button>
      </div>

      {page === "market" ? <MarketPage /> : <PredictionPage />}

      <div style={styles.footerNote}>
        Sample data for layout purposes — not investment advice. Live values
        will replace these once the FastAPI + yfinance pipeline is connected.
      </div>
    </div>
  );
}
