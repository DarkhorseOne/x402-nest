# Repository Guidelines

## Project Structure & Module Organization
- `src/module/X402Module.ts` wires `@darkhorseone/x402-core` services into the Nest DI container via `forRoot`.
- `src/decorators/X402Charge.decorator.ts` sets metadata for chargeable controllers/handlers; `src/guards/X402Guard.ts` enforces it; `src/interceptors/X402Interceptor.ts` is the cross-cutting hook; `src/responses/X402ExceptionFilter.ts` maps core errors to HTTP.
- `src/index.ts` re-exports the public surface. Add new providers and export them here.
- `docs/` holds supplementary documentation. Add tests under `test/` or `src/**/__tests__` and mirror the source structure.

## Architecture Overview
The package is a thin NestJS adapter around `@darkhorseone/x402-core`. `X402Module.forRoot` injects the x402 config, `X402Guard` extracts credentials and verifies payments against built requirements, `X402ExceptionFilter` returns HTTP 402/503/500 mappings, and `X402Interceptor` is a placeholder for logging/tracing. Keep components stateless where possible and rely on Nest DI for shared services.

## Build, Test, and Development Commands
- `npm install`: Install dependencies (peer deps `@nestjs/common` and `@nestjs/core` must exist in the host app).
- `npm run build`: Type-check and emit to `dist/` via `tsc -p tsconfig.json`.
- `npm test`: Currently a placeholder; replace with Jest when tests are added.
- Suggested: `npm pack` to validate publishable output, `npm run build -- --watch` for local iteration.

## Coding Style & Naming Conventions
- TypeScript, ES2022 target; 2-space indentation as in existing files.
- Classes/providers in PascalCase (`X402Guard`), methods/variables in camelCase, constants in SCREAMING_SNAKE_CASE.
- Prefer constructor injection over static singletons; keep provider tokens descriptive (e.g., `X402_CONFIG`).
- Export new public types from `src/index.ts` to keep the package surface coherent.

## Testing Guidelines
- Use Jest (Nest default) with `ts-jest` for unit tests. Name files `*.spec.ts` alongside sources or under `test/`.
- Cover guard behavior (routes without `@X402Charge`, missing/invalid credentials, successful verification) and exception filter mappings for each x402-core error type.
- Add integration-style tests with a lightweight Nest testing module to validate DI wiring in `X402Module.forRoot`.
- Aim to add at least smoke coverage for new features; document gaps in PRs until the placeholder test script is replaced.

## Commit & Pull Request Guidelines
- Current history uses short imperative messages (e.g., `init`); keep that style or adopt Conventional Commits (`feat:`, `fix:`) for clarity.
- Each PR should include a summary of changes, testing notes (`npm run build`, added specs), and any required docs updates.
- Link related issues/tasks and note any configuration steps (`X402Module.forRoot` options, env vars). Add screenshots only if they clarify behavior.

## Security & Configuration Tips
- Do not hardcode secrets or payment credentials; pass them through environment variables and supply them to `X402Module.forRoot`.
- Avoid logging raw credential data in guards/interceptors; sanitize or omit sensitive fields.
- When extending the exception filter, keep responses free of internal config values to prevent leakage.
