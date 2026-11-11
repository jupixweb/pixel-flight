(() => {
  'use strict';
  const RULES='daily-v4',WIDTH=288,HEIGHT=384,LENGTH=100;
  const utcDate=(now=new Date())=>now.toISOString().slice(0,10);
  function validDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date+'T00:00:00Z'))&&new Date(date+'T00:00:00Z').toISOString().slice(0,10)===date;}
  function random(seed){let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n=(n+0x6d2b79f5)|0;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function create(date=utcDate(),routes=window.flightRoutes){
    if(!validDate(date))throw Error('Fecha del desafío inválida');
    // Keep course layouts stable; only scoring records use the new rules version.
    const seed='daily-v1:'+date,entries=[],phase=random(seed+':shape')()*Math.PI*2,enemySlot=3+Math.floor(random(seed+':enemy')()*3);
    let center=HEIGHT*.43;
    for(let i=1;i<=LENGTH;i++){
      const r=random(seed+':pipe:'+i),target=178+Math.sin(i/6+phase)*22+(r()-.5)*16;
      center+=clamp(target-center,-16,16);
      const gap=116-25*(1-Math.exp(-i/70)),spacing=238+r()*16;
      const distance=Math.min((i%8-enemySlot+8)%8,(enemySlot-i%8+8)%8);
      const moving=i>=25&&distance>2&&r()<.28;
      const amplitude=moving?8+8*(i/100):0,baseY=center-gap/2;
      const kind=i%16<4?'rest':i%16<8?'climb':i%16<12?'precision':'dive';
      const p={number:i,center,gap,spacing,kind,section:Math.floor((i-1)/4),index:(i-1)%4+1,length:4,motion:moving?{baseY,amplitude,rate:.65+i*.004,phase:r()*Math.PI*2,age:0,fixed:true}:null,pickup:null,enemy:null};
      const previous=entries[i-2],speed=102*(1+i*.01),birdX=WIDTH*.27;
      const current={x:WIDTH+15,y:baseY,gap,motion:p.motion?{...p.motion}:null};
      const prior=previous?{x:current.x-previous.spacing,y:previous.center-previous.gap/2,gap:previous.gap,motion:previous.motion?{...previous.motion,phase:previous.motion.phase+previous.motion.rate*previous.spacing/speed}:null}:null;
      const referenceY=prior?routes.opening(prior,0,HEIGHT,{})+prior.gap/2:HEIGHT*.43;
      const feasible=(x,y,hazards=[])=>routes.findRoute({previous:prior,pipe:current,x,y,height:HEIGHT,speed,settings:{},startY:referenceY,startV:-40,birdX,hazards});
      const roll=r();let pickupKind=roll<.02&&i>10?'life':roll<.08&&i>=30?'slow':roll<.25?'bomb':roll<.28&&i>=60?'capacity':null;
      if(pickupKind){
        const inside=r()<.22,dx=inside?18:-60-r()*40,offset=(r()-.5)*(inside?gap-40:100);
        let x=current.x+dx,y=inside?center+offset:(center+(previous?.center??center))/2+offset;
        if(!feasible(x,y)){x=current.x+18;y=center;if(!feasible(x,y))pickupKind=null;}
        if(pickupKind){const rarity=r();p.pickup=Object.freeze({kind:pickupKind,dx:x-current.x,y,clockTier:rarity<.65?'basic':rarity<.92?'rare':'legendary',phase:r()*6});}
      }
      if(i>=38&&i%8===enemySlot){
        const enemySpeed=speed+38+i*.22,e={x:WIDTH+22,y:clamp(center+(r()<.5?-70:70),32,HEIGHT-60),speed:enemySpeed,targetSpeed:enemySpeed,warning:.65};
        const horizon=.65+(e.x-birdX)/enemySpeed+.4;
        const clear=routes.findRoute({previous:null,pipe:null,x:birdX,y:null,height:HEIGHT,speed,settings:{},startY:referenceY,startV:-40,birdX,obstacles:[prior,current].filter(Boolean),horizon,hazards:[e],reaction:.18,minFlapInterval:.12});
        if(clear)p.enemy=Object.freeze({y:e.y,speed:enemySpeed});
      }
      if(p.motion)Object.freeze(p.motion);entries.push(Object.freeze(p));
    }
    return Object.freeze({date,rules:RULES,width:WIDTH,height:HEIGHT,length:LENGTH,entry:n=>entries[n-1]??null,random:(channel,index)=>random(seed+':'+channel+':'+index)});
  }
  const key=date=>'pixel-flight-daily-'+RULES+':'+date;
  function valid(run,date){
    const fields=['score','days','pipes','bonus','bombs','clocks','rasantes'];
    const extras=['combos','tramos','objetivos','eventos','acrobacias'];
    return run&&run.date===date&&run.rules===RULES&&fields.every(k=>Number.isSafeInteger(run[k])&&run[k]>=0)&&extras.every(k=>Number.isSafeInteger(run[k]??0)&&(run[k]??0)>=0)&&Number.isFinite(run.speed)&&run.speed>=1&&run.score===run.pipes+run.bonus&&run.days===1+Math.floor(run.pipes/40)&&run.bonus===run.bombs+run.clocks+run.rasantes+extras.reduce((n,k)=>n+(run[k]??0),0)&&typeof run.completed==='boolean';
  }
  function load(storage,date){try{const run=JSON.parse(storage.getItem(key(date)));return valid(run,date)?run:null;}catch{return null;}}
  function save(storage,date,result){
    const next={...result,date,rules:RULES,completed:!!result.completed};if(!valid(next,date))return load(storage,date);
    const previous=load(storage,date),better=!previous||next.score>previous.score||next.score===previous.score&&(next.pipes>previous.pipes||next.pipes===previous.pipes&&next.completed&&!previous.completed);
    const best=better?next:previous;try{if(better)storage.setItem(key(date),JSON.stringify(best));}catch{}return best;
  }
  window.flightDaily={create,utcDate,validDate,random,load,save,validResult:valid,rules:RULES,width:WIDTH,height:HEIGHT,length:LENGTH};
})();