"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type VisualMode = "sphere" | "wave" | "matrix";
export type AmbientNoise = "off" | "cafe" | "exam" | "street";

export interface ThreeSonicVisualizerProps {
  isPlaying: boolean;
  visualMode: VisualMode;
  playbackSpeed: number;
  ambientNoise: AmbientNoise;
  className?: string;
}

export function ThreeSonicVisualizer({
  isPlaying,
  visualMode,
  playbackSpeed,
  ambientNoise,
  className = "",
}: ThreeSonicVisualizerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    isPlaying,
    visualMode,
    playbackSpeed,
    ambientNoise,
  });

  useEffect(() => {
    stateRef.current = { isPlaying, visualMode, playbackSpeed, ambientNoise };
  }, [isPlaying, visualMode, playbackSpeed, ambientNoise]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Icosahedron Core Wireframe
    const coreGeo = new THREE.IcosahedronGeometry(1.45, 3);
    const originalPositions = new Float32Array(
      coreGeo.attributes.position.array,
    );
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 2. Particle Swarm (Sonic Nodes)
    const particlesCount = 750;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const baseColor1 = new THREE.Color("#6366f1");
    const baseColor2 = new THREE.Color("#06b6d4");

    for (let i = 0; i < particlesCount; i++) {
      const radius = 1.9 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = baseColor1.clone().lerp(baseColor2, Math.random());
      colorsArray[i * 3] = mixedColor.r;
      colorsArray[i * 3 + 1] = mixedColor.g;
      colorsArray[i * 3 + 2] = mixedColor.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );
    particlesGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(colorsArray, 3),
    );

    const particlesMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    mainGroup.add(particlesMesh);

    // 3. Equatorial Audio Rings
    const ringGeo1 = new THREE.RingGeometry(1.65, 1.68, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 2.3;
    mainGroup.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(1.95, 1.98, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 3;
    mainGroup.add(ringMesh2);

    // Mouse Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 1.5;
      targetRotationX = y * 1.5;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Resize handling via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          width = newW;
          height = newH;
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const {
        isPlaying: playing,
        visualMode: mode,
        playbackSpeed: speed,
        ambientNoise: noise,
      } = stateRef.current;
      const speedMultiplier = playing ? speed * 1.6 : 0.45;
      clock += 0.018 * speedMultiplier;

      // Mouse Smooth Drag
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

      // Base Group Spin
      mainGroup.rotation.y += 0.006 * speedMultiplier;
      ringMesh1.rotation.z += 0.01 * speedMultiplier;
      ringMesh2.rotation.z -= 0.008 * speedMultiplier;

      // Mesh deformation according to sound
      const posAttribute = coreGeo.attributes.position;
      const currentPos = posAttribute.array as Float32Array;
      const noiseAmp = noise === "cafe" ? 0.08 : noise === "exam" ? 0.04 : 0.0;
      const amp = playing ? 0.16 * speed + noiseAmp : 0.03 + noiseAmp;

      for (let i = 0; i < currentPos.length; i += 3) {
        const origX = originalPositions[i];
        const origY = originalPositions[i + 1];
        const origZ = originalPositions[i + 2];

        const wave =
          Math.sin(origX * 2.5 + clock * 2.2) *
          Math.cos(origY * 2.5 + clock * 2.2) *
          amp;

        currentPos[i] = origX * (1 + wave);
        currentPos[i + 1] = origY * (1 + wave);
        currentPos[i + 2] = origZ * (1 + wave);
      }
      posAttribute.needsUpdate = true;

      // Color/Mode Reactive changes
      if (mode === "matrix") {
        coreMat.color.setHex(0x06b6d4); // cyan
        particlesMat.size = 0.06;
      } else if (mode === "wave") {
        coreMat.color.setHex(0xec4899); // pink/purple
        particlesMat.size = 0.05;
      } else {
        coreMat.color.setHex(playing ? 0x6366f1 : 0x4338ca);
        particlesMat.size = 0.045;
      }

      // Dynamic Particle Float
      const particlePosAttr = particlesGeo.attributes.position;
      const particlePositions = particlePosAttr.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        const idx = i * 3 + 1; // Y axis
        if (playing) {
          particlePositions[idx] += Math.sin(clock * 3 + i) * 0.003 * speed;
        }
      }
      particlePosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      coreGeo.dispose();
      coreMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative flex h-full min-h-[260px] w-full cursor-grab items-center justify-center active:cursor-grabbing ${className}`}
      title="Khối cầu sóng âm 3D: Di chuột để xoay góc nhìn"
    />
  );
}
