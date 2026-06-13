'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Participant, Guess, Payment, Player, Game, GameResult } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { calculateScore } from '@/lib/scoring'

interface ParticipantRow extends Participant {
  guesses: (Guess & { payment?: Payment })[]
  totalGuesses: number
  paidGuesses: number
  totalPaid: number
}

export default function AdminParticipantesPage() {
  const [rows, setRows] = useState<ParticipantRow[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [gameResults, setGameResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [search, setSearch] = useState('')
  const [editingGuess, setEditingGuess] = useState<Guess | null>(null)
  const [editForm, setEditForm] = useState<Guess | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [participantsRes, guessesRes, paymentsRes, gamesRes, playersRes, resultsRes] = await Promise.all([
      supabase.from('participants').select('*').order('created_at', { ascending: false }),
      supabase.from('guesses').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*'),
      supabase.from('games').select('*'),
      supabase.from('players').select('*'),
      supabase.from('game_results').select('*'),
    ])

    const participants = participantsRes.data || []
    const guesses = guessesRes.data || []
    const payments = paymentsRes.data || []
    
    setGames(gamesRes.data || [])
    setPlayers(playersRes.data || [])
    setGameResults(resultsRes.data || [])

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

  function handleEditGoalsChange(g: number) {
    if (!editForm) return
    setEditForm((f) => {
      if (!f) return null
      let newDetails = [...(f.goals_details || [])]
      if (g > newDetails.length) {
        const diff = g - newDetails.length
        for (let i = 0; i < diff; i++) {
          newDetails.push({ player_name: '', half: 'first', minute: 10 })
        }
      } else if (g < newDetails.length) {
        newDetails = newDetails.slice(0, g)
      }
      return {
        ...f,
        goals: g,
        goals_details: newDetails,
      }
    })
  }

  function updateEditGoalDetail(index: number, field: string, value: any) {
    if (!editForm) return
    setEditForm((f) => {
      if (!f) return null
      const newDetails = (f.goals_details || []).map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value }
        }
        return item
      })
      return {
        ...f,
        goals_details: newDetails,
      }
    })
  }

  async function saveEditedGuess() {
    if (!editForm) return

    const hasInvalidMinute = editForm.goals > 0 && (editForm.goals_details || []).some(g => !g.minute || Number(g.minute) < 1 || Number(g.minute) > 90)
    if (hasInvalidMinute) {
      alert('Informe o minuto de todos os gols (entre 1 e 90).')
      return
    }
    const hasEmptyPlayer = editForm.goals > 0 && (editForm.goals_details || []).some(g => !g.player_name)
    if (hasEmptyPlayer) {
      alert('Selecione o jogador para todos os gols.')
      return
    }

    const firstGoal = editForm.goals_details?.[0] || { player_name: '', half: 'first', minute: 10 }

    const { error: updateErr } = await supabase.from('guesses').update({
      goals: editForm.goals,
      opponent_goals: editForm.opponent_goals,
      player_name: firstGoal.player_name,
      half: firstGoal.half,
      minute: firstGoal.minute,
      goals_details: editForm.goals_details,
    }).eq('id', editForm.id)

    if (updateErr) {
      alert('Erro ao salvar palpite: ' + updateErr.message)
      return
    }

    const result = gameResults.find((r) => r.game_id === editForm.game_id)
    if (result && editForm.status === 'paid') {
      const breakdown = calculateScore(editForm, result)
      await supabase.from('scores').upsert(
        {
          guess_id: editForm.id,
          participant_id: editForm.participant_id,
          game_id: editForm.game_id,
          points: breakdown.total,
          breakdown: breakdown,
        },
        { onConflict: 'guess_id' }
      )
    } else if (editForm.status !== 'paid') {
      await supabase.from('scores').delete().eq('guess_id', editForm.id)
    }

    setEditingGuess(null)
    setEditForm(null)
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
                          <span style={{ fontWeight: 600, color: 'white' }}>Brasil {guess.goals} x {guess.opponent_goals ?? 0}</span>
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
                          <button
                            onClick={() => {
                              setEditingGuess(guess)
                              setEditForm(JSON.parse(JSON.stringify(guess)))
                            }}
                            style={{
                              padding: '3px 10px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 6,
                              color: '#aabbdd',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            ✏️ Editar
                          </button>
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

      {/* Modal de Edição de Palpite */}
      {editingGuess && editForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div className="glass-card" style={{
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 32,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, color: 'white' }}>
              ✏️ Editar Palpite
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Placar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Gols do Brasil</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    className="input-field"
                    value={editForm.goals}
                    onChange={(e) => handleEditGoalsChange(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Gols do {games.find(g => g.id === editForm.game_id)?.opponent || 'Adversário'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    className="input-field"
                    value={editForm.opponent_goals}
                    onChange={(e) => setEditForm({ ...editForm, opponent_goals: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Detalhes dos Gols */}
              {editForm.goals > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Detalhes dos Gols do Brasil</div>
                  {(editForm.goals_details || []).map((goal, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 12 }}>
                      <div style={{ color: '#FFDF00', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>⚽ {idx + 1}º Gol</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: 4 }}>Autor do gol</label>
                          <select
                            className="input-field"
                            style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                            value={goal.player_name}
                            onChange={(e) => updateEditGoalDetail(idx, 'player_name', e.target.value)}
                          >
                            <option value="">-- Selecione o jogador --</option>
                            {players.filter(p => p.game_id === editForm.game_id).map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: 4 }}>Tempo</label>
                            <select
                              className="input-field"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={goal.half}
                              onChange={(e) => updateEditGoalDetail(idx, 'half', e.target.value as 'first' | 'second')}
                            >
                              <option value="first">1º Tempo</option>
                              <option value="second">2º Tempo</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: 4 }}>Minuto (1-90)</label>
                            <input
                              type="number"
                              min={1}
                              max={90}
                              className="input-field"
                              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                              value={goal.minute}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '') {
                                  updateEditGoalDetail(idx, 'minute', '' as any)
                                } else {
                                  const num = parseInt(val, 10)
                                  if (!isNaN(num)) {
                                    updateEditGoalDetail(idx, 'minute', num)
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botões de Ação */}
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  onClick={() => {
                    setEditingGuess(null)
                    setEditForm(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#aabbdd',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditedGuess}
                  className="btn-primary btn-yellow"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 600,
  color: '#aabbdd',
  fontSize: '0.85rem',
}
