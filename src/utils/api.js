/**
 * Alpha Vantage free API — 25 requests/day on free tier.
 * Get your free key at: https://www.alphavantage.co/support/#api-key
 *
 * Yahoo Finance fallback uses a CORS proxy for client-side requests.
 * For production, move API calls to a small Express/Node backend.
 */

const AV_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo'

/**
 * Fetch a stock quote from Alpha Vantage.
 * Returns { price, change, changePct, volume, high, low, open }
 */
export async function fetchQuote(symbol) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  const q = data['Global Quote']
  if (!q || !q['05. price']) throw new Error(`No data for ${symbol}`)
  return {
    symbol,
    price: parseFloat(q['05. price']),
    open: parseFloat(q['02. open']),
    high: parseFloat(q['03. high']),
    low: parseFloat(q['04. low']),
    change: parseFloat(q['09. change']),
    changePct: parseFloat(q['10. change percent']),
    volume: parseInt(q['06. volume']),
  }
}

/**
 * Fetch intraday time series for sparkline/chart.
 * Returns array of { time, price }
 */
export async function fetchIntraday(symbol, interval = '60min') {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${AV_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  const series = data[`Time Series (${interval})`]
  if (!series) throw new Error(`No intraday data for ${symbol}`)
  return Object.entries(series)
    .slice(0, 24)
    .reverse()
    .map(([time, v]) => ({ time, price: parseFloat(v['4. close']) }))
}

/**
 * Fetch FX rate (e.g. AUD/USD).
 */
export async function fetchFX(from, to) {
  const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${AV_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  const rate = data['Realtime Currency Exchange Rate']
  if (!rate) throw new Error(`No FX data for ${from}/${to}`)
  return {
    from,
    to,
    rate: parseFloat(rate['5. Exchange Rate']),
    bid: parseFloat(rate['8. Bid Price']),
    ask: parseFloat(rate['9. Ask Price']),
  }
}

/**
 * Fallback: demo quotes used when API key is 'demo' or rate-limited.
 * Replace with real data by adding VITE_ALPHA_VANTAGE_KEY to your .env
 */
export function getDemoQuote(symbol) {
  const demos = {
    AAPL:  { symbol:'AAPL',  price:189.84, change:2.14,  changePct:1.14,  high:190.2, low:187.1, volume:54200000 },
    NVDA:  { symbol:'NVDA',  price:875.40, change:12.30, changePct:1.42,  high:880.0, low:860.0, volume:42100000 },
    MSFT:  { symbol:'MSFT',  price:415.20, change:-1.80, changePct:-0.43, high:418.0, low:413.0, volume:18300000 },
    GOOGL: { symbol:'GOOGL', price:171.50, change:0.90,  changePct:0.53,  high:172.0, low:169.5, volume:21000000 },
    TSLA:  { symbol:'TSLA',  price:162.30, change:-4.50, changePct:-2.70, high:168.0, low:161.0, volume:88000000 },
    BHP:   { symbol:'BHP',   price:44.80,  change:0.30,  changePct:0.67,  high:45.1,  low:44.3,  volume:6200000  },
  }
  return demos[symbol] || { symbol, price: 100, change: 0, changePct: 0, high: 101, low: 99, volume: 1000000 }
}
