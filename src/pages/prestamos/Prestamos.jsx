import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, CreditCard } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { calcularSaldoPendiente, getLoanStatus } from '../../utils/calculations'
import { formatMoney, formatDate } from '../../utils/formatters'

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Activos' },
  { key: 'vencido', label: 'Vencidos' },
  { key: 'pagado', label: 'Pagados' },
]

function StatusBadge({ status }) {
  if (status === 'activo') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Activo</span>
  if (status === 'pagado') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Pagado</span>
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Vencido</span>
}

export default function Prestamos() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('todos')
  const [search, setSearch] = useState('')
  const { prestamos, clientes, pagos, config } = state
  const moneda = config.moneda

  function getClienteName(clienteId) {
    const c = clientes.find((c) => c.id === clienteId)
    return c ? c.nombre : 'Cliente eliminado'
  }

  const filtered = prestamos
    .map((p) => ({ ...p, status: getLoanStatus(p, pagos) }))
    .filter((p) => {
      if (activeTab !== 'todos' && p.status !== activeTab) return false
      if (search) {
        const name = getClienteName(p.clienteId).toLowerCase()
        if (!name.includes(search.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio))

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500 font-medium">{filtered.length} préstamo{filtered.length !== 1 ? 's' : ''}</p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <CreditCard size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay préstamos</p>
          <p className="text-gray-400 text-sm mt-1">
            {search || activeTab !== 'todos' ? 'Sin resultados con estos filtros' : 'Crea el primer préstamo'}
          </p>
          {!search && activeTab === 'todos' && (
            <button
              onClick={() => navigate('/prestamos/nuevo')}
              className="mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Nuevo Préstamo
            </button>
          )}
        </div>
      )}

      {/* Loan cards */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const saldo = calcularSaldoPendiente(p, pagos)
          const clienteName = getClienteName(p.clienteId)
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/prestamos/${p.id}`)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left active:bg-gray-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-gray-800 truncate">{clienteName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(p.fechaInicio)}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400">Monto prestado</p>
                  <p className="text-base font-bold text-gray-800">{formatMoney(p.monto, moneda)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Saldo pendiente</p>
                  <p className={`text-sm font-bold ${saldo > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatMoney(saldo, moneda)}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>{p.interes}% {p.tipoInteres === 'mensual' ? 'mensual' : 'fijo'}</span>
                <span>Vence: {formatDate(p.fechaVencimiento)}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/prestamos/nuevo')}
        className="fixed bottom-24 right-4 bg-primary-600 text-white rounded-full p-4 shadow-lg active:bg-primary-700 z-30"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
