import React from 'react';
import { Sliders } from 'lucide-react';
import { AppSettings } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface RulesSettingsSectionProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const RulesSettingsSection: React.FC<RulesSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { t } = useTranslation();

  return (
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
  );
};
