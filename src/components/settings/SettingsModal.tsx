import React, { useEffect } from 'react';
import { X, Palette, Type, Sliders, Volume2, Sparkles, Check } from 'lucide-react';
import { AppSettings } from '../../types';
import { AVAILABLE_FONTS, CONTAINER_COLOR_PRESETS } from '../../constants/presets';
import { useTranslation } from '../../i18n/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = React.memo(({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-popIn"
        role="dialog"
        aria-modal="true"
        aria-label={t('settingsTitle')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {t('settingsTitle')}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('settingsSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* SECTION 1: VISUAL APPEARANCE */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('appearance')}</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    className={`h-9 px-3 rounded-xl border text-left transition flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 ${
                      isSelected
                        ? 'border-slate-900 dark:border-indigo-500 ring-2 ring-slate-900/10 dark:ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                    style={{ backgroundColor: p.bg, color: p.text }}
                  >
                    <span className="font-bold text-[11px] truncate">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="font-medium text-slate-600 dark:text-slate-300 text-[11px]">
                  {t('cardBackground')}
                </span>
                <input
                  type="color"
                  value={settings.containerBgColor}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, containerBgColor: e.target.value })
                  }
                  className="w-6 h-6 rounded-md border-none cursor-pointer bg-transparent"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <span className="font-medium text-slate-600 dark:text-slate-300 text-[11px]">
                  {t('cardTextColor')}
                </span>
                <input
                  type="color"
                  value={settings.containerTextColor}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, containerTextColor: e.target.value })
                  }
                  className="w-6 h-6 rounded-md border-none cursor-pointer bg-transparent"
                />
              </label>
            </div>

            {/* Typography Font */}
            <div className="space-y-1.5 pt-1">
              <label className="font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('shuffleFont')}</span>
                </span>
                <span className="text-slate-400 dark:text-slate-500">{t('chooseFontDesc')}</span>
              </label>

              <select
                value={settings.fontFamily}
                onChange={(e) => onUpdateSettings({ ...settings, fontFamily: e.target.value })}
                className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.fontFamily} className="dark:bg-slate-800">
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kinetic Typography Toggle */}
            <label className="flex items-start justify-between p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/50 cursor-pointer space-x-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                  {t('kineticFontRandomizer')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                  {t('kineticFontDesc')}
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

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* SECTION 2: SHUFFLE RULES */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('shuffleRules')}</span>
            </div>

            {/* Duration Slider */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('shuffleDuration')}
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                  {t('durationSeconds', { seconds: settings.duration })}
                </span>
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
                className="w-full accent-slate-900 dark:accent-indigo-500 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                {t('durationDesc')}
              </span>
            </div>

            {/* Repeat Winners */}
            <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 cursor-pointer space-x-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                  {t('allowRepeatWinners')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                  {t('allowRepeatWinnersDesc')}
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
                className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* SECTION 3: AUDIO & CELEBRATIONS */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('audioAndEffects')}</span>
            </div>

            {/* Sound Toggle */}
            <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 cursor-pointer space-x-3">
              <div className="flex items-start space-x-2.5">
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                    {t('soundEffects')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                    {t('soundEffectsDesc')}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    soundEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
            </label>

            {/* Confetti Toggle */}
            <label className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 cursor-pointer space-x-3">
              <div className="flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                    {t('confettiCelebration')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                    {t('confettiCelebrationDesc')}
                  </span>
                </div>
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
                className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
});

SettingsModal.displayName = 'SettingsModal';
