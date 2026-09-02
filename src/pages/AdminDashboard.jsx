import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const GROUPS = [
  {
    title: 'Operação',
    description: 'Acompanhe o pipeline e trate as cotações em andamento.',
    items: [
      { to: '/dashboard', label: 'Dashboard operacional', detail: 'Indicadores, pipeline e atividade recente' },
      { to: '/admin/cotacoes-rapidas', label: 'Cotações rápidas', detail: 'Simulações, histórico e propostas' },
      { to: '/sla', label: 'SLA', detail: 'Prazos, pendências e alertas operacionais' },
    ],
  },
  {
    title: 'Configuração',
    description: 'Mantenha regras, seguradoras e inteligência do produto.',
    items: [
      { to: '/admin/cotacoes-rapidas/memoria', label: 'Memória da cotação', detail: 'Faixas, taxas, pisos e setores do motor' },
      { to: '/admin/seguradoras', label: 'Seguradoras', detail: 'Cadastro e condições das seguradoras' },
      { to: '/admin/icover', label: 'iCover IA', detail: 'Prompts e base de conhecimento' },
    ],
  },
  {
    title: 'Relacionamento',
    description: 'Organize comunicações, documentos e tarefas da equipe.',
    items: [
      { to: '/admin/central-envios', label: 'Central de envios', detail: 'Documentos e comunicações enviadas' },
      { to: '/admin/lembretes', label: 'Lembretes', detail: 'Ações pendentes e acompanhamento' },
    ],
  },
]

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-sentinel font-bold">Área restrita · Fairfield</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Painel administrativo</h1>
          <p className="text-sm text-white/40 mt-2">Tudo que a equipe administra, em um só lugar.</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/30">Sessão atual</p>
          <p className="text-xs font-semibold text-white/70 mt-1">{user?.name || user?.email || 'Administrador'}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {GROUPS.map(group => (
          <section key={group.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <div className="mb-4">
              <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-sentinel">{group.title}</h2>
              <p className="text-xs leading-relaxed text-white/35 mt-2">{group.description}</p>
            </div>
            <div className="space-y-2">
              {group.items.map(item => (
                <Link key={item.to} to={item.to} className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 hover:border-sentinel/30 hover:bg-sentinel/[0.06] transition-all">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white/80 group-hover:text-white">{item.label}</span>
                    <span className="block text-[11px] text-white/30 mt-1 leading-relaxed">{item.detail}</span>
                  </span>
                  <span className="text-lg text-white/20 group-hover:text-sentinel transition-colors" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-sentinel/15 bg-sentinel/[0.04] p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-sentinel font-bold">Regra de navegação</p>
        <p className="text-sm text-white/55 leading-relaxed mt-2 max-w-3xl">As funções administrativas ficam nesta central. O cliente acessa somente o painel próprio e a cotação rápida pela navegação principal.</p>
      </section>
    </div>
  )
}
