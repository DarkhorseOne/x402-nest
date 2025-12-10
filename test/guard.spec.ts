import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import {
  PaymentCredentialExtractor,
  PaymentRequirementBuilder,
  PaymentInvalidError,
  PaymentExpiredError,
  PaymentNetworkError,
  PaymentRequiredError,
  PaymentVerificationResult,
} from '@darkhorseone/x402-core';
import { X402Guard } from '../src/guards/X402Guard';
import { NestRequestAdapter } from '../src/adapters/NestRequestAdapter';
import { X402Charge } from '../src/decorators/X402Charge.decorator';

const baseConfig = {
  facilitatorUrl: 'https://facilitator.example.com',
  defaultNetwork: 'base-mainnet',
  defaultAsset: 'USDC',
  sellerWallet: 'wallet-1',
  fallbackMode: 'deny' as const,
};

function createContext(handler: any, controller: any, request: any): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => controller,
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

describe('X402Guard', () => {
  const reflector = new Reflector();
  const builder = new PaymentRequirementBuilder(baseConfig);
  const extractor = new PaymentCredentialExtractor();
  const adapter = new NestRequestAdapter();

  const chargeOptions = { price: '0.1', asset: 'USDC', network: 'base-mainnet', description: 'demo' };

  class ChargeableController {
    @X402Charge(chargeOptions)
    handler() {}
  }

  it('allows routes without @X402Charge', async () => {
    class PlainController {
      handler() {}
    }
    const verifier = { verify: jest.fn() };
    const guard = new X402Guard(reflector, builder, extractor, verifier as any, adapter);

    const ctx = createContext(PlainController.prototype.handler, PlainController, {});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(verifier.verify).not.toHaveBeenCalled();
  });

  it('throws PaymentRequiredError when credential missing', async () => {
    const verifier = { verify: jest.fn() };
    const guard = new X402Guard(reflector, builder, extractor, verifier as any, adapter);

    const controller = new ChargeableController();
    const ctx = createContext(controller.handler, ChargeableController, {});

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(PaymentRequiredError);
  });

  it('attaches verification context on success', async () => {
    const verification: PaymentVerificationResult = { status: 'success', txHash: '0x123' };
    const verifier = { verify: jest.fn().mockResolvedValue(verification) };
    const guard = new X402Guard(reflector, builder, extractor, verifier as any, adapter);

    const controller = new ChargeableController();
    const request = { headers: { 'x402-payment': 'token' } } as any;
    const ctx = createContext(controller.handler, ChargeableController, request);

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.x402).toBeDefined();
    expect(request.x402.verification).toEqual(verification);
    expect(request.x402.requirement.amount).toBe(chargeOptions.price);
  });

  it('rethrows PaymentInvalidError from verifier', async () => {
    const verifier = {
      verify: jest.fn().mockRejectedValue(new PaymentInvalidError('invalid')),
    };
    const guard = new X402Guard(reflector, builder, extractor, verifier as any, adapter);

    const controller = new ChargeableController();
    const request = { headers: { 'x402-payment': 'token' } } as any;
    const ctx = createContext(controller.handler, ChargeableController, request);

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(PaymentInvalidError);
  });

  it('wraps unknown errors as PaymentNetworkError', async () => {
    const verifier = {
      verify: jest.fn().mockRejectedValue(new Error('boom')),
    };
    const guard = new X402Guard(reflector, builder, extractor, verifier as any, adapter);

    const controller = new ChargeableController();
    const request = { headers: { 'x402-payment': 'token' } } as any;
    const ctx = createContext(controller.handler, ChargeableController, request);

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(PaymentNetworkError);
  });

  it('propagates PaymentExpiredError', async () => {
    const verifier = {
      verify: jest.fn().mockRejectedValue(new PaymentExpiredError('expired')),
    };
    const guard = new X402Guard(reflector, builder, extractor, verifier as any, adapter);

    const controller = new ChargeableController();
    const request = { headers: { 'x402-payment': 'token' } } as any;
    const ctx = createContext(controller.handler, ChargeableController, request);

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(PaymentExpiredError);
  });
});
