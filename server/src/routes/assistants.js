import { Router } from 'express'
import multer from 'multer'
import { db, save, uid } from '../db.js'
import { requireAuth } from '../auth.js'
import { ingest, ALLOWED, extOf } from '../ingest.js'

const router = Router()
router.use(requireAuth)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(ALLOWED.includes(extOf(file.originalname)) ? null : new Error('Only PDF, DOCX, TXT and CSV files are supported'), ALLOWED.includes(extOf(file.originalname))),
})

const mine = (req) => db.assistants.filter((a) => a.userId === req.userId)

router.get('/', (req, res) => {
  res.json(mine(req).map((a) => ({ ...a, docs: db.documents.filter((d) => d.assistantId === a.id).length })))
})

router.post('/', upload.array('files', 20), async (req, res, next) => {
  try {
    const { name = '', desc = '', dept = 'General', avatar = '🤖' } = req.body
    if (!name.trim()) return res.status(400).json({ error: 'Assistant name is required' })
    const a = { id: uid(), userId: req.userId, name: name.trim(), desc, dept, avatar, createdAt: Date.now() }
    db.assistants.push(a)
    const docs = await ingest({ userId: req.userId, assistantId: a.id, files: req.files || [] })
    save()
    res.status(201).json({ ...a, docs: docs.length })
  } catch (e) { next(e) }
})

router.post('/:id/documents', upload.array('files', 20), async (req, res, next) => {
  try {
    const a = mine(req).find((x) => x.id === req.params.id)
    if (!a) return res.status(404).json({ error: 'Assistant not found' })
    const docs = await ingest({ userId: req.userId, assistantId: a.id, files: req.files || [] })
    save()
    res.status(201).json({ added: docs.length })
  } catch (e) { next(e) }
})

router.delete('/:id', (req, res) => {
  if (!mine(req).some((a) => a.id === req.params.id)) return res.status(404).json({ error: 'Assistant not found' })
  db.assistants = db.assistants.filter((a) => a.id !== req.params.id)
  db.documents = db.documents.filter((d) => d.assistantId !== req.params.id)
  db.chats = db.chats.filter((c) => c.assistantId !== req.params.id)
  save()
  res.json({ ok: true })
})

export default router
