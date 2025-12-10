import { DynamicModule, Module } from '@nestjs/common';
import {
  PaymentCredentialExtractor,
  PaymentRequirementBuilder,
  DefaultPaymentVerifier,
  HttpFacilitatorAdapter,
  X402Config,
} from '@darkhorseone/x402-core';
import { X402Guard } from '../guards/X402Guard';
import { X402Interceptor } from '../interceptors/X402Interceptor';

export interface X402NestModuleOptions extends X402Config {}

/**
 * NestJS module that wires the x402-core components into the Nest DI container.
 * Phase 0 skeleton: basic synchronous configuration.
 */
@Module({})
export class X402Module {
  static forRoot(config: X402NestModuleOptions): DynamicModule {
    const configProvider = {
      provide: 'X402_CONFIG',
      useValue: config,
    };

    const facilitatorProvider = {
      provide: HttpFacilitatorAdapter,
      useFactory: (cfg: X402Config) => new HttpFacilitatorAdapter(cfg),
      inject: ['X402_CONFIG'],
    };

    const requirementBuilderProvider = {
      provide: PaymentRequirementBuilder,
      useFactory: (cfg: X402Config) => new PaymentRequirementBuilder(cfg),
      inject: ['X402_CONFIG'],
    };

    const credentialExtractorProvider = {
      provide: PaymentCredentialExtractor,
      useClass: PaymentCredentialExtractor,
    };

    const verifierProvider = {
      provide: DefaultPaymentVerifier,
      useFactory: (facilitator: HttpFacilitatorAdapter) =>
        new DefaultPaymentVerifier(facilitator),
      inject: [HttpFacilitatorAdapter],
    };

    return {
      module: X402Module,
      providers: [
        configProvider,
        facilitatorProvider,
        requirementBuilderProvider,
        credentialExtractorProvider,
        verifierProvider,
        X402Guard,
        X402Interceptor,
      ],
      exports: [
        X402Guard,
        X402Interceptor,
        PaymentRequirementBuilder,
        PaymentCredentialExtractor,
        DefaultPaymentVerifier,
      ],
    };
  }
}
