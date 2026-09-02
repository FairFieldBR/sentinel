import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const EMPTY_MEMORY = { slug: '', title: '', category: 'geral', content: '', visibility: 'staff', source: 'Admin iCover', keywords: [] }

export default function IcoverAdmin() {
  const { authFetch } = useAuth()
  const [tab, setTab] = useState('prompt')
  const [prompts, setPrompts] = useState([])
  const [prompt, setPrompt] = useState(null)
  const [knowledge, setKnowledge] = useState([])
  const [memory, setMemory] = useState(EMPTY_MEMORY)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [promptsResponse, knowledgeResponse] = await Promise.all([
        authFetch('/api/v1/admin/icover/prompts'),
        authFetch('/api/v1/admin/icover/knowledge'),
      ])
      if (!promptsResponse.sucesso || !knowledgeResponse.sucesso) throw new Error('Não foi possível carregar a configuração do iCover')
      const promptList = promptsResponse.data || []
      setPrompts(promptList)
      setPrompt(promptList.find(item => item.active) || promptList[0] || null)
      setKnowledge(knowledgeResponse.data || [])
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function savePrompt() {
    if (!prompt) return
    setSaving(true)
    try {
      const response = await authFetch(`/api/v1/admin/icover/prompts/${prompt.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: prompt.name, system_prompt: prompt.system_prompt }),
      })
      if (!response.sucesso) throw new Error(response.mensagem || 'Erro ao salvar prompt')
      setPrompts(current => current.map(item => item.id === prompt.id ? response.data : item))
      setPrompt(response.data)
      toast.success('Prompt salvo')
    } catch (error) { toast.error(error.message || 'Erro ao salvar prompt') } finally { setSaving(false) }
  }

  async function activatePrompt(id) {
    try {
      const response = await authFetch(`/api/v1/admin/icover/prompts/${id}/activate`, { method: 'POST' })
      if (!response.sucesso) throw new Error(response.mensagem || 'Erro ao ativar prompt')
      await load()
      toast.success('Prompt ativo atualizado')
    } catch (error) { toast.error(error.message || 'Erro ao ativar prompt') }
  }

  async function saveMemory() {
    if (!memory.title || !memory.content) return toast.error('Título e conteúdo são obrigatórios')
    setSaving(true)
    try {
      const editing = Boolean(memory.id)
      const response = await authFetch(editing ? `/api/v1/admin/icover/knowledge/${memory.id}` : '/api/v1/admin/icover/knowledge', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory),
      })
      if (!response.sucesso) throw new Error(response.mensagem || 'Erro ao salvar memória')
      setKnowledge(current => editing ? current.map(item => item.id === memory.id ? response.data : item) : [response.data, ...current])
      setMemory(response.data)
      toast.success(editing ? 'Memória atualizada' : 'Memória criada')
    } catch (error) { toast.error(error.message || 'Erro ao salvar memória') } finally { setSaving(false) }
  }

  async function disableMemory(id) {
    try {
      const response = await authFetch(`/api/v1/admin/icover/knowledge/${id}`, { method: 'DELETE' })
      if (!response.sucesso) throw new Error(response.mensagem || 'Erro ao desativar memória')
      setKnowledge(current => current.map(item => item.id === id ? { ...item, active: 0 } : item))
      if (memory.id === id) setMemory(current => ({ ...current, active: 0 }))
      toast.success('Memória desativada')
    } catch (error) { toast.error(error.message || 'Erro ao desativar memória') }
  }

  const filteredKnowledge = knowledge.filter(item => {
    const term = search.toLowerCase().trim()
    return !term || `${item.title} ${item.category} ${item.content}`.toLowerCase().includes(term)
  })

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
    <div><div className="text-[10px] uppercase tracking-[0.25em] text-sentinel font-bold">Administração Fairfield</div><h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Configuração do iCover</h1><p className="text-sm text-white/35 mt-1">Edite as instruções e o conhecimento utilizado pela IA sem alterar código.</p></div>
    <div className="flex gap-2 border-b border-white/[0.07]"><button onClick={() => setTab('prompt')} className={`px-4 py-3 text-xs font-bold border-b-2 ${tab === 'prompt' ? 'text-sentinel border-sentinel' : 'text-white/35 border-transparent'}`}>Prompt do sistema</button><button onClick={() => setTab('knowledge')} className={`px-4 py-3 text-xs font-bold border-b-2 ${tab === 'knowledge' ? 'text-sentinel border-sentinel' : 'text-white/35 border-transparent'}`}>Memórias ({knowledge.filter(item => item.active).length})</button></div>
    {loading ? <div className="py-24 text-center text-sm text-white/35">Carregando configuração...</div> : tab === 'prompt' ? <PromptEditor prompt={prompt} prompts={prompts} setPrompt={setPrompt} onSave={savePrompt} onActivate={activatePrompt} saving={saving} /> : <KnowledgeEditor knowledge={filteredKnowledge} memory={memory} setMemory={setMemory} setSearch={setSearch} onNew={() => setMemory(EMPTY_MEMORY)} onSave={saveMemory} onDisable={disableMemory} saving={saving} />}
  </div>
}

function PromptEditor({ prompt, prompts, setPrompt, onSave, onActivate, saving }) {
  if (!prompt) return <EmptyState text="Nenhum prompt cadastrado." />
  return <div className="grid grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)] gap-5">
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden"><div className="p-4 border-b border-white/[0.06]"><h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Versões</h2><p className="text-[10px] text-white/25 mt-1">A conversa usa sempre a versão ativa.</p></div><div className="divide-y divide-white/[0.05]">{prompts.map(item => <button key={item.id} onClick={() => setPrompt(item)} className={`w-full text-left p-4 hover:bg-white/[0.04] ${prompt.id === item.id ? 'bg-sentinel/[0.08] border-l-2 border-sentinel' : ''}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-white/75">{item.name}</span>{item.active ? <span className="text-[9px] text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-1">Ativo</span> : null}</div><span className="text-[10px] text-white/30 block mt-1">{item.version}</span></button>)}</div></section>
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5"><div><h2 className="text-sm font-bold text-white/80">{prompt.name}</h2><p className="text-[10px] text-white/30 mt-1">Versão {prompt.version} · alterações valem para novas conversas.</p></div>{!prompt.active && <button onClick={() => onActivate(prompt.id)} className="self-start px-3 py-2 rounded-xl text-[11px] font-bold text-navy bg-sentinel hover:bg-sentinel-dark">Ativar versão</button>}</div><label className="block mb-4"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">Nome</span><input value={prompt.name} onChange={event => setPrompt({ ...prompt, name: event.target.value })} className="w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-sentinel/50" /></label><label className="block"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">Instruções do sistema</span><textarea value={prompt.system_prompt} onChange={event => setPrompt({ ...prompt, system_prompt: event.target.value })} rows={22} className="w-full rounded-xl bg-white/[0.045] border border-white/[0.08] p-4 text-sm leading-relaxed text-white/80 outline-none focus:border-sentinel/50 resize-y" /></label><div className="flex justify-end mt-4"><button onClick={onSave} disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-bold text-navy bg-sentinel hover:bg-sentinel-dark disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar prompt'}</button></div></section>
  </div>
}

function KnowledgeEditor({ knowledge, memory, setMemory, setSearch, onNew, onSave, onDisable, saving }) {
  return <div className="grid grid-cols-1 xl:grid-cols-[330px_minmax(0,1fr)] gap-5">
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden min-h-[620px]"><div className="p-4 border-b border-white/[0.06]"><div className="flex items-center justify-between mb-3"><h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Memórias</h2><button onClick={onNew} className="text-[10px] font-bold text-sentinel">+ Nova</button></div><input onChange={event => setSearch(event.target.value)} placeholder="Buscar memória..." className="w-full rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 py-2.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-sentinel/50" /></div><div className="divide-y divide-white/[0.05] max-h-[720px] overflow-y-auto">{knowledge.map(item => <button key={item.id} onClick={() => setMemory({ ...item, keywords: item.keywords || [] })} className={`w-full text-left p-4 hover:bg-white/[0.04] ${memory.id === item.id ? 'bg-sentinel/[0.08] border-l-2 border-sentinel' : ''}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold text-white/75">{item.title}</span>{!item.active && <span className="text-[9px] text-rose-300">Inativa</span>}</div><span className="text-[10px] text-white/30 block mt-1">{item.category} · {item.visibility}</span></button>)}</div></section>
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex items-start justify-between gap-3 mb-5"><div><h2 className="text-sm font-bold text-white/80">{memory.id ? 'Editar memória' : 'Nova memória'}</h2><p className="text-[10px] text-white/30 mt-1">Conteúdo recuperado pela IA antes de responder.</p></div>{memory.id && memory.active ? <button onClick={() => onDisable(memory.id)} className="text-[10px] font-bold text-rose-300 hover:text-rose-200">Desativar</button> : null}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Field label="Slug" value={memory.slug} disabled={Boolean(memory.id)} onChange={value => setMemory({ ...memory, slug: value })} /><Field label="Título" value={memory.title} onChange={value => setMemory({ ...memory, title: value })} /><Field label="Categoria" value={memory.category} onChange={value => setMemory({ ...memory, category: value })} /><Field label="Fonte" value={memory.source || ''} onChange={value => setMemory({ ...memory, source: value })} /><Select label="Visibilidade" value={memory.visibility} options={[['public', 'Público'], ['staff', 'Interno']]} onChange={value => setMemory({ ...memory, visibility: value })} /></div><label className="block mt-4"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">Conteúdo</span><textarea value={memory.content || ''} onChange={event => setMemory({ ...memory, content: event.target.value })} rows={19} className="w-full rounded-xl bg-white/[0.045] border border-white/[0.08] p-4 text-sm leading-relaxed text-white/80 outline-none focus:border-sentinel/50 resize-y" /></label><div className="flex justify-end mt-4"><button onClick={onSave} disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-bold text-navy bg-sentinel hover:bg-sentinel-dark disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar memória'}</button></div></section>
  </div>
}

function Field({ label, value, onChange, disabled = false }) { return <label className="block"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">{label}</span><input disabled={disabled} value={value || ''} onChange={event => onChange(event.target.value)} className="w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.08] disabled:opacity-40 px-3 text-sm text-white outline-none focus:border-sentinel/50" /></label> }
function Select({ label, value, options, onChange }) { return <label className="block"><span className="block text-[10px] uppercase tracking-wider font-bold text-white/35 mb-1.5">{label}</span><select value={value || ''} onChange={event => onChange(event.target.value)} className="w-full h-11 rounded-xl bg-white/[0.045] border border-white/[0.08] px-3 text-sm text-white outline-none focus:border-sentinel/50">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue} className="bg-navy">{optionLabel}</option>)}</select></label> }
function EmptyState({ text }) { return <div className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center text-sm text-white/35">{text}</div> }
