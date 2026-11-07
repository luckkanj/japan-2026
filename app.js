/* แอปทริปญี่ปุ่น — แผนรายวันแบบป้ายสถานี · ค่าใช้จ่ายหารสองคน · เอกสารจอง · แผนที่ */

/* ============ ตัวช่วย ============ */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GM = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
const GM_EMBED = q => 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
const fmtY = n => '¥' + Math.round(n).toLocaleString('en-US');
const fmtB = n => '฿' + Math.round(n).toLocaleString('en-US');
const DOW = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const DOWS = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
const dt = d => new Date(d + 'T00:00:00');
const dshort = d => DOWS[dt(d).getDay()] + ' ' + dt(d).getDate() + ' พ.ย.';
const todayStr = () => { const n = new Date(); return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'); };
function toast(t){ const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(()=>el.classList.remove('on'), 1800); }
const img = (key, alt, fallbackArt) => key
  ? `<img src="img/${key}.jpg" alt="${esc(alt)}" loading="lazy" onerror="this.outerHTML=art('${fallbackArt||'fuji'}')">`
  : art(fallbackArt || 'fuji');
const credit = key => { const c = CREDITS[key]; return c ? `ภาพ ${esc(c.artist)} / ${esc(c.lic)}` : ''; };

/* ============ สถานะค่าใช้จ่าย (เก็บในเครื่อง) ============ */
const KEY = 'jp2026-trip-v1';
const DEF = {nameA:'ลักขณา', nameB:'Pattaya', rate:0.22, budget:'', items:null};
function seedOne(b){
  const thb = b.thb != null;
  return {id:b.id, date:b.date, cat:b.cat, name:b.name, amt: thb ? b.thb : b.jpy, cur: thb ? 'THB' : 'JPY',
    status:b.status, payer:'A', for:b.for || 'both', note: (b.jpy == null && !thb) ? 'เอกสารไม่มีราคา ใส่ยอดเอง' : '', seed:true};
}
function load(){
  let s; try{ s = JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ s = {}; }
  s = Object.assign({}, DEF, s);
  if(s.nameB === 'คนที่ 2') s.nameB = 'Pattaya';
  if(!Array.isArray(s.items)){ s.items = BOOKINGS.map(seedOne); s.ver = 2; }
  if((s.ver || 1) < 2){ // รุ่น 2: ตั๋วเครื่องบินเหมาจ่าย 2 คน ฿30,000 หารครึ่ง
    s.items = s.items.filter(i => i.id !== 'b-flight2');
    const f = s.items.find(i => i.id === 'b-flight'); if(f) Object.assign(f, seedOne(BOOKINGS[0]));
    s.ver = 2;
  }
  s.addedSeeds = s.addedSeeds || BOOKINGS.map(b => b.id).filter(id => s.items.some(i => i.id === id));
  BOOKINGS.forEach(b => { if(!s.addedSeeds.includes(b.id)){ s.items.push(seedOne(b)); s.addedSeeds.push(b.id); } });
  return s;
}
let S = load();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast('บันทึกไม่ได้ — เบราว์เซอร์ปิดการเก็บข้อมูล'); } }
const toTHB = i => i.amt == null ? 0 : (i.cur === 'THB' ? +i.amt : +i.amt * S.rate);
const toJPY = i => i.amt == null ? 0 : (i.cur === 'JPY' ? +i.amt : +i.amt / S.rate);
const nm = p => p === 'A' ? S.nameA : S.nameB;

/* ============ แผนรายวัน ============ */
let cur = DAYS.some(d => d.date === todayStr()) ? todayStr() : DAYS[0].date;
const dayOf = d => DAYS.find(x => x.date === d);

function setLine(c){ document.documentElement.style.setProperty('--line', c); }

