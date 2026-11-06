/// <reference lib="dom" />
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { AWAKENING_VOICES,awakeningDuration } from '../src/game/awakeningVoices';
import { awakenSound,enableSound,setSound,stopBattleSound } from '../src/audio/sound';
test('every supplied awakening has audio, English script and a full voice window',()=>{
 assert.equal(Object.keys(AWAKENING_VOICES).length,9);
 for(const [id,v] of Object.entries(AWAKENING_VOICES)){
  assert(existsSync(`public${v.src}`));assert(v.lines.length>=3);assert(v.durationMs>10000);
  assert.equal(awakeningDuration(id as keyof typeof AWAKENING_VOICES),v.durationMs);
 }
 assert.equal(AWAKENING_VOICES.dan.lines[1].speaker,'Tourgen');
 assert.equal(AWAKENING_VOICES.blade.lines[1].speaker,'Wife');
});
test('new Bankai replaces voice and restarts battle theme from zero; mute and cleanup stop audio',async()=>{
 const elements:FakeAudio[]=[];
 class FakeAudio{
  currentTime=0;volume=0;paused=true;loop=false;preload='';
  constructor(public src:string){elements.push(this);}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
 }
 const oldAudio=globalThis.Audio,oldTimeout=globalThis.setTimeout,oldClear=globalThis.clearTimeout;
 let finish=()=>{};
 try{
  globalThis.Audio=FakeAudio as unknown as typeof Audio;
  globalThis.setTimeout=((fn:()=>void)=>{finish=fn;return 1;}) as unknown as typeof setTimeout;
  globalThis.clearTimeout=(()=>{}) as typeof clearTimeout;
  await enableSound();awakenSound('drake');
  const theme=elements.find(x=>x.src.includes('battle-theme'))!;
  const voice=elements.find(x=>x.src.includes('/voices/'))!;
  assert.equal(voice.src,'/audio/voices/drake.mp3');assert.equal(voice.paused,false);
  setSound({enabled:false});assert.equal(voice.paused,true);
  setSound({enabled:true});assert.equal(voice.paused,false);
  finish();assert.equal(theme.currentTime,0);assert.equal(theme.paused,false);
  theme.currentTime=45;awakenSound('dan');assert.equal(theme.currentTime,0);assert.equal(theme.paused,true);
  assert.equal(voice.src,'/audio/voices/dan.mp3');finish();assert.equal(theme.currentTime,0);assert.equal(theme.paused,false);
  stopBattleSound();assert(elements.every(x=>x.paused));
 }finally{stopBattleSound();globalThis.Audio=oldAudio;globalThis.setTimeout=oldTimeout;globalThis.clearTimeout=oldClear;}
});
