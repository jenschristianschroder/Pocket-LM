// One cancellable timeline owns each scene. Resolves before the route advances.
export function createAnimator(world,{onBusy=()=>{}}={}){
 let timer,resolve;
 const reduced=()=>typeof window==='undefined'||!window.matchMedia||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function cancel(){clearTimeout(timer);if(resolve){resolve(false);resolve=null;}world.className='world';onBusy(false);}
 function play(action,message,delivered=true,{tired=false,sunrise=false,won=false}={}){
  cancel();const kind=sunrise?'sunrise':tired?'tired':action===0?(delivered?'chimney':'stuck'):action===1?'door':action===2?'fly':'rest';
  world.querySelector('#outcome').textContent=message;
  world.querySelector('#scene-note').textContent=({chimney:'Special delivery, straight down the chimney.',stuck:'Uh-oh. That present is not going to fit.',door:'A little knock. A little Christmas magic.',fly:'Up, up… and on to the next rooftop.',rest:'Carrots, a breather, and a little reindeer dreaming.',tired:'These hooves need a break.',sunrise:'The first light of Christmas morning.'})[kind];
  void world.offsetWidth;world.classList.add('animating',`scene-${kind}`);if(won)world.classList.add('christmas-saved');
  const duration=reduced()?0:kind==='sunrise'?2800:kind==='rest'?3600:kind==='stuck'?3800:4200;
  world.style.setProperty('--scene-duration',`${duration}ms`);onBusy(true);
  return new Promise(done=>{resolve=done;timer=setTimeout(()=>{resolve=null;world.classList.remove('animating');onBusy(false);done(true);},duration);});
 }
 return {play,cancel};
}
