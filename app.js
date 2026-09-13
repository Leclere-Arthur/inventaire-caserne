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
    "2.9.40";

const CLE_PROFIL_UTILISATEUR_CACHE =
    "profil_utilisateur_connecte_v1";

let utilisateurConnecte = null;
let profilUtilisateurConnecte = null;
let connexionApplicationEnCours = false;

/*
 * Retour du profil : on mémorise exactement la page affichée avant
 * d'ouvrir le profil afin que « Retour » revienne au bon endroit
 * (Caserne, Pharmacie, Accueil, rubrique, etc.).
 */
let etatPageAvantProfil = null;

/* =========================================================
   HISTORIQUE DE NAVIGATION INTERNE
   Tous les boutons « Retour » reviennent désormais à la page
   réellement consultée juste avant, quel que soit l'espace.
   ========================================================= */
const historiqueNavigationApplication = [];
let etatNavigationCourante = null;
let restaurationNavigationEnCours = false;
let observateurHistoriqueNavigationInstalle = false;

function obtenirSignaturePageApplication() {
    const app = document.getElementById("app");
    if (!app) return "";
    const principal = app.querySelector("main");
    const titre = String(app.querySelector("h1,h2")?.textContent || "").trim();
    const classes = String(principal?.className || "").trim();
    return `${classes}::${titre}`;
}

function capturerEtatPageApplication() {
    const app = document.getElementById("app");
    if (!app) return null;
    return {
        html: app.innerHTML,
        scrollX: window.scrollX || 0,
        scrollY: window.scrollY || 0,
        bodyClassName: document.body.className || "",
        signature: obtenirSignaturePageApplication()
    };
}

function memoriserTransitionNavigation() {
    if (restaurationNavigationEnCours) return;
    const nouvelEtat = capturerEtatPageApplication();
    if (!nouvelEtat || !nouvelEtat.signature) return;

    if (!etatNavigationCourante) {
        etatNavigationCourante = nouvelEtat;
        return;
    }

    if (nouvelEtat.signature !== etatNavigationCourante.signature) {
        historiqueNavigationApplication.push(etatNavigationCourante);
        if (historiqueNavigationApplication.length > 40) historiqueNavigationApplication.shift();
        etatNavigationCourante = nouvelEtat;
    } else {
        etatNavigationCourante = nouvelEtat;
    }
}

function installerHistoriqueNavigationApplication() {
    if (observateurHistoriqueNavigationInstalle) return;
    observateurHistoriqueNavigationInstalle = true;
    const app = document.getElementById("app");
    if (!app) return;

    etatNavigationCourante = capturerEtatPageApplication();
    const obs = new MutationObserver(() => {
        requestAnimationFrame(memoriserTransitionNavigation);
    });
    obs.observe(app, { childList: true, subtree: false });

    document.addEventListener("click", (event) => {
        const bouton = event.target?.closest?.(".retour-button, .reappro-retour, [data-retour-page]");
        if (!bouton) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        retourPagePrecedente();
    }, true);
}

function retourPagePrecedente() {
    const precedent = historiqueNavigationApplication.pop();
    if (!precedent || !precedent.html) {
        afficherPortailPrincipal();
        return;
    }

    restaurationNavigationEnCours = true;
    document.body.className = precedent.bodyClassName || "";
    const app = document.getElementById("app");
    if (!app) {
        restaurationNavigationEnCours = false;
        afficherPortailPrincipal();
        return;
    }

    app.innerHTML = precedent.html;
    etatNavigationCourante = precedent;
    actualiserInterfaceBureau();
    synchroniserApparencePWACaserne();

    requestAnimationFrame(() => {
        window.scrollTo({
            left: precedent.scrollX || 0,
            top: precedent.scrollY || 0,
            behavior: "auto"
        });
        setTimeout(() => { restaurationNavigationEnCours = false; }, 0);
    });
}

function ouvrirProfilDepuisPageCourante() {
    const app = document.getElementById("app");

    etatPageAvantProfil = {
        html: app ? app.innerHTML : "",
        scrollX: window.scrollX || 0,
        scrollY: window.scrollY || 0,
        bodyClassName: document.body.className || ""
    };

    afficherProfilUtilisateur();
}

function retournerDepuisProfil() {
    etatPageAvantProfil = null;
    retourPagePrecedente();
}

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

    afficherPortailPrincipal();

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
                    acces_notifications,
                    acces_espace_caserne,
                    acces_sport,
                    acces_sport_admin,
                    acces_manoeuvre,
                    acces_manoeuvre_admin,
                    acces_casernement,
                    acces_casernement_admin,
                    acces_reunion,
                    acces_reunion_admin,
                    acces_amical_public,
                    acces_amical_membre,
                    acces_amical_admin,
                    acces_comite_centre,
                    acces_comite_centre_admin,
                    acces_administratif,
                    acces_administratif_admin,
                    acces_entretien_individuel,
                    acces_entretien_individuel_admin
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
    setTimeout(() => synchroniserAbonnementPushUtilisateurConnecte(), 0);

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
                onclick="retournerDepuisProfil()"
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
                    user_id:
                        utilisateurConnecte?.id || profilUtilisateurConnecte?.id || null,
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


