'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type Event = {
  id: string
  name: string
  event_type: string
  status: string
  start_date: string
  attendance_goal: number
  revenue_goal: number
}

export default function ArchivedEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
const router = useRouter()
const [checkingAuth, setCheckingAuth] = useState(true)

  async function fetchArchivedEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'Archived')
      .order('start_date', { ascending: true })

    if (error) {
      alert('Error loading archived events')
      console.error(error)
      return
    }

    setEvents(data || [])
    setLoading(false)
  }

useEffect(() => {
  async function checkUser() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/login')
      return
    }

    setCheckingAuth(false)
    fetchArchivedEvents()
  }

  checkUser()
}, [router])

  async function restoreEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .update({
        status: 'Planning',
      })
      .eq('id', id)

    if (error) {
      alert('Error restoring event')
      console.error(error)
      return
    }

    fetchArchivedEvents()
  }
if (checkingAuth) {
  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-950">
      Checking access...
    </main>
  )
}

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">
              Steel City
            </p>

            <h1 className="text-5xl font-bold mt-2">
              Archived Events
            </h1>

            <p className="text-slate-600 mt-3 text-lg">
              Restore archived event projects if they were archived by accident.
            </p>
          </div>

          <Link
            href="/"
            className="bg-slate-950 text-white rounded-2xl px-5 py-3 font-semibold hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading archived events...</p>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-slate-600">No archived events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {event.status}
                  </span>

                  <span className="text-sm text-slate-500">
                    {event.event_type}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mt-5">
                  {event.name}
                </h2>

                <div className="mt-5 space-y-2 text-slate-700">
                  <p>📅 {event.start_date}</p>
                  <p>👥 Attendance Goal: {event.attendance_goal}</p>
                  <p>💰 Revenue Goal: ${event.revenue_goal}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link
                    href={`/events/${event.id}`}
                    className="block text-center w-full border border-slate-300 text-slate-900 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition"
                  >
                    View Project
                  </Link>

                  <button
                    onClick={() => restoreEvent(event.id)}
                    className="w-full bg-slate-950 text-white rounded-2xl py-3 font-semibold hover:bg-slate-800 transition"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}