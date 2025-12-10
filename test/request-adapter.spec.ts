import { NestRequestAdapter } from '../src/adapters/NestRequestAdapter';

describe('NestRequestAdapter', () => {
  const adapter = new NestRequestAdapter();

  it('returns raw request when present (Fastify)', () => {
    const raw = { headers: { a: '1' } };
    const adapted = adapter.adapt({ raw, headers: { b: '2' }, body: { foo: 'bar' }, query: { q: 1 } });
    expect(adapted.headers).toEqual(raw.headers);
    expect(adapted.body).toEqual({ foo: 'bar' });
    expect(adapted.query).toEqual({ q: 1 });
  });

  it('passes through when raw is absent (Express)', () => {
    const req = { headers: { a: '1' }, body: { foo: 'bar' }, query: {} };
    const adapted = adapter.adapt(req);
    expect(adapted).toBe(req);
  });
});
