import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function Assistants() {
  const { assistants, removeAssistant } = useApp()
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI Assistants</h1>
        <Link to="/app/assistants/new" className="btn-primary flex items-center gap-1"><Plus size={16} /> New assistant</Link>
      </div>
      {assistants.length === 0 ? (
        <div className="card p-10 text-center muted">No assistants yet. Create your first one to get started.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {assistants.map((a) => (
            <div key={a.id} className="card p-5 hover:-translate-y-1 transition">
              <div className="text-3xl">{a.avatar}</div>
              <h3 className="font-semibold mt-2">{a.name}</h3>
              <p className="muted text-sm">{a.desc || '—'}</p>
              <p className="text-xs mt-3 text-violet-300 flex justify-between items-center">{a.dept} · {a.docs} documents
                <button aria-label="Delete" className="muted hover:text-red-400" onClick={() => confirm(`Delete ${a.name} and its documents?`) && removeAssistant(a.id)}><Trash2 size={14} /></button></p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
