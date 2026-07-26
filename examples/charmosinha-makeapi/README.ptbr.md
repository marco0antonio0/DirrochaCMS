# Estudo de Caso Charmosinha / MakeAPI

Este estudo de caso documenta uma demonstração em sala de aula do DirrochaCMS
sob o codinome MakeAPI.

## Contexto

Charmosinha é um catálogo básico de e-commerce criado para demonstrar a
aplicabilidade da separação entre frontend e backend para estudantes de Ciência
da Computação em uma disciplina de Engenharia de Software da UNAMA Parque
Shopping, em Belém, Pará, Brasil. O site e o backend foram criados
exclusivamente para fins de aprendizado e podem ser citados publicamente. Eles
não têm caráter comercial nem profissional e podem sair do ar a qualquer
momento. O nome da plataforma, imagens, nomes de produtos e conteúdos exibidos
na loja são fictícios e foram usados apenas para fins educacionais.

## Desenvolvedores

A demonstração Charmosinha/MakeAPI foi desenvolvida por:

| Nome | Link |
| --- | --- |
| Marco Antonio da Silva Mesquita |  |
| Alexsandro Fernandes Nascimento |  |
| Gabriel Henrique Pinheiro Maia | <https://www.linkedin.com/in/gabrielhpmaia/> |
| Beatriz Rocha Lisboa |  |

O projeto usou:

- um frontend de loja em Next.js;
- um backend serverless DirrochaCMS implantado como MakeAPI;
- persistência no Firestore;
- endpoints HTTP gerados e consumidos pelo frontend;
- links de WhatsApp para encaminhamento de pedidos em vez de um backend de
  pagamento online.

Metadados públicos da aplicação no frontend referenciam:

- Frontend: `https://charmosinha.netlify.app/`
- API backend: `https://api-charmosinha.netlify.app/`

## Como o Frontend Consome o DirrochaCMS

A integração do frontend fica concentrada em dois módulos pequenos:

- `lib/products.ts` busca produtos no CMS, mapeia registros de itens do CMS para
  o tipo local `Product`, filtra produtos por categoria e busca categorias.
- `lib/store-info.ts` busca o primeiro registro de informações da loja e expõe
  WhatsApp, telefone e texto sobre a loja para o storefront.

O código atual consome:

- `/api/endpoint/yUeLxgrmtSOKU8joYhJF` para produtos;
- `/api/endpoint/nAZdbrp0Nfk1NXknU16J` para categorias;
- `/api/endpoint/NygKm957MaH6e8y5qLyL` para informações da loja.

O README do projeto também referencia um ID antigo de endpoint de produtos,
`Az2YrSZjvVgj3USlfCJO`, que agora retorna `404`. O código-fonte atual usa o
endpoint `produto-v2` listado abaixo.

## Modelo de Dados Observado

A base Firebase/Firestore usada pela demonstração continha:

| Coleção | Quantidade | Notas |
| --- | ---: | --- |
| `endpoint` | 4 | Definições de endpoint gerenciadas pelo DirrochaCMS/MakeAPI |
| `itens` | 19 | Registros de conteúdo; 17 ligados a definições atuais de endpoint e 2 órfãos |
| `users` | 1 | Conta administrativa do painel |

Schemas de endpoints ativos:

| Endpoint lógico | Campos | Registros | Uso no frontend |
| --- | --- | ---: | --- |
| `produto-v2` | `titulo`, `preco`, `imagem`, `categoria` | 12 | Catálogo de produtos |
| `categorias` | `nome` | 3 | Navegação e filtragem por categorias |
| `informacao` | `whatsapp`, `telefone`, `sobre` | 1 | Dados de contato e descrição da loja |
| `fase-iniciante-osso` | `text`, `image` | 1 | Endpoint restante de demonstração, não consumido pelo storefront |

Dois registros órfãos ainda estavam associados ao ID antigo de endpoint de
produtos documentado no README do projeto.

## Evidência Visual

O repositório inclui um inventário de evidências visuais deste estudo de caso em
`docs/evidence/charmosinha-makeapi`. Ele documenta capturas da tela inicial da
loja e da grade de produtos. Os arquivos PNG estão arquivados nessa pasta.

## Por Que Isso Importa

Esta demonstração é uma evidência útil para o DirrochaCMS porque mostra a
ferramenta em contexto de ensino:

- estudantes conseguem ver um frontend consumindo APIs HTTP reais sem escrever
  primeiro um backend completo;
- o modelo de dados pode ser alterado por um painel durante a demonstração;
- campos de imagem e número podem ser expostos a uma loja sem acesso direto ao
  Firestore pelo navegador;
- o deploy pode permanecer de baixo custo usando Netlify e Firestore.

## Citação e preservação

Este caso pode ser citado como uma demonstração pública voltada ao aprendizado.
Como o site e o backend não são sistemas comerciais nem profissionais, as URLs
públicas devem ser tratadas como evidência temporária e podem ficar
indisponíveis. Capturas de tela ou uma demo arquivada devem ser mantidas junto
das URLs ativas, e as contagens observadas no Firestore devem ser atualizadas se
o backend continuar recebendo edições.
