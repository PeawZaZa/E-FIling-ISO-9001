import dotenv from 'dotenv';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
// Validation and generation do not connect to a database.
process.env.DATABASE_URL ||= 'postgresql://unused:unused@127.0.0.1:5432/efiling';
process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL = 'true';
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url)), ...process.argv.slice(2), '--schema', '../prisma/schema.prisma'], { cwd: root, stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
