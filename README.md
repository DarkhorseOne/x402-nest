# @darkhorseone/x402-nest

NestJS adapter for the DarkhorseOne x402 payment middleware. It wires the framework-agnostic `@darkhorseone/x402-core` into Nest so you can mark endpoints as paid, enforce verification, and map core errors to HTTP responses.

## Installation

```bash
npm install @darkhorseone/x402-nest @darkhorseone/x402-core @nestjs/common @nestjs/core reflect-metadata
```

## Usage

```ts
import { Module, Controller, Get } from '@nestjs/common';
import { X402Module, X402Charge, X402Guard, X402ExceptionFilter } from '@darkhorseone/x402-nest';

@Controller('report')
export class ReportController {
  @Get()
  @X402Charge({ price: '0.02', asset: 'USDC', network: 'base-mainnet', description: 'Generate report' })
  generateReport() {
    return { ok: true };
  }
}

@Module({
  imports: [
    X402Module.forRoot({
      facilitatorUrl: 'https://x402.example.com',
      sellerWallet: 'wallet-address',
      defaultAsset: 'USDC',
      defaultNetwork: 'base-mainnet',
      fallbackMode: 'deny',
    }),
  ],
  controllers: [ReportController],
  providers: [X402Guard, X402ExceptionFilter],
})
export class AppModule {}
```

Attach `X402ExceptionFilter` globally to map core errors to HTTP responses (402/503/500).

## Components

- `@X402Charge(options)`: Decorator to mark controllers/handlers as chargeable.
- `X402Guard`: Extracts credentials, builds payment requirements, verifies via core, and blocks on failure.
- `X402Interceptor`: Hook for logging/tracing; pass-through by default.
- `X402Module`: Registers config and core adapters with Nest DI.
- `X402ExceptionFilter`: Translates `@darkhorseone/x402-core` errors to HTTP responses.

## Strict Mode (Phase 0)

Phase 0 is stateless and deny-by-default:

- No DB/Redis/MQ/credit fallback.
- Facilitator failures surface as `PaymentNetworkError` → HTTP 503.
- Missing/invalid/expired payments return HTTP 402 with the payment requirement payload.

## Development Notes

- Target NestJS v10+ (Express or Fastify). Node.js 20+.
- Follow file naming: `*.guard.ts`, `*.interceptor.ts`, `*.decorator.ts`, etc.
- Use constructor injection; keep the adapter thin and delegate business logic to `@darkhorseone/x402-core`.

## Local development with x402-core

If `@darkhorseone/x402-core` is not published, link the local sibling before installing dev deps:

```bash
npm link ../x402-core
npm install
```

When core is published and you want to switch back:

```bash
npm unlink ../x402-core
npm install @darkhorseone/x402-core --save
npm install
```
