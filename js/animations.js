/* ============================================================
   MeraDhobi: Scroll animations
   1. IntersectionObserver-driven reveal for .reveal / .reveal-stagger.
   2. One shared rAF loop for parallax layers and the hero scroll
      transition (cheaper than doing work inside scroll events).
   3. Honours prefers-reduced-motion by disabling transforms.
   ============================================================ */

(function () {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- 1. Scroll reveal ------------------------------------ */
    const revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");

    // Assign stagger indices once so children cascade in order.
    document.querySelectorAll(".reveal-stagger").forEach(function (group) {
        group.querySelectorAll(".reveal-child").forEach(function (child, index) {
            child.style.setProperty("--reveal-index", String(index));
        });
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        // No motion: everything is simply visible.
        revealTargets.forEach(function (target) {
            target.classList.add("revealed");
        });
    } else if (revealTargets.length > 0) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        revealTargets.forEach(function (target) {
            revealObserver.observe(target);
        });
    }

    /* ---- 2. Shared rAF loop ---------------------------------- */
    const parallaxLayers = Array.from(document.querySelectorAll("[data-parallax]"));
    const hero = document.querySelector(".hero");
    const heroCopy = document.querySelector(".hero-copy");
    const parallaxShirt = document.querySelector(".parallax-shirt");
    const heroBubbles = document.querySelector(".hero-bubbles");

    let latestScrollY = window.scrollY;
    let ticking = false;

    function applyScrollEffects() {
        ticking = false;

        // Hero parallax: three planes travel at different rates. The headline
        // sits deeper in the scene, so the 1px perspective already halves its
        // on-screen movement; the shirt travels furthest, which reads as real
        // depth as the page scrolls.
        if (hero && !prefersReducedMotion) {
            const progress = Math.min(latestScrollY / (hero.offsetHeight * 0.9), 1);

            if (heroCopy) {
                heroCopy.style.transform = "translateY(" + (progress * -46) + "px)";
                heroCopy.style.opacity = String(1 - progress * 0.9);
            }
            if (heroBubbles) {
                heroBubbles.style.setProperty("--bubbles-scroll", (progress * -60) + "px");
            }
            if (parallaxShirt) {
                // Custom property, so CSS keeps ownership of the translateZ
                // that places the shirt in front of the headline.
                parallaxShirt.style.setProperty("--shirt-scroll", (progress * -110) + "px");
            }
        }


        // Subtle parallax: each layer moves at a fraction of scroll.
        parallaxLayers.forEach(function (layer) {
            const speed = parseFloat(layer.getAttribute("data-parallax")) || 0.2;
            const rect = layer.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const offset = (rect.top + rect.height / 2 - viewportCenter) * speed;
            layer.style.transform = "translate3d(0, " + offset.toFixed(1) + "px, 0)";
        });
    }

    function requestScrollEffects() {
        latestScrollY = window.scrollY;
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(applyScrollEffects);
        }
    }

    if (!prefersReducedMotion) {
        window.addEventListener("scroll", requestScrollEffects, { passive: true });
        window.addEventListener("resize", requestScrollEffects);
        requestScrollEffects();
    }

    /* ---- 3. Hero pointer parallax ---------------------------- */
    // The pointer nudges only the foreground shirt; the deeper headline
    // plane stays put, which sells the sense of depth. Offsets are written
    // as custom properties so they compose with the scroll offsets in CSS.
    if (hero && parallaxShirt && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
        hero.addEventListener("mousemove", function (event) {
            const heroRect = hero.getBoundingClientRect();
            const relativeX = (event.clientX - heroRect.left) / heroRect.width - 0.5;
            const relativeY = (event.clientY - heroRect.top) / heroRect.height - 0.5;

            parallaxShirt.style.setProperty("--shirt-mx", (relativeX * 24).toFixed(1) + "px");
            parallaxShirt.style.setProperty("--shirt-my", (relativeY * 18).toFixed(1) + "px");
        });

        hero.addEventListener("mouseleave", function () {
            parallaxShirt.style.setProperty("--shirt-mx", "0px");
            parallaxShirt.style.setProperty("--shirt-my", "0px");
        });
    }
})();
