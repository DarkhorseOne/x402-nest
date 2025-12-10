import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PaymentCredentialExtractor,
  PaymentRequirementBuilder,
  DefaultPaymentVerifier,
  PaymentExpiredError,
  PaymentInvalidError,
  PaymentNetworkError,
  PaymentRequiredError,
  PaymentRequirement,
  PaymentVerificationResult,
} from '@darkhorseone/x402-core';
import { X402_CHARGE_METADATA_KEY, X402ChargeOptions } from '../decorators/X402Charge.decorator';
import { NestRequestAdapter } from '../adapters/NestRequestAdapter';

/**
 * NestJS guard that enforces x402 payment on routes decorated with @X402Charge.
 * Throws core errors on failure; lets the exception filter map them to HTTP responses.
 */
@Injectable()
export class X402Guard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly requirementBuilder: PaymentRequirementBuilder,
    private readonly credentialExtractor: PaymentCredentialExtractor,
    private readonly paymentVerifier: DefaultPaymentVerifier,
    private readonly requestAdapter: NestRequestAdapter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const cls = context.getClass();

    const options =
      this.reflector.get<X402ChargeOptions>(X402_CHARGE_METADATA_KEY, handler) ??
      this.reflector.get<X402ChargeOptions>(X402_CHARGE_METADATA_KEY, cls);

    if (!options) {
      // Route is not chargeable; allow by default.
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const adaptedRequest = this.requestAdapter.adapt(request);
    const credential = this.credentialExtractor.extract(adaptedRequest);

    const requirement = this.requirementBuilder.build({
      price: options.price,
      asset: options.asset,
      network: options.network,
      description: options.description,
    });

    if (!credential) {
      throw new PaymentRequiredError(requirement, 'Payment credential is missing');
    }

    try {
      const verification = await this.paymentVerifier.verify(credential, requirement);
      this.attachContext(request, verification, requirement);
      return true;
    } catch (err) {
      if (
        err instanceof PaymentRequiredError ||
        err instanceof PaymentInvalidError ||
        err instanceof PaymentExpiredError ||
        err instanceof PaymentNetworkError
      ) {
        throw err;
      }

      const message = err instanceof Error ? err.message : 'Payment verification failed';
      throw new PaymentNetworkError(message);
    }
  }

  private attachContext(
    request: Record<string, any>,
    verification: PaymentVerificationResult,
    requirement: PaymentRequirement,
  ) {
    (request as any).x402 = { verification, requirement };
  }
}
