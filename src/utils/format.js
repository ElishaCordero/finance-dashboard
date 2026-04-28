export const fmt = {
  currency: (n, decimals = 2) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n),

  usd: (n, decimals = 2) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n),

  pct: (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`,

  compact: (n) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : n.toString(),

  number: (n) => new Intl.NumberFormat('en-AU').format(Math.round(n)),
}

export function mortgagePayment(principal, annualRatePct, termYears) {
  const r = annualRatePct / 100 / 12
  const n = termYears * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function amortisationSchedule(principal, annualRatePct, termYears) {
  const monthly = mortgagePayment(principal, annualRatePct, termYears)
  const r = annualRatePct / 100 / 12
  const n = termYears * 12
  let balance = principal
  const schedule = []
  for (let i = 1; i <= n; i++) {
    const interest = balance * r
    const principalPaid = monthly - interest
    balance -= principalPaid
    schedule.push({
      month: i,
      payment: monthly,
      principal: principalPaid,
      interest,
      balance: Math.max(0, balance),
    })
  }
  return schedule
}
