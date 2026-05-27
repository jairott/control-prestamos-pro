import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Save, Calculator } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { calcularCuota, calcularTotalAPagar } from '../../utils/calculations'
import { formatMoney } from '../../utils/formatters'

const inputClass = 'border border-gray-200 rounded-xl p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'

function RadioGroup({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              value === opt.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PrestamoForm() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedClienteId = searchParams.get('clienteId') || ''
  const moneda = state.config.moneda

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    clienteId: preselectedClienteId,
    monto: '',
    interes: '10',
    tipoInteres: 'mensual',
    frecuencia: 'mensual',
    cuotas: '6',
    fechaInicio: today,
    notas: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  // Calculate due date based on frequency and cuotas
  function calcDueDate(fechaInicio, frecuencia, cuotas) {
    if (!fechaInicio || !cuotas) return ''
    const d = new Date(fechaInicio + 'T00:00:00')
    const n = parseInt(cuotas) || 0
    const freqDays = { diario: 1, semanal: 7, quincenal: 15, mensual: 30 }
    const days = (freqDays[frecuencia] || 30) * n
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  const monto = parseFloat(form.monto) || 0
  const interes = parseFloat(form.interes) || 0
  const cuotas = parseInt(form.cuotas) || 0
  const cuotaAmt = calcularCuota(monto, interes, cuotas, form.tipoInteres)
  const totalAPagar = calcularTotalAPagar(monto, interes, cuotas, form.tipoInteres)
  const interesTotal = totalAPagar - monto
  const dueDate = calcDueDate(form.fechaInicio, form.frecuencia, form.cuotas)

  function validate() {
    const errs = {}
    if (!form.clienteId) errs.clienteId = 'Selecciona un cliente'
    if (!form.monto || parseFloat(form.monto) <= 0) errs.monto = 'Ingresa el monto'
    if (!form.interes || parseFloat(form.interes) < 0) errs.interes = 'Ingresa el interés'
    if (!form.cuotas || parseInt(form.cuotas) <= 0) errs.cuotas = 'Ingresa el número de cuotas'
    if (!form.fechaInicio) errs.fechaInicio = 'Selecciona la fecha de inicio'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    const nuevoPrestamo = {
      id: `p${Date.now()}`,
      clienteId: form.clienteId,
      monto: parseFloat(form.monto),
      interes: parseFloat(form.interes),
      tipoInteres: form.tipoInteres,
      fechaInicio: form.fechaInicio,
      fechaVencimiento: dueDate,
      frecuencia: form.frecuencia,
      cuotas: parseInt(form.cuotas),
      estado: 'activo',
      notas: form.notas.trim(),
    }
    dispatch({ type: 'ADD_PRESTAMO', payload: nuevoPrestamo })
    navigate('/prestamos')
  }

  return (
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

      {/* Interés */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Interés (%) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={form.interes}
          onChange={(e) => set('interes', e.target.value)}
          placeholder="10"
          min="0"
          step="0.5"
          className={`${inputClass} ${errors.interes ? 'border-red-400' : ''}`}
        />
        {errors.interes && <p className="text-red-500 text-xs mt-1">{errors.interes}</p>}
      </div>

      {/* Tipo de interés */}
      <RadioGroup
        label="Tipo de Interés"
        value={form.tipoInteres}
        onChange={(v) => set('tipoInteres', v)}
        options={[
          { value: 'fijo', label: 'Fijo (sobre principal)' },
          { value: 'mensual', label: 'Mensual por cuota' },
        ]}
      />

      {/* Frecuencia */}
      <RadioGroup
        label="Frecuencia de Pago"
        value={form.frecuencia}
        onChange={(v) => set('frecuencia', v)}
        options={[
          { value: 'diario', label: 'Diario' },
          { value: 'semanal', label: 'Semanal' },
          { value: 'quincenal', label: 'Quincenal' },
          { value: 'mensual', label: 'Mensual' },
        ]}
      />

      {/* Cuotas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Cuotas <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={form.cuotas}
          onChange={(e) => set('cuotas', e.target.value)}
          placeholder="6"
          min="1"
          className={`${inputClass} ${errors.cuotas ? 'border-red-400' : ''}`}
        />
        {errors.cuotas && <p className="text-red-500 text-xs mt-1">{errors.cuotas}</p>}
      </div>

      {/* Fecha inicio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Inicio <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.fechaInicio}
          onChange={(e) => set('fechaInicio', e.target.value)}
          className={`${inputClass} ${errors.fechaInicio ? 'border-red-400' : ''}`}
        />
        {dueDate && (
          <p className="text-xs text-gray-400 mt-1">Fecha de vencimiento: {dueDate}</p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
          placeholder="Propósito del préstamo..."
          rows={2}
          className={inputClass}
        />
      </div>

      {/* Live preview */}
      {monto > 0 && cuotas > 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={16} className="text-primary-600" />
            <p className="text-sm font-semibold text-primary-700">Vista Previa del Préstamo</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-500">Cuota {form.frecuencia}</p>
              <p className="text-sm font-bold text-gray-800">{formatMoney(cuotaAmt, moneda)}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-500">Total a pagar</p>
              <p className="text-sm font-bold text-gray-800">{formatMoney(totalAPagar, moneda)}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-500">Interés total</p>
              <p className="text-sm font-bold text-orange-600">{formatMoney(interesTotal, moneda)}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-500">Nº cuotas</p>
              <p className="text-sm font-bold text-gray-800">{cuotas}</p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-primary-700 disabled:opacity-60"
      >
        <Save size={18} />
        Crear Préstamo
      </button>
    </form>
  )
}
