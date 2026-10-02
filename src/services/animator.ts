export interface AnimationFrameState {
  progress: number; // 0 to 1
  virtualStep: number;
  currentStepIndex: number;
  isCompleted: boolean;
  justTicked: boolean;
}

export class AnimatorService {
  static easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
  }

  static getFrameState(
    elapsedMs: number,
    durationMs: number,
    totalSteps: number,
    prevStepIndex = -1
  ): AnimationFrameState {
    const rawProgress = Math.min(1, Math.max(0, elapsedMs / durationMs));
    const easedProgress = this.easeOutQuart(rawProgress);

    const virtualStep = easedProgress * totalSteps;
    const currentStepIndex = Math.min(totalSteps, Math.floor(virtualStep));
    const isCompleted = elapsedMs >= durationMs;
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
