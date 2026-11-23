import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fontCss = `
@font-face{font-family:'Anton';src:url('${staticFile('Anton-400-latin.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:400;src:url('${staticFile('Inter-400-latin.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:600;src:url('${staticFile('Inter-600-latin.woff2')}') format('woff2');}`;

export type DeskProps = {
  clip: string; clipSeconds: number; speed?: number; caption: string; handle: string; brand: string;
  outroLine?: string; accent?: string; theme?: 'night' | 'day';
};
export type ListProps = {
  clip: string; clipSeconds: number; speed?: number; title: string; handle: string;
  items: {label: string; at: number}[]; url?: string;
};
export type CollageProps = {
  shots: string[]; clip: string; clipSeconds: number; speed?: number; brand: string; lines: string[];
  handle: string; a1?: string; a2?: string;
};

const IG = ({size = 34, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill={color} />
  </svg>
);

/* ------------------------------------------------------------------ DeskMonitor
   Handheld phone shot of a desk monitor playing the site (like 'Claude isn't making this'). */
export const DeskMonitor: React.FC<DeskProps> = (p) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const speed = p.speed ?? 1.25;
  const clipFrames = Math.round((p.clipSeconds / speed) * fps);
  const outroStart = clipFrames;
  // handheld wobble + slow push-in
  const wob = (k: number, s: number) => Math.sin(f / s + k) * 1 + Math.sin(f / (s * 0.37) + k * 2) * 0.5;
  const push = interpolate(f, [0, clipFrames], [1, 1.12], clamp);
  const dim = interpolate(f, [outroStart, outroStart + 12], [0, 0.82], clamp);
  const night = (p.theme ?? 'night') === 'night';
  const glow = p.accent ?? '#FFE14D';
  const cap = spring({frame: f - 4, fps, config: {damping: 14}});
  const o = spring({frame: f - outroStart - 6, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: night ? '#14110d' : '#d9d4cc', overflow: 'hidden'}}>
      <style>{fontCss}</style>
      {/* room */}
      <AbsoluteFill style={{background: night
        ? `radial-gradient(70% 45% at 50% 52%, ${glow}55, transparent 70%), linear-gradient(180deg,#2a241c 0%,#17130e 55%,#0c0a07 100%)`
        : 'linear-gradient(180deg,#e9e5de,#cfc8bd)'}} />
      <AbsoluteFill style={{transform: `scale(${push}) translate(${wob(0, 23) * 3}px, ${wob(1, 29) * 3}px) rotate(${wob(2, 41) * 0.4}deg)`}}>
        {/* desk */}
        <div style={{position: 'absolute', left: -100, right: -100, top: 1240, bottom: -100,
          background: night ? 'linear-gradient(180deg,#3a3026,#1a150f)' : 'linear-gradient(180deg,#bfb5a6,#9d927f)'}} />
        <div style={{position: 'absolute', left: 140, right: 140, top: 1250, height: 220, borderRadius: '50%',
          background: `radial-gradient(closest-side, ${glow}66, transparent)`, filter: 'blur(30px)'}} />
        {/* stand */}
        <div style={{position: 'absolute', left: 455, width: 170, top: 1180, height: 120, background: 'linear-gradient(90deg,#9a9a9a,#d6d6d6,#9a9a9a)'}} />
        <div style={{position: 'absolute', left: 360, width: 360, top: 1292, height: 22, borderRadius: 8, background: 'linear-gradient(#cfcfcf,#8d8d8d)'}} />
        {/* keyboard */}
        <div style={{position: 'absolute', left: 120, width: 560, top: 1400, height: 120, borderRadius: 16, background: '#d9d9d9',
          transform: 'perspective(800px) rotateX(55deg)', boxShadow: '0 20px 40px rgba(0,0,0,.5)', opacity: night ? 0.55 : 0.9}} />
        {/* monitor */}
        <div style={{position: 'absolute', left: 40, width: 1000, top: 520, height: 680, borderRadius: 26,
          background: 'linear-gradient(#cfd0d2,#a9aaad)', padding: '22px 22px 92px', boxShadow: `0 40px 90px rgba(0,0,0,.6), 0 0 120px ${glow}40`}}>
          <div style={{width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', background: '#000'}}>
            <OffthreadVideo src={staticFile(p.clip)} playbackRate={speed} muted
              style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </div>
        {/* screen reflection */}
        <div style={{position: 'absolute', left: 62, width: 956, top: 542, height: 544, borderRadius: 8,
          background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, transparent 35%, transparent 70%, rgba(255,255,255,.05) 100%)'}} />
      </AbsoluteFill>
      {/* grain + vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)'}} />
      {/* caption sticker */}
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: cap,
        transform: `scale(${0.9 + cap * 0.1})`}}>
        <div style={{background: '#fff', color: '#111', borderRadius: 18, padding: '18px 30px', fontFamily: 'Inter', fontWeight: 600,
          fontSize: 50, boxShadow: '0 10px 30px rgba(0,0,0,.35)', maxWidth: 900, textAlign: 'center'}}>{p.caption}</div>
      </div>
      <div style={{position: 'absolute', top: 440, right: 90, display: 'flex', alignItems: 'center', gap: 10, color: '#fff',
        fontFamily: 'Inter', fontWeight: 600, fontSize: 26, opacity: 0.9}}><IG size={30} />{p.handle}</div>
      {/* outro */}
      <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
      {f >= outroStart && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 26, opacity: o}}>
          <IG size={150} />
          <div style={{fontFamily: 'Anton', fontSize: 92, color: '#fff', letterSpacing: 2}}>{p.handle}</div>
          {p.outroLine && <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 40, color: '#ffffffcc'}}>{p.outroLine}</div>}
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter', fontSize: 24,
        color: '#ffffff99'}}>{p.brand}</div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ EffectsList
   '10 Scroll Effects' format: title, browser window with the clip, numbered list fills in. */
