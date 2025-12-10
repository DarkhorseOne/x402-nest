import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import {
  PaymentRequiredError,
  PaymentInvalidError,
  PaymentExpiredError,
  PaymentNetworkError,
  X402ConfigError,
} from '@darkhorseone/x402-core';

/**
 * Maps x402-core errors to HTTP responses in a NestJS context.
 * Phase 0 skeleton implementation with simple status mapping.
 */
@Catch(
  PaymentRequiredError,
  PaymentInvalidError,
  PaymentExpiredError,
  PaymentNetworkError,
  X402ConfigError,
)
export class X402ExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: any = {
      error: 'internal_error',
      message: exception?.message ?? 'An unknown error occurred',
    };

    if (exception instanceof PaymentRequiredError) {
      status = HttpStatus.PAYMENT_REQUIRED;
      body = {
        error: 'payment_required',
        payment: exception.requirement,
        message: exception.message,
      };
    } else if (
      exception instanceof PaymentInvalidError ||
      exception instanceof PaymentExpiredError
    ) {
      status = HttpStatus.PAYMENT_REQUIRED;
      body = {
        error: 'payment_invalid',
        message: exception.message,
      };
    } else if (exception instanceof PaymentNetworkError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      body = {
        error: 'payment_network_error',
        message: exception.message,
      };
    } else if (exception instanceof X402ConfigError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      body = {
        error: 'configuration_error',
        message: exception.message,
      };
    }

    response.status(status).json(body);
  }
}
