/* Les envois locaux sont distincts des archives confirmées par Supabase. */
(function(g){'use strict';let signature='',raf=0,envoi=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lignes(){return typeof CISSynchronisationFiable!=='undefined'?CISSynchronisationFiable.lire():[];}
function horodatage(l){const v=l.payload?.created_at||l.cree_le;return v?new Date(v).toLocaleString('fr-FR'):'Date de réalisation non conservée par l’ancienne version';}
function planifier(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;rendre();});}
function rendre(){
 const main=document.querySelector('#app main');if(!main)return;
 const rows=lignes(),cle=JSON.stringify(rows.map(l=>[l.id,l.erreur,l.dernier_essai,l.en_recontrole,l.a_recontroler]));
 const actuel=document.getElementById('cis-inventaires-attente');if(actuel&&signature===cle)return;
 if(!rows.length){actuel?.remove();signature='';return;}
 const box=actuel||document.createElement('section');box.id='cis-inventaires-attente';box.className='garde-admin-card';box.style.cssText='margin:16px 0;padding:16px;border:2px solid #cc8a20;border-radius:12px;background:#fff4d7!important;color:#362b18!important;overflow-wrap:anywhere';
 const ouvert=!!box.querySelector('details[open]');
 box.innerHTML=`<strong style="display:block;color:inherit!important">${rows.length} inventaire${rows.length>1?'s':''} en attente de confirmation</strong><p style="font-size:14px;color:inherit!important">Conservé${rows.length>1?'s':''} sur cet appareil. Historique, exports et suivi des bouteilles seront mis à jour après l’enregistrement dans Supabase.</p><details ${ouvert?'open':''}><summary>Voir les envois et les erreurs</summary>${rows.map(l=>`<article style="padding:12px 0;border-bottom:1px solid #d8cbb0"><strong>${esc(l.payload?.vehicule_nom||'Véhicule')}</strong><small style="display:block">${esc(horodatage(l))}</small><small style="display:block">Référence : ${esc(l.id)}</small>${l.erreur?`<p role="status" style="white-space:pre-wrap;color:#b42323!important;font-weight:700">${esc(l.erreur.message)}${l.erreur.code?' ('+esc(l.erreur.code)+')':''}${l.erreur.details?'\n'+esc(l.erreur.details):''}${l.erreur.hint?'\n'+esc(l.erreur.hint):''}</p>`:'<p>Envoi à confirmer.</p>'}${l.a_recontroler||l.en_recontrole?'<p style="color:#b42323!important">Contrôles QR/niveau à reprendre. Cet envoi ne bloque plus les suivants.</p>':''}<button type="button" class="equipe-action-button" data-reprendre="${esc(l.id)}" ${envoi?'disabled':''}>Reprendre cet inventaire</button></article>`).join('')}</details><div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px"><button type="button" class="equipe-action-button" data-reessayer ${envoi?'disabled':''}>${envoi?'Envoi en cours…':'Réessayer l’envoi'}</button><button type="button" class="equipe-action-button" data-sauver>Conserver une copie des envois</button></div><p data-reprise-statut role="status" style="font-size:13px;color:inherit!important"></p>`;
 if(!actuel)main.prepend(box);signature=cle;
 box.querySelector('[data-reessayer]').onclick=async()=>{if(envoi)return;envoi=true;signature='';rendre();try{await CISSynchronisationFiable.synchroniserInventaires();}finally{envoi=false;signature='';rendre();const status=document.querySelector('#cis-inventaires-attente [data-reprise-statut]');if(status)status.textContent='Les envois compatibles ont été traités. Reprends les inventaires dont les contrôles sont refusés.';else alert('Les inventaires en attente ont été confirmés dans Supabase. Actualise l’historique et le suivi des bouteilles.');}};
 box.querySelectorAll('[data-reprendre]').forEach(b=>b.onclick=async()=>{if(envoi)return;envoi=true;try{await vehInventaireReprendreEnvoi(b.dataset.reprendre);}finally{envoi=false;signature='';rendre();}});
 box.querySelector('[data-sauver]').onclick=()=>{const blob=new Blob([JSON.stringify({format:'cis-inventaires-attente-v1',exporte_le:new Date().toISOString(),envois:lignes()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='CIS-Inventaires-en-attente.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
}
function installer(){const app=document.getElementById('app');if(!app)return;new MutationObserver(planifier).observe(app,{childList:true,subtree:true});planifier();}
window.addEventListener('cis-inventaires-attente',planifier);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installer);else installer();
g.CISInventairesAttente={rendre};
})(globalThis);
