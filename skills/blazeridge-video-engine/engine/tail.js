const CLIP=[];for(let i=1;i<=CFG.clipN;i++){const m=new Image();m.src='clip/c_'+String(i).padStart(3,'0')+'.jpg';CLIP.push(m)}
window.ready=Promise.all([...imgs,...CLIP].map(m=>m.decode()));
CFG.acc.forEach((c,i)=>ACC[i]=c);
function drawClip(tt,z=1.06,sx=0,sy=0){const n=CLIP.length;let i=Math.max(0,Math.floor(tt*30));const m=i%(2*n-2);i=m<n?m:2*n-2-m;const im=CLIP[i];const sc=Math.max(W/im.width,H/im.height)*z;
 g.drawImage(im,W/2-im.width*sc/2+sx,H/2-im.height*sc/2+sy,im.width*sc,im.height*sc)}
function lines(arr,t,t0,y0){let y=y0;arr.forEach((l,i)=>{const a=t0+i*.3,p=back(pr(t,a,a+.32));if(p>0){g.font=`900 ${l[1]}px ${FONT}`;const fit=Math.min(1,960/g.measureText(l[0]).width);
  txt(l[0],W/2,y,l[1]*fit,l[2],{sc:p,stroke:l[1]>100?26:20,glow:l[3]||null})}y+=l[1]*.95+26})}
function doStats(t){for(const s of CFG.stats){const t0=P(s.at[0],s.at[1]);const big=typeof s.big=='function'?s.big(t,t0):s.big;stat(t,t0,s.dur,big,s.small,s.col,790)}}
window.render=function(t){g.setTransform(1,0,0,1,0,0);g.filter='none';g.globalAlpha=1;g.fillStyle='#05060c';g.fillRect(0,0,W,H);const[sx,sy]=shake(t);
 if(t<R1){drawClip(t,1.08+.02*t,sx,sy);g.fillStyle='rgba(0,0,8,.28)';g.fillRect(0,0,W,H);vignette();
  lines(CFG.hook,t,.12,430);if(CFG.hookFig)fig(W/2+sx,1760,.85*back(pr(t,.2,.6)),{mood:'wow',aR:-2.4,aL:2.4,bob:Math.sin(t*6)*5});
  if(CFG.hookNova)nova(W/2+sx,1480,1.15*back(pr(t,.2,.6)),t,{mood:'think'});
  if(CFG.hookExtra)CFG.hookExtra(t);hud(-1);captions(t);flash(t,0,.25);speed(t,R1,ACC[0]);return}
 if(t>=END){const cta=t>=CTA;if(CFG.endBg=='clip')drawClip((t-END)*.6,1.1,sx,sy);else drawBG(CFG.endBg,1.15+.06*pr(t,END,TOTAL),.5,.5,0,sx,sy);
  if(CFG.endSun)sun(t,W*.7,520,.8);particles(CFG.part[2],t,0);g.fillStyle='rgba(0,0,8,.2)';g.fillRect(0,0,W,H);vignette();
  if(CFG.endFig)fig((CFG.endNova?340:W/2)+sx,1760,.82,{aR:cta?-2.4+Math.sin(t*14)*.3:-.3,aL:.35,look:CFG.endNova?1:0,mood:'smile',bob:Math.sin(t*3)*3});
  if(CFG.endNova)nova((CFG.endFig?720:W/2)+sx,1400,CFG.endFig?.75:1.2,t,{mood:'happy',look:CFG.endFig?-1:0});
  if(!cta){lines(CFG.end,t,END+.1,430);if(CFG.endExtra)CFG.endExtra(t)}
  else{txt('FOLGEN',W/2,400,150,'#ffe23a',{sc:back(pr(t,CTA,CTA+.35))*(1+.04*Math.sin(t*14)),stroke:26});txt('FÜR MEHR →',W/2,540,90,'#fff',{sc:back(pr(t,CTA+.2,CTA+.55)),stroke:20})}
  hud(2);captions(t);flash(t,END,.3);flash(t,TOTAL-.18,.18);return}
 const si=SHOTS.findIndex(s=>t>=s[0]&&t<s[1]),s=SHOTS[si<0?5:si],room=s[2],u=io(pr(t,s[0],s[1])),close=si%2==1,lt=t-s[0];
 let z=lerp(s[3],s[4],u),roll=lerp(s[9],s[10],u);const fx=lerp(s[5],s[6],u);
 if(CFG.wobble&&room==2){z=Math.max(z,1.55);roll+=.1*Math.sin(t*1.6)}
 if(CFG.clipRoom==room&&close)drawClip(lt,1.1+.04*u,sx,sy);else drawBG(room,z,fx,lerp(s[7],s[8],u),roll,sx,sy);
 if(CFG.sun&&CFG.sun[room])sun(t,W*.7,480,.7);particles(CFG.part[room],t,(fx-.5)*-900);
 g.fillStyle=`rgba(${CFG.tint[room]},${.05+.03*Math.sin(t*5)})`;g.fillRect(0,0,W,H);vignette();
 const who=CFG.who[room],md=CFG.mood[si]||'smile';
 if(who.includes('f')){if(!close){const wp=out(pr(lt,0,1.3)),x=lerp(-180,who.includes('n')?300:340,wp);fig(x+sx,1710+sy,.82,{walk:wp<1?t*12:0,aR:wp<1?-.35:(CFG.armUp?-2.3:-.3),look:1,mood:lt>1.2?md:'smile',bob:Math.sin(t*5)*4})}
  else{const pp=back(pr(lt,0,.4));fig(lerp(-300,250,pp)+sx,2190+sy,1.7,{aR:-2.5+Math.sin(t*4)*.12,aL:.3,look:1,mood:md,bob:Math.sin(t*5)*5})}}
 if(who.includes('n')){const only=!who.includes('f');if(only)nova(W/2+sx,(close?1500:1430)+sy,close?2.0:1.15*back(pr(lt,0,.5)),t,{mood:CFG.novaMood[si]||'happy'});
  else nova((close?800:700)+sx,(close?1250:1360)+sy,close?.9:.72,t,{mood:CFG.novaMood[si]||'happy',look:-1})}
 if(CFG.extra)CFG.extra(t,si,room,lt);
 hud(room);card(t,[R1,R2,R3][room]+.15,room+1,CFG.cards[room],ACC[room]);doStats(t);captions(t);if(CFG.scan&&CFG.scan[room])scanlines(.12);
 for(const[tt,col]of[[R1,ACC[0]],[R2,ACC[1]],[R3,ACC[2]],[END,'#fff']]){speed(t,tt,col);flash(t,tt,.3)}for(const tt of[R1b,R2b,R3b])flash(t,tt,.14)};
</script></body></html>
