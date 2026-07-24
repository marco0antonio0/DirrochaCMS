<p align="center">
  <img src="./public/favicon.svg" alt="DirrochaCMS logo" width="96" height="96">
</p>

<h1 align="center">DirrochaCMS</h1>

CMS leve para criar endpoints dinâmicos e gerenciar conteúdo usando Next.js, React e Firebase.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge">
</p>

O DirrochaCMS foi pensado para projetos que precisam de uma API simples e editável sem criar uma área administrativa do zero. Pelo painel, você cria uma rota, define os campos daquele endpoint e passa a gerenciar registros pela interface.

## Conteúdo

- [Principais Recursos](#principais-recursos)
- [Capturas de Tela](#capturas-de-tela)
- [Stack](#stack)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Rodando em Producao](#rodando-em-producao)
- [Rotas Principais](#rotas-principais)
- [Como Usar](#como-usar)
- [API](#api)
- [Desenvolvimento](#desenvolvimento)
- [Contribuicao](#contribuicao)
- [Codigo de Conduta](#codigo-de-conduta)
- [Seguranca](#seguranca)
- [Licenca](#licenca)

## Principais Recursos

- Criação de endpoints personalizados por interface.
- Builder de campos com nomes livres e tipos categorizados.
- Ordenação dos campos por arrastar e soltar.
- Campo `titulo_identificador` gerado automaticamente.
- Listagem, busca, criação, edição e remoção de registros no painel.
- Modal de confirmação para exclusões.
- Autenticação com JWT e sessão persistida.
- Configuração para habilitar ou desabilitar login, cadastro e logout de usuários.
- Persistência com Firebase Firestore.
- Interface em Next.js App Router.
- Backend organizado por módulos em `/backend`.
- Dockerfile para build e execução em container.

## Capturas de Tela

![Tela de login do DirrochaCMS](./images/login-demo.dirrocha.com%20(1).png)

![Tela inicial do DirrochaCMS](./images/4.png)

![Criacao de endpoint no DirrochaCMS](./images/8.png)

![Listagem de registros no DirrochaCMS](./images/6.png)

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- HeroUI
- Firebase Firestore
- JWT
- bcryptjs
- Docker

## Estrutura do Projeto

```text
DirrochaCMS/
├── app/
│   ├── api/                 # Route handlers do Next.js
│   ├── components/          # Componentes de UI
│   ├── pages/               # Implementações das telas
│   ├── services/            # Serviços usados pelo frontend
│   ├── styles/              # Estilos globais
│   └── utils/               # Utilitários do frontend
├── backend/
│   ├── auth/
│   ├── endpoint/
│   ├── item/
│   ├── sessao/
│   ├── user/
│   ├── common/
│   └── config/
├── images/                  # Imagens usadas na documentação
├── public/                  # Arquivos públicos
├── Dockerfile
├── package.json
└── README.md
```

Cada domínio do backend segue a organização:

```text
backend/<modulo>/
├── <modulo>.module.ts
├── <modulo>.service.ts
├── <modulo>.repository.ts
├── <modulo>.controller.ts
├── <modulo>.entity.ts
└── <modulo>.model.ts
```

Responsabilidades principais:

- `controller.ts`: entrada das requisições e adaptação de resposta.
- `service.ts`: regras de negócio.
- `repository.ts`: acesso ao Firebase.
- `entity.ts`: constantes, defaults e contratos de domínio.
- `model.ts`: tipos TypeScript do domínio.
- `module.ts`: ponto de organização/exportação do módulo.

## Como Rodar Localmente

### Pré-requisitos

- Node.js 18 ou superior.
- npm.
- Uma conta/projeto no Firebase com Firestore habilitado.

### Passo a passo

1. Clone o repositório:

```bash
git clone https://github.com/marco0antonio0/DirrochaCMS.git
cd DirrochaCMS
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

4. Preencha o `.env` com as credenciais do Firebase e uma chave JWT em `SECRET_KEY`.

5. Rode o projeto em desenvolvimento:

```bash
npm run dev
```

6. Acesse:

```text
http://localhost:3000
```

No primeiro acesso, o sistema orienta a configuração inicial e a criação do usuário administrador.

## Variaveis de Ambiente

O projeto usa as variáveis abaixo:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sim | API key do app Firebase. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Sim | App ID do Firebase. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sim | Domínio de autenticação do Firebase. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sim | Sender ID do Firebase. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Sim | ID do projeto Firebase. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sim | Bucket do Firebase Storage. |
| `NEXT_PUBLIC_ENV` | Sim | Ambiente atual, por exemplo `development` ou `production`. |
| `SECRET_KEY` | Sim | Chave usada para assinar tokens JWT. |

Exemplo:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_ENV=development
SECRET_KEY=change_this_to_a_strong_random_secret
```

## Rodando em Producao

### Build local

```bash
npm run build
npm run start
```

A aplicação sobe em `http://localhost:3000`.

### Docker

```bash
docker build -t dirrochacms .
docker run --env-file .env -p 3000:3000 dirrochacms
```

### Deploy em Vercel ou servidor próprio

Configure as mesmas variáveis do `.env` no ambiente de produção e use o fluxo padrão de build do Next.js:

```bash
npm install
npm run build
npm run start
```

## Rotas Principais

| Rota | Descrição |
| --- | --- |
| `/` | Login e primeira configuração. |
| `/home` | Lista endpoints e usuários. |
| `/home/[id]` | Gerencia os registros de um endpoint. |
| `/create` | Cria endpoints e ajusta configurações de usuário. |
| `/api/[id]` | API pública de consulta dos dados de um endpoint criado. |
| `/api/user/login` | Login de usuário configurável. |
| `/api/user/register` | Cadastro de usuário configurável. |
| `/api/user/logout` | Logout de usuário configurável. |
| `/api/verifyToken` | Validação de token JWT. |

## Como Usar

### Criar um endpoint

1. Acesse `/create`.
2. Informe o nome da rota, por exemplo `posts`.
3. Adicione campos no builder.
4. Escolha o tipo de cada campo:
   - `Texto`
   - `Numero`
   - `Data`
   - `Imagem`
5. Arraste os campos para ajustar a ordem.
6. Use `Multi-Linha` apenas em campos de texto.
7. Clique em `Criar endpoint`.

O campo `titulo_identificador` não precisa ser declarado. Ele é criado automaticamente.

### Gerenciar registros

1. Acesse `/home`.
2. Clique no endpoint desejado.
3. Cadastre novos registros.
4. Edite registros existentes.
5. Exclua registros pelo botão de deletar e confirme no modal.

### Gerenciar usuários

1. Acesse `/create`.
2. Abra a aba de usuários/configurações.
3. Ative ou desative login, cadastro e logout.
4. Salve a configuração.

## API

Depois de criar um endpoint chamado `posts`, os registros podem ser consultados por:

```bash
curl http://localhost:3000/api/posts
```

Resposta:

```json
{
  "data": [
    {
      "id": "abc123",
      "endpointId": "endpoint-id",
      "formattedData": {
        "titulo": "Primeiro post",
        "titulo_identificador": "primeiro-post"
      },
      "createdAt": "2026-07-23T00:00:00.000Z"
    }
  ],
  "statusCode": 200
}
```

Pesquisa pelo `titulo_identificador`:

```bash
curl "http://localhost:3000/api/posts?t=primeiro-post"
```

### Autenticação

Login de usuário, quando habilitado:

```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

Cadastro de usuário, quando habilitado:

```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"senha123"}'
```

Logout:

```bash
curl -X POST http://localhost:3000/api/user/logout \
  -H "Authorization: Bearer SEU_TOKEN"
```

Validação de token:

```bash
curl http://localhost:3000/api/verifyToken \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Desenvolvimento

Comandos úteis:

```bash
npm run dev
npm run build
npm run start
npx tsc --noEmit
```

Antes de abrir um pull request:

1. Rode `npx tsc --noEmit`.
2. Rode `npm run build`.
3. Teste manualmente os fluxos alterados.
4. Atualize a documentação se mudar rotas, variáveis ou comportamento público.

## Roadmap

Ideias que combinam com o projeto:

- Documentação visual da API gerada por endpoint.
- Importação e exportação de dados.
- Controle de permissões por usuário.
- Testes automatizados para backend e rotas.
- Templates de endpoints para casos comuns.

## Contribuicao

Contribuições são bem-vindas. Leia [CONTRIBUTING.md](./CONTRIBUTING.md) antes de abrir uma issue ou pull request.

O repositório inclui templates para bug report, feature request e pull request em [`.github/`](./.github).

Fluxo recomendado:

1. Abra uma issue descrevendo o problema ou proposta.
2. Faça um fork do projeto.
3. Crie uma branch com nome claro, como `feature/builder-campos` ou `fix/login`.
4. Implemente a mudança.
5. Rode as validações.
6. Abra um pull request com contexto, prints quando houver UI, e passos de teste.

## Codigo de Conduta

Este projeto segue uma política de convivência documentada em [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Esperamos respeito, clareza e colaboração objetiva em issues, pull requests e discussões.

## Seguranca

Para vulnerabilidades, não abra uma issue pública com detalhes exploráveis. Siga as orientações em [SECURITY.md](./SECURITY.md).

Boas práticas ao usar o projeto:

- Não versione `.env`.
- Use um `SECRET_KEY` forte em produção.
- Restrinja regras do Firebase de acordo com o seu ambiente.
- Revise permissões de leitura e escrita antes de expor o projeto publicamente.

## Licenca

Distribuído sob a licença MIT. Veja [LICENSE](./LICENSE) para mais detalhes.

## Autor

Desenvolvido por [@marco0antonio0](https://github.com/marco0antonio0).
