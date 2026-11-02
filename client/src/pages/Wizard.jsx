import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const ALLOWED = ['pdf', 'docx', 'txt', 'csv']
const DEPTS = ['HR', 'IT', 'Legal', 'Finance', 'Sales', 'Engineering']
const AVATARS = ['🤖', '🧑‍💼', '🛠️', '⚖️', '💰', '🚀']
const STEPS = ['Details', 'Knowledge', 'Review']

export default function Wizard() {
  const { createAssistant } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', desc: '', dept: 'HR', avatar: '🤖' })
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const addFiles = (list) => {
    const valid = [...list].filter((f) => ALLOWED.includes(f.name.split('.').pop().toLowerCase()))
    setError(valid.length < list.length ? 'Only PDF, DOCX, TXT and CSV files are supported' : '')
    setFiles((prev) => [...prev, ...valid])
  }

  const next = () => {
    if (step === 0 && !form.name.trim()) return setError('Assistant name is required')
    setError('')
    setStep(step + 1)
  }

  const create = async () => {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    files.forEach((f) => fd.append('files', f))
    setBusy(true); setError('')
    try { await createAssistant(fd); nav('/app/assistants') }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-sm py-2 rounded-lg ${i === step ? 'bg-gradient-to-br from-violet-500 to-blue-500' : 'card muted'}`}>{i + 1}. {s}</div>
        ))}
      </div>
      <div className="card p-6 space-y-4">
        {step === 0 && (
          <>
            <input className="input" placeholder="Assistant name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className="input" rows={3} placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            <select className="input" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select>
            <div className="flex gap-2">
              {AVATARS.map((a) => (
                <button key={a} onClick={() => setForm({ ...form, avatar: a })} className={`text-2xl w-12 h-12 rounded-xl border ${form.avatar === a ? 'border-violet-500 bg-violet-500/20' : 'border-navy-700'}`}>{a}</button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
              className={`border-2 border-dashed rounded-xl p-10 text-center ${dragging ? 'border-violet-500 bg-violet-500/10' : 'border-navy-700'}`}>
              <UploadCloud className="mx-auto" size={36} />
              <p className="mt-2">Drag and drop files here</p>
              <p className="muted text-xs">PDF, DOCX, TXT, CSV</p>
              <label className="btn-primary inline-block mt-3 cursor-pointer">
                Browse files
                <input type="file" multiple hidden accept=".pdf,.docx,.txt,.csv" onChange={(e) => addFiles(e.target.files)} />
              </label>
            </div>
            {files.map((f, i) => (
              <div key={i} className="card p-3 flex justify-between text-sm">📄 {f.name}
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove"><X size={16} /></button>
              </div>
            ))}
          </>
        )}
        {step === 2 && (
          <div className="text-center">
            <div className="text-5xl">{form.avatar}</div>
            <h3 className="text-xl font-bold mt-2">{form.name}</h3>
            <p className="muted">{form.dept} · {files.length} document(s)</p>
            <p className="muted text-sm mt-2">{form.desc}</p>
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-between">
          <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          {step < 2 ? <button className="btn-primary" onClick={next}>Next</button> : <button className="btn-primary" disabled={busy} onClick={create}>{busy ? 'Indexing documents…' : 'Create assistant'}</button>}
        </div>
      </div>
    </div>
  )
}
