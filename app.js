'use strict';
const $=x=>document.getElementById(x),KEY='coletor_dmevs_registros_v1';let entries=[];
try{entries=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(entries))entries=[];}catch{}
$('insp').value=localStorage.getItem('coletor_insp')||'';
function setInspector(){$('sinWrap').style.display=$('insp').value==='Sandro'?'none':'block';localStorage.setItem('coletor_insp',$('insp').value)}$('insp').onchange=()=>{setInspector();refreshSinetes();};setInspector();
const date=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function totals(){let m=new Map();for(let e of entries.filter(x=>!x.undone)){let k=JSON.stringify([e.date,e.tag,e.insp,e.sinete]);if(!m.has(k))m.set(k,{...e,qtd:0,count:0});m.get(k).qtd+=e.qtd;m.get(k).count++;}return [...m.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.tag.localeCompare(b.tag));}
function render(){$('list').innerHTML=totals().map(e=>`<div class="item"><b>${esc(e.tag)}</b> — ${e.qtd} peças<br><small>${esc(e.date)} • ${esc(e.insp)} ${esc(e.sinete)} • ${e.count} lançamento(s)</small></div>`).join('')||'Nenhuma baixa.';}
function persist(){localStorage.setItem(KEY,JSON.stringify(entries));render()}

