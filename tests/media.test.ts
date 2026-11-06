import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {newBattle,battleReducer} from '../src/game/engine';
import {BANKAI_IDS,battlePortrait,battleSprite} from '../src/game/media';
import {ARENAS} from '../src/game/arenas';
test('all arenas and Bankai forms resolve to bundled art; Hannibal and Tourgen retain own art',()=>{
 for(const character of BANKAI_IDS){assert.notEqual(battlePortrait({character,bankaiUsed:true}),battlePortrait({character,bankaiUsed:false}));assert(existsSync(`public${battlePortrait({character,bankaiUsed:true})}`));}
 assert.equal(battlePortrait({character:'hanibal',bankaiUsed:true}),'/portraits/hanibal.png');
 assert.equal(battlePortrait({character:'tourgen',bankaiUsed:true}),'/portraits/tourgen.png');
 for(const arena of ARENAS)assert(existsSync(`public/arenas/${arena.id}.webp`));
 for(const file of ['awakening.mp3','battle-theme.mp3'])assert(existsSync(`public/audio/${file}`));
});
test('only accepted Bankai records persistent awakening, subsequent turns retain it, new battle resets it',()=>{
 let b=newBattle(0,'local');b.active='player:dan';const d=b.units.find(u=>u.id===b.active)!;
 const cast=()=>battleReducer(b,{type:'move',move:'bankai',turn:b.turn,revision:b.revision});
 assert.equal(cast(),b);assert.equal(b.lastAwakening,undefined);
 d.awakening=100;b=cast();assert.equal(b.lastAwakening?.actor,'player:dan');assert.equal(b.lastAwakening?.name,'Bankai: TOURGEN, SHOGUN OF DEATH');
 const cue=structuredClone(b.lastAwakening);b=battleReducer(b,{type:'move',move:'guard',turn:b.turn,revision:b.revision});assert.deepEqual(b.lastAwakening,cue);
 assert.equal(newBattle(0,'local').lastAwakening,undefined);
});

test('Bankai sprites resolve in both camera directions with correct form exceptions',()=>{
 for(const character of BANKAI_IDS)for(const rear of [false,true]){
 const base=battleSprite({character,bankaiUsed:false},rear),awakened=battleSprite({character,bankaiUsed:true},rear);
 assert.notEqual(base,awakened);assert(existsSync(`public${base}`));assert(existsSync(`public${awakened}`));
 }
 for(const character of ['hanibal','tourgen'] as const)for(const rear of [false,true])assert.equal(battleSprite({character,bankaiUsed:true},rear),battleSprite({character,bankaiUsed:false},rear));
 assert.equal(battleSprite({character:'dan',bankaiUsed:true,form:'separated'},true),'/fighters/back/dan.png');
});
