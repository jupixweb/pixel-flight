(() => {
  'use strict';
  const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stages=['amanecer','día','atardecer','noche'];
  const biomes=['bosque','montañas','ciudad','desierto','océano','espacio exterior','planeta alienígena','selva/pantano','fondo del océano'];
  const exoticPalettes=[
    [
      ['#241638','#785575','#d6b5de','#ffd7ad','#79618c','#514b76','#303455'],
      ['#102946','#38647c','#b4def0','#f9edbd','#687ea0','#475d83','#2b405f'],
      ['#28132f','#8b4967','#e5a7cd','#ffbf86','#866080','#594267','#342945'],
      ['#080d25','#211d45','#b4b6f4','#d6dbff','#45416b','#2e3354','#1c243b']
    ],
    [
      ['#70527d','#e7b19e','#e9c8dc','#fff0ad','#a390a9','#6d8290','#3d6268'],
      ['#416e85','#a6d4b7','#daecdf','#e7ffb3','#899fc4','#557e98','#305568'],
      ['#713d71','#e89579','#edb6c9','#ffd98b','#a2769c','#6c5c8d','#3c4368'],
      ['#191d3d','#4a426a','#a6adc9','#c8e9e7','#5b5985','#3e506e','#25374d']
    ],
    [
      ['#6a7771','#e2c39a','#e9d8b6','#fff0ba','#78947c','#4e7e67','#2c584b'],
      ['#418d86','#b3d69e','#d8edc3','#fff0a8','#6caa81','#428567','#235b4b'],
      ['#775977','#cf9b7c','#e4bba0','#ffdb91','#79876b','#4a715c','#2c514b'],
      ['#112d37','#31594e','#8daea4','#d7e9cf','#365e55','#244c44','#15382f']
    ],
    [
      ['#20536d','#599eaa','#b7d9cd','#f5d8b3','#4b8191','#356a7d','#224b66'],
      ['#125775','#36a4ad','#c0eee1','#c6fff0','#38869b','#2b7186','#1c506d'],
      ['#303f65','#7a829a','#d1bdcf','#edbca3','#586984','#3d5875','#293f60'],
      ['#0a1935','#183d59','#71abae','#9edfd8','#254d68','#1c3d57','#122c44']
    ]
  ];
  // Sky, horizon, clouds, sun/moon, distant layer, middle layer, near layer.
  const palettes=[['#f4b6a1','#ffe4b0','#ffe9cb','#fff4b0','#ae8eaa','#837fa0','#536a82'],['#6dcdd1','#b4e4bf','#e9f6d7','#f9eb94','#89c8ac','#62ad81','#38885e'],['#aa70a0','#ffc078','#ffd7a2','#ffdb70','#8d729a','#685d88','#45486d'],['#172340','#3f5271','#6a7e9a','#fff2c8','#3f5170','#304662','#263749']];
  let stage=0,biome=0,previousBiome=0,fade=1,skyMix=1,from=palettes[0].slice(),colors=palettes[0].slice(),clock=0,oceanStart=0,buffer;
  let exoticColors=exoticPalettes.map(p=>p[0].slice()),exoticFrom=exoticColors.map(p=>p.slice());
  const mix=(a,b,t)=>{const n=parseInt(a.slice(1),16),m=parseInt(b.slice(1),16);const c=[16,8,0].map(s=>Math.round(((n>>s)&255)*(1-t)+((m>>s)&255)*t));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');};
  function reset(){stage=0;biome=previousBiome=0;fade=skyMix=1;clock=oceanStart=0;colors=palettes[0].slice();from=colors.slice();exoticColors=exoticPalettes.map(p=>p[0].slice());exoticFrom=exoticColors.map(p=>p.slice());}
  function advance(points){if(points%10===0){from=colors.slice();exoticFrom=exoticColors.map(p=>p.slice());stage=Math.floor(points/10)%4;skyMix=0;}if(points%20===0){previousBiome=biome;const options=biomes.map((_,i)=>i).filter(i=>i!==biome&&(points>=40||i<5));biome=options[Math.floor(Math.random()*options.length)];if(biome===8)oceanStart=clock;fade=0;}}
  function update(dt){clock+=dt;skyMix=Math.min(1,skyMix+dt/2.5);fade=Math.min(1,fade+dt/1.4);colors=from.map((c,i)=>mix(c,palettes[stage][i],skyMix));exoticColors=exoticFrom.map((p,b)=>p.map((c,i)=>mix(c,exoticPalettes[b][stage][i],skyMix)));}
  function render(c,w,h,travel,kind){
    const palette=kind<5?colors:exoticColors[kind-5];
    const ground=h-28, horizon=ground-38;
    const r=(x,y,ww,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh));};
    const far=palette[4],mid=palette[5],near=palette[6];
    r(0,0,w,h,palette[0]);for(let y=0;y<ground;y+=8)r(0,y,w,8,mix(palette[0],palette[1],y/ground));
    const nightAlpha=stage===3?skyMix:(stages[(stage+3)%4]==='noche'?1-skyMix:0);
    if(nightAlpha>0&&kind!==8||kind===5){c.save();c.globalAlpha=kind===5?.3+.6*nightAlpha:nightAlpha;for(let i=0;i<38;i++){const x=(i*71+19)%w,y=12+(i*31)%Math.floor(ground*.57);r(x,y,2,i%6===0?3:2,'#ecf6ff');if(i%6===0)r(x-1,y+1,4,1,'#ecf6ff');}c.restore();}
    const celestialY=stage===0||stage===2?ground*.4:29;const sunX=w*.82;
    if(kind<5||kind===7){if(stage===3){r(sunX,celestialY,25,25,palette[3]);r(sunX-4,celestialY+5,33,15,palette[3]);r(sunX-4,celestialY-1,17,16,palette[0]);r(sunX+14,celestialY+14,3,3,'#d6dab5');}else{const sunRows=[15,21,27,27,33,33,33,27,27,21,15];sunRows.forEach((width,i)=>r(sunX+(25-width)/2,celestialY-4+i*3,width,3,palette[3]));r(sunX+4,celestialY+2,9,3,'#fff7d5');}
    for(let i=0;i<5;i++){const x=((i*139+19-travel*.10)%(w+100)+w+100)%(w+100)-70,y=25+(i%3)*21,s=i%2?.8:1.1;r(x+8*s,y,23*s,7*s,palette[2]);r(x,y+7*s,46*s,12*s,palette[2]);r(x-8*s,y+13*s,62*s,8*s,palette[2]);r(x-3*s,y+21*s,53*s,3*s,mix(palette[2],palette[1],.35));}}
    const peak=(x,base,width,height,color,snow=false)=>{for(let y=0;y<height;y+=5){const span=width*y/height;r(x+(width-span)/2,base-height+y,span,6,snow&&y<height*.19?'#e1e9da':color);}};
    const tree=(x,y,size,a,b)=>{r(x+size*.45,y+size*.35,size*.13,size*.7,near);r(x+size*.2,y,size*.6,size*.16,a);r(x+size*.08,y+size*.15,size*.85,size*.2,a);r(x,y+size*.33,size,size*.25,a);r(x+size*.08,y+size*.56,size*.85,size*.16,b);r(x+size*.15,y+size*.2,size*.25,size*.07,b);};
    const dunes=(step,base,height,speed,color)=>{for(let i=-1;i<w/step+1;i++){const x=i*step-travel*speed%step;for(let y=0;y<height;y+=4){const width=step*(.3+.7*y/height);r(x+(step-width)/2,base-height+y,width,5,color);}}};
    if(kind===0){for(let i=-1;i<w/83+1;i++)tree(i*83-travel*.16%83,ground-103-(Math.abs(i)%3)*5,76,far,mix(far,mid,.2));for(let i=-1;i<w/61+1;i++)tree(i*61-travel*.28%61,ground-68-(i%3)*10,56+(i%2)*10,mid,mix(mid,far,.25));r(0,ground-30,w,30,mid);r(0,ground-15,w,15,mix(mid,near,.5));for(let i=-1;i<w/41+1;i++){const x=i*41-travel*.48%41;tree(x,ground-37+(i%3)*6,35,near,mix(near,mid,.25));r(x+5,ground-8,3,5,'#a7d787');if(i%3===0){r(x+7,ground-11,4,4,'#fff4a9');r(x+8,ground-10,2,2,'#eba449');}}}
    if(kind===1){for(let i=-1;i<w/140+1;i++)peak(i*140-travel*.12%140,ground-23,190,115+(Math.abs(i)%3)*17,far,true);for(let i=-1;i<w/95+1;i++){const x=i*95-travel*.25%95;peak(x,ground-8,130,71+(Math.abs(i)%2)*29,mid);peak(x+14,ground-8,72,58,mix(mid,near,.25));}r(0,ground-15,w,15,near);for(let i=-1;i<w/35+1;i++)tree(i*35-travel*.48%35,ground-25,23,near,mix(near,mid,.4));}
    if(kind===2){for(let layer=0;layer<2;layer++){const step=layer?47:38,base=ground-(layer?7:20),speed=layer?.32:.16,col=layer?mid:far;for(let i=-1;i<w/step+1;i++){const x=i*step-travel*speed%step,height=35+(Math.abs(i*17+layer*31)%65);r(x,base-height,step-5,height,col);r(x+5,base-height-4,step-15,5,col);if(i%4===0)r(x+step/2,base-height-17,2,14,col);for(let yy=base-height+8;yy<base-5;yy+=10)for(let xx=x+5;xx<x+step-10;xx+=9)if((i+yy+xx)%3>0)r(xx,yy,3,4,stage===3?'#ffd985':mix(col,palette[1],.35));}}r(0,ground-8,w,8,near);for(let i=-1;i<w/80+1;i++){const x=i*80-travel*.5%80;r(x,ground-27,2,27,near);r(x,ground-27,9,2,near);r(x+6,ground-25,4,3,'#ffe7a0');}}
    if(kind===3){const sand=mix(palette[1],'#e7b56d',.55),rock=mix(far,'#b97e62',.5);for(let i=-1;i<w/140+1;i++){const x=i*140-travel*.13%140;r(x+20,horizon-43,63,12,rock);r(x+10,horizon-31,83,28,rock);r(x,horizon-3,115,36,rock);}dunes(115,ground-8,48,.24,mix(sand,far,.25));dunes(92,ground,25,.45,sand);for(let i=-1;i<w/93+1;i++){const x=i*93-travel*.5%93,y=ground-32;r(x,y,7,32,near);r(x-9,y+12,9,5,near);r(x-9,y+5,5,12,near);r(x+7,y+18,12,5,near);r(x+15,y+9,4,13,near);r(x+2,y+3,1,24,mid);}}
    if(kind===4){const water=mix(palette[0],'#237bac',.5);r(0,horizon-11,w,ground-horizon+11,water);for(let y=horizon-8;y<ground;y+=8){const speed=.15+(y-horizon)*.006;for(let i=-1;i<w/60+1;i++){const x=i*60-travel*speed%60;r(x,y,25+(i%2)*8,2,mix(water,palette[2],.38));}}for(let i=-1;i<w/155+1;i++){const x=i*155-travel*.15%155;peak(x,horizon,47,16,far);r(x-4,horizon,53,3,mix(palette[1],'#e5c586',.5));}const boatX=((w+85-travel*.2)%(w+100)+w+100)%(w+100)-50;r(boatX,ground-25,30,4,near);r(boatX+4,ground-21,22,3,near);r(boatX+14,ground-51,2,26,near);for(let y=0;y<22;y+=3)r(boatX+17,ground-48+y,3+y*.55,3,palette[2]);}

    const disk=(x,y,radius,color)=>{for(let yy=-radius;yy<=radius;yy+=3){const half=Math.sqrt(Math.max(0,radius*radius-yy*yy));r(x-half,y+yy,half*2,3,color);}};
    const wrap=(x,span)=>((x%span)+span)%span;
    if(kind===5){
      c.save();c.globalAlpha=.4+.6*nightAlpha;
      for(let i=0;i<58;i++){const x=wrap(i*83+17-travel*.035,w+12)-6,y=8+(i*47)%Math.floor(ground*.85);r(x,y,i%9===0?3:1,i%9===0?3:1,i%3?'#d5d5f1':'#9be1e5');}
      c.restore();
      const px=w*.76,py=ground*.25;
      for(let i=-57;i<=57;i+=4)r(px+i,py+i*.24,7,3,mix(far,palette[3],.25));
      disk(px,py,31,mix(far,'#7d77ad',.45));
      for(let yy=-21;yy<24;yy+=9){const half=Math.sqrt(31*31-yy*yy);r(px-half,py+yy,half*2,4,yy<0?mix(far,palette[3],.45):mix(far,near,.35));}
      for(let i=-57;i<16;i+=4)r(px+i,py+i*.24+3,7,3,mix(far,palette[3],.6));
      disk(w*.25,ground*.17,10,'#a8c2ca');r(w*.25-5,ground*.17-3,5,3,'#617c9b');
      for(let layer=0;layer<2;layer++)for(let i=-1;i<w/100+1;i++){const x=i*100-travel*(layer?.3:.13)%100;peak(x,ground-(layer?0:18),130,25+(Math.abs(i)%3)*12,layer?mid:far);r(x+35,ground-(layer?12:31),15,3,layer?near:mid);}
      for(let i=-1;i<w/42+1;i++){const x=i*42-travel*.48%42;r(x,ground-5,16,4,near);r(x+4,ground-8,8,3,mid);}
    }
    if(kind===6){
      const orbY=stage===0||stage===2?ground*.29:35;
      disk(w*.8,orbY,18,palette[3]);r(w*.8-10,orbY-6,9,4,mix(palette[3],far,.45));disk(w*.66,orbY-12,9,mix(palette[3],'#eeadce',.5));
      for(let i=-1;i<w/95+1;i++){const x=i*95-travel*.12%95;peak(x,ground-18,110,75+(Math.abs(i)%3)*14,far);peak(x+40,ground-12,60,56,mid);}
      for(let layer=0;layer<2;layer++)for(let i=-1;i<w/76+1;i++){
        const x=i*76-travel*(layer?.38:.22)%76,y=ground-(layer?4:19),size=layer?30:43,col=layer?near:mid,glow=layer?'#9ee6bc':'#adb5d9';
        r(x+15,y-size,6,size,col);r(x+12,y-size,3,size,glow);
        r(x-2,y-size-6,38,6,col);r(x+3,y-size-12,28,6,col);r(x+10,y-size-16,14,4,glow);
        r(x+4,y-size-4,6,2,glow);r(x+25,y-size-5,4,3,'#e8a4d5');
      }
      for(let i=-1;i<w/45+1;i++){const x=i*45-travel*.5%45;r(x,ground-12,4,12,near);r(x-4,ground-16,12,5,'#83c8ae');r(x+2,ground-23,3,8,'#abebc9');}
    }
    if(kind===7){
      for(let layer=0;layer<2;layer++)for(let i=-1;i<w/83+1;i++){
        const x=i*83-travel*(layer?.27:.13)%83,y=ground-79-(Math.abs(i)%3)*12,col=layer?mid:far;
        r(x+18,y,9,ground-y,col);disk(x+22,y,32,col);disk(x-3,y+10,23,col);disk(x+46,y+12,25,col);
        for(let j=0;j<3;j++){r(x+j*19,y+15,2,18+j*9,mix(col,near,.4));r(x+j*19-2,y+31+j*9,5,3,col);}
      }
      r(0,ground-22,w,22,mix(mid,near,.5));for(let i=-1;i<w/44+1;i++){const x=i*44-travel*.35%44;r(x,ground-17+(i%2)*7,23,2,mix(mid,palette[2],.25));}
      for(let i=-1;i<w/64+1;i++){const x=i*64-travel*.48%64;r(x+7,ground-43,5,43,near);for(let j=0;j<4;j++){r(x-6+j*5,ground-40+j*6,16,3,near);r(x+10,ground-37+j*7,15-j*2,3,near);}r(x+32,ground-6,16,3,'#6f9a67');r(x+35,ground-9,10,3,'#81ad73');}
      c.save();c.globalAlpha=.13;for(let i=0;i<3;i++)r(w*.1+i*w*.35,ground-55+i*12,w*.36,6,'#d2e3b2');c.restore();
    }
    if(kind===8){
      c.save();c.globalAlpha=.14*(1-nightAlpha)+.025*nightAlpha;for(let i=0;i<3;i++)for(let y=0;y<ground;y+=8)r(w*(.13+i*.33)-y*.12,y,8+y*.11,8,palette[3]);c.restore();
      // The whale always faces left; wrap only after its entire silhouette exits.
      // A biome-local clock keeps it visible on arrival, even late in a run.
      const swim=reduced?0:clock-oceanStart,cx=wrap(w*.53+160-swim*5,w+320)-160,cy=ground*.54+Math.sin(swim*.45)*4;
      const body=mix(far,near,.45),belly=mix(body,palette[2],.27),highlight=mix(body,palette[2],.18),fin=mix(body,near,.45);
      const beat=Math.sin(swim*1.1),tailY=cy+beat*6;
      // Tapered tail stock and broad, gently beating flukes.
      for(let i=0;i<12;i++){const y=cy+beat*i*.5;r(cx+48+i*7,y-14+i*.8,11,28-i*2,body);}
      for(let i=0;i<8;i++){
        r(cx+123+i*2,tailY-4-i*3,18-i*2,5,body);
        r(cx+123+i*2,tailY+i*3,18-i*2,5,body);
      }
      // Broad rounded head, arched back and pale throat: no serpent neck.
      for(let y=-33;y<=33;y+=3){const curve=Math.sqrt(Math.max(0,1-y*y/(34*34)));r(cx-96*curve,cy+y,171*curve,3,y>12?belly:body);}
      r(cx-57,cy-27,56,3,highlight);r(cx-74,cy-23,15,3,highlight);
      for(let i=0;i<5;i++)r(cx+31+i*3,cy-31-i*2,15-i*2,4,body);
      r(cx-91,cy+10,50,2,fin);r(cx-87,cy+13,31,2,fin);
      // Short throat pleats and a swept pectoral flipper.
      for(let i=0;i<5;i++)r(cx-63+i*10,cy+20,2,6+(i%2)*3,highlight);
      for(let i=0;i<9;i++)r(cx-18+i*4,cy+15+i*3+beat*2,23-i*2,4,fin);
      r(cx-66,cy+1,4,3,'#9bc3c6');r(cx-66,cy+2,2,2,near);
      for(let i=-1;i<w/71+1;i++){const x=i*71-travel*.3%71;for(let j=0;j<3;j++){const y=ground-18-j*8;r(x+j*6,y,3,ground-y,mid);r(x+j*6-4,y+5,7,3,mid);}}
      for(let i=-1;i<w/61+1;i++){
        const x=i*61-travel*.48%61,col=i%2?'#a56b9e':'#c88991';r(x+9,ground-25,5,25,col);r(x,ground-19,12,4,col);r(x,ground-27,4,11,col);r(x+13,ground-14,13,4,col);r(x+22,ground-23,4,13,col);r(x+9,ground-29,5,4,'#ddadbb');
        r(x+35,ground-9,14,9,near);r(x+38,ground-13,8,5,mid);
      }
      for(let i=0;i<12;i++){const x=wrap(i*47+18-travel*.11,w),y=ground-wrap(i*29+(reduced?0:clock*5),ground-12);r(x,y,4,1,'#76bbc0');r(x-1,y+1,1,3,'#76bbc0');r(x+4,y+1,1,3,'#76bbc0');r(x,y+4,4,1,'#76bbc0');r(x+1,y+1,1,1,'#b4e3d9');}
      for(let i=0;i<6;i++){const x=wrap(w+i*83-travel*.08,w+30)-15,y=38+(i*41)%Math.floor(ground*.62),col=i%2?'#78acb2':'#b1bc9c';r(x,y,9,4,col);r(x+2,y-1,5,6,col);r(x+9,y-1,3,6,col);r(x+1,y,1,1,near);}
    }
    const beach=kind===3||kind===4,top=beach?mix(palette[1],'#e9ce91',.65):mix(palette[1],'#a8c76b',.45),soil=beach?'#d7bb87':'#d7c697';const surface=kind===5?'#77799c':kind===6?'#738b9a':kind===7?'#5a8861':kind===8?'#619195':top,subsoil=kind===5?'#42435f':kind===6?'#465a70':kind===7?'#365847':kind===8?'#355b70':soil;r(0,ground,w,5,surface);r(0,ground+5,w,5,mix(surface,near,.3));r(0,ground+10,w,3,near);r(0,ground+13,w,15,subsoil);for(let i=-1;i<w/12+1;i++){const x=i*12-travel%12;r(x,ground+2,6,2,mix(surface,'#ffffff',.3));r(x+2,ground+16,3,3,kind<5?'#b8a477':mix(subsoil,mid,.4));r(x+7,ground+23,3,2,kind<5?'#b8a477':mix(subsoil,mid,.4));}
  }
  function draw(c,w,h,travel){if(fade>=1||!document.createElement){render(c,w,h,travel,biome);return;}if(!buffer)buffer=document.createElement('canvas');if(buffer.width!==w||buffer.height!==h){buffer.width=w;buffer.height=h;}const b=buffer.getContext('2d');b.imageSmoothingEnabled=false;render(c,w,h,travel,previousBiome);render(b,w,h,travel,biome);c.save();c.globalAlpha=fade;c.drawImage(buffer,0,0);c.restore();}
  function snapshot(){return {stage,biome,previousBiome,fade,skyMix,from:from.slice(),colors:colors.slice(),clock,oceanStart,exoticColors:exoticColors.map(p=>p.slice()),exoticFrom:exoticFrom.map(p=>p.slice())};}
  function restore(s){stage=s.stage;biome=s.biome;previousBiome=s.previousBiome;fade=s.fade;skyMix=s.skyMix;from=s.from.slice();colors=s.colors.slice();clock=s.clock;oceanStart=s.oceanStart;exoticColors=s.exoticColors.map(p=>p.slice());exoticFrom=s.exoticFrom.map(p=>p.slice());}
  window.flightWorld={reset,advance,update,draw,snapshot,restore,getState:()=>({moment:stages[stage],background:biomes[biome],transition:fade})};
})();
