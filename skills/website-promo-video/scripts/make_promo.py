#!/usr/bin/env python3
"""Render a 9:16 promo reel of a website from its scroll recording (free: Playwright + Remotion).

  python3 make_promo.py --format desk    --clip qa/scroll.mp4 --caption "Claude hat diese Website gebaut" --out promo.mp4
  python3 make_promo.py --format list    --clip qa/scroll.mp4 --marks qa/marks.json --title "10 Scroll-Effekte" --out promo.mp4
  python3 make_promo.py --format collage --clip qa/scroll.mp4 --shots qa --brand Aqualis --lines "Satz 1|Satz 2" --out promo.mp4
Common: --handle @blazeridge --brand BlazeRidge --speed 1.3 --accent '#FFE14D' --theme night|day --url example.de
Needs ~/claude-motion (Remotion project; restore via bootstrap.sh / claude-motion-template.zip).
"""
import argparse, json, shutil, subprocess, sys, uuid
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
MOTION = Path.home() / "claude-motion"
CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
COMP = {"desk": "DeskMonitor", "list": "EffectsList", "collage": "CaseCollage"}


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--format", choices=COMP, required=True)
    ap.add_argument("--clip", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--marks"); ap.add_argument("--shots")
    ap.add_argument("--caption", default="Claude hat diese Website gebaut")
    ap.add_argument("--title", default="10 Scroll-Effekte")
    ap.add_argument("--handle", default="@blazeridge"); ap.add_argument("--brand", default="BlazeRidge")
    ap.add_argument("--lines", default=""); ap.add_argument("--outro", default="")
    ap.add_argument("--speed", type=float); ap.add_argument("--accent"); ap.add_argument("--theme", default="night")
    ap.add_argument("--a1"); ap.add_argument("--a2"); ap.add_argument("--url", default="")
    a = ap.parse_args()
    if not (MOTION / "node_modules" / "remotion").exists():
        sys.exit("~/claude-motion fehlt: zuerst bootstrap.sh (OneDrive /Claude Skills) ausführen.")

    # sync compositions into the Remotion project
    dst = MOTION / "src" / "promo"; dst.mkdir(parents=True, exist_ok=True)
    for f in (SKILL / "remotion").glob("*.tsx"):
        shutil.copy(f, dst / f.name)
    job = uuid.uuid4().hex[:8]
    pub = MOTION / "public" / "promo" / job; pub.mkdir(parents=True, exist_ok=True)
    shutil.copy(a.clip, pub / "clip.mp4")
    props = {"clip": f"promo/{job}/clip.mp4", "clipSeconds": round(dur(a.clip), 2), "handle": a.handle, "brand": a.brand}
    if a.speed: props["speed"] = a.speed
    if a.format == "desk":
        props.update(caption=a.caption, outroLine=a.outro or None, theme=a.theme)
        if a.accent: props["accent"] = a.accent
    elif a.format == "list":
        marks = json.loads(Path(a.marks).read_text()) if a.marks else []
        props.update(title=a.title, url=a.url, items=[{"label": m["fx"], "at": round(max(0, m["t"] - 0.3), 2)} for m in marks])
    else:
        shots = sorted(Path(a.shots).glob("desktop-*.png"))[:6] if a.shots else []
        names = []
        for i, s in enumerate(shots):
            shutil.copy(s, pub / f"shot{i}.png"); names.append(f"promo/{job}/shot{i}.png")
        props.update(shots=names, lines=[x for x in a.lines.split("|") if x] or [a.brand])
        if a.a1: props["a1"] = a.a1
        if a.a2: props["a2"] = a.a2
    pf = pub / "props.json"; pf.write_text(json.dumps(props))
    out = Path(a.out).resolve(); out.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["npx", "remotion", "render", "src/promo/promo-entry.tsx", COMP[a.format], str(out), f"--props={pf}",
           f"--browser-executable={CHROME}", "--concurrency=2", "--log=error"]
    r = subprocess.run(cmd, cwd=MOTION)
    if r.returncode: sys.exit(r.returncode)
    shutil.rmtree(pub, ignore_errors=True)
    print(f"promo: {out} ({dur(out):.1f}s)")


if __name__ == "__main__":
    main()
