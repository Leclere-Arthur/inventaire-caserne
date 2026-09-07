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
    "inventaire-caserne-v4";


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
            "Installation du Service Worker V4..."
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
            "Activation du Service Worker V4..."
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


        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(
                    function (reponseCache) {

                        /*
                         * Si la ressource est déjà
                         * en cache, on la retourne.
                         */

                        if (
                            reponseCache
                        ) {

                            return reponseCache;

                        }


                        /*
                         * Sinon, on essaie le réseau.
                         */

                        return fetch(
                            event.request
                        )
                            .then(
                                function (reponseReseau) {

                                    /*
                                     * Si la réponse est correcte,
                                     * on la garde dans le cache.
                                     */

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

                                    /*
                                     * Sans Internet, lors d'une
                                     * navigation, on retourne
                                     * la page principale.
                                     */

                                    if (
                                        event.request.mode ===
                                        "navigate"
                                    ) {

                                        return caches.match(
                                            "./index.html"
                                        );

                                    }


                                    /*
                                     * Pour les autres ressources,
                                     * on renvoie une erreur hors ligne.
                                     */

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