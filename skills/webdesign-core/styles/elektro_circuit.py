"""elektro-circuit: Website für Elektriker / Elektrotechnik. Dunkle Platine im Hintergrund (data-circuit):
beim Scrollen fließt Strom durch die Hauptleitung, ein Funke folgt dem Stromkopf, Abzweige und Lötpunkte/Chips
leuchten nacheinander auf. Leistungskarten schalten ihr Licht beim Einblenden ein (data-bulb, mit Flackern),
am Ende geht im Kontaktbereich die Glühbirne an."""
from _common import esc, ICON

# Hauptleitung (Platinen-Stil: senkrecht + 45°) in einem 1000x1000-Feld
MAIN = "M500 -10 V110 L360 250 V400 L560 600 H760 L840 680 V800 L660 980 V1010"
# Abzweige: (id, Pfad, Endbauteil 'pad'|'chip')
BRANCHES = [
    ("b1", "M500 70 H700 L780 150 V260", "chip"),
    ("b2", "M500 100 H300 L220 180 V250", "pad"),
    ("b3", "M360 300 H160 L100 360 V560", "chip"),
    ("b4", "M460 500 H600 L660 440 V340 L720 280", "pad"),
    ("b5", "M540 580 L480 640 H240 L160 720 V900", "chip"),
    ("b6", "M660 600 V700 L580 780 H420 L340 860 V940", "pad"),
    ("b7", "M760 600 L820 540 V420 H920", "chip"),
    ("b8", "M840 720 H940 V880", "pad"),
    ("b9", "M750 890 H880 L940 950", "pad"),
]


def _end(d):
    nums = [float(x) for x in __import__("re").findall(r"-?\d+(?:\.\d+)?", d)]
    # walk the path commands to get the last point
    import re
    x = y = 0.0
    for cmd, args in re.findall(r"([MLHV])([^MLHV]*)", d):
        a = [float(v) for v in args.split()]
        if cmd in "ML": x, y = a[-2], a[-1]
        elif cmd == "H": x = a[-1]
        elif cmd == "V": y = a[-1]
    return x, y


def circuit_svg():
    base = [f'<path d="{MAIN}"/>'] + [f'<path d="{d}"/>' for _, d, _ in BRANCHES]
    lit = [f'<path class="trace main" d="{MAIN}"/>'] + [f'<path class="trace" id="{i}" d="{d}"/>' for i, d, _ in BRANCHES]
    parts = []
    for i, d, kind in BRANCHES:
        x, y = _end(d)
        if kind == "chip":
            pins = "".join(f'<rect x="{x - 26 + k * 13:.0f}" y="{y - 26}" width="5" height="8"/><rect x="{x - 26 + k * 13:.0f}" y="{y + 18}" width="5" height="8"/>' for k in range(5))
            parts.append(f'<g class="node chip" data-trace="{i}" data-x="{x}" data-y="{y}"><g class="pins">{pins}</g>'
                         f'<rect class="body" x="{x - 32}" y="{y - 18}" width="64" height="36" rx="5"/>'
                         f'<circle class="led" cx="{x + 20}" cy="{y - 7}" r="4"/></g>')
        else:
            parts.append(f'<g class="node pad" data-trace="{i}" data-x="{x}" data-y="{y}"><circle class="ring" cx="{x}" cy="{y}" r="11"/>'
                         f'<circle class="core" cx="{x}" cy="{y}" r="4.5"/></g>')
    spark = ('<g class="spark" style="opacity:0"><circle r="26" class="halo"/><circle r="9" class="hot"/>'
             '<g class="rays"><path d="M0 -30V-16M0 16V30M-30 0H-16M16 0H30M-21 -21l9 9M12 12l9 9M21 -21l-9 9M-12 12l-9 9"/></g></g>')
    return ('<svg class="board" data-circuit viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
            f'<g class="base">{"".join(base)}</g><g class="lit">{"".join(lit)}</g><g class="nodes">{"".join(parts)}</g>{spark}</svg>')


