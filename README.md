# FinDash — Personal Finance Dashboard

A full-featured personal finance dashboard built with **React + Vite**. Tracks live stock prices, visualises monthly spending, and includes a full mortgage/loan calculator with amortisation schedule.

![Dashboard screenshot](https://via.placeholder.com/800x400?text=FinDash+Screenshot)

## Features

- **Live market data** via [Alpha Vantage](https://www.alphavantage.co/) free API
- **Portfolio watchlist** — add/remove tickers, track shares and cost basis, see real-time P&L
- **Spending tracker** — interactive doughnut chart, editable categories, persists to localStorage
- **Mortgage calculator** — PMT formula, full amortisation schedule table, balance-over-time chart
- **Dark mode** — automatic via `prefers-color-scheme`
- **Persistent state** — watchlist and spending categories saved to localStorage

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Charts | Chart.js + react-chartjs-2 |
| Market data | Alpha Vantage REST API |
| Styling | CSS Modules |
| State | React hooks + localStorage |

## Getting started

```bash
# 1. Clone
git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard

# 2. Install dependencies
npm install

# 3. Add your free API key (optional — demo data works without it)
cp .env.example .env
# Edit .env and paste your Alpha Vantage key

# 4. Run locally
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API key setup

The app uses **Alpha Vantage** for live stock prices. The free tier gives you 25 requests/day — enough for personal use.

1. Get a free key at [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Copy `.env.example` to `.env`
3. Set `VITE_ALPHA_VANTAGE_KEY=your_key_here`

Without a key, the app falls back to demo/cached data so you can still explore all features.

## Project structure

```
src/
├── components/
│   ├── MetricCard.jsx      # Reusable stat card
│   ├── Watchlist.jsx       # Portfolio tracker with add/remove
│   ├── SpendingChart.jsx   # Editable doughnut chart
│   └── MortgageCalc.jsx    # Calculator + amortisation table
├── hooks/
│   └── useLocalStorage.js  # Persistent state hook
├── utils/
│   ├── api.js              # Alpha Vantage API calls
│   └── format.js           # Currency/number formatters + PMT formula
└── App.jsx                 # Root layout and data fetching
```

## Deployment

```bash
npm run build   # outputs to dist/
```

Deploy the `dist/` folder to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or GitHub Pages.

## License

MIT
