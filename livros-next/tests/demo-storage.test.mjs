import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

// Import the actual local TypeScript modules without installing Next or a test framework.
const root = resolve(process.env.NEXT_TEST_SOURCE_DIR || fileURLToPath(new URL('../', import.meta.url)));
const moduleUrls = new Map();
function sourceModule(filename) {
  if (moduleUrls.has(filename)) return moduleUrls.get(filename);
  assert.ok(filename.startsWith(root + sep), 'Only project source files are loaded.');
  const source = stripTypeScriptTypes(readFileSync(filename, 'utf8'), { mode: 'strip' });
  const executable = source.replace(/\bfrom\s+(['"])([^'"]+)\1/g, (match, quote, dependency) => {
    assert.ok(dependency.startsWith('.') || dependency.startsWith('@/'), `Local dependency: ${dependency}`);
    const base = dependency.startsWith('@/') ? resolve(root, dependency.slice(2)) : resolve(dirname(filename), dependency);
    const target = [base, base + '.ts', resolve(base, 'index.ts')].find((path) => path.endsWith('.ts') && existsSync(path));
    assert.ok(target, `Source exists: ${dependency}`);
    return `from ${JSON.stringify(sourceModule(target))}`;
  });
  const url = 'data:text/javascript;base64,' + Buffer.from(executable).toString('base64');
  moduleUrls.set(filename, url);
  return url;
}

const demo = await import(sourceModule(resolve(root, 'classes/controle/CatalogoDemo.ts')));
const seed = await import(sourceModule(resolve(root, 'classes/dados/livrosIniciais.ts')));
const booksApi = await import(sourceModule(resolve(root, 'pages/api/livros/index.ts')));
const deleteApi = await import(sourceModule(resolve(root, 'pages/api/livros/[codigo].ts')));
const {
  CHAVE_CATALOGO_DEMO: key, ErroCatalogoDemo,
  carregarCatalogoDemo: load, incluirLivroDemo: add,
  excluirLivroDemo: remove, reiniciarCatalogoDemo: reset,
} = demo;

function storage() {
  const values = new Map();
  return {
    getItem(name) { return values.has(name) ? values.get(name) : null; },
    setItem(name, value) { values.set(name, String(value)); },
    removeItem(name) { values.delete(name); },
  };
}
const input = () => ({
  codigo: 1478, codEditora: 123, titulo: '  Livro fictício  ',
  resumo: '  Resumo de demonstração  ', autores: ['  Autor fictício  '], admin: true,
});

test('seed é imutável e cada leitura inicial recebe uma cópia independente', () => {
  assert.equal(Object.isFrozen(seed.LIVROS_INICIAIS), true);
  assert.equal(Object.isFrozen(seed.LIVROS_INICIAIS[0]), true);
  assert.equal(Object.isFrozen(seed.LIVROS_INICIAIS[0].autores), true);
  assert.throws(() => { seed.LIVROS_INICIAIS[0].autores.push('Mutação'); }, TypeError);
  const store = storage();
  const first = load(store);
  const original = seed.criarLivrosIniciais();
  first[0].titulo = 'Alterado fora do adaptador';
  first[0].autores.push('Outro autor');
  first.pop();
  assert.deepEqual(load(store), original);
  assert.equal(store.getItem(key), null, 'Consultar o seed não grava dados.');
});

test('cadastro normaliza campos, gera código e persiste navegação/releitura antes da exclusão', () => {
  const store = storage();
  const before = load(store);
  const created = add(store, input()).find((book) => book.titulo === 'Livro fictício');
  assert.ok(created.codigo > Math.max(...before.map((book) => book.codigo)));
  assert.deepEqual(created, {
    codigo: created.codigo, codEditora: 123, titulo: 'Livro fictício',
    resumo: 'Resumo de demonstração', autores: ['Autor fictício'],
  });
  assert.deepEqual(load(store).find((book) => book.codigo === created.codigo), created);
  created.autores.push('Mutação externa');
  assert.deepEqual(load(store).find((book) => book.codigo === created.codigo).autores, ['Autor fictício']);
  assert.deepEqual(remove(store, created.codigo), before);
  assert.deepEqual(load(store), before);
});

test('dois armazenamentos de visitantes têm cadastros, exclusões e resets isolados', () => {
  const first = storage();
  const second = storage();
  const original = load(second);
  const mine = add(first, input());
  assert.deepEqual(load(second), original);
  remove(second, original[0].codigo);
  assert.deepEqual(load(first), mine);
  reset(first);
  assert.deepEqual(load(first), original);
  assert.equal(load(second).length, original.length - 1);
});

test('catálogo vazio é válido e reiniciar restaura o seed sem remover outras chaves', () => {
  const store = storage();
  store.setItem('outra-aplicacao', 'preservar');
  for (const book of load(store)) remove(store, book.codigo);
  assert.deepEqual(load(store), []);
  assert.equal(add(store, input())[0].codigo, 1);
  assert.deepEqual(reset(store), seed.criarLivrosIniciais());
  assert.equal(store.getItem(key), null);
  assert.equal(store.getItem('outra-aplicacao'), 'preservar');
});

for (const [label, value] of [
  ['corpo ausente', undefined],
  ['array', []],
  ['título em branco', { ...input(), titulo: ' ' }],
  ['resumo inválido', { ...input(), resumo: 42 }],
  ['editora inexistente', { ...input(), codEditora: 999 }],
  ['código da editora como texto', { ...input(), codEditora: '123' }],
  ['autores vazios', { ...input(), autores: [] }],
  ['autor como objeto', { ...input(), autores: [{ nome: 'Autor' }] }],
  ['autor em branco', { ...input(), autores: [' '] }],
]) {
  test(`cadastro rejeita ${label} e preserva o armazenamento`, () => {
    const store = storage();
    add(store, input());
    const before = store.getItem(key);
    assert.throws(() => add(store, value), ErroCatalogoDemo);
    assert.equal(store.getItem(key), before);
  });
}

for (const [label, corrupted] of [
  ['JSON truncado', '{'],
  ['raiz como array', '[]'],
  ['versão desconhecida', JSON.stringify({ versao: 2, livros: [] })],
  ['catálogo ausente', JSON.stringify({ versao: 1 })],
  ['livro inválido', JSON.stringify({ versao: 1, livros: [{}] })],
  ['código duplicado', JSON.stringify({ versao: 1, livros: [seed.LIVROS_INICIAIS[0], seed.LIVROS_INICIAIS[0]] })],
  ['código não inteiro', JSON.stringify({ versao: 1, livros: [{ ...seed.LIVROS_INICIAIS[0], codigo: 1.5 }] })],
  ['editora inválida', JSON.stringify({ versao: 1, livros: [{ ...seed.LIVROS_INICIAIS[0], codEditora: 999 }] })],
]) {
  test(`dados locais com ${label} exigem reset explícito e não são sobrescritos`, () => {
    const store = storage();
    store.setItem(key, corrupted);
    assert.throws(() => load(store), /Reiniciar demonstração/);
    assert.throws(() => add(store, input()), ErroCatalogoDemo);
    assert.throws(() => remove(store, 1478), ErroCatalogoDemo);
    assert.equal(store.getItem(key), corrupted);
    assert.deepEqual(reset(store), seed.criarLivrosIniciais());
    assert.deepEqual(load(store), seed.criarLivrosIniciais());
  });
}

test('falha de leitura é informada sem tentar gravar', () => {
  let writes = 0;
  const denied = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { writes += 1; },
    removeItem() {},
  };
  assert.throws(() => load(denied), /Não foi possível ler/);
  assert.throws(() => add(denied, input()), /Não foi possível ler/);
  assert.equal(writes, 0);
});

