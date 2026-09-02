import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PIPELINE_STAGES, StatusBadge, MiniScoreGauge } from './ClientDashboard'

// ─── Pipeline Stepper ───
function PipelineStepper({ currentStage }) {
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === currentStage)

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center min-w-[600px] gap-0">
        {PIPELINE_STAGES.map((stage, i) => {
          const isComplete = i < currentIdx
          const isCurrent = i === currentIdx
          const isPending = i > currentIdx

          return (
            <div key={stage.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isComplete ? `${stage.color} border-transparent text-white`
                    : isCurrent ? `${stage.bgLight} ${stage.borderColor} ${stage.textColor}`
                    : 'bg-white/[0.03] border-white/10 text-white/20'
                }`}>
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <p className={`text-[10px] mt-1.5 text-center leading-tight max-w-[80px] ${
                  isCurrent ? stage.textColor + ' font-semibold' : isComplete ? 'text-white/50' : 'text-white/20'
                }`}>
                  {stage.label}
                </p>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className={`h-0.5 w-full flex-shrink min-w-[20px] -mt-5 ${
                  isComplete ? stage.color : 'bg-white/10'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Score Gauge (Large) ───
function ScoreGauge({ score }) {
  const pct = Math.min(Math.max(score, 0), 100)
  const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#fb7185'
  const label = pct >= 75 ? 'Excelente' : pct >= 50 ? 'Moderado' : 'Atencion'
  const circumference = 2 * Math.PI * 50
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg width={128} height={128} viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{pct}</span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">score</span>
        </div>
      </div>
      <span className="text-sm font-semibold mt-2" style={{ color }}>{label}</span>
    </div>
  )
}

// ─── Timeline Item ───
function TimelineItem({ event, isLast }) {
  const iconMap = {
    formulario_enviado: { icon: '1', color: 'bg-blue-500' },
    analise_previa: { icon: '2', color: 'bg-cyan-500' },
    enviado_seguradoras: { icon: '3', color: 'bg-purple-500' },
    aguardando_propostas: { icon: '4', color: 'bg-yellow-500' },
    propostas_recebidas: { icon: '5', color: 'bg-orange-500' },
    em_negociacao: { icon: '6', color: 'bg-pink-500' },
    apolice_emitida: { icon: '7', color: 'bg-emerald-500' },
    mensagem: { icon: 'M', color: 'bg-sentinel' },
    documento: { icon: 'D', color: 'bg-accent-violet' },
  }
  const info = iconMap[event.type] || { icon: '?', color: 'bg-white/20' }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${info.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
          {info.icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-white/10 my-1" />}
      </div>
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <p className="text-sm font-semibold text-white">{event.title}</p>
        {event.description && <p className="text-xs text-white/40 mt-0.5">{event.description}</p>}
        <p className="text-[10px] text-white/25 mt-1">
          {event.date ? new Date(event.date).toLocaleString('pt-BR') : ''}
        </p>
      </div>
    </div>
  )
}

// ─── Document Item ───
function DocumentItem({ doc }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{doc.name}</p>
          <p className="text-[10px] text-white/30">{doc.size || ''} {doc.date ? '- ' + new Date(doc.date).toLocaleDateString('pt-BR') : ''}</p>
        </div>
      </div>
      {doc.url && (
        <a href={doc.url} download className="flex-shrink-0 ml-3 p-2 rounded-lg hover:bg-white/5 text-sentinel transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      )}
    </div>
  )
}

// ─── Messages Section ───
function MessagesSection({ messages = [], onSend }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex flex-col">
      <div className="max-h-80 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-white/25 text-center py-8">Nenhuma mensagem ainda. Envie uma mensagem para a equipe Fairfield.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
              msg.from === 'client'
                ? 'bg-sentinel/15 border border-sentinel/20 text-white'
                : 'bg-white/[0.06] border border-white/[0.08] text-white/80'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className="text-[10px] mt-1 opacity-40">
                {msg.date ? new Date(msg.date).toLocaleString('pt-BR') : ''}
                {msg.from !== 'client' && msg.author ? ` - ${msg.author}` : ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="input-field flex-1"
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Escreva sua mensagem..."
        />
        <button type="submit" disabled={!text.trim()}
          className="btn-primary px-4 py-3 flex-shrink-0 disabled:opacity-30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function QuotationDetail() {
  const { id } = useParams()
  const { authFetch } = useAuth()
  const [quotation, setQuotation] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [documents, setDocuments] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await authFetch(`/api/client/quotations/${id}`)
        setQuotation(data.quotation || null)
        setTimeline(data.timeline || [])
        setDocuments(data.documents || [])
        setMessages(data.messages || [])
      } catch {
        // API may not be ready — use empty state
        setQuotation(null)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id, authFetch])

  async function handleSendMessage(text) {
    const newMsg = { text, from: 'client', date: new Date().toISOString() }
    setMessages(prev => [...prev, newMsg])
    try {
      await authFetch(`/api/client/quotations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
    } catch {
      // Message sent optimistically
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Cotacao nao encontrada</h2>
        <p className="text-white/40 text-sm mb-6">A cotacao solicitada nao foi encontrada ou voce nao tem permissao para acessa-la.</p>
        <Link to="/meu-painel" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Painel
        </Link>
      </div>
    )
  }

  const q = quotation

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fadeIn">
      {/* Back link */}
      <Link to="/meu-painel" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-sentinel transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar ao Painel
      </Link>

      {/* ─── Header ─── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {q.company_name || q.razao_social || 'Empresa'}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-white/30 font-mono">
                {q.cnpj ? q.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : '—'}
              </span>
              <span className="text-white/10">|</span>
              <span className="text-xs text-white/30">
                {q.created_at ? new Date(q.created_at).toLocaleDateString('pt-BR') : '—'}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                q.type === 'externo' || q.tipo === 'exportacao'
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                  : 'bg-sentinel/10 text-sentinel border border-sentinel/25'
              }`}>
                {q.type === 'externo' || q.tipo === 'exportacao' ? 'Exportacao' : 'Interno'}
              </span>
            </div>
          </div>
          <StatusBadge stageKey={q.status || 'formulario_enviado'} />
        </div>

        {/* Pipeline Stepper */}
        <PipelineStepper currentStage={q.status || 'formulario_enviado'} />
      </div>

      {/* ─── Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: iCover + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* iCover Summary */}
          {q.icover_score != null && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-sentinel" viewBox="0 0 80 80" fill="none">
                  <path d="M40 12 L62 24 L62 42 C62 56 52 66 40 70 C28 66 18 56 18 42 L18 24 Z"
                    fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                Resumo iCover
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex justify-center">
                  <ScoreGauge score={q.icover_score} />
                </div>
                <div className="sm:col-span-2 space-y-3">
                  {q.premium_estimate && (
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                      <span className="text-sm text-white/50">Premio Estimado</span>
                      <span className="text-sm font-bold text-white">
                        {typeof q.premium_estimate === 'number'
                          ? `R$ ${q.premium_estimate.toLocaleString('pt-BR')}`
                          : q.premium_estimate}
                      </span>
                    </div>
                  )}
                  {q.recommended_structure && (
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                      <span className="text-sm text-white/50">Estrutura Recomendada</span>
                      <span className="text-sm font-semibold text-sentinel">{q.recommended_structure}</span>
                    </div>
                  )}
                  {q.sector && (
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                      <span className="text-sm text-white/50">Setor</span>
                      <span className="text-sm text-white/80">{q.sector}</span>
                    </div>
                  )}
                  {q.coverage_limit && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-white/50">Limite de Cobertura</span>
                      <span className="text-sm font-semibold text-white">
                        {typeof q.coverage_limit === 'number'
                          ? `R$ ${q.coverage_limit.toLocaleString('pt-BR')}`
                          : q.coverage_limit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-white/25 text-center py-6">Nenhum evento registrado ainda.</p>
            ) : (
              <div>
                {timeline.map((event, i) => (
                  <TimelineItem key={i} event={event} isLast={i === timeline.length - 1} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: Documents + Messages */}
        <div className="space-y-6">
          {/* Documents */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Documentos
            </h2>
            {documents.length === 0 ? (
              <p className="text-sm text-white/25 text-center py-4">Nenhum documento disponivel.</p>
            ) : (
              <div>
                {documents.map((doc, i) => <DocumentItem key={i} doc={doc} />)}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Mensagens
            </h2>
            <MessagesSection messages={messages} onSend={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  )
}
