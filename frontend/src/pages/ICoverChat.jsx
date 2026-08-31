import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../config'
import { MiniShield } from '../pages/Home'
/* ─── CSS Animations ─── */
const animationStyles = `
@keyframes typingDot {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
@keyframes pulseGreen {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
  50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes headphonePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(52,211,153,0); }
}
.msg-enter {
  animation: slideUp 0.3s ease-out forwards;
}
.typing-dot {
  animation: typingDot 1.4s ease-in-out infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
.pulse-green {
  animation: pulseGreen 2s infinite;
}
.headphone-pulse {
  animation: headphonePulse 2s infinite;
}
.fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
`

/* ─── Inline SVG Icons ─── */
function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function HeadphonesIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      {/* Head */}
      <circle cx="20" cy="12" r="6" fill="#7DD3FC" opacity="0.9" />
      {/* Body / Suit */}
      <path d="M8 36 C8 26 14 22 20 22 C26 22 32 26 32 36" fill="#7DD3FC" opacity="0.7" />
      {/* Tie */}
      <path d="M20 22 L18 28 L20 32 L22 28 Z" fill="#0a0f1e" opacity="0.8" />
      {/* Collar */}
      <path d="M15 22 L20 25 L25 22" stroke="#0a0f1e" strokeWidth="1" fill="none" opacity="0.6" />
    </svg>
  )
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-sentinel/20 border border-sentinel/30 flex items-center justify-center flex-shrink-0">
      <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="11" r="5" fill="#7DD3FC" opacity="0.8" />
        <path d="M10 34 C10 26 14 22 20 22 C26 22 30 26 30 34" fill="#7DD3FC" opacity="0.6" />
        <path d="M20 22 L18.5 27 L20 30 L21.5 27 Z" fill="#0a0f1e" opacity="0.7" />
      </svg>
    </div>
  )
}

