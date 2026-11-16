/* Original scans remain the reading source; OCR is used only for discovery. */
'use strict';
const hymns=window.SONGBOOK_DATA.hymns;
const $=s=>document.querySelector(s);
const page=$('#page');
let current=1,selected=null,touch=null,corrections={},indexPage=0;
const INDEX_PAGE_SIZE=50;
let viewMode='song';
try { corrections=JSON.parse(localStorage.getItem('abu-corrections-v2')||'{}'); } catch {}
if(!corrections||typeof corrections!=='object'||Array.isArray(corrections))corrections={};
function correction(h){const c=corrections[h.n];return c&&typeof c==='object'?c:{};}
function english(h){return typeof correction(h).english==='string'?correction(h).english:h.t;}
function igbo(h){return typeof correction(h).igbo==='string'?correction(h).igbo:h.igbo.map(x=>x.text).join(' / ');}
function norm(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘`']/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function matches(h,q,lyrics=false){
 const raw=String(q).trim();
 if(/^\d+$/.test(raw))return h.n===Number(raw);
 const tokens=norm(raw).split(/\s+/).filter(Boolean);
 const haystack=norm(english(h)+' '+igbo(h)+(lyrics?' '+h.ocr:''));
 return tokens.every(t=>haystack.includes(t));
}
function results(q,lyrics){return hymns.filter(h=>matches(h,q,lyrics));}
function covering(n){return hymns.filter(h=>h.p<=n&&h.end>=n);}
function selectedHymn(){return hymns.find(h=>h.n===selected)||covering(current)[0]||null;}
function textElement(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;}
const indexPager=document.createElement('div'),indexPrevious=document.createElement('button'),indexRange=document.createElement('span'),indexNext=document.createElement('button');
indexPager.className='index-pager';indexPrevious.textContent='← Previous';indexPrevious.setAttribute('aria-label','Previous hymn index page');indexRange.setAttribute('aria-live','polite');indexNext.textContent='Next →';indexNext.setAttribute('aria-label','Next hymn index page');indexPager.append(indexPrevious,indexRange,indexNext);($('#songs').parentElement||$('#songs')).append(indexPager);
function list(){
 const items=results($('#search').value,$('#lyrics').checked).filter(h=>(!categoryFilter||(h.n>=categoryFilter[0]&&h.n<=categoryFilter[1]))&&(!favoritesOnly||favorites.includes(h.n))).sort((a,b)=>$('#sort').value==='igbo'?igbo(a).localeCompare(igbo(b),'ig'):$('#sort').value==='english'?english(a).localeCompare(english(b)):a.n-b.n);
 const pageCount=Math.max(1,Math.ceil(items.length/INDEX_PAGE_SIZE));
 indexPage=Math.min(Math.max(0,indexPage),pageCount-1);
 const first=indexPage*INDEX_PAGE_SIZE,visible=items.slice(first,first+INDEX_PAGE_SIZE);
 $('#songs').replaceChildren(...visible.map(h=>{
  const b=document.createElement('button');b.className='song';
  if(h.n===selected){b.classList.add('active');b.setAttribute('aria-current','true');}
  b.append(textElement('b','HYMN '+h.n),textElement('span',english(h)),textElement('span',igbo(h),'igbo'));
  b.lastChild.lang='ig';b.onclick=()=>{setHome(false);viewMode='song';$('#view-mode').value=viewMode;go(h.p,h.n);};return b;
 }));
 const missing=String($('#search').value).trim()==='295';
 $('#count').textContent=missing?'Hymn 295 appears in the printed index, but its song page is missing from this PDF.':items.length+' of 294 hymns'+(items.length?'':' — try fewer words or the printed index.');
 indexPager.hidden=!items.length;indexPrevious.disabled=indexPage===0;indexNext.disabled=indexPage===pageCount-1;
 indexRange.textContent=items.length?'Showing hymns '+(first+1)+'–'+Math.min(first+INDEX_PAGE_SIZE,items.length)+' of '+items.length+' · page '+(indexPage+1)+' of '+pageCount:'';
}
function showHymn(){
 const h=selectedHymn(),all=covering(current);
 $('#now-title').textContent=h?'Hymn '+h.n+' · '+english(h):current===1?'Title page':current===2?'Introduction':current===3?'Order of hymns':'Printed index';
 $('#now-igbo').textContent=h?igbo(h):'';
 $('#now-igbo').lang='ig';
 $('#title-quality').textContent=h?(correction(h).igbo!==undefined?'Igbo title corrected on this device':'Igbo first line: draft transcription; check the scan'):'';
 $('#edit-title').disabled=!h;
 $('#prev-hymn').disabled=!h||h.n===1;
 $('#next-hymn').disabled=!h||h.n===294;
 $('#status').textContent='PDF page '+current+' of 356'+(all.length>1?' · Hymns '+all.map(x=>x.n).join(' and ')+' share this page':'');
 $('#editor').hidden=true;
 updateFavorite();
}
function setFrame(frame,img,n,crop=null){
 const [width,height]=window.SONGBOOK_DATA.pageSizes[n];
 const [top,bottom]=crop||[0,height],visible=bottom-top;
 frame.style.width=(width/visible*80)+'vh';frame.style.aspectRatio=width+'/'+visible;
 img.style.width='100%';img.style.maxWidth='none';img.style.height=(height/visible*100)+'%';img.style.top=(-top/visible*100)+'%';
 img.src='pages/'+n+'.jpg';img.alt='Original hymn scan, PDF page '+n;
}
function renderSong(){
 const h=selectedHymn(),song=viewMode==='song'&&h;
 const n=song?h.p:current;
 setFrame($('#scan-frame'),page,n,song?window.SONGBOOK_DATA.songCrops[h.n]:null);
 const continuations=[];
 if(song){for(let p=h.p+1;p<=h.end;p++){
  const block=document.createElement('div');block.className='continuation';
  const caption=textElement('p','Hymn '+h.n+' · continued · original PDF page '+p,'note');
  const frame=document.createElement('div');frame.className='scan-frame';
  const img=document.createElement('img');img.loading='lazy';setFrame(frame,img,p);img.onerror=page.onerror;
  frame.append(img);block.append(caption,frame);continuations.push(block);
 }}
 $('#continuations').replaceChildren(...continuations);
 if(song)$('#status').textContent='Hymn '+h.n+' of 294 · '+(h.end>h.p?(h.end-h.p+1)+' original scans grouped in this hymn view':'one song in this view');
 $('#prev').disabled=song?h.n===1:current===1;$('#next').disabled=song?h.n===294:current===356;
 $('#prev').textContent=song?'← Previous hymn':'← Previous scan';$('#next').textContent=song?'Next hymn →':'Next scan →';
 $('#prev').setAttribute('aria-label',song?'Previous hymn':'Previous scan');$('#next').setAttribute('aria-label',song?'Next hymn':'Next scan');
 $('#view-note').textContent=song?'One hymn per digital view. Longer hymns continue below; the original notation is preserved.':'Original scan view. Some scans contain two short hymns.';
}
function go(n,hymnNumber=null){
 n=Number(n);if(!Number.isInteger(n)||n<1||n>356)return false;
 const direction=(n===current&&hymnNumber!==null&&selected!==null?hymnNumber>=selected:n>=current)?'forward':'back';current=n;
 selected=hymnNumber===null?(covering(n)[0]?.n??null):hymnNumber;
 $('#book-content').classList.remove('forward','back');void $('#book-content').offsetWidth;$('#book-content').classList.add(direction);
 page.src='pages/'+n+'.jpg';page.alt='Original hymnal scan, PDF page '+n;
 $('#number').value=n;$('#prev').disabled=n===1;$('#next').disabled=n===356;
 try{localStorage.setItem('abu-page-v2',JSON.stringify({page:n,hymn:selected}));}catch{}
 showHymn();renderSong();list();$('#stage').scrollTop=0;return true;
}
function moveHymn(delta){const h=selectedHymn();if(h){const target=hymns.find(x=>x.n===h.n+delta);if(target)go(target.p,target.n);}}
function turn(delta){if(viewMode==='song'&&selectedHymn())moveHymn(delta);else go(current+delta);}
$('#view-mode').value=viewMode;
$('#view-mode').onchange=()=>{viewMode=$('#view-mode').value;showHymn();renderSong();};
$('#search').oninput=()=>{indexPage=0;list();};$('#lyrics').onchange=()=>{indexPage=0;list();};
indexPrevious.onclick=()=>{indexPage=Math.max(0,indexPage-1);list();};indexNext.onclick=()=>{indexPage++;list();};
$('#prev').onclick=()=>turn(-1);$('#next').onclick=()=>turn(1);
$('#prev-hymn').onclick=()=>moveHymn(-1);$('#next-hymn').onclick=()=>moveHymn(1);
$('#jump').onsubmit=e=>{e.preventDefault();viewMode='scan';$('#view-mode').value=viewMode;go($('#number').value);};
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{viewMode='scan';$('#view-mode').value=viewMode;go(b.dataset.page);});
$('#zoom').onclick=()=>{const zoomed=page.classList.toggle('zoom');$('#book-content').classList.toggle('zoom');$('#zoom').textContent=zoomed?'Fit page':'Zoom in';$('#zoom').setAttribute('aria-pressed',String(zoomed));};
document.addEventListener('keydown',e=>{
 if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)||e.ctrlKey||e.altKey||e.metaKey)return;
 if(e.key==='ArrowRight'){e.preventDefault();turn(1);}
 if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}
});
$('#book-content').addEventListener('touchstart',e=>{const t=e.changedTouches[0];touch={x:t.clientX,y:t.clientY};},{passive:true});
$('#book-content').addEventListener('touchend',e=>{
 if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;
 if(!page.classList.contains('zoom')&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)turn(dx<0?1:-1);
},{passive:true});
page.onerror=()=>$('#status').textContent='Page image could not load. Extract the whole ZIP and keep the pages folder beside index.html.';
$('#edit-title').onclick=()=>{
 const h=selectedHymn();if(!h)return;
 $('#edit-number').textContent=h.n;$('#edit-english').value=english(h);$('#edit-igbo').value=igbo(h);
 $('#editor').hidden=false;$('#edit-message').textContent='';$('#edit-igbo').focus();
};
$('#cancel-edit').onclick=()=>$('#editor').hidden=true;
$('#correction-form').onsubmit=e=>{
 e.preventDefault();const h=selectedHymn();if(!h)return;
 const en=$('#edit-english').value.trim(),ig=$('#edit-igbo').value.trim();if(!en||!ig)return;
 const next={...corrections,[h.n]:{english:en,igbo:ig}};
 try{localStorage.setItem('abu-corrections-v2',JSON.stringify(next));corrections=next;showHymn();renderSong();list();$('#save-message').textContent='Title correction saved on this device. Export corrections to keep a copy.';}
 catch{$('#edit-message').textContent='This browser could not save the correction. Allow local storage and try again.';}
};
$('#export-corrections').onclick=()=>{
 const blob=new Blob([JSON.stringify({book:'Abu Otuto',formatVersion:1,corrections},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Abu-Otuto-title-corrections.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('#reset-title').onclick=()=>{
 const h=selectedHymn();if(!h)return;const next={...corrections};delete next[h.n];
 try{localStorage.setItem('abu-corrections-v2',JSON.stringify(next));corrections=next;showHymn();renderSong();list();$('#save-message').textContent='Original index title restored on this device.';}
 catch{$('#edit-message').textContent='This browser could not save the change.';}
};
let favorites=[];try{const f=JSON.parse(localStorage.getItem('abu-favorites-v1')||'[]');if(Array.isArray(f))favorites=[...new Set(f.filter(n=>Number.isInteger(n)&&n>=1&&n<=294))];}catch{}
let categoryFilter=null,favoritesOnly=false;
function setHome(home){document.body.classList.toggle('home',home);$('#home').hidden=!home;}
function updateFavorite(){const h=selectedHymn();$('#favorite').disabled=!h;const saved=h&&favorites.includes(h.n);$('#favorite').textContent=saved?'Remove favorite':'Save favorite';$('#favorite').setAttribute('aria-pressed',String(!!saved));}
$('#favorite').onclick=()=>{const h=selectedHymn();if(!h)return;const next=favorites.includes(h.n)?favorites.filter(n=>n!==h.n):[...favorites,h.n];try{localStorage.setItem('abu-favorites-v1',JSON.stringify(next));favorites=next;updateFavorite();list();}catch{$('#save-message').textContent='Favorites could not be saved. Allow browser storage and try again.';}};
function filter(category,fav=false){categoryFilter=category;favoritesOnly=fav;indexPage=0;$('#search').value='';$('#filter-label').textContent=fav?'Favorites':category?category[2]:'';list();}
$('#home-button').onclick=()=>{setHome(true);filter(null);};
$('#open-book').onclick=()=>setHome(false);
$('#favorites-button').onclick=()=>{setHome(true);filter(null,true);};
$('#clear-filter').onclick=()=>filter(null);
$('#sort').onchange=()=>{indexPage=0;list();};
const categories=[[1,3,'Morning'],[4,10,'Evening'],[11,27,'Praise'],[28,33,'The character of God'],[34,40,'The Holy Spirit'],[41,44,'The Birth of Jesus'],[45,54,'The Suffering and Death of Jesus'],[55,55,'The Resurrection of Jesus'],[56,59,"Christ’s Kingdom"],[60,65,'The Church of God'],[66,69,'The Word of God'],[70,71,"The Lord’s Supper"],[72,73,'Baptism'],[74,76,'Harvest'],[77,86,'Sabbath'],[87,89,'Fellowship'],[90,93,'Prayer'],[94,98,'Penitence'],[99,112,'Consecration'],[113,127,'Christian life & Pilgrimage'],[128,138,'The Higher Life'],[139,149,'Faith'],[150,154,'Revival'],[155,168,'Service'],[169,181,'Zeal and Warfare'],[182,201,'The Gospel'],[202,205,'Watchfulness'],[206,213,'The Second Advent'],[214,217,'The Judgment'],[218,227,'Reward of the Righteous'],[228,242,'Children'],[243,295,'Miscellaneous']];
for(const c of categories){const b=textElement('button',c[2]+' · '+c[0]+'–'+c[1]);b.onclick=()=>filter(c);$('#categories').append(b);}
let resume={page:1,hymn:null};try{const saved=JSON.parse(localStorage.getItem('abu-page-v2')||'null');if(saved&&Number.isInteger(saved.page)&&saved.page>=1&&saved.page<=356&&(!saved.hymn||hymns.some(h=>h.n===saved.hymn&&h.p<=saved.page&&h.end>=saved.page)))resume=saved;}catch{}
go(resume.page,resume.hymn);

setHome(true);
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').hidden=false;});$('#install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#install').hidden=true;}};
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{$('#save-message').textContent='Offline support is unavailable in this browser.';});
