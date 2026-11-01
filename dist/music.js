(() => {
  'use strict';
  const roots=[60,62,57,55,53,48,58,50,48],scale=[0,3,7,10,12],motif=[0,2,1,3,2,4,1,2,0,1,2,3,4,2,1,0];
  function create(getContext){
    let enabled=false,next=0,step=0,layer='base';const voices=new Set();
    function stop(){for(const v of [...voices]){try{v.o.stop();}catch{}try{v.o.disconnect();v.g.disconnect();}catch{}voices.delete(v);}next=0;}
    function setEnabled(value){enabled=Boolean(value);if(!enabled)stop();}
    function note(a,midi,t,duration,type,volume){
      const o=a.createOscillator(),g=a.createGain(),voice={o,g};voices.add(voice);o.type=type;
      o.frequency.setValueAtTime(440*2**((midi-69)/12),t);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(volume*.65,t+duration*.75);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
      o.connect(g);g.connect(a.destination);o.onended=()=>{voices.delete(voice);o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.01);
    }
    function update({playing,muted,biome=0,combo=0,event=false}){
      const a=getContext();layer=event?'evento':combo>=2?'combo':'base';
      if(!enabled||!playing||muted||!a||(a.state&&a.state!=='running')){if(voices.size||next)stop();return;}
      if(!next||next<a.currentTime-.3)next=a.currentTime+.025;
      let scheduled=0;
      while(next<a.currentTime+.12&&scheduled++<3){
        const root=roots[biome]??60,n=scale[motif[step%16]];
        note(a,root+n,next,.19,'triangle',.18);
        if(step%4===0)note(a,root-24+(step%8===4?7:0),next,.38,'sine',.12);
        if(combo>=2&&step%2===0)note(a,root+n+12,next,.1,'square',.025);
        if(event&&step%2===1)note(a,root+19,next,.08,'triangle',.06);
        step++;next+=.25;
      }
    }
    return{setEnabled,stop,update,getState:()=>({enabled,layer,voices:voices.size,step})};
  }
  window.flightMusic={create};
})();
