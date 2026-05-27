import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  TrendingUp, TrendingDown, Clock, Users, AlertTriangle, CalendarClock,
  Plus, UserPlus, CreditCard, DollarSign,
} from 'lucide-react'
import {
  calcularTotalPagado, calcularSaldoPendiente, getLoanStatus,
} from '../utils/calculations'
import { formatMoney, formatDate } from '../utils/formatters'

function StatCard({ icon: Icon, label, value, color = 'blue', sub }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <div className={`rounded-xl p-2.5 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-base font-bold text-gray-800 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'activo') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Activo</span>
  if (status === 'pagado') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Pagado</span>
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Vencido</span>
}

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const { clientes, prestamos, pagos, config } = state
  const moneda = config.moneda

  const totalPrestado = prestamos.reduce((s, p) => s + parseFloat(p.monto || 0), 0)
  const totalCobrado = pagos.reduce((s, pg) => s + parseFloat(pg.monto || 0), 0)
  const totalPendiente = prestamos.reduce(
    (s, p) => s + calcularSaldoPendiente(p, pagos), 0
  )

  const clientesActivos = new Set(
    prestamos
      .filter((p) => getLoanStatus(p, pagos) === 'activo')
      .map((p) => p.clienteId)
  ).size

  const vencidos = prestamos.filter((p) => getLoanStatus(p, pagos) === 'vencido').length

  const today = new Date()
  const in7days = new Date(today)
  in7days.setDate(today.getDate() + 7)
  const proximosPagos = prestamos.filter((p) => {
    if (getLoanStatus(p, pagos) !== 'activo') return false
    const venc = new Date(p.fechaVencimiento + 'T00:00:00')
    return venc >= today && venc <= in7days
  }).length

  // Recent loans (last 5)
  const recentPrestamos = [...prestamos]
    .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio))
    .slice(0, 5)

  // Recent payments (last 5)
  const recentPagos = [...pagos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  function getClienteName(clienteId) {
    const c = clientes.find((c) => c.id === clienteId)
    return c ? c.nombre : 'Cliente eliminado'
  }

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="Total Prestado" value={formatMoney(totalPrestado, moneda)} color="blue" />
        <StatCard icon={TrendingDown} label="Total Cobrado" value={formatMoney(totalCobrado, moneda)} color="green" />
        <StatCard icon={Clock} label="Pendiente" value={formatMoney(totalPendiente, moneda)} color="orange" />
        <StatCard icon={Users} label="Clientes Activos" value={clientesActivos} color="indigo" />
        <StatCard icon={AlertTriangle} label="Vencidos" value={vencidos} color="red" />
        <StatCard icon={CalendarClock} label="Próx. 7 días" value={proximosPagos} color="purple" sub="pagos pendientes" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Acciones Rápidas</h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/clientes/nuevo')}
            className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:bg-gray-50"
          >
            <div className="bg-blue-50 rounded-lg p-1.5"><UserPlus size={18} className="text-blue-600" /></div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">Nuevo Cliente</span>
          </button>
          <button
            onClick={() => navigate('/prestamos/nuevo')}
            className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:bg-gray-50"
          >
            <div className="bg-purple-50 rounded-lg p-1.5"><CreditCard size={18} className="text-purple-600" /></div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">Nuevo Préstamo</span>
          </button>
          <button
            onClick={() => navigate('/pagos/nuevo')}
            className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:bg-gray-50"
          >
            <div className="bg-green-50 rounded-lg p-1.5"><DollarSign size={18} className="text-green-600" /></div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Recent loans */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Préstamos Recientes</h2>
          <button onClick={() => navigate('/prestamos')} className="text-xs text-primary-600 font-medium">Ver todos</button>
        </div>
        {recentPrestamos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
            Sin préstamos registrados
          </div>
        ) : (
          <div className="space-y-2">
            {recentPrestamos.map((p) => {
              const status = getLoanStatus(p, pagos)
              const saldo = calcularSaldoPendiente(p, pagos)
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/prestamos/${p.id}`)}
                  className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 text-left active:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{getClienteName(p.clienteId)}</p>
                    <p className="text-xs text-gray-500">{formatMoney(p.monto, moneda)} · {formatDate(p.fechaInicio)}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <StatusBadge status={status} />
                    <p className="text-xs text-gray-500">{formatMoney(saldo, moneda)} pend.</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent payments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pagos Recientes</h2>
          <button onClick={() => navigate('/pagos')} className="text-xs text-primary-600 font-medium">Ver todos</button>
        </div>
        {recentPagos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
            Sin pagos registrados
          </div>
        ) : (
          <div className="space-y-2">
            {recentPagos.map((pg) => (
              <div
                key={pg.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{getClienteName(pg.clienteId)}</p>
                  <p className="text-xs text-gray-500">{formatDate(pg.fecha)} · {pg.metodo}</p>
                </div>
                <p className="font-bold text-green-600 text-sm">{formatMoney(pg.monto, moneda)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB placeholder spacing */}
      <div className="h-4" />
    </div>
  )
}
