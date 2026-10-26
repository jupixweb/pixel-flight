(() => {
  'use strict';
  const api=window.pixelFlight,art=window.flightCosmetics,el=id=>document.getElementById(id);
  const cards=el('collection-cards'),dialog=el('unlocks-dialog'),opener=el('home-unlocks');
  const pageSize=3;
  let group='bird',page=0;
  function node(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
  function preview(data){
    const canvas=el('collection-preview'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    ctx.clearRect(0,0,288,76);ctx.fillStyle='#18332e';ctx.fillRect(0,0,288,76);
    const current=key=>data.items[key].find(i=>i.selected);
    for(let i=0;i<10;i++){ctx.fillStyle=current('trail').colors[i%current('trail').colors.length];ctx.fillRect(12+i*6,40+Math.round(Math.sin(i)*4),3,3);}
    art.drawBird(ctx,current('bird'),92,40,2.5);art.swatch(ctx,'blast',current('blast'),230,38);
    ctx.fillStyle='#adc4af';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText('TU VUELO',92,68);ctx.fillText('EXPLOSIÓN',230,68);
    canvas.setAttribute('aria-label','Vista previa: '+Object.keys(data.items).map(k=>current(k).name).join(', '));
  }
  function render(){
    if(!dialog.open)return;
    const data=api.getCollection(),playing=api.getState().state==='playing';
    el('collection-count').textContent=data.available+' / '+data.total+' ESTILOS';
    preview(data);cards.replaceChildren();
    for(const button of el('collection-groups').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.category===group));
    const pageCount=Math.ceil(data.items[group].length/pageSize);
    page=Math.min(page,pageCount-1);
    const dots=el('collection-page-dots');
    if(dots.children.length!==pageCount){
      dots.replaceChildren();
      for(let i=0;i<pageCount;i++){
        const dot=node('button','collection-dot');dot.type='button';dot.dataset.page=String(i);dot.setAttribute('aria-controls','collection-cards');
        const circle=node('span');circle.setAttribute('aria-hidden','true');dot.append(circle);
        dot.addEventListener('click',()=>{page=i;render();});dots.append(dot);
      }
    }
    el('collection-page-label').textContent='Página '+(page+1)+' de '+pageCount;
    for(const dot of el('collection-pagination').querySelectorAll('[data-page]')){
      const active=Number(dot.dataset.page)===page;
      dot.setAttribute('aria-current',String(active));
      dot.setAttribute('aria-label','Página '+(Number(dot.dataset.page)+1)+' de '+pageCount+(active?', actual':''));
    }
    const visible=data.items[group].slice(page*pageSize,(page+1)*pageSize);
    cards.classList.toggle('is-single-page',visible.length===1);
    for(const item of visible){
      const card=node('button','cosmetic-card'+(item.selected?' is-selected':'')+(!item.available?' is-locked':''));
      card.type='button';card.id='cosmetic-'+group+'-'+item.id;card.disabled=!item.available||playing;
      card.setAttribute('aria-pressed',String(item.selected));
      const state=item.selected?'EQUIPADO':item.available?'ELEGIR':'BLOQUEADO';
      card.setAttribute('aria-label',item.name+'. '+state+'. '+(item.goal?.description||'Disponible desde el inicio.'));
      const canvas=node('canvas','cosmetic-swatch');canvas.width=72;canvas.height=44;canvas.setAttribute('aria-hidden','true');
      const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.globalAlpha=item.available?1:.5;art.swatch(ctx,group,item,36,22);
      card.append(canvas,node('strong','cosmetic-name',item.name),node('span','cosmetic-state',state));
      card.append(node('span','cosmetic-goal',item.goal?.description||'Tu estilo original. Siempre disponible.'));
      if(item.goal){
        const a=item.goal,current=Math.min(a.goal,data.progress[a.key]);
        card.append(node('span','cosmetic-progress',item.available?'✓ '+a.title:current+' / '+a.goal+' '+a.unit));
        const progress=node('progress','');progress.max=a.goal;progress.value=item.available?a.goal:current;progress.setAttribute('aria-label','Progreso: '+a.title);card.append(progress);
      }
      card.addEventListener('click',()=>{
        if(api.selectCosmetic(group,item.id)){
          el('collection-status').textContent='Equipado: '+item.name+'. '+(api.getCollection().persistent?'Guardado en este navegador.':'Se conservará durante esta sesión.');
          el(card.id)?.focus({preventScroll:true});
        }
      });cards.append(card);
    }
    el('collection-status').textContent=playing?'Podrás cambiar tu estilo al terminar la partida.':data.persistent?'Tus desbloqueos y elecciones se guardan en este navegador.':'Tus desbloqueos y elecciones se conservarán durante esta sesión.';
  }
  for(const button of el('collection-groups').querySelectorAll('button'))button.addEventListener('click',()=>{group=button.dataset.category;page=0;render();});
  function movePage(step){const count=Math.ceil(api.getCollection().items[group].length/pageSize);page=(page+step+count)%count;render();}
  el('collection-prev').addEventListener('click',()=>movePage(-1));
  el('collection-next').addEventListener('click',()=>movePage(1));
  el('collection-pagination').addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();movePage(event.key==='ArrowRight'?1:-1);}
  });
  function close(){if(dialog.open)dialog.close();opener.setAttribute('aria-expanded','false');}
  opener.addEventListener('click',()=>{if(api.getState().state!=='ready')return;page=0;dialog.showModal();opener.setAttribute('aria-expanded','true');render();});
  el('collection-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>opener.setAttribute('aria-expanded','false'));
  window.flightCollectionUI={refresh:render,close};
})();
