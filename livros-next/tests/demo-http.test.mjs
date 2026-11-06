import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

// Run against a real Next build created with NEXT_PUBLIC_DEMO_MODE=true.
const configuredOrigin = process.env.NEXT_TEST_ORIGIN?.trim();
assert.ok(configuredOrigin, 'Set NEXT_TEST_ORIGIN to the running local Next demo server.');
const origin = new URL(configuredOrigin);
assert.ok(['http:', 'https:'].includes(origin.protocol), 'Use an HTTP(S) origin.');
assert.ok(['127.0.0.1', '[::1]'].includes(origin.hostname), 'Use the literal loopback address 127.0.0.1 or [::1].');
assert.equal(origin.username, '', 'Origin credentials are not allowed.');
assert.equal(origin.password, '', 'Origin credentials are not allowed.');
assert.equal(origin.pathname, '/', 'Use an origin without an application path.');
assert.equal(origin.search, '', 'Origin query parameters are not allowed.');
assert.equal(origin.hash, '', 'Origin fragments are not allowed.');

test('demo Next HTTP fornece seed e recusa POST/DELETE sem modificar o catálogo', {
  concurrency: false,
  timeout: 30_000,
}, async (context) => {
  async function request(path, { method = 'GET', body, status = 200 } = {}) {
    const response = await fetch(new URL(path, origin), {
      method,
      redirect: 'error',
      signal: AbortSignal.any([context.signal, AbortSignal.timeout(5_000)]),
      ...(body === undefined ? {} : {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    });
    assert.equal(response.status, status, `${method} ${path}: status HTTP`);
    assert.equal(response.headers.get('x-demo-mode'), 'session-storage', 'O servidor está no modo explícito de demonstração.');
    assert.match(response.headers.get('content-type') ?? '', /application\/json/i);
    return { body: await response.json(), allow: response.headers.get('allow') };
  }

  // This preflight prevents mutation attempts against the default API build.
  const { body: initial } = await request('/api/livros');
  assert.ok(Array.isArray(initial) && initial.length > 0, 'O seed fictício está disponível.');
  assert.deepEqual(initial.map((book) => book.codigo), [1478, 2556, 9323]);

  const post = await request('/api/livros', {
    method: 'POST', status: 405,
    body: {
      codigo: 0, codEditora: initial[0].codEditora,
      titulo: `Demo HTTP ${randomUUID()}`,
      resumo: 'Este registro fictício deve ser recusado pelo modo demo.',
      autores: ['Teste automatizado'],
    },
  });
  assert.equal(post.allow, 'GET');
  assert.deepEqual((await request('/api/livros')).body, initial, 'POST recusado preserva o seed.');

  const deletion = await request(`/api/livros/${initial[0].codigo}`, { method: 'DELETE', status: 405 });
  assert.equal(deletion.allow, '');
  assert.deepEqual((await request('/api/livros')).body, initial, 'DELETE recusado preserva o seed.');
});
