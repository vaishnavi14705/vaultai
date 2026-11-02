import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export default function KnowledgeBase() {
  const [docs, setDocs] = useState(null)
  useEffect(() => { api.documents().then(setDocs).catch(() => setDocs([])) }, [])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>
      {!docs ? <div className="skeleton h-40" /> : docs.length === 0 ? (
        <div className="card p-10 text-center muted">No documents yet. Upload some when creating an assistant.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="muted text-left"><tr>{['Document', 'Assistant', 'Size', 'Chunks', 'Uploaded'].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{docs.map((d) => (
              <tr key={d.id} className="border-t border-navy-700"><td className="p-3">📄 {d.name}</td><td className="p-3 muted">{d.assistant}</td><td className="p-3 muted">{d.size}</td><td className="p-3 muted">{d.chunks}</td><td className="p-3 muted">{d.uploadedAt}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
