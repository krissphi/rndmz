import { useState, useCallback, useMemo } from 'react';
import { Batch, Item } from '../types';
import { StorageService } from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { useDialog } from '../context/DialogContext';

export function useBatchManager(onBatchSwitched?: () => void) {
  const { t } = useTranslation();
  const { toast } = useDialog();

  const [batches, setBatches] = useState<Batch[]>(() => StorageService.loadBatches());
  const [activeBatchId, setActiveBatchId] = useState<string>(() => StorageService.loadActiveBatchId());

  const activeBatch = useMemo(() => {
    return batches.find((b) => b.id === activeBatchId) || batches[0] || {
      id: 'default-batch',
      name: 'Main Batch',
      items: [],
      drawnIds: [],
      createdAt: Date.now(),
    };
  }, [batches, activeBatchId]);

  const updateBatchesList = useCallback((updatedBatches: Batch[]) => {
    setBatches(updatedBatches);
    StorageService.saveBatches(updatedBatches);
  }, []);

  const handleSelectBatch = useCallback((batchId: string) => {
    setActiveBatchId(batchId);
    StorageService.saveActiveBatchId(batchId);
    if (onBatchSwitched) onBatchSwitched();
  }, [onBatchSwitched]);

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

  const handleUpdateItems = useCallback(
    (newItems: Item[]) => {
      const updated = batches.map((b) =>
        b.id === activeBatch.id ? { ...b, items: newItems } : b
      );
      updateBatchesList(updated);
    },
    [batches, activeBatch.id, updateBatchesList]
  );

  const handleUpdateDrawnIds = useCallback(
    (newDrawnIds: string[]) => {
      const updated = batches.map((b) =>
        b.id === activeBatch.id ? { ...b, drawnIds: newDrawnIds } : b
      );
      updateBatchesList(updated);
    },
    [batches, activeBatch.id, updateBatchesList]
  );

  const handleResetDrawn = useCallback(() => {
    handleUpdateDrawnIds([]);
  }, [handleUpdateDrawnIds]);

  const handleToggleDrawnItem = useCallback(
    (id: string) => {
      if (activeBatch.drawnIds.includes(id)) {
        handleUpdateDrawnIds(activeBatch.drawnIds.filter((item) => item !== id));
      } else {
        handleUpdateDrawnIds([...activeBatch.drawnIds, id]);
      }
    },
    [activeBatch.drawnIds, handleUpdateDrawnIds]
  );

  const handleRestoreBatches = useCallback((restoredBatches: Batch[]) => {
    if (restoredBatches && restoredBatches.length > 0) {
      setBatches(restoredBatches);
      StorageService.saveBatches(restoredBatches);
      setActiveBatchId(restoredBatches[0].id);
      StorageService.saveActiveBatchId(restoredBatches[0].id);
    }
  }, []);

  return {
    batches,
    activeBatchId,
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
  };
}
