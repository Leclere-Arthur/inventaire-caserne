(function (g) {
"use strict";
const esc = value => echapperHTML(String(value ?? ""));

function calculerManque(materiel, quantite) {
 if (materiel.gere_stock_pharmacie === false) return quantite;
 return materiel.autoriser_depassement_stock
  ? Math.max(0, quantite - Number(materiel.stock || 0)) : 0;
}

async function preparer(consommations) {
 const demandes = consommations.filter(({materiel}) => materiel.gere_stock_pharmacie === false || materiel.autoriser_depassement_stock === true);
 if (!demandes.length) return {};
 const owner = String(utilisateurConnecte?.id || "");
 const cacheKey = "cis-vsav-retour-options:" + owner;
 let correspondances, configurations, stocks;
 if (navigator.onLine) {
  const client = obtenirClientSupabase();
  [correspondances, configurations, stocks] = await Promise.all([
   client.rpc("vsav_correspondances_inventaire"),
   client.rpc("cis_qr_config_lire"),
   client.from("materiels").select("id,stock,gere_stock_pharmacie,autoriser_depassement_stock,inventaire_vsav_materiel_id,autres_inventaire_vsav_materiel_ids")
    .in("id", demandes.map(x => x.materiel.id))
  ]);
  for (const resultat of [correspondances, configurations, stocks]) if (resultat.error) throw resultat.error;
  if (owner !== String(utilisateurConnecte?.id || "")) throw Error("Le compte a changé. Rouvre le retour.");
  try {
   localStorage.setItem(cacheKey, JSON.stringify({correspondances:correspondances.data, configurations:configurations.data}));
  } catch (_) {}
 } else {
  const cache = JSON.parse(localStorage.getItem(cacheKey) || "null");
  if (!cache) throw Error("Connecte-toi une première fois pour charger les emplacements et la configuration QR de ce compte.");
  correspondances = {data:cache.correspondances};
  configurations = {data:cache.configurations};
  stocks = {data:demandes.map(x => x.materiel)};
 }
 const suivis = new Set((configurations.data || []).filter(x => x.actif).map(x => String(x.materiel_id)));
 const resultats = {};
 for (const demande of demandes) {
  const actuel = stocks.data.find(x => String(x.id) === String(demande.materiel.id));
  if (!actuel) throw Error("Matériel indisponible. Actualise l’inventaire.");
  const manque = calculerManque(actuel, demande.quantite);
  if (!manque) continue;
  const liens = new Set([actuel.inventaire_vsav_materiel_id, ...(actuel.autres_inventaire_vsav_materiel_ids || [])].filter(Boolean));
  const options = (correspondances.data || []).filter(x => liens.has(x.id));
  if (liens.size && options.length !== liens.size) throw Error("Un rattachement VSAV est indisponible pour " + demande.materiel.nom + ". Vérifie sa fiche.");
  const suiviQR = suivis.has(String(actuel.id));
  if (suiviQR && !navigator.onLine) throw Error("Connecte-toi pour vérifier le QR de chaque matériel utilisé.");

  if (!liens.size && !suiviQR) continue;
  const unites = await demander(demande.materiel, manque, options, suiviQR);
  if (unites === null) return null;
  if (owner !== String(utilisateurConnecte?.id || "")) throw Error("Le compte a changé. Rouvre le retour.");
  resultats[String(actuel.id)] = unites;
 }
 return resultats;
}

function demander(materiel, quantite, options, suiviQR) {
 return new Promise(resolve => {
  const dialog = document.createElement("div");
  dialog.style.cssText = "position:fixed;inset:0;z-index:200000;background:#0008;display:grid;place-items:center;padding:16px";
  dialog.innerHTML = `<form role="dialog" aria-modal="true" aria-label="Emplacements manquants" style="background:white;color:#20303a;border-radius:16px;padding:20px;max-width:560px;width:100%;box-sizing:border-box;max-height:85dvh;overflow:auto">
   <h2>${esc(materiel.nom)}</h2><p>${quantite} unité(s) à remplacer sans réserve disponible.</p>
   <div data-unites></div><p data-statut role="status"></p>
   <button type="submit" class="equipe-action-button">Confirmer les emplacements</button>
   <button type="button" class="equipe-action-button" data-annuler>Annuler le retour</button>
  </form>`;
  const unites = Array.from({length:quantite}, () => ({inventaire_id:null, libelle:"", qr:null}));
  const host = dialog.querySelector("[data-unites]");
  const labels = new Map(options.map(x => [String(x.id), [x.vehicule,x.zone,x.nom].filter(Boolean).join(" › ")]));
  unites.forEach((unite, index) => {
   const section = document.createElement("fieldset");
   section.style.cssText = "margin:14px 0;padding:12px";
   section.innerHTML = `<legend>Unité manquante ${index + 1}</legend>
    ${options.length ? `<label>Où manque cette unité ?<select required style="width:100%;font:inherit;padding:12px"><option value="">Choisir un emplacement</option>${options.map(x => `<option value="${esc(x.id)}">${esc(labels.get(String(x.id)))}</option>`).join("")}</select></label>` : "<p>Aucun rattachement VSAV configuré.</p>"}
    ${suiviQR ? '<p>Scanne le QR du matériel utilisé, devenu manquant.</p><button type="button" class="equipe-action-button" data-scan>Scanner le QR utilisé</button><p data-code role="status" aria-live="polite"></p>' : ""}`;
   const select = section.querySelector("select");
   if (select) select.onchange = () => {
    unite.inventaire_id = select.value || null;
    unite.libelle = labels.get(select.value) || "";
   };
   if (suiviQR) section.querySelector("[data-scan]").onclick = () => {
    void g.CISQR.scannerUtilise(async code => {
     const statut = section.querySelector("[data-code]");
     try {
      const {data:fiche, error} = await obtenirClientSupabase().rpc("cis_qr_fiche",{p_code:code});
      if (error) throw error;
      if (!dialog.isConnected) return;
      if (!fiche) throw Error("QR inconnu. Scanne l’étiquette du matériel utilisé.");
      if (String(fiche.materiel_id) !== String(materiel.id)) {
       throw Error("Ce QR ne correspond pas à " + materiel.nom + ". Scanne l’étiquette de ce matériel.");
      }
      if (fiche.etat !== "attribuee") {
       throw Error(fiche.etat === "utilisee"
        ? "Ce QR est déjà déclaré utilisé. Scanne celui de l’unité utilisée pour ce retour."
        : "Ce QR n’est pas attribué à une unité en service. Scanne l’étiquette du matériel utilisé.");
      }
      if (fiche.emplacement !== "vsav") throw Error("Ce QR est enregistré hors du VSAV. Scanne l’unité utilisée dans le VSAV.");
      if (unites.some(x => x !== unite && x.qr === code)) throw Error("Ce QR a déjà été scanné pour une autre unité. Chaque unité doit avoir son propre QR.");
      unite.qr = code;
      statut.style.color = "#176b43";
      statut.style.fontWeight = "700";
      statut.textContent = "QR utilisé · " + code;
     } catch (error) {
      if (!dialog.isConnected) return;
      unite.qr = null;
      statut.style.color = "#b71924";
      statut.style.fontWeight = "700";
      statut.textContent = error.message || "Impossible de vérifier ce QR. Réessaie.";
      statut.scrollIntoView?.({block:"nearest"});
     }
    });
   };
   host.append(section);
  });
  dialog.querySelector("[data-annuler]").onclick = () => {dialog.remove();resolve(null);};
  dialog.querySelector("form").onsubmit = event => {
   event.preventDefault();
   if (suiviQR && unites.some(x => !x.qr)) {
    const statut = dialog.querySelector("[data-statut]");
    statut.style.color = "#b71924";
    statut.style.fontWeight = "700";
    statut.textContent = "Scanne un QR valide et différent pour chaque unité manquante.";
    return;
   }
   dialog.remove();
   resolve(unites);
  };
  document.body.append(dialog);
 });
}

g.CISVSAVEmplacements = {preparer, calculerManque};
})(window);
