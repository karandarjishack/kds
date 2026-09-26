/* ============ KDS v3: motion engine ============ */
(function(){
"use strict";
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var finePointer = window.matchMedia('(pointer: fine)').matches;

/* ---------- boot ---------- */
function dismissBoot(){ document.getElementById('boot').classList.add('done'); }
window.addEventListener('load', function(){ setTimeout(dismissBoot, 900); });
setTimeout(dismissBoot, 3200); // fallback

/* ---------- cursor ---------- */
if (finePointer && !reduced) {
  var cur = document.getElementById('cursor'), dot = document.getElementById('cursor-dot');
  var mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  addEventListener('mousemove', function(e){
    mx=e.clientX; my=e.clientY;
    dot.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
    var t=e.target.closest && e.target.closest('a,button,.svc,.pcard');
    cur.style.width=t?'56px':'34px'; cur.style.height=t?'56px':'34px';
    cur.style.borderColor=t?'rgba(255,75,51,.85)':'rgba(255,75,51,.45)';
  });
  (function loop(){
    var dx=mx-cx, dy=my-cy;
    if(Math.abs(dx)>.1||Math.abs(dy)>.1){ /* sleep when idle: no per-frame layout work */
      cx+=dx*.16; cy+=dy*.16;
      cur.style.transform='translate('+cx+'px,'+cy+'px) translate(-50%,-50%)';
    }
    requestAnimationFrame(loop);
  })();
} else {
  var c1=document.getElementById('cursor'), c2=document.getElementById('cursor-dot');
  if(c1)c1.style.display='none'; if(c2)c2.style.display='none';
}

/* ---------- nav ---------- */
var nav=document.getElementById('nav');
addEventListener('scroll', function(){
  nav.classList.toggle('scrolled', scrollY>40);
},{passive:true});
var menuBtn=document.getElementById('menu-btn'), mobileMenu=document.getElementById('mobile-menu');
menuBtn.addEventListener('click', function(){ mobileMenu.classList.toggle('open'); });
mobileMenu.querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){ mobileMenu.classList.remove('open'); });
});
// active link
var navAs={}; document.querySelectorAll('.nav-links a').forEach(function(a){
  navAs[a.getAttribute('href').slice(1)]=a;
});
var secObs=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting && navAs[e.target.id]){
      Object.values(navAs).forEach(function(a){a.classList.remove('active');});
      navAs[e.target.id].classList.add('active');
    }
  });
},{rootMargin:'-40% 0px -55% 0px'});
['problem','services','process','record','pricing'].forEach(function(id){
  var el=document.getElementById(id); if(el) secObs.observe(el);
});

/* ---------- reveal ---------- */
var revealObs=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting){
      var d=parseInt(e.target.getAttribute('data-delay')||'0',10);
      setTimeout(function(){ e.target.classList.add('in'); }, d);
      revealObs.unobserve(e.target);
    }
  });
},{threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.reveal').forEach(function(el){ revealObs.observe(el); });

/* ---------- counters ---------- */
function animateCount(el){
  var target=parseFloat(el.getAttribute('data-count'));
  var pre=el.getAttribute('data-prefix')||'', suf=el.getAttribute('data-suffix')||'';
  var dec=(el.getAttribute('data-count').indexOf('.')>-1)?2:0;
  var t0=null, dur=1700;
  function frame(t){
    if(!t0)t0=t; var p=Math.min((t-t0)/dur,1);
    var e=1-Math.pow(1-p,4);
    el.textContent=pre+(target*e).toFixed(dec)+suf;
    if(p<1)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
var cntObs=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting){ animateCount(e.target); cntObs.unobserve(e.target); }
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(function(el){ cntObs.observe(el); });

/* ---------- ROI bars ---------- */
var roiObs=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting){
      e.target.querySelectorAll('.roi-fill').forEach(function(f){
        f.style.width=f.getAttribute('data-w')+'%';
      });
      roiObs.unobserve(e.target);
    }
  });
},{threshold:.35});
var roi=document.querySelector('.roi'); if(roi) roiObs.observe(roi);

