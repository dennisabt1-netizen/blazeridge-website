import numpy as np,json,wave,subprocess
sr=44100;D=json.load(open('timeline.json'));tl=D['tl'];T={x['k']:x for x in tl};tot=D['total'];n=int(sr*tot);t=np.arange(n)/sr
def rd(f):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','1','-ar',str(sr),'-']),np.float32)
voice=np.zeros(n)
for x in tl:
    a=rd(f"vo/{x['k']}.wav");i=int(x['s']*sr);voice[i:i+len(a)]+=a[:n-i]
bpm=100;beat=60/bpm;bar=beat*4;ch=[[110,130.81,164.81],[87.31,130.81,174.61],[130.81,164.81,196],[98,146.83,196]]
mus=np.zeros(n);np.random.seed(1)
for b in range(int(tot/bar)+1):
    i0=int(b*bar*sr);i1=min(n,int((b+1)*bar*sr));tt=t[i0:i1]-b*bar;c=ch[b%4]
    pad=sum(np.sin(2*np.pi*f*tt)*.5+np.sin(2*np.pi*f*2.005*tt)*.2 for f in c)/3
    mus[i0:i1]+=pad*np.minimum(1,tt/.15)*np.minimum(1,(bar-tt)/.15)*.22
    for k in range(8):
        f=c[k%3]*4;j0=i0+int(k*beat/2*sr);j1=min(n,j0+int(.22*sr))
        if j0>=n:break
        u=t[j0:j1]-t[j0];mus[j0:j1]+=np.sin(2*np.pi*f*u)*np.exp(-u*14)*.10
    for k in range(4):
        j0=i0+int(k*beat*sr);j1=min(n,j0+int(.25*sr))
        if j0>=n:break
        u=t[j0:j1]-t[j0];mus[j0:j1]+=np.sin(2*np.pi*(45+90*np.exp(-u*30))*u)*np.exp(-u*12)*.5
        h0=j0+int(beat/2*sr);h1=min(n,h0+int(.05*sr))
        if h0<n:mus[h0:h1]+=np.random.randn(h1-h0)*np.exp(-np.arange(h1-h0)/sr*90)*.06
env=np.abs(voice);k=int(.12*sr);env=np.convolve(env,np.ones(k)/k,'same');mus*=1-.6*np.minimum(1,env*12)
sfx=np.zeros(n)
def whoosh(at,d=.55):
    i0=max(0,int((at-d*.6)*sr));m=min(int(d*sr),n-i0);u=np.arange(m)/sr
    x=np.convolve(np.random.randn(m),np.ones(40)/40,'same')*4;sfx[i0:i0+m]+=x*np.sin(np.pi*u/d)**2*.5
def hit(at,f=70):
    i0=int(at*sr);m=min(int(.5*sr),n-i0);u=np.arange(m)/sr;sfx[i0:i0+m]+=np.sin(2*np.pi*(f+120*np.exp(-u*25))*u)*np.exp(-u*7)*.6
def ding(at,f=1320):
    i0=int(at*sr);m=min(int(.6*sr),n-i0);u=np.arange(m)/sr;sfx[i0:i0+m]+=(np.sin(2*np.pi*f*u)+.5*np.sin(2*np.pi*f*1.5*u))*np.exp(-u*6)*.14
P=lambda k,fr:T[k]['s']+T[k]['d']*fr
R1=T['r1a']['s']-.25;R2=T['r2a']['s']-.25;R3=T['r3a']['s']-.25;END=T['end']['s']-.2;CTA=T['cta']['s']-.15
for a in [R1,R2,R3,END]:whoosh(a);hit(a)
for a in [0,.16,.32]:hit(a,90)
for a in [T['r1b']['s']-.15,P('r2a',.42),P('r3a',.49)]:hit(a,60)
for a in [P('r1a',.53),T['r1b']['s']+.35,P('r2a',.42),P('r3a',.3),P('r3a',.69),CTA]:ding(a)
mix=voice*1.5+mus+sfx;f=int(.15*sr);mix[-f:]*=np.linspace(1,0,f);mix/=max(1,np.abs(mix).max()/.97)
w=wave.open('audio.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((mix*32767).astype(np.int16).tobytes());w.close()
