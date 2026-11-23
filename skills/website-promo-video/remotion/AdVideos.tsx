import React from 'react';
import {
  AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';

/* Webdesign ad reels: several website designs one after another, fast effects, flowing transitions.
   Segments come from props: {clip, from (s), dur (s), label, color, mclip? (phone clip)} */
export type Seg = {clip: string; from: number; dur: number; label: string; tag?: string; color: string; mclip?: string; mfrom?: number};
export type AdProps = {segs: Seg[]; brand: string; line1: string; line2: string; cta: string; handle: string; speed?: number; note?: string};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fontCss = `
@font-face{font-family:'Anton';src:url('${staticFile('Anton-400-latin.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:400;src:url('${staticFile('Inter-400-latin.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:600;src:url('${staticFile('Inter-600-latin.woff2')}') format('woff2');}`;
export const FPS = 30;
export const INTRO = 66, OUTRO = 96, T = 12; // frames
const segF = (s: Seg) => Math.round(s.dur * FPS);
export const adFrames = (p: AdProps) => INTRO + p.segs.reduce((a, s) => a + segF(s), 0) + OUTRO;
const starts = (p: AdProps) => { let t = INTRO; return p.segs.map((s) => { const st = t; t += segF(s); return st; }); };

// Each clip is anchored to the composition frame `at` where its segment starts (incl. T frames of lead-in),
// so the website recording plays from `from` seconds exactly when the segment appears.
const Clip: React.FC<{src: string; from: number; speed: number; at: number; style?: React.CSSProperties}> = ({src, from, speed, at, style}) => (
  <Sequence from={at - T} layout="none">
    <OffthreadVideo src={staticFile(src)} startFrom={Math.max(0, Math.round(from * FPS - T * speed))} playbackRate={speed} muted
      style={{width: '100%', height: '100%', objectFit: 'cover', ...style}} />
  </Sequence>
);
const Note: React.FC<{text?: string; color?: string}> = ({text, color = '#ffffff88'}) => (
  <div style={{position: 'absolute', bottom: 44, width: '100%', textAlign: 'center', fontFamily: 'Inter', fontSize: 22, color}}>
    {text ?? 'Video mit KI erstellt · Beispiel-Designs'}</div>
);

/* ======================================================= 1) FLOW — zoom-through + liquid circle reveal */
export const AdFlow: React.FC<AdProps> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = p.speed ?? 1.2;
  const st = starts(p);
  const end = st[st.length - 1] + segF(p.segs[p.segs.length - 1]);
  const idx = st.reduce((a, s, i) => (f >= s ? i : a), -1);
  const cur = p.segs[Math.max(0, idx)];
  const letters = p.brand.split('');
  return (
    <AbsoluteFill style={{background: '#07070a', overflow: 'hidden', fontFamily: 'Inter'}}>
      <style>{fontCss}</style>
      {/* ambient color wash follows current design */}
      <AbsoluteFill style={{background: `radial-gradient(70% 50% at 50% 45%, ${idx >= 0 ? cur.color : '#ff6a1a'}55, transparent 70%)`}} />
      {/* intro */}
      <Sequence durationInFrames={INTRO + T}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
          opacity: interpolate(f, [INTRO - 6, INTRO + T], [1, 0], clamp), transform: `scale(${interpolate(f, [INTRO - 6, INTRO + T], [1, 2.4], clamp)})`}}>
          <div style={{display: 'flex'}}>
            {letters.map((c, i) => {
              const s = spring({frame: f - i * 2, fps, config: {damping: 12, mass: 0.6}});
              return <span key={i} style={{fontFamily: 'Anton', fontSize: 150, color: '#fff', display: 'inline-block',
                transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * (i % 2 ? 20 : -20)}deg)`, opacity: s,
                filter: `blur(${(1 - s) * 10}px)`}}>{c}</span>;
            })}
          </div>
          <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 52, letterSpacing: 26, color: '#FF7A1A', marginTop: 8,
            opacity: spring({frame: f - 18, fps})}}>WEBDESIGN</div>
          <div style={{width: interpolate(f, [22, 50], [0, 700], {...clamp, easing: Easing.out(Easing.cubic)}), height: 4, marginTop: 30,
            background: 'linear-gradient(90deg,transparent,#FF7A1A,transparent)'}} />
        </AbsoluteFill>
      </Sequence>
      {/* segments */}
      {p.segs.map((s, i) => {
        const s0 = st[i], d = segF(s);
        const local = f - s0;
        if (local < -T || local > d + T) return null;
        const inP = interpolate(local, [-T, T], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
        const outP = interpolate(local, [d - T, d + T], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
        const scale = (0.72 + inP * 0.28) * (1 + outP * 0.55);
        const radius = inP * 140; // % of circle
        const lab = spring({frame: local - 4, fps, config: {damping: 14}});
        return (
          <AbsoluteFill key={i} style={{zIndex: i + 1, opacity: 1 - outP * 0.9, filter: `blur(${outP * 14}px)`}}>
            <AbsoluteFill style={{clipPath: `circle(${radius}% at 50% 46%)`}}>
              {/* blurred ambient copy */}
              <AbsoluteFill style={{filter: 'blur(40px) brightness(.55)', transform: 'scale(1.3)'}}><Clip src={s.clip} from={s.from} speed={sp} at={s0} /></AbsoluteFill>
              <div style={{position: 'absolute', left: 40, right: 40, top: 520, height: 560, borderRadius: 30, overflow: 'hidden',
                transform: `scale(${scale}) rotate(${(1 - inP) * -6}deg)`, boxShadow: `0 40px 120px ${s.color}66`, border: '2px solid #ffffff22'}}>
                <Clip src={s.clip} from={s.from} speed={sp} at={s0} />
              </div>
              <div style={{position: 'absolute', top: 1150, left: 60, opacity: lab, transform: `translateX(${(1 - lab) * -80}px)`}}>
                <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 30, color: s.color, letterSpacing: 6}}>{String(i + 1).padStart(2, '0')} · {s.tag ?? 'DESIGN'}</div>
                <div style={{fontFamily: 'Anton', fontSize: 120, color: '#fff', lineHeight: 1, marginTop: 6}}>{s.label}</div>
              </div>
              {/* progress */}
              <div style={{position: 'absolute', top: 1420, left: 60, display: 'flex', gap: 10}}>
                {p.segs.map((_, k) => <div key={k} style={{width: k === i ? 60 : 16, height: 8, borderRadius: 4, background: k === i ? s.color : '#ffffff33'}} />)}
              </div>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      <div style={{position: 'absolute', top: 300, left: 60, right: 60, display: 'flex', justifyContent: 'space-between',
        fontFamily: 'Inter', fontWeight: 600, fontSize: 30, color: '#fff', opacity: interpolate(f, [INTRO, INTRO + 10, end, end + 6], [0, 1, 1, 0], clamp)}}>
        <span>{p.brand} <span style={{color: '#FF7A1A'}}>Webdesign</span></span><span style={{opacity: .6}}>{p.handle}</span></div>
      {/* outro */}
      {f >= end - 4 && (() => {
        const o = spring({frame: f - end, fps, config: {damping: 13}});
        return (
          <AbsoluteFill style={{zIndex: 50, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 22,
            background: `radial-gradient(60% 40% at 50% 50%, #FF7A1A44, #07070a 70%)`, opacity: Math.min(1, (f - end + 4) / 8)}}>
            <div style={{fontFamily: 'Anton', fontSize: 110, color: '#fff', textAlign: 'center', lineHeight: 1, transform: `scale(${0.8 + o * 0.2})`}}>{p.line1}</div>
            <div style={{fontFamily: 'Inter', fontSize: 46, color: '#ffffffcc', textAlign: 'center', maxWidth: 900}}>{p.line2}</div>
            <div style={{marginTop: 30, background: '#FF7A1A', color: '#111', fontWeight: 600, fontSize: 40, padding: '20px 40px', borderRadius: 999,
              opacity: spring({frame: f - end - 10, fps})}}>{p.cta}</div>
          </AbsoluteFill>
        );
      })()}
      <Note text={p.note} />
    </AbsoluteFill>
  );
};