function renderBoard(d){
  const i = DAYS.indexOf(d);
  $('#board').innerHTML = `
    <div class="meta"><span class="badge">${dt(d.date).getDate()}</span>วันที่ ${i+1} จาก ${DAYS.length} · ${DOW[dt(d.date).getDay()]} ${dt(d.date).getDate()} พ.ย.</div>
    <h1 lang="ja">${esc(d.kanji)}</h1>
    <div class="th">${esc(d.th)}</div>
    <div class="ro">${esc(d.ro)}</div>
    <div class="rail"><span>← ${esc(d.prev)}</span><b>${esc(d.mode)}</b><span>${esc(d.next)} →</span></div>`;
}
function renderDays(){
  const t = todayStr();
  $('#days').innerHTML = DAYS.map(d => `<button data-d="${d.date}" style="--c:${d.color}" class="${d.date===cur?'on':''} ${d.date===t?'today':''}" aria-pressed="${d.date===cur}"><i>${dt(d.date).getDate()}</i>${esc(d.th)}</button>`).join('');
}
function docChip(id){
  const D = DOCS[id]; return D ? `<button class="tix" data-doc="${id}">🎫 ${esc(D.t)}</button>` : '';
}
function routeUrl(r, mode){
  const o = encodeURIComponent(r[0]), de = encodeURIComponent(r[r.length-1]);
  const w = r.slice(1,-1).map(encodeURIComponent).join('%7C');
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${de}${w?'&waypoints='+w:''}&travelmode=${mode||'driving'}`;
}
function renderDay(){
  const d = dayOf(cur); setLine(d.color); renderBoard(d); renderDays();
  const docs = Object.entries(DOCS).filter(([k,v]) => v.d.includes(d.date));
  const firstSpot = d.spots[0];
  const paidToday = S.items.filter(i => i.date === d.date && i.status === 'paid').reduce((a,i) => a + toTHB(i), 0);
  $('#day').innerHTML = `
    <figure class="photo">${img(d.hero, d.th, d.art)}${d.hero ? `<figcaption>${credit(d.hero)}</figcaption>` : ''}</figure>
    ${d.note ? `<div class="note">${esc(d.note)}</div>` : ''}
    <h2>เส้นทางวันนี้</h2>
    <ol class="stops">${d.tl.map(([t,b,s,o]) => `<li class="${o&&o.key?'key':''}"><span class="t">${t}</span><span class="dot"></span><div class="w"><b>${esc(b)}</b><small>${esc(s)}</small>${o&&o.doc?docChip(o.doc):''}</div></li>`).join('')}</ol>
    ${d.route ? `<a class="btn" style="margin-top:10px" href="${routeUrl(d.route)}" target="_blank" rel="noopener">เปิดเส้นทางขับรถวันนี้ใน Google Maps</a>` : ''}
    ${d.spots.length ? `<h2>ที่เที่ยว</h2><div class="cards">${d.spots.map(([n,s,q,k,a],i) => `
      <article class="card"><div class="pic">${img(k,n,a)}</div><div class="body"><b>${esc(n)}</b><small>${esc(s)}</small>
        <div class="acts"><button data-mapq="${esc(q)}" data-mapn="${esc(n)}">ดูบนแผนที่</button><a href="${GM(q)}" target="_blank" rel="noopener">เปิด Google Maps</a></div></div></article>`).join('')}</div>` : ''}
    ${firstSpot ? `<h2>แผนที่</h2><div class="map"><iframe id="gmap" loading="lazy" title="แผนที่ ${esc(firstSpot[0])}" src="${GM_EMBED(firstSpot[2])}"></iframe>
      <div class="cap" id="gcap">กำลังแสดง: ${esc(firstSpot[0])} · แตะ "ดูบนแผนที่" ที่การ์ดด้านบนเพื่อเปลี่ยนจุด</div>
      <a class="btn" id="gnav" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(firstSpot[2])}" target="_blank" rel="noopener">นำทางไป ${esc(firstSpot[0])}</a></div>` : ''}
    ${d.food.length ? `<h2>ของกิน</h2><div class="foods">${d.food.map(([n,s,q,k]) => `
      <a class="food" href="${GM(q)}" target="_blank" rel="noopener"><div class="pic">${k ? `<img src="img/${k}.jpg" alt="${esc(n)}" loading="lazy" onerror="this.outerHTML='🍜'">` : '🍜'}</div><div class="tx"><b>${esc(n)}</b><small>${esc(s)}</small></div></a>`).join('')}</div>` : ''}
    ${docs.length ? `<h2>เอกสารที่ต้องยื่นวันนี้</h2><div class="docs">${docs.map(([k,v]) => docTile(k)).join('')}</div>` : ''}
    <h2>ค่าใช้จ่ายวันนี้</h2>
    <div class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div class="small muted">จ่ายแล้ววันนี้</div><b style="font-size:20px">${fmtB(paidToday)}</b></div><button class="btn green" style="width:auto;padding:10px 16px" data-add="${d.date}">＋ จดค่าใช้จ่าย</button></div>
    <p class="small muted" style="margin:16px 2px">เวลาเปิดปิดและค่าเข้าเป็นค่าประมาณ ก่อนไปควรเช็กใน Google Maps อีกครั้ง</p>`;
}

/* ============ เอกสาร ============ */
function docTile(k){
  const v = DOCS[k], p = DOC_PAGES[k] || [];
  return `<button class="doc" data-doc="${k}"><div class="thumb">${p[0] ? `<img src="${p[0]}" alt="" loading="lazy">` : '🎫'}</div><span>${esc(v.t)}<small>${v.d.map(dshort).join(', ')} · ${p.length} หน้า</small></span></button>`;
}
function renderDocs(){
  const groups = {};
  Object.keys(DOCS).forEach(k => { const d0 = DOCS[k].d[0]; (groups[d0] = groups[d0] || []).push(k); });
  $('#docsBody').innerHTML = `<p class="small muted" style="margin:0 2px 8px">แตะเพื่อเปิดเต็มจอ แล้วยื่นให้เจ้าหน้าที่ได้เลย · กด "บันทึกภาพ" เก็บลงอัลบั้มไว้ใช้ตอนไม่มีเน็ต</p>`
    + Object.keys(groups).sort().map(d => `<div class="dgroup">${dshort(d)}</div><div class="docs">${groups[d].map(docTile).join('')}</div>`).join('');
}
function openDoc(k){
  const v = DOCS[k], b = BOOKINGS.find(x => x.id === v.b), p = DOC_PAGES[k] || [];
  $('#vTitle').textContent = v.t;
  $('#vRef').textContent = REFS[k] || '';
  $('#vUse').textContent = b ? b.use : '';
  $('#vPages').innerHTML = p.map((src,i) => `<img src="${src}" alt="${esc(v.t)} หน้า ${i+1}">`).join('');
  const sv = $('#vSave'); sv.href = p[0] || '#'; sv.setAttribute('download', (p[0]||'').split('/').pop());
  $('#viewer').classList.add('on'); document.body.style.overflow = 'hidden'; $('#vClose').focus();
}
function closeDoc(){ $('#viewer').classList.remove('on'); document.body.style.overflow = ''; }
$('#vClose').onclick = closeDoc;
document.addEventListener('keydown', e => { if(e.key === 'Escape' && $('#viewer').classList.contains('on')) closeDoc(); });

/* ============ แผนที่เส้นทาง ============ */
const PLACES = {
  haneda:{n:'ฮาเนดะ',lon:139.78,lat:35.55}, tokyo:{n:'โตเกียว',lon:139.77,lat:35.71},
  matsumoto:{n:'มัตสึโมโตะ',lon:137.97,lat:36.23}, kamikochi:{n:'คามิโคจิ',lon:137.64,lat:36.25},
  fujicity:{n:'เมืองฟูจิ',lon:138.68,lat:35.16}, kawaguchiko:{n:'คาวากุจิโกะ',lon:138.76,lat:35.50}, nikko:{n:'นิกโก้',lon:139.60,lat:36.75},
};
const LEGS = [['2026-11-08','tokyo','matsumoto','train'],['2026-11-09','matsumoto','kamikochi','car'],['2026-11-09','kamikochi','fujicity','car'],
  ['2026-11-10','fujicity','kawaguchiko','car'],['2026-11-10','kawaguchiko','tokyo','bus'],['2026-11-11','tokyo','nikko','train']];
function routeSvg(){
  const W=360,H=280,L0=137.25,L1=140.25,A0=37.05,A1=34.75;
  const X = lon => (lon-L0)/(L1-L0)*W, Y = lat => (A0-lat)/(A0-A1)*H;
  const coast=[[137.25,34.7],[138.2,34.62],[138.35,34.9],[138.55,35.05],[138.72,35.13],[138.9,35.06],[138.85,34.72],[139.1,34.72],[139.1,35.0],[139.15,35.15],[139.45,35.3],[139.62,35.16],[139.66,35.3],[139.75,35.47],[139.82,35.62],[139.98,35.66],[140.05,35.45],[139.86,35.18],[139.85,34.72],[140.3,34.72],[140.3,34.6],[137.25,34.6]];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="แผนที่เส้นทางทริป"><rect width="${W}" height="${H}" fill="#f4f5f7"/>`
    + `<path d="M${coast.map(([a,b]) => X(a).toFixed(1)+' '+Y(b).toFixed(1)).join(' L')}Z" fill="#d4e2ee"/>`;
  [[137.68,36.45],[137.6,36.1],[137.75,35.8],[138.05,35.72]].forEach(([a,b]) => s += `<path d="M${X(a)-9} ${Y(b)+5} L${X(a)} ${Y(b)-8} L${X(a)+9} ${Y(b)+5}Z" fill="#c3ccd6"/><path d="M${X(a)-3} ${Y(b)-3} L${X(a)} ${Y(b)-8} L${X(a)+3} ${Y(b)-3}Z" fill="#fff"/>`);
  const fx=X(138.73), fy=Y(35.36);
  s += `<g transform="translate(${fx} ${fy})"><path d="M-16 8 L-3 -10 Q0 -12 3 -10 L16 8Z" fill="#2b5fa8" opacity=".8"/><path d="M-6 -4 L-3 -10 Q0 -12 3 -10 L6 -4 L3 -6 L0 -3 L-3 -6Z" fill="#fff"/></g>`;
  LEGS.forEach(([d,a,b,t]) => { const c = dayOf(d).color, p=PLACES[a], q=PLACES[b];
    const x1=X(p.lon),y1=Y(p.lat),x2=X(q.lon),y2=Y(q.lat), mx=(x1+x2)/2+(y2-y1)*.18, my=(y1+y2)/2-(x2-x1)*.18;
    const dash = t==='train' ? 'stroke-dasharray="7 4"' : t==='bus' ? 'stroke-dasharray="1 5" stroke-linecap="round"' : '';
    s += `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${t==='bus'?4:3.5}" ${dash}/>`;
    const lx=(x1+x2)/4+mx/2, ly=(y1+y2)/4+my/2;
    s += `<circle cx="${lx}" cy="${ly}" r="9" fill="#fff" stroke="${c}" stroke-width="3"/><text x="${lx}" y="${ly+3.5}" font-size="10" font-weight="900" text-anchor="middle" fill="#1b1e24">${dt(d).getDate()}</text>`; });
  s += `<path d="M${X(139.78)} ${Y(35.55)} L${X(140.2)} ${Y(34.85)}" stroke="#7d8594" stroke-width="2" stroke-dasharray="2 4"/><text x="${X(140.06)}" y="${Y(34.93)}" font-size="13">✈</text>`;
  const lab={tokyo:[8,-4,'start'],haneda:[8,12,'start'],matsumoto:[8,-8,'start'],kamikochi:[-8,16,'end'],fujicity:[-8,13,'end'],kawaguchiko:[9,4,'start'],nikko:[0,-11,'middle']};
  Object.entries(PLACES).forEach(([k,p]) => { const [dx,dy,an] = lab[k];
    s += `<circle cx="${X(p.lon)}" cy="${Y(p.lat)}" r="5" fill="#fff" stroke="#1b1e24" stroke-width="2.5"/><text x="${X(p.lon)+dx}" y="${Y(p.lat)+dy}" font-size="11" font-weight="700" text-anchor="${an}" fill="#1b1e24" paint-order="stroke" stroke="#f4f5f7" stroke-width="3">${p.n}</text>`; });
  s += `<g font-size="9" fill="#1b1e24" transform="translate(10 ${H-40})"><rect x="-4" y="-10" width="150" height="40" rx="5" fill="#fff"/>`
    + `<path d="M0 0 h20" stroke="#1b1e24" stroke-width="3" stroke-dasharray="7 4"/><text x="26" y="3">รถไฟ</text>`
    + `<path d="M60 0 h20" stroke="#1b1e24" stroke-width="3"/><text x="86" y="3">ขับรถ</text>`
    + `<path d="M0 18 h20" stroke="#1b1e24" stroke-width="4" stroke-dasharray="1 5" stroke-linecap="round"/><text x="26" y="21">รถบัส</text><text x="60" y="21">ตัวเลขในวง = วันที่</text></g>`;
  return s + '</svg>';
}
function renderMap(){
  $('#routemap').innerHTML = routeSvg();
  $('#mapList').innerHTML = DAYS.filter(d => d.spots.length).map(d => `
    <h2 style="--line:${d.color}">${dshort(d.date)} · ${esc(d.th)}</h2>
    <div class="panel"><ul class="plist">${d.spots.concat(d.food).map(([n,s,q]) => `<li><span>${esc(n)}</span><a href="${GM(q)}" target="_blank" rel="noopener">Google Maps</a></li>`).join('')}</ul>
    ${d.route ? `<a class="btn" style="margin-top:8px;background:${d.color}" href="${routeUrl(d.route)}" target="_blank" rel="noopener">เส้นทางขับรถวันนี้</a>` : ''}</div>`).join('');
  $('#credits').innerHTML = 'ภาพสถานที่และอาหารจาก Wikimedia Commons ใช้ตามสัญญาอนุญาตของเจ้าของภาพ: ' +
    Object.entries(CREDITS).map(([k,c]) => `<a href="${c.page}" target="_blank" rel="noopener">${esc(k)}</a> ${esc(c.artist)} (${esc(c.lic)})`).join(' · ');
}

