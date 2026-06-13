'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Player, Game } from '@/types'
import { Suspense } from 'react'

function JogadoresContent() {
  const searchParams = useSearchParams()
  const gameId = searchParams.get('gameId') || ''

  const [players, setPlayers] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState(gameId)
  const [newName, setNewName] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('games').select('*').order('match_date').then(({ data }) => setGames(data || []))
  }, [])

  useEffect(() => {
    if (selectedGame) loadPlayers()
    else setLoading(false)
  }, [selectedGame])

  async function loadPlayers() {
    setLoading(true)
    const { data } = await supabase.from('players').select('*').eq('game_id', selectedGame).order('name')
    setPlayers(data || [])
    setLoading(false)
  }

  async function addPlayer() {
    if (!newName.trim() || !selectedGame) return
    await supabase.from('players').insert({ game_id: selectedGame, name: newName.trim(), position: newPosition.trim() || null })
    setNewName('')
    setNewPosition('')
    loadPlayers()
  }

  async function removePlayer(id: string) {
    await supabase.from('players').delete().eq('id', id)
    loadPlayers()
  }

  async function addDefaultPlayers() {
    if (!selectedGame) return
    const defaults = [
      // Goleiros
      { name: 'Alisson', position: 'Goleiro' },
      { name: 'Ederson', position: 'Goleiro' },
      { name: 'Weverton', position: 'Goleiro' },
      // Defensores
      { name: 'Alex Sandro', position: 'Zagueiro' },
      { name: 'Bremer', position: 'Zagueiro' },
      { name: 'Danilo', position: 'Zagueiro' },
      { name: 'Douglas Santos', position: 'Zagueiro' },
      { name: 'Gabriel Magalhães', position: 'Zagueiro' },
      { name: 'Ibañez', position: 'Zagueiro' },
      { name: 'Léo Pereira', position: 'Zagueiro' },
      { name: 'Marquinhos', position: 'Zagueiro' },
      // Meio-campistas
      { name: 'Bruno Guimarães', position: 'Meia' },
      { name: 'Casemiro', position: 'Meia' },
      { name: 'Danilo Santos', position: 'Meia' },
      { name: 'Éderson', position: 'Meia' },
      { name: 'Fabinho', position: 'Meia' },
      { name: 'Lucas Paquetá', position: 'Meia' },
      // Atacantes
      { name: 'Endrick', position: 'Atacante' },
      { name: 'Gabriel Martinelli', position: 'Atacante' },
      { name: 'Igor Thiago', position: 'Atacante' },
      { name: 'Luiz Henrique', position: 'Atacante' },
      { name: 'Matheus Cunha', position: 'Atacante' },
      { name: 'Neymar Jr.', position: 'Atacante' },
      { name: 'Raphinha', position: 'Atacante' },
      { name: 'Rayan', position: 'Atacante' },
      { name: 'Vini Jr.', position: 'Atacante' },
      // Outro
      { name: 'Outro jogador', position: '' },
    ]
    await supabase.from('players').insert(defaults.map((d) => ({ ...d, game_id: selectedGame })))
    loadPlayers()
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>👕 Jogadores</h1>
        <p style={{ color: '#8899bb', fontSize: '0.9rem' }}>Defina os jogadores disponíveis para palpite em cada jogo</p>
      </div>

      {/* Game selector */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#aabbdd', fontSize: '0.9rem' }}>
          Selecionar Jogo
        </label>
        <select
          className="input-field"
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          style={{ maxWidth: 400 }}
        >
          <option value="">-- Escolha um jogo --</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              Brasil x {g.opponent} — {g.match_date}
            </option>
          ))}
        </select>
      </div>

      {selectedGame && (
        <>
          {/* Add player */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: '1rem' }}>➕ Adicionar Jogador</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <input
                className="input-field"
                placeholder="Nome do jogador"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 2, minWidth: 200 }}
              />
              <input
                className="input-field"
                placeholder="Posição (opcional)"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                style={{ flex: 1, minWidth: 150 }}
              />
              <button className="btn-primary" onClick={addPlayer} disabled={!newName.trim()}>
                Adicionar
              </button>
            </div>
            <button
              onClick={addDefaultPlayers}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,223,0,0.1)',
                border: '1px solid rgba(255,223,0,0.3)',
                borderRadius: 8,
                color: '#FFDF00',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              ⚡ Adicionar Jogadores Padrão
            </button>
          </div>

          {/* Players list */}
          {loading ? (
            <div style={{ color: '#8899bb', padding: 40, textAlign: 'center' }}>Carregando...</div>
          ) : players.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#8899bb' }}>
              Nenhum jogador cadastrado. Adicione acima ou use os padrão.
            </div>
          ) : (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: idx < players.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: 'white' }}>⚽ {player.name}</span>
                    {player.position && (
                      <span style={{ color: '#8899bb', fontSize: '0.82rem', marginLeft: 8 }}>
                        {player.position}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removePlayer(player.id)}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(220,38,38,0.1)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: 6,
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                    }}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminJogadoresPage() {
  return (
    <Suspense fallback={<div style={{ color: '#8899bb', padding: 40 }}>Carregando...</div>}>
      <JogadoresContent />
    </Suspense>
  )
}
