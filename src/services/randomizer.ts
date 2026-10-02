import { Item, ShuffleRunData } from '../types';

export class RandomizerService {
  /**
   * Cryptographically secure pseudo-random number generator in [0, 1)
   * Uses Web Crypto API (window.crypto.getRandomValues)
   */
  static getSecureRandom(): number {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return buffer[0] / (0xffffffff + 1);
    }
    return Math.random();
  }

  /**
   * Filter candidates based on category and exclusion of already drawn items
   */
  static getEligibleItems(
    items: Item[],
    selectedCategory: string,
    drawnIds: string[],
    allowRepeat: boolean
  ): { eligible: Item[]; totalInCategory: number; drawnCount: number } {
    const cleanItems = items.filter((it) => it.text.trim().length > 0);
    const categoryItems =
      selectedCategory === 'ALL'
        ? cleanItems
        : cleanItems.filter((it) => (it.category || 'General').toLowerCase() === selectedCategory.toLowerCase());

    const drawnSet = new Set(drawnIds);
    const drawnInCategory = categoryItems.filter((it) => drawnSet.has(it.id));

    if (allowRepeat) {
      return {
        eligible: categoryItems,
        totalInCategory: categoryItems.length,
        drawnCount: drawnInCategory.length,
      };
    }

    const available = categoryItems.filter((it) => !drawnSet.has(it.id));
    return {
      eligible: available,
      totalInCategory: categoryItems.length,
      drawnCount: drawnInCategory.length,
    };
  }

  /**
   * Pick random winner using Web Crypto API and weights
   */
  static pickWinner(candidates: Item[]): Item | null {
    if (candidates.length === 0) return null;

    // Calculate total weights (default to 1 if not specified or <= 0)
    const totalWeight = candidates.reduce((sum, it) => sum + Math.max(1, Number(it.weight) || 1), 0);
    let rand = this.getSecureRandom() * totalWeight;

    for (const item of candidates) {
      const weight = Math.max(1, Number(item.weight) || 1);
      if (rand < weight) {
        return item;
      }
      rand -= weight;
    }

    return candidates[candidates.length - 1];
  }

  /**
   * Build deterministic shuffle sequence ending with the winner
   */
  static generateShuffleSequence(
    pool: Item[],
    winner: Item,
    totalSteps: number,
    startItem?: Item
  ): Item[] {
    if (pool.length <= 1) {
      return Array(totalSteps + 1).fill(winner);
    }

    const sequence: Item[] = [];
    const firstRand = Math.floor(this.getSecureRandom() * pool.length);
    let previousItem = startItem || pool[firstRand];
    sequence.push(previousItem);

    for (let i = 1; i < totalSteps; i++) {
      let candidates = pool.filter((it) => it.id !== previousItem.id);
      if (candidates.length === 0) candidates = pool;
      const nextIndex = Math.floor(this.getSecureRandom() * candidates.length);
      const nextItem = candidates[nextIndex];
      sequence.push(nextItem);
      previousItem = nextItem;
    }

    // Final item is guaranteed to be the winner
    sequence.push(winner);
    return sequence;
  }

  /**
   * Prepare complete shuffle run data
   */
  static prepareRun(
    items: Item[],
    selectedCategory: string,
    drawnIds: string[],
    allowRepeat: boolean,
    durationSeconds: number,
    startItem?: Item
  ): { runData: ShuffleRunData | null; error?: string } {
    if (!items || items.length === 0) {
      return { runData: null, error: 'Please add at least one item before shuffling.' };
    }

    const { eligible, totalInCategory, drawnCount } = this.getEligibleItems(
      items,
      selectedCategory,
      drawnIds,
      allowRepeat
    );

    if (totalInCategory === 0) {
      return {
        runData: null,
        error: `No items found in category "${selectedCategory}". Please select another category.`,
      };
    }

    if (eligible.length === 0) {
      return {
        runData: null,
        error: `All ${drawnCount} item(s) in "${selectedCategory}" have already been drawn! You can enable "Allow Repeat Winners" or reset drawn items.`,
      };
    }

    const winner = this.pickWinner(eligible);
    if (!winner) {
      return { runData: null, error: 'Could not select a winner.' };
    }

    // Sequence steps based on duration
    const totalSteps = Math.max(25, Math.round(durationSeconds * 8));
    const fullCategoryPool = items.filter((it) => it.text.trim().length > 0);
    const sequence = this.generateShuffleSequence(
      eligible.length > 1 ? eligible : fullCategoryPool,
      winner,
      totalSteps,
      startItem
    );

    return {
      runData: {
        winner,
        sequence,
        totalSteps,
        duration: durationSeconds * 1000,
      },
    };
  }
}
