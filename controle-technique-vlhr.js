/* Annexe 21 : modèle officiel inchangé, saisie exclusivement sur la colonne droite. */
window.CISControleVLHR={
 points:[['radio','Contrôle de la radio'],['tons','Contrôle du 2 Tons'],['gyro','Contrôle Gyrophare et Feux de pénétration'],['joint','Joint de porte et visualisation poignée'],['vitres','Fermeture complète des vitres et état du pare-brise'],['toit','Présence numéro de toit'],['extincteur','Présence Extincteur'],['masques','Masques de fuite (2)'],['pression','Pression des pneumatiques'],['roues','État des Roues']],
 estControle(r){return r?.type==='controle_technique_vlhr'||(Array.isArray(r?.details)&&r.details.some(x=>x.type==='controle_technique_vlhr'));},
 donnees(r){return r?.type==='controle_technique_vlhr'?r:r?.details?.find(x=>x.type==='controle_technique_vlhr');},
 async pdf(r){
  const PDF=await this.chargerPDF();
  const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Modèle officiel indisponible.'));img.src='./controle-technique-vlhr-modele.png';});
  const doc=new PDF({orientation:'landscape',unit:'mm',format:'a4'}),d=this.donnees(r),w=297,h=210;
  doc.addImage(image,'PNG',0,0,w,h);
  const val=v=>String(v||'').replace(/[\r\n]+/g,' ').trim();
  const write=(s,x,y,max=25,size=7)=>{doc.setFont('helvetica','normal');doc.setFontSize(size);doc.setTextColor(0,0,0);doc.text(doc.splitTextToSize(val(s),max).slice(0,2),x,y);};
  // Coordonnées mesurées sur l'Annexe 21 A4 paysage (colonne droite uniquement).
  write(d.date?new Date(d.date+'T12:00:00').toLocaleDateString('fr-FR'):'',263,32,24,8);
  write(d.sis||'',263,42,24,8);write(d.immatriculation||'',263,52,24,8);
  const rows=[65.9,70.1,75.5,82.3,89.3,94.8,98.8,116.4,169.1,174.8];
  // Les observations sont centrées dans LEUR cellule, sans dépasser sur la ligne suivante.
  // Les cellules n'ont pas toutes la même hauteur dans le modèle officiel.
  const limites=[[63.6,68.1],[68.1,72.5],[72.5,78.1],[78.1,85.2],[85.2,92.2],[92.2,96.8],[96.8,101.1],[113.5,118.2],[166.8,171.5],[171.5,177.5]];
  const detailsSupplementaires=[];
  const observationDansCase=(valeur,i)=>{
   const texte=String(valeur||'').replace(/\s+/g,' ').trim();if(!texte)return;
   const [haut,bas]=limites[i],x=262.5,largeur=32.5,marge=0.7;
   const disponible=bas-haut-2*marge;
   let taille=6,lignes=[];
   // Diminuer progressivement la police jusqu'à ce que le texte rentre dans la case.
   for(;taille>=3.5;taille-=0.25){
    doc.setFont('helvetica','normal');doc.setFontSize(taille);
    lignes=doc.splitTextToSize(texte,largeur);
    if(lignes.length*(taille*0.3528*1.12)<=disponible)break;
   }
   taille=Math.max(3.5,taille);doc.setFontSize(taille);
   const hauteurLigne=taille*0.3528*1.12;
   const maxLignes=Math.max(1,Math.floor(disponible/hauteurLigne));
   if(lignes.length>maxLignes){
    detailsSupplementaires.push([this.points[i][1],texte]);
    lignes=lignes.slice(0,maxLignes);
    const derniere=lignes.length-1;
    while(lignes[derniere].length>1 && doc.getTextWidth(lignes[derniere]+'…')>largeur)lignes[derniere]=lignes[derniere].slice(0,-1);
    lignes[derniere]+='…';
   }
   const total=lignes.length*hauteurLigne;
   const depart=haut+(bas-haut-total)/2+hauteurLigne*0.8;
   doc.setTextColor(0,0,0);
   lignes.forEach((ligne,j)=>doc.text(ligne,x,depart+j*hauteurLigne));
  };
  this.points.forEach(([key],i)=>{const a=d.reponses?.[key];if(!a)return;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('X',a.etat==='ok'?214.5:221.4,rows[i],{align:'center'});if(a.observation)observationDansCase(a.observation,i);});
  // Si une observation est trop longue pour sa cellule, conserver son texte intégral en annexe.

  write(d.observations||'',180,182.6,100,7);
  // Identité dans la case de gauche, signature manuscrite dans celle de droite.
  const identite=[d.signature||'',d.grade||'',d.qualite||''].filter(Boolean).join(' — ');
  doc.setFont('helvetica','normal');doc.setFontSize(6);
  const lignesIdentite=doc.splitTextToSize(identite,65).slice(0,3);
  doc.text(lignesIdentite,181,190);
  if(d.signature_png && /^data:image\/(png|jpeg);base64,/.test(d.signature_png)){
   try{doc.addImage(d.signature_png,d.signature_png.startsWith('data:image/png')?'PNG':'JPEG',255,185,36,12,undefined,'FAST');}catch(e){console.warn('Signature illisible',e);}
  }
  if(detailsSupplementaires.length){
   doc.addPage();doc.setFont('helvetica','bold');doc.setFontSize(13);
   doc.text('Annexe au contrôle technique VLHR — observations complètes',15,18);
   doc.setFont('helvetica','normal');doc.setFontSize(9);
   let y=29;
   for(const [titre,contenu] of detailsSupplementaires){
    const texte=doc.splitTextToSize(titre+' : '+contenu,265);
    if(y+texte.length*5>195){doc.addPage();y=18;}
    doc.text(texte,15,y);y+=texte.length*5+5;
   }
  }
  return doc;
 }
};

