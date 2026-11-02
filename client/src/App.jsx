import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import DashboardLayout from './pages/DashboardLayout.jsx'
import Overview from './pages/Overview.jsx'
import Assistants from './pages/Assistants.jsx'
import Wizard from './pages/Wizard.jsx'
import Chat from './pages/Chat.jsx'
import KnowledgeBase from './pages/KnowledgeBase.jsx'
import Placeholder from './pages/Placeholder.jsx'

function Protected({ children }) {
  const { user, ready } = useApp()
  if (!ready) return <div className="min-h-screen grid place-items-center muted">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      <Route path="/forgot-password" element={<Auth mode="forgot" />} />
      <Route path="/app" element={<Protected><DashboardLayout /></Protected>}>
        <Route index element={<Overview />} />
        <Route path="assistants" element={<Assistants />} />
        <Route path="assistants/new" element={<Wizard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        {['analytics', 'team', 'security', 'settings'].map((p) => (
          <Route key={p} path={p} element={<Placeholder title={p.replace('-', ' ')} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
