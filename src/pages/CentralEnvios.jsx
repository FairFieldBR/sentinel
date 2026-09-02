import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const INSURER_LOGOS = {
  aig: '/logos/aig.png',
  avla: '/logos/avla.png',
  'allianz-trade': '/logos/allianz-trade.png',
  atradius: '/logos/atradius.png',
  cesce: '/logos/cesce.png',
  coface: '/logos/coface.png',
}

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

export default function CentralEnvios() {
  const { authFetch } = useAuth()
  const [loading, setLoading] = useState(true)
  const [cotacoes, setCotacoes] = useState([])
  const [seguradoras, setSeguradoras] = useState([])
  const [templates, setTemplates] = useState([])

  // Selection state
  const [selectedCotacoes, setSelectedCotacoes] = useState([])
  const [selectedSeguradoras, setSelectedSeguradoras] = useState([])

  // View state
  const [view, setView] = useState('envio') // envio | monitor | comparativo
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')

  // Email editor
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY)
  const [emailSubject, setEmailSubject] = useState(DEFAULT_EMAIL_SUBJECT)
  const [showEmailEditor, setShowEmailEditor] = useState(false)

  // Send state
  const [sending, setSending] = useState(false)

  // Comparativo state
  const [comparativoId, setComparativoId] = useState(null)
  const [comparativoData, setComparativoData] = useState(null)
  const [loadingComparativo, setLoadingComparativo] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [cot, seg, tmpl] = await Promise.all([
        authFetch('/api/admin/central-envios'),
        authFetch('/api/admin/seguradoras'),
        authFetch('/api/admin/email-templates').catch(() => ({ data: [] }))
      ])
      setCotacoes(cot.data || [])
      setSeguradoras((seg.data || []).filter(s => s.ativo))
      setTemplates(tmpl.data || [])
    } catch {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnviarLote() {
    if (selectedCotacoes.length === 0) { toast.error('Selecione ao menos uma cotação'); return }
    if (selectedSeguradoras.length === 0) { toast.error('Selecione ao menos uma seguradora'); return }
    setSending(true)
    try {
      const result = await authFetch('/api/admin/central-envios/enviar-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cotacao_ids: selectedCotacoes,
          seguradora_slugs: selectedSeguradoras,
          corpo_email: emailBody !== DEFAULT_EMAIL_BODY ? emailBody : null,
          assunto_email: emailSubject !== DEFAULT_EMAIL_SUBJECT ? emailSubject : null
        })
      })
      const r = result.resumo || {}
      if (r.enviados > 0) toast.success(`${r.enviados} email(s) enviado(s) com sucesso`)
      if (r.jaEnviados > 0) toast(`${r.jaEnviados} já enviado(s) anteriormente`, { icon: 'ℹ️' })
      if (r.erros > 0) toast.error(`${r.erros} erro(s) no envio`)
      setSelectedCotacoes([])
      setSelectedSeguradoras([])
      fetchData()
    } catch {
      toast.error('Erro ao enviar lote')
    } finally {
      setSending(false)
    }
  }

  async function loadComparativo(cotacaoId) {
    setComparativoId(cotacaoId)
    setLoadingComparativo(true)
    try {
      const result = await authFetch(`/api/admin/cotacoes/${cotacaoId}/comparativo`)
      setComparativoData(result.data)
    } catch {
      toast.error('Erro ao carregar comparativo')
    } finally {
      setLoadingComparativo(false)
    }
  }

  // Filtered cotacoes
  const filtered = cotacoes.filter(c => {
    if (tipoFilter !== 'todos' && c.tipo !== tipoFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (c.razao_social || '').toLowerCase().includes(s) || (c.cnpj || '').includes(s)
    }
    return true
  })

  // Cotacoes with proposals for comparativo
  const comPropostas = cotacoes.filter(c => c.totalPropostas > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Central de Envios</h1>
          <p className="text-xs text-white/30 mt-1">Envio em lote, monitoramento de respostas e comparativo inteligente</p>
        </div>
        <Link to="/dashboard" className="text-xs text-white/30 hover:text-white/60 transition-colors">
          Voltar ao Dashboard
        </Link>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
        {[
          { key: 'envio', label: 'Envio em Lote', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { key: 'monitor', label: 'Monitor de Respostas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
          { key: 'comparativo', label: 'Comparativo iCover', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              view === t.key ? 'bg-sentinel/15 text-sentinel border border-sentinel/25' : 'text-white/30 hover:text-white/50'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
            </svg>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* View Content */}
      {view === 'envio' && (
        <EnvioLoteView
          cotacoes={filtered}
          seguradoras={seguradoras}
          templates={templates}
          selectedCotacoes={selectedCotacoes}
          setSelectedCotacoes={setSelectedCotacoes}
          selectedSeguradoras={selectedSeguradoras}
          setSelectedSeguradoras={setSelectedSeguradoras}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          tipoFilter={tipoFilter}
          setTipoFilter={setTipoFilter}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          showEmailEditor={showEmailEditor}
          setShowEmailEditor={setShowEmailEditor}
          sending={sending}
          onEnviar={handleEnviarLote}
        />
      )}

      {view === 'monitor' && (
        <MonitorView cotacoes={cotacoes} authFetch={authFetch} onRefresh={fetchData} />
      )}

      {view === 'comparativo' && (
        <ComparativoView
          cotacoes={comPropostas}
          comparativoId={comparativoId}
          comparativoData={comparativoData}
          loading={loadingComparativo}
          onSelect={loadComparativo}
        />
      )}
    </div>
  )
}

// ─── ENVIO EM LOTE ──────────────────────────────────────────────────────────

function EnvioLoteView({
  cotacoes, seguradoras, templates,
  selectedCotacoes, setSelectedCotacoes,
  selectedSeguradoras, setSelectedSeguradoras,
  searchTerm, setSearchTerm,
  tipoFilter, setTipoFilter,
  emailBody, setEmailBody,
  emailSubject, setEmailSubject,
  showEmailEditor, setShowEmailEditor,
  sending, onEnviar
}) {
  const toggleCotacao = (id) => setSelectedCotacoes(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )
  const toggleSeguradora = (slug) => setSelectedSeguradoras(prev =>
    prev.includes(slug) ? prev.filter(x => x !== slug) : [...prev, slug]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Cotações selection */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">1. Selecionar Cotações</h3>
            <div className="flex gap-2">
              <button onClick={() => setSelectedCotacoes(cotacoes.map(c => c.id))}
                className="text-[10px] font-semibold text-sentinel hover:text-sentinel/80">Todas</button>
              <button onClick={() => setSelectedCotacoes([])}
                className="text-[10px] font-semibold text-white/30 hover:text-white/50">Limpar</button>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2 mb-3">
            <input placeholder="Buscar empresa ou CNPJ..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30" />
            <div className="flex gap-1">
              {['todos', 'interno', 'externo'].map(t => (
                <button key={t} onClick={() => setTipoFilter(t)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                    tipoFilter === t ? 'bg-sentinel/15 text-sentinel' : 'text-white/30 hover:text-white/50'
                  }`}>
                  {t === 'todos' ? 'Todos' : t === 'interno' ? 'Int' : 'Exp'}
                </button>
              ))}
            </div>
          </div>

          {/* Cotações list */}
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
            {cotacoes.map(c => {
              const selected = selectedCotacoes.includes(c.id)
              return (
                <label key={c.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selected ? 'bg-sentinel/10 border-sentinel/25' : 'bg-white/[0.02] border-white/[0.04] hover:border-white/10'
                  }`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleCotacao(c.id)}
                    className="w-4 h-4 rounded border-white/20 text-sentinel focus:ring-sentinel/30" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{c.razao_social}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        c.tipo === 'externo' ? 'bg-purple-500/15 text-purple-400' : 'bg-sentinel/10 text-sentinel'
                      }`}>{c.tipo === 'externo' ? 'EXP' : 'INT'}</span>
                      {c.icover_score != null && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          c.icover_score >= 75 ? 'bg-emerald-500/15 text-emerald-400' :
                          c.icover_score >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>iC {c.icover_score}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/25 mt-0.5">
                      {c.cnpj} · {c.totalEnviados > 0 ? `${c.totalEnviados} enviados` : 'Não enviado'} · {c.totalPropostas} proposta{c.totalPropostas !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Status indicators */}
                  <div className="flex gap-1">
                    {c.emailLogs?.slice(0, 6).map((log, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${
                        log.status === 'respondido' ? 'bg-emerald-400' : log.status === 'erro' ? 'bg-rose-400' : 'bg-amber-400'
                      }`} title={`${log.seguradora_nome}: ${log.status}`} />
                    ))}
                  </div>
                </label>
              )
            })}
          </div>
          <p className="text-[10px] text-white/20 mt-2">{selectedCotacoes.length} de {cotacoes.length} selecionada(s)</p>
        </div>
      </div>

      {/* Right: Seguradoras + Email + Send */}
      <div className="space-y-4">
        {/* Seguradoras selection */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">2. Seguradoras</h3>
            <div className="flex gap-2">
              <button onClick={() => setSelectedSeguradoras(seguradoras.filter(s => (s.contatos || []).some(c => c.ativo) || s.email).map(s => s.slug))}
                className="text-[10px] font-semibold text-sentinel hover:text-sentinel/80">Todas</button>
              <button onClick={() => setSelectedSeguradoras([])}
                className="text-[10px] font-semibold text-white/30 hover:text-white/50">Limpar</button>
            </div>
          </div>

          <div className="space-y-2">
            {seguradoras.map(seg => {
              const contacts = (seg.contatos || []).filter(c => c.ativo)
              const hasEmail = contacts.length > 0 || !!seg.email
              const selected = selectedSeguradoras.includes(seg.slug)
              return (
                <label key={seg.slug}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selected ? 'bg-sentinel/10 border-sentinel/25' : 'bg-white/[0.02] border-white/[0.04] hover:border-white/10'
                  } ${!hasEmail ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <input type="checkbox" disabled={!hasEmail} checked={selected}
                    onChange={() => hasEmail && toggleSeguradora(seg.slug)}
                    className="w-4 h-4 rounded border-white/20 text-sentinel focus:ring-sentinel/30" />
                  <img src={INSURER_LOGOS[seg.slug]} alt={seg.nome} className="h-6 w-auto object-contain max-w-[80px]"
                    onError={e => { e.target.style.display = 'none' }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-white/25">{contacts.length} contato{contacts.length !== 1 ? 's' : ''}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Email Editor */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <button onClick={() => setShowEmailEditor(!showEmailEditor)}
            className="flex items-center gap-2 text-sm font-bold text-white w-full">
            <svg className={`w-4 h-4 transition-transform text-white/40 ${showEmailEditor ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            3. Email
            <span className="text-[9px] text-white/20 font-normal ml-auto">{showEmailEditor ? 'fechar' : 'personalizar'}</span>
          </button>

          {showEmailEditor && (
            <div className="space-y-3 mt-4 animate-fadeIn">
              {templates.length > 0 && (
                <select className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sentinel/30"
                  onChange={e => {
                    const tmpl = templates.find(t => t.id === parseInt(e.target.value))
                    if (tmpl) { setEmailSubject(tmpl.assunto); setEmailBody(tmpl.corpo) }
                  }}>
                  <option value="">Template...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              )}
              <input className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
                placeholder="Assunto" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
              <textarea rows={8}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30 font-mono leading-relaxed resize-y"
                value={emailBody} onChange={e => setEmailBody(e.target.value)} />
              <p className="text-[9px] text-white/15">
                Variáveis: {'{{empresa}}'} {'{{cnpj}}'} {'{{modalidade}}'} {'{{setor}}'} {'{{seguradora}}'}
              </p>
            </div>
          )}
        </div>

        {/* Send button */}
        <button onClick={onEnviar} disabled={sending || selectedCotacoes.length === 0 || selectedSeguradoras.length === 0}
          className="w-full py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-sentinel-dark to-sentinel text-navy-dark hover:shadow-lg hover:shadow-sentinel/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-navy-dark/30 border-t-navy-dark animate-spin" />
              Enviando...
            </span>
          ) : (
            `Enviar ${selectedCotacoes.length} cotação(ões) para ${selectedSeguradoras.length} Cia(s)`
          )}
        </button>
      </div>
    </div>
  )
}

// ─── MONITOR DE RESPOSTAS ───────────────────────────────────────────────────

function MonitorView({ cotacoes, authFetch, onRefresh }) {
  const now = new Date()

  // Only cotacoes that had emails sent
  const comEnvios = cotacoes.filter(c => c.totalEnviados > 0)

  async function markResponded(emailLogId) {
    try {
      await authFetch(`/api/admin/email-log/${emailLogId}/respondido`, { method: 'PUT' })
      toast.success('Marcado como respondido')
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  if (comEnvios.length === 0) {
    return (
      <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
        <svg className="w-12 h-12 mx-auto text-white/10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-white/30 text-sm">Nenhum envio realizado ainda</p>
        <p className="text-white/15 text-xs mt-1">Use a aba "Envio em Lote" para começar</p>
      </div>
    )
  }

  // Global stats
  const totalEnviados = comEnvios.reduce((a, c) => a + c.totalEnviados, 0)
  const totalRespondidos = comEnvios.reduce((a, c) => a + c.totalRespondidos, 0)
  const totalAguardando = totalEnviados - totalRespondidos
  const totalPropostas = comEnvios.reduce((a, c) => a + c.totalPropostas, 0)

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Emails Enviados" value={totalEnviados} color="text-blue-400" />
        <StatCard label="Aguardando" value={totalAguardando} color="text-amber-400" />
        <StatCard label="Respondidos" value={totalRespondidos} color="text-emerald-400" />
        <StatCard label="Propostas" value={totalPropostas} color="text-sentinel" />
      </div>

      {/* Per-cotacao tracking */}
      <div className="space-y-3">
        {comEnvios.map(c => (
          <div key={c.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link to={`/admin/cotacoes/${c.id}`} className="text-sm font-bold text-white hover:text-sentinel transition-colors">
                  {c.razao_social}
                </Link>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  c.tipo === 'externo' ? 'bg-purple-500/15 text-purple-400' : 'bg-sentinel/10 text-sentinel'
                }`}>{c.tipo === 'externo' ? 'EXP' : 'INT'}</span>
              </div>
              <span className="text-[10px] text-white/20 font-mono">{c.cnpj}</span>
            </div>

            {/* Insurer response grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {c.emailLogs.map((log, i) => {
                const dias = log.status === 'enviado' && log.enviado_em
                  ? Math.floor((now - new Date(log.enviado_em)) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <div key={i} className={`rounded-xl p-2.5 border text-center transition-all ${
                    log.status === 'respondido' ? 'border-emerald-500/30 bg-emerald-500/5' :
                    log.status === 'erro' ? 'border-rose-500/30 bg-rose-500/5' :
                    dias && dias > 5 ? 'border-rose-500/20 bg-rose-500/[0.03]' :
                    dias && dias > 3 ? 'border-amber-500/20 bg-amber-500/[0.03]' :
                    'border-white/[0.06] bg-white/[0.02]'
                  }`}>
                    {/* Check mark for responded */}
                    {log.status === 'respondido' ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-1">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : log.status === 'erro' ? (
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-1">
                        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                        dias > 5 ? 'bg-rose-500/20' : dias > 3 ? 'bg-amber-500/20' : 'bg-white/5'
                      }`}>
                        <span className={`text-[9px] font-bold ${
                          dias > 5 ? 'text-rose-400' : dias > 3 ? 'text-amber-400' : 'text-white/30'
                        }`}>{dias}d</span>
                      </div>
                    )}

                    <p className="text-[10px] font-semibold text-white/70 truncate">{log.seguradora_nome || log.seguradora_slug}</p>

                    {log.status === 'enviado' && (
                      <button onClick={() => markResponded(log.id)}
                        className="mt-1 text-[8px] font-semibold text-emerald-400/50 hover:text-emerald-400 transition-colors">
                        Respondeu
                      </button>
                    )}

                    {/* Check if has proposal */}
                    {c.propostas.some(p => p.seguradora_slug === log.seguradora_slug) && (
                      <div className="mt-1 text-[8px] font-bold text-sentinel">PROPOSTA</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── COMPARATIVO INTELIGENTE ────────────────────────────────────────────────

function ComparativoView({ cotacoes, comparativoId, comparativoData, loading, onSelect }) {
  if (cotacoes.length === 0) {
    return (
      <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
        <svg className="w-12 h-12 mx-auto text-white/10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-white/30 text-sm">Nenhuma proposta recebida ainda</p>
        <p className="text-white/15 text-xs mt-1">Quando as seguradoras responderem, o comparativo aparecerá aqui</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Cotação selector */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-white mb-3">Selecionar Cotação</h3>
        {cotacoes.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              comparativoId === c.id ? 'bg-sentinel/10 border-sentinel/25' : 'bg-white/[0.02] border-white/[0.04] hover:border-white/10'
            }`}>
            <p className="text-sm font-semibold text-white">{c.razao_social}</p>
            <p className="text-[10px] text-white/25 mt-0.5">
              {c.totalPropostas} proposta{c.totalPropostas !== 1 ? 's' : ''} recebida{c.totalPropostas !== 1 ? 's' : ''}
            </p>
          </button>
        ))}
      </div>

      {/* Right: Comparativo result */}
      <div className="lg:col-span-2">
        {!comparativoId && (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            <p className="text-white/30 text-sm">Selecione uma cotação para ver o comparativo</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
          </div>
        )}

        {comparativoData && !loading && (
          <div className="space-y-4">
            {/* Recommendation banner */}
            {comparativoData.recomendacao && (
              <div className="bg-gradient-to-r from-sentinel/10 to-emerald-500/10 border border-sentinel/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sentinel/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sentinel mb-1">Recomendação iCover</p>
                    <p className="text-sm text-white/70">{comparativoData.recomendacao}</p>
                  </div>
                </div>
              </div>
            )}

            {/* iCover reference */}
            {comparativoData.icoverRef && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Referência iCover</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniRef label="Score" value={comparativoData.icoverRef.score} />
                  <MiniRef label="Classificação" value={comparativoData.icoverRef.riskLabel} />
                  <MiniRef label="Taxa Estimada" value={comparativoData.icoverRef.taxaEstimada} />
                  <MiniRef label="Prêmio Estimado" value={comparativoData.icoverRef.premioEstimado} />
                </div>
              </div>
            )}

            {/* Proposals ranking */}
            <div className="space-y-3">
              {comparativoData.propostas.map((p, i) => (
                <div key={p.id} className={`bg-white/[0.03] border rounded-2xl p-4 transition-all ${
                  i === 0 ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : 'border-white/[0.06]'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                        i === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                        i === 1 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {p.ranking}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white">{p.seguradora_nome || p.seguradora_slug}</span>
                        {i === 0 && <span className="ml-2 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">MELHOR CUSTO-BENEFÍCIO</span>}
                      </div>
                    </div>
                    <div className={`text-2xl font-black ${
                      i === 0 ? 'text-emerald-400' : i === 1 ? 'text-blue-400' : 'text-white/40'
                    }`}>
                      {p.score}<span className="text-xs font-normal text-white/20">/100</span>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-white/[0.03] rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-white/30">Taxa</p>
                      <p className="text-sm font-bold text-white">{p.taxa != null ? `${p.taxa.toFixed(3)}%` : '—'}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-white/30">Prêmio</p>
                      <p className="text-sm font-bold text-white">
                        {p.valor_premio != null ? `R$ ${(p.valor_premio / 1000).toFixed(0)}k` : '—'}
                      </p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-white/30">Cobertura</p>
                      <p className="text-sm font-bold text-white">
                        {p.cobertura_max != null ? `R$ ${(p.cobertura_max / 1000000).toFixed(1)}M` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="space-y-1">
                    {p.fatores.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2 text-[10px]">
                        <span className="text-white/25 w-24">{f.fator} ({f.peso})</span>
                        <div className="flex-1 bg-white/5 rounded-full h-1.5">
                          <div className="h-full rounded-full bg-sentinel/50" style={{ width: `${Math.min(f.pontos * 2.5, 100)}%` }} />
                        </div>
                        <span className="text-white/40 w-8 text-right">+{f.pontos}</span>
                        <span className="text-white/20 w-32 truncate">{f.detalhe}</span>
                      </div>
                    ))}
                  </div>

                  {/* iCover fit */}
                  {p.icoverFit && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <p className="text-[10px] text-sentinel font-semibold mb-1">iCover: Aderência {p.icoverFit.score}%</p>
                      <p className="text-[10px] text-white/25">{p.icoverFit.strengths?.join(' · ')}</p>
                    </div>
                  )}

                  {/* Condições */}
                  {p.condicoes && (
                    <p className="text-[10px] text-white/30 mt-2 italic">Condições: {p.condicoes}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Stats summary */}
            {comparativoData.estatisticas && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Estatísticas do Mercado</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <MiniRef label="Menor Taxa" value={comparativoData.estatisticas.menorTaxa != null ? `${comparativoData.estatisticas.menorTaxa.toFixed(3)}%` : '—'} />
                  <MiniRef label="Maior Taxa" value={comparativoData.estatisticas.maiorTaxa != null ? `${comparativoData.estatisticas.maiorTaxa.toFixed(3)}%` : '—'} />
                  <MiniRef label="Média" value={comparativoData.estatisticas.mediaTaxa != null ? `${comparativoData.estatisticas.mediaTaxa.toFixed(3)}%` : '—'} />
                  <MiniRef label="Menor Prêmio" value={comparativoData.estatisticas.menorPremio != null ? `R$ ${(comparativoData.estatisticas.menorPremio / 1000).toFixed(0)}k` : '—'} />
                  <MiniRef label="Propostas" value={comparativoData.estatisticas.totalPropostas} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Utility Components ─────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-[10px] text-white/25">{label}</p>
    </div>
  )
}

function MiniRef({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-white/25">{label}</p>
      <p className="text-sm font-bold text-white">{value || '—'}</p>
    </div>
  )
}
