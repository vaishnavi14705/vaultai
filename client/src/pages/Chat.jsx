import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'

const WELCOME = { role: 'ai', text: 'Hi! Ask me anything about the documents uploaded to this assistant.' }

export default function Chat() {
  const { assistants } = useApp()
  const [assistantId, setAssistantId] = useState('')
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottom = useRef(null)

  useEffect(() => { if (!assistantId && assistants[0]) setAssistantId(assistants[0].id) }, [assistants, assistantId])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  const send = async () => {
    if (!input.trim() || busy || !assistantId) return
    const q = input
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setBusy(true)
    try {
      const res = await api.ask(assistantId, q)
      setMessages((m) => [...m, { role: 'ai', text: res.answer, sources: res.sources }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', text: `Error: ${e.message}` }])
    } finally { setBusy(false) }
  }

  if (assistants.length === 0) return <div className="card p-10 text-center muted">Create an assistant first, then come back to chat.</div>

  return (
    <div className="card p-4 flex flex-col h-[75vh]">
      <select className="input w-auto mb-3 text-sm" value={assistantId} onChange={(e) => { setAssistantId(e.target.value); setMessages([WELCOME]) }}>
        {assistants.map((a) => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
      </select>
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`rounded-xl p-3 text-sm max-w-[85%] ${m.role === 'user' ? 'ml-auto bg-violet-600/30' : 'bg-white/5'}`}>
            {m.text}
            {m.sources?.map((s, j) => <div key={j} className="text-xs text-violet-300 mt-2">📄 {s.doc}{s.page ? ` · Page ${s.page}` : ''}</div>)}
          </div>
        ))}
        {busy && <div className="skeleton h-10 w-40" />}
        <div ref={bottom} />
      </div>
      <div className="flex gap-2 mt-3">
        <input className="input" placeholder="e.g. What is our leave policy?" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button className="btn-primary" onClick={send} aria-label="Send"><Send size={18} /></button>
      </div>
    </div>
  )
}
