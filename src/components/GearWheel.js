import * as THREE from 'three';
import { createGearGeometry, createPinionGeometry, getPitchRadius } from '../utils/gearGeometry.js';

/**
 * A gear wheel with an attached pinion.
 * The wheel is the large gear driven by the previous stage,
 * and the pinion drives the next stage.
 */
export class GearWheel {
  constructor({
    name = 'Gear',
    wheelTeeth = 80,
    pinionTeeth = 10,
    module = 0.3,
    wheelThickness = 0.12,
    pinionThickness = 0.18,
    wheelMaterial,
    pinionMaterial,
    spokeCount = 5,
    zPosition = 0,
  }) {
    this.name = name;
    this.wheelTeeth = wheelTeeth;
    this.pinionTeeth = pinionTeeth;
    this.module = module;
    this.rotation = 0;
    this.visible = true;

    this.group = new THREE.Group();
    this.group.name = name;

    // Main wheel
    const wheelGeo = createGearGeometry(wheelTeeth, module, wheelThickness, module * 1.5, {
      spokeCount: wheelTeeth > 30 ? spokeCount : 0,
    });
    this.wheelMesh = new THREE.Mesh(wheelGeo, wheelMaterial);
    this.group.add(this.wheelMesh);

    // Pinion (if applicable)
    if (pinionTeeth > 0) {
      const pinionGeo = createPinionGeometry(pinionTeeth, module, pinionThickness, module * 0.8);
      this.pinionMesh = new THREE.Mesh(pinionGeo, pinionMaterial);
      this.group.add(this.pinionMesh);
    }

    this.group.position.z = zPosition;

    this.wheelPitchRadius = getPitchRadius(wheelTeeth, module);
    this.pinionPitchRadius = pinionTeeth > 0 ? getPitchRadius(pinionTeeth, module * 0.9) : 0;
  }

  update(rotationAngle) {
    this.rotation = rotationAngle;
    this.group.rotation.z = rotationAngle;
  }

  setVisible(visible) {
    this.visible = visible;
    this.group.visible = visible;
  }

  setExplodedOffset(offset) {
    this.group.position.z = this._baseZ + offset;
  }

  set baseZ(z) {
    this._baseZ = z;
    this.group.position.z = z;
  }

  get baseZ() {
    return this._baseZ ?? this.group.position.z;
  }
}
