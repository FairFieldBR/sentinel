const TIPS_INTERNO = {
  0: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    title: 'Dados da empresa: a base de tudo',
    text: 'As seguradoras constroem o perfil de risco a partir dos dados cadastrais da sua empresa. Quanto mais precisas e completas as informações, mais confiante a seguradora fica para oferecer condições competitivas.',
    insight: 'Empresas que preenchem todos os campos recebem cotações até 30% mais competitivas do que perfis incompletos.',
    funFact: 'O Seguro de Crédito protege contra inadimplência — se seu comprador não pagar, a seguradora cobre até 90% do valor da perda.',
    importance: 'Setor de atividade e UF da empresa influenciam diretamente o apetite de risco de cada seguradora.'
  },
  1: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: 'Histórico de faturamento: a história que convence',
    text: 'Seu histórico de vendas e perdas revela como sua empresa gerencia riscos comerciais. Uma trajetória de crescimento com sinistralidade controlada é o perfil ideal para obter prêmios mais baixos e franquias menores.',
    insight: 'O faturamento desejado para o seguro define a base de cálculo do prêmio — informe o mais próximo da realidade para evitar sub ou super cobertura.',
    funFact: 'Empresas com sinistralidade abaixo de 3% do faturamento costumam ter descontos progressivos na renovação da apólice.',
    importance: 'Preencher os 3 anos de histórico é fundamental — seguradoras que analisam séries históricas oferecem condições 20% melhores.'
  },
  2: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    title: 'Carteira de recebíveis: o raio-X do seu risco',
    text: 'A distribuição da carteira por faixa de valor revela a concentração de risco. Uma carteira pulverizada — muitos clientes em faixas menores — é vista pelas seguradoras como mais segura e resulta em prêmios mais baixos.',
    insight: 'Preencha todas as faixas com valores reais, mesmo que pequenos. Dados incompletos levam a sub-cotação ou propostas mais conservadoras.',
    funFact: 'Recebíveis são o 2º maior ativo da maioria das empresas brasileiras, depois de imóveis — e o menos protegido.',
    importance: 'A concentração em poucos grandes clientes pode aumentar o prêmio em até 40%. Mostrar diversificação é estratégico.'
  },
  3: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    title: 'Transparência nas perdas: um ativo, não um passivo',
    text: 'Declarar perdas passadas não prejudica sua cotação — ao contrário. Omitir informações pode gerar problemas graves na hora do sinistro, inclusive recusa de pagamento. A seguradora avalia o padrão de comportamento, não eventos isolados.',
    insight: 'Mesmo sem perdas nos últimos 3 anos, preencha a seção — "zero perdas" é uma informação extremamente valiosa que melhora seu perfil.',
    funFact: 'No Brasil, 60% das empresas já tiveram pelo menos uma perda significativa por inadimplência nos últimos 5 anos.',
    importance: 'Seguradoras que identificam omissões na fase de subscrição podem invalidar a cobertura no momento do sinistro.'
  },
  4: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Atrasos: transparência gera confiança',
    text: 'Atrasos curtos e pontuais são absolutamente normais no mercado. O que preocupa seguradoras são atrasos longos e recorrentes. Detalhar os vencidos acima de 180 dias demonstra maturidade na gestão e profissionalismo.',
    insight: 'Títulos vencidos acima de 180 dias podem ser excluídos da cobertura desde o início — declarar agora evita surpresas na apólice.',
    funFact: 'O prazo médio de pagamento no Brasil é de 45 dias, um dos mais longos da América Latina — tornando o seguro ainda mais relevante.',
    importance: 'Detalhamento preciso dos atrasos permite que a seguradora construa uma cobertura sob medida, sem exclusões desnecessárias.'
  },
  5: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: 'Último passo — seus compradores definem o custo final',
    text: 'Cada seguradora possui bases globais de análise de crédito para verificar a saúde financeira dos seus compradores. Uma amostra diversificada — grandes, médios e pequenos clientes — permite limites mais generosos e prêmios mais precisos.',
    insight: 'Informe pelo menos 10 compradores para análise representativa. Quanto mais completo, mais competitiva será a cotação.',
    funFact: 'Após o envio, o SENTINEL consulta simultaneamente Coface, Atradius, AVLA, Allianz Trade, AIG, CESCE e CHUBB — sem custo para você.',
    importance: 'O CNPJ de cada comprador é obrigatório — ele permite a análise de crédito e define o limite aprovado para cada cliente.'
  }
}

