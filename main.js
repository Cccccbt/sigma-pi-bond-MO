const sceneEl = document.querySelector("#scene");
const equationEl = document.querySelector("#equation");
const modeTitleEl = document.querySelector("#modeTitle");
const orbitalTypeEl = document.querySelector("#orbitalType");
const distanceEl = document.querySelector("#distance");
const thresholdEl = document.querySelector("#threshold");
const distanceValueEl = document.querySelector("#distanceValue");
const thresholdValueEl = document.querySelector("#thresholdValue");
const formationEl = document.querySelector("#formation");
const formationValueEl = document.querySelector("#formationValue");
const playFormationEl = document.querySelector("#playFormation");
const overlapValueEl = document.querySelector("#overlapValue");
const energyValueEl = document.querySelector("#energyValue");
const showWaveEl = document.querySelector("#showWave");
const showPhaseEl = document.querySelector("#showPhase");
const showDensityEl = document.querySelector("#showDensity");
const showMOLobesEl = document.querySelector("#showMOLobes");
const showAtomicEl = document.querySelector("#showAtomic");
const showNodeEl = document.querySelector("#showNode");
const animateEl = document.querySelector("#animate");
const phaseLegendEls = [...document.querySelectorAll(".phase-positive, .phase-negative")];
const densityLegendEl = document.querySelector(".density-legend");
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const noteEls = [...document.querySelectorAll("[data-note]")];

const state = {
  mode: "bonding",
  orbital: "px",
  distance: Number(distanceEl.value),
  threshold: Number(thresholdEl.value),
  formation: Number(formationEl.value),
  playingFormation: false,
};

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sceneEl.clientWidth, sceneEl.clientHeight);
if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
} else {
  renderer.outputEncoding = THREE.sRGBEncoding;
}
sceneEl.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x101114, 0.045);

const camera = new THREE.PerspectiveCamera(42, sceneEl.clientWidth / sceneEl.clientHeight, 0.1, 100);
camera.position.set(6, 4.6, 7.4);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 4.2;
controls.maxDistance = 15;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xf6efe0, 0x2b3140, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);

const root = new THREE.Group();
scene.add(root);