/* ─── Knowledge Base ─── */
const KNOWLEDGE_BASE = [
  // ── Saudações ──
  {
    keywords: ['oi', 'ola', 'hey', 'eai', 'e ai', 'fala'],
    category: 'saudacao',
    answer: `Olá! 👋 Sou o **iCover**, especialista em **Seguro de Crédito**.\n\nPosso te ajudar com informações sobre coberturas, seguradoras, legislação, cálculos de prêmio e muito mais.\n\nSobre o que gostaria de saber?`
  },
  {
    keywords: ['bom dia', 'bom-dia'],
    category: 'saudacao',
    answer: `Bom dia! ☀️ Sou o **iCover**, sua IA especialista em **Seguro de Crédito**.\n\nComo posso te ajudar hoje?`
  },
  {
    keywords: ['boa tarde', 'boa-tarde'],
    category: 'saudacao',
    answer: `Boa tarde! Sou o **iCover**, pronto para te ajudar com qualquer dúvida sobre **Seguro de Crédito**.\n\nO que gostaria de saber?`
  },
  {
    keywords: ['boa noite', 'boa-noite'],
    category: 'saudacao',
    answer: `Boa noite! 🌙 Sou o **iCover**, especialista em **Seguro de Crédito**.\n\nEstou à disposição para tirar suas dúvidas. Como posso ajudar?`
  },
  {
    keywords: ['obrigado', 'obrigada', 'valeu', 'vlw', 'thanks', 'agradeco'],
    category: 'agradecimento',
    answer: `De nada! Fico feliz em ajudar. 😊\n\nSe tiver mais alguma dúvida sobre **Seguro de Crédito**, é só perguntar.\n\nVocê também pode **fazer uma cotação** clicando no botão "Fazer Cotação" acima.`
  },
  {
    keywords: ['tchau', 'ate mais', 'ate logo', 'flw', 'falou', 'bye'],
    category: 'despedida',
    answer: `Até logo! Foi um prazer ajudar. 🤝\n\nQuando precisar de informações sobre **Seguro de Crédito**, estarei aqui.\n\n**Dica:** Você pode iniciar uma cotação a qualquer momento pelo botão acima!`
  },

  // ── Identidade ──
  {
    keywords: ['quem e voce', 'quem voce e', 'o que voce e', 'o que e icover', 'icover'],
    category: 'identidade',
    answer: `Eu sou o **iCover** — a inteligência artificial mais completa do mercado brasileiro de **Seguro de Crédito**.\n\nFui desenvolvido pela **Fairfield** e faço parte da plataforma **SENTINEL**, especializada em seguros de crédito e garantia.\n\n**Minhas capacidades:**\n• Explicar todos os tipos de cobertura de crédito\n• Comparar seguradoras (Allianz Trade, Coface, Atradius, etc.)\n• Orientar sobre legislação (SUSEP, Decreto-Lei 73/1966)\n• Calcular estimativas de prêmio e PMI\n• Guiar no processo de contratação e sinistro\n\nPosso te ajudar com qualquer aspecto do Seguro de Crédito!`
  },
  {
    keywords: ['sentinel', 'plataforma', 'sistema'],
    category: 'identidade',
    answer: `O **SENTINEL** é a plataforma de inteligência em seguros da **Fairfield**.\n\n**Funcionalidades:**\n• Motor de subscrição inteligente para Seguro de Crédito\n• Cotação automatizada com múltiplas seguradoras\n• Análise de risco de compradores/devedores\n• Dashboard de gestão de apólices\n• IA especialista (eu, o iCover!) para orientação\n\nA plataforma conecta corretores, seguradoras e segurados em um ecossistema digital completo.`
  },
  {
    keywords: ['fairfield', 'empresa', 'corretora'],
    category: 'identidade',
    answer: `A **Fairfield** é uma corretora de seguros especializada em **Seguro de Crédito** e **Seguro Garantia**.\n\n**Diferenciais:**\n• Equipe com expertise em análise de crédito\n• Plataforma SENTINEL com IA integrada\n• Relacionamento com as principais seguradoras do mercado\n• Atendimento personalizado para cada perfil de empresa\n• Suporte completo: da cotação ao sinistro\n\nConheça mais entrando em contato com nossos especialistas!`
  },

  // ── Conceitos Fundamentais ──
  {
    keywords: ['o que e seguro de credito', 'seguro de credito', 'seguro credito', 'credit insurance'],
    category: 'conceito',
    answer: `O **Seguro de Crédito** é uma modalidade que protege empresas contra o risco de **inadimplência** de seus compradores (devedores).\n\n**Como funciona:**\n1. A empresa (segurada) vende a prazo para seus clientes\n2. A seguradora analisa e aprova **limites de crédito** para cada comprador\n3. Se o comprador não pagar, a seguradora **indeniza** a empresa\n\n**Estrutura da apólice:**\n| Parte | Papel |\n|-------|-------|\n| **Segurado** | Empresa que vende a prazo (credor) |\n| **Seguradora** | Assume o risco de inadimplência |\n| **Devedor** | Comprador que pode não pagar |\n\n**Coberturas principais:**\n• **Insolvência** do devedor (falência, recuperação judicial)\n• **Mora prolongada** (atraso superior a 150-180 dias)\n• **Risco político** (em operações de exportação)\n\nO seguro de crédito é regulamentado pela **SUSEP** nos ramos **0171** (interno) e **0172** (exportação).`
  },
  {
    keywords: ['diferenca seguro garantia', 'garantia vs credito', 'seguro garantia', 'diferenca garantia', 'garantia mesma coisa', 'garantia igual credito', 'seguro garantia mesma coisa'],
    category: 'conceito',
    answer: `**Seguro de Crédito vs Seguro Garantia** — são produtos bem diferentes:\n\n| Aspecto | Seguro de Crédito | Seguro Garantia |\n|---------|-------------------|------------------|\n| **Protege** | O vendedor (credor) | O contratante/beneficiário |\n| **Risco** | Inadimplência do comprador | Descumprimento contratual |\n| **Tomador** | Quem vende a prazo | Quem tem obrigação contratual |\n| **Apólice** | Global (múltiplos compradores) | Individual (por contrato) |\n| **Ramo SUSEP** | 0171 / 0172 | 0775 |\n| **Indenização** | % do valor da venda | Valor da garantia |\n\n**Seguro de Crédito:** Protege seu faturamento contra calotes.\n**Seguro Garantia:** Garante o cumprimento de um contrato.\n\nAmbos são importantes ferramentas de gestão de risco, mas atendem necessidades distintas.`
  },
  {
    keywords: ['diferenca factoring', 'factoring', 'antecipacao', 'desconto duplicata', 'diferenca antecipacao'],
    category: 'conceito',
    answer: `**Seguro de Crédito vs Factoring/Antecipação** — são instrumentos diferentes:\n\n| Aspecto | Seguro de Crédito | Factoring/Antecipação |\n|---------|-------------------|-----------------------|\n| **Natureza** | Proteção (seguro) | Financiamento |\n| **Objetivo** | Proteger contra inadimplência | Antecipar recebíveis |\n| **Custo** | Prêmio de seguro (0,1% a 0,5%) | Deságio (1% a 5% ao mês) |\n| **Propriedade** | Crédito continua com a empresa | Crédito é cedido ao fator |\n| **Regulação** | SUSEP | Banco Central |\n| **Cobrança** | Seguradora cobra o devedor | Fator cobra o devedor |\n\n**Vantagem do Seguro de Crédito:**\n• Custo muito menor que factoring\n• Mantém o relacionamento com o cliente\n• Inclui análise de crédito dos compradores\n• Serviço de cobrança especializada\n\nMuitas empresas usam **ambos**: seguro de crédito para proteção + factoring para liquidez.`
  },
  {
    keywords: ['estrutura apolice', 'partes', 'segurado', 'devedor', 'credor'],
    category: 'conceito',
    answer: `**Estrutura da Apólice de Seguro de Crédito:**\n\n**3 partes envolvidas:**\n\n1. **Segurado (Credor)**\n   • Empresa que vende a prazo\n   • Contrata e paga o seguro\n   • Recebe a indenização em caso de sinistro\n\n2. **Seguradora**\n   • Analisa o risco dos compradores\n   • Define limites de crédito\n   • Paga a indenização\n   • Faz cobrança ao devedor inadimplente\n\n3. **Devedor (Comprador)**\n   • Cliente do segurado\n   • Não participa do contrato de seguro\n   • É analisado pela seguradora\n\n**Elementos da apólice:**\n• Limite de crédito por devedor\n• PMI (Percentual Máximo de Indenização)\n• POS (Participação Obrigatória do Segurado)\n• Franquia / AAD\n• Prazo máximo de pagamento coberto\n• Setores e geografias cobertas`
  },
  {
    keywords: ['quem pode contratar', 'quem contrata', 'perfil', 'para quem', 'minha empresa'],
    category: 'conceito',
    answer: `**Quem pode contratar Seguro de Crédito?**\n\nQualquer empresa que **vende a prazo** para outras empresas (B2B).\n\n**Perfil ideal:**\n• Empresas com faturamento a partir de **R$ 5 milhões/ano**\n• Vendem para **múltiplos compradores**\n• Prazo de pagamento de **30 a 180 dias**\n• Setores: indústria, comércio atacadista, serviços B2B\n\n**Setores que mais contratam:**\n• Químico e petroquímico\n• Alimentos e bebidas\n• Têxtil e confecções\n• Metalúrgico e siderúrgico\n• Papel e celulose\n• Eletrônicos e tecnologia\n• Agronegócio\n\n**Não se aplica a:**\n• Vendas para pessoa física (B2C)\n• Vendas à vista\n• Vendas para o governo (nesse caso, Seguro Garantia)\n\n**Prêmio mínimo** geralmente a partir de **R$ 15.000 a R$ 30.000/ano**.`
  },

  // ── Tipos de Cobertura ──
  {
    keywords: ['credito interno', 'ramo 0171', 'domestico', 'mercado interno'],
    category: 'cobertura',
    answer: `**Seguro de Crédito Interno (Ramo SUSEP 0171)**\n\nProtege vendas a prazo realizadas **dentro do Brasil**.\n\n**Características:**\n• Cobre vendas B2B no mercado doméstico\n• Compradores devem ser **pessoas jurídicas brasileiras**\n• PMI: geralmente **85% a 90%**\n• Prazo máximo de pagamento: até **180 dias**\n• IOF: **0%** (seguro de crédito é isento)\n\n**Coberturas:**\n• Insolvência (falência, recuperação judicial/extrajudicial)\n• Mora prolongada (atraso > 150-180 dias)\n\n**Documentação necessária:**\n• Balanço dos últimos 3 anos\n• Relação de compradores com limites desejados\n• Histórico de inadimplência\n• Projeção de vendas a prazo\n\n**Taxa média:** 0,15% a 0,40% do faturamento segurado.`
  },
  {
    keywords: ['credito exportacao', 'exportacao', 'ramo 0172', 'export credit'],
    category: 'cobertura',
    answer: `**Seguro de Crédito à Exportação (Ramo SUSEP 0172)**\n\nProtege vendas a prazo para **compradores no exterior**.\n\n**Características:**\n• Cobre vendas internacionais\n• Compradores em qualquer país (análise de risco-país)\n• PMI: geralmente **90%** (maior que interno)\n• IOF: **0%** (exportação é isenta)\n\n**Coberturas adicionais:**\n• **Risco Comercial:** Insolvência e mora do comprador estrangeiro\n• **Risco Político:** Moratória, restrição cambial, guerra, embargo\n• **Risco de fabricação:** Cancelamento antes do embarque\n\n**Seguradoras especializadas em exportação:**\n• Allianz Trade (maior do mundo)\n• Coface (forte em mercados emergentes)\n• Atradius (Europa e Américas)\n• CESCE (foco ibero-americano)\n\n**Vantagens extras:**\n• Acesso a informações de compradores internacionais\n• Cobrança internacional especializada\n• Melhora condições de financiamento à exportação (BNDES Exim, ACC/ACE)`
  },
  {
    keywords: ['risco politico', 'political risk', 'risco pais', 'moratoria'],
    category: 'cobertura',
    answer: `**Risco Político no Seguro de Crédito**\n\nCobertura específica para **exportações**, protegendo contra eventos causados por governos estrangeiros.\n\n**Eventos cobertos:**\n• **Moratória:** País decreta suspensão de pagamentos\n• **Restrição cambial:** Impossibilidade de converter moeda\n• **Expropriação:** Governo confisca bens do comprador\n• **Guerra e revolução:** Conflito armado que impeça pagamento\n• **Embargo comercial:** Sanções que bloqueiem a operação\n• **Inconvertibilidade:** Moeda local não pode ser convertida\n\n**Como funciona:**\n• A seguradora avalia o **rating do país** destino\n• Países de alto risco podem ter coberturas limitadas\n• PMI para risco político: geralmente **90% a 95%**\n• Prazo de espera: **180 dias** após o evento\n\n**Seguradoras com expertise em risco político:**\n• AIG (líder em political risk)\n• Allianz Trade\n• Coface (classificação DRA por país)\n• Atradius\n\n**Importante:** Risco político é **adicional** ao risco comercial na apólice de exportação.`
  },
  {
    keywords: ['single risk', 'single buyer', 'risco unico', 'um comprador'],
    category: 'cobertura',
    answer: `**Single Risk / Single Buyer**\n\nCobertura para uma **única transação** ou um **único comprador**.\n\n**Quando usar:**\n• Venda pontual de alto valor\n• Concentração de risco em um comprador\n• Operação específica de exportação\n• Licitação ou contrato grande\n\n**Características:**\n• Apólice individual (não global)\n• Período: duração da operação\n• Análise focada no devedor específico\n• PMI: pode chegar a **90-95%**\n• Prêmio: % sobre o valor da operação\n\n**Vantagens:**\n• Flexibilidade — contrata só quando precisa\n• Sem prêmio mínimo anual\n• Ideal para operações esporádicas\n\n**Desvantagens:**\n• Custo unitário mais alto que apólice global\n• Sem benefício de diversificação\n• Cada operação requer nova análise\n\n**Taxa:** 0,3% a 1,5% do valor da operação, dependendo do risco.`
  },
  {
    keywords: ['whole turnover', 'apolice global', 'carteira inteira', 'turnover'],
    category: 'cobertura',
    answer: `**Whole Turnover (Apólice Global)**\n\nCobre **toda a carteira** de vendas a prazo da empresa.\n\n**Como funciona:**\n• A empresa segura **100% do faturamento** a prazo\n• Todos os compradores são incluídos\n• Limite de crédito é solicitado para cada devedor\n• Existe um **limite discricionário** para compradores pequenos\n\n**Características:**\n| Item | Detalhe |\n|------|--------|\n| Cobertura | Toda a carteira B2B |\n| PMI | 85% a 90% |\n| POS | 10% a 15% |\n| Franquia/AAD | Sim, geralmente |\n| Bonus/Malus | Sim |\n| Prêmio | % sobre faturamento real |\n\n**Vantagens:**\n• **Menor custo** por real segurado\n• Análise de crédito de todos os compradores\n• Gestão integrada do risco de crédito\n• Histórico gera **bônus** nos anos seguintes\n\n**Ideal para:**\n• Empresas com carteira diversificada\n• Faturamento acima de R$ 20 milhões/ano\n• Muitos compradores diferentes\n\nÉ a modalidade **mais contratada** no mercado brasileiro.`
  },
  {
    keywords: ['key buyer', 'compradores nomeados', 'nomeados', 'named buyer', 'segurar maiores clientes', 'poucos compradores', 'escolher quais segurar'],
    category: 'cobertura',
    answer: `**Key Buyer (Compradores Nomeados)**\n\nCobre apenas **compradores específicos** selecionados pela empresa.\n\n**Como funciona:**\n• A empresa escolhe quais compradores quer segurar\n• Geralmente os **maiores** ou **mais arriscados**\n• Cada comprador nomeado tem limite de crédito individual\n\n**Diferença para Whole Turnover:**\n| Aspecto | Key Buyer | Whole Turnover |\n|---------|-----------|----------------|\n| Cobertura | Compradores selecionados | Toda a carteira |\n| Flexibilidade | Escolhe quem segurar | Cobre todos |\n| Custo | Maior por comprador | Menor (diluição) |\n| Anti-seleção | Risco maior | Menor risco |\n| AAD/Franquia | Raramente | Comum |\n\n**Vantagens:**\n• Protege os maiores riscos\n• Custo total menor (segura menos compradores)\n• Mais simples de gerenciar\n\n**Desvantagens:**\n• Taxa unitária mais alta\n• Seguradora pode recusar compradores de alto risco\n• Sem benefício de diversificação\n\n**Ideal para:** Empresas com **poucos grandes compradores** que representam parte significativa do faturamento.`
  },
  {
    keywords: ['excess of loss', 'excesso de danos', 'xl', 'excess loss'],
    category: 'cobertura',
    answer: `**Excess of Loss (Excesso de Danos)**\n\nA empresa assume as **primeiras perdas** e a seguradora cobre o que exceder.\n\n**Como funciona:**\n• Define-se um **AAD (Annual Aggregate Deductible)** — franquia anual\n• Perdas até o AAD: empresa assume sozinha\n• Perdas acima do AAD: seguradora indeniza\n\n**Exemplo:**\n• AAD: R$ 500.000\n• Perda total no ano: R$ 2.000.000\n• Empresa paga: R$ 500.000\n• Seguradora paga: R$ 1.500.000\n\n**Características:**\n• Prêmio **significativamente menor** que Whole Turnover\n• Ideal para empresas com boa gestão de crédito interna\n• A empresa retém as perdas "normais"\n• Seguradora cobre as perdas "catastróficas"\n\n**Vantagens:**\n• Menor custo de prêmio\n• Empresa mantém disciplina de crédito\n• Proteção contra perdas inesperadas\n\n**Ideal para:** Empresas grandes com departamento de crédito estruturado e histórico de baixa sinistralidade.`
  },
  {
    keywords: ['top up', 'top-up', 'cover complementar', 'complementar'],
    category: 'cobertura',
    answer: `**Top-Up Cover (Cobertura Complementar)**\n\nCobertura **adicional** acima do limite aprovado pela seguradora principal.\n\n**Quando usar:**\n• A seguradora principal aprovou R$ 1 milhão para um comprador\n• Você precisa de R$ 2 milhões de cobertura\n• O Top-Up cobre os R$ 1 milhão excedentes\n\n**Como funciona:**\n• Complementa a apólice principal\n• Entra em vigor quando o limite principal é excedido\n• Geralmente contratado com **outra seguradora**\n\n**Características:**\n• Prêmio maior que a cobertura principal\n• PMI pode ser menor (70% a 80%)\n• Requer aprovação de ambas as seguradoras\n• Não é ofertado por todas as seguradoras\n\n**Seguradoras que oferecem Top-Up:**\n• Allianz Trade\n• Coface\n• Atradius\n\n**Ideal para:** Situações onde o limite de crédito aprovado é insuficiente para a exposição real ao comprador.`
  },
  {
    keywords: ['domestico internacional', 'interno exportacao', 'diferenca interno exportacao'],
    category: 'cobertura',
    answer: `**Crédito Doméstico vs Internacional**\n\n| Aspecto | Doméstico (0171) | Internacional (0172) |\n|---------|------------------|---------------------|\n| **Compradores** | Brasileiros | Estrangeiros |\n| **Moeda** | BRL | USD, EUR, etc. |\n| **PMI** | 85-90% | 90-95% |\n| **IOF** | 0% | 0% |\n| **Risco Político** | Não | Sim (adicional) |\n| **Mora** | 150-180 dias | 150-180 dias |\n| **Cobrança** | Nacional | Internacional |\n| **Taxa média** | 0,15-0,40% | 0,20-0,60% |\n| **Informações** | Serasa/SPC | Bases internacionais |\n\n**Pode combinar ambos na mesma apólice?**\nSim! A maioria das seguradoras oferece apólice **mista** cobrindo vendas domésticas e de exportação.\n\n**Dica:** Para exportadoras, o seguro de crédito facilita o acesso a linhas de financiamento como **BNDES Exim**, **ACC** e **ACE**.`
  },

  // ── Termos Técnicos ──
  {
    keywords: ['pmi', 'percentual maximo', 'maximo indenizacao'],
    category: 'tecnico',
    answer: `**PMI — Percentual Máximo de Indenização**\n\nÉ o **percentual máximo** que a seguradora paga sobre o valor do sinistro.\n\n**Faixas comuns:**\n| Tipo | PMI |\n|------|-----|\n| Crédito Interno | 85% a 90% |\n| Crédito Exportação | 90% a 95% |\n| Risco Político | 90% a 95% |\n| Single Risk | 85% a 95% |\n\n**Exemplo:**\n• Venda não paga: R$ 1.000.000\n• PMI: 85%\n• Indenização: **R$ 850.000**\n• Empresa absorve: R$ 150.000\n\n**Por que não é 100%?**\n• Evita **risco moral** (empresa relaxar na análise de crédito)\n• A empresa mantém "skin in the game"\n• Quanto maior o PMI, maior o prêmio\n\n**Negociação:**\n• PMI é negociável na contratação\n• Histórico de sinistralidade baixo = PMI mais alto\n• Carteira diversificada = PMI mais favorável`
  },
  {
    keywords: ['pos', 'participacao obrigatoria', 'retencao segurado'],
    category: 'tecnico',
    answer: `**POS — Participação Obrigatória do Segurado**\n\nÉ o **percentual que o segurado deve reter** de cada sinistro. É o complemento do PMI.\n\n**Faixas comuns:**\n• Crédito Interno: **10% a 15%**\n• Crédito Exportação: **5% a 10%**\n• Excess of Loss: **0% acima do AAD**\n\n**Relação PMI x POS:**\n• PMI 85% → POS 15%\n• PMI 90% → POS 10%\n• PMI 95% → POS 5%\n\n**Objetivo:**\n• Alinhar interesses: segurado mantém prudência\n• Prevenir risco moral\n• Incentivar boa gestão de crédito\n\n**Diferente de franquia:**\n• POS: percentual de **cada** sinistro\n• Franquia/AAD: valor **agregado** no ano\n\nA POS pode ser combinada com a franquia/AAD, dependendo da estrutura da apólice.`
  },
  {
    keywords: ['franquia', 'aad', 'annual aggregate', 'deductible', 'dedutivel'],
    category: 'tecnico',
    answer: `**Franquia / AAD (Annual Aggregate Deductible)**\n\nValor **acumulado de perdas** que o segurado absorve no ano antes de acionar o seguro.\n\n**Como funciona:**\n• AAD = R$ 200.000\n• Perdas acumuladas no ano: R$ 500.000\n• Segurado paga: R$ 200.000 (AAD)\n• Seguradora paga: R$ 300.000 × PMI\n\n**Tipos:**\n| Tipo | Descrição |\n|------|----------|\n| **AAD** | Franquia anual agregada |\n| **Franquia por sinistro** | Valor mínimo por evento |\n| **First Loss** | Primeiras perdas até X% |\n\n**Impacto no prêmio:**\n• AAD **maior** → prêmio **menor**\n• AAD zero → prêmio **maior**\n• É uma forma de "self-insurance"\n\n**Dica de negociação:**\nEmpresa com boa sinistralidade pode aceitar AAD mais alto em troca de prêmio menor. É a lógica do **Excess of Loss**.`
  },
  {
    keywords: ['limite credito', 'credit limit', 'limite aprovado', 'limite comprador'],
    category: 'tecnico',
    answer: `**Limite de Crédito (Credit Limit)**\n\nValor máximo de **exposição coberta** por comprador/devedor.\n\n**Como funciona:**\n1. Segurado solicita limite para cada comprador\n2. Seguradora analisa o devedor (balanço, comportamento, setor)\n3. Seguradora aprova, reduz ou recusa o limite\n\n**Tipos de limite:**\n• **Limite nomeado:** Aprovado individualmente pela seguradora\n• **Limite discricionário:** Valor automático sem análise individual\n\n**Exemplo:**\n• Limite aprovado para Comprador A: R$ 500.000\n• Exposição atual: R$ 400.000\n• Margem disponível: R$ 100.000\n\n**Limite discricionário:**\n• Geralmente R$ 20.000 a R$ 100.000\n• Não precisa de aprovação prévia\n• Condição: devedor sem registro negativo\n• Coberto pelo seguro normalmente\n\n**Importante:**\n• Vendas **acima do limite** não são cobertas\n• Limites podem ser **reduzidos ou cancelados** pela seguradora\n• Segurado recebe aviso e pode solicitar reconsideração`
  },
  {
    keywords: ['limite discricionario', 'discretionary', 'automatico', 'sem aprovacao'],
    category: 'tecnico',
    answer: `**Limite Discricionário (Discretionary Limit)**\n\nLimite de crédito **automático** que o segurado pode usar sem aprovação prévia da seguradora.\n\n**Características:**\n• Valor fixo (ex: R$ 30.000 a R$ 100.000 por comprador)\n• Não requer solicitação à seguradora\n• Válido para qualquer devedor que atenda aos critérios\n\n**Critérios para usar:**\n• Devedor sem registros negativos (Serasa/SPC)\n• Dentro do prazo máximo de pagamento\n• Devedor ativo há mais de X meses\n• Sem histórico de atraso\n\n**Vantagens:**\n• Agilidade para vender a novos clientes\n• Reduz burocracia de análise\n• Cobre compradores pequenos automaticamente\n\n**Atenção:**\n• Se o devedor tiver restrição, o limite discricionário **não se aplica**\n• O segurado é responsável por verificar a situação do devedor\n• Não substitui a análise para grandes compradores\n\n**Faixa comum:** R$ 20.000 a R$ 100.000 por devedor.`
  },
  {
    keywords: ['mora prolongada', 'protracted default', 'atraso', 'inadimplencia', 'mora'],
    category: 'tecnico',
    answer: `**Mora Prolongada (Protracted Default)**\n\nQuando o devedor **atrasa o pagamento** além de um prazo definido na apólice, sem declarar insolvência.\n\n**Prazos típicos:**\n• **150 dias** de atraso → mora prolongada (mais comum)\n• **180 dias** de atraso → em algumas apólices\n• Contados a partir do **vencimento original** da fatura\n\n**Processo:**\n1. Fatura vence e devedor não paga\n2. Segurado notifica a seguradora (prazo: 30-60 dias do vencimento)\n3. Seguradora pode iniciar cobrança\n4. Após 150-180 dias: caracteriza-se a **mora prolongada**\n5. Indenização é calculada e paga\n\n**Diferente de insolvência:**\n| Mora Prolongada | Insolvência |\n|-----------------|-------------|\n| Devedor apenas não paga | Devedor quebra (falência/RJ) |\n| Pode voltar a pagar | Processo judicial |\n| 150-180 dias de atraso | Decreto judicial |\n| Mais frequente | Mais grave |\n\n**Importante:** O segurado deve **notificar** o atraso dentro do prazo da apólice, senão pode perder o direito à indenização.`
  },
  {
    keywords: ['insolvencia', 'falencia', 'recuperacao judicial', 'bankruptcy', 'falencia comprador', 'comprador faliu', 'devedor faliu', 'quebrou'],
    category: 'tecnico',
    answer: `**Insolvência no Seguro de Crédito**\n\nCobertura acionada quando o devedor entra em **processo formal de insolvência**.\n\n**Eventos de insolvência:**\n• **Falência** decretada judicialmente\n• **Recuperação Judicial** deferida (Lei 11.101/2005)\n• **Recuperação Extrajudicial** homologada\n• **Liquidação extrajudicial** (se aplicável)\n\n**Processo de sinistro:**\n1. Devedor entra em recuperação judicial ou falência\n2. Segurado notifica a seguradora imediatamente\n3. Seguradora verifica os créditos no processo\n4. Indenização é paga em **30 a 60 dias** após confirmação\n5. Seguradora se sub-roga nos direitos do segurado\n\n**Sub-rogação:**\n• A seguradora assume o direito de cobrar o devedor\n• Participa do processo de RJ/falência\n• Valores recuperados são divididos pro-rata\n\n**Importante:**\n• Créditos devem estar **habilitados** no processo\n• Documentação comprobatória é essencial (NFs, duplicatas)\n• Prazo de notificação é rigoroso`
  },
  {
    keywords: ['waiting period', 'periodo espera', 'carencia'],
    category: 'tecnico',
    answer: `**Período de Espera (Waiting Period)**\n\nPrazo entre a **comunicação do sinistro** e o **pagamento da indenização**.\n\n**Prazos típicos:**\n| Tipo de Sinistro | Período de Espera |\n|-----------------|-------------------|\n| Mora Prolongada | 30 a 60 dias após 150/180 dias |\n| Insolvência | 30 dias após confirmação |\n| Risco Político | 180 dias após o evento |\n\n**Finalidade:**\n• Permitir tentativas de cobrança\n• Verificar documentação\n• Confirmar que a perda é definitiva\n\n**Não confundir com:**\n• **Prazo de mora:** 150-180 dias de atraso\n• **Prazo de notificação:** Quando o segurado deve avisar\n• **Carência da apólice:** Período inicial sem cobertura (raro)\n\nAlgumas seguradoras oferecem **pagamento antecipado** mediante solicitação, descontando um percentual.`
  },
  {
    keywords: ['nql', 'nml', 'non qualifying', 'perda nao qualificada', 'nao coberto', 'sinistro negado', 'perda nao coberta'],
    category: 'tecnico',
    answer: `**NQL / NML — Non-Qualifying Loss (Perda Não Qualificada)**\n\nSinistro que **não atende aos critérios** de cobertura da apólice.\n\n**Motivos comuns de NQL:**\n• Venda acima do **limite de crédito** aprovado\n• Falta de **notificação** dentro do prazo\n• Devedor com limite **cancelado** antes da venda\n• Operação fora do **escopo** da apólice\n• Documentação insuficiente (sem NF, contrato, etc.)\n• Disputa comercial (devedor alega defeito no produto)\n• Venda para **parte relacionada** (empresa do grupo)\n\n**Como evitar NQL:**\n• Respeitar os limites de crédito aprovados\n• Notificar atrasos dentro do prazo (30-60 dias)\n• Manter documentação organizada\n• Monitorar avisos de cancelamento de limite\n• Verificar cobertura antes de vendas atípicas\n\n**Importante:** A disputa comercial é a principal causa de NQL. Se o devedor contesta a dívida, a seguradora pode não indenizar até que a disputa seja resolvida.`
  },
  {
    keywords: ['mcl', 'maximum credit', 'limite maximo'],
    category: 'tecnico',
    answer: `**MCL — Maximum Credit Limit**\n\nO **maior limite de crédito** que a seguradora aceita para um único devedor.\n\n**Fatores que determinam o MCL:**\n• Porte da seguradora\n• Rating do devedor\n• Setor de atuação\n• País (para exportação)\n• Garantias oferecidas\n\n**Valores de referência:**\n• Pequenos devedores: até R$ 500 mil\n• Médios: R$ 500 mil a R$ 5 milhões\n• Grandes: R$ 5 milhões a R$ 50 milhões\n• Corporativos: acima de R$ 50 milhões\n\nQuando o MCL de uma seguradora é insuficiente, pode-se usar **Top-Up Cover** com outra seguradora para complementar.`
  },

  // ── Seguradoras ──
  {
    keywords: ['allianz trade', 'allianz', 'euler hermes', 'eolis'],
    category: 'seguradora',
    answer: `**Allianz Trade** (antiga Euler Hermes)\n\n🏢 **Líder global** em Seguro de Crédito.\n\n**Números:**\n• Presente em **52 países**\n• Mais de **83.000 clientes** no mundo\n• Base de dados com **80+ milhões de empresas**\n• Rating: **AA** (S&P)\n\n**Plataforma:** EOLIS\n• Consulta de limites de crédito online\n• Monitoramento de compradores em tempo real\n• Solicitação e aprovação digital de limites\n\n**Diferenciais no Brasil:**\n• Maior base de dados de empresas brasileiras\n• Aprovação de limites em **24-48 horas**\n• Cobrança especializada nacional e internacional\n• Apólice para PMEs e grandes empresas\n\n**Produtos:**\n• Whole Turnover\n• Key Buyer\n• Single Risk\n• Top-Up\n• Excess of Loss\n\n**Ideal para:** Empresas de todos os portes, especialmente exportadoras com compradores em múltiplos países.`
  },
  {
    keywords: ['coface', 'dra', 'cofanet'],
    category: 'seguradora',
    answer: `**Coface**\n\n🏢 Seguradora francesa, **top 3 global** em Seguro de Crédito.\n\n**Números:**\n• Presente em **100 países** (escritórios em 57)\n• Base de dados: **200+ milhões de empresas**\n• Rating: **AA-** (Fitch)\n\n**Diferencial — Rating DRA:**\n• **DRA (Debtor Risk Assessment):** Classificação proprietária de risco\n• Escala de **1 (baixo risco)** a **10 (alto risco)**\n• Atualizado continuamente\n• Disponível via plataforma CofaNet\n\n**Plataforma:** CofaNet\n• Gestão online da apólice\n• Consulta de ratings DRA\n• Solicitação de limites\n• Notificação de sinistros\n\n**Produtos no Brasil:**\n• TradeLiner (Whole Turnover)\n• EasyLiner (PMEs)\n• Single Risk\n• Top-Up\n\n**Ideal para:** Empresas que valorizam informação de crédito e análise de risco detalhada.`
  },
  {
    keywords: ['atradius', 'collections', 'modula'],
    category: 'seguradora',
    answer: `**Atradius**\n\n🏢 Seguradora holandesa, **top 3 global** em Seguro de Crédito.\n\n**Números:**\n• Presente em **50+ países**\n• Faturamento: €2+ bilhões\n• Rating: **A** (A.M. Best)\n\n**Diferencial — Atradius Collections:**\n• Serviço de **cobrança internacional** líder\n• Presente em **96 países**\n• Cobrança amigável e judicial\n• Pode ser contratado separadamente do seguro\n\n**Plataforma:** Modula (Atradius Modula)\n• Apólice modular — escolha os módulos que precisa\n• Gestão online completa\n• Integração com ERPs\n\n**Produtos no Brasil:**\n• Modula (modular, flexível)\n• Whole Turnover\n• Key Buyer\n• Single Risk\n• Collections (cobrança)\n\n**Ideal para:** Empresas que precisam de cobrança internacional robusta e flexibilidade na apólice.`
  },
  {
    keywords: ['cesce', 'ibero', 'pme', 'pequena empresa'],
    category: 'seguradora',
    answer: `**CESCE**\n\n🏢 Seguradora espanhola com foco **ibero-americano**.\n\n**Números:**\n• Presente em **10 países** (foco Ibéria e LATAM)\n• Capital misto (público-privado na Espanha)\n• Forte em **PMEs**\n\n**Diferenciais:**\n• Foco em empresas de **pequeno e médio porte**\n• Processo simplificado de contratação\n• Atendimento em português e espanhol\n• Boa presença na América Latina\n\n**Produtos:**\n• Master Oro (Whole Turnover)\n• Master PME (simplificado para pequenas empresas)\n• Single Risk\n• Crédito à Exportação\n\n**Prêmio mínimo:** A partir de R$ 15.000/ano para PMEs\n\n**Ideal para:** PMEs brasileiras que buscam seguro de crédito com processo simples e custo acessível.`
  },
  {
    keywords: ['aig', 'grandes riscos', 'risk political aig'],
    category: 'seguradora',
    answer: `**AIG (American International Group)**\n\n🏢 Gigante americana de seguros com expertise em **grandes riscos**.\n\n**Números:**\n• Presente em **80+ países**\n• Rating: **A+** (S&P)\n• Capacidade para riscos muito grandes\n\n**Diferenciais:**\n• Especialista em **risco político**\n• Apetite para **grandes exposições**\n• Soluções bespoke/tailor-made\n• Forte em setores: energia, commodities, infraestrutura\n\n**Produtos de Crédito:**\n• Whole Turnover\n• Single Risk (grandes valores)\n• Risco Político standalone\n• Seguro de Crédito para commodities\n\n**Quando escolher AIG:**\n• Operações de **grande porte** (USD 10M+)\n• Risco político em países **difíceis**\n• Setores especializados (oil & gas, mining)\n• Necessidade de **capacidade alta**\n\n**Ideal para:** Grandes corporações e exportadoras com operações em mercados de alto risco.`
  },
  {
    keywords: ['avla', 'avla confiavel', 'avla confiabilidade', 'avla segura', 'digital', 'latam', 'startup'],
    category: 'seguradora',
    answer: `**AVLA**\n\n🏢 Seguradora **digital-first** com foco na **América Latina**.\n\n**Números:**\n• Fundada em 2016 (Chile)\n• Presente no Brasil, Chile, Colômbia, Peru\n• Foco em tecnologia e agilidade\n\n**Diferenciais:**\n• Processo **100% digital**\n• Aprovação rápida de limites\n• Interface moderna e intuitiva\n• Foco em **PMEs e mid-market**\n• Prêmios competitivos\n\n**Produtos:**\n• Seguro de Crédito Digital\n• Whole Turnover simplificado\n• Key Buyer\n• Integração via API\n\n**Vantagens:**\n• Menos burocracia que seguradoras tradicionais\n• Onboarding em dias (não semanas)\n• Portal de gestão moderno\n• Suporte ágil\n\n**Ideal para:** PMEs e empresas de tecnologia que buscam agilidade e processo digital.`
  },
  {
    keywords: ['chubb', 'bespoke', 'tailor'],
    category: 'seguradora',
    answer: `**Chubb**\n\n🏢 Maior seguradora de capital aberto do mundo.\n\n**Números:**\n• Presente em **54 países**\n• Rating: **AA** (S&P)\n• Prêmios: USD 40+ bilhões/ano\n\n**Diferenciais em Crédito:**\n• Soluções **bespoke** (sob medida)\n• Capacidade muito alta para grandes riscos\n• Subscrição conservadora e sólida\n• Forte em segmentos específicos\n\n**Produtos:**\n• Whole Turnover customizado\n• Single Risk / Single Buyer\n• Excess of Loss\n• Soluções estruturadas\n\n**Quando escolher Chubb:**\n• Necessidade de solução **sob medida**\n• Valoriza **rating elevado** (AA)\n• Grandes corporações\n• Programas globais\n\n**Ideal para:** Empresas que precisam de soluções customizadas com uma seguradora de rating máximo.`
  },
  {
    keywords: ['seguradoras', 'quais seguradoras', 'opcoes', 'mercado', 'comparar seguradoras', 'comparativo', 'diferenca entre seguradoras', 'atradius coface', 'coface atradius', 'allianz coface', 'melhor seguradora'],
    category: 'seguradora',
    answer: `**Seguradoras de Crédito no Brasil — Comparativo**\n\n| Seguradora | Rating | Foco | Diferencial |\n|------------|--------|------|-------------|\n| **Allianz Trade** | AA | Líder global | EOLIS, 80M+ empresas |\n| **Coface** | AA- | Top 3 global | DRA rating, CofaNet |\n| **Atradius** | A | Top 3 global | Collections, Modula |\n| **CESCE** | A | Ibero-LATAM | PMEs, processo simples |\n| **AIG** | A+ | Grandes riscos | Risco político |\n| **AVLA** | — | Digital LATAM | 100% digital, ágil |\n| **Chubb** | AA | Bespoke | Sob medida, capacidade |\n\n**Market share global:**\n• Allianz Trade: ~34%\n• Coface: ~16%\n• Atradius: ~14%\n• Outras: ~36%\n\n**Dica:** A escolha depende do **perfil da empresa**:\n• PME → CESCE, AVLA\n• Exportadora → Allianz Trade, Coface\n• Grande corporação → Chubb, AIG\n• Digital-first → AVLA\n• Cobrança internacional → Atradius\n\nPosso detalhar qualquer seguradora específica!`
  },

  // ── Processo e Documentação ──
  {
    keywords: ['como contratar', 'contratar', 'processo contratacao', 'etapas'],
    category: 'processo',
    answer: `**Como Contratar Seguro de Crédito**\n\n**Etapas do processo:**\n\n**1. Diagnóstico Inicial**\n• Análise do perfil da empresa\n• Volume de vendas a prazo\n• Número de compradores\n• Histórico de inadimplência\n\n**2. Coleta de Documentação**\n• Balanço patrimonial (3 últimos anos)\n• DRE (Demonstrativo de Resultados)\n• Lista de compradores com limites desejados\n• Aging de recebíveis\n• Histórico de perdas (últimos 3-5 anos)\n\n**3. Cotação**\n• Estudo comparativo do mercado: instantâneo\n• Proposta completa direto na seguradora: até 5 dias úteis\n\n**4. Negociação e Contratação**\n• Fairfield negocia as melhores condições\n• Empresa escolhe a melhor opção\n• Emissão da apólice`
  },
  {
    keywords: ['documentos', 'documentacao', 'papeis', 'o que precisa'],
    category: 'processo',
    answer: `**Documentação Necessária para Seguro de Crédito**\n\n**Documentos obrigatórios:**\n\n1. **Da empresa (segurado):**\n   • CNPJ e Contrato Social\n   • Balanço Patrimonial (últimos 3 anos)\n   • DRE (Demonstrativo de Resultados)\n   • Faturamento mensal dos últimos 12 meses\n   • Projeção de vendas a prazo (12 meses)\n\n2. **Dos compradores (devedores):**\n   • Lista com CNPJ e razão social\n   • Limite de crédito desejado por comprador\n   • Volume atual de vendas por comprador\n   • Prazo de pagamento praticado\n   • Histórico de pagamento\n\n3. **Informações adicionais:**\n   • Aging de recebíveis (30/60/90/120/180 dias)\n   • Histórico de inadimplência (últimos 5 anos)\n   • Setor de atuação dos compradores\n   • Garantias existentes (aval, hipoteca, etc.)\n   • Seguro de crédito anterior (se houver)\n\n**Para exportação (adicional):**\n   • Países de destino\n   • Incoterms utilizados\n   • Moeda das operações\n   • Instrumentos de pagamento (carta de crédito, open account, etc.)`
  },
  {
    keywords: ['prazo analise', 'quanto tempo', 'demora', 'tempo aprovacao'],
    category: 'processo',
    answer: `**Prazos no Seguro de Crédito**\n\n| Etapa | Prazo |\n|-------|-------|\n| Estudo comparativo do mercado | Instantâneo |\n| Proposta completa na seguradora | Até 5 dias úteis |\n| Análise de compradores | 2 a 5 dias por lote |\n| Emissão da apólice | 3 a 5 dias úteis |\n| Aprovação de novo limite | 24 a 72 horas |\n| Notificação de sinistro | Até 30 dias do vencimento |\n| Pagamento de indenização | 30 a 60 dias após mora |`
  },
  {
    keywords: ['renovacao', 'renovar', 'vencimento apolice', 'vigencia', 'vigencia apolice', 'duracao apolice', 'validade apolice', 'prazo apolice'],
    category: 'processo',
    answer: `**Renovação da Apólice de Seguro de Crédito**\n\n**Prazo:** Apólice anual, renovação **60-90 dias** antes do vencimento.\n\n**Processo de renovação:**\n\n1. **Seguradora envia proposta** (60-90 dias antes)\n   • Novas condições baseadas no histórico\n   • Ajuste de prêmio (bonus/malus)\n   • Revisão de limites\n\n2. **Análise do segurado**\n   • Comparar com condições atuais\n   • Avaliar sinistralidade do período\n   • Negociar condições\n\n3. **Negociação**\n   • PMI e POS\n   • Franquia/AAD\n   • Prêmio\n   • Inclusão/exclusão de compradores\n\n4. **Aceite e emissão**\n   • Assinatura do endosso de renovação\n   • Continuidade da cobertura\n\n**Bonus/Malus:**\n• Sem sinistros: **desconto de 5% a 15%** no prêmio\n• Com sinistros: **aumento de 10% a 30%**\n• Sinistralidade alta: seguradora pode recusar renovação\n\n**Dica:** Use o período de renovação para **cotar com outras seguradoras** e garantir as melhores condições.`
  },
  {
    keywords: ['sinistro', 'acionar', 'como acionar', 'indenizacao processo', 'comunicar sinistro', 'funciona sinistro', 'como funciona sinistro', 'processo sinistro', 'comprador nao pagou', 'nao pagou', 'calote o que fazer', 'devedor nao pagou'],
    category: 'processo',
    answer: `**Como Acionar o Seguro de Crédito (Sinistro)**\n\n**Passo a passo:**\n\n**1. Notificação de Atraso (obrigatória)**\n• Prazo: **30 a 60 dias** após o vencimento da fatura\n• Canal: Portal da seguradora ou e-mail\n• Informar: Devedor, valor, vencimento, NF\n\n**2. Período de Cobrança**\n• Seguradora pode iniciar cobrança amigável\n• Segurado deve colaborar com documentação\n• Prazo: até completar 150-180 dias de atraso\n\n**3. Caracterização do Sinistro**\n• **Mora prolongada:** Após 150-180 dias de atraso\n• **Insolvência:** Decreto de falência ou RJ deferida\n\n**4. Regulação do Sinistro**\n• Seguradora analisa documentação\n• Verifica cobertura e limites\n• Calcula indenização (valor × PMI)\n\n**5. Pagamento da Indenização**\n• Prazo: **30 a 60 dias** após regulação\n• Pagamento direto ao segurado\n• Seguradora se sub-roga nos direitos\n\n**Documentos para o sinistro:**\n• Notas fiscais\n• Duplicatas/boletos\n• Contratos de venda\n• Comprovantes de entrega\n• Correspondência de cobrança\n• Certidão de RJ/falência (se aplicável)\n\n⚠️ **ATENÇÃO:** Não notificar no prazo pode resultar em **perda do direito** à indenização.`
  },
  {
    keywords: ['prazo indenizacao', 'quando recebo', 'tempo indenizacao', 'pagar indenizacao', 'quanto tempo indenizacao', 'demora indenizacao', 'receber indenizacao prazo', 'valor recuperado', 'recuperar valor', 'quanto tempo recuperar', 'cliente nao pagar', 'nao pagar quanto tempo', 'tempo para receber'],
    category: 'processo',
    answer: `**Prazo de Indenização no Seguro de Crédito**\n\n**Prazos por tipo de sinistro:**\n\n| Tipo | Prazo de Mora | Waiting Period | Pagamento |\n|------|---------------|----------------|----------|\n| Mora prolongada | 150-180 dias | 30-60 dias | **Total: 6-8 meses** |\n| Insolvência | N/A | 30 dias | **1-2 meses após decreto** |\n| Risco Político | N/A | 180 dias | **6-9 meses após evento** |\n\n**Cálculo da indenização:**\n• Valor da dívida: R$ 1.000.000\n• (-) AAD já atingido: sem desconto\n• (×) PMI 85%: R$ 850.000\n• (=) **Indenização: R$ 850.000**\n\n**Fatores que aceleram:**\n• Documentação completa e organizada\n• Notificação feita dentro do prazo\n• Colaboração com a cobrança da seguradora\n\n**Fatores que atrasam:**\n• Disputa comercial com o devedor\n• Documentação incompleta\n• Limite excedido (parcela não coberta)\n\nAlgumas seguradoras oferecem **antecipação parcial** da indenização.`
  },

  // ── Taxas e Preços ──
  {
    keywords: ['quanto custa', 'preco', 'valor seguro', 'valor seguro credito', 'taxa', 'custo', 'premio', 'quanto pago', 'preco seguro', 'custo seguro', 'valor do seguro'],
    category: 'preco',
    answer: `**Quanto Custa o Seguro de Crédito?**\n\n**Taxa média por setor:**\n\n| Setor | Taxa (% faturamento) |\n|-------|---------------------|\n| Alimentos/Bebidas | 0,10% a 0,25% |\n| Químico | 0,15% a 0,30% |\n| Metalúrgico | 0,15% a 0,35% |\n| Têxtil | 0,20% a 0,40% |\n| Distribuição | 0,15% a 0,30% |\n| Tecnologia | 0,10% a 0,25% |\n| Construção Civil | 0,25% a 0,50% |\n| Agronegócio | 0,15% a 0,35% |\n\n**Prêmio mínimo:**\n• R$ 15.000 a R$ 30.000/ano (dependendo da seguradora)\n\n**Exemplo prático:**\n• Faturamento a prazo: R$ 50 milhões/ano\n• Taxa: 0,20%\n• **Prêmio anual: R$ 100.000**\n• Prêmio mensal: ~R$ 8.333\n\n**Para cada R$ 1 de prêmio, você protege ~R$ 500 de faturamento.**\n\n**Fatores que influenciam a taxa:**\n• Setor de atuação\n• Diversificação de compradores\n• Histórico de sinistralidade\n• PMI e POS escolhidos\n• Franquia/AAD\n• Prazo de pagamento\n\nQuer uma cotação personalizada? Clique em **Fazer Cotação** acima!`
  },
  {
    keywords: ['premio minimo', 'minimo', 'empresa pequena', 'faturamento minimo'],
    category: 'preco',
    answer: `**Prêmio Mínimo de Seguro de Crédito**\n\n**Por seguradora (referência):**\n\n| Seguradora | Prêmio Mínimo Anual |\n|------------|--------------------|\n| Allianz Trade | R$ 25.000 - R$ 30.000 |\n| Coface | R$ 20.000 - R$ 25.000 |\n| Atradius | R$ 20.000 - R$ 30.000 |\n| CESCE | R$ 15.000 - R$ 20.000 |\n| AVLA | R$ 15.000 - R$ 20.000 |\n| AIG | R$ 50.000+ |\n| Chubb | R$ 50.000+ |\n\n**Faturamento mínimo recomendado:** R$ 5 milhões/ano a prazo\n\n**Para empresas menores:**\n• CESCE e AVLA têm soluções para **PMEs**\n• Apólices simplificadas com limites menores\n• Processo de contratação mais ágil\n\n**Dica:** Se o faturamento for menor que R$ 5 milhões, avalie se o custo do seguro compensa em relação ao risco real de inadimplência.`
  },
  {
    keywords: ['fator influencia', 'o que afeta', 'como calcula', 'calculo premio', 'precificacao'],
    category: 'preco',
    answer: `**Fatores que Influenciam o Prêmio do Seguro de Crédito**\n\n**1. Perfil da Empresa (Segurado)**\n• Setor de atuação\n• Faturamento total e a prazo\n• Diversificação de compradores\n• Histórico de inadimplência\n• Experiência anterior com seguro de crédito\n\n**2. Perfil dos Compradores (Devedores)**\n• Rating de crédito médio\n• Concentração (top 10 = % do total)\n• Setores dos compradores\n• Localização geográfica\n• Prazo de pagamento\n\n**3. Estrutura da Apólice**\n• PMI (maior PMI = maior prêmio)\n• POS (maior POS = menor prêmio)\n• AAD/Franquia (maior AAD = menor prêmio)\n• Tipo: Whole Turnover vs Key Buyer\n• Cobertura: doméstico, exportação ou misto\n\n**4. Sinistralidade Histórica**\n• Sem sinistros: bônus de 5% a 15%\n• Sinistros frequentes: malus de 10% a 30%\n• Loss ratio: prêmio pago vs indenizações recebidas\n\n**5. Condições de Mercado**\n• Economia: recessão → taxas mais altas\n• Concorrência entre seguradoras\n• Capacidade disponível`
  },
  {
    keywords: ['bonus malus', 'bonus', 'malus', 'desconto renovacao', 'sinistralidade'],
    category: 'preco',
    answer: `**Sistema Bonus/Malus no Seguro de Crédito**\n\nAjuste do prêmio na renovação baseado no **histórico de sinistralidade**.\n\n**Bonus (desconto):**\n• Sem sinistros no ano: **-5% a -15%** no prêmio\n• 2 anos sem sinistros: **-10% a -20%**\n• 3+ anos sem sinistros: **-15% a -25%**\n\n**Malus (aumento):**\n• Sinistralidade 50-70%: **+10% a +20%**\n• Sinistralidade 70-100%: **+20% a +40%**\n• Sinistralidade >100%: **renegociação total** ou não renovação\n\n**Sinistralidade = Indenizações / Prêmio Pago × 100**\n\n**Exemplo:**\n• Prêmio: R$ 100.000\n• Indenizações: R$ 30.000\n• Sinistralidade: 30%\n• Resultado: Bônus na renovação!\n\n**Dica:** Mesmo utilizando o seguro (recebendo indenizações), se a sinistralidade for controlada, a empresa mantém condições favoráveis.`
  },
  {
    keywords: ['iof', 'imposto', 'tributo', 'fiscal'],
    category: 'preco',
    answer: `**IOF no Seguro de Crédito**\n\n**Alíquota de IOF:**\n• **Seguro de Crédito Interno (0171):** 0% (isento)\n• **Seguro de Crédito à Exportação (0172):** 0% (isento)\n\n✅ **O Seguro de Crédito é ISENTO de IOF**, diferentemente de outros seguros.\n\n**Base legal:** Decreto 6.306/2007, Art. 32, que isenta operações de seguro de crédito à exportação e operações de seguro de crédito interno.\n\n**Comparação com outros seguros:**\n| Seguro | IOF |\n|--------|-----|\n| Seguro de Crédito | **0%** |\n| Seguro Garantia | 0% |\n| Seguro Empresarial | 7,38% |\n| Seguro Auto | 7,38% |\n| Seguro Vida | 0,38% |\n\n**Outros tributos sobre o prêmio:**\n• PIS: 0,65%\n• COFINS: 4%\n• ISS: varia por município\n\n(Esses tributos já estão incluídos na taxa cotada pela seguradora.)`
  },

  // ── Legislação ──
  {
    keywords: ['susep', 'regulamentacao', 'regulacao', 'orgao regulador', 'legislacao', 'legislacao seguro credito', 'lei seguro credito'],
    category: 'legislacao',
    answer: `**SUSEP — Superintendência de Seguros Privados**\n\nÓrgão regulador do mercado de seguros no Brasil.\n\n**Regulamentação do Seguro de Crédito:**\n\n**Ramos SUSEP:**\n• **0171** — Crédito Interno\n• **0172** — Crédito à Exportação\n\n**Principais normas:**\n• **Circular SUSEP 553/2017** — Provisões técnicas\n• **Resolução CNSP 432/2021** — Seguro de crédito\n• **Circular SUSEP 621/2020** — Condições contratuais\n\n**Exigências regulatórias:**\n• Seguradoras devem ter **autorização SUSEP**\n• Provisões técnicas adequadas\n• Capital mínimo de solvência\n• Limites de retenção por risco\n• Reportes periódicos\n\n**Proteção ao segurado:**\n• Condições gerais padronizadas\n• Prazos de pagamento de sinistros\n• Canal de reclamações (SUSEP)\n• Fundo garantidor (limitado)\n\n**Dica:** Sempre verifique se a seguradora é **autorizada pela SUSEP** antes de contratar.`
  },
  {
    keywords: ['decreto lei 73', 'decreto 73', 'lei basica', 'marco regulatorio'],
    category: 'legislacao',
    answer: `**Decreto-Lei 73/1966 — Marco Regulatório dos Seguros**\n\nLei que criou o **Sistema Nacional de Seguros Privados**.\n\n**Estrutura criada:**\n• **CNSP** (Conselho Nacional de Seguros Privados) — normas\n• **SUSEP** (Superintendência de Seguros Privados) — fiscalização\n• **IRB** (Instituto de Resseguros do Brasil) — resseguro\n• Seguradoras autorizadas\n• Corretores habilitados\n\n**Pontos relevantes para Seguro de Crédito:**\n• Art. 5º — Classifica ramos de seguro\n• Art. 8º — Competências do CNSP\n• Art. 36 — Autorização para operar\n• Art. 73 — Provisões técnicas\n• Art. 108 — Obrigações dos corretores\n\n**Importância:**\n• Base de toda a regulamentação de seguros no Brasil\n• Define a estrutura institucional\n• Estabelece princípios de proteção ao segurado\n• Regulamenta a atividade de corretagem\n\nEmbora de 1966, o Decreto-Lei 73 continua sendo a **base legal** do setor, complementado por normas da SUSEP e CNSP.`
  },
  {
    keywords: ['lei 6704', '6704', 'seguro credito exportacao lei'],
    category: 'legislacao',
    answer: `**Lei 6.704/1979 — Seguro de Crédito à Exportação**\n\nLei específica que regula o Seguro de Crédito à Exportação no Brasil.\n\n**Pontos principais:**\n\n• **Art. 1º:** Define o seguro de crédito à exportação\n• **Art. 2º:** Riscos cobertos (comercial e político)\n• **Art. 3º:** Fundo de Garantia à Exportação (FGE)\n• **Art. 4º:** Cobertura do Tesouro Nacional para risco político\n• **Art. 5º:** Condições de apólice\n\n**FGE (Fundo de Garantia à Exportação):**\n• Fundo público vinculado ao Ministério da Fazenda\n• Garante operações de **longo prazo** (acima de 2 anos)\n• Cobre **risco político** em operações de grande porte\n• Operado pela **ABGF** (Agência Brasileira Gestora de Fundos)\n\n**Relevância prática:**\n• Exportações de bens de capital de longo prazo\n• Financiamentos BNDES Exim com cobertura FGE\n• Operações com países de risco elevado\n\nPara **exportações de curto prazo** (até 2 anos), o seguro de crédito é contratado diretamente com seguradoras privadas (Allianz Trade, Coface, etc.).`
  },
  {
    keywords: ['codigo civil', 'art 757', 'contrato seguro', 'lei civil'],
    category: 'legislacao',
    answer: `**Código Civil — Artigos 757 a 802 (Contrato de Seguro)**\n\nBase legal para **todos os contratos de seguro** no Brasil.\n\n**Artigos relevantes para Seguro de Crédito:**\n\n• **Art. 757:** Define contrato de seguro\n• **Art. 762:** Proíbe seguro para atos dolosos\n• **Art. 763:** Perda de direito por informação falsa\n• **Art. 766:** Dever de boa-fé (segurado deve informar riscos)\n• **Art. 769:** Agravamento do risco (notificar seguradora)\n• **Art. 771:** Obrigação de comunicar sinistro\n• **Art. 776:** Sub-rogação da seguradora\n• **Art. 778:** Limite da indenização\n\n**Princípios aplicáveis:**\n• **Boa-fé:** Segurado deve declarar informações verdadeiras\n• **Interesse segurável:** Segurado deve ter interesse legítimo\n• **Indenização:** Seguro não pode gerar lucro\n• **Sub-rogação:** Seguradora assume direitos do segurado\n\n**Na prática do Seguro de Crédito:**\n• O segurado deve informar mudanças nos devedores\n• Não pode ocultar informações de inadimplência\n• Deve colaborar com a cobrança\n• Documentação deve ser verdadeira`
  },
  {
    keywords: ['lei 11101', '11101', 'falencia', 'recuperacao', 'lei falencias'],
    category: 'legislacao',
    answer: `**Lei 11.101/2005 — Lei de Falências e Recuperação Judicial**\n\nFundamental para o Seguro de Crédito pois define os eventos de **insolvência**.\n\n**Eventos que geram sinistro:**\n\n1. **Recuperação Judicial (Art. 47-72)**\n   • Devedor pede RJ ao juízo\n   • Juiz defere o processamento\n   • Plano de pagamento aprovado pelos credores\n   • **Sinistro:** deferimento da RJ\n\n2. **Recuperação Extrajudicial (Art. 161-167)**\n   • Acordo direto com credores\n   • Homologação judicial\n   • Menos frequente\n\n3. **Falência (Art. 73-160)**\n   • Liquidação dos ativos\n   • Ordem de pagamento dos credores\n   • **Sinistro:** decretação da falência\n\n**Impacto no Seguro de Crédito:**\n• Créditos devem ser **habilitados** no processo\n• Seguradora se sub-roga nos direitos\n• Ordem de preferência: trabalhista > tributário > quirografário\n• Crédito segurado é geralmente **quirografário**\n\n**Reforma de 2020 (Lei 14.112/2020):**\n• Modernizou procedimentos\n• Criou mecanismos de financiamento DIP\n• Ampliou prazos de RJ\n• Impacta análise de risco das seguradoras`
  },

  // ── Vantagens ──
  {
    keywords: ['vantagens', 'beneficios', 'por que contratar', 'vale a pena'],
    category: 'vantagens',
    answer: `**Vantagens do Seguro de Crédito**\n\n**1. Proteção contra Inadimplência**\n• Indenização de **85% a 95%** do valor da venda\n• Cobertura contra falência e mora prolongada\n• Proteção contra risco político (exportação)\n\n**2. Inteligência de Crédito**\n• Acesso a bases de dados da seguradora\n• Rating e análise de cada comprador\n• Monitoramento contínuo dos devedores\n• Alertas de deterioração de crédito\n\n**3. Melhoria Financeira**\n• **Melhor rating** da empresa segurada\n• Acesso a **financiamento mais barato**\n• Recebíveis segurados valem mais como garantia\n• Redução de necessidade de provisão para devedores duvidosos\n\n**4. Cobrança Especializada**\n• Seguradora realiza cobrança profissional\n• Rede internacional de cobrança\n• Maior taxa de recuperação\n\n**5. Crescimento Seguro**\n• Vender a prazo com confiança\n• Entrar em novos mercados\n• Ampliar prazo de pagamento\n• Aceitar novos clientes\n\n**6. Substituição de Garantias**\n• Não precisa exigir aval/fiança do comprador\n• Relação comercial mais fluida\n• Processo de venda mais rápido\n\n**ROI típico:** Para cada R$ 1 investido em prêmio, a empresa protege R$ 400 a R$ 700 em faturamento.`
  },
  {
    keywords: ['protecao inadimplencia', 'calote', 'cobre calote', 'nao pagar', 'devedor nao paga'],
    category: 'vantagens',
    answer: `**Proteção contra Inadimplência**\n\nO Seguro de Crédito é a principal ferramenta para proteger seu faturamento.\n\n**Cenário SEM seguro:**\n• Venda de R$ 500.000 a prazo\n• Comprador não paga\n• Perda total: **R$ 500.000**\n• Para compensar: precisa vender R$ 5M extras (margem 10%)\n\n**Cenário COM seguro:**\n• Venda de R$ 500.000 a prazo\n• Comprador não paga\n• Seguro indeniza 85%: **R$ 425.000**\n• Perda real: R$ 75.000\n• Prêmio anual do seguro: ~R$ 20.000\n\n**Resultado:** O seguro transformou uma perda de R$ 500.000 em R$ 95.000 (prêmio + POS).\n\n**Dados do mercado brasileiro:**\n• Taxa de inadimplência B2B: **3% a 7%** do faturamento\n• Empresas que fecham por inadimplência: **25%** das falências\n• Tempo médio de recuperação sem seguro: **18 meses**\n• Tempo com seguro: **6-8 meses** (e com indenização)\n\nO seguro de crédito é **investimento**, não custo.`
  },
  {
    keywords: ['rating credito', 'melhoria rating', 'credit rating', 'nota credito'],
    category: 'vantagens',
    answer: `**Melhoria do Rating de Crédito com Seguro de Crédito**\n\n**Como o seguro melhora seu rating:**\n\n1. **Recebíveis mais seguros**\n   • Bancos consideram recebíveis segurados como de menor risco\n   • Melhor classificação na análise de crédito\n\n2. **Redução de PDD**\n   • Provisão para Devedores Duvidosos diminui\n   • Balanço mais saudável\n   • Resultado líquido maior\n\n3. **Acesso a crédito**\n   • Linhas de financiamento com juros menores\n   • Limite de crédito ampliado\n   • Operações de cessão de recebíveis facilitadas\n\n4. **BNDES e agências de fomento**\n   • BNDES Exim exige ou recomenda seguro de crédito\n   • Facilita ACC/ACE com bancos\n   • Melhora condições de financiamento à exportação\n\n**Impacto estimado:**\n• Redução de custo de crédito: **0,5% a 2% ao ano**\n• Em financiamento de R$ 10M: economia de R$ 50.000 a R$ 200.000/ano\n• Muitas vezes **o seguro se paga** pela redução do custo financeiro`
  },
  {
    keywords: ['cobranca', 'recuperacao', 'cobranca especializada'],
    category: 'vantagens',
    answer: `**Cobrança Especializada no Seguro de Crédito**\n\nAs seguradoras de crédito possuem **redes de cobrança** altamente eficientes.\n\n**Serviços incluídos:**\n• Cobrança amigável (cartas, telefonemas, negociação)\n• Cobrança judicial (quando necessário)\n• Mediação e arbitragem\n• Cobrança internacional (exportação)\n\n**Seguradoras e suas redes:**\n| Seguradora | Rede de Cobrança |\n|------------|------------------|\n| Allianz Trade | Própria em 52 países |\n| Coface | Própria em 100 países |\n| Atradius | Atradius Collections - 96 países |\n| CESCE | Parceiros locais |\n\n**Taxas de recuperação:**\n• Sem seguro: **30% a 40%** (média brasileira)\n• Com seguradora: **60% a 75%** (cobrança especializada)\n\n**Processo:**\n1. Segurado notifica atraso\n2. Seguradora inicia cobrança (incluída no seguro)\n3. Se recuperar: crédito volta ao segurado\n4. Se não recuperar: sinistro → indenização\n\n**Atradius Collections** pode ser contratado separadamente para empresas que não têm seguro de crédito.`
  },
  {
    keywords: ['substituicao garantia', 'sem aval', 'sem fianca', 'garantia real'],
    category: 'vantagens',
    answer: `**Substituição de Garantias Reais**\n\nO seguro de crédito **elimina a necessidade** de exigir garantias dos compradores.\n\n**SEM seguro — garantias necessárias:**\n• Aval de sócios\n• Fiança bancária\n• Hipoteca\n• Penhor de estoque\n• Alienação fiduciária\n\n**COM seguro — nenhuma garantia necessária:**\n• A seguradora assume o risco\n• Comprador compra sem amarras\n• Relação comercial mais fluida\n• Processo de venda mais rápido\n\n**Benefícios comerciais:**\n• Clientes preferem fornecedores que **não exigem garantias**\n• Você **ganha competitividade** no mercado\n• Pode oferecer **prazos maiores** com segurança\n• Novos clientes compram com mais facilidade\n\n**Exemplo:**\n• Seu concorrente exige aval e fiança\n• Você oferece 90 dias sem garantia (com seguro)\n• O cliente **escolhe você**\n\nO custo do seguro é amplamente compensado pelo **ganho comercial**.`
  },

  // ── Perguntas frequentes adicionais ──
  {
    keywords: ['como funciona indenizacao', 'indenizacao', 'receber indenizacao', 'processo indenizacao'],
    category: 'indenizacao',
    answer: `**Como Funciona a Indenização no Seguro de Crédito**\n\n**Cálculo da indenização:**\n\n| Componente | Valor |\n|-----------|-------|\n| Dívida do comprador | R$ 1.000.000 |\n| (-) Pagamentos parciais | R$ 100.000 |\n| (=) Saldo devedor | R$ 900.000 |\n| (×) PMI (85%) | R$ 765.000 |\n| (-) Franquia/AAD | Depende da apólice |\n| (=) **Indenização** | **R$ 765.000** |\n\n**Etapas:**\n1. **Notificação** do atraso (dentro do prazo)\n2. **Período de mora** (150-180 dias) ou declaração de insolvência\n3. **Regulação** pela seguradora (análise documental)\n4. **Pagamento** da indenização (30-60 dias)\n5. **Sub-rogação** — seguradora assume o direito de cobrança\n\n**Após a indenização:**\n• Se a seguradora recuperar valores do devedor, divide com o segurado proporcionalmente à POS\n• Se o segurado receber pagamento direto do devedor após a indenização, deve repassar à seguradora\n\n**Importante:** A indenização **nunca excede** a perda real. O seguro é indenizatório, não pode gerar lucro para o segurado.`
  },
  {
    keywords: ['pmi pos', 'pmi e pos', 'o que e pmi', 'o que e pos', 'pmi pos diferenca'],
    category: 'tecnico',
    answer: `**PMI e POS — Os Dois Lados da Moeda**\n\n**PMI (Percentual Máximo de Indenização):**\n• É o que a **seguradora paga** do sinistro\n• Varia de **75% a 95%**\n• Quanto maior, mais caro o prêmio\n\n**POS (Participação Obrigatória do Segurado):**\n• É o que o **segurado absorve** do sinistro\n• POS = 100% - PMI\n• Quanto maior, mais barato o prêmio\n\n**Exemplos:**\n| PMI | POS | Perda R$ 1M | Seguradora paga | Você absorve |\n|-----|-----|-------------|-----------------|-------------|\n| 75% | 25% | R$ 1.000.000 | R$ 750.000 | R$ 250.000 |\n| 85% | 15% | R$ 1.000.000 | R$ 850.000 | R$ 150.000 |\n| 90% | 10% | R$ 1.000.000 | R$ 900.000 | R$ 100.000 |\n| 95% | 5% | R$ 1.000.000 | R$ 950.000 | R$ 50.000 |\n\n**Como escolher:**\n• **Mais proteção** → PMI alto (90-95%) → Prêmio maior\n• **Menor custo** → PMI menor (75-85%) → Prêmio menor\n• **Equilíbrio** → PMI 85% é o mais comum no mercado\n\nA POS existe para que o segurado mantenha **interesse em prevenir perdas**.`
  },
  {
    keywords: ['whole turnover key buyer', 'diferenca whole key', 'global nomeado', 'qual modalidade'],
    category: 'cobertura',
    answer: `**Whole Turnover vs Key Buyer — Qual Escolher?**\n\n| Critério | Whole Turnover | Key Buyer |\n|----------|---------------|-----------|\n| **Cobertura** | Toda a carteira | Compradores selecionados |\n| **Custo total** | Maior (cobre tudo) | Menor (cobre menos) |\n| **Custo unitário** | Menor por comprador | Maior por comprador |\n| **Diversificação** | Sim (menor risco) | Não |\n| **Gestão** | Mais complexa | Mais simples |\n| **AAD/Franquia** | Comum | Raro |\n| **Anti-seleção** | Sem risco | Risco maior |\n| **Ideal para** | Carteira diversificada | Poucos grandes compradores |\n\n**Escolha Whole Turnover se:**\n• Tem muitos compradores (50+)\n• Quer proteção total\n• Aceita franquia/AAD\n• Faturamento alto e diversificado\n\n**Escolha Key Buyer se:**\n• Tem poucos grandes compradores (5-20)\n• Quer proteger apenas os maiores riscos\n• Orçamento limitado para seguro\n• Concentração em poucos clientes\n\n**Na dúvida?** Peça cotação de ambas as modalidades para comparar!`
  },

  // ── Setores e Indústrias ──
  {
    keywords: ['setor', 'industria', 'segmento', 'quais setores', 'area atuacao'],
    category: 'setor',
    answer: `**Setores que mais utilizam Seguro de Crédito no Brasil**\n\n| Setor | Taxa Média | Risco |\n|-------|-----------|-------|\n| Alimentos/Bebidas | 0,10% - 0,25% | Baixo-Médio |\n| Químico/Petroquímico | 0,15% - 0,30% | Médio |\n| Metalúrgico/Siderúrgico | 0,15% - 0,35% | Médio |\n| Têxtil/Confecções | 0,20% - 0,40% | Médio-Alto |\n| Papel/Celulose | 0,12% - 0,25% | Baixo-Médio |\n| Eletrônicos/Tecnologia | 0,10% - 0,25% | Baixo-Médio |\n| Construção Civil | 0,25% - 0,50% | Alto |\n| Agronegócio | 0,15% - 0,35% | Médio |\n| Farmacêutico | 0,10% - 0,20% | Baixo |\n| Automotivo (autopeças) | 0,15% - 0,30% | Médio |\n\n**Setores com maior sinistralidade:**\n• Construção civil (ciclo econômico)\n• Varejo (margens apertadas)\n• Têxtil (concorrência importados)\n\n**Setores com menor sinistralidade:**\n• Farmacêutico (demanda estável)\n• Alimentos essenciais\n• Utilities e energia\n\nA taxa varia conforme o **perfil específico** da empresa e seus compradores.`
  },
  {
    keywords: ['agronegocio', 'agro', 'rural', 'safra', 'commodities'],
    category: 'setor',
    answer: `**Seguro de Crédito para o Agronegócio**\n\nSetor com características específicas no seguro de crédito.\n\n**Particularidades:**\n• Sazonalidade das vendas (safra/entressafra)\n• Compradores de diferentes portes (tradings a cooperativas)\n• Operações em USD para exportação\n• Prazos de pagamento mais longos em algumas cadeias\n\n**Coberturas relevantes:**\n• **Crédito Interno:** Vendas de insumos, fertilizantes, defensivos\n• **Crédito à Exportação:** Commodities (soja, café, açúcar, carne)\n• **Risco Político:** Exportação para mercados emergentes\n\n**Seguradoras com expertise em agro:**\n• Allianz Trade (cobertura global de commodities)\n• Coface (análise setorial detalhada)\n• Chubb (grandes operações)\n\n**Atenção:**\n• Trading companies são analisadas como compradores\n• Cooperativas podem ter análise de crédito diferenciada\n• Operações com prazo > 180 dias podem ter tratamento especial\n\n**Taxa média:** 0,15% a 0,35% do faturamento a prazo.`
  },

  // ── Mercado e Estatísticas ──
  {
    keywords: ['mercado brasileiro', 'tamanho mercado', 'estatisticas', 'numeros', 'dados mercado'],
    category: 'mercado',
    answer: `**Mercado de Seguro de Crédito no Brasil**\n\n**Números do mercado (referência):**\n• Prêmios anuais: **R$ 800 milhões a R$ 1 bilhão**\n• Crescimento anual: **8% a 12%**\n• Penetração: **menos de 5%** das empresas elegíveis\n• Potencial de crescimento: **muito alto**\n\n**Comparação internacional:**\n| País/Região | Penetração |\n|-------------|------------|\n| Europa Ocidental | 15% - 25% |\n| Ásia | 5% - 10% |\n| **Brasil** | **3% - 5%** |\n| EUA | 5% - 8% |\n\n**Por que a penetração é baixa no Brasil?**\n• Desconhecimento do produto\n• Cultura de "auto-segurar" o risco\n• Departamentos de crédito internos\n• Custo percebido (mas é baixo!)\n\n**Tendências:**\n• Digitalização (plataformas como SENTINEL)\n• Crescimento pós-pandemia (empresas viram a necessidade)\n• Mais seguradoras entrando no mercado\n• Produtos para PMEs se tornando viáveis\n\nO mercado tem **enorme potencial** de crescimento nos próximos anos.`
  },
  {
    keywords: ['pandemia', 'covid', 'crise', 'recessao', 'cenario economico'],
    category: 'mercado',
    answer: `**Seguro de Crédito em Cenários de Crise**\n\n**Lições da pandemia (COVID-19):**\n• Aumento de inadimplência B2B: **40% a 60%**\n• Seguradoras reduziram limites de crédito\n• Empresas com seguro receberam indenizações\n• Empresas sem seguro tiveram perdas totais\n\n**O que acontece em recessão?**\n• **Sem seguro:** Perdas aumentam, caixa é afetado, empresa pode quebrar\n• **Com seguro:** Perdas são indenizadas, caixa protegido, empresa sobrevive\n\n**Comportamento das seguradoras em crise:**\n• Revisão de limites de crédito (para baixo)\n• Aumento de taxas na renovação\n• Monitoramento mais intensivo\n• Restrição de novas apólices em setores afetados\n\n**Estratégia recomendada:**\n• Contratar seguro **antes** da crise (quando é mais barato)\n• Manter apólice ativa mesmo em anos bons (bônus)\n• Diversificar carteira de compradores\n• Usar informações da seguradora para gestão de risco\n\n**Seguro de Crédito é como guarda-chuva:** Compre quando está sol, use quando chover.`
  },

  // ── Gestão de Risco ──
  {
    keywords: ['gestao risco', 'risk management', 'gerenciamento', 'analise risco'],
    category: 'gestao',
    answer: `**Gestão de Risco com Seguro de Crédito**\n\nO seguro de crédito é uma **ferramenta de gestão**, não apenas uma apólice.\n\n**Pilares da gestão de risco de crédito:**\n\n**1. Prevenção**\n• Análise de crédito dos compradores (feita pela seguradora)\n• Monitoramento contínuo\n• Alertas de deterioração\n• Definição de limites adequados\n\n**2. Mitigação**\n• Diversificação de carteira\n• Limites de exposição por comprador\n• Prazos de pagamento adequados\n• Garantias complementares quando necessário\n\n**3. Transferência**\n• Seguro de crédito (transfere o risco para a seguradora)\n• PMI define o nível de transferência\n• AAD/Franquia define a retenção\n\n**4. Monitoramento**\n• Acompanhamento de aging\n• Alertas de atraso\n• Indicadores de sinistralidade\n• Relatórios da seguradora\n\n**Benefício integrado:**\nA seguradora não é apenas uma "pagadora de sinistros" — ela é uma **parceira de gestão de risco**, fornecendo informação e inteligência de crédito.\n\nPlataformas como o **SENTINEL** integram todos esses pilares em uma única solução.`
  },
  {
    keywords: ['concentracao', 'risco concentracao', 'dependencia', 'cliente grande'],
    category: 'gestao',
    answer: `**Risco de Concentração no Seguro de Crédito**\n\nQuando poucos compradores representam grande parte do faturamento.\n\n**Cenário de risco:**\n• Top 5 compradores = 60%+ do faturamento\n• Se um não pagar, impacto é enorme\n• Diversificação insuficiente\n\n**Como o seguro ajuda:**\n• Protege contra calote dos maiores clientes\n• Seguradora analisa o risco de cada grande comprador\n• Alertas se o comprador deteriorar\n• Indenização protege o caixa\n\n**Modalidades indicadas:**\n• **Key Buyer:** Segurar especificamente os grandes compradores\n• **Single Risk:** Para operações pontuais de alto valor\n• **Whole Turnover:** Se quiser proteger toda a carteira\n\n**Limite de concentração:**\n• Seguradoras podem limitar a exposição máxima a um único devedor\n• Geralmente não mais que **15-20% da carteira** por comprador\n• Acima disso: prêmio adicional ou Top-Up necessário\n\n**Dica:** Se um cliente representa mais de 20% do seu faturamento, seguro de crédito é **essencial**.`
  },

  // ── Resseguro e Capacidade ──
  {
    keywords: ['resseguro', 'reinsurance', 'capacidade', 'retrocessao'],
    category: 'resseguro',
    answer: `**Resseguro no Seguro de Crédito**\n\nAs seguradoras transferem parte do risco para **resseguradoras**.\n\n**Como funciona:**\n• Seguradora retém parte do risco\n• Excedente é transferido ao ressegurador\n• Permite aceitar riscos maiores\n\n**Principais resseguradores:**\n• **Munich Re** (líder global)\n• **Swiss Re**\n• **Hannover Re**\n• **SCOR**\n• **IRB Re** (Brasil)\n\n**Impacto para o segurado:**\n• Maior capacidade de limites (a seguradora pode aprovar mais)\n• Estabilidade das condições\n• Segurança adicional (dupla garantia)\n\n**Tipos de resseguro:**\n• **Proporcional:** Ressegurador assume % de cada risco\n• **Não-proporcional (XL):** Ressegurador paga acima de um patamar\n• **Facultativo:** Caso a caso para grandes riscos\n\n**Na prática:**\nO segurado não interage com o ressegurador, mas a capacidade de resseguro influencia diretamente os **limites de crédito** que a seguradora pode aprovar.`
  },

  // ── Tecnologia e Digital ──
  {
    keywords: ['tecnologia', 'digital', 'plataforma digital', 'api', 'integracao'],
    category: 'tecnologia',
    answer: `**Tecnologia e Digitalização no Seguro de Crédito**\n\nO setor está em plena **transformação digital**.\n\n**Plataformas das seguradoras:**\n| Seguradora | Plataforma | Funcionalidades |\n|------------|-----------|------------------|\n| Allianz Trade | EOLIS | Limites, monitoramento, sinistros |\n| Coface | CofaNet | DRA rating, gestão de apólice |\n| Atradius | Atradius Insights | Analytics, scoring |\n| AVLA | Portal AVLA | 100% digital, API |\n\n**SENTINEL by Fairfield:**\n• Motor de subscrição inteligente (IA)\n• Cotação comparativa automática\n• Dashboard de gestão\n• Integração via API com ERPs\n• Chatbot especialista (iCover — sou eu!)\n\n**Tendências tecnológicas:**\n• **IA/Machine Learning:** Análise preditiva de inadimplência\n• **Big Data:** Cruzamento de bases para melhor scoring\n• **APIs:** Integração direta com sistemas do segurado\n• **Blockchain:** Rastreabilidade de transações (futuro)\n• **Open Insurance:** Compartilhamento de dados (regulamentação SUSEP)\n\n**Benefícios da digitalização:**\n• Cotação em minutos (antes: semanas)\n• Aprovação de limites em horas\n• Monitoramento em tempo real\n• Sinistro digital (menos burocracia)`
  },
  {
    keywords: ['erp', 'sistema gestao', 'integracao sistema', 'sap', 'totvs'],
    category: 'tecnologia',
    answer: `**Integração com ERPs e Sistemas de Gestão**\n\nO seguro de crédito pode ser integrado diretamente ao sistema da empresa.\n\n**ERPs compatíveis:**\n• **SAP:** Módulo de crédito com integração a seguradoras\n• **TOTVS/Protheus:** Customização para gestão de limites\n• **Oracle:** Módulo de risk management\n• **Outros:** Via API ou arquivo de troca\n\n**O que pode ser integrado:**\n• Consulta automática de limite antes de aprovar venda\n• Bloqueio de pedido se limite excedido\n• Notificação automática de atrasos à seguradora\n• Importação de limites aprovados\n• Exportação de dados de faturamento\n\n**Benefícios da integração:**\n• Elimina controles manuais (planilhas)\n• Reduz risco de vender acima do limite\n• Agiliza notificação de sinistros\n• Automatiza report à seguradora\n\n**SENTINEL oferece:**\n• API RESTful para integração\n• Webhooks para notificações\n• Dashboard independente do ERP\n• Suporte a múltiplos formatos de dados`
  },

  // ── Casos e Exemplos ──
  {
    keywords: ['exemplo', 'caso pratico', 'caso real', 'simulacao', 'cenario'],
    category: 'exemplo',
    answer: `**Caso Prático — Seguro de Crédito em Ação**\n\n**Empresa:** Distribuidora de Químicos (faturamento R$ 80M/ano a prazo)\n\n**Situação antes do seguro:**\n• 150 compradores ativos\n• Top 10 = 45% do faturamento\n• Inadimplência média: 3,5% (R$ 2,8M/ano)\n• Departamento de crédito com 4 pessoas\n\n**Contratação do seguro:**\n• Modalidade: Whole Turnover\n• PMI: 85%\n• AAD: R$ 300.000\n• Prêmio anual: R$ 176.000 (0,22%)\n\n**Ano 1 — Resultados:**\n• 3 sinistros (R$ 1.200.000 em perdas)\n• AAD absorvido: R$ 300.000\n• Indenização recebida: R$ 765.000 (R$ 900.000 × 85%)\n• POS absorvido: R$ 135.000\n• **Perda líquida: R$ 435.000** (antes seria R$ 1.200.000)\n• **Economia: R$ 765.000 - R$ 176.000 (prêmio) = R$ 589.000**\n\n**Benefícios extras:**\n• Reduziu equipe de crédito para 2 pessoas\n• Obteve financiamento 1% mais barato\n• Expandiu vendas para novos clientes com confiança\n\n**ROI do seguro: 435%** no primeiro ano.`
  },
  {
    keywords: ['exportacao exemplo', 'caso exportacao', 'exemplo internacional'],
    category: 'exemplo',
    answer: `**Caso Prático — Seguro de Crédito à Exportação**\n\n**Empresa:** Fabricante de autopeças exportando para LATAM e Europa\n\n**Perfil:**\n• Faturamento exportação: USD 15M/ano\n• 40 compradores em 12 países\n• Prazo médio: 90 dias\n• Moeda: USD\n\n**Contratação:**\n• Cobertura: Risco Comercial + Risco Político\n• PMI: 90%\n• Prêmio: 0,28% = USD 42.000/ano\n\n**Evento:**\n• Comprador na Argentina (USD 800.000 de exposição)\n• Governo argentino impõe restrição cambial\n• Comprador não consegue enviar pagamento\n\n**Sinistro por Risco Político:**\n• Valor: USD 800.000\n• PMI 90%: USD 720.000\n• Indenização recebida: **USD 720.000**\n• Prêmio pago: USD 42.000\n• **Retorno: 17x o investimento**\n\n**Sem o seguro:**\n• Perda total de USD 800.000\n• Impacto devastador no caixa\n• Possível inviabilidade das operações na Argentina\n\nPara **exportadoras**, o seguro de crédito é praticamente **obrigatório**.`
  },

  // ── Perguntas Comparativas ──
  {
    keywords: ['melhor seguradora', 'qual seguradora', 'comparar', 'escolher seguradora'],
    category: 'comparativo',
    answer: `**Como Escolher a Melhor Seguradora de Crédito**\n\n**Depende do perfil da sua empresa:**\n\n**Para PMEs (faturamento até R$ 30M):**\n• 1ª opção: **CESCE** (foco em PMEs, prêmio acessível)\n• 2ª opção: **AVLA** (processo digital, ágil)\n• 3ª opção: **Coface** (EasyLiner para PMEs)\n\n**Para Médias (R$ 30M a R$ 200M):**\n• 1ª opção: **Allianz Trade** (maior base de dados)\n• 2ª opção: **Coface** (DRA rating excelente)\n• 3ª opção: **Atradius** (Modula flexível)\n\n**Para Grandes (acima R$ 200M):**\n• 1ª opção: **Allianz Trade** (capacidade global)\n• 2ª opção: **Chubb** (soluções bespoke)\n• 3ª opção: **AIG** (grandes riscos)\n\n**Para Exportadoras:**\n• 1ª opção: **Allianz Trade** (52 países)\n• 2ª opção: **Coface** (100 países de informação)\n• 3ª opção: **Atradius** (cobrança em 96 países)\n\n**Critérios de escolha:**\n• Capacidade de limites\n• Velocidade de aprovação\n• Qualidade do atendimento\n• Prêmio e condições\n• Plataforma tecnológica\n\n**Dica:** Sempre cote com **pelo menos 3 seguradoras**. O SENTINEL faz isso automaticamente!`
  },
  {
    keywords: ['fidc', 'fundo', 'securitizacao', 'cessao recebiveis', 'recebiveis'],
    category: 'financeiro',
    answer: `**Seguro de Crédito e Cessão de Recebíveis (FIDC)**\n\nO seguro de crédito **potencializa** operações de cessão de recebíveis.\n\n**Como funciona com FIDC:**\n• Empresa cede recebíveis para um FIDC\n• Recebíveis **segurados** têm rating melhor\n• FIDC aceita com **deságio menor**\n• Empresa obtém **capital mais barato**\n\n**Benefícios do seguro para FIDC:**\n| Aspecto | Sem Seguro | Com Seguro |\n|---------|-----------|----------|\n| Rating dos recebíveis | Menor | Maior |\n| Deságio | 2% - 5% ao mês | 1% - 2,5% ao mês |\n| Volume aceito | Limitado | Ampliado |\n| Subordinação | 20% - 30% | 10% - 15% |\n\n**Economia potencial:**\n• Carteira de R$ 50M\n• Economia de 1% ao mês no deságio\n• = R$ 500.000/mês = **R$ 6M/ano**\n• Prêmio do seguro: R$ 100.000/ano\n• **ROI: 60x**\n\n**Estruturas comuns:**\n• FIDC exclusivo com seguro de crédito\n• Factoring com cobertura de seguro\n• Forfaiting com seguro (exportação)\n\nMuitos gestores de FIDC **exigem** seguro de crédito como pré-condição.`
  },
  {
    keywords: ['compliance', 'auditoria', 'governanca', 'controle interno'],
    category: 'governanca',
    answer: `**Seguro de Crédito e Governança Corporativa**\n\nO seguro de crédito é um **instrumento de governança** reconhecido.\n\n**Benefícios de compliance:**\n• Demonstra gestão profissional de riscos\n• Atende exigências de conselhos e comitês\n• Reduz provisão para devedores duvidosos (PDD)\n• Melhora relatórios de gestão de risco\n\n**Para empresas listadas:**\n• Atende requisitos de disclosure de riscos (CVM)\n• Demonstra mitigação ativa de risco de crédito\n• Melhora avaliação por agências de rating\n\n**Para auditoria:**\n• Recebíveis segurados têm tratamento contábil diferenciado\n• Redução de PDD impacta positivamente o resultado\n• Documentação organizada facilita auditoria\n\n**Para financiadores/investidores:**\n• Demonstra gestão responsável\n• Melhora credit score da empresa\n• Facilita captação de recursos\n\n**Normas relevantes:**\n• CPC 48 (IFRS 9) — Instrumentos financeiros\n• CPC 25 — Provisões e contingências\n• ISO 31000 — Gestão de riscos\n\nEmpresas com **boa governança** contratam seguro de crédito como parte da estratégia de gestão de riscos.`
  },
  {
    keywords: ['cotacao', 'fazer cotacao', 'solicitar', 'orcamento', 'proposta'],
    category: 'cotacao',
    answer: `**Como Fazer uma Cotação de Seguro de Crédito**\n\n**Pelo SENTINEL (mais rápido):**\n1. Clique em **"Fazer Cotação"** no topo desta página\n2. Preencha os dados da empresa\n3. Informe o faturamento a prazo\n4. Liste os principais compradores\n5. Receba cotações comparativas em **minutos**\n\n**Informações necessárias para cotação:**\n• CNPJ da empresa\n• Faturamento total e a prazo (últimos 12 meses)\n• Número de compradores ativos\n• Prazo médio de pagamento\n• Setores dos compradores\n• Histórico de inadimplência\n• Se exporta: países e volumes\n\n**O que você recebe:**\n• Comparativo de seguradoras\n• Condições: PMI, POS, AAD\n• Prêmio anual e forma de pagamento\n• Limite discricionário disponível\n• Prazo de vigência\n\n**Prazo da cotação:**\n• Pelo SENTINEL: **proposta preliminar em minutos**\n• Proposta definitiva: 5 a 10 dias úteis\n\n**Sem compromisso** — a cotação é gratuita!\n\n👉 Clique em **"Fazer Cotação"** acima para começar agora.`
  },

  // ── Termos Contratuais ──
  {
    keywords: ['clausula', 'condicoes gerais', 'contrato', 'termos', 'endosso'],
    category: 'contrato',
    answer: `**Termos Contratuais do Seguro de Crédito**\n\n**Estrutura do contrato:**\n\n1. **Condições Gerais**\n   • Definições\n   • Coberturas e exclusões\n   • Obrigações do segurado\n   • Processo de sinistro\n   • Disposições gerais\n\n2. **Condições Especiais**\n   • PMI e POS\n   • AAD/Franquia\n   • Limites por tipo\n   • Prazos de notificação\n\n3. **Condições Particulares**\n   • Dados do segurado\n   • Vigência\n   • Prêmio\n   • Lista de compradores\n   • Limites aprovados\n\n**Cláusulas importantes:**\n• **Notificação de atraso:** Prazo para avisar a seguradora (30-60 dias)\n• **Declaração de faturamento:** Mensal ou trimestral\n• **Exclusões:** Partes relacionadas, disputas comerciais, multas\n• **Sub-rogação:** Seguradora assume direitos de cobrança\n• **Cancelamento de limite:** Seguradora pode reduzir/cancelar\n\n**Endossos comuns:**\n• Inclusão/exclusão de compradores\n• Alteração de PMI ou AAD\n• Extensão de cobertura geográfica\n• Ajuste de prêmio (provisório → definitivo)`
  },
  {
    keywords: ['exclusao', 'nao coberto', 'o que nao cobre', 'excecao', 'restricao'],
    category: 'contrato',
    answer: `**Exclusões do Seguro de Crédito — O que NÃO é coberto**\n\n**Exclusões comuns:**\n\n1. **Partes relacionadas**\n   • Vendas para empresas do mesmo grupo\n   • Sócios, diretores ou seus familiares\n\n2. **Disputas comerciais**\n   • Devedor contesta qualidade do produto\n   • Divergência sobre quantidade ou preço\n   • Produto devolvido\n\n3. **Venda acima do limite**\n   • Exposição excede o limite aprovado\n   • Venda após cancelamento do limite\n\n4. **Descumprimento de obrigações**\n   • Não notificar atraso no prazo\n   • Não declarar faturamento\n   • Informações falsas\n\n5. **Eventos específicos:**\n   • Flutuação cambial (só o crédito é coberto)\n   • Juros e multas contratuais\n   • Danos morais\n   • Penalidades contratuais\n   • Créditos prescritos\n\n6. **Risco nuclear, guerra (em crédito interno)**\n   • Atos de guerra no Brasil\n   • Contaminação nuclear\n\n**Dica:** Leia atentamente as **Condições Gerais** da apólice. Em caso de dúvida, consulte seu corretor antes de assumir que algo está coberto.`
  },

  // ── Dúvidas Específicas ──
  {
    keywords: ['sub-rogacao', 'subrogacao', 'direito cobrar', 'seguradora cobra'],
    category: 'tecnico',
    answer: `**Sub-rogação no Seguro de Crédito**\n\nApós pagar a indenização, a seguradora assume o **direito de cobrar** o devedor.\n\n**Como funciona:**\n1. Segurado notifica o sinistro\n2. Seguradora analisa e paga a indenização\n3. Seguradora se **sub-roga** nos direitos do segurado\n4. Seguradora cobra o devedor (judicial ou extrajudicial)\n\n**Base legal:** Código Civil, Art. 786\n\n**Valores recuperados:**\n• Se a seguradora recuperar valores do devedor:\n   - Primeiro reembolsa a **indenização paga**\n   - Excedente vai para o segurado (referente à POS)\n• Divisão é **proporcional** à participação de cada um\n\n**Exemplo:**\n• Perda: R$ 1.000.000\n• PMI 85%: Seguradora pagou R$ 850.000\n• POS 15%: Segurado absorveu R$ 150.000\n• Recuperação: R$ 600.000\n• Seguradora recebe: R$ 510.000 (85%)\n• Segurado recebe: R$ 90.000 (15%)\n\n**Importante:**\n• O segurado deve colaborar com a cobrança\n• Não pode negociar separadamente com o devedor\n• Documentação deve ser mantida organizada`
  },
  {
    keywords: ['declaracao faturamento', 'report', 'informar vendas', 'reporte'],
    category: 'processo',
    answer: `**Declaração de Faturamento no Seguro de Crédito**\n\nO segurado deve informar periodicamente o faturamento à seguradora.\n\n**Frequência:** Mensal ou trimestral (definido na apólice)\n\n**O que declarar:**\n• Faturamento total a prazo no período\n• Por comprador (se solicitado)\n• Exposição atual por devedor\n• Atrasos superiores a 30 dias\n\n**Por que é importante:**\n• O prêmio definitivo é calculado sobre o **faturamento real**\n• Prêmio provisório é estimado na contratação\n• No final do período, faz-se o **ajuste** (mais ou menos a pagar)\n\n**Mecanismo de prêmio:**\n• **Prêmio Mínimo:** Valor fixo, pago independente do faturamento\n• **Prêmio Provisório:** Estimativa inicial\n• **Prêmio Definitivo:** Calculado sobre faturamento real declarado\n• **Ajuste:** Diferença entre provisório e definitivo\n\n**Não declarar pode:**\n• Prejudicar cobertura em sinistro\n• Gerar multa contratual\n• Causar cancelamento da apólice\n\n**Dica:** Automatize a declaração integrando o ERP com a plataforma da seguradora.`
  },
  {
    keywords: ['prazo pagamento', 'dias', '30 60 90', 'vencimento', 'payment terms'],
    category: 'tecnico',
    answer: `**Prazos de Pagamento Cobertos pelo Seguro de Crédito**\n\n**Prazos mais comuns:**\n| Prazo | Frequência | Observação |\n|-------|-----------|------------|\n| 30 dias | Alta | Muito comum no Brasil |\n| 60 dias | Alta | Padrão para indústria |\n| 90 dias | Média | Comum em exportação |\n| 120 dias | Baixa | Setores específicos |\n| 180 dias | Baixa | Máximo padrão |\n| 360 dias | Rara | Bens de capital |\n\n**Impacto no prêmio:**\n• Prazo maior = **risco maior** = prêmio mais alto\n• Prazo de 30 dias: taxa base\n• Prazo de 90 dias: +10% a +20% sobre taxa base\n• Prazo de 180 dias: +30% a +50% sobre taxa base\n\n**Prazos acima de 180 dias:**\n• Requerem análise especial\n• Podem ter PMI diferenciado\n• Geralmente para exportação ou bens de capital\n\n**Dica:** Informe o prazo correto ao contratar. Vendas com prazo superior ao declarado na apólice podem **não estar cobertas**.`
  },

  // ── Aprofundamento em Tópicos ──
  {
    keywords: ['como funciona mesmo', 'explica melhor', 'detalhe', 'aprofundar', 'mais informacao'],
    category: 'aprofundamento',
    answer: `**Seguro de Crédito em Detalhes — Fluxo Completo**\n\n**Fase 1: Contratação**\n\`\`\`\nEmpresa → Corretor → Seguradora\n   ↓          ↓          ↓\nDados    Cotação    Análise\n   ↓          ↓          ↓\n         Proposta ← Aceite\n              ↓\n         APÓLICE EMITIDA\n\`\`\`\n\n**Fase 2: Operação Diária**\n\`\`\`\nVenda a prazo → Verifica limite → OK → Vende\n                                  ↓\n                             SEM limite → Solicita à seguradora\n                                  ↓\n                        Aprovado → Vende\n                        Negado → Decide sem cobertura\n\`\`\`\n\n**Fase 3: Sinistro**\n\`\`\`\nComprador não paga → Notifica (30-60 dias)\n       ↓\nMora prolongada (150-180 dias) OU Insolvência\n       ↓\nRegulação pela seguradora\n       ↓\nIndenização (30-60 dias)\n       ↓\nSub-rogação (seguradora cobra o devedor)\n\`\`\`\n\n**Fase 4: Renovação**\n\`\`\`\n12 meses → Avaliação sinistralidade\n    ↓\nBônus (sem sinistros) ou Malus (com sinistros)\n    ↓\nNovas condições negociadas\n    ↓\nRENOVAÇÃO\n\`\`\`\n\nEsse ciclo se repete anualmente. Com o tempo, o histórico acumulado gera **condições cada vez melhores** para a empresa.`
  },
  {
    keywords: ['reembolso', 'devolver premio', 'estorno', 'cancelamento antecipado'],
    category: 'processo',
    answer: `**Reembolso e Estorno de Prêmio**\n\n**Cancelamento antecipado pelo segurado:**\n• Direito a devolução **proporcional** do prêmio\n• Cálculo: prêmio total × (dias restantes / 365)\n• Desconto de despesas administrativas (5-10%)\n\n**Exemplo:**\n• Prêmio anual: R$ 120.000\n• Cancelamento após 6 meses\n• Reembolso: R$ 60.000 - despesas = ~R$ 54.000\n\n**Ajuste de prêmio (mais comum):**\n• Se faturamento real < estimado → crédito\n• Se faturamento real > estimado → complemento\n• Ajuste feito no final do período (anual ou trimestral)\n\n**Prêmio Mínimo:**\n• Se o faturamento for muito baixo, o prêmio mínimo se aplica\n• Não há reembolso abaixo do mínimo\n\n**Sinistro e prêmio:**\n• Receber indenização NÃO gera aumento imediato\n• Impacto é na **renovação** (malus)\n• Não existe "estorno" da indenização\n\n**Dica:** Antes de cancelar, verifique o período de run-off (cauda) e se vale manter a apólice até o vencimento natural.`
  },
  {
    keywords: ['benchmark', 'indicador', 'kpi', 'metrica', 'desempenho'],
    category: 'gestao',
    answer: `**KPIs e Benchmarks em Seguro de Crédito**\n\n**Indicadores para monitorar:**\n\n| KPI | Fórmula | Benchmark |\n|-----|---------|----------|\n| **Sinistralidade** | Indenizações / Prêmio | < 60% (bom) |\n| **Loss Ratio** | Perdas / Faturamento segurado | < 1% (bom) |\n| **Cobertura** | Faturamento segurado / Total | > 80% |\n| **Utilização** | Exposição / Limites aprovados | 60-80% |\n| **NQL Rate** | NQLs / Total sinistros | < 10% |\n| **Tempo de aprovação** | Dias para aprovação de limite | < 5 dias |\n| **Notificação** | % atrasos notificados no prazo | 100% |\n\n**Relatórios recomendados:**\n\n• **Mensal:**\n   - Faturamento declarado\n   - Atrasos > 30 dias\n   - Limites utilizados vs aprovados\n\n• **Trimestral:**\n   - Sinistralidade acumulada\n   - Novos limites solicitados/aprovados\n   - Exposição por comprador/setor\n\n• **Anual:**\n   - Análise de sinistralidade completa\n   - ROI do seguro\n   - Benchmarking com mercado\n\n**Dica:** O SENTINEL gera esses relatórios automaticamente no dashboard.`
  },
  {
    keywords: ['warranty', 'garantia produto', 'defeito', 'qualidade', 'recall'],
    category: 'avancado',
    answer: `**Seguro de Crédito e Garantia de Produto — Diferença Importante**\n\n**O que o Seguro de Crédito NÃO cobre:**\n• Defeitos no produto vendido\n• Recall (recolhimento)\n• Garantia de performance/qualidade\n• Responsabilidade civil pelo produto\n\n**Cenário de risco:**\n• Empresa vende produto para comprador\n• Comprador alega defeito e se recusa a pagar\n• Isso é **disputa comercial** — NÃO é coberto pelo seguro de crédito\n\n**Para cada risco, o seguro adequado:**\n| Risco | Seguro Adequado |\n|-------|----------------|\n| Comprador não paga | **Seguro de Crédito** |\n| Produto causa dano a terceiro | Seguro de Responsabilidade Civil |\n| Produto precisa de recall | Seguro de Recall |\n| Produto é danificado no transporte | Seguro de Transporte |\n\n**Como evitar que defeito vire NQL:**\n• Tenha **controles de qualidade** documentados\n• Obtenha **aceite formal** do comprador na entrega\n• Resolva reclamações rapidamente\n• Separe a questão comercial da financeira\n\n**Na prática:** Se o produto foi aceito e o comprador simplesmente não paga, **é coberto**. Se o comprador contesta a qualidade, **não é coberto** até resolução.`
  },
  {
    keywords: ['joint venture', 'consorcio', 'parceria', 'operacao conjunta'],
    category: 'avancado',
    answer: `**Seguro de Crédito em Operações Conjuntas**\n\n**Joint Ventures e Consórcios:**\n\n**Quem contrata?**\n• Cada empresa do consórcio pode ter sua própria apólice\n• Ou: apólice conjunta em nome do consórcio/SPE\n\n**Particularidades:**\n• Vendas **entre** os parceiros: geralmente excluídas (partes relacionadas)\n• Vendas do consórcio para terceiros: cobertas normalmente\n• Responsabilidade solidária pode complicar a análise\n\n**SPE (Sociedade de Propósito Específico):**\n• Pode contratar seguro de crédito em seu nome\n• Seguradora analisa a SPE e seus controladores\n• Garantia dos controladores pode ampliar limites\n\n**Operações trilaterais (triangulares):**\n• A vende para B, mas B pede entrega para C\n• Seguro cobre A→B (relação contratual)\n• Cuidado: documentação deve ser clara sobre quem é o devedor\n\n**Dica:** Em operações complexas com múltiplas partes, consulte a seguradora **antes** de estruturar a operação para garantir a cobertura.`
  },

  // ── Perguntas Práticas do Dia a Dia ──
  {
    keywords: ['limite negado', 'recusado', 'nao aprovado', 'seguradora negou', 'recusa'],
    category: 'pratico',
    answer: `**O que Fazer Quando a Seguradora Nega um Limite de Crédito**\n\n**Por que negam:**\n• Devedor com **restrições cadastrais** (SPC, Serasa)\n• Balanço com **prejuízo** ou alto endividamento\n• Setor de **alto risco** (ex: construção civil em crise)\n• Devedor **sem informações** financeiras disponíveis\n• Exposição já elevada na carteira da seguradora\n\n**O que fazer:**\n\n1. **Solicitar reconsideração**\n   • Apresente informações adicionais do devedor\n   • Balanço atualizado, referências comerciais\n   • Histórico de pagamento com sua empresa\n\n2. **Solicitar limite menor**\n   • Se pediu R$ 500k, peça R$ 200k\n   • Limite parcial é melhor que zero\n\n3. **Usar limite discricionário**\n   • Se o devedor se enquadra nos critérios\n   • Geralmente R$ 20k a R$ 100k\n\n4. **Buscar outra seguradora**\n   • Cada seguradora tem apetite diferente\n   • Allianz pode negar, Coface pode aprovar\n\n5. **Vender com garantias adicionais**\n   • Carta de crédito, aval, penhor\n   • Para esse comprador específico\n\n**Importante:** Limite negado é um **sinal de alerta**. Considere reduzir a exposição ao comprador mesmo sem seguro.`
  },
  {
    keywords: ['limite reduzido', 'limite cortado', 'reducao', 'aviso reducao'],
    category: 'pratico',
    answer: `**Limite de Crédito Reduzido pela Seguradora**\n\n**Por que a seguradora reduz limites:**\n• Deterioração financeira do devedor\n• Protestos ou ações judiciais contra o devedor\n• Setor entrando em crise\n• Sinais de dificuldade de pagamento no mercado\n• Reclassificação de rating\n\n**O que a apólice diz:**\n• Seguradora pode reduzir ou cancelar limites **a qualquer momento**\n• Deve notificar o segurado (geralmente 30 dias de antecedência)\n• Vendas realizadas **antes** da redução: cobertas pelo limite anterior\n• Vendas **após** a redução: cobertas apenas até o novo limite\n\n**Ação imediata:**\n\n1. **Verifique sua exposição atual** ao devedor\n2. **Suspenda novas vendas** que excedam o novo limite\n3. **Intensifique a cobrança** de faturas em aberto\n4. **Solicite informações** à seguradora sobre o motivo\n5. **Avalie garantias adicionais** para o excedente\n\n**Dica:** Reduções de limite são **alertas precoces**. Historicamente, 30-40% dos devedores com limite reduzido apresentam problemas de pagamento nos meses seguintes.\n\nUse essa informação a seu favor — é um dos maiores valores do seguro de crédito.`
  },
  {
    keywords: ['vender sem limite', 'sem cobertura', 'exceder limite', 'acima limite'],
    category: 'pratico',
    answer: `**Vendas Acima ou Sem Limite de Crédito**\n\n**Situação:** Você quer vender R$ 500k mas o limite é R$ 300k.\n\n**O que está coberto:**\n• Apenas os **primeiros R$ 300k** (até o limite)\n• O excedente de R$ 200k **não tem cobertura**\n\n**Opções:**\n\n1. **Solicitar aumento de limite**\n   • Peça à seguradora que reavalie\n   • Apresente justificativa e dados do devedor\n   • Prazo: 24-72 horas\n\n2. **Top-Up Cover**\n   • Contrate cobertura complementar\n   • Com outra seguradora se necessário\n\n3. **Dividir a venda**\n   • Venda R$ 300k agora (coberto)\n   • Novo pedido após pagamento\n\n4. **Garantias adicionais**\n   • Peça aval ou carta de crédito para o excedente\n\n5. **Aceitar o risco**\n   • Decisão comercial: vender sem cobertura total\n   • Documente a decisão internamente\n\n**Atenção:**\n• Não "ajuste" notas fiscais para ficar dentro do limite\n• A seguradora verifica a exposição real no sinistro\n• Fraude anula toda a cobertura\n\n**Regra:** Sempre respeite os limites. Se precisar de mais, **peça aumento antes** de vender.`
  },
  {
    keywords: ['recebimento parcial', 'pagamento parcial', 'devedor pagou parte', 'acordo'],
    category: 'pratico',
    answer: `**Recebimento Parcial e Acordo com Devedor**\n\n**Se o devedor pagar parte da dívida:**\n\n1. **Notifique a seguradora** imediatamente\n2. Informe o valor recebido e o saldo em aberto\n3. A indenização será calculada sobre o **saldo remanescente**\n\n**Exemplo:**\n• Dívida total: R$ 1.000.000\n• Pagamento parcial: R$ 400.000\n• Saldo em aberto: R$ 600.000\n• PMI 85%: Indenização = R$ 510.000\n\n**Acordo com devedor (negociação):**\n\n⚠️ **Cuidado:** Você **deve** informar a seguradora antes de fechar qualquer acordo.\n\n**Regras:**\n• Não conceda **desconto** sem aprovação da seguradora\n• Não estenda **prazo** sem autorização\n• Não aceite **dação em pagamento** sem consulta\n\n**Por quê?**\n• A seguradora tem interesse no crédito (sub-rogação)\n• Acordos unilaterais podem comprometer a cobertura\n• A seguradora pode ter estratégia de cobrança diferente\n\n**Boa prática:** Sempre consulte a seguradora antes de negociar com devedor inadimplente. Frequentemente, a **cobrança da seguradora** obtém melhores resultados do que a negociação direta.`
  },

  // ── Glossário Rápido ──
  {
    keywords: ['glossario', 'termos', 'vocabulario', 'definicoes', 'significado'],
    category: 'glossario',
    answer: `**Glossário Rápido — Seguro de Crédito**\n\n| Termo | Significado |\n|-------|------------|\n| **PMI** | Percentual Máximo de Indenização |\n| **POS** | Participação Obrigatória do Segurado |\n| **AAD** | Annual Aggregate Deductible (franquia anual) |\n| **MCL** | Maximum Credit Limit |\n| **NQL** | Non-Qualifying Loss (perda não coberta) |\n| **DRA** | Debtor Risk Assessment (Coface) |\n| **Whole Turnover** | Apólice que cobre toda a carteira |\n| **Key Buyer** | Cobertura de compradores selecionados |\n| **Single Risk** | Cobertura de operação única |\n| **Top-Up** | Cobertura complementar |\n| **Excess of Loss** | Excesso de danos (sobre franquia) |\n| **Mora Prolongada** | Atraso > 150/180 dias |\n| **Insolvência** | Falência ou Recuperação Judicial |\n| **Sub-rogação** | Seguradora assume direito de cobrança |\n| **Limite Discricionário** | Limite automático sem aprovação |\n| **Endosso** | Alteração na apólice |\n| **Prêmio** | Valor pago pelo seguro |\n| **Sinistro** | Evento que gera indenização |\n| **Run-off** | Período de cauda após cancelamento |\n| **Bonus/Malus** | Ajuste por sinistralidade |\n\nPrecisa de mais detalhes sobre algum termo? É só perguntar!`
  },

  // ── Planejamento Financeiro ──
  {
    keywords: ['planejamento', 'orcamento', 'budget', 'planejar', 'previsao'],
    category: 'financeiro',
    answer: `**Planejamento Financeiro com Seguro de Crédito**\n\n**Incluindo o seguro no orçamento:**\n\n**Custo anual estimado:**\n• Faturamento a prazo × taxa (0,15% a 0,40%)\n• Exemplo: R$ 80M × 0,22% = **R$ 176.000/ano**\n• Mensal: ~R$ 14.700\n\n**Onde lançar no orçamento:**\n• Despesa Operacional → Seguros\n• OU: Despesa Comercial → Proteção de Crédito\n• Não é despesa financeira\n\n**Impacto no DRE:**\n\n| Linha | Sem Seguro | Com Seguro |\n|-------|-----------|----------|\n| Receita Bruta | R$ 80M | R$ 80M |\n| (-) Deduções | R$ 12M | R$ 12M |\n| Receita Líquida | R$ 68M | R$ 68M |\n| (-) CMV | R$ 48M | R$ 48M |\n| Lucro Bruto | R$ 20M | R$ 20M |\n| (-) Despesas Operacionais | R$ 12M | R$ 12,18M (+seguro) |\n| (-) PDD | R$ 1,5M | R$ 0,3M (-seguro protege) |\n| (-) Perdas com inadimplência | R$ 1,5M | R$ 0,23M (POS) |\n| **Lucro Operacional** | **R$ 5,0M** | **R$ 7,29M** |\n\n**Resultado:** O seguro **aumenta** o lucro operacional ao reduzir PDD e perdas.\n\n**Para CFOs e Controllers:**\n• Seguro de crédito é **investimento com retorno mensurável**\n• Melhora previsibilidade do fluxo de caixa\n• Reduz volatilidade do resultado\n• Facilita planejamento de longo prazo\n\nInclua o seguro de crédito no **budget anual** como parte da estratégia de gestão de risco.`
  },

  // ── ESG e Sustentabilidade ──
  {
    keywords: ['esg', 'sustentabilidade', 'ambiental', 'social', 'governanca esg'],
    category: 'avancado',
    answer: `**ESG e Seguro de Crédito**\n\nA agenda ESG está impactando o seguro de crédito.\n\n**Environmental (Ambiental):**\n• Seguradoras avaliam **risco ambiental** dos devedores\n• Setores poluentes podem ter restrições de cobertura\n• Compliance ambiental influencia o scoring\n• Tendência: prêmio diferenciado para carteiras "verdes"\n\n**Social:**\n• Práticas trabalhistas dos devedores são avaliadas\n• Trabalho escravo/infantil: pode levar a cancelamento de limite\n• Diversidade e inclusão: fator de avaliação\n• Impacto social positivo melhora o perfil de risco\n\n**Governance (Governança):**\n• Governança corporativa forte = menor risco de crédito\n• Empresas familiares vs profissionalizadas\n• Transparência financeira\n• Compliance anticorrupção\n\n**Tendências ESG no seguro de crédito:**\n• **Green Premium:** Desconto para carteiras sustentáveis\n• **ESG Scoring:** Incluir fatores ESG na análise de crédito\n• **Reporting ESG:** Relatórios de impacto integrados\n• **Exclusion Lists:** Setores controversos (carvão, tabaco, armas)\n\n**Na prática brasileira:**\n• SUSEP está incorporando ESG na regulamentação\n• Grandes seguradoras já têm políticas ESG\n• Impacto ainda é limitado, mas crescendo rapidamente\n\nEmpresas com **boas práticas ESG** terão vantagens crescentes no seguro de crédito.`
  },

  // ── Supply Chain e Cadeia ──
  {
    keywords: ['supply chain', 'cadeia suprimentos', 'fornecedor', 'cadeia', 'upstream downstream'],
    category: 'avancado',
    answer: `**Seguro de Crédito na Cadeia de Suprimentos**\n\n**Proteção em toda a cadeia:**\n\n\`\`\`\nFornecedor de matéria-prima\n       ↓ (vende a prazo)\n   Fabricante ← SEGURADO (protege vendas a prazo)\n       ↓ (vende a prazo)\n   Distribuidor ← DEVEDOR (coberto pelo seguro)\n       ↓ (vende a prazo)\n    Varejista\n       ↓\n  Consumidor Final\n\`\`\`\n\n**Quem pode segurar:**\n• Qualquer empresa que venda **a prazo** para outra empresa\n• Fabricante → Distribuidor: sim\n• Distribuidor → Varejista: sim\n• Fornecedor → Fabricante: sim\n\n**Risco de cadeia:**\n• Se o varejista não paga o distribuidor...\n• O distribuidor pode não pagar o fabricante...\n• Efeito cascata de inadimplência\n\n**Como o seguro mitiga:**\n• Protege cada elo da cadeia individualmente\n• Seguradora monitora a saúde de toda a cadeia\n• Alertas precoces de deterioração\n• Indenização previne o efeito cascata\n\n**Tendência:** Seguradoras estão desenvolvendo soluções de **supply chain finance** integradas ao seguro de crédito, oferecendo proteção e financiamento em uma única solução.`
  },
  {
    keywords: ['natural disaster', 'desastre', 'forca maior', 'force majeure', 'pandemia seguro'],
    category: 'avancado',
    answer: `**Seguro de Crédito e Eventos de Força Maior**\n\n**Força maior (Force Majeure):**\n• Eventos imprevisíveis e inevitáveis\n• Terremotos, enchentes, pandemias\n• Podem impedir o devedor de pagar\n\n**O seguro cobre inadimplência por força maior?**\n\n**Crédito Interno (doméstico):**\n• Se o devedor não paga por qualquer motivo → **coberto**\n• A causa da inadimplência não importa\n• O que importa: mora prolongada (150+ dias) ou insolvência\n• Eventos climáticos que levam à inadimplência: **cobertos**\n\n**Crédito à Exportação:**\n• Risco comercial (devedor não paga): **coberto**\n• Risco político (governo impede pagamento): **coberto**\n• Evento natural no país destino: pode se enquadrar como risco político\n\n**Exclusões possíveis:**\n• Guerra nuclear (exclusão padrão)\n• Sanções internacionais aplicáveis\n• Embargo comercial\n\n**Lição da COVID-19:**\n• Seguradoras pagaram bilhões em sinistros globalmente\n• Algumas reduziram limites preventivamente\n• Empresas com seguro sobreviveram melhor\n• Prêmios aumentaram na renovação\n\n**Resumo:** Na maioria dos casos, se o devedor não paga — independente do motivo — e as condições da apólice são cumpridas, o seguro **paga a indenização**.`
  },

  // ── Contextual / Situacional ──
  {
    keywords: ['crise economica', 'inflacao', 'selic', 'juros altos', 'dolar alto'],
    category: 'mercado',
    answer: `**Seguro de Crédito no Cenário Econômico Atual**\n\n**Impacto de juros altos:**\n• Custo do crédito sobe → empresas têm mais dificuldade\n• Inadimplência **aumenta** em cenários de juros altos\n• Seguro de crédito se torna **mais importante**\n\n**Impacto do dólar alto:**\n• Importadores sofrem mais → risco de inadimplência\n• Exportadores se beneficiam → melhor caixa\n• Apólice de exportação em USD se torna mais valiosa\n\n**Impacto da inflação:**\n• Margem das empresas é comprimida\n• Menor capacidade de absorver calotes\n• Seguro protege margem já apertada\n\n**Dados históricos:**\n| Cenário | Inadimplência B2B |\n|---------|-------------------|\n| Economia estável | 2% - 3% |\n| Desaceleração | 3% - 5% |\n| Recessão | 5% - 8% |\n| Crise severa | 8% - 15% |\n\n**Estratégia recomendada:**\n• **Antes da crise:** Contrate e construa histórico\n• **Durante a crise:** Mantenha a apólice, use as informações\n• **Pós-crise:** Negocie bônus pela fidelidade\n\nO seguro de crédito é **contracíclico** — seu valor aumenta quando a economia piora.`
  },
  {
    keywords: ['novo cliente', 'primeiro pedido', 'cliente novo', 'prospect', 'aprovar cliente'],
    category: 'pratico',
    answer: `**Como Aprovar um Novo Cliente com Seguro de Crédito**\n\n**Passo a passo:**\n\n1. **Receba o pedido** do novo cliente\n2. **Consulte o limite discricionário:**\n   • Se o valor do pedido está dentro do limite discricionário (ex: até R$ 50k)\n   • E o cliente não tem restrições (Serasa limpa)\n   • → Pode vender com cobertura imediata\n\n3. **Se precisar de limite nomeado:**\n   • Solicite limite à seguradora (via portal ou SENTINEL)\n   • Informe: CNPJ, razão social, valor desejado\n   • Prazo de aprovação: **24 a 72 horas**\n\n4. **Seguradora analisa e responde:**\n   • ✅ **Aprovado:** Venda com cobertura\n   • ⚠️ **Aprovado parcial:** Limite menor que o solicitado\n   • ❌ **Negado:** Venda sem cobertura (decisão sua)\n\n**Dica para novos clientes:**\n• Comece com pedidos menores (dentro do discricionário)\n• Se o cliente pagar bem, solicite limite nomeado\n• Use o histórico de pagamento como argumento\n\n**O seguro de crédito como ferramenta de vendas:**\n• Novo cliente com limite aprovado = **sinal verde da seguradora**\n• Dá confiança ao time comercial para vender\n• Informação valiosa sobre a saúde financeira do prospect\n\nNo **SENTINEL**, a consulta de limite pode ser integrada ao processo de aprovação de pedidos.`
  },

  // ── Perguntas de Decisão ──
  {
    keywords: ['roi', 'retorno', 'investimento', 'vale investimento', 'custo beneficio'],
    category: 'financeiro',
    answer: `**ROI do Seguro de Crédito — Retorno sobre Investimento**\n\n**Cálculo simplificado do ROI:**\n\n**Cenário conservador:**\n• Faturamento a prazo: R$ 50M/ano\n• Taxa de inadimplência média: 2%\n• Perda anual sem seguro: R$ 1.000.000\n• Prêmio do seguro (0,20%): R$ 100.000\n• Indenização recebida (85%): R$ 850.000\n• Perda com seguro: R$ 100.000 (prêmio) + R$ 150.000 (POS) = R$ 250.000\n• **Economia: R$ 750.000/ano**\n• **ROI: 750%**\n\n**Cenário com benefícios financeiros:**\n• Economia acima: R$ 750.000\n• Redução no custo de crédito bancário (-1%): R$ 200.000\n• Redução de PDD: R$ 100.000\n• Menor necessidade de equipe de crédito: R$ 150.000\n• **Benefício total: R$ 1.200.000**\n• **ROI total: 1.200%**\n\n**Mesmo SEM sinistros, o seguro vale a pena:**\n• Informação de crédito dos compradores\n• Melhores condições bancárias\n• Confiança para crescer\n• Tranquilidade empresarial\n\n**Analogia:** Você paga seguro do carro todo ano. Mesmo sem usar, o valor está na **proteção**. Com seguro de crédito, o valor está na proteção E na **inteligência**.`
  },
  {
    keywords: ['quando contratar', 'momento certo', 'hora certa', 'melhor momento'],
    category: 'estrategico',
    answer: `**Quando é o Melhor Momento para Contratar Seguro de Crédito?**\n\n**A resposta curta:** AGORA.\n\n**Por quê?**\n\n**1. Em tempos bons:**\n• Prêmio é **mais barato** (menos risco percebido)\n• Seguradoras aprovam **mais limites**\n• Começa a construir **histórico de bônus**\n• Tem escolha de seguradoras\n\n**2. Em tempos ruins (crise):**\n• Prêmio é **mais caro** (mais risco)\n• Seguradoras são **mais restritivas**\n• Pode não conseguir cobertura para certos compradores\n• Demanda alta → menos negociação\n\n**Sinais de que precisa contratar URGENTE:**\n• Um cliente grande está mostrando sinais de dificuldade\n• Sua inadimplência está aumentando\n• O setor está entrando em crise\n• Está expandindo para novos mercados\n• Vai fechar um contrato grande com cliente novo\n\n**O erro mais comum:** Esperar ter um problema para buscar seguro. Quando o problema acontece, é **tarde demais** — o seguro não cobre riscos pré-existentes.\n\n**Regra de ouro:** Contrate quando **não precisa**, para estar protegido quando **precisar**.\n\n**A Fairfield pode fazer uma cotação em minutos pelo SENTINEL.** Clique em "Fazer Cotação" para começar!`
  },

  // ── Mais Perguntas Frequentes ──
  {
    keywords: ['apolice mista', 'mista', 'interno e exportacao junto', 'combinar'],
    category: 'cobertura',
    answer: `**Apólice Mista — Crédito Interno + Exportação**\n\nÉ possível ter uma **única apólice** que cubra vendas domésticas e internacionais.\n\n**Como funciona:**\n• Ramo 0171 (interno) + Ramo 0172 (exportação) na mesma apólice\n• Condições podem ser diferentes para cada ramo\n• Prêmio unificado ou separado por ramo\n\n**Vantagens:**\n• Gestão simplificada (uma apólice, um corretor)\n• Prêmio total pode ser menor (diversificação)\n• Um único ponto de contato na seguradora\n• Relatórios consolidados\n\n**Condições típicas:**\n| Aspecto | Interno | Exportação |\n|---------|---------|------------|\n| PMI | 85% | 90% |\n| POS | 15% | 10% |\n| IOF | 0% | 0% |\n| Risco Político | Não | Sim |\n| Moeda | BRL | USD/EUR |\n| Mora | 150 dias | 180 dias |\n\n**Seguradoras que oferecem apólice mista:**\n• Allianz Trade\n• Coface\n• Atradius\n• CESCE (com foco ibero-americano)\n\n**Ideal para:** Empresas que vendem tanto no mercado doméstico quanto exportam. A maioria dos exportadores brasileiros tem apólice mista.`
  },
  {
    keywords: ['provisao tecnica', 'ibnr', 'reserva', 'capital seguradora'],
    category: 'legislacao',
    answer: `**Provisões Técnicas no Seguro de Crédito**\n\n**O que são:**\nReservas que a seguradora deve manter para honrar seus compromissos futuros.\n\n**Tipos de provisões:**\n\n| Provisão | Significado |\n|----------|------------|\n| **PPNG** | Prêmios Não Ganhos (prêmio futuro) |\n| **PSL** | Sinistros a Liquidar (sinistros avisados) |\n| **IBNR** | Incurred But Not Reported (sinistros ocorridos mas não avisados) |\n| **IBNER** | Incurred But Not Enough Reported (sinistros subestimados) |\n| **PCC** | Provisão Complementar de Cobertura |\n\n**Por que importa para o segurado:**\n• Provisões adequadas = **segurança** de que a seguradora pagará\n• SUSEP fiscaliza as provisões regularmente\n• Insuficiência de provisões pode levar à intervenção da SUSEP\n\n**Capital de solvência:**\n• Além das provisões, a seguradora deve ter **capital próprio** suficiente\n• Calculado com base no risco assumido\n• Regulamentado pela SUSEP (Resolução CNSP 321/2015)\n\n**Resseguro e provisões:**\n• Parte das provisões é cedida ao ressegurador\n• Reduz a exposição líquida da seguradora\n• Maior capacidade para aceitar riscos\n\n**Dica:** Seguradoras com **rating alto** (AA, A+) demonstram solidez em provisões e capital. Prefira estas para maior segurança.`
  },
  {
    keywords: ['claim management', 'gestao sinistro', 'administrar sinistro', 'acompanhar sinistro'],
    category: 'processo',
    answer: `**Gestão de Sinistros — Melhores Práticas**\n\n**Antes do sinistro (prevenção):**\n• Monitore o aging de recebíveis semanalmente\n• Configure alertas para atrasos > 15 dias\n• Mantenha documentação organizada (NFs, contratos, comprovantes)\n• Atualize dados dos compradores periodicamente\n\n**Ao detectar um atraso:**\n1. **Dia 1-15:** Cobrança interna (telefone, e-mail)\n2. **Dia 15-25:** Reforce a cobrança, documente tudo\n3. **Dia 25-30:** **NOTIFIQUE A SEGURADORA** (não espere!)\n4. **Dia 30-60:** Seguradora pode iniciar cobrança\n5. **Dia 60-150:** Acompanhe junto com a seguradora\n6. **Dia 150-180:** Mora prolongada → sinistro configurado\n\n**Documentos a preparar:**\n• Cópia das notas fiscais\n• Duplicatas/boletos\n• Contrato de venda\n• Comprovante de entrega (assinado)\n• Histórico de cobrança (e-mails, cartas)\n• Correspondência com o devedor\n• Certidão de protesto (se houver)\n\n**Erros a evitar:**\n• Não notificar no prazo (**erro fatal**)\n• Negociar com o devedor sem autorização da seguradora\n• Documentação incompleta ou desorganizada\n• Não colaborar com a cobrança da seguradora\n\n**Dica:** Crie um **checklist de sinistro** e mantenha atualizado. O SENTINEL automatiza grande parte desse fluxo.`
  },
  {
    keywords: ['diferenca credit insurance surety', 'credit vs surety', 'credito garantia internacional'],
    category: 'conceito',
    answer: `**Credit Insurance vs Surety — Diferença Internacional**\n\nNo mercado internacional, os termos são frequentemente confundidos.\n\n**Trade Credit Insurance (Seguro de Crédito):**\n• Protege o **vendedor** contra inadimplência do comprador\n• Apólice geralmente anual e global\n• Indenização ao segurado (vendedor/credor)\n• Regulação: SUSEP ramos 0171 e 0172\n\n**Surety (Seguro Garantia):**\n• Garante o cumprimento de uma **obrigação contratual**\n• Três partes: tomador, segurado/beneficiário, seguradora\n• Apólice individual por contrato\n• Regulação: SUSEP ramo 0775\n\n**Comparação prática:**\n\n| Situação | Produto |\n|----------|--------|\n| Vendo a prazo e quero proteção contra calote | **Credit Insurance** |\n| Preciso garantir um contrato de obra | **Surety** |\n| Exporto e quero proteção contra inadimplência | **Credit Insurance** |\n| Participo de licitação pública | **Surety (Bid Bond)** |\n| Quero proteger meu faturamento | **Credit Insurance** |\n| Preciso garantir obrigações trabalhistas | **Surety (Judicial)** |\n\n**A Fairfield e o SENTINEL** atendem ambos os produtos. Se estiver em dúvida sobre qual se aplica ao seu caso, pergunte!`
  },

  // ── Termos em Inglês (bilíngue) ──
  {
    keywords: ['ingles', 'english', 'termos ingles', 'trade credit', 'traducao'],
    category: 'glossario',
    answer: `**Termos em Inglês — Glossário Bilíngue**\n\nTermos que você vai encontrar em apólices e documentos:\n\n| Português | Inglês |\n|-----------|--------|\n| Seguro de Crédito | Trade Credit Insurance |\n| Apólice | Policy |\n| Segurado | Policyholder / Insured |\n| Seguradora | Insurer / Underwriter |\n| Devedor | Debtor / Buyer |\n| Prêmio | Premium |\n| Sinistro | Claim |\n| Indenização | Indemnity |\n| Limite de Crédito | Credit Limit |\n| Mora Prolongada | Protracted Default |\n| Insolvência | Insolvency |\n| Franquia | Deductible / AAD |\n| Corretora | Broker |\n| Endosso | Endorsement |\n| Sub-rogação | Subrogation |\n| Risco Político | Political Risk |\n| Apólice Global | Whole Turnover |\n| Compradores Nomeados | Named Buyers / Key Buyers |\n| Limite Discricionário | Discretionary Limit |\n| Participação do Segurado | Co-insurance / POS |\n| Período de Espera | Waiting Period |\n| Declaração de Faturamento | Turnover Declaration |\n| Perda Não Qualificada | Non-Qualifying Loss (NQL) |\n| Recuperação Judicial | Judicial Recovery |\n| Falência | Bankruptcy |\n\nÚtil para **exportadores** que recebem documentos em inglês ou para comunicação com seguradoras internacionais.`
  },
  {
    keywords: ['certificacao', 'curso', 'estudar', 'aprender', 'formacao'],
    category: 'educacional',
    answer: `**Onde Aprender Mais sobre Seguro de Crédito**\n\n**Cursos e certificações:**\n\n1. **ENS (Escola Nacional de Seguros)**\n   • Curso de Seguro de Crédito\n   • Certificação profissional\n   • Presencial e online\n   • www.ens.edu.br\n\n2. **IBSS (Instituto Brasileiro de Seguro Social)**\n   • Workshops sobre crédito\n   • Eventos do setor\n\n3. **Seguradoras (treinamentos):**\n   • Allianz Trade Academy\n   • Coface University\n   • Treinamentos para corretores parceiros\n\n4. **Publicações:**\n   • Revista Cobertura\n   • Sonho Seguro\n   • Insurance Market\n   • Global Trade Review\n\n5. **Eventos:**\n   • CQCS (Congresso de Qualidade e Competitividade do Seguro)\n   • ENIS (Encontro Nacional da Indústria de Seguros)\n   • Berne Union Annual Meeting\n\n6. **Online:**\n   • SENTINEL Blog (em breve)\n   • LinkedIn — perfis das seguradoras\n   • ICC (International Chamber of Commerce)\n\n**Dica:** Para profissionais de crédito, a certificação da ENS é o **padrão do mercado** brasileiro.`
  },
  {
    keywords: ['contato', 'telefone', 'email', 'whatsapp', 'falar humano', 'atendimento'],
    category: 'contato',
    answer: `**Fale com a Equipe Fairfield**\n\nPara contato direto com nossos especialistas:\n\n**Canais de atendimento:**\n• Clique no botão **"Fale com um especialista"** abaixo\n• Acesse nosso portal: **SENTINEL**\n• Solicite uma **cotação gratuita** pelo formulário\n\n**O que podemos fazer por você:**\n• Cotação comparativa com múltiplas seguradoras\n• Análise personalizada do seu perfil de risco\n• Orientação sobre a melhor modalidade\n• Suporte no processo de contratação\n• Acompanhamento de sinistros\n\n**Horário de atendimento:**\n• Segunda a sexta: 9h às 18h\n• Respostas em até 2 horas úteis\n\n**Para urgências (sinistros):**\n• Canal prioritário via portal SENTINEL\n• Atendimento em até 4 horas\n\nClique no botão verde abaixo para falar com um especialista agora! 👇`
  },

  // ── Perguntas Conversacionais ──
  {
    keywords: ['posso confiar', 'confiavel', 'seguro mesmo', 'funciona mesmo', 'compensa'],
    category: 'confianca',
    answer: `**Posso Confiar no Seguro de Crédito?**\n\nSim! E aqui estão os fatos:\n\n**Dados globais:**\n• Mercado existe há **mais de 100 anos**\n• EUR 10+ bilhões em prêmios anuais no mundo\n• Mais de **95% dos sinistros corretamente notificados são pagos**\n• As seguradoras são reguladas por órgãos governamentais\n\n**No Brasil:**\n• Regulado pela **SUSEP** (órgão federal)\n• Seguradoras devem ter capital e provisões adequados\n• Condições contratuais aprovadas pela SUSEP\n• Canal de reclamação disponível\n\n**Seguradoras são sólidas:**\n• Allianz Trade: Rating AA (maior seguradora do mundo em crédito)\n• Coface: Rating AA- (presente em 100 países)\n• Chubb: Rating AA (maior seguradora de capital aberto)\n\n**Quando NÃO funciona:**\n• Segurado não notifica atraso no prazo\n• Venda acima do limite aprovado\n• Disputa comercial não resolvida\n• Documentação falsa ou incompleta\n\n**Ou seja:** O seguro funciona quando o segurado **cumpre suas obrigações**. É um contrato bilateral — ambas as partes têm deveres.\n\n**Dica:** Leia as condições gerais com seu corretor e entenda seus **deveres** como segurado.`
  },
  {
    keywords: ['concorrente', 'meu concorrente', 'competidor', 'mercado competitivo'],
    category: 'estrategico',
    answer: `**Seguro de Crédito como Vantagem Competitiva**\n\n**Como o seguro te coloca à frente:**\n\n**1. Ofereça melhores prazos**\n• Com seguro, você pode dar **90 dias** com segurança\n• Seu concorrente sem seguro oferece apenas 30 dias\n• O cliente **escolhe você**\n\n**2. Não exija garantias**\n• Seu concorrente pede aval, fiança, garantias reais\n• Você vende com **open account** (sem garantia)\n• Processo de venda mais rápido e simples\n\n**3. Aceite novos clientes**\n• Sem seguro: medo de vender para desconhecidos\n• Com seguro: seguradora analisa o novo cliente\n• Aprovação de limite = **sinal verde** para vender\n\n**4. Entre em novos mercados**\n• Exportação: risco do comprador estrangeiro é coberto\n• Novas regiões: seguradora tem dados locais\n• Expansão com controle de risco\n\n**5. Precificação mais agressiva**\n• Sem medo de calote = pode trabalhar com margem menor\n• Custo do seguro (0,2%) vs custo do calote (100%)\n\n**6. Inteligência de mercado**\n• Dados sobre compradores = informação sobre o mercado\n• Se a seguradora nega limite do comprador do concorrente, é informação valiosa\n\n**Resultado:** Empresas com seguro de crédito **crescem mais rápido** e com mais segurança.`
  },
  {
    keywords: ['indicacao', 'indicar', 'referencia', 'alguem precisa'],
    category: 'indicacao',
    answer: `**Indique o Seguro de Crédito para sua rede!**\n\n**Quem pode se beneficiar:**\n\n• **Fornecedores** que vendem a prazo para você\n• **Clientes** que vendem a prazo para outros\n• **Parceiros** de negócios com carteira B2B\n• **Associações** comerciais e industriais\n\n**Perfil ideal para indicação:**\n• Faturamento a prazo > R$ 5M/ano\n• Vende para múltiplos compradores\n• Já teve problemas com inadimplência\n• Está crescendo e precisa proteger o caixa\n• Exporta ou planeja exportar\n\n**Como indicar:**\n• Compartilhe o link da plataforma SENTINEL\n• Conecte com a equipe Fairfield\n• Sugira uma cotação gratuita e sem compromisso\n\n**Para a Fairfield:**\n• Equipe de especialistas disponível\n• Cotação comparativa com múltiplas seguradoras\n• Suporte completo: da cotação ao sinistro\n\n💡 Clique em **"Fale com um especialista"** abaixo para conectar alguém da sua rede com nossa equipe!`
  },

  // ── Operações Especiais ──
  {
    keywords: ['commodities', 'commodity', 'mineracao', 'petroleo', 'energia'],
    category: 'setor',
    answer: `**Seguro de Crédito para Commodities**\n\nOperações de commodities têm características únicas.\n\n**Setores cobertos:**\n• Minérios (ferro, bauxita, manganês)\n• Petróleo e derivados\n• Grãos (soja, milho, trigo)\n• Açúcar e etanol\n• Café\n• Algodão\n• Metais (cobre, alumínio)\n\n**Características das operações:**\n• Alto valor por transação\n• Volatilidade de preços\n• Moeda: USD (geralmente)\n• Compradores são tradings e processadores\n• Incoterms: FOB, CIF, CFR\n\n**Seguradoras especializadas:**\n• **AIG** — líder em commodities e energia\n• **Allianz Trade** — cobertura global\n• **Chubb** — grandes valores\n\n**Pontos de atenção:**\n• Limite de crédito deve acompanhar a **volatilidade de preço**\n• Exposição pode mudar rapidamente com variação de preço\n• Risco político é relevante em muitos mercados\n• Concentração em poucos compradores (tradings)\n\n**Cobertura típica:**\n• Single Risk para operações pontuais\n• Whole Turnover para exportadores regulares\n• Risco Político incluído\n• PMI: 90% a 95%\n\nPara operações acima de **USD 10 milhões** por transação, o seguro de crédito é praticamente indispensável.`
  },
  {
    keywords: ['financiamento', 'credito bancario', 'banco', 'emprestimo', 'linha credito'],
    category: 'financeiro',
    answer: `**Seguro de Crédito e Financiamento Bancário**\n\n**Como o seguro facilita acesso a crédito:**\n\n**1. Linhas de financiamento:**\n• Bancos veem recebíveis segurados como **garantia de melhor qualidade**\n• Deságio menor em operações de desconto\n• Limite de crédito ampliado\n\n**2. Operações específicas:**\n| Operação | Como o Seguro Ajuda |\n|----------|--------------------|\n| **ACC/ACE** | Exportador com seguro obtém taxa melhor |\n| **BNDES Exim** | Seguro pode ser exigido ou recomendado |\n| **Capital de Giro** | Recebíveis segurados como garantia |\n| **FIDC** | Reduz subordinação e deságio |\n| **Forfaiting** | Viabiliza operações sem recurso |\n\n**3. Economia estimada:**\n• Redução na taxa de juros: **0,5% a 2% ao ano**\n• Em financiamento de R$ 20M: economia de R$ 100k a R$ 400k/ano\n• Muitas vezes **o seguro se paga** pela economia financeira\n\n**4. Bancos que reconhecem seguro de crédito:**\n• Itaú BBA\n• Bradesco\n• Santander\n• Banco do Brasil\n• BNDES\n• Bancos internacionais (Citi, JP Morgan, etc.)\n\n**Dica:** Ao negociar com o banco, apresente a apólice de seguro de crédito como **mitigante de risco**. Muitos gerentes não conhecem o produto — explique o benefício.`
  },
  {
    keywords: ['governo', 'setor publico', 'licitacao', 'orgao publico', 'autarquia'],
    category: 'duvidas',
    answer: `**Seguro de Crédito e Vendas para o Governo**\n\n**Vendas para governo NÃO são cobertas** pelo seguro de crédito tradicional.\n\n**Por quê?**\n• O governo é considerado **risco soberano**\n• Não está sujeito a falência ou RJ\n• Inadimplência do governo: questão política/orçamentária\n• Seguro de crédito cobre risco **comercial** (B2B privado)\n\n**Exceções e alternativas:**\n\n**1. Empresas estatais mistas:**\n• Petrobras, Eletrobras, etc.\n• Algumas seguradoras cobrem como **risco comercial**\n• Análise caso a caso\n\n**2. Economia mista com controle privado:**\n• Pode ser coberta dependendo da seguradora\n\n**3. Para garantir contratos com governo:**\n• Use **Seguro Garantia** (não Seguro de Crédito)\n• Ramo SUSEP 0775\n• Garante cumprimento da obrigação contratual\n\n**4. Risco Político (exportação):**\n• Inadimplência de **governos estrangeiros** é coberta\n• Classificada como risco político\n• Via apólice de exportação (ramo 0172)\n\n**Resumo:**\n• Vendas B2B privado → **Seguro de Crédito**\n• Contratos com governo → **Seguro Garantia**\n• Vendas para governos estrangeiros → **Risco Político (exportação)**`
  },
  {
    keywords: ['e-commerce', 'marketplace', 'online', 'digital venda', 'plataforma venda'],
    category: 'duvidas',
    answer: `**Seguro de Crédito para E-commerce e Marketplaces (B2B)**\n\n**Aplicabilidade:**\n• Seguro de crédito cobre vendas **B2B a prazo**\n• E-commerce B2C (pessoa física): **não coberto**\n• Marketplace B2B com venda a prazo: pode ser coberto\n\n**Cenários cobertos:**\n• Distribuidor vende online para varejistas a prazo\n• Fabricante vende via marketplace B2B com boleto 30/60/90 dias\n• Atacadista digital com crédito para lojistas\n\n**Cenários NÃO cobertos:**\n• Vendas para pessoa física (CPF)\n• Vendas com pagamento à vista (cartão, Pix)\n• Vendas com antecipação de recebíveis (risco é do adquirente)\n\n**Integração digital:**\n• APIs permitem consultar limite antes de aprovar venda\n• Bloqueio automático se limite excedido\n• Notificação automática de atrasos\n• AVLA é a seguradora mais preparada para operações digitais\n\n**Dica:** Se você opera um marketplace B2B e oferece crédito (buy now, pay later B2B), o seguro de crédito pode ser uma **peça fundamental** do modelo de negócio, garantindo o funding dos recebíveis.`
  },

  // ── Mitos e Verdades ──
  {
    keywords: ['mito', 'verdade', 'mitos', 'verdades', 'e verdade que'],
    category: 'mitos',
    answer: `**Mitos e Verdades sobre Seguro de Crédito**\n\n**MITO: "Seguro de crédito é muito caro."**\n✅ **Verdade:** Custa apenas 0,15% a 0,40% do faturamento. Uma inadimplência de R$ 500k custa 50x mais que o prêmio anual.\n\n**MITO: "A seguradora nunca paga o sinistro."**\n✅ **Verdade:** A taxa de pagamento é superior a 95% dos sinistros corretamente notificados. Os NQLs ocorrem por falha do segurado (notificação fora do prazo, venda acima do limite).\n\n**MITO: "Só serve para grandes empresas."**\n✅ **Verdade:** CESCE e AVLA oferecem produtos para empresas a partir de R$ 5M de faturamento a prazo.\n\n**MITO: "Meu departamento de crédito já faz esse trabalho."**\n✅ **Verdade:** O seguro COMPLEMENTA o departamento de crédito. A seguradora tem acesso a bases de dados que nenhuma empresa individual possui.\n\n**MITO: "Se eu contratar, vou relaxar na análise de crédito."**\n✅ **Verdade:** A POS (10-15%) garante que o segurado mantenha interesse em prevenir perdas. E o bônus/malus incentiva boa gestão.\n\n**MITO: "A seguradora vai interferir nos meus negócios."**\n✅ **Verdade:** A seguradora aprova limites e monitora, mas a decisão de vender é sempre do segurado.\n\n**MITO: "IOF torna o seguro mais caro."**\n✅ **Verdade:** Seguro de crédito é ISENTO de IOF (0%). Diferente de outros seguros.`
  },
  {
    keywords: ['depoimento', 'case', 'sucesso', 'testemunho', 'resultado cliente'],
    category: 'caso',
    answer: `**Casos de Sucesso — Seguro de Crédito na Prática**\n\n**Caso 1: Indústria Química**\n• Faturamento a prazo: R$ 120M/ano\n• Prêmio anual: R$ 264.000 (0,22%)\n• Sinistro no ano 2: Comprador entrou em RJ\n• Exposição: R$ 2,8M\n• Indenização (85%): R$ 2,38M\n• **ROI: 9x** o prêmio pago em 2 anos\n\n**Caso 2: Exportadora de Alimentos**\n• Exportação para 15 países\n• Prêmio: USD 35.000/ano\n• Evento: Moratória cambial no país destino\n• Exposição: USD 600.000\n• Indenização (90%): USD 540.000\n• **Sem o seguro, a empresa teria problemas de caixa sérios**\n\n**Caso 3: Distribuidora de Eletrônicos**\n• 200+ compradores, faturamento R$ 80M\n• 3 anos sem sinistro → bônus acumulado de 25%\n• No ano 4: 2 sinistros (R$ 800k total)\n• Indenização: R$ 680k\n• Mesmo com malus, o histórico de bônus compensou\n\n**Resultado comum:**\n• Empresas com seguro de crédito têm **taxa de sobrevivência 40% maior** em crises\n• **90% dos clientes** renovam a apólice\n• ROI médio em 5 anos: **3x a 5x** o prêmio total pago\n\nQuer proteger sua empresa também? Clique em **Fazer Cotação**!`
  },

  // ── Garantir Vendas ──
  {
    keywords: ['garantir minhas vendas', 'garantir vendas', 'proteger vendas', 'proteger meu faturamento', 'proteger recebiveis', 'como garanto', 'como protejo', 'medo de inadimplencia', 'evitar inadimplencia', 'garantir recebimento'],
    category: 'comercial',
    answer: `**Como garantir suas vendas com o Seguro de Crédito**\n\nO Seguro de Crédito é a forma mais eficiente de **proteger o faturamento a prazo** da sua empresa contra a inadimplência dos compradores.\n\n**Como funciona na prática:**\n\n1. **Você vende a prazo** normalmente para seus clientes\n2. **A seguradora analisa** cada comprador e aprova um limite de crédito\n3. **Se o comprador não pagar**, a seguradora indeniza sua empresa\n\n**O que fica protegido:**\n• Vendas com boleto, duplicata ou outro instrumento de crédito\n• Operações no mercado interno e exportação\n• Coberturas contra falência, recuperação judicial e mora prolongada\n\n**Benefícios imediatos:**\n• 💰 **Proteção do fluxo de caixa** — receba mesmo se o cliente não pagar\n• 📊 **Análise de crédito profissional** — a seguradora monitora seus compradores 24/7\n• 🏦 **Acesso facilitado a crédito bancário** — bancos aceitam a apólice como garantia\n• 📈 **Venda mais com segurança** — expanda sua carteira sem medo de inadimplência\n\n**Quanto custa:**\n• Apenas **0,15% a 0,40%** do faturamento a prazo\n• Isento de IOF (0%)\n• ROI médio de 3x a 5x em 5 anos\n\n**Exemplo prático:**\nFaturamento a prazo de R$ 50M → prêmio de ~R$ 125.000/ano → proteção contra perdas que podem superar R$ 1M.\n\n🛡️ Quer proteger suas vendas? Clique em **Iniciar Cotação** no menu principal!`
  },

  // ── Setores Específicos ──
  {
    keywords: ['construcao', 'obra', 'construtora', 'incorporadora', 'imobiliario'],
    category: 'setor',
    answer: `**Seguro de Crédito para Construção Civil**\n\nSetor de **alto risco** com características específicas.\n\n**Desafios do setor:**\n• Ciclos econômicos longos\n• Margens apertadas\n• Alta taxa de insolvência\n• Projetos de longo prazo\n• Dependência de financiamento\n\n**Taxas para construção civil:**\n• 0,25% a 0,50% do faturamento a prazo\n• Pode ser até **2x** a taxa de setores estáveis\n\n**Coberturas relevantes:**\n• Fornecedores de materiais de construção\n• Vendas de insumos para construtoras\n• Locação de equipamentos\n\n**Seguradoras com apetite:**\n• Allianz Trade (seletiva, grandes players)\n• Coface (análise setorial robusta)\n• Atradius (flexível com garantias adicionais)\n\n**Dificuldades:**\n• Limites geralmente **menores** para construtoras\n• Seguradora exige balanço recente (menos de 6 meses)\n• Empresas em recuperação judicial: limite negado\n\n**Dica:** Se você fornece para construção civil, o seguro de crédito é **ainda mais importante** devido ao alto risco setorial. Comece a cotar antes que um grande cliente tenha problemas.`
  },
  {
    keywords: ['textil', 'moda', 'confeccao', 'varejo', 'roupa'],
    category: 'setor',
    answer: `**Seguro de Crédito para Têxtil e Moda**\n\nSetor com **sazonalidade** e riscos específicos.\n\n**Características do setor:**\n• Alta competição com importados (China, Ásia)\n• Margens apertadas\n• Sazonalidade (coleções)\n• Muitos compradores pequenos e médios\n• Alto volume de trocas e devoluções\n\n**Taxas para têxtil:**\n• 0,20% a 0,40% do faturamento a prazo\n\n**Desafios:**\n• Disputas comerciais frequentes (qualidade, entrega)\n• Compradores com saúde financeira frágil\n• Devoluções que complicam a apuração do sinistro\n\n**Dicas para o setor:**\n• Documentar **aceitação** da mercadoria pelo comprador\n• Ter contratos claros sobre trocas e devoluções\n• Usar limite discricionário para compradores pequenos\n• Focar limites nomeados nos grandes varejistas\n\n**Modalidade recomendada:**\n• **Whole Turnover** para carteira diversificada\n• **Key Buyer** se vende para grandes redes varejistas\n\nO seguro de crédito é particularmente valioso neste setor pela **informação de crédito** dos compradores.`
  },
  {
    keywords: ['farmaceutico', 'saude', 'hospital', 'medicamento', 'healthcare'],
    category: 'setor',
    answer: `**Seguro de Crédito para Setor Farmacêutico/Saúde**\n\nSetor de **baixo risco** com boa aceitação pelas seguradoras.\n\n**Características:**\n• Demanda estável (produtos essenciais)\n• Margens razoáveis\n• Compradores diversificados (farmácias, distribuidores, hospitais)\n• Regulamentação forte (ANVISA)\n\n**Taxas para farma/saúde:**\n• 0,10% a 0,20% do faturamento a prazo\n• Das **menores** taxas do mercado\n\n**Compradores típicos:**\n• Redes de farmácias (Raia/Drogasil, Pague Menos)\n• Distribuidores (Profarma, Santa Cruz)\n• Hospitais e clínicas\n• Governo (compras públicas — geralmente não seguráveis)\n\n**Vantagens do setor:**\n• Seguradoras aprovam limites mais facilmente\n• PMI pode ser negociado mais alto (90%)\n• Sinistralidade historicamente baixa\n• Prêmio competitivo\n\n**Atenção:**\n• Hospitais públicos: vendas para governo **não são cobertas**\n• Operadoras de saúde: analisar individualmente\n• Distribuidores pequenos: usar limite discricionário\n\n**Ideal para:** Laboratórios e distribuidores farmacêuticos que vendem a prazo para o setor privado.`
  },
  {
    keywords: ['alimento', 'bebida', 'food', 'frigorifico', 'perecivel'],
    category: 'setor',
    answer: `**Seguro de Crédito para Alimentos e Bebidas**\n\nUm dos setores com **maior penetração** de seguro de crédito.\n\n**Características:**\n• Alto volume de vendas a prazo\n• Margens relativamente baixas\n• Produtos perecíveis (logística importante)\n• Muitos compradores (varejo, food service, distribuidores)\n• Exportação significativa (carnes, café, soja, açúcar)\n\n**Taxas:**\n• Mercado interno: 0,10% a 0,25%\n• Exportação: 0,15% a 0,30%\n\n**Subsetores:**\n| Subsetor | Risco | Taxa |\n|----------|-------|------|\n| Carnes e frigoríficos | Médio | 0,15% - 0,30% |\n| Bebidas | Baixo | 0,10% - 0,20% |\n| Laticínios | Baixo-Médio | 0,12% - 0,25% |\n| Commodities | Baixo | 0,10% - 0,20% |\n\n**Atenção especial:**\n• Disputas por qualidade/validade são comuns\n• Documentação de entrega/aceite é crucial\n• Exportação: Incoterms e seguro de transporte importantes\n• Sazonalidade de vendas pode impactar limites\n\n**Para exportadores de alimentos:**\n• Seguro de crédito facilita ACC/ACE\n• Acesso a BNDES Exim melhorado\n• Cobertura de risco político incluída\n\nSetor com **boa sinistralidade** — prêmios tendem a ser competitivos.`
  },
  {
    keywords: ['tecnologia', 'software', 'saas', 'ti', 'tech empresa'],
    category: 'setor',
    answer: `**Seguro de Crédito para Empresas de Tecnologia**\n\n**Perfil das operações:**\n• Vendas de hardware, software, licenças, SaaS\n• Serviços de TI e integração\n• Contratos recorrentes e pontuais\n• Clientes B2B de diversos portes\n\n**Taxas para TI:**\n• 0,10% a 0,25% do faturamento a prazo\n\n**Particularidades:**\n• Vendas de **hardware**: seguro convencional\n• Vendas de **software/SaaS**: verificar se a apólice cobre\n• **Serviços**: geralmente cobertos se faturados a prazo\n• Contratos **recorrentes**: exposição cumulativa no ano\n\n**Seguradoras com expertise em tech:**\n• AVLA (digital-first, entende o setor)\n• Allianz Trade (grande base de dados tech)\n• Chubb (soluções customizadas)\n\n**Vantagens para empresas tech:**\n• Ajuda a vender para empresas maiores (credibilidade)\n• Protege contra calote de grandes projetos\n• Inteligência sobre a saúde financeira dos clientes\n\n**Atenção:**\n• Serviços não entregues: disputa comercial (não coberto)\n• Contratos com SLA: verificar se penalidades são cobertas\n• Propriedade intelectual: não está no escopo do seguro\n\nEmpresas de TI que vendem hardware + serviços para outras empresas são **candidatas ideais** ao seguro de crédito.`
  },

  // ── Regulatório Avançado ──
  {
    keywords: ['resolucao cnsp', 'cnsp', 'normativa', 'circular susep', 'regulamento'],
    category: 'legislacao',
    answer: `**Regulamentação Detalhada — SUSEP e CNSP**\n\n**Principais normas vigentes:**\n\n**Resoluções CNSP:**\n• **CNSP 432/2021** — Condições gerais de seguro de crédito\n• **CNSP 407/2021** — Provisões técnicas\n• **CNSP 321/2015** — Capital mínimo\n• **CNSP 388/2020** — Resseguro\n\n**Circulares SUSEP:**\n• **Circular 553/2017** — Provisões técnicas (detalhamento)\n• **Circular 621/2020** — Condições contratuais\n• **Circular 637/2021** — Open Insurance\n• **Circular 648/2022** — Sandbox regulatório\n\n**Ramos regulamentados:**\n• **0171** — Crédito Interno\n• **0172** — Crédito à Exportação\n\n**Exigências para seguradoras:**\n• Autorização prévia da SUSEP\n• Capital mínimo de solvência\n• Provisões técnicas adequadas (IBNR, IBNER)\n• Limite de retenção por risco\n• Relatórios trimestrais (FIP)\n\n**Para o segurado:**\n• Direito de reclamar à SUSEP\n• Prazos de pagamento de sinistro regulamentados\n• Condições gerais devem ser aprovadas pela SUSEP\n• Portabilidade (em discussão)\n\n**Dica:** Verifique se a seguradora tem **registro ativo** na SUSEP antes de contratar (consulta no site da SUSEP).`
  },
  {
    keywords: ['solvencia', 'solidez', 'seguranca seguradora', 'rating seguradora', 'garantia pagamento'],
    category: 'seguradora',
    answer: `**Solvência e Segurança das Seguradoras de Crédito**\n\n**Como saber se a seguradora é sólida:**\n\n**1. Rating de agências:**\n| Seguradora | S&P | Fitch | A.M. Best |\n|------------|-----|-------|-----------|\n| Allianz Trade | AA | — | — |\n| Coface | — | AA- | — |\n| Atradius | — | — | A |\n| AIG | A+ | — | A |\n| Chubb | AA | — | A++ |\n\n**2. Registro SUSEP:**\n• Toda seguradora deve ter autorização\n• Consulta: site da SUSEP (www.susep.gov.br)\n• Verificar se está ativa e regular\n\n**3. Capital e provisões:**\n• Seguradoras de crédito devem manter provisões técnicas\n• Capital de solvência adequado\n• Resseguro para riscos acima da capacidade\n\n**4. Grupo econômico:**\n• Allianz Trade → Grupo Allianz\n• Coface → Natixis\n• Atradius → Grupo Catalana Occidente\n• Garantia do grupo controlador\n\n**E se a seguradora quebrar?**\n• Cenário muito improvável para as grandes\n• Apólice é crédito quirografário contra a seguradora\n• FGS (Fundo Garantidor de Seguros) em discussão\n\n**Recomendação:** Prefira seguradoras com **rating A ou superior** e longo histórico no mercado.`
  },

  // ── Comparações com Outros Produtos ──
  {
    keywords: ['seguro empresarial', 'seguro patrimonial', 'outros seguros', 'diferenca outros'],
    category: 'comparativo',
    answer: `**Seguro de Crédito vs Outros Seguros Empresariais**\n\n| Seguro | O que Protege | Risco |\n|--------|-------------|-------|\n| **Seguro de Crédito** | Faturamento (recebíveis) | Inadimplência |\n| Seguro Garantia | Cumprimento contratual | Descumprimento |\n| Seguro Patrimonial | Bens físicos | Incêndio, roubo |\n| Seguro de Responsabilidade | Terceiros | Danos causados |\n| Seguro de Lucros Cessantes | Receita | Interrupção |\n| Seguro de Transporte | Mercadoria em trânsito | Avaria, perda |\n| D&O | Diretores | Ações pessoais |\n\n**Por que o Seguro de Crédito é único:**\n• Protege o **ativo mais importante**: as contas a receber\n• Inclui **inteligência de crédito** (não apenas proteção)\n• Impacta diretamente o **resultado financeiro**\n• Facilita acesso a **financiamento**\n\n**Hierarquia de prioridade para uma empresa que vende a prazo:**\n1. 🥇 Seguro de Crédito (protege o faturamento)\n2. 🥈 Seguro Patrimonial (protege os ativos)\n3. 🥉 Seguro de Responsabilidade (protege contra terceiros)\n\n**O recebível é o sangue da empresa.** Se o sangue para de circular (inadimplência), a empresa pode morrer.`
  },

  // ── Tópicos Avançados ──
  {
    keywords: ['credit scoring', 'score', 'pontuacao', 'rating comprador', 'nota comprador'],
    category: 'avancado',
    answer: `**Credit Scoring no Seguro de Crédito**\n\nAs seguradoras usam **modelos proprietários** de scoring para avaliar compradores.\n\n**Fontes de dados:**\n• Balanço patrimonial e DRE do devedor\n• Histórico de pagamentos (Serasa, SPC, SCPC)\n• Informações setoriais\n• Bases internacionais (Dun & Bradstreet, etc.)\n• Experiência da carteira da seguradora\n• Dados comportamentais\n\n**Scores por seguradora:**\n| Seguradora | Score | Escala |\n|------------|-------|--------|\n| Allianz Trade | Global Score | 1-10 |\n| Coface | DRA Rating | 1-10 (1=melhor) |\n| Atradius | Buyer Rating | AAA a D |\n\n**Fatores que impactam o score:**\n• **Positivos:** Lucro consistente, baixo endividamento, histórico limpo\n• **Negativos:** Prejuízo, dívidas elevadas, protestos, ações judiciais\n\n**Como melhorar o score dos seus compradores:**\n• Incentivar que mantenham balanços publicados\n• Orientar sobre regularização cadastral\n• Fornecer referências comerciais à seguradora\n\n**Importante:** Score baixo não significa limite negado. A seguradora pode aprovar um **limite reduzido** ou com condições especiais.`
  },
  {
    keywords: ['disputa comercial', 'disputa', 'contestacao', 'reclamacao comprador', 'alegar defeito', 'comprador alega', 'comprador contesta', 'recusar pagar'],
    category: 'avancado',
    answer: `**Disputa Comercial no Seguro de Crédito**\n\nUma das principais causas de **exclusão de cobertura**.\n\n**O que é disputa comercial:**\n• O comprador **contesta** a dívida\n• Alega defeito no produto/serviço\n• Discorda da quantidade entregue\n• Questiona o preço cobrado\n• Afirma que não recebeu a mercadoria\n\n**Impacto no seguro:**\n• Enquanto houver disputa: **sem indenização**\n• Seguradora não arbitra disputas comerciais\n• O segurado deve resolver a disputa diretamente\n• Após resolução: se restou saldo devedor, pode acionar o seguro\n\n**Como prevenir:**\n1. **Documentação impecável:** NF, contrato, ordem de compra, comprovante de entrega\n2. **Aceite formal:** Confirmação de recebimento assinada\n3. **Condições claras:** Contrato com termos explícitos\n4. **Comunicação:** Resolver reclamações rapidamente\n\n**Se a disputa ocorrer:**\n• Notifique a seguradora mesmo assim\n• Documente tudo\n• Resolva o mais rápido possível\n• Se restar saldo após acordo: acione o seguro\n\n**Dica:** Muitos devedores "criam" disputas para evitar pagar. Documentação robusta dificulta essa tática.`
  },
  {
    keywords: ['monitoramento', 'acompanhamento', 'vigiar', 'alertas', 'monitoring', 'monitoramento compradores', 'acompanhar compradores', 'monitorar devedores'],
    category: 'gestao',
    answer: `**Monitoramento de Compradores no Seguro de Crédito**\n\nUm dos maiores **benefícios** do seguro é o monitoramento contínuo.\n\n**O que a seguradora monitora:**\n• Situação financeira do devedor\n• Protestos e ações judiciais\n• Pedidos de recuperação judicial\n• Mudanças societárias\n• Comportamento de pagamento no mercado\n• Rating de crédito\n\n**Alertas que você recebe:**\n• ⚠️ Redução de limite (deterioração do comprador)\n• ❌ Cancelamento de limite (risco elevado)\n• 📉 Downgrade de rating\n• 🔔 Evento negativo (protesto, RJ)\n\n**Plataformas de monitoramento:**\n| Seguradora | Plataforma | Frequência |\n|------------|-----------|------------|\n| Allianz Trade | EOLIS | Tempo real |\n| Coface | CofaNet | Diário |\n| Atradius | Insights | Tempo real |\n| AVLA | Portal | Diário |\n\n**Ação recomendada ao receber alerta:**\n1. Revise a exposição ao comprador\n2. Suspenda novas vendas se necessário\n3. Reforce cobrança de faturas em aberto\n4. Solicite informações adicionais à seguradora\n\n**Dica:** Configure alertas por e-mail/SMS para agir rapidamente. No SENTINEL, os alertas são integrados ao dashboard.`
  },
  {
    keywords: ['prazo notificacao', 'notificar atraso', 'avisar seguradora', 'overdue notification'],
    category: 'processo',
    answer: `**Prazos de Notificação — O Item Mais Importante da Apólice**\n\n**Prazo para notificar atraso:**\n• **30 dias** após vencimento: prazo comum (mais exigente)\n• **60 dias** após vencimento: prazo estendido (algumas apólices)\n• **Contados a partir do vencimento** da fatura, não da data de emissão\n\n**O que notificar:**\n• CNPJ e razão social do devedor\n• Número e valor das faturas em atraso\n• Data de vencimento original\n• Ações de cobrança já tomadas\n\n**Consequência de NÃO notificar no prazo:**\n• Perda total do direito à indenização para aquele sinistro\n• É a causa mais comum de **NQL (Non-Qualifying Loss)**\n• Sem exceção — prazo é rigoroso\n\n**Como se proteger:**\n• Configure alerta no sistema para D+25 do vencimento\n• Automatize a notificação via portal da seguradora\n• Revise semanalmente o aging de recebíveis\n• Designe um responsável específico\n\n**Também notificar:**\n• Mudança na situação do devedor (RJ, falência)\n• Negociação de pagamento com o devedor\n• Recebimento parcial\n• Disputa comercial\n\n**Regra:** Na dúvida, **notifique**. É melhor notificar desnecessariamente do que perder o prazo.`
  },
  {
    keywords: ['fluxo caixa', 'caixa', 'capital giro', 'liquidez', 'financeiro'],
    category: 'financeiro',
    answer: `**Impacto do Seguro de Crédito no Fluxo de Caixa**\n\n**Sem seguro de crédito:**\n• Inadimplência = rombo no caixa\n• Empresa precisa de reservas para absorver perdas\n• Capital de giro comprometido\n• Pode gerar efeito cascata (não pagar fornecedores)\n\n**Com seguro de crédito:**\n• Inadimplência = indenização em 30-60 dias\n• Caixa protegido (85-95% recuperado)\n• Capital de giro preservado\n• Previsibilidade financeira\n\n**Cálculo do impacto:**\n\n| Cenário | Sem Seguro | Com Seguro |\n|---------|-----------|----------|\n| Faturamento a prazo | R$ 50M | R$ 50M |\n| Inadimplência (3%) | R$ 1.500.000 | R$ 1.500.000 |\n| Indenização (85%) | R$ 0 | R$ 1.275.000 |\n| Perda líquida | R$ 1.500.000 | R$ 225.000 |\n| Prêmio (0,20%) | R$ 0 | R$ 100.000 |\n| **Impacto no caixa** | **-R$ 1.500.000** | **-R$ 325.000** |\n\n**Economia:** R$ 1.175.000 protegidos\n\n**Efeitos secundários positivos:**\n• Melhor planejamento financeiro\n• Possibilidade de investir (em vez de provisionar)\n• Menor necessidade de linhas de crédito emergenciais\n• Melhor relação com bancos e fornecedores`
  },
  {
    keywords: ['multinacional', 'programa internacional', 'global program', 'multi pais'],
    category: 'avancado',
    answer: `**Programas Internacionais de Seguro de Crédito**\n\nPara empresas que operam em **múltiplos países**.\n\n**Estrutura Master-Local:**\n\n• **Master Policy (Apólice Master)**\n   - Contratada na sede/matriz\n   - Define condições globais\n   - PMI, AAD e termos harmonizados\n   - Prêmio consolidado (mais barato)\n\n• **Local Policies (Apólices Locais)**\n   - Emitidas em cada país de operação\n   - Atendem legislação local\n   - Limites locais sob framework global\n\n**Benefícios:**\n• Condições negociadas globalmente (mais vantajosas)\n• Gestão centralizada com execução local\n• Reportes consolidados\n• Um único interlocutor na seguradora\n• Economia de escala no prêmio\n\n**Seguradoras com capacidade:**\n| Seguradora | Países | Plataforma Global |\n|------------|--------|-------------------|\n| Allianz Trade | 52 | EOLIS Global |\n| Coface | 57 | CofaNet Global |\n| Atradius | 50+ | Atradius Global |\n| Chubb | 54 | Customizado |\n\n**Requisito:** Faturamento internacional relevante (geralmente USD 50M+ entre todas as subsidiárias).\n\nA **Fairfield** tem parcerias com corretores internacionais para estruturar programas globais.`
  },
  {
    keywords: ['conta escrow', 'escrow', 'garantia adicional', 'colateral', 'security deposit'],
    category: 'financeiro',
    answer: `**Garantias Adicionais e Alternativas ao Seguro de Crédito**\n\n**Instrumentos complementares:**\n\n| Instrumento | Custo | Proteção | Complexidade |\n|-------------|-------|----------|-------------|\n| Seguro de Crédito | 0,2-0,5% | 85-95% | Média |\n| Carta de Crédito | 1-3% | 100% | Alta |\n| Aval Bancário | 1-2% aa | 100% | Média |\n| Conta Escrow | Custo bancário | Total (retido) | Média |\n| Penhor/Hipoteca | Cartório | Bem específico | Alta |\n| Fiança Pessoal | Gratuita | Patrimônio pessoal | Baixa |\n| Reserva de Domínio | Gratuita | Mercadoria | Baixa |\n\n**Seguro de Crédito vs Garantias Reais:**\n\n**Vantagens do seguro:**\n• Não onera o comprador\n• Cobre múltiplos compradores\n• Inclui análise e monitoramento\n• Serviço de cobrança\n• Processo simples\n\n**Quando combinar com garantias:**\n• Operações muito grandes (acima do MCL)\n• Compradores de altíssimo risco\n• Setores com ativos penhoráveis (imóveis, equipamentos)\n\n**Na prática:** O seguro de crédito **substitui** a maioria das garantias tradicionais e é preferido pela maioria das empresas modernas.`
  },

  // ── Educacional ──
  {
    keywords: ['historia', 'origem', 'quando surgiu', 'historico', 'criacao'],
    category: 'educacional',
    answer: `**História do Seguro de Crédito**\n\n**Origens:**\n• **1820s:** Primeiras formas na **Inglaterra** (trade credit)\n• **1885:** Primeira seguradora de crédito na Alemanha\n• **1927:** Fundação da **Hermes** (hoje Allianz Trade) na Alemanha\n• **1946:** Fundação da **Coface** na França\n• **1925:** Fundação da **NCM** (precursora da Atradius)\n\n**No Brasil:**\n• **1966:** Decreto-Lei 73 cria o sistema de seguros\n• **1979:** Lei 6.704 regulamenta o seguro de crédito à exportação\n• **1990s:** Entrada das seguradoras internacionais\n• **2000s:** Crescimento acelerado do mercado\n• **2010s:** Digitalização e novos players (AVLA)\n• **2020s:** IA e plataformas digitais (SENTINEL)\n\n**Marcos globais:**\n• Pós-Guerra (1945-1960): Expansão para reconstrução\n• Crise do petróleo (1970s): Importância do risco político\n• Globalização (1990s): Cobertura multinacional\n• Crise de 2008: Teste de estresse do setor\n• COVID-19 (2020): Maior sinistralidade da história\n\nHoje, o mercado global de seguro de crédito movimenta **EUR 10+ bilhões/ano** em prêmios.`
  },
  {
    keywords: ['berna union', 'associacao', 'icisa', 'entidade', 'organizacao'],
    category: 'educacional',
    answer: `**Organizações do Setor de Seguro de Crédito**\n\n**Berne Union:**\n• Associação internacional de seguradoras de crédito à exportação\n• Fundada em **1934** em Berna, Suíça\n• 85 membros (ECAs e seguradoras privadas)\n• Cobre USD **2,8 trilhões** em comércio\n• Brasil: **ABGF** é membro\n\n**ICISA (International Credit Insurance & Surety Association):**\n• Associação de seguradoras privadas\n• Membros: Allianz Trade, Coface, Atradius, etc.\n• Foco em standards e melhores práticas\n\n**No Brasil:**\n• **SUSEP:** Regulador\n• **CNSeg:** Confederação Nacional das Seguradoras\n• **ABGF:** Agência Brasileira Gestora de Fundos (FGE)\n• **Fenacor:** Federação Nacional dos Corretores\n• **Sincor:** Sindicato dos Corretores\n\n**ECAs (Export Credit Agencies) relevantes:**\n| País | ECA |\n|------|-----|\n| Brasil | ABGF/SBCE |\n| EUA | Ex-Im Bank |\n| Alemanha | Euler Hermes (pública) |\n| França | BPI France |\n| Japão | NEXI |\n| China | Sinosure |\n\nEssas organizações promovem o desenvolvimento e a padronização do seguro de crédito globalmente.`
  },

  // ── Negociação e Dicas ──
  {
    keywords: ['dica', 'conselho', 'recomendacao', 'sugestao', 'melhores praticas'],
    category: 'dicas',
    answer: `**Dicas para Aproveitar ao Máximo o Seguro de Crédito**\n\n**Antes de contratar:**\n1. Organize seu **histórico de inadimplência** (últimos 5 anos)\n2. Tenha o **aging de recebíveis** atualizado\n3. Liste seus **top 20 compradores** com volumes\n4. Cote com **pelo menos 3 seguradoras**\n\n**Na contratação:**\n5. Negocie o **AAD** — aceitar franquia maior reduz o prêmio\n6. Não peça PMI 95% se não precisa — 85% é suficiente para a maioria\n7. Garanta **limite discricionário** adequado\n8. Entenda o prazo de **notificação** (crucial!)\n\n**Durante a vigência:**\n9. **Declare faturamento** em dia\n10. **Notifique atrasos** dentro do prazo (não espere!)\n11. Monitore limites aprovados antes de cada venda\n12. Use as **informações de crédito** da seguradora\n13. Mantenha documentação organizada (NFs, contratos)\n\n**Na renovação:**\n14. Comece a negociar **60 dias antes**\n15. Use o histórico bom para pedir **bônus**\n16. Compare com outras seguradoras\n17. Renegocie AAD e PMI conforme necessidade\n\n**Regra de ouro:** O seguro de crédito funciona melhor quando **integrado à gestão de crédito** da empresa, não como produto isolado.`
  },
  {
    keywords: ['negociar', 'negociacao', 'melhor preco', 'baratear', 'reduzir custo'],
    category: 'dicas',
    answer: `**Como Negociar Melhores Condições no Seguro de Crédito**\n\n**Alavancas de negociação:**\n\n**1. AAD/Franquia (maior impacto)**\n• Aceitar AAD mais alto = prêmio menor\n• AAD R$ 100k → R$ 300k pode reduzir prêmio em **15-25%**\n\n**2. PMI (impacto moderado)**\n• PMI 90% → 85% pode reduzir prêmio em **5-10%**\n• Avalie se a redução compensa\n\n**3. Volume (economia de escala)**\n• Faturamento maior = taxa menor\n• Apresente projeção de crescimento\n\n**4. Diversificação**\n• Carteira diversificada = menor risco = melhor taxa\n• Compradores em setores diferentes\n\n**5. Sinistralidade**\n• Sem sinistros: peça bônus de **10-20%**\n• Apresente histórico documentado\n\n**6. Concorrência**\n• Cote com múltiplas seguradoras\n• Use proposta de uma para negociar com outra\n• O SENTINEL facilita isso automaticamente\n\n**7. Multi-year**\n• Contrato de 2-3 anos pode ter condições melhores\n• Garante estabilidade de preço\n\n**8. Timing**\n• Final do ano fiscal da seguradora: mais flexibilidade\n• Renovação antecipada: margem de negociação\n\n**Economia típica com boa negociação: 15-30%** sobre a primeira proposta.`
  },
  {
    keywords: ['erro comum', 'erro', 'cuidado', 'atencao', 'armadilha', 'evitar'],
    category: 'dicas',
    answer: `**Erros Comuns no Seguro de Crédito — E Como Evitá-los**\n\n**1. Não notificar atraso no prazo**\n• Prazo: 30-60 dias após vencimento\n• Consequência: **perda do direito à indenização**\n• Solução: Configurar alertas automáticos\n\n**2. Vender acima do limite aprovado**\n• O excedente NÃO é coberto\n• Solução: Consultar limite antes de cada venda\n\n**3. Não declarar faturamento**\n• Pode invalidar a apólice\n• Solução: Automatizar a declaração\n\n**4. Ignorar cancelamento de limite**\n• Seguradora cancela limite de comprador\n• Empresa continua vendendo sem cobertura\n• Solução: Monitorar alertas da seguradora\n\n**5. Não ler as condições gerais**\n• Surpresas na hora do sinistro\n• Solução: Revisão com corretor antes de assinar\n\n**6. Contratar e esquecer**\n• Seguro de crédito requer gestão ativa\n• Solução: Reuniões trimestrais com corretor\n\n**7. Escolher apenas pelo preço**\n• Seguradora barata pode ter limites baixos\n• Solução: Avaliar capacidade + serviço + preço\n\n**8. Não usar as informações da seguradora**\n• Seguradora tem dados valiosos dos compradores\n• Solução: Integrar dados na decisão de crédito\n\n**O erro mais caro:** Não ter seguro de crédito quando um grande cliente dá calote.`
  },

  // ── Específicos por Região ──
  {
    keywords: ['nordeste', 'norte', 'sul', 'sudeste', 'regiao', 'estado'],
    category: 'regional',
    answer: `**Seguro de Crédito por Região do Brasil**\n\n**Perfil de risco regional:**\n\n| Região | Inadimplência Relativa | Observação |\n|--------|----------------------|------------|\n| **Sudeste** | Média | Maior volume de operações |\n| **Sul** | Baixa-Média | Boa cultura de pagamento |\n| **Nordeste** | Média-Alta | Crescimento rápido |\n| **Centro-Oeste** | Baixa-Média | Forte no agro |\n| **Norte** | Alta | Menor penetração |\n\n**Seguro de crédito é mais contratado em:**\n• **São Paulo** (50%+ do mercado)\n• **Rio de Janeiro**\n• **Minas Gerais**\n• **Rio Grande do Sul**\n• **Paraná / Santa Catarina**\n\n**Oportunidades de crescimento:**\n• Nordeste: expansão industrial e comercial\n• Centro-Oeste: agronegócio em crescimento\n• Norte: operações com Zona Franca de Manaus\n\n**Dica:** A localização do **comprador** importa mais que a do segurado. Se você vende para todo o Brasil, sua carteira é diversificada regionalmente — o que é positivo para a seguradora.`
  },

  // ── Contábil e Tributário ──
  {
    keywords: ['contabil', 'contabilidade', 'pdd', 'provisao', 'lancamento'],
    category: 'contabil',
    answer: `**Tratamento Contábil do Seguro de Crédito**\n\n**Lançamentos principais:**\n\n**1. Pagamento do prêmio:**\n• D — Seguros a Apropriar (Ativo Circulante)\n• C — Caixa/Banco\n• Apropriação mensal: D — Despesa com Seguros / C — Seguros a Apropriar\n\n**2. Recebimento de indenização:**\n• D — Caixa/Banco\n• C — Outras Receitas Operacionais\n• Ou: C — Reversão de PDD (se já provisionado)\n\n**3. Impacto na PDD:**\n• Recebíveis **segurados**: PDD menor ou zero\n• Parte não coberta (POS): mantém PDD proporcional\n• Resultado: melhora o **resultado líquido**\n\n**Normas contábeis:**\n• **CPC 48 (IFRS 9):** Classificação de instrumentos financeiros\n• **CPC 11 (IFRS 4):** Contratos de seguro\n• **CPC 25:** Provisões e contingências\n\n**Impacto tributário:**\n• Prêmio de seguro: **dedutível** como despesa operacional\n• Indenização: tributada como receita\n• IOF: 0% (isento para seguro de crédito)\n• Prêmio já inclui PIS/COFINS da seguradora\n\n**Para o balanço:**\n• Melhora índices de liquidez (recebíveis mais seguros)\n• Reduz contingências passivas\n• Demonstra gestão de risco ativa`
  },
  {
    keywords: ['forma pagamento', 'parcelamento', 'como pagar', 'parcela premio'],
    category: 'preco',
    answer: `**Formas de Pagamento do Prêmio de Seguro de Crédito**\n\n**Opções comuns:**\n\n| Forma | Frequência | Desconto |\n|-------|-----------|----------|\n| À vista | Anual | 3% a 5% |\n| Trimestral | 4x/ano | Padrão |\n| Mensal | 12x/ano | Pode ter acréscimo |\n| Prêmio Ajustável | Mensal/trimestral | Sobre faturamento real |\n\n**Prêmio Ajustável (mais comum):**\n• **Prêmio Mínimo:** Pago no início (geralmente 60-70% do estimado)\n• **Declarações periódicas:** Faturamento real a prazo\n• **Ajuste final:** Diferença entre mínimo e prêmio sobre faturamento real\n\n**Exemplo:**\n• Prêmio estimado: R$ 120.000/ano\n• Prêmio mínimo (70%): R$ 84.000\n• Faturamento real menor que estimado → sem ajuste adicional\n• Faturamento real maior → paga diferença\n\n**Importante:**\n• Atraso no pagamento do prêmio pode **suspender** a cobertura\n• Seguradoras geralmente dão prazo de carência (30 dias)\n• Boleto bancário é a forma mais comum\n\n**Dica:** Opte por prêmio ajustável se seu faturamento varia significativamente ao longo do ano.`
  },

  // ── Corretagem e Intermediação ──
  {
    keywords: ['corretor', 'corretora', 'intermediario', 'broker', 'papel corretor'],
    category: 'corretagem',
    answer: `**O Papel do Corretor no Seguro de Crédito**\n\nO corretor é o **intermediário obrigatório** entre o segurado e a seguradora.\n\n**Funções do corretor:**\n\n1. **Consultoria**\n   • Análise do perfil de risco da empresa\n   • Recomendação de coberturas\n   • Escolha da melhor seguradora\n\n2. **Cotação**\n   • Cotação com múltiplas seguradoras\n   • Negociação de condições\n   • Comparativo de propostas\n\n3. **Gestão da apólice**\n   • Endossos e alterações\n   • Renovações\n   • Acompanhamento de limites\n\n4. **Sinistro**\n   • Orientação no processo\n   • Intermediação com seguradora\n   • Acompanhamento até o pagamento\n\n**Remuneração:**\n• Comissão de corretagem: **10% a 15%** do prêmio\n• Paga **pela seguradora** (não pelo segurado)\n• O segurado **não paga** a mais por usar corretor\n\n**Por que usar a Fairfield?**\n• Especialistas em seguro de crédito\n• Plataforma SENTINEL com IA\n• Acesso a todas as seguradoras do mercado\n• Suporte dedicado no sinistro\n\nO corretor é seu **advogado** no mercado de seguros.`
  },

  // ── Internacional ──
  {
    keywords: ['incoterms', 'incoterm', 'fob', 'cif', 'termos comercio'],
    category: 'internacional',
    answer: `**Incoterms e Seguro de Crédito à Exportação**\n\nOs Incoterms influenciam a cobertura do seguro de crédito.\n\n**Incoterms mais relevantes:**\n\n| Incoterm | Risco do Exportador | Impacto no Seguro |\n|----------|--------------------|-----------------|\n| **EXW** | Baixo (comprador busca) | Cobertura menor |\n| **FOB** | Até embarque | Padrão |\n| **CFR/CIF** | Até destino (frete) | Padrão |\n| **DDP** | Total (até entrega) | Cobertura maior |\n\n**Na prática:**\n• O seguro de crédito cobre o **risco de pagamento**, não o transporte\n• Incoterm define quando a **propriedade** passa ao comprador\n• Seguro de crédito complementa o seguro de transporte\n\n**Dica:**\n• Em vendas **FOB/CFR**: seguro de crédito protege após o embarque\n• Em vendas **DDP**: risco é maior, taxa pode ser mais alta\n• Sempre combine seguro de crédito + seguro de transporte\n\n**Moeda da apólice:**\n• Exportação: geralmente em **USD ou EUR**\n• Doméstico: em **BRL**\n• Apólice mista: pode ter ambas as moedas`
  },
  {
    keywords: ['carta credito', 'letter of credit', 'lc', 'cobranca documentaria'],
    category: 'internacional',
    answer: `**Seguro de Crédito vs Carta de Crédito (L/C)**\n\n**Comparação:**\n\n| Aspecto | Seguro de Crédito | Carta de Crédito |\n|---------|-------------------|------------------|\n| **Custo** | 0,2% - 0,6% | 1% - 3% |\n| **Emissão** | Imediata (limite aprovado) | Por operação |\n| **Burocracia** | Baixa | Alta (documentos) |\n| **Cobertura** | Múltiplos compradores | Uma operação |\n| **Risco político** | Coberto | Parcialmente |\n| **Relação com comprador** | Não afeta | Pode dificultar |\n\n**Quando usar cada um:**\n\n**Seguro de Crédito:**\n• Vendas recorrentes\n• Compradores conhecidos\n• Mercados estáveis\n• Margens apertadas (custo menor)\n\n**Carta de Crédito:**\n• Primeira venda para comprador desconhecido\n• Países de altíssimo risco\n• Operações pontuais de alto valor\n• Comprador aceita abrir L/C\n\n**Ideal:** Usar **seguro de crédito** como padrão e L/C apenas para situações excepcionais. Muitos compradores rejeitam L/C por ser caro e burocrático para eles.`
  },

  // ── Dúvidas Comuns Adicionais ──
  {
    keywords: ['preciso mesmo', 'necessario', 'obrigatorio', 'vale pena', 'devo contratar'],
    category: 'duvidas',
    answer: `**Eu Preciso Mesmo de Seguro de Crédito?**\n\n**Pergunte-se:**\n\n1. Você vende a prazo? **→ Se sim, há risco de inadimplência.**\n2. Quanto representaria perder seu maior cliente? **→ Se for significativo, precisa de proteção.**\n3. Você conhece a saúde financeira de todos os seus compradores? **→ Se não, a seguradora pode ajudar.**\n4. Você tem reservas para absorver um calote grande? **→ Se não, o seguro é essencial.**\n\n**Sinais de que PRECISA de seguro:**\n• Faturamento a prazo > R$ 5 milhões/ano\n• Dependência de poucos grandes clientes\n• Expansão para novos mercados/clientes\n• Histórico de inadimplência\n• Setor com risco elevado\n• Exportação para mercados instáveis\n\n**Sinais de que talvez NÃO precise:**\n• Vendas 100% à vista\n• Vendas apenas para governo\n• Faturamento muito baixo (< R$ 2M)\n• Todos os clientes pagam adiantado\n\n**Custo x Benefício:**\n• Prêmio: 0,15% a 0,40% do faturamento\n• Uma única inadimplência pode custar **centenas de vezes** mais que o prêmio anual\n\n**O seguro de crédito é um investimento com retorno garantido em tranquilidade e proteção.**`
  },
  {
    keywords: ['pequena empresa', 'mei', 'micro', 'simples nacional', 'startup empresa'],
    category: 'duvidas',
    answer: `**Seguro de Crédito para Pequenas Empresas**\n\n**É viável?** Depende do faturamento a prazo.\n\n**Faixas de viabilidade:**\n| Faturamento a Prazo | Viabilidade |\n|---------------------|-------------|\n| < R$ 2 milhões | Provavelmente não compensa |\n| R$ 2M - R$ 5M | Avaliar caso a caso |\n| R$ 5M - R$ 20M | Viável (CESCE, AVLA) |\n| > R$ 20M | Altamente recomendável |\n\n**Soluções para PMEs:**\n\n**CESCE Master PME:**\n• Prêmio a partir de R$ 15.000/ano\n• Processo simplificado\n• Limite discricionário generoso\n\n**AVLA Digital:**\n• 100% online\n• Aprovação em dias\n• Prêmio competitivo\n\n**Coface EasyLiner:**\n• Produto específico para PMEs\n• Condições padronizadas (mais barato)\n\n**Alternativas para empresas muito pequenas:**\n• Consultar cadastro (Serasa, Boa Vista)\n• Seguro de crédito para operações pontuais (Single Risk)\n• Factoring com análise de crédito\n\n**Dica:** Se o faturamento a prazo está crescendo, contrate o seguro **agora** — o histórico bom gera bônus no futuro.`
  },
  {
    keywords: ['cancelar', 'cancelamento', 'desistir', 'rescindir', 'sair do seguro'],
    category: 'processo',
    answer: `**Cancelamento do Seguro de Crédito**\n\n**Quem pode cancelar:**\n\n**Segurado:**\n• Pode cancelar com aviso prévio (30-60 dias)\n• Recebe devolução proporcional do prêmio não utilizado\n• Sinistros em andamento continuam sendo processados\n\n**Seguradora:**\n• Pode não renovar no vencimento\n• Em casos graves: cancelamento durante a vigência (raro)\n• Deve avisar com antecedência (90 dias)\n\n**Consequências do cancelamento:**\n• Cobertura encerra na data do cancelamento\n• Sinistros anteriores ao cancelamento: **continuam cobertos**\n• Novos sinistros após cancelamento: **não cobertos**\n• Limites de crédito são cancelados\n\n**Período de run-off (cauda):**\n• Vendas realizadas ANTES do cancelamento\n• Com vencimento APÓS o cancelamento\n• Geralmente **cobertas** por 90-180 dias\n\n**Dica:** Pense muito antes de cancelar. Ao recontratar:\n• Perde todo o **bônus** acumulado\n• Novo período de análise\n• Pode ter condições piores\n\n**Se está insatisfeito:** Considere **trocar de seguradora** na renovação, mantendo a apólice ativa.`
  },
  {
    keywords: ['fraude', 'golpe', 'falsificacao', 'prevencao fraude'],
    category: 'gestao',
    answer: `**Prevenção de Fraude no Seguro de Crédito**\n\n**Tipos de fraude que o seguro ajuda a detectar:**\n\n1. **Empresas fantasma (devedor)**\n   • Seguradora analisa CNPJ e histórico\n   • Empresas sem atividade real: limite **negado**\n   • Base de dados identifica padrões suspeitos\n\n2. **Golpe do pedido grande**\n   • Novo cliente faz pedido muito acima do normal\n   • Seguradora pode alertar sobre risco\n   • Limite de crédito limita a exposição\n\n3. **Empresa em pré-insolvência**\n   • Comprador comprando de múltiplos fornecedores sem intenção de pagar\n   • Seguradora monitora sinais de deterioração\n   • Cancelamento preventivo de limite\n\n**Ferramentas anti-fraude das seguradoras:**\n• Bases de dados com milhões de empresas\n• Cruzamento de informações internacionais\n• Alertas de comportamento atípico\n• Rede de informantes no mercado\n\n**Atenção — Fraude DO segurado:**\n• Seguro NÃO cobre vendas fictícias\n• Conluio com devedor é crime\n• Falsificação de documentos anula a apólice\n• Seguradora investiga todos os sinistros\n\n**O seguro de crédito é uma das melhores ferramentas anti-fraude** porque a seguradora analisa cada comprador antes de aprovar o limite.`
  },
  {
    keywords: ['grupo economico', 'holding', 'matriz filial', 'multinacional', 'programa global'],
    category: 'avancado',
    answer: `**Seguro de Crédito para Grupos Econômicos**\n\n**Programa Global (Multinacionais):**\n\nEmpresas com operações em vários países podem contratar um **programa global**.\n\n**Como funciona:**\n• **Master Policy:** Apólice principal (matriz)\n• **Local Policies:** Apólices locais em cada país\n• Condições harmonizadas globalmente\n• Gestão centralizada\n\n**Seguradoras com capacidade global:**\n• Allianz Trade (52 países)\n• Coface (57 escritórios)\n• Atradius (50+ países)\n\n**Vantagens:**\n• Condições globais negociadas (prêmio melhor)\n• Visão consolidada do risco\n• Gestão centralizada com execução local\n• Reportes unificados\n\n**Para grupos nacionais (holding):**\n• Apólice pode cobrir todas as empresas do grupo\n• Devedores do grupo são **excluídos** (partes relacionadas)\n• Limite consolidado pode ser maior\n• Prêmio baseado no faturamento consolidado\n\n**Atenção:**\n• Vendas **intragrupo** (entre empresas do mesmo grupo) não são cobertas\n• Cada CNPJ pode ter apólice separada ou consolidada\n• Análise do grupo como um todo pela seguradora`
  },
  {
    keywords: ['open insurance', 'compartilhamento dados', 'futuro seguro', 'tendencia'],
    category: 'tecnologia',
    answer: `**Futuro do Seguro de Crédito — Tendências**\n\n**1. Open Insurance (SUSEP)**\n• Compartilhamento de dados entre seguradoras\n• Portabilidade de apólices\n• Maior concorrência e melhores preços\n• Implementação prevista até 2025-2026\n\n**2. Inteligência Artificial**\n• Análise preditiva de inadimplência\n• Scoring automático de compradores\n• Detecção de padrões de fraude\n• Chatbots especializados (como eu, o iCover!)\n\n**3. Embedded Insurance**\n• Seguro integrado diretamente no ERP\n• Cotação automática a cada venda\n• Sem necessidade de portal separado\n• Frictionless (sem atrito)\n\n**4. Parametric Credit Insurance**\n• Indenização automática baseada em gatilhos\n• Ex: devedor entra em RJ → pagamento imediato\n• Sem regulação manual de sinistro\n\n**5. ESG e Sustentabilidade**\n• Análise ESG dos devedores\n• Prêmio diferenciado para carteiras sustentáveis\n• Relatórios de impacto\n\n**6. Blockchain**\n• Contratos inteligentes para sinistros\n• Rastreabilidade de transações comerciais\n• Redução de fraude\n\nO **SENTINEL** está na vanguarda dessas tendências, integrando IA e automação para o mercado brasileiro.`
  },

  // ── FIDC — Deep Dive ──
  {
    keywords: ['fidc', 'fundo investimento direitos creditorios', 'fundo de recebíveis', 'securitizacao fidc'],
    category: 'fidc',
    answer: `**FIDC e Seguro de Crédito — O Que É e Como Funciona**\n\n**FIDC (Fundo de Investimento em Direitos Creditórios)** é um veículo de securitização regulado pela CVM que transforma recebíveis comerciais em cotas negociáveis.\n\n**Estrutura de cotas:**\n• **Cota Sênior** — prioridade no recebimento, menor risco, menor retorno\n• **Cota Mezanino** — posição intermediária (nem sempre presente)\n• **Cota Subordinada** — absorve perdas primeiro (skin in the game do cedente)\n\n**Papel do Seguro de Crédito no FIDC:**\n• Protege a cota sênior contra inadimplência dos sacados\n• Substitui parcialmente a subordinação mínima exigida\n• Melhora o rating do fundo (AA → AAA)\n• Reduz o custo de captação para o cedente\n\n**Fluxo operacional:**\n1. Cedente vende recebíveis ao FIDC\n2. FIDC emite cotas sênior para investidores\n3. Seguradora garante os sacados aprovados\n4. Em caso de inadimplência, seguradora indeniza o FIDC\n\n**A Fairfield estrutura coberturas específicas para FIDCs** — consulte nossos especialistas.`
  },
  {
    keywords: ['fidc multicedente multisacado', 'fidc exclusivo', 'cedente unico', 'pool cedentes'],
    category: 'fidc',
    answer: `**FIDC Multicedente/Multisacado vs FIDC Exclusivo**\n\n**FIDC Exclusivo (Mono-cedente):**\n• Um único cedente transfere seus recebíveis\n• Risco concentrado em um portfólio\n• Seguro de crédito customizado para os sacados do cedente\n• Usado por grandes empresas (varejo, indústria)\n• Exemplo: FIDC de uma rede varejista para financiar sua cadeia de fornecedores\n\n**FIDC Multicedente/Multisacado:**\n• Múltiplos cedentes (factorings, fintechs, PMEs)\n• Carteira diversificada de sacados\n• Seguro de crédito mais complexo (cobertura de pool)\n• Gestora especializada como fiduciária\n• Menor ticket mínimo por cedente\n\n**Implicações para o seguro de crédito:**\n\n| Aspecto | Exclusivo | Multi-cedente |\n|---|---|---|\n| Apólice | Única, personalizada | Pool/blanket |\n| Limites | Por sacado | Agregado por fundo |\n| Prêmio | Negociado (volume) | Por classe de risco |\n| Gestão | Centralizada | Descentralizada |\n\n**Regulamentação:** Resolução CVM 175/2022 (FIDC) e Instrução CVM 356 (histórica).`
  },
  {
    keywords: ['resolucao cvm 175', 'cvm 356', 'regulacao fidc', 'instrucao cvm fidc'],
    category: 'fidc',
    answer: `**Regulamentação CVM para FIDCs — Resolução CVM 175/2022**\n\n**Resolução CVM 175/2022** (vigente desde outubro/2023) substituiu a Instrução CVM 356/2001 e modernizou as regras dos FIDCs.\n\n**Principais mudanças relevantes para seguro de crédito:**\n\n**1. Subordinação mínima flexível:**\n• Antes: 20% obrigatório em cotas subordinadas\n• Agora: Pode ser reduzido com **credit enhancement** (seguro de crédito)\n• Seguradora precisa ser aprovada como mitigante de risco\n\n**2. Novos tipos de cotas:**\n• Cotas de classes múltiplas permitidas\n• Mezanino com características híbridas\n• Seguro pode cobrir classes específicas\n\n**3. Gestão de risco aprimorada:**\n• Stress testing obrigatório\n• Relatórios de performance com seguro como variável\n• Disclosure de cobertura de seguro nos documentos do fundo\n\n**4. FIDCs Abertos:**\n• Agora permitidos (antes só fechados)\n• Seguro de crédito com renovação automática necessário\n\n**Atenção:** A SUSEP e CVM trabalham em conjunto para regulamentar o uso de seguro de crédito como **credit enhancement** em FIDCs.`
  },
  {
    keywords: ['credit enhancement fidc', 'credit enhancement', 'melhoria rating fidc', 'rating cota senior', 'upgrade rating', 'melhoria credito'],
    category: 'fidc',
    answer: `**Credit Enhancement — Como o Seguro de Crédito Melhora o Rating de FIDCs**\n\n**O que é credit enhancement?**\nMecanismo que reduz o risco das cotas sênior, melhorando seu rating e reduzindo o custo de captação.\n\n**Tipos de credit enhancement:**\n\n1. **Subordinação** — cotas subordinadas absorvem perdas (tradicional)\n2. **Reserva de liquidez** — caixa reservado para cobrir inadimplência\n3. **Seguro de Crédito** — seguradora garante os sacados\n4. **Garantia bancária** — banco fiador (caro)\n5. **Excesso de spread** — rendimento extra do portfólio\n\n**Impacto do seguro de crédito no rating:**\n\n| Sem seguro | Com seguro de crédito |\n|---|---|\n| Rating A ou AA | Rating AA+ ou AAA |\n| Subordinação: 20-25% | Subordinação: 8-12% |\n| Custo de captação maior | Custo de captação menor |\n| Menos investidores elegíveis | Acesso a fundos conservadores |\n\n**Como as agências avaliam:**\n• Moody's, Fitch, S&P e Austin Rating avaliam a solidez da seguradora\n• Financial Strength Rating da seguradora é incorporado\n• Coberturas com seguradora AA+ permitem AAA na cota sênior\n\n**Resultado prático:** Redução de 40-80bps no custo de captação, que supera o custo do prêmio do seguro.`
  },
  {
    keywords: ['fidc consignado', 'fidc cartao credito', 'fidc automovel', 'fidc financiamento', 'fidc consumo'],
    category: 'fidc',
    answer: `**FIDCs por Segmento — Crédito Consignado, Cartão e Automotivo**\n\n**FIDC Consignado:**\n• Recebíveis de crédito consignado (desconto em folha)\n• Risco de crédito muito baixo (pagamento garantido em folha)\n• Seguro de crédito usado principalmente para risco sistêmico\n• Risco do convênio (INSS, servidores) coberto por seguro\n• Cotas sênior com rating AAA usual\n\n**FIDC de Cartão de Crédito:**\n• Recebíveis de carteiras de cartão\n• Seguro cobre inadimplência acima da perda esperada (XL)\n• Granularidade alta (milhões de devedores) — risco estatístico\n• Seguro paramétrico possível (índice de inadimplência do setor)\n\n**FIDC Automotivo:**\n• Financiamentos de veículos securitizados\n• Garantia real (veículo) reduz necessidade de seguro\n• Seguro complementa para risco de insolvência da financeira\n• Cobertura de GAP (diferença entre dívida e valor do veículo)\n\n**FIDC Agro (crescimento acelerado):**\n• CRA e CPR dentro de FIDCs\n• Seguro de crédito para produtores rurais\n• Complementa seguro rural (produção + crédito)\n• Alta demanda por estruturadores em 2024-2026\n\n**A Fairfield tem expertise em todas essas estruturas.**`
  },
  {
    keywords: ['gestora custodiante administradora fidc', 'partes fidc', 'agentes fidc', 'estrutura partes'],
    category: 'fidc',
    answer: `**Partes Envolvidas em um FIDC com Seguro de Crédito**\n\n**Estrutura completa de partes:**\n\n**1. Cedente**\n• Empresa que origina e vende os recebíveis\n• Pode ser o próprio cotista subordinado\n• Responsável pela qualidade dos créditos cedidos\n\n**2. Sacado**\n• Devedor dos recebíveis (quem deve pagar)\n• É quem a seguradora analisa e aprova o limite\n\n**3. Administradora**\n• Responsável legal pelo fundo (CVM 175)\n• Assina contratos em nome do fundo\n• Exemplos: Oliveira Trust, Vórtx, BRL Trust\n\n**4. Gestora**\n• Define política de crédito e compra de recebíveis\n• Gerencia o relacionamento com a seguradora\n• Monitora a performance do portfólio\n\n**5. Custodiante**\n• Verifica e guarda os documentos dos recebíveis\n• Confirma a existência e validade dos créditos\n• Banco ou instituição autorizada pela CVM\n\n**6. Seguradora**\n• Emite a apólice de seguro de crédito em favor do FIDC\n• Analisa e aprova limites de crédito dos sacados\n• Paga indenização diretamente ao fundo\n\n**7. Agência de Rating**\n• Avalia a estrutura com e sem seguro\n• Determina o rating das cotas sênior\n\n**A Fairfield atua como estruturadora e corretora** nessas operações.`
  },
  {
    keywords: ['casos praticos fidc seguro', 'exemplos fidc brasil', 'fidc que usam seguro', 'referencias fidc'],
    category: 'fidc',
    answer: `**Casos Práticos — FIDCs com Seguro de Crédito no Brasil**\n\n**Contexto do mercado:**\nO mercado brasileiro de FIDCs superou R$ 500 bilhões em patrimônio líquido em 2024, com crescente uso de seguro de crédito como credit enhancement.\n\n**Segmentos com maior uso:**\n\n**Varejo e Distribuição:**\n• Redes varejistas securitizam recebíveis de fornecedores (supply chain)\n• Seguro garante os fornecedores que recebem antecipado\n• Estrutura "confirming" (reverse factoring) com FIDC + seguro\n\n**Agronegócio:**\n• Cooperativas estruturam FIDCs para financiar produtores\n• Seguro de crédito agrícola + seguro de crédito comercial combinados\n• Cedente: cooperativa. Sacados: produtores rurais\n\n**Infraestrutura e Energia:**\n• FIDCs de recebíveis de concessionárias\n• Seguro de crédito político para riscos regulatórios\n• Energia renovável (projetos solares, eólicos)\n\n**Fintechs e Factorings:**\n• Plataformas de antecipação de recebíveis (marketplace lending)\n• Seguro para carteiras de PMEs\n• Gestão automatizada via API da seguradora\n\n**Tendência 2025-2026:**\n• FIDCs com seguro paramétrico (gatilho automático)\n• Integração de IA para subscrição em tempo real\n• Estruturas tokenizadas (RWA — Real World Assets)\n\n**Fale com a Fairfield** para estruturar seu FIDC com cobertura de seguro de crédito.`
  },
  {
    keywords: ['supply chain finance fidc', 'reverse factoring fidc', 'confirming seguro', 'cadeia fornecedores fidc'],
    category: 'fidc',
    answer: `**Supply Chain Finance com FIDC e Seguro de Crédito**\n\n**Conceito:**\nO supply chain finance (SCF) permite que fornecedores antecipem recebíveis aprovados pelo comprador (âncora), usando um FIDC como veículo de funding.\n\n**Estrutura típica:**\n\n1. **Comprador âncora** aprova fatura do fornecedor no sistema\n2. **Fornecedor** solicita antecipação via plataforma\n3. **FIDC** compra o recebível com deságio\n4. **Seguradora** garante o risco de crédito do comprador âncora\n5. **No vencimento**, comprador paga diretamente ao FIDC\n\n**Por que o seguro é essencial:**\n• Investidores das cotas sênior exigem garantia\n• Reduz o custo de captação do FIDC (melhor taxa para fornecedor)\n• Seguradora já conhece o risco do âncora (due diligence prévia)\n\n**Vantagens para cada parte:**\n\n| Parte | Benefício |\n|---|---|\n| Fornecedor | Antecipação com taxa baixa |\n| Comprador | Prazo estendido sem impacto no balanço |\n| FIDC | Risco mitigado pelo seguro |\n| Seguradora | Prêmio sobre volume expressivo |\n\n**Plataformas no Brasil:** Pymento, Yuno, TOTVS Financial Services, SAP Ariba\n\n**A Fairfield** estrutura coberturas para programas de SCF de R$ 50M a R$ 2 bilhões.`
  },

  // ── Clausulados e Condições Contratuais Avançadas ──
  {
    keywords: ['mpl probable maximum loss', 'pml maximum possible loss', 'perda maxima possivel', 'perda maxima provavel'],
    category: 'clausulado',
    answer: `**MPL e PML — Conceitos Fundamentais de Subscrição**\n\n**MPL (Maximum Possible Loss):**\nA **perda máxima possível** assume o pior cenário absoluto — todos os limites de crédito são acionados simultaneamente.\n\n• Usado para calcular a capacidade máxima da apólice\n• Determina o limite máximo de indenização agregado\n• Sempre maior que o PML\n• Exemplo: Faturamento R$ 100M, limites aprovados R$ 80M → MPL = R$ 80M\n\n**PML (Probable Maximum Loss):**\nA **perda máxima provável** considera cenários realistas de sinistros simultâneos, baseada em:\n\n• Histórico de inadimplência do setor\n• Correlação entre devedores\n• Concentração geográfica/setorial\n• Análise de stress por seguradora\n\n**Uso prático na apólice:**\n\n| Métrica | Uso |\n|---|---|\n| MPL | Limite máximo global da apólice |\n| PML | Base para cálculo do prêmio |\n| PML/MPL ratio | Indica diversificação da carteira |\n\n**Para o segurado:**\n• MPL alto = apólice mais cara (ou exige mais resseguro)\n• Diversificar a carteira de devedores reduz PML\n• Concentração em um único devedor aumenta drasticamente o PML\n\n**Dica:** A Fairfield analisa seu portfólio para otimizar MPL/PML antes da subscrição.`
  },
  {
    keywords: ['aggregate limit', 'per occurrence limit', 'limite agregado', 'limite por ocorrencia', 'limite sinistro'],
    category: 'clausulado',
    answer: `**Aggregate Limit vs Per Occurrence Limit**\n\n**Per Occurrence Limit (por ocorrência):**\nLimite máximo de indenização por **evento de sinistro** (insolvência de um devedor).\n\n• Protege contra sinistros individuais grandes\n• Exemplo: Limite por ocorrência = R$ 5M → mesmo que devedor deva R$ 10M, indenização máxima = R$ 5M\n• Importante para concentrações de risco\n\n**Aggregate Limit (agregado anual):**\nLimite máximo de indenização **total no período da apólice** (geralmente 12 meses).\n\n• Protege a seguradora contra acúmulo de sinistros\n• Exemplo: Aggregate = R$ 20M → após R$ 20M em sinistros, apólice encerra cobertura\n• Pode ser: Aggregate First Loss (AAD deduzido do aggregate)\n\n**Combinações comuns:**\n\n| Estrutura | Uso Típico |\n|---|---|\n| Só per occurrence | Carteiras com poucos grandes devedores |\n| Só aggregate | Carteiras granulares (muitos pequenos) |\n| Per occurrence + aggregate | Estruturas mistas (FIDC, XL) |\n| Unlimited aggregate | Whole Turnover premium (taxa sobre faturamento) |\n\n**Negociação:** Em apólices XL (Excess of Loss), o aggregate limit é crucial — define quantas vezes o priority pode ser acionado.\n\n**Atenção:** Verifique sempre se sua apólice tem aggregate limit — pode ser surpresa no momento do sinistro.`
  },
  {
    keywords: ['non cancellable limits', 'ncc limits', 'limites nao cancelaveis', 'limite irrevogavel', 'limite garantido'],
    category: 'clausulado',
    answer: `**NCC — Non-Cancellable Credit Limits**\n\n**O que são limites não canceláveis (NCC)?**\nUma cláusula especial onde a seguradora se compromete a **não cancelar nem reduzir** o limite de crédito de um determinado devedor durante a vigência da apólice, independentemente de deterioração do risco.\n\n**Quando é utilizado:**\n• Devedores estratégicos do segurado\n• Grandes compradores com contratos de longo prazo\n• Operações de FIDC (segurança para os investidores)\n• Exportações com contratos plurianuais\n\n**Diferença entre limit types:**\n\n| Tipo de Limite | Características |\n|---|---|\n| Limite Discricionário | Seguradora pode cancelar a qualquer tempo |\n| Limite Aprovado | Pode ser revisado com aviso prévio |\n| **NCC (Non-Cancellable)** | **Garantido pelo período contratado** |\n| Enhanced NCC | NCC + cobertura ampliada de período de cauda |\n\n**Custo:** NCC tem prêmio adicional de 15-40% sobre o limite normal, dependendo do risco do devedor.\n\n**Aplicação em exportação:**\nEspecialmente relevante quando o comprador é âncora de uma cadeia de fornecedores — cancelamento do limite quebraria toda a estrutura de financiamento.\n\n**Importante:** Nem todas as seguradoras oferecem NCC. Allianz Trade e Coface têm produtos específicos — consulte a Fairfield para comparação.`
  },
  {
    keywords: ['pre credit period', 'periodo pre credito', 'manufacturing period', 'periodo fabricacao seguro'],
    category: 'clausulado',
    answer: `**Pre-Credit Period — Período Pré-Crédito**\n\n**Definição:**\nO período pré-crédito (também chamado de "manufacturing period") é o intervalo entre o **início da produção/serviço** e a **entrega/emissão da fatura**.\n\n**Por que importa para o seguro?**\nNa maioria das apólices padrão, a cobertura inicia na **data da fatura** (quando o crédito comercial nasce). Mas o fornecedor já incorreu em custos antes disso.\n\n**Exemplo prático:**\n• Janeiro: Empresa recebe pedido de R$ 2M e inicia produção\n• Março: Entrega do equipamento e emissão da fatura\n• Julho: Vencimento do pagamento\n• Se o comprador falir em **fevereiro** (antes da fatura), a apólice padrão **não cobre**\n\n**Cobertura pré-crédito:**\n• Estende a proteção ao período de fabricação\n• Cobre custos já incorridos (materiais, mão de obra)\n• Mais comum em exportação e projetos de longa duração\n• Prêmio adicional de 10-25%\n\n**Setores que mais usam:**\n• Bens de capital (máquinas, equipamentos)\n• Construção e engenharia\n• Projetos customizados\n• Exportação de commodities processadas\n\n**Cláusula Contract Frustration** é a versão mais ampla, cobrindo também riscos políticos no pré-crédito.`
  },
  {
    keywords: ['run off period', 'periodo cauda', 'cauda apolice', 'vigencia estendida', 'tail period'],
    category: 'clausulado',
    answer: `**Run-Off Period — Período de Cauda da Apólice**\n\n**O que é o período de cauda (run-off)?**\nApós o cancelamento ou não renovação da apólice, o período durante o qual **sinistros ainda podem ser registrados** para vendas realizadas antes do término da cobertura.\n\n**Por que existe?**\nAs vendas têm prazo de pagamento (30, 60, 90, 180 dias). Uma venda feita em novembro com vencimento em fevereiro ainda tem direito a cobertura, mesmo que a apólice tenha terminado em dezembro.\n\n**Duração típica do run-off:**\n• Crédito doméstico: **90 a 180 dias** após o vencimento da apólice\n• Exportação: **180 a 360 dias** (prazos mais longos)\n• Projetos/construção: até **24 meses**\n\n**Condições para cobertura no run-off:**\n✓ Venda realizada DURANTE a vigência da apólice\n✓ Devedor tinha limite de crédito aprovado\n✓ Sinistro (inadimplência) ocorre APÓS o término\n✓ Notificação dentro do prazo do run-off\n\n**O que NÃO é coberto no run-off:**\n✗ Vendas realizadas APÓS o cancelamento\n✗ Novos devedores (limite aprovado após cancelamento)\n✗ Aumentos de limite após cancelamento\n\n**Dica crítica:** Ao trocar de seguradora, verifique se a nova apólice cobre o "período de transição" — pode haver um gap de cobertura.`
  },
  {
    keywords: ['contract frustration', 'frustracao contratual', 'cobertura frustracao', 'rescisao contrato importador'],
    category: 'clausulado',
    answer: `**Contract Frustration Coverage**\n\n**Definição:**\nCobertura que protege o exportador quando um **contrato é frustrado** por razões além do controle das partes — principalmente por ação governamental ou evento político no país do comprador.\n\n**Diferença entre contract frustration e risco de crédito:**\n\n| Risco de Crédito | Contract Frustration |\n|---|---|\n| Comprador não paga (insolvência) | Contrato não pode ser executado |\n| Devedor não tem recursos | País não permite importação |\n| Má vontade do devedor | Guerra, embargo, confisco |\n\n**Situações cobertas:**\n• Cancelamento de licença de importação\n• Embargo comercial (sanções)\n• Confisco de mercadoria em trânsito\n• Decreto governamental proibindo pagamento\n• Escassez de divisas (impossibilidade de remessa)\n• Guerra, revolução, insurreição\n\n**Período pré-crédito + Contract Frustration:**\nA combinação é essencial para exportadores de bens de capital — cobre tanto o risco durante a fabricação quanto após a entrega.\n\n**Quem oferece no Brasil:**\n• SBCE (Seguradora Brasileira de Crédito à Exportação) — foco em risco político\n• Allianz Trade — cláusula específica em apólice de exportação\n• Coface — módulo de risco político separado\n\n**Prêmio:** 0,05% a 0,30% sobre o valor exportado, dependendo do país.`
  },
  {
    keywords: ['risco politico violencia politica', 'political violence', 'diferenca risco politico', 'guerra terrorismo seguro'],
    category: 'clausulado',
    answer: `**Risco Político vs Violência Política — Diferenças no Clausulado**\n\n**Risco Político (Political Risk):**\nAções do **governo** que prejudicam operações comerciais ou financeiras.\n\n**Coberturas típicas:**\n• Confisco, expropriação, nacionalização (CEN)\n• Inconvertibilidade de moeda / restrição de transferência\n• Cancelamento de licenças e concessões\n• Quebra de contrato pelo governo (sovereign breach)\n• Embargo e sanções\n\n**Violência Política (Political Violence):**\nAtos de **violência com motivação política** que causam danos físicos ou interrompem operações.\n\n**Coberturas típicas:**\n• Guerra e guerra civil\n• Terrorismo (incluindo SRCC — strikes, riots, civil commotion)\n• Sabotagem\n• Insurreição e revolução\n\n**Diferença prática para o seguro de crédito:**\n\n| Aspecto | Risco Político | Violência Política |\n|---|---|---|\n| Causa | Ação governamental | Ato violento |\n| Dano principal | Financeiro/legal | Físico/operacional |\n| Produto | Trade Credit + Political Risk | Property + BI + SRCC |\n| Seguradora | Allianz, Coface, SBCE | Chubb, AIG, Lloyd's |\n\n**Produto combinado:**\nAlgumas apólices de exportação combinam ambos em uma única cobertura "Comprehensive Political Risk" — mais eficiente e econômico.`
  },
  {
    keywords: ['endorsement top up', 'excess layer', 'camada excedente', 'endosso especial', 'cobertura complementar'],
    category: 'clausulado',
    answer: `**Endorsements Especiais — Top-Up e Excess Layer**\n\n**Top-Up (Complementação de Limite):**\nQuando a seguradora primária aprova um limite **menor** que o necessário, o Top-Up permite contratar uma segunda seguradora para cobrir o excedente.\n\n**Como funciona:**\n• Seguradora A aprova R$ 3M para o devedor XYZ\n• Segurado precisa de R$ 5M\n• Seguradora B faz o Top-Up do excedente R$ 2M\n• Ambas cobrem proporcionalmente em caso de sinistro\n\n**Excess Layer (Camada Excedente):**\nEstrutura onde a segunda seguradora só é acionada **após a primeira esgotar sua capacidade**.\n\n**Diferença Top-Up vs Excess Layer:**\n\n| Aspecto | Top-Up | Excess Layer |\n|---|---|---|\n| Ativação | Simultaneamente | Após esgotar camada 1 |\n| Risco da 2ª seguradora | Proporcional | Concentrado em grandes sinistros |\n| Custo | Menor | Maior (risco catastrophic) |\n| Uso típico | Limites acima do capacity | Proteção catastrófica |\n\n**Endorsed Conditions comuns:**\n• **Ampliação de prazo de mora** (de 90 para 180 dias)\n• **Extensão geográfica** (inclusão de países)\n• **Waiver of premium** em caso de sinistro total\n• **Retroactive cover** (cobertura retroativa)\n\n**A Fairfield opera no mercado Lloyd's** para estruturar Top-Up e Excess Layers para grandes exposições.`
  },

  // ── Estratégias Inovadoras ──
  {
    keywords: ['supply chain finance seguro', 'scf seguro credito', 'financiamento cadeia', 'antecipacao recebiveis seguro'],
    category: 'inovacao',
    answer: `**Seguro de Crédito para Supply Chain Finance (SCF)**\n\n**Supply Chain Finance** é o conjunto de soluções que otimiza o capital de giro de compradores e fornecedores usando o crédito do comprador âncora.\n\n**Modalidades de SCF com seguro de crédito:**\n\n**1. Confirming / Reverse Factoring:**\n• Comprador âncora instrui banco/FIDC a pagar fornecedores antecipado\n• Seguro garante o risco do âncora para o financiador\n• Taxa de antecipação reflete o risco do âncora (não do fornecedor)\n\n**2. Dynamic Discounting:**\n• Comprador usa caixa próprio para pagar antecipado com desconto\n• Seguro protege o comprador se fornecedor não entregar após pagamento\n\n**3. Inventory Finance:**\n• Financiamento de estoques em trânsito\n• Seguro de crédito + seguro de transporte combinados\n\n**4. Distributor Finance:**\n• Fabricante financia rede de distribuidores\n• Seguro garante o risco dos distribuidores para o fabricante\n\n**Benefícios do seguro no SCF:**\n• Permite 100% de adiantamento (sem retenção)\n• Reduz o custo de funding para toda a cadeia\n• Escala o programa sem aumentar o risco do financiador\n\n**Mercado:** Programas de SCF no Brasil movimentam +R$ 800 bilhões/ano. A Fairfield atua nos maiores programas do país.`
  },
  {
    keywords: ['securitizacao recebiveis seguro', 'cri cra seguro', 'ativo lastrado seguro', 'receivables securitization'],
    category: 'inovacao',
    answer: `**Securitização de Recebíveis Lastreada em Seguro de Crédito**\n\n**Conceito:**\nO seguro de crédito atua como **credit wrapper** em operações de securitização, elevando o rating dos ativos emitidos.\n\n**Veículos de securitização no Brasil:**\n• **FIDC** — Fundo de Investimento em Direitos Creditórios\n• **CRI** — Certificado de Recebíveis Imobiliários\n• **CRA** — Certificado de Recebíveis do Agronegócio\n• **CDCA** — Certificado de Direitos Creditórios do Agronegócio\n• **Debentures** — com recebíveis como lastro\n\n**Como o seguro melhora a estrutura:**\n\n1. **Sem seguro:** CRA rating BBB+, taxa CDI + 3,5%\n2. **Com seguro de crédito (AA seguradora):** CRA rating AA, taxa CDI + 1,8%\n3. **Economia no custo:** 1,7% ao ano sobre o principal\n\n**Para uma emissão de R$ 200M:** Economia de R$ 3,4M/ano em custo de captação vs. prêmio de seguro de R$ 0,8M/ano → **saving líquido de R$ 2,6M/ano**\n\n**Estruturadores que usam esse approach:**\n• Gestoras de FIDC\n• Securitizadoras (True Securitizadora, Opea, Virgo)\n• Bancos de investimento (BTG, Itaú BBA, XP)\n\n**A Fairfield** assessora tanto emissores quanto investidores nessas estruturas.`
  },
  {
    keywords: ['seguro credito parametrico', 'parametric insurance', 'gatilho automatico', 'trigger based insurance'],
    category: 'inovacao',
    answer: `**Seguro de Crédito Paramétrico — Inovação no Mercado**\n\n**O que é seguro paramétrico?**\nAo invés de regular cada sinistro individualmente, o pagamento é **automático** quando um índice ou gatilho predefinido é atingido.\n\n**Gatilhos usados em crédito:**\n• Índice de inadimplência do setor supera X%\n• Devedor tem pedido de recuperação judicial deferido (registro no DJE)\n• Rating do devedor cai abaixo de BB- (agência específica)\n• Índice de spread de crédito (CDS) supera determinado nível\n• Nota de crédito interna da seguradora cai abaixo de threshold\n\n**Vantagens:**\n• Pagamento em 24-72 horas (vs. 30-180 dias na regulação tradicional)\n• Sem contestação da prova de perda\n• Fluxo de caixa previsível\n• Ideal para FIDCs (cotistas precisam de liquidez rápida)\n\n**Desafios:**\n• Basis risk: evento ocorre mas gatilho não é ativado\n• Regulação SUSEP ainda em desenvolvimento\n• Precificação complexa (depende de dados históricos)\n\n**Onde já existe no mundo:**\n• Lloyd's of London (crédito parametric para trade finance)\n• WTW e Aon estruturam produtos para bancos\n• Mercado africano e asiático (micro-seguro de crédito)\n\n**No Brasil:** Sandbox da SUSEP (Resolução SUSEP 381/2020) permite testes — a Fairfield acompanha de perto.`
  },
  {
    keywords: ['api seguro credito', 'embedded insurance erp', 'integracao erp seguro', 'api first insurance', 'marketplace seguro'],
    category: 'inovacao',
    answer: `**API-First Credit Insurance — Seguro Embutido em ERPs e Marketplaces**\n\n**O que é Embedded Credit Insurance?**\nIntegração do seguro de crédito diretamente nos fluxos de trabalho do cliente, sem necessidade de acessar portais separados da seguradora.\n\n**Casos de uso:**\n\n**ERP Integration (SAP, TOTVS, Oracle):**\n• Ao cadastrar um novo cliente no ERP, sistema consulta automaticamente a seguradora\n• Limite de crédito aprovado aparece direto no cadastro do cliente\n• Ao emitir uma NF, sistema verifica se o limite está disponível\n• Alertas automáticos de cancelamento de limite no ERP\n\n**Marketplace B2B:**\n• Vendedor define preço; sistema calcula prêmio do seguro em tempo real\n• Comprador escolhe prazo de pagamento (30/60/90 dias) e vê custo do seguro\n• Contratação em 1 clique\n• Ideal para plataformas como Mercado B2B, Supplyshelf, GEP\n\n**E-commerce B2B:**\n• Score de crédito do comprador calculado em milissegundos\n• Limite de crédito definido no checkout\n• Pagamento no prazo garantido pela seguradora\n\n**Seguradoras com API robusta:**\n• Allianz Trade (Trade Allianz API)\n• Coface (Cofanet API)\n• Euler Hermes / Atradius Connect\n\n**O SENTINEL** (plataforma Fairfield) tem integração nativa com essas APIs. Consulte nosso time de tecnologia.`
  },
  {
    keywords: ['pay per transaction', 'usage based insurance', 'seguro por transacao', 'seguro sob demanda credito'],
    category: 'inovacao',
    answer: `**Usage-Based Credit Insurance — Seguro por Transação**\n\n**Modelo tradicional:** Prêmio fixo anual sobre faturamento projetado, independente do volume real.\n\n**Modelo usage-based:** Prêmio cobrado **por transação** ou **por fatura emitida**, de forma dinâmica.\n\n**Como funciona:**\n1. Empresa integra API da seguradora ao seu sistema de faturamento\n2. Ao emitir cada NF a prazo, o sistema solicita cobertura\n3. Seguradora responde em segundos: aprovado/negado + prêmio\n4. Prêmio debitado automaticamente (PIX, cartão, conta)\n5. Cobertura ativa apenas para aquela transação específica\n\n**Vantagens para PMEs:**\n• Sem prêmio mínimo alto (barreira de entrada)\n• Paga apenas o que usa\n• Controle total do custo por venda\n• Ideal para sazonalidade (vendas concentradas em dezembro/março)\n\n**Desvantagens:**\n• Geralmente mais caro por transação vs. apólice anual\n• Sem benefícios de carteira (bônus por baixa sinistralidade)\n• Seguradora tem menos dados de contexto\n\n**Fintechs que operam modelo similar no Brasil:**\n• Guaranty (seguro de crédito para pequenos negócios)\n• Creditas (crédito com garantia — modelo adjacent)\n• Open Co (buy now pay later B2B)\n\n**Tendência:** À medida que o Open Insurance avança, o modelo usage-based deve crescer significativamente até 2027.`
  },
  {
    keywords: ['seguro credito fintech', 'credito digital seguro', 'plataforma digital seguro', 'insurtech credito'],
    category: 'inovacao',
    answer: `**Seguro de Crédito para Fintechs e Plataformas Digitais de Trade**\n\n**Por que fintechs precisam de seguro de crédito?**\nFintechs de crédito B2B enfrentam o mesmo risco que empresas tradicionais: inadimplência. O seguro permite que escalem sem aumentar capital próprio em risco.\n\n**Modalidades utilizadas por fintechs:**\n\n**1. Fintech de Antecipação de Recebíveis:**\n• Compra recebíveis de PMEs e assume o risco dos sacados\n• Seguro de crédito garante os sacados aprovados\n• Permite capital regulatório menor (Basileia III)\n\n**2. BNPL B2B (Buy Now, Pay Later):**\n• Fintech paga fornecedor imediatamente; comprador paga em 30/60/90 dias\n• Seguro cobre o risco do comprador\n• Modelo: Moneta, Trezo, Cellcoin\n\n**3. Marketplace de Crédito:**\n• Plataforma conecta empresas a investidores\n• Seguro aumenta o apetite dos investidores\n• CCB (Cédula de Crédito Bancário) garantida por seguro\n\n**4. Plataformas de Trade Finance:**\n• Desconto de LC (Letter of Credit) e duplicatas de exportação\n• Seguro de crédito à exportação integrado\n\n**Requisitos especiais para fintechs:**\n• API de decisão em tempo real (<500ms)\n• Cobertura granular (tickets de R$ 5K a R$ 5M)\n• Dados alternativos de crédito aceitos pela seguradora\n• Modelo white-label possível\n\n**A Fairfield** tem parcerias com as principais insurtechs para estruturar esses modelos.`
  },

  // ── Grandes Riscos e Operações Complexas ──
  {
    keywords: ['grandes riscos acima 50 milhoes', 'syndicated cover', 'sindicato seguro', 'exposicao acima 50m', 'grande risco credito'],
    category: 'grandes_riscos',
    answer: `**Seguro de Crédito para Grandes Exposições — Acima de USD 50M**\n\n**Desafio dos grandes riscos:**\nNenhuma seguradora sozinha tem capacidade ou apetite para garantir exposições muito grandes em um único devedor ou carteira concentrada.\n\n**Solução: Syndicated Cover (Cobertura Sindicada)**\n\n**Como funciona:**\n1. **Líder do sindicato** — seguradora principal que lidera a negociação (ex.: Allianz Trade)\n2. **Seguidores** — outras seguradoras que participam proporcionalmente\n3. **Corretor de resseguro** — coordena a colocação (Lloyd's, Guy Carpenter, Gallagher Re)\n4. **Apólice única** — segurado tem uma única apólice com múltiplos subscritores\n\n**Estrutura típica para USD 100M de exposição:**\n• Allianz Trade: 40% (USD 40M)\n• Atradius: 25% (USD 25M)\n• Coface: 20% (USD 20M)\n• Lloyd's syndicates: 15% (USD 15M)\n\n**Requisitos para sindicalização:**\n• Devedor bem conhecido e com rating disponível\n• Due diligence financeira detalhada\n• Apresentação formal para cada subscritor\n• Prazo de negociação: 4-12 semanas\n\n**Custo:**\n• Prêmio negociado individualmente com cada subscritor\n• Taxa de corretagem mais alta (operação complexa)\n• Honorários de due diligence possíveis\n\n**A Fairfield** tem acesso direto ao mercado Lloyd's e às principais resseguradoras para essas estruturas.`
  },
  {
    keywords: ['resseguro facultativo', 'facultative reinsurance', 'colocacao resseguro', 'resseguro grandes riscos'],
    category: 'grandes_riscos',
    answer: `**Resseguro Facultativo para Grandes Riscos de Crédito**\n\n**O que é resseguro facultativo?**\nAo contrário do resseguro proporcional automático (treaty), o facultativo é negociado **caso a caso**, para riscos específicos que excedem a capacidade da seguradora.\n\n**Quando a seguradora usa facultativo:**\n• Risco individual acima do limite do treaty automático\n• Risco em país com treaty excluído (risco político elevado)\n• Devedor com setor excluído do treaty\n• Necessidade de capacidade adicional temporária\n\n**Processo de colocação facultativa:**\n\n1. **Corretora de resseguro** prepara slip com detalhes do risco\n2. **Resseguradoras** cotam capacidade e taxa\n3. **Líder** (geralmente Munich Re, Swiss Re, Gen Re) subscreve a maior parte\n4. **Seguidores** completam a capacidade necessária\n5. **Apólice** emitida com back-to-back com o resseguro\n\n**Principais resseguradoras de crédito:**\n• **Munich Re** (ERGO Credit) — líder global\n• **Swiss Re** — forte em estruturados\n• **Gen Re** — Berkshire Hathaway\n• **Hannover Re** — forte em emerging markets\n• **SCOR** — especializado em crédito/surety\n\n**Prazo e custo:**\n• 2-6 semanas para colocação\n• Taxa de resseguro embutida no prêmio final\n• Segurado não paga separadamente pelo resseguro\n\n**A Fairfield** tem acesso direto ao mercado de resseguro para estruturar coberturas complexas.`
  },
  {
    keywords: ['project finance seguro credito', 'infraestrutura seguro', 'spe seguro', 'ppp seguro credito'],
    category: 'grandes_riscos',
    answer: `**Seguro de Crédito para Project Finance e Infraestrutura**\n\n**Project Finance** é a estrutura de financiamento baseada no fluxo de caixa futuro de um projeto (SPE — Sociedade de Propósito Específico), com recursos limitados às garantias do próprio projeto.\n\n**Onde o seguro de crédito atua:**\n\n**1. Risco de Performance do Pagador (Offtaker Risk):**\n• Concessionária tem contrato de venda de energia/serviço com governo ou empresa\n• Seguro garante que o comprador do serviço pagará conforme contrato\n• Comum em PPPs, concessões e PPA de energia renovável\n\n**2. Risco de Crédito dos Fornecedores (EPC Contractors):**\n• Construtores recebem pagamento antecipado\n• Seguro garante que entregarão conforme especificado\n• Mais próximo de Seguro Garantia (performance bond)\n\n**3. Risco Político na Concessão:**\n• Governo pode renegociar tarifas ou cancelar concessão\n• Seguro de risco político garante o fluxo de receita\n• Crucial para financiadores internacionais (IFC, BID, BNDES)\n\n**Seguradoras especializadas:**\n• MIGA (Multilateral Investment Guarantee Agency — Banco Mundial)\n• SACE (Itália), COFACE (França) — agências de crédito à exportação\n• AIG, Chubb, Zurich — mercado privado\n• SBCE (Brasil) — projetos com componente exportador\n\n**Estrutura típica:** Senior lender exige seguro como condição de financiamento — cobertura de 100% do principal ou das parcelas.`
  },
  {
    keywords: ['garantia soberana seguro', 'sovereign guarantee', 'risco governo', 'cobertura governo soberano'],
    category: 'grandes_riscos',
    answer: `**Garantia Soberana + Seguro de Crédito — Estruturas Combinadas**\n\n**O que é garantia soberana?**\nGarantia emitida por um governo (ou entidade por ele respaldada) assegurando o cumprimento de obrigações financeiras de um devedor privado ou público.\n\n**Por que combinar garantia soberana + seguro?**\n\n**Cenário 1 — Sovereign garantindo empresa privada:**\n• Empresa estatal deve ao exportador brasileiro\n• Governo do país garante a dívida\n• Porém: mesmo com garantia soberana, transferência de divisas pode ser bloqueada\n• Seguro de crédito cobre o risco de **inconvertibilidade** e **transferência**\n\n**Cenário 2 — Estrutura de dupla proteção:**\n• ECA (agência de crédito à exportação) garante até 85% do contrato\n• Seguradora privada cobre os 15% restantes\n• Ou: ECA garante risco político + seguradora cobre risco comercial\n\n**Agências de crédito à exportação (ECAs) brasileiras:**\n• **FGE** (Fundo de Garantia à Exportação) — Banco do Brasil/MDIC\n• **SBCE** (Seguradora Brasileira de Crédito à Exportação) — IRB\n• **PROEX** — Banco do Brasil (equalização de taxas)\n\n**ECAs internacionais parceiras:**\n• US EXIM Bank (EUA)\n• UKEF (Reino Unido)\n• Bpifrance (França)\n• KfW IPEX (Alemanha)\n\n**A Fairfield** estrutura coberturas combinando SBCE + mercado privado para maximizar a cobertura de exportações brasileiras.`
  },
  {
    keywords: ['commodities trader seguro', 'trading house seguro', 'comercializadora seguro', 'trader grao energia'],
    category: 'grandes_riscos',
    answer: `**Seguro de Crédito para Commodities Traders e Trading Houses**\n\n**Perfil de risco dos traders:**\nTraders de commodities têm risco de crédito único: operam com margens apertadas, volumes gigantes, em múltiplos países e com contraparte de qualidade variável.\n\n**Principais riscos cobertos:**\n\n**1. Risco da Contraparte (Buyer Default):**\n• Comprador de grãos, energia ou metais não paga\n• Trader já entregou a mercadoria\n• Seguro cobre o risco de crédito do comprador\n\n**2. Risco de Pré-Pagamento:**\n• Trader paga antecipado a fornecedor (produtor)\n• Fornecedor não entrega por falência ou problema operacional\n• Seguro cobre o risco do fornecedor (seller risk)\n\n**3. Risco de Documento (Documentary Risk):**\n• Falsificação de Warrant (armazém) ou Bill of Lading\n• Mercadoria não existe ou foi vendida duas vezes\n• Seguro de fraude de trade finance\n\n**Estruturas especializadas para traders:**\n• **Revolving credit insurance:** Limite renovável conforme entregas\n• **Approved buyer limit:** Lista de compradores pré-aprovados globalmente\n• **Commodity-specific terms:** Prazo curto (7-30 dias vs. 60-180 dias padrão)\n\n**Grandes traders no Brasil:**\n• ADM, Cargill, Louis Dreyfus, Bunge (grãos)\n• Vitol, Trafigura, Glencore (energia/metais)\n• SLC Agrícola, Amaggi (trading próprio)\n\n**Lloyd's e Zurich** são referência nesse segmento globalmente — a Fairfield tem acesso a esses mercados especializados.`
  },
  {
    keywords: ['excess of loss multibuyer', 'xol corporativo', 'grandes corporacoes xol', 'carteira excedente perda'],
    category: 'grandes_riscos',
    answer: `**Multi-Buyer Excess of Loss para Grandes Corporações**\n\n**O que é o XL Multi-Buyer Corporativo?**\nModelo de seguro de crédito onde a empresa assume uma franquia (prioridade) alta e o seguro cobre apenas as perdas excedentes — mas em toda a carteira de compradores simultaneamente.\n\n**Estrutura típica para grande corporação:**\n\n• Faturamento a prazo: R$ 2 bilhões/ano\n• Perda histórica média: 0,15% = R$ 3M\n• Prioridade (franchise): R$ 15M (5x a perda esperada)\n• Limite de indenização: R$ 100M acima da prioridade\n\n**Componentes do XL Corporativo:**\n\n| Camada | Responsável | Valor |\n|---|---|---|\n| Perdas normais (0-R$15M) | Própria empresa | R$ 15M |\n| Perdas anormais (R$15M-R$115M) | Seguradora | R$ 100M |\n| Perdas catastróficas (>R$115M) | Resseguro | Ilimitado |\n\n**Vantagens do XL Corporativo:**\n• Prêmio muito menor que whole turnover (só cobre excesso)\n• Empresa mantém gestão direta da carteira\n• Sem interferência da seguradora nos limites de crédito rotineiros\n• Cobertura concentrada onde realmente importa\n\n**Quem usa:**\n• Grandes indústrias (químico, siderúrgico, alimentício)\n• Distribuidoras atacadistas\n• Grupos econômicos com múltiplas filiais\n\n**Mínimo de apólice:** Geralmente acima de R$ 500M de faturamento segurado — estrutura sob medida pela Fairfield.`
  },

  // ── Legislação e Regulamentação Avançada ──
  {
    keywords: ['resolucao cnsp 432', 'cnsp 432 2021', 'condicoes gerais obrigatorias', 'regulacao credito interno'],
    category: 'legislacao',
    answer: `**Resolução CNSP 432/2021 — Condições Gerais Obrigatórias**\n\n**O que é a Resolução CNSP 432/2021?**\nO principal normativo que regula o **seguro de crédito interno** no Brasil, estabelecendo as condições gerais mínimas obrigatórias para todas as apólices.\n\n**Principais disposições:**\n\n**1. Definições obrigatórias:**\n• Devedor, segurado, limite de crédito, crédito segurado\n• Mora prolongada (definição mínima: 120 dias)\n• Insolvência presumida e declarada\n\n**2. Coberturas mínimas obrigatórias:**\n• Insolvência do devedor (falência decretada)\n• Mora prolongada acima do prazo regulamentado\n• Insolvência presumida (em casos definidos)\n\n**3. Exclusões obrigatórias:**\n• Partes relacionadas (grupo econômico do segurado)\n• Dívidas anteriores à apólice\n• Litígio comercial entre as partes\n• Risco político (cobertura separada)\n\n**4. Prazo de comunicação de sinistro:**\n• Até **30 dias** após conhecimento do evento\n• Mora: a contar do vencimento da fatura não paga\n\n**5. Prazo de indenização:**\n• Seguradora tem **30 dias** para analisar após documentação completa\n• Mora da seguradora: SELIC + multa de 2%\n\n**6. Documentação mínima do sinistro:**\n• Notas fiscais, duplicatas ou contratos\n• Prova de entrega (aviso de recebimento)\n• Demonstração da dívida (extrato)\n\n**Complemento:** A Resolução CNSP 432 foi atualizada em 2023 para incluir disposições sobre seguros digitais e APIs.`
  },
  {
    keywords: ['open insurance susep', 'compartilhamento dados seguro', 'fases open insurance', 'portabilidade apolice'],
    category: 'legislacao',
    answer: `**Open Insurance Brasil — Fases de Implementação e Impacto no Crédito**\n\n**O que é Open Insurance?**\nIniciativa da SUSEP para criar um ecossistema aberto de dados no setor de seguros, similar ao Open Banking do Banco Central.\n\n**Fases de implementação:**\n\n**Fase 1 — Dados Públicos (concluída 2022):**\n• Seguradoras compartilham dados de produtos e canais\n• Comparação de apólices facilitada\n• APIs abertas para fintechs e corretoras\n\n**Fase 2 — Dados de Clientes (em implementação 2023-2025):**\n• Segurado autoriza compartilhamento do seu histórico\n• Histórico de sinistralidade portável entre seguradoras\n• Bônus/Malus acompanha o segurado na troca\n\n**Fase 3 — Serviços Financeiros (prevista 2025-2026):**\n• Contratação de seguros via APIs de terceiros\n• Integração com plataformas de crédito\n• Precificação personalizada em tempo real\n\n**Impacto específico no Seguro de Crédito:**\n\n• **Portabilidade de histórico:** Bônus acumulado segue o segurado\n• **Cotação automatizada:** ERPs cotam e contratam sem intervenção humana\n• **Dados compartilhados:** Histórico de devedores mais rico para subscrição\n• **Concorrência:** Novos entrantes (insurtechs) com produtos inovadores\n\n**Oportunidade:** A Fairfield está estruturando integrações Open Insurance para facilitar a contratação digital de seguro de crédito.`
  },
  {
    keywords: ['sandbox susep', 'sandbox regulatorio', 'insurtech regulacao', 'resolucao susep 381'],
    category: 'legislacao',
    answer: `**Sandbox Regulatório da SUSEP — Oportunidades para Insurtechs de Crédito**\n\n**O que é o Sandbox da SUSEP?**\nAmbiente controlado criado pela Resolução SUSEP 381/2020 (atualizada 2022) que permite testar **produtos e serviços inovadores** com regras regulatórias flexibilizadas por prazo determinado.\n\n**Como funciona:**\n• Empresa submete proposta de inovação\n• SUSEP avalia e pode autorizar testes por 12-24 meses\n• Volume máximo de prêmios e segurados limitado\n• Ao final, SUSEP decide se regulamenta permanentemente\n\n**Produtos de crédito que passaram pelo sandbox:**\n\n1. **Seguro de crédito paramétrico** (gatilho em índice de inadimplência)\n2. **Microcrédito segurado** (vendedores ambulantes, MEIs)\n3. **BNPL B2B com seguro embutido** (buy now, pay later empresarial)\n4. **Seguro de crédito por assinatura mensal** (PMEs)\n5. **Token de seguro de crédito** (fracionamento em blockchain)\n\n**Requisitos para participar:**\n• Proposta genuinamente inovadora\n• Plano de negócios com proteção ao consumidor\n• Capital mínimo reduzido (sandbox)\n• Relatórios periódicos à SUSEP\n\n**Status atual (2024-2025):**\n• 3ª rodada do sandbox em andamento\n• Foco em ESG e crédito sustentável\n• Integração Open Insurance como tema prioritário\n\n**A Fairfield** acompanha ativamente o sandbox para identificar inovações relevantes para seus clientes.`
  },
  {
    keywords: ['marco legal garantias', 'lei 14711 2023', 'nova lei garantias', 'impacto garantias seguro'],
    category: 'legislacao',
    answer: `**Marco Legal das Garantias (Lei 14.711/2023) e Seguro de Crédito**\n\n**O que é a Lei 14.711/2023?**\nO Marco Legal das Garantias modernizou a legislação sobre garantias reais no Brasil, com impacto direto no uso de seguro de crédito como instrumento complementar.\n\n**Principais mudanças:**\n\n**1. Alienação Fiduciária Ampliada:**\n• Mais ativos podem ser dados em garantia fiduciária\n• Execução extrajudicial mais rápida\n• Impacto: reduz necessidade de seguro como única proteção\n\n**2. Garantia de Recebíveis:**\n• Recebíveis podem ser cedidos como garantia sem cessão definitiva\n• FIDC pode usar recebíveis garantidos\n• Seguro de crédito sobre recebíveis garantidos tem subscrição diferente\n\n**3. Portabilidade de Garantias:**\n• Garantias podem migrar entre credores sem novo registro\n• Impacta operações de SCF e FIDC\n\n**4. Seguro de Crédito como Garantia Complementar:**\n• A lei reconhece instrumentos de mitigação de risco\n• Seguro de crédito pode substituir parte das garantias reais exigidas\n• Especialmente relevante para PMEs sem patrimônio suficiente\n\n**Impacto prático:**\n\n| Antes da Lei | Após Lei 14.711 |\n|---|---|\n| Garantia real obrigatória | Seguro pode complementar |\n| Execução judicial lenta | Execução extrajudicial |\n| Recebíveis como lastro complexo | Recebíveis como garantia simplificada |\n\n**Oportunidade:** Mais empresas elegíveis para crédito usando seguro como mitigante — mercado potencial expandido para a Fairfield.`
  },
  {
    keywords: ['basileia iii seguro credito', 'capital regulatorio seguro', 'mitigante risco basileia', 'rwas seguro credito'],
    category: 'legislacao',
    answer: `**Basileia III e Seguro de Crédito como Mitigante de Risco**\n\n**Basileia III** é o conjunto de regras internacionais de capital para bancos, implementadas no Brasil pelo Banco Central (Resolução BCB 200/2022).\n\n**Como bancos usam seguro de crédito para reduzir capital:**\n\n**Conceito de Risk Weighted Assets (RWA):**\n• Bancos precisam manter capital mínimo proporcional ao risco dos ativos\n• RWA = Valor do ativo × Fator de ponderação de risco\n• PME sem garantia: ponderação 100-150%\n• PME com seguro de crédito (seguradora AA): ponderação reduzida\n\n**Redução de capital com seguro de crédito:**\n\n| Devedor | Sem Seguro | Com Seguro (AA Seguradora) |\n|---|---|---|\n| PME sem rating | RWA 100% | RWA 20-50% |\n| Empresa B-rated | RWA 100% | RWA 20% |\n| Exportação (risco país) | RWA 100-150% | RWA 20% (risco seguradora) |\n\n**Benefício para o banco:**\n• Menor capital imobilizado = maior alavancagem\n• Pode emprestar mais com mesmo capital\n• Ou: reduzir capital regulatório mantendo o portfólio\n\n**Requisitos para elegibilidade como mitigante:**\n• Seguradora com rating mínimo AA- (S&P/Moody's)\n• Cobertura irrevogável e incondicional\n• Prazo da apólice ≥ prazo do crédito\n• Apólice em favor do banco (credor)\n\n**Impacto no mercado:** Bancos que usam seguro de crédito sistematicamente têm vantagem competitiva no custo de capital — tendência crescente no Brasil.`
  },

  // ── Setores Especializados ──
  {
    keywords: ['seguro credito energia renovavel', 'solar eolica seguro', 'ppa seguro credito', 'energia limpa seguro'],
    category: 'setores',
    answer: `**Seguro de Crédito para Energia Renovável**\n\n**O setor de energia renovável** tem crescido exponencialmente no Brasil — líder mundial em energia eólica terrestre e top 5 em solar. O seguro de crédito é ferramenta essencial para estruturar projetos e contratos de venda de energia.\n\n**Principais aplicações:**\n\n**1. Risco do Comprador de Energia (Offtaker Risk):**\n• Empresa que compra energia via PPA (Power Purchase Agreement)\n• Se empresa falir, o projeto não recebe pela energia gerada\n• Seguro garante o fluxo de receita do PPA por 15-20 anos\n• Fundamental para financiadores (BNDES, bancos, debêntures)\n\n**2. Risco de Fornecedores (EPC + O&M):**\n• Construtor do parque pode falir durante a obra\n• Seguro garante a conclusão (performance bond)\n• Complementar ao seguro de crédito de fornecimento de equipamentos\n\n**3. Risco de Crédito nas Vendas no Mercado Livre (ACL):**\n• Geradores vendem energia a distribuidores e grandes consumidores\n• Prazo de pagamento 30-60 dias\n• Seguro de crédito padrão aplicado aqui\n\n**4. Risco de Projetos de GD (Geração Distribuída):**\n• Instaladores de solar vendem sistemas financiados\n• Seguro garante inadimplência dos clientes\n• Modelo de carteira: muitos pequenos riscos\n\n**Seguradoras ativas no setor:**\n• Allianz Trade (PPA e projetos de grande porte)\n• AIG (political risk para projetos internacionais)\n• SBCE (exportação de equipamentos solares brasileiros)\n\n**A Fairfield** já estruturou coberturas para parques eólicos e plantas solares no Nordeste brasileiro.`
  },
  {
    keywords: ['trade finance seguro', 'forfaiting seguro', 'confirming exportacao', 'lc letter of credit seguro'],
    category: 'setores',
    answer: `**Seguro de Crédito para Trade Finance — Forfaiting e Confirming**\n\n**Trade Finance** é o conjunto de instrumentos financeiros que facilitam o comércio internacional, reduzindo riscos entre exportador e importador.\n\n**Forfaiting com Seguro de Crédito:**\nO forfaiting é a compra definitiva de recebíveis de exportação pelo banco, sem direito de regresso contra o exportador.\n\n• Exportador vende sua fatura ao banco forfaiter\n• Banco assume 100% do risco do importador\n• **Seguro de crédito** garante o banco forfaiter contra inadimplência\n• Exportador recebe à vista (sem risco de crédito)\n• Ideal para exportações de médio prazo (1-7 anos)\n\n**Confirming Internacional (Supplier Finance):**\n• Comprador âncora multinacional instrui banco a pagar fornecedores locais\n• Banco paga e espera reembolso do âncora\n• Seguro garante o risco do âncora multinacional\n• Taxa competitiva baseada no risco da multinacional\n\n**Letter of Credit (LC) e Seguro:**\n• LC confirmada por banco brasileiro: seguro garante risco do banco emissor estrangeiro\n• LC stand-by: funciona como garantia bancária + seguro como second layer\n\n**Instrumentos de trade finance e seguros:**\n\n| Instrumento | Risco Coberto | Seguradora |\n|---|---|---|\n| LC confirmada | Risco banco emissor | Allianz, Coface |\n| Forfaiting | Risco importador | Lloyd's, AIG |\n| Confirming | Risco âncora | Allianz, Atradius |\n| Garantia bancária | Risco banco garantidor | SBCE |\n\n**A Fairfield** tem estruturas de trade finance para exportadores brasileiros de todos os portes.`
  },
  {
    keywords: ['agribusiness exportacao seguro', 'cafe soja acucar seguro', 'proteina animal exportacao', 'commodities agricolas seguro'],
    category: 'setores',
    answer: `**Seguro de Crédito para Agribusiness Export**\n\n**Brasil é o maior exportador mundial** de soja, açúcar, café, carne bovina, frango e suco de laranja. O risco de crédito nas exportações agro é significativo e com características únicas.\n\n**Particularidades do risco agro export:**\n\n• **Concentração:** Poucos compradores grandes (traders globais, redes de supermercados)\n• **Sazonalidade:** Contratos concentrados em safra (jan-jul para soja; out-jan para café)\n• **Preço variável:** Risco de crédito ligado ao preço da commodity\n• **Risco país:** Principais mercados: China, EUA, UE, Oriente Médio\n• **Prazo curto:** 30-90 dias para commodities in natura; 90-180 dias para processados\n\n**Coberturas específicas por produto:**\n\n| Commodity | Principal Risco | Cobertura Recomendada |\n|---|---|---|\n| Soja/Milho | Concentração China | XL com limite China |\n| Açúcar | Mercado Oriente Médio | Whole Turnover Exportação |\n| Café | Importadores europeus | Key Buyer (top 5) |\n| Carne/Frango | Risco regulatório-sanitário | Risco Político + Crédito |\n| OJ/Suco | USA-based buyers | Single Risk |\n\n**SBCE no agro:**\nA SBCE tem linha específica para exportadores rurais com acesso ao FGE (Fundo de Garantia à Exportação) do governo brasileiro.\n\n**Dica:** Cooperativas agropecuárias têm estruturas especiais com volume de membros consolidado — prêmio melhor que individual.`
  },
  {
    keywords: ['setor automotivo seguro credito', 'oem autopeças seguro', 'dealer seguro credito', 'financiamento automotivo seguro'],
    category: 'setores',
    answer: `**Seguro de Crédito para o Setor Automotivo**\n\n**Cadeia automotiva** é uma das mais complexas da economia: OEMs → Tier 1 → Tier 2 → Tier 3 → Concessionários → Consumidor final.\n\n**Aplicações do seguro de crédito:**\n\n**1. OEM (Montadora) → Rede de Concessionários:**\n• Montadora vende veículos a prazo para concessionários\n• Risco de inadimplência da concessionária (floor plan)\n• Seguro de crédito protege o fluxo de receita da montadora\n• Volume: R$ 1-5 bilhões por montadora\n\n**2. Tier 1 → OEM (fornecedor de sistemas):**\n• Autopeças de alto valor (motor, câmbio, bancos)\n• Prazo 45-90 dias, risco concentrado na montadora\n• Geralmente risco baixo, mas volume enorme\n• Seguro XL protege contra insolvência súbita da OEM\n\n**3. Tier 2/3 → Tier 1 (fornecedores de componentes):**\n• PMEs com risco maior (Tier 1 pode cancelar contratos)\n• Whole Turnover ou Key Buyer cobrindo Tier 1\n• Risco de single customer concentration (1 cliente = 60%+ do faturamento)\n\n**4. Distribuidoras de Autopeças → Oficinas:**\n• Risco granular (muitos pequenos compradores)\n• Whole Turnover com PMI moderado\n• Gestão de limites via portal integrado ao ERP\n\n**Crise automotiva e seguro:**\nA semiconductor crisis (2021-2023) criou defaults em Tier 2/3 — empresas que tinham seguro recuperaram valores; as que não tinham tiveram perdas significativas.\n\n**A Fairfield** tem expertise na cadeia automotiva e atua com Allianz Trade e Coface nesse segmento.`
  },
  {
    keywords: ['seguro credito financeiras', 'fintech factoring seguro', 'securitizadora seguro', 'carteira credito seguro'],
    category: 'setores',
    answer: `**Seguro de Crédito para Serviços Financeiros — Fintechs, Factorings e Securitizadoras**\n\n**Serviços financeiros** são os maiores usuários de seguro de crédito no mundo — protegem carteiras de crédito, operações de desconto e estruturas de securitização.\n\n**Factoring:**\n• Fator compra recebíveis de empresas (NFs, duplicatas)\n• Assume o risco de crédito do sacado (devedor)\n• Seguro de crédito protege a carteira do fator\n• **Cobertura:** Whole Turnover com lista de sacados aprovados\n• **Desafio:** Carteira pulverizada (muitos sacados pequenos) — prêmio por carteira\n\n**Securitizadoras (CRA, CRI, FIDC):**\n• Emitem títulos lastreados em recebíveis\n• Seguro eleva rating dos títulos emitidos\n• Cobertura em favor dos investidores/debenturistas\n• Requisito cada vez mais comum em CRAs high yield\n\n**Fintechs de Crédito B2B:**\n• BNPL, antecipação de recebíveis, capital de giro\n• Seguro como credit enhancement para captar funding\n• API de decisão de crédito integrada à seguradora\n• Permite escalar sem capital próprio proporcional\n\n**Banco de Desenvolvimento (BNDES, BRB, Bancos Estaduais):**\n• Carteiras de PME com risco alto\n• Seguro de crédito como proteção de portfólio\n• Redução de provisão para devedores duvidosos (PDD)\n\n**Seguradoras com expertise em serviços financeiros:**\n• Allianz Trade (maior base de dados de sacados)\n• Coface (forte em carteiras de factoring)\n• AIG (estruturas complexas e FIDC)\n\n**A Fairfield** tem modelos específicos para cada tipo de instituição financeira.`
  },

  // ── Análise e Inteligência de Crédito ──
  {
    keywords: ['machine learning credito', 'ia scoring credito', 'modelos preditivos credito', 'inteligencia artificial credito'],
    category: 'analytics',
    answer: `**Machine Learning e IA em Análise de Crédito para Seguros**\n\n**Evolução dos modelos de scoring:**\n\n**Geração 1 — Score Estatístico (logit/probit):**\n• Dados históricos + regressão logística\n• Variáveis: idade empresa, setor, porte, histórico de pagamento\n• Precisão: ~70-75% em prever default\n\n**Geração 2 — Gradient Boosting (XGBoost, LightGBM):**\n• Mais variáveis (100+), dados alternativos\n• Precisão: ~80-85%\n• Usado pela maioria das seguradoras hoje\n\n**Geração 3 — Redes Neurais e Deep Learning:**\n• Padrões complexos em dados não estruturados\n• Análise de texto (notícias, SCR, processos judiciais)\n• Análise de imagem (satélite para agro, obra parada)\n• Precisão: ~88-93% em alguns segmentos\n\n**Dados utilizados pelas seguradoras:**\n\n| Fonte | Dados |\n|---|---|\n| Bureaus (Serasa, SPC) | Score, histórico, protestos |\n| Receita Federal | Faturamento (PGDAS), simples nacional |\n| Judiciário | Processos, execuções, recuperação judicial |\n| Redes sociais/web | Reputação, notícias, avaliações |\n| Dados alternativos | Consumo de energia, frota, contratações |\n\n**Impacto no seguro de crédito:**\n• Aprovação de limites em segundos (vs. dias)\n• Atualização dinâmica de limites (não anual)\n• Detecção precoce de deterioração\n• Precificação granular (taxa por empresa vs. taxa por setor)\n\n**O SENTINEL** da Fairfield usa modelos de ML para análise de portfólio e otimização de cobertura.`
  },
  {
    keywords: ['early warning sinais deterioracao', 'alertas credito antecipados', 'sinais alerta devedor', 'monitoramento credito'],
    category: 'analytics',
    answer: `**Early Warning Signs — Sinais Antecipados de Deterioração de Crédito**\n\n**Por que monitoramento proativo é crucial?**\nO seguro de crédito cobre a **insolvência**, mas a melhor estratégia é identificar a deterioração antes que o sinistro ocorra — permitindo reduzir exposição a tempo.\n\n**Sinais de alerta por categoria:**\n\n**Sinais Financeiros (dados públicos):**\n• Atraso em pagamentos de fornecedores (aparece nos bureaus)\n• Protestos de títulos (cartório)\n• Execuções fiscais (PGE, Receita Federal)\n• Dívidas com FGTS/INSS em aberto (CADIN)\n• Queda do score Serasa acima de 50 pontos em 90 dias\n\n**Sinais Operacionais:**\n• Rotatividade alta de diretores (CVM, Junta Comercial)\n• Cancelamento de registros e alvarás\n• Demissões em massa (eSocial, CAGED)\n• Paralização parcial de operações\n• Mudança frequente de endereço fiscal\n\n**Sinais de Mercado:**\n• Notícias negativas (Google Alerts, Cision)\n• Deterioração de contratos (licitações canceladas)\n• Saída de clientes âncora\n• Cancelamento de seguros (SUSEP Open Insurance)\n\n**Sinais Comportamentais:**\n• Solicitar prorrogação de prazo repetidamente\n• Pagar parcialmente (mais do que o habitual)\n• Reduzir pedidos sem explicação\n• Solicitar crédito em múltiplos fornecedores simultaneamente\n\n**Ação recomendada por nível de alerta:**\n• **Alerta amarelo:** Monitorar mais frequente, reduzir prazo\n• **Alerta laranja:** Solicitar garantias adicionais, reduzir limite\n• **Alerta vermelho:** Suspender vendas a prazo, comunicar seguradora`
  },
  {
    keywords: ['analise demonstracoes financeiras subscricao', 'balanco analise credito', 'dre analise seguradora', 'indices financeiros seguro'],
    category: 'analytics',
    answer: `**Análise de Demonstrações Financeiras para Subscrição**\n\n**O que as seguradoras analisam nos balanços?**\n\n**1. Liquidez:**\n• **Liquidez corrente** (AC/PC): > 1,2 (saudável)\n• **Liquidez seca** ((AC - Estoques)/PC): > 0,8\n• **Caixa e equivalentes:** 30-60 dias de receita é benchmark\n\n**2. Endividamento:**\n• **Dívida Líquida/EBITDA:** < 3,0x (confortável); > 4,5x (stress)\n• **Dívida Bruta/PL:** < 1,5x\n• **Cobertura de juros** (EBITDA/Despesas Financeiras): > 3,0x\n\n**3. Rentabilidade:**\n• **Margem EBITDA:** Varia por setor (varejo: 8%; indústria: 15%; SaaS: 30%)\n• **Margem líquida:** Sinaliza capacidade de geração de caixa\n• **ROE e ROIC:** Eficiência do capital\n\n**4. Ciclo Operacional:**\n• **PMR** (Prazo Médio de Recebimento): alto PMR = maior risco de crédito aos clientes\n• **PMP** (Prazo Médio de Pagamento): baixo PMP = pressão nos fornecedores\n• **PME** (Prazo Médio de Estoques): alto = capital imobilizado\n\n**5. Red Flags que a seguradora identifica:**\n• Parecer com ressalva/negativo do auditor\n• Variação inexplicável no patrimônio líquido\n• Crescimento de receita sem crescimento de caixa\n• Goodwill excessivo (risco de impairment)\n• Partes relacionadas com valores relevantes\n\n**Quando os dados são de baixa qualidade:**\n• Empresas sem auditoria: seguradora usa dados de bureaus + setoriais\n• Simples Nacional: usa PGDAS + guias de ISS/ICMS\n• Startups: métricas alternativas (GMV, ARR, unit economics)`
  },
  {
    keywords: ['country risk assessment', 'risco pais metodologia', 'coface dra', 'allianz agcs risco pais', 'avaliacao risco pais'],
    category: 'analytics',
    answer: `**Country Risk Assessment — Metodologia de Avaliação de Risco País**\n\n**O que é avaliação de risco país?**\nProcesso de análise sistemática dos fatores macroeconômicos, políticos e institucionais que afetam a capacidade de um país honrar obrigações internacionais.\n\n**Principais metodologias:**\n\n**Coface Country Risk Assessment:**\n• Escala: A1, A2, A3, A4, B, C, D, E (A1 = melhor)\n• Dimensões: Ambiente de negócios + risco de crédito do país\n• Atualização: Trimestral\n• Brasil (2024): B (risco moderado)\n\n**Allianz Trade Country Risk:**\n• Escala: AA, A, BB, B, C, D, E\n• Combina risco macroeconômico + ambiente de negócios\n• Alertas em tempo real (mudanças geopolíticas)\n\n**Atradius Country Risk:**\n• Escala de 1 (muito baixo) a 10 (muito alto)\n• Análise setorial por país (não só nacional)\n\n**OCDE Country Risk Classification:**\n• Escala 0-7 (0 = melhor)\n• Usada por ECAs para precificar prêmio mínimo de exportação\n• Brasil: Categoria 3\n\n**Fatores avaliados:**\n\n| Dimensão | Indicadores |\n|---|---|\n| Macro | PIB, inflação, câmbio, dívida pública |\n| Externo | Reservas, balança comercial, dívida externa |\n| Político | Estabilidade, qualidade institucional, corrupção |\n| Negócios | Ease of doing business, proteção a contratos |\n| Bancário | Solidez do sistema financeiro, NPL |\n\n**Impacto no prêmio:**\n• País A1 (Alemanha): taxa 0,05-0,15%\n• País B (Brasil): taxa 0,20-0,60%\n• País D (Angola): taxa 1,5-4,0%\n• País E (Venezuela): cobertura negada`
  },
  {
    keywords: ['portfolio analytics credito', 'concentracao risco credito', 'gestao portfolio seguro', 'analise carteira seguro'],
    category: 'analytics',
    answer: `**Portfolio Analytics e Gestão de Concentração de Risco**\n\n**Por que analisar o portfólio, não apenas cada devedor?**\nOs riscos individuais se combinam de formas não lineares — uma carteira "boa" pode ter risco sistêmico alto por concentração.\n\n**Métricas de concentração:**\n\n**1. Índice de Herfindahl-Hirschman (HHI):**\n• Soma dos quadrados das participações de cada devedor\n• HHI < 0,1: Carteira diversificada (bom)\n• HHI 0,1-0,25: Concentração moderada\n• HHI > 0,25: Alta concentração (risco sistêmico)\n\n**2. Regra 10/80:**\n• Se top 10 devedores representam > 80% da exposição: carteira concentrada\n• Seguradora pode exigir sublimite por devedor\n\n**3. Concentração Setorial:**\n• Exposição em um setor > 30%: risco de crise setorial (pandemia, seca, regulação)\n• Recomendado: < 20% por setor\n\n**4. Concentração Geográfica:**\n• Devedores na mesma região: risco de eventos climáticos ou políticos regionais\n\n**Ferramentas de análise que a Fairfield usa:**\n\n• **Mapa de calor de exposição:** Visualização por devedor, setor, região\n• **Stress testing:** Simulação de default simultâneo (setor, região)\n• **Correlation matrix:** Devedores no mesmo grupo econômico ou com mesma supply chain\n• **PML dinâmico:** Atualizado com dados em tempo real dos bureaus\n\n**O SENTINEL** oferece dashboard de portfolio analytics integrado — relatório de concentração automático para renovação.\n\n**Dica:** Carteiras mais diversificadas têm prêmio menor — a Fairfield ajuda a estruturar a cobertura para maximizar esse benefício.`
  },

  // ── Fallback / Catch-all ──
  {
    keywords: ['ajuda', 'help', 'menu', 'opcoes', 'o que voce sabe', 'o que faz'],
    category: 'ajuda',
    answer: `Posso te ajudar com uma ampla gama de assuntos sobre **Seguro de Crédito** — sou o oráculo mais completo do mercado brasileiro nessa especialidade.\n\n**Conceitos e Estrutura:**\n• O que é Seguro de Crédito e como funciona\n• Whole Turnover, Key Buyer, Single Risk, XL\n• PMI, POS, AAD, Limites de Crédito, NCC\n\n**Coberturas Avançadas:**\n• Clausulados: MPL, PML, Aggregate Limit, Run-off Period\n• Contract Frustration, Pre-Credit Period\n• Top-Up, Excess Layer, Endorsements\n\n**FIDCs e Operações Estruturadas:**\n• Estrutura de FIDC com seguro de crédito\n• Credit Enhancement e melhoria de rating\n• Supply Chain Finance, Securitização\n\n**Grandes Riscos:**\n• Syndicated Cover (acima de USD 50M)\n• Resseguro Facultativo\n• Project Finance, Infraestrutura\n• Commodities Traders, XL Multi-Buyer\n\n**Setores Especializados:**\n• Energia Renovável, Agribusiness, Automotivo\n• Fintechs, Factorings, Securitizadoras\n• Trade Finance, Forfaiting\n\n**Legislação:**\n• CNSP 432/2021, Open Insurance, Sandbox SUSEP\n• Marco Legal das Garantias (Lei 14.711/2023)\n• Basileia III e capital regulatório\n\n**Análise e Inteligência:**\n• Machine Learning e scoring avançado\n• Early Warning Signs\n• Country Risk Assessment, Portfolio Analytics\n\n**Seguradoras:**\n• Allianz Trade, Coface, Atradius\n• CESCE, AIG, AVLA, Chubb, SBCE\n\nSobre qual tema posso te orientar?`
  }
]

