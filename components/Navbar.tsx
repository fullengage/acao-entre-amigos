import Link from 'next/link'
import Image from 'next/image'

export function Navbar() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10,15,26,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="container-app"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #009C3B, #FFDF00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
            }}
          >
            ⚽
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', lineHeight: 1 }}>
              Bolão da Seleção
            </div>
            <div style={{ fontSize: '0.7rem', color: '#00C94F', fontWeight: 600 }}>2026</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/ranking">
            <button
              style={{
                padding: '7px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#aabbdd',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🏆 Ranking
            </button>
          </Link>
          <Link href="/jogos">
            <button className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
              ⚽ Fazer Palpite
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
