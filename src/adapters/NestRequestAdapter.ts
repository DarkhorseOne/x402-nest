/**
 * Placeholder for any NestJS-specific request adaptation logic.
 * In many cases the raw request object from context.switchToHttp().getRequest()
 * can be passed directly to x402-core components, so this adapter may remain a no-op.
 */
export class NestRequestAdapter {
  adapt(req: unknown): unknown {
    return req;
  }
}
