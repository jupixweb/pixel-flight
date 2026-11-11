(() => {
  'use strict';
  const origin = window.location.origin;
  const host = 'https://pixel-flight-arcade.jupixweb.chatgpt.site';
  const enabled = origin === host || origin === 'https://jupixweb.github.io';
  const field = document.getElementById('daily-global');
  let generation = 0;
  const submissions = new Map();

  async function request(date, run) {
    if (!enabled) return;
    const url = host + '/api/daily-record?date=' + encodeURIComponent(date);
    const options = { signal: AbortSignal.timeout(5000) };
    if (run) {
      options.method = 'POST';
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify({ ...run, date, rules: window.flightDaily.rules });
    }
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Récord global no disponible');
    return (await response.json()).record;
  }

  window.flightDailyGlobal = {
    async show(date) {
      const current = ++generation;
      field.textContent = enabled ? 'Consultando…' : 'Disponible en la web del juego';
      if (!enabled) return;
      try {
        await submissions.get(date);
        const record = await request(date);
        if (current !== generation) return;
        field.textContent = record
          ? record.score + ' PTS'
          : 'Aún no hay puntuaciones';
      } catch {
        if (current === generation) field.textContent = 'No disponible en este momento';
      }
    },
    submit(date, result) {
      if (!enabled || result.score <= 0) return;
      const pending = Promise.resolve(submissions.get(date))
        .then(() => request(date, result))
        .catch(() => {});
      submissions.set(date, pending);
      void pending.then(() => {
        if (submissions.get(date) === pending) submissions.delete(date);
      });
    },
  };
})();
