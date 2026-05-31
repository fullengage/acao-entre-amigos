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
    goal_minute: 1,
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
      supabase.from('game_results').select('*').eq('game_id', id).single(),
      supabase.from('guesses').select('*, participant:participants(name)').eq('game_id', id).eq('status', 'paid'),
    ])
    setGame(gameRes.data)
    if (resultRes.data) {
      setExistingResult(resultRes.data)
      setForm({
        brazil_goals: resultRes.data.brazil_goals,
        opponent_goals: resultRes.data.opponent_goals,
        goal_player: resultRes.data.goal_player || '',
        goal_half: resultRes.data.goal_half || 'first',
        goal_minute: resultRes.data.goal_minute || 1,
      })
    }
    setGuesses(guessesRes.data || [])
    setLoading(false)
  }

  async function handleSaveResult() {
    setSaving(true)
    const resultData = { game_id: gameId, ...form }

    if (existingResult) {
      await supabase.from('game_results').update(resultData).eq('game_id', gameId)
    } else {
      await supabase.from('game_results').insert(resultData)
    }

    // Update game status to finished
    await supabase.from('games').update({ status: 'finished' }).eq('id', gameId)

    // Recalculate scores for all paid guesses
    const fullResult: GameResult = { id: existingResult?.id || '', created_at: '', game_id: gameId, ...form }
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
              onChange={(e) => setForm((f) => ({ ...f, brazil_goals: Number(e.target.value) }))}
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

        <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 20, fontSize: '1.1rem' }}>
          ⚽ Gol Principal (para pontuação)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div>
            <label style={labelStyle}>Autor do gol</label>
            <input
              className="input-field"
              placeholder="Ex: Vinícius Júnior"
              value={form.goal_player}
              onChange={(e) => setForm((f) => ({ ...f, goal_player: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Tempo</label>
            <select
              className="input-field"
              value={form.goal_half}
              onChange={(e) => setForm((f) => ({ ...f, goal_half: e.target.value as 'first' | 'second' }))}
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
              value={form.goal_minute}
              onChange={(e) => setForm((f) => ({ ...f, goal_minute: Math.min(90, Math.max(1, Number(e.target.value))) }))}
            />
          </div>
        </div>

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
                    <div style={{ color: '#8899bb', fontSize: '0.78rem' }}>
                      {guess.goals} gol(s) • {guess.player_name} • {guess.half === 'first' ? '1ºT' : '2ºT'} • {guess.minute}'
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: score.total > 0 ? '#00C94F' : '#8899bb' }}>
                      {score.total} pts
                    </div>
                    {score.description.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#8899bb' }}>
                        {score.description[0]}
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