async function synchroniserAbonnementPushUtilisateurConnecte() {
    try {
        if (!navigator.onLine || !notificationsWebPushDisponibles() || !utilisateurConnecte?.id) return;
        const abonnement = await obtenirAbonnementPushActuel();
        if (!abonnement) return;
        await enregistrerAbonnementPushSupabase(abonnement);
    } catch (erreur) {
        console.warn("Association notification/utilisateur impossible :", erreur);
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

        createdBy:
            String(
                i.createdBy ||
                i.created_by ||
                ""
            ),

        createdByPrenom:
            String(
                i.createdByPrenom ||
                i.created_by_prenom ||
                ""
            ),

        createdByNom:
            String(
                i.createdByNom ||
                i.created_by_nom ||
                ""
            ),

        createdAt:
            String(
                i.createdAt ||
                i.created_at ||
                ""
            ),

        synchronisationEnAttente:
            i.synchronisationEnAttente === true,

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
            created_at: String(
                intervention.createdAt ||
                ((intervention.date || dateAujourdhui()) + "T00:00:00.000Z")
            )
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
   PORTAIL PRINCIPAL
   ========================================================= */

function afficherPortailPrincipal() {

    initialiserStyleConnexion();
    initialiserStyleEspaceCaserne();

    document.body.classList.remove(
        "mode-connexion"
    );

    if (!profilUtilisateurConnecte) {
        afficherConnexion();
        return;
    }

    appliquerVisibiliteElementsConnectes(true);

    const role = obtenirRoleUtilisateur();

    document.getElementById("app").innerHTML = `
        <main class="page portail-cis-page navigation-fixe-page">
            <div class="utilisateur-entete">
                <button
                    class="bouton-profil-accueil"
                    type="button"
                    onclick="ouvrirProfilDepuisPageCourante()"
                >
                    <strong>${echapperHTML(obtenirNomUtilisateurAffiche())}</strong>
                    <span>${echapperHTML(role?.nom || "")}</span>
                </button>
            </div>

            <section class="portail-cis-espaces">
                <button
                    type="button"
                    class="portail-cis-carte portail-cis-caserne"
                    onclick="afficherEspaceCaserne()"
                >
                    <span class="portail-cis-titre">Espace Caserne</span>
                    <span class="portail-cis-fleche">›</span>
                </button>

                <button
                    type="button"
                    class="portail-cis-carte portail-cis-pharmacie"
                    onclick="afficherAccueil()"
                >
                    <span class="portail-cis-titre">Espace Pharmacie</span>
                    <span class="portail-cis-fleche">›</span>
                </button>
            </section>
        </main>
        ${navigationPrincipale("accueil", "accueil")}
    `;

    actualiserInterfaceBureau();
}


async function synchroniserCaserneAvantNavigation() {
    /*
     * Même logique que dans l'espace Pharmacie : à chaque changement
     * d'onglet, on synchronise d'abord les données locales puis les
     * chargeurs Caserne interrogent Supabase juste après.
     */
    if (!navigator.onLine) return;
    try {
        await synchroniserAvantNavigation();
        const supabase = obtenirClientSupabase();
        if (supabase) {
            await supabase.auth.getSession();
        }
    } catch (erreur) {
        console.warn("Synchronisation Caserne avant navigation :", erreur);
    }
}

async function afficherEspaceCaserne() {

    if (!utilisateurAPermission("acces_espace_caserne") && !utilisateurEstSPVAdmin()) {
        alert("Vous n'avez pas accès à l'Espace Caserne.");
        afficherPortailPrincipal();
        return;
    }

    initialiserStyleEspaceCaserne();
    await synchroniserCaserneAvantNavigation();
    await afficherActualitesCaserne(true);
}

function obtenirRubriquesCaserne() {
    return [
        ["sport", "Sport", "acces_sport", "acces_sport_admin"],
        ["manoeuvre", "Manœuvre", "acces_manoeuvre", "acces_manoeuvre_admin"],
        ["casernement", "Casernement", "acces_casernement", "acces_casernement_admin"],
        ["reunion", "Réunion", "acces_reunion", "acces_reunion_admin"],
        ["amical", "Amical", "acces_amical_public", "acces_amical_admin"],
        ["comite_centre", "Comité de centre", "acces_comite_centre", "acces_comite_centre_admin"],
        ["administratif", "Administratif", "acces_administratif", "acces_administratif_admin"],
        ["entretien_individuel", "Entretien individuel", "acces_entretien_individuel", "acces_entretien_individuel_admin"]
    ];
}

function utilisateurPeutVoirRubriqueCaserne(rubrique) {
    if (utilisateurEstSPVAdmin()) return true;
    if (rubrique[0] === "amical" && utilisateurAPermission("acces_amical_membre")) return true;
    return utilisateurAPermission(rubrique[2]) || utilisateurAPermission(rubrique[3]);
}

function navigationPrincipale(active, theme = "caserne") {
    const classeTheme = theme === "pharmacie"
        ? "nav-theme-pharmacie"
        : theme === "accueil"
            ? "nav-theme-accueil"
            : "nav-theme-caserne";

    const actionMenu = theme === "caserne"
        ? "ouvrirMenuCaserne()"
        : theme === "pharmacie"
            ? "afficherAccueil()"
            : "afficherPortailPrincipal()";

    return `
        <nav class="caserne-nav-bas ${classeTheme}">
            <button onclick="afficherPortailPrincipal()" class="${active === "accueil" ? "actif" : ""}"><span>⌂</span>Accueil</button>
            <button onclick="afficherEspaceCaserne()" class="${active === "caserne" ? "actif" : ""}"><span>▣</span>Caserne</button>
            <button onclick="afficherAccueil()" class="${active === "pharmacie" ? "actif" : ""}"><span>✚</span>Pharmacie</button>
            <button onclick="ouvrirProfilDepuisPageCourante()" class="${active === "profil" ? "actif" : ""}"><span>○</span>Profil</button>
            <button onclick="${actionMenu}" class="caserne-menu-bulle" aria-label="Menu"><span>☰</span></button>
        </nav>`;
}

function navigationCaserne(active) {
    return navigationPrincipale(active, "caserne");
}

function ouvrirMenuCaserne() {
    initialiserStyleEspaceCaserne();
    const rubriques = obtenirRubriquesCaserne().filter(utilisateurPeutVoirRubriqueCaserne);
    document.getElementById("app").innerHTML = `
        <main class="caserne-shell caserne-menu-page">
            <header class="caserne-top"><small>ESPACE CASERNE</small><h1>Menu</h1><p>Accès aux rubriques</p></header>
            <section class="caserne-menu-grille">
                ${rubriques.map(r => `<button onclick="afficherRubriqueCaserne('${r[0]}')"><strong>${echapperHTML(r[1])}</strong><span>Ouvrir →</span></button>`).join("") || '<p>Aucune rubrique autorisée.</p>'}
            </section>
        </main>${navigationCaserne("caserne")}`;
    actualiserInterfaceBureau();
}

function formaterDateHeureCaserne(valeur) {
    if (!valeur) return "Date à définir";
    const d = new Date(valeur);
    if (Number.isNaN(d.getTime())) return String(valeur);
    return d.toLocaleString("fr-FR", {day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"});
}


function formaterDateICSCalendrierCaserne(date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function echapperTexteICSCalendrierCaserne(texte) {
    return String(texte ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function nomFichierCalendrierCaserne(titre) {
    const base = String(titre || "evenement-cis-le-chesne")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
    return (base || "evenement-cis-le-chesne") + ".ics";
}

function ajouterEvenementCalendrierCaserne(titre, dateDebut, description = "", dureeMinutes = 60) {
    const debut = new Date(dateDebut);
    if (Number.isNaN(debut.getTime())) {
        alert("La date de cet événement n'est pas disponible.");
        return;
    }
    const duree = Math.max(1, Number(dureeMinutes) || 60);
    const fin = new Date(debut.getTime() + duree * 60000);
    const maintenant = formaterDateICSCalendrierCaserne(new Date());
    const uid = `${debut.getTime()}-${Math.random().toString(36).slice(2)}@cis-le-chesne`;
    const contenu = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CIS Le Chesne//Espace Caserne//FR",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${maintenant}`,
        `DTSTART:${formaterDateICSCalendrierCaserne(debut)}`,
        `DTEND:${formaterDateICSCalendrierCaserne(fin)}`,
        `SUMMARY:${echapperTexteICSCalendrierCaserne(titre || "Événement CIS Le Chesne")}`,
        `DESCRIPTION:${echapperTexteICSCalendrierCaserne(description || "CIS Le Chesne")}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([contenu], {type:"text/calendar;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nomFichierCalendrierCaserne(titre);
    lien.rel = "noopener";
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function boutonCalendrierCaserne(titre, date, description = "", dureeMinutes = 60, libelle = "Ajouter au calendrier") {
    if (!date || Number.isNaN(new Date(date).getTime())) return "";
    const code = `ajouterEvenementCalendrierCaserne(${JSON.stringify(titre || "Événement CIS Le Chesne")},${JSON.stringify(date)},${JSON.stringify(description || "")},${Number(dureeMinutes) || 60})`;
    return `<button type="button" class="caserne-bouton-calendrier" onclick="${echapperHTML(code)}">${echapperHTML(libelle)}</button>`;
}

async function chargerPublicationsCaserne(type) {
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) return [];
    let q = supabase.from("caserne_publications").select("id,type_publication,titre,description,sous_type,visibilite,date_evenement,date_preparation,demande_reponse,demande_reponse_preparation,notification_auto,notification_delai_minutes,created_at").order("date_evenement", {ascending:true, nullsFirst:false});
    if (type) q = q.eq("type_publication", type);
    const {data,error}=await q;
    if (error) { console.warn("Publications Caserne :", error); return []; }
    return Array.isArray(data) ? data : [];
}

function obtenirLibelleTypeCaserne(type) {
    return ({
        sport:"Sport",
        manoeuvre:"Manœuvre",
        casernement:"Casernement",
        reunion:"Réunion",
        amical:"Amical",
        comite_centre:"Comité de centre",
        administratif:"Administratif"
    })[type] || "Actualité";
}

async function chargerDetailsPublicationsCaserne(publications) {
    const liste = Array.isArray(publications) ? publications : [];
    if (!liste.length) return liste;
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) return liste;
    const ids = liste.map(p => p.id).filter(Boolean);
    if (!ids.length) return liste;

    const [{data: photos, error: erreurPhotos}, {data: reponses, error: erreurReponses}] = await Promise.all([
        supabase.from("caserne_publication_photos").select("id,publication_id,photo_url,ordre").in("publication_id", ids).order("ordre", {ascending:true}),
        supabase.from("caserne_reponses").select("id,publication_id,user_id,user_prenom,user_nom,contexte,reponse").in("publication_id", ids)
    ]);
    if (erreurPhotos) console.warn("Photos Caserne :", erreurPhotos);
    if (erreurReponses) console.warn("Réponses Caserne :", erreurReponses);

    return liste.map(p => ({
        ...p,
        photos: (photos || []).filter(x => x.publication_id === p.id),
        reponses: (reponses || []).filter(x => x.publication_id === p.id)
    }));
}

function ouvrirPhotoCaserne(url) {
    if (!url) return;
    const ancien = document.getElementById("caserne-photo-plein-ecran");
    if (ancien) ancien.remove();
    const overlay = document.createElement("div");
    overlay.id = "caserne-photo-plein-ecran";
    overlay.className = "caserne-photo-overlay";
    overlay.innerHTML = `<button type="button" class="caserne-photo-fermer" aria-label="Fermer">×</button><img src="${echapperHTML(url)}" alt="Photo" />`;
    overlay.querySelector(".caserne-photo-fermer").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
}

function obtenirConfigurationPublicationCaserne(type) {
    return ({
        sport:{titre:"Séance de sport", admin:"ADMINISTRATION SPORT", action:"Publier la séance", dossier:"sport", aide:"Créer une séance de sport"},
        manoeuvre:{titre:"Manœuvre", admin:"ADMINISTRATION MANŒUVRE", action:"Publier la manœuvre", dossier:"manoeuvre", aide:"Créer une manœuvre"},
        casernement:{titre:"Casernement", admin:"ADMINISTRATION CASERNEMENT", action:"Publier", dossier:"casernement", aide:"Créer une publication de casernement"},
        reunion:{titre:"Réunion", admin:"ADMINISTRATION RÉUNION", action:"Publier la réunion", dossier:"reunion", aide:"Créer une réunion"},
        amical:{titre:"Amical", admin:"ADMINISTRATION AMICAL", action:"Publier", dossier:"amical", aide:"Créer une publication de l'Amical"},
        comite_centre:{titre:"Comité de centre", admin:"ADMINISTRATION COMITÉ DE CENTRE", action:"Publier", dossier:"comite-centre", aide:"Créer une publication du Comité de centre"},
        administratif:{titre:"Administratif", admin:"ADMINISTRATION", action:"Ouvrir", dossier:"administratif", aide:"Gestion administrative"}
    })[type] || {titre:"Publication", admin:"ADMINISTRATION", action:"Publier", dossier:"caserne", aide:"Créer une publication"};
}

function rafraichirVuePublicationCaserne(retour) {
    if (retour === "actualites") return afficherActualitesCaserne();
    return afficherRubriqueCaserne(retour || "sport");
}

function blocReponsePublicationCaserne(p, contexte, libelle, retour) {
    const reponses = Array.isArray(p.reponses) ? p.reponses : [];
    const presents = reponses.filter(r => r.contexte === contexte && r.reponse === "present");
    const maReponse = reponses.find(r => r.contexte === contexte && String(r.user_id) === String(utilisateurConnecte?.id || ""));
    const present = maReponse?.reponse === "present";
    const absent = maReponse?.reponse === "absent";
    return `<div class="caserne-zone-reponse">
        <strong class="caserne-reponse-contexte">${echapperHTML(libelle)}</strong>
        <div class="caserne-boutons-reponse">
            <button type="button" class="${present ? "selectionne present" : ""}" onclick="repondrePublicationCaserne('${p.id}','present','${contexte}','${retour}')">Présent</button>
            <button type="button" class="${absent ? "selectionne absent" : ""}" onclick="repondrePublicationCaserne('${p.id}','absent','${contexte}','${retour}')">Absent</button>
        </div>
        <div class="caserne-liste-presents"><strong>Présents${presents.length ? ` · ${presents.length}` : ""}</strong>${presents.length ? `<div>${presents.map(r => `<span>${echapperHTML([r.user_prenom,r.user_nom].filter(Boolean).join(" ") || "Utilisateur")}</span>`).join("")}</div>` : `<small>Aucune réponse « Présent » pour le moment.</small>`}</div>
    </div>`;
}

function blocReponsePublicationPasseeCaserne(p, contexte, libelle) {
    const reponses = Array.isArray(p.reponses) ? p.reponses : [];
    const presents = reponses.filter(r => r.contexte === contexte && r.reponse === "present");
    return `<div class="caserne-zone-reponse caserne-zone-reponse-passee">
        <strong class="caserne-reponse-contexte">${echapperHTML(libelle)}</strong>
        <div class="caserne-liste-presents"><strong>Présents${presents.length ? ` · ${presents.length}` : ""}</strong>${presents.length ? `<div>${presents.map(r => `<span>${echapperHTML([r.user_prenom,r.user_nom].filter(Boolean).join(" ") || "Utilisateur")}</span>`).join("")}</div>` : `<small>Aucune réponse « Présent » enregistrée.</small>`}</div>
    </div>`;
}

function cartePublicationCaserne(p, options = {}) {
    const titre = p.titre || obtenirConfigurationPublicationCaserne(p.type_publication).titre;
    const photos = Array.isArray(p.photos) ? p.photos : [];
    const retour = options.retour || "actualites";
    const estPasse = options.passe === true;
    const reponses = Array.isArray(p.reponses) ? p.reponses : [];
    const maReponse = reponses.find(r => r.contexte === "evenement" && String(r.user_id) === String(utilisateurConnecte?.id || ""));
    const classeReponse = !estPasse && maReponse?.reponse === "present" ? " caserne-actu-present" : "";
    const classePasse = estPasse ? " caserne-actu-passee" : "";
    const sousType = p.type_publication === "amical" && p.sous_type ? `<span class="caserne-badge-soustype">${echapperHTML(({evenement:"Événement",reunion:"Réunion",autre:"Autre"})[p.sous_type] || p.sous_type)}</span>` : "";
    const visibilite = p.type_publication === "amical" && p.visibilite === "membre" ? `<span class="caserne-badge-visibilite">Membres de l'Amical</span>` : "";
    const rappelAuto = !estPasse && p.notification_auto && p.date_evenement ? `<span class="caserne-badge-visibilite">Rappel ${echapperHTML(libelleDelaiNotificationCaserne(p.notification_delai_minutes))} avant</span>` : "";

    return `<article class="caserne-actu-card${classeReponse}${classePasse}">
        <div class="caserne-actu-meta"><span>${echapperHTML(obtenirLibelleTypeCaserne(p.type_publication))}</span>${p.date_evenement ? `<time>${echapperHTML(formaterDateHeureCaserne(p.date_evenement))}</time>` : ""}</div>
        <div class="caserne-badges-publication">${sousType}${visibilite}${rappelAuto}</div>
        <h2>${echapperHTML(titre)}</h2>
        ${p.description ? `<p>${echapperHTML(p.description).replaceAll("\n","<br>")}</p>` : ""}
        ${photos.length ? `<div class="caserne-photos">${photos.map(ph => `<button type="button" onclick='ouvrirPhotoCaserne(${JSON.stringify(ph.photo_url)})'><img src="${echapperHTML(ph.photo_url || "")}" alt="Photo de la publication"></button>`).join("")}</div>` : ""}
        ${p.demande_reponse ? (estPasse ? blocReponsePublicationPasseeCaserne(p,"evenement","Réponses pour l’événement") : blocReponsePublicationCaserne(p,"evenement","Réponse pour l'événement",retour)) : ""}
        ${p.date_preparation ? `<div class="caserne-preparation-bloc"><strong>Préparation</strong><span>${echapperHTML(formaterDateHeureCaserne(p.date_preparation))}</span>${p.demande_reponse_preparation ? (estPasse ? blocReponsePublicationPasseeCaserne(p,"preparation","Réponses pour la préparation") : blocReponsePublicationCaserne(p,"preparation","Réponse pour la préparation",retour)) : ""}</div>` : ""}
        ${!estPasse ? `<div class="caserne-calendrier-actions">
            ${boutonCalendrierCaserne(titre, p.date_evenement, p.description || "", 60, "Ajouter l'événement au calendrier")}
            ${p.date_preparation ? boutonCalendrierCaserne(`${titre} · Préparation`, p.date_preparation, p.description || "", 60, "Ajouter la préparation au calendrier") : ""}
        </div>` : ""}
        ${options.admin ? `<div class="caserne-actions-admin"><button type="button" onclick="modifierPublicationCaserne('${p.id}','${p.type_publication}')">Modifier</button><button type="button" onclick="supprimerPublicationCaserne('${p.id}','${p.type_publication}')">Supprimer</button></div>` : ""}
    </article>`;
}

async function repondrePublicationCaserne(publicationId, reponse, contexte = "evenement", retour = "actualites") {
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire pour enregistrer la réponse."); return; }
    if (!utilisateurConnecte?.id) { alert("Session utilisateur introuvable."); return; }
    const payload = {
        publication_id: publicationId,
        user_id: utilisateurConnecte.id,
        user_prenom: profilUtilisateurConnecte?.prenom || null,
        user_nom: profilUtilisateurConnecte?.nom || null,
        contexte: contexte === "preparation" ? "preparation" : "evenement",
        reponse
    };
    const {error} = await supabase.from("caserne_reponses").upsert(payload, {onConflict:"publication_id,user_id,contexte"});
    if (error) { console.error(error); alert("Impossible d'enregistrer la réponse : " + (error.message || "erreur inconnue")); return; }
    await rafraichirVuePublicationCaserne(retour);
}

function formulaireAdminPublicationCaserne(type) {
    const cfg = obtenirConfigurationPublicationCaserne(type);
    const estAmical = type === "amical";
    return `<section class="caserne-admin-bloc caserne-admin-publication" data-type="${echapperHTML(type)}">
        <div class="caserne-admin-titre"><div><small>${echapperHTML(cfg.admin)}</small><h2>${echapperHTML(cfg.aide)}</h2></div></div>
        <div class="caserne-formulaire-sport caserne-formulaire-publication">
            <label>Titre<input id="caserne-publication-titre" type="text" placeholder="Titre de la publication"></label>
            <label>Description<textarea id="caserne-publication-description" rows="4" placeholder="Informations utiles"></textarea></label>
            ${estAmical ? `<label>Type<select id="caserne-publication-sous-type"><option value="evenement">Événement</option><option value="reunion">Réunion</option><option value="autre">Autre</option></select></label><label>Visibilité<select id="caserne-publication-visibilite"><option value="public">Tout le personnel autorisé</option><option value="membre">Membres de l'Amical</option></select></label>` : ""}
            <label>Date et heure${type === "administratif" || type === "casernement" ? " (facultatif)" : ""}<input id="caserne-publication-date" type="datetime-local"></label>
            <label class="caserne-switch-ligne"><input id="caserne-publication-reponse" type="checkbox"><span>Demander une réponse Présent / Absent</span></label>
            <label class="caserne-switch-ligne"><input id="caserne-publication-notification-auto" type="checkbox" onchange="gererOptionNotificationAutoCaserne(this)"><span>Envoyer une notification automatique aux personnes présentes</span></label>
            <label id="caserne-publication-notification-delai-ligne" style="display:none">Délai avant l'événement<select id="caserne-publication-notification-delai"><option value="15">15 minutes avant</option><option value="30">30 minutes avant</option><option value="60" selected>1 heure avant</option><option value="120">2 heures avant</option><option value="360">6 heures avant</option><option value="720">12 heures avant</option><option value="1440">1 jour avant</option><option value="2880">2 jours avant</option><option value="10080">7 jours avant</option></select><small>Le rappel est envoyé uniquement aux utilisateurs ayant répondu « Présent ».</small></label>
            ${estAmical ? `<label>Date et heure de préparation (facultatif)<input id="caserne-publication-preparation" type="datetime-local"></label><label class="caserne-switch-ligne"><input id="caserne-publication-reponse-preparation" type="checkbox"><span>Demander une réponse Présent / Absent pour la préparation</span></label>` : ""}
            <label>Photos<input id="caserne-publication-photos" type="file" accept="image/*" multiple></label>
            <small class="caserne-aide-photo">Les photos sont facultatives. Tu peux en sélectionner plusieurs.</small>
            <button type="button" class="caserne-bouton-admin-principal" onclick="creerPublicationModuleCaserne('${type}')">${echapperHTML(cfg.action)}</button>
        </div>
    </section>`;
}

function gererOptionNotificationAutoCaserne(checkbox) {
    const ligne = document.getElementById("caserne-publication-notification-delai-ligne");
    const reponse = document.getElementById("caserne-publication-reponse");
    if (ligne) ligne.style.display = checkbox?.checked ? "flex" : "none";
    if (checkbox?.checked && reponse) reponse.checked = true;
}

function libelleDelaiNotificationCaserne(minutes) {
    const valeur = Math.max(1, Number(minutes) || 60);
    if (valeur % 1440 === 0) { const j = valeur / 1440; return `${j} jour${j > 1 ? "s" : ""}`; }
    if (valeur % 60 === 0) { const h = valeur / 60; return `${h} heure${h > 1 ? "s" : ""}`; }
    return `${valeur} minutes`;
}

function formulaireAdminSportCaserne() {
    return formulaireAdminPublicationCaserne("sport");
}

async function televerserPhotosCaserne(publicationId, fichiers, dossier = "caserne") {
    const supabase = obtenirClientSupabase();
    if (!supabase || !Array.isArray(fichiers) || !fichiers.length) return [];
    const urls = [];
    for (let i=0; i<fichiers.length; i++) {
        const fichier = fichiers[i];
        const extension = String(fichier.name || "photo.jpg").split(".").pop().replace(/[^a-zA-Z0-9]/g, "") || "jpg";
        const nom = `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${extension}`;
        const chemin = `${dossier}/${publicationId}/${nom}`;
        const {error: uploadError} = await supabase.storage.from("caserne").upload(chemin, fichier, {cacheControl:"3600", upsert:false});
        if (uploadError) throw uploadError;
        const {data} = supabase.storage.from("caserne").getPublicUrl(chemin);
        if (data?.publicUrl) urls.push({photo_url:data.publicUrl, ordre:i});
    }
    return urls;
}

async function creerPublicationModuleCaserne(type) {
    const rubrique = obtenirRubriquesCaserne().find(r => r[0] === type);
    if (!rubrique || (!utilisateurEstSPVAdmin() && !utilisateurAPermission(rubrique[3]))) { alert("Accès non autorisé."); return; }
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire pour publier."); return; }
    const cfg = obtenirConfigurationPublicationCaserne(type);
    const titre = document.getElementById("caserne-publication-titre")?.value?.trim() || null;
    const description = document.getElementById("caserne-publication-description")?.value?.trim() || null;
    const dateValeur = document.getElementById("caserne-publication-date")?.value || "";
    const prepValeur = type === "amical" ? (document.getElementById("caserne-publication-preparation")?.value || "") : "";
    const notificationAuto = !!document.getElementById("caserne-publication-notification-auto")?.checked;
    const notificationDelaiMinutes = Math.max(1, Number(document.getElementById("caserne-publication-notification-delai")?.value || 60));
    const demandeReponse = notificationAuto || !!document.getElementById("caserne-publication-reponse")?.checked;
    const demandeReponsePreparation = type === "amical" && !!prepValeur && !!document.getElementById("caserne-publication-reponse-preparation")?.checked;
    const sousType = type === "amical" ? (document.getElementById("caserne-publication-sous-type")?.value || "evenement") : null;
    const visibilite = type === "amical" ? (document.getElementById("caserne-publication-visibilite")?.value || "public") : "public";
    const fichiers = Array.from(document.getElementById("caserne-publication-photos")?.files || []);
    const dateEvenement = dateValeur ? new Date(dateValeur).toISOString() : null;
    const datePreparation = prepValeur ? new Date(prepValeur).toISOString() : null;
    if (notificationAuto && !dateEvenement) {
        alert("Renseigne une date et une heure pour utiliser la notification automatique.");
        return;
    }
    const bouton = document.querySelector(".caserne-admin-publication .caserne-bouton-admin-principal");
    if (bouton) { bouton.disabled = true; bouton.textContent = "Publication…"; }
    let publicationId = null;
    try {
        const {data, error} = await supabase.rpc("creer_publication_caserne", {
            p_type_publication:type,
            p_titre:titre,
            p_description:description,
            p_sous_type:sousType,
            p_visibilite:visibilite,
            p_date_evenement:dateEvenement,
            p_date_preparation:datePreparation,
            p_demande_reponse:demandeReponse,
            p_demande_reponse_preparation:demandeReponsePreparation
        });
        if (error) throw error;
        publicationId = data;
        const {error: rappelError} = await supabase.rpc("configurer_rappel_publication_caserne", {
            p_publication_id: publicationId,
            p_notification_auto: notificationAuto,
            p_notification_delai_minutes: notificationDelaiMinutes
        });
        if (rappelError) throw rappelError;
        if (fichiers.length) {
            const photos = await televerserPhotosCaserne(publicationId, fichiers, cfg.dossier);
            if (photos.length) {
                const {error: photoError} = await supabase.from("caserne_publication_photos").insert(photos.map(ph => ({...ph, publication_id:publicationId})));
                if (photoError) throw photoError;
            }
        }
        alert("Publication enregistrée.");
        await afficherRubriqueCaserne(type);
    } catch (erreur) {
        console.error(erreur);
        if (publicationId) { try { await supabase.rpc("supprimer_publication_caserne", {p_publication_id:publicationId}); } catch (_) {} }
        alert("Impossible de publier : " + (erreur?.message || "erreur inconnue"));
        if (bouton) { bouton.disabled = false; bouton.textContent = cfg.action; }
    }
}

async function creerSeanceSportCaserne() {
    return creerPublicationModuleCaserne("sport");
}

function valeurDateLocalePourPromptCaserne(valeur) {
    if (!valeur) return "";
    const d = new Date(valeur);
    if (Number.isNaN(d.getTime())) return "";
    const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,16);
}

async function modifierPublicationCaserne(publicationId, type) {
    const p = window.__publicationsCaserneParId?.[publicationId];
    if (!p) { alert("Publication introuvable. Recharge la rubrique puis réessaie."); return; }
    const titre = prompt("Titre", p.titre || "");
    if (titre === null) return;
    const description = prompt("Description", p.description || "");
    if (description === null) return;
    const dateTexte = prompt("Date et heure de l'événement (AAAA-MM-JJTHH:MM). Laisse vide si aucune date.", valeurDateLocalePourPromptCaserne(p.date_evenement));
    if (dateTexte === null) return;
    let sousType = p.sous_type || null, visibilite = p.visibilite || "public", prepTexte = valeurDateLocalePourPromptCaserne(p.date_preparation);
    if (type === "amical") {
        const st = prompt("Type : evenement, reunion ou autre", sousType || "evenement"); if (st === null) return; sousType = ["evenement","reunion","autre"].includes(st) ? st : "autre";
        const vis = prompt("Visibilité : public ou membre", visibilite); if (vis === null) return; visibilite = vis === "membre" ? "membre" : "public";
        const prep = prompt("Date et heure de préparation (AAAA-MM-JJTHH:MM), ou vide", prepTexte); if (prep === null) return; prepTexte = prep;
    }
    const dateEvenement = dateTexte ? new Date(dateTexte).toISOString() : null;
    const datePreparation = prepTexte ? new Date(prepTexte).toISOString() : null;
    let notificationAuto = false;
    let notificationDelaiMinutes = Math.max(1, Number(p.notification_delai_minutes) || 60);
    if (dateEvenement) {
        notificationAuto = confirm("Activer une notification automatique pour les personnes ayant répondu Présent ?");
        if (notificationAuto) {
            const saisieDelai = prompt("Combien de minutes avant l'événement ? Exemples : 60 = 1 heure, 1440 = 1 jour", String(notificationDelaiMinutes));
            if (saisieDelai === null) return;
            notificationDelaiMinutes = Math.max(1, Number(saisieDelai) || 60);
        }
    }
    const demandeReponse = notificationAuto || confirm("Demander une réponse Présent / Absent pour l'événement ?");
    const demandeReponsePreparation = type === "amical" && !!datePreparation ? confirm("Demander une réponse Présent / Absent pour la préparation ?") : false;
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire."); return; }
    const {error} = await supabase.rpc("modifier_publication_caserne", {
        p_publication_id:publicationId,
        p_titre:titre.trim() || null,
        p_description:description.trim() || null,
        p_sous_type:sousType,
        p_visibilite:visibilite,
        p_date_evenement:dateEvenement,
        p_date_preparation:datePreparation,
        p_demande_reponse:demandeReponse,
        p_demande_reponse_preparation:demandeReponsePreparation
    });
    if (error) { alert("Modification impossible : " + (error.message || "erreur inconnue")); return; }
    const {error: rappelError} = await supabase.rpc("configurer_rappel_publication_caserne", {
        p_publication_id: publicationId,
        p_notification_auto: notificationAuto,
        p_notification_delai_minutes: notificationDelaiMinutes
    });
    if (rappelError) { alert("Publication modifiée, mais le rappel automatique n'a pas pu être enregistré : " + (rappelError.message || "erreur inconnue")); return; }
    alert("Publication modifiée.");
    await afficherRubriqueCaserne(type);
}

async function supprimerPublicationCaserne(publicationId, typeRetour) {
    if (!confirm("Supprimer cette publication ?")) return;
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire."); return; }
    const {error} = await supabase.rpc("supprimer_publication_caserne", {p_publication_id:publicationId});
    if (error) { alert("Suppression impossible : " + (error.message || "erreur inconnue")); return; }
    await afficherRubriqueCaserne(typeRetour || "sport");
}



/* =========================================================
   ENTRETIENS INDIVIDUELS
   Planification / réservation / réponses
   ========================================================= */

let vueAdminEntretienCaserne = "planification";
let groupesDatesEntretienCaserne = [{ id: Date.now(), date: "", heures: [""] }];

function echapperAttributCaserne(valeur) {
    return echapperHTML(String(valeur ?? "")).replaceAll('"', '&quot;');
}

function normaliserHeureEntretienCaserne(heure) {
    const valeur = String(heure || "").trim();
    return /^\d{2}:\d{2}$/.test(valeur) ? valeur : "";
}

function renduGroupesDatesEntretienCaserne() {
    return groupesDatesEntretienCaserne.map((groupe, index) => `
        <div class="caserne-entretien-date-groupe" data-groupe-id="${groupe.id}">
            <div class="caserne-entretien-date-entete">
                <label>Date
                    <input type="date" value="${echapperAttributCaserne(groupe.date)}" onchange="modifierDateEntretienCaserne(${groupe.id},this.value)">
                </label>
                ${groupesDatesEntretienCaserne.length > 1 ? `<button type="button" class="caserne-entretien-retirer" onclick="retirerDateEntretienCaserne(${groupe.id})">Retirer la date</button>` : ""}
            </div>
            <div class="caserne-entretien-heures">
                ${groupe.heures.map((heure, i) => `
                    <div class="caserne-entretien-heure-ligne">
                        <input type="time" value="${echapperAttributCaserne(heure)}" onchange="modifierHeureEntretienCaserne(${groupe.id},${i},this.value)">
                        ${groupe.heures.length > 1 ? `<button type="button" onclick="retirerHeureEntretienCaserne(${groupe.id},${i})" aria-label="Retirer ce créneau">×</button>` : ""}
                    </div>`).join("")}
            </div>
            <button type="button" class="caserne-entretien-ajouter-heure" onclick="ajouterHeureEntretienCaserne(${groupe.id})">+ Ajouter un horaire</button>
        </div>
    `).join("");
}

function rafraichirGroupesDatesEntretienCaserne() {
    const zone = document.getElementById("caserne-entretien-dates-zone");
    if (zone) zone.innerHTML = renduGroupesDatesEntretienCaserne();
}

function ajouterDateEntretienCaserne() {
    groupesDatesEntretienCaserne.push({ id: Date.now() + Math.floor(Math.random()*1000), date: "", heures: [""] });
    rafraichirGroupesDatesEntretienCaserne();
}

function retirerDateEntretienCaserne(id) {
    groupesDatesEntretienCaserne = groupesDatesEntretienCaserne.filter(g => g.id !== id);
    if (!groupesDatesEntretienCaserne.length) groupesDatesEntretienCaserne = [{ id: Date.now(), date: "", heures: [""] }];
    rafraichirGroupesDatesEntretienCaserne();
}

function modifierDateEntretienCaserne(id, valeur) {
    const groupe = groupesDatesEntretienCaserne.find(g => g.id === id);
    if (groupe) groupe.date = String(valeur || "");
}

function ajouterHeureEntretienCaserne(id) {
    const groupe = groupesDatesEntretienCaserne.find(g => g.id === id);
    if (groupe) groupe.heures.push("");
    rafraichirGroupesDatesEntretienCaserne();
}

function retirerHeureEntretienCaserne(id, index) {
    const groupe = groupesDatesEntretienCaserne.find(g => g.id === id);
    if (!groupe) return;
    groupe.heures.splice(index, 1);
    if (!groupe.heures.length) groupe.heures.push("");
    rafraichirGroupesDatesEntretienCaserne();
}

function modifierHeureEntretienCaserne(id, index, valeur) {
    const groupe = groupesDatesEntretienCaserne.find(g => g.id === id);
    if (groupe && groupe.heures[index] !== undefined) groupe.heures[index] = String(valeur || "");
}

function formulaireAdminEntretienCaserne() {
    return `<section class="caserne-admin-bloc caserne-admin-entretien">
        <div class="caserne-admin-titre"><div><small>ADMINISTRATION ENTRETIENS</small><h2>Planification</h2></div></div>
        <div class="caserne-entretien-onglets-admin">
            <button type="button" class="${vueAdminEntretienCaserne === 'planification' ? 'actif' : ''}" onclick="changerVueAdminEntretienCaserne('planification')">Planification</button>
            <button type="button" class="${vueAdminEntretienCaserne === 'reponses' ? 'actif' : ''}" onclick="changerVueAdminEntretienCaserne('reponses')">Réponses</button>
        </div>
        ${vueAdminEntretienCaserne === 'planification' ? `
            <div class="caserne-formulaire-sport caserne-formulaire-entretien">
                <label>Titre<input id="caserne-entretien-titre" type="text" placeholder="Ex. Entretiens annuels"></label>
                <label>Description<textarea id="caserne-entretien-description" rows="4" placeholder="Informations utiles"></textarea></label>
                <label>Durée d'un entretien (minutes)<input id="caserne-entretien-duree" type="number" min="1" inputmode="numeric" placeholder="Ex. 30"></label>
                <label class="caserne-switch-ligne"><input id="caserne-entretien-unique" type="checkbox" checked><span>Une seule personne peut choisir un même créneau</span></label>
                <div class="caserne-entretien-dates-titre"><strong>Dates et créneaux</strong><small>Ajoute autant de dates et d'horaires que nécessaire.</small></div>
                <div id="caserne-entretien-dates-zone">${renduGroupesDatesEntretienCaserne()}</div>
                <button type="button" class="caserne-entretien-ajouter-date" onclick="ajouterDateEntretienCaserne()">+ Ajouter une date</button>
                <button type="button" class="caserne-bouton-admin-principal" onclick="creerPlanningEntretienCaserne()">Publier le planning</button>
            </div>` : `<div id="caserne-entretien-reponses-admin" class="caserne-entretien-chargement">Chargement des réponses…</div>`}
    </section>`;
}

function changerVueAdminEntretienCaserne(vue) {
    vueAdminEntretienCaserne = vue === "reponses" ? "reponses" : "planification";
    afficherRubriqueCaserne("entretien_individuel");
}

function construireCreneauxEntretienCaserne() {
    const dates = [];
    for (const groupe of groupesDatesEntretienCaserne) {
        if (!groupe.date) continue;
        for (const heureBrute of groupe.heures) {
            const heure = normaliserHeureEntretienCaserne(heureBrute);
            if (!heure) continue;
            const d = new Date(`${groupe.date}T${heure}:00`);
            if (!Number.isNaN(d.getTime())) dates.push(d.toISOString());
        }
    }
    return [...new Set(dates)].sort();
}

async function creerPlanningEntretienCaserne() {
    if (!utilisateurEstSPVAdmin() && !utilisateurAPermission("acces_entretien_individuel_admin")) { alert("Accès non autorisé."); return; }
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire pour publier le planning."); return; }
    const titre = document.getElementById("caserne-entretien-titre")?.value?.trim() || null;
    const description = document.getElementById("caserne-entretien-description")?.value?.trim() || null;
    const dureeBrute = document.getElementById("caserne-entretien-duree")?.value || "";
    const duree = dureeBrute ? Number.parseInt(dureeBrute, 10) : null;
    const unique = !!document.getElementById("caserne-entretien-unique")?.checked;
    const creneaux = construireCreneauxEntretienCaserne();
    const bouton = document.querySelector(".caserne-admin-entretien .caserne-bouton-admin-principal");
    if (bouton) { bouton.disabled = true; bouton.textContent = "Publication…"; }
    try {
        const {error} = await supabase.rpc("creer_planning_entretien_caserne", {
            p_titre: titre,
            p_description: description,
            p_duree_minutes: Number.isFinite(duree) && duree > 0 ? duree : null,
            p_une_personne_par_creneau: unique,
            p_creneaux: creneaux
        });
        if (error) throw error;
        groupesDatesEntretienCaserne = [{ id: Date.now(), date: "", heures: [""] }];
        alert("Planning d'entretien publié.");
        await afficherRubriqueCaserne("entretien_individuel");
    } catch (erreur) {
        console.error(erreur);
        alert("Impossible de publier le planning : " + (erreur?.message || "erreur inconnue"));
        if (bouton) { bouton.disabled = false; bouton.textContent = "Publier le planning"; }
    }
}

async function chargerEntretiensCaserne() {
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) return [];
    const {data: entretiens, error} = await supabase.from("caserne_entretiens")
        .select("id,titre,description,duree_minutes,une_personne_par_creneau,created_at")
        .order("created_at", {ascending:false});
    if (error) { console.warn("Entretiens Caserne :", error); return []; }
    const liste = Array.isArray(entretiens) ? entretiens : [];
    if (!liste.length) return [];
    const ids = liste.map(e => e.id);
    const {data: etats, error: erreurEtats} = await supabase.rpc("lister_creneaux_entretien_caserne", {p_entretien_ids: ids});
    if (erreurEtats) console.warn("Créneaux entretien :", erreurEtats);
    const lignes = Array.isArray(etats) ? etats : [];
    return liste.map(e => ({...e, creneaux:lignes.filter(c => String(c.entretien_id) === String(e.id))}));
}

function grouperCreneauxParDateCaserne(creneaux) {
    const groupes = new Map();
    (creneaux || []).forEach(c => {
        if (!c.date_heure) return;
        const d = new Date(c.date_heure);
        if (Number.isNaN(d.getTime())) return;
        const cle = d.toISOString().slice(0,10);
        if (!groupes.has(cle)) groupes.set(cle, []);
        groupes.get(cle).push(c);
    });
    return [...groupes.entries()].sort((a,b) => a[0].localeCompare(b[0]));
}

function carteEntretienCaserne(entretien, estAdmin) {
    const groupes = grouperCreneauxParDateCaserne(entretien.creneaux || []);
    const maReservation = (entretien.creneaux || []).find(c => c.ma_reservation === true);
    return `<article class="caserne-entretien-card${maReservation ? ' caserne-entretien-reserve' : ''}">
        <div class="caserne-entretien-card-entete">
            <div><small>ENTRETIEN INDIVIDUEL</small><h2>${echapperHTML(entretien.titre || "Entretien individuel")}</h2></div>
            ${entretien.duree_minutes ? `<span>${Number(entretien.duree_minutes)} min</span>` : ""}
        </div>
        ${entretien.description ? `<p>${echapperHTML(entretien.description).replaceAll("\n","<br>")}</p>` : ""}
        ${maReservation ? `<div class="caserne-entretien-mon-rdv"><strong>Mon rendez-vous</strong><span>${echapperHTML(formaterDateHeureCaserne(maReservation.date_heure))}</span>${boutonCalendrierCaserne(entretien.titre || "Entretien individuel", maReservation.date_heure, entretien.description || "", entretien.duree_minutes || 60, "Ajouter mon rendez-vous au calendrier")}<button type="button" class="caserne-entretien-annuler" onclick="annulerReservationEntretienCaserne('${maReservation.creneau_id}')">Annuler mon créneau</button></div>` : ""}
        <div class="caserne-entretien-creneaux">
            ${groupes.length ? groupes.map(([date, lignes]) => {
                const d = new Date(date + "T12:00:00");
                const libelle = d.toLocaleDateString("fr-FR", {weekday:"long", day:"2-digit", month:"long", year:"numeric"});
                return `<div class="caserne-entretien-jour"><strong>${echapperHTML(libelle)}</strong><div>${lignes.map(c => {
                    const heure = new Date(c.date_heure).toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"});
                    const reserveParMoi = c.ma_reservation === true;
                    const complet = c.est_complet === true && !reserveParMoi;
                    return `<button type="button" ${complet ? 'disabled' : ''} class="${reserveParMoi ? 'selectionne' : ''} ${complet ? 'complet' : ''}" onclick="reserverCreneauEntretienCaserne('${c.creneau_id}')"><span>${echapperHTML(heure)}</span><small>${reserveParMoi ? 'Mon créneau' : (complet ? 'Indisponible' : 'Choisir')}</small></button>`;
                }).join("")}</div></div>`;
            }).join("") : `<div class="caserne-entretien-sans-creneau">Aucun créneau n'a encore été ajouté.</div>`}
        </div>
        ${estAdmin ? `<div class="caserne-actions-admin"><button type="button" onclick="supprimerPlanningEntretienCaserne('${entretien.id}')">Supprimer le planning</button></div>` : ""}
    </article>`;
}

async function reserverCreneauEntretienCaserne(creneauId, retourActualites = false) {
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire pour choisir un créneau."); return; }
    try {
        const {error} = await supabase.rpc("reserver_creneau_entretien_caserne", {p_creneau_id:creneauId});
        if (error) throw error;
        alert("Créneau réservé.");
        if (retourActualites) await afficherActualitesCaserne();
        else await afficherRubriqueCaserne("entretien_individuel");
    } catch (erreur) {
        console.error(erreur);
        alert("Impossible de réserver ce créneau : " + (erreur?.message || "erreur inconnue"));
        if (retourActualites) await afficherActualitesCaserne();
        else await afficherRubriqueCaserne("entretien_individuel");
    }
}

async function annulerReservationEntretienCaserne(creneauId, retourActualites = false) {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire."); return; }
    const {error} = await supabase.rpc("annuler_reservation_entretien_caserne", {p_creneau_id:creneauId});
    if (error) { alert("Annulation impossible : " + (error.message || "erreur inconnue")); return; }
    if (retourActualites) await afficherActualitesCaserne();
    else await afficherRubriqueCaserne("entretien_individuel");
}

async function supprimerPlanningEntretienCaserne(entretienId) {
    if (!confirm("Supprimer ce planning et toutes ses réservations ?")) return;
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) { alert("Une connexion Internet est nécessaire."); return; }
    const {error} = await supabase.rpc("supprimer_planning_entretien_caserne", {p_entretien_id:entretienId});
    if (error) { alert("Suppression impossible : " + (error.message || "erreur inconnue")); return; }
    await afficherRubriqueCaserne("entretien_individuel");
}

async function chargerReponsesEntretiensAdminCaserne() {
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) return [];
    const {data,error} = await supabase.rpc("lister_reponses_entretiens_admin_caserne");
    if (error) { console.warn(error); return []; }
    return Array.isArray(data) ? data : [];
}

async function remplirReponsesEntretiensAdminCaserne() {
    const zone = document.getElementById("caserne-entretien-reponses-admin");
    if (!zone) return;
    const reponses = await chargerReponsesEntretiensAdminCaserne();
    if (!document.getElementById("caserne-entretien-reponses-admin")) return;
    zone.innerHTML = reponses.length ? `<div class="caserne-entretien-reponses-liste">${reponses.map(r => `
        <article><time>${echapperHTML(formaterDateHeureCaserne(r.date_heure))}</time><strong>${echapperHTML([r.user_prenom,r.user_nom].filter(Boolean).join(" ") || "Utilisateur")}</strong><span>${echapperHTML(r.titre || "Entretien individuel")}</span></article>
    `).join("")}</div>` : `<div class="caserne-entretien-sans-creneau">Aucune réponse enregistrée pour le moment.</div>`;
}

async function chargerMesRendezVousEntretienCaserne() {
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) return [];
    if (!utilisateurAPermission("acces_entretien_individuel") && !utilisateurAPermission("acces_entretien_individuel_admin") && !utilisateurEstSPVAdmin()) return [];
    const {data,error} = await supabase.rpc("mes_rendez_vous_entretien_caserne");
    if (error) { console.warn("Mes rendez-vous entretien :", error); return []; }
    return Array.isArray(data) ? data : [];
}

function carteRendezVousEntretienActualitesCaserne(rdv) {
    return `<article class="caserne-actu-card caserne-actu-rendezvous">
        <div class="caserne-actu-meta"><span>Entretien individuel</span><time>${echapperHTML(formaterDateHeureCaserne(rdv.date_heure))}</time></div>
        <h2>${echapperHTML(rdv.titre || "Entretien individuel")}</h2>
        ${rdv.description ? `<p>${echapperHTML(rdv.description).replaceAll("\n","<br>")}</p>` : ""}
        <div class="caserne-rdv-badge">Rendez-vous prévu avec vous</div>
        <div class="caserne-calendrier-actions">${boutonCalendrierCaserne(rdv.titre || "Entretien individuel", rdv.date_heure, rdv.description || "", rdv.duree_minutes || 60, "Ajouter mon rendez-vous au calendrier")}</div>
    </article>`;
}

function cartePlanningEntretienActualitesCaserne(entretien) {
    const maintenant = Date.now() - 86400000;
    const creneauxFuturs = (entretien.creneaux || [])
        .filter(c => c.date_heure && new Date(c.date_heure).getTime() >= maintenant)
        .sort((a,b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime());
    const groupes = grouperCreneauxParDateCaserne(creneauxFuturs);
    const maReservation = creneauxFuturs.find(c => c.ma_reservation === true);
    const libres = creneauxFuturs.filter(c => c.est_complet !== true || c.ma_reservation === true).length;

    return `<article class="caserne-actu-card caserne-actu-entretien-detail${maReservation ? " caserne-actu-rendezvous" : ""}">
        <div class="caserne-actu-meta"><span>Entretien individuel</span>${creneauxFuturs[0]?.date_heure ? `<time>${echapperHTML(formaterDateHeureCaserne(creneauxFuturs[0].date_heure))}</time>` : ""}</div>
        <div class="caserne-entretien-card-entete">
            <div><h2>${echapperHTML(entretien.titre || "Entretien individuel")}</h2></div>
            ${entretien.duree_minutes ? `<span>${Number(entretien.duree_minutes)} min</span>` : ""}
        </div>
        ${entretien.description ? `<p>${echapperHTML(entretien.description).replaceAll("\n","<br>")}</p>` : ""}
        ${maReservation ? `<div class="caserne-entretien-mon-rdv"><strong>Mon rendez-vous</strong><span>${echapperHTML(formaterDateHeureCaserne(maReservation.date_heure))}</span>${boutonCalendrierCaserne(entretien.titre || "Entretien individuel", maReservation.date_heure, entretien.description || "", entretien.duree_minutes || 60, "Ajouter mon rendez-vous au calendrier")}<button type="button" class="caserne-entretien-annuler" onclick="annulerReservationEntretienCaserne('${maReservation.creneau_id}', true)">Annuler mon créneau</button></div>` : `<div class="caserne-entretien-actu-badge">${libres > 0 ? `${libres} créneau${libres > 1 ? "x" : ""} disponible${libres > 1 ? "s" : ""}` : "Aucun créneau disponible"}</div>`}
        <div class="caserne-entretien-creneaux caserne-entretien-creneaux-actualites">
            ${groupes.length ? groupes.map(([date, lignes]) => {
                const d = new Date(date + "T12:00:00");
                const libelle = d.toLocaleDateString("fr-FR", {weekday:"long", day:"2-digit", month:"long", year:"numeric"});
                return `<div class="caserne-entretien-jour"><strong>${echapperHTML(libelle)}</strong><div>${lignes.map(c => {
                    const heure = new Date(c.date_heure).toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"});
                    const reserveParMoi = c.ma_reservation === true;
                    const complet = c.est_complet === true && !reserveParMoi;
                    return `<button type="button" ${complet ? "disabled" : ""} class="${reserveParMoi ? "selectionne" : ""} ${complet ? "complet" : ""}" onclick="reserverCreneauEntretienCaserne('${c.creneau_id}', true)"><span>${echapperHTML(heure)}</span><small>${reserveParMoi ? "Mon créneau" : (complet ? "Indisponible" : "Choisir")}</small></button>`;
                }).join("")}</div></div>`;
            }).join("") : `<div class="caserne-entretien-sans-creneau">Aucun créneau à venir.</div>`}
        </div>
    </article>`;
}

async function nettoyerEvenementsCaserneAnciens() {
    const supabase = obtenirClientSupabase();
    if (!supabase || !navigator.onLine) return;
    try {
        const {error} = await supabase.rpc("nettoyer_evenements_caserne_anciens");
        if (error) console.warn("Nettoyage automatique des anciens événements Caserne :", error);
    } catch (erreur) {
        console.warn("Nettoyage automatique Caserne indisponible :", erreur);
    }
}

function carteEntretienPasseActualitesCaserne(entretien, dateReference) {
    const creneauxPasses = (entretien.creneaux || [])
        .filter(c => c.date_heure && new Date(c.date_heure).getTime() <= Date.now())
        .sort((a,b) => new Date(b.date_heure).getTime() - new Date(a.date_heure).getTime());
    const groupes = grouperCreneauxParDateCaserne([...creneauxPasses].sort((a,b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime()));
    return `<article class="caserne-actu-card caserne-actu-entretien-detail caserne-actu-passee">
        <div class="caserne-actu-meta"><span>Entretien individuel</span>${dateReference ? `<time>${echapperHTML(formaterDateHeureCaserne(dateReference))}</time>` : ""}</div>
        <div class="caserne-entretien-card-entete">
            <div><h2>${echapperHTML(entretien.titre || "Entretien individuel")}</h2></div>
            ${entretien.duree_minutes ? `<span>${Number(entretien.duree_minutes)} min</span>` : ""}
        </div>
        ${entretien.description ? `<p>${echapperHTML(entretien.description).replaceAll("\n","<br>")}</p>` : ""}
        <div class="caserne-entretien-creneaux caserne-entretien-creneaux-actualites">
            ${groupes.length ? groupes.map(([date, lignes]) => {
                const d = new Date(date + "T12:00:00");
                const libelle = d.toLocaleDateString("fr-FR", {weekday:"long", day:"2-digit", month:"long", year:"numeric"});
                return `<div class="caserne-entretien-jour"><strong>${echapperHTML(libelle)}</strong><div>${lignes.map(c => {
                    const heure = new Date(c.date_heure).toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"});
                    return `<div class="caserne-creneau-passe"><span>${echapperHTML(heure)}</span></div>`;
                }).join("")}</div></div>`;
            }).join("") : `<div class="caserne-entretien-sans-creneau">Aucun créneau enregistré.</div>`}
        </div>
    </article>`;
}

async function afficherActualitesCaserne(synchronisationDejaFaite = false) {
    if (!synchronisationDejaFaite) await synchroniserCaserneAvantNavigation();
    await nettoyerEvenementsCaserneAnciens();

    let publications = await chargerPublicationsCaserne();
    /* L'onglet Administratif est désormais un centre de gestion, pas un type d'événement. */
    publications = publications.filter(p => p.type_publication !== "administratif");
    publications = await chargerDetailsPublicationsCaserne(publications);
    window.__publicationsCaserneParId = Object.fromEntries(publications.map(p => [p.id,p]));

    const peutVoirEntretiens = utilisateurAPermission("acces_entretien_individuel") || utilisateurAPermission("acces_entretien_individuel_admin") || utilisateurEstSPVAdmin();
    const entretiens = peutVoirEntretiens ? await chargerEntretiensCaserne() : [];
    const maintenant = Date.now();

    const sansDate = [];
    const aVenir = [];
    const passes = [];

    publications.forEach(p => {
        if (!p.date_evenement) {
            sansDate.push({type:"publication", date:null, valeur:p});
            return;
        }
        const date = new Date(p.date_evenement).getTime();
        if (Number.isNaN(date)) {
            sansDate.push({type:"publication", date:null, valeur:p});
        } else if (date >= maintenant) {
            aVenir.push({type:"publication", date, valeur:p});
        } else {
            passes.push({type:"publication", date, valeur:p});
        }
    });

    (entretiens || []).forEach(entretien => {
        const tousLesCreneaux = (entretien.creneaux || [])
            .filter(c => c.date_heure && !Number.isNaN(new Date(c.date_heure).getTime()))
            .sort((a,b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime());
        if (!tousLesCreneaux.length) return;

        const creneauxFuturs = tousLesCreneaux.filter(c => new Date(c.date_heure).getTime() >= maintenant);
        if (creneauxFuturs.length) {
            const maReservation = creneauxFuturs.find(c => c.ma_reservation === true);
            aVenir.push({
                type:"entretien",
                date:new Date((maReservation || creneauxFuturs[0]).date_heure).getTime(),
                valeur:{...entretien, creneaux:creneauxFuturs}
            });
        } else {
            const dernier = tousLesCreneaux[tousLesCreneaux.length - 1];
            passes.push({
                type:"entretien_passe",
                date:new Date(dernier.date_heure).getTime(),
                valeur:{...entretien, creneaux:tousLesCreneaux},
                dateReference:dernier.date_heure
            });
        }
    });

    /* Sans date en premier. Les prochains événements vont du plus proche au plus lointain. */
    sansDate.sort((a,b) => new Date(b.valeur.created_at || 0).getTime() - new Date(a.valeur.created_at || 0).getTime());
    aVenir.sort((a,b) => a.date - b.date);
    /* Les événements passés sont placés AU-DESSUS du fil actuel :
       le plus ancien tout en haut, le plus récent juste au-dessus de la séparation. */
    passes.sort((a,b) => a.date - b.date);

    const futursHTML = [...sansDate, ...aVenir].map(e => e.type === "entretien"
        ? cartePlanningEntretienActualitesCaserne(e.valeur)
        : cartePublicationCaserne(e.valeur,{retour:"actualites"})
    ).join("");

    const passesHTML = passes.map(e => e.type === "entretien_passe"
        ? carteEntretienPasseActualitesCaserne(e.valeur, e.dateReference)
        : cartePublicationCaserne(e.valeur,{retour:"actualites",passe:true})
    ).join("");

    document.getElementById("app").innerHTML = `
        <main class="caserne-shell caserne-shell-actualites">
            <header class="caserne-top"><small>ESPACE CASERNE</small><h1>Actualités</h1><p>Informations et événements de la caserne</p></header>
            <section class="caserne-fil caserne-fil-actuel">
                ${passesHTML ? `<section class="caserne-passes-au-dessus">${passesHTML}<div class="caserne-separateur-passe"><span>Événements passés</span></div></section>` : ""}
                ${passesHTML ? `<div id="caserne-ancre-actuels" aria-hidden="true"></div>` : ""}
                ${futursHTML || '<div class="caserne-vide"><strong>Rien de prévu pour le moment</strong><p>Les prochains événements apparaîtront ici.</p></div>'}
            </section>
        </main>${navigationCaserne("caserne")}`;
    actualiserInterfaceBureau();

    /* À l'ouverture, le premier événement actuel/futur est affiché directement.
       Les événements passés font maintenant partie de la MÊME liste, juste au-dessus.
       Ils ne se révèlent que si l'utilisateur remonte volontairement le fil.
       L'en-tête Actualités reste visible pendant ce mouvement. */
    if (passesHTML) {
        const ancreActuels = document.getElementById("caserne-ancre-actuels");
        const enteteActualites = document.querySelector(".caserne-shell-actualites .caserne-top");

        if (ancreActuels) {
            const placerSurActuels = () => {
                const hauteurEntete = enteteActualites ? enteteActualites.offsetHeight : 0;
                const positionAncre = ancreActuels.getBoundingClientRect().top + window.scrollY;
                const cible = Math.max(0, positionAncre - hauteurEntete - 12);
                window.scrollTo({top:cible, behavior:"auto"});
            };

            requestAnimationFrame(() => {
                placerSurActuels();
                requestAnimationFrame(placerSurActuels);
            });
        }
    } else {
        window.scrollTo({top:0, behavior:"auto"});
    }
}

function afficherAdministratifCaserne() {
    const peutUtilisateurs = utilisateurEstSPVAdmin() && utilisateurAPermission("acces_gestion_utilisateurs");
    const peutNotifications = utilisateurAPermission("acces_notifications") || utilisateurEstSPVAdmin();
    const peutPharmacie = utilisateurAPermission("acces_administration");
    const peutArchives = utilisateurAPermission("acces_archives");

    const outils = [
        peutUtilisateurs ? `<button type="button" onclick="afficherGestionUtilisateurs()"><strong>Gestion des utilisateurs</strong><span>Comptes, rôles et permissions</span></button>` : "",
        peutNotifications ? `<button type="button" onclick="afficherNotificationsAdministration()"><strong>Notifications</strong><span>Créer et envoyer une notification</span></button>` : "",
        peutPharmacie ? `<button type="button" onclick="ouvrirAdministration()"><strong>Administration pharmacie</strong><span>Matériel, catégories, réapprovisionnement et historique</span></button>` : "",
        peutArchives ? `<button type="button" onclick="afficherArchivesHistorique()"><strong>Archives</strong><span>Consulter les historiques archivés</span></button>` : ""
    ].filter(Boolean);

    document.getElementById("app").innerHTML = `
        <main class="caserne-shell caserne-administratif-page">
            <header class="caserne-top"><small>ESPACE CASERNE</small><h1>Administratif</h1><p>Gestion de l'application et de la caserne</p></header>
            <section class="caserne-admin-centre">
                ${outils.length ? outils.join("") : `<div class="caserne-vide"><strong>Aucun outil administratif autorisé</strong><p>Les outils apparaissent selon les permissions de votre rôle.</p></div>`}
            </section>
        </main>${navigationCaserne("caserne")}`;
    actualiserInterfaceBureau();
}

async function afficherRubriqueCaserne(type) {
    const rubrique = obtenirRubriquesCaserne().find(r => r[0] === type);
    if (!rubrique || !utilisateurPeutVoirRubriqueCaserne(rubrique)) { alert("Accès non autorisé."); return; }
    await synchroniserCaserneAvantNavigation();
    const estAdmin = utilisateurEstSPVAdmin() || utilisateurAPermission(rubrique[3]);

    if (type === "administratif") {
        afficherAdministratifCaserne();
        return;
    }

    if (type === "entretien_individuel") {
        const entretiens = await chargerEntretiensCaserne();
        document.getElementById("app").innerHTML = `
            <main class="caserne-shell ${estAdmin ? "caserne-avec-admin" : ""}">
                <header class="caserne-top"><small>ESPACE CASERNE</small><h1>${echapperHTML(rubrique[1])}</h1><p>${estAdmin ? "Planification · réponses · créneaux" : "Choisissez votre créneau"}</p></header>
                ${estAdmin ? formulaireAdminEntretienCaserne() : ""}
                <section class="caserne-fil caserne-entretiens-fil">
                    ${entretiens.length ? entretiens.map(e => carteEntretienCaserne(e, estAdmin)).join("") : '<div class="caserne-vide"><strong>Aucun entretien planifié</strong><p>Les prochains créneaux apparaîtront ici.</p></div>'}
                </section>
            </main>${navigationCaserne("caserne")}`;
        actualiserInterfaceBureau();
        if (estAdmin && vueAdminEntretienCaserne === "reponses") remplirReponsesEntretiensAdminCaserne();
        return;
    }

    let publications = await chargerPublicationsCaserne(type);
    publications = await chargerDetailsPublicationsCaserne(publications);
    window.__publicationsCaserneParId = Object.fromEntries(publications.map(p => [p.id,p]));
    const formulaireAdmin = estAdmin ? formulaireAdminPublicationCaserne(type) : "";
    document.getElementById("app").innerHTML = `
        <main class="caserne-shell ${estAdmin ? "caserne-avec-admin" : ""}">
            <header class="caserne-top"><small>ESPACE CASERNE</small><h1>${echapperHTML(rubrique[1])}</h1><p>${estAdmin ? "Vue publique · administration" : "Informations et événements"}</p></header>
            ${formulaireAdmin}
            <section class="caserne-fil">
                ${publications.length ? publications.map(p => cartePublicationCaserne(p, {admin:estAdmin,retour:type})).join("") : '<div class="caserne-vide"><strong>Aucune publication</strong><p>Les prochains contenus apparaîtront ici.</p></div>'}
            </section>
        </main>${navigationCaserne("caserne")}`;
    actualiserInterfaceBureau();
}

function initialiserStyleEspaceCaserne() {
    if (document.getElementById("style-espace-caserne-v74")) return;
    const style=document.createElement("style");
    style.id="style-espace-caserne-v74";
    style.textContent=`
        html:has(body .caserne-shell){background:#7d2425!important}
        body:has(.caserne-shell){background:#7d2425!important;padding-bottom:92px!important;min-height:100dvh;overscroll-behavior-y:none}
        body:has(.caserne-shell) #app{background:#f4ebe8!important;min-height:100dvh}
        .caserne-shell{max-width:820px;margin:0 auto;padding:0 18px 110px;font-family:Arial,sans-serif;color:#2b1716;min-height:100dvh;background:#f4ebe8}
        html.cis-espace-caserne,html.cis-espace-caserne body{background:#7d2425!important}
        html.cis-espace-caserne body #app{background:#f4ebe8!important;min-height:100dvh}
        .caserne-top{margin:calc(-1 * env(safe-area-inset-top, 0px)) -18px 22px;padding:calc(34px + env(safe-area-inset-top, 0px)) 22px 28px;background:#7d2425;color:white;border-radius:0 0 28px 28px;box-shadow:0 10px 28px rgba(70,20,20,.16)}
        .caserne-top small{font-size:11px;font-weight:800;letter-spacing:2px;opacity:.72}.caserne-top h1{font-size:34px;line-height:1;margin:8px 0 9px}.caserne-top p{margin:0;opacity:.86}
        .caserne-fil{display:grid;gap:14px}.caserne-actu-card{background:#fff;border:1px solid #ead9d4;border-radius:18px;padding:18px;box-shadow:0 6px 18px rgba(80,40,30,.06)}
        .caserne-actu-meta{display:flex;justify-content:space-between;gap:12px;align-items:center;font-size:12px;margin-bottom:12px}.caserne-actu-meta span{text-transform:uppercase;font-weight:800;letter-spacing:.8px;color:#7d2425}.caserne-actu-meta time{color:#745f5b;text-align:right}
        .caserne-actu-card h2{font-size:20px;margin:0 0 8px}.caserne-actu-card p{margin:0;line-height:1.5;color:#5b4945}.caserne-reponse-attente{margin-top:14px;background:#f3d6d0;border-radius:10px;padding:10px 12px;font-weight:700;color:#702022}
        .caserne-vide{background:#fff;border:1px dashed #cfaeaa;border-radius:18px;padding:28px 20px;text-align:center}.caserne-vide strong{font-size:18px}.caserne-vide p{color:#75615e;margin-bottom:0}
        .caserne-menu-grille{display:grid;grid-template-columns:1fr 1fr;gap:12px}.caserne-menu-grille button{border:0;border-radius:18px;background:#fff;padding:20px 16px;text-align:left;box-shadow:0 5px 18px rgba(80,40,30,.07);min-height:105px;display:flex;flex-direction:column;justify-content:space-between;color:#2b1716}.caserne-menu-grille button strong{font-size:17px}.caserne-menu-grille button span{font-size:12px;color:#8c3434;font-weight:700}
        .caserne-admin-acces{margin:0 0 16px;background:#e7c2a5;border-left:5px solid #9b5d2e;border-radius:14px;padding:15px 16px;display:flex;flex-direction:column;gap:4px}.caserne-admin-acces strong{color:#5f3215}.caserne-admin-acces span{font-size:13px;color:#654c3c}
        .caserne-admin-bloc{margin:0 0 22px;background:#3f1718;color:#fff;border-radius:20px;padding:18px;box-shadow:0 8px 22px rgba(60,20,20,.16)}.caserne-admin-titre small{font-size:10px;font-weight:800;letter-spacing:1.7px;opacity:.68}.caserne-admin-titre h2{margin:5px 0 16px;font-size:23px}.caserne-formulaire-sport{display:grid;gap:12px}.caserne-formulaire-sport label{display:grid;gap:6px;font-size:12px;font-weight:800}.caserne-formulaire-sport input[type=text],.caserne-formulaire-sport input[type=datetime-local],.caserne-formulaire-sport input[type=file],.caserne-formulaire-sport textarea{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.18);background:#fff;color:#2b1716;border-radius:12px;padding:12px;font:inherit}.caserne-formulaire-sport textarea{resize:vertical}.caserne-switch-ligne{display:flex!important;align-items:center;gap:10px!important;background:rgba(255,255,255,.09);padding:11px;border-radius:12px}.caserne-switch-ligne input{width:20px;height:20px}.caserne-aide-photo{opacity:.65;margin-top:-7px}.caserne-bouton-admin-principal{border:0;border-radius:12px;background:#f2d7d1;color:#5b1b1d;padding:13px 16px;font-weight:900;font-size:14px}.caserne-bouton-admin-principal:disabled{opacity:.55}.caserne-photos{display:flex;gap:8px;overflow-x:auto;margin-top:14px;padding-bottom:3px}.caserne-photos button{flex:0 0 128px;height:100px;border:0;padding:0;border-radius:12px;overflow:hidden;background:#eadbd7}.caserne-photos img{width:100%;height:100%;object-fit:cover;display:block}.caserne-photo-overlay{position:fixed;inset:0;z-index:20000;background:rgba(18,8,8,.94);display:flex;align-items:center;justify-content:center;padding:55px 12px 20px}.caserne-photo-overlay img{max-width:100%;max-height:100%;object-fit:contain;touch-action:pinch-zoom}.caserne-photo-fermer{position:absolute;right:14px;top:14px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font-size:30px;line-height:1}.caserne-zone-reponse{margin-top:16px;border-top:1px solid #ead9d4;padding-top:14px}.caserne-boutons-reponse{display:grid;grid-template-columns:1fr 1fr;gap:9px}.caserne-boutons-reponse button{border:1px solid #d4b7b3;background:#fff;border-radius:11px;padding:11px;font-weight:800;color:#672426}.caserne-boutons-reponse button.selectionne.present{background:#7d2425;color:#fff;border-color:#7d2425}.caserne-boutons-reponse button.selectionne.absent{background:#ded4d1;color:#4c3c39;border-color:#c7b8b4}.caserne-liste-presents{margin-top:13px}.caserne-liste-presents>strong{display:block;font-size:12px;color:#7d2425;margin-bottom:7px}.caserne-liste-presents>div{display:flex;gap:6px;flex-wrap:wrap}.caserne-liste-presents span{display:inline-block;background:#f3e4e0;border-radius:999px;padding:6px 9px;font-size:12px;font-weight:700}.caserne-liste-presents small{color:#7d6b67}.caserne-actu-present{background:#f8dfda}.caserne-actions-admin{display:flex;justify-content:flex-end;margin-top:12px}.caserne-actions-admin button{border:0;background:#4a181a;color:#fff;border-radius:9px;padding:8px 11px;font-weight:800;font-size:11px}
        .caserne-entretien-onglets-admin{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 16px}.caserne-entretien-onglets-admin button{border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:10px;background:rgba(255,255,255,.06);color:#fff;font-weight:800}.caserne-entretien-onglets-admin button.actif{background:#f2d7d1;color:#5b1b1d;border-color:#f2d7d1}.caserne-formulaire-entretien input[type=number]{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.18);background:#fff;color:#2b1716;border-radius:12px;padding:12px;font:inherit}.caserne-entretien-dates-titre{display:grid;gap:3px;margin-top:3px}.caserne-entretien-dates-titre small{opacity:.68}.caserne-entretien-date-groupe{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;display:grid;gap:10px}.caserne-entretien-date-entete{display:flex;gap:10px;align-items:end}.caserne-entretien-date-entete label{flex:1}.caserne-entretien-date-entete input,.caserne-entretien-heure-ligne input{width:100%;box-sizing:border-box;border:0;border-radius:10px;padding:10px;background:#fff;color:#2b1716;font:inherit}.caserne-entretien-retirer,.caserne-entretien-ajouter-heure,.caserne-entretien-ajouter-date{border:1px solid rgba(255,255,255,.24);border-radius:9px;padding:9px 11px;background:transparent;color:#fff;font-weight:800}.caserne-entretien-retirer{font-size:11px}.caserne-entretien-ajouter-heure{text-align:left}.caserne-entretien-ajouter-date{width:100%;padding:11px}.caserne-entretien-heures{display:grid;gap:7px}.caserne-entretien-heure-ligne{display:grid;grid-template-columns:1fr 42px;gap:7px}.caserne-entretien-heure-ligne button{border:0;border-radius:9px;background:#702326;color:#fff;font-size:22px}.caserne-entretien-card{background:#fff;border:1px solid #ead9d4;border-radius:18px;padding:18px;box-shadow:0 6px 18px rgba(80,40,30,.06)}.caserne-entretien-card-entete{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.caserne-entretien-card-entete small{font-size:10px;font-weight:900;letter-spacing:1.2px;color:#7d2425}.caserne-entretien-card-entete h2{font-size:20px;margin:5px 0 0}.caserne-entretien-card-entete>span{background:#f2e4e0;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;white-space:nowrap}.caserne-entretien-card>p{color:#5b4945;line-height:1.5}.caserne-entretien-mon-rdv{margin:14px 0;background:#5b1719;color:#fff;border-radius:13px;padding:13px;display:grid;gap:4px}.caserne-entretien-mon-rdv strong{font-size:11px;text-transform:uppercase;letter-spacing:.8px;opacity:.72}.caserne-entretien-mon-rdv span{font-size:16px;font-weight:900}.caserne-entretien-mon-rdv button{margin-top:6px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;border-radius:8px;padding:8px;font-weight:800}.caserne-entretien-creneaux{display:grid;gap:14px;margin-top:14px}.caserne-entretien-jour>strong{display:block;text-transform:capitalize;margin-bottom:8px;font-size:13px;color:#6b2426}.caserne-entretien-jour>div{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.caserne-entretien-jour button{border:1px solid #d9c1bc;background:#fff;border-radius:11px;padding:9px 5px;display:grid;gap:2px;color:#4b2926}.caserne-entretien-jour button span{font-weight:900}.caserne-entretien-jour button small{font-size:9px}.caserne-entretien-jour button.selectionne{background:#7d2425;color:#fff;border-color:#7d2425}.caserne-entretien-jour button.complet{background:#eee8e6;color:#998984;border-color:#e0d6d3}.caserne-entretien-sans-creneau{padding:13px;border-radius:11px;background:#f5ece9;color:#765f5b;font-size:13px}.caserne-entretien-reponses-liste{display:grid;gap:8px}.caserne-entretien-reponses-liste article{background:rgba(255,255,255,.09);border-radius:11px;padding:11px;display:grid;gap:3px}.caserne-entretien-reponses-liste time{font-size:11px;opacity:.7}.caserne-entretien-reponses-liste strong{font-size:16px}.caserne-entretien-reponses-liste span{font-size:12px;opacity:.78}.caserne-entretien-chargement{padding:14px;border-radius:11px;background:rgba(255,255,255,.07);opacity:.8}.caserne-actu-entretien{cursor:pointer}.caserne-entretien-actu-badge{margin-top:14px;display:inline-block;background:#f3e3df;color:#6b2426;border:1px solid #e4cbc5;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900}.caserne-actu-rendezvous{background:#651c1f!important;color:#fff;border-color:#651c1f}.caserne-actu-rendezvous .caserne-actu-meta span,.caserne-actu-rendezvous .caserne-actu-meta time,.caserne-actu-rendezvous p{color:#fff}.caserne-rdv-badge{margin-top:14px;display:inline-block;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900}.caserne-calendrier-actions{display:grid;gap:8px;margin-top:14px}.caserne-bouton-calendrier{width:100%;border:1px solid #d7b9b4;background:#fff;color:#6b2426;border-radius:11px;padding:11px 12px;font-weight:900;font-size:12px}.caserne-actu-rendezvous .caserne-bouton-calendrier,.caserne-entretien-mon-rdv .caserne-bouton-calendrier{background:#fff;color:#651c1f;border-color:#fff}.caserne-entretien-mon-rdv .caserne-entretien-annuler{margin-top:0}.caserne-actu-entretien-detail .caserne-entretien-card-entete{margin-bottom:10px}.caserne-actu-entretien-detail .caserne-entretien-card-entete h2{margin:0}.caserne-actu-entretien-detail .caserne-entretien-creneaux{margin-top:15px}.caserne-actu-rendezvous .caserne-entretien-jour>strong{color:#fff}.caserne-actu-rendezvous .caserne-entretien-card-entete>span{background:rgba(255,255,255,.14);color:#fff}.caserne-actu-rendezvous .caserne-entretien-actu-badge{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.2)}
        .caserne-formulaire-publication select{width:100%;box-sizing:border-box;border:1px solid #d9c7c2;border-radius:12px;background:#fff;padding:12px;font-size:15px;color:#2b1716}.caserne-badges-publication{display:flex;flex-wrap:wrap;gap:7px;margin:6px 0 9px}.caserne-badge-soustype,.caserne-badge-visibilite{display:inline-flex;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900;background:#f5e3df;color:#7d2425}.caserne-badge-visibilite{background:#7d2425;color:#fff}.caserne-reponse-contexte{display:block;margin-bottom:9px;color:#6f2325}.caserne-preparation-bloc{margin-top:14px;padding:14px;border-radius:14px;background:#f7eeee;border:1px solid #ead1cc;display:grid;gap:8px}.caserne-preparation-bloc>strong{color:#7d2425}.caserne-actions-admin{display:flex;gap:8px;flex-wrap:wrap}.caserne-actions-admin button{flex:1;min-width:120px}.caserne-actu-present .caserne-preparation-bloc{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.25)}.caserne-actu-present .caserne-preparation-bloc>strong,.caserne-actu-present .caserne-reponse-contexte{color:inherit}
        .caserne-separateur-passe{display:flex;align-items:center;gap:12px;margin:24px 2px 4px;color:#786f6c;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px}.caserne-separateur-passe::before,.caserne-separateur-passe::after{content:"";height:1px;background:#c9c0bd;flex:1}.caserne-separateur-passe span{white-space:nowrap}.caserne-passes-au-dessus{display:grid;gap:14px;padding:0;background:transparent}.caserne-passes-au-dessus .caserne-separateur-passe{margin:8px 2px 0}.caserne-shell-actualites{min-height:100vh}.caserne-shell-actualites .caserne-top{position:sticky;top:0;z-index:40}.caserne-fil-actuel{min-height:55vh}
        .caserne-actu-passee{background:#dedbd9!important;border-color:#cbc6c3!important;color:#5d5957!important;box-shadow:none!important}.caserne-actu-passee .caserne-actu-meta span,.caserne-actu-passee .caserne-actu-meta time,.caserne-actu-passee h2,.caserne-actu-passee p,.caserne-actu-passee .caserne-reponse-contexte,.caserne-actu-passee .caserne-liste-presents>strong,.caserne-actu-passee .caserne-entretien-jour>strong{color:#5d5957!important}.caserne-actu-passee .caserne-liste-presents span,.caserne-actu-passee .caserne-badge-soustype,.caserne-actu-passee .caserne-badge-visibilite,.caserne-actu-passee .caserne-entretien-card-entete>span{background:#c9c5c2!important;color:#55514f!important}.caserne-actu-passee .caserne-preparation-bloc,.caserne-actu-passee .caserne-zone-reponse{background:rgba(255,255,255,.22)!important;border-color:#c7c2bf!important}.caserne-creneau-passe{border:1px solid #c2bdb9;background:#d2cfcc;border-radius:10px;padding:9px 5px;text-align:center;color:#5d5957}.caserne-creneau-passe span{font-weight:900}.caserne-zone-reponse-passee .caserne-liste-presents{margin-top:0}
        .caserne-admin-centre{display:grid;grid-template-columns:1fr 1fr;gap:12px}.caserne-admin-centre>button{border:1px solid #dcc7c2;background:#fff;border-radius:18px;padding:19px;text-align:left;min-height:108px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;color:#2b1716;box-shadow:0 6px 18px rgba(80,40,30,.06)}.caserne-admin-centre>button strong{font-size:17px}.caserne-admin-centre>button span{font-size:12px;line-height:1.4;color:#765f5b}.caserne-administratif-page .caserne-vide{grid-column:1/-1}@media(max-width:560px){.caserne-admin-centre{grid-template-columns:1fr}}
        .caserne-nav-bas{position:fixed;z-index:5000;left:50%;bottom:12px;transform:translateX(-50%);width:min(calc(100% - 24px),620px);height:68px;background:#fff;border:1px solid #eadbd7;border-radius:22px;box-shadow:0 12px 34px rgba(50,20,20,.18);display:grid;grid-template-columns:repeat(4,1fr);padding:5px 54px 5px 6px}
        .caserne-nav-bas>button:not(.caserne-menu-bulle){border:0;background:transparent;color:#7d6b67;font-size:10px;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}.caserne-nav-bas>button span{font-size:21px;line-height:1}.caserne-nav-bas>button.actif{color:#8a2527}.caserne-menu-bulle{position:absolute;right:8px;top:8px;width:50px;height:50px;border-radius:50%;border:0;background:#7d2425;color:#fff;box-shadow:0 5px 15px rgba(80,20,20,.25)}.caserne-menu-bulle span{font-size:20px!important}
        .navigation-fixe-page{padding-bottom:110px!important}
        .caserne-nav-bas.nav-theme-pharmacie>button.actif{color:#237448}.caserne-nav-bas.nav-theme-pharmacie .caserne-menu-bulle{background:#237448;box-shadow:0 5px 15px rgba(20,85,52,.24)}
        .caserne-nav-bas.nav-theme-accueil>button.actif{color:#171717}.caserne-nav-bas.nav-theme-accueil .caserne-menu-bulle{background:#171717;box-shadow:0 5px 15px rgba(0,0,0,.22)}
        @media(min-width:1000px){body:has(.caserne-shell) .sidebar-pc{display:none!important}.caserne-shell{padding-top:20px}.caserne-top{border-radius:28px;margin:0 0 24px}.caserne-nav-bas{bottom:22px}}
    `;
    document.head.appendChild(style);
}


function synchroniserApparencePWACaserne() {
    const dansCaserne = Boolean(document.querySelector(".caserne-shell"));

    let theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) {
        theme = document.createElement("meta");
        theme.name = "theme-color";
        document.head.appendChild(theme);
    }

    let status = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!status) {
        status = document.createElement("meta");
        status.name = "apple-mobile-web-app-status-bar-style";
        document.head.appendChild(status);
    }

    const viewport = document.querySelector('meta[name="viewport"]');

    if (!window.__cisThemeInitial) {
        window.__cisThemeInitial = theme.getAttribute("content") || "#1f2937";
        window.__cisStatusInitial = status.getAttribute("content") || "default";
        window.__cisViewportInitial = viewport ? (viewport.getAttribute("content") || "width=device-width, initial-scale=1.0") : null;
    }

    if (dansCaserne) {
        theme.setAttribute("content", "#7d2425");
        status.setAttribute("content", "black-translucent");
        document.documentElement.classList.add("cis-espace-caserne");
        document.body.classList.add("cis-espace-caserne");
        if (viewport) {
            const base = (window.__cisViewportInitial || viewport.getAttribute("content") || "width=device-width, initial-scale=1.0")
                .replace(/\s*,?\s*viewport-fit\s*=\s*[^,]+/gi, "");
            viewport.setAttribute("content", `${base}, viewport-fit=cover`);
        }
        document.documentElement.style.backgroundColor = "#7d2425";
        document.body.style.backgroundColor = "#7d2425";
    } else {
        theme.setAttribute("content", window.__cisThemeInitial || "#1f2937");
        status.setAttribute("content", window.__cisStatusInitial || "default");
        document.documentElement.classList.remove("cis-espace-caserne");
        document.body.classList.remove("cis-espace-caserne");
        if (viewport && window.__cisViewportInitial) viewport.setAttribute("content", window.__cisViewportInitial);
        document.documentElement.style.backgroundColor = "";
        document.body.style.backgroundColor = "";
    }
}

if (!window.__cisThemeObserverInstalle) {
    window.__cisThemeObserverInstalle = true;
    const observerThemeCaserne = new MutationObserver(() => synchroniserApparencePWACaserne());
    observerThemeCaserne.observe(document.documentElement, {subtree:true, childList:true});
    window.addEventListener("pageshow", synchroniserApparencePWACaserne);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) synchroniserApparencePWACaserne();
    });
    setTimeout(synchroniserApparencePWACaserne, 0);
}


function initialiserStylePortailCIS() {

    if (document.getElementById("style-portail-cis")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "style-portail-cis";
    style.textContent = `
        .portail-cis-page {
            max-width: 760px;
            margin: 0 auto;
        }

        .portail-cis-entete {
            margin: 26px 0 30px;
        }

        .portail-cis-entete h1 {
            margin-bottom: 6px;
        }

        .portail-cis-entete p {
            margin: 0;
            opacity: .72;
        }

        .portail-cis-retour {
            margin: 18px 0 20px;
        }

        .portail-cis-espaces {
            display: grid;
            gap: 12px;
        }

        .portail-cis-carte {
            width: 100%;
            min-height: 82px;
            border: 0;
            border-radius: 16px;
            padding: 18px 20px;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-align: left;
            box-shadow: 0 5px 14px rgba(0,0,0,.10);
            cursor: pointer;
        }

        .portail-cis-caserne {
            background: #741f25;
        }

        .portail-cis-pharmacie {
            background: #205f43;
        }

        .portail-cis-titre {
            font-size: 1.08rem;
            font-weight: 800;
        }

        .portail-cis-fleche {
            font-size: 1.9rem;
            line-height: 1;
            font-weight: 300;
        }

        .espace-caserne-attente {
            margin-top: 28px;
            padding: 28px;
            border-radius: 22px;
            background: #fff;
            border: 1px solid #e1e5e8;
            box-shadow: 0 8px 22px rgba(0,0,0,.06);
        }

        .espace-caserne-attente strong {
            font-size: 1.2rem;
        }

        .bouton-retour-portail {
            width: 100%;
            margin: 0 0 18px;
            padding: 13px 16px;
            border: 1px solid #d9e0e5;
            border-radius: 14px;
            background: #fff;
            color: #27313a;
            font-weight: 700;
            cursor: pointer;
        }

        @media (min-width: 1000px) {
            .portail-cis-page {
                max-width: 980px;
                padding-top: 42px;
            }

            .portail-cis-espaces {
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .portail-cis-carte {
                min-height: 112px;
                padding: 24px 26px;
            }

            .portail-cis-titre {
                font-size: 1.25rem;
            }
        }
    `;

    document.head.appendChild(style);
}

initialiserStylePortailCIS();

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
    initialiserStyleEspaceCaserne();

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

        <main class="page navigation-fixe-page">

            <div class="utilisateur-entete">

                <button
                    class="retour-button"
                    type="button"
                    onclick="afficherPortailPrincipal()"
                >
                    ← Retour
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

        ${navigationPrincipale("pharmacie", "pharmacie")}

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

                                <span class="auteur-intervention">
                                    ${echapperHTML(nomAuteurIntervention(intervention))}
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

        /* Espace volontairement distinct pour la modification d'un retour */
        .editeur-retour-special {
            min-height:100vh;
            box-sizing:border-box;
            background:linear-gradient(180deg,#eef4f8 0,#f7f9fb 260px,#f7f9fb 100%);
            padding-bottom:38px;
        }
        .editeur-retour-special .retour-button { margin-bottom:18px; }
        .bandeau-edition-retour {
            background:#17324a;
            color:#fff;
            border-radius:18px;
            padding:20px;
            margin:0 0 18px;
            box-shadow:0 8px 24px rgba(20,42,60,.16);
        }
        .bandeau-edition-retour .sur-titre {
            display:block;
            font-size:.82rem;
            font-weight:800;
            letter-spacing:.08em;
            text-transform:uppercase;
            opacity:.72;
            margin-bottom:5px;
        }
        .bandeau-edition-retour h2 {
            color:#fff !important;
            margin:0;
            font-size:1.7rem;
            line-height:1.15;
        }
        .infos-retour-verrouillees {
            display:grid;
            grid-template-columns:1fr;
            gap:10px;
            background:#fff;
            border:1px solid #dce4ea;
            border-radius:16px;
            padding:16px;
            margin-bottom:20px;
            box-shadow:0 3px 12px rgba(30,50,65,.06);
        }
        .info-retour-verrouillee {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:18px;
            padding:8px 0;
            border-bottom:1px solid #edf1f4;
        }
        .info-retour-verrouillee:last-child { border-bottom:0; }
        .info-retour-verrouillee .libelle {
            color:#667783;
            font-size:.9rem;
            font-weight:700;
        }
        .info-retour-verrouillee .valeur {
            color:#17232c;
            font-size:1rem;
            font-weight:800;
            text-align:right;
            overflow-wrap:anywhere;
        }
        .note-verrouillage-retour {
            color:#64727c;
            font-size:.86rem;
            margin:-7px 0 21px;
        }
        .titre-materiel-edition {
            color:#17324a;
            font-size:1.25rem;
            margin:0 0 12px;
        }
        .liste-materiels-edition {
            display:flex;
            flex-direction:column;
            gap:10px;
            margin-bottom:18px;
        }
        .ligne-edition-materiel {
            display:grid;
            grid-template-columns:minmax(0,1fr) auto;
            gap:12px;
            align-items:center;
            background:#fff;
            border:1px solid #dce4ea;
            border-radius:15px;
            padding:13px 14px;
            box-shadow:0 2px 9px rgba(30,50,65,.05);
        }
        .ligne-edition-materiel .nom-materiel-edition {
            color:#1d2932;
            font-size:1rem;
            font-weight:800;
            line-height:1.25;
        }
        .controle-quantite-edition {
            display:flex;
            align-items:center;
            gap:7px;
        }
        .controle-quantite-edition button {
            width:38px;
            height:38px;
            min-width:38px;
            padding:0;
            border:0;
            border-radius:10px;
            background:#e8eef2;
            color:#17324a;
            font-size:1.35rem;
            font-weight:900;
            line-height:1;
        }
        .controle-quantite-edition input[type="number"] {
            width:58px !important;
            min-width:58px !important;
            height:38px !important;
            min-height:38px !important;
            box-sizing:border-box !important;
            padding:5px 4px !important;
            margin:0 !important;
            border:1px solid #cbd6dd !important;
            border-radius:9px !important;
            background:#fff !important;
            color:#111 !important;
            font-size:1rem !important;
            font-weight:800 !important;
            text-align:center !important;
        }
        .bloc-ajout-materiel-edition {
            background:#dfeaf1;
            border:1px solid #c5d6e1;
            border-radius:16px;
            padding:15px;
            margin:17px 0 22px;
        }
        .bloc-ajout-materiel-edition strong {
            display:block;
            color:#17324a;
            margin-bottom:9px;
            font-size:1rem;
        }
        .bloc-ajout-materiel-edition .recherche-materiel-edition {
            display:block !important;
            width:100% !important;
            min-width:0 !important;
            height:50px !important;
            min-height:50px !important;
            box-sizing:border-box !important;
            margin:0 0 10px !important;
            padding:0 12px !important;
            border:1px solid #b9cbd6 !important;
            border-radius:11px !important;
            background:#fff !important;
            color:#17232c !important;
            font-size:1rem !important;
        }
        .bloc-ajout-materiel-edition .reappro-resultats {
            position:static !important;
            width:100% !important;
            max-height:230px !important;
            overflow-y:auto !important;
            margin:8px 0 0 !important;
            padding:0 !important;
            border:0 !important;
            background:transparent !important;
            box-shadow:none !important;
        }
        .bloc-ajout-materiel-edition .reappro-resultat {
            display:flex !important;
            width:100% !important;
            min-height:58px !important;
            box-sizing:border-box !important;
            align-items:center !important;
            justify-content:space-between !important;
            gap:12px !important;
            margin:0 0 8px !important;
            padding:13px 15px !important;
            border:1px solid #b9cbd6 !important;
            border-radius:12px !important;
            background:#fff !important;
            color:#17324a !important;
            text-align:left !important;
            box-shadow:0 2px 7px rgba(30,50,65,.06) !important;
            font:inherit !important;
            cursor:pointer !important;
        }
        .bloc-ajout-materiel-edition .reappro-resultat strong {
            display:block !important;
            margin:0 !important;
            color:#17324a !important;
            font-size:1rem !important;
            line-height:1.2 !important;
        }
        .bloc-ajout-materiel-edition .reappro-resultat small {
            display:block !important;
            margin:3px 0 0 !important;
            color:#657785 !important;
            font-size:.78rem !important;
            font-weight:600 !important;
        }
        .bloc-ajout-materiel-edition .reappro-resultat .action-ajout-rapide {
            flex:0 0 auto;
            color:#286b94;
            font-size:.82rem;
            font-weight:900;
            white-space:nowrap;
        }
        .bouton-enregistrer-edition-retour {
            width:100%;
            min-height:56px;
            border:0;
            border-radius:14px;
            background:#19754b;
            color:#fff;
            font:inherit;
            font-size:1.05rem;
            font-weight:900;
            box-shadow:0 6px 16px rgba(25,117,75,.18);
        }
        @media (min-width: 700px) {
            .infos-retour-verrouillees { grid-template-columns:repeat(3,minmax(0,1fr)); }
            .info-retour-verrouillee { display:block; border:0; padding:4px 8px; }
            .info-retour-verrouillee .valeur { display:block; text-align:left; margin-top:5px; }
            .editeur-retour-special .contenu-editeur-retour { max-width:820px; margin:0 auto; }
        }
        @media (max-width: 430px) {
            .editeur-retour-special { padding-left:16px !important; padding-right:16px !important; }
            .bandeau-edition-retour { padding:17px; border-radius:15px; }
            .bandeau-edition-retour h2 { font-size:1.45rem; }
            .ligne-edition-materiel { grid-template-columns:1fr; }
            .controle-quantite-edition { justify-content:flex-end; }
        }
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

function htmlLigneMaterielEdition(materiel, quantite) {
    return `
        <div class="ligne-edition-materiel" data-ligne-materiel-id="${echapperHTML(String(materiel.id))}">
            <div class="nom-materiel-edition">${echapperHTML(materiel.nom)}</div>
            <div class="controle-quantite-edition">
                <button type="button" aria-label="Retirer une unité" onclick="changerQuantiteMaterielEdition('${materiel.id}', -1)">−</button>
                <input id="edit-qte-${materiel.id}" data-materiel-id="${materiel.id}" class="edit-qte-intervention" type="number" min="0" step="1" value="${Math.max(0, Math.floor(Number(quantite || 0)))}" inputmode="numeric">
                <button type="button" aria-label="Ajouter une unité" onclick="changerQuantiteMaterielEdition('${materiel.id}', 1)">+</button>
            </div>
        </div>`;
}

function changerQuantiteMaterielEdition(materielId, delta) {
    const champ = document.getElementById(`edit-qte-${materielId}`);
    if (!champ) return;
    const actuelle = Math.max(0, Math.floor(Number(champ.value || 0)));
    champ.value = Math.max(0, actuelle + Number(delta || 0));
}

function rechercherMaterielEditionRetour() {
    const recherche = document.getElementById("recherche-materiel-edition");
    const champId = document.getElementById("ajout-materiel-edition-id");
    const resultats = document.getElementById("resultats-materiel-edition");
    if (!recherche || !champId || !resultats) return;

    champId.value = "";
    const terme = String(recherche.value || "").trim().toLocaleLowerCase();
    if (!terme) {
        resultats.innerHTML = "";
        resultats.classList.remove("ouvert");
        return;
    }

    const dejaPresents = new Set(
        Array.from(document.querySelectorAll(".edit-qte-intervention"))
            .map(champ => String(champ.dataset.materielId || ""))
    );

    const correspondances = [...materiels]
        .filter(m => !dejaPresents.has(String(m.id)))
        .filter(m => {
            const nom = String(m.nom || "").toLocaleLowerCase();
            const reference = String(m.reference || "").toLocaleLowerCase();
            return nom.includes(terme) || reference.includes(terme);
        })
        .sort((a,b) => String(a.nom || "").localeCompare(String(b.nom || ""), "fr", { sensitivity:"base" }))
        .slice(0, 12);

    if (!correspondances.length) {
        resultats.innerHTML = '<div class="reappro-recherche-vide">Aucun matériel trouvé</div>';
        resultats.classList.add("ouvert");
        return;
    }

    resultats.innerHTML = correspondances.map(m => {
        const reference = String(m.reference || "").trim();
        return `<button type="button" class="reappro-resultat" onclick="ajouterMaterielEditionRetourDirect('${echapperHTML(String(m.id))}')"><span><strong>${echapperHTML(m.nom)}</strong>${reference ? `<small>Réf. ${echapperHTML(reference)}</small>` : ""}</span><span class="action-ajout-rapide">Ajouter +</span></button>`;
    }).join("");
    resultats.classList.add("ouvert");
}

function selectionnerMaterielEditionRetour(materielId) {
    const materiel = materiels.find(m => String(m.id) === String(materielId));
    const recherche = document.getElementById("recherche-materiel-edition");
    const champId = document.getElementById("ajout-materiel-edition-id");
    const resultats = document.getElementById("resultats-materiel-edition");
    if (!materiel || !recherche || !champId || !resultats) return;
    recherche.value = String(materiel.nom || "");
    champId.value = String(materiel.id);
    resultats.innerHTML = "";
    resultats.classList.remove("ouvert");
}

function ajouterMaterielEditionRetourDirect(materielId) {
    const materiel = materiels.find(m => String(m.id) === String(materielId));
    const recherche = document.getElementById("recherche-materiel-edition");
    const champId = document.getElementById("ajout-materiel-edition-id");
    const resultats = document.getElementById("resultats-materiel-edition");
    const conteneur = document.getElementById("liste-materiels-edition");
    if (!materiel || !conteneur) return;
    if (document.getElementById(`edit-qte-${materiel.id}`)) return alert("Ce matériel est déjà renseigné.");
    conteneur.insertAdjacentHTML("beforeend", htmlLigneMaterielEdition(materiel, 1));
    if (champId) champId.value = "";
    if (recherche) {
        recherche.value = "";
        recherche.focus();
    }
    if (resultats) {
        resultats.innerHTML = "";
        resultats.classList.remove("ouvert");
    }
}

function ajouterMaterielEditionRetour() {
    const champId = document.getElementById("ajout-materiel-edition-id");
    const recherche = document.getElementById("recherche-materiel-edition");
    const resultats = document.getElementById("resultats-materiel-edition");
    const conteneur = document.getElementById("liste-materiels-edition");
    if (!champId || !conteneur || !champId.value) return alert("Sélectionnez un matériel dans les propositions.");
    const materiel = materiels.find(m => String(m.id) === String(champId.value));
    if (!materiel) return alert("Matériel introuvable.");
    if (document.getElementById(`edit-qte-${materiel.id}`)) return alert("Ce matériel est déjà renseigné.");
    conteneur.insertAdjacentHTML("beforeend", htmlLigneMaterielEdition(materiel, 1));
    champId.value = "";
    if (recherche) recherche.value = "";
    if (resultats) {
        resultats.innerHTML = "";
        resultats.classList.remove("ouvert");
    }
}

function afficherModificationRetourIntervention(interventionId) {
    initialiserStylesActionsIntervention();
    const intervention = historique.find(i => String(i.id) === String(interventionId));
    if (!intervention) return alert("Intervention introuvable.");
    const admin = utilisateurEstSPVAdmin();
    if (!admin && (!auteurInterventionEstUtilisateur(intervention) || ageInterventionMs(intervention) > 36 * 60 * 60 * 1000)) {
        return alert("Ce retour ne peut plus être modifié.");
    }

    const quantites = new Map((intervention.consommations || []).map(c => [String(c.materielId), Number(c.quantite || 0)]));
    const idsActuels = new Set(Array.from(quantites.keys()));
    const lignes = materiels
        .filter(m => idsActuels.has(String(m.id)))
        .sort((a,b)=>String(a.nom).localeCompare(String(b.nom),"fr"))
        .map(m => htmlLigneMaterielEdition(m, quantites.get(String(m.id))))
        .join("");



    document.getElementById("app").innerHTML = `
        <main class="page editeur-retour-special">
            <div class="contenu-editeur-retour">
                <button class="retour-button" onclick="afficherDetailIntervention('${intervention.id}')">← Retour</button>

                <section class="bandeau-edition-retour">
                    <span class="sur-titre">Espace de modification</span>
                    <h2>Matériel déclaré · Inter n°${echapperHTML(intervention.numeroIntervention)}</h2>
                </section>

                <section class="infos-retour-verrouillees">
                    <div class="info-retour-verrouillee">
                        <span class="libelle">Enregistré par</span>
                        <span class="valeur">${echapperHTML(nomAuteurIntervention(intervention))}</span>
                    </div>
                    <div class="info-retour-verrouillee">
                        <span class="libelle">Date</span>
                        <span class="valeur">${echapperHTML(formaterDate(intervention.date))}</span>
                    </div>
                </section>
                <p class="note-verrouillage-retour">La date, le numéro d'intervention et l'identité d'origine ne peuvent pas être modifiés.</p>

                <div id="liste-materiels-edition" class="liste-materiels-edition">${lignes || '<div class="materiel">Aucun matériel renseigné.</div>'}</div>

                <section class="bloc-ajout-materiel-edition">
                    <strong>Ajouter un matériel</strong>
                    <div class="reappro-recherche-wrap">
                        <input id="recherche-materiel-edition" class="reappro-recherche recherche-materiel-edition" type="search" autocomplete="off" placeholder="Rechercher un matériel" aria-label="Rechercher un matériel" oninput="rechercherMaterielEditionRetour()" onfocus="rechercherMaterielEditionRetour()">
                        <input id="ajout-materiel-edition-id" type="hidden" value="">
                        <div id="resultats-materiel-edition" class="reappro-resultats"></div>
                    </div>
                </section>

                <button class="bouton-enregistrer-edition-retour" onclick="enregistrerModificationRetourIntervention('${intervention.id}')">Enregistrer les modifications</button>
            </div>
        </main>`;
}

async function enregistrerModificationRetourIntervention(interventionId) {
    const intervention = historique.find(i => String(i.id) === String(interventionId));
    if (!intervention) return alert("Intervention introuvable.");
    const admin = utilisateurEstSPVAdmin();
    if (!admin && (!auteurInterventionEstUtilisateur(intervention) || ageInterventionMs(intervention) > 36 * 60 * 60 * 1000)) return alert("Ce retour ne peut plus être modifié.");
    if (!navigator.onLine) return alert("Une connexion Internet est nécessaire pour modifier un retour d'intervention.");

    const consommations = Array.from(document.querySelectorAll(".edit-qte-intervention"))
        .map(champ => ({ materiel_id: champ.dataset.materielId, quantite: Math.floor(Number(champ.value || 0)) }))
        .filter(x => x.quantite > 0);

    if (!consommations.length) return alert("Veuillez conserver au moins un matériel utilisé.");
    if (!await afficherConfirmationCIS("Enregistrer les modifications du matériel utilisé ?")) return;

    const supabase = obtenirClientSupabase();
    const { error } = await supabase.rpc("modifier_retour_intervention", {
        p_intervention_id: String(interventionId),
        p_date: String(intervention.date),
        p_numero: String(intervention.numeroIntervention),
        p_consommations: consommations
    });
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
    const modificationPossible = admin || (auteur && ageInterventionMs(intervention) <= 36 * 60 * 60 * 1000);
    const suppressionAuteurPossible = auteur && ageInterventionMs(intervention) <= 60 * 60 * 1000;
    const afficherSuppression = auteur || admin;
    let html = `<main class="page">
        <button class="retour-button" onclick="afficherHistorique()">← Retour</button>
        <h2>Détail de l'intervention</h2>
        <div class="detail-header">
            <strong>Intervention ${echapperHTML(intervention.numeroIntervention)}</strong>
            <span>Date : ${formaterDate(intervention.date)}</span>
            <span class="auteur-intervention">${echapperHTML(nomAuteurIntervention(intervention))}</span>
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
        if (auteur || admin) html += `<button class="bouton-modifier-intervention" ${modificationPossible ? `onclick="afficherModificationRetourIntervention('${intervention.id}')"` : "disabled"}>Modifier</button>`;
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
                            ${permissionRoleHTML(role,"acces_espace_caserne","Espace Caserne",prefixe)}
${permissionRoleHTML(role,"acces_sport","Sport",prefixe)}
${permissionRoleHTML(role,"acces_sport_admin","Sport — Admin",prefixe)}
${permissionRoleHTML(role,"acces_manoeuvre","Manœuvre",prefixe)}
${permissionRoleHTML(role,"acces_manoeuvre_admin","Manœuvre — Admin",prefixe)}
${permissionRoleHTML(role,"acces_casernement","Casernement",prefixe)}
${permissionRoleHTML(role,"acces_casernement_admin","Casernement — Admin",prefixe)}
${permissionRoleHTML(role,"acces_reunion","Réunion",prefixe)}
${permissionRoleHTML(role,"acces_reunion_admin","Réunion — Admin",prefixe)}
${permissionRoleHTML(role,"acces_amical_public","Amical — Public",prefixe)}
${permissionRoleHTML(role,"acces_amical_membre","Amical — Membre",prefixe)}
${permissionRoleHTML(role,"acces_amical_admin","Amical — Admin",prefixe)}
${permissionRoleHTML(role,"acces_comite_centre","Comité de centre",prefixe)}
${permissionRoleHTML(role,"acces_comite_centre_admin","Comité de centre — Admin",prefixe)}
${permissionRoleHTML(role,"acces_administratif","Administratif",prefixe)}
${permissionRoleHTML(role,"acces_administratif_admin","Administratif — Admin",prefixe)}
${permissionRoleHTML(role,"acces_entretien_individuel","Entretien individuel",prefixe)}
${permissionRoleHTML(role,"acces_entretien_individuel_admin","Entretien individuel — Admin",prefixe)}

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
<label><input type="checkbox" id="new-role-espace-caserne"> Espace Caserne</label>
<label><input type="checkbox" id="new-role-sport"> Sport</label>
<label><input type="checkbox" id="new-role-sport-admin"> Sport — Admin</label>
<label><input type="checkbox" id="new-role-manoeuvre"> Manœuvre</label>
<label><input type="checkbox" id="new-role-manoeuvre-admin"> Manœuvre — Admin</label>
<label><input type="checkbox" id="new-role-casernement"> Casernement</label>
<label><input type="checkbox" id="new-role-casernement-admin"> Casernement — Admin</label>
<label><input type="checkbox" id="new-role-reunion"> Réunion</label>
<label><input type="checkbox" id="new-role-reunion-admin"> Réunion — Admin</label>
<label><input type="checkbox" id="new-role-amical-public"> Amical — Public</label>
<label><input type="checkbox" id="new-role-amical-membre"> Amical — Membre</label>
<label><input type="checkbox" id="new-role-amical-admin"> Amical — Admin</label>
<label><input type="checkbox" id="new-role-comite-centre"> Comité de centre</label>
<label><input type="checkbox" id="new-role-comite-centre-admin"> Comité de centre — Admin</label>
<label><input type="checkbox" id="new-role-administratif"> Administratif</label>
<label><input type="checkbox" id="new-role-administratif-admin"> Administratif — Admin</label>
<label><input type="checkbox" id="new-role-entretien-individuel"> Entretien individuel</label>
<label><input type="checkbox" id="new-role-entretien-individuel-admin"> Entretien individuel — Admin</label>
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
                    lirePermissionRole("new-role-notifications"),
                acces_espace_caserne:
                    lirePermissionRole("new-role-espace-caserne"),
                acces_sport:
                    lirePermissionRole("new-role-sport"),
                acces_sport_admin:
                    lirePermissionRole("new-role-sport-admin"),
                acces_manoeuvre:
                    lirePermissionRole("new-role-manoeuvre"),
                acces_manoeuvre_admin:
                    lirePermissionRole("new-role-manoeuvre-admin"),
                acces_casernement:
                    lirePermissionRole("new-role-casernement"),
                acces_casernement_admin:
                    lirePermissionRole("new-role-casernement-admin"),
                acces_reunion:
                    lirePermissionRole("new-role-reunion"),
                acces_reunion_admin:
                    lirePermissionRole("new-role-reunion-admin"),
                acces_amical_public:
                    lirePermissionRole("new-role-amical-public"),
                acces_amical_membre:
                    lirePermissionRole("new-role-amical-membre"),
                acces_amical_admin:
                    lirePermissionRole("new-role-amical-admin"),
                acces_comite_centre:
                    lirePermissionRole("new-role-comite-centre"),
                acces_comite_centre_admin:
                    lirePermissionRole("new-role-comite-centre-admin"),
                acces_administratif:
                    lirePermissionRole("new-role-administratif"),
                acces_administratif_admin:
                    lirePermissionRole("new-role-administratif-admin"),
                acces_entretien_individuel:
                    lirePermissionRole("new-role-entretien-individuel"),
                acces_entretien_individuel_admin:
                    lirePermissionRole("new-role-entretien-individuel-admin")
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
                    lirePermissionRole(prefixe + "-acces_notifications"),
                acces_espace_caserne:
                    lirePermissionRole(prefixe + "-acces_espace_caserne"),
                acces_sport:
                    lirePermissionRole(prefixe + "-acces_sport"),
                acces_sport_admin:
                    lirePermissionRole(prefixe + "-acces_sport_admin"),
                acces_manoeuvre:
                    lirePermissionRole(prefixe + "-acces_manoeuvre"),
                acces_manoeuvre_admin:
                    lirePermissionRole(prefixe + "-acces_manoeuvre_admin"),
                acces_casernement:
                    lirePermissionRole(prefixe + "-acces_casernement"),
                acces_casernement_admin:
                    lirePermissionRole(prefixe + "-acces_casernement_admin"),
                acces_reunion:
                    lirePermissionRole(prefixe + "-acces_reunion"),
                acces_reunion_admin:
                    lirePermissionRole(prefixe + "-acces_reunion_admin"),
                acces_amical_public:
                    lirePermissionRole(prefixe + "-acces_amical_public"),
                acces_amical_membre:
                    lirePermissionRole(prefixe + "-acces_amical_membre"),
                acces_amical_admin:
                    lirePermissionRole(prefixe + "-acces_amical_admin"),
                acces_comite_centre:
                    lirePermissionRole(prefixe + "-acces_comite_centre"),
                acces_comite_centre_admin:
                    lirePermissionRole(prefixe + "-acces_comite_centre_admin"),
                acces_administratif:
                    lirePermissionRole(prefixe + "-acces_administratif"),
                acces_administratif_admin:
                    lirePermissionRole(prefixe + "-acces_administratif_admin"),
                acces_entretien_individuel:
                    lirePermissionRole(prefixe + "-acces_entretien_individuel"),
                acces_entretien_individuel_admin:
                    lirePermissionRole(prefixe + "-acces_entretien_individuel_admin")
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

window.afficherPortailPrincipal =
    afficherPortailPrincipal;


window.afficherActualitesCaserne = afficherActualitesCaserne;
window.afficherAdministratifCaserne = afficherAdministratifCaserne;
window.afficherRubriqueCaserne = afficherRubriqueCaserne;
window.retourPagePrecedente = retourPagePrecedente;
window.ouvrirMenuCaserne = ouvrirMenuCaserne;
window.ouvrirPhotoCaserne = ouvrirPhotoCaserne;
window.repondrePublicationCaserne = repondrePublicationCaserne;
window.creerSeanceSportCaserne = creerSeanceSportCaserne;
window.creerPublicationModuleCaserne = creerPublicationModuleCaserne;
window.modifierPublicationCaserne = modifierPublicationCaserne;
window.supprimerPublicationCaserne = supprimerPublicationCaserne;
window.changerVueAdminEntretienCaserne = changerVueAdminEntretienCaserne;
window.ajouterDateEntretienCaserne = ajouterDateEntretienCaserne;
window.retirerDateEntretienCaserne = retirerDateEntretienCaserne;
window.modifierDateEntretienCaserne = modifierDateEntretienCaserne;
window.ajouterHeureEntretienCaserne = ajouterHeureEntretienCaserne;
window.retirerHeureEntretienCaserne = retirerHeureEntretienCaserne;
window.modifierHeureEntretienCaserne = modifierHeureEntretienCaserne;
window.creerPlanningEntretienCaserne = creerPlanningEntretienCaserne;
window.reserverCreneauEntretienCaserne = reserverCreneauEntretienCaserne;
window.annulerReservationEntretienCaserne = annulerReservationEntretienCaserne;
window.supprimerPlanningEntretienCaserne = supprimerPlanningEntretienCaserne;

window.afficherEspaceCaserne =
    afficherEspaceCaserne;

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

            /* =====================================================
               ESPACE CASERNE SUR PC
               Interface dédiée bordeaux, large et structurée.
               ===================================================== */
            body:not(.mode-connexion):has(.caserne-shell) {
                background:
                    radial-gradient(circle at 88% 8%, rgba(143,47,49,.14), transparent 28%),
                    linear-gradient(135deg, #160f10 0%, #211416 100%) !important;
            }

            body:not(.mode-connexion):has(.caserne-shell) #app {
                background: transparent !important;
            }

            body:not(.mode-connexion) .caserne-shell {
                width: auto !important;
                max-width: none !important;
                min-height: 100vh !important;
                margin: 0 !important;
                padding: 34px 42px 70px !important;
                box-sizing: border-box;
                background: transparent !important;
                color: #f7eeee !important;
            }

            body:not(.mode-connexion) .caserne-top {
                margin: 0 0 24px !important;
                padding: 24px 28px !important;
                border: 1px solid rgba(255,255,255,.08);
                border-radius: 16px !important;
                background: linear-gradient(135deg, #6c2022, #8a2b2d) !important;
                box-shadow: 0 16px 34px rgba(0,0,0,.20) !important;
            }

            body:not(.mode-connexion) .caserne-top h1 {
                margin: 7px 0 8px !important;
                font-size: 34px !important;
            }

            body:not(.mode-connexion) .caserne-top p {
                font-size: 13px;
            }

            body:not(.mode-connexion) .caserne-fil {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 16px !important;
            }

            body:not(.mode-connexion) .caserne-shell-actualites .caserne-fil,
            body:not(.mode-connexion) .caserne-entretiens-fil {
                grid-template-columns: minmax(0, 1fr);
                max-width: 1180px;
            }

            body:not(.mode-connexion) .caserne-actu-card,
            body:not(.mode-connexion) .caserne-entretien-card,
            body:not(.mode-connexion) .caserne-vide {
                border-radius: 12px !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .caserne-admin-bloc {
                max-width: 1180px;
                border: 1px solid rgba(255,255,255,.10) !important;
                border-radius: 14px !important;
                background: linear-gradient(180deg, #351719, #2a1113) !important;
                box-shadow: none !important;
            }

            body:not(.mode-connexion) .caserne-menu-grille,
            body:not(.mode-connexion) .caserne-admin-centre {
                max-width: 1180px;
                display: grid;
                grid-template-columns: repeat(3, minmax(220px, 1fr));
                gap: 14px;
            }

            body:not(.mode-connexion) .caserne-menu-grille button,
            body:not(.mode-connexion) .caserne-admin-centre button {
                min-height: 92px;
                border-radius: 12px !important;
            }

            body:not(.mode-connexion) .caserne-nav-bas {
                display: none !important;
            }

            #navigation-bureau.theme-caserne {
                background: linear-gradient(180deg, #441416 0%, #241012 100%);
                border-right-color: rgba(255,220,220,.10);
            }

            #navigation-bureau.theme-caserne .bureau-nav-separateur {
                color: #c99191;
            }

            #navigation-bureau.theme-caserne .bureau-nav-bouton {
                color: #ead2d2;
            }

            #navigation-bureau.theme-caserne .bureau-nav-bouton:hover {
                background: #5a1c1f;
                border-color: #74272a;
                color: #fff;
            }

            #navigation-bureau.theme-caserne .bureau-nav-bouton.actif {
                background: #742326;
                border-color: #96383b;
                color: #fff;
                box-shadow: inset 3px 0 0 #ffd7d7;
            }

            #navigation-bureau.theme-caserne .bureau-nav-sous-bouton {
                min-height: 35px;
                margin-left: 12px;
                padding-top: 6px;
                padding-bottom: 6px;
                font-size: 12px;
                font-weight: 650;
            }

            #navigation-bureau.theme-caserne .bureau-nav {
                overflow-y: auto;
                overflow-x: hidden;
                padding-right: 2px;
                scrollbar-width: thin;
            }

            #navigation-bureau.theme-caserne .bureau-nav-sous-bouton {
                width: calc(100% - 12px);
            }

            body:not(.mode-connexion) #app > .caserne-shell {
                width: auto !important;
                max-width: none !important;
                min-height: 100vh;
                margin: 0 !important;
                padding: 34px 42px 58px !important;
                box-sizing: border-box;
                background: #f4ebe8 !important;
            }

            body:not(.mode-connexion) #app > .caserne-shell .caserne-top {
                margin: 0 0 24px !important;
                padding: 28px 32px !important;
                border-radius: 18px !important;
            }

            body:not(.mode-connexion) #app > .caserne-shell .caserne-fil,
            body:not(.mode-connexion) #app > .caserne-shell .caserne-passes-au-dessus,
            body:not(.mode-connexion) #app > .caserne-shell .caserne-fil-actuel {
                width: 100%;
                max-width: 1180px;
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

    installerHistoriqueNavigationApplication();

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

    if (document.querySelector("#app .caserne-shell")) {
        if (titre.includes("actualités")) return "caserne-actualites";
        if (titre === "sport" || titre.includes("séance de sport")) return "caserne-sport";
        if (titre.includes("manœuvre")) return "caserne-manoeuvre";
        if (titre.includes("casernement")) return "caserne-casernement";
        if (titre.includes("réunion")) return "caserne-reunion";
        if (titre.includes("amical")) return "caserne-amical";
        if (titre.includes("comité de centre")) return "caserne-comite_centre";
        if (titre.includes("administratif")) return "caserne-administratif";
        if (titre.includes("entretien individuel")) return "caserne-entretien_individuel";
        if (titre === "menu") return "caserne-menu";
        return "caserne-actualites";
    }

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

    const modeCaserne = Boolean(document.querySelector("#app .caserne-shell"));
    const modePortail = Boolean(document.querySelector("#app .portail-cis-page"));
    navigation.classList.toggle("theme-caserne", modeCaserne);

    if (modePortail) {
        navigation.classList.remove("theme-caserne");
        navigation.innerHTML = `
            <div class="bureau-marque">
                <img class="bureau-logo" src="./logo-version-pc.png" alt="Logo">
            </div>
            <nav class="bureau-nav" aria-label="Navigation générale">
                ${bouton("accueil-general", "Accueil général", "afficherPortailPrincipal()", true)}
                <div class="bureau-nav-separateur">Espaces</div>
                ${bouton("caserne-actualites", "Espace Caserne", "afficherEspaceCaserne()", utilisateurAPermission("acces_espace_caserne") || utilisateurEstSPVAdmin())}
                ${bouton("pharmacie", "Espace Pharmacie", "afficherAccueil()", true)}
            </nav>
            <div class="bureau-utilisateur">
                <button type="button" class="bureau-profil" onclick="ouvrirProfilDepuisPageCourante()">
                    <strong>${echapperHTML(obtenirNomUtilisateurAffiche())}</strong>
                    <small>${echapperHTML(role?.nom || "")}</small>
                </button>
            </div>
        `;
        return;
    }

    if (modeCaserne) {
        const rubriques = obtenirRubriquesCaserne().filter(utilisateurPeutVoirRubriqueCaserne);
        const boutonRubrique = (id, libelle) => bouton(
            `caserne-${id}`,
            libelle,
            `afficherRubriqueCaserne('${id}')`,
            true,
            "bureau-nav-sous-bouton"
        );

        const groupe = (titreGroupe, ids) => {
            const contenu = ids
                .map(id => rubriques.find(r => r[0] === id))
                .filter(Boolean)
                .map(r => boutonRubrique(r[0], r[1]))
                .join("");
            return contenu ? `<div class="bureau-nav-separateur">${echapperHTML(titreGroupe)}</div>${contenu}` : "";
        };

        navigation.innerHTML = `
            <div class="bureau-marque">
                <img class="bureau-logo" src="./logo-version-pc.png" alt="Logo">
            </div>
            <nav class="bureau-nav" aria-label="Navigation Espace Caserne">
                ${bouton("accueil-general", "Accueil général", "afficherPortailPrincipal()")}
                ${bouton("caserne-actualites", "Actualités", "afficherActualitesCaserne()")}
                ${groupe("Activités", ["sport","manoeuvre","casernement"])}
                ${groupe("Vie de la caserne", ["reunion","amical","comite_centre"])}
                ${groupe("Personnel", ["entretien_individuel"])}
                ${groupe("Gestion", ["administratif"])}
                <div class="bureau-nav-separateur">Autres espaces</div>
                ${bouton("pharmacie", "Espace Pharmacie", "afficherAccueil()")}
            </nav>
            <div class="bureau-utilisateur">
                <button type="button" class="bureau-profil ${actif === "profil" ? "actif" : ""}" onclick="ouvrirProfilDepuisPageCourante()">
                    <strong>${echapperHTML(obtenirNomUtilisateurAffiche())}</strong>
                    <small>${echapperHTML(role?.nom || "")}</small>
                </button>
            </div>
        `;
        return;
    }

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
                "accueil-general",
                "Accueil général",
                "afficherPortailPrincipal()"
            )}

            <div class="bureau-nav-separateur">Espace Pharmacie</div>

            ${bouton(
                "accueil",
                "Accueil Pharmacie",
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
                onclick="ouvrirProfilDepuisPageCourante()"
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
