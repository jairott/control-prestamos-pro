import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Edit, Trash2, Plus, Phone, Smartphone, CreditCard,
  MapPin, Shield, X, DollarSign,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  calcularTotalAPagar, calcularSaldoPendiente, calcularTotalPagado, getLoanStatus,
} from '../../utils/calculations'
import { formatMoney, formatDate, getInitials } from '../../utils/formatters'

function StatusBadge({ status }) {
  if (status === 'activo') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Activo</span>
  if (status === 'pagado') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Pagado</span>
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Vencido</span>
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700 break-words">{value}</p>
      </div>
    </div>
  )
}

export default function ClienteDetalle() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const { id } = useParams()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const moneda = state.config.moneda

  const cliente = state.clientes.find((c) => c.id === id)
  if (!cliente) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Cliente no encontrado</p>
        <button onClick={() => navigate('/clientes')} className="mt-4 text-primary-600 font-medium text-sm">
          Volver a clientes
        </button>
      </div>
    )
  }

  const clientLoans = state.prestamos.filter((p) => p.clienteId === id)
  const clientPagos = state.pagos.filter((pg) => pg.clienteId === id)

  const totalTomado = clientLoans.reduce((s, p) => s + parseFloat(p.monto || 0), 0)
  const totalPagado = clientPagos.reduce((s, pg) => s + parseFloat(pg.monto || 0), 0)
  const totalDebe = clientLoans.reduce((s, p) => s + calcularSaldoPendiente(p, state.pagos), 0)

  const recentPagos = [...clientPagos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  function handleDelete() {
    dispatch({ type: 'DELETE_CLIENTE', payload: id })
    navigate('/clientes')
  }

  const methodColors = {
    efectivo: 'bg-green-100 text-green-700',
    zelle: 'bg-blue-100 text-blue-700',
    cashapp: 'bg-purple-100 text-purple-700',
    transferencia: 'bg-indigo-100 text-indigo-700',
    otro: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold text-xl">{getInitials(cliente.nombre)}</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800">{cliente.nombre}</h2>
        {cliente.apodo && <p className="text-sm text-gray-400">"{cliente.apodo}"</p>}
        <div className="flex justify-center gap-2 mt-3">
          <button
            onClick={() => navigate(`/clientes/${id}/editar`)}
            className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <Edit size={14} /> Editar
          </button>
          <button
            onClick={() => navigate(`/prestamos/nuevo?clienteId=${id}`)}
            className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> Préstamo
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Información</h3>
        <div className="divide-y divide-gray-50">
          <InfoRow icon={Phone} label="Teléfono" value={cliente.telefono} />
          <InfoRow icon={Smartphone} label="Celular" value={cliente.celular} />
          <InfoRow icon={CreditCard} label="Cédula / DNI" value={cliente.dni} />
          <InfoRow icon={MapPin} label="Dirección" value={cliente.direccion} />
          <InfoRow icon={Shield} label="Garante" value={cliente.garante} />
          <InfoRow icon={Shield} label="Referencia" value={cliente.referencia} />
        </div>
        {cliente.notas && (
          <div className="mt-2 bg-yellow-50 rounded-lg p-2.5">
            <p className="text-xs text-yellow-700">{cliente.notas}</p>
          </div>
        )}
      </div>

      {/* Financial summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumen Financiero</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-500 font-medium">Total Tomado</p>
            <p className="text-sm font-bold text-blue-700 mt-0.5">{formatMoney(totalTomado, moneda)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-500 font-medium">Pagado</p>
            <p className="text-sm font-bold text-green-700 mt-0.5">{formatMoney(totalPagado, moneda)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-xs text-red-500 font-medium">Debe</p>
            <p className="text-sm font-bold text-red-700 mt-0.5">{formatMoney(totalDebe, moneda)}</p>
          </div>
        </div>
      </div>

      {/* Loans list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Préstamos</h3>
          <button
            onClick={() => navigate(`/prestamos/nuevo?clienteId=${id}`)}
            className="text-xs text-primary-600 font-medium flex items-center gap-1"
          >
            <Plus size={12} /> Nuevo
          </button>
        </div>
        {clientLoans.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
            Sin préstamos registrados
          </div>
        ) : (
          <div className="space-y-2">
            {clientLoans.map((p) => {
              const status = getLoanStatus(p, state.pagos)
              const saldo = calcularSaldoPendiente(p, state.pagos)
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/prestamos/${p.id}`)}
                  className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center justify-between text-left active:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{formatMoney(p.monto, moneda)}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.fechaInicio)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={status} />
                    <p className="text-xs text-gray-500 mt-1">{formatMoney(saldo, moneda)} pend.</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent payments */}
      {recentPagos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Pagos Recientes</h3>
          <div className="space-y-2">
            {recentPagos.map((pg) => (
              <div key={pg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{formatMoney(pg.monto, moneda)}</p>
                  <p className="text-xs text-gray-500">{formatDate(pg.fecha)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${methodColors[pg.metodo] || methodColors.otro}`}>
                  {pg.metodo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        className="w-full border border-red-200 text-red-600 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-red-50"
      >
        <Trash2 size={16} /> Eliminar Cliente
      </button>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Eliminar Cliente</h3>
              <button onClick={() => setShowDeleteModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              ¿Estás seguro de eliminar a <strong>{cliente.nombre}</strong>? También se eliminarán todos sus préstamos y pagos. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
