export interface AnimationFrameState {
  progress: number; // 0 to 1
  virtualStep: number;
  currentStepIndex: number;
  isCompleted: boolean;
  justTicked: boolean;
}

export class AnimatorService {
  /**
   * Smooth roulette deceleration:
   * Starts at a brisk, fluid pace and decelerates naturally without
   * hitting an unnatural flat freeze/lag at the end.
   * f'(0) = 1.65 (fast initial shuffle)
   * f'(1) = 0.35 (controlled, suspenseful final step duration)
   */
  static easeDecelerate(t: number): number {
    const clamped = Math.min(1, Math.max(0, t));
    return 1.65 * clamped - 0.65 * clamped * clamped;
  }

  static getFrameState(
    elapsedMs: number,
    durationMs: number,
    totalSteps: number,
    prevStepIndex = -1
  ): AnimationFrameState {
    const rawProgress = Math.min(1, Math.max(0, elapsedMs / durationMs));
    const isCompleted = elapsedMs >= durationMs;

    let currentStepIndex: number;
    let virtualStep: number;

    if (isCompleted) {
      virtualStep = totalSteps;
      currentStepIndex = totalSteps;
    } else {
      const easedProgress = this.easeDecelerate(rawProgress);
      virtualStep = easedProgress * totalSteps;
      // While running, cycle through intermediate items [0, totalSteps - 1]
      currentStepIndex = Math.min(totalSteps - 1, Math.floor(virtualStep));
    }

    const justTicked = currentStepIndex !== prevStepIndex && !isCompleted;

    return {
      progress: rawProgress,
      virtualStep,
      currentStepIndex,
      isCompleted,
      justTicked,
    };
  }
}
