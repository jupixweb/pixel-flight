const endpoint = '/api/daily-record';
const pagesOrigin = 'https://jupixweb.github.io';
const mime = { html: 'text/html', js: 'text/javascript', css: 'text/css' };

async function readSubmission(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 4096) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
  return JSON.parse(body + decoder.decode());
}

async function dailyRecord(request, env, url) {
  const origin = request.headers.get('Origin');
  const headers = { 'Cache-Control': 'no-store', Vary: 'Origin' };
  if (origin === pagesOrigin) headers['Access-Control-Allow-Origin'] = origin;
  const json = (body, status = 200) => Response.json(body, { status, headers });

  if (origin && origin !== url.origin && origin !== pagesOrigin) {
    return json({ error: 'origin_not_allowed' }, 403);
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    } });
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  const daily = window.flightDaily;
  const date = url.searchParams.get('date') ?? daily.utcDate();
  if (!daily.validDate(date) || date > daily.utcDate()) return json({ error: 'invalid_date' }, 400);
  if (!env.BUCKET) return json({ error: 'unavailable' }, 503);

  const key = 'daily/' + daily.rules + '/' + date + '.txt';
  try {
    let score;
    if (request.method === 'POST') {
      let run;
      try { run = await readSubmission(request); }
      catch { return json({ error: 'invalid_score' }, 400); }
      if (!daily.validResult(run, date) || run.pipes > daily.length) {
        return json({ error: 'invalid_score' }, 400);
      }
      if (date !== daily.utcDate()) return json({ error: 'day_closed' }, 409);

      score = run.score;
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      const file = await env.BUCKET.get(key);
      const best = file ? Number(await file.text()) : null;
      if (score === undefined || (best !== null && best >= score)) {
        return json({ date, rules: daily.rules, record: best === null ? null : { score: best } });
      }
      const onlyIf = file
        ? new Headers({ 'If-Match': file.httpEtag })
        : new Headers({ 'If-None-Match': '*' });
      const saved = await env.BUCKET.put(key, String(score) + '\n', {
        onlyIf, httpMetadata: { contentType: 'text/plain' },
      });
      if (saved) return json({ date, rules: daily.rules, record: { score } });
    }
    return json({ error: 'retry' }, 503);
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === endpoint) return dailyRecord(request, env, url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!Object.hasOwn(assets, path)) return new Response('No encontrado', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : assets[path], {
      headers: { 'Content-Type': mime[path.split('.').pop()] + '; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  },
};
