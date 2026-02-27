import * as THREE from 'three';

/**
 * The balance wheel and hairspring — the regulating organ of the watch.
 * The balance wheel oscillates back and forth, and the hairspring
 * (spiral spring) controls its period.
 */
export class BalanceWheel {
  constructor({ material, springMaterial, jewelMaterial, radius = 1.0 }) {
    this.group = new THREE.Group();
    this.group.name = 'Balance Wheel';
    this.rotation = 0;
    this._baseZ = 0;
    this.radius = radius;

    // Balance wheel rim
    const rimGeo = new THREE.TorusGeometry(radius, 0.04, 12, 64);
    this.rimMesh = new THREE.Mesh(rimGeo, material);
    this.group.add(this.rimMesh);

    // Spokes (crossbar style)
    const spokeGeo = new THREE.BoxGeometry(radius * 1.8, 0.05, 0.04);
    const spoke1 = new THREE.Mesh(spokeGeo, material);
    this.group.add(spoke1);

    const spoke2 = new THREE.Mesh(spokeGeo.clone(), material);
    spoke2.rotation.z = Math.PI / 2;
    this.group.add(spoke2);

    // Hub
    const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 24);
    hubGeo.rotateX(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, material);
    this.group.add(hubMesh);

    // Impulse pin (ruby) — connects to the pallet fork
    const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 12);
    pinGeo.rotateX(Math.PI / 2);
    this.impulsePin = new THREE.Mesh(pinGeo, jewelMaterial);
    this.impulsePin.position.set(0, -radius * 0.25, 0);
    this.group.add(this.impulsePin);

    // Timing screws on the rim
    const screwGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const screwCount = 8;
    for (let i = 0; i < screwCount; i++) {
      const angle = (i / screwCount) * Math.PI * 2;
      const screw = new THREE.Mesh(screwGeo, material);
      screw.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.03
      );
      this.group.add(screw);
    }

    // Hairspring (spiral spring)
    this.hairspringGroup = new THREE.Group();
    this._createHairspring(springMaterial);
    this.group.add(this.hairspringGroup);
  }

  _createHairspring(material) {
    const coils = 8;
    const pointsPerCoil = 40;
    const totalPoints = coils * pointsPerCoil;
    const innerR = 0.12;
    const outerR = this.radius * 0.75;
    const points = [];

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * coils * Math.PI * 2;
      const r = innerR + (outerR - innerR) * t;
      points.push(new THREE.Vector3(
        r * Math.cos(angle),
        r * Math.sin(angle),
        0
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, totalPoints, 0.008, 5, false);
    this.hairspringMesh = new THREE.Mesh(tubeGeo, material);
    this.hairspringGroup.add(this.hairspringMesh);
  }

  update(angle, amplitude = 1.0) {
    this.rotation = angle;
    this.group.rotation.z = angle;
    // Hairspring visually "breathes" with the oscillation
    const breathScale = 1.0 + Math.sin(angle * 2) * 0.08 * amplitude;
    this.hairspringGroup.scale.set(breathScale, breathScale, 1);
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  setExplodedOffset(offset) {
    this.group.position.z = this._baseZ + offset;
  }

  set baseZ(z) {
    this._baseZ = z;
    this.group.position.z = z;
  }
}
