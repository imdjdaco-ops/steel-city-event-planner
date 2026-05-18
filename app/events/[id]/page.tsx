
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

import Sidebar from '../../../components/Sidebar'


export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(true)

  const [event, setEvent] = useState<any>(null)
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [scheduleItems, setScheduleItems] = useState<any[]>([])
  const [productionItems, setProductionItems] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const [averageTicketPrice, setAverageTicketPrice] = useState(45)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>(null)

  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
const [scheduleView, setScheduleView] = useState('timeline')

  const [showProductionForm, setShowProductionForm] = useState(false)
  const [editingProductionId, setEditingProductionId] = useState<string | null>(null)

  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

const [openSections, setOpenSections] = useState({
  overview: true,
  budget: true,
  schedule: true,
  production: true,
  vendors: true,
  tasks: true,
})



  const emptyBudgetForm = {
    name: '',
    category: '',
    item_type: 'expense',
    estimated_amount: 0,
    actual_amount: 0,
    status: 'planned',
    notes: '',
  }

  const emptyTaskForm = {
    title: '',
    category: '',
    status: 'Not Started',
    priority: 'Medium',
    due_date: '',
    assigned_to: '',
    notes: '',
  }

const emptyScheduleForm = {
  title: '',
  schedule_type: 'Workshop',
  start_time: '',
  end_time: '',
  room: '',
  assigned_person: '',
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

  const [budgetForm, setBudgetForm] = useState(emptyBudgetForm)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm)
  const [productionForm, setProductionForm] = useState(emptyProductionForm)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)

  async function loadAll() {
    if (!eventId) return

    const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle()
    const { data: budgetData } = await supabase.from('budget_items').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    const { data: taskData } = await supabase.from('tasks').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    const { data: scheduleData } = await supabase.from('schedule_items').select('*').eq('event_id', eventId).order('start_time', { ascending: true })
    const { data: productionData } = await supabase.from('production_items').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    const { data: servicesData } = await supabase.from('event_services').select('*').eq('event_id', eventId).order('created_at', { ascending: false })

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

    await supabase.from('events').update({
      name: form.name,
      event_type: form.event_type,
      status: form.status,
      start_date: form.start_date,
      end_date: form.end_date,
      attendance_goal: Number(form.attendance_goal),
      revenue_goal: Number(form.revenue_goal),
      description: form.description,
    }).eq('id', eventId)

    setEditing(false)
    loadAll()
  }

  async function saveBudgetItem(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      event_id: eventId,
      name: budgetForm.name,
      category: budgetForm.category,
      item_type: budgetForm.item_type,
      estimated_amount: Number(budgetForm.estimated_amount),
      actual_amount: Number(budgetForm.actual_amount),
      status: budgetForm.status,
      notes: budgetForm.notes,
    }

    if (editingBudgetId) {
      await supabase.from('budget_items').update(payload).eq('id', editingBudgetId)
    } else {
      await supabase.from('budget_items').insert([payload])
    }

    setBudgetForm(emptyBudgetForm)
    setEditingBudgetId(null)
    setShowBudgetForm(false)
    loadAll()
  }

  function editBudgetItem(item: any) {
    setBudgetForm({
      name: item.name || '',
      category: item.category || '',
      item_type: item.item_type || 'expense',
      estimated_amount: item.estimated_amount || 0,
      actual_amount: item.actual_amount || 0,
      status: item.status || 'planned',
      notes: item.notes || '',
    })

    setEditingBudgetId(item.id)
    setShowBudgetForm(true)
  }

  async function deleteBudgetItem(id: string) {
    if (!window.confirm('Delete this budget item?')) return
    await supabase.from('budget_items').delete().eq('id', id)
    loadAll()
  }

  async function saveTask(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      event_id: eventId,
      title: taskForm.title,
      category: taskForm.category,
      status: taskForm.status,
      priority: taskForm.priority,
      due_date: taskForm.due_date || null,
      assigned_to: taskForm.assigned_to,
      notes: taskForm.notes,
      completed_at: taskForm.status === 'Done' ? new Date().toISOString() : null,
    }

    if (editingTaskId) {
      await supabase.from('tasks').update(payload).eq('id', editingTaskId)
    } else {
      await supabase.from('tasks').insert([payload])
    }

    setTaskForm(emptyTaskForm)
    setEditingTaskId(null)
    setShowTaskForm(false)
    loadAll()
  }

  function editTask(task: any) {
    setTaskForm({
      title: task.title || '',
      category: task.category || '',
      status: task.status || 'Not Started',
      priority: task.priority || 'Medium',
      due_date: task.due_date || '',
      assigned_to: task.assigned_to || '',
      notes: task.notes || '',
    })

    setEditingTaskId(task.id)
    setShowTaskForm(true)
  }

  async function updateTaskStatus(id: string, status: string) {
    await supabase.from('tasks').update({
      status,
      completed_at: status === 'Done' ? new Date().toISOString() : null,
    }).eq('id', id)

    loadAll()
  }

  async function deleteTask(id: string) {
    if (!window.confirm('Delete this task?')) return
    await supabase.from('tasks').delete().eq('id', id)
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
  assigned_person: scheduleForm.assigned_person,
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
  assigned_person: item.assigned_person || '',
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

  const budgetEstimatedIncome = budgetItems.filter((item) => item.item_type === 'income').reduce((sum, item) => sum + Number(item.estimated_amount || 0), 0)
  const budgetEstimatedExpenses = budgetItems.filter((item) => item.item_type === 'expense').reduce((sum, item) => sum + Number(item.estimated_amount || 0), 0)
  const budgetActualIncome = budgetItems.filter((item) => item.item_type === 'income').reduce((sum, item) => sum + Number(item.actual_amount || 0), 0)
  const budgetActualExpenses = budgetItems.filter((item) => item.item_type === 'expense').reduce((sum, item) => sum + Number(item.actual_amount || 0), 0)

  const productionEstimated = productionItems.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0)
  const productionActual = productionItems.reduce((sum, item) => sum + Number(item.actual_cost || 0), 0)

  const servicesEstimated = services.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0)
  const servicesActual = services.reduce((sum, item) => sum + Number(item.actual_cost || 0), 0)

  const totalEstimatedCosts = budgetEstimatedExpenses + productionEstimated + servicesEstimated
  const totalActualCosts = budgetActualExpenses + productionActual + servicesActual
  const projectedProfit = budgetEstimatedIncome - totalEstimatedCosts
  const actualProfit = budgetActualIncome - totalActualCosts
  const breakEvenAttendees = averageTicketPrice > 0 ? Math.ceil(totalEstimatedCosts / averageTicketPrice) : 0
  const projectedRevenueAtGoal = Number(event?.attendance_goal || 0) * averageTicketPrice
  const projectedProfitAtGoal = projectedRevenueAtGoal - totalEstimatedCosts

  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0

