import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DeskMonitor, EffectsList, CaseCollage} from './PromoVideos';

// Durations come from props (calculateMetadata), so one entry fits every clip.
const fps = 30;
const dur = (sec: number, speed: number, extra: number) => Math.round((sec / speed) * fps) + Math.round(extra * fps);

const Root: React.FC = () => (
  <>
    <Composition id="DeskMonitor" component={DeskMonitor as any} fps={fps} width={1080} height={1920} durationInFrames={300}
      defaultProps={{clip: 'promo/clip.mp4', clipSeconds: 10, caption: 'Claude hat diese Website gebaut', handle: '@blazeridge', brand: 'BlazeRidge'}}
      calculateMetadata={({props}: any) => ({durationInFrames: dur(props.clipSeconds, props.speed ?? 1.25, 2.6)})} />
    <Composition id="EffectsList" component={EffectsList as any} fps={fps} width={1080} height={1920} durationInFrames={300}
      defaultProps={{clip: 'promo/clip.mp4', clipSeconds: 10, title: '10 Scroll-Effekte', handle: '@blazeridge', items: []}}
      calculateMetadata={({props}: any) => ({durationInFrames: dur(props.clipSeconds, props.speed ?? 1.35, 2.4)})} />
    <Composition id="CaseCollage" component={CaseCollage as any} fps={fps} width={1080} height={1920} durationInFrames={300}
      defaultProps={{shots: [], clip: 'promo/clip.mp4', clipSeconds: 10, brand: 'Brand', lines: ['…'], handle: '@blazeridge'}}
      calculateMetadata={({props}: any) => ({durationInFrames: dur(props.clipSeconds, props.speed ?? 1.3, 4 + 2.4)})} />
  </>
);
registerRoot(Root);
