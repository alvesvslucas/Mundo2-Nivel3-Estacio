import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

// Requires an already running local Next server. No server is started here.
// The demo stores data in process memory and has no multi-instance guarantee.
const configuredOrigin = process.env.NEXT_TEST_ORIGIN?.trim();
assert.ok(configuredOrigin, 'Set NEXT_TEST_ORIGIN to the running local Next server.');

const origin = new URL(configuredOrigin);
assert.ok(['http:', 'https:'].includes(origin.protocol), 'Use an HTTP(S) origin.');
assert.ok(
  ['127.0.0.1', '[::1]'].includes(origin.hostname),
  'NEXT_TEST_ORIGIN must use a literal loopback address: 127.0.0.1 or [::1].',
);
assert.equal(origin.username, '', 'Origin credentials are not allowed.');
assert.equal(origin.password, '', 'Origin credentials are not allowed.');
assert.equal(origin.pathname, '/', 'Use an origin without an application path.');
assert.equal(origin.search, '', 'Origin query parameters are not allowed.');
assert.equal(origin.hash, '', 'Origin fragments are not allowed.');

test('Next HTTP: editoras, inclusão, listagem, exclusão e método não permitido', {
  concurrency: false,
  timeout: 60_000,
}, async (context) => {
  const title = `Smoke HTTP ${randomUUID()}`;
  let creationRequested = false;
  let failure;

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
    assert.match(
      response.headers.get('content-type') ?? '',
      /application\/json/i,
      `${method} ${path}: resposta JSON`,
    );
    return response.json();
  }

  try {
    const editoras = await request('/api/editoras');
    assert.ok(Array.isArray(editoras) && editoras.length > 0, 'Existem editoras disponíveis.');
    assert.ok(Number.isInteger(editoras[0].codEditora), 'A editora possui código inteiro.');

    const initialBooks = await request('/api/livros');
    assert.ok(Array.isArray(initialBooks), 'O catálogo é uma lista.');
    assert.ok(!initialBooks.some((book) => book.titulo === title), 'O título de teste é único.');

    const payload = {
      codigo: 0,
      codEditora: editoras[0].codEditora,
      titulo: title,
      resumo: 'Registro fictício criado pelo smoke HTTP e removido ao final.',
      autores: ['Teste automatizado'],
    };
    creationRequested = true;
    await request('/api/livros', { method: 'POST', body: payload, status: 200 });

    const booksAfterCreation = await request('/api/livros');
    assert.ok(Array.isArray(booksAfterCreation), 'O catálogo após inclusão é uma lista.');
    const created = booksAfterCreation.find((book) => book.titulo === title);
    assert.ok(created, 'O livro incluído pode ser lido pela API.');
    assert.ok(Number.isInteger(created.codigo) && created.codigo > 0, 'A API atribui um código válido.');
    assert.equal(created.codEditora, payload.codEditora);
    assert.equal(created.resumo, payload.resumo);
    assert.deepEqual(created.autores, payload.autores);
    assert.ok(
      !initialBooks.some((book) => book.codigo === created.codigo),
      'O código do livro novo não colide com o catálogo inicial.',
    );

    await request(`/api/livros/${created.codigo}`, { method: 'DELETE' });
    const booksAfterDeletion = await request('/api/livros');
    assert.ok(Array.isArray(booksAfterDeletion), 'O catálogo após exclusão é uma lista.');
    assert.ok(
      !booksAfterDeletion.some((book) => book.codigo === created.codigo || book.titulo === title),
      'O livro excluído não aparece mais no catálogo.',
    );

    await request('/api/livros', { method: 'PATCH', status: 405 });
  } catch (error) {
    failure = error;
  } finally {
    if (creationRequested) {
      try {
        const remainingBooks = await request('/api/livros');
        assert.ok(Array.isArray(remainingBooks), 'A limpeza consegue consultar o catálogo.');
        for (const book of remainingBooks.filter((item) => item.titulo === title)) {
          assert.ok(Number.isInteger(book.codigo), 'A limpeza usa somente códigos inteiros.');
          await request(`/api/livros/${book.codigo}`, { method: 'DELETE' });
        }
      } catch (cleanupError) {
        failure = failure
          ? new AggregateError([failure, cleanupError], 'O smoke e a limpeza falharam.')
          : cleanupError;
      }
    }
  }

  if (failure) throw failure;
});
