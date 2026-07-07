import Link from 'next/link'
import Image from 'next/image'

export function Navbar() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#000000',
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img
            src="/logo-comunidade.png"
            alt="Comunidade Voz de Deus"
            style={{
              height: 38,
              width: 'auto',
              display: 'block',
            }}
          />
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', lineHeight: 1 }}>
              Ações Entre Amigos
            </div>
            <div style={{ fontSize: '0.7rem', color: '#00C94F', fontWeight: 600, marginTop: 2 }}>Voz de Deus</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/hotdog">
            <button className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
              🌭 Comprar Hotdog
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
