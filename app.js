"use strict";

/* =========================================================
   INVENTAIRE CASERNE
   APP.JS COMPLET
   ========================================================= */

const CODE_ADMIN = "1234";

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

    materielsV3: "materiels_v3",
    categoriesV3: "categories_v3",
    historiqueV3: "historique_v3"
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

let consommationsEnCours = {};
let materielEnModification = null;

let validationRetourInterventionEnCours = false;


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    initialiserIndicateurSynchronisation();
    initialiserBandeauConnexion();
    initialiserBoutonNotifications();

    chargerToutesLesDonnees();

    connecterBoutonsAccueil();

    await initialiserSynchronisationSupabase();

    afficherAccueil();

});


function chargerToutesLesDonnees() {

    chargerMateriels();
    chargerCategories();
    chargerHistorique();

    normaliserToutesLesDonnees();

    sauvegarderToutesLesDonnees();

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
                            "Inventaire Caserne"
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
            "📱 Sur iPhone/iPad, ouvre Inventaire Caserne depuis l’icône ajoutée à l’écran d’accueil pour activer les notifications."
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

    if (
        document.getElementById(
            "btn-notifications-push"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");

    style.textContent = `
        #btn-notifications-push {
            position: fixed;
            top: calc(
                12px + env(safe-area-inset-top, 0px)
            );
            right: 72px;
            z-index: 10020;
            width: 46px;
            height: 46px;
            border: 0;
            border-radius: 999px;
            background: #ffffff;
            box-shadow:
                0 4px 14px
                rgba(0, 0, 0, 0.14);
            font-size: 23px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-tap-highlight-color:
                transparent;
        }

        #btn-notifications-push:disabled {
            opacity: 0.65;
            cursor: default;
        }

        #btn-notifications-push[hidden] {
            display: none !important;
        }
    `;

    document.head.appendChild(style);


    const bouton =
        document.createElement("button");

    bouton.id =
        "btn-notifications-push";

    bouton.type =
        "button";

    bouton.textContent =
        "🔔";

    bouton.title =
        "Activer les notifications";

    bouton.setAttribute(
        "aria-label",
        "Activer les notifications"
    );


    bouton.addEventListener(
        "click",
        activerNotificationsPush
    );


    document.body.appendChild(
        bouton
    );


    window.addEventListener(
        "online",
        function () {
            void envoyerNotificationsStockEnAttente();
        }
    );


    if (navigator.onLine) {
        void envoyerNotificationsStockEnAttente();
    }


    rafraichirEtatBoutonNotifications();

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
            genererId(),

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

        alert(
            "⚠️ La synchronisation n'a pas pu être effectuée."
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

        return;
    }


    const supabase =
        await assurerBibliothequeSupabaseDisponible();

    if (!supabase) {

        console.log(
            "⚠️ Supabase n'est pas encore joignable. La modification reste enregistrée localement."
        );

        return;

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

    } catch (erreur) {

        console.warn(
            "⚠️ La modification reste enregistrée localement et sera renvoyée plus tard.",
            erreur
        );

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
                interventions: []
            };
        }

        const valeur = JSON.parse(texte);

        return {
            materiels: Array.isArray(valeur.materiels) ? valeur.materiels : [],
            categories: Array.isArray(valeur.categories) ? valeur.categories : [],
            interventions: Array.isArray(valeur.interventions) ? valeur.interventions : []
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
            .select("id,date,numero"),
        supabase
            .from("consommations")
            .select("id,intervention_id,materiel_id,materiel_nom,quantite")
    ]);

    resultats.forEach(function (resultat) {
        if (resultat.error) {
            throw resultat.error;
        }
    });

    return {
        categories: resultats[0].data || [],
        materiels: resultats[1].data || [],
        materielCategories: resultats[2].data || [],
        interventions: resultats[3].data || [],
        consommations: resultats[4].data || []
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
            consommations:
                consommationsParIntervention.get(
                    String(intervention.id)
                ) || []
        };

    });

    return {
        categories: donnees.categories
            .map(function (categorie) {
                return String(categorie.nom || "").trim();
            })
            .filter(Boolean),
        materiels: materielsApplication,
        historique: historiqueApplication
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

    if (correspondanceMateriels.size || correspondanceInterventions.size) {
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

    const lignesInterventions = historique.map(function (intervention) {

        return {
            id: String(intervention.id),
            date: String(intervention.date || aujourdHui()),
            numero: String(intervention.numeroIntervention || "")
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

    return (
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)
    );

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

    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <header class="accueil-header">

                <h1>
                    🚒 Inventaire Caserne
                </h1>

                <p>
                    Gestion du matériel
                </p>

            </header>


            <section class="menu-principal">

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


                <button
                    class="menu-button"
                    type="button"
                    onclick="
                        afficherRetourIntervention()
                    "
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


                <button
                    class="menu-button"
                    type="button"
                    onclick="
                        afficherHistorique()
                    "
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


                <button
                    class="menu-button"
                    type="button"
                    onclick="
                        ouvrirAdministration()
                    "
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

            </section>

        </main>

    `;

}


/* =========================================================
   INVENTAIRE
   ========================================================= */

async function afficherInventaire() {

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


            <h2>
                📦 Inventaire
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

        <article
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

        </article>

    `;

}


/* =========================================================
   RETOUR D'INTERVENTION
   ========================================================= */

async function afficherRetourIntervention() {

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


            <h2>
                🚒 Retour d'intervention
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
        consommationsEnCours[id]
        ||
        0;


    return `

        <div class="materiel">

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


            <div class="quantite-controle">

                <button
                    type="button"
                    onclick="
                        diminuerConsommation('${id}')
                    "
                >
                    −
                </button>


                <strong id="quantite-retour-${id}">
                    ${quantite}
                </strong>


                <button
                    type="button"
                    onclick="
                        augmenterConsommation('${id}')
                    "
                >
                    +
                </button>

            </div>

        </div>

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


    element.textContent =
        String(
            consommationsEnCours[cle]
            ||
            0
        );

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
        !confirm(
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
            genererId(),

        date:
            date,

        numeroIntervention:
            numero,

        consommations:
            consommations,

        synchronisationEnAttente:
            !navigator.onLine

    });


    sauvegarderToutesLesDonnees();


    consommationsEnCours = {};


    try {

        await synchroniserApresModification();

        alert(
            navigator.onLine
                ? "✅ Retour d'intervention enregistré !"
                : "✅ Retour enregistré hors connexion. Il sera synchronisé plus tard."
        );

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

    await synchroniserAvantNavigation();

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
                📊 Historique
            </h2>


            <h3>
                📦 Total consommé par matériel
            </h3>


            <div
                id="historique-total"
            ></div>


            <h3
                class="titre-interventions"
            >
                🚒 Historique des interventions
            </h3>


            <div
                id="historique-interventions"
            ></div>

        </main>

    `;


    afficherHistoriqueTotal();

    afficherHistoriqueInterventions();

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

function afficherDetailIntervention(
    interventionId
) {

    const intervention =
        historique.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(interventionId)
                );

            }
        );


    if (!intervention) {

        alert(
            "Intervention introuvable."
        );

        return;

    }


    let html = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherHistorique()"
            >
                ← Retour
            </button>


            <h2>
                🚒 Détail de l'intervention
            </h2>


            <div
                class="detail-header"
            >

                <strong>
                    Intervention
                    ${echapperHTML(
                        intervention.numeroIntervention
                    )}
                </strong>


                <span>
                    Date :
                    ${formaterDate(
                        intervention.date
                    )}
                </span>

            </div>


            <h3>
                📦 Matériel utilisé
            </h3>

    `;


    if (
        !Array.isArray(
            intervention.consommations
        )
        ||
        intervention.consommations.length === 0
    ) {

        html += `

            <div class="materiel">

                Aucun matériel enregistré
                pour cette intervention.

            </div>

        `;

    } else {

        intervention.consommations.forEach(
            function (consommation) {

                const materiel =
                    materiels.find(
                        function (m) {

                            return (
                                String(m.id) ===
                                String(
                                    consommation.materielId
                                )
                            );

                        }
                    );


                const stockMinimum =
                    materiel &&
                    materiel.minimum > 0 &&
                    materiel.stock <=
                    materiel.minimum;


                html += `

                    <div
                        class="
                            detail-historique
                            ${
                                stockMinimum
                                ?
                                "detail-stock-faible"
                                :
                                ""
                            }
                        "
                    >

                        <div>

                            <strong>
                                ${echapperHTML(
                                    consommation.materiel
                                )}
                            </strong>


                            ${
                                materiel
                                ?
                                `
                                <span>
                                    Stock actuel :
                                    ${materiel.stock}
                                </span>
                                `
                                :
                                ""
                            }

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
                            ${consommation.quantite}
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
   ADMINISTRATION
   ========================================================= */

async function ouvrirAdministration() {

    await synchroniserAvantNavigation();

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
                🔐 Administration
            </h2>


            <div
                class="formulaire"
            >

                <label>
                    Code administrateur
                </label>


                <input
                    type="password"
                    id="code-admin"
                    placeholder="Entrez le code"
                    inputmode="numeric"
                >


                <button
                    class="add-button"
                    onclick="verifierCodeAdmin()"
                >
                    🔓 Accéder
                </button>

            </div>

        </main>

    `;


    const champ =
        document.getElementById(
            "code-admin"
        );


    if (champ) {

        champ.focus();


        champ.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    verifierCodeAdmin();

                }

            }
        );

    }

}


function verifierCodeAdmin() {

    const champ =
        document.getElementById(
            "code-admin"
        );


    if (!champ) {

        return;

    }


    if (
        champ.value ===
        CODE_ADMIN
    ) {

        afficherMenuAdministration();

    } else {

        alert(
            "❌ Code administrateur incorrect."
        );


        champ.value =
            "";


        champ.focus();

    }

}


/* =========================================================
   MENU ADMINISTRATION
   ========================================================= */

function afficherMenuAdministration() {

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
                ⚙️ Administration
            </h2>


            <div
                class="menu-administration"
            >

                <button
                    class="menu-button"
                    onclick="ajouterMateriel()"
                >

                    <span class="menu-icon">
                        ➕
                    </span>

                    <span>

                        <strong>
                            Ajouter du matériel
                        </strong>

                        <small>
                            Créer un nouvel article
                        </small>

                    </span>

                </button>


                <button
                    class="menu-button"
                    onclick="gestionMateriels()"
                >

                    <span class="menu-icon">
                        📦
                    </span>

                    <span>

                        <strong>
                            Gestion du matériel
                        </strong>

                        <small>
                            Modifier ou supprimer
                        </small>

                    </span>

                </button>


                <button
                    class="menu-button"
                    onclick="gestionCategories()"
                >

                    <span class="menu-icon">
                        📂
                    </span>

                    <span>

                        <strong>
                            Gestion des catégories
                        </strong>

                        <small>
                            Créer, modifier ou supprimer
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


                <button
                    class="menu-button"
                    onclick="remiseZeroHistorique()"
                >

                    <span class="menu-icon">
                        🗑️
                    </span>

                    <span>

                        <strong>
                            Remise à zéro de l'historique
                        </strong>

                        <small>
                            Supprimer les consommations
                        </small>

                    </span>

                </button>

            </div>

        </main>

    `;

}


/* =========================================================
   NOTIFICATIONS MANUELLES - ADMINISTRATION
   ========================================================= */

function afficherNotificationsAdministration() {

    document.getElementById(
        "app"
    ).innerHTML = `

        <main class="page">

            <button
                class="retour-button"
                onclick="afficherMenuAdministration()"
            >
                ← Retour
            </button>


            <h2>
                🔔 Envoyer une notification
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
        !confirm(
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
                "Inventaire Caserne",
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


            <h2>
                📦 Gestion du matériel
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
            genererId(),

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


function ajouterCategorie() {

    const nom =
        prompt(
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


function modifierCategorie(
    ancienNom
) {

    const nouveauNom =
        prompt(
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


function supprimerCategorie(
    nom
) {

    if (
        !confirm(
            "Voulez-vous supprimer « " +
            nom +
            " » ?"
        )
    ) {

        return;

    }


    const code =
        prompt(
            "Code administrateur :"
        );


    if (
        code !==
        CODE_ADMIN
    ) {

        alert(
            "❌ Code administrateur incorrect."
        );

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


    const valeur =
        prompt(
            "Nouveau stock pour " +
            materiel.nom +
            " :",
            materiel.stock
        );


    if (
        valeur === null
    ) {

        return;

    }


    const stock =
        Number(
            valeur
        );


    if (
        !Number.isFinite(stock)
        ||
        stock < 0
    ) {

        alert(
            "Stock invalide."
        );

        return;

    }


    const ancienStock =
        Number(
            materiel.stock
        );


    materiel.stock =
        Math.floor(
            stock
        );


    preparerNotificationStock(
        materiel,
        ancienStock
    );


    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


    alert(
        "✅ Stock modifié."
    );


    gestionMateriels();

}


/* =========================================================
   SUPPRESSION MATERIEL
   ========================================================= */

function supprimerMateriel(
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


    if (
        !confirm(
            "Voulez-vous supprimer « " +
            materiel.nom +
            " » ?"
        )
    ) {

        return;

    }


    const code =
        prompt(
            "Code administrateur :"
        );


    if (
        code !==
        CODE_ADMIN
    ) {

        alert(
            "❌ Code administrateur incorrect."
        );

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

function remiseZeroHistorique() {

    if (
        historique.length === 0
    ) {

        alert(
            "L'historique est déjà vide."
        );

        return;

    }


    if (
        !confirm(
            "Voulez-vous supprimer tout l'historique des consommations ?"
        )
    ) {

        return;

    }


    if (
        !confirm(
            "⚠️ ATTENTION\n\n" +
            "Toutes les consommations seront supprimées définitivement.\n\n" +
            "Le matériel et les stocks ne seront pas supprimés.\n\n" +
            "Continuer ?"
        )
    ) {

        return;

    }


    const code =
        prompt(
            "Code administrateur :"
        );


    if (
        code !==
        CODE_ADMIN
    ) {

        alert(
            "❌ Code administrateur incorrect."
        );

        return;

    }


    historique = [];


    sauvegarderToutesLesDonnees();

    void synchroniserApresModification();


    alert(
        "✅ Historique supprimé."
    );


    afficherMenuAdministration();

}


/* =========================================================
   FONCTIONS GLOBALES
   ========================================================= */

window.afficherAccueil =
    afficherAccueil;

window.afficherInventaire =
    afficherInventaire;

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

window.afficherHistorique =
    afficherHistorique;

window.afficherDetailConsommation =
    afficherDetailConsommation;

window.afficherDetailIntervention =
    afficherDetailIntervention;

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