const positiveMaterial = new THREE.MeshStandardMaterial({
  color: 0x2cc8b8,
  emissive: 0x0b5d55,
  emissiveIntensity: 0.18,
  transparent: true,
  opacity: 0.34,
  roughness: 0.44,
  metalness: 0.05,
  depthWrite: false,
});
const negativeMaterial = new THREE.MeshStandardMaterial({
  color: 0xef5b64,
  emissive: 0x65151b,
  emissiveIntensity: 0.14,
  transparent: true,
  opacity: 0.34,
  roughness: 0.46,
  metalness: 0.04,
  depthWrite: false,
});
const nucleusMaterial = new THREE.MeshStandardMaterial({
  color: 0xf2c14e,
  emissive: 0x8a5b08,
  emissiveIntensity: 0.22,
  roughness: 0.28,
});
const atomicMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.2,
  wireframe: true,
});
const atomicPositiveMaterial = new THREE.MeshStandardMaterial({
  color: 0x2cc8b8,
  emissive: 0x0b5d55,
  emissiveIntensity: 0.08,
  transparent: true,
  opacity: 0.24,
  roughness: 0.58,
  depthWrite: false,
});
const atomicNegativeMaterial = new THREE.MeshStandardMaterial({
  color: 0xef5b64,
  emissive: 0x65151b,
  emissiveIntensity: 0.08,
  transparent: true,
  opacity: 0.24,
  roughness: 0.58,
  depthWrite: false,
});
const moPositiveMaterial = new THREE.MeshStandardMaterial({
  color: 0x2cc8b8,
  emissive: 0x0b5d55,
  emissiveIntensity: 0.12,
  transparent: true,
  opacity: 0.32,
  roughness: 0.5,
  depthWrite: false,
});
const moNegativeMaterial = new THREE.MeshStandardMaterial({
  color: 0xef5b64,
  emissive: 0x65151b,
  emissiveIntensity: 0.1,
  transparent: true,
  opacity: 0.32,
  roughness: 0.5,
  depthWrite: false,
});
const moWireMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.16,
  wireframe: true,
});
const nodeMaterial = new THREE.MeshBasicMaterial({
  color: 0x6598ff,
  transparent: true,
  opacity: 0.22,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const densityMaterial = new THREE.MeshBasicMaterial({
  color: 0xffd66b,
  transparent: true,
  opacity: 0.1,
  depthWrite: false,
});

const voxelGeometry = new THREE.SphereGeometry(0.055, 8, 8);
const maxInstances = 9000;
const positiveMesh = new THREE.InstancedMesh(voxelGeometry, positiveMaterial, maxInstances);
const negativeMesh = new THREE.InstancedMesh(voxelGeometry, negativeMaterial, maxInstances);
positiveMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
negativeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
root.add(positiveMesh, negativeMesh);

const densityGeometry = new THREE.SphereGeometry(0.038, 7, 7);
const maxDensityInstances = 12000;
const densityMesh = new THREE.InstancedMesh(densityGeometry, densityMaterial, maxDensityInstances);
densityMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
densityMesh.visible = false;
root.add(densityMesh);

const nuclei = new THREE.Group();
const nucleusGeometry = new THREE.SphereGeometry(0.17, 32, 18);
const nucleusA = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
const nucleusB = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
nuclei.add(nucleusA, nucleusB);
root.add(nuclei);

const atomicGroup = new THREE.Group();
root.add(atomicGroup);

const moLobeGroup = new THREE.Group();
root.add(moLobeGroup);

const nodeGroup = new THREE.Group();
root.add(nodeGroup);

const waveGroup = new THREE.Group();
root.add(waveGroup);

const bondGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 16);
const bondMaterial = new THREE.MeshBasicMaterial({ color: 0xf4f1ea, transparent: true, opacity: 0.38 });
const bond = new THREE.Mesh(bondGeometry, bondMaterial);
bond.rotation.z = Math.PI / 2;
root.add(bond);

const samplePoints = [];
const gridSize = 35;
const span = 4.8;
const step = (span * 2) / (gridSize - 1);
for (let ix = 0; ix < gridSize; ix += 1) {
  for (let iy = 0; iy < gridSize; iy += 1) {
    for (let iz = 0; iz < gridSize; iz += 1) {
      const x = -span + ix * step;
      const y = -span + iy * step;
      const z = -span + iz * step;
      if (Math.sqrt(x * x + y * y + z * z) < span * 1.02) samplePoints.push(new THREE.Vector3(x, y, z));
    }
  }
}

const dummy = new THREE.Object3D();
const waveSampleCount = 140;
const waveSpan = 4.8;
const waveGeometryA = new THREE.BufferGeometry();
const waveGeometryB = new THREE.BufferGeometry();
const waveGeometryMO = new THREE.BufferGeometry();
const waveAxisGeometry = new THREE.BufferGeometry();
const wavePositionsA = new Float32Array(waveSampleCount * 3);
const wavePositionsB = new Float32Array(waveSampleCount * 3);
const wavePositionsMO = new Float32Array(waveSampleCount * 3);
const waveAxisPositions = new Float32Array(waveSampleCount * 3);
waveGeometryA.setAttribute("position", new THREE.BufferAttribute(wavePositionsA, 3));
waveGeometryB.setAttribute("position", new THREE.BufferAttribute(wavePositionsB, 3));
waveGeometryMO.setAttribute("position", new THREE.BufferAttribute(wavePositionsMO, 3));
waveAxisGeometry.setAttribute("position", new THREE.BufferAttribute(waveAxisPositions, 3));

const waveAxis = new THREE.Line(
  waveAxisGeometry,
  new THREE.LineBasicMaterial({ color: 0xf4f1ea, transparent: true, opacity: 0.36 }),
);
const waveA = new THREE.Line(
  waveGeometryA,
  new THREE.LineBasicMaterial({ color: 0x2cc8b8, transparent: true, opacity: 0.82 }),
);
const waveB = new THREE.Line(
  waveGeometryB,
  new THREE.LineBasicMaterial({ color: 0xef5b64, transparent: true, opacity: 0.82 }),
);
const waveMO = new THREE.Line(
  waveGeometryMO,
  new THREE.LineBasicMaterial({ color: 0xf2c14e, transparent: true, opacity: 0.95 }),
);
waveGroup.add(waveAxis, waveA, waveB, waveMO);

function easeInOut(value) {
  return value * value * (3 - 2 * value);
}

function effectiveDistance() {
  const startDistance = Math.max(4.6, state.distance + 1.4);
  return startDistance + (state.distance - startDistance) * easeInOut(state.formation);
}

function atomicValue(point, center, side) {
  const x = point.x - center;
  const r = Math.sqrt(x * x + point.y * point.y + point.z * point.z);
  const envelope = Math.exp(-r / 1.08);
  if (state.orbital === "px") return side * x * envelope;
  return point.y * envelope;
}

function molecularValue(point) {
  const half = effectiveDistance() / 2;
  const a = atomicValue(point, -half, 1);
  const b = atomicValue(point, half, state.orbital === "px" ? -1 : 1);
  return state.mode === "bonding" ? a + b : a - b;
}

function updateWaveModel(time) {
  waveGroup.visible = showWaveEl.checked;
  if (!waveGroup.visible) return;

  const distance = effectiveDistance();
  const half = distance / 2;
  const phase = Math.sin(time * 0.0032);
  const baseZ = state.orbital === "py" ? -2.15 : -1.95;
  const waveCenter = state.orbital === "py" ? 1.05 : 0.88;

  for (let index = 0; index < waveSampleCount; index += 1) {
    const x = -waveSpan + (index / (waveSampleCount - 1)) * waveSpan * 2;
    const sampleY = state.orbital === "py" ? 0.72 : 0;
    const point = new THREE.Vector3(x, sampleY, 0);
    const a = atomicValue(point, -half, 1);
    const b = atomicValue(point, half, state.orbital === "px" ? -1 : 1);
    const combined = state.mode === "bonding" ? a + b : a - b;
    const displayB = state.mode === "bonding" ? b : -b;
    const waveScale = state.orbital === "py" ? 0.9 : 1.15;

    wavePositionsA[index * 3] = x;
    wavePositionsA[index * 3 + 1] = waveCenter + a * phase * waveScale;
    wavePositionsA[index * 3 + 2] = baseZ;

    wavePositionsB[index * 3] = x;
    wavePositionsB[index * 3 + 1] = waveCenter + displayB * phase * waveScale;
    wavePositionsB[index * 3 + 2] = baseZ;

    wavePositionsMO[index * 3] = x;
    wavePositionsMO[index * 3 + 1] = waveCenter + combined * phase * waveScale * 0.72;
    wavePositionsMO[index * 3 + 2] = baseZ;

    waveAxisPositions[index * 3] = x;
    waveAxisPositions[index * 3 + 1] = waveCenter;
    waveAxisPositions[index * 3 + 2] = baseZ;
  }

  waveGeometryA.attributes.position.needsUpdate = true;
  waveGeometryB.attributes.position.needsUpdate = true;
  waveGeometryMO.attributes.position.needsUpdate = true;
  waveAxisGeometry.attributes.position.needsUpdate = true;
}

function addAtomicShell(center, side) {
  const lobeGeometry = new THREE.SphereGeometry(0.48, 24, 16);
  const positiveLobe = new THREE.Mesh(lobeGeometry, atomicPositiveMaterial);
  const negativeLobe = new THREE.Mesh(lobeGeometry, atomicNegativeMaterial);
  const positiveWire = new THREE.Mesh(lobeGeometry, atomicMaterial);
  const negativeWire = new THREE.Mesh(lobeGeometry, atomicMaterial);
  const lobes = [positiveLobe, negativeLobe, positiveWire, negativeWire];
  if (state.orbital === "px") {
    lobes.forEach((lobe) => lobe.scale.set(1.35, 0.78, 0.78));
    positiveLobe.position.set(center + side * 0.52, 0, 0);
    positiveWire.position.copy(positiveLobe.position);
    negativeLobe.position.set(center - side * 0.52, 0, 0);
    negativeWire.position.copy(negativeLobe.position);
  } else {
    lobes.forEach((lobe) => lobe.scale.set(0.78, 1.35, 0.78));
    positiveLobe.position.set(center, 0.52, 0);
    positiveWire.position.copy(positiveLobe.position);
    negativeLobe.position.set(center, -0.52, 0);
    negativeWire.position.copy(negativeLobe.position);
  }
  atomicGroup.add(positiveLobe, negativeLobe, positiveWire, negativeWire);
}

function addMOLobe(position, scale, material) {
  const geometry = new THREE.SphereGeometry(0.55, 32, 18);
  const lobe = new THREE.Mesh(geometry, material);
  const wire = new THREE.Mesh(geometry, moWireMaterial);
  lobe.position.copy(position);
  wire.position.copy(position);
  lobe.scale.copy(scale);
  wire.scale.copy(scale);
  moLobeGroup.add(lobe, wire);
}

function makeMOLobes(distance) {
  moLobeGroup.clear();
  const progress = easeInOut(state.formation);
  const fadeScale = 0.3 + progress * 0.7;
  moLobeGroup.visible = showMOLobesEl.checked && progress > 0.04;

  if (state.orbital === "px") {
    if (state.mode === "bonding") {
      addMOLobe(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3((distance * 0.78 + 0.9) * fadeScale, 0.82 * fadeScale, 0.82 * fadeScale),
        moPositiveMaterial,
      );
    } else {
      addMOLobe(
        new THREE.Vector3(-distance * 0.33, 0, 0),
        new THREE.Vector3(1.18 * fadeScale, 0.78 * fadeScale, 0.78 * fadeScale),
        moPositiveMaterial,
      );
      addMOLobe(
        new THREE.Vector3(distance * 0.33, 0, 0),
        new THREE.Vector3(1.18 * fadeScale, 0.78 * fadeScale, 0.78 * fadeScale),
        moNegativeMaterial,
      );
    }
    return;
  }

  if (state.mode === "bonding") {
    addMOLobe(
      new THREE.Vector3(0, 0.62 * fadeScale, 0),
      new THREE.Vector3((distance * 0.58 + 0.72) * fadeScale, 0.52 * fadeScale, 0.78 * fadeScale),
      moPositiveMaterial,
    );
    addMOLobe(
      new THREE.Vector3(0, -0.62 * fadeScale, 0),
      new THREE.Vector3((distance * 0.58 + 0.72) * fadeScale, 0.52 * fadeScale, 0.78 * fadeScale),
      moNegativeMaterial,
    );
  } else {
    const x = distance * 0.34;
    const y = 0.62 * fadeScale;
    const scale = new THREE.Vector3(0.82 * fadeScale, 0.52 * fadeScale, 0.72 * fadeScale);
    addMOLobe(new THREE.Vector3(-x, y, 0), scale, moPositiveMaterial);
    addMOLobe(new THREE.Vector3(x, y, 0), scale, moNegativeMaterial);
    addMOLobe(new THREE.Vector3(-x, -y, 0), scale, moNegativeMaterial);
    addMOLobe(new THREE.Vector3(x, -y, 0), scale, moPositiveMaterial);
  }
}

function makeNodePlanes() {
  nodeGroup.clear();
  if (state.mode === "antibonding") {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 4.8), nodeMaterial);
    plane.rotation.y = Math.PI / 2;
    nodeGroup.add(plane);
  }
  if (state.orbital === "py") {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), nodeMaterial);
    plane.rotation.x = Math.PI / 2;
    nodeGroup.add(plane);
  }
}

