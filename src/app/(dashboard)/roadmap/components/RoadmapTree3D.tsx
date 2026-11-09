"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const subscribeNoop = () => () => {};
let cachedRoadmapWebGL: boolean | null = null;
function getRoadmapWebGLSupport(): boolean {
  if (cachedRoadmapWebGL !== null) return cachedRoadmapWebGL;
  try {
    const canvas = document.createElement("canvas");
    cachedRoadmapWebGL = Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    cachedRoadmapWebGL = false;
  }
  return cachedRoadmapWebGL;
}

export interface RoadmapNode {
  id: string;
  phase: number;
  phaseTitle: string;
  title: string;
  subtitle: string;
  score: string;
  progressPercent: number;
  status: "completed" | "active" | "upcoming" | "locked";
  pos: [number, number, number];
  color: number;
  targetHref: string;
}

export const DEFAULT_ROADMAP_NODES: RoadmapNode[] = [
  {
    id: "starter-vocab",
    phase: 1,
    phaseTitle: "Phase 1: Nền tảng cơ bản",
    title: "Từ vựng nền tảng & Spaced Repetition",
    subtitle: "Hệ thống từ vựng thiết yếu theo trình độ",
    score: "Chưa bắt đầu",
    progressPercent: 0,
    status: "active",
    pos: [-12, 0.8, 3],
    color: 0x6366f1,
    targetHref: "/learn/vocabulary",
  },
  {
    id: "starter-grammar",
    phase: 1,
    phaseTitle: "Phase 1: Nền tảng cơ bản",
    title: "Ngữ pháp cốt lõi",
    subtitle: "Cấu trúc câu, thì và mệnh đề cơ bản",
    score: "Chưa bắt đầu",
    progressPercent: 0,
    status: "upcoming",
    pos: [-6, 1.6, -1],
    color: 0x38bdf8,
    targetHref: "/learn/grammar",
  },
  {
    id: "pre-ielts-listening",
    phase: 2,
    phaseTitle: "Phase 2: Thực hành kỹ năng IELTS",
    title: "Luyện nghe & Dictation",
    subtitle: "Nghe hiểu và chép chính tả từ âm thanh thực tế",
    score: "Chưa bắt đầu",
    progressPercent: 0,
    status: "upcoming",
    pos: [0, 2.4, 2],
    color: 0x38bdf8,
    targetHref: "/practice/listening",
  },
  {
    id: "pre-ielts-reading",
    phase: 2,
    phaseTitle: "Phase 2: Thực hành kỹ năng IELTS",
    title: "Reading Comprehension & T/F/NG",
    subtitle: "Đọc hiểu học thuật theo bài khóa thực tế",
    score: "Chưa bắt đầu",
    progressPercent: 0,
    status: "upcoming",
    pos: [6, 3.2, -1],
    color: 0x64748b,
    targetHref: "/practice/reading",
  },
  {
    id: "output-writing-speaking",
    phase: 3,
    phaseTitle: "Phase 3: Sản xuất ngôn ngữ & Thi thử",
    title: "Writing & Speaking Practice + Mock Exam",
    subtitle: "Viết luận, luyện nói và thi thử tổng hợp 4 kỹ năng",
    score: "Sẵn sàng luyện tập",
    progressPercent: 0,
    status: "upcoming",
    pos: [12, 4.2, 1.5],
    color: 0xf59e0b,
    targetHref: "/mock-tests",
  },
];

interface RoadmapTree3DProps {
  nodes?: RoadmapNode[];
  pacingMinutes?: number;
  onSelectNode?: (node: RoadmapNode) => void;
  onContinueLesson?: (node: RoadmapNode) => void;
  onTestOut?: () => void;
}

