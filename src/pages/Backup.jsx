import { useState, useRef } from 'react'
import { AlertTriangle, Download, Upload, RefreshCw, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Backup() {
  const { state, dispatch } = useApp()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const fileInputRef = useRef(null)

  function handleExport() {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      clientes: state.clientes,
      prestamos: state.prestamos,
      pagos: state.pagos,
      config: state.config,
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_controlprestamos_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    setImportError('')
    setImportSuccess('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.clientes || !data.prestamos || !data.pagos) {
          setImportError('Archivo de backup inválido. Falta información requerida.')
          return
        }
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            clientes: data.clientes || [],
            prestamos: data.prestamos || [],
            pagos: data.pagos || [],
            config: { ...state.config, ...(data.config || {}), datosInicializados: true },
          },
        })
        setImportSuccess(`Backup importado: ${data.clientes.length} clientes, ${data.prestamos.length} préstamos, ${data.pagos.length} pagos.`)
      } catch {
        setImportError('Error al leer el archivo. Asegúrate de que es un backup válido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleReset() {
    dispatch({ type: 'RESET_DATA' })
    setShowResetConfirm(false)
  }

  function handleDeleteAll() {
    if (deleteStep === 1) {
      setDeleteStep(2)
      return
    }
    dispatch({ type: 'CLEAR_DATA' })
    setShowDeleteConfirm(false)
    setDeleteStep(1)
  }

  const stats = {
    clientes: state.clientes.length,
    prestamos: state.prestamos.length,
    pagos: state.pagos.length,
  }

  return (
    <div className="space-y-5">
      {/* Warning card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Datos locales</p>
          <p className="text-xs text-amber-700 mt-1">
            Los datos se guardan localmente en este dispositivo. Exporta un backup regularmente para evitar pérdida de información.
          </p>
        </div>
      </div>

      {/* Data summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos Actuales</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-800">{stats.clientes}</p>
            <p className="text-xs text-gray-500">Clientes</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-800">{stats.prestamos}</p>
            <p className="text-xs text-gray-500">Préstamos</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-800">{stats.pagos}</p>
            <p className="text-xs text-gray-500">Pagos</p>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Exportar Backup</h3>
        <p className="text-xs text-gray-500 mb-3">Descarga todos tus datos en formato JSON.</p>
        <button
          onClick={handleExport}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-primary-700"
        >
          <Download size={18} /> Exportar Backup
        </button>
      </div>

      {/* Import */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Importar Backup</h3>
        <p className="text-xs text-gray-500 mb-3">Carga un archivo de backup .json. Esto reemplazará todos los datos actuales.</p>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-gray-50"
        >
          <Upload size={18} /> Seleccionar archivo
        </button>
        {importError && (
          <p className="text-red-500 text-xs mt-2">{importError}</p>
        )}
        {importSuccess && (
          <p className="text-green-600 text-xs mt-2">{importSuccess}</p>
        )}
      </div>

      {/* Restore demo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Restaurar Datos Demo</h3>
        <p className="text-xs text-gray-500 mb-3">Carga los datos de ejemplo predeterminados. Se reemplazarán los datos actuales.</p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full border border-blue-200 text-blue-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-blue-50"
        >
          <RefreshCw size={18} /> Restaurar Demo
        </button>
      </div>

      {/* Delete all */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Eliminar Todos los Datos</h3>
        <p className="text-xs text-gray-500 mb-3">Borra permanentemente todos los clientes, préstamos y pagos. Esta acción es irreversible.</p>
        <button
          onClick={() => { setShowDeleteConfirm(true); setDeleteStep(1) }}
          className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-red-50"
        >
          <Trash2 size={18} /> Eliminar Todo
        </button>
      </div>

      {/* Reset demo modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Restaurar Demo</h3>
              <button onClick={() => setShowResetConfirm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              ¿Restaurar los datos de ejemplo? Se eliminarán todos los datos actuales.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete all modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-red-700 text-lg">
                {deleteStep === 1 ? 'Eliminar Todo' : '¿Confirmas definitivamente?'}
              </h3>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteStep(1) }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {deleteStep === 1
                ? `Se eliminarán ${stats.clientes} clientes, ${stats.prestamos} préstamos y ${stats.pagos} pagos. Esta acción NO se puede deshacer.`
                : 'Esta es la segunda confirmación. Al presionar "Eliminar" se borrarán TODOS los datos para siempre.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteStep(1) }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm"
              >
                {deleteStep === 1 ? 'Continuar' : 'Eliminar Todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
