'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Game } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'

interface GameFinancial {
  game: Game
  totalPaidGuesses: number
  totalCollected: number
  prizeAmount: number
  communityAmount: number
}

export default function AdminFinanceiroPage() {
  const [data, setData] = useState<GameFinancial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: games } = await supabase.from('games').select('*').order('match_date')
    const { data: payments } = await supabase.from('payments').select('*, guess:guesses(game_id)').eq('status', 'confirmed')

    const gameList = games || []
    const paymentList = payments || []

    const result: GameFinancial[] = gameList.map((game) => {
      const gamePays = paymentList.filter((p: any) => p.guess?.game_id === game.id)
      const total = gamePays.length * 10
      return {
        game,
        totalPaidGuesses: gamePays.length,
        totalCollected: total,
        prizeAmount: total * 0.5,
        communityAmount: total * 0.5,
      }
    })

    setData(result)
    setLoading(false)
  }

  const grandTotal = data.reduce((acc, d) => acc + d.totalCollected, 0)
  const grandPrize = grandTotal * 0.5
  const grandCommunity = grandTotal * 0.5

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>💰 Financeiro</h1>
        <p style={{ color: '#8899bb', fontSize: '0.9rem' }}>Resumo de arrecadação por jogo</p>
      </div>

      {/* Grand totals */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { icon: '💰', label: 'Total Arrecadado', value: formatCurrency(grandTotal), color: 'white' },
          { icon: '🏆', label: 'Total em Prêmios', value: formatCurrency(grandPrize), color: '#FFDF00', sub: '50% do arrecadado' },
          { icon: '🕊️', label: 'Para a Comunidade', value: formatCurrency(grandCommunity), color: '#00C94F', sub: '50% do arrecadado' },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{
              padding: '24px',
              textAlign: 'center',
              border: s.color !== 'white' ? `1px solid ${s.color}30` : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#8899bb', marginTop: 4 }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: '0.72rem', color: s.color, marginTop: 4, opacity: 0.7 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Per game breakdown */}
      <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: '1.1rem' }}>
        📋 Por Jogo
      </h2>

      {loading ? (
        <div style={{ color: '#8899bb', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : data.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: '#8899bb' }}>
          Nenhum dado financeiro ainda.
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              padding: '12px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'grid',
              gridTemplateColumns: '1fr 80px 120px 120px 120px',
              gap: 12,
              color: '#8899bb',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <span>Jogo</span>
            <span style={{ textAlign: 'center' }}>Palpites</span>
            <span style={{ textAlign: 'right' }}>Arrecadado</span>
            <span style={{ textAlign: 'right' }}>Prêmio (50%)</span>
            <span style={{ textAlign: 'right' }}>Comunidade (50%)</span>
          </div>
          {data.map((row, idx) => (
            <div
              key={row.game.id}
              style={{
                padding: '16px 24px',
                borderBottom: idx < data.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                display: 'grid',
                gridTemplateColumns: '1fr 80px 120px 120px 120px',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                  🇧🇷 Brasil x {row.game.opponent}
                </div>
                <div style={{ color: '#8899bb', fontSize: '0.78rem' }}>
                  {formatDate(row.game.match_date)} • {row.game.stage}
                </div>
              </div>
              <div style={{ textAlign: 'center', fontWeight: 700, color: 'white' }}>
                {row.totalPaidGuesses}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: 'white' }}>
                {formatCurrency(row.totalCollected)}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#FFDF00' }}>
                {formatCurrency(row.prizeAmount)}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#00C94F' }}>
                {formatCurrency(row.communityAmount)}
              </div>
            </div>
          ))}
          {/* Footer total */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '2px solid rgba(255,255,255,0.1)',
              display: 'grid',
              gridTemplateColumns: '1fr 80px 120px 120px 120px',
              gap: 12,
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'white' }}>TOTAL</div>
            <div style={{ textAlign: 'center', fontWeight: 700, color: 'white' }}>
              {data.reduce((a, d) => a + d.totalPaidGuesses, 0)}
            </div>
            <div style={{ textAlign: 'right', fontWeight: 900, color: 'white', fontSize: '1rem' }}>
              {formatCurrency(grandTotal)}
            </div>
            <div style={{ textAlign: 'right', fontWeight: 900, color: '#FFDF00', fontSize: '1rem' }}>
              {formatCurrency(grandPrize)}
            </div>
            <div style={{ textAlign: 'right', fontWeight: 900, color: '#00C94F', fontSize: '1rem' }}>
              {formatCurrency(grandCommunity)}
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div
        style={{
          marginTop: 24,
          background: 'rgba(0,39,118,0.2)',
          border: '1px solid rgba(0,39,118,0.4)',
          borderRadius: 12,
          padding: '20px 24px',
          fontSize: '0.85rem',
          color: '#8899bb',
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: '#aabbdd' }}>ℹ️ Como funciona a distribuição:</strong>
        <br />
        Cada palpite confirmado corresponde a R$ 10,00. Ao final de cada jogo, 50% do total
        arrecadado é destinado ao participante com maior pontuação, e os outros 50% são
        destinados para os projetos e manutenção da{' '}
        <strong style={{ color: '#FFDF00' }}>Comunidade Voz de Deus</strong> em Novo Horizonte-SP.
      </div>
    </div>
  )
}
