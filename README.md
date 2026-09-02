# SENTINEL — Frontend

Interface web da plataforma Fairfield para cotação de Seguro de Crédito.

Este repositório contém somente o frontend. A API é mantida separadamente em outro repositório e é consumida pela variável `VITE_API_URL`.

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Configuração

```bash
cp .env.example .env.local
```

Configure a URL da API:

```env
VITE_API_URL=https://sentinelapi.40405050.xyz
```

Em desenvolvimento, quando a API estiver disponível na porta 3001, o proxy do Vite pode ser usado mantendo `VITE_API_URL` vazio.

## Desenvolvimento

```bash
npm run dev
```

O frontend inicia em `http://localhost:3000`.

## Build

```bash
npm run build
```

Pré-visualização do build:

```bash
npm run preview
```

## Áreas da aplicação

### Cliente

- Portal de cotação;
- Meu Painel;
- Cotação rápida;
- Histórico das próprias cotações;
- Propostas e mensagens.

### Administração

A área administrativa fica centralizada em `/admin` e reúne:

- Dashboard operacional;
- Cotações rápidas;
- SLA;
- Memória da cotação;
- Seguradoras;
- iCover IA;
- Central de envios;
- Lembretes.

## Estrutura

```text
src/
  components/
  contexts/
  pages/
public/
index.html
vite.config.js
package.json
```

## Deploy

O build gera a pasta `dist/`, que pode ser publicado em qualquer hospedagem de arquivos estáticos compatível com SPA. Configure o fallback de rotas para `index.html`.

```bash
npm run build
```

A API, banco de dados, autenticação e envio de e-mails não fazem parte deste repositório.