S = 'viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
SERVICE_ICON = {
    "haus": f'<svg {S}><path d="M6 22 24 7l18 15"/><path d="M10 19v22h28V19"/><path d="M26 22l-6 9h7l-5 8"/></svg>',
    "licht": f'<svg {S}><path d="M24 4v6"/><path d="M14 34c-4-3-6-7-6-11a16 16 0 0 1 32 0c0 4-2 8-6 11"/><path d="M18 38h12M20 43h8"/><path class="glow" d="M24 16v10"/></svg>',
    "steckdose": f'<svg {S}><rect x="6" y="6" width="36" height="36" rx="9"/><circle cx="24" cy="24" r="11"/><circle cx="19" cy="24" r="1.8" fill="currentColor"/><circle cx="29" cy="24" r="1.8" fill="currentColor"/></svg>',
    "smarthome": f'<svg {S}><path d="M6 22 24 7l18 15"/><path d="M10 19v22h28V19"/><path d="M18 30a8 8 0 0 1 12 0M21 34a4 4 0 0 1 6 0"/></svg>',
    "emobil": f'<svg {S}><rect x="8" y="6" width="20" height="36" rx="4"/><path d="M14 14h8"/><path d="M28 20h6a4 4 0 0 1 4 4v10a3 3 0 0 0 6 0V18l-4-4"/><path d="M20 22l-4 7h5l-3 6"/></svg>',
    "netzwerk": f'<svg {S}><rect x="18" y="5" width="12" height="10" rx="2"/><rect x="5" y="33" width="12" height="10" rx="2"/><rect x="31" y="33" width="12" height="10" rx="2"/><path d="M24 15v9M11 33v-9h26v9"/></svg>',
    "schaltschrank": f'<svg {S}><rect x="9" y="4" width="30" height="40" rx="3"/><path d="M15 12h18M15 18h18"/><path d="M17 26v10M24 26v10M31 26v10"/></svg>',
    "pruefung": f'<svg {S}><path d="M24 4 8 10v12c0 10 7 18 16 22 9-4 16-12 16-22V10z"/><path d="M17 24l5 5 10-11"/></svg>',
}

BOLT = ('<svg class="bolt" viewBox="0 0 40 80" aria-hidden="true"><path d="M27 2 6 44h13L9 78l25-46H21L31 2z" fill="#F4A41C" stroke="#c9780a" stroke-width="1.5" stroke-linejoin="round"/></svg>')


