(function(){
  'use strict';
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  const nav = $('.nav');
  const onScroll = ()=>{ nav.classList.toggle('scrolled', window.scrollY>40); };
  onScroll(); addEventListener('scroll', onScroll, {passive:true});

  const burger = $('.nav__burger');
  burger && burger.addEventListener('click', ()=>{
    const open = nav.classList.toggle('nav__menu-open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });
  $$('.nav__links a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('nav__menu-open');
    burger && burger.setAttribute('aria-expanded','false');
    document.body.classList.remove('no-scroll');
  }));

  const target = new Date('2026-10-31T21:00:00+01:00').getTime();
  const cd = {d:$('#cd-d'),h:$('#cd-h'),m:$('#cd-m'),s:$('#cd-s')};
  function tick(){
    if(!cd.d) return;
    let diff = Math.max(0, target - Date.now());
    const day = Math.floor(diff/864e5); diff-=day*864e5;
    const hr  = Math.floor(diff/36e5);  diff-=hr*36e5;
    const mn  = Math.floor(diff/6e4);   diff-=mn*6e4;
    const sc  = Math.floor(diff/1e3);
    const p=n=>String(n).padStart(2,'0');
    cd.d.textContent=p(day); cd.h.textContent=p(hr); cd.m.textContent=p(mn); cd.s.textContent=p(sc);
  }
  tick(); setInterval(tick,1000);

  const io = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.1, rootMargin:'0px 0px -6% 0px'});
  $$('.reveal,.reveal--left,.reveal--right,.reveal--scale,.reveal--fade').forEach(el=>io.observe(el));

  const pBg = $('.hero__bg'), pCat = $('.hero__catrina'), pSmoke = $('.hero__smoke');
  let mx=0,my=0,sy=0,rafP;
  function applyP(){
    if(pBg)   pBg.style.transform   = `translate3d(${mx*-14}px,${my*-10+sy*.12}px,0) scale(1.06)`;
    if(pCat)  pCat.style.transform  = `translate3d(${mx*10}px,${my*8+sy*.05}px,0)`;
    if(pSmoke)pSmoke.style.transform= `translate3d(${mx*22}px,${my*16-sy*.08}px,0)`;
    rafP=null;
  }
  function queueP(){ if(!rafP) rafP=requestAnimationFrame(applyP); }
  if(!reduce){
    addEventListener('pointermove',e=>{
      mx=(e.clientX/innerWidth-.5)*2; my=(e.clientY/innerHeight-.5)*2; queueP();
    },{passive:true});
    addEventListener('scroll',()=>{ sy=window.scrollY; queueP(); },{passive:true});
  }

  const cv = $('#embers');
  if(cv && !reduce){
    const ctx = cv.getContext('2d');
    let W,H,parts=[];
    const COLORS=['#ff7d1a','#ec3a12','#ecbb55','#f7d27f'];
    function size(){ W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight;
      const n=Math.round(W/22);
      parts=Array.from({length:n},()=>spawn(true));
    }
    function spawn(init){
      return {
        x:Math.random()*W,
        y:init?Math.random()*H:H+10,
        r:Math.random()*2.2+.6,
        vy:-(Math.random()*.5+.18),
        vx:(Math.random()-.5)*.35,
        a:Math.random()*.5+.25,
        tw:Math.random()*Math.PI*2,
        c:COLORS[Math.floor(Math.random()*COLORS.length)]
      };
    }
    function frame(){
      ctx.clearRect(0,0,W,H);
      parts.forEach(p=>{
        p.y+=p.vy; p.x+=p.vx; p.tw+=0.04;
        const fl=Math.sin(p.tw)*.3+.7;
        if(p.y<-12){ Object.assign(p,spawn(false)); }
        ctx.globalAlpha=p.a*fl;
        ctx.fillStyle=p.c;
        ctx.shadowColor=p.c; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
      });
      ctx.globalAlpha=1; ctx.shadowBlur=0;
      requestAnimationFrame(frame);
    }
    size(); addEventListener('resize',size); frame();
  }

  $$('.gal__tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const id=tab.dataset.year;
      $$('.gal__tab').forEach(t=>t.classList.toggle('active',t===tab));
      $$('.gal__panel').forEach(p=>p.classList.toggle('active',p.dataset.year===id));
    });
  });

  const lb=$('.lightbox'), lbImg=$('.lbimg'), lbCap=$('.lightbox__cap');
  let tiles=[], idx=0;
  function openLb(tile){
    tiles=$$('.gal__panel.active .gtile');
    idx=tiles.indexOf(tile);
    showLb();
    lb.classList.add('open'); document.body.classList.add('no-scroll');
  }
  function showLb(){
    const t=tiles[idx]; if(!t) return;
    const img=$('.gtile__img',t);
    const bg=img && getComputedStyle(img).backgroundImage;
    if(bg && bg!=='none'){ lbImg.style.backgroundImage=bg; lbImg.style.display='block'; }
    else { lbImg.style.display='none'; }
    lbCap.textContent=t.dataset.ph||'';
  }
  function closeLb(){ lb.classList.remove('open'); document.body.classList.remove('no-scroll'); }
  function step(d){ if(!tiles.length)return; idx=(idx+d+tiles.length)%tiles.length; showLb(); }
  $$('.gtile').forEach(t=>t.addEventListener('click',()=>openLb(t)));
  if(lb){
    $('.lightbox__close').addEventListener('click',closeLb);
    $('.lightbox__nav.prev').addEventListener('click',e=>{e.stopPropagation();step(-1);});
    $('.lightbox__nav.next').addEventListener('click',e=>{e.stopPropagation();step(1);});
    lb.addEventListener('click',e=>{ if(e.target===lb) closeLb(); });
    addEventListener('keydown',e=>{
      if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')closeLb();
      if(e.key==='ArrowLeft')step(-1);
      if(e.key==='ArrowRight')step(1);
    });
  }

  const form=$('#contactForm');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault(); let ok=true;
      $$('.field',form).forEach(f=>{
        const inp=$('input,textarea',f); if(!inp||!inp.required)return;
        let bad=!inp.value.trim();
        if(inp.type==='email' && inp.value) bad=!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value);
        f.classList.toggle('err',bad); if(bad)ok=false;
      });
      if(ok){
        form.style.display='none';
        $('#formSuccess').classList.add('show');
      }
    });
    $$('.field input,.field textarea',form).forEach(inp=>{
      inp.addEventListener('input',()=>inp.closest('.field').classList.remove('err'));
    });
  }

  const yr=$('#year'); if(yr) yr.textContent=new Date().getFullYear();
})();
