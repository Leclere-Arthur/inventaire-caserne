/* CIS Le Chesne — scan des dates : GS1 DataMatrix, code-barres, texte EXP. */
(function(){'use strict';
let dialog=null,stream=null,loop=0,ocrBusy=false,lastOCR=0;
const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
function dateYYMMDD(s){if(!/^\d{6}$/.test(s))return null;let y=2000+Number(s.slice(0,2)),m=+s.slice(2,4),d=+s.slice(4,6);if(d===0)d=new Date(Date.UTC(y,m,0)).getUTCDate();const x=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;return valid(x)?x:null;}
function parse(s){s=String(s||'').replace(/^<GS>/i,'').replace(/[\u001d\u241d]/g,'\x1d');let gtin=null,lot=null,date=null;
 const a=s.match(/(?:\(01\)|^01)(\d{14})/);if(a)gtin=a[1];
 const b=s.match(/\(17\)(\d{6})/);if(b)date=dateYYMMDD(b[1]);
 if(!date){let m=s.match(/(?:^|\x1d|(?<=\d{14}))17(\d{6})/);if(m)date=dateYYMMDD(m[1]);}
 if(!date){let m=s.match(/\b(?:EXP|EXPIRY|PEREMPTION|PÉREMPTION|EXPIRE|DATE\s*LIMITE)\s*[:.\-]?\s*(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/i);if(m){let y=+m[3];if(y<100)y+=2000;let v=`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;if(valid(v))date=v;}}
 if(!date){let m=s.match(/\b(?:EXP|EXPIRY|PEREMPTION|PÉREMPTION|EXPIRE)\s*[:.\-]?\s*(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/i);if(m){let v=`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;if(valid(v))date=v;}}
 if(!date){let m=s.match(/\b(?:EXP|EXPIRY|PEREMPTION|PÉREMPTION|EXPIRE|USE\s*BY|BEST\s*BEFORE)\s*[:.\-]?\s*(\d{1,2})[\/.-](20\d{2}|\d{2})\b/i);if(m){let y=+m[2];if(y<100)y+=2000;let mon=+m[1];if(mon>=1&&mon<=12)date=dateYYMMDD(String(y).slice(2)+String(mon).padStart(2,'0')+'00');}}
 if(!date){let m=s.match(/\b(?:EXP|EXPIRY|PEREMPTION|PÉREMPTION|EXPIRE)\s*[:.\-]?\s*(\d{1,2})\s*[-–—\/.]\s*(20\d{2}|\d{2})\b/i);if(m){let y=+m[2];if(y<100)y+=2000;date=dateYYMMDD(String(y).slice(2)+m[1].padStart(2,'0')+'00');}}
 // Étiquettes imprimées : « EXP: 07 – 2030 – 021 », avec tirets OCR et espaces variables.
 if(!date){
  const cleaned=s.normalize('NFKC').replace(/[–—−‐‑‒]/g,'-').replace(/\s+/g,' ');
  const exp=cleaned.match(/(?:EXP(?:IR(?:Y|ATION|E))?|P[ÉE]REMPTION|USE\s*BY|DATE\s*LIMITE)\s*[:.;-]?\s*(0?[1-9]|1[0-2])\s*[-/. ]+\s*(20\d{2}|\d{2})(?!\d)/i);
  if(exp){let year=+exp[2];if(year<100)year+=2000;date=dateYYMMDD(String(year).slice(2)+String(+exp[1]).padStart(2,'0')+'00');}
 }
 // OCR : conserver le contexte EXP, même si les espaces/tirets ou lettres sont mal lus.
 if(!date){
  const flat=String(s).normalize('NFKC').toUpperCase().replace(/[–—−‐‑‒_]/g,'-').replace(/[|]/g,'1');
  const labels=/(?:E\s*[XK]\s*[PFR]|EXPIR\w*|P[ÉE]REMPTION|USE\s*BY|BEST\s*BEFORE|A\s*UTILISER\s*AVANT)/g;
  let hit;
  while((hit=labels.exec(flat))!==null&&!date){
   // Ne considérer que les 65 caractères après la mention EXP.
   const tail=flat.slice(hit.index+hit[0].length,hit.index+hit[0].length+65)
    .replace(/(?<=\d)[OQ](?=\d|\b)/g,'0').replace(/(?<=\d)[IL](?=\d|\b)/g,'1');
   let m=tail.match(/^[\s:;.,-]{0,12}(0?[1-9]|1[0-2])\s*[-/.\s]+\s*(20\d{2}|\d{2})(?!\d)/);
   if(!m)m=tail.match(/^[\s:;.,-]{0,12}(20\d{2})\s*[-/.\s]+\s*(0?[1-9]|1[0-2])(?!\d)/);
   if(m){const reverse=/^20\d{2}$/.test(m[1]);let year=+(reverse?m[1]:m[2]),month=+(reverse?m[2]:m[1]);if(year<100)year+=2000;date=dateYYMMDD(String(year).slice(2)+String(month).padStart(2,'0')+'00');}
  }
 }
 const l=s.match(/\(10\)([^\x1d(]+)/);if(l)lot=l[1];return {date,gtin,lot,raw:s};}
function stop(){loading(false);loop++;autoScanBusy=false;ocrBusy=false;try{videoControls?.stop();}catch(_){}videoControls=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}if(dialog){dialog.remove();dialog=null;}}
function loading(active,label='Analyse en cours…'){const e=dialog?.querySelector('[data-loading]');if(e)e.classList.toggle('active',!!active);const t=dialog?.querySelector('[data-loading-text]');if(t)t.textContent=label;}
function message(s){const e=dialog?.querySelector('[data-status]');if(e)e.textContent=s;}
async function load(src,globalName){if(window[globalName])return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(Error('Bibliothèque de lecture indisponible (connexion requise).'));document.head.appendChild(s);});}
let libraryPromise=null;
async function zxingLibrary(){
 if(window.ZXing)return window.ZXing;
 if(!libraryPromise)libraryPromise=(async()=>{let last;
  for(const src of ['https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js','https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js']){
    try{await load(src,'ZXing');if(window.ZXing)return window.ZXing;}catch(e){last=e;}
  }
  throw last||Error('Lecteur Data Matrix indisponible');
 })().catch(e=>{libraryPromise=null;throw e;});
 return libraryPromise;
}
async function decodeCanvas(canvas,Z){
 const hints=new Map();hints.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.DATA_MATRIX,Z.BarcodeFormat.CODE_128,Z.BarcodeFormat.QR_CODE]);hints.set(Z.DecodeHintType.TRY_HARDER,true);
 try{
  const reader=new Z.BrowserMultiFormatReader(hints);
  const result=await reader.decodeFromCanvas(canvas);
  return result?.getText?.()||null;
 }catch(e){return null;}
}
async function decodeDetector(canvas){
 if(!window.BarcodeDetector)return null;
 try{const formats=await BarcodeDetector.getSupportedFormats();const desired=['data_matrix','code_128','qr_code'].filter(f=>formats.includes(f));if(!desired.length)return null;
 const hits=await new BarcodeDetector({formats:desired}).detect(canvas);return hits[0]?.rawValue||null;
 }catch(e){return null;}
}
function imageVariants(image){
 const max=2200;
 const base=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
 return [
  {angle:0,scale:base,threshold:0},{angle:90,scale:base,threshold:0},
  {angle:180,scale:base,threshold:0},{angle:270,scale:base,threshold:0},
  {angle:0,scale:Math.min(2,3200/Math.max(image.naturalWidth,image.naturalHeight)),threshold:0},
  {angle:90,scale:Math.min(2,3200/Math.max(image.naturalWidth,image.naturalHeight)),threshold:0},
  {angle:180,scale:Math.min(2,3200/Math.max(image.naturalWidth,image.naturalHeight)),threshold:0},
  {angle:270,scale:Math.min(2,3200/Math.max(image.naturalWidth,image.naturalHeight)),threshold:0},
  ...[15,30,45,60,75,105,120,135,150,165,195,210,225,240,255,285,300,315,330,345].map(angle=>({angle,scale:Math.min(base,1200/Math.max(image.naturalWidth,image.naturalHeight)),threshold:0})),
  {angle:0,scale:base,threshold:145},{angle:90,scale:base,threshold:145},
  {angle:180,scale:base,threshold:145},{angle:270,scale:base,threshold:145}
 ];
}
function drawVariant(canvas,ctx,image,v){
 const w=Math.max(1,Math.round(image.naturalWidth*v.scale));const h=Math.max(1,Math.round(image.naturalHeight*v.scale));
 const rad=v.angle*Math.PI/180;canvas.width=Math.ceil(Math.abs(w*Math.cos(rad))+Math.abs(h*Math.sin(rad)));canvas.height=Math.ceil(Math.abs(h*Math.cos(rad))+Math.abs(w*Math.sin(rad)));
 ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(v.angle*Math.PI/180);
 ctx.drawImage(image,-w/2,-h/2,w,h);ctx.restore();
 if(v.threshold){const data=ctx.getImageData(0,0,canvas.width,canvas.height);
  for(let i=0;i<data.data.length;i+=4){const c=(data.data[i]*299+data.data[i+1]*587+data.data[i+2]*114)/1000;
   const n=c>=v.threshold?255:0;data.data[i]=data.data[i+1]=data.data[i+2]=n;}
  ctx.putImageData(data,0,0);}
}
async function localDataMatrix(file){
 if(!window.ZXingWASM)await load('./vendor/zxing-reader.js','ZXingWASM');
 const ZX=window.ZXingWASM;
 ZX.setZXingModuleOverrides({locateFile:path=>path.endsWith('.wasm')?'./vendor/zxing_reader.wasm':path});
 const hits=await ZX.readBarcodes(file,{formats:['DataMatrix','Code128','QRCode'],tryHarder:true,tryRotate:true,tryInvert:true,tryDownscale:true,maxNumberOfSymbols:8});
 return hits.map(x=>x.text||'').find(x=>parse(x).date)||null;
}
let ocrWorkerPromise=null;
async function getOCRWorker(){
 if(!window.Tesseract)await load('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js','Tesseract');
 if(!ocrWorkerPromise)ocrWorkerPromise=Tesseract.createWorker('eng').catch(e=>{ocrWorkerPromise=null;throw e;});
 return ocrWorkerPromise;
}
function ocrCanvas(image,area,angle,contrast){
 const scale=Math.min(2.4,2100/Math.max(area.w,area.h));
 const w=Math.max(1,Math.round(area.w*scale)),h=Math.max(1,Math.round(area.h*scale));
 const c=document.createElement('canvas');c.width=angle%180===0?w:h;c.height=angle%180===0?h:w;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
 ctx.translate(c.width/2,c.height/2);ctx.rotate(angle*Math.PI/180);
 ctx.drawImage(image,area.x,area.y,area.w,area.h,-w/2,-h/2,w,h);
 if(contrast){const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data;
  for(let i=0;i<d.length;i+=4){const gray=d[i]*.299+d[i+1]*.587+d[i+2]*.114;const v=Math.max(0,Math.min(255,(gray-125)*1.7+135));d[i]=d[i+1]=d[i+2]=v;}
  ctx.putImageData(pixels,0,0);
 }
 return c;
}
async function readImage(file){loading(true,'Lecture du Data Matrix local…');
 try{
  let lastError=null;
  try{const code=await localDataMatrix(file);if(code)return code;}catch(e){lastError=e;console.warn('Data Matrix local',e);}
  message('Recherche de la date imprimée…');
  try{
   const worker=await getOCRWorker();
   const image=await createImageBitmap(file,{imageOrientation:'from-image'});
   try{
    const W=image.width,H=image.height;
    // OCR direct, puis zones de texte agrandies et contrastées. Même pipeline caméra/galerie.
    const areas=[{x:0,y:0,w:W,h:H},
      {x:0,y:Math.round(H*.28),w:W,h:Math.round(H*.48)},
      {x:0,y:Math.round(H*.42),w:W,h:Math.round(H*.45)}];
    for(let a=0;a<areas.length;a++){
     for(const angle of (a===0?[0,180,90,270]:[0,180])){
      const c=ocrCanvas(image,areas[a],angle,a!==0);
      const result=await worker.recognize(c);
      const raw=result.data?.text||'';
      if(parse(raw).date)return raw;
     }
    }
   }finally{image.close?.();}
  }catch(e){lastError=e;console.warn('OCR date',e);}
  throw Error('Aucune date reconnue. '+(lastError?.message||'Essaie de cadrer le texte EXP de plus près.'));
 }finally{loading(false);}
}
function apply(raw,callback){const r=parse(raw);if(!r.date){message('Aucune date reconnue. Vérifie la photo ou saisis la date manuellement.');return;}const label=r.date.split('-').reverse().join('/');if(!confirm(`Date détectée : ${label}${r.gtin?'\nGTIN : '+r.gtin:''}${r.lot?'\nLot : '+r.lot:''}\n\nUtiliser cette date ?`))return;callback(r);stop();}
let videoControls=null;
let autoScanBusy=false;
async function autoDataMatrix(callback,token){
 const video=dialog?.querySelector('video');
 if(token!==loop||!dialog||!video||video.hidden||!stream?.active)return;
 if(!autoScanBusy&&video.readyState>=2&&video.videoWidth){
  autoScanBusy=true;
  try{
   const canvas=document.createElement('canvas');
   // Résolution limitée pour maintenir une lecture fluide sur iPhone.
   const scale=Math.min(1,1280/Math.max(video.videoWidth,video.videoHeight));
   canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
   canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
   canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.85));
   if(blob&&token===loop){
    const raw=await localDataMatrix(blob);
    if(raw&&token===loop){apply(raw,callback);return;}
   }
  }catch(e){if(token===loop)console.warn('Lecture automatique Data Matrix',e);}
  finally{autoScanBusy=false;}
 }
 if(token===loop&&dialog)setTimeout(()=>autoDataMatrix(callback,token),350);
}

