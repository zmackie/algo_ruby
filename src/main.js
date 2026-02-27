import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { MainspringBarrel } from './components/MainspringBarrel.js';
import { GearWheel } from './components/GearWheel.js';
import { EscapeWheel } from './components/EscapeWheel.js';
import { PalletFork } from './components/PalletFork.js';
import { BalanceWheel } from './components/BalanceWheel.js';
import { WatchPlate } from './components/WatchPlate.js';
import { GearTrain } from './systems/GearTrain.js';
import { Escapement } from './systems/Escapement.js';
import { createMaterialSet, updateMaterialSet, COLOR_THEMES } from './visuals/materials.js';
import { setupLighting } from './visuals/lighting.js';
import { setupPostProcessing } from './visuals/postprocessing.js';
import { createGui, getDefaultParams } from './controls/GuiControls.js';
import { getPitchRadius } from './utils/gearGeometry.js';

// ─── Scene Setup ───────────────────────────────────────────────
const scene = new THREE.Scene();
const params = getDefaultParams();
scene.background = new THREE.Color(COLOR_THEMES[params.colorTheme].background);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// CSS2D Label renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('canvas-container').appendChild(labelRenderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = params.autoRotate;
controls.autoRotateSpeed = 0.5;

// Post-processing
const { composer, bloomPass } = setupPostProcessing(renderer, scene, camera, {
  bloomStrength: params.bloomStrength,
  bloomRadius: params.bloomRadius,
});

// Lighting
const lights = setupLighting(scene, { ambientIntensity: params.ambientIntensity });

// ─── Materials ─────────────────────────────────────────────────
let materials = createMaterialSet(params.colorTheme);

// ─── Gear Train System ─────────────────────────────────────────
const gearTrain = new GearTrain({ speedMultiplier: 60 });
const escapement = new Escapement({
  frequency: gearTrain.getEscapeFrequency() / 2,
  amplitude: params.amplitude * (Math.PI / 180),
  springTension: params.springTension,
});

// ─── Watch Components ──────────────────────────────────────────
const MODULE = 0.12;

// Mainspring barrel
const barrel = new MainspringBarrel({
  material: materials.barrel,
  springMaterial: materials.spring,
  module: MODULE,
  teeth: gearTrain.barrelTeeth,
});
barrel.baseZ = -1.2;
scene.add(barrel.group);

// Center wheel
const centerWheel = new GearWheel({
  name: 'Center Wheel',
  wheelTeeth: gearTrain.centerWheelTeeth,
  pinionTeeth: gearTrain.centerPinionTeeth,
  module: MODULE,
  wheelMaterial: materials.gear,
  pinionMaterial: materials.pinion,
  spokeCount: 5,
  zPosition: -0.6,
});
centerWheel.baseZ = -0.6;
scene.add(centerWheel.group);

// Third wheel
const thirdWheel = new GearWheel({
  name: 'Third Wheel',
  wheelTeeth: gearTrain.thirdWheelTeeth,
  pinionTeeth: gearTrain.thirdPinionTeeth,
  module: MODULE,
  wheelMaterial: materials.gear,
  pinionMaterial: materials.pinion,
  spokeCount: 4,
  zPosition: 0,
});
thirdWheel.baseZ = 0;
scene.add(thirdWheel.group);

// Fourth wheel
const fourthWheel = new GearWheel({
  name: 'Fourth Wheel',
  wheelTeeth: gearTrain.fourthWheelTeeth,
  pinionTeeth: gearTrain.fourthPinionTeeth,
  module: MODULE,
  wheelMaterial: materials.gear,
  pinionMaterial: materials.pinion,
  spokeCount: 5,
  zPosition: 0.6,
});
fourthWheel.baseZ = 0.6;
scene.add(fourthWheel.group);

// Escape wheel
const escapeWheel = new EscapeWheel({
  material: materials.escapement,
  module: MODULE,
  teeth: gearTrain.escapeWheelTeeth,
});
escapeWheel.baseZ = 1.2;
scene.add(escapeWheel.group);

