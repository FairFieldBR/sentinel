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

function money(value, currency = 'BRL') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value))
}

function formatCnpj(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 14)
  return digits.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export default function ClientQuickQuotes() {
  const { authFetch, accessToken } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [catalog, setCatalog] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const scenarios = preview?.scenarios || []
  const selectedScenario = scenarios.find(item => item.recommended) || scenarios[1] || scenarios[0]
  const sectors = useMemo(() => catalog?.sectors || [], [catalog])

  useEffect(() => {
    async function load() {
      try {
        const [catalogResponse, quotesResponse] = await Promise.all([
          authFetch('/api/v1/quick-quotes/catalog'),
          authFetch('/api/v1/quick-quotes?limit=20'),
        ])
        if (!catalogResponse.sucesso) throw new Error(catalogResponse.mensagem || 'Não foi possível carregar a cotação rápida')
        if (!quotesResponse.sucesso) throw new Error(quotesResponse.mensagem || 'Não foi possível carregar seu histórico')
        setCatalog(catalogResponse.data)
        setQuotes(quotesResponse.data || [])
      } catch (error) {
        toast.error(error.message || 'Erro ao carregar cotação rápida')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authFetch])

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }))
    setPreview(null)
    setSelectedQuote(null)
  }

  async function calculate() {
    setCalculating(true)
    try {
      const response = await authFetch('/api/v1/quick-quotes/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.sucesso) throw new Error(response.mensagem || 'Não foi possível calcular a cotação')
      setPreview(response.data)
    } catch (error) {
      toast.error(error.message || 'Erro ao calcular cotação')
    } finally {
      setCalculating(false)
    }
  }

  async function save() {
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
      setPreview(response.data.result)
      toast.success(`Cotação ${response.data.quoteNumber} salva no seu painel`)
      return response.data
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar cotação')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function download(quote) {
    setExporting(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/quick-quotes/${quote.id}/proposal.pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      if (!response.ok) throw new Error('Não foi possível gerar o PDF')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `Fairfield_Proposta_${quote.quoteNumber || quote.id}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.message || 'Erro ao gerar PDF')
    } finally {
      setExporting(false)
    }
  }

  function selectQuote(quote) {
    setSelectedQuote(quote)
    setForm({ ...EMPTY_FORM, ...quote.input, cnpj: formatCnpj(quote.input?.cnpj) })
    setPreview(quote.result)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-sentinel font-bold">SENTINEL · Motor Fairfield</div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Sua cotação rápida</h1>
        <p className="text-sm text-white/35 mt-1">Simule cenários de Seguro de Crédito e salve a proposta no seu painel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Empresa" value={form.companyName} onChange={value => update('companyName', value)} placeholder="Razão social" />
            <Field label="CNPJ" value={form.cnpj} onChange={value => update('cnpj', formatCnpj(value))} placeholder="00.000.000/0000-00" />
            <Select label="Modalidade" value={form.territory} onChange={value => update('territory', value)} options={[["interno", 'Brasil'], ["externo", 'Exportação']]} />
            <Field label="Faturamento anual" value={form.annualRevenue} onChange={value => update('annualRevenue', value)} placeholder="Ex.: 10000000" type="number" />
            <Field label="Cobertura desejada" value={form.requestedCoverage} onChange={value => update('requestedCoverage', value)} placeholder="Ex.: 5000000" type="number" />
            <Select label="Setor" value={form.sector} onChange={value => update('sector', value)} options={sectors.map(item => [item.name, `${item.name} · ${item.risk}`])} />
            {form.territory === 'externo' && <Field label="Seguradora de referência (opcional)" value={form.insurer} onChange={value => update('insurer', value)} placeholder="Ex.: Coface" />}
            <Field label="Sinistralidade (opcional)" value={form.lossRate} onChange={value => update('lossRate', value)} placeholder="Ex.: 2,5%" />
          </div>
          <label className="flex items-center gap-2 mt-5 text-xs text-white/45">
            <input type="checkbox" checked={form.lucroReal} onChange={event => update('lucroReal', event.target.checked)} className="accent-sentinel" />
            Empresa tributada pelo lucro real
          </label>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={calculate} disabled={calculating} className="px-5 py-3 rounded-xl bg-sentinel text-navy text-xs font-bold disabled:opacity-50">{calculating ? 'Calculando...' : 'Calcular prévia'}</button>
            {preview && <button onClick={save} disabled={saving} className="px-5 py-3 rounded-xl border border-sentinel/30 text-sentinel text-xs font-bold disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar cotação'}</button>}
          </div>
        </section>

        <aside className="rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]"><h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Minhas cotações</h2><p className="text-[10px] text-white/25 mt-1">{quotes.length} registro(s)</p></div>
          <div className="divide-y divide-white/[0.05] max-h-[500px] overflow-auto">
            {quotes.map(quote => <button key={quote.id} onClick={() => selectQuote(quote)} className="w-full text-left p-4 hover:bg-white/[0.04] transition-colors"><p className="text-xs font-bold text-white/75 truncate">{quote.companyName || 'Empresa'}</p><p className="text-[10px] text-white/30 mt-1">{quote.quoteNumber || `#${quote.id}`} · {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('pt-BR') : '—'}</p></button>)}
            {!quotes.length && <p className="p-5 text-xs text-white/30">Suas cotações salvas aparecerão aqui.</p>}
          </div>
        </aside>
      </div>

      {preview && <section className="rounded-2xl border border-sentinel/20 bg-sentinel/[0.05] p-5 sm:p-6 space-y-5">
        <div><p className="text-[10px] uppercase tracking-widest text-sentinel font-bold">Prévia indicativa</p><h2 className="text-xl font-black text-white mt-1">Cenário recomendado</h2></div>
        {selectedScenario && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Metric label="Prêmio anual" value={`${money(selectedScenario.finalValueLow, preview.pricing.currency)} — ${money(selectedScenario.finalValueHigh, preview.pricing.currency)}`} />
          <Metric label="Parcela mensal" value={`${money(selectedScenario.monthlyInstallmentLow, preview.pricing.currency)} — ${money(selectedScenario.monthlyInstallmentHigh, preview.pricing.currency)}`} />
          <Metric label="Taxa estimada" value={`${(selectedScenario.rateLow * 100).toFixed(3).replace('.', ',')}% — ${(selectedScenario.rateHigh * 100).toFixed(3).replace('.', ',')}%`} />
        </div>}
        <div className="flex flex-wrap gap-2">{scenarios.map(item => <span key={item.code} className={`px-3 py-2 rounded-lg text-[10px] font-bold border ${item.recommended ? 'border-sentinel/40 text-sentinel bg-sentinel/10' : 'border-white/10 text-white/45'}`}>{item.code} · {item.name}</span>)}</div>
        {preview.warnings?.length > 0 && <ul className="text-xs text-amber-200/70 space-y-1">{preview.warnings.map(item => <li key={item}>• {item}</li>)}</ul>}
        <div className="flex flex-wrap gap-3"><button onClick={save} disabled={saving} className="px-5 py-3 rounded-xl bg-cobre text-white text-xs font-bold disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar e gerar proposta'}</button>{selectedQuote?.id && <button onClick={() => download(selectedQuote)} disabled={exporting} className="px-5 py-3 rounded-xl border border-white/15 text-white/65 text-xs font-bold">{exporting ? 'Gerando...' : 'Baixar PDF'}</button>}</div>
        <p className="text-[10px] text-white/30 leading-relaxed">Estimativa informativa. A proposta definitiva depende da análise formal das seguradoras.</p>
      </section>}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) { return <label className="block"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">{label}</span><input type={type} value={value || ''} placeholder={placeholder} onChange={event => onChange(event.target.value)} className="w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-sentinel/50" /></label> }
function Select({ label, value, onChange, options }) { return <label className="block"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">{label}</span><select value={value} onChange={event => onChange(event.target.value)} className="w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-sentinel/50">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label> }
function Metric({ label, value }) { return <div className="rounded-xl border border-white/[0.08] bg-black/10 p-4"><p className="text-[10px] uppercase tracking-wider text-white/35">{label}</p><p className="text-sm sm:text-base font-bold text-white mt-2">{value}</p></div> }
