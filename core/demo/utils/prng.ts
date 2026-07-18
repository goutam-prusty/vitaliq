/**
 * A seeded random number generator (Mulberry32).
 * Given the same seed, it will always produce the exact same sequence of numbers.
 */
export class PRNG {
  private state: number;

  constructor(seedStr: string) {
    this.state = this.cyrb128(seedStr);
  }

  // Hash string into a 32-bit integer seed
  private cyrb128(str: string): number {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
  }

  /**
   * Returns a random float between 0 (inclusive) and 1 (exclusive).
   */
  public next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Returns a random float between min and max.
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Returns a random integer between min and max (inclusive).
   */
  public intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Returns a random boolean with the given probability (0.0 to 1.0).
   */
  public chance(probability: number): boolean {
    return this.next() < probability;
  }
}
