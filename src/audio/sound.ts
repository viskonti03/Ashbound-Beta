import { awakeningDuration, awakeningVoice } from "../game/awakeningVoices";
import type { Unit } from "../game/types";
type Settings = { enabled:boolean; music:boolean; voice:boolean; effects:boolean; volume:number; message:string };
let settings:Settings={enabled:false,music:true,voice:true,effects:true,volume:.5,message:""};
const listeners=new Set<()=>void>();
export const subscribeSound=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export const soundSnapshot=()=>settings;
function update(patch:Partial<Settings>){settings={...settings,...patch};listeners.forEach(fn=>fn());}
let intro:HTMLAudioElement|undefined,theme:HTMLAudioElement|undefined,voice:HTMLAudioElement|undefined;
let endIntro:ReturnType<typeof setTimeout>|undefined;
let phase:"silent"|"awakening"|"battle"="silent",generation=0,started=0;
let currentVoice:ReturnType<typeof awakeningVoice>;
function tracks(){
 if(!intro){intro=new Audio('/audio/awakening.mp3');intro.preload='auto';}
 if(!theme){theme=new Audio('/audio/battle-theme.mp3');theme.loop=true;theme.preload='auto';}
 if(!voice){voice=new Audio('/audio/voices/dan.mp3');voice.preload='auto';}
 return {intro,theme,voice};
}
function stopTracks(){intro?.pause();theme?.pause();voice?.pause();}
function volumes(){
 const v=settings.enabled?settings.volume:0;
 if(intro)intro.volume=settings.music?v*(settings.voice&&currentVoice?.src?.length ? .25:1):0;
 if(theme)theme.volume=settings.music?v:0;
 if(voice)voice.volume=settings.voice?v:0;
}
function play(a:HTMLAudioElement){const g=generation;void a.play().catch(()=>{if(g===generation&&settings.enabled)update({message:'Audio blocked or unavailable. Use Retry audio in Settings.'});});}
function sync(){
 const a=tracks();volumes();
 if(!settings.enabled||phase==='silent'){stopTracks();return;}
 if(settings.music)play(phase==='awakening'?a.intro:a.theme);else{a.intro.pause();a.theme.pause();}
 if(phase==='awakening'&&settings.voice&&currentVoice){
  const elapsed=(performance.now()-started)/1000;
  if(a.voice.paused && elapsed<currentVoice.durationMs/1000-.8){a.voice.currentTime=elapsed;play(a.voice);}
 }else a.voice.pause();
}
function battleTrack(){
 const a=tracks();a.intro.pause();a.voice.pause();a.theme.pause();a.theme.currentTime=0;
 phase='battle';volumes();if(settings.enabled&&settings.music)play(a.theme);
}
/** Every accepted awakening replaces previous audio and restarts the battle theme. */
export function awakenSound(character:Unit['character']){
 generation++;clearTimeout(endIntro);stopTracks();
 phase='awakening';started=performance.now();currentVoice=awakeningVoice(character);
 const a=tracks();a.intro.currentTime=0;a.theme.currentTime=0;
 if(currentVoice)a.voice.src=currentVoice.src;
 a.voice.currentTime=0;sync();
 endIntro=setTimeout(battleTrack,awakeningDuration(character));
}
export function resumeBattleSound(){if(phase==='silent')battleTrack();}
export function stopBattleSound(){stopCombatSound();generation++;clearTimeout(endIntro);stopTracks();phase='silent';currentVoice=undefined;}
export function setSound(patch:Partial<Pick<Settings,'enabled'|'music'|'voice'|'effects'|'volume'>>){
 update({...patch,message:''});if(!settings.enabled||!settings.effects)stopCombatSound();sync();
}
/** Unlock all reusable elements during a user gesture for opponent-triggered Bankai. */
export async function enableSound(){
 unlockCombatSound();const a=tracks();update({enabled:true,message:''});
 if(phase!=='silent'){sync();return;}
 const g=generation;
 const results=await Promise.allSettled([a.intro,a.theme,a.voice].map(async el=>{
  el.volume=0;await el.play();if(g===generation&&phase==='silent'){el.pause();el.currentTime=0;}
 }));
 if(g===generation&&settings.enabled&&results.some(r=>r.status==='rejected'))update({message:'Audio could not start. Use Retry audio in Settings.'});
 volumes();
}
// Short original synthesized combat cues; never replace the supplied music.
let fxContext: AudioContext | undefined;
const fxNodes = new Set<AudioScheduledSourceNode>();
function stopCombatSound() {
  for (const node of fxNodes) {
    try {
      node.stop();
    } catch {
      /*already ended*/
    }
  }
  fxNodes.clear();
}
function unlockCombatSound() {
  try {
    fxContext ??= new AudioContext();
    void fxContext.resume().catch(() => {});
  } catch {
    /* Optional on browsers without Web Audio. */
  }
}
export function playCombatSound(effect: string, move: string) {
  if (
    !settings.enabled ||
    !settings.effects ||
    !fxContext ||
    fxContext.state !== "running" ||
    ["switch", "bankai"].includes(move)
  )
    return;
  stopCombatSound();
  const tones: Record<string, [number, number, OscillatorType]> = {
    heart: [440, 880, "sine"],
    flame: [130, 45, "sawtooth"],
    void: [310, 65, "sine"],
    rift: [650, 90, "sine"],
    ruin: [90, 30, "sawtooth"],
    pulse: [160, 380, "sine"],
    kinetic: [220, 45, "triangle"],
    burst: [180, 35, "square"],
    earth: [85, 30, "triangle"],
    lightning: [950, 60, "sawtooth"],
  };
  const [from, to, wave] = tones[effect] ?? tones.rift;
  if (move !== "guard" && move !== "attune") {
    const duration = effect === "lightning" || effect === "earth" ? 0.65 : 0.28;
    const buffer = fxContext.createBuffer(
      1,
      Math.ceil(fxContext.sampleRate * duration),
      fxContext.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const noise = fxContext.createBufferSource(),
      filter = fxContext.createBiquadFilter(),
      gain = fxContext.createGain();
    noise.buffer = buffer;
    filter.type = ["rift", "void"].includes(effect) ? "highpass" : "lowpass";
    filter.frequency.value =
      effect === "lightning" ? 800 : effect === "earth" ? 180 : 1800;
    gain.gain.setValueAtTime(settings.volume * 0.075, fxContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      fxContext.currentTime + duration,
    );
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(fxContext.destination);
    fxNodes.add(noise);
    noise.onended = () => {
      fxNodes.delete(noise);
      noise.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    noise.start();
    noise.stop(fxContext.currentTime + duration);
  }

  for (let i = 0; i < 3; i++) {
    const at = fxContext.currentTime + i * 0.06,
      osc = fxContext.createOscillator(),
      gain = fxContext.createGain();
    osc.type = move === "guard" ? "sine" : wave;
    osc.frequency.setValueAtTime(from * (1 + i * 0.15), at);
    osc.frequency.exponentialRampToValueAtTime(to, at + 0.32);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(settings.volume * 0.045, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.38);
    osc.connect(gain);
    gain.connect(fxContext.destination);
    osc.start(at);
    osc.stop(at + 0.4);
    fxNodes.add(osc);
    osc.onended = () => {
      fxNodes.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };
  }
}
