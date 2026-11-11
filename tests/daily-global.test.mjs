import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../dist/server/index.js';

test('independent requests share the highest valid result for the same UTC day', async () => {
  const files = new Map();
  const env = { BUCKET: {
    async get(key) {
      const text = files.get(key);
      return text === undefined ? null : { text: async () => text, httpEtag: JSON.stringify(text) };
    },
    async put(key, text, { onlyIf }) {
      const previous = files.get(key);
      if (previous !== undefined && onlyIf.get('If-None-Match') === '*') return null;
      if (onlyIf.has('If-Match') && onlyIf.get('If-Match') !== JSON.stringify(previous)) return null;
      files.set(key, text);
      return {};
    },
  } };
  const date = new Date().toISOString().slice(0, 10);
  const endpoint = 'https://example.test/api/daily-record?date=' + date;
  const result = { date, rules: 'daily-v4', score: 5, pipes: 5, days: 1, bonus: 0,
    bombs: 0, clocks: 0, rasantes: 0, speed: 1.05, completed: false };
  const submit = (run, country) => {
    const request = new Request(endpoint, { method: 'POST', body: JSON.stringify(run) });
    request.cf = { country };
    return worker.fetch(request, env);
  };
  assert.equal((await (await worker.fetch(new Request(endpoint), env)).json()).record, null);
  assert.equal((await submit({ ...result, score: 999 })).status, 400);
  const scores = [5, 7, 6];
  await Promise.all(scores.map(async score => {
    assert.equal((await submit({ ...result, score, pipes: score }, score === 7 ? 'AR' : 'UY')).status, 200);
  }));
  const shared = await worker.fetch(new Request(endpoint), env);
  assert.deepEqual((await shared.json()).record, { score: 7, country: 'AR' });
  const earlier = await worker.fetch(new Request('https://example.test/api/daily-record?date=2020-01-01'), env);
  assert.equal((await earlier.json()).record, null);
  assert.match(await (await worker.fetch(new Request('https://example.test/'), env)).text(), /RÉCORD GLOBAL DE HOY/);
  files.set('daily/daily-v4/2020-01-01.txt', '42\n');
  const legacy = await worker.fetch(new Request('https://example.test/api/daily-record?date=2020-01-01'), env);
  assert.deepEqual((await legacy.json()).record, { score: 42, country: null });
  await submit({ ...result, score: 7, pipes: 7 }, 'BR');
  assert.equal(files.get('daily/daily-v4/' + date + '.txt'), '7\nAR\n');
});
