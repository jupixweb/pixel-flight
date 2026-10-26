(() => {
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function createDirector(random=Math.random){
    let section=-1,index=0,length=0,center=.5,from=.5,target=.5,kind='rest',order=[];
    function reset(){section=-1;index=length=0;center=from=target=.5;kind='rest';order=[];}
    function next(height,level,baseGap,speed){
      if(index>=length){
        section++;index=0;from=center;
        const slot=section%4;
        if(slot===0){
          // Each cycle keeps the same mix of challenges, in a fresh order.
          order=['climb','precision','dive'];
          for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
        }
        kind=slot===0?'rest':order[slot-1];
        length=kind==='rest'?3:4+Math.floor(random()*2);
        target=kind==='rest'?.38+random()*.24:kind==='precision'?clamp(center+(random()-.5)*.18,.2,.8):kind==='climb'?.2+random()*.12:.68+random()*.12;
      }
      const progress=(++index)/length,eased=progress*progress*(3-2*progress);
      const desired=from+(target-from)*eased;
      const maxStep=Math.min(34,20+level*.075)/(height-28);
      center+=clamp(desired-center,-maxStep,maxStep);
      const gap=baseGap+(kind==='rest'?14:kind==='precision'?-(4+3*(1-Math.exp(-level/75))):0);
      return {kind,center:center*(height-28),gap:Math.max(64,gap),spacing:Math.max((kind==='rest'?192:176)+random()*12,speed*1.05),motionScale:kind==='rest'?0:kind==='precision'?.8:.65};
    }
    reset();return {next,reset};
  }
  // Predict both ends together, including the smooth change in oscillation strength.
  function opening(pipe,t,height,settings){
    if(!pipe.motion)return pipe.y;
    const m=pipe.motion,scale=m.scale??1;
    const amplitude=Math.min(settings.amplitude*scale+(m.amplitude-settings.amplitude*scale)*Math.exp(-1.1*t),Math.max(0,(height-28-pipe.gap-48)/2));
    const targetRate=settings.rate*scale;
    const phase=m.phase+targetRate*t+(m.rate-targetRate)*(1-Math.exp(-1.4*t))/1.4;
    const base=clamp(m.baseY,24+amplitude,height-28-pipe.gap-24-amplitude);
    return base+Math.sin(phase)*amplitude;
  }
  function segmentHitsBox(x0,y0,x1,y1,rx,ry){
    let enter=0,leave=1;
    for(const [a,b,r] of [[x0,x1,rx],[y0,y1,ry]]){
      const d=b-a;if(Math.abs(d)<1e-9){if(Math.abs(a)>=r)return false;continue;}
      const u=(-r-a)/d,v=(r-a)/d;enter=Math.max(enter,Math.min(u,v));leave=Math.min(leave,Math.max(u,v));if(enter>leave)return false;
    }
    return enter<=leave;
  }
  function hazardX(e,t){const warning=e.warning||0,active=Math.max(0,t-warning),target=e.targetSpeed??e.speed;return e.x-target*active-(e.speed-target)*(Math.exp(-2*Math.min(t,warning))-Math.exp(-2*t))/2;}
  function findRoute({previous,pipe,x,y,height,speed,settings,startY,startV=-40,birdX=80,hazards=[],obstacles=null,horizon=0,reaction=0,minFlapInterval=0}){
    const approaching=previous&&previous.x-18>birdX;
    const startX=approaching?previous.x-18:birdX;
    const allPipes=obstacles||[previous,pipe].filter(Boolean);
    const endX=horizon?birdX+speed*horizon:pipe.x+54,total=(endX-startX)/speed;
    const steps=Math.ceil(total/.03),dt=total/steps;
    const lead=Math.max(0,(startX-birdX)/speed);
    const firstY=approaching?opening(previous,lead,height,settings)+previous.gap/2:(startY??height*.43);
    let states=[{y:firstY,v:approaching?-40:startV,hit:false,parent:null,x:startX,t:lead,lastFlap:-Infinity}];
    for(let i=1;i<=steps;i++){
      const px=startX+(endX-startX)*i/steps,t=lead+i*dt,atPickup=startX+(endX-startX)*(i-1)/steps<x&&px>=x;
      const next=[],seen=new Set();
      const goal=y!=null&&px<x?y:pipe?opening(pipe,t,height,settings)+pipe.gap/2:height*.5;
      let minY=12,maxY=height-40;
      for(const p of allPipes)if(px+10>p.x-5&&px-10<p.x+41){const top=opening(p,t,height,settings);minY=Math.max(minY,top+10);maxY=Math.min(maxY,top+p.gap-10);}
      if(minY>maxY)return null;
      const spans=[];
      for(const e of hazards){
        if(t<=(e.warning||0))continue;
        const oldTime=t-dt,u=Math.max(0,Math.min(1,((e.warning||0)-oldTime)/dt));
        const x0=hazardX(e,oldTime+dt*u)-birdX,x1=hazardX(e,t)-birdX;
        if(Math.min(x0,x1)<21&&Math.max(x0,x1)>-21)spans.push({x0,x1,u,y:e.y});
      }
      for(const s of states)for(const flap of [false,true]){
        if(flap&&(t<reaction||t-s.lastFlap<minFlapInterval))continue;
        const v=(flap?-145:s.v)+440*dt,ny=s.y+v*dt;
        if(ny<minY||ny>maxY)continue;
        if(spans.some(h=>segmentHitsBox(h.x0,h.y-(s.y+(ny-s.y)*h.u),h.x1,h.y-ny,21,16)))continue;
        if(y!=null&&atPickup&&Math.abs(ny-y)>10)continue;
        const lastFlap=flap?t:s.lastFlap;
        const key=Math.round(ny/3)+':'+Math.round(v/18)+(minFlapInterval?':'+Math.round(Math.max(0,minFlapInterval-t+lastFlap)/dt):'');
        if(seen.has(key))continue;seen.add(key);
        next.push({y:ny,v,hit:s.hit||atPickup||y==null,parent:s,x:px,t,flap,lastFlap,cost:Math.abs(ny-goal)+Math.abs(v)*.025});
      }
      next.sort((a,b)=>a.cost-b.cost);states=next.slice(0,100);
      if(!states.length)return null;
    }
    const end=states.find(s=>s.hit);if(!end)return null;
    const path=[];for(let s=end;s;s=s.parent)path.push({x:s.x,y:s.y,v:s.v,t:s.t,flap:s.flap});
    return path.reverse();
  }
  window.flightRoutes={createDirector,findRoute,opening,segmentHitsBox,hazardX};
})();
