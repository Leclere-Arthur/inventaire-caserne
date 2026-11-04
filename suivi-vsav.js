(function(g){'use strict';
const principal=typeof obtenirClientSupabase==='function';
const client=()=>principal?obtenirClientSupabase():sb;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lot=[],request=0;
async function appel(n,p={}){let timer;try{const r=await Promise.race([client().rpc(n,p),new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('Le serveur ne répond pas. Réessaie.')),15000))]);if(r.error)throw Error(r.error.message);return r.data;}finally{clearTimeout(timer)}}
async function validerSignalement(a){
 const lignes=await appel('vsav_sans_stock_lire');
 if(!Array.isArray(lignes))throw Error('Liste des réarmements indisponible.');
 const enAttente=lignes.filter(r=>String(r.vehicule_materiel_id??r.materiel_id??'')===String(a.materiel_id)&&Number(r.restant??(Number(r.quantite)-Number(r.remis)))>0);
 if(a.source==='utilisation_pharmacie'&&!enAttente.length)throw Error('Réarmement introuvable : actualise le suivi.');
 for(const r of enAttente){
  const quantite=Number(r.restant??(Number(r.quantite)-Number(r.remis)));
  if(!r.id||!Number.isSafeInteger(quantite)||quantite<1)throw Error('Quantité de réarmement invalide.');
  const cleStockage='cis-vsav-suivi:'+String(utilisateurConnecte?.id||'')+':'+r.id+':'+quantite;
  let cle;try{cle=localStorage.getItem(cleStockage);}catch(_){}
  if(!cle){cle=crypto.randomUUID();try{localStorage.setItem(cleStockage,cle);}catch(_){}}
  await appel('vsav_sans_stock_traiter',{p_cle:cle,p_ligne:r.id,p_action:'rearmer',p_quantite:quantite});
  try{localStorage.removeItem(cleStockage);}catch(_){}
 }
 const actuels=await appel('pharma_vsav_lire');
 const reste=(Array.isArray(actuels)?actuels:[]).find(r=>String(r.materiel_id)===String(a.materiel_id)&&String(r.vehicule_id)===String(a.vehicule_id));
 if(reste&&reste.source!=='utilisation_pharmacie')await appel('pharma_vsav_remettre_bon',{p_signalement:reste});
}
async function ouvrir(){
 if(principal){
  if(!utilisateurAPermission('acces_administration'))return;
  initialiserStyleEspaceGardeUtilisateur();
  if(typeof initialiserStyleActionsEquipe==='function')initialiserStyleActionsEquipe();
  if(!document.getElementById('suivi-vsav-boutons')){
   const st=document.createElement('style');st.id='suivi-vsav-boutons';
   st.textContent='#suivi-vsav-liste button.equipe-action-button,.suivi-vsav-actualiser{appearance:none!important;display:inline-flex!important;align-items:center;justify-content:center;min-height:48px!important;max-width:100%;box-sizing:border-box;padding:12px 18px!important;margin:8px 0;border:1px solid #c4ced7!important;border-radius:12px!important;background:#fff!important;color:#1766b0!important;font:inherit!important;font-size:16px!important;font-weight:700!important;white-space:normal!important;text-align:center;cursor:pointer}#suivi-vsav-liste button:disabled{opacity:.55}';document.head.appendChild(st);
  }
  document.getElementById('app').innerHTML='<main class="garde-section"><button class="retour-button" onclick="afficherMenuAdministration()">← Retour</button><h1>Suivi VSAV</h1><button class="equipe-action-button suivi-vsav-actualiser" onclick="CISSuiviVSAV.charger()">Actualiser</button><div id="suivi-vsav-attente" role="status"></div><h2>Matériel à surveiller ou HS</h2><div id="suivi-vsav-liste" role="status"></div></main>'+navigationPrincipale('','pharmacie');actualiserInterfaceBureau();
 }else document.getElementById('suivi-vsav-zone').hidden=false;
 await charger();
}
async function charger(){
 if(principal&&window.CISVSAVSansStock)void CISVSAVSansStock.chargerSuivi(document.getElementById('suivi-vsav-attente'));
 const box=document.getElementById('suivi-vsav-liste');if(!box)return;
 const seq=++request;box.textContent='Chargement…';
 try{
  const data=await appel('pharma_vsav_lire');if(!box.isConnected||seq!==request)return;
  lot=data||[];
  box.innerHTML=lot.map((a,i)=>`<article style="margin:14px 0;padding:16px;border:2px solid ${a.etat==='hs'?'#bb2929':'#ac810b'};border-radius:${principal?'14':'0'}px;background:${a.etat==='hs'?'#ffe2e2':'#fff0ba'};color:#302626"><strong>${esc(a.vehicule_nom)} · ${esc(a.zone_nom)} · ${esc(a.nom)}</strong><p><b>${a.source==='utilisation_pharmacie'?(a.etat==='hs'?'HS et matériel manquant':'Matériel manquant'):(a.etat==='hs'?'HS':'À surveiller')}</b></p><p>${esc(a.observation||'')}</p><p>${esc(new Date(a.date).toLocaleString('fr-FR'))}</p><button class="${principal?'equipe-action-button':'retro'}" data-valider="${i}">Valider la remise en état</button><p role="status" data-resultat></p></article>`).join('')||'<p>Aucun matériel VSAV signalé à surveiller ou HS.</p>';
  box.querySelectorAll('[data-valider]').forEach(b=>b.onclick=async()=>{
   const a=lot[+b.dataset.valider],card=b.closest('article'),st=card.querySelector('[data-resultat]');
   const message='Confirmer que « '+a.nom+' » a réellement été remis en état et que les unités manquantes ont été replacées dans le VSAV ? Les réarmements en attente seront enregistrés.';
   const ok=principal?await afficherConfirmationCIS(message):confirm(message);if(!ok)return;
   b.disabled=true;
   try{await validerSignalement(a);if(box.isConnected)await charger();}
   catch(e){if(st.isConnected)st.textContent=e.message;b.disabled=false;}
  });
 }catch(e){if(box.isConnected&&seq===request){box.textContent=e.message;const b=document.createElement('button');b.textContent='Réessayer';b.onclick=charger;box.appendChild(b);}}
}
g.CISSuiviVSAV={ouvrir,charger};
})(window);
