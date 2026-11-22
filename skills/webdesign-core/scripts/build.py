#!/usr/bin/env python3
"""webdesign-core build: brief.json + style -> website.

Usage:
  python3 build.py --style bold-pop --brief brief.json --out out/site [--inline]

--inline   one self-contained index.html (libraries inlined; good for previews/artifacts)
default    index.html + assets/ folder (good for real hosting, e.g. GitHub Pages)

Styles live in ../styles/<name>.py and expose render(brief, ctx) -> dict with keys:
  css, body, fonts (Google Fonts family query), three (bool), title (optional)
"""
import argparse, importlib.util, json, shutil, sys
from pathlib import Path

CORE = Path(__file__).resolve().parent.parent
VENDOR = CORE / "vendor"
EFFECTS = CORE / "effects"

BASE_LIBS = ["gsap.min.js", "ScrollTrigger.min.js", "SplitText.min.js", "lenis.min.js"]


def load_style(name):
    p = CORE / "styles" / f"{name.replace('-', '_')}.py"
    if not p.exists():
        sys.exit(f"unknown style '{name}'. available: " + ", ".join(
            s.stem.replace('_', '-') for s in (CORE / 'styles').glob('*.py') if not s.stem.startswith('_')))
    spec = importlib.util.spec_from_file_location(p.stem, p)
    mod = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(CORE / "styles"))
    spec.loader.exec_module(mod)
    return mod


def page(brief, out, inline, r):
    lang = brief.get("lang", "de")
    title = r.get("title") or f"{brief.get('brand', 'Website')} – {brief.get('tagline', '')}".strip(" –")
    desc = brief.get("description") or brief.get("tagline") or ""
    fonts = r.get("fonts")
    base_css = (EFFECTS / "effects.css").read_text()

    def js_tag(name):
        if inline:
            return f"<script>{(VENDOR / name).read_text()}</script>"
        return f'<script src="assets/{name}"></script>'

    three = ""
    if r.get("three"):
        if inline:
            src = (VENDOR / "three.module.min.js").read_text().replace("</script", "<\\/script")
            three = ("<script type=\"text/plain\" id=\"three-src\">" + src + "</script>\n"
                     "<script type=\"module\">const b=new Blob([document.getElementById('three-src').textContent],"
                     "{type:'text/javascript'});import(URL.createObjectURL(b)).then(m=>{window.THREE=m;"
                     "window.dispatchEvent(new Event('three-ready'))});</script>")
        else:
            three = ("<script type=\"module\">import * as T from './assets/three.module.min.js';"
                     "window.THREE=T;window.dispatchEvent(new Event('three-ready'));</script>")

    effects_js = (EFFECTS / "effects.js").read_text()
    effects_tag = f"<script>{effects_js}</script>" if inline else '<script src="assets/effects.js"></script>'
    font_link = (f'<link rel="preconnect" href="https://fonts.googleapis.com">'
                 f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
                 f'<link href="https://fonts.googleapis.com/css2?{fonts}&display=swap" rel="stylesheet">') if fonts else ""
    html = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
{font_link}
<style>{base_css}
{r['css']}</style>
</head>
<body>
{r['body']}
{''.join(js_tag(n) for n in BASE_LIBS)}
{three}
{effects_tag}
</body>
</html>
"""
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(html)
    if not inline:
        a = out / "assets"; a.mkdir(exist_ok=True)
        for n in BASE_LIBS + (["three.module.min.js"] if r.get("three") else []):
            shutil.copy(VENDOR / n, a / n)
        shutil.copy(EFFECTS / "effects.js", a / "effects.js")
    return out / "index.html"


def esc(s):
    return (str(s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--style", required=True)
    ap.add_argument("--brief", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--inline", action="store_true")
    a = ap.parse_args()
    brief = json.loads(Path(a.brief).read_text())
    mod = load_style(a.style)
    r = mod.render(brief, {"esc": esc})
    f = page(brief, Path(a.out), a.inline, r)
    print(f"built {f} ({f.stat().st_size // 1024} KB, style={a.style}, inline={a.inline})")


if __name__ == "__main__":
    main()
