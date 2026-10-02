import React, { useState, useMemo, useRef, useEffect, UIEvent } from 'react';
import {
  Plus,
  X,
  Upload,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  Type,
  Palette,
  Check,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  History,
  Layers,
  Edit2,
  Trash2,
  Minus,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { AppSettings, Batch, DrawLogEntry, Item } from '../types';
import { AVAILABLE_FONTS, CONTAINER_COLOR_PRESETS, DEFAULT_ITEMS } from '../constants/presets';
import { DataExportImport } from '../services/exportImport';

interface ItemsManagerProps {
  batches: Batch[];
  activeBatch: Batch;
  onSelectBatch: (batchId: string) => void;
  onCreateBatch: (name: string) => void;
  onRenameBatch: (batchId: string, newName: string) => void;
  onDeleteBatch: (batchId: string) => void;
  items: Item[];
  onUpdateItems: (items: Item[]) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  drawnIds: string[];
  onResetDrawn: () => void;
  onToggleDrawnItem: (id: string) => void;
  drawLogs: DrawLogEntry[];
  onClearLogs: () => void;
}

export const ItemsManager: React.FC<ItemsManagerProps> = ({
  batches,
  activeBatch,
  onSelectBatch,
  onCreateBatch,
  onRenameBatch,
  onDeleteBatch,
  items,
  onUpdateItems,
  settings,
  onUpdateSettings,
  drawnIds,
  onResetDrawn,
  onToggleDrawnItem,
  drawLogs,
  onClearLogs,
}) => {
  const currentCategory = settings.selectedCategory || 'ALL';

  // Form states
  const [inputText, setInputText] = useState('');
  const [inputCategory, setInputCategory] = useState(() =>
    currentCategory !== 'ALL' ? currentCategory : 'General'
  );
  const [inputWeight, setInputWeight] = useState('1');

  // Category combobox states
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [highlightedCatIndex, setHighlightedCatIndex] = useState(-1);
  const catComboboxRef = useRef<HTMLDivElement>(null);
  const catInputRef = useRef<HTMLInputElement>(null);

  // Bulk paste states
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkWeight, setBulkWeight] = useState('1');

  // Tab & search states
  const [activeTab, setActiveTab] = useState<'items' | 'logs' | 'styling'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportExportMenu, setShowImportExportMenu] = useState(false);

  const importExportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch inline rename state
  const [isEditingBatchName, setIsEditingBatchName] = useState(false);
  const [editBatchNameValue, setEditBatchNameValue] = useState('');

  // Virtual Windowing state
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerHeight = 320;
  const itemHeight = 48; // row height

  // Set of drawn IDs
  const drawnSet = useMemo(() => new Set(drawnIds), [drawnIds]);

  // Extract unique categories and their item counts
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const cat = (it.category || 'General').trim();
      const key = cat.length > 0 ? cat : 'General';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [items]);

  const categories = useMemo(() => categoryStats.map((c) => c.name), [categoryStats]);

  // Sync category default when active category filter changes
  useEffect(() => {
    setInputCategory(currentCategory !== 'ALL' ? currentCategory : 'General');
  }, [currentCategory]);

  // Combobox category autocomplete options
  const filteredCategoryOptions = useMemo(() => {
    const q = inputCategory.trim().toLowerCase();
    if (!q) return categoryStats;
    return categoryStats.filter((c) => c.name.toLowerCase().includes(q));
  }, [categoryStats, inputCategory]);

  const exactCategoryMatch = useMemo(() => {
    const q = inputCategory.trim().toLowerCase();
    return categoryStats.some((c) => c.name.toLowerCase() === q);
  }, [categoryStats, inputCategory]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (importExportRef.current && !importExportRef.current.contains(e.target as Node)) {
        setShowImportExportMenu(false);
      }
      if (catComboboxRef.current && !catComboboxRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
        setHighlightedCatIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered items based on Category & Search
  const filteredItems = useMemo(() => {
    let result = items;
    if (currentCategory !== 'ALL') {
      result = result.filter(
        (it) => (it.category || 'General').toLowerCase() === currentCategory.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) => it.text.toLowerCase().includes(q) || (it.category || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, currentCategory, searchQuery]);

  // Virtualized slice calculation
  const totalItemsCount = filteredItems.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
  const visibleCount = Math.ceil(scrollContainerHeight / itemHeight) + 6;
  const endIndex = Math.min(totalItemsCount, startIndex + visibleCount);
  const virtualizedItems = filteredItems.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Helper to normalize category name matching existing casing
  const normalizeCategory = (input: string): string => {
    const clean = input.trim();
    if (!clean) return 'General';
    const match = categoryStats.find((c) => c.name.toLowerCase() === clean.toLowerCase());
    return match ? match.name : clean;
  };

  // Add single item
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const assignedCategory = normalizeCategory(inputCategory);
    const parsedWeight = Math.max(1, parseInt(inputWeight) || 1);

    const newItem: Item = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      text: inputText.trim(),
      category: assignedCategory,
      weight: parsedWeight,
    };

    onUpdateItems([...items, newItem]);
    setInputText('');
    setInputWeight('1');
    setIsCatOpen(false);
    setHighlightedCatIndex(-1);
  };

  // Category combobox keyboard navigation
  const handleCatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const showCreateOption = inputCategory.trim().length > 0 && !exactCategoryMatch;
    const totalOptions = filteredCategoryOptions.length + (showCreateOption ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsCatOpen(true);
      setHighlightedCatIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsCatOpen(true);
      setHighlightedCatIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === 'Enter') {
      if (isCatOpen && highlightedCatIndex >= 0) {
        e.preventDefault();
        if (highlightedCatIndex < filteredCategoryOptions.length) {
          setInputCategory(filteredCategoryOptions[highlightedCatIndex].name);
        } else if (showCreateOption) {
          setInputCategory(normalizeCategory(inputCategory));
        }
        setIsCatOpen(false);
        setHighlightedCatIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setIsCatOpen(false);
      setHighlightedCatIndex(-1);
    }
  };

  // Increment or decrement odds/weight
  const handleAdjustWeight = (id: string, delta: number) => {
    onUpdateItems(
      items.map((it) => {
        if (it.id === id) {
          const current = Math.max(1, Number(it.weight) || 1);
          return { ...it, weight: Math.max(1, current + delta) };
        }
        return it;
      })
    );
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    onUpdateItems(items.filter((it) => it.id !== id));
  };

  // Bulk import
  const handleBulkImport = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      const assignedCategory = normalizeCategory(
        bulkCategory || (currentCategory !== 'ALL' ? currentCategory : 'General')
      );
      const parsedWeight = Math.max(1, parseInt(bulkWeight) || 1);

      const imported: Item[] = lines.map((text, idx) => ({
        id: `${Date.now()}-${idx}`,
        text,
        category: assignedCategory,
        weight: parsedWeight,
      }));

      onUpdateItems([...items, ...imported]);
      setBulkText('');
      setShowBulkInput(false);
    }
  };

  // File import (JSON/CSV)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await DataExportImport.parseImportedFile(file);
      if (imported.length > 0) {
        onUpdateItems([...items, ...imported]);
        alert(`Successfully imported ${imported.length} items from ${file.name}!`);
      } else {
        alert('No valid items found in file.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error reading file';
      alert(`Import failed: ${msg}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Format timestamp helper
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Condition to show category filter: only if there are 2 or more distinct categories
  const showCategoryFilter = categories.length >= 2;
  const isAddDisabled = !inputText.trim();

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* 1. BATCH HEADER: GROUPED PENCIL & TRASH NEXT TO DROPDOWN */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800 shrink-0">Batch:</span>

          {isEditingBatchName ? (
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                value={editBatchNameValue}
                onChange={(e) => setEditBatchNameValue(e.target.value)}
                className="h-10 px-3 text-xs border border-indigo-500 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (editBatchNameValue.trim()) {
                    onRenameBatch(activeBatch.id, editBatchNameValue.trim());
                  }
                  setIsEditingBatchName(false);
                }}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Save batch name"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBatchName(false)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <select
                value={activeBatch.id}
                onChange={(e) => onSelectBatch(e.target.value)}
                className="h-10 bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer transition"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.items.length} items)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setEditBatchNameValue(activeBatch.name);
                  setIsEditingBatchName(true);
                }}
                title="Rename this batch"
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {batches.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete batch "${activeBatch.name}"? Data in this batch will be removed.`)) {
                      onDeleteBatch(activeBatch.id);
                    }
                  }}
                  title="Delete active batch"
                  className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const name = prompt('Enter name for the new batch:', `Batch ${batches.length + 1}`);
            if (name && name.trim()) {
              onCreateBatch(name.trim());
            }
          }}
          className="h-10 flex items-center space-x-1.5 text-xs font-semibold px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Batch</span>
        </button>
      </div>

      {/* 2. TAB SWITCHER (CLEAN SEGMENTED CONTROL) */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('items')}
          className={`h-9 px-4 rounded-xl text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            activeTab === 'items'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Items Pool ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`h-9 flex items-center space-x-1.5 px-4 rounded-xl text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            activeTab === 'logs'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Draw Logs ({drawLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('styling')}
          className={`h-9 flex items-center space-x-1.5 px-4 rounded-xl text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            activeTab === 'styling'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Card & Font Settings</span>
        </button>
      </div>

      {/* 3. TAB 1: ITEMS POOL */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* SEARCH, BULK PASTE, AND IMPORT/EXPORT DROPDOWN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name or category..."
                className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition"
              />

              <button
                type="button"
                onClick={() => setShowBulkInput(!showBulkInput)}
                className={`h-10 px-3.5 rounded-xl border text-xs font-semibold transition shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  showBulkInput
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {showBulkInput ? 'Close Bulk' : 'Bulk Paste'}
              </button>

              <div className="relative shrink-0" ref={importExportRef}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setShowImportExportMenu(!showImportExportMenu)}
                  className="h-10 flex items-center space-x-1.5 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <span>Import / Export</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {showImportExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-popIn text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportExportMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Import (CSV / JSON)</span>
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowImportExportMenu(false);
                        DataExportImport.exportToCSV(items, `${activeBatch.name}.csv`);
                      }}
                      disabled={items.length === 0}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition disabled:opacity-40"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export as CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowImportExportMenu(false);
                        DataExportImport.exportToJSON(items, `${activeBatch.name}.json`);
                      }}
                      disabled={items.length === 0}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition disabled:opacity-40"
                    >
                      <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* UNIFIED SEARCH & FILTER: CATEGORY CHIPS ONLY SHOWN IF >= 2 DISTINCT CATEGORIES */}
            {showCategoryFilter && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, selectedCategory: 'ALL' })}
                  className={`h-8 px-3 rounded-full text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    currentCategory === 'ALL'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  All ({items.length})
                </button>

                {categories.map((cat) => {
                  const count = items.filter(
                    (it) => (it.category || 'General').toLowerCase() === cat.toLowerCase()
                  ).length;
                  const isSelected = currentCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, selectedCategory: cat })}
                      className={`h-8 px-3 rounded-full text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bulk Paste Box (When toggled) */}
          {showBulkInput && (
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3 animate-popIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Category for Imported Items</span>
                  <input
                    type="text"
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    placeholder={currentCategory !== 'ALL' ? currentCategory : 'General'}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Default Odds (Weight)</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={bulkWeight}
                    onChange={(e) => setBulkWeight(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <textarea
                rows={4}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste items here (one item per line)...&#10;iPhone 16 Pro&#10;PlayStation 5&#10;MacBook Air"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 font-sans"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={!bulkText.trim()}
                  className="h-10 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  Import Items
                </button>
              </div>
            </div>
          )}

          {/* 4. VISUALLY DISTINCT ADD ITEM FORM WITH EXPLICIT LABELS & COMBOBOX */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="text-xs font-bold text-slate-700">Add New Item</div>

            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Name Field */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Nama</label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. PlayStation 5"
                  className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                />
              </div>

              {/* Category Combobox Autocomplete */}
              <div className="sm:col-span-3 space-y-1 relative" ref={catComboboxRef}>
                <label className="text-[11px] font-semibold text-slate-500 block">Kategori</label>
                <div className="relative">
                  <input
                    ref={catInputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={isCatOpen}
                    aria-autocomplete="list"
                    value={inputCategory}
                    onChange={(e) => {
                      setInputCategory(e.target.value);
                      setIsCatOpen(true);
                      setHighlightedCatIndex(0);
                    }}
                    onFocus={() => setIsCatOpen(true)}
                    onKeyDown={handleCatKeyDown}
                    placeholder="Pilih / ketik kategori..."
                    className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-3 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setIsCatOpen(!isCatOpen);
                      catInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Combobox Dropdown Menu */}
                {isCatOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 z-50 animate-popIn custom-scrollbar"
                  >
                    {filteredCategoryOptions.map((cat, idx) => {
                      const isHighlighted = idx === highlightedCatIndex;
                      return (
                        <div
                          key={cat.name}
                          role="option"
                          aria-selected={inputCategory.toLowerCase() === cat.name.toLowerCase()}
                          onClick={() => {
                            setInputCategory(cat.name);
                            setIsCatOpen(false);
                            setHighlightedCatIndex(-1);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition ${
                            isHighlighted ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({cat.count})</span>
                        </div>
                      );
                    })}

                    {/* Option to create new category if not matching */}
                    {inputCategory.trim().length > 0 && !exactCategoryMatch && (
                      <div
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          setInputCategory(normalizeCategory(inputCategory));
                          setIsCatOpen(false);
                          setHighlightedCatIndex(-1);
                        }}
                        className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs cursor-pointer border-t border-slate-100 text-indigo-600 hover:bg-indigo-50 font-semibold transition ${
                          highlightedCatIndex === filteredCategoryOptions.length ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="truncate">Buat kategori "{inputCategory.trim()}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Weight / Odds Field */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block" title="Pengganda peluang (angka lebih besar = peluang lebih tinggi)">
                  Bobot
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-center font-mono font-medium transition"
                />
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isAddDisabled}
                  className={`w-full h-10 flex items-center justify-center space-x-1.5 px-4 rounded-xl font-semibold text-xs transition-all active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 ${
                    isAddDisabled
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>

          {/* 5. VIRTUALIZED ITEMS LIST WITH THIN SCROLLBAR & FADE GRADIENT */}
          <div className="relative">
            <div
              onScroll={handleScroll}
              style={{ height: scrollContainerHeight }}
              className="overflow-y-auto border border-slate-200/80 rounded-2xl p-2 relative bg-slate-50/40 custom-scrollbar"
            >
              {totalItemsCount === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No items found in this batch. Add items above or clear search query.
                </div>
              ) : (
                <div style={{ height: totalItemsCount * itemHeight, position: 'relative' }}>
                  <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', width: '100%' }}>
                    {virtualizedItems.map((item, idx) => {
                      const actualIndex = startIndex + idx;
                      const isDrawn = drawnSet.has(item.id);
                      const weightVal = Math.max(1, Number(item.weight) || 1);
                      return (
                        <div
                          key={item.id}
                          style={{ height: itemHeight }}
                          className="flex items-center justify-between px-3 text-xs group hover:bg-slate-100/70 rounded-xl transition"
                        >
                          {/* Category placed BEFORE the name */}
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0 mr-3">
                            <span className="text-slate-400 text-[10px] w-6 text-right select-none font-mono">
                              {actualIndex + 1}.
                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold select-none shrink-0 shadow-xs">
                              {item.category || 'General'}
                            </span>

                            <span
                              className={`truncate font-medium ${
                                isDrawn ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {item.text}
                            </span>
                          </div>

                          {/* Controls: Stepper (~88px fixed width) + Drawn toggle + Hover-only delete */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {/* Fixed width ~88px Stepper with centered number */}
                            <div
                              className="flex items-center justify-between bg-white border border-slate-200 rounded-lg overflow-hidden text-[11px] w-[88px] h-7 shadow-xs"
                              title="Odds Multiplier (Increase or Decrease chance)"
                            >
                              <button
                                type="button"
                                onClick={() => handleAdjustWeight(item.id, -1)}
                                disabled={weightVal <= 1}
                                title="Decrease odds"
                                className="w-6 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className="flex-1 font-bold font-mono text-slate-700 text-center select-none">
                                {weightVal}x
                              </span>

                              <button
                                type="button"
                                onClick={() => handleAdjustWeight(item.id, 1)}
                                title="Increase odds"
                                className="w-6 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Toggle Drawn status with clear tooltips */}
                            <button
                              type="button"
                              onClick={() => onToggleDrawnItem(item.id)}
                              title={isDrawn ? 'Batalkan terundi' : 'Tandai terundi'}
                              className={`p-1.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                                isDrawn
                                  ? 'text-amber-600 hover:text-emerald-600 bg-amber-50/50'
                                  : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                              }`}
                              aria-label={isDrawn ? 'Batalkan terundi' : 'Tandai terundi'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete item button (visible on hover, always visible on touch) */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              title="Delete item"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              aria-label="Hapus item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Subtle bottom fade gradient hinting scrollable overflow */}
            {totalItemsCount > 6 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none rounded-b-2xl" />
            )}
          </div>

          {/* 6. FOOTER: RESET & LOAD DEFAULTS ON LEFT, DANGER CLEAR ON RIGHT (MIN 16PX GAP) */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
            {/* Left side actions */}
            <div className="flex items-center space-x-3">
              {drawnIds.length > 0 && (
                <button
                  type="button"
                  onClick={onResetDrawn}
                  className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Drawn in Batch ({drawnIds.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onUpdateItems(DEFAULT_ITEMS)}
                className="text-slate-500 hover:text-slate-800 font-medium transition"
              >
                Load Defaults
              </button>
            </div>

            {/* Right side danger action */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus semua item dalam batch ini? Tindakan ini tidak dapat dibatalkan.')) {
                    onUpdateItems([]);
                  }
                }}
                className="text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                Clear Batch Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: DRAW HISTORY & LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4 text-xs text-slate-700 animate-popIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800">Draw Timestamp Logs</span>
              <span className="text-slate-400">({drawLogs.length} total recorded)</span>
            </div>

            {drawLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all draw history logs?')) {
                    onClearLogs();
                  }
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition"
              >
                Clear All Logs
              </button>
            )}
          </div>

          {drawLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No items have been drawn yet. Start shuffling to see logs with timestamps!
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {drawLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                    <span className="font-mono text-slate-400 text-[11px] w-6 text-right">
                      #{drawLogs.length - index}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold shrink-0">
                      {log.category || 'General'}
                    </span>

                    <span className="font-bold text-slate-900 truncate">
                      {log.itemText}
                    </span>

                    {log.batchName && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-medium shrink-0 hidden sm:inline">
                        {log.batchName}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 shrink-0">
                    {formatTime(log.drawnAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: STYLING & BEHAVIOR SETTINGS */}
      {activeTab === 'styling' && (
        <div className="space-y-6 text-xs text-slate-700 animate-popIn">
          {/* Container Colors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Palette className="w-4 h-4 text-slate-600" />
                <span>Shuffle Container Colors</span>
              </span>
              <span className="text-[11px] text-slate-400">Card background and text</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CONTAINER_COLOR_PRESETS.map((p) => {
                const isSelected =
                  settings.containerBgColor.toLowerCase() === p.bg.toLowerCase();
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        containerBgColor: p.bg,
                        containerTextColor: p.text,
                      })
                    }
                    className={`h-10 px-3 rounded-xl border text-left transition flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      isSelected
                        ? 'border-slate-900 ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: p.bg, color: p.text }}
                  >
                    <span className="font-bold text-xs">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-600">Card Background</span>
                <input
                  type="color"
                  value={settings.containerBgColor}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, containerBgColor: e.target.value })
                  }
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-600">Card Text Color</span>
                <input
                  type="color"
                  value={settings.containerTextColor}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, containerTextColor: e.target.value })
                  }
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Type className="w-4 h-4 text-slate-600" />
                <span>Shuffle Text Font</span>
              </span>
              <span className="text-[11px] text-slate-400">Choose primary font</span>
            </div>

            <select
              value={settings.fontFamily}
              onChange={(e) => onUpdateSettings({ ...settings, fontFamily: e.target.value })}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-slate-900"
            >
              {AVAILABLE_FONTS.map((font) => (
                <option key={font.id} value={font.fontFamily}>
                  {font.label}
                </option>
              ))}
            </select>

            {/* Dynamic Font Randomizer per word toggle */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80">
              <label className="flex items-start justify-between cursor-pointer space-x-3">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Randomize Font During Shuffle (Word by Word)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    When active, fonts dynamically switch across every word and flicker during the shuffle animation for a kinetic typography effect.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.randomizeFontOnShuffle}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      randomizeFontOnShuffle: e.target.checked,
                    })
                  }
                  className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Repeat Winners, Confetti, & Duration */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="flex items-start justify-between cursor-pointer space-x-3">
              <div>
                <span className="font-bold text-slate-900 block">
                  Allow Repeat Winners
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  If disabled (recommended), an item can only be picked once until you click "Reset Drawn" or re-enable it.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowRepeatWinners}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    allowRepeatWinners: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-0.5 rounded text-slate-900 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-start justify-between cursor-pointer space-x-3">
              <div>
                <span className="font-bold text-slate-900 block flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Celebration Confetti on Winner Reveal</span>
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Fires colorful celebratory confetti particles when the winning item is stopped.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.confettiEnabled}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    confettiEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-0.5 rounded text-slate-900 focus:ring-0 cursor-pointer"
              />
            </label>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Shuffle Duration</span>
                <span className="font-mono text-slate-900">{settings.duration}s</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={settings.duration}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, duration: parseFloat(e.target.value) })
                }
                className="w-full accent-slate-900 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
