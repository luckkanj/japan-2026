/* ==== ภาพประกอบวาดเอง (SVG) — ใช้ร่วมกันทั้งหน้าเว็บและภาพ PNG ==== */
const C = {ink:'#1f2a44', sky:'#3d6a8f', red:'#c8452c', red2:'#e8603f', gold:'#d9a21b', gold2:'#f0c24a',
  green:'#5b7a4a', green2:'#7d9a5f', washi:'#f6f1e7', paper:'#fffdf8', stone:'#9aa0ad', water:'#8fb4cf', snow:'#ffffff', brown:'#8a5a3b'};
let _artN = 0;
function leaf(x,y,s,c,r){ // ใบเมเปิล 5 แฉก
  const pts=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5+(r||0); const d=i%2?s*.42:s; pts.push((x+Math.cos(a)*d).toFixed(1)+','+(y+Math.sin(a)*d).toFixed(1)); }
  return `<polygon points="${pts.join(' ')}" fill="${c}"/>`;
}
function fujiShape(x,y,w,col,snow=true){ // x = กึ่งกลาง, y = ฐาน
  const h=w*.42, t=w*.06;
  return `<path d="M${x-w/2} ${y} L${x-t} ${y-h} Q${x} ${y-h-3} ${x+t} ${y-h} L${x+w/2} ${y}Z" fill="${col}"/>`+
   (snow?`<path d="M${x-w*.17} ${y-h*.6} L${x-t} ${y-h} Q${x} ${y-h-3} ${x+t} ${y-h} L${x+w*.17} ${y-h*.6} L${x+w*.1} ${y-h*.66} L${x+w*.04} ${y-h*.56} L${x-w*.02} ${y-h*.68} L${x-w*.09} ${y-h*.57}Z" fill="${C.snow}"/>`:'');
}
function alps(y,col,snow){
  return `<path d="M0 ${y} L14 ${y-26} L22 ${y-18} L36 ${y-40} L46 ${y-28} L58 ${y-46} L70 ${y-30} L84 ${y-42} L96 ${y-24} L110 ${y-38} L124 ${y-22} L138 ${y-34} L160 ${y-16} V100 H0Z" fill="${col}"/>`+
   (snow?`<path d="M30 ${y-31} L36 ${y-40} L42 ${y-34} L39 ${y-32} L36 ${y-35}Z M52 ${y-36} L58 ${y-46} L64 ${y-38} L60 ${y-37} L57 ${y-40}Z M79 ${y-35} L84 ${y-42} L89 ${y-36}Z M105 ${y-32} L110 ${y-38} L115 ${y-32}Z" fill="${C.snow}"/>`:'');
}
function tree(x,y,s,c){ return `<path d="M${x} ${y-s*2.2} L${x+s} ${y} H${x-s}Z" fill="${c}"/>`; }
function round(x,y,r,c){ return `<rect x="${x-.8}" y="${y}" width="1.6" height="${r*1.2}" fill="${C.brown}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`; }
function hills(c1,c2){ return `<path d="M0 80 Q40 70 80 78 T160 74 V100 H0Z" fill="${c1}"/><path d="M0 88 Q50 80 100 88 T160 86 V100 H0Z" fill="${c2}"/>`; }
function water(y){ return `<rect x="0" y="${y}" width="160" height="${100-y}" fill="${C.water}"/><path d="M14 ${y+6} h18 M60 ${y+10} h26 M110 ${y+5} h20 M30 ${y+15} h22 M96 ${y+16} h16" stroke="#fff" stroke-width="1.2" opacity=".7" stroke-linecap="round"/>`; }
function sun(x,y,r,c){ return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c||C.red2}" opacity=".9"/>`; }

