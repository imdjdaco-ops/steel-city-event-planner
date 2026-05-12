'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'



export default function EventDetailPage() {
  const params = useParams()
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id

  const [event, setEvent] = useState<any>(null)
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [scheduleItems, setScheduleItems] = useState<any[]>([])
  const [productionItems, setProductionItems] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
const [averageTicketPrice, setAverageTicketPrice] = useState(45)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>(null)

  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)

  const [showProductionForm, setShowProductionForm] = useState(false)
  const [editingProductionId, setEditingProductionId] = useState<string | null>(null)

  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

const router = useRouter()
const [checkingAuth, setCheckingAuth] = useState(true)

  const emptyScheduleForm = {
    title: '',
    schedule_type: 'Workshop',
    start_time: '',
    end_time: '',
    room: '',
    notes: '',
  }

  const emptyProductionForm = {
    name: '',
    category: '',
    quantity: 1,
    status: 'Needed',
    ownership_type: 'Owned',
    rental_needed: false,
    estimated_cost: 0,
    actual_cost: 0,
    vendor_name: '',
    owner: '',
    notes: '',
  }

  const emptyServiceForm = {
    name: '',
    service_type: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    estimated_cost: 0,
    actual_cost: 0,
    status: 'Needed',
    notes: '',
  }

  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm)
  const [productionForm, setProductionForm] = useState(emptyProductionForm)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)

const [cost, setCost] = useState("");

<input
  className="Input"
  type="number"
  placeholder="Estimated cost"
  value={cost} 
  onChange={(e) => setCost(e.target.value)}
