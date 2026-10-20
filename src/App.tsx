import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSettings, DrawLogEntry, WorkspaceBackup } from './types';
import { StorageService } from './services/storage';
import { SoundEffects } from './services/audio';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { DialogProvider, useDialog } from './context/DialogContext';

import { Header, SidebarTab } from './components/Header';
import { ShuffleCard } from './components/ShuffleCard';
import { ItemsManager } from './components/ItemsManager';
import { HistoryPanel } from './components/history/HistoryPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';

import { useBatchManager } from './hooks/useBatchManager';
import { useShuffleRunner } from './hooks/useShuffleRunner';

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useDialog();

  // Settings & Draw Logs Persistence
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.loadSettings());
  const [drawLogs, setDrawLogs] = useState<DrawLogEntry[]>(() => StorageService.loadDrawLogs());

  // Active Unified Sidebar: 'items' | 'logs' | 'settings' | null
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>(() => {
    return StorageService.loadSidebarOpen() ? 'items' : null;
  });

  // Sync sound settings
  useEffect(() => {
    SoundEffects.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Batch Manager Hook
  const {
    batches,
    activeBatch,
    handleSelectBatch,
    handleCreateBatch,
    handleRenameBatch,
    handleDuplicateBatch,
    handleDeleteBatch,
    handleUpdateItems,
    handleUpdateDrawnIds,
    handleResetDrawn,
    handleToggleDrawnItem,
    handleRestoreBatches,
  } = useBatchManager();

  // Callback to append draw log
  const handleAddDrawLog = useCallback((logEntry: DrawLogEntry) => {
    const updated = StorageService.addDrawLog(logEntry);
    setDrawLogs(updated);
  }, []);

  // Shuffle Runner Hook
  const {
    state,
    displayItem,
    stepIndex,
    poolStats,
    handleStartShuffle,
    handleReset,
  } = useShuffleRunner({
    items: activeBatch.items,
    drawnIds: activeBatch.drawnIds,
    settings,
    activeBatch,
    onUpdateDrawnIds: handleUpdateDrawnIds,
    onAddDrawLog: handleAddDrawLog,
  });

  // Save Settings helper
  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  }, []);

  // Restore Workspace
  const handleRestoreWorkspace = useCallback(
    (backup: WorkspaceBackup) => {
      if (backup.batches && backup.batches.length > 0) {
        handleRestoreBatches(backup.batches);
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
    [handleRestoreBatches, t, toast]
  );

  // Active batch draw logs (per-batch history)
  const activeBatchLogs = useMemo(() => {
    return drawLogs.filter((l) => l.batchId === activeBatch.id);
  }, [drawLogs, activeBatch.id]);

  // Clear draw history logs for active batch
  const handleClearLogs = useCallback(() => {
    const updated = StorageService.clearBatchDrawLogs(activeBatch.id);
    setDrawLogs(updated);
  }, [activeBatch.id]);

  // Sidebar tab selection (auto closes existing or switches seamlessly)
  const handleSelectSidebarTab = useCallback((tab: 'items' | 'logs' | 'settings') => {
    setActiveSidebarTab((prev) => {
      const next = prev === tab ? null : tab;
      StorageService.saveSidebarOpen(next !== null);
      return next;
    });
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setActiveSidebarTab(null);
    StorageService.saveSidebarOpen(false);
  }, []);

  // Global Keyboard Shortcuts (Space / Enter to shuffle, Esc to reset/close)
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
        if (activeSidebarTab !== null) {
          handleCloseSidebar();
        } else if (state === 'revealed') {
          handleReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleStartShuffle, handleReset, activeSidebarTab, handleCloseSidebar]);

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-slate-900 dark:selection:bg-indigo-600 selection:text-white transition-colors duration-200 overflow-hidden">
      {/* Top Navbar */}
      <Header
        activeSidebarTab={activeSidebarTab}
        onSelectSidebarTab={handleSelectSidebarTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Main Stage: Shuffle Card */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 w-full h-full overflow-y-auto relative">
          <div className="w-full max-w-2xl my-auto flex flex-col items-center">
            <ShuffleCard
              currentItem={displayItem}
              state={state}
              onStartShuffle={handleStartShuffle}
              containerBgColor={settings.containerBgColor}
              containerTextColor={settings.containerTextColor}
              fontFamily={settings.fontFamily}
              randomizeFontOnShuffle={settings.randomizeFontOnShuffle}
              stepIndex={stepIndex}
              eligibleCount={poolStats.eligible.length}
              totalCategoryCount={poolStats.totalInCategory}
              allowRepeatWinners={settings.allowRepeatWinners}
            />
          </div>
        </main>

        {/* Mobile Backdrop for Sidebar Drawer */}
        {activeSidebarTab !== null && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            onClick={handleCloseSidebar}
            aria-hidden="true"
          />
        )}

        {/* Unified Sidebar Panel: Persistent side-by-side on desktop, sliding drawer on mobile */}
        <aside
          className={`fixed lg:relative top-0 right-0 h-full bg-white dark:bg-slate-900 border-l border-slate-200/90 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50 lg:z-20 ${
            activeSidebarTab !== null
              ? 'w-full sm:w-[420px] lg:w-[440px] xl:w-[480px] translate-x-0 shadow-2xl lg:shadow-none'
              : 'w-full sm:w-[420px] lg:w-0 translate-x-full lg:translate-x-0 lg:overflow-hidden lg:border-l-0 lg:opacity-0 pointer-events-none'
          }`}
        >
          {activeSidebarTab === 'items' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn">
              <ItemsManager
                batches={batches}
                activeBatch={activeBatch}
                onSelectBatch={handleSelectBatch}
                onCreateBatch={handleCreateBatch}
                onRenameBatch={handleRenameBatch}
                onDuplicateBatch={handleDuplicateBatch}
                onDeleteBatch={handleDeleteBatch}
                items={activeBatch.items}
                onUpdateItems={handleUpdateItems}
                settings={settings}
                drawLogs={drawLogs}
                selectedCategory={settings.selectedCategory}
                onSelectCategory={(cat) => handleUpdateSettings({ ...settings, selectedCategory: cat })}
                drawnIds={activeBatch.drawnIds}
                onResetDrawn={handleResetDrawn}
                onToggleDrawnItem={handleToggleDrawnItem}
                onRestoreWorkspace={handleRestoreWorkspace}
                onCloseSidebar={handleCloseSidebar}
              />
            </div>
          )}

          {activeSidebarTab === 'logs' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn">
              <HistoryPanel
                drawLogs={activeBatchLogs}
                activeBatchName={activeBatch.name}
                onClearLogs={handleClearLogs}
                onClose={handleCloseSidebar}
              />
            </div>
          )}

          {activeSidebarTab === 'settings' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn">
              <SettingsPanel
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClose={handleCloseSidebar}
              />
            </div>
          )}
        </aside>
      </div>
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
