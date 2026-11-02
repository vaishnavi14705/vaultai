import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Bot, Library, MessageSquare, BarChart3, Users, Shield, Settings, Menu, LogOut } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useApp } from '../context/AppContext.jsx'

const NAV = [
  [LayoutDashboard, 'Overview', '/app', true],
  [Bot, 'AI Assistants', '/app/assistants'],
  [Library, 'Knowledge Base', '/app/knowledge-base'],
  [MessageSquare, 'Chat', '/app/chat'],
  [BarChart3, 'Analytics', '/app/analytics'],
  [Users, 'Team Members', '/app/team'],
  [Shield, 'Security', '/app/security'],
  [Settings, 'Settings', '/app/settings'],
]

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { logout } = useApp()
  const nav = useNavigate()
  return (
    <div className="min-h-screen md:flex">
      <aside className={`fixed md:static z-20 inset-y-0 left-0 w-60 bg-navy-800 border-r border-navy-700 p-4 transition-transform ${open ? '' : '-translate-x-full md:translate-x-0'}`}>
        <Logo />
        <div className="mt-6 space-y-1">
          {NAV.map(([Icon, label, to, end]) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-violet-500/20 text-white' : 'muted hover:bg-white/5'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </div>
        <button className="btn-ghost w-full mt-8 text-sm flex items-center justify-center gap-2" onClick={() => { logout(); nav('/') }}>
          <LogOut size={16} /> Log out
        </button>
      </aside>
      <main className="flex-1 p-5 md:p-8 min-w-0">
        <button className="md:hidden mb-4" onClick={() => setOpen(!open)} aria-label="Menu"><Menu /></button>
        <Outlet />
      </main>
    </div>
  )
}
