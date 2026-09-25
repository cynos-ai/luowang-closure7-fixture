import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pino from 'pino';
import { afterEach, describe, it } from 'vitest';
import { createApp } from '../src/server/app.js';
import { loadConfig } from '../src/server/config.js';
import { initializeDatabase } from '../src/server/db/migrate.js';

const RUN = '01K00000000000000000000000';
const OTHER = '01K00000000000000000000001';
const TOKEN = 'synthetic-cleanup-token-12345678901234567890';
const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanup.length) await cleanup.pop()!();
});

async function fixture(enabled = true) {
  const dir = await mkdtemp(join(tmpdir(), 'website-cleanup-'));
  const config = loadConfig({
    NODE_ENV: 'test',
    CYNOS_DATA_DIR: dir,
    ...(enabled ? { CYNOS_TEST_DATA_CLEANUP_TOKEN: TOKEN } : {}),
  });
  const database = initializeDatabase(config);
  const app = await createApp({ config, database, logger: pino({ level: 'silent' }) });
  cleanup.push(async () => {
    await app.close();
    database.sqlite.close();
    await rm(dir, { recursive: true, force: true });
  });
  const seed = (
    id: string,
    email: string,
    name: string,
    passwordHash = 'synthetic-unused-hash',
  ) => {
    database.sqlite
      .prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, email, name, passwordHash, 'now', 'now');
    database.sqlite
      .prepare('INSERT INTO auth_sessions VALUES (?, ?, ?, ?)')
      .run('session-' + id, id, 'now', 'later');
  };
  return { app, database, seed };
}

describe('opt-in Run-scoped test data cleanup', () => {
  it('is disabled by default and rejects weak deployment credentials', async () => {
    const { app } = await fixture(false);
    assert.equal(
      (await app.inject({ method: 'DELETE', url: `/api/luowang/test-data/${RUN}` })).statusCode,
      404,
    );
    assert.equal(
      (await app.inject({ method: 'GET', url: `/api/luowang/test-data/${RUN}/storage` }))
        .statusCode,
      404,
    );
    assert.throws(() => loadConfig({ CYNOS_TEST_DATA_CLEANUP_TOKEN: 'short' }));
  });
  it('reports only current-Run password storage format counts behind the cleanup token', async () => {
    const { app, seed } = await fixture();
    const hash = '$argon2id$v=19$m=65536,t=3,p=4$c2FsdA$c2FmZWhhc2g';
    seed('hashed', `luowang-${RUN.toLowerCase()}-one@example.test`, 'one', hash);
    seed('other-format', 'two@example.test', `luowang-${RUN}-two`);
    seed('another-run', `luowang-${OTHER.toLowerCase()}-three@example.test`, 'three', hash);
    seed('lookalike', `luowang-${RUN.toLowerCase()}x@example.test`, 'lookalike', hash);
    const url = `/api/luowang/test-data/${RUN}/storage`;
    assert.equal((await app.inject({ method: 'GET', url })).statusCode, 401);
    assert.equal(
      (
        await app.inject({
          method: 'GET',
          url: '/api/luowang/test-data/all/storage',
          headers: { authorization: `Bearer ${TOKEN}` },
        })
      ).statusCode,
      400,
    );
    const response = await app.inject({
      method: 'GET',
      url,
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { runId: RUN, accounts: 2, argon2id: 1, other: 1 });
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.doesNotMatch(
      response.body,
      /password_hash|argon2id\$|example\.test|synthetic-unused-hash/,
    );
    assert.equal(
      (
        await app.inject({
          method: 'DELETE',
          url: `/api/luowang/test-data/${RUN}`,
          headers: { authorization: `Bearer ${TOKEN}` },
        })
      ).statusCode,
      200,
    );
    const empty = await app.inject({
      method: 'GET',
      url,
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    assert.deepEqual(empty.json(), { runId: RUN, accounts: 0, argon2id: 0, other: 0 });
  });
  it('requires authorization and a valid full Run ID without mutating users', async () => {
    const { app, database, seed } = await fixture();
    seed('one', `luowang-${RUN.toLowerCase()}-one@example.test`, 'one');
    assert.equal(
      (await app.inject({ method: 'DELETE', url: `/api/luowang/test-data/${RUN}` })).statusCode,
      401,
    );
    assert.equal(
      (
        await app.inject({
          method: 'DELETE',
          url: '/api/luowang/test-data/all',
          headers: { authorization: `Bearer ${TOKEN}` },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (database.sqlite.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n,
      1,
    );
  });
  it('deletes only exact Run-marked users and cascading sessions; GET independently confirms absence', async () => {
    const { app, database, seed } = await fixture();
    seed('email', `luowang-${RUN.toLowerCase()}-email@example.test`, 'email');
    seed('name', 'name@example.test', `luowang-${RUN}-name`);
    seed('other', `luowang-${OTHER.toLowerCase()}-other@example.test`, 'other');
    seed('lookalike', `luowang-${RUN.toLowerCase()}x@example.test`, 'unmarked');
    const call = (method: 'GET' | 'DELETE') =>
      app.inject({
        method,
        url: `/api/luowang/test-data/${RUN}`,
        headers: { authorization: `Bearer ${TOKEN}` },
      });
    assert.equal((await call('GET')).json().remaining, 2);
    const deleted = await call('DELETE');
    assert.deepEqual(deleted.json(), { runId: RUN, deleted: 2, remaining: 0 });
    assert.equal(deleted.body.includes(TOKEN), false);
    assert.equal((await call('GET')).json().remaining, 0);
    assert.equal((await call('DELETE')).json().deleted, 0);
    assert.equal(
      (database.sqlite.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n,
      2,
    );
    assert.equal(
      (database.sqlite.prepare('SELECT COUNT(*) AS n FROM auth_sessions').get() as { n: number }).n,
      2,
    );
  });
});
