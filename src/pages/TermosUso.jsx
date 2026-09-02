import { Link } from 'react-router-dom'
import { MiniShield } from './Home'

export default function TermosUso() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <MiniShield size={40} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-sentinel tracking-tight">Termos de Uso</h1>
          <p className="text-xs text-white/30">Plataforma SENTINEL — Fairfield Corretora de Seguros</p>
        </div>
      </div>

      <Link to="/register" className="text-xs text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar ao cadastro
      </Link>

      <div className="card-glass space-y-6 text-sm text-white/70 leading-relaxed">
        <p className="text-xs text-white/30">Ultima atualizacao: 16 de abril de 2026</p>

        <Section title="1. Aceitacao dos Termos">
          Ao criar uma conta ou utilizar a plataforma SENTINEL ("Plataforma"), operada pela Fairfield
          Corretora de Seguros ("Fairfield", "nos" ou "nossa"), inscrita na SUSEP sob o numero
          20.2036457.1, voce ("Usuario") declara ter lido, compreendido e concordado integralmente com
          estes Termos de Uso. Caso nao concorde com qualquer disposicao, voce nao deve utilizar a
          Plataforma.
        </Section>

        <Section title="2. Descricao do Servico">
          A SENTINEL e uma plataforma digital de intermediacao de cotacoes de Seguro de Credito Interno
          (domestico) e Externo (exportacao). A Plataforma:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li>Coleta dados comerciais, financeiros e cadastrais do Usuario para formulacao de ficha tecnica</li>
            <li>Analisa o perfil de risco de credito da operacao mediante ferramenta proprietaria iCover</li>
            <li>Encaminha a ficha tecnica para multiplas seguradoras parceiras para obtencao de cotacoes</li>
            <li>Apresenta comparativo inteligente entre propostas recebidas</li>
            <li>Disponibiliza painel de acompanhamento do status da cotacao</li>
          </ul>
        </Section>

        <Section title="3. Cadastro e Conta">
          Para utilizar a Plataforma, o Usuario deve criar conta fornecendo informacoes verdadeiras,
          completas e atualizadas (nome, email corporativo, empresa, CNPJ e telefone). O Usuario e
          responsavel por manter a confidencialidade de sua senha e por todas as atividades realizadas
          em sua conta. Notifique imediatamente a Fairfield sobre qualquer uso nao autorizado.
        </Section>

        <Section title="4. Responsabilidades do Usuario">
          O Usuario se compromete a:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li>Fornecer informacoes verdicas, precisas e completas durante o cadastro e preenchimento de formularios</li>
            <li>Atualizar dados cadastrais sempre que houver modificacao</li>
            <li>Nao utilizar a Plataforma para fins ilicitos ou fraudulentos</li>
            <li>Respeitar a propriedade intelectual da Fairfield e de terceiros</li>
            <li>Nao compartilhar credenciais de acesso com terceiros</li>
          </ul>
        </Section>

        <Section title="5. Servico de Corretagem e Regulamentacao">
          A Fairfield atua como corretora de seguros devidamente registrada na SUSEP (Superintendencia
          de Seguros Privados) sob o numero 20.2036457.1. A emissao da apolice e de competencia exclusiva
          da seguradora escolhida pelo Usuario. A Fairfield nao e parte contratante do seguro em si,
          atuando unicamente como intermediaria qualificada.
        </Section>

        <Section title="6. Natureza Informativa das Analises">
          O score iCover e as estimativas de taxa, premio e estrutura de cobertura apresentadas pela
          Plataforma possuem carater exclusivamente informativo e preliminar. A proposta comercial
          vinculante sera aquela formalizada por escrito pela seguradora escolhida, apos analise propria
          de subscricao. Valores estimados podem diferir significativamente da proposta final.
        </Section>

        <Section title="7. Gratuidade do Estudo">
          O estudo preliminar, a analise iCover e o envio as seguradoras sao oferecidos gratuitamente
          ao Usuario. A remuneracao da Fairfield e realizada via comissao paga pela seguradora apos a
          efetivacao da apolice, conforme regulamentacao SUSEP.
        </Section>

        <Section title="8. Confidencialidade e NDA">
          As informacoes compartilhadas pelo Usuario na Plataforma serao tratadas com confidencialidade,
          sendo compartilhadas apenas com as seguradoras parceiras selecionadas para fins de cotacao.
          O aceite eletronico do Termo de Confidencialidade (NDA) apresentado no inicio da jornada e
          parte integrante destes Termos.
        </Section>

        <Section title="9. Propriedade Intelectual">
          Todo o conteudo, tecnologia, marcas, algoritmos de scoring (incluindo o iCover), interfaces,
          textos, codigos e demais elementos da Plataforma sao de propriedade exclusiva da Fairfield
          ou de seus licenciantes. E vedada qualquer reproducao, distribuicao ou engenharia reversa.
        </Section>

        <Section title="10. Limitacao de Responsabilidade">
          A Fairfield nao se responsabiliza por:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li>Decisoes comerciais tomadas pelo Usuario com base nas informacoes da Plataforma</li>
            <li>Recusas ou condicoes impostas pelas seguradoras parceiras</li>
            <li>Atrasos ou falhas na resposta das seguradoras</li>
            <li>Uso indevido da Plataforma pelo Usuario ou por terceiros nao autorizados</li>
            <li>Indisponibilidades temporarias do servico por manutencao ou forca maior</li>
          </ul>
        </Section>

        <Section title="11. Modificacoes dos Termos">
          A Fairfield se reserva o direito de modificar estes Termos a qualquer momento. Alteracoes
          substanciais serao comunicadas ao Usuario por email ou notificacao na Plataforma. O uso
          continuado apos a notificacao constitui aceite tacito das novas condicoes.
        </Section>

        <Section title="12. Rescisao">
          O Usuario pode encerrar sua conta a qualquer momento mediante solicitacao. A Fairfield pode
          suspender ou encerrar contas em caso de descumprimento destes Termos, uso fraudulento ou
          inatividade prolongada, mediante comunicacao previa quando possivel.
        </Section>

        <Section title="13. Lei Aplicavel e Foro">
          Estes Termos sao regidos pelas leis da Republica Federativa do Brasil. Fica eleito o foro da
          Comarca de Sao Paulo/SP para dirimir quaisquer controversias oriundas deste instrumento,
          salvo disposicao legal em contrario.
        </Section>

        <Section title="14. Contato">
          Duvidas, solicitacoes ou reclamacoes relativas a estes Termos devem ser encaminhadas para:
          <div className="mt-2 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
            <p><strong className="text-sentinel">Fairfield Corretora de Seguros</strong></p>
            <p>SUSEP 20.2036457.1</p>
            <p>Email: <span className="text-sentinel">atendimento@fairfield.com.br</span></p>
            <p>Site: <span className="text-sentinel">www.fairfield.com.br</span></p>
          </div>
        </Section>
      </div>

      <div className="mt-8 text-center">
        <Link to="/register" className="btn-primary inline-flex items-center gap-2">
          Voltar ao Cadastro
        </Link>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-white mb-2">{title}</h2>
      <div className="text-white/60 text-sm">{children}</div>
    </div>
  )
}
