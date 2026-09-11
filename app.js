"use strict";

/* =========================================================
   FENETRES PERSONNALISEES CIS LE CHESNE
   Remplace les alert() du navigateur par une fenêtre intégrée
   avec un message qui reprend exactement l'opération effectuée.
   ========================================================= */

function initialiserFenetreCIS() {

    if (document.getElementById("fenetre-cis-style")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "fenetre-cis-style";
    style.textContent = `
        .fenetre-cis-overlay {
            position: fixed;
            inset: 0;
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
            background: rgba(0, 0, 0, .48);
            backdrop-filter: blur(3px);
        }

        .fenetre-cis {
            width: min(92vw, 430px);
            box-sizing: border-box;
            overflow: hidden;
            border-radius: 16px;
            background: #ffffff;
            color: #17202a;
            box-shadow: 0 20px 60px rgba(0, 0, 0, .28);
            animation: fenetreCisEntree .16s ease-out;
        }

        .fenetre-cis-entete {
            padding: 18px 20px 15px;
            background: #111820;
            color: #ffffff;
        }

        .fenetre-cis-entete strong {
            display: block;
            font-size: 17px;
            line-height: 1.2;
        }

        .fenetre-cis-corps {
            padding: 20px;
            font-size: 15px;
            line-height: 1.45;
            white-space: pre-line;
        }

        .fenetre-cis-actions {
            display: flex;
            justify-content: flex-end;
            padding: 0 20px 20px;
        }

        .fenetre-cis-ok {
            min-width: 92px;
            min-height: 42px;
            padding: 9px 18px;
            border: 0;
            border-radius: 9px;
            background: #1f6f4a;
            color: #ffffff;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }

        .fenetre-cis-ok:hover {
            filter: brightness(1.05);
        }

        .fenetre-cis-actions-double {
            gap: 10px;
        }

        .fenetre-cis-annuler {
            min-width: 92px;
            min-height: 42px;
            padding: 9px 18px;
            border: 1px solid #cfd5da;
            border-radius: 9px;
            background: #f2f4f6;
            color: #26313a;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }

        .fenetre-cis-question {
            margin-bottom: 12px;
        }

        .fenetre-cis-input {
            width: 100%;
            min-height: 44px;
            box-sizing: border-box;
            padding: 10px 12px;
            border: 1px solid #c7d0d7;
            border-radius: 8px;
            background: #ffffff;
            color: #17202a;
            font: inherit;
            outline: none;
        }

        .fenetre-cis-input:focus {
            border-color: #1f6f4a;
            box-shadow: 0 0 0 3px rgba(31,111,74,.12);
        }

        .fenetre-cis.succes .fenetre-cis-entete {
            background: #146b43;
        }

        .fenetre-cis.avertissement .fenetre-cis-entete {
            background: #9b6518;
        }

        .fenetre-cis.erreur .fenetre-cis-entete {
            background: #9f2832;
        }

        @keyframes fenetreCisEntree {
            from {
                opacity: 0;
                transform: translateY(8px) scale(.985);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;

    document.head.appendChild(style);
}


function determinerTypeFenetreCIS(message) {

    const texte =
        String(message || "").toLowerCase();

    if (
        texte.includes("erreur") ||
        texte.includes("échou") ||
        texte.includes("refus") ||
        texte.includes("impossible")
    ) {
        return "erreur";
    }

    if (
        texte.includes("⚠️") ||
        texte.includes("attention") ||
        texte.includes("hors connexion")
    ) {
        return "avertissement";
    }

    if (
        texte.includes("✅") ||
        texte.includes("succès") ||
        texte.includes("enregistré") ||
        texte.includes("ajouté") ||
        texte.includes("supprimé") ||
        texte.includes("modifié") ||
        texte.includes("effectué")
    ) {
        return "succes";
    }

    return "information";
}



function afficherConfirmationCIS(message) {

    initialiserFenetreCIS();

    return new Promise(function (resolve) {

        const ancienne =
            document.querySelector(
                ".fenetre-cis-overlay"
            );

        if (ancienne) {
            ancienne.remove();
        }

        const overlay =
            document.createElement("div");

        overlay.className =
            "fenetre-cis-overlay";

        const contenu =
            document.createElement("div");

        contenu.className =
            "fenetre-cis information";

        const entete =
            document.createElement("div");

        entete.className =
            "fenetre-cis-entete";

        entete.innerHTML =
            "<strong>CIS Le Chesne</strong>";

        const corps =
            document.createElement("div");

        corps.className =
            "fenetre-cis-corps";

        corps.textContent =
            String(message || "");

        const actions =
            document.createElement("div");

        actions.className =
            "fenetre-cis-actions fenetre-cis-actions-double";

        const annuler =
            document.createElement("button");

        annuler.type = "button";
        annuler.className =
            "fenetre-cis-annuler";
        annuler.textContent =
            "Annuler";

        const confirmer =
            document.createElement("button");

        confirmer.type = "button";
        confirmer.className =
            "fenetre-cis-ok";
        confirmer.textContent =
            "Confirmer";

        let termine = false;

        const fermer =
            function (valeur) {

                if (termine) {
                    return;
                }

                termine = true;
                overlay.remove();
                resolve(valeur);

            };

        annuler.addEventListener(
            "click",
            function () {
                fermer(false);
            }
        );

        confirmer.addEventListener(
            "click",
            function () {
                fermer(true);
            }
        );

        overlay.addEventListener(
            "click",
            function (event) {

                if (event.target === overlay) {
                    fermer(false);
                }

            }
        );

        const gestionTouche =
            function (event) {

                if (event.key === "Escape") {

                    document.removeEventListener(
                        "keydown",
                        gestionTouche
                    );

                    fermer(false);

                } else if (event.key === "Enter") {

                    document.removeEventListener(
                        "keydown",
                        gestionTouche
                    );

                    fermer(true);

                }

            };

        document.addEventListener(
            "keydown",
            gestionTouche
        );

        actions.appendChild(annuler);
        actions.appendChild(confirmer);

        contenu.appendChild(entete);
        contenu.appendChild(corps);
        contenu.appendChild(actions);

        overlay.appendChild(contenu);
        document.body.appendChild(overlay);

        window.setTimeout(
            function () {
                confirmer.focus();
            },
            20
        );

    });
}


function afficherSaisieCIS(
    message,
    valeurInitiale = "",
    typeChamp = "text"
) {

    initialiserFenetreCIS();

    return new Promise(function (resolve) {

        const ancienne =
            document.querySelector(
                ".fenetre-cis-overlay"
            );

        if (ancienne) {
            ancienne.remove();
        }

        const overlay =
            document.createElement("div");

        overlay.className =
            "fenetre-cis-overlay";

        const contenu =
            document.createElement("div");

        contenu.className =
            "fenetre-cis information";

        const entete =
            document.createElement("div");

        entete.className =
            "fenetre-cis-entete";

        entete.innerHTML =
            "<strong>CIS Le Chesne</strong>";

        const corps =
            document.createElement("div");

        corps.className =
            "fenetre-cis-corps";

        const texte =
            document.createElement("div");

        texte.className =
            "fenetre-cis-question";

        texte.textContent =
            String(message || "");

        const champ =
            document.createElement("input");

        champ.type = typeChamp === "password" ? "password" : "text";
        champ.className =
            "fenetre-cis-input";
        champ.value =
            String(valeurInitiale || "");

        corps.appendChild(texte);
        corps.appendChild(champ);

        const actions =
            document.createElement("div");

        actions.className =
            "fenetre-cis-actions fenetre-cis-actions-double";

        const annuler =
            document.createElement("button");

        annuler.type = "button";
        annuler.className =
            "fenetre-cis-annuler";
        annuler.textContent =
            "Annuler";

        const valider =
            document.createElement("button");

        valider.type = "button";
        valider.className =
            "fenetre-cis-ok";
        valider.textContent =
            "Valider";

        let termine = false;

        const fermer =
            function (valeur) {

                if (termine) {
                    return;
                }

                termine = true;
                overlay.remove();
                resolve(valeur);

            };

        annuler.addEventListener(
            "click",
            function () {
                fermer(null);
            }
        );

        valider.addEventListener(
            "click",
            function () {
                fermer(champ.value);
            }
        );

        overlay.addEventListener(
            "click",
            function (event) {

                if (event.target === overlay) {
                    fermer(null);
                }

            }
        );

        champ.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();
                    fermer(champ.value);

                } else if (event.key === "Escape") {

                    event.preventDefault();
                    fermer(null);

                }

            }
        );

        actions.appendChild(annuler);
        actions.appendChild(valider);

        contenu.appendChild(entete);
        contenu.appendChild(corps);
        contenu.appendChild(actions);

        overlay.appendChild(contenu);
        document.body.appendChild(overlay);

        window.setTimeout(
            function () {

                champ.focus();
                champ.select();

            },
            20
        );

    });
}


function afficherFenetreCIS(message) {

    initialiserFenetreCIS();

    return new Promise(function (resolve) {

        const ancienne =
            document.querySelector(
                ".fenetre-cis-overlay"
            );

        if (ancienne) {
            ancienne.remove();
        }

        const type =
            determinerTypeFenetreCIS(message);

        const overlay =
            document.createElement("div");

        overlay.className =
            "fenetre-cis-overlay";

        const contenu =
            document.createElement("div");

        contenu.className =
            "fenetre-cis " + type;

        const entete =
            document.createElement("div");

        entete.className =
            "fenetre-cis-entete";

        entete.innerHTML =
            "<strong>CIS Le Chesne</strong>";

        const corps =
            document.createElement("div");

        corps.className =
            "fenetre-cis-corps";

        corps.textContent =
            String(message || "");

        const actions =
            document.createElement("div");

        actions.className =
            "fenetre-cis-actions";

        const ok =
            document.createElement("button");

        ok.type = "button";
        ok.className =
            "fenetre-cis-ok";
        ok.textContent = "OK";

        const fermer =
            function () {

                overlay.remove();
                resolve();

            };

        ok.addEventListener(
            "click",
            fermer
        );

        overlay.addEventListener(
            "click",
            function (event) {

                if (event.target === overlay) {
                    fermer();
                }

            }
        );

        document.addEventListener(
            "keydown",
            function gestionTouche(event) {

                if (
                    event.key === "Enter" ||
                    event.key === "Escape"
                ) {
                    document.removeEventListener(
                        "keydown",
                        gestionTouche
                    );
                    fermer();
                }

            }
        );

        actions.appendChild(ok);
        contenu.appendChild(entete);
        contenu.appendChild(corps);
        contenu.appendChild(actions);
        overlay.appendChild(contenu);
        document.body.appendChild(overlay);

        window.setTimeout(
            function () {
                ok.focus();
            },
            20
        );

    });
}


/*
 * Tous les anciens alert() de l'application passent maintenant
 * par la fenêtre CIS Le Chesne. Le texte reste celui de l'action
 * réelle : retour enregistré, stock ajouté, utilisateur modifié, etc.
 */
window.alert = function (message) {

    afficherFenetreCIS(message);

};



/* =========================================================
   INVENTAIRE CASERNE
   APP.JS COMPLET
   ========================================================= */

/*
 * Authentification et rôles
 */
const DOMAINE_EMAIL_INTERNE =
    "inventaire-caserne.local";

const VERSION_APPLICATION =
    "2.9.17";

const CLE_PROFIL_UTILISATEUR_CACHE =
    "profil_utilisateur_connecte_v1";

let utilisateurConnecte = null;
let profilUtilisateurConnecte = null;
let connexionApplicationEnCours = false;

/*
 * Notifications Web Push
 * Compatible PWA Android + iPhone/iPad (iOS/iPadOS 16.4+,
 * lorsque l'application est ajoutée à l'écran d'accueil).
 * La clé VAPID publique peut être présente dans le navigateur.
 */
const VAPID_PUBLIC_KEY =
    "BBl_OlQR456avmsTxk4ywCSvGvedYFaPe4RV8M-evqk6wkEwQFnQIjWHpRFQw74reIo8AazwCgeueutZjDATGCI";

let activationNotificationsEnCours = false;
let envoiNotificationsStockEnCours = false;

const CLE_NOTIFICATIONS_STOCK_EN_ATTENTE =
    "notifications_stock_en_attente_v1";

const STORAGE = {
    materiels: "materiels",
    categories: "categories",
    historique: "historiqueConsommations",
    archivesHistorique: "archives_historique",

    materielsV3: "materiels_v3",
    categoriesV3: "categories_v3",
    historiqueV3: "historique_v3",
    archivesHistoriqueV3: "archives_historique_v3"
};

const CATEGORIES_PAR_DEFAUT = [
    "ROUGE",
    "BLEUE",
    "VERT",
    "JAUNE",
    "CONSOMABLE",
    "EPI",
    "AUTRE"
];

let materiels = [];
let categories = [];
let historique = [];
let archivesHistorique = [];

let consommationsEnCours = {};
let materielEnModification = null;

let validationRetourInterventionEnCours = false;


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    initialiserIndicateurSynchronisation();
    initialiserBandeauConnexion();

    void initialiserSystemeMiseAJourApplication();

    chargerToutesLesDonnees();

    const authentifie =
        await initialiserAuthentificationApplication();

    if (!authentifie) {
        afficherConnexion();
        return;
    }

    initialiserBoutonNotifications();

    await initialiserSynchronisationSupabase();

    afficherAccueil();

});


function chargerToutesLesDonnees() {

    chargerMateriels();
    chargerCategories();
    chargerHistorique();
    chargerArchivesHistorique();

    normaliserToutesLesDonnees();

    sauvegarderToutesLesDonnees();

}





/* =========================================================
   MISE À JOUR DE L'APPLICATION
   ========================================================= */

let inscriptionServiceWorkerApplication =
    null;

let miseAJourApplicationDisponible =
    false;

let activationMiseAJourEnCours =
    false;

let rechargementApresMiseAJourEnCours =
    false;

let verificationMiseAJourEnCours =
    false;

let derniereVerificationMiseAJour =
    0;

let minuteurVerificationMiseAJour =
    null;


function initialiserStyleMiseAJourApplication() {

    if (
        document.getElementById(
            "style-mise-a-jour-application"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );

    style.id =
        "style-mise-a-jour-application";

    style.textContent = `
        .bandeau-mise-a-jour {
            position: fixed;
            left: 14px;
            right: 14px;
            bottom:
                calc(
                    14px +
                    env(safe-area-inset-bottom, 0px)
                );
            z-index: 200000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            max-width: 620px;
            margin: 0 auto;
            padding: 13px 14px;
            box-sizing: border-box;
            border: 1px solid rgba(0,0,0,.09);
            border-radius: 14px;
            background: rgba(255,255,255,.97);
            box-shadow:
                0 10px 30px rgba(0,0,0,.16);
            color: #202124;
        }

        .bandeau-mise-a-jour strong {
            display: block;
            font-size: 14px;
            line-height: 1.3;
        }

        .bandeau-mise-a-jour small {
            display: block;
            margin-top: 3px;
            opacity: .65;
            line-height: 1.3;
        }

        .bandeau-mise-a-jour button {
            flex: 0 0 auto;
            min-height: 40px;
            border: 0;
            border-radius: 10px;
            padding: 8px 12px;
            background: #1687ff;
            color: #fff;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
            touch-action: manipulation;
        }

        .bandeau-mise-a-jour button:disabled {
            opacity: .65;
        }

        .profil-mise-a-jour-texte {
            display: block;
            margin-top: 8px;
            color: #6b7077;
            font-size: 13px;
            line-height: 1.35;
        }
    `;


    document.head.appendChild(
        style
    );

}


function afficherBandeauMiseAJourApplication() {

    initialiserStyleMiseAJourApplication();


    if (
        document.getElementById(
            "bandeau-mise-a-jour-application"
        )
    ) {
        return;
    }


    const bandeau =
        document.createElement(
            "div"
        );

    bandeau.id =
        "bandeau-mise-a-jour-application";

    bandeau.className =
        "bandeau-mise-a-jour";

    bandeau.innerHTML = `

        <div>
            <strong>
                Une nouvelle version est disponible
            </strong>

            <small>
                La mise à jour ne supprime pas vos données.
            </small>
        </div>

        <button
            id="btn-bandeau-mise-a-jour"
            type="button"
        >
            Mettre à jour
        </button>

    `;


    bandeau
        .querySelector(
            "#btn-bandeau-mise-a-jour"
        )
        ?.addEventListener(
            "click",
            function () {
                void appliquerMiseAJourApplication();
            }
        );


    document.body.appendChild(
        bandeau
    );

}


function signalerMiseAJourApplicationDisponible() {

    miseAJourApplicationDisponible =
        true;

    afficherBandeauMiseAJourApplication();

    mettreAJourEtatBoutonMiseAJourProfil(
        "Nouvelle version disponible."
    );

}


function surveillerInscriptionServiceWorker(
    inscription
) {

    if (!inscription) {
        return;
    }


    if (inscription.waiting) {
        signalerMiseAJourApplicationDisponible();
    }


    inscription.addEventListener(
        "updatefound",
        function () {

            const nouveauWorker =
                inscription.installing;


            if (!nouveauWorker) {
                return;
            }


            nouveauWorker.addEventListener(
                "statechange",
                function () {

                    if (
                        nouveauWorker.state ===
                        "installed" &&
                        navigator.serviceWorker.controller
                    ) {

                        signalerMiseAJourApplicationDisponible();

                    }

                }
            );

        }
    );

}


async function obtenirInscriptionServiceWorkerApplication() {

    if (
        !(
            "serviceWorker" in navigator
        )
    ) {
        return null;
    }


    if (
        inscriptionServiceWorkerApplication
    ) {
        return inscriptionServiceWorkerApplication;
    }


    try {

        inscriptionServiceWorkerApplication =
            await navigator.serviceWorker.register(
                "./service-worker.js",
                {
                    updateViaCache:
                        "none"
                }
            );


        surveillerInscriptionServiceWorker(
            inscriptionServiceWorkerApplication
        );


        return inscriptionServiceWorkerApplication;

    } catch (erreur) {

        console.warn(
            "Service Worker indisponible :",
            erreur
        );

        return null;

    }

}


async function verifierMiseAJourApplication(
    silencieux = true,
    forcer = false
) {

    if (!navigator.onLine) {
        if (!silencieux) {
            alert(
                "Une connexion Internet est nécessaire pour rechercher une mise à jour."
            );
        }
        return false;
    }

    if (
        verificationMiseAJourEnCours &&
        !forcer
    ) {
        return miseAJourApplicationDisponible;
    }

    const maintenant = Date.now();

    /*
     * Pour les vérifications automatiques, on évite de relancer
     * plusieurs contrôles à quelques secondes d'intervalle.
     * Le bouton du profil utilise forcer=true et ignore ce délai.
     */
    if (
        !forcer &&
        maintenant - derniereVerificationMiseAJour < 15000
    ) {
        return miseAJourApplicationDisponible;
    }

    verificationMiseAJourEnCours = true;
    derniereVerificationMiseAJour = maintenant;

    try {

        const inscription =
            await obtenirInscriptionServiceWorkerApplication();

        if (!inscription) {
            if (!silencieux) {
                alert(
                    "La recherche de mise à jour n'est pas disponible sur cet appareil."
                );
            }
            return false;
        }

        if (inscription.waiting) {
            signalerMiseAJourApplicationDisponible();
            return true;
        }

        /*
         * registration.update() demande explicitement au navigateur
         * de recontrôler service-worker.js sur le réseau.
         */
        try {
            await inscription.update();
        } catch (erreur) {
            console.warn(
                "Recherche de mise à jour impossible :",
                erreur
            );

            if (!silencieux) {
                alert(
                    "Impossible de rechercher une mise à jour pour le moment."
                );
            }
            return false;
        }

        /*
         * Sur iPhone, l'installation peut prendre plusieurs secondes.
         * On attend jusqu'à 20 secondes et on surveille directement
         * l'état du nouveau Service Worker.
         */
        const trouvee = await new Promise(
            function (resolve) {

                let termine = false;

                function finir(valeur) {
                    if (termine) {
                        return;
                    }
                    termine = true;
                    clearInterval(intervalle);
                    clearTimeout(timeout);
                    resolve(valeur);
                }

                function verifierEtat() {

                    if (inscription.waiting) {
                        signalerMiseAJourApplicationDisponible();
                        finir(true);
                        return;
                    }

                    if (
                        inscription.installing &&
                        inscription.installing.state === "installed"
                    ) {
                        signalerMiseAJourApplicationDisponible();
                        finir(true);
                    }

                }

                const intervalle =
                    setInterval(
                        verifierEtat,
                        250
                    );

                const timeout =
                    setTimeout(
                        function () {
                            finir(false);
                        },
                        20000
                    );

                verifierEtat();
            }
        );

        if (trouvee) {
            return true;
        }

        /*
         * Deuxième contrôle forcé pour les PWA iPhone qui peuvent
         * retarder le premier contrôle après une reprise en avant-plan.
         */
        if (forcer) {
            try {
                await inscription.update();

                await new Promise(
                    function (resolve) {
                        setTimeout(resolve, 1500);
                    }
                );

                if (inscription.waiting) {
                    signalerMiseAJourApplicationDisponible();
                    return true;
                }
            } catch (erreur) {
                console.warn(
                    "Deuxième contrôle de mise à jour impossible :",
                    erreur
                );
            }
        }

        if (!silencieux) {
            mettreAJourEtatBoutonMiseAJourProfil(
                "L'application est déjà à jour."
            );

            alert(
                "L'application est déjà à jour."
            );
        }

        return false;

    } finally {

        verificationMiseAJourEnCours = false;

    }

}


async function appliquerMiseAJourApplication() {

    if (activationMiseAJourEnCours) {
        return;
    }


    activationMiseAJourEnCours =
        true;


    const boutonBandeau =
        document.getElementById(
            "btn-bandeau-mise-a-jour"
        );

    const boutonProfil =
        document.getElementById(
            "btn-mise-a-jour-profil"
        );


    if (boutonBandeau) {
        boutonBandeau.disabled = true;
        boutonBandeau.textContent =
            "Mise à jour…";
    }


    if (boutonProfil) {
        boutonProfil.disabled = true;
        boutonProfil.textContent =
            "Mise à jour…";
    }


    try {

        const inscription =
            await obtenirInscriptionServiceWorkerApplication();


        if (!inscription) {
            throw new Error(
                "Service Worker indisponible."
            );
        }


        if (!inscription.waiting) {

            const trouvee =
                await verifierMiseAJourApplication(
                    false
                );


            if (!trouvee) {
                return;
            }

        }


        const worker =
            inscription.waiting;


        if (!worker) {
            throw new Error(
                "La nouvelle version n'est pas encore prête."
            );
        }


        rechargementApresMiseAJourEnCours =
            true;


        worker.postMessage({
            type:
                "SKIP_WAITING"
        });


        /*
         * Le rechargement se fera automatiquement
         * dès que le nouveau Service Worker prendra le contrôle.
         */
        setTimeout(
            function () {

                if (
                    rechargementApresMiseAJourEnCours
                ) {
                    const url =
                        new URL(
                            window.location.href
                        );

                    url.searchParams.set(
                        "_maj",
                        Date.now()
                    );

                    window.location.replace(
                        url.toString()
                    );
                }

            },
            4000
        );

    } catch (erreur) {

        console.error(
            "Mise à jour application :",
            erreur
        );

        alert(
            "Impossible d'installer la mise à jour pour le moment."
        );

    } finally {

        activationMiseAJourEnCours =
            false;


        if (boutonBandeau) {
            boutonBandeau.disabled = false;
            boutonBandeau.textContent =
                "Mettre à jour";
        }


        if (boutonProfil) {
            boutonProfil.disabled = false;
            boutonProfil.textContent =
                "Mettre à jour l'application";
        }

    }

}


async function rechercherMiseAJourDepuisProfil() {

    const bouton =
        document.getElementById(
            "btn-mise-a-jour-profil"
        );


    if (bouton) {
        bouton.disabled = true;
        bouton.textContent =
            "Recherche…";
    }


    mettreAJourEtatBoutonMiseAJourProfil(
        "Recherche d'une nouvelle version…"
    );


    try {

        const disponible =
            await verifierMiseAJourApplication(
                true,
                true
            );


        if (disponible) {

            mettreAJourEtatBoutonMiseAJourProfil(
                "Nouvelle version disponible."
            );


            await appliquerMiseAJourApplication();

        } else {

            mettreAJourEtatBoutonMiseAJourProfil(
                "L'application est déjà à jour."
            );


            alert(
                "L'application est déjà à jour."
            );

        }

    } catch (erreur) {

        console.error(
            "Recherche mise à jour depuis le profil :",
            erreur
        );


        mettreAJourEtatBoutonMiseAJourProfil(
            "Recherche impossible pour le moment."
        );


        alert(
            "Impossible de rechercher une mise à jour pour le moment."
        );

    } finally {

        if (
            bouton &&
            !activationMiseAJourEnCours
        ) {
            bouton.disabled = false;
            bouton.textContent =
                "Mettre à jour l'application";
        }

    }

}


function mettreAJourEtatBoutonMiseAJourProfil(
    texte
) {

    const element =
        document.getElementById(
            "etat-mise-a-jour-profil"
        );


    if (element) {
        element.textContent =
            texte;
    }

}


async function initialiserSystemeMiseAJourApplication() {

    if (!("serviceWorker" in navigator)) {
        return;
    }

    initialiserStyleMiseAJourApplication();

    navigator.serviceWorker.addEventListener(
        "controllerchange",
        function () {

            if (rechargementApresMiseAJourEnCours) {

                rechargementApresMiseAJourEnCours = false;

                /*
                 * replace() évite de laisser l'ancienne page dans
                 * l'historique de navigation.
                 */
                const url =
                    new URL(
                        window.location.href
                    );

                url.searchParams.set(
                    "_maj",
                    Date.now()
                );

                window.location.replace(
                    url.toString()
                );
            }

        }
    );

    const inscription =
        await obtenirInscriptionServiceWorkerApplication();

    if (!inscription) {
        return;
    }

    async function verifierMaintenant() {

        if (
            document.visibilityState !== "visible" ||
            !navigator.onLine
        ) {
            return;
        }

        await verifierMiseAJourApplication(
            true,
            false
        );
    }

    /*
     * Vérification peu après le lancement.
     */
    setTimeout(
        function () {
            void verifierMaintenant();
        },
        800
    );

    /*
     * IMPORTANT POUR LES PWA :
     * une application laissée en arrière-plan est suspendue par iOS.
     * Dès qu'elle revient à l'écran, on relance immédiatement le contrôle.
     */
    document.addEventListener(
        "visibilitychange",
        function () {
            if (document.visibilityState === "visible") {
                void verifierMaintenant();
            }
        }
    );

    window.addEventListener(
        "pageshow",
        function () {
            void verifierMaintenant();
        }
    );

    window.addEventListener(
        "focus",
        function () {
            void verifierMaintenant();
        }
    );

    window.addEventListener(
        "online",
        function () {
            void verifierMaintenant();
        }
    );

    /*
     * Tant que l'application reste ouverte au premier plan,
     * on vérifie aussi régulièrement sans avoir besoin de la quitter.
     */
    if (minuteurVerificationMiseAJour) {
        clearInterval(
            minuteurVerificationMiseAJour
        );
    }

    minuteurVerificationMiseAJour =
        setInterval(
            function () {
                void verifierMaintenant();
            },
            60000
        );

}


/* =========================================================
   AUTHENTIFICATION ET RÔLES
   ========================================================= */

function normaliserIdentifiantConnexion(
    valeur
) {

    return String(
        valeur || ""
    )
        .trim()
        .toUpperCase()
        .replace(
            /[^A-Z0-9_-]/g,
            ""
        );

}


function preparerMotDePasseSupabase(motDePasse) {

    const valeur = String(motDePasse ?? "");

    /*
     * Supabase Auth impose 6 caractères minimum.
     * L'utilisateur peut cependant choisir un code plus court.
     * Les codes de 6 caractères ou plus restent inchangés,
     * afin de préserver tous les comptes existants.
     */
    if (valeur.length >= 6) {
        return valeur;
    }

    return valeur + "|CIS|" + valeur.length;

}


function traduireErreurAuthentification(message) {

    const texte = String(message || "").trim();

    if (/password should be at least\s+\d+\s+characters?/i.test(texte)) {
        return "Le code choisi n'a pas pu être accepté.";
    }

    if (/invalid login credentials/i.test(texte)) {
        return "Identifiant ou code incorrect.";
    }

    if (/user already registered/i.test(texte)) {
        return "Cet utilisateur existe déjà.";
    }

    if (/email not confirmed/i.test(texte)) {
        return "Le compte n'est pas encore activé.";
    }

    if (/new password should be different from the old password/i.test(texte) ||
        /same password/i.test(texte)) {
        return "Le nouveau code doit être différent de l'ancien.";
    }

    if (/rate limit/i.test(texte) || /too many requests/i.test(texte)) {
        return "Trop de tentatives. Réessayez dans quelques instants.";
    }

    if (/edge function returned a non-2xx status code/i.test(texte)) {
        return "L'opération n'a pas pu être effectuée.";
    }

    return texte;
}


function construireEmailTechnique(
    identifiant
) {

    return (
        normaliserIdentifiantConnexion(
            identifiant
        ).toLowerCase() +
        "@" +
        DOMAINE_EMAIL_INTERNE
    );

}


function sauvegarderProfilUtilisateurCache() {

    try {

        if (!profilUtilisateurConnecte) {
            localStorage.removeItem(
                CLE_PROFIL_UTILISATEUR_CACHE
            );
            return;
        }

        localStorage.setItem(
            CLE_PROFIL_UTILISATEUR_CACHE,
            JSON.stringify(
                profilUtilisateurConnecte
            )
        );

    } catch (erreur) {

        console.warn(
            "Impossible de sauvegarder le profil utilisateur :",
            erreur
        );

    }

}


function chargerProfilUtilisateurCache() {

    try {

        const texte =
            localStorage.getItem(
                CLE_PROFIL_UTILISATEUR_CACHE
            );

        if (!texte) {
            return null;
        }

        const profil =
            JSON.parse(texte);

        if (
            !profil ||
            profil.actif !== true ||
            !profil.roles
        ) {
            return null;
        }

        return profil;

    } catch (erreur) {

        console.warn(
            "Profil utilisateur en cache illisible :",
            erreur
        );

        return null;

    }

}


function obtenirRoleUtilisateur() {

    if (!profilUtilisateurConnecte) {
        return null;
    }

    const roles =
        profilUtilisateurConnecte.roles;

    return Array.isArray(roles)
        ? roles[0] || null
        : roles || null;

}


function utilisateurEstSPVAdmin() {

    const role =
        obtenirRoleUtilisateur();

    return Boolean(
        profilUtilisateurConnecte &&
        profilUtilisateurConnecte.actif === true &&
        role &&
        String(role.nom || "")
            .trim()
            .toUpperCase() ===
            "SPV ADMIN"
    );

}


function verifierAccesAdministrateurAppli() {

    if (
        utilisateurEstSPVAdmin()
    ) {
        return true;
    }

    alert(
        "Accès réservé au rôle SPV ADMIN."
    );

    afficherAccueil();

    return false;

}


function utilisateurAPermission(
    permission
) {

    const role =
        obtenirRoleUtilisateur();

    return Boolean(
        profilUtilisateurConnecte &&
        profilUtilisateurConnecte.actif === true &&
        role &&
        role[permission] === true
    );

}


function verifierPermissionOuRetourAccueil(
    permission,
    message
) {

    if (
        utilisateurAPermission(
            permission
        )
    ) {
        return true;
    }

    alert(
        message ||
        "⛔ Vous n'avez pas accès à cette rubrique."
    );

    afficherAccueil();

    return false;

}


async function chargerProfilUtilisateurDepuisSupabase(
    utilisateur
) {

    const supabase =
        obtenirClientSupabase();

    if (
        !supabase ||
        !utilisateur?.id
    ) {
        throw new Error(
            "Supabase indisponible."
        );
    }

    const {
        data,
        error
    } =
        await supabase
            .from(
                "profils_utilisateurs"
            )
            .select(`
                id,
                identifiant,
                nom,
                prenom,
                actif,
                role_id,
                roles (
                    id,
                    nom,
                    acces_inventaire,
                    acces_retour_intervention,
                    acces_historique,
                    acces_archives,
                    acces_administration,
                    acces_ajout_materiel,
                    acces_gestion_materiel,
                    acces_gestion_categories,
                    acces_reapprovisionnement,
                    acces_remise_zero_historique,
                    acces_gestion_utilisateurs,
                    acces_notifications
                )
            `)
            .eq(
                "id",
                utilisateur.id
            )
            .single();

    if (error) {
        throw error;
    }

    if (
        !data ||
        data.actif !== true
    ) {
        throw new Error(
            "Ce compte est désactivé."
        );
    }

    utilisateurConnecte =
        utilisateur;

    profilUtilisateurConnecte =
        data;

    sauvegarderProfilUtilisateurCache();

    return data;

}


async function initialiserAuthentificationApplication() {

    const profilCache =
        chargerProfilUtilisateurCache();


    if (!navigator.onLine) {

        if (profilCache) {

            profilUtilisateurConnecte =
                profilCache;

            utilisateurConnecte = {
                id:
                    profilCache.id
            };

            return true;

        }

        return false;

    }


    const supabase =
        await assurerBibliothequeSupabaseDisponible();

    if (!supabase) {

        if (profilCache) {

            profilUtilisateurConnecte =
                profilCache;

            utilisateurConnecte = {
                id:
                    profilCache.id
            };

            return true;

        }

        return false;

    }


    try {

        const {
            data,
            error
        } =
            await supabase.auth
                .getSession();


        if (error) {
            throw error;
        }


        const session =
            data?.session;


        if (!session?.user) {
            return false;
        }


        await chargerProfilUtilisateurDepuisSupabase(
            session.user
        );


        return true;

    } catch (erreur) {

        console.warn(
            "Session utilisateur non disponible :",
            erreur
        );


        if (profilCache) {

            profilUtilisateurConnecte =
                profilCache;

            utilisateurConnecte = {
                id:
                    profilCache.id
            };

            return true;

        }


        return false;

    }

}


function appliquerVisibiliteElementsConnectes(
    connecte
) {

    const synchronisation =
        document.getElementById(
            "indicateur-synchronisation"
        );

    if (synchronisation) {
        synchronisation.style.display =
            connecte
                ? ""
                : "none";
    }


    const notifications =
        document.getElementById(
            "btn-notifications-push"
        );

    if (notifications) {
        notifications.style.display =
            connecte
                ? ""
                : "none";
    }

}


function initialiserStyleConnexion() {

    if (
        document.getElementById(
            "style-auth-utilisateurs"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );

    style.id =
        "style-auth-utilisateurs";

    style.textContent = `
        html,
        body {
            min-height: 100%;
        }

        html {
            min-height: 100%;
            background: #ffffff;
        }

        body.mode-connexion {
            min-height: 100vh;
            min-height: 100dvh;
            margin: 0;
            background-color: #ffffff;
            background-image:
                url("./fond-connexion.png");
            background-position:
                center center;
            background-size:
                cover;
            background-repeat:
                no-repeat;
            background-attachment:
                scroll;
        }

        body.mode-connexion #app {
            min-height: 100vh;
            min-height: 100dvh;
            background: transparent;
        }

        @media (min-width: 1000px) {
            body.mode-connexion {
                background-image:
                    url("./fond-connexion-pc.png");
                background-position:
                    center center;
                background-size:
                    cover;
                background-repeat:
                    no-repeat;
            }
        }

        .connexion-page {
            min-height: 100vh;
            min-height: 100dvh;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            padding:
                calc(24px + env(safe-area-inset-top, 0px))
                22px
                calc(24px + env(safe-area-inset-bottom, 0px));
            background: transparent;
        }

        .connexion-carte {
            width: min(100%, 370px);
            box-sizing: border-box;
            padding: 22px 20px 22px;
            border-radius: 22px;
            background: rgba(255,255,255,.76);
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
            box-shadow:
                0 16px 38px rgba(0,0,0,.12);
            border:
                1px solid rgba(255,255,255,.82);
        }

        .connexion-titre {
            text-align: center;
            margin-bottom: 18px;
        }

        .connexion-titre h1 {
            margin: 0;
            font-size: 18px;
            line-height: 1.2;
            font-weight: 800;
        }

        .connexion-titre p {
            display: none;
        }

        .connexion-carte label {
            display: block;
            margin: 13px 0 7px;
            font-weight: 750;
            font-size: 14px;
        }

        .connexion-carte input,
        .profil-page input,
        .gestion-utilisateurs-page input,
        .gestion-utilisateurs-page select {
            width: 100%;
            box-sizing: border-box;
            min-height: 50px;
            border: 1px solid #d9dde3;
            border-radius: 13px;
            padding: 11px 13px;
            font: inherit;
            background: rgba(255,255,255,.94);
            outline: none;
        }

        .connexion-carte input:focus,
        .profil-page input:focus {
            border-color: #d92121;
            box-shadow:
                0 0 0 3px rgba(217,33,33,.10);
        }

        .connexion-bouton {
            width: 100%;
            min-height: 50px;
            margin-top: 20px;
            border: 0;
            border-radius: 13px;
            background: #d91f1f;
            color: #fff;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
            box-shadow:
                0 7px 18px rgba(217,31,31,.22);
        }

        .connexion-bouton:disabled {
            opacity: .65;
            cursor: default;
        }

        .connexion-erreur {
            display: none;
            margin-top: 14px;
            padding: 11px 12px;
            border-radius: 12px;
            background: rgba(255,227,227,.95);
            color: #8a1111;
            font-weight: 700;
            font-size: 14px;
        }

        .utilisateur-entete {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            margin-bottom: 18px;
        }

        .bouton-profil-accueil {
            appearance: none;
            -webkit-appearance: none;
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            width: auto;
            max-width: 78%;
            border: 1px solid rgba(0,0,0,.08);
            border-radius: 13px;
            background: rgba(255,255,255,.92);
            box-shadow:
                0 3px 10px rgba(0,0,0,.06);
            margin: 0;
            padding: 9px 12px;
            text-align: left;
            cursor: pointer;
            color: inherit;
            font: inherit;
            -webkit-tap-highlight-color: transparent;
        }

        .bouton-profil-accueil:active {
            transform: scale(.985);
            background: #f3f4f6;
        }

        .bouton-profil-accueil strong {
            display: block;
            width: 100%;
            font-size: 16px;
            line-height: 1.2;
            white-space: nowrap;
        }

        .bouton-profil-accueil span {
            display: block;
            width: 100%;
            margin-top: 4px;
            font-size: 12px;
            line-height: 1.2;
            opacity: .62;
            font-weight: 750;
            letter-spacing: .02em;
            white-space: nowrap;
        }

        .retour-button {
            appearance: none;
            -webkit-appearance: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            min-height: 40px;
            padding: 8px 13px;
            border: 1px solid rgba(0,0,0,.09);
            border-radius: 12px;
            background: #ffffff;
            box-shadow:
                0 3px 10px rgba(0,0,0,.06);
            color: #202124;
            font: inherit;
            font-weight: 750;
            cursor: pointer;
            text-decoration: none;
        }

        .retour-button:active {
            transform: scale(.985);
            background: #f2f3f5;
        }

        .profil-page {
            min-height: 100vh;
            min-height: 100dvh;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        .profil-entete {
            margin: 12px 0 22px;
        }

        .profil-entete h2 {
            margin: 0;
        }

        .profil-entete .profil-role {
            margin-top: 5px;
            opacity: .65;
            font-weight: 700;
        }

        .profil-carte {
            background: #fff;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 16px;
            box-shadow:
                0 5px 18px rgba(0,0,0,.07);
        }

        .profil-identite {
            display: grid;
            gap: 12px;
        }

        .profil-identite-ligne small {
            display: block;
            margin-bottom: 3px;
            opacity: .58;
            font-weight: 700;
        }

        .profil-identite-ligne strong {
            font-size: 18px;
        }

        .profil-carte h3 {
            margin: 0 0 14px;
        }

        .profil-carte label {
            display: block;
            margin: 11px 0 6px;
            font-weight: 700;
            font-size: 14px;
        }

        .profil-notification-ligne {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
        }

        .profil-notification-texte strong {
            display: block;
        }

        .profil-notification-texte small {
            display: block;
            margin-top: 4px;
            opacity: .62;
            line-height: 1.3;
        }

        .switch-notifications {
            position: relative;
            display: inline-block;
            width: 54px;
            height: 31px;
            flex: 0 0 auto;
        }

        .switch-notifications input {
            width: 1px;
            height: 1px;
            opacity: 0;
            position: absolute;
        }

        .switch-notifications span {
            position: absolute;
            inset: 0;
            background: #c7cbd1;
            border-radius: 999px;
            transition: .2s ease;
            cursor: pointer;
        }

        .switch-notifications span::before {
            content: "";
            position: absolute;
            width: 25px;
            height: 25px;
            left: 3px;
            top: 3px;
            border-radius: 50%;
            background: #fff;
            box-shadow:
                0 2px 5px rgba(0,0,0,.2);
            transition: .2s ease;
        }

        .switch-notifications input:checked + span {
            background: #25a244;
        }

        .switch-notifications input:checked + span::before {
            transform: translateX(23px);
        }

        .profil-bouton-principal,
        .profil-bouton-deconnexion {
            width: 100%;
            min-height: 48px;
            border: 0;
            border-radius: 13px;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }

        .profil-bouton-principal {
            margin-top: 16px;
            background: #17191c;
            color: #fff;
        }

        .profil-bouton-deconnexion {
            margin-top: 2px;
            background: #f1f2f4;
            color: #b31212;
        }

        .profil-version {
            margin-top: auto;
            padding:
                22px 0
                calc(10px + env(safe-area-inset-bottom, 0px));
            text-align: center;
            opacity: .42;
            font-size: 12px;
            font-weight: 700;
        }

        .gestion-utilisateurs-page .bloc-admin {
            background: #fff;
            border-radius: 18px;
            padding: 18px;
            margin: 16px 0;
            box-shadow:
                0 5px 18px rgba(0,0,0,.08);
        }

        .gestion-utilisateurs-page .grille-formulaire {
            display: grid;
            gap: 10px;
        }

        .gestion-utilisateurs-page .carte-utilisateur,
        .gestion-utilisateurs-page .carte-role {
            border: 1px solid #e0e3e7;
            border-radius: 14px;
            padding: 14px;
            margin-top: 12px;
        }

        .gestion-utilisateurs-page .ligne-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }

        .gestion-utilisateurs-page .petit-bouton {
            border: 0;
            border-radius: 10px;
            padding: 9px 11px;
            font-weight: 700;
            cursor: pointer;
            background: #e9edf2;
        }

        .gestion-utilisateurs-page .permissions-role {
            display: grid;
            gap: 7px;
            margin-top: 10px;
        }

        .gestion-utilisateurs-page .permissions-role label {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .gestion-utilisateurs-page .permissions-role input {
            width: auto;
            min-height: 0;
        }

        .badge-role {
            display: inline-block;
            margin-top: 4px;
            padding: 4px 8px;
            border-radius: 999px;
            background: #e8f3ff;
            font-size: 12px;
            font-weight: 800;
        }
    `;

    document.head.appendChild(
        style
    );

}

function afficherConnexion() {

    initialiserStyleConnexion();

    document.body.classList.add(
        "mode-connexion"
    );

    appliquerVisibiliteElementsConnectes(
        false
    );


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="connexion-page">

            <section class="connexion-carte">

                <div class="connexion-titre">

                    <h1>
                        Connexion
                    </h1>

                </div>


                <label for="connexion-identifiant">
                    Identifiant
                </label>

                <input
                    id="connexion-identifiant"
                    type="text"
                    autocomplete="username"
                    autocapitalize="characters"
                    placeholder="Identifiant"
                >


                <label for="connexion-mot-de-passe">
                    Mot de passe
                </label>

                <input
                    id="connexion-mot-de-passe"
                    type="password"
                    autocomplete="current-password"
                    placeholder="Mot de passe"
                >


                <button
                    class="connexion-bouton"
                    id="btn-connexion-application"
                    type="button"
                    onclick="seConnecterApplication()"
                >
                    Se connecter
                </button>


                <div
                    class="connexion-erreur"
                    id="connexion-erreur"
                ></div>

            </section>

        </main>

    `;


    const identifiant =
        document.getElementById(
            "connexion-identifiant"
        );

    const motDePasse =
        document.getElementById(
            "connexion-mot-de-passe"
        );


    function gererEntree(
        event
    ) {

        if (
            event.key ===
            "Enter"
        ) {
            void seConnecterApplication();
        }

    }


    identifiant?.addEventListener(
        "keydown",
        gererEntree
    );

    motDePasse?.addEventListener(
        "keydown",
        gererEntree
    );


    identifiant?.focus();

}

async function seConnecterApplication() {

    if (connexionApplicationEnCours) {
        return;
    }


    const champIdentifiant =
        document.getElementById(
            "connexion-identifiant"
        );

    const champMotDePasse =
        document.getElementById(
            "connexion-mot-de-passe"
        );

    const bouton =
        document.getElementById(
            "btn-connexion-application"
        );

    const erreurElement =
        document.getElementById(
            "connexion-erreur"
        );


    const identifiant =
        normaliserIdentifiantConnexion(
            champIdentifiant?.value
        );

    const motDePasse =
        String(
            champMotDePasse?.value ||
            ""
        );


    if (
        !identifiant ||
        !motDePasse
    ) {

        if (erreurElement) {
            erreurElement.textContent =
                "Identifiant et mot de passe obligatoires.";
            erreurElement.style.display =
                "block";
        }

        return;

    }


    if (!navigator.onLine) {

        if (erreurElement) {
            erreurElement.textContent =
                "Une connexion Internet est nécessaire pour une première connexion.";
            erreurElement.style.display =
                "block";
        }

        return;

    }


    connexionApplicationEnCours =
        true;


    if (bouton) {
        bouton.disabled = true;
        bouton.textContent =
            "Connexion…";
    }


    if (erreurElement) {
        erreurElement.style.display =
            "none";
    }


    try {

        const supabase =
            await assurerBibliothequeSupabaseDisponible();


        if (!supabase) {
            throw new Error(
                "Supabase n'est pas disponible."
            );
        }


        let {
            data,
            error
        } =
            await supabase.auth
                .signInWithPassword({
                    email:
                        construireEmailTechnique(
                            identifiant
                        ),
                    password:
                        motDePasse
                });

        if (
            error &&
            String(motDePasse).length < 6
        ) {
            const secondeTentative =
                await supabase.auth
                    .signInWithPassword({
                        email:
                            construireEmailTechnique(
                                identifiant
                            ),
                        password:
                            preparerMotDePasseSupabase(
                                motDePasse
                            )
                    });

            data = secondeTentative.data;
            error = secondeTentative.error;
        }


        if (
            error ||
            !data?.user
        ) {
            throw (
                error ||
                new Error(
                    "Connexion impossible."
                )
            );
        }


        await chargerProfilUtilisateurDepuisSupabase(
            data.user
        );


        initialiserBoutonNotifications();

        appliquerVisibiliteElementsConnectes(
            true
        );

        document.body.classList.remove(
            "mode-connexion"
        );


        await initialiserSynchronisationSupabase();


        afficherAccueil();

    } catch (erreur) {

        console.error(
            "Connexion impossible :",
            erreur
        );


        if (erreurElement) {

            const texte =
                String(
                    erreur?.message ||
                    ""
                );


            if (
                /invalid login credentials/i
                    .test(texte)
            ) {

                erreurElement.textContent =
                    "Identifiant ou mot de passe incorrect.";

            } else {

                erreurElement.textContent =
                    texte ||
                    "Connexion impossible.";

            }


            erreurElement.style.display =
                "block";

        }

    } finally {

        connexionApplicationEnCours =
            false;


        if (bouton) {
            bouton.disabled = false;
            bouton.textContent =
                "Se connecter";
        }

    }

}


async function deconnecterApplication() {

    if (
        !await afficherConfirmationCIS(
            "Voulez-vous vous déconnecter ?"
        )
    ) {
        return;
    }


    try {

        const supabase =
            obtenirClientSupabase();

        if (supabase) {
            await supabase.auth
                .signOut();
        }

    } catch (erreur) {

        console.warn(
            "Déconnexion Supabase :",
            erreur
        );

    }


    utilisateurConnecte =
        null;

    profilUtilisateurConnecte =
        null;

    localStorage.removeItem(
        CLE_PROFIL_UTILISATEUR_CACHE
    );


    afficherConnexion();

}


function obtenirNomUtilisateurAffiche() {

    if (!profilUtilisateurConnecte) {
        return "";
    }


    const prenom =
        String(
            profilUtilisateurConnecte
                .prenom || ""
        ).trim();

    const nom =
        String(
            profilUtilisateurConnecte
                .nom || ""
        ).trim();

    const identifiant =
        String(
            profilUtilisateurConnecte
                .identifiant || ""
        ).trim();


    const complet =
        [prenom, nom]
            .filter(Boolean)
            .join(" ");


    return complet ||
        identifiant;

}



async function desactiverNotificationsPushProfil() {

    if (!navigator.onLine) {
        throw new Error(
            "Une connexion Internet est nécessaire."
        );
    }


    if (!notificationsWebPushDisponibles()) {
        return;
    }


    const abonnement =
        await obtenirAbonnementPushActuel();


    if (!abonnement) {
        return;
    }


    const endpoint =
        abonnement.endpoint;


    const supabase =
        await assurerBibliothequeSupabaseDisponible();


    if (supabase && endpoint) {

        const {
            error
        } =
            await supabase
                .from(
                    "push_subscriptions"
                )
                .update({
                    actif: false,
                    updated_at:
                        new Date()
                            .toISOString()
                })
                .eq(
                    "endpoint",
                    endpoint
                );


        if (error) {
            throw error;
        }

    }


    await abonnement.unsubscribe();

}


async function obtenirEtatNotificationsProfil() {

    if (!notificationsWebPushDisponibles()) {
        return false;
    }


    if (
        Notification.permission !==
        "granted"
    ) {
        return false;
    }


    try {

        const abonnement =
            await obtenirAbonnementPushActuel();

        return Boolean(
            abonnement
        );

    } catch (erreur) {

        console.warn(
            "État notifications profil indisponible :",
            erreur
        );

        return false;

    }

}


async function afficherProfilUtilisateur() {

    if (!profilUtilisateurConnecte) {
        afficherConnexion();
        return;
    }


    initialiserStyleConnexion();


    const role =
        obtenirRoleUtilisateur();

    const nom =
        String(
            profilUtilisateurConnecte.nom || ""
        ).trim();

    const prenom =
        String(
            profilUtilisateurConnecte.prenom || ""
        ).trim();


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page profil-page">

            <button
                class="retour-button"
                type="button"
                onclick="afficherAccueil()"
            >
                ← Retour
            </button>


            <div class="profil-entete">

                <h2>
                    Mon profil
                </h2>

                <div class="profil-role">
                    ${echapperHTML(
                        role?.nom || ""
                    )}
                </div>

            </div>


            <section class="profil-carte profil-identite">

                <div class="profil-identite-ligne">
                    <small>Nom</small>
                    <strong>
                        ${echapperHTML(nom)}
                    </strong>
                </div>

                <div class="profil-identite-ligne">
                    <small>Prénom</small>
                    <strong>
                        ${echapperHTML(prenom)}
                    </strong>
                </div>

            </section>


            <section class="profil-carte">

                <h3>
                    Changer mon mot de passe
                </h3>


                <label for="profil-ancien-mdp">
                    Ancien mot de passe
                </label>

                <input
                    id="profil-ancien-mdp"
                    type="password"
                    autocomplete="current-password"
                >


                <label for="profil-nouveau-mdp">
                    Nouveau mot de passe
                </label>

                <input
                    id="profil-nouveau-mdp"
                    type="password"
                    autocomplete="new-password"
                >


                <label for="profil-confirmation-mdp">
                    Confirmer le nouveau mot de passe
                </label>

                <input
                    id="profil-confirmation-mdp"
                    type="password"
                    autocomplete="new-password"
                >


                <button
                    class="profil-bouton-principal"
                    type="button"
                    onclick="changerMonMotDePasse()"
                >
                    Modifier le mot de passe
                </button>

            </section>


            <section class="profil-carte">

                <div class="profil-notification-ligne">

                    <div class="profil-notification-texte">

                        <strong>
                            Recevoir les notifications
                        </strong>

                        <small id="texte-etat-notifications-profil">
                            Vérification…
                        </small>

                    </div>


                    <label class="switch-notifications">

                        <input
                            id="switch-notifications-profil"
                            type="checkbox"
                            onchange="changerNotificationsProfil(this)"
                        >

                        <span></span>

                    </label>

                </div>

            </section>


            <section class="profil-carte">

                <h3>
                    Mise à jour de l'application
                </h3>

                <button
                    class="profil-bouton-principal"
                    id="btn-mise-a-jour-profil"
                    type="button"
                    onclick="rechercherMiseAJourDepuisProfil()"
                >
                    Mettre à jour l'application
                </button>

                <small
                    class="profil-mise-a-jour-texte"
                    id="etat-mise-a-jour-profil"
                >
                    Appuie ici pour rechercher une nouvelle version.
                </small>

            </section>


            <button
                class="profil-bouton-deconnexion"
                type="button"
                onclick="deconnecterApplication()"
            >
                Déconnexion
            </button>


            <div class="profil-version">
                Version ${echapperHTML(
                    VERSION_APPLICATION
                )}
            </div>

        </main>

    `;


    await rafraichirNotificationsProfil();

}


async function rafraichirNotificationsProfil() {

    const interrupteur =
        document.getElementById(
            "switch-notifications-profil"
        );

    const texte =
        document.getElementById(
            "texte-etat-notifications-profil"
        );


    if (!interrupteur) {
        return;
    }


    if (!notificationsWebPushDisponibles()) {

        interrupteur.checked =
            false;

        interrupteur.disabled =
            true;

        if (texte) {
            texte.textContent =
                "Non disponible sur cet appareil";
        }

        return;

    }


    const actif =
        await obtenirEtatNotificationsProfil();


    interrupteur.checked =
        actif;

    interrupteur.disabled =
        false;


    if (texte) {
        texte.textContent =
            actif
                ? "Activées sur cet appareil"
                : "Désactivées sur cet appareil";
    }

}


async function changerNotificationsProfil(
    interrupteur
) {

    if (!interrupteur) {
        return;
    }


    interrupteur.disabled =
        true;


    try {

        if (interrupteur.checked) {

            await activerNotificationsPush();

        } else {

            await desactiverNotificationsPushProfil();

        }

    } catch (erreur) {

        console.error(
            "Modification notifications profil :",
            erreur
        );

        alert(
            "⚠️ Impossible de modifier les notifications pour le moment."
        );

    } finally {

        await rafraichirNotificationsProfil();

    }

}


async function changerMonMotDePasse() {

    if (!navigator.onLine) {

        alert(
            "⚠️ Une connexion Internet est nécessaire pour changer le mot de passe."
        );

        return;

    }


    const ancien =
        String(
            document.getElementById(
                "profil-ancien-mdp"
            )?.value || ""
        );

    const nouveau =
        String(
            document.getElementById(
                "profil-nouveau-mdp"
            )?.value || ""
        );

    const confirmation =
        String(
            document.getElementById(
                "profil-confirmation-mdp"
            )?.value || ""
        );


    if (
        !ancien ||
        !nouveau ||
        !confirmation
    ) {

        alert(
            "⚠️ Remplis les trois champs."
        );

        return;

    }


    if (
        nouveau !==
        confirmation
    ) {

        alert(
            "⚠️ Les deux nouveaux mots de passe ne correspondent pas."
        );

        return;

    }


    if (
        nouveau.length < 4
    ) {

        alert(
            "⚠️ Le nouveau mot de passe doit contenir au moins 4 caractères."
        );

        return;

    }


    if (
        ancien ===
        nouveau
    ) {

        alert(
            "⚠️ Le nouveau mot de passe doit être différent de l'ancien."
        );

        return;

    }


    try {

        const supabase =
            await assurerBibliothequeSupabaseDisponible();


        if (!supabase) {
            throw new Error(
                "Supabase n'est pas disponible."
            );
        }


        const identifiant =
            profilUtilisateurConnecte
                .identifiant;


        let {
            error: erreurVerification
        } =
            await supabase.auth
                .signInWithPassword({
                    email:
                        construireEmailTechnique(
                            identifiant
                        ),
                    password:
                        ancien
                });

        if (
            erreurVerification &&
            String(ancien).length < 6
        ) {
            const verificationAlternative =
                await supabase.auth
                    .signInWithPassword({
                        email:
                            construireEmailTechnique(
                                identifiant
                            ),
                        password:
                            preparerMotDePasseSupabase(
                                ancien
                            )
                    });

            erreurVerification =
                verificationAlternative.error;
        }


        if (erreurVerification) {

            alert(
                "❌ L'ancien mot de passe est incorrect."
            );

            return;

        }


        const {
            error: erreurModification
        } =
            await supabase.auth
                .updateUser({
                    password:
                        preparerMotDePasseSupabase(nouveau)
                });


        if (erreurModification) {
            throw erreurModification;
        }


        document.getElementById(
            "profil-ancien-mdp"
        ).value = "";

        document.getElementById(
            "profil-nouveau-mdp"
        ).value = "";

        document.getElementById(
            "profil-confirmation-mdp"
        ).value = "";


        alert(
            "✅ Code modifié."
        );

    } catch (erreur) {

        console.error(
            "Changement mot de passe :",
            erreur
        );

        alert(
            "⚠️ " +
            traduireErreurAuthentification(
                erreur?.message ||
                "Impossible de changer le code pour le moment."
            )
        );

    }

}


/* =========================================================
   ENVOI DES NOTIFICATIONS
   ========================================================= */

async function envoyerNotificationPush(
    titre,
    message
) {

    if (!navigator.onLine) {

        throw new Error(
            "Connexion Internet indisponible."
        );

    }


    const supabase =
        await assurerBibliothequeSupabaseDisponible();

    if (!supabase) {

        throw new Error(
            "Supabase n'est pas disponible."
        );

    }


    const { data, error } =
        await supabase.functions.invoke(
            "envoyer-notification",
            {
                body: {
                    titre:
                        String(
                            titre ||
                            "CIS Le Chesne"
                        ),
                    message:
                        String(
                            message || ""
                        )
                }
            }
        );


    if (error) {
        throw error;
    }


    if (
        data &&
        data.ok === false
    ) {

        throw new Error(
            data.error ||
            "L'envoi de la notification a échoué."
        );

    }


    return data;

}


function chargerNotificationsStockEnAttente() {

    try {

        const valeur =
            localStorage.getItem(
                CLE_NOTIFICATIONS_STOCK_EN_ATTENTE
            );

        if (!valeur) {
            return [];
        }


        const liste =
            JSON.parse(valeur);

        return Array.isArray(liste)
            ? liste
            : [];

    } catch (erreur) {

        console.warn(
            "File notifications illisible :",
            erreur
        );

        return [];

    }

}


function sauvegarderNotificationsStockEnAttente(
    liste
) {

    localStorage.setItem(
        CLE_NOTIFICATIONS_STOCK_EN_ATTENTE,
        JSON.stringify(liste)
    );

}


function creerNotificationStockSiNecessaire(
    materiel,
    ancienStock,
    nouveauStock
) {

    const avant =
        Math.max(
            0,
            Math.floor(
                Number(ancienStock) || 0
            )
        );

    const apres =
        Math.max(
            0,
            Math.floor(
                Number(nouveauStock) || 0
            )
        );

    const minimum =
        Math.max(
            0,
            Math.floor(
                Number(materiel.minimum) || 0
            )
        );


    /*
     * Rupture : on prévient uniquement au moment
     * où le stock passe réellement à zéro.
     */
    if (
        apres === 0 &&
        avant > 0
    ) {

        return {
            id:
                genererId(),
            titre:
                "⚠️ ALERTE STOCK ⚠️",
            message:
                "⚠️ " +
                materiel.nom +
                " — RUPTURE DE STOCK ⚠️",
            creeLe:
                new Date().toISOString()
        };

    }


    /*
     * Stock minimum : on prévient uniquement quand
     * le stock franchit le seuil, pour éviter le spam.
     */
    if (
        apres > 0 &&
        apres <= minimum &&
        avant > minimum
    ) {

        return {
            id:
                genererId(),
            titre:
                "⚠️ ALERTE STOCK ⚠️",
            message:
                "⚠️ " +
                materiel.nom +
                " — STOCK MINIMUM ⚠️",
            creeLe:
                new Date().toISOString()
        };

    }


    return null;

}


function mettreNotificationStockEnAttente(
    notification
) {

    if (!notification) {
        return;
    }


    const liste =
        chargerNotificationsStockEnAttente();


    liste.push(
        notification
    );


    sauvegarderNotificationsStockEnAttente(
        liste
    );


    if (navigator.onLine) {

        void envoyerNotificationsStockEnAttente();

    }

}


async function envoyerNotificationsStockEnAttente() {

    if (
        envoiNotificationsStockEnCours ||
        !navigator.onLine
    ) {
        return;
    }


    envoiNotificationsStockEnCours =
        true;


    try {

        let liste =
            chargerNotificationsStockEnAttente();


        while (
            liste.length > 0 &&
            navigator.onLine
        ) {

            const notification =
                liste[0];


            try {

                await envoyerNotificationPush(
                    notification.titre,
                    notification.message
                );

            } catch (erreur) {

                console.warn(
                    "Notification stock conservée en attente :",
                    erreur
                );

                break;

            }


            liste.shift();


            sauvegarderNotificationsStockEnAttente(
                liste
            );

        }

    } finally {

        envoiNotificationsStockEnCours =
            false;

    }

}


function preparerNotificationStock(
    materiel,
    ancienStock
) {

    const notification =
        creerNotificationStockSiNecessaire(
            materiel,
            ancienStock,
            materiel.stock
        );


    if (notification) {

        mettreNotificationStockEnAttente(
            notification
        );

    }

}


/* =========================================================
   NOTIFICATIONS WEB PUSH - IOS + ANDROID
   ========================================================= */

function convertirCleVapidEnUint8Array(cleBase64) {

    const remplissage =
        "=".repeat(
            (4 - cleBase64.length % 4) % 4
        );

    const base64 =
        (cleBase64 + remplissage)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const donneesBrutes =
        window.atob(base64);

    return Uint8Array.from(
        Array.from(donneesBrutes).map(
            function (caractere) {
                return caractere.charCodeAt(0);
            }
        )
    );

}


function notificationsWebPushDisponibles() {

    return (
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );

}


function estAppareilIOS() {

    return (
        /iPhone|iPad|iPod/i.test(
            navigator.userAgent || ""
        ) ||
        (
            navigator.platform === "MacIntel" &&
            navigator.maxTouchPoints > 1
        )
    );

}


function estPwaInstallee() {

    return (
        window.matchMedia &&
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches
    ) ||
    window.navigator.standalone === true;

}


async function obtenirAbonnementPushActuel() {

    if (!notificationsWebPushDisponibles()) {
        return null;
    }

    const inscription =
        await navigator.serviceWorker.ready;

    return inscription.pushManager.getSubscription();

}


function mettreAJourBoutonNotifications(
    bouton,
    etat
) {

    if (!bouton) {
        return;
    }

    bouton.disabled =
        activationNotificationsEnCours;

    if (activationNotificationsEnCours) {

        bouton.textContent =
            "🔔 …";

        bouton.title =
            "Activation des notifications…";

        return;
    }


    if (etat === "active") {

        bouton.textContent =
            "🔔 ✓";

        bouton.title =
            "Notifications activées";

        bouton.setAttribute(
            "aria-label",
            "Notifications activées"
        );

        return;
    }


    if (etat === "bloque") {

        bouton.textContent =
            "🔕";

        bouton.title =
            "Notifications bloquées dans les réglages de l'appareil";

        bouton.setAttribute(
            "aria-label",
            "Notifications bloquées"
        );

        return;
    }


    bouton.textContent =
        "🔔";

    bouton.title =
        "Activer les notifications";

    bouton.setAttribute(
        "aria-label",
        "Activer les notifications"
    );

}


async function rafraichirEtatBoutonNotifications() {

    const bouton =
        document.getElementById(
            "btn-notifications-push"
        );

    if (!bouton) {
        return;
    }

    if (!notificationsWebPushDisponibles()) {

        bouton.hidden = true;
        return;
    }

    bouton.hidden = false;


    if (
        Notification.permission ===
        "denied"
    ) {

        mettreAJourBoutonNotifications(
            bouton,
            "bloque"
        );

        return;
    }


    try {

        const abonnement =
            await obtenirAbonnementPushActuel();

        mettreAJourBoutonNotifications(
            bouton,
            abonnement
                ? "active"
                : "inactive"
        );

    } catch (erreur) {

        console.warn(
            "État notifications indisponible :",
            erreur
        );

        mettreAJourBoutonNotifications(
            bouton,
            "inactive"
        );

    }

}


async function enregistrerAbonnementPushSupabase(
    abonnement
) {

    const supabase =
        await assurerBibliothequeSupabaseDisponible();

    if (!supabase) {

        throw new Error(
            "Supabase n'est pas disponible."
        );

    }


    const json =
        abonnement.toJSON();

    const endpoint =
        json.endpoint ||
        abonnement.endpoint;

    const p256dh =
        json.keys?.p256dh || "";

    const auth =
        json.keys?.auth || "";


    if (
        !endpoint ||
        !p256dh ||
        !auth
    ) {

        throw new Error(
            "Abonnement Push incomplet."
        );

    }


    const { error } =
        await supabase
            .from("push_subscriptions")
            .upsert(
                {
                    endpoint: endpoint,
                    p256dh: p256dh,
                    auth: auth,
                    user_agent:
                        navigator.userAgent || "",
                    actif: true,
                    updated_at:
                        new Date().toISOString()
                },
                {
                    onConflict: "endpoint"
                }
            );


    if (error) {
        throw error;
    }

}


async function activerNotificationsPush() {

    if (activationNotificationsEnCours) {
        return;
    }


    if (!navigator.onLine) {

        alert(
            "⚠️ Une connexion Internet est nécessaire pour activer les notifications."
        );

        return;
    }


    if (!notificationsWebPushDisponibles()) {

        alert(
            "⚠️ Les notifications Push ne sont pas disponibles sur ce navigateur."
        );

        return;
    }


    /*
     * Sur iPhone/iPad, Web Push fonctionne pour une PWA
     * ajoutée à l'écran d'accueil.
     */
    if (
        estAppareilIOS() &&
        !estPwaInstallee()
    ) {

        alert(
            "📱 Sur iPhone/iPad, ouvre CIS Le Chesne depuis l’icône ajoutée à l’écran d’accueil pour activer les notifications."
        );

        return;
    }


    activationNotificationsEnCours =
        true;

    await rafraichirEtatBoutonNotifications();


    try {

        let autorisation =
            Notification.permission;


        if (autorisation === "default") {

            autorisation =
                await Notification.requestPermission();

        }


        if (autorisation !== "granted") {

            if (autorisation === "denied") {

                alert(
                    "🔕 Les notifications ont été refusées. Tu pourras les autoriser plus tard dans les réglages de ton appareil."
                );

            }

            return;
        }


        const inscription =
            await navigator.serviceWorker.ready;


        let abonnement =
            await inscription
                .pushManager
                .getSubscription();


        if (!abonnement) {

            abonnement =
                await inscription
                    .pushManager
                    .subscribe({
                        userVisibleOnly: true,
                        applicationServerKey:
                            convertirCleVapidEnUint8Array(
                                VAPID_PUBLIC_KEY
                            )
                    });

        }


        await enregistrerAbonnementPushSupabase(
            abonnement
        );


        alert(
            "✅ Notifications activées sur cet appareil."
        );

    } catch (erreur) {

        console.error(
            "Activation notifications impossible :",
            erreur
        );

        alert(
            "⚠️ Impossible d'activer les notifications pour le moment."
        );

    } finally {

        activationNotificationsEnCours =
            false;

        await rafraichirEtatBoutonNotifications();

    }

}


function initialiserBoutonNotifications() {

    /*
     * La cloche globale a été retirée.
     * Les notifications se règlent maintenant
     * depuis la page Profil.
     */

    const ancienBouton =
        document.getElementById(
            "btn-notifications-push"
        );

    if (ancienBouton) {
        ancienBouton.remove();
    }


    if (
        window.__ecouteNotificationsStockInitialisee
        !== true
    ) {

        window.__ecouteNotificationsStockInitialisee =
            true;

        window.addEventListener(
            "online",
            function () {
                void envoyerNotificationsStockEnAttente();
            }
        );

    }


    if (navigator.onLine) {
        void envoyerNotificationsStockEnAttente();
    }

}

/* =========================================================
   NORMALISATION
   ========================================================= */

function normaliserToutesLesDonnees() {

    materiels = materiels.map(function (materiel, index) {

        return normaliserMateriel(
            materiel,
            index
        );

    });


    categories = categories
        .map(function (categorie) {

            if (
                typeof categorie === "object" &&
                categorie !== null
            ) {

                return String(
                    categorie.nom || ""
                ).trim();

            }

            return String(
                categorie || ""
            ).trim();

        })
        .filter(Boolean);


    CATEGORIES_PAR_DEFAUT.forEach(function (categorie) {

        const existe = categories.some(function (nom) {

            return (
                nom.toLowerCase() ===
                categorie.toLowerCase()
            );

        });


        if (!existe) {

            categories.push(categorie);

        }

    });


    categories = categories.filter(
        function (categorie, index, array) {

            return (
                array.findIndex(function (c) {

                    return (
                        c.toLowerCase() ===
                        categorie.toLowerCase()
                    );

                }) === index
            );

        }
    );


    historique = historique.map(
        normaliserIntervention
    );

}


/* =========================================================
   NORMALISER MATERIEL
   ========================================================= */

function normaliserMateriel(materiel, index) {

    const m = materiel || {};

    let id = m.id;


    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        id =
            "materiel-" +
            Date.now() +
            "-" +
            index;

    }


    let stock;


    if (
        m.stock !== undefined &&
        m.stock !== null
    ) {

        stock = Number(m.stock);

    } else {

        stock = Number(m.quantite);

    }


    if (!Number.isFinite(stock)) {

        stock = 0;

    }


    let cats = [];


    if (Array.isArray(m.categories)) {

        cats = m.categories
            .map(function (categorie) {

                if (
                    typeof categorie === "object" &&
                    categorie !== null
                ) {

                    return String(
                        categorie.nom || ""
                    );

                }

                return String(
                    categorie || ""
                );

            })
            .map(function (categorie) {

                return categorie.trim();

            })
            .filter(Boolean);

    } else if (m.categorie) {

        cats = [
            String(
                m.categorie
            ).trim()
        ];

    }


    if (cats.length === 0) {

        cats = [
            "AUTRE"
        ];

    }


    return {

        id: id,

        nom:
            String(
                m.nom ||
                "Matériel"
            ),

        reference:
            String(
                m.reference ||
                ""
            ),

        description:
            String(
                m.description ||
                ""
            ),

        categories:
            cats,

        stock:
            Math.max(
                0,
                Math.floor(stock)
            ),

        minimum:
            Math.max(
                0,
                Math.floor(
                    Number(
                        m.minimum || 0
                    )
                )
            ),

        emplacement:
            String(
                m.emplacement ||
                ""
            ),

        photo:
            String(
                m.photo ||
                ""
            )

    };

}


/* =========================================================
   NORMALISER INTERVENTION
   ========================================================= */

function normaliserIntervention(intervention) {

    const i = intervention || {};

    const consommations =
        Array.isArray(
            i.consommations
        )
            ? i.consommations
            : [];


    return {

        id:
            i.id ||
            genererUUID(),

        date:
            String(
                i.date ||
                ""
            ),

        numeroIntervention:
            String(
                i.numeroIntervention ||
                i.numero ||
                ""
            ),

        consommations:
            consommations.map(function (consommation) {

                return {

                    materielId:
                        consommation.materielId,

                    materiel:
                        String(
                            consommation.materiel ||
                            consommation.materielNom ||
                            "Matériel"
                        ),

                    quantite:
                        Math.max(
                            0,
                            Number(
                                consommation.quantite ||
                                0
                            )
                        )

                };

            })

    };

}


/* =========================================================
   CHARGEMENT DES MATERIELS
   ========================================================= */

function chargerMateriels() {

    let donnees = null;


    const ancien =
        localStorage.getItem(
            STORAGE.materiels
        );


    const v3 =
        localStorage.getItem(
            STORAGE.materielsV3
        );


    if (ancien) {

        try {

            donnees =
                JSON.parse(
                    ancien
                );

        } catch (e) {

            console.error(
                "Erreur lecture matériels :",
                e
            );

        }

    }


    if (
        !Array.isArray(donnees) &&
        v3
    ) {

        try {

            donnees =
                JSON.parse(
                    v3
                );

        } catch (e) {

            console.error(
                "Erreur lecture matériels V3 :",
                e
            );

        }

    }


    materiels =
        Array.isArray(donnees)
            ? donnees
            : [];

}


/* =========================================================
   CHARGEMENT DES CATEGORIES
   ========================================================= */

function chargerCategories() {

    let donnees = null;


    const ancien =
        localStorage.getItem(
            STORAGE.categories
        );


    const v3 =
        localStorage.getItem(
            STORAGE.categoriesV3
        );


    if (ancien) {

        try {

            donnees =
                JSON.parse(
                    ancien
                );

        } catch (e) {

            console.error(
                "Erreur lecture catégories :",
                e
            );

        }

    }


    if (
        !Array.isArray(donnees) &&
        v3
    ) {

        try {

            donnees =
                JSON.parse(
                    v3
                );

        } catch (e) {

            console.error(
                "Erreur lecture catégories V3 :",
                e
            );

        }

    }


    categories =
        Array.isArray(donnees)
            ? donnees
            : [];

}


/* =========================================================
   CHARGEMENT DE L'HISTORIQUE
   ========================================================= */

function chargerHistorique() {

    let donnees = null;


    const ancien =
        localStorage.getItem(
            STORAGE.historique
        );


    const v3 =
        localStorage.getItem(
            STORAGE.historiqueV3
        );


    if (ancien) {

        try {

            donnees =
                JSON.parse(
                    ancien
                );

        } catch (e) {

            console.error(
                "Erreur lecture historique :",
                e
            );

        }

    }


    if (
        !Array.isArray(donnees) &&
        v3
    ) {

        try {

            donnees =
                JSON.parse(
                    v3
                );

        } catch (e) {

            console.error(
                "Erreur lecture historique V3 :",
                e
            );

        }

    }


    historique =
        Array.isArray(donnees)
            ? donnees
            : [];

}



/* =========================================================
   CHARGEMENT DES ARCHIVES DE L'HISTORIQUE
   ========================================================= */

function chargerArchivesHistorique() {

    let donnees = null;

    const principal =
        localStorage.getItem(
            STORAGE.archivesHistorique
        );

    const v3 =
        localStorage.getItem(
            STORAGE.archivesHistoriqueV3
        );

    for (const source of [principal, v3]) {

        if (!source) {
            continue;
        }

        try {

            const valeur =
                JSON.parse(source);

            if (Array.isArray(valeur)) {
                donnees = valeur;
                break;
            }

        } catch (erreur) {

            console.error(
                "Erreur lecture archives historique :",
                erreur
            );

        }

    }


    archivesHistorique =
        Array.isArray(donnees)
            ? donnees
            : [];

}


/* =========================================================
   SAUVEGARDE
   ========================================================= */

function sauvegarderToutesLesDonnees() {

    localStorage.setItem(
        STORAGE.materiels,
        JSON.stringify(
            materiels
        )
    );


    localStorage.setItem(
        STORAGE.categories,
        JSON.stringify(
            categories.map(function (nom, index) {

                return {

                    id:
                        index + 1,

                    nom:
                        nom

                };

            })
        )
    );


    localStorage.setItem(
        STORAGE.historique,
        JSON.stringify(
            historique
        )
    );


    localStorage.setItem(
        STORAGE.archivesHistorique,
        JSON.stringify(
            archivesHistorique
        )
    );


    localStorage.setItem(
        STORAGE.materielsV3,
        JSON.stringify(
            materiels
        )
    );


    localStorage.setItem(
        STORAGE.categoriesV3,
        JSON.stringify(
            categories
        )
    );


    localStorage.setItem(
        STORAGE.historiqueV3,
        JSON.stringify(
            historique
        )
    );


    localStorage.setItem(
        STORAGE.archivesHistoriqueV3,
        JSON.stringify(
            archivesHistorique
        )
    );

    // La sauvegarde locale reste immédiate et fonctionne hors connexion.
    // La synchronisation Supabase est volontairement déclenchée uniquement
    // lors des actions prévues dans l'application.

}


/* =========================================================
   SYNCHRONISATION SUPABASE
   ========================================================= */

let clientSupabase = null;
let synchronisationSupabaseActive = false;
let synchronisationSupabaseEnCours = false;
let synchronisationSupabaseProgrammee = false;
let abonnementSupabase = null;

const STORAGE_SYNC = {
    snapshot: "inventaire_caserne_supabase_snapshot_v1",
    modificationsEnAttente: "inventaire_caserne_supabase_modifications_en_attente_v1"
};

let nombreSynchronisationsVisuelles = 0;

function initialiserIndicateurSynchronisation() {

    if (document.getElementById("indicateur-synchronisation")) {
        return;
    }

    const style = document.createElement("style");

    style.textContent = `
        #indicateur-synchronisation {
            position: fixed;
            top: calc(12px + env(safe-area-inset-top, 0px));
            right: calc(12px + env(safe-area-inset-right, 0px));
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            pointer-events: auto;
            opacity: 0.95;
            border: 0;
            padding: 0;
            margin: 0;
            background: transparent;
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        #indicateur-synchronisation:active {
            transform: scale(0.94);
        }

        #indicateur-synchronisation:focus-visible {
            outline: 2px solid #1687ff;
            outline-offset: 2px;
            border-radius: 50%;
        }

        .historique-total.historique-rupture-stock {
            background: #d71920 !important;
            border-color: #d71920 !important;
            color: #ffffff !important;
        }

        .historique-total.historique-rupture-stock *,
        .historique-total .texte-rupture-stock,
        .historique-total .texte-rupture-stock * {
            color: #ffffff !important;
        }

        .historique-total.historique-rupture-stock:active {
            background: #b80f15 !important;
        }

        #indicateur-synchronisation svg {
            width: 27px;
            height: 27px;
            display: block;
            transform-origin: center;
        }

        #indicateur-synchronisation.en-cours svg {
            animation: rotation-synchronisation 0.8s linear infinite;
        }

        @keyframes rotation-synchronisation {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(style);

    const indicateur = document.createElement("button");
    indicateur.id = "indicateur-synchronisation";
    indicateur.type = "button";
    indicateur.setAttribute(
        "aria-label",
        "Synchroniser maintenant"
    );
    indicateur.setAttribute(
        "title",
        "Synchroniser maintenant"
    );

    indicateur.addEventListener(
        "click",
        function () {
            void synchroniserManuellement();
        }
    );

    indicateur.innerHTML = `
        <svg viewBox="0 0 32 32" aria-hidden="true">
            <path
                d="M25.5 10.5A11 11 0 0 0 7.2 7.8"
                fill="none"
                stroke="#1687ff"
                stroke-width="3"
                stroke-linecap="round"
            />
            <path
                d="M7.1 7.8l5.2-.4-2.2 4.8"
                fill="none"
                stroke="#1687ff"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <path
                d="M6.5 21.5a11 11 0 0 0 18.3 2.7"
                fill="none"
                stroke="#1687ff"
                stroke-width="3"
                stroke-linecap="round"
            />
            <path
                d="M24.9 24.2l-5.2.4 2.2-4.8"
                fill="none"
                stroke="#1687ff"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    `;

    document.body.appendChild(indicateur);

}


