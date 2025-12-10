import { Test } from '@nestjs/testing';
import { X402Module, X402_CONFIG, X402_FACILITATOR_CLIENT } from '../src/module/X402Module';
import { PaymentRequirementBuilder, PaymentCredentialExtractor, DefaultPaymentVerifier } from '@darkhorseone/x402-core';
import { X402Guard } from '../src/guards/X402Guard';
import { X402Interceptor } from '../src/interceptors/X402Interceptor';
import { X402ExceptionFilter } from '../src/responses/X402ExceptionFilter';
import { NestRequestAdapter } from '../src/adapters/NestRequestAdapter';
import { HttpFacilitatorAdapter } from '@darkhorseone/x402-core';

const baseConfig = {
  facilitatorUrl: 'https://facilitator.example.com',
  defaultNetwork: 'base-mainnet',
  defaultAsset: 'USDC',
  sellerWallet: 'wallet-1',
  fallbackMode: 'deny' as const,
};

describe('X402Module', () => {
  it('registers providers with forRoot', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [X402Module.forRoot(baseConfig)],
    }).compile();

    expect(moduleRef.get(PaymentRequirementBuilder)).toBeInstanceOf(PaymentRequirementBuilder);
    expect(moduleRef.get(PaymentCredentialExtractor)).toBeInstanceOf(PaymentCredentialExtractor);
    expect(moduleRef.get(DefaultPaymentVerifier)).toBeInstanceOf(DefaultPaymentVerifier);
    expect(moduleRef.get(X402Guard)).toBeInstanceOf(X402Guard);
    expect(moduleRef.get(X402Interceptor)).toBeInstanceOf(X402Interceptor);
    expect(moduleRef.get(X402ExceptionFilter)).toBeInstanceOf(X402ExceptionFilter);
    expect(moduleRef.get(NestRequestAdapter)).toBeInstanceOf(NestRequestAdapter);
    expect(moduleRef.get(X402_CONFIG)).toEqual(baseConfig);
    expect(moduleRef.get(X402_FACILITATOR_CLIENT)).toBeInstanceOf(HttpFacilitatorAdapter);
  });

  it('supports async configuration', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        X402Module.forRootAsync({
          useFactory: async () => baseConfig,
        }),
      ],
    }).compile();

    expect(moduleRef.get(X402_CONFIG)).toEqual(baseConfig);
    expect(moduleRef.get(PaymentRequirementBuilder)).toBeInstanceOf(PaymentRequirementBuilder);
  });
});
