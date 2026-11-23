const { chromium } = require('playwright');
(async () => {
  const [base, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const res = {};
  for (const name of ['index', 'shop', 'danke']) {
    await p.goto(`${base}/${name}.html`, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    // trigger lazy reveals
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120); }
    await p.evaluate(() => { scrollTo(0, 0); document.querySelectorAll('.reveal').forEach(e => e.classList.add('in', 'visible', 'is-visible')); });
    await p.waitForTimeout(800);
    const info = await p.evaluate(() => {
      const nav = document.querySelector('.nav, header, nav'); const cs = nav && getComputedStyle(nav);
      const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, t: e.textContent.trim().slice(0, 30) }; };
      return { H: document.documentElement.scrollHeight, navPos: cs && cs.position, navH: nav && nav.getBoundingClientRect().height,
        shop: [...document.querySelectorAll('a[href="shop.html"]')].map(box),
        buy: [...document.querySelectorAll('a.btn-primary')].map(box) };
    });
    res[name] = info;
    await p.screenshot({ path: `${out}/${name}.png`, fullPage: true, timeout: 90000 });
  }
  console.log(JSON.stringify(res));
  await b.close();
})();
