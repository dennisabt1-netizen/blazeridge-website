import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import timing from './timing.json';

const BG = '#07060A';
const INK = '#F6F2F7';
const MUTED = 'rgba(246,242,247,0.62)';
const ACCENT = '#FF6A1A';
const SEA = '#3BA4FF';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const fontCss = `
@font-face{font-family:'Anton';src:url('${staticFile('Anton-400-latin.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:400;src:url('${staticFile('Inter-400-latin.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:600;src:url('${staticFile('Inter-600-latin.woff2')}') format('woff2');}
`;

const SUBS = [
  'Was passiert mit deinem Körper, wenn du 24 Stunden nicht schläfst?',
  'Nach etwa 17 Stunden wach reagierst du so langsam wie mit 0,5 Promille.',
  'Nach 24 Stunden ist es wie mit rund 1 Promille.',
  'Dein Gehirn schaltet in Sekundenschlaf. Für einen Moment bist du weg, ohne es zu merken.',
  'Dein Hunger steigt, besonders auf Süßes und Fettiges.',
  'Die gute Nachricht: Eine Nacht guter Schlaf bringt das meiste wieder in Ordnung.',
];

const OUTRO_FROM = timing[timing.length - 1].from + timing[timing.length - 1].dur;
export const SCHLAF24_FRAMES = OUTRO_FROM + 95;

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 50) * 22;
  const y = 38 + Math.cos(f / 70) * 14;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,106,26,0.30), transparent 55%), radial-gradient(circle at ${100 - x}% 85%, rgba(59,164,255,0.14), transparent 50%), ${BG}`,
      }}
    />
  );
};

const Particles: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(28).fill(0).map((_, i) => {
        const x = (i * 137.5) % 100;
        const speed = 0.4 + (i % 5) * 0.18;
        const y = 100 - ((f * speed + i * 37) % 120);
        const s = 3 + (i % 4) * 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              borderRadius: s,
              background: i % 3 === 0 ? ACCENT : INK,
              opacity: 0.18 + (i % 4) * 0.07,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const useIn = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 13, mass: 0.7}});
};

const Big: React.FC<{children: React.ReactNode; color?: string; size?: number; delay?: number}> = ({
  children,
  color = INK,
  size = 230,
  delay = 0,
}) => {
  const s = useIn(delay);
  return (
    <div
      style={{
        fontFamily: 'Anton, Impact, sans-serif',
        fontSize: size,
        lineHeight: 0.95,
        color,
        textTransform: 'uppercase',
        textAlign: 'center',
        opacity: s,
        transform: `translateY(${(1 - s) * 80}px) scale(${0.9 + s * 0.1})`,
        filter: `blur(${(1 - s) * 12}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Small: React.FC<{children: React.ReactNode; delay?: number; color?: string}> = ({children, delay = 8, color = MUTED}) => {
  const s = useIn(delay);
  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 58,
        color,
        textAlign: 'center',
        marginTop: 30,
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px', paddingBottom: 260}}>
    {children}
  </AbsoluteFill>
);

const Clock: React.FC = () => {
  const f = useCurrentFrame();
  const a = f * 9;
  return (
    <svg width="300" height="300" viewBox="0 0 100 100" style={{marginBottom: 50}}>
      <circle cx="50" cy="50" r="44" fill="none" stroke={ACCENT} strokeWidth="5" />
      <line x1="50" y1="50" x2="50" y2="22" stroke={INK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${a / 12} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="14" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
      <circle cx="50" cy="50" r="4" fill={INK} />
    </svg>
  );
};

const Meter: React.FC<{target: number; label: string}> = ({target, label}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [10, 55], [0, target], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{width: 820, marginTop: 50}}>
      <div style={{height: 46, borderRadius: 23, background: 'rgba(246,242,247,0.12)', overflow: 'hidden'}}>
        <div style={{width: `${(v / 1.2) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${SEA}, ${ACCENT})`}} />
      </div>
      <div style={{fontFamily: 'Anton, Impact, sans-serif', fontSize: 120, color: ACCENT, textAlign: 'center', marginTop: 24}}>
        ≈ {v.toFixed(1).replace('.', ',')} ‰
      </div>
      <div style={{fontFamily: 'Inter, sans-serif', fontSize: 44, color: MUTED, textAlign: 'center'}}>{label}</div>
    </div>
  );
};