const openTasks = tasks.filter((task) => task.status !== 'Done').length

const assignedScheduleItems = scheduleItems.filter(
  (item) => item.assigned_person
).length

const volunteerScheduleItems = scheduleItems.filter((item) => {
  const type = item.schedule_type?.toLowerCase() || ''
  return (
    type.includes('volunteer') ||
    type.includes('staff') ||
    type.includes('registration') ||
    type.includes('door') ||
    type.includes('crew')
  )
}).length

function getDayLabel(dateString: string) {
  if (!dateString) return 'No Date'

  const datePart = dateString.split('T')[0]

  if (!datePart) return 'No Date'

  const [year, month, day] = datePart.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function getTimeLabel(dateString: string) {
  if (!dateString) return 'No time'

  const timePart = dateString.split('T')[1]?.slice(0, 5)

  if (!timePart) return 'No time'

  const [hourString, minute] = timePart.split(':')
  const hour = Number(hourString)

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

function groupScheduleByRoom(items: any[]) {
  return items.reduce((groups, item) => {
    const key = item.room || 'No Room / Floor'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {} as Record<string, any[]>)
}

function groupScheduleByStaff(items: any[]) {
  return items.reduce((groups, item) => {
    const key = item.assigned_person || 'Unassigned'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {} as Record<string, any[]>)
}

function toggleSection(section: keyof typeof openSections) {
  setOpenSections((prev) => ({
    ...prev,
    [section]: !prev[section],
  }))
}

function getScheduleColor(type: string) {
  const normalized = type?.toLowerCase() || ''

  if (normalized.includes('workshop')) {
    return 'border-blue-400 bg-blue-50 text-blue-800'
  }

  if (normalized.includes('party')) {
    return 'border-purple-400 bg-purple-50 text-purple-800'
  }

  if (normalized.includes('volunteer') || normalized.includes('staff') || normalized.includes('registration') || normalized.includes('door')) {
    return 'border-amber-400 bg-amber-50 text-amber-800'
  }

  if (normalized.includes('setup') || normalized.includes('soundcheck') || normalized.includes('cleanup') || normalized.includes('breakdown')) {
    return 'border-slate-400 bg-slate-50 text-slate-800'
  }

  if (normalized.includes('performance')) {
    return 'border-pink-400 bg-pink-50 text-pink-800'
  }

  return 'border-slate-300 bg-white text-slate-800'
}


  if (checkingAuth) return <main className="min-h-screen bg-slate-100 p-8 text-slate-950">Checking access...</main>
  if (loading) return <main className="min-h-screen bg-slate-100 p-8">Loading...</main>
  if (!event) return <main className="min-h-screen bg-slate-100 p-8">Event not found.</main>

  return (
   <main className="min-h-screen bg-slate-100 text-slate-950 lg:flex">
  <Sidebar />

  <div className="flex-1 p-8">

      <div className="max-w-6xl mx-auto space-y-8">
<div className="flex flex-wrap gap-4 items-center">
  <Link href="/" className="border border-slate-300 text-slate-900 rounded-2xl px-4 py-2 font-semibold hover:bg-black hover:text-white">
    ← Back to dashboard
  </Link>

<Link
  href={`/events/${eventId}/run-sheet`}
  className="border border-slate-300 text-slate-900 rounded-2xl px-4 py-2 font-semibold hover:bg-black hover:text-white">
  Event-Day Run Sheet
</Link>
</div>

        <section className="bg-slate-950 text-white rounded-3xl p-8">
          <div className="flex justify-between gap-4">
            <span className="bg-white/10 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full">{event.status}</span>
            <button onClick={() => setEditing(!editing)} className="bg-white text-slate-950 rounded-2xl px-4 py-2 font-semibold">
              {editing ? 'Cancel' : 'Edit Event'}
            </button>
          </div>

          <h1 className="text-4xl font-bold mt-5">{event.name}</h1>
          <p className="text-slate-300 mt-3">{event.event_type} • {event.start_date}</p>
          <p className="text-slate-300 mt-5 max-w-3xl">{event.description || 'No description added yet.'}</p>
        </section>

        {editing && form && (
          <form onSubmit={saveEvent} className="FormGrid">
            <Field label="Event Name"><input className="Input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Event Type"><input className="Input" value={form.event_type || ''} onChange={(e) => setForm({ ...form, event_type: e.target.value })} /></Field>
            <Field label="Start Date"><input className="Input" type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
            <Field label="End Date"><input className="Input" type="date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
            <Field label="Attendance Goal"><input className="Input" type="number" value={form.attendance_goal || 0} onChange={(e) => setForm({ ...form, attendance_goal: Number(e.target.value) })} /></Field>
            <Field label="Revenue Goal"><input className="Input" type="number" value={form.revenue_goal || 0} onChange={(e) => setForm({ ...form, revenue_goal: Number(e.target.value) })} /></Field>

            <Field label="Status">
              <select className="Input" value={form.status || 'Planning'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Idea</option>
                <option>Planning</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Archived</option>
              </select>
            </Field>

            <Field label="Description" full>
              <textarea className="Input" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>

            <button className="Button md:col-span-2">Save Changes</button>
          </form>
        )}

<section className="grid grid-cols-1 md:grid-cols-4 gap-5">
  <Stat label="Attendance Goal" value={event.attendance_goal} />
  <Stat label="Total Estimated Costs" value={`$${totalEstimatedCosts}`} />
  <Stat label="Break-Even" value={`${breakEvenAttendees} attendees`} />
  <Stat label="Open Tasks" value={openTasks} />
  <Stat label="Task Progress" value={`${taskProgress}%`} />
  <Stat label="Schedule Items" value={scheduleItems.length} />
  <Stat label="Assigned Schedule Items" value={assignedScheduleItems} />
  <Stat label="Volunteer Shifts" value={volunteerScheduleItems} />
</section>

        <section className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-5">
          <div>
            <h2 className="text-3xl font-bold">Budget Calculator</h2>
            <p className="text-slate-600 mt-1">Combines budget expenses, production costs, and vendor/service costs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="Average Ticket Price">
              <input className="Input" type="number" value={averageTicketPrice} onChange={(e) => setAverageTicketPrice(Number(e.target.value))} />
            </Field>

            <MiniStat label="Total Estimated Costs" value={`$${totalEstimatedCosts}`} />
            <MiniStat label="Break-Even Attendees" value={breakEvenAttendees} />
            <MiniStat label="Profit At Goal" value={`$${projectedProfitAtGoal}`} />
          </div>

          <p className="text-sm text-slate-700">
            At an average ticket price of <strong>${averageTicketPrice}</strong>, you need approximately <strong>{breakEvenAttendees}</strong> attendees to cover about <strong>${totalEstimatedCosts}</strong> in estimated event costs.
          </p>
        </section>

<CollapsibleSectionHeader
  title="Budget"
  subtitle="Track direct financial income and expenses like venue, flights, hotels, artist fees, marketing, and ticket revenue."
  summary={`${budgetItems.length} items • $${budgetEstimatedExpenses} expenses • $${budgetEstimatedIncome} income`}
  button={showBudgetForm ? 'Cancel' : '+ Add Budget Item'}
  isOpen={openSections.budget}
  onToggle={() => toggleSection('budget')}
  onButtonClick={() => {
    setShowBudgetForm(!showBudgetForm)
    setEditingBudgetId(null)
    setBudgetForm(emptyBudgetForm)
  }}
/>
{openSections.budget && (
  <div className="space-y-6">

        {showBudgetForm && (
          <form onSubmit={saveBudgetItem} className="FormGrid">
            <Field label="Item Name"><input className="Input" value={budgetForm.name} onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })} required /></Field>
            <Field label="Category"><input className="Input" value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} /></Field>

            <Field label="Item Type">
              <select className="Input" value={budgetForm.item_type} onChange={(e) => setBudgetForm({ ...budgetForm, item_type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Field>

            <Field label="Status">
              <select className="Input" value={budgetForm.status} onChange={(e) => setBudgetForm({ ...budgetForm, status: e.target.value })}>
                <option value="planned">Planned</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>

            <Field label="Estimated Amount"><input className="Input" type="number" value={budgetForm.estimated_amount} onChange={(e) => setBudgetForm({ ...budgetForm, estimated_amount: Number(e.target.value) })} /></Field>
            <Field label="Actual Amount"><input className="Input" type="number" value={budgetForm.actual_amount} onChange={(e) => setBudgetForm({ ...budgetForm, actual_amount: Number(e.target.value) })} /></Field>
            <Field label="Notes" full><textarea className="Input" value={budgetForm.notes} onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })} /></Field>

            <button className="Button md:col-span-2">{editingBudgetId ? 'Save Budget Changes' : 'Save Budget Item'}</button>
          </form>
        )}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MiniStat label="Budget Income" value={`$${budgetEstimatedIncome}`} />
          <MiniStat label="Budget Expenses" value={`$${budgetEstimatedExpenses}`} />
          <MiniStat label="Projected Profit" value={`$${projectedProfit}`} />
          <MiniStat label="Actual Profit" value={`$${actualProfit}`} />
        </section>

        <CardList>
          {budgetItems.map((item) => (
            <ItemCard key={item.id}>
              <div>
                <p className="text-xs uppercase text-slate-500">{item.category}</p>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-slate-600 capitalize">{item.item_type} • {item.status}</p>
                <p className="text-sm text-slate-600">Estimated: ${item.estimated_amount} • Actual: ${item.actual_amount}</p>
              </div>
              <Actions onEdit={() => editBudgetItem(item)} onDelete={() => deleteBudgetItem(item.id)} />
            </ItemCard>
          ))}
          {budgetItems.length === 0 && <p className="text-slate-500">No budget items yet.</p>}
        </CardList>

  </div>
)}

<CollapsibleSectionHeader
  title="Tasks"
  subtitle="Track production, planning, marketing, and operational tasks for this event."
  summary={`${tasks.length} tasks • ${openTasks} open • ${taskProgress}% complete`}
  button={showTaskForm ? 'Cancel' : '+ Add Task'}
  isOpen={openSections.tasks}
  onToggle={() => toggleSection('tasks')}
  onButtonClick={() => {
    setShowTaskForm(!showTaskForm)
    setEditingTaskId(null)
    setTaskForm(emptyTaskForm)
  }}
/>

{openSections.tasks && (
  <div className="space-y-6">


        {showTaskForm && (
          <form onSubmit={saveTask} className="FormGrid">
            <Field label="Task Title"><input className="Input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required /></Field>
            <Field label="Category"><input className="Input" value={taskForm.category} onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })} /></Field>

            <Field label="Status">
              <select className="Input" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Done</option>
                <option>Blocked</option>
              </select>
            </Field>

            <Field label="Priority">
              <select className="Input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>

            <Field label="Due Date"><input className="Input" type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} /></Field>
            <Field label="Assigned To"><input className="Input" value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })} /></Field>
            <Field label="Notes" full><textarea className="Input" value={taskForm.notes} onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })} /></Field>

            <button className="Button md:col-span-2">{editingTaskId ? 'Save Task Changes' : 'Save Task'}</button>
          </form>
        )}

        <CardList>
          {tasks.map((task) => (
            <ItemCard key={task.id}>
              <div>
                <p className="text-xs uppercase text-slate-500">{task.category || 'General'}</p>
                <h3 className="text-lg font-bold">{task.title}</h3>
                <p className="text-sm text-slate-600">Priority: {task.priority} {task.due_date ? `• Due: ${task.due_date}` : ''}</p>
                {task.assigned_to && <p className="text-sm text-slate-600">Assigned to: {task.assigned_to}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <select className="border rounded-xl p-2" value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value)}>
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Done</option>
                  <option>Blocked</option>
                </select>
                <Actions onEdit={() => editTask(task)} onDelete={() => deleteTask(task.id)} />
              </div>
            </ItemCard>
          ))}
          {tasks.length === 0 && <p className="text-slate-500">No tasks yet.</p>}
        </CardList>
  </div>
)}

