import { supabase } from '@/lib/supabase'
import { Game } from '@/types'
import { formatDate, formatTime, isGuessesClosed } from '@/lib/utils'
import Link from 'next/link'

async function getGames(): Promise<Game[]> {
  const { data } = await supabase
    .from('games')
    .select('*')
    .in('status', ['upcoming', 'live'])
    .order('match_date', { ascending: true })
  return data || []
}

export const revalidate = 0

export default async function JogosPage() {
  const games = await getGames()

  return (
    <main style={{ padding: '40px 16px 80px' }}>
      <div className="container-app" style={{ maxWidth: 720 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,156,59,0.15)',
              border: '1px solid rgba(0,156,59,0.3)',
              borderRadius: 999,
              padding: '6px 18px',
              color: '#00C94F',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            🇧🇷 Copa do Mundo 2026
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Escolha um <span className="text-gradient-brazil">Jogo</span>
          </h1>
          <p style={{ color: '#8899bb', fontSize: '1rem' }}>
            Selecione a partida e envie seu palpite por{' '}
            <strong style={{ color: '#FFDF00' }}>R$ 10,00</strong>
          </p>
        </div>

        {/* Instruções rápidas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 36,
          }}
        >
          {[
            { icon: '⚽', text: 'Escolha o jogo' },
            { icon: '🎯', text: 'Envie seu palpite' },
            { icon: '💳', text: 'Pague R$ 10 via PIX' },
          ].map((s) => (
            <div
              key={s.text}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '14px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: '0.8rem', color: '#aabbdd', fontWeight: 500 }}>{s.text}</div>
            </div>
          ))}
        </div>

        {/* Game list */}
        {games.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: '60px 32px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⏳</div>
            <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>
              Nenhum jogo disponível agora
            </h2>
            <p style={{ color: '#8899bb', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
              Os jogos da Seleção Brasileira aparecem aqui antes de cada partida. Fique de olho!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {games.map((game) => (
              <GameSelectCard key={game.id} game={game} />
            ))}
          </div>
        )}

        {/* Aviso de valor */}
        <div
          style={{
            marginTop: 32,
            background: 'rgba(255,223,0,0.06)',
            border: '1px solid rgba(255,223,0,0.18)',
            borderRadius: 12,
            padding: '16px 20px',
            fontSize: '0.82rem',
            color: '#aabbdd',
            lineHeight: 1.7,
            textAlign: 'center',
          }}
        >
          💡 Cada palpite tem o valor de <strong style={{ color: '#FFDF00' }}>R$ 10,00</strong>.
          Após enviar, você receberá os dados do PIX para pagamento.
          O comprovante deve ser enviado pelo WhatsApp para validar a participação.
        </div>
      </div>
    </main>
  )
}

function GameSelectCard({ game }: { game: Game }) {
  const isClosed = isGuessesClosed(game.match_date, game.match_time, game.status)
  const isLive = game.status === 'live' && !isClosed

  const cardContent = (
    <div
      className={`glass-card ${isLive ? 'glow-green' : ''}`}
      style={{
        padding: '28px 32px',
        cursor: 'pointer',
        border: isLive
          ? '1px solid rgba(0,156,59,0.5)'
          : isClosed
          ? '1px solid rgba(255,255,255,0.03)'
          : '1px solid rgba(255,255,255,0.08)',
        opacity: isClosed ? 0.65 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        {isLive && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,156,59,0.2)',
              border: '1px solid rgba(0,156,59,0.4)',
              borderRadius: 999,
              padding: '3px 12px',
              fontSize: '0.72rem',
              color: '#00C94F',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            🔴 AO VIVO — Palpites abertos
          </div>
        )}
        {isClosed && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 999,
              padding: '3px 12px',
              fontSize: '0.72rem',
              color: '#f87171',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            ⏰ Encerrado para palpites
          </div>
        )}

        {/* Match title */}
        <div
          style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            fontWeight: 800,
            color: isClosed ? '#8899bb' : 'white',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span>🇧🇷 Brasil</span>
          <span style={{ color: '#4a5a7a', fontSize: '1rem' }}>vs</span>
          <span>{game.opponent}</span>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ color: '#8899bb', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            📅 {formatDate(game.match_date)}
          </div>
          <div style={{ color: '#8899bb', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            🕐 {formatTime(game.match_time)}
          </div>
          <div
            style={{
              background: isClosed ? 'rgba(255,255,255,0.05)' : 'rgba(0,39,118,0.3)',
              border: isClosed ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,39,118,0.4)',
              borderRadius: 6,
              padding: '1px 10px',
              fontSize: '0.75rem',
              color: '#aabbdd',
              fontWeight: 600,
            }}
          >
            {game.stage}
          </div>
        </div>
      </div>

      {/* CTA button */}
      <div>
        {isClosed ? (
          <div
            style={{
              padding: '12px 24px',
              fontSize: '0.9rem',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#aabbdd',
            }}
          >
            🏆 Ver Classificação →
          </div>
        ) : (
          <div
            className="btn-primary btn-yellow"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              borderRadius: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            ⚽ Fazer Palpite
            <span style={{ fontSize: '1.1rem' }}>→</span>
          </div>
        )}
        {!isClosed && (
          <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.72rem', color: '#8899bb' }}>
            R$ 10,00 por palpite
          </div>
        )}
      </div>
    </div>
  )

  return isClosed ? (
    <Link href="/ranking" style={{ textDecoration: 'none' }}>
      {cardContent}
    </Link>
  ) : (
    <Link href={`/palpite/${game.id}`} style={{ textDecoration: 'none' }}>
      {cardContent}
    </Link>
  )
}
