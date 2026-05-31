'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Game, GameStatus } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'

const emptyForm = {
  opponent: '',
  match_date: '',
  match_time: '',
  stage: 'Fase de Grupos',
  status: 'upcoming' as GameStatus,
}

export default function AdminJogosPage() {
  const [games, setGames] = useState<Game[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { loadGames() }, [])

  async function loadGames() {
    const { data } = await supabase.from('games').select('*').order('match_date')
    setGames(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.opponent || !form.match_date || !form.match_time) return
    setSaving(true)
    if (editId) {
      await supabase.from('games').update(form).eq('id', editId)
    } else {
      await supabase.from('games').insert(form)
    }
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    await loadGames()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este jogo?')) return
    await supabase.from('games').delete().eq('id', id)
    await loadGames()
  }

  function handleEdit(game: Game) {
    setForm({
      opponent: game.opponent,
      match_date: game.match_date,
      match_time: game.match_time,
      stage: game.stage,
      status: game.status,
    })
    setEditId(game.id)
    setShowForm(true)
  }

  const statusLabel: Record<GameStatus, string> = {
    upcoming: 'Aguardando',
    live: 'Ao Vivo',
    finished: 'Encerrado',
  }
  const statusColor: Record<GameStatus, string> = {
    upcoming: 'badge-pending',
    live: 'badge-paid',
    finished: 'badge-rejected',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>⚽ Jogos</h1>
          <p style={{ color: '#8899bb', fontSize: '0.9rem' }}>Cadastre as partidas da Seleção Brasileira</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}>
          ➕ Novo Jogo
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: 28, marginBottom: 32, border: '1px solid rgba(0,156,59,0.3)' }}>
          <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 20 }}>
            {editId ? '✏️ Editar Jogo' : '➕ Novo Jogo'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Adversário *</label>
              <input className="input-field" placeholder="Ex: Argentina" value={form.opponent} onChange={(e) => setForm((f) => ({ ...f, opponent: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Data *</label>
              <input type="date" className="input-field" value={form.match_date} onChange={(e) => setForm((f) => ({ ...f, match_date: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Horário *</label>
              <input type="time" className="input-field" value={form.match_time} onChange={(e) => setForm((f) => ({ ...f, match_time: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Fase</label>
              <select className="input-field" value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}>
                {['Fase de Grupos', 'Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as GameStatus }))}>
                <option value="upcoming">Aguardando</option>
                <option value="live">Ao Vivo</option>
                <option value="finished">Encerrado</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : '💾 Salvar'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null) }}
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#aabbdd', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Games list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#8899bb', padding: 60 }}>Carregando...</div>
      ) : games.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: '#8899bb' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚽</div>
          <p>Nenhum jogo cadastrado. Clique em "Novo Jogo" para começar.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {games.map((game, idx) => (
            <div
              key={game.id}
              style={{
                padding: '18px 24px',
                borderBottom: idx < games.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                  🇧🇷 Brasil x {game.opponent}
                </div>
                <div style={{ color: '#8899bb', fontSize: '0.82rem', marginTop: 4 }}>
                  {formatDate(game.match_date)} • {formatTime(game.match_time)} • {game.stage}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className={`badge ${statusColor[game.status]}`}>
                  {statusLabel[game.status]}
                </span>
                <Link href={`/admin/resultado/${game.id}`}>
                  <button style={actionBtn}>🏁 Resultado</button>
                </Link>
                <Link href={`/admin/jogadores?gameId=${game.id}`}>
                  <button style={actionBtn}>👕 Jogadores</button>
                </Link>
                <button style={actionBtn} onClick={() => handleEdit(game)}>✏️</button>
                <button
                  onClick={() => handleDelete(game.id)}
                  style={{ ...actionBtn, color: '#f87171', borderColor: 'rgba(220,38,38,0.3)' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 600,
  color: '#aabbdd',
  fontSize: '0.85rem',
}

const actionBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#aabbdd',
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontWeight: 600,
}
