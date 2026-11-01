(() => {
  'use strict';
  const button=document.getElementById('fullscreen');
  const frame=document.getElementById('frame');
  const root=document.documentElement;
  let expanded=false,busy=false,ownedFullscreen=false;
  function fit(){
    if(!expanded)return;
    const width=window.innerWidth,height=window.innerHeight;
    const ratio=width<height?3/4:16/9;
    const w=Math.max(1,Math.min(width,height*ratio));
    frame.style.setProperty('--expanded-width',w+'px');
    frame.style.setProperty('--expanded-height',(w/ratio)+'px');
  }
  function display(value){
    expanded=value;document.body.classList.toggle('game-expanded',value);
    button.setAttribute('aria-pressed',String(value));
    button.setAttribute('aria-label',value?'Restaurar pantalla':'Pantalla completa');
    button.title=value?'Restaurar pantalla (Esc)':'Pantalla completa';
    fit();
  }
  async function leave(){
    if(ownedFullscreen&&document.fullscreenElement===root){
      try{await document.exitFullscreen();}catch{return;}
    }
    ownedFullscreen=false;display(false);
  }
  button.addEventListener('click',async()=>{
    if(busy)return;
    busy=true;
    try{
      if(expanded)await leave();
      else{
        display(true);
        if(!document.fullscreenElement&&root.requestFullscreen){
          try{await root.requestFullscreen();ownedFullscreen=true;}
          catch{/* Retain the expanded window when native fullscreen is unavailable. */}
        }
        fit();
      }
    }finally{busy=false;document.getElementById('game').focus({preventScroll:true});}
  });
  document.addEventListener('fullscreenchange',()=>{
    if(ownedFullscreen&&!document.fullscreenElement){ownedFullscreen=false;display(false);}
    else fit();
  });
  document.addEventListener('keydown',e=>{
    if(e.code!=='Escape'||!expanded||(document.getElementById('unlocks-dialog').open||document.getElementById('record-dialog')?.open))return;
    e.preventDefault();e.stopImmediatePropagation();void leave();
  },true);
  window.addEventListener('resize',fit);
})();
