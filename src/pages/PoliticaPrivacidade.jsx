import { Link } from 'react-router-dom'
import { MiniShield } from './Home'

export default function PoliticaPrivacidade() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <MiniShield size={40} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-sentinel tracking-tight">Politica de Privacidade</h1>
          <p className="text-xs text-white/30">Conformidade LGPD — Lei 13.709/2018</p>
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

        <div className="bg-sentinel/5 border border-sentinel/20 rounded-xl p-4">
          <p className="text-sm text-white/70">
            A <strong className="text-sentinel">Fairfield Corretora de Seguros</strong> (SUSEP 20.2036457.1)
            valoriza a privacidade e a protecao dos dados pessoais dos seus usuarios. Esta Politica explica
            como coletamos, usamos, armazenamos, compartilhamos e protegemos suas informacoes em conformidade
            com a Lei Geral de Protecao de Dados (LGPD).
          </p>
        </div>

        <Section title="1. Controlador dos Dados">
          A Fairfield Corretora de Seguros e a Controladora dos dados pessoais coletados na Plataforma
          SENTINEL, conforme definicao do art. 5, VI da LGPD. Para questoes relativas a privacidade,
          nosso Encarregado (DPO) pode ser contatado em: <span className="text-sentinel">dpo@fairfield.com.br</span>.
        </Section>

        <Section title="2. Dados Coletados">
          Coletamos as seguintes categorias de dados:
          <SubSection title="2.1 Dados de Cadastro">
            <ul className="list-disc pl-5 space-y-1 text-white/60">
              <li>Nome completo</li>
              <li>Email corporativo</li>
              <li>Telefone</li>
              <li>Empresa / Razao social</li>
              <li>CNPJ</li>
              <li>Senha (armazenada de forma criptografada via bcrypt)</li>
            </ul>
          </SubSection>
          <SubSection title="2.2 Dados de Cotacao">
            <ul className="list-disc pl-5 space-y-1 text-white/60">
              <li>Dados financeiros (faturamento, condicoes de venda, prazos)</li>
              <li>Carteira de recebiveis e historico de perdas</li>
              <li>Amostra de compradores e destinos de exportacao</li>
              <li>Setor economico, UF e demais informacoes operacionais</li>
            </ul>
          </SubSection>
          <SubSection title="2.3 Dados de Uso e Tecnicos">
            <ul className="list-disc pl-5 space-y-1 text-white/60">
              <li>Endereco IP de acesso</li>
              <li>Tipo e versao de navegador</li>
              <li>Logs de acao na Plataforma</li>
              <li>Cookies essenciais para autenticacao (sessao)</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="3. Bases Legais para Tratamento">
          Tratamos seus dados com fundamento nas seguintes bases legais (art. 7 da LGPD):
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li><strong className="text-white/80">Consentimento</strong> — para envio de comunicacoes e cotacoes as seguradoras</li>
            <li><strong className="text-white/80">Execucao de contrato</strong> — para prestacao do servico de corretagem</li>
            <li><strong className="text-white/80">Cumprimento de obrigacao legal</strong> — exigencias da SUSEP, CVM, BCB e outros orgaos</li>
            <li><strong className="text-white/80">Legitimo interesse</strong> — para melhoria do servico, prevencao de fraudes e analise de risco</li>
          </ul>
        </Section>

        <Section title="4. Finalidades do Tratamento">
          Seus dados sao utilizados para:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li>Cadastro e autenticacao na Plataforma</li>
            <li>Geracao de ficha tecnica e analise iCover de risco</li>
            <li>Encaminhamento de cotacoes a seguradoras parceiras</li>
            <li>Comparativo entre propostas recebidas</li>
            <li>Comunicacao sobre status da cotacao e atualizacoes do servico</li>
            <li>Cumprimento de obrigacoes regulatorias e fiscais</li>
            <li>Atendimento ao cliente e suporte tecnico</li>
          </ul>
        </Section>

        <Section title="5. Compartilhamento de Dados">
          Seus dados pessoais e empresariais podem ser compartilhados com:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li><strong className="text-white/80">Seguradoras parceiras</strong> — exclusivamente para fins de cotacao e emissao de apolice (AIG, Atradius, Coface, Allianz Trade, AVLA, CESCE)</li>
            <li><strong className="text-white/80">Provedores de tecnologia</strong> — hospedagem da aplicação, banco de dados e envio de e-mail (SMTP)</li>
            <li><strong className="text-white/80">Autoridades publicas</strong> — quando exigido por lei ou ordem judicial</li>
          </ul>
          <p className="mt-2 text-xs text-white/40">
            Nao vendemos, alugamos ou cedemos seus dados a terceiros para fins de marketing.
          </p>
        </Section>

        <Section title="6. Transferencia Internacional">
          Para usuarios da modalidade de Exportacao, alguns dados podem ser transferidos para seguradoras
          internacionais (ex: Coface, Allianz Trade, Atradius com sede na Europa). Tais transferencias
          observam as garantias da LGPD (art. 33), incluindo paises com nivel adequado de protecao ou
          mediante clausulas contratuais especificas.
        </Section>

        <Section title="7. Armazenamento e Seguranca">
          Adotamos medidas tecnicas e organizacionais para proteger seus dados:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li>Conexao criptografada via HTTPS/TLS em todas as comunicacoes</li>
            <li>Senhas armazenadas com hash bcrypt (nao reversivel)</li>
            <li>Autenticacao via JWT com tokens de curta duracao</li>
            <li>Acesso restrito ao banco de dados por equipe autorizada</li>
            <li>Backups regulares e protegidos</li>
            <li>Logs de auditoria de acoes administrativas</li>
          </ul>
        </Section>

        <Section title="8. Tempo de Retencao">
          Mantemos seus dados pelo tempo necessario para cumprir as finalidades descritas nesta Politica
          ou conforme exigido por lei:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li><strong className="text-white/80">Dados cadastrais:</strong> enquanto a conta estiver ativa + 5 anos apos encerramento</li>
            <li><strong className="text-white/80">Dados de cotacao:</strong> 5 anos a contar da ultima interacao (cumprimento regulatorio SUSEP)</li>
            <li><strong className="text-white/80">Logs de acesso:</strong> 6 meses</li>
            <li><strong className="text-white/80">Dados de apolice efetivada:</strong> 20 anos (prazo prescricional civil)</li>
          </ul>
        </Section>

        <Section title="9. Direitos do Titular">
          Conforme art. 18 da LGPD, voce tem direito a:
          <ul className="mt-2 space-y-1 list-disc pl-5 text-white/60">
            <li>Confirmacao da existencia de tratamento de seus dados</li>
            <li>Acesso aos dados que possuimos sobre voce</li>
            <li>Correcao de dados incompletos, inexatos ou desatualizados</li>
            <li>Anonimizacao, bloqueio ou eliminacao de dados desnecessarios</li>
            <li>Portabilidade a outro fornecedor</li>
            <li>Eliminacao de dados tratados com base no consentimento</li>
            <li>Informacao sobre entidades publicas e privadas com as quais compartilhamos dados</li>
            <li>Revogacao do consentimento a qualquer momento</li>
          </ul>
          <p className="mt-3">
            Para exercer seus direitos, envie solicitacao para <span className="text-sentinel">dpo@fairfield.com.br</span>.
            Responderemos em ate 15 dias uteis.
          </p>
        </Section>

        <Section title="10. Cookies">
          Utilizamos apenas cookies essenciais ao funcionamento da Plataforma (autenticacao e sessao).
          Nao utilizamos cookies de rastreamento de terceiros, publicidade ou analytics invasivos.
          Voce pode bloquear cookies no seu navegador, mas isso pode impactar funcionalidades essenciais
          como manter o login ativo.
        </Section>

        <Section title="11. Menores de Idade">
          A Plataforma SENTINEL e destinada exclusivamente a usuarios maiores de 18 anos representando
          pessoas juridicas. Nao coletamos intencionalmente dados de menores. Caso identifique tal
          situacao, entre em contato para remocao imediata.
        </Section>

        <Section title="12. Alteracoes desta Politica">
          Esta Politica pode ser atualizada periodicamente. Alteracoes significativas serao comunicadas
          por email cadastrado ou aviso destacado na Plataforma. A data de ultima atualizacao consta
          no topo deste documento.
        </Section>

        <Section title="13. Contato e Encarregado (DPO)">
          Para qualquer questao relativa a privacidade, protecao de dados ou exercicio de direitos:
          <div className="mt-2 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] space-y-1">
            <p><strong className="text-sentinel">Encarregado de Dados (DPO)</strong></p>
            <p>Email: <span className="text-sentinel">dpo@fairfield.com.br</span></p>
            <p>Atendimento: <span className="text-sentinel">atendimento@fairfield.com.br</span></p>
            <p>Empresa: Fairfield Corretora de Seguros</p>
            <p>SUSEP 20.2036457.1</p>
          </div>
          <p className="mt-3 text-xs text-white/40">
            Voce tambem pode apresentar reclamacao a Autoridade Nacional de Protecao de Dados (ANPD)
            atraves do site <span className="text-sentinel">www.gov.br/anpd</span>.
          </p>
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

function SubSection({ title, children }) {
  return (
    <div className="mt-3 ml-2">
      <h3 className="text-xs font-bold text-white/70 mb-1">{title}</h3>
      <div className="text-white/55 text-sm">{children}</div>
    </div>
  )
}
