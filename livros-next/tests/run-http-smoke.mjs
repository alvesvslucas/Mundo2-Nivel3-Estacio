import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const origin = 'http://127.0.0.1:3187';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3187'], { cwd, stdio: 'inherit' });
let serverError;
server.on('error', error => { serverError = error; });
const serverExit = once(server, 'exit');

try {
  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline && !ready) {
    if (serverError) throw serverError;
    if (server.exitCode !== null || server.signalCode !== null) throw new Error('Next encerrou antes da verificação HTTP.');
    try {
      const response = await fetch(origin + '/api/editoras', { signal: AbortSignal.timeout(1_000), redirect: 'error' });
      ready = response.ok;
      await response.arrayBuffer();
    } catch { /* aguardar apenas o servidor local */ }
    if (!ready) await delay(250);
  }
  if (!ready) throw new Error('Next não ficou disponível em 60 segundos.');
  const tests = spawn(process.execPath, ['--test', 'tests/http-smoke.test.mjs'], {
    cwd, stdio: 'inherit', env: { ...process.env, NEXT_TEST_ORIGIN: origin },
  });
  tests.on('error', error => { console.error(error); process.exitCode = 1; });
  const [code] = await once(tests, 'exit');
  if (code !== 0) process.exitCode = 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server.exitCode === null && server.signalCode === null) {
    server.kill();
    await Promise.race([serverExit, delay(5_000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL');
  }
}
