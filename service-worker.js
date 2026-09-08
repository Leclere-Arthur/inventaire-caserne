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

const CACHE_NAME =
    "inventaire-caserne-v9";


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

    "./apple-touch-icon.png"

];


/* =========================================================
   INSTALLATION
   ========================================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "Installation du Service Worker V9..."
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


                        return cache.addAll(
                            FICHIERS_APPLICATION
                        );

                    }
                )
                .then(
                    function () {

                        /*
                         * Active immédiatement
                         * cette nouvelle version.
                         */

                        return self.skipWaiting();

                    }
                )

        );

    }
);


/* =========================================================
   ACTIVATION
   ========================================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "Activation du Service Worker V9..."
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

            caches
                .match(
                    event.request
                )
                .then(
                    function (reponseCache) {

                        /*
                         * Pour les fichiers locaux de l'application,
                         * on peut utiliser le cache hors connexion.
                         */
                        if (
                            reponseCache
                        ) {
                            return reponseCache;
                        }


                        return fetch(
                            event.request
                        )
                            .then(
                                function (reponseReseau) {

                                    if (
                                        reponseReseau &&
                                        reponseReseau.status ===
                                        200 &&
                                        reponseReseau.type !==
                                        "opaque"
                                    ) {

                                        const copie =
                                            reponseReseau.clone();


                                        caches
                                            .open(
                                                CACHE_NAME
                                            )
                                            .then(
                                                function (cache) {

                                                    cache.put(
                                                        event.request,
                                                        copie
                                                    );

                                                }
                                            );

                                    }


                                    return reponseReseau;

                                }
                            )
                            .catch(
                                function () {

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
                            );

                    }
                )

        );

    }
);
