/* ============================================================
   MeraDhobi: Shared bootstrap
   Page-level glue that is reused on every page of the site.
   ============================================================ */

(function () {
    "use strict";

    /* Keep the copyright year current without editing each page. */
    const yearSlots = document.querySelectorAll("[data-current-year]");
    yearSlots.forEach(function (slot) {
        slot.textContent = String(new Date().getFullYear());
    });
})();
