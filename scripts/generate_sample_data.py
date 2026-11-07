#!/usr/bin/env python3
"""Generate clearly labelled SAMPLE price data so the site works before real data is loaded.

Every number here is synthetic. The files carry meta.source = "sample" and the
frontend shows a "Sample data" badge on every chart while that is the case.
Run scripts/fetch_prices.py to replace them with real Agmarknet data.

Usage: python scripts/generate_sample_data.py
"""
import json
import math
import random
from datetime import date, timedelta
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "data"
TODAY = date.today()
rng = random.Random(1947)

# id, name, state, lat, lon, price factor vs Madanapalle, typical arrivals (tonnes), grade
MARKETS = [
    ("madanapalle", "Madanapalle", "Andhra Pradesh", 13.5503, 78.5029, 1.00, 620, "A"),
    ("kolar", "Kolar", "Karnataka", 13.1360, 78.1290, 1.08, 540, "A"),
    ("anantapur", "Anantapur", "Andhra Pradesh", 14.6819, 77.6006, 0.96, 180, "B"),
    ("chittoor", "Chittoor", "Andhra Pradesh", 13.2172, 79.1003, 0.98, 150, "B"),
    ("bengaluru", "Bengaluru", "Karnataka", 12.9716, 77.5946, 1.22, 410, "A"),
    ("pune", "Pune", "Maharashtra", 18.5204, 73.8567, 1.18, 330, "A"),
    ("nashik", "Nashik", "Maharashtra", 19.9975, 73.7898, 1.05, 390, "B"),
    ("delhi", "Delhi (Azadpur)", "Delhi", 28.7186, 77.1740, 1.45, 480, "A"),
]

# Seasonal shape of wholesale prices, Jan..Dec (rupees per kg)
SEASON = [11, 10, 10, 12, 16, 24, 30, 24, 16, 15, 17, 13]
# Stylised year/month shocks so the history has spikes and crashes to read.
SHOCKS = {(2017, 7): 3.1, (2017, 8): 2.0, (2019, 11): 2.0, (2020, 10): 1.9, (2021, 11): 2.8,
          (2022, 6): 2.5, (2023, 6): 2.6, (2023, 7): 4.8, (2023, 8): 3.4, (2023, 9): 0.45,
          (2023, 10): 0.5, (2018, 2): 0.5, (2020, 4): 0.55, (2024, 7): 2.0, (2025, 3): 0.6}


def write(name, payload):
    (OUT / name).write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def month_list(n):
    y, m = TODAY.year, TODAY.month
    out = []
    for _ in range(n):
        m -= 1
        if m == 0:
            y, m = y - 1, 12
        out.append((y, m))
    return out[::-1]


def monthly():
    months = month_list(120)
    base, noise = [], 0.0
    for y, m in months:
        noise = 0.55 * noise + rng.gauss(0, 0.12)
        inflation = 1 + 0.035 * (y - 2016)
        base.append(SEASON[m - 1] * inflation * SHOCKS.get((y, m), 1.0) * math.exp(noise))
    series = {}
    for market in MARKETS:
        factor = market[5]
        series[market[0]] = [
            {"month": f"{y}-{m:02d}", "price": round(b * factor * math.exp(rng.gauss(0, 0.05)), 1)}
            for (y, m), b in zip(months, base)
        ]
    return series


def daily():
    rows = []
    days = [TODAY - timedelta(days=i) for i in range(55, -1, -1)]
    # Shared path: a slow rise over the last few weeks, with day-to-day noise.
    path, level = [], 13.0
    for i, _ in enumerate(days):
        level += 0.13 + rng.gauss(0, 0.42) + (0.16 if i > 46 else 0)
        level = max(level, 8)
        path.append(level)
    for mid, name, state, lat, lon, factor, arrivals, grade in MARKETS:
        history = [{"date": d.isoformat(), "modal": round(p * factor * math.exp(rng.gauss(0, 0.025)), 1)}
                   for d, p in zip(days, path)]
        modal = history[-1]["modal"]
        week_ago = history[-8]["modal"]
        spread = 0.14 + rng.random() * 0.08
        arr_now = round(arrivals * (0.72 + rng.random() * 0.2))
        rows.append({
            "id": mid, "name": name, "state": state, "lat": lat, "lon": lon, "grade": grade,
            "min": round(modal * (1 - spread), 1), "max": round(modal * (1 + spread), 1), "modal": modal,
            "arrivals": arr_now, "arrivalsCapacity": arrivals,
            "arrivalsChangePct": round((arr_now / arrivals - 1) * 100),
            "changePct": round((modal / history[-2]["modal"] - 1) * 100, 1),
            "weekChangePct": round((modal / week_ago - 1) * 100, 1),
            "history": history,
        })
    return rows


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {"source": "sample", "asOf": TODAY.isoformat(),
            "note": "Synthetic sample data for layout and testing. Not real market prices."}
    write("prices_daily.json", {"meta": meta, "markets": daily()})
    write("prices_monthly_10y.json", {"meta": meta, "series": monthly()})
    print("Wrote sample data to", OUT)
