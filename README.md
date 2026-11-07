# Tomato Mandi

Tomato prices, cultivation guides and market tools, centred on Madanapalle, Andhra Pradesh. In English and Telugu, built only with free tools.

**All prices in this repo are sample data until you load real data.** Every chart shows a "Sample data" badge while that is true.

## Run it

Needs Node 20 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints. `npm run build` makes the production site in `dist/`.

## Load real prices

The site only reads JSON files in `public/data/`, so it stays static and free.

1. Get a free API key at [data.gov.in](https://data.gov.in) (My Account, then Generate API key).
2. Install the Python packages: `pip install -r scripts/requirements.txt`
3. Fetch prices and rebuild the forecast:

```bash
DATA_GOV_API_KEY=your_key python scripts/fetch_prices.py
python scripts/predict.py
```

Add `--backfill` to `fetch_prices.py` once to replace the 10-year history. It is slow, since it samples four days a month across ten years.

The badge changes by itself: `Sample data` becomes `Partly sample data` while some markets are still sample, then `Agmarknet` once all are real. Arrivals count too: if the feed has no arrival figures, the badge stays at `Partly sample data`, because those numbers are still sample.

| File | What it holds | Made by |
| --- | --- | --- |
| `prices_daily.json` | Today's prices, arrivals, last 56 days | `fetch_prices.py` |
| `prices_monthly_10y.json` | Monthly averages per market | `fetch_prices.py --backfill` |
| `forecast.json` | 4-week Madanapalle estimate | `predict.py` |
| `traders.json` | Traders and truck rates | Edit by hand |

`scripts/generate_sample_data.py` recreates the sample files.

### Updating prices from your PC

data.gov.in refuses connections from outside India, and GitHub's servers are in the US, so prices have to be fetched from a PC in India.

1. Create a file named `.env` in the project folder containing `DATA_GOV_API_KEY=your_key`. It is never committed.
2. Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\update_prices.ps1
```

It fetches prices, rebuilds the forecast and pushes the new data, and Vercel then redeploys the site. To refresh daily, schedule it in Windows Task Scheduler.

`.github/workflows/update-prices.yml` still runs every evening. It skips with a notice when there is no key or when data.gov.in refuses GitHub's servers, and it works by itself if that block is ever lifted.

## Replace before going public

- `public/data/traders.json` holds placeholder names only. Add verified agents, with their permission.
- Farmer stories in the Learn page are invented examples and are labelled that way. Replace them with real stories, with each farmer's permission.
- The Telugu text should be read by a native speaker, ideally someone who knows farming terms.
- Crop figures, scheme details and treatments are general guidance. Have an agriculture officer review them.

## Deploy for free

The site is static, and `vercel.json` and `public/_redirects` make page links work on refresh.

- **Vercel:** import the repo at [vercel.com](https://vercel.com). It detects Vite, so no settings are needed.
- **Netlify:** import the repo, with build command `npm run build` and publish directory `dist`.
- **GitHub Pages:** works too, but needs a `base` in `vite.config.ts` and a `404.html` copy of `index.html`.

## Where things are

```
public/data/          price JSON files
scripts/              fetch_prices.py, predict.py, generate_sample_data.py
src/components/       Navbar and layout, cards, gauge, charts, maps
src/components/three/ the 3D farm, all procedural geometry
src/pages/            one file per page
src/locales/          en.json and te.json, which hold all the text
src/data/             non-text facts: varieties, calendar, schemes
src/hooks/            useWeather, usePrices
```

Add `?static` to the address to preview the fallback shown on phones without WebGL or with little memory.

## Credits

Weather from [Open-Meteo](https://open-meteo.com). Map tiles from [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Price data from Agmarknet via data.gov.in. OpenStreetMap's public tiles suit light use, so move to a free tile host if traffic grows.
