# JOSS Readiness Plan

> **Status: working draft.** This document, the paper under `paper/`, and the README
> files are drafts under active revision. They are not a final version, and the wording,
> structure and framing are still being reviewed. Generative AI tools were used as
> writing and coding assistants; see the AI usage disclosure in `paper/paper.md`.

This document summarizes the repository material prepared for submitting
DirrochaCMS to the Journal of Open Source Software (JOSS).

## Submission Focus

DirrochaCMS is framed as:

> DirrochaCMS is a lightweight serverless backend architecture for small
> research groups, undergraduate student teams, and applied projects that need
> editable APIs without maintaining dedicated backend infrastructure.

The research-software contribution is the low-cost, serverless, configurable
backend pattern for lightweight academic applications.

## Scope Validation

DirrochaCMS matches the core JOSS expectations because:

- it is open-source software hosted in a public Git repository;
- it has an academic/research application: lightweight editable backends for
  research groups, undergraduate projects, classroom demonstrations, and applied
  academic platforms;
- the repository includes the software, documentation, citation metadata, and a
  JOSS paper;
- the paper does not present new scientific results as the contribution; it
  presents the software and its research/teaching use cases;
- real use cases have been documented: a UFPA research-group platform,
  OsteoPlay Vet, and Charmosinha/MakeAPI.

The repository includes both CI and a manual verification guide so reviewers can
check the build and the main user-facing flows.

## Submission Files

- `README.md`: English documentation (installation, usage, API, security).
- `README.pt-BR.md`: Portuguese documentation, kept in sync with the English one.
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`: community documents in English,
  each with a `.pt-BR.md` counterpart. English is the primary version so reviewers can
  read them directly; the Portuguese versions must be updated in the same pull request.
- `paper/paper.md`: JOSS paper for the official English submission, within the
  current JOSS word-count guidance.
- `paper/paper.ptbr.md`: Portuguese version of the paper.
- `paper/paper.bib`: bibliography.
- `CITATION.cff`: citation metadata.
- `CHANGELOG.md`: release notes.
- `examples/research-group-backend/README.md`: reproducible research-group scenario.
- `examples/osteoplay-vet/README.md`: documented real TCC case study.
- `examples/charmosinha-makeapi/README.md`: documented classroom demonstration case study.
- `.github/workflows/ci.yml`: GitHub Actions workflow for dependency install,
  type checking, automated tests, and production build.
- `docs/manual-verification.md`: manual verification checklist.
- `docs/manual-verification.ptbr.md`: Portuguese version of the manual
  verification checklist.
- `docs/joss-readiness.ptbr.md`: Portuguese version of this submission plan.
- `docs/evidence/osteoplay-vet/README.md`: screenshot inventory for the
  OsteoPlay Vet case.
- `docs/evidence/charmosinha-makeapi/README.md`: screenshot inventory for the
  Charmosinha/MakeAPI case.

## Use Cases

The UFPA research-group case provides a high-level research-use example:

- A research group from the Federal University of Para (UFPA) used DirrochaCMS
  to display project information in a web platform.
- The platform communicated information such as semester planning data to other
  researchers and people interested in participating in the project.
- Because this was a third-party project and there is no current direct contact
  with the project stakeholders, no endpoint schemas, implementation details,
  screenshots, repository links, deployment details, or database counts are
  documented.
- This case should be cited as a high-level impact example, not as a detailed
  reproducibility case.

The OsteoPlay Vet TCC project provides a concrete student-project example:

- React/Vite educational frontend for veterinary osteology learning.
- Veterinary medicine TCC at UNAMA Parque Shopping, Belem, Para, Brazil.
- The written TCC was produced by veterinary medicine students; computer science
  students implemented the application code and did not participate in writing
  the TCC.
- The project name, public URLs, listed student names, and UNAMA Parque Shopping
  may be cited publicly.
- TCC participants:
  - Ana Luísa Bagot, undergraduate student in Veterinary Medicine.
  - Érika Kamyla Nogueira Raniéri, undergraduate student in Veterinary Medicine.
  - Raissa Sawada Cutrim Gutierrez, undergraduate student in Veterinary
    Medicine.
- Static frontend deployed at `https://osteoplayvet.netlify.app/`.
- DirrochaCMS backend deployed at `https://api-osteoplay-vet.netlify.app/`.
- Frontend service files consume generated CMS HTTP APIs for games, quizzes,
  project information, and an atlas PDF link.
- Firestore inspection found 6 endpoint documents, 66 item documents, and 1
  admin user document; 62 item documents were attached to active endpoints.
- Screenshots are archived in
  `docs/evidence/osteoplay-vet` for the landing page, resources section,
  about/project screen, difficulty selection, and gameplay.

Active endpoint schemas observed:

| Endpoint | Records | Purpose |
| --- | ---: | --- |
| `game_osso_iniciante` | 10 | Beginner bone-identification game |
| `game_osso_desafiante` | 10 | Challenging bone-identification game |
| `game_perguntas_iniciante` | 20 | Beginner multiple-choice quiz |
| `game_perguntas_desafiante` | 20 | Challenging multiple-choice quiz |
| `sobre_projeto` | 1 | About/project information |
| `pdf-link-google-docs` | 1 | Atlas PDF link |

The Charmosinha/MakeAPI project provides a classroom demonstration example:

- Next.js storefront created to demonstrate backend/frontend applicability for
  computer science students in a software engineering discipline at UNAMA Parque
  Shopping, Belem, Para, Brazil.
- DirrochaCMS was used under the codename MakeAPI.
- The site and backend were created exclusively for learning purposes, may be
  publicly cited, and may go offline at any time because they are not commercial
  or professional production systems.
- The platform name, images, product names, and storefront content are
  fictional and were used only for learning/educational purposes in the software
  engineering discipline.
- Developers: Marco Antonio da Silva Mesquita, Alexsandro Fernandes Nascimento,
  Gabriel Henrique Pinheiro Maia, and Beatriz Rocha Lisboa.
- Static/storefront frontend metadata references `https://charmosinha.netlify.app/`.
- Backend API deployed at `https://api-charmosinha.netlify.app/`.
- Firestore inspection found 4 endpoint documents, 19 item documents, and 1
  admin user document; 17 item documents were attached to current endpoint
  definitions and 2 were orphaned from an older product endpoint.
- Screenshots are archived in
  `docs/evidence/charmosinha-makeapi` for the storefront landing page and
  product grid.

Active Charmosinha endpoint schemas observed:

| Endpoint | Records | Purpose |
| --- | ---: | --- |
| `produto-v2` | 12 | Product catalog |
| `categorias` | 3 | Category navigation and filtering |
| `informacao` | 1 | Contact data and store description |
| `fase-iniciante-osso` | 1 | Leftover demonstration endpoint, not consumed by storefront |

## Verification

The repository includes objective verification:

- GitHub Actions running `npm ci`, `npx tsc --noEmit`, `npm test`, and
  `npm run build`.
- A manual verification checklist in `docs/manual-verification.md`.

Recommended future work:

- broader integration tests for endpoint creation, auth, and public API access.

Current CI:

```yaml
npm ci
npx tsc --noEmit
npm test
npm run build
```

## Release and Archiving

The JOSS submission is prepared around a versioned release of DirrochaCMS. After
review, the accepted release should be archived in Zenodo/Figshare and the
archive DOI recorded in `CITATION.cff` and in the JOSS submission metadata. The
archive DOI is not listed in `paper/paper.bib` because the paper does not cite
itself.
