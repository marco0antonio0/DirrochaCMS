# Caso de Backend para Grupo de Pesquisa da UFPA

Este caso documenta um uso leve do DirrochaCMS por um grupo de pesquisa da
Universidade Federal do Pará (UFPA).

## Cenário

Um grupo de pesquisa da UFPA utilizou o DirrochaCMS para apoiar uma plataforma
web que exibia informações do projeto para outros pesquisadores e pessoas
interessadas em participar. A plataforma era usada para comunicar dados como
informações de planejamentos semestrais e contexto geral de participação no
projeto.

O DirrochaCMS foi útil nesse cenário porque o grupo precisava de um backend
editável para publicar informações estruturadas sem manter um servidor backend
dedicado. A ferramenta funcionou como uma camada leve de conteúdo/API por trás
da plataforma web.

## Limites de Divulgação

Esse foi um projeto de terceiro, e não há contato direto atual com os
responsáveis pelo projeto. Por esse motivo, este caso intencionalmente não
inclui detalhes estruturais de implementação, schemas de endpoints, contagens de
banco de dados, links de repositório, capturas de tela ou nomes internos do
projeto.

O caso deve ser citado apenas em alto nível: um grupo de pesquisa da UFPA usou o
DirrochaCMS para publicar informações editáveis de projeto e planejamento por
meio de uma plataforma web.

## Análogo Reprodutível

Como os detalhes da implementação original não podem ser divulgados, o análogo
reprodutível mais próximo é criar endpoints informacionais gerais em uma nova
implantação do DirrochaCMS:

| Endpoint | Campos | Uso |
| --- | --- | --- |
| `planning` | `titulo`, `semestre`, `descricao`, `data` | Informações de planejamento semestral |
| `participation` | `titulo`, `descricao`, `link` | Informações para pessoas interessadas em participar |
| `updates` | `titulo`, `data`, `descricao` | Atualizações do projeto para pesquisadores |

Exemplos de chamadas de API pública para o análogo:

```bash
curl http://localhost:3000/api/planning
curl http://localhost:3000/api/participation
```

Para um endpoint protegido, envie a senha configurada em um header:

```bash
curl http://localhost:3000/api/internal_notes \
  -H "x-endpoint-password: YOUR_ENDPOINT_PASSWORD"
```

## Uso como evidência de impacto

Este caso pode apoiar a narrativa de impacto em pesquisa, mas não deve ser usado
como uma alegação detalhada de reprodutibilidade a menos que o contato com os
responsáveis pelo projeto seja retomado.

Detalhes adicionais só devem ser adicionados se for possível confirmar:

- o nome público do projeto;
- permissão para citar capturas de tela ou links;
- schemas de endpoints ou detalhes de implementação;
- detalhes de deploy e contagens do banco.
