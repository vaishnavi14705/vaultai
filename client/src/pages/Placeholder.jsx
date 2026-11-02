export default function Placeholder({ title }) {
  return (
    <div className="card p-12 text-center">
      <p className="text-4xl">🚧</p>
      <p className="mt-3 font-semibold capitalize">{title}</p>
      <p className="muted text-sm mt-1">This section is ready to be wired to the backend.</p>
    </div>
  )
}
