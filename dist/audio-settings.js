(() => {
  'use strict';
  const key='pixel-flight-audio-v1';
  function create(storage){
    let values={music:1,effects:1};
    try{const saved=JSON.parse(storage.getItem(key));for(const channel of Object.keys(values))if(typeof saved?.[channel]==='number'&&Number.isFinite(saved[channel]))values[channel]=Math.max(0,Math.min(1,saved[channel]));}catch{}
    function set(channel,value){if(!Object.hasOwn(values,channel)||!Number.isFinite(value))return false;values[channel]=Math.max(0,Math.min(1,value));try{storage.setItem(key,JSON.stringify(values));}catch{}return true;}
    return{get:()=>({...values}),set};
  }
  window.flightAudioSettings={create};
})();