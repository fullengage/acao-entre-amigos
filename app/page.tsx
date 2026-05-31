import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Game } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'

async function getUpcomingGames(): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .in('status', ['upcoming', 'live'])
    .order('match_date', { ascending: true })
    .limit(5)
  return data || []
}

async function getAccumulatedAmount(): Promise<number> {
  const { count } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed')
  return (count || 0) * 10
}

// Sempre buscar dados frescos
export const revalidate = 0

export default async function HomePage() {
  const [games, accumulated] = await Promise.all([
    getUpcomingGames(),
    getAccumulatedAmount()
  ])

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(0,156,59,0.15) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(0,156,59,0.2)',
          padding: '64px 16px 56px',
        }}
      >
        <div className="container-app">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}>
            {/* Left Column: Text & CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(0,156,59,0.15)',
                  border: '1px solid rgba(0,156,59,0.3)',
                  borderRadius: 999,
                  padding: '6px 18px',
                  marginBottom: 20,
                  fontSize: '0.85rem',
                  color: '#00C94F',
                  fontWeight: 600,
                }}
              >
                🇧🇷 Copa do Mundo 2026
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(2.5rem, 6vw, 4.8rem)',
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                <span className="text-gradient-brazil">Bolão da</span>
                <br />
                <span style={{ color: 'white' }}>Seleção 2026</span>
              </h1>

              {/* Slogan */}
              <p
                style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                  color: '#8899bb',
                  fontStyle: 'italic',
                  marginBottom: 28,
                  lineHeight: 1.4,
                  maxWidth: 520,
                }}
              >
                "Quanto mais perto do lance histórico, maior a chance de ganhar."
              </p>

              {/* MAIN CTA */}
              <Link href="/jogos">
                <button
                  className="btn-primary btn-yellow"
                  style={{
                    fontSize: '1.15rem',
                    padding: '14px 40px',
                    borderRadius: 14,
                    marginBottom: 12,
                    boxShadow: '0 0 32px rgba(255,223,0,0.2)',
                  }}
                >
                  ⚽ Fazer Meu Palpite
                </button>
              </Link>
              <div style={{ fontSize: '0.8rem', color: '#8899bb', marginBottom: 20 }}>
                R$ 10,00 por palpite • Confirmado via PIX
              </div>
            </div>

            {/* Right Column: Prize Pool & Quick Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {/* Accumulated prize pool block */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(255,223,0,0.1), rgba(255,223,0,0.04))',
                  border: '1px solid rgba(255,223,0,0.3)',
                  borderRadius: 20,
                  padding: '24px 40px',
                  width: '100%',
                  maxWidth: 420,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 16px rgba(255,223,0,0.05)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#FFDF00', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  💰 PRÊMIO ESTIMADO DO VENCEDOR (50%)
                </div>
                <div className="text-gradient-gold" style={{ fontSize: '2.8rem', fontWeight: 900, marginTop: 4, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1.1 }}>
                  R$ {(accumulated * 0.5).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8899bb', marginTop: 6 }}>
                  Total arrecadado do bolão: R$ {accumulated.toFixed(2)}
                </div>
              </div>

              {/* Stats Row */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  width: '100%',
                  maxWidth: 420,
                  justifyContent: 'center',
                }}
              >
                {[
                  { emoji: '⚽', label: 'por palpite', value: 'R$ 10' },
                  { emoji: '🏆', label: 'premiação', value: '50%' },
                  { emoji: '🤝', label: 'apoio social', value: '50%' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card"
                    style={{ padding: '12px 16px', flex: 1, textAlign: 'center', minWidth: 0 }}
                  >
                    <div style={{ fontSize: '1.3rem', marginBottom: 2 }}>{stat.emoji}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFDF00', lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#8899bb', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Jogos — destaque */}
      {games.length > 0 && (
        <section style={{ padding: '48px 16px 0' }}>
          <div className="container-app" style={{ maxWidth: 900 }}>
            <h2
              style={{
                textAlign: 'center',
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              🗓️ <span className="text-gradient-brazil">Próximos Jogos</span> — Clique para palpitar
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section style={{ padding: '64px 16px' }}>
        <div className="container-app" style={{ maxWidth: 900 }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
              fontWeight: 700,
              marginBottom: 36,
              color: 'white',
            }}
          >
            Como funciona o <span className="text-gradient-brazil">Bolão da Seleção</span>?
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              marginBottom: 36,
            }}
          >
            {[
              {
                icon: '1️⃣',
                title: 'Faça seu palpite',
                text: 'Antes de cada jogo, envie seu palpite: quantos gols o Brasil fará, quem marca, em qual tempo e minuto.',
              },
              {
                icon: '2️⃣',
                title: 'Contribua via PIX',
                text: 'Cada participação custa R$ 10. Após enviar o palpite, realize o PIX e mande o comprovante pelo WhatsApp.',
              },
              {
                icon: '3️⃣',
                title: 'Concorra ao prêmio',
                text: 'Quem acumular mais pontos recebe 50% do total arrecadado. Os outros 50% vão para a Comunidade Voz de Deus.',
              },
            ].map((step) => (
              <div key={step.title} className="glass-card" style={{ padding: 28 }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{step.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, color: 'white' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#8899bb', fontSize: '0.88rem', lineHeight: 1.6 }}>{step.text}</p>
              </div>
            ))}
          </div>

          {/* Community info */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0,39,118,0.3), rgba(0,156,59,0.1))',
              border: '1px solid rgba(0,156,59,0.25)',
              borderRadius: 16,
              padding: '28px 32px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <img
                src="/logo-comunidade.png"
                alt="Comunidade Voz de Deus"
                style={{
                  height: 48,
                  width: 'auto',
                  display: 'block',
                }}
              />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>
              Comunidade Voz de Deus — Novo Horizonte, SP
            </h3>
            <p style={{ color: '#8899bb', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              Esta brincadeira entre amigos foi criada para promover a integração entre os
              participantes e arrecadar recursos para os projetos sociais, evangelização e
              manutenção do espaço da Comunidade.
            </p>
          </div>
        </div>
      </section>

      {/* Ranking CTA */}
      <section
        style={{
          padding: '40px 16px 80px',
          background: 'linear-gradient(180deg, transparent, rgba(0,39,118,0.15))',
          textAlign: 'center',
        }}
      >
        <div className="container-app">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 10 }}>
            Veja quem está na liderança 🏆
          </h2>
          <p style={{ color: '#8899bb', marginBottom: 20, fontSize: '0.9rem' }}>
            Acompanhe o ranking atualizado após cada jogo
          </p>
          <Link href="/ranking">
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '12px 32px' }}>
              Ver Ranking Completo
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}

function GameCard({ game }: { game: Game }) {
  const isLive = game.status === 'live'
  return (
    <Link href={`/palpite/${game.id}`} style={{ textDecoration: 'none' }}>
      <div
        className={`glass-card ${isLive ? 'glow-green' : ''}`}
        style={{
          padding: '22px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          cursor: 'pointer',
          border: isLive ? '1px solid rgba(0,156,59,0.5)' : '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.2s ease',
        }}
      >
        <div>
          {isLive && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,156,59,0.2)',
                border: '1px solid rgba(0,156,59,0.4)',
                borderRadius: 999,
                padding: '2px 12px',
                fontSize: '0.72rem',
                color: '#00C94F',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              🔴 AO VIVO
            </div>
          )}
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
            🇧🇷 Brasil x {game.opponent}
          </div>
          <div style={{ color: '#8899bb', fontSize: '0.82rem', marginTop: 4 }}>
            📅 {formatDate(game.match_date)} &nbsp;🕐 {formatTime(game.match_time)} &nbsp;•&nbsp; {game.stage}
          </div>
        </div>
        <div
          className="btn-primary btn-yellow"
          style={{ padding: '10px 22px', fontSize: '0.9rem', borderRadius: 12, whiteSpace: 'nowrap' }}
        >
          ⚽ Fazer Palpite →
        </div>
      </div>
    </Link>
  )
}
