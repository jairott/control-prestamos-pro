import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const EMPTY_FORM = {
  nombre: '',
  apodo: '',
  telefono: '',
  celular: '',
  dni: '',
  direccion: '',
  garante: '',
  referencia: '',
  notas: '',
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = 'border border-gray-200 rounded-xl p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'

export default function ClienteForm() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id && id !== 'nuevo'

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const cliente = state.clientes.find((c) => c.id === id)
      if (cliente) {
        setForm({
          nombre: cliente.nombre || '',
          apodo: cliente.apodo || '',
          telefono: cliente.telefono || '',
          celular: cliente.celular || '',
          dni: cliente.dni || '',
          direccion: cliente.direccion || '',
          garante: cliente.garante || '',
          referencia: cliente.referencia || '',
          notas: cliente.notas || '',
        })
      }
    }
  }, [id, isEdit, state.clientes])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    const data = {
      ...form,
      nombre: form.nombre.trim(),
    }
    if (isEdit) {
      const cliente = state.clientes.find((c) => c.id === id)
      dispatch({ type: 'UPDATE_CLIENTE', payload: { ...cliente, ...data } })
      setSaved(true)
      setTimeout(() => navigate(`/clientes/${id}`), 800)
    } else {
      const newCliente = {
        id: `c${Date.now()}`,
        ...data,
        fechaCreacion: new Date().toISOString().split('T')[0],
        documentos: [],
      }
      dispatch({ type: 'ADD_CLIENTE', payload: newCliente })
      setSaved(true)
      setTimeout(() => navigate('/clientes'), 800)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nombre completo" required>
        <input
          type="text"
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          placeholder="Ej: María Rodríguez Pérez"
          className={`${inputClass} ${errors.nombre ? 'border-red-400' : ''}`}
        />
        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
      </Field>

      <Field label="Apodo / Sobrenombre">
        <input
          type="text"
          value={form.apodo}
          onChange={(e) => set('apodo', e.target.value)}
          placeholder="Ej: Maruca"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono">
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            placeholder="809-555-1234"
            className={inputClass}
          />
        </Field>
        <Field label="Celular">
          <input
            type="tel"
            value={form.celular}
            onChange={(e) => set('celular', e.target.value)}
            placeholder="829-555-1234"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Cédula / DNI">
        <input
          type="text"
          value={form.dni}
          onChange={(e) => set('dni', e.target.value)}
          placeholder="001-1234567-8"
          className={inputClass}
        />
      </Field>

      <Field label="Dirección">
        <textarea
          value={form.direccion}
          onChange={(e) => set('direccion', e.target.value)}
          placeholder="Calle, sector, ciudad..."
          rows={2}
          className={inputClass}
        />
      </Field>

      <Field label="Garante">
        <input
          type="text"
          value={form.garante}
          onChange={(e) => set('garante', e.target.value)}
          placeholder="Nombre del garante"
          className={inputClass}
        />
      </Field>

      <Field label="Referencia">
        <input
          type="text"
          value={form.referencia}
          onChange={(e) => set('referencia', e.target.value)}
          placeholder="¿Quién lo refirió?"
          className={inputClass}
        />
      </Field>

      <Field label="Notas">
        <textarea
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
          placeholder="Notas adicionales..."
          rows={3}
          className={inputClass}
        />
      </Field>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
          {isEdit ? '¡Cambios guardados correctamente!' : '¡Cliente creado correctamente!'}
        </div>
      )}

      <button
        type="submit"
        disabled={saving || saved}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-primary-700 disabled:opacity-60"
      >
        {saved ? <CheckCircle size={18} /> : <Save size={18} />}
        {saved ? 'Guardado ✓' : isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
      </button>
    </form>
  )
}
