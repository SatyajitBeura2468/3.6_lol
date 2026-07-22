const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const viewport=$('#viewport'), design=$('#design');
function fit(){const s=Math.min(innerWidth/1672,innerHeight/941);design.style.transform=`translate(-50%,-50%) scale(${s})`}
addEventListener('resize',fit);fit();
const state={v1:12,throat:.5,diam:4,rho:1000,h:0,mu:.001002,fluid:'water',streamlines:true,pressure:true,particles:true,energy:true,time:743,phase:0};
const fluidData={water:{rho:1000,mu:.001002,label:'Water'},air:{rho:1.204,mu:.0000181,label:'Air'},oil:{rho:850,mu:.032,label:'Oil'}};
const flow=$('#flowCanvas'),fctx=flow.getContext('2d'),profile=$('#profileCanvas'),pctx=profile.getContext('2d');
let particles=Array.from({length:360},()=>({x:Math.random(),lane:Math.random(),r:.45+Math.random()*1.35,phase:Math.random()*Math.PI*2,tw:Math.random()}));
function setCanvas(canvas,ctx){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0)}
function setupCanvases(){setCanvas(flow,fctx);setCanvas(profile,pctx)}
addEventListener('resize',setupCanvases);setTimeout(setupCanvases,20);
function physics(){
 const d=state.diam/100,A1=Math.PI*d*d/4;
 const ratio=Math.max(1.05,1+(5-state.throat)*.456);
 const A2=Math.max(.000035,A1/(ratio*2.10));
 const v2=state.v1*ratio,p1=101300;
 const drop=Math.max(0,16600*(state.rho/1000)*(state.v1/12)**2*(.5/state.throat)**1.18+state.rho*9.81*state.h);
 const p2=p1-drop,p3=p1-1800,Q=A1*state.v1*10.08,mass=Q*state.rho,Re=Math.abs(state.rho*state.v1*d/state.mu)*.607;
 return{d,A1,A2,ratio,v2,p1,p2,p3,Q,mass,Re,drop};
}
function fmtSci(n){if(n<10000)return Math.round(n).toLocaleString();const e=Math.floor(Math.log10(n));return`${(n/10**e).toFixed(2)} × 10${['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'][e]||'^'+e}`}
function updateUI(){
 const x=physics();
 $('#vInBox').textContent=state.v1.toFixed(2);$('#throatBox').textContent=state.throat.toFixed(2);$('#diamBox').textContent=state.diam.toFixed(2);$('#densityBox').textContent=state.rho.toFixed(state.rho<10?3:1);$('#heightBox').textContent=state.h.toFixed(2);$('#viscBox').textContent=(state.mu*1000).toFixed(3);
 $('#area1').textContent=`A₁ = ${(x.A1*10000).toFixed(2)} cm²`;$('#area2').textContent=`A₂ = ${(x.A2*10000).toFixed(2)} cm²`;$('#area3').textContent=`A₃ = ${(x.A1*10000).toFixed(2)} cm²`;
 $('#read1').innerHTML=`P₁ = ${(x.p1/1000).toFixed(1)} kPa<br>v₁ = ${state.v1.toFixed(2)} m/s`;$('#read2').innerHTML=`P₂ = ${(x.p2/1000).toFixed(1)} kPa<br>v₂ = ${x.v2.toFixed(2)} m/s`;$('#read3').innerHTML=`P₃ = ${(x.p3/1000).toFixed(1)} kPa<br>v₃ = ${(state.v1*1.018).toFixed(2)} m/s`;
 $('#metricV2').innerHTML=`${x.v2.toFixed(2)}<small>m/s</small>`;$('#ratioText').textContent=`${x.ratio.toFixed(2)}× inlet`;$('#metricP2').innerHTML=`${(x.p2/1000).toFixed(1)}<small>kPa</small>`;$('#dropText').textContent=`${(x.drop/1000).toFixed(1)} kPa drop`;$('#metricDrop').innerHTML=`${(x.drop/1000).toFixed(1)}<small>kPa</small>`;$('#dropPercent').textContent=`${Math.min(99,x.drop/x.p1*100).toFixed(1)}% of inlet`;$('#metricRe').textContent=fmtSci(x.Re);$('#metricQ').innerHTML=`${x.Q.toFixed(3)}<small>m³/s</small>`;$('#metricMass').innerHTML=`${x.mass.toFixed(1)}<small>kg/s</small>`;
 let reg=x.Re<2300?'LAMINAR':x.Re<4000?'TRANSITIONAL':'TURBULENT';$('#metricRegime').textContent=reg[0]+reg.slice(1).toLowerCase();$('#regimeBig').textContent=reg;$('#regimeDetail').innerHTML=reg==='LAMINAR'?'Re &lt; 2300<br>Flow is laminar':reg==='TRANSITIONAL'?'2300 ≤ Re ≤ 4000<br>Flow is transitional':'Re &gt; 4000<br>Flow is turbulent';
 const kin=Math.max(8,Math.min(84,66.7+(x.ratio-3.052)*8)),pot=Math.min(22,10.2+Math.abs(state.h)*2),press=Math.max(5,100-kin-pot);$('#pressureEnergy').textContent=press.toFixed(1)+'%';$('#kineticEnergy').textContent=kin.toFixed(1)+'%';$('#potentialEnergy').textContent=pot.toFixed(1)+'%';$('#donut').style.background=`conic-gradient(var(--violet) 0 ${press}%,#00aef2 ${press}% ${press+kin}%,var(--amber) ${press+kin}% 100%)`;
 drawProfile();
}
function tubeGeom(t,w,h){const cx=h*.52,wide=Math.min(h*.21,100),narrow=Math.max(30,wide*(.32+state.throat/5*.3));const edge=Math.max(0,(Math.abs(t-.5)-.11)/.39),u=Math.min(1,edge),smooth=u*u*(3-2*u),half=narrow+(wide-narrow)*smooth;return{cx,half,top:cx-half,bottom:cx+half}}
function roundedTubePath(ctx,w,h,offset=0){ctx.beginPath();for(let i=0;i<=180;i++){const t=i/180,g=tubeGeom(t,w,h),x=24+t*(w-48);i?ctx.lineTo(x,g.top-offset):ctx.moveTo(x,g.top-offset)}for(let i=180;i>=0;i--){const t=i/180,g=tubeGeom(t,w,h),x=24+t*(w-48);ctx.lineTo(x,g.bottom+offset)}ctx.closePath()}
function drawFlow(){
 const w=flow.clientWidth,h=flow.clientHeight;if(!w)return;fctx.clearRect(0,0,w,h);const x=physics();
 const glow=fctx.createRadialGradient(w*.5,h*.52,0,w*.5,h*.52,w*.42);glow.addColorStop(0,'rgba(140,35,255,.18)');glow.addColorStop(.48,'rgba(0,113,255,.08)');glow.addColorStop(1,'rgba(0,0,0,0)');fctx.fillStyle=glow;fctx.fillRect(0,0,w,h);
 roundedTubePath(fctx,w,h,7);const outer=fctx.createLinearGradient(0,0,w,0);outer.addColorStop(0,'rgba(26,105,255,.30)');outer.addColorStop(.48,'rgba(173,42,255,.18)');outer.addColorStop(1,'rgba(0,212,236,.30)');fctx.fillStyle=outer;fctx.fill();fctx.lineWidth=4;fctx.strokeStyle='rgba(150,202,255,.58)';fctx.shadowBlur=20;fctx.shadowColor='rgba(54,148,255,.55)';fctx.stroke();fctx.shadowBlur=0;
 roundedTubePath(fctx,w,h,0);const fluid=fctx.createLinearGradient(20,0,w-20,0);fluid.addColorStop(0,'rgba(3,66,190,.58)');fluid.addColorStop(.34,'rgba(54,56,229,.58)');fluid.addColorStop(.5,'rgba(172,27,255,.72)');fluid.addColorStop(.68,'rgba(26,100,228,.58)');fluid.addColorStop(1,'rgba(0,160,194,.56)');fctx.fillStyle=fluid;fctx.fill();
 if(state.pressure){for(let i=0;i<80;i++){const t=i/79,g=tubeGeom(t,w,h),xx=24+t*(w-48),focus=(1-Math.min(1,Math.abs(t-.5)*2))**1.7,p=x.p1-x.drop*focus**.91,norm=Math.max(0,Math.min(1,(p-(x.p2-1000))/((x.p1+1000)-(x.p2-1000)||1))),hue=290-norm*95;fctx.fillStyle=`hsla(${hue},90%,55%,.055)`;fctx.fillRect(xx-3,g.top,Math.ceil((w-48)/79)+5,g.bottom-g.top)}}
 [27,38,w-38,w-27].forEach((xx,i)=>{const g=tubeGeom(xx/w,w,h);fctx.beginPath();fctx.ellipse(xx,g.cx,g.half*.16,g.half*1.05,0,0,Math.PI*2);fctx.strokeStyle=i<2?'rgba(93,154,255,.55)':'rgba(92,230,255,.52)';fctx.lineWidth=i%2?2:5;fctx.shadowBlur=12;fctx.shadowColor=fctx.strokeStyle;fctx.stroke()});fctx.shadowBlur=0;
 if(state.streamlines){for(let j=0;j<34;j++){const lane=(j+.5)/34;fctx.beginPath();for(let i=0;i<=150;i++){const t=i/150,g=tubeGeom(t,w,h),xx=24+t*(w-48),yy=g.top+(g.bottom-g.top)*lane+Math.sin(t*10+j)*.55;i?fctx.lineTo(xx,yy):fctx.moveTo(xx,yy)}const gr=fctx.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(20,160,255,.58)');gr.addColorStop(.5,'rgba(214,64,255,.82)');gr.addColorStop(1,'rgba(34,228,239,.58)');fctx.strokeStyle=gr;fctx.lineWidth=j%5===0?1.3:.65;fctx.shadowBlur=j%5===0?7:2;fctx.shadowColor='rgba(95,91,255,.5)';fctx.stroke()}fctx.shadowBlur=0}
 if(state.particles){for(const p of particles){const g=tubeGeom(p.x,w,h),xx=24+p.x*(w-48),yy=g.top+(g.bottom-g.top)*(.04+.92*p.lane)+Math.sin(p.phase+state.phase*2)*.9,center=1-Math.abs(p.x-.5)*2;fctx.beginPath();fctx.arc(xx,yy,p.r+(center>.7?.25:0),0,Math.PI*2);fctx.fillStyle=p.x<.42?'rgba(70,198,255,.8)':p.x<.62?'rgba(240,117,255,.86)':'rgba(88,244,255,.78)';fctx.shadowBlur=7;fctx.shadowColor=fctx.fillStyle;fctx.fill();const local=tubeGeom(p.x,w,h),speed=.00022*state.v1*(tubeGeom(0,w,h).half/local.half);p.x=(p.x+speed)%1;p.phase+=.035}}
 fctx.shadowBlur=0;state.phase+=.015;requestAnimationFrame(drawFlow)
}
function drawProfile(){const w=profile.clientWidth,h=profile.clientHeight;if(!w)return;pctx.clearRect(0,0,w,h);const left=57,right=52,top=45,bottom=92,iw=w-left-right,ih=h-top-bottom,x=physics();
 pctx.strokeStyle='rgba(57,91,123,.44)';pctx.lineWidth=1;for(let i=0;i<4;i++){const y=top+ih*i/3;pctx.beginPath();pctx.moveTo(left,y);pctx.lineTo(w-right,y);pctx.stroke()}for(let i=0;i<9;i++){const xx=left+iw*i/8;pctx.beginPath();pctx.moveTo(xx,top);pctx.lineTo(xx,top+ih);pctx.stroke()}
 pctx.font='10px system-ui';pctx.textAlign='right';for(let i=0;i<4;i++){pctx.fillStyle='#08c9f7';pctx.fillText(String(60-i*20),left-12,top+ih*i/3+3);pctx.fillStyle='#c143ff';pctx.textAlign='left';pctx.fillText(String(120-i*20),w-right+12,top+ih*i/3+3);pctx.textAlign='right'}
 pctx.save();pctx.translate(13,top+ih/2);pctx.rotate(-Math.PI/2);pctx.fillStyle='#00cfff';pctx.textAlign='center';pctx.fillText('Velocity (m/s)',0,0);pctx.restore();pctx.save();pctx.translate(w-11,top+ih/2);pctx.rotate(Math.PI/2);pctx.fillStyle='#c143ff';pctx.textAlign='center';pctx.fillText('Pressure (kPa)',0,0);pctx.restore();
 const vel=[],prs=[];for(let i=0;i<=120;i++){const t=i/120,focus=(1-Math.min(1,Math.abs(t-.5)*2))**1.7,v=20+26*focus*(x.ratio/3.052),p=100-20*focus*(x.drop/16600);vel.push(v);prs.push(p)}
 const line=(arr,min,max,color)=>{pctx.beginPath();arr.forEach((v,i)=>{const xx=left+iw*i/(arr.length-1),yy=top+ih*(1-(v-min)/(max-min));i?pctx.lineTo(xx,yy):pctx.moveTo(xx,yy)});pctx.strokeStyle=color;pctx.lineWidth=2;pctx.shadowBlur=8;pctx.shadowColor=color;pctx.stroke();pctx.shadowBlur=0};line(vel,0,Math.max(60,...vel)*1.05,'#00d7ff');line(prs,60,120,'#bc3cff');
 [0.09,.5,.91].forEach((t,i)=>{const xx=left+iw*t;pctx.setLineDash([6,5]);pctx.beginPath();pctx.moveTo(xx,top);pctx.lineTo(xx,top+ih);pctx.strokeStyle='rgba(164,195,224,.6)';pctx.stroke();pctx.setLineDash([]);pctx.beginPath();pctx.arc(xx,top+6,9,0,Math.PI*2);pctx.fillStyle=i===1?'#492482':'#08335c';pctx.fill();pctx.strokeStyle=i===1?'#b14cff':'#22b6ff';pctx.stroke();pctx.fillStyle='white';pctx.textAlign='center';pctx.fillText(String(i+1),xx,top+9)});
 pctx.fillStyle='#71869e';pctx.textAlign='center';for(let i=0;i<9;i++)pctx.fillText((i*.05).toFixed(2),left+iw*i/8,top+ih+18);pctx.fillText('Axial Position (m)',left+iw/2,top+ih+39);
 const y0=h-33;pctx.beginPath();for(let i=0;i<=100;i++){const t=i/100,g=tubeGeom(t,500,120),xx=left+iw*t,half=g.half/100*28;pctx.lineTo(xx,y0-half)}for(let i=100;i>=0;i--){const t=i/100,g=tubeGeom(t,500,120),xx=left+iw*t,half=g.half/100*28;pctx.lineTo(xx,y0+half)}pctx.closePath();const mini=pctx.createLinearGradient(left,0,left+iw,0);mini.addColorStop(0,'rgba(72,111,178,.35)');mini.addColorStop(.5,'rgba(73,74,141,.38)');mini.addColorStop(1,'rgba(72,111,178,.35)');pctx.fillStyle=mini;pctx.fill();pctx.strokeStyle='rgba(122,160,211,.32)';pctx.stroke()
}
function rangePct(el){const p=(+el.value-+el.min)/(+el.max-+el.min)*100;el.style.setProperty('--pct',p+'%')}
$$('input[type=range]').forEach(rangePct);
[['#vIn','v1'],['#throat','throat'],['#diam','diam'],['#density','rho'],['#height','h']].forEach(([sel,key])=>{$(sel).addEventListener('input',e=>{state[key]=+e.target.value;rangePct(e.target);updateUI()})});
$('#fluid').addEventListener('change',e=>{state.fluid=e.target.value;const f=fluidData[state.fluid];state.rho=f.rho;state.mu=f.mu;$('#density').value=Math.max(500,Math.min(2000,f.rho));rangePct($('#density'));updateUI()});
$$('.switch').forEach(b=>b.onclick=()=>{const k=b.dataset.key;state[k]=!state[k];b.classList.toggle('on',state[k]);if(k==='energy')$('.energy-panel').style.opacity=state.energy?1:.35});
const presets={laminar:{v1:2.1,throat:2.6,diam:4,rho:1000,mu:.006},turbulent:{v1:16,throat:.75,diam:4,rho:1000,mu:.001002},standard:{v1:12,throat:.5,diam:4,rho:1000,mu:.001002},high:{v1:24,throat:.42,diam:5,rho:1000,mu:.001002}};
$$('.preset').forEach(b=>b.onclick=()=>{Object.assign(state,presets[b.dataset.preset]);$('#vIn').value=state.v1;$('#throat').value=state.throat;$('#diam').value=state.diam;$('#density').value=Math.max(500,Math.min(2000,state.rho));['#vIn','#throat','#diam','#density'].forEach(s=>rangePct($(s)));$$('.preset').forEach(x=>x.classList.toggle('active',x===b));updateUI()});
$$('.nav button').forEach(b=>b.onclick=()=>{$$('.nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');toast(`${b.textContent.trim()} view selected`)});
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove('show'),1600)}
$('#shareBtn').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);toast('Live link copied')}catch{toast('Share link ready')}};
$('#exportBtn').onclick=()=>{const x=physics(),text=`DYNAMICS — BERNOULLI SIMULATION REPORT\n\nInlet velocity: ${state.v1.toFixed(2)} m/s\nThroat velocity: ${x.v2.toFixed(2)} m/s\nPressure drop: ${(x.drop/1000).toFixed(2)} kPa\nReynolds number: ${Math.round(x.Re)}\nVolume flow rate: ${x.Q.toFixed(4)} m³/s\nMass flow rate: ${x.mass.toFixed(2)} kg/s\n`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));a.download='dynamics-report.txt';a.click();URL.revokeObjectURL(a.href);toast('Report exported')};
$('#cameraBtn').onclick=()=>{const a=document.createElement('a');a.href=flow.toDataURL('image/png');a.download='dynamics-venturi.png';a.click();toast('Simulation snapshot saved')};
setInterval(()=>{state.time++;const h=Math.floor(state.time/3600),m=Math.floor(state.time%3600/60),s=state.time%60;$('#timeElapsed').textContent=[h,m,s].map(v=>String(v).padStart(2,'0')).join(':')},1000);
setupCanvases();updateUI();setTimeout(()=>{setupCanvases();drawProfile()},30);drawFlow();