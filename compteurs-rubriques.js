(function (g) {
"use strict";
const types = ["hopital","rearmement","surveillance","complementaire","stock","formation","caserne"];
let owner="", etats={}, demandes=[], affichages=[], enCours=false, generation=0, dernier=0, timer=null, rendu=null;
const lectures=new Set();
const uid=()=>typeof utilisateurConnecte!=="undefined"?String(utilisateurConnecte?.id||""):"";
const cle=compte=>"cis-compteurs-rubriques-v3:"+compte;
const vide=()=>Object.fromEntries(types.map(type=>[type,[]]));
const union=(...ensembles)=>[...new Set(ensembles.flat())];

function styles() {
 if(document.getElementById("cis-compteurs-style"))return;
 const style=document.createElement("style");style.id="cis-compteurs-style";
 style.textContent=`
 .cis-compteur-support{position:relative!important;overflow:visible!important}
 .cis-compteur-support::after{
  content:attr(data-compteur-nombre)!important;
  position:absolute!important;top:-8px!important;right:-8px!important;bottom:auto!important;left:auto!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  box-sizing:border-box!important;min-width:25px!important;height:25px!important;width:auto!important;
  padding:0 7px!important;margin:0!important;border:2px solid #fff!important;border-radius:999px!important;
  background:#ff2d55!important;color:#fff!important;font-family:Arial,Helvetica,sans-serif!important;
  font-size:13px!important;font-weight:750!important;line-height:1!important;letter-spacing:0!important;
  text-indent:0!important;white-space:nowrap!important;box-shadow:0 1px 4px #af103033!important;
  transform:none!important;pointer-events:none!important;z-index:5!important;flex:none!important
 }
 @media(min-width:1000px){.cis-compteur-support::after{font-size:12px!important;min-width:23px!important;height:23px!important}}
 `;document.head.append(style);
}
function synchroniserCompte() {
 const compte=uid();
 if(compte===owner)return;
 owner=compte;++generation;etats=vide();demandes=[];affichages=[];lectures.clear();dernier=0;
 if(compte)try{
  const cache=JSON.parse(localStorage.getItem(cle(compte))||"null");
  if(cache){for(const type of types)etats[type]=Array.isArray(cache.etats?.[type])?cache.etats[type]:[];demandes=Array.isArray(cache.demandes)?cache.demandes:[];}
 }catch(_){}
 dessiner();
}
function sauvegarder() {
 if(!owner)return;
 try{localStorage.setItem(cle(owner),JSON.stringify({etats,demandes}));}catch(_){}
}
function taches(type) {
 if(type==="pharmacie")return union(etats.hopital,etats.stock,utilisateurAPermission("acces_administration")?union(etats.rearmement,etats.surveillance,etats.complementaire):[]);
 if(type==="suivi")return etats.hopital;
 if(type==="vsav")return utilisateurAPermission("acces_administration")?union(etats.rearmement,etats.surveillance,etats.complementaire):[];
 if(type==="equipe")return etats.formation;
 if(type==="tout")return union(taches("pharmacie"),etats.formation,etats.caserne.map(x=>x.id));
 if(type.startsWith("caserne:"))return etats.caserne.filter(t=>t.type===type.slice(8)).map(t=>t.id);
 if(type==="caserne")return etats.caserne.map(t=>t.id);
 if(type.startsWith("publication:"))return etats.caserne.some(t=>t.id==="caserne:"+type.slice(12))?[type]:[];
 if(type.startsWith("demande:"))return etats.formation.includes("formation:"+type.slice(8))?[type]:[];
 return etats[type]||[];
}
function cible(element) {
 if(element.closest("nav,#navigation-bureau,.sidebar-pc,.caserne-nav-bas,.navigation-principale,.barre-navigation"))return null;
 if(element.dataset.compteurRubrique)return element.dataset.compteurRubrique;
 if(element.dataset.compteurPublication)return "publication:"+element.dataset.compteurPublication;
 if(element.dataset.compteurDemande)return "demande:"+element.dataset.compteurDemande;
 if(element.dataset.onglet)return ({hopital:"hopital",surveiller:"surveillance"})[element.dataset.onglet]||null;
 const action=element.getAttribute("onclick")||"";
 if(element.matches(".retour-button,.veh-retour,.cisqr-back")||element.textContent.trim().startsWith("←"))return null;
 const rubrique=action.match(/afficherRubriqueCaserne\(['"]([^'"]+)['"]/);
 if(rubrique)return "caserne:"+rubrique[1];
 if(/CISSuiviMateriel\.ouvrir/.test(action))return "suivi";
 if(/ouvrirSuiviVSAVPharma|ouvrirAdministrationSuiviVSAV|ouvrirAdministration\(|afficherMenuAdministration\(/.test(action))return "vsav";
 if(/afficherHistorique\(/.test(action))return "stock";
 if(/CISFormations\.vue\(['"]demandes['"]/.test(action)||/CISFormations\.ouvrir\(/.test(action))return "formation";
 if(/afficherEspaceGarde\(/.test(action))return "equipe";
 if(/afficherAccueil\(|ouvrirMenuPharmacie\(/.test(action))return "pharmacie";
 if(/afficherEspaceCaserne\(|afficherActualitesCaserne\(|ouvrirMenuCaserne\(/.test(action))return "caserne";
 if(/afficherPortailPrincipal\(|ouvrirMenuPrincipal\(/.test(action))return "tout";
 return null;
}
function dessiner() {
 styles();
 const stockActuel=stockLocal();
 if(stockActuel!==null&&owner&&etats.stock.join("|")!==stockActuel.join("|")){
  etats.stock=stockActuel;sauvegarder();
 }
 document.querySelectorAll("button[onclick],[role=button][onclick],a[onclick],[data-onglet],[data-compteur-rubrique],[data-compteur-publication],[data-compteur-demande]").forEach(element=>{
  // A pseudo-element keeps the existing title/description children intact.
  Array.from(element.children).filter(n=>n.classList.contains("cis-compteur-bulle")).forEach(n=>n.remove());
  const type=cible(element);
  const nombre=type&&owner?taches(type).length:0;
  if(!nombre){
   element.classList.remove("cis-compteur-support");
   element.removeAttribute("data-compteur-nombre");
   element.removeAttribute("aria-description");
   return;
  }
  element.classList.add("cis-compteur-support");
  element.dataset.compteurNombre=String(nombre);
  element.setAttribute("aria-description",nombre+" élément"+(nombre>1?"s":"")+" à traiter");
 });
}
function planifierRendu() {
 if(rendu)return;
 rendu=setTimeout(()=>{rendu=null;synchroniserCompte();dessiner();},50);
}
async function rpc(nom,args={}) {
 const controle=new AbortController(),timeout=setTimeout(()=>controle.abort(),15000);
 try {const r=await obtenirClientSupabase().rpc(nom,args).abortSignal(controle.signal);if(r.error)throw r.error;return r.data;}
 finally{clearTimeout(timeout);}
}
async function toutesLesLignes(fabrique) {
 const rows=[];
 for(let debut=0;;debut+=500){
  const controle=new AbortController(),timeout=setTimeout(()=>controle.abort(),15000);
  try {
   const {data,error}=await fabrique().range(debut,debut+499).abortSignal(controle.signal);
   if(error)throw error;
   rows.push(...(data||[]));
   if((data?.length||0)<500)return rows;
  } finally {clearTimeout(timeout);}
 }
}
function referencesStockEnAlerte(materiels,consommations) {
 const totaux=new Map();
 for(const consommation of consommations) {
  const id=String(consommation.materiel_id??consommation.materielId);
  totaux.set(id,(totaux.get(id)||0)+Number(consommation.quantite||0));
 }
 return [...new Set(materiels.filter(m=>{
  if(!(totaux.get(String(m.id))>0))return false;
  if(typeof obtenirEtatStockHistorique==="function")return !!obtenirEtatStockHistorique(m).classeAlerte;
  return m.gere_stock_pharmacie===false||Number(m.stock)===0||
   Number(m.minimum)>0&&Number(m.stock)<=Number(m.minimum);
 }).map(m=>"stock:"+m.id))];
}
function stockLocal() {
 if(typeof profilUtilisateurConnecte!=="undefined"&&String(profilUtilisateurConnecte?.id||"")!==uid())return null;
 if(!utilisateurAPermission("acces_historique"))return [];
 if(typeof materiels==="undefined"||!materiels.length||typeof historique==="undefined")return null;
 return referencesStockEnAlerte(materiels,historique.flatMap(i=>i.consommations||[]));
}
async function stock() {
 if(!utilisateurAPermission("acces_historique"))return [];
 const local=stockLocal();
 if(local!==null)return local;
 const [materiels,consommations]=await Promise.all([
  toutesLesLignes(()=>obtenirClientSupabase().from("materiels").select("id,stock,minimum,gere_stock_pharmacie").order("id")),
  toutesLesLignes(()=>obtenirClientSupabase().from("consommations").select("id,materiel_id,quantite").order("id"))
 ]);
 return referencesStockEnAlerte(materiels,consommations);
}
async function complementaire() {
 const rows=await toutesLesLignes(()=>obtenirClientSupabase().from("cis_vsav_suivi_complementaire")
  .select("id,resolu_at").is("resolu_at",null).order("id"));
 return rows.map(r=>"complementaire:"+r.id);
}
async function caserne(compte) {
 if(!utilisateurAPermission("acces_espace_caserne"))return [];
 const iso=new Date().toISOString();
 const rows=await toutesLesLignes(()=>obtenirClientSupabase().from("caserne_publications")
  .select("id,type_publication,visibilite,date_evenement,date_preparation,demande_reponse,demande_reponse_preparation")
  .or("date_evenement.gte."+iso+",date_preparation.gte."+iso).order("id"));
 const visibles=rows.filter(p=>{
  const rubrique=obtenirRubriquesCaserne().find(r=>r[0]===p.type_publication);
  if(!rubrique||!utilisateurPeutVoirRubriqueCaserne(rubrique))return false;
  return p.type_publication!=="amical"||p.visibilite!=="membre"||utilisateurAPermission("acces_amical_membre")||utilisateurAPermission("acces_amical_admin");
 });
 const reponses=[];
 for(let i=0;i<visibles.length;i+=200){
  const ids=visibles.slice(i,i+200).map(p=>p.id);
  const lot=await toutesLesLignes(()=>obtenirClientSupabase().from("caserne_reponses").select("id,publication_id,contexte,reponse").eq("user_id",compte).in("publication_id",ids).order("id"));
  reponses.push(...lot);
 }
 const maintenant=Date.now();
 return visibles.filter(p=>{
  const repondu=contexte=>reponses.some(r=>r.publication_id===p.id&&r.contexte===contexte&&["present","absent"].includes(r.reponse));
  return p.demande_reponse&&new Date(p.date_evenement).getTime()>=maintenant&&!repondu("evenement")||
   p.demande_reponse_preparation&&new Date(p.date_preparation).getTime()>=maintenant&&!repondu("preparation");
 }).map(p=>({id:"caserne:"+p.id,type:p.type_publication}));
}
async function actualiser(forcer=false) {
 synchroniserCompte();
 const compte=owner;
 if(!compte)return;
 if(!navigator.onLine){
  if(utilisateurAPermission("acces_historique")&&typeof materiels!=="undefined"&&materiels.length){
   if(typeof historique!=="undefined")
    etats.stock=referencesStockEnAlerte(materiels,historique.flatMap(i=>i.consommations||[]));
   sauvegarder();dessiner();
  }
  return;
 }
 if(enCours||!obtenirClientSupabase())return;
 if(!forcer&&Date.now()-dernier<10000)return;
 dernier=Date.now();enCours=true;
 const token=generation;
 const travaux=[
  ["hopital",()=>rpc("cis_hopital_lire").then(rows=>(rows||[]).map(h=>"hopital:"+h.id))],
  ["rearmement",()=>rpc("cis_suivi_rearmements_lire").then(rows=>(rows||[]).filter(r=>Number(r.restant)>0).map(r=>"rearmement:"+r.id))],
  ["surveillance",()=>rpc("cis_suivi_surveillance_lire").then(rows=>(rows||[]).filter(r=>r.source!=="utilisation_pharmacie").map(r=>"surveillance:"+(r.id||[r.materiel_id,r.vehicule_id,r.zone_id,r.nom,r.source].join(":"))))],
  ["complementaire",complementaire],["stock",stock],["caserne",()=>caserne(compte)],
  ["formation",()=>rpc("cis_formation_compteur_lire")]
 ];
 try{
  const resultats=await Promise.allSettled(travaux.map(([,fn])=>fn()));
  if(compte!==uid()||token!==generation)return;
  resultats.forEach((resultat,i)=>{
   const type=travaux[i][0];
   if(resultat.status!=="fulfilled"){console.warn("Compteur "+type,resultat.reason?.message||resultat.reason);return;}
   if(type==="formation"){demandes=resultat.value||[];etats.formation=demandes.map(d=>"formation:"+d.id);}
   else etats[type]=resultat.value;
  });
  sauvegarder();dessiner();void marquerFormations();
 }finally{enCours=false;if(uid()!==owner||token!==generation){synchroniserCompte();programmer();}}
}
async function marquerFormations() {
 const compte=owner;
 const visibles=affichages.filter(d=>d.compte===compte);
 const aLire=demandes.filter(d=>visibles.some(v=>v.id===String(d.id)&&v.statut===d.statut));
 await Promise.allSettled(aLire.map(async d=>{
  const cleLecture=compte+":"+d.id+":"+d.empreinte;
  if(lectures.has(cleLecture))return;
  lectures.add(cleLecture);
  try{
   await rpc("cis_formation_compteur_lire_statut",{p_id:String(d.id),p_empreinte:d.empreinte});
   if(compte!==uid()||compte!==owner)return;
   demandes=demandes.filter(x=>x.id!==d.id||x.empreinte!==d.empreinte);
   etats.formation=demandes.map(x=>"formation:"+x.id);
   sauvegarder();dessiner();
  }catch(e){console.warn("Lecture du statut de formation",e.message);}
  finally{lectures.delete(cleLecture);}
 }));
}
function formationsAffichees(rows) {
 synchroniserCompte();
 affichages=(rows||[]).map(d=>({compte:owner,id:String(d.id),statut:d.statut}));
 void marquerFormations();
}
function programmer() {
 if(timer)return;
 timer=setTimeout(()=>{timer=null;void actualiser();},500);
}
const obs=new MutationObserver(changements=>{
 const pertinent=changements.some(c=>
  !c.target.closest?.(".cis-compteur-bulle")&&
  [...c.addedNodes,...c.removedNodes].some(n=>!(n.nodeType===1&&n.classList?.contains("cis-compteur-bulle")))
 );
 if(!pertinent)return;
 if(!document.querySelector("#formations-principale"))affichages=[];
 planifierRendu();programmer();
});
obs.observe(document.body,{childList:true,subtree:true});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)void actualiser(true);});
g.addEventListener("online",()=>void actualiser(true));
setInterval(()=>{synchroniserCompte();if(!document.hidden)void actualiser();},25000);
g.CISCompteurs={actualiser,formationsAffichees,rafraichir:()=>{planifierRendu();programmer();}};
synchroniserCompte();programmer();
})(window);
