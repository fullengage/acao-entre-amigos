'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Game, Player, GuessFormData, GoalDetail } from '@/types'
import { formatDate, formatTime, halfLabel, goalsLabel, isGuessesClosed } from '@/lib/utils'

interface Props {
  params: Promise<{ gameId: string }>
}

export default function PalpitePage({ params }: Props) {
  const router = useRouter()
  const [gameId, setGameId] = useState<string>('')
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState('')

  const [form, setForm] = useState<GuessFormData>({
    goals: 1,
    opponent_goals: 0,
    player_name: '',
    half: 'first',
    minute: 10,
    goals_details: [{ player_name: '', half: 'first', minute: 10 }],
    participant_name: '',
    participant_whatsapp: '',
    participant_email: '',
  })

  useEffect(() => {
    params.then(({ gameId: id }) => {
      setGameId(id)
      loadGameData(id)
    })
  }, [params])

  async function loadGameData(id: string) {
    setLoading(true)
    const [gameRes, playersRes] = await Promise.all([
      supabase.from('games').select('*').eq('id', id).single(),
      supabase.from('players').select('*').eq('game_id', id).order('name'),
    ])
    setGame(gameRes.data)
    setPlayers(playersRes.data || [])
    setLoading(false)
  }

  function handleGoalsChange(g: number) {
    setError('')
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
        goals: g,
        goals_details: newDetails,
        player_name: first.player_name,
        half: first.half,
        minute: first.minute,
      }
    })
  }

  function updateGoalDetail(index: number, field: keyof GoalDetail, value: any) {
    setError('')
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
        player_name: first.player_name,
        half: first.half,
        minute: first.minute,
      }
    })
  }

  async function handleSubmit() {
    setError('')
    if (!game) return
    if (isGuessesClosed(game.match_date, game.match_time, game.status)) {
      setError('Os palpites para este jogo já encerraram (limite de 10 minutos antes da partida).')
      return
    }
    if (!form.participant_name.trim()) { setError('Informe seu nome.'); return }
    if (!form.participant_whatsapp.trim()) { setError('Informe seu WhatsApp.'); return }
    if (form.goals_details.some(g => !g.player_name)) {
      setError('Escolha o jogador para todos os gols previstos.');
      return
    }
    if (form.goals_details.some(g => !g.minute || Number(g.minute) < 1 || Number(g.minute) > 90)) {
      setError('Informe o minuto de todos os gols (entre 1 e 90).');
      return
    }

    setSubmitting(true)
    try {
      // Upsert participant by whatsapp
      const { data: participant, error: pErr } = await supabase
        .from('participants')
        .upsert(
          {
            name: form.participant_name.trim(),
            whatsapp: form.participant_whatsapp.replace(/\D/g, ''),
            email: form.participant_email?.trim() || null,
          },
          { onConflict: 'whatsapp', ignoreDuplicates: false }
        )
        .select()
        .single()

      if (pErr) throw pErr

      const { data: guess, error: gErr } = await supabase
        .from('guesses')
        .insert({
          game_id: gameId,
          participant_id: participant.id,
          goals: form.goals,
          opponent_goals: form.opponent_goals,
          player_name: form.player_name,
          half: form.half,
          minute: form.minute,
          goals_details: form.goals_details,
          status: 'pending',
        })
        .select()
        .single()

      if (gErr) throw gErr

      await supabase.from('payments').insert({
        guess_id: guess.id,
        participant_id: participant.id,
        amount: 10.0,
        status: 'pending',
      })

      router.push(
        `/pagamento?name=${encodeURIComponent(form.participant_name)}&guessId=${guess.id}&goals=${form.goals}&player=${encodeURIComponent(form.player_name)}&half=${form.half}&minute=${form.minute}`
      )
    } catch (e) {
      setError('Erro ao enviar palpite. Tente novamente.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen />

  if (!game) {
    return (
      <main style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#f87171' }}>Jogo não encontrado.</h1>
      </main>
    )
  }

  if (isGuessesClosed(game.match_date, game.match_time, game.status)) {
    return (
      <main style={{ padding: '80px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏰</div>
        <h1 style={{ fontSize: '1.5rem', color: '#FFDF00' }}>Palpites Encerrados</h1>
        <p style={{ color: '#8899bb', marginTop: 8 }}>
          Os palpites para este jogo encerraram 10 minutos antes do início da partida.
        </p>
      </main>
    )
  }

  return (
    <main style={{ padding: '40px 16px 80px' }}>
      <div className="container-app" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,156,59,0.15), rgba(0,39,118,0.2))',
            border: '1px solid rgba(0,156,59,0.3)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#00C94F', fontWeight: 600, marginBottom: 8 }}>
            {game.stage}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>
            🇧🇷 Brasil x {game.opponent}
          </h1>
          <div style={{ color: '#8899bb', fontSize: '0.9rem' }}>
            {formatDate(game.match_date)} • {formatTime(game.match_time)}
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: step >= s ? 'var(--green-brazil)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {step === 1 ? (
          <PalpiteStep
            form={form}
            setForm={setForm}
            players={players}
            game={game}
            onGoalsChange={handleGoalsChange}
            onUpdateGoal={updateGoalDetail}
            onNext={() => {
              const hasInvalidMinute = (form.goals_details || []).some(g => !g.minute || Number(g.minute) < 1 || Number(g.minute) > 90)
              if (hasInvalidMinute) {
                setError('Informe o minuto de todos os gols (entre 1 e 90) antes de continuar.')
                return
              }
              setError('')
              setStep(2)
            }}
            error={error}
          />
        ) : (
          <ParticipantStep
            form={form}
            setForm={setForm}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </main>
  )
}

