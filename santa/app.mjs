import {ACTIONS,createModel,predict,winner,trainEpoch,random} from './model.mjs';
const $=id=>document.getElementById(id);
const fields=[['Time until sunrise','Plenty of time','6 hours',.65,v=>`${Math.round(v*360)} min`,'Sunrise now'],['Snowstorm strength','Clear skies','Blizzard',.25,v=>`${Math.round(v*100)}%`],['Reindeer energy','Exhausted','Full of beans',.75,v=>`${Math.round(v*100)}%`],['Present width','Tiny gift','Huge surprise',.3,v=>`${Math.round(10+v*90)} cm`],['Chimney width','Narrow','Roomy',.7,v=>`${Math.round(10+v*90)} cm`]];
let x=fields.map(f=>f[3]),starter,custom,examples=[],busy=false,animationTimer,house=1;
const world=document.querySelector('.world');
fields.forEach(([name,lo,hi,value,format,zero],i)=>{
 const el=document.createElement('div');el.className='slider';el.innerHTML=`<label for="input-${i}">${name}<output id="value-${i}" for="input-${i}"></output></label><input id="input-${i}" type="range" min="0" max="100" value="${value*100}"><div class="range-ends"><span>${zero||lo}</span><span>${hi}</span></div>`;
 $('sliders').append(el);$(`input-${i}`).addEventListener('input',e=>{x[i]=Number(e.target.value)/100;resetAnimation();render();});
});
ACTIONS.forEach((name,i)=>{
 const row=document.createElement('div');row.className='score';row.id=`score-${i}`;row.innerHTML=`<div class="score-label"><span>${name}</span><span id="percent-${i}"></span></div><div class="track"><div id="bar-${i}" class="fill"></div></div>`;$('scores').append(row);
 const button=document.createElement('button');button.textContent=name;button.addEventListener('click',()=>{examples.push({x:[...x],y:i});updateTeaching();$('training-status').textContent=`Example ${examples.length} saved: ${name}. Change the situation to teach another.`;});$('labels').append(button);
});
function resetAnimation(){clearTimeout(animationTimer);world.className='world';$('outcome').textContent='Move the sliders to see what Santa would do.';}
function render(){
 fields.forEach((f,i)=>{$(`value-${i}`).textContent=f[4](x[i]);$(`input-${i}`).value=Math.round(x[i]*100);});
 $('snow').setAttribute('opacity',.12+x[1]*.8);$('chimney').style.transform=`translate(${480*(1-(.6+x[4]*.6))}px,0) scaleX(${.6+x[4]*.6})`;
 const m=$('brain').value==='custom'?custom:starter;if(!m)return;
 const p=predict(m,x),best=winner(p);$('decision').textContent=ACTIONS[best];$('model-name').textContent=($('brain').value==='custom'?'YOUR SANTA':'STARTER SANTA')+' WOULD…';
 p.forEach((v,i)=>{$(`percent-${i}`).textContent=`${(v*100).toFixed(1)}%`;$(`bar-${i}`).style.width=`${v*100}%`;$(`score-${i}`).classList.toggle('best',i===best);});$('act').disabled=false;
}
function updateTeaching(){
 const counts=ACTIONS.map((_,i)=>examples.filter(e=>e.y===i).length);
 $('sample-count').textContent=`${examples.length} teaching example${examples.length===1?'':'s'} · ${counts.filter(Boolean).length} actions`;
 $('train').disabled=busy||examples.length<8;$('undo').disabled=busy||!examples.length;$('clear').disabled=busy||!examples.length;
 document.querySelectorAll('#labels button').forEach(b=>b.disabled=busy);$('brain').disabled=busy||!custom;
}
$('new-house').addEventListener('click',()=>{x=fields.map(()=>Math.round(Math.random()*100)/100);house++;$('house-name').textContent=`${String(house).padStart(2,'0')} / ${['SNOWDROP COTTAGE','GINGERBREAD LANE','MISTLETOE HOUSE','STARLIGHT CABIN'][((house-1)%4)]}`;resetAnimation();render();$('scene-note').textContent='A new house. A new dilemma.';});
$('act').addEventListener('click',()=>{resetAnimation();const a=winner(predict($('brain').value==='custom'?custom:starter,x));void world.offsetWidth;world.classList.add(`acting-${a}`);$('outcome').textContent=['Santa heads for the chimney. Hopefully the wrapping survives.','Santa takes the present to the front door. A slightly less sooty Christmas.','Santa flies on to another house. This one will have to wait.','A carrot break for the reindeer. Even Christmas magic needs a rest.'][a];animationTimer=setTimeout(()=>world.className='world',3000);});
$('undo').addEventListener('click',()=>{examples.pop();updateTeaching();$('training-status').textContent='Last example removed. Existing trained models are unchanged.';});
$('clear').addEventListener('click',()=>{examples=[];updateTeaching();$('training-status').textContent='Teaching examples cleared. Existing trained models are still available.';});
$('brain').addEventListener('change',()=>{resetAnimation();render();});
$('train').addEventListener('click',async()=>{
 busy=true;updateTeaching();$('progress').hidden=false;const candidate=createModel(1225),rng=random(17),data=examples.map(e=>({x:[...e.x],y:e.y}));
 try{for(let epoch=0;epoch<300;epoch++){trainEpoch(candidate,data,.035,rng);if(epoch%10===0){$('progress').value=(epoch+1)/3;$('training-status').textContent=`Learning from your ${data.length} examples… ${Math.round((epoch+1)/3)}%`;await new Promise(r=>setTimeout(r,0));}}
 custom=candidate;$('brain').querySelector('[value=custom]').disabled=false;$('brain').value='custom';$('progress').value=100;
 const matches=data.filter(e=>winner(predict(custom,e.x))===e.y).length;
 $('training-status').textContent=`Your Santa is ready. Matches ${matches}/${data.length} teaching examples (not an unseen test). Try a new situation, or switch brains to compare.`;resetAnimation();render();
 }catch{$('training-status').textContent='Training failed. Your examples are still here; please try again.';}finally{busy=false;updateTeaching();}
});
render();
try{const response=await fetch('./checkpoint.json');if(!response.ok)throw Error(response.status);starter=await response.json();render();}catch{$('decision').textContent='The starter brain could not load';$('model-name').textContent='PLEASE RELOAD TO TRY AGAIN';$('outcome').textContent='You can still label examples and train your own Santa below.';}
