import { createContext, useContext, useReducer, useEffect } from 'react'
import { getDemoData } from '../utils/demoData'

const STORAGE_KEY = 'controlprestamos_data'

const initialState = {
  autenticado: false,
  clientes: [],
  prestamos: [],
  pagos: [],
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
    case 'ADD_PRESTAMO':
      return { ...state, prestamos: [...state.prestamos, action.payload] }
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
      }
    case 'ADD_PAGO':
      return { ...state, pagos: [...state.pagos, action.payload] }
    case 'DELETE_PAGO':
      return {
        ...state,
        pagos: state.pagos.filter((pg) => pg.id !== action.payload),
      }
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
        config: { ...state.config, datosInicializados: true },
      }
    }
    case 'CLEAR_DATA':
      return {
        ...state,
        clientes: [],
        prestamos: [],
        pagos: [],
        config: { ...state.config, datosInicializados: true },
      }
    default:
      return state
  }
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
        config: state.config,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      // ignore
    }
  }, [state.clientes, state.prestamos, state.pagos, state.config])

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
