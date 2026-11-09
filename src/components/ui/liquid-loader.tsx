import React from "react";
import { cn } from "@/lib/utils";
import "./liquid-loader.css";

export function LiquidLoader({ className }: { className?: string }) {
  return (
    <div className={cn("liquid-loader", className)}>
      <div className="loading-text">
        Loading<span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
      <div className="loader-track">
        <div className="liquid-fill"></div>
      </div>
    </div>
  );
}
