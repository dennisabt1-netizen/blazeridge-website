import sys,re
n,bpm=sys.argv[1],sys.argv[2];dings=sys.argv[3:]
m=open('engine/mix_base.py').read();i=m.find('P=lambda');j=m.find('mix=voice')
sfx='''P=lambda k,fr:T[k]['s']+T[k]['d']*fr
R1=T['r1a']['s']-.25;R1b=T['r1b']['s']-.15;R2=T['r2a']['s']-.25;R2b=P('r2a',.5);R3=T['r3a']['s']-.25;R3b=P('r3a',.5);END=T['end']['s']-.2;CTA=T['cta']['s']-.15
for a in [R1,R2,R3,END]:whoosh(a);hit(a)
hit(0,90);hit(.2,90)
for a in [R1b,R2b,R3b]:hit(a,60)
for d in DINGS:
    k,f=d.split(':');ding(P(k,float(f)))
ding(CTA)
i0=int(END*sr);mm=int(3*sr);u=np.arange(mm)/sr;mm=min(mm,n-i0);sfx[i0:i0+mm]+=(sum(np.sin(2*np.pi*f*u) for f in [261.6,329.6,392,523.3])*.05*np.sin(np.pi*u/3))[:mm]
'''.replace('DINGS',repr(dings))
src=m[:i]+sfx+m[j:]
src=src.replace("bpm=100","bpm="+bpm).replace("'timeline.json'",f"'{n}/timeline.json'").replace('f"vo/{x[\'k\']}.wav"',f'f"{n}/vo/'+"{x['k']}.wav\"").replace("'audio.wav'",f"'{n}/audio.wav'")
exec(compile(src,'mix','exec'))
