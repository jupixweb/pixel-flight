(() => {
  'use strict';
  const sprite=['....OOOOOO....','..OOYYYYYYOO..','.OYYYYYYYYYYO.','OYYYYYYYWWWYYO','OYYYYYYWWBWWYO','OYYYYYYWWBWWYO','OYYOOYYYWWWYYO','OYOYYOYYYYOOOO','OYYOOYYYYORRRO','.OYYYYYYORRRRO','..OOOOOOOOOOO.'];
  const catalog={
    bird:[
      {id:'classic',name:'Clásico',colors:{O:'#344739',Y:'#ffd14e',W:'#fff8de',B:'#263d35',R:'#f78741'},wing:'#e9a737',light:'#ffe389',crest:'#fff0a0'},
      {id:'breeze',name:'Brisa',achievement:'first-flight',colors:{O:'#263f50',Y:'#65d6da',W:'#efffff',B:'#263d35',R:'#ffc466'},wing:'#2aa3b2',light:'#affff2',crest:'#baffff'},
      {id:'aurora',name:'Aurora',achievement:'third-day',colors:{O:'#3f365d',Y:'#c298ff',W:'#fff2ff',B:'#302c48',R:'#ffae70'},wing:'#8260ca',light:'#decaff',crest:'#f3e4ff'},
      {id:'coral',name:'Coral',achievement:'coral-route',colors:{O:'#6b324a',Y:'#ff8fa3',W:'#fff7e8',B:'#4a2441',R:'#ffd16e'},wing:'#dc527f',light:'#ffc8cf',crest:'#ffe3c5'},
      {id:'eclipse',name:'Eclipse',achievement:'sixth-dawn',colors:{O:'#121d39',Y:'#495286',W:'#fff6c4',B:'#171b36',R:'#f9cc65'},wing:'#29335e',light:'#8598d0',crest:'#ffe69b'},
      {id:'phoenix',name:'Fénix',achievement:'long-haul',colors:{O:'#6e293a',Y:'#ff703c',W:'#fff6d0',B:'#492735',R:'#ffe16a'},wing:'#d83f42',light:'#ffb45f',crest:'#fff2a0'},
      {id:'tesla-rocket',name:'Tesla Rocket',achievement:'rocket-launch',vehicle:true,colors:{O:'#26333f',Y:'#dce9ed',W:'#ffffff',B:'#bfa66a',R:'#ff536f'}}
    ],
    trail:[
      {id:'gold',name:'Dorada',colors:['#ffd74d','#fff2aa']},
      {id:'mint',name:'Menta',achievement:'clean-flight',colors:['#68e5cb','#bafff1']},
      {id:'stellar',name:'Estelar',achievement:'clock-collector',colors:['#ffc9f4','#b59aff','#7ce9ff']},
      {id:'comet',name:'Cometa',achievement:'clean-century',colors:['#ff7745','#ffb75e','#fff3b5']},
      {id:'prism',name:'Prisma',achievement:'time-weaver',colors:['#ff73c0','#b68aff','#63d9ff','#88f5c0']},
      {id:'glacier',name:'Glaciar',achievement:'ninth-dawn',colors:['#5e9fe8','#98e1ff','#ecffff']}
    ],
    blast:[
      {id:'rainbow',name:'Arcoíris',colors:['#fff4ba','#ffd447','#ff813e','#ff4ba0','#bc69ff','#55e7fa']},
      {id:'solar',name:'Solar',achievement:'demolition',colors:['#fff7cc','#ffe16a','#ffb347','#ff813e','#ff5c65','#ffeaa0']},
      {id:'boreal',name:'Boreal',achievement:'golden-clock',colors:['#f0fff8','#bafff1','#63ebc6','#55d9f4','#a493ff','#e5c8ff']},
      {id:'nebula',name:'Nebulosa',achievement:'nebula-festival',colors:['#ffe4ff','#f69fe9','#cd64df','#9251c6','#5d74e8','#aabfff']},
      {id:'magma',name:'Magma',achievement:'volcanic-festival',colors:['#fff6bc','#ffd05c','#ff933e','#f65337','#cb3558','#ffb873']},
      {id:'supernova',name:'Supernova',achievement:'time-master',colors:['#ffffff','#fff4a0','#ffd75c','#ff91cc','#a38bff','#79e5ff']}
    ]
  };
  const achievements=[
    {id:'first-flight',title:'Primer vuelo',description:'Supera 10 tuberías en una partida.',key:'pipes',goal:10,unit:'tuberías',reward:'Pájaro Brisa'},
    {id:'third-day',title:'Tres amaneceres',description:'Llega al día 3.',key:'days',goal:3,unit:'días',reward:'Pájaro Aurora'},
    {id:'clean-flight',title:'Vuelo limpio',description:'Supera 50 tuberías en una partida sin detonar bombas.',key:'clean',goal:50,unit:'tuberías',reward:'Estela Menta'},
    {id:'clock-collector',title:'A tiempo',description:'Recoge 3 relojes en una partida.',key:'clocks',goal:3,unit:'relojes',reward:'Estela Estelar'},
    {id:'demolition',title:'Festival de color',description:'Detona 5 bombas entre todas tus partidas.',key:'bombs',goal:5,unit:'bombas',reward:'Explosión Solar'},
    {id:'golden-clock',title:'Instante dorado',description:'Recoge un reloj dorado.',key:'gold',goal:1,unit:'reloj dorado',reward:'Explosión Boreal'},
    {id:'coral-route',title:'Ruta de coral',description:'Supera 120 tuberías en una partida.',key:'pipes',goal:120,unit:'tuberías',reward:'Pájaro Coral'},
    {id:'sixth-dawn',title:'Seis amaneceres',description:'Llega al día 6 (200 tuberías).',key:'days',goal:6,unit:'días',reward:'Pájaro Eclipse'},
    {id:'long-haul',title:'Vuelo legendario',description:'Supera 300 tuberías en una partida.',key:'pipes',goal:300,unit:'tuberías',reward:'Pájaro Fénix'},
    {id:'clean-century',title:'Cien sin pólvora',description:'Supera 100 tuberías en una partida sin detonar bombas.',key:'clean',goal:100,unit:'tuberías',reward:'Estela Cometa'},
    {id:'time-weaver',title:'Tejedor del tiempo',description:'Recoge 6 relojes en una partida.',key:'clocks',goal:6,unit:'relojes',reward:'Estela Prisma'},
    {id:'ninth-dawn',title:'Nueve amaneceres',description:'Llega al día 9 (320 tuberías).',key:'days',goal:9,unit:'días',reward:'Estela Glaciar'},
    {id:'nebula-festival',title:'Festival cósmico',description:'Detona 15 bombas entre todas tus partidas.',key:'bombs',goal:15,unit:'bombas',reward:'Explosión Nebulosa'},
    {id:'volcanic-festival',title:'Corazón volcánico',description:'Detona 30 bombas entre todas tus partidas.',key:'bombs',goal:30,unit:'bombas',reward:'Explosión Magma'},
    {id:'time-master',title:'Dueño del tiempo',description:'Recoge 10 relojes en una partida.',key:'clocks',goal:10,unit:'relojes',reward:'Explosión Supernova'},
    {id:'rocket-launch',title:'Go for launch',description:'Alcanza 1000 puntos totales en una partida, incluidos los bonus.',key:'score',goal:1000,unit:'puntos',reward:'Tesla Rocket'}
  ];
  function create(storage,records={}){
    const progress={pipes:0,days:1,clean:0,clocks:0,bombs:0,gold:0,score:0},selected={bird:'classic',trail:'gold',blast:'rainbow'},earned=new Set();
    let used=0,clocks=0,persistent=true;
    const count=n=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1e9,Math.floor(n))):0;
    try{
      const saved=JSON.parse(storage.getItem('pixel-flight-collection-v1'));
      for(const key of Object.keys(progress))progress[key]=Math.max(progress[key],count(saved?.progress?.[key]));
      if(Array.isArray(saved?.earned))for(const a of achievements)if(saved.earned.includes(a.id))earned.add(a.id);
      for(const group of Object.keys(catalog))if(typeof saved?.selected?.[group]==='string')selected[group]=saved.selected[group];
    }catch{persistent=false;}
    progress.pipes=Math.max(progress.pipes,count(records.pipes));
    progress.score=Math.max(progress.score,count(records.score));
    progress.days=Math.max(progress.days,count(records.days),1+Math.floor(progress.pipes/40));
    function unlock(){const fresh=[];for(const a of achievements)if(!earned.has(a.id)&&progress[a.key]>=a.goal){earned.add(a.id);fresh.push({...a});}return fresh;}
    unlock();
    const available=item=>!item.achievement||earned.has(item.achievement);
    for(const group of Object.keys(catalog))if(!catalog[group].some(i=>i.id===selected[group]&&available(i)))selected[group]=catalog[group][0].id;
    function save(){try{storage.setItem('pixel-flight-collection-v1',JSON.stringify({progress,selected,earned:[...earned]}));persistent=true;}catch{persistent=false;}}
    save();
    function commit(){const fresh=unlock();save();return fresh;}
    return {
      startRun(){used=clocks=0;},
      reachScore(n){progress.score=Math.max(progress.score,count(n));return commit();},
      passPipe(n){n=count(n);progress.pipes=Math.max(progress.pipes,n);progress.days=Math.max(progress.days,1+Math.floor(n/40));if(used===0)progress.clean=Math.max(progress.clean,n);return commit();},
      collectClock(tier){clocks++;progress.clocks=Math.max(progress.clocks,clocks);if(tier==='legendary')progress.gold=1;return commit();},
      detonate(){used++;progress.bombs++;return commit();},
      select(group,id){const items=typeof group==='string'&&Object.hasOwn(catalog,group)?catalog[group]:[];const item=items.find(i=>i.id===id);if(!item||!available(item))return false;selected[group]=id;save();return true;},
      item(group){return catalog[group].find(i=>i.id===selected[group]);},
      list(group){return (catalog[group]||[]).map(i=>({...i,available:available(i),selected:i.id===selected[group],goal:achievements.find(a=>a.id===i.achievement)||null}));},
      getState(){return {selected:{...selected},earned:[...earned],progress:{...progress},persistent,available:Object.values(catalog).flat().filter(available).length,total:Object.values(catalog).flat().length};}
    };
  }
  function drawBird(context,item,x,y,scale=2){
    if(item.vehicle){drawRocket(context,item,x,y,scale*.8);return;}
    for(let r=0;r<sprite.length;r++)for(let c=0;c<sprite[r].length;c++){const color=item.colors[sprite[r][c]];if(color){context.fillStyle=color;context.fillRect(Math.round(x+(c-7)*scale),Math.round(y+(r-5)*scale),Math.ceil(scale),Math.ceil(scale));}}
    context.fillStyle=item.wing;context.fillRect(x-6*scale,y+2*scale,5*scale,2*scale);
  }
  // Compact, right-facing Roadster: 24 × 8 units, rendered at 1.5625× scale, plus cosmetic cold-gas jets.
  function drawRocket(context,item,x,y,scale=1,thrust=0,time=0){
    const c=item.colors;scale*=1.5625;
    const pixel=(px,py,w,h,color)=>{context.fillStyle=color;const left=Math.round(x+px*scale),top=Math.round(y+py*scale);context.fillRect(left,top,Math.round(x+(px+w)*scale)-left,Math.round(y+(py+h)*scale)-top);};
    if(thrust>0){
      const length=3+Math.round(Math.min(1,thrust/.12)*4)+(Math.sin(time*65)>0?1:0);
      for(const nozzle of [-7,8]){pixel(nozzle,5,1,3,'#f1ffff');pixel(nozzle-1,7,3,length-2,'#6edbe9');pixel(nozzle,6,1,length-1,'#f1ffff');pixel(nozzle-2,6+length,2,1,'#b1e7ed');}
    }
    // Low swept roof, champagne-tinted glass and a raked windshield on the right.
    pixel(-4,-3,8,1,c.O);pixel(-6,-2,12,1,c.O);pixel(-8,-1,15,1,c.O);
    pixel(-3,-3,6,1,c.Y);pixel(-4,-2,8,1,'#625d50');pixel(-6,-1,12,1,'#837560');
    pixel(-2,-2,5,1,'#b9a88b');pixel(5,-1,2,1,'#c5d6dc');pixel(2,-2,1,2,c.O);
    // Raised rear wing, supported above the tail at the left of the car.
    pixel(-12,-3,5,1,c.O);pixel(-11,-3,4,1,c.Y);pixel(-12,-2,2,1,c.O);pixel(-10,-2,1,3,c.O);
    // Broad rear haunch, long descending hood and a pointed right-facing nose.
    pixel(-12,0,23,3,c.O);pixel(-11,-1,4,1,c.Y);pixel(7,-1,2,1,c.Y);
    pixel(-11,0,21,1,c.Y);pixel(9,0,2,1,c.W);pixel(-11,1,23,1,'#74818f');
    pixel(-10,2,21,1,'#4b5969');pixel(-11,3,23,1,c.O);pixel(-6,0,10,1,'#b6c9d1');
    pixel(-1,0,1,3,'#596b79');pixel(3,0,2,2,c.O);pixel(4,0,1,1,'#8ca3b2');
    pixel(-12,0,2,1,c.R);pixel(10,1,2,1,'#efffff');pixel(11,2,1,1,c.O);
    // Five-pixel wheels with clipped corners, dark rims and small metallic spokes.
    for(const wheel of [-9,6]){
      pixel(wheel+1,0,3,1,c.O);pixel(wheel,1,5,3,c.O);pixel(wheel+1,4,3,1,c.O);
      pixel(wheel+1,1,3,3,'#536470');pixel(wheel+2,1,1,3,'#9aaeb9');pixel(wheel+1,2,3,1,'#8197a4');pixel(wheel+2,2,1,1,c.O);
    }
    pixel(-7,4,2,1,'#506978');pixel(8,4,2,1,'#506978');
  }
  function swatch(context,group,item,x,y){
    if(group==='bird'){drawBird(context,item,x,y);return;}
    for(let i=0;i<12;i++){context.fillStyle=item.colors[i%item.colors.length];const a=i*Math.PI/6;const px=group==='trail'?x-23+i*4:x+Math.cos(a)*(i%2?16:10),py=group==='trail'?y+Math.sin(i*.9)*5:y+Math.sin(a)*(i%2?16:10);context.fillRect(Math.round(px),Math.round(py),3+(i%2),3+(i%2));}
  }
  window.flightCosmetics={create,sprite,drawBird,drawRocket,swatch};
})();
