import { createContext, useContext, useReducer, useEffect } from 'react'
import { getDemoData } from '../utils/demoData'
import { calcularTotalAPagar } from '../utils/calculations'

const STORAGE_KEY = 'controlprestamos_data'

const initialState = {
  autenticado: false,
  clientes: [],
  prestamos: [],
  pagos: [],
  // Caja: libro de entradas (abonos) y salidas (préstamos nuevos)
  caja: { inicio: null, movimientos: [] },
  config: {
    pin: '1234',
    moneda: 'RD$',
    appName: 'ControlPréstamos Pro',
    tiempoBloqueo: 5,
    datosInicializados: false,
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, autenticado: true }
    case 'LOGOUT':
      return { ...state, autenticado: false }
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] }
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      }
    case 'DELETE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.filter((c) => c.id !== action.payload),
        prestamos: state.prestamos.filter((p) => p.clienteId !== action.payload),
        pagos: state.pagos.filter((pg) => pg.clienteId !== action.payload),
      }
    case 'ADD_PRESTAMO': {
      const p = action.payload
      const cliente = state.clientes.find((c) => c.id === p.clienteId)
      return {
        ...state,
        prestamos: [...state.prestamos, p],
        caja: addMovimiento(state.caja, {
          tipo: 'salida',
          monto: parseFloat(p.monto || 0),
          capital: parseFloat(p.monto || 0),
          interes: 0,
          concepto: `Préstamo nuevo · ${cliente?.nombre || ''}`,
          fecha: p.fechaInicio,
          refId: p.id,
        }),
      }
    }
    case 'UPDATE_PRESTAMO':
      return {
        ...state,
        prestamos: state.prestamos.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      }
    case 'DELETE_PRESTAMO':
      return {
        ...state,
        prestamos: state.prestamos.filter((p) => p.id !== action.payload),
        pagos: state.pagos.filter((pg) => pg.prestamoId !== action.payload),
        caja: removeMovimientos(state.caja, [
          action.payload,
          ...state.pagos.filter((pg) => pg.prestamoId === action.payload).map((pg) => pg.id),
        ]),
      }
    case 'ADD_PAGO': {
      const pg = action.payload
      const monto = parseFloat(pg.monto || 0)
      const prestamo = state.prestamos.find((p) => p.id === pg.prestamoId)
      const cliente = state.clientes.find((c) => c.id === pg.clienteId)
      // Cada abono se reparte proporcionalmente entre capital e interés
      let capital = monto
      if (prestamo) {
        const total = calcularTotalAPagar(prestamo.monto, prestamo.interes, prestamo.cuotas, prestamo.tipoInteres)
        if (total > 0) capital = monto * (parseFloat(prestamo.monto) / total)
      }
      return {
        ...state,
        pagos: [...state.pagos, pg],
        caja: addMovimiento(state.caja, {
          tipo: 'entrada',
          monto,
          capital,
          interes: monto - capital,
          concepto: `Abono · ${cliente?.nombre || ''}`,
          fecha: pg.fecha,
          refId: pg.id,
        }),
      }
    }
    case 'DELETE_PAGO':
      return {
        ...state,
        pagos: state.pagos.filter((pg) => pg.id !== action.payload),
        caja: removeMovimientos(state.caja, [action.payload]),
      }
    case 'ADD_MOVIMIENTO_CAJA':
      return { ...state, caja: addMovimiento(state.caja, action.payload) }
    case 'DELETE_MOVIMIENTO_CAJA':
      return {
        ...state,
        caja: {
          ...getCaja(state.caja),
          movimientos: getCaja(state.caja).movimientos.filter((m) => m.id !== action.payload),
        },
      }
    case 'RESET_CAJA':
      return { ...state, caja: { inicio: new Date().toISOString(), movimientos: [] } }
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } }
    case 'LOAD_DATA':
      return { ...state, ...action.payload }
    case 'RESET_DATA': {
      const demo = getDemoData()
      return {
        ...state,
        clientes: demo.clientes,
        prestamos: demo.prestamos,
        pagos: demo.pagos,
        caja: { inicio: new Date().toISOString(), movimientos: [] },
        config: { ...state.config, datosInicializados: true },
      }
    }
    case 'CLEAR_DATA':
      return {
        ...state,
        clientes: [],
        prestamos: [],
        pagos: [],
        caja: { inicio: new Date().toISOString(), movimientos: [] },
        config: { ...state.config, datosInicializados: true },
      }
    default:
      return state
  }
}

function getCaja(caja) {
  return caja && Array.isArray(caja.movimientos) ? caja : { inicio: null, movimientos: [] }
}

function addMovimiento(caja, mov) {
  const c = getCaja(caja)
  return {
    ...c,
    movimientos: [
      ...c.movimientos,
      { id: `m${Date.now()}${Math.floor(Math.random() * 1000)}`, creadoEn: new Date().toISOString(), ...mov },
    ],
  }
}

function removeMovimientos(caja, refIds) {
  const c = getCaja(caja)
  return { ...c, movimientos: c.movimientos.filter((m) => !m.refId || !refIds.includes(m.refId)) }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Keep autenticado false on page reload for security
        return { ...init, ...parsed, autenticado: false }
      }
    } catch (e) {
      // ignore
    }
    return init
  })

  // Auto-load demo data on first launch
  useEffect(() => {
    if (!state.config.datosInicializados) {
      dispatch({ type: 'RESET_DATA' })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      const toSave = {
        clientes: state.clientes,
        prestamos: state.prestamos,
        pagos: state.pagos,
        caja: state.caja,
        config: state.config,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      // ignore
    }
  }, [state.clientes, state.prestamos, state.pagos, state.caja, state.config])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
