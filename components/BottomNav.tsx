'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/historial', label: 'Historial', icon: '📊' },
  { href: '/vip', label: 'VIP', icon: '👑' },
  { href: '/vivo', label: 'En Vivo', icon: '⚡' },
  { href: '/usuario', label: 'Usuario', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

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
              className="text-[10px] font-semibold"
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