<CollapsibleSectionHeader
  title="Schedule"
  subtitle="Build the event timeline, workshops, performances, volunteer shifts, and production schedule."
  summary={`${scheduleItems.length} items • ${assignedScheduleItems} assigned • ${volunteerScheduleItems} volunteer shifts`}
  button={showScheduleForm ? 'Cancel' : '+ Add Schedule Item'}
  isOpen={openSections.schedule}
  onToggle={() => toggleSection('schedule')}
  onButtonClick={() => {
    setShowScheduleForm(!showScheduleForm)
    setEditingScheduleId(null)
    setScheduleForm(emptyScheduleForm)
  }}
/>

{openSections.tasks && (
  <div className="space-y-6">
    {/* task form + task cards go here */}


        {showScheduleForm && (
          <form onSubmit={saveScheduleItem} className="FormGrid">
            <Field label="Title"><input className="Input" value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} required /></Field>

            <Field label="Schedule Type">
 <select className="Input" value={scheduleForm.schedule_type} onChange={(e) => setScheduleForm({ ...scheduleForm, schedule_type: e.target.value })}>
  <option>Workshop</option>
  <option>Party</option>
  <option>Setup</option>
  <option>Soundcheck</option>
  <option>Performance</option>
  <option>Break</option>
  <option>Doors Open</option>
  <option>Cleanup</option>
  <option>Volunteer Shift</option>
  <option>Check-In / Registration</option>
  <option>Door Staff</option>
  <option>Setup Crew</option>
  <option>Breakdown Crew</option>
  <option>Food / Hospitality</option>
  <option>Bar Support</option>
</select>
            </Field>

            <Field label="Start Time"><input className="Input" type="datetime-local" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} /></Field>
            <Field label="End Time"><input className="Input" type="datetime-local" value={scheduleForm.end_time} onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })} /></Field>
            <Field label="Room / Floor"><input className="Input" value={scheduleForm.room} onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })} /></Field>
