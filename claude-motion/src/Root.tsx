import React from 'react';
import {Composition} from 'remotion';
import {Promo} from './Promo';
import {Schlaf24, SCHLAF24_FRAMES} from './Schlaf24';
import {HandyBett, HANDY_FRAMES} from './HandyBett';
import {Wasser3, WASSER_FRAMES} from './Wasser3';
import {KiTraum4, TRAUM_FRAMES} from './KiTraum4';

export const Root: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="Schlaf24" component={Schlaf24} durationInFrames={SCHLAF24_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="HandyBett" component={HandyBett} durationInFrames={HANDY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Wasser3" component={Wasser3} durationInFrames={WASSER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="KiTraum4" component={KiTraum4} durationInFrames={TRAUM_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
