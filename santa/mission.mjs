// Simulation rules resolve the consequences of actions; they never choose them.
export const ROUTE = [
 {name:'Alma',gift:.2,chimney:.8,storm:.3},
 {name:'Noah',gift:.8,chimney:.2,storm:.5},
 {name:'Freja',gift:.25,chimney:.75,storm:.8},
 {name:'Oliver',gift:.75,chimney:.25,storm:.6},
 {name:'Ella',gift:.15,chimney:.7,storm:.4},
 {name:'Oscar',gift:.7,chimney:.15,storm:.7},
 {name:'Clara',gift:.3,chimney:.85,storm:.5},
 {name:'William',gift:.85,chimney:.3,storm:.3}
];
export const MINUTES=84;
export function newMission(){return {minutes:MINUTES,energy:.75,index:0,delivered:[],turns:0,done:false,won:false};}
export function inputs(s){const h=ROUTE[s.index];return [s.minutes/360,h.storm,s.energy,h.gift,h.chimney];}
export function step(s,action){
 if(s.done)return {state:s,message:'This route has ended.',delivered:false};
 if(!Number.isInteger(action)||action<0||action>3)throw Error('Unknown action');
 const next={...s,delivered:[...s.delivered],turns:s.turns+1};const h=ROUTE[s.index];
 let cost,delivery=false,message;
 if(action===3){cost=12;next.energy=Math.min(1,s.energy+.45);message='Carrot break: energy restored.';}
 else if(s.energy<.12-1e-9){cost=6;message='The reindeer are too tired. Rest before trying again.';}
 else if(action===2){cost=8;next.energy=Math.max(0,s.energy-.06);message=`Skipped ${h.name}. Their present is still aboard.`;}
 else {cost=action===0?6:10;next.energy=Math.max(0,s.energy-.12);
   if(action===0&&h.gift>h.chimney){message=`The present does not fit ${h.name}’s chimney. Try the door.`;}
   else {delivery=true;message=`Delivered to ${h.name} via the ${action===0?'chimney':'front door'}.`;}
 }
 // The final present must arrive strictly BEFORE sunrise, not exactly at it.
 if(cost>=s.minutes){next.minutes=0;next.done=true;message=`Sunrise arrived before this action finished. ${h.name} is still waiting.`;return {state:next,message,delivered:false,cost:s.minutes};}
 next.minutes=s.minutes-cost;
 if(delivery)next.delivered.push(s.index);
 if(next.delivered.length===ROUTE.length){next.done=true;next.won=true;}
 else if(delivery||action===2){do{next.index=(next.index+1)%ROUTE.length;}while(next.delivered.includes(next.index));}
 return {state:next,message,delivered:delivery,cost};
}
export function runPolicy(choose){let s=newMission();const history=[];while(!s.done){const x=inputs(s),action=choose(x);const r=step(s,action);history.push({x,action,...r});s=r.state;}return {state:s,history};}
