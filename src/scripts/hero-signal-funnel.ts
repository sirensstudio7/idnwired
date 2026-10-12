import * as THREE from "three";

const SEGMENT_COUNT = 150;

const params = {
  colorLine: "#ffffff",
  colorSignal: "#ffffff",
  useColor2: false,
  colorSignal2: "#ff0055",
  useColor3: false,
  colorSignal3: "#ffcc00",
  lineCount: 80,
  globalRotation: 0,
  positionX: 0,
  positionY: 0,
  spreadHeight: 30.33,
  spreadDepth: 0,
  curveLength: 50,
  straightLength: 100,
  curvePower: 0.8265,
  waveSpeed: 2.48,
  waveHeight: 0.145,
  lineOpacity: 0.557,
  signalCount: 94,
  speedGlobal: 0.345,
  trailLength: 3,
};

const TUNNEL_SCALE = 1.55;

type SignalState = {
  mesh: THREE.Line;
  laneIndex: number;
  speed: number;
  progress: number;
  history: THREE.Vector3[];
  assignedColor: THREE.Color;
};

function getPathPoint(t: number, lineIndex: number, time: number) {
  const totalLen = params.curveLength + params.straightLength;
  const currentX = -params.curveLength + t * totalLen;

  let y = 0;
  let z = 0;
  const spreadFactor = (lineIndex / params.lineCount - 0.5) * 2;

  if (currentX < 0) {
    const ratio = (currentX + params.curveLength) / params.curveLength;
    let shapeFactor = (Math.cos(ratio * Math.PI) + 1) / 2;
    shapeFactor = Math.pow(shapeFactor, params.curvePower);

    y = spreadFactor * params.spreadHeight * shapeFactor;
    z = spreadFactor * params.spreadDepth * shapeFactor;

    const waveFactor = shapeFactor;
    const wave =
      Math.sin(-time * params.waveSpeed - currentX * 0.1 + lineIndex) *
      params.waveHeight *
      waveFactor;
    y += wave;
  }

  return new THREE.Vector3(currentX, y, z);
}

