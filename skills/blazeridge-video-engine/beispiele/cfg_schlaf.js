const CFG={clipN:151,acc:['#7aa8ff','#b06aff','#ff5a7a'],tint:['90,120,255','170,80,255','255,70,110'],part:[2,2,2],clipRoom:2,endBg:'clip',
 hook:[['72 STUNDEN',150,'#fff'],['OHNE SCHLAF',104,'#ff5a7a','#ff2255']],hookFig:true,
 cards:['24 STUNDEN','48 STUNDEN','72 STUNDEN'],who:['f','f','f'],mood:['flat','flat','wow','wow','wow','flat'],armUp:false,
 stats:[{at:['r1a',.5],dur:2.0,big:'1,0 ‰',small:'WIE BETRUNKEN',col:'#7aa8ff',y:700},{at:['r1b',.12],dur:3.1,big:'SEKUNDENSCHLAF',small:'GEHIRN: KURZ AUS',col:'#fff'},
  {at:['r2a',.5],dur:2.3,big:'HALLUZINATIONEN',small:'DINGE, DIE NICHT DA SIND',col:'#b06aff',y:700},{at:['r3a',.5],dur:2.6,big:'TRAUM = REAL?',small:'GRENZE VERSCHWIMMT',col:'#ff5a7a'}],
 end:[['SCHLAF',150,'#fff'],['= GEHIRN-WÄSCHE',84,'#7aa8ff','#3c78ff']],endFig:true,
 extra(t,si,room,lt){
  if(room>=1){g.save();g.globalAlpha=room==1?.28:.38;g.drawImage(c,Math.sin(t*2.3)*26,Math.cos(t*1.7)*12);g.restore()}
  if(room==1){for(let i=0;i<3;i++){g.save();g.globalAlpha=.16+.08*Math.sin(t*2+i);fig(620+i*150+Math.sin(t*.8+i)*60,1500+i*40,.6+i*.08,{mood:'wow',look:-1,aL:2.2,aR:-2.2});g.restore()}}
  if(si==1){const lid=Math.pow(Math.max(0,Math.sin((t-R1b)*2.1+.3)),8);g.fillStyle='#000';g.fillRect(0,0,W,lid*H*.52);g.fillRect(0,H-lid*H*.52,W,lid*H*.52)}}};
