import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../services/api.js'

function List({ title, children }) {
  return <div className="card p-5"><h3 className="font-semibold mb-3">{title}</h3>{children}</div>
}

export default function Overview() {
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.stats().then(setData).catch((e) => setError(e.message)) }, [])

  const stats = data && [
    ['Total AI Assistants', data.assistants],
    ['Documents Uploaded', data.documents],
    ['Questions Answered', data.questions],
    ['Knowledge Base Storage', data.storage],
  ]
  const loading = !data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24" />)
          : stats.map(([label, value]) => (
              <div key={label} className="card p-5"><p className="muted text-sm">{label}</p><p className="text-3xl font-bold mt-1">{value}</p></div>
            ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">Assistant performance</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={data?.perDay || []}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7c5cff" stopOpacity={0.5} /><stop offset="1" stopColor="#7c5cff" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="day" stroke="#8f9bb8" fontSize={12} /><YAxis stroke="#8f9bb8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111a30', border: '1px solid #1f2b48', borderRadius: 12 }} />
                <Area dataKey="questions" stroke="#a78bfa" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <List title="Quick actions">
          <div className="space-y-2">
            <button className="btn-primary w-full" onClick={() => nav('/app/assistants/new')}>+ New assistant</button>
            <button className="btn-ghost w-full" onClick={() => nav('/app/chat')}>Open chat</button>
          </div>
        </List>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <List title="Recent activity">{(data?.activity || []).map((a, i) => <p key={i} className="text-sm py-2 muted border-b border-navy-700 last:border-0 flex justify-between gap-2"><span>{a.text}</span><span className="shrink-0">{a.when}</span></p>)}</List>
        <List title="Recently uploaded">{(data?.recentDocs || []).map(({ name: n, size: s }) => <p key={n} className="text-sm py-2 flex justify-between border-b border-navy-700 last:border-0">📄 {n}<span className="muted">{s}</span></p>)}</List>
        <List title="Popular questions">{(data?.popular || []).map(({ q, n }) => <p key={q} className="text-sm py-2 muted border-b border-navy-700 last:border-0 flex justify-between gap-2"><span>“{q}”</span><span>{n}×</span></p>)}</List>
      </div>
    </div>
  )
}
