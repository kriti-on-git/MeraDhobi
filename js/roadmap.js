/* ============================================================
   MeraDhobi: Roadmap animations
   1. Compact strip (home page): steps activate sequentially with
      an auto-advancing pointer, and a detail panel follows.
   2. Full timeline (how-it-works): an SVG path draws itself as
      the user scrolls; the nearest stage becomes active.
   ============================================================ */

(function () {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ============================================================
       A. Compact strip (home page)
       ============================================================ */
    const stripSteps = Array.from(document.querySelectorAll(".hiw-step"));

    if (stripSteps.length > 0) {
        const detailPanel = document.querySelector(".hiw-detail");
        const detailIcon = detailPanel ? detailPanel.querySelector(".detail-icon") : null;
        const detailTitle = detailPanel ? detailPanel.querySelector("[data-detail-title]") : null;
        const detailText = detailPanel ? detailPanel.querySelector("[data-detail-text]") : null;
        const progressBar = document.querySelector(".hiw-progress");
        const progressFill = progressBar ? progressBar.querySelector("span") : null;

        // Longer explanations shown in the detail panel.
        const stageDetails = {
            1: "Choose your services, pick a time slot, and we handle the rest. Booking takes under a minute; no account needed for a demo run.",
            2: "A MeraDhobi rider collects your bag from your doorstep in the slot you chose. Everything is counted and photographed at the door.",
            3: "Every garment is inspected, tagged and grouped by fabric and colour before anything touches water, the step most rushed washes skip.",
            4: "Each load runs its own programme: temperature, detergent and cycle length matched to the fabric, from sturdy cottons to fragile silks.",
            5: "Fresh loads are steamed, pressed and inspected piece by piece against a finishing checklist before they are allowed to leave.",
            6: "Your clothes return folded, protected and on time, usually within 48 hours of pickup."
        };

        // Icons for the detail panel, mirroring the identity of each stage so
        // the active step always shows the matching glyph.
        const stageIcons = {
            1: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
            2: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h-5"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
            3: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
            4: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"/><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M7 21v-3"/><path d="M17 21v-3"/></svg>',
            5: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
            6: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>'
        };

        let activeIndex = 0;
        let autoAdvanceTimer = null;

        function renderStripStep(index) {
            const step = stripSteps[index];
            const stageNumber = step.getAttribute("data-stage");

            stripSteps.forEach(function (other, otherIndex) {
                other.classList.toggle("active", otherIndex === index);
                other.setAttribute("aria-selected", String(otherIndex === index));
            });

            if (detailPanel) {
                detailPanel.style.setProperty("--stage-color", "var(--stage-" + stageNumber + ")");
                if (detailTitle) detailTitle.textContent = step.getAttribute("data-title");
                if (detailText) detailText.textContent = stageDetails[stageNumber] || "";
                if (detailIcon) {
                    detailIcon.innerHTML = stageIcons[stageNumber] || "";
                }
            }

            if (progressBar) {
                progressBar.style.setProperty("--stage-color", "var(--stage-" + stageNumber + ")");
            }
            if (progressFill) {
                // Restart the fill so the bar tracks each auto-advance interval.
                progressFill.classList.remove("is-running");
                void progressFill.offsetWidth; // reflow forces the animation restart
                progressFill.classList.add("is-running");
            }
        }

        function startAutoAdvance() {
            if (prefersReducedMotion) return;
            stopAutoAdvance();
            autoAdvanceTimer = window.setInterval(function () {
                activeIndex = (activeIndex + 1) % stripSteps.length;
                renderStripStep(activeIndex);
            }, 3500);
            if (progressFill) progressFill.classList.remove("is-paused");
        }

        function stopAutoAdvance() {
            if (autoAdvanceTimer !== null) {
                window.clearInterval(autoAdvanceTimer);
                autoAdvanceTimer = null;
                if (progressFill) progressFill.classList.add("is-paused");
            }
        }

        stripSteps.forEach(function (step, index) {
            step.setAttribute("role", "tab");
            step.addEventListener("click", function () {
                activeIndex = index;
                renderStripStep(index);
                startAutoAdvance(); // restart the rhythm after manual selection
            });
        });

        renderStripStep(0);
        startAutoAdvance();

        // Pause auto-advance while the strip is off-screen or hovered.
        const stripSection = document.querySelector(".hiw-strip-section");
        if (stripSection && "IntersectionObserver" in window) {
            const stripObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        startAutoAdvance();
                    } else {
                        stopAutoAdvance();
                    }
                });
            }, { threshold: 0.3 });
            stripObserver.observe(stripSection);
        }

        if (detailPanel) {
            detailPanel.addEventListener("mouseenter", stopAutoAdvance);
            detailPanel.addEventListener("mouseleave", startAutoAdvance);
        }
    }

    /* ============================================================
       B. Full roadmap (how-it-works page)
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
