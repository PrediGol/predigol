'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function BottomNav() {
  const pathname = usePathname()
  const [userLabel, setUserLabel] = useState('Usuario')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setUserLabel(data.session.user.email.split('@')[0])
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserLabel(session?.user?.email ? session.user.email.split('@')[0] : 'Usuario')
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const TABS = [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/historial', label: 'Historial', icon: '📊' },
    { href: '/vip', label: 'VIP', icon: '👑' },
    { href: '/vivo', label: 'En Vivo', icon: '⚡' },
    { href: '/usuario', label: userLabel, icon: '👤' },
  ]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-around py-3 px-2 z-50"
      style={{ background: '#0F131B', borderTop: '1px solid #232A38' }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-lg">{tab.icon}</span>
            <span
              className="text-[10px] font-semibold truncate max-w-[60px]"
              style={{ color: active ? '#FFB020' : '#8A94A6' }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
