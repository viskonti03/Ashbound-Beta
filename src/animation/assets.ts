import {DAN_STRIKE} from '../game/combatAnimation';
const sheets=new Map<string,Promise<HTMLImageElement>>();
export function preloadAttack(sheet:string){let pending=sheets.get(sheet);if(!pending){pending=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{sheets.delete(sheet);reject(new Error('Attack artwork unavailable'));};image.src=sheet;});sheets.set(sheet,pending);}return pending;}
export function preloadDanStrike(){return preloadAttack(DAN_STRIKE.sheet);}
