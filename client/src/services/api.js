// All server communication lives here. In dev, Vite proxies /api to http://localhost:4000.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api'

export const getToken = () => { try { return localStorage.getItem('vault_token') } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem('vault_token', t) : localStorage.removeItem('vault_token') } catch {} }

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let payload
  if (form) payload = form
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }

  let res
  try { res = await fetch(BASE + path, { method, headers, body: payload }) }
  catch { throw new Error('Cannot reach the server. Is the backend running?') }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status })
  return data
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  assistants: () => request('/assistants'),
  createAssistant: (form) => request('/assistants', { method: 'POST', form }),
  deleteAssistant: (id) => request(`/assistants/${id}`, { method: 'DELETE' }),
  stats: () => request('/stats'),
  documents: () => request('/documents'),
  ask: (assistantId, question) => request('/chat', { method: 'POST', body: { assistantId, question } }),
}
