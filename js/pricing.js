/* ============================================================
   MeraDhobi: Price estimator (pricing.html)
   Pure DOM + arithmetic: garment type × quantity × service tier.
   All rates are clearly-labelled demo values, not real quotes.
   ============================================================ */

(function () {
    "use strict";

    const calculatorForm = document.querySelector("#price-calculator");
    if (!calculatorForm) return; // Not on the pricing page.

    /* Demo rate card, mirrors the pricing table on the page. */
    const garmentRates = {
        shirt: 60,
        tshirt: 50,
        trousers: 60,
        jeans: 80,
        bedsheet: 120,
        blanket: 200,
        suit: 350,
        saree: 150
    };

    /* Service multipliers: premium care costs proportionally more. */
    const serviceMultipliers = {
        "wash-fold": 1,
        "dry-clean": 1.6,
        express: 1.5
    };

    const garmentSelect = calculatorForm.querySelector("#calc-garment");
    const quantityInput = calculatorForm.querySelector("#calc-quantity");
    const serviceSelect = calculatorForm.querySelector("#calc-service");
    const totalOutput = document.querySelector("#calc-total");
    const breakdownOutput = document.querySelector("#calc-breakdown");
    const quantityOutput = document.querySelector("#calc-quantity-note");

    const rupeeFormatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });

    function calculateEstimate() {
        const garment = garmentSelect.value;
        const quantity = Math.max(1, parseInt(quantityInput.value, 10) || 0);
        const service = serviceSelect.value;

        const baseRate = garmentRates[garment];
        const multiplier = serviceMultipliers[service];

        // Core arithmetic: rate per item × count × service multiplier.
        const total = Math.round(baseRate * quantity * multiplier);

        totalOutput.textContent = rupeeFormatter.format(total);

        // Human-readable breakdown so the maths is transparent.
        const garmentLabel = garmentSelect.options[garmentSelect.selectedIndex].text;
        const serviceLabel = serviceSelect.options[serviceSelect.selectedIndex].text;

        breakdownOutput.textContent =
            garmentLabel + " × " + quantity +
            " · " + serviceLabel +
            " (" + rupeeFormatter.format(Math.round(baseRate * multiplier)) + " per item)";

        if (quantityOutput) {
            quantityOutput.textContent = quantity + (quantity === 1 ? " item" : " items");
        }
    }

    // Recalculate on any input; no submit button needed.
    calculatorForm.addEventListener("input", calculateEstimate);
    calculatorForm.addEventListener("change", calculateEstimate);

    // First paint shows a sensible example instead of ₹0.
    calculateEstimate();
})();
