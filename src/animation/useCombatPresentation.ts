import {useEffect,useState} from 'react';import type {Battle} from '../game/types';import {DAN_STRIKE,hasCombatAnimation,presentationAt} from '../game/combatAnimation';
export function useCombatPresentation(battle:Battle){
 const [clock,setClock]=useState(Date.now);const deadline=hasCombatAnimation(battle.lastAction)?battle.cinematicUntil:undefined;
 useEffect(()=>{const refresh=()=>setClock(Date.now());const timers=[setTimeout(refresh,0)];if(deadline)for(const at of [deadline-DAN_STRIKE.duration+DAN_STRIKE.impact,deadline])timers.push(setTimeout(refresh,Math.max(0,at-Date.now()+1)));document.addEventListener('visibilitychange',refresh);return()=>{timers.forEach(clearTimeout);document.removeEventListener('visibilitychange',refresh);};},[deadline,battle.revision]);
 const running=!!deadline&&clock<deadline;const elapsed=running?Math.max(0,clock-(deadline!-DAN_STRIKE.duration)):DAN_STRIKE.duration;return{battle:running?presentationAt(battle,elapsed):battle,running,deadline};
}
