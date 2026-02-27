/**
 * Escapement simulation — manages the balance wheel oscillation,
 * pallet fork rocking, and escape wheel stepping.
 *
 * The escapement is the "tick" of the watch. Each tick advances
 * the escape wheel by one tooth.
 */
export class Escapement {
  constructor(params = {}) {
    this.escapeTeeth = params.escapeTeeth ?? 15;
    this.toothAngle = (2 * Math.PI) / this.escapeTeeth;

    // Balance wheel oscillation
    this.frequency = params.frequency ?? 3;  // Hz (ticks per second / 2)
    this.amplitude = params.amplitude ?? (Math.PI / 6); // ~30 degrees
    this.damping = params.damping ?? 0.002;
    this.springTension = params.springTension ?? 1.0;

    // State
    this.balanceAngle = 0;
    this.balanceVelocity = this.amplitude * 2 * Math.PI * this.frequency;
    this.escapeAngle = 0;
    this.palletAngle = 0;
    this.tickCount = 0;
    this.time = 0;

    // Pallet fork swing range
    this.palletSwing = 0.12; // radians each way from center

    // Track which side the pallet is on
    this.palletSide = 1; // 1 or -1
    this.lastBalanceSign = 1;
  }

  /**
   * Update the escapement state.
   * @param {number} delta - Time elapsed in seconds
   * @param {number} speedMultiplier - Current speed multiplier
   */
  update(delta, speedMultiplier = 1) {
    const dt = delta * speedMultiplier;
    this.time += dt;

    // Balance wheel: damped sinusoidal oscillation
    const omega = 2 * Math.PI * this.frequency * Math.sqrt(this.springTension);
    const dampFactor = Math.exp(-this.damping * this.time);
    const effectiveAmplitude = this.amplitude * Math.max(dampFactor, 0.3);

    // Drive with sine wave (simplified — a real oscillator would use differential equations,
    // but sine produces the correct visual result)
    this.balanceAngle = effectiveAmplitude * Math.sin(omega * this.time);
    this.balanceVelocity = effectiveAmplitude * omega * Math.cos(omega * this.time);

    // Detect zero-crossings (ticks)
    const currentSign = Math.sign(this.balanceAngle);
    if (currentSign !== 0 && currentSign !== this.lastBalanceSign) {
      this._tick();
      this.lastBalanceSign = currentSign;
    }
  }

  _tick() {
    this.tickCount++;

    // Advance escape wheel by half a tooth (each tick = half the two-pallet cycle)
    this.escapeAngle += this.toothAngle / 2;

    // Rock the pallet fork to the opposite side
    this.palletSide *= -1;
    this.palletAngle = this.palletSide * this.palletSwing;
  }

  /**
   * Get the current animated pallet angle with smooth interpolation.
   */
  getSmoothedPalletAngle() {
    // Add a slight oscillation around the target to simulate the fork's motion
    const target = this.palletSide * this.palletSwing;
    const overshoot = Math.sin(this.balanceAngle * 8) * this.palletSwing * 0.15;
    return target + overshoot;
  }

  /**
   * Reset the damping (simulates winding — restores energy).
   */
  resetDamping() {
    this.time = 0;
  }

  /**
   * Update parameters from GUI.
   */
  setParams(params) {
    if (params.frequency !== undefined) this.frequency = params.frequency;
    if (params.amplitude !== undefined) this.amplitude = params.amplitude * (Math.PI / 180);
    if (params.springTension !== undefined) this.springTension = params.springTension;
    if (params.damping !== undefined) this.damping = params.damping;
    if (params.escapeTeeth !== undefined) {
      this.escapeTeeth = params.escapeTeeth;
      this.toothAngle = (2 * Math.PI) / this.escapeTeeth;
    }
  }
}