/* ─── Chat Engine v3 — Semantic Matching ─── */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim()
}

// Portuguese stopwords — common words that add no semantic value
const STOPWORDS = new Set([
  'que', 'para', 'com', 'como', 'uma', 'por', 'mais', 'dos', 'das',
  'esse', 'essa', 'isso', 'este', 'esta', 'isto', 'dele', 'dela',
  'seu', 'sua', 'meu', 'minha', 'nos', 'nas', 'aos', 'num', 'numa',
  'qual', 'quais', 'onde', 'quando', 'quem', 'ter', 'ser', 'fazer',
  'pode', 'devo', 'deve', 'posso', 'consigo', 'preciso', 'quero',
  'sobre', 'entre', 'apos', 'ate', 'desde', 'cada', 'todo', 'toda',
  'muito', 'pouco', 'bem', 'mal', 'ainda', 'aqui', 'ali', 'tambem',
  'sim', 'nao', 'nem', 'mas', 'pois', 'porque', 'entao', 'assim',
  'seria', 'poderia', 'teria', 'vai', 'vou', 'tem', 'sao', 'foi',
  'meio', 'tipo', 'forma', 'caso', 'modo', 'vez', 'lado',
  // Domain stopwords — these appear in virtually every entry and add no discriminating value
  'seguro', 'credito', 'empresa', 'apolice',
])

