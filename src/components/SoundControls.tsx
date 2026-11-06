import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {subscribeSound,soundSnapshot,setSound,enableSound} from '../audio/sound';
import {useEffects,setEffects} from '../settings/display';
type Props={onRoom?:()=>void;expanded?:boolean;onView?:()=>void;view?:string};
export default function SoundControls({onRoom,expanded,onView,view}:Props){
 const s=useSyncExternalStore(subscribeSound,soundSnapshot),effects=useEffects();
 const[open,setOpen]=useState(false),[full,setFull]=useState(!!document.fullscreenElement),[error,setError]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const f=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',f);return()=>document.removeEventListener('fullscreenchange',f)},[]);
 useEffect(()=>{if(!open)return;const d=dialog.current,t=trigger.current;d?.showModal();return()=>{d?.close();t?.focus({preventScroll:true})}},[open]);
 function sound(){if(s.enabled)setSound({enabled:false});else void enableSound()}
 async function fullscreen(){setError('');try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setError('Fullscreen is unavailable here. The battlefield still fills the window.')}}
 return <div className="game-toolbar" aria-label="Game controls">
  <button aria-label={`Visual effects ${effects?'on':'off'}`} aria-pressed={effects} onClick={()=>setEffects(!effects)}>Effects <b>{effects?'ON':'OFF'}</b></button>
  <button aria-label={`Sound ${s.enabled?'on':'off'}`} aria-pressed={s.enabled} onClick={sound}>Sound <b>{s.enabled?'ON':'OFF'}</b></button>
  <button className="toolbar-icon" aria-label={full?'Exit fullscreen':'Enter fullscreen'} aria-pressed={full} title="Fullscreen" onClick={()=>void fullscreen()}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={full?"M9 3v6H3m12-6v6h6M3 15h6v6m12-6h-6v6":"M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"}/></svg></button>
  <button className="toolbar-icon" ref={trigger} aria-label="Open game settings" title="Game settings" onClick={()=>setOpen(true)}>⚙</button>
  {error&&!open&&<div className="toolbar-error" role="status">{error}<button onClick={()=>setError('')}>Dismiss</button></div>}
  {open&&<dialog ref={dialog} className="game-settings" aria-label="Game settings" onCancel={e=>{e.preventDefault();setOpen(false)}}>
   <header><div><small>ASHBOUND</small><h2>Game settings</h2></div><button aria-label="Close game settings" onClick={()=>setOpen(false)}>✕</button></header>
   <section><h3>Audio</h3><label>All sound<input type="checkbox" checked={s.enabled} onChange={sound}/></label>
   <label>Music<input type="checkbox" checked={s.music} onChange={e=>setSound({music:e.target.checked})}/></label>
   <label>Bankai announcements<input type="checkbox" checked={s.voice} onChange={e=>setSound({voice:e.target.checked})}/></label>
   <label>Attack sounds<input type="checkbox" checked={s.effects} onChange={e=>setSound({effects:e.target.checked})}/></label>
   <label className="volume-setting">Volume <b>{Math.round(s.volume*100)}%</b><input aria-label="Sound volume" type="range" min="0" max="1" step=".05" value={s.volume} onChange={e=>setSound({volume:Number(e.target.value)})}/></label>
   {!s.enabled&&<p>Muted. Your music, voice and attack preferences are kept.</p>}
   {s.message&&<div role="status"><p>{s.message}</p><button onClick={()=>void enableSound()}>Retry audio</button></div>}</section>
   <section><h3>Display</h3><label>Visual effects<input type="checkbox" checked={effects} onChange={e=>setEffects(e.target.checked)}/></label>
   <button className="setting-action" onClick={()=>void fullscreen()}>{full?'Exit fullscreen':'Enter fullscreen'}</button>{error&&<p role="status">{error}</p>}
   {onView&&<button className="setting-action" onClick={onView}>Camera: {view} ⇄</button>}
   {onRoom&&<button className="setting-action" onClick={()=>{onRoom();setOpen(false)}}>{expanded?'Show room controls':'Expand battlefield'}</button>}</section>
   <footer>Settings apply immediately. Esc closes this panel.</footer>
  </dialog>}
 </div>
}