function updateScene() {
  const currentDistance = effectiveDistance();
  const half = currentDistance / 2;
  nucleusA.position.x = -half;
  nucleusB.position.x = half;
  bond.position.set(0, 0, 0);
  bond.scale.set(1, currentDistance, 1);

  atomicGroup.clear();
  addAtomicShell(-half, 1);
  addAtomicShell(half, state.orbital === "px" ? -1 : 1);
  atomicGroup.visible = showAtomicEl.checked;
  makeMOLobes(currentDistance);
  nodeGroup.visible = showNodeEl.checked;
  makeNodePlanes();

  let positiveCount = 0;
  let negativeCount = 0;
  let densityCount = 0;
  const threshold = state.threshold;
  const sorted = samplePoints
    .map((point) => ({ point, value: molecularValue(point) }))
    .filter(({ value }) => Math.abs(value) > threshold)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, maxInstances * 2);

  for (const { point, value } of sorted) {
    if (densityCount < maxDensityInstances) {
      const densityStrength = Math.min(1, (value * value) / (threshold * threshold * 8));
      dummy.position.copy(point);
      dummy.scale.setScalar(0.38 + Math.sqrt(densityStrength) * 1.05);
      dummy.updateMatrix();
      densityMesh.setMatrixAt(densityCount, dummy.matrix);
      densityCount += 1;
    }

    const count = value > 0 ? positiveCount : negativeCount;
    if (count >= maxInstances) continue;
    const strength = Math.min(1, Math.abs(value) / (threshold * 3.2));
    dummy.position.copy(point);
    dummy.scale.setScalar(0.72 + strength * 1.25);
    dummy.updateMatrix();
    if (value > 0) {
      positiveMesh.setMatrixAt(positiveCount, dummy.matrix);
      positiveCount += 1;
    } else {
      negativeMesh.setMatrixAt(negativeCount, dummy.matrix);
      negativeCount += 1;
    }
  }

  positiveMesh.count = positiveCount;
  negativeMesh.count = negativeCount;
  positiveMesh.instanceMatrix.needsUpdate = true;
  negativeMesh.instanceMatrix.needsUpdate = true;
  densityMesh.count = densityCount;
  densityMesh.instanceMatrix.needsUpdate = true;

  const overlap = Math.exp(-currentDistance / 2.4);
  const displayOverlap = state.mode === "bonding" ? overlap : -overlap;
  const bondLabel = state.orbital === "py" ? "pi" : "sigma";
  const showPhase = showPhaseEl.checked;
  positiveMesh.visible = showPhase;
  negativeMesh.visible = showPhase;
  densityMesh.visible = showDensityEl.checked;
  phaseLegendEls.forEach((item) => item.parentElement.classList.toggle("muted-legend", !showPhase));
  densityLegendEl.classList.toggle("muted-legend", !showDensityEl.checked);
  overlapValueEl.textContent = displayOverlap.toFixed(2);
  energyValueEl.textContent = state.mode === "bonding" ? "lower" : "higher";
  distanceValueEl.textContent = `${state.distance.toFixed(1)} A`;
  thresholdValueEl.textContent = state.threshold.toFixed(2);
  formationEl.value = state.formation.toFixed(2);
  formationValueEl.textContent =
    state.formation < 0.08 ? "separate AOs" : state.formation > 0.92 ? "MO formed" : "forming MO";
  playFormationEl.textContent = state.playingFormation ? "pause" : "play";
  playFormationEl.setAttribute("aria-pressed", String(state.playingFormation));
  modeTitleEl.textContent = `${bondLabel} ${state.mode} orbital`;
  equationEl.textContent = `psi(MO) = psi(A) ${state.mode === "bonding" ? "+" : "-"} psi(B)`;

  noteEls.forEach((note) => note.classList.toggle("active", note.dataset.note === state.orbital));
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    state.mode = button.dataset.mode;
    updateScene();
  });
});

