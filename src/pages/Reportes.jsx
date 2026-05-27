import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Settings, Database } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calcularSaldoPendiente, calcularTotalPagado, getLoanStatus } from '../utils/calculations'
import { formatMoney, formatDate } from '../utils/formatters'

const PERIOD_FILTERS = [
  { key: 'day', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'all', label: 'Todo' },
]

function filterByPeriod(items, period, dateField = 'fecha') {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return items.filter((item) => {
    const d = new Date((item[dateField] || '') + 'T00:00:00')
    if (period === 'day') return d >= today
    if (period === 'week') {
      const start = new Date(today); start.setDate(today.getDate() - 7)
      return d >= start
    }
    if (period === 'month') {
      const start = new Date(today); start.setDate(today.getDate() - 30)
      return d >= start
    }
    return true
  })
}

export default function Reportes() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('all')
  const { prestamos, pagos, clientes, config } = state
  const moneda = config.moneda

  function getClienteName(clienteId) {
    const c = clientes.find((c) => c.id === clienteId)
    return c ? c.nombre : 'Eliminado'
  }

  const filteredPagos = filterByPeriod(pagos, period, 'fecha')
  const filteredPrestamos = filterByPeriod(prestamos, period, 'fechaInicio')

  const totalPrestado = filteredPrestamos.reduce((s, p) => s + parseFloat(p.monto || 0), 0)
  const totalCobrado = filteredPagos.reduce((s, pg) => s + parseFloat(pg.monto || 0), 0)
  const totalPendiente = prestamos.reduce((s, p) => s + calcularSaldoPendiente(p, pagos), 0)

  // Interest earned: total paid - principal portions
  const interesGanado = prestamos.reduce((sum, p) => {
    const totalPagado = calcularTotalPagado(p.id, pagos)
    const principal = parseFloat(p.monto || 0)
    return sum + Math.max(0, totalPagado - principal)
  }, 0)

  const activosVencidos = prestamos.filter((p) => {
    const s = getLoanStatus(p, pagos)
    return s === 'activo' || s === 'vencido'
  })

  function exportCSV() {
    const rows = [
      ['Tipo', 'Cliente', 'Monto', 'Fecha', 'Estado/Método', 'Nota'],
      ...filteredPrestamos.map((p) => [
        'Préstamo',
        getClienteName(p.clienteId),
        p.monto,
        p.fechaInicio,
        getLoanStatus(p, pagos),
        p.notas || '',
      ]),
      ...filteredPagos.map((pg) => [
        'Pago',
        getClienteName(pg.clienteId),
        pg.monto,
        pg.fecha,
        pg.metodo,
        pg.nota || '',
      ]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_${period}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Quick links */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/configuracion')}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-100 rounded-xl p-3 text-sm font-medium text-gray-700 shadow-sm active:bg-gray-50"
        >
          <Settings size={16} className="text-gray-500" /> Configuración
        </button>
        <button
          onClick={() => navigate('/backup')}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-100 rounded-xl p-3 text-sm font-medium text-gray-700 shadow-sm active:bg-gray-50"
        >
          <Database size={16} className="text-gray-500" /> Backup
        </button>
      </div>

      {/* Period filter */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {PERIOD_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setPeriod(f.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              period === f.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Financial summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumen Financiero</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-500 font-medium">Total Prestado</p>
            <p className="text-sm font-bold text-blue-700 mt-0.5">{formatMoney(totalPrestado, moneda)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-500 font-medium">Total Cobrado</p>
            <p className="text-sm font-bold text-green-700 mt-0.5">{formatMoney(totalCobrado, moneda)}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xs text-orange-500 font-medium">Total Pendiente</p>
            <p className="text-sm font-bold text-orange-700 mt-0.5">{formatMoney(totalPendiente, moneda)}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-xs text-purple-500 font-medium">Ganancia Interés</p>
            <p className="text-sm font-bold text-purple-700 mt-0.5">{formatMoney(interesGanado, moneda)}</p>
          </div>
        </div>
      </div>

      {/* Active/overdue loans table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Préstamos Activos / Vencidos ({activosVencidos.length})
        </h3>
        {activosVencidos.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Sin préstamos activos</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-xs min-w-[320px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium text-right">Monto</th>
                  <th className="pb-2 font-medium text-right">Saldo</th>
                  <th className="pb-2 font-medium text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activosVencidos.map((p) => {
                  const status = getLoanStatus(p, pagos)
                  const saldo = calcularSaldoPendiente(p, pagos)
                  return (
                    <tr key={p.id}>
                      <td className="py-2 text-gray-700 font-medium truncate max-w-[100px]">
                        {getClienteName(p.clienteId)}
                      </td>
                      <td className="py-2 text-right text-gray-600">{formatMoney(p.monto, moneda)}</td>
                      <td className="py-2 text-right text-orange-600 font-medium">{formatMoney(saldo, moneda)}</td>
                      <td className="py-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                          status === 'vencido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Pagos del Período ({filteredPagos.length})
        </h3>
        {filteredPagos.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Sin pagos en este período</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-xs min-w-[300px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium text-right">Monto</th>
                  <th className="pb-2 font-medium">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...filteredPagos]
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((pg) => (
                    <tr key={pg.id}>
                      <td className="py-2 text-gray-700 font-medium truncate max-w-[90px]">
                        {getClienteName(pg.clienteId)}
                      </td>
                      <td className="py-2 text-gray-500">{formatDate(pg.fecha)}</td>
                      <td className="py-2 text-right text-green-600 font-bold">{formatMoney(pg.monto, moneda)}</td>
                      <td className="py-2 text-gray-500 capitalize">{pg.metodo}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export CSV */}
      <button
        onClick={exportCSV}
        className="w-full border border-primary-200 text-primary-700 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-primary-50 bg-white"
      >
        <Download size={18} />
        Exportar CSV
      </button>
    </div>
  )
}
