(() => {
  'use strict';
  const themes=[
    {biome:'bosque',name:'SENDERO DE LUCIÉRNAGAS',color:'#d9ff86',accent:'#fff5ba',shape:'fireflies'},
    {biome:'montañas',name:'VIENTO DE CUMBRE',color:'#b4eeff',accent:'#ffffff',shape:'wind'},
    {biome:'ciudad',name:'TÚNEL DE NEÓN',color:'#ff9ee9',accent:'#c8ffff',shape:'neon'},
    {biome:'desierto',name:'DANZA DE ARENA',color:'#ffd67c',accent:'#fff1b5',shape:'sand'},
    {biome:'océano',name:'CRESTA DE LAS OLAS',color:'#83fff1',accent:'#e0ffff',shape:'waves'},
    {biome:'espacio exterior',name:'CINTURÓN DE METEOROS',color:'#ffb38a',accent:'#fff4bf',shape:'meteors'},
    {biome:'planeta alienígena',name:'PORTALES DE CRISTAL',color:'#be9bff',accent:'#baffdf',shape:'portals'},
    {biome:'selva/pantano',name:'ESPORAS LUMINOSAS',color:'#b4ffb6',accent:'#ffe4a0',shape:'spores'},
    {biome:'fondo del océano',name:'CORRIENTE DE BURBUJAS',color:'#8cdfff',accent:'#deffff',shape:'bubbles'}
  ];
  function create({reduced=false,onCollect=()=>{},onComplete=()=>{},onRestEnd=()=>{}}={}){
    let phase='idle',clock=0,due=28,serial=0,age=0,restPipes=0,offered=0,resolved=0,collected=0,seals=[],theme=themes[0];
    function reset(){phase='idle';clock=0;due=28;serial=0;age=restPipes=offered=resolved=collected=0;seals=[];theme=themes[0];}
    function resume(){phase='idle';clock=0;due=28;age=restPipes=offered=resolved=collected=0;seals=[];}
    function blocksEnemies(){return phase!=='idle';}
    function consider({passed,safe,biome,transition=1}){
      if(phase!=='idle'||clock<due||passed<20||passed%20>7||!safe||transition<1)return false;
      theme=themes.find(t=>t.biome===biome)||themes[0];phase='warning';serial++;age=0;offered=resolved=collected=0;seals=[];return true;
    }
    function adjustPlan(plan,baseGap,speed){return phase==='idle'?plan:{...plan,motionScale:0,gap:Math.max(plan.gap,baseGap+12),spacing:Math.max(plan.spacing,speed*1.2)};}
    function acceptedPipe(){if(phase==='rest')restPipes=Math.max(0,restPipes-1);}
    function offer(pipe,validate){
      if(phase!=='active'||offered>=3||pipe.motion)return false;
      const offset=pipe.gap/2+[-6,6,0][offered],candidate={x:pipe.x+18,y:pipe.y+offset};
      if(!validate(candidate))return false;
      seals.push({...candidate,anchor:pipe,offset,done:false});offered++;return true;
    }
    function finish(success){
      phase='rest';age=0;restPipes=3;seals=[];due=clock+45+(serial*17%19);
      if(success)onComplete(30,theme.name,theme.color);
    }
    function cancel(){if(phase==='warning'||phase==='active')finish(false);}
    function update(dt,{bird,previousY,shielded=false,segmentHitsBox}={}){
      clock+=dt;
      if(phase==='idle')return;
      age+=dt;
      if(phase==='warning'){if(age>=1.8){phase='active';age=0;}return;}
      if(phase==='rest'){if(age>=6&&restPipes===0){phase='idle';onRestEnd();}return;}
      for(const s of seals){
        if(s.done)continue;
        const oldX=s.x,oldY=s.y;s.x=s.anchor.x+18;s.y=s.anchor.y+s.offset;
        if(bird&&!shielded&&segmentHitsBox(oldX-bird.x,oldY-previousY,s.x-bird.x,s.y-bird.y,14,14)){
          s.done=true;collected++;resolved++;onCollect(collected,s.x,s.y,theme.color);
        }else if(bird&&s.x<bird.x-18){s.done=true;resolved++;}
      }
      if(offered===3&&resolved===3)finish(collected===3);
      else if(age>=22)finish(false);
    }
    function draw(c,w,h){
      if(phase!=='warning'&&phase!=='active')return;
      const t=reduced?0:clock,ground=h-28,wrap=(n,m)=>(n%m+m)%m;
      const rect=(x,y,ww,hh,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
      c.save();c.globalAlpha=phase==='warning'?.18:.3;
      for(let i=0;i<(reduced?5:14);i++){
        const x=wrap(i*71+19-t*18,w+30)-15,y=28+wrap(i*43-t*7,ground-65);
        if(theme.shape==='meteors'){for(let j=0;j<5;j++)rect(x+j*4,y-j*3,3,2,theme.color);rect(x-2,y,4,4,theme.accent);}
        else if(theme.shape==='neon'){rect(x,18,2,18,theme.color);rect(x,ground-22,2,16,theme.accent);rect(x-8,35,18,2,theme.color);}
        else if(theme.shape==='wind'||theme.shape==='waves'){for(let j=0;j<3;j++)rect(x+j*6,y+(theme.shape==='waves'?Math.sin(j+t)*3:0),5,2,theme.color);}
        else if(theme.shape==='bubbles'||theme.shape==='spores'){rect(x,y,5,1,theme.color);rect(x-1,y+1,1,4,theme.color);rect(x+5,y+1,1,4,theme.color);rect(x,y+5,5,1,theme.color);if(theme.shape==='spores')rect(x+2,y+6,1,4,theme.accent);}
        else if(theme.shape==='portals'){for(let j=-3;j<=3;j++)rect(x+Math.abs(j)*2,y+j*2,2,2,theme.color);}
        else if(theme.shape==='sand'){rect(x+Math.sin(t+i)*8,y,3,2,theme.color);rect(x+8,y+5,2,2,theme.accent);}
        else{rect(x,y,2,6,theme.color);rect(x-2,y+2,6,2,theme.accent);}
      }
      c.globalAlpha=1;
      for(const s of seals){if(s.done)continue;const pulse=reduced?0:Math.sin(t*5)*1.2;
        for(let j=-4;j<=4;j++){const width=(5-Math.abs(j))*3;rect(s.x-width/2,s.y+j*2,width,2,j%2?theme.color:theme.accent);}
        rect(s.x-2,s.y-2,4,4,'#263e45');rect(s.x-1,s.y-1,2,2,theme.accent);
        for(const dx of [-1,1])for(const dy of [-1,1])rect(s.x+dx*(11+pulse)-1,s.y+dy*(8+pulse)-1,2,2,theme.color);
      }
      c.restore();
    }
    function resync(){for(const s of seals){s.x=s.anchor.x+18;s.y=s.anchor.y+s.offset;}}
    function widen(pipe,delta){for(const s of seals)if(s.anchor===pipe)s.offset+=delta;resync();}
    function getState(){return{phase,name:theme.name,biome:theme.biome,color:theme.color,collected,offered,resolved,restPipes,age,clock,due};}
    function caption(){return phase==='warning'?'PRÓXIMO: '+theme.name:phase==='active'?theme.name+' · '+collected+'/3':phase==='rest'?'RESPIRO DESPUÉS DEL EVENTO':null;}
    return{resync,widen,reset,resume,consider,adjustPlan,acceptedPipe,offer,update,draw,cancel,blocksEnemies,getState,caption};
  }
  window.flightEvents={create,themes};
})();
