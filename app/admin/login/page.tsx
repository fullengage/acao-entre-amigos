'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('E-mail ou senha incorretos.')
    } else {
      router.push('/admin/dashboard')
    }
    setLoading(false)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔐</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>
            Área Admin
          </h1>
          <p style={{ color: '#8899bb', fontSize: '0.9rem' }}>
            Bolão da Seleção 2026
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@comunidade.com"
              required
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: 20,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : '🔓 Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#4a5a7a', fontSize: '0.8rem' }}>
          Acesso restrito ao administrador do sistema.
        </p>
      </div>
    </main>
  )
}
