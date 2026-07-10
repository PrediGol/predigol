'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Usuario() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('¡Cuenta creada! Ya podés usar la app.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      }
    }

    setSubmitting(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <main className="max-w-sm mx-auto px-4 py-6 flex items-center justify-center" style={{ minHeight: '70vh' }}>
        <div className="text-sm text-muted">Cargando...</div>
      </main>
    )
  }

  if (session) {
    return (
      <main className="max-w-sm mx-auto px-4 py-6 flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
        <div className="text-4xl mb-4">👤</div>
        <div className="text-lg font-bold mb-2 text-center">Tu Cuenta</div>
        <p className="text-sm text-muted text-center mb-6">{session.user.email}</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-cardBorder"
        >
          Cerrar sesión
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-6 flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
      <div className="text-4xl mb-4">👤</div>
      <div className="text-lg font-bold mb-6 text-center">
        {mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg px-3 py-2 text-sm bg-card border border-cardBorder"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-lg px-3 py-2 text-sm bg-card border border-cardBorder"
        />

        {message && (
          <div className="text-xs text-center text-yellowc">{message}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg py-2 text-sm font-bold bg-amber text-bg"
        >
          {submitting ? 'Cargando...' : mode === 'register' ? 'Crear cuenta gratis' : 'Entrar'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
        className="text-xs text-muted mt-4"
      >
        {mode === 'register' ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate'}
      </button>
    </main>
  )
}
