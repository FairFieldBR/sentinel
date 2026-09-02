import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const PIPELINE_STAGES = [
  { key: 'formulario_enviado', label: 'Formulário Enviado', color: '#3B82F6' },
  { key: 'analise_previa', label: 'Análise Prévia', color: '#06B6D4' },
  { key: 'enviado_seguradoras', label: 'Enviado às Seguradoras', color: '#8B5CF6' },
  { key: 'aguardando_propostas', label: 'Aguardando Propostas', color: '#F59E0B' },
  { key: 'propostas_recebidas', label: 'Propostas Recebidas', color: '#F97316' },
  { key: 'em_negociacao', label: 'Em Negociação', color: '#EC4899' },
  { key: 'apolice_emitida', label: 'Apólice Emitida', color: '#10B981' }
]

const DEFAULT_EMAIL_BODY = `Prezados,

Encaminhamos em anexo a ficha técnica para cotação de Seguro de Crédito da empresa {{empresa}}.

Empresa: {{empresa}}
CNPJ: {{cnpj}}
Modalidade: {{modalidade}}
Setor: {{setor}}

Solicitamos a gentileza de analisar e retornar com a proposta no menor prazo possível.

Atenciosamente,
Fairfield Corretora de Seguros`

const DEFAULT_EMAIL_SUBJECT = 'Cotação Seguro de Crédito — {{empresa}} ({{modalidade}})'

