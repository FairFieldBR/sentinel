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

### Plesk com Phusion Passenger

O `server.js` serve o build de `dist/` com Express. Ele recusa execução
sem ambiente de produção, portanto não substitui o Vite em desenvolvimento.

Gere o build na raiz do projeto:

```bash
npm ci
npm run build
```

No Plesk, configure:

- **Application root**: raiz deste repositório;
- **Document root**: `dist` (quando o Plesk permitir servir estático diretamente);
- **Application startup file**: `server.js`;
- **Application mode**: `production`;
- **Node.js**: versão 18 ou superior;
- **Environment variable**: `NODE_ENV=production`.

O Passenger fornece automaticamente a variável `PORT`. Não defina essa porta
manualmente.

Após o build, reinicie a aplicação pelo botão **Restart App** do Plesk.

Healthcheck:

```http
GET /health
```

Para desenvolvimento, use somente:

```bash
npm run dev
```

A API, banco de dados, autenticação e envio de e-mails não fazem parte deste repositório.
