/**
 * Format a number as currency.
 * formatMoney(1500) → "RD$ 1,500.00"
 */
export function formatMoney(amount, currency = 'RD$') {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currency} 0.00`
  const num = parseFloat(amount)
  return `${currency} ${num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/**
 * Format a date string as "27 may 2025".
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return dateStr
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Format a date string as "27/05/2025".
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

/**
 * Get initials from a full name.
 * getInitials("Jairo Torres") → "JT"
 */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}
