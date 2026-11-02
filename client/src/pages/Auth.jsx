import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useApp, DEMO } from '../context/AppContext.jsx'

const TITLES = { login: 'Welcome back', signup: 'Create your account', forgot: 'Reset your password' }

export default function Auth({ mode }) {
  const { authenticate } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const validate = () => {
    const e = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (mode !== 'forgot' && form.password.length < 8) e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    if (mode === 'forgot') return setSent(true) // password reset email is mocked
    setBusy(true)
    try { await authenticate(mode, form); nav('/app') }
    catch (err) { setServerError(err.message) }
    finally { setBusy(false) }
  }

  const google = () => authenticate('login', DEMO).then(() => nav('/app')).catch((e) => setServerError(e.message)) // Google OAuth is UI-only

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="card p-8 w-full max-w-md">
        <Logo />
        <h1 className="text-2xl font-bold mt-6">{TITLES[mode]}</h1>
        {sent ? (
          <p className="muted mt-4">If an account exists for that email, a reset link has been sent (mocked).</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
            {mode === 'signup' && <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
            <div>
              <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            {mode !== 'forgot' && (
              <div>
                <div className="relative">
                  <input className="input pr-10" type={show ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 muted" aria-label="Toggle password visibility">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            )}
            {serverError && <p className="text-red-400 text-sm">{serverError}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : mode === 'login' ? 'Log in' : 'Sign up'}</button>
            {mode !== 'forgot' && <button type="button" className="btn-ghost w-full" onClick={google}>Continue with Google</button>}
          </form>
        )}
        {mode === 'login' && <p className="muted text-xs mt-4">Demo account: {DEMO.email} / {DEMO.password}</p>}
        <p className="muted text-sm mt-4 flex justify-between">
          {mode === 'login' ? (<><Link to="/signup">Create account</Link><Link to="/forgot-password">Forgot password?</Link></>) : <Link to="/login">Back to login</Link>}
        </p>
      </div>
    </div>
  )
}
