import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Input, Select, DynamicTable, StepNav, ProgressBar, SuccessScreen, CNPJInput, formatPhone } from '../components/FormComponents'
import { LearningTrailExterno } from '../components/LearningTrail'
import ICoverAnalysis from '../components/ICoverAnalysis'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../config'

const STORAGE_KEY = 'fairfield_intake_externo'
const STEPS = ['Proponente', 'Faturamento', 'Destinos', 'Carteira', 'Perdas', 'Vencidos', 'Compradores']
const FAIXAS_CARTEIRA = ['Até 10.000', 'De 10.001 a 50.000', 'De 50.001 a 200.000', 'De 200.001 a 500.000', 'De 500.001 a 1.000.000', 'Acima de 1.000.001']

function emptyForm() {
  return {
    proponente: { razao_social: '', cnpj: '', setor: '', faturamento_pct: '', uf: '' },
    contato: { nome: '', email: '', telefone: '' },
    coSeguradas: [{ empresa: '', cnpj: '', setor: '', faturamento_pct: '' }],
    historicoFaturamento: [
      { ano: '2022', faturamento: '', perdas: '' },
      { ano: '2023', faturamento: '', perdas: '' },
      { ano: '2024', faturamento: '', perdas: '' },
      { ano: 'Próximos 12 meses', faturamento: '', perdas: '' }
    ],
    condicoesVenda: { pct_vista: '', pct_prazo: '', prazo_medio_dias: '', prazo_maximo_dias: '', faturamento_desejado_seguro: '' },
    destinosExportacao: {
      anos_exportando: '', asia_pct: '', europa_pct: '', america_sul_pct: '',
      america_norte_pct: '', america_central_pct: '', africa_oceania_pct: '',
      menor_limite: '', maior_limite: '', num_importadores: '', principais_paises: ''
    },
    carteiraRecebiveis: FAIXAS_CARTEIRA.map(f => ({ faixa: f, faturamento_total: '', pct_faturamento: '', num_clientes: '', pct_clientes: '' })),
    maioresPerdas: [{ importador: '', pais: '', exercicio: '', valor: '', motivo: '' }],
    atrasos: [{ faixa_dias: 'Acima de 180 dias', valor_atraso: '', pct_valor: '', qtd_clientes: '', pct_clientes: '' }],
    amostraCompradores: [{ pais: '', razao_social: '', cnpj_codigo_fiscal: '', limite_credito: '', endereco: '' }]
  }
}

