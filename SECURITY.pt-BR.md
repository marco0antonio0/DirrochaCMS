# Política de Segurança

<p>
  <a href="./SECURITY.md">English</a> · <strong>Português (Brasil)</strong>
</p>

Obrigado por ajudar a manter o DirrochaCMS seguro.

## Versões suportadas

Enquanto o projeto estiver em fase inicial, a versão suportada é a branch principal do repositório.

| Versão | Suporte |
| --- | --- |
| `main` | Sim |
| versões antigas | Não garantido |

## Reportando vulnerabilidades

Não abra uma issue pública com detalhes exploráveis de uma vulnerabilidade.

Use o GitHub do projeto para entrar em contato com os mantenedores:

https://github.com/marco0antonio0/DirrochaCMS

Inclua:

- Descrição da vulnerabilidade.
- Passos para reproduzir.
- Impacto esperado.
- Ambiente afetado.
- Evidências, logs ou payloads mínimos.

## Boas práticas para produção

- Não versione `.env`.
- Use `SECRET_KEY` forte, longa e exclusiva por ambiente (`npm run generate:secret`).
- Faça o deploy das regras do Firestore em [`firestore.rules`](./firestore.rules) antes de expor
  o projeto publicamente. Sem elas, o banco continua acessível por qualquer pessoa que conheça o
  ID do projeto.
- Revise permissões antes de expor o CMS publicamente.
- Mantenha dependências atualizadas.
- Rode `npm run build` antes de publicar.

## Escopo

Problemas de segurança relevantes incluem:

- Bypass de autenticação.
- Vazamento de dados.
- Escrita indevida no Firebase.
- Validação insuficiente em rotas públicas.
- Exposição de secrets.
- Execução de código não autorizada.
