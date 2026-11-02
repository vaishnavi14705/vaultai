# VaultAI — Your Private Company AI Assistant

Full-stack app: **React + Vite + Tailwind** (client) and **Node + Express** (server).
No database or API key needed to run it.

## Run it (2 commands)

Requires Node.js 18 or newer (https://nodejs.org).

    npm run setup     # installs root, server and client dependencies (one time)
    npm run dev       # starts the API (port 4000) and the website (port 5173)

Then open **http://localhost:5173**

Demo login: `demo@vaultai.com` / `demo12345` (or click "Explore Demo"). You can also sign up with any email.

## What works for real
- Signup/login with hashed passwords (bcrypt) and JWT sessions
- Upload PDF, DOCX, TXT, CSV: text is extracted, split into chunks and indexed
- Chat: retrieves the best matching chunks (BM25 ranking) and answers with the source document and PDF page
- Each user only sees their own assistants and documents
- Dashboard stats, chart, activity and popular questions come from real data

## Optional: real LLM answers
Copy `server/.env.example` to `server/.env` and set `OPENAI_API_KEY`. The server then sends the retrieved
chunks to OpenAI to write the answer (this is RAG). The key stays on the server and never reaches the browser.

## Project structure
    client/src/pages/           Landing, Auth, Dashboard pages, Wizard, Chat, KnowledgeBase
    client/src/context/         AppContext (auth + assistants state)
    client/src/services/api.js  all HTTP calls to the server
    server/index.js             Express app
    server/src/routes/          auth, assistants (upload), chat, data (stats/documents)
    server/src/rag.js           retrieval + answer generation
    server/src/ingest.js        text extraction + chunking
    server/src/db.js            JSON-file storage (data/db.json, created automatically)

## Upgrade path
- db.js -> MongoDB (Mongoose)
- rag.js search() -> vector DB (Pinecone / Chroma / FAISS) with embeddings, orchestrated via LangChain
- Google login -> OAuth; password reset -> email service

## Interview talking points
Layered server (routes / auth / ingest / rag / db), JWT middleware, per-user data isolation,
file validation (type and 10 MB limit), central error handler, all HTTP calls isolated in one client file,
protected routes with session restore.
