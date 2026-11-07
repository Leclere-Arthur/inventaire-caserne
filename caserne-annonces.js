(function (g) {
"use strict";
const envois=new Map();
const compte=()=>String(typeof utilisateurConnecte!=="undefined"?utilisateurConnecte?.id||"":"");
const cle=uid=>"cis-caserne-annonces:"+uid;
function lire(uid) {try{return JSON.parse(localStorage.getItem(cle(uid))||"[]");}catch(_){return [];}}
function modifier(uid,id,ajouter) {
 const liste=lire(uid).filter(x=>x!==id);
 if(ajouter)liste.push(id);
 try{localStorage.setItem(cle(uid),JSON.stringify(liste));}catch(e){console.warn("Journal des annonces Caserne",e);}
}
function identifiant(donnees) {
 const uid=compte();if(!uid)throw Error("Connexion requise.");
 const key="cis-caserne-publication:"+uid;
 const contenu=JSON.stringify(donnees);
 const avant=JSON.parse(localStorage.getItem(key)||"null");
 if(avant?.contenu===contenu)return avant.cle;
 const id=crypto.randomUUID();
 localStorage.setItem(key,JSON.stringify({contenu,cle:id}));
 return id;
}
function confirmerIdentifiant() {try{localStorage.removeItem("cis-caserne-publication:"+compte());}catch(_){}}
async function envoyer(id) {
 const uid=compte();if(!uid)throw Error("Connexion requise.");
 const operation=uid+":"+id;
 if(envois.has(operation))return envois.get(operation);
 modifier(uid,id,true);
 const promesse=(async()=>{
  try {
   const sb=obtenirClientSupabase();
   const {data,error}=await appelerFonctionPrincipale(sb,"notifier-publication-caserne",{body:{publication_id:id}});
   if(error)throw await detailErreurNotification(error);
   if(!data?.ok)throw Error(data?.error||"L’annonce n’a pas pu être envoyée.");
   if(compte()!==uid)return data;
   if(Number(data.en_attente)===0)modifier(uid,id,false);
   else if(Number(data.traites)>0&&!data.reprise_differee)
    setTimeout(()=>{if(compte()===uid)void envoyer(id).catch(e=>console.warn("Annonce Caserne",e.message));},250);
   return data;
  }finally{envois.delete(operation);}
 })();
 envois.set(operation,promesse);
 return promesse;
}
function bilan(resultat) {
 if(Number(resultat.en_attente)>0)return "Annonce en cours d’envoi. Les appareils restants seront retentés automatiquement à la prochaine ouverture de l’application.";
 if(Number(resultat.echecs)>0)return "L’annonce n’a pas pu atteindre tous les appareils. Vérifie les journaux de la fonction notifier-publication-caserne.";
 if(Number(resultat.envoyees)>0)return "Annonce envoyée à "+resultat.envoyees+" appareil(s).";
 return "Aucun appareil abonné et autorisé n’a été trouvé pour cette rubrique.";
}
async function annoncer(id,bouton) {
 if(!await afficherConfirmationCIS("Envoyer l’annonce de nouvelle activité pour cet événement ?"))return;
 if(bouton)bouton.disabled=true;
 let statut=bouton?.parentElement.querySelector("[data-annonce-resultat]");
 if(bouton&&!statut){statut=document.createElement("p");statut.dataset.annonceResultat="";statut.setAttribute("role","status");bouton.parentElement.append(statut);}
 if(statut)statut.textContent="Envoi de l’annonce…";
 try {
  const resultat=await envoyer(id);
  if(statut?.isConnected){statut.style.color=Number(resultat.echecs)>0?"#b71924":"#176b43";statut.textContent=bilan(resultat);}
 }catch(e){if(statut?.isConnected){statut.style.color="#b71924";statut.textContent="Événement conservé. Annonce non envoyée : "+e.message;}}
 finally{if(bouton?.isConnected)bouton.disabled=false;}
}
async function reprendre() {
 if(!navigator.onLine||document.hidden)return;
 const uid=compte();if(!uid)return;
 for(const id of lire(uid)) {
  if(compte()!==uid)return;
  try{await envoyer(id);}catch(e){console.warn("Annonce Caserne à reprendre",e.message);}
 }
}
g.CISCaserneAnnonces={identifiant,confirmerIdentifiant,envoyer,bilan,annoncer};
setInterval(()=>void reprendre(),30000);
g.addEventListener("online",()=>void reprendre());
document.addEventListener("visibilitychange",()=>{if(!document.hidden)void reprendre();});
setTimeout(()=>void reprendre(),4000);
})(window);
