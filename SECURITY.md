# Security Policy

## Threat Model

| Boundary | Description |
|----------|-------------|
| Web clients | Untrusted browser input |
| API / backend | Auth and data access |
| Configuration | Environment variables |
| Third-party services | Only via explicit integration |

### Mitigations

- No secrets in the repository
- Validate input at API boundaries
- Lockfile committed (`package-lock.json`)
- Dependency updates via Dependabot

### Secrets handling

Production secrets are supplied only via environment variables (or a secret manager injected as env). Never commit `.env`.

Report vulnerabilities privately to the repository owner.
