const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function cosmetics(storage=new Map(),records={}){const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/cosmetics.js'),'utf8'),sandbox);return sandbox.window.flightCosmetics.create({getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},records);}
test('collection starts with three equipped styles and rejects locked or invalid choices',()=>{const c=cosmetics();assert.equal(c.getState().available,3);assert.equal(c.getState().total,19);for(const [group,id] of [['bird','breeze'],['trail','stellar'],['blast','boreal'],['toString','x'],['constructor','x'],['bird','unknown']])assert.equal(c.select(group,id),false);assert.equal(c.item('bird').id,'classic');});
test('pipe and day achievements unlock at their own real progression milestones',()=>{const c=cosmetics();c.startRun();assert.equal(c.passPipe(9).length,0);assert.equal(c.passPipe(10)[0].id,'first-flight');assert.equal(c.passPipe(10).length,0);c.detonate();assert.equal(c.passPipe(79).length,0);assert.equal(c.passPipe(80)[0].id,'third-day');assert.equal(c.select('bird','aurora'),true);});
test('clean flight requires 50 pipes in a single run without detonations',()=>{const c=cosmetics();c.startRun();c.passPipe(49);c.detonate();assert.ok(!c.passPipe(80).some(a=>a.id==='clean-flight'));assert.equal(c.select('trail','mint'),false);c.startRun();c.passPipe(49);assert.equal(c.select('trail','mint'),false);assert.ok(c.passPipe(50).some(a=>a.id==='clean-flight'));assert.equal(c.select('trail','mint'),true);c.detonate();assert.equal(c.select('trail','mint'),true);});
test('three clocks must be collected in one run and golden clocks have a separate reward',()=>{const c=cosmetics();c.startRun();c.collectClock('basic');c.collectClock('rare');c.startRun();assert.equal(c.collectClock('basic').length,0);assert.equal(c.collectClock('rare').length,0);const fresh=c.collectClock('legendary');assert.deepEqual(Array.from(fresh,a=>a.id).sort(),['clock-collector','golden-clock']);assert.equal(c.select('trail','stellar'),true);assert.equal(c.select('blast','boreal'),true);});
test('bomb achievement accumulates successful detonations across runs and reloads',()=>{const storage=new Map();let c=cosmetics(storage);c.startRun();for(let i=0;i<3;i++)c.detonate();c=cosmetics(storage);c.startRun();assert.equal(c.detonate().length,0);assert.equal(c.detonate()[0].id,'demolition');assert.equal(c.select('blast','solar'),true);assert.equal(cosmetics(storage).item('blast').id,'solar');});
test('earned choices and progress persist and repeated milestones never unlock twice',()=>{const storage=new Map();let c=cosmetics(storage);c.startRun();c.passPipe(50);c.select('bird','breeze');c.select('trail','mint');c=cosmetics(storage);assert.equal(c.item('bird').id,'breeze');assert.equal(c.item('trail').id,'mint');assert.equal(c.getState().progress.clean,50);c.startRun();assert.equal(c.passPipe(50).length,0);});
test('existing pipe/day records grant relevant rewards without inventing clean-flight or clock history',()=>{const c=cosmetics(new Map(),{pipes:85,days:3});assert.equal(c.select('bird','aurora'),true);assert.equal(c.select('bird','breeze'),true);assert.equal(c.select('trail','mint'),false);assert.equal(c.select('trail','stellar'),false);assert.equal(c.getState().available,5);});
test('corrupt storage and unknown styles recover to valid starter selections',()=>{for(const raw of ['broken',JSON.stringify({selected:{bird:'aurora',trail:'unknown',blast:'boreal'},earned:['bad'],progress:{pipes:-5,days:'3',clocks:null}})]){const storage=new Map([['pixel-flight-collection-v1',raw]]);const c=cosmetics(storage);assert.equal(c.getState().available,3);assert.equal(c.item('bird').id,'classic');assert.equal(c.item('trail').id,'gold');assert.equal(c.item('blast').id,'rainbow');}});
test('unavailable storage preserves earned styles and selections within the session',()=>{const c=cosmetics({get(){throw Error('blocked');},set(){throw Error('blocked');}});assert.equal(c.getState().persistent,false);c.startRun();c.passPipe(10);assert.equal(c.select('bird','breeze'),true);assert.equal(c.item('bird').id,'breeze');});

test('expanded catalog has seven bird styles and six effects per category and one reward per achievement',()=>{
  const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/cosmetics.js'),'utf8'),sandbox);
  const art=sandbox.window.flightCosmetics,c=cosmetics(),rewards=new Set();let pixels=0;
  const ctx={set fillStyle(value){assert.match(value,/^#[a-f0-9]{6}$/i);},fillRect(){pixels++;}};
  for(const group of ['bird','trail','blast']){
    const items=c.list(group);assert.equal(items.length,group==='bird'?7:6);assert.equal(new Set(items.map(i=>i.id)).size,items.length);
    assert.equal(new Set(items.map(i=>JSON.stringify(i.colors))).size,items.length);
    for(const item of items){art.swatch(ctx,group,item,36,22);if(item.goal){assert.ok(!rewards.has(item.goal.id));rewards.add(item.goal.id);}}
  }
  assert.equal(rewards.size,16);assert.ok(pixels>300);assert.equal(c.getState().total,19);
});

test('all nine new rewards unlock exactly at their milestones and persist when equipped',()=>{
  for(const [group,id,key,goal] of [
    ['bird','coral','pipes',120],['bird','eclipse','days',6],['bird','phoenix','pipes',300],
    ['trail','comet','clean',100],['trail','prism','clocks',6],['trail','glacier','days',9],
    ['blast','nebula','bombs',15],['blast','magma','bombs',30],['blast','supernova','clocks',10]
  ]){
    const storage=new Map([['pixel-flight-collection-v1',JSON.stringify({progress:{[key]:goal-1}})]]);
    const c=cosmetics(storage);assert.equal(c.select(group,id),false);c.startRun();let fresh;
    if(key==='clocks'){for(let i=1;i<goal;i++)assert.ok(!c.collectClock('basic').some(a=>a.reward===c.list(group).find(i=>i.id===id).goal.reward));fresh=c.collectClock('basic');}
    else if(key==='bombs')fresh=c.detonate();
    else fresh=c.passPipe(key==='days'?(goal-1)*40:goal);
    const achievement=c.list(group).find(i=>i.id===id).goal.id;
    assert.ok(fresh.some(a=>a.id===achievement),id);assert.equal(c.select(group,id),true);
    const reloaded=cosmetics(storage);assert.equal(reloaded.item(group).id,id);assert.ok(reloaded.list(group).find(i=>i.id===id).available);
  }
});

test('legacy collections retain old selections and apply stored progress to new rewards',()=>{
  const storage=new Map([['pixel-flight-collection-v1',JSON.stringify({selected:{bird:'aurora',trail:'stellar',blast:'boreal'},earned:['third-day','clock-collector','golden-clock'],progress:{pipes:320,days:9,clean:100,clocks:10,bombs:30,gold:1}})]]);
  const c=cosmetics(storage);assert.equal(c.getState().available,18);assert.equal(c.getState().earned.length,15);
  for(const [group,id] of [['bird','aurora'],['trail','stellar'],['blast','boreal']])assert.equal(c.item(group).id,id);
  c.startRun();assert.equal(c.passPipe(320).length,0);assert.equal(cosmetics(storage).getState().available,18);
});

test('Tesla Rocket requires 1000 total score in one game, persists and honors existing records',()=>{const storage=new Map();let c=cosmetics(storage);c.startRun();assert.equal(c.reachScore(999).length,0);assert.equal(c.select('bird','tesla-rocket'),false);assert.equal(c.reachScore(1000)[0].id,'rocket-launch');assert.equal(c.reachScore(1100).length,0);assert.equal(c.select('bird','tesla-rocket'),true);c=cosmetics(storage);assert.equal(c.item('bird').id,'tesla-rocket');c.startRun();c.reachScore(0);assert.equal(c.item('bird').vehicle,true);const fresh=cosmetics();fresh.reachScore(600);fresh.startRun();fresh.reachScore(600);assert.equal(fresh.select('bird','tesla-rocket'),false);assert.equal(cosmetics(new Map(),{score:1000}).select('bird','tesla-rocket'),true);assert.equal(cosmetics(new Map(),{pipes:2500}).select('bird','tesla-rocket'),false);});
test('Tesla Rocket has a compact body and its jets are deterministic cosmetic pixels',()=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/cosmetics.js'),'utf8'),sandbox);const art=sandbox.window.flightCosmetics,c=cosmetics(new Map(),{score:2500}),rocket=c.list('bird').find(i=>i.id==='tesla-rocket');const pixels=[],ctx={fillStyle:'',fillRect(x,y,w,h){pixels.push({x,y,w,h,color:this.fillStyle});}};art.drawRocket(ctx,rocket,0,0);assert.ok(pixels.every(p=>p.x>=-19&&p.x+p.w<=19&&p.y>=-5&&p.y+p.h<=8));const bodyCount=pixels.length;art.drawRocket(ctx,rocket,0,0,1,.24,1);assert.ok(pixels.length>bodyCount*2);assert.ok(pixels.some(p=>p.y>9&&p.color==='#b1e7ed'));});
