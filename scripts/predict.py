#!/usr/bin/env python3
"""Build public/data/forecast.json: a 4-week Madanapalle price estimate.

Model: month-of-year seasonal index from the 10-year monthly history, plus a
linear trend (scikit-learn) fitted to the last 8 weeks of deseasonalised prices.
The band widens with the horizon, from the fit's residual spread and the
historical month-to-month volatility. It is a rough estimate, not advice.

Usage: pip install -r scripts/requirements.txt && python scripts/predict.py
"""
import json
from datetime import timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

DATA = Path(__file__).resolve().parent.parent / "public" / "data"
MARKET = "madanapalle"


def main():
    daily = json.loads((DATA / "prices_daily.json").read_text(encoding="utf-8"))
    monthly = json.loads((DATA / "prices_monthly_10y.json").read_text(encoding="utf-8"))

    m = pd.DataFrame(monthly["series"][MARKET])
    m["month"] = pd.to_datetime(m["month"])
    # Median by calendar month so one spike year does not define the season.
    by_month = m.groupby(m["month"].dt.month)["price"].median()
    seasonal = by_month / by_month.mean()

    def season(day):
        """Blend neighbouring months so the index has no jump at a month boundary."""
        offset = (day.day - 15) / 30
        other = (day.month - 1 + (1 if offset >= 0 else -1)) % 12 + 1
        return seasonal[day.month] * (1 - abs(offset)) + seasonal[other] * abs(offset)

    market = next(x for x in daily["markets"] if x["id"] == MARKET)
    d = pd.DataFrame(market["history"])
    d["date"] = pd.to_datetime(d["date"])
    weekly = d.set_index("date")["modal"].resample("7D", origin="end").mean().dropna().tail(8)

    idx = np.array([season(i) for i in weekly.index])
    x = np.arange(len(weekly)).reshape(-1, 1)
    y = np.log(weekly.to_numpy() / idx)
    fit = LinearRegression().fit(x, y)
    resid = float(np.std(y - fit.predict(x), ddof=2))
    vol = float(np.log(m["price"]).diff().abs().median()) / 2

    # Recent trends rarely persist at full strength, so damp each step.
    slope, damp = float(fit.coef_[0]), 0.75
    level = float(fit.predict(x[-1:])[0])
    last_date = d["date"].max()
    forecast, step = [], 0.0
    for h in range(1, 5):
        step += slope * damp**h
        day = last_date + timedelta(days=7 * h)
        centre = np.exp(level + step) * season(day)
        band = (resid + vol) * np.sqrt(h) * 1.28  # roughly an 80% band
        forecast.append({
            "date": day.date().isoformat(),
            "price": round(float(centre), 1),
            "lo": round(float(centre * np.exp(-band)), 1),
            "hi": round(float(centre * np.exp(band)), 1),
        })

    payload = {
        "meta": {**daily["meta"], "model": "seasonal index + damped linear trend"},
        "market": MARKET,
        "history": [{"date": i.date().isoformat(), "price": round(float(v), 1)} for i, v in weekly.items()],
        "forecast": forecast,
    }
    (DATA / "forecast.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("Forecast:", [f["price"] for f in forecast])


if __name__ == "__main__":
    main()
