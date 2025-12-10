import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { X402Config } from '@darkhorseone/x402-core';
import { X402_CONFIG } from '../tokens';

/**
 * Simple interceptor hook for logging or attaching additional metadata.
 * Pass-through by default; logs verification context if a logger is provided in config.
 */
@Injectable()
export class X402Interceptor implements NestInterceptor {
  constructor(@Inject(X402_CONFIG) private readonly config: X402Config) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const logger = this.config?.logger;

    if (logger && req?.x402) {
      logger.info('x402 verification succeeded', {
        status: req?.x402?.verification?.status,
        requirement: req?.x402?.requirement?.description ?? req?.x402?.requirement?.nonce,
      });
    }

    return next.handle();
  }
}
