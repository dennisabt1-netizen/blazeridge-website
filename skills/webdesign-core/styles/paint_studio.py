"""paint-studio: Website für Maler & Handwerk. Schwarze Wand im Hintergrund, die beim Scrollen
von einer Farbrolle Bahn für Bahn gestrichen wird (data-paintwall), Monogramm mit Farbklecksen,
Leistungskarten mit Pinselstrich-Reveal (data-swipe), Kontakt mit Anruf-Button."""
from _common import esc, ICON


def splat(color, size=46, k=0):
    import math
    pts = []
    for i in range(22):
        a = i / 22 * 2 * math.pi
        r = 50 if i % 2 == 0 else 30 + (i * 7 + k * 13) % 12
        pts.append(f"{50 + math.cos(a) * r:.1f},{50 + math.sin(a) * r:.1f}")
    return (f'<svg class="splat" viewBox="0 0 100 100" width="{size}" height="{size}" aria-hidden="true">'
            f'<polygon points="{" ".join(pts)}" fill="{color}"/>'
            f'<polygon points="{" ".join(pts)}" fill="url(#hatch)" opacity=".35"/></svg>')


SERVICE_ICON = {
    "innen": '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="6" width="28" height="11" rx="3"/><path d="M34 11h6v12H22v7"/><rect x="18" y="30" width="8" height="13" rx="2"/></svg>',
    "fassade": '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><path d="M6 22 24 7l18 15"/><path d="M10 19v22h28V19"/><rect x="20" y="29" width="8" height="12"/></svg>',
    "deko": '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 14c6-6 12 6 19 0s13 6 19 0M5 26c6-6 12 6 19 0s13 6 19 0M5 38c6-6 12 6 19 0s13 6 19 0"/></svg>',
    "boden": '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M4 34 24 24l20 10-20 10z"/><path d="M14 39l20-10M9 36.5l20-10"/></svg>',
}


def wall_svg(colors, passes=8):
    """Roller passes across a 1000x1000 wall, alternating direction, each pass = 6 bristle strokes."""
    out = []
    for i in range(passes):
        y = 70 + i * (860 / (passes - 1))
        col = colors[i % len(colors)]
        fwd = i % 2 == 0
        x0, x1 = (-80, 1080) if fwd else (1080, -80)
        bristles = []
        for j, (dy, w, op) in enumerate([(-46, 26, .55), (-28, 30, .9), (-8, 34, 1), (12, 32, .95), (32, 28, .85), (50, 18, .5)]):
            yy = y + dy
            wob = 14 if fwd else -14
            d = f"M{x0} {yy:.1f} C {x0 + (x1 - x0) * .3:.1f} {yy - wob:.1f}, {x0 + (x1 - x0) * .7:.1f} {yy + wob:.1f}, {x1} {yy + (j % 3 - 1) * 4:.1f}"
            bristles.append(f'<path d="{d}" stroke="{col}" stroke-width="{w}" stroke-opacity="{op}" fill="none" stroke-linecap="round"/>')
        out.append(f'<g class="pass">{"".join(bristles)}</g>')
    roller = ('<g class="roller" style="opacity:0">'
              '<path d="M-6 -82 V-104 H-70 V40 L-104 128" fill="none" stroke="#C9CBD1" stroke-width="9" stroke-linejoin="round"/>'
              '<rect x="-126" y="118" width="26" height="70" rx="11" transform="rotate(-20 -113 153)" fill="#2a2a30" stroke="#C9CBD1" stroke-width="4"/>'
              '<rect x="-16" y="-84" width="32" height="168" rx="14" fill="#EDEFF3" stroke="#9fa3ab" stroke-width="4"/>'
              '<path d="M-8 -70 V70 M0 -70 V70 M8 -70 V70" stroke="#c7cad1" stroke-width="2"/></g>')
    return (f'<svg class="wall" data-paintwall viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
            f'{"".join(out)}{roller}</svg>')


