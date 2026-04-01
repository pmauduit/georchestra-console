(function () {
  "use strict";

  function scorePassword(password) {
    let score = 0;
    if (!password) {
      return score;
    }
    const letters = {};
    for (let i = 0; i < password.length; i += 1) {
      letters[password[i]] = (letters[password[i]] || 0) + 1;
      score += 5.0 / letters[password[i]];
    }

    const variations = {
      digits: /\d/.test(password),
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      nonWords: /\W/.test(password)
    };

    let variationCount = 0;
    Object.keys(variations).forEach((key) => {
      variationCount += variations[key] ? 1 : 0;
    });
    score += (variationCount - 1) * 10;
    return Math.floor(score);
  }

  function setQuality(indicator, label, className) {
    indicator.textContent = label;
    indicator.classList.remove(
      "pwd-quality--empty",
      "pwd-quality--veryweak",
      "pwd-quality--weak",
      "pwd-quality--good",
      "pwd-quality--strong"
    );
    indicator.classList.add(className);
  }

  function attachPasswordValidation(config) {
    const form = document.getElementById(config.formId);
    const input = document.getElementById(config.passwordId);
    const confirmInput = document.getElementById(config.confirmId);
    const indicator = document.getElementById(config.indicatorId);
    const confirmError = document.getElementById(config.confirmErrorId);
    const submit = document.getElementById(config.submitId);

    if (!form || !input || !confirmInput || !indicator) {
      return;
    }

    function updateQuality() {
      const value = input.value || "";
      if (!value) {
        setQuality(indicator, indicator.dataset.empty, "pwd-quality--empty");
        return;
      }
      const score = scorePassword(value);
      if (score > 80) {
        setQuality(indicator, indicator.dataset.strong, "pwd-quality--strong");
      } else if (score > 60) {
        setQuality(indicator, indicator.dataset.good, "pwd-quality--good");
      } else if (score >= 30) {
        setQuality(indicator, indicator.dataset.weak, "pwd-quality--weak");
      } else {
        setQuality(indicator, indicator.dataset.veryweak, "pwd-quality--veryweak");
      }
    }

    function setError(field, errorEl, message) {
      if (errorEl) {
        errorEl.textContent = message || "";
      }
      field.setCustomValidity(message || "");
    }

    let touchedConfirm = false;

    function validateConfirm(force) {
      const value = confirmInput.value || "";
      const passwordValue = input.value || "";
      if (!force && !touchedConfirm) {
        setError(confirmInput, confirmError, "");
        return true;
      }
      if (value && value !== passwordValue) {
        setError(confirmInput, confirmError, form.dataset.msgConfirm || "");
        return false;
      }
      setError(confirmInput, confirmError, "");
      return true;
    }

    function updateSubmit() {
      if (!submit) {
        return;
      }
      const ok = validateConfirm(false) && form.checkValidity();
      submit.disabled = !ok;
    }

    input.addEventListener("input", () => {
      updateQuality();
      validateConfirm(false);
      updateSubmit();
    });
    input.addEventListener("blur", () => {
      validateConfirm(false);
      updateSubmit();
    });
    confirmInput.addEventListener("input", () => {
      touchedConfirm = true;
      validateConfirm(false);
      updateSubmit();
    });
    confirmInput.addEventListener("blur", () => {
      touchedConfirm = true;
      validateConfirm(true);
      updateSubmit();
    });
    form.addEventListener("submit", (event) => {
      touchedConfirm = true;
      const ok = validateConfirm(true) && form.checkValidity();
      if (!ok) {
        event.preventDefault();
      }
    });

    updateQuality();
    updateSubmit();
  }

  window.ConsoleFormUtils = {
    attachPasswordValidation
  };
}());
