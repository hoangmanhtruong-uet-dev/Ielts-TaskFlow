"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import * as THREE from "three";

const subscribeNoop = () => () => {};
let cachedTrajectoryWebGL: boolean | null = null;
function getWebGLSupport(): boolean {
  if (cachedTrajectoryWebGL !== null) return cachedTrajectoryWebGL;
  try {
    const canvas = document.createElement("canvas");
    cachedTrajectoryWebGL = Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    cachedTrajectoryWebGL = false;
  }
  return cachedTrajectoryWebGL;
}

export interface TrajectoryWeek {
  id: number;
  label: string;
  band: number;
  hours: string;
  note: string;
}

interface ScoreTrajectory3DProps {
  weeks: TrajectoryWeek[];
  selectedWeekIndex: number;
  onSelectWeek: (index: number) => void;
  targetBand?: number | null;
}

export function ScoreTrajectory3D({
  weeks,
  selectedWeekIndex,
  onSelectWeek,
  targetBand = null,
}: ScoreTrajectory3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const initialWebGL = useSyncExternalStore(
    subscribeNoop,
    getWebGLSupport,
    () => true,
  );
  const [rendererFailed, setRendererFailed] = useState(false);
  const webGLSupported = initialWebGL && !rendererFailed;
  const [is3DView, setIs3DView] = useState(true);

  const camState = useRef({
    theta: 0.18,
    phi: 1.18,
    radius: 17.5,
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    downMouse: { x: 0, y: 0 },
  });

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const hasEnoughPoints = weeks.length >= 2;

  const toggleCameraView = useCallback(() => {
    setIs3DView((prev) => {
      const next = !prev;
      if (camState.current) {
        if (!next) {
          camState.current.theta = 0;
          camState.current.phi = Math.PI / 2;
        } else {
          camState.current.theta = 0.22;
          camState.current.phi = 1.18;
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!hasEnoughPoints || !initialWebGL) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 350;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch {
      queueMicrotask(() => setRendererFailed(true));
      return;
    }

    scene.add(new THREE.AmbientLight(0x94a3b8, 0.9));
    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    dirLight.position.set(8, 16, 12);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2.5, 25);
    pointLight.position.set(4, 5, 4);
    scene.add(pointLight);

    const grid = new THREE.GridHelper(24, 24, 0x2e3250, 0x171929);
    grid.position.y = -2.2;
    scene.add(grid);

    const count = weeks.length;
    const points: THREE.Vector3[] = weeks.map((w, idx) => {
      const x = (idx - (count - 1) / 2) * 2.8;
      const y = (w.band - 5.0) * 2.2 - 1.2;
      return new THREE.Vector3(x, y, 0);
    });

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.1, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4338ca,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    const orbs: THREE.Mesh[] = [];
    points.forEach((pt, idx) => {
      const isSelected = idx === selectedWeekIndex;
      const geo = new THREE.SphereGeometry(isSelected ? 0.65 : 0.5, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x818cf8 : 0x6366f1,
        emissive: isSelected ? 0xa5b4fc : 0x4f46e5,
        emissiveIntensity: isSelected ? 1.0 : 0.5,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pt);
      mesh.userData = { index: idx };
      scene.add(mesh);
      orbs.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      camState.current.isDragging = true;
      camState.current.prevMouse = { x: e.clientX, y: e.clientY };
      camState.current.downMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!camState.current.isDragging) return;
      const dx = e.clientX - camState.current.prevMouse.x;
      const dy = e.clientY - camState.current.prevMouse.y;
      camState.current.prevMouse = { x: e.clientX, y: e.clientY };

      camState.current.theta -= dx * 0.007;
      camState.current.phi = Math.max(
        0.65,
        Math.min(1.48, camState.current.phi - dy * 0.006),
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!camState.current.isDragging) return;
      camState.current.isDragging = false;
      const dist = Math.hypot(
        e.clientX - camState.current.downMouse.x,
        e.clientY - camState.current.downMouse.y,
      );
      if (dist < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(orbs);
        if (hits.length > 0) {
          const hitIdx = hits[0].object.userData.index as number;
          onSelectWeek(hitIdx);
        }
      }
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const r = camState.current.radius;
      const t = camState.current.theta;
      const p = camState.current.phi;

      camera.position.x = r * Math.sin(p) * Math.sin(t);
      camera.position.y = r * Math.cos(p) + 1.2;
      camera.position.z = r * Math.sin(p) * Math.cos(t);
      camera.lookAt(0, 1.2, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      canvasEl.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [hasEnoughPoints, initialWebGL, weeks, selectedWeekIndex, onSelectWeek]);

  const activeWeek =
    weeks[selectedWeekIndex] ?? weeks[weeks.length - 1] ?? null;

  return (
    <div className="rounded-2xl border border-[#232637] bg-[#141621] p-5 shadow-xl sm:p-6">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-extrabold text-white sm:text-lg">
            Xu hướng điểm số theo dữ liệu thực
          </h2>
          <p className="text-xs text-gray-400">
            Tính từ các lần thi thử & luyện tập đã nộp trong hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
            <span>Band ước tính</span>
          </div>
          {targetBand !== null ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
              <span>Mục tiêu ({targetBand.toFixed(1)})</span>
            </div>
          ) : null}
          {hasEnoughPoints ? (
            <button
              onClick={toggleCameraView}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-[#1d2030] px-2.5 py-1 text-[11px] font-bold text-indigo-300 transition hover:bg-indigo-600/30"
              aria-label="Chuyển góc nhìn 3D hoặc 2D"
            >
              <span>Góc nhìn: {is3DView ? "3D" : "2D"}</span>
            </button>
          ) : null}
        </div>
      </div>

      {!hasEnoughPoints ? (
        <div className="flex h-[240px] w-full flex-col items-center justify-center rounded-xl border border-[#1f2233] bg-[#0e1018] p-6 text-center">
          <p className="mb-1 text-sm font-bold text-white">
            Chưa đủ dữ liệu qua các mốc để vẽ biểu đồ quỹ đạo
          </p>
          <p className="max-w-md text-xs text-gray-400">
            Hoàn thành ít nhất 2 bài luyện tập có chấm điểm hoặc đề thi thử
            (Mock Test) ở các mốc khác nhau để xem xu hướng Band điểm thực tế.
          </p>
        </div>
      ) : (
        <>
          <div className="relative h-[330px] w-full overflow-hidden rounded-xl border border-[#1f2233] bg-[#0e1018] sm:h-[360px]">
            {targetBand !== null ? (
              <div className="pointer-events-none absolute top-12 right-8 left-8 z-10 flex justify-end border-t-2 border-dashed border-gray-500/45">
                <span className="-mt-5 rounded border border-white/10 bg-[#141621]/90 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                  Target Band {targetBand.toFixed(1)}
                </span>
              </div>
            ) : null}

            {webGLSupported ? (
              <div
                ref={mountRef}
                className="h-full w-full cursor-grab active:cursor-grabbing"
                data-testid="trajectory-3d-canvas"
              />
            ) : (
              <div className="flex h-full w-full flex-col justify-end p-6">
                <svg
                  className="h-48 w-full overflow-visible"
                  viewBox="0 0 600 200"
                >
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="4"
                    points={weeks
                      .map((w, idx) => {
                        const x =
                          50 + idx * (500 / Math.max(1, weeks.length - 1));
                        const y = Math.min(
                          185,
                          Math.max(20, 180 - (w.band - 4.0) * 32),
                        );
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                  {weeks.map((w, idx) => {
                    const x = 50 + idx * (500 / Math.max(1, weeks.length - 1));
                    const y = Math.min(
                      185,
                      Math.max(20, 180 - (w.band - 4.0) * 32),
                    );
                    const isSelected = idx === selectedWeekIndex;
                    return (
                      <circle
                        key={w.id}
                        cx={x}
                        cy={y}
                        r={isSelected ? 9 : 6}
                        fill={isSelected ? "#818cf8" : "#6366f1"}
                        stroke="#fff"
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer"
                        onClick={() => onSelectWeek(idx)}
                      />
                    );
                  })}
                </svg>
              </div>
            )}

            {activeWeek ? (
              <div className="glass-panel pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-3 rounded-xl px-3.5 py-2">
                <div className="h-8 w-2.5 rounded-full bg-indigo-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white">
                      {activeWeek.label}
                    </span>
                    <span className="rounded bg-indigo-600 px-2 py-0.5 text-[11px] font-black text-white">
                      Band {activeWeek.band.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">{activeWeek.note}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="mt-3 grid gap-2 border-t border-[#232637]/60 pt-2 text-center"
            style={{
              gridTemplateColumns: `repeat(${Math.min(6, weeks.length)}, minmax(0, 1fr))`,
            }}
          >
            {weeks.map((w, idx) => {
              const isSelected = idx === selectedWeekIndex;
              return (
                <button
                  key={w.id}
                  onClick={() => onSelectWeek(idx)}
                  className={`rounded-xl border p-2 text-center transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-600/30 text-white shadow-md shadow-indigo-600/20"
                      : "border-transparent bg-[#191c2a] text-gray-400 hover:border-[#232637] hover:text-white"
                  }`}
                >
                  <span className="block text-[11px] font-semibold">
                    {w.label}
                  </span>
                  <span className="block text-xs font-black text-indigo-400">
                    Band {w.band.toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
