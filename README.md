# 🚀 DirrochaCMS
![img](/images/login-demo.dirrocha.com%20(1).png)
## 📌 Introdução

O DirrochaCMS é um sistema de gerenciamento de conteúdo (CMS) leve e eficiente, projetado para facilitar a criação de endpoints e o gerenciamento de dados para sites e diversos segmentos. Ele é ideal para desenvolvedores e equipes que buscam uma solução rápida e personalizável para seus projetos web. Nosso objetivo é fornecer uma ferramenta intuitiva que permita gerenciar conteúdo de forma simples e direta, economizando tempo e recursos.

## ✅ Recursos e Funcionalidades

O DirrochaCMS oferece uma variedade de funcionalidades que o tornam uma ferramenta poderosa:

*   **Criação de Endpoints Personalizados:** Permite definir e criar seus próprios endpoints de API para acessar e gerenciar dados.
*   **Gerenciamento de Dados:** Oferece uma interface intuitiva para criar, ler, atualizar e excluir dados (CRUD).
*   **Flexibilidade:** Adapta-se a diferentes tipos de projetos, sejam eles sites simples ou aplicações mais complexas.
*   **Leveza:** Construído com tecnologias de ponta para garantir performance e eficiência.
*   **Fácil Integração:** Integra-se facilmente com outras ferramentas e serviços.

**Exemplo Prático:** Imagine que você precisa de um CMS para um blog. Com o DirrochaCMS, você pode criar endpoints para posts, categorias e autores, gerenciando tudo através de uma interface amigável.

## 🛠️ Tecnologias Utilizadas

*   ✅ **Firebase API:** Utilizado como backend para persistência dos dados e autenticação. Permite escalabilidade e fácil integração.
*   ✅ **Next.js API:** Responsável pela criação dos endpoints de API. Traz performance e um ótimo ambiente de desenvolvimento.
*   ✅ **Next.js:** Framework para a criação da interface da aplicação. Oferece server-side rendering e excelente performance.
*   ✅ **Docker:** Utilizado para containerização, garantindo a portabilidade e consistência da aplicação em diferentes ambientes.
*   ✅ **Docker Compose:** Permite a orquestração de múltiplos containers, simplificando o processo de desenvolvimento e deployment.

## ⚙️ Pré-requisitos e Instalação

Antes de começar, você precisará ter as seguintes ferramentas instaladas:

1.  **Node.js (v16 ou superior):** Necessário para executar o Next.js.

    *   [Download Node.js](https://nodejs.org/)

2.  **npm ou yarn:** Gerenciador de pacotes para instalar as dependências do projeto.
3.  **Docker e Docker Compose:** Para containerizar e orquestrar os serviços da aplicação.

    *   [Instalação Docker](https://docs.docker.com/get-docker/)

### Instalação

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/marco0antonio0/DirrochaCMS
    cd DirrochaCMS
    ```

### **Opções de Deployer:**
#### **Deploy em VPS:**
1.  **Instale as Dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```
2.  **Inicialize a Aplicação:**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
2.  **Build a Aplicação:**
    ```bash
    npm run build
    # ou
    yarn build
    ```
3.  **Iniciando com Docker:**
    ```bash
    docker-compose up -d --build
    ```
    A aplicação estará disponível em `http://localhost:3000`.

#### **Deploy em Netlify ou Vercel:**
1.  **Apenas forneça o arquivo do projeto e pronto:**

## 🚀 Como Usar

1.  **Acesse a Aplicação:** Abra seu navegador e vá para `http://0.0.0.0:3000`.
2.  **Navegação:** A aplicação tem uma interface simples e intuitiva para criação e gerenciamento de dados.
3.  **Criação de Endpoints:** Use a interface para criar seus próprios endpoints, definindo nomes, tipos de dados e outros atributos.
4.  **Gerenciamento de Dados:** Utilize a interface para adicionar, editar, excluir e visualizar seus dados de maneira facil.

**Exemplo de requisição para uma API criada:**
```bash
# Exemplo de requisição POST para criar um novo registro
curl -X GET \
  -H "Content-Type: application/json" \
  http://0.0.0.0:3000/api/posts
```

**Resposta esperada(varia de acordo com campos que deseja incluir):**
```json
{
  "id": "123456",
  "title": "Novo Post",
  "content": "Conteúdo do novo post",
  "author": "Seu Nome"
}
```

<!-- ## 📁 Estrutura de Diretórios

```
dirrochacms/
├── components/         # Componentes reutilizáveis da interface
├── pages/              # Páginas da aplicação Next.js
│   ├── api/            # Endpoints da API
│   │   └── posts.js    # Exemplo de endpoint para posts
│   └── _app.js         # Arquivo de configuração da aplicação Next.js
├── styles/             # Estilos da aplicação
├── public/             # Arquivos públicos (imagens, etc.)
├── .env.local          # Arquivo para variáveis de ambiente
├── package.json        # Arquivo de dependências
├── docker-compose.yml  # Configuração do Docker Compose
└── Dockerfile          # Configuração do Docker
``` -->

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Se você deseja contribuir para o DirrochaCMS, siga estas diretrizes:

1.  **Abra uma Issue:** Antes de começar a trabalhar em uma funcionalidade ou correção, abra uma issue para discutir as mudanças propostas.
2.  **Crie um Branch:** Crie um branch com o nome da issue para suas mudanças.
3.  **Faça um Pull Request:** Após concluir suas mudanças, envie um pull request com uma descrição detalhada.

## 📜 Licença

Este projeto está licenciado sob a licença MIT.

[Licença MIT](https://opensource.org/licenses/MIT)


## Imagem ilustrativa 1
![img](/images/login-demo.dirrocha.com%20(1).png)

## Imagem ilustrativa 2
![img](/images/login-demo.dirrocha.com%20(2).png)

## Imagem ilustrativa Home
![img](/images/4.png)

## Imagem ilustrativa Login
![img](/images/5.png)

## Imagem ilustrativa Listagem de Itens
![img](/images/6.png)

## Imagem ilustrativa Cria Item
![img](/images/7.png)

## Imagem ilustrativa Criar Endpoin
![img](/images/8.png)