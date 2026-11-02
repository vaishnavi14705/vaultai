import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-lg">
      <span className="w-8 h-8 rounded-lg grid place-items-center bg-gradient-to-br from-violet-500 to-blue-500">
        <ShieldCheck size={18} />
      </span>
      VaultAI
    </Link>
  )
}
