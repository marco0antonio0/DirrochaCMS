# Plano de Preparação para JOSS

> **Status: rascunho em revisão.** Este documento, o artigo em `paper/` e os
> READMEs estão em revisão ativa. Ainda não são versões finais, e redação,
> estrutura e enquadramento seguem em ajuste. Ferramentas de IA generativa foram
> usadas como assistentes de escrita e código; veja a declaração de uso de IA em
> `paper/paper.ptbr.md`.

Este documento resume os materiais do repositório preparados para submeter o
DirrochaCMS ao Journal of Open Source Software (JOSS).

## Foco da Submissão

O DirrochaCMS é enquadrado como:

> DirrochaCMS é uma arquitetura backend serverless leve para pequenos grupos de
> pesquisa, equipes estudantis de graduação e projetos aplicados que precisam de
> APIs editáveis sem manter infraestrutura backend dedicada.

A contribuição como software de pesquisa está no padrão de backend configurável,
serverless e de baixo custo para aplicações acadêmicas leves.

## Validação de Escopo

O DirrochaCMS atende às expectativas centrais da JOSS porque:

- é software open source hospedado em um repositório Git público;
- tem aplicação acadêmica/de pesquisa: backends editáveis leves para grupos de
  pesquisa, projetos de graduação, demonstrações em sala e plataformas
  acadêmicas aplicadas;
- o repositório inclui software, documentação, metadados de citação e artigo
  JOSS;
- o artigo não apresenta novos resultados científicos como contribuição; ele
  apresenta o software e seus casos de uso em pesquisa/ensino;
- há casos reais documentados: uma plataforma de grupo de pesquisa da UFPA,
  OsteoPlay Vet e Charmosinha/MakeAPI.

O repositório inclui CI e roteiro de verificação manual para que revisores
possam checar o build e os principais fluxos de uso.

## Arquivos de Submissão

- `README.md`: documentação em inglês (instalação, uso, API e segurança).
- `README.pt-BR.md`: documentação em português, mantida em sincronia com a
  versão em inglês.
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`: documentos de
  comunidade em inglês, cada um com contraparte `.pt-BR.md`.
- `paper/paper.md`: artigo JOSS para submissão oficial em inglês, dentro da
  orientação atual de contagem de palavras.
- `paper/paper.ptbr.md`: versão em português do artigo.
- `paper/paper.bib`: bibliografia.
- `CITATION.cff`: metadados de citação.
- `CHANGELOG.md`: notas de release.
- `examples/research-group-backend/README.md`: cenário reprodutível do caso de
  grupo de pesquisa.
- `examples/osteoplay-vet/README.md`: estudo de caso real de TCC.
- `examples/charmosinha-makeapi/README.md`: estudo de caso de demonstração em
  sala de aula.
- `.github/workflows/ci.yml`: GitHub Actions para instalação de dependências,
  checagem de tipos, testes automatizados e build de produção.
- `docs/manual-verification.md`: roteiro de verificação manual.
- `docs/manual-verification.ptbr.md`: versão em português do roteiro de
  verificação manual.
- `docs/evidence/osteoplay-vet/README.md`: inventário de capturas do caso
  OsteoPlay Vet.
- `docs/evidence/charmosinha-makeapi/README.md`: inventário de capturas do caso
  Charmosinha/MakeAPI.

## Casos de Uso

O caso do grupo de pesquisa da UFPA fornece um exemplo acadêmico em alto nível:

- Um grupo de pesquisa da Universidade Federal do Pará (UFPA) usou o
  DirrochaCMS para exibir informações de projeto em uma plataforma web.
- A plataforma comunicava informações como dados de planejamento semestral para
  outros pesquisadores e pessoas interessadas em participar do projeto.
- Como esse foi um projeto de terceiro e não há contato direto atual com os
  responsáveis, não são documentados schemas de endpoints, detalhes de
  implementação, capturas, links de repositório, detalhes de deploy ou contagens
  de banco de dados.
- Esse caso deve ser citado como exemplo de impacto em alto nível, não como caso
  detalhado de reprodutibilidade.

O projeto OsteoPlay Vet fornece um exemplo concreto de projeto estudantil:

- Frontend educacional React/Vite para aprendizagem de osteologia veterinária.
- TCC de Medicina Veterinária na UNAMA Parque Shopping, Belém, Pará, Brasil.
- O TCC escrito foi produzido por estudantes de Medicina Veterinária; estudantes
  de Ciência da Computação implementaram o código da aplicação e não
  participaram da escrita do TCC.
- O nome do projeto, URLs públicas, nomes das estudantes listadas e UNAMA Parque
  Shopping podem ser citados publicamente.
- Participantes do TCC:
  - Ana Luísa Bagot, graduanda em Medicina Veterinária.
  - Érika Kamyla Nogueira Raniéri, graduanda em Medicina Veterinária.
  - Raissa Sawada Cutrim Gutierrez, graduanda em Medicina Veterinária.
- Frontend estático implantado em `https://osteoplayvet.netlify.app/`.
- Backend DirrochaCMS implantado em `https://api-osteoplay-vet.netlify.app/`.
- Arquivos de serviço do frontend consomem APIs HTTP geradas pelo CMS para
  jogos, quizzes, informações do projeto e link de atlas em PDF.
