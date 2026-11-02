import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

const fmt = (b) => (b > 1e9 ? (b / 1e9).toFixed(1) + ' GB' : b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB')
const ago = (t) => { const m = Math.round((Date.now() - t) / 6e4); return m < 60 ? `${Math.max(m, 1)}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago` }

router.get('/documents', (req, res) => {
  const name = Object.fromEntries(db.assistants.map((a) => [a.id, a.name]))
  res.json(db.documents.filter((d) => d.userId === req.userId).sort((a, b) => b.uploadedAt - a.uploadedAt)
    .map((d) => ({ id: d.id, name: d.name, size: fmt(d.size), type: d.type, assistant: name[d.assistantId], chunks: d.chunks.length, uploadedAt: ago(d.uploadedAt) })))
})

router.get('/stats', (req, res) => {
  const assistants = db.assistants.filter((a) => a.userId === req.userId)
  const docs = db.documents.filter((d) => d.userId === req.userId)
  const chats = db.chats.filter((c) => c.userId === req.userId)
  const perDay = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), questions: chats.filter((c) => c.at >= start && c.at < start + 864e5).length }
  })
  const counts = {}
  chats.forEach((c) => (counts[c.question] = (counts[c.question] || 0) + 1))
  const events = [
    ...chats.map((c) => ({ text: `Question: “${c.question}”`, at: c.at })),
    ...docs.map((d) => ({ text: `${d.name} indexed`, at: d.uploadedAt })),
  ].sort((a, b) => b.at - a.at).slice(0, 5).map((e) => ({ text: e.text, when: ago(e.at) }))
  res.json({
    assistants: assistants.length,
    documents: docs.length,
    questions: chats.length,
    storage: fmt(docs.reduce((n, d) => n + d.size, 0)),
    perDay,
    activity: events,
    recentDocs: [...docs].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 3).map((d) => ({ name: d.name, size: fmt(d.size) })),
    popular: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([q, n]) => ({ q, n })),
  })
})

export default router
