import * as THREE from 'three';
import { createGearGeometry, getPitchRadius } from '../utils/gearGeometry.js';

/**
 * The mainspring barrel — the power source of the watch.
 * A cylindrical drum with teeth on the outside and a visible
 * coiled spring inside.
 */
export class MainspringBarrel {
  constructor({ material, springMaterial, module = 0.3, teeth = 75 }) {
    this.group = new THREE.Group();
    this.group.name = 'Mainspring Barrel';
    this.teeth = teeth;
    this.module = module;
    this.rotation = 0;
    this._baseZ = 0;

    // Barrel drum (gear on outside)
    const gearGeo = createGearGeometry(teeth, module, 0.25, module * 3, {
      spokeCount: 0,
    });
    this.barrelMesh = new THREE.Mesh(gearGeo, material);
    this.group.add(this.barrelMesh);

    // Drum walls (cylinder)
    const pitchR = getPitchRadius(teeth, module);
    const drumGeo = new THREE.CylinderGeometry(pitchR * 0.85, pitchR * 0.85, 0.3, 48, 1, true);
    drumGeo.rotateX(Math.PI / 2);
    const drumMesh = new THREE.Mesh(drumGeo, material.clone());
    drumMesh.material.transparent = true;
    drumMesh.material.opacity = 0.4;
    drumMesh.material.side = THREE.DoubleSide;
    this.group.add(drumMesh);

    // Coiled spring inside
    this.springGroup = new THREE.Group();
    this._createSpring(springMaterial, pitchR * 0.7);
    this.group.add(this.springGroup);

    this.pitchRadius = pitchR;
  }

  _createSpring(material, maxRadius) {
    const coils = 6;
    const pointsPerCoil = 60;
    const totalPoints = coils * pointsPerCoil;
    const points = [];
    const minR = maxRadius * 0.15;

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * coils * Math.PI * 2;
      const r = minR + (maxRadius - minR) * t;
      points.push(new THREE.Vector3(
        r * Math.cos(angle),
        r * Math.sin(angle),
        0
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, totalPoints, 0.02, 6, false);
    this.springMesh = new THREE.Mesh(tubeGeo, material);
    this.springGroup.add(this.springMesh);
  }

  update(rotationAngle) {
    this.rotation = rotationAngle;
    this.group.rotation.z = rotationAngle;
    // Slowly uncoil the spring visual
    this.springGroup.rotation.z = -rotationAngle * 0.3;
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
