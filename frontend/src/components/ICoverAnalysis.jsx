import { useState, useEffect, useRef } from 'react'
import { MiniShield } from '../pages/Home'

/**
 * ══════════════════════════════════════════════════════════════
 *  iCover Analysis — Tela de Análise de Subscrição Inteligente
 *  Exibida após o preenchimento do intake, antes do sucesso
 * ══════════════════════════════════════════════════════════════
 */

// ─── Animação de Análise (Loading) ───────────────────────────
function AnalysisAnimation({ onComplete }) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const phases = [
    { label: 'Analisando perfil da empresa...', icon: '🏢' },
    { label: 'Avaliando histórico de crédito...', icon: '📊' },
    { label: 'Calculando taxa base do setor...', icon: '🔢' },
    { label: 'Processando fatores de ajuste...', icon: '⚙️' },
    { label: 'Aplicando bônus/malus...', icon: '📈' },
    { label: 'Definindo estrutura de cobertura...', icon: '🛡️' },
    { label: 'Ranking de seguradoras...', icon: '🏆' },
    { label: 'Gerando relatório iCover...', icon: '✨' },
  ]

  useEffect(() => {
    const totalDuration = 12000
    const phaseInterval = totalDuration / phases.length
    const progressInterval = 80

    // Progresso não-linear: começa rápido, desacelera no meio, acelera no fim
    let elapsed = 0
    const progTimer = setInterval(() => {
      elapsed += progressInterval
      const linear = elapsed / totalDuration
      // Easing: ease-in-out cubic
      const eased = linear < 0.5
        ? 4 * linear * linear * linear
        : 1 - Math.pow(-2 * linear + 2, 3) / 2
      const pct = Math.min(eased * 100, 100)
      setProgress(pct)
      if (pct >= 100) { clearInterval(progTimer); setTimeout(onComplete, 600) }
    }, progressInterval)

    const phaseTimer = setInterval(() => {
      setPhase(p => p < phases.length - 1 ? p + 1 : p)
    }, phaseInterval)

    return () => { clearInterval(progTimer); clearInterval(phaseTimer) }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
      {/* Shield animado — versão com contraste para fundo claro */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-navy/10 to-sentinel/10 flex items-center justify-center">
          <svg width={56} height={56} viewBox="0 0 80 80" fill="none">
            <path d="M40 12 L62 24 L62 42 C62 56 52 66 40 70 C28 66 18 56 18 42 L18 24 Z"
              fill="rgba(17,24,51,0.06)" stroke="#0c4a6e" strokeWidth="1.8">
              <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M40 20 L56 28 L56 42 C56 52 49 60 40 63 C31 60 24 52 24 42 L24 28 Z"
              fill="rgba(12,74,110,0.06)" stroke="#0c4a6e" strokeWidth="0.8" opacity="0.5" />
            <text x="40" y="48" textAnchor="middle" fill="#0c4a6e" fontSize="22" fontWeight="bold" fontFamily="Inter, sans-serif">
              $
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </text>
            <line x1="22" y1="40" x2="58" y2="40" stroke="#0c4a6e" strokeWidth="0.5" opacity="0.2">
              <animate attributeName="y1" values="25;55;25" dur="3s" repeatCount="indefinite" />
              <animate attributeName="y2" values="25;55;25" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.35;0" dur="3s" repeatCount="indefinite" />
            </line>
          </svg>
        </div>
        <div className="absolute -inset-4 rounded-full border-2 border-dashed border-navy/10 animate-spin" style={{ animationDuration: '10s' }} />
      </div>

      {/* Título */}
      <h2 className="text-2xl font-black text-navy mb-2">Análise iCover</h2>
      <p className="text-navy/40 text-sm mb-8">Motor de subscrição inteligente SENTINEL</p>

      {/* Barra de progresso */}
      <div className="w-full max-w-md mb-6">
        <div className="h-2 bg-navy/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sentinel to-cobre rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-navy/30 font-mono">{Math.round(progress)}%</span>
          <span className="text-[10px] text-navy/30 font-mono">iCover Engine v1.0</span>
        </div>
      </div>

      {/* Fases */}
      <div className="space-y-2 w-full max-w-md">
        {phases.map((p, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              i < phase ? 'opacity-40' : i === phase ? 'bg-sentinel/[0.06] border border-sentinel/20' : 'opacity-20'
            }`}
          >
            <span className="text-base">{p.icon}</span>
            <span className={`text-sm ${i === phase ? 'text-navy font-semibold' : 'text-navy/50'}`}>{p.label}</span>
            {i < phase && <span className="ml-auto text-emerald-500 text-xs">✓</span>}
            {i === phase && <span className="ml-auto w-3 h-3 rounded-full bg-sentinel animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Gauge / Medidor Circular ────────────────────────────────
function ScoreGauge({ score, maxScore = 100, riskLabel, riskColor }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const pct = animatedScore / maxScore
  const circumference = 2 * Math.PI * 45
  const offset = circumference * (1 - pct)

  useEffect(() => {
    let frame
    const duration = 1500
    const start = Date.now()
    function animate() {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(score * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" opacity="0.3" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={riskColor} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-navy">{animatedScore}</span>
          <span className="text-[10px] text-navy/40 font-medium">/ {maxScore}</span>
        </div>
      </div>
      <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: riskColor + '20', color: riskColor }}>
        {riskLabel}
      </div>
    </div>
  )
}

// ─── Score Bar Individual ────────────────────────────────────
function ScoreBar({ label, value, max, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth((value / max) * 100), 200 + delay)
    return () => clearTimeout(timer)
  }, [value, max, delay])

  const color = width >= 70 ? '#34D399' : width >= 40 ? '#FCD34D' : '#FB923C'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-navy/50 w-40 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-navy/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-navy/70 w-10">{value}/{max}</span>
    </div>
  )
}

// ─── Card de Seguradora ──────────────────────────────────────
function InsurerCard({ insurer, rank }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      rank === 0 ? 'bg-sentinel/[0.04] border-sentinel/20' : 'bg-white border-gray-100'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
        rank === 0 ? 'bg-sentinel/15 text-sentinel' : rank === 1 ? 'bg-cobre/10 text-cobre' : 'bg-gray-100 text-navy/40'
      }`}>
        {rank + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-navy truncate">{insurer.name}</p>
        <p className="text-[10px] text-navy/40 truncate">{insurer.strengths[0]}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-xs font-bold text-navy/60">{insurer.score}%</span>
        <p className="text-[10px] text-navy/30">aderência</p>
      </div>
    </div>
  )
}

// ─── Componente Principal: Resultados ────────────────────────
function AnalysisResults({ analysis, onAccept, onDecline, tipo, submitting = false }) {
  const [showDetails, setShowDetails] = useState(false)
  const symbol = analysis.metrics.symbol

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel/[0.08] border border-sentinel/20 mb-3">
          <MiniShield size={16} />
          <span className="text-[10px] font-bold text-sentinel uppercase tracking-wider">iCover — Análise de Subscrição</span>
        </div>
        <h2 className="text-2xl font-black text-navy">{analysis.empresa}</h2>
        <p className="text-sm text-navy/40">{analysis.setor} · CNPJ {analysis.cnpj}</p>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Score */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-4">Score de Risco</h3>
          <ScoreGauge
            score={analysis.score}
            maxScore={analysis.scoreMax}
            riskLabel={analysis.riskLabel}
            riskColor={analysis.riskColor}
          />
        </div>

        {/* Prêmio Estimado */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-4">Prêmio Estimado Anual</h3>
          <div className="text-center mb-4">
            <p className="text-3xl font-black text-navy">{analysis.premium.estimatedFormatted}</p>
            <p className="text-xs text-navy/40 mt-1">≈ {analysis.premium.monthlyFormatted}/mês</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-navy/50">
              <span>Prêmio mínimo</span>
              <span className="font-semibold text-navy/70">{analysis.premium.minimumFormatted}</span>
            </div>
            <div className="flex justify-between text-navy/50">
              <span>Prêmio máximo</span>
              <span className="font-semibold text-navy/70">{analysis.premium.maximumFormatted}</span>
            </div>
            <div className="flex justify-between text-navy/50">
              <span>Taxa aplicada</span>
              <span className="font-semibold text-navy/70">{analysis.pricing.adjustedRatePct}</span>
            </div>
            {analysis.bonusMalus.type !== 'neutro' && (
              <div className={`flex justify-between ${analysis.bonusMalus.type === 'bonus' ? 'text-emerald-600' : 'text-orange-500'}`}>
                <span>{analysis.bonusMalus.type === 'bonus' ? 'Bônus' : 'Malus'}</span>
                <span className="font-bold">{analysis.bonusMalus.pct > 0 ? '+' : ''}{analysis.bonusMalus.pct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Cobertura Recomendada */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-4">Cobertura Recomendada</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-bold text-sentinel">{analysis.coverage.structureLabel}</p>
              <p className="text-[10px] text-navy/40 mt-0.5 leading-relaxed">{analysis.coverage.structureReason}</p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-navy/40">PMI</p>
                <p className="font-bold text-navy">{analysis.coverage.pmiPct}</p>
              </div>
              <div>
                <p className="text-navy/40">POS</p>
                <p className="font-bold text-navy">{analysis.coverage.posPct}</p>
              </div>
              <div>
                <p className="text-navy/40">Prazo máx. crédito</p>
                <p className="font-bold text-navy">{analysis.coverage.maxCreditPeriod} dias</p>
              </div>
              <div>
                <p className="text-navy/40">Mora prolongada</p>
                <p className="font-bold text-navy">{analysis.coverage.waitingPeriod} dias</p>
              </div>
              <div>
                <p className="text-navy/40">Limite discricionário</p>
                <p className="font-bold text-navy">{analysis.coverage.discretionaryLimitFormatted}</p>
              </div>
              <div>
                <p className="text-navy/40">Limite agregado</p>
                <p className="font-bold text-navy">{analysis.coverage.aggregateLimitFormatted}</p>
              </div>
            </div>
            {analysis.coverage.aad > 0 && (
              <>
                <div className="h-px bg-gray-100" />
                <p className="text-[10px] text-navy/40">{analysis.coverage.aadLabel}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detalhamento do Score */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-xs font-bold text-navy/40 uppercase tracking-wider">Análise Detalhada por Dimensão</h3>
          <svg className={`w-4 h-4 text-navy/30 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDetails && (
          <div className="mt-4 space-y-3">
            {Object.entries(analysis.scores).map(([key, s], i) => (
              <ScoreBar key={key} label={s.label} value={s.value} max={s.max} delay={i * 100} />
            ))}
            <div className="h-px bg-gray-100 my-3" />
            <h4 className="text-xs font-bold text-navy/40 uppercase tracking-wider">Fatores de Ajuste da Taxa</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {Object.entries(analysis.pricing.factors).map(([key, f]) => (
                <div key={key} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50">
                  <span className="text-navy/50">{f.label}</span>
                  <span className={`font-bold ${f.value < 1 ? 'text-emerald-600' : f.value > 1 ? 'text-orange-500' : 'text-navy/60'}`}>
                    {f.value < 1 ? '↓' : f.value > 1 ? '↑' : '='} {f.value.toFixed(2)}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ranking de Seguradoras */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
        <h3 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-4">Ranking de Seguradoras por Aderência ao Perfil</h3>
        <div className="space-y-2">
          {analysis.insurers.slice(0, 5).map((ins, i) => (
            <InsurerCard key={ins.name} insurer={ins} rank={i} />
          ))}
        </div>
      </div>

      {/* Insights Estratégicos iCover */}
      {analysis.insights && analysis.insights.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <h3 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-4">
            🎯 Insights Estratégicos iCover
          </h3>
          <div className="space-y-3">
            {analysis.insights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-sentinel/[0.03] to-transparent border border-sentinel/[0.08]">
                <span className="text-lg flex-shrink-0 mt-0.5">{insight.icon}</span>
                <div>
                  <p className="text-xs font-bold text-navy mb-0.5">{insight.title}</p>
                  <p className="text-[11px] text-navy/50 leading-relaxed">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-navy/[0.03] rounded-xl p-4 mb-6 border border-navy/[0.06]">
        <p className="text-[10px] text-navy/40 leading-relaxed">
          <strong className="text-navy/60">Importante:</strong> Esta análise é uma estimativa gerada pelo motor de subscrição iCover v2.0 com base nos dados informados.
          Os valores e condições apresentados são indicativos e podem variar na cotação real junto às seguradoras.
          A Fairfield atua como consultoria 100% independente — não representamos nenhuma seguradora.
          Os prêmios e condições definitivos serão definidos pelas seguradoras após análise formal da proposta.
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onAccept}
          disabled={submitting}
          className="px-8 py-4 bg-gradient-to-r from-sentinel-dark to-sentinel text-navy-dark rounded-2xl font-bold text-base shadow-lg shadow-sentinel/15 hover:shadow-xl hover:shadow-sentinel/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? 'Enviando cotação...' : '✓ Aceitar e prosseguir com cotação'}
        </button>
        <button
          onClick={onDecline}
          disabled={submitting}
          className="px-8 py-4 border border-navy/10 text-navy/50 rounded-2xl font-semibold text-sm hover:bg-navy/[0.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analisar meu score de crédito →
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-navy/25 mt-4">
        Powered by <span className="font-bold text-sentinel/50">SENTINEL</span> iCover Engine v2.0 · Oráculo de Inteligência em Seguro de Crédito · Fairfield
      </p>
    </div>
  )
}

// ─── Componente Wrapper ──────────────────────────────────────
export default function ICoverAnalysis({ formData, tipo, onComplete, onDecline, submitting = false }) {
  const [phase, setPhase] = useState('analyzing') // analyzing | results
  const [analysis, setAnalysis] = useState(null)
  const analysisRef = useRef(null)
  const animationDoneRef = useRef(false)

  useEffect(() => {
    async function runAnalysis() {
      try {
        const body = { tipo, ...formData, seguradoras: [] }

        try {
          const { apiFetch } = await import('../config')
          const result = await apiFetch('/api/underwriting/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          analysisRef.current = result
          setAnalysis(result)
        } catch {
          console.warn('API indisponível, usando análise client-side')
          const basicAnalysis = createBasicAnalysis(body)
          analysisRef.current = basicAnalysis
          setAnalysis(basicAnalysis)
        }
      } catch (err) {
        console.error('Erro na análise iCover:', err)
      }

      if (animationDoneRef.current) {
        setPhase('results')
      }
    }
    runAnalysis()
  }, [])

  function handleAnalysisComplete() {
    animationDoneRef.current = true
    if (analysisRef.current) {
      setPhase('results')
    }
  }

  function handleAccept() {
    if (!submitting && analysis) onComplete(analysis)
  }

  function handleDecline() {
    if (onDecline) onDecline()
    else window.open('https://www.4score.com.br', '_blank')
  }

  if (phase === 'analyzing') {
    return <AnalysisAnimation onComplete={handleAnalysisComplete} />
  }

  if (analysis) {
    return <AnalysisResults analysis={analysis} onAccept={handleAccept} onDecline={handleDecline} tipo={tipo} submitting={submitting} />
  }

  return <AnalysisAnimation onComplete={handleAnalysisComplete} />
}

// ─── Análise Avançada (fallback sem API) — Motor iCover v2.0 ───
function getSectorRiskProfile(setor) {
  const s = (setor || '').toLowerCase()
  const profiles = {
    quimico: { risk: 'medium', rate: 0.0022, label: 'Químico/Petroquímico', sectorScore: 7 },
    petroquimico: { risk: 'medium', rate: 0.0022, label: 'Petroquímico', sectorScore: 7 },
    alimento: { risk: 'low', rate: 0.0015, label: 'Alimentos/Bebidas', sectorScore: 9 },
    bebida: { risk: 'low', rate: 0.0015, label: 'Alimentos/Bebidas', sectorScore: 9 },
    metalur: { risk: 'medium', rate: 0.0025, label: 'Metalúrgico/Siderúrgico', sectorScore: 6 },
    sider: { risk: 'medium', rate: 0.0025, label: 'Siderúrgico', sectorScore: 6 },
    textil: { risk: 'medium_high', rate: 0.0030, label: 'Têxtil/Confecções', sectorScore: 5 },
    confec: { risk: 'medium_high', rate: 0.0030, label: 'Confecções', sectorScore: 5 },
    constru: { risk: 'high', rate: 0.0040, label: 'Construção Civil', sectorScore: 3 },
    imobil: { risk: 'high', rate: 0.0040, label: 'Imobiliário', sectorScore: 3 },
    farma: { risk: 'low', rate: 0.0012, label: 'Farmacêutico/Saúde', sectorScore: 9 },
    saude: { risk: 'low', rate: 0.0014, label: 'Saúde', sectorScore: 9 },
    tecnolog: { risk: 'low', rate: 0.0015, label: 'Tecnologia', sectorScore: 8 },
    software: { risk: 'low', rate: 0.0015, label: 'Software/TI', sectorScore: 8 },
    agro: { risk: 'medium', rate: 0.0022, label: 'Agronegócio', sectorScore: 7 },
    energia: { risk: 'medium', rate: 0.0020, label: 'Energia', sectorScore: 7 },
    renov: { risk: 'low', rate: 0.0018, label: 'Energia Renovável', sectorScore: 8 },
    papel: { risk: 'low', rate: 0.0016, label: 'Papel/Celulose', sectorScore: 8 },
    eletron: { risk: 'low', rate: 0.0017, label: 'Eletrônicos', sectorScore: 8 },
    auto: { risk: 'medium', rate: 0.0022, label: 'Automotivo', sectorScore: 7 },
    varejo: { risk: 'medium_high', rate: 0.0032, label: 'Varejo', sectorScore: 5 },
    commod: { risk: 'medium', rate: 0.0020, label: 'Commodities', sectorScore: 7 },
    fintech: { risk: 'medium', rate: 0.0025, label: 'Serviços Financeiros', sectorScore: 6 },
    financ: { risk: 'medium', rate: 0.0025, label: 'Serviços Financeiros', sectorScore: 6 },
  }
  for (const [key, profile] of Object.entries(profiles)) {
    if (s.includes(key)) return profile
  }
  return { risk: 'medium', rate: 0.0020, label: 'Geral', sectorScore: 7 }
}

function determineStructure(fatSeg, numBuyers, avgLR, prazoMedio, tipo) {
  // Excess of Loss para grandes corporações com boa gestão interna
  if (fatSeg > 500000000 && avgLR < 0.03) {
    return {
      structure: 'excess_of_loss', structureLabel: 'Excess of Loss (XL Corporativo)',
      structureReason: 'Com faturamento acima de R$ 500M e sinistralidade controlada, a estrutura XL permite reter perdas normais e transferir apenas riscos catastróficos, com prêmio significativamente menor.',
      pmi: 0.90, pmiPct: '90%', pos: 0.10, posPct: '10%', aadMult: 0.005
    }
  }
  // Key Buyer para carteiras concentradas
  if (numBuyers <= 15) {
    return {
      structure: 'key_buyer', structureLabel: 'Key Buyer (Compradores Nomeados)',
      structureReason: 'Perfil com número reduzido de compradores. Proteção focada nos maiores riscos com custo otimizado. Avalie também Top-Up para limites insuficientes.',
      pmi: 0.85, pmiPct: '85%', pos: 0.15, posPct: '15%', aadMult: 0
    }
  }
  // Single Risk para operações pontuais com pouquíssimos compradores
  if (numBuyers <= 5 && fatSeg < 5000000) {
    return {
      structure: 'single_risk', structureLabel: 'Single Risk / Single Buyer',
      structureReason: 'Para operações com poucos compradores e exposição concentrada, a apólice Single Risk oferece cobertura específica por transação sem prêmio mínimo anual.',
      pmi: 0.90, pmiPct: '90%', pos: 0.10, posPct: '10%', aadMult: 0
    }
  }
  // Apólice mista para exportação com mercado interno
  if (tipo === 'externo') {
    return {
      structure: 'mixed_wt', structureLabel: 'Apólice Mista (Interno + Exportação)',
      structureReason: 'Apólice combinando ramos SUSEP 0171 (interno) e 0172 (exportação) com cobertura de risco político. Inclui proteção contra moratória, inconvertibilidade cambial e embargo.',
      pmi: 0.90, pmiPct: '90%', pos: 0.10, posPct: '10%', aadMult: 0.001
    }
  }
  // Whole Turnover padrão
  return {
    structure: 'whole_turnover', structureLabel: 'Apólice Global (Whole Turnover)',
    structureReason: 'Estrutura mais eficiente para carteira diversificada. Cobre 100% do faturamento a prazo com limite de crédito por comprador. Inclui limite discricionário para compradores menores.',
    pmi: 0.85, pmiPct: '85%', pos: 0.15, posPct: '15%', aadMult: 0.002
  }
}

function generateInsights(fatSeg, avgLR, numBuyers, prazoMedio, tipo, setor, score) {
  const insights = []
  // FIDC opportunity
  if (fatSeg > 20000000) {
    insights.push({
      icon: '🏦', title: 'Oportunidade FIDC',
      text: `Com faturamento segurado acima de R$ ${Math.round(fatSeg/1000000)}M, recebíveis com apólice de seguro de crédito podem ser cedidos a um FIDC com rating superior (AA→AAA), reduzindo o custo de capital em até 50%.`
    })
  }
  // Large risk syndication
  if (fatSeg > 100000000) {
    insights.push({
      icon: '🌐', title: 'Cobertura Sindicada Recomendada',
      text: 'Para exposições acima de R$ 100M, recomenda-se cobertura sindicada com múltiplas seguradoras (Allianz Trade + Coface + Lloyd\'s) para maximizar capacidade e diversificar o risco de contraparte.'
    })
  }
  // Excellent loss ratio
  if (avgLR === 0 || avgLR < 0.02) {
    insights.push({
      icon: '⭐', title: 'Histórico Excelente — Negocie Bônus',
      text: `Sinistralidade de ${(avgLR * 100).toFixed(1)}% está muito abaixo da média do mercado (3-5%). Recomendamos negociar bônus de 15-25% no prêmio e PMI de 90% na contratação.`
    })
  }
  // High loss ratio warning
  if (avgLR > 0.10) {
    insights.push({
      icon: '⚠️', title: 'Sinistralidade Elevada — Ação Recomendada',
      text: `Loss ratio de ${(avgLR * 100).toFixed(1)}% requer atenção. Seguradoras poderão solicitar AAD mais alto ou PMI menor. Considere implementar gestão de crédito interna com apoio das ferramentas de monitoramento da seguradora.`
    })
  }
  // Export specific
  if (tipo === 'externo') {
    insights.push({
      icon: '🛫', title: 'Estratégia de Exportação',
      text: 'A apólice de exportação inclui cobertura de risco político (moratória, inconvertibilidade, embargo). Recebíveis segurados facilitam ACC/ACE e BNDES Exim com taxas até 2% menores.'
    })
  }
  // Payment terms optimization
  if (prazoMedio > 90) {
    insights.push({
      icon: '📅', title: 'Otimização de Prazo',
      text: `Prazo médio de ${prazoMedio} dias acima do padrão do mercado (60 dias). Isso impacta a taxa em +15-30%. Considere supply chain finance integrado ao seguro para oferecer prazo estendido com custo controlado.`
    })
  }
  // Concentration risk
  if (numBuyers < 20) {
    insights.push({
      icon: '📊', title: 'Risco de Concentração',
      text: `Carteira com ${numBuyers} compradores apresenta concentração elevada. Recomendamos monitoramento contínuo via plataforma SENTINEL e limites de crédito nomeados para os top 10 compradores.`
    })
  }
  // Regulatory
  insights.push({
    icon: '📋', title: 'Enquadramento Regulatório',
    text: `Ramo SUSEP ${tipo === 'externo' ? '0172 (Exportação)' : '0171 (Interno)'}. IOF: 0% (isento). Conformidade com CNSP 432/2021. ${fatSeg > 50000000 ? 'Para operações acima de R$ 50M, subscrição com resseguro facultativo pode ampliar capacidade.' : ''}`
  })
  return insights
}

function createBasicAnalysis(data) {
  const tipo = data.tipo || 'interno'
  const symbol = tipo === 'externo' ? 'US$' : 'R$'

  const historico = data.historicoFaturamento || []
  const fats = historico.map(h => parseFloat(String(h.faturamento || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0)
  const perds = historico.map(h => parseFloat(String(h.perdas || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0)
  const revenue = fats.length > 0 ? fats[fats.length - 1] : 0
  const mult = tipo === 'interno' ? 1000 : 1
  const adjRevenue = revenue * mult

  const totalFat = fats.reduce((a, b) => a + b, 0)
  const totalPer = perds.reduce((a, b) => a + b, 0)
  const avgLR = totalFat > 0 ? totalPer / totalFat : 0

  const cv = data.condicoesVenda || {}
  const pctPrazo = parseFloat(cv.pct_prazo || '80') / 100
  const prazoMedio = parseInt(cv.prazo_medio_dias || '60') || 60
  const fatDesejado = parseFloat(String(cv.faturamento_desejado_seguro || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0
  const fatSeg = fatDesejado > 0 ? fatDesejado * mult : adjRevenue * pctPrazo
  const numBuyers = parseInt(cv.num_compradores || '10') || 10

  // Sector-specific risk analysis
  const sectorProfile = getSectorRiskProfile(data.proponente?.setor)
  const baseRate = sectorProfile.rate

  // Multi-factor rate adjustment
  const lrFactor = avgLR === 0 ? 0.85 : avgLR < 0.02 ? 0.90 : avgLR < 0.05 ? 0.95 : avgLR < 0.10 ? 1.10 : avgLR < 0.15 ? 1.25 : 1.50
  const termFactor = prazoMedio <= 30 ? 0.90 : prazoMedio <= 60 ? 1.0 : prazoMedio <= 90 ? 1.10 : prazoMedio <= 120 ? 1.20 : 1.35
  const sizeFactor = fatSeg > 200000000 ? 0.80 : fatSeg > 50000000 ? 0.85 : fatSeg > 20000000 ? 0.90 : fatSeg > 5000000 ? 1.0 : 1.15
  const diversFactor = numBuyers > 100 ? 0.88 : numBuyers > 50 ? 0.92 : numBuyers > 20 ? 0.96 : numBuyers > 10 ? 1.0 : 1.10
  const tipoFactor = tipo === 'externo' ? 1.15 : 1.0

  const adjustedRate = baseRate * lrFactor * termFactor * sizeFactor * diversFactor * tipoFactor
  const premium = Math.max(fatSeg * adjustedRate, tipo === 'externo' ? 25000 : 15000)

  // Advanced scoring model
  const revenueScore = fatSeg > 200000000 ? 15 : fatSeg > 50000000 ? 13 : fatSeg > 20000000 ? 11 : fatSeg > 5000000 ? 9 : 6
  const lossScore = avgLR === 0 ? 25 : avgLR < 0.02 ? 22 : avgLR < 0.05 ? 18 : avgLR < 0.10 ? 14 : avgLR < 0.15 ? 10 : 5
  const concScore = numBuyers > 100 ? 20 : numBuyers > 50 ? 17 : numBuyers > 20 ? 14 : numBuyers > 10 ? 12 : 8
  const termScore = prazoMedio <= 30 ? 15 : prazoMedio <= 60 ? 13 : prazoMedio <= 90 ? 10 : prazoMedio <= 120 ? 7 : 5
  const geoScore = tipo === 'externo' ? 4 : 3
  const portfolioScore = avgLR < 0.05 && numBuyers > 20 ? 10 : avgLR < 0.10 ? 7 : 5
  const score = revenueScore + lossScore + concScore + termScore + sectorProfile.sectorScore + geoScore + portfolioScore

  // Dynamic structure recommendation
  const struct = determineStructure(fatSeg, numBuyers, avgLR, prazoMedio, tipo)
  const aadValue = struct.aadMult > 0 ? Math.round(fatSeg * struct.aadMult) : 0

  // Strategic insights
  const insights = generateInsights(fatSeg, avgLR, numBuyers, prazoMedio, tipo, sectorProfile.label, score)

  // Dynamic insurer ranking based on profile
  const insurerPool = [
    { name: 'Allianz Trade', baseScore: 88, strengths: ['Líder global', 'EOLIS platform', '80M+ empresas na base'], best: ['export', 'large', 'diversified'] },
    { name: 'Coface', baseScore: 85, strengths: ['Rating DRA proprietário', 'Presente em 100 países', 'TradeLiner para WT'], best: ['export', 'medium', 'info'] },
    { name: 'Atradius', baseScore: 82, strengths: ['Collections em 96 países', 'Modula flexível', 'Forte em cobrança'], best: ['export', 'collections', 'modular'] },
    { name: 'Chubb', baseScore: 80, strengths: ['Rating AA (S&P)', 'Soluções sob medida', 'Capacidade muito alta'], best: ['large', 'bespoke', 'highcap'] },
    { name: 'AIG', baseScore: 78, strengths: ['Risco político líder', 'Grandes exposições USD 10M+', 'Oil & gas/mining'], best: ['political', 'large', 'commodities'] },
    { name: 'AVLA', baseScore: 76, strengths: ['100% digital', 'Onboarding ágil', 'Foco em PMEs LATAM'], best: ['digital', 'pme', 'fast'] },
    { name: 'CESCE', baseScore: 74, strengths: ['PMEs desde R$ 15k/ano', 'Ibero-americano', 'Processo simplificado'], best: ['pme', 'latam', 'simple'] },
  ]
  // Score boost based on profile match
  const rankedInsurers = insurerPool.map(ins => {
    let bonus = 0
    if (tipo === 'externo' && ins.best.includes('export')) bonus += 5
    if (fatSeg > 100000000 && ins.best.includes('large')) bonus += 5
    if (fatSeg < 20000000 && ins.best.includes('pme')) bonus += 5
    if (numBuyers > 50 && ins.best.includes('diversified')) bonus += 3
    return { name: ins.name, score: ins.baseScore + bonus, strengths: ins.strengths }
  }).sort((a, b) => b.score - a.score)

  const fmt = v => `${symbol} ${Math.round(v).toLocaleString('pt-BR')}`

  return {
    tipo, empresa: data.proponente?.razao_social || 'Empresa', cnpj: data.proponente?.cnpj || '',
    setor: sectorProfile.label, setorRisco: sectorProfile.risk,
    score, scoreMax: 100, riskClass: score >= 70 ? 'preferred' : score >= 55 ? 'standard' : 'substandard',
    riskLabel: score >= 70 ? 'Risco Preferencial' : score >= 55 ? 'Risco Padrão' : 'Risco Subpadrão',
    riskColor: score >= 70 ? '#34D399' : score >= 55 ? '#7DD3FC' : '#FCD34D',
    scores: {
      revenue: { value: revenueScore, max: 15, label: 'Porte da Empresa' },
      lossRatio: { value: lossScore, max: 25, label: 'Histórico de Perdas' },
      concentration: { value: concScore, max: 20, label: 'Diversificação de Compradores' },
      paymentTerms: { value: termScore, max: 15, label: 'Prazo Médio de Crédito' },
      sector: { value: sectorProfile.sectorScore, max: 10, label: `Risco do Setor (${sectorProfile.label})` },
      geography: { value: geoScore, max: 5, label: tipo === 'externo' ? 'Diversificação Internacional' : 'Diversificação Geográfica' },
      portfolio: { value: portfolioScore, max: 10, label: 'Qualidade da Carteira' },
    },
    metrics: { faturamentoAnual: adjRevenue, faturamentoSeguravel: fatSeg, pctPrazo, prazoMedio, prazoMaximo: 90, avgLossRatio: avgLR, topBuyerPct: 0.15, top5Pct: 0.45, numBuyers, atrasosRatio: 0, currency: tipo === 'externo' ? 'USD' : 'BRL', symbol },
    pricing: {
      baseRate, adjustedRate,
      baseRatePct: (baseRate * 100).toFixed(3) + '%',
      adjustedRatePct: (adjustedRate * 100).toFixed(3) + '%',
      factors: {
        setor: { value: parseFloat((sectorProfile.rate / 0.0020).toFixed(2)), label: `Setor (${sectorProfile.label})` },
        sinistralidade: { value: parseFloat(lrFactor.toFixed(2)), label: 'Sinistralidade Histórica' },
        prazo: { value: parseFloat(termFactor.toFixed(2)), label: `Prazo de Crédito (${prazoMedio}d)` },
        porte: { value: parseFloat(sizeFactor.toFixed(2)), label: 'Porte / Volume Segurado' },
        diversificacao: { value: parseFloat(diversFactor.toFixed(2)), label: `Diversificação (${numBuyers} compradores)` },
        ...(tipo === 'externo' ? { exportacao: { value: 1.15, label: 'Fator Exportação (risco-país)' } } : {}),
      }
    },
    premium: { estimated: Math.round(premium), minimum: Math.round(premium * 0.7), maximum: Math.round(premium * 1.3), monthly: Math.round(premium / 12), estimatedFormatted: fmt(premium), minimumFormatted: fmt(premium * 0.7), maximumFormatted: fmt(premium * 1.3), monthlyFormatted: fmt(premium / 12) },
    bonusMalus: { factor: 1, type: avgLR === 0 ? 'bonus' : avgLR > 0.10 ? 'malus' : 'neutro', label: avgLR === 0 ? 'Bônus (sem sinistro)' : avgLR > 0.10 ? 'Malus (sinistralidade alta)' : 'Neutro', pct: avgLR === 0 ? -15 : avgLR > 0.10 ? 20 : 0 },
    coverage: {
      ...struct,
      aad: aadValue,
      aadLabel: aadValue > 0 ? `Franquia agregada anual (AAD): ${fmt(aadValue)} — perdas abaixo deste valor são absorvidas pela empresa` : 'Sem franquia agregada',
      discretionaryLimit: fatSeg > 50000000 ? 100000 : 50000,
      discretionaryLimitFormatted: fmt(fatSeg > 50000000 ? 100000 : 50000),
      maxCreditPeriod: Math.min(parseInt(cv.prazo_maximo_dias || '90') || 90, tipo === 'externo' ? 180 : 120),
      aggregateLimit: Math.round(premium * 14),
      aggregateLimitFormatted: fmt(premium * 14),
      waitingPeriod: tipo === 'externo' ? 180 : 150
    },
    insurers: rankedInsurers,
    insights,
    analyzedAt: new Date().toISOString(),
  }
}
