import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { MiniShield } from './Home'

const NDA_SECTIONS = [
  {
    title: 'TERMO DE CONFIDENCIALIDADE E ACEITE EXPRESSO',
    content: `A FAIRFIELD PROTECAO E INTELIGENCIA FINANCEIRA LTDA, inscrita no CNPJ sob o n. 13.381.310/0001-45, com sede na cidade de Blumenau/SC, devidamente registrada na SUSEP sob o n. 20.2036457.1, doravante denominada "Fairfield", apresenta ao solicitante, doravante denominado "Cliente", o presente Termo de Confidencialidade como condicao para o inicio do processo de estudo de mercado e cotacao de Seguro de Credito por meio da plataforma SENTINEL.

Ao rolar este documento ate o final e clicar em "De Acordo", o Cliente declara expressamente que leu, compreendeu e concorda com todos os termos e condicoes aqui estabelecidos, conferindo plena validade a este aceite eletronico nos termos do Art. 10 da MP n. 2.200-2/2001 e do Marco Civil da Internet (Lei n. 12.965/2014).`
  },
  {
    title: '1. Finalidade e Escopo',
    content: `1.1 O presente Termo tem por finalidade estabelecer as obrigacoes da Fairfield quanto ao sigilo, protecao e uso restrito das informacoes fornecidas pelo Cliente no contexto do estudo de mercado para contratacao de Apolice de Seguro de Credito.

1.2 As informacoes coletadas destinam-se exclusivamente a:
(i) Realizacao do estudo de mercado de Seguro de Credito solicitado pelo Cliente;
(ii) Subsidiar a analise tecnica de risco junto as seguradoras parceiras para fins de cotacao;
(iii) Elaborar a comparacao de propostas e a recomendacao tecnica da Fairfield;
(iv) Cumprir eventuais exigencias regulatorias e de subscricao impostas pelas seguradoras.

1.3 Nenhuma informacao fornecida sera utilizada para qualquer finalidade distinta das previstas neste Termo sem o consentimento expresso e previo do Cliente.`
  },
  {
    title: '2. Informacoes Confidenciais',
    content: `2.1 Sao consideradas "Informacoes Confidenciais" todos os dados e documentos fornecidos pelo Cliente a Fairfield por meio da plataforma SENTINEL ou por qualquer outro meio, incluindo, sem limitacao:
(i) Dados financeiros: faturamento, receita, resultado, estrutura de custos, inadimplencia, perdas e vencidos;
(ii) Dados comerciais: carteira de clientes, lista de compradores, condicoes de venda, prazos e volumes;
(iii) Dados operacionais: processos internos, fornecedores, contratos, estrutura de distribuicao;
(iv) Dados societarios: composicao acionaria, historico e estrutura organizacional;
(v) Dados pessoais: nome, CPF, cargo, e-mail, telefone e quaisquer outros dados de identificacao dos representantes.

2.2 Todas as informacoes transmitidas pelo Cliente, independentemente do formato — escrito, verbal, eletronico ou qualquer outro meio — sao tratadas como confidenciais pela Fairfield.`
  },
  {
    title: '3. Compromissos da Fairfield',
    content: `3.1 A Fairfield compromete-se a:
(i) Manter em estrito e absoluto sigilo todas as Informacoes Confidenciais recebidas do Cliente;
(ii) Utilizar as informacoes exclusivamente para a finalidade descrita na Clausula 1 deste Termo;
(iii) Nao divulgar, ceder, vender, alugar ou compartilhar as informacoes com terceiros, salvo nas hipoteses expressamente previstas neste Termo;
(iv) Adotar medidas tecnicas e organizacionais adequadas para proteger as informacoes contra acesso nao autorizado, perda, destruicao ou vazamento;
(v) Notificar o Cliente em caso de incidente de seguranca que possa comprometer a confidencialidade de suas informacoes.

3.2 O acesso as Informacoes Confidenciais sera restrito aos profissionais da Fairfield diretamente envolvidos no processo de cotacao e analise tecnica, os quais estao sujeitos a obrigacoes de sigilo equivalentes as deste Termo.

3.3 As seguradoras parceiras receberao apenas as informacoes estritamente necessarias para a elaboracao de propostas de Seguro de Credito, sendo expressamente vedado o compartilhamento de dados para qualquer outro fim.`
  },
  {
    title: '4. Protecao de Dados Pessoais — LGPD',
    content: `4.1 O tratamento dos dados pessoais do Cliente e de seus representantes e realizado em conformidade com a Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018 — LGPD).

4.2 A base legal para o tratamento e a execucao do contrato de prestacao de servicos de consultoria em seguros, conforme Art. 7o, inciso V da LGPD, e o legitimo interesse da Fairfield na realizacao do estudo de mercado solicitado.

4.3 O Cliente, na qualidade de titular dos dados pessoais, tem assegurados os seguintes direitos:
(i) Confirmacao e acesso aos dados tratados;
(ii) Correcao de dados incompletos, inexatos ou desatualizados;
(iii) Anonimizacao, bloqueio ou eliminacao de dados desnecessarios ou excessivos;
(iv) Portabilidade dos dados a outro prestador de servicos;
(v) Eliminacao dos dados pessoais tratados com consentimento;
(vi) Revogacao do consentimento a qualquer momento.

4.4 Para exercer seus direitos ou obter informacoes adicionais sobre o tratamento de seus dados, o Cliente pode entrar em contato pelo e-mail: privacidade@fairfield.com.br.`
  },
  {
    title: '5. Compartilhamento com Seguradoras',
    content: `5.1 Para a realizacao do estudo de mercado, a Fairfield encaminhara as Informacoes Confidenciais pertinentes as seguintes seguradoras parceiras, exclusivamente para fins de subscricao e elaboracao de proposta de Seguro de Credito: Coface, Atradius, AVLA, Allianz Trade, AIG, CESCE e Chubb.

5.2 Cada seguradora recebera apenas as informacoes necessarias para a analise de risco e formulacao de proposta, estando sujeitas as suas proprias politicas de privacidade e sigilo profissional regulamentadas pela SUSEP.

5.3 O Cliente, ao aceitar este Termo, autoriza expressamente a Fairfield a compartilhar suas informacoes com as seguradoras listadas, exclusivamente para a finalidade descrita nesta clausula.

5.4 E vedado as seguradoras utilizar as informacoes recebidas para qualquer finalidade que nao seja a cotacao solicitada pela Fairfield.`
  },
  {
    title: '6. Prazo de Vigencia e Retencao',
    content: `6.1 As obrigacoes de confidencialidade estabelecidas neste Termo entram em vigor na data do aceite expresso pelo Cliente e permanecerao validas por 2 (dois) anos apos o encerramento do processo de cotacao, ou ate que um contrato formal seja celebrado entre as Partes, prevalecendo o que ocorrer por ultimo.

6.2 O estudo de mercado elaborado pela Fairfield com base nas informacoes fornecidas tera validade de 90 (noventa) dias a contar da data de entrega.

6.3 Apos o encerramento do relacionamento comercial, a Fairfield reterá as informacoes pelo prazo minimo exigido pela legislacao aplicavel e, findo esse prazo, procederá a eliminacao segura dos dados, salvo disposicao legal em contrario.`
  },
  {
    title: '7. Independencia e Imparcialidade',
    content: `7.1 A Fairfield atua exclusivamente como consultora independente de seguros, sem vinculo de exclusividade com qualquer seguradora.

7.2 A remuneracao da Fairfield e integralmente suportada pela seguradora escolhida pelo Cliente ao final do processo, nao gerando qualquer custo ao Cliente pela realizacao do estudo de mercado.

7.3 A recomendacao tecnica da Fairfield sera fundamentada exclusivamente na analise comparativa das propostas recebidas, priorizando o melhor custo-beneficio para o Cliente, sem influencia de qualquer incentivo comercial por parte das seguradoras.

7.4 A aceitacao deste Termo nao implica obrigacao de contratacao de qualquer produto de seguro pelo Cliente.`
  },
  {
    title: '8. Disposicoes Gerais',
    content: `8.1 Este Termo constitui o instrumento integral que rege as obrigacoes de confidencialidade entre a Fairfield e o Cliente no ambito do estudo de mercado de Seguro de Credito.

8.2 O aceite eletronico registrado na plataforma SENTINEL tem plena validade juridica, sendo equiparado a assinatura eletronica nos termos da legislacao vigente.

8.3 A invalidade ou ineficacia de qualquer clausula nao afetara as demais disposicoes deste Termo.

8.4 A tolerancia da Fairfield quanto a eventuais descumprimentos nao constituira renuncia aos direitos aqui estabelecidos.

8.5 Este Termo e regido pelas leis da Republica Federativa do Brasil.

8.6 Para dirimir quaisquer controversias decorrentes deste Termo, fica eleito o foro da Comarca de Blumenau/SC, com renancia a qualquer outro, por mais privilegiado que seja.`
  }
]

