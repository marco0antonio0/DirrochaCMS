---
title: "DirrochaCMS: uma arquitetura backend serverless leve para pequenas aplicações de pesquisa e ensino"
tags:
  - serverless
  - backend
  - software de pesquisa
  - gerenciamento de conteúdo
  - Next.js
  - Firebase
authors:
  - name: Marco Antonio da Silva Mesquita
    affiliation: 1
    corresponding: true
    orcid: 0009-0002-9644-4011
affiliations:
  - name: "Graduando em Ciência da Computação, Universidade da Amazônia (UNAMA), Campus Parque Shopping, Belém, Pará, Brasil"
    index: 1
date: 25 July 2026
bibliography: paper.bib
---

> Versão em português de `paper.md`, mantida para leitores lusófonos. A versão submetida ao
> JOSS é a em inglês.

# Resumo

DirrochaCMS é uma aplicação web open source para criar backends HTTP leves sem escrever um
backend dedicado para cada projeto pequeno. Por meio de uma interface administrativa,
usuários definem nomes de endpoints, escolhem campos, gerenciam registros e publicam rotas
de API apoiadas pelo Firestore. Foi projetado para deploy serverless em plataformas como
Vercel ou Netlify, mantendo credenciais de banco de dados e lógica de autorização no
servidor.

O projeto combina uma aplicação Next.js [@nextjs], o Firebase Admin SDK e o Firestore
[@firebase], sessões administrativas, gestão de contas por papéis, proteção por senha em
nível de endpoint, histórico de auditoria e um construtor de esquema configurável. O
objetivo não é substituir plataformas de dados completas, mas reduzir o custo de configurar
backends pequenos que precisam mudar rapidamente durante projetos acadêmicos, estudantis ou
de pesquisa aplicada.

# Declaracao de necessidade

A motivação para o desenvolvimento do DirrochaCMS surgiu a partir de projetos acadêmicos
desenvolvidos entre 2023 e 2024, durante a graduação. Diversos desses projetos necessitavam
apenas de um backend simples, capaz de armazenar, atualizar e disponibilizar dados para
aplicações web. No entanto, cada novo projeto exigia a implementação de autenticação,
integração com banco de dados, APIs e configuração de implantação praticamente do zero,
consumindo mais de uma semana de trabalho antes mesmo do desenvolvimento das funcionalidades
específicas da aplicação.

Inicialmente, foram utilizadas soluções como o Firebase Firestore [@firebase] para reduzir os
custos de infraestrutura, uma vez que os projetos geralmente não possuíam recursos
financeiros para manter servidores ou bancos de dados dedicados. Apesar disso, ainda era
necessário desenvolver grande parte da infraestrutura de backend para cada novo sistema.
Também foram avaliadas alternativas como o Strapi [@strapi], porém sua configuração,
manutenção e limitações para implantação em ambientes serverless tornavam seu uso pouco
adequado para projetos acadêmicos de pequeno porte.

Diante desse cenário, o DirrochaCMS foi concebido como uma ferramenta reutilizável, capaz de
eliminar a necessidade de reconstruir a mesma infraestrutura em cada projeto. A proposta
consiste em permitir que administradores definam e gerenciem registros por meio de uma
interface web, disponibilizando automaticamente endpoints para consulta dos dados, enquanto
toda a lógica administrativa permanece no servidor. Dessa forma, é possível desenvolver
aplicações que necessitam de conteúdo dinâmico utilizando plataformas serverless, como Vercel
e Netlify [@vercel; @netlify], reduzindo significativamente o tempo de configuração e
implantação.

# Estado da arte

Diversas ferramentas maduras atendem necessidades relacionadas. Strapi [@strapi] e Directus
[@directus] oferecem capacidades extensas de CMS headless e de construção de APIs. O CKAN
[@ckan] é amplamente usado para portais de dados abertos, e o Datasette [@datasette] é uma
ferramenta poderosa para publicar e explorar sites apoiados por dados. Esses projetos são
substancialmente mais amplos que o DirrochaCMS e são a escolha certa quando a equipe precisa
de seus ecossistemas, modelos de plugin, suporte a bancos de dados ou recursos de publicação
de dados.

A avaliação descrita acima apontou para um requisito mais estreito: um sistema que uma equipe
pequena consiga implantar numa plataforma serverless, editar por interface web e deixar
rodando sem manutenção entre semestres. Em vez de contribuir com um plugin para um CMS maior,
o DirrochaCMS explora a menor arquitetura de backend útil para contextos em que custo,
velocidade de mudança e manutenção mínima pesam mais que extensibilidade.

