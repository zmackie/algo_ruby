import * as THREE from 'three';

/**
 * The pallet fork — the escapement lever that rocks back and forth,
 * alternately catching and releasing the escape wheel teeth.
 */
export class PalletFork {
  constructor({ material, jewelMaterial, length = 1.2, pivotOffset = 0 }) {
    this.group = new THREE.Group();
    this.group.name = 'Pallet Fork';
    this.rotation = 0;
    this._baseZ = 0;

    const armWidth = 0.06;
    const armLength = length;
    const forkWidth = 0.15;
    const forkDepth = 0.2;

    // Main arm (vertical bar)
    const armGeo = new THREE.BoxGeometry(armWidth, armLength, 0.06);
    const armMesh = new THREE.Mesh(armGeo, material);
    armMesh.position.y = armLength / 2;
    this.group.add(armMesh);

    // Fork prongs at the bottom (impulse pin slot)
    const prongGeo = new THREE.BoxGeometry(forkWidth, forkDepth, 0.06);
    const leftProng = new THREE.Mesh(prongGeo, material);
    leftProng.position.set(-forkWidth * 0.6, -0.05, 0);
    leftProng.rotation.z = 0.2;
    this.group.add(leftProng);

    const rightProng = new THREE.Mesh(prongGeo, material);
    rightProng.position.set(forkWidth * 0.6, -0.05, 0);
    rightProng.rotation.z = -0.2;
    this.group.add(rightProng);

    // Entry pallet (jewel) — at the top-left of the fork
    const palletGeo = new THREE.BoxGeometry(0.12, 0.04, 0.07);
    const entryPallet = new THREE.Mesh(palletGeo, jewelMaterial);
    entryPallet.position.set(-armWidth * 0.5 - 0.06, armLength * 0.92, 0);
    entryPallet.rotation.z = 0.5;
    this.group.add(entryPallet);

    // Exit pallet (jewel) — at the top-right
    const exitPallet = new THREE.Mesh(palletGeo, jewelMaterial);
    exitPallet.position.set(armWidth * 0.5 + 0.06, armLength * 0.92, 0);
    exitPallet.rotation.z = -0.5;
    this.group.add(exitPallet);

    // Pivot jewel at center
    const pivotGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const pivotJewel = new THREE.Mesh(pivotGeo, jewelMaterial);
    this.group.add(pivotJewel);

    // The pallet fork pivots from its center
    this.group.position.y = pivotOffset;
  }

  update(angle) {
    this.rotation = angle;
    this.group.rotation.z = angle;
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
