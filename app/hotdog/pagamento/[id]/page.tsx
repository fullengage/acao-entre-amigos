'use client'

import { useEffect, useState, use } from 'react'
import { STATIC_PIX_CODE, PIX_DISPLAY } from '@/lib/pix'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { HotdogOrder } from '@/types'
import QRCode from 'qrcode'
import Link from 'next/link'

export default function HotdogPagamentoIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const [order, setOrder] = useState<HotdogOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [pixCode, setPixCode] = useState(STATIC_PIX_CODE)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || '5511955501090'

  useEffect(() => {
    async function loadOrder() {
      const { data, error } = await supabase
        .from('hotdog_orders')
        .select('*')
        .eq('id', id)
        .single()
        
      if (data) {
        setOrder(data)
        
        // Generate PIX QR Code from the static string
        QRCode.toDataURL(STATIC_PIX_CODE, {
          width: 240,
          margin: 2,
          color: { dark: '#002776', light: '#FFFFFF' },
        }).then(setQrDataUrl).catch(console.error)
      }
      setLoading(false)
    }
    
    loadOrder()
  }, [id])

  if (loading) {
    return (
      <main style={{ padding: '120px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌭</div>
        <p style={{ color: '#8899bb' }}>Carregando ingresso...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main style={{ padding: '120px 16px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', marginBottom: 16 }}>Pedido não encontrado</h1>
        <Link href="/hotdog">
          <button className="btn-primary">Voltar</button>
        </Link>
      </main>
    )
  }

  function copyPixCode() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  const whatsappMsg = encodeURIComponent(
    `Olá! Sou ${order.buyer_name} e acabo de comprar ${order.quantity} hotdog(s) oferecido(s) por ${order.seller_name}.\nTicket: #${order.ticket_number.toString().padStart(4, '0')}\nValor: ${formatCurrency(order.total_amount)}\n\nSegue o meu comprovante do PIX!`
  )

  const ticketStr = `#${order.ticket_number.toString().padStart(4, '0')}`

  return (
    <main style={{ padding: '40px 16px 80px' }}>
      <div className="container-app" style={{ maxWidth: 600 }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
            Ingresso Digital
          </h1>
          <p style={{ color: '#8899bb', marginTop: 4 }}>
            Tire um print (captura de tela) deste ingresso e compartilhe com o comprador!
          </p>
        </div>

        {/* INGRESSO VISUAL */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #FFDF00, #F0B800)',
            borderRadius: 16,
            padding: 2,
            marginBottom: 32,
            boxShadow: '0 12px 32px rgba(255,223,0,0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Furos do ingresso - Efeito visual */}
          <div style={{ position: 'absolute', left: -10, top: '50%', width: 20, height: 20, borderRadius: '50%', background: '#001A4D', transform: 'translateY(-50%)', zIndex: 10 }}></div>
          <div style={{ position: 'absolute', right: -10, top: '50%', width: 20, height: 20, borderRadius: '50%', background: '#001A4D', transform: 'translateY(-50%)', zIndex: 10 }}></div>
          
          <div style={{ background: '#121214', borderRadius: 14, overflow: 'hidden' }}>
            {/* Header Ticket */}
            <div style={{ background: 'rgba(255,223,0,0.1)', padding: '16px 20px', borderBottom: '1px dashed rgba(255,223,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.8rem' }}>🌭</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#FFDF00', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Voz de Deus</div>
                  <div style={{ fontSize: '1.1rem', color: 'white', fontWeight: 800 }}>HOTDOG SOLIDÁRIO</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#8899bb', textTransform: 'uppercase' }}>Ticket N°</div>
                <div style={{ fontSize: '1.3rem', color: '#FFDF00', fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{ticketStr}</div>
              </div>
            </div>
            
            {/* Body Ticket */}
            <div style={{ padding: '24px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Comprador</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{order.buyer_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Vendedor</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#aabbdd' }}>{order.seller_name}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Quantidade</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{order.quantity} <span style={{ fontSize: '0.9rem', color: '#8899bb', fontWeight: 400 }}>unid.</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Valor Total</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00C94F', fontFamily: "'Bebas Neue', sans-serif" }}>{formatCurrency(order.total_amount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIX Payment Card */}
        <div className="brazil-border" style={{ marginBottom: 24 }}>
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
              <p style={{ color: '#FFDF00', fontSize: '0.9rem', fontWeight: 600, background: 'rgba(255,223,0,0.1)', padding: '12px', borderRadius: 8, border: '1px solid rgba(255,223,0,0.3)' }}>
                ⚠️ O valor não vai preenchido automaticamente.<br/>
                Por favor, <strong>digite manualmente o valor de {formatCurrency(order.total_amount)}</strong> no seu aplicativo do banco!
              </p>
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
                { label: 'Identificação', value: `Hotdog ${ticketStr}` },
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

        <Link href="/hotdog">
          <button style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#8899bb',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            ← Vender Outro Hotdog
          </button>
        </Link>
      </div>
    </main>
  )
}
