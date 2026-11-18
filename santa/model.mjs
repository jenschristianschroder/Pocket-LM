// A small dense neural network. No delivery rules are used during inference.
export const ACTIONS = ['Use the chimney', 'Try the front door', 'Visit another house', 'Rest the reindeer'];
export function random(seed=42) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function createModel(seed=42) { const r=random(seed); return {w1:Array.from({length:24},()=>Array.from({length:5},()=> (r()-.5)*1.2)), b1:Array(24).fill(0), w2:Array.from({length:4},()=>Array.from({length:24},()=> (r()-.5)*.5)), b2:Array(4).fill(0)}; }
export function forward(m,x) {
  const h=m.w1.map((row,j)=>Math.tanh(row.reduce((s,w,i)=>s+w*(x[i]*2-1),m.b1[j])));
  const z=m.w2.map((row,k)=>row.reduce((s,w,j)=>s+w*h[j],m.b2[k]));
  const exp=z.map(v=>Math.exp(v-Math.max(...z))), sum=exp.reduce((a,b)=>a+b,0);
  return {h,p:exp.map(v=>v/sum)};
}
export const predict=(m,x)=>forward(m,x).p;
export const winner=p=>p.indexOf(Math.max(...p));
export function trainEpoch(m,examples,rate=.025,rng=Math.random) {
  const order=Array.from({length:examples.length},(_,i)=>i);
  for(let i=order.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  let loss=0;
  for(const i of order){const {x,y}=examples[i], {h,p}=forward(m,x);loss-=Math.log(Math.max(p[y],1e-12));
    const dz=p.map((v,k)=>v-(k===y?1:0));
    const dh=h.map((v,j)=>dz.reduce((s,d,k)=>s+d*m.w2[k][j],0)*(1-v*v));
    m.w2.forEach((row,k)=>{row.forEach((_,j)=>row[j]-=rate*dz[k]*h[j]);m.b2[k]-=rate*dz[k];});
    m.w1.forEach((row,j)=>{row.forEach((_,k)=>row[k]-=rate*dh[j]*(x[k]*2-1));m.b1[j]-=rate*dh[j];});
  }return loss/examples.length;
}
