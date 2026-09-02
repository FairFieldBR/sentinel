export default function FourScoreSuggestion({ onContinue, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/80 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-labelledby="fourscore-title">
      <div className="w-full max-w-md rounded-2xl border border-sentinel/25 bg-[#0d1f3c] p-6 sm:p-7 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-sentinel font-bold">Próximo passo recomendado</p>
            <h2 id="fourscore-title" className="text-xl sm:text-2xl font-black text-white mt-2">Quer analisar seus compradores?</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-white/35 hover:text-white text-2xl leading-none">×</button>
        </div>
        <p className="text-sm text-white/60 leading-relaxed mt-5">O 4Score complementa sua cotação com análise de crédito, opinião e monitoramento dos seus clientes.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
          {['Score dos compradores', 'Opinião de crédito', 'Monitoramento contínuo'].map(item => <div key={item} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-[11px] text-white/65">{item}</div>)}
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-7">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/55 text-xs font-bold hover:text-white hover:border-white/20">Continuar sem análise</button>
          <button onClick={onContinue} className="flex-1 px-4 py-3 rounded-xl bg-sentinel text-navy text-xs font-bold hover:bg-sentinel-light">Conhecer o 4Score</button>
        </div>
      </div>
    </div>
  )
}