<Field label="Assigned Person / Volunteer">
  <input
    className="Input"
    value={scheduleForm.assigned_person}
    onChange={(e) =>
      setScheduleForm({
        ...scheduleForm,
        assigned_person: e.target.value,
      })
    }
  />
</Field>
            <Field label="Notes" full><textarea className="Input" value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} /></Field>

            <button className="Button md:col-span-2">{editingScheduleId ? 'Save Schedule Changes' : 'Save Schedule Item'}</button>
          </form>
        )}

       <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
  <div className="flex flex-wrap gap-3">
    <button
      onClick={() => setScheduleView('timeline')}
      className={`rounded-2xl px-4 py-2 font-semibold ${
        scheduleView === 'timeline'
          ? 'bg-slate-950 text-white'
          : 'border border-slate-300 text-slate-800'
      }`}
    >
      Timeline
    </button>

    <button
      onClick={() => setScheduleView('day')}
      className={`rounded-2xl px-4 py-2 font-semibold ${
        scheduleView === 'day'
          ? 'bg-slate-950 text-white'
          : 'border border-slate-300 text-slate-800'
      }`}
    >
      By Day
    </button>

    <button
      onClick={() => setScheduleView('room')}
      className={`rounded-2xl px-4 py-2 font-semibold ${
        scheduleView === 'room'
          ? 'bg-slate-950 text-white'
          : 'border border-slate-300 text-slate-800'
      }`}
    >
      By Room/Floor
    </button>

    <button
      onClick={() => setScheduleView('staff')}
      className={`rounded-2xl px-4 py-2 font-semibold ${
        scheduleView === 'staff'
          ? 'bg-slate-950 text-white'
          : 'border border-slate-300 text-slate-800'
      }`}
    >
      By Staff/Volunteer
    </button>
  </div>

  {scheduleItems.length === 0 && (
    <p className="text-slate-500">No schedule items yet.</p>
  )}

  {scheduleView === 'timeline' && (
    <div className="space-y-4">
      {scheduleItems.map((item) => (
<ScheduleTimelineItem
  key={item.id}
  item={item}
  getTimeLabel={getTimeLabel}
  getScheduleColor={getScheduleColor}
  onEdit={() => editScheduleItem(item)}
  onDelete={() => deleteScheduleItem(item.id)}
/>
      ))}
    </div>
  )}

  {scheduleView === 'day' && (
    <GroupedScheduleView
      groups={groupScheduleByDay(scheduleItems)}
      getTimeLabel={getTimeLabel}
getScheduleColor={getScheduleColor}
      onEdit={editScheduleItem}
      onDelete={deleteScheduleItem}
    />
  )}

  {scheduleView === 'room' && (
    <GroupedScheduleView
      groups={groupScheduleByRoom(scheduleItems)}
      getTimeLabel={getTimeLabel}
getScheduleColor={getScheduleColor}
      onEdit={editScheduleItem}
      onDelete={deleteScheduleItem}
    />
  )}

  {scheduleView === 'staff' && (
    <GroupedScheduleView
      groups={groupScheduleByStaff(scheduleItems)}
      getTimeLabel={getTimeLabel}
getScheduleColor={getScheduleColor}
      onEdit={editScheduleItem}
      onDelete={deleteScheduleItem}
    />
  )}