def render(b, ctx):
    c = {"bg": "#0D0F13", "ink": "#F2F3F5", "red": "#D7262F", "amber": "#F4A41C", "grey": "#B8BCC4"}
    c.update(b.get("colors") or {})
    brand = b.get("brand", "Elektrobetrieb")
    contact = b.get("contact") or {}
    phone, phone_href = contact.get("phone", ""), contact.get("phone_href", "")
    email = contact.get("email", "")
    addr = contact.get("address", [])
    maps = contact.get("maps", "")
    hours = contact.get("hours", "")
    services = b.get("items") or []
    hero = b.get("hero") or {}
    about = b.get("about") or {}
    stats = b.get("stats") or []
    logo = b.get("logo") or {"lead": "e", "word": "lektrotechnik", "name": "Kolb", "suffix": "GmbH"}

    cards = "".join(f"""
<article class="svc panel" data-bulb data-reveal="{(i % 4) * 0.07:.2f}">
  <div class="wire"></div>
  <div class="ico">{SERVICE_ICON.get(s.get('icon', ''), SERVICE_ICON['haus'])}</div>
  <h3>{esc(s.get('title'))}</h3>
  {f'<p>{esc(s.get("text"))}</p>' if s.get('text') else ''}
</article>""" for i, s in enumerate(services))

    stat_html = "".join(f"""<div class="stat"><b><span data-count="{esc(st.get('value'))}">{esc(st.get('value'))}</span>{esc(st.get('suffix', ''))}</b><span>{esc(st.get('label'))}</span></div>""" for st in stats)
    marquee = "".join(f'<span>{esc(s.get("short") or s.get("title"))}</span>{BOLT}' for s in services)

    css = f"""
:root{{--bg:{c['bg']};--ink:{c['ink']};--red:{c['red']};--amber:{c['amber']};--grey:{c['grey']}}}
html{{background:var(--bg)}} body{{background:transparent;color:var(--ink);font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}}
.board{{position:fixed;inset:0;width:100%;height:100%;z-index:-2}}
.board .base path{{fill:none;stroke:#1f242c;stroke-width:7;stroke-linecap:round;stroke-linejoin:round}}
.board .lit path{{fill:none;stroke:var(--red);stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round}}
.board .lit path.main{{stroke:var(--amber);stroke-width:6}}
.board .lit{{filter:drop-shadow(0 0 5px rgba(244,164,28,.75)) drop-shadow(0 0 14px rgba(215,38,47,.55))}}
.node .ring{{fill:#14181e;stroke:#2b313a;stroke-width:4;transition:stroke .3s,fill .3s}}
.node .core{{fill:#2b313a;transition:fill .3s}}
.node.on .ring{{stroke:var(--amber);fill:#2a1a08}} .node.on .core{{fill:#fff}}
.node .body{{fill:#15191f;stroke:#2b313a;stroke-width:3;transition:stroke .3s}} .node .pins rect{{fill:#2b313a;transition:fill .3s}}
.node .led{{fill:#3a1114;transition:fill .2s}}
.node.on .body{{stroke:var(--red)}} .node.on .pins rect{{fill:var(--grey)}} .node.on .led{{fill:#ff4a4a;filter:drop-shadow(0 0 6px #ff3b3b)}}
.spark .halo{{fill:rgba(244,164,28,.28)}} .spark .hot{{fill:#fff;filter:drop-shadow(0 0 8px #ffd27a)}}
.spark .rays path{{stroke:#ffe2a0;stroke-width:3;stroke-linecap:round}}
.spark .rays{{animation:spin .5s steps(4) infinite}}
@keyframes spin{{to{{transform:rotate(90deg)}}}}
.vignette{{position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(120% 85% at 50% 40%,transparent 35%,rgba(0,0,0,.7))}}
.nav{{position:fixed;inset:0 0 auto;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:12px clamp(16px,4vw,44px);
  background:rgba(13,15,19,.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.06)}}
.nav .brand{{display:flex;align-items:center;gap:8px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:19px;text-decoration:none;color:var(--ink)}}
.nav .brand .bolt{{width:14px;height:28px}}
.nav .links{{display:flex;gap:22px;align-items:center;font-size:14px}} .nav .links a{{text-decoration:none;opacity:.85}}
.call{{display:inline-flex;align-items:center;gap:8px;background:var(--red);color:#fff;padding:12px 20px;border-radius:999px;font-weight:700;text-decoration:none;font-size:15px;box-shadow:0 8px 30px rgba(215,38,47,.45)}}
.ghost{{display:inline-flex;align-items:center;gap:8px;border:1.5px solid rgba(255,255,255,.35);color:var(--ink);padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;background:rgba(0,0,0,.35);backdrop-filter:blur(6px)}}
.hero{{min-height:100svh;display:grid;place-items:center;text-align:center;padding:110px 18px 80px}}
.plate{{display:inline-block;background:#fff;border-radius:22px;padding:clamp(14px,3vw,34px) clamp(14px,4vw,48px);max-width:100%;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.2);transform:rotate(-1.5deg)}}
.logo{{display:flex;align-items:flex-end;font-family:'Montserrat',sans-serif;font-weight:700;color:var(--red);line-height:1;position:relative}}
.logo .lead{{font-size:clamp(42px,9vw,118px);font-weight:800;line-height:.8}}
.logo .word{{font-size:clamp(19px,4.4vw,58px);letter-spacing:-.01em;padding-bottom:.08em}}
.logo .name{{font-size:clamp(28px,6vw,80px);font-weight:800;padding-bottom:.02em}}
.logo .suffix{{writing-mode:vertical-rl;transform:rotate(180deg);font-size:clamp(11px,1.3vw,16px);font-weight:700;margin-left:4px;padding-bottom:.4em}}
.logo .bolt{{width:clamp(22px,3vw,40px);height:auto;margin:0 4px -.25em;animation:zap 3.2s infinite}}
.logo::after{{content:"";position:absolute;left:.4em;right:2.2em;bottom:-8px;height:14px;background:#c9c9c9;z-index:-1;border-radius:2px}}
@keyframes zap{{0%,86%,100%{{opacity:1;filter:drop-shadow(0 0 0 transparent)}}88%{{opacity:.25}}90%{{opacity:1;filter:drop-shadow(0 0 10px #f4a41c)}}92%{{opacity:.4}}94%{{opacity:1;filter:drop-shadow(0 0 16px #f4a41c)}}}}
.hero h1{{font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(34px,5.6vw,76px);line-height:1.02;margin:46px auto 0;max-width:15ch;letter-spacing:-.02em}}
.hero h1 em{{font-style:normal;color:var(--amber)}}
.hero .sub{{font-size:clamp(17px,1.7vw,21px);opacity:.82;margin:18px auto 30px;max-width:52ch;line-height:1.5}}
.ctas{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
.hint{{margin-top:44px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;opacity:.6;display:flex;flex-direction:column;align-items:center;gap:10px}}
.hint i{{width:2px;height:44px;background:linear-gradient(var(--amber),transparent);animation:drip 1.6s infinite}}
@keyframes drip{{from{{transform:scaleY(0);transform-origin:top}}to{{transform:scaleY(1);transform-origin:top}}}}
.panel{{background:rgba(16,19,24,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.09);border-radius:26px}}
.intro{{max-width:1040px;margin:10vh auto;padding:clamp(26px,5vw,56px);display:grid;grid-template-columns:1.4fr 1fr;gap:34px;align-items:center}}
.intro h2{{text-wrap:balance;font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(28px,3.8vw,50px);line-height:1.08;margin:0}}
.intro p{{font-size:clamp(16px,1.5vw,19px);line-height:1.6;opacity:.82;margin:16px 0 0}}
.stats{{display:grid;gap:14px}}
.stat{{border-left:4px solid var(--red);padding:6px 0 6px 16px}}
.stat b{{display:block;font-family:'Montserrat',sans-serif;font-size:clamp(40px,5vw,64px);line-height:1;color:var(--amber)}}
.stat>span{{opacity:.8;font-size:15px}}
.services{{max-width:1240px;margin:0 auto 12vh;padding:0 clamp(16px,4vw,44px)}}
.services h2{{font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(32px,4.4vw,58px);margin:0 0 8px;text-shadow:0 3px 18px #000}}
.services .lede{{opacity:.75;margin:0 0 28px;font-size:17px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:16px}}
.svc{{position:relative;overflow:hidden;padding:28px 22px 24px;transition:border-color .4s,box-shadow .4s}}
.svc .wire{{position:absolute;left:0;top:0;height:4px;width:100%;background:#2b313a;overflow:hidden}}
.svc .wire::after{{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--red),var(--amber));transform:scaleX(0);transform-origin:left;transition:transform .7s ease}}
.svc .ico{{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:#1a1e25;color:#59606b;transition:color .3s,background .3s,box-shadow .3s}}
.svc h3{{font-family:'Montserrat',sans-serif;font-size:20px;margin:18px 0 8px;line-height:1.2}} .svc p{{margin:0;opacity:.75;line-height:1.55;font-size:15.5px}}
.svc.flick .ico{{animation:flick .56s steps(1)}}
@keyframes flick{{0%{{color:var(--amber);background:#2a1d08}}20%{{color:#59606b;background:#1a1e25}}35%{{color:var(--amber);background:#2a1d08}}50%{{color:#59606b;background:#1a1e25}}70%{{color:var(--amber);background:#2a1d08}}}}
.svc.on .ico{{color:#1a1205;background:var(--amber);box-shadow:0 0 30px rgba(244,164,28,.65)}}
.svc.on .wire::after{{transform:scaleX(1)}}
.svc.on{{border-color:rgba(244,164,28,.35)}}
.band{{overflow:hidden;padding:4vh 0;margin-bottom:12vh}}
.band div{{display:flex;align-items:center;gap:28px;white-space:nowrap;font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(40px,7vw,100px);color:transparent;-webkit-text-stroke:1.6px var(--ink)}}
.band .bolt{{width:clamp(22px,3vw,40px);flex:none}}
.contact{{max-width:1040px;margin:0 auto 8vh;padding:clamp(26px,5vw,56px);display:grid;grid-template-columns:1.2fr .8fr;gap:30px;align-items:center}}
.contact h2{{font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(30px,4vw,52px);margin:0 0 14px}}
.contact address{{font-style:normal;font-size:18px;line-height:1.6;opacity:.9}}
.contact .tel{{display:block;font-family:'Montserrat',sans-serif;font-size:clamp(28px,3.6vw,42px);font-weight:800;text-decoration:none;margin:14px 0 4px;color:#fff}}
.contact .mail{{color:var(--amber);font-weight:600}}
.contact .hours{{margin:12px 0 0;opacity:.75;font-size:15px}}
.contact .actions{{display:flex;flex-direction:column;gap:12px;align-items:stretch}}
.contact .actions a{{justify-content:center}}
.lamp{{display:grid;place-items:center;margin-bottom:8px}}
.lamp svg{{width:120px;height:auto}}
.lamp .glass{{fill:#1c2027;stroke:#59606b;stroke-width:3;transition:fill .4s,stroke .4s}}
.lamp .fil{{stroke:#59606b;stroke-width:3;fill:none;transition:stroke .3s}}
.lamp.flick .glass{{animation:lflick .56s steps(1)}}
@keyframes lflick{{0%,40%,80%{{fill:#ffe9a8}}20%,60%{{fill:#1c2027}}}}
.lamp.on .glass{{fill:#ffe39a;stroke:#f4a41c;filter:drop-shadow(0 0 28px rgba(255,200,80,.9))}} .lamp.on .fil{{stroke:#c56a00}}
footer{{text-align:center;padding:0 16px 6vh;font-size:13px;opacity:.7}}
@media (max-width:820px){{.nav .links a:not(.call){{display:none}} .intro,.contact{{grid-template-columns:1fr}} .logo::after{{bottom:-6px}}}}
"""
    lamp = ('<div class="lamp" data-bulb><svg viewBox="0 0 100 150" aria-hidden="true">'
            '<path class="glass" d="M50 8a38 38 0 0 0-22 69c6 5 8 11 8 17v6h28v-6c0-6 2-12 8-17A38 38 0 0 0 50 8z"/>'
            '<path class="fil" d="M40 100V70l5-10 5 10 5-10 5 10v30"/>'
            '<rect x="35" y="104" width="30" height="8" rx="3" fill="#8d939c"/><rect x="37" y="114" width="26" height="8" rx="3" fill="#8d939c"/>'
            '<path d="M42 124h16l-4 8h-8z" fill="#6b717a"/></svg></div>')
    body = f"""
{circuit_svg()}
<div class="vignette" aria-hidden="true"></div>
<nav class="nav" aria-label="Hauptnavigation"><a class="brand" href="#top">{BOLT}{esc(b.get('short_brand', brand))}</a>
<div class="links"><a href="#leistungen">Leistungen</a><a href="#kontakt">Kontakt</a>{f'<a class="call" href="{esc(phone_href)}">Anrufen</a>' if phone_href else ''}</div></nav>
<main id="top">
<section class="hero">
  <div>
    <div class="plate"><div class="logo" aria-label="{esc(brand)}"><span class="lead">{esc(logo['lead'])}</span><span class="word">{esc(logo['word'])}</span>{BOLT}<span class="name">{esc(logo['name'])}</span><span class="suffix">{esc(logo.get('suffix', ''))}</span></div></div>
    <h1 data-lines>{hero.get('title_html') or esc(hero.get('title', brand))}</h1>
    <p class="sub">{esc(hero.get('subtitle', ''))}</p>
    <div class="ctas">{f'<a class="call" href="{esc(phone_href)}">Jetzt anrufen · {esc(phone)}</a>' if phone else ''}<a class="ghost" href="#leistungen">Leistungen {ICON['arrow']}</a></div>
    <div class="hint" aria-hidden="true">Scrollen – Strom an<i></i></div>
  </div>
</section>
<section class="intro panel"><div><h2 data-lines>{esc(about.get('heading', ''))}</h2>
{f'<p data-reveal>{esc(about.get("text"))}</p>' if about.get('text') else ''}</div>
<div class="stats">{stat_html}</div></section>
<section class="services" id="leistungen"><h2 data-lines>Leistungen</h2>
{f'<p class="lede">{esc(b.get("services_lede"))}</p>' if b.get('services_lede') else ''}<div class="grid">{cards}</div></section>
<section class="band" aria-hidden="true"><div data-sideways="-1">{marquee * 3}</div></section>
<section class="contact panel" id="kontakt">
  <div><h2 data-lines>Kontakt</h2><address>{'<br>'.join(esc(a) for a in addr)}</address>
  {f'<a class="tel" href="{esc(phone_href)}">{esc(phone)}</a>' if phone else ''}
  {f'<a class="mail" href="mailto:{esc(email)}">{esc(email)}</a>' if email else ''}
  {f'<p class="hours">{esc(hours)}</p>' if hours else ''}</div>
  <div class="actions">{lamp}{f'<a class="call" href="{esc(phone_href)}">Jetzt anrufen</a>' if phone_href else ''}
  {f'<a class="ghost" href="{esc(maps)}" target="_blank" rel="noopener">Route planen {ICON["arrow"]}</a>' if maps else ''}</div>
</section>
</main>
<footer>{esc(b.get('footer') or f'© {brand}')}{''.join(f' · <a href="{esc(l.get("href"))}">{esc(l.get("label"))}</a>' for l in (b.get('legal') or []))}</footer>
"""
    return {"css": css, "body": body,
            "fonts": "family=Montserrat:wght@700;800&family=Inter:wght@400;600;700",
            "three": False}