function PalpiteStep({
  form,
  setForm,
  players,
  game,
  onGoalsChange,
  onUpdateGoal,
  onNext,
  error,
}: {
  form: GuessFormData
  setForm: React.Dispatch<React.SetStateAction<GuessFormData>>
  players: Player[]
  game: Game | null
  onGoalsChange: (g: number) => void
  onUpdateGoal: (index: number, field: keyof GoalDetail, value: any) => void
  onNext: () => void
  error?: string
}) {
  const goalsOptions = [0, 1, 2, 3, 4, 5]

  // Agrupa por posição
  const posOrder = ['Atacante', 'Meia', 'Zagueiro', 'Goleiro', ''] as const
  type PosKey = typeof posOrder[number]
  const posLabel: Record<PosKey, string> = {
    'Atacante': '⚡ Atacantes',
    'Meia': '🔵 Meias',
    'Zagueiro': '🛡️ Defensores',
    'Goleiro': '🧤 Goleiros',
    '': '➕ Outros',
  }
  const posColor: Record<PosKey, string> = {
    'Atacante': '#f59e0b',
    'Meia': '#60a5fa',
    'Zagueiro': '#34d399',
    'Goleiro': '#a855f7',
    '': '#8899bb',
  }

  const fallback: Player[] = [
    // Goleiros
    { id: 'fg1', game_id: '', name: 'Alisson', position: 'Goleiro', created_at: '' },
    { id: 'fg2', game_id: '', name: 'Ederson', position: 'Goleiro', created_at: '' },
    { id: 'fg3', game_id: '', name: 'Weverton', position: 'Goleiro', created_at: '' },
    // Defensores
    { id: 'fd1', game_id: '', name: 'Alex Sandro', position: 'Zagueiro', created_at: '' },
    { id: 'fd2', game_id: '', name: 'Bremer', position: 'Zagueiro', created_at: '' },
    { id: 'fd3', game_id: '', name: 'Danilo', position: 'Zagueiro', created_at: '' },
    { id: 'fd4', game_id: '', name: 'Douglas Santos', position: 'Zagueiro', created_at: '' },
    { id: 'fd5', game_id: '', name: 'Gabriel Magalhães', position: 'Zagueiro', created_at: '' },
    { id: 'fd6', game_id: '', name: 'Ibañez', position: 'Zagueiro', created_at: '' },
    { id: 'fd7', game_id: '', name: 'Léo Pereira', position: 'Zagueiro', created_at: '' },
    { id: 'fd8', game_id: '', name: 'Marquinhos', position: 'Zagueiro', created_at: '' },
    // Meio-campistas
    { id: 'fm1', game_id: '', name: 'Bruno Guimarães', position: 'Meia', created_at: '' },
    { id: 'fm2', game_id: '', name: 'Casemiro', position: 'Meia', created_at: '' },
    { id: 'fm3', game_id: '', name: 'Danilo Santos', position: 'Meia', created_at: '' },
    { id: 'fm4', game_id: '', name: 'Éderson', position: 'Meia', created_at: '' },
    { id: 'fm5', game_id: '', name: 'Fabinho', position: 'Meia', created_at: '' },
    { id: 'fm6', game_id: '', name: 'Lucas Paquetá', position: 'Meia', created_at: '' },
    // Atacantes
    { id: 'fa1', game_id: '', name: 'Endrick', position: 'Atacante', created_at: '' },
    { id: 'fa2', game_id: '', name: 'Gabriel Martinelli', position: 'Atacante', created_at: '' },
    { id: 'fa3', game_id: '', name: 'Igor Thiago', position: 'Atacante', created_at: '' },
    { id: 'fa4', game_id: '', name: 'Luiz Henrique', position: 'Atacante', created_at: '' },
    { id: 'fa5', game_id: '', name: 'Matheus Cunha', position: 'Atacante', created_at: '' },
    { id: 'fa6', game_id: '', name: 'Neymar Jr.', position: 'Atacante', created_at: '' },
    { id: 'fa7', game_id: '', name: 'Raphinha', position: 'Atacante', created_at: '' },
    { id: 'fa8', game_id: '', name: 'Rayan', position: 'Atacante', created_at: '' },
    { id: 'fa9', game_id: '', name: 'Vini Jr.', position: 'Atacante', created_at: '' },
    // Outro
    { id: 'f_other', game_id: '', name: 'Outro jogador', position: '', created_at: '' },
  ]

  const list = players.length > 0 ? players : fallback

  const grouped = posOrder.reduce<Record<string, Player[]>>((acc, pos) => {
    const items = list.filter(p => (p.position ?? '') === pos)
    if (items.length) acc[pos] = items
    return acc
  }, {})

  const hasEmptyPlayer = (form.goals_details || []).some(g => !g.player_name)

  return (
    <div className="glass-card" style={{ padding: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, color: 'white' }}>
        ⚽ Seu Palpite
      </h2>

      {/* Goals Brasil */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
          1. Quantos gols o Brasil fará?
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {goalsOptions.map((g) => (
            <label key={g} className="option-card">
              <input
                type="radio"
                name="goals"
                value={g}
                checked={form.goals === g}
                onChange={() => onGoalsChange(g)}
              />
              <div className="option-card-inner" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {g === 5 ? '5+' : g}
              </div>
            </label>
          ))}
        </div>
        <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#8899bb' }}>
          Brasil fará: <strong style={{ color: '#FFDF00' }}>{goalsLabel(form.goals)}</strong>
        </div>
      </div>

      {/* Goals Opponent */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
          2. Quantos gols o adversário ({game?.opponent || 'Adversário'}) fará?
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {goalsOptions.map((g) => (
            <label key={g} className="option-card">
              <input
                type="radio"
                name="opponent_goals"
                value={g}
                checked={form.opponent_goals === g}
                onChange={() => setForm((f) => ({ ...f, opponent_goals: g }))}
              />
              <div className="option-card-inner" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {g === 5 ? '5+' : g}
              </div>
            </label>
          ))}
        </div>
        <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#8899bb' }}>
          {game?.opponent || 'Adversário'} fará: <strong style={{ color: '#FFDF00' }}>{goalsLabel(form.opponent_goals)}</strong>
        </div>
      </div>

      {/* Detalhamento de cada gol */}
      {form.goals > 0 && (
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#aabbdd' }}>
            3. Detalhes de cada gol do Brasil:
          </label>
          
          {(form.goals_details || []).map((goal, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFDF00', marginBottom: 16 }}>
                ⚽ {idx + 1}º Gol do Brasil
              </h3>

              {/* Jogador */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.8rem', fontWeight: 600, color: '#aabbdd' }}>
                  Quem fará o gol?
                </label>
                {Object.entries(grouped).map(([pos, items]) => (
                  <div key={pos} style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', marginBottom: 4, paddingBottom: 2,
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      color: posColor[pos as keyof typeof posColor] || '#8899bb',
                    }}>
                      {posLabel[pos as keyof typeof posLabel] || 'Outros'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {items.map((p) => (
                        <label key={p.id} className="option-card">
                          <input
                            type="radio"
                            name={`player-${idx}`}
                            value={p.name}
                            checked={goal.player_name === p.name}
                            onChange={() => onUpdateGoal(idx, 'player_name', p.name)}
                          />
                          <div className="option-card-inner" style={{
                            textAlign: 'left', fontSize: '0.78rem',
                            padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                            <span>{p.name === 'Outro jogador' ? '➕' : '⚽'}</span>
                            <span>{p.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {goal.player_name && (
                  <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#8899bb' }}>
                    Selecionado: <strong style={{ color: '#00C94F' }}>{goal.player_name}</strong>
                  </div>
                )}
              </div>

              {/* Tempo & Minuto */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.8rem', fontWeight: 600, color: '#aabbdd' }}>
                    Tempo
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {(['first', 'second'] as const).map((h) => (
                      <label key={h} className="option-card">
                        <input
                          type="radio"
                          name={`half-${idx}`}
                          value={h}
                          checked={goal.half === h}
                          onChange={() => onUpdateGoal(idx, 'half', h)}
                        />
                        <div className="option-card-inner" style={{ padding: '8px', fontSize: '0.78rem' }}>
                          {h === 'first' ? '1ºT' : '2ºT'}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.8rem', fontWeight: 600, color: '#aabbdd' }}>
                    Minuto <span style={{ color: '#8899bb', fontWeight: 400 }}>(1-90)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={goal.minute}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '') {
                        onUpdateGoal(idx, 'minute', '' as any)
                      } else {
                        const num = parseInt(val, 10)
                        if (!isNaN(num)) {
                          onUpdateGoal(idx, 'minute', num)
                        }
                      }
                    }}
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="Ex: 18"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div
        style={{
          background: 'rgba(255,223,0,0.08)',
          border: '1px solid rgba(255,223,0,0.2)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          fontSize: '0.85rem',
          color: '#aabbdd',
        }}
      >
        <strong style={{ color: '#FFDF00' }}>Resumo do palpite:</strong>
        <br />
        <span style={{ fontWeight: 600, color: 'white', fontSize: '1.15rem' }}>
          🇧🇷 Brasil {form.goals} x {form.opponent_goals} {game?.opponent || 'Adversário'}
        </span>
        {form.goals > 0 && (form.goals_details || []).map((g, idx) => (
          <div key={idx} style={{ marginTop: 5, fontSize: '0.8rem', color: '#ccddee' }}>
            📍 {idx + 1}º gol: {g.player_name || '(escolha o jogador)'} • {g.half === 'first' ? '1º Tempo' : '2º Tempo'} • {g.minute}' minuto
          </div>
        ))}
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
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
        onClick={onNext}
        disabled={hasEmptyPlayer}
      >
        Continuar →
      </button>
    </div>
  )
}

function ParticipantStep({
  form,
  setForm,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  form: GuessFormData
  setForm: React.Dispatch<React.SetStateAction<GuessFormData>>
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  error: string
}) {
  return (
    <div className="glass-card" style={{ padding: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'white' }}>
        👤 Seus Dados
      </h2>
      <p style={{ color: '#8899bb', fontSize: '0.85rem', marginBottom: 24 }}>
        Para registrar seu palpite e entrar no ranking.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
            Nome completo *
          </label>
          <input
            type="text"
            value={form.participant_name}
            onChange={(e) => setForm((f) => ({ ...f, participant_name: e.target.value }))}
            className="input-field"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
            WhatsApp * <span style={{ color: '#8899bb', fontWeight: 400 }}>(para confirmar pagamento)</span>
          </label>
          <input
            type="tel"
            value={form.participant_whatsapp}
            onChange={(e) => setForm((f) => ({ ...f, participant_whatsapp: e.target.value }))}
            className="input-field"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
            E-mail <span style={{ color: '#8899bb', fontWeight: 400 }}>(opcional)</span>
          </label>
          <input
            type="email"
            value={form.participant_email}
            onChange={(e) => setForm((f) => ({ ...f, participant_email: e.target.value }))}
            className="input-field"
            placeholder="seu@email.com"
          />
        </div>
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

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#aabbdd',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Voltar
        </button>
        <button
          className="btn-primary btn-yellow"
          style={{ flex: 2, justifyContent: 'center' }}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Enviando...' : '✅ Enviar Palpite'}
        </button>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <main style={{ padding: '120px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚽</div>
      <p style={{ color: '#8899bb' }}>Carregando...</p>
    </main>
  )
}
