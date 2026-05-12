'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Event = {
  id: string
  name: string
  event_type: string
  status: string
  start_date: string
  attendance_goal: number
  revenue_goal: number
}

export default function HomePage() {
  const router = useRouter()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    event_type: '',
    status: 'Planning',
    start_date: '',
    end_date: '',
    attendance_goal: 0,
    revenue_goal: 0,
    description: '',
  })

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .neq('status', 'Archived')
      .order('start_date', { ascending: true })

    if (!error) {
      setEvents(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUserEmail(data.user.email || '')
      setCheckingAuth(false)
      fetchEvents()
    }

    checkUser()
  }, [router])

  async function addEvent(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase.from('events').insert([form])

    if (error) {
      alert('Error adding event')
      console.error(error)
      return
    }

    setShowForm(false)

    setForm({
      name: '',
      event_type: '',
      status: 'Planning',
      start_date: '',
      end_date: '',
      attendance_goal: 0,
      revenue_goal: 0,
      description: '',
    })

    fetchEvents()
  }

  async function archiveEvent(id: string) {
    const confirmArchive = window.confirm(
      'Archive this event? You can restore it later.'
    )

    if (!confirmArchive) return

    const { error } = await supabase
      .from('events')
      .update({
        status: 'Archived',
      })
      .eq('id', id)

    if (error) {
      alert('Error archiving event')
      console.error(error)
      return
    }

    fetchEvents()
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
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
        <div className="mb-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">
              Steel City
            </p>

            <h1 className="text-5xl font-bold mt-2">
              Event Planner
            </h1>

            <p className="text-slate-600 mt-3 text-lg">
              Internal production management platform for Steel City Kizomba and Onstart Media.
            </p>

            <p className="text-sm text-slate-500 mt-3">
              Logged in as {userEmail}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/archived"
              className="border border-slate-300 text-slate-900 rounded-2xl px-5 py-3 font-semibold hover:bg-white"
            >
              Archived
            </Link>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-slate-950 text-white rounded-2xl px-5 py-3 font-semibold hover:bg-slate-800"
            >
              {showForm ? 'Cancel' : '+ Add Event'}
            </button>

            <button
              onClick={logout}
              className="border border-slate-300 text-slate-900 rounded-2xl px-5 py-3 font-semibold hover:bg-white"
            >
              Logout
            </button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={addEvent}
            className="bg-white rounded-3xl border border-slate-200 p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              className="border rounded-xl p-3"
              placeholder="Event name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Event type"
              value={form.event_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  event_type: e.target.value,
                })
              }
            />

            <input
              className="border rounded-xl p-3"
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  start_date: e.target.value,
                })
              }
            />

            <input
              className="border rounded-xl p-3"
              type="date"
              value={form.end_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  end_date: e.target.value,
                })
              }
            />

            <input
              className="border rounded-xl p-3"
              type="number"
              placeholder="Attendance goal"
              value={form.attendance_goal}
              onChange={(e) =>
                setForm({
                  ...form,
                  attendance_goal: Number(e.target.value),
                })
              }
            />

            <input
              className="border rounded-xl p-3"
              type="number"
              placeholder="Revenue goal"
              value={form.revenue_goal}
              onChange={(e) =>
                setForm({
                  ...form,
                  revenue_goal: Number(e.target.value),
                })
              }
            />

            <select
              className="border rounded-xl p-3"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >
              <option>Idea</option>
              <option>Planning</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Archived</option>
            </select>

            <textarea
              className="border rounded-xl p-3 md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <button className="bg-slate-950 text-white rounded-2xl py-3 font-semibold md:col-span-2">
              Save Event
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-slate-600">
              No active events yet. Add your first event project.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
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
                    className="block text-center w-full bg-slate-950 text-white rounded-2xl py-3 font-semibold hover:bg-slate-800 transition"
                  >
                    Open Project
                  </Link>

                  <button
                    onClick={() => archiveEvent(event.id)}
                    className="w-full border border-amber-300 text-amber-700 rounded-2xl py-3 font-semibold hover:bg-amber-50 transition"
                  >
                    Archive
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