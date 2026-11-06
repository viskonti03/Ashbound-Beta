import {useEffect,useRef} from 'react';
import type {Ability} from '../game/types';
export default function EchoChooser({choices,current,onChoose,onClose}:{choices:NonNullable<Ability['choices']>;current:string;onChoose:(id:string)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const before=document.activeElement as HTMLElement|null;ref.current?.showModal();const d=ref.current;return()=>{d?.close();before?.focus({preventScroll:true})}},[]);
 return <dialog className="echo-dialog" ref={ref} aria-label="Arsenal of Echoes" onCancel={e=>{e.preventDefault();onClose()}}><header><div><small>KIDOU · FREE SWITCH</small><h2>Arsenal of Echoes</h2></div><button autoFocus aria-label="Close Arsenal of Echoes" onClick={onClose}>✕</button></header><p>Choose a Shinigami technique from either team. Switching preserves the copied move’s shared cooldown.</p><div className="echo-options">{choices.map(c=><button key={c.id} aria-pressed={c.id===current} disabled={c.id===current} onClick={()=>onChoose(c.id)}><strong>{c.name}</strong><span>{c.id===current?'Equipped':'Equip technique →'}</span></button>)}</div></dialog>
}
