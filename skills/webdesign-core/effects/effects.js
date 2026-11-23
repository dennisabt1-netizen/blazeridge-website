/* webdesign-core effects.js
 * Scroll effects driven by data attributes. Needs gsap + ScrollTrigger (+ SplitText for line reveals),
 * optional Lenis for smooth scroll, optional THREE (window.THREE) for data-three.
 * All effects respect prefers-reduced-motion (they render the final state instead).
 */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  if (!window.gsap) { console.warn('[effects] gsap missing'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  // ---- Smooth scroll (Lenis) -------------------------------------------------
  let lenis = null;
  if (window.Lenis && !reduce && !document.body.hasAttribute('data-no-smooth')) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  // ---- 1 Layered Parallax: [data-parallax="0.3"] (speed, negative = opposite) -
  $$('[data-parallax]').forEach((el) => {
    if (reduce) return;
    const s = parseFloat(el.dataset.parallax || '0.3');
    const box = el.closest('[data-parallax-scope]') || el.parentElement;
    gsap.fromTo(el, { yPercent: -50 * s }, { yPercent: 50 * s, ease: 'none',
      scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ---- 2 Pinned Heading: [data-pin] section; its [data-pin-target] stays while the rest scrolls
  $$('[data-pin]').forEach((sec) => {
    const t = sec.querySelector('[data-pin-target]');
    if (!t || reduce) return;
    ScrollTrigger.create({ trigger: sec, start: 'top top+=80', end: 'bottom bottom', pin: t, pinSpacing: false });
  });

  // ---- 3 3D Card Zoom: [data-card-zoom] tilts back in perspective and flattens + grows
  $$('[data-card-zoom]').forEach((el) => {
    if (reduce) return;
    gsap.set(el.parentElement, { perspective: 1200 });
    gsap.fromTo(el, { rotateX: 32, scale: 0.78, y: 60, transformOrigin: '50% 100%' },
      { rotateX: 0, scale: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 25%', scrub: true } });
  });

  // ---- 4 Line-by-line Reveal: [data-lines]
  $$('[data-lines]').forEach((el) => {
    if (reduce) return;
    let lines;
    if (window.SplitText) {
      const split = new SplitText(el, { type: 'lines', linesClass: 'fx-line', mask: 'lines' });
      lines = split.lines;
    } else { lines = [el]; }
    gsap.from(lines, { yPercent: 110, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // ---- 5 Sideways Text: [data-sideways="-1"|"1"] moves horizontally with scroll
  $$('[data-sideways]').forEach((el) => {
    if (reduce) return;
    const dir = parseFloat(el.dataset.sideways || '-1');
    gsap.fromTo(el, { xPercent: dir < 0 ? 0 : -40 }, { xPercent: dir < 0 ? -40 : 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ---- 6 Card Arc Carousel: [data-arc] container with .arc-card children (pinned, rotates on scroll)
  $$('[data-arc]').forEach((wrap) => {
    const cards = $$('.arc-card', wrap);
    const n = cards.length; if (!n) return;
    const spread = parseFloat(wrap.dataset.arc || '12');
    // cards hang on a big wheel whose hub sits far below the viewport; rotating the wheel = arc carousel
    const R = Math.max(1100, window.innerWidth * 1.2);
    const place = (offset) => cards.forEach((c, i) => {
      const a = (i - (n - 1) / 2) * spread + offset;
      c.style.transform = `translateX(-50%) rotate(${a}deg)`;
      c.style.zIndex = String(100 - Math.round(Math.abs(a)));
    });
    cards.forEach((c) => { c.style.transformOrigin = `50% ${R}px`; c.style.top = '24vh'; });
    place(0);
    if (reduce) return;
    const range = spread * (n - 1) / 2;
    const o = { v: range };
    gsap.to(o, { v: -range, ease: 'none', onUpdate: () => place(o.v),
      scrollTrigger: { trigger: wrap.closest('section') || wrap, start: 'top top', end: `+=${n * 260}`, scrub: true, pin: true } });
  });

  // ---- 7 Fixed 3D Model: [data-three] canvas host. Procedural model (no paid Spline), rotates with scroll.
  //      data-three="knot|blob|ring|bottle", data-color="#hex"
  $$('[data-three]').forEach((host) => {
    const start = (THREE) => {
      const kind = host.dataset.three || 'knot';
      const col = new THREE.Color(host.dataset.color || '#ff6a1a');
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      r.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
      host.appendChild(r.domElement);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100); cam.position.set(0, 0, 7);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.2));
      const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
      const rim = new THREE.DirectionalLight(col, 2.5); rim.position.set(-4, -2, -3); scene.add(rim);
      let geo;
      if (kind === 'blob') geo = new THREE.IcosahedronGeometry(1.6, 12);
      else if (kind === 'ring') geo = new THREE.TorusGeometry(1.4, 0.45, 64, 160);
      else if (kind === 'bottle') {
        const pts = [[0, -2], [0.85, -2], [0.95, -1.8], [0.95, 0.9], [0.6, 1.4], [0.45, 1.6], [0.45, 2], [0, 2]]
          .map(([x, y]) => new THREE.Vector2(x, y));
        geo = new THREE.LatheGeometry(pts, 96);
      } else geo = new THREE.TorusKnotGeometry(1.1, 0.36, 260, 40);
      // no 'transmission' (extra render pass, too slow on weak/integrated GPUs) — fake glass with opacity
      const mat = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.22, metalness: 0.35, clearcoat: 1,
        clearcoatRoughness: 0.15, transparent: kind === 'bottle', opacity: kind === 'bottle' ? 0.88 : 1 });
      const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
      const base = kind === 'blob' ? geo.attributes.position.array.slice() : null;
      const size = () => { const w = host.clientWidth, h = host.clientHeight || w;
        r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
      size(); window.addEventListener('resize', size);
      let prog = 0;
      if (!reduce) ScrollTrigger.create({ trigger: host.closest('[data-three-scope]') || document.body,
        start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => { prog = s.progress; } });
      let visible = true, last = 0;
      new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(host);
      const tick = (t) => {
        requestAnimationFrame(tick);
        if (!visible || t - last < 33) return;   // pause offscreen, cap ~30 fps
        last = t;
        mesh.rotation.y = prog * Math.PI * 3 + (reduce ? 0 : t * 0.00015);
        mesh.rotation.x = prog * Math.PI * 0.8;
        if (base && !reduce) {
          const p = geo.attributes.position; const v = new THREE.Vector3();
          for (let i = 0; i < p.count; i++) {
            v.fromArray(base, i * 3);
            const n = Math.sin(v.x * 2 + t * 0.0012) * Math.cos(v.y * 2.3 + t * 0.001) * 0.18;
            v.multiplyScalar(1 + n); p.setXYZ(i, v.x, v.y, v.z);
          }
          p.needsUpdate = true; geo.computeVertexNormals();
        }
        r.render(scene, cam);
      };
      requestAnimationFrame(tick);
    };
    if (window.THREE) start(window.THREE);
    else window.addEventListener('three-ready', () => start(window.THREE), { once: true });
  });

  // ---- 8 Stacking Cards: [data-stack] container with .stack-card children
  $$('[data-stack]').forEach((wrap) => {
    const cards = $$('.stack-card', wrap);
    cards.forEach((c, i) => {
      c.style.position = 'sticky';
      c.style.top = `calc(12vh + ${i * 22}px)`;
      if (reduce || i === cards.length - 1) return;
      gsap.to(c, { scale: 0.9 + i * 0.015, filter: 'brightness(0.75)', ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
    });
  });

  // ---- 9 Focus-frame Slider: [data-focus] pinned horizontal track (.focus-track > .focus-slide), center slide sharp
  $$('[data-focus]').forEach((sec) => {
    const track = sec.querySelector('.focus-track');
    const slides = $$('.focus-slide', sec);
    if (!track || !slides.length) return;
    const update = () => {
      const mid = window.innerWidth / 2;
      slides.forEach((s) => {
        const b = s.getBoundingClientRect();
        const d = Math.min(1, Math.abs(b.left + b.width / 2 - mid) / (window.innerWidth * 0.5));
        s.style.filter = `blur(${(d * 6).toFixed(2)}px) grayscale(${d})`;
        s.style.opacity = String(1 - d * 0.55);
        s.style.transform = `scale(${1 - d * 0.12})`;
      });
    };
    if (reduce) { update(); return; }
    const dist = () => track.scrollWidth - window.innerWidth + window.innerWidth * 0.2;
    gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${dist()}`, scrub: true, pin: true,
        invalidateOnRefresh: true, onUpdate: update } });
    update();
  });

  // ---- 10 Scroll-triggered Demo: [data-reveal], [data-count="1234"], [data-draw] (svg path)
  $$('[data-reveal]').forEach((el) => {
    if (reduce) return;
    gsap.from(el, { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', delay: parseFloat(el.dataset.reveal || 0),
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count); const dec = (el.dataset.count.split('.')[1] || '').length;
    const fmt = (v) => v.toFixed(dec).replace('.', el.dataset.decimal || ',');
    if (reduce) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); },
      scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  $$('[data-draw] path, path[data-draw]').forEach((p) => {
    const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = reduce ? 0 : L;
    if (reduce) return;
    gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: p.closest('svg'), start: 'top 85%', end: 'bottom 40%', scrub: true } });
  });

  // ---- Extras used by style templates ------------------------------------------
  // Morphing blob (bold-pop): [data-blob] svg path with data-shapes="d1|d2|d3" -> cycles with scroll
  $$('[data-blob]').forEach((path) => {
    const shapes = (path.dataset.shapes || '').split('|').filter(Boolean);
    if (shapes.length < 2 || reduce) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: path.closest('[data-blob-scope]') || document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });
    shapes.slice(1).forEach((d) => tl.to(path, { attr: { d }, ease: 'none' }));
  });
  // Scatter stickers (bold-pop): [data-scatter] children fly in from random offsets
  $$('[data-scatter]').forEach((wrap) => {
    if (reduce) return;
    $$(':scope > *', wrap).forEach((c, i) => {
      const r = (k) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
      gsap.from(c, { x: r(1) * 500, y: 200 + r(2) * 300, rotate: r(3) * 60, scale: 0.4, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'top 25%', scrub: true } });
    });
  });
  // Tilt on pointer (glass): [data-tilt]
  $$('[data-tilt]').forEach((el) => {
    if (reduce) return;
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      gsap.to(el, { rotateY: x * 10, rotateX: -y * 10, transformPerspective: 900, duration: 0.4 });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6 }));
  });

  // ---- Paint wall (Maler/Handwerk): [data-paintwall] fixed background; each <g class="pass"> is one roller pass
  //      (several bristle <path>s). Scroll progress paints the passes one after another; .roller follows the paint head.
  $$('[data-paintwall]').forEach((wall) => {
    const passes = $$('g.pass', wall);
    const roller = wall.querySelector('.roller');
    const data = passes.map((g) => {
      const paths = $$('path', g); const L = paths[0].getTotalLength();
      paths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = reduce ? 0 : l; p.__l = l; });
      return { paths, L };
    });
    if (reduce) { if (roller) roller.style.display = 'none'; return; }
    const paint = (prog) => {
      const n = data.length, x = prog * n;
      let head = false;
      data.forEach((d, i) => {
        const k = Math.min(1, Math.max(0, x - i));
        d.paths.forEach((p) => { p.style.strokeDashoffset = p.__l * (1 - k); });
        if (roller && k > 0 && k < 1) {
          const pt = d.paths[0].getPointAtLength(d.L * k), pt2 = d.paths[0].getPointAtLength(Math.min(d.L, d.L * k + 2));
          const a = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
          roller.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${a})`);
          head = true;
        }
      });
      if (roller) roller.style.opacity = head ? 1 : 0;
    };
    paint(0);
    ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: (s) => paint(s.progress) });
  });
  // Brush-swipe reveal: [data-swipe] element is uncovered left->right like a brush stroke
  $$('[data-swipe]').forEach((el) => {
    if (reduce) return;
    gsap.fromTo(el, { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
      { clipPath: 'polygon(0 0, 110% 0, 100% 100%, 0 100%)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  window.__effectsReady = true;
})();
