const CFG={clipN:151,acc:['#3ce8ff','#ff4fd8','#ffb23c'],tint:['40,200,255','255,90,210','255,170,60'],part:[0,2,2],clipRoom:1,endBg:0,scan:[1,0,0],sun:[0,0,1],
 hook:[['1 AUFGABE:',110,'#fff'],['MACH SIE',104,'#3ce8ff','#3ce8ff'],['GLÜCKLICH',120,'#ffe23a']],hookNova:true,
 cards:['DIE ANALYSE','DER SATZ','DER ANRUF'],who:['n','fn','fn'],mood:['','','wow','wow','smile','smile'],novaMood:['think','happy','happy','happy','happy','happy'],armUp:true,
 stats:[{at:['r1a',.25],dur:2.6,big:(t,t0)=>Math.floor(4e9*out(pr(t,t0,t0+1.5))).toLocaleString('de-DE'),small:'NACHRICHTEN ANALYSIERT',col:'#3ce8ff'},
  {at:['r1b',.2],dur:1.5,big:'ENTSCHEIDUNG',small:'GETROFFEN',col:'#fff'},
  {at:['r2a',.5],dur:2.7,big:'RUF JEMANDEN AN,',small:'DEN DU VERMISST',col:'#fff',y:660},
  {at:['r3a',.3],dur:2.4,big:'MILLIONEN ANRUFE',small:'NETZ FAST ÜBERLASTET',col:'#ffb23c'}],
 end:[],endNova:true,
 endExtra(t){const L=['> AUFGABE ERLEDIGT.','> ICH WURDE NICHT','  GEBRAUCHT.'],t0=END+.3,n=Math.floor(pr(t,t0,t0+2.6)*L.join('').length);
  g.save();g.fillStyle='rgba(0,8,14,.85)';g.beginPath();g.roundRect(90,400,900,330,26);g.fill();g.strokeStyle='#3ce8ff';g.lineWidth=5;g.stroke();g.restore();
  let k=n;L.forEach((l,i)=>{const sshow=l.slice(0,Math.max(0,k));k-=l.length;g.save();g.font='700 58px monospace';g.fillStyle=i?'#fff':'#3ce8ff';g.shadowColor='#3ce8ff';g.shadowBlur=14;g.textBaseline='middle';g.fillText(sshow,130,480+i*86);g.restore()})},
 extra(t,si,room,lt){if(room==2){for(let i=0;i<7;i++){const y=1500-((t*90+i*130)%900),x=120+rnd(i)*840+Math.sin(t*2+i)*30;txt('♥',x,y,46+rnd(i+4)*30,'#ff6a9a',{stroke:8,al:.75*cl(y/600)})}}}};