function initialiserBandeauConnexion() {

    if (
        !document.getElementById(
            "style-bandeau-connexion"
        )
    ) {

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "style-bandeau-connexion";

        style.textContent = `
            #bandeau-hors-connexion {
                position: fixed;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                min-height: 64px;
                box-sizing: border-box;
                z-index: 100000;
                padding:
                    16px
                    14px
                    calc(16px + env(safe-area-inset-bottom, 0px));
                background: #fff3cd;
                border-top: 1px solid #e6cf75;
                color: #5c4b00;
                text-align: center;
                font-size: 15px;
                font-weight: 700;
                line-height: 1.3;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
            }

            #bandeau-hors-connexion[hidden] {
                display: none !important;
            }

            body.mode-hors-connexion {
                padding-bottom:
                    calc(84px + env(safe-area-inset-bottom, 0px));
            }

            .intervention-en-attente-sync {
                background: #fff8d9 !important;
                border-color: #ead67a !important;
            }

            .intervention-en-attente-sync small {
                color: #806600 !important;
                font-weight: 700;
            }
        `;

        document.head.appendChild(
            style
        );

    }


    let bandeau =
        document.getElementById(
            "bandeau-hors-connexion"
        );


    if (!bandeau) {

        bandeau =
            document.createElement(
                "div"
            );

        bandeau.id =
            "bandeau-hors-connexion";

        bandeau.textContent =
            "Vous êtes actuellement hors connexion internet";

        document.body.appendChild(
            bandeau
        );

    }


    function mettreAJourBandeauConnexion() {

        bandeau.hidden =
            navigator.onLine;

        document.body.classList.toggle(
            "mode-hors-connexion",
            !navigator.onLine
        );

    }


    window.addEventListener(
        "online",
        mettreAJourBandeauConnexion
    );

    window.addEventListener(
        "offline",
        mettreAJourBandeauConnexion
    );


    mettreAJourBandeauConnexion();

}