async function camera(callback){
 if(!navigator.mediaDevices?.getUserMedia){message('Caméra indisponible. Utilise Galerie.');return;}
 const token=++loop;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:3840},height:{ideal:2160},resizeMode:'none'}});
  if(token!==loop||!dialog){stream.getTracks().forEach(t=>t.stop());return;}
  const video=dialog.querySelector('video');
  video.hidden=false;video.muted=true;video.playsInline=true;video.srcObject=stream;
  await video.play();
  dialog.querySelector('[data-capture]').hidden=false;
  message('Data Matrix : détection automatique active. Pour une date EXP imprimée, utilise Lancer le scan.');
  autoDataMatrix(callback,token);
 }catch(e){message('Impossible de lancer la caméra : '+e.message);}
}
async function capture(callback){
 const video=dialog?.querySelector('video');
 if(!video||video.hidden||!video.videoWidth){message('Attends que la caméra soit prête.');return;}
 const button=dialog.querySelector('[data-capture]');button.disabled=true;loop++; // Suspend la détection automatique pendant l’OCR manuel.
 loading(true,'Analyse de la photo…');
 try{
  const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
  canvas.getContext('2d').drawImage(video,0,0);
  const file=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(new File([b],'capture-camera.png',{type:'image/png'})):reject(Error('Capture impossible.')),'image/png'));
  apply(await readImage(file),callback);
 }catch(e){message(e.message||'Analyse impossible.');}
 finally{loading(false);if(button?.isConnected)button.disabled=false;}
}
function open(callback){stop();dialog=document.createElement('div');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Scanner une péremption');dialog.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0009;display:flex;align-items:center;justify-content:center;padding:12px';dialog.innerHTML='<style>.cis-scan-card{width:min(100%,640px);max-height:96dvh;overflow:auto;background:#fff;color:#182a40;border:1px solid #8ca5c4;border-radius:14px;box-shadow:0 14px 44px #0004;padding:20px;font:inherit;box-sizing:border-box}.cis-scan-header{display:flex;align-items:center;justify-content:space-between;gap:12px}.cis-scan-header h2{font-size:19px;line-height:1.35;margin:0;font-weight:700}.cis-scan-close{background:#eef2f8;color:#243a55;border:1px solid #cbd6e5;border-radius:8px;font-size:24px;min-width:40px;min-height:40px;cursor:pointer}.cis-scan-subtitle{color:#5c6c7e;margin:10px 0 18px;font-size:14px}.cis-scan-video{display:block;width:100%;height:auto;max-height:65dvh;object-fit:cover;border-radius:9px;background:#182b42}.cis-scan-video[hidden]{display:none}.cis-scan-video{aspect-ratio:3/4;min-height:360px}@keyframes cis-scan-spin{to{transform:rotate(360deg)}}.cis-scan-loading{display:none;align-items:center;gap:10px;background:#eef5ff;border:1px solid #bcd2ec;border-radius:9px;padding:12px;margin:12px 0;color:#17385a;font-size:14px}.cis-scan-loading.active{display:flex}.cis-scan-wheel{width:56px;height:56px;border:3px solid #dce7e1;border-top-color:#217448;border-right-color:#217448;border-radius:50%;animation:cis-scan-spin 1.15s linear infinite;flex:none;display:grid;place-items:center}.cis-scan-wheel img{width:39px;height:39px;object-fit:contain;border-radius:9px;animation:cis-scan-spin 1.15s linear infinite reverse}.cis-scan-status{background:#f3f7fc;border:1px solid #d8e3f0;border-radius:9px;padding:12px;margin:12px 0 16px;font-size:14px}.cis-scan-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cis-scan-actions button{min-height:48px;padding:12px;border-radius:9px;font:inherit;font-weight:700;cursor:pointer}.cis-scan-primary{background:#1766b1;color:white;border:1px solid #11558f}.cis-scan-secondary{background:#eef5ff;color:#14538c;border:1px solid #a7c6e7}.cis-scan-help{color:#65758a;font-size:12px;line-height:1.5;margin:16px 0 0}</style><div class="cis-scan-card"><div class="cis-scan-header"><h2>Scanner une date de péremption</h2><button type="button" data-close aria-label="Fermer" class="cis-scan-close">×</button></div><p class="cis-scan-subtitle">Data Matrix GS1, code-barres ou étiquette EXP</p><video playsinline muted hidden class="cis-scan-video"></video><div class="cis-scan-loading" data-loading role="status"><span class="cis-scan-wheel"><img src="./icon-192.png" alt=""></span><span data-loading-text>Chargement…</span></div><p data-status aria-live="polite" class="cis-scan-status">Choisis Scanner pour activer la lecture automatique des Data Matrix.</p><button type="button" data-capture hidden class="cis-scan-primary" style="width:100%;min-height:50px;margin:10px 0">Lire la date EXP</button><div class="cis-scan-actions"><button type="button" data-camera class="cis-scan-primary">Scanner</button><button type="button" data-gallery class="cis-scan-secondary">Galerie</button></div><input type="file" accept="image/*" data-file hidden><p class="cis-scan-help">Le Data Matrix est lu automatiquement. Pour les dates EXP imprimées, utilise « Lire la date EXP » ou la galerie. Vérifie toujours la date avant validation.</p></div>';document.body.appendChild(dialog);dialog.querySelector('[data-close]').onclick=stop;dialog.querySelector('[data-capture]').onclick=()=>capture(callback);dialog.querySelector('[data-camera]').onclick=()=>camera(callback);dialog.querySelector('[data-gallery]').onclick=()=>dialog.querySelector('[data-file]').click();for(const input of dialog.querySelectorAll('input[type=file]'))input.onchange=async()=>{if(!input.files?.[0])return;message('Lecture de la photo…');try{apply(await readImage(input.files[0]),callback);}catch(e){message(e.message);}input.value='';};}
window.CISScanPeremption={open,parse,stop};
})();
