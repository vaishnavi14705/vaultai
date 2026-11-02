import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../services/api.js'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export const DEMO = { email: 'demo@vaultai.com', password: 'demo12345' }

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [assistants, setAssistants] = useState([])
  const [ready, setReady] = useState(false) // true once we've checked the saved token

  const refreshAssistants = useCallback(() => api.assistants().then(setAssistants).catch(() => {}), [])

  // Restore session on page load
  useEffect(() => {
    if (!getToken()) return setReady(true)
    api.me()
      .then(({ user }) => { setUser(user); return refreshAssistants() })
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [refreshAssistants])

  // mode: 'login' | 'signup'
  const authenticate = async (mode, creds) => {
    const { token, user } = await api[mode](creds)
    setToken(token)
    setUser(user)
    await refreshAssistants()
  }
  const logout = () => { setToken(null); setUser(null); setAssistants([]) }

  const createAssistant = async (form) => { await api.createAssistant(form); await refreshAssistants() }
  const removeAssistant = async (id) => { await api.deleteAssistant(id); await refreshAssistants() }

  return (
    <AppContext.Provider value={{ user, ready, assistants, authenticate, logout, createAssistant, removeAssistant }}>
      {children}
    </AppContext.Provider>
  )
}