# Projeto do software

O trade-off central é entre flexibilidade e simplicidade operacional. Um gerador de backend
totalmente genérico exigiria uma linguagem de esquema complexa, um sistema de migração e
uma abstração de banco de dados. O DirrochaCMS usa, em vez disso, um construtor de
endpoints restrito: cada endpoint tem um nome de rota e um conjunto de campos tipados, e os
registros são armazenados como documentos estruturados. Isso mantém o modelo mental
acessível a equipes não especialistas, sem deixar de produzir APIs HTTP que frontends
externos conseguem consumir.

O código do navegador alcança as rotas de API administrativas por meio de um cookie de sessão
HTTP-only, e essas rotas aplicam autorização antes de chamar os serviços e repositórios do
backend. O acesso ao Firestore passa pelo Firebase Admin SDK, então credenciais do Firebase
nunca são expostas a clientes e as regras de segurança do banco podem negar todo acesso
direto. As rotas públicas de endpoint são a única superfície de API anônima, e endpoints podem
ficar públicos ou protegidos por uma verificação de senha no servidor.

Dispensar um servidor de aplicação dedicado é o que permite o deploy em plataformas que
suportam route handlers do Next.js. O trade-off é concreto: num projeto freelancer de
geolocalização, em que registros de cidades, regiões e dados complexos de contexto precisavam
ser relacionados entre si para produzir uma resposta de saída, o modelo não relacional se
mostrou inadequado e um backend próprio com SQL foi desenvolvido no lugar. O DirrochaCMS
também não se destina a cargas transacionais de alto volume.

# Declaração de impacto em pesquisa

O DirrochaCMS apoiou três cenários acadêmicos documentados. Um grupo de pesquisa da
Universidade Federal do Pará (UFPA) o usou para publicar informações de projeto e de
planejamento semestral para pesquisadores e pessoas interessadas em participar; por ter sido
um deploy de terceiro sem contato atual com os responsáveis, o caso é relatado apenas nesse
nível. O OsteoPlay Vet, trabalho de conclusão de curso de graduação em Medicina Veterinária
na UNAMA Parque Shopping, em Belém, Pará, usou uma instância do DirrochaCMS como backend de
um jogo educativo em React/Vite sobre osteologia; essa instância definia seis endpoints e
guardava 66 registros, 62 deles ligados aos endpoints consumidos pela aplicação. As
estudantes de Medicina Veterinária cadastraram esse conteúdo por conta própria, sem auxílio
dos estudantes de Ciência da Computação que escreveram o código da aplicação. Uma
demonstração didática construída sob o codinome MakeAPI mostrou a estudantes de Ciência da
Computação, na disciplina de Engenharia de Software, como um frontend Next.js consome um
backend configurável; esse backend tinha quatro endpoints e 19 registros, e todo o seu
conteúdo era fictício e usado exclusivamente para ensino.

Essa divisão de trabalho é o fluxo que o software busca: quem não trabalha no backend é dono
do conteúdo, enquanto a aplicação permanece um frontend estático pequeno consumindo rotas de
API serverless. O repositório documenta os casos em `examples/`, incluindo os esquemas de
endpoint observados, os serviços de frontend que consomem a API e capturas de tela
arquivadas.

# Divulgacao de uso de IA

Ferramentas de IA generativa foram usadas como assistentes neste projeto. No software,
contribuíram com código-fonte nas camadas de API administrativa e de autorização, revisado
pelo autor antes da integração. Neste artigo, auxiliaram na redação e na estrutura; a
motivação, a justificativa de projeto, os fatos dos estudos de caso e os limites relatados
são do próprio autor, e esta versão em português preserva a redação original do autor na
declaração de necessidade. O autor é o único autor deste trabalho e é responsável por todas
as afirmações, referências e descrições técnicas.

# Agradecimentos

O autor agradece às participantes do TCC OsteoPlay Vet Ana Luísa Bagot, Érika Kamyla
Nogueira Raniéri e Raissa Sawada Cutrim Gutierrez; aos estudantes de Ciência da Computação
que implementaram o código da aplicação do OsteoPlay Vet; aos desenvolvedores do
Charmosinha/MakeAPI Alexsandro Fernandes Nascimento, Gabriel Henrique Pinheiro Maia e
Beatriz Rocha Lisboa; e aos usuários do grupo de pesquisa da UFPA, cujas necessidades
práticas motivaram o desenvolvimento do DirrochaCMS. Este trabalho não recebeu
financiamento externo.

# Referencias
