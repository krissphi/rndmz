import React from 'react';
import { Settings, PanelRightClose, X } from 'lucide-react';
import { AppSettings } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { AppearanceSettingsSection } from './AppearanceSettingsSection';
import { RulesSettingsSection } from './RulesSettingsSection';
import { EffectsSettingsSection } from './EffectsSettingsSection';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = React.memo(({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Panel Header */}
      <div className="h-14 px-4 sm:px-5 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-20">
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              {t('settings')}
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
              {t('settingsSubtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Close sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close sidebar"
        >
          <PanelRightClose className="w-4 h-4 hidden lg:block" />
          <X className="w-4 h-4 lg:hidden" />
        </button>
      </div>

      {/* Settings Scrollable Content */}
      <div className="p-4 sm:p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
        <AppearanceSettingsSection
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <RulesSettingsSection
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <EffectsSettingsSection
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';
