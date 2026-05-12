'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-8 text-slate-950">
      <form
        onSubmit={login}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 w-full max-w-md space-y-5"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600 font-semibold">
            Steel City
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Event Planner Login
          </h1>

          <p className="text-slate-600 mt-3">
            Internal production management access.
          </p>
        </div>

        <input
          className="w-full border rounded-xl p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-xl p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-slate-950 text-white rounded-2xl py-3 font-semibold hover:bg-slate-800"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </main>
  )
}