/* ============================================================
   MeraDhobi: Form validation & demo booking flow
   1. Generic live validation for any [data-validate] form.
   2. Booking page: on success we generate a frontend-only
      reference number and swap the form for a confirmation card.
      Nothing is sent anywhere; this is a UI demo.
   ============================================================ */

(function () {
    "use strict";

    /* ---- Validation rules ------------------------------------ */
    const validators = {
        required: function (value) {
            return value.trim().length > 0;
        },
        phone: function (value) {
            // Indian mobile numbers: 10 digits, optional +91 / 0 prefix.
            return /^(\+91[\s-]?)?0?([6-9]\d{9})$/.test(value.replace(/[\s-]/g, ""));
        },
        email: function (value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        },
        date: function (value) {
            if (!value) return false;
            const chosen = new Date(value + "T23:59:59");
            const today = new Date();
            return chosen >= today;
        }
    };

    /* Per-field rule map shared by the booking and contact forms. */
    const fieldRules = {
        "booking-name": ["required"],
        "booking-phone": ["required", "phone"],
        "booking-email": ["required", "email"],
        "booking-address": ["required"],
        "booking-date": ["required", "date"],
        "booking-time": ["required"],
        "booking-service": ["required"],
        "contact-name": ["required"],
        "contact-email": ["required", "email"],
        "contact-message": ["required"]
    };

    function validateField(input) {
        const rules = fieldRules[input.id] || [];
        let errorMessage = "";

        rules.some(function (rule) {
            if (!validators[rule](input.value)) {
                const messages = {
                    required: "This field is required.",
                    phone: "Enter a valid 10-digit mobile number.",
                    email: "Enter a valid email address.",
                    date: "Choose today or a future date."
                };
                errorMessage = messages[rule];
                return true;
            }
            return false;
        });

        const field = input.closest(".form-field");
        if (!field) return errorMessage === "";

        const errorSlot = field.querySelector(".field-error");
        field.classList.toggle("invalid", errorMessage !== "");
        field.classList.toggle("valid", errorMessage === "" && input.value.trim() !== "");
        if (errorSlot) errorSlot.textContent = errorMessage;
        return errorMessage === "";
    }

    function wireForm(form) {
        Object.keys(fieldRules).forEach(function (fieldId) {
            const input = form.querySelector("#" + fieldId);
            if (!input) return;

            // Validate as the user leaves each field, and clear
            // states while they correct the value.
            input.addEventListener("blur", function () {
                validateField(input);
            });
            input.addEventListener("input", function () {
                if (input.closest(".form-field").classList.contains("invalid")) {
                    validateField(input);
                }
            });
        });
    }

    /* ---- Booking form (booking.html) -------------------------- */
    const bookingForm = document.querySelector("#booking-form");
    const confirmationCard = document.querySelector("#booking-confirmation");

    if (bookingForm && confirmationCard) {
        wireForm(bookingForm);

        // Restrict pickup dates to today → +30 days in the date picker.
        const dateInput = bookingForm.querySelector("#booking-date");
        if (dateInput) {
            const today = new Date();
            const inThirtyDays = new Date();
            inThirtyDays.setDate(today.getDate() + 30);
            dateInput.min = today.toISOString().split("T")[0];
            dateInput.max = inThirtyDays.toISOString().split("T")[0];
        }

        bookingForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Demo only, no server exists.

            // Validate every field; focus the first one that fails.
            const inputs = Object.keys(fieldRules)
                .map(function (id) { return bookingForm.querySelector("#" + id); })
                .filter(Boolean);

            let formIsValid = true;
            let firstInvalid = null;

            inputs.forEach(function (input) {
                const fieldIsValid = validateField(input);
                if (!fieldIsValid) {
                    formIsValid = false;
                    if (!firstInvalid) firstInvalid = input;
                }
            });

            if (!formIsValid) {
                firstInvalid.focus();
                return;
            }

            /* Generate a frontend-only reference like MD-4F7K92.
               Not sent anywhere; it simply personalises the demo. */
            const referenceCode = "MD-" + Math.random().toString(36).slice(2, 8).toUpperCase();

            const summary = confirmationCard.querySelector(".booking-summary");
            const getFieldValue = function (id) {
                const el = bookingForm.querySelector("#" + id);
                const index = el.selectedIndex;
                return el.tagName === "SELECT" && index !== -1
                    ? el.options[index].text
                    : el.value;
            };

            summary.innerHTML =
                "<div><dt>Reference</dt><dd>" + referenceCode + "</dd></div>" +
                "<div><dt>Name</dt><dd>" + escapeHtml(getFieldValue("booking-name")) + "</dd></div>" +
                "<div><dt>Phone</dt><dd>" + escapeHtml(getFieldValue("booking-phone")) + "</dd></div>" +
                "<div><dt>Pickup date</dt><dd>" + escapeHtml(getFieldValue("booking-date")) + "</dd></div>" +
                "<div><dt>Preferred time</dt><dd>" + escapeHtml(getFieldValue("booking-time")) + "</dd></div>" +
                "<div><dt>Service</dt><dd>" + escapeHtml(getFieldValue("booking-service")) + "</dd></div>";

            confirmationCard.querySelector(".ref-chip").textContent = referenceCode;

            // Swap views: form out, confirmation in.
            bookingForm.style.display = "none";
            confirmationCard.classList.add("show");
            confirmationCard.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    /* ---- Contact form (contact.html) -------------------------- */
    const contactForm = document.querySelector("#contact-form");
    const contactSuccess = document.querySelector("#contact-success");

    if (contactForm && contactSuccess) {
        wireForm(contactForm);

        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const requiredInputs = ["contact-name", "contact-email", "contact-message"]
                .map(function (id) { return contactForm.querySelector("#" + id); })
                .filter(Boolean);

            let formIsValid = true;
            let firstInvalid = null;

            requiredInputs.forEach(function (input) {
                const fieldIsValid = validateField(input);
                if (!fieldIsValid) {
                    formIsValid = false;
                    if (!firstInvalid) firstInvalid = input;
                }
            });

            if (!formIsValid) {
                firstInvalid.focus();
                return;
            }

            contactForm.style.display = "none";
            contactSuccess.classList.add("show");
        });
    }

    /* Small helper: keep user text from injecting HTML in summaries. */
    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
})();
