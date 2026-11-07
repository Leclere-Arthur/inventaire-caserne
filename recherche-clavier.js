/* Les recherches restent instantanées. La touche Rechercher termine la saisie. */
(function () {
    "use strict";
    if (!/Android/i.test(navigator.userAgent)) return;
    const selecteur = 'input[type="search"], input[id*="recherche"], input.reappro-recherche';
    function estRecherche(element) { return element && element.matches && element.matches(selecteur); }
    function preparer(element) {
        if (estRecherche(element)) element.setAttribute("enterkeyhint", "search");
    }
    document.querySelectorAll(selecteur).forEach(preparer);
    new MutationObserver(changements => changements.forEach(changement => {
        changement.addedNodes.forEach(noeud => {
            preparer(noeud);
            if (noeud.querySelectorAll) noeud.querySelectorAll(selecteur).forEach(preparer);
        });
    })).observe(document.documentElement, {childList:true,subtree:true});
    document.addEventListener("focusin", event => preparer(event.target));
    document.addEventListener("keydown", event => {
        if (!estRecherche(event.target) || event.key !== "Enter" || event.isComposing || event.keyCode === 229) return;
        event.preventDefault();
        event.target.blur();
    }, true);
    document.addEventListener("search", event => {
        if (estRecherche(event.target)) event.target.blur();
    }, true);
    function fermerHorsChamp(event) {
        const champ = document.activeElement;
        if (!estRecherche(champ) || !event.target || event.target === champ) return;
        // Laisser le navigateur déplacer naturellement le focus vers un autre champ.
        if (event.target.closest && event.target.closest('input, textarea, select, [contenteditable="true"], label')) return;
        champ.blur();
    }
    document.addEventListener(window.PointerEvent ? "pointerdown" : "touchstart", fermerHorsChamp, {capture:true,passive:true});
})();