const Scene1: React.FC = () => (
  <Center>
    <Clock />
    <Big color={ACCENT}>24 Stunden</Big>
    <Big delay={10} size={150}>ohne Schlaf?</Big>
  </Center>
);

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const h = Math.round(interpolate(f, [0, 30], [0, 17], clamp));
  return (
    <Center>
      <Big size={260}>{h} h</Big>
      <Small delay={4}>wach</Small>
      <Meter target={0.5} label="Reaktion wie mit Alkohol im Blut" />
    </Center>
  );
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const h = Math.round(interpolate(f, [0, 20], [17, 24], clamp));
  return (
    <Center>
      <Big size={260} color={ACCENT}>{h} h</Big>
      <Meter target={1.0} label="wie rund 1 Promille" />
    </Center>
  );
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  // Kurze Blackouts als "Sekundenschlaf"
  const blink = (f > 55 && f < 63) || (f > 95 && f < 101) ? 1 : 0;
  return (
    <>
      <Center>
        <Big size={170}>Sekunden</Big>
        <Big size={170} color={ACCENT} delay={6}>schlaf</Big>
        <Small delay={14}>Du bist kurz weg – und merkst es nicht.</Small>
      </Center>
      <AbsoluteFill style={{background: '#000', opacity: blink}} />
    </>
  );
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const bounce = Math.sin(f / 5) * 10;
  return (
    <Center>
      <div style={{fontFamily: 'Anton, Impact, sans-serif', fontSize: 300, color: ACCENT, transform: `translateY(${bounce}px)`}}>↑</div>
      <Big size={200}>Hunger</Big>
      <Small delay={10} color={INK}>Süßes · Fettiges</Small>
    </Center>
  );
};

const Scene6: React.FC = () => {
  const s = useIn(0);
  return (
    <Center>
      <svg width="260" height="260" viewBox="0 0 100 100" style={{marginBottom: 40, opacity: s, transform: `rotate(${(1 - s) * -40}deg)`}}>
        <path d="M62 12a38 38 0 1 0 26 54A30 30 0 0 1 62 12z" fill={ACCENT} />
      </svg>
      <Big size={170}>1 Nacht Schlaf</Big>
      <Small delay={12} color={INK}>bringt das meiste wieder in Ordnung</Small>
    </Center>
  );
};

const Outro: React.FC = () => {
  const s = useIn(0);
  return (
    <Center>
      <div style={{fontFamily: 'Anton, Impact, sans-serif', fontSize: 150, letterSpacing: 8, color: INK, opacity: s}}>
        BLAZE<span style={{color: ACCENT}}>RIDGE</span>
      </div>
      <Small delay={8} color={INK}>Folge @blazeridge</Small>
      <Small delay={14}>für mehr „Was wäre, wenn …?“</Small>
    </Center>
  );
};

const Subtitle: React.FC<{text: string}> = ({text}) => {
  const s = useIn(0);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 230}}>
      <div
        style={{
          maxWidth: 940,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 50,
          lineHeight: 1.3,
          color: INK,
          textAlign: 'center',
          background: 'rgba(0,0,0,0.55)',
          padding: '18px 30px',
          borderRadius: 20,
          opacity: s,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Badge: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'flex-start', padding: 60}}>
    <div style={{fontFamily: 'Inter, sans-serif', fontSize: 34, color: MUTED, border: `2px solid ${MUTED}`, borderRadius: 14, padding: '8px 18px'}}>
      KI-Stimme · Quelle: Dawson & Reid, Nature 1997
    </div>
  </AbsoluteFill>
);

const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

export const Schlaf24: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: BG}}>
    <style>{fontCss}</style>
    <Background />
    <Particles />
    {timing.map((t, i) => {
      const S = scenes[i];
      return (
        <Sequence key={i} from={t.from} durationInFrames={t.dur}>
          <S />
          <Subtitle text={SUBS[i]} />
        </Sequence>
      );
    })}
    <Sequence from={OUTRO_FROM} durationInFrames={95}>
      <Outro />
    </Sequence>
    <Badge />
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
