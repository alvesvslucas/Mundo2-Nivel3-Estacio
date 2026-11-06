import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  cwd: fileURLToPath(new URL('../', import.meta.url)),
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_DEMO_MODE: 'true' },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
