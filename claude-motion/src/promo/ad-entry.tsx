import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {AdFlow, AdDevices, AdKinetic, adFrames, FPS} from './AdVideos';

const def = {segs: [], brand: 'BlazeRidge', line1: 'Deine Website.', line2: 'Unser Design.', cta: 'Anfragen per DM', handle: '@blazeridge'};
const meta = ({props}: any) => ({durationInFrames: adFrames(props)});

const Root: React.FC = () => (
  <>
    <Composition id="AdFlow" component={AdFlow as any} fps={FPS} width={1080} height={1920} durationInFrames={300} defaultProps={def} calculateMetadata={meta} />
    <Composition id="AdDevices" component={AdDevices as any} fps={FPS} width={1080} height={1920} durationInFrames={300} defaultProps={def} calculateMetadata={meta} />
    <Composition id="AdKinetic" component={AdKinetic as any} fps={FPS} width={1080} height={1920} durationInFrames={300} defaultProps={def} calculateMetadata={meta} />
  </>
);
registerRoot(Root);
