import * as THREE from 'three';

export const COLOR_THEMES = {
  classicBrass: {
    name: 'Classic Brass',
    gear: { color: 0xD4A843, metalness: 0.85, roughness: 0.25 },
    pinion: { color: 0xB8B8B8, metalness: 0.9, roughness: 0.2 },
    jewel: { color: 0xCC0033, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.85 },
    spring: { color: 0x5599DD, metalness: 0.9, roughness: 0.15 },
    plate: { color: 0x999999, metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.25 },
    barrel: { color: 0xC4963A, metalness: 0.8, roughness: 0.3 },
    balanceWheel: { color: 0xCFB53B, metalness: 0.9, roughness: 0.15 },
    escapement: { color: 0xE8D064, metalness: 0.85, roughness: 0.2 },
    background: 0x0a0a0f,
  },
  midnightBlue: {
    name: 'Midnight Blue',
    gear: { color: 0x2244AA, metalness: 0.85, roughness: 0.2 },
    pinion: { color: 0x6688CC, metalness: 0.9, roughness: 0.2 },
    jewel: { color: 0xFF4466, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.85 },
    spring: { color: 0x00CCFF, metalness: 0.9, roughness: 0.1 },
    plate: { color: 0x112244, metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.2 },
    barrel: { color: 0x1a3377, metalness: 0.8, roughness: 0.3 },
    balanceWheel: { color: 0x4477DD, metalness: 0.9, roughness: 0.15 },
    escapement: { color: 0x3366CC, metalness: 0.85, roughness: 0.2 },
    background: 0x020210,
  },
  roseGold: {
    name: 'Rose Gold',
    gear: { color: 0xCC8866, metalness: 0.9, roughness: 0.2 },
    pinion: { color: 0xDDA088, metalness: 0.9, roughness: 0.2 },
    jewel: { color: 0x4400AA, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.85 },
    spring: { color: 0xFF88AA, metalness: 0.9, roughness: 0.15 },
    plate: { color: 0x665555, metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.2 },
    barrel: { color: 0xBB7755, metalness: 0.8, roughness: 0.3 },
    balanceWheel: { color: 0xDD9977, metalness: 0.9, roughness: 0.15 },
    escapement: { color: 0xCC8866, metalness: 0.85, roughness: 0.2 },
    background: 0x0f0808,
  },
  neonCyberpunk: {
    name: 'Neon Cyberpunk',
    gear: { color: 0x00FF88, metalness: 0.7, roughness: 0.1, emissive: 0x003322, emissiveIntensity: 0.3 },
    pinion: { color: 0xFF00FF, metalness: 0.7, roughness: 0.1, emissive: 0x220022, emissiveIntensity: 0.3 },
    jewel: { color: 0xFFFF00, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.9, emissive: 0x444400, emissiveIntensity: 0.5 },
    spring: { color: 0x00FFFF, metalness: 0.8, roughness: 0.1, emissive: 0x004444, emissiveIntensity: 0.4 },
    plate: { color: 0x111111, metalness: 0.3, roughness: 0.5, transparent: true, opacity: 0.15 },
    barrel: { color: 0xFF4400, metalness: 0.7, roughness: 0.1, emissive: 0x221100, emissiveIntensity: 0.3 },
    balanceWheel: { color: 0xFF0066, metalness: 0.8, roughness: 0.1, emissive: 0x330011, emissiveIntensity: 0.3 },
    escapement: { color: 0x8800FF, metalness: 0.7, roughness: 0.1, emissive: 0x110033, emissiveIntensity: 0.3 },
    background: 0x050510,
  },
};

/**
 * Create a MeshPhysicalMaterial from a theme property object.
 */
export function createMaterial(props) {
  return new THREE.MeshPhysicalMaterial({
    color: props.color,
    metalness: props.metalness ?? 0.8,
    roughness: props.roughness ?? 0.3,
    transparent: props.transparent ?? false,
    opacity: props.opacity ?? 1.0,
    emissive: props.emissive ?? 0x000000,
    emissiveIntensity: props.emissiveIntensity ?? 0,
    side: THREE.DoubleSide,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
  });
}

/**
 * Creates a complete set of materials from a theme.
 */
export function createMaterialSet(themeName = 'classicBrass') {
  const theme = COLOR_THEMES[themeName];
  const materials = {};
  for (const key of Object.keys(theme)) {
    if (key === 'name' || key === 'background') continue;
    materials[key] = createMaterial(theme[key]);
  }
  materials._theme = theme;
  return materials;
}

/**
 * Update materials with a new theme.
 */
export function updateMaterialSet(materials, themeName) {
  const theme = COLOR_THEMES[themeName];
  for (const key of Object.keys(theme)) {
    if (key === 'name' || key === 'background') continue;
    if (materials[key]) {
      const props = theme[key];
      materials[key].color.setHex(props.color);
      materials[key].metalness = props.metalness ?? 0.8;
      materials[key].roughness = props.roughness ?? 0.3;
      materials[key].transparent = props.transparent ?? false;
      materials[key].opacity = props.opacity ?? 1.0;
      materials[key].emissive.setHex(props.emissive ?? 0x000000);
      materials[key].emissiveIntensity = props.emissiveIntensity ?? 0;
      materials[key].needsUpdate = true;
    }
  }
  materials._theme = theme;
}
