# 🚀 DirrochaCMS: Sua Solução Leve para Gerenciamento de Conteúdo

<div style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 20px;">
<img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
<img src="https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white">
<img src="https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=ffffff">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/TypeScript-F7DF1E?style=for-the-badge&logo=typescript&logoColor=black">
</div>

DirrochaCMS é um Sistema de Gerenciamento de Conteúdo (CMS) leve e eficiente, projetado para simplificar a criação de endpoints de API e o gerenciamento de dados para sites e diversas aplicações. Construído pensando em desenvolvedores e equipes, o DirrochaCMS oferece uma solução rápida, personalizável e amigável para gerenciar o conteúdo de seus projetos web. Nosso objetivo é fornecer uma ferramenta intuitiva que torne o gerenciamento de conteúdo direto e descomplicado, economizando seu tempo e recursos.

<!-- [Ir para a documentação](#documentação-do-sistema-dirrochacms) -->

## ⬇️ Instruções de Instalação Rápida

Antes de mergulhar nas funcionalidades do DirrochaCMS, siga estas instruções para configurar o projeto localmente:

1.  **Clone o projeto com `degit`:**

    ```bash
    npx degit marco0antonio0/DirrochaCMS meu-projeto
    cd meu-projeto
    ```

    *   Este comando copia o projeto para uma nova pasta chamada `meu-projeto`. Você pode substituir `meu-projeto` pelo nome que preferir.
    * Certifique-se de ter o Node.js instalado na sua maquina.

2.  **Instale as dependências:**

    ```bash
    npm install
    # ou
    yarn install
    ```

    *   Este comando instala todas as bibliotecas e pacotes necessários para o funcionamento do DirrochaCMS.

3.  **Configure as Variáveis de Ambiente:**

    *   **Crie o arquivo `.env`:** Copie o arquivo `.env.example` para `.env`.
        ```bash
        cp .env.example .env
        ```
    * **Acesse o Firebase:** No [Console do Firebase](https://console.firebase.google.com/), crie um novo projeto ou acesse um projeto existente.
    * **Credenciais:** Obtenha as credenciais do seu projeto Firebase (chave de API, ID do projeto, domínio de autenticação, etc.) em:
        *  Vá para as configurações do projeto e na aba **Geral** você encontra as credenciais e na aba **Contas de serviço** você pode gerar uma nova chave.
    *   **Preencha o arquivo `.env`:** Substitua os valores de exemplo pelas suas credenciais do Firebase no arquivo `.env`:

        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=SUA_CHAVE_DE_API_DO_FIREBASE
        NEXT_PUBLIC_FIREBASE_APP_ID=SEU_ID_DE_APP_DO_FIREBASE
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=SEU_DOMÍNIO_DE_AUTENTICAÇÃO_DO_FIREBASE
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SEU_ID_DE_REMETENTE_DE_MENSAGENS_DO_FIREBASE
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=SEU_ID_DE_PROJETO_DO_FIREBASE
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=SEU_BUCKET_DE_STORAGE_DO_FIREBASE
        NEXT_PUBLIC_ENV=SEU_AMBIENTE (ex: development)
        SECRET_KEY=SUA_CHAVE_SECRETA
        ```

4. **Pronto!** Agora você pode iniciar o projeto.

    ```bash
        npm run dev
    ```
    * Execute o comando para startar o ambiente de desenvolvimento do projeto

---

![DirrochaCMS Login Demo](/images/login-demo.dirrocha.com%20(1).png)

## ✨ Principais Funcionalidades

O DirrochaCMS oferece uma variedade de funcionalidades poderosas:

*   **Criação de Endpoints Personalizados:** Defina e crie seus próprios endpoints de API para acessar e gerenciar seus dados.
*   **Gerenciamento Intuitivo de Dados:** Use uma interface limpa e intuitiva para executar operações de Criar, Ler, Atualizar e Excluir (CRUD) em seus dados.
*   **Estruturas de Dados Flexíveis:** Projete esquemas de dados personalizados com vários tipos de campos, como texto, números, booleanos e muito mais, para atender às necessidades do seu projeto.
*   **Leve e de Alto Desempenho:** Construído com tecnologias de ponta para garantir alto desempenho e eficiência.
*   **Integração Descomplicada:** Integre facilmente o DirrochaCMS com suas ferramentas e serviços existentes.
*   **Gerenciamento de Usuários:** Crie e gerencie contas de usuário, controle o acesso e configure as definições diretamente dentro do CMS.
*   **Autenticação:** Proteja seus endpoints com recursos de autenticação integrados, permitindo que você gerencie logins de usuário e proteja dados sensíveis.
*   **Configurações de Usuário:** Defina se deseja usar usuários no sistema, permitindo que os usuários se registrem e façam login.
*   **Pesquisa:** Pesquise por nome ou e-mail de forma rápida e simples.
*   **Endpoints Dinâmicos:** Crie endpoints dinamicamente com os campos desejados, facilitando a personalização para suas necessidades.
*   **Interface Amigável:** Interface fácil de usar e entender.

**Exemplo Prático:** Imagine construir um blog. Com o DirrochaCMS, você pode facilmente criar endpoints para posts, categorias, autores e comentários, gerenciando todo esse conteúdo por meio de uma interface amigável. Você também pode implementar recursos de gerenciamento de usuários e autenticação para uma experiência de blog mais robusta.

## 🛠️ Stack de Tecnologias

Utilizamos uma poderosa combinação de tecnologias:

*   ✅ **Firebase API:** Serve como backend para persistência de dados e autenticação. Garante escalabilidade e facilidade de integração.
*   ✅ **Rotas de API Next.js:** Permite a criação de endpoints de API, oferecendo alto desempenho e uma ótima experiência para o desenvolvedor.
*   ✅ **Next.js:** O framework para construir a interface de usuário do aplicativo. Ele oferece renderização do lado do servidor e desempenho excepcional.
*   ✅ **Docker:** Possibilita a conteinerização, garantindo portabilidade e consistência entre diferentes ambientes.
*   ✅ **Docker Compose:** Simplifica a orquestração de múltiplos contêineres, agilizando o desenvolvimento e a implantação.
* ✅ **React:** Usado para construir a interface do usuário.
* ✅ **Heroui:** Uma biblioteca de UI para React, facilita o desenvolvimento.
* ✅ **Lodash.debounce:** Função para evitar execuções excessivas.
* ✅ **React-hot-toast:** Sistema de notificações.

## ⚙️ Pré-requisitos e Instalação (Detalhada)

Antes de começar, certifique-se de ter o seguinte instalado:

1.  **Node.js (v16+):** O ambiente de execução JavaScript.

    *   [Baixar Node.js](https://nodejs.org/)

2.  **npm ou yarn:** O gerenciador de pacotes para instalar as dependências do projeto.
3.  **Docker e Docker Compose:** Para conteinerização e gerenciamento de serviços.

    *   [Instalar Docker](https://docs.docker.com/get-docker/)

### Instalação

1.  **Clone o Repositório (Se já tiver feito usando npx degit, pule esse passo):**

    ```bash
    git clone https://github.com/marco0antonio0/DirrochaCMS
    cd DirrochaCMS
    ```

### Opções de Implantação

#### **Implantação em um VPS (Servidor Privado Virtual):**

1.  **Instale as Dependências:**

    ```bash
    npm install
    # ou
    yarn install
    ```

2.  **Construa a Aplicação:**

    ```bash
    npm run build
    # ou
    yarn build
    ```

3.  **Inicie o ambiente de desenvolvimento:**

    ```bash
    npm run dev
    # ou
    yarn dev
    ```

4.  **Execute com Docker:**

    ```bash
    docker build -t dirrocha-cms .
    docker run -p 3000:3000 dirrocha-cms .
    ```

    A aplicação estará acessível em `http://localhost:3000`.

#### **Implantação no Netlify ou Vercel:**

1.  **Configure as Variáveis de Ambiente do Firebase:**

    *   Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
    *   Obtenha as credenciais do seu projeto (chave de API, ID do projeto, etc.).
    *   Verifique se o arquivo `.env` foi criado e se ele contem todas as credenciais.

2.  **Implante:**
    *   Simplesmente envie os arquivos do seu projeto para um repositório e conecte-o ao Netlify ou Vercel. Eles cuidarão do processo de implantação.

## 🚀 Como Usar o DirrochaCMS

### Página Inicial (index.tsx)

![Página Inicial do DirrochaCMS](/images/4.png)

1.  **Acesse a Aplicação:** Abra seu navegador e vá para `http://0.0.0.0:3000`.
2.  **Navegação:** Você será direcionado à página inicial, onde poderá visualizar os endpoints existentes ou gerenciar usuários.
3.  **Abas:** Na página inicial, você pode ver as abas "Endpoints" e "Usuários".
4. **Pesquisa:** Na página inicial, você tem uma opção de pesquisa para encontrar seus endpoints ou usuários.

#### **Gerenciando Endpoints:**

*   **Visualizar Endpoints:** A página inicial lista todos os endpoints criados.
*   **Acessar Dados do Endpoint:** Clique em um endpoint para visualizar e gerenciar seus dados.
*   **Criar Novos Endpoints:** Clique em "Configurações" para ir à página de criação.
*   **Logout:** Clique no ícone de logout para sair.
* **Documentação:** Clique no link azul para ir para documentação.

#### **Gerenciando Usuários:**

*   **Visualizar Usuários:** A página inicial possui uma aba "Usuários" onde você pode ver todos os usuários registrados.
*   **Excluir Usuários:** Na aba "Usuários", você pode excluir usuários.

### Página de Criação de Endpoint (create.tsx)

![Criar Endpoint no DirrochaCMS](/images/8.png)

1.  **Acessar a Página:** Clique em "Configurações" na página inicial para acessar a página de Criação de Endpoint.
2.  **Criar Endpoints:**
    *   **Nome do Endpoint:** Insira o nome desejado para seu novo endpoint.
    *   **Selecionar Campos:** Escolha os campos (tipos de dados) que deseja incluir no endpoint.
    *   **Salvar:** Clique em "Criar endpoint" para criar o novo endpoint.
3.  **Configurações de Usuário:**
    *   **Acessar Configurações de Usuário:** Clique na aba "Users" na página de Criação de Endpoint.
    *   **Habilitar/Desabilitar Login:** Alterne "Login de usuários" para habilitar ou desabilitar o login de usuários.
    *   **Habilitar/Desabilitar Registro:** Alterne "Registro de usuários" para habilitar ou desabilitar o registro de usuários.
    * **Habilitar/Desabilitar logout:** Alterne "Logout de usuários" para habilitar ou desabilitar o logout de usuários.
    *   **Salvar:** Clique em "Salvar configuração" para salvar suas configurações de usuário.
4. **Validação:** A página possui um sistema de validação para verificar se você preencheu todos os campos corretamente.
5. **Endpoint:** Na aba "Endpoint" você pode criar o seu endpoint customizado.

### Gerenciar Dados

![Lista de Itens no DirrochaCMS](/images/6.png)
![Criar Item no DirrochaCMS](/images/7.png)

1.  **Acessar um Endpoint:** Vá para a página inicial e clique em um endpoint existente.
2.  **Adicionar Novos Dados:** Clique no botão "Adicionar" para adicionar uma nova entrada de dados.
3.  **Editar Dados:** Clique em uma entrada de dados existente para editá-la.
4.  **Excluir Dados:** Ao editar uma entrada de dados, você encontrará uma opção para excluí-la.

**Exemplos de Requisições de API:**

Aqui estão alguns exemplos de como interagir com seus endpoints de API personalizados:

*   **GET Todos os Posts:**

    ```bash
    curl -X GET http://0.0.0.0:3000/api/posts
    ```

    **Resposta Esperada:**

    ```json
    [
      {
        "id": "123",
        "title": "Primeiro Post",
        "content": "Conteúdo do primeiro post",
        "author": "John Doe"
      },
      {
        "id": "456",
        "title": "Segundo Post",
        "content": "Conteúdo do segundo post",
        "author": "Jane Smith"
      }
    ]
    ```

*   **POST Um Novo Post:**

    ```bash
    curl -X POST \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Novo Post do Blog",
        "content": "Este é o conteúdo do novo post do blog.",
        "author": "Seu Nome"
      }' \
      http://0.0.0.0:3000/api/posts
    ```

    **Resposta Esperada:**

    ```json
    {
      "id": "789",
      "title": "Novo Post do Blog",
      "content": "Este é o conteúdo do novo post do blog.",
      "author": "Seu Nome"
    }
    ```

*   **PUT (Atualizar) um Post Existente:**

    ```bash
    curl -X PUT \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Título Atualizado do Post do Blog",
        "content": "Este é o conteúdo atualizado."
      }' \
      http://0.0.0.0:3000/api/posts/789
    ```

*   **DELETE um Post:**

    ```bash
    curl -X DELETE http://0.0.0.0:3000/api/posts/789
    ```

**Exemplos de Requisições de Autenticação**

*   **Login de Usuário:**
    ```bash
    curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "email":"teste@teste.com" ,
    "password":"senha123"
    }' \
    http://0.0.0.0:3000/api/user/login
    ```

    **Resposta Esperada:**

    ```json
    {
      "token": "..."
    }
    ```

*   **Registrar Usuário:**
    ```bash
    curl -X POST \
    -H "Content-Type: application/json" \
    -d '{
    "name":"teste",
    "email":"teste@teste.com" ,
    "password":"senha123"
    }' \
    http://0.0.0.0:3000/api/user/register
    ```

    **Resposta Esperada:**

    ```json
    {
      "token": "..."
    }
    ```

*   **Logout de Usuário:**
    ```bash
    curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciO..."\
    http://0.0.0.0:3000/api/user/logout
    ```

    **Resposta Esperada:**

    ```json
    {
      "message": "Token invalidado com sucesso."
    }
    ```

## 📁 Estrutura de Diretórios