function demarrerIndicateurSynchronisation() {

    nombreSynchronisationsVisuelles += 1;

    const indicateur =
        document.getElementById("indicateur-synchronisation");

    if (indicateur) {
        indicateur.classList.add("en-cours");
    }

}

function arreterIndicateurSynchronisation() {

    nombreSynchronisationsVisuelles =
        Math.max(
            0,
            nombreSynchronisationsVisuelles - 1
        );

    if (nombreSynchronisationsVisuelles > 0) {
        return;
    }

    const indicateur =
        document.getElementById("indicateur-synchronisation");

    if (indicateur) {
        indicateur.classList.remove("en-cours");
    }

}

function marquerModificationsEnAttente() {

    localStorage.setItem(
        STORAGE_SYNC.modificationsEnAttente,
        "1"
    );

}

function effacerModificationsEnAttente() {

    localStorage.removeItem(
        STORAGE_SYNC.modificationsEnAttente
    );

}

function existeModificationsEnAttente() {

    return (
        localStorage.getItem(
            STORAGE_SYNC.modificationsEnAttente
        ) === "1"
    );

}

async function synchroniserManuellement() {

    const debutAnimationSynchronisation =
        Date.now();

    while (synchronisationSupabaseEnCours) {

        await new Promise(
            function (resolve) {
                setTimeout(resolve, 80);
            }
        );

    }

    if (!navigator.onLine) {

        alert(
            "📴 Pas de connexion Internet. La synchronisation sera possible dès que la connexion reviendra."
        );

        return;
    }

    demarrerIndicateurSynchronisation();

    try {

        const supabase =
            await assurerBibliothequeSupabaseDisponible();

        if (!supabase) {

            alert(
                "⚠️ La connexion Internet vient peut-être de revenir. Impossible de joindre Supabase pour le moment. Réessayez dans quelques secondes."
            );

            return;
        }

        // S'il reste une modification locale en attente,
        // on l'envoie d'abord vers Supabase.
        if (existeModificationsEnAttente()) {

            synchronisationSupabaseEnCours = true;

            try {

                await envoyerDonneesLocalesVersSupabase();
                effacerModificationsEnAttente();

            } finally {

                synchronisationSupabaseEnCours = false;

            }

        }

        // Puis on relit la base centrale.
        const donnees =
            await recupererDonneesSupabase();

        synchronisationSupabaseEnCours = true;

        try {

            await appliquerDonneesSupabaseLocalement(
                donnees
            );

        } finally {

            synchronisationSupabaseEnCours = false;

        }

        synchronisationSupabaseActive = true;

        // Le clic sur les flèches est une action volontaire :
        // on met donc immédiatement à jour l'écran affiché.
        rafraichirAffichageApresSynchronisation();

        console.log(
            "🔄 Synchronisation manuelle terminée."
        );

    } catch (erreur) {

        console.warn(
            "⚠️ Synchronisation manuelle impossible.",
            erreur
        );

        const detailErreur =
            String(
                erreur?.message ||
                erreur?.details ||
                erreur?.hint ||
                ""
            ).trim();

        alert(
            "⚠️ La synchronisation n'a pas pu être effectuée." +
            (
                detailErreur
                    ? "\n\nDétail : " + detailErreur
                    : ""
            )
        );

    } finally {

        const tempsEcoule =
            Date.now() -
            debutAnimationSynchronisation;

        const tempsRestant =
            Math.max(
                0,
                2000 - tempsEcoule
            );

        if (tempsRestant > 0) {

            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        tempsRestant
                    );

                }
            );

        }

        arreterIndicateurSynchronisation();

    }

}

async function synchroniserAvantNavigation() {

    while (synchronisationSupabaseEnCours) {

        await new Promise(
            function (resolve) {
                setTimeout(resolve, 80);
            }
        );

    }

    if (!navigator.onLine) {
        return;
    }

    const supabase =
        await assurerBibliothequeSupabaseDisponible();

    if (!supabase) {
        return;
    }

    demarrerIndicateurSynchronisation();

    try {

        // Si une modification a été faite hors connexion,
        // elle est envoyée avant de récupérer la base centrale.
        if (existeModificationsEnAttente()) {

            synchronisationSupabaseEnCours = true;

            try {
                await envoyerDonneesLocalesVersSupabase();
                effacerModificationsEnAttente();
            } finally {
                synchronisationSupabaseEnCours = false;
            }

        }

        const donnees =
            await recupererDonneesSupabase();

        synchronisationSupabaseEnCours = true;

        try {
            await appliquerDonneesSupabaseLocalement(
                donnees
            );
        } finally {
            synchronisationSupabaseEnCours = false;
        }

        synchronisationSupabaseActive = true;

        console.log(
            "🔄 Synchronisation avant affichage terminée."
        );

    } catch (erreur) {

        console.warn(
            "⚠️ Synchronisation avant affichage impossible. Les données locales restent disponibles.",
            erreur
        );

    } finally {

        arreterIndicateurSynchronisation();

    }

}

async function synchroniserApresModification() {

    while (synchronisationSupabaseEnCours) {

        await new Promise(
            function (resolve) {
                setTimeout(resolve, 80);
            }
        );

    }

    marquerModificationsEnAttente();

    if (!navigator.onLine) {

        console.log(
            "📴 Modification enregistrée localement. Elle sera synchronisée lors de la prochaine action en ligne."
        );

        return false;
    }


    const supabase =
        await assurerBibliothequeSupabaseDisponible();

    if (!supabase) {

        console.log(
            "⚠️ Supabase n'est pas encore joignable. La modification reste enregistrée localement."
        );

        return false;

    }

    demarrerIndicateurSynchronisation();

    try {

        synchronisationSupabaseEnCours = true;

        try {

            await envoyerDonneesLocalesVersSupabase();
            effacerModificationsEnAttente();

        } finally {

            synchronisationSupabaseEnCours = false;

        }

        // Une fois l'envoi terminé, on relit immédiatement la base centrale.
        // Cela évite qu'un iPhone/iPad garde une ancienne copie locale.
        const donnees =
            await recupererDonneesSupabase();

        synchronisationSupabaseEnCours = true;

        try {

            await appliquerDonneesSupabaseLocalement(
                donnees
            );

        } finally {

            synchronisationSupabaseEnCours = false;

        }

        synchronisationSupabaseActive = true;

        // Cette actualisation n'a lieu qu'après une validation utilisateur,
        // jamais pendant la saisie d'un formulaire.
        rafraichirAffichageApresSynchronisation();

        console.log(
            "✅ Modification synchronisée avec Supabase."
        );

        return true;

    } catch (erreur) {

        console.warn(
            "⚠️ La modification reste enregistrée localement et sera renvoyée plus tard.",
            erreur
        );

        return false;

    } finally {

        arreterIndicateurSynchronisation();

    }

}


async function assurerBibliothequeSupabaseDisponible() {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        return obtenirClientSupabase();

    }


    if (!navigator.onLine) {

        return null;

    }


    const scriptExistant =
        document.getElementById(
            "supabase-reconnexion"
        );


    if (scriptExistant) {

        scriptExistant.remove();

    }


    return await new Promise(
        function (resolve) {

            const script =
                document.createElement(
                    "script"
                );

            script.id =
                "supabase-reconnexion";

            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

            script.async =
                true;


            const minuterie =
                setTimeout(
                    function () {

                        resolve(
                            obtenirClientSupabase()
                        );

                    },
                    8000
                );


            script.onload =
                function () {

                    clearTimeout(
                        minuterie
                    );

                    resolve(
                        obtenirClientSupabase()
                    );

                };


            script.onerror =
                function () {

                    clearTimeout(
                        minuterie
                    );

                    resolve(
                        null
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


function obtenirClientSupabase() {

    try {

        if (clientSupabase) {
            return clientSupabase;
        }

        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            return null;
        }

        if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
            console.warn("Supabase non configuré : URL ou clé publique absente.");
            return null;
        }

        clientSupabase = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_ANON_KEY
        );

        return clientSupabase;

    } catch (erreur) {

        console.error("Impossible d'initialiser Supabase :", erreur);
        return null;

    }

}

function estUUID(value) {

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        String(value || "")
    );

}

function genererUUID() {

    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }
    );

}

function lireSnapshotSynchronisation() {

    try {

        const texte = localStorage.getItem(
            STORAGE_SYNC.snapshot
        );

        if (!texte) {
            return {
                materiels: [],
                categories: [],
                interventions: [],
                archives: []
            };
        }

        const valeur = JSON.parse(texte);

        return {
            materiels: Array.isArray(valeur.materiels) ? valeur.materiels : [],
            categories: Array.isArray(valeur.categories) ? valeur.categories : [],
            interventions: Array.isArray(valeur.interventions) ? valeur.interventions : [],
            archives: Array.isArray(valeur.archives) ? valeur.archives : []
        };

    } catch (erreur) {

        console.error("Erreur lecture snapshot Supabase :", erreur);

        return {
            materiels: [],
            categories: [],
            interventions: []
        };

    }

}

function enregistrerSnapshotSynchronisation() {

    const snapshot = {
        materiels: materiels.map(function (materiel) {
            return String(materiel.id);
        }),
        categories: categories.map(function (categorie) {
            return String(categorie).trim();
        }),
        interventions: historique.map(function (intervention) {
            return String(intervention.id);
        }),
        archives: archivesHistorique.map(function (archive) {
            return String(archive.id);
        })
    };

    localStorage.setItem(
        STORAGE_SYNC.snapshot,
        JSON.stringify(snapshot)
    );

}

async function recupererDonneesSupabase() {

    const supabase = obtenirClientSupabase();

    if (!supabase) {
        throw new Error("Client Supabase indisponible.");
    }

    const resultats = await Promise.all([
        supabase.from("categories").select("id,nom"),
        supabase
            .from("materiels")
            .select("id,nom,reference,description,stock,minimum,emplacement,photo_url"),
        supabase
            .from("materiel_categories")
            .select("materiel_id,categorie_id"),
        supabase
            .from("interventions")
            .select("id,date,numero,created_by,created_by_prenom,created_by_nom,created_at"),
        supabase
            .from("consommations")
            .select("id,intervention_id,materiel_id,materiel_nom,quantite")
    ]);

    resultats.forEach(function (resultat) {
        if (resultat.error) {
            throw resultat.error;
        }
    });


    /*
     * Les archives sont volontairement lues séparément.
     * Ainsi, si la table n'a pas encore été créée dans Supabase,
     * le reste de l'application continue de fonctionner normalement.
     */
    let archivesDistantes = [];

    try {

        const resultatArchives =
            await supabase
                .from("archives_historique")
                .select("id,date_commande,interventions,created_at")
                .order("date_commande", {
                    ascending: false
                })
                .order("created_at", {
                    ascending: false
                });

        if (resultatArchives.error) {

            console.warn(
                "Archives Supabase indisponibles :",
                resultatArchives.error
            );

        } else {

            archivesDistantes =
                resultatArchives.data || [];

        }

    } catch (erreurArchives) {

        console.warn(
            "Lecture archives Supabase impossible :",
            erreurArchives
        );

    }


    return {
        categories: resultats[0].data || [],
        materiels: resultats[1].data || [],
        materielCategories: resultats[2].data || [],
        interventions: resultats[3].data || [],
        consommations: resultats[4].data || [],
        archivesHistorique: archivesDistantes
    };

}

function convertirDonneesSupabaseEnDonneesApplication(donnees) {

    const categoriesParId = new Map();

    donnees.categories.forEach(function (categorie) {
        categoriesParId.set(
            String(categorie.id),
            String(categorie.nom || "").trim()
        );
    });

    const categoriesParMateriel = new Map();

    donnees.materielCategories.forEach(function (relation) {

        const materielId = String(relation.materiel_id);
        const nomCategorie = categoriesParId.get(
            String(relation.categorie_id)
        );

        if (!nomCategorie) {
            return;
        }

        if (!categoriesParMateriel.has(materielId)) {
            categoriesParMateriel.set(materielId, []);
        }

        categoriesParMateriel.get(materielId).push(
            nomCategorie
        );

    });

    const materielsApplication = donnees.materiels.map(function (materiel) {

        let listeCategories =
            categoriesParMateriel.get(String(materiel.id)) || [];

        if (listeCategories.length === 0) {
            listeCategories = ["AUTRE"];
        }

        return {
            id: String(materiel.id),
            nom: String(materiel.nom || "Matériel"),
            reference: String(materiel.reference || ""),
            description: String(materiel.description || ""),
            categories: listeCategories,
            stock: Math.max(0, Math.floor(Number(materiel.stock || 0))),
            minimum: Math.max(0, Math.floor(Number(materiel.minimum || 0))),
            emplacement: String(materiel.emplacement || ""),
            photo: String(materiel.photo_url || "")
        };

    });

    const consommationsParIntervention = new Map();

    donnees.consommations.forEach(function (consommation) {

        const interventionId = String(
            consommation.intervention_id
        );

        if (!consommationsParIntervention.has(interventionId)) {
            consommationsParIntervention.set(
                interventionId,
                []
            );
        }

        consommationsParIntervention.get(interventionId).push({
            materielId: String(consommation.materiel_id),
            materiel: String(consommation.materiel_nom || "Matériel"),
            quantite: Math.max(
                0,
                Number(consommation.quantite || 0)
            )
        });

    });

    const historiqueApplication = donnees.interventions.map(function (intervention) {

        return {
            id: String(intervention.id),
            date: String(intervention.date || ""),
            numeroIntervention: String(intervention.numero || ""),
            createdBy: String(intervention.created_by || ""),
            createdByPrenom: String(intervention.created_by_prenom || ""),
            createdByNom: String(intervention.created_by_nom || ""),
            createdAt: String(intervention.created_at || ""),
            consommations:
                consommationsParIntervention.get(
                    String(intervention.id)
                ) || []
        };

    });

    const archivesApplication =
        (
            Array.isArray(
                donnees.archivesHistorique
            )
                ? donnees.archivesHistorique
                : []
        )
        .map(function (archive) {

            return {
                id: String(
                    archive.id || genererUUID()
                ),
                date: String(
                    archive.date_commande || ""
                ),
                createdAt: String(
                    archive.created_at || ""
                ),
                interventions:
                    Array.isArray(
                        archive.interventions
                    )
                        ? archive.interventions
                        : []
            };

        });


    return {
        categories: donnees.categories
            .map(function (categorie) {
                return String(categorie.nom || "").trim();
            })
            .filter(Boolean),
        materiels: materielsApplication,
        historique: historiqueApplication,
        archivesHistorique: archivesApplication
    };

}

async function appliquerDonneesSupabaseLocalement(donnees) {

    const application =
        convertirDonneesSupabaseEnDonneesApplication(
            donnees
        );

    if (application.categories.length > 0) {
        categories = application.categories;
    }

    materiels = application.materiels;
    historique = application.historique;
    archivesHistorique =
        Array.isArray(application.archivesHistorique)
            ? application.archivesHistorique
            : [];

    normaliserToutesLesDonnees();

    synchronisationSupabaseEnCours = true;

    try {
        localStorage.setItem(
            STORAGE.materiels,
            JSON.stringify(materiels)
        );
        localStorage.setItem(
            STORAGE.categories,
            JSON.stringify(
                categories.map(function (nom, index) {
                    return {
                        id: index + 1,
                        nom: nom
                    };
                })
            )
        );
        localStorage.setItem(
            STORAGE.historique,
            JSON.stringify(historique)
        );
        localStorage.setItem(
            STORAGE.materielsV3,
            JSON.stringify(materiels)
        );
        localStorage.setItem(
            STORAGE.categoriesV3,
            JSON.stringify(categories)
        );
        localStorage.setItem(
            STORAGE.historiqueV3,
            JSON.stringify(historique)
        );
        localStorage.setItem(
            STORAGE.archivesHistorique,
            JSON.stringify(archivesHistorique)
        );
        localStorage.setItem(
            STORAGE.archivesHistoriqueV3,
            JSON.stringify(archivesHistorique)
        );
    } finally {
        synchronisationSupabaseEnCours = false;
    }

    enregistrerSnapshotSynchronisation();

}

function rafraichirAffichageApresSynchronisation() {

    // Inventaire
    if (document.getElementById("inventaire-contenu")) {
        afficherResultatsInventaire();
        return;
    }

    // Gestion du matériel (administration)
    if (document.getElementById("liste-admin")) {
        afficherListeAdmin();
        return;
    }

    // Historique
    if (
        document.getElementById("historique-total") ||
        document.getElementById("historique-interventions")
    ) {
        afficherHistoriqueTotal();
        afficherHistoriqueInterventions();
        return;
    }

    // Retour d'intervention :
    // on actualise les stocks sans effacer les quantités déjà sélectionnées.
    if (document.getElementById("categories-retour")) {
        afficherCategoriesRetour();

        const champRecherche =
            document.getElementById("recherche-retour");

        if (
            champRecherche &&
            String(champRecherche.value || "").trim()
        ) {
            rechercherMaterielRetour();
        }

        mettreAJourResume();
    }

}

function migrerIdentifiantsVersUUID() {

    const correspondanceMateriels = new Map();
    const correspondanceInterventions = new Map();

    materiels.forEach(function (materiel) {

        const ancienId = String(materiel.id);

        if (!estUUID(ancienId)) {
            const nouveauId = genererUUID();
            correspondanceMateriels.set(ancienId, nouveauId);
            materiel.id = nouveauId;
        }

    });

    historique.forEach(function (intervention) {

        const ancienId = String(intervention.id);

        if (!estUUID(ancienId)) {
            const nouveauId = genererUUID();
            correspondanceInterventions.set(ancienId, nouveauId);
            intervention.id = nouveauId;
        }

        intervention.consommations =
            Array.isArray(intervention.consommations)
                ? intervention.consommations.map(function (consommation) {
                    const ancienMaterielId =
                        String(consommation.materielId || "");

                    if (correspondanceMateriels.has(ancienMaterielId)) {
                        consommation.materielId =
                            correspondanceMateriels.get(ancienMaterielId);
                    }

                    return consommation;
                })
                : [];

    });

    let archivesModifiees = false;

    archivesHistorique.forEach(
        function (archive) {

            if (!estUUID(archive.id)) {
                archive.id = genererUUID();
                archivesModifiees = true;
            }

        }
    );


    if (
        correspondanceMateriels.size ||
        correspondanceInterventions.size ||
        archivesModifiees
    ) {
        synchronisationSupabaseEnCours = true;
        try {
            localStorage.setItem(
                STORAGE.materiels,
                JSON.stringify(materiels)
            );
            localStorage.setItem(
                STORAGE.materielsV3,
                JSON.stringify(materiels)
            );
            localStorage.setItem(
                STORAGE.historique,
                JSON.stringify(historique)
            );
            localStorage.setItem(
                STORAGE.historiqueV3,
                JSON.stringify(historique)
            );
            localStorage.setItem(
                STORAGE.archivesHistorique,
                JSON.stringify(archivesHistorique)
            );
            localStorage.setItem(
                STORAGE.archivesHistoriqueV3,
                JSON.stringify(archivesHistorique)
            );
        } finally {
            synchronisationSupabaseEnCours = false;
        }
    }

}

async function envoyerDonneesLocalesVersSupabase() {

    const supabase = obtenirClientSupabase();

    if (!supabase) {
        return;
    }

    migrerIdentifiantsVersUUID();

    const ancienSnapshot = lireSnapshotSynchronisation();

    const anciennesCategories = new Set(
        ancienSnapshot.categories.map(function (nom) {
            return String(nom).trim().toLowerCase();
        })
    );

    const categoriesLocales = categories
        .map(function (nom) {
            return String(nom || "").trim();
        })
        .filter(Boolean);

    if (categoriesLocales.length > 0) {

        const lignesCategories =
            categoriesLocales.map(function (nom) {
                return { nom: nom };
            });

        const resultatsCategories = await supabase
            .from("categories")
            .upsert(
                lignesCategories,
                { onConflict: "nom" }
            )
            .select("id,nom");

        if (resultatsCategories.error) {
            throw resultatsCategories.error;
        }

    }

    const { data: categoriesDistantes, error: erreurCategories } =
        await supabase
            .from("categories")
            .select("id,nom");

    if (erreurCategories) {
        throw erreurCategories;
    }

    const categorieIdParNom = new Map();

    (categoriesDistantes || []).forEach(function (categorie) {
        categorieIdParNom.set(
            String(categorie.nom).trim().toLowerCase(),
            String(categorie.id)
        );
    });

    const lignesMateriels = materiels.map(function (materiel) {

        return {
            id: String(materiel.id),
            nom: String(materiel.nom || "Matériel"),
            reference: String(materiel.reference || ""),
            description: String(materiel.description || ""),
            stock: Math.max(0, Math.floor(Number(materiel.stock || 0))),
            minimum: Math.max(0, Math.floor(Number(materiel.minimum || 0))),
            emplacement: String(materiel.emplacement || ""),
            photo_url: String(materiel.photo || "")
        };

    });

    if (lignesMateriels.length > 0) {

        const resultatMateriels = await supabase
            .from("materiels")
            .upsert(lignesMateriels, { onConflict: "id" });

        if (resultatMateriels.error) {
            throw resultatMateriels.error;
        }

    }

    for (const materiel of materiels) {

        const idMateriel = String(materiel.id);

        await supabase
            .from("materiel_categories")
            .delete()
            .eq("materiel_id", idMateriel);

        const relations =
            Array.isArray(materiel.categories)
                ? materiel.categories
                    .map(function (nomCategorie) {
                        return categorieIdParNom.get(
                            String(nomCategorie).trim().toLowerCase()
                        );
                    })
                    .filter(Boolean)
                    .map(function (categorieId) {
                        return {
                            materiel_id: idMateriel,
                            categorie_id: categorieId
                        };
                    })
                : [];

        if (relations.length > 0) {

            const resultatRelations = await supabase
                .from("materiel_categories")
                .upsert(
                    relations,
                    { onConflict: "materiel_id,categorie_id" }
                );

            if (resultatRelations.error) {
                throw resultatRelations.error;
            }

        }

    }

    /*
     * Les archives ne sont pas écrites pendant une synchronisation normale.
     * Elles sont créées uniquement par l'action "Commande effectuée"
     * via la fonction Supabase sécurisée archiver_historique_courant.
     * Cela évite qu'un retour d'intervention soit bloqué par les règles RLS
     * de la table archives_historique.
     */

    const lignesInterventions = historique.map(function (intervention) {

        return {
            id: String(intervention.id),
            date: String(intervention.date || dateAujourdhui()),
            numero: String(intervention.numeroIntervention || ""),
            ...(intervention.createdBy ? { created_by: String(intervention.createdBy) } : {}),
            ...(intervention.createdByPrenom ? { created_by_prenom: String(intervention.createdByPrenom) } : {}),
            ...(intervention.createdByNom ? { created_by_nom: String(intervention.createdByNom) } : {}),
            ...(intervention.createdAt ? { created_at: String(intervention.createdAt) } : {})
        };

    });

    if (lignesInterventions.length > 0) {

        const resultatInterventions = await supabase
            .from("interventions")
            .upsert(lignesInterventions, { onConflict: "id" });

        if (resultatInterventions.error) {
            throw resultatInterventions.error;
        }

    }

    const lignesConsommations = [];

    historique.forEach(function (intervention) {

        (Array.isArray(intervention.consommations)
            ? intervention.consommations
            : []
        ).forEach(function (consommation) {

            if (!estUUID(consommation.materielId)) {
                return;
            }

            lignesConsommations.push({
                intervention_id: String(intervention.id),
                materiel_id: String(consommation.materielId),
                materiel_nom: String(
                    consommation.materiel || "Matériel"
                ),
                quantite: Math.max(
                    1,
                    Math.floor(
                        Number(consommation.quantite || 0)
                    )
                )
            });

        });

    });

    // Les consommations existantes sont conservées. Les nouvelles lignes sont ajoutées.
    // Pour éviter les doublons, nous vérifions les interventions déjà présentes ci-dessous.
    if (lignesConsommations.length > 0) {

        const { data: consommationsExistantes, error: erreurConsommations } =
            await supabase
                .from("consommations")
                .select("intervention_id,materiel_id,quantite");

        if (erreurConsommations) {
            throw erreurConsommations;
        }

        const dejaVues = new Set(
            (consommationsExistantes || []).map(function (ligne) {
                return [
                    ligne.intervention_id,
                    ligne.materiel_id,
                    ligne.quantite
                ].join("|");
            })
        );

        const nouvellesConsommations = lignesConsommations.filter(function (ligne) {
            const cle = [
                ligne.intervention_id,
                ligne.materiel_id,
                ligne.quantite
            ].join("|");

            if (dejaVues.has(cle)) {
                return false;
            }

            dejaVues.add(cle);
            return true;
        });

        if (nouvellesConsommations.length > 0) {

            const resultatConsommations = await supabase
                .from("consommations")
                .upsert(
                    nouvellesConsommations,
                    {
                        onConflict:
                            "intervention_id,materiel_id"
                    }
                );

            if (resultatConsommations.error) {
                throw resultatConsommations.error;
            }

        }

    }

    // Suppressions effectuées depuis ce poste depuis la dernière synchronisation.
    const idsMaterielsActuels = new Set(
        materiels.map(function (materiel) {
            return String(materiel.id);
        })
    );

    const idsMaterielsSupprimes = ancienSnapshot.materiels
        .filter(function (id) {
            return estUUID(id) && !idsMaterielsActuels.has(String(id));
        });

    if (idsMaterielsSupprimes.length > 0) {

        const resultatSuppressionMateriels = await supabase
            .from("materiels")
            .delete()
            .in("id", idsMaterielsSupprimes);

        if (resultatSuppressionMateriels.error) {
            throw resultatSuppressionMateriels.error;
        }

    }

    const idsInterventionsActuels = new Set(
        historique.map(function (intervention) {
            return String(intervention.id);
        })
    );

    const idsInterventionsSupprimes = ancienSnapshot.interventions
        .filter(function (id) {
            return estUUID(id) && !idsInterventionsActuels.has(String(id));
        });

    if (idsInterventionsSupprimes.length > 0) {

        const resultatSuppressionInterventions = await supabase
            .from("interventions")
            .delete()
            .in("id", idsInterventionsSupprimes);

        if (resultatSuppressionInterventions.error) {
            throw resultatSuppressionInterventions.error;
        }

    }

    const nouvellesCategoriesMaj = new Set(
        categoriesLocales.map(function (nom) {
            return String(nom).trim().toLowerCase();
        })
    );

    const categoriesSupprimees = Array.from(anciennesCategories).filter(function (nom) {
        return !nouvellesCategoriesMaj.has(nom);
    });

    for (const ancienNom of categoriesSupprimees) {

        const resultatSuppressionCategorie = await supabase
            .from("categories")
            .delete()
            .eq("nom", ancienNom);

        if (resultatSuppressionCategorie.error) {
            // La suppression peut échouer si la politique distante est plus restrictive.
            console.warn(
                "Suppression catégorie Supabase impossible pour :",
                ancienNom,
                resultatSuppressionCategorie.error
            );
        }

    }

    enregistrerSnapshotSynchronisation();

}

