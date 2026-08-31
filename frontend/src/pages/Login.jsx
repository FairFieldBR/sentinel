import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { formatPhone } from '../components/FormComponents'
import { MiniShield } from './Home'

export default function Login({ onComplete }) {
  const { login, generateCode, verifyCode } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('password') // 'password' | 'otp'
  const [stage, setStage] = useState('form') // 'form' | 'verify' (OTP only)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Password mode fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // OTP mode fields
  const [otpForm, setOtpForm] = useState({ nome: '', telefone: '', email: '', empresa: '' })
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState({})
  const [devInfo, setDevInfo] = useState(null)

  function uOtp(field, value) {
    setOtpForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  function validateOtp() {
    const errs = {}
    if (!otpForm.nome.trim()) errs.nome = 'Informe seu nome'
    if (!otpForm.empresa.trim()) errs.empresa = 'Informe a empresa'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpForm.email)) errs.email = 'E-mail invalido'
    if (otpForm.telefone.replace(/\D/g, '').length < 10) errs.telefone = 'Telefone invalido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Password Login ───
  async function handlePasswordLogin(e) {
    e.preventDefault()
    const errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail invalido'
    if (!password) errs.password = 'Informe a senha'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const result = await login(email, password)
      toast.success('Login realizado com sucesso!')
      if (onComplete) {
        onComplete()
      } else {
        const loggedUser = result?.data?.user || result?.user
        if (loggedUser?.role === 'admin') {
          navigate('/dashboard')
        } else {
          navigate('/meu-painel')
        }
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  // ─── OTP Flow ───
  async function handleOtpRegister(e) {
    e.preventDefault()
    if (!validateOtp()) return
    setLoading(true)
    try {
      const result = await generateCode(otpForm.email, otpForm.nome, otpForm.empresa, otpForm.telefone)
      if (result.devMode) {
        setDevInfo({ code: result.devCode, preview: result.devPreview })
        toast.success('Modo dev — codigo visivel abaixo')
      } else {
        setDevInfo(null)
        toast.success('Codigo enviado! Verifique seu e-mail.')
      }
      setStage('verify')
    } catch (err) {
      toast.error(err.message || 'Erro ao enviar codigo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (code.length !== 6) { toast.error('Digite o codigo de 6 digitos'); return }
    setLoading(true)
    try {
      const result = await verifyCode(otpForm.email, code)
      if (result.success) {
        toast.success('Verificado com sucesso!')
        if (onComplete) {
          onComplete()
        } else {
          navigate('/meu-painel')
        }
      } else {
        toast.error('Codigo invalido ou expirado.')
      }
    } catch {
      toast.error('Erro ao verificar codigo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      const result = await generateCode(otpForm.email, otpForm.nome, otpForm.empresa, otpForm.telefone)
      if (result.devMode) setDevInfo({ code: result.devCode, preview: result.devPreview })
      toast.success('Novo codigo enviado!')
    } catch (err) {
      toast.error(err.message || 'Erro ao reenviar codigo.')
    } finally {
      setResending(false)
    }
  }

  const errClass = 'border-rose-400/50 ring-2 ring-rose-400/20'

  const eyeIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
  const eyeOffIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  )

  // ═══════════════════════════════════════════
  // RENDER: PASSWORD MODE
  // ═══════════════════════════════════════════
  function renderPasswordMode() {
    return (
      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Entrar na sua conta
        </h3>

        <div>
          <label className="label-field">Email *</label>
          <input type="email" className={`input-field ${errors.email ? errClass : ''}`}
            value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => { const n = {...prev}; delete n.email; return n }) }}
            placeholder="seu@empresa.com.br" />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        <div>
          <label className="label-field">Senha *</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} className={`input-field pr-12 ${errors.password ? errClass : ''}`}
              value={password} onChange={e => { setPassword(e.target.value); setErrors(prev => { const n = {...prev}; delete n.password; return n }) }}
              placeholder="Sua senha" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showPass ? eyeOffIcon : eyeIcon}
            </button>
          </div>
          {errors.password && <p className="error-msg">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="flex flex-col items-center gap-2 pt-2">
          <button type="button" onClick={() => { setMode('otp'); setErrors({}) }}
            className="text-sm text-sentinel/70 hover:text-sentinel hover:underline transition-colors">
            Entrar com codigo de verificacao
          </button>
          <Link to="/register" className="text-sm text-white/40 hover:text-white/60 transition-colors">
            Não tem conta? <span className="text-sentinel font-semibold">Cadastre-se</span>
          </Link>
        </div>
      </form>
    )
  }

  // ═══════════════════════════════════════════
  // RENDER: OTP MODE - FORM
  // ═══════════════════════════════════════════
  function renderOtpForm() {
    return (
      <form onSubmit={handleOtpRegister} className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Identificacao
        </h3>

        <div>
          <label className="label-field">Nome Completo *</label>
          <input className={`input-field ${errors.nome ? errClass : ''}`}
            value={otpForm.nome} onChange={e => uOtp('nome', e.target.value)} placeholder="Seu nome completo" />
          {errors.nome && <p className="error-msg">{errors.nome}</p>}
        </div>

        <div>
          <label className="label-field">Nome da Empresa *</label>
          <input className={`input-field ${errors.empresa ? errClass : ''}`}
            value={otpForm.empresa} onChange={e => uOtp('empresa', e.target.value)} placeholder="Razao social ou nome fantasia" />
          {errors.empresa && <p className="error-msg">{errors.empresa}</p>}
        </div>

        <div>
          <label className="label-field">E-mail Corporativo *</label>
          <input type="email" className={`input-field ${errors.email ? errClass : ''}`}
            value={otpForm.email} onChange={e => uOtp('email', e.target.value)} placeholder="seu@empresa.com.br" />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        <div>
          <label className="label-field">Telefone *</label>
          <input className={`input-field ${errors.telefone ? errClass : ''}`}
            value={otpForm.telefone} onChange={e => uOtp('telefone', formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
          {errors.telefone && <p className="error-msg">{errors.telefone}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {loading ? 'Enviando codigo...' : 'Receber Codigo de Acesso'}
        </button>

        <div className="flex flex-col items-center gap-2 pt-2">
          <button type="button" onClick={() => { setMode('password'); setErrors({}) }}
            className="text-sm text-sentinel/70 hover:text-sentinel hover:underline transition-colors">
            Entrar com email e senha
          </button>
          <Link to="/register" className="text-sm text-white/40 hover:text-white/60 transition-colors">
            Não tem conta? <span className="text-sentinel font-semibold">Cadastre-se</span>
          </Link>
        </div>

        <p className="text-[10px] text-white/20 text-center mt-3">
          Enviaremos um código de verificação para o e-mail informado. Seus dados são protegidos pela LGPD.
        </p>
      </form>
    )
  }

  // ═══════════════════════════════════════════
  // RENDER: OTP MODE - VERIFY
  // ═══════════════════════════════════════════
  function renderOtpVerify() {
    return (
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-sentinel/10 border border-sentinel/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Verifique seu E-mail</h3>
          <p className="text-sm text-white/35 mt-1">
            Enviamos um codigo de 6 digitos para <strong className="text-sentinel">{otpForm.email}</strong>
          </p>
        </div>

        {devInfo ? (
          <div className="rounded-xl overflow-hidden border border-amber-500/30">
            <div className="bg-amber-500/15 px-4 py-2 flex items-center gap-2">
              <span className="text-amber-400 font-bold text-xs">MODO DESENVOLVIMENTO</span>
            </div>
            <div className="bg-amber-500/5 px-4 py-3">
              <p className="text-xs text-amber-300/60 mb-2">SMTP não configurado — código de teste:</p>
              <div className="bg-navy-dark border border-amber-500/20 rounded-lg p-3 text-center">
                <p className="text-3xl font-mono font-bold text-amber-400 tracking-[0.4em]">{devInfo.code}</p>
              </div>
              {devInfo.preview && (
                <a href={devInfo.preview} target="_blank" rel="noopener noreferrer"
                  className="block text-center text-xs text-sentinel underline mt-2">Ver email no Ethereal</a>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 px-4 py-3">
            <p className="text-sm text-accent-emerald font-semibold">Codigo enviado para <strong>{otpForm.email}</strong></p>
            <p className="text-xs text-white/25 mt-1">Verifique sua caixa de entrada. Valido por 15 minutos.</p>
          </div>
        )}

        <div>
          <label className="label-field text-center block">Codigo de Verificacao</label>
          <input className="input-field text-center text-2xl tracking-[0.5em] font-mono font-bold"
            value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000" maxLength={6} autoFocus />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {loading ? 'Verificando...' : 'Verificar e Acessar'}
        </button>

        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={handleResend} disabled={resending}
            className="text-sentinel hover:underline font-medium disabled:opacity-50">
            {resending ? 'Reenviando...' : 'Reenviar codigo'}
          </button>
          <button type="button" onClick={() => { setStage('form'); setCode('') }}
            className="text-white/25 hover:text-white/50">Voltar</button>
        </div>
      </form>
    )
  }

  // ═══════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════
  function renderContent() {
    if (mode === 'password') return renderPasswordMode()
    if (stage === 'verify') return renderOtpVerify()
    return renderOtpForm()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 animate-fadeIn">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="mb-4">
          <MiniShield size={72} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-sentinel tracking-tight">SENTINEL</h1>
        <p className="text-white/40 text-sm mt-2">
          {mode === 'password'
            ? 'Acesse sua conta de Seguro de Crédito'
            : 'Preencha seus dados para iniciar a cotação de Seguro de Crédito'}
        </p>
      </div>

      <div className="card-glass">
        {renderContent()}
      </div>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-white/20">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Ambiente seguro — Fairfield SUSEP 20.2036457.1
        </div>
      </div>
    </div>
  )
}
