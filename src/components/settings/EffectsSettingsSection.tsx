import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { AppSettings } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface EffectsSettingsSectionProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const EffectsSettingsSection: React.FC<EffectsSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { t } = useTranslation();

  return (
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
  );
};
