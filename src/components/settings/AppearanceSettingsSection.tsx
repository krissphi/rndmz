import React from 'react';
import { Palette, Type, Check } from 'lucide-react';
import { AppSettings } from '../../types';
import { AVAILABLE_FONTS, CONTAINER_COLOR_PRESETS } from '../../constants/presets';
import { useTranslation } from '../../i18n/LanguageContext';

interface AppearanceSettingsSectionProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const AppearanceSettingsSection: React.FC<AppearanceSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { t } = useTranslation();

  return (
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
  );
};
