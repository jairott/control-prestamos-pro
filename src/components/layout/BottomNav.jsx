import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, DollarSign, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/prestamos', icon: CreditCard, label: 'Préstamos' },
  { to: '/pagos', icon: DollarSign, label: 'Pagos' },
  { to: '/reportes', icon: Menu, label: 'Más' },
]

export default function BottomNav() {
  const { state } = useApp()
  if (!state.autenticado) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      {/* Safe area spacer for iPhone */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  )
}
