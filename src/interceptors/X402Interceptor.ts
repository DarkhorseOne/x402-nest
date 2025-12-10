import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

/**
 * Simple interceptor hook for logging or attaching additional metadata.
 * Phase 0 skeleton: pass-through implementation.
 */
@Injectable()
export class X402Interceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // TODO: add logging / tracing hooks when integrating into a real app.
    return next.handle();
  }
}
