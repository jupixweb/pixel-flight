const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function setup(mode='native'){
  const handlers={},winHandlers={},styles={},attrs={},classes=new Set();let click,requested=0,exited=0;
  const root={};const doc={documentElement:root,body:{classList:{toggle:(k,v)=>v?classes.add(k):classes.delete(k)}},fullscreenElement:null,addEventListener:(k,fn)=>handlers[k]=fn};
  const button={setAttribute:(k,v)=>attrs[k]=v,addEventListener:(k,fn)=>{if(k==='click')click=fn;}},frame={style:{setProperty:(k,v)=>styles[k]=v}},dialog={open:false};
  doc.getElementById=id=>({fullscreen:button,frame,game:{focus(){}},'unlocks-dialog':dialog})[id];
  if(mode!=='unsupported')root.requestFullscreen=async()=>{requested++;if(mode==='denied')throw Error('denied');doc.fullscreenElement=root;handlers.fullscreenchange();};
  doc.exitFullscreen=async()=>{exited++;doc.fullscreenElement=null;handlers.fullscreenchange();};
  const win={innerWidth:1920,innerHeight:1080,addEventListener:(k,fn)=>winHandlers[k]=fn};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/fullscreen.js'),'utf8'),{document:doc,window:win});
  return{doc,root,win,styles,attrs,classes,dialog,click:()=>click(),resize:()=>winHandlers.resize(),nativeExit:()=>{doc.fullscreenElement=null;handlers.fullscreenchange();},escape:()=>{let stopped=false;handlers.keydown({code:'Escape',preventDefault(){},stopImmediatePropagation(){stopped=true;}});return stopped;},counts:()=>({requested,exited})};
}
test('native fullscreen enters, fits without stretching, and restores',async()=>{const g=setup();await g.click();assert.equal(g.doc.fullscreenElement,g.root);assert.ok(g.classes.has('game-expanded'));assert.equal(g.attrs['aria-pressed'],'true');assert.equal(g.styles['--expanded-width'],'1920px');assert.equal(g.styles['--expanded-height'],'1080px');await g.click();assert.equal(g.doc.fullscreenElement,null);assert.equal(g.attrs['aria-pressed'],'false');assert.equal(g.classes.size,0);assert.equal(g.counts().exited,1);});
test('unsupported or denied fullscreen still expands and restores the window',async()=>{for(const mode of ['unsupported','denied']){const g=setup(mode);await g.click();assert.ok(g.classes.has('game-expanded'));assert.equal(g.doc.fullscreenElement,null);await g.click();assert.equal(g.classes.size,0);assert.equal(g.counts().exited,0);}});
test('viewport changes fit portrait or landscape inside available space',async()=>{const g=setup('unsupported');await g.click();for(const [w,h,ratio] of [[390,844,3/4],[844,390,16/9],[2560,1080,16/9]]){g.win.innerWidth=w;g.win.innerHeight=h;g.resize();const fw=parseFloat(g.styles['--expanded-width']),fh=parseFloat(g.styles['--expanded-height']);assert.ok(fw<=w&&fh<=h);assert.ok(Math.abs(fw/fh-ratio)<1e-8);}});
test('browser fullscreen exit resets controls and layout',async()=>{const g=setup();await g.click();g.nativeExit();assert.equal(g.classes.size,0);assert.equal(g.attrs['aria-label'],'Pantalla completa');});
test('Escape restores expanded mode but gives an open collection dialog priority',async()=>{const g=setup('unsupported');await g.click();g.dialog.open=true;assert.equal(g.escape(),false);assert.ok(g.classes.has('game-expanded'));g.dialog.open=false;assert.equal(g.escape(),true);assert.equal(g.classes.size,0);});
test('unrelated preexisting browser fullscreen is preserved on restore',async()=>{const g=setup();const other={};g.doc.fullscreenElement=other;await g.click();await g.click();assert.equal(g.doc.fullscreenElement,other);assert.equal(g.counts().exited,0);});
