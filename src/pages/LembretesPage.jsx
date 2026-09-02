import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LembretesPage() {
  const { authFetch } = useAuth()
  const [lembretes, setLembretes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pendente')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', descricao: '', data_lembrete: '', cotacao_id: '' })
  const [saving, setSaving] = useState(false)

  async function fetchLembretes() {
    try {
      const params = filter ? `?status=${filter}` : ''
      const data = await authFetch(`/api/admin/lembretes${params}`)
      setLembretes(data.data || [])
    } catch {
      toast.error('Erro ao carregar lembretes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLembretes() }, [filter])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.titulo || !form.data_lembrete) { toast.error('Titulo e data sao obrigatorios'); return }
    setSaving(true)
    try {
      await authFetch('/api/admin/lembretes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cotacao_id: form.cotacao_id ? parseInt(form.cotacao_id) : null
        })
      })
      toast.success('Lembrete criado')
      setForm({ titulo: '', descricao: '', data_lembrete: '', cotacao_id: '' })
      setShowForm(false)
      fetchLembretes()
    } catch {
      toast.error('Erro ao criar')
    } finally {
      setSaving(false)
    }
  }

  async function markDone(id) {
    try {
      await authFetch(`/api/admin/lembretes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluido' })
      })
      toast.success('Lembrete concluido')
      fetchLembretes()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  async function deleteLembrete(id) {
    try {
      await authFetch(`/api/admin/lembretes/${id}`, { method: 'DELETE' })
      toast.success('Lembrete removido')
      fetchLembretes()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  const now = new Date()
  const overdue = lembretes.filter(l => l.status === 'pendente' && new Date(l.data_lembrete) < now)
  const today = lembretes.filter(l => l.status === 'pendente' && new Date(l.data_lembrete).toDateString() === now.toDateString())
  const upcoming = lembretes.filter(l => l.status === 'pendente' && new Date(l.data_lembrete) > now && new Date(l.data_lembrete).toDateString() !== now.toDateString())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Lembretes</h1>
          <p className="text-xs text-white/30 mt-0.5">Gerencie follow-ups e lembretes de cotacoes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-sentinel text-navy-dark hover:shadow-lg transition-all">
          + Novo Lembrete
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'pendente', label: 'Pendentes' },
          { key: 'concluido', label: 'Concluidos' },
          { key: '', label: 'Todos' }
        ].map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setLoading(true) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.key ? 'bg-sentinel/15 text-sentinel border border-sentinel/25' : 'text-white/40 border border-white/[0.06] hover:border-white/10'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* New reminder form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Titulo do lembrete" required
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
              value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
            <input type="datetime-local" required
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sentinel/30"
              value={form.data_lembrete} onChange={e => setForm(f => ({ ...f, data_lembrete: e.target.value }))} />
          </div>
          <input placeholder="Descricao (opcional)"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
            value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          <div className="flex gap-2">
            <input type="number" placeholder="ID Cotacao (opcional)"
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30 w-40"
              value={form.cotacao_id} onChange={e => setForm(f => ({ ...f, cotacao_id: e.target.value }))} />
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-sentinel text-navy-dark hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? '...' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="Vencidos" color="text-rose-400" badge={overdue.length}>
          {overdue.map(l => <LembreteCard key={l.id} lembrete={l} onDone={markDone} onDelete={deleteLembrete} overdue />)}
        </Section>
      )}

      {/* Today */}
      {today.length > 0 && (
        <Section title="Hoje" color="text-amber-400" badge={today.length}>
          {today.map(l => <LembreteCard key={l.id} lembrete={l} onDone={markDone} onDelete={deleteLembrete} />)}
        </Section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section title="Proximos" color="text-white/40" badge={upcoming.length}>
          {upcoming.map(l => <LembreteCard key={l.id} lembrete={l} onDone={markDone} onDelete={deleteLembrete} />)}
        </Section>
      )}

      {/* Completed (when filter is concluido or all) */}
      {filter !== 'pendente' && lembretes.filter(l => l.status === 'concluido').length > 0 && (
        <Section title="Concluidos" color="text-emerald-400" badge={lembretes.filter(l => l.status === 'concluido').length}>
          {lembretes.filter(l => l.status === 'concluido').map(l => (
            <LembreteCard key={l.id} lembrete={l} onDelete={deleteLembrete} done />
          ))}
        </Section>
      )}

      {lembretes.length === 0 && (
        <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
          <p className="text-white/30 text-sm">Nenhum lembrete encontrado</p>
        </div>
      )}
    </div>
  )
}

function Section({ title, color, badge, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h2 className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</h2>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color} bg-white/5`}>{badge}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function LembreteCard({ lembrete, onDone, onDelete, overdue, done }) {
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 transition-all ${
      done ? 'bg-white/[0.01] border-white/[0.04] opacity-50' :
      overdue ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/[0.03] border-white/[0.06]'
    }`}>
      {!done && onDone && (
        <button onClick={() => onDone(lembrete.id)}
          className="w-5 h-5 rounded-full border-2 border-white/20 hover:border-emerald-400 hover:bg-emerald-400/10 transition-all flex-shrink-0 mt-0.5" />
      )}
      {done && (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${done ? 'text-white/30 line-through' : 'text-white'}`}>{lembrete.titulo}</p>
        {lembrete.descricao && <p className="text-xs text-white/30 mt-0.5">{lembrete.descricao}</p>}
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`text-[10px] ${overdue ? 'text-rose-400 font-bold' : 'text-white/25'}`}>
            {new Date(lembrete.data_lembrete).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
          {lembrete.empresa_nome && (
            <Link to={`/admin/cotacoes/${lembrete.cotacao_id}`} className="text-[10px] text-sentinel/60 hover:text-sentinel">
              {lembrete.empresa_nome}
            </Link>
          )}
          {lembrete.tipo === 'followup' && (
            <span className="text-[8px] font-bold uppercase bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded">Follow-up</span>
          )}
        </div>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(lembrete.id)}
          className="text-white/15 hover:text-rose-400 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
