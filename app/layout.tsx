import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bolão da COPA 2026 — Comunidade Voz de Deus',
  description:
    'Brincadeira recreativa entre amigos e participantes da comunidade durante os jogos da Seleção Brasileira na Copa do Mundo 2026. Comunidade Voz de Deus — Novo Horizonte, SP.',
  keywords: ['bolão', 'seleção brasileira', 'copa do mundo 2026', 'comunidade voz de deus', 'novo horizonte'],
  openGraph: {
    title: 'Bolão da COPA 2026',
    description: 'Quanto mais perto do lance histórico, maior a chance de ganhar!',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        {children}
        <footer className="legal-notice" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Este sistema é destinado exclusivamente a uma brincadeira recreativa entre amigos e
            participantes da comunidade durante os jogos da Seleção Brasileira na Copa do Mundo de
            2026. Não se trata de plataforma de apostas esportivas, cassino online ou atividade
            profissional de jogo. A participação possui caráter recreativo e colaborativo para
            auxílio nos custos dos projetos e manutenção do espaço da{' '}
            <strong>Comunidade Voz de Deus</strong> em Novo Horizonte-SP.
          </p>
          <div style={{ marginTop: 4, display: 'flex', gap: 16 }}>
            <Link href="/regulamento" style={{ fontSize: '0.8rem', color: '#4a5a7a', textDecoration: 'none' }}>
              📜 Regulamento
            </Link>
            <Link href="/admin/dashboard" style={{ fontSize: '0.8rem', color: '#4a5a7a', textDecoration: 'none' }}>
              🔒 Área Administrativa
            </Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
