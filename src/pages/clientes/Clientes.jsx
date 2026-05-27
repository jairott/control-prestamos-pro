import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, Phone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { calcularSaldoPendiente, getLoanStatus } from '../../utils/calculations'
import { formatMoney, getInitials } from '../../utils/formatters'

export default function Clientes() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { clientes, prestamos, pagos, config } = state
  const moneda = config.moneda

  const filtered = [...clientes]
    .sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''))
    .filter((c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.apodo && c.apodo.toLowerCase().includes(search.toLowerCase())) ||
      (c.telefono && c.telefono.includes(search))
    )

  function getClientStats(clienteId) {
    const clientLoans = prestamos.filter((p) => p.clienteId === clienteId)
    const activeLoans = clientLoans.filter((p) => getLoanStatus(p, pagos) === 'activo')
    const totalDebt = clientLoans.reduce(
      (s, p) => s + calcularSaldoPendiente(p, pagos), 0
    )
    return { activeCount: activeLoans.length, totalDebt }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {/* Client count */}
      <p className="text-xs text-gray-500 font-medium">
        {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <Users size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay clientes</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? 'No se encontraron resultados' : 'Agrega tu primer cliente'}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/clientes/nuevo')}
              className="mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Nuevo Cliente
            </button>
          )}
        </div>
      )}

      {/* Client cards */}
      <div className="space-y-3">
        {filtered.map((c) => {
          const { activeCount, totalDebt } = getClientStats(c.id)
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/clientes/${c.id}`)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 text-left active:bg-gray-50"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{getInitials(c.nombre)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{c.nombre}</p>
                {c.apodo && <p className="text-xs text-gray-400">"{c.apodo}"</p>}
                {(c.telefono || c.celular) && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{c.celular || c.telefono}</p>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-800">{formatMoney(totalDebt, moneda)}</p>
                <p className="text-xs text-gray-400">
                  {activeCount} préstamo{activeCount !== 1 ? 's' : ''} activo{activeCount !== 1 ? 's' : ''}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/clientes/nuevo')}
        className="fixed bottom-24 right-4 bg-primary-600 text-white rounded-full p-4 shadow-lg active:bg-primary-700 z-30"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
