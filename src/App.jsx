import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip, Legend
} from 'chart.js'
import { fetchQuote, getDemoQuote } from './utils/api'
import { useLocalStorage } from './hooks/useLocalStorage'
import MetricCard from './components/MetricCard'
import Watchlist from './components/Watchlist'
import SpendingChart from './components/SpendingChart'
import MortgageCalc from './components/MortgageCalc'
import styles from './App.module.css'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

const DEFAULT_HOLDINGS = [
  { symbol: 'AAPL', shares: 5, costBasis: 165 },
  { symbol: 'NVDA', shares: 3, costBasis: 480 },
  { symbol: 'MSFT', shares: 4, costBasis: 370 },
  { symbol: 'BHP',  shares: 20, costBasis: 42 },
]

const MARKET_TICKERS = ['AAPL', 'NVDA', 'MSFT', 'BHP']

export default function App() {
  const [holdings, setHoldings] = useLocalStorage('holdings', DEFAULT_HOLDINGS)
  const [quotes, setQuotes] = useState({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const allSymbols = [...new Set([...holdings.map(h => h.symbol), ...MARKET_TICKERS])]

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const results = {}
    await Promise.all(
      allSymbols.map(async sym => {
        try {
          results[sym] = await fetchQuote(sym)
        } catch {
          results[sym] = getDemoQuote(sym)
        }
      })
    )
    setQuotes(results)
    setLastUpdated(new Date())
    setLoading(false)
  }, [allSymbols.join(',')])

  useEffect(() => { fetchAll() }, [])

  function addHolding(h) {
    setHoldings(prev => {
      if (prev.find(x => x.symbol === h.symbol)) return prev
      return [...prev, h]
    })
  }

  function removeHolding(symbol) {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol))
  }

  const marketCards = [
    { label: 'Apple (AAPL)', sym: 'AAPL' },
    { label: 'NVIDIA (NVDA)', sym: 'NVDA' },
    { label: 'Microsoft (MSFT)', sym: 'MSFT' },
    { label: 'BHP Group (BHP)', sym: 'BHP' },
  ]

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="10" width="3" height="8" rx="1" fill="#185FA5"/>
              <rect x="7" y="6" width="3" height="12" rx="1" fill="#1D9E75"/>
              <rect x="12" y="2" width="3" height="16" rx="1" fill="#185FA5"/>
              <rect x="17" y="7" width="3" height="11" rx="1" fill="#BA7517"/>
            </svg>
            <span className={styles.logoText}>FinDash</span>
          </div>
          <nav className={styles.nav}>
            {['overview', 'portfolio', 'mortgage'].map(tab => (
              <button
                key={tab}
                className={`${styles.navBtn} ${activeTab === tab ? styles.navActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.headerRight}>
          {lastUpdated && (
            <span className={styles.updated}>
              Updated {lastUpdated.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button className={styles.refreshBtn} onClick={fetchAll} disabled={loading}>
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {(activeTab === 'overview' || activeTab === 'portfolio') && (
          <>
            <section>
              <p className={styles.sectionLabel}>Market snapshot</p>
              <div className={styles.metricGrid}>
                {marketCards.map(({ label, sym }) => {
                  const q = quotes[sym]
                  const up = q ? q.changePct >= 0 : true
                  return (
                    <MetricCard
                      key={sym}
                      label={label}
                      value={q ? `$${q.price.toFixed(2)}` : '—'}
                      sub={q ? `${up ? '▲' : '▼'} ${Math.abs(q.changePct).toFixed(2)}% today` : 'loading…'}
                      subClass={q ? (up ? 'up' : 'down') : ''}
                    />
                  )
                })}
              </div>
            </section>

            <div className={styles.twoCol}>
              <div className={styles.card}>
                <p className={styles.sectionLabel}>Portfolio watchlist</p>
                <Watchlist
                  holdings={holdings}
                  quotes={quotes}
                  loading={loading}
                  onAdd={addHolding}
                  onRemove={removeHolding}
                />
              </div>
              <div className={styles.card}>
                <p className={styles.sectionLabel}>Monthly spending</p>
                <SpendingChart />
              </div>
            </div>
          </>
        )}

        {activeTab === 'mortgage' && (
          <div className={styles.card} style={{ maxWidth: 700 }}>
            <p className={styles.sectionLabel}>Mortgage calculator</p>
            <MortgageCalc />
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        Data via Alpha Vantage free tier · Demo values shown when API key not set ·{' '}
        <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer">
          Get a free API key
        </a>
        {' '}· Add <code>VITE_ALPHA_VANTAGE_KEY=yourkey</code> to <code>.env</code>
      </footer>
    </div>
  )
}
