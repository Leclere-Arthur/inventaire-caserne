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
 const l=s.match(/\(10\)([^\x1d(]+)/);if(l)lot=l[1];return {date,gtin,lot,raw:s};}
function stop(){loading(false);loop++;ocrBusy=false;try{videoControls?.stop();}catch(_){}videoControls=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}if(dialog){dialog.remove();dialog=null;}}
function loading(active,label='Analyse en cours…'){const e=dialog?.querySelector('[data-loading]');if(e)e.classList.toggle('active',!!active);const t=dialog?.querySelector('[data-loading-text]');if(t)t.textContent=label;}
function message(s){const e=dialog?.querySelector('[data-status]');if(e)e.textContent=s;}
async function load(src,globalName){if(window[globalName])return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(Error('Bibliothèque de lecture indisponible (connexion requise).'));document.head.appendChild(s);});}
let libraryPromise=null;
async function zxingLibrary(){
 if(window.ZXing)return window.ZXing;
 if(!libraryPromise)libraryPromise=(async()=>{let last;
  for(const src of ['https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js','https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js']){
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
 const max=Math.max(image.naturalWidth,image.naturalHeight);
 const base=Math.min(1,2000/max);
 // Couverture intégrale de 360° : balayage puis affinage.
 const angles=[...Array.from({length:24},(_,i)=>i*15),
   ...Array.from({length:120},(_,i)=>i*3).filter(a=>a%15!==0)];
 return angles.map(angle=>({angle,scale:angle%15===0?base:Math.min(base,1100/max),threshold:0}));
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
async function readImage(file){loading(true,'Analyse du Data Matrix et de la date…');
 const url=URL.createObjectURL(file);
 try{
  const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Photo illisible.'));img.src=url;});
  const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw Error('Traitement photo indisponible.');
  let Z=null,lastError=null;
  try{Z=await zxingLibrary();}catch(e){lastError=e;console.warn('ZXing Library indisponible',e);}
  const variants=Z||window.BarcodeDetector?imageVariants(image):[];
  for(let i=0;i<variants.length;i++){
   message(`Décodage Data Matrix, toutes orientations (${i+1}/${variants.length})…`);
   if(i%3===0)await new Promise(resolve=>setTimeout(resolve,0));drawVariant(canvas,ctx,image,variants[i]);
   const native=await decodeDetector(canvas);if(native&&parse(native).date)return native;
   if(Z){const result=await decodeCanvas(canvas,Z);if(result&&parse(result).date)return result;}
  }
  try{
   message('Seconde lecture Data Matrix (moteur vidéo)…');
   await load('https://unpkg.com/@zxing/browser@0.1.5/umd/index.min.js','ZXingBrowser');
   const reader=new window.ZXingBrowser.BrowserMultiFormatReader();
   const result=await reader.decodeFromImageUrl(url);
   if(result?.getText?.()&&parse(result.getText()).date)return result.getText();
  }catch(e){console.warn('Seconde lecture Data Matrix',e);}
  // OCR de la date imprimée sur 4 orientations, y compris une photo prise de travers.
  try{
   await load('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js','Tesseract');
   const worker=await Tesseract.createWorker('eng');
   try{
    for(const angle of [...Array.from({length:24},(_,i)=>i*15),...Array.from({length:120},(_,i)=>i*3).filter(a=>a%15!==0)]){
     message('Lecture de la date imprimée : orientation '+angle+'°…');
     const rad=angle*Math.PI/180,w=image.naturalWidth,h=image.naturalHeight;
     const scale=Math.min(1,(angle%15===0?1400:900)/Math.max(w,h));
     const ww=w*scale,hh=h*scale;
     canvas.width=Math.ceil(Math.abs(ww*Math.cos(rad))+Math.abs(hh*Math.sin(rad)));
     canvas.height=Math.ceil(Math.abs(hh*Math.cos(rad))+Math.abs(ww*Math.sin(rad)));
     ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
     ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rad);ctx.drawImage(image,-ww/2,-hh/2,ww,hh);ctx.restore();
     const result=await worker.recognize(canvas);
     if(parse(result.data?.text||'').date)return result.data.text;
     await new Promise(resolve=>setTimeout(resolve,0));
    }
   }finally{await worker.terminate();}
  }catch(e){lastError=e;console.warn('OCR toutes orientations',e);}
  throw Error('Aucun Data Matrix ni date détecté. Cadre le code entier avec une marge blanche et une photo nette. '+(lastError?.message||''));
 }finally{loading(false);URL.revokeObjectURL(url);}
}
function apply(raw,callback){const r=parse(raw);if(!r.date){message('Aucune date reconnue. Vérifie la photo ou saisis la date manuellement.');return;}const label=r.date.split('-').reverse().join('/');if(!confirm(`Date détectée : ${label}${r.gtin?'\nGTIN : '+r.gtin:''}${r.lot?'\nLot : '+r.lot:''}\n\nUtiliser cette date ?`))return;callback(r);stop();}
let videoControls=null;
async function camera(callback){
 if(!navigator.mediaDevices?.getUserMedia){message('Caméra indisponible. Utilise Galerie.');return;}
 const token=++loop;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
  if(token!==loop||!dialog){stream.getTracks().forEach(t=>t.stop());return;}
  const video=dialog.querySelector('video');
  video.hidden=false;video.muted=true;video.playsInline=true;video.srcObject=stream;
  await video.play();
  dialog.querySelector('[data-capture]').hidden=false;
  message('Cadre le code ou la date, puis appuie sur Lancer le scan.');
 }catch(e){message('Impossible de lancer la caméra : '+e.message);}
}
async function capture(callback){
 const video=dialog?.querySelector('video');
 if(!video||video.hidden||!video.videoWidth){message('Attends que la caméra soit prête.');return;}
 const canvas=document.createElement('canvas');
 canvas.width=video.videoWidth;canvas.height=video.videoHeight;
 canvas.getContext('2d').drawImage(video,0,0);
 const button=dialog.querySelector('[data-capture]');button.disabled=true;
 loading(true,'Analyse de la photo…');
 try{
  const file=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(new File([b],'capture-camera.jpg',{type:'image/jpeg'})):reject(Error('Capture impossible.')),'image/jpeg',.95));
  const raw=await readImage(file);
  apply(raw,callback);
 }catch(e){message(e.message||'Analyse impossible.');}
 finally{loading(false);if(button&&button.isConnected)button.disabled=false;}
}
function open(callback){stop();dialog=document.createElement('div');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Scanner une péremption');dialog.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0009;display:flex;align-items:center;justify-content:center;padding:12px';dialog.innerHTML='<style>.cis-scan-card{width:min(100%,640px);max-height:96dvh;overflow:auto;background:#fff;color:#182a40;border:1px solid #8ca5c4;border-radius:14px;box-shadow:0 14px 44px #0004;padding:20px;font:inherit;box-sizing:border-box}.cis-scan-header{display:flex;align-items:center;justify-content:space-between;gap:12px}.cis-scan-header h2{font-size:19px;line-height:1.35;margin:0;font-weight:700}.cis-scan-close{background:#eef2f8;color:#243a55;border:1px solid #cbd6e5;border-radius:8px;font-size:24px;min-width:40px;min-height:40px;cursor:pointer}.cis-scan-subtitle{color:#5c6c7e;margin:10px 0 18px;font-size:14px}.cis-scan-video{display:block;width:100%;height:auto;max-height:65dvh;object-fit:cover;border-radius:9px;background:#182b42}.cis-scan-video[hidden]{display:none}.cis-scan-video{aspect-ratio:3/4;min-height:360px}@keyframes cis-scan-spin{to{transform:rotate(360deg)}}.cis-scan-loading{display:none;align-items:center;gap:10px;background:#eef5ff;border:1px solid #bcd2ec;border-radius:9px;padding:12px;margin:12px 0;color:#17385a;font-size:14px}.cis-scan-loading.active{display:flex}.cis-scan-wheel{width:56px;height:56px;border:3px solid #dce7e1;border-top-color:#217448;border-right-color:#217448;border-radius:50%;animation:cis-scan-spin 1.15s linear infinite;flex:none;display:grid;place-items:center}.cis-scan-wheel img{width:39px;height:39px;object-fit:contain;border-radius:9px;animation:cis-scan-spin 1.15s linear infinite reverse}.cis-scan-status{background:#f3f7fc;border:1px solid #d8e3f0;border-radius:9px;padding:12px;margin:12px 0 16px;font-size:14px}.cis-scan-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cis-scan-actions button{min-height:48px;padding:12px;border-radius:9px;font:inherit;font-weight:700;cursor:pointer}.cis-scan-primary{background:#1766b1;color:white;border:1px solid #11558f}.cis-scan-secondary{background:#eef5ff;color:#14538c;border:1px solid #a7c6e7}.cis-scan-help{color:#65758a;font-size:12px;line-height:1.5;margin:16px 0 0}</style><div class="cis-scan-card"><div class="cis-scan-header"><h2>Scanner une date de péremption</h2><button type="button" data-close aria-label="Fermer" class="cis-scan-close">×</button></div><p class="cis-scan-subtitle">Data Matrix GS1, code-barres ou étiquette EXP</p><video playsinline muted hidden class="cis-scan-video"></video><div class="cis-scan-loading" data-loading role="status"><span class="cis-scan-wheel"><img src="./icon-192.png" alt=""></span><span data-loading-text>Chargement…</span></div><p data-status aria-live="polite" class="cis-scan-status">Choisis une méthode de lecture.</p><button type="button" data-capture hidden class="cis-scan-primary" style="width:100%;min-height:50px;margin:10px 0">Lancer le scan</button><div class="cis-scan-actions"><button type="button" data-camera class="cis-scan-primary">Scanner</button><button type="button" data-gallery class="cis-scan-secondary">Galerie</button></div><input type="file" accept="image/*" data-file hidden><p class="cis-scan-help">Présente le code dans n’importe quel sens, ou sélectionne une photo. Vérifie la date avant validation.</p></div>';document.body.appendChild(dialog);dialog.querySelector('[data-close]').onclick=stop;dialog.querySelector('[data-capture]').onclick=()=>capture(callback);dialog.querySelector('[data-camera]').onclick=()=>camera(callback);dialog.querySelector('[data-gallery]').onclick=()=>dialog.querySelector('[data-file]').click();for(const input of dialog.querySelectorAll('input[type=file]'))input.onchange=async()=>{if(!input.files?.[0])return;message('Lecture de la photo…');try{apply(await readImage(input.files[0]),callback);}catch(e){message(e.message);}input.value='';};}
window.CISScanPeremption={open,parse,stop};
})();
