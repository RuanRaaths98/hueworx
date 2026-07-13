const form = document.querySelector("#bookingForm");
const statusEl = document.querySelector("#formStatus");
const dateInputs = document.querySelectorAll('input[type="date"]');
const thankYouPage = "thank-you.html";

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

dateInputs.forEach((input) => {
  input.min = localToday;
});

function setError(input, message) {
  const row = input.closest(".form-row");
  const error = row.querySelector("small");
  row.classList.add("error");
  error.textContent = message;
}

function clearError(input) {
  const row = input.closest(".form-row");
  const error = row.querySelector("small");
  row.classList.remove("error");
  error.textContent = "";
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateForm() {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((input) => {
    clearError(input);

    if (!input.value.trim()) {
      setError(input, "Please fill this in.");
      isValid = false;
      return;
    }

    if (input.type === "email" && !validateEmail(input.value)) {
      setError(input, "Please enter a valid email address.");
      isValid = false;
    }
  });

  return isValid;
}

async function submitToFormspree(submitButton) {
  const formData = new FormData(form);

  const response = await fetch(form.action, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Form submission failed.");
  }

  if (window.fbq) {
    window.fbq("track", "Lead");
  }

  submitButton.textContent = "Request Sent";
  statusEl.textContent = "Taking you to the confirmation page.";
  window.location.href = thankYouPage;
}

if (form) {
  form.addEventListener("input", (event) => {
    if (event.target.matches("input, textarea")) {
      clearError(event.target);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "";

    if (!validateForm()) {
      statusEl.textContent = "Please check the highlighted fields.";
      return;
    }

    const submitButton = form.querySelector(".submit-button");
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    statusEl.textContent = "Sending your request.";

    try {
      await submitToFormspree(submitButton);
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = "Request date";
      statusEl.textContent = "Something went wrong. Please try again.";
    }
  });
}