export function RoadmapTree3D({
  nodes,
  pacingMinutes = 35,
  onSelectNode,
  onContinueLesson,
  onTestOut,
}: RoadmapTree3DProps) {
  const displayNodes = useMemo(
    () => (nodes && nodes.length >= 2 ? nodes : DEFAULT_ROADMAP_NODES),
    [nodes],
  );

  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const initialWebGL = useSyncExternalStore(
    subscribeNoop,
    getRoadmapWebGLSupport,
    () => true,
  );
  const [rendererFailed, setRendererFailed] = useState(false);
  const webGLSupported = initialWebGL && !rendererFailed;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const selected = useMemo(() => {
    return (
      (selectedId
        ? displayNodes.find((n) => n.id === selectedId)
        : undefined) ??
      displayNodes.find((n) => n.status === "active") ??
      displayNodes[0]
    );
  }, [displayNodes, selectedId]);

  const handleNodeClick = useCallback(
    (node: RoadmapNode) => {
      setSelectedId(node.id);
      onSelectNode?.(node);
    },
    [onSelectNode],
  );

  const focusPhase = useCallback((phaseNumber: number) => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (phaseNumber === 0) {
      camera.position.set(0, 14, 22);
      controls.target.set(0, 2.5, 0);
    } else if (phaseNumber === 1) {
      camera.position.set(-9, 6, 9);
      controls.target.set(-9, 1.2, 0.5);
    } else if (phaseNumber === 2) {
      camera.position.set(3, 6, 9);
      controls.target.set(3, 2.8, 0);
    } else if (phaseNumber === 3) {
      camera.position.set(12, 8, 10);
      controls.target.set(12, 4.0, 1.0);
    }
    controls.update();
  }, []);

  useEffect(() => {
    if (!initialWebGL) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070910, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 13, 20);
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2.2, 0);
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const mainLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    mainLight.position.set(10, 20, 15);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0x6366f1, 2, 50);
    accentLight.position.set(3, 6, -1);
    scene.add(accentLight);

    const curve = new THREE.CatmullRomCurve3(
      displayNodes.map((n) => new THREE.Vector3(...n.pos)),
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.14, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      emissive: 0x3730a3,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });
    scene.add(new THREE.Mesh(tubeGeo, tubeMat));

    const nodeMeshes: THREE.Mesh[] = [];
    displayNodes.forEach((node) => {
      const radius = node.status === "active" ? 0.9 : 0.65;
      const geo = new THREE.SphereGeometry(radius, 28, 28);
      const mat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: node.status === "active" ? 0.9 : 0.4,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.pos);
      mesh.userData = { node };
      scene.add(mesh);
      nodeMeshes.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        const hitNode = hits[0].object.userData.node as RoadmapNode;
        handleNodeClick(hitNode);
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const speedMultiplier = Math.max(1, pacingMinutes / 35);
      accentLight.intensity =
        1.8 + Math.sin(clock.getElapsedTime() * 3 * speedMultiplier) * 0.6;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.dispose();
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [displayNodes, initialWebGL, pacingMinutes, handleNodeClick]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [autoRotate]);

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#070910] shadow-2xl">
      <div className="pointer-events-none absolute top-4 right-4 left-4 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => focusPhase(0)}
            className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-800"
            aria-label="Toàn cảnh lộ trình"
          >
            Toàn cảnh
          </button>
          <button
            onClick={() => focusPhase(1)}
            className="rounded-lg border border-emerald-500/30 bg-emerald-950/80 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur transition hover:bg-emerald-900/90"
            aria-label="Xem Phase 1"
          >
            Phase 1
          </button>
          <button
            onClick={() => focusPhase(2)}
            className="rounded-lg border border-indigo-500/40 bg-indigo-950/90 px-3 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur transition hover:bg-indigo-900"
            aria-label="Xem Phase 2"
          >
            Phase 2
          </button>
          <button
            onClick={() => focusPhase(3)}
            className="rounded-lg border border-purple-500/30 bg-purple-950/80 px-3 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur transition hover:bg-purple-900/80"
            aria-label="Xem Phase 3"
          >
            Phase 3
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className="rounded-lg border border-white/10 bg-slate-900/85 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
            aria-label="Bật tắt tự xoay"
          >
            Tự xoay: {autoRotate ? "Bật" : "Tắt"}
          </button>
        </div>
      </div>

      {webGLSupported ? (
        <div
          ref={mountRef}
          className="h-full w-full"
          data-testid="three-canvas-container"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#070910] p-6 text-center">
          <p className="mb-3 text-xs font-bold tracking-wider text-indigo-400 uppercase">
            Interactive Roadmap Graph
          </p>
          <div className="mb-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {displayNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNodeClick(n)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selected.id === n.id
                    ? "border-indigo-400 bg-indigo-600/30 text-white"
                    : "border-white/10 bg-[#121521] text-slate-300 hover:border-indigo-500/50"
                }`}
              >
                <span className="block text-[10px] opacity-70">
                  Phase {n.phase}
                </span>
                <span className="block truncate text-xs font-bold">
                  {n.title}
                </span>
                <span className="mt-1 block text-[10px] text-emerald-400">
                  {n.score}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        id="node-inspector"
        className="glass-card absolute right-4 bottom-4 left-4 z-20 flex flex-col items-start justify-between gap-4 rounded-xl border border-indigo-500/30 p-4 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-600/20">
            <span className="text-sm font-black text-indigo-300">
              {selected.progressPercent}%
            </span>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                PHASE {selected.phase} • {selected.status.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {selected.score}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{selected.title}</h3>
            <p className="text-xs text-slate-400">{selected.subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={() => onContinueLesson?.(selected)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            aria-label={`Học tiếp ${selected.title}`}
          >
            {selected.status === "completed"
              ? "Xem lại bài học"
              : "Mở mô-đun này →"}
          </button>
          <button
            onClick={() => onTestOut?.()}
            className="rounded-lg border border-white/10 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            aria-label="Làm bài thi thử Mock Test"
          >
            Mock Test
          </button>
        </div>
      </div>
    </div>
  );
}
