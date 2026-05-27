/**
 * Calculate the periodic payment (cuota) for a loan.
 * tipoInteres: 'fijo' = flat rate on principal, 'mensual' = monthly compound
 */
export function calcularCuota(monto, interes, cuotas, tipoInteres) {
  if (!monto || !cuotas || cuotas === 0) return 0
  const total = calcularTotalAPagar(monto, interes, cuotas, tipoInteres)
  return total / cuotas
}

/**
 * Calculate the total amount to pay (principal + interest).
 */
export function calcularTotalAPagar(monto, interes, cuotas, tipoInteres) {
  if (!monto) return 0
  const m = parseFloat(monto)
  const r = parseFloat(interes) / 100
  if (tipoInteres === 'fijo') {
    // Flat interest on total principal
    return m + m * r * (cuotas > 0 ? 1 : 1)
  } else {
    // Monthly interest: total = principal * (1 + rate)^periods_in_months
    // We treat cuotas as number of payments, interest applied monthly
    // Simple monthly interest: total = principal * (1 + rate * months)
    // months determined by frequency and cuotas is already # of payments
    return m + m * r * (cuotas > 0 ? cuotas : 1)
  }
}

/**
 * Calculate the remaining balance on a loan.
 */
export function calcularSaldoPendiente(prestamo, pagos) {
  const total = calcularTotalAPagar(
    prestamo.monto,
    prestamo.interes,
    prestamo.cuotas,
    prestamo.tipoInteres
  )
  const pagado = calcularTotalPagado(prestamo.id, pagos)
  const saldo = total - pagado
  return Math.max(0, saldo)
}

/**
 * Calculate the total amount paid for a given loan.
 */
export function calcularTotalPagado(prestamoId, pagos) {
  return pagos
    .filter((p) => p.prestamoId === prestamoId)
    .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
}

/**
 * Get the current status of a loan based on dates and balance.
 */
export function getLoanStatus(prestamo, pagos = []) {
  if (prestamo.estado === 'pagado') return 'pagado'
  const saldo = calcularSaldoPendiente(prestamo, pagos)
  if (saldo <= 0) return 'pagado'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const vencimiento = new Date(prestamo.fechaVencimiento + 'T00:00:00')
  if (vencimiento < today) return 'vencido'
  return 'activo'
}
