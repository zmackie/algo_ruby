import GUI from 'lil-gui';

/**
 * Creates the lil-gui control panel for tuning the watch mechanism.
 */
export function createGui(params, callbacks) {
  const gui = new GUI({ title: 'Watch Mechanism' });
  gui.domElement.style.zIndex = '100';

  // --- Simulation ---
  const simFolder = gui.addFolder('Simulation');
  simFolder.add(params, 'speed', 0.1, 10, 0.1).name('Speed').onChange(callbacks.onSpeedChange);
  simFolder.add(params, 'beatRate', [14400, 18000, 21600, 28800, 36000])
    .name('Beat Rate (BPH)')
    .onChange(callbacks.onBeatRateChange);
  simFolder.add(params, 'amplitude', 10, 60, 1).name('Amplitude (°)')
    .onChange(callbacks.onAmplitudeChange);
  simFolder.add(params, 'springTension', 0.2, 3.0, 0.1).name('Spring Tension')
    .onChange(callbacks.onSpringChange);
  simFolder.add(params, 'paused').name('Pause');

  // --- Appearance ---
  const appearFolder = gui.addFolder('Appearance');
  appearFolder.add(params, 'colorTheme', ['classicBrass', 'midnightBlue', 'roseGold', 'neonCyberpunk'])
    .name('Color Theme')
    .onChange(callbacks.onThemeChange);
  appearFolder.add(params, 'wireframe').name('Wireframe').onChange(callbacks.onWireframeChange);
  appearFolder.add(params, 'plateOpacity', 0.0, 1.0, 0.05).name('Plate Opacity')
    .onChange(callbacks.onPlateOpacityChange);

  // --- View ---
  const viewFolder = gui.addFolder('View');
  viewFolder.add(params, 'explodedView').name('Exploded View').onChange(callbacks.onExplodedChange);
  viewFolder.add(params, 'explodeDistance', 0.5, 5.0, 0.1).name('Explode Distance')
    .onChange(callbacks.onExplodedChange);
  viewFolder.add(params, 'cameraPreset', ['Free', 'Top', 'Side', 'Escapement', 'Full Assembly'])
    .name('Camera Angle')
    .onChange(callbacks.onCameraPreset);
  viewFolder.add(params, 'autoRotate').name('Auto-Rotate')
    .onChange(callbacks.onAutoRotateChange);

  // --- Effects ---
  const fxFolder = gui.addFolder('Effects');
  fxFolder.add(params, 'bloomStrength', 0, 2.0, 0.05).name('Bloom Strength')
    .onChange(callbacks.onBloomChange);
  fxFolder.add(params, 'bloomRadius', 0, 1.0, 0.05).name('Bloom Radius')
    .onChange(callbacks.onBloomChange);
  fxFolder.add(params, 'ambientIntensity', 0, 2.0, 0.05).name('Ambient Light')
    .onChange(callbacks.onAmbientChange);

  // --- Visibility ---
  const visFolder = gui.addFolder('Components');
  visFolder.add(params.visibility, 'barrel').name('Mainspring Barrel')
    .onChange(callbacks.onVisibilityChange);
  visFolder.add(params.visibility, 'center').name('Center Wheel')
    .onChange(callbacks.onVisibilityChange);
  visFolder.add(params.visibility, 'third').name('Third Wheel')
    .onChange(callbacks.onVisibilityChange);
  visFolder.add(params.visibility, 'fourth').name('Fourth Wheel')
    .onChange(callbacks.onVisibilityChange);
  visFolder.add(params.visibility, 'escape').name('Escape Wheel')
    .onChange(callbacks.onVisibilityChange);
  visFolder.add(params.visibility, 'pallet').name('Pallet Fork')
    .onChange(callbacks.onVisibilityChange);
  visFolder.add(params.visibility, 'balance').name('Balance Wheel')
    .onChange(callbacks.onVisibilityChange);
  visFolder.add(params.visibility, 'plate').name('Base Plate')
    .onChange(callbacks.onVisibilityChange);
  visFolder.close();

  return gui;
}

/**
 * Default params for the GUI.
 */
export function getDefaultParams() {
  return {
    speed: 1.0,
    beatRate: 21600,
    amplitude: 30,
    springTension: 1.0,
    paused: false,
    colorTheme: 'classicBrass',
    wireframe: false,
    plateOpacity: 0.25,
    explodedView: false,
    explodeDistance: 1.5,
    cameraPreset: 'Free',
    autoRotate: true,
    bloomStrength: 0.6,
    bloomRadius: 0.4,
    ambientIntensity: 0.4,
    visibility: {
      barrel: true,
      center: true,
      third: true,
      fourth: true,
      escape: true,
      pallet: true,
      balance: true,
      plate: true,
    },
  };
}
