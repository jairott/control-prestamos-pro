import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Save, X, Copy, MessageCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { calcularSaldoPendiente, getLoanStatus } from '../../utils/calculations'
import { formatMoney, formatDate } from '../../utils/formatters'

const inputClass = 'border border-gray-200 rounded-xl p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'

const METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'cashapp', label: 'CashApp' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'otro', label: 'Otro' },
]

export default function PagoForm() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const moneda = state.config.moneda

  const preselectedClienteId = searchParams.get('clienteId') || ''
  const preselectedPrestamoId = searchParams.get('prestamoId') || ''
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    clienteId: preselectedClienteId,
    prestamoId: preselectedPrestamoId,
    monto: '',
    fecha: today,
    metodo: 'efectivo',
    nota: '',
  })
  const [errors, setErrors] = useState({})
  const [receipt, setReceipt] = useState(null)

  // Get active loans for selected client
  const clientLoans = state.prestamos.filter(
    (p) => p.clienteId === form.clienteId && getLoanStatus(p, state.pagos) !== 'pagado'
  )

  // Get saldo pendiente for selected loan
  const selectedLoan = state.prestamos.find((p) => p.id === form.prestamoId)
  const saldoPendiente = selectedLoan ? calcularSaldoPendiente(selectedLoan, state.pagos) : 0

  function set(field, value) {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (field === 'clienteId') {
        updated.prestamoId = ''
        updated.monto = ''
      }
      if (field === 'prestamoId') {
        // Pre-fill monto with saldo pendiente
        const loan = state.prestamos.find((p) => p.id === value)
        if (loan) {
          const saldo = calcularSaldoPendiente(loan, state.pagos)
          updated.monto = saldo > 0 ? String(Math.round(saldo * 100) / 100) : ''
        }
      }
      return updated
    })
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.clienteId) errs.clienteId = 'Selecciona un cliente'
    if (!form.prestamoId) errs.prestamoId = 'Selecciona un préstamo'
    if (!form.monto || parseFloat(form.monto) <= 0) errs.monto = 'Ingresa el monto'
    if (!form.fecha) errs.fecha = 'Selecciona la fecha'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const cliente = state.clientes.find((c) => c.id === form.clienteId)
    const nuevoPago = {
      id: `pg${Date.now()}`,
      prestamoId: form.prestamoId,
      clienteId: form.clienteId,
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      metodo: form.metodo,
      nota: form.nota.trim(),
    }
    dispatch({ type: 'ADD_PAGO', payload: nuevoPago })

    // Show receipt
    setReceipt({
      clienteNombre: cliente?.nombre || '',
      prestamoId: form.prestamoId,
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      metodo: form.metodo,
    })
  }

  function getReceiptText(r) {
    return (
      `*Recibo de Pago - ${state.config.appName}*\n` +
      `Cliente: ${r.clienteNombre}\n` +
      `Préstamo #: ${r.prestamoId}\n` +
      `Monto: ${formatMoney(r.monto, moneda)}\n` +
      `Fecha: ${formatDate(r.fecha)}\n` +
      `Método: ${r.metodo}`
    )
  }

  function handleCopy() {
    if (!receipt) return
    navigator.clipboard.writeText(getReceiptText(receipt)).catch(() => {})
  }

  function handleWhatsApp() {
    if (!receipt) return
    const text = encodeURIComponent(getReceiptText(receipt))
    const cliente = state.clientes.find((c) => c.id === form.clienteId)
    const phone = (cliente?.celular || cliente?.telefono || '').replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  function handleCloseReceipt() {
    setReceipt(null)
    navigate('/pagos')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente <span className="text-red-500">*</span>
          </label>
          <select
            value={form.clienteId}
            onChange={(e) => set('clienteId', e.target.value)}
            className={`${inputClass} ${errors.clienteId ? 'border-red-400' : ''}`}
          >
            <option value="">Seleccionar cliente...</option>
            {state.clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.clienteId && <p className="text-red-500 text-xs mt-1">{errors.clienteId}</p>}
        </div>

        {/* Préstamo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Préstamo <span className="text-red-500">*</span>
          </label>
          <select
            value={form.prestamoId}
            onChange={(e) => set('prestamoId', e.target.value)}
            disabled={!form.clienteId}
            className={`${inputClass} ${errors.prestamoId ? 'border-red-400' : ''} disabled:opacity-50`}
          >
            <option value="">Seleccionar préstamo...</option>
            {clientLoans.map((p) => {
              const saldo = calcularSaldoPendiente(p, state.pagos)
              return (
                <option key={p.id} value={p.id}>
                  {formatMoney(p.monto, moneda)} · Saldo: {formatMoney(saldo, moneda)}
                </option>
              )
            })}
          </select>
          {errors.prestamoId && <p className="text-red-500 text-xs mt-1">{errors.prestamoId}</p>}
          {selectedLoan && (
            <p className="text-xs text-gray-400 mt-1">
              Saldo pendiente: <strong className="text-orange-600">{formatMoney(saldoPendiente, moneda)}</strong>
            </p>
          )}
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto ({moneda}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={form.monto}
            onChange={(e) => set('monto', e.target.value)}
            placeholder="0.00"
            min="0"
            className={`${inputClass} ${errors.monto ? 'border-red-400' : ''}`}
          />
          {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto}</p>}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => set('fecha', e.target.value)}
            className={`${inputClass} ${errors.fecha ? 'border-red-400' : ''}`}
          />
        </div>

        {/* Método */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
          <div className="flex gap-2 flex-wrap">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => set('metodo', m.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  form.metodo === m.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
          <input
            type="text"
            value={form.nota}
            onChange={(e) => set('nota', e.target.value)}
            placeholder="Referencia, observación..."
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-primary-700"
        >
          <Save size={18} />
          Registrar Pago
        </button>
      </form>

      {/* Receipt modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Recibo de Pago</h3>
              <button onClick={handleCloseReceipt}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cliente</span>
                <span className="font-semibold text-gray-800">{receipt.clienteNombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Préstamo #</span>
                <span className="font-semibold text-gray-800">{receipt.prestamoId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monto</span>
                <span className="font-bold text-green-600 text-base">{formatMoney(receipt.monto, moneda)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha</span>
                <span className="font-semibold text-gray-800">{formatDate(receipt.fecha)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Método</span>
                <span className="font-semibold text-gray-800 capitalize">{receipt.metodo}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium active:bg-gray-50"
              >
                <Copy size={15} /> Copiar
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl text-sm font-medium active:bg-green-600"
              >
                <MessageCircle size={15} /> WhatsApp
              </button>
            </div>
            <button
              onClick={handleCloseReceipt}
              className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
