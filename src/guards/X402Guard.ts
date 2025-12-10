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
} from '@darkhorseone/x402-core';
import { X402_CHARGE_METADATA_KEY, X402ChargeOptions } from '../decorators/X402Charge.decorator';

/**
 * NestJS guard that enforces x402 payment on routes decorated with @X402Charge.
 * Phase 0: skeleton implementation with TODOs.
 */
@Injectable()
export class X402Guard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly requirementBuilder: PaymentRequirementBuilder,
    private readonly credentialExtractor: PaymentCredentialExtractor,
    private readonly paymentVerifier: DefaultPaymentVerifier,
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
    const credential = this.credentialExtractor.extract(request);

    if (!credential) {
      // In the full implementation this should throw PaymentRequiredError with a requirement.
      // For Phase 0 skeleton we simply deny access.
      return false;
    }

    const requirement = this.requirementBuilder.build({
      price: options.price,
      asset: options.asset,
      network: options.network,
      description: options.description,
    });

    const result = await this.paymentVerifier.verify(credential, requirement);

    // Phase 0 skeleton: allow only on explicit success status.
    return result.status === 'success';
  }
}