/* ---------- terminal typer ---------- */
var termBody=document.getElementById('term-body');
var LINES=[
  {t:'$ kds recon --target client.com', c:''},
  {t:'[+] 142 subdomains enumerated · 38 live hosts', c:'ok'},
  {t:'[+] cloud inventory: 6 buckets · 2 publicly readable', c:'ok'},
  {t:'[!] CRITICAL: MFA bypass · /login (auth flow)', c:'crit'},
  {t:'[!] HIGH: exposed .git · staging.client.com', c:'warn'},
  {t:'[+] exploit chain confirmed: unauthenticated → admin', c:''},
  {t:'[✓] fixes verified on retest. 0 criticals remain', c:'ok'}
];
if (termBody && !reduced) {
  var li=0, ci=0, cur2=null;
  function newLine(){
    cur2=document.createElement('div');
    if(LINES[li].c) cur2.className=LINES[li].c;
    termBody.appendChild(cur2); ci=0;
    setTimeout(typeChar, 300);
  }
  function typeChar(){
    var line=LINES[li];
    if(ci<=line.t.length){
      cur2.textContent=line.t.slice(0,ci);
      var caret=document.createElement('span'); caret.className='term-caret';
      cur2.appendChild(caret);
      ci++; setTimeout(typeChar, 10+Math.random()*22);
    } else {
      cur2.textContent=line.t;
      li++;
      if(li<LINES.length){ setTimeout(newLine, 420); }
      else { setTimeout(function(){
        termBody.style.transition='opacity .8s'; termBody.style.opacity='0';
        setTimeout(function(){
          termBody.innerHTML=''; termBody.style.opacity='1'; li=0; newLine();
        }, 850);
      }, 2600); }
    }
  }
  var termObs=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ newLine(); termObs.disconnect(); } });
  },{threshold:.3});
  termObs.observe(termBody);
} else if (termBody) {
  LINES.forEach(function(l){
    var d=document.createElement('div'); if(l.c)d.className=l.c; d.textContent=l.t;
    termBody.appendChild(d);
  });
}