window.CISControleVLHR.ouvrir=function(id){
 const v=(typeof vehInventaireCatalogue!=="undefined"?vehInventaireCatalogue:[]).find(x=>String(x.id)===String(id));if(!v)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const today=new Date(),date=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
 const rows=this.points.map(([k,t])=>`<section class="veh-card"><strong>${esc(t)}</strong><div class="veh-etat"><label><input type="radio" name="ct-${k}" value="ok"> OK</label><label><input type="radio" name="ct-${k}" value="non"> Non</label></div><input class="veh-note" id="ct-obs-${k}" placeholder="Observation / action menée (facultatif)"></section>`).join('');
 vehInventaireAfficher(`<div class="veh-inventaire-contenu"><button class="retour-button veh-retour" onclick="vehInventaireOuvrirVehicule('${esc(id)}')">← Retour</button><h1>Contrôle technique — VLHR</h1><p>Annexe 21 — seule la colonne droite sera renseignée.</p><label>Date du contrôle <input id="ct-date" type="date" value="${date}"></label><label>SIS appartenance <input id="ct-sis" class="veh-note" value="SDIS 08"></label><label>Immatriculation <input id="ct-immat" class="veh-note" value="BV-136-SH" placeholder="Immatriculation du VLHR"></label>${rows}<label>Observations générales<textarea id="ct-observations" class="veh-note"></textarea></label><label>Nom et prénom du vérificateur<input id="ct-signature" class="veh-note" value="${esc([typeof profilUtilisateurConnecte!=='undefined'?profilUtilisateurConnecte?.prenom:null,typeof profilUtilisateurConnecte!=='undefined'?profilUtilisateurConnecte?.nom:null].filter(Boolean).join(' '))}"></label><label>Grade<input id="ct-grade" class="veh-note" placeholder="Grade"></label><label>Qualité<input id="ct-qualite" class="veh-note" placeholder="Qualité / fonction"></label><button id="ct-save" class="veh-action" onclick="CISControleVLHR.enregistrer('${esc(id)}')">Enregistrer le contrôle technique</button><p id="ct-status" role="status"></p><div id="ct-actions" hidden><button class="veh-action" onclick="CISControleVLHR.telecharger()">Télécharger le PDF officiel</button><button class="veh-action" onclick="CISControleVLHR.envoyer()">Me l'envoyer par mail</button></div></div>`);
};
window.CISControleVLHR.enregistrer=async function(id){
 const $=x=>document.getElementById(x),status=$('ct-status'),btn=$('ct-save');if(!btn||btn.disabled)return;
 const reponses={};for(const [k,t] of this.points){const radio=document.querySelector(`input[name="ct-${k}"]:checked`);if(!radio){status.textContent='Complète le contrôle : '+t;return;}reponses[k]={etat:radio.value,observation:$('ct-obs-'+k).value.trim()};}
 const v=vehInventaireCatalogue.find(x=>String(x.id)===String(id));
 const details=[{type:'controle_technique_vlhr',date:$('ct-date').value,sis:$('ct-sis').value.trim(),immatriculation:$('ct-immat').value.trim(),observations:$('ct-observations').value.trim(),signature:$('ct-signature').value.trim(),grade:$('ct-grade').value.trim(),qualite:$('ct-qualite').value.trim(),reponses}];
 if(!details[0].date||!details[0].immatriculation){status.textContent='Date et immatriculation obligatoires.';return;}
 btn.disabled=true;status.textContent='Enregistrement en cours…';
 try{
  const sb=obtenirClientSupabase();
  const userId=profilUtilisateurConnecte?.id||utilisateurConnecte?.id;
  if(!userId)throw Error('Connecte-toi à nouveau pour enregistrer le contrôle.');
  const d=details[0];
  // Conserver une copie de la signature du profil au moment du contrôle.
  const {data:signatureProfil,error:erreurSignature}=await sb.from('cis_signatures_spv').select('signature_png').eq('user_id',userId).maybeSingle();
  if(erreurSignature)throw erreurSignature;
  if(!signatureProfil?.signature_png)throw Error('Enregistre d’abord ta signature dans ton profil.');
  d.signature_png=signatureProfil.signature_png;
  const payload={vehicule_id:String(id),vehicule_nom:v.nom,utilisateur_id:userId,
   date_controle:d.date+'T12:00:00',sis_appartenance:d.sis,immatriculation:d.immatriculation,
   controles:[...this.points.map(([cle,libelle])=>({cle,libelle,...d.reponses[cle]})),{cle:'identite_signature',grade:d.grade,qualite:d.qualite,signature_png:d.signature_png}],
   observations:d.observations,verificateur_nom:d.signature,verificateur_grade:d.grade};
  const {data,error}=await sb.from('cis_controles_techniques_vlhr').insert(payload).select('*').single();
  if(error)throw error;
  this.dernier={...d,id:data.id,type:'controle_technique_vlhr',date:d.date};
  status.textContent='Contrôle enregistré. Le PDF peut être téléchargé ou envoyé par mail.';$('ct-actions').hidden=false;
 }catch(e){status.textContent='Échec de l’enregistrement : '+e.message;btn.disabled=false;}
};
window.CISControleVLHR.telecharger=async function(){try{if(!this.dernier)throw Error('Enregistre d’abord le contrôle.');(await this.pdf(this.dernier)).save('controle-technique-VLHR-'+this.donnees(this.dernier).date+'.pdf');}catch(e){alert(e.message);}};
window.CISControleVLHR.envoyer=async function(){
 try{if(!this.dernier)throw Error('Enregistre d’abord le contrôle.');
 const sb=obtenirClientSupabase();const {data:profil,error:pe}=await sb.from('profils_utilisateurs').select('email_contact').eq('id',utilisateurConnecte.id).single();if(pe)throw pe;
 const email=String(profil?.email_contact||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Adresse mail absente du profil.');
 const doc=await this.pdf(this.dernier),base64=doc.output('datauristring').split(',')[1];
 const {data,error}=await appelerFonctionPrincipale(sb,'envoi-documents',{body:{request_id:crypto.randomUUID(),documents:[{name:'controle-technique-VLHR.pdf',filename:'controle-technique-VLHR.pdf',content:base64,type:'vehicules',rubrique:'Inventaires véhicules'}]}});
 if(error||!data?.ok)throw Error(data?.error||error?.message||'Envoi non confirmé.');
 if(data.email && data.email.toLowerCase()!==email.toLowerCase())throw Error('Le service a confirmé un destinataire différent : '+data.email);
 alert('Document envoyé à '+email);
 }catch(e){alert('Envoi impossible : '+e.message);}
};

window.CISControleVLHR.chargerPDF=async function(){
 if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;
 if(!this._chargementPDF){
  this._chargementPDF=(async()=>{
   for(const url of ['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js']){
    try{
     await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('Chargement impossible'));document.head.appendChild(s);});
     if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;
    }catch(e){console.warn('Bibliothèque PDF',e);}
   }
   throw Error('Bibliothèque PDF indisponible. Vérifie la connexion Internet et réessaie.');
  })().finally(()=>{this._chargementPDF=null;});
 }
 return this._chargementPDF;
};

window.CISControleVLHR.depuisTable=function(r){
 const reponses={};for(const c of Array.isArray(r.controles)?r.controles:[]){if(c?.cle)reponses[c.cle]={etat:c.etat,observation:c.observation||''};}
 return {type:'controle_technique_vlhr',date:String(r.date_controle||'').slice(0,10),sis:r.sis_appartenance||'',immatriculation:r.immatriculation||'',observations:r.observations||'',signature:r.verificateur_nom||'',grade:r.verificateur_grade||'',qualite:r.controles?.find(x=>x.cle==='identite_signature')?.qualite||'',signature_png:r.controles?.find(x=>x.cle==='identite_signature')?.signature_png||'',reponses};
};