/>

  async function loadAll() {
    if (!eventId) return

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle()

    const { data: budgetData } = await supabase
      .from('budget_items')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    const { data: scheduleData } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time', { ascending: true })

    const { data: productionData } = await supabase
      .from('production_items')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    const { data: servicesData } = await supabase
      .from('event_services')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    setEvent(eventData)
    setForm(eventData)
    setBudgetItems(budgetData || [])
    setTasks(taskData || [])
    setScheduleItems(scheduleData || [])
    setProductionItems(productionData || [])
    setServices(servicesData || [])
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
    loadAll()
  }

  checkUser()
}, [eventId, router])

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault()

    await supabase
      .from('events')
      .update({
        name: form.name,
        event_type: form.event_type,
        status: form.status,
        start_date: form.start_date,
        end_date: form.end_date,
        attendance_goal: Number(form.attendance_goal),
        revenue_goal: Number(form.revenue_goal),
        description: form.description,
      })
      .eq('id', eventId)

    setEditing(false)
    loadAll()
  }

  async function saveScheduleItem(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      event_id: eventId,
      title: scheduleForm.title,
      schedule_type: scheduleForm.schedule_type,
      start_time: scheduleForm.start_time || null,
      end_time: scheduleForm.end_time || null,
      room: scheduleForm.room,
      notes: scheduleForm.notes,
    }

    if (editingScheduleId) {
      await supabase.from('schedule_items').update(payload).eq('id', editingScheduleId)
    } else {
      await supabase.from('schedule_items').insert([payload])
    }

    setScheduleForm(emptyScheduleForm)
    setEditingScheduleId(null)
    setShowScheduleForm(false)
    loadAll()
  }

  function editScheduleItem(item: any) {
    setScheduleForm({
      title: item.title || '',
      schedule_type: item.schedule_type || 'Workshop',
      start_time: item.start_time ? item.start_time.slice(0, 16) : '',
      end_time: item.end_time ? item.end_time.slice(0, 16) : '',
      room: item.room || '',
      notes: item.notes || '',
    })

    setEditingScheduleId(item.id)
    setShowScheduleForm(true)
  }

  async function deleteScheduleItem(id: string) {
    if (!window.confirm('Delete this schedule item?')) return
    await supabase.from('schedule_items').delete().eq('id', id)
    loadAll()
  }

  async function saveProductionItem(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      event_id: eventId,
      name: productionForm.name,
      category: productionForm.category,
      quantity: Number(productionForm.quantity),
      status: productionForm.status,
      ownership_type: productionForm.ownership_type,
      rental_needed: productionForm.rental_needed,
      estimated_cost: Number(productionForm.estimated_cost),
      actual_cost: Number(productionForm.actual_cost),
      vendor_name: productionForm.vendor_name,
      owner: productionForm.owner,
      notes: productionForm.notes,
    }

    if (editingProductionId) {
      await supabase.from('production_items').update(payload).eq('id', editingProductionId)
    } else {
      await supabase.from('production_items').insert([payload])
    }

    setProductionForm(emptyProductionForm)
    setEditingProductionId(null)
    setShowProductionForm(false)
    loadAll()
  }

  function editProductionItem(item: any) {
    setProductionForm({
      name: item.name || '',
      category: item.category || '',
      quantity: item.quantity || 1,
      status: item.status || 'Needed',
      ownership_type: item.ownership_type || 'Owned',
      rental_needed: item.rental_needed || false,
      estimated_cost: item.estimated_cost || 0,
      actual_cost: item.actual_cost || 0,
      vendor_name: item.vendor_name || '',
      owner: item.owner || '',
      notes: item.notes || '',
    })

    setEditingProductionId(item.id)
    setShowProductionForm(true)
  }

  async function deleteProductionItem(id: string) {
    if (!window.confirm('Delete this production item?')) return
    await supabase.from('production_items').delete().eq('id', id)
    loadAll()
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      event_id: eventId,
      name: serviceForm.name,
      service_type: serviceForm.service_type,
      contact_name: serviceForm.contact_name,
      contact_email: serviceForm.contact_email,
      contact_phone: serviceForm.contact_phone,
      estimated_cost: Number(serviceForm.estimated_cost),
      actual_cost: Number(serviceForm.actual_cost),
      status: serviceForm.status,
      notes: serviceForm.notes,
    }

    if (editingServiceId) {
      await supabase.from('event_services').update(payload).eq('id', editingServiceId)
    } else {
      await supabase.from('event_services').insert([payload])
    }

    setServiceForm(emptyServiceForm)
    setEditingServiceId(null)
    setShowServiceForm(false)
    loadAll()
  }

  function editService(item: any) {
    setServiceForm({
      name: item.name || '',
      service_type: item.service_type || '',
      contact_name: item.contact_name || '',
      contact_email: item.contact_email || '',
      contact_phone: item.contact_phone || '',
      estimated_cost: item.estimated_cost || 0,
      actual_cost: item.actual_cost || 0,
      status: item.status || 'Needed',
      notes: item.notes || '',
    })

    setEditingServiceId(item.id)
    setShowServiceForm(true)
  }

  async function deleteService(id: string) {
    if (!window.confirm('Delete this service/vendor?')) return
    await supabase.from('event_services').delete().eq('id', id)
    loadAll()
  }

  const estimatedIncome = budgetItems
    .filter((item) => item.item_type === 'income')
    .reduce((sum, item) => sum + Number(item.estimated_amount || 0), 0)

  const estimatedExpenses = budgetItems
    .filter((item) => item.item_type === 'expense')
    .reduce((sum, item) => sum + Number(item.estimated_amount || 0), 0)

  const productionEstimated = productionItems.reduce(
    (sum, item) => sum + Number(item.estimated_cost || 0),
    0
  )

  const servicesEstimated = services.reduce(
    (sum, item) => sum + Number(item.estimated_cost || 0),
    0
  )

  const projectedProfit = estimatedIncome - estimatedExpenses - productionEstimated - servicesEstimated

const totalCostsToCover =
  estimatedExpenses + productionEstimated + servicesEstimated

const attendeesNeededToBreakEven =
  averageTicketPrice > 0
    ? Math.ceil(totalCostsToCover / averageTicketPrice)
    : 0

const projectedRevenueAtGoal =
  Number(event?.attendance_goal || 0) * averageTicketPrice

const projectedProfitAtGoal =
  projectedRevenueAtGoal - totalCostsToCover

  if (loading) return <main className="min-h-screen bg-slate-100 p-8">Loading...</main>
  if (!event) return <main className="min-h-screen bg-slate-100 p-8">Event not found.</main>
