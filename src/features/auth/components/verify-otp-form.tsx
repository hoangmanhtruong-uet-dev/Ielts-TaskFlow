"use client";

import Link from "next/link";
import React, { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./verify-otp-form.module.css";
import { verifyOtpAction } from "@/features/auth/actions";
import type { ActionState } from "@/features/auth/action-state";

type VerifyOtpField = "identifier" | "token" | "type";
const initialState: ActionState<VerifyOtpField> = { status: "idle" };

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: "rect" | "circle";
  alpha: number;
  decay: number;
}

export function VerifyOtpForm({
  maskedIdentifier,
  channel,
  hasContext = true,
}: {
  maskedIdentifier: string;
  channel: string;
  hasContext?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    verifyOtpAction,
    initialState,
  );
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Confetti canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti Particle System
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiParticle[] = [];
    const colors = [
      "#10b981",
      "#6366f1",
      "#8b5cf6",
      "#3b82f6",
      "#f59e0b",
      "#ec4899",
    ];
    for (let i = 0; i < 110; i++) {
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

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeParticles = 0;
      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.98;
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
    };
    render();
  };

  useEffect(() => {
    if (state.status === "success") {
      triggerConfetti();
      const t = setTimeout(() => {
        router.push("/reset-password");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [state.status, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const singleDigit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  useEffect(() => {
    if (otp.every((val) => val !== "")) {
      // Auto submit when 6 digits are entered
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  }, [otp]);

  const showInput = !isPending && state.status !== "success";
  const showVerifying = isPending;
  const showSuccess = !isPending && state.status === "success";

  return (
    <div className={styles.container}>
      <div className={`${styles["bg-glow"]} ${styles["blob-1"]}`}></div>
      <div className={`${styles["bg-glow"]} ${styles["blob-2"]}`}></div>
      <div className={styles["bg-grid"]}></div>
      <canvas
        ref={canvasRef}
        id="confetti-canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 100,
          pointerEvents: "none",
        }}
      ></canvas>

      <div className={styles["otp-card-container"]}>
        {/* Input Stage */}
        <div
          className={`${styles.stage} ${showInput ? styles.active : styles.hidden}`}
        >
          <div className={styles["card-header"]}>
            <div className={styles["badge-icon"]}>
              <svg
                aria-hidden="true"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 className={styles.title}>Nhập mã xác thực</h1>
            <p className={styles.subtitle}>
              Chúng tôi đã gửi mã xác thực 6 chữ số đến{" "}
              <span className={styles["phone-highlight"]}>
                {maskedIdentifier}
              </span>
            </p>
          </div>

          {!hasContext ? (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-200">
              <p>Phiên xác thực OTP chưa khởi tạo hoặc đã hết hạn.</p>
              <Link
                href="/forgot-password"
                className="mt-2 inline-block font-semibold text-indigo-300 underline hover:text-indigo-200"
              >
                Quay lại yêu cầu mã OTP mới
              </Link>
            </div>
          ) : (
            <form ref={formRef} action={formAction} className="w-full">
              <input type="hidden" name="type" value={channel} />
              <input type="hidden" name="token" value={otp.join("")} />

              <div
                className={styles["otp-inputs-wrapper"]}
                style={{ gap: "8px" }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    aria-label={`Chữ số OTP thứ ${i + 1}`}
                    className={`${styles["otp-input"]} ${digit ? styles.filled : ""}`}
                    style={{
                      width: "48px",
                      height: "56px",
                      fontSize: "1.5rem",
                    }}
                    value={digit}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    maxLength={1}
                  />
                ))}
              </div>
              {state.status === "error" && (
                <p
                  role="alert"
                  className="mt-2 text-center text-sm text-red-300"
                >
                  {state.message}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Verifying Stage */}
        <div
          className={`${styles.stage} ${showVerifying ? styles.active : styles.hidden}`}
        >
          <div className={styles["card-header"]} style={{ marginBottom: 0 }}>
            <h1 className={styles.title}>Đang xác thực</h1>
            <p className={styles.subtitle}>Vui lòng chờ trong giây lát...</p>
          </div>
          <div className={styles["orbit-container"]}>
            <div
              className={`${styles["orbit-ring"]} ${styles["orbit-ring-outer"]}`}
            ></div>
            <div
              className={`${styles["orbit-ring"]} ${styles["orbit-ring-inner"]}`}
            ></div>
            <div className={styles["orbit-core"]}>
              <div className={styles["core-pulse"]}></div>
              <svg
                aria-hidden="true"
                className={styles["lock-spin-icon"]}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className={styles["orbit-nodes-wrapper"]}>
              <div className={`${styles["orbit-node"]} ${styles["node-0"]}`}>
                <span>{otp[0] || "1"}</span>
              </div>
              <div className={`${styles["orbit-node"]} ${styles["node-1"]}`}>
                <span>{otp[1] || "2"}</span>
              </div>
              <div className={`${styles["orbit-node"]} ${styles["node-2"]}`}>
                <span>{otp[2] || "3"}</span>
              </div>
              <div className={`${styles["orbit-node"]} ${styles["node-3"]}`}>
                <span>{otp[3] || "4"}</span>
              </div>
            </div>
          </div>
          <div className={styles["verifying-status"]}>
            <h2 className={styles["status-title"]}>Đang kết nối</h2>
            <div className={styles["progress-bar-track"]}>
              <div className={styles["progress-bar-fill"]}></div>
            </div>
          </div>
        </div>

        {/* Success Stage */}
        <div
          className={`${styles.stage} ${showSuccess ? styles.active : styles.hidden}`}
        >
          <div className={styles["success-badge-wrapper"]}>
            <div className={styles["success-ring-bg"]}></div>
            <div className={styles["success-icon-box"]}>
              <svg
                aria-hidden="true"
                className={styles["checkmark-svg"]}
                viewBox="0 0 64 64"
              >
                <circle
                  className={styles["checkmark-circle"]}
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                ></circle>
                <path
                  className={styles["checkmark-check"]}
                  fill="none"
                  d="M18 32l10 10 20-20"
                ></path>
              </svg>
            </div>
          </div>
          <div className={styles["success-content"]}>
            <h1 className={styles["success-title"]}>Xác Thực Thành Công</h1>
            <p className={styles["success-desc"]}>
              Mã OTP hợp lệ. Đang chuyển hướng...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
