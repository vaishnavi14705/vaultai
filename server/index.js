import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './src/routes/auth.js'
import assistantRoutes from './src/routes/assistants.js'
import chatRoutes from './src/routes/chat.js'
import dataRoutes from './src/routes/data.js'
import { seedDemo } from './src/seed.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/assistants', assistantRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api', dataRoutes)

// Central error handler (multer errors, extraction failures, etc.)
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(400).json({ error: err.message || 'Something went wrong' })
})

seedDemo()
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`VaultAI API running on http://localhost:${PORT}`))
