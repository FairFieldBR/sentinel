import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE } from '../config'
import { useAuth } from '../contexts/AuthContext'

const EMPTY_FORM = {
  companyName: '',
  cnpj: '',
  territory: 'interno',
  annualRevenue: '',
  requestedCoverage: '',
  sector: 'Outro',
  insurer: '',
  lossRate: '',
  profitMargin: '',
  approvalRate: '',
  lucroReal: false,
}

const STATUS_LABELS = {
  calculated: 'Calculada',
  draft: 'Rascunho',
  sent: 'Enviada',
  accepted: 'Aceita',
  rejected: 'Recusada',
  expired: 'Expirada',
}

const STATUS_STYLES = {
  calculated: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
  draft: 'text-white/60 bg-white/5 border-white/10',
  sent: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  accepted: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  rejected: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
  expired: 'text-orange-300 bg-orange-400/10 border-orange-400/20',
}

function money(value, currency = 'BRL') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value))
}

function percent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${(Number(value) * 100).toFixed(2).replace('.', ',')}%`
}

function inputForQuote(input) {
  if (!input) return EMPTY_FORM
  return {
    ...EMPTY_FORM,
    ...input,
    sector: input.sectorText || input.sector || 'Outro',
    lossRate: input.lossRate === null || input.lossRate === undefined ? '' : String(input.lossRate * 100).replace('.', ','),
    profitMargin: input.profitMargin === null || input.profitMargin === undefined ? '' : String(input.profitMargin * 100).replace('.', ','),
    approvalRate: input.approvalRate === null || input.approvalRate === undefined ? '' : String(input.approvalRate * 100).replace('.', ','),
    insurer: input.insurer || '',
    lucroReal: Boolean(input.lucroReal),
  }
}

export default function QuickQuotes() {
  const { authFetch, accessToken } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [catalog, setCatalog] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [preview, setPreview] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  const result = selectedQuote?.result || preview
  const currency = result?.pricing?.currency || (form.territory === 'externo' ? 'USD' : 'BRL')
  const sectors = catalog?.sectors || []
  const insurerMinimums = catalog?.insurerMinimums || {}

  const visibleQuotes = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return quotes
    return quotes.filter(quote => [quote.companyName, quote.cnpj, quote.quoteNumber]
      .filter(Boolean).some(value => String(value).toLowerCase().includes(term)))
  }, [quotes, search])

  async function loadData() {
    setLoading(true)
    try {
      const [catalogResponse, quotesResponse] = await Promise.all([
        authFetch('/api/v1/quick-quotes/catalog'),
        authFetch('/api/v1/quick-quotes?limit=100'),
      ])
      if (!catalogResponse.sucesso) throw new Error(catalogResponse.mensagem || 'Erro ao carregar catálogo')
      if (!quotesResponse.sucesso) throw new Error(quotesResponse.mensagem || 'Erro ao carregar cotações')
      setCatalog(catalogResponse.data)
      setQuotes(quotesResponse.data || [])
    } catch (err) {
      toast.error(err.message || 'Erro ao carregar cotações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }))
    if (selectedQuote) {
      setSelectedQuote(null)
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setSelectedQuote(null)
    setPreview(null)
  }

  async function calculatePreview() {
    setCalculating(true)
    try {
      const response = await authFetch('/api/v1/quick-quotes/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.sucesso) throw new Error(response.mensagem || 'Não foi possível calcular a cotação')
      setPreview(response.data)
      setSelectedQuote(null)
    } catch (err) {
      toast.error(err.message || 'Erro ao calcular cotação')
    } finally {
      setCalculating(false)
    }
  }

  async function saveQuote() {
    setSaving(true)
    try {
      const response = await authFetch('/api/v1/quick-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.sucesso) throw new Error(response.mensagem || 'Não foi possível salvar a cotação')
      setQuotes(current => [response.data, ...current])
      setSelectedQuote(response.data)
      setPreview(null)
      toast.success(`Cotação ${response.data.quoteNumber} salva`)
      return response.data
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar cotação')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function exportProposal() {
    let quote = selectedQuote
    if (!quote) {
      quote = await saveQuote()
      if (!quote) return
    }

    setExporting(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/quick-quotes/${quote.id}/proposal.pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.mensagem || 'Não foi possível gerar o PDF')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `Fairfield_Proposta_${quote.quoteNumber || quote.id}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      toast.success('PDF gerado com sucesso')
    } catch (err) {
      toast.error(err.message || 'Erro ao exportar PDF')
    } finally {
      setExporting(false)
    }
  }

  async function updateStatus(status) {
    if (!selectedQuote) return
    try {
      const response = await authFetch(`/api/v1/quick-quotes/${selectedQuote.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.sucesso) throw new Error(response.mensagem || 'Não foi possível atualizar o status')
      const updated = { ...selectedQuote, status }
      setSelectedQuote(updated)
      setQuotes(current => current.map(item => item.id === updated.id ? updated : item))
      toast.success('Status atualizado')
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar status')
    }
  }

  function selectQuote(quote) {
    setSelectedQuote(quote)
    setPreview(null)
    setForm(inputForQuote(quote.input))
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-sentinel font-bold">
            <span className="w-2 h-2 rounded-full bg-sentinel shadow-[0_0_12px_rgba(56,189,248,.8)]" /> Motor Fairfield
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Cotações rápidas</h1>
          <p className="text-sm text-white/35 mt-1">Simule cenários, registre premissas e gere a próxima proposta.</p>
        </div>
        <button onClick={resetForm} className="self-start md:self-auto px-4 py-2.5 rounded-xl text-xs font-bold text-navy bg-sentinel hover:bg-sentinel-dark transition-all">
          + Nova cotação
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[330px_minmax(0,1fr)] gap-5">
        <aside className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden min-h-[620px]">
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Histórico</h2>
              <span className="text-[10px] text-white/25">{quotes.length} registros</span>
            </div>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar empresa ou número..."
              className="w-full rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 py-2.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-sentinel/50" />
          </div>
          <div className="divide-y divide-white/[0.05] max-h-[720px] overflow-y-auto">
            {loading ? <div className="p-6 text-center text-xs text-white/30">Carregando...</div> : null}
            {!loading && visibleQuotes.length === 0 ? <div className="p-6 text-center text-xs text-white/30">Nenhuma cotação salva.</div> : null}
            {visibleQuotes.map(quote => (
              <button key={quote.id} onClick={() => selectQuote(quote)} className={`w-full text-left p-4 hover:bg-white/[0.04] transition-colors ${selectedQuote?.id === quote.id ? 'bg-sentinel/[0.08] border-l-2 border-sentinel' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-white/85 truncate">{quote.companyName || 'Empresa sem nome'}</span>
                  <span className={`shrink-0 text-[9px] px-2 py-1 rounded-full border ${STATUS_STYLES[quote.status] || STATUS_STYLES.draft}`}>{STATUS_LABELS[quote.status] || quote.status}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 text-[10px] text-white/30">
                  <span>{quote.quoteNumber || `#${quote.id}`}</span>
                  <span>{quote.currency} · {money(quote.annualRevenue, quote.currency)}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-5">
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-sm font-bold text-white/80">Dados da simulação</h2>
                <p className="text-[11px] text-white/30 mt-1">Valores podem ser digitados no formato brasileiro.</p>
              </div>
              {selectedQuote && <div className="text-right"><p className="text-[10px] text-white/25">Cotação selecionada</p><p className="text-xs font-bold text-sentinel mt-1">{selectedQuote.quoteNumber}</p></div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <Field label="Empresa" value={form.companyName} onChange={value => updateField('companyName', value)} placeholder="Razão social" className="xl:col-span-2" />
              <Field label="CNPJ" value={form.cnpj} onChange={value => updateField('cnpj', value)} placeholder="00.000.000/0001-00" />
              <SelectField label="Modalidade" value={form.territory} onChange={value => updateField('territory', value)} options={[['interno', 'Mercado interno'], ['externo', 'Exportação']]} />
              <Field label={form.territory === 'externo' ? 'Faturamento anual (USD)' : 'Faturamento anual (R$)'} value={form.annualRevenue} onChange={value => updateField('annualRevenue', value)} placeholder="Ex.: 15.340.128" />
              <Field label="Cobertura solicitada" value={form.requestedCoverage} onChange={value => updateField('requestedCoverage', value)} placeholder="Ex.: 3.000.000" />
              <SelectField label="Setor" value={form.sector} onChange={value => updateField('sector', value)} options={sectors.map(sector => [sector.name, `${sector.name} · ${sector.risk}`])} />
              <SelectField label="Seguradora (opcional)" value={form.insurer} onChange={value => updateField('insurer', value)} options={[['', 'Sem seguradora específica'], ...Object.keys(insurerMinimums).map(slug => [slug.replace('-', ' '), `${slug.replace('-', ' ')} · mínimo ${money(insurerMinimums[slug], 'USD')}`])]} />
              <Field label="Sinistralidade (%)" value={form.lossRate} onChange={value => updateField('lossRate', value)} placeholder="Vazio = sem ajuste" />
              <Field label="Margem líquida (%)" value={form.profitMargin} onChange={value => updateField('profitMargin', value)} placeholder="Vazio = 15%" />
              <Field label="Aprovação da carteira (%)" value={form.approvalRate} onChange={value => updateField('approvalRate', value)} placeholder="Vazio = 50%" />
              <label className="flex items-center gap-3 self-end h-[62px] rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 cursor-pointer">
                <input type="checkbox" checked={form.lucroReal} onChange={event => updateField('lucroReal', event.target.checked)} className="accent-cyan-400 w-4 h-4" />
                <span><span className="block text-xs font-semibold text-white/70">Lucro Real</span><span className="block text-[10px] text-white/25 mt-0.5">Calcula economia fiscal de 34%</span></span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-white/[0.06]">
              <button onClick={calculatePreview} disabled={calculating || loading} className="px-5 py-2.5 rounded-xl text-xs font-bold text-navy bg-sentinel hover:bg-sentinel-dark disabled:opacity-50 transition-all">
                {calculating ? 'Calculando...' : 'Calcular prévia'}
              </button>
              <button onClick={saveQuote} disabled={saving || calculating || loading} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white border border-white/15 hover:border-sentinel/40 hover:text-sentinel disabled:opacity-50 transition-all">
                {saving ? 'Salvando...' : selectedQuote ? 'Salvar nova versão' : 'Salvar cotação'}
              </button>
              {selectedQuote && <select value={selectedQuote.status} onChange={event => updateStatus(event.target.value)} className="ml-auto rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2.5 text-xs text-white/70 outline-none">
                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value} className="bg-navy">{label}</option>)}
              </select>}
            </div>
          </section>

          {result ? <QuoteResult result={result} currency={currency} onExport={exportProposal} exporting={exporting} /> : (
            <section className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center bg-white/[0.015]">
              <div className="w-12 h-12 rounded-2xl bg-sentinel/10 border border-sentinel/20 flex items-center justify-center mx-auto text-sentinel text-xl">↗</div>
              <h2 className="text-sm font-bold text-white/70 mt-4">A simulação aparecerá aqui</h2>
              <p className="text-xs text-white/30 mt-2 max-w-md mx-auto">Preencha faturamento, cobertura e setor para calcular os cenários Fairfield.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, className = '' }) {
  return <label className={`block ${className}`}><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">{label}</span><input value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-sentinel/50 transition-colors" /></label>
}

function SelectField({ label, value, onChange, options }) {
  return <label className="block"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">{label}</span><select value={value ?? ''} onChange={event => onChange(event.target.value)} className="w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-sentinel/50 transition-colors"><option value="" className="bg-navy">Selecione</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue} className="bg-navy">{optionLabel}</option>)}</select></label>
}

function QuoteResult({ result, currency, onExport, exporting }) {
  const scenarioA = result.scenarios?.[0]
  const benefits = result.benefits
  return <div className="space-y-5">
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Metric label="Setor identificado" value={result.risk?.sector || '—'} detail={`${result.risk?.riskLevel || '—'} · confiança ${Math.round((result.risk?.confidence || 0) * 100)}%`} />
      <Metric label="Taxa de referência A" value={`${percent(scenarioA?.rateLow)} a ${percent(scenarioA?.rateHigh)}`} detail={`Base: ${percent(scenarioA?.baseRate)}`} />
      <Metric label="Ganho financeiro estimado" value={`${money(benefits?.estimatedGain?.low, currency)} a ${money(benefits?.estimatedGain?.high, currency)}`} detail="Lucro + recuperação + economia fiscal" />
    </section>

    {(result.warnings?.length > 0) && <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4"><h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Atenção antes de enviar</h3><ul className="mt-2 space-y-1">{result.warnings.map((warning, index) => <li key={index} className="text-xs text-amber-100/65 flex gap-2"><span>•</span>{warning}</li>)}</ul></section>}

    <section>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3">
        <div><h2 className="text-sm font-bold uppercase tracking-wider text-white/65">Cenários de cobertura</h2><p className="text-[11px] text-white/25 mt-1">IOF {percent(result.pricing?.iofRate)} · valores finais já incluem o imposto</p></div>
        <div className="flex items-center gap-3"><span className="text-[10px] text-white/25">{result.rulesVersion}</span><button onClick={onExport} disabled={exporting} className="px-4 py-2 rounded-xl text-[11px] font-bold text-navy bg-white hover:bg-sentinel disabled:opacity-50 transition-all">{exporting ? 'Gerando PDF...' : 'Exportar PDF'}</button></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">{(result.scenarios || []).map(scenario => <ScenarioCard key={scenario.code} scenario={scenario} currency={currency} />)}</div>
    </section>

    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Benefícios projetados</h2><div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4"><Benefit label="Expansão" value={money(benefits?.expansion, currency)} /><Benefit label="Lucro adicional" value={money(benefits?.additionalProfit, currency)} /><Benefit label="Inadimplência recuperada" value={money(benefits?.recoveredDefault, currency)} /><Benefit label="Economia fiscal" value={benefits?.taxEconomy?.applicable ? `${money(benefits.taxEconomy.low, currency)} a ${money(benefits.taxEconomy.high, currency)}` : 'Não aplicável'} /><Benefit label="Aprovação usada" value={percent(benefits?.approvalRate)} /></div></section>

    <section className="rounded-2xl border border-white/[0.06] bg-black/10 p-4"><h2 className="text-[10px] font-bold uppercase tracking-wider text-white/35">Premissas registradas</h2><div className="flex flex-wrap gap-2 mt-3">{(result.assumptions || []).map((assumption, index) => <span key={index} className="text-[10px] text-white/45 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1.5">{assumption}</span>)}</div></section>
  </div>
}

function Metric({ label, value, detail }) {
  return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">{label}</p><p className="text-lg font-black text-white mt-2 truncate">{value}</p><p className="text-[10px] text-white/30 mt-1 truncate">{detail}</p></div>
}

function ScenarioCard({ scenario, currency }) {
  return <div className={`rounded-2xl border p-4 ${scenario.recommended ? 'border-sentinel/60 bg-sentinel/[0.07] shadow-lg shadow-sentinel/5' : 'border-white/[0.07] bg-white/[0.025]'}`}><div className="flex items-start justify-between"><div><span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-black ${scenario.recommended ? 'bg-sentinel text-navy' : 'bg-white/10 text-white/70'}`}>{scenario.code}</span><h3 className="text-sm font-black text-white mt-3">{scenario.name}</h3><p className="text-[10px] text-white/35 mt-1">{scenario.description}</p></div>{scenario.recommended && <span className="text-[9px] uppercase tracking-wider font-bold text-sentinel border border-sentinel/30 rounded-full px-2 py-1">Recomendado</span>}</div><p className="text-2xl font-black text-white mt-5">{money(scenario.insuredRevenue, currency)}</p><p className="text-[10px] uppercase tracking-wider text-white/25 mt-1">faturamento segurável</p><div className="mt-5 pt-4 border-t border-white/[0.07] space-y-3"><Row label="Taxa média" value={`${percent(scenario.rateLow)} a ${percent(scenario.rateHigh)}`} /><Row label="Custo s/ IOF" value={`${money(scenario.costLow, currency)} a ${money(scenario.costHigh, currency)}`} /><Row label="Valor final c/ IOF" value={`${money(scenario.finalValueLow, currency)} a ${money(scenario.finalValueHigh, currency)}`} highlight /><Row label="4× trimestrais" value={`${money(scenario.quarterlyInstallmentLow, currency)} a ${money(scenario.quarterlyInstallmentHigh, currency)}`} /><Row label="12× mensais" value={`${money(scenario.monthlyInstallmentLow, currency)} a ${money(scenario.monthlyInstallmentHigh, currency)}`} highlight /></div></div>
}

function Row({ label, value, highlight }) {
  return <div className="flex items-start justify-between gap-3"><span className="text-[10px] text-white/35">{label}</span><span className={`text-right text-xs font-bold ${highlight ? 'text-sentinel' : 'text-white/75'}`}>{value}</span></div>
}

function Benefit({ label, value }) {
  return <div><p className="text-[10px] text-white/30 leading-tight">{label}</p><p className="text-sm font-bold text-white/80 mt-1">{value}</p></div>
}
