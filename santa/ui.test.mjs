import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {JSDOM} from 'jsdom';
test('sliders, teaching, training, model switching and animations work',async()=>{
 const dom=new JSDOM(readFileSync(new URL('./index.html',import.meta.url),'utf8'),{url:'https://example.test/santa/'});
 globalThis.document=dom.window.document;globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(readFileSync(new URL('./checkpoint.json',import.meta.url)))});
 await import('./app.mjs');const $=id=>document.getElementById(id);
 assert.equal(document.querySelectorAll('input[type=range]').length,5);assert.equal($('act').disabled,false);
 $('input-0').value='10';$('input-0').dispatchEvent(new dom.window.Event('input'));assert.equal($('value-0').textContent,'36 min');
 for(let i=0;i<8;i++){document.querySelectorAll('#labels button')[i%4].click();$('new-house').click();}
 assert.equal($('train').disabled,false);$('train').click();assert.equal($('train').disabled,true);
 for(let i=0;i<500&&$('brain').value!=='custom';i++)await new Promise(r=>setTimeout(r,10));
 assert.equal($('brain').value,'custom');assert.match($('training-status').textContent,/ready/);assert.equal($('brain').disabled,false);
 $('brain').value='starter';$('brain').dispatchEvent(new dom.window.Event('change'));assert.match($('model-name').textContent,/STARTER/);
 $('act').click();assert.match(document.querySelector('.world').className,/scene-/);$('new-house').click();assert.equal(document.querySelector('.world').className,'world');
 $('run-starter').click();assert.equal($('input-0').disabled,true);assert.equal($('train').disabled,true);
 for(let i=0;i<30&&!$('next-turn').disabled;i++){$('next-turn').click();await new Promise(r=>setTimeout(r,5));}
 assert.match($('mission-result').textContent,/Sunrise!/);assert.equal($('mission-count').textContent,'5 / 8');assert.equal($('input-0').disabled,false);
 $('clear').click();$('practice').click();
 const choices=[0,1,0,1,0,1,3,0,1];for(const action of choices){document.querySelectorAll('#practice-actions button')[action].click();await new Promise(r=>setTimeout(r,5));}
 assert.match($('mission-result').textContent,/Practice complete/);assert.equal($('mission-count').textContent,'8 / 8');assert.equal($('mission-time').textContent,'8 min');assert.equal($('train').disabled,false);
 $('train').click();for(let i=0;i<500&&$('train').disabled;i++)await new Promise(r=>setTimeout(r,10));
 $('run-custom').click();for(let i=0;i<30&&!$('next-turn').disabled;i++){$('next-turn').click();await new Promise(r=>setTimeout(r,5));}
 assert.match($('mission-result').textContent,/Christmas saved/);assert.equal($('mission-count').textContent,'8 / 8');assert.equal($('mission-time').textContent,'8 min');
 document.querySelector('#mission-log button').click();assert.equal($('input-0').disabled,false);
 $('exit-route').click();$('new-house').click();
 $('undo').click();assert.match($('sample-count').textContent,/8 teaching/);$('clear').click();assert.equal($('train').disabled,true);dom.window.close();
});

test('animation timelines wait, cancel cleanly and distinguish failed deliveries',async(t)=>{
 const {createAnimator}=await import('./animation.mjs');
 const dom=new JSDOM('<section class="world"><p id="outcome"></p><p id="scene-note"></p></section>');
 globalThis.window={matchMedia:()=>({matches:false})};t.mock.timers.enable({apis:['setTimeout']});
 const world=dom.window.document.querySelector('.world');const busy=[];const animator=createAnimator(world,{onBusy:v=>busy.push(v)});
 const first=animator.play(0,'Gift too wide',false);assert.ok(world.classList.contains('scene-stuck'));assert.equal(busy.at(-1),true);
 t.mock.timers.tick(2000);assert.ok(world.classList.contains('animating'));animator.cancel();assert.equal(await first,false);assert.equal(world.className,'world');
 const next=animator.play(1,'Delivered',true,{won:true});assert.ok(world.classList.contains('christmas-saved'));t.mock.timers.tick(4200);assert.equal(await next,true);assert.equal(busy.at(-1),false);assert.ok(!world.classList.contains('animating'));
 const dawn=animator.play(0,'Sunrise',false,{sunrise:true});assert.ok(world.classList.contains('scene-sunrise'));t.mock.timers.tick(2800);assert.equal(await dawn,true);delete globalThis.window;dom.window.close();
});

test('route stays on the current child until animation ends and restart cancels old results',async()=>{
 const {setupChallenge}=await import('./challenge.mjs');const {createModel}=await import('./model.mjs');
 const dom=new JSDOM(readFileSync(new URL('./index.html',import.meta.url),'utf8'));globalThis.document=dom.window.document;
 const $=id=>document.getElementById(id);let finish;let current;let taught=0;
 setupChallenge({getModel:()=>createModel(),isTraining:()=>false,lock:()=>{},setScene:(_,name)=>{current=name;},animate:()=>new Promise(r=>finish=r),cancelAnimation:()=>{},teach:()=>taught++});
 $('practice').click();document.querySelector('#practice-actions button').click();assert.equal(taught,1);assert.equal($('mission-count').textContent,'0 / 8');assert.match(current,/ALMA/);assert.equal(document.querySelector('#practice-actions button').disabled,true);
 const old=finish;$('practice').click();old(true);await Promise.resolve();assert.equal($('mission-count').textContent,'0 / 8');assert.match(current,/ALMA/);
 document.querySelector('#practice-actions button').click();finish(true);await Promise.resolve();assert.equal($('mission-count').textContent,'1 / 8');assert.match(current,/NOAH/);dom.window.close();
});
