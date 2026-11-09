/**
 * Modern Login Animation UI - State Controller & Interaction Handler
 * Handles layout morphing, active input highlights, submit sequence, and reset.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const morphCard = document.getElementById("morphCard");
  const btnOpenSign = document.getElementById("btnOpenSign");
  const btnCloseForm = document.getElementById("btnCloseForm");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const btnSubmitForm = document.getElementById("btnSubmitForm");
  const viewSuccess = document.getElementById("viewSuccess");
  const btnReset = document.getElementById("btnReset");
  const hintText = document.getElementById("hintText");

  // State Constants
  const STATES = {
    INITIAL: "state-initial",
    FORM: "state-form",
    LOADING: "state-loading",
    SUCCESS: "state-success",
  };

  /**
   * Switch state of the morphing container
   * @param {string} newState
   */
  function setCardState(newState) {
    // Remove all previous state classes
    Object.values(STATES).forEach((state) => morphCard.classList.remove(state));

    // Add new state class
    morphCard.classList.add(newState);

    // Update accessibility & hints
    updateHintText(newState);
  }

  /**
   * Update hint text according to active state
   * @param {string} state
   */
  function updateHintText(state) {
    if (!hintText) return;

    switch (state) {
      case STATES.INITIAL:
        hintText.innerHTML =
          'Bấm nút <strong>"Sign in"</strong> để bắt đầu chuyển cảnh';
        break;
      case STATES.FORM:
        hintText.innerHTML =
          "Nhập Email & Password. Viền ô input sẽ <strong>sáng xanh cyan</strong> khi focus";
        break;
      case STATES.LOADING:
        hintText.innerHTML = "Đang xác thực thông tin đăng nhập...";
        break;
      case STATES.SUCCESS:
        hintText.innerHTML =
          'Đăng nhập thành công! Bấm nút <strong>"Signed in"</strong> hoặc <strong>"Reset UI"</strong> để thử lại';
        break;
    }
  }

  // Step 1: Open Login Form (Morph Initial Button -> Form)
  btnOpenSign.addEventListener("click", (e) => {
    e.stopPropagation();
    setCardState(STATES.FORM);

    // Auto-focus email input after morph animation initiates
    setTimeout(() => {
      emailInput.focus();
      emailInput.select();
    }, 250);
  });

  // Close Form (Morph Form -> Initial Button)
  btnCloseForm.addEventListener("click", (e) => {
    e.stopPropagation();
    setCardState(STATES.INITIAL);
  });

  // Step 2 & 3: Form Submission sequence
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return;

    // Initiate Step 3: Morph form back down -> Loading -> Success
    setCardState(STATES.LOADING);

    // Simulate fast network authentication delay
    setTimeout(() => {
      setCardState(STATES.SUCCESS);
    }, 500);
  });

  // Reset UI to initial state
  function resetToInitial() {
    setCardState(STATES.INITIAL);
  }

  btnReset.addEventListener("click", resetToInitial);

  // Re-clicking on the success badge also resets the state for convenient testing
  viewSuccess.addEventListener("click", resetToInitial);

  // Keyboard support: Escape key closes the form
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && morphCard.classList.contains(STATES.FORM)) {
      resetToInitial();
    }
  });

  // Optional: Clicking outside the morph card closes the form if open
  document.addEventListener("click", (e) => {
    if (morphCard.classList.contains(STATES.FORM)) {
      if (!morphCard.contains(e.target) && e.target !== btnOpenSign) {
        resetToInitial();
      }
    }
  });
});
