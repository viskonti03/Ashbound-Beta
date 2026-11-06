import {arenaAmount} from './arenas';
import {empowered,type KitMove} from './kits';
import type {Unit,ArenaId} from './types';
export const SIGNATURE_MS=3200;
// Full-bar commitments: one signature per character, four own-turn recovery.
export function signatureMove(u:Unit,arena:ArenaId='living-world'):KitMove{
 const bank=empowered(u),n=(base:number,awakened:number)=>bank?awakened:base;
 const common={move:'signature' as const,cost:5,rest:4,targeting:'enemy' as const,origin:'shinigami' as const};
 let m:KitMove;
 switch(u.character){
 case 'dan':case 'tourgen':m={...common,kind:'flame',name:bank?'Black Sun: Shogun’s Judgment':'Black Flame: Funeral Pyre',damage:n(58,85),burnDamage:n(10,15),burnTurns:2,description:'Engulf one enemy in black flames, then burn them for two own turns.'};break;
 case 'afrodi':m={...common,origin:'arrancar',kind:'hit',pierce:true,name:bank?'Abyssal Eclipse: World Sever':'Black Magic: Horizon Sever',damage:n(76,108),description:'A dimensional cut that pierces Guard and barriers. Phase and evasion still protect the target.'};break;
 case 'blade':m={...common,kind:'blink',name:bank?'Sovereign Realm: Final Exile':'Thousand Gates: Execution',damage:n(72,98),description:'Strike through a collapsing portal. In Bankai, a surviving target can be imprisoned under the existing realm rules.'};break;
 case 'drake':m={...common,kind:'hit',pierce:true,name:bank?'Destruction Sovereign: Zero Horizon':'Destruction: Absolute Ruin',damage:n(80,112),description:'Unleash concentrated destruction through Guard and barriers. Does not bypass phase or evasion.'};break;
 case 'gin':m={...common,kind:'siphon',name:bank?'Boundless Pressure: Event Horizon':'Spiritual Collapse',damage:n(62,88),drain:n(2,3),description:'Crush one enemy and drain energy from a surviving target into your Reserve.'};break;
 case 'hanibal':m={...common,kind:'hit',name:'Five Eyes: Reality Collapse',damage:65+u.eyes*9,description:`Convert stolen color into a kinetic strike. Current power: ${u.eyes}/5 eyes; gains 9 damage per open eye. No Bankai required.`};break;
 case 'kami':m={...common,origin:'arrancar',kind:'hit',name:bank?'Whiteout: Reality Detonation':'Explosion: Vanishing Star',damage:n(82,116),description:'Concentrate explosive force into a single overwhelming blast.'};break;
 case 'kidou':m={...common,origin:'arrancar',kind:'white',name:bank?'White Magic: Beyond the Horizon':'White Magic: Silent Horizon',damage:n(70,98),description:'A piercing white dimensional cut, followed by a brief speed boost. Independent of the copied Shinigami technique.'};break;
 case 'lane':m={...common,kind:'hit',name:bank?'Planetary Core: Genesis Break':'Mother Earth: Core Rupture',damage:n(70,100),description:'Strike with compressed core energy and gain a personal barrier until your next turn.'};break;
 case 'tomamaru':m={...common,kind:'thunder',name:bank?'Thunder Sovereign: Heaven’s Verdict':'Storm Art: Thunderfall',damage:n(72,100),description:'Call down a focused thunderbolt. Static increases damage; Static or Bankai also interrupts charging.'};break;
 }
 return {...m,damage:arenaAmount(arena,u,m.origin,m.damage),description:`${m.description} Requires and spends all 5 energy. Recovery: 4 own turns.`};
}
