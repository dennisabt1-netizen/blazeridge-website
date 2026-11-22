"""glass-product: calm premium product / app case-study look — soft blue-to-coral gradients,
frosted glass cards, a CSS phone mockup with app UI, dot-matrix numbers, a procedural 3D product
(three.js, no paid Spline) that turns while you scroll."""
from _common import esc, ICON, links


def render(b, ctx):
    c = {"bg": "#EEF0F3", "ink": "#0E1116", "a1": "#2F7BFF", "a2": "#FF6B5A", "a3": "#9AD7FF"}
    c.update(b.get("colors") or {})
    brand = b.get("brand", "Product")
    hero = b.get("hero") or {}
    about = b.get("about") or {}
    items = b.get("items") or []
    stats = b.get("stats") or []
    contact = b.get("contact") or {}
    app = b.get("app") or {}
    model = b.get("model", "bottle")
    cta = hero.get("cta") or {"label": "Mehr erfahren", "href": "#features"}

    pills = "".join(
        f'<div class="pill p{i % 3}"><span class="dot">{esc(s.get("value"))}</span><small>{esc(s.get("label"))}</small></div>'
        for i, s in enumerate((app.get("metrics") or stats)[:3]))

    phone = f"""
<div class="phone" data-tilt aria-label="App-Ansicht">
  <div class="notch"></div>
  <div class="screen">
    <div class="top"><span>9:41</span><span class="chip">{esc(app.get('name') or brand)}</span><span>●●</span></div>
    <div class="graph glass">
      <small>{esc(app.get('chart_label', 'Heute'))}</small>
      <svg viewBox="0 0 200 70" data-draw><path d="M5 60 C40 60 50 10 100 12 S160 60 195 58" fill="none" stroke="#fff" stroke-width="2.5"/></svg>
    </div>
    <div class="pills">{pills}<div class="pill add">{ICON['plus']}</div></div>
    <div class="go">{esc(app.get('action', 'Start'))}</div>
  </div>
</div>"""

    features = "".join(f"""
<section class="feature {'rev' if i % 2 else ''}">
  <div class="copy"><span class="idx">{i + 1:02d}</span><h3 data-lines>{esc(it.get('title'))}</h3><p data-reveal>{esc(it.get('text', ''))}</p></div>
  <div class="visual glass" data-card-zoom>
    {f'<img src="{esc(it["image"])}" alt="{esc(it.get("title"))}" loading="lazy">' if it.get('image') else f'<div class="orb o{i % 3}"></div><div class="big dot">{esc(it.get("metric", f"{i + 1:02d}"))}</div><small>{esc(it.get("tag", ""))}</small>'}
  </div>
</section>""" for i, it in enumerate(items))

    stat_html = "".join(
        f'<div class="stat glass" data-reveal="{i * 0.08:.2f}"><strong class="dot" data-count="{esc(s.get("value"))}">0</strong><span>{esc(s.get("label"))}</span></div>'
        for i, s in enumerate(stats))
    link_html = "".join(f'<a href="{esc(l.get("href"))}">{esc(l.get("label"))}</a>' for l in links(b))

    css = f"""
:root{{--bg:{c['bg']};--ink:{c['ink']};--a1:{c['a1']};--a2:{c['a2']};--a3:{c['a3']}}}
html{{background:var(--bg)}} body{{background:transparent;color:var(--ink);font-family:'Manrope',system-ui,sans-serif}}
body{{overflow-x:hidden}}
.dot{{font-family:'Doto','Space Mono',monospace;font-weight:800;letter-spacing:.02em}}
.glass{{background:linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,.18));border:1px solid rgba(255,255,255,.7);
  box-shadow:0 30px 60px -30px rgba(20,30,60,.35),inset 0 1px 0 rgba(255,255,255,.8);backdrop-filter:blur(22px) saturate(1.4);-webkit-backdrop-filter:blur(22px) saturate(1.4)}}
.bgfx{{position:fixed;inset:0;z-index:-1;overflow:hidden}}
.bgfx i{{position:absolute;border-radius:50%;filter:blur(80px);opacity:.75}}
.bgfx i:nth-child(1){{width:55vw;height:55vw;background:var(--a1);left:-15vw;top:-10vw}}
.bgfx i:nth-child(2){{width:45vw;height:45vw;background:var(--a2);right:-12vw;top:30vh}}
.bgfx i:nth-child(3){{width:40vw;height:40vw;background:var(--a3);left:20vw;bottom:-20vw}}
.nav{{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:50;display:flex;gap:28px;align-items:center;padding:12px 14px 12px 22px;border-radius:999px;font-size:14px}}
.nav b{{font-weight:800;letter-spacing:-.01em}} .nav a{{text-decoration:none;opacity:.75}} .nav a:hover{{opacity:1}}
.nav .cta{{opacity:1;background:var(--ink);color:#fff;padding:10px 16px;border-radius:999px}}
.hero{{min-height:100svh;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:4vw;padding:120px clamp(16px,6vw,96px) 60px}}
.hero h1{{font-size:clamp(44px,6.6vw,104px);line-height:.98;letter-spacing:-.045em;font-weight:300;margin:0}}
.hero h1 em{{font-style:normal;font-weight:700;background:linear-gradient(90deg,var(--a1),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}}
.hero p{{font-size:clamp(17px,1.5vw,21px);line-height:1.55;max-width:44ch;opacity:.75;margin:28px 0 36px}}
.btn{{display:inline-flex;gap:10px;align-items:center;background:var(--ink);color:#fff;text-decoration:none;padding:16px 24px;border-radius:999px;font-weight:600}}
.stage{{position:relative;height:min(78vh,760px)}}
.stage .three{{position:absolute;inset:0}}
.phone{{position:absolute;right:2%;bottom:0;width:min(270px,58%);aspect-ratio:9/19;border-radius:44px;background:#0b0d12;padding:10px;box-shadow:0 50px 90px -30px rgba(0,0,0,.55);transform-style:preserve-3d}}
.phone .notch{{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:34%;height:22px;border-radius:20px;background:#000;z-index:2}}
.screen{{height:100%;border-radius:34px;overflow:hidden;padding:44px 14px 14px;color:#fff;display:flex;flex-direction:column;gap:12px;
  background:radial-gradient(120% 70% at 20% 10%,var(--a1),transparent 60%),radial-gradient(90% 60% at 90% 90%,var(--a2),transparent 60%),#10131b}}
.screen .top{{display:flex;justify-content:space-between;align-items:center;font-size:11px;opacity:.85}}
.screen .chip{{background:rgba(255,255,255,.18);padding:5px 10px;border-radius:999px}}
.screen .graph{{border-radius:22px;padding:12px;color:#fff;background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.25)}}
.screen .graph small{{font-size:10px;opacity:.8}}
.pills{{display:grid;grid-template-columns:1fr 1fr;gap:8px}}
.pill{{border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:4px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.25)}}
.pill .dot{{font-size:22px}} .pill small{{font-size:9px;opacity:.8}}
.pill.p0{{background:linear-gradient(135deg,rgba(255,107,90,.9),rgba(255,170,90,.7))}}
.pill.p1{{background:linear-gradient(135deg,rgba(47,123,255,.85),rgba(154,215,255,.6))}}
.pill.add{{align-items:center;justify-content:center;background:#fff;color:#111}}
.go{{margin-top:auto;text-align:center;background:#fff;color:#111;border-radius:999px;padding:12px;font-weight:700;font-size:13px}}
.intro{{padding:16vh clamp(16px,6vw,96px)}}
.intro h2{{font-size:clamp(30px,4.4vw,68px);font-weight:300;letter-spacing:-.03em;line-height:1.08;max-width:24ch;margin:0}}
.feature{{display:grid;grid-template-columns:1fr 1fr;gap:6vw;align-items:center;padding:10vh clamp(16px,6vw,96px)}}
.feature.rev .copy{{order:2}}
.feature .idx{{font-family:'Doto',monospace;font-weight:800;color:var(--a1)}}
.feature h3{{font-size:clamp(30px,3.6vw,56px);letter-spacing:-.035em;font-weight:500;line-height:1.02;margin:14px 0 18px}}
.feature p{{font-size:18px;line-height:1.6;opacity:.75;max-width:42ch}}
.visual{{position:relative;aspect-ratio:4/3;border-radius:36px;overflow:hidden;display:grid;place-items:center}}
.visual img{{width:100%;height:100%;object-fit:cover}}
.visual .orb{{position:absolute;width:70%;aspect-ratio:1;border-radius:50%;filter:blur(30px)}}
.orb.o0{{background:radial-gradient(circle at 30% 30%,var(--a2),var(--a1))}} .orb.o1{{background:radial-gradient(circle at 70% 40%,var(--a3),var(--a1))}} .orb.o2{{background:radial-gradient(circle,var(--a2),#ffd29a)}}
.visual .big{{position:relative;font-size:clamp(70px,10vw,150px);color:#fff;text-shadow:0 10px 40px rgba(0,0,0,.2)}}
.visual small{{position:absolute;bottom:22px;left:26px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#fff}}
.stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:18px;padding:8vh clamp(16px,6vw,96px) 14vh}}
.stat{{border-radius:28px;padding:28px}} .stat strong{{display:block;font-size:clamp(48px,6vw,84px);line-height:1}} .stat span{{opacity:.7}}
.end{{margin:0 clamp(16px,4vw,48px) 4vh;border-radius:44px;padding:14vh clamp(20px,6vw,96px);text-align:center;color:#fff;
  background:radial-gradient(80% 120% at 10% 0%,var(--a1),transparent 60%),radial-gradient(80% 120% at 100% 100%,var(--a2),transparent 60%),#0e1116}}
.end h2{{font-size:clamp(40px,6vw,96px);letter-spacing:-.04em;font-weight:300;margin:0 0 30px}}
.end .btn{{background:#fff;color:#111}}
.end .links{{margin-top:40px;display:flex;justify-content:center;gap:24px;flex-wrap:wrap;opacity:.8}}
footer{{text-align:center;padding:0 0 6vh;font-size:13px;opacity:.6}}
@media (max-width:860px){{.hero,.feature{{grid-template-columns:1fr}} .feature.rev .copy{{order:0}} .stage{{height:70vh}} .nav a:not(.cta){{display:none}}}}
"""
    title = esc(hero.get("title") or brand)
    hl = hero.get("highlight")
    if hl and hl in (hero.get("title") or ""):
        title = title.replace(esc(hl), f"<em>{esc(hl)}</em>", 1)
    body = f"""
<div class="bgfx" aria-hidden="true"><i data-parallax="0.6"></i><i data-parallax="-0.4"></i><i data-parallax="0.3"></i></div>
<nav class="nav glass" aria-label="Hauptnavigation"><b>{esc(brand)}</b>
{''.join(f'<a href="#{["features","zahlen","kontakt"][i] if i < 3 else "top"}">{esc(n)}</a>' for i, n in enumerate((b.get('nav') or ['Funktionen', 'Zahlen', 'Kontakt'])[:3]))}
<a class="cta" href="{esc(cta.get('href'))}">{esc(cta.get('label'))}</a></nav>
<main id="top" data-three-scope>
<section class="hero">
  <div><h1 data-lines>{title}</h1><p data-reveal>{esc(hero.get('subtitle') or b.get('tagline', ''))}</p>
  <a class="btn" href="{esc(cta.get('href'))}">{esc(cta.get('label'))} {ICON['arrow']}</a></div>
  <div class="stage"><div class="three" data-three="{esc(model)}" data-color="{c['a1']}"></div>{phone}</div>
</section>
<section class="intro"><h2 data-lines>{esc(about.get('heading') or about.get('text', ''))}</h2></section>
<div id="features">{features}</div>
{f'<section class="stats" id="zahlen">{stat_html}</section>' if stats else ''}
<section class="end" id="kontakt"><h2 data-lines>{esc(contact.get('heading', 'Bereit?'))}</h2>
{f'<a class="btn" href="mailto:{esc(contact.get("email"))}">{esc(contact.get("email"))} {ICON["arrow"]}</a>' if contact.get('email') else ''}
<div class="links">{link_html}</div></section>
</main>
<footer>{esc(b.get('footer') or f'© {brand}')}{''.join(f' · <a href="{esc(l.get("href"))}">{esc(l.get("label"))}</a>' for l in (b.get('legal') or []))}</footer>
"""
    return {"css": css, "body": body,
            "fonts": "family=Manrope:wght@300;400;500;600;700;800&family=Doto:wght@800",
            "three": True}
