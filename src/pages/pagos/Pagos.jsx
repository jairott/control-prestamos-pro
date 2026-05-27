import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, DollarSign } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatMoney, formatDate } from '../../utils/formatters'

const DATE_FILTERS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'all', label: 'Todos' },
]

const methodColors = {
  efectivo: 'bg-green-100 text-green-700',
  zelle: 'bg-blue-100 text-blue-700',
  cashapp: 'bg-purple-100 text-purple-700',
  transferencia: 'bg-indigo-100 text-indigo-700',
  otro: 'bg-gray-100 text-gray-700',
}

function filterByDate(pagos, filter) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return pagos.filter((pg) => {
    const d = new Date(pg.fecha + 'T00:00:00')
    if (filter === 'today') return d >= today && d < new Date(today.getTime() + 86400000)
    if (filter === 'week') {
      const start = new Date(today)
      start.setDate(today.getDate() - 7)
      return d >= start
    }
    if (filter === 'month') {
      const start = new Date(today)
      start.setDate(today.getDate() - 30)
      return d >= start
    }
    return true
  })
}

export default function Pagos() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const { pagos, clientes, config } = state
  const moneda = config.moneda

  function getClienteName(clienteId) {
    const c = clientes.find((c) => c.id === clienteId)
    return c ? c.nombre : 'Cliente eliminado'
  }

  const filtered = filterByDate(pagos, filter)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const totalFiltrado = filtered.reduce((s, pg) => s + parseFloat(pg.monto || 0), 0)

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Total summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 font-medium">{filtered.length} pagos</p>
          <p className="text-lg font-bold text-gray-800">{formatMoney(totalFiltrado, moneda)}</p>
        </div>
        <DollarSign size={28} className="text-green-400" />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <DollarSign size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Sin pagos registrados</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter !== 'all' ? 'No hay pagos en este período' : 'Registra el primer pago'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/pagos/nuevo')}
              className="mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Registrar Pago
            </button>
          )}
        </div>
      )}

      {/* Payment cards */}
      <div className="space-y-3">
        {filtered.map((pg) => (
          <div
            key={pg.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-gray-800 truncate">{getClienteName(pg.clienteId)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(pg.fecha)}</p>
                {pg.nota && <p className="text-xs text-gray-400 mt-0.5 italic">{pg.nota}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-green-600">{formatMoney(pg.monto, moneda)}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${methodColors[pg.metodo] || methodColors.otro}`}>
                  {pg.metodo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/pagos/nuevo')}
        className="fixed bottom-24 right-4 bg-primary-600 text-white rounded-full p-4 shadow-lg active:bg-primary-700 z-30"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
