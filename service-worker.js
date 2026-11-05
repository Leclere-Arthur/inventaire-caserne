"use strict";
importScripts("./notifications-history.js?v=pharmacie-vsav-prod-20261030-v1");

// Nouvelle version : force le renouvellement du cache applicatif sans effacer les données locales.
const CACHE_NAME = "cis-spv-sync-20261105-v1";
const FICHIERS_APPLICATION = [
 "./maintenance-client.js","./interface-personnelle.js","./equipe-evolution.js",
 "./peremptions-controle.js?v=1","./inventaire-technique.js?v=sous-coffres-prod-20261031-v1","./inventaire-technique.css",
 "./","./index.html","./scan-peremption.js?v=auto-datamatrix-v16","./vendor/zxing-reader.js","./vendor/zxing_reader.wasm",
 "./vsav-sans-stock.js?v=pharmacie-vsav-prod-20261030-v1","./suivi-vsav.js?v=pharmacie-vsav-prod-20261030-v1",
 "./app.js?v=correctif-spv-sync-20261105-v1","./pharmacie-categories.js?v=correctif-spv-sync-20261105-v1",
 "./formations-commun.js","./formations.js?v=sous-coffres-prod-20261031-v1","./formations.css",
 "./travail-equipe.js?v=sous-coffres-prod-20261031-v1","./fiche-garde.js?v=sous-coffres-prod-20261031-v1","./fiche-garde-pdf.js","./fiche-garde.css","./fiche-fin-garde-modele.pdf",
 "./pilotage-suivi.js","./pilotage-mesures.js","./messages-application.js","./nettoyage-sync.js","./notifications-history.js",
 "./style.css","./manifest.json","./supabase-config.js","./icon-192.png","./icon-512.png","./apple-touch-icon.png",
 "./profil-logo-admin.png","./profil-logo-pilotage.svg","./fond-connexion.png","./fond-connexion-pc.png","./logo-version-pc.png","./plan-caserne.png"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.all(FICHIERS_APPLICATION.map(async fichier=>{
  const reponse=await fetch(new Request(fichier,{cache:"reload"}));
  if(!reponse||!reponse.ok)throw new Error("Impossible de mettre à jour : "+fichier);
  await cache.put(fichier,reponse.clone());
 }))));
});
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting();});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(noms=>Promise.all(noms.filter(n=>n!==CACHE_NAME&&/^(?:cis-|inventaire-caserne-)/.test(n)).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('push',event=>{
 let data={};try{data=event.data?event.data.json():{};}catch(_){data={body:event.data?.text()||''};}
 if(!data||typeof data!=='object')data={body:String(data||'')};
 event.waitUntil((async()=>{
  let record=null;
  try{const subscription=await self.registration.pushManager.getSubscription();const owner=await CISNotifications.owner(subscription?.endpoint);record=await CISNotifications.receive(data,owner);}catch(e){console.warn('Historique Push indisponible',e);}
  const url=new URL('./',self.registration.scope);if(record)url.searchParams.set('notification',record.id);
  if(!record?.duplicate)await self.registration.showNotification(data.title||'Inventaire Caserne',{
   ...(data.tag?{tag:String(data.tag)}:{}),body:data.body||'Nouvelle notification',icon:data.icon||'./icon-192.png',badge:data.badge||'./icon-192.png',
   data:{url:record?url.href:(data.url||'./'),notificationId:record?.id||null,userId:record?.userId||null}
  });
  if(record){const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows)client.postMessage({type:'CIS_NOTIFICATIONS_UPDATED',userId:record.userId});}
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const data=event.notification.data||{};let url;
  try{url=new URL(data.url||'./',self.registration.scope);if(url.origin!==self.location.origin)url=new URL('./',self.registration.scope);}catch(_){url=new URL('./',self.registration.scope);}
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){
   if(!client.url.startsWith(self.registration.scope))continue;
   if(data.notificationId){client.postMessage({type:'CIS_OPEN_NOTIFICATION',id:data.notificationId});return client.focus();}
   if('navigate' in client)await client.navigate(url.href);return client.focus();
  }
  return self.clients.openWindow(url.href);
 })());
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 // Ne jamais intercepter Supabase ni les ressources de domaines externes.
 if(url.origin!==self.location.origin)return;
 event.respondWith(fetch(new Request(event.request,{cache:"no-store"})).then(async reponse=>{
  if(reponse&&reponse.status===200&&reponse.type!=="opaque"){
   const cache=await caches.open(CACHE_NAME);await cache.put(event.request,reponse.clone());
  }
  return reponse;
 }).catch(async()=>{
  const cached=await caches.match(event.request,{ignoreSearch:url.pathname.endsWith("/plan-caserne.png")});
  if(cached)return cached;
  if(event.request.mode==="navigate")return caches.match("./index.html");
  return new Response("",{status:503,statusText:"Hors connexion"});
 }));
});
