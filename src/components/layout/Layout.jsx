import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, ChevronLeft, Settings, Database } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import BottomNav from './BottomNav'

const routeTitles = {
  '/': 'Dashboard',
  '/clientes': 'Clientes',
  '/clientes/nuevo': 'Nuevo Cliente',
  '/prestamos': 'Préstamos',
  '/prestamos/nuevo': 'Nuevo Préstamo',
  '/pagos': 'Pagos',
  '/pagos/nuevo': 'Registrar Pago',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
  '/backup': 'Backup & Datos',
}

function getTitle(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname]
  if (pathname.includes('/editar')) return 'Editar Cliente'
  if (pathname.includes('/prestamo/nuevo')) return 'Nuevo Préstamo'
  if (pathname.startsWith('/clientes/')) return 'Detalle Cliente'
  if (pathname.startsWith('/prestamos/')) return 'Detalle Préstamo'
  return 'ControlPréstamos Pro'
}

function isRootTab(pathname) {
  return ['/', '/clientes', '/prestamos', '/pagos', '/reportes'].includes(pathname)
}

export default function Layout({ children }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const title = getTitle(pathname)
  const showBack = !isRootTab(pathname)

  function handleLogout() {
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 py-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="w-6" />
          )}
          <h1 className="flex-1 text-base font-semibold text-center truncate">
            {pathname === '/' ? state.config.appName : title}
          </h1>
          <div className="flex items-center gap-1">
            {isRootTab(pathname) && pathname === '/reportes' && (
              <>
                <button
                  onClick={() => navigate('/configuracion')}
                  className="p-1 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={() => navigate('/backup')}
                  className="p-1 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Database size={20} />
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="p-1 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-md mx-auto w-full pb-24 px-4 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
