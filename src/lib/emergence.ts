/**
 * Emergence Math System
 * 
 * A mathematical framework for tracking the evolution of ideas 
 * from pure potential (0) to full presence/realization (1).
 */

export class IdeaState {
  private _value: number;

  /**
   * Initialize a new idea state.
   * @param initialValue A value between 0 (potential) and 1 (presence). Defaults to 0.
   */
  constructor(initialValue: number = 0) {
    this._value = this.clamp(initialValue);
  }

  /**
   * The current state of the idea [0, 1].
   */
  get value(): number {
    return this._value;
  }

  /**
   * Infuse (⊕)
   * Adds energy, context, or effort to an idea.
   * Uses a probabilistic sum to asymptotically approach 1 without exceeding it.
   * Formula: A ⊕ B = A + B - (A * B)
   * 
   * @param energy The amount of energy to infuse [0, 1]
   * @returns The updated IdeaState instance for chaining
   */
  infuse(energy: number): this {
    const e = this.clamp(energy);
    this._value = this._value + e - (this._value * e);
    return this;
  }

  /**
   * Collapse (⊗)
   * Solidifies an idea by applying constraints, or forces a realization.
   * If a constraint is provided, it acts as a dampener (A ⊗ B = A * B).
   * If no constraint is provided, it collapses the probability wave to exactly 0 or 1.
   * 
   * @param constraint Optional constraint factor [0, 1]
   * @returns The updated IdeaState instance for chaining
   */
  collapse(constraint?: number): this {
    if (constraint !== undefined) {
      const c = this.clamp(constraint);
      this._value = this._value * c;
    } else {
      // Quantum-like collapse based on a threshold (0.5)
      this._value = this._value >= 0.5 ? 1 : 0;
    }
    return this;
  }

  /**
   * Merge (⊛)
   * Synthesizes this idea with another idea into a unified state.
   * Uses an arithmetic mean plus a synergistic bonus.
   * 
   * @param other Another IdeaState to merge with
   * @param synergyFactor A multiplier for the synergy bonus (default: 0.1)
   * @returns The updated IdeaState instance for chaining
   */
  merge(other: IdeaState, synergyFactor: number = 0.1): this {
    const avg = (this._value + other.value) / 2;
    const synergy = (this._value * other.value) * synergyFactor;
    this._value = this.clamp(avg + synergy);
    return this;
  }

  /**
   * Helper to ensure values stay strictly between 0 and 1.
   */
  private clamp(val: number): number {
    return Math.max(0, Math.min(1, val));
  }

  // ============================================================================
  // Static Functional API
  // ============================================================================

  static infuse(a: number, b: number): number {
    const clampedA = Math.max(0, Math.min(1, a));
    const clampedB = Math.max(0, Math.min(1, b));
    return clampedA + clampedB - (clampedA * clampedB);
  }

  static collapse(a: number, b?: number): number {
    const clampedA = Math.max(0, Math.min(1, a));
    if (b !== undefined) {
      const clampedB = Math.max(0, Math.min(1, b));
      return clampedA * clampedB;
    }
    return clampedA >= 0.5 ? 1 : 0;
  }

  static merge(a: number, b: number, synergyFactor: number = 0.1): number {
    const clampedA = Math.max(0, Math.min(1, a));
    const clampedB = Math.max(0, Math.min(1, b));
    const avg = (clampedA + clampedB) / 2;
    const synergy = (clampedA * clampedB) * synergyFactor;
    return Math.max(0, Math.min(1, avg + synergy));
  }
}
