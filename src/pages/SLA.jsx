import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SLA() {
  const { authFetch } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchAnalytics() {
    try {
      const result = await authFetch('/api/admin/analytics')
      setData(result.data)
    } catch {
      toast.error('Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnalytics() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  if (!data) return <div className="text-center py-32 text-white/40">Erro ao carregar dados</div>

  const funnel = data.funnel || {}
  const total = funnel.total || 0

  const funnelStages = [
    { key: 'formulario_enviado', label: 'Formulario Enviado', color: '#3B82F6', count: funnel.formulario_enviado || 0 },
    { key: 'analise_previa', label: 'Analise Previa', color: '#06B6D4', count: funnel.analise_previa || 0 },
    { key: 'enviado_seguradoras', label: 'Enviado Seguradoras', color: '#8B5CF6', count: funnel.enviado_seguradoras || 0 },
    { key: 'aguardando_propostas', label: 'Aguardando Propostas', color: '#F59E0B', count: funnel.aguardando_propostas || 0 },
    { key: 'propostas_recebidas', label: 'Propostas Recebidas', color: '#F97316', count: funnel.propostas_recebidas || 0 },
    { key: 'em_negociacao', label: 'Em Negociacao', color: '#EC4899', count: funnel.em_negociacao || 0 },
    { key: 'apolice_emitida', label: 'Apolice Emitida', color: '#10B981', count: funnel.apolice_emitida || 0 }
  ]

  // Combine new and legacy insurer data
  const segStats = (data.seguradoraStats || []).map(seg => {
    const legacy = (data.legacySla || []).find(l => l.seguradora === seg.nome)
    return {
      ...seg,
      total_enviadas: (seg.total_enviadas || 0) + (legacy?.total_enviadas || 0),
      aguardando: (seg.aguardando || 0) + (legacy?.aguardando || 0),
      prazo_medio: seg.prazo_medio_dias != null ? Math.round(seg.prazo_medio_dias) : (legacy?.prazo_medio || 0),
      taxa_resposta: seg.total_enviadas > 0
        ? Math.round((seg.total_respondidas / seg.total_enviadas) * 100)
        : (legacy?.total_enviadas > 0 ? Math.round(((legacy.total_enviadas - legacy.aguardando) / legacy.total_enviadas) * 100) : 0)
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">SLA & Analytics</h1>
          <p className="text-xs text-white/30 mt-0.5">Performance das seguradoras e funil de conversao</p>
        </div>
        <button onClick={() => { setLoading(true); fetchAnalytics() }}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all">
          Atualizar
        </button>
      </div>

      {/* Funnel */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Funil de Conversao</h2>
        <div className="space-y-2">
          {funnelStages.map(stage => {
            const pct = total > 0 ? (stage.count / total) * 100 : 0
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 w-36 text-right truncate">{stage.label}</span>
                <div className="flex-1 h-7 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(3, pct)}%`, backgroundColor: stage.color }}>
                    {stage.count > 0 && <span className="text-white text-[10px] font-bold">{stage.count}</span>}
                  </div>
                </div>
                <span className="text-xs font-bold text-white/40 w-12 text-right">{pct.toFixed(0)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Trends */}
      {(data.monthlyTrends || []).length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Tendencia Mensal</h2>
          <div className="flex items-end justify-between gap-3 h-40">
            {data.monthlyTrends.map(m => {
              const maxM = Math.max(...data.monthlyTrends.map(x => x.total), 1)
              return (
                <div key={m.mes} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] font-bold text-white/60">{m.total}</span>
                  <div className="w-full flex flex-col gap-0.5" style={{ height: `${(m.total / maxM) * 100}%` }}>
                    <div className="flex-1 rounded-t bg-sentinel/60" style={{ flex: m.interno || 0 }} />
                    <div className="flex-1 rounded-b bg-purple-500/60" style={{ flex: m.externo || 0 }} />
                  </div>
                  <span className="text-[9px] text-white/25">{m.mes.split('-')[1]}/{m.mes.split('-')[0].slice(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-sentinel/60" />
              <span className="text-[10px] text-white/30">Interno</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-purple-500/60" />
              <span className="text-[10px] text-white/30">Exportacao</span>
            </div>
          </div>
        </div>
      )}

      {/* Insurer SLA Cards */}
      <div>
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Performance por Seguradora</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {segStats.map(seg => (
            <div key={seg.slug} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${seg.cor || '#666'}20` }}>
                    <span className="text-xs font-black" style={{ color: seg.cor || '#666' }}>{seg.nome.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{seg.nome}</span>
                </div>
                <Semaforo dias={seg.prazo_medio} />
              </div>

              <div className="space-y-2">
                <StatRow label="Enviadas" value={seg.total_enviadas} />
                <StatRow label="Aguardando" value={seg.aguardando} color={seg.aguardando > 0 ? 'text-amber-400' : 'text-white/40'} />
                <StatRow label="Prazo Medio" value={seg.prazo_medio > 0 ? `${seg.prazo_medio}d` : '—'} />
                <StatRow label="Taxa Resposta" value={seg.taxa_resposta > 0 ? `${seg.taxa_resposta}%` : '—'}
                  color={seg.taxa_resposta >= 80 ? 'text-emerald-400' : seg.taxa_resposta >= 50 ? 'text-amber-400' : 'text-white/40'} />
                {seg.taxa_media != null && <StatRow label="Taxa Media" value={`${seg.taxa_media.toFixed(3)}%`} />}
              </div>

              {seg.total_enviadas > 0 && (
                <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${seg.taxa_resposta}%`,
                      backgroundColor: seg.taxa_resposta >= 80 ? '#34D399' : seg.taxa_resposta >= 50 ? '#FBBF24' : '#FB7185'
                    }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value, color = 'text-white/60' }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-white/30">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function Semaforo({ dias }) {
  if (!dias || dias <= 0) return <span className="w-2.5 h-2.5 rounded-full bg-white/10 inline-block" />
  if (dias < 5) return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
  if (dias <= 10) return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse inline-block" />
  return <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse inline-block" />
}
