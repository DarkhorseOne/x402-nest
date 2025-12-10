import { of } from 'rxjs';
import { X402Interceptor } from '../src/interceptors/X402Interceptor';
import { X402_CONFIG } from '../src/module/X402Module';
import { ExecutionContext, CallHandler } from '@nestjs/common';

describe('X402Interceptor', () => {
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const interceptor = new X402Interceptor({
    facilitatorUrl: 'https://facilitator.example.com',
    defaultAsset: 'USDC',
    defaultNetwork: 'base-mainnet',
    sellerWallet: 'wallet-1',
    fallbackMode: 'deny',
    logger,
  });

  const next: CallHandler = { handle: jest.fn(() => of(true)) } as any;

  const ctx = {
    switchToHttp: () => ({
      getRequest: () => ({
        x402: {
          verification: { status: 'success' },
          requirement: { description: 'demo', nonce: 'n' },
        },
      }),
    }),
  } as unknown as ExecutionContext;

  it('logs when logger and x402 context are present', () => {
    interceptor.intercept(ctx, next);
    expect(logger.info).toHaveBeenCalled();
  });

  it('passes through the call handler', () => {
    const result = interceptor.intercept(ctx, next);
    expect(next.handle).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Object);
  });
});
