---
title: "DirrochaCMS: a lightweight serverless backend architecture for small research and student applications"
tags:
  - serverless
  - backend
  - research software
  - content management
  - Next.js
  - Firebase
authors:
  - name: Marco Antonio da Silva Mesquita
    affiliation: 1
    corresponding: true
    orcid: 0009-0002-9644-4011
affiliations:
  - name: "Computer Science undergraduate student, Universidade da Amazonia (UNAMA), Campus Parque Shopping, Belem, Para, Brazil"
    index: 1
date: 25 July 2026
bibliography: paper.bib
---

# Summary

DirrochaCMS is an open-source web application for creating lightweight HTTP backends
without writing one from scratch for every small project. Through an administrative
interface, users define endpoint names, choose fields, manage records, and publish API
routes backed by Firestore. It targets serverless deployment while keeping database
credentials and authorization logic on the server.

The project combines a Next.js application [@nextjs], the Firebase Admin SDK and Firestore
[@firebase], administrative sessions, role-aware account management, endpoint-level
password protection, audit history, and a configurable schema builder. Its goal is not to
replace full-featured data platforms, but to reduce the setup cost of small backends that
change quickly during academic or student projects.

# Statement of need

DirrochaCMS grew out of a series of academic projects built between 2023 and 2024 during
the author's undergraduate studies. Several of them needed only a simple backend: somewhere
to store, update and serve data to a web application. Yet each new project meant
implementing authentication, database integration, API routes and deployment configuration
essentially from scratch, consuming more than a week before any application-specific feature
could be written.

Firebase Firestore was adopted early to keep infrastructure costs down, since these
projects rarely had funding for dedicated servers or databases. That removed the database
operations problem but not the rest: most of the backend still had to be written for every
new system. Strapi was also evaluated and set aside, because its configuration and
maintenance overhead, together with its constraints for serverless deployment, made it a
poor fit at this scale.

DirrochaCMS was therefore designed as a reusable tool, removing the need to rebuild the same
infrastructure per project. Administrators define and manage records through a web interface,
query endpoints are exposed automatically, and all administrative logic stays on the server.
Applications needing dynamic content can then be deployed on serverless platforms with
substantially less setup time.

# State of the field

Several mature tools address related needs. Strapi [@strapi] and Directus [@directus]
provide extensive headless CMS and API-building capabilities. CKAN [@ckan] is widely used
for open data portals, and Datasette [@datasette] is a powerful tool for publishing and
exploring data-backed websites. These projects are substantially broader and are the right
choice when a team needs their ecosystems, plugin models, database support or data
publication features.

The evaluation described above pointed to a narrower requirement: a system a small team can
deploy on a serverless platform, edit through a web interface, and leave running without
maintenance between semesters. Rather than contributing a plugin to a larger CMS,
DirrochaCMS explores the smallest useful backend architecture for contexts where cost,
speed of change and minimal maintenance outweigh extensibility.

# Software design

The central trade-off is between flexibility and operational simplicity. A fully general
backend generator would require a complex schema language, migrations and a database
abstraction. DirrochaCMS instead uses a constrained endpoint builder: each
endpoint has a route name and a set of typed fields, and records are stored as structured
documents. This keeps the mental model accessible to non-specialist teams while producing
HTTP APIs that external frontends consume.

Browser code reaches administrative API routes through an HTTP-only session cookie, and
those routes apply authorization before calling backend services and repositories. Firestore
access goes through the Firebase Admin SDK, so Firebase credentials are never exposed to
clients and the database security rules can deny all direct access. Public endpoint routes
are the only anonymous API surface, and endpoints may be left public or protected by a
server-side password check.

Avoiding a dedicated application server is what allows deployment on platforms that support
Next.js route handlers [@vercel; @netlify]. The trade-off is concrete: in a freelance
geolocation project where cities, regions and contextual records had to be joined to compute
a result, the document model proved unsuitable and a purpose-built SQL backend was written
instead. DirrochaCMS is likewise not intended for high-volume transactional workloads.

# Research impact statement

DirrochaCMS has supported three documented academic scenarios. A research group at the
Federal University of Para (UFPA) used it to publish project and semester-planning
information for researchers and prospective participants; being a third-party deployment
with no current contact, it is reported only at that level. OsteoPlay Vet, an undergraduate
veterinary medicine capstone project at UNAMA Parque Shopping in Belem, Brazil, used a
DirrochaCMS instance as the backend for a React/Vite educational game on osteology; that
instance defined six endpoints and held 66 records, 62 of them attached to the endpoints the
application consumed. The veterinary medicine students entered that content themselves,
without help from the computer science students who wrote the code. A classroom
demonstration under the codename MakeAPI showed computer science students in a software
engineering course how a Next.js frontend consumes a configurable backend; that backend held
four endpoints and 19 fictional records used solely for teaching.

That division of labour is the workflow the software targets: contributors with no backend
experience own the content, while the application stays a small static frontend consuming
serverless API routes. The repository documents them under `examples/`, with the endpoint
schemas, the frontend services that consume the API, and archived screenshots.

# AI usage disclosure

Generative AI tools were used as assistants in this project. In the software, they
contributed source code to the administrative API and authorization layers, reviewed by the
author before merging. In this paper, they assisted with English drafting and structure; the
motivation, the design rationale, the case-study facts and the reported limitations are the
author's own, and the Portuguese companion version preserves the author's original wording
of the statement of need. The author is this work's sole author and is responsible for all
claims, references and technical descriptions.

# Acknowledgements

The author thanks the OsteoPlay Vet capstone participants Ana Luísa Bagot, Érika Kamyla
Nogueira Raniéri, and Raissa Sawada Cutrim Gutierrez; the computer science students who
implemented the OsteoPlay Vet application code; the Charmosinha/MakeAPI developers
Alexsandro Fernandes Nascimento, Gabriel Henrique Pinheiro Maia, and Beatriz Rocha Lisboa;
and the UFPA research-group users whose needs motivated DirrochaCMS. This work received no
external funding.

# References
