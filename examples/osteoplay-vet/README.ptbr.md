# Estudo de Caso OsteoPlay Vet

Este estudo de caso documenta um uso real do DirrochaCMS em um projeto
estudantil. Ele é incluído como evidência para o enquadramento do DirrochaCMS na
JOSS como uma arquitetura serverless leve para backends de pequenas aplicações
acadêmicas.

## Contexto

O OsteoPlay Vet é um TCC de Medicina Veterinária da UNAMA Parque Shopping, em
Belém, Pará, Brasil. A escrita do TCC foi feita por estudantes de Medicina
Veterinária. Os estudantes de Ciência da Computação não participaram da escrita
do TCC; o papel deles foi implementar o código da aplicação. O frontend é uma
plataforma educacional em React/Vite para aprendizagem de osteologia,
implantada como site estático na Netlify. O DirrochaCMS foi usado como backend
para que a equipe pudesse editar conteúdo educacional sem implementar um
backend CRUD customizado para cada tipo de conteúdo.

Metadados públicos da aplicação no frontend referenciam:

- Frontend: `https://osteoplayvet.netlify.app/`
- API backend: `https://api-osteoplay-vet.netlify.app/`

## Participantes do TCC

As participantes do TCC foram:

| Nome | Papel |
| --- | --- |
| Ana Luísa Bagot | Graduanda em Medicina Veterinária |
| Érika Kamyla Nogueira Raniéri | Graduanda em Medicina Veterinária |
| Raissa Sawada Cutrim Gutierrez | Graduanda em Medicina Veterinária |

## Como o Frontend Consome o DirrochaCMS

O frontend mantém a integração com o backend em pequenos arquivos de serviço:

- `services/QuestionsService.ts` busca registros de identificação de ossos.
- `services/QuizQuestionsService.ts` busca registros de quiz de múltipla escolha.
- `services/ProjectInfoService.ts` busca informações descritivas do projeto.
- `screens/PDFViewerScreen.tsx` busca um item do CMS contendo o link do atlas no
  Google Drive e converte esse link para URLs de visualização e download.

Cada serviço requisita um endpoint HTTP gerado, valida o status da resposta,
mantém respostas bem-sucedidas em cache em memória e mapeia os dados dos itens
do CMS para os tipos TypeScript locais do frontend.

## Modelo de Dados Observado

A base Firebase/Firestore usada pela implantação do TCC continha:

| Coleção | Quantidade | Notas |
| --- | ---: | --- |
| `endpoint` | 6 | Definições de endpoint gerenciadas pelo DirrochaCMS |
| `itens` | 66 | Registros de conteúdo; 62 ligados a endpoints ativos e 4 órfãos |
| `users` | 1 | Conta administrativa do painel |

Schemas de endpoints ativos:

| Endpoint lógico | Campos | Registros | Uso no frontend |
| --- | --- | ---: | --- |
| `game_osso_iniciante` | `nome`, `dica`, `imagem` | 10 | Jogo iniciante de identificação de ossos |
| `game_osso_desafiante` | `nome`, `dica`, `imagem` | 10 | Jogo desafiante de identificação de ossos |
| `game_perguntas_iniciante` | `pergunta`, `op_a`, `op_b`, `op_c`, `op_d`, `op_correta` | 20 | Quiz iniciante de múltipla escolha |
| `game_perguntas_desafiante` | `pergunta`, `op_a`, `op_b`, `op_c`, `op_d`, `op_correta` | 20 | Quiz desafiante de múltipla escolha |
| `sobre_projeto` | `objetivo_academico`, `metologia`, `detalhamento` | 1 | Tela de informações sobre o projeto |
| `pdf-link-google-docs` | `link` | 1 | Visualizador do atlas em PDF |

A API histórica implantada usava IDs de rota como `/api/endpoint/<id>` e
`/api/itens/<itemId>`. O fluxo atual do DirrochaCMS expõe conteúdo equivalente
por endpoints configurados em `/configuration` e consumidos a partir de
`/api/[endpoint]`.

## Evidência Visual

O repositório inclui um inventário de evidências visuais deste estudo de caso em
`docs/evidence/osteoplay-vet`. Ele documenta capturas da tela inicial, cards de
recursos, tela sobre o projeto, seleção de dificuldade e tela de gameplay. Os
arquivos PNG estão arquivados nessa pasta.

## Por Que Isso Importa

Este caso demonstra o uso pretendido do DirrochaCMS:

- a equipe estudantil pôde manter o frontend focado nas interações de aprendizagem;
- mudanças de conteúdo puderam acontecer pelo CMS em vez de edições no código-fonte;
- o backend rodou em hospedagem serverless com persistência no Firestore;
- o navegador consumiu apenas APIs HTTP geradas, sem credenciais do Firebase.

## Citação e preservação

Este caso pode ser citado publicamente, incluindo nome do projeto, URLs
públicas, nomes das estudantes listadas e UNAMA Parque Shopping. Orientadores e
docentes da disciplina não são listados porque o projeto é citado como caso de
uso. Capturas de tela ou uma demo arquivada devem ser mantidas para preservar a
evidência caso o site saia do ar.

As contagens observadas no Firestore devem ser atualizadas se o backend
continuar recebendo edições.