- Inspeção do Firestore encontrou 6 documentos de endpoint, 66 documentos de
  itens e 1 documento de usuário administrador; 62 documentos de itens estavam
  ligados a endpoints ativos.
- Capturas estão arquivadas em `docs/evidence/osteoplay-vet`.

Schemas ativos observados:

| Endpoint | Registros | Finalidade |
| --- | ---: | --- |
| `game_osso_iniciante` | 10 | Jogo iniciante de identificação de ossos |
| `game_osso_desafiante` | 10 | Jogo desafiante de identificação de ossos |
| `game_perguntas_iniciante` | 20 | Quiz iniciante de múltipla escolha |
| `game_perguntas_desafiante` | 20 | Quiz desafiante de múltipla escolha |
| `sobre_projeto` | 1 | Informações sobre o projeto |
| `pdf-link-google-docs` | 1 | Link do atlas em PDF |

O projeto Charmosinha/MakeAPI fornece um exemplo de demonstração em sala:

- Loja Next.js criada para demonstrar a aplicabilidade backend/frontend para
  estudantes de Ciência da Computação em disciplina de Engenharia de Software da
  UNAMA Parque Shopping, Belém, Pará, Brasil.
- O DirrochaCMS foi usado sob o codinome MakeAPI.
- Site e backend foram criados exclusivamente para aprendizado, podem ser
  citados publicamente e podem sair do ar a qualquer momento por não serem
  sistemas comerciais ou profissionais.
- Nome da plataforma, imagens, nomes de produtos e conteúdo da loja são
  fictícios e usados apenas para fins educacionais.
- Desenvolvedores: Marco Antonio da Silva Mesquita, Alexsandro Fernandes
  Nascimento, Gabriel Henrique Pinheiro Maia e Beatriz Rocha Lisboa.
- Metadados do frontend referenciam `https://charmosinha.netlify.app/`.
- API backend implantada em `https://api-charmosinha.netlify.app/`.
- Inspeção do Firestore encontrou 4 documentos de endpoint, 19 documentos de
  itens e 1 documento de usuário administrador; 17 documentos de itens estavam
  ligados às definições atuais de endpoint e 2 eram órfãos de um endpoint antigo.
- Capturas estão arquivadas em `docs/evidence/charmosinha-makeapi`.

Schemas ativos observados:

| Endpoint | Registros | Finalidade |
| --- | ---: | --- |
| `produto-v2` | 12 | Catálogo de produtos |
| `categorias` | 3 | Navegação e filtro por categoria |
| `informacao` | 1 | Contato e descrição da loja |
| `fase-iniciante-osso` | 1 | Endpoint demonstrativo remanescente, não consumido pela loja |

## Verificação

O repositório inclui verificação objetiva:

- GitHub Actions rodando `npm ci`, `npx tsc --noEmit`, `npm test` e
  `npm run build`.
- Roteiro manual de verificação em `docs/manual-verification.md`.

Melhoria futura recomendada:

- testes de integração mais amplos para criação de endpoint, autenticação e
  acesso à API pública.

CI atual:

```yaml
npm ci
npx tsc --noEmit
npm test
npm run build
```

## Release e Arquivamento

A submissão JOSS é preparada em torno de uma release versionada do DirrochaCMS.
Após a revisão, a release aceita deve ser arquivada em Zenodo/Figshare, e o DOI
do arquivo deve ser registrado em `CITATION.cff` e nos metadados da submissão
JOSS. O DOI do arquivo não é listado em `paper/paper.bib` porque o artigo não
cita a si mesmo.
