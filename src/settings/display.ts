import {useSyncExternalStore} from 'react';
let effects=true;try{effects=localStorage.getItem('ashbound-effects')!=='off'&&!matchMedia('(prefers-reduced-motion: reduce)').matches}catch{effects=false}
const listeners=new Set<()=>void>();
export function setEffects(value:boolean){effects=value;try{localStorage.setItem('ashbound-effects',value?'on':'off')}catch{/* optional */}listeners.forEach(f=>f())}
export function useEffects(){return useSyncExternalStore(f=>{listeners.add(f);return()=>{listeners.delete(f)}},()=>effects)}
