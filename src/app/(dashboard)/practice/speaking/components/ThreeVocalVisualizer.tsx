"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeVocalVisualizerProps {
  isRecording?: boolean;
}

export function ThreeVocalVisualizer({
  isRecording = false,
}: ThreeVocalVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8.5;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Acoustic Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(2.0, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x5b5fef,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 2. Harmonic Particle Cloud
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.4 + (Math.random() - 0.5) * 0.6;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // 3. Orbital Resonance Rings
    const ringGeo1 = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x5b5fef,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.5, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    mainGroup.add(ring2);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.2;
      targetRotX = y * 0.8;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const recordingActive = isRecordingRef.current;

      // Group rotation
      mainGroup.rotation.y +=
        (targetRotY - mainGroup.rotation.y) * 0.05 + 0.003;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

      // Pulse core
      const pulseSpeed = recordingActive ? 6.0 : 2.0;
      const pulseAmp = recordingActive ? 0.18 : 0.06;
      const scale = 1.0 + Math.sin(elapsed * pulseSpeed) * pulseAmp;
      coreMesh.scale.set(scale, scale, scale);

      // Rotate orbital rings
      ring1.rotation.z += recordingActive ? 0.025 : 0.008;
      ring2.rotation.x += recordingActive ? 0.02 : 0.006;

      // Dynamic waveform perturbation on particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const intensity = recordingActive ? 0.35 : 0.08;
      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const wave =
          Math.sin(elapsed * (recordingActive ? 5 : 2) + ox * 2 + oy * 2) *
          intensity;
        posArray[i * 3] = ox * (1 + wave);
        posArray[i * 3 + 1] = oy * (1 + wave);
        posArray[i * 3 + 2] = oz * (1 + wave);
      }
      posAttr.needsUpdate = true;

      // Color intensity shift on recording
      if (recordingActive) {
        coreMat.color.setHex(0xff0055); // Crimson pulse
        particleMat.color.setHex(0x00ffcc);
      } else {
        coreMat.color.setHex(0x5b5fef);
        particleMat.color.setHex(0x00f0ff);
      }

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
    };
  }, []);

  return (
    <div className="relative flex h-[280px] w-full max-w-[340px] items-center justify-center">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        aria-label="3D Vocal Acoustic Visualizer"
      />
      {/* Cybernetic HUD overlay markers */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 font-mono text-[10px] text-[#00F0FF]/60 select-none">
        <div className="flex justify-between">
          <span>{"// HARMONIC_MATRIX"}</span>
          <span>48kHz / 24-BIT</span>
        </div>
        <div className="flex justify-between">
          <span>{isRecording ? "RECORDING ACTIVE" : "ACOUSTIC STANDBY"}</span>
          <span>CYBER_AUDIO_v3</span>
        </div>
      </div>
    </div>
  );
}
