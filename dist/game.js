(() => {
  'use strict';
  const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
  const el = id => document.getElementById(id);
  let W=480,H=270,time=0,last=0,state='ready',paused=false,score=0,pipesPassed=0,best=0,muted=false,audio;
  let dailyCourse=null,dailyCursor=0,dailyLastPassed=0,dailyDistance=100,dailyFinishDistance=null,dailyCheckpointDistance=null,dailyCompleted=false,dailyRecord=null,frameCarry=0,effectsBus=null;
  const gameStorage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
  const audioMix=window.flightAudioSettings.create(gameStorage);
  let bird={x:125,y:120,v:0},pipes=[],particles=[],spawn=0,travel=0,flash=0,shake=0,deathTime=0;
  let bombCapacity=3,capacitySpawn=0;
  let lives=3,lifeSpawn=60,checkpoint=null,reviveTime=0,bestAttempt=null;
  const lifeMilestones=new Set();
  const lifeInterval=()=>60+Math.random()*30;
  let bombs=0,pickups=[],bombSpawn=0,blasts=[],playTime=0,shieldTime=0,bombBonus=0,clockBonus=0,nearBonus=0,peakSpeed=1,bestRun=null;
  let pendingRewards=[],activeReward=null;
  function interruptReward(){if(activeReward){pendingRewards.unshift(activeReward);activeReward=null;}}
  function presentNextReward(){
    if(slowFeedback>0||!pendingRewards.length)return;
    const reward=pendingRewards.shift();
    if(reward.life){runNotice('♥ +1 VIDA',reward.detail,true);activeReward=reward;}
    else showPowerupFeedback(reward.points,0,null,reward);
  }
  function showRewardFeedback(points,title,detail=''){pendingRewards.push({points,title,detail});presentNextReward();}
  function clearRewardFeedback(){pendingRewards=[];activeReward=null;}
  let comboCharge=0,comboTier=0,comboBreakRemaining=0,comboBonus=0,sectionBonus=0,furthestPipes=0,sectionProgress=null,routeCaption='';
  const sectionNames={rest:'RESPIRO',climb:'ASCENSO',dive:'DESCENSO',precision:'PRECISIÓN'};
  function rhythmUI(){
    el('route-caption').textContent='BUSCA EL CENTRO';
    el('combo-label').textContent=comboBreakRemaining>0?'VUELO IMPRECISO':'VUELO PRECISO';
    el('flight-rhythm').classList.toggle('is-imprecise',comboBreakRemaining>0);
    el('flight-rhythm').classList.toggle('is-flash-off',comboBreakRemaining>0&&!reduced&&Math.floor((1.5-comboBreakRemaining+1e-8)/.25)%2===1);
    el('combo-meter').setAttribute('aria-label','Combo: '+comboCharge+' de 5, nivel '+comboTier);
    for(let i=1;i<=5;i++)el('combo-charge-'+i).classList.toggle('charged',i<=comboCharge);
    el('flight-rhythm').classList.toggle('is-hot',comboTier===3);
  }
  function resetCombo(notify=false){if(!notify)comboBreakRemaining=0;else if(comboCharge>0||comboTier>0)comboBreakRemaining=1.5;comboCharge=comboTier=0;rhythmUI();}
  function resetRhythm(){resetCombo();sectionProgress=null;routeCaption='';el('route-caption').textContent='BUSCA EL CENTRO';}
  function chargeCombo(amount){
    comboCharge+=amount;
    if(comboCharge>=5){comboCharge-=5;comboTier=Math.min(3,comboTier+1);const points=comboTier*5;comboBonus+=points;addScore(points);showRewardFeedback(points,'¡COMBO NIVEL '+comboTier+'!');tone(880+comboTier*220,1320+comboTier*220,.12,'triangle',.045);}
    rhythmUI();
  }
  function rhythmPickup(amount=1){if(comboCharge+comboTier>0&&shieldTime===0)chargeCombo(amount);}
  function precisePass(p){return p.precisePass??(shieldTime===0&&Math.abs(bird.y-(p.y+p.gap/2))<=Math.max(6,Math.min(12,p.gap*.16)));}
  function rhythmPipe(p){
    const fresh=pipesPassed>furthestPipes;furthestPipes=Math.max(furthestPipes,pipesPassed);
    if(!p.pattern)return;
    if(precisePass(p))chargeCombo(1);else resetCombo(true);
    if(!p.section)return;
    const s=p.section;
    routeCaption=sectionNames[p.pattern]+' · '+s.index+'/'+s.length;
    if(s.index===1)sectionProgress={id:s.id,next:1,valid:true};
    if(!sectionProgress||sectionProgress.id!==s.id)return;
    sectionProgress.valid=sectionProgress.valid&&sectionProgress.next===s.index&&shieldTime===0&&fresh;
    sectionProgress.next=s.index+1;
    if(s.index===s.length){if(sectionProgress.valid&&p.pattern!=='rest'){sectionBonus+=10;addScore(10);showRewardFeedback(10,'¡'+sectionNames[p.pattern]+' COMPLETO!');objectiveEvent('section');tone(1320,1760,.16,'triangle',.05);}sectionProgress=null;}
  }
  const landscapeEventsEnabled=true;
  let eventEngine,musicEngine,eventBonus=0,musicEnabled=false;
  const objectivesEnabled=true;
  const objectiveKinds=[
    {kind:'clean',title:'5 tuberías sin bombas',goal:5,reward:15},
    {kind:'bomb',title:'Recoge una bomba',goal:1,reward:10},
    {kind:'center',title:'3 pasos por el centro',goal:3,reward:15},
    {kind:'clock',title:'Recoge un reloj',goal:1,reward:20},
    {kind:'near',title:'2 vuelos rasantes',goal:2,reward:25},
    {kind:'section',title:'Completa un tramo de desafío',goal:1,reward:15}
  ];
  let objective=null,objectiveCursor=-1,objectiveSerial=0,objectiveBonus=0,objectiveCooldown=0,objectiveReplayLock=false,objectiveView='';
  function objectiveAvailable(kind){return kind==='clock'?slowUnlocked&&difficultyLevel>0:kind==='near'?pipesPassed>=35:kind==='section'?pipesPassed>=10:kind==='bomb'?bombs<bombCapacity:true;}
  function objectiveUI(){
    const visible=objectivesEnabled&&objective&&state==='playing'&&!paused&&!objective.done;
    el('objective-info').hidden=!visible;
    if(!objective)return;
    const view=[objective.id,objective.progress,objective.done,paused,state].join(':');if(view===objectiveView)return;objectiveView=view;
    el('objective-label').textContent='OBJETIVO OPCIONAL - '+objective.reward+' PTS';
    el('objective-title').textContent=objective.title;
    el('objective-progress').textContent=objective.progress+'/'+objective.goal;
    el('objective-progress').setAttribute('aria-label','Progreso: '+objective.progress+' de '+objective.goal);
  }
  function chooseObjective(preferred=null){
    if(!objectivesEnabled)return;
    let index=preferred?objectiveKinds.findIndex(o=>o.kind===preferred&&objectiveAvailable(o.kind)):-1;
    if(index<0){for(let n=1;n<=objectiveKinds.length;n++){const candidate=(objectiveCursor+n)%objectiveKinds.length;if(objectiveAvailable(objectiveKinds[candidate].kind)){index=candidate;break;}}}
    objectiveCursor=index;objective={...objectiveKinds[index],id:++objectiveSerial,progress:0,done:false};objectiveCooldown=0;objectiveUI();
  }
  function resetObjectives(preferred=null){objective=null;objectiveCursor=-1;objectiveSerial=objectiveBonus=objectiveCooldown=0;objectiveReplayLock=false;objectiveView='';chooseObjective(preferred);}
  function objectiveEvent(type,detail={}){
    if(!objectivesEnabled||!objective||objective.done||state!=='playing'||paused)return;
    if(type==='bomb'&&objective.kind==='clean'){objective.progress=0;objectiveUI();return;}
    // Center steps share the precision combo's eligibility, including checkpoint replay.
    if(objectiveReplayLock&&objective.kind!=='center')return;
    let hit=false;
    if(type==='pipe'&&(detail.fresh||objective.kind==='center')){
      hit=objective.kind==='clean'||objective.kind==='center'&&precisePass(detail.pipe);
    }else if(type==='pickup')hit=objective.kind==='bomb'&&detail.kind==='bomb'||objective.kind==='clock'&&detail.kind==='slow';
    else if(type==='near')hit=objective.kind==='near';
    else if(type==='section')hit=objective.kind==='section';
    if(!hit)return;
    objective.progress=Math.min(objective.goal,objective.progress+1);
    if(objective.progress===objective.goal){objective.done=true;objectiveCooldown=4;objectiveBonus+=objective.reward;addScore(objective.reward);showRewardFeedback(objective.reward,'¡OBJETIVO CUMPLIDO!',objective.title);[880,1175,1568].forEach((n,i)=>tone(n,n,.12,'triangle',.045,i*.08));}
    objectiveUI();
  }
  function updateObjective(dt){
    if(!objectivesEnabled||!objective)return;
    if(!objective.done&&!objectiveAvailable(objective.kind)){chooseObjective();return;}
    if(objective.done){objectiveCooldown=Math.max(0,objectiveCooldown-dt);if(objectiveCooldown===0)chooseObjective();}
  }
  const personalRecords={days:1,pipes:0,bonus:0,speed:1};
  let wardrobe,runUnlocks=[],unlockTime=0;
  let enemies=[],enemySpawn=2;
  const world=window.flightWorld;
  const routes=window.flightRoutes,director=routes.createDirector();
  let rocketThrust=0,rocketFlip=0;
  let scrollSpeed=102,difficultyLevel=0,slowUnlocked=false,slowSpawn=0,slowFeedback=0,pendingClockTier=null;
  const slowInterval=()=>24+Math.random()*18;
  const CLOCK_TIERS=Object.freeze([
    Object.freeze({id:'basic',effect:15,reduction:.10,points:20,chance:.65,color:'#86fff0',rim:'#285165',face:'#bafff1',sand:'#36a7db',light:'#d4fff7'}),
    Object.freeze({id:'rare',effect:30,reduction:.15,points:40,chance:.27,color:'#d9a0ff',rim:'#513465',face:'#e5c8ff',sand:'#a265e8',light:'#fff0ff'}),
    Object.freeze({id:'legendary',effect:50,reduction:.30,points:60,chance:.08,color:'#ffdc63',rim:'#75502a',face:'#fff0aa',sand:'#f0ae36',light:'#fffbe0'})
  ]);
  function rollClockTier(){const roll=Math.random();let total=0;for(const tier of CLOCK_TIERS){total+=tier.chance;if(roll<total)return tier.id;}return CLOCK_TIERS[2].id;}
  function clockTier(p){return CLOCK_TIERS.find(t=>t.id===p.clockTier)||CLOCK_TIERS[1];}
  function difficulty(){const level=difficultyLevel;return {level,speed:102*(1+level*.01),gap:(H>300?104:88)-22*(1-Math.exp(-level*.027))};}
  function motionSettings(){
    const progress=Math.max(0,difficultyLevel-25);
    return {chance:difficultyLevel<25?0:.18+.62*(1-Math.exp(-progress/75)),amplitude:difficultyLevel<25?8*difficultyLevel/25:8+32*(1-Math.exp(-progress/62.5)),rate:difficultyLevel<25?.45+.25*difficultyLevel/25:.7+1.5*(1-Math.exp(-progress/75))};
  }
  function enemySettings(){
    const progress=1-Math.exp(-Math.max(0,difficultyLevel-35)/100);
    return {speed:difficulty().speed+38+difficultyLevel*.22,minInterval:6.5-3*progress,maxInterval:10-4*progress,maxActive:difficultyLevel>=180?3:difficultyLevel>=60?2:1,groupChance:difficultyLevel<60?0:.2+.3*(1-Math.exp(-(difficultyLevel-60)/120))};
  }
  function enemyForecast(){const targetSpeed=enemySettings().speed;return enemies.map(e=>({...e,targetSpeed}));}
  function createEnemy(){
    const settings=enemySettings();
    for(let attempt=0;attempt<6;attempt++){
      const e={x:W+22,y:30+Math.random()*(H-86),speed:settings.speed,warning:.65,age:0};
      if(enemies.some(other=>Math.abs(other.y-e.y)<56))continue;
      const arrival=e.warning+(e.x-bird.x)/e.speed;
      const path=routes.findRoute({pipe:null,previous:null,x:bird.x,y:null,height:H,speed:scrollSpeed,settings:motionSettings(),startY:bird.y,startV:bird.v,birdX:bird.x,obstacles:pipes,horizon:arrival+.65,hazards:[...enemyForecast(),{...e,targetSpeed:e.speed}],reaction:.18,minFlapInterval:.12});
      if(path)return e;
    }
    return null;
  }
  function updateEnemies(dt,previousY){
    if(state!=='playing')return;
    const settings=enemySettings();
    if(!dailyCourse&&pipesPassed>=35&&!(landscapeEventsEnabled&&!dailyCourse&&eventEngine.blocksEnemies())){
      enemySpawn-=dt;
      if(enemySpawn<=0){
        const e=enemies.length<settings.maxActive?createEnemy():null;
        if(e){
          enemies.push(e);
          // Validate each extra bird against the complete accepted group and pipes.
          // Failed candidates simply leave a smaller group; no forced formation.
          if(settings.maxActive>1&&Math.random()<settings.groupChance){
            while(enemies.length<settings.maxActive){const extra=createEnemy();if(!extra)break;enemies.push(extra);}
          }
          enemySpawn=settings.minInterval+Math.random()*(settings.maxInterval-settings.minInterval);
        }else enemySpawn=1;
      }
    }
    for(const e of enemies){
      const targetSpeed=dailyCourse?(e.targetSpeed??e.speed):settings.speed;
      const oldX=e.x,oldWarning=e.warning||0,oldSpeed=e.speed;
      const inactive=Math.min(dt,oldWarning),active=dt-inactive;
      e.x-=targetSpeed*active+(oldSpeed-targetSpeed)*(Math.exp(-2*inactive)-Math.exp(-2*dt))/2;
      e.speed=targetSpeed+(oldSpeed-targetSpeed)*Math.exp(-2*dt);
      e.warning=Math.max(0,oldWarning-dt);e.age=(e.age||0)+active;
      if(active>0||oldWarning===0){
        const u=dt>0?inactive/dt:0,initialY=previousY+(bird.y-previousY)*u;
        const contact=routes.segmentHitsBox(oldX-bird.x,e.y-initialY,e.x-bird.x,e.y-bird.y,17,12);
        const close=routes.segmentHitsBox(oldX-bird.x,e.y-initialY,e.x-bird.x,e.y-bird.y,17+20+1e-8,12+20+1e-8);
        if(contact||close&&shieldTime>0)e.nearInvalid=true;
        if(shieldTime===0&&contact){die();break;}
        if(close&&oldX>=bird.x-17&&!e.nearDone)e.nearCandidate=true;
        if(e.x+17<bird.x&&!e.nearDone){
          e.nearDone=true;
          if(e.nearCandidate&&!e.nearInvalid&&shieldTime===0&&bird.y>7&&bird.y+7<H-28){
            nearBonus+=25;addScore(25);rhythmPickup(2);objectiveEvent('near');showPowerupFeedback(25);sound('score');
          }
        }
      }
    }
    enemies=enemies.filter(e=>e.x>-28);
  }
  function createPipe(x,gap,plan=null){
    if(plan)gap=plan.gap;
    const settings=motionSettings();
    if(difficultyLevel>=25&&Math.random()<settings.chance*(plan?.motionScale??1)){
      const scale=plan?.motionScale??1;
      const amplitude=Math.min(settings.amplitude*scale,Math.max(0,(H-28-gap-48)/2));
      const min=24+amplitude,max=H-28-gap-24-amplitude;
      const motion={baseY:plan?Math.max(min,Math.min(max,plan.center-gap/2)):min+Math.random()*(max-min),amplitude,scale,rate:settings.rate*scale,phase:plan?0:Math.random()*Math.PI*2,age:0};
      const pipe={x,y:motion.baseY,gap,passed:false,motion,pattern:plan?.kind};updatePipeMotion(pipe,0);return pipe;
    }
    return {x,y:plan?Math.max(24,Math.min(H-28-gap-24,plan.center-gap/2)):38+Math.random()*(H-28-gap-76),gap,passed:false,pattern:plan?.kind};
  }
  function updatePipeMotion(pipe,dt){
    if(!pipe.motion)return;
    const m=pipe.motion;if(m.fixed){m.age+=dt;m.phase=(m.phase+m.rate*dt)%(Math.PI*2);pipe.y=m.baseY+Math.sin(m.phase)*m.amplitude;return;}const settings=motionSettings();
    m.amplitude+=(settings.amplitude*(m.scale??1)-m.amplitude)*(1-Math.exp(-dt*1.1));
    m.rate+=(settings.rate*(m.scale??1)-m.rate)*(1-Math.exp(-dt*1.4));
    m.amplitude=Math.min(m.amplitude,Math.max(0,(H-28-pipe.gap-48)/2));
    m.baseY=Math.max(24+m.amplitude,Math.min(H-28-pipe.gap-24-m.amplitude,m.baseY));
    m.age+=dt;m.phase=(m.phase+m.rate*dt)%(Math.PI*2);pipe.y=m.baseY+Math.sin(m.phase)*m.amplitude;
  }
  function plannedPipe(x){
    const speed=Math.max(scrollSpeed,difficulty().speed),rawPlan=director.next(H,difficultyLevel,difficulty().gap,speed),plan=landscapeEventsEnabled&&!dailyCourse?eventEngine.adjustPlan(rawPlan,difficulty().gap,speed):rawPlan;
    const p=createPipe(x,plan.gap,plan),previous=pipes[pipes.length-1];p.spacing=plan.spacing;p.section={id:plan.section,index:plan.index,length:plan.length};
    if(previous){
      const feasible=()=>routes.findRoute({previous,pipe:p,x:(previous.x+p.x)/2,y:null,height:H,speed:speed*1.015,settings:motionSettings(),startY:bird.y,startV:bird.v,birdX:bird.x,hazards:enemyForecast()});
      if(!feasible()){
        // Preserve a main route even when two moving openings would oppose each other.
        delete p.motion;
        const arrival=Math.max(0,(p.x-bird.x)/speed);
        const center=routes.opening(previous,arrival,H,motionSettings())+previous.gap/2;
        p.y=Math.max(24,Math.min(H-28-p.gap-24,center-p.gap/2));
      }
    }
    if(enemies.length>1){
      // A later pipe must not cut off the escape left by an accepted flock.
      const path=routes.findRoute({previous:null,pipe:null,x:bird.x,y:null,height:H,speed:scrollSpeed,settings:motionSettings(),startY:bird.y,startV:bird.v,birdX:bird.x,obstacles:[...pipes,p],horizon:Math.max(.65,(p.x+56-bird.x)/scrollSpeed),hazards:enemyForecast(),reaction:.12,minFlapInterval:.12});
      if(!path)return null;
    }
    return p;
  }
  function pickupPosition(pipe,previous,benefit=0){
    const challenge=1-Math.exp(-difficultyLevel/40);
    const gapPosition=()=>{const spread=Math.max(0,pipe.gap/2-22),offset=pipe.gap/2+(Math.random()*2-1)*spread;return {x:pipe.x+18,y:pipe.y+offset,placement:'gap',anchor:pipe,offset};};
    if(Math.random()<.08+.10*Math.exp(-difficultyLevel/45))return gapPosition();
    const speed=Math.max(scrollSpeed,difficulty().speed)*1.015;
    const left=Math.max(previous?previous.x+61:pipe.x-170,bird.x+Math.max(32,speed*.3)),right=pipe.x-25;
    if(right-left<24)return null;
    const candidates=[];
    for(let i=0;i<10;i++){
      const x=left+(.2+Math.random()*.6)*(right-left);
      let vertical=Math.random();
      if(Math.random()<challenge*.4+benefit*.12)vertical=Math.random()<.5?vertical*.3:.7+vertical*.3;
      const y=22+vertical*(H-70),ratio=(x-(previous?.x??pipe.x-176))/(pipe.x-(previous?.x??pipe.x-176));
      const direct=(previous?previous.y+previous.gap/2:bird.y)*(1-ratio)+(pipe.y+pipe.gap/2)*ratio;
      candidates.push({x,y,detour:Math.abs(y-direct)});
    }
    // Better clocks prefer larger detours, but the player must be able to return.
    const desiredDetour=40+challenge*12+benefit*12;
    candidates.sort((a,b)=>Math.abs(a.detour-desiredDetour)-Math.abs(b.detour-desiredDetour));
    for(const p of candidates){
      const path=routes.findRoute({previous,pipe,x:p.x,y:p.y,height:H,speed,settings:motionSettings(),startY:bird.y,startV:bird.v,birdX:bird.x,hazards:enemyForecast()});
      if(path)return {x:p.x,y:p.y,placement:'between',detour:p.detour};
    }
    // Keep the powerup due and try the next stretch rather than offer an impossible route.
    return null;
  }
  function addScore(points){
    const previous=score;score+=points;
    el('score').textContent=score;worldUI();notifyUnlocks(wardrobe.reachScore(score));
    for(let goal=(Math.floor(previous/500)+1)*500;goal<=score;goal+=500)if(!lifeMilestones.has(goal)){lifeMilestones.add(goal);awardLife(goal+' PUNTOS');}
  }
  function checkpointNumber(){return dailyCourse?(checkpoint?.dailyIndex||0):(checkpoint?.pipesPassed||0);}
  function livesUI(){
    el('lives-counter').setAttribute('aria-label',`${lives} de 6 vidas`);
    for(let i=1;i<=6;i++)el('life-'+i).classList.toggle('is-empty',i>lives);
    el('checkpoint-count').textContent=checkpointNumber()?'CHACKPOINT '+checkpointNumber():'SIN CHECKPOINT';
  }
  function runNotice(title,detail,centered=false){
    interruptReward();
    const message=el('powerup-message');
    for(const name of ['is-capacity','is-clock','is-near','clock-rare','clock-legendary','is-reward'])message.classList.remove(name);
    message.classList.add('is-life');message.classList.toggle('is-hud-notice',!centered);el('bonus-points').textContent=title;el('bonus-detail').textContent=detail;el('bonus-extra').hidden=true;
    message.classList.remove('is-popping');void message.offsetWidth;message.classList.add('is-popping');message.hidden=false;slowFeedback=2.2;
  }
  function awardLife(reason){
    if(lives>=6)return false;
    lives++;livesUI();pendingRewards.push({life:true,detail:reason});presentNextReward();[660,880,1320,1760].forEach((n,i)=>tone(n,n,.13,'triangle',.055,i*.08));return true;
  }
  function saveCheckpoint(announce=true){
    checkpoint={score,pipesPassed,difficultyLevel,bombs,bombCapacity,slowUnlocked,bombBonus,clockBonus,nearBonus,peakSpeed,comboBonus,sectionBonus,objectiveBonus,eventBonus,dailyIndex:dailyLastPassed,dailyPlayTime:dailyCourse?playTime:0,world:world.snapshot()};
    livesUI();modeUI();if(announce){runNotice('CHECKPOINT','TUBERÍA '+checkpointNumber()+' · PROGRESO GUARDADO');celebrate('#ffe58a');[660,990,1320].forEach((n,i)=>tone(n,n,.13,'triangle',.035,i*.1));}
  }
  function continueRun(){
    if(state!=='dead'||lives<=0||time-deathTime<.55||!checkpoint)return false;eventEngine.resume();clearRewardFeedback();
    ({score,pipesPassed,difficultyLevel,bombs,bombCapacity,slowUnlocked,bombBonus,clockBonus,nearBonus,peakSpeed,comboBonus,sectionBonus,objectiveBonus,eventBonus}=checkpoint);resetRhythm();objectiveReplayLock=true;if(objective&&!objective.done)objective.progress=0;
    if(dailyCourse){dailyCursor=dailyLastPassed=checkpoint.dailyIndex||0;playTime=checkpoint.dailyPlayTime||0;dailyDistance=118;dailyFinishDistance=null;dailyCheckpointDistance=null;dailyCompleted=false;frameCarry=0;}world.restore(checkpoint.world);director.reset();scrollSpeed=difficulty().speed;
    pipes=[];enemies=[];pickups=[];particles=[];blasts=[];flash=shake=0;
    unlockTime=0;el('unlock-toast').hidden=true;spawn=1.15;enemySpawn=3;lifeSpawn=lifeInterval();bombSpawn=bombInterval();slowSpawn=slowInterval();capacitySpawn=10;pendingClockTier=null;
    rocketThrust=rocketFlip=0;bird={x:W*.27,y:H*.43,v:-90};state='playing';paused=false;shieldTime=reviveTime=1.8;
    el('overlay').hidden=true;el('results').hidden=true;el('hud').hidden=false;el('close-results').hidden=true;
    el('frame').classList.remove('over');el('frame').classList.remove('paused');el('pause').classList.remove('is-playing');el('pause').setAttribute('aria-label','Pausar juego');
    el('shield-status').hidden=false;el('shield-status').textContent='Protección de reaparición activa';
    el('score').textContent=String(score);worldUI();livesUI();bombUI();runNotice('¡OTRA OPORTUNIDAD!',checkpointNumber()?'DESDE EL CHACKPOINT '+checkpointNumber():'DESDE EL INICIO',true);sound('start');return true;
  }
  function showPowerupFeedback(points,reduction=0,tier=null,reward=null){
    if(!reward)interruptReward();else activeReward=reward;
    const message=el('powerup-message');message.classList.toggle('is-capacity',points===0);message.classList.toggle('is-reward',Boolean(reward));
    message.classList.remove('is-life');
    el('bonus-points').textContent=tier?'−'+Number(reduction.toFixed(1)).toString().replace('.',',')+' %':points===0?'6 BOMBAS':'+'+points+' PTS';
    el('bonus-detail').textContent=tier?'¡Velocidad reducida!':points===25?'¡VUELO RASANTE!':points===0?'INVENTARIO AMPLIADO':'BOMBA RECOGIDA';
    el('bonus-extra').textContent=tier?'+'+points+' PTS':'';el('bonus-extra').hidden=!tier;
    message.classList.toggle('is-clock',Boolean(tier));
    message.classList.toggle('is-hud-notice',!tier);
    message.classList.toggle('is-near',points===25&&!reward);
    message.classList.toggle('clock-rare',tier?.id==='rare');
    message.classList.toggle('clock-legendary',tier?.id==='legendary');
    if(reward){el('bonus-points').textContent='+'+reward.points+' PTS';el('bonus-detail').textContent=reward.title;el('bonus-extra').textContent=reward.detail;el('bonus-extra').hidden=!reward.detail;}
    message.classList.remove('is-popping');message.hidden=false;
    void message.offsetWidth;
    message.classList.add('is-popping');slowFeedback=reward?2.2:tier?1.8+(['basic','rare','legendary'].indexOf(tier.id))*.45:1.8;
  }
  function worldUI(){modeUI();const speed='×'+(1+difficultyLevel*.01).toFixed(2).replace('.',',');el('speed-count').textContent='SPEED '+speed;el('speed-count').setAttribute('aria-label','Velocidad '+speed);const day=1+Math.floor(pipesPassed/40),w=world.getState();el('pipes-count').textContent=String(pipesPassed);el('days-count').textContent=String(day);el('day-counter').setAttribute('aria-label','Día '+day);el('world-status').textContent=w.moment+' · '+w.background+' · N'+difficultyLevel+' · ×'+(1+difficultyLevel*.01).toFixed(2).replace('.',',');}
  const blastColors=['#fff4ba','#ffd447','#ff813e','#ff4ba0','#bc69ff','#55e7fa'];
  const bombInterval=()=>5+Math.random()*7;
  function bombUI(){modeUI();objectiveUI();el('bomb-count').textContent=String(bombs);el('bomb-capacity').textContent=String(bombCapacity);el('bomb').disabled=paused||state!=='playing';el('bomb').classList.toggle('is-empty',bombs===0);el('bomb').setAttribute('aria-label',`Activar bomba: ${bombs} de ${bombCapacity} disponibles. X o Enter. Protege contra tuberías y adversarios durante 0,9 segundos.`);}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function celebrate(color='#fff0bc',x=bird.x,y=bird.y){
    const count=reduced?6:24;for(let i=0;i<count;i++){const a=i*2.39996,v=reduced?12:30+i%5*12;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:.7,max:.7,size:2,color:i%3?color:'#fff8db'});}
  }
  eventEngine=window.flightEvents.create({reduced,onCollect:(n,x,y,color)=>{celebrate(color,x,y);tone(660+n*220,880+n*220,.1,'triangle',.035);},onComplete:(points,name,color)=>{eventBonus+=points;addScore(points);showRewardFeedback(points,'¡EVENTO COMPLETADO!',name);celebrate(color);},onRestEnd:()=>{enemySpawn=Math.max(enemySpawn,2);}});
  musicEngine=window.flightMusic.create(()=>audio);musicEngine.setVolume(audioMix.get().music);
  try{musicEnabled=localStorage.getItem('pixel-flight-music-v1')==='true';}catch{}
  musicEngine.setEnabled(musicEnabled);
  const celebratedStyles=new Set();
  try{const saved=JSON.parse(localStorage.getItem('pixel-flight-celebrated-styles-v1'));if(Array.isArray(saved))for(const id of saved)if(typeof id==='string')celebratedStyles.add(id);}catch{}
  function celebrateStyles(){let fresh=false;for(const group of ['bird','trail','blast']){const id=wardrobe.item(group).id,key=group+':'+id;if(id!==wardrobe.list(group)[0].id&&!celebratedStyles.has(key)){celebratedStyles.add(key);fresh=true;}}if(fresh){celebrate('#ffb5ef');tone(1320,1760,.18,'triangle',.035);try{localStorage.setItem('pixel-flight-celebrated-styles-v1',JSON.stringify([...celebratedStyles]));}catch{}}}
  function musicUI(){el('music').textContent=musicEnabled?'DESACTIVAR':'ACTIVAR';el('music').classList.toggle('is-enabled',musicEnabled);el('music').setAttribute('aria-pressed',String(musicEnabled));el('music').setAttribute('aria-label',musicEnabled?'Desactivar música':'Activar música');}
  musicUI();el('music').addEventListener('click',()=>{initAudio();musicEnabled=!musicEnabled;musicEngine.setEnabled(musicEnabled);musicUI();volumeUI();try{localStorage.setItem('pixel-flight-music-v1',String(musicEnabled));}catch{}});
  function eventUI(){const caption=landscapeEventsEnabled&&!dailyCourse?eventEngine.caption():null;el('flight-rhythm').classList.toggle('is-event',Boolean(caption));rhythmUI();el('challenge-caption').hidden=!caption&&!routeCaption;el('challenge-caption').textContent=caption?(caption+(eventEngine.getState().phase==='rest'?'':' · 3 SELLOS · +30 PTS')):routeCaption;}


  function setVolume(channel,value){
    if(!audioMix.set(channel,value))return false;
    if(channel==='music')musicEngine.setVolume(audioMix.get().music);
    if(effectsBus)effectsBus.gain.setValueAtTime(muted?0:audioMix.get().effects,audio.currentTime);
    volumeUI();return true;
  }
  function volumeUI(){const levels=audioMix.get();for(const channel of ['music','effects']){const value=Math.round(levels[channel]*100);el(channel+'-volume').value=String(value);el(channel+'-volume-value').textContent=value+' %';}el('audio-music-state').textContent=musicEnabled?'Música activada':'Música desactivada';}
  function openAudio(){if(state==='playing'&&!paused)togglePause();volumeUI();el('audio-dialog').showModal();}
  el('audio-open').addEventListener('click',openAudio);el('pause-settings').addEventListener('click',openAudio);
  el('audio-close').addEventListener('click',()=>el('audio-dialog').close());
  for(const channel of ['music','effects'])el(channel+'-volume').addEventListener('input',()=>{initAudio();setVolume(channel,Number(el(channel+'-volume').value)/100);});
  volumeUI();
  function modeUI(){el('home-actions').hidden=state!=='ready';el('mode-label').textContent=dailyCourse?'DIARIO '+dailyCourse.date+' · '+Math.min(100,dailyLastPassed)+'/100':'UNA PEQUEÑA GRAN AVENTURA';el('daily-open').disabled=state==='playing';}
  function openDaily(){const date=window.flightDaily.utcDate(),record=window.flightDaily.load(gameStorage,date);el('daily-date').textContent=date+' · UTC';el('daily-record').textContent=record?record.score+' PTS · '+record.pipes+' TUBERÍAS'+(record.completed?' · COMPLETADO':''):'Aún no jugaste este desafío';el('daily-start').disabled=state==='playing';el('daily-dialog').showModal();}
  el('daily-open').addEventListener('click',openDaily);el('daily-close').addEventListener('click',()=>el('daily-dialog').close());
  el('daily-start').addEventListener('click',()=>{el('daily-dialog').close();startDaily();});
  function startDaily(date=window.flightDaily.utcDate()){
    if(state==='playing')return false;
    dailyCourse=window.flightDaily.create(date);dailyRecord=window.flightDaily.load(gameStorage,date);start();return true;
  }
  function spawnDaily(dt){
    const distance=scrollSpeed*dt;dailyDistance-=distance;if(dailyFinishDistance!==null)dailyFinishDistance-=distance;if(dailyCheckpointDistance!==null)dailyCheckpointDistance-=distance;
    if(dailyDistance>0||dailyCursor>=dailyCourse.length)return;
    const entry=dailyCourse.entry(++dailyCursor),x=W+15+dailyDistance+distance;
    const p={x,y:entry.center-entry.gap/2,gap:entry.gap,passed:false,pattern:entry.kind,dailyIndex:entry.number,spacing:entry.spacing,section:{id:entry.section,index:entry.index,length:entry.length}};
    if(entry.motion){p.motion={...entry.motion};updatePipeMotion(p,0);}pipes.push(p);
    const item=entry.pickup;
    if(item){const eligible=item.kind==='bomb'?bombs<bombCapacity:item.kind==='slow'?difficultyLevel>0:item.kind==='life'?lives<6:score>=300&&bombCapacity===3;
      if(eligible)pickups.push({...item,x:x+item.dx,y:item.y});}
    if(entry.enemy)enemies.push({x:W+22,y:entry.enemy.y,speed:entry.enemy.speed,targetSpeed:entry.enemy.speed,warning:.65,age:0});
    dailyDistance+=entry.spacing;
    if(dailyCursor===50)dailyCheckpointDistance=x+41-bird.x-distance;
    if(dailyCursor===dailyCourse.length)dailyFinishDistance=x+41-bird.x-distance;
  }
  function finishDailyResults(result){
    const previous=window.flightDaily.load(gameStorage,dailyCourse.date),improved=!previous||result.score>previous.score;
    dailyRecord=window.flightDaily.save(gameStorage,dailyCourse.date,result);
    el('results').setAttribute('aria-label','Mejor run del desafío diario '+dailyCourse.date);
    el('final-score').textContent=String(result.score);el('final-best').textContent=String(dailyRecord?.score??result.score);el('record-score').hidden=!improved;
    for(const key of ['days','pipes','bonus','speed']){el('final-'+key).textContent=key==='speed'?speedLabel(result[key]):String(result[key]);el('best-'+key).textContent=key==='speed'?speedLabel(dailyRecord?.[key]??result[key]):String(dailyRecord?.[key]??result[key]);el('record-'+key).hidden=true;el('result-'+key).classList.remove('is-record');}
    el('bonus-breakdown').textContent='Bombas '+result.bombs+' · Relojes '+result.clocks+' · Rasantes '+result.rasantes+(result.combos?' · Combos '+result.combos:'')+(result.tramos?' · Tramos '+result.tramos:'')+(result.objetivos?' · Objetivos '+result.objetivos:'');
    el('run-unlocks').hidden=runUnlocks.length===0;el('run-unlocks').textContent=runUnlocks.map(a=>a.reward).join(' · ');
    return improved;
  }

  try{best=Number(localStorage.getItem('pixel-flight-best'))||0;muted=localStorage.getItem('pixel-flight-muted')==='true';}catch{}
  try{const saved=JSON.parse(localStorage.getItem('pixel-flight-records-v1'));for(const key of Object.keys(personalRecords)){const value=saved?.[key];if(typeof value==='number'&&Number.isFinite(value)&&value>=personalRecords[key])personalRecords[key]=key==='speed'?Number(value.toFixed(2)):Math.floor(value);}}catch{}
  try{
    const saved=JSON.parse(localStorage.getItem('pixel-flight-best-run-v1'));
    const keys=['score','days','pipes','bonus','bombs','clocks','rasantes'];
    if(saved&&keys.every(k=>Number.isSafeInteger(saved[k])&&saved[k]>=0)&&Number.isFinite(saved.speed)&&saved.speed>=1&&saved.score===best&&best>0&&saved.days===1+Math.floor(saved.pipes/40)&&Number.isSafeInteger(saved.combos??0)&&(saved.combos??0)>=0&&Number.isSafeInteger(saved.tramos??0)&&(saved.tramos??0)>=0&&Number.isSafeInteger(saved.objetivos??0)&&(saved.objetivos??0)>=0&&Number.isSafeInteger(saved.eventos??0)&&(saved.eventos??0)>=0&&saved.bonus===saved.bombs+saved.clocks+saved.rasantes+(saved.combos??0)+(saved.tramos??0)+(saved.objetivos??0)+(saved.eventos??0)&&saved.score===saved.pipes+saved.bonus&&saved.rasantes%25===0)bestRun={...Object.fromEntries([...keys,'speed'].map(k=>[k,saved[k]])),...(saved.combos?{combos:saved.combos}:{}),...(saved.tramos?{tramos:saved.tramos}:{}),...(saved.objetivos?{objetivos:saved.objetivos}:{}),...(saved.eventos?{eventos:saved.eventos}:{})};
  }catch{}
  wardrobe=window.flightCosmetics.create({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},{...personalRecords,score:best});
  el('best').textContent=String(best).padStart(2,'0');
  function resize(){const mobile=Boolean(dailyCourse)||el('frame').clientWidth/el('frame').clientHeight<1;const oldH=H,oldW=W;W=mobile?288:480;H=mobile?384:270;canvas.width=W;canvas.height=H;ctx.imageSmoothingEnabled=false;if(state==='playing'||state==='dead'){bird.y*=H/oldH;pipes.forEach(p=>{p.y*=H/oldH;if(p.motion){p.motion.baseY*=H/oldH;updatePipeMotion(p,0);}});enemies.forEach(e=>{e.y=Math.max(24,Math.min(H-52,e.y*H/oldH));e.x*=W/oldW;});pickups.forEach(p=>{if(p.anchor)p.y=p.anchor.y+p.offset;else p.y*=H/oldH;});}bird.x=W*.27;eventEngine.resync();}
  new ResizeObserver(resize).observe(el('frame'));resize();
  function initAudio(){if(!audio){const A=window.AudioContext||window.webkitAudioContext;if(A){audio=new A();effectsBus=audio.createGain();effectsBus.gain.setValueAtTime(audioMix.get().effects,audio.currentTime);effectsBus.connect(audio.destination);}}if(audio?.state==='suspended')audio.resume().catch(()=>{});}
  function tone(freq,end,duration,type='square',volume=.035,delay=0){if(muted||!audio)return;const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(effectsBus);o.start(t);o.stop(t+duration+.01);}
  let rocketNoise=null;
  function rocketThrustSound(){
    if(muted||!audio)return;
    if(!rocketNoise){
      rocketNoise=audio.createBuffer(1,Math.ceil(audio.sampleRate*.26),audio.sampleRate);
      const samples=rocketNoise.getChannelData(0);let noiseSeed=0x6d2b79f5;
      // Local noise generator: sound must never consume the level generator's randomness.
      for(let i=0;i<samples.length;i++){noiseSeed^=noiseSeed<<13;noiseSeed^=noiseSeed>>>17;noiseSeed^=noiseSeed<<5;samples[i]=(noiseSeed>>>0)/2147483648-1;}
    }
    const t=audio.currentTime,source=audio.createBufferSource(),hiss=audio.createBiquadFilter(),body=audio.createBiquadFilter(),jetGain=audio.createGain(),bodyGain=audio.createGain();
    source.buffer=rocketNoise;
    hiss.type='bandpass';hiss.Q.value=.65;hiss.frequency.setValueAtTime(2600,t);hiss.frequency.exponentialRampToValueAtTime(1100,t+.24);
    body.type='lowpass';body.Q.value=.7;body.frequency.setValueAtTime(240,t);body.frequency.exponentialRampToValueAtTime(100,t+.16);
    jetGain.gain.setValueAtTime(.0001,t);jetGain.gain.linearRampToValueAtTime(.26,t+.004);jetGain.gain.exponentialRampToValueAtTime(.09,t+.055);jetGain.gain.exponentialRampToValueAtTime(.0001,t+.24);
    bodyGain.gain.setValueAtTime(.0001,t);bodyGain.gain.linearRampToValueAtTime(.16,t+.003);bodyGain.gain.exponentialRampToValueAtTime(.0001,t+.15);
    source.connect(hiss);hiss.connect(jetGain);jetGain.connect(effectsBus);source.connect(body);body.connect(bodyGain);bodyGain.connect(effectsBus);
    source.onended=()=>{for(const node of [source,hiss,body,jetGain,bodyGain])node.disconnect();};source.start(t);source.stop(t+.26);
  }
  function sound(kind){if(kind==='empty'){tone(180,100,.085,'square',.035);tone(120,70,.1,'square',.03,.1);}if(kind==='flap')tone(550,980,.065,'square',.025);if(kind==='score'){[660,880,1320].forEach((n,i)=>tone(n,n,.1,'triangle',.075,i*.07));}if(kind==='hit'){tone(150,35,.3,'sawtooth',.065);tone(70,25,.4,'triangle',.12);}if(kind==='start'){[440,660,880].forEach((n,i)=>tone(n,n,.12,'square',.025,i*.08));}}
  function soundUI(){el('sound').textContent=muted?'ACTIVAR':'SILENCIAR';el('sound').classList.toggle('muted',muted);el('sound').setAttribute('aria-pressed',String(muted));el('sound').setAttribute('aria-label',muted?'Activar sonido':'Silenciar sonido');}
  function explosionSound(){if(muted||!audio)return;const length=Math.floor(audio.sampleRate*.6),buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(3000,audio.currentTime);filter.frequency.exponentialRampToValueAtTime(100,audio.currentTime+.6);gain.gain.setValueAtTime(.22,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.6);source.connect(filter);filter.connect(gain);gain.connect(effectsBus);source.start();tone(110,25,.55,'triangle',.18);}
  function notifyUnlocks(fresh){
    if(!fresh.length)return;
    runUnlocks.push(...fresh);unlockTime=3.2;
    el('unlock-name').textContent=fresh.map(a=>a.reward).join(' · ');el('unlock-toast').hidden=false;
    window.flightCollectionUI?.refresh();
  }
  function selectCosmetic(group,id){if(state==='playing')return false;const changed=wardrobe.select(group,id);if(changed)window.flightCollectionUI?.refresh();return changed;}
  function detonate(){if(state!=='playing'||paused)return false;initAudio();if(bombs===0){sound('empty');return false;}eventEngine.cancel();resetCombo(true);sectionProgress=null;objectiveEvent('bomb');bombs--;if(wardrobe.item('bird').vehicle){rocketFlip=.65;rocketThrust=.3;}notifyUnlocks(wardrobe.detonate());const explosionColors=wardrobe.item('blast').colors;shieldTime=Math.max(shieldTime,.9);el('shield-status').hidden=false;bombUI();const visible=pipes.filter(p=>p.x-5<W&&p.x+41>0);pipes=pipes.filter(p=>!(p.x-5<W&&p.x+41>0));spawn=Math.max(spawn,.85);blasts.push({x:bird.x,y:bird.y,age:0,life:.85,radius:Math.hypot(W,H),colors:explosionColors});shake=reduced?0:.45;for(let i=0;i<(reduced?32:100);i++){const angle=Math.random()*Math.PI*2,speed=65+Math.random()*250;particles.push({x:bird.x,y:bird.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.4+Math.random()*.65,max:1.05,size:2+Math.random()*4,color:explosionColors[i%explosionColors.length]});}for(const p of visible){for(const [top,bottom] of [[0,p.y],[p.y+p.gap,H-28]])for(let y=top;y<bottom;y+=12)for(let x=p.x;x<p.x+36;x+=12){if(x<0||x>W)continue;particles.push({x,y,vx:(x-bird.x)*.7+(Math.random()-.5)*110,vy:(y-bird.y)*.7-60,life:.5+Math.random()*.55,max:1.05,size:4+Math.random()*4,color:['#b5dd73','#74b65c','#39864d'][Math.floor(Math.random()*3)]});}}explosionSound();return true;}
  soundUI();el('sound').addEventListener('click',()=>{initAudio();muted=!muted;if(muted)musicEngine.stop();if(effectsBus)effectsBus.gain.setValueAtTime(muted?0:audioMix.get().effects,audio.currentTime);soundUI();try{localStorage.setItem('pixel-flight-muted',String(muted));}catch{}if(!muted)tone(880,880,.08);});
  function start(){dailyCursor=dailyLastPassed=0;dailyDistance=100;dailyFinishDistance=null;dailyCheckpointDistance=null;dailyCompleted=false;frameCarry=0;el('frame').classList.toggle('daily-mode',Boolean(dailyCourse));resize();eventEngine.reset();eventBonus=0;clearRewardFeedback();comboBonus=sectionBonus=furthestPipes=0;resetRhythm();rocketThrust=rocketFlip=0;bestAttempt=null;lives=3;lifeMilestones.clear();lifeSpawn=lifeInterval();reviveTime=0;checkpoint=null;window.flightCollectionUI?.close();el('home-unlocks').hidden=true;el('close-results').hidden=true;initAudio();bombCapacity=3;capacitySpawn=0;enemies=[];enemySpawn=2;wardrobe.startRun();runUnlocks=[];unlockTime=0;el('unlock-toast').hidden=true;score=0;pipesPassed=0;shieldTime=0;bombBonus=clockBonus=nearBonus=0;peakSpeed=1;el('shield-status').hidden=true;el('results').hidden=true;scrollSpeed=102;difficultyLevel=0;slowUnlocked=false;slowSpawn=slowInterval();slowFeedback=0;pendingClockTier=null;el('powerup-message').hidden=true;world.reset();director.reset();worldUI();pipes=[];particles=[];bombs=0;pickups=[];blasts=[];playTime=0;bombSpawn=2+Math.random()*3;spawn=.95;travel=0;flash=0;shake=0;bird={x:W*.27,y:H*.43,v:-145};state='playing';paused=false;bombUI();el('pause-settings').hidden=true;el('overlay').hidden=true;el('hud').hidden=false;el('score').textContent='0';el('frame').classList.remove('over');el('frame').classList.remove('paused');el('pause').classList.remove('is-playing');el('pause').setAttribute('aria-label','Pausar juego');sound('start');resetObjectives();window.flightCollectionUI?.refresh();saveCheckpoint(false);celebrateStyles();}
  function returnHome(){
    if(state!=='dead')return false;eventEngine.reset();eventBonus=0;musicEngine.stop();clearRewardFeedback();
    state='ready';dailyCourse=null;dailyRecord=null;el('frame').classList.remove('daily-mode');resize();comboBonus=sectionBonus=furthestPipes=0;resetRhythm();rocketThrust=rocketFlip=0;bestAttempt=null;paused=false;score=0;pipesPassed=0;difficultyLevel=0;scrollSpeed=102;lives=3;checkpoint=null;reviveTime=0;lifeMilestones.clear();lifeSpawn=lifeInterval();livesUI();
    pipes=[];pickups=[];enemies=[];particles=[];blasts=[];bombs=0;bombCapacity=3;capacitySpawn=0;shieldTime=0;flash=shake=0;
    enemySpawn=2;spawn=.95;bombSpawn=0;slowUnlocked=false;pendingClockTier=null;slowSpawn=slowInterval();slowFeedback=0;
    bombBonus=clockBonus=nearBonus=0;peakSpeed=1;runUnlocks=[];unlockTime=0;playTime=travel=0;
    resetObjectives();bird={x:W*.27,y:H*.43,v:0};world.reset();director.reset();worldUI();bombUI();
    el('score').textContent='0';el('hud').hidden=true;el('overlay').hidden=false;el('results').hidden=true;
    el('powerup-message').hidden=true;el('unlock-toast').hidden=true;el('shield-status').hidden=true;
    el('close-results').hidden=true;el('home-unlocks').hidden=false;
    el('intro-tag').textContent='EL CIELO ES TUYO';el('title').innerHTML='PIXEL<br><span>FLIGHT</span>';
    el('message').textContent='Un pequeño pájaro. Un gran desafío.';el('play-label').textContent='A VOLAR';
    el('overlay-hint').hidden=false;el('overlay-hint').innerHTML='<kbd>ESPACIO</kbd><span>o toca para empezar</span>';
    el('frame').classList.remove('over');el('frame').classList.remove('paused');
    el('pause').classList.remove('is-playing');el('pause').setAttribute('aria-label','Pausar juego');
    window.flightCollectionUI?.refresh();el('play').focus({preventScroll:true});return true;
  }
  el('close-results').addEventListener('click',returnHome);
  function flap(){if(state==='dead'&&time-deathTime>.55&&lives>0){continueRun();return;}if(state==='ready'||(state==='dead'&&time-deathTime>.55)){start();return;}if(state!=='playing'||paused)return;bird.v=-145;if(wardrobe.item('bird').vehicle){rocketThrust=.24;rocketThrustSound();}else sound('flap');const tailColors=wardrobe.item('trail').colors;for(let i=0;i<5;i++)particles.push({x:bird.x-8,y:bird.y+4,vx:-20-Math.random()*40,vy:(Math.random()-.5)*45,life:.35,max:.35,color:tailColors[i%tailColors.length]});}
  function togglePause(){if(state!=='playing')return;paused=!paused;frameCarry=0;el('pause-settings').hidden=!paused;if(paused)musicEngine.stop();el('frame').classList.toggle('paused',paused);bombUI();el('pause').classList.toggle('is-playing',paused);el('pause').setAttribute('aria-label',paused?'Continuar juego':'Pausar juego');el('overlay').hidden=!paused;if(paused){el('intro-tag').textContent='TÓMATE UN RESPIRO';el('title').innerHTML='EN<br><span>PAUSA</span>';el('message').textContent='Tu próximo salto puede esperar.';el('results').hidden=true;el('play-label').textContent='SEGUIR';el('overlay-hint').hidden=true;}}
  el('play').addEventListener('click',()=>{if(paused){togglePause();initAudio();}else if(state==='dead'&&lives>0)continueRun();else start();canvas.focus({preventScroll:true});});el('pause').addEventListener('click',()=>{togglePause();canvas.focus({preventScroll:true});});
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();flap();});
  // Secondary touch pointers do not need to produce a mouse-style click.
  // Activate on contact, just like flapping, without filtering isPrimary.
  el('bomb').addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    e.preventDefault();e.stopPropagation();detonate();canvas.focus({preventScroll:true});
  },{passive:false});
  el('bomb').addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    // Pointer input was already handled above; retain keyboard/assistive activation.
    if(e.detail!==0||e.pointerType)return;
    detonate();canvas.focus({preventScroll:true});
  });
  document.addEventListener('keydown',e=>{if(el('unlocks-dialog').open||el('audio-dialog').open||el('daily-dialog').open||window.flightRecordUI?.isOpen())return;if(e.code==='KeyX'||e.code==='Enter'||e.code==='NumpadEnter'){if(state==='playing'&&!paused){e.preventDefault();if(!e.repeat)detonate();}return;}if(e.code==='Space'||e.code==='ArrowUp'){if(e.target instanceof HTMLButtonElement)return;e.preventDefault();if(!e.repeat)flap();}if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();if(!e.repeat)togglePause();bombUI();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing'&&!paused)togglePause();});
  const speedLabel=value=>'×'+value.toFixed(2).replace('.',',');
  function finishResults(){
    const attempt={score,days:1+Math.floor(pipesPassed/40),pipes:pipesPassed,bonus:bombBonus+clockBonus+nearBonus+comboBonus+sectionBonus+objectiveBonus+eventBonus,speed:peakSpeed,bombs:bombBonus,clocks:clockBonus,rasantes:nearBonus,...(comboBonus?{combos:comboBonus}:{}),...(sectionBonus?{tramos:sectionBonus}:{}),...(objectiveBonus?{objetivos:objectiveBonus}:{}),...(eventBonus?{eventos:eventBonus}:{}),...(dailyCourse?{completed:dailyCompleted}:{})};
    if(!bestAttempt||attempt.score>bestAttempt.score||attempt.score===bestAttempt.score&&(attempt.pipes>bestAttempt.pipes||attempt.pipes===bestAttempt.pipes&&attempt.speed>bestAttempt.speed))bestAttempt={...attempt};
    const result=bestAttempt;
    if(dailyCourse)return finishDailyResults(result);
    const current={days:result.days,pipes:result.pipes,bonus:result.bonus,speed:result.speed};
    el('results').setAttribute('aria-label','Mejor run de la partida');
    let improved=result.score>best;
    el('record-score').hidden=!improved;
    if(improved){best=result.score;bestRun={...result};try{localStorage.setItem('pixel-flight-best',String(best));localStorage.setItem('pixel-flight-best-run-v1',JSON.stringify(bestRun));}catch{}}
    el('best').textContent=String(best).padStart(2,'0');
    el('final-score').textContent=String(result.score);el('final-best').textContent=String(best);
    for(const key of Object.keys(current)){
      const record=attempt[key]>personalRecords[key];
      personalRecords[key]=Math.max(personalRecords[key],attempt[key]);improved=improved||record;
      el('final-'+key).textContent=key==='speed'?speedLabel(current[key]):String(current[key]);
      el('best-'+key).textContent=key==='speed'?speedLabel(personalRecords[key]):String(personalRecords[key]);
      const shownRecord=record&&current[key]===attempt[key];
      el('record-'+key).hidden=!shownRecord;el('result-'+key).classList.toggle('is-record',shownRecord);
    }
    el('bonus-breakdown').textContent='Bombas '+result.bombs+' · Relojes '+result.clocks+' · Rasantes '+result.rasantes+(result.combos?' · Combos '+result.combos:'')+(result.tramos?' · Tramos '+result.tramos:'')+(result.objetivos?' · Objetivos '+result.objetivos:'')+(result.eventos?' · Eventos '+result.eventos:'');
    try{localStorage.setItem('pixel-flight-records-v1',JSON.stringify(personalRecords));}catch{}
    el('run-unlocks').hidden=runUnlocks.length===0;el('run-unlocks').textContent=runUnlocks.length===1?'Nuevo estilo: '+runUnlocks[0].reward:'¡'+runUnlocks.length+' estilos nuevos! Mira «Desbloqueables».';
    return improved;
  }
  function die(completed=false){
    if(state!=='playing')return;
    musicEngine.stop();eventEngine.resume();resetCombo();sectionProgress=null;if(objective&&!objective.done)objective.progress=0;lives=completed?0:Math.max(0,lives-1);reviveTime=0;livesUI();state='dead';el('close-results').hidden=false;el('home-unlocks').hidden=true;shieldTime=0;el('shield-status').hidden=true;bombUI();deathTime=time;flash=completed?0:.18;shake=completed||reduced?0:.3;sound(completed?'score':'hit');
    const record=finishResults();window.flightCollectionUI?.refresh();
    el('intro-tag').textContent=record?'¡NUEVO RÉCORD!':'MEJOR RUN DE ESTA PARTIDA';
    el('title').innerHTML='BUEN<br><span>INTENTO</span>';
    el('message').textContent=score===0?'El próximo vuelo será mejor.':score<10?'Ya le estás tomando el ritmo.':'¡Eso fue un gran vuelo!';
    el('results').hidden=false;el('play-label').textContent='OTRA VEZ';el('overlay-hint').hidden=false;
    el('overlay-hint').innerHTML='<kbd>ESPACIO</kbd><span>para volver a volar</span>';if(lives>0){el('title').innerHTML='¡OTRA<br><span>VIDA!</span>';el('message').textContent=(lives===1?'Te queda 1 vida.':'Te quedan '+lives+' vidas.')+' Volverás '+(checkpointNumber()?'al chackpoint '+checkpointNumber(): 'al inicio')+'.';el('play-label').textContent='CONTINUAR';el('overlay-hint').innerHTML='<kbd>ESPACIO</kbd><span>para continuar desde el checkpoint</span>';}else{el('title').innerHTML='FIN DEL<br><span>JUEGO</span>';el('message').textContent='Tu mejor run de esta partida: '+bestAttempt.score+' puntos.';}
    el('pause-settings').hidden=true;
    if(dailyCourse){el('intro-tag').textContent='DIARIO · '+dailyCourse.date+' UTC';if(completed){el('title').innerHTML='¡DESAFÍO<br><span>COMPLETO!</span>';el('message').textContent='Recorrido terminado. Tu mejor puntuación: '+bestAttempt.score+' puntos.';celebrate('#ffe58a');}else el('message').textContent+=' Desafío del '+dailyCourse.date+'.';}
    for(let i=0;i<18;i++)particles.push({x:bird.x,y:bird.y,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:.6,max:.6,color:i%2?'#ffd857':'#fff7da'});
  }
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function drawCheckpoint(p,number){
    const base=p.y+p.gap,x=p.x+28,y=base-31,wave=reduced?0:Math.sin(playTime*7)*2;
    rect(x-1,y-3,3,34,'#334b45');rect(x,y-4,2,3,'#fff0a3');
    for(let row=0;row<13;row+=2){const width=row<7?22-row*.55:16+(row-7)*.8;rect(x+2,y+row+wave*row/13,width,2,row%4?'#ffad5a':'#ffe58a');}
    rect(x+4,y+3,3,3,'#fff8d7');rect(x+10,y+5,3,3,'#b67454');
    ctx.save();ctx.font='6px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillStyle='#243d38';ctx.fillText(String(number),x+12,y+22);ctx.restore();
  }
  function cloud(x,y,s=1){x=Math.round(x);y=Math.round(y);rect(x+8*s,y,23*s,7*s,'#e9f6d7');rect(x,y+7*s,46*s,12*s,'#e9f6d7');rect(x-8*s,y+13*s,62*s,8*s,'#e9f6d7');rect(x-3*s,y+21*s,53*s,4*s,'#b6e6d6');rect(x+10*s,y+5*s,15*s,3*s,'#fff9dc');}
  function mountain(x,base,width,height,color){for(let i=0;i<height;i+=6){const span=width*(i/height);rect(x+(width-span)/2,base-height+i,span,7,color);}}
  function tree(x,y,size,c1,c2){rect(x+size*.45,y+size*.35,size*.13,size*.7,'#477852');rect(x+size*.2,y,size*.6,size*.16,c1);rect(x+size*.08,y+size*.15,size*.85,size*.2,c1);rect(x,y+size*.33,size,size*.25,c1);rect(x+size*.08,y+size*.56,size*.85,size*.16,c2);rect(x+size*.15,y+size*.2,size*.25,size*.07,c2);}
  function scene(){world.draw(ctx,W,H,travel);}
  function pipe(x,y,height,upper,moving=false){if(height<=0)return;const c='#244f3e';rect(x-1,y,38,height,c);rect(x+2,y,32,height,'#5da751');rect(x+4,y,5,height,'#9ad064');rect(x+10,y,3,height,'#7fbd58');rect(x+27,y,6,height,'#39864d');rect(x+32,y,3,height,'#2e7145');const lipY=upper?y+height-13:y;rect(x-5,lipY,46,13,c);rect(x-3,lipY+2,42,8,'#74b65c');rect(x-1,lipY+2,7,8,'#b5dd73');rect(x+30,lipY+2,9,8,'#448d4e');rect(x-3,lipY+10,42,2,'#345e3e');if(moving){rect(x+14,lipY+3,9,2,'#ffe58a');rect(x+16,lipY+5,5,2,'#ffe58a');}}
  const sprite=window.flightCosmetics.sprite;
  function drawPickup(p){window.flightPowerupArt.draw(ctx,p,p.kind==='slow'?clockTier(p):null,playTime);}
  function drawEnemies(){
    for(const e of enemies){
      if(e.warning>0){
        const color=reduced?'#ffca86':Math.sin(e.warning*18)>0?'#ffca86':'#ef7772';
        rect(W-14,e.y-7,4,14,'#482b40');rect(W-18,e.y-4,4,8,'#482b40');rect(W-21,e.y-1,3,2,'#482b40');
        rect(W-13,e.y-5,2,10,color);rect(W-17,e.y-2,4,4,color);continue;
      }
      ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));ctx.scale(-1,1);
      const colors={O:'#432b40',Y:'#d96370',W:'#fff0cb',B:'#332c45',R:'#ffc56a'},scale=1.5;
      for(let r=0;r<sprite.length;r++)for(let c=0;c<sprite[r].length;c++)if(colors[sprite[r][c]])rect((c-7)*scale,(r-5)*scale,scale,scale,colors[sprite[r][c]]);
      const wing=reduced?true:Math.sin(e.age*24)>0;rect(-9,wing?-1:3,8,4,'#8e3f64');rect(-8,wing?-2:2,6,2,'#f2969b');rect(2,-6,6,2,'#73334f');
      ctx.restore();
    }
  }
  function drawBlasts(){for(const b of blasts){const palette=b.colors||blastColors,progress=b.age/b.life, radius=b.radius*(1-(1-progress)**3);ctx.save();ctx.globalAlpha=(1-progress)*(reduced?.2:.75);ctx.strokeStyle=palette[Math.floor(progress*palette.length)%palette.length];ctx.lineWidth=Math.max(2,18*(1-progress));ctx.beginPath();ctx.arc(b.x,b.y,radius,0,Math.PI*2);ctx.stroke();if(!reduced){ctx.globalAlpha=(1-progress)*.35;ctx.strokeStyle='#fff8d9';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x,b.y,radius*.7,0,Math.PI*2);ctx.stroke();if(progress<.14){ctx.globalAlpha=(.14-progress)*1.5;rect(0,0,W,H,palette[2]);}}ctx.restore();}}
  function drawShield(){
    if(state!=='playing'||shieldTime<=0)return;
    ctx.save();ctx.translate(Math.round(bird.x),Math.round(bird.y));
    ctx.globalAlpha=reduced?.85:.65+.2*Math.sin(playTime*12);
    const c=shieldTime>.25?'#bafff1':'#ffe58a';
    for(const [x,y,w,h] of [[-10,-20,20,2],[-10,18,20,2],[-16,-16,6,2],[10,-16,6,2],[-16,14,6,2],[10,14,6,2],[-20,-10,2,20],[18,-10,2,20],[-18,-14,2,4],[16,-14,2,4],[-18,10,2,4],[16,10,2,4]])rect(x,y,w,h,c);
    if(!reduced){rect(-26,-2,5,2,'#fff8db');rect(22,-2,5,2,'#fff8db');}
    ctx.restore();
  }
  function drawBird(x,y,rotation=0){const skin=wardrobe.item('bird'),colors=skin.colors;if(skin.vehicle){ctx.save();ctx.translate(Math.round(x),Math.round(y));const p=1-rocketFlip/.65,flip=rocketFlip>0&&!reduced?-Math.PI*2*p*p*(3-2*p):0;ctx.rotate(rotation*.25+flip);window.flightCosmetics.drawRocket(ctx,skin,0,0,1,rocketThrust,playTime);ctx.restore();return;}ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(rotation);const s=1.5;for(let r=0;r<sprite.length;r++)for(let c=0;c<sprite[r].length;c++)if(colors[sprite[r][c]])rect((c-7)*s,(r-5)*s,s,s,colors[sprite[r][c]]);const wing=state==='playing'?Math.sin(time*30)>0:Math.sin(time*9)>0;rect(-9,wing?-1:3,7,4,skin.wing);rect(-9,wing?-2:2,6,2,skin.light);rect(-4,-6,5,2,skin.crest);ctx.restore();}
  function update(dt){
    time+=dt;
    if(!paused)world.update(dt);
    if(state==='playing'&&!paused)scrollSpeed+=(difficulty().speed-scrollSpeed)*(1-Math.exp(-dt*2.3));
    if(!paused&&(state==='ready'||state==='playing'))travel+=dt*(state==='ready'?19:scrollSpeed);
    if(state==='playing'&&!paused){
      comboBreakRemaining=Math.max(0,comboBreakRemaining-dt);
      updateObjective(dt);rocketThrust=Math.max(0,rocketThrust-dt);rocketFlip=Math.max(0,rocketFlip-dt);playTime+=dt;unlockTime=Math.max(0,unlockTime-dt);el('unlock-toast').hidden=unlockTime===0;
      const previousShieldTime=shieldTime;
      shieldTime=Math.max(0,shieldTime-dt);el('shield-status').hidden=shieldTime===0;
      reviveTime=Math.max(0,reviveTime-dt);
      peakSpeed=Math.max(peakSpeed,(100+difficultyLevel)/100);
      slowFeedback=Math.max(0,slowFeedback-dt);
      if(slowFeedback===0){activeReward=null;presentNextReward();}
      el('powerup-message').hidden=slowFeedback===0;
      if(bombs<bombCapacity)bombSpawn-=dt;
      if(lives<6&&!pickups.some(p=>p.kind==='life'))lifeSpawn-=dt;
      if(score>=300&&bombCapacity===3&&!pickups.some(p=>p.kind==='capacity'))capacitySpawn-=dt;
      if(slowUnlocked&&difficultyLevel>0)slowSpawn-=dt;
      const previousBirdY=bird.y;bird.v+=440*dt;bird.y+=bird.v*dt;spawn-=dt;
      if(dailyCourse)spawnDaily(dt);
      if(!dailyCourse&&spawn<=0){
        if(landscapeEventsEnabled&&!dailyCourse){const ws=world.getState();eventEngine.consider({passed:pipesPassed,safe:enemies.length===0&&pipes.every(p=>p.passed||!p.motion)&&shieldTime===0&&!objectiveReplayLock,biome:ws.background,transition:ws.transition});}
        const nextPipe=plannedPipe(W+15);
        if(nextPipe){
          pipes.push(nextPipe);
          if(landscapeEventsEnabled)eventEngine.acceptedPipe();
          const sealPlaced=landscapeEventsEnabled&&!dailyCourse&&eventEngine.offer(nextPipe,pos=>Boolean(routes.findRoute({previous:pipes[pipes.length-2],pipe:nextPipe,x:pos.x,y:pos.y,height:H,speed:Math.max(scrollSpeed,difficulty().speed)*1.015,settings:motionSettings(),startY:bird.y,startV:bird.v,birdX:bird.x,hazards:[]})));
          if(!sealPlaced){
          const slowDue=slowUnlocked&&difficultyLevel>0&&slowSpawn<=0;
          const bombDue=bombSpawn<=0&&bombs<bombCapacity;
          const capacityDue=score>=300&&bombCapacity===3&&capacitySpawn<=0&&!pickups.some(p=>p.kind==='capacity');
          let capacityPlaced=false;
          if(lives<6&&lifeSpawn<=0&&!pickups.some(p=>p.kind==='life')){
            const pos=pickupPosition(nextPipe,pipes[pipes.length-2],1);
            if(pos){pickups.push({kind:'life',...pos,phase:Math.random()*6});lifeSpawn=lifeInterval();capacityPlaced=true;}
          }
          if(capacityDue&&!capacityPlaced){
            const pos=pickupPosition(pipes[pipes.length-1],pipes[pipes.length-2],1.5);
            if(pos){pickups.push({kind:'capacity',...pos,phase:Math.random()*6});capacitySpawn=12+Math.random()*10;capacityPlaced=true;}
          }
          if(!capacityPlaced){if(slowDue&&(!bombDue||Math.random()<.5)){
            const tier=pendingClockTier??(pendingClockTier=rollClockTier()),pos=pickupPosition(pipes[pipes.length-1],pipes[pipes.length-2],CLOCK_TIERS.find(t=>t.id===tier).effect/10);
            if(pos){pickups.push({kind:'slow',clockTier:tier,...pos,phase:Math.random()*6});slowSpawn=slowInterval();pendingClockTier=null;}
          }else if(bombDue){
            const pos=pickupPosition(pipes[pipes.length-1],pipes[pipes.length-2]);
            if(pos){pickups.push({kind:'bomb',...pos,phase:Math.random()*6});bombSpawn=bombInterval();}
          }}
          }
          spawn=nextPipe.spacing/scrollSpeed;
        }else spawn=.35;
      }
      const previousPipeCenters=new Map();
      for(const p of pipes){previousPipeCenters.set(p,p.y+p.gap/2);updatePipeMotion(p,dt);if(p.section?.index===1&&!p.announced&&p.x-bird.x<Math.min(150,W*.5)&&!p.passed){p.announced=true;routeCaption=sectionNames[p.pattern]+' · '+p.section.length+' TUBERÍAS';}}
      for(const p of pickups){
        const clock=p.kind==='slow'?clockTier(p):null;
        if(p.anchor){if(pipes.includes(p.anchor))p.y=p.anchor.y+p.offset;else p.anchor=null;}
        p.x-=scrollSpeed*dt;
        const py=p.y+Math.sin(playTime*4+p.phase)*3;
        if(Math.abs(p.x-bird.x)>=19||Math.abs(py-bird.y)>=17)continue;
        if(p.kind==='life'){
          if(!awardLife('CORAZÓN RECOGIDO'))continue;
          p.collected=true;rhythmPickup();
        }else if(p.kind==='capacity'){
          if(score<300||bombCapacity===6)continue;
          bombCapacity=6;p.collected=true;rhythmPickup();bombUI();showPowerupFeedback(0);
          [660,990,1320,1760].forEach((n,i)=>tone(n,n,.14,'triangle',.06,i*.07));
        }else if(p.kind==='slow'){
          if(difficultyLevel===0)continue;
          const previousSpeed=1+difficultyLevel*.01;
          difficultyLevel=Math.max(0,Math.round((previousSpeed*(1-clock.reduction)-1)*1e12)/1e10);
          const reduction=(1-(1+difficultyLevel*.01)/previousSpeed)*100;p.collected=true;
          // Only widen existing gaps: a difficulty change never closes a pipe onto the bird.
          const gap=difficulty().gap;
          for(const pipe of pipes)if(pipe.gap<gap){const delta=(gap-pipe.gap)/2;pipe.y-=delta;pipe.gap=gap;eventEngine.widen(pipe,delta);if(pipe.motion){pipe.motion.baseY-=delta;updatePipeMotion(pipe,0);}for(const pickup of pickups)if(pickup.anchor===pipe){pickup.offset+=delta;pickup.y=pipe.y+pickup.offset;}}
          if(difficultyLevel===0)slowSpawn=slowInterval();
          notifyUnlocks(wardrobe.collectClock(clock.id));clockBonus+=clock.points;addScore(clock.points);rhythmPickup();showPowerupFeedback(clock.points,reduction,clock);
          [1175,880,660].forEach((n,i)=>tone(n,n,.14,'triangle',.075,i*.08));if(clock.id!=='basic')tone(1760,1320,.3,'triangle',.045,.2);if(clock.id==='legendary')tone(2200,1760,.4,'triangle',.04,.3);
        }else{
          if(bombs>=bombCapacity)continue;
          bombs++;p.collected=true;bombUI();bombBonus+=10;addScore(10);rhythmPickup();showPowerupFeedback(10);
          [880,1175,1568].forEach((n,i)=>tone(n,n,.1,'triangle',.07,i*.06));
        }
        objectiveEvent('pickup',{kind:p.kind});
        const count=clock?(reduced?12:clock.effect+2):12;const life=clock?.id==='legendary'?.7:.45;for(let i=0;i<count;i++)particles.push({x:p.x,y:py,vx:(Math.random()-.5)*(clock?.id==='legendary'?150:90),vy:(Math.random()-.5)*110,life,max:life,color:clock?[clock.color,clock.light,clock.sand][i%3]:blastColors[i%blastColors.length]});
      }
      pickups=pickups.filter(p=>!p.collected&&p.x>-25&&!(p.kind==='slow'&&difficultyLevel===0)&&!(p.kind==='capacity'&&bombCapacity===6)&&!(p.kind==='life'&&lives===6));
      for(const p of pipes){
        const previousX=p.x;p.x-=scrollSpeed*dt;
        // Sample the flight at the opening's middle, before the trailing-edge score gate.
        if(p.precisePass===undefined&&previousX+18>=bird.x&&p.x+18<=bird.x&&previousX>p.x){
          const fraction=(previousX+18-bird.x)/(previousX-p.x);
          const flightY=previousBirdY+(bird.y-previousBirdY)*fraction;
          const oldCenter=previousPipeCenters.get(p)??(p.y+p.gap/2);
          const center=oldCenter+(p.y+p.gap/2-oldCenter)*fraction;
          p.precisePass=previousShieldTime<=dt*fraction&&Math.abs(flightY-center)<=Math.max(6,Math.min(12,p.gap*.16));
        }
        if(!p.passed&&p.x+40<bird.x){
          p.passed=true;if(dailyCourse)dailyLastPassed=p.dailyIndex||dailyLastPassed;pipesPassed++;notifyUnlocks(wardrobe.passPipe(pipesPassed));
          difficultyLevel++;peakSpeed=Math.max(peakSpeed,(100+difficultyLevel)/100);
          if(difficultyLevel>=25&&!slowUnlocked){slowUnlocked=true;slowSpawn=slowInterval();}
          if(pipesPassed%10===0)world.advance(pipesPassed,dailyCourse?dailyCourse.random('world',pipesPassed):Math.random);
          addScore(1);const objectiveFresh=pipesPassed>furthestPipes;if(objectiveFresh)objectiveReplayLock=false;rhythmPipe(p);objectiveEvent('pipe',{pipe:p,fresh:objectiveFresh});sound('score');
          if(dailyCourse?p.dailyIndex===50:pipesPassed%50===0){p.checkpointNumber=dailyCourse?p.dailyIndex:pipesPassed;if(dailyCourse)dailyCheckpointDistance=null;saveCheckpoint();}
          for(let i=0;i<8;i++)particles.push({x:bird.x,y:bird.y,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*70,life:.4,max:.4,color:'#fff7bf'});
        }
        if(shieldTime===0&&bird.x+8>p.x-5&&bird.x-8<p.x+41&&(bird.y-6<p.y||bird.y+6>p.y+p.gap)){die();break;}
      }
      pipes=pipes.filter(p=>p.x>-60);
      updateEnemies(dt,previousBirdY);
      if(landscapeEventsEnabled&&!dailyCourse&&state==='playing')eventEngine.update(dt,{bird,previousY:previousBirdY,shielded:shieldTime>0,segmentHitsBox:routes.segmentHitsBox});
      if(dailyCourse&&dailyCheckpointDistance!==null&&dailyCheckpointDistance<=0&&state==='playing'){dailyLastPassed=Math.max(50,dailyLastPassed);dailyCheckpointDistance=null;saveCheckpoint();}
      if(dailyCourse&&dailyFinishDistance!==null&&dailyFinishDistance<=0&&state==='playing'){dailyCompleted=true;dailyLastPassed=dailyCourse.length;die(true);}
      if(bird.y+7>=H-28||bird.y-7<=0){if(reviveTime>0){bird.y=Math.max(8,Math.min(H-36,bird.y));bird.v=0;}else die();}
    }
    eventUI();
    musicEngine.update({playing:state==='playing'&&!paused,muted,biome:window.flightEvents.themes.findIndex(t=>t.biome===world.getState().background),combo:comboTier,event:landscapeEventsEnabled&&!dailyCourse&&eventEngine.getState().phase==='active'});
    if(state==='dead'&&!paused){bird.v+=540*dt;bird.y=Math.min(H-36,bird.y+bird.v*dt);if(time-deathTime>.45){el('overlay').hidden=false;el('hud').hidden=true;el('frame').classList.add('over');}}
    if(!paused){for(const b of blasts)b.age+=dt;blasts=blasts.filter(b=>b.age<b.life);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=75*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);flash=Math.max(0,flash-dt);shake=Math.max(0,shake-dt);}
  }
  function draw(){ctx.save();if(shake>0)ctx.translate((Math.random()-.5)*5,(Math.random()-.5)*5);scene();if(landscapeEventsEnabled&&!dailyCourse)eventEngine.draw(ctx,W,H);let upcoming=pipesPassed;for(const p of pipes){pipe(p.x,0,p.y,true,Boolean(p.motion));pipe(p.x,p.y+p.gap,H-28-p.y-p.gap,false,Boolean(p.motion));if(!p.passed&&(dailyCourse?p.dailyIndex%50===0:++upcoming%50===0))drawCheckpoint(p,dailyCourse?p.dailyIndex:upcoming);else if(p.checkpointNumber)drawCheckpoint(p,p.checkpointNumber);}drawEnemies();for(const p of pickups)drawPickup(p);drawBlasts();drawShield();if(state==='ready'){const bx=W>300?W*.22:W*.19;const by=H>300?H*.72:H*.46;drawBird(bx,by+(reduced?0:Math.sin(time*3)*4),-.1);}else drawBird(bird.x,bird.y,state==='dead'?Math.min(1.5,(time-deathTime)*4):Math.max(-.4,Math.min(1.15,bird.v*.004)));for(const p of particles){ctx.globalAlpha=p.life/p.max;rect(p.x,p.y,p.size||2,p.size||2,p.color);}ctx.globalAlpha=1;if(flash>0){ctx.globalAlpha=flash/.18*.6;rect(0,0,W,H,'#fff8dc');ctx.globalAlpha=1;}ctx.restore();}
  function frame(now){const dt=Math.min((now-last)/1000||0,.035);last=now;if(dailyCourse&&state==='playing'&&!paused){frameCarry+=dt;while(frameCarry>=1/120&&state==='playing'&&!paused){frameCarry-=1/120;update(1/120);}}else{frameCarry=0;update(dt);}draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
  window.pixelFlight={getState:()=>({version:window.PIXEL_FLIGHT_RELEASE?.version||null,state,paused,score,pipesPassed,days:(1+Math.floor(pipesPassed/40)),best,muted,audioLevels:audioMix.get(),mode:dailyCourse?'daily':'normal',daily:dailyCourse?{date:dailyCourse.date,rules:dailyCourse.rules,length:dailyCourse.length,routeProgress:dailyLastPassed,cursor:dailyCursor,completed:dailyCompleted,record:dailyRecord}:null,music:musicEngine.getState(),landscapeEvent:landscapeEventsEnabled&&!dailyCourse?eventEngine.getState():null,lives,maxLives:6,checkpoint:checkpointNumber(),canContinue:state==='dead'&&lives>0,bombs,bombCapacity,capacityPowerupUnlocked:score>=300,enemyCount:enemies.length,enemiesUnlocked:pipesPassed>=35,shieldRemaining:shieldTime,bonusPoints:bombBonus+clockBonus+nearBonus+comboBonus+sectionBonus+objectiveBonus+eventBonus,combo:{charge:comboCharge,tier:comboTier,breakRemaining:comboBreakRemaining},bonus:{bombs:bombBonus,clocks:clockBonus,rasantes:nearBonus,combos:comboBonus,tramos:sectionBonus,objetivos:objectiveBonus,eventos:eventBonus},objective:objectivesEnabled&&objective?{...objective,cooldown:objectiveCooldown,replayLocked:objectiveReplayLock&&objective.kind!=='center'}:null,bestAttempt:bestAttempt?{...bestAttempt}:null,bestRun:bestRun?{...bestRun}:null,peakSpeed,records:{...personalRecords},collection:wardrobe.getState(),difficulty:difficulty().level,speedMultiplier:1+difficultyLevel*.01,slowUnlocked,...world.getState()}),getCollection:()=>({...wardrobe.getState(),items:{bird:wardrobe.list('bird'),trail:wardrobe.list('trail'),blast:wardrobe.list('blast')}}),selectCosmetic,returnHome,start,startDaily,setVolume,flap,detonate,pause:togglePause};
  resetObjectives();
  if(document.modelContext?.registerTool){const lifecycle=new AbortController();const tool={name:'read_pixel_flight_state',description:'Lee el estado y la puntuación de la partida actual.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).length)throw new Error('Esta acción no acepta parámetros.');return window.pixelFlight.getState();}};try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
})();
