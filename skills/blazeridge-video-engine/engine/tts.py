# Nutzung: python3 engine/tts.py <projekt> <stimme.onnx>
# Liest <projekt>/skript.json  ([["hook","Text"],["r1a","..."],["r1b",".."],["r2a",".."],["r3a",".."],["end",".."],["cta",".."]])
# Schreibt <projekt>/vo/<key>.wav und <projekt>/timeline.json
import sys,json,subprocess,os
n,voice=sys.argv[1],sys.argv[2];os.makedirs(f"{n}/vo",exist_ok=True)
L=json.load(open(f"{n}/skript.json"));tl=[];t=0.25
for k,txt in L:
    f=f"{n}/vo/{k}.wav"
    subprocess.run(["python3","-m","piper","-m",voice,"--length-scale","0.96","--sentence-silence","0.15","-f",f],input=txt.encode(),check=True,capture_output=True)
    d=float(subprocess.check_output(["ffprobe","-v","0","-show_entries","format=duration","-of","csv=p=0",f]))
    tl.append(dict(k=k,txt=txt,s=round(t,2),d=round(d,2)));t+=d+0.4
json.dump(dict(tl=tl,total=round(t+0.5,2)),open(f"{n}/timeline.json","w"),ensure_ascii=False)
print(n,"Gesamtdauer",round(t+0.5,2),"s")
