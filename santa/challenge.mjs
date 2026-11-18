import {ROUTE,newMission,inputs,step} from './mission.mjs';
import {ACTIONS,predict,winner} from './model.mjs';
export function setupChallenge({getModel,isTraining,lock,setScene,animate,teach}){
 const $=id=>document.getElementById(id);let state=newMission(),mode=null,model=null,timer=null,playing=false,history=[];
 const cards=ROUTE.map(h=>{const el=document.createElement('li');el.textContent=h.name;$('route').append(el);return el;});
 const teachingButtons=ACTIONS.map((name,action)=>{const b=document.createElement('button');b.textContent=name;b.addEventListener('click',()=>advance(action));$('practice-actions').append(b);return b;});
 function pause(){clearTimeout(timer);timer=null;playing=false;refresh();}
 function refresh(){
  const busy=isTraining();$('run-starter').disabled=busy||!getModel('starter');$('run-custom').disabled=busy||!getModel('custom');$('practice').disabled=busy;
  $('next-turn').disabled=!mode||mode==='practice'||state.done; $('autoplay').disabled=$('next-turn').disabled;$('autoplay').textContent=playing?'Pause route':'Play route';
  $('practice-actions').hidden=mode!=='practice'||state.done;teachingButtons.forEach(b=>b.disabled=busy||state.done);
  $('mission-time').textContent=`${state.minutes} min`;$('mission-energy').textContent=`${Math.round(state.energy*100)}%`;$('mission-count').textContent=`${state.delivered.length} / ${ROUTE.length}`;
  cards.forEach((el,i)=>{const delivered=state.delivered.includes(i);el.className=delivered?'delivered':mode&&!state.done&&state.index===i?'current':'';el.textContent=`${delivered?'✓ ':''}${ROUTE[i].name}`;el.setAttribute('aria-label',`${ROUTE[i].name}: ${delivered?'delivered':mode&&!state.done&&state.index===i?'current house':'waiting'}`);});
 }
 function scene(){setScene(inputs(state),`${state.index+1} / ${ROUTE[state.index].name.toUpperCase()}’S HOUSE`,model);}
 function start(kind){pause();state=newMission();history=[];$('mission-log').replaceChildren();mode=kind;model=kind==='practice'?null:structuredClone(getModel(kind));lock(true);scene();refresh();
  $('mission-result').textContent=kind==='practice'?'Practice route: choose each action below. Every choice becomes a teaching example.':'Route ready. Step through each model decision, or press Play route. The clock advances only when Santa acts.';
 }
 function advance(manual){
  if(!mode||state.done)return;
  const x=inputs(state),action=mode==='practice'?manual:winner(predict(model,x));if(mode==='practice')teach(x,action);
  const before=state, result=step(state,action);state=result.state;history.push({x,action});
  const item=document.createElement('li');const text=document.createElement('span');text.textContent=`${before.minutes} min · ${ROUTE[before.index].name} · ${ACTIONS[action]} → ${result.message}`;item.append(text);
  const review=document.createElement('button');review.className='text-button';review.textContent='Teach this situation';review.disabled=!state.done;review.addEventListener('click',()=>{pause();mode=null;lock(false);setScene(x,`REVIEW / ${ROUTE[before.index].name.toUpperCase()}`,null);$('training-status').textContent='Situation loaded. Choose a better action in “In this situation, I would…” below.';$('teach-title').scrollIntoView?.({behavior:'smooth'});refresh();});item.append(review);$('mission-log').prepend(item);
  animate(action,result.message,result.delivered);
  if(state.done){pause();lock(false);$('mission-log').querySelectorAll('button').forEach(b=>b.disabled=false);
   $('mission-result').textContent=state.won?`${mode==='practice'?'Practice complete':'Christmas saved'}! All 8 children received a present with ${state.minutes} minutes to spare.${mode==='practice'?' Now train My Santa and test it on the route.':''}`:`Sunrise! ${state.delivered.length}/8 children received presents. ${ROUTE.filter((_,i)=>!state.delivered.includes(i)).map(h=>h.name).join(', ')} still waiting. Review a decision, add better examples, train, and retry.`;
   const score=$('score-'+(mode==='custom'?'custom':mode==='starter'?'starter':'practice'));score.textContent=`${state.delivered.length}/8 · ${state.won?state.minutes+' min spare':'sunrise'}`;
  }else{scene();$('mission-result').textContent=mode==='practice'?`Next: ${ROUTE[state.index].name}. Choose an action to teach Santa.`:`Next: ${ROUTE[state.index].name}. ${state.minutes} minutes left.`;}
  refresh();if(playing&&!state.done)timer=setTimeout(()=>advance(),1800);
 }
 $('run-starter').addEventListener('click',()=>start('starter'));$('run-custom').addEventListener('click',()=>start('custom'));$('practice').addEventListener('click',()=>start('practice'));
 $('next-turn').addEventListener('click',()=>{pause();advance();});$('autoplay').addEventListener('click',()=>{if(playing)pause();else{playing=true;advance();}});
 $('exit-route').addEventListener('click',()=>{pause();mode=null;lock(false);$('mission-result').textContent='Practice controls unlocked. Your examples and last route results are kept.';refresh();});
 refresh();return {refresh};
}