export default function NdaAcceptance() {
  const { user, acceptNda } = useAuth()
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const scrollRef = useRef(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollTop + clientHeight >= scrollHeight - 30) setScrolledToEnd(true)
    }
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  function handleAccept() {
    setAccepting(true)
    setTimeout(() => { acceptNda() }, 800)
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <MiniShield size={48} />
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-navy">Termo de Confidencialidade</h1>
            <p className="text-xs text-navy/40">SENTINEL by Fairfield</p>
          </div>
        </div>
        <p className="text-sm text-navy/50 max-w-xl mx-auto">
          Antes de prosseguir, leia integralmente o Termo de Confidencialidade abaixo.
          Ao finalizar a leitura, o botao de aceite sera habilitado.
        </p>
      </div>

      {/* User badge */}
      <div className="flex items-center justify-center mb-4">
        <div className="inline-flex items-center gap-2 bg-navy/[0.04] border border-navy/[0.1] rounded-full px-4 py-2 text-xs">
          <div className="h-5 w-5 rounded-full bg-sentinel/15 border border-sentinel/25 flex items-center justify-center">
            <span className="text-[9px] font-bold text-sentinel">{user?.nome?.charAt(0)}</span>
          </div>
          <span className="text-navy/70 font-medium">{user?.nome}</span>
          <span className="text-navy/15">|</span>
          <span className="text-navy/40">{user?.empresa}</span>
        </div>
      </div>

      {/* NDA Document */}
      <div className="rounded-2xl border border-navy/[0.08] bg-white shadow-lg shadow-navy/5 p-0 overflow-hidden">
        {/* Document header bar */}
        <div className="bg-navy/[0.03] px-4 sm:px-6 py-3 flex items-center justify-between border-b border-navy/[0.08]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sentinel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-navy/50 text-xs font-medium">Termo de Confidencialidade — Fairfield</span>
          </div>
          {scrolledToEnd ? (
            <span className="text-accent-emerald text-[10px] font-bold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Leitura completa
            </span>
          ) : (
            <span className="text-cobre text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              Role ate o final
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-navy/[0.04]">
          <ScrollProgress scrollRef={scrollRef} />
        </div>

        {/* Document body */}
        <div
          ref={scrollRef}
          className="max-h-[55vh] sm:max-h-[60vh] overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 space-y-5 text-sm leading-relaxed text-navy/60 scroll-smooth"
        >
          {NDA_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h3 className={`font-bold ${idx === 0 ? 'text-lg text-navy text-center mb-4' : 'text-sentinel-dark text-sm mb-2'}`}>
                {section.title}
              </h3>
              {section.content.split('\n').map((line, li) => (
                <p key={li} className={`${line.startsWith('(') ? 'ml-4' : ''} mb-2 text-[13px] sm:text-sm text-navy/50`}>
                  {line}
                </p>
              ))}
            </div>
          ))}

          {/* Footer */}
          <div className="border-t border-navy/[0.08] pt-4 mt-6">
            <p className="text-[11px] text-navy/30 text-center">
              <strong className="text-navy/50">Responsavel:</strong> Fairfield Protecao e Inteligencia Financeira Ltda — CNPJ 13.381.310/0001-45
            </p>
            <p className="text-[11px] text-navy/30 text-center mt-1">
              <strong className="text-navy/50">Vigencia:</strong> 90 dias · <strong className="text-navy/50">Sigilo:</strong> 2 anos · SUSEP 20.2036457.1
            </p>
          </div>

          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full px-4 py-2">
              <svg className="w-3.5 h-3.5 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-[11px] text-accent-emerald font-medium">Fim do documento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accept area */}
      <div className="mt-5 sm:mt-6">
        {scrolledToEnd ? (
          <div className="animate-fadeIn">
            <div className="rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-emerald flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm text-accent-emerald font-medium">
                    Ao clicar em "De Acordo", voce declara que leu e compreendeu este Termo e autoriza a Fairfield a utilizar suas informacoes para o estudo de mercado.
                  </p>
                  <p className="text-[11px] text-navy/30 mt-1">
                    Aceite eletronico registrado com data, hora e identificacao.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={handleAccept} disabled={accepting}
              className="w-full bg-gradient-to-r from-accent-emerald to-emerald-500 text-navy-dark px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-accent-emerald/15 hover:shadow-xl hover:shadow-accent-emerald/25 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {accepting ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Registrando aceitacao...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  De Acordo — Aceito os Termos
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button disabled className="w-full bg-navy/[0.04] text-navy/25 px-8 py-4 rounded-xl font-bold text-lg cursor-not-allowed border border-navy/[0.08]">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Leia o documento completo para continuar
              </span>
            </button>
            <p className="text-[11px] text-navy/30 mt-2">Role até o final do documento para habilitar o aceite</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ScrollProgress({ scrollRef }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = el
      setProgress(Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100))
    }
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollRef])

  return (
    <div className="h-full bg-gradient-to-r from-sentinel to-accent-emerald transition-all duration-150"
      style={{ width: `${progress}%` }} />
  )
}