// Portuguese stemmer — strips common suffixes to find root
function stem(word) {
  if (word.length < 4) return word
  return word
    .replace(/(mente|veis|vel|avel|ivel)$/, '')
    .replace(/(amento|imento|encia|ancia|acao|icao|ucao|ivel|avel)$/, '')
    .replace(/(ando|endo|indo|aram|eram|iram|avam|iam)$/, '')
    .replace(/(ador|edor|idor|ante|ente|inte)$/, '')
    .replace(/(ncia|mento|dade|cao|sao|tude)$/, '')
    .replace(/(oso|osa|ivo|iva|ais|eis|ois)$/, '')
    .replace(/(ar|er|ir|ou|ei|am|em)$/, '')
    .replace(/(es|as|os|is|us)$/, '')
    .replace(/([aeiou])$/, '')
    .replace(/(s)$/, '') || word
}

// Synonym clusters — words that mean the same thing in credit insurance context
const SYNONYM_MAP = (() => {
  const clusters = [
    ['calote', 'inadimplencia', 'nao pagar', 'devedor nao paga', 'caloteiro', 'default', 'falta pagamento', 'nao pagamento', 'nao pagou'],
    ['comprador', 'devedor', 'cliente', 'sacado', 'buyer'],
    ['vendedor', 'credor', 'segurado', 'fornecedor', 'cedente', 'seller'],
    ['apolice', 'seguro', 'cobertura', 'protecao', 'policia'],
    ['premio', 'custo', 'preco', 'quanto custa', 'taxa'],
    ['cancelar', 'cancelamento', 'rescindir', 'rescisao', 'desistir', 'encerrar', 'sair'],
    ['renovar', 'renovacao', 'prorrogar', 'prorrogacao', 'vencimento'],
    ['sinistro', 'acionar', 'indenizacao', 'receber', 'perdas'],
    ['exportar', 'exportacao', 'internacional', 'exterior', 'fora do brasil', 'outro pais', 'outros paises'],
    ['importar', 'importacao'],
    ['empresa', 'companhia', 'firma', 'negocio', 'cnpj'],
    ['pequena', 'pme', 'micro', 'pequeno porte', 'mei', 'startup'],
    ['grande', 'grande porte', 'corporacao', 'multinacional'],
    ['contratar', 'adquirir', 'comprar', 'fechar', 'fazer'],
    ['documento', 'documentacao', 'papeis', 'papel', 'formulario'],
    ['prazo', 'tempo', 'demora', 'dias', 'quanto tempo'],
    ['vantagem', 'beneficio', 'por que', 'porque', 'vale a pena', 'motivo'],
    ['legislacao', 'lei', 'regulamentacao', 'norma', 'regulacao', 'regra'],
    ['susep', 'orgao regulador', 'regulador'],
    ['falencia', 'recuperacao judicial', 'insolvencia', 'quebrar', 'quebrou', 'rj'],
    ['faturamento', 'vendas', 'receita', 'recebiveis', 'duplicata', 'nota fiscal'],
    ['proteger', 'segurar', 'assegurar', 'cobrir', 'defender'],
    ['risco', 'perigo', 'ameaca', 'exposicao', 'vulnerabilidade'],
    ['limite', 'limite de credito', 'credit limit', 'teto'],
    ['fidc', 'fundo', 'securitizacao', 'cessao recebiveis'],
    ['unico', 'single', 'um so', 'especifico', 'pontual', 'individual'],
    ['diferenca', 'comparar', 'comparacao', 'versus', 'qual melhor', 'qual diferenca', 'mesma coisa', 'igual', 'mesmo que'],
    ['mora', 'atraso', 'atrasou', 'atrasado', 'vencido', 'venceu'],
    ['cobranca', 'cobrar', 'recuperar', 'recuperacao'],
    ['vigencia', 'duracao', 'periodo', 'validade'],
  ]
  const map = {}
  for (const cluster of clusters) {
    for (const word of cluster) {
      map[normalizeText(word)] = cluster.map(w => normalizeText(w))
    }
  }
  return map
})()

