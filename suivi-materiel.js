(function (g) {
"use strict";
const esc = x => echapperHTML(String(x ?? ""));
let generation=0;
async function rpc(nom,args={}) {
 const {data,error}=await obtenirClientSupabase().rpc(nom,args);
 if(error)throw error;
 return data;
}
function styles() {
 if(document.getElementById("suivi-materiel-style"))return;
 const style=document.createElement("style");
 style.id="suivi-materiel-style";
 style.textContent=`
 .suivi-materiel-page{max-width:850px;margin:auto;padding:20px 16px calc(140px + env(safe-area-inset-bottom))}
 .suivi-materiel-page button,.cis-unites-dialog button{font:inherit;font-size:16px;line-height:1.35;min-height:48px;padding:12px 16px;border:1px solid #b7c7be;border-radius:10px;background:#fff;color:#195c3d;white-space:normal;overflow-wrap:anywhere;cursor:pointer}
 .suivi-materiel-page button:disabled{opacity:.55;cursor:default}
 .suivi-materiel-actions{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
 .suivi-materiel-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:20px 0}
 .suivi-materiel-tabs button[aria-selected=true]{background:#1f754d;color:#fff}
 .suivi-materiel-card{background:white;border:1px solid #ccd8d0;border-radius:14px;padding:18px;margin:14px 0;overflow-wrap:anywhere}

 .suivi-materiel-card.hopital-attente{background:#fff1f2;border:2px solid #cc343e}
 .suivi-materiel-card.hopital-en-cours{background:#fff3df;border:2px solid #c77b11}
 .suivi-materiel-card.hopital-recupere{background:#eaf7ef;border:2px solid #27804c}
 .hopital-statut{display:inline-block;padding:8px 12px;border-radius:8px;font-weight:750}
 .hopital-attente .hopital-statut{background:#b71924;color:#fff}
 .hopital-en-cours .hopital-statut{background:#a95d00;color:#fff}
 .hopital-recupere .hopital-statut{background:#1e7042;color:#fff}
 .suivi-materiel-page label{display:grid;gap:7px;margin:12px 0;font-weight:650}
 .suivi-materiel-page input,.suivi-materiel-page select{width:100%;box-sizing:border-box;font:inherit;font-size:16px;min-height:48px;padding:12px;border:1px solid #b8c8bf;border-radius:9px;background:#fff;color:#20332a}
 .suivi-materiel-page [role=alert]{color:#b71924;font-weight:700}
 .cis-unites-dialog{box-sizing:border-box}
 .cis-unites-dialog fieldset{min-width:0;border:1px solid #c2cec7;border-radius:10px}
 .cis-unites-dialog select{box-sizing:border-box;max-width:100%;min-height:48px;font:inherit!important;font-size:16px!important;background:#fff;color:#20332a;border:1px solid #b7c7be;border-radius:9px}
 .cis-unites-dialog button{display:block;width:100%;margin:10px 0}
 .cis-unites-dialog button[type=submit]{background:#1f754d;color:#fff}
 @media(max-width:420px){.suivi-materiel-tabs{grid-template-columns:1fr}}
 `;
 document.head.append(style);
}
async function ouvrir(onglet="hopital") {
 styles();initialiserStyleActionsEquipe();
 document.getElementById("app").innerHTML=`<main class="suivi-materiel-page"><button class="retour-button" onclick="afficherAccueil()">← Retour</button><h1>Suivi matériel</h1>
 <div class="suivi-materiel-actions"><button type="button" data-renseigner>Renseigner un matériel</button><button type="button" data-actualiser>Actualiser</button></div>
 <div class="suivi-materiel-tabs" role="tablist" aria-label="Suivi matériel">${[["hopital","Matériel laissé à l’hôpital"],["rearmer","Matériel à réarmer"],["surveiller","Matériel à surveiller"]].map(([id,nom])=>`<button type="button" role="tab" data-onglet="${id}" aria-selected="false">${nom}</button>`).join("")}</div>
 <div id="suivi-materiel-contenu" role="tabpanel"></div></main>${navigationPrincipale("pharmacie","pharmacie")}`;
 document.querySelector("[data-renseigner]").onclick=()=>void renseigner();
 document.querySelector("[data-actualiser]").onclick=()=>void charger(document.querySelector('[data-onglet][aria-selected=true]')?.dataset.onglet||"hopital");
 document.querySelectorAll("[data-onglet]").forEach(b=>b.onclick=()=>void charger(b.dataset.onglet));
 actualiserInterfaceBureau();window.scrollTo({top:0,behavior:"auto"});
 await charger(onglet);
}
async function charger(onglet) {
 const box=document.getElementById("suivi-materiel-contenu");
 if(!box)return;
 const seq=++generation;
 document.querySelectorAll("[data-onglet]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.onglet===onglet)));
 box.textContent="Chargement…";box.setAttribute("role","tabpanel");
 try {
  if(onglet==="rearmer") {
   const rows=await rpc("cis_suivi_rearmements_lire");
   if(!box.isConnected||generation!==seq)return;
   box.innerHTML='<h2>Matériel à réarmer</h2>'+((rows||[]).map(r=>`<article class="suivi-materiel-card"><h3>${esc(r.nom)}</h3><p>Intervention ${esc(r.numero)} · ${esc(r.restant)} unité(s) à remettre</p>${(r.emplacements_manquants||[]).filter(x=>!x.remis).map(x=>`<p>${esc(x.libelle)}${x.qr?" · QR "+esc(x.qr):""}</p>`).join("")}</article>`).join("")||"<p>Aucun réarmement en attente.</p>");
   if(utilisateurAPermission("acces_administration")) {
    const b=document.createElement("button");b.textContent="Effectuer un réarmement";b.onclick=()=>void ouvrirSuiviVSAVPharma();box.append(b);
   }
   return;
  }
  if(onglet==="surveiller") {
   const rows=(await rpc("cis_suivi_surveillance_lire")||[]).filter(r=>r.source!=="utilisation_pharmacie");
   if(!box.isConnected||generation!==seq)return;
   box.innerHTML='<h2>Matériel à surveiller</h2>'+((rows||[]).map(r=>`<article class="suivi-materiel-card"><h3>${esc(r.nom)}</h3><p>${esc(r.vehicule_nom)} · ${esc(r.zone_nom)}</p><p><strong>${r.etat==="hs"?"Hors service":"À surveiller"}</strong></p><p>${esc(r.observation||"")}</p></article>`).join("")||"<p>Aucun matériel à surveiller.</p>");
   return;
  }
  const rows=await rpc("cis_hopital_lire");
  if(!box.isConnected||generation!==seq)return;
  box.innerHTML='<h2>Matériel laissé à l’hôpital</h2>'+((rows||[]).map(h=>`<article class="suivi-materiel-card ${h.etape===1?"hopital-recupere":h.responsable?"hopital-en-cours":"hopital-attente"}"><h3>${esc(h.nom)} · ${h.quantite} unité(s)</h3><p>Hôpital de ${esc(h.hopital)} · Intervention ${esc(h.intervention)}</p><p>${esc(h.emplacement)}</p><p><span class="hopital-statut">${h.etape===1?"Matériel récupéré · à réarmer":h.responsable?"Prise en charge en cours":"À récupérer"}</span></p>${h.responsable_nom?`<p>Pris en charge par ${esc(h.responsable_nom)}</p>`:""}<div class="suivi-materiel-actions">
  <button data-action="prendre" data-id="${esc(h.id)}" ${h.responsable?"disabled":""}>Je m’en occupe</button>
  <button data-action="recuperer" data-id="${esc(h.id)}" ${h.etape>=1?"disabled":""}>Matériel récupéré</button>
  <button data-action="rearmer" data-id="${esc(h.id)}" ${h.etape!==1?"disabled":""}>Matériel réarmé</button></div><p role="alert"></p></article>`).join("")||"<p>Aucun matériel laissé à l’hôpital.</p>");
  box.querySelectorAll("[data-action]").forEach(b=>b.onclick=async()=>{
   if(b.dataset.action==="rearmer"&&!await afficherConfirmationCIS("Confirmer que le matériel récupéré a été remis à sa place dans le VSAV ?"))return;
   const card=b.closest("article"),buttons=[...card.querySelectorAll("button")];
   buttons.forEach(x=>x.disabled=true);
   try {await rpc("cis_hopital_traiter",{p_id:b.dataset.id,p_action:b.dataset.action});await g.actualiserHopitalInventaire?.().catch(()=>{});await charger("hopital");}
   catch(e){card.querySelector("[role=alert]").textContent=e.message;await chargerApresErreur(card,b);}
  });
 }catch(e){if(box.isConnected&&generation===seq){box.textContent=e.message;box.setAttribute("role","alert");}}
}
async function chargerApresErreur(card,b) {
 // Keep the failure visible while restoring the originally available actions.
 const h=await rpc("cis_hopital_lire").then(rows=>rows.find(x=>x.id===b.dataset.id)).catch(()=>null);
 if(!card.isConnected||!h)return;
 card.querySelector('[data-action=prendre]').disabled=!!h.responsable;
 card.querySelector('[data-action=recuperer]').disabled=h.etape>=1;
 card.querySelector('[data-action=rearmer]').disabled=h.etape!==1;
}
async function renseigner() {
 const box=document.getElementById("suivi-materiel-contenu");if(!box)return;
 const seq=++generation;box.textContent="Chargement du matériel…";
 try {
  const options=await rpc("cis_hopital_options");if(!box.isConnected||generation!==seq)return;
  const ms=options.materiels||[];
  if(!ms.length){box.textContent="Active « Possibilité de laisser le matériel à l’hôpital » dans les réglages du matériel.";return;}
  const enregistrement=crypto.randomUUID();
  box.innerHTML=`<form class="suivi-materiel-card" id="suivi-hopital-form"><h2>Renseigner un matériel</h2>
   <label>Matériel<select name="materiel" required><option value="">Choisir le matériel</option>${ms.map(m=>`<option value="${esc(m.id)}">${esc(m.nom)}</option>`).join("")}</select></label>
   <label data-lien hidden>Emplacement VSAV<select name="inventaire"></select></label>
   <label>Hôpital<select name="hopital" required><option value="">Choisir l’hôpital</option>${["Vouziers","Rethel","Sedan","Charleville"].map(h=>`<option>${h}</option>`).join("")}</select></label>
   <label>Numéro d’intervention<input name="intervention" required maxlength="120"></label>
   <label>Quantité laissée<input name="quantite" type="number" min="1" step="1" required value="1"></label>
   <button type="submit">Enregistrer le matériel laissé</button><p role="alert"></p></form>`;
  const form=box.querySelector("form");
  form.elements.materiel.onchange=()=>{
   const m=ms.find(m=>m.id===form.elements.materiel.value),liens=m?.liens||[];
   form.querySelector("[data-lien]").hidden=!liens.length;
   form.elements.inventaire.required=!!liens.length;
   form.elements.inventaire.innerHTML='<option value="">Choisir un emplacement</option>'+liens.map(id=>{
    const emplacement=options.emplacements.find(x=>x.id===id);
    return `<option value="${esc(id)}">${esc(emplacement?.libelle||"Emplacement indisponible")}</option>`;
   }).join("");
  };
  form.onsubmit=async event=>{
   event.preventDefault();const bouton=form.querySelector("button");bouton.disabled=true;
   try {
    await rpc("cis_hopital_declarer",{p_id:enregistrement,p_materiel:form.elements.materiel.value,p_inventaire:form.elements.inventaire.value||null,p_hopital:form.elements.hopital.value,p_intervention:form.elements.intervention.value.trim(),p_quantite:form.elements.quantite.valueAsNumber});
    await charger("hopital");
   }catch(e){form.querySelector("[role=alert]").textContent=e.message;bouton.disabled=false;}
  };
 }catch(e){if(box.isConnected)box.textContent=e.message;}
}
function appliquer(session, materiels, suivis) {
 const actifs=suivis.filter(x=>x.etape<2);
 session.hopital=actifs;
 for(const m of materiels) {
  const nouveau=actifs.filter(x=>x.inventaire_id===m.id).reduce((n,x)=>n+Number(x.quantite),0);
  const controle=session.controles[m.zone_id]?.[m.id];
  if(controle){
   const ancien=Number(controle.hopital_quantite||0);
   controle.quantite_constatee=Math.max(0,Number(controle.quantite_constatee)+ancien-nouveau);
   controle.hopital_quantite=nouveau;
   if(controle.quantite_constatee===0)controle.etat=null;
  }
 }
}
function note(session,id) {
 return (session?.hopital||[]).filter(h=>h.inventaire_id===id).map(h=>
  "Matériel laissé à l’hôpital de "+h.hopital+" suite à l’inter "+h.intervention+" · "+h.quantite+" unité(s)"+(h.etape===1?" · récupéré, à réarmer":"")).join("\n");
}
g.CISSuiviMateriel={ouvrir,styles,appliquer,note,lire:vehicule=>rpc("cis_hopital_lire",{p_vehicule:vehicule,p_archives:false})};
styles();
})(window);
