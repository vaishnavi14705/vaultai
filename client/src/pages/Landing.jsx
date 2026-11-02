import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Lock, Zap, Link2, Database, Building2, Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useApp, DEMO } from '../context/AppContext.jsx'

const FEATURES = [
  [BookOpen, 'Train AI on Your Documents', 'Upload PDFs, DOCX, TXT and CSV files.'],
  [Lock, 'Private Company Knowledge', 'Isolated knowledge bases per company.'],
  [Zap, 'Instant Intelligent Answers', 'Employees get answers in seconds.'],
  [Link2, 'Source-Based Responses', 'Every answer cites document and page.'],
  [Database, 'Secure Document Management', 'Retention rules and access logs.'],
  [Building2, 'Multi-Department Assistants', 'HR, IT, Legal, Finance, each with its own AI.'],
]
const STEPS = ['Upload your company documents', 'AI processes and indexes your knowledge', 'Employees ask questions', 'AI provides answers with document citations']
const SECURITY = ['Private knowledge bases', 'Role-based access control', 'Encrypted data storage', 'Secure document processing', 'No public sharing of company knowledge', 'Configurable data retention']

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } }

export default function Landing() {
  const nav = useNavigate()
  const { authenticate } = useApp()
  return (
    <div>
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-12 py-4 border-b border-navy-700 bg-navy-900/90 backdrop-blur">
        <Logo />
        <div className="hidden md:flex gap-8 text-sm muted">
          {['Product', 'Features', 'Security', 'Pricing'].map((x) => <a key={x} href={`#${x.toLowerCase()}`} className="hover:text-white">{x}</a>)}
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="btn-ghost">Login</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <header id="product" className="text-center px-6 pt-20 pb-12 max-w-4xl mx-auto">
        <p className="muted text-sm mb-3">Your Company’s Knowledge. Your Private AI.</p>
        <motion.h1 {...fade} className="text-4xl md:text-6xl font-extrabold leading-tight">
          Meet Your Company’s <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Private AI Assistant</span>
        </motion.h1>
        <p className="muted mt-5 text-lg">Turn your company knowledge into an intelligent assistant. Upload your documents, ask questions, and get instant answers — without compromising your data.</p>
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <button className="btn-primary" onClick={() => nav('/signup')}>Build Your AI Assistant</button>
          <button className="btn-ghost" onClick={() => authenticate('login', DEMO).then(() => nav('/app')).catch((e) => alert(e.message))}>Explore Demo</button>
        </div>
        <motion.div {...fade} className="glass mt-14 p-4 text-left max-w-2xl mx-auto">
          <div className="bg-white/5 rounded-xl p-3 text-sm ml-auto w-fit">What is our company’s leave policy?</div>
          <div className="card p-3 mt-3 text-sm max-w-[90%]">
            Employees get 24 paid leave days per year, with up to 5 carried forward.
            <div className="mt-2 text-xs text-violet-300">📄 HR_Handbook.pdf · Page 12, §4.2</div>
          </div>
        </motion.div>
      </header>

      <section id="features" className="px-6 md:px-12 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Everything your team needs</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(([Icon, title, text]) => (
            <motion.div key={title} {...fade} whileHover={{ y: -4 }} className="card p-5">
              <Icon className="text-violet-400" />
              <h3 className="font-semibold mt-3">{title}</h3>
              <p className="muted text-sm mt-1">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={s} className="card p-5">
              <div className="w-8 h-8 rounded-full grid place-items-center font-bold bg-gradient-to-br from-violet-500 to-blue-500">{i + 1}</div>
              <p className="mt-3 text-sm">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="security" className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold">Your Data Belongs to You. Always.</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-8 text-left">
          {SECURITY.map((s) => <div key={s} className="card p-4 flex gap-3"><Check className="text-emerald-400 shrink-0" size={20} />{s}</div>)}
        </div>
      </section>

      <section id="pricing" className="px-6 py-16">
        <div className="glass max-w-3xl mx-auto p-10 text-center">
          <h2 className="text-3xl font-bold">Give Your Team an AI That Knows Your Business.</h2>
          <Link to="/signup" className="btn-primary inline-block mt-6">Get Started</Link>
        </div>
      </section>
      <footer className="text-center muted text-sm py-8 border-t border-navy-700">© 2026 VaultAI</footer>
    </div>
  )
}
