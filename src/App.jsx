import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/clientes/Clientes'
import ClienteForm from './pages/clientes/ClienteForm'
import ClienteDetalle from './pages/clientes/ClienteDetalle'
import Prestamos from './pages/prestamos/Prestamos'
import PrestamoForm from './pages/prestamos/PrestamoForm'
import PrestamoDetalle from './pages/prestamos/PrestamoDetalle'
import Pagos from './pages/pagos/Pagos'
import PagoForm from './pages/pagos/PagoForm'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'
import Backup from './pages/Backup'

function AppRoutes() {
  const { state } = useApp()

  if (!state.autenticado) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/nuevo" element={<ClienteForm />} />
        <Route path="/clientes/:id" element={<ClienteDetalle />} />
        <Route path="/clientes/:id/editar" element={<ClienteForm />} />
        <Route path="/prestamos" element={<Prestamos />} />
        <Route path="/prestamos/nuevo" element={<PrestamoForm />} />
        <Route path="/prestamos/:id" element={<PrestamoDetalle />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/pagos/nuevo" element={<PagoForm />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