// Pallet fork
const palletFork = new PalletFork({
  material: materials.pinion,
  jewelMaterial: materials.jewel,
  length: 0.8,
});
palletFork.baseZ = 1.5;
scene.add(palletFork.group);

// Balance wheel
const balanceWheel = new BalanceWheel({
  material: materials.balanceWheel,
  springMaterial: materials.spring,
  jewelMaterial: materials.jewel,
  radius: 0.7,
});
balanceWheel.baseZ = 1.8;
scene.add(balanceWheel.group);

// Watch plate
const plate = new WatchPlate({
  material: materials.plate,
  radius: 6,
  thickness: 0.06,
});
plate.baseZ = -1.6;
scene.add(plate.group);

// ─── Position Components ───────────────────────────────────────
// Arrange gears so they mesh (approximately — positions computed from pitch radii)
const barrelPR = getPitchRadius(gearTrain.barrelTeeth, MODULE);
const centerPR = getPitchRadius(gearTrain.centerWheelTeeth, MODULE);
const thirdPR = getPitchRadius(gearTrain.thirdWheelTeeth, MODULE);
const fourthPR = getPitchRadius(gearTrain.fourthWheelTeeth, MODULE);
const escapePR = getPitchRadius(gearTrain.escapeWheelTeeth, MODULE);

// Barrel at top-left
barrel.group.position.x = -2.5;
barrel.group.position.y = 2.0;

// Center at origin
centerWheel.group.position.x = 0;
centerWheel.group.position.y = 0;

// Third wheel offset from center
const centerToThird = centerPR + getPitchRadius(gearTrain.thirdPinionTeeth, MODULE * 0.9);
thirdWheel.group.position.x = centerToThird * 0.8;
thirdWheel.group.position.y = -centerToThird * 0.6;

// Fourth wheel offset from third
const thirdToFourth = thirdPR + getPitchRadius(gearTrain.fourthPinionTeeth, MODULE * 0.9);
fourthWheel.group.position.x = thirdWheel.group.position.x - thirdToFourth * 0.3;
fourthWheel.group.position.y = thirdWheel.group.position.y - thirdToFourth * 0.95;

// Escape wheel offset from fourth
const fourthToEscape = fourthPR + getPitchRadius(gearTrain.escapePinionTeeth, MODULE * 0.9);
escapeWheel.group.position.x = fourthWheel.group.position.x + fourthToEscape * 0.9;
escapeWheel.group.position.y = fourthWheel.group.position.y - fourthToEscape * 0.4;

// Pallet fork near escape wheel
palletFork.group.position.x = escapeWheel.group.position.x + 0.5;
palletFork.group.position.y = escapeWheel.group.position.y - 1.0;

// Balance wheel near pallet fork
balanceWheel.group.position.x = palletFork.group.position.x + 1.5;
balanceWheel.group.position.y = palletFork.group.position.y - 0.5;

// Add jewel bearings on plate at each pivot position
[barrel, centerWheel, thirdWheel, fourthWheel, escapeWheel].forEach(comp => {
  plate.addBearing(comp.group.position.x, comp.group.position.y);
});

// ─── Labels ────────────────────────────────────────────────────
const components = { barrel, centerWheel, thirdWheel, fourthWheel, escapeWheel, palletFork, balanceWheel, plate };
const componentLabels = {
  barrel: 'Mainspring Barrel',
  centerWheel: 'Center Wheel',
  thirdWheel: 'Third Wheel',
  fourthWheel: 'Fourth Wheel',
  escapeWheel: 'Escape Wheel',
  palletFork: 'Pallet Fork',
  balanceWheel: 'Balance Wheel',
};

Object.entries(componentLabels).forEach(([key, text]) => {
  const div = document.createElement('div');
  div.className = 'component-label';
  div.textContent = text;
  const label = new CSS2DObject(div);
  label.position.set(0, 0.5, 0);
  components[key].group.add(label);
});

