export function formatMoney(amount, currency = 'C$') {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currency} 0.00`
  const num = parseFloat(amount)
  return `${currency} ${num.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  return `${parseFloat(value).toFixed(1)}%`
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return dateStr
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

export function formatPhone(phone) {
  if (!phone) return '-'
  return phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()
}
