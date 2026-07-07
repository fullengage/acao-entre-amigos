'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#000000', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Hero Section (Dark) */}
      <section
        style={{
          background: '#0B0B0B',
          position: 'relative',
          padding: '40px 16px 80px', // Extra padding at bottom for the torn effect
          color: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Subtle radial glow behind the hotdog */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(214,40,40,0.15) 0%, rgba(11,11,11,0) 70%)',
          transform: 'translateY(-50%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ 
          maxWidth: 1100, 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 40,
          position: 'relative',
          zIndex: 10
        }}>
          {/* Mobile layout uses flex-col, but we can write inline media queries or just rely on flex-wrap if we were using CSS. 
              Since this is inline styles, we'll use a responsive approach with CSS grid or flex wrap */}
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 40
          }}>
            
            {/* Text Content */}
            <div style={{ flex: '1 1 400px', maxWidth: '600px' }}>
              <div
                style={{
                  display: 'inline-block',
                  color: '#FF2A2A',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 16,
                  border: '1px solid rgba(255,42,42,0.3)',
                  padding: '6px 12px',
                  borderRadius: '4px'
                }}
              >
                Ação Entre Amigos • Voz de Deus
              </div>
              
              <h1
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  marginBottom: 24,
                  textTransform: 'uppercase'
                }}
              >
                Hot Dog<br/>
                <span style={{ color: '#FF2A2A' }}>Solidário</span>
              </h1>
              
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#A0A0A0', 
                lineHeight: 1.6, 
                marginBottom: 32,
                fontWeight: 400
              }}>
                Que tal saborear um delicioso hot dog brasileiro e, ao mesmo tempo, ajudar a transformar vidas? Todo o valor arrecadado será destinado aos projetos da Comunidade Voz de Deus.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link href="/hotdog" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      background: '#FF2A2A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '16px 32px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      boxShadow: '0 8px 24px rgba(255, 42, 42, 0.25)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Fazer Pedido
                  </button>
                </Link>
                
                <a href="#detalhes" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      background: 'transparent',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '16px 32px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    Mais Detalhes
                  </button>
                </a>
              </div>
            </div>

            {/* Image Content */}
            <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
              <img 
                src="/dogao.jpg" 
                alt="Dogão da Comunidade Voz de Deus" 
                style={{
                  width: '100%',
                  maxWidth: '450px', // slightly smaller max width since it's a vertical poster
                  height: 'auto',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                  transform: 'rotate(-2deg)',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Torn Paper Divider (SVG) */}
      <div style={{ 
        width: '100%', 
        height: '40px', 
        marginTop: '-39px', 
        position: 'relative', 
        zIndex: 20,
        overflow: 'hidden'
      }}>
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path 
            d="M0,0 L0,40 L1200,40 L1200,0 L1150,15 L1100,5 L1050,20 L1000,10 L950,25 L900,5 L850,20 L800,10 L750,30 L700,15 L650,25 L600,10 L550,20 L500,5 L450,25 L400,10 L350,20 L300,5 L250,25 L200,10 L150,20 L100,5 L50,15 Z" 
            fill="#FFFFFF" 
          />
        </svg>
      </div>

      {/* Details Section (White) */}
      <section id="detalhes" style={{ padding: '64px 16px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            textAlign: 'center', 
            marginBottom: 48,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Detalhes da Ação
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 24 
          }}>
            
            {/* Card 1: Valor */}
            <div style={{ 
              background: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '32px 24px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #F0F0F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>💲</div>
              <h3 style={{ fontSize: '1.1rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                Preço Único
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0B0B0B' }}>
                R$ 15<span style={{ fontSize: '1.5rem' }}>,00</span>
              </div>
            </div>

            {/* Card 2: Data */}
            <div style={{ 
              background: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '32px 24px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #F0F0F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📅</div>
              <h3 style={{ fontSize: '1.1rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                Data de Entrega
              </h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0B0B0B' }}>
                18/07/2026
              </div>
              <div style={{ fontSize: '1rem', color: '#888', fontWeight: 500, marginTop: 4 }}>
                Sábado
              </div>
            </div>

            {/* Card 3: Horário */}
            <div style={{ 
              background: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '32px 24px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #F0F0F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🕕</div>
              <h3 style={{ fontSize: '1.1rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                Horário
              </h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0B0B0B' }}>
                A partir das 18h
              </div>
              <div style={{ fontSize: '1rem', color: '#888', fontWeight: 500, marginTop: 4 }}>
                Retirada no local
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Floating Mobile CTA */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '16px', 
        background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0))', 
        zIndex: 50 
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Link href="/hotdog" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                background: '#0B0B0B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              🌭 Garantir o meu!
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
