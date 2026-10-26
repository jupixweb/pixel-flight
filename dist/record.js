(() => {
  'use strict';
  const el=id=>document.getElementById(id),api=window.pixelFlight;
  const dialog=el('record-dialog'),button=el('record-open');
  function open(){
    const state=api.getState();
    if(state.state==='playing'&&!state.paused)api.pause();
    const run=state.bestRun;
    el('record-total').textContent=String(state.best);
    el('record-stats').hidden=!run;
    el('record-note').textContent=run?'Datos de la partida que consiguió esta puntuación.':state.best>0?'Este récord es anterior al guardado de estadísticas por partida. Sus detalles se registrarán cuando lo superes.':'Tu próximo récord aparecerá aquí. ¡A volar!';
    if(run){
      for(const key of ['days','pipes','bonus'])el('record-run-'+key).textContent=String(run[key]);
      el('record-run-speed').textContent='×'+run.speed.toFixed(2).replace('.',',');
      el('record-run-breakdown').textContent='Bombas '+run.bombs+' · Relojes '+run.clocks+' · Vuelos rasantes '+run.rasantes+' ('+run.rasantes/25+')';
    }
    dialog.showModal();button.setAttribute('aria-expanded','true');
  }
  button.addEventListener('click',open);
  el('record-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>button.setAttribute('aria-expanded','false'));
  window.flightRecordUI={isOpen:()=>dialog.open};
})();
