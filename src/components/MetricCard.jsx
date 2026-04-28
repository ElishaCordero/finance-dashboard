import styles from './MetricCard.module.css'

export default function MetricCard({ label, value, sub, subClass }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={`${styles.sub} ${subClass ? styles[subClass] : ''}`}>{sub}</div>}
    </div>
  )
}
