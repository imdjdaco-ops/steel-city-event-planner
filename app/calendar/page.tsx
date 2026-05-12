'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'


export default function CalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .neq('status', 'Archived')
        .order('start_date', { ascending: true })

      if (error) {
        console.error(error)
      }

      if (data) {
        const formattedEvents = data.map((event) => ({
          id: event.id,
          title: event.name,
          start: event.start_date,
          end: event.end_date || event.start_date,
          url: `/events/${event.id}`,
        }))

        setCalendarEvents(formattedEvents)
      }

      setLoading(false)
    }

    loadEvents()
  }, [])

  return (
 <main className="min-h-screen bg-slate-100 text-slate-950 lg:flex">
  <Sidebar />

  <div className="flex-1 p-8">

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">
              Steel City
            </p>

            <h1 className="text-5xl font-bold mt-2">
              Event Calendar
            </h1>

            <p className="text-slate-600 mt-3 text-lg">
              Master production calendar for active events.
            </p>
          </div>

          <Link
            href="/"
            className="bg-slate-950 text-white rounded-2xl px-5 py-3 font-semibold hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          {loading ? (
            <p className="text-slate-600">Loading calendar...</p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="auto"
              events={calendarEvents}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
            />
          )}
        </div>
      </div>
     </div>
    </main>
  )
}
