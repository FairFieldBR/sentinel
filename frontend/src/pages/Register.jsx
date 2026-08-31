import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { formatCNPJ } from '../components/FormComponents'
import { MiniShield } from './Home'

function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: '', empresa: '', cnpj: '',
    telefone: '', senha: '', confirmarSenha: '', termos: false
  })
  const [errors, setErrors] = useState({})

  function u(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  function validate() {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Informe seu nome completo'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'E-mail inválido'
    if (!form.empresa.trim()) errs.empresa = 'Informe a empresa'
    if (form.cnpj.replace(/\D/g, '').length !== 14) errs.cnpj = 'CNPJ inválido'
    if (form.telefone.replace(/\D/g, '').length < 10) errs.telefone = 'Telefone inválido'
    if (form.senha.length < 6) errs.senha = 'Mínimo 6 caracteres'
    if (form.senha !== form.confirmarSenha) errs.confirmarSenha = 'Senhas não conferem'
    if (!form.termos) errs.termos = 'Aceite os termos para continuar'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        empresa: form.empresa.trim(),
        cnpj: form.cnpj.replace(/\D/g, ''),
        telefone: form.telefone,
        password: form.senha
      })
      toast.success('Conta criada com sucesso!')
      navigate('/meu-painel')
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

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

  const errClass = 'border-rose-400/50 ring-2 ring-rose-400/20'

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 animate-fadeIn">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="mb-4">
          <MiniShield size={72} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-sentinel tracking-tight">SENTINEL</h1>
        <p className="text-white/40 text-sm mt-2">Crie sua conta para acessar a plataforma de Seguro de Credito</p>
      </div>

      <div className="card-glass">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Criar Conta
          </h3>

          {/* Nome */}
          <div>
            <label className="label-field">Nome Completo *</label>
            <input className={`input-field ${errors.nome ? errClass : ''}`}
              value={form.nome} onChange={e => u('nome', e.target.value)}
              placeholder="Seu nome completo" />
            {errors.nome && <p className="error-msg">{errors.nome}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label-field">Email Corporativo *</label>
            <input type="email" className={`input-field ${errors.email ? errClass : ''}`}
              value={form.email} onChange={e => u('email', e.target.value)}
              placeholder="seu@empresa.com.br" />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>

          {/* Empresa */}
          <div>
            <label className="label-field">Empresa / Razao Social *</label>
            <input className={`input-field ${errors.empresa ? errClass : ''}`}
              value={form.empresa} onChange={e => u('empresa', e.target.value)}
              placeholder="Razao social ou nome fantasia" />
            {errors.empresa && <p className="error-msg">{errors.empresa}</p>}
          </div>

          {/* CNPJ */}
          <div>
            <label className="label-field">CNPJ *</label>
            <input className={`input-field ${errors.cnpj ? errClass : ''}`}
              value={form.cnpj} onChange={e => u('cnpj', formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00" maxLength={18} />
            {errors.cnpj && <p className="error-msg">{errors.cnpj}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label className="label-field">Telefone *</label>
            <input className={`input-field ${errors.telefone ? errClass : ''}`}
              value={form.telefone} onChange={e => u('telefone', formatPhone(e.target.value))}
              placeholder="(00) 00000-0000" maxLength={15} />
            {errors.telefone && <p className="error-msg">{errors.telefone}</p>}
          </div>

          {/* Senha */}
          <div>
            <label className="label-field">Senha *</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className={`input-field pr-12 ${errors.senha ? errClass : ''}`}
                value={form.senha} onChange={e => u('senha', e.target.value)}
                placeholder="Minimo 6 caracteres" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? eyeOffIcon : eyeIcon}
              </button>
            </div>
            {errors.senha && <p className="error-msg">{errors.senha}</p>}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="label-field">Confirmar Senha *</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} className={`input-field pr-12 ${errors.confirmarSenha ? errClass : ''}`}
                value={form.confirmarSenha} onChange={e => u('confirmarSenha', e.target.value)}
                placeholder="Repita a senha" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showConfirm ? eyeOffIcon : eyeIcon}
              </button>
            </div>
            {errors.confirmarSenha && <p className="error-msg">{errors.confirmarSenha}</p>}
          </div>

          {/* Termos */}
          <div>
            <label className={`flex items-start gap-3 cursor-pointer group ${errors.termos ? '' : ''}`}>
              <input type="checkbox" checked={form.termos} onChange={e => u('termos', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-sentinel focus:ring-sentinel/40 accent-sentinel" />
              <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                Li e aceito os{' '}
                <Link to="/termos-de-uso" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-sentinel underline hover:text-sentinel/80 transition-colors">termos de uso</Link>
                {' '}e a{' '}
                <Link to="/politica-de-privacidade" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-sentinel underline hover:text-sentinel/80 transition-colors">politica de privacidade</Link>
              </span>
            </label>
            {errors.termos && <p className="error-msg">{errors.termos}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <p className="text-center text-sm text-white/40 mt-4">
            Ja tem conta?{' '}
            <Link to="/login" className="text-sentinel font-semibold hover:underline">Faca login</Link>
          </p>
        </form>
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
