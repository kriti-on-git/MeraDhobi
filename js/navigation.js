/* ============================================================
   MeraDhobi: Navigation
   1. Sticky header gains an opaque, compact state after scrolling.
   2. Mobile drawer opens/closes via the hamburger button.
   3. The link matching the current page is marked active.
   ============================================================ */

(function () {
    "use strict";

    const header = document.querySelector(".site-header");
    const toggleButton = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navAnchors = navLinks ? Array.from(navLinks.querySelectorAll("a")) : [];

    /* ---- Sticky header state -------------------------------- */
    // A small threshold keeps the header calm instead of flickering
    // between states during the first pixels of scrolling.
    function updateHeaderState() {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 24);
    }

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    /* ---- Mobile drawer -------------------------------------- */
    function setMenuOpen(open) {
        if (!navLinks || !toggleButton) return;
        navLinks.classList.toggle("open", open);
        toggleButton.setAttribute("aria-expanded", String(open));
    }

    if (toggleButton && navLinks) {
        toggleButton.addEventListener("click", function () {
            const isOpen = navLinks.classList.contains("open");
            setMenuOpen(!isOpen);
        });

        // Close the drawer after choosing a destination.
        navAnchors.forEach(function (anchor) {
            anchor.addEventListener("click", function () {
                setMenuOpen(false);
            });
        });

        // Close when tapping outside the drawer.
        document.addEventListener("click", function (event) {
            if (!navLinks.classList.contains("open")) return;
            if (event.target instanceof Node &&
                !navLinks.contains(event.target) &&
                !toggleButton.contains(event.target)) {
                setMenuOpen(false);
            }
        });

        // Escape key closes the drawer and returns focus to the toggle.
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && navLinks.classList.contains("open")) {
                setMenuOpen(false);
                toggleButton.focus();
            }
        });
    }

    /* ---- Active page highlighting ---------------------------- */
    // Compares the last path segment (e.g. "pricing.html") so the
    // same markup works from any directory depth.
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    navAnchors.forEach(function (anchor) {
        const targetPage = anchor.getAttribute("href").split("/").pop();
        if (targetPage === currentPage) {
            anchor.classList.add("active");
            anchor.setAttribute("aria-current", "page");
        }
    });
})();
