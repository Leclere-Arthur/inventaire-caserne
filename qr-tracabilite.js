(function (g) {
'use strict';
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { config:new Set(), loaded:false, lots:[], retour:new Map(), scanner:null, scanModal:null, cours:false };
const chargementsSuivi=new WeakSet();
const uid = () => String(typeof utilisateurConnecte !== 'undefined' ? utilisateurConnecte?.id || '' : '');
const isAdmin = () => typeof utilisateurAPermission === 'function' && utilisateurAPermission('acces_administration') && utilisateurAPermission('acces_gestion_materiel');
const client = () => typeof obtenirClientSupabase === 'function' && obtenirClientSupabase();
const materiel = id => (typeof materiels !== 'undefined' ? materiels : []).find(m => String(m.id)===String(id));
function setStatut(id, message, error=false){const e=document.getElementById(id);if(e){e.textContent=message||'';e.className='cisqr-status '+(error?'cisqr-error':'cisqr-ok');}}
function erreur(e) { const t=String(e?.message||e); return /Could not find the function|schema cache|does not exist/i.test(t)?'Le SQL du module QR n’a pas encore été installé dans Supabase. '+t:t; }
async function rpc(name,args={}){
 if(!navigator.onLine)throw Error('Connexion requise pour confirmer les mouvements QR. Aucune modification effectuée.');
 const s=client();if(!s)throw Error('Supabase indisponible.');
 const {data,error}=await s.rpc(name,args);if(error)throw Error(error.message||String(error));return data;
}
async function config(force=false){if(state.loaded&&!force)return state.config;const rows=await rpc('cis_qr_config_lire');state.config=new Set((rows||[]).filter(x=>x.actif).map(x=>String(x.materiel_id)));state.loaded=true;return state.config;}
function estSuivi(id){return state.config.has(String(id));}
function newID(){return crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=crypto.getRandomValues(new Uint8Array(1))[0]%16;return(c==='x'?r:(r&3|8)).toString(16)});}
const scripts=new Map();function load(url,test){if(test())return Promise.resolve();if(scripts.has(url))return scripts.get(url);const p=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=()=>test()?resolve():reject(Error('Bibliothèque chargée mais indisponible'));s.onerror=()=>reject(Error('Impossible de télécharger la bibliothèque. Vérifie la connexion Internet.'));document.head.appendChild(s)});scripts.set(url,p);return p;}
async function scanner(callback){
 if(state.scanModal)return;
 const backdrop=document.createElement('div');backdrop.className='cisqr-scan-dialog';backdrop.innerHTML=`<div class="cisqr-scan-card" role="dialog" aria-modal="true" aria-label="Scanner une étiquette QR"><h2>Scanner le QR code</h2><p>Place le QR code dans le cadre. Le scan est automatique.</p><div class="cisqr-reader" id="cisqr-camera"></div><p id="cisqr-camera-status" class="cisqr-small">Activation de la caméra…</p><div class="cisqr-row"><input id="cisqr-manuel" placeholder="Code manuel de secours" autocomplete="off" aria-label="Identifiant QR"><button type="button" id="cisqr-manuel-go">Valider le code</button></div><button type="button" id="cisqr-fermer">Fermer</button></div>`;
 document.body.appendChild(backdrop);state.scanModal=backdrop;let done=false;
 const cleanup=async()=>{if(state.scanner){try{await state.scanner.stop();}catch(_){}try{state.scanner.clear();}catch(_){}state.scanner=null;}backdrop.remove();if(state.scanModal===backdrop)state.scanModal=null;};
 const found=async(code)=>{if(done)return;done=true;await cleanup();try{await callback(String(code).trim().toUpperCase());}catch(e){alert(erreur(e));}};
 backdrop.querySelector('#cisqr-fermer').onclick=()=>{done=true;void cleanup();};
 backdrop.querySelector('#cisqr-manuel-go').onclick=()=>{const c=backdrop.querySelector('#cisqr-manuel').value.trim();if(c)void found(c)};
 try{
  await load('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',()=>typeof g.Html5Qrcode==='function');
  if(done)return;
  const options={fps:12,aspectRatio:1.3,disableFlip:false};
  const reader=new g.Html5Qrcode('cisqr-camera',{verbose:false});state.scanner=reader;
  await reader.start({facingMode:'environment'},options,code=>void found(code),()=>{});
  if(backdrop.isConnected)backdrop.querySelector('#cisqr-camera-status').textContent='Caméra activée — lecture automatique.';
 }catch(e){if(!done&&backdrop.isConnected){backdrop.querySelector('#cisqr-camera-status').textContent='Caméra indisponible : '+erreur(e)+'. Saisie manuelle possible.';}}
}
function shell(titre,inside){document.getElementById('app').innerHTML=`<main class="cisqr-page"><button type="button" onclick="afficherMenuAdministration()">← Retour administration</button><h1>${titre}</h1>${inside}</main>${typeof navigationPrincipale==='function'?navigationPrincipale('pharmacie','pharmacie'):''}`;}
function labelPosition(code){return esc(String(code).slice(0,14))+'…';}
async function ouvrir(){
 if(!isAdmin())return alert('Fonction réservée aux administrateurs pharmacie.');
 shell('Traçabilité QR code',`<section class="cisqr-panel"><h2>Attribuer ou déplacer une étiquette</h2><div class="cisqr-row"><button id="cisqr-assigner" class="cisqr-main">Scanner une étiquette vierge</button><button id="cisqr-deplacer">Déplacer un exemplaire (stock / VSAV)</button></div></section><section class="cisqr-panel"><h2>Matériels suivis et manquants</h2><div id="cisqr-materiels">Chargement…</div></section>`);
 document.getElementById('cisqr-assigner').onclick=()=>void scanner(async code=>{const m=await rpc('cis_qr_fiche',{p_code:code});if(!m||m.etat!=='vierge')throw Error('Étiquette inconnue ou déjà attribuée');await formulaireAttribution(code);});
 document.getElementById('cisqr-deplacer').onclick=()=>void scanner(async code=>{const f=await rpc('cis_qr_fiche',{p_code:code});if(!f||f.etat!=='attribuee')throw Error('QR non attribué');const lieu=f.emplacement==='vsav'?'pharmacie':'vsav';if(!confirm('Déplacer '+f.nom+' ('+code+') vers '+lieu.toUpperCase()+' ?'))return;await rpc('cis_qr_deplacer',{p_code:code,p_emplacement:lieu});alert('Déplacement enregistré.');await afficherProduits();});
 try{await config(true);await afficherProduits();}catch(e){const box=document.getElementById("cisqr-materiels");if(box)box.textContent=erreur(e);}
}
async function afficherProduits(){const el=document.getElementById('cisqr-materiels');if(!el)return;const r=await rpc('cis_qr_suivi_lire');const liste=typeof materiels!=='undefined'?materiels.filter(x=>estSuivi(x.id)):[];el.innerHTML=liste.length?liste.map(m=>{const manque=(r||[]).find(q=>q.materiel_id===m.id)?.manquant||0;return `<div class="cisqr-label"><strong>${esc(m.nom)}</strong><span>QR actifs · Manquants VSAV : <b class="${manque?'cisqr-error':''}">${manque}</b></span><div class="cisqr-row"><button data-assign-id="${esc(m.id)}">Attribuer QR</button><button data-list-id="${esc(m.id)}">Voir les exemplaires</button></div><div id="cisqr-sub-${esc(m.id)}"></div></div>`;}).join(''):'Aucun produit n’a été activé pour le suivi QR. Active un produit depuis Gestion du matériel → Modifier.';el.querySelectorAll('[data-assign-id]').forEach(b=>b.onclick=()=>void attribuerMateriel(b.dataset.assignId));el.querySelectorAll('[data-list-id]').forEach(b=>b.onclick=()=>void afficherExemplaires(b.dataset.listId));}
async function afficherExemplaires(id){const box=document.getElementById('cisqr-sub-'+id);if(!box)return;box.textContent='Chargement…';try{const data=await rpc('cis_qr_exemplaires_lire',{p_materiel:id});box.innerHTML=(data||[]).map(x=>`<p class="cisqr-card-detail"><code>${esc(x.code)}</code> — ${esc(x.emplacement||x.etat)} — Péremption : ${esc(x.peremption||'non renseignée')} — Lot : ${esc(x.lot||'—')}</p>`).join('')||'Aucun exemplaire attribué.';}catch(e){box.textContent=erreur(e);}}
async function attribuerMateriel(id){if(!isAdmin())return;try{await config();if(!estSuivi(id))throw Error('Active d’abord le suivi QR pour ce produit.');await scanner(async code=>{const f=await rpc('cis_qr_fiche',{p_code:code});if(!f||f.etat!=='vierge')throw Error('Étiquette inconnue ou déjà attribuée');await formulaireAttribution(code,id);});}catch(e){alert(erreur(e));}}
async function formulaireAttribution(code,selected){
 const possibles=(typeof materiels!=='undefined'?materiels:[]).filter(m=>estSuivi(m.id));if(!possibles.length)throw Error('Aucun matériel activé pour la traçabilité QR.');
 const w=document.createElement('div');w.className='cisqr-scan-dialog';w.innerHTML=`<div class="cisqr-scan-card" role="dialog" aria-modal="true"><h2>Attribuer une étiquette</h2><p><code>${esc(code)}</code></p><div class="cisqr-row"><label>Matériel</label><select id="cisqr-material-select">${possibles.map(m=>`<option value="${esc(m.id)}" ${m.id===selected?'selected':''}>${esc(m.nom)}</option>`).join('')}</select></div><div class="cisqr-row"><label>N° de lot</label><input id="cisqr-n-lot" maxlength="120" placeholder="Facultatif"></div><div class="cisqr-row"><label>Péremption</label><input type="date" id="cisqr-date"></div><div class="cisqr-row"><label>Emplacement</label><select id="cisqr-place"><option value="pharmacie">Stock pharmacie</option><option value="vsav">VSAV</option></select></div><p id="cisqr-assign-status" class="cisqr-status"></p><div class="cisqr-row"><button class="cisqr-main" id="cisqr-assign-ok">Confirmer l'attribution</button><button id="cisqr-assign-cancel">Annuler</button></div></div>`;document.body.appendChild(w);
 w.querySelector('#cisqr-assign-cancel').onclick=()=>w.remove();w.querySelector('#cisqr-assign-ok').onclick=async()=>{const b=w.querySelector('#cisqr-assign-ok');b.disabled=true;try{await rpc('cis_qr_attribuer',{p_code:code,p_materiel:w.querySelector('#cisqr-material-select').value,p_emplacement:w.querySelector('#cisqr-place').value,p_lot:w.querySelector('#cisqr-n-lot').value,p_peremption:w.querySelector('#cisqr-date').value||null});w.remove();alert('QR code attribué.');if(document.getElementById('cisqr-materiels'))await afficherProduits();}catch(e){setStatut('cisqr-assign-status',erreur(e),true);b.disabled=false;}};
}
function injectAdmin(){if(!isAdmin())return;const menu=document.querySelector('.menu-administration');if(!menu||menu.querySelector('[data-cisqr-menu]'))return;const b=document.createElement('button');b.type='button';b.className='menu-button';b.dataset.cisqrMenu='1';b.innerHTML='<span class="menu-icon">▦</span><span><strong>Traçabilité QR code</strong><small>Attribuer, déplacer et consulter les exemplaires</small></span>';b.onclick=ouvrir;menu.appendChild(b);}
function injectFormulaire(m){if(!m?.id||!isAdmin())return;const formulaire=document.querySelector('#nom-materiel')?.closest('.formulaire');if(!formulaire)return;const c=document.createElement('div');c.className='cisqr-admin-mini';c.innerHTML=`<h3>Traçabilité QR code</h3><label><input type="checkbox" id="cisqr-suivi-enable"> Activer le suivi individuel par QR code pour ce produit</label><div class="cisqr-row"><button type="button" id="cisqr-assign-direct">Attribuer un QR code (caméra)</button><button type="button" id="cisqr-open-admin">Gestion des étiquettes</button></div><p class="cisqr-small">Une étiquette = un exemplaire physique, comme les bouteilles d’oxygène.</p><p class="cisqr-status" id="cisqr-form-status"></p>`;formulaire.appendChild(c);
 const check=c.querySelector('#cisqr-suivi-enable');check.disabled=true;check.onchange=async()=>{check.disabled=true;try{await rpc('cis_qr_configurer',{p_materiel:m.id,p_actif:check.checked});await config(true);setStatut('cisqr-form-status',check.checked?'Suivi activé.':'Suivi désactivé.');}catch(e){check.checked=!check.checked;setStatut('cisqr-form-status',erreur(e),true);}finally{check.disabled=false;}};
 c.querySelector('#cisqr-assign-direct').onclick=()=>void attribuerMateriel(m.id);c.querySelector('#cisqr-open-admin').onclick=ouvrir;
 void config(true).then(()=>{if(check.isConnected){check.checked=estSuivi(m.id);check.disabled=false;}}).catch(e=>setStatut('cisqr-form-status',erreur(e),true));
}
g.CISQR={ouvrir,injectAdmin,injectFormulaire};
})(window);
