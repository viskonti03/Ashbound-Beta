import type {ActionCue,Battle,Unit} from './types';
export const DAN_STRIKE={id:'dan-bankai-slash' as const,duration:3200,impact:1370,sheet:'/animations/dan/bankai-slash.png',columns:4,rows:4};
export function hasDanStrike(cue:ActionCue|undefined){return cue?.animation?.id===DAN_STRIKE.id;}
export function canAnimateDan(actor:Unit|undefined,move:string){return actor?.character==='dan'&&actor.bankaiUsed&&actor.form!=='separated'&&move==='signature';}
/** Display projection only; authoritative damage is resolved once by the reducer. */
export function presentationAt(battle:Battle,elapsed:number):Battle{
 const cue=battle.lastAction;if(!hasCombatAnimation(cue)||!cue?.animation)return battle;
 if(elapsed<DAN_STRIKE.impact)return {...battle,...cue.animation.before,lastAction:cue};
 if(elapsed<DAN_STRIKE.duration&&battle.result)return {...battle,result:null};return battle;
}
export function strikeFrame(ms:number){const beats=[0,180,360,550,730,860,1060,1160,1260,1370,1510,1610,1810,2060,2460,2760];let frame=0;for(let i=0;i<beats.length;i++)if(ms>=beats[i])frame=i;return frame;}
export function strikePhase(ms:number){return ms<730?'prepare':ms<1160?'dash':ms<1610?'slash':ms<2060?'follow-through':ms<2760?'return':'settle';}

export const ANIMATED_ROSTER=['afrodi','blade','drake','gin','hanibal','kami','kidou','lane','tomamaru','tourgen'] as const;
export type RosterAnimationId=typeof ANIMATED_ROSTER[number];
export function canAnimateSignature(actor:Unit|undefined,move:string){return canAnimateDan(actor,move)||!!actor&&move==='signature'&&ANIMATED_ROSTER.some(id=>id===actor.character);}
export function hasCombatAnimation(cue:ActionCue|undefined){return hasDanStrike(cue)||cue?.animation?.id==='roster-signature';}
export type AttackMotion='dash'|'teleport'|'cast'|'ground'|'thunder';
export function animationSpec(actor:Unit){
 if(actor.character==='dan')return {...DAN_STRIKE,offset:0,frames:16,motion:'dash' as AttackMotion,color:'#ff8a44',sound:'flame'};
 const id=actor.character as RosterAnimationId;
 const styles:Record<RosterAnimationId,{motion:AttackMotion;color:string;sound:string}>={
 afrodi:{motion:'dash',color:'#b872ff',sound:'rift'},blade:{motion:'teleport',color:'#7de9ff',sound:'rift'},
 drake:{motion:'cast',color:'#d479ff',sound:'void'},gin:{motion:'cast',color:'#8cffe6',sound:'pulse'},
 hanibal:{motion:'dash',color:'#fff0b8',sound:'kinetic'},kami:{motion:'cast',color:'#ffd2a0',sound:'burst'},
 kidou:{motion:'dash',color:'#ffffff',sound:'rift'},lane:{motion:'ground',color:'#ffcb62',sound:'earth'},
 tourgen:{motion:'dash',color:'#ff9c49',sound:'flame'},
 tomamaru:{motion:actor.bankaiUsed?'thunder':'dash',color:'#b3ceff',sound:'lightning'}};
 return {...DAN_STRIKE,id:'roster-signature',sheet:`/animations/roster/${id}.png`,offset:!['hanibal','tourgen'].includes(id)&&actor.bankaiUsed?8:0,frames:['hanibal','tourgen'].includes(id)?16:8,...styles[id]};
}
export function animationFrame(actor:Unit,ms:number){const spec=animationSpec(actor);if(spec.frames===16)return strikeFrame(ms);const beats=[0,300,730,1160,1370,1610,2060,2760];let f=0;for(let i=0;i<beats.length;i++)if(ms>=beats[i])f=i;return spec.offset+f;}
