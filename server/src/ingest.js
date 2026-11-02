import pdf from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'
import { db, uid } from './db.js'

export const ALLOWED = ['pdf', 'docx', 'txt', 'csv']
export const extOf = (name) => name.split('.').pop().toLowerCase()

// Returns [{ page, text }]. Only PDFs have real page numbers.
async function extract(file) {
  const ext = extOf(file.originalname)
  if (ext === 'pdf') {
    const pages = []
    const data = await pdf(file.buffer, {
      pagerender: async (page) => {
        const content = await page.getTextContent()
        const text = content.items.map((i) => i.str).join(' ')
        pages.push(text)
        return text
      },
    })
    let sections = pages.map((text, i) => ({ page: i + 1, text }))
    // Fallback: if page-by-page extraction found nothing, use the default full text
    if (!sections.some((s) => s.text.trim()) && data.text?.trim()) {
      sections = [{ page: null, text: data.text }]
    }
    return sections
  }
  if (ext === 'docx') {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer })
    return [{ page: null, text: value }]
  }
  return [{ page: null, text: file.buffer.toString('utf8') }] // txt, csv
}

// Split text into overlapping ~800 character chunks for retrieval.
export function chunk(sections, size = 800, overlap = 120) {
  const out = []
  for (const { page, text } of sections) {
    const t = text.replace(/[ \t]+/g, ' ').trim()
    let start = 0
    while (start < t.length) {
      let end = Math.min(start + size, t.length)
      if (end < t.length) {
        const sp = t.lastIndexOf(' ', end)
        if (sp > start + size / 2) end = sp
      }
      const piece = t.slice(start, end).trim()
      if (piece) out.push({ text: piece, page })
      if (end >= t.length) break
      start = end - overlap
    }
  }
  return out
}

export async function ingest({ userId, assistantId, files }) {
  const docs = []
  for (const f of files) {
    const sections = await extract(f)
    console.log('INGEST:', f.originalname, 'sections:', sections.length, 'text lengths:', sections.map((s) => s.text.length))

    const chunks = chunk(sections)
    if (!chunks.length) {
      throw new Error(`No readable text in ${f.originalname} (scanned/image PDF?)`)
    }

    const doc = {
      id: uid(),
      userId,
      assistantId,
      name: f.originalname,
      size: f.size,
      type: extOf(f.originalname),
      uploadedAt: Date.now(),
      chunks,
    }
    db.documents.push(doc)
    docs.push(doc)
  }
  return docs
}