</section>
  </div>
)}

<CollapsibleSectionHeader
  title="Production Items"
  subtitle="Track sound, lighting, DJ equipment, rentals, and technical production needs."
  summary={`${productionItems.length} items • $${productionEstimated} estimated`}
  button={showProductionForm ? 'Cancel' : '+ Add Production Item'}
  isOpen={openSections.production}
  onToggle={() => toggleSection('production')}
  onButtonClick={() => {
    setShowProductionForm(!showProductionForm)
    setEditingProductionId(null)
    setProductionForm(emptyProductionForm)
  }}
/>

{openSections.production && (
  <div className="space-y-6">
    {showProductionForm && (

          <form onSubmit={saveProductionItem} className="FormGrid">
            <Field label="Item Name"><input className="Input" value={productionForm.name} onChange={(e) => setProductionForm({ ...productionForm, name: e.target.value })} required /></Field>
            <Field label="Category"><input className="Input" value={productionForm.category} onChange={(e) => setProductionForm({ ...productionForm, category: e.target.value })} /></Field>
            <Field label="Quantity"><input className="Input" type="number" value={productionForm.quantity} onChange={(e) => setProductionForm({ ...productionForm, quantity: Number(e.target.value) })} /></Field>

            <Field label="Status">
              <select className="Input" value={productionForm.status} onChange={(e) => setProductionForm({ ...productionForm, status: e.target.value })}>
                <option>Needed</option>
                <option>Confirmed</option>
                <option>Packed</option>
                <option>Delivered</option>
                <option>Returned</option>
                <option>Cancelled</option>
              </select>
            </Field>

            <Field label="Ownership Type">
              <select className="Input" value={productionForm.ownership_type} onChange={(e) => setProductionForm({ ...productionForm, ownership_type: e.target.value })}>
                <option>Owned</option>
                <option>Rental</option>
                <option>Borrowed</option>
                <option>Vendor</option>
              </select>
            </Field>

            <Field label="Rental Needed?">
              <label className="flex items-center gap-3 border rounded-xl p-3 bg-white">
                <input type="checkbox" checked={productionForm.rental_needed} onChange={(e) => setProductionForm({ ...productionForm, rental_needed: e.target.checked })} />
                Yes, rental is needed
              </label>
            </Field>

            <Field label="Estimated Cost"><input className="Input" type="number" value={productionForm.estimated_cost} onChange={(e) => setProductionForm({ ...productionForm, estimated_cost: Number(e.target.value) })} /></Field>
            <Field label="Actual Cost"><input className="Input" type="number" value={productionForm.actual_cost} onChange={(e) => setProductionForm({ ...productionForm, actual_cost: Number(e.target.value) })} /></Field>
            <Field label="Vendor Name"><input className="Input" value={productionForm.vendor_name} onChange={(e) => setProductionForm({ ...productionForm, vendor_name: e.target.value })} /></Field>
            <Field label="Owner / Responsible Person"><input className="Input" value={productionForm.owner} onChange={(e) => setProductionForm({ ...productionForm, owner: e.target.value })} /></Field>
            <Field label="Notes" full><textarea className="Input" value={productionForm.notes} onChange={(e) => setProductionForm({ ...productionForm, notes: e.target.value })} /></Field>

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
              </div>
              <Actions onEdit={() => editProductionItem(item)} onDelete={() => deleteProductionItem(item.id)} />
            </ItemCard>
          ))}
    </CardList>
  </div>
)}


