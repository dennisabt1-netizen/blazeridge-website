"""neon-hypermotion: Marken-Website im Neon-/Feuer-Look (Vorlage: BlazeRidge-Logo).
Hero mit Logo, aufsteigender Glut (Canvas), 3D-Schriftzug, der beim Scrollen auseinanderfliegt.
Signatur: gepinnte iMac-Szene (data-imac) – beim Scrollen geht ein All-in-One-Monitor an, Neonlicht dahinter,
ein Browser öffnet die echte Website (Screenshots), der Mauszeiger scrollt, klickt 'Shop now', kauft alles ('Buy all'),
Danke-Seite mit Funkenregen. Danach Angebot (Neon-Karten), Kennzahlen, Kanäle."""
import base64, json
from pathlib import Path
from _common import esc, ICON


def data_uri(path, base):
    p = Path(path)
    if not p.is_absolute():
        p = Path(base) / p
    mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()


CURSOR = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 11-6.6 1.2L16 21l-3 1.4-3.6-6.9L4 20z" '
          'fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>')


def render(b, ctx):
    base = b.get("_dir", ".")
    c = {"bg": "#070405", "fire": "#FF6A00", "amber": "#FFB020", "yellow": "#FFD54A", "red": "#E8420F",
         "pink": "#FF2E88", "violet": "#7B3CFF"}
    c.update(b.get("colors") or {})
    brand = b.get("brand", "Brand")
    words = b.get("wordmark", ["BLAZE", "RIDGE"])
    hero = b.get("hero") or {}
    im = b.get("imac") or {}
    pages = im.get("pages") or {}
    W = im.get("w", 1600)
    VH = im.get("vh", 900)
    logo = data_uri(b["logo_img"], base) if b.get("logo_img") else ""

    # --- iMac screen layers -------------------------------------------------------------------
    layers, checks = [], []
    for k, (name, pg) in enumerate(pages.items()):
        h = pg["h"]
        marks = ""
        for st in im.get("steps", []):
            if st.get("cart") and st.get("page_of", name) == name and st.get("_page") == name:
                pass
        layers.append(f'<div class="pg" data-page="{esc(name)}" style="aspect-ratio:{W}/{h};opacity:{1 if k == 0 else 0}">'
                      f'<img src="{data_uri(pg["img"], base)}" alt="" width="{W}" height="{h}"><div class="ov" data-ov="{esc(name)}"></div></div>')
    steps = im.get("steps", [])
    labels = sorted({s["label"] for s in steps if s.get("label")})
    bubbles = "".join(f'<span class="bubble" data-l="{esc(l)}">{esc(l)}</span>' for l in labels)
    caps = im.get("captions") or []
    cap_html = "".join(f'<div class="cap" data-cap="{i}"><b>{i + 1:02d}</b><span>{esc(t)}</span></div>' for i, t in enumerate(caps))
    sparks = "".join(f'<i style="--a:{i * 30}deg;--c:{[c["fire"], c["amber"], c["pink"], c["yellow"]][i % 4]}"></i>' for i in range(12))

    imac = f"""
<section class="imac-scene" data-imac data-fx="iMac">
  <div class="neon-bg" aria-hidden="true"><div class="rays"></div><div class="floor"></div></div>
  <div class="caps">{cap_html}</div>
  <div class="imac" aria-label="Animierte Vorschau: {esc(im.get('url', ''))} im Browser">
    <div class="bezel"><div class="screen">
      <div class="wall"></div>
      <div class="boot">{f'<img src="{logo}" alt="">' if logo else ''}</div>
      <div class="browser">
        <div class="chrome"><i></i><i></i><i></i><div class="url">🔒 {esc(im.get('url', ''))}</div>
          <div class="cart" aria-hidden="true">🛒<span class="n">{''.join(f'<em data-n="{n}">{n}</em>' for n in range(0, 5))}</span></div></div>
        <div class="view" style="aspect-ratio:{W}/{VH}">{''.join(layers)}
          <div class="cursor">{CURSOR}{bubbles}<span class="ripple"></span></div>
          <div class="burst">{sparks}</div>
        </div>
      </div>
      <div class="dock"><i></i><i></i><i class="on"></i><i></i><i></i></div>
      <div class="off"></div><div class="flash"></div>
    </div></div>
    <div class="chin"></div><div class="neck"></div><div class="foot"></div>
  </div>
</section>"""

    prods = b.get("products") or []
    cards = "".join(f"""
<article class="prod" style="--h:{(i * 47) % 360}deg">
  <span class="tag">{esc(p.get('tag', ''))}</span>
  <h3>{esc(p['name'])}</h3>
  <div class="price">{esc(p['price'])}</div>
  <p>{esc(p.get('text', ''))}</p>
</article>""" for i, p in enumerate(prods))
    stats = "".join(f'<div class="stat"><b data-count="{esc(s["value"])}">{esc(s["value"])}</b><span>{esc(s["label"])}</span></div>' for s in b.get("stats") or [])
    chans = "".join(f'<a class="chan" href="{esc(ch["href"])}" target="_blank" rel="noopener"><span>{esc(ch["name"])}</span><b>{esc(ch["handle"])}</b>{ICON["arrow"]}</a>' for ch in b.get("channels") or [])
    marquee = "".join(f"<span>{esc(t)}</span><i>✦</i>" for t in b.get("marquee") or [])

    css = f"""
:root{{--bg:{c['bg']};--fire:{c['fire']};--amber:{c['amber']};--yellow:{c['yellow']};--red:{c['red']};--pink:{c['pink']};--violet:{c['violet']}}}
@property --ang{{syntax:'<angle>';inherits:false;initial-value:0deg}}
html{{background:var(--bg)}} body{{background:var(--bg);color:#fff;font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}}
.nav{{position:fixed;inset:0 0 auto;z-index:60;display:flex;justify-content:space-between;align-items:center;padding:12px clamp(16px,4vw,44px);
  background:rgba(7,4,5,.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,106,0,.18)}}
.nav .b{{font-family:'Montserrat',sans-serif;font-weight:900;letter-spacing:.04em;text-decoration:none;font-size:18px}} .nav .b em{{font-style:normal;color:var(--fire)}}
.nav .l{{display:flex;gap:20px;align-items:center;font-size:14px}} .nav .l a{{text-decoration:none;opacity:.85}}
.btn{{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:999px;font-weight:700;text-decoration:none;font-size:15px;
  background:linear-gradient(90deg,var(--red),var(--fire),var(--amber));color:#140700;box-shadow:0 0 24px rgba(255,106,0,.55),0 0 60px rgba(255,46,136,.25)}}
.btn.ghost{{background:rgba(255,255,255,.04);color:#fff;border:1.5px solid rgba(255,176,32,.55);box-shadow:none}}
/* hero */
.hero{{position:relative;min-height:100svh;display:grid;place-items:center;text-align:center;overflow:hidden;padding:90px 16px 60px}}
.hero canvas{{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}}
.hero .glow{{position:absolute;inset:auto 0 -20vh;height:70vh;background:radial-gradient(60% 60% at 50% 100%,rgba(255,106,0,.45),transparent 70%);pointer-events:none}}
.ridges{{position:absolute;left:0;right:0;bottom:0;height:34vh;pointer-events:none}}
.ridges svg{{position:absolute;bottom:0;width:100%;height:100%}}
.hero .in{{position:relative;z-index:2}}
.logo{{width:min(250px,48vw);aspect-ratio:1;border-radius:32px;overflow:hidden;margin:0 auto;box-shadow:0 0 0 1px rgba(255,176,32,.35),0 0 50px rgba(255,106,0,.55),0 0 120px rgba(255,46,136,.25)}}
.logo img{{width:100%;height:100%;object-fit:cover}}
.word{{font-family:'Montserrat',sans-serif;font-weight:900;line-height:.86;letter-spacing:-.01em;margin:26px 0 0;font-size:clamp(64px,15vw,210px);perspective:900px}}
.word .w1,.word .w2{{display:block}}
.word .w1{{color:#F4F1EC;text-shadow:0 1px 0 #cfc9c2,0 2px 0 #b9b2aa,0 3px 0 #a39b92,0 4px 0 #8e857b,0 5px 0 #6f675e,0 6px 0 #514a43,0 14px 30px rgba(0,0,0,.7)}}
.word .w2 .ch{{background:linear-gradient(180deg,var(--yellow),var(--amber) 45%,var(--fire));-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 1px 0 #d9560a) drop-shadow(0 2px 0 #c44a06) drop-shadow(0 3px 0 #a83d05) drop-shadow(0 4px 0 #8a3204) drop-shadow(0 8px 24px rgba(255,106,0,.5))}}
.word .ch{{display:inline-block;will-change:transform}}
.hero .sub{{font-size:clamp(17px,1.8vw,22px);opacity:.85;max-width:46ch;margin:22px auto 26px;line-height:1.5}}
.hero .ctas{{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}}
.scrollhint{{margin-top:34px;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--amber);opacity:.8}}
/* neon tube */
.tube{{height:3px;margin:0 auto;width:min(1100px,90vw);border-radius:3px;background:linear-gradient(90deg,transparent,var(--pink),var(--fire),var(--amber),transparent);
  box-shadow:0 0 14px var(--fire),0 0 40px var(--pink);animation:buzz 4s infinite}}
@keyframes buzz{{0%,92%,100%{{opacity:1}}93%{{opacity:.3}}95%{{opacity:1}}96%{{opacity:.5}}}}
/* iMac scene */
.imac-scene{{position:relative;height:100vh;overflow:hidden;display:grid;place-items:center}}
.neon-bg{{position:absolute;inset:0;opacity:0}}
.neon-bg .rays{{position:absolute;left:50%;top:46%;width:180vmax;height:180vmax;margin:-90vmax 0 0 -90vmax;border-radius:50%;
  background:conic-gradient(from 0deg,var(--pink),var(--fire),var(--amber),var(--violet),var(--pink),var(--fire),var(--amber),var(--violet),var(--pink));
  -webkit-mask:radial-gradient(circle,#000 0 8%,rgba(0,0,0,.55) 22%,transparent 46%);mask:radial-gradient(circle,#000 0 8%,rgba(0,0,0,.55) 22%,transparent 46%);filter:blur(28px)}}
.neon-bg .floor{{position:absolute;left:-20%;right:-20%;bottom:-8%;height:42%;transform:perspective(500px) rotateX(62deg);
  background:linear-gradient(transparent 0 0),repeating-linear-gradient(90deg,rgba(255,46,136,.55) 0 2px,transparent 2px 80px),repeating-linear-gradient(0deg,rgba(255,106,0,.55) 0 2px,transparent 2px 60px);
  -webkit-mask:linear-gradient(transparent,#000 40%);mask:linear-gradient(transparent,#000 40%)}}
.imac{{position:relative;width:min(1000px,88vw,calc((100vh - 170px) * 1.3));z-index:2;transform-origin:50% 60%}}
.bezel{{background:#0c0c0e;border-radius:18px 18px 0 0;padding:2.2% 2.2% 2.6%;box-shadow:0 0 0 2px #2a2a30 inset,0 40px 90px rgba(0,0,0,.6)}}
.screen{{position:relative;aspect-ratio:16/10;overflow:hidden;border-radius:4px;background:#000}}
.wall{{position:absolute;inset:0;background:radial-gradient(80% 90% at 20% 10%,rgba(255,46,136,.75),transparent 60%),radial-gradient(70% 80% at 90% 90%,rgba(255,106,0,.85),transparent 60%),
  radial-gradient(60% 70% at 70% 20%,rgba(123,60,255,.7),transparent 60%),#12060f}}
.boot{{position:absolute;inset:0;display:grid;place-items:center;background:#000;opacity:0}}
.boot img{{width:18%;border-radius:18%;box-shadow:0 0 40px rgba(255,106,0,.6)}}
.browser{{position:absolute;left:5%;right:5%;top:4%;border-radius:10px;overflow:hidden;background:#111;box-shadow:0 20px 60px rgba(0,0,0,.6);transform-origin:50% 120%}}
.chrome{{display:flex;align-items:center;gap:6px;padding:0 1.2%;height:clamp(16px,3.2cqw,30px);background:#1d1d22;container-type:inline-size}}
.chrome>i{{width:9px;height:9px;border-radius:50%;background:#ff5f57}} .chrome>i:nth-child(2){{background:#febc2e}} .chrome>i:nth-child(3){{background:#28c840}}
.url{{flex:1;margin:0 4%;background:#2a2a31;border-radius:6px;font-size:clamp(8px,1.1vw,13px);padding:2px 10px;color:#d7d7de;white-space:nowrap;overflow:hidden}}
.cart{{position:relative;font-size:clamp(10px,1.3vw,16px)}}
.cart .n{{position:absolute;right:-10px;top:-6px;width:16px;height:16px;border-radius:50%;background:var(--fire);font-size:10px;font-weight:800;color:#000;display:grid;place-items:center;
  box-shadow:0 0 10px var(--fire)}}
.cart .n em{{grid-area:1/1;font-style:normal;opacity:0}} .cart .n em[data-n="0"]{{opacity:1}}
.view{{position:relative;overflow:hidden;background:#000;container-type:inline-size}}
.pg{{position:absolute;left:0;top:0;width:100%}}
.pg img{{width:100%;height:auto}}
.ov{{position:absolute;inset:0}}
.chk{{position:absolute;width:3.2%;aspect-ratio:1;margin:-1.6% 0 0 -1.6%;border-radius:50%;background:#28c840;color:#fff;display:grid;place-items:center;font-weight:900;font-size:1.6cqw;
  box-shadow:0 0 14px #28c840,0 0 30px rgba(255,106,0,.6);transform:scale(0)}}
.cursor{{position:absolute;left:80%;top:70%;width:3.2%;z-index:5;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))}}
.cursor svg{{width:100%;height:auto}}
.bubble{{position:absolute;left:110%;top:90%;white-space:nowrap;font:800 1.9cqw/1 'Montserrat',sans-serif;padding:.7cqw 1.2cqw;border-radius:999px;
  background:linear-gradient(90deg,var(--pink),var(--fire));color:#fff;box-shadow:0 0 18px var(--pink),0 0 40px var(--fire);opacity:0;transform:scale(.6)}}
.ripple{{position:absolute;left:-60%;top:-60%;width:120%;aspect-ratio:1;border-radius:50%;border:3px solid var(--amber);box-shadow:0 0 16px var(--fire);opacity:0}}
.burst{{position:absolute;left:50%;top:45%;width:0;height:0;pointer-events:none}}
.burst i{{position:absolute;left:-.6cqw;top:-.6cqw;width:1.2cqw;height:5cqw;border-radius:9px;background:var(--c);box-shadow:0 0 14px var(--c);
  --d:0;--s:0;transform:rotate(var(--a)) translateY(calc(var(--d) * -1cqw)) scaleY(var(--s));opacity:0}}
.dock{{position:absolute;left:50%;bottom:2.4%;transform:translateX(-50%);display:flex;gap:6px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.18);backdrop-filter:blur(6px)}}
.dock i{{width:clamp(10px,2vw,22px);aspect-ratio:1;border-radius:24%;background:linear-gradient(135deg,var(--pink),var(--violet))}}
.dock i:nth-child(2){{background:linear-gradient(135deg,var(--amber),var(--fire))}} .dock i.on{{background:linear-gradient(135deg,#fff,#9fb8ff)}}
.off{{position:absolute;inset:0;background:#000}}
.flash{{position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:#fff;box-shadow:0 0 30px #fff,0 0 60px var(--pink);opacity:0}}
.chin{{height:clamp(30px,7vw,74px);background:linear-gradient(#d9dbe0,#b9bcc4);border-radius:0 0 18px 18px;box-shadow:inset 0 -3px 6px rgba(0,0,0,.15)}}
.neck{{width:18%;height:clamp(36px,7vw,80px);margin:0 auto;background:linear-gradient(90deg,#a9acb4,#e4e6ea 50%,#a9acb4);clip-path:polygon(8% 0,92% 0,100% 100%,0 100%)}}
.foot{{width:30%;height:10px;margin:0 auto;border-radius:0 0 8px 8px;background:#c7cad1}}
.caps{{position:absolute;left:0;right:0;top:76px;z-index:3;display:flex;justify-content:center;gap:clamp(12px,3vw,40px);flex-wrap:wrap;padding:0 12px}}
.imac-scene .imac{{margin-top:70px;width:min(1000px,88vw,calc((100vh - 240px) * 1.3))}}
.cap{{display:flex;align-items:baseline;gap:10px;opacity:.18;font-family:'Montserrat',sans-serif;font-weight:800;font-size:clamp(14px,1.5vw,20px)}}
.cap b{{color:var(--amber);font-size:.8em}}
.cap.on{{opacity:1;text-shadow:0 0 14px var(--fire)}}
@media (max-width:900px){{.caps{{top:auto;bottom:4vh}} .cap span{{display:none}} .cap.on span{{display:inline}} .imac-scene .imac{{margin-top:-8vh}}}}
/* offer */
.offer{{max-width:1200px;margin:16vh auto;padding:0 clamp(16px,4vw,44px)}}
.kick{{color:var(--amber);letter-spacing:.3em;text-transform:uppercase;font-size:12px;font-weight:700}}
h2{{font-family:'Montserrat',sans-serif;font-weight:900;font-size:clamp(36px,6vw,84px);line-height:.95;margin:10px 0 34px;letter-spacing:-.02em}}
h2 em{{font-style:normal;color:var(--fire);text-shadow:0 0 24px rgba(255,106,0,.6)}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:18px;perspective:1200px}}
.prod{{position:relative;padding:26px 22px;border-radius:22px;background:#0f0a0c;isolation:isolate;transform-style:preserve-3d}}
.prod::before{{content:"";position:absolute;inset:-1.5px;border-radius:23px;z-index:-1;
  background:conic-gradient(from var(--ang),var(--pink),var(--fire),var(--amber),var(--violet),var(--pink));animation:spin 5s linear infinite;filter:saturate(1.2)}}
.prod::after{{content:"";position:absolute;inset:0;border-radius:22px;z-index:-1;background:#0f0a0c}}
@keyframes spin{{to{{--ang:360deg}}}}
.prod .tag{{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--amber)}}
.prod h3{{font-family:'Montserrat',sans-serif;font-weight:900;font-size:26px;margin:8px 0 4px}}
.prod .price{{font-family:'Montserrat',sans-serif;font-weight:900;font-size:40px;background:linear-gradient(90deg,var(--amber),var(--fire),var(--pink));-webkit-background-clip:text;background-clip:text;color:transparent}}
.prod p{{opacity:.78;line-height:1.55;margin:10px 0 0;font-size:15.5px}}
.offer .note{{opacity:.6;font-size:13px;margin-top:18px}}
.band{{overflow:hidden;padding:6vh 0}}
.band div{{display:flex;gap:30px;align-items:center;white-space:nowrap;font-family:'Montserrat',sans-serif;font-weight:900;font-size:clamp(44px,8vw,120px);
  color:transparent;-webkit-text-stroke:2px var(--fire);text-shadow:0 0 30px rgba(255,106,0,.35)}}
.band i{{font-style:normal;color:var(--pink);-webkit-text-stroke:0;text-shadow:0 0 20px var(--pink)}}
.stats{{max-width:1100px;margin:10vh auto;padding:0 clamp(16px,4vw,44px);display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}}
.stat b{{display:block;font-family:'Montserrat',sans-serif;font-weight:900;font-size:clamp(54px,7vw,96px);line-height:1;color:#fff;text-shadow:0 0 22px var(--fire),0 0 60px var(--pink)}}
.stat span{{opacity:.75}}
.stats-note{{max-width:1100px;margin:-6vh auto 10vh;padding:0 clamp(16px,4vw,44px);opacity:.5;font-size:13px}}
.chans{{max-width:1100px;margin:0 auto 14vh;padding:0 clamp(16px,4vw,44px)}}
.chan{{display:flex;align-items:center;gap:16px;padding:22px 4px;border-bottom:1px solid rgba(255,176,32,.2);text-decoration:none;transition:padding .3s,color .3s}}
.chan span{{width:120px;opacity:.6;font-size:14px}} .chan b{{flex:1;font-family:'Montserrat',sans-serif;font-size:clamp(22px,3vw,38px)}}
.chan:hover{{padding-left:18px;color:var(--amber)}}
footer{{text-align:center;opacity:.6;font-size:13px;padding:0 16px 6vh}}
@media (max-width:760px){{.nav .l a:not(.btn){{display:none}}}}
"""
    ridges = ('<div class="ridges" aria-hidden="true">'
              '<svg viewBox="0 0 1200 300" preserveAspectRatio="none" data-parallax="0.25"><path d="M0 300V170l140-80 120 70 170-120 150 110 130-90 160 100 150-70 180 90v140z" fill="#2a1206" opacity=".8"/></svg>'
              '<svg viewBox="0 0 1200 300" preserveAspectRatio="none"><path d="M0 300V210l170-110 150 120 140-90 140 100 170-140 160 130 130-80 140 90v170z" fill="#0b0605" stroke="#FFB020" stroke-width="2.5" '
              'style="filter:drop-shadow(0 0 6px #ff6a00)"/></svg></div>')
    body = f"""
<nav class="nav" aria-label="Hauptnavigation"><a class="b" href="#top">{esc(words[0])}<em>{esc(words[1])}</em></a>
<div class="l"><a href="#angebot">Angebot</a><a href="#kanaele">Kanäle</a><a class="btn" href="{esc(b.get('shop_url', '#angebot'))}">Shop</a></div></nav>
<main id="top">
<section class="hero" data-hero>
  <canvas data-embers aria-hidden="true"></canvas><div class="glow"></div>{ridges}
  <div class="in">
    {f'<div class="logo"><img src="{logo}" alt="{esc(brand)} Logo"></div>' if logo else ''}
    <h1 class="word" aria-label="{esc(brand)}"><span class="w1">{''.join(f'<span class="ch">{esc(ch)}</span>' for ch in words[0])}</span><span class="w2">{''.join(f'<span class="ch">{esc(ch)}</span>' for ch in words[1])}</span></h1>
    <p class="sub">{esc(hero.get('subtitle', ''))}</p>
    <div class="ctas"><a class="btn" href="#angebot">Angebot ansehen {ICON['arrow']}</a><a class="btn ghost" href="{esc(b.get('shop_url', '#'))}">Zum Shop</a></div>
    <div class="scrollhint">Scrollen · Bildschirm an</div>
  </div>
</section>
<div class="tube"></div>
{imac}
<div class="tube"></div>
<section class="offer" id="angebot"><div class="kick">Shop</div><h2 data-lines>{b.get('offer_title_html', 'Angebot')}</h2>
<div class="cards">{cards}</div><p class="note">{esc(b.get('offer_note', ''))}</p></section>
<section class="band" aria-hidden="true"><div data-sideways="-1">{marquee * 3}</div></section>
<section class="stats">{stats}</section>
<p class="stats-note">{esc(b.get('stats_note', ''))}</p>
<section class="chans" id="kanaele"><div class="kick">Kanäle</div><h2 data-lines>Folge <em>{esc(brand)}</em></h2>{chans}</section>
</main>
<footer>{esc(b.get('footer') or f'© {brand}')}</footer>
<script type="application/json" id="imac-data">{json.dumps({"w": W, "vh": VH, "pages": {k: v["h"] for k, v in pages.items()}, "steps": steps, "captions": caps})}</script>
"""
    js = r"""
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  // ---- Embers (Glut) im Hero
  const cv = $('[data-embers]');
  if (cv && !reduce) {
    const g = cv.getContext('2d'); let W, H, P = [], vis = true;
    const fit = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    fit(); addEventListener('resize', fit);
    for (let i = 0; i < 70; i++) P.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2.4 + .6, s: Math.random() * .0016 + .0006, w: Math.random() * 6.28, h: Math.random() < .3 ? 330 : 28 + Math.random() * 20 });
    new IntersectionObserver((e) => { vis = e[0].isIntersecting; }).observe(cv);
    let last = 0;
    const tick = (t) => { requestAnimationFrame(tick); if (!vis || t - last < 33) return; last = t; g.clearRect(0, 0, W, H);
      P.forEach((p) => { p.y -= p.s; p.w += .03; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
        const x = (p.x + Math.sin(p.w) * .01) * W, y = p.y * H, a = Math.min(1, p.y * 1.4);
        g.beginPath(); g.fillStyle = `hsla(${p.h},100%,60%,${a})`; g.shadowColor = `hsl(${p.h},100%,55%)`; g.shadowBlur = 12; g.arc(x, y, p.r, 0, 6.28); g.fill(); }); };
    requestAnimationFrame(tick);
  }
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  // ---- Hero: Buchstaben fliegen in 3D herein, beim Scrollen fliegen die Worte auseinander
  const chs = $$('.word .ch');
  if (!reduce) {
    gsap.from(chs, { opacity: 0, z: 400, rotateX: () => gsap.utils.random(-90, 90), rotateY: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-120, 120),
      duration: 1.1, ease: 'expo.out', stagger: { each: .05, from: 'random' }, delay: .2 });
    gsap.from('.hero .logo', { scale: .2, rotate: -25, opacity: 0, duration: 1.2, ease: 'back.out(1.6)' });
    const ht = gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: .6 } });
    ht.to('.word .w1', { xPercent: -40, opacity: .0, ease: 'none' }, 0).to('.word .w2', { xPercent: 40, opacity: 0, ease: 'none' }, 0)
      .to('.hero .logo', { scale: 2.6, opacity: 0, y: -60, ease: 'none' }, 0).to('.hero .sub, .hero .ctas, .scrollhint', { opacity: 0, y: -40 }, 0);
  }
  // ---- Neon-Karten fliegen in 3D herein
  if (!reduce) $$('.prod').forEach((el, i) => gsap.from(el, { opacity: 0, rotateY: i % 2 ? -55 : 55, z: -300, y: 80, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 90%' } }));
  // ---- iMac-Szene
  const sc = $('[data-imac]'); const D = JSON.parse(($('#imac-data') || {}).textContent || '{}');
  if (!sc || !D.steps) return;
  const view = $('.view', sc), cur = $('.cursor', sc), rip = $('.ripple', sc);
  const pageEl = (n) => $(`.pg[data-page="${n}"]`, sc);
  const px = (x) => (x / D.w * 100) + '%';
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  // Einschalten
  tl.from('.imac', { scale: .5, rotateX: 22, y: 120, duration: 2, ease: 'power3.out' }, 0)
    .to('.neon-bg', { opacity: 1, duration: 1.6 }, .4)
    .fromTo('.neon-bg .rays', { rotate: 0, scale: .6 }, { rotate: 160, scale: 1.1, duration: 14, ease: 'none' }, 0)
    .to('.flash', { opacity: 1, duration: .15 }, 1.6).to('.flash', { scaleY: 400, duration: .35 }, 1.75)
    .to('.off', { opacity: 0, duration: .01 }, 1.9).to('.flash', { opacity: 0, duration: .3 }, 1.95)
    .to('.boot', { opacity: 1, duration: .01 }, 1.9).to('.boot', { opacity: 0, duration: .5 }, 2.6)
    .from('.browser', { scale: .05, y: '60%', opacity: 0, duration: .8, ease: 'back.out(1.2)' }, 3.0);
  // Schritte
  let t = 4, page = Object.keys(D.pages)[0], scroll = 0, capIdx = -1;
  const setCap = (i, at) => { if (i === capIdx) return; capIdx = i; $$('.cap', sc).forEach((c, k) => tl.set(c, { className: k === i ? 'cap on' : 'cap' }, at)); };
  let curLabel = null;
  D.steps.forEach((s) => {
    if (s.page && s.page !== page) { tl.to(pageEl(page), { opacity: 0, duration: .35 }, t).to(pageEl(s.page), { opacity: 1, duration: .35 }, t); page = s.page; scroll = s.scroll || 0;
      tl.set(pageEl(page), { yPercent: -scroll / D.pages[page] * 100 }, t); t += .35; }
    else if (s.scroll != null && s.scroll !== scroll) { scroll = s.scroll; tl.to(pageEl(page), { yPercent: -scroll / D.pages[page] * 100, duration: 1 }, t); }
    if (s.cap != null) setCap(s.cap, t);
    if (s.label !== undefined && s.label !== curLabel) {
      if (curLabel) tl.to($(`.bubble[data-l="${curLabel}"]`, sc), { opacity: 0, scale: .6, duration: .2 }, t);
      if (s.label) tl.to($(`.bubble[data-l="${s.label}"]`, sc), { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, t + .3);
      curLabel = s.label;
    }
    const [x, y] = s.cursor; const vy = (y - scroll) / D.vh * 100;
    tl.to(cur, { left: px(x), top: vy + '%', duration: 1 }, t); t += 1;
    if (s.click) {
      tl.fromTo(cur, { scale: 1 }, { scale: .8, duration: .1, yoyo: true, repeat: 1 }, t)
        .fromTo(rip, { opacity: 1, scale: .2 }, { opacity: 0, scale: 2.4, duration: .5, ease: 'power1.out' }, t);
      if (s.cart) {
        const ov = $(`.ov[data-ov="${page}"]`, sc); const ck = document.createElement('span'); ck.className = 'chk'; ck.textContent = '✓';
        ck.style.left = px(x); ck.style.top = (y / D.pages[page] * 100) + '%'; ov.appendChild(ck);
        tl.to(ck, { scale: 1, duration: .35, ease: 'back.out(3)' }, t + .05)
          .set($(`.cart em[data-n="${s.cart - 1}"]`, sc), { opacity: 0 }, t + .1).set($(`.cart em[data-n="${s.cart}"]`, sc), { opacity: 1 }, t + .1)
          .fromTo('.cart .n', { scale: 1.8 }, { scale: 1, duration: .3 }, t + .1);
      }
      t += .5;
    }
    if (s.burst) tl.fromTo($$('.burst i', sc), { opacity: 1, '--d': 0, '--s': 0 }, { opacity: 0, '--d': (i) => 10 + (i % 3) * 5, '--s': 1, duration: 1.2, ease: 'expo.out' }, t - .4);
    t += .2;
  });
  tl.to('.imac', { scale: .92, duration: 1 }, t + .3).to({}, { duration: .6 });
  ScrollTrigger.create({ trigger: sc, start: 'top top', end: () => '+=' + Math.round(innerHeight * (t / 1.6)), pin: true, scrub: .8, animation: tl });
  ScrollTrigger.refresh();
})();
"""
    return {"css": css, "body": body, "js": js,
            "fonts": "family=Montserrat:wght@800;900&family=Inter:wght@400;600;700", "three": False}
