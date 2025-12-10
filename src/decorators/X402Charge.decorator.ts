import { SetMetadata } from '@nestjs/common';

export const X402_CHARGE_METADATA_KEY = 'x402:charge';

export interface X402ChargeOptions {
  price: string;
  asset?: string;
  network?: string;
  description?: string;
}

/**
 * Marks a controller or route handler as x402 chargeable.
 * Phase 0: this decorator only attaches metadata; enforcement is handled by X402Guard.
 */
export const X402Charge = (options: X402ChargeOptions): MethodDecorator & ClassDecorator =>
  SetMetadata(X402_CHARGE_METADATA_KEY, options);
