import { useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fmt } from '../utils/format'
import styles from './SpendingChart.module.css'

ChartJS.register(ArcElement, Tooltip)

const COLORS = ['#185FA5','#1D9E75','#BA7517','#993556','#534AB7','#993C1D','#0F6E56']
const DEFAULT_CATEGORIES = [
  { name: 'Rent/mortgage', amount: 2000 },
  { name: 'Food & groceries', amount: 600 },
  { name: 'Transport', amount: 350 },
  { name: 'Entertainment', amount: 250 },
  { name: 'Savings', amount: 800 },
  { name: 'Utilities', amount: 200 },
]

export default function SpendingChart() {
  const [categories, setCategories] = useLocalStorage('spending-categories', DEFAULT_CATEGORIES)
  const [newName, setNewName] = useState('')
  const [newAmt, setNewAmt] = useState('')
  const [editing, setEditing] = useState(null)

  const total = categories.reduce((s, c) => s + c.amount, 0)

  function addCategory(e) {
    e.preventDefault()
    if (!newName.trim() || !newAmt) return
    setCategories(prev => [...prev, { name: newName.trim(), amount: parseFloat(newAmt) }])
    setNewName(''); setNewAmt('')
  }

  function updateAmount(i, val) {
    setCategories(prev => prev.map((c, idx) => idx === i ? { ...c, amount: parseFloat(val) || 0 } : c))
  }

  function remove(i) {
    setCategories(prev => prev.filter((_, idx) => idx !== i))
  }

  const chartData = {
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(c => c.amount),
      backgroundColor: COLORS.slice(0, categories.length),
      borderWidth: 2,
      borderColor: 'var(--surface)',
    }]
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.chartRow}>
        <div style={{ width: 120, height: 120, flexShrink: 0 }}>
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.label}: ${fmt.usd(c.raw, 0)}` } } }, cutout: '62%' }} />
        </div>
        <div className={styles.legend}>
          {categories.map((c, i) => (
            <div key={i} className={styles.legRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <div className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} />
                <span className={styles.catName}>{c.name}</span>
              </div>
              {editing === i ? (
                <input
                  className={styles.amtInput}
                  type="number"
                  defaultValue={c.amount}
                  autoFocus
                  onBlur={e => { updateAmount(i, e.target.value); setEditing(null) }}
                  onKeyDown={e => { if(e.key==='Enter') { updateAmount(i, e.target.value); setEditing(null) } }}
                />
              ) : (
                <span className={styles.amt} onClick={() => setEditing(i)}>{fmt.usd(c.amount, 0)}</span>
              )}
              <button className={styles.removeBtn} onClick={() => remove(i)}>×</button>
            </div>
          ))}
          <div className={styles.total}>Total: {fmt.usd(total, 0)} / month</div>
        </div>
      </div>
      <form className={styles.addForm} onSubmit={addCategory}>
        <input className={styles.addInput} placeholder="Category name" value={newName} onChange={e => setNewName(e.target.value)} />
        <input className={styles.addInput} placeholder="Amount $" type="number" value={newAmt} onChange={e => setNewAmt(e.target.value)} style={{ width: 90 }} />
        <button className={styles.addBtn} type="submit">+ Add</button>
      </form>
    </div>
  )
}
