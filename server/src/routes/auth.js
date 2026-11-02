import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db, save, uid } from '../db.js'
import { sign, requireAuth } from '../auth.js'

const router = Router()
const pub = (u) => ({ id: u.id, name: u.name, email: u.email })

router.post('/signup', (req, res) => {
  const { name = '', email = '', password = '' } = req.body
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  if (db.users.some((u) => u.email === email.toLowerCase())) return res.status(409).json({ error: 'An account with this email already exists' })
  const user = { id: uid(), name: name.trim() || email.split('@')[0], email: email.toLowerCase(), passwordHash: bcrypt.hashSync(password, 10) }
  db.users.push(user)
  save()
  res.status(201).json({ token: sign(user), user: pub(user) })
})

router.post('/login', (req, res) => {
  const { email = '', password = '' } = req.body
  const user = db.users.find((u) => u.email === email.toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password' })
  res.json({ token: sign(user), user: pub(user) })
})

router.get('/me', requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.userId)
  user ? res.json({ user: pub(user) }) : res.status(401).json({ error: 'User not found' })
})

export default router
