# SheMesh shared config (source of truth)

This folder is the **canonical** copy of config shared across the SheMesh product family.

## Applies to

| Repo | Role |
|------|------|
| **shemesh-hub** | Source of truth (this repo) |
| shemesh-ops | Consumer — keep in sync |
| shemesh-platform | Consumer — keep in sync |
| shemesh-universal | Consumer — partial (see notes) |

## Canonical files

| File | Purpose |
|------|---------|
| `.gitignore` | Node/Vite/Vercel/TS ignores |
| `vitest.config.ts` | Vitest node env + `src/**/*.test.ts` |
| `vercel.json` | SPA rewrite (exclude `/api/`) |
| `tsconfig.base.json` | Shared TypeScript compiler options |
| `package.scripts.json` | Standard npm scripts reference |
| `ci.yml` | GitHub Actions CI template |
| `dependabot.yml` | Dependabot template |

## How to update

1. Change the file **here** first.
2. Copy the same content into the consumer repos.
3. Open a small PR in each consumer (keeps activity visible).

## Notes

- **shemesh-universal** uses a split `tsconfig.json` + `tsconfig.app.json` / `tsconfig.node.json` and Tailwind/PWA. Use `tsconfig.base.json` as the shared compilerOptions block only.
- Package **dependencies** stay per-product; only scripts and tool versions should stay aligned where practical.
- Full monorepo is a later option; this pattern avoids drift without a workspace migration.