const TIPS_EXTERNO = {
  0: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Exportar com segurança: dados que abrem mercados',
    text: 'O seguro de crédito à exportação protege contra riscos políticos e comerciais nos países de destino. Os dados da sua empresa são a base para uma cotação precisa e para ampliar seu acesso a mercados internacionais com segurança.',
    insight: 'O número de anos exportando e os mercados atendidos são fatores decisivos para as seguradoras internacionais.',
    funFact: 'Mais de 80% dos exportadores europeus utilizam seguro de crédito. No Brasil, apenas 15% — uma oportunidade enorme.',
    importance: 'Perfis exportadores bem documentados recebem propostas com cobertura de até 95% do valor da exportação.'
  },
  1: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Faturamento em dólar: a régua das seguradoras globais',
    text: 'O histórico de faturamento em US$ permite que as seguradoras internacionais avaliem seu porte exportador e consistência. Volume estável ou crescente resulta em condições mais favoráveis e prêmios menores.',
    insight: 'O prazo de venda impacta diretamente o prêmio — prazos mais longos significam mais risco, mas também podem ser negociados com cobertura específica.',
    funFact: 'Exportadores com seguro conseguem negociar prazos maiores com importadores, aumentando o volume de vendas em até 20%.',
    importance: 'Informe o faturamento dos últimos 3 anos em US$ — séries históricas completas aumentam a confiança da seguradora no perfil.'
  },
  2: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    title: 'Destinos exportados: cada mercado tem seu risco',
    text: 'Cada região do mundo tem um perfil de risco diferente avaliado pelas seguradoras. Europa e América do Norte são mercados estáveis, enquanto África e América Central podem ter prêmios maiores ou coberturas específicas.',
    insight: 'Distribuir percentuais precisos por região permite uma cobertura customizada — regiões em branco são tratadas como risco desconhecido.',
    funFact: 'Risco político — guerras, embargos, moratórias — é coberto exclusivamente pelo seguro de crédito à exportação.',
    importance: 'Concentração em 1 ou 2 países pode gerar sublimites de cobertura. Diversificação geográfica melhora os termos.'
  },
  3: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    title: 'Carteira internacional: diversificação é proteção',
    text: 'Uma carteira bem distribuída entre vários importadores e países reduz o risco de concentração, tornando sua apólice mais acessível. As seguradoras valorizam muito essa diversificação geográfica e por cliente.',
    insight: 'Preencha os valores em US$ em todas as faixas disponíveis — a seguradora precisa ver o tamanho real de cada exposição.',
    funFact: 'Empresas com mais de 20 importadores ativos em 3 ou mais países costumam obter os melhores termos de apólice disponíveis no mercado.',
    importance: 'Deixar faixas em branco faz a seguradora assumir o pior caso — preencher completo garante uma avaliação justa.'
  },
  4: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    title: 'Perdas internacionais: recuperar no exterior é caro',
    text: 'Recuperar valores no exterior é complexo, caro e demorado. As seguradoras analisam seu histórico para entender o nível de exposição real. Declarar perdas passadas é sinal de maturidade e transparência.',
    insight: 'Informe o país de cada perda — perdas em mercados desenvolvidos preocupam muito menos do que em mercados emergentes.',
    funFact: 'O custo médio de cobrança internacional pode chegar a 40% do valor da dívida — o seguro elimina completamente esse risco.',
    importance: 'Omitir perdas internacionais pode resultar em exclusão de cobertura para países ou clientes específicos.'
  },
  5: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Vencidos acima de 180 dias: transparência total',
    text: 'No comércio exterior, dívidas acima de 180 dias são consideradas de difícil recuperação. Declarar esses valores demonstra transparência e profissionalismo — e permite que a apólice seja estruturada sem exclusões surpresa.',
    insight: 'Mesmo sem vencidos, preencha com zero — a informação confirma uma carteira saudável e acelera a aprovação.',
    funFact: 'A média mundial de inadimplência no comércio exterior é de 2% a 3% do faturamento exportado — proteger-se é mais barato do que recuperar.',
    importance: 'Vencidos não declarados descobertos na sinistro podem inviabilizar o pagamento da indenização.'
  },
  6: {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: 'Último passo — seus importadores definem o custo',
    text: 'As seguradoras possuem bases de dados globais para verificar a saúde financeira dos seus importadores. O endereço completo e o código fiscal (Tax ID) são essenciais para identificação correta e aprovação de limites.',
    insight: 'Inclua o Tax ID (código fiscal) e o endereço completo — isso acelera a análise e melhora significativamente as condições oferecidas.',
    funFact: 'Após o envio, o SENTINEL consulta simultaneamente Coface, Atradius, AVLA, Allianz Trade, AIG, CESCE e CHUBB — sem custo para você.',
    importance: 'Uma amostra diversificada (grandes, médios e pequenos importadores) resulta em limites mais generosos e prêmios mais precisos.'
  }
}

function LearningCard({ tip, stepIndex, totalSteps }) {
  return (
    <div className="mb-5 rounded-xl border border-cobre/20 overflow-hidden shadow-sm">
      {/* Header com ícone e título */}
      <div className="bg-gradient-to-r from-navy to-[#0d1f3c] px-4 sm:px-5 py-3 flex items-center gap-3">
        <div className="text-cobre bg-cobre/20 rounded-lg p-1.5 flex-shrink-0">{tip.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-cobre uppercase tracking-widest">SENTINEL — Guia de Preenchimento</p>
          <h4 className="text-sm sm:text-base font-bold text-white leading-tight">{tip.title}</h4>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white px-4 sm:px-5 py-4 space-y-3">
        {/* Texto principal */}
        <p className="text-sm text-gray-700 leading-relaxed">{tip.text}</p>

        {/* Impacto no resultado */}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Impacto na proposta</p>
            <p className="text-xs text-amber-800">{tip.importance}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Dica prática */}
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-0.5">Dica prática</p>
              <p className="text-xs text-green-800">{tip.insight}</p>
            </div>
          </div>

          {/* Sabia que */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-0.5">Sabia que?</p>
              <p className="text-xs text-blue-800">{tip.funFact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LearningTrailInterno({ step }) {
  const tip = TIPS_INTERNO[step]
  if (!tip) return null
  return <LearningCard tip={tip} stepIndex={step} totalSteps={6} />
}

export function LearningTrailExterno({ step }) {
  const tip = TIPS_EXTERNO[step]
  if (!tip) return null
  return <LearningCard tip={tip} stepIndex={step} totalSteps={7} />
}
