import confetti from 'canvas-confetti';

export const ConfettiEffect = {
  triggerCelebration() {
    if (typeof window === 'undefined') return;

    // Center burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
      disableForReducedMotion: true,
    });

    // Side cannons after slight delay
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#f59e0b', '#10b981'],
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ec4899', '#3b82f6', '#8b5cf6'],
      });
    }, 200);
  },
};
