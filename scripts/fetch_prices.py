#!/usr/bin/env python3
"""Download real tomato prices from data.gov.in (Agmarknet) into public/data/.

Needs a free key from https://data.gov.in (My Account > Generate API key):
    DATA_GOV_API_KEY=xxxx python scripts/fetch_prices.py            # today's prices
    DATA_GOV_API_KEY=xxxx python scripts/fetch_prices.py --backfill # + 10-year monthly history

Markets with no fresh record keep their previous values, and meta.source then
becomes "mixed" so the site never presents old sample rows as real.
"""
import argparse
import json
import os
import sys
import time
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

import requests

DATA = Path(__file__).resolve().parent.parent / "public" / "data"
API = "https://api.data.gov.in/resource/"
CURRENT = "9ef84268-d588-465a-a308-a864a43d0070"   # Current daily price of various commodities
HISTORIC = "35985678-0d79-46b4-9ed6-6f13308a1d24"  # Variety-wise daily market prices

# Our market id -> lowercase fragments that identify it in the Agmarknet market name.
MATCH = {
    "madanapalle": ["madanapalli", "madanapalle"], "kolar": ["kolar"], "anantapur": ["anantapur"],
    "chittoor": ["chittoor"], "bengaluru": ["bangalore", "bengaluru", "binny mill"],
    "pune": ["pune"], "nashik": ["nasik", "nashik"], "delhi": ["azadpur"],
}


class FetchError(Exception):
    pass


def load_dotenv():
    """Read DATA_GOV_API_KEY from a .env file in the project folder, if one exists."""
    path = DATA.parent.parent / ".env"
    if os.environ.get("DATA_GOV_API_KEY") or not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        name, _, value = line.partition("=")
        if name.strip() == "DATA_GOV_API_KEY" and value.strip():
            os.environ["DATA_GOV_API_KEY"] = value.strip().strip('"').strip("'")


def get(resource, key, params):
    """Yield every record, paging through the API."""
    offset = 0
    while True:
        try:
            # data.gov.in stalls requests that use the default python-requests user agent.
            r = requests.get(API + resource, timeout=60, headers={"User-Agent": "TomatoMandi/1.0"}, params={
                "api-key": key, "format": "json", "limit": 500, "offset": offset, **params})
            r.raise_for_status()
        except requests.RequestException as err:
            # The request URL carries the key, so report the failure without it.
            status = err.response.status_code if err.response is not None else "no response"
            raise FetchError(f"data.gov.in request failed: {type(err).__name__} ({status})") from None
        records = r.json().get("records", [])
        yield from records
        if len(records) < 500:
            return
        offset += 500
        time.sleep(0.5)


def field(row, *names):
    lower = {k.lower(): v for k, v in row.items()}
    for n in names:
        if n in lower and lower[n] not in (None, ""):
            return lower[n]
    return None


def market_id(name):
    name = (name or "").lower()
    return next((mid for mid, keys in MATCH.items() if any(k in name for k in keys)), None)


def parse_date(text):
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(str(text)[:10], fmt).date()
        except ValueError:
            pass
    return None


def per_kg(value):
    """Agmarknet quotes rupees per quintal (100 kg)."""
    return round(float(value) / 100, 1)


def update_daily(key):
    path = DATA / "prices_daily.json"
    doc = json.loads(path.read_text(encoding="utf-8"))
    latest = {}
    for row in get(CURRENT, key, {"filters[commodity]": "Tomato"}):
        mid = market_id(field(row, "market"))
        day = parse_date(field(row, "arrival_date"))
        if mid and day and (mid not in latest or day > latest[mid][0]):
            latest[mid] = (day, row)

    fresh = 0
    for m in doc["markets"]:
        if m["id"] not in latest:
            continue
        day, row = latest[m["id"]]
        modal = per_kg(field(row, "modal_price", "modal_x0020_price"))
        m["history"] = [h for h in m["history"] if h["date"] != day.isoformat()]
        # Compare only against earlier real prices, never sample ones. With none yet, the
        # change is unknown (null), and the site shows a dash instead of a made-up move.
        real_days = [h for h in m["history"] if h.get("real")]
        previous = real_days[-1]["modal"] if real_days else None
        cutoff = (day - timedelta(days=7)).isoformat()
        week_ago = next((h["modal"] for h in reversed(real_days) if h["date"] <= cutoff), None)
        pct = lambda old: round((modal / old - 1) * 100, 1) if old else None
        m["history"] = (m["history"] + [{"date": day.isoformat(), "modal": modal, "real": True}])[-56:]
        m.update(min=per_kg(field(row, "min_price", "min_x0020_price")),
                 max=per_kg(field(row, "max_price", "max_x0020_price")), modal=modal,
                 changePct=pct(previous), weekChangePct=pct(week_ago), real=True)
        tonnes = field(row, "arrivals_tonnes", "arrivals", "arrival_quantity")
        if tonnes is not None:
            m.update(arrivals=round(float(tonnes)), realArrivals=True)
            m["arrivalsChangePct"] = round((m["arrivals"] / m["arrivalsCapacity"] - 1) * 100)
        fresh += 1

    real = sum(1 for m in doc["markets"] if m.get("real"))
    # Prices alone are not enough: the badge says "Agmarknet" only if arrivals are real too.
    complete = all(m.get("real") and m.get("realArrivals") for m in doc["markets"])
    source = "agmarknet" if complete else "mixed" if real else "sample"
    doc["meta"] = {"source": source, "asOf": date.today().isoformat(),
                   "note": "Agmarknet via data.gov.in. Arrivals are kept from earlier data where the feed has none."}
    path.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Updated {fresh} of {len(doc['markets'])} markets; source={source}")


def backfill(key):
    totals = defaultdict(lambda: defaultdict(list))
    end = date.today()
    day = end - timedelta(days=3650)
    while day < end:
        month = day.strftime("%Y-%m")
        for offset in (1, 8, 15, 22):  # four sample days a month keeps this inside API limits
            when = day.replace(day=offset).strftime("%d/%m/%Y")
            try:
                for row in get(HISTORIC, key, {"filters[Commodity]": "Tomato", "filters[Arrival_Date]": when}):
                    mid = market_id(field(row, "market"))
                    price = field(row, "modal_price", "modal_x0020_price")
                    if mid and price:
                        totals[mid][month].append(per_kg(price))
            except FetchError as err:
                print("skip", when, err, file=sys.stderr)
        day = (day.replace(day=1) + timedelta(days=32)).replace(day=1)

    path = DATA / "prices_monthly_10y.json"
    doc = json.loads(path.read_text(encoding="utf-8"))
    for mid, months in totals.items():
        doc["series"][mid] = [{"month": k, "price": round(sum(v) / len(v), 1)} for k, v in sorted(months.items())]
    complete = all(mid in totals for mid in doc["series"])
    doc["meta"] = {"source": "agmarknet" if complete else "mixed" if totals else "sample",
                   "asOf": date.today().isoformat(), "note": "Monthly averages from sampled Agmarknet days."}
    path.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Backfilled {len(totals)} markets; source={doc['meta']['source']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backfill", action="store_true", help="also rebuild the 10-year monthly file (slow)")
    args = parser.parse_args()
    load_dotenv()
    api_key = os.environ.get("DATA_GOV_API_KEY")
    if not api_key:
        sys.exit("Set DATA_GOV_API_KEY first, or put it in a .env file. Get a free key at https://data.gov.in")
    try:
        update_daily(api_key)
        if args.backfill:
            backfill(api_key)
    except FetchError as err:
        sys.exit(str(err))