const SIN_KEY='coletor_dmevs_sinetes_recentes_v14';
function getSinetes(){try{const v=JSON.parse(localStorage.getItem(SIN_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}}
function refreshSinetes(){
 const insp=$('insp').value, all=getSinetes(), recent=all[insp]||[];
 const box=$('recentSinetes');box.innerHTML='';
 if(insp==='Sandro')return;
 if(!recent.length){const t=document.createElement('small');t.textContent='Sem sinetes recentes.';box.append(t);return;}
 const current=$('sin').value.trim().toUpperCase();
 for(const s of recent){const b=document.createElement('button');b.type='button';b.textContent=s;b.className=current===s?'selected':'';
 b.onclick=()=>{$('sin').value=s;refreshSinetes();};box.append(b);}
}
function rememberSinete(insp,s){if(!s||insp==='Sandro')return;const all=getSinetes();all[insp]=[s,...(all[insp]||[]).filter(x=>x!==s)].slice(0,6);localStorage.setItem(SIN_KEY,JSON.stringify(all));}
$('sin').addEventListener('input',refreshSinetes);
refreshSinetes();
let audioContext=null;
function feedback(){
 try{if(navigator.vibrate)navigator.vibrate(75);}catch{}
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
 audioContext=audioContext||new C();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
 const osc=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
 osc.type='sine';osc.frequency.value=940;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.12,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.13);
 osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+.14);
 }catch{}
}
function acceptTag(value){
 const v=value.trim().toUpperCase();if(!v)return;
 $('tag').value=v;$('tag').classList.remove('flash');void $('tag').offsetWidth;$('tag').classList.add('flash');
 $('choices').innerHTML='';$('status').textContent='TAG lida: '+v+'. Confira e salve a baixa.';feedback();
}
let toastTimer;
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200);}
$('save').onclick=()=>{
 const insp=$('insp').value,tag=$('tag').value.trim().toUpperCase(),qtd=Number($('qtd').value);
 const sinete=insp==='Sandro'?'':$('sin').value.trim().toUpperCase();
 if(!insp||!tag||!Number.isSafeInteger(qtd)||qtd<=0||(insp!=='Sandro'&&!sinete)){toast('Confira inspetor, TAG, quantidade e sinete.');return;}
 entries.push({id:Date.now()+Math.random(),date:date(),timestamp:new Date().toISOString(),insp,obra:'',tag,qtd,sinete,undone:false});
 rememberSinete(insp,sinete);persist();$('tag').value='';$('qtd').value='1';$('sin').value=sinete;refreshSinetes();$('choices').innerHTML='';
 $('status').textContent='';toast('✓ Baixa salva com sucesso!');
 if(stream){active=true;queue();}
};
$('undo').onclick=()=>{
 let e=[...entries].reverse().find(x=>!x.undone);
 if(e&&confirm(`Desfazer ${e.qtd} peças de ${e.tag}?`)){e.undone=true;persist();toast('Última baixa desfeita.');}
};
function closeModal(){$('modalRoot').innerHTML='';}
function editEntry(id){
 const e=entries.find(x=>String(x.id)===String(id));if(!e)return;
 const root=$('modalRoot');root.innerHTML='';
 const bg=document.createElement('div');bg.className='modal-backdrop';
 const card=document.createElement('div');card.className='modal';
 const h=document.createElement('h3');h.textContent='Editar ou excluir baixa';card.append(h);
 const fields={};
 for(const [key,label,type] of [['tag','TAG','text'],['qtd','Quantidade','number'],['sinete','Sinete','text']]){
  if(key==='sinete'&&e.insp==='Sandro')continue;
  const l=document.createElement('label');l.textContent=label;
  const input=document.createElement('input');input.type=type;input.value=e[key]??'';
  fields[key]=input;card.append(l,input);
 }
 const buttons=[['Salvar alterações',()=>{
  const tag=fields.tag.value.trim().toUpperCase(),q=Number(fields.qtd.value);
  const sin=e.insp==='Sandro'?'':fields.sinete.value.trim().toUpperCase();
  if(!tag||!Number.isSafeInteger(q)||q<=0||(e.insp!=='Sandro'&&!sin)){toast('Confira os campos.');return;}
  e.tag=tag;e.qtd=q;e.sinete=sin;persist();showHistory();closeModal();toast('Baixa atualizada.');
 }],['Excluir baixa',()=>{
  if(confirm('Excluir esta baixa da lista? O histórico conservará o registro como excluído.')){
   e.undone=true;e.deleted=true;persist();showHistory();closeModal();toast('Baixa excluída.');
  }
 }],['Cancelar',closeModal]];
 for(const [label,fn] of buttons){const b=document.createElement('button');b.textContent=label;if(label!=='Salvar alterações')b.className='alt';b.onclick=fn;card.append(b);}
 bg.onclick=event=>{if(event.target===bg)closeModal();};bg.append(card);root.append(bg);
}
function showHistory(){
 const box=$('events');box.innerHTML='';
 for(const e of [...entries].reverse()){
  const item=document.createElement('div');item.className='item';item.setAttribute('role','button');item.tabIndex=0;
  item.textContent=`${e.date} • ${e.tag} • ${e.qtd} peça(s) • ${e.insp} • ${e.sinete||'Sem sinete'}${e.undone?' (EXCLUÍDA/DESFEITA)':''}`;
  if(!e.undone){item.onclick=()=>editEntry(e.id);item.onkeydown=ev=>{if(ev.key==='Enter')editEntry(e.id);};}
  box.append(item);
 }
 if(!entries.length)box.textContent='Sem registros.';
}
$('history').onclick=showHistory;
const csvcell=x=>'"'+String(x??'').replace(/"/g,'""').replace(/[\r\n]/g,' ')+'"';
function csvFile(){
 const lines=[['Data','TAG','Inspetor','DM','EVS','Quantidade','Sinete','Eventos'],...totals().map(e=>[e.date,e.tag,e.insp,'SIM','SIM',e.qtd,e.sinete,e.count])];
 const text='\ufeff'+lines.map(x=>x.map(csvcell).join(';')).join('\r\n');
 return new File([text],'BAIXAS_'+($('insp').value||'INSPECOES')+'_'+date()+'.csv',{type:'text/csv'});
}
function downloadCsv(file){
 const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
$('csv').onclick=()=>{downloadCsv(csvFile());toast('CSV preparado para download.');};
$('share').onclick=async()=>{
 const file=csvFile();
 try{
  if(navigator.canShare?.({files:[file]})&&navigator.share){
   await navigator.share({title:'Baixas DM + EVS',text:'Lista de baixas de inspeção',files:[file]});
  }else{
   downloadCsv(file);toast('Arquivo baixado. Abra Downloads e compartilhe com WhatsApp.');
  }
 }catch(e){if(e.name!=='AbortError'){downloadCsv(file);toast('Compartilhamento indisponível. CSV baixado.');}}
};
let stream=null,worker=null,active=false,busy=false,timer=null,epoch=0;
const video=$('video'),roi=$('roi'),viewport=$('viewport');
function stop(){epoch++;active=false;clearTimeout(timer);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.srcObject=null;$('camArea').style.display='none';$('open').disabled=false;}
$('open').onclick=async()=>{
 if(stream)return;
 $('status').textContent='Solicitando acesso à câmera...';
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){
  $('status').textContent='Câmera indisponível neste contexto. Abra o site em HTTPS no Chrome e permita o acesso à câmera.';
  return;
 }
 try{
  try{
   stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
  }catch(e){
   if(e.name==='OverconstrainedError'||e.name==='NotFoundError'){
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:true});
   }else throw e;
  }
  $('camArea').style.display='block';
  $('open').disabled=true;
  video.srcObject=stream;
  await video.play();
  active=true;epoch++;queue();
  $('status').textContent='Câmera aberta. Aponte a moldura para a TAG.';
 }catch(e){
  stop();
  let dicas={
   NotAllowedError:'Permissão negada. No Chrome, toque no cadeado ou ícone de configurações ao lado do endereço e permita Câmera.',
   NotFoundError:'Nenhuma câmera foi encontrada.',
   NotReadableError:'A câmera está em uso por outro aplicativo. Feche outros apps de câmera e tente novamente.',
   OverconstrainedError:'Configuração da câmera não suportada.',
   AbortError:'A câmera foi interrompida. Tente novamente.'
  };
  $('status').textContent='Não foi possível abrir a câmera: '+(dicas[e.name]||e.message||e.name);
 }
};
$('close').onclick=()=>{stop();$('status').textContent='Câmera fechada.'};$('again').onclick=()=>{if(stream){active=true;$('choices').innerHTML='';queue();}};
let workerPromise=null;
async function getWorker(){
 if(worker)return worker;
 if(workerPromise)return workerPromise;
 workerPromise=(async()=>{
  if(!window.Tesseract)await new Promise((resolve,reject)=>{let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=resolve;s.onerror=()=>reject(Error('Falha ao carregar OCR'));document.head.append(s);});
  worker=await Tesseract.createWorker('eng');return worker;
 })();
 try{return await workerPromise;}catch(e){workerPromise=null;throw e;}
}
function prepareOcr(){
 const el=$('ocrReady');el.textContent='Preparando OCR em segundo plano…';
 getWorker().then(()=>{el.textContent='✓ OCR pronto para leitura.';}).catch(e=>{el.textContent='OCR não carregado: '+e.message+'. A digitação manual continua disponível.';});
}
// Inicia a preparação antes do usuário tocar em Abrir Câmera.
setTimeout(prepareOcr,200);

