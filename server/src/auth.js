import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
export const sign = (user) => jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' })

// Protects routes: expects "Authorization: Bearer <token>"
export function requireAuth(req, res, next) {
  try {
    req.userId = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET).id
    next()
  } catch {
    res.status(401).json({ error: 'Please log in again' })
  }
}