// ─── GUI Callbacks ─────────────────────────────────────────────
const guiCallbacks = {
  onSpeedChange: () => {},
  onBeatRateChange: (val) => {
    const freq = val / 3600 / 2;
    escapement.setParams({ frequency: freq });
  },
  onAmplitudeChange: (val) => {
    escapement.setParams({ amplitude: val });
  },
  onSpringChange: (val) => {
    escapement.setParams({ springTension: val });
  },
  onThemeChange: (val) => {
    updateMaterialSet(materials, val);
    scene.background.setHex(COLOR_THEMES[val].background);
  },
  onWireframeChange: (val) => {
    Object.values(materials).forEach(mat => {
      if (mat && mat.wireframe !== undefined) mat.wireframe = val;
    });
  },
  onPlateOpacityChange: (val) => {
    plate.setOpacity(val);
  },
  onExplodedChange: () => {
    updateExplodedView();
  },
  onCameraPreset: (val) => {
    setCameraPreset(val);
  },
  onAutoRotateChange: (val) => {
    controls.autoRotate = val;
  },
  onBloomChange: () => {
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
  },
  onAmbientChange: (val) => {
    lights.ambient.intensity = val;
  },
  onVisibilityChange: () => {
    barrel.setVisible(params.visibility.barrel);
    centerWheel.setVisible(params.visibility.center);
    thirdWheel.setVisible(params.visibility.third);
    fourthWheel.setVisible(params.visibility.fourth);
    escapeWheel.setVisible(params.visibility.escape);
    palletFork.setVisible(params.visibility.pallet);
    balanceWheel.setVisible(params.visibility.balance);
    plate.setVisible(params.visibility.plate);
  },
};

const gui = createGui(params, guiCallbacks);

// ─── Exploded View ─────────────────────────────────────────────
function updateExplodedView() {
  const d = params.explodedView ? params.explodeDistance : 0;
  const items = [barrel, centerWheel, thirdWheel, fourthWheel, escapeWheel, palletFork, balanceWheel, plate];
  items.forEach((item, i) => {
    const offset = params.explodedView ? (i - items.length / 2) * d : 0;
    item.setExplodedOffset(offset);
  });
}

// ─── Camera Presets ────────────────────────────────────────────
function setCameraPreset(preset) {
  const target = new THREE.Vector3(0, -1, 0);
  switch (preset) {
    case 'Top':
      camera.position.set(0, 0, 15);
      controls.target.copy(target);
      break;
    case 'Side':
      camera.position.set(15, 0, 2);
      controls.target.copy(target);
      break;
    case 'Escapement':
      camera.position.set(
        escapeWheel.group.position.x + 3,
        escapeWheel.group.position.y,
        escapeWheel.group.position.z + 4
      );
      controls.target.set(
        escapeWheel.group.position.x,
        escapeWheel.group.position.y,
        escapeWheel.group.position.z
      );
      break;
    case 'Full Assembly':
      camera.position.set(5, 5, 12);
      controls.target.copy(target);
      break;
    default:
      break;
  }
  controls.update();
}

// ─── Animation Loop ────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const clampedDelta = Math.min(delta, 0.05); // Prevent huge jumps

  if (!params.paused) {
    // Update gear train
    gearTrain.speedMultiplier = 60 * params.speed;
    gearTrain.update(clampedDelta);

    // Update escapement
    escapement.update(clampedDelta, 60 * params.speed);

    // Apply rotations to gear meshes
    barrel.update(gearTrain.rotations.barrel);
    centerWheel.update(gearTrain.rotations.center);
    thirdWheel.update(gearTrain.rotations.third);
    fourthWheel.update(gearTrain.rotations.fourth);

    // Escape wheel driven by escapement (stepped motion)
    escapeWheel.update(-escapement.escapeAngle);

    // Pallet fork rocks with escapement
    palletFork.update(escapement.getSmoothedPalletAngle());

    // Balance wheel oscillates
    balanceWheel.update(escapement.balanceAngle, params.springTension);
  }

  controls.update();
  composer.render();
  labelRenderer.render(scene, camera);
}

// ─── Resize Handler ────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Start ─────────────────────────────────────────────────────
animate();
