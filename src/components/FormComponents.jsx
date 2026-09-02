import { useState, useCallback, useEffect } from 'react'
import { API_BASE, apiFetch } from '../config'

// Utilitários exportados
export function formatCNPJ(v) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

export function validarCNPJ(cnpj) {
  const d = cnpj.replace(/\D/g, '')
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  let t = 12, nums = d.substring(0, t).split('').map(Number), soma = 0, pos = t - 7
  for (let i = t; i >= 1; i--) { soma += nums[t - i] * pos--; if (pos < 2) pos = 9 }
  let res = soma % 11 < 2 ? 0 : 11 - soma % 11
  if (res !== parseInt(d.charAt(t))) return false
  t = 13; nums = d.substring(0, t).split('').map(Number); soma = 0; pos = t - 7
  for (let i = t; i >= 1; i--) { soma += nums[t - i] * pos--; if (pos < 2) pos = 9 }
  res = soma % 11 < 2 ? 0 : 11 - soma % 11
  return res === parseInt(d.charAt(t))
}

export function Input({ label, value, onChange, placeholder, required, error, type = 'text', readOnly, className = '', hint }) {
  return (
    <div>
      <label className="label-field">{label}{required && ' *'}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input type={type} className={`input-field ${className}`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly} />
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}

export function Select({ label, value, onChange, options, required, error, placeholder = 'Selecione...', hint }) {
  return (
    <div>
      <label className="label-field">{label}{required && ' *'}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <select className="select-field" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}

export function DynamicTable({ columns, rows, onChange, onAdd, onRemove, maxRows, addLabel = 'Adicionar linha', errors = {} }) {
  const [cnpjStatuses, setCnpjStatuses] = useState({})

  async function handleCellChange(ri, col, value) {
    if (col.type === 'cnpj') {
      const formatted = formatCNPJ(value)
      onChange(ri, col.key, formatted)
      const digits = formatted.replace(/\D/g, '')
      if (digits.length < 14) { setCnpjStatuses(s => { const n = {...s}; delete n[`${ri}_${col.key}`]; return n }); return }
      if (!validarCNPJ(formatted)) { setCnpjStatuses(s => ({ ...s, [`${ri}_${col.key}`]: 'invalid' })); return }
      if (!col.cnpjLookupTarget) { setCnpjStatuses(s => ({ ...s, [`${ri}_${col.key}`]: 'valid' })); return }
      setCnpjStatuses(s => ({ ...s, [`${ri}_${col.key}`]: 'loading' }))
      try {
        const data = await apiFetch(`/api/cnpj/${digits}`)
        if (data.sucesso) {
          onChange(ri, col.cnpjLookupTarget, data.data.razao_social)
          setCnpjStatuses(s => ({ ...s, [`${ri}_${col.key}`]: 'found' }))
        } else if (data.status === 404) {
          setCnpjStatuses(s => ({ ...s, [`${ri}_${col.key}`]: 'not_found' }))
        } else {
          setCnpjStatuses(s => ({ ...s, [`${ri}_${col.key}`]: 'error' }))
        }
      } catch { setCnpjStatuses(s => ({ ...s, [`${ri}_${col.key}`]: 'error' })) }
    } else {
      onChange(ri, col.key, value)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-navy text-white">
            {columns.map((col, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">
                {col.label}
                {col.type === 'cnpj' && col.cnpjLookupTarget && (
                  <span className="ml-1 text-[9px] text-cobre/80 font-normal normal-case">auto-preenche</span>
                )}
              </th>
            ))}
            <th className="px-2 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-gray-100 hover:bg-gray-50">
              {columns.map((col, ci) => {
                const statusKey = `${ri}_${col.key}`
                const st = cnpjStatuses[statusKey]
                return (
                  <td key={ci} className="px-2 py-1">
                    {col.readOnly ? (
                      <span className={`text-xs px-2 py-1.5 block rounded ${row[col.key] ? 'bg-navy/5 text-navy font-semibold' : 'text-gray-400'}`}>
                        {row[col.key] ? `${row[col.key]}${col.placeholder === 'Auto' ? '%' : ''}` : (col.placeholder || '—')}
                      </span>
                    ) : col.type === 'cnpj' ? (
                      <div className="relative">
                        <input
                          className={`w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-cobre focus:border-cobre outline-none pr-6 ${
                            st === 'found' ? 'border-green-400 bg-green-50' :
                            (st === 'invalid' || st === 'not_found' || st === 'error') ? 'border-red-400 bg-red-50' :
                            col.required && errors[`comprador_cnpj_${ri}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                          }`}
                          value={row[col.key] || ''}
                          onChange={e => handleCellChange(ri, col, e.target.value)}
                          placeholder={col.placeholder || '00.000.000/0000-00'}
                          maxLength={18}
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {st === 'loading' && <svg className="animate-spin h-3.5 w-3.5 text-cobre" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                          {(st === 'found' || st === 'valid') && <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>}
                          {(st === 'invalid' || st === 'not_found' || st === 'error') && <svg className="h-3.5 w-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>}
                        </div>
                      </div>
                    ) : (
                      <input
                        className={`w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-cobre focus:border-cobre outline-none ${
                          col.required && errors[`comprador_cnpj_${ri}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                        value={row[col.key] || ''}
                        onChange={e => handleCellChange(ri, col, e.target.value)}
                        placeholder={col.placeholder || ''}
                      />
                    )}
                  </td>
                )
              })}
              <td className="px-2 py-1">
                {onRemove && rows.length > 1 && (
                  <button onClick={() => onRemove(ri)} className="text-red-300 hover:text-red-500 text-xl leading-none transition-colors" title="Remover">×</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {onAdd && (!maxRows || rows.length < maxRows) && (
        <button onClick={onAdd} className="mt-2 text-cobre text-xs font-semibold hover:underline flex items-center gap-1">
          <span className="text-base leading-none">+</span> {addLabel}
        </button>
      )}
    </div>
  )
}

export function StepNav({ step, totalSteps, stepNames, onPrev, onNext, onSubmit, loading, isReview }) {
  return (
    <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
      {step > 0 ? (
        <button onClick={onPrev} disabled={loading} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">Voltar</button>
      ) : <div />}
      {step < totalSteps - 1 && !isReview && (
        <button onClick={onNext} disabled={loading} className="btn-primary">Próximo</button>
      )}
      {step === totalSteps - 1 && !isReview && (
        <button onClick={() => onSubmit('review')} disabled={loading} className="btn-primary">Revisar Dados</button>
      )}
      {isReview && (
        <button onClick={() => onSubmit('send')} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {loading ? 'Enviando...' : 'Enviar Solicitação de Cotação'}
        </button>
      )}
    </div>
  )
}

export function ProgressBar({ step, steps }) {
  const pct = Math.round(((step + 1) / steps.length) * 100)
  return (
    <div className="mb-6">
      {/* Banner de impacto */}
      <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-cobre/10 to-cobre/5 border border-cobre/20 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cobre flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs text-gray-700">Dados completos geram propostas até <strong className="text-cobre">30% mais competitivas</strong></span>
        </div>
        <span className="text-xs font-bold text-cobre flex-shrink-0 ml-3">{pct}% concluído</span>
      </div>

      {/* Steps visuais */}
      <div className="relative flex items-start justify-between">
        {/* Linha de progresso */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" style={{ marginLeft: `${100 / steps.length / 2}%`, marginRight: `${100 / steps.length / 2}%` }}>
          <div className="h-full bg-gradient-to-r from-cobre to-navy transition-all duration-700 ease-out" style={{ width: `${step === 0 ? 0 : (step / (steps.length - 1)) * 100}%` }} />
        </div>

        {steps.map((s, i) => {
          const done = i < step
          const current = i === step
          return (
            <div key={i} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                done ? 'bg-cobre border-cobre' : current ? 'bg-navy border-navy ring-4 ring-navy/20' : 'bg-white border-gray-300'
              }`}>
                {done ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${current ? 'text-white' : 'text-gray-400'}`}>{i + 1}</span>
                )}
              </div>
              <span className={`mt-1.5 text-[10px] font-semibold text-center leading-tight hidden sm:block ${
                done ? 'text-cobre' : current ? 'text-navy' : 'text-gray-400'
              }`}>{s}</span>
            </div>
          )
        })}
      </div>

      {/* Nome da etapa atual no mobile */}
      <p className="sm:hidden text-center text-xs font-semibold text-navy mt-3">
        Etapa {step + 1} de {steps.length} — <span className="text-cobre">{steps[step]}</span>
      </p>
    </div>
  )
}

function ConfettiBurst() {
  const colors = ['#B87333', '#7DD3FC', '#4ade80', '#f59e0b', '#ffffff', '#fbbf24', '#a78bfa']
  const pieces = Array.from({ length: 90 }, (_, i) => {
    const angle = (i * 360 / 90) * Math.PI / 180
    const dist = 22 + (i % 7) * 6
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist
    return {
      id: i,
      color: colors[i % colors.length],
      delay: `${(i % 6) * 0.04}s`,
      duration: `${5.5 + (i % 5) * 0.5}s`,
      size: `${7 + (i % 4) * 2}px`,
      round: i % 4 === 0,
      rect: i % 5 === 1,
      tx: `${tx.toFixed(1)}vw`,
      ty: `${ty.toFixed(1)}vh`,
      tx2: `${(tx * 0.7).toFixed(1)}vw`,
      ty2: `${(ty * 0.4 + 55).toFixed(1)}vh`,
    }
  })
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 9999 }}>
      <style>{`
        @keyframes confettiBurst {
          0%   { transform: translate(0,0) rotate(0deg) scale(0); opacity: 1; }
          10%  { transform: translate(var(--tx), var(--ty)) rotate(220deg) scale(1); opacity: 1; }
          75%  { opacity: 1; }
          100% { transform: translate(var(--tx2), var(--ty2)) rotate(900deg) scale(0.15); opacity: 0; }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          width: p.size,
          height: p.rect ? `${parseInt(p.size) * 2}px` : p.size,
          backgroundColor: p.color,
          borderRadius: p.round ? '50%' : '3px',
          '--tx': p.tx,
          '--ty': p.ty,
          '--tx2': p.tx2,
          '--ty2': p.ty2,
          animation: `confettiBurst ${p.duration} ${p.delay} cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
        }} />
      ))}
    </div>
  )
}

export function SuccessScreen({ result, onReset, tipo }) {
  const [celebrating, setCelebrating] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setCelebrating(false), 8000)
    return () => clearTimeout(t)
  }, [])

  const steps = [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
      label: 'Análise simultânea',
      text: 'Todas as seguradoras do mercado recebem seus dados para análise simultânea.',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      label: 'Negociação técnica',
      text: 'Nossa equipe negocia as melhores condições de cobertura, prêmio e serviço para o seu perfil',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
      label: 'Comparativo exclusivo',
      text: 'Você recebe o estudo completo com recomendação técnica da Fairfield para a melhor escolha',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 relative">
      <style>{`
        @keyframes successEntry {
          0%   { opacity: 0; transform: scale(0.88) translateY(24px); }
          60%  { transform: scale(1.02) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-15deg); }
          60%  { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.18); opacity: 0.2; }
        }
      `}</style>
      {celebrating && <ConfettiBurst />}

      <div className="rounded-2xl overflow-hidden shadow-2xl border border-cobre/20"
        style={{ animation: 'successEntry 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>

        {/* Header navy */}
        <div className="bg-gradient-to-br from-navy via-[#0d1f3c] to-[#0A1628] px-6 pt-10 pb-8 text-center relative overflow-hidden">
          {/* Decorative rings */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-40 h-40 rounded-full border border-cobre/10" />

          {/* Check icon */}
          <div className="relative inline-flex mb-5">
            <div className="w-24 h-24 rounded-full bg-green-400/10 flex items-center justify-center"
              style={{ animation: 'ringPulse 2s ease-in-out infinite' }}>
              <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center"
                style={{ animation: 'checkPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
                <svg className="w-9 h-9 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold text-cobre uppercase tracking-widest mb-2">Solicitação Enviada com Sucesso</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">Seu estudo está em análise!</h2>
          <p className="text-white/50 text-sm mb-6">Crédito {tipo === 'externo' ? 'Exportação — Valores em US$' : 'Interno — Operações Nacionais'}</p>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-5 py-2.5">
            <svg className="w-5 h-5 text-cobre flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
            <span className="text-sm text-white">
              <strong className="text-cobre">Todas as seguradoras do mercado</strong> recebendo seus dados agora
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-6 space-y-4">
          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {steps.map((s, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-cobre flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{s.icon}</svg>
                  <span className="text-xs font-bold text-navy">{s.label}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Prazo */}
          <div className="flex items-center gap-3 bg-cobre/5 border border-cobre/15 rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-cobre/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-cobre" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-navy">Prazo de resposta</p>
              <p className="text-sm text-gray-600">Você receberá o comparativo completo <strong className="text-cobre">instantaneamente</strong></p>
            </div>
          </div>

          {/* Free stamp */}
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700"><strong>Estudo totalmente gratuito.</strong> Um e-mail de confirmação foi enviado para você.</p>
          </div>

          <button onClick={onReset} className="btn-primary w-full mt-2">
            Nova Cotação
          </button>
        </div>
      </div>
    </div>
  )
}

export function CNPJInput({ value, onChange, onResult, error, label = 'CNPJ' }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [statusMsg, setStatusMsg] = useState(null)

  function formatCNPJ(v) {
    const d = v.replace(/\D/g, '').slice(0, 14)
    if (d.length <= 2) return d
    if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`
    if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
    if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
    return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
  }

  function validarCNPJ(cnpj) {
    const d = cnpj.replace(/\D/g, '')
    if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
    let t = 12, nums = d.substring(0, t).split('').map(Number), soma = 0, pos = t - 7
    for (let i = t; i >= 1; i--) { soma += nums[t - i] * pos--; if (pos < 2) pos = 9 }
    let res = soma % 11 < 2 ? 0 : 11 - soma % 11
    if (res !== parseInt(d.charAt(t))) return false
    t = 13; nums = d.substring(0, t).split('').map(Number); soma = 0; pos = t - 7
    for (let i = t; i >= 1; i--) { soma += nums[t - i] * pos--; if (pos < 2) pos = 9 }
    res = soma % 11 < 2 ? 0 : 11 - soma % 11
    return res === parseInt(d.charAt(t))
  }

  async function handleChange(raw) {
    const formatted = formatCNPJ(raw)
    onChange(formatted)
    setStatus(null)
    setStatusMsg(null)
    const digits = formatted.replace(/\D/g, '')
    if (digits.length === 14) {
      if (!validarCNPJ(formatted)) { setStatus('invalid'); return }
      setLoading(true)
      try {
        const data = await apiFetch(`/api/cnpj/${digits}`)
        if (data.sucesso) {
          setStatus('found')
          onResult && onResult(data.data)
        } else if (data.status === 429) {
          setStatus('error')
          setStatusMsg('⚠ Muitas consultas. Aguarde alguns segundos e tente novamente.')
        } else if (data.status === 404) {
          setStatus('not_found')
          setStatusMsg('CNPJ não encontrado na Receita Federal')
        } else {
          setStatus('error')
          setStatusMsg('⚠ Não foi possível consultar agora. Continue preenchendo manualmente.')
        }
      } catch {
        setStatus('error')
        setStatusMsg('⚠ Servidor indisponível. Continue preenchendo manualmente.')
      }
      finally { setLoading(false) }
    }
  }

  return (
    <div>
      <label className="label-field">{label} *</label>
      <div className="relative">
        <input
          className={`input-field pr-12 ${status === 'found' ? 'border-green-500 ring-2 ring-green-200' : (status === 'invalid' || status === 'not_found' || status === 'error') ? 'border-red-500 ring-2 ring-red-200' : ''}`}
          value={value} onChange={e => handleChange(e.target.value)} placeholder="00.000.000/0000-00" maxLength={18}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading && <svg className="animate-spin h-5 w-5 text-cobre" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {status === 'found' && <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          {(status === 'not_found' || status === 'invalid' || status === 'error') && <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
        </div>
      </div>
      {loading && <p className="text-xs text-cobre mt-1">Consultando Receita Federal...</p>}
      {status === 'found' && <p className="text-xs text-green-600 mt-1">✓ Empresa verificada na Receita Federal</p>}
      {status === 'invalid' && <p className="text-xs text-red-500 mt-1">CNPJ inválido — verifique os números</p>}
      {(status === 'not_found' || status === 'error') && statusMsg && <p className={`text-xs mt-1 ${status === 'error' ? 'text-amber-600' : 'text-red-500'}`}>{statusMsg}</p>}
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}

export function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}
