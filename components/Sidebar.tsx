import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-72 bg-slate-950 text-white p-5 lg:min-h-screen">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
          Steel City
        </p>
        <h1 className="text-2xl font-bold mt-1">Event Planner</h1>
        <p className="text-sm text-slate-400 mt-2">
          Internal production system
        </p>
      </div>

      <nav className="space-y-2">
        <Link className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="/">
          Dashboard
        </Link>

        <Link className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="/calendar">
          Calendar
        </Link>

        <Link className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="/archived">
          Archived Events
        </Link>
      </nav>
    </aside>
  )
}
