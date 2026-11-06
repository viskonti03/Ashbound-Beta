import test from 'node:test';import assert from 'node:assert/strict';
import {newBattle,battleReducer,abilities,previewMove} from '../src/game/engine';
import {signatureMove} from '../src/game/signatures';
import type {CharacterId} from '../src/game/types';
const ids:CharacterId[]=['dan','afrodi','blade','drake','gin','hanibal','kami','kidou','lane','tomamaru'];
for(const id of ids)test(`${id}: full bar required, spent once, forecast agrees and Bankai upgrades`,()=>{
 const picks=[id,...ids.filter(x=>x!==id)].slice(0,3).map(character=>({character}));
 let b=newBattle(0,'local',{player:picks,enemy:[{character:'dan'},{character:'lane'},{character:'drake'}]});b.active=`player:${id}`;b.queue=b.units.filter(u=>u.id!==b.active).map(u=>u.id);const actor=b.units.find(u=>u.id===b.active)!;actor.energy=4;
 const cmd={type:'move' as const,move:'signature' as const,target:'enemy:dan',turn:b.turn,revision:b.revision};assert.equal(battleReducer(b,cmd),b);actor.energy=5;
 const forecast=previewMove(b,cmd)!;const before=b.units.find(u=>u.id==='enemy:dan')!.hp;const base=signatureMove(actor).damage;actor.bankaiUsed=true;const upgraded=signatureMove(actor).damage;assert(id==='hanibal'?upgraded===base:upgraded>base);actor.bankaiUsed=false;
 b=battleReducer(b,cmd);assert.equal(b.units.find(u=>u.id===actor.id)!.energy,0);assert(b.units.find(u=>u.id===actor.id)!.cooldowns.signature>0);assert.equal(b.lastAction?.move,'signature');assert.equal(b.units.find(u=>u.id==='enemy:dan')!.hp-before,forecast.changes.find(c=>c.id==='enemy:dan')!.hp);assert.equal(battleReducer(b,cmd),b);
 b.active=actor.id;b.units.find(u=>u.id===actor.id)!.energy=5;assert(abilities(b,b.units.find(u=>u.id===actor.id)!).find(a=>a.move==='signature')!.disabled);
});
test('signature respects phase and Kidou copy cooldown stays independent',()=>{
 let b=newBattle(0,'local',{player:[{character:'kidou'},{character:'dan'},{character:'lane'}],enemy:[{character:'afrodi'},{character:'blade'},{character:'gin'}]});b.active='player:kidou';b.queue=b.units.filter(u=>u.id!==b.active).map(u=>u.id);const u=b.units.find(x=>x.id===b.active)!;u.energy=5;u.cooldowns.skill2=3;const t=b.units.find(x=>x.id==='enemy:afrodi')!;t.phaseUntil=99;const hp=t.hp;b=battleReducer(b,{type:'move',move:'signature',target:t.id,turn:b.turn,revision:b.revision});assert.equal(b.units.find(x=>x.id===t.id)!.hp,hp);assert.equal(b.units.find(x=>x.id===u.id)!.cooldowns.skill2,3);
});
