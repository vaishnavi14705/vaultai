// Retrieval-Augmented Generation.
// 1) retrieve: BM25 ranking over the assistant's document chunks (swap for a vector DB later)
// 2) generate: OpenAI if OPENAI_API_KEY is set, otherwise a local extractive answer.
const STOP = new Set('a an the is are was were be been of to in on for and or with what how do does did our my your we i it this that can from by at as about when where which who whom will should'.split(' '))
const tokenize = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map((w) => (w.length > 3 ? w.replace(/s$/, '') : w))

export function search(chunks, query, k = 4) {
  const q = tokenize(query)
  if (!q.length || !chunks.length) return []
  const docs = chunks.map((c) => tokenize(c.text))
  const avg = docs.reduce((n, d) => n + d.length, 0) / docs.length || 1
  const df = {}
  docs.forEach((d) => new Set(d).forEach((w) => (df[w] = (df[w] || 0) + 1)))
  return chunks
    .map((c, i) => {
      const d = docs[i]
      let score = 0
      for (const w of new Set(q)) {
        const tf = d.filter((x) => x === w).length
        if (!tf) continue
        const idf = Math.log(1 + (chunks.length - df[w] + 0.5) / (df[w] + 0.5))
        score += idf * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.length / avg))))
      }
      return { ...c, score }
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

function extractive(question, hits) {
  const q = new Set(tokenize(question))
  const sentences = hits.slice(0, 2).flatMap((h) => h.text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 20))
  const scored = sentences.map((s, i) => ({ s, i, n: tokenize(s).filter((w) => q.has(w)).length })).filter((x) => x.n > 0)
  const best = scored.sort((a, b) => b.n - a.n).slice(0, 3).sort((a, b) => a.i - b.i)
  return best.map((x) => x.s).join(' ') || hits[0].text.slice(0, 300)
}

async function withOpenAI(question, hits) {
  const context = hits.map((h, i) => `[${i + 1}] (${h.doc}${h.page ? ', page ' + h.page : ''}) ${h.text}`).join('\n\n')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      messages: [
        { role: 'system', content: 'Answer ONLY from the provided company document excerpts. If the answer is not there, say you could not find it. Be concise.' },
        { role: 'user', content: `Excerpts:\n${context}\n\nQuestion: ${question}` },
      ],
    }),
  })
  if (!res.ok) throw new Error('OpenAI request failed')
  return (await res.json()).choices[0].message.content
}

export async function answer(question, chunks) {
  const hits = search(chunks, question)
  if (!hits.length) return { answer: 'I could not find that in your uploaded documents. Try rephrasing, or upload the relevant document.', sources: [], mode: 'local' }
  const sources = [...new Map(hits.slice(0, 3).map((h) => [h.doc + h.page, { doc: h.doc, page: h.page }])).values()]
  if (process.env.OPENAI_API_KEY) {
    try { return { answer: await withOpenAI(question, hits), sources, mode: 'openai' } } catch (e) { console.warn(e.message) }
  }
  return { answer: extractive(question, hits), sources, mode: 'local' }
}
