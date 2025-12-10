/**
 * Normalizes Nest request objects (Express or Fastify) into a shape expected by x402-core.
 * For Fastify, prefers the raw IncomingMessage when available; otherwise passes through.
 */
export class NestRequestAdapter {
  adapt(req: any): any {
    if (req && typeof req === 'object' && 'raw' in req && req.raw) {
      // Fastify exposes the underlying IncomingMessage as `raw`.
      return {
        ...(req.raw as object),
        headers: req.raw.headers ?? req.headers,
        body: req.body,
        query: req.query,
      };
    }

    return req;
  }
}
