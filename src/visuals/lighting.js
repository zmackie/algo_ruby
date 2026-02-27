import * as THREE from 'three';

export function setupLighting(scene, params = {}) {
  const lights = {};

  // Main directional light (warm key light)
  const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.top = 5;
  dirLight.shadow.camera.bottom = -5;
  scene.add(dirLight);
  lights.directional = dirLight;

  // Warm fill light (orange-ish)
  const warmLight = new THREE.PointLight(0xff8844, 0.6, 20);
  warmLight.position.set(-4, 3, -2);
  scene.add(warmLight);
  lights.warm = warmLight;

  // Cool accent light (blue)
  const coolLight = new THREE.PointLight(0x4488ff, 0.4, 20);
  coolLight.position.set(3, -2, 4);
  scene.add(coolLight);
  lights.cool = coolLight;

  // Ambient
  const ambientLight = new THREE.AmbientLight(0x334455, params.ambientIntensity ?? 0.4);
  scene.add(ambientLight);
  lights.ambient = ambientLight;

  // Hemisphere light for subtle environment fill
  const hemiLight = new THREE.HemisphereLight(0xccddff, 0x333322, 0.3);
  scene.add(hemiLight);
  lights.hemisphere = hemiLight;

  return lights;
}
