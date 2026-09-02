import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MiniShield } from './Home'

const PIPELINE_STAGES = [
  { key: 'formulario_enviado', label: 'Formulário Enviado', color: 'bg-blue-500', textColor: 'text-blue-400', borderColor: 'border-blue-500/30', bgLight: 'bg-blue-500/10' },
  { key: 'analise_previa', label: 'Análise Prévia iCover', color: 'bg-cyan-500', textColor: 'text-cyan-400', borderColor: 'border-cyan-500/30', bgLight: 'bg-cyan-500/10' },
  { key: 'enviado_seguradoras', label: 'Enviado às Seguradoras', color: 'bg-purple-500', textColor: 'text-purple-400', borderColor: 'border-purple-500/30', bgLight: 'bg-purple-500/10' },
  { key: 'aguardando_propostas', label: 'Aguardando Propostas', color: 'bg-yellow-500', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30', bgLight: 'bg-yellow-500/10' },
  { key: 'propostas_recebidas', label: 'Propostas Recebidas', color: 'bg-orange-500', textColor: 'text-orange-400', borderColor: 'border-orange-500/30', bgLight: 'bg-orange-500/10' },
  { key: 'em_negociacao', label: 'Em Negociação', color: 'bg-pink-500', textColor: 'text-pink-400', borderColor: 'border-pink-500/30', bgLight: 'bg-pink-500/10' },
  { key: 'apolice_emitida', label: 'Apólice Emitida', color: 'bg-emerald-500', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', bgLight: 'bg-emerald-500/10' },
]

function getStageInfo(stageKey) {
  return PIPELINE_STAGES.find(s => s.key === stageKey) || PIPELINE_STAGES[0]
}

function StatusBadge({ stageKey }) {
  const stage = getStageInfo(stageKey)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${stage.bgLight} ${stage.textColor} border ${stage.borderColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${stage.color}`} />
      {stage.label}
    </span>
  )
}

function MiniScoreGauge({ score }) {
  const pct = Math.min(Math.max(score, 0), 100)
  const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#fb7185'
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg width={56} height={56} viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{pct}</span>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent = false }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${accent ? 'bg-sentinel/5 border-sentinel/20' : 'bg-white/[0.03] border-white/[0.06]'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-sentinel/15' : 'bg-white/[0.06]'}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-xs text-white/40 font-medium">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function ClientDashboard() {
  const { user, authFetch } = useAuth()
  const navigate = useNavigate()
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuotations() {
      try {
        const data = await authFetch('/api/client/quotations')
        setQuotations(data.data || data.quotations || [])
      } catch {
        // If API not available yet, use empty array
        setQuotations([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuotations()
  }, [authFetch])

  const stats = {
    total: quotations.length,
    emAndamento: quotations.filter(q => !['apolice_emitida'].includes(q.pipeline_status || q.status)).length,
    concluidas: quotations.filter(q => (q.pipeline_status || q.status) === 'apolice_emitida').length,
    scoreMedio: quotations.length
      ? Math.round(quotations.reduce((sum, q) => sum + (q.icover_score || 0), 0) / quotations.length)
      : 0
  }

  const firstName = user?.nome?.split(' ')[0] || 'Usuario'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Olá, <span className="text-sentinel">{firstName}</span>
            </h1>
            <p className="text-sm text-white/40 mt-1">Acompanhe suas cotações de Seguro de Crédito</p>
          </div>
          <Link to="/cotacao/interno"
            className="btn-primary inline-flex items-center gap-2 text-sm self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Cotação
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={<svg className="w-5 h-5 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          label="Total Cotações" value={stats.total} accent />
        <StatCard
          icon={<svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Em Andamento" value={stats.emAndamento} />
        <StatCard
          icon={<svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Concluidas" value={stats.concluidas} />
        <StatCard
          icon={<svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          label="Score Médio iCover" value={stats.scoreMedio || '—'} />
      </div>

      {/* Quotation Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
        </div>
      ) : quotations.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 sm:py-24">
          <div className="w-20 h-20 rounded-full bg-sentinel/5 border border-sentinel/15 flex items-center justify-center mx-auto mb-6">
            <MiniShield size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Nenhuma cotação ainda</h2>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
            Você ainda não tem cotações. Inicie sua primeira cotação de Seguro de Crédito e receba uma análise iCover em segundos.
          </p>
          <Link to="/cotacao/interno" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Iniciar Primeira Cotação
          </Link>
        </div>
      ) : (
        /* Cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {quotations.map(q => (
            <div key={q.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-sentinel/20 hover:bg-white/[0.05] transition-all duration-300 group">
              {/* Top: Company + Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold truncate group-hover:text-sentinel transition-colors">
                    {q.company_name || q.razao_social || 'Empresa'}
                  </h3>
                  <p className="text-xs text-white/30 font-mono mt-0.5">
                    {q.cnpj ? q.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : '—'}
                  </p>
                </div>
                <span className={`flex-shrink-0 ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  q.type === 'externo' || q.tipo === 'exportacao'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                    : 'bg-sentinel/10 text-sentinel border border-sentinel/25'
                }`}>
                  {q.type === 'externo' || q.tipo === 'exportacao' ? 'Exportação' : 'Interno'}
                </span>
              </div>

              {/* Date + Score row */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-white/30">
                  {q.created_at ? new Date(q.created_at).toLocaleDateString('pt-BR') : '—'}
                </p>
                {q.icover_score != null && <MiniScoreGauge score={q.icover_score} />}
              </div>

              {/* Status */}
              <div className="mb-4">
                <StatusBadge stageKey={q.pipeline_status || q.status || 'formulario_enviado'} />
              </div>

              {/* Action */}
              <Link to={`/meu-painel/${q.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-sentinel border border-sentinel/20 hover:bg-sentinel/10 transition-all">
                Ver detalhes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { PIPELINE_STAGES, StatusBadge, MiniScoreGauge }
