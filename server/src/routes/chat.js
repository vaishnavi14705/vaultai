import { Router } from 'express'
import { db, save, uid } from '../db.js'
import { requireAuth } from '../auth.js'
import { answer } from '../rag.js'

const router = Router()
router.use(requireAuth)

router.post('/', async (req, res, next) => {
  try {
    const { assistantId, question = '' } = req.body
    if (!question.trim()) return res.status(400).json({ error: 'Question is required' })
    const a = db.assistants.find((x) => x.id === assistantId && x.userId === req.userId)
    if (!a) return res.status(404).json({ error: 'Assistant not found' })
    const chunks = db.documents.filter((d) => d.assistantId === a.id).flatMap((d) => d.chunks.map((c) => ({ ...c, doc: d.name })))
    const result = await answer(question, chunks)
    db.chats.push({ id: uid(), userId: req.userId, assistantId: a.id, question: question.trim(), at: Date.now() })
    save()
    res.json(result)
  } catch (e) { next(e) }
})

export default router
