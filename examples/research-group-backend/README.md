# UFPA Research Group Backend Case

This case documents a lightweight DirrochaCMS use by a research group from the
Federal University of Para (UFPA).

## Scenario

A UFPA research group used DirrochaCMS to support a web platform that displayed
project information for other researchers and people interested in participating
in the project. The platform was used to communicate data such as semester
planning information and general project participation context.

DirrochaCMS was useful in this scenario because the group needed an editable
backend for publishing structured information without maintaining a dedicated
backend server. The tool acted as a lightweight content/API layer behind the web
platform.

## Disclosure Limits

This was a third-party project, and there is no current direct contact with the
project stakeholders. For that reason, this case intentionally does not include
structural implementation details, endpoint schemas, database counts, repository
links, screenshots, or internal project names.

The case should be cited only at a high level: a UFPA research group used
DirrochaCMS to publish editable project/planning information through a web
platform.

## Reproducible Analog

Because the original implementation details cannot be disclosed, the closest
reproducible analog is to create general informational endpoints in a fresh
DirrochaCMS deployment:

| Endpoint | Fields | Use |
| --- | --- | --- |
| `planning` | `titulo`, `semestre`, `descricao`, `data` | Semester planning information |
| `participation` | `titulo`, `descricao`, `link` | Information for people interested in joining |
| `updates` | `titulo`, `data`, `descricao` | Project updates for researchers |

Example public API calls for the analog setup:

```bash
curl http://localhost:3000/api/planning
curl http://localhost:3000/api/participation
```

For a protected endpoint, send the configured password in a header:

```bash
curl http://localhost:3000/api/internal_notes \
  -H "x-endpoint-password: YOUR_ENDPOINT_PASSWORD"
```

## Use in Research Impact Evidence

This case can support the research-impact narrative, but it should not be used
as a detailed reproducibility claim unless contact with the project stakeholders
is re-established.

Additional details should only be added if they can be confirmed:

- the public project name;
- permission to cite screenshots or links;
- endpoint schemas or implementation details;
- deployment details and database counts.