/* ============ ค่าใช้จ่าย ============ */
let filt = 'all';
function calc(){
  const paid = S.items.filter(i => i.status === 'paid' && i.amt != null), plan = S.items.filter(i => i.status === 'plan');
  let shareA=0, shareB=0, paidA=0, paidB=0;
  paid.forEach(i => { const v = toTHB(i);
    if(i.payer === 'A') paidA += v; else paidB += v;
    if(i.for === 'both'){ shareA += v/2; shareB += v/2; } else if(i.for === 'A') shareA += v; else shareB += v; });
  return {paid, plan, total: paid.reduce((a,i)=>a+toTHB(i),0), totalY: paid.reduce((a,i)=>a+toJPY(i),0),
    planT: plan.reduce((a,i)=>a+toTHB(i),0), shareA, shareB, paidA, paidB, bal: paidA - shareA};
}
function renderMoney(){
  const c = calc(), bud = +S.budget || 0, b = Math.round(c.bal);
  const settle = Math.abs(b) < 1 ? 'เคลียร์กันแล้ว ไม่มีใครค้างใคร' : b > 0 ? `${esc(S.nameB)} โอนให้ ${esc(S.nameA)}` : `${esc(S.nameA)} โอนให้ ${esc(S.nameB)}`;
  $('#ic').innerHTML = `<div class="l">จ่ายไปแล้วทั้งทริป</div><div class="v">${fmtB(c.total)}</div><div class="y">${fmtY(c.totalY)} · เรต ${S.rate} บาทต่อเยน</div>
    ${bud ? `<div class="bar"><i style="width:${Math.min(100,c.total/bud*100)}%"></i></div><div class="y" style="margin-top:4px">ใช้ไป ${Math.round(c.total/bud*100)}% ของงบ ${fmtB(bud)}</div>` : ''}
    <div class="row"><span>${settle}</span><b>${Math.abs(b) < 1 ? '' : fmtB(Math.abs(b))}</b></div>`;
  $('#split').innerHTML = `<div class="panel"><div class="small muted">ส่วนของ ${esc(S.nameA)}</div><div class="v">${fmtB(c.shareA)}</div><div class="small muted">ออกเงินไป ${fmtB(c.paidA)}</div></div>
    <div class="panel"><div class="small muted">ส่วนของ ${esc(S.nameB)}</div><div class="v">${fmtB(c.shareB)}</div><div class="small muted">ออกเงินไป ${fmtB(c.paidB)}</div></div>
    <div class="panel full"><div class="small muted">ยังไม่จ่าย</div><div class="v" style="color:var(--warn)">${fmtB(c.planT)}</div><div class="small muted">${c.plan.length} รายการ · ยอดโอนด้านบนคิดเฉพาะที่จ่ายแล้ว</div></div>`;
  const by = {}; c.paid.forEach(i => by[i.cat] = (by[i.cat]||0) + toTHB(i)); const mx = Math.max(1, ...Object.values(by));
  $('#cats').innerHTML = Object.keys(CATS).filter(k => by[k]).sort((a,b) => by[b]-by[a]).map(k =>
    `<div class="row"><span>${CATS[k].i} ${CATS[k].l}</span><div class="bar"><i style="width:${by[k]/mx*100}%"></i></div><span class="n">${fmtB(by[k])}</span></div>`).join('') || '<span class="muted">ยังไม่มีรายการ</span>';
  $('#chips').innerHTML = [['all','ทั้งหมด'],['plan','ยังไม่จ่าย'],...DAYS.map(d => [d.date, dshort(d.date)])].map(([v,l]) => `<button data-f="${v}" class="${filt===v?'on':''}">${l}</button>`).join('');
  let list = S.items.slice();
  if(filt === 'plan') list = list.filter(i => i.status === 'plan'); else if(filt !== 'all') list = list.filter(i => i.date === filt);
  list.sort((a,b) => a.date.localeCompare(b.date) || (a.ts||0) - (b.ts||0));
  let h = '', last = '';
  list.forEach(i => {
    if(i.date !== last){ last = i.date; const sum = S.items.filter(x => x.date === i.date && x.status === 'paid').reduce((a,x) => a + toTHB(x), 0);
      h += `<li class="grp"><span>${dshort(i.date)}</span><span>${fmtB(sum)}</span></li>`; }
    h += `<li class="${i.status==='plan'?'plan':''}" data-id="${esc(i.id)}"><div class="ic2">${CATS[i.cat]?.i || '🧾'}</div>
      <div><div class="nm">${esc(i.name)}</div><div class="sub">${esc(nm(i.payer))} จ่าย · ${i.for==='both'?'หารครึ่ง':'ของ '+esc(nm(i.for))}${i.status==='plan'?' · ยังไม่จ่าย':''}${i.note?' · '+esc(i.note):''}</div></div>
      <div class="amt">${i.amt==null ? '<span class="muted">ใส่ราคา</span>' : (i.cur==='JPY' ? fmtY(i.amt) : fmtB(i.amt))}${i.amt!=null && i.cur==='JPY' ? `<small>${fmtB(toTHB(i))}</small>` : ''}</div></li>`;
  });
  $('#exp').innerHTML = h || '<li class="grp">ยังไม่มีรายการ</li>';
  $('#sA').value = S.nameA; $('#sB').value = S.nameB; $('#sRate').value = S.rate; $('#sBud').value = S.budget;
}

