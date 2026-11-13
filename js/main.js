// ===== Edit these when details are ready =====
const WEDDING = { date: null /* e.g. "2026-12-19T10:00:00" */, venue: "" };
// =============================================
const $=s=>document.querySelector(s);
const page=document.body.dataset.page;
document.querySelectorAll('.nav a').forEach(a=>{if(a.dataset.p===page)a.classList.add('active')});
// Finds each image whatever its extension (png, jpg, jpeg, webp)
document.querySelectorAll('img[data-base]').forEach(img=>{
  const exts=['png','jpg','jpeg','webp','PNG','JPG','JPEG'];let i=0;
  const tryNext=()=>{if(i>=exts.length){img.classList.add('missing');return}img.src=img.dataset.base+'.'+exts[i++]};
  img.onerror=tryNext;tryNext();
});
const burger=$('#burger'),menu=$('#menu');
burger.onclick=()=>{const o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)};
if(page==='home'){
  if(WEDDING.venue)$('#wedding-venue').textContent=WEDDING.venue;
  if(WEDDING.date){
    const d=new Date(WEDDING.date);
    $('#wedding-date').textContent=d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    const box=$('#countdown');box.hidden=false;
    const tick=()=>{let s=Math.max(0,Math.floor((d-new Date())/1000));
      box.innerHTML=[['Days',86400],['Hours',3600],['Mins',60],['Secs',1]].map(([n,m])=>{const x=Math.floor(s/m);s-=x*m;return`<div><b>${x}</b>${n}</div>`}).join('')};
    tick();setInterval(tick,1000);
  }
  const ring=$('#ring'),figs=[...ring.children],n=figs.length,dots=$('#dots'),count=$('#count'),lb=$('#lightbox'),lbi=lb.querySelector('img');
  const calm=false; // auto-rotate always on
  let pos=0,target=0,R=0,w=0,raf=0,timer=0,hover=false,moved=0,sx=0,sp=0,down=false;
  const mod=(a,b)=>((a%b)+b)%b,off=i=>mod(i-pos+n/2,n)-n/2;
  figs.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Photo '+(i+1));b.onclick=()=>goTo(i);dots.appendChild(b)});
  function layout(){const W=ring.clientWidth;w=Math.min(250,W*.44);const h=w*1.28;ring.style.height=(h+50)+'px';R=Math.min(w*1.45,W*.5);
    figs.forEach(f=>{f.style.width=w+'px';f.style.height=h+'px';f.style.margin=`${-h/2}px 0 0 ${-w/2}px`})}
  function render(){let best=0,bd=9;
    figs.forEach((f,i)=>{const d=off(i),t=d*2*Math.PI/n,c=Math.cos(t),k=(c+1)/2;
      f.style.transform=`translate3d(${R*Math.sin(t)}px,${(1-c)*22}px,${(c-1)*R*.8}px) rotateY(${-d*(360/n)*.6}deg) scale(${.6+.4*k*k})`;
      f.style.opacity=Math.max(0,Math.min(1,(c+.4)/.9));
      f.style.filter=`brightness(${.5+.5*k*k})`;
      f.style.zIndex=Math.round(c*100)+100;
      if(Math.abs(d)<bd){bd=Math.abs(d);best=i}});
    figs.forEach((f,i)=>f.classList.toggle('on',i===best));
    [...dots.children].forEach((b,i)=>b.classList.toggle('on',i===best));
    count.textContent=String(best+1).padStart(2,'0')+' / '+String(n).padStart(2,'0')}
  function tick(){const d=target-pos;if(Math.abs(d)<.002||calm){pos=target;render();raf=0;return}pos+=d*.06;render();raf=requestAnimationFrame(tick)}
  const run=()=>{if(!raf)raf=requestAnimationFrame(tick)};
  function auto(){clearInterval(timer);if(!calm&&!hover)timer=setInterval(()=>{target=Math.round(target)+1;run()},2000)}
  function go(k){target=Math.round(target)+k;run();auto()}
  function goTo(i){const T=Math.round(target);target=T+mod(i-T+n/2,n)-n/2;run();auto()}
  $('#next').onclick=()=>go(1);$('#prev').onclick=()=>go(-1);
  ring.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});
  ring.addEventListener('pointerdown',e=>{down=true;moved=0;sx=e.clientX;sp=pos;target=pos});
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));if(moved>6){pos=target=sp-dx/(w*.75);render()}});
  addEventListener('pointerup',()=>{if(!down)return;down=false;if(moved>6){target=Math.round(target);run()}});
  figs.forEach((f,i)=>f.onclick=()=>{if(moved>6)return;if(f.classList.contains('on')){const im=f.querySelector('img');if(im.classList.contains('missing'))return;lbi.src=im.src;lb.classList.add('open')}else goTo(i)});
  lb.onclick=()=>lb.classList.remove('open');
  const stage=$('.stage');stage.onmouseenter=()=>{hover=true;clearInterval(timer)};stage.onmouseleave=()=>{hover=false;auto()};
  addEventListener('resize',()=>{layout();render()});
  layout();render();auto();
}
document.querySelectorAll('.copy').forEach(b=>b.onclick=async()=>{
  try{await navigator.clipboard.writeText($('#'+b.dataset.target).textContent.trim());b.textContent='Copied!';setTimeout(()=>b.textContent='Copy',1500)}catch(e){}
});

if(page==='programme'){
  const btn=$('#dl-btn'),st=$('#dl-status');
  const FILE='files/programme-outline.pdf',NAME='Appau-Ansah-Wedding-Programme.pdf';
  const save=url=>{const a=document.createElement('a');a.href=url;a.download=NAME;document.body.appendChild(a);a.click();a.remove()};
  btn.onclick=async()=>{
    btn.disabled=true;st.textContent='Preparing your download...';
    try{
      const r=await fetch(FILE);if(!r.ok)throw 0;
      const url=URL.createObjectURL(await r.blob());save(url);setTimeout(()=>URL.revokeObjectURL(url),2000);
    }catch(e){save(FILE)} // fallback (e.g. when opened directly from a folder)
    st.textContent='Download started. Check your Downloads folder.';
    btn.disabled=false;setTimeout(()=>st.textContent='',5000);
  };
}