function crop(){let vr=video.getBoundingClientRect(),rr=roi.getBoundingClientRect(),vw=video.videoWidth,vh=video.videoHeight;if(!vw||!vh)throw Error('Câmera iniciando');let scale=Math.max(vr.width/vw,vr.height/vh),ow=(vw-vr.width/scale)/2,oh=(vh-vr.height/scale)/2,x=Math.max(0,ow+(rr.left-vr.left)/scale),y=Math.max(0,oh+(rr.top-vr.top)/scale),w=Math.min(rr.width/scale,vw-x),h=Math.min(rr.height/scale,vh-y);let c=$('snap'),k=Math.min(2,1000/Math.max(w,h));c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));c.getContext('2d').drawImage(video,x,y,w,h,0,0,c.width,c.height);return c;}
function queue(){if(!active||busy||!stream)return;clearTimeout(timer);timer=setTimeout(scan,250);}
async function scan(){if(!active||busy||!stream)return;busy=true;let token=epoch;try{$('status').textContent='Lendo região selecionada...';let c=crop(),w=await getWorker();if(token!==epoch)return;let result=await w.recognize(c);if(token!==epoch)return;let opts=[...new Set(result.data.text.split(/\r?\n/).map(x=>x.trim().toUpperCase()).filter(x=>x.length>2))].slice(0,8);if(opts.length){active=false;let last=opts[opts.length-1];acceptTag(last);}else $('status').textContent='Ajuste a moldura sobre a TAG.';}catch(e){if(token===epoch)$('status').textContent='OCR indisponível: '+e.message+'. Digite a TAG manualmente.';active=false;}finally{busy=false;if(active&&token===epoch)timer=setTimeout(scan,1100);}}

$('readPhoto').onclick=async()=>{
 const file=$('photoFallback').files?.[0];
 if(!file){toast('Selecione ou fotografe uma imagem.');return;}
 $('status').textContent='Reconhecendo a foto...';
 try{
  const w=await getWorker();
  const result=await w.recognize(file);
  const lines=result.data.text.split(/\r?\n/).map(x=>x.trim().toUpperCase()).filter(x=>x.length>2);
  const last=lines.at(-1);
  if(last){acceptTag(last);}
  else $('status').textContent='Nenhum texto encontrado. Digite a TAG.';
 }catch(e){$('status').textContent='Erro no OCR: '+e.message;}
};
let drag=null;roi.addEventListener('pointerdown',e=>{e.preventDefault();let b=viewport.getBoundingClientRect(),r=roi.getBoundingClientRect();drag={id:e.pointerId,resize:e.target.id==='handle',x:e.clientX,y:e.clientY,l:r.left-b.left,t:r.top-b.top,w:r.width,h:r.height,bw:b.width,bh:b.height};roi.setPointerCapture(e.pointerId);});roi.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;let d=drag,dx=e.clientX-d.x,dy=e.clientY-d.y;if(d.resize){roi.style.width=100*Math.min(d.bw-d.l,Math.max(70,d.w+dx))/d.bw+'%';roi.style.height=100*Math.min(d.bh-d.t,Math.max(40,d.h+dy))/d.bh+'%';}else{roi.style.left=100*Math.max(0,Math.min(d.bw-d.w,d.l+dx))/d.bw+'%';roi.style.top=100*Math.max(0,Math.min(d.bh-d.h,d.t+dy))/d.bh+'%';}});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>roi.addEventListener(ev,()=>drag=null));
window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
