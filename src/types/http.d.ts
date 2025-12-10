import type { PaymentRequirement, PaymentVerificationResult } from '@darkhorseone/x402-core';

declare module 'http' {
  interface IncomingMessage {
    x402?: {
      verification: PaymentVerificationResult;
      requirement: PaymentRequirement;
    };
  }
}
