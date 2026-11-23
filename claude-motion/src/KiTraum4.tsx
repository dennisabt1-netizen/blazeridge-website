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
import timing from './timing4.json';

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
  'Was wäre, wenn eine KI träumen könnte? Eine erfundene Geschichte.',
  'Nachts, wenn alle schlafen, sortiert die Haushalts-KI LUMA den Tag.',
  'Sie sieht den Kaffee von heute Morgen, das Lachen am Abend, die Einkaufsliste.',
  'Und plötzlich mischt sie alles neu: Ein Kaffeebecher, der singt. Eine Küche voller Sterne.',
  'Am Morgen fragt LUMA leise: „Darf ich dir erzählen, was ich gesehen habe?“',
  'Echte KIs träumen nicht. Aber würdest du zuhören?',
];

const OUTRO_FROM = timing[timing.length - 1].from + timing[timing.length - 1].dur;
export const TRAUM_FRAMES = OUTRO_FROM + 95;

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 50) * 22;
  const y = 38 + Math.cos(f / 70) * 14;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, rgba(120,80,255,0.30), transparent 55%), radial-gradient(circle at ${100 - x}% 85%, rgba(59,164,255,0.14), transparent 50%), ${BG}`,
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


const VIOLET = '#8E6BFF';

const Stars: React.FC<{n?: number}> = ({n = 40}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(n).fill(0).map((_, i) => {
        const x = (i * 61.8) % 100;
        const y = (i * 37.3) % 70;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(f / 15 + i));
        return <div key={i} style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: 6, height: 6, borderRadius: 6, background: INK, opacity: tw}} />;
      })}
    </AbsoluteFill>
  );
};

const Eye: React.FC<{size?: number}> = ({size = 280}) => {
  const f = useCurrentFrame();
  const glow = 0.6 + 0.4 * Math.sin(f / 12);
  return (
    <div style={{width: size, height: size, borderRadius: size, marginBottom: 40, background: `radial-gradient(circle, ${INK} 0%, ${VIOLET} 35%, rgba(142,107,255,0.1) 70%)`, boxShadow: `0 0 ${80 * glow}px ${VIOLET}`, opacity: 0.6 + glow * 0.4}} />
  );
};

const Tag: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = ACCENT}) => {
  const s = useIn(0);
  return (
    <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 50, color: BG, background: color, borderRadius: 40, padding: '10px 36px', marginBottom: 30, opacity: s}}>{children}</div>
  );
};

const Scene1: React.FC = () => (
  <>
    <Stars />
    <Center>
      <Tag>FIKTION</Tag>
      <Big size={190}>Wenn KI</Big>
      <Big size={210} color={VIOLET} delay={8}>träumt</Big>
    </Center>
  </>
);

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Stars />
      <Center>
        <svg width="200" height="200" viewBox="0 0 100 100" style={{position: 'absolute', top: 260, right: 120, transform: `rotate(${Math.sin(f / 40) * 6}deg)`}}>
          <path d="M62 12a38 38 0 1 0 26 54A30 30 0 0 1 62 12z" fill={INK} opacity={0.9} />
        </svg>
        <Eye />
        <Big size={200}>LUMA</Big>
        <Small delay={10} color={INK}>sortiert den Tag</Small>
      </Center>
    </>
  );
};

const Card: React.FC<{label: string; i: number}> = ({label, i}) => {
  const s = useIn(i * 18);
  return (
    <div style={{fontFamily: 'Anton, Impact, sans-serif', fontSize: 110, color: INK, background: 'rgba(142,107,255,0.22)', border: `3px solid ${VIOLET}`, borderRadius: 30, padding: '20px 50px', margin: 18, opacity: s, transform: `translateX(${(1 - s) * (i % 2 ? 300 : -300)}px) rotate(${(i - 1) * 3}deg)`}}>
      {label}
    </div>
  );
};

const Scene3: React.FC = () => (
  <Center>
    <Card label="KAFFEE" i={0} />
    <Card label="LACHEN" i={1} />
    <Card label="EINKAUFSLISTE" i={2} />
  </Center>
);

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const wob = Math.sin(f / 6) * 8;
  return (
    <>
      <Stars n={70} />
      <Center>
        <svg width="320" height="320" viewBox="0 0 100 100" style={{marginBottom: 30, transform: `rotate(${wob}deg)`}}>
          <rect x="22" y="35" width="44" height="50" rx="8" fill={ACCENT} />
          <path d="M66 45h8a10 10 0 0 1 0 20h-8" fill="none" stroke={ACCENT} strokeWidth="6" />
          <path d="M34 60q10 10 20 0" fill="none" stroke={BG} strokeWidth="4" strokeLinecap="round" />
          <circle cx="36" cy="50" r="3" fill={BG} /><circle cx="52" cy="50" r="3" fill={BG} />
        </svg>
        {[0, 1, 2].map((k) => {
          const t = (f + k * 20) % 60;
          return (
            <div key={k} style={{position: 'absolute', top: 640 - t * 6, left: 620 + k * 60 + Math.sin(t / 5) * 20, fontSize: 90, color: VIOLET, opacity: 1 - t / 60, fontFamily: 'Inter, sans-serif', fontWeight: 600}}>♪</div>
          );
        })}
        <Big size={150} color={VIOLET}>Alles neu</Big>
        <Small delay={10} color={INK}>gemischt</Small>
      </Center>
    </>
  );
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const sky = interpolate(f, [0, 60], [0, 0.35], clamp);
  const s = useIn(20);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(0deg, rgba(255,106,26,${sky}), transparent 60%)`}} />
      <Center>
        <Eye size={200} />
        <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 64, color: BG, background: INK, borderRadius: 40, padding: '34px 44px', maxWidth: 820, textAlign: 'center', opacity: s, transform: `scale(${0.85 + s * 0.15})`}}>
          „Darf ich dir erzählen, was ich gesehen habe?“
        </div>
      </Center>
    </>
  );
};

const Scene6: React.FC = () => (
  <Center>
    <Big size={130}>Echte KIs</Big>
    <Big size={130} delay={4}>träumen nicht.</Big>
    <Small delay={30} color={VIOLET}>Aber würdest du zuhören?</Small>
  </Center>
);

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
      Fiktion
    </div>
  </AbsoluteFill>
);

const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

export const KiTraum4: React.FC = () => (
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
    <Audio src={staticFile('voice4.wav')} />
  </AbsoluteFill>
);
