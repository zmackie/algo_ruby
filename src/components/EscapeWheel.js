import * as THREE from 'three';
import { getPitchRadius } from '../utils/gearGeometry.js';

/**
 * The escape wheel — a star-shaped wheel with pointed teeth
 * that interact with the pallet fork.
 */
export class EscapeWheel {
  constructor({ material, module = 0.3, teeth = 15 }) {
    this.group = new THREE.Group();
    this.group.name = 'Escape Wheel';
    this.teeth = teeth;
    this.module = module;
    this.rotation = 0;
    this._baseZ = 0;

    const pitchRadius = getPitchRadius(teeth, module);
    const outerRadius = pitchRadius * 1.15;
    const innerRadius = pitchRadius * 0.65;
    const hubRadius = pitchRadius * 0.2;

    // Star-shaped escape wheel
    const shape = new THREE.Shape();
    const toothAngle = (2 * Math.PI) / teeth;

    for (let i = 0; i < teeth; i++) {
      const baseAngle = i * toothAngle;
      const tipAngle = baseAngle + toothAngle * 0.15;
      const midAngle = baseAngle + toothAngle * 0.5;
      const endAngle = baseAngle + toothAngle;

      const p1 = polarToVec(innerRadius, baseAngle);
      const p2 = polarToVec(outerRadius, tipAngle);
      const p3 = polarToVec(innerRadius * 0.85, midAngle);
      const p4 = polarToVec(innerRadius, endAngle);

      if (i === 0) shape.moveTo(p1.x, p1.y);
      else shape.lineTo(p1.x, p1.y);
      shape.lineTo(p2.x, p2.y);
      shape.lineTo(p3.x, p3.y);
      shape.lineTo(p4.x, p4.y);
    }
    shape.closePath();

    // Center hole
    const holePath = new THREE.Path();
    for (let i = 0; i <= 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      if (i === 0) holePath.moveTo(Math.cos(a) * hubRadius, Math.sin(a) * hubRadius);
      else holePath.lineTo(Math.cos(a) * hubRadius, Math.sin(a) * hubRadius);
    }
    shape.holes.push(holePath);

    // Spoke cutouts
    const spokeCount = 5;
    const spokeInner = hubRadius + 0.04;
    const spokeOuter = innerRadius * 0.7;
    if (spokeOuter > spokeInner) {
      for (let i = 0; i < spokeCount; i++) {
        const center = (i / spokeCount) * Math.PI * 2;
        const halfWidth = (Math.PI / spokeCount) * 0.6;
        const cutPath = new THREE.Path();
        const segments = 8;
        // Inner arc
        for (let j = 0; j <= segments; j++) {
          const a = center - halfWidth + (2 * halfWidth * j / segments);
          const p = polarToVec(spokeInner, a);
          if (j === 0) cutPath.moveTo(p.x, p.y);
          else cutPath.lineTo(p.x, p.y);
        }
        // Outer arc (reverse)
        for (let j = segments; j >= 0; j--) {
          const a = center - halfWidth + (2 * halfWidth * j / segments);
          const p = polarToVec(spokeOuter, a);
          cutPath.lineTo(p.x, p.y);
        }
        cutPath.closePath();
        shape.holes.push(cutPath);
      }
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 1,
    });
    geo.center();

    this.mesh = new THREE.Mesh(geo, material);
    this.group.add(this.mesh);

    this.pitchRadius = pitchRadius;
    this.outerRadius = outerRadius;
    this.toothAngle = toothAngle;
  }

  update(rotationAngle) {
    this.rotation = rotationAngle;
    this.group.rotation.z = rotationAngle;
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

function polarToVec(r, angle) {
  return new THREE.Vector2(r * Math.cos(angle), r * Math.sin(angle));
}
