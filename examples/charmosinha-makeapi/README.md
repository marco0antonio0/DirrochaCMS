# Charmosinha / MakeAPI Case Study

This case study documents a classroom demonstration of DirrochaCMS under the
codename MakeAPI.

## Context

Charmosinha is a basic e-commerce catalog created to demonstrate the
applicability of separating frontend and backend concerns for computer science
students in a software engineering discipline at UNAMA Parque Shopping, in
Belem, Para, Brazil. The website and backend were created exclusively for
learning purposes and may be publicly cited. They are not commercial or
professional production systems and may be taken offline at any time. The
platform name, images, product names, and storefront content are fictional and
were used only for educational purposes.

## Developers

The Charmosinha/MakeAPI demonstration was developed by:

| Name | Link |
| --- | --- |
| Marco Antonio da Silva Mesquita |  |
| Alexsandro Fernandes Nascimento |  |
| Gabriel Henrique Pinheiro Maia | <https://www.linkedin.com/in/gabrielhpmaia/> |
| Beatriz Rocha Lisboa |  |

The project used:

- a Next.js storefront frontend;
- a serverless DirrochaCMS backend deployed as MakeAPI;
- Firestore persistence;
- generated HTTP endpoints consumed by the frontend;
- WhatsApp links for order handoff instead of an online payment backend.

Public application metadata in the frontend references:

- Frontend: `https://charmosinha.netlify.app/`
- Backend API: `https://api-charmosinha.netlify.app/`

## How the Frontend Consumes DirrochaCMS

The frontend integration is concentrated in two small modules:

- `lib/products.ts` fetches products from the CMS, maps CMS item records to the
  local `Product` type, filters products by category, and fetches categories.
- `lib/store-info.ts` fetches the first store-information record and exposes
  WhatsApp, phone, and about text to the storefront.

The current code consumes:

- `/api/endpoint/yUeLxgrmtSOKU8joYhJF` for products;
- `/api/endpoint/nAZdbrp0Nfk1NXknU16J` for categories;
- `/api/endpoint/NygKm957MaH6e8y5qLyL` for store information.

The project README also references an older product endpoint ID,
`Az2YrSZjvVgj3USlfCJO`, which now returns `404`. The current source code uses
the `produto-v2` endpoint listed below.

## Data Model Observed

The Firebase/Firestore database used by the demonstration contained:

| Collection | Count | Notes |
| --- | ---: | --- |
| `endpoint` | 4 | Endpoint definitions managed by DirrochaCMS/MakeAPI |
| `itens` | 19 | Content records; 17 attached to current endpoint definitions and 2 orphaned |
| `users` | 1 | Administrative panel account |

Active endpoint schemas:

| Logical endpoint | Fields | Records | Frontend use |
| --- | --- | ---: | --- |
| `produto-v2` | `titulo`, `preco`, `imagem`, `categoria` | 12 | Product catalog |
| `categorias` | `nome` | 3 | Storefront category navigation and filtering |
| `informacao` | `whatsapp`, `telefone`, `sobre` | 1 | Contact data and store description |
| `fase-iniciante-osso` | `text`, `image` | 1 | Leftover demonstration endpoint, not consumed by the storefront |

Two orphaned item records were still associated with the older product endpoint
ID documented in the project README.

## Visual Evidence

The repository includes screenshots for this case study in
`docs/evidence/charmosinha-makeapi`: storefront landing page and product grid.

## Why This Matters

This demonstration is useful evidence for DirrochaCMS because it shows the tool
in a teaching context:

- students can see a frontend consuming real HTTP APIs without writing a full
  backend first;
- the data model can be changed through a panel during demonstration;
- image and numeric fields can be exposed to a storefront without direct
  Firestore access from the browser;
- the deployment can remain low-cost through Netlify and Firestore.

## Citation and Preservation

This case may be cited as a public learning-oriented demonstration. Because the
site and backend are not commercial or professional systems, their public URLs
should be treated as temporary evidence and may become unavailable. Archived
screenshots or an archived demo should be kept alongside the live URLs, and the
observed Firestore counts should be refreshed if the backend continues to
receive edits.