/* ---------- hero canvas: live attack-surface simulation ---------- */
(function(){
  var cv=document.getElementById('net'); if(!cv) return;
  var ctx=cv.getContext('2d');
  var W=0,H=0,DPR=1;
  var NODES=[
    {x:.08,y:.30,l:'WEB'},{x:.20,y:.62,l:'API'},{x:.30,y:.24,l:'VPN'},
    {x:.38,y:.55,l:'MX'},{x:.47,y:.30,l:'S3'},{x:.55,y:.66,l:'CDN'},
    {x:.63,y:.34,l:'IDP'},{x:.71,y:.60,l:'CI'},{x:.79,y:.28,l:'DNS'},
    {x:.87,y:.55,l:'ERP'},{x:.94,y:.34,l:'DB',crown:true},{x:.14,y:.82,l:'IOT'}
  ];
  var LINKS=[[0,1],[0,2],[1,3],[1,4],[2,4],[3,5],[4,5],[4,6],[5,7],[6,7],[6,8],[7,9],[8,9],[8,10],[9,10],[1,11],[3,11]];
  var VULNS=['CVE-2022-33129 · AUTH BYPASS','MFA BYPASS · /login','EXPOSED .GIT · STAGING','IDOR · /api/v2/users','SSRF · METADATA','SUBDOMAIN TAKEOVER'];
  var nodes=NODES.map(function(n,i){
    return {x:n.x,y:n.y,l:n.l,crown:!!n.crown,state:0,t:0,ring:0,label:null,lt:0,vi:i};
  });
  var particles=[], sweep={x:-.1}, attackT=0, attackPath=null, attackP=0;
  for(var i=0;i<46;i++) particles.push({x:Math.random(),y:Math.random(),s:.4+Math.random()*1.4,vx:(Math.random()-.5)*.0004,vy:(Math.random()-.5)*.0004});

  function resize(){
    DPR=1; /* ambient canvas: DPR 1 is plenty for glowing dots, halves the pixels to shade */
    W=cv.clientWidth; H=cv.clientHeight;
    cv.width=W*DPR; cv.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize(); addEventListener('resize',resize);

  function px(n){ return {x:n.x*W, y:n.y*H}; }
  var COL={dim:'rgba(160,160,170,', scan:'rgba(245,243,236,', vuln:'rgba(255,75,51,', ok:'rgba(61,220,132,'};

  function setLabel(n,text){ /* cache text width once: measureText every frame was wasteful */
    n.label=text; n.lt=0;
    ctx.font='700 10.5px "JetBrains Mono",monospace';
    n.lw=ctx.measureText(text).width;
  }

  function activate(n){
    if(n.state!==0) return;
    n.state=1; n.t=0; n.ring=0;
    setTimeout(function(){
      if(Math.random()<.58){
        n.state=2; setLabel(n,VULNS[Math.floor(Math.random()*VULNS.length)]);
        setTimeout(function(){ n.state=3; setLabel(n,'PATCHED ✓'); }, 1100+Math.random()*700);
      } else { n.state=3; setLabel(n,'CLEAN'); }
    }, 650+Math.random()*400);
  }

  function drawNode(n,t){
    var p=px(n), r=n.crown?9:6, col=COL.dim, alpha=.5;
    if(n.state===1){ col=COL.scan; alpha=.95; }
    if(n.state===2){ col=COL.vuln; alpha=1; r+=Math.sin(t/90)*1.6; }
    if(n.state===3){ col=COL.ok; alpha=.9; }
    // glow (flat alpha disc: same look as the old radial gradient, ~10x cheaper)
    ctx.globalAlpha=alpha*.30; ctx.fillStyle=col+'1)';
    ctx.beginPath(); ctx.arc(p.x,p.y,r*4,0,7); ctx.fill(); ctx.globalAlpha=1;
    // core
    ctx.fillStyle=col+'1)'; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,7); ctx.fill();
    if(n.crown){ ctx.strokeStyle=COL.ok+'1)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,r+5,0,7); ctx.stroke(); }
    // scan ring
    if(n.state===1){ n.ring+=.06;
      ctx.strokeStyle=COL.scan+(Math.max(0,.8-n.ring*.35))+')'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,r+6+n.ring*22,0,7); ctx.stroke(); }
    // vuln pulse
    if(n.state===2){
      ctx.strokeStyle=COL.vuln+(.5+Math.sin(t/110)*.4)+')'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(p.x,p.y,r+8+Math.sin(t/110)*3,0,7); ctx.stroke(); }
    // label
    ctx.font='600 10px "JetBrains Mono",monospace'; ctx.textAlign='center';
    ctx.fillStyle=n.state===2?COL.vuln+'1)':(n.state===3?COL.ok+'.85)':'rgba(160,160,170,.55)');
    ctx.fillText(n.l,p.x,p.y-r-10);
    if(n.label){
      n.lt++;
      var la=Math.min(1,n.lt/20)*(n.lt>160?Math.max(0,1-(n.lt-160)/40):1);
      ctx.font='700 10.5px "JetBrains Mono",monospace';
      var tw=n.lw||0;
      ctx.fillStyle=n.state===2?'rgba(50,10,6,'+(.85*la)+')':'rgba(4,20,12,'+(.85*la)+')';
      ctx.strokeStyle=n.state===2?COL.vuln+(.9*la)+')':COL.ok+(.9*la)+')'; ctx.lineWidth=1;
      var bx=p.x-tw/2-9, by=p.y+r+12, bw=tw+18, bh=20;
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(bx,by,bw,bh,6); else ctx.rect(bx,by,bw,bh);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle=n.state===2?'#ffd9d2':'#c9ffe4';
      ctx.fillText(n.label,p.x,by+14);
    }
  }

  var frame=0, rafId=null, lastT=0;
  function tick(t){
    rafId=requestAnimationFrame(tick);
    if(t-lastT<34) return; /* ~30fps is plenty for ambient motion; halves the workload */
    lastT=t;
    frame++;
    ctx.clearRect(0,0,W,H);
    // particles
    particles.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=1; if(p.x>1)p.x=0; if(p.y<0)p.y=1; if(p.y>1)p.y=0;
      ctx.fillStyle='rgba(160,160,170,.16)';
      ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.s,0,7); ctx.fill();
    });
    // links
    LINKS.forEach(function(L){
      var a=px(nodes[L[0]]), b=px(nodes[L[1]]);
      var hot=(nodes[L[0]].state===2||nodes[L[1]].state===2);
      ctx.strokeStyle=hot?'rgba(255,75,51,.35)':'rgba(160,160,170,.10)';
      ctx.lineWidth=hot?1.4:1;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    });
    // sweep
    sweep.x+=.0035; if(sweep.x>1.15){ sweep.x=-.15;
      nodes.forEach(function(n){ if(n.state===3&&Math.random()<.4){n.state=0;n.label=null;} });
    }
    var sx=sweep.x*W;
    var sg=ctx.createLinearGradient(sx-90,0,sx+40,0);
    sg.addColorStop(0,'rgba(245,243,236,0)'); sg.addColorStop(1,'rgba(245,243,236,.14)');
    ctx.fillStyle=sg; ctx.fillRect(sx-90,0,130,H);
    ctx.strokeStyle='rgba(245,243,236,.5)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke();
    nodes.forEach(function(n){ if(Math.abs(n.x-sweep.x)<.012) activate(n); });
    // attack path cinematic
    attackT++;
    if(attackT>900 && !attackPath){
      var order=[0,1,4,6,8,10];
      attackPath=order; attackP=0; attackT=0;
    }
    if(attackPath){
      attackP+=.02;
      var seg=Math.floor(attackP), fp=attackP-seg;
      for(var s=0;s<Math.min(seg+1,attackPath.length-1);s++){
        var A=px(nodes[attackPath[s]]), B=px(nodes[attackPath[Math.min(s+1,attackPath.length-1)]]);
        ctx.strokeStyle='rgba(255,75,51,.75)'; ctx.lineWidth=2; ctx.setLineDash([7,7]);
        ctx.lineDashOffset=-frame*.6;
        ctx.beginPath(); ctx.moveTo(A.x,A.y);
        if(s<seg) ctx.lineTo(B.x,B.y);
        else ctx.lineTo(A.x+(B.x-A.x)*fp, A.y+(B.y-A.y)*fp);
        ctx.stroke(); ctx.setLineDash([]);
      }
      if(attackP>=attackPath.length-1){
        var crown=nodes[attackPath[attackPath.length-1]];
        crown.state=2; setLabel(crown,'CROWN JEWELS · REACHED');
        setTimeout(function(){ crown.state=3; setLabel(crown,'CONTAINED ✓'); },1400);
        attackPath=null;
      }
    }
    nodes.forEach(function(n){ drawNode(n,t||0); });
  }

  if(reduced){
    resize();
    nodes.forEach(function(n,i){ if(i%3===0){n.state=3;} });
    (function once(){ ctx.clearRect(0,0,W,H);
      LINKS.forEach(function(L){ var a=px(nodes[L[0]]),b=px(nodes[L[1]]);
        ctx.strokeStyle='rgba(160,160,170,.12)'; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); });
      nodes.forEach(function(n){ drawNode(n,0); });
    })();
  } else {
    /* fully stop the loop when the hero is off-screen (the old version kept
       requesting frames forever, burning CPU on invisible work) */
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ if(rafId===null){ lastT=0; rafId=requestAnimationFrame(tick); } }
        else { if(rafId!==null){ cancelAnimationFrame(rafId); rafId=null; } }
      });
    }).observe(cv);
  }
})();

