import { getPitchRadius } from '../utils/gearGeometry.js';

/**
 * Manages the gear train — computes angular velocities for all gears
 * based on tooth counts and gear ratios, and drives the animation.
 *
 * Gear train layout (21,600 BPH default):
 * Barrel(75) -> Center Pinion(10) / Center Wheel(80) -> Third Pinion(10) / Third Wheel(75)
 * -> Fourth Pinion(10) / Fourth Wheel(80) -> Escape Pinion(8) / Escape Wheel(15)
 */
export class GearTrain {
  constructor(params = {}) {
    // Tooth counts (user-tunable)
    this.barrelTeeth = params.barrelTeeth ?? 75;
    this.centerWheelTeeth = params.centerWheelTeeth ?? 80;
    this.centerPinionTeeth = params.centerPinionTeeth ?? 10;
    this.thirdWheelTeeth = params.thirdWheelTeeth ?? 75;
    this.thirdPinionTeeth = params.thirdPinionTeeth ?? 10;
    this.fourthWheelTeeth = params.fourthWheelTeeth ?? 80;
    this.fourthPinionTeeth = params.fourthPinionTeeth ?? 10;
    this.escapeWheelTeeth = params.escapeWheelTeeth ?? 15;
    this.escapePinionTeeth = params.escapePinionTeeth ?? 8;

    // Speed multiplier: 60 means 1 real second = 1 sim minute
    this.speedMultiplier = params.speedMultiplier ?? 60;

    // Accumulated rotations (radians)
    this.rotations = {
      barrel: 0,
      center: 0,
      third: 0,
      fourth: 0,
    };

    // Direction alternation (meshing gears rotate opposite)
    this.directions = {
      barrel: 1,
      center: -1,
      third: 1,
      fourth: -1,
    };
  }

  /**
   * Compute angular velocities (rad/s) for each gear, driven by the
   * center wheel (1 rev/hour base).
   */
  getVelocities() {
    // Center wheel = 1 revolution per hour = 2π/3600 rad/s (base)
    const centerOmega = (2 * Math.PI / 3600) * this.speedMultiplier;

    // Barrel is slower: center pinion is driven by barrel teeth
    const barrelOmega = centerOmega * (this.centerPinionTeeth / this.barrelTeeth);

    // Third wheel is faster: driven by center wheel
    const thirdOmega = centerOmega * (this.centerWheelTeeth / this.thirdPinionTeeth);

    // Fourth wheel: driven by third wheel
    const fourthOmega = thirdOmega * (this.thirdWheelTeeth / this.fourthPinionTeeth);

    // Escape wheel: driven by fourth wheel
    const escapeOmega = fourthOmega * (this.fourthWheelTeeth / this.escapePinionTeeth);

    return {
      barrel: barrelOmega,
      center: centerOmega,
      third: thirdOmega,
      fourth: fourthOmega,
      escape: escapeOmega,
    };
  }

  /**
   * Compute vibrations per hour from the gear train.
   * VPH = escape revs/hour × escape teeth × 2 (two pallet jewels)
   */
  getVPH() {
    const v = this.getVelocities();
    const escapeRevsPerHour = (v.escape / (2 * Math.PI)) * 3600 / this.speedMultiplier;
    return Math.round(escapeRevsPerHour * this.escapeWheelTeeth * 2);
  }

  /**
   * Get the escape wheel frequency in Hz (ticks per second at speed=1).
   */
  getEscapeFrequency() {
    const vph = this.getVPH();
    return vph / 3600;  // ticks per second
  }

  /**
   * Update gear rotations based on elapsed time.
   * The escape wheel is NOT updated here — it's driven by the escapement.
   */
  update(delta) {
    const v = this.getVelocities();
    this.rotations.barrel += v.barrel * delta * this.directions.barrel;
    this.rotations.center += v.center * delta * this.directions.center;
    this.rotations.third += v.third * delta * this.directions.third;
    this.rotations.fourth += v.fourth * delta * this.directions.fourth;
  }

  /**
   * Get the center-to-center distance for two meshing gears.
   */
  getMeshDistance(wheelTeeth, pinionTeeth, module = 0.3) {
    return getPitchRadius(wheelTeeth, module) + getPitchRadius(pinionTeeth, module * 0.9);
  }
}
