'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

export default function RunSheetPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [scheduleItems, setScheduleItems] = useState<any[]>([])

  useEffect(() => {
    async function checkUserAndLoad() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setCheckingAuth(false)
      loadRunSheet()
    }

    checkUserAndLoad()
  }, [eventId, router])

  async function loadRunSheet() {
    if (!eventId) return

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle()

    const { data: scheduleData } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time', { ascending: true })

    setEvent(eventData)
    setScheduleItems(scheduleData || [])
    setLoading(false)
  }

  function getDayLabel(dateString: string) {
    if (!dateString) return 'No Date'

    const datePart = dateString.slice(0, 10)
    const [year, month, day] = datePart.split('-').map(Number)

    return new Date(year, month - 1, day).toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  function getTimeLabel(dateString: string) {
    if (!dateString) return 'No time'

    const match = dateString.match(/T(\d{2}):(\d{2})/)

    if (!match) return 'No time'

    const hour = Number(match[1])
    const minute = match[2]

    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12

    return `${displayHour}:${minute} ${period}`
  }

  function groupScheduleByDay(items: any[]) {
    return items.reduce((groups, item) => {
      const key = getDayLabel(item.start_time)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {} as Record<string, any[]>)
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-white p-8 text-slate-950">
        Checking access...
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-8 text-slate-950">
        Loading run sheet...
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-white p-8 text-slate-950">
        Event not found.
      </main>
    )
  }

  const groupedSchedule = groupScheduleByDay(scheduleItems)

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="no-print mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link
            href={`/events/${eventId}`}
            className="text-slate-600 hover:text-slate-950"
          >
            ← Back to Event
          </Link>

          <button
            onClick={() => window.print()}
            className="bg-slate-950 text-white rounded-2xl px-5 py-3 font-semibold hover:bg-slate-800"
          >
            Print / Save PDF
          </button>
        </div>

        <header className="border-b-4 border-slate-950 pb-6 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">
            Event Day Run Sheet
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mt-2">
            {event.name}
          </h1>

          <p className="text-xl text-slate-600 mt-3">
            {event.event_type} • {event.start_date}
          </p>

          {event.description && (
            <p className="text-slate-700 mt-4 max-w-3xl">
              {event.description}
            </p>
          )}
        </header>

        {scheduleItems.length === 0 ? (
          <p className="text-slate-500">No schedule items added yet.</p>
        ) : (
          <div className="space-y-10">
{Object.entries(groupedSchedule).map(([day, items]: [string, any[]]) => (
              <section key={day}>
                <h2 className="text-3xl font-bold bg-slate-950 text-white rounded-2xl px-5 py-3 mb-5">
                  {day}
                </h2>

                <div className="space-y-4">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 border border-slate-200 rounded-2xl p-5"
                    >
                      <div>
                        <p className="text-2xl font-bold">
                          {getTimeLabel(item.start_time)}
                        </p>

                        <p className="text-sm text-slate-500">
                          to {getTimeLabel(item.end_time)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">
                          {item.schedule_type}
                        </p>

                        <h3 className="text-2xl font-bold mt-1">
                          {item.title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-slate-700">
                          {item.room && (
                            <p>
                              <strong>Room/Floor:</strong> {item.room}
                            </p>
                          )}

                          {item.assigned_person && (
                            <p>
                              <strong>Assigned:</strong> {item.assigned_person}
                            </p>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <p className="font-semibold">Notes</p>
                            <p className="text-slate-700 mt-1">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          main {
            background: white !important;
          }
        }
      `}</style>
    </main>
  )
}