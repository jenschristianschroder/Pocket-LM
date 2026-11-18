import {writeFileSync} from 'node:fs';
import {createModel,random,trainEpoch,predict,winner} from '../../santa/model.mjs';
// Synthetic teaching preferences, ONLY used to create offline training labels.
// Inputs: time remaining, storm, energy, gift width, chimney width, all 0..1.
export function teacher([time,storm,energy,gift,chimney]) {
  const fit=chimney-gift;
  return winner([2.2+2*fit-1.5*storm-1.2*(1-energy),1.9-.6*storm+.5*gift-.2*time, .3+2*storm+energy+.3*time, .1+2.6*(1-energy)+.5*storm+.4*time]);
}
export function dataset(n,seed){const r=random(seed);return Array.from({length:n},()=>{const x=Array.from({length:5},r);return {x,y:teacher(x)};});}
const train=dataset(5000,1225), test=dataset(1500,2027), m=createModel(25), rng=random(888);
let loss;for(let epoch=0;epoch<110;epoch++)loss=trainEpoch(m,train,.025*(1-epoch/140),rng);
const confusion=Array.from({length:4},()=>Array(4).fill(0));for(const e of test)confusion[e.y][winner(predict(m,e.x))]++;
const report={architecture:'5 → 24 tanh → 4 softmax',parameters:244,trainingExamples:train.length,testExamples:test.length,epochs:110,seed:25,loss,accuracy:confusion.reduce((s,r,i)=>s+r[i],0)/test.length,confusion,provenance:'Generated numeric scenarios with synthetic preference labels. No external dataset. Test measures agreement with the synthetic teacher, not real delivery quality.'};
writeFileSync(new URL('../../santa/checkpoint.json',import.meta.url),JSON.stringify(m));
writeFileSync(new URL('./report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(report);
