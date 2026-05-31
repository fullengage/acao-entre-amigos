'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Participant, Guess, Payment } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ParticipantRow extends Participant {
  guesses: (Guess & { payment?: Payment })[]
  totalGuesses: number
  paidGuesses: number
  totalPaid: number
}

export default function AdminParticipantesPage() {
  const [rows, setRows] = useState<ParticipantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [participantsRes, guessesRes, paymentsRes] = await Promise.all([
      supabase.from('participants').select('*').order('created_at', { ascending: false }),
      supabase.from('guesses').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*'),
    ])

    const participants = participantsRes.data || []
    const guesses = guessesRes.data || []
    const payments = paymentsRes.data || []

    const paymentMap = new Map(payments.map((p) => [p.guess_id, p]))

    const result: ParticipantRow[] = participants.map((p) => {
      const pGuesses = guesses
        .filter((g) => g.participant_id === p.id)
        .map((g) => ({ ...g, payment: paymentMap.get(g.id) }))

      const paidCount = pGuesses.filter((g) => g.status === 'paid').length
      return {
        ...p,
        guesses: pGuesses,
        totalGuesses: pGuesses.length,
        paidGuesses: paidCount,
        totalPaid: paidCount * 10,
      }
    })

    setRows(result)
    setLoading(false)
  }

  async function confirmPayment(guessId: string, participantId: string) {
    await Promise.all([
      supabase.from('payments').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('guess_id', guessId),
      supabase.from('guesses').update({ status: 'paid' }).eq('id', guessId),
    ])
    loadData()
  }

  async function rejectPayment(guessId: string) {
    await Promise.all([
      supabase.from('payments').update({ status: 'rejected' }).eq('guess_id', guessId),
      supabase.from('guesses').update({ status: 'rejected' }).eq('id', guessId),
    ])
    loadData()
  }

  const filtered = rows
    .map((r) => {
      const filteredGuesses = r.guesses.filter((g) => {
        if (filter === 'pending') return g.status === 'pending'
        if (filter === 'paid') return g.status === 'paid'
        return true
      })
      return {
        ...r,
        guesses: filteredGuesses,
      }
    })
    .filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) || r.whatsapp.includes(search)
      return matchSearch && r.guesses.length > 0
    })

  const totalPending = rows.reduce((acc, r) => acc + r.guesses.filter((g) => g.status === 'pending').length, 0)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>👥 Participantes</h1>
        <p style={{ color: '#8899bb', fontSize: '0.9rem' }}>
          Gerencie palpites e confirme pagamentos
        </p>
      </div>

      {totalPending > 0 && (
        <div
          style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12,
            padding: '14px 20px',
            color: '#f59e0b',
            fontWeight: 600,
            marginBottom: 24,
            fontSize: '0.9rem',
          }}
        >
          ⏳ {totalPending} pagamento{totalPending !== 1 ? 's' : ''} pendente{totalPending !== 1 ? 's' : ''} de confirmação
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="input-field"
          placeholder="Buscar por nome ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
        />
        {(['all', 'pending', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: filter === f ? 'rgba(0,156,59,0.2)' : 'rgba(255,255,255,0.05)',
              border: filter === f ? '1px solid rgba(0,156,59,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: filter === f ? '#00C94F' : '#8899bb',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Confirmados'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#8899bb', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: '#8899bb' }}>
          Nenhum participante encontrado.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((row) => (
            <div key={row.id} className="glass-card" style={{ padding: 24, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>{row.name}</div>
                  <div style={{ color: '#8899bb', fontSize: '0.82rem', marginTop: 2 }}>
                    📱 {row.whatsapp}
                    {row.email && <> • 📧 {row.email}</>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, textAlign: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white' }}>{row.totalGuesses}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8899bb' }}>palpites</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#00C94F' }}>{row.paidGuesses}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8899bb' }}>pagos</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#FFDF00' }}>{formatCurrency(row.totalPaid)}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8899bb' }}>arrecadado</div>
                  </div>
                  <a href={`https://wa.me/${row.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <button
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(37,211,102,0.15)',
                        border: '1px solid rgba(37,211,102,0.3)',
                        borderRadius: 8,
                        color: '#25D366',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      💬
                    </button>
                  </a>
                </div>
              </div>

              {/* Individual guesses */}
              {row.guesses.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  {row.guesses.map((guess) => {
                    const payStatus = guess.status
                    return (
                      <div
                        key={guess.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', color: '#aabbdd' }}>
                          <span style={{ fontWeight: 600, color: 'white' }}>{guess.goals} gol(s) previstos</span>
                          {guess.goals_details && guess.goals_details.length > 0 ? (
                            guess.goals_details.map((g, gidx) => (
                              <div key={gidx} style={{ marginTop: 2, paddingLeft: 8, color: '#8899bb' }}>
                                • {gidx + 1}º gol: {g.player_name} ({g.half === 'first' ? '1ºT' : '2ºT'} • {g.minute}')
                              </div>
                            ))
                          ) : (
                            <span> • {guess.player_name} • {guess.half === 'first' ? '1ºT' : '2ºT'} • {guess.minute}'</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`badge badge-${payStatus}`}>
                            {payStatus === 'pending' ? 'Pendente' : payStatus === 'paid' ? 'Pago' : 'Rejeitado'}
                          </span>
                          {payStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => confirmPayment(guess.id, guess.participant_id)}
                                style={{
                                  padding: '3px 10px',
                                  background: 'rgba(0,156,59,0.2)',
                                  border: '1px solid rgba(0,156,59,0.4)',
                                  borderRadius: 6,
                                  color: '#00C94F',
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                }}
                              >
                                ✅ Confirmar
                              </button>
                              <button
                                onClick={() => rejectPayment(guess.id)}
                                style={{
                                  padding: '3px 10px',
                                  background: 'rgba(220,38,38,0.15)',
                                  border: '1px solid rgba(220,38,38,0.3)',
                                  borderRadius: 6,
                                  color: '#f87171',
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                }}
                              >
                                ✗ Rejeitar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
