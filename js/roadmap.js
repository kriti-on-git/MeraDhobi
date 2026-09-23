/* ============================================================
   MeraDhobi: Roadmap animations
   Full timeline (how-it-works page): an SVG path draws itself
   as the user scrolls; the nearest stage becomes active.
   (The home-page journey is now a pure-CSS rotating wheel.)
   ============================================================ */

(function () {
    "use strict";

    /* ============================================================
       Full roadmap (how-it-works page)
       SVG path draws with scroll; nearest stage highlights.
       ============================================================ */
    const roadmap = document.querySelector(".roadmap");
    const roadmapItems = Array.from(document.querySelectorAll(".roadmap-item"));
    const progressPath = document.querySelector(".path-progress");
    const roadmapPointer = document.querySelector(".roadmap-pointer");

    if (roadmap && roadmapItems.length > 0 && progressPath) {
        // The stroke is dotted, so the reveal is a clip rect whose height grows
        // down the path (the viewBox is 0..1000 tall). Animating a dash offset
        // instead would only slide the dots around, not fill them in.
        const revealRect = document.querySelector(".path-reveal");

        let roadmapTicking = false;

        function updateRoadmap() {
            roadmapTicking = false;

            // Compare everything in document space so the scroll line
            // and the stage centers are measured consistently.
            const scrollCenter = window.scrollY + window.innerHeight * 0.55;
            const roadmapRect = roadmap.getBoundingClientRect();
            const roadmapTop = roadmapRect.top + window.scrollY;

            // 0 → 1 progress of the scroll line through the roadmap.
            const progress = Math.min(Math.max((scrollCenter - roadmapTop) / roadmapRect.height, 0), 1);
            if (revealRect) revealRect.setAttribute("height", (progress * 1000).toFixed(1));

            // Active stage = the last item whose center is above the line.
            let currentActive = 0;
            roadmapItems.forEach(function (item, index) {
                const itemRect = item.getBoundingClientRect();
                const itemCenter = itemRect.top + window.scrollY + itemRect.height / 2;
                if (itemCenter < scrollCenter) {
                    currentActive = index;
                }
            });

            roadmapItems.forEach(function (item, index) {
                item.classList.toggle("active", index === currentActive);
            });

            // Slide the pointer down the path and tint it with the stage
            // colour of whichever step is currently active.
            if (roadmapPointer) {
                roadmapPointer.style.top = (progress * 100).toFixed(2) + "%";
                roadmapPointer.style.setProperty("--stage-color", "var(--stage-" + (currentActive + 1) + ")");
            }
        }

        function requestRoadmapUpdate() {
            if (!roadmapTicking) {
                roadmapTicking = true;
                window.requestAnimationFrame(updateRoadmap);
            }
        }

        window.addEventListener("scroll", requestRoadmapUpdate, { passive: true });
        window.addEventListener("resize", requestRoadmapUpdate);
        updateRoadmap();

        /* Click a stage title to expand its extra detail. */
        roadmapItems.forEach(function (item) {
            const heading = item.querySelector("h3");
            if (!heading) return;

            heading.setAttribute("role", "button");
            heading.setAttribute("tabindex", "0");
            heading.setAttribute("aria-expanded", "false");

            function toggleExpanded() {
                const willExpand = !item.classList.contains("expanded");
                roadmapItems.forEach(function (other) {
                    other.classList.remove("expanded");
                    const otherHeading = other.querySelector("h3");
                    if (otherHeading) otherHeading.setAttribute("aria-expanded", "false");
                });
                if (willExpand) {
                    item.classList.add("expanded");
                    heading.setAttribute("aria-expanded", "true");
                }
            }

            heading.addEventListener("click", toggleExpanded);
            heading.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleExpanded();
                }
            });
        });
    }
})();
