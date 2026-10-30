
const $=id=>document.getElementById(id);
const KEY='coletor_dmevs_registros_v1';
let entries=[];
try{entries=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(entries))entries=[];}catch(e){entries=[];}
$('insp').value=localStorage.getItem('coletor_insp')||'';
$('obra').value=localStorage.getItem('coletor_obra')||'';
function updateInspector(){
 $('solda').style.display=$('insp').value==='Sandro'?'none':'block';
 $('sinete').required=$('insp').value!=='Sandro';
}
$('insp').onchange=()=>{localStorage.setItem('coletor_insp',$('insp').value);updateInspector();};
updateInspector();
function persist(){localStorage.setItem(KEY,JSON.stringify(entries));render();}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function dateNow(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function aggregate(){
 let m=new Map();
 for(const e of entries.filter(x=>!x.undone)){
  let key=JSON.stringify([e.date,e.obra,e.tag,e.insp,e.sinete]);
  if(!m.has(key))m.set(key,{...e,qtd:0,count:0});
  let v=m.get(key);v.qtd+=e.qtd;v.count++;
 }
 return [...m.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.obra.localeCompare(b.obra)||a.tag.localeCompare(b.tag));
}
function render(){
 const rows=aggregate();
 $('lista').innerHTML=rows.length?rows.map(e=>`<div class="entry"><b>${esc(e.tag)}</b> — ${e.qtd} peça(s)<br><small>${esc(e.date)} • ${esc(e.obra)} • ${esc(e.insp)}${e.sinete?' • '+esc(e.sinete):''} • ${e.count} lançamento(s)</small></div>`).join(''):'<small>Nenhuma baixa salva.</small>';
}
$('salvar').onclick=()=>{
 const insp=$('insp').value,obra=$('obra').value.trim(),tag=$('tag').value.trim().toUpperCase(),qtd=Number($('qtd').value),sinete=insp==='Sandro'?'':$('sinete').value.trim().toUpperCase();
 if(!insp||!obra||!tag||!Number.isSafeInteger(qtd)||qtd<=0||(insp!=='Sandro'&&!sinete)){alert('Informe inspetor, obra, TAG, quantidade inteira positiva e sinete quando aplicável.');return;}
 entries.push({id:Date.now()+'-'+Math.random().toString(36).slice(2),date:dateNow(),timestamp:new Date().toISOString(),insp,obra,tag,qtd,sinete,undone:false});
 localStorage.setItem('coletor_obra',obra);persist();
 $('tag').value='';$('qtd').value='1';$('sinete').value='';$('opcoes').innerHTML='';
 $('status').textContent='Baixa registrada com sucesso.';
};
$('desfazer').onclick=()=>{
 let e=[...entries].reverse().find(x=>!x.undone);
 if(!e){alert('Nenhuma baixa ativa para desfazer.');return;}
 if(confirm(`Desfazer a última baixa de ${e.qtd} peça(s) da TAG ${e.tag}?`)){e.undone=true;persist();}
};
$('historico').onclick=()=>{
 $('eventos').innerHTML=entries.slice().reverse().map(e=>`<div class="entry">${esc(e.timestamp.slice(0,19).replace('T',' '))} • ${esc(e.tag)} • +${e.qtd} • ${esc(e.sinete||'Sem sinete')} ${e.undone?'(DESFEITO)':''}</div>`).join('');
};
function csvEscape(x){return '"'+String(x??'').replace(/"/g,'""').replace(/[\r\n]/g,' ')+'"';}
$('csv').onclick=()=>{
 const lines=[['Data','Obra','TAG','Inspetor','DM','EVS','Quantidade','Sinete','Lancamentos'],...aggregate().map(e=>[e.date,e.obra,e.tag,e.insp,'SIM','SIM',e.qtd,e.sinete,e.count])];
 const data='\ufeff'+lines.map(a=>a.map(csvEscape).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='BAIXAS_'+($('insp').value||'INSPECOES')+'_'+dateNow()+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
};
$('ler').onclick=async()=>{
 const file=$('foto').files[0];if(!file){alert('Primeiro fotografe ou selecione uma imagem.');return;}
 $('status').textContent='Carregando reconhecimento de texto...';$('opcoes').innerHTML='';
 try{
  if(!window.Tesseract){
   await new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Falha ao carregar biblioteca OCR. Verifique a internet.'));document.head.append(s);
   });
  }
  const worker=await Tesseract.createWorker('eng');
  try{
   const r=await worker.recognize(file);
   const lines=r.data.text.split(/\r?\n/).map(x=>x.trim().toUpperCase()).filter(x=>x.length>=3);
   const options=[...new Set(lines)].slice(0,25);
   $('status').textContent=options.length?'Selecione a TAG correta ou digite manualmente.':'Nenhum texto encontrado. Digite a TAG manualmente.';
   for(const t of options){
    const b=document.createElement('button');b.className='alt';b.textContent=t;b.onclick=()=>{$('tag').value=t;$('opcoes').innerHTML='';};$('opcoes').append(b);
   }
  }finally{await worker.terminate();}
 }catch(e){$('status').textContent='OCR indisponível: '+e.message+'. Digite a TAG manualmente.';}
};
render();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