// Expand user input with synonyms
function expandWithSynonyms(words) {
  const expanded = new Set(words)
  for (const word of words) {
    // Check direct synonym
    if (SYNONYM_MAP[word]) {
      SYNONYM_MAP[word].forEach(syn => expanded.add(syn))
    }
    // Check multi-word synonyms that start with this word
    for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
      if (key.startsWith(word) || word.startsWith(key)) {
        syns.forEach(syn => expanded.add(syn))
      }
    }
  }
  return expanded
}

// IDF — words that appear in many entries are worth less (generic), rare words are worth more (specific)
const IDF_WEIGHTS = (() => {
  const docFreq = {}
  const totalDocs = KNOWLEDGE_BASE.length
  for (const entry of KNOWLEDGE_BASE) {
    const seen = new Set()
    for (const kw of entry.keywords) {
      for (const w of normalizeText(kw).split(/\s+/).filter(w => w.length > 2)) {
        const s = stem(w)
        if (!seen.has(s)) {
          seen.add(s)
          docFreq[s] = (docFreq[s] || 0) + 1
        }
      }
    }
    // Also index answer content stems
    const answerStems = new Set()
    for (const w of normalizeText(entry.answer).split(/\s+/).filter(w => w.length > 3)) {
      answerStems.add(stem(w))
    }
    for (const s of answerStems) {
      if (!seen.has(s)) {
        seen.add(s)
        docFreq[s] = (docFreq[s] || 0) + 0.3
      }
    }
  }
  const weights = {}
  for (const [s, freq] of Object.entries(docFreq)) {
    // IDF formula: log(totalDocs / freq), clamped
    weights[s] = Math.max(0.2, Math.min(3.0, Math.log(totalDocs / freq)))
  }
  return weights
})()

