# Contribuindo para o DirrochaCMS

Obrigado por considerar contribuir com o DirrochaCMS. Este documento define um fluxo simples para manter o projeto organizado e fácil de revisar.

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
.module.ts
.service.ts
.repository.ts
.controller.ts
.entity.ts
.model.ts
```

- Evite refatorações fora do escopo do PR.
- Prefira nomes claros em português ou inglês, sem misturar no mesmo contexto.
- Atualize o README quando mudar comportamento público.

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

Não publique vulnerabilidades em issues. Use o fluxo descrito em [SECURITY.md](./SECURITY.md).

## Código de conduta

Toda participação no projeto deve seguir [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
