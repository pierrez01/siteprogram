(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
var fmt=function(n,d){return n.toFixed(d).replace('.',',')};
var root=document.documentElement;
root.classList.add('js');
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var hdr=$('#top');

/* ---------- tema ---------- */
try{var st=localStorage.getItem('inspetor-tema');if(st==='dark'||st==='light')root.setAttribute('data-theme',st);}catch(e){}
$('#theme').addEventListener('click',function(){
  var cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  var next=cur==='dark'?'light':'dark';
  root.setAttribute('data-theme',next);
  try{localStorage.setItem('inspetor-tema',next);}catch(e){}
});

/* ---------- revelar ao rolar ---------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
$$('.rv').forEach(function(el){io.observe(el);});

/* ---------- hero: modelo de caixa ---------- */
var bm=$('#bm'),bmC=$('#bm-c');
function heroUpdate(y){
  var hp=clamp(y/600,0,1);
  var m=Math.round(28+hp*36),b=Math.round(6+hp*8),p=Math.round(28+hp*30);
  bm.style.setProperty('--bm-m',m+'px');
  bm.style.setProperty('--bm-b',b+'px');
  bm.style.setProperty('--bm-p',p+'px');
  $('#r-m').textContent=m+'px';$('#r-b').textContent=b+'px';$('#r-p').textContent=p+'px';
  var cb=bmC.getBoundingClientRect();
  var sz=Math.round(cb.width)+' × '+Math.round(cb.height);
  $('#v-size').textContent=sz;$('#r-c').textContent=sz;
}
if(!reduced&&matchMedia('(pointer: fine)').matches){
  addEventListener('pointermove',function(e){
    bm.style.setProperty('--ty',((e.clientX/innerWidth-.5)*14)+'deg');
    bm.style.setProperty('--tx',(-(e.clientY/innerHeight-.5)*12)+'deg');
  });
}

/* ---------- história do HTML ---------- */
var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
function hl(s){
  return esc(s)
    .replace(/\s([a-z-]+)=("[^"]*")/g,' <span class="at">$1</span>=<span class="st">$2</span>')
    .replace(/(&lt;\/?)([a-z0-9]+)/g,'<span class="tg">$1$2</span>')
    .replace(/&gt;/g,'<span class="tg">&gt;</span>');
}
var DOC=[
 [0,'<body>'],
 [0,'  <header>'],
 [0,'    <a href="/">Loja</a>'],
 [0,'    <nav><a href="/cafes">Cafés</a></nav>'],
 [0,'  </header>'],
 [1,'  <main>'],
 [1,'    <h1>Café de origem única</h1>'],
 [2,'    <img src="grao.jpg" alt="Grãos torrados">'],
 [2,'    <button type="button">Comprar</button>'],
 [1,'  </main>'],
 [3,'  <footer>'],
 [3,'    <small>© 2026 Loja</small>'],
 [3,'  </footer>'],
 [0,'</body>']
];
var codeEl=$('#code');
codeEl.innerHTML=DOC.map(function(l){return '<span class="ln" data-s="'+l[0]+'">'+hl(l[1])+'</span>';}).join('');
var lns=$$('.ln'),stepEls=$$('.step'),pvs=$$('.pv');
var story=$('#story'),curStep=-1;
function applyStep(i){
  lns.forEach(function(l){var s=+l.dataset.s;l.classList.toggle('show',s<=i);l.classList.toggle('cur',s===i);});
  stepEls.forEach(function(e,k){e.classList.toggle('on',k===i);});
  pvs.forEach(function(e){var s=+e.dataset.s;e.classList.toggle('show',s<=i);e.classList.toggle('cur',s===i);});
  var c=lns.filter(function(l){return +l.dataset.s===i;})[0];
  if(c){var top=c.offsetTop-codeEl.clientHeight/2;codeEl.scrollTop=Math.max(0,top);}
}
var hb=56;
function storyUpdate(){
  var r=story.getBoundingClientRect();
  var sh=innerHeight-hb;
  var p=clamp((hb-r.top)/Math.max(1,r.height-sh),0,.999);
  var idx=Math.floor(p*4);
  if(idx!==curStep){curStep=idx;applyStep(idx);}
}

/* ---------- cartões de CSS (rolagem horizontal) ---------- */
var hs=$('#hs'),hsStick=$('#hs-stick'),hsTrack=$('#hs-track'),hsFill=$('#hs-fill'),hsN=$('#hs-n');
var pinned=false,dist=0;
function layoutHS(){
  pinned=innerWidth>=820&&innerHeight>=640;
  hs.classList.toggle('pinned',pinned);
  hsTrack.style.transform='';
  if(pinned){
    var top=hdr.getBoundingClientRect().bottom;
    var viewW=hsStick.clientWidth;
    dist=Math.max(0,hsTrack.scrollWidth-viewW);
    hs.style.height=(dist+innerHeight-top)+'px';
  }else{hs.style.height='';dist=0;}
}
hsStick.addEventListener('scroll',function(){hsStick.scrollLeft=0;});
function hsUpdate(){
  if(!pinned)return;
  var r=hs.getBoundingClientRect();
  var total=Math.max(1,r.height-(innerHeight-hb));
  var p=clamp((hb-r.top)/total,0,1);
  hsTrack.style.transform='translate3d('+(-p*dist)+'px,0,0)';
  hsFill.style.transform='scaleX('+p+')';
  hsN.textContent=(Math.min(4,Math.floor(p*5))+1)+' / 5';
}

/* demos de CSS */
var fx=$('#fx');
$$('#fx-seg button').forEach(function(btn){
  btn.addEventListener('click',function(){
    var items=Array.prototype.slice.call(fx.children);
    var first=items.map(function(i){return i.getBoundingClientRect().left;});
    fx.style.justifyContent=btn.dataset.v;
    items.forEach(function(it,k){
      var d=first[k]-it.getBoundingClientRect().left;
      it.style.transition='none';it.style.transform='translateX('+d+'px)';
    });
    void fx.offsetWidth;
    items.forEach(function(it){it.style.transition='transform .45s cubic-bezier(.2,.7,.2,1)';it.style.transform='';});
    $('#fx-code').textContent='justify-content: '+btn.dataset.v+';';
    $$('#fx-seg button').forEach(function(x){x.setAttribute('aria-pressed',x===btn?'true':'false');});
  });
});
var gn=$('#gr-n');
gn.addEventListener('input',function(){
  $('#gr').style.setProperty('--n',gn.value);
  $('#gr-code').textContent='grid-template-columns: repeat('+gn.value+', 1fr);';
});
var cph=$('#cp-h'),cpr=$('#cp-r');
function cpUpdate(){
  var d=$('#cp');d.style.setProperty('--h',cph.value);d.style.setProperty('--r',cpr.value+'px');
  $('#cp-code').textContent='--h: '+cph.value+';\n--r: '+cpr.value+'px;';
}
cph.addEventListener('input',cpUpdate);cpr.addEventListener('input',cpUpdate);
var ball=$('#ball'),etrack=$('#etrack'),easeNow='ease';
function setTravel(){etrack.style.setProperty('--travel',Math.max(0,etrack.clientWidth-36-12)+'px');}
$$('#ez-seg button').forEach(function(btn){
  btn.addEventListener('click',function(){
    easeNow=btn.dataset.v;ball.style.setProperty('--ez',easeNow);
    $('#ez-code').textContent='transition: transform 900ms '+(btn.textContent==='mola'?'cubic-bezier(…)':easeNow)+';';
    $$('#ez-seg button').forEach(function(x){x.setAttribute('aria-pressed',x===btn?'true':'false');});
  });
});
$('#run').addEventListener('click',function(){setTravel();ball.classList.toggle('r');});
var cqw=$('#cq-w'),cq=$('#cq');
function cqUpdate(){
  cq.style.setProperty('--w',cqw.value+'px');
  var w=Math.round(cq.getBoundingClientRect().width);
  $('#cq-code').textContent=w+' px · '+(w>=260?'em linha':'em coluna')+'\n@container (min-width: 260px)';
}
cqw.addEventListener('input',cqUpdate);

/* ---------- eventos: captura e bolha ---------- */
var A=$('#nA'),B=$('#nB'),C=$('#nC'),stopB=$('#stopB'),logEl=$('#log');
var queue=[],playing=false,timer=null;
function reg(el,name){
  el.addEventListener('click',function(){
    if(playing)return;
    queue.push({el:el,name:name,phase:el===C?'alvo · captura':'captura'});
    if(!timer)timer=setTimeout(play,0);
  },true);
  el.addEventListener('click',function(e){
    if(playing)return;
    queue.push({el:el,name:name,phase:el===C?'alvo · bolha':'bolha'});
    if(el===B&&stopB.checked)e.stopPropagation();
  },false);
}
reg(A,'A');reg(B,'B');reg(C,'C');
function play(){
  timer=null;playing=true;logEl.innerHTML='';
  var i=0;
  (function step(){
    $$('.flash').forEach(function(f){f.classList.remove('flash');});
    if(i>=queue.length){
      if(stopB.checked){var li=document.createElement('li');li.className='empty';li.textContent='A não recebeu a bolha: B chamou stopPropagation().';logEl.appendChild(li);}
      queue=[];playing=false;return;
    }
    var q=queue[i];i++;
    q.el.classList.add('flash');
    var li2=document.createElement('li');li2.innerHTML='<b>'+i+'</b><span>'+q.phase+' · '+q.name+'</span>';
    logEl.appendChild(li2);
    setTimeout(step,reduced?120:430);
  })();
}
var todo=$('#todo'),tn=3;
todo.addEventListener('click',function(e){
  var b=e.target.closest('button');
  if(b){var on=b.classList.toggle('done');b.setAttribute('aria-pressed',on?'true':'false');}
});
$('#add').addEventListener('click',function(){
  tn++;
  var li=document.createElement('li'),b=document.createElement('button');
  b.type='button';b.textContent='Tarefa nova '+(tn-3);b.setAttribute('aria-pressed','false');
  li.appendChild(b);todo.appendChild(li);
  $('#tcount').textContent='1 ouvinte · '+tn+' itens';
});

/* ---------- orçamento do quadro ---------- */
var STAGES=[
 {n:'JavaScript',ms:4.2,sc:'var(--c)',t:'Seu código roda: eventos, requestAnimationFrame e mudanças no DOM.'},
 {n:'Style',ms:1.8,sc:'var(--p)',t:'O navegador descobre quais regras de CSS valem para cada elemento.'},
 {n:'Layout',ms:3.6,sc:'var(--b)',t:'Calcula tamanho e posição de cada caixa. Ler offsetWidth após escrever estilo força isso na hora.'},
 {n:'Paint',ms:3.1,sc:'var(--m)',t:'Desenha texto, cores, bordas e sombras em camadas.'},
 {n:'Composite',ms:2.0,sc:'color-mix(in srgb, var(--c) 45%, var(--p))',t:'A GPU junta as camadas. transform e opacity pulam layout e paint.'}
];
var THRASH_LAYOUT=11.4,thrash=false;
var fbEl=$('#fb'),limEl=$('#lim'),stagesEl=$('#stages');
var segs=[],fills=[],stEls=[],stT=[];
STAGES.forEach(function(s){
  var seg=document.createElement('div');seg.className='fb-s';seg.style.setProperty('--sc',s.sc);
  seg.innerHTML='<i></i>';fbEl.insertBefore(seg,limEl);segs.push(seg);fills.push(seg.firstChild);
  var li=document.createElement('li');li.className='stg';li.style.setProperty('--sc',s.sc);
  li.innerHTML='<h3><span>'+s.n+'</span><span class="t"></span></h3><p>'+s.t+'</p>';
  stagesEl.appendChild(li);stEls.push(li);stT.push(li.querySelector('.t'));
});
var FS={t:[],total:0};
function times(){return STAGES.map(function(s){return (s.n==='Layout'&&thrash)?THRASH_LAYOUT:s.ms;});}
function frameLayout(){
  var t=times(),total=t.reduce(function(a,b){return a+b;},0),max=Math.max(total,16.67);
  segs.forEach(function(s,i){s.style.width=(t[i]/max*100)+'%';});
  limEl.style.left=(16.67/max*100)+'%';
  stT.forEach(function(el,i){el.textContent=fmt(t[i],1)+' ms';});
  FS.t=t;FS.total=total;
}
var fq=$('#fq'),msEl=$('#ms'),msv=$('#msv'),verdict=$('#verdict');
function frameUpdate(){
  var r=fq.getBoundingClientRect();
  var p=clamp((hb-r.top)/Math.max(1,r.height-(innerHeight-hb)),0,1);
  var el=p*FS.total,acc=0,act=0;
  FS.t.forEach(function(d,i){
    fills[i].style.transform='scaleX('+clamp((el-acc)/d,0,1)+')';
    if(el>=acc)act=i;
    acc+=d;
  });
  msv.textContent=fmt(el,2);
  msEl.classList.toggle('bad',el>16.67);
  stEls.forEach(function(e,i){e.classList.toggle('on',i===act);});
  if(p<.97){verdict.className='verdict';verdict.textContent='Role para ver o quadro ser montado.';}
  else if(FS.total>16.67){verdict.className='verdict bad';verdict.textContent='Quadro perdido: passou de 16,67 ms. A tela repete a imagem anterior e a página parece travar.';}
  else{verdict.className='verdict';verdict.textContent='Dentro do orçamento: sobram '+fmt(16.67-FS.total,2)+' ms.';}
}
$('#thrash').addEventListener('click',function(){
  thrash=!thrash;this.setAttribute('aria-pressed',thrash?'true':'false');
  frameLayout();frameUpdate();
});
frameLayout();

/* ---------- letreiro ---------- */
var TOOLS1=['HTML','CSS','JavaScript','TypeScript','React','Vue','Svelte','Vite'];
var TOOLS2=['Git','DevTools','Lighthouse','Figma','Playwright','ESLint','Prettier','Storybook'];
var DOTC=['--m','--b','--p','--c'];
var rows=[];
function mkSet(list){return list.map(function(t,i){return '<span class="mq-w">'+t+'</span><i class="d" style="background:var('+DOTC[i%4]+')"></i>';}).join('');}
$$('.mq').forEach(function(host,k){rows.push({host:host,el:host.querySelector('.mq-in'),set:mkSet(k?TOOLS2:TOOLS1),dir:k?1:-1,x:0,w:0});});
function measureRows(){
  rows.forEach(function(r){
    r.el.innerHTML='<span class="mq-set">'+r.set+'</span>';
    if(reduced){r.host.classList.add('static');return;}
    var w=r.el.firstElementChild.getBoundingClientRect().width;
    var copies=Math.ceil(r.host.clientWidth*2/Math.max(1,w))+1;
    var html='';for(var i=0;i<copies;i++)html+='<span class="mq-set">'+r.set+'</span>';
    r.el.innerHTML=html;r.w=w;r.x=r.dir<0?0:-w;
  });
}
var mqVisible=false;
new IntersectionObserver(function(es){mqVisible=es[0].isIntersecting;}).observe($('#ferramentas'));
var vel=0;
function marquee(){
  if(reduced||!mqVisible)return;
  rows.forEach(function(r){
    if(!r.w)return;
    r.x+=r.dir*(.7+vel*.4);
    if(r.dir<0&&r.x<=-r.w)r.x+=r.w;
    if(r.dir>0&&r.x>=0)r.x-=r.w;
    r.el.style.transform='translate3d('+r.x+'px,0,0)';
  });
}

/* ---------- roteiro ---------- */
var tl=$('#tl'),tlFill=$('#tl-fill'),tlItems=$$('.tl-item');
function tlUpdate(){
  var r=tl.getBoundingClientRect(),line=innerHeight*.6;
  tlFill.style.transform='scaleY('+clamp((line-r.top)/r.height,0,1)+')';
  tlItems.forEach(function(it){it.classList.toggle('on',it.getBoundingClientRect().top<line);});
}

/* ---------- checklist ---------- */
var CK=[
 ['Semântica',['Uma única h1 e títulos em ordem','Marcos da página: header, nav, main e footer']],
 ['Acessibilidade',['Todo controle funciona só com o teclado, com foco visível','Imagens com alt útil e decorativas com alt vazio','Contraste de texto de pelo menos 4,5:1']],
 ['Responsivo',['Funciona em 360 px sem rolagem horizontal','Alvos de toque com pelo menos 44 px']],
 ['Desempenho',['Imagens com largura e altura definidas, sem saltos de layout','CSS e JS que não bloqueiam o primeiro desenho','Animações só em transform e opacity']]
];
var saved=[];
try{saved=JSON.parse(localStorage.getItem('inspetor-check')||'[]');}catch(e){saved=[];}
if(!Array.isArray(saved))saved=[];
var gEl=$('#ck-groups'),idx=0,html='';
CK.forEach(function(g){
  html+='<div class="ck-g"><h3>'+g[0]+'</h3>';
  g[1].forEach(function(t){
    html+='<label class="ck-i"><input type="checkbox" id="ck-'+idx+'"'+(saved.indexOf(idx)>-1?' checked':'')+'><span>'+t+'</span></label>';
    idx++;
  });
  html+='</div>';
});
gEl.innerHTML=html;
var ckTotal=idx;
function ckUpdate(){
  var on=[];$$('#ck-groups input').forEach(function(c,i){if(c.checked)on.push(i);});
  $('#ring').style.strokeDashoffset=314.16*(1-on.length/ckTotal);
  $('#ck-n').textContent=on.length+'/'+ckTotal;
  $('#ck-msg').textContent=on.length===ckTotal?'Tudo marcado. Agora teste de verdade, só com o teclado e com um leitor de tela.':(on.length===0?'Marque cada item conforme conferir no seu projeto.':'Faltam '+(ckTotal-on.length)+' itens.');
  try{localStorage.setItem('inspetor-check',JSON.stringify(on));}catch(e){}
}
gEl.addEventListener('change',ckUpdate);
ckUpdate();

/* ---------- navegação ---------- */
var navLinks=$$('.nav a'),spy=navLinks.map(function(a){return $(a.getAttribute('href'));});
function spyUpdate(){
  var act=-1;
  spy.forEach(function(s,i){if(s.getBoundingClientRect().top<=innerHeight*.4)act=i;});
  navLinks.forEach(function(a,i){a.classList.toggle('active',i===act);});
}

/* ---------- laço principal ---------- */
var lastY=-1,first=true;
function update(y){
  hb=hdr.getBoundingClientRect().bottom;
  var max=document.documentElement.scrollHeight-innerHeight;
  $('#bar').style.transform='scaleX('+(max>0?clamp(y/max,0,1):0)+')';
  heroUpdate(y);storyUpdate();hsUpdate();frameUpdate();tlUpdate();spyUpdate();
}
function loop(){
  var y=window.scrollY||0;
  if(lastY<0)lastY=y;
  var dy=y-lastY;lastY=y;
  vel+=(Math.min(Math.abs(dy),80)-vel)*.1;
  if(dy!==0||first){update(y);first=false;}
  marquee();
  requestAnimationFrame(loop);
}
function relayout(){
  hb=hdr.getBoundingClientRect().bottom;
  layoutHS();measureRows();setTravel();cqUpdate();cpUpdate();
  first=true;
}
addEventListener('resize',relayout);
addEventListener('load',relayout);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(relayout);
relayout();
requestAnimationFrame(loop);
})();
