/* ============================================================
   MeraDhobi: Interactive cards
   1. Service cards expand on click; siblings stay compact.
   2. Fabric cards reveal a care tip; one open at a time.
   3. FAQ accordion; opening one closes the others.
   4. Content-photo 3D tilt that follows the pointer.
   5. Value deck (about): tap to fan open/close.
   All three use the same accessible pattern: real <button>
   controls + aria-expanded + CSS class toggling.
   ============================================================ */

(function () {
    "use strict";

    /* Shared helper: expand/collapse one card within its group. */
    function activateExclusive(card, groupSelector, activeClass) {
        const wasActive = card.classList.contains(activeClass);
        document.querySelectorAll(groupSelector).forEach(function (sibling) {
            sibling.classList.remove(activeClass);
            sibling.setAttribute("aria-expanded", "false");
        });
        if (!wasActive) {
            card.classList.add(activeClass);
            card.setAttribute("aria-expanded", "true");
        }
    }

    function setupTogglingCards(cardSelector, activeClass, groupClass) {
        const cards = document.querySelectorAll(cardSelector);
        if (cards.length === 0) return;

        cards.forEach(function (card) {
            card.setAttribute("aria-expanded", "false");

            card.addEventListener("click", function (event) {
                // Let links/buttons INSIDE the card behave normally,
                // but never treat the card itself as an inner control
                // (fabric cards are <button> elements).
                const innerControl = event.target.closest("a, button");
                if (innerControl && innerControl !== card) return;
                activateExclusive(card, cardSelector, activeClass);
            });

            // Keyboard support: Enter/Space activates, Escape collapses.
            card.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activateExclusive(card, cardSelector, activeClass);
                }
                if (event.key === "Escape") {
                    card.classList.remove(activeClass);
                    card.setAttribute("aria-expanded", "false");
                }
            });
        });

        // Dim siblings only while one card is open.
        const grid = cards[0].closest(groupClass);
        if (grid) {
            const observer = new MutationObserver(function () {
                const anyActive = Array.from(cards).some(function (c) {
                    return c.classList.contains(activeClass);
                });
                grid.classList.toggle("has-active", anyActive);
            });
            observer.observe(grid, { subtree: true, attributes: true, attributeFilter: ["class"] });
        }
    }

    /* Service cards: click to reveal turnaround + garment list. */
    setupTogglingCards(".service-card", "active", ".services-grid");

    /* Fabric flip cards: click toggles the 3D flip (hover handles it on
       pointer devices; this gives touch users the same reveal). */
    document.querySelectorAll(".fabric-flip").forEach(function (card) {
        card.setAttribute("aria-pressed", "false");

        card.addEventListener("click", function () {
            const flipped = card.classList.toggle("flipped");
            card.setAttribute("aria-pressed", String(flipped));
        });
    });

    /* ---- Content photos: pointer-follow 3D tilt (all pages) ----
       CSS owns the resting state and the hover fallback (fixed tilt),
       this handler refines the tilt so each image leans toward the
       cursor. Guarded for reduced motion and touch-only devices. */
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const MAX_TILT = 6; // degrees

        document.querySelectorAll(".photo-frame img, .route-photo img").forEach(function (photo) {
            photo.addEventListener("mousemove", function (event) {
                const rect = photo.getBoundingClientRect();
                const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
                const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

                photo.style.setProperty("--tilt-y", (relativeX * MAX_TILT * 2).toFixed(2) + "deg");
                photo.style.setProperty("--tilt-x", (-relativeY * MAX_TILT * 2).toFixed(2) + "deg");
            });

            photo.addEventListener("mouseleave", function () {
                // Return to the fixed fallback tilt while still hovered via CSS.
                photo.style.removeProperty("--tilt-y");
                photo.style.removeProperty("--tilt-x");
            });
        });
    }

    /* ---- FAQ accordion --------------------------------------- */
    const faqItems = document.querySelectorAll(".faq-item");
    if (faqItems.length > 0) {
        faqItems.forEach(function (item) {
            const questionButton = item.querySelector(".faq-question");
            if (!questionButton) return;

            questionButton.addEventListener("click", function () {
                const isOpen = item.classList.contains("open");

                faqItems.forEach(function (other) {
                    other.classList.remove("open");
                    other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
                });

                if (!isOpen) {
                    item.classList.add("open");
                    questionButton.setAttribute("aria-expanded", "true");
                }
            });
        });
    }
})();
