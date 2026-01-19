# Architecture Overview

- `apps/` — deployable frontends and mobile apps.
- `services/` — backend microservices; each service has its own repo or folder with CI.
- `shared/` — shared types, UI components, utilities.
- `config/` — non-secret configuration and role definitions.
- `owner/` — private owner-only settings (not committed with secrets).

Guidelines:
- Small blast radius per service.
- Enforce branch protection and CODEOWNERS per repo/service.
