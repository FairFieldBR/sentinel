import { useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth()

  const [profile, setProfile] = useState({
    nome: user?.nome || '',
    empresa: user?.empresa || '',
    cnpj: user?.cnpj ? formatCNPJ(user.cnpj) : '',
    telefone: user?.telefone || ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileErrors, setProfileErrors] = useState({})

  const [passwords, setPasswords] = useState({ current: '', nova: '', confirmar: '' })
  const [passLoading, setPassLoading] = useState(false)
  const [passErrors, setPassErrors] = useState({})
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  function uProfile(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }))
    setProfileErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  function uPass(field, value) {
    setPasswords(prev => ({ ...prev, [field]: value }))
    setPassErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    const errs = {}
    if (!profile.nome.trim()) errs.nome = 'Informe seu nome'
    if (!profile.empresa.trim()) errs.empresa = 'Informe a empresa'
    setProfileErrors(errs)
    if (Object.keys(errs).length > 0) return

    setProfileLoading(true)
    try {
      await updateProfile({
        nome: profile.nome.trim(),
        empresa: profile.empresa.trim(),
        cnpj: profile.cnpj.replace(/\D/g, ''),
        telefone: profile.telefone
      })
      toast.success('Perfil atualizado com sucesso!')
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar perfil')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    const errs = {}
    if (!passwords.current) errs.current = 'Informe a senha atual'
    if (passwords.nova.length < 6) errs.nova = 'Minimo 6 caracteres'
    if (passwords.nova !== passwords.confirmar) errs.confirmar = 'Senhas nao conferem'
    setPassErrors(errs)
    if (Object.keys(errs).length > 0) return

    setPassLoading(true)
    try {
      await changePassword(passwords.current, passwords.nova)
      toast.success('Senha alterada com sucesso!')
      setPasswords({ current: '', nova: '', confirmar: '' })
    } catch (err) {
      toast.error(err.message || 'Erro ao alterar senha')
    } finally {
      setPassLoading(false)
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
      {/* Back */}
      <Link to="/meu-painel" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-sentinel transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar ao Painel
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-sentinel/10 border-2 border-sentinel/25 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl font-black text-sentinel">{user?.nome?.charAt(0) || 'U'}</span>
        </div>
        <h1 className="text-2xl font-black text-white">Meu Perfil</h1>
        <p className="text-sm text-white/40 mt-1">{user?.email || ''}</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-base font-bold text-white border-b border-white/[0.06] pb-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Dados Pessoais
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label-field">Email</label>
            <input className="input-field opacity-50 cursor-not-allowed" value={user?.email || ''} readOnly />
            <p className="text-[10px] text-white/20 mt-1">O email nao pode ser alterado</p>
          </div>

          <div>
            <label className="label-field">Nome Completo *</label>
            <input className={`input-field ${profileErrors.nome ? errClass : ''}`}
              value={profile.nome} onChange={e => uProfile('nome', e.target.value)} />
            {profileErrors.nome && <p className="error-msg">{profileErrors.nome}</p>}
          </div>

          <div>
            <label className="label-field">Empresa *</label>
            <input className={`input-field ${profileErrors.empresa ? errClass : ''}`}
              value={profile.empresa} onChange={e => uProfile('empresa', e.target.value)} />
            {profileErrors.empresa && <p className="error-msg">{profileErrors.empresa}</p>}
          </div>

          <div>
            <label className="label-field">CNPJ</label>
            <input className="input-field"
              value={profile.cnpj} onChange={e => uProfile('cnpj', formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00" maxLength={18} />
          </div>

          <div>
            <label className="label-field">Telefone</label>
            <input className="input-field"
              value={profile.telefone} onChange={e => uProfile('telefone', formatPhone(e.target.value))}
              placeholder="(00) 00000-0000" maxLength={15} />
          </div>

          <button type="submit" disabled={profileLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {profileLoading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {profileLoading ? 'Salvando...' : 'Salvar Alteracoes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold text-white border-b border-white/[0.06] pb-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Alterar Senha
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label-field">Senha Atual *</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} className={`input-field pr-12 ${passErrors.current ? errClass : ''}`}
                value={passwords.current} onChange={e => uPass('current', e.target.value)} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showCurrent ? eyeOffIcon : eyeIcon}
              </button>
            </div>
            {passErrors.current && <p className="error-msg">{passErrors.current}</p>}
          </div>

          <div>
            <label className="label-field">Nova Senha *</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} className={`input-field pr-12 ${passErrors.nova ? errClass : ''}`}
                value={passwords.nova} onChange={e => uPass('nova', e.target.value)}
                placeholder="Minimo 6 caracteres" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showNew ? eyeOffIcon : eyeIcon}
              </button>
            </div>
            {passErrors.nova && <p className="error-msg">{passErrors.nova}</p>}
          </div>

          <div>
            <label className="label-field">Confirmar Nova Senha *</label>
            <input type="password" className={`input-field ${passErrors.confirmar ? errClass : ''}`}
              value={passwords.confirmar} onChange={e => uPass('confirmar', e.target.value)} />
            {passErrors.confirmar && <p className="error-msg">{passErrors.confirmar}</p>}
          </div>

          <button type="submit" disabled={passLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {passLoading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {passLoading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
