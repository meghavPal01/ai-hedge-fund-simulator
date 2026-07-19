"""
IMPORTANT: this is a lightweight, rule-based heuristic — NOT a trained ML
model. It combines a few real technical indicators (momentum, RSI, MACD
histogram, volume trend) into a bounded next-day return estimate, so the
frontend has something real to render while you build out the actual
XGBoost / LightGBM / LSTM models from the project roadmap.

Treat the "confidence" and "expected_return_pct" here as illustrative, not
as investment advice or a validated forecast.
"""

from __future__ import annotations
 
import numpy as np
import pandas as pd
import yfinance as yf
 
from .cache import cached
 
 
def _get_history_6mo(symbol: str):
    def fetch():
        return yf.Ticker(symbol).history(period="6mo")
    return cached(f"history:{symbol}:6mo", ttl_seconds=300, fn=fetch)
 
 
def _rsi(closes: pd.Series, period: int = 14) -> float:
    delta = closes.diff().dropna()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(period).mean().iloc[-1]
    avg_loss = loss.rolling(period).mean().iloc[-1]
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return float(round(100 - (100 / (1 + rs)), 2))
 
 
def _macd_histogram(closes: pd.Series) -> float:
    ema12 = closes.ewm(span=12, adjust=False).mean()
    ema26 = closes.ewm(span=26, adjust=False).mean()
    macd = ema12 - ema26
    signal = macd.ewm(span=9, adjust=False).mean()
    return float(round((macd - signal).iloc[-1], 4))
 
 
def predict(symbol: str) -> dict:
    hist = _get_history_6mo(symbol)
    if hist.empty or len(hist) < 30:
        raise ValueError(f"Not enough history for '{symbol}' to generate a prediction")
 
    closes = hist["Close"]
    returns = closes.pct_change().dropna()
    volatility = float(returns.std() * np.sqrt(252))  # annualized
 
    momentum = float(closes.iloc[-1] / closes.iloc[-6] - 1) if len(closes) > 6 else 0.0
    rsi = _rsi(closes)
    macd_hist = _macd_histogram(closes)
    vol_ratio = float(hist["Volume"].iloc[-5:].mean() / hist["Volume"].mean())
 
    # Combine signals into a bounded (-1, 1) score, then cap the implied
    # next-day move at +/-3% so the heuristic doesn't produce wild numbers.
    signal_strength = float(np.tanh(momentum * 4 + macd_hist * 8 + (rsi - 50) / 100))
    expected_return_pct = round(signal_strength * 3, 2)
 
    price = round(float(closes.iloc[-1]), 2)
    predicted = round(price * (1 + expected_return_pct / 100), 2)
 
    # Confidence: higher when indicators agree strongly and volatility is contained.
    agreement = abs(signal_strength)
    vol_penalty = min(volatility / 0.6, 1.0)  # 60%+ annualized vol = heavy penalty
    confidence = round(max(35, min(96, 55 + agreement * 40 - vol_penalty * 20)))
 
    if volatility < 0.30:
        risk = "Low"
    elif volatility < 0.55:
        risk = "Moderate"
    else:
        risk = "High"
 
    raw_features = {
        "Momentum": abs(momentum) * 100,
        "RSI": abs(rsi - 50),
        "MACD": abs(macd_hist) * 500,
        "Volume": abs(vol_ratio - 1) * 100,
    }
    total = sum(raw_features.values()) or 1.0
    features = [
        {"label": label, "pct": round(weight / total * 100)}
        for label, weight in sorted(raw_features.items(), key=lambda kv: -kv[1])
    ]
 
    return {
        "symbol": symbol.upper(),
        "price_usd": price,
        "predicted_usd": predicted,
        "expected_return_pct": expected_return_pct,
        "confidence": confidence,
        "risk": risk,
        "features": features,
    }