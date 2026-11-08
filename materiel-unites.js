/* Contrôle par exemplaire et manomètre de niveau, indépendant de la consultation QR. */
(function(g){'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valide=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100;
const dateValide=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
function svg(v){const a=Math.PI*(1-(valide(v)?v:0)/100),x=110+Math.cos(a)*75,y=102-Math.sin(a)*75;
 return `<svg viewBox="0 0 220 130" aria-hidden="true" onpointerdown="CISUnites.aiguille(event)" style="touch-action:none;cursor:grab"><path d="M25 102 A85 85 0 0 1 195 102" fill="none" stroke="#d7e0e5" stroke-width="14"/>${[0,25,50,75,100].map(n=>{const a=Math.PI*(1-n/100);return `<line x1="${110+Math.cos(a)*78}" y1="${102-Math.sin(a)*78}" x2="${110+Math.cos(a)*91}" y2="${102-Math.sin(a)*91}" stroke="#536877" stroke-width="2"/><text x="${110+Math.cos(a)*65}" y="${105-Math.sin(a)*65}" text-anchor="middle" fill="#243b4a" font-size="10">${n}</text>`}).join('')}<g opacity="${valide(v)?1:.2}"><line x1="110" y1="102" x2="${x}" y2="${y}" stroke="#c33636" stroke-width="4" stroke-linecap="round"/><circle cx="110" cy="102" r="6" fill="#243b4a"/></g><text x="110" y="126" text-anchor="middle" fill="#243b4a" font-size="15" font-weight="bold">${valide(v)?v+' %':'À renseigner'}</text></svg>`;
}
function jaugeHTML(value,label='Niveau de la bouteille'){
 const v=valide(value)?value:null;
 return `<div class="cis-niveau"><strong>${esc(label)} — 0 à 100 %</strong><div data-niveau-dessin>${svg(v)}</div><input data-niveau-valeur type="hidden" value="${v??''}"><label class="cis-niveau-curseur">Régler le niveau<input type="range" min="0" max="100" step="1" value="${v??0}" aria-label="${esc(label)} en pourcentage" oninput="CISUnites.regler(this,this.value)"></label></div>`;
}
function regler(input,v){const box=input.closest('.cis-niveau'),n=String(v).trim()===''?NaN:Number(v),ok=valide(n);box.querySelector('[data-niveau-valeur]').value=ok?String(n):'';box.querySelector('[data-niveau-dessin]').innerHTML=svg(ok?n:null);box.querySelector('[type=range]').value=ok?n:0;}
function lireJauge(box){const texte=box?.querySelector('[data-niveau-valeur]')?.value;return texte==null||texte===''?null:Number(texte);}
async function charger(id){const {data,error}=await obtenirClientSupabase().rpc('cis_unites_contexte',{p_vehicule:id});if(error)throw error;return data||[];}
function contexte(m){return (typeof vehInventaireSession!=='undefined'?vehInventaireSession?.contexteUnites:[])?.find(x=>String(x.id)===String(m.id));}
function actif(m){const c=contexte(m);return !!c&&(c.suivi_qr||c.suivi_niveau);}
function slots(m,q){const c=contexte(m),total=Math.max(Number(m.quantite)||0,Number(q)||0),result=Array.from({length:total},(_,i)=>({unite:i+1,initiale:m.dates_peremption?.[i]||null,qr:null}));
 for(const qr of c?.qr||[]){let index=c?.positions?.[qr.code]?result.findIndex(s=>!s.qr&&s.unite===c.positions[qr.code]):-1;if(index<0)index=result.findIndex(s=>!s.qr&&s.initiale&&s.initiale===qr.peremption);if(index<0)index=result.findIndex(s=>!s.qr);if(index<0)throw Error(m.nom+' : plus de QR attribués que d’unités prévues. Corrige le rattachement ou la quantité.');result[index].qr=qr;}
 return result;
}
function ligne(m,s,ancien={}){const c=contexte(m),qr=s.qr,scan=!!qr&&ancien.code===qr.code&&ancien.scan_session===vehInventaireSession.identifiantControle&&ancien.scanne===true;
 const date=qr?.peremption||ancien.date||'',niveau=ancien.niveau_pct;
 return `<fieldset data-peremption-unite="${s.unite}" data-controle-unite="${s.unite}" data-qr-attendu="${esc(qr?.code||'')}" data-qr-scanne="${scan?'oui':'non'}" style="margin:12px 0;padding:14px;border:1px solid #bdc9d3;border-radius:10px"><legend>Unité ${s.unite}${qr?' — QR '+esc(qr.code):' — saisie manuelle'}</legend><label data-veh-absence-choix hidden><input type="checkbox" data-veh-unite-absente ${ancien.absente?'checked':''} onchange="vehInventaireSynchroniserQuantite(this.closest('[data-materiel]'))"> Cette unité est absente</label><div data-veh-controle-present>${qr?`<p>Scanne l’étiquette de cet exemplaire pour confirmer son identité.</p><button type="button" class="equipe-action-button" onclick="CISUnites.scanner(this)">${scan?'QR contrôlé — scanner à nouveau':'Scanner cet exemplaire'}</button><p data-qr-resultat role="status" class="${scan?'cis-unite-ok':''}">${scan?'QR '+esc(qr.code)+' contrôlé':''}</p>`:(c.suivi_qr?'<button type="button" class="equipe-action-button" onclick="CISUnites.attribuerOublie(this)">Scanner et attribuer une étiquette vierge</button><p data-qr-resultat role="status"></p>':'')}${qr?.peremption?`<p>Péremption du QR : <strong>${esc(qr.peremption.split('-').reverse().join('/'))}</strong></p>`:`<label>Date de péremption ${c.suivi_qr?'(obligatoire)':''}<input type="date" data-unite-date value="${esc(date)}"></label>${s.initiale?`<small>Dernière date enregistrée : ${esc(s.initiale.split('-').reverse().join('/'))}</small>`:''}`}${c.suivi_niveau?jaugeHTML(niveau):''}</div><small data-peremption-erreur role="status"></small></fieldset>`;
}
function html(m,valeur){const q=valeur.quantite_constatee??Number(m.quantite),anciens=valeur.controle_unites||[];return `<section data-controle-unites="${esc(m.id)}"><p class="veh-muted">${contexte(m).qr.length} exemplaire(s) étiqueté(s). Les autres unités se renseignent manuellement.</p>${slots(m,q).map(s=>ligne(m,s,anciens.find(a=>a.unite===s.unite))).join('')}</section>`;}
function ajuster(carte){const m=vehInventaireMateriels.find(m=>String(m.id)===carte.dataset.materiel);if(!m||!actif(m))return;const box=carte.querySelector('[data-controle-unites]');if(!box)return;const q=Number(carte.querySelector('input[type=number]').value);if(!Number.isInteger(q)||q<0)return;const liste=slots(m,q);for(const s of liste)if(!box.querySelector(`[data-controle-unite="${s.unite}"]`))box.insertAdjacentHTML('beforeend',ligne(m,s));for(const f of box.querySelectorAll('[data-controle-unite]'))if(Number(f.dataset.controleUnite)>liste.length)f.remove();}
async function scanner(bouton){const carte=bouton.closest('[data-materiel]'),f=bouton.closest('[data-controle-unite]'),m=vehInventaireMateriels.find(m=>String(m.id)===carte.dataset.materiel),session=vehInventaireSession;
 const statut=f.querySelector('[data-qr-resultat]');statut.textContent='';
 await CISQR.scannerUtilise(async code=>{
  if(!carte.isConnected||session!==vehInventaireSession)return;
  try{
   if(code!==f.dataset.qrAttendu)throw Error('Ce QR ne correspond pas à cet exemplaire. Scanne l’étiquette '+f.dataset.qrAttendu+'.');
   const {data,error}=await obtenirClientSupabase().rpc('cis_unites_verifier_qr',{p_code:code,p_inventaire:m.id});if(error)throw error;
   const attendu=contexte(m).qr.find(x=>x.code===code);if(!attendu||data.peremption!==attendu.peremption)throw Error('La fiche QR a changé. Relance l’inventaire pour charger les données actuelles.');
   f.dataset.qrScanne='oui';statut.textContent='QR '+code+' contrôlé';statut.className='cis-unite-ok';bouton.textContent='QR contrôlé — scanner à nouveau';
  }catch(e){f.dataset.qrScanne='non';statut.textContent=e.message;statut.className='cis-unite-erreur';throw e;}
 });
}
function lire(m,carte){const c=contexte(m),q=Number(carte.querySelector('input[type=number]').value),ss=slots(m,q),unites=[];
 for(const s of ss){const f=carte.querySelector(`[data-controle-unite="${s.unite}"]`),absente=q===0||!!f.querySelector('[data-veh-unite-absente]')?.checked,scan=f.dataset.qrScanne==='oui';
 const date=s.qr?.peremption||f.querySelector('[data-unite-date]')?.value||null,niveau=c.suivi_niveau&&!absente?lireJauge(f):null;
 if(!absente){if(s.qr&&!scan)throw Error(m.nom+' — unité '+s.unite+' : scanne le QR '+s.qr.code+'.');if((c.suivi_qr||s.initiale)&&!dateValide(date))throw Error(m.nom+' — unité '+s.unite+' : renseigne la date de péremption.');if(c.suivi_niveau&&!valide(niveau))throw Error(m.nom+' — unité '+s.unite+' : renseigne le niveau entre 0 et 100 %.');}
 unites.push({unite:s.unite,initiale:s.initiale,date:absente?s.initiale:date,code:s.qr?.code||null,absente,scanne:!absente&&!!s.qr&&scan,scan_session:vehInventaireSession.identifiantControle,niveau_pct:niveau});
 }
 const manque=Math.max(0,Number(m.quantite)-q);if(unites.filter(u=>u.absente).length!==manque)throw Error(m.nom+' : sélectionne exactement '+manque+' unité(s) absente(s).');
 carte.__controleUnites=unites;
 return unites.filter(u=>u.initiale).map(u=>({unite:u.unite,initiale:u.initiale,date:u.absente?u.initiale:(u.date||u.initiale),action:u.absente?'absente':u.date===u.initiale?'confirmer':'modifier',...(u.absente?{identification:'selection_utilisateur'}:{})}));
}
function complet(m,c){if(!c||!Number.isInteger(c.quantite_constatee)||c.quantite_constatee<0)return false;if(c.quantite_constatee>0&&!['bon','a_surveiller','hs'].includes(c.etat))return false;if(c.quantite_constatee===0&&c.etat!==null)return false;const conf=contexte(m),u=c.controle_unites||[],ss=slots(m,c.quantite_constatee);if(u.length!==ss.length||u.filter(x=>x.absente).length!==Math.max(0,Number(m.quantite)-c.quantite_constatee))return false;return ss.every(s=>{const x=u.find(x=>x.unite===s.unite);return !!x&&x.code===(s.qr?.code||null)&&(x.absente||((!s.qr||x.scanne&&x.scan_session===vehInventaireSession.identifiantControle)&&(!(conf.suivi_qr||s.initiale)||dateValide(x.date))&&(!conf.suivi_niveau||valide(x.niveau_pct))));});}
function resume(unites){return (unites||[]).map(u=>`Unité ${u.unite} : ${u.code?'QR '+u.code:'saisie manuelle'}${u.absente?' — absente':(u.date?' — péremption '+u.date.split('-').reverse().join('/'):'')+(valide(u.niveau_pct)?' — niveau '+u.niveau_pct+' %':'')}`).join('\n');}
function pdf(doc,u,x,y,width){const lignes=[`Unité ${u.unite} - ${u.code?'QR '+u.code:'saisie manuelle'}`,u.absente?'ABSENTE':[u.date?'Péremption : '+u.date.split('-').reverse().join('/'):'',valide(u.niveau_pct)?'Niveau : '+u.niveau_pct+' %':''].filter(Boolean).join(' | ')];doc.setFillColor(242,246,249);doc.roundedRect(x,y,width,25,1.5,1.5,'F');doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(35,52,65);lignes.forEach((t,i)=>doc.text(t,x+5,y+7+i*5));if(!u.absente&&valide(u.niveau_pct)){const cx=x+width-24,cy=y+18,r=13;doc.setDrawColor(93,113,126);doc.setLineWidth(.5);let prev;for(let n=0;n<=100;n+=5){const a=Math.PI*(1-n/100),p=[cx+Math.cos(a)*r,cy-Math.sin(a)*r];if(prev)doc.line(...prev,...p);prev=p;}const a=Math.PI*(1-u.niveau_pct/100);doc.setDrawColor(190,48,48);doc.setLineWidth(1);doc.line(cx,cy,cx+Math.cos(a)*(r-2),cy-Math.sin(a)*(r-2));doc.setFontSize(6);doc.text('0',cx-r-2,cy+3);doc.text('100',cx+r-3,cy+3);}return 28;}
function aiguille(event){
 if(event.button!=null&&event.button!==0)return;
 const box=event.currentTarget.closest('.cis-niveau');if(!box)return;event.preventDefault();
 const pointer=event.pointerId,reglerPoint=e=>{const r=box.querySelector('svg').getBoundingClientRect(),x=(e.clientX-r.left)*220/r.width,y=(e.clientY-r.top)*130/r.height;let angle=Math.atan2(102-y,x-110);if(y>102)angle=x<110?Math.PI:0;const pct=Math.round(100*(1-Math.max(0,Math.min(Math.PI,angle))/Math.PI));regler(box.querySelector('[type=range]'),pct);};
 box.setPointerCapture?.(pointer);reglerPoint(event);
 const move=e=>{if(e.pointerId===pointer)reglerPoint(e);},fin=e=>{if(e.pointerId!==pointer)return;box.removeEventListener('pointermove',move);box.removeEventListener('pointerup',fin);box.removeEventListener('pointercancel',fin);if(box.hasPointerCapture?.(pointer))box.releasePointerCapture(pointer);};
 box.addEventListener('pointermove',move);box.addEventListener('pointerup',fin);box.addEventListener('pointercancel',fin);
}
function capturer(m,carte){return slots(m,Number(carte.querySelector('input[type=number]').value)).map(s=>{const f=carte.querySelector(`[data-controle-unite="${s.unite}"]`);return {unite:s.unite,initiale:s.initiale,code:s.qr?.code||null,date:s.qr?.peremption||f.querySelector('[data-unite-date]')?.value||null,niveau_pct:lireJauge(f),absente:!!f.querySelector('[data-veh-unite-absente]')?.checked,scanne:f.dataset.qrScanne==='oui',scan_session:vehInventaireSession.identifiantControle};});}
async function attribuerOublie(bouton){
 const carte=bouton.closest('[data-materiel]'),f=bouton.closest('[data-controle-unite]'),m=vehInventaireMateriels.find(m=>String(m.id)===carte.dataset.materiel),session=vehInventaireSession,c=contexte(m),statut=f.querySelector('[data-qr-resultat]');
 try{
  const date=f.querySelector('[data-unite-date]')?.value,niveau=c.suivi_niveau?lireJauge(f):null;
  if(!dateValide(date))throw Error('Renseigne la péremption de cette unité avant d’attribuer son QR.');
  if(c.suivi_niveau&&!valide(niveau))throw Error('Règle le niveau de cette unité avant d’attribuer son QR.');
  const produits=(c.produits||[]).filter(p=>p.qr_actif);if(!produits.length)throw Error('Le suivi QR de ce matériel n’est pas actif.');
  let produit=produits[0];
  if(produits.length>1){
   const id=await new Promise(resolve=>{const w=document.createElement('div');w.className='cisqr-scan-dialog';w.innerHTML=`<div class="cisqr-scan-card"><h2>Choisir le matériel</h2><p>Plusieurs produits sont rattachés à cet emplacement.</p><select data-produit><option value="">Choisir un produit</option>${produits.map(p=>`<option value="${esc(p.id)}">${esc(p.nom)}</option>`).join('')}</select><div class="cisqr-row"><button data-ok>Continuer</button><button data-cancel>Annuler</button></div></div>`;document.body.appendChild(w);w.querySelector('[data-cancel]').onclick=()=>{w.remove();resolve(null);};w.querySelector('[data-ok]').onclick=()=>{const id=w.querySelector('select').value;if(!id)return;w.remove();resolve(id);};});if(!id)return;produit=produits.find(p=>p.id===id);
  }
  f.dataset.attributionOperation=f.dataset.attributionOperation||crypto.randomUUID();
  await CISQR.scannerUtilise(async code=>{
   if(!carte.isConnected||session!==vehInventaireSession)return;
   try{
    const avant=capturer(m,carte),{data,error}=await obtenirClientSupabase().rpc('cis_unites_attribuer_oublie',{p_operation:f.dataset.attributionOperation,p_code:code,p_inventaire:m.id,p_materiel:produit.id,p_peremption:date,p_niveau:niveau});if(error)throw error;
    if(!carte.isConnected||session!==vehInventaireSession)return;
    const nouveaux=await charger(session.vehicule.id);if(session!==vehInventaireSession||!carte.isConnected)return;
    const positions={};slots(m,Number(carte.querySelector('input[type=number]').value)).forEach(s=>{if(s.qr)positions[s.qr.code]=s.unite;});positions[code]=Number(f.dataset.controleUnite);
    const nouveau=nouveaux.find(x=>String(x.id)===String(m.id));if(!nouveau)throw Error('Recharge le coffre pour retrouver l’étiquette attribuée.');nouveau.positions=positions;
    const index=session.contexteUnites.findIndex(x=>String(x.id)===String(m.id));session.contexteUnites[index]=nouveau;
    const u=avant.find(x=>x.unite===Number(f.dataset.controleUnite));u.code=code;u.scanne=true;u.scan_session=session.identifiantControle;
    carte.querySelector('[data-controle-unites]').outerHTML=html(m,{quantite_constatee:Number(carte.querySelector('input[type=number]').value),controle_unites:avant});
    vehInventaireSynchroniserQuantite(carte);
   }catch(e){if(statut.isConnected){statut.textContent=e.message;statut.className='cis-unite-erreur';}throw e;}
  });
 }catch(e){statut.textContent=e.message;statut.className='cis-unite-erreur';}
}

g.CISUnites={aiguille,attribuerOublie,valide,jaugeHTML,regler,lireJauge,charger,actif,html,ajuster,scanner,lire,complet,resume,pdf};
})(globalThis);
