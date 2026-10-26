(() => {
  'use strict';
  function draw(ctx,p,tier,time=0){
    const y=p.y+Math.sin(time*4+(p.phase||0))*3,x=p.x;
    const r=(xx,yy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x+xx),Math.round(y+yy),w,h);};
    ctx.save();
    if(p.kind==='life'){
      // Pixel heart with two rounded lobes, a tapered point and a small glint.
      const rows=[[-5,-7,4],[1,-7,4],[-7,-5,14],[-7,-3,14],[-5,-1,10],[-3,1,6],[-1,3,2]];
      for(const [xx,yy,w] of rows)r(xx-1,yy-1,w+2,4,'#653047');
      for(const [xx,yy,w] of rows)r(xx,yy,w,2,yy<0?'#ff7396':'#e44879');
      r(-4,-5,3,1,'#fff1d7');r(-5,-4,1,2,'#ffc0c6');
      r(9,-6,3,1,'#ffe8a0');r(10,-7,1,3,'#ffe8a0');
    }else if(p.kind==='slow'){
      // Two tapered glass bulbs and a narrow waist give a clear hourglass silhouette.
      for(let i=0;i<5;i++){
        const width=14-i*2,yy=-11+i*2;
        r(-width/2,yy,width,2,tier.rim);r(-width/2+2,yy,width-4,2,tier.face);
        r(-width/2,-yy-2,width,2,tier.rim);r(-width/2+2,-yy-2,width-4,2,tier.face);
      }
      r(-2,-2,4,4,tier.color);r(-1,-2,2,6,tier.sand);
      r(-4,-9,8,2,tier.sand);r(-3,-7,6,2,tier.sand);r(-2,-5,4,2,tier.sand);
      r(-2,6,4,2,tier.sand);r(-4,8,8,2,tier.sand);
      r(-5,-10,1,3,tier.light);r(-3,-6,1,2,tier.light);r(-5,7,1,2,tier.light);
      r(-9,-14,18,3,tier.rim);r(-7,-13,14,1,tier.color);r(-9,11,18,3,tier.rim);r(-7,11,14,1,tier.color);
      if(tier.id!=='basic'){r(-13,-5,3,1,tier.light);r(-12,-6,1,3,tier.light);r(11,3,3,1,tier.color);r(12,2,1,3,tier.color);}
      if(tier.id==='legendary'){r(10,-11,3,1,tier.light);r(11,-12,1,3,tier.light);r(-12,10,3,1,tier.light);}
    }else if(p.kind==='capacity'){
      r(-11,-10,22,22,'#254c52');r(-9,-8,18,18,'#8fdcbb');r(-8,-6,16,14,'#284b53');
      r(-12,-12,24,4,'#ffe18a');r(-9,-11,18,1,'#fff4c3');r(-10,9,20,3,'#e7c77b');
      for(let row=0;row<2;row++)for(let col=0;col<3;col++){const xx=-7+col*5,yy=-4+row*6;r(xx,yy,4,4,'#d6a8ed');r(xx+1,yy-1,2,1,'#ffe18a');r(xx+1,yy,1,1,'#f2deff');}
      r(-1,-17,2,7,'#c1ffe1');r(-3,-15,6,2,'#c1ffe1');
    }else{
      r(-7,-7,14,14,'#493658');r(-9,-4,18,8,'#493658');r(-5,-5,10,10,'#a267d5');r(-5,-5,5,3,'#e4adff');r(-2,-10,6,4,'#392d45');r(3,-13,5,4,'#ffd557');r(7,-16,3,3,'#fff4bc');r(10,-13,3,3,'#ff874b');
    }
    ctx.restore();
  }
  window.flightPowerupArt={draw};
})();