if (checkingAuth) {
  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-950">
      Checking access...
    </main>
  )
}


  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/" className="text-slate-600 hover:text-slate-950">
          ← Back to dashboard
        </Link>

        <section className="bg-slate-950 text-white rounded-3xl p-8">
          <div className="flex justify-between gap-4">
            <span className="bg-white/10 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
              {event.status}
            </span>

            <button
              onClick={() => setEditing(!editing)}
              className="bg-white text-slate-950 rounded-2xl px-4 py-2 font-semibold"
            >
              {editing ? 'Cancel' : 'Edit Event'}
            </button>
          </div>

          <h1 className="text-4xl font-bold mt-5">{event.name}</h1>
          <p className="text-slate-300 mt-3">{event.event_type} • {event.start_date}</p>
          <p className="text-slate-300 mt-5 max-w-3xl">{event.description || 'No description added yet.'}</p>
        </section>

        {editing && form && (
          <form onSubmit={saveEvent} className="bg-white rounded-3xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-xl p-3" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Event name" />
            <input className="border rounded-xl p-3" value={form.event_type || ''} onChange={(e) => setForm({ ...form, event_type: e.target.value })} placeholder="Event type" />
            <input className="border rounded-xl p-3" type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <input className="border rounded-xl p-3" type="date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <input className="border rounded-xl p-3" type="number" value={form.attendance_goal || 0} onChange={(e) => setForm({ ...form, attendance_goal: Number(e.target.value) })} />
            <input className="border rounded-xl p-3" type="number" value={form.revenue_goal || 0} onChange={(e) => setForm({ ...form, revenue_goal: Number(e.target.value) })} />

            <select className="border rounded-xl p-3" value={form.status || 'Planning'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Idea</option>
              <option>Planning</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Archived</option>
            </select>

            <textarea className="border rounded-xl p-3 md:col-span-2" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />

            <button className="bg-slate-950 text-white rounded-2xl py-3 font-semibold md:col-span-2">
              Save Changes
            </button>
          </form>
        )}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Stat label="Attendance Goal" value={event.attendance_goal} />
          <Stat label="Revenue Goal" value={`$${event.revenue_goal}`} />
          <Stat label="Production Costs" value={`$${productionEstimated}`} />
          <Stat label="Projected Profit" value={`$${projectedProfit}`} />
        </section>

<section className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-5">
  <div>
    <h3 className="text-2xl font-bold">Budget Calculator</h3>

    <p className="text-slate-600 mt-1">
      Estimate break-even attendance and profitability.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div>
      <label className="text-sm text-slate-600">
        Average Ticket Price
      </label>

      <input
        className="mt-2 w-full border rounded-xl p-3"
        type="number"
        value={averageTicketPrice}
        onChange={(e) =>
          setAverageTicketPrice(Number(e.target.value))
        }
      />
    </div>

    <div className="bg-white rounded-2xl p-4 border border-amber-200">
      <p className="text-sm text-slate-600">
        Total Costs
      </p>

      <p className="text-2xl font-bold">
        ${totalCostsToCover}
      </p>
    </div>

    <div className="bg-white rounded-2xl p-4 border border-amber-200">
      <p className="text-sm text-slate-600">
        Break-Even Attendance
      </p>

      <p className="text-2xl font-bold">
        {attendeesNeededToBreakEven}
      </p>
    </div>

    <div className="bg-white rounded-2xl p-4 border border-amber-200">
      <p className="text-sm text-slate-600">
        Profit At Goal
      </p>

      <p className="text-2xl font-bold">
        ${projectedProfitAtGoal}
      </p>
    </div>
  </div>

  <p className="text-sm text-slate-700">
    At an average ticket price of $
    {averageTicketPrice}, you need approximately{' '}
    <strong>{attendeesNeededToBreakEven}</strong>{' '}
    attendees to cover approximately{' '}
    <strong>${totalCostsToCover}</strong> in expenses.
  </p>
</section>

        <SectionHeader
          title="Schedule Builder"
          subtitle="Build the run-of-show, workshops, setup, and room timeline."
          button={showScheduleForm ? 'Cancel' : '+ Add Schedule Item'}
          onClick={() => {
            setShowScheduleForm(!showScheduleForm)
            setEditingScheduleId(null)
            setScheduleForm(emptyScheduleForm)
          }}
        />

        {showScheduleForm && (
          <form onSubmit={saveScheduleItem} className="FormGrid">
            <input className="Input" placeholder="Title" value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} required />

            <select className="Input" value={scheduleForm.schedule_type} onChange={(e) => setScheduleForm({ ...scheduleForm, schedule_type: e.target.value })}>
              <option>Workshop</option>
              <option>Party</option>
              <option>Setup</option>
              <option>Soundcheck</option>
              <option>Performance</option>
              <option>Break</option>
              <option>Doors Open</option>
              <option>Cleanup</option>
            </select>

            <input className="Input" type="datetime-local" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} />
            <input className="Input" type="datetime-local" value={scheduleForm.end_time} onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} />
            <input className="Input" placeholder="Room / Floor" value={scheduleForm.room} onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })} />
            <textarea className="Input md:col-span-2" placeholder="Notes" value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />

            <button className="Button md:col-span-2">{editingScheduleId ? 'Save Schedule Changes' : 'Save Schedule Item'}</button>
          </form>
        )}

        <CardList>
          {scheduleItems.map((item) => (
            <ItemCard key={item.id}>
              <div>
                <p className="text-xs uppercase text-slate-500">{item.schedule_type}</p>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.start_time} → {item.end_time}</p>
                <p className="text-sm text-slate-600">{item.room}</p>
              </div>
              <Actions onEdit={() => editScheduleItem(item)} onDelete={() => deleteScheduleItem(item.id)} />
            </ItemCard>
          ))}
        </CardList>

        <SectionHeader
          title="Production Items"
          subtitle="Track sound, DJ gear, mics, lighting, rentals, ownership, and costs."
          button={showProductionForm ? 'Cancel' : '+ Add Production Item'}
          onClick={() => {
            setShowProductionForm(!showProductionForm)
            setEditingProductionId(null)
            setProductionForm(emptyProductionForm)
          }}
        />

        {showProductionForm && (
          <form onSubmit={saveProductionItem} className="FormGrid">
            <input className="Input" placeholder="Item name" value={productionForm.name} onChange={(e) => setProductionForm({ ...productionForm, name: e.target.value })} required />
            <input className="Input" placeholder="Category: Sound, Lighting, DJ Gear..." value={productionForm.category} onChange={(e) => setProductionForm({ ...productionForm, category: e.target.value })} />
            <input className="Input" type="number" placeholder="Quantity" value={productionForm.quantity} onChange={(e) => setProductionForm({ ...productionForm, quantity: Number(e.target.value) })} />

            <select className="Input" value={productionForm.status} onChange={(e) => setProductionForm({ ...productionForm, status: e.target.value })}>
              <option>Needed</option>
              <option>Confirmed</option>
              <option>Packed</option>
              <option>Delivered</option>
              <option>Returned</option>
              <option>Cancelled</option>
            </select>

            <select className="Input" value={productionForm.ownership_type} onChange={(e) => setProductionForm({ ...productionForm, ownership_type: e.target.value })}>
              <option>Owned</option>
              <option>Rental</option>
              <option>Borrowed</option>
              <option>Vendor</option>
            </select>

            <label className="flex items-center gap-3 border rounded-xl p-3 bg-white">
              <input type="checkbox" checked={productionForm.rental_needed} onChange={(e) => setProductionForm({ ...productionForm, rental_needed: e.target.checked })} />
              Rental needed?
            </label>

            <input className="Input" type="number" placeholder="Estimated cost" value={productionForm.estimated_cost} onChange={(e) => setProductionForm({ ...productionForm, estimated_cost: Number(e.target.value) })} />
            <input className="Input" type="number" placeholder="Actual cost" value={productionForm.actual_cost} onChange={(e) => setProductionForm({ ...productionForm, actual_cost: Number(e.target.value) })} />
            <input className="Input" placeholder="Vendor name" value={productionForm.vendor_name} onChange={(e) => setProductionForm({ ...productionForm, vendor_name: e.target.value })} />
            <input className="Input" placeholder="Owner / Responsible person" value={productionForm.owner} onChange={(e) => setProductionForm({ ...productionForm, owner: e.target.value })} />
            <textarea className="Input md:col-span-2" placeholder="Notes" value={productionForm.notes} onChange={(e) => setProductionForm({ ...productionForm, notes: e.target.value })} />

            <button className="Button md:col-span-2">{editingProductionId ? 'Save Production Changes' : 'Save Production Item'}</button>
          </form>
        )}

        <CardList>
          {productionItems.map((item) => (
            <ItemCard key={item.id}>
              <div>
                <p className="text-xs uppercase text-slate-500">{item.category}</p>
                <h3 className="text-lg font-bold">{item.name} × {item.quantity}</h3>
                <p className="text-sm text-slate-600">{item.ownership_type} • {item.status} • Rental: {item.rental_needed ? 'Yes' : 'No'}</p>
                <p className="text-sm text-slate-600">Estimated: ${item.estimated_cost} • Actual: ${item.actual_cost}</p>
                {item.owner && <p className="text-sm text-slate-600">Owner: {item.owner}</p>}
              </div>
              <Actions onEdit={() => editProductionItem(item)} onDelete={() => deleteProductionItem(item.id)} />
            </ItemCard>
          ))}
        </CardList>

        <SectionHeader
          title="Vendors / Services"
          subtitle="Track food, cash bar, rentals, photo/video, security, and outside services."
          button={showServiceForm ? 'Cancel' : '+ Add Vendor / Service'}
          onClick={() => {
            setShowServiceForm(!showServiceForm)
            setEditingServiceId(null)
            setServiceForm(emptyServiceForm)
          }}
        />

        {showServiceForm && (
          <form onSubmit={saveService} className="FormGrid">
            <input className="Input" placeholder="Service / Vendor name" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required />
            <input className="Input" placeholder="Type: Food, Cash Bar, Photo..." value={serviceForm.service_type} onChange={(e) => setServiceForm({ ...serviceForm, service_type: e.target.value })} />
            <input className="Input" placeholder="Contact name" value={serviceForm.contact_name} onChange={(e) => setServiceForm({ ...serviceForm, contact_name: e.target.value })} />
            <input className="Input" placeholder="Contact email" value={serviceForm.contact_email} onChange={(e) => setServiceForm({ ...serviceForm, contact_email: e.target.value })} />
            <input className="Input" placeholder="Contact phone" value={serviceForm.contact_phone} onChange={(e) => setServiceForm({ ...serviceForm, contact_phone: e.target.value })} />
            <select className="Input" value={serviceForm.status} onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}>
              <option>Needed</option>
              <option>Contacted</option>
              <option>Confirmed</option>
              <option>Paid</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <input className="Input" type="number" placeholder="Estimated cost" value={serviceForm.estimated_cost} onChange={(e) => setServiceForm({ ...serviceForm, estimated_cost: Number(e.target.value) })} />
            <input className="Input" type="number" placeholder="Actual cost" value={serviceForm.actual_cost} onChange={(e) => setServiceForm({ ...serviceForm, actual_cost: Number(e.target.value) })} />
            <textarea className="Input md:col-span-2" placeholder="Notes" value={serviceForm.notes} onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })} />

            <button className="Button md:col-span-2">{editingServiceId ? 'Save Service Changes' : 'Save Service'}</button>
          </form>
        )}

        <CardList>
          {services.map((item) => (
            <ItemCard key={item.id}>
              <div>
                <p className="text-xs uppercase text-slate-500">{item.service_type}</p>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-slate-600">{item.status} • Estimated: ${item.estimated_cost} • Actual: ${item.actual_cost}</p>
                {item.contact_name && <p className="text-sm text-slate-600">Contact: {item.contact_name}</p>}
              </div>
              <Actions onEdit={() => editService(item)} onDelete={() => deleteService(item.id)} />
            </ItemCard>
          ))}
        </CardList>
      </div>

      <style jsx global>{`
        .Input {
          border: 1px solid rgb(203 213 225);
          border-radius: 0.75rem;
          padding: 0.75rem;
          background: white;
        }

        .Button {
          background: rgb(2 6 23);
          color: white;
          border-radius: 1rem;
          padding: 0.75rem;
          font-weight: 700;
        }

        .FormGrid {
          background: white;
          border: 1px solid rgb(226 232 240);
          border-radius: 1.5rem;
          padding: 1.25rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .FormGrid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  button,
  onClick,
}: {
  title: string
  subtitle: string
  button: string
  onClick: () => void
}) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-slate-600 mt-1">{subtitle}</p>
        </div>

        <button onClick={onClick} className="bg-slate-950 text-white rounded-2xl px-5 py-3 font-semibold hover:bg-slate-800">
          {button}
        </button>
      </div>
    </section>
  )
}

function CardList({ children }: { children: React.ReactNode }) {
  return <section className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</section>
}

function ItemCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-slate-200 p-5 flex justify-between gap-4">{children}</div>
}

function Actions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <button onClick={onEdit} className="text-blue-700 font-semibold">Edit</button>
      <button onClick={onDelete} className="text-red-600 font-semibold">Delete</button>
    </div>
  )
}