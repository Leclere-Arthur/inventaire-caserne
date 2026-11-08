/* Présentation repliée du suivi, sans modifier ses actions de traitement. */
(function(g){'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>v&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v?v.split('-').reverse().join('/'):'';
const niveau=v=>v==null||v===''||!Number.isFinite(Number(v))||Number(v)<0||Number(v)>100?null:Number(v);
let generation=0;
function jauge(value){if(value==null||value===''||!Number.isFinite(Number(value))||Number(value)<0||Number(value)>100)return '<span class="oxy-manometre-vierge" aria-label="Niveau non renseigné"></span>';
 const v=Number(value),a=Math.PI*(1-v/100),x=50+Math.cos(a)*33,y=43-Math.sin(a)*33;
 return `<svg viewBox="0 0 100 65" role="img" aria-label="Dernier niveau relevé : ${v} pour cent"><path d="M12 43 A38 38 0 0 1 88 43" fill="none" stroke="#a9bbc6" stroke-width="4"/>${[0,25,50,75,100].map(n=>{const t=Math.PI*(1-n/100);return `<line x1="${50+Math.cos(t)*34}" y1="${43-Math.sin(t)*34}" x2="${50+Math.cos(t)*41}" y2="${43-Math.sin(t)*41}" stroke="#536877" stroke-width="1"/>`;}).join('')}<line x1="50" y1="43" x2="${x}" y2="${y}" stroke="#c33636" stroke-width="2.5"/><circle cx="50" cy="43" r="3" fill="#243b4a"/><text x="50" y="61" text-anchor="middle" fill="#243b4a" font-size="13" font-weight="bold">${v} %</text></svg>`;
}
function carte(u,index){const manque=[];if(!u.emplacement)manque.push('emplacement');if(!date(u.peremption))manque.push('péremption');if(!u.code)manque.push('ID QR');if(u.niveau==null)manque.push('niveau');
 const quand=u.releve?new Date(u.releve).toLocaleString('fr-FR'):'';
 return `<details class="oxy-item"><summary><span class="oxy-contenu"><strong>Bouteille d’oxygène</strong><span class="oxy-emplacement oxy-valeur">${esc(u.emplacement||'')}</span><span class="oxy-meta"><span>Péremption <b class="oxy-valeur">${esc(date(u.peremption))}</b></span><span>QR <b class="oxy-valeur oxy-code">${esc(u.code||'')}</b></span></span>${manque.length?`<span class="oxy-incomplet">Informations non renseignées : ${esc(manque.join(', '))}.</span>`:''}</span><span class="oxy-manometre">${jauge(u.niveau)}</span></summary><div class="oxy-detail">${quand?`Dernier relevé du manomètre : ${esc(quand)}`:'<span class="oxy-incomplet">Date du relevé non renseignée.</span>'}${u.origine==='manuel'?'<br>Unité sans QR — informations issues de l’inventaire.':''}</div></details>`;
}
function unitesLigne(ligne,quantite){
 const controls=Array.isArray(ligne.controles)?ligne.controles:[],references=Array.isArray(ligne.dates_peremption)?ligne.dates_peremption:[];
 const n=Math.max(0,Math.min(1000,Math.floor(Number(quantite)||0))),result=[],utilisees=new Set();
 const deficit=n<Number(ligne.quantite);
 const absents=new Set(deficit?controls.filter(u=>u.absente&&u.code).map(u=>u.code):[]);
 for(const q of (ligne.qr||[]).filter(q=>!absents.has(q.code)).slice(0,n)){
  const ref=references.findIndex((d,i)=>!utilisees.has(i)&&d===q.peremption);if(ref>=0)utilisees.add(ref);
  result.push({code:q.code,peremption:q.peremption||null,niveau:niveau(q.niveau_pct),releve:q.niveau_releve_le,emplacement:ligne.emplacement,origine:'qr'});
 }
 const manuels=controls.filter(u=>!u.code&&!u.absente);
 while(result.length<n){const u=manuels.shift();let ref;
  if(u?.unite&&references[Number(u.unite)-1]&&!utilisees.has(Number(u.unite)-1)){ref=Number(u.unite)-1;utilisees.add(ref);}else{ref=references.findIndex((d,i)=>!utilisees.has(i));if(ref>=0)utilisees.add(ref);}
  result.push({code:null,peremption:u?.date||references[ref]||null,niveau:niveau(u?.niveau_pct),releve:u?.niveau_pct!=null?ligne.date_controle:null,emplacement:ligne.emplacement,origine:'manuel'});
 }
 return result;
}
function compteur(folder,n,chargement=false,erreur=''){
 folder.classList.toggle('vsav-actif',n>0);folder.classList.toggle('vsav-erreur',!!erreur);
 const badge=folder.querySelector('.vsav-compteur');badge.textContent=String(n);badge.hidden=n===0;
 folder.querySelector('.vsav-resume-etat').textContent=erreur?'Chargement indisponible':chargement?'Chargement…':n>0?n+' élément'+(n>1?'s':''):'Aucun suivi en cours';
}
function dossier(titre,id){const d=document.createElement('details');d.className='vsav-dossier';d.id=id;d.innerHTML=`<summary><span><strong>${esc(titre)}</strong><small class="vsav-resume-etat">Chargement…</small></span><span class="vsav-compteur" hidden></span><span class="vsav-chevron" aria-hidden="true">⌄</span></summary><div class="vsav-dossier-corps"></div>`;return d;}
async function chargerSpecifique(){
 const folder=document.getElementById('vsav-specifique');if(!folder)return;const box=folder.querySelector('.vsav-dossier-corps'),seq=++generation,owner=String(utilisateurConnecte?.id||'');compteur(folder,0,true);box.textContent='Chargement des bouteilles…';
 try{
  const sb=obtenirClientSupabase(),{data,error}=await sb.rpc('cis_vsav_oxygene_lire');if(error)throw error;
  const lignes=data||[],vehicules=[...new Set(lignes.map(x=>x.vehicule_id))],etats=new Map();
  await Promise.all(vehicules.map(async id=>{const [a,h]=await Promise.all([sb.rpc('inventaires_anomalies',{p_vehicule:id}),CISSuiviMateriel.lire(id)]);if(a.error)throw a.error;etats.set(id,{anomalies:a.data||[],hopital:h||[]});}));
  if(!box.isConnected||seq!==generation||owner!==String(utilisateurConnecte?.id||''))return;
  const unites=lignes.flatMap(l=>unitesLigne(l,quantiteVSAVDisponible(l,etats.get(l.vehicule_id))));
  box.innerHTML=unites.length?unites.map(carte).join(''):'<p>Aucune bouteille d’oxygène présente dans les inventaires VSAV.</p>';compteur(folder,unites.length);
 }catch(e){if(box.isConnected&&seq===generation){box.textContent='Suivi spécifique indisponible : '+(e.message||e);compteur(folder,0,false,e.message||String(e));}}
}
function installer(){
 const liste=document.getElementById('suivi-vsav-liste'),main=liste?.closest('main');if(!main)return;
 if(document.getElementById('vsav-rubriques')){void chargerSpecifique();return;}
 const grille=document.createElement('section');grille.id='vsav-rubriques';grille.setAttribute('aria-label','Rubriques du suivi VSAV');main.appendChild(grille);
 grille.appendChild(dossier('SUIVI SPÉCIFIQUE','vsav-specifique'));
 for(const [id,titre] of [['suivi-vsav-attente','Matériel à réarmer'],['suivi-vsav-liste','Matériel à surveiller ou HS'],['suivi-vsav-complementaire','Matériel manquant et péremptions modifiées']]){
  const root=document.getElementById(id);if(!root)continue;
  if(root.previousElementSibling?.tagName==='H2')root.previousElementSibling.remove();
  const d=dossier(titre,'vsav-rubrique-'+id),corps=d.querySelector('.vsav-dossier-corps');corps.appendChild(root);grille.appendChild(d);
  const maj=()=>{const n=root.querySelectorAll('article').length,texte=root.textContent||'';compteur(d,n,!n&&/chargement/i.test(texte),!n&&/indisponible|impossible|ne répond|refusé|réessaie/i.test(texte)?texte:'');};
  const observer=new MutationObserver(()=>{if(!root.isConnected){observer.disconnect();return;}maj();});observer.observe(root,{childList:true,subtree:true,characterData:true});maj();
 }
 main.querySelector('.suivi-vsav-actualiser')?.addEventListener('click',chargerSpecifique);
 void chargerSpecifique();
}
g.CISSuiviVSAVPresentation={installer,chargerSpecifique,unitesLigne};
})(globalThis);
