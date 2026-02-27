import * as THREE from 'three';

/**
 * The watch base plate — a semi-transparent plate that all components
 * are mounted on, providing visual context.
 */
export class WatchPlate {
  constructor({ material, radius = 8, thickness = 0.08 }) {
    this.group = new THREE.Group();
    this.group.name = 'Base Plate';
    this._baseZ = 0;

    // Main plate (rounded rectangle / circle)
    const plateGeo = new THREE.CylinderGeometry(radius, radius, thickness, 64);
    plateGeo.rotateX(Math.PI / 2);
    this.plateMesh = new THREE.Mesh(plateGeo, material);
    this.group.add(this.plateMesh);

    // Jewel bearing holes (decorative)
    const bearingGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 24);
    const bearingMaterial = material.clone();
    bearingMaterial.color.setHex(0xCC0033);
    bearingMaterial.transparent = true;
    bearingMaterial.opacity = 0.6;
    bearingMaterial.metalness = 0.2;

    this.bearings = [];
    this.bearingMaterial = bearingMaterial;
  }

  addBearing(x, y) {
    const bearingGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 24);
    const bearing = new THREE.Mesh(bearingGeo, this.bearingMaterial);
    bearing.position.set(x, y, 0.06);
    this.group.add(bearing);
    this.bearings.push(bearing);
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  setOpacity(opacity) {
    this.plateMesh.material.opacity = opacity;
    this.plateMesh.material.transparent = opacity < 1;
    this.plateMesh.material.needsUpdate = true;
  }

  setExplodedOffset(offset) {
    this.group.position.z = this._baseZ + offset;
  }

  set baseZ(z) {
    this._baseZ = z;
    this.group.position.z = z;
  }
}
