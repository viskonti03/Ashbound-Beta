import {useEffect,useRef} from 'react';
import type {ActionCue,Side} from '../game/types';
import {DAN_STRIKE,animationFrame,animationSpec,strikePhase} from '../game/combatAnimation';
import {playCombatSound} from '../audio/sound';
import {useEffects} from '../settings/display';
import {preloadAttack} from './assets';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
/** One cancellable absolute-time timeline. React never renders individual frames. */
export default function CombatSpriteLayer({cue,deadline,field,nearSide}:{cue:ActionCue;deadline:number;field:HTMLDivElement|null;nearSide:Side}){
 const canvas=useRef<HTMLCanvasElement>(null),caption=useRef<HTMLParagraphElement>(null),impactSeen=useRef(-1),effects=useEffects();
 useEffect(()=>{
  const el=canvas.current;if(!el||!field||!cue.animation)return;
  const unit=cue.animation.before.units.find(u=>u.id===cue.actor);if(!unit)return;const spec=animationSpec(unit);
  const actor=field.querySelector<HTMLElement>(`[data-unit-id="${cue.actor}"]`),target=field.querySelector<HTMLElement>(`[data-unit-id="${cue.targets[0]}"]`);if(!actor||!target)return;const ctx=el.getContext('2d');if(!ctx)return;
  const reduced=!effects||matchMedia('(prefers-reduced-motion: reduce)').matches,started=deadline-DAN_STRIKE.duration,animations:Animation[]=[];
  let raf=0,cancelled=false,image:HTMLImageElement|undefined,w=1,h=1,from={x:0,y:0,size:0},to={x:0,y:0,size:0},victim={x:0,y:0,size:0};
  const direction=cue.animation.before.units.find(u=>u.id===cue.actor)?.side===nearSide?1:-1;
  function layout(){const bounds=field!.getBoundingClientRect();w=bounds.width;h=bounds.height;const dpr=Math.min(window.devicePixelRatio||1,1.5);el!.width=Math.round(w*dpr);el!.height=Math.round(h*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);const position=(unit:HTMLElement)=>{const body=unit.querySelector('.fighter-sprite')!.getBoundingClientRect();return{x:body.left+body.width*.5-bounds.left,y:body.bottom-bounds.top,size:Math.min(body.height,h*.84)/.92};};from=position(actor!);victim=position(target!);to={x:victim.x-direction*victim.size*.39,y:victim.y,size:victim.size};}
  const observer=new ResizeObserver(layout);observer.observe(field);layout();
  const cleanup=()=>{cancelled=true;cancelAnimationFrame(raf);observer.disconnect();animations.forEach(a=>a.cancel());actor.removeAttribute('data-sprite-acting');field.classList.remove('sprite-sequence');ctx.clearRect(0,0,w,h);};
  const timeout=setTimeout(cleanup,Math.max(0,deadline-Date.now()+80));
  function hit(ms:number){if(ms<DAN_STRIKE.impact||impactSeen.current===cue.revision)return;impactSeen.current=cue.revision;const outcome=cue.outcomes.find(o=>o.id===cue.targets[0]),reaction=cue.reactions?.find(r=>r.id===cue.targets[0]);
   if(caption.current)caption.current.textContent=outcome?`${outcome.hpChange<0?`${-outcome.hpChange} damage`:''}${outcome.barrierChange<0?` · ${-outcome.barrierChange} barrier`:''}${outcome.defeated?' · Defeated':''}`.replace(/^ · /,''):reaction?.kind==='phase'?'Phased — strike passes through':reaction?.kind==='evade'?'Evaded':reaction?.kind==='mantle'?'Destruction mantle — blocked':'Technique resolved';
   if(ms>DAN_STRIKE.impact+250)return;playCombatSound(spec.sound,'signature');if(reduced)return;
   const body=target!.querySelector<HTMLElement>('.fighter-sprite');if(body){const blocked=!outcome||outcome.hpChange===0&&outcome.barrierChange===0;animations.push(body.animate(blocked?[{opacity:1},{opacity:.22,offset:.35},{opacity:1}]:[{transform:'translateX(0) rotate(0deg)',filter:'brightness(1)'},{transform:`translateX(${direction*18}px) rotate(${direction*6}deg)`,filter:'brightness(1.65)',offset:.2},{transform:`translateX(${direction*7}px) rotate(${direction*2}deg)`,filter:'brightness(1)',offset:.65},{transform:'translateX(0) rotate(0deg)',filter:'brightness(1)'}],{duration:520,easing:'ease-out'}));}
   animations.push(field!.animate([{translate:'0 0'},{translate:'-3px 1px'},{translate:'3px -1px'},{translate:'-1px 0'},{translate:'0 0'}],{duration:170}));
  }
  function draw(){if(cancelled)return;const ms=Math.max(0,Date.now()-started);if(ms>=DAN_STRIKE.duration){cleanup();return;}hit(ms);ctx!.clearRect(0,0,w,h);
   if(image){let travel=ms<1160?ease((ms-730)/430):ms<2060?1:1-ease((ms-2060)/700);if(['cast','ground','thunder'].includes(spec.motion)||reduced)travel=0;else if(spec.motion==='teleport')travel=ms<940?0:ms<2400?1:0;const size=from.size+(to.size-from.size)*travel,x=from.x+(to.x-from.x)*travel,y=from.y+(to.y-from.y)*travel;const f=reduced?(ms<DAN_STRIKE.impact?spec.offset:ms<2760?spec.offset+(spec.frames===16?11:5):spec.offset+spec.frames-1):animationFrame(unit!,ms);el!.dataset.frame=String(f);el!.dataset.phase=strikePhase(ms);const sw=image.naturalWidth/4,sh=image.naturalHeight/4;ctx!.save();ctx!.translate(x,y);ctx!.scale(direction,1);ctx!.globalAlpha=Math.min(1,ms/100,(DAN_STRIKE.duration-ms)/180);if(spec.motion==='teleport'&&!reduced){const vanish=Math.min(Math.abs(ms-940),Math.abs(ms-2400));ctx!.globalAlpha*=clamp(vanish/130);}ctx!.drawImage(image,(f%4)*sw,Math.floor(f/4)*sh,sw,sh,-size*.5,-size*.96,size,size);ctx!.restore();
    if(!reduced&&ms>=DAN_STRIKE.impact&&ms<DAN_STRIKE.impact+260&&['cast','ground','thunder'].includes(spec.motion)){
     const progress=(ms-DAN_STRIKE.impact)/260;ctx!.save();ctx!.globalAlpha=(1-progress)*.8;ctx!.strokeStyle=spec.color;ctx!.lineWidth=spec.motion==='ground'?3:2;ctx!.shadowColor=spec.color;ctx!.shadowBlur=10;ctx!.beginPath();
     if(spec.motion==='thunder'){ctx!.moveTo(victim.x,Math.max(0,victim.y-victim.size*1.4));for(let i=1;i<=7;i++)ctx!.lineTo(victim.x+(i%2?10:-10)*(1-i/8),victim.y-victim.size*1.4+i*victim.size/7);}
     else if(spec.motion==='ground'){ctx!.moveTo(from.x,from.y);for(let i=1;i<=8;i++)ctx!.lineTo(from.x+(victim.x-from.x)*i/8,from.y+(victim.y-from.y)*i/8+(i%2?5:-5));}
     else{ctx!.moveTo(from.x+direction*from.size*.22,from.y-from.size*.58);ctx!.lineTo(victim.x,victim.y-victim.size*.5);}
     ctx!.stroke();ctx!.restore();
    }
   }
   raf=requestAnimationFrame(draw);
  }
  void preloadAttack(spec.sheet).then(asset=>{if(cancelled||Date.now()>=deadline)return;image=asset;actor.setAttribute('data-sprite-acting','true');field.classList.add('sprite-sequence');if(Date.now()-started<250)playCombatSound('rift','attack');}).catch(()=>{if(caption.current)caption.current.textContent='Animation artwork unavailable; battle result is unchanged.';});raf=requestAnimationFrame(draw);
  return()=>{clearTimeout(timeout);cleanup();};
 },[cue,deadline,field,nearSide,effects]);
 return <div className="combat-sprite-layer" aria-label={`${cue.character} animated signature`}><canvas ref={canvas} aria-hidden="true"/><div className="combat-sprite-caption"><small>{cue.character.toUpperCase()} · SIGNATURE</small><strong>{cue.name}</strong><p ref={caption} role="status">Preparing strike…</p></div></div>;
}
