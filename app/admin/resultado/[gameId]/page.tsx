'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateScore } from '@/lib/scoring'
import { Game, GameResult, Guess } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ gameId: string }>
}

export default function AdminResultadoPage({ params }: Props) {
  const [gameId, setGameId] = useState('')
  const [game, setGame] = useState<Game | null>(null)
  const [existingResult, setExistingResult] = useState<GameResult | null>(null)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [form, setForm] = useState({
    brazil_goals: 0,
    opponent_goals: 0,
    goal_player: '',
    goal_half: 'first' as 'first' | 'second',
    goal_minute: 10,
    goals_details: [] as Array<{ player_name: string; half: 'first' | 'second'; minute: number }>,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ gameId: id }) => {
      setGameId(id)
      loadData(id)
    })
  }, [params])

  async function loadData(id: string) {
    const [gameRes, resultRes, guessesRes] = await Promise.all([
      supabase.from('games').select('*').eq('id', id).single(),
      supabase.from('game_results').select('*').eq('game_id', id).maybeSingle(),
      supabase.from('guesses').select('*, participant:participants(name)').eq('game_id', id).eq('status', 'paid'),
    ])
    setGame(gameRes.data)
    
    const resultData = resultRes.data
    if (resultData) {
      setExistingResult(resultData)
      const legacyDetails = resultData.goals_details || (resultData.brazil_goals > 0 ? [{
        player_name: resultData.goal_player || '',
        half: resultData.goal_half || 'first',
        minute: resultData.goal_minute || 10,
      }] : [])
      setForm({
        brazil_goals: resultData.brazil_goals,
        opponent_goals: resultData.opponent_goals,
        goal_player: resultData.goal_player || '',
        goal_half: (resultData.goal_half || 'first') as 'first' | 'second',
        goal_minute: resultData.goal_minute || 10,
        goals_details: legacyDetails,
      })
    }
    setGuesses(guessesRes.data || [])
    setLoading(false)
  }

  function handleBrazilGoalsChange(g: number) {
    setForm((f) => {
      let newDetails = [...(f.goals_details || [])]
      if (g > newDetails.length) {
        const diff = g - newDetails.length
        for (let i = 0; i < diff; i++) {
          newDetails.push({ player_name: '', half: 'first', minute: 10 })
        }
      } else if (g < newDetails.length) {
        newDetails = newDetails.slice(0, g)
      }

      const first = newDetails[0] || { player_name: '', half: 'first', minute: 10 }

      return {
        ...f,
        brazil_goals: g,
        goals_details: newDetails,
        goal_player: first.player_name,
        goal_half: first.half as 'first' | 'second',
        goal_minute: first.minute,
      }
    })
  }

  function updateGoalDetail(index: number, field: string, value: any) {
    setForm((f) => {
      const newDetails = (f.goals_details || []).map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value }
        }
        return item
      })

      const first = newDetails[0] || { player_name: '', half: 'first', minute: 10 }

      return {
        ...f,
        goals_details: newDetails,
        goal_player: first.player_name,
        goal_half: first.half as 'first' | 'second',
        goal_minute: first.minute,
      }
    })
  }

  async function handleSaveResult() {
    const hasInvalidMinute = form.brazil_goals > 0 && (form.goals_details || []).some(g => !g.minute || Number(g.minute) < 1 || Number(g.minute) > 90)
    if (hasInvalidMinute) {
      alert('Informe o minuto de todos os gols do Brasil (entre 1 e 90).')
      return
    }
    setSaving(true)
    const resultData = {
      game_id: gameId,
      brazil_goals: form.brazil_goals,
      opponent_goals: form.opponent_goals,
      goal_player: form.goal_player,
      goal_half: form.goal_half,
      goal_minute: form.goal_minute,
      goals_details: form.goals_details,
    }

    if (existingResult) {
      await supabase.from('game_results').update(resultData).eq('game_id', gameId)
    } else {
      await supabase.from('game_results').insert(resultData)
    }

    // Update game status to finished
    await supabase.from('games').update({ status: 'finished' }).eq('id', gameId)

    // Recalculate scores for all paid guesses
    const fullResult: GameResult = { id: existingResult?.id || '', created_at: '', ...resultData }
    for (const guess of guesses) {
      const breakdown = calculateScore(guess, fullResult)
      await supabase.from('scores').upsert(
        {
          guess_id: guess.id,
          participant_id: guess.participant_id,
          game_id: gameId,
          points: breakdown.total,
          breakdown: breakdown,
        },
        { onConflict: 'guess_id' }
      )
    }

    setSaving(false)
    setSaved(true)
    await loadData(gameId)
    setTimeout(() => setSaved(false), 4000)
  }

  if (loading) return <div style={{ color: '#8899bb', padding: 60, textAlign: 'center' }}>Carregando...</div>
  if (!game) return <div style={{ color: '#f87171', padding: 60 }}>Jogo não encontrado.</div>

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>
          🏁 Resultado Oficial
        </h1>
        <p style={{ color: '#8899bb', fontSize: '0.9rem' }}>
          🇧🇷 Brasil x {game.opponent} — {formatDate(game.match_date)}
        </p>
      </div>

      {saved && (
        <div
          style={{
            background: 'rgba(0,156,59,0.15)',
            border: '1px solid rgba(0,156,59,0.4)',
            borderRadius: 12,
            padding: '14px 20px',
            color: '#00C94F',
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          ✅ Resultado salvo! Pontuações recalculadas para {guesses.length} palpite(s).
        </div>
      )}

      <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 24, fontSize: '1.1rem' }}>
          📋 Placar Final
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center', marginBottom: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🇧🇷 Brasil</div>
            <input
              type="number"
              min={0}
              max={20}
              value={form.brazil_goals}
              onChange={(e) => handleBrazilGoalsChange(Number(e.target.value))}
              className="input-field"
              style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, maxWidth: 100, margin: '0 auto' }}
            />
          </div>
          <div style={{ fontSize: '1.5rem', color: '#8899bb', fontWeight: 700 }}>x</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🏳️ {game.opponent}</div>
            <input
              type="number"
              min={0}
              max={20}
              value={form.opponent_goals}
              onChange={(e) => setForm((f) => ({ ...f, opponent_goals: Number(e.target.value) }))}
              className="input-field"
              style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, maxWidth: 100, margin: '0 auto' }}
            />
          </div>
        </div>

        {form.brazil_goals > 0 && (
          <div style={{ marginBottom: 28, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 20, fontSize: '1.1rem' }}>
              ⚽ Detalhes dos Gols do Brasil
            </h2>
            
            {form.goals_details.map((goal, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFDF00', marginBottom: 12 }}>
                  ⚽ {idx + 1}º Gol
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Autor do gol</label>
                    <input
                      className="input-field"
                      placeholder="Ex: Neymar"
                      value={goal.player_name}
                      onChange={(e) => updateGoalDetail(idx, 'player_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Tempo</label>
                    <select
                      className="input-field"
                      value={goal.half}
                      onChange={(e) => updateGoalDetail(idx, 'half', e.target.value as 'first' | 'second')}
                    >
                      <option value="first">Primeiro Tempo</option>
                      <option value="second">Segundo Tempo</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Minuto (1-90)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      className="input-field"
                      value={goal.minute}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          updateGoalDetail(idx, 'minute', '' as any)
                        } else {
                          const num = Number(val)
                          if (!isNaN(num)) {
                            updateGoalDetail(idx, 'minute', Math.min(90, Math.max(1, num)))
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn-primary btn-yellow"
          onClick={handleSaveResult}
          disabled={saving}
          style={{ fontSize: '1rem', padding: '14px 32px' }}
        >
          {saving ? 'Salvando e calculando pontos...' : '💾 Salvar Resultado e Calcular Pontos'}
        </button>
      </div>

      {/* Guesses preview with calculated scores */}
      {guesses.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: '1.1rem' }}>
            🎯 Palpites e Pontuação ({guesses.length})
          </h2>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {guesses.map((guess, idx) => {
              const fullResult: GameResult = { id: '', created_at: '', game_id: gameId, ...form }
              const score = calculateScore(guess, fullResult)
              return (
                <div
                  key={guess.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < guesses.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                      {(guess as any).participant?.name || '—'}
                    </div>
                    <div style={{ color: '#8899bb', fontSize: '0.78rem', marginTop: 4 }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{guess.goals} gol(s) previstos</span>
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
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: score.total > 0 ? '#00C94F' : '#8899bb' }}>
                      {score.total} pts
                    </div>
                    {score.description.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#8899bb', marginTop: 4 }}>
                        {score.description.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
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
