import sys,json,os
n=sys.argv[1];s=open('engine/story_base.html').read()
a=s.index("const R1=");b=s.index("const HITS=");c=s.index("window.render=")
anchors='''const R1=T.r1a.s-.25,R1b=T.r1b.s-.15,R2=T.r2a.s-.25,R2b=P('r2a',.5),R3=T.r3a.s-.25,R3b=P('r3a',.5),END=T.end.s-.2,CTA=T.cta.s-.15,ERR=-9;
const SHOTS=[[R1,R1b,0,1.15,1.4,.5,.5,.56,.5,-.01,.01],[R1b,R2,0,1.9,1.7,.4,.6,.45,.4,.015,-.01],[R2,R2b,1,1.2,1.38,.45,.55,.55,.5,.01,-.01],[R2b,R3,1,1.75,1.55,.6,.42,.5,.46,-.02,.015],
 [R3,R3b,2,1.12,1.3,.5,.5,.55,.5,-.008,.008],[R3b,END,2,1.85,2.05,.55,.45,.48,.44,.012,-.012]];
'''
cfg=open(f'cfg_{n}.js').read().replace('CLIPN',str(len(os.listdir(f'{n}/clip'))))
out=s[:a]+cfg+anchors+s[b:c]+open('engine/tail.js').read()
out=out.replace("for(let i=0;i<3;i++){const x=W/2+(i-1)*150,on=i<=room;","for(let i=0;i<3;i++){const x=W/2+(i-1)*150,on=i<=room;",1)
out=out.replace("else if(mood=='smile'){g.arc(ex,hy+18,32,.25,Math.PI-.25);g.stroke()}","else if(mood=='smile'){g.arc(ex,hy+18,32,.25,Math.PI-.25);g.stroke()}",1)
open(f'{n}/scene.html','w').write(out.replace('__TL__',open(f'{n}/timeline.json').read()))