/* ============ ฟอร์มจดค่าใช้จ่าย ============ */
let editId = null, F = {};
function seg(id, key){
  const el = $(id); el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === F[key]));
  el.onclick = e => { const b = e.target.closest('button'); if(!b) return; F[key] = b.dataset.v; seg(id, key); hint(); };
}
function hint(){ const v = +$('#eAmt').value;
  $('#eHint').textContent = v ? (F.cur==='JPY' ? '≈ '+fmtB(v*S.rate) : '≈ '+fmtY(v/S.rate)) + (F.for==='both' ? ' · คนละ '+(F.cur==='JPY'?fmtY(v/2):fmtB(v/2)) : '') : ''; }
function openForm(it, title){
  F = {cur:it.cur||'JPY', status:it.status||'paid', payer:it.payer||'A', for:it.for||'both', cat:it.cat||'food'};
  $('#dTitle').textContent = title; $('#eDel').style.display = editId ? '' : 'none';
  $('#eName').value = it.name || ''; $('#eAmt').value = it.amt ?? ''; $('#eNote').value = it.note || '';
  $('#eDate').innerHTML = DAYS.map(d => `<option value="${d.date}">${dshort(d.date)}</option>`).join(''); $('#eDate').value = it.date;
  $('#ePayer').innerHTML = `<button type="button" data-v="A">${esc(S.nameA)}</button><button type="button" data-v="B">${esc(S.nameB)}</button>`;
  $('#eFor').innerHTML = `<button type="button" data-v="both">หารครึ่ง</button><button type="button" data-v="A">${esc(S.nameA)}</button><button type="button" data-v="B">${esc(S.nameB)}</button>`;
  $('#eCat').innerHTML = Object.entries(CATS).map(([k,c]) => `<button type="button" data-v="${k}"><span>${c.i}</span>${c.l}</button>`).join('');
  seg('#eCur','cur'); seg('#eStat','status'); seg('#ePayer','payer'); seg('#eFor','for'); seg('#eCat','cat'); hint();
  $('#dlg').showModal();
}
function openAdd(date){ editId = null; openForm({date: date || (DAYS.some(d => d.date === todayStr()) ? todayStr() : cur)}, 'จดค่าใช้จ่าย'); setTimeout(() => $('#eName').focus(), 50); }
function openEdit(id){ const it = S.items.find(x => x.id === id); if(!it) return; editId = id; openForm(it, 'แก้ไขรายการ'); }
$('#eAmt').addEventListener('input', hint);
$('#fExp').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#eName').value.trim(); if(!name){ $('#eName').focus(); return; }
  const raw = $('#eAmt').value.trim();
  const it = {name, amt: raw === '' ? null : +raw, cur:F.cur, status:F.status, payer:F.payer, for:F.for, cat:F.cat, date:$('#eDate').value, note:$('#eNote').value.trim()};
  if(editId){ Object.assign(S.items.find(x => x.id === editId), it); toast('แก้ไขแล้ว'); }
  else { it.id = 'x' + Date.now().toString(36); it.ts = Date.now(); S.items.push(it); toast('จดแล้ว'); }
  save(); $('#dlg').close(); renderAll();
});
$('#eCancel').onclick = () => $('#dlg').close();
$('#eDel').onclick = () => { if(!confirm('ลบรายการนี้?')) return; S.items = S.items.filter(x => x.id !== editId); save(); $('#dlg').close(); renderAll(); toast('ลบแล้ว'); };

