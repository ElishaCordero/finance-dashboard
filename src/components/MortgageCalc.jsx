import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'
import { mortgagePayment, amortisationSchedule, fmt } from '../utils/format'
import styles from './MortgageCalc.module.css'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

export default function MortgageCalc() {
  const [loan, setLoan] = useState(500000)
  const [rate, setRate] = useState(6.25)
  const [term, setTerm] = useState(30)
  const [showTable, setShowTable] = useState(false)

  const monthly = mortgagePayment(loan, rate, term)
  const schedule = amortisationSchedule(loan, rate, term)
  const totalPaid = monthly * term * 12
  const totalInterest = totalPaid - loan

  const yearlyLabels = schedule.filter(r => r.month % 12 === 0).map(r => `Yr ${r.month / 12}`)
  const balanceData = schedule.filter(r => r.month % 12 === 0).map(r => Math.round(r.balance))
  const interestData = schedule.filter(r => r.month % 12 === 0).map((_, i) => {
    const slice = schedule.slice(i * 12, (i + 1) * 12)
    return Math.round(slice.reduce((s, r) => s + r.interest, 0))
  })

  const chartData = {
    labels: yearlyLabels,
    datasets: [
      {
        label: 'Remaining balance',
        data: balanceData,
        borderColor: '#185FA5',
        backgroundColor: 'rgba(24,95,165,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt.usd(c.raw, 0) } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { font: { size: 10 }, callback: v => '$' + Math.round(v / 1000) + 'k' } },
    },
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inputs}>
        {[
          { label: 'Loan amount', id: 'loan', value: loan, set: setLoan, prefix: '$', step: 10000, min: 10000, max: 5000000 },
          { label: 'Interest rate', id: 'rate', value: rate, set: setRate, suffix: '%', step: 0.05, min: 0.5, max: 20 },
          { label: 'Term', id: 'term', value: term, set: setTerm, suffix: 'yrs', step: 1, min: 1, max: 40 },
        ].map(f => (
          <div key={f.id} className={styles.field}>
            <label className={styles.label}>{f.label}</label>
            <div className={styles.inputWrap}>
              {f.prefix && <span className={styles.affix}>{f.prefix}</span>}
              <input
                type="number"
                className={styles.input}
                value={f.value}
                step={f.step}
                min={f.min}
                max={f.max}
                onChange={e => f.set(parseFloat(e.target.value) || 0)}
              />
              {f.suffix && <span className={styles.affix}>{f.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.results}>
        <div className={styles.resultCard}>
          <div className={styles.resultLabel}>Monthly payment</div>
          <div className={styles.resultVal}>{fmt.usd(monthly)}</div>
        </div>
        <div className={styles.resultCard}>
          <div className={styles.resultLabel}>Total interest</div>
          <div className={styles.resultVal} style={{ color: '#E24B4A' }}>{fmt.usd(totalInterest, 0)}</div>
        </div>
        <div className={styles.resultCard}>
          <div className={styles.resultLabel}>Total paid</div>
          <div className={styles.resultVal}>{fmt.usd(totalPaid, 0)}</div>
        </div>
      </div>

      <div style={{ position: 'relative', height: 160, marginTop: 8 }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <button className={styles.tableBtn} onClick={() => setShowTable(s => !s)}>
        {showTable ? 'Hide' : 'Show'} amortisation schedule
      </button>

      {showTable && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>
            </thead>
            <tbody>
              {schedule.slice(0, 60).map(r => (
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td>{fmt.usd(r.payment)}</td>
                  <td>{fmt.usd(r.principal)}</td>
                  <td>{fmt.usd(r.interest)}</td>
                  <td>{fmt.usd(r.balance, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.tableNote}>Showing first 60 months of {term * 12}</p>
        </div>
      )}
    </div>
  )
}
