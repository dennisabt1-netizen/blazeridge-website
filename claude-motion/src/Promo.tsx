import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

const BG = '#121110';
const INK = '#F4EFE6';
const MUTED = '#8C857B';
const ACCENT = '#D97757';
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Slowly drifting glow so the background is never static.
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 60) * 18;
  const y = 40 + Math.cos(f / 75) * 12;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, rgba(217,119,87,0.22), transparent 55%), ${BG}`,
      }}
    />
  );
};

const Word: React.FC<{text: string; delay: number; color?: string}> = ({text, delay, color = INK}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 14, mass: 0.6}});
  return (
    <span
      style={{
        display: 'inline-block',
        marginRight: 22,
        color,
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
        filter: `blur(${(1 - s) * 10}px)`,
      }}
    >
      {text}
    </span>
  );
};

// Scene 1: the claim, then the correction.
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [34, 46], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const fix = spring({frame: f - 44, fps: 30, config: {damping: 12}});
  const out = interpolate(f, [66, 75], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: 90, opacity: out}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 118, lineHeight: 1.08, letterSpacing: -3}}>
        <Word text="Claude" delay={0} />
        <Word text="kann" delay={5} />
        <span style={{position: 'relative', display: 'inline-block'}}>
          <Word text="keine" delay={9} color={strike > 0 ? MUTED : INK} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              height: 12,
              width: `${strike * 92}%`,
              background: ACCENT,
              borderRadius: 6,
            }}
          />
        </span>
        <Word text="Videos" delay={14} />
        <Word text="sehen." delay={18} />
        <div
          style={{
            color: ACCENT,
            fontSize: 132,
            opacity: fix,
            transform: `scale(${0.8 + fix * 0.2})`,
            transformOrigin: 'left center',
            marginTop: 40,
          }}
        >
          Jetzt schon.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const steps = [
  {n: '01', t: 'Video laden', s: 'TikTok, YouTube, Datei'},
  {n: '02', t: 'Frames ziehen', s: 'ein Bild pro Szene'},
  {n: '03', t: 'Ton transkribieren', s: 'lokal mit Whisper'},
  {n: '04', t: 'Report schreiben', s: 'direkt auf OneDrive'},
];

// Scene 2: pipeline cards drop in along a growing line.
const Pipeline: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const line = interpolate(f, [0, 60], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const out = interpolate(f, [82, 90], [1, 0], clamp);
  return (
    <AbsoluteFill style={{padding: '220px 90px', fontFamily: FONT, opacity: out}}>
      <div style={{color: ACCENT, fontSize: 40, fontWeight: 700, letterSpacing: 6, marginBottom: 70}}>
        SO FUNKTIONIERT /WATCH
      </div>
      <div style={{position: 'relative'}}>
        <div
          style={{
            position: 'absolute',
            left: 46,
            top: 40,
            width: 6,
            height: `${line * 660}px`,
            background: `linear-gradient(${ACCENT}, rgba(217,119,87,0.1))`,
            borderRadius: 3,
          }}
        />
        {steps.map((st, i) => {
          const s = spring({frame: f - i * 14, fps, config: {damping: 13}});
          return (
            <div
              key={st.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 44,
                marginBottom: 90,
                opacity: s,
                transform: `translateX(${(1 - s) * 120}px)`,
              }}
            >
              <div
                style={{
                  width: 98,
                  height: 98,
                  borderRadius: 49,
                  background: ACCENT,
                  color: BG,
                  fontSize: 38,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 40px rgba(217,119,87,0.45)',
                }}
              >
                {st.n}
              </div>
              <div>
                <div style={{color: INK, fontSize: 64, fontWeight: 800, letterSpacing: -1}}>{st.t}</div>
                <div style={{color: MUTED, fontSize: 38, marginTop: 6}}>{st.s}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Counter: React.FC<{to: number; label: string; delay: number}> = ({to, label, delay}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const s = spring({frame: f - delay, fps: 30, config: {damping: 14}});
  return (
    <div style={{opacity: s, transform: `translateY(${(1 - s) * 50}px)`, marginBottom: 70}}>
      <div style={{color: INK, fontSize: 210, fontWeight: 900, letterSpacing: -8, lineHeight: 1}}>
        {Math.round(to * p)}
      </div>
      <div style={{color: ACCENT, fontSize: 48, fontWeight: 700}}>{label}</div>
    </div>
  );
};

// Scene 3: numbers from the last real run (MotionSites clip).
const Stats: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [66, 75], [1, 0], clamp);
  return (
    <AbsoluteFill style={{padding: '260px 90px', fontFamily: FONT, opacity: out}}>
      <div style={{color: MUTED, fontSize: 42, marginBottom: 60}}>Ein 39-Sekunden-TikTok ergibt:</div>
      <Counter to={40} label="Frames gesehen" delay={4} />
      <Counter to={10} label="Sätze transkribiert" delay={14} />
      <Counter to={1} label="fertiger Report" delay={24} />
    </AbsoluteFill>
  );
};

// Scene 4: terminal typing the command.
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const cmd = '/watch vm.tiktok.com/…';
  const chars = Math.floor(interpolate(f, [8, 32], [0, cmd.length], clamp));
  const cursor = Math.floor(f / 8) % 2 === 0;
  const card = spring({frame: f, fps: 30, config: {damping: 15}});
  const tag = spring({frame: f - 34, fps: 30, config: {damping: 12}});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
      <div
        style={{
          width: 900,
          borderRadius: 28,
          background: '#1D1B19',
          border: '2px solid #2E2B27',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          opacity: card,
          transform: `scale(${0.9 + card * 0.1})`,
          overflow: 'hidden',
        }}
      >
        <div style={{display: 'flex', gap: 14, padding: '26px 30px', borderBottom: '2px solid #2E2B27'}}>
          {['#E5655A', '#E9B44C', '#62C462'].map((c) => (
            <div key={c} style={{width: 22, height: 22, borderRadius: 11, background: c}} />
          ))}
        </div>
        <div style={{padding: '60px 50px', fontFamily: 'Menlo, monospace', fontSize: 50, color: INK}}>
          <span style={{color: ACCENT}}>› </span>
          {cmd.slice(0, chars)}
          <span style={{opacity: cursor ? 1 : 0, color: ACCENT}}>▍</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 90,
          fontSize: 92,
          fontWeight: 900,
          color: INK,
          letterSpacing: -2,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 40}px)`,
          textAlign: 'center',
        }}
      >
        Claude <span style={{color: ACCENT}}>schaut</span> mit.
      </div>
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <Background />
    <Sequence durationInFrames={75}>
      <Hook />
    </Sequence>
    <Sequence from={75} durationInFrames={90}>
      <Pipeline />
    </Sequence>
    <Sequence from={165} durationInFrames={75}>
      <Stats />
    </Sequence>
    <Sequence from={240} durationInFrames={60}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