/* ============ ตั้งค่า / สำรอง ============ */
$('#sSave').onclick = () => { const r = +$('#sRate').value; if(!(r > 0)){ toast('เรตต้องมากกว่า 0'); return; }
  S.nameA = $('#sA').value.trim() || 'ลักขณา'; S.nameB = $('#sB').value.trim() || 'Pattaya'; S.rate = r; S.budget = $('#sBud').value; save(); renderAll(); toast('บันทึกแล้ว'); };
function download(name, text, type){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
$('#bCsv').onclick = () => { const q = v => '"' + String(v ?? '').replace(/"/g,'""') + '"';
  const rows = [['วันที่','หมวด','รายการ','จำนวน','สกุล','เป็นบาท','สถานะ','ใครจ่าย','ของใคร','หมายเหตุ']];
  S.items.slice().sort((a,b) => a.date.localeCompare(b.date)).forEach(i => rows.push([i.date, CATS[i.cat]?.l, i.name, i.amt ?? '', i.cur, i.amt==null?'':toTHB(i).toFixed(2), i.status==='paid'?'จ่ายแล้ว':'ยังไม่จ่าย', nm(i.payer), i.for==='both'?'หารครึ่ง':nm(i.for), i.note]));
  download('ค่าใช้จ่ายทริปญี่ปุ่น-' + todayStr() + '.csv', '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8'); };
$('#bJson').onclick = () => download('สำรองทริปญี่ปุ่น-' + todayStr() + '.json', JSON.stringify(S, null, 1), 'application/json');
$('#bImp').onclick = () => $('#fImp').click();
$('#fImp').onchange = e => { const f = e.target.files[0]; if(!f) return;
  f.text().then(t => { const o = JSON.parse(t); if(!Array.isArray(o.items)) throw 0;
    // รวมรายการ: ของที่ id ซ้ำใช้ของไฟล์ ของใหม่เพิ่มเข้าไป
    const byId = new Map(S.items.map(i => [i.id, i])); o.items.forEach(i => byId.set(i.id, i));
    S.items = [...byId.values()]; save(); renderAll(); toast('นำเข้าแล้ว ' + o.items.length + ' รายการ'); })
   .catch(() => toast('ไฟล์นี้ไม่ใช่ไฟล์สำรองของแอปนี้')); e.target.value = ''; };
$('#bReset').onclick = () => { if(!confirm('ลบรายการที่จดเองทั้งหมด แล้วเริ่มใหม่จากรายการจอง?')) return;
  S = Object.assign({}, DEF, {nameA:S.nameA, nameB:S.nameB, rate:S.rate, budget:S.budget, items:BOOKINGS.map(seedOne), ver:2, addedSeeds:BOOKINGS.map(b=>b.id)}); save(); renderAll(); toast('เริ่มใหม่แล้ว'); };

/* ============ เชื่อมทุกอย่าง ============ */
function renderAll(){ renderDay(); renderMoney(); renderDocs(); }
document.addEventListener('click', e => {
  const t = e.target.closest('[data-d],[data-doc],[data-mapq],[data-add],[data-f],#exp li[data-id]'); if(!t) return;
  if(t.dataset.d){ cur = t.dataset.d; renderDay(); window.scrollTo({top:0}); }
  else if(t.dataset.doc) openDoc(t.dataset.doc);
  else if(t.dataset.mapq){ const fr = $('#gmap'); if(!fr) return; fr.src = GM_EMBED(t.dataset.mapq);
    $('#gcap').textContent = 'กำลังแสดง: ' + t.dataset.mapn; const nav = $('#gnav'); nav.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(t.dataset.mapq); nav.textContent = 'นำทางไป ' + t.dataset.mapn;
    fr.closest('.map').scrollIntoView({behavior:'smooth', block:'center'}); }
  else if(t.dataset.add) openAdd(t.dataset.add);
  else if(t.dataset.f){ filt = t.dataset.f; renderMoney(); }
  else if(t.dataset.id) openEdit(t.dataset.id);
});
$('#fab').onclick = () => openAdd();
document.querySelectorAll('nav.tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav.tabs button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('on', p.id === 'pg-' + b.dataset.pg));
  document.body.classList.toggle('money', b.dataset.pg === 'money');
  if(b.dataset.pg === 'map') renderMap();
  if(b.dataset.pg === 'plan') setLine(dayOf(cur).color); else setLine('#2b5fa8');
  window.scrollTo(0, 0);
});
save(); renderAll();
const onDay = document.querySelector('#days button.on'); if(onDay) onDay.scrollIntoView({inline:'center', block:'nearest'});