test('quota/falha de gravação preserva cadastro e exclusão anteriores', () => {
  const store = storage();
  const created = add(store, input()).at(-1);
  const before = store.getItem(key);
  const full = { ...store, setItem() { throw new Error('QuotaExceededError'); } };
  assert.throws(() => add(full, { ...input(), titulo: 'Outro livro' }), /Não foi possível salvar/);
  assert.equal(store.getItem(key), before);
  assert.throws(() => remove(full, created.codigo), /Não foi possível salvar/);
  assert.equal(store.getItem(key), before);
});

test('falha ao reiniciar mantém os dados e informa a falha', () => {
  const store = storage();
  add(store, input());
  const before = store.getItem(key);
  const denied = { ...store, removeItem() { throw new Error('SecurityError'); } };
  assert.throws(() => reset(denied), /Não foi possível reiniciar/);
  assert.equal(store.getItem(key), before);
});

test('exclusão inválida/ausente e esgotamento de código não alteram o catálogo', () => {
  const store = storage();
  add(store, input());
  const before = store.getItem(key);
  for (const code of [NaN, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, 999999]) {
    assert.throws(() => remove(store, code), ErroCatalogoDemo);
    assert.equal(store.getItem(key), before);
  }
  store.setItem(key, JSON.stringify({ versao: 1, livros: [{ ...seed.LIVROS_INICIAIS[0], codigo: Number.MAX_SAFE_INTEGER }] }));
  const exhausted = store.getItem(key);
  assert.throws(() => add(store, input()), /limite de códigos/);
  assert.equal(store.getItem(key), exhausted);
});

function request(handler, method, body, query = {}) {
  const response = {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = JSON.parse(JSON.stringify(value)); return this; },
  };
  handler({ method, body, query }, response);
  return response;
}

test('somente a flag literal true ativa GET seed e bloqueia escrita das APIs sem mutar o modo padrão', { concurrency: false }, () => {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE;
  let created;
  try {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'TRUE';
    const before = request(booksApi.default, 'GET').body;
    assert.equal(request(booksApi.default, 'POST', input()).statusCode, 200);
    created = booksApi.controleLivro.obterLivros().find((book) => book.titulo === 'Livro fictício');
    assert.ok(created, 'Modo API continua disponível por padrão.');
    const apiState = JSON.parse(JSON.stringify(booksApi.controleLivro.obterLivros()));
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    const read = request(booksApi.default, 'GET');
    assert.equal(read.headers['X-Demo-Mode'], 'session-storage');
    assert.deepEqual(read.body, seed.criarLivrosIniciais());
    const post = request(booksApi.default, 'POST', input());
    assert.equal(post.statusCode, 405);
    assert.equal(post.headers.Allow, 'GET');
    const deletion = request(deleteApi.default, 'DELETE', undefined, { codigo: String(before[0].codigo) });
    assert.equal(deletion.statusCode, 405);
    assert.equal(deletion.headers.Allow, '');
    assert.deepEqual(request(booksApi.default, 'GET').body, read.body);
    assert.deepEqual(booksApi.controleLivro.obterLivros(), apiState, 'Modo demo não muta o array da API.');
  } finally {
    if (created) booksApi.controleLivro.excluir(created.codigo);
    if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
    else process.env.NEXT_PUBLIC_DEMO_MODE = previous;
  }
});
