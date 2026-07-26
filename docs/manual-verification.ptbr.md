# Verificação Manual

Este documento fornece um checklist de verificação para o DirrochaCMS. Ele cobre
verificação local de build e um teste funcional básico contra um projeto real do
Firebase/Firestore.

## 1. Verificação Local de Build

Pré-requisitos:

- Node.js 20 ou mais recente.
- npm.

Instale as dependências:

```bash
npm ci
```

Crie um arquivo de ambiente local:

```bash
cp .env.example .env
```

Gere um `SECRET_KEY`:

```bash
npm run generate:secret
```

Adicione o valor gerado ao `.env`.

Configure `FIREBASE_SERVICE_ACCOUNT_B64` a partir de uma service account do
Firebase Admin, seguindo as instruções em `README.md`.

Rode a checagem de tipos:

```bash
npx tsc --noEmit
```

Rode os testes automatizados:

```bash
npm test
```

Rode o build de produção:

```bash
npm run build
```

Resultado esperado:

- `npx tsc --noEmit` termina com código `0`.
- `npm test` termina com código `0`.
- `npm run build` termina com código `0`.
- Nenhuma credencial Firebase é exposta no bundle do navegador.

## 2. Teste Funcional Básico

Inicie a aplicação:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

### Configuração Inicial

1. Confirme que a primeira tela solicita a criação do administrador inicial
   quando ainda não existe conta admin.
2. Complete o desafio ALTCHA.
3. Crie a primeira conta administradora.
4. Confirme que a aplicação redireciona para `/home`.

Resultado esperado:

- Uma conta admin é criada no Firestore.
- Um cookie de sessão é definido como `HttpOnly`.
- A área administrativa fica acessível após a configuração.

### Autenticação

1. Faça logout do painel.
2. Volte para `/`.
3. Complete o desafio ALTCHA.
4. Faça login com as credenciais de administrador.

Resultado esperado:

- Login funciona com credenciais válidas.
- Login falha com credenciais inválidas.
- Rotas administrativas da API não são acessíveis sem sessão válida.

### Criação de Endpoint

1. Abra `/configuration`.
2. Crie um endpoint chamado `posts`.
3. Adicione pelo menos estes campos:
   - `titulo`, tipo `Texto`.
   - `descricao`, tipo `Texto`, com multilinha habilitado.
   - `data`, tipo `Data`.
4. Salve o endpoint.
5. Abra `/home`.
6. Confirme que `posts` aparece na lista de endpoints.

Resultado esperado:

- O endpoint é armazenado no Firestore.
- O endpoint aparece no painel sem recarregar credenciais no navegador.

### Gerenciamento de Itens

1. Abra `/home/posts`.
2. Crie um novo registro com valores de exemplo.
3. Edite o registro.
4. Exclua o registro e confirme o modal de exclusão.

Resultado esperado:

- Operações de criação, edição e exclusão funcionam.
- A lista de registros atualiza após cada operação.
- A API pública nunca retorna metadados administrativos, como hashes de senha.

### Acesso à API Pública

Crie um registro em `posts` e execute:

```bash
curl http://localhost:3000/api/posts
```

Resultado esperado:

- A resposta retorna status `200`.
- A resposta inclui os registros públicos de `posts`.

Se o endpoint tiver `titulo_identificador`, teste busca por identificador:

```bash
curl "http://localhost:3000/api/posts?t=sample-title"
```

Resultado esperado:

- A resposta retorna o registro público correspondente ou um resultado público
  vazio.

### Senha de Endpoint Privado

1. Abra o modal de configurações do endpoint `posts`.
2. Altere o acesso da API de público para privado.
3. Defina uma senha manual ou use o botão de randomizar.
4. Salve o endpoint.

Sem a senha:

```bash
curl -i http://localhost:3000/api/posts
```

Resultado esperado:

- A resposta é rejeitada.

Com senha no header obrigatório:

```bash
curl -i http://localhost:3000/api/posts \
  -H "x-endpoint-password: YOUR_PASSWORD"
```

Resultado esperado:

- A resposta funciona.

### Gerenciamento de Usuários

1. Abra `/configuration`.
2. Crie uma segunda conta do painel.
3. Altere a senha dessa conta.
4. Desative a conta.
5. Confirme que a conta desativada não consegue fazer login.
6. Reative ou exclua a conta.

Resultado esperado:

- Administradores conseguem criar contas, alterar senhas, desativar e excluir
  outras contas do painel.
- Desativar ou excluir um usuário revoga sessões ativas dessa conta.

## 3. Limpeza

Após a verificação:

1. Exclua registros e endpoints de teste pelo painel.
2. Remova usuários temporários.
3. Rotacione ou exclua qualquer service account do Firebase usada apenas para
   teste.
