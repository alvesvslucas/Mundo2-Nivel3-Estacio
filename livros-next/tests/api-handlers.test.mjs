import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

// Run the repository's actual TypeScript handlers/controllers without Next.js.
// HTTP request/response objects are simulated; next build + HTTP smoke is separate.
const root = resolve(process.env.NEXT_TEST_SOURCE_DIR || fileURLToPath(new URL('../', import.meta.url)));
function application() {
  const cache = new Map();
  function load(path) {
    const filename = path.endsWith('.ts') ? path : path.endsWith('/livros') || path.endsWith('/editoras') ? path + '/index.ts' : path + '.ts';
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    let code = stripTypeScriptTypes(readFileSync(filename, 'utf8'), { mode: 'strip' });
    const namedExports = [...code.matchAll(/export const (\w+)/g)].map(match => match[1]);
    code = code
      .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, 'const $1 = require("$2").default;')
      .replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g, 'const {$1} = require("$2");')
      .replace(/export default /g, 'module.exports.default = ')
      .replace(/export const /g, 'const ');
    code += namedExports.map(name => `\nmodule.exports.${name} = ${name};`).join('');
    const execute = new vm.Script('(function(require, module, exports) {\n' + code + '\n})', { filename }).runInThisContext();
    execute(dependency => {
      assert.ok(dependency.startsWith('@/') || dependency.startsWith('.'), 'Only local runtime imports: ' + dependency);
      let target = dependency.startsWith('@/') ? resolve(root, dependency.slice(2)) : resolve(dirname(filename), dependency);
      if (dependency === '.') target += '/index.ts';
      return load(target);
    }, module, module.exports);
    return module.exports;
  }
  return (endpoint, method = 'GET', body, query = {}) => {
    const response = {
      statusCode: 200, headers: {}, body: undefined,
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(value) { this.body = JSON.parse(JSON.stringify(value)); return this; },
    };
    load(resolve(root, 'pages/api', endpoint)).default({ method, body, query }, response);
    return response;
  };
}
const validBook = () => ({ codigo: 0, codEditora: 123, titulo: 'Livro de teste', resumo: 'Resumo fictício', autores: ['Autor fictício'] });

test('lista livros e editoras de exemplo', () => {
  const request = application();
  const books = request('livros/index.ts');
  assert.equal(books.statusCode, 200);
  assert.ok(books.body.length > 0);
  const editors = request('editoras/index.ts');
  assert.equal(editors.statusCode, 200);
  assert.ok(editors.body.some(editor => editor.codEditora === 123));
});

test('cadastra com código gerado, lista e exclui o mesmo livro sem afetar os demais', () => {
  const request = application();
  const before = request('livros/index.ts').body;
  const create = request('livros/index.ts', 'POST', { ...validBook(), codigo: before[0].codigo, admin: true });
  assert.equal(create.statusCode, 200);
  const after = request('livros/index.ts').body;
  assert.equal(after.length, before.length + 1);
  const created = after.find(book => book.titulo === 'Livro de teste');
  assert.ok(created.codigo > Math.max(...before.map(book => book.codigo)));
  assert.equal(Object.hasOwn(created, 'admin'), false);
  const deleted = request('livros/[codigo].ts', 'DELETE', undefined, { codigo: String(created.codigo) });
  assert.equal(deleted.statusCode, 200);
  assert.deepEqual(request('livros/index.ts').body, before);
});

test('recusa métodos sem alterar o catálogo e informa Allow', () => {
  const request = application();
  const before = request('livros/index.ts').body;
  const response = request('livros/index.ts', 'PUT', validBook());
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET, POST');
  const deleteRoute = request('livros/[codigo].ts', 'GET', undefined, { codigo: '1478' });
  assert.equal(deleteRoute.statusCode, 405);
  assert.equal(deleteRoute.headers.Allow, 'DELETE');
  assert.deepEqual(request('livros/index.ts').body, before);
});

for (const [label, body] of [
  ['corpo ausente', undefined],
  ['corpo como array', []],
  ['título em branco', { ...validBook(), titulo: '  ' }],
  ['resumo inválido', { ...validBook(), resumo: 5 }],
  ['editora inexistente', { ...validBook(), codEditora: 999999 }],
  ['autor inválido', { ...validBook(), autores: ['Autor', { nome: 'objeto' }] }],
  ['lista de autores vazia', { ...validBook(), autores: [] }],
]) {
  test('POST rejeita ' + label + ' sem gravar', () => {
    const request = application();
    const before = request('livros/index.ts').body;
    assert.equal(request('livros/index.ts', 'POST', body).statusCode, 400);
    assert.deepEqual(request('livros/index.ts').body, before);
  });
}

test('DELETE rejeita código inválido ou inexistente sem remover livros', () => {
  const request = application();
  const before = request('livros/index.ts').body;
  for (const codigo of ['abc', '0', '-1', '1.5', ['1478', '2556']]) {
    assert.equal(request('livros/[codigo].ts', 'DELETE', undefined, { codigo }).statusCode, 400);
  }
  assert.equal(request('livros/[codigo].ts', 'DELETE', undefined, { codigo: '999999' }).statusCode, 404);
  assert.deepEqual(request('livros/index.ts').body, before);
});

test('normaliza espaços sem aceitar propriedades extras do corpo', () => {
  const request = application();
  assert.equal(request('livros/index.ts', 'POST', { ...validBook(), titulo: '  Título  ', autores: ['  Autor  '], extra: 'ignorar' }).statusCode, 200);
  const book = request('livros/index.ts').body.find(book => book.titulo === 'Título');
  assert.deepEqual(book.autores, ['Autor']);
  assert.equal(Object.hasOwn(book, 'extra'), false);
});
