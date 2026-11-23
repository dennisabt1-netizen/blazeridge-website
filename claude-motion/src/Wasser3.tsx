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
import timing from './timing3.json';

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
  'Ohne Wasser überlebst du nur etwa drei Tage. Was passiert in dieser Zeit?',
  'Schon bei 2 % Flüssigkeitsverlust lässt deine Konzentration nach. Kopfschmerzen kommen.',
  'Am zweiten Tag wird dein Blut dicker. Dein Herz schlägt schneller, die Nieren sparen jeden Tropfen.',
  'Am dritten Tag wird es lebensgefährlich: Verwirrung, Kreislaufkollaps.',
  'Hitze und Bewegung verkürzen diese Zeit deutlich.',
  'Deshalb: Trink regelmäßig, nicht erst, wenn du Durst hast.',
];

const OUTRO_FROM = timing[timing.length - 1].from + timing[timing.length - 1].dur;
export const WASSER_FRAMES = OUTRO_FROM + 95;

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


const Drop: React.FC<{fill: number; size?: number}> = ({fill, size = 300}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 100 125" style={{marginBottom: 40}}>
    <defs>
      <clipPath id="dc"><path d="M50 5C50 5 12 55 12 82a38 38 0 0 0 76 0C88 55 50 5 50 5z" /></clipPath>
    </defs>
    <path d="M50 5C50 5 12 55 12 82a38 38 0 0 0 76 0C88 55 50 5 50 5z" fill="rgba(59,164,255,0.12)" stroke={SEA} strokeWidth="4" />
    <rect x="0" y={125 - fill * 120} width="100" height="125" fill={SEA} clipPath="url(#dc)" opacity={0.85} />
  </svg>
);

const DayTag: React.FC<{n: number}> = ({n}) => {
  const s = useIn(0);
  return (
    <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 52, color: BG, background: ACCENT, borderRadius: 40, padding: '10px 36px', marginBottom: 30, opacity: s, transform: `scale(${0.8 + s * 0.2})`}}>
      TAG {n}
    </div>
  );
};

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [0, 110], [1, 0.15], clamp);
  return (
    <Center>
      <Drop fill={fill} />
      <Big color={ACCENT}>3 Tage</Big>
      <Big delay={10} size={150}>ohne Wasser?</Big>
    </Center>
  );
};

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [5, 40], [0, 2], clamp);
  const throb = 1 + Math.max(0, Math.sin(f / 4)) * 0.06 * (f > 70 ? 1 : 0);
  return (
    <Center>
      <DayTag n={1} />
      <Big size={260}>−{p.toFixed(0)} %</Big>
      <Small delay={6}>Flüssigkeit</Small>
      <div style={{transform: `scale(${throb})`}}>
        <Small delay={60} color={INK}>Konzentration ↓ · Kopfschmerz</Small>
      </div>
    </Center>
  );
};

const Heart: React.FC = () => {
  const f = useCurrentFrame();
  const beat = 1 + Math.max(0, Math.sin(f / 3)) * 0.12;
  return (
    <svg width="260" height="240" viewBox="0 0 100 92" style={{transform: `scale(${beat})`, marginBottom: 30}}>
      <path d="M50 88S6 60 6 30A22 22 0 0 1 50 18a22 22 0 0 1 44 12c0 30-44 58-44 58z" fill={ACCENT} />
    </svg>
  );
};

const Scene3: React.FC = () => (
  <Center>
    <DayTag n={2} />
    <Heart />
    <Big size={150}>Blut dicker</Big>
    <Small delay={12} color={INK}>Herz schneller · Nieren sparen</Small>
  </Center>
);

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const shake = f > 20 ? Math.sin(f * 2.3) * 6 : 0;
  const red = interpolate(f, [0, 60], [0, 0.28], clamp);
  return (
    <>
      <AbsoluteFill style={{background: `rgba(200,20,20,${red})`}} />
      <Center>
        <DayTag n={3} />
        <div style={{transform: `translateX(${shake}px)`}}>
          <Big size={200} color={ACCENT}>Lebens</Big>
          <Big size={200} delay={5}>gefahr</Big>
        </div>
        <Small delay={14} color={INK}>Verwirrung · Kreislaufkollaps</Small>
      </Center>
    </>
  );
};

const Sun: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width="280" height="280" viewBox="0 0 100 100" style={{marginBottom: 30, transform: `rotate(${f * 1.5}deg)`}}>
      {new Array(10).fill(0).map((_, i) => (
        <line key={i} x1="50" y1="6" x2="50" y2="18" stroke={ACCENT} strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 36} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="24" fill={ACCENT} />
    </svg>
  );
};

const Scene5: React.FC = () => (
  <Center>
    <Sun />
    <Big size={170}>Hitze + Sport</Big>
    <Small delay={10} color={INK}>= deutlich weniger Zeit</Small>
  </Center>
);

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [5, 70], [0.1, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Center>
      <Drop fill={fill} size={240} />
      <Big size={170}>Trink vorher</Big>
      <Small delay={12} color={INK}>nicht erst bei Durst</Small>
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
      <Small delay={14}>für mehr Körper-Wissen</Small>
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
      KI-Stimme · keine medizinische Beratung
    </div>
  </AbsoluteFill>
);

const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

export const Wasser3: React.FC = () => (
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
    <Audio src={staticFile('voice3.wav')} />
  </AbsoluteFill>
);