async function synchroniserVersSupabase() {

    if (synchronisationSupabaseEnCours) {
        return;
    }

    const supabase = obtenirClientSupabase();

    if (!supabase || !navigator.onLine) {
        return;
    }

    synchronisationSupabaseEnCours = true;

    try {
        await envoyerDonneesLocalesVersSupabase();
        console.log("✅ Synchronisation Supabase terminée.");
    } catch (erreur) {
        console.warn(
            "⚠️ Synchronisation Supabase échouée. Les données locales sont conservées.",
            erreur
        );
    } finally {
        synchronisationSupabaseEnCours = false;
    }

}

function programmerSynchronisationSupabase() {

    if (!synchronisationSupabaseActive || synchronisationSupabaseEnCours) {
        return;
    }

    if (synchronisationSupabaseProgrammee) {
        return;
    }

    synchronisationSupabaseProgrammee = true;

    setTimeout(async function () {

        synchronisationSupabaseProgrammee = false;
        await synchroniserVersSupabase();

    }, 350);

}

let rechargementSupabaseProgramme = false;

function programmerRechargementDepuisSupabase() {

    if (rechargementSupabaseProgramme) {
        return;
    }

    rechargementSupabaseProgramme = true;

    setTimeout(async function () {

        rechargementSupabaseProgramme = false;

        if (synchronisationSupabaseEnCours || !navigator.onLine) {
            return;
        }

        try {
            const donnees = await recupererDonneesSupabase();

            synchronisationSupabaseEnCours = true;
            try {
                await appliquerDonneesSupabaseLocalement(donnees);
            } finally {
                synchronisationSupabaseEnCours = false;
            }

            console.log("🔄 Données Supabase reçues.");

        } catch (erreur) {

            console.warn(
                "⚠️ Impossible de recharger les données Supabase :",
                erreur
            );

        }

    }, 600);

}

function installerAbonnementTempsReelSupabase() {

    if (!clientSupabase || abonnementSupabase) {
        return;
    }

    try {

        abonnementSupabase = clientSupabase
            .channel("inventaire-caserne-sync")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "materiels" },
                function () {
                    programmerRechargementDepuisSupabase();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "categories" },
                function () {
                    programmerRechargementDepuisSupabase();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "materiel_categories" },
                function () {
                    programmerRechargementDepuisSupabase();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "interventions" },
                function () {
                    programmerRechargementDepuisSupabase();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "consommations" },
                function () {
                    programmerRechargementDepuisSupabase();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "archives_historique" },
                function () {
                    programmerRechargementDepuisSupabase();
                }
            )
            .subscribe(function (statut) {
                console.log("Supabase Realtime :", statut);
            });

    } catch (erreur) {
        console.warn(
            "⚠️ Impossible d'activer Supabase Realtime :",
            erreur
        );
    }

}

async function initialiserSynchronisationSupabase() {

    if (!navigator.onLine) {

        console.log(
            "📴 Hors connexion : utilisation des données locales."
        );

        synchronisationSupabaseActive =
            false;

        return;

    }


    const supabase =
        await assurerBibliothequeSupabaseDisponible();


    if (!supabase) {

        console.log(
            "ℹ️ Supabase n'est pas encore disponible. L'application reste en mode local."
        );

        return;

    }


    try {

        /*
         * IMPORTANT :
         * s'il existe un retour d'intervention enregistré hors connexion,
         * on l'envoie AVANT de télécharger les données de Supabase.
         * Sinon les données distantes pourraient écraser la copie locale
         * avant que le retour hors connexion ait été envoyé.
         */
        if (
            existeModificationsEnAttente()
        ) {

            synchronisationSupabaseEnCours =
                true;

            try {

                await envoyerDonneesLocalesVersSupabase();

                effacerModificationsEnAttente();

            } finally {

                synchronisationSupabaseEnCours =
                    false;

            }

        }


        const donneesDistantes =
            await recupererDonneesSupabase();


        const baseDistanteContientDesDonnees =
            donneesDistantes.materiels.length > 0 ||
            donneesDistantes.interventions.length > 0;


        const baseLocaleContientDesDonnees =
            materiels.length > 0 ||
            historique.length > 0;


        if (
            baseDistanteContientDesDonnees
        ) {

            await appliquerDonneesSupabaseLocalement(
                donneesDistantes
            );

        } else if (
            baseLocaleContientDesDonnees
        ) {

            synchronisationSupabaseEnCours =
                true;

            try {

                await envoyerDonneesLocalesVersSupabase();

            } finally {

                synchronisationSupabaseEnCours =
                    false;

            }

        } else {

            synchronisationSupabaseEnCours =
                true;

            try {

                await envoyerDonneesLocalesVersSupabase();

            } finally {

                synchronisationSupabaseEnCours =
                    false;

            }

        }


        synchronisationSupabaseActive =
            true;

        enregistrerSnapshotSynchronisation();


        console.log(
            "✅ Connexion Supabase opérationnelle."
        );

    } catch (erreur) {

        synchronisationSupabaseActive =
            false;

        /*
         * On NE supprime PAS le marqueur de modification en attente
         * si l'envoi échoue. Le retour hors connexion reste donc
         * conservé localement pour une prochaine tentative.
         */
        console.warn(
            "⚠️ Supabase indisponible. Les données locales en attente sont conservées.",
            erreur
        );

    }

}

window.addEventListener("online", function () {

    // Aucune synchronisation automatique ici.
    // La prochaine ouverture d'un écran ou validation lancera la synchronisation.
    console.log("🌐 Connexion Internet disponible.");

});


/* =========================================================
   OUTILS
   ========================================================= */

function genererId() {

    /*
     * Tous les identifiants créés par l'application utilisent désormais
     * le même format UUID que les tables Supabase.
     */
    return genererUUID();

}


function echapperHTML(texte) {

    return String(
        texte ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function dateAujourdhui() {

    const date =
        new Date();


    const annee =
        date.getFullYear();


    const mois =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const jour =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        annee +
        "-" +
        mois +
        "-" +
        jour
    );

}


function formaterDate(date) {

    if (!date) {

        return "";

    }


    const parties =
        String(date).split("-");


    if (
        parties.length !== 3
    ) {

        return date;

    }


    return (
        parties[2] +
        "/" +
        parties[1] +
        "/" +
        parties[0]
    );

}


/* =========================================================
   ACCUEIL
   ========================================================= */

function connecterBoutonsAccueil() {

    const inventaire =
        document.getElementById(
            "btn-inventaire"
        );


    const retour =
        document.getElementById(
            "btn-retour"
        );


    const historiqueBtn =
        document.getElementById(
            "btn-historique"
        );


    const administration =
        document.getElementById(
            "btn-administration"
        );


    if (inventaire) {

        inventaire.onclick =
            afficherInventaire;

    }


    if (retour) {

        retour.onclick =
            afficherRetourIntervention;

    }


    if (historiqueBtn) {

        historiqueBtn.onclick =
            afficherHistorique;

    }


    if (administration) {

        administration.onclick =
            ouvrirAdministration;

    }

}


function afficherAccueil() {

    initialiserStyleConnexion();

    document.body.classList.remove(
        "mode-connexion"
    );

    if (!profilUtilisateurConnecte) {
        afficherConnexion();
        return;
    }


    appliquerVisibiliteElementsConnectes(
        true
    );


    const role =
        obtenirRoleUtilisateur();

    const boutons = [];


    if (
        utilisateurAPermission(
            "acces_inventaire"
        )
    ) {

        boutons.push(`
            <button
                class="menu-button"
                type="button"
                onclick="afficherInventaire()"
            >
                <span class="menu-icon">
                    📦
                </span>
                <span>
                    <strong>
                        Inventaire
                    </strong>
                    <small>
                        Consulter le matériel
                    </small>
                </span>
            </button>
        `);

    }


    if (
        utilisateurAPermission(
            "acces_retour_intervention"
        )
    ) {

        boutons.push(`
            <button
                class="menu-button"
                type="button"
                onclick="afficherRetourIntervention()"
            >
                <span class="menu-icon">
                    🚒
                </span>
                <span>
                    <strong>
                        Retour d'intervention
                    </strong>
                    <small>
                        Enregistrer le matériel utilisé
                    </small>
                </span>
            </button>
        `);

    }


    if (
        utilisateurAPermission(
            "acces_historique"
        )
    ) {

        boutons.push(`
            <button
                class="menu-button"
                type="button"
                onclick="afficherHistorique()"
            >
                <span class="menu-icon">
                    📊
                </span>
                <span>
                    <strong>
                        Historique
                    </strong>
                    <small>
                        Consulter les consommations
                    </small>
                </span>
            </button>
        `);

    }


    if (
        utilisateurAPermission(
            "acces_administration"
        )
    ) {

        boutons.push(`
            <button
                class="menu-button"
                type="button"
                onclick="ouvrirAdministration()"
            >
                <span class="menu-icon">
                    ⚙️
                </span>
                <span>
                    <strong>
                        Administration
                    </strong>
                    <small>
                        Gestion du matériel
                    </small>
                </span>
            </button>
        `);

    }


    if (
        utilisateurEstSPVAdmin()
    ) {

        boutons.push(`
            <button
                class="menu-button"
                type="button"
                onclick="afficherMenuAdministrateurAppli()"
            >
                <span class="menu-icon">
                    🛠️
                </span>
                <span>
                    <strong>
                        Administrateur APPLI
                    </strong>
                    <small>
                        Utilisateurs et notifications
                    </small>
                </span>
            </button>
        `);

    }


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <div class="utilisateur-entete">

                <button
                    class="bouton-profil-accueil"
                    type="button"
                    onclick="afficherProfilUtilisateur()"
                >

                    <strong>
                        ${echapperHTML(
                            obtenirNomUtilisateurAffiche()
                        )}
                    </strong>

                    <span>
                        ${echapperHTML(
                            role?.nom || ""
                        )}
                    </span>

                </button>

            </div>


            <header class="accueil-header">

                <h1>
                    CIS Le Chesne
                </h1>

                <p>
                    Gestion du matériel
                </p>

            </header>


            <section class="menu-principal">

                ${boutons.join("")}

            </section>

        </main>

    `;

}

/* =========================================================
   INVENTAIRE
   ========================================================= */

async function afficherInventaire() {

    if (!verifierPermissionOuRetourAccueil(
        "acces_inventaire"
    )) {
        return;
    }


    await synchroniserAvantNavigation();

    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                type="button"
                onclick="afficherAccueil()"
            >
                ← Retour
            </button>


            <h2>Inventaire
            </h2>


            <div class="recherche">

                <input
                    type="search"
                    id="recherche-inventaire"
                    placeholder="🔎 Rechercher un matériel..."
                    autocomplete="off"
                >

            </div>


            <div id="inventaire-contenu"></div>

        </main>

    `;


    document
        .getElementById(
            "recherche-inventaire"
        )
        .addEventListener(
            "input",
            afficherResultatsInventaire
        );


    afficherResultatsInventaire();

}


function afficherResultatsInventaire() {

    const conteneur =
        document.getElementById(
            "inventaire-contenu"
        );


    if (!conteneur) {

        return;

    }


    const recherche =
        (
            document.getElementById(
                "recherche-inventaire"
            )?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    if (recherche) {

        const resultats =
            materiels.filter(
                function (materiel) {

                    return (

                        materiel.nom
                            .toLowerCase()
                            .includes(
                                recherche
                            )

                        ||

                        materiel.reference
                            .toLowerCase()
                            .includes(
                                recherche
                            )

                        ||

                        materiel.emplacement
                            .toLowerCase()
                            .includes(
                                recherche
                            )

                        ||

                        materiel.categories
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                recherche
                            )

                    );

                }
            );


        conteneur.innerHTML = `

            <h3>
                🔎 Résultats
            </h3>

        `;


        if (
            resultats.length === 0
        ) {

            conteneur.innerHTML += `

                <div class="materiel">

                    <h3>
                        ❌ Aucun résultat
                    </h3>

                </div>

            `;

            return;

        }


        resultats.forEach(
            function (materiel) {

                conteneur.innerHTML +=
                    genererCarteInventaire(
                        materiel
                    );

            }
        );


        return;

    }


    conteneur.innerHTML = "";


    categories.forEach(
        function (categorie) {

            const liste =
                materiels.filter(
                    function (materiel) {

                        return materiel.categories
                            .some(
                                function (cat) {

                                    return (
                                        cat.toLowerCase()
                                        ===
                                        categorie.toLowerCase()
                                    );

                                }
                            );

                    }
                );


            conteneur.innerHTML += `

                <section
                    class="categorie-bloc"
                >

                    <button
                        class="categorie-titre"
                        type="button"
                        onclick="
                            basculerCategorie(this)
                        "
                    >

                        <span>

                            📂
                            ${echapperHTML(
                                categorie
                            )}

                            <small>
                                ${liste.length}
                            </small>

                        </span>


                        <span>
                            ▼
                        </span>

                    </button>


                    <div
                        class="categorie-contenu"
                        style="display:none"
                    >

                        ${
                            liste.length === 0
                            ?
                            `
                            <div class="materiel">

                                <p>
                                    Aucun matériel
                                    dans cette catégorie.
                                </p>

                            </div>
                            `
                            :
                            liste
                                .map(
                                    genererCarteInventaire
                                )
                                .join("")
                        }

                    </div>

                </section>

            `;

        }
    );

}


function basculerCategorie(
    bouton
) {

    const contenu =
        bouton.nextElementSibling;


    if (!contenu) {

        return;

    }


    const ouvert =
        contenu.style.display !== "none";


    if (ouvert) {

        contenu.style.display =
            "none";


        bouton.lastElementChild
            .textContent =
            "▼";

    } else {

        contenu.style.display =
            "block";


        bouton.lastElementChild
            .textContent =
            "▲";

    }

}


/* =========================================================
   CARTE INVENTAIRE
   ========================================================= */

function genererCarteInventaire(
    materiel
) {

    const photo =
        materiel.photo
        ?
        `
        <div class="carte-photo-droite">

            <img
                src="${materiel.photo}"
                class="photo-materiel"
                alt="${echapperHTML(
                    materiel.nom
                )}"
            >

        </div>
        `
        :
        `
        <div
            class="
                carte-photo-droite
                photo-vide
            "
        >
            📦
        </div>
        `;


    const categoriesMateriel =
        materiel.categories
            .map(
                echapperHTML
            )
            .join(
                " • "
            );


    let alerte = "";


    if (
        materiel.minimum > 0 &&
        materiel.stock <=
        materiel.minimum
    ) {

        alerte = `

            <div class="alerte-stock">
                ⚠️ Stock faible
            </div>

        `;

    }


    return `

        <matériel
            class="
                materiel
                carte-materiel-horizontal
            "
        >

            <div class="carte-texte">

                <h3>
                    ${echapperHTML(
                        materiel.nom
                    )}
                </h3>


                ${
                    materiel.reference
                    ?
                    `
                    <p>

                        <strong>
                            Référence :
                        </strong>

                        ${echapperHTML(
                            materiel.reference
                        )}

                    </p>
                    `
                    :
                    ""
                }


                ${
                    materiel.description
                    ?
                    `
                    <p>
                        ${echapperHTML(
                            materiel.description
                        )}
                    </p>
                    `
                    :
                    ""
                }


                <div class="stock-ligne">

                    <span>
                        Stock :
                    </span>

                    <strong>
                        ${materiel.stock}
                    </strong>

                </div>


                ${
                    materiel.emplacement
                    ?
                    `
                    <p>
                        📍
                        ${echapperHTML(
                            materiel.emplacement
                        )}
                    </p>
                    `
                    :
                    ""
                }


                ${
                    categoriesMateriel
                    ?
                    `
                    <p class="categories-materiel">
                        ${categoriesMateriel}
                    </p>
                    `
                    :
                    ""
                }


                ${alerte}

            </div>


            ${photo}

        </matériel>

    `;

}



/* =========================================================
   INTERFACE STOCK ET QUANTITÉS
   ========================================================= */

function initialiserStylesStockEtRetour() {

    if (
        document.getElementById(
            "style-stock-retour-v21"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );

    style.id =
        "style-stock-retour-v21";

    style.textContent = `
        input[type="date"] {
            display: block;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            -webkit-appearance: none;
            appearance: none;
        }

        .quantite-retour-zone {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-top: 12px;
        }

        .quantite-controle-retour {
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            gap: 8px;
            touch-action: manipulation;
        }

        .quantite-controle-retour button {
            width: 42px;
            height: 42px;
            min-width: 42px;
            border: 1px solid #d8dce2;
            border-radius: 11px;
            background: #f4f5f7;
            color: #111;
            font-size: 24px;
            font-weight: 700;
            line-height: 1;
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .quantite-controle-retour button:active {
            transform: scale(.96);
            background: #e9ebee;
        }

        .select-quantite-retour {
            min-width: 62px;
            height: 42px;
            border: 1px solid #d8dce2;
            border-radius: 11px;
            background: #fff;
            padding: 0 25px 0 12px;
            color: #111;
            font-size: 17px;
            font-weight: 800;
            text-align: center;
            text-align-last: center;
            cursor: pointer;
            touch-action: manipulation;
        }

        .modal-stock-fond {
            position: fixed;
            inset: 0;
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 22px;
            box-sizing: border-box;
            background: rgba(0,0,0,.38);
        }

        .modal-stock-carte {
            width: min(100%, 430px);
            max-height: calc(100vh - 44px);
            overflow-y: auto;
            box-sizing: border-box;
            background: #fff;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 18px 50px rgba(0,0,0,.22);
        }

        .modal-stock-carte h3 {
            margin: 0 0 6px;
            font-size: 21px;
        }

        .modal-stock-actuel {
            margin: 0 0 18px;
            color: #62666d;
        }

        .modal-stock-bloc {
            border: 1px solid #e0e3e7;
            border-radius: 14px;
            padding: 14px;
            margin-top: 12px;
        }

        .modal-stock-bloc label {
            display: block;
            margin-bottom: 8px;
            font-weight: 800;
        }

        .modal-stock-bloc input {
            width: 100%;
            min-height: 48px;
            box-sizing: border-box;
            border: 1px solid #d5d9df;
            border-radius: 11px;
            padding: 9px 12px;
            font: inherit;
            font-size: 17px;
            background: #fff;
        }

        .modal-stock-bloc small {
            display: block;
            margin-top: 7px;
            color: #73777e;
            line-height: 1.3;
        }

        .modal-stock-actions {
            display: grid;
            gap: 9px;
            margin-top: 12px;
        }

        .modal-stock-actions button,
        .modal-stock-annuler {
            width: 100%;
            min-height: 44px;
            border: 0;
            border-radius: 11px;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
            touch-action: manipulation;
        }

        .modal-stock-actions button {
            background: #1687ff;
            color: #fff;
        }

        .modal-stock-annuler {
            margin-top: 14px;
            background: #eef0f3;
            color: #222;
        }

        @media (max-width: 520px) {
            .carte-retour-horizontal .carte-texte {
                min-width: 0;
            }

            .carte-retour-horizontal .carte-photo-droite {
                align-self: flex-start;
            }
        }
    `;


    document.head.appendChild(
        style
    );

}


function fermerFenetreStock() {

    document.getElementById(
        "modal-stock-fond"
    )?.remove();

}


function ouvrirFenetreStock(
    id
) {

    initialiserStylesStockEtRetour();


    const materiel =
        materiels.find(
            function (m) {
                return String(m.id) === String(id);
            }
        );


    if (!materiel) {
        return;
    }


    fermerFenetreStock();


    const fond =
        document.createElement(
            "div"
        );

    fond.id =
        "modal-stock-fond";

    fond.className =
        "modal-stock-fond";


    fond.innerHTML = `

        <div
            class="modal-stock-carte"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-modal-stock"
        >

            <h3 id="titre-modal-stock">
                ${echapperHTML(materiel.nom)}
            </h3>

            <p class="modal-stock-actuel">
                Stock actuel :
                <strong>
                    ${Number(materiel.stock || 0)}
                </strong>
            </p>


            <div class="modal-stock-bloc">

                <label for="stock-total-modal">
                    Stock total
                </label>

                <input
                    id="stock-total-modal"
                    type="number"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    value="${Number(materiel.stock || 0)}"
                >

                <small>
                    Permet de remplacer directement le stock actuel par le nombre indiqué.
                </small>

                <div class="modal-stock-actions">

                    <button
                        type="button"
                        onclick="enregistrerStockTotal('${String(materiel.id)}')"
                    >
                        Enregistrer le stock total
                    </button>

                </div>

            </div>


            <div class="modal-stock-bloc">

                <label for="stock-ajoute-modal">
                    Nombre rajouté au stock
                </label>

                <input
                    id="stock-ajoute-modal"
                    type="number"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    placeholder="Ex : 10"
                >

                <small>
                    Le nombre indiqué sera ajouté au stock actuel.
                </small>

                <div class="modal-stock-actions">

                    <button
                        type="button"
                        onclick="ajouterAuStock('${String(materiel.id)}')"
                    >
                        Ajouter au stock
                    </button>

                </div>

            </div>


            <button
                class="modal-stock-annuler"
                type="button"
                onclick="fermerFenetreStock()"
            >
                Annuler
            </button>

        </div>

    `;


    fond.addEventListener(
        "click",
        function (event) {

            if (event.target === fond) {
                fermerFenetreStock();
            }

        }
    );


    document.body.appendChild(
        fond
    );

}


function appliquerNouveauStock(
    materiel,
    nouveauStock
) {

    const stockFinal =
        Math.floor(
            Number(nouveauStock)
        );


    if (
        !Number.isFinite(stockFinal) ||
        stockFinal < 0
    ) {

        alert(
            "Stock invalide."
        );

        return false;
    }


    const ancienStock =
        Number(
            materiel.stock
        );


    materiel.stock =
        stockFinal;


    preparerNotificationStock(
        materiel,
        ancienStock
    );


    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


    return true;

}


function enregistrerStockTotal(
    id
) {

    const materiel =
        materiels.find(
            function (m) {
                return String(m.id) === String(id);
            }
        );


    if (!materiel) {
        return;
    }


    const valeur =
        document.getElementById(
            "stock-total-modal"
        )?.value;


    if (
        valeur === "" ||
        valeur === undefined
    ) {

        alert(
            "Indique le stock total."
        );

        return;
    }


    if (
        !appliquerNouveauStock(
            materiel,
            valeur
        )
    ) {
        return;
    }


    fermerFenetreStock();

    alert(
        "Stock modifié."
    );

    gestionMateriels();

}


function ajouterAuStock(
    id
) {

    const materiel =
        materiels.find(
            function (m) {
                return String(m.id) === String(id);
            }
        );


    if (!materiel) {
        return;
    }


    const valeur =
        Number(
            document.getElementById(
                "stock-ajoute-modal"
            )?.value
        );


    if (
        !Number.isFinite(valeur) ||
        valeur <= 0
    ) {

        alert(
            "Indique un nombre à ajouter supérieur à 0."
        );

        return;
    }


    const nouveauStock =
        Number(
            materiel.stock || 0
        ) +
        Math.floor(
            valeur
        );


    if (
        !appliquerNouveauStock(
            materiel,
            nouveauStock
        )
    ) {
        return;
    }


    fermerFenetreStock();

    alert(
        "Stock ajouté."
    );

    gestionMateriels();

}


/* =========================================================
   RETOUR D'INTERVENTION
   ========================================================= */

async function afficherRetourIntervention() {

    initialiserStylesStockEtRetour();

    if (!verifierPermissionOuRetourAccueil(
        "acces_retour_intervention"
    )) {
        return;
    }


    await synchroniserAvantNavigation();

    consommationsEnCours = {};


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherAccueil()"
            >
                ← Retour
            </button>


            <h2>Retour d'intervention
            </h2>


            <div class="formulaire">

                <label>
                    Date
                </label>


                <input
                    type="date"
                    id="date-intervention"
                    value="${dateAujourdhui()}"
                >


                <label>
                    Numéro d'intervention
                </label>


                <input
                    type="text"
                    id="numero-intervention"
                    placeholder="Ex : 2026-001"
                >

            </div>


            <div class="recherche">

                <input
                    type="search"
                    id="recherche-retour"
                    placeholder="🔎 Rechercher un matériel..."
                >

            </div>


            <div
                id="categories-retour"
            ></div>


            <div
                id="resultats-retour"
                style="display:none"
            ></div>


            <div
                id="resume-consommation"
            ></div>


            <button
                class="add-button"
                onclick="
                    validerRetourIntervention()
                "
            >

                ✓ Enregistrer le retour

            </button>

        </main>

    `;


    document
        .getElementById(
            "recherche-retour"
        )
        .addEventListener(
            "input",
            rechercherMaterielRetour
        );


    afficherCategoriesRetour();

}


function afficherCategoriesRetour() {

    const conteneur =
        document.getElementById(
            "categories-retour"
        );


    if (!conteneur) {

        return;

    }


    conteneur.innerHTML = "";


    categories.forEach(
        function (categorie) {

            const liste =
                materiels.filter(
                    function (materiel) {

                        return materiel.categories
                            .some(
                                function (cat) {

                                    return (
                                        cat.toLowerCase()
                                        ===
                                        categorie.toLowerCase()
                                    );

                                }
                            );

                    }
                );


            conteneur.innerHTML += `

                <section
                    class="categorie-bloc"
                >

                    <button
                        class="categorie-titre"
                        type="button"
                        onclick="
                            basculerCategorie(this)
                        "
                    >

                        <span>

                            📂
                            ${echapperHTML(
                                categorie
                            )}

                            <small>
                                ${liste.length}
                            </small>

                        </span>


                        <span>
                            ▼
                        </span>

                    </button>


                    <div
                        class="categorie-contenu"
                        style="display:none"
                    >

                        ${
                            liste
                                .map(
                                    genererCarteRetour
                                )
                                .join("")
                        }

                    </div>

                </section>

            `;

        }
    );

}


/* =========================================================
   CARTE RETOUR
   ========================================================= */

function genererCarteRetour(
    materiel
) {

    const id =
        String(
            materiel.id
        );


    const quantite =
        Number(
            consommationsEnCours[id] ||
            0
        );


    const photo =
        materiel.photo
        ?
        `
        <div class="carte-photo-droite">

            <img
                src="${materiel.photo}"
                class="photo-materiel"
                alt="${echapperHTML(
                    materiel.nom
                )}"
            >

        </div>
        `
        :
        `
        <div
            class="
                carte-photo-droite
                photo-vide
            "
        >
            📦
        </div>
        `;


    let optionsQuantite =
        `<option value="0" ${quantite === 0 ? "selected" : ""}>0</option>`;


    for (
        let nombre = 1;
        nombre <= 99;
        nombre += 1
    ) {

        const indisponible =
            nombre >
            Number(
                materiel.stock
            );

        optionsQuantite += `
            <option
                value="${nombre}"
                ${nombre === quantite ? "selected" : ""}
                ${indisponible ? "disabled" : ""}
            >
                ${nombre}
            </option>
        `;

    }


    return `

        <matériel
            class="
                materiel
                carte-materiel-horizontal
                carte-retour-horizontal
            "
        >

            <div class="carte-texte">

                <h3>
                    ${echapperHTML(
                        materiel.nom
                    )}
                </h3>


                ${
                    materiel.reference
                    ?
                    `
                    <p>
                        Référence :
                        ${echapperHTML(
                            materiel.reference
                        )}
                    </p>
                    `
                    :
                    ""
                }


                <p>
                    Stock :
                    <strong>
                        ${materiel.stock}
                    </strong>
                </p>


                <div class="quantite-retour-zone">

                    <div class="quantite-controle-retour">

                        <button
                            type="button"
                            aria-label="Diminuer"
                            onclick="diminuerConsommation('${id}')"
                        >
                            −
                        </button>


                        <select
                            class="select-quantite-retour"
                            id="quantite-retour-${id}"
                            aria-label="Quantité utilisée"
                            onchange="selectionnerQuantiteRetour('${id}', this.value)"
                        >
                            ${optionsQuantite}
                        </select>


                        <button
                            type="button"
                            aria-label="Augmenter"
                            onclick="augmenterConsommation('${id}')"
                        >
                            +
                        </button>

                    </div>

                </div>

            </div>


            ${photo}

        </matériel>

    `;

}

/* =========================================================
   AUGMENTER / DIMINUER
   ========================================================= */

function augmenterConsommation(
    id
) {

    const materiel =
        materiels.find(
            function (m) {

                return (
                    String(m.id) ===
                    String(id)
                );

            }
        );


    if (!materiel) {

        return;

    }


    const cle =
        String(id);


    const actuelle =
        Number(
            consommationsEnCours[cle]
            ||
            0
        );


    if (
        actuelle >=
        Number(
            materiel.stock
        )
    ) {

        alert(
            "⚠️ Stock disponible insuffisant."
        );

        return;

    }


    consommationsEnCours[cle] =
        actuelle + 1;


    mettreAJourQuantiteRetour(
        cle
    );


    mettreAJourResume();

}


function diminuerConsommation(
    id
) {

    const cle =
        String(id);


    const actuelle =
        Number(
            consommationsEnCours[cle]
            ||
            0
        );


    if (
        actuelle <= 0
    ) {

        return;

    }


    const nouvelle =
        actuelle - 1;


    if (
        nouvelle === 0
    ) {

        delete consommationsEnCours[
            cle
        ];

    } else {

        consommationsEnCours[cle] =
            nouvelle;

    }


    mettreAJourQuantiteRetour(
        cle
    );


    mettreAJourResume();

}



function selectionnerQuantiteRetour(
    id,
    valeur
) {

    const cle =
        String(id);


    const materiel =
        materiels.find(
            function (m) {
                return String(m.id) === cle;
            }
        );


    if (!materiel) {
        return;
    }


    let quantite =
        Math.floor(
            Number(
                valeur
            )
        );


    if (
        !Number.isFinite(quantite) ||
        quantite < 0
    ) {
        quantite = 0;
    }


    quantite =
        Math.min(
            99,
            quantite
        );


    if (
        quantite >
        Number(
            materiel.stock
        )
    ) {

        alert(
            "Stock disponible insuffisant."
        );

        quantite =
            Math.min(
                99,
                Number(
                    materiel.stock
                )
            );

    }


    if (
        quantite <= 0
    ) {

        delete consommationsEnCours[
            cle
        ];

    } else {

        consommationsEnCours[cle] =
            quantite;

    }


    mettreAJourQuantiteRetour(
        cle
    );


    mettreAJourResume();

}


/* =========================================================
   MISE A JOUR DU COMPTEUR
   ========================================================= */

function mettreAJourQuantiteRetour(
    id
) {

    const cle =
        String(id);


    const element =
        document.getElementById(
            "quantite-retour-" +
            cle
        );


    if (!element) {

        console.error(
            "Élément quantité introuvable pour :",
            cle
        );

        return;

    }


    const valeur =
        String(
            consommationsEnCours[cle]
            ||
            0
        );


    if (
        element.tagName ===
        "SELECT"
    ) {

        element.value =
            valeur;

    } else {

        element.textContent =
            valeur;

    }

}


/* =========================================================
   RECHERCHE RETOUR
   ========================================================= */

function rechercherMaterielRetour() {

    const champ =
        document.getElementById(
            "recherche-retour"
        );


    const categoriesConteneur =
        document.getElementById(
            "categories-retour"
        );


    const resultatsConteneur =
        document.getElementById(
            "resultats-retour"
        );


    if (
        !champ ||
        !categoriesConteneur ||
        !resultatsConteneur
    ) {

        return;

    }


    const texte =
        champ.value
            .trim()
            .toLowerCase();


    if (!texte) {

        categoriesConteneur.style.display =
            "block";


        resultatsConteneur.style.display =
            "none";


        return;

    }


    const resultats =
        materiels.filter(
            function (materiel) {

                return (

                    materiel.nom
                        .toLowerCase()
                        .includes(
                            texte
                        )

                    ||

                    materiel.reference
                        .toLowerCase()
                        .includes(
                            texte
                        )

                    ||

                    materiel.categories
                        .join(" ")
                        .toLowerCase()
                        .includes(
                            texte
                        )

                );

            }
        );


    categoriesConteneur.style.display =
        "none";


    resultatsConteneur.style.display =
        "block";


    resultatsConteneur.innerHTML = `

        <h3>
            🔎 Résultats
        </h3>

    `;


    if (
        resultats.length === 0
    ) {

        resultatsConteneur.innerHTML += `

            <div class="materiel">

                <h3>
                    ❌ Aucun résultat
                </h3>

            </div>

        `;

        return;

    }


    resultatsConteneur.innerHTML +=
        resultats
            .map(
                genererCarteRetour
            )
            .join("");

}


/* =========================================================
   RESUME CONSOMMATION
   ========================================================= */

function mettreAJourResume() {

    const conteneur =
        document.getElementById(
            "resume-consommation"
        );


    if (!conteneur) {

        return;

    }


    const ids =
        Object.keys(
            consommationsEnCours
        );


    if (
        ids.length === 0
    ) {

        conteneur.innerHTML =
            "";

        return;

    }


    let html = `

        <div
            class="resume"
        >

            <h3>
                📋 Matériel sélectionné
            </h3>

    `;


    ids.forEach(
        function (id) {

            const materiel =
                materiels.find(
                    function (m) {

                        return (
                            String(m.id) ===
                            String(id)
                        );

                    }
                );


            if (!materiel) {

                return;

            }


            html += `

                <p>

                    ${echapperHTML(
                        materiel.nom
                    )}

                    :

                    <strong>
                        ${consommationsEnCours[id]}
                    </strong>

                </p>

            `;

        }
    );


    html += `
        </div>
    `;


    conteneur.innerHTML =
        html;

}


/* =========================================================
   VALIDATION RETOUR
   ========================================================= */

async function validerRetourIntervention() {

    if (
        validationRetourInterventionEnCours
    ) {

        return;

    }

    const date =
        document.getElementById(
            "date-intervention"
        )?.value;


    const numero =
        document.getElementById(
            "numero-intervention"
        )?.value.trim();


    if (!date) {

        alert(
            "Veuillez renseigner la date."
        );

        return;

    }


    if (!numero) {

        alert(
            "Veuillez renseigner le numéro d'intervention."
        );

        return;

    }


    const ids =
        Object.keys(
            consommationsEnCours
        );


    if (
        ids.length === 0
    ) {

        alert(
            "Veuillez sélectionner au moins un matériel."
        );

        return;

    }


    for (
        let i = 0;
        i < ids.length;
        i++
    ) {

        const id =
            ids[i];


        const materiel =
            materiels.find(
                function (m) {

                    return (
                        String(m.id) ===
                        String(id)
                    );

                }
            );


        if (!materiel) {

            continue;

        }


        const quantite =
            Number(
                consommationsEnCours[id]
            );


        if (
            quantite >
            Number(
                materiel.stock
            )
        ) {

            alert(
                "Stock insuffisant pour : " +
                materiel.nom
            );

            return;

        }

    }


    if (
        !await afficherConfirmationCIS(
            "Confirmer l'enregistrement du retour d'intervention ?"
        )
    ) {

        return;

    }


    validationRetourInterventionEnCours =
        true;


    const consommations = [];


    ids.forEach(
        function (id) {

            const materiel =
                materiels.find(
                    function (m) {

                        return (
                            String(m.id) ===
                            String(id)
                        );

                    }
                );


            if (!materiel) {

                return;

            }


            const quantite =
                Number(
                    consommationsEnCours[id]
                );


            const ancienStock =
                Number(
                    materiel.stock
                );


            materiel.stock =
                Math.max(
                    0,
                    ancienStock -
                    quantite
                );


            preparerNotificationStock(
                materiel,
                ancienStock
            );


            consommations.push({

                materielId:
                    materiel.id,

                materiel:
                    materiel.nom,

                quantite:
                    quantite

            });

        }
    );


    historique.push({

        id:
            genererUUID(),

        date:
            date,

        numeroIntervention:
            numero,

        createdBy:
            String(utilisateurConnecte?.id || ""),

        createdByPrenom:
            String(profilUtilisateurConnecte?.prenom || ""),

        createdByNom:
            String(profilUtilisateurConnecte?.nom || ""),

        createdAt:
            new Date().toISOString(),

        consommations:
            consommations,

        synchronisationEnAttente:
            !navigator.onLine

    });


    sauvegarderToutesLesDonnees();


    consommationsEnCours = {};


    try {

        const synchronise =
            await synchroniserApresModification();

        if (!navigator.onLine) {

            alert(
                "✅ Retour enregistré hors connexion. Il sera synchronisé plus tard."
            );

        } else if (synchronise) {

            alert(
                "✅ Retour d'intervention enregistré et synchronisé !"
            );

        } else {

            alert(
                "⚠️ Retour enregistré sur cet appareil, mais la synchronisation avec la base de données a échoué. Les données sont conservées et pourront être renvoyées."
            );

        }

        await afficherHistorique();

    } finally {

        validationRetourInterventionEnCours =
            false;

    }

}


/* =========================================================
   HISTORIQUE
   ========================================================= */

async function afficherHistorique() {

    if (!verifierPermissionOuRetourAccueil(
        "acces_historique"
    )) {
        return;
    }


    await synchroniserAvantNavigation();

    initialiserStylesArchivesHistorique();

    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherAccueil()"
            >
                ← Retour
            </button>


            <h2>Historique
            </h2>


            <h3>Total consommé par matériel
            </h3>


            <div
                id="historique-total"
            ></div>


            <h3
                class="titre-interventions"
            >Historique des interventions
            </h3>


            <div
                id="historique-interventions"
            ></div>


            ${
                utilisateurAPermission("acces_archives")
                    ? `
                        <div class="archives-historique-lien-zone">
                            <button
                                type="button"
                                class="archives-historique-lien"
                                onclick="afficherArchivesHistorique()"
                            >
                                Consulter les archives
                            </button>
                        </div>
                    `
                    : ""
            }

        </main>

    `;


    afficherHistoriqueTotal();

    afficherHistoriqueInterventions();

}



