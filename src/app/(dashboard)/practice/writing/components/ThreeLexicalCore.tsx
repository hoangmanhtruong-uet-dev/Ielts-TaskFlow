"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeLexicalCoreProps {
  isTyping?: boolean;
}

export function ThreeLexicalCore({ isTyping = false }: ThreeLexicalCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(isTyping);

  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8.0;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Crystalline Octahedron (Lexical Diamond)
    const crystalGeo = new THREE.OctahedronGeometry(2.1, 1);
    const crystalMat = new THREE.MeshBasicMaterial({
      color: 0x5b5fef,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    mainGroup.add(crystalMesh);

    // Inner glowing core
    const innerGeo = new THREE.OctahedronGeometry(1.2, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Syntax Linker Nodes (Particles)
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.6 + (Math.random() - 0.5) * 0.8;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // 3. Orbital Syntactic Rings
    const ringGeo1 = new THREE.TorusGeometry(3.3, 0.02, 16, 80);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x5b5fef,
      transparent: true,
      opacity: 0.5,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 4;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.6, 0.015, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = -Math.PI / 3;
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
      const typingActive = isTypingRef.current;

      // Group rotation
      mainGroup.rotation.y +=
        (targetRotY - mainGroup.rotation.y) * 0.05 + 0.003;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

      // Pulse and spin crystal
      const pulseSpeed = typingActive ? 5.0 : 1.8;
      const pulseAmp = typingActive ? 0.15 : 0.05;
      const scale = 1.0 + Math.sin(elapsed * pulseSpeed) * pulseAmp;
      crystalMesh.scale.set(scale, scale, scale);

      crystalMesh.rotation.y += typingActive ? 0.02 : 0.005;
      crystalMesh.rotation.z += typingActive ? 0.015 : 0.003;
      innerMesh.rotation.x -= typingActive ? 0.025 : 0.007;

      // Ring rotations
      ring1.rotation.z += typingActive ? 0.02 : 0.006;
      ring2.rotation.x -= typingActive ? 0.018 : 0.005;

      // Color shift when typing
      if (typingActive) {
        crystalMat.color.setHex(0x00f0ff);
        innerMat.color.setHex(0xff0077);
      } else {
        crystalMat.color.setHex(0x5b5fef);
        innerMat.color.setHex(0xa855f7);
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
      crystalGeo.dispose();
      crystalMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
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
        aria-label="3D Lexical Crystal Visualizer"
      />
      {/* Cybernetic HUD overlay markers */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 font-mono text-[10px] text-[#A855F7]/70 select-none">
        <div className="flex justify-between">
          <span>{"// LEXICAL_CORE"}</span>
          <span>SYNTAX_MATRIX_v4</span>
        </div>
        <div className="flex justify-between">
          <span>
            {isTyping ? "TYPING STREAM ACTIVE" : "COHESION SYNCHRONIZED"}
          </span>
          <span>DISCOURSE_ENGINE</span>
        </div>
      </div>
    </div>
  );
}