orbitalTypeEl.addEventListener("change", () => {
  state.orbital = orbitalTypeEl.value;
  updateScene();
});

distanceEl.addEventListener("input", () => {
  state.distance = Number(distanceEl.value);
  updateScene();
});

thresholdEl.addEventListener("input", () => {
  state.threshold = Number(thresholdEl.value);
  updateScene();
});

formationEl.addEventListener("input", () => {
  state.formation = Number(formationEl.value);
  state.playingFormation = false;
  updateScene();
});

playFormationEl.addEventListener("click", () => {
  state.playingFormation = !state.playingFormation;
  if (state.playingFormation && state.formation >= 1) state.formation = 0;
  updateScene();
});

showAtomicEl.addEventListener("change", () => {
  atomicGroup.visible = showAtomicEl.checked;
});

showMOLobesEl.addEventListener("change", () => {
  moLobeGroup.visible = showMOLobesEl.checked;
});

showWaveEl.addEventListener("change", () => {
  waveGroup.visible = showWaveEl.checked;
});

showNodeEl.addEventListener("change", () => {
  nodeGroup.visible = showNodeEl.checked;
});

showPhaseEl.addEventListener("change", () => {
  updateScene();
});

showDensityEl.addEventListener("change", () => {
  densityMesh.visible = showDensityEl.checked;
  densityLegendEl.classList.toggle("muted-legend", !showDensityEl.checked);
});

function resize() {
  const { clientWidth, clientHeight } = sceneEl;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}

window.addEventListener("resize", resize);

function tick() {
  updateWaveModel(performance.now());
  if (animateEl.checked) root.rotation.y += 0.0028;
  if (state.playingFormation) {
    state.formation = Math.min(1, state.formation + 0.006);
    if (state.formation >= 1) state.playingFormation = false;
    updateScene();
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

updateScene();
tick();
