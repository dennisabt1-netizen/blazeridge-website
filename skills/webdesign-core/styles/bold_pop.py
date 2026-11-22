"""bold-pop: loud yellow/black studio look — giant type, morphing black blob,
sticker-object collage that scatters in, colour-block mosaic, huge 'Reach out' footer.
(Inspired by bold creative-studio sites; all shapes generated, no stock assets.)"""
from _common import esc, sticker_svg, blob_path, ICON, links, seed


def render(b, ctx):
    c = {"bg": "#FFE14D", "ink": "#0B0B0B", "accent": "#FF5A1F", "blue": "#1E6BFF",
         "tiles": ["#FF4D4D", "#B79CFF", "#44D17A", "#FF9F1C", "#4DB8FF"]}
    c.update(b.get("colors") or {})
    pal = c["tiles"]
    brand = b.get("brand", "Studio")
    hero = b.get("hero") or {}
    about = b.get("about") or {}
    items = b.get("items") or []
    stats = b.get("stats") or []
    contact = b.get("contact") or {}
    nav = b.get("nav") or ["Arbeit", "Studio", "Kontakt"]
    anchors = ["arbeit", "studio", "kontakt"]

    shapes = "|".join(blob_path(brand, k, points=8, r=230, wobble=0.55, cx=400, cy=300) for k in range(4))
    first = shapes.split("|")[0]

    def item_visual(it, i, size=200):
        if it.get("image"):
            return f'<img src="{esc(it["image"])}" alt="{esc(it.get("title"))}" loading="lazy" width="{size}" height="{size}">'
        return sticker_svg(it.get("title", f"Item {i}"), pal, i, size)

    floaters = "".join(
        f'<div class="floater f{i}" data-parallax="{(-0.6 if i % 2 else 0.9) * (1 + i * 0.2):.2f}">{item_visual(it, i, 170)}</div>'
        for i, it in enumerate(items[:4]))

    tiles = "".join(
        f'<figure class="tile" style="--t:{pal[i % len(pal)]}">{item_visual(it, i, 220)}'
        f'<figcaption><b>{esc(it.get("title"))}</b><span>{esc(it.get("tag", ""))}</span></figcaption></figure>'
        for i, it in enumerate(items))

    cards = "".join(
        f'<article class="card" data-reveal="{(i % 3) * 0.08:.2f}"><div class="num">{i + 1:02d}</div>'
        f'<h3>{esc(it.get("title"))}</h3><p>{esc(it.get("text", ""))}</p></article>'
        for i, it in enumerate(items))

    stat_html = "".join(
        f'<div class="stat"><strong data-count="{esc(s.get("value"))}">0</strong><span>{esc(s.get("label"))}</span></div>'
        for s in stats)

    link_html = "".join(f'<a href="{esc(l.get("href"))}">{esc(l.get("label"))} {ICON["arrow"]}</a>' for l in links(b))
    email = contact.get("email")
    cta = hero.get("cta") or {}

    longest = max((len(w) for w in str(hero.get("title") or brand).split()), default=8)
    hero_vw = round(min(17, 150 / max(longest, 1)), 1)
    css = f"""
:root{{--bg:{c['bg']};--ink:{c['ink']};--accent:{c['accent']};--blue:{c['blue']}}}
html,body{{background:var(--bg);color:var(--ink);font-family:'Space Grotesk',system-ui,sans-serif}}
body{{overflow-x:hidden}}
.nav{{position:fixed;inset:0 0 auto 0;z-index:50;display:flex;justify-content:space-between;align-items:center;padding:18px clamp(16px,4vw,48px);mix-blend-mode:difference;color:#fff}}
.nav .logo{{font-family:'Archivo Black',sans-serif;font-size:20px;letter-spacing:.02em;text-decoration:none}}
.nav ul{{display:flex;gap:clamp(12px,3vw,36px);list-style:none;margin:0;padding:0;font:500 13px/1 'Space Mono',monospace;text-transform:uppercase}}
.nav a{{text-decoration:none}}
.hero{{position:relative;min-height:100svh;display:grid;place-items:center;overflow:hidden}}
.hero svg.blob{{position:absolute;width:min(110vw,1300px);height:auto;left:50%;top:50%;transform:translate(-50%,-52%)}}
.hero h1{{position:relative;z-index:2;font-family:'Archivo Black',sans-serif;font-size:clamp(40px,{hero_vw}vw,260px);line-height:.85;letter-spacing:-.04em;margin:0;color:var(--bg);text-align:center;-webkit-text-stroke:2px var(--ink)}}
.hero .sub{{position:absolute;z-index:3;bottom:9vh;left:clamp(16px,4vw,48px);right:clamp(16px,4vw,48px);display:flex;justify-content:space-between;align-items:end;gap:24px;font:500 clamp(14px,1.4vw,18px)/1.35 'Space Mono',monospace;text-transform:uppercase}}
.hero .sub p{{max-width:28ch;margin:0}}
.btn{{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:var(--bg);padding:16px 26px;border-radius:999px;font:700 15px/1 'Space Grotesk',sans-serif;text-decoration:none;transition:transform .25s}}
.btn:hover{{transform:translateY(-3px) rotate(-2deg)}}
.floater{{position:absolute;z-index:1;filter:drop-shadow(8px 10px 0 rgba(0,0,0,.85))}}
.floater.f0{{left:6vw;top:16vh}} .floater.f1{{right:7vw;top:20vh}} .floater.f2{{left:22vw;bottom:30vh}} .floater.f3{{right:18vw;bottom:32vh}}
.floater img{{border-radius:24px;border:5px solid var(--ink);object-fit:cover}}
.manifesto{{padding:18vh clamp(16px,6vw,96px) 14vh}}
.manifesto .kicker{{font:500 13px/1 'Space Mono',monospace;text-transform:uppercase;margin-bottom:24px;display:flex;gap:10px;align-items:center}}
.manifesto .kicker::before{{content:'';width:12px;height:12px;background:var(--accent);border-radius:50%}}
.manifesto h2{{font-family:'Archivo Black',sans-serif;font-size:clamp(30px,5.2vw,84px);line-height:.98;letter-spacing:-.02em;text-transform:uppercase;margin:0;max-width:22ch}}
.band{{background:var(--blue);color:var(--bg);padding:6vh 0;overflow:hidden;border-block:5px solid var(--ink)}}
.band .row{{font-family:'Archivo Black',sans-serif;font-size:clamp(48px,9vw,150px);line-height:1;display:flex;gap:.5em}}
.band .row span:nth-child(even){{color:var(--ink)}}
.mosaic{{padding:12vh clamp(16px,4vw,48px)}}
.mosaic .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:18px}}
.tile{{margin:0;background:var(--t);border:5px solid var(--ink);border-radius:28px;padding:26px 18px 18px;display:grid;justify-items:center;gap:14px;box-shadow:10px 10px 0 var(--ink);transition:transform .3s}}
.tile:hover{{transform:rotate(-2deg) translateY(-6px)}}
.tile img{{border-radius:18px;object-fit:cover;aspect-ratio:1}}
.tile figcaption{{width:100%;display:flex;justify-content:space-between;font:500 13px 'Space Mono',monospace;text-transform:uppercase}}
.work{{padding:4vh clamp(16px,4vw,48px) 14vh;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:0;border-top:5px solid var(--ink)}}
.card{{border-bottom:5px solid var(--ink);padding:34px 8px 40px;position:relative}}
.card .num{{font:500 13px 'Space Mono',monospace}}
.card h3{{font-family:'Archivo Black',sans-serif;font-size:clamp(26px,3vw,40px);margin:12px 0 10px;text-transform:uppercase;line-height:1}}
.card p{{margin:0;font-size:17px;line-height:1.5;max-width:40ch}}
.stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:18px;padding:0 clamp(16px,4vw,48px) 14vh}}
.stat{{background:var(--ink);color:var(--bg);border-radius:28px;padding:30px}}
.stat strong{{display:block;font-family:'Archivo Black',sans-serif;font-size:clamp(48px,6vw,88px);line-height:1}}
.stat span{{font:500 13px 'Space Mono',monospace;text-transform:uppercase}}
.reach{{position:relative;background:var(--ink);color:var(--bg);padding:24vh clamp(16px,4vw,48px) 6vh;overflow:hidden}}
.reach .wave{{position:absolute;top:-1px;left:0;width:100%;height:120px}}
.reach .big{{font-family:'Archivo Black',sans-serif;font-size:clamp(80px,19vw,300px);line-height:.85;letter-spacing:-.04em;text-transform:uppercase}}
.reach .row2{{display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;margin-top:8vh;align-items:end}}
.reach .row2 a{{text-decoration:none}}
.reach .mail{{font-family:'Archivo Black',sans-serif;font-size:clamp(22px,3vw,44px);border-bottom:4px solid var(--accent)}}
.reach .links{{display:flex;gap:22px;flex-wrap:wrap;font:500 14px 'Space Mono',monospace;text-transform:uppercase}}
.reach .links a{{display:inline-flex;gap:6px;align-items:center}}
.reach footer{{margin-top:10vh;font:400 12px 'Space Mono',monospace;opacity:.7;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}}
section{{scroll-margin-top:80px}}
@media (max-width:700px){{.nav ul{{display:none}} .floater svg,.floater img{{width:96px;height:96px}} .floater.f2,.floater.f3{{display:none}}
 .floater.f0{{left:4vw;top:12vh}} .floater.f1{{right:4vw;top:14vh}} .hero .sub{{flex-direction:column;align-items:flex-start;bottom:6vh}}
 .reach .big{{font-size:28vw}}}}
"""

    body = f"""
<nav class="nav" aria-label="Hauptnavigation"><a class="logo" href="#top">{esc(brand)}</a>
<ul>{''.join(f'<li><a href="#{anchors[i] if i < 3 else "top"}">{esc(n)}</a></li>' for i, n in enumerate(nav[:4]))}</ul></nav>
<main id="top">
<section class="hero" data-blob-scope>
<svg class="blob" viewBox="0 0 800 600" aria-hidden="true"><path data-blob data-shapes="{shapes}" d="{first}" fill="{c['ink']}"/></svg>
{floaters}
<h1>{esc(hero.get('title') or brand)}</h1>
<div class="sub"><p>{esc(hero.get('subtitle') or b.get('tagline', ''))}</p>
{f'<a class="btn" href="{esc(cta.get("href", "#kontakt"))}">{esc(cta.get("label", "Los geht’s"))} {ICON["arrow"]}</a>' if cta or True else ''}</div>
</section>
<section class="manifesto" id="studio"><div class="kicker">{esc(about.get('kicker', 'Studio'))}</div>
<h2 data-lines>{esc(about.get('heading') or about.get('text', ''))}</h2>
{f'<p data-reveal style="max-width:60ch;font-size:19px;line-height:1.55;margin-top:32px">{esc(about.get("text"))}</p>' if about.get('heading') and about.get('text') else ''}
</section>
<section class="band" aria-hidden="true"><div class="row" data-sideways="-1">{''.join(f'<span>{esc(w)}</span>' for w in (b.get('marquee') or [brand, '✦', b.get('tagline', ''), '✦'] * 3))}</div></section>
<section class="mosaic" id="arbeit"><div class="grid" data-scatter>{tiles}</div></section>
<section class="work">{cards}</section>
{f'<section class="stats">{stat_html}</section>' if stats else ''}
</main>
<section class="reach" id="kontakt">
<svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,0 H1440 V40 C1200,120 1000,10 760,70 C520,130 300,20 0,80 Z" fill="{c['bg']}"/></svg>
<div class="big" data-sideways="-1">{esc(contact.get('heading', 'Reach out'))}&nbsp;{esc(contact.get('heading', 'Reach out'))}</div>
<div class="row2">{f'<a class="mail" href="mailto:{esc(email)}">{esc(email)}</a>' if email else ''}<div class="links">{link_html}</div></div>
<footer><span>{esc(b.get('footer') or f'© {brand}')}</span>{''.join(f'<a href="{esc(l.get("href"))}">{esc(l.get("label"))}</a>' for l in (b.get('legal') or []))}</footer>
</section>
"""
    return {"css": css, "body": body,
            "fonts": "family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700",
            "three": False}
