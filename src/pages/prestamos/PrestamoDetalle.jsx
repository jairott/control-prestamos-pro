import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, Plus, X, User } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  calcularTotalAPagar, calcularSaldoPendiente, calcularTotalPagado, getLoanStatus,
} from '../../utils/calculations'
import { formatMoney, formatDate } from '../../utils/formatters'

function StatusBadge({ status }) {
  if (status === 'activo') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Activo</span>
  if (status === 'pagado') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Pagado</span>
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Vencido</span>
}

const methodColors = {
  efectivo: 'bg-green-100 text-green-700',
  zelle: 'bg-blue-100 text-blue-700',
  cashapp: 'bg-purple-100 text-purple-700',
  transferencia: 'bg-indigo-100 text-indigo-700',
  otro: 'bg-gray-100 text-gray-700',
}

export default function PrestamoDetalle() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const { id } = useParams()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const moneda = state.config.moneda

  const prestamo = state.prestamos.find((p) => p.id === id)
  if (!prestamo) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Préstamo no encontrado</p>
        <button onClick={() => navigate('/prestamos')} className="mt-4 text-primary-600 font-medium text-sm">
          Volver a préstamos
        </button>
      </div>
    )
  }

  const cliente = state.clientes.find((c) => c.id === prestamo.clienteId)
  const loanPagos = state.pagos
    .filter((pg) => pg.prestamoId === id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const status = getLoanStatus(prestamo, state.pagos)
  const totalAPagar = calcularTotalAPagar(prestamo.monto, prestamo.interes, prestamo.cuotas, prestamo.tipoInteres)
  const totalPagado = calcularTotalPagado(id, state.pagos)
  const saldo = calcularSaldoPendiente(prestamo, state.pagos)
  const porcentajePagado = totalAPagar > 0 ? Math.min(100, (totalPagado / totalAPagar) * 100) : 0

  const frecuenciaLabels = { diario: 'Diario', semanal: 'Semanal', quincenal: 'Quincenal', mensual: 'Mensual' }

  function handleDelete() {
    dispatch({ type: 'DELETE_PRESTAMO', payload: id })
    navigate('/prestamos')
  }

  function handleDeletePago(pagoId) {
    dispatch({ type: 'DELETE_PAGO', payload: pagoId })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-gray-400" />
              <p className="text-sm text-gray-500 truncate">{cliente?.nombre || 'Cliente eliminado'}</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatMoney(prestamo.monto, moneda)}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{porcentajePagado.toFixed(0)}% pagado</span>
            <span>{formatMoney(saldo, moneda)} pendiente</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                status === 'pagado' ? 'bg-green-500' : status === 'vencido' ? 'bg-red-500' : 'bg-primary-500'
              }`}
              style={{ width: `${porcentajePagado}%` }}
            />
          </div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumen Financiero</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Monto prestado</p>
            <p className="font-bold text-gray-800 text-sm mt-0.5">{formatMoney(prestamo.monto, moneda)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Total a pagar</p>
            <p className="font-bold text-gray-800 text-sm mt-0.5">{formatMoney(totalAPagar, moneda)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-600">Total pagado</p>
            <p className="font-bold text-green-700 text-sm mt-0.5">{formatMoney(totalPagado, moneda)}</p>
          </div>
          <div className={`rounded-xl p-3 ${saldo > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className={`text-xs ${saldo > 0 ? 'text-orange-600' : 'text-green-600'}`}>Saldo pendiente</p>
            <p className={`font-bold text-sm mt-0.5 ${saldo > 0 ? 'text-orange-700' : 'text-green-700'}`}>
              {formatMoney(saldo, moneda)}
            </p>
          </div>
        </div>
      </div>

      {/* Loan details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalles</h3>
        <div className="space-y-2">
          {[
            ['Interés', `${prestamo.interes}% (${prestamo.tipoInteres === 'mensual' ? 'mensual' : 'fijo'})`],
            ['Frecuencia', frecuenciaLabels[prestamo.frecuencia] || prestamo.frecuencia],
            ['Cuotas', `${prestamo.cuotas} cuotas`],
            ['Fecha de inicio', formatDate(prestamo.fechaInicio)],
            ['Fecha de vencimiento', formatDate(prestamo.fechaVencimiento)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-700">{value}</span>
            </div>
          ))}
          {prestamo.notas && (
            <div className="bg-yellow-50 rounded-lg p-2.5 mt-2">
              <p className="text-xs text-yellow-700">{prestamo.notas}</p>
            </div>
          )}
        </div>
      </div>

      {/* Register payment button */}
      {status !== 'pagado' && (
        <button
          onClick={() => navigate(`/pagos/nuevo?prestamoId=${id}&clienteId=${prestamo.clienteId}`)}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-primary-700"
        >
          <Plus size={18} />
          Registrar Pago
        </button>
      )}

      {/* Payment history */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Historial de Pagos ({loanPagos.length})
        </h3>
        {loanPagos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
            Sin pagos registrados
          </div>
        ) : (
          <div className="space-y-2">
            {loanPagos.map((pg) => (
              <div key={pg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{formatMoney(pg.monto, moneda)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${methodColors[pg.metodo] || methodColors.otro}`}>
                      {pg.metodo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(pg.fecha)}{pg.nota && ` · ${pg.nota}`}</p>
                </div>
                <button
                  onClick={() => handleDeletePago(pg.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete loan button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        className="w-full border border-red-200 text-red-600 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-red-50"
      >
        <Trash2 size={16} /> Eliminar Préstamo
      </button>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Eliminar Préstamo</h3>
              <button onClick={() => setShowDeleteModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              ¿Eliminar el préstamo de <strong>{formatMoney(prestamo.monto, moneda)}</strong>? También se eliminarán todos sus pagos.
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
