# Contribuindo para o DirrochaCMS

<p>
  <a href="./CONTRIBUTING.md">English</a> · <strong>Português (Brasil)</strong>
</p>

Obrigado por considerar contribuir com o DirrochaCMS. Este documento define um fluxo simples para manter o projeto organizado e fácil de revisar.

> Issues e pull requests podem ser escritos em português ou em inglês.

## Onde pedir ajuda

Para dúvidas de instalação ou de uso, abra uma
[issue no GitHub](https://github.com/marco0antonio0/DirrochaCMS/issues) usando o template de
bug report ou de feature request. Esse é o canal de suporte do projeto, e as respostas ficam
pesquisáveis para outras pessoas. Vulnerabilidades seguem o fluxo separado do
[SECURITY.pt-BR.md](./SECURITY.pt-BR.md).

## Como contribuir

1. Verifique se já existe uma issue relacionada.
2. Se não existir, abra uma issue explicando o problema, melhoria ou proposta.
3. Faça um fork do repositório.
4. Crie uma branch com nome claro.
5. Implemente a mudança em escopo pequeno.
6. Rode as validações locais.
7. Abra um pull request com descrição objetiva.

## Ambiente local

```bash
git clone https://github.com/marco0antonio0/DirrochaCMS.git
cd DirrochaCMS
npm install
cp .env.example .env
npm run dev
```

Preencha o `.env` com as credenciais do Firebase antes de testar os fluxos com persistência.
Veja a seção
[Credencial do Firebase Admin](./README.pt-BR.md#credencial-do-firebase-admin-service-account)
do README para saber como obtê-las.

## Padrão de branch

Use nomes curtos e descritivos:

```text
feature/criar-endpoint
fix/modal-delete
docs/readme
refactor/backend-auth
```

## Commits

Prefira mensagens diretas:

```text
feat: adiciona ordenacao de campos
fix: corrige estilo da tela de endpoint
docs: melhora guia de instalacao
```

## Antes de abrir PR

Rode:

```bash
npx tsc --noEmit
npm run build
```

O mesmo par de comandos roda no CI ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
Para validar os fluxos da interface e da API, use o roteiro de
[`docs/manual-verification.md`](./docs/manual-verification.md).

Inclua no pull request:

- O que mudou.
- Por que mudou.
- Como testar.
- Prints ou gravação curta quando a mudança afetar UI.
- Observações sobre migração, variáveis ou riscos.

## Padrões de código

- Siga a estrutura atual do projeto.
- Mantenha frontend em `/app`.
- Mantenha lógica de backend em `/backend`.
- Para novos módulos do backend, use:

```text
<modulo>.service.ts      # regras de negócio e validação
<modulo>.repository.ts   # acesso ao Firestore via Admin SDK
<modulo>.entity.ts       # constantes, defaults e contratos de domínio
<modulo>.model.ts        # tipos TypeScript do domínio
```

- Todo arquivo em `/backend` começa com `import "server-only"`. Nada em `/backend` pode ser
  importado por um componente client — o Firestore é acessado somente no servidor.
- As rotas HTTP ficam em `app/api/admin/**/route.ts` (Route Handlers do Next.js) e são
  protegidas pelo guard `withAuth` de `backend/common/serverAuth.ts`. Não existe mais camada
  `.controller.ts` nem `.module.ts`.
- Evite refatorações fora do escopo do PR.
- Prefira nomes claros em português ou inglês, sem misturar no mesmo contexto.
- Atualize o README — tanto [`README.md`](./README.md) quanto
  [`README.pt-BR.md`](./README.pt-BR.md) — quando mudar comportamento público.

## Reportando bugs

Ao abrir uma issue de bug, informe:

- Passos para reproduzir.
- Resultado esperado.
- Resultado atual.
- Ambiente usado, como Node, npm, navegador e sistema operacional.
- Prints, logs ou payloads quando ajudarem.

## Propondo funcionalidades

Explique:

- Problema que a funcionalidade resolve.
- Fluxo esperado.
- Impacto em usuários existentes.
- Possíveis alternativas.

## Segurança

Não publique vulnerabilidades em issues. Use o fluxo descrito em
[SECURITY.pt-BR.md](./SECURITY.pt-BR.md).

## Código de conduta

Toda participação no projeto deve seguir
[CODE_OF_CONDUCT.pt-BR.md](./CODE_OF_CONDUCT.pt-BR.md).
