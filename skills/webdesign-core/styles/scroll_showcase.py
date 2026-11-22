"""scroll-showcase: editorial dark site that uses all 10 signature scroll effects
(layered parallax, pinned heading, 3D card zoom, line reveal, sideways text, card arc carousel,
fixed 3D model, stacking cards, focus-frame slider, scroll-triggered counters/drawing)."""
from _common import esc, ICON, links, seed


def layers_svg(c):
    cols = [c["l1"], c["l2"], c["l3"], c["l4"]]
    paths = [
        "M0 420 L180 260 L330 380 L520 200 L700 360 L900 230 L1100 380 L1280 250 L1440 330 V800 H0Z",
        "M0 520 L220 380 L420 500 L640 360 L860 520 L1080 400 L1300 510 L1440 440 V800 H0Z",
        "M0 600 L260 500 L520 610 L760 520 L1020 620 L1260 540 L1440 600 V800 H0Z",
        "M0 700 Q360 620 720 690 T1440 670 V800 H0Z",
    ]
    speeds = [0.15, 0.35, 0.6, 0.9]
    return "".join(
        f'<svg class="layer" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" data-parallax="{s}" aria-hidden="true"><path d="{p}" fill="{col}"/></svg>'
        for p, col, s in zip(paths, cols, speeds))


