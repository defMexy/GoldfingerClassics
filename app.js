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

  function loadGtile(el){
    const src=el.dataset.src;
    if(!src) return;
    el.style.backgroundImage=`url('${src}')`;
    el.removeAttribute('data-src');
    el.closest('.gtile').classList.add('has-img');
  }
  const tileObs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) loadGtile(e.target); });
  },{rootMargin:'200px'});
  $$('.gtile__img[data-src]').forEach(el=>tileObs.observe(el));

  $$('.gal__tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const id=tab.dataset.year;
      $$('.gal__tab').forEach(t=>t.classList.toggle('active',t===tab));
      $$('.gal__panel').forEach(p=>p.classList.toggle('active',p.dataset.year===id));
      $$('.gtile__img[data-src]').forEach(el=>tileObs.observe(el));
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

  const chatWidget=$('#chatWidget'), chatToggle=$('#chatToggle');
  const chatMessages=$('#chatMessages'), chatInput=$('#chatInput');
  const chatChips=$('#chatChips');

  const _ci=d=>`<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ic={
    chevron: _ci('<polyline points="9 18 15 12 9 6"/>'),
    ticket:  _ci('<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>'),
    phones:  _ci('<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'),
    pin:     _ci('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    cal:     _ci('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    clock:   _ci('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    moon:    _ci('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    star:    _ci('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    shield:  _ci('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    mail:    _ci('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
  };

  const faq=[
    {keys:['ticket','tickets','kopen','bestel','prijs','kosten','euro','€'],
     ans:`Tickets zijn beschikbaar via onze ticketpartner.<br><br>${ic.chevron} Zeer vroege vogels: €22,50 — Nu verkrijgbaar<br>${ic.chevron} Iets minder vroege vogels: €25,00 — Binnenkort<br>${ic.chevron} Normale vlucht: €32,50 — Binnenkort<br><br><a href="https://kentering.fairtix.io/p/goldfinger-classics-2026" target="_blank" rel="noopener" class="chat-ticket-btn">${ic.ticket} Bestel tickets</a>`},
    {keys:['lineup','line-up','dj','artiest','wie','optreden','muziek'],
     ans:`De line-up van 2026:<br><br>${ic.phones} Darkraver — Headliner<br>${ic.phones} Ruthless — Hardstyle<br>${ic.phones} Potato — Freestyle<br>${ic.phones} Rob & MC Joe — Oldschool<br>${ic.phones} Francois — Legend<br>${ic.phones} DJ M — Resident<br>${ic.phones} PLN-B — Newschool<br><br>Meer namen volgen!`},
    {keys:['locatie','waar','adres','kentering','rosmalen','parkeer','auto'],
     ans:`${ic.pin} De Kentering<br>Deltalaan 162, Rosmalen<br><br>Gratis parkeren aanwezig. Goed bereikbaar per auto en OV.`},
    {keys:['datum','wanneer','date','oktober','tijd','uur','open','einde'],
     ans:`${ic.cal} Zaterdag 31 oktober 2026<br><br>${ic.clock} Deuren open: 21:00<br>${ic.moon} Einde: 03:00`},
    {keys:['dress','kleding','thema','catrina','outfit','kostuum'],
     ans:`${ic.star} Thema: Dia de los Muertos<br><br>Dress to impress — Catrina look wordt aangemoedigd! Trek je mooiste outfit aan en verdwijn in de nacht.`},
    {keys:['leeftijd','18','legitimatie','id','paspoort'],
     ans:`${ic.shield} Goldfinger Classics is 18+.<br><br>Legitimatie is verplicht aan de deur. Zorg dat je je ID meeneemt!`},
    {keys:['contact','mail','email','bereik','vragen'],
     ans:`${ic.mail} info@goldfingerclassics.com<br><br>Of gebruik het contactformulier onderaan de pagina.`},
    {keys:['hoi','hallo','hi','hey','goedemorgen','goedemiddag'],
     ans:'Hola! Welkom bij Goldfinger Classics.<br><br>Waar kan ik je mee helpen? Gebruik de knoppen hieronder of stel je vraag!'},
  ];

  function botReply(text){
    const lower=text.toLowerCase();
    for(const f of faq){
      if(f.keys.some(k=>lower.includes(k))) return f.ans;
    }
    return `Dat weet ik helaas niet.<br>Mail ons op info@goldfingerclassics.com of check onze socials!`;
  }

  function addMsg(text,type){
    const el=document.createElement('div');
    el.className=`msg msg--${type}`;
    if(type==='bot'){
      el.innerHTML=text;
    } else {
      el.textContent=text;
    }
    chatMessages.appendChild(el);
    chatMessages.scrollTop=chatMessages.scrollHeight;
  }

  function sendMsg(text){
    if(!text.trim()) return;
    addMsg(text,'user');
    chatInput.value='';
    chatChips.style.display='none';
    setTimeout(()=>addMsg(botReply(text),'bot'),420);
  }

  if(chatToggle){
    chatToggle.addEventListener('click',()=>{
      const open=chatWidget.classList.toggle('open');
      if(open && !chatMessages.children.length){
        setTimeout(()=>addMsg('Hola! Welkom bij Goldfinger Classics. Hoe kan ik je helpen?','bot'),200);
      }
    });
    $$('.chip',chatChips).forEach(c=>c.addEventListener('click',()=>sendMsg(c.dataset.q)));
    $('#chatSend').addEventListener('click',()=>sendMsg(chatInput.value));
    chatInput.addEventListener('keydown',e=>{ if(e.key==='Enter') sendMsg(chatInput.value); });
  }

  const backTop=$('.back-top');
  if(backTop){
    addEventListener('scroll',()=>backTop.classList.toggle('show',window.scrollY>400),{passive:true});
    backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }
})();
