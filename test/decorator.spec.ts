import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { X402Charge, X402_CHARGE_METADATA_KEY } from '../src/decorators/X402Charge.decorator';

class DecoratedController {
  @X402Charge({ price: '1.00', asset: 'USDC', network: 'base-mainnet', description: 'test' })
  handler() {}
}

class UndecoratedController {
  handler() {}
}

describe('X402Charge decorator', () => {
  const reflector = new Reflector();

  it('attaches metadata to a handler', () => {
    const instance = new DecoratedController();
    const meta = reflector.get(
      X402_CHARGE_METADATA_KEY,
      instance.handler,
    );

    expect(meta).toEqual({
      price: '1.00',
      asset: 'USDC',
      network: 'base-mainnet',
      description: 'test',
    });
  });

  it('returns undefined when not decorated', () => {
    const instance = new UndecoratedController();
    const meta = reflector.get(
      X402_CHARGE_METADATA_KEY,
      instance.handler,
    );

    expect(meta).toBeUndefined();
  });
});