def render(b, ctx):
    c = {"bg": "#0D0D0F", "ink": "#F4F1EA", "accent": "#FF7A1A", "sky1": "#FF9A3C", "sky2": "#FFD36B",
         "l1": "#C2410C", "l2": "#7C2D12", "l3": "#3B1508", "l4": "#0D0D0F"}
    c.update(b.get("colors") or {})
    brand = b.get("brand", "Studio")
    hero = b.get("hero") or {}
    about = b.get("about") or {}
    items = b.get("items") or []
    stats = b.get("stats") or []
    contact = b.get("contact") or {}
    pin = b.get("pinned") or {"heading": about.get("kicker", "Warum?"), "points": [it.get("text", "") for it in items[:3]]}
    cta = hero.get("cta") or {"label": "Kontakt", "href": "#kontakt"}

    def grad(i):
        a = int(seed(items[i % max(1, len(items))].get("title", str(i)) if items else str(i)) * 360)
        return f"linear-gradient(135deg,hsl({a} 85% 60%),hsl({(a + 50) % 360} 85% 45%))"

    def media(it, i):
        if it.get("image"):
            return f'<img src="{esc(it["image"])}" alt="{esc(it.get("title"))}" loading="lazy">'
        return f'<div class="gen" style="background:{grad(i)}"><span>{esc(it.get("title"))}</span></div>'

    arc = "".join(f'<figure class="arc-card">{media(it, i)}<figcaption>{esc(it.get("title"))}</figcaption></figure>' for i, it in enumerate(items))
    def panel(it, i):
        if it.get("image"):
            return f'<img src="{esc(it["image"])}" alt="{esc(it.get("title"))}" loading="lazy">'
        return f'<div class="panel" aria-hidden="true"><i></i><i></i><i></i><b>{i + 1:02d}</b></div>'
    stack = "".join(f'<article class="stack-card" style="--g:{grad(i)}"><div><span class="n">{i + 1:02d}</span><h3>{esc(it.get("title"))}</h3><p>{esc(it.get("text", ""))}</p></div>{panel(it, i)}</article>' for i, it in enumerate(items))
    slides = "".join(f'<figure class="focus-slide">{media(it, i)}<figcaption>{esc(it.get("title"))}</figcaption></figure>' for i, it in enumerate(items))
    points = "".join(f'<p class="pt" data-reveal>{esc(p)}</p>' for p in pin.get("points", []) if p)
    statx = "".join(f'<div class="st"><strong data-count="{esc(s.get("value"))}">0</strong><span>{esc(s.get("label"))}</span></div>' for s in stats)
    blocks = "".join(f'<div class="mblock" data-reveal><h3>{esc(it.get("title"))}</h3><p>{esc(it.get("text", ""))}</p></div>' for it in items[:3])
    link_html = "".join(f'<a href="{esc(l.get("href"))}">{esc(l.get("label"))} {ICON["arrow"]}</a>' for l in links(b))

    css = f"""
:root{{--bg:{c['bg']};--ink:{c['ink']};--accent:{c['accent']}}}
html,body{{background:var(--bg);color:var(--ink);font-family:'Inter Tight',system-ui,sans-serif}}
body{{overflow-x:hidden}}
h1,h2,h3{{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-.01em}}
.nav{{position:fixed;inset:0 0 auto;z-index:60;display:flex;justify-content:space-between;align-items:center;padding:18px clamp(16px,4vw,48px);mix-blend-mode:difference;font-size:14px}}
.nav a{{text-decoration:none}} .nav b{{font-weight:700;letter-spacing:.08em;text-transform:uppercase}}
.hero{{position:relative;height:120vh;overflow:hidden;background:linear-gradient(180deg,{c['sky2']} 0%,{c['sky1']} 45%,{c['l1']} 100%)}}
.hero .layer{{position:absolute;left:0;bottom:0;width:100%;height:100%}}
.hero .sun{{position:absolute;left:50%;top:30%;width:22vmin;aspect-ratio:1;border-radius:50%;background:#FFF1C7;transform:translateX(-50%);box-shadow:0 0 120px 40px rgba(255,220,150,.55)}}
.hero .title{{position:absolute;z-index:5;inset:auto 0 26vh 0;text-align:center;padding:0 16px}}
.hero h1{{font-size:clamp(56px,11vw,190px);line-height:.9;margin:0;color:#fff;text-shadow:0 6px 40px rgba(0,0,0,.35)}}
.hero p{{font-size:clamp(16px,1.6vw,20px);max-width:46ch;margin:18px auto 0;color:#fff}}
.pinsec{{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:6vw;padding:16vh clamp(16px,6vw,96px)}}
.pinsec h2{{font-size:clamp(54px,8vw,130px);line-height:.9;margin:0;text-transform:uppercase}}
.pinsec .pt{{font-size:clamp(20px,2.2vw,30px);line-height:1.35;margin:0 0 30vh;max-width:28ch}}
.zoomwrap{{padding:6vh clamp(16px,6vw,96px) 14vh}}
.zoomcard{{border-radius:28px;overflow:hidden;aspect-ratio:16/9;background:linear-gradient(135deg,#1c1c22,#2a2a35);border:1px solid rgba(255,255,255,.12);display:grid;place-items:center;position:relative}}
.zoomcard .chrome{{position:absolute;top:0;left:0;right:0;height:36px;background:rgba(255,255,255,.06);display:flex;gap:8px;align-items:center;padding-left:16px}}
.zoomcard .chrome i{{width:11px;height:11px;border-radius:50%;background:#ff5f57}} .zoomcard .chrome i:nth-child(2){{background:#febc2e}} .zoomcard .chrome i:nth-child(3){{background:#28c840}}
.zoomcard h2{{font-size:clamp(40px,7vw,120px);margin:0;text-align:center;line-height:.95}}
.statement{{padding:18vh clamp(16px,6vw,96px)}}
.statement h2{{font-size:clamp(36px,5.6vw,92px);line-height:1.02;margin:0;max-width:20ch}}
.side{{padding:8vh 0;overflow:hidden;border-block:1px solid rgba(255,255,255,.12)}}
.side div{{font-family:'Instrument Serif',serif;font-size:clamp(70px,13vw,220px);line-height:1}}
.side div:nth-child(2){{color:var(--accent);font-style:italic}}
.arcsec{{background:#141418}}
.arcsec h2.lbl{{position:absolute;z-index:2;top:12vh;width:100%;text-align:center;font-size:clamp(32px,4vw,60px);margin:0}}
.arc-card{{width:clamp(180px,22vw,320px);margin:0;border-radius:22px;overflow:hidden;background:#222;box-shadow:0 30px 60px rgba(0,0,0,.5)}}
.arc-card img,.arc-card .gen{{width:100%;aspect-ratio:4/5;object-fit:cover}}
.arc-card figcaption{{padding:12px 16px;font-size:14px}}
.gen{{display:grid;place-items:end start;padding:18px}} .gen span{{font-family:'Instrument Serif',serif;font-size:clamp(26px,2.6vw,40px);color:#fff;line-height:1}}
.model{{position:relative}}
.model .fixed3d{{position:sticky;top:0;height:100vh;width:100%;}}
.model .over{{position:relative;margin-top:-100vh;padding:20vh clamp(16px,6vw,96px) 20vh}}
.mblock{{max-width:420px;margin:0 0 60vh;padding:28px;border-radius:24px;background:rgba(13,13,15,.55);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12)}}
.mblock:nth-child(even){{margin-left:auto}}
.mblock h3{{font-size:40px;margin:0 0 10px}} .mblock p{{margin:0;line-height:1.55;opacity:.8}}
.stacksec{{padding:10vh clamp(16px,6vw,96px) 20vh}}
.stack-card{{display:grid;grid-template-columns:1fr 1fr;gap:4vw;align-items:center;min-height:62vh;border-radius:32px;padding:clamp(22px,4vw,56px);margin-bottom:6vh;background:var(--g);color:#fff;box-shadow:0 -20px 60px rgba(0,0,0,.4)}}
.stack-card .n{{font-size:14px;opacity:.85}} .stack-card h3{{font-size:clamp(40px,5vw,80px);margin:8px 0 14px;line-height:.95}} .stack-card p{{font-size:18px;line-height:1.55;max-width:36ch}}
.stack-card img{{border-radius:20px;aspect-ratio:4/3;width:100%;object-fit:cover}}
.panel{{position:relative;border-radius:20px;aspect-ratio:4/3;width:100%;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.35);padding:22px;display:flex;flex-direction:column;gap:12px;overflow:hidden}}
.panel i{{display:block;height:14px;border-radius:8px;background:rgba(255,255,255,.45)}} .panel i:nth-child(2){{width:70%}} .panel i:nth-child(3){{width:45%}}
.panel b{{position:absolute;right:18px;bottom:6px;font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(80px,10vw,160px);line-height:1;opacity:.9}}
.focussec{{position:relative;background:#F4F1EA;color:#0D0D0F}}
.focussec .frame{{position:absolute;z-index:3;left:50%;top:50%;width:min(46vw,520px);aspect-ratio:4/5;transform:translate(-50%,-52%);pointer-events:none}}
.focussec .frame i{{position:absolute;width:40px;height:40px;border:3px solid #0D0D0F}}
.focussec .frame i:nth-child(1){{left:-18px;top:-18px;border-right:0;border-bottom:0}} .focussec .frame i:nth-child(2){{right:-18px;top:-18px;border-left:0;border-bottom:0}}
.focussec .frame i:nth-child(3){{left:-18px;bottom:-18px;border-right:0;border-top:0}} .focussec .frame i:nth-child(4){{right:-18px;bottom:-18px;border-left:0;border-top:0}}
.focus-slide{{width:min(40vw,460px);margin:0}}
.focus-slide img,.focus-slide .gen{{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:6px}}
.focus-slide figcaption{{margin-top:10px;font-size:14px;text-transform:uppercase;letter-spacing:.06em}}
.demo{{padding:16vh clamp(16px,6vw,96px);display:grid;grid-template-columns:1fr 1fr;gap:6vw;align-items:center}}
.demo .sts{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.st{{border:1px solid rgba(255,255,255,.15);border-radius:22px;padding:24px}} .st strong{{font-family:'Instrument Serif',serif;font-size:clamp(52px,6vw,90px);font-weight:400;display:block;line-height:1;color:var(--accent)}} .st span{{opacity:.7;font-size:14px}}
.demo svg{{width:100%;height:auto}}
.contact{{padding:20vh clamp(16px,6vw,96px) 8vh;border-top:1px solid rgba(255,255,255,.12)}}
.contact h2{{font-size:clamp(64px,12vw,200px);margin:0;line-height:.9}}
.contact .row{{display:flex;flex-wrap:wrap;gap:28px;justify-content:space-between;margin-top:6vh;align-items:center}}
.contact .mail{{font-size:clamp(20px,2.4vw,34px);text-decoration:none;border-bottom:2px solid var(--accent)}}
.contact .links{{display:flex;gap:20px;flex-wrap:wrap}} .contact .links a{{text-decoration:none;display:inline-flex;gap:6px;align-items:center}}
footer{{padding:4vh clamp(16px,6vw,96px);font-size:13px;opacity:.55;display:flex;gap:16px;flex-wrap:wrap}}
@media (max-width:820px){{.pinsec,.demo,.stack-card{{grid-template-columns:1fr}} .focus-slide{{width:70vw}} .focussec .frame{{width:72vw}}}}
"""
    body = f"""
<nav class="nav" aria-label="Hauptnavigation"><b>{esc(brand)}</b><a href="{esc(cta.get('href'))}">{esc(cta.get('label'))}</a></nav>
<main id="top">
<section class="hero" data-parallax-scope data-fx="Layered Parallax"><div class="sun" data-parallax="0.1"></div>{layers_svg(c)}
<div class="title"><h1 data-lines>{esc(hero.get('title') or brand)}</h1><p data-reveal>{esc(hero.get('subtitle') or b.get('tagline', ''))}</p></div></section>
<section class="pinsec" data-pin data-fx="Pinned Heading"><div><h2 data-pin-target>{esc(pin.get('heading'))}</h2></div><div>{points}</div></section>
<section class="zoomwrap" data-fx="3D Card Zoom"><div class="zoomcard" data-card-zoom><div class="chrome"><i></i><i></i><i></i></div><h2>{esc(b.get('showcase_title') or hero.get('title') or brand)}</h2></div></section>
<section class="statement" data-fx="Line-by-line Reveal"><h2 data-lines>{esc(about.get('heading') or about.get('text', ''))}</h2></section>
<section class="side" aria-hidden="true" data-fx="Sideways Text"><div data-sideways="-1">{esc((b.get('marquee') or [brand])[0])} — {esc(b.get('tagline', ''))} — {esc((b.get('marquee') or [brand])[0])}</div>
<div data-sideways="1">{esc(b.get('tagline', ''))} — {esc(brand)} — {esc(b.get('tagline', ''))}</div></section>
<section class="arcsec" data-fx="Card Arc Carousel"><div data-arc="11"><h2 class="lbl">{esc(b.get('arc_title', 'Ausgewählte Arbeiten'))}</h2>{arc}</div></section>
<section class="model" data-fx="Fixed 3D Model"><div class="fixed3d"><div data-three="{esc(b.get('model', 'knot'))}" data-color="{c['accent']}" style="height:100vh"></div></div><div class="over">{blocks}</div></section>
<section class="stacksec" data-stack data-fx="Stacking Cards">{stack}</section>
<section class="focussec" data-focus data-fx="Focus-frame Slider"><div class="frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="focus-track">{slides}</div></section>
<section class="demo" data-fx="Scroll-triggered Demo"><div><h2 data-lines style="font-size:clamp(40px,5vw,80px);margin:0 0 24px">{esc(b.get('stats_title', 'In Zahlen'))}</h2>
<svg viewBox="0 0 600 200" data-draw aria-hidden="true"><path d="M10 180 C120 180 150 40 260 60 S420 170 590 20" fill="none" stroke="{c['accent']}" stroke-width="4"/></svg></div>
<div class="sts">{statx}</div></section>
</main>
<section class="contact" id="kontakt"><h2 data-lines>{esc(contact.get('heading', 'Kontakt'))}</h2>
<div class="row">{f'<a class="mail" href="mailto:{esc(contact.get("email"))}">{esc(contact.get("email"))}</a>' if contact.get('email') else ''}<div class="links">{link_html}</div></div></section>
<footer><span>{esc(b.get('footer') or f'© {brand}')}</span>{''.join(f'<a href="{esc(l.get("href"))}">{esc(l.get("label"))}</a>' for l in (b.get('legal') or []))}</footer>
"""
    return {"css": css, "body": body,
            "fonts": "family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;700",
            "three": True}
