import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import {
  PaymentCredentialExtractor,
  PaymentRequirementBuilder,
  DefaultPaymentVerifier,
  HttpFacilitatorAdapter,
  X402Config,
} from '@darkhorseone/x402-core';
import { X402Guard } from '../guards/X402Guard';
import { X402Interceptor } from '../interceptors/X402Interceptor';
import { X402ExceptionFilter } from '../responses/X402ExceptionFilter';
import { NestRequestAdapter } from '../adapters/NestRequestAdapter';
import { validateConfig } from '@darkhorseone/x402-core';
import { X402_CONFIG, X402_FACILITATOR_CLIENT, X402_PAYMENT_VERIFIER } from '../tokens';

export { X402_CONFIG, X402_FACILITATOR_CLIENT, X402_PAYMENT_VERIFIER } from '../tokens';

export interface X402NestModuleOptions extends X402Config {}

export interface X402ModuleAsyncOptions {
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule>>;
  inject?: any[];
  useFactory: (...args: any[]) => Promise<X402Config> | X402Config;
  requirementTtlMs?: number;
  extraProviders?: Provider[];
}

/**
 * NestJS module that wires the x402-core components into the Nest DI container.
 */
@Module({})
export class X402Module {
  static forRoot(config: X402NestModuleOptions, requirementTtlMs?: number): DynamicModule {
    const validated = validateConfig(config);
    const providers = this.createProviders({ config: validated, requirementTtlMs });

    return {
      module: X402Module,
      providers,
      exports: this.exports(),
    };
  }

  static forRootAsync(options: X402ModuleAsyncOptions): DynamicModule {
    const configProvider: Provider = {
      provide: X402_CONFIG,
      inject: options.inject ?? [],
      useFactory: async (...args: any[]) => validateConfig(await options.useFactory(...args)),
    };

    const asyncProviders = [
      configProvider,
      ...this.createCoreProviders(options.requirementTtlMs),
      ...(options.extraProviders ?? []),
    ];

    return {
      module: X402Module,
      imports: options.imports ?? [],
      providers: asyncProviders,
      exports: this.exports(),
    };
  }

  private static createProviders(args: { config: X402Config; requirementTtlMs?: number }): Provider[] {
    return [
      { provide: X402_CONFIG, useValue: args.config },
      ...this.createCoreProviders(args.requirementTtlMs),
    ];
  }

  private static createCoreProviders(requirementTtlMs?: number): Provider[] {
    const requirementBuilderProvider: Provider = {
      provide: PaymentRequirementBuilder,
      useFactory: (cfg: X402Config) => new PaymentRequirementBuilder(cfg, requirementTtlMs),
      inject: [X402_CONFIG],
    };

    const credentialExtractorProvider: Provider = {
      provide: PaymentCredentialExtractor,
      useClass: PaymentCredentialExtractor,
    };

    const requestAdapterProvider: Provider = {
      provide: NestRequestAdapter,
      useClass: NestRequestAdapter,
    };

    const facilitatorProvider: Provider = {
      provide: X402_FACILITATOR_CLIENT,
      useFactory: (cfg: X402Config) => new HttpFacilitatorAdapter(cfg),
      inject: [X402_CONFIG],
    };

    const facilitatorAlias: Provider = {
      provide: HttpFacilitatorAdapter,
      useExisting: X402_FACILITATOR_CLIENT,
    };

    const verifierProvider: Provider = {
      provide: DefaultPaymentVerifier,
      useFactory: (facilitator: HttpFacilitatorAdapter) =>
        new DefaultPaymentVerifier(facilitator),
      inject: [X402_FACILITATOR_CLIENT],
    };

    return [
      requirementBuilderProvider,
      credentialExtractorProvider,
      requestAdapterProvider,
      facilitatorProvider,
      facilitatorAlias,
      verifierProvider,
      X402Guard,
      X402Interceptor,
      X402ExceptionFilter,
    ];
  }

  private static exports() {
    return [
      X402Guard,
      X402Interceptor,
      X402ExceptionFilter,
      PaymentRequirementBuilder,
      PaymentCredentialExtractor,
      DefaultPaymentVerifier,
      NestRequestAdapter,
      HttpFacilitatorAdapter,
      X402_FACILITATOR_CLIENT,
      X402_CONFIG,
    ];
  }
}