def render(b, ctx):
    c = {"bg": "#0B0B0D", "ink": "#F3F3F5", "silver": "#C9CBD1",
         "splats": ["#F2E14B", "#B48CF2", "#4FD8C4", "#6BE36B", "#6FB7FF"]}
    c.update(b.get("colors") or {})
    sp = c["splats"]
    brand = b.get("brand", "Malerbetrieb")
    owner = b.get("owner", "")
    title = b.get("title", "Malermeister")
    contact = b.get("contact") or {}
    phone, phone_href = contact.get("phone", ""), contact.get("phone_href", "")
    addr = contact.get("address", [])
    maps = contact.get("maps", "")
    services = b.get("items") or []
    mono = b.get("monogram", ["M", "A"])
    hero_sub = (b.get("hero") or {}).get("subtitle", "")

    cards = "".join(f"""
<article class="svc panel" data-reveal="{i * 0.08:.2f}">
  <div class="bar" data-swipe style="--c:{sp[i % len(sp)]}"></div>
  <div class="ico" style="color:{sp[i % len(sp)]}">{SERVICE_ICON.get(s.get('icon', ''), SERVICE_ICON['innen'])}</div>
  <h3>{esc(s.get('title'))}</h3>
  {f'<p>{esc(s.get("text"))}</p>' if s.get('text') else ''}
</article>""" for i, s in enumerate(services))

    splats = "".join(f'<span class="sp s{i}" style="--d:{i * 0.12:.2f}s">{splat(col, 54, i)}</span>' for i, col in enumerate(sp))
    marquee = " · ".join(esc(s.get("title")) for s in services) + " · "

    css = f"""
:root{{--bg:{c['bg']};--ink:{c['ink']};--silver:{c['silver']};--y:{sp[0]};--v:{sp[1]};--t:{sp[2]};--g:{sp[3]};--b:{sp[4]}}}
html{{background:var(--bg)}} body{{background:transparent;color:var(--ink);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}}
.wall{{position:fixed;inset:0;width:100%;height:100%;z-index:-1;opacity:.92}}
.wallshade{{position:fixed;inset:0;z-index:-1;background:radial-gradient(120% 80% at 50% 40%,transparent 40%,rgba(0,0,0,.55));pointer-events:none}}
.nav{{position:fixed;inset:0 0 auto;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(16px,4vw,44px);
  background:linear-gradient(rgba(11,11,13,.85),rgba(11,11,13,0))}}
.nav .mono{{font-family:'Cinzel',serif;font-weight:700;font-size:22px;letter-spacing:.12em;color:var(--silver);text-decoration:none}}
.nav .links{{display:flex;gap:22px;align-items:center;font-size:14px}} .nav .links a{{text-decoration:none;opacity:.85}}
.call{{display:inline-flex;align-items:center;gap:8px;background:var(--ink);color:#111;padding:11px 18px;border-radius:999px;font-weight:600;text-decoration:none;font-size:14px}}
.hero{{min-height:100svh;display:grid;place-items:center;text-align:center;padding:110px 18px 70px;position:relative}}
.logo{{display:grid;grid-template-columns:auto auto;align-items:center;gap:clamp(10px,3vw,40px);margin:0 auto}}
.logo .M,.logo .A{{font-family:'Cinzel',serif;font-weight:700;font-size:clamp(110px,20vw,260px);line-height:.85;color:#fff;
  text-shadow:4px 5px 0 rgba(0,0,0,.6),0 0 1px var(--silver);background:linear-gradient(180deg,#fff,#c9cbd1 60%,#8d9098);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}}
.splats{{display:flex;gap:6px;justify-content:center;align-items:flex-end;margin:6px 0 2px}}
.sp{{display:inline-block;animation:pop .7s cubic-bezier(.3,1.6,.5,1) both;animation-delay:calc(.4s + var(--d))}}
.sp.s0{{transform:translateY(18px)}} .sp.s1{{transform:translateY(30px)}} .sp.s2{{transform:translateY(22px)}} .sp.s3{{transform:translateY(6px)}} .sp.s4{{transform:translateY(-10px)}}
@keyframes pop{{from{{opacity:0;scale:.2;rotate:-40deg}}to{{opacity:1;scale:1;rotate:0deg}}}}
.script{{font-family:'Great Vibes',cursive;font-size:clamp(54px,9vw,120px);line-height:1;margin:8px 0 0;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.6)}}
.owner{{font-family:'Great Vibes',cursive;font-size:clamp(34px,5vw,58px);color:var(--silver);margin:14px 0 0}}
.title{{font-family:'Cinzel',serif;font-weight:700;letter-spacing:.18em;font-size:clamp(18px,2.4vw,28px);margin:4px 0 0}}
.place{{opacity:.75;margin:10px 0 30px;font-size:16px}}
.ctas{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
.ghost{{display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--silver);color:var(--ink);padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;background:rgba(0,0,0,.35);backdrop-filter:blur(6px)}}
.panel{{background:rgba(11,11,13,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);border-radius:28px}}
.intro{{max-width:980px;margin:12vh auto;padding:clamp(26px,5vw,56px)}}
.intro h2{{font-family:'Cinzel',serif;font-weight:700;font-size:clamp(28px,4.4vw,56px);line-height:1.1;margin:0}}
.intro p{{font-size:clamp(17px,1.6vw,20px);line-height:1.6;opacity:.82;margin:18px 0 0;max-width:56ch}}
.services{{max-width:1180px;margin:0 auto 12vh;padding:0 clamp(16px,4vw,44px)}}
.services h2{{font-family:'Cinzel',serif;font-size:clamp(30px,4vw,52px);margin:0 0 26px;text-shadow:0 3px 18px rgba(0,0,0,.8)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:18px}}
.svc{{position:relative;overflow:hidden;padding:30px 24px 26px}}
.svc .bar{{position:absolute;left:0;top:0;height:12px;width:100%;background:var(--c);border-radius:0 0 30px 0}}
.svc h3{{font-size:22px;margin:16px 0 8px;line-height:1.2}} .svc p{{margin:0;opacity:.78;line-height:1.55}}
.band{{overflow:hidden;padding:5vh 0;margin-bottom:12vh}}
.band div{{font-family:'Cinzel',serif;font-weight:700;font-size:clamp(46px,8vw,120px);white-space:nowrap;color:transparent;-webkit-text-stroke:2px var(--ink);text-shadow:none}}
.contact{{max-width:980px;margin:0 auto 8vh;padding:clamp(26px,5vw,56px);display:grid;grid-template-columns:1.1fr .9fr;gap:30px;align-items:center}}
.contact h2{{font-family:'Cinzel',serif;font-size:clamp(30px,4vw,52px);margin:0 0 14px}}
.contact address{{font-style:normal;font-size:19px;line-height:1.6}}
.contact .tel{{display:block;font-size:clamp(28px,4vw,44px);font-weight:700;text-decoration:none;margin:14px 0 6px;color:#fff}}
.contact .actions{{display:flex;flex-direction:column;gap:12px}}
.contact .actions a{{justify-content:center}}
footer{{text-align:center;padding:0 16px 6vh;font-size:13px;opacity:.7;text-shadow:0 2px 8px #000}}
footer a{{margin:0 6px}}
@media (max-width:760px){{.nav .links a:not(.call){{display:none}} .contact{{grid-template-columns:1fr}} .splats .splat{{width:38px;height:38px}}}}
"""
    body = f"""
{wall_svg(sp)}
<div class="wallshade" aria-hidden="true"></div>
<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs><pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 4 4 0" stroke="#000" stroke-width="1"/></pattern></defs></svg>
<nav class="nav" aria-label="Hauptnavigation"><a class="mono" href="#top">{esc(''.join(mono))}</a>
<div class="links"><a href="#leistungen">Leistungen</a><a href="#kontakt">Kontakt</a>{f'<a class="call" href="{esc(phone_href)}">Anrufen</a>' if phone_href else ''}</div></nav>
<main id="top">
<section class="hero">
  <div>
    <div class="logo" aria-label="{esc(brand)}"><span class="M">{esc(mono[0])}</span><span class="A">{esc(mono[1])}</span></div>
    <div class="splats">{splats}</div>
    <h1 class="script">{esc(b.get('wordmark', brand))}</h1>
    {f'<p class="owner">{esc(owner)}</p>' if owner else ''}
    <p class="title">{esc(title)}</p>
    <p class="place">{esc(hero_sub)}</p>
    <div class="ctas">{f'<a class="call" href="{esc(phone_href)}">Jetzt anrufen · {esc(phone)}</a>' if phone else ''}<a class="ghost" href="#leistungen">Leistungen {ICON['arrow']}</a></div>
  </div>
</section>
<section class="intro panel"><h2 data-lines>{esc((b.get('about') or {}).get('heading', ''))}</h2>
{f'<p data-reveal>{esc((b.get("about") or {}).get("text"))}</p>' if (b.get('about') or {}).get('text') else ''}</section>
<section class="services" id="leistungen"><h2 data-lines>Leistungen</h2><div class="grid">{cards}</div></section>
<section class="band" aria-hidden="true"><div data-sideways="-1">{marquee * 3}</div></section>
<section class="contact panel" id="kontakt">
  <div><h2 data-lines>Kontakt</h2><address>{'<br>'.join(esc(a) for a in addr)}</address>
  {f'<a class="tel" href="{esc(phone_href)}">{esc(phone)}</a>' if phone else ''}</div>
  <div class="actions">{f'<a class="call" href="{esc(phone_href)}">Jetzt anrufen</a>' if phone_href else ''}
  {f'<a class="ghost" href="{esc(maps)}" target="_blank" rel="noopener">Route planen {ICON["arrow"]}</a>' if maps else ''}</div>
</section>
</main>
<footer>{esc(b.get('footer') or f'© {brand}')}{''.join(f' · <a href="{esc(l.get("href"))}">{esc(l.get("label"))}</a>' for l in (b.get('legal') or []))}</footer>
"""
    return {"css": css, "body": body,
            "fonts": "family=Cinzel:wght@700&family=Great+Vibes&family=Inter:wght@400;600;700",
            "three": False}
