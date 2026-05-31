'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Guess } from '@/types'

interface DashStats {
  totalGames: number
  totalGuesses: number
  pendingPayments: number
  confirmedPayments: number
  totalCollected: number
  prizeAmount: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null)
  const [recentGuesses, setRecentGuesses] = useState<Guess[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [gamesRes, guessesRes, pendingRes, confirmedRes, recentRes] = await Promise.all([
      supabase.from('games').select('*', { count: 'exact', head: true }),
      supabase.from('guesses').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase
        .from('guesses')
        .select('*, participant:participants(name, whatsapp), game:games(opponent)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const confirmed = confirmedRes.count || 0
    setStats({
      totalGames: gamesRes.count || 0,
      totalGuesses: guessesRes.count || 0,
      pendingPayments: pendingRes.count || 0,
      confirmedPayments: confirmed,
      totalCollected: confirmed * 10,
      prizeAmount: confirmed * 10 * 0.5,
    })
    setRecentGuesses(recentRes.data || [])
    setLoading(false)
  }

  if (loading) return <LoadingDash />

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>
          📊 Dashboard
        </h1>
        <p style={{ color: '#8899bb', fontSize: '0.9rem' }}>
          Visão geral do Bolão da Seleção 2026
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { icon: '⚽', label: 'Jogos Cadastrados', value: stats!.totalGames, color: '#00C94F' },
          { icon: '🎯', label: 'Total de Palpites', value: stats!.totalGuesses, color: '#FFDF00' },
          { icon: '⏳', label: 'Pagamentos Pendentes', value: stats!.pendingPayments, color: '#f59e0b', alert: stats!.pendingPayments > 0 },
          { icon: '✅', label: 'Palpites Confirmados', value: stats!.confirmedPayments, color: '#00C94F' },
          { icon: '💰', label: 'Total Arrecadado', value: formatCurrency(stats!.totalCollected), color: 'white' },
          { icon: '🏆', label: 'Prêmio Estimado', value: formatCurrency(stats!.prizeAmount), color: '#FFDF00' },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{
              padding: '20px 24px',
              border: s.alert ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
              background: s.alert ? 'rgba(245,158,11,0.05)' : undefined,
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#8899bb', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { href: '/admin/jogos', label: 'Novo Jogo', icon: '➕', desc: 'Cadastrar partida' },
          { href: '/admin/participantes', label: 'Confirmar Pagamentos', icon: '✅', desc: 'Validar palpites', highlight: stats!.pendingPayments > 0 },
          { href: '/ranking', label: 'Ver Ranking Público', icon: '🏆', desc: 'Abrir ranking' },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <div
              className="glass-card"
              style={{
                padding: '18px 20px',
                cursor: 'pointer',
                border: action.highlight ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{action.icon}</div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{action.label}</div>
              <div style={{ color: '#8899bb', fontSize: '0.8rem' }}>{action.desc}</div>
              {action.highlight && stats!.pendingPayments > 0 && (
                <div style={{ marginTop: 8, display: 'inline-block', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 999, padding: '2px 10px', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
                  {stats!.pendingPayments} pendentes
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent guesses */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: 16 }}>
          🕐 Últimos Palpites
        </h2>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {recentGuesses.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8899bb' }}>
              Nenhum palpite ainda.
            </div>
          ) : (
            recentGuesses.map((g, idx) => (
              <div
                key={g.id}
                style={{
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx < recentGuesses.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                    {g.participant?.name || '—'}
                  </div>
                  <div style={{ color: '#8899bb', fontSize: '0.78rem' }}>
                    Brasil x {g.game?.opponent} • {g.goals} gol(s)
                    {g.goals_details && g.goals_details.length > 0 ? (
                      g.goals_details.map((gd, gdidx) => (
                        <div key={gdidx} style={{ marginTop: 2, paddingLeft: 8 }}>
                          • {gdidx + 1}º gol: {gd.player_name} ({gd.half === 'first' ? '1ºT' : '2ºT'} • {gd.minute}')
                        </div>
                      ))
                    ) : (
                      <span> • {g.player_name} • {g.half === 'first' ? '1ºT' : '2ºT'} • {g.minute}'</span>
                    )}
                  </div>
                </div>
                <span className={`badge badge-${g.status}`}>
                  {g.status === 'pending' ? 'Pendente' : g.status === 'paid' ? 'Pago' : 'Rejeitado'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingDash() {
  return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#8899bb' }}>
      Carregando dados...
    </div>
  )
}
