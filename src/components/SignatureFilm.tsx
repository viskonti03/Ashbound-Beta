import {hasCombatAnimation} from "../game/combatAnimation";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import type {Battle,ActionCue} from '../game/types';
import {battleSprite} from '../game/media';
import {THEMES} from '../game/presentation';
import {SIGNATURE_MS} from '../game/signatures';
import {useEffects} from '../settings/display';
function Film({cue,battle,onClose}:{cue:ActionCue;battle:Battle;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),effects=useEffects();const u=battle.units.find(x=>x.id===cue.actor)!;const target=battle.units.find(x=>x.id===cue.targets[0]);const theme=THEMES[cue.character];
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const d=ref.current;d?.showModal();return()=>{d?.close();previous?.focus({preventScroll:true})}},[]);
 return <dialog ref={ref} aria-label={`${cue.name} cinematic`} className={`signature-film signature-${theme.effect} ${effects?'':'signature-still'}`} style={{'--signature-color':theme.color} as CSSProperties} onCancel={e=>{e.preventDefault();onClose()}}><div className="signature-vortex"/><img className="signature-caster" src={battleSprite(u)} alt={u.name}/>{target&&<img className="signature-target" src={battleSprite(target)} alt={target.name}/>}<div className="signature-strike"><i/><i/><i/></div><div className="signature-caption"><small>{u.name} · {u.bankaiUsed?'BANKAI · ':''}FULL ENERGY RELEASE</small><h2>{cue.name}</h2><p>{cue.outcomes.map(o=>`${battle.units.find(x=>x.id===o.id)?.name}: ${o.hpChange<0?`${-o.hpChange} damage`:o.barrierChange>0?`${o.barrierChange} barrier`:'blocked'}`).join(' · ')||cue.messages?.[0]||'Technique resolved'}</p></div><button className="signature-skip" onClick={onClose} autoFocus>Skip visuals · Esc</button></dialog>
}
export default function SignatureFilm({battle}:{battle:Battle}){
 const seen=useRef(battle.lastAction?.revision??-1),[scene,setScene]=useState<ActionCue|null>(null);const cue=battle.lastAction;
 useEffect(()=>{if(!cue||cue.revision<=seen.current)return;const t=setTimeout(()=>{seen.current=cue.revision;if(cue.move==='signature'&&!hasCombatAnimation(cue))setScene(cue)},0);return()=>clearTimeout(t)},[cue]);
 useEffect(()=>{if(!scene)return;const t=setTimeout(()=>setScene(null),SIGNATURE_MS);return()=>clearTimeout(t)},[scene]);
 return scene?<Film cue={scene} battle={battle} onClose={()=>setScene(null)}/>:null;
}
