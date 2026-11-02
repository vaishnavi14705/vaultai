// Tiny JSON-file database so the project runs with zero setup.
// To move to MongoDB later, replace this module with Mongoose models.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')
const file = path.join(dir, 'db.json')

export const db = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, 'utf8'))
  : { users: [], assistants: [], documents: [], chats: [] }

export const save = () => {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(db))
}
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