export function initHeroSignalFunnel(root: HTMLElement) {
  if (root.dataset.signalFunnelReady === "1" && root.querySelector("canvas")) {
    return;
  }

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(58, 1, 1, 1000);
  camera.position.set(0, 0, 68);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    premultipliedAlpha: false,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.style.background = "transparent";
  root.appendChild(canvas);

  const contentGroup = new THREE.Group();
  contentGroup.rotation.z = THREE.MathUtils.degToRad(params.globalRotation);
  contentGroup.scale.set(-TUNNEL_SCALE, TUNNEL_SCALE, TUNNEL_SCALE);
  scene.add(contentGroup);

  /** Mirror puts cone on the right; shift so cone tip meets the right viewport edge. */
  function alignTunnelToView() {
    const w = root.clientWidth;
    const h = root.clientHeight;
    if (!w || !h) return;

    const dist = camera.position.z;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const visibleH = 2 * Math.tan(vFov / 2) * dist;
    const visibleW = visibleH * camera.aspect;

    const coneTipWorldX = params.curveLength * TUNNEL_SCALE;
    const posX = visibleW / 2 - coneTipWorldX;

    contentGroup.position.set(posX, params.positionY, 0);
  }

  const bgMaterial = new THREE.LineBasicMaterial({
    color: params.colorLine,
    transparent: true,
    opacity: params.lineOpacity,
    depthWrite: false,
  });

  const signalMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  });

  const signalColorObj1 = new THREE.Color(params.colorSignal);
  const signalColorObj2 = new THREE.Color(params.colorSignal2);
  const signalColorObj3 = new THREE.Color(params.colorSignal3);

  function pickSignalColor() {
    const choices = [signalColorObj1];
    if (params.useColor2) choices.push(signalColorObj2);
    if (params.useColor3) choices.push(signalColorObj3);
    return choices[Math.floor(Math.random() * choices.length)]!;
  }

  let backgroundLines: THREE.Line[] = [];
  let signals: SignalState[] = [];

  function createSignal() {
    const maxTrail = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxTrail * 3);
    const colors = new Float32Array(maxTrail * 3);

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mesh = new THREE.Line(geometry, signalMaterial);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    contentGroup.add(mesh);

    signals.push({
      mesh,
      laneIndex: Math.floor(Math.random() * params.lineCount),
      speed: 0.2 + Math.random() * 0.5,
      progress: Math.random(),
      history: [],
      assignedColor: pickSignalColor(),
    });
  }

  function rebuildSignals() {
    signals.forEach((s) => {
      contentGroup.remove(s.mesh);
      s.mesh.geometry.dispose();
    });
    signals = [];
    for (let i = 0; i < params.signalCount; i++) createSignal();
  }

  function rebuildLines() {
    backgroundLines.forEach((l) => {
      contentGroup.remove(l);
      l.geometry.dispose();
    });
    backgroundLines = [];

    for (let i = 0; i < params.lineCount; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(SEGMENT_COUNT * 3);
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const line = new THREE.Line(geometry, bgMaterial);
      line.userData.id = i;
      line.renderOrder = 0;
      contentGroup.add(line);
      backgroundLines.push(line);
    }
    rebuildSignals();
  }

  rebuildLines();

  const clock = new THREE.Clock();
  let running = true;
  let raf = 0;

  function resize() {
    const w = root.clientWidth;
    const h = root.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    alignTunnelToView();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(root);
  resize();

  const io = new IntersectionObserver(
    ([entry]) => {
      running = Boolean(entry?.isIntersecting);
      if (running) raf = requestAnimationFrame(tick);
    },
    { threshold: 0.05 },
  );
  io.observe(root);

  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);

    const time = clock.getElapsedTime();

    backgroundLines.forEach((line) => {
      const positions = line.geometry.attributes.position!.array as Float32Array;
      const lineId = line.userData.id as number;
      for (let j = 0; j < SEGMENT_COUNT; j++) {
        const t = j / (SEGMENT_COUNT - 1);
        const vec = getPathPoint(t, lineId, time);
        positions[j * 3] = vec.x;
        positions[j * 3 + 1] = vec.y;
        positions[j * 3 + 2] = vec.z;
      }
      line.geometry.attributes.position!.needsUpdate = true;
    });

    signals.forEach((sig) => {
      sig.progress -= sig.speed * 0.005 * params.speedGlobal;

      if (sig.progress < 0) {
        sig.progress = 1;
        sig.laneIndex = Math.floor(Math.random() * params.lineCount);
        sig.history = [];
        sig.assignedColor = pickSignalColor();
      }

      const pos = getPathPoint(sig.progress, sig.laneIndex, time);
      sig.history.push(pos);

      if (sig.history.length > params.trailLength + 1) {
        sig.history.shift();
      }

      const positions = sig.mesh.geometry.attributes.position!.array as Float32Array;
      const colors = sig.mesh.geometry.attributes.color!.array as Float32Array;

      const drawCount = Math.max(1, params.trailLength);
      const currentLen = sig.history.length;

      for (let i = 0; i < drawCount; i++) {
        let index = currentLen - 1 - i;
        if (index < 0) index = 0;

        const p = sig.history[index] ?? new THREE.Vector3();

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;

        let alpha = 1;
        if (params.trailLength > 0) {
          alpha = Math.max(0, 1 - i / params.trailLength);
        }

        colors[i * 3] = sig.assignedColor.r * alpha;
        colors[i * 3 + 1] = sig.assignedColor.g * alpha;
        colors[i * 3 + 2] = sig.assignedColor.b * alpha;
      }

      sig.mesh.geometry.setDrawRange(0, drawCount);
      sig.mesh.geometry.attributes.position!.needsUpdate = true;
      sig.mesh.geometry.attributes.color!.needsUpdate = true;
    });

    renderer.render(scene, camera);
  }

  raf = requestAnimationFrame(tick);
  root.dataset.signalFunnelReady = "1";

  return () => {
    delete root.dataset.signalFunnelReady;
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    backgroundLines.forEach((l) => {
      l.geometry.dispose();
    });
    signals.forEach((s) => s.mesh.geometry.dispose());
    bgMaterial.dispose();
    signalMaterial.dispose();
    renderer.dispose();
    canvas.remove();
  };
}

export function bootHeroSignalFunnel() {
  document
    .querySelectorAll<HTMLElement>("[data-hero-signal-root]")
    .forEach((root) => {
      if (root.dataset.signalFunnelReady === "1" && !root.querySelector("canvas")) {
        delete root.dataset.signalFunnelReady;
      }

      try {
        initHeroSignalFunnel(root);
      } catch (error) {
        delete root.dataset.signalFunnelReady;
        console.error("[hero-signal-funnel] failed to start", error);
      }
    });
}
