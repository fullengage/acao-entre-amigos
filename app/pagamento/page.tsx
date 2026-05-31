'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { generatePixPayload, PIX_CONFIG, PIX_DISPLAY } from '@/lib/pix'
import { halfLabel, goalsLabel, formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'
import Link from 'next/link'

function PagamentoContent() {
  const params = useSearchParams()
  const name = params.get('name') || 'Participante'
  const guessId = params.get('guessId') || ''
  const goals = Number(params.get('goals')) || 1
  const player = params.get('player') || ''
  const half = params.get('half') as 'first' | 'second' || 'first'
  const minute = Number(params.get('minute')) || 1

  const [pixCode, setPixCode] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [guessDetails, setGuessDetails] = useState<any[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || '5511955501090'

  useEffect(() => {
    const payload = generatePixPayload({
      ...PIX_CONFIG,
      txid: guessId.substring(0, 25) || 'BOLAO2026',
    })
    setPixCode(payload)

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: { dark: '#002776', light: '#FFFFFF' },
    }).then(setQrDataUrl).catch(console.error)
  }, [guessId])

  useEffect(() => {
    if (!guessId) return
    supabase
      .from('guesses')
      .select('*')
      .eq('id', guessId)
      .single()
      .then(({ data }) => {
        if (data && data.goals_details) {
          setGuessDetails(data.goals_details)
        }
      })
  }, [guessId])

  function copyPixCode() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  const whatsappMsg = encodeURIComponent(
    `Olá! Sou ${name} e acabo de enviar meu palpite no Bolão da COPA 2026. Segue o comprovante do PIX de R$ 10,00. ID do palpite: ${guessId}`
  )

  return (
    <main style={{ padding: '40px 16px 80px' }}>
      <div className="container-app" style={{ maxWidth: 600 }}>

        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(0,156,59,0.2)',
              border: '2px solid rgba(0,156,59,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 16px',
            }}
          >
            ✅
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
            Palpite Enviado!
          </h1>
          <p style={{ color: '#8899bb' }}>
            Olá, <strong style={{ color: '#FFDF00' }}>{name}</strong>! Agora finalize sua
            participação realizando o PIX abaixo.
          </p>
        </div>

        {/* Palpite summary */}
        <div
          className="glass-card"
          style={{ padding: '20px 24px', marginBottom: 24 }}
        >
          <h3 style={{ fontSize: '0.9rem', color: '#8899bb', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resumo do Palpite
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#8899bb' }}>Gols do Brasil</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>{goalsLabel(goals)}</div>
            </div>

            {guessDetails.length > 0 ? (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: '0.75rem', color: '#8899bb', marginBottom: 6 }}>Detalhamento dos gols:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {guessDetails.map((g, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem', color: 'white', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#FFDF00', fontWeight: 600 }}>{idx + 1}º gol:</span>
                      <span>{g.player_name} • {g.half === 'first' ? '1º Tempo' : '2º Tempo'} • {g.minute}'</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              goals > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Marcador Principal', value: player },
                    { label: 'Tempo', value: halfLabel(half) },
                    { label: 'Minuto', value: `${minute}'` },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: '0.75rem', color: '#8899bb' }}>{item.label}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* PIX Payment Card */}
        <div
          className="brazil-border"
          style={{ marginBottom: 24 }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0,39,118,0.6), rgba(0,10,40,0.9))',
              borderRadius: 16,
              padding: 28,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(0,156,59,0.2)',
                  border: '1px solid rgba(0,156,59,0.4)',
                  borderRadius: 999,
                  padding: '4px 16px',
                  color: '#00C94F',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                💳 Pagamento via PIX
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFDF00' }}>
                {formatCurrency(PIX_DISPLAY.amount)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8899bb', marginTop: 4 }}>
                Valor da participação no Bolão
              </div>
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: 'white',
                    padding: 12,
                    borderRadius: 12,
                  }}
                >
                  <img src={qrDataUrl} alt="QR Code PIX" width={200} height={200} />
                </div>
                <div style={{ color: '#8899bb', fontSize: '0.8rem', marginTop: 8 }}>
                  Escaneie o QR Code no seu banco
                </div>
              </div>
            )}

            {/* PIX details */}
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 16,
              }}
            >
              {[
                { label: 'Chave PIX (CPF)', value: PIX_DISPLAY.key },
                { label: 'Favorecido', value: PIX_DISPLAY.fullName },
                { label: 'Identificação', value: PIX_DISPLAY.description },
                { label: 'Cidade', value: PIX_DISPLAY.city },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ color: '#8899bb', fontSize: '0.8rem' }}>{item.label}</span>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Copy PIX button */}
            {pixCode && (
              <button
                onClick={copyPixCode}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: copied
                    ? 'linear-gradient(135deg, #006828, #004d1e)'
                    : 'linear-gradient(135deg, #009C3B, #006828)',
                  marginBottom: 12,
                }}
              >
                {copied ? '✅ Código Copiado!' : '📋 Copiar PIX Copia e Cola'}
              </button>
            )}

            <div
              style={{
                background: 'rgba(255,223,0,0.08)',
                border: '1px solid rgba(255,223,0,0.2)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: '#FFDF00',
                lineHeight: 1.6,
              }}
            >
              📱 Para validar sua participação, realize o PIX de R$ 10,00 para a chave acima e
              envie o comprovante pelo WhatsApp informado abaixo.
            </div>
          </div>
        </div>

        {/* WhatsApp button */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>📱</span>
            Enviar Comprovante no WhatsApp
          </button>
        </a>

        {/* Info */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            fontSize: '0.83rem',
            color: '#8899bb',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: '#aabbdd' }}>⏱️ Próximos passos:</strong>
          <ol style={{ paddingLeft: 16, marginTop: 8 }}>
            <li>Realize o PIX de R$ 10,00</li>
            <li>Envie o comprovante pelo WhatsApp acima</li>
            <li>Aguarde a confirmação do administrador</li>
            <li>Seu palpite entrará no ranking automaticamente</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/ranking" style={{ flex: 1 }}>
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: '#aabbdd',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🏆 Ver Ranking
            </button>
          </Link>
          <Link href="/" style={{ flex: 1 }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              🏠 Início
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={
      <main style={{ padding: '120px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>💳</div>
        <p style={{ color: '#8899bb' }}>Carregando dados do pagamento...</p>
      </main>
    }>
      <PagamentoContent />
    </Suspense>
  )
}