const ART = {
  plane(){ return sun(118,30,16,C.gold2)+
    `<path d="M10 70 q10 -10 22 -4 q8 -10 20 -2 q12 -2 14 8 H10Z M100 82 q8 -8 18 -3 q8 -8 18 0 q10 0 12 7 H100Z" fill="#fff"/>`+
    `<g transform="translate(78 48) rotate(-14)"><path d="M-34 0 Q-30 -5 -20 -5 H26 Q36 -4 38 0 Q36 4 26 5 H-20 Q-30 5 -34 0Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.4"/>`+
    `<path d="M-4 -4 L-18 -24 H-10 L10 -4Z M-4 4 L-18 24 H-10 L10 4Z M-28 -3 L-34 -14 H-29 L-20 -4Z" fill="${C.sky}"/><path d="M14 -2 h12" stroke="${C.sky}" stroke-width="2"/></g>`; },
  castle(){ return sun(126,26,13)+hills(C.green2,C.green)+
    `<path d="M44 84 L52 66 H108 L116 84Z" fill="${C.stone}"/><path d="M50 78 H110 M54 72 H106" stroke="#7d828f" stroke-width=".8"/>`+
    `<rect x="58" y="54" width="44" height="12" fill="${C.washi}"/><rect x="58" y="54" width="44" height="5" fill="${C.ink}"/>`+
    `<path d="M50 56 Q80 50 110 56 L104 51 H56Z" fill="${C.ink}"/>`+
    `<rect x="63" y="42" width="34" height="10" fill="${C.washi}"/><rect x="63" y="42" width="34" height="4" fill="${C.ink}"/>`+
    `<path d="M56 44 Q80 38 104 44 L98 39 H62Z" fill="${C.ink}"/>`+
    `<rect x="68" y="31" width="24" height="9" fill="${C.washi}"/><rect x="68" y="31" width="24" height="4" fill="${C.ink}"/>`+
    `<path d="M62 33 Q80 27 98 33 L92 28 H68Z" fill="${C.ink}"/><path d="M70 28 L80 19 L90 28Z" fill="${C.ink}"/>`+
    `<path d="M75 20 l-2 -3 M85 20 l2 -3" stroke="${C.gold}" stroke-width="1.5"/>`+
    `<rect x="0" y="86" width="160" height="14" fill="${C.water}"/>`+leaf(20,40,6,C.red)+leaf(140,50,5,C.gold)+leaf(30,60,4,C.red2); },
  street(){ let s=sun(130,22,10,C.gold2);
    [[8,40],[48,36],[92,42],[128,38]].forEach(([x,w],i)=>{ const top=44+(i%2)*4;
      s+=`<rect x="${x}" y="${top}" width="${w-4}" height="${84-top}" fill="${C.paper}"/>`+
        `<path d="M${x-3} ${top+1} L${x+(w-4)/2} ${top-10} L${x+w-1} ${top+1}Z" fill="${C.ink}"/>`+
        `<rect x="${x}" y="${top+20}" width="${w-4}" height="${64-20-(i%2)*4}" fill="#e6e1d6"/>`;
      for(let k=0;k<(w-4);k+=6) s+=`<path d="M${x+k} ${top+20} l6 6 M${x+k+6} ${top+20} l-6 6" stroke="${C.stone}" stroke-width=".7"/>`;
      s+=`<rect x="${x+(w-4)/2-5}" y="${top+8}" width="10" height="7" fill="${C.ink}"/>`; });
    return s+`<rect x="0" y="84" width="160" height="16" fill="#d9cdb4"/><circle cx="40" cy="58" r="3" fill="${C.red}"/><circle cx="118" cy="60" r="3" fill="${C.red}"/>`; },
  fuji(){ return sun(128,24,12)+fujiShape(80,76,130,C.sky)+water(76)+
    `<path d="M30 78 L80 98 L130 78" fill="none" stroke="#fff" opacity=".35" stroke-width="10"/>`; },
  pagoda(){ let s=sun(26,24,11)+fujiShape(104,74,110,C.sky)+hills(C.green2,C.green);
    for(let i=0;i<5;i++){ const y=74-i*10, w=26-i*3.4;
      s+=`<rect x="${52-w/2+4}" y="${y-6}" width="${w-8}" height="7" fill="${C.red}"/><path d="M${52-w/2-3} ${y-6} Q52 ${y-10} ${52+w/2+3} ${y-6} L${52+w/2-2} ${y-9} H${52-w/2+2}Z" fill="${C.ink}"/>`; }
    s+=`<path d="M52 24 V14" stroke="${C.gold}" stroke-width="1.6"/><rect x="38" y="74" width="28" height="6" fill="${C.stone}"/>`;
    [[18,64],[136,70],[126,58],[10,80]].forEach(([x,y],i)=>s+=leaf(x,y,6,i%2?C.gold:C.red,i));
    return s; },
  momiji(){ let s=fujiShape(80,70,90,C.sky)+water(70);
    for(let i=0;i<9;i++){ s+=round(8+i*4,30+i*3,12-i*.4,i%2?C.red:C.red2); s+=round(152-i*4,30+i*3,12-i*.4,i%2?C.gold:C.red); }
    for(let i=0;i<12;i++) s+=leaf(10+i*13,90-(i%3)*3,3.5,i%3?C.red:C.gold,i);
    return s; },
  village(){ let s=fujiShape(110,62,120,C.sky)+`<rect x="0" y="62" width="160" height="38" fill="${C.green2}"/>`;
    [[14,70],[60,74],[104,72]].forEach(([x,y])=>s+=`<path d="M${x} ${y} L${x+18} ${y-18} L${x+36} ${y}Z" fill="${C.brown}"/><rect x="${x+4}" y="${y}" width="28" height="12" fill="${C.paper}"/><rect x="${x+14}" y="${y+3}" width="8" height="9" fill="${C.ink}"/>`);
    return s+`<ellipse cx="80" cy="92" rx="40" ry="6" fill="${C.water}"/>`; },
  park(){ let s=sun(128,22,10,C.gold2)+`<rect x="0" y="70" width="160" height="30" fill="${C.green2}"/><path d="M60 100 Q78 82 80 70 Q82 82 100 100Z" fill="#e6dcc4"/>`;
    [[16,52,14,C.gold],[40,46,13,C.green],[120,48,14,C.red],[146,54,12,C.gold],[64,58,9,C.green]].forEach(([x,y,r,c])=>s+=round(x,y,r,c));
    return s+`<rect x="98" y="62" width="10" height="4" fill="${C.ink}"/><rect x="100" y="66" width="6" height="8" fill="${C.washi}" stroke="${C.ink}"/><rect x="99" y="74" width="8" height="10" fill="${C.stone}"/>`; },
  bridge(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#efe2cf"/>`;
    [[14,30,16,C.red],[36,22,14,C.gold],[128,26,16,C.red2],[150,34,12,C.gold]].forEach(([x,y,r,c])=>s+=round(x,y,r,c));
    s+=water(66)+`<path d="M18 66 Q80 26 142 66" fill="none" stroke="${C.red}" stroke-width="7"/><path d="M14 58 Q80 18 146 58" fill="none" stroke="${C.red}" stroke-width="2.5"/>`;
    for(let i=0;i<9;i++){ const t=i/8, x=18+124*t, y=66-160*t*(1-t), y2=58-160*t*(1-t); s+=`<path d="M${x} ${y} V${y2}" stroke="${C.red}" stroke-width="2"/>`; }
    return s+`<path d="M26 66 V100 M134 66 V100" stroke="${C.ink}" stroke-width="4"/>`; },
  pond(){ return `<rect x="0" y="0" width="160" height="100" fill="#e8eef2"/>`+alps(62,C.sky,true)+
    `<path d="M0 62 L18 46 L30 54 L44 40 L60 58 V62Z" fill="#7a6a5c"/>`+water(62)+
    `<path d="M28 62 V40 M30 50 l5 -4 M54 62 V44 M54 52 l-4 -3 M96 62 V36 M96 46 l5 -3 M120 62 V48" stroke="#8b8378" stroke-width="2"/>`+
    `<path d="M10 70 Q60 64 150 72" stroke="#fff" stroke-width="5" opacity=".5" fill="none"/>`; },
  mountain(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#e8eef2"/>`+alps(66,C.sky,true)+`<rect x="0" y="66" width="160" height="34" fill="${C.green}"/>`;
    for(let i=0;i<14;i++) s+=tree(6+i*11.5,70+(i%3)*3,4.5,i%3?C.gold:C.gold2);
    s+=`<path d="M0 86 Q80 80 160 88 V96 Q80 88 0 94Z" fill="${C.water}"/>`;
    return s+`<path d="M50 84 Q80 88 110 84" stroke="${C.brown}" stroke-width="2" fill="none"/><path d="M50 80 V84 M110 80 V84 M50 80 Q80 85 110 80" stroke="${C.brown}" stroke-width="1" fill="none"/>`; },
  shrine(){ let s=sun(130,22,11,C.gold2)+`<rect x="0" y="78" width="160" height="22" fill="#d9cdb4"/>`;
    s+=round(14,48,14,C.green)+round(146,46,15,C.green)+round(28,58,10,C.red);
    s+=`<rect x="44" y="52" width="72" height="28" fill="${C.paper}"/>`;
    for(let i=0;i<7;i++) s+=`<rect x="${46+i*11}" y="52" width="3" height="28" fill="${C.red}"/>`;
    s+=`<rect x="44" y="52" width="72" height="5" fill="${C.gold}"/><path d="M30 54 Q80 40 130 54 L120 44 Q80 34 40 44Z" fill="${C.ink}"/><path d="M50 44 Q80 22 110 44Z" fill="${C.ink}"/>`;
    return s+`<path d="M72 34 h16" stroke="${C.gold}" stroke-width="3"/><rect x="74" y="62" width="12" height="18" fill="${C.ink}"/><circle cx="80" cy="48" r="3" fill="${C.gold2}"/>`; },
  torii(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#e6efe0"/>`;
    for(let i=0;i<8;i++) s+=round(8+i*20,34+(i%2)*8,16,i%3?C.green:C.green2);
    s+=`<path d="M60 100 L72 80 H88 L100 100Z" fill="#d9cdb4"/>`;
    return s+`<path d="M44 30 Q80 22 116 30 L114 36 Q80 29 46 36Z" fill="${C.red}"/><rect x="50" y="42" width="60" height="5" fill="${C.red}"/>`+
      `<rect x="56" y="34" width="6" height="56" fill="${C.red}"/><rect x="98" y="34" width="6" height="56" fill="${C.red}"/><rect x="77" y="36" width="6" height="8" fill="${C.ink}"/>`+
      `<path d="M44 30 Q80 22 116 30" stroke="${C.ink}" stroke-width="2.5" fill="none"/>`; },
  temple(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#f3e6d3"/>`+sun(132,22,10);
    s+=`<rect x="0" y="84" width="160" height="16" fill="#d9cdb4"/><rect x="34" y="44" width="92" height="40" fill="${C.red}"/>`;
    s+=`<path d="M22 46 Q80 32 138 46 L128 36 Q80 26 32 36Z" fill="${C.ink}"/><rect x="54" y="50" width="52" height="34" fill="#7d2a1b"/>`;
    s+=`<ellipse cx="80" cy="62" rx="16" ry="14" fill="${C.red2}" stroke="${C.ink}" stroke-width="1.5"/><rect x="66" y="47" width="28" height="3" fill="${C.ink}"/><rect x="66" y="74" width="28" height="3" fill="${C.ink}"/>`;
    return s+`<text x="80" y="66" font-size="10" text-anchor="middle" fill="${C.ink}" font-weight="700">雷門</text>`; },
  tower(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#dfe7f0"/>`+sun(30,30,10,C.red2);
    [[0,70,20,30],[18,62,16,38],[100,66,22,34],[124,58,18,42],[142,72,18,28],[36,76,22,24]].forEach(([x,y,w,h])=>s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#a9b6c6"/>`);
    s+=`<path d="M72 100 L78 22 H82 L88 100Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.2"/><path d="M80 22 V4" stroke="${C.ink}" stroke-width="1.6"/>`;
    s+=`<rect x="74" y="34" width="12" height="5" rx="2" fill="${C.ink}"/><rect x="75" y="50" width="10" height="4" rx="2" fill="${C.ink}"/>`;
    for(let y=60;y<100;y+=8) s+=`<path d="M${74+(100-y)*.05} ${y} L${86-(100-y)*.05} ${y+8} M${86-(100-y)*.05} ${y} L${74+(100-y)*.05} ${y+8}" stroke="${C.sky}" stroke-width=".8"/>`;
    return s+`<rect x="0" y="92" width="160" height="8" fill="${C.water}"/>`; },
  city(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#f1dccb"/>`+sun(80,46,18,C.red2);
    [[0,40,22],[20,30,18],[38,48,16],[54,26,20],[96,34,18],[112,22,22],[134,44,26]].forEach(([x,y,w],i)=>{ s+=`<rect x="${x}" y="${y}" width="${w}" height="${70-y}" fill="${i%2?C.ink:'#34405e'}"/>`;
      for(let yy=y+5;yy<66;yy+=7) for(let xx=x+3;xx<x+w-3;xx+=5) s+=`<rect x="${xx}" y="${yy}" width="2" height="3" fill="${C.gold2}" opacity=".7"/>`; });
    s+=`<rect x="0" y="70" width="160" height="30" fill="#4a5470"/>`;
    for(let i=0;i<10;i++) s+=`<rect x="${10+i*14}" y="78" width="8" height="16" fill="#fff" opacity=".85" transform="skewX(-20)"/>`;
    return s; },
  market(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#f3e6d3"/><rect x="0" y="10" width="160" height="12" fill="${C.stone}"/><path d="M0 22 H160" stroke="${C.ink}" stroke-width="2"/>`;
    for(let i=0;i<8;i++) s+=`<path d="M${i*20+4} 22 V38" stroke="${C.ink}" stroke-width="2"/>`;
    [[4,C.red],[44,C.sky],[84,C.gold],[124,C.green]].forEach(([x,c])=>{ s+=`<path d="M${x} 46 H${x+34} L${x+30} 38 H${x+4}Z" fill="${c}"/>`;
      for(let k=0;k<4;k++) s+=`<rect x="${x+2+k*8}" y="46" width="4" height="5" fill="${c}"/>`;
      s+=`<rect x="${x+2}" y="54" width="30" height="30" fill="${C.paper}"/><rect x="${x}" y="70" width="34" height="14" fill="${C.brown}"/>`;
      for(let k=0;k<4;k++) s+=`<circle cx="${x+6+k*7}" cy="68" r="3" fill="${[C.red,C.gold,C.green,C.red2][k]}"/>`; });
    for(let i=0;i<5;i++) s+=`<ellipse cx="${20+i*30}" cy="32" rx="4" ry="5" fill="${C.red}"/>`;
    return s+`<rect x="0" y="84" width="160" height="16" fill="#d9cdb4"/>`; },
  jizo(){ let s=`<rect x="0" y="0" width="160" height="100" fill="#e3ead9"/>`+round(20,30,18,C.green)+round(140,26,20,C.red)+round(100,22,14,C.gold);
    s+=`<rect x="0" y="80" width="160" height="20" fill="#7a7f8a"/>`;
    for(let i=0;i<7;i++){ const x=14+i*21; s+=`<rect x="${x-6}" y="58" width="12" height="22" rx="5" fill="${C.stone}"/><circle cx="${x}" cy="54" r="6" fill="${C.stone}"/><path d="M${x-7} 52 Q${x} 42 ${x+7} 52Z" fill="${C.red}"/><path d="M${x-6} 62 L${x} 70 L${x+6} 62Z" fill="${C.red}"/>`; }
    return s; },
  falls(){ return `<rect x="0" y="0" width="160" height="100" fill="#e8eef2"/>`+round(18,30,16,C.red)+round(142,34,16,C.gold)+
    `<path d="M0 20 L60 16 L62 80 L0 84Z M160 18 L98 14 L96 80 L160 86Z" fill="#5b5f6b"/><path d="M62 16 H98 V70 H62Z" fill="#fff"/>`+
    `<path d="M68 18 V70 M76 18 V70 M84 18 V70 M92 18 V70" stroke="${C.water}" stroke-width="1.2" opacity=".7"/>`+water(72)+`<ellipse cx="80" cy="74" rx="30" ry="6" fill="#fff" opacity=".8"/>`; },
  train(){ return sun(128,24,10,C.gold2)+alps(70,'#a9b6c6',false)+`<rect x="0" y="70" width="160" height="30" fill="${C.green2}"/><path d="M0 86 H160 M0 90 H160" stroke="${C.ink}" stroke-width="1.5"/>`+
    `<path d="M10 84 V62 Q10 56 18 56 H128 Q146 56 150 72 L152 84Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.4"/><rect x="10" y="72" width="142" height="5" fill="#7b5aa6"/>`+
    [20,40,60,80,100,118].map(x=>`<rect x="${x}" y="60" width="14" height="8" rx="1" fill="${C.sky}"/>`).join('')+`<path d="M134 60 Q144 60 147 70 H134Z" fill="${C.ink}"/>`; },
};
function art(type, cls){
  const f = ART[type] || ART.fuji; _artN++;
  return `<svg class="${cls||'art'}" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><rect width="160" height="100" fill="${C.washi}"/>${f()}</svg>`;
}