export default function AdminQuotationDetail() {
  const { id } = useParams()
  const { authFetch } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [seguradoras, setSeguradoras] = useState([])
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [selectedSlugs, setSelectedSlugs] = useState([])
  const [sending, setSending] = useState(false)
  const [proposalForm, setProposalForm] = useState({ seguradora_slug: '', valor_premio: '', taxa: '', cobertura_max: '', condicoes: '' })
  const [addingProposal, setAddingProposal] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  // Email editor state
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY)
  const [emailSubject, setEmailSubject] = useState(DEFAULT_EMAIL_SUBJECT)
  const [showEmailEditor, setShowEmailEditor] = useState(false)
  const [templates, setTemplates] = useState([])

  async function fetchData() {
    try {
      const [cotacao, segs, tmpl] = await Promise.all([
        authFetch(`/api/admin/cotacoes/${id}`),
        authFetch('/api/admin/seguradoras'),
        authFetch('/api/admin/email-templates').catch(() => ({ data: [] }))
      ])
      setData(cotacao.data)
      setSeguradoras(segs.data || [])
      setTemplates(tmpl.data || [])
    } catch {
      toast.error('Erro ao carregar cotacao')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  async function handleSendToInsurers() {
    if (selectedSlugs.length === 0) { toast.error('Selecione ao menos uma seguradora'); return }
    setSending(true)
    try {
      const result = await authFetch(`/api/admin/cotacoes/${id}/enviar-seguradoras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seguradora_slugs: selectedSlugs,
          corpo_email: emailBody !== DEFAULT_EMAIL_BODY ? emailBody : null,
          assunto_email: emailSubject !== DEFAULT_EMAIL_SUBJECT ? emailSubject : null
        })
      })
      const enviados = (result.data || []).filter(r => r.status === 'enviado').length
      const erros = (result.data || []).filter(r => r.status === 'erro').length
      if (enviados > 0) toast.success(`Enviado para ${enviados} seguradora(s)`)
      if (erros > 0) toast.error(`${erros} erro(s) no envio`)
      setSendModalOpen(false)
      setSelectedSlugs([])
      setShowEmailEditor(false)
      fetchData()
    } catch {
      toast.error('Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  function selectAllInsurers() {
    const activeSlugs = seguradoras.filter(s => s.ativo && ((s.contatos || []).some(c => c.ativo) || s.email)).map(s => s.slug)
    setSelectedSlugs(activeSlugs)
  }

  async function handleUpdateStatus(newStatus) {
    setStatusUpdating(true)
    try {
      await authFetch(`/api/admin/quotations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      toast.success('Status atualizado')
      fetchData()
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleAddProposal(e) {
    e.preventDefault()
    if (!proposalForm.seguradora_slug) { toast.error('Selecione a seguradora'); return }
    setAddingProposal(true)
    try {
      await authFetch(`/api/admin/cotacoes/${id}/propostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...proposalForm,
          valor_premio: proposalForm.valor_premio ? parseFloat(proposalForm.valor_premio) : null,
          taxa: proposalForm.taxa ? parseFloat(proposalForm.taxa) : null,
          cobertura_max: proposalForm.cobertura_max ? parseFloat(proposalForm.cobertura_max) : null
        })
      })
      toast.success('Proposta registrada')
      setProposalForm({ seguradora_slug: '', valor_premio: '', taxa: '', cobertura_max: '', condicoes: '' })
      fetchData()
    } catch {
      toast.error('Erro ao registrar proposta')
    } finally {
      setAddingProposal(false)
    }
  }

  async function markEmailResponded(emailId) {
    try {
      await authFetch(`/api/admin/email-log/${emailId}/respondido`, { method: 'PUT' })
      toast.success('Marcado como respondido')
      fetchData()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  if (!data) return <div className="text-center py-32 text-white/40">Cotação não encontrada</div>

  const currentStage = PIPELINE_STAGES.find(s => s.key === data.pipeline_status) || PIPELINE_STAGES[0]
  const currentStageIdx = PIPELINE_STAGES.findIndex(s => s.key === data.pipeline_status)

  const tabs = [
    { key: 'overview', label: 'Visão Geral' },
    { key: 'seguradoras', label: `Seguradoras (${(data.emailLogs || []).length})` },
    { key: 'propostas', label: `Propostas (${(data.propostas || []).length})` },
    { key: 'timeline', label: 'Timeline' },
    { key: 'mensagens', label: `Mensagens (${(data.messages || []).length})` }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Back link */}
      <Link to="/dashboard" className="text-xs text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar ao Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white">{data.razao_social || 'Empresa'}</h1>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              data.tipo === 'externo' ? 'bg-purple-500/15 text-purple-400' : 'bg-sentinel/10 text-sentinel'
            }`}>
              {data.tipo === 'externo' ? 'Exportação' : 'Interno'}
            </span>
          </div>
          <p className="text-xs text-white/30 font-mono mt-1">{data.cnpj || ''} · Cotação #{data.id}</p>
          {data.user_email && <p className="text-xs text-white/30 mt-0.5">Cliente: {data.user_name || data.user_email}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSendModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sentinel text-navy-dark hover:shadow-lg hover:shadow-sentinel/20 transition-all">
            Enviar para Seguradoras
          </button>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {PIPELINE_STAGES.map((stage, i) => {
            const isActive = i <= currentStageIdx
            const isCurrent = stage.key === data.pipeline_status
            return (
              <button key={stage.key}
                onClick={() => !statusUpdating && handleUpdateStatus(stage.key)}
                disabled={statusUpdating}
                className={`flex-1 min-w-0 py-2 px-1 text-center rounded-lg transition-all ${
                  isCurrent ? 'ring-2' : ''
                } ${isActive ? 'opacity-100' : 'opacity-30'}`}
                style={isCurrent ? { ringColor: stage.color, backgroundColor: `${stage.color}15` } : {}}>
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: isActive ? stage.color : 'rgba(255,255,255,0.1)' }} />
                <p className="text-[9px] font-semibold text-white/60 truncate">{stage.label}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* iCover Score */}
      {data.icover_score != null && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
          <div className={`text-3xl font-black ${data.icover_score >= 75 ? 'text-emerald-400' : data.icover_score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {data.icover_score}
          </div>
          <div>
            <p className="text-sm font-bold text-white">iCover Score</p>
            <p className="text-xs text-white/30">
              {data.icover_score >= 75 ? 'Risco baixo — perfil favoravel' : data.icover_score >= 50 ? 'Risco moderado' : 'Risco elevado — atencao'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              tab === t.key ? 'text-sentinel border-sentinel' : 'text-white/30 border-transparent hover:text-white/60'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab data={data} />}
      {tab === 'seguradoras' && <SeguradorasTab data={data} onSend={() => setSendModalOpen(true)} onMarkResponded={markEmailResponded} />}
      {tab === 'propostas' && <PropostasTab data={data} seguradoras={seguradoras} proposalForm={proposalForm} setProposalForm={setProposalForm} onSubmit={handleAddProposal} adding={addingProposal} />}
      {tab === 'timeline' && <TimelineTab data={data} />}
      {tab === 'mensagens' && <MensagensTab data={data} />}

      {/* Send to Insurers Modal — Enhanced */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-light border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-white mb-1">Enviar para Seguradoras</h3>
            <p className="text-xs text-white/30 mb-4">
              Enviar ficha técnica de <strong className="text-white/60">{data.razao_social}</strong> ({data.tipo === 'externo' ? 'Exportação' : 'Interno'})
            </p>

            {/* Select all / deselect */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Seguradoras</span>
              <div className="flex gap-2">
                <button onClick={selectAllInsurers}
                  className="text-[10px] font-semibold text-sentinel hover:text-sentinel/80 transition-colors">
                  Selecionar Todas
                </button>
                <button onClick={() => setSelectedSlugs([])}
                  className="text-[10px] font-semibold text-white/30 hover:text-white/50 transition-colors">
                  Limpar
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {seguradoras.filter(s => s.ativo).map(seg => {
                const contacts = (seg.contatos || []).filter(c => c.ativo)
                const hasEmail = contacts.length > 0 || !!seg.email
                const selected = selectedSlugs.includes(seg.slug)
                return (
                  <label key={seg.slug}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selected ? 'bg-sentinel/10 border-sentinel/25' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10'
                    } ${!hasEmail ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <input type="checkbox" disabled={!hasEmail} checked={selected}
                      onChange={() => {
                        if (!hasEmail) return
                        setSelectedSlugs(prev => selected ? prev.filter(s => s !== seg.slug) : [...prev, seg.slug])
                      }}
                      className="w-4 h-4 rounded border-white/20 text-sentinel focus:ring-sentinel/30" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{seg.nome}</span>
                        <span className="text-[9px] text-white/20">{contacts.length} contato{contacts.length !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-[10px] text-white/30 truncate">
                        {hasEmail
                          ? contacts.map(c => c.email).join(', ') || seg.email
                          : 'E-mail não cadastrado'}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Email Editor Toggle */}
            <div className="border-t border-white/[0.06] pt-4 mb-4">
              <button onClick={() => setShowEmailEditor(!showEmailEditor)}
                className="flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-white/60 transition-colors mb-3">
                <svg className={`w-4 h-4 transition-transform ${showEmailEditor ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Personalizar Email
              </button>

              {showEmailEditor && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Template selector */}
                  {templates.length > 0 && (
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Template</label>
                      <select
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sentinel/30"
                        onChange={e => {
                          const tmpl = templates.find(t => t.id === parseInt(e.target.value))
                          if (tmpl) { setEmailSubject(tmpl.assunto); setEmailBody(tmpl.corpo) }
                        }}>
                        <option value="">Selecionar template...</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Assunto</label>
                    <input
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
                      value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Corpo do e-mail</label>
                      <button onClick={() => { setEmailBody(DEFAULT_EMAIL_BODY); setEmailSubject(DEFAULT_EMAIL_SUBJECT) }}
                        className="text-[9px] text-white/20 hover:text-white/40 transition-colors">Restaurar padrão</button>
                    </div>
                    <textarea rows={10}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30 font-mono leading-relaxed resize-y"
                      value={emailBody} onChange={e => setEmailBody(e.target.value)} />
                    <p className="text-[9px] text-white/15 mt-1">
                      Variaveis: {'{{empresa}}'} {'{{cnpj}}'} {'{{modalidade}}'} {'{{setor}}'} {'{{seguradora}}'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setSendModalOpen(false); setSelectedSlugs([]); setShowEmailEditor(false) }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 border border-white/10 hover:border-white/20 transition-all">
                Cancelar
              </button>
              <button onClick={handleSendToInsurers} disabled={sending || selectedSlugs.length === 0}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-sentinel text-navy-dark hover:shadow-lg transition-all disabled:opacity-50">
                {sending ? 'Enviando...' : `Enviar para ${selectedSlugs.length} Cia${selectedSlugs.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Dados da Empresa</h3>
        <InfoRow label="Razão Social" value={data.razao_social} />
        <InfoRow label="CNPJ" value={data.cnpj} />
        <InfoRow label="Setor" value={data.setor} />
        <InfoRow label="UF" value={data.uf} />
        <InfoRow label="Contato" value={data.contato_nome} />
        <InfoRow label="E-mail" value={data.contato_email} />
        <InfoRow label="Telefone" value={data.contato_telefone} />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Condicoes de Venda</h3>
        {data.condicoesVenda ? (
          <>
            <InfoRow label="% a Vista" value={data.condicoesVenda.pct_vista} />
            <InfoRow label="% a Prazo" value={data.condicoesVenda.pct_prazo} />
            <InfoRow label="Prazo Médio" value={data.condicoesVenda.prazo_medio_dias ? `${data.condicoesVenda.prazo_medio_dias} dias` : null} />
            <InfoRow label="Prazo Máximo" value={data.condicoesVenda.prazo_maximo_dias ? `${data.condicoesVenda.prazo_maximo_dias} dias` : null} />
            <InfoRow label="Faturamento Desejado" value={data.condicoesVenda.faturamento_desejado_seguro} accent />
          </>
        ) : <p className="text-xs text-white/20">Nao informado</p>}

        {data.amostraCompradores && data.amostraCompradores.length > 0 && (
          <div className="pt-3 border-t border-white/[0.06]">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Compradores ({data.amostraCompradores.length})</h4>
            <div className="space-y-1">
              {data.amostraCompradores.slice(0, 5).map((c, i) => (
                <p key={i} className="text-xs text-white/50">{c.razao_social} {c.pais ? `(${c.pais})` : ''}</p>
              ))}
              {data.amostraCompradores.length > 5 && <p className="text-[10px] text-white/25">+{data.amostraCompradores.length - 5} mais</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Seguradoras Tab — Enhanced with tracking ─────────────────────────────────
function SeguradorasTab({ data, onSend, onMarkResponded }) {
  if ((data.emailLogs || []).length === 0) {
    return (
      <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
        <svg className="w-10 h-10 mx-auto text-white/10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-white/30 text-sm mb-2">Nenhum email enviado ainda</p>
        <button onClick={onSend}
          className="text-xs font-semibold text-sentinel hover:text-sentinel/80 transition-colors">
          Enviar para seguradoras
        </button>
      </div>
    )
  }

  const now = new Date()

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex gap-3">
        <MiniStat label="Enviados" value={data.emailLogs.length} color="text-blue-400" />
        <MiniStat label="Aguardando" value={data.emailLogs.filter(l => l.status === 'enviado').length} color="text-amber-400" />
        <MiniStat label="Respondidos" value={data.emailLogs.filter(l => l.status === 'respondido').length} color="text-emerald-400" />
        <MiniStat label="Erros" value={data.emailLogs.filter(l => l.status === 'erro').length} color="text-rose-400" />
      </div>

      {data.emailLogs.map(log => {
        const diasEspera = log.status === 'enviado' && log.enviado_em
          ? Math.floor((now - new Date(log.enviado_em)) / (1000 * 60 * 60 * 24))
          : null

        return (
          <div key={log.id} className={`bg-white/[0.03] border rounded-xl p-4 transition-all ${
            log.status === 'respondido' ? 'border-emerald-500/20' :
            log.status === 'erro' ? 'border-rose-500/20' :
            diasEspera && diasEspera > 5 ? 'border-rose-500/15 bg-rose-500/[0.02]' :
            diasEspera && diasEspera > 3 ? 'border-amber-500/15 bg-amber-500/[0.02]' :
            'border-white/[0.06]'
          }`}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    log.status === 'respondido' ? 'bg-emerald-400' :
                    log.status === 'erro' ? 'bg-rose-400' :
                    diasEspera && diasEspera > 5 ? 'bg-rose-400 animate-pulse' :
                    diasEspera && diasEspera > 3 ? 'bg-amber-400 animate-pulse' :
                    'bg-amber-400'
                  }`} />
                  <span className="text-sm font-semibold text-white">{log.seguradora_nome || log.seguradora_slug}</span>
                </div>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {log.destinatario} · Enviado em {new Date(log.enviado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  {log.respondido_em && ` · Respondido em ${new Date(log.respondido_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Days waiting badge */}
                {diasEspera !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    diasEspera > 5 ? 'bg-rose-500/15 text-rose-400' :
                    diasEspera > 3 ? 'bg-amber-500/15 text-amber-400' :
                    'bg-white/5 text-white/30'
                  }`}>
                    {diasEspera}d
                  </span>
                )}

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  log.status === 'respondido' ? 'bg-emerald-500/15 text-emerald-400'
                    : log.status === 'erro' ? 'bg-rose-500/15 text-rose-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {log.status === 'respondido' ? 'Respondido' : log.status === 'erro' ? 'Erro' : 'Aguardando'}
                </span>

                {log.status === 'enviado' && (
                  <button onClick={() => onMarkResponded(log.id)}
                    className="text-[10px] font-semibold text-white/30 hover:text-emerald-400 transition-colors">
                    Marcar respondido
                  </button>
                )}
              </div>
            </div>

            {log.erro && (
              <p className="text-[10px] text-rose-400/60 mt-2 bg-rose-500/5 rounded px-2 py-1">{log.erro}</p>
            )}
          </div>
        )
      })}

      <button onClick={onSend}
        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-xs font-semibold text-white/30 hover:text-sentinel hover:border-sentinel/30 transition-all">
        + Enviar para mais seguradoras
      </button>
    </div>
  )
}

// ─── Propostas Tab ───────────────────────────────────────────────────────────
function PropostasTab({ data, seguradoras, proposalForm, setProposalForm, onSubmit, adding }) {
  return (
    <div className="space-y-4">
      {(data.propostas || []).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
                <th className="text-left px-4 py-3">Seguradora</th>
                <th className="text-right px-4 py-3">Premio (R$)</th>
                <th className="text-right px-4 py-3">Taxa (%)</th>
                <th className="text-right px-4 py-3">Cobertura Max</th>
                <th className="text-left px-4 py-3">Condicoes</th>
                <th className="text-left px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {data.propostas.map(p => {
                const isBest = data.propostas.length > 1 && p.taxa != null &&
                  p.taxa === Math.min(...data.propostas.filter(x => x.taxa != null).map(x => x.taxa))
                return (
                  <tr key={p.id} className={isBest ? 'bg-emerald-500/5' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isBest && <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">MELHOR</span>}
                        <span className="text-sm font-semibold text-white">{p.seguradora_nome || p.seguradora_slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white/60 font-mono">
                      {p.valor_premio != null ? p.valor_premio.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white/60 font-mono">
                      {p.taxa != null ? `${p.taxa.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white/60 font-mono">
                      {p.cobertura_max != null ? p.cobertura_max.toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 max-w-[200px] truncate">{p.condicoes || '—'}</td>
                    <td className="px-4 py-3 text-xs text-white/30">
                      {p.recebida_em ? new Date(p.recebida_em).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Registrar Nova Proposta</h3>
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select value={proposalForm.seguradora_slug}
            onChange={e => setProposalForm(f => ({ ...f, seguradora_slug: e.target.value }))}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sentinel/30">
            <option value="">Seguradora</option>
            {seguradoras.filter(s => s.ativo).map(s => (
              <option key={s.slug} value={s.slug}>{s.nome}</option>
            ))}
          </select>
          <input type="number" step="0.01" placeholder="Premio (R$)"
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
            value={proposalForm.valor_premio} onChange={e => setProposalForm(f => ({ ...f, valor_premio: e.target.value }))} />
          <input type="number" step="0.001" placeholder="Taxa (%)"
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
            value={proposalForm.taxa} onChange={e => setProposalForm(f => ({ ...f, taxa: e.target.value }))} />
          <input type="number" step="0.01" placeholder="Cobertura Max"
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
            value={proposalForm.cobertura_max} onChange={e => setProposalForm(f => ({ ...f, cobertura_max: e.target.value }))} />
          <button type="submit" disabled={adding}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-sentinel text-navy-dark hover:shadow-lg transition-all disabled:opacity-50">
            {adding ? '...' : '+ Registrar'}
          </button>
        </form>
        <input placeholder="Condicoes especiais (opcional)"
          className="mt-2 w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
          value={proposalForm.condicoes} onChange={e => setProposalForm(f => ({ ...f, condicoes: e.target.value }))} />
      </div>
    </div>
  )
}

// ─── Timeline Tab ────────────────────────────────────────────────────────────
function TimelineTab({ data }) {
  if ((data.events || []).length === 0) {
    return <p className="text-center py-12 text-white/30 text-sm">Nenhum evento registrado</p>
  }

  return (
    <div className="relative pl-8 space-y-4">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-white/[0.08]" />
      {data.events.map(evt => {
        const stage = PIPELINE_STAGES.find(s => s.key === evt.status) || { color: '#666' }
        return (
          <div key={evt.id} className="relative">
            <div className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-navy"
              style={{ backgroundColor: stage.color }} />
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <p className="text-sm text-white/80">{evt.note || evt.status}</p>
              <p className="text-[10px] text-white/25 mt-1">
                {evt.created_by} · {new Date(evt.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Mensagens Tab ───────────────────────────────────────────────────────────
function MensagensTab({ data }) {
  if ((data.messages || []).length === 0) {
    return <p className="text-center py-12 text-white/30 text-sm">Nenhuma mensagem</p>
  }

  return (
    <div className="space-y-2">
      {data.messages.map(msg => (
        <div key={msg.id} className={`rounded-xl p-3 max-w-[80%] ${
          msg.sender_type === 'admin'
            ? 'bg-sentinel/10 border border-sentinel/20 ml-auto'
            : 'bg-white/[0.04] border border-white/[0.06]'
        }`}>
          <p className="text-xs font-semibold text-white/60 mb-1">{msg.sender_name || msg.sender_type}</p>
          <p className="text-sm text-white/80">{msg.message}</p>
          <p className="text-[10px] text-white/20 mt-1">
            {new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Utility Components ──────────────────────────────────────────────────────
function InfoRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/30">{label}</span>
      <span className={accent ? 'font-bold text-sentinel' : 'text-white/60'}>{value || '—'}</span>
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-white/25">{label}</p>
    </div>
  )
}
