import { useState } from 'react'
import { fmt } from '../utils/format'
import styles from './Watchlist.module.css'

export default function Watchlist({ holdings, quotes, loading, onAdd, onRemove }) {
  const [input, setInput] = useState('')
  const [sharesInput, setSharesInput] = useState('')
  const [costInput, setCostInput] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const sym = input.trim().toUpperCase()
    if (!sym) return
    onAdd({ symbol: sym, shares: parseFloat(sharesInput) || 1, costBasis: parseFloat(costInput) || 0 })
    setInput(''); setSharesInput(''); setCostInput('')
  }

  const totalValue = holdings.reduce((sum, h) => {
    const q = quotes[h.symbol]
    return sum + (q ? q.price * h.shares : h.costBasis * h.shares)
  }, 0)

  const totalCost = holdings.reduce((sum, h) => sum + h.costBasis * h.shares, 0)
  const totalGain = totalValue - totalCost
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div>
          <div className={styles.summLabel}>Portfolio value</div>
          <div className={styles.summValue}>{fmt.usd(totalValue, 0)}</div>
        </div>
        <div className={totalGain >= 0 ? styles.up : styles.down}>
          {fmt.pct(totalGainPct)} all-time
        </div>
      </div>

      {loading && <div className={styles.loading}>Fetching prices...</div>}

      <div className={styles.list}>
        {holdings.map(h => {
          const q = quotes[h.symbol]
          const price = q ? q.price : h.costBasis
          const change = q ? q.changePct : 0
          const value = price * h.shares
          const gain = q ? (q.price - h.costBasis) * h.shares : 0
          const up = change >= 0
          return (
            <div key={h.symbol} className={styles.row}>
              <div className={styles.left}>
                <span className={styles.sym}>{h.symbol}</span>
                <span className={styles.shares}>{h.shares} shares</span>
              </div>
              <div className={styles.right}>
                <div className={styles.price}>{fmt.usd(price)}</div>
                <div className={`${styles.badge} ${up ? styles.badgeUp : styles.badgeDn}`}>
                  {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                </div>
              </div>
              <button className={styles.removeBtn} onClick={() => onRemove(h.symbol)} title="Remove">×</button>
            </div>
          )
        })}
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          className={styles.input}
          placeholder="Ticker (e.g. AAPL)"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Shares"
          type="number"
          value={sharesInput}
          onChange={e => setSharesInput(e.target.value)}
          style={{ width: 70 }}
        />
        <input
          className={styles.input}
          placeholder="Cost $"
          type="number"
          value={costInput}
          onChange={e => setCostInput(e.target.value)}
          style={{ width: 80 }}
        />
        <button className={styles.addBtn} type="submit">+ Add</button>
      </form>
    </div>
  )
}
