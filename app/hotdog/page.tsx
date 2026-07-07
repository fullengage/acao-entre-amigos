'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function HotdogPage() {
  const router = useRouter()
  const [buyerName, setBuyerName] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const PRICE_PER_HOTDOG = 15

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerName.trim() || !sellerName.trim() || quantity < 1) return
    setLoading(true)
    setErrorMsg('')

    const totalAmount = quantity * PRICE_PER_HOTDOG

    try {
      const { data, error } = await supabase
        .from('hotdog_orders')
        .insert([
          {
            buyer_name: buyerName.trim(),
            seller_name: sellerName.trim(),
            quantity: quantity,
            total_amount: totalAmount,
          }
        ])
        .select('id')
        .single()

      if (error) throw error

      if (data && data.id) {
        router.push(`/hotdog/pagamento/${data.id}`)
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Ocorreu um erro ao registrar o pedido. Verifique se a tabela no banco foi criada.')
      setLoading(false)
    }
  }

  const totalValue = quantity * PRICE_PER_HOTDOG

  return (
    <main style={{ minHeight: '100vh', padding: '40px 16px 80px' }}>
      <div className="container-app" style={{ maxWidth: 600 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '3rem',
              letterSpacing: '0.02em',
              marginBottom: 8,
            }}
          >
            <span className="text-gradient-gold">Venda de Hotdog</span>
          </h1>
          <p style={{ color: '#8899bb' }}>
            Contribua com a Comunidade Voz de Deus comprando um delicioso Hotdog!
          </p>
        </div>

        {/* Form Card */}
        <div className="brazil-border" style={{ marginBottom: 24 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0,39,118,0.6), rgba(0,10,40,0.9))',
              borderRadius: 16,
              padding: 28,
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#aabbdd', fontWeight: 600 }}>
                  Nome do Comprador
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#aabbdd', fontWeight: 600 }}>
                  Nome do Vendedor (Quem te ofereceu?)
                </label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Nome do vendedor"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: '#aabbdd', fontWeight: 600 }}>
                  Quantidade de Hotdogs
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field"
                    style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'rgba(0,156,59,0.2)',
                      border: '1px solid rgba(0,156,59,0.5)',
                      color: '#00C94F',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div
                style={{
                  marginTop: 8,
                  padding: '16px',
                  background: 'rgba(255,223,0,0.1)',
                  border: '1px solid rgba(255,223,0,0.3)',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#FFDF00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total a Pagar
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8899bb', marginTop: 4 }}>
                    {quantity}x {formatCurrency(PRICE_PER_HOTDOG)}
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', fontFamily: "'Bebas Neue', sans-serif" }}>
                  {formatCurrency(totalValue)}
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: 12, background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', color: '#ffaaaa', borderRadius: 8, fontSize: '0.9rem', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-yellow"
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.1rem', marginTop: 8 }}
              >
                {loading ? 'Registrando...' : 'Gerar Ingresso e Pagar 🌭'}
              </button>
            </form>
          </div>
        </div>
        
        <Link href="/">
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
            ← Voltar para o Início
          </button>
        </Link>
      </div>
    </main>
  )
}