/* ---------- process sticky steps ---------- */
(function(){
  var steps=document.querySelectorAll('.pstep');
  var nodes=document.querySelectorAll('.pipe-node');
  var fill=document.getElementById('pipe-fill');
  var proof=document.getElementById('process-proof');
  if(!steps.length) return;
  function setActive(i){
    steps.forEach(function(s,j){ s.classList.toggle('active', j===i); });
    nodes.forEach(function(n,j){
      n.classList.toggle('active', j===i);
      n.classList.toggle('done', j<i);
    });
    if(fill) fill.style.height=(i/(steps.length-1)*100)+'%';
    var p=steps[i].getAttribute('data-proof');
    if(proof && proof.textContent!==p){
      proof.style.opacity='0';
      setTimeout(function(){ proof.textContent=p; proof.style.opacity='1'; },180);
    }
  }
  var obs=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting) setActive(parseInt(e.target.getAttribute('data-step'),10));
    });
  },{rootMargin:'-42% 0px -42% 0px'});
  steps.forEach(function(s){ obs.observe(s); });
  setActive(0);
})();

/* ---------- magnetic buttons ---------- */
if (finePointer && !reduced){
  document.querySelectorAll('.magnetic').forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var r=el.getBoundingClientRect();
      var x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
      el.style.transform='translate('+(x*.12)+'px,'+(y*.18)+'px)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transform=''; });
  });
}

/* ---------- ticker: duplicate for gapless loop ---------- */
(function(){
  var tr=document.getElementById('ticker-track');
  if(tr) tr.innerHTML+=tr.innerHTML;
})();
})();

/* ---------- scope form: guided intake -> prefilled professional email ---------- */
(function(){
  var form=document.getElementById('scope-form'); if(!form) return;
  var err=document.getElementById('form-err'), ok=document.getElementById('form-ok');
  function val(id){ var el=document.getElementById(id); return el?el.value.trim():''; }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=val('f-name'), email=val('f-email'), company=val('f-company');
    err.hidden=true;
    if(!name||!email||!company||email.indexOf('@')<0||email.indexOf('.')<0){ err.hidden=false; return; }
    var website=val('f-site'), scope=val('f-scope'), when=val('f-when'), details=val('f-msg');
    var subject='KDS assessment request: '+company;
    var body=
      'Hi KDS team,\n\n'+
      "I'd like to request a security assessment.\n\n"+
      'Name: '+name+'\n'+
      'Work email: '+email+'\n'+
      'Company: '+company+'\n'+
      (website?'Website: '+website+'\n':'')+
      'Scope: '+scope+'\n'+
      'Timeline: '+when+'\n'+
      (details?'\nDetails:\n'+details+'\n':'')+
      '\nSent from karandarjishack.github.io/kds';
    window.location.href='mailto:Karandarjishack@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    ok.hidden=false;
  });
})();