export const EffectsList: React.FC<ListProps> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const speed = p.speed ?? 1.35;
  const t = (f / fps) * speed; // seconds into the clip
  const clipEnd = Math.round((p.clipSeconds / speed) * fps);
  const active = p.items.reduce((acc, it, i) => (t >= it.at ? i : acc), -1);
  const dim = interpolate(f, [clipEnd, clipEnd + 10], [0, 0.65], clamp);
  const o = spring({frame: f - clipEnd - 4, fps, config: {damping: 12}});
  const half = Math.ceil(p.items.length / 2);
  return (
    <AbsoluteFill style={{background: '#e9e9ea', fontFamily: 'Inter'}}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{opacity: 0.5, background:
        'radial-gradient(60% 30% at 30% 20%, #fff, transparent), radial-gradient(50% 40% at 80% 80%, #d5d5d8, transparent)'}} />
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontWeight: 600, fontSize: 86,
        letterSpacing: -2, color: '#111'}}>{p.title}</div>
      <div style={{position: 'absolute', top: 262, right: 70, fontSize: 26, color: '#444'}}>{p.handle}</div>
      <div style={{position: 'absolute', top: 320, left: 40, right: 40, height: 720, borderRadius: 22, overflow: 'hidden',
        background: '#111', boxShadow: '0 30px 70px rgba(0,0,0,.28)'}}>
        <div style={{height: 44, background: '#1e1e1e', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px'}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
          <div style={{flex: 1, textAlign: 'center', color: '#aaa', fontSize: 20}}>{p.url ?? ''}</div>
        </div>
        <OffthreadVideo src={staticFile(p.clip)} playbackRate={speed} muted
          style={{width: '100%', height: 676, objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', top: 1110, left: 70, right: 40, display: 'grid', gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: `repeat(${half}, 74px)`, gridAutoFlow: 'column', columnGap: 30}}>
        {p.items.map((it, i) => {
          const shown = i <= active;
          const s = spring({frame: f - Math.round((it.at / speed) * fps), fps, config: {damping: 14}});
          return (
            <div key={i} style={{fontSize: 38, color: '#111', display: 'flex', gap: 14, alignItems: 'baseline'}}>
              <span style={{fontWeight: 600, width: 56}}>{i + 1}.</span>
              <span style={{fontWeight: i === active ? 600 : 400, opacity: shown ? s : 0,
                transform: `translateX(${shown ? (1 - s) * 30 : 30}px)`}}>{it.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontSize: 24, color: '#666'}}>
        Alle Effekte: GSAP · Lenis · three.js</div>
      <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
      {f >= clipEnd && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24, opacity: o}}>
          <IG size={150} /><div style={{fontFamily: 'Anton', fontSize: 84, color: '#fff'}}>{p.handle}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ CaseCollage
   Product/app case-study reel: glass tiles of screenshots with ken-burns, statement lines, then the clip. */
export const CaseCollage: React.FC<CollageProps> = (p) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a1 = p.a1 ?? '#2F7BFF', a2 = p.a2 ?? '#FF6B5A';
  const speed = p.speed ?? 1.3;
  const introF = 4 * fps;
  const clipF = Math.round((p.clipSeconds / speed) * fps);
  const lineIdx = Math.min(p.lines.length - 1, Math.floor(f / (introF / p.lines.length)));
  const tiles = p.shots.slice(0, 6);
  const end = introF + clipF;
  const o = spring({frame: f - end - 4, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: '#eef0f3', fontFamily: 'Inter', overflow: 'hidden'}}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{background: `radial-gradient(50% 35% at 15% 15%, ${a1}aa, transparent 70%), radial-gradient(45% 35% at 90% 85%, ${a2}aa, transparent 70%)`,
        filter: 'blur(20px)'}} />
      <Sequence durationInFrames={introF}>
        <AbsoluteFill style={{padding: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignContent: 'center'}}>
          {tiles.map((s, i) => {
            const sp = spring({frame: f - i * 5, fps, config: {damping: 15}});
            const z = interpolate(f, [0, introF], [1.05, 1.25]);
            return (
              <div key={i} style={{height: 470, borderRadius: 40, overflow: 'hidden', opacity: sp, transform: `translateY(${(1 - sp) * 80}px)`,
                border: '2px solid rgba(255,255,255,.8)', boxShadow: '0 30px 60px -20px rgba(20,30,60,.4)'}}>
                <Img src={staticFile(s)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`,
                  transformOrigin: i % 2 ? '70% 30%' : '30% 60%'}} />
              </div>
            );
          })}
        </AbsoluteFill>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{background: 'rgba(255,255,255,.6)', backdropFilter: 'blur(24px)', borderRadius: 36, padding: '34px 46px',
            fontSize: 58, fontWeight: 400, letterSpacing: -1.5, maxWidth: 860, textAlign: 'center', color: '#0e1116',
            border: '1px solid rgba(255,255,255,.9)'}}>{p.lines[lineIdx]}</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={introF} durationInFrames={clipF}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{width: 980, height: 1520, borderRadius: 60, overflow: 'hidden', background: '#000',
            boxShadow: '0 40px 90px -30px rgba(0,0,0,.6)', border: '10px solid #0b0d12'}}>
            <OffthreadVideo src={staticFile(p.clip)} playbackRate={speed} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </AbsoluteFill>
      </Sequence>
      {f >= end && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 26, opacity: o,
          background: `linear-gradient(135deg, ${a1}, ${a2})`}}>
          <div style={{fontSize: 120, color: '#fff', fontWeight: 600, letterSpacing: -4}}>{p.brand}</div>
          <div style={{display: 'flex', gap: 12, alignItems: 'center', color: '#fff', fontSize: 40}}><IG size={44} />{p.handle}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
