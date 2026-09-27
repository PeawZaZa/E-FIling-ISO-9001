import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { constants, existsSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import net from 'node:net';
import { createReadStream } from 'node:fs';

export const manifestName = 'manifest-sha256.txt';

export function parseDatabaseUrl(value) {
  if (!value) throw new Error('DATABASE_URL is not configured');
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL must use PostgreSQL');
  const schema = url.searchParams.get('schema') || 'public';
  const sslmode = url.searchParams.get('sslmode') || undefined;
  const metadata = { host: url.hostname, port: url.port || '5432', database: decodeURIComponent(url.pathname.slice(1)), schema, ...(sslmode ? { sslmode } : {}) };
  if (!metadata.database) throw new Error('DATABASE_URL does not name a database');
  return {
    metadata,
    environment: {
      PGHOST: metadata.host, PGPORT: metadata.port, PGDATABASE: metadata.database,
      PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password),
      ...(sslmode ? { PGSSLMODE: sslmode } : {}),
    },
  };
}

export function resolveStoragePaths(projectRoot, environment) {
  return {
    documents: resolve(environment.DOCUMENT_STORAGE_DIR || join(projectRoot, '.local', 'document-storage')),
    records: resolve(environment.RECORD_STORAGE_DIR || join(projectRoot, '.local', 'record-storage')),
  };
}

async function filesUnder(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const full = join(current, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(root, full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

async function sha256(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

export function isPathInside(parent, candidate) {
  const rel = relative(resolve(parent), resolve(candidate));
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

export async function writeManifest(packageRoot) {
  const manifestPath = join(packageRoot, manifestName);
  const files = (await filesUnder(packageRoot)).filter(path => path !== manifestPath).sort();
  const lines = [];
  for (const path of files) lines.push(`${await sha256(path)}  ${relative(packageRoot, path).split(sep).join('/')}`);
  await writeFile(manifestPath, `${lines.join('\n')}\n`, 'utf8');
  return lines.length;
}

export async function verifyManifest(packageRoot) {
  const text = await readFile(join(packageRoot, manifestName), 'utf8');
  const errors = [];
  const listed = new Set();
  for (const line of text.split(/\r?\n/).filter(Boolean)) {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    if (!match) { errors.push(`invalid manifest line: ${line}`); continue; }
    const path = resolve(packageRoot, ...match[2].split('/'));
    listed.add(match[2]);
    if (!path.startsWith(`${resolve(packageRoot)}${sep}`)) { errors.push(`unsafe manifest path: ${match[2]}`); continue; }
    try { if (await sha256(path) !== match[1]) errors.push(`checksum mismatch: ${match[2]}`); }
    catch { errors.push(`missing file: ${match[2]}`); }
  }
  const actual = (await filesUnder(packageRoot)).filter(path => path !== join(packageRoot, manifestName)).map(path => relative(packageRoot, path).split(sep).join('/'));
  for (const path of actual) if (!listed.has(path)) errors.push(`unexpected file: ${path}`);
  return errors;
}

export async function assertEmptyDirectory(path) {
  try {
    const info = await stat(path);
    if (!info.isDirectory()) throw new Error(`restore target is not a directory: ${path}`);
    if ((await readdir(path)).length) throw new Error(`restore target is not empty: ${path}`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

export async function copyStorage(source, target) {
  await mkdir(target, { recursive: true });
  try { await access(source, constants.R_OK); }
  catch (error) { if (error?.code === 'ENOENT') return 0; throw error; }
  let count = 0;
  for (const path of await filesUnder(source)) {
    const rel = relative(source, path);
    if (rel.split(sep).includes('incoming')) continue;
    const destination = join(target, rel);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(path, destination, constants.COPYFILE_EXCL);
    count++;
  }
  return count;
}

export function findPostgresTool(name, projectRoot, environment = process.env) {
  const executable = process.platform === 'win32' ? `${name}.exe` : name;
  const candidates = [];
  if (environment.POSTGRES_BIN_DIR) candidates.push(join(environment.POSTGRES_BIN_DIR, executable));
  for (const item of (environment.PATH || '').split(delimiter).filter(Boolean)) candidates.push(join(item, executable));
  if (process.platform === 'win32') {
    for (const base of [environment.ProgramFiles, environment['ProgramFiles(x86)']].filter(Boolean)) {
      for (let version = 20; version >= 12; version--) candidates.push(join(base, 'PostgreSQL', String(version), 'bin', executable));
    }
  }
  candidates.push(join(projectRoot, '.local', 'postgres', 'package', 'native', 'bin', executable));
  return candidates.find(path => { try { return spawnSync(path, ['--version'], { stdio: 'ignore' }).status === 0; } catch { return false; } });
}

export function requirePostgresTool(name, projectRoot, environment = process.env, explicitBin) {
  const executable = process.platform === 'win32' ? `${name}.exe` : name;
  if (explicitBin) {
    const candidate = join(resolve(explicitBin), executable);
    if (!existsSync(candidate)) throw new Error(`${executable} was not found in --pg-bin directory: ${resolve(explicitBin)}`);
  }
  const tool = findPostgresTool(name, projectRoot, explicitBin ? { ...environment, POSTGRES_BIN_DIR: resolve(explicitBin) } : environment);
  if (!tool) throw new Error(`${executable} was not found or could not run; install PostgreSQL client tools or pass the directory that contains ${executable} with --pg-bin`);
  return tool;
}

export function runPostgresTool(tool, args, databaseEnvironment) {
  const result = spawnSync(tool, args, { stdio: 'inherit', env: { ...process.env, ...databaseEnvironment } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${tool.split(/[\\/]/).at(-1)} failed with exit code ${result.status ?? 'unknown'}`);
}

export async function isPortOpen(port, host = '127.0.0.1') {
  return new Promise(resolveResult => {
    const socket = net.createConnection({ host, port });
    const done = value => { socket.destroy(); resolveResult(value); };
    socket.setTimeout(500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

export async function verifyStorageReferences(prisma, storage) {
  const [documents, dars, evidence] = await Promise.all([
    prisma.documentFile.findMany({ select: { storagePath: true } }),
    prisma.darFile.findMany({ select: { storagePath: true } }),
    prisma.evidence.findMany({ select: { storagePath: true } }),
  ]);
  const groups = [
    ['DocumentFile', storage.documents, documents],
    ['DarFile', storage.documents, dars],
    ['Evidence', storage.records, evidence],
  ];
  const missing = [];
  for (const [entity, root, rows] of groups) {
    for (const row of rows) {
      try { await access(join(root, row.storagePath), constants.R_OK); }
      catch { missing.push(`${entity}:${row.storagePath}`); }
    }
  }
  return { references: { documentFiles: documents.length, darFiles: dars.length, evidence: evidence.length }, missing };
}
