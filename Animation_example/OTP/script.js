/**
 * ==========================================================================
 * MODERN OTP VERIFICATION UI - JAVASCRIPT ENGINE
 * Full state machine, digit input handling, orbit animation, canvas confetti,
 * synthesized sound FX, resend timer, and reset capabilities.
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements Reference ---
  const inputs = document.querySelectorAll(".otp-input");
  const stageInput = document.getElementById("stage-input");
  const stageVerifying = document.getElementById("stage-verifying");
  const stageSuccess = document.getElementById("stage-success");

  const cardTitle = document.getElementById("card-title");
  const cardSubtitle = document.getElementById("card-subtitle");
  const headerBadge = document.getElementById("header-badge");

  const resendBtn = document.getElementById("resend-btn");
  const resendText = document.getElementById("resend-text");
  const resendTimer = document.getElementById("resend-timer");

  const resetBtn = document.getElementById("reset-btn");
  const continueBtn = document.getElementById("continue-btn");

  const soundToggleBtn = document.getElementById("sound-toggle-btn");
  const soundIconOn = document.getElementById("sound-icon-on");
  const soundIconOff = document.getElementById("sound-icon-off");

  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  // --- State Variables ---
  let soundEnabled = true;
  let resendCountdown = 30;
  let timerInterval = null;
  let audioCtx = null;

  // Default header text back-up
  const originalTitle = "Let's verify your number";
  const originalSubtitleHtml = `Chúng tôi đã gửi mã xác thực 4 chữ số đến số điện thoại <span class="phone-highlight">+84 988 *** 888</span>`;

  // ==========================================================================
  // 1. SOUND FX SYNTHESIZER (Web Audio API - No external audio files required)
  // ==========================================================================

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  // Play a soft high-frequency click on key entry
  function playClickSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      200,
      audioCtx.currentTime + 0.04,
    );

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  }

  // Play a pleasant 3-note harmonic chime on success
  function playSuccessSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0, audioCtx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(
        0.18,
        audioCtx.currentTime + idx * 0.12 + 0.02,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + idx * 0.12 + 0.4,
      );

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + idx * 0.12);
      osc.stop(audioCtx.currentTime + idx * 0.12 + 0.4);
    });
  }

  // Sound toggle listener
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIconOn.classList.remove("hidden");
      soundIconOff.classList.add("hidden");
      showToast("Đã bật âm thanh hiệu ứng 🔊");
      playClickSound();
    } else {
      soundIconOn.classList.add("hidden");
      soundIconOff.classList.remove("hidden");
      showToast("Đã tắt âm thanh 🔇");
    }
  });

  // ==========================================================================
  // 2. OTP DIGIT INPUT LOGIC (Auto advance, Backspace, Paste)
  // ==========================================================================

  inputs.forEach((input, index) => {
    // Focus & Blur visual style state
    input.addEventListener("focus", () => {
      input.classList.add("focused");
    });

    input.addEventListener("blur", () => {
      input.classList.remove("focused");
    });

    // Input digit handling
    input.addEventListener("input", (e) => {
      // Extract numeric digits
      const rawValue = e.target.value;
      const digitsOnly = rawValue.replace(/\D/g, "");

      if (digitsOnly.length === 0) {
        input.value = "";
        input.classList.remove("filled");
        return;
      }

      // Always take the newest typed character (last digit)
      const singleDigit = digitsOnly.slice(-1);
      input.value = singleDigit;
      input.classList.add("filled");
      playClickSound();

      // Auto-advance focus to next input box
      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Check if all 4 digits are completed
      checkOTPCompletion();
    });

    // Keydown handling for Backspace & Arrow Navigation
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        if (input.value === "") {
          // Backspace on empty input -> step back to previous box and clear it
          if (index > 0) {
            inputs[index - 1].value = "";
            inputs[index - 1].classList.remove("filled");
            inputs[index - 1].focus();
          }
        } else {
          // Clear current input value
          input.value = "";
          input.classList.remove("filled");
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputs[index - 1].focus();
      } else if (e.key === "ArrowRight" && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // Paste event handling (e.g., user pastes "4829")
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData(
        "text",
      );
      const digits = pastedData.replace(/\D/g, "").slice(0, 4);

      if (digits.length > 0) {
        digits.split("").forEach((char, idx) => {
          if (idx < inputs.length) {
            inputs[idx].value = char;
            inputs[idx].classList.add("filled");
          }
        });

        playClickSound();

        // Focus last filled input or next available
        const nextFocus = Math.min(digits.length, inputs.length - 1);
        inputs[nextFocus].focus();

        checkOTPCompletion();
      }
    });
  });

  // Verify if all inputs have numeric values
  function checkOTPCompletion() {
    const otpCode = Array.from(inputs)
      .map((i) => i.value)
      .join("");
    if (otpCode.length === 4) {
      // Trigger transition to Verifying stage automatically
      setTimeout(() => {
        startVerifying(otpCode);
      }, 180);
    }
  }

  // ==========================================================================
  // 3. STAGE TRANSITIONS & ORBIT SPINNING ANIMATION
  // ==========================================================================

  // Step 2: Verifying State
  function startVerifying(code) {
    initAudio();

    // 1. Populate digits into orbiting node elements
    const codeDigits = code.split("");
    codeDigits.forEach((digit, idx) => {
      const digitValElem = document.getElementById(`digit-val-${idx}`);
      if (digitValElem) {
        digitValElem.textContent = digit;
      }
    });

    // 2. Hide Input Stage and Show Verifying Orbit Stage
    stageInput.classList.remove("active");
    stageInput.classList.add("hidden");

    stageVerifying.classList.remove("hidden");
    stageVerifying.classList.add("active");

    // Update header subtitle
    cardSubtitle.textContent = "Đang xác thực mã OTP...";

    // 3. Simulate API Verification delay (1.8s) then transition to Success Stage
    setTimeout(() => {
      showSuccessState();
    }, 1800);
  }

  // Step 3: Success State
  function showSuccessState() {
    // 1. Hide Verifying Stage & Show Success Stage
    stageVerifying.classList.remove("active");
    stageVerifying.classList.add("hidden");

    stageSuccess.classList.remove("hidden");
    stageSuccess.classList.add("active");

    // 2. Update Header styling & badge icon to Emerald Green Success mode
    cardTitle.textContent = "Xác Thực Thành Công";
    cardSubtitle.textContent = "Mã OTP hợp lệ. Chào mừng bạn trở lại!";

    headerBadge.classList.add("success-mode");
    headerBadge.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;

    // 3. Update Success Time timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const timeElem = document.getElementById("success-time");
    if (timeElem) timeElem.textContent = timeStr;

    // 4. Play success audio chime & launch Confetti particles
    playSuccessSound();
    triggerConfetti();
    showToast("Xác thực thành công! 🎉");
  }

  // ==========================================================================
  // 4. CANVAS CONFETTI PARTICLE SYSTEM
  // ==========================================================================

  function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = [
      "#10b981",
      "#6366f1",
      "#8b5cf6",
      "#3b82f6",
      "#f59e0b",
      "#ec4899",
    ];
    const particleCount = 110;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 120,
        y: canvas.height / 2 - 40 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 15 - 3,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.4 ? "rect" : "circle",
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
      });
    }

    let animationFrame;

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;

      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        activeParticles++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.vx *= 0.98; // Air resistance
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (activeParticles > 0) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    render();
  }

  // Handle canvas resize
  window.addEventListener("resize", () => {
    const canvas = document.getElementById("confetti-canvas");
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  // ==========================================================================
  // 5. RESEND COUNTDOWN TIMER & TOAST SYSTEM
  // ==========================================================================

  function startResendTimer() {
    resendCountdown = 30;
    resendBtn.disabled = true;
    resendTimer.textContent = `${resendCountdown}s`;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      resendCountdown--;
      resendTimer.textContent = `${resendCountdown}s`;

      if (resendCountdown <= 0) {
        clearInterval(timerInterval);
        resendBtn.disabled = false;
        resendTimer.textContent = "Sẵn sàng";
      }
    }, 1000);
  }

  resendBtn.addEventListener("click", () => {
    if (resendCountdown > 0 && resendBtn.disabled) return;

    // Reset inputs
    inputs.forEach((input) => {
      input.value = "";
      input.classList.remove("filled");
    });
    inputs[0].focus();

    playClickSound();
    showToast("Mã OTP mới đã được gửi đến thiết bị của bạn!");
    startResendTimer();
  });

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 3000);
  }

  // ==========================================================================
  // 6. RESET & REPLAY ACTION CONTROLLERS
  // ==========================================================================

  function resetToInitialState() {
    // Reset inputs
    inputs.forEach((input) => {
      input.value = "";
      input.classList.remove("filled", "focused");
    });

    // Reset stage visibility
    stageSuccess.classList.remove("active");
    stageSuccess.classList.add("hidden");

    stageVerifying.classList.remove("active");
    stageVerifying.classList.add("hidden");

    stageInput.classList.remove("hidden");
    stageInput.classList.add("active");

    // Reset Header
    cardTitle.textContent = originalTitle;
    cardSubtitle.innerHTML = originalSubtitleHtml;

    headerBadge.classList.remove("success-mode");
    headerBadge.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
        `;

    // Focus first input box
    setTimeout(() => {
      inputs[0].focus();
    }, 100);

    playClickSound();
    showToast("Đã làm mới giao diện OTP");
  }

  resetBtn.addEventListener("click", resetToInitialState);

  continueBtn.addEventListener("click", () => {
    showToast("Đang chuyển về màn hình đăng nhập...");
    setTimeout(() => {
      window.location.href = "../../Login_UI/index.html";
    }, 1000);
  });

  // Init resend timer on page load
  startResendTimer();
});
