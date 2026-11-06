import test from 'node:test';
import assert from 'node:assert/strict';
import {io,type Socket} from 'socket.io-client';
import {createGameServer} from '../server/index';
import {getActiveUnit} from '../src/game/engine';
import type{RoomView,RoomSession}from'../src/game/online';
function once<T>(s:Socket,event:string):Promise<T>{return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{s.off(event,listener);reject(Error(event+' timeout'))},5000);function listener(v:T){clearTimeout(timer);resolve(v)}s.once(event,listener);});}
for(const cinematic of ['bankai','signature'] as const)test(`server holds both players during ${cinematic} and preserves deadline on reconnect`,async()=>{
 const server=createGameServer(1,220);await new Promise<void>(r=>server.http.listen(0,'127.0.0.1',r));const addr=server.http.address();assert(addr&&typeof addr!=='string');
 const a=io(`http://127.0.0.1:${addr.port}`,{autoConnect:false,transports:['websocket']}),b=io(`http://127.0.0.1:${addr.port}`,{autoConnect:false,transports:['websocket']});let session:RoomSession|undefined;a.on('room:session',v=>session=v);
 try{let ca=once(a,'connect');const cb=once(b,'connect');a.connect();b.connect();await Promise.all([ca,cb]);
 let state=once<RoomView>(a,'room:state');a.emit('room:create');let v=await state;state=once(a,'room:state');b.emit('room:join',v.code);v=await state;
 for(const socket of[a,b]){state=once(a,'room:state');socket.emit('roster:update',{version:v.version,picks:[{character:'dan'},{character:'lane'},{character:'drake'}]});v=await state;state=once(a,'room:state');socket.emit('roster:lock',{version:v.version,locked:true});v=await state;}
 for(const socket of[a,b]){state=once(a,'room:state');socket.emit('arena:ready',{turn:v.battle!.turn});v=await state;}
 while(cinematic === 'bankai' ? getActiveUnit(v.battle!)!.awakening<100 : getActiveUnit(v.battle!)!.energy<5){await new Promise(r=>setTimeout(r,45));const actor=getActiveUnit(v.battle!)!;state=once(a,'room:state');(actor.side==='player'?a:b).emit('battle:move',{move:'guard',turn:v.battle!.turn,revision:v.battle!.revision});v=await state;}
 state=once(a,'room:state');(getActiveUnit(v.battle!)!.side==='player'?a:b).emit('battle:move',{move:cinematic,target:v.battle!.units.find(u=>u.side!==getActiveUnit(v.battle!)!.side)!.id,turn:v.battle!.turn,revision:v.battle!.revision});v=await state;const deadline=v.battle!.cinematicUntil!;assert(deadline>Date.now());
 const active=getActiveUnit(v.battle!)!.side==='player'?a:b;const error=once<string>(active,'room:error');active.emit('battle:move',{move:'guard',turn:v.battle!.turn,revision:v.battle!.revision});assert.match(await error,/cinematic is playing/);
 const gone=once(b,'room:state');a.disconnect();await gone;ca=once(a,'connect');a.connect();await ca;state=once(a,'room:state');a.emit('room:resume',session);v=await state;assert.equal(v.battle!.cinematicUntil,deadline);
 await new Promise(r=>setTimeout(r,Math.max(0,deadline-Date.now()+30)));state=once(a,'room:state');(getActiveUnit(v.battle!)!.side==='player'?a:b).emit('battle:move',{move:'guard',turn:v.battle!.turn,revision:v.battle!.revision});const next=await state;assert.equal(next.battle!.revision,v.battle!.revision+1);
 }finally{a.disconnect();b.disconnect();await server.stop();}
});