/* =========================================================
   ARCHIVES DE L'HISTORIQUE
   ========================================================= */

function initialiserStylesArchivesHistorique() {

    if (
        document.getElementById(
            "style-archives-historique"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");

    style.id =
        "style-archives-historique";

    style.textContent = `
        .archives-historique-lien-zone {
            margin: 28px 0 14px;
            text-align: center;
        }

        .archives-historique-lien {
            border: 0;
            padding: 8px 10px;
            background: transparent;
            color: #1687ff;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            touch-action: manipulation;
        }

        .archive-periode {
            margin-bottom: 28px;
        }

        .archive-commande {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            box-sizing: border-box;
            margin: 0 0 10px;
            padding: 16px 18px;
            border: 0;
            border-radius: 14px;
            background: #218c4b;
            color: #fff;
            text-align: left;
            font: inherit;
            cursor: pointer;
            box-shadow: 0 5px 16px rgba(0,0,0,.12);
            touch-action: manipulation;
        }

        .archive-commande strong {
            display: block;
            font-size: 17px;
            line-height: 1.25;
        }

        .archive-commande small {
            display: block;
            margin-top: 4px;
            color: rgba(255,255,255,.86);
            font-size: 13px;
        }

        .archive-commande .fleche-detail {
            color: #fff;
            font-size: 28px;
        }

        .archive-interventions-titre {
            margin: 11px 4px 8px;
            color: #70757a;
            font-size: 13px;
            font-weight: 700;
        }

        .archive-vide {
            margin-top: 18px;
        }
    `;


    document.head.appendChild(style);

}


function trouverArchiveHistorique(
    archiveId
) {

    return archivesHistorique.find(
        function (archive) {

            return (
                String(archive.id) ===
                String(archiveId)
            );

        }
    );

}


function calculerTotauxArchive(
    archive
) {

    const totaux =
        new Map();


    (
        Array.isArray(archive?.interventions)
            ? archive.interventions
            : []
    ).forEach(
        function (intervention) {

            (
                Array.isArray(
                    intervention.consommations
                )
                    ? intervention.consommations
                    : []
            ).forEach(
                function (consommation) {

                    const id =
                        String(
                            consommation.materielId ||
                            consommation.materiel ||
                            ""
                        );

                    if (!id) {
                        return;
                    }

                    const ancienne =
                        totaux.get(id) || {
                            materielId:
                                String(
                                    consommation.materielId ||
                                    ""
                                ),
                            materiel:
                                String(
                                    consommation.materiel ||
                                    "Matériel"
                                ),
                            quantite: 0
                        };

                    ancienne.quantite +=
                        Math.max(
                            0,
                            Number(
                                consommation.quantite ||
                                0
                            )
                        );

                    totaux.set(
                        id,
                        ancienne
                    );

                }
            );

        }
    );


    return Array.from(
        totaux.values()
    ).sort(
        function (a, b) {

            return (
                b.quantite -
                a.quantite
            );

        }
    );

}


async function afficherArchivesHistorique() {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_archives"
        )
    ) {
        return;
    }


    await synchroniserAvantNavigation();

    initialiserStylesArchivesHistorique();


    const archivesTriees =
        [...archivesHistorique]
            .sort(
                function (a, b) {

                    const dateCreationA =
                        Date.parse(
                            a.createdAt ||
                            a.created_at ||
                            ""
                        );

                    const dateCreationB =
                        Date.parse(
                            b.createdAt ||
                            b.created_at ||
                            ""
                        );

                    if (
                        Number.isFinite(dateCreationA) &&
                        Number.isFinite(dateCreationB) &&
                        dateCreationA !== dateCreationB
                    ) {
                        return dateCreationB - dateCreationA;
                    }

                    return String(
                        b.date || ""
                    ).localeCompare(
                        String(a.date || "")
                    );

                }
            );


    let contenu = "";


    if (
        archivesTriees.length === 0
    ) {

        contenu = `

            <div
                class="materiel archive-vide"
            >
                Aucune archive pour le moment.
            </div>

        `;

    } else {

        contenu =
            archivesTriees.map(
                function (archive) {

                    const interventions =
                        Array.isArray(
                            archive.interventions
                        )
                            ? archive.interventions
                            : [];


                    const cartesInterventions =
                        [...interventions]
                            .reverse()
                            .map(
                                function (intervention) {

                                    const total =
                                        (
                                            Array.isArray(
                                                intervention.consommations
                                            )
                                                ? intervention.consommations
                                                : []
                                        ).reduce(
                                            function (
                                                somme,
                                                consommation
                                            ) {

                                                return (
                                                    somme +
                                                    Number(
                                                        consommation.quantite ||
                                                        0
                                                    )
                                                );

                                            },
                                            0
                                        );


                                    return `

                                        <button
                                            type="button"
                                            class="
                                                detail-historique
                                                intervention-cliquable
                                            "
                                            onclick="
                                                afficherDetailInterventionArchive(
                                                    '${archive.id}',
                                                    '${intervention.id}'
                                                )
                                            "
                                        >

                                            <div>

                                                <strong>
                                                    Intervention
                                                    ${echapperHTML(
                                                        intervention.numeroIntervention ||
                                                        ""
                                                    )}
                                                </strong>

                                                <span>
                                                    ${formaterDate(
                                                        intervention.date
                                                    )}
                                                </span>

                                                <small>
                                                    Cliquer pour voir le détail
                                                </small>

                                            </div>


                                            <div
                                                class="intervention-total"
                                            >

                                                <strong>
                                                    ${total}
                                                </strong>

                                                <span>
                                                    utilisés
                                                </span>

                                            </div>


                                            <span
                                                class="fleche-detail"
                                            >
                                                ›
                                            </span>

                                        </button>

                                    `;

                                }
                            )
                            .join("");


                    return `

                        <section
                            class="archive-periode"
                        >

                            <button
                                type="button"
                                class="archive-commande"
                                onclick="
                                    afficherDetailCommandeArchive(
                                        '${archive.id}'
                                    )
                                "
                            >

                                <div>

                                    <strong>
                                        Commande effectuée
                                    </strong>

                                    <small>
                                        ${formaterDate(
                                            archive.date
                                        )}
                                    </small>

                                </div>


                                <span
                                    class="fleche-detail"
                                >
                                    ›
                                </span>

                            </button>


                            <div
                                class="archive-interventions-titre"
                            >
                                Interventions archivées
                            </div>


                            ${
                                cartesInterventions ||
                                `
                                    <div class="materiel">
                                        Aucune intervention.
                                    </div>
                                `
                            }

                        </section>

                    `;

                }
            ).join("");

    }


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherHistorique()"
            >
                ← Retour
            </button>


            <h2>
                Archives de l'historique
            </h2>


            ${contenu}

        </main>

    `;

}


function afficherDetailCommandeArchive(
    archiveId
) {

    initialiserStylesReapprovisionnementArchive();

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_historique"
        )
    ) {
        return;
    }


    const archive =
        trouverArchiveHistorique(
            archiveId
        );


    if (!archive) {

        alert(
            "Archive introuvable."
        );

        return;

    }


    const totaux =
        calculerTotauxArchive(
            archive
        );


    const lignes =
        totaux.length > 0
            ? totaux.map(
                function (ligne) {

                    return `

                        <div
                            class="detail-historique"
                        >

                            <div>

                                <strong>
                                    ${echapperHTML(
                                        ligne.materiel
                                    )}
                                </strong>

                            </div>


                            <strong
                                class="detail-quantite"
                            >
                                ${ligne.quantite}
                            </strong>

                        </div>

                    `;

                }
            ).join("")
            : `
                <div class="materiel">
                    Aucun matériel consommé.
                </div>
            `;


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherArchivesHistorique()"
            >
                ← Retour
            </button>


            <h2>
                Commande effectuée
            </h2>


            <div
                class="detail-header"
            >

                <strong>
                    Consommations depuis la remise à zéro précédente
                </strong>

                <span>
                    Date :
                    ${formaterDate(
                        archive.date
                    )}
                </span>

                <span>
                    ${
                        Array.isArray(
                            archive.interventions
                        )
                            ? archive.interventions.length
                            : 0
                    }
                    intervention(s)
                </span>

            </div>


            <h3>
                Matériel consommé
            </h3>


            ${lignes}


            ${
                utilisateurAPermission(
                    "acces_administration"
                )
                    ? `
                        <button
                            type="button"
                            class="archive-reappro-bouton"
                            onclick="afficherReapprovisionnementArchive('${String(archive.id)}')"
                        >
                            Réapprovisionnement rapide
                        </button>
                    `
                    : ""
            }

        </main>

    `;

}


