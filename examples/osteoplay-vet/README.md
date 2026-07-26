# OsteoPlay Vet Case Study

This case study documents a real student-project use of DirrochaCMS. It is
included as evidence for the JOSS framing of DirrochaCMS as a lightweight
serverless backend architecture for small academic applications.

## Context

OsteoPlay Vet is an undergraduate veterinary medicine capstone project from
UNAMA Parque Shopping, in Belem, Para, Brazil. The written TCC was produced by
veterinary medicine students. Computer science students did not participate in
writing the TCC; their role was implementing the application code. The frontend
is a React/Vite educational platform for osteology learning, deployed as a
static site on Netlify. DirrochaCMS was used as the backend so the project team
could edit educational content without implementing a custom CRUD backend for
every content type.

Public application metadata in the frontend references:

- Frontend: `https://osteoplayvet.netlify.app/`
- Backend API: `https://api-osteoplay-vet.netlify.app/`

## TCC Participants

The TCC participants were:

| Name | Role |
| --- | --- |
| Ana Luísa Bagot | Undergraduate student in Veterinary Medicine |
| Érika Kamyla Nogueira Raniéri | Undergraduate student in Veterinary Medicine |
| Raissa Sawada Cutrim Gutierrez | Undergraduate student in Veterinary Medicine |

## How the Frontend Consumes DirrochaCMS

The frontend keeps the backend integration in small service files:

- `services/QuestionsService.ts` fetches bone-identification records.
- `services/QuizQuestionsService.ts` fetches multiple-choice quiz records.
- `services/ProjectInfoService.ts` fetches descriptive project information.
- `screens/PDFViewerScreen.tsx` fetches a CMS item containing the Google Drive
  atlas link, then converts it to preview and download URLs.

Each service requests a generated HTTP endpoint, validates the response status,
caches successful responses in memory, and maps CMS item data to the frontend's
local TypeScript types.

## Data Model Observed

The Firebase/Firestore database used by the TCC deployment contained:

| Collection | Count | Notes |
| --- | ---: | --- |
| `endpoint` | 6 | Endpoint definitions managed by DirrochaCMS |
| `itens` | 66 | Content records; 62 attached to active endpoints and 4 orphaned |
| `users` | 1 | Administrative panel account |

Active endpoint schemas:

| Logical endpoint | Fields | Records | Frontend use |
| --- | --- | ---: | --- |
| `game_osso_iniciante` | `nome`, `dica`, `imagem` | 10 | Beginner bone-identification game |
| `game_osso_desafiante` | `nome`, `dica`, `imagem` | 10 | Challenging bone-identification game |
| `game_perguntas_iniciante` | `pergunta`, `op_a`, `op_b`, `op_c`, `op_d`, `op_correta` | 20 | Beginner multiple-choice quiz |
| `game_perguntas_desafiante` | `pergunta`, `op_a`, `op_b`, `op_c`, `op_d`, `op_correta` | 20 | Challenging multiple-choice quiz |
| `sobre_projeto` | `objetivo_academico`, `metologia`, `detalhamento` | 1 | About/project information screen |
| `pdf-link-google-docs` | `link` | 1 | Atlas PDF viewer |

The deployed historical API used route IDs such as `/api/endpoint/<id>` and
`/api/itens/<itemId>`. The current DirrochaCMS workflow exposes equivalent
content through endpoints configured in `/configuration` and consumed from
`/api/[endpoint]`.

## Visual Evidence

The repository includes screenshots for this case study in
`docs/evidence/osteoplay-vet`: landing page, resource cards, about/project
screen, difficulty selection, and gameplay screen.

## Why This Matters

This case demonstrates the intended use of DirrochaCMS:

- the student team could keep the frontend focused on learning interactions;
- content changes could happen through the CMS instead of source-code edits;
- the backend ran on serverless hosting with Firestore persistence;
- the browser consumed only generated HTTP APIs, not Firebase credentials.

## Citation and Preservation

This case may be cited publicly, including the project name, public URLs, listed
student names, and UNAMA Parque Shopping. Supervisors and course instructors are
not listed because the project is cited as a use case. Archived screenshots or
a preserved demo should be kept so the evidence remains available if the live
site goes offline.

The observed Firestore counts should be refreshed if the backend continues to
receive edits.
