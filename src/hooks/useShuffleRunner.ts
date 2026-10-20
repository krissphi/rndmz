import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Item, Batch, AppSettings, RandomizerState, ShuffleRunData, DrawLogEntry } from '../types';
import { RandomizerService } from '../services/randomizer';
import { AnimatorService } from '../services/animator';
import { SoundEffects } from '../services/audio';
import { ConfettiEffect } from '../services/confetti';
import { useTranslation } from '../i18n/LanguageContext';
import { useDialog } from '../context/DialogContext';

interface UseShuffleRunnerProps {
  items: Item[];
  drawnIds: string[];
  settings: AppSettings;
  activeBatch: Batch;
  onUpdateDrawnIds: (drawnIds: string[]) => void;
  onAddDrawLog: (log: DrawLogEntry) => void;
}

export function useShuffleRunner({
  items,
  drawnIds,
  settings,
  activeBatch,
  onUpdateDrawnIds,
  onAddDrawLog,
}: UseShuffleRunnerProps) {
  const { t } = useTranslation();
  const { toast } = useDialog();

  const [state, setState] = useState<RandomizerState>('idle');
  const [displayItem, setDisplayItem] = useState<Item | null>(() => items[0] || null);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const animationFrameIdRef = useRef<number | null>(null);
  const runDataRef = useRef<ShuffleRunData | null>(null);
  const prevStepRef = useRef<number>(-1);
  const fanfarePlayedRef = useRef<boolean>(false);

  // Pool statistics for current category
  const poolStats = useMemo(() => {
    return RandomizerService.getEligibleItems(
      items,
      settings.selectedCategory,
      drawnIds,
      settings.allowRepeatWinners
    );
  }, [items, settings.selectedCategory, drawnIds, settings.allowRepeatWinners]);

  // Keep display item valid when pool or category changes
  useEffect(() => {
    if (state === 'idle') {
      const { eligible } = poolStats;
      if (eligible.length > 0) {
        if (!displayItem || !eligible.some((it) => it.id === displayItem.id)) {
          setDisplayItem(eligible[0]);
        }
      } else if (items.length > 0) {
        setDisplayItem(items[0]);
      } else {
        setDisplayItem(null);
      }
    }
  }, [poolStats, state, displayItem, items]);

  // Reset shuffle to ready state
  const handleReset = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    setState('idle');
    setStepIndex(0);
    prevStepRef.current = -1;
    fanfarePlayedRef.current = false;

    const { eligible } = poolStats;
    setDisplayItem(eligible[0] || items[0] || null);
  }, [poolStats, items]);

  // Start Shuffle Animation Loop
  const handleStartShuffle = useCallback(() => {
    if (state === 'shuffling') return;

    const runResult = RandomizerService.prepareRun(
      items,
      settings.selectedCategory,
      drawnIds,
      settings.allowRepeatWinners,
      settings.duration,
      displayItem || items[0]
    );

    if (runResult.error || !runResult.runData) {
      const errorMsg = runResult.errorKey
        ? t(runResult.errorKey, runResult.errorParams)
        : runResult.error || t('addAtLeastOneItem');
      toast(errorMsg, 'error');
      return;
    }

    const runData = runResult.runData;
    runDataRef.current = runData;
    prevStepRef.current = -1;
    fanfarePlayedRef.current = false;
    setState('shuffling');

    const startTime = performance.now();

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const animState = AnimatorService.getFrameState(
        elapsed,
        runData.duration,
        runData.totalSteps,
        prevStepRef.current
      );

      if (animState.currentStepIndex !== prevStepRef.current && !animState.isCompleted) {
        const nextItem = runData.sequence[animState.currentStepIndex] || runData.winner;
        setDisplayItem(nextItem);
        setStepIndex(animState.currentStepIndex);
        prevStepRef.current = animState.currentStepIndex;

        if (settings.soundEnabled) {
          const pitch = 480 + animState.progress * 220;
          SoundEffects.playTick(pitch);
        }
      }

      if (animState.isCompleted) {
        setDisplayItem(runData.winner);
        setState('revealed');

        if (!fanfarePlayedRef.current) {
          fanfarePlayedRef.current = true;

          if (settings.soundEnabled) {
            SoundEffects.playWinnerFanfare();
          }

          if (settings.confettiEnabled) {
            ConfettiEffect.triggerCelebration();
          }

          const logEntry: DrawLogEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            itemId: runData.winner.id,
            itemText: runData.winner.text,
            category: runData.winner.category || 'General',
            batchId: activeBatch.id,
            batchName: activeBatch.name,
            drawnAt: Date.now(),
          };
          onAddDrawLog(logEntry);
        }

        if (!settings.allowRepeatWinners) {
          const nextDrawn = Array.from(new Set([...drawnIds, runData.winner.id]));
          onUpdateDrawnIds(nextDrawn);
        }

        animationFrameIdRef.current = null;
        return;
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, [
    items,
    settings,
    drawnIds,
    displayItem,
    state,
    activeBatch,
    onUpdateDrawnIds,
    onAddDrawLog,
    t,
    toast,
  ]);

  return {
    state,
    setState,
    displayItem,
    stepIndex,
    poolStats,
    handleStartShuffle,
    handleReset,
  };
}
