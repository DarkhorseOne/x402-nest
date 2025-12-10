import { ArgumentsHost } from '@nestjs/common';
import {
  PaymentRequiredError,
  PaymentInvalidError,
  PaymentExpiredError,
  PaymentNetworkError,
  X402ConfigError,
} from '@darkhorseone/x402-core';
import { X402ExceptionFilter } from '../src/responses/X402ExceptionFilter';

function createHost() {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn();
  const response = { status, json };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('X402ExceptionFilter', () => {
  const filter = new X402ExceptionFilter();
  const requirement = { nonce: 'n', amount: '1', asset: 'USDC', network: 'base', seller: 's', facilitator: 'f', expiresAt: 'now' };

  it('maps PaymentRequiredError to HTTP 402 with requirement', () => {
    const { host, status, json } = createHost();
    filter.catch(new PaymentRequiredError(requirement), host);
    expect(status).toHaveBeenCalledWith(402);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'payment_required', payment: requirement }));
  });

  it('maps PaymentInvalidError to HTTP 402', () => {
    const { host, status, json } = createHost();
    filter.catch(new PaymentInvalidError('invalid'), host);
    expect(status).toHaveBeenCalledWith(402);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'payment_invalid' }));
  });

  it('maps PaymentExpiredError to HTTP 402', () => {
    const { host, status, json } = createHost();
    filter.catch(new PaymentExpiredError('expired'), host);
    expect(status).toHaveBeenCalledWith(402);
  });

  it('maps PaymentNetworkError to HTTP 503', () => {
    const { host, status, json } = createHost();
    filter.catch(new PaymentNetworkError('network'), host);
    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'payment_network_error' }));
  });

  it('maps X402ConfigError to HTTP 500', () => {
    const { host, status, json } = createHost();
    filter.catch(new X402ConfigError('config'), host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'configuration_error' }));
  });
});
