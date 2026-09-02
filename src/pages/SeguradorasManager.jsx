import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const B = import.meta.env.BASE_URL
const LOGOS = {
  'aig':           { src: `${B}logos/aig.png`, invert: false },
  'avla':          { src: `${B}logos/avla.svg`, invert: false },
  'allianz-trade': { src: `${B}logos/allianz-trade.png`, invert: true },
  'atradius':      { src: `${B}logos/atradius.svg`, invert: false },
  'cesce':         { src: `${B}logos/cesce.svg`, invert: false },
  'coface':        { src: `${B}logos/coface.png`, invert: true },
  'chubb':         { src: `${B}logos/chubb.svg`, invert: false },
}

export default function SeguradorasManager() {
  const { authFetch } = useAuth()
  const [seguradoras, setSeguradoras] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [addingContact, setAddingContact] = useState(null)
  const [newContact, setNewContact] = useState({ email: '', nome_contato: '', cargo: '' })

  async function fetchSeguradoras() {
    try {
      const data = await authFetch('/api/admin/seguradoras')
      setSeguradoras(data.data || [])
    } catch {
      toast.error('Erro ao carregar seguradoras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSeguradoras() }, [])

  async function toggleAtivo(seg) {
    try {
      await authFetch(`/api/admin/seguradoras/${seg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: seg.ativo ? 0 : 1 })
      })
      fetchSeguradoras()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  async function addContact(segId) {
    if (!newContact.email.trim()) { toast.error('Email é obrigatório'); return }
    try {
      await authFetch(`/api/admin/seguradoras/${segId}/contatos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      })
      toast.success('Contato adicionado')
      setNewContact({ email: '', nome_contato: '', cargo: '' })
      setAddingContact(null)
      fetchSeguradoras()
    } catch {
      toast.error('Erro ao adicionar contato')
    }
  }

  async function toggleContactAtivo(segId, contatoId, currentAtivo) {
    try {
      await authFetch(`/api/admin/seguradoras/${segId}/contatos/${contatoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: currentAtivo ? 0 : 1 })
      })
      fetchSeguradoras()
    } catch {
      toast.error('Erro ao atualizar contato')
    }
  }

  async function deleteContact(segId, contatoId) {
    try {
      await authFetch(`/api/admin/seguradoras/${segId}/contatos/${contatoId}`, { method: 'DELETE' })
      toast.success('Contato removido')
      fetchSeguradoras()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Seguradoras</h1>
        <p className="text-xs text-white/30 mt-0.5">Gerencie contatos das seguradoras. Cadastre multiplos emails por Cia para envio automatico.</p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-sentinel/20 bg-sentinel/5 px-4 py-3">
        <p className="text-xs text-white/60">
          <span className="font-bold text-sentinel">Como funciona:</span> Cadastre um ou mais contatos por seguradora.
          Ao enviar uma cotacao, o email sera enviado para <strong className="text-white/80">todos os contatos ativos</strong> daquela Cia.
        </p>
      </div>

      {/* Seguradoras list */}
      <div className="space-y-3">
        {seguradoras.map(seg => {
          const isExpanded = expandedId === seg.id
          const activeContacts = (seg.contatos || []).filter(c => c.ativo)
          return (
            <div key={seg.id}
              className={`rounded-2xl border transition-all ${
                seg.ativo
                  ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'
                  : 'bg-white/[0.01] border-white/[0.04] opacity-60'
              }`}>
              {/* Header */}
              <div className="p-5 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : seg.id)}>
                <div className="flex items-center gap-4 min-w-0">
                  {LOGOS[seg.slug] ? (
                    <div className="w-28 h-10 flex items-center justify-start flex-shrink-0">
                      <img
                        src={LOGOS[seg.slug].src}
                        alt={seg.nome}
                        className={`max-h-8 max-w-[7rem] w-auto object-contain ${LOGOS[seg.slug].invert ? 'brightness-0 invert opacity-80' : 'opacity-90'}`}
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-10 flex items-center justify-start flex-shrink-0">
                      <span className="text-sm font-black text-white/80">{seg.nome}</span>
                    </div>
                  )}
                  {/* Contact count badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeContacts.length > 0 ? 'bg-sentinel/10 text-sentinel' : 'bg-white/5 text-white/20'
                  }`}>
                    {activeContacts.length} contato{activeContacts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleAtivo(seg) }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                      seg.ativo
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                    {seg.ativo ? 'Ativa' : 'Inativa'}
                  </button>
                  <svg className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded: contacts list */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Contatos de Email</h4>
                    <button onClick={() => setAddingContact(addingContact === seg.id ? null : seg.id)}
                      className="text-[10px] font-bold text-sentinel hover:text-sentinel/80 transition-colors">
                      + Adicionar Contato
                    </button>
                  </div>

                  {/* Add contact form */}
                  {addingContact === seg.id && (
                    <div className="mb-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="email" placeholder="email@seguradora.com" required
                          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
                          value={newContact.email} onChange={e => setNewContact(f => ({ ...f, email: e.target.value }))} />
                        <input placeholder="Nome do contato"
                          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
                          value={newContact.nome_contato} onChange={e => setNewContact(f => ({ ...f, nome_contato: e.target.value }))} />
                        <input placeholder="Cargo (opcional)"
                          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sentinel/30"
                          value={newContact.cargo} onChange={e => setNewContact(f => ({ ...f, cargo: e.target.value }))} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setAddingContact(null); setNewContact({ email: '', nome_contato: '', cargo: '' }) }}
                          className="px-3 py-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">Cancelar</button>
                        <button onClick={() => addContact(seg.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sentinel text-navy-dark hover:shadow-lg transition-all">Salvar</button>
                      </div>
                    </div>
                  )}

                  {/* Contacts list */}
                  {(seg.contatos || []).length === 0 ? (
                    <p className="text-xs text-white/20 italic py-3 text-center">Nenhum contato cadastrado</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(seg.contatos || []).map(contato => (
                        <div key={contato.id}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                            contato.ativo ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.03] opacity-50'
                          }`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${contato.ativo ? 'bg-emerald-400' : 'bg-white/15'}`} />
                            <div className="min-w-0">
                              <p className="text-xs text-white/80 font-medium truncate">{contato.email}</p>
                              <p className="text-[10px] text-white/25 truncate">
                                {contato.nome_contato || 'Sem nome'}{contato.cargo ? ` · ${contato.cargo}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => toggleContactAtivo(seg.id, contato.id, contato.ativo)}
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded transition-all ${
                                contato.ativo ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                              }`}>
                              {contato.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button onClick={() => deleteContact(seg.id, contato.id)}
                              className="text-white/10 hover:text-rose-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Phone info */}
                  {seg.telefone && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs text-white/40">{seg.telefone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
