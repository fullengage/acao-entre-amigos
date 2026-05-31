import { supabase } from '@/lib/supabase'
import { RankingEntry, Guess } from '@/types'
import { formatOrdinal, formatCurrency } from '@/lib/utils'

async function getRanking(): Promise<RankingEntry[]> {
  const { data } = await supabase
    .from('ranking')
    .select('*')
    .limit(100)
  return data || []
}

async function getStats() {
  const { count: totalGuesses } = await supabase
    .from('guesses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')

  const { count: confirmedPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed')

  return {
    totalGuesses: totalGuesses || 0,
    totalCollected: (confirmedPayments || 0) * 10,
    prizeAmount: ((confirmedPayments || 0) * 10) * 0.5,
  }
}

async function getGuesses(): Promise<Guess[]> {
  const { data } = await supabase
    .from('guesses')
    .select('*, game:games(opponent)')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
  return (data || []) as Guess[]
}

export const revalidate = 60

export default async function RankingPage() {
  const [ranking, stats, guesses] = await Promise.all([
    getRanking(),
    getStats(),
    getGuesses(),
  ])

  return (
    <main style={{ padding: '40px 16px 80px' }}>
      <div className="container-app" style={{ maxWidth: 800 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,223,0,0.1)',
              border: '1px solid rgba(255,223,0,0.3)',
              borderRadius: 999,
              padding: '6px 18px',
              color: '#FFDF00',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            🏆 Ranking ao Vivo
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: 'white',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            <span className="text-gradient-brazil">Ranking</span> do Bolão
          </h1>
          <p style={{ color: '#8899bb', fontSize: '0.95rem' }}>
            Atualizado automaticamente após cada jogo
          </p>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {[
            { emoji: '🎯', label: 'Palpites Válidos', value: stats.totalGuesses.toString() },
            {
              emoji: '💰',
              label: 'Total Arrecadado',
              value: formatCurrency(stats.totalCollected),
            },
            {
              emoji: '🏆',
              label: 'Premiação Estimada',
              value: formatCurrency(stats.prizeAmount),
              highlight: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card"
              style={{
                padding: '20px 24px',
                textAlign: 'center',
                border: s.highlight
                  ? '1px solid rgba(255,223,0,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{s.emoji}</div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: s.highlight ? '#FFDF00' : 'white',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8899bb', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Podium — top 3 */}
        {ranking.length >= 3 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              marginBottom: 32,
            }}
          >
            {[ranking[1], ranking[0], ranking[2]].map((entry, idx) => {
              const actualPos = idx === 0 ? 2 : idx === 1 ? 1 : 3
              const heights = ['160px', '200px', '140px']
              const colors = [
                'linear-gradient(180deg, rgba(192,192,192,0.2), transparent)',
                'linear-gradient(180deg, rgba(255,215,0,0.3), transparent)',
                'linear-gradient(180deg, rgba(205,127,50,0.2), transparent)',
              ]
              return (
                <div
                  key={entry.id}
                  style={{
                    background: colors[idx],
                    border:
                      idx === 1
                        ? '1px solid rgba(255,215,0,0.4)'
                        : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '20px 12px',
                    textAlign: 'center',
                    minHeight: heights[idx],
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {idx === 1 && (
                    <div style={{ fontSize: '1.5rem' }}>👑</div>
                  )}
                  <div
                    className={`rank-badge rank-${actualPos}`}
                    style={{ width: 44, height: 44, fontSize: '1rem' }}
                  >
                    {actualPos}º
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
                    {entry.name.split(' ')[0]}
                  </div>
                  <div
                    className="text-gradient-gold"
                    style={{ fontWeight: 800, fontSize: '1.2rem' }}
                  >
                    {entry.total_points} pts
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8899bb' }}>
                    {entry.total_guesses} palpite{entry.total_guesses !== 1 ? 's' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full ranking table */}
        {ranking.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: 60, textAlign: 'center', color: '#8899bb' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏟️</div>
            <p style={{ fontSize: '1.1rem' }}>O ranking ainda está vazio.</p>
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
              Seja o primeiro a enviar seu palpite!
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'grid',
                gridTemplateColumns: '48px 1fr 100px 80px',
                gap: 12,
                color: '#8899bb',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <span>Pos.</span>
              <span>Nome</span>
              <span style={{ textAlign: 'center' }}>Palpites</span>
              <span style={{ textAlign: 'right' }}>Pontos</span>
            </div>
            {ranking.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  padding: '16px 24px',
                  borderBottom:
                    idx < ranking.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 100px 80px',
                  gap: 12,
                  alignItems: 'center',
                  background: idx === 0 ? 'rgba(255,215,0,0.04)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div>
                  <div
                    className={`rank-badge ${
                      entry.position <= 3
                        ? `rank-${entry.position}`
                        : 'rank-other'
                    }`}
                  >
                    {entry.position}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>
                    {entry.name}
                  </div>
                  {(() => {
                    const participantGuesses = guesses.filter(g => g.participant_id === entry.id)
                    if (participantGuesses.length === 0) return null
                    return (
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {participantGuesses.map((g) => (
                          <div key={g.id} style={{ fontSize: '0.75rem', color: '#8899bb', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span>🇧🇷 x {g.game?.opponent}:</span>
                            <span style={{ color: '#FFDF00', fontWeight: 600 }}>{g.goals} gol{g.goals !== 1 ? 's' : ''}</span>
                            <span>({g.goals_details && g.goals_details.length > 0 ? (
                              g.goals_details.map((gd, gdidx) => (
                                `${gdidx > 0 ? ', ' : ''}${gd.player_name} (${gd.half === 'first' ? '1ºT' : '2ºT'} ${gd.minute}')`
                              )).join('')
                            ) : (
                              `${g.player_name} (${g.half === 'first' ? '1ºT' : '2ºT'} ${g.minute}')`
                            )})</span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
                <div style={{ textAlign: 'center', color: '#8899bb', fontSize: '0.85rem' }}>
                  {entry.total_guesses}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: entry.position === 1 ? '#FFDF00' : '#00C94F',
                  }}
                >
                  {entry.total_points}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="/">
            <button className="btn-primary btn-yellow" style={{ padding: '14px 36px' }}>
              ⚽ Fazer Meu Palpite
            </button>
          </a>
        </div>
      </div>
    </main>
  )
}
