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
 $('act').click();assert.match(document.querySelector('.world').className,/acting-/);$('new-house').click();assert.equal(document.querySelector('.world').className,'world');
 $('undo').click();assert.match($('sample-count').textContent,/7 teaching/);$('clear').click();assert.equal($('train').disabled,true);dom.window.close();
});
