import { awakeningVoice, awakeningDuration } from "../game/awakeningVoices";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Battle, ActionCue } from "../game/types";
import { battlePortrait, battleSprite } from "../game/media";
import Sigil from "./Sigil";
import { THEMES } from "../game/presentation";
import { awakenSound, resumeBattleSound, stopBattleSound } from "../audio/sound";
function BankaiFilm({scene,name,motion,onClose}:{scene:ActionCue;name:string;motion:boolean;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const node=dialog.current;
    const previous=document.activeElement as HTMLElement|null;
    node?.showModal();
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{node?.close();document.body.style.overflow=overflow;previous?.focus({preventScroll:true});};
  },[]);
  const theme=THEMES[scene.character];
  const voice=awakeningVoice(scene.character);
  return <dialog ref={dialog} className={`bankai-film voiced-film film-${theme.effect} ${motion?"film-motion":"film-still"}`} style={{"--awakening-color":theme.color,"--film-duration":`${awakeningDuration(scene.character)}ms`} as CSSProperties} aria-label={`${name} Bankai awakening`} onCancel={e=>{e.preventDefault();onClose();}}>
    <div className="film-vignette"/>
    <div className="film-letterbox film-top"/><div className="film-letterbox film-bottom"/>
    <div className="film-stage" aria-hidden="true">
      <img className="film-base" src={`/portraits/${scene.character}.png`} alt=""/>
      <img className="film-awakened" src={battlePortrait({character:scene.character,bankaiUsed:true})} alt=""/>
      <img className="film-body" src={battleSprite({character:scene.character,bankaiUsed:true})} alt=""/>
      <div className="film-pressure"/>
      <svg className="film-fractures" viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="M500 300 350 240 240 270 80 120M500 300 580 150 540 20M500 300 670 345 810 230 1000 270M500 300 390 410 420 600M500 300 700 490 910 570"/><ellipse cx="500" cy="300" rx="300" ry="200"/><ellipse cx="500" cy="300" rx="390" ry="260"/></svg>
      <div className="film-particles">{Array.from({length:18},(_,i)=><i key={i} style={{"--n":i,"--x":`${(i*37)%100}%`,"--y":`${(i*53)%100}%`} as CSSProperties}/>)}</div>
      <div className="film-sigil"><Sigil kind={theme.effect}/></div>
    </div>
    <div className="film-call" aria-hidden="true"><span>{name}</span><strong>BANKAI</strong><small>THE WORLD HOLDS ITS BREATH</small></div>
    <section className="voice-dialogue" aria-label="Bankai dialogue"><p className="voice-name">{name} · BANKAI</p><h2>{voice?.title ?? scene.name}</h2><div>{voice?.lines.map((line,i)=><p key={i}><small>{line.speaker}</small>{line.text}</p>)}</div></section>
    <button className="film-skip" onClick={onClose} autoFocus>Skip visuals <span>Esc</span></button>
    <div className="film-timeline" aria-hidden="true"><span/></div>
    <p className="film-caption">Battle resumes after the release · sound follows your settings</p>
  </dialog>;
}
export default function Awakening({battle}:{battle:Battle}) {
  const [initialAwakened]=useState(!!battle.lastAwakening&&!battle.result);
  const seen=useRef(battle.lastAwakening?.revision??-1);
  const [scene,setScene]=useState<ActionCue|null>(null);
  const [motion,setMotion]=useState(true);
  const cue=battle.lastAwakening;
  useEffect(()=>{if(initialAwakened)resumeBattleSound();return stopBattleSound;},[initialAwakened]);
  useEffect(()=>{
    if(battle.result){stopBattleSound();return;}
    if(!cue||cue.revision<=seen.current)return;
    const timer=setTimeout(()=>{
      seen.current=cue.revision;
      setMotion(document.querySelector('.app-shell')?.getAttribute('data-effects')!=='off'&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
      setScene(cue);awakenSound(cue.character);
    },0);return()=>clearTimeout(timer);
  },[cue,battle.result]);
  useEffect(()=>{if(!scene)return;const timer=setTimeout(()=>setScene(null),awakeningDuration(scene.character));return()=>clearTimeout(timer);},[scene]);
  if(!scene||battle.result)return null;
  return <BankaiFilm key={scene.revision} scene={scene} name={battle.units.find(u=>u.id===scene.actor)?.name??scene.character} motion={motion} onClose={()=>setScene(null)}/>;
}
