const CFG={clipN:CLIPN,acc:['#8fd0ff','#9a8cff','#ffb23c'],tint:['90,170,255','90,80,220','255,170,60'],part:[2,2,2],clipRoom:0,endBg:0,wobble:true,
 hook:[['KEIN MOND',150,'#fff'],['MEHR?',150,'#ffe23a']],hookFig:true,
 cards:['DIE MEERE','DIE NÄCHTE','DIE ERDACHSE'],who:['f','f',''],mood:['wow','wow','wow','flat'],armUp:true,
 stats:[{at:['r1a',.5],dur:1.9,big:'NUR NOCH ⅓',small:'EBBE UND FLUT',col:'#8fd0ff',y:700},{at:['r1b',.1],dur:1.9,big:'NUR DIE SONNE',small:'ZIEHT NOCH AM WASSER',col:'#ffb23c'},
  {at:['r2a',.4],dur:2.4,big:'STOCKDUNKEL',small:'JEDE EINZELNE NACHT',col:'#9a8cff',y:700},{at:['r3a',.3],dur:1.9,big:'ACHSE TAUMELT',small:'ÜBER MILLIONEN JAHRE',col:'#ffb23c',y:420},{at:['r3a',.72],dur:1.5,big:'KLIMA-CHAOS',small:'',col:'#ff5a4a',y:440}],
 end:[['DER MOND',130,'#fff'],['HÄLT UNS IM',78,'#8fd0ff'],['GLEICHGEWICHT',92,'#ffe23a']],endFig:true,
 extra(t,si,room,lt){if(room==1){g.fillStyle=`rgba(0,0,6,${.3*pr(t,R2,R2+2)})`;g.fillRect(0,0,W,H)}
  if(room==2){g.save();g.translate(W/2,H*.44);g.rotate(.41+.1*Math.sin(t*1.6));g.strokeStyle='rgba(255,226,58,.9)';g.lineWidth=8;g.setLineDash([26,18]);g.beginPath();g.moveTo(0,-640);g.lineTo(0,640);g.stroke();g.restore()}}};
