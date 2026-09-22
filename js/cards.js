/* ============================================================
   MeraDhobi: Interactive cards
   1. Service cards expand on click; siblings stay compact.
   2. Fabric cards reveal a care tip; one open at a time.
   3. FAQ accordion; opening one closes the others.
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

    /* Fabric cards: click to reveal a care tip. */
    setupTogglingCards(".fabric-card", "active", ".fabric-grid");

    /* ---- Photo deck (home page problem section) ---------------
       The fan opens on hover/focus through CSS; this class toggle gives
       touch devices an explicit open/close and lets Escape fold the deck. */
    const problemDeck = document.querySelector(".problem-deck");
    if (problemDeck) {
        problemDeck.querySelectorAll(".deck-card").forEach(function (card) {
            card.addEventListener("click", function () {
                problemDeck.classList.toggle("is-open");
            });
        });

        // A tap anywhere outside the deck folds it back.
        document.addEventListener("click", function (event) {
            if (!problemDeck.contains(event.target)) {
                problemDeck.classList.remove("is-open");
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") problemDeck.classList.remove("is-open");
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