function afficherDetailInterventionArchive(
    archiveId,
    interventionId
) {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_historique"
        )
    ) {
        return;
    }


    const archive =
        trouverArchiveHistorique(
            archiveId
        );


    const intervention =
        archive &&
        Array.isArray(
            archive.interventions
        )
            ? archive.interventions.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(interventionId)
                    );

                }
            )
            : null;


    if (!intervention) {

        alert(
            "Intervention archivée introuvable."
        );

        return;

    }


    const consommations =
        Array.isArray(
            intervention.consommations
        )
            ? intervention.consommations
            : [];


    const lignes =
        consommations.length > 0
            ? consommations.map(
                function (consommation) {

                    return `

                        <div
                            class="detail-historique"
                        >

                            <div>

                                <strong>
                                    ${echapperHTML(
                                        consommation.materiel ||
                                        "Matériel"
                                    )}
                                </strong>

                            </div>


                            <strong
                                class="detail-quantite"
                            >
                                ${
                                    Number(
                                        consommation.quantite ||
                                        0
                                    )
                                }
                            </strong>

                        </div>

                    `;

                }
            ).join("")
            : `
                <div class="materiel">
                    Aucun matériel enregistré pour cette intervention.
                </div>
            `;


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherArchivesHistorique()"
            >
                ← Retour
            </button>


            <h2>
                Détail de l'intervention
            </h2>


            <div
                class="detail-header"
            >

                <strong>
                    Intervention
                    ${echapperHTML(
                        intervention.numeroIntervention ||
                        ""
                    )}
                </strong>

                <span>
                    Date :
                    ${formaterDate(
                        intervention.date
                    )}
                </span>

                <span>
                    Noté par :
                    ${echapperHTML(
                        (intervention.createdByPrenom || intervention.created_by_prenom || "") +
                        ((intervention.createdByPrenom || intervention.created_by_prenom) && (intervention.createdByNom || intervention.created_by_nom) ? " " : "") +
                        (intervention.createdByNom || intervention.created_by_nom || "Non renseigné")
                    )}
                </span>

            </div>


            <h3>
                Matériel utilisé
            </h3>


            ${lignes}

        </main>

    `;

}



/* =========================================================
   REAPPROVISIONNEMENT RAPIDE DEPUIS UNE ARCHIVE
   ========================================================= */

function initialiserStylesReapprovisionnementArchive() {

    if (
        document.getElementById(
            "style-reapprovisionnement-archive"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "style-reapprovisionnement-archive";

    style.textContent = `
        .menu-reapprovisionnement-admin {
            background: #14532d !important;
            color: #ffffff !important;
            border-color: #14532d !important;
        }

        .menu-reapprovisionnement-admin strong,
        .menu-reapprovisionnement-admin small {
            color: #ffffff !important;
        }

        .archive-reappro-bouton {
            display: block;
            width: 100%;
            max-width: 460px;
            min-height: 54px;
            margin: 28px auto 8px;
            padding: 13px 18px;
            border: 0;
            border-radius: 15px;
            background: #14532d;
            color: #fff;
            font: inherit;
            font-size: 16px;
            font-weight: 850;
            letter-spacing: .01em;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(20,83,45,.23);
        }

        .reappro-page {
            min-height: 100vh;
            min-height: 100dvh;
            box-sizing: border-box;
            margin: 0;
            padding:
                calc(18px + env(safe-area-inset-top, 0px))
                14px
                calc(30px + env(safe-area-inset-bottom, 0px));
            background:
                linear-gradient(180deg, #10261d 0, #16372a 190px, #edf1ec 190px);
            color: #172019;
        }

        .reappro-retour {
            display: inline-flex;
            align-items: center;
            min-height: 42px;
            padding: 8px 12px;
            border: 1px solid rgba(255,255,255,.28);
            border-radius: 999px;
            background: rgba(255,255,255,.10);
            color: #fff;
            font: inherit;
            font-weight: 800;
            cursor: pointer;
        }

        .reappro-entete {
            padding: 24px 4px 28px;
            color: #fff;
        }

        .reappro-entete .reappro-sur-titre {
            margin: 0 0 6px;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: .16em;
            text-transform: uppercase;
            opacity: .72;
        }

        .reappro-entete h2 {
            margin: 0;
            font-size: clamp(27px, 8vw, 38px);
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.035em;
        }

        .reappro-entete p {
            margin: 12px 0 0;
            max-width: 520px;
            color: rgba(255,255,255,.78);
            line-height: 1.45;
            font-size: 14px;
        }

        .reappro-feuille {
            width: min(100%, 680px);
            margin: 0 auto;
            box-sizing: border-box;
            padding: 18px;
            border-radius: 6px;
            background: #fffefa;
            box-shadow:
                0 18px 42px rgba(17,41,30,.18),
                inset 0 0 0 1px rgba(30,45,35,.05);
        }

        .reappro-meta {
            display: flex;
            justify-content: space-between;
            gap: 14px;
            align-items: baseline;
            padding-bottom: 14px;
            margin-bottom: 6px;
            border-bottom: 2px solid #1b3829;
            font-size: 13px;
        }

        .reappro-meta strong {
            font-size: 15px;
        }

        .reappro-section-titre {
            margin: 20px 0 10px;
            font-size: 12px;
            line-height: 1.2;
            text-transform: uppercase;
            letter-spacing: .11em;
            font-weight: 900;
            color: #5d6d63;
        }

        .reappro-ligne {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 92px;
            gap: 12px;
            align-items: center;
            padding: 13px 0;
            border-bottom: 1px dashed #c9cec9;
        }

        .reappro-nom {
            min-width: 0;
            font-weight: 850;
            line-height: 1.25;
            overflow-wrap: anywhere;
        }

        .reappro-stock {
            display: block;
            margin-top: 4px;
            color: #748078;
            font-size: 12px;
            font-weight: 650;
        }

        .reappro-quantite {
            width: 100%;
            min-width: 0;
            height: 46px;
            box-sizing: border-box;
            border: 2px solid #bac2bc;
            border-radius: 5px;
            padding: 7px 8px;
            background: #fff;
            color: #172019;
            font: inherit;
            font-size: 18px;
            font-weight: 850;
            text-align: center;
            outline: none;
        }

        .reappro-quantite:focus {
            border-color: #1c5a36;
            box-shadow: 0 0 0 3px rgba(28,90,54,.10);
        }

        .reappro-ajout-zone {
            margin-top: 22px;
            padding-top: 16px;
            border-top: 3px double #c5cbc6;
        }

        .reappro-ajouter {
            width: 100%;
            min-height: 48px;
            border: 2px solid #1c5a36;
            border-radius: 5px;
            background: transparent;
            color: #17472c;
            font: inherit;
            font-weight: 900;
            cursor: pointer;
        }

        .reappro-ligne-supplementaire {
            grid-template-columns: minmax(0, 1fr) 86px 36px;
            align-items: start;
        }

        .reappro-recherche-wrap {
            position: relative;
            min-width: 0;
        }

        .reappro-recherche {
            width: 100%;
            min-width: 0;
            min-height: 46px;
            box-sizing: border-box;
            border: 2px solid #bac2bc;
            border-radius: 5px;
            padding: 7px 10px;
            background: #fff;
            color: #172019;
            font: inherit;
            font-weight: 750;
            outline: none;
        }

        .reappro-recherche:focus {
            border-color: #1c5a36;
            box-shadow: 0 0 0 3px rgba(28,90,54,.10);
        }

        .reappro-resultats {
            display: none;
            position: absolute;
            z-index: 20;
            left: 0;
            right: 0;
            top: calc(100% + 4px);
            max-height: 240px;
            overflow-y: auto;
            border: 1px solid #b9c1bb;
            border-radius: 6px;
            background: #fff;
            box-shadow: 0 10px 24px rgba(16,38,29,.18);
        }

        .reappro-resultats.ouvert {
            display: block;
        }

        .reappro-resultat {
            display: block;
            width: 100%;
            border: 0;
            border-bottom: 1px solid #edf0ed;
            padding: 11px 12px;
            background: #fff;
            color: #172019;
            text-align: left;
            font: inherit;
            cursor: pointer;
        }

        .reappro-resultat:last-child {
            border-bottom: 0;
        }

        .reappro-resultat strong {
            display: block;
            font-size: 14px;
        }

        .reappro-resultat small {
            display: block;
            margin-top: 3px;
            color: #6d776f;
            font-size: 11px;
        }

        .reappro-recherche-vide {
            padding: 11px 12px;
            color: #6d776f;
            font-size: 13px;
        }

        .reappro-supprimer-ligne {
            width: 36px;
            height: 36px;
            padding: 0;
            border: 0;
            border-radius: 50%;
            background: #ecefec;
            color: #5b665f;
            font: inherit;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
        }

        .reappro-validation {
            width: 100%;
            min-height: 56px;
            margin-top: 24px;
            border: 0;
            border-radius: 5px;
            background: #10261d;
            color: #fff;
            font: inherit;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 8px 18px rgba(16,38,29,.18);
        }

        .reappro-note {
            margin: 10px 0 0;
            color: #69756d;
            font-size: 12px;
            line-height: 1.4;
            text-align: center;
        }

        @media (max-width: 430px) {
            .reappro-feuille {
                padding: 15px 14px 17px;
            }

            .reappro-ligne {
                grid-template-columns: minmax(0, 1fr) 78px;
                gap: 9px;
            }

            .reappro-ligne-supplementaire {
                grid-template-columns: minmax(0, 1fr) 72px 34px;
                gap: 7px;
            }
        }
    `;

    document.head.appendChild(
        style
    );

}


function trouverMaterielDepuisLigneArchive(
    ligne
) {

    const id =
        String(
            ligne?.materielId ||
            ""
        );

    if (id) {

        const parId =
            materiels.find(
                function (materiel) {

                    return (
                        String(materiel.id) ===
                        id
                    );

                }
            );

        if (parId) {
            return parId;
        }

    }


    const nom =
        String(
            ligne?.materiel ||
            ""
        )
            .trim()
            .toLocaleLowerCase();


    if (!nom) {
        return null;
    }


    return (
        materiels.find(
            function (materiel) {

                return (
                    String(
                        materiel.nom ||
                        ""
                    )
                        .trim()
                        .toLocaleLowerCase() ===
                    nom
                );

            }
        ) ||
        null
    );

}


async function afficherReapprovisionnementArchive(
    archiveId
) {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_reapprovisionnement",
            "Vous n'avez pas accès au réapprovisionnement."
        )
    ) {
        return;
    }


    await synchroniserAvantNavigation();

    initialiserStylesReapprovisionnementArchive();


    const archive =
        trouverArchiveHistorique(
            archiveId
        );


    if (!archive) {

        alert(
            "Archive introuvable."
        );

        afficherArchivesHistorique();

        return;
    }


    const materielsDejaAjoutes =
        new Set();


    const lignesConsommees =
        calculerTotauxArchive(
            archive
        )
            .map(
                trouverMaterielDepuisLigneArchive
            )
            .filter(
                function (materiel) {

                    if (
                        !materiel ||
                        materielsDejaAjoutes.has(
                            String(materiel.id)
                        )
                    ) {
                        return false;
                    }

                    materielsDejaAjoutes.add(
                        String(materiel.id)
                    );

                    return true;

                }
            );


    const lignesHTML =
        lignesConsommees.length > 0
            ? lignesConsommees.map(
                function (materiel) {

                    return `
                        <div
                            class="reappro-ligne reappro-ligne-consommee"
                            data-materiel-id="${echapperHTML(String(materiel.id))}"
                        >
                            <div>
                                <div class="reappro-nom">
                                    ${echapperHTML(materiel.nom)}
                                </div>
                                <span class="reappro-stock">
                                    Stock actuel :
                                    ${Number(materiel.stock || 0)}
                                </span>
                            </div>

                            <select
            class="reappro-quantite"
            aria-label="Quantité à ajouter"
        >
            <option value="">Quantité</option>
            ${Array.from({ length: 99 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join("")}
        </select>
                        </div>
                    `;

                }
            ).join("")
            : `
                <div class="reappro-note">
                    Aucun matériel consommé de cette archive n'existe encore dans l'inventaire.
                </div>
            `;


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="reappro-page">

            <button
                type="button"
                class="reappro-retour"
                onclick="afficherDetailCommandeArchive('${String(archive.id)}')"
            >
                ← Retour à la commande
            </button>


            <header class="reappro-entete">

                <p class="reappro-sur-titre">
                    Pharmacie · Stock
                </p>

                <h2>
                    Réapprovisionnement
                </h2>


            </header>


            <section class="reappro-feuille">

                <div class="reappro-meta">
                    <strong>
                        Commande du
                        ${formaterDate(archive.date)}
                    </strong>

                    <span>
                        ${lignesConsommees.length}
                        matériel(s)
                    </span>
                </div>


                <div class="reappro-section-titre">
                    Matériels issus de la commande
                </div>


                <div id="reappro-lignes-consommees">
                    ${lignesHTML}
                </div>


                <div class="reappro-ajout-zone">

                    <div class="reappro-section-titre">
                        Compléter la livraison
                    </div>

                    <div id="reappro-lignes-supplementaires"></div>

                    <button
                        type="button"
                        class="reappro-ajouter"
                        onclick="ajouterLigneReapprovisionnementArchive()"
                    >
                        Ajouter un autre matériel
                    </button>

                </div>


                <button
                    type="button"
                    class="reappro-validation"
                    onclick="validerReapprovisionnementArchive('${String(archive.id)}')"
                >
                    Ajouter au stock
                </button>


                <p class="reappro-note">
                    Les quantités laissées vides ne modifieront pas le stock.
                </p>

            </section>

        </main>

    `;

}


async function afficherReapprovisionnementAdministration() {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_reapprovisionnement",
            "Vous n'avez pas accès au réapprovisionnement."
        )
    ) {
        return;
    }

    await synchroniserAvantNavigation();

    initialiserStylesReapprovisionnementArchive();

    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="reappro-page">

            <button
                type="button"
                class="reappro-retour"
                onclick="afficherMenuAdministration()"
            >
                ← Retour à l'administration
            </button>

            <header class="reappro-entete">

                <div class="reappro-entete-contenu">
                    <p class="reappro-sur-titre">
                        Stock
                    </p>

                    <h2>
                        Réapprovisionnement
                    </h2>

                    <p class="reappro-sous-titre-bureau bureau-seulement">
                        Ajoutez les matériels reçus pour les remettre en stock.
                    </p>
                </div>

                <div class="reappro-date-bureau bureau-seulement">
                    <span class="reappro-date-label">
                        Date du réapprovisionnement
                    </span>
                    <strong>
                        ${formaterDate(dateAujourdhui())}
                    </strong>
                </div>

            </header>

            <section class="reappro-feuille">

                <div class="reappro-icone-bureau bureau-seulement">
                    +
                </div>

                <h3 class="reappro-grand-titre bureau-seulement">
                    Nouveau réapprovisionnement
                </h3>

                <div class="reappro-table-entete bureau-seulement">
                    <span>#</span>
                    <span>Matériel</span>
                    <span>Quantité</span>
                    <span>Action</span>
                </div>

                <div class="reappro-section-titre mobile-seulement">
                    Matériels à ajouter au stock
                </div>

                <div id="reappro-lignes-consommees"></div>
                <div id="reappro-lignes-supplementaires"></div>

                <div class="reappro-ajout-zone">
                    <button
                        type="button"
                        class="reappro-ajouter"
                        onclick="ajouterLigneReapprovisionnementArchive()"
                    >
                        <span class="bureau-seulement">+&nbsp;&nbsp; Ajouter un autre matériel</span>
                        <span class="mobile-seulement">Ajouter un matériel</span>
                    </button>
                </div>

                <button
                    type="button"
                    class="reappro-validation"
                    onclick="validerReapprovisionnementAdministration()"
                >
                    <span class="bureau-seulement">
                        Enregistrer le réapprovisionnement
                    </span>
                    <span class="mobile-seulement">
                        Ajouter au stock
                    </span>
                </button>

                <p class="reappro-note">
                    Les quantités saisies seront ajoutées au stock actuel des matériels.
                </p>

            </section>

        </main>

    `;

}


async function validerReapprovisionnementAdministration() {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_reapprovisionnement",
            "Vous n'avez pas accès au réapprovisionnement."
        )
    ) {
        return;
    }

    const ajouts = new Map();

    document.querySelectorAll(
        ".reappro-ligne-supplementaire"
    ).forEach(
        function (ligne) {

            const materielId =
                String(
                    ligne.querySelector(
                        ".reappro-materiel-id"
                    )?.value ||
                    ""
                );

            const quantite =
                Math.floor(
                    Number(
                        ligne.querySelector(
                            ".reappro-quantite"
                        )?.value ||
                        0
                    )
                );

            if (
                materielId &&
                Number.isFinite(quantite) &&
                quantite > 0
            ) {
                ajouts.set(
                    materielId,
                    (ajouts.get(materielId) || 0) +
                    quantite
                );
            }
        }
    );

    if (ajouts.size === 0) {
        alert(
            "Ajoute au moins un matériel avec une quantité supérieure à 0."
        );
        return;
    }

    const lignesConfirmation =
        Array.from(ajouts.entries())
            .map(
                function ([materielId, quantite]) {
                    const materiel =
                        materiels.find(
                            function (item) {
                                return String(item.id) === String(materielId);
                            }
                        );
                    return materiel
                        ? `${materiel.nom} : +${quantite}`
                        : "";
                }
            )
            .filter(Boolean);

    if (
        !await afficherConfirmationCIS(
            "Ajouter au stock :\\n\\n" +
            lignesConfirmation.join("\\n") +
            "\\n\\nConfirmer ?"
        )
    ) {
        return;
    }

    let nombreModifie = 0;

    ajouts.forEach(
        function (quantite, materielId) {
            const materiel =
                materiels.find(
                    function (item) {
                        return String(item.id) === String(materielId);
                    }
                );

            if (!materiel) {
                return;
            }

            const ancienStock =
                Number(materiel.stock || 0);

            materiel.stock =
                ancienStock +
                Number(quantite);

            preparerNotificationStock(
                materiel,
                ancienStock
            );

            nombreModifie += 1;
        }
    );

    sauvegarderToutesLesDonnees();

    try {
        await synchroniserApresModification();
    } catch (erreur) {
        console.warn(
            "Synchronisation du réapprovisionnement différée :",
            erreur
        );
    }

    alert(
        nombreModifie +
        " matériel(s) ajouté(s) au stock."
    );

    afficherReapprovisionnementAdministration();

}


function ajouterLigneReapprovisionnementArchive() {

    const conteneur =
        document.getElementById(
            "reappro-lignes-supplementaires"
        );


    if (!conteneur) {
        return;
    }


    if (materiels.length === 0) {

        alert(
            "Aucun matériel disponible."
        );

        return;
    }


    const ligne =
        document.createElement(
            "div"
        );

    ligne.className =
        "reappro-ligne reappro-ligne-supplementaire";


    ligne.innerHTML = `

        <div class="reappro-recherche-wrap">

            <input
                class="reappro-recherche"
                type="search"
                autocomplete="off"
                placeholder="Rechercher un matériel"
                aria-label="Rechercher un matériel"
            >

            <input
                class="reappro-materiel-id"
                type="hidden"
                value=""
            >

            <div
                class="reappro-resultats"
            ></div>

        </div>

        <select
            class="reappro-quantite"
            aria-label="Quantité à ajouter"
        >
            <option value="">Quantité</option>
            ${Array.from({ length: 99 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join("")}
        </select>

        <button
            type="button"
            class="reappro-supprimer-ligne"
            aria-label="Retirer cette ligne"
            title="Retirer"
        >
            ×
        </button>

    `;


    ligne.querySelector(
        ".reappro-supprimer-ligne"
    )?.addEventListener(
        "click",
        function () {

            ligne.remove();

        }
    );


    const recherche =
        ligne.querySelector(
            ".reappro-recherche"
        );

    const champId =
        ligne.querySelector(
            ".reappro-materiel-id"
        );

    const resultats =
        ligne.querySelector(
            ".reappro-resultats"
        );


    function fermerResultats() {

        resultats?.classList.remove(
            "ouvert"
        );

    }


    function afficherResultats(
        texte
    ) {

        if (
            !recherche ||
            !champId ||
            !resultats
        ) {
            return;
        }


        champId.value =
            "";


        const terme =
            String(
                texte ||
                ""
            )
                .trim()
                .toLocaleLowerCase();


        if (!terme) {

            resultats.innerHTML =
                "";

            fermerResultats();

            return;
        }


        const correspondances =
            [...materiels]
                .filter(
                    function (materiel) {

                        const nom =
                            String(
                                materiel.nom ||
                                ""
                            )
                                .toLocaleLowerCase();

                        const reference =
                            String(
                                materiel.reference ||
                                ""
                            )
                                .toLocaleLowerCase();

                        return (
                            nom.includes(
                                terme
                            ) ||
                            reference.includes(
                                terme
                            )
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return String(
                            a.nom ||
                            ""
                        ).localeCompare(
                            String(
                                b.nom ||
                                ""
                            ),
                            "fr",
                            {
                                sensitivity:
                                    "base"
                            }
                        );

                    }
                )
                .slice(
                    0,
                    12
                );


        if (
            correspondances.length === 0
        ) {

            resultats.innerHTML = `
                <div class="reappro-recherche-vide">
                    Aucun matériel trouvé
                </div>
            `;

            resultats.classList.add(
                "ouvert"
            );

            return;
        }


        resultats.innerHTML =
            correspondances
                .map(
                    function (materiel) {

                        const reference =
                            String(
                                materiel.reference ||
                                ""
                            ).trim();

                        return `
                            <button
                                type="button"
                                class="reappro-resultat"
                                data-materiel-id="${echapperHTML(String(materiel.id))}"
                            >
                                <strong>
                                    ${echapperHTML(materiel.nom)}
                                </strong>

                                ${
                                    reference
                                        ? `
                                            <small>
                                                Réf. ${echapperHTML(reference)}
                                            </small>
                                        `
                                        : ""
                                }
                            </button>
                        `;

                    }
                )
                .join("");


        resultats.classList.add(
            "ouvert"
        );


        resultats.querySelectorAll(
            ".reappro-resultat"
        ).forEach(
            function (bouton) {

                bouton.addEventListener(
                    "click",
                    function () {

                        const materielId =
                            String(
                                bouton.dataset.materielId ||
                                ""
                            );

                        const materiel =
                            materiels.find(
                                function (item) {

                                    return (
                                        String(item.id) ===
                                        materielId
                                    );

                                }
                            );


                        if (!materiel) {
                            return;
                        }


                        champId.value =
                            String(
                                materiel.id
                            );

                        recherche.value =
                            String(
                                materiel.nom ||
                                ""
                            );

                        fermerResultats();


                        ligne.querySelector(
                            ".reappro-quantite"
                        )?.focus();

                    }
                );

            }
        );

    }


    recherche?.addEventListener(
        "input",
        function () {

            afficherResultats(
                recherche.value
            );

        }
    );


    recherche?.addEventListener(
        "focus",
        function () {

            if (
                String(
                    recherche.value ||
                    ""
                ).trim()
            ) {

                afficherResultats(
                    recherche.value
                );

            }

        }
    );


    document.addEventListener(
        "click",
        function fermerSiClicExterieur(
            event
        ) {

            if (
                !ligne.isConnected
            ) {

                document.removeEventListener(
                    "click",
                    fermerSiClicExterieur
                );

                return;
            }


            if (
                !ligne.contains(
                    event.target
                )
            ) {

                fermerResultats();

            }

        }
    );


    conteneur.appendChild(
        ligne
    );


    recherche?.focus();

}


async function validerReapprovisionnementArchive(
    archiveId
) {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_reapprovisionnement",
            "Vous n'avez pas accès au réapprovisionnement."
        )
    ) {
        return;
    }


    const ajouts =
        new Map();


    document.querySelectorAll(
        ".reappro-ligne-consommee"
    ).forEach(
        function (ligne) {

            const materielId =
                String(
                    ligne.dataset.materielId ||
                    ""
                );

            const quantite =
                Math.floor(
                    Number(
                        ligne.querySelector(
                            ".reappro-quantite"
                        )?.value ||
                        0
                    )
                );


            if (
                materielId &&
                Number.isFinite(quantite) &&
                quantite > 0
            ) {

                ajouts.set(
                    materielId,
                    (
                        ajouts.get(
                            materielId
                        ) ||
                        0
                    ) +
                    quantite
                );

            }

        }
    );


    document.querySelectorAll(
        ".reappro-ligne-supplementaire"
    ).forEach(
        function (ligne) {

            const materielId =
                String(
                    ligne.querySelector(
                        ".reappro-materiel-id"
                    )?.value ||
                    ""
                );

            const quantite =
                Math.floor(
                    Number(
                        ligne.querySelector(
                            ".reappro-quantite"
                        )?.value ||
                        0
                    )
                );


            if (
                materielId &&
                Number.isFinite(quantite) &&
                quantite > 0
            ) {

                ajouts.set(
                    materielId,
                    (
                        ajouts.get(
                            materielId
                        ) ||
                        0
                    ) +
                    quantite
                );

            }

        }
    );


    if (ajouts.size === 0) {

        alert(
            "Indique au moins une quantité à ajouter au stock."
        );

        return;
    }


    const lignesConfirmation =
        Array.from(
            ajouts.entries()
        )
            .map(
                function (
                    [materielId, quantite]
                ) {

                    const materiel =
                        materiels.find(
                            function (item) {

                                return (
                                    String(item.id) ===
                                    String(materielId)
                                );

                            }
                        );

                    return (
                        materiel
                            ? `${materiel.nom} : +${quantite}`
                            : ""
                    );

                }
            )
            .filter(Boolean);


    if (
        !await afficherConfirmationCIS(
            "Ajouter au stock :\n\n" +
            lignesConfirmation.join(
                "\n"
            ) +
            "\n\nConfirmer ?"
        )
    ) {
        return;
    }


    let nombreModifie =
        0;


    ajouts.forEach(
        function (
            quantite,
            materielId
        ) {

            const materiel =
                materiels.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(materielId)
                        );

                    }
                );


            if (!materiel) {
                return;
            }


            const ancienStock =
                Number(
                    materiel.stock ||
                    0
                );


            const nouveauStock =
                ancienStock +
                Number(
                    quantite
                );


            materiel.stock =
                nouveauStock;


            preparerNotificationStock(
                materiel,
                ancienStock
            );


            nombreModifie +=
                1;

        }
    );


    if (nombreModifie === 0) {

        alert(
            "Aucun stock n'a été modifié."
        );

        return;
    }


    sauvegarderToutesLesDonnees();


    try {

        await synchroniserApresModification();

    } catch (erreur) {

        console.warn(
            "Synchronisation du réapprovisionnement différée :",
            erreur
        );

    }


    alert(
        nombreModifie +
        " matériel(s) ajouté(s) au stock."
    );


    afficherDetailCommandeArchive(
        archiveId
    );

}


/* =========================================================
   TOTAL CONSOMME
   ========================================================= */

function totalConsommeMateriel(
    materielId
) {

    let total = 0;


    historique.forEach(
        function (intervention) {

            if (
                !Array.isArray(
                    intervention.consommations
                )
            ) {

                return;

            }


            intervention.consommations.forEach(
                function (consommation) {

                    if (
                        String(
                            consommation.materielId
                        ) ===
                        String(materielId)
                    ) {

                        total +=
                            Number(
                                consommation.quantite ||
                                0
                            );

                    }

                }
            );

        }
    );


    return total;

}


/* =========================================================
   HISTORIQUE TOTAL
   ========================================================= */

function afficherHistoriqueTotal() {

    const conteneur =
        document.getElementById(
            "historique-total"
        );


    if (!conteneur) {

        return;

    }


    const liste =
        materiels
            .map(
                function (materiel) {

                    return {

                        materiel:
                            materiel,

                        total:
                            totalConsommeMateriel(
                                materiel.id
                            )

                    };

                }
            )

            // Dans l'historique, on affiche uniquement
            // les matériels qui ont réellement été consommés.
            .filter(
                function (ligne) {

                    return (
                        Number(ligne.total) > 0
                    );

                }
            )

            .sort(
                function (a, b) {

                    const aStockFaible =
                        a.materiel.minimum > 0 &&
                        a.materiel.stock <=
                        a.materiel.minimum;

                    const bStockFaible =
                        b.materiel.minimum > 0 &&
                        b.materiel.stock <=
                        b.materiel.minimum;

                    // Les ruptures de stock sont tout en haut.
                    const aRupture =
                        Number(a.materiel.stock) === 0;

                    const bRupture =
                        Number(b.materiel.stock) === 0;

                    if (aRupture !== bRupture) {

                        return (
                            aRupture
                                ? -1
                                : 1
                        );

                    }

                    // Puis viennent les stocks faibles.
                    if (aStockFaible !== bStockFaible) {

                        return (
                            aStockFaible
                                ? -1
                                : 1
                        );

                    }

                    // Ensuite on classe par quantité consommée.
                    return (
                        b.total -
                        a.total
                    );

                }
            );


    if (
        liste.length === 0
    ) {

        conteneur.innerHTML = `

            <div class="materiel">

                Aucun matériel consommé.

            </div>

        `;

        return;

    }


    conteneur.innerHTML =
        liste
            .map(
                function (ligne) {

                    const stockMinimum =
                        ligne.materiel.minimum > 0 &&
                        ligne.materiel.stock <=
                        ligne.materiel.minimum;

                    const ruptureStock =
                        Number(
                            ligne.materiel.stock
                        ) === 0;


                    const classeAlerte =
                        ruptureStock
                            ? " historique-rupture-stock"
                            : (
                                stockMinimum
                                    ? " historique-stock-faible"
                                    : ""
                            );


                    return `

                        <button
                            class="
                                historique-total
                                ${classeAlerte}
                            "
                            type="button"
                            onclick="
                                afficherDetailConsommation(
                                    '${ligne.materiel.id}'
                                )
                            "
                        >

                            <span
                                class="
                                    historique-icone
                                "
                            >
                                ${
                                    ruptureStock
                                        ? "⛔"
                                        : "📦"
                                }
                            </span>


                            <span
                                class="
                                    historique-nom
                                    ${
                                        ruptureStock
                                            ? "texte-rupture-stock"
                                            : (
                                                stockMinimum
                                                    ? "texte-stock-faible"
                                                    : ""
                                            )
                                    }
                                "
                            >

                                <strong>
                                    ${echapperHTML(
                                        ligne.materiel.nom
                                    )}
                                </strong>


                                <small>
                                    ${
                                        ruptureStock
                                            ? "⛔ RUPTURE DE STOCK"
                                            : (
                                                stockMinimum
                                                    ? "⚠️ Stock minimum"
                                                    : "Voir le détail"
                                            )
                                    }
                                </small>

                            </span>


                            <span
                                class="
                                    historique-chiffre
                                    ${
                                        ruptureStock
                                            ? "texte-rupture-stock"
                                            : (
                                                stockMinimum
                                                    ? "texte-stock-faible"
                                                    : ""
                                            )
                                    }
                                "
                            >

                                <strong>
                                    ${ligne.total}
                                </strong>


                                <small>
                                    UTILISÉS
                                </small>

                            </span>


                            <span>
                                ›
                            </span>

                        </button>

                    `;

                }
            )
            .join("");

}

/* =========================================================
   DETAIL PAR MATERIEL
   ========================================================= */

function afficherDetailConsommation(
    materielId
) {

    const materiel =
        materiels.find(
            function (m) {

                return (
                    String(m.id) ===
                    String(materielId)
                );

            }
        );


    if (!materiel) {

        alert(
            "Matériel introuvable."
        );

        return;

    }


    const details = [];


    historique.forEach(
        function (intervention) {

            if (
                !Array.isArray(
                    intervention.consommations
                )
            ) {

                return;

            }


            intervention.consommations.forEach(
                function (consommation) {

                    if (
                        String(
                            consommation.materielId
                        ) ===
                        String(materielId)
                    ) {

                        details.push({

                            date:
                                intervention.date,

                            numero:
                                intervention.numeroIntervention,

                            quantite:
                                Number(
                                    consommation.quantite ||
                                    0
                                )

                        });

                    }

                }
            );

        }
    );


    details.sort(
        function (a, b) {

            return String(b.date)
                .localeCompare(
                    String(a.date)
                );

        }
    );


    const stockMinimum =
        materiel.minimum > 0 &&
        materiel.stock <=
        materiel.minimum;


    let html = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherHistorique()"
            >
                ← Retour
            </button>


            <h2>
                📋 Détail des consommations
            </h2>


            <div
                class="
                    detail-header
                    ${
                        stockMinimum
                        ?
                        "detail-stock-faible"
                        :
                        ""
                    }
                "
            >

                <strong>
                    ${echapperHTML(
                        materiel.nom
                    )}
                </strong>


                <span>
                    Stock actuel :
                    ${materiel.stock}
                </span>

            </div>

    `;


    if (
        details.length === 0
    ) {

        html += `

            <div class="materiel">

                Aucune consommation enregistrée.

            </div>

        `;

    } else {

        details.forEach(
            function (detail) {

                html += `

                    <div
                        class="detail-historique"
                    >

                        <div>

                            <strong>
                                Intervention
                                ${echapperHTML(
                                    detail.numero
                                )}
                            </strong>


                            <span>
                                ${formaterDate(
                                    detail.date
                                )}
                            </span>

                        </div>


                        <strong
                            class="
                                detail-quantite
                                ${
                                    stockMinimum
                                    ?
                                    "texte-stock-faible"
                                    :
                                    ""
                                }
                            "
                        >
                            ${detail.quantite}
                        </strong>

                    </div>

                `;

            }
        );

    }


    html += `
        </main>
    `;


    document.getElementById(
        "app"
    ).innerHTML =
        html;

}


/* =========================================================
   HISTORIQUE DES INTERVENTIONS
   ========================================================= */

function afficherHistoriqueInterventions() {

    const conteneur =
        document.getElementById(
            "historique-interventions"
        );


    if (!conteneur) {

        return;

    }


    if (
        historique.length === 0
    ) {

        conteneur.innerHTML = `

            <div class="materiel">

                Aucun retour d'intervention enregistré.

            </div>

        `;

        return;

    }


    conteneur.innerHTML =
        [...historique]
            .reverse()
            .map(
                function (intervention) {

                    const total =
                        intervention.consommations
                            .reduce(
                                function (
                                    somme,
                                    consommation
                                ) {

                                    return (
                                        somme +
                                        Number(
                                            consommation.quantite ||
                                            0
                                        )
                                    );

                                },
                                0
                            );


                    return `

                        <button
                            type="button"
                            class="
                                detail-historique
                                intervention-cliquable
                                ${
                                    intervention.synchronisationEnAttente
                                        ? "intervention-en-attente-sync"
                                        : ""
                                }
                            "
                            onclick="
                                afficherDetailIntervention(
                                    '${intervention.id}'
                                )
                            "
                        >

                            <div>

                                <strong>
                                    Intervention
                                    ${echapperHTML(
                                        intervention.numeroIntervention
                                    )}
                                </strong>


                                <span>
                                    ${formaterDate(
                                        intervention.date
                                    )}
                                </span>


                                <small>
                                    ${
                                        intervention.synchronisationEnAttente
                                            ? "⏳ En attente de synchronisation"
                                            : "👆 Cliquer pour voir le détail"
                                    }
                                </small>

                            </div>


                            <div
                                class="
                                    intervention-total
                                "
                            >

                                <strong>
                                    ${total}
                                </strong>


                                <span>
                                    utilisés
                                </span>

                            </div>


                            <span
                                class="
                                    fleche-detail
                                "
                            >
                                ›
                            </span>

                        </button>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   DETAIL D'UNE INTERVENTION
   ========================================================= */

function initialiserStylesActionsIntervention() {
    if (document.getElementById("style-actions-intervention")) return;
    const style = document.createElement("style");
    style.id = "style-actions-intervention";
    style.textContent = `
        .auteur-intervention { margin-top: 7px; font-weight: 700; }
        .actions-intervention { display:flex; gap:10px; margin:24px 0 8px; flex-wrap:wrap; }
        .bouton-modifier-intervention, .bouton-supprimer-intervention { flex:1; min-width:140px; min-height:48px; border:0; border-radius:12px; color:#fff; font:inherit; font-weight:800; cursor:pointer; }
        .bouton-modifier-intervention { background:#1687ff; }
        .bouton-supprimer-intervention { background:#d62828; }
        .bouton-supprimer-intervention:disabled { background:#8b9298 !important; color:#e7e7e7 !important; cursor:not-allowed; opacity:.8; }
        .editeur-intervention { margin-top:18px; }
        .editeur-intervention .ligne-edition-materiel { display:grid; grid-template-columns:minmax(0,1fr) 90px; gap:10px; align-items:center; margin:8px 0; }
        .editeur-intervention input[type="number"] { width:100%; box-sizing:border-box; }
    `;
    document.head.appendChild(style);
}

function auteurInterventionEstUtilisateur(intervention) {
    return Boolean(
        intervention?.createdBy &&
        utilisateurConnecte?.id &&
        String(intervention.createdBy) === String(utilisateurConnecte.id)
    );
}

function ageInterventionMs(intervention) {
    const creation = Date.parse(intervention?.createdAt || "");
    return Number.isFinite(creation) ? Math.max(0, Date.now() - creation) : Infinity;
}

function nomAuteurIntervention(intervention) {
    const prenom = String(intervention?.createdByPrenom || "").trim();
    const nom = String(intervention?.createdByNom || "").trim();
    return (prenom + (prenom && nom ? " " : "") + nom) || "Non renseigné";
}

async function verifierMotDePasseUtilisateurConnecte(motDePasse) {
    const supabase = await assurerBibliothequeSupabaseDisponible();
    const identifiant = String(profilUtilisateurConnecte?.identifiant || "").trim();
    if (!supabase || !identifiant) return false;
    let tentative = await supabase.auth.signInWithPassword({
        email: construireEmailTechnique(identifiant),
        password: String(motDePasse ?? "")
    });
    if (tentative.error && String(motDePasse ?? "").length < 6) {
        tentative = await supabase.auth.signInWithPassword({
            email: construireEmailTechnique(identifiant),
            password: preparerMotDePasseSupabase(motDePasse)
        });
    }
    return !tentative.error && Boolean(tentative.data?.user);
}

async function supprimerRetourIntervention(interventionId) {
    const intervention = historique.find(i => String(i.id) === String(interventionId));
    if (!intervention) return alert("Intervention introuvable.");
    const auteur = auteurInterventionEstUtilisateur(intervention);
    const admin = utilisateurEstSPVAdmin();
    if (!admin && (!auteur || ageInterventionMs(intervention) > 60 * 60 * 1000)) {
        return alert("La suppression de ce retour n'est plus autorisée.");
    }
    const motDePasse = await afficherSaisieCIS("Saisissez le mot de passe de votre compte pour confirmer la suppression :", "", "password");
    if (motDePasse === null) return;
    if (!navigator.onLine) return alert("Une connexion Internet est nécessaire pour supprimer un retour d'intervention.");
    if (!await verifierMotDePasseUtilisateurConnecte(motDePasse)) return alert("Mot de passe incorrect.");
    if (!await afficherConfirmationCIS("Supprimer définitivement ce retour d'intervention et remettre les quantités dans le stock ?")) return;
    const supabase = obtenirClientSupabase();
    const { error } = await supabase.rpc("supprimer_retour_intervention", { p_intervention_id: String(interventionId) });
    if (error) return alert("Suppression impossible : " + (error.message || "Erreur Supabase"));
    try {
        const donnees = await recupererDonneesSupabase();
        await appliquerDonneesSupabaseLocalement(donnees);
    } catch (_) {}
    alert("Retour d'intervention supprimé.");
    await afficherHistorique();
}

function afficherModificationRetourIntervention(interventionId) {
    const intervention = historique.find(i => String(i.id) === String(interventionId));
    if (!intervention) return alert("Intervention introuvable.");
    if (!auteurInterventionEstUtilisateur(intervention) || ageInterventionMs(intervention) > 36 * 60 * 60 * 1000) {
        return alert("Ce retour ne peut plus être modifié.");
    }
    const quantites = new Map((intervention.consommations || []).map(c => [String(c.materielId), Number(c.quantite || 0)]));
    const lignes = materiels.slice().sort((a,b)=>String(a.nom).localeCompare(String(b.nom),"fr")).map(m => `
        <div class="ligne-edition-materiel">
            <label for="edit-qte-${m.id}">${echapperHTML(m.nom)}</label>
            <input id="edit-qte-${m.id}" data-materiel-id="${m.id}" class="edit-qte-intervention" type="number" min="0" step="1" value="${quantites.get(String(m.id)) || 0}">
        </div>`).join("");
    document.getElementById("app").innerHTML = `
        <main class="page editeur-intervention">
            <button class="retour-button" onclick="afficherDetailIntervention('${intervention.id}')">← Retour</button>
            <h2>Modifier le retour d'intervention</h2>
            <div class="detail-header"><strong>Noté par : ${echapperHTML(nomAuteurIntervention(intervention))}</strong><span>Cette identité ne peut pas être modifiée.</span></div>
            <label>Date</label><input id="edit-date-intervention" type="date" value="${echapperHTML(intervention.date)}">
            <label>Numéro d'intervention</label><input id="edit-numero-intervention" value="${echapperHTML(intervention.numeroIntervention)}">
            <h3>Matériel utilisé</h3>${lignes}
            <button class="add-button" onclick="enregistrerModificationRetourIntervention('${intervention.id}')">Enregistrer les modifications</button>
        </main>`;
}

async function enregistrerModificationRetourIntervention(interventionId) {
    const intervention = historique.find(i => String(i.id) === String(interventionId));
    if (!intervention || !auteurInterventionEstUtilisateur(intervention) || ageInterventionMs(intervention) > 36 * 60 * 60 * 1000) return alert("Ce retour ne peut plus être modifié.");
    if (!navigator.onLine) return alert("Une connexion Internet est nécessaire pour modifier un retour d'intervention.");
    const date = document.getElementById("edit-date-intervention")?.value;
    const numero = document.getElementById("edit-numero-intervention")?.value.trim();
    const consommations = Array.from(document.querySelectorAll(".edit-qte-intervention")).map(champ => ({ materiel_id: champ.dataset.materielId, quantite: Math.floor(Number(champ.value || 0)) })).filter(x => x.quantite > 0);
    if (!date || !numero) return alert("La date et le numéro d'intervention sont obligatoires.");
    if (!consommations.length) return alert("Veuillez conserver au moins un matériel utilisé.");
    if (!await afficherConfirmationCIS("Enregistrer les modifications de ce retour d'intervention ?")) return;
    const supabase = obtenirClientSupabase();
    const { error } = await supabase.rpc("modifier_retour_intervention", { p_intervention_id:String(interventionId), p_date:date, p_numero:numero, p_consommations:consommations });
    if (error) return alert("Modification impossible : " + (error.message || "Erreur Supabase"));
    const donnees = await recupererDonneesSupabase();
    await appliquerDonneesSupabaseLocalement(donnees);
    alert("Retour d'intervention modifié.");
    afficherDetailIntervention(interventionId);
}

function afficherDetailIntervention(
    interventionId
) {
    initialiserStylesActionsIntervention();
    const intervention = historique.find(item => String(item.id) === String(interventionId));
    if (!intervention) { alert("Intervention introuvable."); return; }
    const auteur = auteurInterventionEstUtilisateur(intervention);
    const admin = utilisateurEstSPVAdmin();
    const modificationPossible = auteur && ageInterventionMs(intervention) <= 36 * 60 * 60 * 1000;
    const suppressionAuteurPossible = auteur && ageInterventionMs(intervention) <= 60 * 60 * 1000;
    const afficherSuppression = auteur || admin;
    let html = `<main class="page">
        <button class="retour-button" onclick="afficherHistorique()">← Retour</button>
        <h2>Détail de l'intervention</h2>
        <div class="detail-header">
            <strong>Intervention ${echapperHTML(intervention.numeroIntervention)}</strong>
            <span>Date : ${formaterDate(intervention.date)}</span>
            <span class="auteur-intervention">Noté par : ${echapperHTML(nomAuteurIntervention(intervention))}</span>
        </div>
        <h3>Matériel utilisé</h3>`;
    if (!Array.isArray(intervention.consommations) || !intervention.consommations.length) {
        html += `<div class="materiel">Aucun matériel enregistré pour cette intervention.</div>`;
    } else {
        intervention.consommations.forEach(function(consommation) {
            const materiel = materiels.find(m => String(m.id) === String(consommation.materielId));
            const stockMinimum = materiel && materiel.minimum > 0 && materiel.stock <= materiel.minimum;
            html += `<div class="detail-historique ${stockMinimum ? "detail-stock-faible" : ""}"><div><strong>${echapperHTML(consommation.materiel)}</strong>${materiel ? `<span>Stock actuel : ${materiel.stock}</span>` : ""}</div><strong class="detail-quantite ${stockMinimum ? "texte-stock-faible" : ""}">${consommation.quantite}</strong></div>`;
        });
    }
    if (auteur || admin) {
        html += `<div class="actions-intervention">`;
        if (auteur) html += `<button class="bouton-modifier-intervention" ${modificationPossible ? `onclick="afficherModificationRetourIntervention('${intervention.id}')"` : "disabled"}>Modifier</button>`;
        if (afficherSuppression) {
            const suppressionPossible = admin || suppressionAuteurPossible;
            html += `<button class="bouton-supprimer-intervention" ${suppressionPossible ? `onclick="supprimerRetourIntervention('${intervention.id}')"` : "disabled"}>Supprimer</button>`;
        }
        html += `</div>`;
    }
    html += `</main>`;
    document.getElementById("app").innerHTML = html;
}


/* =========================================================
   ADMINISTRATION
   ========================================================= */

async function ouvrirAdministration() {

    if (!verifierPermissionOuRetourAccueil(
        "acces_administration"
    )) {
        return;
    }

    await synchroniserAvantNavigation();

    afficherMenuAdministration();

}


function verifierCodeAdmin() {

    ouvrirAdministration();

}

/* =========================================================
   MENU ADMINISTRATION
   ========================================================= */

function afficherMenuAdministration() {

    if (!verifierPermissionOuRetourAccueil(
        "acces_administration"
    )) {
        return;
    }

    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherAccueil()"
            >
                ← Retour
            </button>

            <h2>Administration</h2>

            <div class="menu-administration">

                ${
                    utilisateurAPermission("acces_ajout_materiel")
                        ? `
                            <button class="menu-button" onclick="ajouterMateriel()">
                                <span class="menu-icon">➕</span>
                                <span>
                                    <strong>Ajouter du matériel</strong>
                                    <small>Créer un nouveau matériel</small>
                                </span>
                            </button>
                        `
                        : ""
                }

                ${
                    utilisateurAPermission("acces_gestion_materiel")
                        ? `
                            <button class="menu-button" onclick="gestionMateriels()">
                                <span class="menu-icon">📦</span>
                                <span>
                                    <strong>Gestion du matériel</strong>
                                    <small>Modifier ou supprimer</small>
                                </span>
                            </button>
                        `
                        : ""
                }

                ${
                    utilisateurAPermission("acces_gestion_categories")
                        ? `
                            <button class="menu-button" onclick="gestionCategories()">
                                <span class="menu-icon">📂</span>
                                <span>
                                    <strong>Gestion des catégories</strong>
                                    <small>Créer, modifier ou supprimer</small>
                                </span>
                            </button>
                        `
                        : ""
                }

                ${
                    utilisateurAPermission("acces_reapprovisionnement")
                        ? `
                            <button
                                class="menu-button menu-reapprovisionnement-admin"
                                onclick="afficherReapprovisionnementAdministration()"
                            >
                                <span>
                                    <strong>Réapprovisionnement</strong>
                                    <small>Ajouter du matériel au stock</small>
                                </span>
                            </button>
                        `
                        : ""
                }

                ${
                    utilisateurAPermission("acces_remise_zero_historique")
                        ? `
                            <button class="menu-button" onclick="remiseZeroHistorique()">
                                <span class="menu-icon">🗑️</span>
                                <span>
                                    <strong>Remise à zéro de l'historique</strong>
                                    <small>Archiver la période actuelle</small>
                                </span>
                            </button>
                        `
                        : ""
                }

            </div>

        </main>

    `;

    initialiserStylesReapprovisionnementArchive();

}

/* =========================================================
   ADMINISTRATEUR APPLI
   ========================================================= */

function afficherMenuAdministrateurAppli() {

    if (
        !verifierAccesAdministrateurAppli()
    ) {
        return;
    }


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherAccueil()"
            >
                ← Retour
            </button>


            <h2>
                Administrateur APPLI
            </h2>


            <div class="menu-administration">

                <button
                    class="menu-button"
                    onclick="afficherGestionUtilisateurs()"
                >

                    <span class="menu-icon">
                        👥
                    </span>

                    <span>

                        <strong>
                            Gestion des utilisateurs
                        </strong>

                        <small>
                            Comptes, rôles et permissions
                        </small>

                    </span>

                </button>


                <button
                    class="menu-button"
                    onclick="afficherNotificationsAdministration()"
                >

                    <span class="menu-icon">
                        🔔
                    </span>

                    <span>

                        <strong>
                            Envoyer une notification
                        </strong>

                        <small>
                            Écrire et envoyer un message
                        </small>

                    </span>

                </button>

            </div>

        </main>

    `;

}


/* =========================================================
   GESTION DES UTILISATEURS ET DES RÔLES
   ========================================================= */

let donneesGestionUtilisateurs = {
    utilisateurs: [],
    roles: []
};


async function appelerGestionUtilisateurs(
    action,
    donnees = {}
) {

    if (
        !utilisateurEstSPVAdmin() ||
        !utilisateurAPermission(
            "acces_gestion_utilisateurs"
        )
    ) {
        throw new Error(
            "Accès refusé."
        );
    }


    if (!navigator.onLine) {
        throw new Error(
            "Une connexion Internet est nécessaire."
        );
    }


    const supabase =
        await assurerBibliothequeSupabaseDisponible();


    if (!supabase) {
        throw new Error(
            "Supabase n'est pas disponible."
        );
    }


    const {
        data,
        error
    } =
        await supabase.functions.invoke(
            "gestion-utilisateurs",
            {
                body: {
                    action,
                    ...donnees
                }
            }
        );


    if (error) {

        /*
         * Supabase renvoie souvent seulement :
         * "Edge Function returned a non-2xx status code".
         * On lit donc le corps réel de la réponse de l'Edge Function
         * pour afficher à l'utilisateur la vraie cause.
         */
        let messageDetaille = "";

        try {

            if (
                error.context &&
                typeof error.context.clone === "function"
            ) {

                const reponse =
                    error.context.clone();

                const contenu =
                    await reponse.json();

                messageDetaille =
                    String(
                        contenu?.error ||
                        contenu?.message ||
                        ""
                    ).trim();

            }

        } catch (erreurLecture) {

            console.warn(
                "Lecture du détail Edge Function impossible :",
                erreurLecture
            );

        }

        throw new Error(
            traduireErreurAuthentification(
                messageDetaille ||
                error?.message ||
                "Opération impossible."
            )
        );
    }


    if (
        !data ||
        data.ok !== true
    ) {
        throw new Error(
            traduireErreurAuthentification(
                data?.error ||
                "Opération impossible."
            )
        );
    }


    return data;

}


async function chargerGestionUtilisateurs() {

    const data =
        await appelerGestionUtilisateurs(
            "liste"
        );


    donneesGestionUtilisateurs = {
        utilisateurs:
            Array.isArray(
                data.utilisateurs
            )
                ? data.utilisateurs
                : [],
        roles:
            Array.isArray(
                data.roles
            )
                ? data.roles
                : []
    };


    return donneesGestionUtilisateurs;

}


function roleUtilisateurGestion(
    utilisateur
) {

    const roles =
        utilisateur.roles;

    return Array.isArray(roles)
        ? roles[0] || null
        : roles || null;

}


function permissionRoleHTML(
    role,
    permission,
    libelle,
    prefixe
) {

    return `
        <label>
            <input
                type="checkbox"
                id="${prefixe}-${permission}"
                ${role?.[permission] === true
                    ? "checked"
                    : ""}
            >
            ${libelle}
        </label>
    `;

}


async function afficherGestionUtilisateurs() {

    if (
        !verifierAccesAdministrateurAppli()
    ) {
        return;
    }


    initialiserStyleConnexion();


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page gestion-utilisateurs-page">

            <button
                class="retour-button"
                onclick="afficherMenuAdministrateurAppli()"
            >
                ← Retour
            </button>

            <h2>Gestion des utilisateurs
            </h2>

            <div class="bloc-admin">
                Chargement…
            </div>

        </main>

    `;


    try {

        await chargerGestionUtilisateurs();

        rendreGestionUtilisateurs();

    } catch (erreur) {

        console.error(
            "Gestion utilisateurs :",
            erreur
        );

        document.getElementById(
            "app"
        ).innerHTML += `
            <div class="page">
                <div class="bloc-admin">
                    ⚠️ ${echapperHTML(
                        erreur?.message ||
                        "Chargement impossible."
                    )}
                </div>
            </div>
        `;

    }

}


function rendreGestionUtilisateurs() {

    const utilisateurs =
        donneesGestionUtilisateurs
            .utilisateurs;

    const roles =
        donneesGestionUtilisateurs
            .roles;


    const optionsRoles =
        roles.map(
            function (role) {

                return `
                    <option
                        value="${echapperHTML(role.id)}"
                    >
                        ${echapperHTML(role.nom)}
                    </option>
                `;

            }
        ).join("");


    const cartesUtilisateurs =
        utilisateurs.map(
            function (utilisateur) {

                const role =
                    roleUtilisateurGestion(
                        utilisateur
                    );

                const options =
                    roles.map(
                        function (r) {

                            return `
                                <option
                                    value="${echapperHTML(r.id)}"
                                    ${String(r.id) ===
                                        String(utilisateur.role_id)
                                        ? "selected"
                                        : ""}
                                >
                                    ${echapperHTML(r.nom)}
                                </option>
                            `;

                        }
                    ).join("");


                return `
                    <div class="carte-utilisateur">

                        <strong>
                            ${echapperHTML(
                                utilisateur.prenom || ""
                            )}
                            ${echapperHTML(
                                utilisateur.nom || ""
                            )}
                        </strong>

                        <div>
                            ${echapperHTML(
                                utilisateur.identifiant
                            )}
                        </div>

                        <span class="badge-role">
                            ${echapperHTML(
                                role?.nom || "Sans rôle"
                            )}
                        </span>

                        <label>
                            Rôle
                        </label>

                        <select
                            id="role-user-${echapperHTML(utilisateur.id)}"
                        >
                            ${options}
                        </select>

                        <div class="ligne-actions">

                            <button
                                class="petit-bouton"
                                onclick="modifierRoleUtilisateur('${echapperHTML(utilisateur.id)}')"
                            >
                                💾 Enregistrer le rôle
                            </button>

                            <button
                                class="petit-bouton"
                                onclick="changerMotDePasseUtilisateur('${echapperHTML(utilisateur.id)}','${echapperHTML(utilisateur.identifiant)}')"
                            >
                                🔑 Mot de passe
                            </button>

                            <button
                                class="petit-bouton"
                                onclick="changerEtatUtilisateur('${echapperHTML(utilisateur.id)}', ${utilisateur.actif === true ? "false" : "true"})"
                            >
                                ${utilisateur.actif === true
                                    ? "⛔ Désactiver"
                                    : "✅ Réactiver"}
                            </button>

                        </div>

                        <small>
                            État :
                            <strong>
                                ${utilisateur.actif === true
                                    ? "ACTIF"
                                    : "DÉSACTIVÉ"}
                            </strong>
                        </small>

                    </div>
                `;

            }
        ).join("");


    const cartesRoles =
        roles.map(
            function (role) {

                const prefixe =
                    "role-" +
                    role.id;

                return `
                    <div class="carte-role">

                        <label>
                            Nom du rôle
                        </label>

                        <input
                            id="${prefixe}-nom"
                            value="${echapperHTML(role.nom)}"
                        >

                        <div class="permissions-role">

                            ${permissionRoleHTML(role,"acces_inventaire","Inventaire",prefixe)}
                            ${permissionRoleHTML(role,"acces_retour_intervention","Retour d'intervention",prefixe)}
                            ${permissionRoleHTML(role,"acces_historique","Historique",prefixe)}
                            ${permissionRoleHTML(role,"acces_archives","Archives",prefixe)}
                            ${permissionRoleHTML(role,"acces_administration","Administration",prefixe)}
                            ${permissionRoleHTML(role,"acces_ajout_materiel","Ajouter du matériel",prefixe)}
                            ${permissionRoleHTML(role,"acces_gestion_materiel","Gestion du matériel",prefixe)}
                            ${permissionRoleHTML(role,"acces_gestion_categories","Gestion des catégories",prefixe)}
                            ${permissionRoleHTML(role,"acces_reapprovisionnement","Réapprovisionnement",prefixe)}
                            ${permissionRoleHTML(role,"acces_remise_zero_historique","Remise à zéro de l'historique",prefixe)}
                            ${permissionRoleHTML(role,"acces_gestion_utilisateurs","Gestion des utilisateurs",prefixe)}
                            ${permissionRoleHTML(role,"acces_notifications","Envoyer une notification",prefixe)}

                        </div>

                        <div class="ligne-actions">

                            <button
                                class="petit-bouton"
                                onclick="enregistrerRole('${echapperHTML(role.id)}')"
                            >
                                💾 Enregistrer
                            </button>

                            <button
                                class="petit-bouton"
                                onclick="supprimerRoleGestion('${echapperHTML(role.id)}','${echapperHTML(role.nom)}')"
                            >
                                🗑️ Supprimer
                            </button>

                        </div>

                    </div>
                `;

            }
        ).join("");


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page gestion-utilisateurs-page">

            <button
                class="retour-button"
                onclick="afficherMenuAdministrateurAppli()"
            >
                ← Retour
            </button>

            <h2>Gestion des utilisateurs
            </h2>


            <section class="bloc-admin">

                <h3>Nouvel utilisateur
                </h3>

                <div class="grille-formulaire">

                    <input
                        id="new-user-identifiant"
                        placeholder="Identifiant (ex. DUPONTJ)"
                        autocapitalize="characters"
                    >

                    <input
                        id="new-user-nom"
                        placeholder="Nom"
                    >

                    <input
                        id="new-user-prenom"
                        placeholder="Prénom"
                    >

                    <input
                        id="new-user-password"
                        type="password"
                        placeholder="Mot de passe"
                    >

                    <select
                        id="new-user-role"
                    >
                        ${optionsRoles}
                    </select>

                    <button
                        class="add-button"
                        onclick="creerUtilisateurAdministration()"
                    >
                        👤 Créer l'utilisateur
                    </button>

                </div>

            </section>


            <section class="bloc-admin">

                <h3>
                    Utilisateurs
                </h3>

                ${cartesUtilisateurs ||
                    "<p>Aucun utilisateur.</p>"}

            </section>


            <section class="bloc-admin">

                <h3>Nouveau rôle
                </h3>

                <div class="grille-formulaire">

                    <input
                        id="new-role-nom"
                        placeholder="Nom du rôle"
                    >

                    <div class="permissions-role">
<label><input type="checkbox" id="new-role-inventaire"> Inventaire</label>
<label><input type="checkbox" id="new-role-retour"> Retour d'intervention</label>
<label><input type="checkbox" id="new-role-historique"> Historique</label>
<label><input type="checkbox" id="new-role-archives"> Archives</label>
<label><input type="checkbox" id="new-role-administration"> Administration</label>
<label><input type="checkbox" id="new-role-ajout-materiel"> Ajouter du matériel</label>
<label><input type="checkbox" id="new-role-gestion-materiel"> Gestion du matériel</label>
<label><input type="checkbox" id="new-role-categories"> Gestion des catégories</label>
<label><input type="checkbox" id="new-role-reapprovisionnement"> Réapprovisionnement</label>
<label><input type="checkbox" id="new-role-remise-zero"> Remise à zéro de l'historique</label>
<label><input type="checkbox" id="new-role-utilisateurs"> Gestion des utilisateurs</label>
<label><input type="checkbox" id="new-role-notifications"> Envoyer une notification</label>
</div>

                    <button
                        class="add-button"
                        onclick="creerRoleAdministration()"
                    >
                        ➕ Créer le rôle
                    </button>

                </div>

            </section>


            <section class="bloc-admin">

                <h3>
                    Rôles et permissions
                </h3>

                ${cartesRoles}

            </section>

        </main>

    `;

}


async function creerUtilisateurAdministration() {

    const identifiant =
        normaliserIdentifiantConnexion(
            document.getElementById(
                "new-user-identifiant"
            )?.value
        );

    const nom =
        document.getElementById(
            "new-user-nom"
        )?.value.trim() || "";

    const prenom =
        document.getElementById(
            "new-user-prenom"
        )?.value.trim() || "";

    const motDePasse =
        document.getElementById(
            "new-user-password"
        )?.value || "";

    const roleId =
        document.getElementById(
            "new-user-role"
        )?.value || "";


    if (
        !identifiant ||
        !motDePasse ||
        !roleId
    ) {
        alert(
            "Identifiant, mot de passe et rôle obligatoires."
        );
        return;
    }



    try {

        await appelerGestionUtilisateurs(
            "creer_utilisateur",
            {
                identifiant,
                nom,
                prenom,
                mot_de_passe:
                    preparerMotDePasseSupabase(motDePasse),
                role_id:
                    roleId
            }
        );


        alert(
            "✅ Utilisateur créé."
        );


        await afficherGestionUtilisateurs();

    } catch (erreur) {

        alert(
            "⚠️ " +
            (
                erreur?.message ||
                "Création impossible."
            )
        );

    }

}


async function modifierRoleUtilisateur(
    userId
) {

    const roleId =
        document.getElementById(
            "role-user-" +
            userId
        )?.value;


    if (!roleId) {
        return;
    }


    try {

        await appelerGestionUtilisateurs(
            "modifier_utilisateur",
            {
                user_id:
                    userId,
                role_id:
                    roleId
            }
        );


        alert(
            "✅ Rôle modifié."
        );


        await afficherGestionUtilisateurs();

    } catch (erreur) {

        alert(
            "⚠️ " +
            (
                erreur?.message ||
                "Modification impossible."
            )
        );

    }

}


async function changerMotDePasseUtilisateur(
    userId,
    identifiant
) {

    const motDePasse =
        await afficherSaisieCIS(
            "Nouveau code pour " +
            identifiant +
            " :"
        );


    if (motDePasse === null) {
        return;
    }



    try {

        await appelerGestionUtilisateurs(
            "changer_mot_de_passe",
            {
                user_id:
                    userId,
                mot_de_passe:
                    preparerMotDePasseSupabase(motDePasse)
            }
        );


        alert(
            "✅ Code modifié."
        );

    } catch (erreur) {

        alert(
            "⚠️ " +
            (
                erreur?.message ||
                "Modification impossible."
            )
        );

    }

}


async function changerEtatUtilisateur(
    userId,
    nouvelEtat
) {

    if (
        !await afficherConfirmationCIS(
            nouvelEtat
                ? "Réactiver cet utilisateur ?"
                : "Désactiver cet utilisateur ?"
        )
    ) {
        return;
    }


    try {

        await appelerGestionUtilisateurs(
            "changer_etat",
            {
                user_id:
                    userId,
                actif:
                    nouvelEtat === true
            }
        );


        alert(
            nouvelEtat
                ? "✅ Utilisateur réactivé."
                : "✅ Utilisateur désactivé."
        );


        await afficherGestionUtilisateurs();

    } catch (erreur) {

        alert(
            "⚠️ " +
            (
                erreur?.message ||
                "Modification impossible."
            )
        );

    }

}


function lirePermissionRole(
    id
) {

    return document.getElementById(
        id
    )?.checked === true;

}


async function creerRoleAdministration() {

    const nom =
        document.getElementById(
            "new-role-nom"
        )?.value.trim() || "";


    if (!nom) {
        alert(
            "Nom du rôle obligatoire."
        );
        return;
    }


    try {

        await appelerGestionUtilisateurs(
            "creer_role",
            {
                nom,
                acces_inventaire:
                    lirePermissionRole(
                        "new-role-inventaire"
                    ),
                acces_retour_intervention:
                    lirePermissionRole(
                        "new-role-retour"
                    ),
                acces_historique:
                    lirePermissionRole(
                        "new-role-historique"
                    ),
                acces_administration:
                    lirePermissionRole(
                        "new-role-administration"
                    ),
                acces_archives:
                    lirePermissionRole("new-role-archives"),
                acces_ajout_materiel:
                    lirePermissionRole("new-role-ajout-materiel"),
                acces_gestion_materiel:
                    lirePermissionRole("new-role-gestion-materiel"),
                acces_gestion_categories:
                    lirePermissionRole("new-role-categories"),
                acces_reapprovisionnement:
                    lirePermissionRole("new-role-reapprovisionnement"),
                acces_remise_zero_historique:
                    lirePermissionRole("new-role-remise-zero"),
                acces_gestion_utilisateurs:
                    lirePermissionRole("new-role-utilisateurs"),
                acces_notifications:
                    lirePermissionRole("new-role-notifications")
            }
        );


        alert(
            "✅ Rôle créé."
        );


        await afficherGestionUtilisateurs();

    } catch (erreur) {

        alert(
            "⚠️ " +
            (
                erreur?.message ||
                "Création impossible."
            )
        );

    }

}


async function enregistrerRole(
    roleId
) {

    const prefixe =
        "role-" +
        roleId;

    const nom =
        document.getElementById(
            prefixe +
            "-nom"
        )?.value.trim() || "";


    if (!nom) {
        alert(
            "Nom du rôle obligatoire."
        );
        return;
    }


    try {

        await appelerGestionUtilisateurs(
            "modifier_role",
            {
                role_id:
                    roleId,
                nom,
                acces_inventaire:
                    lirePermissionRole(
                        prefixe +
                        "-acces_inventaire"
                    ),
                acces_retour_intervention:
                    lirePermissionRole(
                        prefixe +
                        "-acces_retour_intervention"
                    ),
                acces_historique:
                    lirePermissionRole(
                        prefixe +
                        "-acces_historique"
                    ),
                acces_administration:
                    lirePermissionRole(
                        prefixe +
                        "-acces_administration"
                    ),
                acces_archives:
                    lirePermissionRole(prefixe + "-acces_archives"),
                acces_ajout_materiel:
                    lirePermissionRole(prefixe + "-acces_ajout_materiel"),
                acces_gestion_materiel:
                    lirePermissionRole(prefixe + "-acces_gestion_materiel"),
                acces_gestion_categories:
                    lirePermissionRole(prefixe + "-acces_gestion_categories"),
                acces_reapprovisionnement:
                    lirePermissionRole(prefixe + "-acces_reapprovisionnement"),
                acces_remise_zero_historique:
                    lirePermissionRole(prefixe + "-acces_remise_zero_historique"),
                acces_gestion_utilisateurs:
                    lirePermissionRole(prefixe + "-acces_gestion_utilisateurs"),
                acces_notifications:
                    lirePermissionRole(prefixe + "-acces_notifications")
            }
        );


        alert(
            "✅ Rôle modifié."
        );


        /*
         * Si l'admin modifie son propre rôle,
         * recharger immédiatement ses permissions.
         */
        if (
            utilisateurConnecte?.id &&
            navigator.onLine
        ) {

            const supabase =
                obtenirClientSupabase();

            if (supabase) {

                const {
                    data
                } =
                    await supabase.auth
                        .getUser();

                if (data?.user) {
                    await chargerProfilUtilisateurDepuisSupabase(
                        data.user
                    );
                }

            }

        }


        await afficherGestionUtilisateurs();

    } catch (erreur) {

        alert(
            "⚠️ " +
            (
                erreur?.message ||
                "Modification impossible."
            )
        );

    }

}


async function supprimerRoleGestion(
    roleId,
    nom
) {

    if (
        !await afficherConfirmationCIS(
            "Supprimer le rôle « " +
            nom +
            " » ?"
        )
    ) {
        return;
    }


    try {

        await appelerGestionUtilisateurs(
            "supprimer_role",
            {
                role_id:
                    roleId
            }
        );


        alert(
            "✅ Rôle supprimé."
        );


        await afficherGestionUtilisateurs();

    } catch (erreur) {

        alert(
            "⚠️ " +
            (
                erreur?.message ||
                "Suppression impossible."
            )
        );

    }

}


/* =========================================================
   NOTIFICATIONS MANUELLES - ADMINISTRATION
   ========================================================= */

function afficherNotificationsAdministration() {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_notifications"
        )
    ) {
        return;
    }


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherMenuAdministrateurAppli()"
            >
                ← Retour
            </button>


            <h2>Envoyer une notification
            </h2>


            <div class="formulaire">

                <label for="notification-admin-message">
                    Message à envoyer
                </label>


                <textarea
                    id="notification-admin-message"
                    rows="7"
                    maxlength="500"
                    placeholder="Écrivez ici le message que vous souhaitez envoyer..."
                ></textarea>


                <button
                    class="add-button"
                    id="btn-envoyer-notification-admin"
                    onclick="envoyerNotificationAdministration()"
                >
                    📣 Envoyer la notification
                </button>

            </div>

        </main>

    `;


    const zone =
        document.getElementById(
            "notification-admin-message"
        );


    if (zone) {
        zone.focus();
    }

}


async function envoyerNotificationAdministration() {

    if (
        !verifierAccesAdministrateurAppli()
    ) {
        return;
    }


    const zone =
        document.getElementById(
            "notification-admin-message"
        );

    const bouton =
        document.getElementById(
            "btn-envoyer-notification-admin"
        );


    const message =
        zone?.value.trim() || "";


    if (!message) {

        alert(
            "Veuillez écrire un message."
        );

        return;

    }


    if (!navigator.onLine) {

        alert(
            "⚠️ Une connexion Internet est nécessaire pour envoyer une notification."
        );

        return;

    }


    if (
        !await afficherConfirmationCIS(
            "Envoyer cette notification à tous les appareils inscrits ?"
        )
    ) {

        return;

    }


    if (bouton) {
        bouton.disabled = true;
        bouton.textContent =
            "📣 Envoi en cours…";
    }


    try {

        const resultat =
            await envoyerNotificationPush(
                "CIS Le Chesne",
                message
            );


        const nombre =
            Number(
                resultat?.envoyees || 0
            );


        alert(
            "✅ Notification envoyée à " +
            nombre +
            (
                nombre > 1
                    ? " appareils."
                    : " appareil."
            )
        );


        if (zone) {
            zone.value = "";
        }

    } catch (erreur) {

        console.error(
            "Envoi notification admin impossible :",
            erreur
        );


        alert(
            "⚠️ Impossible d'envoyer la notification."
        );

    } finally {

        if (bouton) {
            bouton.disabled = false;
            bouton.textContent =
                "📣 Envoyer la notification";
        }

    }

}


/* =========================================================
   GESTION DU MATERIEL
   ========================================================= */

function gestionMateriels() {

    if (!verifierPermissionOuRetourAccueil(
        "acces_gestion_materiel"
    )) {
        return;
    }


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="
                    afficherMenuAdministration()
                "
            >
                ← Retour
            </button>


            <h2>Gestion du matériel
            </h2>


            <button
                class="add-button"
                onclick="ajouterMateriel()"
            >
                ➕ Ajouter du matériel
            </button>


            <div class="recherche">

                <input
                    type="search"
                    id="recherche-admin"
                    placeholder="🔎 Rechercher..."
                >

            </div>


            <div
                id="liste-admin"
            ></div>

        </main>

    `;


    document
        .getElementById(
            "recherche-admin"
        )
        .addEventListener(
            "input",
            afficherListeAdmin
        );


    afficherListeAdmin();

}


function afficherListeAdmin() {

    const conteneur =
        document.getElementById(
            "liste-admin"
        );


    if (!conteneur) {

        return;

    }


    const recherche =
        (
            document.getElementById(
                "recherche-admin"
            )?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const liste =
        materiels.filter(
            function (materiel) {

                return (
                    !recherche
                    ||
                    materiel.nom
                        .toLowerCase()
                        .includes(
                            recherche
                        )
                    ||
                    materiel.reference
                        .toLowerCase()
                        .includes(
                            recherche
                        )
                );

            }
        );


    if (
        liste.length === 0
    ) {

        conteneur.innerHTML = `

            <div class="materiel">

                Aucun matériel trouvé.

            </div>

        `;

        return;

    }


    conteneur.innerHTML =
        liste
            .map(
                function (materiel) {

                    return `

                        <div
                            class="materiel"
                        >

                            <h3>
                                ${echapperHTML(
                                    materiel.nom
                                )}
                            </h3>


                            <p>
                                Stock :
                                <strong>
                                    ${materiel.stock}
                                </strong>
                            </p>


                            <p>
                                Catégories :
                                ${materiel.categories
                                    .map(
                                        echapperHTML
                                    )
                                    .join(", ")}
                            </p>


                            <div
                                class="
                                    actions-materiel
                                "
                            >

                                <button
                                    onclick="
                                        modifierMateriel(
                                            '${materiel.id}'
                                        )
                                    "
                                >
                                    ✏️ Modifier
                                </button>


                                <button
                                    onclick="
                                        modifierStock(
                                            '${materiel.id}'
                                        )
                                    "
                                >
                                    📦 Stock
                                </button>


                                <button
                                    onclick="
                                        supprimerMateriel(
                                            '${materiel.id}'
                                        )
                                    "
                                >
                                    🗑️ Supprimer
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   FORMULAIRE MATERIEL
   ========================================================= */

function ajouterMateriel() {

    if (!verifierPermissionOuRetourAccueil(
        "acces_ajout_materiel"
    )) {
        return;
    }


    afficherFormulaireMateriel(
        null
    );

}


function modifierMateriel(
    id
) {

    const materiel =
        materiels.find(
            function (m) {

                return (
                    String(m.id) ===
                    String(id)
                );

            }
        );


    if (!materiel) {

        alert(
            "Matériel introuvable."
        );

        return;

    }


    afficherFormulaireMateriel(
        materiel
    );

}


function afficherFormulaireMateriel(
    materiel
) {

    materielEnModification =
        materiel
            ? materiel.id
            : null;


    const modification =
        Boolean(
            materiel
        );


    const options =
        categories
            .map(
                function (categorie) {

                    const coche =
                        materiel &&
                        materiel.categories.some(
                            function (cat) {

                                return (
                                    cat.toLowerCase() ===
                                    categorie.toLowerCase()
                                );

                            }
                        );


                    return `

                        <label
                            class="case-categorie"
                        >

                            <input
                                type="checkbox"
                                name="categories-materiel"
                                value="${echapperHTML(
                                    categorie
                                )}"
                                ${coche ? "checked" : ""}
                            >

                            <span>
                                ${echapperHTML(
                                    categorie
                                )}
                            </span>

                        </label>

                    `;

                }
            )
            .join("");


    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="
                    gestionMateriels()
                "
            >
                ← Retour
            </button>


            <h2>

                ${
                    modification
                    ?
                    "✏️ Modifier le matériel"
                    :
                    "➕ Ajouter du matériel"
                }

            </h2>


            <div
                class="formulaire"
            >

                <label>
                    Nom du matériel
                </label>


                <input
                    type="text"
                    id="nom-materiel"
                    placeholder="Nom du matériel"
                    value="${
                        modification
                        ?
                        echapperHTML(
                            materiel.nom
                        )
                        :
                        ""
                    }"
                >


                <label>
                    Référence
                </label>


                <input
                    type="text"
                    id="reference-materiel"
                    placeholder="Référence"
                    value="${
                        modification
                        ?
                        echapperHTML(
                            materiel.reference
                        )
                        :
                        ""
                    }"
                >


                <label>
                    Catégories
                </label>


                <div
                    class="
                        cases-categories
                    "
                >

                    ${options}

                </div>


                <label>
                    Quantité en stock
                </label>


                <input
                    type="number"
                    id="quantite-materiel"
                    min="0"
                    value="${
                        modification
                        ?
                        materiel.stock
                        :
                        0
                    }"
                >


                <label>
                    Stock minimum
                </label>


                <input
                    type="number"
                    id="minimum-materiel"
                    min="0"
                    value="${
                        modification
                        ?
                        materiel.minimum
                        :
                        0
                    }"
                >


                <label>
                    Emplacement
                </label>


                <input
                    type="text"
                    id="emplacement-materiel"
                    placeholder="Ex : VSAV 1"
                    value="${
                        modification
                        ?
                        echapperHTML(
                            materiel.emplacement
                        )
                        :
                        ""
                    }"
                >


                <label>
                    Description
                </label>


                <textarea
                    id="description-materiel"
                    rows="4"
                    placeholder="Description"
                >${
                    modification
                    ?
                    echapperHTML(
                        materiel.description
                    )
                    :
                    ""
                }</textarea>


                <label>
                    Photo du matériel
                </label>


                ${
                    modification &&
                    materiel.photo
                    ?
                    `
                    <img
                        src="${materiel.photo}"
                        class="apercu-photo"
                        alt="Photo actuelle"
                    >
                    `
                    :
                    ""
                }


                <input
                    type="file"
                    id="photo-materiel"
                    accept="image/*"
                >


                <div
                    id="apercu-photo"
                ></div>


                <button
                    class="add-button"
                    onclick="
                        enregistrerMateriel()
                    "
                >

                    💾

                    ${
                        modification
                        ?
                        "Enregistrer les modifications"
                        :
                        "Créer le matériel"
                    }

                </button>

            </div>

        </main>

    `;


    const photo =
        document.getElementById(
            "photo-materiel"
        );


    if (photo) {

        photo.addEventListener(
            "change",
            afficherApercuPhoto
        );

    }

}


/* =========================================================
   PHOTO
   ========================================================= */

function afficherApercuPhoto(
    event
) {

    const fichier =
        event.target.files[0];


    if (!fichier) {

        return;

    }


    const lecteur =
        new FileReader();


    lecteur.onload =
        function (e) {

            const conteneur =
                document.getElementById(
                    "apercu-photo"
                );


            if (!conteneur) {

                return;

            }


            conteneur.innerHTML = `

                <img
                    src="${e.target.result}"
                    class="apercu-photo"
                    alt="Aperçu"
                >

            `;

        };


    lecteur.readAsDataURL(
        fichier
    );

}


/* =========================================================
   ENREGISTRER MATERIEL
   ========================================================= */

function enregistrerMateriel() {

    const nom =
        document.getElementById(
            "nom-materiel"
        )?.value
        .trim();


    const reference =
        document.getElementById(
            "reference-materiel"
        )?.value
        .trim();


    const stock =
        Math.max(
            0,
            Math.floor(
                Number(
                    document.getElementById(
                        "quantite-materiel"
                    )?.value
                ) || 0
            )
        );


    const minimum =
        Math.max(
            0,
            Math.floor(
                Number(
                    document.getElementById(
                        "minimum-materiel"
                    )?.value
                ) || 0
            )
        );


    const emplacement =
        document.getElementById(
            "emplacement-materiel"
        )?.value
        .trim();


    const description =
        document.getElementById(
            "description-materiel"
        )?.value
        .trim();


    /*
     * CORRECTION DEFINITIVE :
     * on récupère les cases cochées avec
     * exactement le bon name.
     */

    const cases =
        document.querySelectorAll(
            'input[type="checkbox"][name="categories-materiel"]:checked'
        );


    const categoriesSelectionnees =
        Array.from(
            cases
        )
            .map(
                function (input) {

                    return input.value;

                }
            )
            .filter(Boolean);


    if (!nom) {

        alert(
            "Veuillez indiquer le nom du matériel."
        );

        return;

    }


    if (
        categoriesSelectionnees.length ===
        0
    ) {

        alert(
            "Veuillez sélectionner au moins une catégorie."
        );

        return;

    }


    const fichier =
        document.getElementById(
            "photo-materiel"
        )?.files[0];


    /* =====================================================
       MODIFICATION
       ===================================================== */

    if (
        materielEnModification !==
        null
    ) {

        const materiel =
            materiels.find(
                function (m) {

                    return (
                        String(m.id) ===
                        String(
                            materielEnModification
                        )
                    );

                }
            );


        if (!materiel) {

            alert(
                "Matériel introuvable."
            );

            return;

        }


        const ancienStock =
            Number(
                materiel.stock
            );


        materiel.nom =
            nom;

        materiel.reference =
            reference;

        materiel.stock =
            stock;

        materiel.minimum =
            minimum;

        materiel.emplacement =
            emplacement;

        materiel.description =
            description;

        materiel.categories =
            categoriesSelectionnees;


        preparerNotificationStock(
            materiel,
            ancienStock
        );


        if (fichier) {

            lirePhotoPuis(
                fichier,
                function (photo) {

                    materiel.photo =
                        photo;


                    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


                    materielEnModification =
                        null;


                    alert(
                        "✅ Matériel modifié."
                    );


                    gestionMateriels();

                }
            );

        } else {

            sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


            materielEnModification =
                null;


            alert(
                "✅ Matériel modifié."
            );


            gestionMateriels();

        }


        return;

    }


    /* =====================================================
       CREATION
       ===================================================== */

    const nouveauMateriel = {

        id:
            genererUUID(),

        nom:
            nom,

        reference:
            reference,

        stock:
            stock,

        minimum:
            minimum,

        emplacement:
            emplacement,

        description:
            description,

        categories:
            categoriesSelectionnees,

        photo:
            ""

    };


    if (fichier) {

        lirePhotoPuis(
            fichier,
            function (photo) {

                nouveauMateriel.photo =
                    photo;


                materiels.push(
                    nouveauMateriel
                );


                sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


                alert(
                    "✅ Matériel créé."
                );


                gestionMateriels();

            }
        );

    } else {

        materiels.push(
            nouveauMateriel
        );


        sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


        alert(
            "✅ Matériel créé."
        );


        gestionMateriels();

    }

}


function lirePhotoPuis(
    fichier,
    callback
) {

    const lecteur =
        new FileReader();


    lecteur.onload =
        function (event) {

            callback(
                event.target.result
            );

        };


    lecteur.onerror =
        function () {

            alert(
                "Impossible de lire la photo."
            );

        };


    lecteur.readAsDataURL(
        fichier
    );

}


/* =========================================================
   CATEGORIES
   ========================================================= */

function gestionCategories() {

    if (!verifierPermissionOuRetourAccueil(
        "acces_gestion_categories"
    )) {
        return;
    }


    let html = `

        <main class="page">

            <button
                class="retour-button"
                onclick="
                    afficherMenuAdministration()
                "
            >
                ← Retour
            </button>


            <h2>
                📂 Gestion des catégories
            </h2>


            <button
                class="add-button"
                onclick="
                    ajouterCategorie()
                "
            >
                ➕ Nouvelle catégorie
            </button>

    `;


    categories.forEach(
        function (categorie) {

            html += `

                <div
                    class="materiel"
                >

                    <h3>
                        📂
                        ${echapperHTML(
                            categorie
                        )}
                    </h3>


                    <div
                        class="
                            actions-materiel
                        "
                    >

                        <button
                            onclick="
                                modifierCategorie(
                                    '${echapperHTML(
                                        categorie
                                    )}'
                                )
                            "
                        >
                            ✏️ Modifier
                        </button>


                        <button
                            onclick="
                                supprimerCategorie(
                                    '${echapperHTML(
                                        categorie
                                    )}'
                                )
                            "
                        >
                            🗑️ Supprimer
                        </button>

                    </div>

                </div>

            `;

        }
    );


    html += `
        </main>
    `;


    document.getElementById(
        "app"
    ).innerHTML =
        html;

}


async function ajouterCategorie() {

    const nom =
        await afficherSaisieCIS(
            "Nom de la nouvelle catégorie :"
        );


    if (
        nom === null
    ) {

        return;

    }


    const nouveau =
        nom.trim();


    if (!nouveau) {

        alert(
            "Le nom ne peut pas être vide."
        );

        return;

    }


    const existe =
        categories.some(
            function (categorie) {

                return (
                    categorie.toLowerCase()
                    ===
                    nouveau.toLowerCase()
                );

            }
        );


    if (existe) {

        alert(
            "Cette catégorie existe déjà."
        );

        return;

    }


    categories.push(
        nouveau
    );


    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


    alert(
        "✅ Catégorie créée."
    );


    gestionCategories();

}


async function modifierCategorie(
    ancienNom
) {

    const nouveauNom =
        await afficherSaisieCIS(
            "Nouveau nom de la catégorie :",
            ancienNom
        );


    if (
        nouveauNom === null
    ) {

        return;

    }


    const nouveau =
        nouveauNom.trim();


    if (!nouveau) {

        alert(
            "Le nom ne peut pas être vide."
        );

        return;

    }


    const existe =
        categories.some(
            function (categorie) {

                return (
                    categorie !==
                    ancienNom
                    &&
                    categorie.toLowerCase()
                    ===
                    nouveau.toLowerCase()
                );

            }
        );


    if (existe) {

        alert(
            "Cette catégorie existe déjà."
        );

        return;

    }


    const index =
        categories.indexOf(
            ancienNom
        );


    if (index === -1) {

        return;

    }


    categories[index] =
        nouveau;


    materiels.forEach(
        function (materiel) {

            materiel.categories =
                materiel.categories.map(
                    function (categorie) {

                        if (
                            categorie.toLowerCase()
                            ===
                            ancienNom.toLowerCase()
                        ) {

                            return nouveau;

                        }

                        return categorie;

                    }
                );

        }
    );


    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


    alert(
        "✅ Catégorie modifiée."
    );


    gestionCategories();

}


async function supprimerCategorie(
    nom
) {

    if (!verifierPermissionOuRetourAccueil(
        "acces_administration"
    )) {
        return;
    }


    if (
        !await afficherConfirmationCIS(
            "Voulez-vous supprimer « " +
            nom +
            " » ?"
        )
    ) {

        return;

    }



    categories =
        categories.filter(
            function (categorie) {

                return (
                    categorie !==
                    nom
                );

            }
        );


    materiels.forEach(
        function (materiel) {

            materiel.categories =
                materiel.categories.filter(
                    function (categorie) {

                        return (
                            categorie !==
                            nom
                        );

                    }
                );


            if (
                materiel.categories.length ===
                0
            ) {

                materiel.categories =
                    categories.includes(
                        "AUTRE"
                    )
                        ? ["AUTRE"]
                        : [];

            }

        }
    );


    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


    alert(
        "✅ Catégorie supprimée."
    );


    gestionCategories();

}


/* =========================================================
   STOCK
   ========================================================= */

function modifierStock(
    id
) {

    if (!verifierPermissionOuRetourAccueil(
        "acces_administration"
    )) {
        return;
    }


    ouvrirFenetreStock(
        id
    );

}

/* =========================================================
   SUPPRESSION MATERIEL
   ========================================================= */

async function supprimerMateriel(
    id
) {

    if (!verifierPermissionOuRetourAccueil(
        "acces_administration"
    )) {
        return;
    }


    const materiel =
        materiels.find(
            function (m) {

                return (
                    String(m.id) ===
                    String(id)
                );

            }
        );


    if (!materiel) {

        return;

    }


    if (
        !await afficherConfirmationCIS(
            "Voulez-vous supprimer « " +
            materiel.nom +
            " » ?"
        )
    ) {

        return;

    }



    materiels =
        materiels.filter(
            function (m) {

                return (
                    String(m.id)
                    !==
                    String(id)
                );

            }
        );


    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


    alert(
        "✅ Matériel supprimé."
    );


    gestionMateriels();

}


/* =========================================================
   REMISE A ZERO HISTORIQUE
   ========================================================= */

async function remiseZeroHistorique() {

    if (
        !verifierPermissionOuRetourAccueil(
            "acces_remise_zero_historique"
        )
    ) {
        return;
    }


    if (
        historique.length === 0
    ) {

        alert(
            "L'historique est déjà vide."
        );

        return;
    }


    if (
        !navigator.onLine
    ) {

        alert(
            "Une connexion Internet est nécessaire pour archiver l'historique en toute sécurité."
        );

        return;
    }


    if (
        !await afficherConfirmationCIS(
            "Archiver l'historique actuel et commencer une nouvelle période ?"
        )
    ) {

        return;
    }


    const archive = {
        id:
            genererUUID(),
        date:
            dateAujourdhui(),
        createdAt:
            new Date().toISOString(),
        interventions:
            JSON.parse(
                JSON.stringify(
                    historique
                )
            )
    };


    const supabase =
        await assurerBibliothequeSupabaseDisponible();


    if (!supabase) {

        alert(
            "Impossible de joindre Supabase. Réessaie dans quelques instants."
        );

        return;
    }


    demarrerIndicateurSynchronisation();

    synchronisationSupabaseEnCours =
        true;


    try {

        /*
         * Cette fonction Supabase effectue les 3 opérations ensemble :
         * 1. création de l'archive,
         * 2. suppression des consommations courantes,
         * 3. suppression des interventions courantes.
         *
         * L'historique local n'est vidé qu'après réussite.
         */
        const resultat =
            await supabase.rpc(
                "archiver_historique_courant",
                {
                    p_archive_id:
                        archive.id,
                    p_date_commande:
                        archive.date,
                    p_interventions:
                        archive.interventions
                }
            );


        if (resultat.error) {
            throw resultat.error;
        }


        archivesHistorique.push(
            archive
        );

        historique = [];


        sauvegarderToutesLesDonnees();

        effacerModificationsEnAttente();

        enregistrerSnapshotSynchronisation();


        /*
         * Relire la base centrale pour confirmer immédiatement
         * que tous les appareils verront le même état.
         */
        const donnees =
            await recupererDonneesSupabase();

        await appliquerDonneesSupabaseLocalement(
            donnees
        );


        alert(
            "Historique archivé. Une nouvelle période a commencé."
        );


        afficherMenuAdministration();

    } catch (erreur) {

        console.error(
            "Archivage de l'historique impossible :",
            erreur
        );


        alert(
            "L'archivage n'a pas pu être effectué. Rien n'a été supprimé.\n\n" +
            "Erreur : " +
            (
                erreur?.message ||
                String(erreur)
            )
        );

    } finally {

        synchronisationSupabaseEnCours =
            false;

        arreterIndicateurSynchronisation();

    }

}


/* =========================================================
   FONCTIONS GLOBALES
   ========================================================= */

window.afficherConnexion =
    afficherConnexion;

window.seConnecterApplication =
    seConnecterApplication;

window.deconnecterApplication =
    deconnecterApplication;

window.rechercherMiseAJourDepuisProfil =
    rechercherMiseAJourDepuisProfil;

window.afficherProfilUtilisateur =
    afficherProfilUtilisateur;

window.changerMonMotDePasse =
    changerMonMotDePasse;

window.changerNotificationsProfil =
    changerNotificationsProfil;

window.afficherMenuAdministrateurAppli =
    afficherMenuAdministrateurAppli;

window.afficherGestionUtilisateurs =
    afficherGestionUtilisateurs;

window.creerUtilisateurAdministration =
    creerUtilisateurAdministration;

window.modifierRoleUtilisateur =
    modifierRoleUtilisateur;

window.changerMotDePasseUtilisateur =
    changerMotDePasseUtilisateur;

window.changerEtatUtilisateur =
    changerEtatUtilisateur;

window.creerRoleAdministration =
    creerRoleAdministration;

window.enregistrerRole =
    enregistrerRole;

window.supprimerRoleGestion =
    supprimerRoleGestion;

window.afficherAccueil =
    afficherAccueil;

window.afficherInventaire =
    afficherInventaire;

window.fermerFenetreStock =
    fermerFenetreStock;

window.enregistrerStockTotal =
    enregistrerStockTotal;

window.ajouterAuStock =
    ajouterAuStock;

window.selectionnerQuantiteRetour =
    selectionnerQuantiteRetour;

window.afficherRetourIntervention =
    afficherRetourIntervention;

window.validerRetourIntervention =
    validerRetourIntervention;

window.augmenterConsommation =
    augmenterConsommation;

window.diminuerConsommation =
    diminuerConsommation;

window.rechercherMaterielRetour =
    rechercherMaterielRetour;

window.afficherArchivesHistorique =
    afficherArchivesHistorique;

window.afficherDetailCommandeArchive =
    afficherDetailCommandeArchive;

window.afficherReapprovisionnementArchive =
    afficherReapprovisionnementArchive;

window.afficherReapprovisionnementAdministration =
    afficherReapprovisionnementAdministration;

window.validerReapprovisionnementAdministration =
    validerReapprovisionnementAdministration;

window.ajouterLigneReapprovisionnementArchive =
    ajouterLigneReapprovisionnementArchive;

window.validerReapprovisionnementArchive =
    validerReapprovisionnementArchive;

window.afficherDetailInterventionArchive =
    afficherDetailInterventionArchive;

window.afficherHistorique =
    afficherHistorique;

window.afficherDetailConsommation =
    afficherDetailConsommation;

window.afficherDetailIntervention =
    afficherDetailIntervention;

window.afficherModificationRetourIntervention =
    afficherModificationRetourIntervention;

window.enregistrerModificationRetourIntervention =
    enregistrerModificationRetourIntervention;

window.supprimerRetourIntervention =
    supprimerRetourIntervention;

window.ouvrirAdministration =
    ouvrirAdministration;

window.verifierCodeAdmin =
    verifierCodeAdmin;

window.afficherMenuAdministration =
    afficherMenuAdministration;

window.ajouterMateriel =
    ajouterMateriel;

window.modifierMateriel =
    modifierMateriel;

window.afficherFormulaireMateriel =
    afficherFormulaireMateriel;

window.enregistrerMateriel =
    enregistrerMateriel;

window.gestionMateriels =
    gestionMateriels;

window.modifierStock =
    modifierStock;

window.supprimerMateriel =
    supprimerMateriel;

window.gestionCategories =
    gestionCategories;

window.ajouterCategorie =
    ajouterCategorie;

window.modifierCategorie =
    modifierCategorie;

window.supprimerCategorie =
    supprimerCategorie;

window.remiseZeroHistorique =
    remiseZeroHistorique;

window.basculerCategorie =
    basculerCategorie;


/* =========================================================
   INTERFACE BUREAU V43
   Mobile inchangé / PC entièrement dédié
   ========================================================= */

function initialiserInterfaceBureau() {

    if (document.getElementById("style-interface-bureau")) {
        actualiserInterfaceBureau();
        return;
    }

    const style = document.createElement("style");
    style.id = "style-interface-bureau";

    style.textContent = `
        #navigation-bureau {
            display: none;
        }

        .bureau-seulement {
            display: none !important;
        }

        @media (min-width: 1000px) {

            :root {
                --pc-sidebar: 252px;
                --pc-fond: #0d141b;
                --pc-fond-2: #111a22;
                --pc-panel: #141e27;
                --pc-panel-2: #18232d;
                --pc-bordure: #26333f;
                --pc-bordure-claire: #34424f;
                --pc-texte: #f5f7f9;
                --pc-secondaire: #9eabb6;
                --pc-vert: #0f6a43;
                --pc-vert-fonce: #084b30;
                --pc-vert-clair: #dff3e7;
                --pc-rouge: #df3b45;
            }

            .bureau-seulement {
                display: block !important;
            }

            .mobile-seulement {
                display: none !important;
            }

            html,
            body {
                min-height: 100%;
                background: var(--pc-fond);
            }

            body:not(.mode-connexion) {
                background:
                    radial-gradient(circle at 85% 8%, rgba(49,72,89,.16), transparent 30%),
                    linear-gradient(135deg, #0b1117 0%, #101820 100%) !important;
                color: var(--pc-texte);
            }

            body:not(.mode-connexion) #app {
                width: calc(100% - var(--pc-sidebar));
                min-height: 100vh;
                margin-left: var(--pc-sidebar);
                box-sizing: border-box;
                background: transparent;
            }

            /* =====================================================
               MENU LATERAL
               ===================================================== */

            #navigation-bureau {
                position: fixed;
                z-index: 9000;
                inset: 0 auto 0 0;
                width: var(--pc-sidebar);
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                padding: 20px 15px 18px;
                background:
                    linear-gradient(180deg, #111820 0%, #161f29 100%);
                color: #fff;
                border-right: 1px solid rgba(255,255,255,.07);
                box-shadow: 10px 0 30px rgba(0,0,0,.12);
            }

            body.mode-connexion #navigation-bureau,
            #navigation-bureau.masquee {
                display: none !important;
            }

            .bureau-marque {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 2px 18px;
                margin-bottom: 12px;
                border-bottom: 1px solid rgba(255,255,255,.08);
            }

            .bureau-logo {
                display: block;
                width: 100%;
                max-width: 218px;
                height: auto;
                max-height: 190px;
                object-fit: contain;
                border-radius: 0;
                background: transparent;
                box-shadow: none;
            }

            .bureau-nav {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .bureau-nav-separateur {
                margin: 17px 10px 7px;
                color: #65727d;
                font-size: 10px;
                font-weight: 850;
                text-transform: uppercase;
                letter-spacing: .13em;
            }

            .bureau-nav-bouton {
                width: 100%;
                min-height: 43px;
                display: flex;
                align-items: center;
                gap: 11px;
                box-sizing: border-box;
                padding: 9px 11px;
                border: 1px solid transparent;
                border-radius: 9px;
                background: transparent;
                color: #c8d0d7;
                text-align: left;
                font: inherit;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: .16s ease;
            }

            .bureau-nav-bouton:hover {
                background: #1b2631;
                border-color: #293642;
                color: #fff;
            }

            .bureau-nav-bouton.actif {
                background: #29333f;
                border-color: #36434f;
                color: #fff;
                box-shadow: inset 3px 0 0 #fff;
            }

            .bureau-nav-bouton.reappro {
                color: #bfe6d2;
            }

            .bureau-nav-bouton.reappro.actif {
                background: #0c5537;
                border-color: #137149;
                box-shadow: inset 3px 0 0 #7ee0aa;
                color: #fff;
            }

            .bureau-nav-puce {
                width: 7px;
                height: 7px;
                flex: 0 0 7px;
                border-radius: 50%;
                background: currentColor;
                opacity: .8;
            }

            .bureau-utilisateur {
                margin-top: auto;
                padding-top: 14px;
                border-top: 1px solid rgba(255,255,255,.08);
            }

            .bureau-profil {
                width: 100%;
                display: block;
                box-sizing: border-box;
                padding: 10px 11px;
                border: 1px solid transparent;
                border-radius: 9px;
                background: transparent;
                color: #fff;
                text-align: left;
                cursor: pointer;
            }

            .bureau-profil:hover {
                background: #1b2631;
                border-color: #293642;
            }

            .bureau-profil strong,
            .bureau-profil small {
                display: block;
            }

            .bureau-profil strong {
                font-size: 13px;
            }

            .bureau-profil small {
                margin-top: 3px;
                color: #8e9ba7;
                font-size: 11px;
            }

            /* =====================================================
               STRUCTURE GENERALE DES PAGES
               ===================================================== */

            body:not(.mode-connexion) #app > .page,
            body:not(.mode-connexion) #app > .reappro-page {
                width: auto !important;
                max-width: none !important;
                min-height: 100vh;
                margin: 0 !important;
                padding: 34px 42px 58px !important;
                box-sizing: border-box;
            }

            body:not(.mode-connexion) #app > .page {
                background: transparent !important;
            }

            body:not(.mode-connexion) .page > .retour-button,
            body:not(.mode-connexion) .reappro-retour,
            body:not(.mode-connexion) .utilisateur-entete {
                display: none !important;
            }

            body:not(.mode-connexion) .page > h1,
            body:not(.mode-connexion) .page > h2,
            body:not(.mode-connexion) .page > h3 {
                color: var(--pc-texte) !important;
            }

            body:not(.mode-connexion) .page > h2 {
                margin: 0 0 25px !important;
                font-size: 28px !important;
                font-weight: 850 !important;
                line-height: 1.15 !important;
                letter-spacing: -.025em;
            }

            body:not(.mode-connexion) .page > h3 {
                margin: 26px 0 12px !important;
                color: #cbd3d9 !important;
                font-size: 14px !important;
                font-weight: 800 !important;
            }

            body:not(.mode-connexion) .accueil-header {
                margin: 0 0 28px !important;
                padding: 0 !important;
                text-align: left !important;
            }

            body:not(.mode-connexion) .accueil-header h1 {
                margin: 0 !important;
                color: var(--pc-texte) !important;
                font-size: 31px !important;
                line-height: 1.1 !important;
                letter-spacing: -.03em;
            }

            body:not(.mode-connexion) .accueil-header p {
                margin: 7px 0 0 !important;
                color: var(--pc-secondaire) !important;
                font-size: 13px !important;
            }

            /* =====================================================
               ACCUEIL / ADMINISTRATION
               Plus de gros boutons type téléphone
               ===================================================== */

            body:not(.mode-connexion) .menu-principal,
            body:not(.mode-connexion) .menu-administration {
                display: grid !important;
                grid-template-columns: repeat(3, minmax(210px, 1fr));
                gap: 12px !important;
                max-width: 1120px;
            }

            body:not(.mode-connexion) .menu-principal .menu-button,
            body:not(.mode-connexion) .menu-administration .menu-button {
                min-height: 76px !important;
                margin: 0 !important;
                padding: 15px 16px !important;
                display: flex !important;
                align-items: center;
                gap: 13px;
                box-sizing: border-box;
                border: 1px solid var(--pc-bordure) !important;
                border-radius: 9px !important;
                background: linear-gradient(180deg, #151f28, #121a22) !important;
                color: var(--pc-texte) !important;
                box-shadow: none !important;
                text-align: left !important;
                cursor: pointer;
                transition: .16s ease;
            }

            body:not(.mode-connexion) .menu-principal .menu-button:hover,
            body:not(.mode-connexion) .menu-administration .menu-button:hover {
                background: #1a2630 !important;
                border-color: var(--pc-bordure-claire) !important;
                transform: translateY(-1px);
            }

            body:not(.mode-connexion) .menu-button .menu-icon {
                width: 34px;
                height: 34px;
                display: grid;
                place-items: center;
                flex: 0 0 34px;
                border-radius: 8px;
                background: #202d38;
                font-size: 16px !important;
            }

            body:not(.mode-connexion) .menu-button strong {
                display: block;
                color: #f4f7f9 !important;
                font-size: 13px !important;
                line-height: 1.2;
            }

            body:not(.mode-connexion) .menu-button small {
                display: block;
                margin-top: 5px !important;
                color: var(--pc-secondaire) !important;
                font-size: 11px !important;
                line-height: 1.3;
            }

            body:not(.mode-connexion) .menu-administration .menu-reapprovisionnement-admin {
                background: linear-gradient(180deg, #12603f, #0c4c32) !important;
                border-color: #1a7450 !important;
            }

            body:not(.mode-connexion) .menu-administration .menu-reapprovisionnement-admin strong,
            body:not(.mode-connexion) .menu-administration .menu-reapprovisionnement-admin small {
                color: #fff !important;
            }

            /* =====================================================
               FORMULAIRES / PANNEAUX
               ===================================================== */

            body:not(.mode-connexion) .formulaire,
            body:not(.mode-connexion) .bloc-admin,
            body:not(.mode-connexion) .profil-carte,
            body:not(.mode-connexion) .detail-header {
                box-sizing: border-box;
                max-width: 1120px;
                padding: 20px !important;
                border: 1px solid var(--pc-bordure) !important;
                border-radius: 10px !important;
                background: linear-gradient(180deg, #151f28, #121a22) !important;
                color: var(--pc-texte) !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .formulaire label,
            body:not(.mode-connexion) .bloc-admin label,
            body:not(.mode-connexion) .profil-carte label {
                color: #cbd4da !important;
                font-size: 12px !important;
                font-weight: 750 !important;
            }

            body:not(.mode-connexion) input,
            body:not(.mode-connexion) select,
            body:not(.mode-connexion) textarea {
                box-sizing: border-box;
                border: 1px solid #34414c !important;
                border-radius: 7px !important;
                background: #0f171e !important;
                color: #f2f5f7 !important;
                font-size: 13px !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) input::placeholder,
            body:not(.mode-connexion) textarea::placeholder {
                color: #73808b !important;
            }

            body:not(.mode-connexion) input:focus,
            body:not(.mode-connexion) select:focus,
            body:not(.mode-connexion) textarea:focus {
                border-color: #63717d !important;
                outline: none !important;
                box-shadow: 0 0 0 3px rgba(99,113,125,.12) !important;
            }

            body:not(.mode-connexion) .recherche {
                max-width: 560px;
                margin: 0 0 22px !important;
            }

            body:not(.mode-connexion) .recherche input {
                min-height: 42px !important;
            }

            /*
             * Contraste PC :
             * les résumés issus de la mise en page mobile avaient un fond clair
             * mais conservaient le texte clair du thème bureau.
             */
            body:not(.mode-connexion) .resume,
            body:not(.mode-connexion) #resume-consommation .resume {
                box-sizing: border-box;
                padding: 16px 18px !important;
                border: 1px solid var(--pc-bordure) !important;
                border-radius: 10px !important;
                background: #151f28 !important;
                color: #f5f7f9 !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .resume h1,
            body:not(.mode-connexion) .resume h2,
            body:not(.mode-connexion) .resume h3,
            body:not(.mode-connexion) .resume p,
            body:not(.mode-connexion) .resume span,
            body:not(.mode-connexion) .resume strong,
            body:not(.mode-connexion) #resume-consommation * {
                color: #f5f7f9 !important;
            }

            body:not(.mode-connexion) .add-button,
            body:not(.mode-connexion) .petit-bouton,
            body:not(.mode-connexion) .profil-bouton-principal {
                min-height: 38px !important;
                padding: 8px 13px !important;
                border: 1px solid #3a4854 !important;
                border-radius: 7px !important;
                background: #202c36 !important;
                color: #fff !important;
                font-size: 12px !important;
                font-weight: 750 !important;
                box-shadow: none !important;
            }

            /* =====================================================
               INVENTAIRE / HISTORIQUE / ARCHIVES
               Cartes transformées en lignes bureau
               ===================================================== */

            body:not(.mode-connexion) .categorie-bloc {
                max-width: 1180px;
                margin-bottom: 18px !important;
                border: 1px solid var(--pc-bordure) !important;
                border-radius: 10px !important;
                overflow: hidden;
                background: #121b23 !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .categorie-titre {
                min-height: 46px !important;
                padding: 10px 15px !important;
                border: 0 !important;
                border-bottom: 1px solid var(--pc-bordure) !important;
                border-radius: 0 !important;
                background: #18232d !important;
                color: #f5f7f9 !important;
                box-shadow: none !important;
                font-size: 13px !important;
            }

            body:not(.mode-connexion) .categorie-contenu {
                padding: 0 !important;
            }

            body:not(.mode-connexion) .materiel,
            body:not(.mode-connexion) .detail-historique,
            body:not(.mode-connexion) .historique-total,
            body:not(.mode-connexion) .intervention-cliquable,
            body:not(.mode-connexion) .archive-commande {
                max-width: 1180px;
                box-sizing: border-box;
                margin: 0 !important;
                padding: 12px 15px !important;
                border: 0 !important;
                border-bottom: 1px solid #222f39 !important;
                border-radius: 0 !important;
                background: #111a22 !important;
                color: var(--pc-texte) !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .materiel:last-child,
            body:not(.mode-connexion) .detail-historique:last-child,
            body:not(.mode-connexion) .intervention-cliquable:last-child {
                border-bottom: 0 !important;
            }

            body:not(.mode-connexion) .materiel:hover,
            body:not(.mode-connexion) .intervention-cliquable:hover {
                background: #16212a !important;
            }

            body:not(.mode-connexion) .carte-materiel-horizontal {
                min-height: 78px !important;
            }

            body:not(.mode-connexion) .carte-photo-droite {
                width: 58px !important;
                height: 58px !important;
                border-radius: 7px !important;
            }

            body:not(.mode-connexion) .photo-materiel {
                border-radius: 7px !important;
            }

            body:not(.mode-connexion) .archive-periode {
                max-width: 1180px;
                margin-bottom: 18px !important;
                border: 1px solid var(--pc-bordure);
                border-radius: 10px;
                overflow: hidden;
                background: #111a22;
            }

            body:not(.mode-connexion) .archive-commande {
                background: #124d35 !important;
                border-bottom-color: #1f684a !important;
            }

            body:not(.mode-connexion) .archive-interventions-titre {
                margin: 0 !important;
                padding: 10px 15px !important;
                background: #17212a;
                color: #9ba8b2 !important;
                font-size: 11px !important;
            }

            /* =====================================================
               GESTION UTILISATEURS / ROLES
               ===================================================== */

            body:not(.mode-connexion) .gestion-utilisateurs-page {
                max-width: none !important;
            }

            body:not(.mode-connexion) .gestion-utilisateurs-page .bloc-admin {
                max-width: 1180px;
                margin-bottom: 18px !important;
            }

            body:not(.mode-connexion) .carte-utilisateur,
            body:not(.mode-connexion) .carte-role {
                margin: 10px 0 !important;
                padding: 16px !important;
                border: 1px solid #2b3944 !important;
                border-radius: 9px !important;
                background: #101820 !important;
                color: #eef2f5 !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .gestion-utilisateurs-page .badge-role {
                background: #dfe8ef !important;
                color: #101820 !important;
                border: 1px solid #c4d0da !important;
            }

            body:not(.mode-connexion) .gestion-utilisateurs-page input,
            body:not(.mode-connexion) .gestion-utilisateurs-page select {
                background: #16212a !important;
                color: #eef2f5 !important;
                border-color: #394955 !important;
            }

            body:not(.mode-connexion) .gestion-utilisateurs-page input::placeholder {
                color: #9ba8b2 !important;
                opacity: 1;
            }

            body:not(.mode-connexion) .gestion-utilisateurs-page select option {
                background: #ffffff;
                color: #17202a;
            }

            body:not(.mode-connexion) .gestion-utilisateurs-page label,
            body:not(.mode-connexion) .gestion-utilisateurs-page small,
            body:not(.mode-connexion) .gestion-utilisateurs-page strong {
                color: inherit;
            }

            body:not(.mode-connexion) .permissions-role {
                display: grid !important;
                grid-template-columns: repeat(3, minmax(190px, 1fr));
                gap: 7px !important;
                margin-top: 13px !important;
            }

            body:not(.mode-connexion) .permissions-role label {
                min-height: 38px;
                display: flex;
                align-items: center;
                gap: 8px;
                box-sizing: border-box;
                padding: 8px 10px;
                border: 1px solid #2a3741;
                border-radius: 7px;
                background: #151e26;
                color: #dce3e8 !important;
                font-size: 11px !important;
            }

            body:not(.mode-connexion) .permissions-role input[type="checkbox"] {
                width: 15px !important;
                height: 15px !important;
                min-height: 0 !important;
                accent-color: #18a766;
            }

            /* =====================================================
               REAPPROVISIONNEMENT PC
               Reprise fidèle de la direction visuelle de la maquette
               ===================================================== */

            body:not(.mode-connexion) #app > .reappro-page {
                position: relative;
                overflow: hidden;
                max-width: none !important;
                padding: 34px 42px 58px !important;
                background:
                    radial-gradient(circle at 82% 5%, rgba(51,142,92,.25), transparent 26%),
                    radial-gradient(circle at 105% 105%, rgba(63,146,101,.18), transparent 34%),
                    linear-gradient(145deg, #073b29 0%, #075237 45%, #043522 100%) !important;
                color: #fff;
            }

            body:not(.mode-connexion) #app > .reappro-page::before,
            body:not(.mode-connexion) #app > .reappro-page::after {
                content: "";
                position: absolute;
                pointer-events: none;
                border: 40px solid rgba(255,255,255,.035);
                border-radius: 50%;
            }

            body:not(.mode-connexion) #app > .reappro-page::before {
                width: 640px;
                height: 640px;
                right: -330px;
                top: -390px;
            }

            body:not(.mode-connexion) #app > .reappro-page::after {
                width: 760px;
                height: 760px;
                left: 20%;
                bottom: -690px;
            }

            body:not(.mode-connexion) .reappro-entete,
            body:not(.mode-connexion) .reappro-feuille {
                position: relative;
                z-index: 1;
                width: min(100%, 1120px) !important;
                max-width: 1120px !important;
                margin-left: 0 !important;
                box-sizing: border-box;
            }

            body:not(.mode-connexion) .reappro-entete {
                min-height: 144px;
                display: flex !important;
                align-items: flex-start;
                justify-content: space-between;
                gap: 28px;
                padding: 8px 2px 26px !important;
                background: transparent !important;
                color: #fff !important;
            }

            body:not(.mode-connexion) .reappro-entete-contenu {
                min-width: 0;
            }

            body:not(.mode-connexion) .reappro-sur-titre {
                margin: 0 0 8px !important;
                color: #96cdb0 !important;
                font-size: 11px !important;
                font-weight: 850 !important;
                letter-spacing: .15em !important;
                text-transform: uppercase;
            }

            body:not(.mode-connexion) .reappro-entete h2 {
                margin: 0 !important;
                color: #fff !important;
                font-size: 35px !important;
                line-height: 1.08;
                font-weight: 900 !important;
                letter-spacing: -.035em;
            }

            body:not(.mode-connexion) .reappro-sous-titre-bureau {
                margin: 10px 0 0 !important;
                color: rgba(255,255,255,.74) !important;
                font-size: 13px !important;
            }

            body:not(.mode-connexion) .reappro-date-bureau {
                min-width: 190px;
                padding: 14px 17px;
                border: 1px solid rgba(157,224,185,.30);
                border-radius: 11px;
                background: rgba(46,140,88,.24);
                color: #fff;
                text-align: left;
                backdrop-filter: blur(4px);
            }

            body:not(.mode-connexion) .reappro-date-label {
                display: block;
                margin-bottom: 4px;
                color: rgba(255,255,255,.72);
                font-size: 10px;
            }

            body:not(.mode-connexion) .reappro-date-bureau strong {
                font-size: 13px;
            }

            body:not(.mode-connexion) .reappro-feuille {
                margin-top: 0 !important;
                padding: 54px 30px 28px !important;
                border: 14px solid rgba(208,247,224,.38) !important;
                border-radius: 16px !important;
                background:
                    linear-gradient(180deg, #fbfffc 0%, #f4fbf6 100%) !important;
                color: #111a15 !important;
                box-shadow: 0 18px 48px rgba(0,0,0,.18) !important;
            }

            body:not(.mode-connexion) .reappro-icone-bureau {
                position: absolute;
                left: 50%;
                top: -35px;
                transform: translateX(-50%);
                width: 64px;
                height: 64px;
                display: grid !important;
                place-items: center;
                border-radius: 14px;
                background: #178b54;
                color: #fff;
                font-size: 35px;
                font-weight: 400;
                box-shadow: 0 8px 18px rgba(20,112,67,.25);
            }

            body:not(.mode-connexion) .reappro-grand-titre {
                margin: 0 0 20px !important;
                color: #101713 !important;
                text-align: center;
                font-size: 24px !important;
                font-weight: 900 !important;
                letter-spacing: -.02em;
            }

            body:not(.mode-connexion) .reappro-table-entete {
                display: grid !important;
                grid-template-columns: 36px minmax(300px, 1fr) 120px 70px;
                gap: 12px;
                align-items: center;
                padding: 10px 4px;
                border-top: 1px solid #dce9e0;
                border-bottom: 1px solid #dce9e0;
                color: #27342c;
                font-size: 11px;
                font-weight: 850;
            }

            body:not(.mode-connexion) .reappro-ligne-supplementaire {
                position: relative;
                grid-template-columns: minmax(300px, 1fr) 120px 42px !important;
                gap: 12px !important;
                align-items: center !important;
                min-height: 58px !important;
                margin: 0 !important;
                padding: 10px 4px 10px 52px !important;
                border-bottom: 1px solid #e1ebe4 !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .reappro-ligne-supplementaire::before {
                content: counter(reappro-row);
                counter-increment: reappro-row;
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                color: #526059;
                font-size: 12px;
                font-weight: 750;
            }

            body:not(.mode-connexion) #reappro-lignes-supplementaires {
                counter-reset: reappro-row;
            }

            body:not(.mode-connexion) .reappro-recherche,
            body:not(.mode-connexion) .reappro-quantite {
                min-height: 42px !important;
                border: 1px solid #cfdad2 !important;
                border-radius: 7px !important;
                background: #fff !important;
                color: #172019 !important;
                font-size: 12px !important;
            }

            body:not(.mode-connexion) .reappro-quantite {
                text-align: center;
                cursor: pointer;
                appearance: auto !important;
            }

            body:not(.mode-connexion) .reappro-resultats {
                border: 1px solid #cfdad2 !important;
                border-radius: 7px !important;
                background: #fff !important;
                box-shadow: 0 10px 28px rgba(20,45,30,.16) !important;
            }

            body:not(.mode-connexion) .reappro-resultat {
                background: #fff !important;
                color: #172019 !important;
            }

            body:not(.mode-connexion) .reappro-resultat:hover {
                background: #edf7f1 !important;
            }

            body:not(.mode-connexion) .reappro-supprimer-ligne {
                width: 36px !important;
                height: 36px !important;
                border: 0 !important;
                border-radius: 7px !important;
                background: #df3b45 !important;
                color: #fff !important;
                font-size: 18px !important;
            }

            body:not(.mode-connexion) .reappro-ajout-zone {
                margin: 18px 0 22px !important;
                padding: 0 !important;
                border: 0 !important;
            }

            body:not(.mode-connexion) .reappro-ajouter {
                width: 100% !important;
                min-height: 66px !important;
                border: 2px dashed #1c9b5e !important;
                border-radius: 9px !important;
                background: rgba(231,248,237,.55) !important;
                color: #126a41 !important;
                font-size: 13px !important;
                font-weight: 850 !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .reappro-ajouter:hover {
                background: #e8f7ed !important;
            }

            body:not(.mode-connexion) .reappro-validation {
                width: 100% !important;
                min-height: 48px !important;
                margin: 0 !important;
                border: 0 !important;
                border-radius: 8px !important;
                background: linear-gradient(180deg, #087c49, #05663d) !important;
                color: #fff !important;
                font-size: 13px !important;
                font-weight: 900 !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .reappro-note {
                max-width: none !important;
                margin: 18px 0 0 !important;
                padding: 13px 15px !important;
                border: 1px solid rgba(47,160,95,.40);
                border-radius: 8px;
                background: rgba(31,139,78,.08);
                color: #316044 !important;
                font-size: 11px !important;
                text-align: left !important;
            }

            /* Réappro rapide depuis archives : même DA générale sur PC */
            body:not(.mode-connexion) .reappro-ligne-consommee {
                grid-template-columns: minmax(300px, 1fr) 120px !important;
                gap: 12px !important;
                padding: 10px 4px !important;
                border-bottom: 1px solid #e1ebe4 !important;
                background: transparent !important;
                color: #172019 !important;
            }

            body:not(.mode-connexion) .reappro-nom {
                color: #172019 !important;
            }

            body:not(.mode-connexion) .reappro-stock {
                color: #6e7a72 !important;
            }

            /* Profil PC */
            body:not(.mode-connexion) .profil-page {
                max-width: 980px !important;
            }

            body:not(.mode-connexion) .profil-entete {
                color: var(--pc-texte) !important;
            }

            body:not(.mode-connexion) .profil-role,
            body:not(.mode-connexion) .profil-version,
            body:not(.mode-connexion) .profil-notification-texte,
            body:not(.mode-connexion) .profil-mise-a-jour-texte {
                color: var(--pc-secondaire) !important;
            }

            @media (max-width: 1220px) {
                body:not(.mode-connexion) .menu-principal,
                body:not(.mode-connexion) .menu-administration {
                    grid-template-columns: repeat(2, minmax(210px, 1fr));
                }

                body:not(.mode-connexion) .permissions-role {
                    grid-template-columns: repeat(2, minmax(190px, 1fr));
                }
            }
        }
    `;

    document.head.appendChild(style);

    const navigation = document.createElement("aside");
    navigation.id = "navigation-bureau";
    navigation.className = "masquee";
    document.body.appendChild(navigation);

    const appElement = document.getElementById("app");

    if (appElement) {

        const observateur =
            new MutationObserver(
                function () {
                    window.requestAnimationFrame(
                        actualiserInterfaceBureau
                    );
                }
            );

        observateur.observe(
            appElement,
            {
                childList: true,
                subtree: false
            }
        );
    }

    window.addEventListener(
        "resize",
        actualiserInterfaceBureau
    );

    actualiserInterfaceBureau();
}


function obtenirRubriqueBureauActive() {

    const titre =
        String(
            document.querySelector(
                "#app h1, #app h2"
            )?.textContent ||
            ""
        )
            .trim()
            .toLowerCase();

    if (titre.includes("réapprovisionnement")) return "reappro";
    if (titre.includes("inventaire")) return "inventaire";
    if (titre.includes("retour")) return "retour";
    if (
        titre.includes("historique") ||
        titre.includes("archive") ||
        titre.includes("commande effectuée")
    ) return "historique";
    if (
        titre.includes("administrateur appli") ||
        titre.includes("utilisateur") ||
        titre.includes("rôle") ||
        titre.includes("notification")
    ) return "admin-appli";
    if (
        titre.includes("administration") ||
        titre.includes("matériel") ||
        titre.includes("catégorie")
    ) return "administration";
    if (titre.includes("profil")) return "profil";

    return "accueil";
}


function actualiserInterfaceBureau() {

    const navigation =
        document.getElementById(
            "navigation-bureau"
        );

    if (!navigation) {
        return;
    }

    if (
        !profilUtilisateurConnecte ||
        document.body.classList.contains(
            "mode-connexion"
        )
    ) {
        navigation.classList.add(
            "masquee"
        );
        return;
    }

    navigation.classList.remove(
        "masquee"
    );

    const role =
        obtenirRoleUtilisateur();

    const actif =
        obtenirRubriqueBureauActive();

    const bouton =
        function (
            id,
            libelle,
            action,
            visible = true,
            classe = ""
        ) {

            if (!visible) {
                return "";
            }

            return `
                <button
                    type="button"
                    class="bureau-nav-bouton ${actif === id ? "actif" : ""} ${classe}"
                    onclick="${action}"
                >
                    <span class="bureau-nav-puce"></span>
                    <span>${echapperHTML(libelle)}</span>
                </button>
            `;
        };

    navigation.innerHTML = `
        <div class="bureau-marque">

            <img
                class="bureau-logo"
                src="./logo-version-pc.png"
                alt="Logo"
            >

        </div>

        <nav
            class="bureau-nav"
            aria-label="Navigation principale"
        >

            ${bouton(
                "accueil",
                "Accueil",
                "afficherAccueil()"
            )}

            ${bouton(
                "inventaire",
                "Inventaire",
                "afficherInventaire()",
                utilisateurAPermission(
                    "acces_inventaire"
                )
            )}

            ${bouton(
                "retour",
                "Retour d'intervention",
                "afficherRetourIntervention()",
                utilisateurAPermission(
                    "acces_retour_intervention"
                )
            )}

            ${bouton(
                "historique",
                "Historique",
                "afficherHistorique()",
                utilisateurAPermission(
                    "acces_historique"
                )
            )}

            ${
                utilisateurAPermission(
                    "acces_administration"
                )
                    ? `
                        <div class="bureau-nav-separateur">
                            Gestion
                        </div>
                    `
                    : ""
            }

            ${bouton(
                "administration",
                "Administration",
                "afficherMenuAdministration()",
                utilisateurAPermission(
                    "acces_administration"
                )
            )}

            ${bouton(
                "reappro",
                "Réapprovisionnement",
                "afficherReapprovisionnementAdministration()",
                utilisateurAPermission(
                    "acces_reapprovisionnement"
                ),
                "reappro"
            )}

            ${bouton(
                "admin-appli",
                "Administrateur APPLI",
                "afficherMenuAdministrateurAppli()",
                utilisateurEstSPVAdmin()
            )}

        </nav>

        <div class="bureau-utilisateur">

            <button
                type="button"
                class="bureau-profil ${actif === "profil" ? "actif" : ""}"
                onclick="afficherProfilUtilisateur()"
            >
                <strong>
                    ${echapperHTML(
                        obtenirNomUtilisateurAffiche()
                    )}
                </strong>

                <small>
                    ${echapperHTML(
                        role?.nom || ""
                    )}
                </small>
            </button>

        </div>
    `;
}


/* Démarrage de l'interface bureau */
if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiserInterfaceBureau
    );

} else {

    initialiserInterfaceBureau();

}
