import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownCircle, ArrowUpCircle, RotateCcw, Plus, Trash2, Wallet } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calcularDesglose, getLoanStatus } from '../utils/calculations'
import { formatMoney, formatDate } from '../utils/formatters'

const inputClass = 'border border-gray-200 rounded-xl p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'

export default function Caja() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const { clientes, prestamos, pagos, config } = state
  const moneda = config.moneda
  const caja = state.caja && Array.isArray(state.caja.movimientos) ? state.caja : { inicio: null, movimientos: [] }
  const [showForm, setShowForm] = useState(false)
  const [mov, setMov] = useState({ tipo: 'entrada', monto: '', concepto: '' })

  // ── Caja (entradas y salidas) ──
  const entradas = caja.movimientos.filter((m) => m.tipo === 'entrada')
  const salidas = caja.movimientos.filter((m) => m.tipo === 'salida')
  const totalEntradas = entradas.reduce((s, m) => s + m.monto, 0)
  const totalSalidas = salidas.reduce((s, m) => s + m.monto, 0)
  const saldoCaja = totalEntradas - totalSalidas
  const entradasCapital = entradas.reduce((s, m) => s + (m.capital || 0), 0)
  const entradasInteres = entradas.reduce((s, m) => s + (m.interes || 0), 0)

  // ── Cartera activa en vivo (capital vs interés) ──
  const activos = prestamos
    .filter((p) => getLoanStatus(p, pagos) !== 'pagado')
    .map((p) => ({ prestamo: p, cliente: clientes.find((c) => c.id === p.clienteId), ...calcularDesglose(p, pagos) }))
    .sort((a, b) => b.saldoPendiente - a.saldoPendiente)
  const capitalActivo = activos.reduce((s, a) => s + a.capitalPendiente, 0)
  const interesPorCobrar = activos.reduce((s, a) => s + a.interesPendiente, 0)

  function handleReset() {
    if (window.confirm('¿Poner la caja en CERO? Se borran los movimientos de caja (los clientes, préstamos y abonos no se tocan).')) {
      dispatch({ type: 'RESET_CAJA' })
    }
  }

  function handleAddMov(e) {
    e.preventDefault()
    const monto = parseFloat(mov.monto)
    if (!monto || monto <= 0) return
    dispatch({
      type: 'ADD_MOVIMIENTO_CAJA',
      payload: {
        tipo: mov.tipo,
        monto,
        capital: 0,
        interes: 0,
        concepto: mov.concepto.trim() || (mov.tipo === 'entrada' ? 'Entrada manual' : 'Salida manual'),
        fecha: new Date().toISOString().split('T')[0],
      },
    })
    setMov({ tipo: 'entrada', monto: '', concepto: '' })
    setShowForm(false)
  }

  const movimientos = [...caja.movimientos].sort((a, b) => (b.creadoEn || '').localeCompare(a.creadoEn || ''))

  return (
    <div className="space-y-5">
      {/* Saldo de caja */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow">
        <div className="flex items-center gap-2 text-sm opacity-90"><Wallet size={16} /> Dinero en caja</div>
        <p className="text-3xl font-bold mt-1">{formatMoney(saldoCaja, moneda)}</p>
        <p className="text-xs opacity-75 mt-1">
          {caja.inicio ? `Desde ${formatDate(caja.inicio.split('T')[0])}` : 'Caja iniciada en cero'}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="bg-white/15 rounded-xl p-2.5">
            <p className="text-xs opacity-80">Entradas</p>
            <p className="font-semibold">{formatMoney(totalEntradas, moneda)}</p>
            <p className="text-[11px] opacity-75">Cap. {formatMoney(entradasCapital, moneda)} · Int. {formatMoney(entradasInteres, moneda)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5">
            <p className="text-xs opacity-80">Salidas</p>
            <p className="font-semibold">{formatMoney(totalSalidas, moneda)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowForm((v) => !v)} className="bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium flex items-center justify-center gap-1.5">
          <Plus size={16} /> Movimiento
        </button>
        <button onClick={handleReset} className="bg-white border border-red-200 text-red-600 rounded-xl p-3 text-sm font-medium flex items-center justify-center gap-1.5">
          <RotateCcw size={16} /> Caja en cero
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddMov} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            {['entrada', 'salida'].map((t) => (
              <button type="button" key={t} onClick={() => setMov((m) => ({ ...m, tipo: t }))}
                className={`rounded-xl p-2 text-sm font-medium border ${mov.tipo === t ? (t === 'entrada' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700') : 'border-gray-200 text-gray-500'}`}>
                {t === 'entrada' ? 'Entrada' : 'Salida'}
              </button>
            ))}
          </div>
          <input type="number" step="0.01" inputMode="decimal" placeholder="Monto" className={inputClass}
            value={mov.monto} onChange={(e) => setMov((m) => ({ ...m, monto: e.target.value }))} />
          <input type="text" placeholder="Concepto (ej: gasolina, aporte de socio)" className={inputClass}
            value={mov.concepto} onChange={(e) => setMov((m) => ({ ...m, concepto: e.target.value }))} />
          <button type="submit" className="w-full bg-primary-600 text-white rounded-xl p-3 text-sm font-semibold">Guardar</button>
        </form>
      )}

      {/* Capital total activo */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Cartera activa (en vivo)</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-[11px] text-gray-500">Capital activo</p>
            <p className="text-sm font-bold text-blue-700">{formatMoney(capitalActivo, moneda)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-[11px] text-gray-500">Interés por cobrar</p>
            <p className="text-sm font-bold text-green-700">{formatMoney(interesPorCobrar, moneda)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-[11px] text-gray-500">Total por cobrar</p>
            <p className="text-sm font-bold text-gray-800">{formatMoney(capitalActivo + interesPorCobrar, moneda)}</p>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {activos.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">Sin préstamos activos</div>
          )}
          {activos.map((a) => (
            <button key={a.prestamo.id} onClick={() => navigate(`/prestamos/${a.prestamo.id}`)}
              className="w-full bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-left active:bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm text-gray-800 truncate">{a.cliente?.nombre || 'Cliente eliminado'}</p>
                <p className="text-sm font-bold text-gray-800">{formatMoney(a.saldoPendiente, moneda)}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Prestado {formatMoney(a.capitalTotal, moneda)} · Capital debe <span className="text-blue-700 font-medium">{formatMoney(a.capitalPendiente, moneda)}</span> · Interés <span className="text-green-700 font-medium">{formatMoney(a.interesPendiente, moneda)}</span>
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Movimientos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Movimientos de caja</h2>
        {movimientos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
            Caja en cero. Los abonos entran y los préstamos nuevos salen automáticamente.
          </div>
        ) : (
          <div className="space-y-2">
            {movimientos.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-center gap-3">
                {m.tipo === 'entrada'
                  ? <ArrowDownCircle size={22} className="text-green-600 shrink-0" />
                  : <ArrowUpCircle size={22} className="text-red-600 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.concepto}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(m.fecha)}
                    {m.tipo === 'entrada' && m.interes > 0 && ` · Cap. ${formatMoney(m.capital, moneda)} · Int. ${formatMoney(m.interes, moneda)}`}
                  </p>
                </div>
                <p className={`text-sm font-bold ${m.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.tipo === 'entrada' ? '+' : '−'}{formatMoney(m.monto, moneda)}
                </p>
                {!m.refId && (
                  <button onClick={() => window.confirm('¿Eliminar movimiento?') && dispatch({ type: 'DELETE_MOVIMIENTO_CAJA', payload: m.id })}
                    className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  )
}
