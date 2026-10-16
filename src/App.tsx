import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppSettings, Batch, DrawLogEntry, Item, RandomizerState, ShuffleRunData, WorkspaceBackup } from './types';
import { StorageService } from './services/storage';
import { RandomizerService } from './services/randomizer';
import { AnimatorService } from './services/animator';
import { SoundEffects } from './services/audio';
import { ConfettiEffect } from './services/confetti';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { DialogProvider, useDialog } from './context/DialogContext';

import { Header } from './components/Header';
import { ShuffleCard } from './components/ShuffleCard';
import { ItemsManager } from './components/ItemsManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { HistoryModal } from './components/history/HistoryModal';

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useDialog();

  // Batch Persistence
  const [batches, setBatches] = useState<Batch[]>(() => StorageService.loadBatches());
  const [activeBatchId, setActiveBatchId] = useState<string>(() => StorageService.loadActiveBatchId());

  // Settings & Draw Logs Persistence
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.loadSettings());
  const [drawLogs, setDrawLogs] = useState<DrawLogEntry[]>(() => StorageService.loadDrawLogs());

  // Modal Dialog states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active Batch resolution
  const activeBatch = useMemo(() => {
    return batches.find((b) => b.id === activeBatchId) || batches[0] || {
      id: 'default-batch',
      name: 'Main Batch',
      items: [],
      drawnIds: [],
      createdAt: Date.now(),
    };
  }, [batches, activeBatchId]);

  const items = activeBatch.items;
  const drawnIds = activeBatch.drawnIds;

  // Workflow state
  const [state, setState] = useState<RandomizerState>('idle');
  const [displayItem, setDisplayItem] = useState<Item | null>(() => items[0] || null);
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Animation frame reference
  const animationFrameIdRef = useRef<number | null>(null);
  const runDataRef = useRef<ShuffleRunData | null>(null);
  const prevStepRef = useRef<number>(-1);
  const fanfarePlayedRef = useRef<boolean>(false);

  // Sync sound settings
  useEffect(() => {
    SoundEffects.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save Settings helper
  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  }, []);

  // Save Batches helper
  const updateBatchesList = useCallback((updatedBatches: Batch[]) => {
    setBatches(updatedBatches);
    StorageService.saveBatches(updatedBatches);
  }, []);

  // Batch Operations
  const handleSelectBatch = useCallback((batchId: string) => {
    setActiveBatchId(batchId);
    StorageService.saveActiveBatchId(batchId);
    setState('idle');
  }, []);

  const handleCreateBatch = useCallback(
    (name: string) => {
      const newBatch: Batch = {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        items: [],
        drawnIds: [],
        createdAt: Date.now(),
      };
      const updated = [...batches, newBatch];
      updateBatchesList(updated);
      handleSelectBatch(newBatch.id);
    },
    [batches, updateBatchesList, handleSelectBatch]
  );

  const handleRenameBatch = useCallback(
    (batchId: string, newName: string) => {
      const updated = batches.map((b) => (b.id === batchId ? { ...b, name: newName } : b));
      updateBatchesList(updated);
    },
    [batches, updateBatchesList]
  );

  const handleDuplicateBatch = useCallback(
    (batchId: string) => {
      const source = batches.find((b) => b.id === batchId);
      if (!source) return;

      const duplicatedItems: Item[] = source.items.map((it, idx) => ({
        ...it,
        id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      }));

      const newBatch: Batch = {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `${source.name} (${t('copySuffix')})`,
        items: duplicatedItems,
        drawnIds: [],
        createdAt: Date.now(),
      };

      const updated = [...batches, newBatch];
      updateBatchesList(updated);
      handleSelectBatch(newBatch.id);
      toast(t('batchDuplicatedMsg', { name: newBatch.name }), 'success');
    },
    [batches, updateBatchesList, handleSelectBatch, t, toast]
  );

  const handleDeleteBatch = useCallback(
    (batchId: string) => {
      if (batches.length <= 1) return;
      const updated = batches.filter((b) => b.id !== batchId);
      updateBatchesList(updated);
      if (activeBatchId === batchId) {
        handleSelectBatch(updated[0].id);
      }
    },
    [batches, activeBatchId, updateBatchesList, handleSelectBatch]
  );

  const handleRestoreWorkspace = useCallback(
    (backup: WorkspaceBackup) => {
      if (backup.batches && backup.batches.length > 0) {
        setBatches(backup.batches);
        StorageService.saveBatches(backup.batches);
        setActiveBatchId(backup.batches[0].id);
        StorageService.saveActiveBatchId(backup.batches[0].id);
      }
      if (backup.settings) {
        setSettings(backup.settings);
        StorageService.saveSettings(backup.settings);
      }
      if (backup.drawLogs) {
        setDrawLogs(backup.drawLogs);
        StorageService.saveDrawLogs(backup.drawLogs);
      }
      toast(t('workspaceRestoredSuccess', { count: backup.batches.length }), 'success');
    },
    [t, toast]
  );

  // Update items for active batch
  const handleUpdateItems = useCallback(
    (newItems: Item[]) => {
      const updated = batches.map((b) =>
        b.id === activeBatch.id ? { ...b, items: newItems } : b
      );
      updateBatchesList(updated);
    },
    [batches, activeBatch.id, updateBatchesList]
  );

  // Update drawn items for active batch
  const handleUpdateDrawnIds = useCallback(
    (newDrawnIds: string[]) => {
      const updated = batches.map((b) =>
        b.id === activeBatch.id ? { ...b, drawnIds: newDrawnIds } : b
      );
      updateBatchesList(updated);
    },
    [batches, activeBatch.id, updateBatchesList]
  );

  // Reset drawn items for active batch
  const handleResetDrawn = useCallback(() => {
    handleUpdateDrawnIds([]);
  }, [handleUpdateDrawnIds]);

  // Toggle single item drawn status
  const handleToggleDrawnItem = useCallback(
    (id: string) => {
      if (drawnIds.includes(id)) {
        handleUpdateDrawnIds(drawnIds.filter((item) => item !== id));
      } else {
        handleUpdateDrawnIds([...drawnIds, id]);
      }
    },
    [drawnIds, handleUpdateDrawnIds]
  );

  // Clear draw history logs
  const handleClearLogs = useCallback(() => {
    StorageService.clearDrawLogs();
    setDrawLogs([]);
  }, []);

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

    // Validate and prepare sequence using Web Crypto API and weights
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

      // On step tick: switch candidate item & play sound
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

      // On animation completion: reveal winner, play sound & log entry
      if (animState.isCompleted) {
        setDisplayItem(runData.winner);
        setState('revealed');

        if (!fanfarePlayedRef.current) {
          fanfarePlayedRef.current = true;

          // Sound fanfare
          if (settings.soundEnabled) {
            SoundEffects.playWinnerFanfare();
          }

          // Confetti celebration
          if (settings.confettiEnabled) {
            ConfettiEffect.triggerCelebration();
          }

          // Record Draw Log with exact Timestamp and active batch
          const logEntry: DrawLogEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            itemId: runData.winner.id,
            itemText: runData.winner.text,
            category: runData.winner.category || 'General',
            batchId: activeBatch.id,
            batchName: activeBatch.name,
            drawnAt: Date.now(),
          };
          const updatedLogs = StorageService.addDrawLog(logEntry);
          setDrawLogs(updatedLogs);
        }

        // Mark as drawn if repeat winners are disabled
        if (!settings.allowRepeatWinners) {
          const nextDrawn = Array.from(new Set([...drawnIds, runData.winner.id]));
          handleUpdateDrawnIds(nextDrawn);
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
    handleUpdateDrawnIds,
    t,
    toast,
  ]);

  // Global Keyboard Shortcuts (Space / Enter to shuffle, Esc to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' || (e.code === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        if (state !== 'shuffling') {
          handleStartShuffle();
        }
      } else if (e.code === 'Escape') {
        if (state === 'revealed') {
          handleReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleStartShuffle, handleReset]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-slate-900 dark:selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Navbar: Clean branding, language, theme, history & settings triggers */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        drawLogsCount={drawLogs.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 max-w-4xl mx-auto w-full">
        {/* Shuffle Card with Centered Text */}
        <ShuffleCard
          currentItem={displayItem}
          state={state}
          onStartShuffle={handleStartShuffle}
          onReset={handleReset}
          containerBgColor={settings.containerBgColor}
          containerTextColor={settings.containerTextColor}
          fontFamily={settings.fontFamily}
          randomizeFontOnShuffle={settings.randomizeFontOnShuffle}
          stepIndex={stepIndex}
          eligibleCount={poolStats.eligible.length}
          totalCategoryCount={poolStats.totalInCategory}
          allowRepeatWinners={settings.allowRepeatWinners}
        />

        {/* Lightweight, spacious Items Manager (100% focused on batch & item list) */}
        <ItemsManager
          batches={batches}
          activeBatch={activeBatch}
          onSelectBatch={handleSelectBatch}
          onCreateBatch={handleCreateBatch}
          onRenameBatch={handleRenameBatch}
          onDuplicateBatch={handleDuplicateBatch}
          onDeleteBatch={handleDeleteBatch}
          items={items}
          onUpdateItems={handleUpdateItems}
          settings={settings}
          drawLogs={drawLogs}
          selectedCategory={settings.selectedCategory}
          onSelectCategory={(cat) => handleUpdateSettings({ ...settings, selectedCategory: cat })}
          drawnIds={drawnIds}
          onResetDrawn={handleResetDrawn}
          onToggleDrawnItem={handleToggleDrawnItem}
          onRestoreWorkspace={handleRestoreWorkspace}
        />
      </main>

      {/* Settings Modal (Dedicated, spacious dialog for appearance, rules, and sound) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* History Modal (Dedicated dialog for draw timestamps & logs) */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        drawLogs={drawLogs}
        onClearLogs={handleClearLogs}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DialogProvider>
          <AppContent />
        </DialogProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