function getIDF(word) {
  const s = stem(word)
  return IDF_WEIGHTS[s] || 1.5 // unknown words get moderate weight
}

// Check if two words are semantically similar
function wordsMatch(w1, w2) {
  if (w1 === w2) return 1.0
  // Stem match
  if (w1.length >= 4 && w2.length >= 4) {
    const s1 = stem(w1), s2 = stem(w2)
    if (s1 === s2) return 0.9
    if (s1.length >= 4 && s2.length >= 4 && (s1.startsWith(s2) || s2.startsWith(s1))) return 0.8
  }
  // Direct prefix (at least 4 chars shared)
  if (w1.length >= 4 && w2.length >= 4 && (w1.startsWith(w2.slice(0, 4)) || w2.startsWith(w1.slice(0, 4)))) return 0.6
  return 0
}

function findAnswer(input, conversationHistory = []) {
  const normalized = normalizeText(input)
  const rawWords = normalized.split(/\s+/).filter(w => w.length > 2)
  const meaningfulWords = rawWords.filter(w => !STOPWORDS.has(w))
  // If ALL words are stopwords, the user is asking about the generic concept itself
  // (e.g. "o que é seguro de crédito?") — use rawWords for matching instead
  const isGenericQuery = meaningfulWords.length === 0 && rawWords.length >= 2
  const wordsForMatching = isGenericQuery ? rawWords : meaningfulWords
  const expandedWords = expandWithSynonyms(wordsForMatching)

  let bestScore = 0
  let bestEntry = null

  // Context from conversation
  const recentCategories = conversationHistory
    .filter(m => m.category)
    .slice(-5)
    .map(m => m.category)

  for (const entry of KNOWLEDGE_BASE) {
    let keywordScore = 0
    let contentScore = 0

    // ── Phase 1: Keyword matching (primary signal) ──
    for (const keyword of entry.keywords) {
      const kwNorm = normalizeText(keyword)
      const kwWords = kwNorm.split(/\s+/).filter(w => w.length > 2)

      // Exact phrase match with word boundaries
      const escaped = kwNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (new RegExp('(?:^|\\s)' + escaped + '(?:\\s|$)').test(normalized)) {
        // Weight by how many NON-stopword words are in the phrase (specific > generic)
        const specificWords = kwWords.filter(w => !STOPWORDS.has(w))
        const specificCount = specificWords.length
        if (specificCount > 0) {
          keywordScore += specificCount * 6 + (kwWords.length - specificCount) * 0.5
        } else if (isGenericQuery) {
          // User is asking about the generic concept itself — boost domain-stopword phrases
          keywordScore += kwWords.length * 5
        } else {
          // Phrase is entirely generic words but question has specific terms — minimal score
          keywordScore += 1
        }
        continue
      }

      // Word-level matching with stemming and synonyms
      // Skip for generic queries — domain stopwords cause too much noise via stem/synonym expansion
      if (isGenericQuery) continue
      if (kwWords.length === 0) continue

      let matchCount = 0
      let matchQuality = 0
      for (const kw of kwWords) {
        if (STOPWORDS.has(kw)) continue
        let bestWordMatch = 0
        // Check against meaningful words (or rawWords if generic query)
        for (const w of wordsForMatching) {
          bestWordMatch = Math.max(bestWordMatch, wordsMatch(w, kw))
        }
        // Check against expanded synonyms
        if (bestWordMatch < 0.8) {
          for (const syn of expandedWords) {
            bestWordMatch = Math.max(bestWordMatch, wordsMatch(syn, kw))
          }
        }
        if (bestWordMatch >= 0.6) {
          matchCount++
          matchQuality += bestWordMatch * getIDF(kw)
        }
      }

      if (kwWords.length === 1 && matchCount === 1) {
        keywordScore += matchQuality * 3
      } else if (kwWords.length > 1) {
        const ratio = matchCount / kwWords.length
        if (ratio >= 1.0) {
          keywordScore += matchQuality * 3.5
        } else if (ratio >= 0.5) {
          keywordScore += matchQuality * 1.5
        } else if (matchCount > 0) {
          keywordScore += matchQuality * 0.5
        }
      }
    }

    // ── Phase 2: Answer content scanning (secondary signal) ──
    // Search the answer text for relevance — helps catch queries where keywords are sparse
    const answerNorm = normalizeText(entry.answer)
    const answerWords = new Set(answerNorm.split(/\s+/).filter(w => w.length >= 4 && !STOPWORDS.has(w)))
    let contentMatches = 0
    for (const w of wordsForMatching) {
      if (w.length >= 4) {
        const st = stem(w)
        for (const aw of answerWords) {
          if (aw === w || stem(aw) === st) {
            contentMatches++
            break
          }
        }
      }
    }
    // Content score is secondary — only boosts, never dominates
    if (wordsForMatching.length > 0) {
      contentScore = (contentMatches / wordsForMatching.length) * 1.5
    }

    // ── Phase 3: Combined scoring ──
    let totalScore = keywordScore + contentScore

    // Context bonus
    if (totalScore > 0 && recentCategories.includes(entry.category)) {
      totalScore += 1
    }

    if (totalScore > bestScore) {
      bestScore = totalScore
      bestEntry = entry
    }
  }

  if (bestScore >= 2.5 && bestEntry) {
    return { answer: bestEntry.answer, category: bestEntry.category }
  }

  return {
    answer: `Essa é uma ótima pergunta! Embora eu não tenha uma resposta exata para essa formulação específica, posso te orientar.\n\n**Temas que domino profundamente:**\n• **Coberturas:** Whole Turnover, Key Buyer, Single Risk, Excess of Loss, Top-Up\n• **Seguradoras:** Allianz Trade, Coface, Atradius, CESCE, AIG, AVLA, Chubb\n• **Técnico:** PMI, POS, AAD, Limites de Crédito, NCC, Run-off\n• **FIDCs:** Estruturação, Credit Enhancement, Regulação CVM\n• **Legislação:** SUSEP, Código Civil, Lei de Falências, CNSP\n• **Processo:** Contratação, sinistro, renovação, cancelamento\n• **Preços:** Taxas por setor, prêmio mínimo, fatores de precificação\n\nTente perguntar de outra forma ou escolha um dos temas acima!\n\nOu clique em **Suporte** para falar com um especialista da Fairfield.`,
    category: 'fallback'
  }
}

