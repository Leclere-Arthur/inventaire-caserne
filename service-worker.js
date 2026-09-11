"use strict";

/* =========================================================
   INVENTAIRE CASERNE
   SERVICE WORKER
   MODE HORS CONNEXION
   ========================================================= */


/*
 * VERSION DU CACHE
 *
 * On passe à V4 pour forcer l'iPhone et l'iPad
 * à récupérer le nouvel app.js.
 */

const CACHE_NAME = "inventaire-caserne-v64";


/*
 * Fichiers nécessaires au fonctionnement
 * de l'application hors connexion.
 */

const FICHIERS_APPLICATION = [

    "./",

    "./index.html",

    "./app.js",

    "./style.css",

    "./manifest.json",

    "./supabase-config.js",

    "./icon-192.png",

    "./icon-512.png",

    "./apple-touch-icon.png",

    "./fond-connexion.png",

    "./fond-connexion-pc.png",

    "./logo-version-pc.png"

];


/* =========================================================
   INSTALLATION
   ========================================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "Installation du Service Worker V58..."
        );


        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    function (cache) {

                        console.log(
                            "Mise en cache de l'application..."
                        );


                        return Promise.all(
                            FICHIERS_APPLICATION.map(
                                async function (fichier) {

                                    const requete =
                                        new Request(
                                            fichier,
                                            {
                                                cache:
                                                    "reload"
                                            }
                                        );

                                    const reponse =
                                        await fetch(
                                            requete
                                        );

                                    if (
                                        !reponse ||
                                        !reponse.ok
                                    ) {
                                        throw new Error(
                                            "Impossible de mettre à jour : " +
                                            fichier
                                        );
                                    }

                                    await cache.put(
                                        fichier,
                                        reponse.clone()
                                    );

                                }
                            )
                        );

                    }
                )
        );

    }
);



/* =========================================================
   ACTIVATION MANUELLE D'UNE MISE À JOUR
   ========================================================= */

self.addEventListener(
    "message",
    function (event) {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* =========================================================
   ACTIVATION
   ========================================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "Activation du Service Worker V58..."
        );


        event.waitUntil(

            caches
                .keys()
                .then(
                    function (nomsCaches) {

                        return Promise.all(

                            nomsCaches
                                .filter(
                                    function (nom) {

                                        return (
                                            nom !==
                                            CACHE_NAME
                                        );

                                    }
                                )
                                .map(
                                    function (nom) {

                                        console.log(
                                            "Suppression ancien cache :",
                                            nom
                                        );


                                        return caches.delete(
                                            nom
                                        );

                                    }
                                )

                        );

                    }
                )
                .then(
                    function () {

                        /*
                         * Prend immédiatement le contrôle
                         * des pages ouvertes.
                         */

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* =========================================================
   REQUETES
   ========================================================= */



/* =========================================================
   NOTIFICATIONS WEB PUSH
   Compatible Android + PWA iPhone/iPad
   ========================================================= */

self.addEventListener(
    "push",
    function (event) {

        let donnees = {};

        try {

            donnees =
                event.data
                    ? event.data.json()
                    : {};

        } catch (erreur) {

            donnees = {
                body:
                    event.data
                        ? event.data.text()
                        : ""
            };

        }


        const titre =
            donnees.title ||
            "Inventaire Caserne";

        const options = {
            body:
                donnees.body ||
                "Nouvelle notification",
            icon:
                donnees.icon ||
                "./icon-192.png",
            badge:
                donnees.badge ||
                "./icon-192.png",
            data: {
                url:
                    donnees.url ||
                    "./"
            }
        };


        event.waitUntil(
            self.registration
                .showNotification(
                    titre,
                    options
                )
        );

    }
);


self.addEventListener(
    "notificationclick",
    function (event) {

        event.notification.close();

        const urlCible =
            new URL(
                event.notification
                    .data?.url ||
                "./",
                self.location.origin
            ).href;


        event.waitUntil(

            clients
                .matchAll({
                    type: "window",
                    includeUncontrolled: true
                })
                .then(
                    function (fenetres) {

                        for (
                            const fenetre
                            of fenetres
                        ) {

                            if (
                                "focus" in fenetre
                            ) {

                                try {

                                    const urlFenetre =
                                        new URL(
                                            fenetre.url
                                        );

                                    const urlNotification =
                                        new URL(
                                            urlCible
                                        );


                                    if (
                                        urlFenetre.origin ===
                                        urlNotification.origin
                                    ) {

                                        return fenetre.focus();

                                    }

                                } catch (_) {
                                    // On continue.
                                }

                            }

                        }


                        if (
                            clients.openWindow
                        ) {

                            return clients.openWindow(
                                urlCible
                            );

                        }

                    }
                )

        );

    }
);


self.addEventListener(
    "fetch",
    function (event) {

        /*
         * On ne traite que les requêtes GET.
         */
        if (
            event.request.method !==
            "GET"
        ) {
            return;
        }


        const url =
            new URL(
                event.request.url
            );


        /*
         * IMPORTANT :
         * on ne met JAMAIS en cache les requêtes vers
         * Supabase, le CDN JavaScript ou un autre domaine.
         *
         * Ainsi les stocks, interventions et consommations
         * sont toujours lus directement depuis Supabase.
         */
        if (
            url.origin !==
            self.location.origin
        ) {
            return;
        }


        event.respondWith(

            fetch(
                new Request(
                    event.request,
                    {
                        cache:
                            "no-store"
                    }
                )
            )
                .then(
                    async function (
                        reponseReseau
                    ) {

                        if (
                            reponseReseau &&
                            reponseReseau.status === 200 &&
                            reponseReseau.type !== "opaque"
                        ) {

                            const cache =
                                await caches.open(
                                    CACHE_NAME
                                );

                            await cache.put(
                                event.request,
                                reponseReseau.clone()
                            );

                        }

                        return reponseReseau;

                    }
                )
                .catch(
                    async function () {

                        const reponseCache =
                            await caches.match(
                                event.request
                            );

                        if (
                            reponseCache
                        ) {
                            return reponseCache;
                        }

                        if (
                            event.request.mode ===
                            "navigate"
                        ) {
                            return caches.match(
                                "./index.html"
                            );
                        }

                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText:
                                    "Hors connexion"
                            }
                        );

                    }
                )

        );

    }
);
