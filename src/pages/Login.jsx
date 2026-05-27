import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CreditCard, Delete } from 'lucide-react'

export default function Login() {
  const { state, dispatch } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function handleDigit(d) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) {
      setTimeout(() => checkPin(next), 100)
    }
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1))
    setError('')
  }

  function checkPin(entered) {
    if (entered === state.config.pin) {
      dispatch({ type: 'LOGIN' })
    } else {
      setShake(true)
      setError('PIN incorrecto')
      setPin('')
      setTimeout(() => setShake(false), 500)
    }
  }

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del']

  return (
    <div className="min-h-screen bg-primary-800 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="bg-white/10 rounded-2xl p-4 inline-flex mb-4">
          <CreditCard size={48} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-white text-2xl font-bold">{state.config.appName}</h1>
        <p className="text-primary-200 text-sm mt-1">Control de Préstamos</p>
      </div>

      {/* PIN dots */}
      <div className={`flex gap-4 mb-6 ${shake ? 'animate-bounce' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              i < pin.length
                ? 'bg-white border-white'
                : 'border-white/50 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      <div className="h-6 mb-4">
        {error && (
          <p className="text-red-300 text-sm font-medium text-center">{error}</p>
        )}
      </div>

      {/* PIN pad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {digits.map((d, idx) => {
          if (d === null) return <div key={idx} />
          if (d === 'del') {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-2xl h-16 flex items-center justify-center transition-colors"
              >
                <Delete size={22} />
              </button>
            )
          }
          return (
            <button
              key={idx}
              onClick={() => handleDigit(String(d))}
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-2xl font-semibold rounded-2xl h-16 flex items-center justify-center transition-colors"
            >
              {d}
            </button>
          )
        })}
      </div>

      <p className="text-primary-300 text-xs mt-8">PIN por defecto: 1234</p>
    </div>
  )
}