export default function IntakeExterno() {
  const { user, updateProspectPhase, authFetch } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : emptyForm()
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showICover, setShowICover] = useState(false)
  const [icoverAnalysis, setIcoverAnalysis] = useState(null)
  const [result, setResult] = useState(null)
  const [isReview, setIsReview] = useState(false)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) }, [form])

  useEffect(() => {
    if (user) updateProspectPhase(user.email, 'preenchendo_externo')
  }, [])

  function u(section, field, value) {
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
    setErrors(prev => { const n = { ...prev }; delete n[`${section}.${field}`]; return n })
  }

  function uArray(section, index, field, value) {
    setForm(prev => {
      const arr = [...prev[section]]
      arr[index] = { ...arr[index], [field]: value }

      // Auto-calcular percentuais para carteira de recebíveis
      if (section === 'carteiraRecebiveis' && (field === 'faturamento_total' || field === 'num_clientes')) {
        const totalFat = arr.reduce((s, r) => s + (parseFloat(String(r.faturamento_total).replace(/\./g, '').replace(',', '.')) || 0), 0)
        const totalCli = arr.reduce((s, r) => s + (parseInt(String(r.num_clientes).replace(/\D/g, '')) || 0), 0)
        arr.forEach((r, i) => {
          const fat = parseFloat(String(r.faturamento_total).replace(/\./g, '').replace(',', '.')) || 0
          const cli = parseInt(String(r.num_clientes).replace(/\D/g, '')) || 0
          arr[i] = {
            ...arr[i],
            pct_faturamento: totalFat > 0 ? (fat / totalFat * 100).toFixed(1) : '',
            pct_clientes: totalCli > 0 ? (cli / totalCli * 100).toFixed(1) : ''
          }
        })
      }

      return { ...prev, [section]: arr }
    })
  }

  function addRow(section, template) {
    setForm(prev => ({ ...prev, [section]: [...prev[section], { ...template }] }))
  }

  function removeRow(section, index) {
    setForm(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }))
  }

  function validate(s) {
    const errs = {}
    if (s === 0) {
      if (!form.proponente.razao_social.trim()) errs['proponente.razao_social'] = 'Obrigatório'
      if (form.proponente.cnpj.replace(/\D/g, '').length !== 14) errs['proponente.cnpj'] = 'CNPJ inválido'
      if (!form.proponente.setor.trim()) errs['proponente.setor'] = 'Obrigatório'
      if (!form.contato.nome.trim()) errs['contato.nome'] = 'Obrigatório'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contato.email)) errs['contato.email'] = 'E-mail inválido'
    }
    if (s === 6) {
      const compradores = form.amostraCompradores.filter(c => c.razao_social || c.limite_credito || c.pais)
      if (compradores.length === 0) {
        errs['compradores'] = 'Informe pelo menos 1 importador'
      } else {
        compradores.forEach((c, i) => {
          if (!c.cnpj_codigo_fiscal || c.cnpj_codigo_fiscal.trim().length < 3) {
            errs[`comprador_cnpj_${i}`] = `Código fiscal obrigatório para o importador ${i + 1}`
          }
        })
      }
    }
    setErrors(errs)
    if (Object.keys(errs).length > 0 && s === 6) {
      toast.error('Preencha o código fiscal de todos os importadores informados')
    }
    return Object.keys(errs).length === 0
  }

  function next() { if (validate(step)) setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  function prev() { setIsReview(false); setStep(s => Math.max(s - 1, 0)) }

  async function handleSubmit(action) {
    if (action === 'review') { if (validate(step)) setIsReview(true) }
    else {
      setShowICover(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleICoverAccept(analysis) {
    setIcoverAnalysis(analysis)
    setLoading(true)
    try {
      const body = { tipo: 'externo', ...form, seguradoras: [], icoverAnalysis: analysis }
      const fetchFn = user ? authFetch : apiFetch
      const data = await fetchFn('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!data.sucesso) throw new Error(data.mensagem)
      setResult(data.data)
      setSubmitted(true)
      setShowICover(false)
      localStorage.removeItem(STORAGE_KEY)
      if (user) updateProspectPhase(user.email, 'enviado_externo')
      toast.success('Solicitação enviada com sucesso!')
    } catch (err) { toast.error(err.message || 'Erro ao enviar') }
    finally { setLoading(false) }
  }

  function handleICoverDecline() {
    window.open('https://www.4score.com.br', '_blank')
  }

  function handleCNPJResult(data) {
    setForm(prev => ({
      ...prev,
      proponente: { ...prev.proponente, razao_social: data.razao_social, uf: data.uf || prev.proponente.uf }
    }))
    toast.success(`Empresa: ${data.razao_social}`)
  }

  if (submitted) return <SuccessScreen result={result} tipo="externo" onReset={() => { setSubmitted(false); setShowICover(false); setIcoverAnalysis(null); setStep(0); setForm(emptyForm()); setResult(null); setIsReview(false) }} />

  if (showICover) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ICoverAnalysis
        formData={form}
        tipo="externo"
        onComplete={handleICoverAccept}
        onDecline={handleICoverDecline}
        submitting={loading}
      />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-navy">Crédito Externo</h2>
        <p className="text-cobre text-sm font-semibold">Operações de Exportação — Valores em US$</p>
      </div>

      {!isReview && <ProgressBar step={step} steps={STEPS} />}

      {!isReview && <LearningTrailExterno step={step} />}

      <div className="card">
        {isReview ? (
          <div className="space-y-4">
            {/* Header revisão */}
            <div className="bg-gradient-to-r from-navy to-[#0d1f3c] rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-0.5">Quase lá!</p>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Revisão Final dos Dados</h3>
                <p className="text-xs text-white/60">Confirme as informações antes de enviar para todas as seguradoras do mercado</p>
              </div>
            </div>

            {/* Proponente */}
            <ReviewCard accent="navy" title="Proponente" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}>
              <ReviewRow label="Empresa" value={form.proponente.razao_social} highlight />
              <ReviewRow label="CNPJ" value={form.proponente.cnpj} />
              <ReviewRow label="Atividade" value={form.proponente.setor} />
              <ReviewRow label="Anos exportando" value={form.destinosExportacao.anos_exportando} />
              <ReviewRow label="Contato" value={form.contato.nome ? `${form.contato.nome} · ${form.contato.email}` : ''} />
              {form.coSeguradas.filter(c => c.empresa).length > 0 && (
                <ReviewRow label="Co-seguradas" value={form.coSeguradas.filter(c => c.empresa).map(c => c.empresa).join(' · ')} />
              )}
            </ReviewCard>

            {/* Faturamento */}
            <ReviewCard accent="cobre" title="Faturamento e Condições (US$)" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}>
              {form.historicoFaturamento.map(h => (
                <ReviewRow key={h.ano} label={h.ano} value={h.faturamento ? `US$ ${h.faturamento} · Perdas: ${h.perdas || '0'}` : ''} />
              ))}
              <ReviewRow label="Fat. desejado seguro" value={form.condicoesVenda.faturamento_desejado_seguro ? `US$ ${form.condicoesVenda.faturamento_desejado_seguro}` : ''} highlight />
              <ReviewRow label="Condições" value={[form.condicoesVenda.pct_vista && `Vista ${form.condicoesVenda.pct_vista}%`, form.condicoesVenda.pct_prazo && `Prazo ${form.condicoesVenda.pct_prazo}%`, form.condicoesVenda.prazo_medio_dias && `Médio ${form.condicoesVenda.prazo_medio_dias}d`].filter(Boolean).join(' · ')} />
            </ReviewCard>

            {/* Destinos */}
            {(form.destinosExportacao.asia_pct || form.destinosExportacao.europa_pct || form.destinosExportacao.america_sul_pct || form.destinosExportacao.principais_paises) && (
              <ReviewCard accent="navy" title="Destinos de Exportação" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}>
                <ReviewRow label="Regiões" value={[form.destinosExportacao.asia_pct && `Ásia ${form.destinosExportacao.asia_pct}%`, form.destinosExportacao.europa_pct && `Europa ${form.destinosExportacao.europa_pct}%`, form.destinosExportacao.america_sul_pct && `Am. Sul ${form.destinosExportacao.america_sul_pct}%`, form.destinosExportacao.america_norte_pct && `Am. Norte ${form.destinosExportacao.america_norte_pct}%`, form.destinosExportacao.africa_oceania_pct && `África/Oceania ${form.destinosExportacao.africa_oceania_pct}%`].filter(Boolean).join(' · ')} />
                <ReviewRow label="Principais países" value={form.destinosExportacao.principais_paises} />
                <ReviewRow label="Nº importadores" value={form.destinosExportacao.num_importadores} />
              </ReviewCard>
            )}

            {/* Compradores */}
            {form.amostraCompradores.filter(c => c.razao_social).length > 0 && (
              <ReviewCard accent="cobre" title="Amostra de Compradores" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}>
                {form.amostraCompradores.filter(c => c.razao_social).map((c, i) => (
                  <ReviewRow key={i} label={c.razao_social} value={[c.pais, c.cnpj_codigo_fiscal && `Tax ID: ${c.cnpj_codigo_fiscal}`, c.limite_credito && `Lim: US$ ${c.limite_credito}`].filter(Boolean).join(' · ')} />
                ))}
              </ReviewCard>
            )}

            <FairfieldValueProp />
          </div>
        ) : (
          <>
            {/* Step 0 - Proponente */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-3">1. Dados do Proponente</h3>
                <CNPJInput value={form.proponente.cnpj} onChange={v => u('proponente', 'cnpj', v)} onResult={handleCNPJResult} error={errors['proponente.cnpj']} />
                <Input label="Razão Social" value={form.proponente.razao_social} onChange={v => u('proponente', 'razao_social', v)} required error={errors['proponente.razao_social']} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Atividade da Empresa" value={form.proponente.setor} onChange={v => u('proponente', 'setor', v)} required error={errors['proponente.setor']} />
                  <Input label="Faturamento Empresa (%)" value={form.proponente.faturamento_pct} onChange={v => u('proponente', 'faturamento_pct', v)} placeholder="100%" />
                </div>
                <Input label="Há Quantos Anos Exporta" value={form.destinosExportacao.anos_exportando} onChange={v => u('destinosExportacao', 'anos_exportando', v)} placeholder="Ex: 5" />
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Contato Responsável</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Nome" value={form.contato.nome} onChange={v => u('contato', 'nome', v)} required error={errors['contato.nome']} />
                  <Input label="E-mail" value={form.contato.email} onChange={v => u('contato', 'email', v)} type="email" required error={errors['contato.email']} />
                  <Input label="Telefone" value={form.contato.telefone} onChange={v => u('contato', 'telefone', formatPhone(v))} placeholder="(00) 00000-0000" />
                </div>
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Co-Seguradas (opcional)</h4>
                </div>
                <DynamicTable
                  columns={[
                    { key: 'cnpj', label: 'CNPJ', type: 'cnpj', cnpjLookupTarget: 'empresa', placeholder: '00.000.000/0000-00' },
                    { key: 'empresa', label: 'Empresa', placeholder: 'Razão Social' },
                    { key: 'setor', label: 'Setor' },
                    { key: 'faturamento_pct', label: 'Fat. %', placeholder: '%' }
                  ]}
                  rows={form.coSeguradas}
                  onChange={(i, k, v) => uArray('coSeguradas', i, k, v)}
                  onAdd={() => addRow('coSeguradas', { empresa: '', cnpj: '', setor: '', faturamento_pct: '' })}
                  onRemove={i => removeRow('coSeguradas', i)}
                  maxRows={3}
                />
              </div>
            )}

            {/* Step 1 - Faturamento */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-3">2. Histórico de Faturamento e Perdas</h3>
                <p className="text-xs text-gray-400">Valores em US$ (dólares americanos).</p>
                <DynamicTable
                  columns={[
                    { key: 'ano', label: 'Período', readOnly: true },
                    { key: 'faturamento', label: 'Faturamento (US$)', placeholder: 'Ex: 2,000,000' },
                    { key: 'perdas', label: 'Perdas (US$)', placeholder: 'Ex: 50,000' }
                  ]}
                  rows={form.historicoFaturamento}
                  onChange={(i, k, v) => uArray('historicoFaturamento', i, k, v)}
                />

                {/* Sinistralidade live calculator */}
                {(() => {
                  const rows = form.historicoFaturamento.filter(r => r.ano !== 'Próximos 12 meses')
                  const totalFat = rows.reduce((s, r) => s + (parseFloat(String(r.faturamento).replace(/[^0-9.]/g, '')) || 0), 0)
                  const totalPerdas = rows.reduce((s, r) => s + (parseFloat(String(r.perdas).replace(/[^0-9.]/g, '')) || 0), 0)
                  const sin = totalFat > 0 ? (totalPerdas / totalFat * 100) : null
                  if (sin === null) return null
                  const sinColor = sin < 2 ? 'text-green-700 bg-green-50 border-green-200' : sin < 5 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200'
                  const sinLabel = sin < 2 ? 'Ótima sinistralidade' : sin < 5 ? 'Sinistralidade moderada' : 'Atenção: sinistralidade elevada'
                  return (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${sinColor}`}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Sinistralidade histórica: <strong>{sin.toFixed(2)}%</strong> — {sinLabel}
                    </div>
                  )
                })()}

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-bold text-navy mb-3">2.1 Faturamento Anual Desejado para o Seguro</h4>
                </div>
                <Input label="Valor (US$)" value={form.condicoesVenda.faturamento_desejado_seguro} onChange={v => u('condicoesVenda', 'faturamento_desejado_seguro', v)} placeholder="Ex: 5,000,000" hint="Sobre este faturamento estimado incide o custo da apólice." />
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-bold text-navy mb-3">3. Distribuição dos Prazos de Venda</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="À Vista (%)"
                    value={form.condicoesVenda.pct_vista}
                    onChange={v => {
                      u('condicoesVenda', 'pct_vista', v)
                      const vista = parseFloat(v) || 0
                      if (vista > 0 && vista <= 100 && !form.condicoesVenda.pct_prazo) {
                        u('condicoesVenda', 'pct_prazo', String(100 - vista))
                      }
                    }}
                    placeholder="%"
                    hint="Incluindo vendas com Carta de Crédito"
                  />
                  <Input
                    label="A Prazo (%)"
                    value={form.condicoesVenda.pct_prazo}
                    onChange={v => u('condicoesVenda', 'pct_prazo', v)}
                    placeholder="%"
                    hint={(() => {
                      const vista = parseFloat(form.condicoesVenda.pct_vista) || 0
                      const prazo = parseFloat(form.condicoesVenda.pct_prazo) || 0
                      const soma = vista + prazo
                      if (vista > 0 && prazo > 0 && Math.abs(soma - 100) > 0.1) return `⚠ Vista + Prazo = ${soma.toFixed(0)}% (esperado 100%)`
                      return null
                    })()}
                  />
                  <Input label="Prazo Médio Crédito (dias)" value={form.condicoesVenda.prazo_medio_dias} onChange={v => u('condicoesVenda', 'prazo_medio_dias', v)} placeholder="Ex: 90" />
                  <Input label="Prazo Máximo Crédito (dias)" value={form.condicoesVenda.prazo_maximo_dias} onChange={v => u('condicoesVenda', 'prazo_maximo_dias', v)} placeholder="Ex: 180" />
                </div>
              </div>
            )}

            {/* Step 2 - Destinos */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-3">4. Principais Destinos de Exportação</h3>
                <p className="text-xs text-gray-400 mb-2">Distribua o percentual de faturamento por região.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Input label="Ásia (%)" value={form.destinosExportacao.asia_pct} onChange={v => u('destinosExportacao', 'asia_pct', v)} placeholder="%" />
                  <Input label="Europa (%)" value={form.destinosExportacao.europa_pct} onChange={v => u('destinosExportacao', 'europa_pct', v)} placeholder="%" />
                  <Input label="América do Sul (%)" value={form.destinosExportacao.america_sul_pct} onChange={v => u('destinosExportacao', 'america_sul_pct', v)} placeholder="%" />
                  <Input label="América do Norte (%)" value={form.destinosExportacao.america_norte_pct} onChange={v => u('destinosExportacao', 'america_norte_pct', v)} placeholder="%" />
                  <Input label="América Central (%)" value={form.destinosExportacao.america_central_pct} onChange={v => u('destinosExportacao', 'america_central_pct', v)} placeholder="%" />
                  <Input label="África / Oceania (%)" value={form.destinosExportacao.africa_oceania_pct} onChange={v => u('destinosExportacao', 'africa_oceania_pct', v)} placeholder="%" />
                </div>
                <Input label="Principais Países Importadores" value={form.destinosExportacao.principais_paises} onChange={v => u('destinosExportacao', 'principais_paises', v)} placeholder="Ex: EUA, Argentina, China, Alemanha" />
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-bold text-navy mb-3">4.1 Informações Adicionais</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Menor Limite de Crédito Individual (US$)" value={form.destinosExportacao.menor_limite} onChange={v => u('destinosExportacao', 'menor_limite', v)} placeholder="Ex: 10,000" />
                  <Input label="Maior Limite de Crédito Individual (US$)" value={form.destinosExportacao.maior_limite} onChange={v => u('destinosExportacao', 'maior_limite', v)} placeholder="Ex: 500,000" />
                  <Input label="Número Total de Importadores" value={form.destinosExportacao.num_importadores} onChange={v => u('destinosExportacao', 'num_importadores', v)} placeholder="Ex: 25" />
                </div>
              </div>
            )}

            {/* Step 3 - Carteira */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-3">4.2 Distribuição da Carteira de Recebíveis</h3>
                <p className="text-xs text-gray-400">Excluindo vendas para coligadas, PF, empresas públicas, à vista ou antecipadas.</p>
                <DynamicTable
                  columns={[
                    { key: 'faixa', label: 'Faixa de Valor (US$)', readOnly: true },
                    { key: 'faturamento_total', label: 'Fat. Total (US$)', placeholder: 'Valor' },
                    { key: 'pct_faturamento', label: '% Fat.', readOnly: true, placeholder: 'Auto' },
                    { key: 'num_clientes', label: 'Nº Clientes', placeholder: 'Qtd' },
                    { key: 'pct_clientes', label: '% Clientes', readOnly: true, placeholder: 'Auto' }
                  ]}
                  rows={form.carteiraRecebiveis}
                  onChange={(i, k, v) => uArray('carteiraRecebiveis', i, k, v)}
                />
              </div>
            )}

            {/* Step 4 - Perdas */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-3">5. Maiores Perdas</h3>
                <p className="text-xs text-gray-400">Indicar as 5 maiores nos últimos 3 anos. Motivo: Mora, Falência, ações judiciais/extrajudiciais.</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, maioresPerdas: [{ importador: 'Sem perdas neste período', pais: '—', exercicio: '—', valor: '0', motivo: '—' }] }))}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 font-semibold hover:bg-green-100 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sem perdas neste período
                  </button>
                </div>
                <DynamicTable
                  columns={[
                    { key: 'importador', label: 'Importador', placeholder: 'Nome da empresa' },
                    { key: 'pais', label: 'País', placeholder: 'País' },
                    { key: 'exercicio', label: 'Exercício', placeholder: '2024' },
                    { key: 'valor', label: 'Montante (US$)', placeholder: 'Valor' },
                    { key: 'motivo', label: 'Motivo', placeholder: 'Mora, Falência...' }
                  ]}
                  rows={form.maioresPerdas}
                  onChange={(i, k, v) => uArray('maioresPerdas', i, k, v)}
                  onAdd={() => addRow('maioresPerdas', { importador: '', pais: '', exercicio: '', valor: '', motivo: '' })}
                  onRemove={i => removeRow('maioresPerdas', i)}
                  maxRows={5}
                />
              </div>
            )}

            {/* Step 5 - Vencidos */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-3">6. Dívidas Vencidas Acima de 180 Dias</h3>
                <p className="text-xs text-gray-400">Excluindo vendas para coligadas, PF, empresas públicas, à vista ou antecipadas.</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, atrasos: [{ faixa_dias: 'Acima de 180 dias', valor_atraso: '0', qtd_clientes: '0' }] }))}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 font-semibold hover:bg-green-100 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sem atrasos no período
                  </button>
                </div>
                <DynamicTable
                  columns={[
                    { key: 'faixa_dias', label: 'Período', readOnly: true },
                    { key: 'valor_atraso', label: 'Valor em Atraso (US$)', placeholder: 'Valor' },
                    { key: 'qtd_clientes', label: 'Qtd Clientes em Atraso', placeholder: 'Qtd' }
                  ]}
                  rows={form.atrasos}
                  onChange={(i, k, v) => uArray('atrasos', i, k, v)}
                />
              </div>
            )}

            {/* Step 6 - Compradores */}
            {step === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-3">7. Amostra de Compradores</h3>
                <p className="text-xs text-gray-400">Informar até 10 compradores — maiores, médios e menores. Valores em US$.</p>
                <DynamicTable
                  columns={[
                    { key: 'pais', label: 'País', placeholder: 'País' },
                    { key: 'razao_social', label: 'Razão Social', placeholder: 'Nome' },
                    { key: 'cnpj_codigo_fiscal', label: 'Código Fiscal *', placeholder: 'Tax ID', required: true },
                    { key: 'limite_credito', label: 'Limite Crédito (US$)', placeholder: 'Valor' },
                    { key: 'endereco', label: 'Endereço Completo', placeholder: 'Rua, cidade, país' }
                  ]}
                  rows={form.amostraCompradores}
                  onChange={(i, k, v) => uArray('amostraCompradores', i, k, v)}
                  onAdd={() => addRow('amostraCompradores', { pais: '', razao_social: '', cnpj_codigo_fiscal: '', limite_credito: '', endereco: '' })}
                  onRemove={i => removeRow('amostraCompradores', i)}
                  maxRows={10}
                  addLabel="Adicionar importador"
                  errors={errors}
                />

                {/* Mensagem de valor no último step */}
                <FairfieldValueProp />
              </div>
            )}
          </>
        )}

        <StepNav step={step} totalSteps={STEPS.length} stepNames={STEPS} onPrev={prev} onNext={next} onSubmit={handleSubmit} loading={loading} isReview={isReview} />
      </div>
    </div>
  )
}

function FairfieldValueProp() {
  const steps = [
    {
      num: '1', label: 'Análise simultânea',
      text: 'Todas as seguradoras do mercado são consultadas simultaneamente para encontrar a melhor condição.',
      icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></>
    },
    {
      num: '2', label: 'Comparativo técnico',
      text: 'Nossa equipe negocia as melhores condições de cobertura, prêmio e serviço para o seu perfil de exportação',
      icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></>
    },
    {
      num: '3', label: 'Decisão estratégica',
      text: 'Você recebe um comparativo exclusivo com recomendação técnica da Fairfield para a melhor escolha',
      icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></>
    },
  ]
  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-cobre/20 shadow-sm">
      <div className="bg-gradient-to-r from-navy to-[#0d1f3c] px-5 py-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-cobre/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-cobre" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold text-cobre uppercase tracking-widest mb-0.5">O que acontece depois?</p>
          <h4 className="text-base sm:text-lg font-bold text-white leading-tight">O SENTINEL destrava oportunidades para você exportar mais com segurança</h4>
        </div>
      </div>
      <div className="bg-white px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map(s => (
          <div key={s.num} className="flex flex-col gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cobre flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{s.icon}</svg>
              <span className="text-xs font-bold text-navy">{s.label}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="bg-green-50 border-t border-green-200 px-5 py-3 flex items-start gap-2">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-green-700"><strong>Estudo totalmente gratuito.</strong> O SENTINEL atua como suporte adicional à sua área de análise de crédito — mitigando riscos e destravando oportunidades para você vender mais com segurança.</p>
      </div>
    </div>
  )
}

function ReviewCard({ icon, title, accent, children }) {
  const accentCls = accent === 'cobre' ? 'text-cobre bg-cobre/8' : 'text-navy bg-navy/5'
  const titleCls = accent === 'cobre' ? 'text-cobre' : 'text-navy'
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className={`px-4 py-2.5 flex items-center gap-2 ${accentCls}`}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
        <h4 className={`text-xs font-bold uppercase tracking-wide ${titleCls}`}>{title}</h4>
      </div>
      <div className="bg-white divide-y divide-gray-50 px-4">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value, highlight }) {
  if (!value || value.toString().trim() === '') return null
  return (
    <div className="py-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 min-h-[2rem]">
      <span className="text-xs text-gray-400 font-medium w-28 flex-shrink-0">{label}</span>
      <span className={`text-sm flex-1 ${highlight ? 'font-bold text-navy' : 'text-gray-700'}`}>{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-cobre uppercase tracking-wide mb-2">{title}</h4>
      <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">{children}</div>
    </div>
  )
}
