#!/usr/bin/env python3
"""QA for a built site: console/page errors, screenshots while scrolling, mobile shot, contact sheet,
optional scroll video (for promo videos).

Usage:
  python3 shoot.py path/to/index.html out_dir [--steps 8] [--video] [--mobile]
Exit code 1 if the page logs JS errors.
Needs the pre-installed Playwright (require/import playwright works; do NOT run 'playwright install').
"""
import argparse, json, subprocess, sys
from pathlib import Path

JS = r"""
const { chromium } = require('playwright');
(async () => {
  const [file, out, steps, video, mobile, vsize] = process.argv.slice(2);
  const [vw, vh] = (vsize || '1280x720').split('x').map(Number);
  const errors = [];
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const run = async (name, vp, rec) => {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1,
      ...(rec ? { recordVideo: { dir: out + '/video', size: vp } } : {}) });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(`[${name}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${name}] pageerror: ${e.message}`));
    await page.goto(file, { waitUntil: 'load' });
    if (rec) await page.evaluate(() => {
      window.__marks = [];
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting && !window.__marks.find((m) => m.fx === e.target.dataset.fx))
          window.__marks.push({ fx: e.target.dataset.fx, t: performance.now() / 1000 });
      }), { threshold: 0, rootMargin: '0px 0px -45% 0px' });
      document.querySelectorAll('[data-fx]').forEach((el) => io.observe(el));
    });
    await page.waitForTimeout(1500);
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const n = parseInt(steps);
    for (let i = 0; i <= n; i++) {
      const y = Math.round(H * i / n);
      // scroll in small increments so scrubbed ScrollTriggers update like a real user
      await page.evaluate(async ([target, delay]) => {
        const st = window.scrollY, d = target - st, k = 12;
        for (let j = 1; j <= k; j++) { window.scrollTo(0, st + d * j / k); await new Promise(r => setTimeout(r, delay)); }
      }, [y, rec ? 60 : 25]);
      await page.waitForTimeout(rec ? 900 : 700);
      if (!rec) await page.screenshot({ timeout: 90000, animations: 'disabled', path: `${out}/${name}-${String(i).padStart(2, '0')}.png` });
    }
    const marks = rec ? await page.evaluate(() => window.__marks) : null;
    const info = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth,
      vw: innerWidth, ready: !!window.__effectsReady, three: !!window.THREE, canvases: document.querySelectorAll('canvas').length }));
    await ctx.close();
    if (marks) info.marks = marks;
    return info;
  };
  const res = {};
  res.desktop = await run('desktop', { width: 1440, height: 900 }, false);
  if (mobile === '1') res.mobile = await run('mobile', { width: 390, height: 844 }, false);
  if (video === '1') res.video = await run('rec', { width: vw, height: vh }, true);
  await browser.close();
  console.log(JSON.stringify({ res, errors }));
})();
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html"); ap.add_argument("out")
    ap.add_argument("--steps", type=int, default=8)
    ap.add_argument("--video", action="store_true")
    ap.add_argument("--mobile", action="store_true")
    ap.add_argument("--video-size", default="1280x720", help="e.g. 430x932 for a phone-format recording")
    a = ap.parse_args()
    out = Path(a.out).resolve(); out.mkdir(parents=True, exist_ok=True)
    js = out / "_shoot.cjs"; js.write_text(JS)
    html = Path(a.html).resolve()
    import socket, time
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1", "-d", str(html.parent)],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    try:
        p = subprocess.run(["node", str(js), f"http://127.0.0.1:{port}/{html.name}", str(out), str(a.steps),
                            "1" if a.video else "0", "1" if a.mobile else "0", a.video_size], capture_output=True, text=True)
    finally:
        srv.terminate()
    if p.returncode != 0:
        print(p.stderr[-3000:]); sys.exit(2)
    data = json.loads(p.stdout.strip().splitlines()[-1])
    # contact sheet
    shots = sorted(out.glob("desktop-*.png"))
    if shots:
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-pattern_type", "glob", "-i", str(out / "desktop-*.png"),
                        "-vf", f"scale=480:-1,tile={min(len(shots), 3)}x{(len(shots) + 2) // 3}", "-frames:v", "1",
                        str(out / "sheet-desktop.png")])
    mshots = sorted(out.glob("mobile-*.png"))
    if mshots:
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-pattern_type", "glob", "-i", str(out / "mobile-*.png"),
                        "-vf", f"scale=195:-1,tile={len(mshots)}x1", "-frames:v", "1", str(out / "sheet-mobile.png")])
    vids = list((out / "video").glob("*.webm")) if a.video else []
    if vids:
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(vids[0]), "-c:v", "libx264", "-pix_fmt", "yuv420p",
                        "-crf", "20", str(out / "scroll.mp4")])
    if a.video and data["res"].get("video", {}).get("marks") is not None:
        (out / "marks.json").write_text(json.dumps(data["res"]["video"]["marks"], indent=1))
    print(json.dumps(data["res"], indent=1))
    hscroll = data["res"]["desktop"]["w"] > data["res"]["desktop"]["vw"] + 2
    if hscroll: print("WARN: horizontal overflow on desktop")
    if "mobile" in data["res"] and data["res"]["mobile"]["w"] > data["res"]["mobile"]["vw"] + 2:
        print("WARN: horizontal overflow on mobile")
    if data["errors"]:
        print("ERRORS:"); [print(" ", e) for e in data["errors"]]; sys.exit(1)
    print("OK: no JS errors" + (f" | video: {out/'scroll.mp4'}" if vids else ""))


if __name__ == "__main__":
    main()
