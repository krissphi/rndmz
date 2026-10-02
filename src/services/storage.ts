import { AppSettings, Batch, DrawLogEntry, Item } from '../types';
import { DEFAULT_ITEMS, DEFAULT_SETTINGS } from '../constants/presets';

const STORAGE_KEYS = {
  BATCHES: 'rndmz_batches_v4',
  ACTIVE_BATCH: 'rndmz_active_batch_id_v4',
  SETTINGS: 'rndmz_settings_v4',
  DRAW_LOGS: 'rndmz_draw_logs_v4',
  OLD_ITEMS: 'rndmz_items_v3',
  OLD_DRAWN: 'rndmz_drawn_ids_v3',
};

export const StorageService = {
  loadBatches(): Batch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BATCHES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check migration from v3 items
      let initialItems: Item[] = DEFAULT_ITEMS;
      let initialDrawn: string[] = [];
      try {
        const oldData = localStorage.getItem(STORAGE_KEYS.OLD_ITEMS);
        if (oldData) {
          const parsedOld = JSON.parse(oldData);
          if (Array.isArray(parsedOld) && parsedOld.length > 0) {
            initialItems = parsedOld;
          }
        }
        const oldDrawn = localStorage.getItem(STORAGE_KEYS.OLD_DRAWN);
        if (oldDrawn) {
          initialDrawn = JSON.parse(oldDrawn);
        }
      } catch {
        // ignore
      }

      const defaultBatch: Batch = {
        id: 'default-batch',
        name: 'Main Batch',
        items: initialItems,
        drawnIds: initialDrawn,
        createdAt: Date.now(),
      };

      const batches = [defaultBatch];
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
      return batches;
    } catch {
      return [
        {
          id: 'default-batch',
          name: 'Main Batch',
          items: DEFAULT_ITEMS,
          drawnIds: [],
          createdAt: Date.now(),
        },
      ];
    }
  },

  saveBatches(batches: Batch[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    } catch (e) {
      console.warn('Failed to save batches', e);
    }
  },

  loadActiveBatchId(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_BATCH) || 'default-batch';
    } catch {
      return 'default-batch';
    }
  },

  saveActiveBatchId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BATCH, id);
    } catch (e) {
      console.warn('Failed to save active batch id', e);
    }
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  },

  loadDrawLogs(): DrawLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAW_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDrawLogs(logs: DrawLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAW_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save draw logs', e);
    }
  },

  addDrawLog(entry: DrawLogEntry): DrawLogEntry[] {
    try {
      const current = this.loadDrawLogs();
      const updated = [entry, ...current].slice(0, 1000); // keep up to 1000 logs
      this.saveDrawLogs(updated);
      return updated;
    } catch {
      return [];
    }
  },

  clearDrawLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAW_LOGS);
    } catch (e) {
      console.warn('Failed to clear draw logs', e);
    }
  },
};
