'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/jogos', label: 'Jogos', icon: '⚽' },
  { href: '/admin/jogadores', label: 'Jogadores', icon: '👕' },
  { href: '/admin/participantes', label: 'Participantes', icon: '👥' },
  { href: '/admin/financeiro', label: 'Financeiro', icon: '💰' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/admin/login') {
        router.replace('/admin/login')
      }
      setChecking(false)
    })
  }, [pathname, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>
  if (checking) return (
    <main style={{ padding: '120px 16px', textAlign: 'center' }}>
      <p style={{ color: '#8899bb' }}>Verificando acesso...</p>
    </main>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: 'rgba(10,15,26,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#8899bb', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔐 Admin
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>
            Bolão da Seleção
          </div>
          <div className="text-gradient-brazil" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            2026
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ display: 'block', marginBottom: 4 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(0,156,59,0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,156,59,0.3)' : '1px solid transparent',
                    color: isActive ? '#00C94F' : '#8899bb',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ display: 'block', marginBottom: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                color: '#8899bb',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              🌐 Ver Site Público
            </div>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.2)',
              color: '#f87171',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
