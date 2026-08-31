import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const PIPELINE_STAGES = [
  { key: 'formulario_enviado', label: 'Formulário Enviado', color: '#3B82F6', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a2 2 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'analise_previa', label: 'Análise Prévia', color: '#06B6D4', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'enviado_seguradoras', label: 'Enviado às Seguradoras', color: '#8B5CF6', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'aguardando_propostas', label: 'Aguardando Propostas', color: '#F59E0B', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'propostas_recebidas', label: 'Propostas Recebidas', color: '#F97316', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { key: 'em_negociacao', label: 'Em Negociação', color: '#EC4899', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
  { key: 'apolice_emitida', label: 'Apólice Emitida', color: '#10B981', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
]

function getStageInfo(key) {
  return PIPELINE_STAGES.find(s => s.key === key) || PIPELINE_STAGES[0]
}

export default function Dashboard() {
  const { authFetch } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')

  async function fetchStats() {
    try {
      const data = await authFetch('/api/admin/dashboard-stats')
      setStats(data.data)
    } catch (err) {
      toast.error('Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-32">
        <p className="text-white/40">Erro ao carregar dados do dashboard</p>
        <button onClick={() => { setLoading(true); fetchStats() }} className="mt-4 btn-primary text-sm">Tentar novamente</button>
      </div>
    )
  }

  const filteredQuotations = (stats.recentQuotations || []).filter(q => {
    // Tipo filter
    if (tipoFilter === 'interno' && q.tipo !== 'interno') return false
    if (tipoFilter === 'externo' && q.tipo !== 'externo') return false

    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (q.razao_social || '').toLowerCase().includes(term) ||
      (q.cnpj || '').includes(term) ||
      (q.contato_email || '').toLowerCase().includes(term) ||
      (q.user_email || '').toLowerCase().includes(term)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Dashboard Admin</h1>
          <p className="text-xs text-white/30 mt-0.5">Visão geral das cotações e operações</p>
        </div>
        <button onClick={() => { setLoading(true); fetchStats() }}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all">
          Atualizar
        </button>
      </div>

      {/* Action Items (alerts) */}
      {stats.actionItems && stats.actionItems.length > 0 && (
        <div className="space-y-2">
          {stats.actionItems.map((item, i) => (
            <div key={i} className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              item.urgencia === 'alta'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Total Cotações" value={stats.totalLeads} color="text-sentinel" bg="bg-sentinel/10" border="border-sentinel/20"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a2 2 0 01.293.707V19a2 2 0 01-2 2z" />
        <KpiCard label="Últimos 7 dias" value={stats.recentLeads} color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <KpiCard label="Propostas Recebidas" value={stats.totalProposals} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <KpiCard label="Taxa de Conversão" value={`${stats.taxaConversao}%`} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Mensagens nao lidas" value={stats.unreadMessages} color="text-blue-400" />
        <MiniStat label="Lembretes vencidos" value={stats.overdueReminders} color={stats.overdueReminders > 0 ? 'text-rose-400' : 'text-white/40'} />
        <MiniStat label="Aguardando resposta" value={stats.pendingEmails} color="text-amber-400" />
      </div>

      {/* Pipeline Kanban */}
      <div>
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Pipeline</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map(stage => {
            const count = stats.pipeline?.[stage.key] || 0
            return (
              <div key={stage.key} className="flex-shrink-0 w-36 sm:w-40">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center hover:border-white/10 transition-all">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${stage.color}20` }}>
                    <svg className="w-4 h-4" style={{ color: stage.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stage.icon} />
                    </svg>
                  </div>
                  <p className="text-2xl font-black text-white">{count}</p>
                  <p className="text-[10px] text-white/30 font-medium mt-0.5 leading-tight">{stage.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Atividade Recente</h2>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04]">
            {stats.recentActivity.slice(0, 5).map(evt => (
              <div key={evt.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getStageInfo(evt.status).color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/80 truncate">
                    <span className="font-semibold">{evt.razao_social}</span>
                    {evt.note && <span className="text-white/40"> — {evt.note}</span>}
                  </p>
                  <p className="text-[10px] text-white/25">
                    {evt.created_by} · {new Date(evt.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotations Table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Cotacoes</h2>
            {/* Tipo filter tabs */}
            <div className="flex gap-1">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'interno', label: 'Interno' },
                { key: 'externo', label: 'Exportacao' }
              ].map(f => (
                <button key={f.key} onClick={() => setTipoFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    tipoFilter === f.key
                      ? f.key === 'externo' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                        : f.key === 'interno' ? 'bg-sentinel/15 text-sentinel border border-sentinel/25'
                        : 'bg-white/10 text-white/60 border border-white/15'
                      : 'text-white/25 border border-white/[0.06] hover:border-white/10'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30 w-64"
              placeholder="Buscar empresa, CNPJ, email..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredQuotations.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            <p className="text-white/30 text-sm">Nenhuma cotacao encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-semibold">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Empresa</th>
                  <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Excel</th>
                  <th className="text-left px-4 py-3 font-semibold">iCover</th>
                  <th className="text-left px-4 py-3 font-semibold">Emails</th>
                  <th className="text-left px-4 py-3 font-semibold">Propostas</th>
                  <th className="text-left px-4 py-3 font-semibold">Data</th>
                  <th className="text-right px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredQuotations.map(q => {
                  const stage = getStageInfo(q.pipeline_status)
                  return (
                    <tr key={q.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3 text-xs text-white/30 font-mono">{q.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-white group-hover:text-sentinel transition-colors truncate max-w-[200px]">
                          {q.razao_social || '—'}
                        </p>
                        <p className="text-[10px] text-white/25 font-mono">{q.cnpj || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          q.tipo === 'externo'
                            ? 'bg-purple-500/15 text-purple-400'
                            : 'bg-sentinel/10 text-sentinel'
                        }`}>
                          {q.tipo === 'externo' ? 'Export' : 'Interno'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: stage.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(q.excel_files || []).length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {q.excel_files.slice(0, 2).map((f, i) => (
                              <a key={i} href={f.path} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-400/70 hover:text-emerald-400 transition-colors truncate max-w-[120px]"
                                title={f.filename}>
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="truncate">{f.filename.length > 15 ? f.filename.slice(0, 12) + '...' : f.filename}</span>
                              </a>
                            ))}
                            {q.excel_files.length > 2 && <span className="text-[9px] text-white/20">+{q.excel_files.length - 2}</span>}
                          </div>
                        ) : <span className="text-white/15 text-[10px]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {q.icover_score != null ? (
                          <span className={`text-sm font-bold ${q.icover_score >= 75 ? 'text-emerald-400' : q.icover_score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {q.icover_score}
                          </span>
                        ) : <span className="text-white/15 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">{q.emails_enviados || 0}</td>
                      <td className="px-4 py-3 text-xs text-white/40">{q.propostas_count || 0}</td>
                      <td className="px-4 py-3 text-xs text-white/30">
                        {q.created_at ? new Date(q.created_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/cotacoes/${q.id}`}
                          className="text-xs font-semibold text-sentinel/60 hover:text-sentinel transition-colors">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, color, bg, border, icon }) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 sm:p-5`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-[10px] text-white/40 font-medium">{label}</p>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-white/30">{label}</p>
    </div>
  )
}