/* ─── Markdown Renderer ─── */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let inTable = false
  let tableRows = []
  let tableKey = 0

  function processInline(str) {
    // Bold
    const parts = []
    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.slice(lastIndex, match.index))
      }
      parts.push(<strong key={`b-${match.index}`} className="font-semibold text-white">{match[1]}</strong>)
      lastIndex = boldRegex.lastIndex
    }
    if (lastIndex < str.length) {
      parts.push(str.slice(lastIndex))
    }
    return parts.length > 0 ? parts : [str]
  }

  function flushTable() {
    if (tableRows.length === 0) return
    const headerCells = tableRows[0].split('|').filter(c => c.trim())
    const bodyRows = tableRows.slice(2) // skip separator row
    elements.push(
      <div key={`table-${tableKey++}`} className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {headerCells.map((cell, i) => (
                <th key={i} className="border border-white/10 px-2 py-1 text-left text-white/80 bg-white/[0.04]">
                  {processInline(cell.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => {
              const cells = row.split('|').filter(c => c.trim())
              return (
                <tr key={ri}>
                  {cells.map((cell, ci) => (
                    <td key={ci} className="border border-white/10 px-2 py-1 text-white/60">
                      {processInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
    tableRows = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      tableRows.push(line)
      // Check if next line is separator or another table row
      if (i === lines.length - 1 || (!lines[i + 1].includes('|') || !lines[i + 1].trim().startsWith('|'))) {
        flushTable()
      }
      continue
    } else if (tableRows.length > 0) {
      flushTable()
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />)
      continue
    }

    // Bullet point
    if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
      const content = line.trim().replace(/^[•\-]\s*/, '')
      elements.push(
        <div key={`li-${i}`} className="flex gap-2 ml-2 my-0.5">
          <span className="text-sentinel mt-0.5">•</span>
          <span>{processInline(content)}</span>
        </div>
      )
      continue
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      elements.push(
        <div key={`ol-${i}`} className="flex gap-2 ml-2 my-0.5">
          <span className="text-sentinel/70 font-mono text-xs mt-0.5">{numMatch[1]}.</span>
          <span>{processInline(numMatch[2])}</span>
        </div>
      )
      continue
    }

    // Header-like lines (lines ending with :)
    if (line.trim().match(/^\*\*.*\*\*$/)) {
      elements.push(
        <div key={`h-${i}`} className="mt-2 mb-1">
          {processInline(line.trim())}
        </div>
      )
      continue
    }

    // Regular line
    elements.push(
      <div key={`p-${i}`} className="my-0.5">
        {processInline(line)}
      </div>
    )
  }

  // Flush remaining table
  if (tableRows.length > 0) {
    flushTable()
  }

  return elements
}

/* ─── Welcome Message ─── */
const WELCOME_MESSAGE = `Olá! Eu sou o **iCover** — o **Oráculo de Inteligência em Seguro de Crédito** mais completo do mercado brasileiro. 🛡️

Fui desenvolvido pela **Fairfield** com o conhecimento mais profundo e abrangente sobre seguros financeiros do Brasil.

**Minha expertise abrange:**
• Clausulados completos de todas as seguradoras
• Estruturação para **FIDCs** e operações estruturadas
• Estratégias inovadoras e soluções sob medida
• Legislação e regulamentação (SUSEP, CVM, CNSP)
• Análise de grandes riscos e operações complexas
• Todas as seguradoras do mercado comparadas em detalhes

Pergunte-me qualquer coisa sobre **Seguro de Crédito** — eu tenho a resposta. 🎯`

const SUGGESTED_QUESTIONS = [
  'Como posso garantir minhas vendas com o Seguro de Crédito?',
  'Quanto custa um Seguro de Crédito?',
  'Como funciona seguro de crédito para FIDCs?',
  'Quais as cláusulas mais importantes da apólice?',
  'Como funciona para grandes riscos acima de R$ 50M?',
  'Quais seguradoras operam no Brasil?'
]

/* ─── Test Harness (remove in production) ─── */
if (typeof window !== 'undefined') {
  window.__iCoverTest = function(question) {
    const result = findAnswer(question, [])
    return { question, answer: result.answer, category: result.category }
  }
  window.__iCoverBatchTest = function(questions) {
    return questions.map(q => {
      const r = findAnswer(q, [])
      const titleMatch = r.answer.match(/\*\*(.+?)\*\*/)
      return { q, title: titleMatch ? titleMatch[1] : r.answer.substring(0, 80), cat: r.category }
    })
  }
}

/* ─── Main Component ─── */
export default function ICoverChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: WELCOME_MESSAGE, category: 'saudacao' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showSupport, setShowSupport] = useState(false)
  const [supportMessages, setSupportMessages] = useState([
    { id: 1, sender: 'bot', text: 'Olá! Sou da equipe de especialistas da Fairfield. Como posso te ajudar?' }
  ])
  const [supportInput, setSupportInput] = useState('')
  const [conversation, setConversation] = useState(null)
  const conversationRef = useRef(null)
  const [conversationError, setConversationError] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const supportInputRef = useRef(null)
  const supportEndRef = useRef(null)

  const startConversation = useCallback(async () => {
    if (conversationRef.current) return conversationRef.current
    const response = await apiFetch('/api/v1/icover/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'public' }),
    })
    if (!response.sucesso || !response.data?.id || !response.data?.publicToken) {
      throw new Error(response.mensagem || 'Não foi possível iniciar o iCover')
    }
    conversationRef.current = response.data
    setConversation(response.data)
    setConversationError(null)
    return response.data
  }, [])

  useEffect(() => {
    startConversation().catch(error => setConversationError(error.message))
  }, [startConversation])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-scroll support
  useEffect(() => {
    supportEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [supportMessages])

  const handleSend = useCallback(async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || isTyping) return

    const userMsg = { id: Date.now(), sender: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setShowSuggestions(false)
    setIsTyping(true)

    try {
      const activeConversation = conversationRef.current || await startConversation()
      const response = await apiFetch(`/api/v1/icover/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-iCover-Token': activeConversation.publicToken,
        },
        body: JSON.stringify({ message: trimmed }),
      })
      if (!response.sucesso || !response.data?.message?.content) {
        throw new Error(response.mensagem || 'O iCover não conseguiu responder agora.')
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.message.content,
        category: 'ia',
        sources: response.data.sources || [],
      }])
      setConversationError(null)
    } catch (error) {
      setConversationError(error.message)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Não consegui responder agora. Tente novamente em instantes ou fale com um especialista Fairfield.',
        category: 'erro',
      }])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, startConversation])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (question) => {
    handleSend(question)
  }

  const handleSupportSend = () => {
    const trimmed = supportInput.trim()
    if (!trimmed) return

    const userMsg = { id: Date.now(), sender: 'user', text: trimmed }
    setSupportMessages(prev => [...prev, userMsg])
    setSupportInput('')

    // Auto-reply after 1.2s
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Obrigado pela mensagem! Um de nossos especialistas vai te responder em instantes.'
      }
      setSupportMessages(prev => [...prev, botReply])
    }, 1200)
  }

  const handleSupportKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSupportSend()
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <style>{animationStyles}</style>

      {/* ── Header ── */}
      <header className="bg-navy-surface border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {/* Back Arrow */}
          <Link to="/" className="text-white/40 hover:text-white/70 transition-colors">
            <BackArrowIcon />
          </Link>

          {/* SENTINEL label */}
          <div className="flex items-center gap-1.5">
            <MiniShield size={22} />
            <span className="text-[10px] font-mono text-sentinel/60 tracking-widest uppercase">SENTINEL</span>
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* iCover Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sentinel/20 to-sentinel/5 border border-sentinel/30 flex items-center justify-center">
            <PersonIcon />
          </div>

          {/* Title + subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">iCover</h1>
              {/* Online badge */}
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${conversationError ? 'bg-rose-500/10 border-rose-500/20' : conversation ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${conversationError ? 'bg-rose-400' : conversation ? 'bg-emerald-400 pulse-green' : 'bg-amber-400 animate-pulse'}`} />
                <span className={`text-[9px] font-medium ${conversationError ? 'text-rose-400' : conversation ? 'text-emerald-400' : 'text-amber-400'}`}>{conversationError ? 'Indisponível' : conversation ? 'Online' : 'Conectando'}</span>
              </span>
            </div>
            <p className="text-[11px] text-white/40 truncate">IA Especialista em Seguro de Crédito</p>
          </div>

          {/* Fazer Cotação button */}
          <Link
            to="/cotacao/interno"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sentinel/10 border border-sentinel/20 text-sentinel text-xs font-medium hover:bg-sentinel/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Fazer Cotação
          </Link>
        </div>
      </header>

      {/* ── Chat Area ── */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 msg-enter ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && <BotAvatar />}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'bot'
                    ? 'bg-white/[0.03] border border-white/[0.06] text-white/70 rounded-tl-md'
                    : 'bg-sentinel/15 border border-sentinel/20 text-white rounded-tr-md'
                }`}
              >
                {msg.sender === 'bot' ? renderMarkdown(msg.text) : msg.text}
              </div>
            </div>
          ))}

          {/* Suggested Questions */}
          {showSuggestions && messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 fade-in">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(q)}
                  className="text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/50 text-sm hover:bg-white/[0.05] hover:text-white/70 hover:border-white/[0.12] transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5 justify-start msg-enter">
              <BotAvatar />
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                <span className="typing-dot w-2 h-2 rounded-full bg-sentinel/60 inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-sentinel/60 inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-sentinel/60 inline-block" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── Input Area ── */}
      <footer className="border-t border-white/[0.06] bg-navy-surface px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {/* Input row */}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte qualquer coisa sobre Seguro de Crédito..."
              rows={1}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-sentinel/30 focus:ring-1 focus:ring-sentinel/10 transition-colors"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = '42px'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-sentinel/20 border border-sentinel/30 text-sentinel flex items-center justify-center hover:bg-sentinel/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              <SendIcon />
            </button>
          </div>

          {/* Specialist button */}
          <button
            onClick={() => setShowSupport(true)}
            className="mt-3 w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group headphone-pulse"
          >
            <div className="h-6 w-6 rounded-lg bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
              <HeadphonesIcon size={14} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold text-white/70 group-hover:text-white/90 transition-colors">Suporte</span>
              <span className="text-[10px] text-emerald-400/70 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-green" />
                Chat ao vivo
              </span>
            </div>
          </button>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/20 mt-3 font-mono">
            Powered by SENTINEL | Fairfield
          </p>
        </div>
      </footer>

      {/* ── Human Support Panel (Modal) ── */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 fade-in">
          <div className="w-full sm:w-[420px] max-h-[80vh] bg-navy-surface border border-white/[0.08] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Support Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <HeadphonesIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Suporte Fairfield</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-green" />
                    <span className="text-[10px] text-emerald-400/70">Especialistas online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSupport(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Support Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px] max-h-[50vh]">
              {supportMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex msg-enter ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.sender === 'bot'
                        ? 'bg-emerald-500/10 border border-emerald-500/15 text-white/70 rounded-tl-md'
                        : 'bg-white/[0.06] border border-white/[0.08] text-white rounded-tr-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={supportEndRef} />
            </div>

            {/* Support Input */}
            <div className="border-t border-white/[0.06] px-4 py-3 flex gap-2">
              <input
                ref={supportInputRef}
                type="text"
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                onKeyDown={handleSupportKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/30 transition-colors"
              />
              <button
                onClick={handleSupportSend}
                disabled={!supportInput.trim()}
                className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