<CollapsibleSectionHeader
  title="Vendors & Services"
  subtitle="Manage external vendors, food, bar service, photography, security, and other contracted services."
  summary={`${services.length} services • $${servicesEstimated} estimated`}
  button={showServiceForm ? 'Cancel' : '+ Add Service'}
  isOpen={openSections.vendors}
  onToggle={() => toggleSection('vendors')}
  onButtonClick={() => {
    setShowServiceForm(!showServiceForm)
    setEditingServiceId(null)
    setServiceForm(emptyServiceForm)
  }}
/>

{openSections.vendors && (
  <div className="space-y-6">
    {showServiceForm && (
      <form onSubmit={saveService} className="FormGrid">
            <Field label="Service / Vendor Name"><input className="Input" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required /></Field>
            <Field label="Service Type"><input className="Input" value={serviceForm.service_type} onChange={(e) => setServiceForm({ ...serviceForm, service_type: e.target.value })} /></Field>
            <Field label="Contact Name"><input className="Input" value={serviceForm.contact_name} onChange={(e) => setServiceForm({ ...serviceForm, contact_name: e.target.value })} /></Field>
            <Field label="Contact Email"><input className="Input" value={serviceForm.contact_email} onChange={(e) => setServiceForm({ ...serviceForm, contact_email: e.target.value })} /></Field>
            <Field label="Contact Phone"><input className="Input" value={serviceForm.contact_phone} onChange={(e) => setServiceForm({ ...serviceForm, contact_phone: e.target.value })} /></Field>

            <Field label="Status">
              <select className="Input" value={serviceForm.status} onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}>
                <option>Needed</option>
                <option>Contacted</option>
                <option>Confirmed</option>
                <option>Paid</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </Field>

            <Field label="Estimated Cost"><input className="Input" type="number" value={serviceForm.estimated_cost} onChange={(e) => setServiceForm({ ...serviceForm, estimated_cost: Number(e.target.value) })} /></Field>
            <Field label="Actual Cost"><input className="Input" type="number" value={serviceForm.actual_cost} onChange={(e) => setServiceForm({ ...serviceForm, actual_cost: Number(e.target.value) })} /></Field>
            <Field label="Notes" full><textarea className="Input" value={serviceForm.notes} onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })} /></Field>

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
              </div>
              <Actions onEdit={() => editService(item)} onDelete={() => deleteService(item.id)} />
            </ItemCard>
          ))}
    </CardList>
  </div>
)}
      </div>

      <style jsx global>{`
        .Input {
          width: 100%;
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
 </div>
    </main>
  )
}

function ScheduleTimelineItem({
  item,
  getTimeLabel,
  getScheduleColor,
  onEdit,
  onDelete,
}: {
  item: any
  getTimeLabel: (dateString: string) => string
  getScheduleColor: (type: string) => string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
<div className={`grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 border-l-4 rounded-2xl p-5 ${getScheduleColor(item.schedule_type)}`}>
      <div>
        <p className="text-xl font-bold text-slate-950">
          {getTimeLabel(item.start_time)}
        </p>

        <p className="text-sm text-slate-500">
          to {getTimeLabel(item.end_time)}
        </p>
      </div>

      <div className="flex justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">
            {item.schedule_type}
          </p>

          <h3 className="text-xl font-bold mt-1">{item.title}</h3>

          {item.room && (
            <p className="text-sm text-slate-600 mt-2">
              Room/Floor: {item.room}
            </p>
          )}

          {item.assigned_person && (
            <p className="text-sm text-slate-600">
              Assigned: {item.assigned_person}
            </p>
          )}

          {item.notes && (
            <p className="text-sm text-slate-600 mt-3">{item.notes}</p>
          )}
        </div>

        <Actions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

function GroupedScheduleView({
  groups,
  getTimeLabel,
  getScheduleColor,
  onEdit,
  onDelete,
}: {
  groups: Record<string, any[]>
  getTimeLabel: (dateString: string) => string
  getScheduleColor: (type: string) => string
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupName, items]) => (
        <div key={groupName} className="space-y-3">
          <h3 className="text-2xl font-bold border-b border-slate-200 pb-2">
            {groupName}
          </h3>

          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 flex justify-between gap-4 ${getScheduleColor(item.schedule_type)}`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {getTimeLabel(item.start_time)} – {getTimeLabel(item.end_time)}
                </p>

                <h4 className="text-lg font-bold mt-1">{item.title}</h4>

                <p className="text-sm text-slate-600">
                  {item.schedule_type}
                  {item.room ? ` • ${item.room}` : ''}
                  {item.assigned_person ? ` • ${item.assigned_person}` : ''}
                </p>

                {item.notes && (
                  <p className="text-sm text-slate-600 mt-2">{item.notes}</p>
                )}
              </div>

              <Actions
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.id)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}


function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-slate-600 mb-2">{label}</label>
      {children}
    </div>
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

function MiniStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-amber-200">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function SectionHeader({ title, subtitle, button, onClick }: { title: string; subtitle: string; button: string; onClick: () => void }) {
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

function CollapsibleSectionHeader({
  title,
  subtitle,
  summary,
  button,
  isOpen,
  onToggle,
  onButtonClick,
}: {
  title: string
  subtitle: string
  summary?: string
  button: string
  isOpen: boolean
  onToggle: () => void
  onButtonClick: () => void
}) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button type="button" onClick={onToggle} className="text-left flex-1">
          <div className="flex items-start gap-3">
            <span className="text-2xl font-bold leading-none mt-1">
              {isOpen ? '−' : '+'}
            </span>

            <div>
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="text-slate-600 mt-1">{subtitle}</p>

              {!isOpen && summary && (
                <p className="text-sm font-semibold text-amber-700 mt-3">
                  {summary}
                </p>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onButtonClick}
          className="bg-slate-950 text-white rounded-2xl px-5 py-3 font-semibold hover:bg-slate-800"
        >
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
