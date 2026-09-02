import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function QuickQuoteMemory() {
  const { authFetch } = useAuth()
  const [config, setConfig] = useState(null)
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const response = await authFetch('/api/admin/quick-quotes/config')
      if (!response.sucesso) throw new Error(response.mensagem || 'Não foi possível carregar a memória')
      setConfig(response.data)
      setJson(JSON.stringify(response.data, null, 2))
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar memória')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function save(event) {
    event.preventDefault()
    let parsed
    try {
      parsed = JSON.parse(json)
    } catch {
      toast.error('JSON inválido')
      return
    }
    setSaving(true)
    try {
      const response = await authFetch('/api/admin/quick-quotes/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      if (!response.sucesso) throw new Error(response.mensagem || 'Não foi possível salvar a memória')
      setConfig(response.data)
      setJson(JSON.stringify(response.data, null, 2))
      toast.success('Memória da cotação rápida atualizada')
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar memória')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-sentinel font-bold">Administração Fairfield</div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Memória da cotação rápida</h1>
        <p className="text-sm text-white/35 mt-1">Ajuste premissas, faixas, setores e mínimos usados pelo motor. Cada cotação salva a versão aplicada.</p>
      </div>

      {loading ? <div className="py-24 text-center text-sm text-white/35">Carregando memória...</div> : (
        <form onSubmit={save} className="space-y-4">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-xs text-amber-100/70 leading-relaxed">
            Edite somente valores numéricos e estruturas válidas. Esta configuração altera novas prévias e recálculos; cotações já salvas preservam o resultado anterior.
          </div>
          <textarea
            value={json}
            onChange={event => setJson(event.target.value)}
            spellCheck="false"
            className="w-full min-h-[680px] rounded-2xl border border-white/[0.08] bg-[#071125] p-5 font-mono text-xs leading-relaxed text-white/80 outline-none focus:border-sentinel/50"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-white/25">Versão atual: {config?.version || '—'}</span>
            <button disabled={saving} className="px-5 py-3 rounded-xl bg-sentinel text-navy text-xs font-bold disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar memória'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
