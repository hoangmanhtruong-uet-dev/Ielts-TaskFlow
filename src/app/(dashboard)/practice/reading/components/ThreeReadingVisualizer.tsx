"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type ReadingVisualMode = "matrix" | "laser" | "cluster";

export interface ThreeReadingVisualizerProps {
  isScanning: boolean;
  visualMode: ReadingVisualMode;
  readingSpeedWpm: number;
  className?: string;
}

export function ThreeReadingVisualizer({
  isScanning,
  visualMode,
  readingSpeedWpm,
  className = "",
}: ThreeReadingVisualizerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ isScanning, visualMode, readingSpeedWpm });

  useEffect(() => {
    stateRef.current = { isScanning, visualMode, readingSpeedWpm };
  }, [isScanning, visualMode, readingSpeedWpm]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 5.0;

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

    // 1. Central Lexical Polyhedron (Dodecahedron Wireframe)
    const polyGeo = new THREE.DodecahedronGeometry(1.4, 1);
    const polyMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const polyMesh = new THREE.Mesh(polyGeo, polyMat);
    mainGroup.add(polyMesh);

    // 2. Laser Scanning Beam Ring
    const laserRingGeo = new THREE.RingGeometry(1.5, 1.55, 64);
    const laserRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald Green Laser
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const laserRingMesh = new THREE.Mesh(laserRingGeo, laserRingMat);
    laserRingMesh.rotation.x = Math.PI / 2;
    mainGroup.add(laserRingMesh);

    // 3. Floating Lexical Nodes (Keywords Cloud)
    const nodeCount = 650;
    const posArray = new Float32Array(nodeCount * 3);
    const colorArray = new Float32Array(nodeCount * 3);

    const colorIndigo = new THREE.Color("#818cf8");
    const colorEmerald = new THREE.Color("#34d399");
    const colorAmber = new THREE.Color("#fbbf24");

    for (let i = 0; i < nodeCount; i++) {
      const radius = 1.7 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i * 3 + 2] = radius * Math.cos(phi);

      const mixed =
        Math.random() > 0.5
          ? colorIndigo.clone().lerp(colorEmerald, Math.random())
          : colorAmber;
      colorArray[i * 3] = mixed.r;
      colorArray[i * 3 + 1] = mixed.g;
      colorArray[i * 3 + 2] = mixed.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const nodeMesh = new THREE.Points(nodeGeo, nodeMat);
    mainGroup.add(nodeMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = mouseX * 1.4;
      targetRotationX = mouseY * 1.4;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // ResizeObserver
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
        isScanning: scanning,
        visualMode: mode,
        readingSpeedWpm: wpm,
      } = stateRef.current;
      const speedFactor = (wpm / 250) * (scanning ? 1.8 : 0.85);
      clock += 0.02 * speedFactor;

      // Mouse Smooth Drag
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

      // Polyhedron Spin
      polyMesh.rotation.y += 0.005 * speedFactor;
      polyMesh.rotation.x += 0.003 * speedFactor;

      // Laser Scanner Sweep Up and Down
      const laserY = Math.sin(clock * 1.5) * 1.4;
      laserRingMesh.position.y = laserY;

      if (scanning) {
        laserRingMat.opacity = 0.95;
        laserRingMat.color.setHex(0x10b981); // Bright Emerald
      } else {
        laserRingMat.opacity = 0.45;
        laserRingMat.color.setHex(0x6366f1); // Indigo standby
      }

      // Mode adjustments
      if (mode === "laser") {
        polyMat.wireframe = true;
        polyMat.color.setHex(0x10b981);
        nodeMat.size = 0.055;
      } else if (mode === "cluster") {
        polyMat.wireframe = false;
        polyMat.color.setHex(0x4f46e5);
        nodeMat.size = 0.04;
      } else {
        // matrix
        polyMat.wireframe = true;
        polyMat.color.setHex(scanning ? 0x06b6d4 : 0x6366f1);
        nodeMat.size = 0.048;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      polyGeo.dispose();
      polyMat.dispose();
      laserRingGeo.dispose();
      laserRingMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
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
      title="Khối ma trận từ vựng 3D: Di chuột để xoay góc nhìn"
    />
  );
}
