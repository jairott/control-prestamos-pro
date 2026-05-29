import { useState } from 'react'
import { Save, Lock, Globe, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'

const inputClass = 'border border-gray-200 rounded-xl p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'

const MONEDAS = ['C$', '$ USD']
const TIEMPOS = [
  { value: 5, label: '5 minutos' },
  { value: 10, label: '10 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 0, label: 'Nunca' },
]

export default function Configuracion() {
  const { state, dispatch } = useApp()
  const cfg = state.config

  const [pinActual, setPinActual] = useState('')
  const [pinNuevo, setPinNuevo] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)

  const [appName, setAppName] = useState(cfg.appName)
  const [moneda, setMoneda] = useState(cfg.moneda)
  const [tiempoBloqueo, setTiempoBloqueo] = useState(cfg.tiempoBloqueo)
  const [saved, setSaved] = useState(false)

  function handleChangePin(e) {
    e.preventDefault()
    setPinError('')
    setPinSuccess(false)
    if (pinActual !== cfg.pin) {
      setPinError('El PIN actual es incorrecto')
      return
    }
    if (pinNuevo.length !== 4 || !/^\d{4}$/.test(pinNuevo)) {
      setPinError('El nuevo PIN debe tener 4 dígitos')
      return
    }
    if (pinNuevo !== pinConfirm) {
      setPinError('Los PINs no coinciden')
      return
    }
    dispatch({ type: 'UPDATE_CONFIG', payload: { pin: pinNuevo } })
    setPinActual('')
    setPinNuevo('')
    setPinConfirm('')
    setPinSuccess(true)
  }

  function handleSaveSettings(e) {
    e.preventDefault()
    dispatch({
      type: 'UPDATE_CONFIG',
      payload: { appName: appName.trim() || 'ControlPréstamos Pro', moneda, tiempoBloqueo },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Change PIN */}
      <form onSubmit={handleChangePin} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-50 rounded-lg p-1.5"><Lock size={16} className="text-blue-600" /></div>
          <h3 className="font-semibold text-gray-800">Cambiar PIN</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PIN actual</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinActual}
              onChange={(e) => { setPinActual(e.target.value); setPinError(''); setPinSuccess(false) }}
              placeholder="••••"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo PIN (4 dígitos)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinNuevo}
              onChange={(e) => { setPinNuevo(e.target.value); setPinError(''); setPinSuccess(false) }}
              placeholder="••••"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar nuevo PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => { setPinConfirm(e.target.value); setPinError(''); setPinSuccess(false) }}
              placeholder="••••"
              className={inputClass}
            />
          </div>
          {pinError && <p className="text-red-500 text-xs">{pinError}</p>}
          {pinSuccess && <p className="text-green-600 text-xs font-medium">PIN cambiado correctamente</p>}
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold"
          >
            Cambiar PIN
          </button>
        </div>
      </form>

      {/* App settings */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-50 rounded-lg p-1.5"><Globe size={16} className="text-purple-600" /></div>
          <h3 className="font-semibold text-gray-800">Configuración General</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la empresa / app</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="ControlPréstamos Pro"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Moneda</label>
            <div className="flex gap-2 flex-wrap">
              {MONEDAS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoneda(m)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    moneda === m
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-gray-400" />
              <label className="text-xs font-medium text-gray-600">Tiempo de bloqueo automático</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {TIEMPOS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTiempoBloqueo(t.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    tiempoBloqueo === t.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {saved ? 'Guardado!' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