/* ======================================================= 2) DEVICES — 3D laptop + phone, flip transitions, floating chips */
const Laptop: React.FC<{s: Seg; sp: number; at: number}> = ({s, sp, at}) => (
  <div style={{position: 'absolute', left: 60, width: 960, top: 560}}>
    <div style={{height: 560, borderRadius: '26px 26px 8px 8px', background: '#111', padding: 16, boxShadow: '0 50px 100px rgba(0,0,0,.35)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden'}}><Clip src={s.clip} from={s.from} speed={sp} at={at} /></div>
    </div>
    <div style={{height: 34, margin: '0 -50px', borderRadius: '0 0 30px 30px', background: 'linear-gradient(#d6d7da,#9fa1a5)'}} />
  </div>
);
const Phone: React.FC<{s: Seg; sp: number; at: number}> = ({s, sp, at}) => (
  <div style={{position: 'absolute', right: 70, top: 880, width: 300, height: 620, borderRadius: 52, background: '#0b0b0d', padding: 12,
    boxShadow: '0 40px 80px rgba(0,0,0,.45)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 42, overflow: 'hidden', background: '#000'}}>
      <Clip src={s.mclip ?? s.clip} from={s.mfrom ?? s.from} speed={sp} at={at} style={{objectPosition: s.mclip ? 'center' : '30% center'}} />
    </div>
  </div>
);
export const AdDevices: React.FC<AdProps> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = p.speed ?? 1.15;
  const st = starts(p);
  const end = st[st.length - 1] + segF(p.segs[p.segs.length - 1]);
  const idx = Math.max(0, st.reduce((a, s, i) => (f >= s ? i : a), 0));
  const cur = p.segs[idx];
  const prev = p.segs[Math.max(0, idx - 1)];
  const mix = interpolate(f - st[idx], [0, T], [0, 1], clamp);
  const chips = ['Scroll-Effekte', '3D', 'Animation', 'Mobil optimiert', 'Glas-Look', 'Parallax'];
  return (
    <AbsoluteFill style={{background: '#EDEDF0', overflow: 'hidden', fontFamily: 'Inter'}}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{background: `radial-gradient(60% 45% at 25% 30%, ${prev.color}66, transparent 70%), radial-gradient(60% 45% at 80% 75%, ${cur.color}${Math.round(mix * 153).toString(16).padStart(2, '0')}, transparent 70%)`}} />
      {/* headline */}
      <div style={{position: 'absolute', top: 200, left: 70, right: 70}}>
        <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 30, letterSpacing: 8, color: '#555'}}>{p.brand.toUpperCase()} WEBDESIGN</div>
        <div style={{position: 'relative', height: 140, overflow: 'hidden', marginTop: 10}}>
          {p.segs.map((s, i) => {
            const l = f - st[i];
            const y = interpolate(l, [-6, 6, segF(s) - 6, segF(s) + 6], [100, 0, 0, -100], clamp);
            return <div key={i} style={{position: 'absolute', fontFamily: 'Anton', fontSize: 124, color: '#111', lineHeight: 1.1,
              transform: `translateY(${y}%)`}}>{s.label}<span style={{color: s.color}}>.</span></div>;
          })}
        </div>
      </div>
      {/* device stage with flip */}
      {p.segs.map((s, i) => {
        const l = f - st[i], d = segF(s);
        if (l < -T || l > d + T) return null;
        const rin = interpolate(l, [-T, T], [80, 0], {...clamp, easing: Easing.out(Easing.cubic)});
        const rout = interpolate(l, [d - T, d + T], [0, -80], {...clamp, easing: Easing.in(Easing.cubic)});
        const op = interpolate(l, [-T, 0, d, d + T], [0, 1, 1, 0], clamp);
        const float = Math.sin((f + i * 20) / 18) * 10;
        return (
          <AbsoluteFill key={i} style={{perspective: 1800, opacity: op}}>
            <AbsoluteFill style={{transform: `rotateY(${rin + rout}deg) translateY(${float}px)`, transformStyle: 'preserve-3d'}}>
              <Laptop s={s} sp={sp} at={st[i]} /><Phone s={s} sp={sp} at={st[i]} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      {/* intro devices rise */}
      <AbsoluteFill style={{background: '#EDEDF0', opacity: interpolate(f, [INTRO - 14, INTRO], [1, 0], clamp), justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{fontFamily: 'Anton', fontSize: 140, color: '#111', transform: `translateY(${(1 - spring({frame: f, fps})) * 200}px)`}}>{p.brand}</div>
        <div style={{fontSize: 50, color: '#333', opacity: spring({frame: f - 12, fps})}}>baut Websites, die man scrollen will.</div>
      </AbsoluteFill>
      {/* floating chips */}
      {f >= INTRO && f < end && chips.map((c, k) => {
        const birth = INTRO + k * 22;
        const s = spring({frame: f - birth, fps, config: {damping: 10}});
        const pos = [[70, 1300], [560, 470], [90, 1560], [640, 1640], [700, 1240], [300, 470]][k];
        return <div key={c} style={{position: 'absolute', left: pos[0], top: pos[1], transform: `scale(${s}) translateY(${Math.sin((f + k * 30) / 14) * 8}px)`,
          background: 'rgba(255,255,255,.72)', border: '1px solid #fff', backdropFilter: 'blur(14px)', borderRadius: 999, padding: '14px 26px',
          fontSize: 30, fontWeight: 600, color: '#111', boxShadow: '0 10px 30px rgba(0,0,0,.12)'}}>{c}</div>;
      })}
      {/* outro: mosaic of all designs + CTA */}
      {f >= end - 6 && (() => {
        const o = interpolate(f, [end - 6, end + 8], [0, 1], clamp);
        return (
          <AbsoluteFill style={{background: '#111', opacity: o, padding: 50, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignContent: 'start', paddingTop: 220}}>
            {p.segs.slice(0, 6).map((s, i) => {
              const sp2 = spring({frame: f - end - i * 3, fps, config: {damping: 14}});
              return <div key={i} style={{height: 300, borderRadius: 24, overflow: 'hidden', transform: `scale(${0.6 + sp2 * 0.4})`, opacity: sp2}}>
                <Clip src={s.clip} from={s.from + 1} speed={sp} at={end} /></div>;
            })}
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 170, textAlign: 'center'}}>
              <div style={{fontFamily: 'Anton', fontSize: 90, color: '#fff'}}>{p.line1}</div>
              <div style={{fontSize: 40, color: '#ffffffbb', marginTop: 8}}>{p.cta}</div>
            </div>
          </AbsoluteFill>
        );
      })()}
      <Note text={p.note} color={f >= end ? '#ffffff88' : '#00000077'} />
    </AbsoluteFill>
  );
};

/* ======================================================= 3) KINETIC — giant type, glitch RGB split, slice wipes, flashes */
export const AdKinetic: React.FC<AdProps> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = p.speed ?? 1.4;
  const st = starts(p);
  const end = st[st.length - 1] + segF(p.segs[p.segs.length - 1]);
  const idx = st.reduce((a, s, i) => (f >= s ? i : a), -1);
  const sinceCut = idx >= 0 ? f - st[idx] : 999;
  const glitch = sinceCut < 5 ? (5 - sinceCut) * 9 : 0;
  const flash = interpolate(sinceCut, [0, 3], [0.7, 0], clamp);
  const words = (p.line1 + ' ' + p.line2).split(' ');
  return (
    <AbsoluteFill style={{background: '#0a0a0a', overflow: 'hidden'}}>
      <style>{fontCss}</style>
      {/* intro: words slam in one by one */}
      {f < INTRO && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          {['WEB', 'DESIGN', 'DAS', 'MAN', 'SPÜRT.'].map((w, i) => {
            const s = spring({frame: f - i * 9, fps, config: {damping: 9, mass: 0.5}});
            return <div key={w} style={{fontFamily: 'Anton', fontSize: 150, lineHeight: 1.02, color: i === 4 ? '#FF7A1A' : '#fff',
              transform: `scale(${1.8 - Math.min(1, s) * 0.8})`, opacity: Math.min(1, s)}}>{w}</div>;
          })}
        </AbsoluteFill>
      )}
      {p.segs.map((s, i) => {
        const l = f - st[i], d = segF(s);
        if (l < 0 || l >= d) return null;
        const big = s.label.toUpperCase();
        const slide = interpolate(l, [0, d], [40, -40]);
        const wipe = interpolate(l, [d - 8, d], [0, 1], clamp);
        return (
          <AbsoluteFill key={i}>
            <AbsoluteFill style={{background: s.color}} />
            {/* giant word, outlined, moving */}
            <div style={{position: 'absolute', top: 210, left: 0, whiteSpace: 'nowrap', fontFamily: 'Anton', fontSize: 330, lineHeight: 1,
              color: 'transparent', WebkitTextStroke: '4px #0a0a0a', transform: `translateX(${-l * 9}px)`}}>{big} {big} {big}</div>
            {/* skewed clip frame with RGB split on cut */}
            <div style={{position: 'absolute', left: 50, right: 50, top: 640, height: 640, transform: `skewY(-4deg) translateX(${slide}px)`}}>
              {glitch > 0 && <>
                <div style={{position: 'absolute', inset: 0, transform: `translateX(${glitch}px)`, mixBlendMode: 'screen', opacity: .7}}>
                  <div style={{width: '100%', height: '100%', background: '#ff0040', opacity: .5}} /></div>
                <div style={{position: 'absolute', inset: 0, transform: `translateX(${-glitch}px)`, mixBlendMode: 'screen', opacity: .7}}>
                  <div style={{width: '100%', height: '100%', background: '#00e5ff', opacity: .45}} /></div>
              </>}
              <div style={{position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden', border: '6px solid #0a0a0a',
                boxShadow: '18px 18px 0 #0a0a0a', transform: `translateX(${glitch ? (i % 2 ? glitch : -glitch) / 2 : 0}px)`}}>
                <Clip src={s.clip} from={s.from} speed={sp} at={st[i]} />
              </div>
            </div>
            <div style={{position: 'absolute', top: 1390, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'end'}}>
              <div style={{fontFamily: 'Anton', fontSize: 120, color: '#0a0a0a', lineHeight: 0.95}}>{s.tag ?? s.label}</div>
              <div style={{fontFamily: 'Anton', fontSize: 70, color: '#0a0a0a'}}>{String(i + 1).padStart(2, '0')}/{String(p.segs.length).padStart(2, '0')}</div>
            </div>
            {/* slice wipe out: 6 bars */}
            {wipe > 0 && Array.from({length: 6}).map((_, k) => (
              <div key={k} style={{position: 'absolute', left: 0, right: 0, top: `${(k * 100) / 6}%`, height: `${100 / 6 + 0.5}%`, background: '#0a0a0a',
                transform: `translateX(${(k % 2 ? 1 : -1) * (1 - Math.min(1, wipe * 1.4 - k * 0.07)) * 100}%)`}} />
            ))}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{background: '#fff', opacity: idx >= 0 && f < end ? flash : 0, pointerEvents: 'none'}} />
      {f >= INTRO && f < end && <div style={{position: 'absolute', top: 120, left: 60, fontFamily: 'Inter', fontWeight: 600, fontSize: 30,
        color: '#0a0a0a', letterSpacing: 4}}>{p.brand.toUpperCase()} WEBDESIGN</div>}
      {f >= end && (
        <AbsoluteFill style={{background: '#0a0a0a', justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', padding: 70}}>
          {words.map((w, i) => {
            const s = spring({frame: f - end - i * 4, fps, config: {damping: 11}});
            return <div key={i} style={{fontFamily: 'Anton', fontSize: 130, lineHeight: 0.95, color: i === words.length - 1 ? '#FF7A1A' : '#fff',
              transform: `translateX(${(1 - s) * -300}px)`, opacity: s}}>{w}</div>;
          })}
          <div style={{marginTop: 40, fontFamily: 'Inter', fontWeight: 600, fontSize: 40, color: '#0a0a0a', background: '#FF7A1A', padding: '18px 34px',
            borderRadius: 14, opacity: spring({frame: f - end - 26, fps})}}>{p.cta}</div>
        </AbsoluteFill>
      )}
      <Note text={p.note} color={f >= INTRO && f < end ? '#0a0a0a99' : '#ffffff88'} />
    </AbsoluteFill>
  );
};
