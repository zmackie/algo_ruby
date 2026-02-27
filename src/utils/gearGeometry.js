import * as THREE from 'three';

/**
 * Creates an involute gear geometry.
 * @param {number} teethCount - Number of teeth
 * @param {number} module - Gear module (tooth size factor)
 * @param {number} thickness - Gear thickness (depth)
 * @param {number} holeRadius - Center bore radius
 * @param {object} options - Optional: { spokeCount, spokeWidth, pressureAngle }
 * @returns {THREE.ExtrudeGeometry}
 */
export function createGearGeometry(teethCount, module = 0.3, thickness = 0.15, holeRadius = 0.1, options = {}) {
  const {
    spokeCount = 0,
    spokeWidth = 0.08,
    pressureAngle = 20 * Math.PI / 180,
  } = options;

  const pitchRadius = (teethCount * module) / 2;
  const addendum = module;
  const dedendum = module * 1.25;
  const outerRadius = pitchRadius + addendum;
  const rootRadius = pitchRadius - dedendum;
  const baseRadius = pitchRadius * Math.cos(pressureAngle);

  const shape = new THREE.Shape();

  const toothAngle = (2 * Math.PI) / teethCount;
  const toothWidthAngle = toothAngle * 0.3;
  const points = [];

  for (let i = 0; i < teethCount; i++) {
    const angle = i * toothAngle;

    // Root arc start
    const rootStart = angle - toothAngle / 2 + toothWidthAngle * 0.3;
    // Root arc end
    const rootEnd = angle - toothWidthAngle * 1.2;

    // Tooth flank up (left side)
    const toothLeftBottom = angle - toothWidthAngle;
    const toothLeftTop = angle - toothWidthAngle * 0.55;

    // Tooth tip
    const toothTipLeft = angle - toothWidthAngle * 0.45;
    const toothTipRight = angle + toothWidthAngle * 0.45;

    // Tooth flank down (right side)
    const toothRightTop = angle + toothWidthAngle * 0.55;
    const toothRightBottom = angle + toothWidthAngle;

    // Root arc to next tooth
    const nextRootStart = angle + toothWidthAngle * 1.2;
    const nextRootEnd = angle + toothAngle / 2 - toothWidthAngle * 0.3;

    // Root arc before tooth
    addArc(points, rootRadius, rootStart, rootEnd, 3);

    // Left involute flank (simplified as line from root to tip)
    points.push(polarToCart(rootRadius, toothLeftBottom));
    points.push(polarToCart(outerRadius * 0.92, toothLeftTop));

    // Tooth tip arc
    addArc(points, outerRadius, toothTipLeft, toothTipRight, 3);

    // Right involute flank
    points.push(polarToCart(outerRadius * 0.92, toothRightTop));
    points.push(polarToCart(rootRadius, toothRightBottom));

    // Root arc after tooth
    addArc(points, rootRadius, nextRootStart, nextRootEnd, 3);
  }

  if (points.length > 0) {
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    shape.closePath();
  }

  // Center hole
  const holePath = new THREE.Path();
  const holeSegments = 32;
  for (let i = 0; i <= holeSegments; i++) {
    const a = (i / holeSegments) * Math.PI * 2;
    const x = Math.cos(a) * holeRadius;
    const y = Math.sin(a) * holeRadius;
    if (i === 0) holePath.moveTo(x, y);
    else holePath.lineTo(x, y);
  }
  shape.holes.push(holePath);

  // Spoke cutouts for visual interest on larger gears
  if (spokeCount > 0 && pitchRadius > 0.5) {
    const innerCutRadius = holeRadius + spokeWidth;
    const outerCutRadius = rootRadius - spokeWidth;
    if (outerCutRadius > innerCutRadius) {
      const cutAngle = (2 * Math.PI) / spokeCount;
      const cutWidth = cutAngle * 0.55;
      for (let i = 0; i < spokeCount; i++) {
        const centerAngle = i * cutAngle;
        const cutPath = new THREE.Path();
        const cutPoints = [];
        addArc(cutPoints, innerCutRadius, centerAngle - cutWidth / 2, centerAngle + cutWidth / 2, 8);
        addArc(cutPoints, outerCutRadius, centerAngle + cutWidth / 2, centerAngle - cutWidth / 2, 8);
        if (cutPoints.length > 0) {
          cutPath.moveTo(cutPoints[0].x, cutPoints[0].y);
          for (let j = 1; j < cutPoints.length; j++) {
            cutPath.lineTo(cutPoints[j].x, cutPoints[j].y);
          }
          cutPath.closePath();
          shape.holes.push(cutPath);
        }
      }
    }
  }

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.05,
    bevelSize: module * 0.1,
    bevelSegments: 2,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  return geometry;
}

/**
 * Creates a pinion (small gear) geometry.
 */
export function createPinionGeometry(leaves, module = 0.3, thickness = 0.2, shaftRadius = 0.05) {
  return createGearGeometry(leaves, module * 0.9, thickness, shaftRadius, {
    spokeCount: 0,
    pressureAngle: 20 * Math.PI / 180,
  });
}

function polarToCart(r, angle) {
  return new THREE.Vector2(r * Math.cos(angle), r * Math.sin(angle));
}

function addArc(points, radius, startAngle, endAngle, segments) {
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + (endAngle - startAngle) * t;
    points.push(polarToCart(radius, angle));
  }
}

/**
 * Returns the pitch radius for a gear with given teeth count and module.
 */
export function getPitchRadius(teethCount, module = 0.3) {
  return (teethCount * module) / 2;
}
